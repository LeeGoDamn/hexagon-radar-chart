import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Pencil, Check, X } from '@phosphor-icons/react';
import { Dimension, VALUE_LABELS } from '@/lib/types';

interface DimensionEditorProps {
  dimensions: Dimension[];
  onDimensionsChange: (dimensions: Dimension[]) => void;
}

export function DimensionEditor({ dimensions, onDimensionsChange }: DimensionEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleValueChange = (index: number, value: number[]) => {
    const newDimensions = [...dimensions];
    newDimensions[index].value = value[0];
    onDimensionsChange(newDimensions);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingName(dimensions[index].name);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingName.trim()) {
      const newDimensions = [...dimensions];
      newDimensions[editingIndex].name = editingName.trim();
      onDimensionsChange(newDimensions);
    }
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingName('');
  };

  const getValueColor = (value: number) => {
    if (value === 1) return 'bg-destructive/20 text-destructive';
    if (value === 2) return 'bg-secondary/50 text-secondary-foreground';
    return 'bg-accent/30 text-accent-foreground';
  };

  return (
    <div className="space-y-4">
      {dimensions.map((dimension, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              {editingIndex === index ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <Button size="icon" variant="ghost" onClick={saveEdit}>
                    <Check size={18} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEdit}>
                    <X size={18} />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1">
                    <Label className="text-base font-semibold">{dimension.name}</Label>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => startEditing(index)}
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                  <Badge className={getValueColor(dimension.value)}>
                    {VALUE_LABELS[dimension.value]}
                  </Badge>
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <Slider
                value={[dimension.value]}
                onValueChange={(value) => handleValueChange(index, value)}
                min={1}
                max={3}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mono">
                <span>低</span>
                <span>中</span>
                <span>高</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
