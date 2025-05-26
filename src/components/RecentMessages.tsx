
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Clock } from 'lucide-react';

const RecentMessages: React.FC = () => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['recent-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('message_text, sent_at')
        .eq('status', 'paid')
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent messages:', error);
        throw error;
      }

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
            {messages.map((message, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border-l-4 border-orange-400"
              >
                <p className="text-gray-800 text-sm font-medium mb-1">
                  "{truncateText(message.message_text, 100)}"
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(message.sent_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Nenhuma mensagem enviada ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMessages;
