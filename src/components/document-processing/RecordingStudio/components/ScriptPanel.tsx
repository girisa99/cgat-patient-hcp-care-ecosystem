/**
 * Script Panel Component - Script selection, teleprompter, analysis, enhancement, and export
 * Shows enhancement diff with accept/reject per change
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, FileText, Sparkles, Search, Check, X, Download, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScriptData } from '../types';

interface EnhancementChange {
  id: string;
  type: 'addition' | 'modification' | 'removal';
  original: string;
  enhanced: string;
  accepted: boolean | null; // null = pending, true = accepted, false = rejected
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
}: ScriptPanelProps) {
  const selectedScript = scripts.find(s => s.id === selectedScriptId);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [enhancementChanges, setEnhancementChanges] = useState<EnhancementChange[]>([]);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [isUsingEnhanced, setIsUsingEnhanced] = useState(false);

  const handleAnalyze = async () => {
    if (!onAnalyzeScript) return;
    const result = await onAnalyzeScript();
    if (result) {
      setAnalysisResult(result);
    }
  };

  const handleEnhance = async () => {
    if (!onEnhanceScript || !selectedScript) return;
    
    // Store original before enhancing
    setOriginalContent(selectedScript.content);
    
    const result = await onEnhanceScript();
    if (result) {
      setEnhancedContent(result);
      setShowEnhancedPreview(true);
      
      // Generate diff changes
      const changes = generateChanges(selectedScript.content, result);
      setEnhancementChanges(changes);
      setShowChanges(true);
    }
  };

  // Generate changes between original and enhanced
  const generateChanges = (original: string, enhanced: string): EnhancementChange[] => {
    const origSentences = original.split(/[.!?]+/).filter(s => s.trim());
    const enhSentences = enhanced.split(/[.!?]+/).filter(s => s.trim());
    
    const changes: EnhancementChange[] = [];
    
    // Simple diff - compare sentences
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
          accepted: null
        });
      } else if (orig && !enh) {
        changes.push({
          id: `change-${i}`,
          type: 'removal',
          original: orig,
          enhanced: '',
          accepted: null
        });
      } else if (orig !== enh && orig && enh) {
        changes.push({
          id: `change-${i}`,
          type: 'modification',
          original: orig,
          enhanced: enh,
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

  const handleAcceptAll = () => {
    if (enhancedContent && selectedScriptId && onScriptContentUpdate) {
      onScriptContentUpdate(selectedScriptId, enhancedContent);
      setIsUsingEnhanced(true);
      setEnhancementChanges([]);
      setShowEnhancedPreview(false);
      setShowChanges(false);
      setAnalysisResult(null);
    }
  };

  const handleAcceptSelected = () => {
    if (!originalContent || !selectedScript || !onScriptContentUpdate) return;
    
    // Build new content with only accepted changes
    const origSentences = originalContent.split(/([.!?]+)/).filter(s => s);
    let result = originalContent;
    
    enhancementChanges.forEach(change => {
      if (change.accepted === true && change.type === 'modification') {
        result = result.replace(change.original, change.enhanced);
      }
    });
    
    onScriptContentUpdate(selectedScriptId, result);
    setIsUsingEnhanced(true);
    setEnhancementChanges([]);
    setShowEnhancedPreview(false);
    setShowChanges(false);
  };

  const handleRejectAll = () => {
    setEnhancedContent(null);
    setShowEnhancedPreview(false);
    setShowChanges(false);
    setEnhancementChanges([]);
  };

  const handleRevertToOriginal = () => {
    if (originalContent && selectedScriptId && onScriptContentUpdate) {
      onScriptContentUpdate(selectedScriptId, originalContent);
      setIsUsingEnhanced(false);
    }
  };

  // Export script as text file
  const handleExportScript = () => {
    if (!selectedScript) return;
    
    const content = showEnhancedPreview && enhancedContent ? enhancedContent : selectedScript.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedScript.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingChanges = enhancementChanges.filter(c => c.accepted === null).length;
  const acceptedChanges = enhancementChanges.filter(c => c.accepted === true).length;

  return (
    <div className="bg-card rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-sm">Script</h3>
          {isUsingEnhanced && (
            <Badge variant="secondary" className="text-[10px] h-5">Enhanced</Badge>
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
          {selectedScript && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={handleExportScript}
              title="Export script"
            >
              <Download className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <Select 
        value={selectedScriptId || "none"} 
        onValueChange={(v) => onScriptChange(v === "none" ? "" : v)}
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
          {/* Current Script Preview */}
          <ScrollArea className="h-20 rounded-md border bg-muted/30 p-2">
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {selectedScript.content.slice(0, 300)}
              {selectedScript.content.length > 300 && '...'}
            </p>
          </ScrollArea>

          {/* Enhancement Changes Review */}
          {showChanges && enhancementChanges.length > 0 && (
            <div className="space-y-2 border rounded-md p-2 bg-primary/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary">
                  {pendingChanges} pending • {acceptedChanges} accepted
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  onClick={() => setShowChanges(!showChanges)}
                >
                  {showChanges ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
              
              <ScrollArea className="max-h-32">
                <div className="space-y-1">
                  {enhancementChanges.map((change) => (
                    <div 
                      key={change.id} 
                      className={cn(
                        "p-1.5 rounded text-[10px] border",
                        change.accepted === true && "bg-green-500/10 border-green-500/30",
                        change.accepted === false && "bg-red-500/10 border-red-500/30 opacity-50",
                        change.accepted === null && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-[8px] h-4 mb-1">
                            {change.type}
                          </Badge>
                          {change.original && (
                            <p className="text-muted-foreground line-through truncate">
                              {change.original.slice(0, 50)}...
                            </p>
                          )}
                          <p className="text-foreground truncate">
                            {change.enhanced.slice(0, 50)}...
                          </p>
                        </div>
                        {change.accepted === null && (
                          <div className="flex gap-0.5 shrink-0">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5"
                              onClick={() => handleAcceptChange(change.id)}
                            >
                              <Check className="w-3 h-3 text-green-500" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5"
                              onClick={() => handleRejectChange(change.id)}
                            >
                              <X className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Accept/Reject All */}
              <div className="flex gap-1">
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
            </div>
          )}

          {/* Analysis Result */}
          {analysisResult && (
            <div className="p-2 bg-primary/10 rounded-md text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-xs">Analysis:</span>
                <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => setAnalysisResult(null)}>
                  <X className="w-2 h-2" />
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">{analysisResult}</p>
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
                {isAnalyzing ? '...' : 'Analyze'}
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
                {isEnhancing ? '...' : 'Enhance'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
