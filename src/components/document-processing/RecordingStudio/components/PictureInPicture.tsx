/**
 * Picture-in-Picture Component for Multi-Camera Recording
 * Allows draggable camera overlay on screen share
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Maximize2, 
  Minimize2, 
  Move, 
  X,
  CornerDownRight,
  CornerDownLeft,
  CornerUpRight,
  CornerUpLeft
} from 'lucide-react';

type PipPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
type PipSize = 'small' | 'medium' | 'large';

interface PictureInPictureProps {
  mainStream: MediaStream | null;
  pipStream: MediaStream | null;
  isEnabled: boolean;
  onToggle: () => void;
  className?: string;
}

interface PipSettings {
  position: PipPosition;
  size: PipSize;
  customPosition?: { x: number; y: number };
  opacity: number;
  borderRadius: number;
  showBorder: boolean;
}

const DEFAULT_SETTINGS: PipSettings = {
  position: 'bottom-right',
  size: 'medium',
  opacity: 100,
  borderRadius: 12,
  showBorder: true,
};

const SIZE_CLASSES: Record<PipSize, string> = {
  small: 'w-32 h-24',
  medium: 'w-48 h-36',
  large: 'w-64 h-48',
};

const POSITION_CLASSES: Record<Exclude<PipPosition, 'custom'>, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

export function PictureInPicture({
  mainStream,
  pipStream,
  isEnabled,
  onToggle,
  className,
}: PictureInPictureProps) {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pipContainerRef = useRef<HTMLDivElement>(null);
  
  const [settings, setSettings] = useState<PipSettings>(DEFAULT_SETTINGS);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Attach main stream to video
  useEffect(() => {
    if (mainVideoRef.current && mainStream) {
      mainVideoRef.current.srcObject = mainStream;
      mainVideoRef.current.muted = true;
      mainVideoRef.current.playsInline = true;
      mainVideoRef.current.play().catch(console.error);
    }
  }, [mainStream]);

  // Attach PiP stream to video
  useEffect(() => {
    if (pipVideoRef.current && pipStream) {
      pipVideoRef.current.srcObject = pipStream;
      pipVideoRef.current.muted = true;
      pipVideoRef.current.playsInline = true;
      pipVideoRef.current.play().catch(console.error);
    }
  }, [pipStream]);

  // Handle PiP drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!pipContainerRef.current) return;
    
    setIsDragging(true);
    const rect = pipContainerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.preventDefault();
  }, []);

  // Handle drag
  useEffect(() => {
    if (!isDragging || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = containerRef.current!.getBoundingClientRect();
      const pipRect = pipContainerRef.current?.getBoundingClientRect();
      
      if (!pipRect) return;
      
      let newX = e.clientX - containerRect.left - dragOffset.current.x;
      let newY = e.clientY - containerRect.top - dragOffset.current.y;
      
      // Clamp to container bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - pipRect.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - pipRect.height));
      
      setSettings(prev => ({
        ...prev,
        position: 'custom',
        customPosition: { x: newX, y: newY },
      }));
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Cycle through sizes
  const cycleSize = useCallback(() => {
    const sizes: PipSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(settings.size);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setSettings(prev => ({ ...prev, size: sizes[nextIndex] }));
  }, [settings.size]);

  // Set preset position
  const setPresetPosition = useCallback((position: PipPosition) => {
    setSettings(prev => ({ ...prev, position, customPosition: undefined }));
  }, []);

  if (!isEnabled || !pipStream) {
    return (
      <div ref={containerRef} className={cn('relative w-full h-full', className)}>
        <video
          ref={mainVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
      </div>
    );
  }

  // Calculate PiP position styles
  const pipStyles: React.CSSProperties = {};
  if (settings.position === 'custom' && settings.customPosition) {
    pipStyles.left = settings.customPosition.x;
    pipStyles.top = settings.customPosition.y;
  }

  return (
    <div ref={containerRef} className={cn('relative w-full h-full', className)}>
      {/* Main video (screen share) */}
      <video
        ref={mainVideoRef}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        autoPlay
        muted
        playsInline
      />
      
      {/* PiP overlay (camera) */}
      <div
        ref={pipContainerRef}
        className={cn(
          'absolute z-20 overflow-hidden transition-all duration-200',
          SIZE_CLASSES[settings.size],
          settings.position !== 'custom' && POSITION_CLASSES[settings.position],
          isDragging && 'cursor-grabbing scale-105',
          settings.showBorder && 'ring-2 ring-primary shadow-xl',
        )}
        style={{
          ...pipStyles,
          opacity: settings.opacity / 100,
          borderRadius: settings.borderRadius,
        }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isDragging && setShowControls(false)}
      >
        <video
          ref={pipVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        
        {/* PiP Controls */}
        {showControls && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 transition-opacity">
            {/* Drag handle */}
            <div 
              className="absolute top-1 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing p-1 rounded bg-black/50"
              onMouseDown={handleDragStart}
            >
              <Move className="w-4 h-4 text-white" />
            </div>
            
            {/* Size toggle */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={cycleSize}
              title={`Size: ${settings.size}`}
            >
              {settings.size === 'large' ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            
            {/* Position presets */}
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={() => setPresetPosition('top-left')}
              >
                <CornerUpLeft className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={() => setPresetPosition('top-right')}
              >
                <CornerUpRight className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={() => setPresetPosition('bottom-left')}
              >
                <CornerDownLeft className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={() => setPresetPosition('bottom-right')}
              >
                <CornerDownRight className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Close PiP */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-1 right-1 h-6 w-6 text-white hover:bg-red-500/50"
              onClick={onToggle}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
