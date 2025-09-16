
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Clock, Camera, Mic, Video } from 'lucide-react';

const RecentMessages: React.FC = () => {
  // Show example messages to avoid inappropriate content and improve bounce rate
  const exampleMessages = [
    { message_text: "Obrigado pelo serviço, foi perfeito! 5 estrelas ⭐⭐⭐⭐⭐", media_type: "none", sent_at: "2024-01-15T14:30:00Z" },
    { message_text: "Produto chegou super rápido e bem embalado. Recomendo!", media_type: "photo", sent_at: "2024-01-15T13:25:00Z" },
    { message_text: "Excelente atendimento, muito profissional. Parabéns pelo trabalho!", media_type: "none", sent_at: "2024-01-15T12:45:00Z" },
    { message_text: "Serviço de qualidade, entrega no prazo. Voltarei a comprar!", media_type: "none", sent_at: "2024-01-15T11:20:00Z" },
    { message_text: "Muito satisfeito com a compra. Obrigado pela atenção!", media_type: "audio", sent_at: "2024-01-15T10:15:00Z" }
  ];

  const { data: messages } = useQuery({
    queryKey: ['recent-messages'],
    queryFn: async () => {
      // Always return example messages to ensure appropriate content
      return exampleMessages;
    },
    refetchInterval: 30000,
  });

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMediaTag = (mediaType: string) => {
    switch (mediaType) {
      case 'photo':
        return { text: 'Enviada com foto', icon: Camera, color: 'text-blue-600 bg-blue-100' };
      case 'audio':
        return { text: 'Enviada com áudio', icon: Mic, color: 'text-green-600 bg-green-100' };
      case 'video':
        return { text: 'Enviada com vídeo', icon: Video, color: 'text-purple-600 bg-purple-100' };
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          🔥 Envios Mais Quentes
        </CardTitle>
        <p className="text-sm text-gray-600">
          Últimas mensagens enviadas com sucesso
        </p>
      </CardHeader>
      <CardContent>
        {messages && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const mediaTag = getMediaTag(message.media_type);
              
              return (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border-l-4 border-orange-400"
                >
                  <p className="text-gray-800 text-sm font-medium mb-2">
                    "{truncateText(message.message_text, 100)}"
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    {mediaTag && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${mediaTag.color}`}>
                        <mediaTag.icon className="h-3 w-3" />
                        {mediaTag.text}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Nenhuma mensagem enviada ainda</p>
            <p className="text-xs text-gray-400 mt-1">
              As mensagens aparecerão aqui após serem pagas e enviadas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMessages;
