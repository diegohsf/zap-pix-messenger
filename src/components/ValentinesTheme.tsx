
import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

const ValentinesTheme: React.FC = () => {
  return (
    <>
      {/* Floating Hearts Animation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <Heart
            key={i}
            className={`absolute text-pink-300 opacity-20 animate-bounce`}
            size={20 + Math.random() * 20}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Valentine's Banner */}
      <div className="relative bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 text-white py-6 px-6 mb-8 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/30 via-red-600/30 to-pink-600/30"></div>
        <div className="relative flex items-center justify-center gap-4">
          <Heart className="h-8 w-8 text-pink-200 animate-pulse fill-current" />
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">💕 Dia dos Namorados 💕</h2>
            <p className="text-lg opacity-90">
              Faltam apenas 6 dias! Envie sua mensagem de amor especial 💘
            </p>
            <p className="text-sm mt-1 opacity-80">
              Declare seu amor da forma mais criativa! ❤️
            </p>
          </div>
          <Sparkles className="h-8 w-8 text-yellow-200 animate-spin" />
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-2 left-4 text-2xl animate-bounce">💖</div>
        <div className="absolute top-4 right-6 text-xl animate-pulse">💝</div>
        <div className="absolute bottom-2 left-8 text-lg animate-bounce" style={{animationDelay: '1s'}}>💕</div>
        <div className="absolute bottom-3 right-4 text-2xl animate-pulse" style={{animationDelay: '0.5s'}}>💘</div>
      </div>
    </>
  );
};

export default ValentinesTheme;
