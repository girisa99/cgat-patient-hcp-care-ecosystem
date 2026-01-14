/**
 * RalphWiggumPanel - Automated AI Review Panel for Genie Studio
 * DEV-ONLY: Displays review insights, findings, and journey analysis
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  X,
  Download,
  RefreshCw,
  Settings,
  Pause,
  Play,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  MapPin,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { 
  ReviewResult, 
  ReviewFinding, 
  ReviewSeverity, 
  GenieModule,
  RalphWiggumConfig,
  ModuleContent
} from './types';

// DEV-ONLY check
const isDev = import.meta.env.DEV;

interface RalphWiggumPanelProps {
  currentReview: ReviewResult | null;
  isReviewing: boolean;
  config: RalphWiggumConfig;
  onTriggerReview: (module: GenieModule, content: any) => void;
  onClearReview: () => void;
  onUpdateConfig: (updates: Partial<RalphWiggumConfig>) => void;
  onPauseAutoReview: () => void;
  onResumeAutoReview: () => void;
  onExportReport: () => string;
  className?: string;
}

// Severity icon mapping
const severityIcons: Record<ReviewSeverity, React.ReactNode> = {
  critical: <AlertCircle className="h-4 w-4 text-destructive" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  suggestion: <Lightbulb className="h-4 w-4 text-blue-500" />,
  info: <Info className="h-4 w-4 text-muted-foreground" />
};

// Severity colors
const severityColors: Record<ReviewSeverity, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suggestion: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  info: 'bg-muted text-muted-foreground border-muted'
};

// Module display names
const moduleNames: Record<GenieModule, string> = {
  spark: 'Spark',
  mind: 'Mind',
  vibe: 'Vibe',
  guided: 'Guided',
  agents: 'Agents',
  'ask-genie': 'Ask Genie',
  arc: 'Arc',
  dashboard: 'Dashboard'
};

/**
 * Individual finding card
 */
const FindingCard: React.FC<{ finding: ReviewFinding; isExpanded: boolean; onToggle: () => void }> = ({ 
  finding, 
  isExpanded, 
  onToggle 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className={cn(
      "border rounded-lg p-3 cursor-pointer transition-all",
      severityColors[finding.severity]
    )}
    onClick={onToggle}
  >
    <div className="flex items-start gap-2">
      {severityIcons[finding.severity]}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{finding.title}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          )}
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-xs mt-2 opacity-80">{finding.description}</p>
              
              {finding.location && (
                <div className="flex items-center gap-1 mt-2 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span>{finding.location}</span>
                </div>
              )}
              
              {finding.suggestion && (
                <div className="mt-2 p-2 bg-background/50 rounded text-xs">
                  <span className="font-medium">💡 Suggestion: </span>
                  {finding.suggestion}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </motion.div>
);

/**
 * Journey analysis section
 */
const JourneyAnalysisSection: React.FC<{ journeyAnalysis: ReviewResult['journeyAnalysis'] }> = ({ 
  journeyAnalysis 
}) => {
  if (!journeyAnalysis) return null;
  
  return (
    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <Route className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Journey Analysis</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>Current Stage</span>
          <Badge variant="outline" className="text-xs">
            {journeyAnalysis.currentStage}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>Completion</span>
            <span>{journeyAnalysis.completionPercentage}%</span>
          </div>
          <Progress value={journeyAnalysis.completionPercentage} className="h-1.5" />
        </div>
        
        {journeyAnalysis.expectedNextStages.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Next Steps:</span>
            <div className="flex flex-wrap gap-1">
              {journeyAnalysis.expectedNextStages.map((stage, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {stage}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {journeyAnalysis.potentialBlockers.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-amber-500">⚠️ Potential Blockers:</span>
            <ul className="text-xs space-y-0.5 pl-4">
              {journeyAnalysis.potentialBlockers.map((blocker, i) => (
                <li key={i} className="list-disc">{blocker}</li>
              ))}
            </ul>
          </div>
        )}
        
        {journeyAnalysis.recommendations.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-green-500">✨ Recommendations:</span>
            <ul className="text-xs space-y-0.5 pl-4">
              {journeyAnalysis.recommendations.map((rec, i) => (
                <li key={i} className="list-disc">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main Ralph Wiggum Panel Component
 */
export const RalphWiggumPanel: React.FC<RalphWiggumPanelProps> = ({
  currentReview,
  isReviewing,
  config,
  onTriggerReview,
  onClearReview,
  onUpdateConfig,
  onPauseAutoReview,
  onResumeAutoReview,
  onExportReport,
  className
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  
  // Don't render in production
  if (!isDev) return null;
  
  const toggleFinding = useCallback((id: string) => {
    setExpandedFindings(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);
  
  const handleExport = useCallback(() => {
    const report = onExportReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ralph-wiggum-review-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [onExportReport]);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "fixed bottom-4 right-4 z-50",
        isMinimized ? "w-auto" : "w-80",
        className
      )}
    >
      <Card className="border-primary/20 shadow-lg bg-background/95 backdrop-blur-sm">
        {/* Header */}
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              {!isMinimized && (
                <div>
                  <CardTitle className="text-sm">Ralph Wiggum</CardTitle>
                  <p className="text-xs text-muted-foreground">AI Review (Dev Only)</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                  {currentReview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleExport}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Content */}
        {!isMinimized && (
          <CardContent className="p-3 pt-0 space-y-3">
            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 p-2 bg-muted/30 rounded-lg text-xs">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Auto Review</Label>
                      <Switch
                        checked={config.autoReview}
                        onCheckedChange={(checked) => 
                          checked ? onResumeAutoReview() : onPauseAutoReview()
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Silent Mode</Label>
                      <Switch
                        checked={config.silentMode}
                        onCheckedChange={(checked) => 
                          onUpdateConfig({ silentMode: checked })
                        }
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rate Limit: {config.rateLimitPerMinute}/min
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Status */}
            {isReviewing && (
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs">Analyzing content...</span>
              </div>
            )}
            
            {/* Review Results */}
            {currentReview && !isReviewing && (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3">
                  {/* Summary */}
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {moduleNames[currentReview.module]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {currentReview.findings.length} findings
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {currentReview.summary.criticalCount > 0 && (
                        <Badge variant="destructive" className="text-xs h-5 px-1.5">
                          {currentReview.summary.criticalCount}
                        </Badge>
                      )}
                      {currentReview.summary.warningCount > 0 && (
                        <Badge className="text-xs h-5 px-1.5 bg-amber-500">
                          {currentReview.summary.warningCount}
                        </Badge>
                      )}
                      {currentReview.summary.suggestionCount > 0 && (
                        <Badge className="text-xs h-5 px-1.5 bg-blue-500">
                          {currentReview.summary.suggestionCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Journey Analysis */}
                  {currentReview.journeyAnalysis && (
                    <JourneyAnalysisSection journeyAnalysis={currentReview.journeyAnalysis} />
                  )}
                  
                  {/* Findings */}
                  {currentReview.findings.length > 0 ? (
                    <div className="space-y-2">
                      {currentReview.findings.map(finding => (
                        <FindingCard
                          key={finding.id}
                          finding={finding}
                          isExpanded={expandedFindings.has(finding.id)}
                          onToggle={() => toggleFinding(finding.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 p-4 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm">All looks good!</span>
                    </div>
                  )}
                  
                  {/* Clear button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={onClearReview}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear Review
                  </Button>
                </div>
              </ScrollArea>
            )}
            
            {/* Empty State */}
            {!currentReview && !isReviewing && (
              <div className="text-center py-4 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No active review</p>
                <p className="text-xs opacity-60">Content will be auto-analyzed</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default RalphWiggumPanel;
