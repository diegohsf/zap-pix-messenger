
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';

interface PromotionBannerProps {
  isActive: boolean;
  discountPercentage: number;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({ isActive, discountPercentage }) => {
  if (!isActive) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-4 px-6 rounded-lg mb-6 animate-pulse shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="relative flex items-center justify-center gap-3">
        <Sparkles className="h-6 w-6 text-yellow-300 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold mb-1">🔥 PROMOÇÃO ATIVA 🔥</h2>
          <p className="text-sm opacity-90">
            {discountPercentage}% OFF em todas as mídias (fotos, áudios e vídeos)!
          </p>
        </div>
        <Zap className="h-6 w-6 text-yellow-300 animate-bounce" />
      </div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse"></div>
    </div>
  );
};

export default PromotionBanner;
