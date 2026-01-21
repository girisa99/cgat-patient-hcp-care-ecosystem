/**
 * Provider Tier Badge Component
 * Displays clear Tier 1/2/3 indicators on provider/model dropdowns
 * Includes cost, quality, and speed metrics for informed decision-making
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Zap, Sparkles, Crown, DollarSign, Gauge, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GlobalTier } from './GlobalTierFilter';

// Tier configuration with consistent styling
const TIER_STYLES: Record<GlobalTier, {
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  costLabel: string;
  qualityLabel: string;
  speedLabel: string;
}> = {
  1: {
    label: 'Standard',
    shortLabel: 'Std',
    icon: <Zap className="h-3 w-3" />,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    costLabel: '$',
    qualityLabel: 'Good',
    speedLabel: 'Fast',
  },
  2: {
    label: 'Advanced',
    shortLabel: 'Adv',
    icon: <Sparkles className="h-3 w-3" />,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-300 dark:border-blue-700',
    costLabel: '$$',
    qualityLabel: 'High',
    speedLabel: 'Moderate',
  },
  3: {
    label: 'Premium',
    shortLabel: 'Prm',
    icon: <Crown className="h-3 w-3" />,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/30',
    borderClass: 'border-purple-300 dark:border-purple-700',
    costLabel: '$$$',
    qualityLabel: 'Best',
    speedLabel: 'Slower',
  },
};

interface ProviderTierBadgeProps {
  tier: GlobalTier;
  showLabel?: boolean;
  showTooltip?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function ProviderTierBadge({
  tier,
  showLabel = true,
  showTooltip = true,
  size = 'sm',
  className,
}: ProviderTierBadgeProps) {
  const style = TIER_STYLES[tier];
  
  const sizeClasses = {
    xs: 'text-[9px] px-1 py-0 h-4 gap-0.5',
    sm: 'text-[10px] px-1.5 py-0 h-5 gap-1',
    md: 'text-xs px-2 py-0.5 h-6 gap-1.5',
  };

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        sizeClasses[size],
        style.colorClass,
        style.bgClass,
        style.borderClass,
        className
      )}
    >
      {style.icon}
      {showLabel && <span>{size === 'xs' ? style.shortLabel : style.label}</span>}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{style.label} Tier</p>
            <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span>{style.costLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="h-3 w-3 text-muted-foreground" />
                <span>{style.qualityLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{style.speedLabel}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Provider Item Component for Dropdowns
 * Displays provider name with tier badge, metrics, and status
 */
interface ProviderItemProps {
  id: string;
  name: string;
  provider: string;
  tier: GlobalTier;
  quality?: number;
  speed?: number;
  costMultiplier?: number;
  description?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  isRecommended?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ProviderItem({
  id,
  name,
  provider,
  tier,
  quality,
  speed,
  costMultiplier,
  description,
  isSelected,
  isDisabled,
  disabledReason,
  isRecommended,
  onClick,
  className,
}: ProviderItemProps) {
  const style = TIER_STYLES[tier];

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-all',
        'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring',
        isSelected && 'bg-accent border border-primary/30',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{name}</span>
          <ProviderTierBadge tier={tier} size="xs" showTooltip={false} />
          {isRecommended && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-primary/10 text-primary">
              Recommended
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{provider}</span>
          {description && (
            <span className="text-[10px] text-muted-foreground truncate">• {description}</span>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-3 text-[10px]">
        {quality !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-0.5">
                  <Gauge className="h-3 w-3 text-muted-foreground" />
                  <span className={cn(
                    quality >= 9 ? 'text-green-600' :
                    quality >= 7 ? 'text-blue-600' :
                    'text-muted-foreground'
                  )}>
                    {quality}/10
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Quality Score
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {speed !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className={cn(
                    speed >= 8 ? 'text-green-600' :
                    speed >= 6 ? 'text-blue-600' :
                    'text-muted-foreground'
                  )}>
                    {speed}/10
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Speed Score
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {costMultiplier !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-0.5">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className={cn(
                    costMultiplier <= 1 ? 'text-green-600' :
                    costMultiplier <= 2 ? 'text-blue-600' :
                    'text-amber-600'
                  )}>
                    {costMultiplier}x
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Cost Multiplier
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Disabled reason */}
      {isDisabled && disabledReason && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-amber-500 text-amber-600">
                Unavailable
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-xs">
              {disabledReason}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </button>
  );
}

/**
 * Grouped Provider List Component
 * Groups providers by tier with clear visual separation
 */
interface GroupedProviderListProps {
  providers: Array<{
    id: string;
    name: string;
    provider: string;
    tier: GlobalTier;
    quality?: number;
    speed?: number;
    costMultiplier?: number;
    description?: string;
    isDisabled?: boolean;
    disabledReason?: string;
  }>;
  selectedId?: string;
  recommendedIds?: string[];
  globalTierFilter?: GlobalTier;
  onSelect: (id: string) => void;
  className?: string;
}

export function GroupedProviderList({
  providers,
  selectedId,
  recommendedIds = [],
  globalTierFilter,
  onSelect,
  className,
}: GroupedProviderListProps) {
  // Filter by global tier if provided
  const filteredProviders = globalTierFilter
    ? providers.filter(p => p.tier <= globalTierFilter)
    : providers;

  // Group by tier
  const groupedByTier = filteredProviders.reduce((acc, provider) => {
    if (!acc[provider.tier]) {
      acc[provider.tier] = [];
    }
    acc[provider.tier].push(provider);
    return acc;
  }, {} as Record<GlobalTier, typeof providers>);

  const tiers = [1, 2, 3] as GlobalTier[];

  return (
    <div className={cn('space-y-3', className)}>
      {tiers.map(tier => {
        const tierProviders = groupedByTier[tier];
        if (!tierProviders || tierProviders.length === 0) return null;

        const style = TIER_STYLES[tier];

        return (
          <div key={tier}>
            {/* Tier Header */}
            <div className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md mb-1',
              style.bgClass
            )}>
              {style.icon}
              <span className={cn('text-xs font-medium', style.colorClass)}>
                {style.label} Tier
              </span>
              <span className="text-[10px] text-muted-foreground">
                ({tierProviders.length} models)
              </span>
            </div>

            {/* Providers */}
            <div className="space-y-1">
              {tierProviders.map(provider => (
                <ProviderItem
                  key={provider.id}
                  {...provider}
                  isSelected={selectedId === provider.id}
                  isRecommended={recommendedIds.includes(provider.id)}
                  onClick={() => onSelect(provider.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {filteredProviders.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No providers available for the selected tier
        </div>
      )}
    </div>
  );
}

export { TIER_STYLES };
