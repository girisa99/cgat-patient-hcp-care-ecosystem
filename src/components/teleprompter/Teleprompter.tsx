/**
 * Teleprompter Component - Full Suite (Desktop + Mobile)
 * Enterprise-ready teleprompter for content creators
 * 
 * Features:
 * - Auto-scroll with adjustable speed
 * - Font size control
 * - Mirror mode for eye-line cameras
 * - Keyboard shortcuts
 * - Mobile gesture support
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Type, 
  Gauge, 
  FlipHorizontal2,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Settings2,
  Eye,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeleprompterProps {
  script: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const Teleprompter: React.FC<TeleprompterProps> = ({
  script,
  isOpen,
  onClose,
  className
}) => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50); // 1-100, pixels per second
  const [fontSize, setFontSize] = useState(isMobile ? 24 : 32);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Calculate actual scroll speed (pixels per frame at 60fps)
  const scrollSpeed = (speed / 100) * 3;

  // Auto-scroll animation
  useEffect(() => {
    if (isPlaying && scrollRef.current) {
      const animate = () => {
        if (scrollRef.current) {
          const newPos = scrollRef.current.scrollTop + scrollSpeed;
          const maxScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
          
          if (newPos >= maxScroll) {
            setIsPlaying(false);
            return;
          }
          
          scrollRef.current.scrollTop = newPos;
          setScrollPosition(newPos);
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, scrollSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case ' ':
        case 'Space':
          e.preventDefault();
          setIsPlaying(p => !p);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSpeed(s => Math.min(100, s + 10));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSpeed(s => Math.max(10, s - 10));
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
        case 'm':
        case 'M':
          setIsMirrored(m => !m);
          break;
        case 'f':
        case 'F':
          setIsFullscreen(f => !f);
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  // Reset scroll position
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setScrollPosition(0);
    }
  }, []);

  // Toggle controls visibility (for clean fullscreen)
  const toggleControls = useCallback(() => {
    setShowControls(c => !c);
  }, []);

  // Touch gestures for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger tap to toggle play/pause
      setIsPlaying(p => !p);
    }
  }, []);

  if (!isOpen) return null;

  const progressPercent = scrollRef.current 
    ? (scrollPosition / (scrollRef.current.scrollHeight - scrollRef.current.clientHeight)) * 100
    : 0;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black flex flex-col",
        isFullscreen && "p-0",
        className
      )}
      onTouchStart={handleTouchStart}
    >
      {/* Header - Controls */}
      {showControls && (
        <div className="flex items-center justify-between p-3 bg-black/80 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-white/80 border-white/30 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Teleprompter
            </Badge>
            <Badge variant="outline" className="text-white/60 border-white/20 text-[10px]">
              {Math.round(progressPercent)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={toggleControls}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setIsFullscreen(f => !f)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="h-1 bg-white/10">
        <div 
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Script Content */}
      <div 
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto px-6 py-8",
          isMirrored && "scale-x-[-1]"
        )}
        style={{
          scrollBehavior: isPlaying ? 'auto' : 'smooth'
        }}
      >
        <div 
          className="max-w-4xl mx-auto text-white leading-relaxed whitespace-pre-wrap"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: 1.8
          }}
        >
          {script || 'No script loaded. Select a script from Genie Studio to begin.'}
        </div>
        
        {/* Bottom padding for scroll completion */}
        <div className="h-[50vh]" />
      </div>

      {/* Footer Controls */}
      {showControls && (
        <div className="p-4 bg-black/80 border-t border-white/10 backdrop-blur-sm space-y-4">
          {/* Main Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-white/20 text-white hover:bg-white/10"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              size="lg"
              className={cn(
                "h-14 w-14 rounded-full",
                isPlaying 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-green-500 hover:bg-green-600"
              )}
              onClick={() => setIsPlaying(p => !p)}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-10 w-10 border-white/20 text-white hover:bg-white/10",
                isMirrored && "bg-white/20"
              )}
              onClick={() => setIsMirrored(m => !m)}
            >
              <FlipHorizontal2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-white/70 text-xs">
                <span className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  Speed
                </span>
                <span>{speed}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-3 w-3 text-white/50" />
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => setSpeed(v)}
                  min={10}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <ChevronUp className="h-3 w-3 text-white/50" />
              </div>
            </div>

            {/* Font Size Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-white/70 text-xs">
                <span className="flex items-center gap-1">
                  <Type className="h-3 w-3" />
                  Size
                </span>
                <span>{fontSize}px</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={16}
                max={64}
                step={2}
                className="flex-1"
              />
            </div>
          </div>

          {/* Keyboard Shortcuts Hint (Desktop only) */}
          {!isMobile && (
            <div className="flex justify-center gap-4 text-white/40 text-[10px]">
              <span>Space: Play/Pause</span>
              <span>↑↓: Speed</span>
              <span>M: Mirror</span>
              <span>F: Fullscreen</span>
              <span>R: Reset</span>
            </div>
          )}
        </div>
      )}

      {/* Tap to show controls (when hidden) */}
      {!showControls && (
        <button
          className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 hover:bg-white/20"
          onClick={toggleControls}
        >
          <Settings2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Teleprompter;
