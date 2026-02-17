/**
 * AIRoutingInsightsPanel - Phase 1 UI Component
 * 
 * Displays query classification and model routing intelligence
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Zap, 
  DollarSign, 
  Clock, 
  Target, 
  Sparkles,
  TrendingUp,
  Shield,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { useAIRoutingIntelligence } from '@/hooks/useAIRoutingIntelligence';
import { QueryIntent, ContentComplexity, CostTier } from '@/services/ai/AIRoutingIntelligenceService';
import { cn } from '@/lib/utils';

interface AIRoutingInsightsPanelProps {
  query?: string;
  hasAttachments?: boolean;
  onModelSelect?: (modelId: string, provider: string) => void;
  className?: string;
  autoAnalyze?: boolean;
}

const INTENT_ICONS: Record<QueryIntent, React.ReactNode> = {
  creative_writing: <Sparkles className="h-4 w-4" />,
  technical_analysis: <Brain className="h-4 w-4" />,
  conversational: <Globe className="h-4 w-4" />,
  translation: <Globe className="h-4 w-4" />,
  summarization: <Target className="h-4 w-4" />,
  image_generation: <Sparkles className="h-4 w-4" />,
  video_generation: <Sparkles className="h-4 w-4" />,
  audio_generation: <Sparkles className="h-4 w-4" />,
  document_processing: <Target className="h-4 w-4" />,
  multimodal: <Brain className="h-4 w-4" />,
  reasoning: <Brain className="h-4 w-4" />,
  classification: <Target className="h-4 w-4" />,
  unknown: <Brain className="h-4 w-4" />,
};

const COMPLEXITY_COLORS: Record<ContentComplexity, string> = {
  simple: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-blue-100 text-blue-700 border-blue-200',
  complex: 'bg-orange-100 text-orange-700 border-orange-200',
  expert: 'bg-purple-100 text-purple-700 border-purple-200',
};

const COST_TIER_COLORS: Record<CostTier, string> = {
  economy: 'bg-green-100 text-green-700',
  standard: 'bg-blue-100 text-blue-700',
  premium: 'bg-orange-100 text-orange-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

export const AIRoutingInsightsPanel: React.FC<AIRoutingInsightsPanelProps> = ({
  query,
  hasAttachments = false,
  onModelSelect,
  className,
  autoAnalyze = true
}) => {
  const {
    isAnalyzing,
    lastClassification,
    recommendations,
    selectedModel,
    routingDecision,
    analyzeQuery,
    selectModel,
    selectCostOptimized,
    selectQualityOptimized,
    selectSpeedOptimized,
  } = useAIRoutingIntelligence();

  React.useEffect(() => {
    if (autoAnalyze && query && query.length > 10) {
      analyzeQuery(query, hasAttachments);
    }
  }, [query, hasAttachments, autoAnalyze, analyzeQuery]);

  if (isAnalyzing) {
    return (
      <Card className={cn("w-full animate-pulse", className)}>
        <CardContent className="py-6 text-center text-muted-foreground">
          <Brain className="h-6 w-6 mx-auto mb-2 animate-spin" />
          Analyzing query...
        </CardContent>
      </Card>
    );
  }

  if (!lastClassification || !routingDecision) {
    return null;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          AI Routing Intelligence
        </CardTitle>
        <CardDescription className="text-xs">
          Auto-model selection based on query analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Query Classification */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Query Classification
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {INTENT_ICONS[lastClassification.intent]}
              {lastClassification.intent.replace(/_/g, ' ')}
            </Badge>
            <Badge className={COMPLEXITY_COLORS[lastClassification.complexity]}>
              {lastClassification.complexity}
            </Badge>
            <Badge className={COST_TIER_COLORS[lastClassification.suggestedCostTier]}>
              {lastClassification.suggestedCostTier}
            </Badge>
            {lastClassification.requiresVision && (
              <Badge variant="secondary">Vision Required</Badge>
            )}
            {lastClassification.requiresReasoning && (
              <Badge variant="secondary">Reasoning Required</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Confidence:</span>
            <Progress value={lastClassification.confidence * 100} className="w-20 h-1.5" />
            <span>{Math.round(lastClassification.confidence * 100)}%</span>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Optimization Presets
          </h4>
          <div className="flex gap-2">
            <Button
              variant={selectedModel?.modelId === routingDecision.costOptimizedOption?.modelId ? "default" : "outline"}
              size="sm"
              onClick={selectCostOptimized}
              className="flex-1"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Cost
            </Button>
            <Button
              variant={selectedModel?.modelId === routingDecision.qualityOptimizedOption?.modelId ? "default" : "outline"}
              size="sm"
              onClick={selectQualityOptimized}
              className="flex-1"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Quality
            </Button>
            <Button
              variant={selectedModel?.modelId === routingDecision.speedOptimizedOption?.modelId ? "default" : "outline"}
              size="sm"
              onClick={selectSpeedOptimized}
              className="flex-1"
            >
              <Clock className="h-3 w-3 mr-1" />
              Speed
            </Button>
          </div>
        </div>

        <Separator />

        {/* Recommended Models */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Recommended Models
          </h4>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div
                key={rec.modelId}
                className={cn(
                  "p-2 rounded-lg border cursor-pointer transition-all",
                  selectedModel?.modelId === rec.modelId
                    ? "bg-primary/10 border-primary"
                    : "bg-background hover:bg-muted"
                )}
                onClick={() => {
                  selectModel(rec);
                  onModelSelect?.(rec.modelId, rec.provider);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedModel?.modelId === rec.modelId && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-medium text-sm">{rec.displayName}</span>
                    {index === 0 && (
                      <Badge variant="default" className="text-xs">
                        Best Match
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Score: {rec.score.toFixed(0)}
                  </Badge>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{rec.estimatedLatency}ms
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ~${rec.estimatedCost.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reasoning */}
        {lastClassification.reasoning.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Routing Logic
              </h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {lastClassification.reasoning.slice(0, 3).map((reason, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRoutingInsightsPanel;
