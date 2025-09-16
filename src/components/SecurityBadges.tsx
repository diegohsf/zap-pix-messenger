import React from 'react';
import { Shield, Lock, Eye, Zap } from 'lucide-react';

const SecurityBadges: React.FC = () => {
  const badges = [
    {
      icon: Shield,
      title: 'Dados Protegidos',
      description: 'Criptografia SSL 256-bit',
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      icon: Lock,
      title: 'Zero Logs',
      description: 'Não armazenamos histórico',
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      icon: Eye,
      title: 'Anônimo Total',
      description: 'IP mascarado automaticamente',
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    {
      icon: Zap,
      title: 'Entrega Garantida',
      description: '99.9% de taxa de sucesso',
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {badges.map((badge, index) => (
        <div 
          key={index}
          className={`${badge.color} p-3 rounded-lg border text-center transition-transform hover:scale-105`}
        >
          <badge.icon className="h-5 w-5 mx-auto mb-1" />
          <h4 className="text-xs font-semibold">{badge.title}</h4>
          <p className="text-xs opacity-80 mt-1">{badge.description}</p>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;