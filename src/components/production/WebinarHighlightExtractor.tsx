/**
 * Webinar Highlight Extractor - P1 #16
 * 
 * AI identifies key moments in webinars and extracts highlight clips.
 * Flow: Webinar → AI Analysis → Identify Highlights → Extract Clips
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Video,
  Sparkles,
  Play,
  Download,
  Clock,
  Star,
  MessageSquare,
  TrendingUp,
  Users,
  Scissors,
  Loader2,
  CheckCircle,
  Filter,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Highlight {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  description: string;
  category: 'key_point' | 'quote' | 'demo' | 'qa' | 'engagement_peak';
  score: number;
  thumbnail: string;
  isSelected: boolean;
  engagement: {
    reactions: number;
    questions: number;
    viewerPeak: number;
  };
}

interface ExtractionSettings {
  minClipDuration: number;
  maxClipDuration: number;
  includeTransitions: boolean;
  addCaptions: boolean;
  outputFormat: 'mp4' | 'mov' | 'webm';
}

interface WebinarHighlightExtractorProps {
  webinarUrl?: string;
  webinarDuration?: number;
  onExtractComplete?: (highlights: Highlight[]) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const WebinarHighlightExtractor: React.FC<WebinarHighlightExtractorProps> = ({
  webinarUrl,
  webinarDuration = 3600, // 1 hour default
  onExtractComplete,
  className,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [settings, setSettings] = useState<ExtractionSettings>({
    minClipDuration: 15,
    maxClipDuration: 120,
    includeTransitions: true,
    addCaptions: true,
    outputFormat: 'mp4',
  });

  const mockHighlights: Highlight[] = [
    {
      id: '1',
      startTime: 180,
      endTime: 240,
      title: 'Key Announcement: New Product Launch',
      description: 'CEO reveals the upcoming product roadmap for Q2 2024',
      category: 'key_point',
      score: 98,
      thumbnail: '/placeholder.svg',
      isSelected: true,
      engagement: { reactions: 245, questions: 12, viewerPeak: 1250 },
    },
    {
      id: '2',
      startTime: 420,
      endTime: 480,
      title: 'Powerful Quote on Innovation',
      description: '"The future belongs to those who see possibilities before they become obvious"',
      category: 'quote',
      score: 95,
      thumbnail: '/placeholder.svg',
      isSelected: true,
      engagement: { reactions: 189, questions: 5, viewerPeak: 1180 },
    },
    {
      id: '3',
      startTime: 720,
      endTime: 840,
      title: 'Live Product Demo',
      description: 'Real-time demonstration of the AI-powered features',
      category: 'demo',
      score: 92,
      thumbnail: '/placeholder.svg',
      isSelected: true,
      engagement: { reactions: 312, questions: 28, viewerPeak: 1420 },
    },
    {
      id: '4',
      startTime: 1200,
      endTime: 1320,
      title: 'Audience Q&A: Pricing Discussion',
      description: 'Detailed response to pricing and tier questions from audience',
      category: 'qa',
      score: 88,
      thumbnail: '/placeholder.svg',
      isSelected: false,
      engagement: { reactions: 156, questions: 45, viewerPeak: 1100 },
    },
    {
      id: '5',
      startTime: 1800,
      endTime: 1860,
      title: 'Peak Engagement Moment',
      description: 'Highest viewer interaction during partnership announcement',
      category: 'engagement_peak',
      score: 94,
      thumbnail: '/placeholder.svg',
      isSelected: true,
      engagement: { reactions: 398, questions: 8, viewerPeak: 1560 },
    },
    {
      id: '6',
      startTime: 2400,
      endTime: 2520,
      title: 'Technical Deep Dive',
      description: 'Detailed explanation of the architecture and scalability',
      category: 'key_point',
      score: 85,
      thumbnail: '/placeholder.svg',
      isSelected: false,
      engagement: { reactions: 134, questions: 22, viewerPeak: 980 },
    },
  ];

  const categories = [
    { value: 'key_point', label: 'Key Points', icon: Star, color: 'text-amber-500' },
    { value: 'quote', label: 'Quotes', icon: MessageSquare, color: 'text-blue-500' },
    { value: 'demo', label: 'Demos', icon: Play, color: 'text-green-500' },
    { value: 'qa', label: 'Q&A', icon: Users, color: 'text-purple-500' },
    { value: 'engagement_peak', label: 'Engagement Peaks', icon: TrendingUp, color: 'text-red-500' },
  ];

  const analyzeWebinar = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 80));
      setAnalysisProgress(i);
    }

    setHighlights(mockHighlights);
    setIsAnalyzing(false);
  }, []);

  const toggleHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.map(h => 
      h.id === id ? { ...h, isSelected: !h.isSelected } : h
    ));
  }, []);

  const selectAll = useCallback(() => {
    setHighlights(prev => prev.map(h => ({ ...h, isSelected: true })));
  }, []);

  const deselectAll = useCallback(() => {
    setHighlights(prev => prev.map(h => ({ ...h, isSelected: false })));
  }, []);

  const extractHighlights = useCallback(async () => {
    setIsExtracting(true);
    setExtractProgress(0);

    const selectedHighlights = highlights.filter(h => h.isSelected);
    const progressPerClip = 100 / selectedHighlights.length;

    for (let i = 0; i < selectedHighlights.length; i++) {
      await new Promise(r => setTimeout(r, 1000));
      setExtractProgress((i + 1) * progressPerClip);
    }

    setIsExtracting(false);
    onExtractComplete?.(selectedHighlights);
  }, [highlights, onExtractComplete]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = (category: Highlight['category']) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const filteredHighlights = selectedCategory 
    ? highlights.filter(h => h.category === selectedCategory)
    : highlights;

  const selectedCount = highlights.filter(h => h.isSelected).length;
  const totalSelectedDuration = highlights
    .filter(h => h.isSelected)
    .reduce((sum, h) => sum + (h.endTime - h.startTime), 0);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          Webinar Highlight Extractor
        </CardTitle>
        <CardDescription>
          AI-powered extraction of key moments from webinars
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload/Start Section */}
        {highlights.length === 0 && !isAnalyzing && (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Analyze your webinar</p>
            <p className="text-muted-foreground mb-4">
              AI will identify key moments, quotes, demos, and engagement peaks
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={analyzeWebinar}>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Webinar
              </Button>
              <Button variant="outline" onClick={analyzeWebinar}>
                Use Demo Recording
              </Button>
            </div>
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium">Analyzing webinar content...</p>
              <p className="text-sm text-muted-foreground">
                Identifying key moments, engagement peaks, and quotable content
              </p>
            </div>
            <Progress value={analysisProgress} className="h-3" />
          </div>
        )}

        {/* Results */}
        {highlights.length > 0 && !isAnalyzing && (
          <>
            {/* Stats Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {highlights.length} highlights found
                </Badge>
                <Badge variant={selectedCount > 0 ? 'default' : 'outline'}>
                  {selectedCount} selected ({formatTime(totalSelectedDuration)})
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = highlights.filter(h => h.category === cat.value).length;
                return (
                  <Button
                    key={cat.value}
                    size="sm"
                    variant={selectedCategory === cat.value ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat.value)}
                    className="gap-1"
                  >
                    <Icon className={cn("h-3 w-3", cat.color)} />
                    {cat.label}
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Highlights List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {filteredHighlights.sort((a, b) => b.score - a.score).map((highlight) => {
                  const catInfo = getCategoryInfo(highlight.category);
                  const CatIcon = catInfo.icon;
                  
                  return (
                    <div
                      key={highlight.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        highlight.isSelected && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex gap-4">
                        {/* Checkbox & Thumbnail */}
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={highlight.isSelected}
                            onCheckedChange={() => toggleHighlight(highlight.id)}
                            className="mt-1"
                          />
                          <div className="w-32 h-20 bg-muted rounded overflow-hidden relative">
                            <img
                              src={highlight.thumbnail}
                              alt={highlight.title}
                              className="w-full h-full object-cover"
                            />
                            <Badge
                              variant="secondary"
                              className="absolute bottom-1 right-1 text-[10px] px-1"
                            >
                              {formatTime(highlight.endTime - highlight.startTime)}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{highlight.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {highlight.description}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn("shrink-0 ml-2", highlight.score >= 90 && "border-green-500 text-green-600")}
                            >
                              <Star className="mr-1 h-3 w-3" />
                              {highlight.score}%
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(highlight.startTime)} - {formatTime(highlight.endTime)}
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <CatIcon className={cn("h-3 w-3", catInfo.color)} />
                              {catInfo.label}
                            </Badge>
                          </div>

                          {/* Engagement Stats */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {highlight.engagement.reactions} reactions
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {highlight.engagement.questions} questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {highlight.engagement.viewerPeak} peak viewers
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Extraction Progress */}
            {isExtracting && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Extracting clips...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(extractProgress)}%</span>
                </div>
                <Progress value={extractProgress} className="h-2" />
              </div>
            )}

            {/* Settings & Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={settings.addCaptions}
                    onCheckedChange={(v) => setSettings(s => ({ ...s, addCaptions: v as boolean }))}
                  />
                  <span className="text-sm">Add captions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={settings.includeTransitions}
                    onCheckedChange={(v) => setSettings(s => ({ ...s, includeTransitions: v as boolean }))}
                  />
                  <span className="text-sm">Include transitions</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Preview Selection
                </Button>
                <Button
                  onClick={extractHighlights}
                  disabled={selectedCount === 0 || isExtracting}
                >
                  {isExtracting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Extract {selectedCount} Clips
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WebinarHighlightExtractor;
