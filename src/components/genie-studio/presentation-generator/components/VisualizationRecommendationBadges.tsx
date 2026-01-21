/**
 * Visualization Recommendation Badges Component
 * Displays AI-suggested visualizations based on industry, framework, and output type
 */

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sparkles, ChevronRight, Info, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getVisualizationRecommendations,
  VisualizationSuggestion,
  VisualizationContext,
} from '../services/visualizationRecommendationService';

interface VisualizationRecommendationBadgesProps {
  context: VisualizationContext;
  selectedFeatures: string[];
  onFeatureSelect?: (featureId: string, subOptions?: string[]) => void;
  maxDisplay?: number;
  compact?: boolean;
  className?: string;
}

export function VisualizationRecommendationBadges({
  context,
  selectedFeatures,
  onFeatureSelect,
  maxDisplay = 5,
  compact = false,
  className,
}: VisualizationRecommendationBadgesProps) {
  const recommendations = useMemo(() => {
    return getVisualizationRecommendations(context);
  }, [context.industry, context.selectedFrameworks, context.outputType, context.globalTier]);

  const topSuggestions = recommendations.suggestions.slice(0, maxDisplay);

  if (topSuggestions.length === 0) {
    return null;
  }

  const getPriorityStyles = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
      case 'medium':
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
      case 'low':
        return 'border-muted bg-muted/50 text-muted-foreground';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'framework':
        return '📊';
      case 'industry':
        return '🏢';
      case 'content-type':
        return '📝';
      case 'output-format':
        return '🎬';
      default:
        return '✨';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header with reasoning */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs font-medium text-muted-foreground">
          AI Suggestions
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">{recommendations.overallReasoning}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Suggestion badges */}
      <div className="flex flex-wrap gap-1.5">
        {topSuggestions.map((suggestion) => {
          const isSelected = selectedFeatures.includes(suggestion.featureId);
          
          return (
            <TooltipProvider key={suggestion.featureId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFeatureSelect?.(
                      suggestion.featureId,
                      suggestion.suggestedSubOptions
                    )}
                    className={cn(
                      'h-6 px-2 text-[11px] font-medium gap-1 border transition-all',
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary'
                        : getPriorityStyles(suggestion.priority),
                      'hover:scale-[1.02]'
                    )}
                  >
                    <span>{getSourceIcon(suggestion.source)}</span>
                    <span>{suggestion.featureName}</span>
                    {isSelected ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium text-xs">{suggestion.featureName}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                    {suggestion.suggestedSubOptions.length > 0 && (
                      <div className="pt-1 border-t mt-1">
                        <p className="text-[10px] text-muted-foreground">
                          Suggested: {suggestion.suggestedSubOptions.slice(0, 3).join(', ')}
                          {suggestion.suggestedSubOptions.length > 3 && ' ...'}
                        </p>
                      </div>
                    )}
                    <Badge variant="outline" className="text-[9px] mt-1">
                      {suggestion.priority} priority • {suggestion.source}
                    </Badge>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        
        {recommendations.suggestions.length > maxDisplay && !compact && (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            +{recommendations.suggestions.length - maxDisplay} more
          </Badge>
        )}
      </div>

      {/* Compact summary */}
      {compact && recommendations.suggestions.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {recommendations.suggestions.filter(s => s.priority === 'high').length} high-priority suggestions
        </p>
      )}
    </div>
  );
}

/**
 * Mini version for inline display
 */
export function VisualizationRecommendationChips({
  context,
  selectedFeatures,
  onFeatureSelect,
  maxDisplay = 3,
}: {
  context: VisualizationContext;
  selectedFeatures: string[];
  onFeatureSelect?: (featureId: string) => void;
  maxDisplay?: number;
}) {
  const recommendations = useMemo(() => {
    return getVisualizationRecommendations(context);
  }, [context]);

  const highPriority = recommendations.suggestions
    .filter(s => s.priority === 'high')
    .slice(0, maxDisplay);

  if (highPriority.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <Sparkles className="h-3 w-3 text-amber-500" />
      {highPriority.map((s) => (
        <Badge
          key={s.featureId}
          variant="outline"
          className={cn(
            'text-[10px] px-1.5 cursor-pointer hover:bg-accent',
            selectedFeatures.includes(s.featureId) && 'bg-primary/10 border-primary'
          )}
          onClick={() => onFeatureSelect?.(s.featureId)}
        >
          {s.featureName}
        </Badge>
      ))}
    </div>
  );
}
