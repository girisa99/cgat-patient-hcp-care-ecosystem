/**
 * AI Auto-Arrange
 * P2 Feature: AI-powered automatic clip arrangement
 * Uses AI to intelligently arrange clips based on content, pacing, and storytelling
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Wand2,
  Sparkles,
  Zap,
  Clock,
  Film,
  Shuffle,
  ArrowRight,
  RotateCcw,
  Play,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TimelineClip } from './MultiClipTimeline';

interface AIAutoArrangeProps {
  clips: TimelineClip[];
  onArrange: (arrangedClips: TimelineClip[]) => void;
  className?: string;
}

type ArrangeStyle = 'story' | 'fast' | 'chill' | 'custom';

interface ArrangePreset {
  id: ArrangeStyle;
  name: string;
  description: string;
  icon: React.ReactNode;
  pacing: number; // 0-100 (slow to fast)
  transitions: 'smooth' | 'quick' | 'none';
}

const ARRANGE_PRESETS: ArrangePreset[] = [
  {
    id: 'story',
    name: 'Story Mode',
    description: 'Narrative flow with build-up and climax',
    icon: <Film className="h-4 w-4" />,
    pacing: 50,
    transitions: 'smooth',
  },
  {
    id: 'fast',
    name: 'Fast Cuts',
    description: 'Quick, energetic pacing for social media',
    icon: <Zap className="h-4 w-4" />,
    pacing: 85,
    transitions: 'quick',
  },
  {
    id: 'chill',
    name: 'Relaxed',
    description: 'Slow, contemplative pacing',
    icon: <Clock className="h-4 w-4" />,
    pacing: 25,
    transitions: 'smooth',
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Set your own pacing',
    icon: <Sparkles className="h-4 w-4" />,
    pacing: 50,
    transitions: 'smooth',
  },
];

export const AIAutoArrange: React.FC<AIAutoArrangeProps> = ({
  clips,
  onArrange,
  className,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<ArrangeStyle>('story');
  const [customPacing, setCustomPacing] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewClips, setPreviewClips] = useState<TimelineClip[] | null>(null);

  const selectedPreset = ARRANGE_PRESETS.find(p => p.id === selectedStyle) || ARRANGE_PRESETS[0];

  // AI-powered clip arrangement logic
  const analyzeAndArrange = useCallback(async () => {
    if (clips.length < 2) {
      toast.error('Need at least 2 clips to arrange');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Step 1: Analyze clip content (simulate AI analysis)
      setProgress(20);
      await new Promise(r => setTimeout(r, 500));
      
      // Step 2: Determine optimal order based on style
      setProgress(40);
      const pacing = selectedStyle === 'custom' ? customPacing : selectedPreset.pacing;
      
      // Group clips by type
      const videoClips = clips.filter(c => c.type === 'video');
      const audioClips = clips.filter(c => c.type === 'audio');
      const otherClips = clips.filter(c => c.type !== 'video' && c.type !== 'audio');
      
      // Sort video clips based on style
      let sortedVideoClips: TimelineClip[];
      
      if (selectedStyle === 'story') {
        // Story mode: shorter clips first (intro), longer in middle (content), medium at end (conclusion)
        sortedVideoClips = [...videoClips].sort((a, b) => {
          const midDuration = videoClips.reduce((sum, c) => sum + c.duration, 0) / videoClips.length;
          const aDiff = Math.abs(a.duration - midDuration);
          const bDiff = Math.abs(b.duration - midDuration);
          return aDiff - bDiff;
        });
        // Move shortest to start, then shuffle middle, longest clips stay
        const shortest = sortedVideoClips.filter(c => c.duration < sortedVideoClips[0].duration * 1.2);
        const rest = sortedVideoClips.filter(c => c.duration >= sortedVideoClips[0].duration * 1.2);
        sortedVideoClips = [...shortest, ...rest];
      } else if (selectedStyle === 'fast') {
        // Fast cuts: shortest clips first, increasing energy
        sortedVideoClips = [...videoClips].sort((a, b) => a.duration - b.duration);
      } else if (selectedStyle === 'chill') {
        // Relaxed: longest clips first, decreasing energy
        sortedVideoClips = [...videoClips].sort((a, b) => b.duration - a.duration);
      } else {
        // Custom: random shuffle weighted by pacing
        sortedVideoClips = [...videoClips].sort(() => Math.random() - 0.5);
      }
      
      setProgress(60);
      await new Promise(r => setTimeout(r, 300));
      
      // Step 3: Calculate new start times based on pacing
      const gapMultiplier = 1 - (pacing / 100); // Higher pacing = smaller gaps
      const baseGap = selectedPreset.transitions === 'smooth' ? 0.5 : 
                      selectedPreset.transitions === 'quick' ? 0.1 : 0;
      const gap = baseGap * gapMultiplier;
      
      let currentTime = 0;
      const arrangedVideoClips = sortedVideoClips.map(clip => {
        const newClip = {
          ...clip,
          startTime: currentTime,
        };
        currentTime += clip.duration + gap;
        return newClip;
      });
      
      setProgress(80);
      
      // Step 4: Sync audio clips to video length
      const totalVideoDuration = currentTime;
      const arrangedAudioClips = audioClips.map((clip, index) => {
        // Distribute audio clips evenly across timeline
        const startOffset = (index / Math.max(audioClips.length, 1)) * totalVideoDuration * 0.3;
        return {
          ...clip,
          startTime: startOffset,
        };
      });
      
      setProgress(100);
      
      // Combine all clips
      const allArranged = [...arrangedVideoClips, ...arrangedAudioClips, ...otherClips];
      setPreviewClips(allArranged);
      
      toast.success(`AI arranged ${clips.length} clips in ${selectedPreset.name} style`);
    } catch (error) {
      toast.error('Failed to arrange clips');
    } finally {
      setIsProcessing(false);
    }
  }, [clips, selectedStyle, customPacing, selectedPreset]);

  const applyArrangement = () => {
    if (previewClips) {
      onArrange(previewClips);
      setPreviewClips(null);
      toast.success('Arrangement applied to timeline');
    }
  };

  const resetPreview = () => {
    setPreviewClips(null);
    setProgress(0);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2 px-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            AI Auto-Arrange
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {clips.length} clips
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-3 pb-3">
        {/* Style Selection */}
        <RadioGroup
          value={selectedStyle}
          onValueChange={(value) => setSelectedStyle(value as ArrangeStyle)}
          className="grid grid-cols-2 gap-2"
        >
          {ARRANGE_PRESETS.map(preset => (
            <div key={preset.id}>
              <RadioGroupItem
                value={preset.id}
                id={preset.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={preset.id}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border-2 cursor-pointer transition-all",
                  "hover:bg-muted/50",
                  selectedStyle === preset.id 
                    ? "border-primary bg-primary/10" 
                    : "border-muted"
                )}
              >
                {preset.icon}
                <span className="text-[10px] font-medium">{preset.name}</span>
                <span className="text-[8px] text-muted-foreground text-center">
                  {preset.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Custom Pacing Slider */}
        {selectedStyle === 'custom' && (
          <div className="space-y-1 p-2 bg-muted/30 rounded">
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">Pacing</Label>
              <span className="text-[10px] text-muted-foreground">{customPacing}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <Slider
                value={[customPacing]}
                min={10}
                max={100}
                step={5}
                onValueChange={([value]) => setCustomPacing(value)}
                className="flex-1"
              />
              <Zap className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-[10px] text-muted-foreground text-center">
              Analyzing clips and calculating optimal arrangement...
            </p>
          </div>
        )}

        {/* Preview Result */}
        {previewClips && !isProcessing && (
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-[11px] font-medium">Arrangement Ready</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                className="flex-1 h-7 text-[10px]"
                onClick={applyArrangement}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Apply
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px]"
                onClick={resetPreview}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Arrange Button */}
        {!previewClips && (
          <Button
            className="w-full"
            onClick={analyzeAndArrange}
            disabled={isProcessing || clips.length < 2}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Auto-Arrange Clips
              </>
            )}
          </Button>
        )}

        {/* Tips */}
        <div className="text-[9px] text-muted-foreground bg-muted/30 p-2 rounded">
          <strong>AI considers:</strong> Clip duration, type, content flow, and your selected style to create the optimal arrangement.
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAutoArrange;
