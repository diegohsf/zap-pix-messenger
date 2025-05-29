
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Clock, Camera, Mic, Video } from 'lucide-react';

const RecentMessages: React.FC = () => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['recent-messages'],
    queryFn: async () => {
      console.log('🔍 Buscando mensagens recentes...');
      
      // Primeiro, vamos verificar se há mensagens com status 'paid'
      const { data: paidMessages, error: paidError } = await supabase
        .from('messages')
        .select('message_text, sent_at, status, paid_at, media_type')
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('📊 Mensagens com status paid:', paidMessages);

      if (paidError) {
        console.error('❌ Erro ao buscar mensagens pagas:', paidError);
      }

      // Se não houver mensagens pagas com sent_at, vamos buscar mensagens pagas em geral
      if (!paidMessages || paidMessages.length === 0 || !paidMessages.some(m => m.sent_at)) {
        console.log('⚠️ Não há mensagens com sent_at, buscando mensagens pagas por paid_at...');
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('messages')
          .select('message_text, paid_at, status, media_type')
          .eq('status', 'paid')
          .not('paid_at', 'is', null)
          .order('paid_at', { ascending: false })
          .limit(5);

        if (fallbackError) {
          console.error('❌ Erro ao buscar mensagens por paid_at:', fallbackError);
          throw fallbackError;
        }

        console.log('✅ Mensagens encontradas por paid_at:', fallbackData);

        // Mapear paid_at para sent_at para compatibilidade
        return (fallbackData || []).map(msg => ({
          message_text: msg.message_text,
          sent_at: msg.paid_at,
          media_type: msg.media_type
        }));
      }

      // Usar a query original se houver mensagens com sent_at
      const { data, error } = await supabase
        .from('messages')
        .select('message_text, sent_at, media_type')
        .eq('status', 'paid')
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('❌ Erro ao buscar mensagens por sent_at:', error);
        throw error;
      }

      console.log('✅ Mensagens encontradas por sent_at:', data);
      return data || [];
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
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
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando mensagens...</p>
          </div>
        ) : messages && messages.length > 0 ? (
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
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(message.sent_at)}</span>
                    </div>
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
