
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { SavedMessage } from '@/services/messageService';
import { LogOut, DollarSign, Clock, CheckCircle, ExternalLink, Zap, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePromotionSettings } from '@/hooks/usePromotionSettings';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalRevenue: 0
  });
  const { toast } = useToast();
  const { settings: promotionSettings, isLoading: promotionLoading, updateSettings } = usePromotionSettings();

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMessages(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (messages: SavedMessage[]) => {
    const paid = messages.filter(msg => msg.status === 'paid');
    const pending = messages.filter(msg => msg.status === 'pending_payment');
    
    const totalPaid = paid.reduce((sum, msg) => sum + msg.price, 0);
    const totalPending = pending.reduce((sum, msg) => sum + msg.price, 0);
    const totalRevenue = totalPaid + totalPending;

    setStats({
      totalPaid,
      totalPending,
      totalRevenue
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    onLogout();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>;
      case 'pending_payment':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMediaTypeBadge = (mediaType: string) => {
    if (mediaType === 'none') return null;
    
    const colors = {
      photo: 'bg-blue-500',
      audio: 'bg-purple-500',
      video: 'bg-red-500'
    };
    
    return (
      <Badge className={colors[mediaType as keyof typeof colors] || 'bg-gray-500'}>
        {mediaType}
      </Badge>
    );
  };

  const handlePromotionToggle = async (isActive: boolean) => {
    await updateSettings({ is_active: isActive });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (isLoading || promotionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalPaid)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.totalPending)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>

          {/* Promotion Settings Card */}
          <Card className={promotionSettings?.is_active ? "border-orange-200 bg-orange-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promoção</CardTitle>
              <Zap className={`h-4 w-4 ${promotionSettings?.is_active ? 'text-orange-600' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-lg font-bold ${promotionSettings?.is_active ? 'text-orange-600' : 'text-gray-600'}`}>
                    {promotionSettings?.is_active ? 'ATIVA' : 'INATIVA'}
                  </div>
                  {promotionSettings?.is_active && (
                    <div className="text-xs text-orange-600">
                      {promotionSettings?.discount_percentage}% OFF
                    </div>
                  )}
                </div>
                <Switch
                  checked={promotionSettings?.is_active || false}
                  onCheckedChange={handlePromotionToggle}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens</CardTitle>
            <Button onClick={fetchMessages} variant="outline" size="sm">
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Mídia</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pago em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="text-sm">
                        {formatDate(message.created_at)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {message.phone_number}
                      </TableCell>
                      <TableCell className="max-w-lg">
                        <div className="break-words">
                          {message.message_text}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMediaTypeBadge(message.media_type)}
                          {message.media_file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 gap-2 hover:bg-blue-50 hover:border-blue-300"
                              onClick={() => window.open(message.media_file_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Ver mídia
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(message.price)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(message.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {message.paid_at ? formatDate(message.paid_at) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
