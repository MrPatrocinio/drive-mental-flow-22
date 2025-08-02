import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddToPlaylistDialog } from "./AddToPlaylistDialog";
import { PlaylistAudio } from "@/services/playlistService";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToPlaylistButtonProps {
  audio: PlaylistAudio;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  showText?: boolean;
  className?: string;
}

export function AddToPlaylistButton({ 
  audio, 
  variant = "ghost", 
  size = "sm", 
  showText = false,
  className = ""
}: AddToPlaylistButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { favoriteStatus, refreshFavoriteStatus } = useFavorites(audio.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDialog(true);
  };

  const handleDialogSuccess = () => {
    refreshFavoriteStatus();
    setShowDialog(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={cn(
          "transition-all duration-200",
          className
        )}
        title={favoriteStatus.isFavorite 
          ? `Está na playlist "${favoriteStatus.playlistName}"` 
          : "Adicionar à playlist"
        }
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-colors duration-200",
            favoriteStatus.isFavorite 
              ? "fill-red-500 text-red-500" 
              : "text-muted-foreground hover:text-red-400"
          )} 
        />
        {showText && <span className="ml-2">Adicionar à Playlist</span>}
      </Button>

      <AddToPlaylistDialog
        audio={audio}
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}