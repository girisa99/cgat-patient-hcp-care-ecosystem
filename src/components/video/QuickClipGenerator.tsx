/**
 * Quick Clip Generator - P1 #90
 * 
 * AI-powered tool to generate 15s/30s/60s clips from longer videos.
 * Detects highlights, applies cuts, and optimizes for social platforms.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Scissors,
  Clock,
  Sparkles,
  Play,
  Pause,
  Download,
  RefreshCw,
  Film,
  Zap,
  Volume2,
  Eye,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export type ClipDuration = 15 | 30 | 60;

export interface DetectedHighlight {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  score: number;
  type: 'speech' | 'action' | 'emotion' | 'visual';
  description: string;
  thumbnail?: string;
}

export interface GeneratedClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: ClipDuration;
  highlights: DetectedHighlight[];
  previewUrl?: string;
  score: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
}

interface QuickClipGeneratorProps {
  videoUrl?: string;
  videoDuration?: number;
  onClipsGenerated?: (clips: GeneratedClip[]) => void;
  onClipExport?: (clip: GeneratedClip) => void;
  className?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_HIGHLIGHTS: DetectedHighlight[] = [
  { id: 'h1', startTime: 12, endTime: 18, duration: 6, score: 95, type: 'speech', description: 'Key quote about product benefits' },
  { id: 'h2', startTime: 45, endTime: 52, duration: 7, score: 88, type: 'emotion', description: 'Emotional reaction moment' },
  { id: 'h3', startTime: 78, endTime: 85, duration: 7, score: 92, type: 'visual', description: 'Product demonstration' },
  { id: 'h4', startTime: 120, endTime: 135, duration: 15, score: 85, type: 'action', description: 'Before/after comparison' },
  { id: 'h5', startTime: 180, endTime: 195, duration: 15, score: 90, type: 'speech', description: 'Call to action moment' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const QuickClipGenerator: React.FC<QuickClipGeneratorProps> = ({
  videoUrl,
  videoDuration = 300,
  onClipsGenerated,
  onClipExport,
  className,
}) => {
  // State
  const [clipDuration, setClipDuration] = useState<ClipDuration>(30);
  const [numberOfClips, setNumberOfClips] = useState(3);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [highlights, setHighlights] = useState<DetectedHighlight[]>([]);
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  // Analyze video for highlights
  const analyzeVideo = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setHighlights([]);

    try {
      // Simulate AI analysis
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 200));
        setAnalysisProgress(i);
      }

      // In production, this would call an edge function
      setHighlights(MOCK_HIGHLIGHTS);
      toast.success(`Found ${MOCK_HIGHLIGHTS.length} highlight moments`);
    } catch (error) {
      toast.error('Failed to analyze video');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Generate clips from highlights
  const generateClips = useCallback(async () => {
    if (highlights.length === 0) {
      toast.error('Please analyze video first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedClips([]);

    try {
      // Sort highlights by score
      const sortedHighlights = [...highlights].sort((a, b) => b.score - a.score);
      
      // Generate clips
      const clips: GeneratedClip[] = [];
      
      for (let i = 0; i < Math.min(numberOfClips, sortedHighlights.length); i++) {
        await new Promise(r => setTimeout(r, 500));
        setGenerationProgress(((i + 1) / numberOfClips) * 100);
        
        const highlight = sortedHighlights[i];
        const clip: GeneratedClip = {
          id: `clip-${i + 1}`,
          startTime: Math.max(0, highlight.startTime - (clipDuration - highlight.duration) / 2),
          endTime: 0,
          duration: clipDuration,
          highlights: [highlight],
          score: highlight.score,
          status: 'ready',
        };
        clip.endTime = clip.startTime + clipDuration;
        
        clips.push(clip);
      }

      setGeneratedClips(clips);
      onClipsGenerated?.(clips);
      toast.success(`Generated ${clips.length} clips`);
    } catch (error) {
      toast.error('Failed to generate clips');
    } finally {
      setIsGenerating(false);
    }
  }, [highlights, numberOfClips, clipDuration, onClipsGenerated]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get highlight type icon
  const getHighlightIcon = (type: DetectedHighlight['type']) => {
    switch (type) {
      case 'speech': return <Volume2 className="h-3 w-3" />;
      case 'action': return <Zap className="h-3 w-3" />;
      case 'emotion': return <ThumbsUp className="h-3 w-3" />;
      case 'visual': return <Eye className="h-3 w-3" />;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          Quick Clip Generator
        </CardTitle>
        <CardDescription>
          AI-powered clips for TikTok, Reels & Shorts
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Duration Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Clip Duration</Label>
          <RadioGroup
            value={String(clipDuration)}
            onValueChange={(v) => setClipDuration(Number(v) as ClipDuration)}
            className="flex gap-4"
          >
            {[15, 30, 60].map((duration) => (
              <div key={duration} className="flex items-center space-x-2">
                <RadioGroupItem value={String(duration)} id={`duration-${duration}`} />
                <Label htmlFor={`duration-${duration}`} className="cursor-pointer">
                  <Badge variant={clipDuration === duration ? 'default' : 'outline'}>
                    <Clock className="h-3 w-3 mr-1" />
                    {duration}s
                  </Badge>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Number of Clips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Number of Clips</Label>
            <span className="text-sm text-muted-foreground">{numberOfClips}</span>
          </div>
          <Slider
            value={[numberOfClips]}
            onValueChange={([v]) => setNumberOfClips(v)}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-Optimize</Label>
              <p className="text-xs text-muted-foreground">AI-enhanced cuts and transitions</p>
            </div>
            <Switch checked={autoOptimize} onCheckedChange={setAutoOptimize} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Include Captions</Label>
              <p className="text-xs text-muted-foreground">Auto-generated subtitles</p>
            </div>
            <Switch checked={includeCaptions} onCheckedChange={setIncludeCaptions} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={analyzeVideo}
            disabled={isAnalyzing || !videoUrl}
            className="flex-1"
            variant="outline"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Video
              </>
            )}
          </Button>
          <Button
            onClick={generateClips}
            disabled={isGenerating || highlights.length === 0}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Scissors className="h-4 w-4 mr-2" />
                Generate Clips
              </>
            )}
          </Button>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analyzing video...</span>
              <span>{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} />
          </div>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating clips...</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            <Progress value={generationProgress} />
          </div>
        )}

        {/* Detected Highlights */}
        {highlights.length > 0 && !isAnalyzing && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Detected Highlights ({highlights.length})
            </Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              <div className="space-y-2">
                {highlights.map(highlight => (
                  <div 
                    key={highlight.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getHighlightIcon(highlight.type)}
                        <span className="ml-1">{highlight.type}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(highlight.startTime)} - {formatTime(highlight.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          highlight.score >= 90 ? "border-green-500 text-green-600" :
                          highlight.score >= 80 ? "border-amber-500 text-amber-600" :
                          "border-slate-500"
                        )}
                      >
                        {highlight.score}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Generated Clips */}
        {generatedClips.length > 0 && !isGenerating && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Film className="h-4 w-4" />
              Generated Clips ({generatedClips.length})
            </Label>
            <div className="grid gap-3">
              {generatedClips.map((clip, index) => (
                <Card 
                  key={clip.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedClip === clip.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedClip(clip.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 rounded bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <Play className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Clip {index + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(clip.startTime)} - {formatTime(clip.endTime)} ({clip.duration}s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            clip.score >= 90 ? "border-green-500 text-green-600" :
                            clip.score >= 80 ? "border-amber-500 text-amber-600" :
                            "border-slate-500"
                          )}
                        >
                          Score: {clip.score}
                        </Badge>
                        {clip.status === 'ready' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClipExport?.(clip);
                              toast.success(`Exporting Clip ${index + 1}`);
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!videoUrl && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <Film className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Upload a video to generate quick clips</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickClipGenerator;
