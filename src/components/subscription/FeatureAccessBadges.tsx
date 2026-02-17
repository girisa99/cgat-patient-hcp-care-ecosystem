/**
 * FEATURE ACCESS BADGES COMPONENT
 * Shows tier-gated feature availability with visual indicators
 * Connected to tierFeatureGating.ts for centralized access control
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Unlock, 
  Sparkles, 
  Video, 
  Mic, 
  Box, 
  User, 
  Glasses,
  Music,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  TIER_FEATURE_CONFIG, 
  isFeatureAvailable, 
  getFeatureLimit,
  type TierFeatures 
} from '@/config/tierFeatureGating';
import type { SubscriptionTier } from '@/config/genieStudioNavItems';

interface FeatureAccessBadgesProps {
  tier: SubscriptionTier;
  showLimits?: boolean;
  compact?: boolean;
  className?: string;
}

// Feature icons mapping
const FEATURE_ICONS: Record<keyof TierFeatures, React.ComponentType<{ className?: string }>> = {
  avatar: User,
  threeD: Box,
  animation: Sparkles,
  vrAr: Glasses,
  immersive: Glasses,
  lipsync: Video,
  dubbing: Mic,
  musicGeneration: Music,
  voiceCloning: Mic,
  monthlyCredits: Crown,
  maxLanguages: Crown,
  maxCombinations: Crown,
};

// Feature display names
const FEATURE_NAMES: Record<keyof TierFeatures, string> = {
  avatar: 'AI Avatar',
  threeD: '3D Content',
  animation: 'Animation',
  vrAr: 'VR/AR',
  immersive: 'Immersive',
  lipsync: 'Lip-Sync',
  dubbing: 'Dubbing',
  musicGeneration: 'Music Gen',
  voiceCloning: 'Voice Clone',
  monthlyCredits: 'Credits',
  maxLanguages: 'Languages',
  maxCombinations: 'Mix & Match',
};

// Premium features to highlight
const PREMIUM_FEATURES: (keyof TierFeatures)[] = [
  'lipsync',
  'dubbing',
  'avatar',
  'threeD',
  'vrAr',
  'voiceCloning',
  'musicGeneration',
];

export const FeatureAccessBadges: React.FC<FeatureAccessBadgesProps> = ({
  tier,
  showLimits = true,
  compact = false,
  className,
}) => {
  const config = TIER_FEATURE_CONFIG[tier];
  if (!config) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {PREMIUM_FEATURES.map((featureKey) => {
        const featureConfig = config[featureKey];
        if (typeof featureConfig === 'number') return null;
        
        const Icon = FEATURE_ICONS[featureKey];
        const isEnabled = featureConfig?.enabled ?? false;
        const limit = featureConfig?.limit;
        const unit = featureConfig?.unit;
        
        return (
          <Badge
            key={featureKey}
            variant={isEnabled ? 'default' : 'outline'}
            className={cn(
              'text-[10px] py-0.5 gap-1 transition-colors',
              isEnabled 
                ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' 
                : 'text-muted-foreground border-muted opacity-60',
              compact && 'px-1.5'
            )}
          >
            {isEnabled ? (
              <Unlock className="h-2.5 w-2.5" />
            ) : (
              <Lock className="h-2.5 w-2.5" />
            )}
            {!compact && <Icon className="h-2.5 w-2.5" />}
            <span>{FEATURE_NAMES[featureKey]}</span>
            {showLimits && isEnabled && limit && limit !== -1 && (
              <span className="opacity-70">({limit}{unit ? ` ${unit}` : ''})</span>
            )}
            {showLimits && isEnabled && limit === -1 && (
              <span className="opacity-70">(∞)</span>
            )}
          </Badge>
        );
      })}
    </div>
  );
};

// Compact version for pricing cards
interface FeatureHighlightsProps {
  tier: SubscriptionTier;
  className?: string;
}

export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({ tier, className }) => {
  const config = TIER_FEATURE_CONFIG[tier];
  if (!config) return null;

  const highlights = [
    { key: 'lipsync', label: 'Lip-Sync' },
    { key: 'dubbing', label: 'Dubbing' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'threeD', label: '3D' },
    { key: 'vrAr', label: 'VR/AR' },
  ] as const;

  return (
    <div className={cn('grid grid-cols-5 gap-1 text-center', className)}>
      {highlights.map(({ key, label }) => {
        const featureConfig = config[key];
        const isEnabled = typeof featureConfig !== 'number' && featureConfig?.enabled;
        
        return (
          <div 
            key={key}
            className={cn(
              'text-[9px] py-1 rounded border',
              isEnabled 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'bg-muted/30 text-muted-foreground border-muted'
            )}
          >
            {isEnabled ? '✓' : '—'} {label}
          </div>
        );
      })}
    </div>
  );
};

// Feature comparison row for tables
interface FeatureComparisonRowProps {
  feature: keyof TierFeatures;
  tiers: SubscriptionTier[];
}

export const FeatureComparisonRow: React.FC<FeatureComparisonRowProps> = ({ feature, tiers }) => {
  const Icon = FEATURE_ICONS[feature];
  
  return (
    <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
      <td className="py-2 px-3 text-xs text-foreground flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {FEATURE_NAMES[feature]}
      </td>
      {tiers.map((tier) => {
        const config = TIER_FEATURE_CONFIG[tier];
        const featureConfig = config?.[feature];
        
        if (typeof featureConfig === 'number') {
          return (
            <td key={tier} className="text-center py-2 px-2 text-xs text-foreground">
              {featureConfig === -1 ? '∞' : featureConfig}
            </td>
          );
        }
        
        const isEnabled = featureConfig?.enabled ?? false;
        const limit = featureConfig?.limit;
        const unit = featureConfig?.unit;
        
        return (
          <td key={tier} className="text-center py-2 px-2 text-xs">
            {!isEnabled ? (
              <Lock className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
            ) : limit === -1 ? (
              <span className="text-primary font-medium">Unlimited</span>
            ) : (
              <span className="text-foreground">
                {limit} {unit || ''}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
};

export default FeatureAccessBadges;
