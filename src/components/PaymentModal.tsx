import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, CheckCircle, Clock, Smartphone, AlertCircle, CreditCard, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MessageData } from './MessageForm';
import { updateMessagePayment, getMessageById } from '@/services/messageService';
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
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pix' | 'card'>('pix');
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const { toast } = useToast();

  // Detectar mudança de preço e limpar PIX anterior
  useEffect(() => {
    if (messageData && messageData.price !== lastPrice) {
      console.log('Price changed from', lastPrice, 'to', messageData.price, '- clearing PIX data');
      // Limpar dados do PIX anterior quando o preço mudar
      setPixCode('');
      setQrCodeUrl('');
      setChargeId(null);
      setPixError(null);
      setLastPrice(messageData.price);
    }
  }, [messageData?.price, lastPrice]);

  useEffect(() => {
    if (isOpen && messageData && messageId) {
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

  // Verificar status do pagamento periodicamente
  useEffect(() => {
    if (!messageId || !isOpen) return;

    const checkPaymentStatus = async () => {
      try {
        console.log('Checking payment status for message:', messageId);
        const message = await getMessageById(messageId);
        
        // Para mensagens normais: status 'paid'
        // Para mensagens agendadas: status 'scheduled' + paid_at preenchido
        const isPaid = message && (
          (message.status === 'paid' && message.transaction_id) ||
          (message.status === 'scheduled' && message.paid_at && message.transaction_id)
        );
        
        if (isPaid) {
          console.log('Payment confirmed, redirecting...', message.transaction_id);
          
          // Disparar evento de compra no GA4
          if (typeof window !== 'undefined' && window.gtag && messageData) {
            window.gtag('event', 'purchase', {
              transaction_id: message.transaction_id,
              value: messageData.price,
              currency: 'BRL',
              items: [{
                item_id: `zap_${messageData.mediaType}`,
                item_name: `WhatsApp ${messageData.mediaType === 'none' ? 'Texto' : 
                           messageData.mediaType === 'photo' ? 'Foto' :
                           messageData.mediaType === 'audio' ? 'Áudio' : 'Vídeo'}`,
                category: 'whatsapp_message',
                quantity: 1,
                price: messageData.price
              }]
            });
          }
          
          const confirmationMessage = message.status === 'scheduled' 
            ? "Pagamento confirmado! Sua mensagem foi agendada com sucesso."
            : "Pagamento confirmado!";
            
          toast({
            title: confirmationMessage,
            description: "Redirecionando para a página de confirmação...",
          });

          // Redirecionar após confirmação do pagamento
          setTimeout(() => {
            onPaymentConfirmed(message.transaction_id!);
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Verificar imediatamente e depois a cada 5 segundos
    checkPaymentStatus();
    const statusInterval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(statusInterval);
  }, [messageId, isOpen, onPaymentConfirmed, toast, messageData]);

  const generatePixCharge = async () => {
    if (!messageData || !messageId) return;

    setIsLoadingPix(true);
    setPixError(null);
    
    // Limpar PIX anterior se existir
    setPixCode('');
    setQrCodeUrl('');
    setChargeId(null);

    try {
      console.log('Generating PIX charge for message:', messageId, 'with amount:', messageData.price);

      const { data, error } = await supabase.functions.invoke('create-pix-charge', {
        body: {
          messageId,
          phoneNumber: messageData.phoneNumber,
          amount: messageData.price,
          description: `Zap Elegante - ${messageData.mediaType === 'none' ? 'Mensagem de texto' : `Mensagem com ${messageData.mediaType}`}`
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

  const createStripeCheckout = async () => {
    if (!messageData || !messageId) return;

    setIsLoadingStripe(true);
    setStripeError(null);

    try {
      console.log('Creating Stripe checkout for message:', messageId);

      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          messageId,
          amount: messageData.price,
          description: `Zap Elegante - ${messageData.mediaType === 'none' ? 'Mensagem de texto' : `Mensagem com ${messageData.mediaType}`}`,
          phoneNumber: messageData.phoneNumber
        }
      });

      if (error) {
        console.error('Error creating Stripe checkout:', error);
        throw new Error('Erro ao criar checkout');
      }

      console.log('Stripe checkout created:', data);

      // Redirecionar para o Stripe Checkout em nova aba
      if (data.url) {
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecionado para o pagamento",
          description: "Complete o pagamento na nova aba aberta.",
        });
      }

    } catch (error) {
      console.error('Error creating Stripe checkout:', error);
      setStripeError(error instanceof Error ? error.message : 'Erro ao criar checkout');
      
      toast({
        title: "Erro ao processar cartão",
        description: "Não foi possível processar o pagamento com cartão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStripe(false);
    }
  };

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
      <DialogContent className="w-[95vw] max-w-md mx-auto h-[90vh] max-h-[90vh] p-0 gap-0">
        {/* Header fixo */}
        <DialogHeader className="p-4 pb-3 border-b bg-white">
          <DialogTitle className="text-center text-lg font-bold text-gray-800 pr-8">
            Escolha a forma de pagamento
          </DialogTitle>
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {/* Resumo do pedido */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Total a pagar:</span>
                  <Badge className="bg-primary text-white text-base px-2 py-1">
                    R$ {messageData.price.toFixed(2)}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>WhatsApp:</span>
                    <span className="font-mono text-xs break-all">{messageData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="capitalize text-xs">
                      {messageData.mediaType === 'none' ? 'Texto' : 
                       messageData.mediaType === 'photo' ? 'Foto' :
                       messageData.mediaType === 'audio' ? 'Áudio' :
                       'Vídeo'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-orange-600 py-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-base font-bold">{formatTime(timeLeft)}</span>
              <span className="text-xs">restantes</span>
            </div>

            {/* Tabs para escolher método de pagamento */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pix' | 'card')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pix" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  PIX
                </TabsTrigger>
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Cartão
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pix" className="space-y-4 mt-4">

                {/* Loading ou Erro PIX */}
                {isLoadingPix && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
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

                {/* Botão para gerar PIX */}
                {!pixCode && !isLoadingPix && (
                  <Button
                    onClick={generatePixCharge}
                    className="w-full flex items-center gap-2 h-12"
                    disabled={isLoadingPix}
                  >
                    <QrCode className="h-5 w-5" />
                    Gerar PIX
                  </Button>
                )}

                {pixError && (
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <div className="flex-1">
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
                        className="w-full mt-2 text-xs h-8"
                      >
                        Tentar novamente
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* QR Code PIX */}
                {qrCodeUrl && !isLoadingPix && (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code PIX"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3 font-medium">
                      Escaneie com o app do seu banco
                    </p>
                  </div>
                )}

                {/* Código PIX */}
                {pixCode && !isLoadingPix && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Ou copie o código PIX:
                    </label>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="text-xs font-mono break-all text-gray-800 mb-3 max-h-20 overflow-y-auto">
                        {pixCode}
                      </div>
                      <Button
                        onClick={copyPixCode}
                        variant="outline"
                        className="w-full flex items-center gap-2 h-9 text-sm"
                      >
                        <Copy className="h-3 w-3" />
                        Copiar código PIX
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status PIX */}
                {pixCode && !isLoadingPix && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Aguardando pagamento...
                          </p>
                          <p className="text-xs text-blue-600">
                            Você será redirecionado automaticamente
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Instruções PIX */}
                {pixCode && !isLoadingPix && (
                  <div className="text-xs text-gray-600 space-y-2 pb-4">
                    <div className="flex items-start gap-2">
                      <Smartphone className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <p>Abra o app do seu banco e selecione PIX</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <p>Escaneie o QR Code ou cole o código</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <p>Confirme o pagamento de R$ {messageData.price.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="card" className="space-y-4 mt-4">
                {/* Seção de Cartão */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-semibold text-blue-800 mb-2">Pagamento com Cartão</h3>
                    <p className="text-sm text-blue-600 mb-4">
                      Você será redirecionado para o Stripe em uma nova aba para completar o pagamento com segurança.
                    </p>
                    
                    {/* Loading Stripe */}
                    {isLoadingStripe && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <span className="text-sm text-blue-700">Processando...</span>
                      </div>
                    )}

                    {/* Erro Stripe */}
                    {stripeError && (
                      <Card className="bg-red-50 border-red-200 mb-4">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <p className="text-sm text-red-800">{stripeError}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Botão de Pagamento com Cartão */}
                    <Button
                      onClick={createStripeCheckout}
                      disabled={isLoadingStripe}
                      className="w-full flex items-center gap-2 h-12"
                    >
                      <CreditCard className="h-5 w-5" />
                      {isLoadingStripe ? 'Processando...' : 'Pagar com Cartão'}
                    </Button>

                    {/* Informações de segurança */}
                    <div className="mt-4 text-xs text-gray-600 space-y-1">
                      <p>🔒 Pagamento seguro via Stripe</p>
                      <p>💳 Aceitamos Visa, Mastercard e Elo</p>
                      <p>✅ Aprovação instantânea</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
