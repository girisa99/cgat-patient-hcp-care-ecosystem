/**
 * WizardTokenBadge — Live token estimation display
 * Shows running cost estimate as wizard progresses.
 */

import React from 'react';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TokenEstimate } from '@/hooks/useCastRegistry';

interface WizardTokenBadgeProps {
  estimate: TokenEstimate | null;
  className?: string;
}

export const WizardTokenBadge: React.FC<WizardTokenBadgeProps> = ({ estimate, className }) => {
  if (!estimate || estimate.totalTokens === 0) return null;

  return (
    <div className={cn("border rounded-lg p-3 space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Token Estimate</span>
        </div>
        <Badge variant="outline" className={cn("text-xs font-bold", estimate.tierColor)}>
          {estimate.tierLabel} · {estimate.totalTokens} tokens
        </Badge>
      </div>

      {/* Breakdown */}
      {estimate.breakdown.length > 0 && (
        <div className="space-y-1">
          {estimate.breakdown.slice(0, 5).map((item) => (
            <div key={item.capability} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {item.isRequired && <span className="text-primary mr-1">●</span>}
                {item.capabilityLabel}
              </span>
              <span className="font-mono">
                {item.tokens} <span className="text-muted-foreground/60">×{item.multiplier}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Multipliers */}
      <div className="flex gap-3 text-xs text-muted-foreground pt-1 border-t">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Platforms: ×{estimate.platformMultiplier.toFixed(1)}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ~{estimate.estimatedMinutes}min
        </div>
      </div>
    </div>
  );
};
