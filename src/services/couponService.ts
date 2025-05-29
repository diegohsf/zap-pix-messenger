
import { supabase } from '@/integrations/supabase/client';

export interface DiscountCoupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  is_active: boolean;
  usage_limit?: number;
  used_count: number;
  valid_from?: string;
  valid_until?: string;
  min_order_value: number;
  created_at: string;
  updated_at: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  error?: string;
  coupon?: DiscountCoupon;
  discountAmount?: number;
}

export const getAllCoupons = async (): Promise<DiscountCoupon[]> => {
  const { data, error } = await supabase
    .from('discount_coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coupons:', error);
    throw new Error('Erro ao buscar cupons');
  }

  return (data || []) as DiscountCoupon[];
};

export const createCoupon = async (couponData: Omit<DiscountCoupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>): Promise<DiscountCoupon> => {
  const { data, error } = await supabase
    .from('discount_coupons')
    .insert(couponData)
    .select()
    .single();

  if (error) {
    console.error('Error creating coupon:', error);
    throw new Error('Erro ao criar cupom');
  }

  return data as DiscountCoupon;
};

export const updateCoupon = async (id: string, updates: Partial<DiscountCoupon>): Promise<DiscountCoupon> => {
  const { data, error } = await supabase
    .from('discount_coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating coupon:', error);
    throw new Error('Erro ao atualizar cupom');
  }

  return data as DiscountCoupon;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('discount_coupons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting coupon:', error);
    throw new Error('Erro ao deletar cupom');
  }
};

export const validateCoupon = async (code: string, orderValue: number): Promise<CouponValidationResult> => {
  if (!code.trim()) {
    return { isValid: false, error: 'Código do cupom é obrigatório' };
  }

  const { data: coupon, error } = await supabase
    .from('discount_coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    return { isValid: false, error: 'Cupom não encontrado ou inativo' };
  }

  const typedCoupon = coupon as DiscountCoupon;

  // Verificar se o cupom ainda é válido por data
  const now = new Date();
  if (typedCoupon.valid_from && new Date(typedCoupon.valid_from) > now) {
    return { isValid: false, error: 'Cupom ainda não está válido' };
  }

  if (typedCoupon.valid_until && new Date(typedCoupon.valid_until) < now) {
    return { isValid: false, error: 'Cupom expirado' };
  }

  // Verificar limite de uso
  if (typedCoupon.usage_limit && typedCoupon.used_count >= typedCoupon.usage_limit) {
    return { isValid: false, error: 'Cupom esgotado' };
  }

  // Verificar valor mínimo do pedido
  if (orderValue < typedCoupon.min_order_value) {
    return { 
      isValid: false, 
      error: `Valor mínimo do pedido deve ser R$ ${typedCoupon.min_order_value.toFixed(2)}` 
    };
  }

  // Calcular desconto
  let discountAmount = 0;
  if (typedCoupon.discount_type === 'percentage') {
    discountAmount = (orderValue * typedCoupon.discount_value) / 100;
  } else {
    discountAmount = Math.min(typedCoupon.discount_value, orderValue);
  }

  return {
    isValid: true,
    coupon: typedCoupon,
    discountAmount
  };
};

export const incrementCouponUsage = async (couponId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('increment-coupon-usage', {
    body: { coupon_id: couponId }
  });

  if (error) {
    console.error('Error incrementing coupon usage:', error);
  }
};
