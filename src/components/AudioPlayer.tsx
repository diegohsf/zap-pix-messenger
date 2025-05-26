
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  audioBlob: Blob;
  duration: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBlob, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Criar URL do blob para reprodução
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    return () => {
      // Limpar URL quando componente for desmontado
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

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
    <div className="flex items-center gap-2 bg-green-100 p-2 rounded-lg">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
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

      <div className="flex-1 text-xs text-green-700">
        <div className="font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="w-full bg-green-200 rounded-full h-1 mt-1">
          <div
            className="bg-green-600 h-1 rounded-full transition-all duration-300"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
