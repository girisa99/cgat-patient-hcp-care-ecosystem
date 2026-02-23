/**
 * Script Stats Bar - Displays word count, sentence count, reading/speaking time, readability
 * Extracted from ScriptEditorTab.tsx
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScriptStats } from './types';

interface ScriptStatsBarProps {
  stats: ScriptStats;
}

export function ScriptStatsBar({ stats }: ScriptStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 p-4 rounded-lg bg-muted/50 border border-border/50">
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.wordCount}</div>
        <div className="text-xs text-muted-foreground">Words</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.sentenceCount}</div>
        <div className="text-xs text-muted-foreground">Sentences</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold flex items-center justify-center gap-1">
          <Clock className="h-4 w-4" />
          {stats.estimatedReadingMinutes}m
        </div>
        <div className="text-xs text-muted-foreground">Reading</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold flex items-center justify-center gap-1">
          <Mic className="h-4 w-4" />
          {stats.estimatedSpeakingMinutes}m
        </div>
        <div className="text-xs text-muted-foreground">Speaking (TTS)</div>
      </div>
      <div className="text-center">
        <Badge
          className={cn(
            "text-xs",
            stats.readabilityScore === 'easy' && "bg-green-500/10 text-green-600 border-green-500/30",
            stats.readabilityScore === 'moderate' && "bg-amber-500/10 text-amber-600 border-amber-500/30",
            stats.readabilityScore === 'difficult' && "bg-red-500/10 text-red-600 border-red-500/30"
          )}
          variant="outline"
        >
          {stats.readabilityScore}
        </Badge>
        <div className="text-xs text-muted-foreground mt-1">Readability</div>
      </div>
    </div>
  );
}
