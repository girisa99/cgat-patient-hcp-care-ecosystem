/**
 * MIX AND MATCH SELECTOR
 * Hybrid UI: Toggle checkboxes + Visual recipe cards
 * Tier-gated with teaser previews for free/starter
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Box, 
  Wand2, 
  Mic, 
  Video, 
  Sparkles,
  Lock,
  Crown,
  Zap,
  Calculator,
  ChevronRight,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  TIER_FEATURE_CONFIG, 
  isFeatureAvailable, 
  getFeatureLimit,
  getUpgradeMessage,
  type TierFeatures 
} from '@/config/tierFeatureGating';
import type { SubscriptionTier } from '@/config/genieStudioNavItems';

interface MixAndMatchSelection {
  avatar: boolean;
  threeD: boolean;
  animation: boolean;
  lipsync: boolean;
  dubbing: boolean;
  voiceCloning: boolean;
  music: boolean;
}

interface CreditEstimate {
  base: number;
  avatar: number;
  threeD: number;
  animation: number;
  lipsync: number;
  dubbing: number;
  voiceCloning: number;
  music: number;
  total: number;
}

interface MixAndMatchSelectorProps {
  userTier: SubscriptionTier;
  onSelectionChange?: (selection: MixAndMatchSelection) => void;
  onEstimateChange?: (estimate: CreditEstimate) => void;
  showCostCalculator?: boolean;
  className?: string;
}

// Pre-defined recipe cards for common combinations
const RECIPE_CARDS = [
  {
    id: 'ppt-avatar',
    name: 'PPT + Avatar',
    description: 'Presentation with AI presenter',
    features: ['avatar'],
    icon: User,
    color: 'from-purple-500 to-pink-500',
    credits: 25,
    popular: true,
  },
  {
    id: 'video-3d',
    name: 'Video + 3D',
    description: 'Video with 3D product showcase',
    features: ['threeD'],
    icon: Box,
    color: 'from-blue-500 to-cyan-500',
    credits: 30,
  },
  {
    id: 'full-production',
    name: 'Full Production',
    description: 'Avatar + 3D + Animation + Voice',
    features: ['avatar', 'threeD', 'animation', 'voiceCloning'],
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    credits: 75,
    premium: true,
  },
  {
    id: 'global-dub',
    name: 'Global Dubbing',
    description: 'Video with lip-sync dubbing',
    features: ['lipsync', 'dubbing'],
    icon: Mic,
    color: 'from-green-500 to-emerald-500',
    credits: 40,
    minTier: 'creator' as SubscriptionTier,
  },
  {
    id: 'animated-explainer',
    name: 'Animated Explainer',
    description: 'Animation + Music + Voice',
    features: ['animation', 'music', 'voiceCloning'],
    icon: Wand2,
    color: 'from-rose-500 to-pink-500',
    credits: 45,
  },
];

// Credit costs per feature
const FEATURE_CREDITS = {
  avatar: 15,
  threeD: 20,
  animation: 10,
  lipsync: 25,
  dubbing: 20,
  voiceCloning: 10,
  music: 5,
};

export const MixAndMatchSelector: React.FC<MixAndMatchSelectorProps> = ({
  userTier,
  onSelectionChange,
  onEstimateChange,
  showCostCalculator = true,
  className,
}) => {
  const [selection, setSelection] = useState<MixAndMatchSelection>({
    avatar: false,
    threeD: false,
    animation: false,
    lipsync: false,
    dubbing: false,
    voiceCloning: false,
    music: false,
  });

  const tierConfig = TIER_FEATURE_CONFIG[userTier];

  // Calculate credit estimate
  const creditEstimate = useMemo((): CreditEstimate => {
    const estimate: CreditEstimate = {
      base: 10,
      avatar: selection.avatar ? FEATURE_CREDITS.avatar : 0,
      threeD: selection.threeD ? FEATURE_CREDITS.threeD : 0,
      animation: selection.animation ? FEATURE_CREDITS.animation : 0,
      lipsync: selection.lipsync ? FEATURE_CREDITS.lipsync : 0,
      dubbing: selection.dubbing ? FEATURE_CREDITS.dubbing : 0,
      voiceCloning: selection.voiceCloning ? FEATURE_CREDITS.voiceCloning : 0,
      music: selection.music ? FEATURE_CREDITS.music : 0,
      total: 0,
    };
    
    estimate.total = Object.values(estimate).reduce((sum, val) => sum + val, 0);
    return estimate;
  }, [selection]);

  // Notify parent of changes
  React.useEffect(() => {
    onSelectionChange?.(selection);
    onEstimateChange?.(creditEstimate);
  }, [selection, creditEstimate, onSelectionChange, onEstimateChange]);

  const handleToggle = (feature: keyof MixAndMatchSelection) => {
    const featureKey = feature as keyof TierFeatures;
    
    // Check if feature is available for this tier
    if (!isFeatureAvailable(featureKey, userTier) && !selection[feature]) {
      // Feature locked - don't toggle, could show upgrade modal
      return;
    }
    
    setSelection(prev => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const applyRecipe = (recipe: typeof RECIPE_CARDS[0]) => {
    const newSelection: MixAndMatchSelection = {
      avatar: false,
      threeD: false,
      animation: false,
      lipsync: false,
      dubbing: false,
      voiceCloning: false,
      music: false,
    };
    
    recipe.features.forEach(feature => {
      if (feature in newSelection) {
        newSelection[feature as keyof MixAndMatchSelection] = true;
      }
    });
    
    setSelection(newSelection);
  };

  const selectedCount = Object.values(selection).filter(Boolean).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Recipe Cards - Visual Quick Select */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Quick Recipes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {RECIPE_CARDS.map((recipe) => {
            const isLocked = recipe.minTier && 
              ['free', 'starter'].includes(userTier) && 
              !['free', 'starter'].includes(recipe.minTier);
            
            return (
              <Card 
                key={recipe.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
                  isLocked && "opacity-60",
                  recipe.popular && "ring-2 ring-amber-500/50"
                )}
                onClick={() => !isLocked && applyRecipe(recipe)}
              >
                <CardContent className="p-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2",
                    recipe.color
                  )}>
                    <recipe.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-sm">{recipe.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{recipe.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {recipe.credits} credits
                    </Badge>
                    {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                    {recipe.popular && <Badge className="text-xs bg-amber-500">Popular</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Toggle Checkboxes - Custom Selection */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-purple-500" />
          Custom Mix
          {selectedCount > 0 && (
            <Badge variant="secondary" className="ml-2">{selectedCount} selected</Badge>
          )}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'avatar', label: 'AI Avatar', icon: User, tier: 'avatar' as keyof TierFeatures },
            { key: 'threeD', label: '3D Objects', icon: Box, tier: 'threeD' as keyof TierFeatures },
            { key: 'animation', label: 'Animation', icon: Wand2, tier: 'animation' as keyof TierFeatures },
            { key: 'music', label: 'AI Music', icon: Sparkles, tier: 'musicGeneration' as keyof TierFeatures },
            { key: 'lipsync', label: 'Lip-Sync', icon: Video, tier: 'lipsync' as keyof TierFeatures },
            { key: 'dubbing', label: 'Dubbing', icon: Mic, tier: 'dubbing' as keyof TierFeatures },
            { key: 'voiceCloning', label: 'Voice Clone', icon: Mic, tier: 'voiceCloning' as keyof TierFeatures },
          ].map((feature) => {
            const isAvailable = isFeatureAvailable(feature.tier, userTier);
            const limit = getFeatureLimit(feature.tier, userTier);
            const upgradeMsg = getUpgradeMessage(feature.tier, userTier);
            const isTeaser = !isAvailable || (limit === 1 && userTier === 'free');
            
            return (
              <div 
                key={feature.key}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  selection[feature.key as keyof MixAndMatchSelection] 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-muted/30 border-border/50",
                  !isAvailable && "opacity-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <feature.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{feature.label}</span>
                  {isTeaser && (
                    <Badge variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isAvailable ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Switch
                      checked={selection[feature.key as keyof MixAndMatchSelection]}
                      onCheckedChange={() => handleToggle(feature.key as keyof MixAndMatchSelection)}
                      disabled={!isAvailable}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Calculator - Inline + Summary */}
      {showCostCalculator && selectedCount > 0 && (
        <>
          <Separator />
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Credit Estimate
              </CardTitle>
              <CardDescription className="text-xs">
                Estimated cost before generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Inline breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base:</span>
                  <span>{creditEstimate.base}</span>
                </div>
                {selection.avatar && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avatar:</span>
                    <span>+{creditEstimate.avatar}</span>
                  </div>
                )}
                {selection.threeD && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">3D:</span>
                    <span>+{creditEstimate.threeD}</span>
                  </div>
                )}
                {selection.animation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Animation:</span>
                    <span>+{creditEstimate.animation}</span>
                  </div>
                )}
                {selection.lipsync && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lip-Sync:</span>
                    <span>+{creditEstimate.lipsync}</span>
                  </div>
                )}
                {selection.dubbing && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dubbing:</span>
                    <span>+{creditEstimate.dubbing}</span>
                  </div>
                )}
                {selection.music && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Music:</span>
                    <span>+{creditEstimate.music}</span>
                  </div>
                )}
              </div>
              
              {/* Summary total */}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Total Estimated:</span>
                  <p className="text-xs text-muted-foreground">
                    {tierConfig.monthlyCredits === -1 ? 'Unlimited' : `${tierConfig.monthlyCredits} credits remaining`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{creditEstimate.total}</span>
                  <span className="text-sm text-muted-foreground ml-1">credits</span>
                </div>
              </div>
              
              <Button className="w-full mt-2" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Proceed to Generate
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Upgrade prompt for free/starter */}
      {['free', 'starter'].includes(userTier) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-sm">Unlock All Combinations</p>
                <p className="text-xs text-muted-foreground">
                  Get full access to Avatar, 3D, Lip-Sync & more
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-600">
              Upgrade to Creator
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MixAndMatchSelector;
