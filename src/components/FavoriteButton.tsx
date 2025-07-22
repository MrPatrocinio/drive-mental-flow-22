/**
 * Favorite Button - Componente para favoritar áudios
 * Responsabilidade: UI para favoritação
 * Princípio SRP: Apenas botão de favorito
 * Princípio DRY: Componente reutilizável
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { FavoritesService } from '@/services/supabase/favoritesService';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  audioId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
}

export function FavoriteButton({ 
  audioId, 
  size = 'default', 
  variant = 'ghost' 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFavoriteStatus();
  }, [audioId]);

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await FavoritesService.isFavorite(audioId);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  };

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      const newFavoriteStatus = await FavoritesService.toggleFavorite(audioId);
      setIsFavorite(newFavoriteStatus);
      
      toast({
        title: newFavoriteStatus ? "Adicionado aos favoritos" : "Removido dos favoritos",
        description: newFavoriteStatus 
          ? "Áudio salvo em seus favoritos" 
          : "Áudio removido dos favoritos",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar favoritos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className="hover-scale"
    >
      <Heart 
        className={`w-4 h-4 ${
          isFavorite 
            ? 'fill-primary text-primary' 
            : 'text-muted-foreground'
        }`} 
      />
    </Button>
  );
}