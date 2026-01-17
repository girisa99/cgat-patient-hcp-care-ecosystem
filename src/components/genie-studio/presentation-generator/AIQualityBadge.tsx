/**
 * AI Quality Badge Component
 * 
 * Displays AI-assessed quality score with detailed breakdown
 * Replaces simple heuristic confidence badge
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Link2, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  SlideQualityMetrics, 
  getQualityColor, 
  getQualityLabel,
  assessSlideQuality 
} from '@/services/aiQualityAssessmentService';

interface AIQualityBadgeProps {
  slide: {
    id: string;
    title?: string;
    content?: { bullets?: string[]; paragraph?: string };
    image?: string;
    speakerNotes?: string;
  };
  metrics?: SlideQualityMetrics;
  onRefresh?: (newMetrics: SlideQualityMetrics) => void;
  compact?: boolean;
  showDetails?: boolean;
}

export function AIQualityBadge({ 
  slide, 
  metrics, 
  onRefresh,
  compact = false,
  showDetails = true 
}: AIQualityBadgeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localMetrics, setLocalMetrics] = useState<SlideQualityMetrics | undefined>(metrics);

  const currentMetrics = localMetrics || metrics;
  const score = currentMetrics?.overall || 0;
  const colorClass = getQualityColor(score);
  const label = getQualityLabel(score);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await assessSlideQuality(slide);
      setLocalMetrics(result.metrics);
      onRefresh?.(result.metrics);
    } catch (error) {
      console.error('Failed to refresh quality assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={cn('gap-1 font-mono text-xs', colorClass)}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <>
            <Brain className="h-3 w-3" />
            {score}%
          </>
        )}
      </Badge>
    );
  }

  if (!showDetails) {
    return (
      <Badge 
        variant="outline" 
        className={cn('gap-1.5', colorClass)}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <Brain className="h-3.5 w-3.5" />
            {score}% {label}
          </>
        )}
      </Badge>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge 
          variant="outline" 
          className={cn('gap-1.5 cursor-pointer hover:opacity-80 transition-opacity', colorClass)}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Brain className="h-3.5 w-3.5" />
              {score}% {label}
            </>
          )}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">AI Quality Assessment</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-7 px-2"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {currentMetrics && (
            <>
              {/* Overall Score */}
              <div className="text-center py-2">
                <div className={cn('text-3xl font-bold', colorClass.split(' ')[0])}>
                  {currentMetrics.overall}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {label} • via {currentMetrics.model}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <MetricRow 
                  icon={<TrendingUp className="h-3.5 w-3.5" />}
                  label="Content Accuracy"
                  value={currentMetrics.contentAccuracy}
                />
                <MetricRow 
                  icon={<Eye className="h-3.5 w-3.5" />}
                  label="Visual Relevance"
                  value={currentMetrics.visualRelevance}
                />
                <MetricRow 
                  icon={<MessageSquare className="h-3.5 w-3.5" />}
                  label="Language Quality"
                  value={currentMetrics.languageQuality}
                />
                <MetricRow 
                  icon={<Link2 className="h-3.5 w-3.5" />}
                  label="Coherence"
                  value={currentMetrics.coherenceScore}
                />
                <MetricRow 
                  icon={<Sparkles className="h-3.5 w-3.5" />}
                  label="Engagement"
                  value={currentMetrics.engagementScore}
                />
              </div>

              {/* Strengths */}
              {currentMetrics.strengths.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Strengths
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {currentMetrics.strengths.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {currentMetrics.improvements.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Suggestions
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {currentMetrics.improvements.slice(0, 3).map((imp, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-amber-500">•</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Model */}
              {currentMetrics.suggestedModel && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                  💡 Try <span className="font-mono text-primary">{currentMetrics.suggestedModel}</span> for better results
                </div>
              )}
            </>
          )}

          {!currentMetrics && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Click refresh to run AI assessment
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MetricRow({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
}) {
  const colorClass = getQualityColor(value);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          {label}
        </div>
        <span className={cn('font-mono font-medium', colorClass.split(' ')[0])}>
          {value}%
        </span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

export default AIQualityBadge;
