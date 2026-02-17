/**
 * Inline Teleprompter - Floating, Draggable Overlay Inside the App
 * 
 * Key features:
 * - Floats over the preview area (draggable)
 * - Word-by-word highlighting synced with audio
 * - Auto-scroll to current word
 * - Won't be captured during screen recording (positioned outside recording area)
 * - Stays in sync during pause/resume
 * - Adjustable font size and opacity
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  GripVertical, X, Minus, Maximize2, 
  RotateCcw, Eye, EyeOff 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineTeleprompterProps {
  /** Script content to display */
  content: string;
  /** Title displayed in header */
  title?: string;
  /** Current word index (synced from audio) */
  currentWordIndex: number;
  /** Total number of words */
  totalWords: number;
  /** Progress 0-1 */
  progress: number;
  /** Whether currently recording */
  isRecording: boolean;
  /** Whether recording is paused */
  isPaused: boolean;
  /** Whether teleprompter is visible */
  isVisible: boolean;
  /** Callback when closed */
  onClose: () => void;
  /** Initial position */
  initialPosition?: { x: number; y: number };
}

interface Position {
  x: number;
  y: number;
}

export function InlineTeleprompter({
  content,
  title = 'Script',
  currentWordIndex,
  totalWords,
  progress,
  isRecording,
  isPaused,
  isVisible,
  onClose,
  initialPosition = { x: 20, y: 80 },
}: InlineTeleprompterProps) {
  // Panel state
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [opacity, setOpacity] = useState(0.95);
  const [isManualMode, setIsManualMode] = useState(false);
  const [localWordIndex, setLocalWordIndex] = useState(0);
  
  // Refs
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  
  // Parse words from content
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  // Update local word index from prop (when synced)
  useEffect(() => {
    if (!isManualMode) {
      setLocalWordIndex(currentWordIndex);
    }
  }, [currentWordIndex, isManualMode]);
  
  // Scroll to current word
  useEffect(() => {
    const idx = isManualMode ? localWordIndex : currentWordIndex;
    const wordEl = wordRefs.current[idx];
    
    if (wordEl && contentRef.current) {
      const container = contentRef.current;
      const containerHeight = container.offsetHeight;
      const wordTop = wordEl.offsetTop;
      const wordHeight = wordEl.offsetHeight;
      
      // Center the current word in the visible area
      const targetScroll = wordTop - (containerHeight / 2) + (wordHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [currentWordIndex, localWordIndex, isManualMode]);
  
  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  }, [position]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    // Clamp to viewport
    const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 350);
    const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 300);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  }, [isDragging]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);
  
  // Add/remove global mouse listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Toggle manual mode
  const handleToggleManual = () => {
    if (isManualMode) {
      // Re-sync with audio
      setLocalWordIndex(currentWordIndex);
    }
    setIsManualMode(!isManualMode);
  };
  
  // Reset to beginning
  const handleReset = () => {
    setLocalWordIndex(0);
    setIsManualMode(true);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };
  
  if (!isVisible || !content) return null;
  
  const effectiveIndex = isManualMode ? localWordIndex : currentWordIndex;
  
  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-50 rounded-lg shadow-2xl border overflow-hidden transition-all duration-200",
        "bg-background/95 backdrop-blur-md border-border",
        isDragging && "cursor-grabbing select-none"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 280 : 380,
        opacity,
        minHeight: isMinimized ? 'auto' : 350,
        maxHeight: isMinimized ? 'auto' : '60vh',
      }}
    >
      {/* Header - Draggable */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 border-b cursor-grab",
          "bg-muted/50",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium truncate max-w-32">📜 {title}</span>
          
          {/* Recording status badge */}
          {isRecording && (
            <span className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
              isPaused 
                ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" 
                : "bg-red-500/20 text-red-600 dark:text-red-400"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"
              )} />
              {isPaused ? 'PAUSED' : 'REC'}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 no-drag">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Controls */}
          <div className="flex items-center gap-3 px-3 py-2 border-b bg-muted/30 no-drag">
            <Button
              size="sm"
              variant={isManualMode ? "outline" : "default"}
              className="h-7 text-xs gap-1"
              onClick={handleToggleManual}
            >
              {isManualMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {isManualMode ? 'Manual' : 'Synced'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={handleReset}
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
            
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">Size</span>
              <Slider
                className="w-16"
                value={[fontSize]}
                min={14}
                max={32}
                step={2}
                onValueChange={([v]) => setFontSize(v)}
              />
            </div>
          </div>
          
          {/* Cursor line indicator */}
          <div className="relative">
            <div className="absolute left-0 right-0 top-1/3 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60 z-10 pointer-events-none" />
          </div>
          
          {/* Script content */}
          <div
            ref={contentRef}
            className="px-4 py-8 overflow-y-auto"
            style={{
              maxHeight: '45vh',
              fontSize,
              lineHeight: 1.8,
              // Fade effect at top and bottom
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            }}
          >
            {words.map((word, idx) => (
              <span
                key={idx}
                ref={el => wordRefs.current[idx] = el}
                className={cn(
                  "inline mr-1.5 transition-all duration-100",
                  idx === effectiveIndex && "text-green-500 dark:text-green-400 font-bold scale-105 bg-green-500/10 px-1 rounded",
                  idx < effectiveIndex && "text-muted-foreground/40",
                  idx > effectiveIndex && "text-foreground/80"
                )}
              >
                {word}
              </span>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-green-500 transition-all duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
            <span>{effectiveIndex + 1} / {words.length} words</span>
            <div className="flex items-center gap-2">
              <span>Opacity</span>
              <Slider
                className="w-16 no-drag"
                value={[opacity * 100]}
                min={50}
                max={100}
                step={5}
                onValueChange={([v]) => setOpacity(v / 100)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
