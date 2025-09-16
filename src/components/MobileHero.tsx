import React from 'react';
import { MessageSquare, CheckCircle, Zap, Shield } from 'lucide-react';
import SuccessCounter from './SuccessCounter';

const MobileHero: React.FC = () => {
  return (
    <section className="py-8 px-4 text-center">
      <div className="max-w-sm mx-auto">
        {/* Compact Hero */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
          WhatsApp <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Anônimo</span>
        </h1>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          Envie mensagens, fotos e áudios sem revelar sua identidade
        </p>
        
        {/* Success Counter - Mobile Optimized */}
        <div className="mb-4">
          <SuccessCounter />
        </div>

        {/* Quick Benefits - Mobile Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="bg-green-50 p-2 rounded-lg flex items-center gap-1">
            <Shield className="h-3 w-3 text-green-600" />
            <span className="text-green-700 font-medium">100% Seguro</span>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg flex items-center gap-1">
            <Zap className="h-3 w-3 text-blue-600" />
            <span className="text-blue-700 font-medium">Instantâneo</span>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-purple-600" />
            <span className="text-purple-700 font-medium">Garantido</span>
          </div>
          <div className="bg-orange-50 p-2 rounded-lg flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-orange-600" />
            <span className="text-orange-700 font-medium">Anônimo</span>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg mb-4">
          <p className="text-sm font-semibold mb-1">✨ Começar agora é fácil:</p>
          <div className="text-xs opacity-90">
            Digite número → Escreva mensagem → Pague PIX → Pronto!
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileHero;