import React from 'react';
import { Heart, Search, AlertTriangle } from 'lucide-react';

const CheatingBanner: React.FC = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '5511918729262';
    const message = 'quero saber se meu marido ou esposa está me traindo!';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-pink-600 to-red-700 text-white py-6 px-6 rounded-xl mb-8 shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300" onClick={handleWhatsAppClick}>
      <div className="absolute inset-0 bg-gradient-to-r from-red-700/30 via-pink-700/30 to-red-800/30"></div>
      <div className="relative flex items-center justify-center gap-4">
        <AlertTriangle className="h-8 w-8 text-yellow-300 animate-bounce" />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            💔 Saiba se seu marido ou esposa está te traindo! 💔
          </h2>
          <p className="text-lg opacity-90 flex items-center justify-center gap-2 mb-3">
            <Search className="h-5 w-5" />
            Descubra a verdade sobre seu relacionamento
            <Heart className="h-5 w-5" />
          </p>
          <div className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full transition-colors duration-200 inline-flex items-center gap-2 font-semibold">
            💬 Clique aqui para conversar no WhatsApp
          </div>
        </div>
        <AlertTriangle className="h-8 w-8 text-yellow-300 animate-bounce" />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 animate-pulse"></div>
    </div>
  );
};

export default CheatingBanner;