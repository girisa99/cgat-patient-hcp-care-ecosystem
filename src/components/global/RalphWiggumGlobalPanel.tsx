/**
 * Ralph Wiggum Global Floating Panel
 * Dev-only UI/UX review panel with auto-analysis
 * Draggable and consolidated - single unified panel
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Bug,
  X,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Map,
  Trash2,
  Copy,
  GripVertical,
  Sparkles,
  Loader2,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useRalphWiggumGlobal, FindingStatus, FindingType, RalphFinding } from '@/contexts/RalphWiggumContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// DEV-ONLY check
const isDev = import.meta.env.DEV;

// Status colors and icons
const statusConfig: Record<FindingStatus, { color: string; icon: React.ReactNode; label: string }> = {
  new: { color: 'bg-blue-500', icon: <AlertCircle className="h-3 w-3" />, label: 'New' },
  acknowledged: { color: 'bg-yellow-500', icon: <CheckCircle className="h-3 w-3" />, label: 'Ack' },
  in_progress: { color: 'bg-orange-500', icon: <RefreshCw className="h-3 w-3" />, label: 'WIP' },
  fixed: { color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" />, label: 'Fixed' },
  verified: { color: 'bg-emerald-600', icon: <CheckCircle className="h-3 w-3" />, label: 'Done' },
  wont_fix: { color: 'bg-gray-500', icon: <X className="h-3 w-3" />, label: 'Skip' },
  duplicate: { color: 'bg-purple-500', icon: <Copy className="h-3 w-3" />, label: 'Dup' }
};

const typeConfig: Record<FindingType, { color: string; icon: React.ReactNode; label: string }> = {
  critical: { color: 'text-red-500', icon: <AlertCircle className="h-4 w-4" />, label: 'Critical' },
  warning: { color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4" />, label: 'Warning' },
  suggestion: { color: 'text-blue-500', icon: <Lightbulb className="h-4 w-4" />, label: 'Suggestion' },
  journey: { color: 'text-purple-500', icon: <Map className="h-4 w-4" />, label: 'Journey' }
};

// Page route display names
const pageNames: Record<string, string> = {
  '/genie-studio': 'Genie Studio',
  '/genie-vibe': 'Genie Vibe',
  '/genie-spark': 'Genie Spark',
  '/genie-mind': 'Genie Mind',
  '/genie-arc': 'Genie Arc',
  '/production-hub': 'Production Hub',
  '/agents': 'Agents',
  '/admin': 'Admin',
  '/dashboard': 'Dashboard'
};

interface FindingCardProps {
  finding: RalphFinding;
  onStatusChange: (status: FindingStatus) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const FindingCard: React.FC<FindingCardProps> = ({ 
  finding, 
  onStatusChange, 
  onDelete,
  isExpanded,
  onToggleExpand 
}) => {
  const typeInfo = typeConfig[finding.finding_type];
  const statusInfo = statusConfig[finding.status];
  
  return (
    <div className="border rounded-lg p-2 bg-card hover:bg-accent/5 transition-colors text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className={typeInfo.color}>{typeInfo.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-medium text-xs truncate max-w-[200px]">{finding.title}</h4>
              <Badge variant="outline" className={`${statusInfo.color} text-white text-[10px] px-1 py-0 h-4`}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 shrink-0"
          onClick={onToggleExpand}
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t space-y-2">
              <p className="text-xs text-muted-foreground">{finding.description}</p>
              
              {finding.recommendation && (
                <div className="bg-muted/50 rounded p-1.5">
                  <p className="text-[10px] text-muted-foreground">{finding.recommendation}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between gap-2">
                <Select
                  value={finding.status}
                  onValueChange={(value) => onStatusChange(value as FindingStatus)}
                >
                  <SelectTrigger className="h-6 text-[10px] w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] text-destructive hover:text-destructive px-2"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RalphWiggumGlobalPanel: React.FC = () => {
  const location = useLocation();
  const {
    findings,
    isLoading,
    isPanelOpen,
    togglePanel,
    closePanel,
    refreshFindings,
    updateFindingStatus,
    deleteFinding,
    exportFindings,
    addFinding,
    stats
  } = useRalphWiggumGlobal();
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FindingType | 'all'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const hasAutoAnalyzed = useRef(false);
  
  // Drag controls for the panel
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  // Don't render in production
  if (!isDev) return null;
  
  const currentRoute = location.pathname;
  const currentPageName = pageNames[currentRoute] || currentRoute;
  
  // Filter findings for current page
  const currentPageFindings = useMemo(() => {
    let result = findings.filter(f => f.page_route === currentRoute);
    if (filterType !== 'all') {
      result = result.filter(f => f.finding_type === filterType);
    }
    return result;
  }, [findings, currentRoute, filterType]);
  
  // Run AI analysis for current page
  const runAnalysis = useCallback(async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    
    try {
      const prompt = `You are Ralph Wiggum, a friendly UI/UX reviewer for a healthcare SaaS application.
Analyze this page and provide specific, actionable feedback.

Page Route: ${currentRoute}
Page Name: ${currentPageName}
Current Time: ${new Date().toISOString()}

Analyze the page for:
- Accessibility issues (WCAG compliance)
- UX flow problems
- Missing error states or empty states
- Loading state issues
- Navigation confusion
- Mobile responsiveness
- Healthcare compliance (HIPAA considerations)
- Content clarity and readability

Provide your analysis in this JSON format:
{
  "criticalIssues": [{"title": "Short title", "description": "Detailed description", "recommendation": "How to fix"}],
  "warnings": [{"title": "...", "description": "...", "recommendation": "..."}],
  "suggestions": [{"title": "...", "description": "...", "recommendation": "..."}],
  "journeyImprovements": [{"title": "...", "description": "...", "recommendation": "..."}]
}

Be specific and helpful. Include 2-5 items total. Only include actual potential issues.`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          prompt,
          systemPrompt: 'You are Ralph Wiggum, a helpful UI/UX reviewer. Respond ONLY with valid JSON.',
          model: 'gemini-2.0-flash',
          maxTokens: 2000
        }
      });

      if (error) {
        toast.error('Analysis failed: ' + error.message);
        return;
      }

      // Parse response
      const responseText = data?.response || data?.text || data?.content || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        toast.error('Could not parse AI response');
        return;
      }

      const result = JSON.parse(jsonMatch[0]);
      let addedCount = 0;

      // Add findings to database
      const addFindings = async (
        items: Array<{ title: string; description: string; recommendation?: string }>, 
        type: FindingType, 
        severity: 'high' | 'medium' | 'low'
      ) => {
        for (const item of items || []) {
          await addFinding({
            finding_hash: '',
            page_route: currentRoute,
            module_name: currentPageName,
            finding_type: type,
            severity,
            title: item.title,
            description: item.description,
            recommendation: item.recommendation,
            status: 'new',
            ai_confidence: 0.85,
            ai_model_used: 'gemini-2.0-flash',
            raw_ai_response: data,
            page_content_snapshot: { route: currentRoute },
            user_flow_snapshot: { timestamp: Date.now() }
          });
          addedCount++;
        }
      };

      await addFindings(result.criticalIssues, 'critical', 'high');
      await addFindings(result.warnings, 'warning', 'medium');
      await addFindings(result.suggestions, 'suggestion', 'low');
      await addFindings(result.journeyImprovements, 'journey', 'medium');

      toast.success(`🐛 Found ${addedCount} items to review`);
      await refreshFindings();
    } catch (error) {
      console.error('Ralph Wiggum analysis error:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentRoute, currentPageName, isAnalyzing, addFinding, refreshFindings]);
  
  // Auto-analyze when panel opens on a new page
  useEffect(() => {
    if (isPanelOpen && !hasAutoAnalyzed.current && currentPageFindings.length === 0) {
      hasAutoAnalyzed.current = true;
      const timer = setTimeout(() => {
        runAnalysis();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPanelOpen, currentPageFindings.length, runAnalysis]);
  
  // Reset auto-analyze flag when route changes
  useEffect(() => {
    hasAutoAnalyzed.current = false;
  }, [currentRoute]);
  
  // Export to Lovable format
  const handleShareToLovable = useCallback(async () => {
    const activeFindings = currentPageFindings.filter(f => f.status === 'new' || f.status === 'acknowledged');
    
    if (activeFindings.length === 0) {
      toast.error('No active findings to share');
      return;
    }
    
    let prompt = `## Ralph Wiggum Review - ${currentPageName}\n\n`;
    prompt += `Please implement these UI/UX improvements:\n\n`;
    
    const critical = activeFindings.filter(f => f.finding_type === 'critical');
    const warnings = activeFindings.filter(f => f.finding_type === 'warning');
    const suggestions = activeFindings.filter(f => f.finding_type === 'suggestion');
    
    if (critical.length > 0) {
      prompt += `### 🚨 Critical Issues\n`;
      critical.forEach((f, i) => {
        prompt += `${i + 1}. **${f.title}**: ${f.description}\n`;
        if (f.recommendation) prompt += `   - Fix: ${f.recommendation}\n`;
      });
      prompt += '\n';
    }
    
    if (warnings.length > 0) {
      prompt += `### ⚠️ Warnings\n`;
      warnings.forEach((f, i) => {
        prompt += `${i + 1}. **${f.title}**: ${f.description}\n`;
        if (f.recommendation) prompt += `   - Fix: ${f.recommendation}\n`;
      });
      prompt += '\n';
    }
    
    if (suggestions.length > 0) {
      prompt += `### 💡 Suggestions\n`;
      suggestions.forEach((f, i) => {
        prompt += `${i + 1}. **${f.title}**: ${f.description}\n`;
        if (f.recommendation) prompt += `   - Fix: ${f.recommendation}\n`;
      });
    }
    
    await navigator.clipboard.writeText(prompt);
    toast.success('Copied to clipboard! Paste in Lovable chat', { icon: '✨' });
  }, [currentPageFindings, currentPageName]);
  
  // Export as markdown file
  const handleExportMD = useCallback(async () => {
    const content = await exportFindings('markdown');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ralph-wiggum-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded report');
  }, [exportFindings]);
  
  // Floating toggle button - positioned on LEFT to avoid Ask Genie
  const ToggleButton = (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 left-6 z-[9999]"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={togglePanel}
              className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
            >
              <Bug className="h-6 w-6 text-white" />
              {stats.byStatus.new > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.byStatus.new}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Ralph Wiggum (Dev)</p>
            <p className="text-xs text-muted-foreground">{stats.total} findings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
  
  if (!isPanelOpen) {
    return ToggleButton;
  }
  
  return (
    <>
      {/* Drag constraints container */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9997]" />
      
      {ToggleButton}
      
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        initial={{ x: 0, y: 0, opacity: 0, scale: 0.9 }}
        animate={{ x: dragPosition.x, y: dragPosition.y, opacity: 1, scale: 1 }}
        onDragEnd={(_, info) => {
          setDragPosition(prev => ({
            x: prev.x + info.offset.x,
            y: prev.y + info.offset.y
          }));
        }}
        className="fixed bottom-20 left-6 z-[9998] w-80 pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        <Card className="shadow-xl border overflow-hidden">
          {/* Header - Draggable */}
          <CardHeader 
            className="py-2 px-3 bg-gradient-to-r from-yellow-400 to-orange-500 cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <GripVertical className="h-3 w-3 text-white/70" />
                <Bug className="h-4 w-4 text-white" />
                <CardTitle className="text-xs text-white">Ralph Wiggum</CardTitle>
                <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                  {currentPageFindings.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-white hover:bg-white/20"
                onClick={closePanel}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-[10px] text-white/80 mt-0.5">📍 {currentPageName}</p>
          </CardHeader>
          
          <CardContent className="p-2 space-y-2">
            {/* Action Buttons */}
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs"
                onClick={runAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2"
                onClick={refreshFindings}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {/* Filter */}
            <Select value={filterType} onValueChange={(v) => setFilterType(v as FindingType | 'all')}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types ({currentPageFindings.length})</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    <span className="flex items-center gap-1">
                      {config.icon} {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Findings List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-1.5 pr-2">
                {isAnalyzing && currentPageFindings.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                    <p className="text-xs">Analyzing page...</p>
                  </div>
                )}
                
                {!isAnalyzing && currentPageFindings.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Bug className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No findings yet</p>
                    <p className="text-[10px]">Click Analyze to review</p>
                  </div>
                )}
                
                {currentPageFindings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onStatusChange={(status) => updateFindingStatus(finding.id, status)}
                    onDelete={() => deleteFinding(finding.id)}
                    isExpanded={expandedId === finding.id}
                    onToggleExpand={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
                  />
                ))}
              </div>
            </ScrollArea>
            
            {/* Export Actions */}
            <div className="flex gap-1.5 pt-1 border-t">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs"
                onClick={handleExportMD}
              >
                <Download className="h-3 w-3 mr-1" />
                Export MD
              </Button>
              <Button
                size="sm"
                className="flex-1 h-7 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                onClick={handleShareToLovable}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Share to Lovable
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default RalphWiggumGlobalPanel;
