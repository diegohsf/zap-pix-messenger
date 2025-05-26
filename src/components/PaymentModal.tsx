import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, CheckCircle, Clock, Smartphone, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MessageData } from './MessageForm';
import { updateMessagePayment } from '@/services/messageService';
import { supabase } from '@/integrations/supabase/client';

interface PaymentModalProps {
  isOpen: boolean;
  messageId: string | null;
  messageData: MessageData | null;
  onPaymentConfirmed: (transactionId: string) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  messageId,
  messageData,
  onPaymentConfirmed,
  onClose,
}) => {
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messageData && messageId) {
      generatePixCharge();

      // Timer de 15 minutos
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [isOpen, messageData, messageId]);

  const generatePixCharge = async () => {
    if (!messageData || !messageId) return;

    setIsLoadingPix(true);
    setPixError(null);

    try {
      console.log('Generating PIX charge for message:', messageId);

      const { data, error } = await supabase.functions.invoke('create-pix-charge', {
        body: {
          messageId,
          phoneNumber: messageData.phoneNumber,
          amount: messageData.price,
          description: `Zap Elegante - ${messageData.mediaType === 'none' ? 'Mensagem de texto' : 'Mensagem com mídia'}`
        }
      });

      if (error) {
        console.error('Error creating PIX charge:', error);
        throw new Error('Erro ao gerar PIX');
      }

      console.log('PIX charge created:', data);

      setPixCode(data.pixCode);
      setQrCodeUrl(data.qrCodeUrl);
      
      // Extrair o chargeId corretamente da resposta
      const extractedChargeId = data.chargeId || data.charge?.globalID || `charge_${Date.now()}`;
      setChargeId(extractedChargeId);

      // Atualizar mensagem com dados do PIX
      await updateMessagePayment(messageId, {
        transaction_id: `PIX_${extractedChargeId}`,
        openpix_charge_id: extractedChargeId,
        pix_code: data.pixCode,
        qr_code_url: data.qrCodeUrl,
        status: 'pending_payment' as any
      });

    } catch (error) {
      console.error('Error generating PIX:', error);
      setPixError(error instanceof Error ? error.message : 'Erro ao gerar PIX');
      
      toast({
        title: "Erro ao gerar PIX",
        description: "Não foi possível gerar o código PIX. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPix(false);
    }
  };

  // Simular confirmação de pagamento após 30 segundos para demonstração
  useEffect(() => {
    if (chargeId && messageId) {
      const paymentTimer = setTimeout(async () => {
        try {
          const transactionId = `TXN_${Date.now()}`;
          
          await updateMessagePayment(messageId, {
            transaction_id: transactionId,
            openpix_charge_id: chargeId,
            pix_code: pixCode,
            qr_code_url: qrCodeUrl,
            status: 'paid'
          });

          toast({
            title: "Pagamento confirmado!",
            description: "Redirecionando para a página de confirmação...",
          });

          onPaymentConfirmed(transactionId);
        } catch (error) {
          console.error('Error confirming payment:', error);
        }
      }, 30000); // 30 segundos para demonstração

      return () => clearTimeout(paymentTimer);
    }
  }, [chargeId, messageId, pixCode, qrCodeUrl, onPaymentConfirmed]);

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast({
      title: "Código copiado!",
      description: "O código PIX foi copiado para a área de transferência.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!messageData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-hidden p-0">
        <div className="relative">
          {/* Header fixo */}
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-center text-xl font-bold text-gray-800">
              Pagamento via PIX
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Conteúdo scrollável */}
          <ScrollArea className="max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Resumo do pedido */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Total a pagar:</span>
                    <Badge className="bg-primary text-white text-lg px-3 py-1">
                      R$ {messageData.price.toFixed(2)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Número WhatsApp:</span>
                      <span className="font-mono">{messageData.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="capitalize">
                        {messageData.mediaType === 'none' ? 'Somente texto' : 
                         messageData.mediaType === 'photo' ? 'Foto + Texto' :
                         messageData.mediaType === 'audio' ? 'Áudio + Texto' :
                         'Vídeo + Texto'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
                <span className="text-sm">para pagamento</span>
              </div>

              {/* Loading ou Erro */}
              {isLoadingPix && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Gerando PIX...
                        </p>
                        <p className="text-xs text-blue-600">
                          Aguarde um momento
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {pixError && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Erro ao gerar PIX
                        </p>
                        <p className="text-xs text-red-600">
                          {pixError}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={generatePixCharge}
                      variant="outline"
                      className="w-full mt-3"
                    >
                      Tentar novamente
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* QR Code */}
              {qrCodeUrl && !isLoadingPix && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code PIX"
                      className="w-40 h-40 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Escaneie o QR Code com o app do seu banco
                  </p>
                </div>
              )}

              {/* Código PIX */}
              {pixCode && !isLoadingPix && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Ou use o código PIX:
                  </label>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="text-xs font-mono break-all text-gray-800 mb-3">
                      {pixCode}
                    </div>
                    <Button
                      onClick={copyPixCode}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar código PIX
                    </Button>
                  </div>
                </div>
              )}

              {/* Status */}
              {pixCode && !isLoadingPix && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-pulse">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Aguardando pagamento...
                        </p>
                        <p className="text-xs text-blue-600">
                          Você será redirecionado automaticamente após o pagamento
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Instruções */}
              {pixCode && !isLoadingPix && (
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>Abra o app do seu banco e selecione a opção PIX</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>Escaneie o QR Code ou cole o código PIX</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>Confirme o pagamento de R$ {messageData.price.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
