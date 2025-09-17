
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Clock, Camera, Mic, Video, TrendingUp } from 'lucide-react';

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
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-red-50/30 to-pink-50/50 rounded-2xl md:rounded-3xl -z-10"></div>
      
      <Card className="shadow-xl md:shadow-2xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl md:rounded-3xl overflow-hidden">
        {/* Beautiful Header - Mobile Optimized */}
        <div className="relative bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-white/10 rounded-full -translate-y-24 translate-x-24 md:-translate-y-48 md:translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-white/5 rounded-full translate-y-16 -translate-x-16 md:translate-y-32 md:-translate-x-32"></div>
          
          <CardHeader className="text-center py-6 md:py-12 px-4 relative z-10">
            <div className="flex items-center justify-center mb-3 md:mb-4">
              <div className="bg-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-4xl font-bold mb-2">
              🔥 Envios Mais Quentes
            </CardTitle>
            <p className="text-white/90 text-sm md:text-lg max-w-2xl mx-auto px-4">
              Últimas mensagens enviadas com sucesso
            </p>
          </CardHeader>
        </div>

        <CardContent className="p-4 md:p-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-2xl shadow-lg inline-block mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              </div>
              <p className="text-gray-600 font-medium">Carregando mensagens...</p>
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {messages.map((message, index) => {
                const mediaTag = getMediaTag(message.media_type);
                
                return (
                  <div 
                    key={index}
                    className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl md:rounded-2xl border-0 shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all duration-300 hover:scale-[1.01] md:hover:scale-[1.02] overflow-hidden"
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex items-start gap-3 md:gap-4 mb-3">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 md:p-3 rounded-lg md:rounded-xl text-white shadow-lg flex-shrink-0">
                          <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-sm md:text-base font-medium leading-relaxed">
                            "{truncateText(message.message_text, 100)}"
                          </p>
                        </div>
                      </div>
                      
                      {mediaTag && (
                        <div className="ml-10 md:ml-0">
                          <div className="bg-white/60 rounded-lg md:rounded-xl p-3 md:p-4 backdrop-blur-sm border border-gray-200/50">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium ${mediaTag.color}`}>
                              <mediaTag.icon className="h-3 w-3 md:h-4 md:w-4" />
                              {mediaTag.text}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-2xl mb-6 inline-block">
                <MessageSquare className="h-12 w-12 md:h-16 md:w-16 text-orange-400 mx-auto" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                Nenhuma mensagem enviada ainda
              </h3>
              <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto">
                As mensagens aparecerão aqui após serem pagas e enviadas com sucesso
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentMessages;
