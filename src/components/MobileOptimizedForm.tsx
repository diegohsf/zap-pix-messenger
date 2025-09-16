import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Send, Image, Video, CheckCircle, Camera, Mic, X } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import { usePromotionSettings } from '@/hooks/usePromotionSettings';

interface MobileFormData {
  phoneNumber: string;
  messageText: string;
  mediaType: 'none' | 'photo' | 'audio' | 'video';
  mediaFile: File | null;
  price: number;
  originalPrice: number;
}

interface MobileOptimizedFormProps {
  onSubmit: (data: MobileFormData) => void;
  isSubmitting?: boolean;
}

const MobileOptimizedForm: React.FC<MobileOptimizedFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageText, setMessageText] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'photo' | 'audio' | 'video'>('none');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const { settings: promotionSettings } = usePromotionSettings();

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
                   .replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3')
                   .replace(/^(\d{2})(\d{1,5})/, '($1) $2')
                   .replace(/^(\d{1,2})/, '($1');
    }
    return value;
  };

  const calculatePrice = () => {
    let basePrice = 1.00; // Texto
    if (mediaType === 'photo' || mediaType === 'video') basePrice += 5.00;
    if (mediaType === 'audio') basePrice += 2.00;
    
    if (promotionSettings?.is_active) {
      const discount = promotionSettings.discount_percentage / 100;
      return basePrice * (1 - discount);
    }
    return basePrice;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
    }
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    const file = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
    setMediaFile(file);
    setMediaType('audio');
    setIsRecording(false);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaType('none');
  };

  const handleSubmit = () => {
    const data: MobileFormData = {
      phoneNumber,
      messageText,
      mediaType,
      mediaFile,
      price: calculatePrice(),
      originalPrice: calculatePrice()
    };
    onSubmit(data);
  };

  const isValidToSubmit = phoneNumber.length >= 14 && messageText.trim().length > 0;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Mobile Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Passo {step} de 3</span>
          <span className="text-xs text-gray-500">{Math.round((step/3)*100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step/3)*100}%` }}
          />
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4 bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            {step === 1 && 'Número de destino'}
            {step === 2 && 'Sua mensagem'}
            {step === 3 && 'Anexos e pagamento'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Step 1: Phone Number */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  📱 WhatsApp do destinatário *
                </label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  className="text-lg h-12 text-center"
                  inputMode="numeric"
                  autoFocus
                />
              </div>
              <Button 
                onClick={() => setStep(2)}
                disabled={phoneNumber.length < 14}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-semibold"
              >
                Continuar →
              </Button>
            </div>
          )}

          {/* Step 2: Message */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  💬 Digite sua mensagem * 
                  <span className="text-xs text-gray-400">({messageText.length}/1000)</span>
                </label>
                <Textarea
                  placeholder="Ex: Olá! Gostaria de fazer uma pergunta..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="min-h-32 text-base"
                  maxLength={1000}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  ← Voltar
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={messageText.trim().length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Continuar →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Media & Payment */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Media Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  📎 Anexar mídia (opcional)
                </label>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* Photo */}
                  <div className="relative">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      capture="environment"
                    />
                    <Button
                      variant="outline"
                      className="w-full h-16 flex flex-col gap-1 text-xs border-dashed"
                      type="button"
                    >
                      <Camera className="h-4 w-4" />
                      Foto
                      <span className="text-green-600 font-bold">+R$ {promotionSettings?.is_active ? (5 * (1 - (promotionSettings?.discount_percentage || 0) / 100)).toFixed(2) : '5,00'}</span>
                    </Button>
                  </div>

                  {/* Audio */}
                  <div className="w-full h-16 flex flex-col gap-1 text-xs border-dashed">
                    <AudioRecorder
                      onAudioRecorded={handleAudioRecorded}
                      onCancel={() => setIsRecording(false)}
                      isRecording={isRecording}
                      onStartRecording={() => setIsRecording(true)}
                      onStopRecording={() => setIsRecording(false)}
                      promotionPrice={
                        <span className="text-green-600 font-bold text-xs">
                          +R$ {promotionSettings?.is_active ? (2 * (1 - (promotionSettings?.discount_percentage || 0) / 100)).toFixed(2) : '2,00'}
                        </span>
                      }
                    />
                  </div>

                  {/* Video */}
                  <div className="relative">
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      capture="environment"
                    />
                    <Button
                      variant="outline"
                      className="w-full h-16 flex flex-col gap-1 text-xs border-dashed"
                      type="button"
                    >
                      <Video className="h-4 w-4" />
                      Vídeo
                      <span className="text-green-600 font-bold">+R$ {promotionSettings?.is_active ? (5 * (1 - (promotionSettings?.discount_percentage || 0) / 100)).toFixed(2) : '5,00'}</span>
                    </Button>
                  </div>
                </div>

                {/* Selected Media Display */}
                {mediaFile && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {mediaType === 'photo' && '📷 Foto selecionada'}
                        {mediaType === 'audio' && '🎤 Áudio gravado'}
                        {mediaType === 'video' && '🎥 Vídeo selecionado'}
                      </p>
                      <p className="text-xs text-gray-500">{mediaFile.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeMedia}
                      className="text-red-500 p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Price Display */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-green-700">
                    R$ {calculatePrice().toFixed(2)}
                  </span>
                </div>
                {promotionSettings?.is_active && (
                  <p className="text-xs text-orange-600 mt-1">
                    🔥 {promotionSettings.discount_percentage}% OFF aplicado!
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  ← Voltar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isValidToSubmit}
                  className="flex-1 bg-green-600 hover:bg-green-700 font-semibold"
                >
                  {isSubmitting ? 'Processando...' : (
                    <>
                      <Send className="mr-1 h-4 w-4" />
                      Pagar & Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimizedForm;