import React from 'react';
import { Star, Shield, Users, Clock } from 'lucide-react';

const MobileTrustIndicators: React.FC = () => {
  const stats = [
    { icon: Users, label: '12.8k+', sublabel: 'usuários', color: 'text-blue-600' },
    { icon: Star, label: '4.9/5', sublabel: 'avaliação', color: 'text-yellow-600' },
    { icon: Shield, label: '99.9%', sublabel: 'segurança', color: 'text-green-600' },
    { icon: Clock, label: '<10s', sublabel: 'entrega', color: 'text-purple-600' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mx-4 mb-4">
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`${stat.color} mb-1`}>
              <stat.icon className="h-4 w-4 mx-auto" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-gray-900">{stat.label}</div>
              <div className="text-gray-500 text-xs">{stat.sublabel}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Social Proof */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-600">
          💬 <strong>Maria S.</strong>: "Funcionou perfeitamente! Super recomendo!"
        </p>
      </div>
    </div>
  );
};

export default MobileTrustIndicators;