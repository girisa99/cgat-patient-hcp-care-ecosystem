/**
 * Global Tier Filter Component
 * Provides Standard/Advanced/Premium tier selection that cascades through the entire wizard
 * Affects: Text, Image, Video, 3D Mesh, Voice, Music, SFX, Translation models
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Zap, Sparkles, Crown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GlobalTier = 1 | 2 | 3;

interface TierConfig {
  id: GlobalTier;
  label: string;
  icon: React.ReactNode;
  description: string;
  costLabel: string;
  qualityLabel: string;
  speedLabel: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const TIER_CONFIGS: TierConfig[] = [
  {
    id: 1,
    label: 'Standard',
    icon: <Zap className="h-3.5 w-3.5" />,
    description: 'Fast, cost-effective models for quick drafts',
    costLabel: '$',
    qualityLabel: 'Good',
    speedLabel: 'Fast',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 2,
    label: 'Advanced',
    icon: <Sparkles className="h-3.5 w-3.5" />,
    description: 'Balanced quality and speed for production use',
    costLabel: '$$',
    qualityLabel: 'High',
    speedLabel: 'Moderate',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 3,
    label: 'Premium',
    icon: <Crown className="h-3.5 w-3.5" />,
    description: 'Highest quality models for critical presentations',
    costLabel: '$$$',
    qualityLabel: 'Premium',
    speedLabel: 'Slower',
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/30',
    borderClass: 'border-purple-200 dark:border-purple-800',
  },
];

interface GlobalTierFilterProps {
  value: GlobalTier;
  onChange: (tier: GlobalTier) => void;
  compact?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function GlobalTierFilter({
  value,
  onChange,
  compact = false,
  showLegend = false,
  className,
}: GlobalTierFilterProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-1">
        {!compact && (
          <span className="text-xs font-medium text-muted-foreground mr-2">
            Quality Tier:
          </span>
        )}
        
        <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50 border">
          {TIER_CONFIGS.map((tier) => {
            const isActive = value === tier.id;
            
            return (
              <TooltipProvider key={tier.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onChange(tier.id)}
                      className={cn(
                        'h-7 px-2.5 gap-1.5 text-xs font-medium transition-all',
                        isActive
                          ? cn(tier.bgClass, tier.colorClass, tier.borderClass, 'border shadow-sm')
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {tier.icon}
                      {!compact && <span>{tier.label}</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{tier.label} Tier</p>
                      <p className="text-xs text-muted-foreground">{tier.description}</p>
                      <div className="flex gap-3 text-xs pt-1 border-t mt-1">
                        <span>Cost: {tier.costLabel}</span>
                        <span>Quality: {tier.qualityLabel}</span>
                        <span>Speed: {tier.speedLabel}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        
        {showLegend && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                <p className="text-xs">
                  Global Tier affects all AI models: Text, Image, Video, 3D, Voice, Music, SFX, and Translation.
                  Higher tiers provide better quality but cost more credits.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {showLegend && (
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Standard = Fast/Low Cost</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Advanced = Balanced</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Premium = Best Quality</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tier Badge Component - Display tier inline with other elements
 */
export function TierBadge({ tier, className }: { tier: GlobalTier; className?: string }) {
  const config = TIER_CONFIGS.find((t) => t.id === tier) || TIER_CONFIGS[1];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] px-1.5 py-0 h-4 font-medium',
        config.colorClass,
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </Badge>
  );
}

/**
 * Get tier configuration by ID
 */
export function getTierConfig(tier: GlobalTier): TierConfig {
  return TIER_CONFIGS.find((t) => t.id === tier) || TIER_CONFIGS[1];
}

export { TIER_CONFIGS };
