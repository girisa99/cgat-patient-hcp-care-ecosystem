/**
 * SceneAwareTeleprompter — Scene-by-Scene Script Display with Sync
 *
 * Unlike the Recording Studio's flat-text teleprompter, this one:
 *   - Knows which SCENE is currently active (from playhead position)
 *   - Highlights the active scene's text with word-level cursor
 *   - Shows previous/next scene context
 *   - Shows scene completion status (TTS ready, video ready, etc.)
 *   - Allows inline script editing with auto-invalidation
 *   - Shows chapter groupings
 *
 * Works with useProductionSession to stay synchronized with the timeline.
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Check,
  Edit3,
  Save,
  X,
  Mic,
  Volume2,
  Film,
  AlertTriangle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Type,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductionSessionHook, SceneProductionState, SceneMediaState } from '@/hooks/video-editing/useProductionSession';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SceneAwareTeleprompterProps {
  productionSession: ProductionSessionHook;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeekToScene: (sceneIndex: number) => void;
  onRegenerateTTS?: (sceneId: string) => void;
  onRegenerateVideo?: (sceneId: string) => void;
  onRecordScene?: (sceneId: string) => void;
  compact?: boolean;
  className?: string;
}

// ─── Status Config ──────────────────────────────────────────────────────────

const MEDIA_STATE_CONFIG: Record<SceneMediaState, { label: string; color: string; icon: React.ElementType }> = {
  empty: { label: 'Empty', color: 'text-muted-foreground', icon: Type },
  script_only: { label: 'Script', color: 'text-amber-500', icon: Type },
  tts_ready: { label: 'TTS Ready', color: 'text-blue-500', icon: Volume2 },
  video_ready: { label: 'Video Ready', color: 'text-purple-500', icon: Film },
  recording_ready: { label: 'Recorded', color: 'text-emerald-500', icon: Mic },
  complete: { label: 'Complete', color: 'text-emerald-600', icon: Check },
  stale: { label: 'Stale', color: 'text-red-500', icon: AlertTriangle },
};

// ─── Scene Block ────────────────────────────────────────────────────────────

function SceneBlock({
  scene,
  isActive,
  wordIndex,
  isEditing,
  editMode,
  editText,
  editVisualPrompt,
  onStartEditScript,
  onStartEditVisual,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onVisualPromptChange,
  onSeek,
  onRegenerateTTS,
  onRegenerateVideo,
  onRecord,
  compact,
}: {
  scene: SceneProductionState;
  isActive: boolean;
  wordIndex: number;
  isEditing: boolean;
  editMode: 'script' | 'visual';
  editText: string;
  editVisualPrompt: string;
  onStartEditScript: () => void;
  onStartEditVisual: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (text: string) => void;
  onVisualPromptChange: (text: string) => void;
  onSeek: () => void;
  onRegenerateTTS?: () => void;
  onRegenerateVideo?: () => void;
  onRecord?: () => void;
  compact?: boolean;
}) {
  const blockRef = useRef<HTMLDivElement>(null);
  const mediaConfig = MEDIA_STATE_CONFIG[scene.mediaState];
  const MediaIcon = mediaConfig.icon;

  // Auto-scroll active scene into view
  useEffect(() => {
    if (isActive && blockRef.current) {
      blockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

  // Render script text with word highlighting
  const renderHighlightedText = () => {
    const words = scene.scriptText.split(/(\s+)/);
    let wordCounter = 0;

    return words.map((token, i) => {
      if (token.match(/^\s+$/)) {
        return <span key={i}>{token}</span>;
      }

      const idx = wordCounter;
      wordCounter++;

      const isCurrentWord = isActive && idx === wordIndex;
      const isPastWord = isActive && idx < wordIndex;

      return (
        <span
          key={i}
          className={cn(
            'transition-colors duration-150',
            isCurrentWord && 'bg-primary text-primary-foreground rounded px-0.5 font-bold',
            isPastWord && 'text-muted-foreground',
            !isActive && 'text-foreground/70',
          )}
        >
          {token}
        </span>
      );
    });
  };

  return (
    <div
      ref={blockRef}
      className={cn(
        'relative rounded-lg border p-3 transition-all cursor-pointer',
        isActive
          ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
          : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/10',
        scene.isStale && 'border-red-400/30 bg-red-50/5',
      )}
      onClick={onSeek}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? 'default' : 'outline'} className="text-[9px] h-4 px-1.5">
            Scene {scene.sceneIndex + 1}
          </Badge>
          <span className="text-xs font-medium truncate max-w-[200px]">{scene.title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Duration */}
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {(scene.actualAudioDurationMs > 0
              ? scene.actualAudioDurationMs / 1000
              : scene.scriptedDurationMs / 1000
            ).toFixed(1)}s
          </span>

          {/* Media status */}
          <div className={cn('flex items-center gap-0.5', mediaConfig.color)}>
            <MediaIcon className="h-3 w-3" />
            {!compact && <span className="text-[9px]">{mediaConfig.label}</span>}
          </div>

          {/* Mismatch warning */}
          {scene.durationMismatchMs > 500 && (
            <Badge variant="destructive" className="text-[8px] h-3.5 px-1">
              {(scene.durationMismatchMs / 1000).toFixed(1)}s drift
            </Badge>
          )}
        </div>
      </div>

      {/* Narration Script (what speaker SAYS) */}
      {isEditing && editMode === 'script' ? (
        <div className="space-y-2">
          <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Narration Script (TTS)</div>
          <Textarea
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            className="text-sm min-h-[80px]"
            autoFocus
          />
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={onCancelEdit}>
              <X className="h-3 w-3" />
              Cancel
            </Button>
            <Button size="sm" className="h-6 text-xs gap-1" onClick={onSaveEdit}>
              <Save className="h-3 w-3" />
              Save & Regenerate Audio
            </Button>
          </div>
        </div>
      ) : isEditing && editMode === 'visual' ? (
        <div className="space-y-2">
          <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Visual Direction (Video Gen)</div>
          <Textarea
            value={editVisualPrompt}
            onChange={(e) => onVisualPromptChange(e.target.value)}
            className="text-sm min-h-[60px] border-purple-300/30"
            autoFocus
          />
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={onCancelEdit}>
              <X className="h-3 w-3" />
              Cancel
            </Button>
            <Button size="sm" className="h-6 text-xs gap-1 bg-purple-600 hover:bg-purple-700" onClick={onSaveEdit}>
              <Save className="h-3 w-3" />
              Save & Regenerate Video
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Narration text with word-level highlighting */}
          <div className={cn(
            'text-sm leading-relaxed',
            compact ? 'line-clamp-3' : 'max-h-[120px] overflow-y-auto',
          )}>
            {isActive ? renderHighlightedText() : (
              <span className="text-foreground/70">{scene.scriptText}</span>
            )}
          </div>

          {/* Visual prompt (collapsed by default, shown on active or hover) */}
          {scene.visualPrompt && (isActive || !compact) && (
            <div className={cn(
              'text-[11px] leading-relaxed pl-2 border-l-2 border-purple-400/30',
              compact ? 'line-clamp-2' : 'max-h-[60px] overflow-y-auto',
              scene.isVideoStale && 'border-red-400/30',
            )}>
              <span className="text-[9px] text-purple-500/80 font-medium mr-1">VISUAL:</span>
              <span className="text-foreground/50">{scene.visualPrompt}</span>
              {scene.isVideoStale && (
                <Badge variant="destructive" className="text-[7px] h-3 px-1 ml-1 inline-flex">stale</Badge>
              )}
            </div>
          )}

          {/* Podcast metadata */}
          {scene.musicBedCue && (
            <div className="text-[10px] text-amber-500/70 flex items-center gap-1">
              <Volume2 className="h-2.5 w-2.5" />
              {scene.musicBedCue}
            </div>
          )}
          {scene.speakerLabel && (
            <div className="text-[10px] text-blue-500/70 flex items-center gap-1">
              <Mic className="h-2.5 w-2.5" />
              {scene.speakerLabel}
            </div>
          )}
        </div>
      )}

      {/* Action buttons (shown on hover or active) */}
      {!isEditing && (isActive || !compact) && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-muted/30 flex-wrap">
          <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1" onClick={(e) => { e.stopPropagation(); onStartEditScript(); }}>
            <Edit3 className="h-3 w-3" />
            Edit Script
          </Button>
          <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1 text-purple-500" onClick={(e) => { e.stopPropagation(); onStartEditVisual(); }}>
            <Film className="h-3 w-3" />
            Edit Visual
          </Button>
          {onRegenerateTTS && (scene.isStale || scene.mediaState === 'script_only') && (
            <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1" onClick={(e) => { e.stopPropagation(); onRegenerateTTS(); }}>
              <RefreshCw className="h-3 w-3" />
              Gen TTS
            </Button>
          )}
          {onRegenerateVideo && (scene.isVideoStale || scene.mediaState === 'script_only') && (
            <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1 text-purple-500" onClick={(e) => { e.stopPropagation(); onRegenerateVideo(); }}>
              <RefreshCw className="h-3 w-3" />
              Gen Video
            </Button>
          )}
          {onRecord && (
            <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1" onClick={(e) => { e.stopPropagation(); onRecord(); }}>
              <Mic className="h-3 w-3" />
              Record
            </Button>
          )}
          {scene.audioSource !== 'none' && scene.audioSource === 'recording' && (
            <Badge variant="outline" className="text-[8px] h-4 ml-auto">
              <Mic className="h-2.5 w-2.5 mr-0.5" />
              Voiceover
            </Badge>
          )}
          {scene.audioSource === 'tts' && (
            <Badge variant="outline" className="text-[8px] h-4 ml-auto">
              <Volume2 className="h-2.5 w-2.5 mr-0.5" />
              TTS
            </Badge>
          )}
          {scene.segmentType !== 'narration' && (
            <Badge variant="secondary" className="text-[7px] h-3.5 ml-auto">
              {scene.segmentType.replace('_', ' ')}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SceneAwareTeleprompter({
  productionSession,
  isPlaying,
  onPlay,
  onPause,
  onSeekToScene,
  onRegenerateTTS,
  onRegenerateVideo,
  onRecordScene,
  compact = false,
  className,
}: SceneAwareTeleprompterProps) {
  const { session, updateSceneScript, updateSceneVisualPrompt } = productionSession;
  const { teleprompterCursor, scenes } = session;
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'script' | 'visual'>('script');
  const [editText, setEditText] = useState('');
  const [editVisualPrompt, setEditVisualPrompt] = useState('');

  const handleStartEditScript = useCallback((sceneId: string) => {
    const scene = scenes.find(s => s.sceneId === sceneId);
    if (!scene) return;
    setEditingSceneId(sceneId);
    setEditMode('script');
    setEditText(scene.scriptText);
    setEditVisualPrompt(scene.visualPrompt || '');
  }, [scenes]);

  const handleStartEditVisual = useCallback((sceneId: string) => {
    const scene = scenes.find(s => s.sceneId === sceneId);
    if (!scene) return;
    setEditingSceneId(sceneId);
    setEditMode('visual');
    setEditText(scene.scriptText);
    setEditVisualPrompt(scene.visualPrompt || '');
  }, [scenes]);

  const handleSaveEdit = useCallback(() => {
    if (!editingSceneId) return;
    if (editMode === 'script') {
      updateSceneScript(editingSceneId, editText);
    } else {
      updateSceneVisualPrompt(editingSceneId, editVisualPrompt);
    }
    setEditingSceneId(null);
  }, [editingSceneId, editMode, editText, editVisualPrompt, updateSceneScript, updateSceneVisualPrompt]);

  const handleCancelEdit = useCallback(() => {
    setEditingSceneId(null);
    setEditText('');
    setEditVisualPrompt('');
  }, []);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Type className="w-4 h-4" />
              Teleprompter
              {teleprompterCursor.activeSceneTitle && (
                <Badge variant="secondary" className="text-[9px]">
                  Scene {teleprompterCursor.activeSceneIndex + 1}: {teleprompterCursor.activeSceneTitle}
                </Badge>
              )}
            </CardTitle>
            {!compact && (
              <CardDescription className="text-xs mt-0.5">
                Scene-aware script with word-level sync — edit any scene to auto-regenerate
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1"
              onClick={isPlaying ? onPause : onPlay}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            {/* Progress */}
            <div className="text-[10px] text-muted-foreground">
              {teleprompterCursor.overallWordIndex}/{teleprompterCursor.overallTotalWords} words
              ({Math.round(teleprompterCursor.overallProgress * 100)}%)
            </div>

            {/* Format badge */}
            <Badge variant="outline" className="text-[9px] capitalize">
              {session.format}
            </Badge>

            {/* Stale count (script changes) */}
            {session.scenesStale > 0 && (
              <Badge variant="destructive" className="text-[9px]">
                {session.scenesStale} audio stale
              </Badge>
            )}

            {/* Video stale count (visual prompt changes) */}
            {session.scenesWithVideoStale > 0 && (
              <Badge variant="destructive" className="text-[9px] bg-purple-600">
                {session.scenesWithVideoStale} video stale
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Scene navigation */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-y bg-muted/10 overflow-x-auto">
          {scenes.map((scene, i) => {
            const isActive = i === teleprompterCursor.activeSceneIndex;
            const config = MEDIA_STATE_CONFIG[scene.mediaState];
            return (
              <Button
                key={scene.sceneId}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-6 text-[10px] gap-1 flex-shrink-0',
                  !isActive && config.color,
                )}
                onClick={() => onSeekToScene(i)}
              >
                S{i + 1}
                {scene.isStale && <AlertTriangle className="h-2.5 w-2.5 text-red-400" />}
              </Button>
            );
          })}
        </div>

        {/* Scene list */}
        <ScrollArea className={compact ? 'max-h-[300px]' : 'max-h-[500px]'}>
          <div className="space-y-2 p-3">
            {scenes.map((scene, i) => (
              <SceneBlock
                key={scene.sceneId}
                scene={scene}
                isActive={i === teleprompterCursor.activeSceneIndex}
                wordIndex={i === teleprompterCursor.activeSceneIndex ? teleprompterCursor.wordIndexInScene : 0}
                isEditing={editingSceneId === scene.sceneId}
                editMode={editMode}
                editText={editText}
                editVisualPrompt={editVisualPrompt}
                onStartEditScript={() => handleStartEditScript(scene.sceneId)}
                onStartEditVisual={() => handleStartEditVisual(scene.sceneId)}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditChange={setEditText}
                onVisualPromptChange={setEditVisualPrompt}
                onSeek={() => onSeekToScene(i)}
                onRegenerateTTS={onRegenerateTTS ? () => onRegenerateTTS(scene.sceneId) : undefined}
                onRegenerateVideo={onRegenerateVideo ? () => onRegenerateVideo(scene.sceneId) : undefined}
                onRecord={onRecordScene ? () => onRecordScene(scene.sceneId) : undefined}
                compact={compact}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Footer stats */}
        <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] text-muted-foreground border-t bg-muted/10">
          <span>{session.totalScenes} scenes</span>
          <span className="text-emerald-600">{session.scenesWithAudio} audio</span>
          <span className="text-purple-600">{session.scenesWithVideo} video</span>
          {session.scenesStale > 0 && <span className="text-red-500">{session.scenesStale} script stale</span>}
          {session.scenesWithVideoStale > 0 && <span className="text-purple-500">{session.scenesWithVideoStale} visual stale</span>}
          <span className="ml-auto">
            {session.isReadyForAssembly ? (
              <span className="text-emerald-600 font-medium">Ready for assembly</span>
            ) : (
              <span className="text-amber-600">Not ready — generate all audio & video first</span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default SceneAwareTeleprompter;
