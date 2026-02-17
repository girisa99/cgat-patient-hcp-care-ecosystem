/**
 * Audio Analyzer Component - Waveform visualization
 */

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioAnalyzerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  className?: string;
}

export function AudioAnalyzer({ audioElement, isPlaying, className }: AudioAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!audioElement || isInitialized) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioElement);
      
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
      
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;
      setIsInitialized(true);
    } catch (e) {
      console.error('[AudioAnalyzer] Failed to initialize:', e);
    }
  }, [audioElement, isInitialized]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const analyzer = analyzerRef.current;
    
    if (!canvas || !analyzer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {
        // Draw static bars when not playing
        ctx.fillStyle = 'hsl(var(--muted))';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / 32;
        for (let i = 0; i < 32; i++) {
          const barHeight = 5 + Math.random() * 10;
          ctx.fillStyle = 'hsl(var(--primary) / 0.3)';
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
        }
        return;
      }

      animationRef.current = requestAnimationFrame(draw);
      
      analyzer.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'hsl(var(--muted))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / bufferLength * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Gradient from primary to accent
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'hsl(var(--primary))');
        gradient.addColorStop(1, 'hsl(var(--primary) / 0.5)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-12 rounded', className)}
      width={200}
      height={48}
    />
  );
}
