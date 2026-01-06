/**
 * Agent Results Confirmation Dialog
 * Shows executed agent results and allows user to accept/reject before populating tabs
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Bot,
  Sparkles,
  Clock,
  Cpu,
  FileCheck,
  Brain,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentExecutionResult } from '@/hooks/useAgentExecution';

interface AgentResultsConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: AgentExecutionResult[];
  extractedData?: Record<string, any>;
  onAccept: (selectedResults: AgentExecutionResult[], mergeWithExtraction: boolean) => void;
  onReject: () => void;
}

// Provider display config
const PROVIDER_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  claude: { label: 'Claude', color: 'bg-orange-100 text-orange-700', icon: '🤖' },
  gemini: { label: 'Gemini', color: 'bg-blue-100 text-blue-700', icon: '✨' },
  openai: { label: 'OpenAI', color: 'bg-green-100 text-green-700', icon: '🧠' },
  default: { label: 'AI', color: 'bg-gray-100 text-gray-700', icon: '🤖' }
};

// Format key helper
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, str => str.toUpperCase());
}

// Render value helper
function renderValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">N/A</span>;
  }
  if (typeof value === 'boolean') {
    return value ? <Badge className="bg-green-500">Yes</Badge> : <Badge variant="secondary">No</Badge>;
  }
  if (typeof value === 'number') {
    return <span className="font-mono text-primary">{value}</span>;
  }
  if (typeof value === 'string') {
    return <span className="text-sm">{value.length > 80 ? value.slice(0, 80) + '...' : value}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">None</span>;
    if (value.every(v => typeof v === 'string')) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 5).map((v, i) => (
            <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
          ))}
          {value.length > 5 && <Badge variant="secondary" className="text-xs">+{value.length - 5}</Badge>}
        </div>
      );
    }
    return <span className="text-muted-foreground">{value.length} items</span>;
  }
  if (typeof value === 'object') {
    return <span className="text-muted-foreground">[Object]</span>;
  }
  return <span>{String(value)}</span>;
}

export function AgentResultsConfirmation({
  open,
  onOpenChange,
  results,
  extractedData,
  onAccept,
  onReject
}: AgentResultsConfirmationProps) {
  const [selectedResults, setSelectedResults] = useState<Set<string>>(
    new Set(results.filter(r => r.status === 'completed').map(r => r.agentId))
  );
  const [mergeWithExtraction, setMergeWithExtraction] = useState(true);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const completedResults = results.filter(r => r.status === 'completed');
  const failedResults = results.filter(r => r.status === 'failed');

  // Check if we have extraction data that can be merged
  const hasExtractionData = useMemo(() => {
    if (!extractedData) return false;
    const relevantKeys = ['ndc', 'medication', 'drug_name', 'alternatives', 'interactions'];
    return relevantKeys.some(key => 
      extractedData[key] || extractedData[`${key}_code`] || extractedData[`${key}Name`]
    );
  }, [extractedData]);

  const toggleResult = (agentId: string) => {
    setSelectedResults(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const toggleExpanded = (agentId: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const handleAccept = () => {
    const selected = completedResults.filter(r => selectedResults.has(r.agentId));
    onAccept(selected, mergeWithExtraction);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Agent Execution Complete
          </DialogTitle>
          <DialogDescription>
            Review results and select which findings to apply to your document
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 flex-shrink-0">
          {completedResults.length > 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{completedResults.length} Completed</span>
            </div>
          )}
          {failedResults.length > 0 && (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{failedResults.length} Failed</span>
            </div>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            {selectedResults.size} selected for application
          </div>
        </div>

        {/* Merge Option */}
        {hasExtractionData && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5 flex-shrink-0">
            <Checkbox
              id="merge-extraction"
              checked={mergeWithExtraction}
              onCheckedChange={(checked) => setMergeWithExtraction(!!checked)}
            />
            <div className="flex-1">
              <Label htmlFor="merge-extraction" className="text-sm font-medium cursor-pointer">
                Merge with extracted data
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Combine agent findings (NDC, clinical info, alternatives) with auto-extracted fields from the document
              </p>
            </div>
          </div>
        )}

        {/* Results List - Using native overflow for reliable scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto max-h-[50vh] border rounded-lg">
          <div className="space-y-3 p-3">
            {/* Completed Results */}
            {completedResults.map((result) => {
              const isSelected = selectedResults.has(result.agentId);
              const isExpanded = expandedResults.has(result.agentId);
              const providerConfig = PROVIDER_CONFIG[result.provider || 'default'] || PROVIDER_CONFIG.default;
              const findingsEntries = Object.entries(result.findings || {}).filter(
                ([key]) => !['error', 'message'].includes(key.toLowerCase())
              );

              return (
                <div
                  key={result.agentId}
                  className={cn(
                    "rounded-lg border transition-all",
                    isSelected 
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/30 ring-1 ring-green-500/30"
                      : "border-border hover:border-green-300"
                  )}
                >
                  {/* Header */}
                  <div className="p-3 flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleResult(result.agentId)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{result.agentName}</span>
                        
                        {/* From Agent badge */}
                        <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">
                          <Brain className="h-2.5 w-2.5 mr-0.5" /> From Agent
                        </Badge>
                        
                        {/* AI Provider */}
                        {result.aiPowered && (
                          <Badge className={cn("text-[9px]", providerConfig.color)}>
                            {providerConfig.icon} {result.model || providerConfig.label}
                          </Badge>
                        )}
                        
                        {/* Execution Time */}
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> {result.executionTimeMs}ms
                        </span>
                      </div>
                      
                      {/* Summary */}
                      {result.summary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {result.summary}
                        </p>
                      )}
                      
                      {/* Alerts Preview */}
                      {result.alerts && result.alerts.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-[10px]">
                          <AlertTriangle className={cn(
                            "h-3 w-3",
                            result.alerts.some(a => a.level === 'error') ? 'text-destructive' : 'text-amber-500'
                          )} />
                          <span>{result.alerts.length} alert(s)</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Expand Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => toggleExpanded(result.agentId)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 border-t space-y-3">
                      {/* Findings */}
                      {findingsEntries.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-muted-foreground mb-2">Findings</div>
                          <div className="grid grid-cols-2 gap-2">
                            {findingsEntries.slice(0, 8).map(([key, value]) => (
                              <div key={key} className="p-2 rounded bg-muted/50 text-xs">
                                <span className="font-medium text-primary">{formatKey(key)}:</span>{' '}
                                {renderValue(value)}
                              </div>
                            ))}
                          </div>
                          {findingsEntries.length > 8 && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              +{findingsEntries.length - 8} more fields
                            </p>
                          )}
                        </div>
                      )}

                      {/* Recommendations */}
                      {result.recommendations && result.recommendations.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Recommendations</div>
                          <ul className="space-y-0.5">
                            {result.recommendations.slice(0, 3).map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-xs">
                                <Sparkles className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Alerts */}
                      {result.alerts && result.alerts.length > 0 && (
                        <div className="space-y-1">
                          {result.alerts.slice(0, 3).map((alert, idx) => (
                            <Alert key={idx} className={cn(
                              "py-1.5",
                              alert.level === 'error' ? 'border-destructive bg-destructive/10' :
                              alert.level === 'warning' ? 'border-amber-500 bg-amber-50' : 
                              'border-blue-500 bg-blue-50'
                            )}>
                              <AlertDescription className="text-xs flex items-center gap-1.5">
                                {alert.level === 'error' && <XCircle className="h-3 w-3 text-destructive" />}
                                {alert.level === 'warning' && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                                {alert.level === 'info' && <Info className="h-3 w-3 text-blue-500" />}
                                {alert.message}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Failed Results */}
            {failedResults.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="text-xs font-medium text-destructive mb-2">Failed Executions</div>
                {failedResults.map((result) => (
                  <div
                    key={result.agentId}
                    className="p-3 rounded-lg border border-destructive/30 bg-destructive/10"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-sm">{result.agentName}</span>
                    </div>
                    <p className="text-xs text-destructive mt-1">
                      {result.findings?.error || result.alerts?.[0]?.message || 'Execution failed'}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2">
          <Button variant="outline" onClick={onReject}>
            <XCircle className="h-4 w-4 mr-2" />
            Discard Results
          </Button>
          <Button onClick={handleAccept} disabled={selectedResults.size === 0}>
            <FileCheck className="h-4 w-4 mr-2" />
            Apply {selectedResults.size} Result(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AgentResultsConfirmation;
