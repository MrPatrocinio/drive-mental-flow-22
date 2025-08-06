/**
 * Promotion Badge Component
 * Responsabilidade: UI para badge promocional
 * Princípio SRP: Apenas exibição de badge
 * Princípio DRY: Componente reutilizável
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PromotionBadgeProps {
  label?: string;
  discount?: number;
  className?: string;
}

export const PromotionBadge: React.FC<PromotionBadgeProps> = ({
  label,
  discount,
  className = ''
}) => {
  const displayText = label || (discount ? `${discount}% OFF` : 'PROMOÇÃO');

  return (
    <Badge 
      variant="destructive" 
      className={`animate-pulse font-bold ${className}`}
    >
      {displayText}
    </Badge>
  );
};