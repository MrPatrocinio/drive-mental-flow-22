import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Music } from "lucide-react";
import { PlaylistAudio } from "@/services/playlistService";

interface PlaylistAudioItemProps {
  audio: PlaylistAudio;
  onRemove: (audioId: string) => void;
  isRemoving?: boolean;
}

export function PlaylistAudioItem({ audio, onRemove, isRemoving = false }: PlaylistAudioItemProps) {
  const handleRemove = () => {
    onRemove(audio.id);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <Music className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {audio.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {audio.fieldTitle}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {audio.duration}
            </span>
          </div>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={isRemoving}
        className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}