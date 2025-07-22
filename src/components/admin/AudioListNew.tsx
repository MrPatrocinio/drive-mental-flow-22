/**
 * Audio List Component - Lista de áudios com tipos Supabase
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
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Play, MoreHorizontal, Search } from "lucide-react";
import { Audio } from "@/services/supabase/audioService";
import { Field } from "@/services/supabase/fieldService";

interface AudioListProps {
  audios: Audio[];
  fields: Field[];
  onEdit: (audio: Audio) => void;
  onDelete: (audioId: string) => void;
}

export const AudioList = ({ audios, fields, onEdit, onDelete }: AudioListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteAudioId, setDeleteAudioId] = useState<string | null>(null);

  const getFieldName = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.title || "Campo não encontrado";
  };

  const filteredAudios = audios.filter(audio =>
    audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getFieldName(audio.field_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (audios.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Play className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum áudio encontrado</h3>
          <p className="text-muted-foreground text-center">
            Comece fazendo upload do seu primeiro áudio.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar áudios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabela de Áudios */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Campo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudios.map((audio) => (
                <TableRow key={audio.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-primary" />
                      {audio.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getFieldName(audio.field_id)}
                    </Badge>
                  </TableCell>
                  <TableCell>{audio.duration}</TableCell>
                  <TableCell>
                    {new Date(audio.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(audio)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteAudioId(audio.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteAudioId !== null} onOpenChange={() => setDeleteAudioId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Áudio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este áudio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteAudioId) {
                  onDelete(deleteAudioId);
                  setDeleteAudioId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resultados da busca */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          {filteredAudios.length} áudio(s) encontrado(s) para "{searchTerm}"
        </div>
      )}
    </div>
  );
};