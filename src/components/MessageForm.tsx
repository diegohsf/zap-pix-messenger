import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Mic, Video, Image as ImageIcon, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AudioRecorder from './AudioRecorder';
import VoiceModulator from './VoiceModulator';
import FAQ from './FAQ';

export interface MessageData {
  phoneNumber: string;
  messageText: string;
  mediaType: 'none' | 'image' | 'video' | 'audio' | 'document';
  mediaFile?: File;
  price: number;
}

interface MessageFormProps {
  onSubmit: (data: MessageData) => void;
  isSubmitting: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSubmit, isSubmitting }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageText, setMessageText] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video' | 'audio' | 'document'>('none');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [price, setPrice] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isVoiceModulatorOpen, setIsVoiceModulatorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleMessageTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
  };

  const handleMediaTypeChange = (value: 'none' | 'image' | 'video' | 'audio' | 'document') => {
    setMediaType(value);
    setMediaFile(null); // Reset o arquivo ao mudar o tipo de mídia
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não for número ou ponto
    const value = e.target.value.replace(/[^0-9.]/g, '');

    // Permite apenas um ponto
    const parts = value.split('.');
    if (parts.length > 2) {
        // Se houver mais de um ponto, mantém apenas o primeiro
        setPrice(parseFloat(parts[0] + '.' + parts.slice(1).join('')));
    } else {
        // Converte para float
        setPrice(value === '' ? 0 : parseFloat(value));
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedAudio(null);
    setAudioUrl(null);
  };

  const handleStopRecording = (audioBlob: Blob) => {
    setIsRecording(false);
    setRecordedAudio(audioBlob);
    setMediaType('audio');
    setMediaFile(new File([audioBlob], 'recorded_audio.webm', { type: 'audio/webm' }));
    setAudioUrl(URL.createObjectURL(audioBlob));
  };

  const handleVoiceModulatorOpen = () => {
    setIsVoiceModulatorOpen(true);
  };

  const handleVoiceModulatorClose = () => {
    setIsVoiceModulatorOpen(false);
  };

  const handleVoiceModulation = (modulatedAudioBlob: Blob) => {
    setRecordedAudio(modulatedAudioBlob);
    setMediaType('audio');
    setMediaFile(new File([modulatedAudioBlob], 'modulated_audio.webm', { type: 'audio/webm' }));
    setAudioUrl(URL.createObjectURL(modulatedAudioBlob));
    setIsVoiceModulatorOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber) {
      toast({
        title: "Número de telefone é obrigatório",
        description: "Por favor, insira um número de telefone.",
        variant: "destructive",
      });
      return;
    }

    if (!messageText && mediaType === 'none') {
      toast({
        title: "Mensagem ou mídia é obrigatória",
        description: "Por favor, escreva uma mensagem ou selecione um tipo de mídia.",
        variant: "destructive",
      });
      return;
    }

    const data: MessageData = {
      phoneNumber,
      messageText,
      mediaType,
      mediaFile,
      price
    };

    onSubmit(data);
  };

  const handleRemoveMedia = () => {
    setMediaType('none');
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (recordedAudio) {
      URL.revokeObjectURL(audioUrl || '');
      setRecordedAudio(null);
      setAudioUrl(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/7135a89b-6c23-453a-88fc-205d355d12d8.png" 
              alt="Zap Elegante" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Zap Elegante</h1>
          <p className="text-lg text-gray-600">
            Envie mensagens no WhatsApp sem se identificar
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle>Nova Mensagem</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="phoneNumber">Número do destinatário</Label>
                <Input
                  type="tel"
                  id="phoneNumber"
                  placeholder="Digite o número com DDD"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <Label htmlFor="messageText">Mensagem</Label>
                <Textarea
                  id="messageText"
                  placeholder="Digite sua mensagem..."
                  value={messageText}
                  onChange={handleMessageTextChange}
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label>Tipo de mídia</Label>
                <RadioGroup defaultValue={mediaType} onValueChange={handleMediaTypeChange} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="media-none" disabled={isSubmitting} />
                    <Label htmlFor="media-none">Nenhuma</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="media-image" disabled={isSubmitting} />
                    <Label htmlFor="media-image">Imagem</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="media-video" disabled={isSubmitting} />
                    <Label htmlFor="media-video">Vídeo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="audio" id="media-audio" disabled={isSubmitting} />
                    <Label htmlFor="media-audio">Áudio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="document" id="media-document" disabled={isSubmitting} />
                    <Label htmlFor="media-document">Documento</Label>
                  </div>
                </RadioGroup>
              </div>

              {mediaType !== 'none' && (
                <div>
                  <Label htmlFor="mediaFile">
                    {mediaType === 'audio' ? 'Áudio' : 'Arquivo de mídia'}
                  </Label>
                  {mediaType === 'audio' && !recordedAudio ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleStartRecording}
                          disabled={isSubmitting || isRecording}
                        >
                          {isRecording ? (
                            <>
                              Gravando...
                              <span className="animate-pulse text-red-500">●</span>
                            </>
                          ) : (
                            <>
                              <Mic className="mr-2 h-4 w-4" />
                              Gravar Áudio
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleVoiceModulatorOpen}
                          disabled={isSubmitting || isRecording}
                        >
                          Modulador de Voz
                        </Button>
                      </div>
                      <AudioRecorder
                        isRecording={isRecording}
                        onStop={handleStopRecording}
                      />
                      <VoiceModulator
                        isOpen={isVoiceModulatorOpen}
                        onClose={handleVoiceModulatorClose}
                        onVoiceModulation={handleVoiceModulation}
                        recordedAudio={recordedAudio}
                      />
                    </>
                  ) : (
                    <>
                      <div className="relative border rounded-md p-2 flex items-center justify-between">
                        <label
                          htmlFor="mediaFile"
                          className="cursor-pointer py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed data-[disabled]:opacity-50"
                        >
                          <div className="flex items-center">
                            {mediaType === 'image' && <ImageIcon className="mr-2 h-4 w-4" />}
                            {mediaType === 'video' && <Video className="mr-2 h-4 w-4" />}
                            {mediaType === 'audio' && <Mic className="mr-2 h-4 w-4" />}
                            {mediaType === 'document' && <FileText className="mr-2 h-4 w-4" />}
                            <span>
                              {mediaFile ? mediaFile.name : `Selecionar ${mediaType === 'audio' ? 'áudio' : 'arquivo'}`}
                            </span>
                          </div>
                        </label>
                        <Input
                          type="file"
                          id="mediaFile"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                          accept={
                            mediaType === 'image'
                              ? 'image/*'
                              : mediaType === 'video'
                                ? 'video/*'
                                : mediaType === 'audio'
                                  ? 'audio/*'
                                  : '*'
                          }
                          ref={fileInputRef}
                        />
                        {mediaFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveMedia}
                            disabled={isSubmitting}
                            className="absolute top-1 right-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {recordedAudio && mediaType === 'audio' && (
                        <audio src={audioUrl} controls className="mt-2 w-full"></audio>
                      )}
                    </>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="price">Valor (R$)</Label>
                <Input
                  type="number"
                  id="price"
                  placeholder="Digite o valor"
                  value={price.toString()}
                  onChange={handlePriceChange}
                  disabled={isSubmitting}
                  step="0.01"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <FAQ />
      </div>
    </div>
  );
};

export default MessageForm;
