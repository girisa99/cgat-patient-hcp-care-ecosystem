/**
 * Token Balance Header Component
 * Displays subscription token balance and usage in the wizard header
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  ShoppingCart,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAICredits, type UserCredits } from '@/hooks/useAICredits';
import { formatTokens, getUsageColor } from '../services/tokenEstimationService';

interface TokenBalanceHeaderProps {
  estimatedCost?: number;
  isGenerating?: boolean;
  creditsUsed?: number;
  onPurchase?: () => void;
  className?: string;
}

export function TokenBalanceHeader({
  estimatedCost = 0,
  isGenerating = false,
  creditsUsed = 0,
  onPurchase,
  className,
}: TokenBalanceHeaderProps) {
  const { credits, isLoading, refreshCredits, packages } = useAICredits();
  
  const balance = credits?.credits_balance || 0;
  const monthlyLimit = credits?.subscription_credits_monthly || 0;
  const monthlyUsed = credits?.subscription_credits_used || 0;
  
  const hasEnoughCredits = balance >= estimatedCost;
  const usagePercent = monthlyLimit > 0 ? (monthlyUsed / monthlyLimit) * 100 : 0;
  const afterGeneration = balance - estimatedCost;
  
  const usageColor = getUsageColor(usagePercent);
  
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 animate-pulse", className)}>
        <div className="h-8 w-24 bg-muted rounded" />
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Main Balance Display */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 h-9 px-2.5 min-w-[120px]",
              !hasEnoughCredits && estimatedCost > 0 && "border-destructive text-destructive"
            )}
          >
            <Coins className="h-4 w-4 text-primary shrink-0" />
            <span className="font-mono font-medium whitespace-nowrap">{formatTokens(balance)}</span>
            <span className="text-muted-foreground text-xs whitespace-nowrap">credits</span>
            <ChevronDown className="h-3 w-3 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">Credit Balance</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => refreshCredits()}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Balance Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary font-mono">
                  {formatTokens(balance)}
                </div>
                <div className="text-xs text-muted-foreground">Available Credits</div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-medium font-mono">
                  {credits?.credits_used_total || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Used</div>
              </div>
            </div>
            
            {/* Monthly Usage */}
            {monthlyLimit > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Subscription</span>
                  <span className={cn("font-medium", usageColor)}>
                    {monthlyUsed} / {monthlyLimit}
                  </span>
                </div>
                <Progress value={usagePercent} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {usagePercent >= 90 
                    ? '⚠️ Near monthly limit' 
                    : `${Math.round(100 - usagePercent)}% remaining this month`}
                </div>
              </div>
            )}
            
            {/* Estimated Generation Cost */}
            {estimatedCost > 0 && (
              <div className={cn(
                "p-3 rounded-lg border",
                hasEnoughCredits 
                  ? "bg-muted/30 border-muted" 
                  : "bg-destructive/10 border-destructive/30"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">This Generation</span>
                  <Badge 
                    variant={hasEnoughCredits ? "secondary" : "destructive"}
                    className="font-mono"
                  >
                    ~{formatTokens(estimatedCost)} credits
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">After generation:</span>
                  <span className={cn(
                    "font-mono font-medium",
                    afterGeneration >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {formatTokens(Math.max(0, afterGeneration))} credits
                  </span>
                </div>
                {!hasEnoughCredits && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Need {formatTokens(estimatedCost - balance)} more credits
                  </div>
                )}
              </div>
            )}
            
            {/* Generation Progress */}
            {isGenerating && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium">Generating...</span>
                </div>
                <Progress value={(creditsUsed / estimatedCost) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {formatTokens(creditsUsed)} / {formatTokens(estimatedCost)} credits used
                </div>
              </div>
            )}
            
            {/* Purchase Button */}
            <Button
              variant="default"
              size="sm"
              className="w-full gap-2"
              onClick={onPurchase}
            >
              <ShoppingCart className="h-4 w-4" />
              Purchase More Credits
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Quick Estimated Cost Badge */}
      {estimatedCost > 0 && !isGenerating && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1 font-mono",
                  hasEnoughCredits 
                    ? "border-primary/30 text-primary" 
                    : "border-destructive text-destructive"
                )}
              >
                {hasEnoughCredits ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                -{formatTokens(estimatedCost)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Estimated cost for this generation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Generating Indicator */}
      {isGenerating && (
        <Badge variant="secondary" className="gap-1 animate-pulse">
          <Zap className="h-3 w-3 text-primary" />
          {formatTokens(creditsUsed)} used
        </Badge>
      )}
    </div>
  );
}

export default TokenBalanceHeader;
