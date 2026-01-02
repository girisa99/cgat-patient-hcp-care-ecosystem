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
import { 
  Minus, Plus, FileText, Sparkles, Search, Check, X, Download, 
  ChevronDown, ChevronUp, RotateCcw, Copy, Edit2, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ScriptData } from '../types';

interface AnalysisRecommendation {
  id: string;
  type: 'readability' | 'pacing' | 'clarity' | 'engagement' | 'length';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'suggestion';
  accepted: boolean | null;
}

interface EnhancementChange {
  id: string;
  type: 'addition' | 'modification' | 'removal' | 'formatting';
  original: string;
  enhanced: string;
  reason: string;
  accepted: boolean | null;
}

interface ScriptPanelProps {
  scripts: ScriptData[];
  selectedScriptId: string;
  onScriptChange: (id: string) => void;
  onScriptContentUpdate?: (id: string, content: string) => void;
  
  // Teleprompter
  scrollSpeed: number;
  onScrollSpeedChange: (speed: number) => void;
  
  // Actions
  onAnalyzeScript?: () => Promise<string | null>;
  onEnhanceScript?: () => Promise<string | null>;
  isAnalyzing?: boolean;
  isEnhancing?: boolean;
  
  // Enhanced script state - passed up to parent
  onEnhancedScriptReady?: (cleanScript: string) => void;
  onUseEnhancedChange?: (useEnhanced: boolean) => void;
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
}: ScriptPanelProps) {
  const selectedScript = scripts.find(s => s.id === selectedScriptId);
  
  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<AnalysisRecommendation[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Enhancement state
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [cleanEnhancedContent, setCleanEnhancedContent] = useState<string | null>(null);
  const [enhancementChanges, setEnhancementChanges] = useState<EnhancementChange[]>([]);
  const [showChanges, setShowChanges] = useState(false);
  const [isUsingEnhanced, setIsUsingEnhanced] = useState(false);
  
  // Word count stats
  const [originalWordCount, setOriginalWordCount] = useState(0);
  const [enhancedWordCount, setEnhancedWordCount] = useState(0);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  
  // Expanded view
  const [isExpanded, setIsExpanded] = useState(false);

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
      // Parse result and generate detailed recommendations
      const wordCount = countWords(selectedScript.content);
      const sentences = selectedScript.content.split(/[.!?]+/).filter(s => s.trim()).length;
      const avgWordsPerSentence = Math.round(wordCount / sentences);
      const estimatedDuration = Math.ceil(wordCount / 150); // 150 wpm speaking rate
      
      const recommendations: AnalysisRecommendation[] = [];
      
      // Pacing analysis
      if (avgWordsPerSentence > 25) {
        recommendations.push({
          id: 'pacing-1',
          type: 'pacing',
          title: 'Long sentences detected',
          description: `Average ${avgWordsPerSentence} words/sentence. Consider breaking into shorter sentences for better pacing.`,
          severity: 'warning',
          accepted: null,
        });
      }
      
      // Length analysis
      if (wordCount > 500) {
        recommendations.push({
          id: 'length-1',
          type: 'length',
          title: 'Script may be too long',
          description: `${wordCount} words (~${estimatedDuration} min). Consider trimming for better engagement.`,
          severity: 'suggestion',
          accepted: null,
        });
      }
      
      // Readability
      if (selectedScript.content.includes('...')) {
        recommendations.push({
          id: 'clarity-1',
          type: 'clarity',
          title: 'Ellipses found',
          description: 'Ellipses can cause awkward pauses in TTS. Consider replacing with periods.',
          severity: 'info',
          accepted: null,
        });
      }
      
      // Always add stats
      recommendations.push({
        id: 'stats-1',
        type: 'readability',
        title: 'Script Statistics',
        description: `${wordCount} words • ${sentences} sentences • ~${estimatedDuration} min read time`,
        severity: 'info',
        accepted: true, // Auto-accepted info
      });
      
      setAnalysisResult(recommendations);
      setShowAnalysis(true);
      toast.success('Analysis complete!');
    }
  };

  const handleEnhance = async () => {
    if (!onEnhanceScript || !selectedScript) return;
    
    // Store original before enhancing
    setOriginalContent(selectedScript.content);
    setOriginalWordCount(countWords(selectedScript.content));
    
    const result = await onEnhanceScript();
    if (result) {
      setEnhancedContent(result);
      setEnhancedWordCount(countWords(result));
      
      // Generate clean version for TTS
      const cleanVersion = generateCleanScript(result);
      setCleanEnhancedContent(cleanVersion);
      
      // Notify parent
      if (onEnhancedScriptReady) {
        onEnhancedScriptReady(cleanVersion);
      }
      
      // Generate detailed changes
      const changes = generateDetailedChanges(selectedScript.content, result);
      setEnhancementChanges(changes);
      setShowChanges(true);
      
      toast.success('Enhancement complete! Review changes below.');
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
      prev.map(r => r.id === recId ? { ...r, accepted: true } : r)
    );
  };

  const handleRejectRecommendation = (recId: string) => {
    setAnalysisResult(prev => 
      prev.map(r => r.id === recId ? { ...r, accepted: false } : r)
    );
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
              
              {/* Apply Enhanced Button */}
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={handleAcceptAll}
                  className="flex-1 gap-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-3 h-3" />
                  Use Enhanced Script
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
            </div>
          )}

          {/* Analysis Results - Scrollable */}
          {showAnalysis && analysisResult.length > 0 && (
            <div className="space-y-2 border rounded-md p-2 bg-blue-500/5 max-h-[280px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-xs font-medium text-blue-600">
                  📊 Analysis: {pendingRecs} pending review
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  onClick={() => setShowAnalysis(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                <div className="space-y-1.5">
                  {analysisResult.map((rec) => (
                    <div 
                      key={rec.id} 
                      className={cn(
                        "p-2 rounded text-xs border",
                        rec.accepted === true && "bg-green-500/10 border-green-500/30",
                        rec.accepted === false && "bg-red-500/10 border-red-500/30 opacity-50",
                        rec.accepted === null && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
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
                            <span className="font-medium">{rec.title}</span>
                          </div>
                          <p className="text-muted-foreground">{rec.description}</p>
                        </div>
                        {rec.accepted === null && rec.severity !== 'info' && (
                          <div className="flex gap-0.5 shrink-0">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5"
                              onClick={() => handleAcceptRecommendation(rec.id)}
                              title="Accept recommendation"
                            >
                              <Check className="w-3 h-3 text-green-500" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5"
                              onClick={() => handleRejectRecommendation(rec.id)}
                              title="Skip recommendation"
                            >
                              <X className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhancement Changes Review - Scrollable */}
          {showChanges && enhancementChanges.length > 0 && (
            <div className="space-y-2 border rounded-md p-2 bg-primary/5 max-h-[320px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-xs font-medium text-primary">
                  ✨ Enhancements: {pendingChanges} pending • {acceptedChanges} accepted
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  onClick={() => setShowChanges(!showChanges)}
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                <div className="space-y-1.5">
                  {enhancementChanges.map((change) => (
                    <div 
                      key={change.id} 
                      className={cn(
                        "p-2 rounded text-xs border",
                        change.accepted === true && "bg-green-500/10 border-green-500/30",
                        change.accepted === false && "bg-red-500/10 border-red-500/30 opacity-50",
                        change.accepted === null && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="outline" className="text-[8px] h-4">
                              {change.type}
                            </Badge>
                            <span className="text-muted-foreground italic text-[10px]">{change.reason}</span>
                          </div>
                          {change.original && (
                            <p className="text-muted-foreground line-through mb-1 text-[11px]">
                              {change.original.slice(0, 100)}{change.original.length > 100 ? '...' : ''}
                            </p>
                          )}
                          <p className="text-foreground text-[11px]">
                            {change.enhanced.slice(0, 100)}{change.enhanced.length > 100 ? '...' : ''}
                          </p>
                        </div>
                        {change.accepted === null && (
                          <div className="flex gap-0.5 shrink-0">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5"
                              onClick={() => handleAcceptChange(change.id)}
                              title="Accept change"
                            >
                              <Check className="w-3 h-3 text-green-500" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5"
                              onClick={() => handleRejectChange(change.id)}
                              title="Skip change"
                            >
                              <X className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accept/Reject All - Fixed at bottom */}
              <div className="flex gap-1 shrink-0 pt-1 border-t border-primary/20">
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
                  title="Reject all changes"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Download Enhanced/Clean versions */}
              <div className="flex gap-1 shrink-0">
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
