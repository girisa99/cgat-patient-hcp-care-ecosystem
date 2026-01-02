/**
 * Video Preview Component - Displays camera feed with overlays
 */

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { LogoState, TeleprompterState } from '../types';

interface VideoPreviewProps {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  isRecording: boolean;
  countdown: number | null;
  formattedDuration: string;
  teleprompter: TeleprompterState & { content: string };
  logo: LogoState;
  onLogoPositionChange: (position: { x: number; y: number }) => void;
}

export function VideoPreview({
  stream,
  isLoading,
  error,
  isRecording,
  countdown,
  formattedDuration,
  teleprompter,
  logo,
  onLogoPositionChange,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  // Logo drag handling
  const handleLogoMouseDown = (e: React.MouseEvent) => {
    if (!logo.enabled) return;
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      
      let newX = e.clientX - containerRect.left - dragOffset.current.x;
      let newY = e.clientY - containerRect.top - dragOffset.current.y;
      
      // Constrain to container
      newX = Math.max(0, Math.min(newX, containerRect.width - 100));
      newY = Math.max(0, Math.min(newY, containerRect.height - 100));
      
      onLogoPositionChange({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onLogoPositionChange]);

  const logoSizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32',
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-muted-foreground text-sm">
            {error || 'Initializing camera...'}
          </span>
        </div>
      )}

      {/* Error Display */}
      {!isLoading && error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <span className="text-destructive text-sm text-center px-4">{error}</span>
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
          <div className="text-8xl font-bold text-white animate-pulse">{countdown}</div>
          <div className="text-lg text-white/80 mt-4">Get Ready...</div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full z-10">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-sm font-medium">REC</span>
          <span className="text-white/80 text-sm font-mono">{formattedDuration}</span>
        </div>
      )}

      {/* Teleprompter Overlay */}
      {teleprompter.enabled && teleprompter.content && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10 max-h-[40%] overflow-y-auto">
          <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
            {teleprompter.content}
          </p>
        </div>
      )}

      {/* Logo Overlay */}
      {logo.enabled && logo.src && (
        <div
          className={cn(
            'absolute z-10 cursor-grab active:cursor-grabbing transition-shadow',
            logoSizeClasses[logo.size],
            isDragging && 'ring-2 ring-primary shadow-lg'
          )}
          style={{ left: logo.position.x, top: logo.position.y }}
          onMouseDown={handleLogoMouseDown}
        >
          <img
            src={logo.src}
            alt="Logo"
            className="w-full h-full object-contain rounded"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}
