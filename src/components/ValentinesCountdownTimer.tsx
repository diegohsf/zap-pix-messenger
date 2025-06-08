
import React from 'react';
import { Clock } from 'lucide-react';
import { useValentinesCountdown } from '@/hooks/useValentinesCountdown';

const ValentinesCountdownTimer: React.FC = () => {
  const { days, hours, minutes, seconds } = useValentinesCountdown();

  const timeUnits = [
    { value: days, label: 'dias' },
    { value: hours, label: 'horas' },
    { value: minutes, label: 'min' },
    { value: seconds, label: 'seg' }
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      <Clock className="text-red-500 w-5 h-5" />
      <div className="flex gap-3">
        {timeUnits.map((unit, index) => (
          <div key={index} className="text-center">
            <div className="bg-red-500 text-white rounded-lg px-2 py-1 min-w-[50px] font-bold text-lg">
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600 mt-1">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValentinesCountdownTimer;
