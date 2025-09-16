import React from 'react';
import { Shield, Lock, Zap, CheckCircle, Star } from 'lucide-react';

const TrustIndicators: React.FC = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-3 rounded-full mb-2">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">100% Seguro</h3>
          <p className="text-sm text-gray-600">Seus dados são protegidos</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="bg-blue-100 p-3 rounded-full mb-2">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Entrega Instantânea</h3>
          <p className="text-sm text-gray-600">Mensagem enviada em segundos</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="bg-purple-100 p-3 rounded-full mb-2">
            <Lock className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Totalmente Anônimo</h3>
          <p className="text-sm text-gray-600">Sua identidade não é revelada</p>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-600">4.9/5 - Baseado em 2.847 avaliações</span>
        </div>
        <p className="text-xs text-center text-gray-500">
          "Funciona perfeitamente! Rápido e fácil de usar." - Maria S.
        </p>
      </div>
    </div>
  );
};

export default TrustIndicators;