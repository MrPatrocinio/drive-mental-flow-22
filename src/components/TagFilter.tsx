/**
 * Tag Filter - Componente para filtrar por tags
 * Responsabilidade: UI de filtro por tags
 * Princípio SRP: Apenas filtro de tags
 * Princípio DRY: Componente reutilizável
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagFilter({ 
  availableTags, 
  selectedTags, 
  onTagsChange,
  maxTags = 10 
}: TagFilterProps) {
  const [displayTags, setDisplayTags] = useState<string[]>([]);

  useEffect(() => {
    // Mostrar tags mais populares primeiro
    const sortedTags = [...availableTags]
      .slice(0, maxTags)
      .sort((a, b) => a.localeCompare(b));
    setDisplayTags(sortedTags);
  }, [availableTags, maxTags]);

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    onTagsChange(newTags);
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  if (displayTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtrar por tags</h3>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllTags}
            className="text-xs h-6 px-2"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-colors hover-scale ${
                isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Badge>
          );
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedTags.length} tag(s) selecionada(s)
        </div>
      )}
    </div>
  );
}