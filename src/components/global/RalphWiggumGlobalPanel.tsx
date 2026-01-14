/**
 * Ralph Wiggum Global Floating Panel
 * Dev-only UI/UX review panel with auto-analysis
 * Draggable, consolidated, and simplified
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
  Loader2,
  Play,
  Send,
  Filter,
  CheckCheck,
  Maximize2,
  Minimize2
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

// Status colors and icons - clearer visual hierarchy
const statusConfig: Record<FindingStatus, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  new: { color: 'text-blue-600', bgColor: 'bg-blue-500', icon: <AlertCircle className="h-3 w-3" />, label: 'New' },
  acknowledged: { color: 'text-yellow-600', bgColor: 'bg-yellow-500', icon: <CheckCircle className="h-3 w-3" />, label: 'Ack' },
  in_progress: { color: 'text-orange-600', bgColor: 'bg-orange-500', icon: <RefreshCw className="h-3 w-3" />, label: 'WIP' },
  fixed: { color: 'text-green-600', bgColor: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" />, label: 'Fixed' },
  verified: { color: 'text-emerald-600', bgColor: 'bg-emerald-600', icon: <CheckCheck className="h-3 w-3" />, label: 'Done' },
  wont_fix: { color: 'text-gray-500', bgColor: 'bg-gray-500', icon: <X className="h-3 w-3" />, label: 'Skip' },
  duplicate: { color: 'text-purple-500', bgColor: 'bg-purple-500', icon: <Copy className="h-3 w-3" />, label: 'Dup' }
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
              <h4 className="font-medium text-xs truncate max-w-[180px]">{finding.title}</h4>
              <Badge 
                variant="outline" 
                className={`${statusInfo.bgColor} text-white text-[10px] px-1 py-0 h-4 border-0`}
              >
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
                  <p className="text-[10px] font-medium text-muted-foreground">💡 {finding.recommendation}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between gap-2">
                <Select
                  value={finding.status}
                  onValueChange={(value) => onStatusChange(value as FindingStatus)}
                >
                  <SelectTrigger className="h-6 text-[10px] w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        <span className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${config.bgColor}`} />
                          {config.label}
                        </span>
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
    stats,
    activeOverlay
  } = useRalphWiggumGlobal();
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FindingType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FindingStatus | 'all' | 'active'>('active');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyContent, setCopyContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoAnalyzed = useRef(false);
  
  // Drag controls for the panel
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  // Don't render in production
  if (!isDev) return null;
  
  const currentRoute = location.pathname;
  
  // Parse overlay - now includes product context (e.g., "ask-genie:studio")
  const isAskGenieActive = activeOverlay?.startsWith('ask-genie');
  const overlayProduct = isAskGenieActive ? activeOverlay?.split(':')[1] : null;
  const overlayLabel = isAskGenieActive 
    ? ` + Ask Genie (${overlayProduct})` 
    : activeOverlay 
      ? ` + ${activeOverlay}` 
      : '';
  const currentPageName = (pageNames[currentRoute] || currentRoute) + overlayLabel;
  
  // Filter findings moved below after runAnalysis to include activeOverlay
  
  // Count by status for current page
  const statusCounts = useMemo(() => {
    const pageFindings = findings.filter(f => f.page_route === currentRoute);
    const counts: Record<string, number> = { active: 0 };
    
    pageFindings.forEach(f => {
      counts[f.status] = (counts[f.status] || 0) + 1;
      if (['new', 'acknowledged', 'in_progress'].includes(f.status)) {
        counts.active++;
      }
    });
    
    return counts;
  }, [findings, currentRoute]);
  
  // Run AI analysis for current page
  const runAnalysis = useCallback(async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    
    // Parse overlay info - now includes product context (e.g., "ask-genie:studio")
    const isAskGenieOverlay = activeOverlay?.startsWith('ask-genie');
    const overlayProduct = isAskGenieOverlay ? activeOverlay?.split(':')[1] || 'unknown' : null;
    
    // Determine analysis context - include overlay if active
    const analysisTarget = activeOverlay 
      ? `${currentPageName} (with Ask Genie open on ${overlayProduct})`
      : currentPageName;
    
    const overlayContext = isAskGenieOverlay 
      ? `\n\nACTIVE OVERLAY: Ask Genie (AI Chat Assistant) on ${overlayProduct} product
Focus on analyzing the Ask Genie chat interface specifically:
- Chat input field usability and keyboard accessibility
- Message display and readability (font sizes, contrast)
- Response loading states and animations
- Conversation history management and scrolling
- Help suggestions visibility and relevance
- Error handling for AI responses (timeouts, failures)
- Accessibility of chat interface (ARIA labels, focus management)
- Mobile responsiveness of the floating chat overlay
- Context-awareness for the ${overlayProduct} product
- Quick action buttons and their discoverability` 
      : '';
    
    try {
      const prompt = `You are Ralph Wiggum, a friendly UI/UX reviewer for a healthcare SaaS application.
Analyze this page and provide specific, actionable feedback.

Page Route: ${currentRoute}
Page Name: ${analysisTarget}
Current Time: ${new Date().toISOString()}${overlayContext}

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

      // Add findings to database - use overlay-specific module name if applicable
      const basePageName = pageNames[currentRoute] || currentRoute;
      const moduleName = isAskGenieOverlay 
        ? `${basePageName} / Ask Genie (${overlayProduct})`
        : activeOverlay 
          ? `${basePageName} / ${activeOverlay}`
          : basePageName;
      
      const addFindings = async (
        items: Array<{ title: string; description: string; recommendation?: string }>, 
        type: FindingType, 
        severity: 'high' | 'medium' | 'low'
      ) => {
        for (const item of items || []) {
          await addFinding({
            finding_hash: '',
            page_route: activeOverlay ? `${currentRoute}#${activeOverlay}` : currentRoute,
            module_name: moduleName,
            finding_type: type,
            severity,
            title: item.title,
            description: item.description,
            recommendation: item.recommendation,
            status: 'new',
            ai_confidence: 0.85,
            ai_model_used: 'gemini-2.0-flash',
            raw_ai_response: data,
            page_content_snapshot: { route: currentRoute, overlay: activeOverlay },
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
  }, [currentRoute, currentPageName, isAnalyzing, addFinding, refreshFindings, activeOverlay]);
  
  // Auto-analyze when panel opens on a new page with no findings
  // Also re-analyze when overlay becomes active
  useEffect(() => {
    if (isPanelOpen && !hasAutoAnalyzed.current) {
      const routeKey = activeOverlay ? `${currentRoute}#${activeOverlay}` : currentRoute;
      const pageFindings = findings.filter(f => f.page_route === routeKey);
      if (pageFindings.length === 0) {
        hasAutoAnalyzed.current = true;
        const timer = setTimeout(() => {
          runAnalysis();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isPanelOpen, findings, currentRoute, runAnalysis, activeOverlay]);
  
  // Reset auto-analyze flag when route or overlay changes
  useEffect(() => {
    hasAutoAnalyzed.current = false;
  }, [currentRoute, activeOverlay]);
  
  // When Ask Genie opens, trigger analysis if panel is open or show hint
  useEffect(() => {
    if (activeOverlay?.startsWith('ask-genie')) {
      const routeKey = `${currentRoute}#${activeOverlay}`;
      const existingFindings = findings.filter(f => f.page_route === routeKey);
      
      if (import.meta.env.DEV) {
        console.log(`🐛 Ralph Wiggum: Ask Genie detected, overlay="${activeOverlay}", existing findings=${existingFindings.length}`);
      }
      
      // If panel is open and no findings exist, auto-analyze
      if (isPanelOpen && existingFindings.length === 0 && !hasAutoAnalyzed.current) {
        hasAutoAnalyzed.current = true;
        const timer = setTimeout(() => {
          runAnalysis();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [activeOverlay, currentRoute, findings, isPanelOpen, runAnalysis]);
  
  // Filter findings for current page (including overlay-specific findings)
  const currentPageFindings = useMemo(() => {
    const routeKey = activeOverlay ? `${currentRoute}#${activeOverlay}` : currentRoute;
    
    // Include base route, overlay-specific findings, and any Ask Genie findings on this route
    let result = findings.filter(f => {
      // Exact match for base route
      if (f.page_route === currentRoute) return true;
      // Exact match for current overlay
      if (f.page_route === routeKey) return true;
      // If Ask Genie is active, also include all Ask Genie findings for this route
      if (activeOverlay?.startsWith('ask-genie') && f.page_route.startsWith(`${currentRoute}#ask-genie`)) return true;
      return false;
    });
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(f => f.finding_type === filterType);
    }
    
    // Apply status filter
    if (filterStatus === 'active') {
      result = result.filter(f => ['new', 'acknowledged', 'in_progress'].includes(f.status));
    } else if (filterStatus !== 'all') {
      result = result.filter(f => f.status === filterStatus);
    }
    
    return result;
  }, [findings, currentRoute, filterType, filterStatus, activeOverlay]);
  
  // (Old route change effect was merged into the above useEffect)
  
  // Generate Lovable prompt from findings
  const generateLovablePrompt = useCallback(() => {
    const activeFindings = currentPageFindings.filter(
      f => f.status === 'new' || f.status === 'acknowledged'
    );
    
    if (activeFindings.length === 0) {
      return '';
    }
    
    let prompt = `## 🐛 Ralph Wiggum Review - ${currentPageName}\n\n`;
    prompt += `**Route:** \`${currentRoute}\`\n`;
    prompt += `**Findings:** ${activeFindings.length} items\n\n`;
    prompt += `Please implement these UI/UX improvements:\n\n`;
    
    const critical = activeFindings.filter(f => f.finding_type === 'critical');
    const warnings = activeFindings.filter(f => f.finding_type === 'warning');
    const suggestions = activeFindings.filter(f => f.finding_type === 'suggestion');
    const journey = activeFindings.filter(f => f.finding_type === 'journey');
    
    if (critical.length > 0) {
      prompt += `### 🚨 Critical Issues\n`;
      critical.forEach((f, i) => {
        prompt += `${i + 1}. **${f.title}**: ${f.description}\n`;
        if (f.recommendation) prompt += `   - 💡 Fix: ${f.recommendation}\n`;
      });
      prompt += '\n';
    }
    
    if (warnings.length > 0) {
      prompt += `### ⚠️ Warnings\n`;
      warnings.forEach((f, i) => {
        prompt += `${i + 1}. **${f.title}**: ${f.description}\n`;
        if (f.recommendation) prompt += `   - 💡 Fix: ${f.recommendation}\n`;
      });
      prompt += '\n';
    }
    
    if (suggestions.length > 0) {
      prompt += `### 💡 Suggestions\n`;
      suggestions.forEach((f, i) => {
        prompt += `${i + 1}. **${f.title}**: ${f.description}\n`;
        if (f.recommendation) prompt += `   - 💡 Fix: ${f.recommendation}\n`;
      });
      prompt += '\n';
    }
    
    if (journey.length > 0) {
      prompt += `### 🗺️ Journey Improvements\n`;
      journey.forEach((f, i) => {
        prompt += `${i + 1}. **${f.title}**: ${f.description}\n`;
        if (f.recommendation) prompt += `   - 💡 Fix: ${f.recommendation}\n`;
      });
    }
    
    return prompt;
  }, [currentPageFindings, currentPageName, currentRoute]);
  
  // Share to Lovable - opens simple dialog with content
  const handleShareToLovable = useCallback(async () => {
    const activeFindings = currentPageFindings.filter(
      f => f.status === 'new' || f.status === 'acknowledged'
    );
    
    if (activeFindings.length === 0) {
      toast.error('No active (New/Ack) findings to share');
      return;
    }
    
    const prompt = generateLovablePrompt();
    setCopyContent(prompt);
    setShowCopyDialog(true);
    
    // Mark all shared findings as "in_progress"
    for (const finding of activeFindings) {
      await updateFindingStatus(finding.id, 'in_progress', 'lovable-share');
    }
    
    toast.success(`Status updated to WIP for ${activeFindings.length} findings`);
  }, [currentPageFindings, generateLovablePrompt, updateFindingStatus]);
  
  // Select all text in textarea
  const handleSelectAll = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.select();
      toast.success('Selected! Now press Ctrl+C to copy');
    }
  }, []);
  
  // Bulk status update
  const handleBulkStatusUpdate = useCallback(async (newStatus: FindingStatus) => {
    const activeFindings = currentPageFindings.filter(
      f => f.status === 'new' || f.status === 'acknowledged' || f.status === 'in_progress'
    );
    
    if (activeFindings.length === 0) {
      toast.error('No active findings to update');
      return;
    }
    
    for (const finding of activeFindings) {
      await updateFindingStatus(finding.id, newStatus, 'bulk-update');
    }
    
    toast.success(`Updated ${activeFindings.length} findings to ${statusConfig[newStatus].label}`);
  }, [currentPageFindings, updateFindingStatus]);
  
  // Export as markdown file
  const handleExportMD = useCallback(async () => {
    const content = await exportFindings('markdown');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ralph-wiggum-${currentRoute.replace(/\//g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded report');
  }, [exportFindings, currentRoute]);
  
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
            <p className="text-xs text-muted-foreground">{stats.total} findings total</p>
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
        drag={!isExpanded}
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          x: isExpanded ? 0 : dragPosition.x, 
          y: isExpanded ? 0 : dragPosition.y, 
          opacity: 1, 
          scale: 1 
        }}
        onDragEnd={(_, info) => {
          if (!isExpanded) {
            setDragPosition(prev => ({
              x: prev.x + info.offset.x,
              y: prev.y + info.offset.y
            }));
          }
        }}
        className={`fixed z-[9998] pointer-events-auto transition-all duration-300 ${
          isExpanded 
            ? 'inset-4 w-auto' 
            : 'bottom-20 left-6 w-80'
        }`}
        style={{ touchAction: 'none' }}
      >
        <Card className={`shadow-xl border overflow-hidden h-full flex flex-col ${isExpanded ? 'max-h-full' : ''}`}>
          {/* Header - Draggable */}
          <CardHeader 
            className={`py-2 px-3 bg-gradient-to-r from-yellow-400 to-orange-500 ${!isExpanded ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onPointerDown={(e) => !isExpanded && dragControls.start(e)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {!isExpanded && <GripVertical className="h-3 w-3 text-white/70" />}
                <Bug className="h-4 w-4 text-white" />
                <CardTitle className={`text-white ${isExpanded ? 'text-base' : 'text-xs'}`}>
                  Ralph Wiggum
                </CardTitle>
                {isExpanded && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    {currentPageFindings.length} findings
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={closePanel}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className={`text-white/80 mt-0.5 ${isExpanded ? 'text-sm' : 'text-[10px]'}`}>
              📍 {currentPageName}
            </p>
          </CardHeader>
          
          <CardContent className={`space-y-2 flex-1 overflow-hidden flex flex-col ${isExpanded ? 'p-4' : 'p-2'}`}>
            {/* Status Summary Badges */}
            <div className="flex flex-wrap gap-1">
              <Badge 
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                className="text-[10px] cursor-pointer"
                onClick={() => setFilterStatus('active')}
              >
                Active: {statusCounts.active || 0}
              </Badge>
              <Badge 
                variant={filterStatus === 'new' ? 'default' : 'outline'}
                className="text-[10px] cursor-pointer bg-blue-500/10 hover:bg-blue-500/20"
                onClick={() => setFilterStatus('new')}
              >
                New: {statusCounts.new || 0}
              </Badge>
              <Badge 
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                className="text-[10px] cursor-pointer bg-orange-500/10 hover:bg-orange-500/20"
                onClick={() => setFilterStatus('in_progress')}
              >
                WIP: {statusCounts.in_progress || 0}
              </Badge>
              <Badge 
                variant={filterStatus === 'fixed' ? 'default' : 'outline'}
                className="text-[10px] cursor-pointer bg-green-500/10 hover:bg-green-500/20"
                onClick={() => setFilterStatus('fixed')}
              >
                Fixed: {statusCounts.fixed || 0}
              </Badge>
              <Badge 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                className="text-[10px] cursor-pointer"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Badge>
            </div>
            
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
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 h-7 text-xs bg-violet-600 hover:bg-violet-700"
                      onClick={handleShareToLovable}
                      disabled={currentPageFindings.filter(f => f.status === 'new' || f.status === 'acknowledged').length === 0}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Share to Lovable
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Copies all New/Ack findings and marks them WIP</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Bulk Actions */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] flex-1"
                onClick={() => handleBulkStatusUpdate('fixed')}
              >
                <CheckCircle className="h-3 w-3 mr-0.5 text-green-500" />
                Mark All Fixed
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px]"
                onClick={handleExportMD}
              >
                <Download className="h-3 w-3 mr-0.5" />
                Export
              </Button>
            </div>
            
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <Select value={filterType} onValueChange={(v) => setFilterType(v as FindingType | 'all')}>
                <SelectTrigger className="h-6 text-[10px] flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      <span className="flex items-center gap-1">
                        <span className={config.color}>{config.icon}</span>
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Findings List */}
            <ScrollArea className={`flex-1 ${isExpanded ? 'min-h-0' : 'h-[280px]'}`}>
              <div className={`space-y-1.5 pr-2 ${isExpanded ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : ''}`}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8 col-span-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : currentPageFindings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground col-span-full">
                    <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No {filterStatus !== 'all' ? filterStatus : ''} findings</p>
                    <Button 
                      size="sm" 
                      variant="link" 
                      className="text-xs mt-1"
                      onClick={runAnalysis}
                      disabled={isAnalyzing}
                    >
                      Run analysis
                    </Button>
                  </div>
                ) : (
                  currentPageFindings.map(finding => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                      onStatusChange={(status) => updateFindingStatus(finding.id, status)}
                      onDelete={() => deleteFinding(finding.id)}
                      isExpanded={isExpanded || expandedId === finding.id}
                      onToggleExpand={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
            
            {/* Status Legend */}
            <div className="pt-1 border-t">
              <p className="text-[9px] text-muted-foreground text-center">
                New → Ack → WIP → Fixed → Done | After sharing, manually mark as Fixed when implemented
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Simple Copy Dialog - No iframe issues */}
      <AnimatePresence>
        {showCopyDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
            onClick={() => setShowCopyDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-lg">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Copy to Lovable
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={() => setShowCopyDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-3 flex-1 overflow-hidden flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  Select all text below (Ctrl+A), copy (Ctrl+C), then paste in Lovable chat:
                </p>
                <textarea
                  ref={textareaRef}
                  value={copyContent}
                  readOnly
                  className="flex-1 min-h-[300px] p-2 text-xs font-mono bg-muted rounded border resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={handleSelectAll}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                    onClick={() => {
                      setShowCopyDialog(false);
                      toast.success('Now paste (Ctrl+V) in this chat!');
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
