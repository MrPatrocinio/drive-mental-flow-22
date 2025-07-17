import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddToPlaylistDialog } from "./AddToPlaylistDialog";
import { PlaylistAudio } from "@/services/playlistService";
import { Heart } from "lucide-react";

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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDialog(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`${className} transition-colors`}
        title="Adicionar à playlist"
      >
        <Heart className="h-4 w-4" />
        {showText && <span className="ml-2">Adicionar à Playlist</span>}
      </Button>

      <AddToPlaylistDialog
        audio={audio}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}