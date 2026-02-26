/**
 * SLIDE COMPOSER
 *
 * Drag-and-drop slide reordering, per-slide style change, insert/delete.
 * Integrates with universalPresentationService.composeDeck() for
 * mixing slides from different pipeline runs.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Presentation, Plus, Trash2, GripVertical, Image, Type, BarChart3,
  ChevronUp, ChevronDown, Copy, Sparkles, Loader2, Eye, Layers,
  FileText, ArrowUpDown, Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ComposerSlide {
  id: string;
  order: number;
  type: 'title' | 'content' | 'section' | 'image' | 'chart' | 'quote' | 'stats' | 'comparison' | 'timeline' | 'cta';
  title: string;
  body: string;
  speakerNotes: string;
  imageUrl?: string;
  chartData?: Record<string, unknown>;
  style: SlideStyle;
  sourceRunId?: string; // Which pipeline run generated this slide
  duration: number; // seconds for video conversion
}

export interface SlideStyle {
  layout: 'centered' | 'split-left' | 'split-right' | 'full-bleed' | 'grid-2x2';
  colorScheme: 'brand' | 'dark' | 'light' | 'gradient' | 'minimal';
  fontScale: 'small' | 'medium' | 'large';
  animation: 'none' | 'fade' | 'slide-up' | 'morph' | 'zoom';
}

export interface DeckComposition {
  id: string;
  title: string;
  slides: ComposerSlide[];
  totalSlides: number;
  totalDuration: number;
  sourceRuns: string[]; // Pipeline run IDs used
}

interface SlideComposerProps {
  /** Initial slides from a pipeline run */
  initialSlides?: ComposerSlide[];
  /** Title for the deck */
  deckTitle?: string;
  /** Callback when deck changes */
  onDeckChange?: (deck: DeckComposition) => void;
  className?: string;
}

// ── composeDeck() — Mix slides from different pipeline runs ──────────────────

/**
 * Compose a new deck by mixing slides from multiple source runs.
 * Reindexes orders and tracks source provenance.
 */
export function composeDeck(
  title: string,
  slideSources: { slides: ComposerSlide[]; runId: string }[],
  selectedSlideIds?: string[],
): DeckComposition {
  let allSlides: ComposerSlide[] = [];

  for (const source of slideSources) {
    const tagged = source.slides.map(s => ({ ...s, sourceRunId: source.runId }));
    allSlides.push(...tagged);
  }

  // Filter to selected slides if provided
  if (selectedSlideIds && selectedSlideIds.length > 0) {
    allSlides = allSlides.filter(s => selectedSlideIds.includes(s.id));
  }

  // Reindex order
  allSlides = allSlides.map((s, i) => ({ ...s, order: i }));

  return {
    id: crypto.randomUUID(),
    title,
    slides: allSlides,
    totalSlides: allSlides.length,
    totalDuration: allSlides.reduce((sum, s) => sum + s.duration, 0),
    sourceRuns: [...new Set(slideSources.map(s => s.runId))],
  };
}

// ── Slide Type Config ────────────────────────────────────────────────────────

const SLIDE_TYPES: { id: ComposerSlide['type']; label: string; icon: React.ElementType }[] = [
  { id: 'title', label: 'Title', icon: Type },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'section', label: 'Section Divider', icon: Layers },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'chart', label: 'Chart / Data', icon: BarChart3 },
  { id: 'quote', label: 'Quote', icon: FileText },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'comparison', label: 'Comparison', icon: ArrowUpDown },
  { id: 'timeline', label: 'Timeline', icon: Layers },
  { id: 'cta', label: 'Call to Action', icon: Sparkles },
];

const DEFAULT_STYLE: SlideStyle = {
  layout: 'centered',
  colorScheme: 'brand',
  fontScale: 'medium',
  animation: 'fade',
};

function createSlide(overrides?: Partial<ComposerSlide>): ComposerSlide {
  return {
    id: crypto.randomUUID(),
    order: 0,
    type: 'content',
    title: 'New Slide',
    body: '',
    speakerNotes: '',
    style: { ...DEFAULT_STYLE },
    duration: 10,
    ...overrides,
  };
}

// ── Slide Card Sub-Component ─────────────────────────────────────────────────

function SlideCard({
  slide,
  index,
  total,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: {
  slide: ComposerSlide;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updated: ComposerSlide) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}) {
  const TypeIcon = SLIDE_TYPES.find(t => t.id === slide.type)?.icon || FileText;

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden transition-all cursor-pointer',
        isSelected ? 'border-primary shadow-sm ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/30',
      )}
      onClick={onSelect}
    >
      {/* Mini preview bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 cursor-grab" />
        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">{index + 1}</Badge>
        <TypeIcon className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium flex-1 truncate">{slide.title || 'Untitled'}</span>
        <span className="text-[10px] text-muted-foreground">{slide.duration}s</span>

        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
          <Button size="icon" variant="ghost" className="h-5 w-5" disabled={index === 0} onClick={onMoveUp}>
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-5 w-5" disabled={index === total - 1} onClick={onMoveDown}>
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={onDuplicate}>
            <Copy className="w-3 h-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={onRemove}>
            <Trash2 className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Edit panel (when selected) */}
      {isSelected && (
        <div className="px-3 py-3 bg-background space-y-2" onClick={e => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground font-medium">Type</label>
              <Select value={slide.type} onValueChange={v => onUpdate({ ...slide, type: v as ComposerSlide['type'] })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SLIDE_TYPES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-medium">Layout</label>
              <Select value={slide.style.layout} onValueChange={v => onUpdate({ ...slide, style: { ...slide.style, layout: v as SlideStyle['layout'] } })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="centered">Centered</SelectItem>
                  <SelectItem value="split-left">Split Left</SelectItem>
                  <SelectItem value="split-right">Split Right</SelectItem>
                  <SelectItem value="full-bleed">Full Bleed</SelectItem>
                  <SelectItem value="grid-2x2">Grid 2×2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Input
            value={slide.title}
            onChange={e => onUpdate({ ...slide, title: e.target.value })}
            className="text-xs h-7"
            placeholder="Slide title..."
          />
          <Textarea
            value={slide.body}
            onChange={e => onUpdate({ ...slide, body: e.target.value })}
            className="text-xs min-h-[60px] resize-none"
            rows={3}
            placeholder="Slide content / bullet points..."
          />
          <Textarea
            value={slide.speakerNotes}
            onChange={e => onUpdate({ ...slide, speakerNotes: e.target.value })}
            className="text-xs min-h-[30px] resize-none bg-muted/30"
            rows={2}
            placeholder="Speaker notes (visible only to presenter)..."
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground font-medium">Color</label>
              <Select value={slide.style.colorScheme} onValueChange={v => onUpdate({ ...slide, style: { ...slide.style, colorScheme: v as SlideStyle['colorScheme'] } })}>
                <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-medium">Animation</label>
              <Select value={slide.style.animation} onValueChange={v => onUpdate({ ...slide, style: { ...slide.style, animation: v as SlideStyle['animation'] } })}>
                <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide-up">Slide Up</SelectItem>
                  <SelectItem value="morph">Morph</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-medium">Duration</label>
              <Input
                type="number"
                value={slide.duration}
                onChange={e => onUpdate({ ...slide, duration: Number(e.target.value) || 5 })}
                className="h-6 text-[10px]"
                min={3}
                max={120}
              />
            </div>
          </div>
          {slide.sourceRunId && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
              Source: {slide.sourceRunId.slice(0, 8)}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Slide Composer ──────────────────────────────────────────────────────

export const SlideComposer: React.FC<SlideComposerProps> = ({
  initialSlides = [],
  deckTitle = 'Untitled Deck',
  onDeckChange,
  className,
}) => {
  const [slides, setSlides] = useState<ComposerSlide[]>(
    initialSlides.length > 0 ? initialSlides : [
      createSlide({ order: 0, type: 'title', title: deckTitle, duration: 5 }),
      createSlide({ order: 1, type: 'content', title: 'Key Points' }),
      createSlide({ order: 2, type: 'cta', title: 'Next Steps', duration: 8 }),
    ],
  );
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [title, setTitle] = useState(deckTitle);

  const totalDuration = useMemo(() => slides.reduce((sum, s) => sum + s.duration, 0), [slides]);

  const notifyChange = useCallback((newSlides: ComposerSlide[]) => {
    setSlides(newSlides);
    onDeckChange?.({
      id: crypto.randomUUID(),
      title,
      slides: newSlides,
      totalSlides: newSlides.length,
      totalDuration: newSlides.reduce((sum, s) => sum + s.duration, 0),
      sourceRuns: [...new Set(newSlides.map(s => s.sourceRunId).filter(Boolean) as string[])],
    });
  }, [title, onDeckChange]);

  const addSlide = (afterIndex?: number) => {
    const idx = afterIndex !== undefined ? afterIndex + 1 : slides.length;
    const newSlide = createSlide({ order: idx });
    const updated = [...slides];
    updated.splice(idx, 0, newSlide);
    notifyChange(updated.map((s, i) => ({ ...s, order: i })));
    setSelectedSlideId(newSlide.id);
  };

  const updateSlide = (updated: ComposerSlide) => {
    notifyChange(slides.map(s => s.id === updated.id ? updated : s));
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) { toast.error('Need at least one slide'); return; }
    const filtered = slides.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }));
    notifyChange(filtered);
    if (selectedSlideId === id) setSelectedSlideId(null);
  };

  const moveSlide = (fromIdx: number, toIdx: number) => {
    const updated = [...slides];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    notifyChange(updated.map((s, i) => ({ ...s, order: i })));
  };

  const duplicateSlide = (id: string) => {
    const source = slides.find(s => s.id === id);
    if (!source) return;
    const idx = slides.indexOf(source);
    const dup = createSlide({ ...source, id: crypto.randomUUID(), title: `${source.title} (copy)` });
    const updated = [...slides];
    updated.splice(idx + 1, 0, dup);
    notifyChange(updated.map((s, i) => ({ ...s, order: i })));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Presentation className="w-4 h-4 text-primary" />
                Slide Composer
              </CardTitle>
              <CardDescription className="text-xs">
                {slides.length} slides · ~{Math.floor(totalDuration / 60)}m {totalDuration % 60}s video time
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addSlide()}>
                <Plus className="w-3 h-3 mr-1" /> Add Slide
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Deck title */}
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="text-sm font-medium h-8"
        placeholder="Deck title..."
      />

      {/* Slide list */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {slides.map((slide, idx) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              index={idx}
              total={slides.length}
              isSelected={selectedSlideId === slide.id}
              onSelect={() => setSelectedSlideId(selectedSlideId === slide.id ? null : slide.id)}
              onUpdate={updateSlide}
              onRemove={() => removeSlide(slide.id)}
              onMoveUp={() => moveSlide(idx, idx - 1)}
              onMoveDown={() => moveSlide(idx, idx + 1)}
              onDuplicate={() => duplicateSlide(slide.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SlideComposer;
