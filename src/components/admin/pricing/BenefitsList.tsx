import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Edit2, Check, X, Star } from 'lucide-react';

interface BenefitsListProps {
  benefits: string[];
  onAdd: (benefit: string) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, benefit: string) => void;
  isLoading: boolean;
}

export const BenefitsList = ({ benefits, onAdd, onRemove, onUpdate, isLoading }: BenefitsListProps) => {
  const [newBenefit, setNewBenefit] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAdd = () => {
    if (newBenefit.trim()) {
      onAdd(newBenefit);
      setNewBenefit('');
    }
  };

  const handleStartEdit = (index: number, value: string) => {
    setEditingIndex(index);
    setEditingValue(value);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      onUpdate(editingIndex, editingValue);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Lista de Benefícios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new benefit */}
        <div className="space-y-2">
          <Label htmlFor="new-benefit">Adicionar Novo Benefício</Label>
          <div className="flex gap-2">
            <Input
              id="new-benefit"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              placeholder="Digite o benefício..."
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button 
              onClick={handleAdd}
              disabled={!newBenefit.trim() || isLoading}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Benefits list */}
        <div className="space-y-2">
          <Label>Benefícios Atuais ({benefits.length})</Label>
          {benefits.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum benefício adicionado ainda
            </p>
          ) : (
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                  {editingIndex === index ? (
                    <>
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        onClick={handleSaveEdit}
                        disabled={!editingValue.trim() || isLoading}
                        size="icon"
                        variant="ghost"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        size="icon"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm">{benefit}</span>
                      <Button
                        onClick={() => handleStartEdit(index, benefit)}
                        size="icon"
                        variant="ghost"
                        disabled={isLoading}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onRemove(index)}
                        size="icon"
                        variant="ghost"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};