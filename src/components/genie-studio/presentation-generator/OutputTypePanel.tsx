/**
 * Output Type Selection Panel - Dedicated step for choosing output format
 * Supports: 2D Static, 2D Animated, 3D Scene, 3D Animated, Video, Interactive
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OutputType, OUTPUT_TYPE_CONFIGS, OutputTypeConfig } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Icon mapping
const outputIcons: Record<string, React.ReactNode> = {
  'Image': <ImageIcon className="h-6 w-6" />,
  'Sparkles': <Sparkles className="h-6 w-6" />,
  'Box': <Box className="h-6 w-6" />,
  'Orbit': <Orbit className="h-6 w-6" />,
  'Video': <Video className="h-6 w-6" />,
  'Film': <Film className="h-6 w-6" />,
  'MousePointerClick': <MousePointerClick className="h-6 w-6" />,
  'Layers': <Layers className="h-6 w-6" />,
};

// Tier badges
const tierBadges: Record<1 | 2 | 3, { label: string; color: string }> = {
  1: { label: 'Standard', color: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  2: { label: 'Advanced', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  3: { label: 'Premium', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-400' },
};

interface OutputTypeSettings {
  outputType: OutputType;
  chapterCount: number;
  slidesPerChapter: number;
  includeVoiceover: boolean;
  includeMusic: boolean;
  animationIntensity: number; // 0-100
  resolution: '720p' | '1080p' | '4k';
  aspectRatio: '16:9' | '4:3' | '9:16' | '1:1';
  duration?: number; // For video (seconds)
}

interface OutputTypePanelProps {
  value: OutputTypeSettings;
  onChange: (settings: OutputTypeSettings) => void;
  slideCount?: number;
  className?: string;
}

export function OutputTypePanel({
  value,
  onChange,
  slideCount = 10,
  className
}: OutputTypePanelProps) {
  const [selectedOutput, setSelectedOutput] = useState<OutputType>(value.outputType);
  
  const handleOutputSelect = (outputType: OutputType) => {
    setSelectedOutput(outputType);
    onChange({
      ...value,
      outputType,
      // Reset settings based on output type
      includeVoiceover: outputType.includes('video'),
      includeMusic: outputType === 'video-full',
      animationIntensity: outputType.includes('animated') ? 70 : outputType.includes('3d') ? 50 : 30,
    });
  };

  const selectedConfig = OUTPUT_TYPE_CONFIGS.find(c => c.id === selectedOutput);
  const isVideoType = selectedOutput.includes('video');
  const is3DType = selectedOutput.includes('3d');
  const isAnimated = selectedOutput.includes('animated') || isVideoType;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Output Type</h3>
        <p className="text-sm text-muted-foreground">
          Choose the format for your generated content
        </p>
      </div>

      {/* Output Type Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {OUTPUT_TYPE_CONFIGS.map((config) => {
          const isSelected = selectedOutput === config.id;
          const tierInfo = tierBadges[config.tier];
          
          return (
            <TooltipProvider key={config.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50 relative",
                      isSelected && "border-primary ring-2 ring-primary/20 bg-primary/5"
                    )}
                    onClick={() => handleOutputSelect(config.id)}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      {/* Tier Badge */}
                      <Badge className={cn("absolute top-2 right-2 text-[9px]", tierInfo.color)}>
                        {tierInfo.label}
                      </Badge>
                      
                      {/* Icon */}
                      <div className={cn(
                        "mx-auto w-12 h-12 rounded-xl flex items-center justify-center",
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {outputIcons[config.icon]}
                      </div>
                      
                      {/* Name */}
                      <h4 className="font-medium text-sm">{config.name}</h4>
                      
                      {/* Selected Check */}
                      {isSelected && (
                        <div className="absolute top-2 left-2">
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px]">
                  <p className="font-medium">{config.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {config.capabilities.slice(0, 3).map((cap) => (
                      <Badge key={cap} variant="outline" className="text-[9px]">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Selected Output Details */}
      {selectedConfig && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {outputIcons[selectedConfig.icon]}
              {selectedConfig.name} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Capabilities */}
            <div className="flex flex-wrap gap-2">
              {selectedConfig.capabilities.map((cap) => (
                <Badge key={cap} variant="secondary" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  {cap}
                </Badge>
              ))}
            </div>

            {/* Providers */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Available Providers</Label>
              <div className="flex flex-wrap gap-1">
                {selectedConfig.providers.slice(0, 5).map((provider) => (
                  <Badge key={provider} variant="outline" className="text-[10px]">
                    {provider}
                  </Badge>
                ))}
                {selectedConfig.providers.length > 5 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{selectedConfig.providers.length - 5} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Structure Settings */}
            <div className="grid grid-cols-2 gap-4">
              {/* Chapters */}
              <div className="space-y-2">
                <Label className="text-xs">Chapters</Label>
                <Select
                  value={String(value.chapterCount)}
                  onValueChange={(v) => onChange({ ...value, chapterCount: Number(v) })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chapters" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} Chapter{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Slides/Scenes per Chapter */}
              <div className="space-y-2">
                <Label className="text-xs">{isVideoType ? 'Scenes' : 'Slides'} per Chapter</Label>
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

              {/* Resolution */}
              <div className="space-y-2">
                <Label className="text-xs">Resolution</Label>
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

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label className="text-xs">Aspect Ratio</Label>
                <Select
                  value={value.aspectRatio}
                  onValueChange={(v) => onChange({ ...value, aspectRatio: v as any })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Animation Intensity (for animated types) */}
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
                  <span className="text-xs text-muted-foreground">
                    ~{Math.round((value.chapterCount * value.slidesPerChapter * 8) / 60)} min
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Based on {value.chapterCount * value.slidesPerChapter} scenes × ~8s each
                </p>
              </div>
            )}

            {/* Audio Settings (for video types) */}
            {isVideoType && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">AI Voiceover</Label>
                    <p className="text-[10px] text-muted-foreground">Generate narration for each scene</p>
                  </div>
                  <Switch
                    checked={value.includeVoiceover}
                    onCheckedChange={(checked) => onChange({ ...value, includeVoiceover: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Background Music</Label>
                    <p className="text-[10px] text-muted-foreground">Add AI-generated background music</p>
                  </div>
                  <Switch
                    checked={value.includeMusic}
                    onCheckedChange={(checked) => onChange({ ...value, includeMusic: checked })}
                  />
                </div>
              </div>
            )}

            {/* Estimation Summary */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Info className="h-3.5 w-3.5 text-primary" />
                Generation Estimate
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-background rounded">
                  <div className="text-lg font-bold text-primary">
                    {value.chapterCount * value.slidesPerChapter}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {isVideoType ? 'Scenes' : is3DType ? '3D Scenes' : 'Slides'}
                  </div>
                </div>
                <div className="p-2 bg-background rounded">
                  <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    ~{Math.ceil((value.chapterCount * value.slidesPerChapter * (isVideoType ? 30 : is3DType ? 20 : 8)) / 60)}m
                  </div>
                  <div className="text-[10px] text-muted-foreground">Gen Time</div>
                </div>
                <div className="p-2 bg-background rounded">
                  <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                    <Cpu className="h-4 w-4" />
                    {selectedConfig.tier === 3 ? 'High' : selectedConfig.tier === 2 ? 'Med' : 'Low'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Resources</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Default settings factory
export function getDefaultOutputSettings(slideCount: number = 10): OutputTypeSettings {
  return {
    outputType: '2d-static',
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
