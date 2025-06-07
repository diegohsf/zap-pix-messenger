
import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

const ValentinesTheme: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background com gradiente romântico */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-red-50 to-rose-50 opacity-80" />
      
      {/* Corações flutuantes animados */}
      <div className="absolute inset-0 pointer-events-none">
        <Heart className="absolute top-10 left-10 text-pink-300 w-6 h-6 animate-pulse opacity-60" />
        <Heart className="absolute top-32 right-20 text-red-300 w-4 h-4 animate-bounce opacity-50" />
        <Heart className="absolute bottom-40 left-1/4 text-rose-300 w-5 h-5 animate-pulse opacity-70" />
        <Heart className="absolute top-20 right-1/3 text-pink-400 w-3 h-3 animate-bounce opacity-60" />
        <Sparkles className="absolute bottom-20 right-10 text-pink-300 w-5 h-5 animate-pulse opacity-50" />
        <Sparkles className="absolute top-40 left-1/3 text-rose-300 w-4 h-4 animate-bounce opacity-60" />
      </div>

      {/* Banner principal */}
      <div className="relative z-10 text-center py-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <Heart className="text-red-500 w-8 h-8 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent">
            Dia dos Namorados
          </h1>
          <Heart className="text-red-500 w-8 h-8 animate-pulse" />
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mx-4 md:mx-8 shadow-lg border border-pink-200">
          <p className="text-xl text-gray-700 mb-2">
            💕 Faltam apenas <span className="font-bold text-red-500">6 dias</span> para o Dia dos Namorados! 💕
          </p>
          <p className="text-lg text-gray-600">
            Envie uma mensagem especial e surpreenda quem você ama! 🌹
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValentinesTheme;
