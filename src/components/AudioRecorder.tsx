
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
  promotionPrice
}) => {
  const { startRecording, stopRecording } = useAudioRecorder({
    onRecordingComplete: onAudioRecorded,
    onError: (error) => {
      console.error('Erro na gravação:', error);
      onCancel();
    }
  });

  const handleStartRecording = async () => {
    try {
      await startRecording();
      onStartRecording();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      onCancel();
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    onStopRecording();
  };

  return (
    <Button
      variant="outline"
      className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 border-2 border-dashed"
      type="button"
      onClick={isRecording ? handleStopRecording : handleStartRecording}
    >
      {isRecording ? (
        <>
          <Square className="h-6 w-6 text-red-500" />
          <span className="text-xs">Parar Gravação</span>
          <span className="text-xs text-red-600 font-semibold">Gravando...</span>
        </>
      ) : (
        <>
          <Mic className="h-6 w-6" />
          <span className="text-xs">Gravar Áudio</span>
          {promotionPrice || (
            <span className="text-xs text-purple-600 font-semibold">+ R$ 2,00</span>
          )}
        </>
      )}
    </Button>
  );
};

export default AudioRecorder;
