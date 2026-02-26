/**
 * CharacterLimitIndicator
 * 
 * Displays provider-aware character limits with warnings for TTS generation.
 * Shows soft (optimal), hard (max), and current character counts.
 */

import { AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PROVIDER_CHAR_LIMITS } from '@/services/marketing/frameworkMessagingEngine';

interface CharacterLimitIndicatorProps {
  currentCharCount: number;
  provider?: string;
  warning?: string;
  showDetails?: boolean;
}

export function CharacterLimitIndicator({
  currentCharCount,
  provider = 'qwen3-tts-flash',
  warning,
  showDetails = true,
}: CharacterLimitIndicatorProps) {
  const limits = PROVIDER_CHAR_LIMITS[provider] || PROVIDER_CHAR_LIMITS.default;
  const isCritical = currentCharCount > limits.hard;
  const isWarning = currentCharCount > limits.soft && currentCharCount <= limits.hard;
  const isGood = currentCharCount <= limits.soft;

  const percentOfSoft = Math.round((currentCharCount / limits.soft) * 100);
  const percentOfHard = Math.round((currentCharCount / limits.hard) * 100);

  return (
    <div className="space-y-3">
      {/* Character Count Display */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Character Count: {currentCharCount.toLocaleString()}</p>
          {showDetails && (
            <p className="text-xs text-muted-foreground mt-1">
              Optimal: ≤{limits.soft.toLocaleString()} | Max: {limits.hard.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {isGood && (
            <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
              ✓ Optimal
            </Badge>
          )}
          {isWarning && (
            <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning flex items-center gap-1">
              <Zap size={12} />
              Caution
            </Badge>
          )}
          {isCritical && (
            <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-1">
              <AlertTriangle size={12} />
              Critical
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        {/* Soft Limit Progress */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">Soft Limit (Optimal)</span>
            <span className="text-xs text-muted-foreground">{percentOfSoft}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                currentCharCount > limits.soft
                  ? 'bg-warning'
                  : 'bg-success'
              }`}
              style={{ width: `${Math.min(percentOfSoft, 100)}%` }}
            />
          </div>
        </div>

        {/* Hard Limit Progress */}
        {showDetails && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Hard Limit (Max)</span>
              <span className="text-xs text-muted-foreground">{percentOfHard}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  currentCharCount > limits.hard
                    ? 'bg-destructive'
                    : currentCharCount > limits.soft
                    ? 'bg-warning'
                    : 'bg-success'
                }`}
                style={{ width: `${Math.min(percentOfHard, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Warning Message */}
      {warning && (
        <Card className={`border-2 ${isCritical ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5'}`}>
          <CardContent className="p-3">
            <div className="flex gap-2">
              {isCritical ? (
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              ) : (
                <Zap className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isCritical ? 'text-destructive' : 'text-warning'}`}>
                {warning}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      {showDetails && !warning && (
        <p className="text-xs text-muted-foreground p-2 bg-muted rounded border border-border">
          💡 For <strong>{provider}</strong>: Optimal performance up to {limits.soft.toLocaleString()} characters.
          Generation may slow or fail above {limits.hard.toLocaleString()} characters.
        </p>
      )}
    </div>
  );
}
