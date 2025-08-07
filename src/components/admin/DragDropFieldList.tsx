/**
 * DragDropFieldList Component - Lista arrastável de campos
 * Responsabilidade: Interface de arrastar e soltar para ordenação
 * Princípio SRP: Apenas lógica de drag & drop
 * Princípio DRY: Componente reutilizável para qualquer lista ordenável
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import { Field } from "@/services/supabase/fieldService";
import * as Icons from "lucide-react";

interface SortableFieldItemProps {
  field: Field;
}

const SortableFieldItem = ({ field }: SortableFieldItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Circle;
  };

  const IconComponent = getIcon(field.icon_name);

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`relative cursor-move transition-all ${
        isDragging ? 'opacity-50 shadow-lg scale-105 z-10' : 'opacity-100'
      }`}
      {...attributes}
      {...listeners}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <IconComponent className="w-5 h-5 text-primary" />
          {field.title}
          <Badge variant="outline" className="ml-auto">
            {field.audio_count} áudios
          </Badge>
        </CardTitle>
        <CardDescription>{field.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Ordem: {field.display_order} • Criado em {new Date(field.created_at).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
};

interface DragDropFieldListProps {
  fields: Field[];
  onOrderChange: (newOrder: Field[]) => void;
}

export function DragDropFieldList({ fields, onOrderChange }: DragDropFieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over?.id);

      const newOrder = arrayMove(fields, oldIndex, newIndex);
      
      // Atualizar display_order baseado na nova posição
      const updatedOrder = newOrder.map((field, index) => ({
        ...field,
        display_order: index + 1
      }));

      onOrderChange(updatedOrder);
    }
  }

  if (fields.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-lg font-semibold mb-2">Nenhum campo encontrado</div>
          <p className="text-muted-foreground text-center">
            Crie seu primeiro campo de desenvolvimento para organizar os áudios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {fields.map((field) => (
            <SortableFieldItem key={field.id} field={field} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}