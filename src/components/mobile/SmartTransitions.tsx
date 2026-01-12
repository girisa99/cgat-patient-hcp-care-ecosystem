/**
 * Smart Transitions
 * P2 Feature: AI-suggested transitions between clips
 * Analyzes clip content to suggest appropriate transitions
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowRightLeft,
  Sparkles,
  Wand2,
  Play,
  Check,
  X,
  ChevronRight,
  Blend,
  Layers,
  Zap,
  Clock,
  Eye,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TimelineClip } from './MultiClipTimeline';

interface Transition {
  id: string;
  name: string;
  type: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom' | 'slide';
  duration: number; // seconds
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  icon: React.ReactNode;
  description: string;
}

interface ClipTransition {
  fromClipId: string;
  toClipId: string;
  transition: Transition;
  aiConfidence: number; // 0-100
  applied: boolean;
}

interface SmartTransitionsProps {
  clips: TimelineClip[];
  onApplyTransitions: (transitions: ClipTransition[]) => void;
  className?: string;
}

const AVAILABLE_TRANSITIONS: Transition[] = [
  {
    id: 'cut',
    name: 'Cut',
    type: 'cut',
    duration: 0,
    easing: 'linear',
    icon: <Zap className="h-4 w-4" />,
    description: 'Instant switch, no transition',
  },
  {
    id: 'fade',
    name: 'Fade',
    type: 'fade',
    duration: 0.5,
    easing: 'ease-in-out',
    icon: <Blend className="h-4 w-4" />,
    description: 'Smooth fade through black',
  },
  {
    id: 'dissolve',
    name: 'Dissolve',
    type: 'dissolve',
    duration: 0.75,
    easing: 'ease-in-out',
    icon: <Layers className="h-4 w-4" />,
    description: 'Cross-fade between clips',
  },
  {
    id: 'wipe-left',
    name: 'Wipe Left',
    type: 'wipe',
    duration: 0.5,
    easing: 'ease-out',
    icon: <ChevronRight className="h-4 w-4" />,
    description: 'Wipe from right to left',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    type: 'zoom',
    duration: 0.4,
    easing: 'ease-in',
    icon: <Eye className="h-4 w-4" />,
    description: 'Zoom transition',
  },
  {
    id: 'slide',
    name: 'Slide',
    type: 'slide',
    duration: 0.5,
    easing: 'ease-out',
    icon: <ArrowRightLeft className="h-4 w-4" />,
    description: 'Slide in from side',
  },
];

export const SmartTransitions: React.FC<SmartTransitionsProps> = ({
  clips,
  onApplyTransitions,
  className,
}) => {
  const [clipTransitions, setClipTransitions] = useState<ClipTransition[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [globalDuration, setGlobalDuration] = useState(0.5);
  const [autoApply, setAutoApply] = useState(false);
  const [selectedPairIndex, setSelectedPairIndex] = useState<number | null>(null);

  // Get clip pairs (consecutive clips on same track)
  const getClipPairs = useCallback(() => {
    const videoClips = clips
      .filter(c => c.type === 'video')
      .sort((a, b) => a.startTime - b.startTime);
    
    const pairs: { from: TimelineClip; to: TimelineClip }[] = [];
    for (let i = 0; i < videoClips.length - 1; i++) {
      if (videoClips[i].track === videoClips[i + 1].track) {
        pairs.push({ from: videoClips[i], to: videoClips[i + 1] });
      }
    }
    return pairs;
  }, [clips]);

  // AI analyze and suggest transitions
  const analyzeClips = useCallback(async () => {
    const pairs = getClipPairs();
    if (pairs.length === 0) {
      toast.error('Need at least 2 consecutive clips for transitions');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      await new Promise(r => setTimeout(r, 800)); // Simulate AI analysis
      
      const suggested: ClipTransition[] = pairs.map((pair, index) => {
        // AI logic to determine best transition
        const durationDiff = Math.abs(pair.from.duration - pair.to.duration);
        const isQuickPacing = pair.from.duration < 3 && pair.to.duration < 3;
        const isSlowPacing = pair.from.duration > 10 && pair.to.duration > 10;
        
        let bestTransition: Transition;
        let confidence: number;
        
        if (isQuickPacing) {
          // Fast pacing = quick cuts or slides
          bestTransition = AVAILABLE_TRANSITIONS.find(t => t.id === 'cut') || AVAILABLE_TRANSITIONS[0];
          confidence = 85;
        } else if (isSlowPacing) {
          // Slow pacing = dissolves
          bestTransition = AVAILABLE_TRANSITIONS.find(t => t.id === 'dissolve') || AVAILABLE_TRANSITIONS[2];
          confidence = 80;
        } else if (durationDiff > 5) {
          // Big duration difference = fade for context shift
          bestTransition = AVAILABLE_TRANSITIONS.find(t => t.id === 'fade') || AVAILABLE_TRANSITIONS[1];
          confidence = 75;
        } else {
          // Default = dissolve for smooth flow
          bestTransition = AVAILABLE_TRANSITIONS.find(t => t.id === 'dissolve') || AVAILABLE_TRANSITIONS[2];
          confidence = 70;
        }
        
        return {
          fromClipId: pair.from.id,
          toClipId: pair.to.id,
          transition: { ...bestTransition, duration: globalDuration },
          aiConfidence: confidence,
          applied: autoApply,
        };
      });
      
      setClipTransitions(suggested);
      toast.success(`AI suggested ${suggested.length} transitions`);
      
      if (autoApply) {
        onApplyTransitions(suggested);
      }
    } catch (error) {
      toast.error('Failed to analyze clips');
    } finally {
      setIsAnalyzing(false);
    }
  }, [getClipPairs, globalDuration, autoApply, onApplyTransitions]);

  // Change transition for a specific pair
  const updateTransition = (pairIndex: number, transition: Transition) => {
    setClipTransitions(prev => {
      const updated = [...prev];
      updated[pairIndex] = {
        ...updated[pairIndex],
        transition: { ...transition, duration: globalDuration },
        aiConfidence: 100, // User selected
      };
      return updated;
    });
  };

  // Toggle apply status for a transition
  const toggleApply = (pairIndex: number) => {
    setClipTransitions(prev => {
      const updated = [...prev];
      updated[pairIndex].applied = !updated[pairIndex].applied;
      return updated;
    });
  };

  // Apply all enabled transitions
  const applyAll = () => {
    const toApply = clipTransitions.filter(t => t.applied);
    if (toApply.length === 0) {
      toast.error('No transitions selected');
      return;
    }
    onApplyTransitions(toApply);
    toast.success(`Applied ${toApply.length} transitions`);
  };

  const pairs = getClipPairs();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2 px-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            Smart Transitions
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {pairs.length} pairs
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-3 pb-3">
        {/* Global Settings */}
        <div className="space-y-2 p-2 bg-muted/30 rounded">
          <div className="flex items-center justify-between">
            <Label className="text-[10px]">Transition Duration</Label>
            <span className="text-[10px] text-muted-foreground">{globalDuration}s</span>
          </div>
          <Slider
            value={[globalDuration]}
            min={0.1}
            max={2}
            step={0.1}
            onValueChange={([value]) => setGlobalDuration(value)}
          />
          
          <div className="flex items-center justify-between pt-1">
            <Label className="text-[10px]">Auto-apply suggestions</Label>
            <Switch
              checked={autoApply}
              onCheckedChange={setAutoApply}
            />
          </div>
        </div>

        {/* Analyze Button */}
        <Button
          className="w-full"
          onClick={analyzeClips}
          disabled={isAnalyzing || pairs.length === 0}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              AI Suggest Transitions
            </>
          )}
        </Button>

        {/* Transition Suggestions */}
        {clipTransitions.length > 0 && (
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-2">
              {clipTransitions.map((ct, index) => {
                const fromClip = clips.find(c => c.id === ct.fromClipId);
                const toClip = clips.find(c => c.id === ct.toClipId);
                
                return (
                  <div
                    key={`${ct.fromClipId}-${ct.toClipId}`}
                    className={cn(
                      "p-2 rounded border transition-all",
                      ct.applied ? "bg-primary/10 border-primary" : "bg-muted/30 border-transparent",
                      selectedPairIndex === index && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedPairIndex(index)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] truncate flex-1">
                        {fromClip?.name?.slice(0, 10)} → {toClip?.name?.slice(0, 10)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={ct.aiConfidence >= 80 ? "default" : "secondary"}
                          className="text-[8px] px-1"
                        >
                          {ct.aiConfidence}% match
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleApply(index);
                          }}
                        >
                          {ct.applied ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {ct.transition.icon}
                      <span className="text-[9px] font-medium">{ct.transition.name}</span>
                      <span className="text-[8px] text-muted-foreground">
                        ({ct.transition.duration}s)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Transition Picker for Selected Pair */}
        {selectedPairIndex !== null && clipTransitions[selectedPairIndex] && (
          <div className="p-2 bg-muted/30 rounded space-y-2">
            <Label className="text-[10px] text-muted-foreground">Change transition:</Label>
            <div className="grid grid-cols-3 gap-1">
              {AVAILABLE_TRANSITIONS.map(t => (
                <Button
                  key={t.id}
                  variant={clipTransitions[selectedPairIndex].transition.id === t.id ? "default" : "outline"}
                  size="sm"
                  className="h-8 flex-col gap-0.5 text-[8px]"
                  onClick={() => updateTransition(selectedPairIndex, t)}
                >
                  {t.icon}
                  {t.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Apply All Button */}
        {clipTransitions.length > 0 && (
          <Button
            className="w-full"
            variant="default"
            onClick={applyAll}
            disabled={clipTransitions.filter(t => t.applied).length === 0}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Apply {clipTransitions.filter(t => t.applied).length} Transitions
          </Button>
        )}

        {/* Empty State */}
        {pairs.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Add at least 2 consecutive video clips to use transitions
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartTransitions;
