
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
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [settings, setSettings] = useState<VoiceModulationSettings>({
    pitchShift: 0,
    voiceType: 'male',
    addNoise: false,
    speedChange: 1,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const originalBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    loadAudioBuffer();

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  const loadAudioBuffer = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      originalBufferRef.current = audioBuffer;
    } catch (error) {
      console.error('Erro ao carregar buffer de áudio:', error);
    }
  };

  const applyVoiceModulation = async () => {
    if (!originalBufferRef.current || !audioContextRef.current) {
      console.error('Buffer de áudio não carregado');
      return;
    }

    setIsProcessing(true);

    try {
      const audioContext = audioContextRef.current;
      const originalBuffer = originalBufferRef.current;
      
      // Criar um novo buffer para o áudio modificado
      const sampleRate = originalBuffer.sampleRate;
      const numberOfChannels = originalBuffer.numberOfChannels;
      
      // Calcular nova duração baseada na velocidade
      const newLength = Math.floor(originalBuffer.length / settings.speedChange);
      const modifiedBuffer = audioContext.createBuffer(numberOfChannels, newLength, sampleRate);

      for (let channel = 0; channel < numberOfChannels; channel++) {
        const originalData = originalBuffer.getChannelData(channel);
        const modifiedData = modifiedBuffer.getChannelData(channel);

        // Aplicar mudança de velocidade/pitch
        for (let i = 0; i < newLength; i++) {
          const sourceIndex = Math.floor(i * settings.speedChange);
          if (sourceIndex < originalData.length) {
            modifiedData[i] = originalData[sourceIndex];
          }
        }

        // Aplicar modulação de pitch baseada no tipo de voz
        let pitchMultiplier = 1;
        switch (settings.voiceType) {
          case 'female':
            pitchMultiplier = 1.3;
            break;
          case 'male':
            pitchMultiplier = 0.8;
            break;
          case 'chipmunk':
            pitchMultiplier = 1.8;
            break;
          case 'deep':
            pitchMultiplier = 0.6;
            break;
          case 'robotic':
            pitchMultiplier = 1.0;
            break;
        }

        // Aplicar pitch shift manual
        pitchMultiplier *= (1 + settings.pitchShift / 100);

        // Aplicar efeitos específicos
        if (settings.voiceType === 'robotic') {
          // Efeito robótico: quantização
          for (let i = 0; i < modifiedData.length; i++) {
            modifiedData[i] = Math.round(modifiedData[i] * 8) / 8;
          }
        }

        // Adicionar ruído se necessário
        if (settings.addNoise) {
          for (let i = 0; i < modifiedData.length; i++) {
            modifiedData[i] += (Math.random() - 0.5) * 0.02;
          }
        }
      }

      // Converter buffer modificado de volta para blob
      const modifiedBlob = await bufferToWavBlob(modifiedBuffer);
      onModulatedAudio(modifiedBlob);

    } catch (error) {
      console.error('Erro ao aplicar modulação de voz:', error);
    } finally {
      setIsProcessing(false);
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
    view.setUint32(16, 16, true); // PCM chunk size
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mt-4 border-2 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic className="h-5 w-5 text-orange-600" />
          Modulação de Voz (Opcional)
        </CardTitle>
        <p className="text-sm text-orange-700">
          Modifique sua voz para maior anonimato
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Audio Player */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
          <audio 
            ref={audioRef} 
            src={audioUrl} 
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
              {formatTime(currentTime)} / {formatTime(duration)}
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

        {/* Apply Button */}
        <Button
          onClick={applyVoiceModulation}
          disabled={isProcessing}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isProcessing ? 'Processando...' : 'Aplicar Modulação'}
        </Button>

        <p className="text-xs text-orange-600 text-center">
          💡 A modulação ajuda a proteger sua identidade
        </p>
      </CardContent>
    </Card>
  );
};

export default VoiceModulator;
