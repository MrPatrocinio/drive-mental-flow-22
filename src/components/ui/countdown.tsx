/**
 * Countdown Component
 * Responsabilidade: UI para exibir contagem regressiva
 * Princípio SRP: Apenas exibição de countdown
 * Princípio DRY: Componente reutilizável
 */

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { PromotionService } from '@/services/promotionService';

interface CountdownProps {
  endDate: string;
  onExpire?: () => void;
  className?: string;
}

export const Countdown: React.FC<CountdownProps> = ({
  endDate,
  onExpire,
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = PromotionService.getTimeRemaining(endDate);
      setTimeRemaining(remaining);
      
      if (remaining <= 0 && onExpire) {
        onExpire();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (timeRemaining <= 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm font-medium text-primary ${className}`}>
      <Clock className="h-4 w-4" />
      <span>Termina em: {PromotionService.formatTimeRemaining(timeRemaining)}</span>
    </div>
  );
};