import React, { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp } from 'lucide-react';

const SuccessCounter: React.FC = () => {
  const [count, setCount] = useState(12847);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Simulate real-time counter updates
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance to increment
        setIsAnimating(true);
        setCount(prev => prev + 1);
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
      <div className="flex items-center justify-center gap-3 text-green-700">
        <div className="relative">
          <MessageSquare className="h-5 w-5" />
          {isAnimating && (
            <div className="absolute -top-1 -right-1">
              <TrendingUp className="h-3 w-3 text-green-600 animate-bounce" />
            </div>
          )}
        </div>
        <div className="text-center">
          <span className={`font-bold text-lg ${isAnimating ? 'animate-pulse text-green-600' : ''}`}>
            +{count.toLocaleString('pt-BR')}
          </span>
          <p className="text-sm text-green-600">mensagens enviadas com sucesso</p>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Atualizando em tempo real</span>
        </div>
      </div>
    </div>
  );
};

export default SuccessCounter;