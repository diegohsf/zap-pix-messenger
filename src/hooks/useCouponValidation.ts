
import { useState } from 'react';
import { validateCoupon, incrementCouponUsage, CouponValidationResult } from '@/services/couponService';
import { useToast } from '@/hooks/use-toast';
import { usePromotionSettings } from '@/hooks/usePromotionSettings';

export const useCouponValidation = () => {
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const { settings: promotionSettings } = usePromotionSettings();

  const validateAndApplyCoupon = async (code: string, orderValue: number): Promise<boolean> => {
    if (!code.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código de cupom",
        variant: "destructive",
      });
      return false;
    }

    // Verificar se as promoções estão ativadas
    if (promotionSettings?.is_active) {
      toast({
        title: "Cupom não disponível",
        description: "Não é possível usar cupons enquanto a promoção está ativa. Aproveite os descontos promocionais!",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);

    try {
      const result = await validateCoupon(code, orderValue);
      
      if (result.isValid) {
        setAppliedCoupon(result);
        toast({
          title: "Cupom aplicado!",
          description: `Desconto de R$ ${result.discountAmount?.toFixed(2)} aplicado com sucesso!`,
        });
        return true;
      } else {
        toast({
          title: "Cupom inválido",
          description: result.error,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: "Erro",
        description: "Erro ao validar cupom. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Cupom removido",
      description: "O cupom foi removido do pedido.",
    });
  };

  const calculateFinalPrice = (originalPrice: number): { originalPrice: number; discountAmount: number; finalPrice: number } => {
    if (!appliedCoupon || !appliedCoupon.isValid) {
      return {
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice
      };
    }

    const discountAmount = appliedCoupon.discountAmount || 0;
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return {
      originalPrice,
      discountAmount,
      finalPrice
    };
  };

  // Função para confirmar o uso do cupom após pagamento bem-sucedido
  const confirmCouponUsage = async (): Promise<void> => {
    if (appliedCoupon?.coupon?.id) {
      try {
        await incrementCouponUsage(appliedCoupon.coupon.id);
        console.log('Uso do cupom incrementado com sucesso');
      } catch (error) {
        console.error('Erro ao incrementar uso do cupom:', error);
      }
    }
  };

  return {
    appliedCoupon,
    isValidating,
    validateAndApplyCoupon,
    removeCoupon,
    calculateFinalPrice,
    confirmCouponUsage,
    isPromotionActive: promotionSettings?.is_active || false,
  };
};
