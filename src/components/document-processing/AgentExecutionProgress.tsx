/**
 * Agent Execution Progress Component
 * Shows real-time execution progress with steps, status, and live updates
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Sparkles,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentExecutionResult, SubAgentSuggestion } from '@/hooks/useAgentExecution';

interface AgentExecutionProgressProps {
  agents: SubAgentSuggestion[];
  currentAgent: string | null;
  progress: number;
  results: AgentExecutionResult[];
  isExecuting: boolean;
}

// Provider colors
const PROVIDER_COLORS: Record<string, string> = {
  claude: 'text-orange-600 bg-orange-100',
  gemini: 'text-blue-600 bg-blue-100',
  openai: 'text-green-600 bg-green-100',
  default: 'text-purple-600 bg-purple-100'
};

export function AgentExecutionProgress({
  agents,
  currentAgent,
  progress,
  results,
  isExecuting
}: AgentExecutionProgressProps) {
  const completedCount = results.filter(r => r.status === 'completed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  const getAgentStatus = (agent: SubAgentSuggestion) => {
    const result = results.find(r => r.agentId === agent.id);
    if (result) return result.status;
    if (currentAgent === agent.name) return 'running';
    return 'pending';
  };

  const getAgentResult = (agentId: string) => {
    return results.find(r => r.agentId === agentId);
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-5 w-5 text-primary animate-pulse" />
          Agent Execution In Progress
        </CardTitle>
        <CardDescription className="text-xs">
          Executing {agents.length} agent(s) with real-time AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {completedCount + failedCount}/{agents.length} complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {completedCount > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" /> {completedCount} succeeded
              </span>
            )}
            {failedCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="h-3 w-3" /> {failedCount} failed
              </span>
            )}
            {isExecuting && currentAgent && (
              <span className="flex items-center gap-1 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" /> Running: {currentAgent}
              </span>
            )}
          </div>
        </div>

        {/* Agent Steps */}
        <ScrollArea className="max-h-[300px] pr-2">
          <div className="space-y-2">
            {agents.map((agent, index) => {
              const status = getAgentStatus(agent);
              const result = getAgentResult(agent.id);
              const providerColor = PROVIDER_COLORS[result?.provider || 'default'] || PROVIDER_COLORS.default;

              return (
                <div
                  key={agent.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    status === 'running' && "border-primary bg-primary/10 ring-1 ring-primary/30",
                    status === 'completed' && "border-green-500/50 bg-green-50/50 dark:bg-green-950/30",
                    status === 'failed' && "border-destructive/50 bg-destructive/10",
                    status === 'pending' && "border-border bg-muted/30 opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Step Number & Status Icon */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        status === 'running' && "bg-primary text-primary-foreground",
                        status === 'completed' && "bg-green-500 text-white",
                        status === 'failed' && "bg-destructive text-destructive-foreground",
                        status === 'pending' && "bg-muted text-muted-foreground"
                      )}>
                        {status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {status === 'completed' && <CheckCircle className="h-3 w-3" />}
                        {status === 'failed' && <XCircle className="h-3 w-3" />}
                        {status === 'pending' && (index + 1)}
                      </div>
                      {index < agents.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-4",
                          status === 'completed' ? "bg-green-500" : "bg-border"
                        )} />
                      )}
                    </div>

                    {/* Agent Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{agent.icon}</span>
                        <span className="font-medium text-sm">{agent.name}</span>
                        
                        {/* Status Badge */}
                        {status === 'running' && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px]">
                            <Sparkles className="h-2.5 w-2.5 mr-0.5 animate-pulse" /> Analyzing...
                          </Badge>
                        )}
                        {status === 'completed' && result && (
                          <Badge className="bg-green-100 text-green-700 border-green-300 text-[9px]">
                            ✓ Complete
                          </Badge>
                        )}
                        {status === 'failed' && (
                          <Badge variant="destructive" className="text-[9px]">
                            Failed
                          </Badge>
                        )}
                      </div>

                      {/* Running Status Detail */}
                      {status === 'running' && (
                        <p className="text-xs text-primary mt-1 animate-pulse">
                          Connecting to AI model and analyzing document data...
                        </p>
                      )}

                      {/* Completed Result Preview */}
                      {status === 'completed' && result && (
                        <div className="mt-2 space-y-1.5">
                          {/* AI Model Info */}
                          {result.aiPowered && result.provider && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-[9px]", providerColor)}>
                                <Cpu className="h-2.5 w-2.5 mr-0.5" />
                                {result.model || result.provider}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> {result.executionTimeMs}ms
                              </span>
                            </div>
                          )}
                          
                          {/* Summary */}
                          {result.summary && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {result.summary}
                            </p>
                          )}

                          {/* Alerts Preview */}
                          {result.alerts && result.alerts.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className={cn(
                                result.alerts.some(a => a.level === 'error') ? 'text-destructive' :
                                result.alerts.some(a => a.level === 'warning') ? 'text-amber-600' : 'text-blue-600'
                              )}>
                                {result.alerts.length} alert(s) found
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Failed Error */}
                      {status === 'failed' && result && (
                        <p className="text-xs text-destructive mt-1">
                          {result.findings?.error || 'Execution failed'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Current Step Indicator */}
        {isExecuting && currentAgent && (
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/30">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium text-primary">
              Processing: {currentAgent}
            </span>
            <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AgentExecutionProgress;
