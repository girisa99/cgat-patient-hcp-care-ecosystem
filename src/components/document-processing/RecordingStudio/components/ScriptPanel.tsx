/**
 * Script Panel Component - Script selection, teleprompter, analysis, enhancement, and export
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Minus, Plus, FileText, Sparkles, Search, Check, X, Download } from 'lucide-react';
import type { ScriptData } from '../types';

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
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);

  const handleAnalyze = async () => {
    if (!onAnalyzeScript) return;
    const result = await onAnalyzeScript();
    if (result) {
      setAnalysisResult(result);
    }
  };

  const handleEnhance = async () => {
    if (!onEnhanceScript) return;
    const result = await onEnhanceScript();
    if (result) {
      setEnhancedContent(result);
      setShowEnhancedPreview(true);
    }
  };

  const handleAcceptEnhanced = () => {
    if (enhancedContent && selectedScriptId && onScriptContentUpdate) {
      onScriptContentUpdate(selectedScriptId, enhancedContent);
      setEnhancedContent(null);
      setShowEnhancedPreview(false);
      setAnalysisResult(null);
    }
  };

  const handleRejectEnhanced = () => {
    setEnhancedContent(null);
    setShowEnhancedPreview(false);
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

  return (
    <div className="bg-card rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-sm">Script</h3>
        </div>
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
          {/* Script Preview / Enhanced Preview */}
          <div className="p-2 bg-muted/50 rounded-md max-h-24 overflow-y-auto">
            {showEnhancedPreview && enhancedContent ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">Enhanced:</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleAcceptEnhanced} title="Accept">
                      <Check className="w-3 h-3 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleRejectEnhanced} title="Reject">
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-foreground whitespace-pre-wrap">{enhancedContent}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">
                {selectedScript.content}
              </p>
            )}
          </div>

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
              <span className="text-xs text-muted-foreground">Speed</span>
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
