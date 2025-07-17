import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlaylistForm } from "./PlaylistForm";
import { usePlaylistManager } from "@/hooks/usePlaylistManager";
import { useToast } from "@/hooks/use-toast";

interface CreatePlaylistDialogProps {
  onPlaylistCreated: () => void;
}

export function CreatePlaylistDialog({ onPlaylistCreated }: CreatePlaylistDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { createPlaylist } = usePlaylistManager();
  const { toast } = useToast();

  const handleCreate = async (data: { name: string; description: string }) => {
    setIsCreating(true);
    
    try {
      createPlaylist(data.name, data.description);
      
      toast({
        title: "Playlist criada!",
        description: `A playlist "${data.name}" foi criada com sucesso.`
      });

      setOpen(false);
      onPlaylistCreated();
    } catch (error) {
      toast({
        title: "Erro ao criar playlist",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Playlist
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Playlist</DialogTitle>
          <DialogDescription>
            Crie uma nova playlist personalizada para organizar seus áudios favoritos
          </DialogDescription>
        </DialogHeader>
        
        <PlaylistForm
          onSubmit={handleCreate}
          onCancel={handleCancel}
          submitLabel="Criar Playlist"
          isLoading={isCreating}
        />
      </DialogContent>
    </Dialog>
  );
}