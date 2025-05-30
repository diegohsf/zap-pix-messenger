
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Mic } from 'lucide-react';

interface VoiceModulatorProps {
  audioBlob: Blob;
  duration: number;
  onModulatedAudio: (modulatedBlob: Blob) => void;
}

export interface VoiceModulationSettings {
  pitchShift: number;
  voiceType: 'male' | 'female' | 'robotic' | 'chipmunk' | 'deep';
  addNoise: boolean;
  speedChange: number;
}

const VoiceModulator: React.FC<VoiceModulatorProps> = ({
  audioBlob,
  duration,
  onModulatedAudio,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [settings, setSettings] = useState<VoiceModulationSettings>({
    pitchShift: 0,
    voiceType: 'male',
    addNoise: false,
    speedChange: 1,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const originalBufferRef = useRef<AudioBuffer | null>(null);
  const processedBufferRef = useRef<AudioBuffer | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef<boolean>(false);
  const lastSettingsRef = useRef<string>('');

  // Carregar o áudio original apenas uma vez
  useEffect(() => {
    loadOriginalAudioBuffer();
    return () => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [audioBlob]);

  // Aplicar modulação quando as configurações mudarem
  useEffect(() => {
    const settingsKey = JSON.stringify(settings);
    
    if (originalBufferRef.current && isInitialized && !processingRef.current && settingsKey !== lastSettingsRef.current) {
      console.log('🔄 Configurações alteradas, aplicando nova modulação...');
      
      // Cancelar debounce anterior
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        applyVoiceModulation();
        lastSettingsRef.current = settingsKey;
      }, 500);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [settings, isInitialized]);

  const loadOriginalAudioBuffer = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      console.log('🎵 Carregando áudio original...');
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      originalBufferRef.current = audioBuffer;
      
      console.log('✅ Áudio original carregado:', {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels
      });
      
      // Criar URL inicial
      const initialUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(initialUrl);
      
      // Aplicar modulação inicial
      setTimeout(() => {
        setIsInitialized(true);
        const initialSettings = JSON.stringify(settings);
        lastSettingsRef.current = initialSettings;
        applyVoiceModulation();
      }, 100);
    } catch (error) {
      console.error('❌ Erro ao carregar buffer de áudio original:', error);
    }
  };

  const applyVoiceModulation = async () => {
    if (!originalBufferRef.current || !audioContextRef.current || processingRef.current) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    console.log('🔄 Aplicando modulação de voz...');

    try {
      const audioContext = audioContextRef.current;
      const originalBuffer = originalBufferRef.current;
      
      const sampleRate = originalBuffer.sampleRate;
      const numberOfChannels = originalBuffer.numberOfChannels;
      
      // Calcular nova duração baseada na velocidade
      const speedMultiplier = 1 / settings.speedChange;
      const newLength = Math.floor(originalBuffer.length * speedMultiplier);
      
      const offlineContext = new OfflineAudioContext(numberOfChannels, newLength, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = originalBuffer;
      source.playbackRate.value = settings.speedChange;

      let audioNode: AudioNode = source;

      // Aplicar efeitos baseados no tipo de voz
      if (settings.voiceType === 'robotic') {
        console.log('🤖 Aplicando efeito robótico...');
        const waveShaperNode = offlineContext.createWaveShaper();
        const curve = new Float32Array(65536);
        for (let i = 0; i < 65536; i++) {
          const x = (i - 32768) / 32768;
          curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.5) * 0.8;
        }
        waveShaperNode.curve = curve;
        waveShaperNode.oversample = '4x';
        
        audioNode.connect(waveShaperNode);
        audioNode = waveShaperNode;
      }

      // Aplicar filtro de frequência baseado no tipo de voz
      const filter = offlineContext.createBiquadFilter();
      
      switch (settings.voiceType) {
        case 'female':
          console.log('👩 Aplicando filtro feminino...');
          filter.type = 'highpass';
          filter.frequency.value = 200;
          filter.Q.value = 1;
          break;
        case 'male':
          console.log('👨 Aplicando filtro masculino...');
          filter.type = 'lowpass';
          filter.frequency.value = 3000;
          filter.Q.value = 1;
          break;
        case 'chipmunk':
          console.log('🐿️ Aplicando filtro chipmunk...');
          filter.type = 'highpass';
          filter.frequency.value = 400;
          filter.Q.value = 2;
          break;
        case 'deep':
          console.log('📢 Aplicando filtro grave...');
          filter.type = 'lowpass';
          filter.frequency.value = 1500;
          filter.Q.value = 2;
          break;
        default:
          filter.type = 'allpass';
          break;
      }

      audioNode.connect(filter);
      audioNode = filter;

      // Aplicar pitch shift se necessário
      if (settings.pitchShift !== 0) {
        console.log(`🎵 Aplicando pitch shift: ${settings.pitchShift}%`);
        const gainNode = offlineContext.createGain();
        gainNode.gain.value = 1 + (settings.pitchShift / 200);
        audioNode.connect(gainNode);
        audioNode = gainNode;
      }

      // Adicionar ruído se solicitado
      if (settings.addNoise) {
        console.log('🎧 Adicionando ruído de fundo...');
        const noiseBuffer = offlineContext.createBuffer(numberOfChannels, newLength, sampleRate);
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const channelData = noiseBuffer.getChannelData(channel);
          for (let i = 0; i < newLength; i++) {
            channelData[i] = (Math.random() - 0.5) * 0.02;
          }
        }
        
        const noiseSource = offlineContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain = offlineContext.createGain();
        noiseGain.gain.value = 0.05;
        
        noiseSource.connect(noiseGain);
        noiseGain.connect(offlineContext.destination);
        noiseSource.start(0);
      }

      // Conectar ao destino
      audioNode.connect(offlineContext.destination);
      source.start(0);

      // Renderizar áudio
      console.log('⚙️ Renderizando áudio processado...');
      const renderedBuffer = await offlineContext.startRendering();
      processedBufferRef.current = renderedBuffer;
      
      // Converter buffer para blob
      const modifiedBlob = await bufferToWavBlob(renderedBuffer);
      
      // Atualizar URL do player
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      const newUrl = URL.createObjectURL(modifiedBlob);
      setCurrentAudioUrl(newUrl);
      
      console.log('✅ Modulação aplicada com sucesso!');
      
      // Chamar callback apenas se as configurações mudaram de fato
      onModulatedAudio(modifiedBlob);

    } catch (error) {
      console.error('❌ Erro ao aplicar modulação de voz:', error);
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const bufferToWavBlob = async (buffer: AudioBuffer): Promise<Blob> => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Convert audio data
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    audio.pause();
  };

  return (
    <Card className="mt-4 border-2 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic className="h-5 w-5 text-orange-600" />
          Modulação de Voz (Opcional)
          {isProcessing && (
            <span className="text-sm text-orange-600">
              Processando...
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-orange-700">
          Modifique sua voz automaticamente para maior anonimato
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Audio Player */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
          <audio 
            ref={audioRef} 
            src={currentAudioUrl} 
            preload="metadata"
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="h-8 w-8 p-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={restart}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="flex-1 text-xs text-gray-700">
            <div className="font-mono">
              {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
              {Math.floor(currentTime % 60).toString().padStart(2, '0')} / 
              {Math.floor(duration / 60).toString().padStart(2, '0')}:
              {Math.floor(duration % 60).toString().padStart(2, '0')}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div
                className="bg-orange-600 h-1 rounded-full transition-all duration-300"
                style={{
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
                }}
              />
            </div>
          </div>
        </div>

        {/* Voice Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo de Voz</Label>
          <RadioGroup
            value={settings.voiceType}
            onValueChange={(value) => setSettings(prev => ({ ...prev, voiceType: value as any }))}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="text-sm">Masculina</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="text-sm">Feminina</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="robotic" id="robotic" />
              <Label htmlFor="robotic" className="text-sm">Robótica</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="chipmunk" id="chipmunk" />
              <Label htmlFor="chipmunk" className="text-sm">Aguda</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-2">
              <RadioGroupItem value="deep" id="deep" />
              <Label htmlFor="deep" className="text-sm">Grave Profunda</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Pitch Adjustment */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Ajuste de Tom: {settings.pitchShift > 0 ? '+' : ''}{settings.pitchShift}%
          </Label>
          <Slider
            value={[settings.pitchShift]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, pitchShift: value }))}
            min={-50}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>Mais Grave</span>
            <span>Natural</span>
            <span>Mais Agudo</span>
          </div>
        </div>

        {/* Speed Change */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Velocidade: {settings.speedChange}x
          </Label>
          <Slider
            value={[settings.speedChange]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, speedChange: value }))}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Add Noise Option */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Adicionar Ruído de Fundo</Label>
          <Switch
            checked={settings.addNoise}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, addNoise: checked }))}
          />
        </div>

        <p className="text-xs text-orange-600 text-center">
          💡 A modulação é aplicada automaticamente quando você altera as configurações
        </p>
      </CardContent>
    </Card>
  );
};

export default VoiceModulator;
