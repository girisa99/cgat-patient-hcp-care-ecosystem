/**
 * Refresh Caps Display - Shows remaining regeneration attempts
 * Tracks slide-level and presentation-level refresh limits
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  RefreshCw,
  AlertCircle,
  Infinity,
  Lock,
  Unlock,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Default caps (can be overridden by user tier)
export const DEFAULT_REFRESH_CAPS = {
  slideLevel: 3,       // Max regenerations per slide
  presentationLevel: 10, // Max total regenerations per presentation
  enhanceLevel: 5,      // Max AI enhancements per slide
  maxPremium: Infinity, // Premium users get unlimited
};

// User tier multipliers
export const TIER_MULTIPLIERS: Record<string, number> = {
  free: 1,
  starter: 2,
  professional: 5,
  enterprise: 999999, // Effectively unlimited
};

interface RefreshCapsDisplayProps {
  slideRefreshesUsed: number;
  slideRefreshCap: number;
  presentationRefreshesUsed: number;
  presentationRefreshCap: number;
  userTier?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  canRefresh?: boolean;
  scope?: 'slide' | 'presentation';
  className?: string;
}

export function RefreshCapsDisplay({
  slideRefreshesUsed,
  slideRefreshCap,
  presentationRefreshesUsed,
  presentationRefreshCap,
  userTier = 'free',
  onRefresh,
  isRefreshing = false,
  canRefresh = true,
  scope = 'slide',
  className,
}: RefreshCapsDisplayProps) {
  const slideRemaining = Math.max(0, slideRefreshCap - slideRefreshesUsed);
  const presentationRemaining = Math.max(0, presentationRefreshCap - presentationRefreshesUsed);
  
  const isSlideCapReached = slideRemaining === 0;
  const isPresentationCapReached = presentationRemaining === 0;
  const isAnyCapReached = isSlideCapReached || isPresentationCapReached;
  
  const slideProgress = (slideRefreshesUsed / slideRefreshCap) * 100;
  const presentationProgress = (presentationRefreshesUsed / presentationRefreshCap) * 100;
  
  const isUnlimited = userTier === 'enterprise';

  return (
    <div className={cn("space-y-3", className)}>
      {/* Compact Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className={cn(
            "h-4 w-4",
            isAnyCapReached ? "text-destructive" : "text-primary"
          )} />
          <span className="text-sm font-medium">Regeneration Limits</span>
        </div>
        
        {isUnlimited ? (
          <Badge variant="outline" className="bg-gradient-to-r from-primary/20 to-accent/20">
            <Infinity className="h-3 w-3 mr-1" />
            Unlimited
          </Badge>
        ) : (
          <Badge variant="outline" className={cn(
            isAnyCapReached && "border-destructive text-destructive"
          )}>
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier
          </Badge>
        )}
      </div>

      {/* Progress Bars */}
      {!isUnlimited && (
        <div className="space-y-3">
          {/* Slide-level */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">This Slide</span>
              <span className={cn(
                "font-medium",
                isSlideCapReached ? "text-destructive" : "text-foreground"
              )}>
                {slideRemaining} / {slideRefreshCap} remaining
              </span>
            </div>
            <Progress 
              value={slideProgress} 
              className={cn(
                "h-1.5",
                isSlideCapReached && "[&>div]:bg-destructive"
              )} 
            />
          </div>
          
          {/* Presentation-level */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Presentation</span>
              <span className={cn(
                "font-medium",
                isPresentationCapReached ? "text-destructive" : "text-foreground"
              )}>
                {presentationRemaining} / {presentationRefreshCap} remaining
              </span>
            </div>
            <Progress 
              value={presentationProgress} 
              className={cn(
                "h-1.5",
                isPresentationCapReached && "[&>div]:bg-destructive"
              )} 
            />
          </div>
        </div>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={isAnyCapReached && !isUnlimited ? "outline" : "default"}
                onClick={onRefresh}
                disabled={!canRefresh || isRefreshing || (isAnyCapReached && !isUnlimited)}
                className="w-full"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : isAnyCapReached && !isUnlimited ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Limit Reached
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate {scope === 'slide' ? 'Slide' : 'All'}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {isAnyCapReached && !isUnlimited && (
              <TooltipContent>
                <p className="text-xs">Upgrade to Professional or Enterprise for more regenerations</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Warning */}
      {isAnyCapReached && !isUnlimited && (
        <div className="flex items-start gap-2 p-2 bg-warning/10 rounded-lg text-xs">
          <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
          <div>
            <span className="font-medium text-warning">Regeneration limit reached.</span>
            <p className="text-muted-foreground mt-0.5">
              Consider upgrading your plan or editing content manually.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact inline version
export function RefreshCapsInline({
  remaining,
  total,
  onRefresh,
  isRefreshing,
  className,
}: {
  remaining: number;
  total: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}) {
  const canRefresh = remaining > 0;
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={onRefresh}
              disabled={!canRefresh || isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                isRefreshing && "animate-spin",
                !canRefresh && "text-muted-foreground"
              )} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {canRefresh 
                ? `Regenerate (${remaining}/${total} remaining)` 
                : 'No regenerations remaining'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <span className={cn(
        "text-xs",
        remaining === 0 ? "text-destructive" : "text-muted-foreground"
      )}>
        {remaining}/{total}
      </span>
    </div>
  );
}

export default RefreshCapsDisplay;
