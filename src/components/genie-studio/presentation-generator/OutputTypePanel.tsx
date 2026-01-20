/**
 * Output Type Selection Panel - Refactored for clean dropdown-based selection
 * Uses flat architecture without nested cards
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Image as ImageIcon,
  Sparkles,
  Box,
  Orbit,
  Video,
  Film,
  MousePointerClick,
  Layers,
  Check,
  Info,
  Zap,
  Clock,
  Cpu,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OutputType, OUTPUT_TYPE_CONFIGS } from './types';
import { OutputTypeDropdown } from './components/OutputTypeDropdown';
import { SlideCountRecommendation } from './components/SlideCountRecommendation';

// Icon mapping
const outputIcons: Record<string, React.ReactNode> = {
  'Image': <ImageIcon className="h-4 w-4" />,
  'Sparkles': <Sparkles className="h-4 w-4" />,
  'Box': <Box className="h-4 w-4" />,
  'Orbit': <Orbit className="h-4 w-4" />,
  'Video': <Video className="h-4 w-4" />,
  'Film': <Film className="h-4 w-4" />,
  'MousePointerClick': <MousePointerClick className="h-4 w-4" />,
  'Layers': <Layers className="h-4 w-4" />,
};

// Tier badges
const tierBadges: Record<1 | 2 | 3, { label: string; color: string }> = {
  1: { label: 'Standard', color: 'bg-success/20 text-success' },
  2: { label: 'Advanced', color: 'bg-primary/20 text-primary' },
  3: { label: 'Premium', color: 'bg-accent/20 text-accent-foreground' },
};

// Structure mode options
type StructureMode = 'flat' | 'chapters';

interface OutputTypeSettings {
  outputType: OutputType;
  structureMode: StructureMode;
  slideCount: number;
  chapterCount: number;
  slidesPerChapter: number;
  includeVoiceover: boolean;
  includeMusic: boolean;
  animationIntensity: number;
  resolution: '720p' | '1080p' | '4k';
  aspectRatio: '16:9' | '4:3' | '9:16' | '1:1';
  duration?: number;
}

interface OutputTypePanelProps {
  value: OutputTypeSettings;
  onChange: (settings: OutputTypeSettings) => void;
  suggestedSlideCount?: number;
  contentType?: string;
  className?: string;
}

export function OutputTypePanel({
  value,
  onChange,
  suggestedSlideCount = 10,
  contentType,
  className
}: OutputTypePanelProps) {
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleOutputSelect = (outputType: OutputType) => {
    onChange({
      ...value,
      outputType,
      includeVoiceover: outputType.includes('video'),
      includeMusic: outputType === 'video-full',
      animationIntensity: outputType.includes('animated') ? 70 : outputType.includes('3d') ? 50 : 30,
    });
  };

  const selectedConfig = OUTPUT_TYPE_CONFIGS.find(c => c.id === value.outputType);
  const isVideoType = value.outputType.includes('video');
  const is3DType = value.outputType.includes('3d');
  const isAnimated = value.outputType.includes('animated') || isVideoType;

  // Calculate totals
  const totalItems = value.structureMode === 'flat' 
    ? value.slideCount 
    : value.chapterCount * value.slidesPerChapter;
  const genTimeMinutes = Math.ceil((totalItems * (isVideoType ? 30 : is3DType ? 20 : 8)) / 60);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Output Type Dropdown */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Output Format</Label>
        <OutputTypeDropdown
          value={value.outputType}
          onChange={handleOutputSelect}
        />
      </div>

      {/* Selected Output Quick Info */}
      {selectedConfig && (
        <div className="p-4 rounded-lg bg-muted/30 border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                {outputIcons[selectedConfig.icon]}
              </div>
              <span className="font-medium text-sm">{selectedConfig.name}</span>
              <Badge className={cn("text-[10px]", tierBadges[selectedConfig.tier].color)}>
                {tierBadges[selectedConfig.tier].label}
              </Badge>
            </div>
          </div>
          
          {/* Capabilities - horizontal scrollable */}
          <div className="flex flex-wrap gap-1.5">
            {selectedConfig.capabilities.slice(0, 5).map((cap) => (
              <Badge key={cap} variant="secondary" className="text-[10px] px-2 py-0.5">
                <Check className="h-2.5 w-2.5 mr-1" />
                {cap}
              </Badge>
            ))}
            {selectedConfig.capabilities.length > 5 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                +{selectedConfig.capabilities.length - 5} more
              </Badge>
            )}
          </div>

          {/* Providers row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Providers:</span>
            <span className="truncate">
              {selectedConfig.providers.slice(0, 3).join(', ')}
              {selectedConfig.providers.length > 3 && ` +${selectedConfig.providers.length - 3}`}
            </span>
          </div>
        </div>
      )}

      {/* Content Structure Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Content Structure</Label>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => onChange({ ...value, structureMode: 'flat' })}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-colors",
                value.structureMode === 'flat' 
                  ? "bg-background text-foreground shadow-sm font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Flat
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...value, structureMode: 'chapters' })}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-colors",
                value.structureMode === 'chapters' 
                  ? "bg-background text-foreground shadow-sm font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Chapters
            </button>
          </div>
        </div>

        {/* Structure Settings Grid */}
        <div className="grid grid-cols-2 gap-4">
          {value.structureMode === 'flat' ? (
            <div className="col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Number of {isVideoType ? 'Scenes' : 'Slides'}
                </Label>
                {contentType && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-primary hover:text-primary"
                    onClick={() => setShowRecommendation(!showRecommendation)}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {showRecommendation ? 'Hide' : 'Show'} AI Recommendations
                  </Button>
                )}
              </div>
              
              {showRecommendation && contentType && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                  <SlideCountRecommendation
                    contentType={contentType}
                    outputType={value.outputType}
                    currentCount={value.slideCount}
                    onCountChange={(count) => onChange({ ...value, slideCount: count })}
                    minSlides={3}
                    maxSlides={20}
                    className="border-0 p-0 bg-transparent"
                  />
                </div>
              )}
              
              {!showRecommendation && (
                <Select
                  value={String(value.slideCount)}
                  onValueChange={(v) => onChange({ ...value, slideCount: Math.min(20, Number(v)) })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 8, 10, 12, 15, 20].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {isVideoType ? 'scenes' : 'slides'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Chapters</Label>
                <Select
                  value={String(value.chapterCount)}
                  onValueChange={(v) => onChange({ ...value, chapterCount: Number(v) })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chapters" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} Chapter{n > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  {isVideoType ? 'Scenes' : 'Slides'} per Chapter
                </Label>
                <Select
                  value={String(value.slidesPerChapter)}
                  onValueChange={(v) => onChange({ ...value, slidesPerChapter: Number(v) })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Count" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quality Settings */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Quality Settings</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Resolution</Label>
            <Select
              value={value.resolution}
              onValueChange={(v) => onChange({ ...value, resolution: v as any })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="1080p">1080p (HD)</SelectItem>
                <SelectItem value="4k">4K Ultra HD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
            <Select
              value={value.aspectRatio}
              onValueChange={(v) => onChange({ ...value, aspectRatio: v as any })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 Widescreen</SelectItem>
                <SelectItem value="4:3">4:3 Standard</SelectItem>
                <SelectItem value="9:16">9:16 Vertical</SelectItem>
                <SelectItem value="1:1">1:1 Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      {(isAnimated || isVideoType) && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Advanced Settings
          </button>

          {showAdvanced && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
              {/* Animation Intensity */}
              {isAnimated && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Animation Intensity</Label>
                    <span className="text-xs text-muted-foreground">{value.animationIntensity}%</span>
                  </div>
                  <Slider
                    value={[value.animationIntensity]}
                    onValueChange={([v]) => onChange({ ...value, animationIntensity: v })}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Subtle</span>
                    <span>Dynamic</span>
                  </div>
                </div>
              )}

              {/* Video Duration */}
              {isVideoType && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Estimated Duration</Label>
                    <span className="text-xs font-medium text-primary">
                      ~{Math.round((totalItems * 8) / 60)} min
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Based on {totalItems} scenes × ~8s each
                  </p>
                </div>
              )}

              {/* Audio Settings */}
              {isVideoType && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs">AI Voiceover</Label>
                      <p className="text-[10px] text-muted-foreground">Generate narration</p>
                    </div>
                    <Switch
                      checked={value.includeVoiceover}
                      onCheckedChange={(checked) => onChange({ ...value, includeVoiceover: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs">Background Music</Label>
                      <p className="text-[10px] text-muted-foreground">AI-generated music</p>
                    </div>
                    <Switch
                      checked={value.includeMusic}
                      onCheckedChange={(checked) => onChange({ ...value, includeMusic: checked })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Generation Estimate Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Generation Estimate</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-background/80 rounded-md">
            <div className="text-xl font-bold text-primary">{totalItems}</div>
            <div className="text-[10px] text-muted-foreground">
              {isVideoType ? 'Scenes' : is3DType ? '3D Scenes' : 'Slides'}
            </div>
          </div>
          <div className="text-center p-2 bg-background/80 rounded-md">
            <div className="text-xl font-bold text-primary flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              {genTimeMinutes}m
            </div>
            <div className="text-[10px] text-muted-foreground">Gen Time</div>
          </div>
          <div className="text-center p-2 bg-background/80 rounded-md">
            <div className="text-xl font-bold text-primary flex items-center justify-center gap-1">
              <Cpu className="h-4 w-4" />
              {selectedConfig?.tier === 3 ? 'High' : selectedConfig?.tier === 2 ? 'Med' : 'Low'}
            </div>
            <div className="text-[10px] text-muted-foreground">Resources</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default settings factory
export function getDefaultOutputSettings(slideCount: number = 10): OutputTypeSettings {
  return {
    outputType: '2d-static',
    structureMode: 'flat',
    slideCount: slideCount,
    chapterCount: Math.max(1, Math.ceil(slideCount / 5)),
    slidesPerChapter: Math.min(5, slideCount),
    includeVoiceover: false,
    includeMusic: false,
    animationIntensity: 30,
    resolution: '1080p',
    aspectRatio: '16:9',
  };
}

export type { OutputTypeSettings };
