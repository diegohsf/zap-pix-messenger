import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Share2, Copy, ArrowLeft, Smartphone, AlertCircle, Image, Video, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMessageByTransactionId, SavedMessage } from '@/services/messageService';

const ConfirmationPage: React.FC = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  const [messageData, setMessageData] = useState<SavedMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessageData = async () => {
    if (!transactionId) {
      setError('ID da transação não encontrado');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Loading message data for transaction:', transactionId);
      const message = await getMessageByTransactionId(transactionId);
      
      if (!message) {
        setError('Transação não encontrada');
        setIsLoading(false);
        return;
      }

      console.log('Message data loaded:', message);
      setMessageData(message);

      // Gerar URL de compartilhamento
      const currentUrl = window.location.href;
      setShareUrl(currentUrl);

    } catch (error) {
      console.error('Error loading message data:', error);
      setError('Erro ao carregar dados da transação');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessageData();
  }, [transactionId]);

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

  const getMediaTypeDisplay = (mediaType: string) => {
    switch (mediaType) {
      case 'none': return 'Somente texto';
      case 'photo': return 'Foto + Texto';
      case 'audio': return 'Áudio + Texto';
      case 'video': return 'Vídeo + Texto';
      default: return 'Desconhecido';
    }
  };

  const renderMediaPreview = () => {
    if (!messageData?.media_file_url || messageData.media_type === 'none') {
      return null;
    }

    const mediaUrl = messageData.media_file_url;

    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          {messageData.media_type === 'photo' && <Image className="h-5 w-5 text-blue-600" />}
          {messageData.media_type === 'video' && <Video className="h-5 w-5 text-purple-600" />}
          {messageData.media_type === 'audio' && <Mic className="h-5 w-5 text-green-600" />}
          <h4 className="font-medium text-gray-800 capitalize">
            {messageData.media_type === 'photo' ? 'Foto enviada:' : 
             messageData.media_type === 'video' ? 'Vídeo enviado:' : 
             'Áudio enviado:'}
          </h4>
        </div>

        <div className="rounded-lg overflow-hidden bg-white border border-gray-200">
          {messageData.media_type === 'photo' && (
            <img 
              src={mediaUrl} 
              alt="Foto enviada" 
              className="max-w-full h-auto max-h-80 object-contain mx-auto block"
              onError={(e) => {
                console.error('Erro ao carregar imagem:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          {messageData.media_type === 'video' && (
            <video 
              controls 
              className="max-w-full h-auto max-h-80 mx-auto block"
              onError={(e) => {
                console.error('Erro ao carregar vídeo:', e);
              }}
            >
              <source src={mediaUrl} type="video/mp4" />
              <source src={mediaUrl} type="video/webm" />
              <source src={mediaUrl} type="video/ogg" />
              Seu navegador não suporta o elemento de vídeo.
            </video>
          )}

          {messageData.media_type === 'audio' && (
            <div className="p-4">
              <audio 
                controls 
                className="w-full"
                onError={(e) => {
                  console.error('Erro ao carregar áudio:', e);
                }}
              >
                <source src={mediaUrl} type="audio/wav" />
                <source src={mediaUrl} type="audio/mp3" />
                <source src={mediaUrl} type="audio/ogg" />
                Seu navegador não suporta o elemento de áudio.
              </audio>
            </div>
          )}
        </div>

        {messageData.media_file_name && (
          <div className="mt-2 text-xs text-gray-500">
            Nome do arquivo: {messageData.media_file_name}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados da transação...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !messageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Button>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-800 mb-2">Erro</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600 text-white">
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            Sua mensagem foi enviada com sucesso
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
                  ✅ {messageData.status === 'paid' ? 'Pago' : messageData.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>ID da Transação:</span>
                  <span className="font-mono text-xs">{messageData.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Número WhatsApp:</span>
                  <span className="font-mono">{messageData.phone_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo de Mensagem:</span>
                  <span>{getMediaTypeDisplay(messageData.media_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor Pago:</span>
                  <span className="font-semibold">R$ {messageData.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data do Pagamento:</span>
                  <span>{messageData.paid_at ? new Date(messageData.paid_at).toLocaleString('pt-BR') : 'N/A'}</span>
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
                <li>• Em breve ela será entregue no WhatsApp: {messageData.phone_number}</li>
                <li>• Você pode compartilhar esta confirmação</li>
                {messageData.media_file_url && (
                  <li>• Arquivo de mídia foi enviado com sucesso</li>
                )}
              </ul>
            </div>

            {/* Exibir mídia enviada */}
            {renderMediaPreview()}

            {/* Exibir texto da mensagem */}
            {messageData.message_text && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Mensagem de texto:</h4>
                <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">{messageData.message_text}</p>
              </div>
            )}

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
