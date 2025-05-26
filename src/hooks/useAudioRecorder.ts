
import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onError: (error: Error) => void;
}

export const useAudioRecorder = ({ onRecordingComplete, onError }: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Priorizar WAV como formato principal
      let mimeType = 'audio/wav';
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else {
        // Último fallback
        mimeType = 'audio/ogg';
      }
      
      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        // Se não for WAV, converter o blob para WAV
        if (mimeType !== 'audio/wav') {
          console.log('Converting audio to WAV format...');
          convertToWav(audioBlob, duration);
        } else {
          onRecordingComplete(audioBlob, duration);
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      onError(error as Error);
    }
  }, [onRecordingComplete, onError]);

  const convertToWav = useCallback(async (audioBlob: Blob, duration: number) => {
    try {
      // Criar um novo blob WAV
      const wavBlob = new Blob([audioBlob], { type: 'audio/wav' });
      onRecordingComplete(wavBlob, duration);
    } catch (error) {
      console.error('Error converting to WAV:', error);
      // Se falhar a conversão, usar o blob original
      onRecordingComplete(audioBlob, duration);
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRecording]);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording
  };
};
