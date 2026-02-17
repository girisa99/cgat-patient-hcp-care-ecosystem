/**
 * ContextualAISelector Component
 * 
 * Compact AI provider selector that shows only relevant providers
 * based on the current Genie product and task scenario.
 * 
 * Use in: Genie Deck, Spark, Mind, Vibe, Arc, Ask Genie
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Sparkles, Zap, Shield, Brain, Mic, Languages, Image, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  useContextualAIProviders,
  type GenieProduct, 
  type TaskScenario,
  type ProviderRecommendation 
} from '@/hooks/useContextualAIProviders';
import type { AIProviderKey } from '@/services/ai-hub/providerRegistry';

// ============================================
// TYPES
// ============================================

interface ContextualAISelectorProps {
  product: GenieProduct;
  scenario?: TaskScenario;
  selectedProvider?: AIProviderKey | null;
  onProviderSelect?: (provider: AIProviderKey) => void;
  showScores?: boolean;
  compact?: boolean;
  className?: string;
}

// Scenario icons
const SCENARIO_ICONS: Record<TaskScenario, React.ElementType> = {
  'chat': Brain,
  'script-gen': FileText,
  'translate': Languages,
  'tts': Mic,
  'stt': Mic,
  'vision': Image,
  'image-gen': Image,
  'video-gen': Video,
  'audio-gen': Mic,
  'nlp': Brain,
  'code-gen': FileText,
  'reasoning': Sparkles,
};

// Provider colors
const PROVIDER_COLORS: Record<string, string> = {
  openai: 'text-emerald-500',
  claude: 'text-amber-500',
  gemini: 'text-blue-500',
  deepseek: 'text-purple-500',
  deepl: 'text-sky-500',
  elevenlabs: 'text-pink-500',
  google: 'text-red-500',
  replicate: 'text-orange-500',
  huggingface: 'text-yellow-500',
  alibaba: 'text-orange-400',
  azure: 'text-blue-600',
  aws: 'text-orange-600',
  stability: 'text-violet-500',
};

// ============================================
// COMPONENT
// ============================================

export function ContextualAISelector({
  product,
  scenario,
  selectedProvider,
  onProviderSelect,
  showScores = true,
  compact = false,
  className,
}: ContextualAISelectorProps) {
  const {
    recommendations,
    primaryProvider,
    scenarioName,
    productName,
    requiredCapabilities,
  } = useContextualAIProviders(product, scenario);

  // Filter to only configured providers
  const configuredProviders = useMemo(() => 
    recommendations.filter(r => r.isConfigured),
    [recommendations]
  );

  const currentProvider = selectedProvider || primaryProvider;
  const currentRec = recommendations.find(r => r.providerId === currentProvider);

  const ScenarioIcon = scenario ? SCENARIO_ICONS[scenario] : Sparkles;

  if (compact) {
    return (
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn("gap-1.5", className)}
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className={cn("font-medium", currentProvider && PROVIDER_COLORS[currentProvider])}>
                    {currentRec?.name || 'Auto'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">AI Provider for {scenarioName}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <ScenarioIcon className="h-4 w-4 text-primary" />
              {scenarioName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {configuredProviders.map((rec) => (
              <DropdownMenuItem
                key={rec.providerId}
                onClick={() => onProviderSelect?.(rec.providerId)}
                className="flex items-center justify-between"
              >
                <span className={cn("font-medium", PROVIDER_COLORS[rec.providerId])}>
                  {rec.name}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {rec.confidence}%
                  </Badge>
                  {currentProvider === rec.providerId && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            {configuredProviders.length === 0 && (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground text-sm">No providers configured</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScenarioIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{scenarioName}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {productName}
        </Badge>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-2">
        {configuredProviders.slice(0, 4).map((rec, idx) => (
          <motion.div
            key={rec.providerId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <button
              onClick={() => onProviderSelect?.(rec.providerId)}
              className={cn(
                "w-full p-3 rounded-lg border transition-all text-left",
                "hover:border-primary/50 hover:bg-primary/5",
                currentProvider === rec.providerId 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn("font-semibold text-sm", PROVIDER_COLORS[rec.providerId])}>
                    {rec.name}
                  </span>
                  {idx === 0 && (
                    <Badge className="text-[9px] px-1 py-0 bg-primary/20 text-primary border-0">
                      Recommended
                    </Badge>
                  )}
                </div>
                {currentProvider === rec.providerId && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              
              {showScores && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Quality</span>
                    <Progress value={rec.qualityScore} className="h-1 mt-1" />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Speed</span>
                    <Progress value={rec.speedScore} className="h-1 mt-1" />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cost</span>
                    <Progress value={rec.costScore} className="h-1 mt-1" />
                  </div>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground mt-2 line-clamp-1">
                {rec.reason}
              </p>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Unconfigured providers hint */}
      {recommendations.filter(r => !r.isConfigured).length > 0 && (
        <p className="text-[10px] text-muted-foreground text-center">
          + {recommendations.filter(r => !r.isConfigured).length} more providers available with API keys
        </p>
      )}
    </div>
  );
}

export default ContextualAISelector;
