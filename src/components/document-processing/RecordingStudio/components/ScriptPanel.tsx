/**
 * Script Panel Component - Script selection, teleprompter, analysis and enhancement
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, FileText, Sparkles, Search, Check, X } from 'lucide-react';
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
    }
  };

  const handleRejectEnhanced = () => {
    setEnhancedContent(null);
    setShowEnhancedPreview(false);
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="font-medium text-sm">Script</h3>
      </div>

      <Select 
        value={selectedScriptId || "none"} 
        onValueChange={(v) => onScriptChange(v === "none" ? "" : v)}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Select a script">
            {selectedScript?.title || "None"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover z-[100]">
          <SelectItem value="none">None</SelectItem>
          {scripts.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedScript && (
        <>
          {/* Script Preview / Enhanced Preview */}
          <div className="p-3 bg-muted/50 rounded-md max-h-32 overflow-y-auto">
            {showEnhancedPreview && enhancedContent ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">Enhanced Version:</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleAcceptEnhanced}>
                      <Check className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleRejectEnhanced}>
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{enhancedContent}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                {selectedScript.content}
              </p>
            )}
          </div>

          {/* Analysis Result */}
          {analysisResult && (
            <div className="p-2 bg-primary/10 rounded-md text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Analysis:</span>
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setAnalysisResult(null)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-muted-foreground">{analysisResult}</p>
            </div>
          )}

          {/* Scroll Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Scroll Speed</span>
              <span className="text-xs font-medium">{scrollSpeed.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => onScrollSpeedChange(Math.max(0.5, scrollSpeed - 0.1))}
              >
                <Minus className="w-3 h-3" />
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
                className="h-7 w-7"
                onClick={() => onScrollSpeedChange(Math.min(3, scrollSpeed + 0.1))}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Script Actions */}
          <div className="flex gap-2">
            {onAnalyzeScript && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="flex-1 gap-1 text-xs"
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
                className="flex-1 gap-1 text-xs"
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
