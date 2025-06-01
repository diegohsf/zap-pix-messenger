
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Video, Image, Phone, MessageSquare, Mic, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AudioRecorder from './AudioRecorder';
import AudioPlayer from './AudioPlayer';
import FAQ from './FAQ';
import RecentMessages from './RecentMessages';
import PromotionBanner from './PromotionBanner';
import { usePromotionSettings } from '@/hooks/usePromotionSettings';
import { useCouponValidation } from '@/hooks/useCouponValidation';

interface MessageFormProps {
  onSubmit: (data: MessageData) => void;
  isSubmitting?: boolean;
}

export interface MessageData {
  phoneNumber: string;
  messageText: string;
  mediaType: 'none' | 'photo' | 'audio' | 'video';
  mediaFile: File | null;
  mediaFileUrl?: string;
  mediaFileName?: string;
  price: number;
  couponCode?: string;
  originalPrice?: number;
  discountAmount?: number;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'photo' | 'audio' | 'video'>('none');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; duration: number } | null>(null);
  const [couponCode, setCouponCode] = useState('');
  
  // Refs para resetar os inputs de arquivo
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { settings: promotionSettings } = usePromotionSettings();
  const { 
    appliedCoupon, 
    isValidating, 
    validateAndApplyCoupon, 
    removeCoupon, 
    calculateFinalPrice,
    isPromotionActive 
  } = useCouponValidation();

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 11) return phoneNumber;
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) {
      const ddd = numbers.slice(0, 2);
      const firstPart = numbers.slice(2, -4);
      const lastPart = numbers.slice(-4);
      return `(${ddd}) ${firstPart}-${lastPart}`;
    }
    return numbers;
  };

  const validatePhoneNumber = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length !== 10 && numbers.length !== 11) return false;
    const ddd = parseInt(numbers.slice(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    if (ddd > 30) {
      return numbers.length === 10 || numbers.length === 11;
    }
    if (ddd <= 30) {
      return numbers.length === 11 && numbers[2] === '9';
    }
    return false;
  };

  const formatPhoneForWebhook = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return `55${numbers}`;
  };

  const calculatePrice = () => {
    const basePrice = 5.00;
    let totalPrice = basePrice;

    // Adicionar custo da mídia
    let mediaCost = 0;
    switch (mediaType) {
      case 'video':
      case 'photo':
        mediaCost = 5.00;
        break;
      case 'audio':
        mediaCost = 2.00;
        break;
      default:
        mediaCost = 0;
    }

    // Aplicar desconto da promoção APENAS na mídia, não na mensagem base
    if (promotionSettings?.is_active && promotionSettings?.discount_percentage > 0 && mediaCost > 0) {
      const discountRate = promotionSettings.discount_percentage / 100;
      mediaCost = mediaCost * (1 - discountRate);
    }

    totalPrice = basePrice + mediaCost;

    // Se há cupom aplicado, calcular o preço final com desconto do cupom
    if (appliedCoupon?.isValid) {
      const priceCalculation = calculateFinalPrice(totalPrice);
      return priceCalculation.finalPrice;
    }

    return totalPrice;
  };

  const getOriginalPrice = () => {
    const basePrice = 5.00;
    switch (mediaType) {
      case 'video':
      case 'photo':
        return basePrice + 5.00; // 10.00
      case 'audio':
        return basePrice + 2.00; // 7.00
      default:
        return basePrice; // 5.00
    }
  };

  const getPromotionPrice = (type: 'photo' | 'audio' | 'video') => {
    if (!promotionSettings?.is_active) return null;
    
    const basePrice = 5.00;
    const discountRate = (promotionSettings?.discount_percentage || 0) / 100;
    
    switch (type) {
      case 'video':
      case 'photo':
        const mediaExtra = 5.00;
        return <span className="text-xs text-green-600 font-semibold">Era R$ 10,00 - Agora + R$ {(mediaExtra * (1 - discountRate)).toFixed(2)}</span>;
      case 'audio':
        const audioExtra = 2.00;
        return <span className="text-xs text-green-600 font-semibold">Era R$ 7,00 - Agora + R$ {(audioExtra * (1 - discountRate)).toFixed(2)}</span>;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`Arquivo ${type} selecionado:`, file.name, 'Tamanho:', file.size);
      setMediaFile(file);
      setMediaType(type);
      setRecordedAudio(null);
      toast({
        title: "Arquivo selecionado",
        description: `${type === 'photo' ? 'Foto' : 'Vídeo'} carregado com sucesso!`,
      });
    }
  };

  const handleAudioRecorded = (audioBlob: Blob, duration: number) => {
    console.log('=== ÁUDIO GRAVADO ===');
    console.log('Tamanho do blob:', audioBlob.size, 'bytes');
    console.log('Duração:', duration, 'segundos');
    console.log('Tipo MIME do blob:', audioBlob.type);
    
    const fileName = `audio_${Date.now()}.wav`;
    const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });
    
    console.log('Arquivo WAV criado:');
    console.log('- Nome:', audioFile.name);
    console.log('- Tipo:', audioFile.type);
    console.log('- Tamanho:', audioFile.size, 'bytes');
    
    setRecordedAudio({ blob: audioBlob, duration });
    setMediaFile(audioFile);
    setMediaType('audio');
    setIsRecording(false);
    
    toast({
      title: "Áudio gravado",
      description: `Gravação de ${Math.round(duration)} segundos concluída!`,
    });
  };

  const handleCancelAudio = () => {
    console.log('Gravação de áudio cancelada');
    setIsRecording(false);
    setRecordedAudio(null);
    setMediaFile(null);
    if (mediaType === 'audio') {
      setMediaType('none');
    }
  };

  const clearMedia = () => {
    console.log('Limpando mídia selecionada');
    setMediaType('none');
    setMediaFile(null);
    setRecordedAudio(null);
    setIsRecording(false);
    
    // Resetar os valores dos inputs de arquivo
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleCouponApply = async () => {
    const originalPrice = getOriginalPrice();
    await validateAndApplyCoupon(couponCode, originalPrice);
  };

  const handleCouponRemove = () => {
    setCouponCode('');
    removeCoupon();
  };

  const handleSubmit = () => {
    console.log('=== VALIDAÇÃO DO FORMULÁRIO ===');
    console.log('Número:', phoneNumber);
    console.log('Mensagem:', message);
    console.log('Tipo de mídia:', mediaType);
    console.log('Arquivo de mídia:', mediaFile);
    console.log('Áudio gravado:', recordedAudio);

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de WhatsApp válido. DDD acima de 30 aceita 8 ou 9 dígitos. DDD até 30 deve ter 9 dígitos iniciando com 9.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Mensagem obrigatória",
        description: "Por favor, digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    if (mediaType === 'audio') {
      if (!mediaFile) {
        console.error('❌ ERRO: Áudio selecionado mas arquivo não encontrado');
        toast({
          title: "Áudio não encontrado",
          description: "Por favor, grave um áudio antes de enviar.",
          variant: "destructive",
        });
        return;
      }
      
      if (!recordedAudio) {
        console.error('❌ ERRO: Arquivo de áudio existe mas dados do blob não encontrados');
        toast({
          title: "Dados do áudio perdidos",
          description: "Por favor, grave o áudio novamente.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('✅ Validação de áudio passou - arquivo e blob encontrados');
    }

    const formattedPhoneNumber = formatPhoneForWebhook(phoneNumber);
    console.log('Número formatado para webhook:', formattedPhoneNumber);

    const finalPrice = calculatePrice();
    const originalPrice = getOriginalPrice();

    // Se há cupom aplicado, usar os valores calculados pelo cupom
    let priceData;
    if (appliedCoupon?.isValid) {
      const priceCalculation = calculateFinalPrice(originalPrice);
      priceData = {
        price: priceCalculation.finalPrice,
        originalPrice: priceCalculation.originalPrice,
        discountAmount: priceCalculation.discountAmount,
        couponCode: appliedCoupon.coupon?.code
      };
    } else {
      // Se não há cupom mas há promoção ativa
      priceData = {
        price: finalPrice,
        originalPrice: promotionSettings?.is_active ? originalPrice : finalPrice,
        discountAmount: promotionSettings?.is_active ? (originalPrice - finalPrice) : 0
      };
    }

    const formData: MessageData = {
      phoneNumber: formattedPhoneNumber,
      messageText: message,
      mediaType,
      mediaFile,
      ...priceData
    };

    console.log('=== DADOS FINAIS PARA ENVIO ===');
    console.log('Dados do formulário:', formData);
    console.log('Preço final:', finalPrice);
    console.log('Preço original:', originalPrice);
    console.log('Promoção ativa:', promotionSettings?.is_active);
    console.log('Desconto da promoção:', promotionSettings?.discount_percentage);
    console.log('=====================================');

    onSubmit(formData);
  };

  const getButtonText = () => {
    if (isRecording) return 'Finalize a gravação primeiro';
    if (isSubmitting) {
      return mediaFile && mediaType !== 'none' ? 'Enviando arquivo...' : 'Processando...';
    }
    return '💬 Enviar Mensagem';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Zap Elegante</h1>
          <p className="text-lg text-gray-600">Envie mensagens no WhatsApp sem se identificar</p>
        </div>

        {/* Promotion Banner */}
        <PromotionBanner 
          isActive={promotionSettings?.is_active || false} 
          discountPercentage={promotionSettings?.discount_percentage || 50} 
        />

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
              <Phone className="h-6 w-6 text-primary" />
              Envie um WhatsApp sem se identificar
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-800">
                <strong>Atenção:</strong> Se você digitar o número de telefone errado, a 
                mensagem <strong>não será entregue</strong> e <strong>não haverá reembolso</strong>.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Lembre-se do DDD
              </label>
              <p className="text-xs text-gray-600">
                Sempre inclua o <strong>DDD</strong> do número antes de enviar a mensagem.
              </p>
              <div className="relative">
                <Input
                  placeholder="(11) 99999-9999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  className="pl-10 text-lg h-12"
                  disabled={isSubmitting}
                  inputMode="numeric"
                />
                <Phone className="absolute left-3 top-3 h-6 w-6 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mensagem</label>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-24 text-base"
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div className="text-xs text-gray-500 text-right">
                {message.length}/1000 caracteres
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Anexos (opcional)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="photo-upload"
                    disabled={isSubmitting || isRecording}
                  />
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center gap-1 hover:bg-green-50 border-2 border-dashed"
                    type="button"
                    disabled={isSubmitting || isRecording}
                  >
                    <Image className="h-6 w-6" />
                    <span className="text-xs font-semibold">Enviar Foto</span>
                    {promotionSettings?.is_active ? (
                      <div className="text-center">
                        <div className="text-xs text-gray-500 line-through">+ R$ 5,00</div>
                        <div className="text-xs text-green-600 font-bold">+ R$ {(5.00 * (1 - (promotionSettings?.discount_percentage || 0) / 100)).toFixed(2)}</div>
                        <Badge className="bg-orange-500 text-white text-xs mt-1">
                          {promotionSettings?.discount_percentage}% OFF
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-green-600 font-semibold">+ R$ 5,00</span>
                    )}
                  </Button>
                </div>

                <AudioRecorder
                  onAudioRecorded={handleAudioRecorded}
                  onCancel={handleCancelAudio}
                  isRecording={isRecording}
                  onStartRecording={() => setIsRecording(true)}
                  onStopRecording={() => setIsRecording(false)}
                  promotionPrice={promotionSettings?.is_active ? (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 line-through">+ R$ 2,00</div>
                      <div className="text-xs text-orange-600 font-bold">+ R$ {(2.00 * (1 - (promotionSettings?.discount_percentage || 0) / 100)).toFixed(2)}</div>
                      <Badge className="bg-orange-500 text-white text-xs mt-1">
                        {promotionSettings?.discount_percentage}% OFF
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-xs text-orange-600 font-semibold">+ R$ 2,00</span>
                  )}
                />

                <div className="relative">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="video-upload"
                    disabled={isSubmitting || isRecording}
                  />
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 border-2 border-dashed"
                    type="button"
                    disabled={isSubmitting || isRecording}
                  >
                    <Video className="h-6 w-6" />
                    <span className="text-xs font-semibold">Enviar Vídeo</span>
                    {promotionSettings?.is_active ? (
                      <div className="text-center">
                        <div className="text-xs text-gray-500 line-through">+ R$ 5,00</div>
                        <div className="text-xs text-blue-600 font-bold">+ R$ {(5.00 * (1 - (promotionSettings?.discount_percentage || 0) / 100)).toFixed(2)}</div>
                        <Badge className="bg-orange-500 text-white text-xs mt-1">
                          {promotionSettings?.discount_percentage}% OFF
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-blue-600 font-semibold">+ R$ 5,00</span>
                    )}
                  </Button>
                </div>
              </div>

              {mediaType !== 'none' && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {mediaType === 'photo' && <Image className="h-5 w-5 text-green-600" />}
                    {mediaType === 'audio' && (
                      <div className="flex items-center gap-2">
                        <Mic className="h-5 w-5 text-green-600" />
                        {recordedAudio && (
                          <span className="text-xs text-green-700">
                            ({Math.floor(recordedAudio.duration)}s)
                          </span>
                        )}
                      </div>
                    )}
                    {mediaType === 'video' && <Video className="h-5 w-5 text-green-600" />}
                    <span className="text-sm text-green-800 capitalize">
                      {mediaType === 'photo' ? 'Foto' : 
                       mediaType === 'audio' ? 'Áudio' : 
                       'Vídeo'} selecionado
                    </span>
                    {mediaFile && (
                      <span className="text-xs text-green-600">
                        ({(mediaFile.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMedia}
                    className="text-red-600 hover:text-red-800"
                    disabled={isSubmitting}
                  >
                    Remover
                  </Button>
                </div>
              )}

              {mediaType === 'audio' && recordedAudio && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Prévia do áudio gravado:</label>
                  <AudioPlayer audioBlob={recordedAudio.blob} duration={recordedAudio.duration} />
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg ${promotionSettings?.is_active ? 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Preço por mensagem:
                </span>
                <div className="flex items-center gap-2">
                  {appliedCoupon?.isValid && (
                    <div className="text-right">
                      <div className="text-sm line-through text-gray-500">
                        R$ {calculateFinalPrice(getOriginalPrice()).originalPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-green-600">
                        Desconto: -R$ {calculateFinalPrice(getOriginalPrice()).discountAmount.toFixed(2)}
                      </div>
                    </div>
                  )}
                  
                  {promotionSettings?.is_active && mediaType !== 'none' && !appliedCoupon?.isValid && (
                    <span className="text-sm line-through text-gray-500">
                      R$ {getOriginalPrice().toFixed(2)}
                    </span>
                  )}
                  
                  <Badge variant="secondary" className={`text-lg font-bold px-3 py-1 ${
                    appliedCoupon?.isValid ? 'bg-green-500 text-white animate-pulse' :
                    (promotionSettings?.is_active && mediaType !== 'none' ? 'bg-orange-500 text-white animate-pulse' : '')
                  }`}>
                    R$ {calculatePrice().toFixed(2)}
                  </Badge>
                  
                  {appliedCoupon?.isValid && (
                    <Badge className="bg-green-500 text-white text-xs animate-bounce">
                      CUPOM!
                    </Badge>
                  )}
                  
                  {promotionSettings?.is_active && mediaType !== 'none' && !appliedCoupon?.isValid && (
                    <Badge className="bg-green-500 text-white text-xs animate-bounce">
                      ECONOMIA!
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Ao enviar uma mensagem, você concorda com nossos Termos e Condições 
                e a Política de Privacidade.
              </p>
            </div>

            {/* Seção de Cupom de Desconto */}
            <div className="space-y-4">
              {isPromotionActive ? (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="text-orange-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Promoção ativa - Cupons indisponíveis
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Não é possível usar cupons enquanto a promoção está ativa. Aproveite os descontos promocionais em mídias!
                      </p>
                    </div>
                  </div>
                </div>
              ) : !appliedCoupon?.isValid ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite seu cupom de desconto"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                    disabled={isSubmitting || isValidating}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCouponApply}
                    disabled={isSubmitting || isValidating || !couponCode.trim()}
                    className="px-6"
                  >
                    {isValidating ? 'Validando...' : 'Aplicar'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="text-sm font-medium text-green-800">
                        Cupom {appliedCoupon.coupon?.code} aplicado!
                      </span>
                      <div className="text-xs text-green-600">
                        Desconto: R$ {appliedCoupon.discountAmount?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCouponRemove}
                    className="text-red-600 hover:text-red-800"
                    disabled={isSubmitting}
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isRecording}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-hover"
            >
              {getButtonText()}
            </Button>
          </CardContent>
        </Card>

        <FAQ />
        
        <div className="mt-8">
          <RecentMessages />
        </div>
      </div>
    </div>
  );
};

export default MessageForm;
