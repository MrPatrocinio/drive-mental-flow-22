/**
 * Field List Component - Lista de campos com tipos Supabase
 * Responsabilidade: Exibição e ações básicas de campos
 * Princípio SRP: Apenas listagem de campos
 * Princípio DRY: Componente reutilizável para listar
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Music } from "lucide-react";
import { Field } from "@/services/supabase/fieldService";
import { IconService } from "@/services/iconService";

interface FieldListProps {
  fields: Field[];
  onEdit: (field: Field) => void;
  onDelete: (fieldId: string) => void;
}

export function FieldListNew({ fields, onEdit, onDelete }: FieldListProps) {
  const getIcon = (iconName: string) => {
    return IconService.getIconComponent(iconName);
  };

  if (fields.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Music className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum campo encontrado</h3>
          <p className="text-muted-foreground text-center">
            Crie seu primeiro campo de desenvolvimento para organizar os áudios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fields.map((field) => {
        const IconComponent = getIcon(field.icon_name);
        
        return (
          <Card key={field.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="w-5 h-5 text-primary" />
                {field.title}
                <Badge variant="outline" className="ml-auto">
                  {field.audio_count} áudios
                </Badge>
              </CardTitle>
              <CardDescription>{field.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Criado em {new Date(field.created_at).toLocaleDateString('pt-BR')}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(field)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Campo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar o campo "{field.title}"? 
                          {field.audio_count > 0 && (
                            <span className="text-destructive font-medium">
                              {" "}Este campo possui {field.audio_count} áudio(s) associado(s) 
                              que também serão removidos.
                            </span>
                          )}
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(field.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Deletar Campo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}