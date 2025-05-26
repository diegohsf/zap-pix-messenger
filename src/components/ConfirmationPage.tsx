
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Share2, Copy, ArrowLeft, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConfirmationPage: React.FC = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // Gera a URL única para compartilhamento
    const currentUrl = window.location.href;
    setShareUrl(currentUrl);

    // Simula o envio dos dados para o webhook do n8n
    const sendToWebhook = async () => {
      try {
        console.log('Enviando dados para webhook n8n:', {
          transactionId,
          status: 'paid',
          webhook_url: 'https://webhook.golawtech.com.br/webhook/9d0cf2ea-019d-4e28-b147-f542b27a6cc9'
        });

        // Aqui seria feita a chamada real para o webhook
        // await fetch('https://webhook.golawtech.com.br/webhook/9d0cf2ea-019d-4e28-b147-f542b27a6cc9', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(webhookData)
        // });

        toast({
          title: "Dados enviados!",
          description: "Informações foram enviadas para processamento.",
        });
      } catch (error) {
        console.error('Erro ao enviar para webhook:', error);
      }
    };

    if (transactionId) {
      sendToWebhook();
    }
  }, [transactionId, toast]);

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copiado!",
      description: "URL de confirmação copiada para a área de transferência.",
    });
  };

  const shareUrl_fn = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Zap Elegante - Pagamento Confirmado',
        text: 'Pagamento confirmado no Zap Elegante',
        url: shareUrl,
      });
    } else {
      copyShareUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Button>

        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-500 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pagamento Confirmado!
          </h1>
          <p className="text-lg text-gray-600">
            Sua mensagem foi processada com sucesso
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800 flex items-center justify-center gap-2">
              <Smartphone className="h-6 w-6 text-primary" />
              Detalhes da Transação
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Badge className="bg-green-500 text-white">
                  ✅ Pago
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>ID da Transação:</span>
                  <span className="font-mono text-xs">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span>{new Date().toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span>PIX</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">
                ✨ O que acontece agora?
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Sua mensagem foi enviada para processamento</li>
                <li>• Em breve ela será entregue no WhatsApp informado</li>
                <li>• Você pode compartilhar esta confirmação</li>
              </ul>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Compartilhar confirmação:
              </label>
              
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                  <div className="text-xs font-mono break-all text-gray-800">
                    {shareUrl}
                  </div>
                </div>
                
                <Button
                  onClick={copyShareUrl}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={shareUrl_fn}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar confirmação
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-4">
                Precisa enviar outra mensagem?
              </p>
              
              <Button
                onClick={() => navigate('/')}
                className="bg-primary hover:bg-primary-hover text-white px-8"
              >
                💬 Enviar Nova Mensagem
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600">⚠️</div>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Importante:</p>
                <p>
                  Mantenha esta confirmação salva. Ela é o comprovante de que 
                  sua mensagem foi enviada. O processamento pode levar alguns minutos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmationPage;
