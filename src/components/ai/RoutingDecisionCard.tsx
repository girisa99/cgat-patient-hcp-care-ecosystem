/**
 * RoutingDecisionCard — Phase 2 Routing Transparency Component
 * 
 * Displays the complete routing decision for any AI task:
 * - Selected model with provider badge
 * - Zone routing context (Claude/Alibaba/Gemini zone)
 * - Cost / Quality / Speed optimization scores
 * - Fallback chain visualization
 * - RTL & language indicators
 * 
 * Can be embedded in Studio, Ask Genie, Cast, or any Genie sub-app.
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Zap,
  DollarSign,
  Clock,
  TrendingUp,
  Shield,
  Globe,
  CheckCircle2,
  ArrowRight,
  Target,
  AlertTriangle,
  Lock,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  RoutingDecision,
  ModelRecommendation,
  QueryClassification,
} from '@/services/ai/AIRoutingIntelligenceService';

// ============================================
// TYPES
// ============================================

export interface RoutingDecisionCardProps {
  /** Full routing decision from useAIRoutingIntelligence */
  decision: RoutingDecision | null;
  /** Currently selected model (controlled) */
  selectedModel?: ModelRecommendation | null;
  /** Called when user picks a different model */
  onModelSelect?: (model: ModelRecommendation) => void;
  /** Called when user picks an optimization preset */
  onOptimizationSelect?: (type: 'cost' | 'quality' | 'speed') => void;
  /** Task type label shown in header */
  taskType?: string;
  /** Regional zone override for display */
  zone?: string;
  /** Show the fallback chain */
  showFallbackChain?: boolean;
  /** Compact mode for side panels */
  compact?: boolean;
  className?: string;
}

// ============================================
// ZONE METADATA (READ-ONLY)
// ============================================

const ZONE_META = Object.freeze({
  claude: { label: 'Claude Zone', regions: 'Western / EU / LATAM', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', icon: '🧠' },
  alibaba: { label: 'Alibaba Zone', regions: 'CJK / MENA', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: '🌏' },
  gemini: { label: 'Gemini Zone', regions: 'India / SEA / Africa', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: '💎' },
  fallback: { label: 'Global Fallback', regions: 'GPT-4o', color: 'bg-muted text-muted-foreground', icon: '🔄' },
} as const);

const TASK_TYPE_ICONS: Record<string, React.ReactNode> = {
  llm: <Brain className="h-3.5 w-3.5" />,
  tts: <Globe className="h-3.5 w-3.5" />,
  video: <Zap className="h-3.5 w-3.5" />,
  image: <Zap className="h-3.5 w-3.5" />,
  translation: <Globe className="h-3.5 w-3.5" />,
  transcreation: <Brain className="h-3.5 w-3.5" />,
};

// ============================================
// HELPERS
// ============================================

function detectZone(provider: string): keyof typeof ZONE_META {
  const p = provider.toLowerCase();
  if (p.includes('claude') || p.includes('anthropic')) return 'claude';
  if (p.includes('qwen') || p.includes('alibaba') || p.includes('cosyvoice') || p.includes('wan')) return 'alibaba';
  if (p.includes('gemini') || p.includes('google') || p.includes('vertex')) return 'gemini';
  return 'fallback';
}

function formatCost(cost: number): string {
  if (cost < 0.001) return `<$0.001`;
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(3)}`;
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ============================================
// SUB-COMPONENTS
// ============================================

const OptimizationButton: React.FC<{
  type: 'cost' | 'quality' | 'speed';
  isActive: boolean;
  model: ModelRecommendation | null;
  onClick: () => void;
}> = ({ type, isActive, model, onClick }) => {
  const configs = {
    cost: { icon: <DollarSign className="h-3 w-3" />, label: 'Cost', sublabel: model ? formatCost(model.estimatedCost) : '—' },
    quality: { icon: <TrendingUp className="h-3 w-3" />, label: 'Quality', sublabel: model ? `${model.score.toFixed(0)}pts` : '—' },
    speed: { icon: <Clock className="h-3 w-3" />, label: 'Speed', sublabel: model ? formatLatency(model.estimatedLatency) : '—' },
  };
  const cfg = configs[type];

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className="flex-1 flex-col h-auto py-1.5 gap-0"
      disabled={!model}
    >
      <span className="flex items-center gap-1 text-[11px]">
        {cfg.icon}
        {cfg.label}
      </span>
      <span className="text-[10px] opacity-70">{cfg.sublabel}</span>
    </Button>
  );
};

const FallbackChain: React.FC<{ models: ModelRecommendation[] }> = ({ models }) => {
  if (models.length === 0) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {models.map((m, i) => (
        <React.Fragment key={m.modelId}>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5",
              i === 0 && "border-primary/50 bg-primary/5"
            )}
          >
            {m.displayName}
          </Badge>
          {i < models.length - 1 && (
            <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ModelRow: React.FC<{
  model: ModelRecommendation;
  isSelected: boolean;
  isPrimary: boolean;
  onClick: () => void;
}> = ({ model, isSelected, isPrimary, onClick }) => {
  const zone = detectZone(model.provider);
  const zoneMeta = ZONE_META[zone];

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2.5 rounded-lg border cursor-pointer transition-all group",
        isSelected
          ? "bg-primary/5 border-primary shadow-sm"
          : "bg-card hover:bg-muted/50 border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
          <span className="font-medium text-sm truncate">{model.displayName}</span>
          {isPrimary && (
            <Badge variant="default" className="text-[10px] shrink-0">
              Primary
            </Badge>
          )}
        </div>
        <Badge variant="outline" className={cn("text-[10px] shrink-0", zoneMeta.color)}>
          {zoneMeta.icon} {zone !== 'fallback' ? zone.charAt(0).toUpperCase() + zone.slice(1) : 'Fallback'}
        </Badge>
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {model.score.toFixed(0)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatLatency(model.estimatedLatency)}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {formatCost(model.estimatedCost)}
        </span>
      </div>

      {/* Strengths */}
      {model.strengths.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {model.strengths.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const RoutingDecisionCard: React.FC<RoutingDecisionCardProps> = ({
  decision,
  selectedModel: controlledSelected,
  onModelSelect,
  onOptimizationSelect,
  taskType = 'llm',
  zone: zoneOverride,
  showFallbackChain = true,
  compact = false,
  className,
}) => {
  // Derive zone from primary recommendation
  const activeZone = useMemo(() => {
    if (zoneOverride) {
      if (zoneOverride.includes('western') || zoneOverride.includes('europe') || zoneOverride.includes('latam')) return 'claude';
      if (zoneOverride.includes('cjk') || zoneOverride.includes('mena')) return 'alibaba';
      if (zoneOverride.includes('india') || zoneOverride.includes('sea') || zoneOverride.includes('africa')) return 'gemini';
      return 'fallback';
    }
    if (!decision) return 'fallback';
    return detectZone(decision.primaryRecommendation.provider);
  }, [decision, zoneOverride]);

  const zoneMeta = ZONE_META[activeZone];
  const selected = controlledSelected ?? decision?.primaryRecommendation ?? null;

  // Build full model list: primary + alternatives
  const allModels = useMemo(() => {
    if (!decision) return [];
    return [decision.primaryRecommendation, ...decision.alternativeRecommendations];
  }, [decision]);

  // ---- EMPTY STATE ----
  if (!decision) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="py-8 text-center">
          <Cpu className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Enter a query to see routing intelligence</p>
        </CardContent>
      </Card>
    );
  }

  const classification = decision.classification;

  return (
    <Card className={cn("w-full", className)}>
      {/* ---- HEADER ---- */}
      <CardHeader className={cn("pb-3", compact && "py-2.5 px-3")}>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className={cn("flex items-center gap-2", compact ? "text-sm" : "text-base")}>
            {TASK_TYPE_ICONS[taskType] || <Brain className="h-4 w-4" />}
            Routing Decision
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px]", zoneMeta.color)}>
              {zoneMeta.icon} {zoneMeta.label}
            </Badge>
            <Badge variant="secondary" className="text-[9px]">
              <Lock className="h-2.5 w-2.5 mr-0.5" />
              Locked
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-3", compact && "px-3 pb-3")}>
        {/* ---- CLASSIFICATION SUMMARY ---- */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[11px] gap-1">
            <Target className="h-3 w-3" />
            {classification.intent.replace(/_/g, ' ')}
          </Badge>
          <Badge variant="outline" className="text-[11px] capitalize">
            {classification.complexity}
          </Badge>
          <Badge variant="outline" className="text-[11px]">
            ~{classification.estimatedTokens.toLocaleString()} tokens
          </Badge>
          {classification.requiresVision && (
            <Badge variant="secondary" className="text-[10px]">👁 Vision</Badge>
          )}
          {classification.requiresReasoning && (
            <Badge variant="secondary" className="text-[10px]">🧠 Reasoning</Badge>
          )}
        </div>

        {/* Confidence bar */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Confidence</span>
          <Progress value={classification.confidence * 100} className="flex-1 h-1.5" />
          <span className="font-medium">{Math.round(classification.confidence * 100)}%</span>
        </div>

        <Separator />

        {/* ---- OPTIMIZATION PRESETS ---- */}
        <div className="flex gap-2">
          <OptimizationButton
            type="cost"
            isActive={selected?.modelId === decision.costOptimizedOption?.modelId}
            model={decision.costOptimizedOption}
            onClick={() => onOptimizationSelect?.('cost')}
          />
          <OptimizationButton
            type="quality"
            isActive={selected?.modelId === decision.qualityOptimizedOption?.modelId}
            model={decision.qualityOptimizedOption}
            onClick={() => onOptimizationSelect?.('quality')}
          />
          <OptimizationButton
            type="speed"
            isActive={selected?.modelId === decision.speedOptimizedOption?.modelId}
            model={decision.speedOptimizedOption}
            onClick={() => onOptimizationSelect?.('speed')}
          />
        </div>

        <Separator />

        {/* ---- MODEL LIST ---- */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Ranked Models
          </h4>
          <div className="space-y-1.5">
            {allModels.slice(0, compact ? 2 : 4).map((model, idx) => (
              <ModelRow
                key={model.modelId}
                model={model}
                isSelected={selected?.modelId === model.modelId}
                isPrimary={idx === 0}
                onClick={() => onModelSelect?.(model)}
              />
            ))}
          </div>
        </div>

        {/* ---- FALLBACK CHAIN ---- */}
        {showFallbackChain && allModels.length > 1 && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Fallback Chain
              </h4>
              <FallbackChain models={allModels.slice(0, 4)} />
            </div>
          </>
        )}

        {/* ---- ROUTING REASONING ---- */}
        {classification.reasoning.length > 0 && !compact && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Why This Route
              </h4>
              <ul className="text-[11px] text-muted-foreground space-y-0.5">
                {classification.reasoning.slice(0, 3).map((reason, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary/60 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* ---- ZONE COVERAGE FOOTER ---- */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Frozen routing • {zoneMeta.regions} • 30+ models</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoutingDecisionCard;
