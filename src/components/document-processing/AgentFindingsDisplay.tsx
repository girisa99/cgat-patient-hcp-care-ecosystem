/**
 * Agent Findings Display Component
 * Dynamically renders agent execution results for ANY document type
 * Shows AI provider used, execution time, and all returned findings
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Brain,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Cpu,
  Zap,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentFindingResult {
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  findings: Record<string, any>;
  confidence: number;
  executionTimeMs: number;
  timestamp: string;
  alerts?: Array<{ level: 'info' | 'warning' | 'error'; message: string }>;
  aiPowered?: boolean;
  model?: string;
  provider?: string;
  dataSource?: string;
  summary?: string;
  recommendations?: string[];
}

interface AgentFindingsDisplayProps {
  agentFindings: AgentFindingResult[];
  title?: string;
  className?: string;
}

// Provider icons and colors
const PROVIDER_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  'claude': { label: 'Claude', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🤖' },
  'gemini': { label: 'Gemini', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '✨' },
  'openai': { label: 'OpenAI', color: 'bg-green-100 text-green-700 border-green-300', icon: '🧠' },
  'openfda': { label: 'OpenFDA', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: '💊' },
  'rxnorm': { label: 'RxNorm', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: '📋' },
  'lovable': { label: 'Lovable AI', color: 'bg-pink-100 text-pink-700 border-pink-300', icon: '💜' },
  'default': { label: 'AI', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '🤖' }
};

// Dynamic value renderer - handles any type of value
function renderValue(value: any, depth: number = 0): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">N/A</span>;
  }

  if (typeof value === 'boolean') {
    return value ? (
      <Badge variant="default" className="bg-green-500">Yes</Badge>
    ) : (
      <Badge variant="secondary">No</Badge>
    );
  }

  if (typeof value === 'number') {
    return <span className="font-mono text-primary">{value}</span>;
  }

  if (typeof value === 'string') {
    // Check if it's a long string
    if (value.length > 100) {
      return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{value}</p>;
    }
    return <span className="text-sm">{value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground italic">None</span>;
    }
    
    // For arrays of strings or simple values
    if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 10).map((item, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {String(item)}
            </Badge>
          ))}
          {value.length > 10 && (
            <Badge variant="secondary" className="text-xs">+{value.length - 10} more</Badge>
          )}
        </div>
      );
    }
    
    // For arrays of objects
    return (
      <div className="space-y-1 pl-2 border-l-2 border-muted">
        {value.slice(0, 5).map((item, idx) => (
          <div key={idx} className="text-xs">
            {renderValue(item, depth + 1)}
          </div>
        ))}
        {value.length > 5 && (
          <span className="text-xs text-muted-foreground">...and {value.length - 5} more</span>
        )}
      </div>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <span className="text-muted-foreground italic">Empty</span>;
    }
    
    if (depth > 2) {
      return <span className="text-xs text-muted-foreground">[Complex object]</span>;
    }
    
    return (
      <div className="space-y-1 pl-2 border-l-2 border-muted">
        {entries.slice(0, 8).map(([key, val]) => (
          <div key={key} className="text-xs">
            <span className="font-medium capitalize">{formatKey(key)}:</span>{' '}
            {renderValue(val, depth + 1)}
          </div>
        ))}
        {entries.length > 8 && (
          <span className="text-xs text-muted-foreground">...and {entries.length - 8} more fields</span>
        )}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

// Format camelCase/snake_case keys to readable labels
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, str => str.toUpperCase());
}

// Get status icon
function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'running':
      return <Zap className="h-4 w-4 text-amber-500 animate-pulse" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export function AgentFindingsDisplay({
  agentFindings,
  title = "Agent Execution Results",
  className
}: AgentFindingsDisplayProps) {
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  if (!agentFindings || agentFindings.length === 0) {
    return null;
  }

  const toggleExpanded = (agentId: string) => {
    setExpandedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const completedCount = agentFindings.filter(f => f.status === 'completed').length;

  return (
    <Card className={cn("border-green-500/30 bg-green-50/50 dark:bg-green-950/20", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-green-600" />
          {title}
          <Badge variant="outline" className="ml-2 text-green-600 border-green-500">
            {completedCount}/{agentFindings.length} completed
          </Badge>
        </CardTitle>
        <CardDescription>
          Results from AI agent analysis - dynamically rendered for any document type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {agentFindings.map((finding) => {
            const isExpanded = expandedAgents.has(finding.agentId);
            const providerConfig = PROVIDER_CONFIG[finding.provider || 'default'] || PROVIDER_CONFIG.default;
            const findingsEntries = Object.entries(finding.findings || {}).filter(
              ([key]) => !['error', 'message'].includes(key.toLowerCase())
            );

            return (
              <Collapsible
                key={finding.agentId}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(finding.agentId)}
              >
                <div
                  className={cn(
                    "rounded-lg border transition-all",
                    finding.status === 'completed' 
                      ? 'bg-background border-green-200 dark:border-green-800' 
                      : finding.status === 'failed'
                      ? 'bg-destructive/10 border-destructive/30'
                      : 'bg-muted border-border'
                  )}
                >
                  {/* Header - Always Visible */}
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(finding.status)}
                          <span className="font-medium">{finding.agentName}</span>
                          
                          {/* AI Provider Badge */}
                          {finding.aiPowered && (
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px]", providerConfig.color)}
                            >
                              {providerConfig.icon} {finding.model || providerConfig.label}
                            </Badge>
                          )}
                          
                          {/* Data Source Badge */}
                          {finding.dataSource && !finding.aiPowered && (
                            <Badge variant="secondary" className="text-[10px]">
                              📊 {finding.dataSource}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Execution Time */}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {finding.executionTimeMs}ms
                          </span>
                          
                          {/* Confidence */}
                          <Badge 
                            variant={finding.confidence > 0.8 ? 'default' : 'secondary'}
                            className="text-[10px]"
                          >
                            {(finding.confidence * 100).toFixed(0)}%
                          </Badge>
                          
                          {/* Expand Icon */}
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      {/* Summary (if available) */}
                      {finding.summary && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {finding.summary}
                        </p>
                      )}
                      
                      {/* Alerts Preview */}
                      {finding.alerts && finding.alerts.length > 0 && !isExpanded && (
                        <div className="flex items-center gap-2 mt-2">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-amber-600">
                            {finding.alerts.length} alert(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </CollapsibleTrigger>

                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t border-border/50">
                      {/* Dynamic Findings */}
                      {findingsEntries.length > 0 && (
                        <div className="mt-3 space-y-3">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Findings
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {findingsEntries.map(([key, value]) => (
                              <div 
                                key={key} 
                                className="p-3 rounded-lg bg-muted/50 border border-border/50"
                              >
                                <div className="text-xs font-medium text-primary mb-1 capitalize">
                                  {formatKey(key)}
                                </div>
                                <div className="text-sm">
                                  {renderValue(value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Recommendations */}
                      {finding.recommendations && finding.recommendations.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Recommendations
                          </div>
                          <ul className="space-y-1">
                            {finding.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Sparkles className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Alerts */}
                      {finding.alerts && finding.alerts.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Alerts
                          </div>
                          {finding.alerts.map((alert, idx) => (
                            <Alert 
                              key={idx} 
                              className={cn(
                                "py-2",
                                alert.level === 'error' ? 'border-destructive bg-destructive/10' :
                                alert.level === 'warning' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' :
                                'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                              )}
                            >
                              <AlertDescription className="text-sm flex items-center gap-2">
                                {alert.level === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                                {alert.level === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                {alert.level === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                                {alert.message}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                      
                      {/* Execution Metadata */}
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Executed: {new Date(finding.timestamp).toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                          {finding.provider && (
                            <span className="flex items-center gap-1">
                              <Cpu className="h-3 w-3" /> Provider: {finding.provider}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentFindingsDisplay;
