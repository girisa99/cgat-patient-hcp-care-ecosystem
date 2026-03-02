/**
 * DynamicContentSelector — Three-step Category → Format → Sub-Format selector
 * Fully DB-driven, supports adding new entries on-the-fly.
 * Connected to universal enrichment via format config.
 */
import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight, Sparkles, HelpCircle, ArrowRight, Check } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ContentCategory, ContentFormat, ContentSubFormat } from '@/hooks/useCastContentRegistry';

interface DynamicContentSelectorProps {
  categories: ContentCategory[];
  formats: ContentFormat[];
  subFormats?: ContentSubFormat[];
  getFormatsForCategory: (categoryId: string) => ContentFormat[];
  getSubFormatsForFormat?: (formatId: string, categoryId?: string) => ContentSubFormat[];
  selectedCategoryId: string | null;
  selectedFormatId: string | null;
  selectedSubFormatId?: string | null;
  onCategorySelect: (category: ContentCategory) => void;
  onFormatSelect: (format: ContentFormat) => void;
  onSubFormatSelect?: (subFormat: ContentSubFormat) => void;
  onAddCategory: (data: { name: string; label: string; description?: string }) => Promise<any>;
  onAddFormat: (data: { name: string; label: string; description?: string }) => Promise<any>;
  onAddSubFormat?: (data: { format_id: string; name: string; label: string; description?: string }) => Promise<any>;
  onCategoryHover?: (category: ContentCategory | null) => void;
  onContinue?: () => void;
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
  subFormats = [],
  getFormatsForCategory,
  getSubFormatsForFormat,
  selectedCategoryId,
  selectedFormatId,
  selectedSubFormatId,
  onCategorySelect,
  onFormatSelect,
  onSubFormatSelect,
  onAddCategory,
  onAddFormat,
  onAddSubFormat,
  onCategoryHover,
  onContinue,
  isLoading,
}) => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddFormat, setShowAddFormat] = useState(false);
  const [showAddSubFormat, setShowAddSubFormat] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const availableFormats = useMemo(() => {
    if (!selectedCategoryId) return formats;
    return getFormatsForCategory(selectedCategoryId);
  }, [selectedCategoryId, formats, getFormatsForCategory]);

  const availableSubFormats = useMemo(() => {
    if (!selectedFormatId || !getSubFormatsForFormat) return [];
    return getSubFormatsForFormat(selectedFormatId, selectedCategoryId || undefined);
  }, [selectedFormatId, selectedCategoryId, getSubFormatsForFormat]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedFormat = availableFormats.find(f => f.id === selectedFormatId);

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

  const handleAddSubFormat = async () => {
    if (!newLabel.trim() || !selectedFormatId || !onAddSubFormat) return;
    await onAddSubFormat({ format_id: selectedFormatId, name: newLabel.trim(), label: newLabel.trim(), description: newDesc.trim() || undefined });
    setShowAddSubFormat(false);
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

  // Determine if sub-formats exist for the selected format
  const hasSubFormats = availableSubFormats.length > 0;
  // Show sub-format step only after format is selected AND sub-formats exist
  const showSubFormatStep = selectedFormatId && hasSubFormats;

  return (
    <TooltipProvider>
    <div className="space-y-6">
      {/* STEP 1: Category Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors",
            selectedCategoryId ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
          )}>
            {selectedCategoryId ? '✓' : '1'}
          </div>
          <div className="flex items-center gap-1.5">
            <div>
              <h3 className="text-sm font-semibold">What are you creating?</h3>
              <p className="text-xs text-muted-foreground">Pick an industry or content category</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[250px] text-xs">
                Choose the industry or topic area for your content. This filters the available formats and templates to match your use case. You can also add custom categories.
              </TooltipContent>
            </Tooltip>
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
                onMouseEnter={() => onCategoryHover?.(cat)}
                onMouseLeave={() => onCategoryHover?.(null)}
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
            <div className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors",
              selectedFormatId ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
            )}>
              {selectedFormatId ? '✓' : '2'}
            </div>
            <div className="flex items-center gap-1.5">
              <div>
                <h3 className="text-sm font-semibold">Choose a format</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedCategory?.label} → Select output format
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[250px] text-xs">
                  Select the output format for your content (e.g. Short Video, Podcast, Social Post). Each format has specific capabilities like TTS, video generation, and messaging. Badges show what's included.
                </TooltipContent>
              </Tooltip>
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

      {/* STEP 3: Sub-Format Selection (shown after format, if sub-formats exist) */}
      {showSubFormatStep && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors",
              selectedSubFormatId ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
            )}>
              {selectedSubFormatId ? '✓' : '3'}
            </div>
            <div className="flex items-center gap-1.5">
              <div>
                <h3 className="text-sm font-semibold">Refine your content type</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedCategory?.label} → {selectedFormat?.label} → Choose a specific type
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[250px] text-xs">
                  Pick a more specific content type within your chosen format. For example, within "Video" you might choose "Explainer Video", "Testimonial", or "Product Demo". This fine-tunes the AI generation.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableSubFormats.map(sf => {
              const IconComp = getIcon(sf.icon);
              const isSelected = selectedSubFormatId === sf.id;
              return (
                <Card
                  key={sf.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'hover:border-primary/40'
                  )}
                  onClick={() => onSubFormatSelect?.(sf)}
                >
                  <CardContent className="p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <IconComp className={cn('w-4 h-4', !isSelected && (sf.color || 'text-muted-foreground'))} />
                      <span className="text-xs font-medium">{sf.label}</span>
                    </div>
                    {sf.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{sf.description}</p>
                    )}
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[10px] text-primary mt-1">
                        <Sparkles className="w-3 h-3" />
                        Selected
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {onAddSubFormat && (
              <Card
                className="cursor-pointer border-dashed border-muted-foreground/30 hover:border-primary/40"
                onClick={() => setShowAddSubFormat(true)}
              >
                <CardContent className="p-3 flex items-center gap-2 h-full">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Sub-Format</span>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Summary + Continue CTA */}
      {selectedCategoryId && selectedFormatId && (
        <div className="space-y-3">
          {/* Selection summary */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                <Check className="w-3 h-3" /> {selectedCategory?.label}
              </span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                <Check className="w-3 h-3" /> {selectedFormat?.label}
              </span>
              {selectedSubFormatId && (
                <>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                    <Check className="w-3 h-3" /> {availableSubFormats.find(sf => sf.id === selectedSubFormatId)?.label}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Continue button — only show when selection is complete */}
          {showSubFormatStep && !selectedSubFormatId ? (
            <p className="text-xs text-muted-foreground text-center">
              Select a content type above to continue
            </p>
          ) : onContinue ? (
            <Button
              size="lg"
              className="w-full gap-2 font-semibold"
              onClick={onContinue}
            >
              Continue to Style & Config
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : null}
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

      {/* Add Sub-Format Dialog */}
      <Dialog open={showAddSubFormat} onOpenChange={setShowAddSubFormat}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Sub-Format</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Sub-Format Name</Label>
              <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Expert Interview" className="mt-1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="e.g. One-on-one expert discussion" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSubFormat(false)}>Cancel</Button>
            <Button onClick={handleAddSubFormat} disabled={!newLabel.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
};
