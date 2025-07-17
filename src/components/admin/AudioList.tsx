/**
 * Audio List Component - Responsável pela UI da lista de áudios
 * Responsabilidade: Apenas renderizar lista e emitir eventos
 * Princípio SRP: Apenas UI da lista
 * Princípio DRY: Componente reutilizável
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { EditableAudio } from "@/services/contentService";
import { Search, MoreVertical, Edit, Trash2, Play, RefreshCw } from "lucide-react";

interface AudioListProps {
  audios: EditableAudio[];
  fields: Array<{ id: string; title: string }>;
  onEdit: (audio: EditableAudio) => void;
  onDelete: (audioId: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const AudioList = ({ 
  audios, 
  fields, 
  onEdit, 
  onDelete, 
  onRefresh,
  isLoading = false 
}: AudioListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [audioToDelete, setAudioToDelete] = useState<EditableAudio | null>(null);

  const getFieldTitle = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.title || "Campo não encontrado";
  };

  const filteredAudios = audios.filter(audio =>
    audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audio.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getFieldTitle(audio.fieldId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (audio: EditableAudio) => {
    setAudioToDelete(audio);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (audioToDelete) {
      onDelete(audioToDelete.id);
      setDeleteDialogOpen(false);
      setAudioToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar áudios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          title="Atualizar lista"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Campo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "Nenhum áudio encontrado" : "Nenhum áudio cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAudios.map((audio) => (
                  <TableRow key={audio.id}>
                    <TableCell className="font-medium">
                      {audio.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getFieldTitle(audio.fieldId)}
                      </Badge>
                    </TableCell>
                    <TableCell>{audio.duration}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {audio.description}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(audio.url, '_blank')}>
                            <Play className="h-4 w-4 mr-2" />
                            Reproduzir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(audio)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(audio)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Áudio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o áudio "{audioToDelete?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};