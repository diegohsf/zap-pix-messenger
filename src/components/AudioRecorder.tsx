
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { mic, mic-off, pause, trash-2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  onCancel,
  isRecording,
  onStartRecording,
  onStopRecording,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      setAudioChunks(chunks);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          setAudioChunks([...chunks]);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        onAudioRecorded(audioBlob, recordingTime);
        cleanup();
      };

      mediaRecorder.start(100);
      onStartRecording();
      setRecordingTime(0);
    } catch (error) {
      console.error('Erro ao acessar o microfone:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      onStopRecording();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    onCancel();
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTime(0);
    setIsPaused(false);
    setAudioChunks([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <Button
        variant="outline"
        onClick={startRecording}
        className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-red-50 border-2 border-dashed"
      >
        <Mic className="h-6 w-6" />
        <span className="text-xs">Gravar Áudio</span>
      </Button>
    );
  }

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
          <span className="text-sm font-medium text-red-800">
            {isPaused ? 'Pausado' : 'Gravando'}
          </span>
        </div>
        <div className="text-lg font-mono font-bold text-red-800">
          {formatTime(recordingTime)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={cancelRecording}
          className="text-red-600 hover:text-red-800 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {isPaused ? (
          <Button
            variant="outline"
            size="sm"
            onClick={resumeRecording}
            className="text-green-600 hover:text-green-800 hover:bg-green-100"
          >
            <Mic className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={pauseRecording}
            className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
          >
            <Pause className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="default"
          size="sm"
          onClick={stopRecording}
          className="bg-green-600 hover:bg-green-700"
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
};

export default AudioRecorder;
