/**
 * DynamicContentSelector — Two-step Category → Format selector
 * Fully DB-driven, supports adding new categories/formats on-the-fly.
 * Connected to universal enrichment via format config.
 */
import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ContentCategory, ContentFormat } from '@/hooks/useCastContentRegistry';

interface DynamicContentSelectorProps {
  categories: ContentCategory[];
  formats: ContentFormat[];
  getFormatsForCategory: (categoryId: string) => ContentFormat[];
  selectedCategoryId: string | null;
  selectedFormatId: string | null;
  onCategorySelect: (category: ContentCategory) => void;
  onFormatSelect: (format: ContentFormat) => void;
  onAddCategory: (data: { name: string; label: string; description?: string }) => Promise<any>;
  onAddFormat: (data: { name: string; label: string; description?: string }) => Promise<any>;
  isLoading?: boolean;
}

/** Resolve a lucide icon name to component */
const getIcon = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Folder;
  return Icon;
};

export const DynamicContentSelector: React.FC<DynamicContentSelectorProps> = ({
  categories,
  formats,
  getFormatsForCategory,
  selectedCategoryId,
  selectedFormatId,
  onCategorySelect,
  onFormatSelect,
  onAddCategory,
  onAddFormat,
  isLoading,
}) => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddFormat, setShowAddFormat] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const availableFormats = useMemo(() => {
    if (!selectedCategoryId) return formats;
    return getFormatsForCategory(selectedCategoryId);
  }, [selectedCategoryId, formats, getFormatsForCategory]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const handleAddCategory = async () => {
    if (!newLabel.trim()) return;
    await onAddCategory({ name: newLabel.trim(), label: newLabel.trim(), description: newDesc.trim() || undefined });
    setShowAddCategory(false);
    setNewLabel('');
    setNewDesc('');
  };

  const handleAddFormat = async () => {
    if (!newLabel.trim()) return;
    await onAddFormat({ name: newLabel.trim(), label: newLabel.trim(), description: newDesc.trim() || undefined });
    setShowAddFormat(false);
    setNewLabel('');
    setNewDesc('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading content registry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* STEP 1: Category Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {selectedCategoryId ? '✓' : '1'}
          </div>
          <div>
            <h3 className="text-sm font-semibold">What are you creating?</h3>
            <p className="text-xs text-muted-foreground">Pick an industry or content category</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {categories.map(cat => {
            const IconComp = getIcon(cat.icon);
            const isSelected = selectedCategoryId === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'justify-start gap-2 h-auto py-2.5 px-3 text-left',
                  isSelected && 'ring-2 ring-primary/30'
                )}
                onClick={() => onCategorySelect(cat)}
              >
                <IconComp className={cn('w-4 h-4 shrink-0', !isSelected && cat.color)} />
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{cat.label}</div>
                  {cat.description && (
                    <div className="text-[10px] opacity-70 truncate">{cat.description}</div>
                  )}
                </div>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2 h-auto py-2.5 px-3 border border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground"
            onClick={() => setShowAddCategory(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs">Add Category</span>
          </Button>
        </div>
      </div>

      {/* STEP 2: Format Selection (shown after category) */}
      {selectedCategoryId && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {selectedFormatId ? '✓' : '2'}
            </div>
            <div>
              <h3 className="text-sm font-semibold">Choose a format</h3>
              <p className="text-xs text-muted-foreground">
                {selectedCategory?.label} → Select output format
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableFormats.map(fmt => {
              const IconComp = getIcon(fmt.icon);
              const isSelected = selectedFormatId === fmt.id;
              return (
                <Card
                  key={fmt.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'hover:border-primary/40'
                  )}
                  onClick={() => onFormatSelect(fmt)}
                >
                  <CardContent className="p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <IconComp className={cn('w-4 h-4', !isSelected && fmt.color)} />
                      <span className="text-xs font-medium">{fmt.label}</span>
                    </div>
                    {fmt.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{fmt.description}</p>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {fmt.requires_tts && <Badge variant="outline" className="text-[9px] px-1">TTS</Badge>}
                      {fmt.requires_video && <Badge variant="outline" className="text-[9px] px-1">Video</Badge>}
                      {fmt.requires_messaging && <Badge variant="outline" className="text-[9px] px-1">Messaging</Badge>}
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[10px] text-primary mt-1">
                        <Sparkles className="w-3 h-3" />
                        Universal Enrichment will adapt
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            <Card
              className="cursor-pointer border-dashed border-muted-foreground/30 hover:border-primary/40"
              onClick={() => setShowAddFormat(true)}
            >
              <CardContent className="p-3 flex items-center gap-2 h-full">
                <Plus className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add Format</span>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedCategoryId && selectedFormatId && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs">
            <strong>{selectedCategory?.label}</strong>
            <ChevronRight className="w-3 h-3 inline mx-1" />
            <strong>{availableFormats.find(f => f.id === selectedFormatId)?.label}</strong>
            {' — '}Universal Enrichment will determine messaging, positioning & blueprint requirements
          </span>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Content Category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Category Name</Label>
              <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Real Estate" className="mt-1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="e.g. Property listings and tours" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCategory(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} disabled={!newLabel.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Format Dialog */}
      <Dialog open={showAddFormat} onOpenChange={setShowAddFormat}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Content Format</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Format Name</Label>
              <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Whiteboard Animation" className="mt-1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="e.g. Animated whiteboard-style videos" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFormat(false)}>Cancel</Button>
            <Button onClick={handleAddFormat} disabled={!newLabel.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
