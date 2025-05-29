
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import { Image, AudioLines, Video, X } from 'lucide-react';
import { saveMessage } from '@/services/messageService';
import { uploadFile } from '@/services/fileUploadService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { usePromotionSettings } from '@/hooks/usePromotionSettings';
import { useCouponValidation } from '@/hooks/useCouponValidation';

const MessageForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    isEnabled: false,
    pitch: 0,
    speed: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { toast } = useToast();
  const { settings: promotionSettings } = usePromotionSettings();
  const { 
    appliedCoupon, 
    isValidating, 
    validateAndApplyCoupon, 
    removeCoupon, 
    calculateFinalPrice,
    confirmCouponUsage,
    isPromotionActive 
  } = useCouponValidation();
  const navigate = useNavigate();

  const formatPhoneNumber = (value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    const match = cleanedValue.match(/^(\d{2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      let formattedNumber = `(${match[1]}) `;
      formattedNumber += match[2] ? `${match[2]}` : '';
      formattedNumber += match[3] ? `-${match[3]}` : '';
      return formattedNumber;
    }
    return value;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedNumber = formatPhoneNumber(inputValue);
    setPhoneNumber(formattedNumber);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image') {
      setImageFile(file);
      setCroppedImage(null);
    } else if (type === 'audio') {
      setAudioFile(file);
    } else if (type === 'video') {
      setVideoFile(file);
    }
  };

  const handleRemoveMedia = (type: 'image' | 'audio' | 'video') => {
    if (type === 'image') {
      setImageFile(null);
      setCroppedImage(null);
    } else if (type === 'audio') {
      setAudioFile(null);
    } else if (type === 'video') {
      setVideoFile(null);
    }
  };

  const handleVoiceSettingsChange = (field: 'pitch' | 'speed', value: number) => {
    setVoiceSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !messageText) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validar número de telefone
    const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Erro",
        description: "Por favor, digite um número de telefone válido.",
        variant: "destructive",
      });
      return;
    }

    if (voiceSettings.isEnabled && !audioFile) {
      toast({
        title: "Erro",
        description: "Por favor, grave um áudio para modular a voz.",
        variant: "destructive",
      });
      return;
    }

    const hasMedia = imageFile || audioFile || videoFile;
    const mediaType = imageFile ? 'photo' : audioFile ? 'audio' : videoFile ? 'video' : 'none';
    
    // Calcular preço com base na promoção ativa
    const basePrice = hasMedia ? 5 : 2;
    let finalPrice = basePrice;
    let originalPrice = basePrice;
    let discountAmount = 0;
    let couponCode = null;

    // Aplicar desconto da promoção se ativa
    if (promotionSettings?.is_active && hasMedia) {
      const promotionDiscount = (basePrice * (promotionSettings.discount_percentage || 50)) / 100;
      finalPrice = basePrice - promotionDiscount;
    }

    // Aplicar cupom se não houver promoção ativa
    if (!promotionSettings?.is_active && appliedCoupon?.isValid) {
      const couponCalculation = calculateFinalPrice(finalPrice);
      originalPrice = couponCalculation.originalPrice;
      discountAmount = couponCalculation.discountAmount;
      finalPrice = couponCalculation.finalPrice;
      couponCode = appliedCoupon.coupon?.code || null;
    }

    setIsSubmitting(true);

    try {
      let mediaFileUrl = null;
      let mediaFileName = null;

      // Upload do arquivo de mídia se houver
      if (hasMedia) {
        const file = imageFile || audioFile || videoFile;
        if (file) {
          const uploadResult = await uploadFile(file, mediaType as 'photo' | 'audio' | 'video');
          mediaFileUrl = uploadResult.url;
          mediaFileName = uploadResult.fileName;
        }
      }

      // Salvar mensagem no banco
      const messageData = {
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        messageText: messageText,
        mediaType: mediaType as 'none' | 'photo' | 'audio' | 'video',
        mediaFileUrl: mediaFileUrl,
        mediaFileName: mediaFileName,
        price: finalPrice,
        originalPrice: originalPrice > finalPrice ? originalPrice : undefined,
        discountAmount: discountAmount,
        couponCode: couponCode
      };

      const savedMessage = await saveMessage(messageData);
      
      // Confirmar uso do cupom após pagamento bem-sucedido ser criado
      if (appliedCoupon?.isValid && !promotionSettings?.is_active) {
        await confirmCouponUsage();
      }

      // Redirecionar para página de confirmação
      navigate('/confirmacao', { 
        state: { 
          messageId: savedMessage.id,
          amount: finalPrice,
          originalAmount: originalPrice > finalPrice ? originalPrice : null,
          discountAmount: discountAmount > 0 ? discountAmount : null,
          couponCode: couponCode
        } 
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Envie sua mensagem</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone">Número de Telefone</Label>
            <Input
              type="tel"
              id="phone"
              placeholder="(11) 98765-4321"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem aqui..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              required
            />
          </div>

          {/* Media Upload Section */}
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Image Upload */}
            <div>
              <Label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
                Imagem
              </Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="sr-only"
                />
                <Label
                  htmlFor="image-upload"
                  className="group relative flex items-center justify-center rounded-md border border-dashed border-gray-300 py-3 px-4 text-sm font-medium hover:border-gray-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                >
                  <span>
                    {imageFile ? (
                      <>
                        <Image className="h-5 w-5 text-gray-500 group-hover:text-gray-600" aria-hidden="true" />
                        <span className="ml-2">Trocar Imagem</span>
                      </>
                    ) : (
                      <>
                        <Image className="h-5 w-5 text-gray-500 group-hover:text-gray-600" aria-hidden="true" />
                        <span className="ml-2">Adicionar Imagem</span>
                      </>
                    )}
                  </span>
                </Label>
              </div>
              {imageFile && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Imagem selecionada"
                      className="h-16 w-16 object-cover rounded"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveMedia('image')}>
                      <X className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Upload */}
            <div>
              <Label htmlFor="audio-upload" className="block text-sm font-medium text-gray-700">
                Áudio
              </Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, 'audio')}
                  className="sr-only"
                />
                <Label
                  htmlFor="audio-upload"
                  className="group relative flex items-center justify-center rounded-md border border-dashed border-gray-300 py-3 px-4 text-sm font-medium hover:border-gray-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                >
                  <span>
                    {audioFile ? (
                      <>
                        <AudioLines className="h-5 w-5 text-gray-500 group-hover:text-gray-600" aria-hidden="true" />
                        <span className="ml-2">Trocar Áudio</span>
                      </>
                    ) : (
                      <>
                        <AudioLines className="h-5 w-5 text-gray-500 group-hover:text-gray-600" aria-hidden="true" />
                        <span className="ml-2">Adicionar Áudio</span>
                      </>
                    )}
                  </span>
                </Label>
              </div>
              {audioFile && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <audio ref={audioRef} src={URL.createObjectURL(audioFile)} controls className="w-32"></audio>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveMedia('audio')}>
                      <X className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div>
              <Label htmlFor="video-upload" className="block text-sm font-medium text-gray-700">
                Vídeo
              </Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="sr-only"
                />
                <Label
                  htmlFor="video-upload"
                  className="group relative flex items-center justify-center rounded-md border border-dashed border-gray-300 py-3 px-4 text-sm font-medium hover:border-gray-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                >
                  <span>
                    {videoFile ? (
                      <>
                        <Video className="h-5 w-5 text-gray-500 group-hover:text-gray-600" aria-hidden="true" />
                        <span className="ml-2">Trocar Vídeo</span>
                      </>
                    ) : (
                      <>
                        <Video className="h-5 w-5 text-gray-500 group-hover:text-gray-600" aria-hidden="true" />
                        <span className="ml-2">Adicionar Vídeo</span>
                      </>
                    )}
                  </span>
                </Label>
              </div>
              {videoFile && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <video src={URL.createObjectURL(videoFile)} controls className="h-16 w-32 rounded"></video>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveMedia('video')}>
                      <X className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coupon Section */}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="coupon">Cupom de Desconto</Label>
              {appliedCoupon?.isValid ? (
                <Button variant="destructive" size="sm" onClick={removeCoupon}>
                  Remover Cupom
                </Button>
              ) : null}
            </div>
            <div className="flex items-center">
              <Input
                type="text"
                id="coupon"
                placeholder="Digite o código do cupom"
                className="mr-2"
                disabled={appliedCoupon?.isValid || isPromotionActive}
                onBlur={(e) => validateAndApplyCoupon(e.target.value, imageFile || audioFile || videoFile ? 5 : 2)}
              />
              {!appliedCoupon?.isValid && (
                <Button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    validateAndApplyCoupon(input.value, imageFile || audioFile || videoFile ? 5 : 2);
                  }}
                  disabled={isValidating || isPromotionActive}
                >
                  {isValidating ? 'Validando...' : 'Aplicar'}
                </Button>
              )}
            </div>
            {isPromotionActive && (
              <Badge variant="secondary">
                Promoção ativa! Cupons não podem ser usados.
              </Badge>
            )}
            {appliedCoupon?.isValid && (
              <Badge variant="outline">
                Cupom aplicado: {appliedCoupon.coupon?.code} - Desconto de R$ {appliedCoupon.discountAmount?.toFixed(2)}
              </Badge>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MessageForm;
