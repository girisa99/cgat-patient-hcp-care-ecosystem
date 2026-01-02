/**
 * Script Panel Component - Script selection and teleprompter settings
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Minus, Plus, FileText } from 'lucide-react';
import type { ScriptData } from '../types';

interface ScriptPanelProps {
  scripts: ScriptData[];
  selectedScriptId: string;
  onScriptChange: (id: string) => void;
  
  // Teleprompter
  scrollSpeed: number;
  onScrollSpeedChange: (speed: number) => void;
  
  // Actions
  onAnalyzeScript?: () => void;
  onEnhanceScript?: () => void;
}

export function ScriptPanel({
  scripts,
  selectedScriptId,
  onScriptChange,
  scrollSpeed,
  onScrollSpeedChange,
  onAnalyzeScript,
  onEnhanceScript,
}: ScriptPanelProps) {
  const selectedScript = scripts.find(s => s.id === selectedScriptId);

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="font-medium">Script</h3>
      </div>

      <Select value={selectedScriptId} onValueChange={onScriptChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a script" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {scripts.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedScript && (
        <>
          {/* Script Preview */}
          <div className="p-3 bg-muted/50 rounded-md max-h-32 overflow-y-auto">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
              {selectedScript.content}
            </p>
          </div>

          {/* Scroll Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scroll Speed</span>
              <span className="text-sm font-medium">{scrollSpeed.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
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
                className="h-8 w-8"
                onClick={() => onScrollSpeedChange(Math.min(3, scrollSpeed + 0.1))}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Script Actions */}
          <div className="flex gap-2">
            {onAnalyzeScript && (
              <Button size="sm" variant="outline" onClick={onAnalyzeScript} className="flex-1">
                🔍 Analyze
              </Button>
            )}
            {onEnhanceScript && (
              <Button size="sm" variant="outline" onClick={onEnhanceScript} className="flex-1">
                ✨ Enhance
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
