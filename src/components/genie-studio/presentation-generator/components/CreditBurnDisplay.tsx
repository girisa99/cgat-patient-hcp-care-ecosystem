/**
 * Credit Burn Display - Shows real-time credit usage during generation
 * Displays balance, estimated burn, and burn rate by output type
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Coins,
  Zap,
  TrendingDown,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Credit multipliers by output type
export const CREDIT_MULTIPLIERS: Record<string, { multiplier: number; label: string; description: string }> = {
  '2d-static': { multiplier: 1, label: '1x', description: 'Standard 2D slides' },
  '2d-animated': { multiplier: 1.5, label: '1.5x', description: 'Animated slide transitions' },
  '3d-scene': { multiplier: 3, label: '3x', description: '3D scene rendering' },
  '3d-animated': { multiplier: 3.5, label: '3.5x', description: 'Animated 3D scenes' },
  'video-intro': { multiplier: 2.5, label: '2.5x', description: 'Video intro generation' },
  'video-full': { multiplier: 4, label: '4x', description: 'Full video production' },
  'interactive': { multiplier: 2, label: '2x', description: 'Interactive elements' },
  'mixed': { multiplier: 2.5, label: '2.5x', description: 'Mixed media output' },
};

// Base credit cost per slide
const BASE_CREDITS_PER_SLIDE = 5;

// Additional costs
const VOICEOVER_CREDITS_PER_SLIDE = 2;
const MUSIC_CREDITS = 10;
const HIGH_RES_MULTIPLIER = 1.5; // 4K
const TRANSLATION_CREDITS_PER_LANG = 3;

interface CreditBurnDisplayProps {
  currentBalance: number;
  outputType: string;
  slideCount: number;
  includeVoiceover?: boolean;
  includeMusic?: boolean;
  resolution?: '720p' | '1080p' | '4k';
  languageCount?: number;
  isGenerating?: boolean;
  creditsUsed?: number;
  className?: string;
}

export function CreditBurnDisplay({
  currentBalance,
  outputType,
  slideCount,
  includeVoiceover = false,
  includeMusic = false,
  resolution = '1080p',
  languageCount = 1,
  isGenerating = false,
  creditsUsed = 0,
  className,
}: CreditBurnDisplayProps) {
  // Calculate estimated credits
  const multiplierInfo = CREDIT_MULTIPLIERS[outputType] || CREDIT_MULTIPLIERS['2d-static'];
  const baseCredits = slideCount * BASE_CREDITS_PER_SLIDE * multiplierInfo.multiplier;
  
  const voiceoverCredits = includeVoiceover ? slideCount * VOICEOVER_CREDITS_PER_SLIDE : 0;
  const musicCredits = includeMusic ? MUSIC_CREDITS : 0;
  const resolutionMultiplier = resolution === '4k' ? HIGH_RES_MULTIPLIER : 1;
  const translationCredits = (languageCount - 1) * TRANSLATION_CREDITS_PER_LANG * slideCount;
  
  const totalEstimated = Math.ceil(
    (baseCredits + voiceoverCredits + musicCredits + translationCredits) * resolutionMultiplier
  );
  
  const remainingAfter = currentBalance - totalEstimated;
  const hasEnoughCredits = remainingAfter >= 0;
  const usagePercentage = Math.min((totalEstimated / currentBalance) * 100, 100);
  
  // Burn progress during generation
  const burnProgress = isGenerating ? (creditsUsed / totalEstimated) * 100 : 0;

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span className="font-medium">Credit Usage</span>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              multiplierInfo.multiplier > 2 
                ? "border-warning text-warning" 
                : "border-primary text-primary"
            )}
          >
            {multiplierInfo.label} burn rate
          </Badge>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-foreground">{currentBalance}</div>
            <div className="text-[10px] text-muted-foreground">Current Balance</div>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <div className={cn(
              "text-lg font-bold",
              hasEnoughCredits ? "text-primary" : "text-destructive"
            )}>
              {totalEstimated}
            </div>
            <div className="text-[10px] text-muted-foreground">Estimated Cost</div>
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            hasEnoughCredits ? "bg-success/10" : "bg-destructive/10"
          )}>
            <div className={cn(
              "text-lg font-bold",
              hasEnoughCredits ? "text-success" : "text-destructive"
            )}>
              {remainingAfter}
            </div>
            <div className="text-[10px] text-muted-foreground">After Generation</div>
          </div>
        </div>

        {/* Burn Progress (during generation) */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary animate-pulse" />
                Burning credits...
              </span>
              <span className="font-medium">{creditsUsed} / {totalEstimated}</span>
            </div>
            <Progress value={burnProgress} className="h-2" />
          </div>
        )}

        {/* Cost Breakdown */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                <Info className="h-3 w-3" />
                Cost breakdown
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[280px] p-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Base ({slideCount} slides × {multiplierInfo.label})</span>
                  <span className="font-medium">{Math.ceil(baseCredits)} credits</span>
                </div>
                {voiceoverCredits > 0 && (
                  <div className="flex justify-between">
                    <span>Voiceover ({slideCount} slides)</span>
                    <span className="font-medium">{voiceoverCredits} credits</span>
                  </div>
                )}
                {musicCredits > 0 && (
                  <div className="flex justify-between">
                    <span>Background Music</span>
                    <span className="font-medium">{musicCredits} credits</span>
                  </div>
                )}
                {translationCredits > 0 && (
                  <div className="flex justify-between">
                    <span>Translations ({languageCount - 1} languages)</span>
                    <span className="font-medium">{translationCredits} credits</span>
                  </div>
                )}
                {resolution === '4k' && (
                  <div className="flex justify-between text-warning">
                    <span>4K Resolution (+50%)</span>
                    <span className="font-medium">×1.5</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{totalEstimated} credits</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Warning if not enough credits */}
        {!hasEnoughCredits && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg text-xs text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Insufficient credits. Please purchase more or reduce output complexity.</span>
          </div>
        )}

        {/* Output Type Description */}
        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {multiplierInfo.description}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to calculate credits
export function calculateCredits(config: {
  outputType: string;
  slideCount: number;
  includeVoiceover?: boolean;
  includeMusic?: boolean;
  resolution?: '720p' | '1080p' | '4k';
  languageCount?: number;
}): number {
  const multiplierInfo = CREDIT_MULTIPLIERS[config.outputType] || CREDIT_MULTIPLIERS['2d-static'];
  const baseCredits = config.slideCount * BASE_CREDITS_PER_SLIDE * multiplierInfo.multiplier;
  
  const voiceoverCredits = config.includeVoiceover ? config.slideCount * VOICEOVER_CREDITS_PER_SLIDE : 0;
  const musicCredits = config.includeMusic ? MUSIC_CREDITS : 0;
  const resolutionMultiplier = config.resolution === '4k' ? HIGH_RES_MULTIPLIER : 1;
  const translationCredits = ((config.languageCount || 1) - 1) * TRANSLATION_CREDITS_PER_LANG * config.slideCount;
  
  return Math.ceil(
    (baseCredits + voiceoverCredits + musicCredits + translationCredits) * resolutionMultiplier
  );
}

export default CreditBurnDisplay;
