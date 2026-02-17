/**
 * Token Estimate Panel
 * 
 * Pre-generation cost breakdown with tier multipliers
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Coins, 
  FileText, 
  Image, 
  Video, 
  Mic, 
  Music, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { GlobalTier, TIER_CONFIGS } from '@/services/shared/globalTierService';
import { cn } from '@/lib/utils';

interface TokenEstimatePanelProps {
  // Content metrics
  slideCount: number;
  wordCount: number;
  imageCount: number;
  videoEnabled: boolean;
  videoDurationSeconds: number;
  voiceEnabled: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  languageCount: number;
  
  // Tier and credits
  tier: GlobalTier;
  availableCredits: number;
  
  // Optional
  className?: string;
  compact?: boolean;
}

interface CostLineItem {
  id: string;
  label: string;
  icon: React.ElementType;
  baseCredits: number;
  quantity: number;
  tierMultiplier: number;
  totalCredits: number;
}

export const TokenEstimatePanel: React.FC<TokenEstimatePanelProps> = ({
  slideCount,
  wordCount,
  imageCount,
  videoEnabled,
  videoDurationSeconds,
  voiceEnabled,
  musicEnabled,
  sfxEnabled,
  languageCount,
  tier,
  availableCredits,
  className,
  compact = false,
}) => {
  // Calculate tier multiplier
  const tierConfig = TIER_CONFIGS[tier];
  const tierMultiplier = tierConfig.costMultiplier;

  // Calculate cost breakdown - CORRECTED REALISTIC COSTS
  // Based on actual provider pricing: TTS ~1 credit/500 chars, Video assembly ~2 credits/min
  const costBreakdown = useMemo((): CostLineItem[] => {
    const items: CostLineItem[] = [];

    // Text generation (per 1000 words) - LLM transcreation
    // Realistic: ~0.5 credits per 500 words
    if (wordCount > 0) {
      const textUnits = Math.ceil(wordCount / 1000);
      items.push({
        id: 'text',
        label: 'Script Generation',
        icon: FileText,
        baseCredits: 1,
        quantity: textUnits,
        tierMultiplier,
        totalCredits: Math.ceil(1 * textUnits * tierMultiplier),
      });
    }

    // Image generation (per image) - Only for AI-generated images
    // Note: Screenshots from storage are FREE
    if (imageCount > 0) {
      items.push({
        id: 'images',
        label: 'AI Image Generation',
        icon: Image,
        baseCredits: 2,
        quantity: imageCount,
        tierMultiplier,
        totalCredits: Math.ceil(2 * imageCount * tierMultiplier),
      });
    }

    // Video ASSEMBLY (not generation) - per minute, not per 10 seconds
    // JSON2Video is ~2 credits per minute of assembled video
    if (videoEnabled && videoDurationSeconds > 0) {
      const videoMinutes = Math.ceil(videoDurationSeconds / 60);
      items.push({
        id: 'video',
        label: 'Video Assembly',
        icon: Video,
        baseCredits: 2, // 2 credits per minute (not 15 per 10 seconds!)
        quantity: videoMinutes,
        tierMultiplier,
        totalCredits: Math.ceil(2 * videoMinutes * tierMultiplier),
      });
    }

    // Voice/TTS generation - per 500 characters, estimated from word count
    // ~1 credit per 500 chars = ~1 credit per 100 words
    if (voiceEnabled && wordCount > 0) {
      const ttsUnits = Math.ceil(wordCount / 100); // ~5 chars per word avg
      const langMultiplier = languageCount > 1 ? languageCount : 1;
      items.push({
        id: 'voice',
        label: languageCount > 1 ? `TTS (${languageCount} languages)` : 'TTS Voice Generation',
        icon: Mic,
        baseCredits: 1,
        quantity: ttsUnits * langMultiplier,
        tierMultiplier,
        totalCredits: Math.ceil(1 * ttsUnits * langMultiplier * tierMultiplier),
      });
    }

    // Music generation (one-time)
    if (musicEnabled) {
      items.push({
        id: 'music',
        label: 'Background Music',
        icon: Music,
        baseCredits: 5,
        quantity: 1,
        tierMultiplier,
        totalCredits: Math.ceil(5 * tierMultiplier),
      });
    }

    // SFX generation - minimal cost
    if (sfxEnabled && slideCount > 0) {
      items.push({
        id: 'sfx',
        label: 'Sound Effects',
        icon: Sparkles,
        baseCredits: 1,
        quantity: Math.ceil(slideCount / 3), // SFX per 3 slides
        tierMultiplier,
        totalCredits: Math.ceil(1 * Math.ceil(slideCount / 3) * tierMultiplier),
      });
    }

    return items;
  }, [wordCount, imageCount, videoEnabled, videoDurationSeconds, voiceEnabled, musicEnabled, sfxEnabled, slideCount, languageCount, tierMultiplier]);

  // Calculate totals
  const totalCredits = useMemo(() => {
    return costBreakdown.reduce((sum, item) => sum + item.totalCredits, 0);
  }, [costBreakdown]);

  const canAfford = availableCredits >= totalCredits;
  const creditUsagePercent = Math.min((totalCredits / availableCredits) * 100, 100);

  // Tier badge color
  const tierBadgeClass = {
    standard: 'bg-slate-100 text-slate-700',
    advanced: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
  }[tier];

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-muted/50', className)}>
        <Coins className="h-5 w-5 text-amber-500" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estimated Cost</span>
            <span className={cn('font-bold', canAfford ? 'text-green-600' : 'text-red-600')}>
              {totalCredits} credits
            </span>
          </div>
          <Progress value={creditUsagePercent} className="h-1.5 mt-1" />
        </div>
        {canAfford ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
    );
  }

  return (
    <Card className={cn('border-dashed', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Coins className="h-5 w-5 text-amber-500" />
            Credit Estimate
          </CardTitle>
          <Badge className={tierBadgeClass}>
            {tierConfig.label}
            <span className="ml-1 opacity-70">({tierMultiplier}x)</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost breakdown */}
        <div className="space-y-2">
          {costBreakdown.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.quantity > 1 && (
                  <span className="text-xs opacity-70">×{item.quantity}</span>
                )}
              </div>
              <span className="font-medium">{item.totalCredits}</span>
            </div>
          ))}
        </div>

        {costBreakdown.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Info className="h-4 w-4" />
            <span>Configure your presentation to see cost estimate</span>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Total Estimated</span>
          <span className={cn('text-lg font-bold', canAfford ? 'text-green-600' : 'text-red-600')}>
            {totalCredits} credits
          </span>
        </div>

        {/* Credit balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available Balance</span>
            <span className="font-medium">{availableCredits} credits</span>
          </div>
          <Progress 
            value={creditUsagePercent} 
            className={cn('h-2', !canAfford && 'bg-red-100 [&>div]:bg-red-500')}
          />
          {!canAfford && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Insufficient credits. Need {totalCredits - availableCredits} more.
            </p>
          )}
        </div>

        {/* Tier info */}
        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
          <p>
            <strong>{tierConfig.label}</strong>: {tierConfig.description}
          </p>
          <p className="mt-1">
            Quality: {tierConfig.qualityScore}% | Speed: {tierConfig.speedScore}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenEstimatePanel;
