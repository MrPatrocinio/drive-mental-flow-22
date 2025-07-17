/**
 * FieldList - Responsável pela listagem de campos
 * Responsabilidade: Exibição e ações básicas de campos
 * Princípio SRP: Apenas listagem de campos
 * Princípio DRY: Componente reutilizável para listar
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Music } from "lucide-react";
import { EditableField } from "@/services/contentService";
import * as Icons from "lucide-react";

interface FieldListProps {
  fields: EditableField[];
  onEdit: (field: EditableField) => void;
  onDelete: (fieldId: string) => void;
}

export function FieldList({ fields, onEdit, onDelete }: FieldListProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Circle;
  };

  if (fields.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Music className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum campo encontrado</p>
          <p className="text-muted-foreground text-center max-w-sm">
            Crie seu primeiro campo de desenvolvimento pessoal clicando no botão "Novo Campo"
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {fields.map((field) => {
        const IconComponent = getIcon(field.iconName);
        
        return (
          <Card key={field.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5" />
                  <CardTitle className="text-lg">{field.title}</CardTitle>
                </div>
                <Badge variant="secondary">
                  {field.audioCount} áudio{field.audioCount !== 1 ? 's' : ''}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {field.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(field)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o campo "{field.title}"? 
                        Esta ação também removerá todos os áudios associados a este campo e não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(field.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir Campo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}