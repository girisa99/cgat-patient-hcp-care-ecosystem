/**
 * Quick Clips Generator
 * P1 Feature: Auto-generate social-ready clips from recordings
 * Target: Creator economy - one-app workflow demand
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, 
  Scissors, 
  Clock, 
  Sparkles, 
  Download, 
  Share2,
  Play,
  Pause,
  RotateCcw,
  Check,
  Loader2,
  Instagram,
  Youtube,
  Twitter,
  Video,
  Film
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

export interface ClipSuggestion {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  duration: number;
  confidence: number;
  type: 'highlight' | 'quote' | 'moment' | 'intro' | 'outro';
  tags: string[];
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin' | 'universal';
}

export interface QuickClip {
  id: string;
  suggestion: ClipSuggestion;
  status: 'pending' | 'processing' | 'ready' | 'error';
  outputUrl?: string;
  thumbnailUrl?: string;
}

interface QuickClipsGeneratorProps {
  sourceUrl?: string;
  sourceDuration?: number;
  onClipGenerated?: (clip: QuickClip) => void;
  onClipSelected?: (clips: QuickClip[]) => void;
  className?: string;
}

// Platform presets with aspect ratios
const PLATFORM_PRESETS = [
  { id: 'instagram', name: 'Instagram Reels', icon: Instagram, ratio: '9:16', maxDuration: 90 },
  { id: 'youtube', name: 'YouTube Shorts', icon: Youtube, ratio: '9:16', maxDuration: 60 },
  { id: 'tiktok', name: 'TikTok', icon: Video, ratio: '9:16', maxDuration: 180 },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, ratio: '1:1', maxDuration: 140 },
  { id: 'linkedin', name: 'LinkedIn', icon: Film, ratio: '1:1', maxDuration: 600 },
];

export const QuickClipsGenerator: React.FC<QuickClipsGeneratorProps> = ({
  sourceUrl,
  sourceDuration = 0,
  onClipGenerated,
  onClipSelected,
  className
}) => {
  const { shareContent, vibrate } = useMobileFeatures();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<ClipSuggestion[]>([]);
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [generatedClips, setGeneratedClips] = useState<QuickClip[]>([]);
  const [activeTab, setActiveTab] = useState('analyze');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');

  // Mock AI analysis - in production this would call an AI service
  const analyzeContent = useCallback(async () => {
    if (!sourceUrl) {
      toast.error('No source content to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate AI analysis progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setAnalysisProgress(i);
      }

      // Mock suggestions - in production these would come from AI
      const mockSuggestions: ClipSuggestion[] = [
        {
          id: '1',
          title: 'Hook Opening',
          description: 'Engaging intro that grabs attention',
          startTime: 0,
          endTime: 15,
          duration: 15,
          confidence: 0.95,
          type: 'intro',
          tags: ['attention-grabbing', 'hook', 'viral-potential'],
          platform: 'instagram'
        },
        {
          id: '2',
          title: 'Key Quote',
          description: 'Memorable statement with high engagement potential',
          startTime: 45,
          endTime: 65,
          duration: 20,
          confidence: 0.88,
          type: 'quote',
          tags: ['quotable', 'shareable', 'impactful'],
          platform: 'twitter'
        },
        {
          id: '3',
          title: 'Highlight Moment',
          description: 'Peak engagement section with visual interest',
          startTime: 120,
          endTime: 150,
          duration: 30,
          confidence: 0.82,
          type: 'highlight',
          tags: ['climax', 'emotional', 'action'],
          platform: 'youtube'
        },
        {
          id: '4',
          title: 'Tutorial Snippet',
          description: 'Educational content suitable for how-to clips',
          startTime: 200,
          endTime: 260,
          duration: 60,
          confidence: 0.79,
          type: 'moment',
          tags: ['educational', 'tutorial', 'value'],
          platform: 'linkedin'
        },
        {
          id: '5',
          title: 'Call to Action',
          description: 'Strong closing with clear next steps',
          startTime: Math.max(0, sourceDuration - 20),
          endTime: sourceDuration,
          duration: 20,
          confidence: 0.91,
          type: 'outro',
          tags: ['cta', 'conversion', 'closing'],
          platform: 'universal'
        },
      ];

      setSuggestions(mockSuggestions);
      setActiveTab('suggestions');
      vibrate?.(200);
      toast.success(`Found ${mockSuggestions.length} clip suggestions!`);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  }, [sourceUrl, sourceDuration, vibrate]);

  const toggleClipSelection = (clipId: string) => {
    const newSelected = new Set(selectedClips);
    if (newSelected.has(clipId)) {
      newSelected.delete(clipId);
    } else {
      newSelected.add(clipId);
    }
    setSelectedClips(newSelected);
  };

  const selectAll = () => {
    setSelectedClips(new Set(suggestions.map(s => s.id)));
  };

  const deselectAll = () => {
    setSelectedClips(new Set());
  };

  const generateSelectedClips = async () => {
    if (selectedClips.size === 0) {
      toast.error('Select at least one clip to generate');
      return;
    }

    const clipsToGenerate = suggestions.filter(s => selectedClips.has(s.id));
    
    // Create clip objects
    const newClips: QuickClip[] = clipsToGenerate.map(suggestion => ({
      id: crypto.randomUUID(),
      suggestion,
      status: 'pending' as const,
    }));

    setGeneratedClips(prev => [...prev, ...newClips]);
    setActiveTab('clips');

    // Simulate generation for each clip
    for (const clip of newClips) {
      setGeneratedClips(prev => 
        prev.map(c => c.id === clip.id ? { ...c, status: 'processing' } : c)
      );

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mark as ready with mock output
      setGeneratedClips(prev => 
        prev.map(c => c.id === clip.id ? { 
          ...c, 
          status: 'ready',
          outputUrl: sourceUrl, // In production this would be the processed clip
          thumbnailUrl: 'https://via.placeholder.com/320x180'
        } : c)
      );

      onClipGenerated?.(clip);
    }

    vibrate?.(500);
    toast.success(`Generated ${clipsToGenerate.length} clips!`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeColor = (type: ClipSuggestion['type']) => {
    switch (type) {
      case 'intro': return 'bg-green-500/20 text-green-700';
      case 'highlight': return 'bg-yellow-500/20 text-yellow-700';
      case 'quote': return 'bg-blue-500/20 text-blue-700';
      case 'moment': return 'bg-purple-500/20 text-purple-700';
      case 'outro': return 'bg-red-500/20 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const preset = PLATFORM_PRESETS.find(p => p.id === platform);
    if (preset) {
      const Icon = preset.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Video className="h-4 w-4" />;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            Quick Clips
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="analyze">
              <Wand2 className="h-4 w-4 mr-1" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="suggestions" disabled={suggestions.length === 0}>
              <Scissors className="h-4 w-4 mr-1" />
              Suggestions ({suggestions.length})
            </TabsTrigger>
            <TabsTrigger value="clips" disabled={generatedClips.length === 0}>
              <Film className="h-4 w-4 mr-1" />
              Clips ({generatedClips.length})
            </TabsTrigger>
          </TabsList>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="space-y-4">
            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Platform</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_PRESETS.map(platform => (
                  <Button
                    key={platform.id}
                    variant={selectedPlatform === platform.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform.id)}
                    className="flex items-center gap-1"
                  >
                    <platform.icon className="h-4 w-4" />
                    {platform.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Source Info */}
            {sourceUrl && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Source Duration</span>
                  <span className="font-medium">{formatTime(sourceDuration)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium flex items-center gap-1">
                    {getPlatformIcon(selectedPlatform)}
                    {PLATFORM_PRESETS.find(p => p.id === selectedPlatform)?.name}
                  </span>
                </div>
              </div>
            )}

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Analyzing content...</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} />
              </div>
            )}

            {/* Analyze Button */}
            <Button 
              className="w-full" 
              onClick={analyzeContent}
              disabled={isAnalyzing || !sourceUrl}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Find Best Clips
                </>
              )}
            </Button>

            {!sourceUrl && (
              <p className="text-sm text-muted-foreground text-center">
                Record or upload content to analyze
              </p>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedClips.size} of {suggestions.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Suggestions List */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {suggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      selectedClips.has(suggestion.id) 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-muted-foreground/50"
                    )}
                    onClick={() => toggleClipSelection(suggestion.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{suggestion.title}</span>
                          <Badge className={cn("text-xs", getTypeColor(suggestion.type))}>
                            {suggestion.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(suggestion.startTime)} - {formatTime(suggestion.endTime)}
                          </span>
                          <span>{suggestion.duration}s</span>
                          <span className="flex items-center gap-1">
                            {getPlatformIcon(suggestion.platform)}
                            {suggestion.platform}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary">
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                        {selectedClips.has(suggestion.id) && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Generate Button */}
            <Button 
              className="w-full" 
              onClick={generateSelectedClips}
              disabled={selectedClips.size === 0}
            >
              <Scissors className="h-4 w-4 mr-2" />
              Generate {selectedClips.size} Clip{selectedClips.size !== 1 ? 's' : ''}
            </Button>
          </TabsContent>

          {/* Generated Clips Tab */}
          <TabsContent value="clips" className="space-y-4">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-3">
                {generatedClips.map(clip => (
                  <Card key={clip.id} className="overflow-hidden">
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-32 h-20 bg-muted flex items-center justify-center relative">
                        {clip.status === 'ready' && clip.thumbnailUrl ? (
                          <img 
                            src={clip.thumbnailUrl} 
                            alt={clip.suggestion.title}
                            className="w-full h-full object-cover"
                          />
                        ) : clip.status === 'processing' ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <Video className="h-6 w-6 text-muted-foreground" />
                        )}
                        {clip.status === 'ready' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{clip.suggestion.title}</span>
                          <Badge 
                            variant={
                              clip.status === 'ready' ? 'default' : 
                              clip.status === 'processing' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {clip.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {clip.suggestion.duration}s • {clip.suggestion.platform}
                        </p>
                        
                        {clip.status === 'ready' && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs"
                              onClick={() => shareContent({ 
                                title: clip.suggestion.title,
                                url: clip.outputUrl 
                              })}
                            >
                              <Share2 className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {generatedClips.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setGeneratedClips([]);
                  setSelectedClips(new Set());
                  setActiveTab('suggestions');
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Generate More Clips
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuickClipsGenerator;
