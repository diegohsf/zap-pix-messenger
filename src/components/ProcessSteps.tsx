import React from 'react';
import { Edit3, CreditCard, Send, CheckCircle } from 'lucide-react';

const ProcessSteps: React.FC = () => {
  const steps = [
    {
      icon: Edit3,
      title: 'Escreva',
      description: 'Digite sua mensagem e anexe mídias se desejar',
      time: '1 min'
    },
    {
      icon: CreditCard,
      title: 'Pague',
      description: 'Pagamento rápido e seguro via PIX',
      time: '30s'
    },
    {
      icon: Send,
      title: 'Envie',
      description: 'Mensagem é enviada automaticamente',
      time: '10s'
    },
    {
      icon: CheckCircle,
      title: 'Pronto!',
      description: 'Mensagem entregue com total anonimato',
      time: 'Instantâneo'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-center text-gray-900 mb-4">
        Como Funciona - Processo Simples
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <div key={index} className="text-center relative">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 relative">
              <step.icon className="h-6 w-6 text-blue-600" />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </span>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
              ⏱️ {step.time}
            </span>
            
            {/* Arrow connector */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-6 left-full w-full">
                <div className="w-full h-0.5 bg-gray-300 relative">
                  <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-b-2 border-t-transparent border-b-transparent transform -translate-y-1/2"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessSteps;