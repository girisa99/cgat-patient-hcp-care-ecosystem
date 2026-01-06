/**
 * Agent Findings Panel - Genie Spark Style
 * Enhanced display with Universal AI provider info, motion animations,
 * Genie-style avatars, and polished conversational UI
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
  Database,
  Zap,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentFinding } from './SmartDocumentStudio';

interface AgentFindingsPanelProps {
  findings: AgentFinding[];
  onRerunAgent: (agentId: string) => void;
  onRunAdditionalAgent?: () => void;
  onExportFindings?: () => void;
}

// Provider icons and colors - matching Universal AI providers
const PROVIDER_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; bgClass: string; textClass: string }> = {
  claude: {
    icon: <Brain className="h-3 w-3" />,
    gradient: 'from-orange-400 via-amber-400 to-yellow-500',
    bgClass: 'bg-orange-100 dark:bg-orange-900/50',
    textClass: 'text-orange-700 dark:text-orange-300'
  },
  gemini: {
    icon: <Sparkles className="h-3 w-3" />,
    gradient: 'from-blue-400 via-indigo-400 to-purple-500',
    bgClass: 'bg-blue-100 dark:bg-blue-900/50',
    textClass: 'text-blue-700 dark:text-blue-300'
  },
  openai: {
    icon: <Zap className="h-3 w-3" />,
    gradient: 'from-green-400 via-emerald-400 to-teal-500',
    bgClass: 'bg-green-100 dark:bg-green-900/50',
    textClass: 'text-green-700 dark:text-green-300'
  },
  api: {
    icon: <Database className="h-3 w-3" />,
    gradient: 'from-slate-400 via-gray-400 to-zinc-500',
    bgClass: 'bg-slate-100 dark:bg-slate-900/50',
    textClass: 'text-slate-700 dark:text-slate-300'
  }
};

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

  const getProviderConfig = (provider?: string, aiPowered?: boolean) => {
    if (!aiPowered) return PROVIDER_CONFIG.api;
    return PROVIDER_CONFIG[provider?.toLowerCase() || 'openai'] || PROVIDER_CONFIG.openai;
  };

  const formatProviderName = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'claude': return 'Claude';
      case 'gemini': return 'Gemini';
      case 'openai': return 'OpenAI';
      default: return provider || 'Universal AI';
    }
  };

  if (findings.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-dashed">
        <CardContent className="py-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Genie-style Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-1 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Bot className="h-8 w-8 text-cyan-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No agent findings yet</p>
              <p className="text-xs text-muted-foreground">Run agents to analyze this document</p>
            </div>
            {onRunAdditionalAgent && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50"
                onClick={onRunAdditionalAgent}
              >
                <Sparkles className="h-4 w-4 mr-2 text-cyan-500" />
                Run Agents
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 bg-gradient-to-r from-muted/50 to-transparent flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-0.5">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <Bot className="h-3 w-3 text-cyan-500" />
            </div>
          </div>
          <span>Agent Findings</span>
          <Badge variant="secondary" className="text-xs bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20">
            {findings.length}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          {onExportFindings && (
            <Button variant="ghost" size="sm" onClick={onExportFindings} className="h-7">
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          )}
          {onRunAdditionalAgent && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRunAdditionalAgent}
              className="h-7 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 text-cyan-500" />
              Run More
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 p-3">
        <AnimatePresence mode="popLayout">
          {findings.map((finding, index) => {
            const providerConfig = getProviderConfig(finding.provider, finding.aiPowered);
            
            return (
              <motion.div
                key={finding.agentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Collapsible
                  open={expandedAgents.includes(finding.agentId)}
                  onOpenChange={() => toggleExpand(finding.agentId)}
                >
                  <div className={cn(
                    "rounded-xl border transition-all shadow-sm hover:shadow-md",
                    finding.alerts && finding.alerts.some(a => a.level === 'error') && "border-red-200 dark:border-red-800 shadow-red-500/10",
                    finding.alerts && finding.alerts.some(a => a.level === 'warning') && !finding.alerts.some(a => a.level === 'error') && "border-amber-200 dark:border-amber-800 shadow-amber-500/10",
                    !finding.alerts?.length && "border-border"
                  )}>
                    {/* Agent Header - Genie Spark Style */}
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 rounded-t-xl transition-colors">
                        {/* Provider Avatar with Gradient */}
                        <div className={cn(
                          "w-10 h-10 rounded-full p-0.5 shadow-lg flex-shrink-0",
                          `bg-gradient-to-br ${providerConfig.gradient}`
                        )}>
                          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                            {finding.aiPowered ? (
                              <Cpu className={cn("h-4 w-4", providerConfig.textClass)} />
                            ) : (
                              <Database className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{finding.agentName}</span>
                            
                            {/* Status Icon */}
                            {getStatusIcon(finding.status)}
                            
                            {/* AI Provider Badge */}
                            {finding.aiPowered && (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] font-medium",
                                  providerConfig.bgClass,
                                  providerConfig.textClass,
                                  "border-transparent"
                                )}
                              >
                                {providerConfig.icon}
                                <span className="ml-1">{formatProviderName(finding.provider)}</span>
                              </Badge>
                            )}
                            
                            {/* Data Source Badge for API agents */}
                            {!finding.aiPowered && finding.dataSource && (
                              <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300">
                                <Database className="h-2.5 w-2.5 mr-0.5" />
                                {finding.dataSource.split(' ')[0]}
                              </Badge>
                            )}
                            
                            {/* Alert Count Badge */}
                            {finding.alerts && finding.alerts.length > 0 && (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px]",
                                  finding.alerts.some(a => a.level === 'error') && "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300",
                                  finding.alerts.some(a => a.level === 'warning') && !finding.alerts.some(a => a.level === 'error') && "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300"
                                )}
                              >
                                {finding.alerts.length} alert{finding.alerts.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Metadata Row */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                finding.confidence > 0.8 ? "bg-green-500" : finding.confidence > 0.5 ? "bg-amber-500" : "bg-red-500"
                              )} />
                              {Math.round(finding.confidence * 100)}%
                            </span>
                            <span>•</span>
                            <span>{finding.executionTimeMs}ms</span>
                            {finding.model && (
                              <>
                                <span>•</span>
                                <span className="text-[10px] opacity-75 font-mono">{finding.model}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRerunAgent(finding.agentId);
                          }}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
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
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4 pt-0 space-y-3 border-t"
                      >
                        {/* Summary Card */}
                        {finding.summary && (
                          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border">
                            <p className="text-sm font-medium leading-relaxed">{finding.summary}</p>
                          </div>
                        )}

                        {/* Data Source Info */}
                        {finding.dataSource && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 p-2 rounded-lg bg-muted/30">
                            <Database className="h-3.5 w-3.5" />
                            <span>Data Source: <span className="font-medium text-foreground">{finding.dataSource}</span></span>
                          </div>
                        )}

                        {/* Alerts */}
                        {finding.alerts && finding.alerts.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {finding.alerts.map((alert, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn(
                                  "flex items-start gap-2 p-3 rounded-lg border text-sm",
                                  getAlertBg(alert.level)
                                )}
                              >
                                {getAlertIcon(alert.level)}
                                <span className="flex-1">{alert.message}</span>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Recommendations */}
                        {finding.recommendations && finding.recommendations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Recommendations
                            </p>
                            <ul className="space-y-1.5">
                              {finding.recommendations.map((rec, idx) => (
                                <motion.li
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="text-xs flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10"
                                >
                                  <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Findings Details Grid */}
                        {Object.keys(finding.findings).length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Details</p>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(finding.findings).slice(0, 8).map(([key, value]) => (
                                <div key={key} className="text-xs p-2 rounded-lg bg-muted/30">
                                  <span className="text-muted-foreground block mb-0.5">
                                    {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <span className="font-medium">
                                    {typeof value === 'boolean' 
                                      ? (value ? '✓ Yes' : '✗ No')
                                      : typeof value === 'object'
                                      ? JSON.stringify(value).slice(0, 30) + '...'
                                      : String(value).slice(0, 50)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default AgentFindingsPanel;
