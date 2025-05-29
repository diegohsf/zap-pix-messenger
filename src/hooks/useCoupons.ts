
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getAllCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon, 
  DiscountCoupon 
} from '@/services/couponService';

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cupons",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCoupon = async (couponData: Omit<DiscountCoupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>) => {
    try {
      const newCoupon = await createCoupon(couponData);
      setCoupons(prev => [newCoupon, ...prev]);
      toast({
        title: "Sucesso",
        description: "Cupom criado com sucesso!",
      });
      return newCoupon;
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar cupom",
        variant: "destructive",
      });
      throw error;
    }
  };

  const editCoupon = async (id: string, updates: Partial<DiscountCoupon>) => {
    try {
      const updatedCoupon = await updateCoupon(id, updates);
      setCoupons(prev => prev.map(coupon => 
        coupon.id === id ? updatedCoupon : coupon
      ));
      toast({
        title: "Sucesso",
        description: "Cupom atualizado com sucesso!",
      });
      return updatedCoupon;
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cupom",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeCoupon = async (id: string) => {
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(coupon => coupon.id !== id));
      toast({
        title: "Sucesso",
        description: "Cupom deletado com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar cupom",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return {
    coupons,
    isLoading,
    addCoupon,
    editCoupon,
    removeCoupon,
    refreshCoupons: fetchCoupons,
  };
};
