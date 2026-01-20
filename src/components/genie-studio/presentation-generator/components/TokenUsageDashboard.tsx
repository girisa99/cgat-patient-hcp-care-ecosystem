/**
 * Token Usage Dashboard
 * Floating dashboard showing estimates upfront with confidence ranges,
 * then actual usage after generation with full itemized breakdown
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Coins,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  History,
  Gauge,
  Target,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTokens } from '../services/tokenEstimationService';
import { 
  getRecentGenerations, 
  getUsageStatistics,
  type GenerationRecord 
} from '../services/generationHistoryService';
import { useAICredits } from '@/hooks/useAICredits';

interface TokenUsageDashboardProps {
  className?: string;
}

export function TokenUsageDashboard({ className }: TokenUsageDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const { credits } = useAICredits();
  
  const recentGenerations = getRecentGenerations(2);
  const stats = getUsageStatistics();
  const balance = credits?.credits_balance || 0;

  const toggleRecord = (id: string) => {
    setExpandedRecords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 h-9 px-3 border-primary/30 hover:border-primary",
            className
          )}
        >
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="font-mono font-medium">{formatTokens(balance)}</span>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {stats.completedGenerations} gen
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-semibold">Token Usage Dashboard</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.averageAccuracy}% avg accuracy
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-center">
              <div className="text-lg font-bold font-mono text-primary">{formatTokens(balance)}</div>
              <div className="text-[10px] text-muted-foreground">Balance</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg text-center">
              <div className="text-lg font-bold font-mono">{formatTokens(stats.totalCreditsUsed)}</div>
              <div className="text-[10px] text-muted-foreground">Total Used</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg text-center">
              <div className="text-lg font-bold font-mono">{stats.completedGenerations}</div>
              <div className="text-[10px] text-muted-foreground">Generations</div>
            </div>
          </div>

          <Separator />

          {/* Recent Generations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recent Generations</span>
            </div>

            {recentGenerations.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No generation history yet
              </div>
            ) : (
              <ScrollArea className="h-[280px]">
                <div className="space-y-2 pr-4">
                  {recentGenerations.map(record => (
                    <GenerationRecordCard
                      key={record.id}
                      record={record}
                      isExpanded={expandedRecords.has(record.id)}
                      onToggle={() => toggleRecord(record.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function GenerationRecordCard({
  record,
  isExpanded,
  onToggle,
}: {
  record: GenerationRecord;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isComplete = record.status === 'completed' && record.actual;
  const isGenerating = record.status === 'generating';
  
  const StatusIcon = isComplete ? CheckCircle2 : isGenerating ? Zap : Clock;
  const statusColor = isComplete ? 'text-success' : isGenerating ? 'text-primary animate-pulse' : 'text-muted-foreground';

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="border-muted">
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <StatusIcon className={cn("h-4 w-4 mt-0.5 shrink-0", statusColor)} />
                <div>
                  <div className="font-medium text-sm truncate max-w-[200px]">
                    {record.inputSummary.topic || 'Untitled'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {record.config.slideCount} slides • {record.config.outputType}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-mono text-sm font-medium">
                    {isComplete ? record.actual?.totalCredits : record.estimated.totalCredits}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {isComplete ? 'actual' : 'est.'}
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-3 pt-0 space-y-3">
            <Separator />

            {/* Estimate vs Actual Comparison */}
            <div className="grid grid-cols-2 gap-3">
              {/* Estimated */}
              <div className="p-2 bg-muted/30 rounded-lg">
                <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Estimated
                </div>
                <div className="font-mono font-medium">{formatTokens(record.estimated.totalTokens)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {record.estimated.totalCredits} credits
                </div>
                <Badge variant="outline" className="text-[9px] mt-1 h-4">
                  {record.estimated.confidencePercent}% confidence
                </Badge>
              </div>

              {/* Actual */}
              <div className={cn(
                "p-2 rounded-lg",
                isComplete ? "bg-primary/10" : "bg-muted/20"
              )}>
                <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  Actual
                </div>
                {isComplete ? (
                  <>
                    <div className="font-mono font-medium">{formatTokens(record.actual!.totalTokens)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {record.actual!.totalCredits} credits
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-muted-foreground italic">
                    {isGenerating ? 'In progress...' : 'Pending'}
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Metrics */}
            {record.comparison && (
              <div className="p-2 rounded-lg border border-dashed">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Accuracy</span>
                  <div className="flex items-center gap-2">
                    {record.comparison.tokenDifferencePercent > 0 ? (
                      <TrendingUp className="h-3 w-3 text-amber-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-success" />
                    )}
                    <span className={cn(
                      "font-medium",
                      Math.abs(record.comparison.tokenDifferencePercent) <= 15 
                        ? "text-success" 
                        : "text-amber-500"
                    )}>
                      {record.comparison.tokenDifferencePercent > 0 ? '+' : ''}
                      {record.comparison.tokenDifferencePercent}%
                    </span>
                    <Badge 
                      variant={record.comparison.withinEstimatedRange ? "default" : "secondary"}
                      className="text-[9px] h-4"
                    >
                      {record.comparison.accuracyScore}% accurate
                    </Badge>
                  </div>
                </div>
                {!record.comparison.withinEstimatedRange && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500">
                    <AlertTriangle className="h-3 w-3" />
                    Outside estimated range
                  </div>
                )}
              </div>
            )}

            {/* Detailed Breakdown */}
            {isComplete && record.actual?.breakdown && record.actual.breakdown.length > 0 && (
              <div>
                <div className="text-[10px] font-medium mb-1">Breakdown</div>
                <div className="space-y-1 max-h-[100px] overflow-y-auto">
                  {record.actual.breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground truncate max-w-[150px]">
                        {item.subcategory}
                      </span>
                      <span className="font-mono">{item.credits} cr</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated Breakdown (for pending/generating) */}
            {!isComplete && (
              <div>
                <div className="text-[10px] font-medium mb-1">Estimated Breakdown</div>
                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                  {record.estimated.breakdown.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground truncate max-w-[150px]">
                        {item.subcategory}
                      </span>
                      <span className="font-mono">{item.credits} cr</span>
                    </div>
                  ))}
                  {record.estimated.breakdown.length > 4 && (
                    <div className="text-[10px] text-muted-foreground italic">
                      +{record.estimated.breakdown.length - 4} more...
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default TokenUsageDashboard;
