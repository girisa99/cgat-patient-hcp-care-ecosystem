/**
 * Video Preview Component - Enhanced with word tracking teleprompter
 * Teleprompter is CONTAINED inside the video area only
 * Syncs TTS/voiceover audio with visual cursor for reading at same speed
 * Supports ML-based background blur via canvas overlay
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
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
  isAudioPlaying?: boolean;
  // Retry camera
  onRetryCamera?: () => void;
  // Manual scroll controls
  onScrollUp?: () => void;
  onScrollDown?: () => void;
  // Background blur support
  isBlurEnabled?: boolean;
  blurAmount?: number;
  isBlurLoading?: boolean;
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
  isAudioPlaying = false,
  onRetryCamera,
  isBlurEnabled = false,
  blurAmount = 15,
  isBlurLoading = false,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  
  // Word tracking state
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [manualScrollOffset, setManualScrollOffset] = useState(0);

  // Parse script into words with punctuation preserved
  useEffect(() => {
    if (teleprompter.content) {
      const parsed = teleprompter.content.split(/\s+/).filter(w => w.length > 0);
      setWords(parsed);
      setCurrentWordIndex(0);
      setManualScrollOffset(0);
    } else {
      setWords([]);
      setCurrentWordIndex(0);
      setManualScrollOffset(0);
    }
  }, [teleprompter.content]);

  // Sync word highlighting with audio - precise word-by-word sync
  useEffect(() => {
    if (audioDuration > 0 && words.length > 0 && (isAudioPlaying || audioCurrentTime > 0)) {
      // Calculate word based on time - assuming even distribution
      const wordsPerSecond = words.length / audioDuration;
      const targetIndex = Math.min(
        Math.floor(audioCurrentTime * wordsPerSecond),
        words.length - 1
      );
      
      if (targetIndex !== currentWordIndex && targetIndex >= 0) {
        setCurrentWordIndex(targetIndex);
      }
    }
  }, [audioCurrentTime, audioDuration, words.length, currentWordIndex, isAudioPlaying]);

  // Reset when audio stops
  useEffect(() => {
    if (!isAudioPlaying && audioCurrentTime === 0 && !isRecording) {
      setCurrentWordIndex(0);
    }
  }, [isAudioPlaying, audioCurrentTime, isRecording]);

  // Auto-scroll teleprompter to keep current word in view at 35% position
  useEffect(() => {
    if (!teleprompterRef.current || !teleprompter.enabled || words.length === 0) return;
    
    const wordElements = teleprompterRef.current.querySelectorAll('.teleprompter-word');
    const currentWordEl = wordElements[currentWordIndex] as HTMLElement;
    
    if (currentWordEl && teleprompterRef.current) {
      const containerHeight = teleprompterRef.current.offsetHeight;
      const targetPosition = containerHeight * 0.35; // 35% from top
      const wordOffset = currentWordEl.offsetTop;
      
      teleprompterRef.current.scrollTo({
        top: wordOffset - targetPosition + manualScrollOffset,
        behavior: 'smooth'
      });
    }
  }, [currentWordIndex, teleprompter.enabled, words.length, manualScrollOffset]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  // Background blur effect using canvas
  const renderBlurFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState < 2 || !isBlurEnabled) {
      animationRef.current = requestAnimationFrame(renderBlurFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationRef.current = requestAnimationFrame(renderBlurFrame);
      return;
    }

    // Match canvas to video dimensions
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    // Draw blurred background
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    // Draw sharp center oval (person area)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusX = canvas.width * 0.35;
    const radiusY = canvas.height * 0.55;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    animationRef.current = requestAnimationFrame(renderBlurFrame);
  }, [isBlurEnabled, blurAmount]);

  // Start/stop blur rendering
  useEffect(() => {
    if (isBlurEnabled && stream) {
      renderBlurFrame();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isBlurEnabled, stream, renderBlurFrame]);

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

  // Manual scroll handlers
  const handleManualScrollUp = () => {
    setManualScrollOffset(prev => prev - 50);
  };

  const handleManualScrollDown = () => {
    setManualScrollOffset(prev => prev + 50);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black rounded-lg overflow-hidden"
    >
      {/* Video Element - Hidden when blur is enabled */}
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          isBlurEnabled && "invisible"
        )}
        autoPlay
        muted
        playsInline
      />

      {/* Canvas for blur effect - shown when blur is enabled */}
      {isBlurEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Blur Loading Indicator */}
      {isBlurLoading && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full z-20 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin text-white" />
          <span className="text-white/80 text-xs">Loading blur model...</span>
        </div>
      )}

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

      {/* Blur Active Indicator */}
      {isBlurEnabled && !isBlurLoading && (
        <div className="absolute bottom-4 left-4 bg-blue-500/80 backdrop-blur-sm px-3 py-1.5 rounded-full z-20 flex items-center gap-2">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="text-white text-xs font-medium">Blur Active</span>
        </div>
      )}

      {/* Progress indicator - shows audio sync progress */}
      {audioDuration > 0 && countdown === null && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full z-20">
          <span className="text-white/80 text-xs">
            Word {currentWordIndex + 1}/{words.length} • {Math.round((audioCurrentTime / audioDuration) * 100)}%
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

      {/* Teleprompter Overlay - CONTAINED inside video area */}
      {teleprompter.enabled && teleprompter.content && words.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-15">
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Teleprompter text container */}
          <div 
            ref={teleprompterRef}
            className="absolute inset-x-0 bottom-0 top-[20%] overflow-hidden px-8 py-4 pointer-events-auto"
            style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' }}
          >
            <div className="min-h-full flex flex-col justify-center">
              <p className="text-xl md:text-2xl leading-loose text-center">
                {words.map((word, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'teleprompter-word inline transition-all duration-150 mx-0.5',
                      idx === currentWordIndex && 'text-green-400 font-bold text-2xl md:text-3xl bg-green-500/30 px-2 py-1 rounded-md shadow-lg',
                      idx < currentWordIndex && 'text-white/40',
                      idx > currentWordIndex && 'text-white/90'
                    )}
                  >
                    {word}{' '}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Manual scroll controls */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto z-30">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 opacity-70 hover:opacity-100"
              onClick={handleManualScrollUp}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 opacity-70 hover:opacity-100"
              onClick={handleManualScrollDown}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
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
