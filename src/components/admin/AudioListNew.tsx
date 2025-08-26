
/**
 * Audio List Component - Lista de áudios para administração
 * Responsabilidade: Apenas renderização da lista de áudios
 * Princípio SRP: Apenas UI da lista
 * MELHORADO: Suporte a demo toggle
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Audio } from "@/services/supabase/audioService";
import { Field } from "@/services/supabase/fieldService";
import { DemoToggleButton } from "./DemoToggleButton";
import { Search, Edit, Trash2, Music, Clock } from "lucide-react";

interface AudioListProps {
  audios: Audio[];
  fields: Field[];
  onEdit: (audio: Audio) => void;
  onDelete: (audioId: string) => void;
}

export const AudioList = ({ audios, fields, onEdit, onDelete }: AudioListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar áudios baseado no termo de busca
  const filteredAudios = audios.filter(audio =>
    audio.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFieldTitle = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.title || "Campo não encontrado";
  };

  if (audios.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum áudio encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar áudios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Áudios */}
      <div className="grid gap-4">
        {filteredAudios.map((audio) => (
          <Card key={audio.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{audio.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <Badge variant="outline">{getFieldTitle(audio.field_id)}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {audio.duration}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(audio)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(audio.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {audio.tags && audio.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      {audio.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <DemoToggleButton
                  audioId={audio.id}
                  audioTitle={audio.title}
                  audioUrl={audio.url}
                  isDemo={audio.is_demo || false}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAudios.length === 0 && searchTerm && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum áudio encontrado para "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
