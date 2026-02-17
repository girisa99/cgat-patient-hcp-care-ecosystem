/**
 * TOKEN CONSUMPTION BREAKDOWN PANEL
 * 
 * Shows estimated token/credit consumption by component and AI provider
 * for Genie Cast Full Production Mode video generation.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  Video,
  Mic,
  User,
  Box,
  Sparkles,
  Languages,
  ChevronRight,
  Info,
  TrendingUp,
  Zap,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ProductionModeConfig } from './FullProductionModeConfig';

// Provider credit costs (per unit)
export const PROVIDER_COSTS = {
  // TTS Providers (per 1000 characters)
  tts: {
    elevenlabs: { name: 'ElevenLabs', cost: 0.30, unit: '1K chars', icon: '🎙️' },
    azure: { name: 'Azure Neural', cost: 0.016, unit: '1K chars', icon: '☁️' },
    alibaba: { name: 'Alibaba Qwen3-TTS', cost: 0.008, unit: '1K chars', icon: '🔊' },
    google: { name: 'Google TTS', cost: 0.016, unit: '1K chars', icon: '🔈' },
  },
  // Video Providers (per minute)
  video: {
    'vertex-ai': { name: 'Vertex AI Veo', cost: 0.35, unit: 'min', icon: '🎬', model: 'Veo 2.0' },
    'alibaba-wan': { name: 'Alibaba WAN', cost: 0.15, unit: 'min', icon: '📹', model: 'Wan 2.6' },
    'modelslab': { name: 'ModelsLab', cost: 0.10, unit: 'min', icon: '🎞️', model: 'AnimateDiff' },
    'sora2api': { name: 'Sora 2 API', cost: 0.50, unit: 'min', icon: '✨', model: 'Sora-2' },
    'replicate': { name: 'Replicate SVD', cost: 0.08, unit: 'min', icon: '🔄', model: 'SVD-XT' },
  },
  // Avatar Providers (per segment)
  avatar: {
    'alibaba-wan22': { name: 'Alibaba Wan2.2', cost: 0.25, unit: 'segment', icon: '👤', model: 'S2V Lip-sync' },
    'heygen': { name: 'HeyGen', cost: 0.45, unit: 'segment', icon: '🎭', model: 'Avatar API' },
  },
  // 3D Providers (per asset)
  threeD: {
    'meshy': { name: 'Meshy AI', cost: 0.15, unit: 'asset', icon: '📦', model: 'Text-to-3D' },
    'modelslab-3d': { name: 'ModelsLab 3D', cost: 0.12, unit: 'asset', icon: '🎲', model: 'Mesh Gen' },
  },
  // Animation/Transition Providers (per effect)
  animation: {
    'modelslab': { name: 'ModelsLab', cost: 0.05, unit: 'effect', icon: '✨', model: 'Motion FX' },
    'css-framer': { name: 'CSS/Framer', cost: 0.00, unit: 'effect', icon: '🎨', model: 'Built-in' },
  },
  // Translation Providers (per 1000 chars)
  translation: {
    'deepl': { name: 'DeepL', cost: 0.025, unit: '1K chars', icon: '🌐' },
    'qwen-mt': { name: 'Qwen-MT', cost: 0.008, unit: '1K chars', icon: '🈳' },
    'google': { name: 'Google Translate', cost: 0.020, unit: '1K chars', icon: '🌍' },
  },
  // LLM Providers (per 1K tokens)
  llm: {
    'claude': { name: 'Claude 3.5', cost: 0.015, unit: '1K tokens', icon: '🧠', model: 'Sonnet' },
    'gpt4o': { name: 'GPT-4o', cost: 0.005, unit: '1K tokens', icon: '💭', model: 'GPT-4o' },
    'gemini': { name: 'Gemini Pro', cost: 0.00125, unit: '1K tokens', icon: '💎', model: 'Gemini 2.0' },
    'qwen': { name: 'Qwen-Max', cost: 0.002, unit: '1K tokens', icon: '🔮', model: 'Qwen-Max' },
  },
} as const;

// Zone-based provider mapping
const ZONE_PROVIDER_MAP: Record<string, {
  tts: keyof typeof PROVIDER_COSTS.tts;
  video: keyof typeof PROVIDER_COSTS.video;
  translation: keyof typeof PROVIDER_COSTS.translation;
  llm: keyof typeof PROVIDER_COSTS.llm;
  zone: string;
}> = {
  'en': { tts: 'elevenlabs', video: 'vertex-ai', translation: 'deepl', llm: 'claude', zone: 'Claude Zone' },
  'es': { tts: 'elevenlabs', video: 'vertex-ai', translation: 'deepl', llm: 'claude', zone: 'Claude Zone' },
  'fr': { tts: 'elevenlabs', video: 'vertex-ai', translation: 'deepl', llm: 'claude', zone: 'Claude Zone' },
  'de': { tts: 'azure', video: 'vertex-ai', translation: 'deepl', llm: 'claude', zone: 'Claude Zone' },
  'pt': { tts: 'azure', video: 'vertex-ai', translation: 'deepl', llm: 'claude', zone: 'Claude Zone' },
  'ar': { tts: 'azure', video: 'modelslab', translation: 'google', llm: 'gpt4o', zone: 'MENA Zone' },
  'hi': { tts: 'azure', video: 'modelslab', translation: 'google', llm: 'gemini', zone: 'Gemini Zone' },
  'bn': { tts: 'azure', video: 'modelslab', translation: 'google', llm: 'gemini', zone: 'Gemini Zone' },
  'te': { tts: 'azure', video: 'modelslab', translation: 'google', llm: 'gemini', zone: 'Gemini Zone' },
  'ta': { tts: 'azure', video: 'modelslab', translation: 'google', llm: 'gemini', zone: 'Gemini Zone' },
  'ur': { tts: 'azure', video: 'modelslab', translation: 'google', llm: 'gemini', zone: 'Gemini Zone' },
  'id': { tts: 'azure', video: 'modelslab', translation: 'google', llm: 'gemini', zone: 'Gemini Zone' },
  'sw': { tts: 'azure', video: 'modelslab', translation: 'google', llm: 'gemini', zone: 'Gemini Zone' },
  'zh': { tts: 'alibaba', video: 'alibaba-wan', translation: 'qwen-mt', llm: 'qwen', zone: 'Alibaba Zone' },
  'ja': { tts: 'alibaba', video: 'alibaba-wan', translation: 'qwen-mt', llm: 'qwen', zone: 'Alibaba Zone' },
  'ko': { tts: 'azure', video: 'modelslab', translation: 'qwen-mt', llm: 'qwen', zone: 'Alibaba Zone' },
};

interface TokenConsumptionBreakdownProps {
  config: ProductionModeConfig;
  selectedLanguage: string;
  isFullProduction: boolean;
  className?: string;
}

interface CostLineItem {
  category: string;
  provider: string;
  model?: string;
  icon: string;
  units: number;
  unitLabel: string;
  costPerUnit: number;
  totalCost: number;
  color: string;
}

export const TokenConsumptionBreakdown: React.FC<TokenConsumptionBreakdownProps> = ({
  config,
  selectedLanguage,
  isFullProduction,
  className,
}) => {
  const zoneConfig = ZONE_PROVIDER_MAP[selectedLanguage] || ZONE_PROVIDER_MAP['en'];

  // Calculate token/credit consumption
  const breakdown = useMemo(() => {
    const items: CostLineItem[] = [];
    const baseChapters = 9;
    const scriptChars = 4500; // ~500 chars per chapter
    const videoDuration = 7; // minutes

    // TTS costs
    const ttsProvider = PROVIDER_COSTS.tts[zoneConfig.tts];
    items.push({
      category: 'Text-to-Speech',
      provider: ttsProvider.name,
      icon: ttsProvider.icon,
      units: Math.ceil(scriptChars / 1000),
      unitLabel: ttsProvider.unit,
      costPerUnit: ttsProvider.cost,
      totalCost: (scriptChars / 1000) * ttsProvider.cost,
      color: 'bg-green-500',
    });

    // Video costs
    const videoProvider = PROVIDER_COSTS.video[zoneConfig.video];
    items.push({
      category: 'Video Generation',
      provider: videoProvider.name,
      model: videoProvider.model,
      icon: videoProvider.icon,
      units: videoDuration,
      unitLabel: videoProvider.unit,
      costPerUnit: videoProvider.cost,
      totalCost: videoDuration * videoProvider.cost,
      color: 'bg-purple-500',
    });

    // Translation costs (if not English)
    if (selectedLanguage !== 'en') {
      const transProvider = PROVIDER_COSTS.translation[zoneConfig.translation];
      items.push({
        category: 'Translation',
        provider: transProvider.name,
        icon: transProvider.icon,
        units: Math.ceil(scriptChars / 1000),
        unitLabel: transProvider.unit,
        costPerUnit: transProvider.cost,
        totalCost: (scriptChars / 1000) * transProvider.cost,
        color: 'bg-blue-500',
      });
    }

    // LLM costs (script enhancement)
    const llmProvider = PROVIDER_COSTS.llm[zoneConfig.llm];
    const llmTokens = 2; // ~2K tokens for script refinement
    items.push({
      category: 'Script Enhancement',
      provider: llmProvider.name,
      model: llmProvider.model,
      icon: llmProvider.icon,
      units: llmTokens,
      unitLabel: llmProvider.unit,
      costPerUnit: llmProvider.cost,
      totalCost: llmTokens * llmProvider.cost,
      color: 'bg-amber-500',
    });

    // Full Production Mode additions
    if (isFullProduction) {
      // Avatar costs
      if (config.enableAvatar) {
        const avatarSegments = 
          config.avatarPlacement === 'throughout' ? baseChapters :
          config.avatarPlacement === 'chapter_intros' ? baseChapters :
          2; // intro_outro only
        
        const avatarProvider = PROVIDER_COSTS.avatar['alibaba-wan22'];
        items.push({
          category: 'AI Avatar',
          provider: avatarProvider.name,
          model: avatarProvider.model,
          icon: avatarProvider.icon,
          units: avatarSegments,
          unitLabel: avatarProvider.unit,
          costPerUnit: avatarProvider.cost,
          totalCost: avatarSegments * avatarProvider.cost,
          color: 'bg-pink-500',
        });
      }

      // 3D costs
      if (config.enable3D) {
        const threeDAssets = 7; // One per product chapter
        const qualityMultiplier = 
          config.renderQuality === 'premium' ? 2 :
          config.renderQuality === 'high' ? 1.5 : 1;
        
        const threeDProvider = PROVIDER_COSTS.threeD['meshy'];
        items.push({
          category: '3D Product Showcase',
          provider: threeDProvider.name,
          model: threeDProvider.model,
          icon: threeDProvider.icon,
          units: threeDAssets,
          unitLabel: threeDProvider.unit,
          costPerUnit: threeDProvider.cost * qualityMultiplier,
          totalCost: threeDAssets * threeDProvider.cost * qualityMultiplier,
          color: 'bg-cyan-500',
        });
      }

      // Animation costs
      if (config.enableAnimations) {
        const isBuiltIn = ['slide', 'glass'].includes(config.transitionStyle);
        const animProvider = isBuiltIn 
          ? PROVIDER_COSTS.animation['css-framer']
          : PROVIDER_COSTS.animation['modelslab'];
        
        items.push({
          category: 'Animated Transitions',
          provider: animProvider.name,
          model: animProvider.model,
          icon: animProvider.icon,
          units: baseChapters - 1, // transitions between chapters
          unitLabel: animProvider.unit,
          costPerUnit: animProvider.cost,
          totalCost: (baseChapters - 1) * animProvider.cost,
          color: 'bg-yellow-500',
        });
      }
    }

    return items;
  }, [config, selectedLanguage, isFullProduction, zoneConfig]);

  const totalCost = breakdown.reduce((sum, item) => sum + item.totalCost, 0);
  const maxItemCost = Math.max(...breakdown.map(item => item.totalCost));

  return (
    <TooltipProvider>
      <Card className={cn("border-dashed", className)}>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              Token & Credit Breakdown
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] gap-1">
                <Globe className="w-3 h-3" />
                {zoneConfig.zone}
              </Badge>
              <Badge variant="default" className="text-xs">
                ~${totalCost.toFixed(2)} est.
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs">
            Estimated costs per AI provider for {selectedLanguage.toUpperCase()} language
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[280px]">
            <div className="space-y-2">
              {breakdown.map((item, idx) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <div className="flex items-center gap-2 py-1.5">
                    {/* Icon */}
                    <span className="text-base w-6 text-center">{item.icon}</span>
                    
                    {/* Category & Provider */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate">{item.category}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">{item.provider}</span>
                        {item.model && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                {item.model}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span className="text-xs">Model: {item.model}</span>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      
                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={cn("h-full rounded-full", item.color)}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.totalCost / maxItemCost) * 100}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Units & Cost */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium">
                        ${item.totalCost.toFixed(3)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.units} × ${item.costPerUnit.toFixed(3)}/{item.unitLabel}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <Separator className="my-3" />

          {/* Summary */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>Actual costs may vary by usage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-base">${totalCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Provider Summary Footer */}
          <div className="mt-3 p-2 bg-muted/50 rounded-lg">
            <div className="text-[10px] text-muted-foreground mb-1.5">Active Providers for {selectedLanguage.toUpperCase()}</div>
            <div className="flex flex-wrap gap-1">
              {breakdown.map(item => (
                <Badge 
                  key={item.category} 
                  variant="outline" 
                  className="text-[9px] gap-1 py-0"
                >
                  {item.icon} {item.provider}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default TokenConsumptionBreakdown;
