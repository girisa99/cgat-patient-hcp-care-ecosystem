/**
 * Slide Enhancer Panel
 * 
 * Reuses script editor AI analyze/enhance patterns for slides:
 * - Analyze content against primary language
 * - Inline editing and enhancement
 * - Per-slide or whole presentation operations
 * - Confidence-based suggestions
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Wand2,
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2,
  Edit3,
  RotateCcw,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Lightbulb,
  FileText,
  MessageSquare,
  TrendingUp,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GeneratedSlide } from '@/services/universalPresentationService';

// Enhancement types matching script editor patterns
export type SlideEnhancementType = 
  | 'rewrite'       // Improve clarity
  | 'expand'        // Add more detail
  | 'summarize'     // Make concise
  | 'polish'        // Professional refinement
  | 'transitions'   // Improve flow
  | 'brand_voice';  // Match brand tone

interface EnhancementOption {
  type: SlideEnhancementType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const ENHANCEMENT_OPTIONS: EnhancementOption[] = [
  {
    type: 'rewrite',
    label: 'Rewrite',
    description: 'Improve clarity and flow',
    icon: <RefreshCw className="h-3 w-3" />,
  },
  {
    type: 'expand',
    label: 'Expand',
    description: 'Add more detail',
    icon: <Maximize2 className="h-3 w-3" />,
  },
  {
    type: 'summarize',
    label: 'Summarize',
    description: 'Make more concise',
    icon: <Minimize2 className="h-3 w-3" />,
  },
  {
    type: 'polish',
    label: 'Polish',
    description: 'Professional refinement',
    icon: <Sparkles className="h-3 w-3" />,
  },
  {
    type: 'transitions',
    label: 'Transitions',
    description: 'Improve slide flow',
    icon: <TrendingUp className="h-3 w-3" />,
  },
  {
    type: 'brand_voice',
    label: 'Brand Voice',
    description: 'Match your brand tone',
    icon: <MessageSquare className="h-3 w-3" />,
  },
];

interface AnalysisResult {
  overallScore: number;
  suggestions: {
    slideIndex: number;
    type: 'warning' | 'suggestion' | 'improvement';
    message: string;
    autoFixAvailable: boolean;
  }[];
  comparisons: {
    slideIndex: number;
    primaryContent: string;
    translatedContent: string;
    discrepancies: string[];
  }[];
}

interface SlideEnhancerPanelProps {
  slides: GeneratedSlide[];
  primarySlides?: GeneratedSlide[]; // For comparison
  languageCode: string;
  languageName: string;
  isPrimary: boolean;
  confidenceScores?: { slideNumber: number; score: number; issues: string[] }[];
  onSlideUpdate: (slideIndex: number, updates: Partial<GeneratedSlide>) => void;
  onEnhanceSlide: (slideIndex: number, type: SlideEnhancementType, customInstructions?: string) => Promise<void>;
  onEnhanceAll: (type: SlideEnhancementType, customInstructions?: string) => Promise<void>;
  onAnalyze: () => Promise<AnalysisResult>;
  onRevertSlide: (slideIndex: number) => void;
  className?: string;
}

export function SlideEnhancerPanel({
  slides,
  primarySlides,
  languageCode,
  languageName,
  isPrimary,
  confidenceScores,
  onSlideUpdate,
  onEnhanceSlide,
  onEnhanceAll,
  onAnalyze,
  onRevertSlide,
  className,
}: SlideEnhancerPanelProps) {
  const [activeTab, setActiveTab] = useState<'enhance' | 'analyze' | 'edit'>('enhance');
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(null);
  const [selectedEnhancement, setSelectedEnhancement] = useState<SlideEnhancementType | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  // Handle enhance action
  const handleEnhance = useCallback(async () => {
    if (!selectedEnhancement) return;

    setIsEnhancing(true);
    try {
      if (selectedSlideIndex !== null) {
        await onEnhanceSlide(selectedSlideIndex, selectedEnhancement, customInstructions || undefined);
        toast.success(`Slide ${selectedSlideIndex + 1} enhanced!`);
      } else {
        await onEnhanceAll(selectedEnhancement, customInstructions || undefined);
        toast.success('All slides enhanced!');
      }
      setSelectedEnhancement(null);
      setCustomInstructions('');
    } catch (error) {
      toast.error('Enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  }, [selectedEnhancement, selectedSlideIndex, customInstructions, onEnhanceSlide, onEnhanceAll]);

  // Handle analyze
  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = await onAnalyze();
      setAnalysisResult(result);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalyze]);

  // Handle inline edit
  const startEditing = (slideIndex: number) => {
    const slide = slides[slideIndex];
    setEditingSlide(slideIndex);
    setEditContent(slide.bullets?.join('\n') || slide.content || '');
  };

  const saveEdit = () => {
    if (editingSlide === null) return;
    
    const bullets = editContent.split('\n').filter(b => b.trim());
    onSlideUpdate(editingSlide, { bullets });
    setEditingSlide(null);
    setEditContent('');
    toast.success('Slide updated!');
  };

  const cancelEdit = () => {
    setEditingSlide(null);
    setEditContent('');
  };

  // Get slides that need attention (low confidence)
  const lowConfidenceSlides = confidenceScores?.filter(s => s.score < 75) || [];

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            Enhance & Analyze
            <Badge variant="secondary" className="text-[9px]">
              {languageName}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full h-8">
            <TabsTrigger value="enhance" className="flex-1 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Enhance
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex-1 text-xs">
              <Search className="h-3 w-3 mr-1" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex-1 text-xs">
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enhance" className="mt-3 space-y-3">
            {/* Scope Selection */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Apply to</div>
              <div className="flex gap-1.5">
                <Button
                  variant={selectedSlideIndex === null ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => setSelectedSlideIndex(null)}
                >
                  All Slides
                </Button>
                <select
                  className="flex-1 h-7 text-xs px-2 rounded border bg-background"
                  value={selectedSlideIndex ?? ''}
                  onChange={(e) => setSelectedSlideIndex(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Select slide...</option>
                  {slides.map((_, idx) => (
                    <option key={idx} value={idx}>Slide {idx + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Enhancement Options */}
            <div className="grid grid-cols-3 gap-1.5">
              {ENHANCEMENT_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setSelectedEnhancement(option.type)}
                  disabled={isEnhancing}
                  className={cn(
                    "p-2 rounded-lg border text-left transition-all",
                    selectedEnhancement === option.type
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50",
                    isEnhancing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="text-primary">{option.icon}</div>
                    <span className="text-[10px] font-medium">{option.label}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground line-clamp-1">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Custom Instructions */}
            {selectedEnhancement && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Custom instructions (optional)
                </label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="E.g., 'Make it more conversational' or 'Add healthcare terminology'"
                  rows={2}
                  className="text-xs resize-none"
                  disabled={isEnhancing}
                />
              </div>
            )}

            {/* Action Button */}
            <Button
              className="w-full gap-2"
              disabled={!selectedEnhancement || isEnhancing}
              onClick={handleEnhance}
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Apply Enhancement
                </>
              )}
            </Button>

            {/* Low confidence slides warning */}
            {lowConfidenceSlides.length > 0 && (
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-1.5 text-xs text-yellow-600 mb-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="font-medium">{lowConfidenceSlides.length} slides need attention</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {lowConfidenceSlides.slice(0, 5).map(s => (
                    <Button
                      key={s.slideNumber}
                      variant="ghost"
                      size="sm"
                      className="h-5 text-[9px] px-1.5"
                      onClick={() => setSelectedSlideIndex(s.slideNumber - 1)}
                    >
                      #{s.slideNumber} ({s.score}%)
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analyze" className="mt-3 space-y-3">
            {!isPrimary && primarySlides && (
              <div className="p-2 rounded-lg bg-muted/50 border text-xs">
                <Lightbulb className="h-3 w-3 inline mr-1 text-yellow-500" />
                Compare {languageName} against primary language for consistency
              </div>
            )}

            <Button
              className="w-full gap-2"
              variant="outline"
              disabled={isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze {isPrimary ? 'Content' : 'vs Primary'}
                </>
              )}
            </Button>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analysis Score</span>
                  <Badge 
                    variant={analysisResult.overallScore >= 80 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {analysisResult.overallScore}%
                  </Badge>
                </div>

                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-1.5 pr-2">
                    {analysisResult.suggestions.map((suggestion, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "p-2 rounded border text-xs",
                          suggestion.type === 'warning' && "border-red-500/30 bg-red-500/5",
                          suggestion.type === 'suggestion' && "border-yellow-500/30 bg-yellow-500/5",
                          suggestion.type === 'improvement' && "border-blue-500/30 bg-blue-500/5"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground">#{suggestion.slideIndex + 1}</span>
                          <span className="flex-1">{suggestion.message}</span>
                          {suggestion.autoFixAvailable && (
                            <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1.5">
                              Fix
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="mt-3 space-y-3">
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2 pr-2">
                {slides.map((slide, idx) => (
                  <div key={idx} className="p-2 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">
                        #{idx + 1}: {slide.title}
                      </span>
                      <div className="flex items-center gap-1">
                        {editingSlide === idx ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={cancelEdit}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={saveEdit}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => startEditing(idx)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => onRevertSlide(idx)}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingSlide === idx ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-xs resize-none"
                        rows={4}
                        placeholder="One bullet point per line..."
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {slide.bullets?.slice(0, 2).map((b, i) => (
                          <div key={i} className="truncate">• {b}</div>
                        ))}
                        {(slide.bullets?.length || 0) > 2 && (
                          <div className="text-[10px] text-muted-foreground/70">
                            +{(slide.bullets?.length || 0) - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
