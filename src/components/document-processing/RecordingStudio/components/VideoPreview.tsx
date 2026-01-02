/**
 * Video Preview Component - Enhanced with word tracking teleprompter
 * Syncs TTS/voiceover audio with visual cursor for reading at same speed
 */

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
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
  // Retry camera
  onRetryCamera?: () => void;
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
  onRetryCamera,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  // Word tracking state
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Parse script into words with punctuation preserved
  useEffect(() => {
    if (teleprompter.content) {
      const parsed = teleprompter.content.split(/\s+/).filter(w => w.length > 0);
      setWords(parsed);
      setCurrentWordIndex(0);
    } else {
      setWords([]);
      setCurrentWordIndex(0);
    }
  }, [teleprompter.content]);

  // Sync word highlighting with audio - ensure cursor follows audio precisely
  useEffect(() => {
    if (audioDuration > 0 && words.length > 0 && audioCurrentTime >= 0) {
      // Calculate exact position based on audio progress
      const progress = Math.min(audioCurrentTime / audioDuration, 1);
      const targetIndex = Math.min(Math.floor(progress * words.length), words.length - 1);
      
      if (targetIndex !== currentWordIndex) {
        setCurrentWordIndex(targetIndex);
      }
    } else if (audioCurrentTime === 0 && !isRecording) {
      // Reset when audio stops
      setCurrentWordIndex(0);
    }
  }, [audioCurrentTime, audioDuration, words.length, currentWordIndex, isRecording]);

  // Auto-scroll teleprompter to keep current word in view
  useEffect(() => {
    if (!teleprompterRef.current || !teleprompter.enabled || words.length === 0) return;
    
    const wordElements = teleprompterRef.current.querySelectorAll('.teleprompter-word');
    const currentWordEl = wordElements[currentWordIndex];
    
    if (currentWordEl) {
      currentWordEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentWordIndex, teleprompter.enabled, words.length]);

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
      className="relative w-full h-full bg-black rounded-lg overflow-hidden"
    >
      {/* Video Element - Full container */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-white/80 text-sm">
            {error || 'Initializing camera...'}
          </span>
        </div>
      )}

      {/* Error Display with Retry */}
      {!isLoading && error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 gap-4">
          <span className="text-destructive text-sm text-center px-4 max-w-md">{error}</span>
          {onRetryCamera && (
            <Button 
              onClick={onRetryCamera} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Camera
            </Button>
          )}
        </div>
      )}

      {/* Countdown Overlay - Large and prominent */}
      {countdown !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50">
          <div className="text-[120px] font-bold text-white animate-pulse drop-shadow-2xl">
            {countdown}
          </div>
          <div className="text-xl text-white/90 mt-6 font-medium">Get Ready...</div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && countdown === null && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full z-20">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-sm font-semibold">REC</span>
          <span className="text-white/90 text-sm font-mono">{formattedDuration}</span>
        </div>
      )}

      {/* Progress indicator - shows audio sync progress */}
      {isRecording && audioDuration > 0 && countdown === null && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full z-20">
          <span className="text-white/80 text-xs">
            {Math.round((audioCurrentTime / audioDuration) * 100)}% synced
          </span>
        </div>
      )}

      {/* Reading Cursor Line (35% from top) - syncs with audio */}
      {teleprompter.enabled && teleprompter.content && (
        <div 
          className="absolute left-0 right-0 h-[4px] z-25 pointer-events-none"
          style={{ 
            top: '35%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.6) 15%, #22c55e 50%, rgba(34, 197, 94, 0.6) 85%, transparent 100%)',
            boxShadow: '0 0 15px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.3)'
          }}
        />
      )}

      {/* Teleprompter Overlay with Audio-Synced Word Tracking */}
      {teleprompter.enabled && teleprompter.content && words.length > 0 && (
        <div 
          ref={teleprompterRef}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 z-15 max-h-[50%] overflow-y-auto scroll-smooth"
        >
          <p className="text-xl leading-loose text-center">
            {words.map((word, idx) => (
              <span
                key={idx}
                className={cn(
                  'teleprompter-word inline transition-all duration-200 mx-0.5',
                  idx === currentWordIndex && 'text-green-400 font-bold text-2xl bg-green-500/30 px-1.5 py-0.5 rounded-md shadow-lg',
                  idx < currentWordIndex && 'text-white/40',
                  idx > currentWordIndex && 'text-white/90'
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
            'absolute z-20 cursor-grab active:cursor-grabbing transition-shadow',
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
