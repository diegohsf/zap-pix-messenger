
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
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      // Using any to bypass TypeScript until the table is properly typed
      const { data, error } = await (supabase as any)
        .from('promotion_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching promotion settings:', error);
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching promotion settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePromotionStatus = async (isActive: boolean) => {
    if (!settings) return;

    setIsUpdating(true);
    try {
      // Using any to bypass TypeScript until the table is properly typed
      const { error } = await (supabase as any)
        .from('promotion_settings')
        .update({ is_active: isActive })
        .eq('id', settings.id);

      if (error) {
        throw error;
      }

      setSettings(prev => prev ? { ...prev, is_active: isActive } : null);
      
      toast({
        title: isActive ? "Promoção ativada!" : "Promoção desativada!",
        description: isActive 
          ? "50% de desconto nos anexos está ativo" 
          : "Promoção foi desativada",
      });

    } catch (error) {
      console.error('Error updating promotion:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a promoção",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    isUpdating,
    updatePromotionStatus,
    refetch: fetchSettings,
  };
};
