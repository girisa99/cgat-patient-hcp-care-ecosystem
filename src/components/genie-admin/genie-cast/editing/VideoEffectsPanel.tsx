/**
 * VideoEffectsPanel — VFX/Filters Library for GenieSuite Cast
 *
 * Visual effects and filter management panel for the timeline editor.
 * Provides tabbed UI for color grading, filters, motion, composition, and presets.
 *
 * Features:
 *   - Color Grading: 16 preset cards + manual brightness/contrast/saturation/temperature sliders
 *   - Filters: 20 filter cards with intensity slider + enable/disable toggles
 *   - Motion: 14 motion effect cards with speed/direction controls
 *   - Composition: 10 composition modes with visual layout icons
 *   - Presets: 15+ preset packages with one-click apply
 *   - Per-clip effect stack with drag-to-reorder, intensity sliders, enable/disable
 *   - Apply to All Clips, Copy Effects, Preview per effect
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Palette,
  Wand2,
  Move,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  GripVertical,
  Play,
  Plus,
  Check,
  Sun,
  Contrast,
  Droplets,
  Thermometer,
  ChevronDown,
  Film,
  Image,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useVideoEffects,
  type ColorGradingPreset,
  type FilterType,
  type MotionEffect,
  type CompositionMode,
  COLOR_GRADING_META,
  FILTER_META,
  MOTION_META,
  COMPOSITION_META,
} from '@/hooks/video-editing/useVideoEffects';

// ─── Props ──────────────────────────────────────────────────────────────────

interface VideoEffectsPanelProps {
  selectedClipId: string | null;
  clipLabel?: string;
  onEffectsChange?: () => void;
  className?: string;
}

// ─── Tab Config ─────────────────────────────────────────────────────────────

const TAB_CONFIG = [
  { value: 'color_grading', label: 'Color Grading', icon: Palette },
  { value: 'filters', label: 'Filters', icon: Wand2 },
  { value: 'motion', label: 'Motion', icon: Move },
  { value: 'composition', label: 'Composition', icon: Layers },
  { value: 'presets', label: 'Presets', icon: Sparkles },
] as const;

// ─── Preset Category Labels ─────────────────────────────────────────────────

const PRESET_CATEGORY_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  cinematic: { label: 'Cinematic', icon: Film },
  social_media: { label: 'Social Media', icon: Zap },
  corporate: { label: 'Corporate', icon: Layers },
  documentary: { label: 'Documentary', icon: Image },
  creative: { label: 'Creative', icon: Sparkles },
  broadcast: { label: 'Broadcast', icon: Play },
  music_video: { label: 'Music Video', icon: Wand2 },
};

// ─── Color Grading Card ─────────────────────────────────────────────────────

function ColorGradingCard({
  preset,
  isActive,
  onSelect,
}: {
  preset: ColorGradingPreset;
  isActive: boolean;
  onSelect: () => void;
}) {
  const meta = COLOR_GRADING_META[preset];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative p-2.5 rounded-lg border-2 cursor-pointer transition-all text-center',
              isActive
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/20',
            )}
            onClick={onSelect}
          >
            {isActive && (
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-md bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
              <Palette className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-medium leading-tight block">{meta.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{meta.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Filter Card ────────────────────────────────────────────────────────────

function FilterCard({
  filter,
  isActive,
  intensity,
  onToggle,
  onIntensityChange,
}: {
  filter: FilterType;
  isActive: boolean;
  intensity: number;
  onToggle: () => void;
  onIntensityChange: (value: number) => void;
}) {
  const meta = FILTER_META[filter];

  return (
    <div
      className={cn(
        'relative p-2.5 rounded-lg border-2 transition-all',
        isActive
          ? 'border-primary bg-primary/10 shadow-sm'
          : 'border-muted hover:border-muted-foreground/30',
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium truncate flex-1">{meta.label}</span>
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          className="scale-75 -mr-1"
        />
      </div>
      <p className="text-[8px] text-muted-foreground mb-1.5 line-clamp-1">{meta.description}</p>
      {isActive && (
        <div className="flex items-center gap-1.5">
          <Slider
            value={[intensity]}
            onValueChange={([v]) => onIntensityChange(v)}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-[9px] text-muted-foreground w-7 text-right">{intensity}%</span>
        </div>
      )}
    </div>
  );
}

// ─── Motion Card ────────────────────────────────────────────────────────────

function MotionCard({
  motion,
  isActive,
  onSelect,
}: {
  motion: MotionEffect;
  isActive: boolean;
  onSelect: () => void;
}) {
  const meta = MOTION_META[motion];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative p-2.5 rounded-lg border-2 cursor-pointer transition-all text-center',
              isActive
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/20',
            )}
            onClick={onSelect}
          >
            {isActive && (
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-md bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
              <Move className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-medium leading-tight block">{meta.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{meta.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Composition Card ───────────────────────────────────────────────────────

function CompositionCard({
  mode,
  isActive,
  onSelect,
}: {
  mode: CompositionMode;
  isActive: boolean;
  onSelect: () => void;
}) {
  const meta = COMPOSITION_META[mode];

  // Visual layout icon per composition mode
  const layoutIcon = useMemo(() => {
    const baseClass = 'w-10 h-7 border border-muted-foreground/30 rounded-sm flex overflow-hidden';
    switch (mode) {
      case 'normal':
        return (
          <div className={baseClass}>
            <div className="w-full h-full bg-muted-foreground/15" />
          </div>
        );
      case 'picture_in_picture':
        return (
          <div className={cn(baseClass, 'relative')}>
            <div className="w-full h-full bg-muted-foreground/15" />
            <div className="absolute bottom-0.5 right-0.5 w-3 h-2 bg-primary/30 rounded-[1px] border border-primary/50" />
          </div>
        );
      case 'split_screen_h':
        return (
          <div className={cn(baseClass, 'gap-[1px]')}>
            <div className="w-1/2 h-full bg-muted-foreground/15" />
            <div className="w-1/2 h-full bg-muted-foreground/25" />
          </div>
        );
      case 'split_screen_v':
        return (
          <div className={cn(baseClass, 'flex-col gap-[1px]')}>
            <div className="w-full h-1/2 bg-muted-foreground/15" />
            <div className="w-full h-1/2 bg-muted-foreground/25" />
          </div>
        );
      case 'green_screen':
        return (
          <div className={cn(baseClass, 'relative')}>
            <div className="w-full h-full bg-green-500/20" />
            <div className="absolute inset-1 bg-muted-foreground/20 rounded-[1px]" />
          </div>
        );
      case 'overlay_blend':
        return (
          <div className={cn(baseClass, 'relative')}>
            <div className="w-full h-full bg-muted-foreground/15" />
            <div className="absolute inset-0 bg-primary/10" />
          </div>
        );
      case 'side_by_side':
        return (
          <div className={cn(baseClass, 'gap-[2px] p-0.5')}>
            <div className="w-1/2 h-full bg-muted-foreground/15 rounded-[1px]" />
            <div className="w-1/2 h-full bg-muted-foreground/25 rounded-[1px]" />
          </div>
        );
      case 'grid_2x2':
        return (
          <div className={cn(baseClass, 'flex-wrap gap-[1px] p-0.5')}>
            <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-muted-foreground/15" />
            <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-muted-foreground/20" />
            <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-muted-foreground/25" />
            <div className="w-[calc(50%-1px)] h-[calc(50%-1px)] bg-muted-foreground/30" />
          </div>
        );
      case 'cutaway':
        return (
          <div className={cn(baseClass, 'relative')}>
            <div className="w-full h-full bg-muted-foreground/15" />
            <div className="absolute top-0 left-0 w-full h-full bg-primary/15 clip-path-cutaway" />
          </div>
        );
      case 'reaction':
        return (
          <div className={cn(baseClass, 'relative')}>
            <div className="w-full h-full bg-muted-foreground/15" />
            <div className="absolute bottom-0.5 left-0.5 w-3.5 h-2.5 bg-primary/30 rounded-[1px] border border-primary/50" />
          </div>
        );
      default:
        return (
          <div className={baseClass}>
            <div className="w-full h-full bg-muted-foreground/15" />
          </div>
        );
    }
  }, [mode]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative p-2.5 rounded-lg border-2 cursor-pointer transition-all text-center',
              isActive
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/20',
            )}
            onClick={onSelect}
          >
            {isActive && (
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
            <div className="flex justify-center mb-1.5">{layoutIcon}</div>
            <span className="text-[10px] font-medium leading-tight block">{meta.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{meta.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Effect Stack Row ───────────────────────────────────────────────────────

function EffectStackRow({
  effect,
  onToggle,
  onRemove,
  onIntensityChange,
  onPreview,
}: {
  effect: { id: string; category: string; type: string; intensity: number; enabled: boolean };
  onToggle: () => void;
  onRemove: () => void;
  onIntensityChange: (value: number) => void;
  onPreview: () => void;
}) {
  const categoryIcons: Record<string, React.ElementType> = {
    color_grading: Palette,
    filter: Wand2,
    motion: Move,
    composition: Layers,
    overlay: Image,
    transition: Film,
    text: Sparkles,
  };
  const Icon = categoryIcons[effect.category] || Wand2;

  const categoryLabels: Record<string, string> = {
    color_grading: 'Color',
    filter: 'Filter',
    motion: 'Motion',
    composition: 'Comp',
    overlay: 'Overlay',
    transition: 'Trans',
    text: 'Text',
  };

  const typeLabel = effect.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className={cn(
      'flex items-center gap-2 p-2 rounded-lg border transition-all',
      effect.enabled ? 'bg-background border-border' : 'bg-muted/30 border-muted opacity-60',
    )}>
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab flex-shrink-0" />
      <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[8px] h-3.5 px-1">{categoryLabels[effect.category] || effect.category}</Badge>
          <span className="text-xs font-medium truncate">{typeLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Slider
            value={[effect.intensity]}
            onValueChange={([v]) => onIntensityChange(v)}
            min={0}
            max={100}
            step={1}
            className="flex-1"
            disabled={!effect.enabled}
          />
          <span className="text-[9px] text-muted-foreground w-7 text-right">{effect.intensity}%</span>
        </div>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onPreview}>
                <Play className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Preview</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
                {effect.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{effect.enabled ? 'Disable' : 'Enable'}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onRemove}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Remove</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function VideoEffectsPanel({
  selectedClipId,
  clipLabel,
  onEffectsChange,
  className,
}: VideoEffectsPanelProps) {
  const effects = useVideoEffects();
  const {
    clipEffects,
    activePreviewClipId,
    isProcessing,
    presets,
    addEffect,
    removeEffect,
    updateEffect,
    toggleEffect,
    clearClipEffects,
    applyPreset,
    applyPresetToAll,
    setColorGrading,
    adjustColorGrading,
    addFilter,
    setMotionEffect,
    setCompositionMode,
    previewEffect,
    stopPreview,
    copyEffects,
    effectCount,
    clipsWithEffects,
  } = effects;

  const [activeTab, setActiveTab] = useState('color_grading');
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('all');
  const [colorAdjustments, setColorAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
  });

  // Current clip effects
  const currentEffects = useMemo(() => {
    if (!selectedClipId) return [];
    return (clipEffects[selectedClipId] || []).sort((a, b) => a.order - b.order);
  }, [clipEffects, selectedClipId]);

  // Active color grading preset for current clip
  const activeColorGrading = useMemo((): ColorGradingPreset => {
    const grading = currentEffects.find(e => e.category === 'color_grading');
    return (grading?.type as ColorGradingPreset) || 'none';
  }, [currentEffects]);

  // Active motion effect for current clip
  const activeMotion = useMemo((): MotionEffect => {
    const motion = currentEffects.find(e => e.category === 'motion');
    return (motion?.type as MotionEffect) || 'none';
  }, [currentEffects]);

  // Active composition mode for current clip
  const activeComposition = useMemo((): CompositionMode => {
    const comp = currentEffects.find(e => e.category === 'composition');
    return (comp?.type as CompositionMode) || 'normal';
  }, [currentEffects]);

  // Active filters with their effect IDs
  const activeFilters = useMemo((): Map<FilterType, { effectId: string; intensity: number }> => {
    const map = new Map<FilterType, { effectId: string; intensity: number }>();
    currentEffects
      .filter(e => e.category === 'filter')
      .forEach(e => {
        map.set(e.type as FilterType, { effectId: e.id, intensity: e.intensity });
      });
    return map;
  }, [currentEffects]);

  // Filtered presets for presets tab
  const filteredPresets = useMemo(() => {
    if (presetCategoryFilter === 'all') return presets;
    return presets.filter(p => p.category === presetCategoryFilter);
  }, [presets, presetCategoryFilter]);

  // All color grading presets
  const allColorGradingPresets: ColorGradingPreset[] = [
    'none', 'warm', 'cool', 'vintage', 'noir', 'vivid', 'cinematic',
    'documentary', 'neon', 'pastel', 'high_contrast', 'low_contrast',
    'bleach_bypass', 'cross_process', 'teal_orange', 'desaturated',
  ];

  // All filters
  const allFilters: FilterType[] = [
    'blur', 'gaussian_blur', 'motion_blur', 'sharpen', 'vignette',
    'grain', 'glow', 'sepia', 'grayscale', 'invert', 'emboss',
    'edge_detect', 'posterize', 'pixelate', 'chromatic_aberration',
    'lens_flare', 'light_leak', 'film_dust', 'glitch', 'halftone',
  ];

  // All motion effects
  const allMotions: MotionEffect[] = [
    'none', 'ken_burns', 'parallax', 'zoom_in', 'zoom_out',
    'pan_left', 'pan_right', 'pan_up', 'pan_down', 'dolly_zoom',
    'orbit', 'shake', 'float', 'bounce',
  ];

  // All composition modes
  const allCompositions: CompositionMode[] = [
    'normal', 'picture_in_picture', 'split_screen_h', 'split_screen_v',
    'green_screen', 'overlay_blend', 'side_by_side', 'grid_2x2',
    'cutaway', 'reaction',
  ];

  // Handlers
  const handleColorGradingSelect = useCallback((preset: ColorGradingPreset) => {
    if (!selectedClipId) return;
    setColorGrading(selectedClipId, preset);
    onEffectsChange?.();
  }, [selectedClipId, setColorGrading, onEffectsChange]);

  const handleColorAdjustment = useCallback((key: string, value: number) => {
    if (!selectedClipId) return;
    const updated = { ...colorAdjustments, [key]: value };
    setColorAdjustments(updated);
    adjustColorGrading(selectedClipId, updated);
    onEffectsChange?.();
  }, [selectedClipId, colorAdjustments, adjustColorGrading, onEffectsChange]);

  const handleFilterToggle = useCallback((filter: FilterType) => {
    if (!selectedClipId) return;
    const existing = activeFilters.get(filter);
    if (existing) {
      removeEffect(existing.effectId);
    } else {
      addFilter(selectedClipId, filter);
    }
    onEffectsChange?.();
  }, [selectedClipId, activeFilters, removeEffect, addFilter, onEffectsChange]);

  const handleFilterIntensity = useCallback((filter: FilterType, intensity: number) => {
    const existing = activeFilters.get(filter);
    if (!existing) return;
    updateEffect(existing.effectId, { intensity });
    onEffectsChange?.();
  }, [activeFilters, updateEffect, onEffectsChange]);

  const handleMotionSelect = useCallback((motion: MotionEffect) => {
    if (!selectedClipId) return;
    setMotionEffect(selectedClipId, motion);
    onEffectsChange?.();
  }, [selectedClipId, setMotionEffect, onEffectsChange]);

  const handleCompositionSelect = useCallback((mode: CompositionMode) => {
    if (!selectedClipId) return;
    setCompositionMode(selectedClipId, mode);
    onEffectsChange?.();
  }, [selectedClipId, setCompositionMode, onEffectsChange]);

  const handlePresetApply = useCallback((presetId: string) => {
    if (!selectedClipId) return;
    applyPreset(selectedClipId, presetId);
    onEffectsChange?.();
  }, [selectedClipId, applyPreset, onEffectsChange]);

  const handlePresetApplyAll = useCallback((presetId: string) => {
    applyPresetToAll(presetId);
    onEffectsChange?.();
  }, [applyPresetToAll, onEffectsChange]);

  const handleEffectRemove = useCallback((effectId: string) => {
    removeEffect(effectId);
    onEffectsChange?.();
  }, [removeEffect, onEffectsChange]);

  const handleEffectToggle = useCallback((effectId: string) => {
    toggleEffect(effectId);
    onEffectsChange?.();
  }, [toggleEffect, onEffectsChange]);

  const handleEffectIntensity = useCallback((effectId: string, intensity: number) => {
    updateEffect(effectId, { intensity });
    onEffectsChange?.();
  }, [updateEffect, onEffectsChange]);

  const handleClearEffects = useCallback(() => {
    if (!selectedClipId) return;
    clearClipEffects(selectedClipId);
    onEffectsChange?.();
  }, [selectedClipId, clearClipEffects, onEffectsChange]);

  const handlePreview = useCallback(() => {
    if (!selectedClipId) return;
    if (activePreviewClipId === selectedClipId) {
      stopPreview();
    } else {
      previewEffect(selectedClipId);
    }
  }, [selectedClipId, activePreviewClipId, previewEffect, stopPreview]);

  // No clip selected state
  if (!selectedClipId) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Video Effects
          </CardTitle>
          <CardDescription className="text-xs">
            Select a clip on the timeline to apply visual effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Wand2 className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No clip selected</p>
            <p className="text-[10px] mt-1">Click a clip on the timeline to start adding effects</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Video Effects
            </CardTitle>
            <CardDescription className="text-xs">
              {clipLabel ? `Editing: ${clipLabel}` : 'Apply visual effects and filters to the selected clip'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {currentEffects.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {currentEffects.length} effect{currentEffects.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activePreviewClipId === selectedClipId ? 'default' : 'outline'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={handlePreview}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{activePreviewClipId === selectedClipId ? 'Stop Preview' : 'Preview Effects'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Effect Stack */}
        {currentEffects.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-muted-foreground">Effect Stack</h4>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => {
                        if (selectedClipId) {
                          const allClipIds = Object.keys(clipEffects).filter(id => id !== selectedClipId);
                          if (allClipIds.length > 0) {
                            copyEffects(selectedClipId, allClipIds);
                            onEffectsChange?.();
                          }
                        }
                      }}>
                        <Copy className="h-3 w-3" />
                        Copy to All
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Copy effects to all other clips</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-destructive hover:text-destructive" onClick={handleClearEffects}>
                  <Trash2 className="h-3 w-3" />
                  Clear All
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-[180px]">
              <div className="space-y-1.5">
                {currentEffects.map(effect => (
                  <EffectStackRow
                    key={effect.id}
                    effect={effect}
                    onToggle={() => handleEffectToggle(effect.id)}
                    onRemove={() => handleEffectRemove(effect.id)}
                    onIntensityChange={(v) => handleEffectIntensity(effect.id, v)}
                    onPreview={handlePreview}
                  />
                ))}
              </div>
            </ScrollArea>
            <Separator />
          </>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto flex-nowrap">
            {TAB_CONFIG.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs h-7 gap-1 flex-shrink-0">
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Color Grading Tab ────────────────────────────────────────── */}
          <TabsContent value="color_grading" className="mt-3 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Color Presets</h4>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
                {allColorGradingPresets.map(preset => (
                  <ColorGradingCard
                    key={preset}
                    preset={preset}
                    isActive={activeColorGrading === preset}
                    onSelect={() => handleColorGradingSelect(preset)}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">Manual Adjustments</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs">Brightness</Label>
                  </div>
                  <Slider
                    value={[colorAdjustments.brightness]}
                    onValueChange={([v]) => handleColorAdjustment('brightness', v)}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{colorAdjustments.brightness}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Contrast className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs">Contrast</Label>
                  </div>
                  <Slider
                    value={[colorAdjustments.contrast]}
                    onValueChange={([v]) => handleColorAdjustment('contrast', v)}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{colorAdjustments.contrast}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs">Saturation</Label>
                  </div>
                  <Slider
                    value={[colorAdjustments.saturation]}
                    onValueChange={([v]) => handleColorAdjustment('saturation', v)}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{colorAdjustments.saturation}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs">Temperature</Label>
                  </div>
                  <Slider
                    value={[colorAdjustments.temperature]}
                    onValueChange={([v]) => handleColorAdjustment('temperature', v)}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{colorAdjustments.temperature}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs">Tint</Label>
                  </div>
                  <Slider
                    value={[colorAdjustments.tint]}
                    onValueChange={([v]) => handleColorAdjustment('tint', v)}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{colorAdjustments.tint}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs">Highlights</Label>
                  </div>
                  <Slider
                    value={[colorAdjustments.highlights]}
                    onValueChange={([v]) => handleColorAdjustment('highlights', v)}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{colorAdjustments.highlights}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    <Contrast className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-xs">Shadows</Label>
                  </div>
                  <Slider
                    value={[colorAdjustments.shadows]}
                    onValueChange={([v]) => handleColorAdjustment('shadows', v)}
                    min={-100}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{colorAdjustments.shadows}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    const reset = { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, highlights: 0, shadows: 0 };
                    setColorAdjustments(reset);
                    if (selectedClipId) {
                      adjustColorGrading(selectedClipId, reset);
                      onEffectsChange?.();
                    }
                  }}
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset Adjustments
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Filters Tab ──────────────────────────────────────────────── */}
          <TabsContent value="filters" className="mt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {allFilters.map(filter => {
                const active = activeFilters.get(filter);
                return (
                  <FilterCard
                    key={filter}
                    filter={filter}
                    isActive={!!active}
                    intensity={active?.intensity ?? FILTER_META[filter].defaultIntensity}
                    onToggle={() => handleFilterToggle(filter)}
                    onIntensityChange={(v) => handleFilterIntensity(filter, v)}
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* ── Motion Tab ───────────────────────────────────────────────── */}
          <TabsContent value="motion" className="mt-3">
            <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5">
              {allMotions.map(motion => (
                <MotionCard
                  key={motion}
                  motion={motion}
                  isActive={activeMotion === motion}
                  onSelect={() => handleMotionSelect(motion)}
                />
              ))}
            </div>
          </TabsContent>

          {/* ── Composition Tab ──────────────────────────────────────────── */}
          <TabsContent value="composition" className="mt-3">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {allCompositions.map(mode => (
                <CompositionCard
                  key={mode}
                  mode={mode}
                  isActive={activeComposition === mode}
                  onSelect={() => handleCompositionSelect(mode)}
                />
              ))}
            </div>
          </TabsContent>

          {/* ── Presets Tab ──────────────────────────────────────────────── */}
          <TabsContent value="presets" className="mt-3 space-y-3">
            {/* Category filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant={presetCategoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-[10px]"
                onClick={() => setPresetCategoryFilter('all')}
              >
                All
              </Button>
              {Object.entries(PRESET_CATEGORY_LABELS).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={key}
                    variant={presetCategoryFilter === key ? 'default' : 'outline'}
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={() => setPresetCategoryFilter(key)}
                  >
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Button>
                );
              })}
            </div>

            {/* Preset grid */}
            <ScrollArea className="max-h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredPresets.map(preset => {
                  const categoryConfig = PRESET_CATEGORY_LABELS[preset.category];
                  const CategoryIcon = categoryConfig?.icon || Sparkles;
                  return (
                    <div
                      key={preset.id}
                      className="p-3 rounded-lg border-2 border-muted hover:border-muted-foreground/30 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-semibold truncate">{preset.name}</span>
                        <Badge variant="outline" className="text-[8px] h-3.5 px-1 ml-auto flex-shrink-0">
                          {preset.effects.length} fx
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{preset.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {preset.effects.map((fx, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[8px] h-3.5 px-1">
                            {fx.type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-6 text-[10px] gap-1 flex-1"
                          onClick={() => handlePresetApply(preset.id)}
                        >
                          <Plus className="h-3 w-3" />
                          Apply
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] gap-1"
                                onClick={() => handlePresetApplyAll(preset.id)}
                              >
                                <Layers className="h-3 w-3" />
                                All Clips
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Apply this preset to all clips on the timeline</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer stats */}
        <Separator />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
          <span>{effectCount} total effect{effectCount !== 1 ? 's' : ''} across {clipsWithEffects} clip{clipsWithEffects !== 1 ? 's' : ''}</span>
          {isProcessing && (
            <Badge variant="secondary" className="text-[8px] h-3.5 gap-1">
              <RefreshCw className="h-2.5 w-2.5 animate-spin" />
              Processing
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default VideoEffectsPanel;
