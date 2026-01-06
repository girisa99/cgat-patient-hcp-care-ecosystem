/**
 * Agent Findings Panel
 * Displays agent execution results attached to processed documents
 * Shows provider/model info for Universal AI powered agents
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Clock,
  Sparkles,
  Info,
  Cpu,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentFinding } from './SmartDocumentStudio';

interface AgentFindingsPanelProps {
  findings: AgentFinding[];
  onRerunAgent: (agentId: string) => void;
  onRunAdditionalAgent?: () => void;
  onExportFindings?: () => void;
}

export function AgentFindingsPanel({
  findings,
  onRerunAgent,
  onRunAdditionalAgent,
  onExportFindings
}: AgentFindingsPanelProps) {
  const [expandedAgents, setExpandedAgents] = useState<string[]>(
    findings.filter(f => f.alerts && f.alerts.length > 0).map(f => f.agentId)
  );

  const toggleExpand = (agentId: string) => {
    setExpandedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-3 w-3 text-amber-500" />;
      default: return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getAlertBg = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
      case 'warning': return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800';
      default: return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
    }
  };

  const getProviderColor = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'claude': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300';
      case 'gemini': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300';
      case 'openai': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const formatProviderName = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'claude': return 'Claude';
      case 'gemini': return 'Gemini';
      case 'openai': return 'OpenAI';
      default: return provider || 'Unknown';
    }
  };

  if (findings.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-6 text-center">
          <Bot className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No agent findings yet</p>
          {onRunAdditionalAgent && (
            <Button variant="outline" size="sm" className="mt-3" onClick={onRunAdditionalAgent}>
              <Sparkles className="h-4 w-4 mr-2" />
              Run Agent
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Agent Findings
          <Badge variant="secondary">{findings.length}</Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          {onExportFindings && (
            <Button variant="ghost" size="sm" onClick={onExportFindings}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}
          {onRunAdditionalAgent && (
            <Button variant="outline" size="sm" onClick={onRunAdditionalAgent}>
              <Sparkles className="h-4 w-4 mr-1" />
              Run More
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {findings.map((finding) => (
          <Collapsible
            key={finding.agentId}
            open={expandedAgents.includes(finding.agentId)}
            onOpenChange={() => toggleExpand(finding.agentId)}
          >
            <div className={cn(
              "rounded-lg border transition-all",
              finding.alerts && finding.alerts.some(a => a.level === 'error') && "border-red-200 dark:border-red-800",
              finding.alerts && finding.alerts.some(a => a.level === 'warning') && !finding.alerts.some(a => a.level === 'error') && "border-amber-200 dark:border-amber-800"
            )}>
              {/* Agent Header */}
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 rounded-t-lg">
                  {getStatusIcon(finding.status)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{finding.agentName}</span>
                      
                      {/* AI Powered Badge with Provider */}
                      {finding.aiPowered && (
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px]", getProviderColor(finding.provider))}
                        >
                          <Cpu className="h-2.5 w-2.5 mr-0.5" />
                          {formatProviderName(finding.provider)}
                        </Badge>
                      )}
                      
                      {/* Data Source Badge */}
                      {finding.dataSource && !finding.aiPowered && (
                        <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-300">
                          <Database className="h-2.5 w-2.5 mr-0.5" />
                          API
                        </Badge>
                      )}
                      
                      {finding.alerts && finding.alerts.length > 0 && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px]",
                            finding.alerts.some(a => a.level === 'error') && "bg-red-100 text-red-700 border-red-200",
                            finding.alerts.some(a => a.level === 'warning') && !finding.alerts.some(a => a.level === 'error') && "bg-amber-100 text-amber-700 border-amber-200"
                          )}
                        >
                          {finding.alerts.length} alert{finding.alerts.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{Math.round(finding.confidence * 100)}% confidence</span>
                      <span>•</span>
                      <span>{finding.executionTimeMs}ms</span>
                      {finding.model && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] opacity-75">{finding.model}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRerunAgent(finding.agentId);
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>

                  {expandedAgents.includes(finding.agentId) ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>

              {/* Expanded Content */}
              <CollapsibleContent>
                <div className="px-3 pb-3 pt-0 space-y-3 border-t">
                  {/* Summary */}
                  {finding.summary && (
                    <div className="mt-3 p-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">{finding.summary}</p>
                    </div>
                  )}

                  {/* Data Source Info */}
                  {finding.dataSource && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Database className="h-3 w-3" />
                      <span>Source: {finding.dataSource}</span>
                    </div>
                  )}

                  {/* Alerts */}
                  {finding.alerts && finding.alerts.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {finding.alerts.map((alert, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-start gap-2 p-2 rounded-lg border text-sm",
                            getAlertBg(alert.level)
                          )}
                        >
                          {getAlertIcon(alert.level)}
                          <span className="flex-1">{alert.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {finding.recommendations && finding.recommendations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {finding.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Findings Details */}
                  {Object.keys(finding.findings).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {Object.entries(finding.findings).slice(0, 8).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                          <span className="ml-1 font-medium">
                            {typeof value === 'boolean' 
                              ? (value ? '✓ Yes' : '✗ No')
                              : typeof value === 'object'
                              ? JSON.stringify(value).slice(0, 30) + '...'
                              : String(value).slice(0, 50)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}

export default AgentFindingsPanel;
