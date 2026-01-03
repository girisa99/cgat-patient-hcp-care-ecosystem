/**
 * Inline Script Diff Component
 * Shows changes highlighted within the original script context
 * with accept/reject functionality for each change
 */

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScriptChange {
  id: string;
  type: 'pause' | 'break' | 'engagement' | 'conversational' | 'hook' | 'transition' | 'cta' | 'pacing' | 'modification' | 'addition' | 'removal';
  original: string;
  enhanced: string;
  reason: string;
  position?: 'start' | 'middle' | 'end';
  accepted: boolean | null;
}

interface InlineScriptDiffProps {
  originalScript: string;
  changes: ScriptChange[];
  onAcceptChange: (changeId: string) => void;
  onRejectChange: (changeId: string) => void;
  className?: string;
}

// Helper to find where a change should be inserted in the script
function findChangePosition(script: string, original: string): number {
  if (!original || original.trim() === '') return -1;
  
  // Try exact match first
  const exactIndex = script.indexOf(original);
  if (exactIndex !== -1) return exactIndex;
  
  // Try normalized match (remove extra whitespace)
  const normalizedScript = script.replace(/\s+/g, ' ');
  const normalizedOriginal = original.replace(/\s+/g, ' ');
  const normalizedIndex = normalizedScript.indexOf(normalizedOriginal);
  
  if (normalizedIndex !== -1) {
    // Map back to original position (approximate)
    return normalizedIndex;
  }
  
  // Try partial match (first 50 chars)
  const partialOriginal = normalizedOriginal.slice(0, 50);
  const partialIndex = normalizedScript.indexOf(partialOriginal);
  if (partialIndex !== -1) return partialIndex;
  
  return -1;
}

// Parse script into segments with changes inline
interface ScriptSegment {
  type: 'text' | 'change';
  content: string;
  change?: ScriptChange;
}

function parseScriptWithChanges(script: string, changes: ScriptChange[]): ScriptSegment[] {
  if (!script || changes.length === 0) {
    return [{ type: 'text', content: script || '' }];
  }

  // Find positions for all changes
  const positionedChanges = changes
    .map(change => ({
      change,
      pos: findChangePosition(script, change.original),
      length: change.original?.length || 0
    }))
    .filter(c => c.pos !== -1)
    .sort((a, b) => a.pos - b.pos);

  if (positionedChanges.length === 0) {
    // No changes could be positioned, show all as separate
    return [{ type: 'text', content: script }];
  }

  const segments: ScriptSegment[] = [];
  let lastEnd = 0;

  for (const item of positionedChanges) {
    // Add text before this change
    if (item.pos > lastEnd) {
      segments.push({
        type: 'text',
        content: script.slice(lastEnd, item.pos)
      });
    }

    // Add the change segment
    segments.push({
      type: 'change',
      content: item.change.original,
      change: item.change
    });

    lastEnd = item.pos + item.length;
  }

  // Add remaining text after last change
  if (lastEnd < script.length) {
    segments.push({
      type: 'text',
      content: script.slice(lastEnd)
    });
  }

  return segments;
}

// Get color classes based on change type
function getChangeTypeColors(type: ScriptChange['type']) {
  switch (type) {
    case 'pause':
    case 'break':
      return {
        badge: 'border-amber-500 text-amber-600 bg-amber-500/10',
        highlight: 'bg-amber-500/20 border-amber-500/40',
        icon: '⏸️'
      };
    case 'engagement':
    case 'hook':
    case 'cta':
      return {
        badge: 'border-purple-500 text-purple-600 bg-purple-500/10',
        highlight: 'bg-purple-500/20 border-purple-500/40',
        icon: '✨'
      };
    case 'conversational':
    case 'transition':
      return {
        badge: 'border-blue-500 text-blue-600 bg-blue-500/10',
        highlight: 'bg-blue-500/20 border-blue-500/40',
        icon: '💬'
      };
    case 'pacing':
      return {
        badge: 'border-cyan-500 text-cyan-600 bg-cyan-500/10',
        highlight: 'bg-cyan-500/20 border-cyan-500/40',
        icon: '⏱️'
      };
    case 'addition':
      return {
        badge: 'border-green-500 text-green-600 bg-green-500/10',
        highlight: 'bg-green-500/20 border-green-500/40',
        icon: '➕'
      };
    case 'removal':
      return {
        badge: 'border-red-500 text-red-600 bg-red-500/10',
        highlight: 'bg-red-500/20 border-red-500/40',
        icon: '➖'
      };
    default:
      return {
        badge: 'border-primary text-primary bg-primary/10',
        highlight: 'bg-primary/20 border-primary/40',
        icon: '📝'
      };
  }
}

export function InlineScriptDiff({
  originalScript,
  changes,
  onAcceptChange,
  onRejectChange,
  className
}: InlineScriptDiffProps) {
  const segments = useMemo(
    () => parseScriptWithChanges(originalScript, changes),
    [originalScript, changes]
  );

  // Get unpositioned changes (couldn't find in script)
  const unpositionedChanges = useMemo(() => {
    return changes.filter(change => {
      const pos = findChangePosition(originalScript, change.original);
      return pos === -1;
    });
  }, [originalScript, changes]);

  const pendingCount = changes.filter(c => c.accepted === null).length;
  const acceptedCount = changes.filter(c => c.accepted === true).length;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Stats header */}
      <div className="flex items-center justify-between px-1 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Review Changes in Context</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="text-amber-600 border-amber-500">
            {pendingCount} pending
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-500">
            {acceptedCount} accepted
          </Badge>
        </div>
      </div>

      {/* Inline diff view - with explicit height for scrolling */}
      <ScrollArea className="h-[250px] rounded-lg border bg-muted/20 p-4">
        <div className="text-sm leading-relaxed whitespace-pre-wrap pr-3">
          {segments.map((segment, idx) => {
            if (segment.type === 'text') {
              return (
                <span key={idx} className="text-foreground">
                  {segment.content}
                </span>
              );
            }

            const change = segment.change!;
            const colors = getChangeTypeColors(change.type);
            const isResolved = change.accepted !== null;

            return (
              <span
                key={idx}
                className={cn(
                  "relative inline-block rounded border px-1 py-0.5 mx-0.5 transition-all",
                  colors.highlight,
                  isResolved && change.accepted && "bg-green-500/30 border-green-500/50",
                  isResolved && !change.accepted && "bg-red-500/20 border-red-500/30 opacity-50 line-through"
                )}
              >
                {/* Change indicator tooltip */}
                <span className="group relative cursor-pointer">
                  {/* Show enhanced version if accepted, original otherwise */}
                  {change.accepted === true ? (
                    <span className="font-medium text-green-700">{change.enhanced}</span>
                  ) : change.accepted === false ? (
                    <span className="text-muted-foreground">{change.original}</span>
                  ) : (
                    <>
                      <span className="line-through text-red-600/70 mr-1">{change.original}</span>
                      <span className="font-medium text-green-700">{change.enhanced}</span>
                    </>
                  )}

                  {/* Hover tooltip with details and actions */}
                  {!isResolved && (
                    <span className="absolute left-0 top-full mt-1 z-50 hidden group-hover:flex flex-col gap-2 w-64 p-3 rounded-lg bg-popover border shadow-lg text-xs">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-[9px] h-4", colors.badge)}>
                          {colors.icon} {change.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground italic">{change.reason}</p>
                      <div className="flex gap-1 pt-1 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-[10px] gap-1 border-green-500/50 text-green-600 hover:bg-green-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcceptChange(change.id);
                          }}
                        >
                          <Check className="w-3 h-3" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-[10px] gap-1 border-red-500/50 text-red-600 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRejectChange(change.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </Button>
                      </div>
                    </span>
                  )}
                </span>

                {/* Quick action buttons (visible without hover for pending changes) */}
                {!isResolved && (
                  <span className="inline-flex gap-0.5 ml-1 align-middle">
                    <button
                      className="inline-flex items-center justify-center w-4 h-4 rounded bg-green-500/20 hover:bg-green-500/40 transition-colors"
                      onClick={() => onAcceptChange(change.id)}
                      title="Accept change"
                    >
                      <Check className="w-2.5 h-2.5 text-green-700" />
                    </button>
                    <button
                      className="inline-flex items-center justify-center w-4 h-4 rounded bg-red-500/20 hover:bg-red-500/40 transition-colors"
                      onClick={() => onRejectChange(change.id)}
                      title="Reject change"
                    >
                      <X className="w-2.5 h-2.5 text-red-700" />
                    </button>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </ScrollArea>

      {/* Unpositioned changes (couldn't match in script) */}
      {unpositionedChanges.length > 0 && (
        <div className="space-y-2 border rounded-md p-3 bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground">
            Additional Suggestions ({unpositionedChanges.length})
          </span>
          <div className="space-y-2">
            {unpositionedChanges.map(change => {
              const colors = getChangeTypeColors(change.type);
              const isResolved = change.accepted !== null;

              return (
                <div
                  key={change.id}
                  className={cn(
                    "p-2 rounded text-xs border transition-all",
                    isResolved && change.accepted && "bg-green-500/15 border-green-500/40",
                    isResolved && !change.accepted && "bg-red-500/10 border-red-500/30 opacity-40",
                    !isResolved && "bg-background border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Badge className={cn("text-[9px] h-4", colors.badge)}>
                          {colors.icon} {change.type}
                        </Badge>
                        <span className="text-muted-foreground italic truncate">{change.reason}</span>
                      </div>
                      {change.original && (
                        <p className="text-red-600/70 line-through text-[11px]">
                          {change.original.slice(0, 100)}{change.original.length > 100 ? '...' : ''}
                        </p>
                      )}
                      <p className="text-green-700 font-medium text-[11px]">
                        {change.enhanced.slice(0, 100)}{change.enhanced.length > 100 ? '...' : ''}
                      </p>
                    </div>
                    {!isResolved && (
                      <div className="flex gap-0.5 shrink-0">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 border-green-500/30 hover:bg-green-500/10"
                          onClick={() => onAcceptChange(change.id)}
                        >
                          <Check className="w-3 h-3 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => onRejectChange(change.id)}
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
