
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PromotionSettings {
  id: string;
  is_active: boolean;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
}

export const usePromotionSettings = () => {
  const [settings, setSettings] = useState<PromotionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('promotion_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Erro ao buscar configurações de promoção:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<PromotionSettings>) => {
    if (!settings) return;

    try {
      const { data, error } = await (supabase as any)
        .from('promotion_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      
      setSettings(data);
      toast({
        title: "Configurações atualizadas",
        description: updates.is_active ? "Promoção ativada!" : "Promoção desativada!",
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações de promoção",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    updateSettings,
    refreshSettings: fetchSettings,
  };
};
