/**
 * Script Panel Component - Full script view, analysis with detailed recommendations, 
 * word count comparison, clean enhanced script for TTS
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Minus, Plus, FileText, Sparkles, Search, Check, X, Download, 
  ChevronDown, ChevronUp, RotateCcw, Copy, Edit2, Save, Eye, List, RefreshCw,
  Wand2, Pencil, XCircle, Loader2, Upload, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ScriptData } from '../types';
import { InlineScriptDiff, type ScriptChange } from './InlineScriptDiff';
import { useScriptVersions } from '../hooks/useScriptVersions';

// Recommendation status: pending → applied/edited/dismissed
type RecommendationStatus = 'pending' | 'applied' | 'edited' | 'dismissed';

interface AnalysisRecommendation {
  id: string;
  type: 'readability' | 'pacing' | 'clarity' | 'engagement' | 'length';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'suggestion';
  accepted: boolean | null;
  // New fields for actionable recommendations
  status: RecommendationStatus;
  originalText?: string;  // Text in script that has the issue
  suggestedText?: string; // AI-suggested fix (from analysis)
  userEditedText?: string; // User's manual edit
  isEnhancing?: boolean;  // Loading state for targeted enhance
}

interface EnhancementChange {
  id: string;
  type: 'addition' | 'modification' | 'removal' | 'formatting';
  original: string;
  enhanced: string;
  reason: string;
  accepted: boolean | null;
}

// AI Response types
interface AIAnalysisResult {
  stats?: {
    wordCount: number;
    sentenceCount: number;
    avgWordsPerSentence: number;
    estimatedDurationMinutes: number;
    readabilityScore: string;
  };
  recommendations?: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
    originalText?: string;
    suggestedText?: string;
  }>;
}

interface AIEnhancementResult {
  enhancedScript: string;
  cleanScript?: string;
  changes?: Array<{
    type: string;
    original: string;
    enhanced: string;
    reason: string;
  }>;
  summary?: string;
}

type AnalyzeResult = AIAnalysisResult | string | null;
type EnhanceResult = AIEnhancementResult | string | null;

interface ScriptPanelProps {
  scripts: ScriptData[];
  selectedScriptId: string;
  onScriptChange: (id: string) => void;
  onScriptContentUpdate?: (id: string, content: string) => void;
  
  // Teleprompter
  scrollSpeed: number;
  onScrollSpeedChange: (speed: number) => void;
  
  // Actions - now accept AI response objects
  onAnalyzeScript?: () => Promise<AnalyzeResult>;
  onEnhanceScript?: () => Promise<EnhanceResult>;
  isAnalyzing?: boolean;
  isEnhancing?: boolean;
  
  // Enhanced script state - passed up to parent
  onEnhancedScriptReady?: (cleanScript: string) => void;
  onUseEnhancedChange?: (useEnhanced: boolean) => void;
  
  // Lifted state from parent to persist across re-renders
  enhancedContent?: string | null;
  onEnhancedContentChange?: (content: string | null) => void;
  enhancementChanges?: EnhancementChange[];
  onEnhancementChangesChange?: (changes: EnhancementChange[]) => void;
  showChanges?: boolean;
  onShowChangesChange?: (show: boolean) => void;
  analysisResult?: AnalysisRecommendation[];
  onAnalysisResultChange?: (result: AnalysisRecommendation[]) => void;
  showAnalysis?: boolean;
  onShowAnalysisChange?: (show: boolean) => void;
}

export function ScriptPanel({
  scripts,
  selectedScriptId,
  onScriptChange,
  onScriptContentUpdate,
  scrollSpeed,
  onScrollSpeedChange,
  onAnalyzeScript,
  onEnhanceScript,
  isAnalyzing = false,
  isEnhancing = false,
  onEnhancedScriptReady,
  onUseEnhancedChange,
  // Lifted state props for persistence
  enhancedContent: enhancedContentProp,
  onEnhancedContentChange,
  enhancementChanges: enhancementChangesProp,
  onEnhancementChangesChange,
  showChanges: showChangesProp,
  onShowChangesChange,
  analysisResult: analysisResultProp,
  onAnalysisResultChange,
  showAnalysis: showAnalysisProp,
  onShowAnalysisChange,
}: ScriptPanelProps) {
  const selectedScript = scripts.find(s => s.id === selectedScriptId);
  
  // Use lifted state if provided, otherwise use local state
  const [localAnalysisResult, setLocalAnalysisResult] = useState<AnalysisRecommendation[]>([]);
  const [localShowAnalysis, setLocalShowAnalysis] = useState(false);
  const [localEnhancedContent, setLocalEnhancedContent] = useState<string | null>(null);
  const [localEnhancementChanges, setLocalEnhancementChanges] = useState<EnhancementChange[]>([]);
  const [localShowChanges, setLocalShowChanges] = useState(false);
  
  // Use either lifted or local state
  const analysisResult = analysisResultProp ?? localAnalysisResult;
  const setAnalysisResult = onAnalysisResultChange ?? setLocalAnalysisResult;
  const showAnalysis = showAnalysisProp ?? localShowAnalysis;
  const setShowAnalysis = onShowAnalysisChange ?? setLocalShowAnalysis;
  const enhancedContent = enhancedContentProp ?? localEnhancedContent;
  const setEnhancedContent = onEnhancedContentChange ?? setLocalEnhancedContent;
  const enhancementChanges = enhancementChangesProp ?? localEnhancementChanges;
  const setEnhancementChanges = onEnhancementChangesChange ?? setLocalEnhancementChanges;
  const showChanges = showChangesProp ?? localShowChanges;
  const setShowChanges = onShowChangesChange ?? setLocalShowChanges;
  
  // Local-only state (doesn't need persistence)
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [cleanEnhancedContent, setCleanEnhancedContent] = useState<string | null>(null);
  const [isUsingEnhanced, setIsUsingEnhanced] = useState(false);
  
  // Word count stats
  const [originalWordCount, setOriginalWordCount] = useState(0);
  const [enhancedWordCount, setEnhancedWordCount] = useState(0);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  
  // Expanded view
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Version management
  const { 
    versions, 
    currentVersion, 
    isSaving: isSavingVersion, 
    loadVersions, 
    saveNewVersion 
  } = useScriptVersions();
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  // Load versions when script changes
  useEffect(() => {
    if (selectedScriptId) {
      loadVersions(selectedScriptId);
    }
  }, [selectedScriptId, loadVersions]);
  // View mode for changes: 'inline' (in-context) or 'list' (separate list)
  const [changesViewMode, setChangesViewMode] = useState<'inline' | 'list'>('inline');

  // Calculate word count
  const countWords = (text: string) => text.split(/\s+/).filter(w => w.length > 0).length;

  // Update word counts when script changes
  useEffect(() => {
    if (selectedScript) {
      setOriginalWordCount(countWords(selectedScript.content));
      setEditContent(selectedScript.content);
    }
  }, [selectedScript]);

  // Generate clean script for TTS (remove pauses, breaks, stage directions)
  const generateCleanScript = (text: string): string => {
    return text
      .replace(/\[.*?\]/g, '') // Remove [stage directions]
      .replace(/\(.*?\)/g, '') // Remove (parentheticals)
      .replace(/\.{3,}/g, '.') // Replace ... with single .
      .replace(/---+/g, '') // Remove horizontal rules
      .replace(/\*\*\*/g, '') // Remove break markers
      .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const handleAnalyze = async () => {
    if (!onAnalyzeScript || !selectedScript) return;
    
    const result = await onAnalyzeScript();
    if (result) {
      // Type guard: Check if result is an object (AI response) or string (legacy)
      if (typeof result === 'object' && result !== null) {
        const aiResult = result as AIAnalysisResult;
        
        // AI-generated recommendations
        if (aiResult.recommendations && Array.isArray(aiResult.recommendations)) {
          const recommendations: AnalysisRecommendation[] = aiResult.recommendations.map((rec, index) => ({
            id: `rec-${index}`,
            type: (rec.type as 'readability' | 'pacing' | 'clarity' | 'engagement' | 'length') || 'readability',
            title: rec.title,
            description: rec.description,
            // Default to 'suggestion' so action buttons show - 'info' hides them
            severity: (rec.severity as 'info' | 'warning' | 'suggestion') || 'suggestion',
            accepted: null,
            status: 'pending' as RecommendationStatus,
            originalText: rec.originalText,
            suggestedText: rec.suggestedText,
          }));
          
          // Add stats from AI analysis
          if (aiResult.stats) {
            recommendations.unshift({
              id: 'stats-ai',
              type: 'readability',
              title: 'Script Statistics (AI Analysis)',
              description: `${aiResult.stats.wordCount} words • ${aiResult.stats.sentenceCount} sentences • ~${aiResult.stats.estimatedDurationMinutes} min • Readability: ${aiResult.stats.readabilityScore}`,
              severity: 'info',
              accepted: true,
              status: 'applied' as RecommendationStatus, // Stats are always "applied"
            });
          }
          
          setAnalysisResult(recommendations);
          setShowAnalysis(true);
          toast.success('AI analysis complete!');
          return;
        }
      }
      
      // Legacy fallback - generate local recommendations
      const wordCount = countWords(selectedScript.content);
      const sentences = selectedScript.content.split(/[.!?]+/).filter(s => s.trim()).length;
      const avgWordsPerSentence = Math.round(wordCount / sentences);
      const estimatedDuration = Math.ceil(wordCount / 150);
      
      const recommendations: AnalysisRecommendation[] = [
        {
          id: 'stats-1',
          type: 'readability',
          title: 'Script Statistics',
          description: `${wordCount} words • ${sentences} sentences • ~${estimatedDuration} min read time`,
          severity: 'info',
          accepted: true,
          status: 'applied' as RecommendationStatus,
        }
      ];
      
      if (avgWordsPerSentence > 25) {
        recommendations.push({
          id: 'pacing-1',
          type: 'pacing',
          title: 'Long sentences detected',
          description: `Average ${avgWordsPerSentence} words/sentence. Consider breaking into shorter sentences.`,
          severity: 'warning',
          accepted: null,
          status: 'pending' as RecommendationStatus,
        });
      }
      
      setAnalysisResult(recommendations);
      setShowAnalysis(true);
    }
  };

  const handleEnhance = async () => {
    if (!onEnhanceScript || !selectedScript) return;
    
    // Store original before enhancing
    setOriginalContent(selectedScript.content);
    setOriginalWordCount(countWords(selectedScript.content));
    
    const result = await onEnhanceScript();
    if (result) {
      // Type guard: Check if result is an object (AI response) or string (legacy)
      if (typeof result === 'object' && result !== null) {
        const aiResult = result as AIEnhancementResult;
        
        if (aiResult.enhancedScript) {
          // AI-generated enhancement
          setEnhancedContent(aiResult.enhancedScript);
          setEnhancedWordCount(countWords(aiResult.enhancedScript));
          
          // Use the AI-provided clean script for TTS
          const cleanVersion = aiResult.cleanScript || generateCleanScript(aiResult.enhancedScript);
          setCleanEnhancedContent(cleanVersion);
          
          // Notify parent with clean script
          if (onEnhancedScriptReady) {
            onEnhancedScriptReady(cleanVersion);
          }
          
          // Use AI-provided changes with highlighting
          if (aiResult.changes && Array.isArray(aiResult.changes)) {
            const aiChanges: EnhancementChange[] = aiResult.changes.map((change, index) => ({
              id: `ai-change-${index}`,
              type: (change.type as 'addition' | 'modification' | 'removal' | 'formatting') || 'modification',
              original: change.original || '',
              enhanced: change.enhanced || '',
              reason: change.reason || 'AI improvement',
              accepted: null,
            }));
            setEnhancementChanges(aiChanges);
          } else {
            // Fallback to local diff
            const changes = generateDetailedChanges(selectedScript.content, aiResult.enhancedScript);
            setEnhancementChanges(changes);
          }
          
          setShowChanges(true);
          
          // Show summary if available
          if (aiResult.summary) {
            toast.success(aiResult.summary);
          }
          return;
        }
      }
      
      // Legacy string result
      if (typeof result === 'string') {
        setEnhancedContent(result);
        setEnhancedWordCount(countWords(result));
        
        const cleanVersion = generateCleanScript(result);
        setCleanEnhancedContent(cleanVersion);
        
        if (onEnhancedScriptReady) {
          onEnhancedScriptReady(cleanVersion);
        }
        
        const changes = generateDetailedChanges(selectedScript.content, result);
        setEnhancementChanges(changes);
        setShowChanges(true);
        toast.success('Enhancement complete! Review changes below.');
      }
    }
  };

  // Generate detailed changes with reasons
  const generateDetailedChanges = (original: string, enhanced: string): EnhancementChange[] => {
    const origSentences = original.split(/[.!?]+/).filter(s => s.trim());
    const enhSentences = enhanced.split(/[.!?]+/).filter(s => s.trim());
    
    const changes: EnhancementChange[] = [];
    const maxLen = Math.max(origSentences.length, enhSentences.length);
    
    for (let i = 0; i < maxLen; i++) {
      const orig = origSentences[i]?.trim() || '';
      const enh = enhSentences[i]?.trim() || '';
      
      if (!orig && enh) {
        changes.push({
          id: `change-${i}`,
          type: 'addition',
          original: '',
          enhanced: enh,
          reason: 'Added for better flow and engagement',
          accepted: null
        });
      } else if (orig && !enh) {
        changes.push({
          id: `change-${i}`,
          type: 'removal',
          original: orig,
          enhanced: '',
          reason: 'Removed redundant content',
          accepted: null
        });
      } else if (orig !== enh && orig && enh) {
        changes.push({
          id: `change-${i}`,
          type: 'modification',
          original: orig,
          enhanced: enh,
          reason: 'Improved clarity and readability',
          accepted: null
        });
      }
    }
    
    return changes;
  };

  const handleAcceptChange = (changeId: string) => {
    setEnhancementChanges(prev => 
      prev.map(c => c.id === changeId ? { ...c, accepted: true } : c)
    );
  };

  const handleRejectChange = (changeId: string) => {
    setEnhancementChanges(prev => 
      prev.map(c => c.id === changeId ? { ...c, accepted: false } : c)
    );
  };

  const handleAcceptRecommendation = (recId: string) => {
    setAnalysisResult(prev => 
      prev.map(r => r.id === recId ? { ...r, accepted: true, status: 'applied' as RecommendationStatus } : r)
    );
  };

  const handleRejectRecommendation = (recId: string) => {
    setAnalysisResult(prev => 
      prev.map(r => r.id === recId ? { ...r, accepted: false, status: 'dismissed' as RecommendationStatus } : r)
    );
  };

  // State for inline editing of recommendations
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [recEditText, setRecEditText] = useState('');

  // Handle "Apply AI Fix" - triggers targeted enhance for this specific recommendation
  const handleApplyAIFix = async (rec: AnalysisRecommendation) => {
    if (!onEnhanceScript || !selectedScript) return;
    
    // Mark as enhancing
    setAnalysisResult(prev => 
      prev.map(r => r.id === rec.id ? { ...r, isEnhancing: true } : r)
    );

    try {
      // If the recommendation already has a suggested fix, apply it directly
      if (rec.suggestedText && rec.originalText) {
        const newContent = selectedScript.content.replace(rec.originalText, rec.suggestedText);
        if (newContent !== selectedScript.content && onScriptContentUpdate) {
          onScriptContentUpdate(selectedScriptId, newContent);
          setAnalysisResult(prev => 
            prev.map(r => r.id === rec.id ? { ...r, status: 'applied' as RecommendationStatus, accepted: true, isEnhancing: false } : r)
          );
          toast.success(`Applied fix: ${rec.title}`);
          return;
        }
      }
      
      // Otherwise trigger full enhance and let user review
      const result = await onEnhanceScript();
      setAnalysisResult(prev => 
        prev.map(r => r.id === rec.id ? { ...r, isEnhancing: false } : r)
      );
      
      if (result) {
        toast.success('Enhancement generated - review changes below');
      }
    } catch (error) {
      setAnalysisResult(prev => 
        prev.map(r => r.id === rec.id ? { ...r, isEnhancing: false } : r)
      );
      toast.error('Failed to apply AI fix');
    }
  };

  // Handle "Edit Manually" - opens inline editor for this recommendation
  const handleEditManually = (rec: AnalysisRecommendation) => {
    setEditingRecId(rec.id);
    // Pre-fill with suggested text if available, otherwise original text
    setRecEditText(rec.suggestedText || rec.originalText || '');
  };

  // Save manual edit for a recommendation
  const handleSaveRecEdit = (rec: AnalysisRecommendation) => {
    if (!selectedScript || !onScriptContentUpdate || !recEditText.trim()) {
      setEditingRecId(null);
      return;
    }

    // If we have original text, replace it in the script
    if (rec.originalText) {
      const newContent = selectedScript.content.replace(rec.originalText, recEditText);
      if (newContent !== selectedScript.content) {
        onScriptContentUpdate(selectedScriptId, newContent);
      }
    }

    // Update recommendation status
    setAnalysisResult(prev => 
      prev.map(r => r.id === rec.id ? { 
        ...r, 
        status: 'edited' as RecommendationStatus, 
        accepted: true,
        userEditedText: recEditText 
      } : r)
    );
    
    setEditingRecId(null);
    setRecEditText('');
    toast.success('Manual edit applied');
  };

  // Cancel manual edit
  const handleCancelRecEdit = () => {
    setEditingRecId(null);
    setRecEditText('');
  };

  // Dismiss a recommendation (mark as not applicable)
  const handleDismissRecommendation = (recId: string) => {
    setAnalysisResult(prev => 
      prev.map(r => r.id === recId ? { ...r, status: 'dismissed' as RecommendationStatus, accepted: false } : r)
    );
    toast.info('Recommendation dismissed');
  };

  const handleAcceptAll = () => {
    if (enhancedContent && selectedScriptId && onScriptContentUpdate) {
      onScriptContentUpdate(selectedScriptId, enhancedContent);
      setIsUsingEnhanced(true);
      if (onUseEnhancedChange) onUseEnhancedChange(true);
      setEnhancementChanges([]);
      setShowChanges(false);
      toast.success('All changes accepted!');
    }
  };

  const handleAcceptSelected = () => {
    if (!originalContent || !selectedScript || !onScriptContentUpdate) return;
    
    let result = originalContent;
    enhancementChanges.forEach(change => {
      if (change.accepted === true && change.type === 'modification') {
        result = result.replace(change.original, change.enhanced);
      }
    });
    
    onScriptContentUpdate(selectedScriptId, result);
    setIsUsingEnhanced(true);
    if (onUseEnhancedChange) onUseEnhancedChange(true);
    setEnhancementChanges([]);
    setShowChanges(false);
    toast.success('Selected changes applied!');
  };

  const handleRejectAll = () => {
    setEnhancedContent(null);
    setCleanEnhancedContent(null);
    setShowChanges(false);
    setEnhancementChanges([]);
    toast.info('Changes rejected');
  };

  const handleRevertToOriginal = () => {
    if (originalContent && selectedScriptId && onScriptContentUpdate) {
      onScriptContentUpdate(selectedScriptId, originalContent);
      setIsUsingEnhanced(false);
      if (onUseEnhancedChange) onUseEnhancedChange(false);
      toast.success('Reverted to original');
    }
  };

  const handleSaveEdit = () => {
    if (selectedScriptId && onScriptContentUpdate && editContent) {
      onScriptContentUpdate(selectedScriptId, editContent);
      setIsEditing(false);
      toast.success('Script saved!');
    }
  };

  // Save enhanced script as a new version to Production
  const handleSaveToProduction = async () => {
    if (!selectedScript || !enhancedContent) return;
    
    const changesData = enhancementChanges.map(c => ({
      type: c.type,
      original: c.original,
      enhanced: c.enhanced,
      reason: c.reason,
      accepted: c.accepted,
    }));
    
    const analysisData = analysisResult.length > 0 ? {
      recommendations: analysisResult.map(r => ({
        type: r.type,
        title: r.title,
        description: r.description,
        status: r.status,
      })),
    } : undefined;

    await saveNewVersion({
      scriptId: selectedScriptId,
      originalContent: selectedScript.content,
      enhancedContent: enhancedContent,
      cleanContent: cleanEnhancedContent || undefined,
      versionType: 'enhanced',
      changeSummary: `Enhanced version with ${enhancementChanges.length} changes`,
      enhancementChanges: { changes: changesData } as Record<string, unknown>,
      analysisResults: analysisData as Record<string, unknown> | undefined,
    });
  };

  const handleExportScript = (type: 'original' | 'enhanced' | 'clean') => {
    if (!selectedScript) return;
    
    let content = selectedScript.content;
    let filename = selectedScript.title;
    
    if (type === 'enhanced' && enhancedContent) {
      content = enhancedContent;
      filename += '-enhanced';
    } else if (type === 'clean' && cleanEnhancedContent) {
      content = cleanEnhancedContent;
      filename += '-clean-tts';
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Script downloaded!');
  };

  const handleCopyToClipboard = () => {
    const content = cleanEnhancedContent || enhancedContent || selectedScript?.content;
    if (content) {
      navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard!');
    }
  };

  const pendingChanges = enhancementChanges.filter(c => c.accepted === null).length;
  const acceptedChanges = enhancementChanges.filter(c => c.accepted === true).length;
  const pendingRecs = analysisResult.filter(r => r.accepted === null).length;

  // Build script options including enhanced version
  const scriptOptions = [...scripts];

  return (
    <div className="bg-card rounded-lg border p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-sm">Script</h3>
          {isUsingEnhanced && (
            <Badge variant="default" className="text-[10px] h-5 bg-green-600">Enhanced</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isUsingEnhanced && originalContent && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={handleRevertToOriginal}
              title="Revert to original"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={handleCopyToClipboard}
            title="Copy script"
          >
            <Copy className="w-3 h-3" />
          </Button>
          {selectedScript && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleExportScript('original')}
              title="Download script"
            >
              <Download className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Script Selection */}
      <Select 
        value={selectedScriptId || "none"} 
        onValueChange={(v) => {
          onScriptChange(v === "none" ? "" : v);
          setShowAnalysis(false);
          setShowChanges(false);
        }}
      >
        <SelectTrigger className="bg-background h-9 text-sm">
          <SelectValue>
            {selectedScript?.title || (scripts.length > 0 ? "Select a script" : "No scripts available")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border shadow-md z-[9999]">
          <SelectItem value="none">None</SelectItem>
          {scripts.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedScript && (
        <>
          {/* Full Script Content (Expandable) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {originalWordCount} words • ~{Math.ceil(originalWordCount / 150)} min
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  onClick={() => setIsEditing(!isEditing)}
                  title={isEditing ? "Cancel edit" : "Edit script"}
                >
                  {isEditing ? <X className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                </Button>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    onClick={handleSaveEdit}
                    title="Save changes"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={cn(
                  "text-xs resize-none",
                  isExpanded ? "min-h-[200px]" : "min-h-[80px]"
                )}
              />
            ) : (
              <ScrollArea className={cn(
                "rounded-md border bg-muted/30 p-2",
                isExpanded ? "h-48" : "h-20"
              )}>
                <p className="text-xs text-foreground whitespace-pre-wrap">
                  {isExpanded ? selectedScript.content : (
                    selectedScript.content.slice(0, 300) + 
                    (selectedScript.content.length > 300 ? '...' : '')
                  )}
                </p>
              </ScrollArea>
            )}
          </div>

          {/* Enhanced Script Preview - Shows when enhancement is complete */}
          {enhancedContent && (
            <div className="space-y-2 border rounded-md p-2 bg-green-500/5 border-green-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Enhanced Script</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportScript('enhanced')}
                    className="h-6 px-2 text-[10px] gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>
              </div>
              
              {/* Word Count Comparison */}
              <div className="flex items-center gap-2 p-1.5 bg-background/50 rounded text-xs">
                <div className="flex-1 text-center">
                  <span className="text-muted-foreground">Original: </span>
                  <span className="font-medium">{originalWordCount} words</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1 text-center">
                  <span className="text-muted-foreground">Enhanced: </span>
                  <span className="font-medium text-green-600">{enhancedWordCount} words</span>
                  <span className="text-[10px] text-muted-foreground ml-1">
                    ({enhancedWordCount >= originalWordCount ? '+' : ''}{enhancedWordCount - originalWordCount})
                  </span>
                </div>
              </div>
              
              {/* Enhanced Script Preview */}
              <div className="overflow-y-auto max-h-32 rounded bg-muted/30 p-2">
                <p className="text-xs text-foreground whitespace-pre-wrap">
                  {enhancedContent.slice(0, 500)}{enhancedContent.length > 500 ? '...' : ''}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5">
                {/* Primary actions */}
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={handleAcceptAll}
                    className="flex-1 gap-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3 h-3" />
                    Use Enhanced
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleRejectAll}
                    className="gap-1 text-xs h-7"
                  >
                    <X className="w-3 h-3" />
                    Discard
                  </Button>
                </div>
                
                {/* Save to Production button */}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={handleSaveToProduction}
                  disabled={isSavingVersion}
                  className="w-full gap-1.5 text-xs h-7"
                  title="Save enhanced version to Production Hub"
                >
                  {isSavingVersion ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  {isSavingVersion ? 'Saving...' : 'Save to Production'}
                  {currentVersion && (
                    <Badge variant="outline" className="ml-1 text-[8px] h-4">
                      v{currentVersion.version_number} → v{currentVersion.version_number + 1}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Version History Indicator */}
          {versions.length > 0 && (
            <div className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Current: v{currentVersion?.version_number || 1}
                </span>
                {versions.length > 1 && (
                  <Badge variant="secondary" className="text-[9px] h-4">
                    {versions.length} versions
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] gap-1"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                <History className="w-3 h-3" />
                {showVersionHistory ? 'Hide' : 'History'}
              </Button>
            </div>
          )}

          {/* Version History List */}
          {showVersionHistory && versions.length > 0 && (
            <div className="border rounded-md p-2 bg-muted/20 space-y-1.5 max-h-40 overflow-y-auto">
              <div className="text-xs font-medium text-muted-foreground mb-1">Version History</div>
              {versions.map((version) => (
                <div 
                  key={version.id}
                  className={cn(
                    "flex items-center justify-between p-1.5 rounded text-xs border",
                    version.id === currentVersion?.id 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-background border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={version.version_type === 'enhanced' ? 'default' : 'secondary'}
                      className="text-[8px] h-4"
                    >
                      v{version.version_number}
                    </Badge>
                    <span className="text-muted-foreground">
                      {version.version_type === 'enhanced' ? 'Enhanced' : 
                       version.version_type === 'manual_edit' ? 'Manual Edit' : 'Original'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(version.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {version.id === currentVersion?.id && (
                    <Badge variant="outline" className="text-[8px] h-4 text-green-600 border-green-500/30">
                      Current
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Analysis Results - Scrollable */}
          {showAnalysis && analysisResult.length > 0 && (
            <div className="border rounded-md p-2 bg-blue-500/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600">
                  📊 Analysis: {pendingRecs} pending review
                </span>
                <div className="flex items-center gap-1">
                  {/* Note All button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-5 px-2 text-[10px] gap-1"
                    onClick={() => {
                      analysisResult.forEach(r => {
                        if (r.status === 'pending') {
                          handleAcceptRecommendation(r.id);
                        }
                      });
                    }}
                  >
                    <Check className="w-3 h-3" />
                    Note All
                  </Button>
                  {/* Re-analyze button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-5 px-2 text-[10px] gap-1"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    title="Get fresh analysis"
                  >
                    <RefreshCw className={cn("w-3 h-3", isAnalyzing && "animate-spin")} />
                    {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    onClick={() => setShowAnalysis(false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[320px] pr-1">
                <div className="space-y-2 pr-3">
                  {analysisResult.map((rec) => (
                    <div 
                      key={rec.id} 
                      className={cn(
                        "p-2.5 rounded text-xs border transition-all",
                        rec.status === 'applied' && "bg-green-500/10 border-green-500/30",
                        rec.status === 'edited' && "bg-blue-500/10 border-blue-500/30",
                        rec.status === 'dismissed' && "bg-muted/30 border-muted opacity-50",
                        rec.status === 'pending' && "bg-muted/50 border-border"
                      )}
                    >
                      {/* Header with type badge and title */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[8px] h-4",
                                rec.severity === 'warning' && "border-amber-500 text-amber-600",
                                rec.severity === 'suggestion' && "border-blue-500 text-blue-600",
                                rec.severity === 'info' && "border-gray-500 text-gray-600"
                              )}
                            >
                              {rec.type}
                            </Badge>
                            {rec.status !== 'pending' && (
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-[8px] h-4",
                                  rec.status === 'applied' && "bg-green-500/20 text-green-700",
                                  rec.status === 'edited' && "bg-blue-500/20 text-blue-700",
                                  rec.status === 'dismissed' && "bg-muted text-muted-foreground"
                                )}
                              >
                                {rec.status === 'applied' && '✓ Applied'}
                                {rec.status === 'edited' && '✏️ Edited'}
                                {rec.status === 'dismissed' && 'Dismissed'}
                              </Badge>
                            )}
                            <span className="font-medium">{rec.title}</span>
                          </div>
                          <p className="text-muted-foreground">{rec.description}</p>
                          
                          {/* Show original text if available */}
                          {rec.originalText && rec.status === 'pending' && (
                            <div className="mt-1.5 p-1.5 rounded bg-amber-500/5 border border-amber-500/20">
                              <span className="text-[10px] text-amber-600 font-medium">Issue in script:</span>
                              <p className="text-[11px] text-foreground/80 mt-0.5 italic">
                                "{rec.originalText.length > 100 ? rec.originalText.slice(0, 100) + '...' : rec.originalText}"
                              </p>
                            </div>
                          )}
                          
                          {/* Show suggested fix if available */}
                          {rec.suggestedText && rec.status === 'pending' && (
                            <div className="mt-1 p-1.5 rounded bg-green-500/5 border border-green-500/20">
                              <span className="text-[10px] text-green-600 font-medium">Suggested fix:</span>
                              <p className="text-[11px] text-foreground/80 mt-0.5">
                                "{rec.suggestedText.length > 100 ? rec.suggestedText.slice(0, 100) + '...' : rec.suggestedText}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Inline editor when editing this recommendation */}
                      {editingRecId === rec.id && (
                        <div className="mt-2 space-y-2 border-t pt-2">
                          <Textarea
                            value={recEditText}
                            onChange={(e) => setRecEditText(e.target.value)}
                            placeholder="Enter your edited text..."
                            className="text-xs min-h-[60px] resize-none"
                          />
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="default" 
                              onClick={() => handleSaveRecEdit(rec)}
                              className="h-6 px-2 text-[10px] gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Save Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleCancelRecEdit}
                              className="h-6 px-2 text-[10px]"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Action buttons for pending recommendations - show for all except stats */}
                      {rec.status === 'pending' && rec.id !== 'stats-ai' && editingRecId !== rec.id && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                          {/* Apply AI Fix button */}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 px-2 text-[10px] gap-1 border-green-500/30 hover:bg-green-500/10 hover:border-green-500"
                            onClick={() => handleApplyAIFix(rec)}
                            disabled={rec.isEnhancing}
                            title={rec.suggestedText ? "Apply the suggested fix" : "Generate AI fix for this issue"}
                          >
                            {rec.isEnhancing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Wand2 className="w-3 h-3 text-green-600" />
                            )}
                            {rec.isEnhancing ? 'Fixing...' : (rec.suggestedText ? 'Apply Fix' : 'AI Fix')}
                          </Button>
                          
                          {/* Edit Manually button */}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 px-2 text-[10px] gap-1 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500"
                            onClick={() => handleEditManually(rec)}
                            title="Edit this section manually"
                          >
                            <Pencil className="w-3 h-3 text-blue-600" />
                            Edit
                          </Button>
                          
                          {/* Dismiss button */}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => handleDismissRecommendation(rec.id)}
                            title="Dismiss this recommendation"
                          >
                            <XCircle className="w-3 h-3" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Enhancement Changes Review */}
          {showChanges && enhancementChanges.length > 0 && (
            <div className="border rounded-md p-3 bg-primary/5">
              {/* Header with view toggle */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Review AI Enhancements
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {pendingChanges} pending • {acceptedChanges} accepted
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {/* Re-enhance button for alternative suggestions */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[10px] gap-1"
                    onClick={handleEnhance}
                    disabled={isEnhancing}
                    title="Get alternative AI suggestions"
                  >
                    <RefreshCw className={cn("w-3 h-3", isEnhancing && "animate-spin")} />
                    {isEnhancing ? 'Re-enhancing...' : 'Re-enhance'}
                  </Button>
                  {/* View mode toggle */}
                  <Tabs value={changesViewMode} onValueChange={(v) => setChangesViewMode(v as 'inline' | 'list')}>
                    <TabsList className="h-7">
                      <TabsTrigger value="inline" className="h-5 px-2 text-[10px] gap-1">
                        <Eye className="w-3 h-3" />
                        In-Context
                      </TabsTrigger>
                      <TabsTrigger value="list" className="h-5 px-2 text-[10px] gap-1">
                        <List className="w-3 h-3" />
                        List
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setShowChanges(false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Review Progress Bar */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs text-muted-foreground">
                  Review Progress: {acceptedChanges + enhancementChanges.filter(c => c.accepted === false).length}/{enhancementChanges.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(((acceptedChanges + enhancementChanges.filter(c => c.accepted === false).length) / enhancementChanges.length) * 100)}%
                </span>
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs gap-1"
                  onClick={handleRejectAll}
                >
                  <X className="w-3 h-3" />
                  Skip All Remaining
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 px-3 text-xs gap-1 bg-green-600 hover:bg-green-700"
                  onClick={handleAcceptAll}
                >
                  <Check className="w-3 h-3" />
                  Accept All
                </Button>
              </div>

              {/* Word count comparison */}
              <div className="flex items-center gap-4 px-2 py-1.5 rounded bg-muted/50 text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Original:</span>
                  <span className="font-medium">{originalWordCount} words</span>
                  <span className="text-muted-foreground">~{Math.ceil(originalWordCount / 150)} min</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Enhanced:</span>
                  <span className="font-medium text-green-600">{enhancedWordCount} words</span>
                  <span className="text-muted-foreground">~{Math.ceil(enhancedWordCount / 150)} min</span>
                </div>
              </div>
              
              {/* Scrollable content area - with explicit height */}
              <ScrollArea className="h-[300px]">
                {/* Inline View - Show changes in context */}
                {changesViewMode === 'inline' && selectedScript && (
                  <InlineScriptDiff
                    originalScript={selectedScript.content}
                    changes={enhancementChanges.map(c => ({
                      ...c,
                      type: c.type as ScriptChange['type']
                    }))}
                    onAcceptChange={handleAcceptChange}
                    onRejectChange={handleRejectChange}
                    className="h-full"
                  />
                )}
              
                {/* List View - Original separate list */}
                {changesViewMode === 'list' && (
                  <div className="space-y-2 pr-1">
                    {enhancementChanges.map((change) => (
                      <div 
                        key={change.id} 
                        className={cn(
                          "p-2.5 rounded text-xs border transition-all",
                          change.accepted === true && "bg-green-500/15 border-green-500/40",
                          change.accepted === false && "bg-red-500/10 border-red-500/30 opacity-40",
                          change.accepted === null && "bg-background border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[9px] h-4 font-medium",
                                  change.type === 'addition' && "border-green-500 text-green-600 bg-green-500/10",
                                  change.type === 'removal' && "border-red-500 text-red-600 bg-red-500/10",
                                  change.type === 'modification' && "border-blue-500 text-blue-600 bg-blue-500/10",
                                  change.type === 'formatting' && "border-purple-500 text-purple-600 bg-purple-500/10"
                                )}
                              >
                                {change.type}
                              </Badge>
                              <span className="text-muted-foreground text-[10px] italic truncate">{change.reason}</span>
                            </div>
                            
                            {change.original && change.type !== 'addition' && (
                              <div className="p-1.5 rounded bg-red-500/5 border border-red-500/20">
                                <p className="text-red-600/80 line-through text-[11px] leading-relaxed">
                                  {change.original.length > 150 ? change.original.slice(0, 150) + '...' : change.original}
                                </p>
                              </div>
                            )}
                            
                            {change.enhanced && (
                              <div className="p-1.5 rounded bg-green-500/5 border border-green-500/20">
                                <p className="text-green-700 text-[11px] leading-relaxed font-medium">
                                  {change.enhanced.length > 150 ? change.enhanced.slice(0, 150) + '...' : change.enhanced}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {change.accepted === null && (
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-6 w-6 border-green-500/30 hover:bg-green-500/10 hover:border-green-500"
                                onClick={() => handleAcceptChange(change.id)}
                              >
                                <Check className="w-3 h-3 text-green-600" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-6 w-6 border-red-500/30 hover:bg-red-500/10 hover:border-red-500"
                                onClick={() => handleRejectChange(change.id)}
                              >
                                <X className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          )}
                          
                          {change.accepted !== null && (
                            <div className="shrink-0">
                              {change.accepted ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Action buttons */}
              <div className="flex gap-1 pt-2 border-t border-primary/20">
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={handleAcceptAll}
                  className="flex-1 gap-1 text-xs h-7"
                >
                  <Check className="w-3 h-3" />
                  Accept All
                </Button>
                {acceptedChanges > 0 && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={handleAcceptSelected}
                    className="flex-1 gap-1 text-xs h-7"
                  >
                    Apply {acceptedChanges}
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRejectAll}
                  className="gap-1 text-xs h-7"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Download options */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportScript('enhanced')}
                  className="flex-1 gap-1 text-xs h-7"
                >
                  <Download className="w-3 h-3" />
                  Enhanced
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportScript('clean')}
                  className="flex-1 gap-1 text-xs h-7"
                  title="Clean version for TTS (no pauses/breaks)"
                >
                  <Download className="w-3 h-3" />
                  Clean (TTS)
                </Button>
              </div>
            </div>
          )}

          {/* Scroll Speed Control */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Teleprompter Speed</span>
              <span className="text-xs font-medium">{scrollSpeed.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={() => onScrollSpeedChange(Math.max(0.5, scrollSpeed - 0.1))}
              >
                <Minus className="w-2 h-2" />
              </Button>
              <Slider
                value={[scrollSpeed]}
                onValueChange={([v]) => onScrollSpeedChange(v)}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={() => onScrollSpeedChange(Math.min(3, scrollSpeed + 0.1))}
              >
                <Plus className="w-2 h-2" />
              </Button>
            </div>
          </div>

          {/* Script Actions */}
          <div className="flex gap-1">
            {onAnalyzeScript && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="flex-1 gap-1 text-xs h-7"
              >
                <Search className="w-3 h-3" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            )}
            {onEnhanceScript && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex-1 gap-1 text-xs h-7"
              >
                <Sparkles className="w-3 h-3" />
                {isEnhancing ? 'Enhancing...' : 'Enhance'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
