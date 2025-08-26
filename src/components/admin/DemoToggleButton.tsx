import React from 'react';
import { Button } from '@/components/ui/button';
import { useAudioDemo } from '@/hooks/useAudioDemo';
import { toast } from 'sonner';

interface DemoToggleButtonProps {
  audioId: string;
  audioTitle: string;
  audioUrl: string; // NOVA PROP: URL do áudio para validação
  isDemo: boolean;
  disabled?: boolean;
}

export const DemoToggleButton: React.FC<DemoToggleButtonProps> = ({ 
  audioId, 
  audioTitle,
  audioUrl, // NOVA PROP: URL do áudio para validação
  isDemo, 
  disabled 
}) => {
  const { loading, toggleDemo } = useAudioDemo();

  const handleToggle = async () => {
    // NOVA VALIDAÇÃO: Verificar se tem URL válida antes de marcar como demo
    if (!isDemo && (!audioUrl || audioUrl.trim() === '')) {
      toast.error('Não é possível marcar como demo: áudio não possui URL válida');
      return;
    }

    try {
      await toggleDemo(audioId, audioTitle, isDemo);
    } catch (error) {
      console.error('Erro no toggle demo:', error);
      // Error já é tratado no hook useAudioDemo
    }
  };

  return (
    <Button
      variant={isDemo ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={disabled || loading}
      className={isDemo ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {loading ? (
        <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-1" />
      ) : null}
      {isDemo ? 'Demo Ativo' : 'Marcar Demo'}
    </Button>
  );
};
