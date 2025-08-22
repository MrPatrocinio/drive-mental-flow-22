
/**
 * Demo Toggle Button - Componente para alternar áudio como demo
 * Responsabilidade: Apenas UI do botão de toggle de demo
 * Princípio SRP: Apenas renderização e eventos do botão
 * Princípio DRY: Componente reutilizável
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, StarOff } from 'lucide-react';
import { useState } from 'react';

interface DemoToggleButtonProps {
  isDemo: boolean;
  audioTitle: string;
  onToggle: (setAsDemo: boolean) => Promise<void>;
  disabled?: boolean;
}

export const DemoToggleButton = ({ 
  isDemo, 
  audioTitle, 
  onToggle, 
  disabled = false 
}: DemoToggleButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(!isDemo);
    } finally {
      setLoading(false);
    }
  };

  if (isDemo) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Star className="w-3 h-3 mr-1 fill-current" />
          Áudio Demo
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          disabled={disabled || loading}
          className="text-xs"
        >
          <StarOff className="w-3 h-3 mr-1" />
          Remover Demo
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={disabled || loading}
      className="text-xs"
    >
      <Star className="w-3 h-3 mr-1" />
      {loading ? 'Definindo...' : 'Definir como Demo'}
    </Button>
  );
};
