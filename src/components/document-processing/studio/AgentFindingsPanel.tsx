/**
 * Agent Findings Panel
 * Displays agent execution results attached to processed documents
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  AlertCircle,
  Info
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{finding.agentName}</span>
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{Math.round(finding.confidence * 100)}% confidence</span>
                      <span>•</span>
                      <span>{finding.executionTimeMs}ms</span>
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

                  {/* Findings Details */}
                  {Object.keys(finding.findings).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {Object.entries(finding.findings).slice(0, 6).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                          <span className="ml-1 font-medium">
                            {typeof value === 'boolean' 
                              ? (value ? '✓ Yes' : '✗ No')
                              : String(value)}
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
