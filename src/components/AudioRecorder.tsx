
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  promotionPrice?: React.ReactNode;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  onCancel,
  isRecording,
  onStartRecording,
  onStopRecording,
  promotionPrice,
}) => {
  const {
    startRecording,
    stopRecording,
    recordingDuration,
  } = useAudioRecorder({
    onRecordingComplete: onAudioRecorded,
    onError: (error) => {
      console.error('Erro na gravação:', error);
      onCancel();
    },
  });

  const handleStartRecording = async () => {
    try {
      onStartRecording();
      await startRecording();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      onCancel();
    }
  };

  const handleStopRecording = () => {
    onStopRecording();
    stopRecording();
  };

  if (isRecording) {
    return (
      <Button
        variant="outline"
        className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-red-50 border-red-200 hover:bg-red-100"
        onClick={handleStopRecording}
        type="button"
      >
        <Square className="h-6 w-6 text-red-600" />
        <span className="text-xs text-red-600">Parar Gravação</span>
        <span className="text-xs text-red-600 font-mono">
          {Math.floor(recordingDuration / 60).toString().padStart(2, '0')}:
          {(recordingDuration % 60).toString().padStart(2, '0')}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-150 transition-all duration-200"
      onClick={handleStartRecording}
      type="button"
    >
      <Mic className="h-6 w-6 text-orange-600" />
      <span className="text-xs text-gray-700 font-medium">Gravar Áudio</span>
      {promotionPrice || <span className="text-xs text-orange-600 font-semibold">+ R$ 2,00</span>}
    </Button>
  );
};

export default AudioRecorder;
