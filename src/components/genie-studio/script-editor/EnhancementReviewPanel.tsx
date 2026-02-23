/**
 * Enhancement Review Panel - Displays AI enhancement results for review
 * Includes engagement score, enhancement summary, change-by-change review,
 * inline editing, and version comparison
 * Extracted from ScriptEditorTab.tsx
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Wand2,
  Sparkles,
  Save,
  Check,
  X,
  Loader2,
  FileText,
  FileCheck,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EnhancementChange, EnhancementMarkers, EngagementScore, ScriptStats } from './types';

interface EnhancementReviewPanelProps {
  enhancedContent: string;
  originalContent: string | null;
  enhancementChanges: EnhancementChange[];
  reviewProgress: number;
  engagementScore: EngagementScore | null;
  enhancementMarkers: EnhancementMarkers | null;
  originalStats: ScriptStats | null;
  enhancedStats: ScriptStats | null;
  isEnhancing: boolean;
  isSavingDraft: boolean;
  editingChangeId: string | null;
  editedEnhancedText: string;
  onAcceptChange: (changeId: string) => void;
  onSkipChange: (changeId: string) => void;
  onAcceptAll: () => void;
  onSkipAll: () => void;
  onCompleteEnhancement: () => void;
  onSaveDraft: () => void;
  onClose: () => void;
  onRequestNewEnhancement: () => void;
  onStartEdit: (changeId: string, enhancedText: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (changeId: string, original: string, editedText: string) => void;
  onSetEditedText: (text: string) => void;
  onApplyChange: (original: string, enhanced: string) => void;
}

export function EnhancementReviewPanel({
  enhancedContent,
  originalContent,
  enhancementChanges,
  reviewProgress,
  engagementScore,
  enhancementMarkers,
  originalStats,
  enhancedStats,
  isEnhancing,
  isSavingDraft,
  editingChangeId,
  editedEnhancedText,
  onAcceptChange,
  onSkipChange,
  onAcceptAll,
  onSkipAll,
  onCompleteEnhancement,
  onSaveDraft,
  onClose,
  onRequestNewEnhancement,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSetEditedText,
  onApplyChange,
}: EnhancementReviewPanelProps) {
  return (
    <div className="mb-6 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-500" />
          Review AI Enhancements ({enhancementChanges.filter(c => c.accepted !== null).length}/{enhancementChanges.length})
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestNewEnhancement}
            disabled={isEnhancing}
            className="gap-1"
          >
            {isEnhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Request New Enhancement
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveDraft} disabled={isSavingDraft}>
            {isSavingDraft ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save Draft
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-2">

      {/* Engagement Score */}
      {engagementScore && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Engagement Score
            </Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                Before: {engagementScore.before}/10
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                After: {engagementScore.after}/10
              </Badge>
            </div>
          </div>
          {engagementScore.improvements?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {engagementScore.improvements.slice(0, 4).map((imp, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">{imp}</Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhancement Summary */}
      {enhancementMarkers && (
        <div className="mb-4 p-3 rounded-lg bg-background border grid grid-cols-5 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-blue-500">{enhancementMarkers.pausesAdded}</p>
            <p className="text-[10px] text-muted-foreground">Pauses</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-500">{enhancementMarkers.sectionBreaksAdded}</p>
            <p className="text-[10px] text-muted-foreground">Breaks</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-500">{enhancementMarkers.sentencesRewritten}</p>
            <p className="text-[10px] text-muted-foreground">Rewritten</p>
          </div>
          <div>
            <p className="text-xl font-bold text-orange-500">{enhancementMarkers.engagementHooksAdded || 0}</p>
            <p className="text-[10px] text-muted-foreground">Hooks</p>
          </div>
          <div>
            <p className="text-xl font-bold text-pink-500">{enhancementMarkers.conversationalChanges || 0}</p>
            <p className="text-[10px] text-muted-foreground">Conversational</p>
          </div>
        </div>
      )}

      {/* Review Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Review Progress: {enhancementChanges.filter(c => c.accepted !== null).length}/{enhancementChanges.length}
          </span>
          <span className="text-sm font-medium">{reviewProgress}%</span>
        </div>
        <Progress value={reviewProgress} className="h-2" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={onSkipAll}>
          <X className="h-4 w-4 mr-1" />
          Skip All Remaining
        </Button>
        <Button size="sm" onClick={onAcceptAll} className="bg-green-500 hover:bg-green-600">
          <Check className="h-4 w-4 mr-1" />
          Accept All
        </Button>
      </div>

      {/* Changes List */}
      <div className="space-y-3 mb-4">
        {enhancementChanges.map((change, index) => (
          <div
            key={change.id}
            className={cn(
              "p-3 rounded-lg border bg-background",
              change.accepted === true && "border-green-500/30 bg-green-500/5",
              change.accepted === false && "border-red-500/30 bg-red-500/5 opacity-60"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">{change.type}</Badge>
                <span className="text-xs text-muted-foreground">Change {index + 1}</span>
              </div>
              {change.accepted === null ? (
                editingChangeId === change.id ? (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 border-green-500/30 hover:bg-green-500/10"
                      onClick={() => onSaveEdit(change.id, change.original, editedEnhancedText)}
                    >
                      <Check className="h-3 w-3 text-green-600 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={onCancelEdit}
                    >
                      <X className="h-3 w-3 text-muted-foreground mr-1" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 border-green-500/30 hover:bg-green-500/10"
                      onClick={() => {
                        if (change.original && change.enhanced) {
                          onApplyChange(change.original, change.enhanced);
                        }
                        onAcceptChange(change.id);
                      }}
                    >
                      <Wand2 className="h-3 w-3 text-green-600 mr-1" />
                      Apply Fix
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 border-blue-500/30 hover:bg-blue-500/10"
                      onClick={() => onStartEdit(change.id, change.enhanced || '')}
                    >
                      <Edit3 className="h-3 w-3 text-blue-600 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => onSkipChange(change.id)}
                    >
                      <X className="h-3 w-3 text-muted-foreground mr-1" />
                      Dismiss
                    </Button>
                  </div>
                )
              ) : (
                <Badge variant={change.accepted ? 'default' : 'secondary'} className="text-xs">
                  {change.accepted ? 'Accepted' : 'Skipped'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{change.reason}</p>
            {change.original && (
              <p className="text-sm text-red-500/80 line-through mb-1">{change.original}</p>
            )}
            {editingChangeId === change.id ? (
              <textarea
                value={editedEnhancedText}
                onChange={(e) => onSetEditedText(e.target.value)}
                className="w-full p-2 text-sm border border-blue-500/50 rounded-md bg-blue-500/5 focus:ring-2 focus:ring-blue-500/30 focus:outline-none min-h-[80px] resize-y"
                placeholder="Edit the enhanced text..."
                autoFocus
              />
            ) : (
              change.enhanced && (
                <p className="text-sm text-green-600">{change.enhanced}</p>
              )
            )}
          </div>
        ))}
      </div>

      {/* Compare Versions */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-lg border bg-background">
          <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Original ({originalStats?.wordCount || 0} words, ~{originalStats?.estimatedSpeakingMinutes || 0}m)
          </Label>
          <p className="text-sm line-clamp-4">{originalContent?.slice(0, 300)}...</p>
        </div>
        <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5">
          <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Enhanced ({enhancedStats?.wordCount || 0} words, ~{enhancedStats?.estimatedSpeakingMinutes || 0}m)
          </Label>
          <p className="text-sm line-clamp-4">{enhancedContent?.slice(0, 300)}...</p>
        </div>
      </div>

      {/* Complete Button */}
      <Button
        onClick={onCompleteEnhancement}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        disabled={reviewProgress < 100}
      >
        <FileCheck className="h-4 w-4 mr-2" />
        Complete Enhancement & Apply Changes
      </Button>
      </ScrollArea>
    </div>
  );
}
