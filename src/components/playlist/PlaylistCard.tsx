import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Music, MoreVertical, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Playlist } from "@/services/playlistService";

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: (playlist: Playlist) => void;
  onEdit: (playlist: Playlist) => void;
  onDelete: (playlist: Playlist) => void;
}

export function PlaylistCard({ playlist, onPlay, onEdit, onDelete }: PlaylistCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {playlist.name}
            </CardTitle>
            {playlist.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {playlist.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(playlist)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(playlist)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Music className="h-4 w-4" />
            <span>{playlist.audios.length} áudios</span>
          </div>
          <span>Criada em {formatDate(playlist.createdAt)}</span>
        </div>

        {playlist.audios.length > 0 && (
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              Últimos áudios
            </Badge>
            <div className="space-y-1">
              {playlist.audios.slice(-2).map((audio) => (
                <div key={audio.id} className="text-sm text-muted-foreground truncate">
                  • {audio.title}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={() => onPlay(playlist)}
          disabled={playlist.audios.length === 0}
          className="w-full"
          variant={playlist.audios.length > 0 ? "default" : "outline"}
        >
          <Play className="h-4 w-4 mr-2" />
          {playlist.audios.length > 0 ? "Reproduzir Playlist" : "Playlist Vazia"}
        </Button>
      </CardContent>
    </Card>
  );
}