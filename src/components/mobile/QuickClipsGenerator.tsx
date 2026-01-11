/**
 * Quick Clips Generator
 * P1 Feature: Auto-generate social-ready clips from recordings
 * Target: Creator economy - one-app workflow demand
 */

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <div className={cn("w-full space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Quick Clips</span>
        </div>
        <Badge variant="outline" className="text-[10px] flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" />
          AI
        </Badge>
      </div>

      {/* Tab Navigation - Full width, no overlap */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={activeTab === 'analyze' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveTab('analyze')}
        >
          <Wand2 className="h-3 w-3 mr-1" />
          Analyze
        </Button>
        <Button
          variant={activeTab === 'suggestions' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveTab('suggestions')}
          disabled={suggestions.length === 0}
        >
          <Scissors className="h-3 w-3 mr-1" />
          Clips
        </Button>
        <Button
          variant={activeTab === 'clips' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveTab('clips')}
          disabled={generatedClips.length === 0}
        >
          <Film className="h-3 w-3 mr-1" />
          Ready
        </Button>
      </div>

      {/* Content Area */}
      <div className="min-h-[280px]">
        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-3">
            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Target Platform</label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORM_PRESETS.map(platform => (
                  <Button
                    key={platform.id}
                    variant={selectedPlatform === platform.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform.id)}
                    className="h-7 text-xs px-2"
                  >
                    <platform.icon className="h-3 w-3 mr-1" />
                    {platform.name.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Source Info */}
            {sourceUrl && (
              <div className="p-2 bg-muted rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{formatTime(sourceDuration)}</span>
                </div>
                <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-between text-xs">
                  <span>Analyzing content...</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-1.5" />
              </div>
            )}

            {/* Analyze Button */}
            <Button 
              className="w-full" 
              size="sm"
              onClick={analyzeContent}
              disabled={isAnalyzing || !sourceUrl}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  Find Best Clips
                </>
              )}
            </Button>

            {!sourceUrl && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Record or upload content first to analyze
              </p>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedClips.size}/{suggestions.length} selected
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={selectAll}>
                  All
                </Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={deselectAll}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Suggestions List */}
            <ScrollArea className="h-[220px]">
              <div className="space-y-2 pr-2">
                {suggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className={cn(
                      "p-2 border rounded-lg cursor-pointer transition-all",
                      selectedClips.has(suggestion.id) 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-muted-foreground/50"
                    )}
                    onClick={() => toggleClipSelection(suggestion.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm">{suggestion.title}</span>
                          <Badge className={cn("text-[10px] px-1.5", getTypeColor(suggestion.type))}>
                            {suggestion.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {formatTime(suggestion.startTime)}-{formatTime(suggestion.endTime)}
                          </span>
                          <span>{suggestion.duration}s</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                        {selectedClips.has(suggestion.id) && (
                          <Check className="h-4 w-4 text-primary" />
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
              size="sm"
              onClick={generateSelectedClips}
              disabled={selectedClips.size === 0}
            >
              <Scissors className="h-3 w-3 mr-1" />
              Generate {selectedClips.size} Clip{selectedClips.size !== 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {/* Generated Clips Tab */}
        {activeTab === 'clips' && (
          <div className="space-y-3">
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-2">
                {generatedClips.map(clip => (
                  <Card key={clip.id} className="overflow-hidden">
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-20 h-14 bg-muted flex items-center justify-center relative flex-shrink-0">
                        {clip.status === 'ready' && clip.thumbnailUrl ? (
                          <img 
                            src={clip.thumbnailUrl} 
                            alt={clip.suggestion.title}
                            className="w-full h-full object-cover"
                          />
                        ) : clip.status === 'processing' ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Video className="h-4 w-4 text-muted-foreground" />
                        )}
                        {clip.status === 'ready' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs">{clip.suggestion.title}</span>
                          <Badge 
                            variant={
                              clip.status === 'ready' ? 'default' : 
                              clip.status === 'processing' ? 'secondary' : 
                              'outline'
                            }
                            className="text-[10px]"
                          >
                            {clip.status}
                          </Badge>
                        </div>
                        
                        {clip.status === 'ready' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                              <Download className="h-2.5 w-2.5 mr-0.5" />
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 text-[10px] px-2"
                              onClick={() => shareContent({ 
                                title: clip.suggestion.title,
                                url: clip.outputUrl 
                              })}
                            >
                              <Share2 className="h-2.5 w-2.5 mr-0.5" />
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
                size="sm"
                className="w-full"
                onClick={() => {
                  setGeneratedClips([]);
                  setSelectedClips(new Set());
                  setActiveTab('suggestions');
                }}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Generate More
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickClipsGenerator;
