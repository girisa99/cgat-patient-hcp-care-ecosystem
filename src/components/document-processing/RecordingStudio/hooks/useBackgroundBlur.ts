/**
 * Background Blur Hook - Real-time video background blur using canvas
 * Uses CSS filter with fallback to simple blur for performance
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseBackgroundBlurOptions {
  blurAmount?: number;
  enabled?: boolean;
}

interface UseBackgroundBlurReturn {
  isBlurEnabled: boolean;
  isProcessing: boolean;
  blurAmount: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  toggleBlur: () => void;
  setBlurAmount: (amount: number) => void;
  processFrame: (video: HTMLVideoElement) => void;
  startProcessing: (video: HTMLVideoElement) => void;
  stopProcessing: () => void;
}

export function useBackgroundBlur(options: UseBackgroundBlurOptions = {}): UseBackgroundBlurReturn {
  const { blurAmount: initialBlur = 10, enabled: initialEnabled = false } = options;
  
  const [isBlurEnabled, setIsBlurEnabled] = useState(initialEnabled);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blurAmount, setBlurAmount] = useState(initialBlur);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleBlur = useCallback(() => {
    setIsBlurEnabled(prev => !prev);
  }, []);

  // Process a single frame with blur effect
  const processFrame = useCallback((video: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !video || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isBlurEnabled) {
      // Draw blurred background layer
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Draw center area with no blur (simulating person detection)
      // This is a simple approximation - real implementation would use TensorFlow/MediaPipe
      ctx.filter = 'none';
      
      // Create an oval mask in the center (rough person area)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radiusX = canvas.width * 0.3;
      const radiusY = canvas.height * 0.45;
      
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      // No blur - just draw the video
      ctx.filter = 'none';
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  }, [isBlurEnabled, blurAmount]);

  // Continuous processing loop
  const processLoop = useCallback(() => {
    if (!videoRef.current || !isProcessing) return;
    
    processFrame(videoRef.current);
    animationFrameRef.current = requestAnimationFrame(processLoop);
  }, [processFrame, isProcessing]);

  // Start processing video
  const startProcessing = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    setIsProcessing(true);
  }, []);

  // Stop processing
  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    videoRef.current = null;
  }, []);

  // Start/stop loop based on processing state
  useEffect(() => {
    if (isProcessing && videoRef.current) {
      processLoop();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isProcessing, processLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProcessing();
    };
  }, [stopProcessing]);

  return {
    isBlurEnabled,
    isProcessing,
    blurAmount,
    canvasRef,
    toggleBlur,
    setBlurAmount,
    processFrame,
    startProcessing,
    stopProcessing,
  };
}
