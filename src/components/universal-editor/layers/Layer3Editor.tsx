/**
 * Layer 3: ADAPTIVE EDITOR
 * Canvas Mode | Timeline Mode | Document Mode | Hybrid Mode
 * Seamless mode switching + Unified element library
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Layout, Film, FileText, Layers, Grid3X3, Move, 
  ZoomIn, ZoomOut, Maximize, Hand, MousePointer,
  Plus, Copy, Trash2, Lock, Unlock, Eye, EyeOff,
  AlignLeft, AlignCenter, AlignRight, RotateCw,
  Undo, Redo, Save, Play, Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditor } from '../context/EditorContext';
import type { EditorMode, UniversalElement, ElementType } from '../types';

// ============================================================================
// MODE ICONS & LABELS
// ============================================================================

const MODE_CONFIG: Record<EditorMode, { icon: React.ReactNode; label: string; description: string }> = {
  canvas: {
    icon: <Layout className="h-4 w-4" />,
    label: 'Canvas',
    description: 'Free-form editing for presentations and graphics',
  },
  timeline: {
    icon: <Film className="h-4 w-4" />,
    label: 'Timeline',
    description: 'Track-based editing for video and audio',
  },
  document: {
    icon: <FileText className="h-4 w-4" />,
    label: 'Document',
    description: 'Linear editing for documents and scripts',
  },
  hybrid: {
    icon: <Layers className="h-4 w-4" />,
    label: 'Hybrid',
    description: 'Split view combining canvas and timeline',
  },
};

// ============================================================================
// EDITOR TOOLBAR
// ============================================================================

interface EditorToolbarProps {
  className?: string;
}

export function EditorToolbar({ className }: EditorToolbarProps) {
  const {
    project,
    setMode,
    getRecommendedMode,
    zoomIn,
    zoomOut,
    fitToScreen,
    updateViewport,
    undo,
    redo,
    save,
    canUndo,
    canRedo,
    isDirty,
  } = useEditor();

  const [tool, setTool] = useState<'select' | 'pan' | 'zoom'>('select');

  const recommendedMode = getRecommendedMode();

  return (
    <TooltipProvider>
      <div className={cn(
        "flex items-center justify-between gap-2 px-3 py-2 border-b bg-background",
        className
      )}>
        {/* Left: Mode Switcher */}
        <div className="flex items-center gap-2">
          <Tabs value={project.mode} onValueChange={(v) => setMode(v as EditorMode)}>
            <TabsList className="h-8">
              {Object.entries(MODE_CONFIG).map(([mode, config]) => (
                <Tooltip key={mode}>
                  <TooltipTrigger asChild>
                    <TabsTrigger value={mode} className="h-7 px-2 gap-1.5">
                      {config.icon}
                      <span className="hidden sm:inline text-xs">{config.label}</span>
                      {mode === recommendedMode && mode !== project.mode && (
                        <Badge variant="secondary" className="text-[8px] px-1 py-0">
                          AI
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="font-medium">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Center: Tools */}
        <div className="flex items-center gap-1">
          <ToggleGroup type="single" value={tool} onValueChange={(v) => v && setTool(v as any)}>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="select" size="sm">
                  <MousePointer className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Select (V)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="pan" size="sm">
                  <Hand className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Pan (Space + Drag)</TooltipContent>
            </Tooltip>
          </ToggleGroup>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (-)</TooltipContent>
            </Tooltip>

            <span className="text-xs w-12 text-center font-mono">
              {Math.round(project.viewport.zoom * 100)}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (+)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fitToScreen}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit to Screen (Ctrl+0)</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={project.viewport.showGrid}
                onPressedChange={(pressed) => updateViewport({ showGrid: pressed })}
                size="sm"
              >
                <Grid3X3 className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid (G)</TooltipContent>
          </Tooltip>
        </div>

        {/* Right: History & Save */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Button 
            variant={isDirty ? 'default' : 'ghost'} 
            size="sm" 
            className="gap-1.5"
            onClick={save}
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// CANVAS VIEW
// ============================================================================

interface CanvasViewProps {
  className?: string;
}

function CanvasView({ className }: CanvasViewProps) {
  const { project, selectElements, getSelectedElements } = useEditor();

  return (
    <div className={cn(
      "relative flex-1 bg-muted/30 overflow-hidden",
      className
    )}>
      {/* Canvas Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: project.viewport.showGrid 
            ? `radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${project.viewport.gridSize * project.viewport.zoom}px ${project.viewport.gridSize * project.viewport.zoom}px`,
          transform: `translate(${project.viewport.panX}px, ${project.viewport.panY}px) scale(${project.viewport.zoom})`,
          transformOrigin: 'center center',
        }}
      />

      {/* Canvas Area */}
      <div 
        className="absolute bg-background shadow-lg rounded-lg border"
        style={{
          left: '50%',
          top: '50%',
          width: '1920px',
          height: '1080px',
          transform: `translate(-50%, -50%) translate(${project.viewport.panX}px, ${project.viewport.panY}px) scale(${project.viewport.zoom})`,
        }}
      >
        {/* Elements would render here */}
        {project.elements.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Canvas is empty</p>
              <p className="text-xs mt-1">Add elements from the sidebar</p>
            </div>
          </div>
        ) : (
          project.elements.map((element) => (
            <div
              key={element.id}
              className={cn(
                "absolute border-2 border-transparent hover:border-primary/50 cursor-move",
                project.selection.elementIds.includes(element.id) && "border-primary"
              )}
              style={{
                left: element.position.x,
                top: element.position.y,
                width: element.position.width,
                height: element.position.height,
                transform: element.position.rotation ? `rotate(${element.position.rotation}deg)` : undefined,
                opacity: element.style.opacity,
                zIndex: element.style.zIndex,
              }}
              onClick={() => selectElements([element.id])}
            >
              {/* Element content placeholder */}
              <div className="w-full h-full bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                {element.type}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TIMELINE VIEW
// ============================================================================

interface TimelineViewProps {
  className?: string;
}

function TimelineView({ className }: TimelineViewProps) {
  const { project } = useEditor();
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);

  const tracks = project.timeline || [
    { id: 't1', name: 'Video', type: 'video' as const, clips: [], isMuted: false, isLocked: false },
    { id: 't2', name: 'Audio', type: 'audio' as const, clips: [], isMuted: false, isLocked: false },
    { id: 't3', name: 'Captions', type: 'text' as const, clips: [], isMuted: false, isLocked: false },
  ];

  const totalDuration = 120; // seconds

  return (
    <div className={cn("flex flex-col border-t bg-background", className)}>
      {/* Timeline Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <span className="text-xs font-mono">
            {Math.floor(playhead / 60)}:{String(Math.floor(playhead % 60)).padStart(2, '0')}
            <span className="text-muted-foreground"> / </span>
            {Math.floor(totalDuration / 60)}:{String(Math.floor(totalDuration % 60)).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Zoom:</span>
          <Slider
            value={[zoom]}
            onValueChange={([v]) => setZoom(v)}
            min={0.5}
            max={3}
            step={0.1}
            className="w-24"
          />
        </div>
      </div>

      {/* Tracks */}
      <div className="flex-1 flex">
        {/* Track Labels */}
        <div className="w-32 border-r bg-muted/20 shrink-0">
          {tracks.map((track) => (
            <div 
              key={track.id}
              className="h-16 flex items-center justify-between px-2 border-b"
            >
              <span className="text-xs font-medium">{track.name}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  {track.isMuted ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  {track.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Track Content */}
        <ScrollArea className="flex-1">
          <div className="relative min-w-[800px]" style={{ width: `${totalDuration * 10 * zoom}px` }}>
            {/* Time Ruler */}
            <div className="h-6 border-b bg-muted/10 flex items-end">
              {Array.from({ length: Math.ceil(totalDuration / 10) + 1 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute h-full flex flex-col items-start border-l border-muted-foreground/30"
                  style={{ left: `${i * 100 * zoom}px` }}
                >
                  <span className="text-[10px] text-muted-foreground ml-1">
                    {Math.floor(i * 10 / 60)}:{String((i * 10) % 60).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-primary z-10"
              style={{ left: `${playhead * 10 * zoom}px` }}
            >
              <div className="absolute top-0 -translate-x-1/2 w-3 h-3 bg-primary rounded-sm" />
            </div>

            {/* Track Lanes */}
            {tracks.map((track) => (
              <div 
                key={track.id}
                className="h-16 border-b relative bg-muted/5"
              >
                {track.clips.map((clip: any) => (
                  <div
                    key={clip.id}
                    className="absolute top-1 bottom-1 bg-primary/20 border border-primary/40 rounded"
                    style={{
                      left: `${clip.startTime * 10 * zoom}px`,
                      width: `${(clip.endTime - clip.startTime) * 10 * zoom}px`,
                    }}
                  />
                ))}
                
                {/* Empty State */}
                {track.clips.length === 0 && (
                  <div className="absolute inset-2 border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">Drop {track.type} here</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ============================================================================
// HYBRID VIEW
// ============================================================================

interface HybridViewProps {
  className?: string;
}

function HybridView({ className }: HybridViewProps) {
  const [splitRatio, setSplitRatio] = useState(60);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Canvas Section */}
      <div style={{ height: `${splitRatio}%` }}>
        <CanvasView className="h-full" />
      </div>

      {/* Resizer */}
      <div 
        className="h-2 bg-muted cursor-row-resize hover:bg-primary/20 transition-colors flex items-center justify-center"
        onMouseDown={(e) => {
          // Resize logic would go here
        }}
      >
        <div className="w-12 h-1 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Timeline Section */}
      <div style={{ height: `${100 - splitRatio - 1}%` }}>
        <TimelineView className="h-full" />
      </div>
    </div>
  );
}

// ============================================================================
// DOCUMENT VIEW
// ============================================================================

interface DocumentViewProps {
  className?: string;
}

function DocumentView({ className }: DocumentViewProps) {
  return (
    <div className={cn("flex-1 bg-muted/20 p-8", className)}>
      <div className="max-w-3xl mx-auto bg-background rounded-lg shadow-lg p-8 min-h-[600px]">
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            Document mode for linear content editing
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPLETE LAYER 3 COMPONENT
// ============================================================================

interface Layer3EditorProps {
  className?: string;
}

export function Layer3Editor({ className }: Layer3EditorProps) {
  const { project } = useEditor();

  const renderEditorView = () => {
    switch (project.mode) {
      case 'canvas':
        return <CanvasView />;
      case 'timeline':
        return <TimelineView className="flex-1" />;
      case 'document':
        return <DocumentView />;
      case 'hybrid':
        return <HybridView />;
      default:
        return <CanvasView />;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <EditorToolbar />
      {renderEditorView()}
    </div>
  );
}

export default Layer3Editor;
