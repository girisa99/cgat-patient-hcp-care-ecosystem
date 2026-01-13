/**
 * B-Roll Integrator - P1 #14
 * 
 * AI suggests B-roll placements and auto-inserts relevant footage.
 * Flow: Main Video → AI Analysis → Suggest Placements → Insert B-Roll
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Film,
  Sparkles,
  Play,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Image,
  Video,
  Search,
  Upload,
  Layers,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface BRollSuggestion {
  id: string;
  timestamp: number;
  duration: number;
  reason: string;
  suggestedContent: string;
  category: 'transition' | 'illustration' | 'emphasis' | 'context';
  confidence: number;
  brollOptions: BRollOption[];
  selectedOption?: string;
  isApplied: boolean;
}

interface BRollOption {
  id: string;
  name: string;
  thumbnail: string;
  duration: number;
  source: 'library' | 'stock' | 'ai-generated';
  matchScore: number;
}

interface BRollIntegratorProps {
  videoUrl?: string;
  videoDuration?: number;
  onIntegrationComplete?: (suggestions: BRollSuggestion[]) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const BRollIntegrator: React.FC<BRollIntegratorProps> = ({
  videoUrl,
  videoDuration = 120,
  onIntegrationComplete,
  className,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<BRollSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showApplied, setShowApplied] = useState(true);
  const [autoInsert, setAutoInsert] = useState(true);
  const [brollOpacity, setBrollOpacity] = useState([80]);

  const mockBRollOptions: BRollOption[] = [
    { id: 'b1', name: 'Office teamwork', thumbnail: '/placeholder.svg', duration: 5, source: 'stock', matchScore: 92 },
    { id: 'b2', name: 'Data dashboard', thumbnail: '/placeholder.svg', duration: 4, source: 'library', matchScore: 88 },
    { id: 'b3', name: 'AI-generated scene', thumbnail: '/placeholder.svg', duration: 3, source: 'ai-generated', matchScore: 85 },
    { id: 'b4', name: 'Technology abstract', thumbnail: '/placeholder.svg', duration: 6, source: 'stock', matchScore: 78 },
  ];

  const analyzeVideo = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 100));
      setAnalysisProgress(i);
    }

    const mockSuggestions: BRollSuggestion[] = [
      {
        id: '1',
        timestamp: 12,
        duration: 4,
        reason: 'Speaker mentions "team collaboration" - visual reinforcement opportunity',
        suggestedContent: 'Team working together footage',
        category: 'illustration',
        confidence: 94,
        brollOptions: mockBRollOptions.slice(0, 3),
        isApplied: false,
      },
      {
        id: '2',
        timestamp: 28,
        duration: 3,
        reason: 'Transition between topics detected',
        suggestedContent: 'Smooth transition footage',
        category: 'transition',
        confidence: 88,
        brollOptions: mockBRollOptions.slice(1, 4),
        isApplied: false,
      },
      {
        id: '3',
        timestamp: 45,
        duration: 5,
        reason: 'Data/statistics being discussed - visual data recommended',
        suggestedContent: 'Dashboard or chart visualization',
        category: 'emphasis',
        confidence: 91,
        brollOptions: mockBRollOptions,
        isApplied: false,
      },
      {
        id: '4',
        timestamp: 72,
        duration: 4,
        reason: 'Technical explanation - context footage helps comprehension',
        suggestedContent: 'Technology/software footage',
        category: 'context',
        confidence: 85,
        brollOptions: mockBRollOptions.slice(2),
        isApplied: false,
      },
      {
        id: '5',
        timestamp: 95,
        duration: 3,
        reason: 'Conclusion section - reinforcement opportunity',
        suggestedContent: 'Success/achievement footage',
        category: 'emphasis',
        confidence: 87,
        brollOptions: mockBRollOptions.slice(0, 2),
        isApplied: false,
      },
    ];

    setSuggestions(mockSuggestions);
    setIsAnalyzing(false);
  }, []);

  const selectBRollOption = useCallback((suggestionId: string, optionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, selectedOption: optionId } : s
    ));
  }, []);

  const toggleApply = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, isApplied: !s.isApplied } : s
    ));
  }, []);

  const applyAll = useCallback(() => {
    setSuggestions(prev => prev.map(s => ({
      ...s,
      isApplied: true,
      selectedOption: s.selectedOption || s.brollOptions[0]?.id,
    })));
  }, []);

  const removeSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    if (selectedSuggestion === id) setSelectedSuggestion(null);
  }, [selectedSuggestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: BRollSuggestion['category']) => {
    switch (category) {
      case 'transition': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'illustration': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'emphasis': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'context': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      default: return '';
    }
  };

  const appliedCount = suggestions.filter(s => s.isApplied).length;
  const filteredSuggestions = showApplied ? suggestions : suggestions.filter(s => !s.isApplied);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          B-Roll Integrator
        </CardTitle>
        <CardDescription>
          AI-powered B-roll placement suggestions and auto-insertion
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Analysis Section */}
        {suggestions.length === 0 && !isAnalyzing && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Analyze your video for B-roll opportunities</p>
            <p className="text-muted-foreground mb-4">
              AI will identify optimal placement points for supplementary footage
            </p>
            <Button onClick={analyzeVideo}>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Video
            </Button>
          </div>
        )}

        {/* Progress */}
        {isAnalyzing && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="font-medium">Analyzing video content...</p>
              <p className="text-sm text-muted-foreground">
                Identifying optimal B-roll placement points
              </p>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {suggestions.length} suggestions
                </Badge>
                <Badge variant={appliedCount > 0 ? 'default' : 'outline'}>
                  {appliedCount} applied
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showApplied}
                    onCheckedChange={setShowApplied}
                  />
                  <span className="text-sm">Show applied</span>
                </div>
                <Button variant="outline" size="sm" onClick={applyAll}>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Apply All
                </Button>
              </div>
            </div>

            {/* Timeline Preview */}
            <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center px-4">
                <div className="w-full h-2 bg-primary/20 rounded-full relative">
                  {suggestions.map(s => (
                    <div
                      key={s.id}
                      className={cn(
                        "absolute h-4 -top-1 rounded cursor-pointer transition-colors",
                        s.isApplied ? "bg-primary" : "bg-amber-500",
                        selectedSuggestion === s.id && "ring-2 ring-primary ring-offset-2"
                      )}
                      style={{
                        left: `${(s.timestamp / videoDuration) * 100}%`,
                        width: `${(s.duration / videoDuration) * 100}%`,
                        minWidth: '8px',
                      }}
                      onClick={() => setSelectedSuggestion(s.id)}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-1 left-4 text-xs text-muted-foreground">0:00</div>
              <div className="absolute bottom-1 right-4 text-xs text-muted-foreground">
                {formatTime(videoDuration)}
              </div>
            </div>

            {/* Suggestions Grid */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {filteredSuggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      selectedSuggestion === suggestion.id && "border-primary bg-primary/5",
                      suggestion.isApplied && "bg-muted/50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatTime(suggestion.timestamp)}
                        </Badge>
                        <Badge className={getCategoryColor(suggestion.category)}>
                          {suggestion.category}
                        </Badge>
                        <Badge variant="outline">
                          {suggestion.confidence}% match
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant={suggestion.isApplied ? 'default' : 'outline'}
                          className="h-8 w-8"
                          onClick={() => toggleApply(suggestion.id)}
                        >
                          {suggestion.isApplied ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeSuggestion(suggestion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm mb-3">{suggestion.reason}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      <Sparkles className="inline mr-1 h-3 w-3" />
                      Suggested: {suggestion.suggestedContent}
                    </p>

                    {/* B-Roll Options */}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {suggestion.brollOptions.map(option => (
                        <div
                          key={option.id}
                          className={cn(
                            "shrink-0 w-32 border rounded-lg overflow-hidden cursor-pointer transition-colors",
                            suggestion.selectedOption === option.id && "border-primary ring-2 ring-primary/30"
                          )}
                          onClick={() => selectBRollOption(suggestion.id, option.id)}
                        >
                          <div className="aspect-video bg-muted relative">
                            <img
                              src={option.thumbnail}
                              alt={option.name}
                              className="w-full h-full object-cover"
                            />
                            <Badge
                              variant="secondary"
                              className="absolute top-1 right-1 text-[10px] px-1"
                            >
                              {option.source === 'ai-generated' && '🤖'}
                              {option.source === 'stock' && '📦'}
                              {option.source === 'library' && '📁'}
                            </Badge>
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">{option.name}</p>
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>{option.duration}s</span>
                              <span>{option.matchScore}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="shrink-0 w-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Settings & Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoInsert}
                    onCheckedChange={setAutoInsert}
                  />
                  <span className="text-sm">Auto-insert on apply</span>
                </div>
                <div className="flex items-center gap-3 w-48">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    B-roll opacity
                  </span>
                  <Slider
                    value={brollOpacity}
                    onValueChange={setBrollOpacity}
                    max={100}
                    step={5}
                  />
                  <span className="text-sm w-8">{brollOpacity}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={() => onIntegrationComplete?.(suggestions)}>
                  <Film className="mr-2 h-4 w-4" />
                  Export with B-Roll
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BRollIntegrator;
