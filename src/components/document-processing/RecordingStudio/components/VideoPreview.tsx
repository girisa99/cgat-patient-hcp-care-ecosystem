/**
 * Video Preview Component - Enhanced with word tracking teleprompter
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  // Audio sync for word highlighting
  audioCurrentTime?: number;
  audioDuration?: number;
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
  audioCurrentTime = 0,
  audioDuration = 0,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  // Word tracking state
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Parse script into words
  useEffect(() => {
    if (teleprompter.content) {
      const parsed = teleprompter.content.split(/\s+/).filter(w => w.length > 0);
      setWords(parsed);
      setCurrentWordIndex(0);
    } else {
      setWords([]);
    }
  }, [teleprompter.content]);

  // Sync word highlighting with audio
  useEffect(() => {
    if (audioDuration > 0 && words.length > 0) {
      const progress = audioCurrentTime / audioDuration;
      const newIndex = Math.floor(progress * words.length);
      if (newIndex !== currentWordIndex && newIndex < words.length) {
        setCurrentWordIndex(newIndex);
      }
    }
  }, [audioCurrentTime, audioDuration, words.length, currentWordIndex]);

  // Auto-scroll teleprompter
  useEffect(() => {
    if (!teleprompterRef.current || !teleprompter.enabled) return;
    
    const currentWordEl = teleprompterRef.current.querySelector('.word-current');
    if (currentWordEl) {
      currentWordEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentWordIndex, teleprompter.enabled]);

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
      
      newX = Math.max(0, Math.min(newX, containerRect.width - 100));
      newY = Math.max(0, Math.min(newY, containerRect.height - 100));
      
      onLogoPositionChange({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

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
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0"
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

      {/* Reading Cursor (35% from top) */}
      {teleprompter.enabled && teleprompter.content && (
        <div 
          className="absolute left-0 right-0 h-[3px] z-20 pointer-events-none"
          style={{ 
            top: '35%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.8) 20%, #8b5cf6 50%, rgba(139, 92, 246, 0.8) 80%, transparent 100%)',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
          }}
        />
      )}

      {/* Teleprompter Overlay with Word Tracking */}
      {teleprompter.enabled && teleprompter.content && (
        <div 
          ref={teleprompterRef}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-black/40 p-4 z-10 max-h-[45%] overflow-y-auto"
        >
          <p className="text-lg leading-relaxed">
            {words.map((word, idx) => (
              <span
                key={idx}
                className={cn(
                  'inline transition-all duration-150',
                  idx === currentWordIndex && 'text-green-400 font-semibold bg-green-500/20 px-1 rounded',
                  idx < currentWordIndex && 'text-white/50',
                  idx > currentWordIndex && 'text-white'
                )}
              >
                {word}{' '}
              </span>
            ))}
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
