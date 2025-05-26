
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, Clock, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MessageData } from './MessageForm';

interface PaymentModalProps {
  isOpen: boolean;
  messageData: MessageData | null;
  onPaymentConfirmed: (transactionId: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  messageData,
  onPaymentConfirmed,
}) => {
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messageData) {
      // Simulação de geração do PIX
      const mockPixCode = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${messageData.price.toFixed(2)}5802BR5925ZAP ELEGANTE LTDA6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setPixCode(mockPixCode);
      
      // URL do QR Code (simulação)
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockPixCode)}`);

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

      // Simulação de confirmação de pagamento após 10 segundos (para demonstração)
      const paymentTimer = setTimeout(() => {
        const transactionId = `TXN_${Date.now()}`;
        onPaymentConfirmed(transactionId);
      }, 10000);

      return () => {
        clearInterval(timer);
        clearTimeout(paymentTimer);
      };
    }
  }, [isOpen, messageData, onPaymentConfirmed]);

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
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-800">
            Pagamento via PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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

          {/* QR Code */}
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
              <img
                src={qrCodeUrl}
                alt="QR Code PIX"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Escaneie o QR Code com o app do seu banco
            </p>
          </div>

          {/* Código PIX */}
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

          {/* Status */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="animate-pulse-slow">
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

          {/* Instruções */}
          <div className="text-xs text-gray-600 space-y-1">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
