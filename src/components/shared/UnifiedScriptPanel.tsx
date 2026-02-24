/**
 * UnifiedScriptPanel — Shared Script Editor for Mind ↔ Cast
 *
 * Both Mind and Cast can operate in either mode:
 *   1. Single-document: Full editor with one textarea (quick-take, single narration)
 *   2. Multi-scene: Scene sidebar + per-scene editor (templates, podcast segments, chapters)
 *
 * Mode is DATA-DRIVEN — determined by the editor hook, not the product.
 *   - Mind single: quick video/audio script
 *   - Mind multi-scene: podcast segments, webcast chapters
 *   - Cast single: quick single-take video
 *   - Cast multi-scene: template-based multi-scene production
 *
 * Features:
 *   - Scene list with status badges (multi-scene mode)
 *   - Script textarea with live word count + duration estimate
 *   - Version switcher (original ↔ enhanced)
 *   - Visual prompt editor (for video-producing modes)
 *   - TTS config summary
 *   - Scene approval status
 *   - Add/remove scenes (multi-scene)
 */

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Check,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  Edit3,
  RotateCcw,
  Lock,
  Volume2,
  Video,
  GripVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { UnifiedEditorHook, SceneDocument, EditorMode } from '@/hooks/useUnifiedEditorState';

// ─── Types ──────────────────────────────────────────────────────────────────

interface UnifiedScriptPanelProps {
  /** The unified editor hook instance */
  editor: UnifiedEditorHook;
  /** Optional: compact mode for inline use */
  compact?: boolean;
  /** Optional: read-only mode */
  readOnly?: boolean;
  /** Optional: show visual prompt editor (Cast only) */
  showVisualPrompt?: boolean;
  /** Optional: custom actions slot (TTS button, enhance button, etc.) */
  renderActions?: (scene: SceneDocument) => React.ReactNode;
  /** Optional: custom header slot */
  renderHeader?: () => React.ReactNode;
  /** Optional: max height for the editor textarea */
  maxHeight?: string;
  /** Optional: class name */
  className?: string;
}

// ─── Status helpers ─────────────────────────────────────────────────────────

function getStatusBadge(scene: SceneDocument) {
  if (scene.status === 'locked') {
    return <Badge variant="outline" className="text-[9px] bg-slate-500/10 border-slate-500/30 text-slate-600"><Lock className="w-2.5 h-2.5 mr-0.5" />Locked</Badge>;
  }
  if (scene.status === 'approved') {
    return <Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-600"><Check className="w-2.5 h-2.5 mr-0.5" />Approved</Badge>;
  }
  if (scene.status === 'enhanced') {
    return <Badge variant="outline" className="text-[9px] bg-purple-500/10 border-purple-500/30 text-purple-600"><Sparkles className="w-2.5 h-2.5 mr-0.5" />Enhanced</Badge>;
  }
  if (scene.ttsStale || scene.videoStale) {
    return <Badge variant="outline" className="text-[9px] bg-amber-500/10 border-amber-500/30 text-amber-600"><AlertTriangle className="w-2.5 h-2.5 mr-0.5" />Stale</Badge>;
  }
  return <Badge variant="outline" className="text-[9px] text-muted-foreground"><Edit3 className="w-2.5 h-2.5 mr-0.5" />Draft</Badge>;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

// ─── Scene List Sidebar ─────────────────────────────────────────────────────

const SceneListSidebar: React.FC<{
  editor: UnifiedEditorHook;
  readOnly?: boolean;
}> = ({ editor, readOnly }) => {
  return (
    <div className="w-56 flex-shrink-0 border-r overflow-y-auto">
      <div className="p-2 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Scenes ({editor.scenes.length})
          </p>
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => editor.addScene(`Scene ${editor.scenes.length + 1}`)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-0.5 p-1">
        {editor.scenes.map((scene, i) => (
          <button
            key={scene.id}
            onClick={() => editor.setActiveSceneId(scene.id)}
            className={cn(
              'w-full text-left p-2 rounded-md transition-colors text-xs group',
              scene.id === editor.activeSceneId
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-muted/50'
            )}
          >
            <div className="flex items-center gap-1.5">
              {!readOnly && (
                <GripVertical className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <span className="font-medium truncate flex-1">{scene.title}</span>
              {scene.ttsGenerated && !scene.ttsStale && (
                <Volume2 className="w-3 h-3 text-green-500 flex-shrink-0" />
              )}
              {scene.videoGenerated && !scene.videoStale && (
                <Video className="w-3 h-3 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">
                {formatDuration(scene.durationSeconds)}
              </span>
              {getStatusBadge(scene)}
            </div>
          </button>
        ))}
      </div>

      {/* Summary footer */}
      <div className="p-2 border-t mt-auto">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Total: {formatDuration(editor.totalDurationSeconds)}</span>
          <span>{editor.totalWordCount} words</span>
        </div>
      </div>
    </div>
  );
};

// ─── Scene Editor ───────────────────────────────────────────────────────────

const SceneEditor: React.FC<{
  editor: UnifiedEditorHook;
  scene: SceneDocument;
  readOnly?: boolean;
  showVisualPrompt?: boolean;
  renderActions?: (scene: SceneDocument) => React.ReactNode;
  maxHeight?: string;
  compact?: boolean;
}> = ({ editor, scene, readOnly, showVisualPrompt, renderActions, maxHeight, compact }) => {
  const isLocked = scene.status === 'locked' || readOnly;
  const displayContent = scene.activeVersion === 'enhanced' && scene.enhancedContent
    ? scene.enhancedContent
    : scene.content;

  const wordCount = displayContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = displayContent.length;

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isLocked) return;
    editor.updateSceneContent(scene.id, e.target.value);
  }, [editor, scene.id, isLocked]);

  const handleVisualPromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isLocked) return;
    editor.updateVisualPrompt(scene.id, e.target.value);
  }, [editor, scene.id, isLocked]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Scene header */}
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {editor.mode === 'multi-scene' && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={editor.scenes.findIndex(s => s.id === scene.id) === 0}
                onClick={editor.goToPreviousScene}
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <span className="text-[10px] text-muted-foreground min-w-[3rem] text-center">
                {editor.scenes.findIndex(s => s.id === scene.id) + 1}/{editor.scenes.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={editor.scenes.findIndex(s => s.id === scene.id) === editor.scenes.length - 1}
                onClick={editor.goToNextScene}
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          )}
          <h4 className="text-sm font-medium truncate">{scene.title}</h4>
          {getStatusBadge(scene)}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Version switcher */}
          {scene.enhancedContent && (
            <div className="flex items-center gap-0.5 border rounded-md p-0.5">
              <Button
                variant={scene.activeVersion === 'original' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-5 text-[9px] px-1.5"
                onClick={() => editor.updateScene(scene.id, { activeVersion: 'original' })}
              >
                Original
              </Button>
              <Button
                variant={scene.activeVersion === 'enhanced' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-5 text-[9px] px-1.5"
                onClick={() => editor.updateScene(scene.id, { activeVersion: 'enhanced' })}
              >
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                Enhanced
              </Button>
            </div>
          )}

          {/* Revert button */}
          {scene.enhancedContent && !isLocked && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground"
              onClick={() => editor.revertToOriginal(scene.id)}
              title="Revert to original"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}

          {/* Delete scene (multi-scene only) */}
          {editor.mode === 'multi-scene' && !isLocked && editor.scenes.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive/60 hover:text-destructive"
              onClick={() => editor.removeScene(scene.id)}
              title="Remove scene"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Narration script */}
        <div>
          {editor.mode === 'multi-scene' && (
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Narration Script
            </label>
          )}
          <Textarea
            value={displayContent}
            onChange={handleContentChange}
            placeholder={editor.mode === 'multi-scene'
              ? `Write the narration for "${scene.title}"...`
              : 'Write your script here...'}
            disabled={isLocked}
            className={cn(
              'resize-none font-mono text-sm leading-relaxed',
              isLocked && 'opacity-60 cursor-not-allowed',
              compact ? 'min-h-[120px]' : 'min-h-[200px]',
            )}
            style={maxHeight ? { maxHeight } : undefined}
          />

          {/* Stats bar */}
          <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>{charCount} chars</span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                ~{formatDuration(scene.durationSeconds)} speaking
              </span>
            </div>
            <div className="flex items-center gap-2">
              {scene.ttsStale && (
                <span className="text-amber-500 flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" /> TTS outdated
                </span>
              )}
              {scene.videoStale && (
                <span className="text-amber-500 flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" /> Video outdated
                </span>
              )}
              {scene.version > 1 && (
                <span>v{scene.version}</span>
              )}
            </div>
          </div>
        </div>

        {/* Visual prompt editor (Cast only) */}
        {showVisualPrompt && editor.mode === 'multi-scene' && (
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Visual Prompt
              <span className="normal-case font-normal">(what the viewer sees)</span>
            </label>
            <Textarea
              value={scene.visualPrompt || ''}
              onChange={handleVisualPromptChange}
              placeholder="Describe the visual scene — camera angle, setting, action..."
              disabled={isLocked}
              className={cn(
                'resize-none text-xs min-h-[80px]',
                isLocked && 'opacity-60 cursor-not-allowed'
              )}
            />
            {scene.videoStale && !scene.ttsStale && (
              <p className="text-[10px] text-amber-500 mt-1">
                Visual prompt changed — video needs regeneration. TTS is still valid.
              </p>
            )}
          </div>
        )}

        {/* Speaker info */}
        {scene.speakerLabel && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Volume2 className="w-3 h-3" />
            Speaker: <span className="font-medium">{scene.speakerLabel}</span>
            {scene.characterVoice && (
              <Badge variant="outline" className="text-[9px]">{scene.characterVoice}</Badge>
            )}
          </div>
        )}

        {/* Duration constraints */}
        {scene.minDuration > 0 && scene.maxDuration > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Duration target: {formatDuration(scene.minDuration)} – {formatDuration(scene.maxDuration)}
            {(scene.durationSeconds < scene.minDuration || scene.durationSeconds > scene.maxDuration) && (
              <span className="text-amber-500 ml-1">
                (current: {formatDuration(scene.durationSeconds)} — outside range)
              </span>
            )}
          </div>
        )}

        {/* Custom actions slot */}
        {renderActions && (
          <div className="pt-2 border-t">
            {renderActions(scene)}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Panel ─────────────────────────────────────────────────────────────

export const UnifiedScriptPanel: React.FC<UnifiedScriptPanelProps> = ({
  editor,
  compact = false,
  readOnly = false,
  showVisualPrompt = false,
  renderActions,
  renderHeader,
  maxHeight,
  className,
}) => {
  const activeScene = editor.activeScene;

  if (!activeScene) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No script content yet</p>
          <p className="text-xs">Start writing or select a template to begin</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Optional custom header */}
      {renderHeader && (
        <CardHeader className="pb-2">
          {renderHeader()}
        </CardHeader>
      )}

      {/* Panel body */}
      <div className={cn(
        'flex',
        compact ? 'max-h-[400px]' : 'max-h-[600px]',
        maxHeight && `max-h-[${maxHeight}]`
      )}>
        {/* Scene sidebar (multi-scene only) */}
        {editor.mode === 'multi-scene' && !compact && (
          <SceneListSidebar editor={editor} readOnly={readOnly} />
        )}

        {/* Scene editor */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScene.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col min-w-0"
          >
            <SceneEditor
              editor={editor}
              scene={activeScene}
              readOnly={readOnly}
              showVisualPrompt={showVisualPrompt}
              renderActions={renderActions}
              maxHeight={maxHeight}
              compact={compact}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Summary footer (multi-scene mode) */}
      {editor.mode === 'multi-scene' && !compact && (
        <div className="px-3 py-2 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{editor.scenes.length} scenes</span>
            <span>{editor.totalWordCount} words total</span>
            <span>{formatDuration(editor.totalDurationSeconds)} total</span>
          </div>
          <div className="flex items-center gap-2">
            {editor.scenesStale > 0 && (
              <Badge variant="outline" className="text-[9px] bg-amber-500/10 border-amber-500/30 text-amber-600">
                {editor.scenesStale} stale
              </Badge>
            )}
            {editor.allApproved && (
              <Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-600">
                <Check className="w-2.5 h-2.5 mr-0.5" />
                All approved
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
