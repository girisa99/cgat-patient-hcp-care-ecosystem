/**
 * AI RECOMMENDATIONS PANEL
 * 
 * Proactive AI suggestions for templates and visual formats
 * Based on user's prompt/topic analysis
 * 
 * Features:
 * - Auto-analyzes prompt as user types
 * - Shows recommendations with WHY explanations
 * - User can accept, modify, or dismiss
 * - All interactions feed to Label Studio for learning
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles, Check, X, ChevronDown, ChevronUp,
  Lightbulb, Target, MapPin, Palette, ThumbsUp, ThumbsDown,
  Info, Wand2, Loader2, BookOpen, Video, Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudioRecommendations, type AIRecommendation, type RecommendationMatch } from '@/services/studioRecommendationService';
import { useLabelStudioBackground } from '@/services/labelStudioBackgroundService';
import { useDebounce } from '@/hooks/useDebounce';

interface AIRecommendationsPanelProps {
  prompt: string;
  availableTemplates: Array<{ id: string; label: string; category: string }>;
  availableVisuals: Array<{ id: string; label: string; category: string }>;
  selectedTemplates: string[];
  selectedVisuals: string[];
  onSelectTemplates: (ids: string[]) => void;
  onSelectVisuals: (ids: string[]) => void;
  disabled?: boolean;
}

export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  prompt,
  availableTemplates,
  availableVisuals,
  selectedTemplates,
  selectedVisuals,
  onSelectTemplates,
  onSelectVisuals,
  disabled = false,
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'like' | 'dislike'>>({});
  
  const { analyzePrompt } = useStudioRecommendations();
  const { recordEvent } = useLabelStudioBackground();
  const debouncedPrompt = useDebounce(prompt, 800);

  // Auto-analyze when prompt changes
  useEffect(() => {
    if (debouncedPrompt.length < 10 || disabled) {
      setRecommendations(null);
      return;
    }

    const analyze = async () => {
      setIsAnalyzing(true);
      try {
        const result = await analyzePrompt(debouncedPrompt, availableTemplates, availableVisuals);
        setRecommendations(result);
        setFeedbackGiven({});
        
        // Record that recommendations were shown
        recordEvent({
          eventType: 'thumbnail_chosen',
          context: {
            product: 'hub',
            contentType: 'ai_recommendation_shown',
            originalValue: debouncedPrompt.slice(0, 100),
            userAction: 'accept',
          },
          metadata: {
            templateCount: result.templates.length,
            visualCount: result.visualFormats.length,
          },
        });
      } catch (error) {
        console.error('[AIRecommendations] Analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyze();
  }, [debouncedPrompt, disabled, analyzePrompt, availableTemplates, availableVisuals, recordEvent]);

  // Handle accepting a recommendation
  const handleAcceptRecommendation = useCallback((
    type: 'template' | 'visual',
    item: RecommendationMatch
  ) => {
    if (type === 'template') {
      if (!selectedTemplates.includes(item.id)) {
        onSelectTemplates([...selectedTemplates, item.id]);
      }
    } else {
      if (!selectedVisuals.includes(item.id)) {
        onSelectVisuals([...selectedVisuals, item.id]);
      }
    }

    // Record acceptance
    recordEvent({
      eventType: 'thumbnail_chosen',
      context: {
        product: 'hub',
        contentType: `recommendation_${type}`,
        originalValue: item.id,
        selectedValue: item.label,
        userAction: 'accept',
      },
      metadata: {
        score: item.score,
        reason: item.reason,
        category: item.category,
      },
    });
  }, [selectedTemplates, selectedVisuals, onSelectTemplates, onSelectVisuals, recordEvent]);

  // Handle accepting all recommendations
  const handleAcceptAll = useCallback(() => {
    if (!recommendations) return;

    const newTemplates = recommendations.templates
      .slice(0, 3)
      .map(t => t.id)
      .filter(id => !selectedTemplates.includes(id));
    
    const newVisuals = recommendations.visualFormats
      .slice(0, 3)
      .map(v => v.id)
      .filter(id => !selectedVisuals.includes(id));

    if (newTemplates.length > 0) {
      onSelectTemplates([...selectedTemplates, ...newTemplates]);
    }
    if (newVisuals.length > 0) {
      onSelectVisuals([...selectedVisuals, ...newVisuals]);
    }

    // Record bulk acceptance
    recordEvent({
      eventType: 'thumbnail_chosen',
      context: {
        product: 'hub',
        contentType: 'recommendation_accept_all',
        originalValue: prompt.slice(0, 100),
        userAction: 'accept',
      },
      metadata: {
        templatesAccepted: newTemplates.length,
        visualsAccepted: newVisuals.length,
      },
    });
  }, [recommendations, selectedTemplates, selectedVisuals, onSelectTemplates, onSelectVisuals, recordEvent, prompt]);

  // Handle feedback on recommendation
  const handleFeedback = useCallback((
    itemId: string,
    feedback: 'like' | 'dislike'
  ) => {
    setFeedbackGiven(prev => ({ ...prev, [itemId]: feedback }));

    recordEvent({
      eventType: feedback === 'like' ? 'hashtag_accepted' : 'hashtag_rejected',
      context: {
        product: 'hub',
        contentType: 'recommendation_feedback',
        originalValue: itemId,
        selectedValue: feedback,
        userAction: feedback === 'like' ? 'accept' : 'reject',
      },
    });
  }, [recordEvent]);

  // Don't render if no prompt or too short
  if (!prompt || prompt.length < 10) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-dashed">
        <Lightbulb className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Enter your content topic to get AI-powered recommendations
        </span>
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-purple-500/5">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">AI Recommendations</h4>
                <p className="text-xs text-muted-foreground">
                  {isAnalyzing ? 'Analyzing your content...' : 'Suggested templates & visual styles'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          
          {recommendations ? (
            <div className="p-3 space-y-4">
              {/* Overview */}
              <div className="flex items-start gap-2 p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {recommendations.overview}
                </p>
              </div>

              {/* Prompt Analysis */}
              <div className="flex flex-wrap gap-2">
                {recommendations.promptAnalysis.detectedIndustry !== 'General' && (
                  <Badge variant="secondary" className="text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    {recommendations.promptAnalysis.detectedIndustry}
                  </Badge>
                )}
                {recommendations.promptAnalysis.detectedRegion !== 'Global' && (
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {recommendations.promptAnalysis.detectedRegion}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <Palette className="w-3 h-3 mr-1" />
                  {recommendations.promptAnalysis.suggestedTone}
                </Badge>
              </div>

              {/* Template Recommendations */}
              {recommendations.templates.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Recommended Templates</span>
                  </div>
                  <ScrollArea className="max-h-[120px]">
                    <div className="space-y-1.5">
                      {recommendations.templates.slice(0, 5).map((item) => (
                        <RecommendationItem
                          key={item.id}
                          item={item}
                          type="template"
                          isSelected={selectedTemplates.includes(item.id)}
                          feedback={feedbackGiven[item.id]}
                          onAccept={() => handleAcceptRecommendation('template', item)}
                          onFeedback={(fb) => handleFeedback(item.id, fb)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Visual Format Recommendations */}
              {recommendations.visualFormats.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Recommended Visual Styles</span>
                  </div>
                  <ScrollArea className="max-h-[120px]">
                    <div className="space-y-1.5">
                      {recommendations.visualFormats.slice(0, 8).map((item) => (
                        <RecommendationItem
                          key={item.id}
                          item={item}
                          type="visual"
                          isSelected={selectedVisuals.includes(item.id)}
                          feedback={feedbackGiven[item.id]}
                          onAccept={() => handleAcceptRecommendation('visual', item)}
                          onFeedback={(fb) => handleFeedback(item.id, fb)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="flex-1 gap-1"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Apply Top Suggestions
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Learning Notice */}
              <p className="text-[10px] text-muted-foreground text-center">
                ✨ Your choices help improve future recommendations
              </p>
            </div>
          ) : isAnalyzing ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : null}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// Single recommendation item
interface RecommendationItemProps {
  item: RecommendationMatch;
  type: 'template' | 'visual';
  isSelected: boolean;
  feedback?: 'like' | 'dislike';
  onAccept: () => void;
  onFeedback: (feedback: 'like' | 'dislike') => void;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  item,
  type,
  isSelected,
  feedback,
  onAccept,
  onFeedback,
}) => {
  const Icon = type === 'template' ? BookOpen : Image;

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-md border transition-all",
      isSelected 
        ? "bg-primary/10 border-primary/30" 
        : "bg-background hover:bg-muted/50 border-transparent"
    )}>
      {/* Icon & Info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium truncate">{item.label}</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
              {item.score}%
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {item.reason}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!isSelected && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={onAccept}
          >
            <Check className="w-3 h-3 mr-1" />
            Use
          </Button>
        )}
        {isSelected && (
          <Badge variant="secondary" className="text-[9px]">
            <Check className="w-2.5 h-2.5 mr-0.5" />
            Added
          </Badge>
        )}
        
        {/* Feedback buttons */}
        <button
          onClick={() => onFeedback('like')}
          className={cn(
            "p-1 rounded transition-colors",
            feedback === 'like' ? "text-green-500" : "text-muted-foreground hover:text-green-500"
          )}
        >
          <ThumbsUp className="w-3 h-3" />
        </button>
        <button
          onClick={() => onFeedback('dislike')}
          className={cn(
            "p-1 rounded transition-colors",
            feedback === 'dislike' ? "text-red-500" : "text-muted-foreground hover:text-red-500"
          )}
        >
          <ThumbsDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default AIRecommendationsPanel;
