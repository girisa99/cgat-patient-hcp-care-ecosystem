/**
 * Token Breakdown Panel
 * Shows detailed breakdown of estimated tokens/credits with optimization suggestions
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Coins,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  TrendingDown,
  AlertTriangle,
  Check,
  Info,
  Sparkles,
  Calculator,
  Gauge,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type TokenEstimate,
  type TokenBreakdown,
  type OptimizationSuggestion,
  formatTokens,
} from '../services/tokenEstimationService';

interface TokenBreakdownPanelProps {
  estimate: TokenEstimate;
  currentBalance: number;
  onApplySuggestion?: (suggestion: OptimizationSuggestion) => void;
  isCompact?: boolean;
  className?: string;
}

// Category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Text Generation': <span className="text-blue-500">📝</span>,
  'Visual Generation': <span className="text-purple-500">🎨</span>,
  'Voice Generation': <span className="text-green-500">🎙️</span>,
  'Translation': <span className="text-amber-500">🌐</span>,
  'Audio': <span className="text-pink-500">🎵</span>,
  'Data Visualization': <span className="text-cyan-500">📊</span>,
  'Framework Processing': <span className="text-indigo-500">🧩</span>,
  'Interactivity': <span className="text-orange-500">✨</span>,
};

function BreakdownItem({ item }: { item: TokenBreakdown }) {
  const percentOfTotal = 0; // Will be calculated by parent
  
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <div className="flex items-center gap-2 flex-1">
        {CATEGORY_ICONS[item.category] || <span>•</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{item.subcategory}</span>
            {item.isOptional && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                Optional
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {item.description}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div>
          <div className="font-mono font-medium">{formatTokens(item.tokens)}</div>
          <div className="text-xs text-muted-foreground">tokens</div>
        </div>
        <div className="w-16 text-right">
          <div className="font-mono text-primary">{item.credits}</div>
          <div className="text-xs text-muted-foreground">credits</div>
        </div>
      </div>
    </div>
  );
}

function OptimizationCard({ 
  suggestion, 
  onApply 
}: { 
  suggestion: OptimizationSuggestion;
  onApply?: () => void;
}) {
  const impactColor = {
    low: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
    medium: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
    high: 'bg-green-500/10 border-green-500/30 text-green-600',
  }[suggestion.impact];
  
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      impactColor
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-4 w-4" />
            <span className="font-medium text-sm">{suggestion.title}</span>
            <Badge variant="outline" className="text-[10px] h-4">
              {suggestion.impact.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs opacity-80 mb-2">{suggestion.description}</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Save {formatTokens(suggestion.potentialSavings)} tokens
            </span>
            <span className="font-medium">
              (~{suggestion.savingsPercent}% reduction)
            </span>
          </div>
        </div>
        {onApply && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs shrink-0"
            onClick={onApply}
          >
            Apply
          </Button>
        )}
      </div>
    </div>
  );
}

export function TokenBreakdownPanel({
  estimate,
  currentBalance,
  onApplySuggestion,
  isCompact = false,
  className,
}: TokenBreakdownPanelProps) {
  const [showOptimizations, setShowOptimizations] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const hasEnoughCredits = currentBalance >= estimate.totalCredits;
  const usagePercent = Math.min((estimate.totalCredits / currentBalance) * 100, 100);
  const afterGeneration = currentBalance - estimate.totalCredits;
  
  // Group breakdown by category
  const groupedBreakdown = estimate.breakdown.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TokenBreakdown[]>);
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const confidenceColor = {
    low: 'text-amber-500 bg-amber-500/10',
    medium: 'text-blue-500 bg-blue-500/10',
    high: 'text-green-500 bg-green-500/10',
  }[estimate.confidenceLevel];
  
  if (isCompact) {
    return (
      <Card className={cn("border-primary/20", className)}>
        <CardContent className="p-4">
          {/* Compact Summary */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Token Estimate</span>
            </div>
            <Badge className={cn("text-xs", confidenceColor)}>
              {estimate.confidencePercent}% confidence
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-muted/50 rounded">
              <div className="text-lg font-bold font-mono">{formatTokens(estimate.totalTokens)}</div>
              <div className="text-[10px] text-muted-foreground">Tokens</div>
            </div>
            <div className={cn(
              "p-2 rounded",
              hasEnoughCredits ? "bg-primary/10" : "bg-destructive/10"
            )}>
              <div className={cn(
                "text-lg font-bold font-mono",
                hasEnoughCredits ? "text-primary" : "text-destructive"
              )}>
                {estimate.totalCredits}
              </div>
              <div className="text-[10px] text-muted-foreground">Credits</div>
            </div>
            <div className={cn(
              "p-2 rounded",
              afterGeneration >= 0 ? "bg-success/10" : "bg-destructive/10"
            )}>
              <div className={cn(
                "text-lg font-bold font-mono",
                afterGeneration >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatTokens(Math.max(0, afterGeneration))}
              </div>
              <div className="text-[10px] text-muted-foreground">Remaining</div>
            </div>
          </div>
          
          {estimate.optimizationSuggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lightbulb className="h-3 w-3" />
                {estimate.optimizationSuggestions.length} optimization tips available
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-5 w-5 text-primary" />
            Token Estimation Breakdown
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge className={cn("text-xs gap-1", confidenceColor)}>
                  <Gauge className="h-3 w-3" />
                  {estimate.confidencePercent}% confidence
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] text-xs">
                  {estimate.confidenceLevel === 'high' && 'High confidence estimate based on 2D content generation.'}
                  {estimate.confidenceLevel === 'medium' && 'Medium confidence - 3D/Interactive content has variable output.'}
                  {estimate.confidenceLevel === 'low' && 'Low confidence - Video generation is highly variable.'}
                </p>
                <p className="text-xs mt-1">
                  Range: {formatTokens(estimate.estimatedRange.min)} - {formatTokens(estimate.estimatedRange.max)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="text-xl font-bold font-mono">{formatTokens(estimate.totalTokens)}</div>
            <div className="text-xs text-muted-foreground">Est. Tokens</div>
          </div>
          <div className={cn(
            "p-3 rounded-lg text-center",
            hasEnoughCredits ? "bg-primary/10" : "bg-destructive/10"
          )}>
            <div className={cn(
              "text-xl font-bold font-mono",
              hasEnoughCredits ? "text-primary" : "text-destructive"
            )}>
              {estimate.totalCredits}
            </div>
            <div className="text-xs text-muted-foreground">Credits Needed</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-xl font-bold font-mono">{formatTokens(currentBalance)}</div>
            <div className="text-xs text-muted-foreground">Your Balance</div>
          </div>
          <div className={cn(
            "p-3 rounded-lg text-center",
            afterGeneration >= 0 ? "bg-success/10" : "bg-destructive/10"
          )}>
            <div className={cn(
              "text-xl font-bold font-mono",
              afterGeneration >= 0 ? "text-success" : "text-destructive"
            )}>
              {formatTokens(afterGeneration)}
            </div>
            <div className="text-xs text-muted-foreground">After Gen</div>
          </div>
        </div>
        
        {/* Usage Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Credit Usage</span>
            <span className={cn(
              "font-medium",
              usagePercent > 100 ? "text-destructive" : usagePercent > 70 ? "text-warning" : "text-muted-foreground"
            )}>
              {Math.round(usagePercent)}% of balance
            </span>
          </div>
          <Progress 
            value={Math.min(usagePercent, 100)} 
            className={cn(
              "h-2",
              usagePercent > 100 && "[&>div]:bg-destructive"
            )} 
          />
        </div>
        
        {/* Insufficient Credits Warning */}
        {!hasEnoughCredits && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Insufficient credits.</span>
              {' '}Need {estimate.totalCredits - currentBalance} more credits or apply optimizations below.
            </div>
          </div>
        )}
        
        <Separator />
        
        {/* Detailed Breakdown by Category */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Detailed Breakdown
          </h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1 pr-4">
              {Object.entries(groupedBreakdown).map(([category, items]) => {
                const categoryTokens = items.reduce((sum, item) => sum + item.tokens, 0);
                const categoryCredits = items.reduce((sum, item) => sum + item.credits, 0);
                const isExpanded = expandedCategories.has(category);
                
                return (
                  <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between py-2 px-2 rounded hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          {CATEGORY_ICONS[category]}
                          <span className="font-medium text-sm">{category}</span>
                          <Badge variant="outline" className="text-[10px] h-4">
                            {items.length} items
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-mono">{formatTokens(categoryTokens)}</span>
                          <span className="font-mono text-primary font-medium">{categoryCredits} cr</span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-8 border-l-2 border-muted ml-2">
                        {items.map((item, idx) => (
                          <BreakdownItem key={idx} item={item} />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        </div>
        
        {/* Optimization Suggestions */}
        {estimate.optimizationSuggestions.length > 0 && (
          <>
            <Separator />
            <Collapsible open={showOptimizations} onOpenChange={setShowOptimizations}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Optimization Suggestions
                    <Badge variant="secondary" className="text-[10px]">
                      {estimate.optimizationSuggestions.length}
                    </Badge>
                  </h4>
                  {showOptimizations ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea className="h-[150px] mt-3">
                  <div className="space-y-2 pr-4">
                    {estimate.optimizationSuggestions.map(suggestion => (
                      <OptimizationCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        onApply={onApplySuggestion ? () => onApplySuggestion(suggestion) : undefined}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
        
        {/* Confidence Note */}
        <div className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <p>
            These are <strong>estimated</strong> tokens. Actual usage may vary by ±{100 - estimate.confidencePercent}% 
            based on AI model responses and content complexity. Video/3D outputs have higher variance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TokenBreakdownPanel;
