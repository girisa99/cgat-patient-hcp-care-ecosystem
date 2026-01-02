/**
 * ML-Based Background Blur Hook
 * Uses @huggingface/transformers for real person segmentation
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

interface UseMLBackgroundBlurOptions {
  blurAmount?: number;
  enabled?: boolean;
}

interface UseMLBackgroundBlurReturn {
  isBlurEnabled: boolean;
  isProcessing: boolean;
  isModelLoading: boolean;
  blurAmount: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  toggleBlur: () => void;
  setBlurAmount: (amount: number) => void;
  startProcessing: (video: HTMLVideoElement) => Promise<void>;
  stopProcessing: () => void;
  loadModel: () => Promise<boolean>;
}

export function useMLBackgroundBlur(options: UseMLBackgroundBlurOptions = {}): UseMLBackgroundBlurReturn {
  const { blurAmount: initialBlur = 15, enabled: initialEnabled = false } = options;
  
  const [isBlurEnabled, setIsBlurEnabled] = useState(initialEnabled);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [blurAmount, setBlurAmount] = useState(initialBlur);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const segmenterRef = useRef<any>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCounterRef = useRef(0);

  const toggleBlur = useCallback(() => {
    setIsBlurEnabled(prev => !prev);
  }, []);

  // Load the segmentation model
  const loadModel = useCallback(async (): Promise<boolean> => {
    if (segmenterRef.current) return true;
    
    setIsModelLoading(true);
    try {
      console.log('[MLBlur] Loading segmentation model...');
      
      // Use a lightweight segmentation model
      segmenterRef.current = await pipeline(
        'image-segmentation',
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { device: 'webgpu' }
      );
      
      console.log('[MLBlur] Model loaded successfully');
      return true;
    } catch (error) {
      console.error('[MLBlur] Failed to load model:', error);
      // Fall back to simple blur if WebGPU not available
      console.log('[MLBlur] Falling back to simple blur');
      return false;
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  // Process a single frame with ML segmentation
  const processFrame = useCallback(async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || video.readyState < 2) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    if (!isBlurEnabled) {
      // No blur - just draw the video
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return;
    }

    // Process every 3rd frame for performance
    frameCounterRef.current++;
    
    if (segmenterRef.current && frameCounterRef.current % 3 === 0) {
      try {
        // Create offscreen canvas for processing
        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement('canvas');
          offscreenCanvasRef.current.width = 256; // Smaller for processing
          offscreenCanvasRef.current.height = 256;
        }
        
        const offCtx = offscreenCanvasRef.current.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(video, 0, 0, 256, 256);
          const imageData = offscreenCanvasRef.current.toDataURL('image/jpeg', 0.6);
          
          // Run segmentation
          const result = await segmenterRef.current(imageData);
          
          if (result && Array.isArray(result) && result.length > 0) {
            // Find person segment (usually labeled as 'person' or similar)
            const personSegment = result.find((seg: any) => 
              seg.label?.toLowerCase().includes('person') ||
              seg.label?.toLowerCase().includes('human')
            );
            
            if (personSegment?.mask) {
              // Create mask canvas
              if (!maskCanvasRef.current) {
                maskCanvasRef.current = document.createElement('canvas');
              }
              maskCanvasRef.current.width = canvas.width;
              maskCanvasRef.current.height = canvas.height;
              
              const maskCtx = maskCanvasRef.current.getContext('2d');
              if (maskCtx) {
                // Draw blurred background
                ctx.filter = `blur(${blurAmount}px)`;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                ctx.filter = 'none';
                
                // Apply person mask and draw sharp foreground
                const maskData = personSegment.mask.data;
                const maskWidth = personSegment.mask.width;
                const maskHeight = personSegment.mask.height;
                
                // Scale mask to canvas size
                const scaleX = canvas.width / maskWidth;
                const scaleY = canvas.height / maskHeight;
                
                const outputData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Draw original video to temp canvas
                maskCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const originalData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Blend based on mask
                for (let y = 0; y < canvas.height; y++) {
                  for (let x = 0; x < canvas.width; x++) {
                    const maskX = Math.floor(x / scaleX);
                    const maskY = Math.floor(y / scaleY);
                    const maskIdx = maskY * maskWidth + maskX;
                    const alpha = maskData[maskIdx] || 0;
                    
                    const pixelIdx = (y * canvas.width + x) * 4;
                    
                    // Blend: high alpha = use original (person), low alpha = use blurred (background)
                    const blend = alpha;
                    outputData.data[pixelIdx] = outputData.data[pixelIdx] * (1 - blend) + originalData.data[pixelIdx] * blend;
                    outputData.data[pixelIdx + 1] = outputData.data[pixelIdx + 1] * (1 - blend) + originalData.data[pixelIdx + 1] * blend;
                    outputData.data[pixelIdx + 2] = outputData.data[pixelIdx + 2] * (1 - blend) + originalData.data[pixelIdx + 2] * blend;
                  }
                }
                
                ctx.putImageData(outputData, 0, 0);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.warn('[MLBlur] Frame processing error, using fallback:', error);
      }
    }
    
    // Fallback: Simple center oval blur (same as original)
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
    
    // Draw center area with no blur
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusX = canvas.width * 0.35;
    const radiusY = canvas.height * 0.5;
    
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [isBlurEnabled, blurAmount]);

  // Continuous processing loop
  const processLoop = useCallback(() => {
    if (!videoRef.current || !isProcessing) return;
    
    processFrame();
    animationFrameRef.current = requestAnimationFrame(processLoop);
  }, [processFrame, isProcessing]);

  // Start processing video
  const startProcessing = useCallback(async (video: HTMLVideoElement) => {
    videoRef.current = video;
    setIsProcessing(true);
    
    // Try to load model if blur is enabled
    if (isBlurEnabled && !segmenterRef.current) {
      await loadModel();
    }
  }, [isBlurEnabled, loadModel]);

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

  // Load model when blur is enabled
  useEffect(() => {
    if (isBlurEnabled && !segmenterRef.current && !isModelLoading) {
      loadModel();
    }
  }, [isBlurEnabled, isModelLoading, loadModel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProcessing();
    };
  }, [stopProcessing]);

  return {
    isBlurEnabled,
    isProcessing,
    isModelLoading,
    blurAmount,
    canvasRef,
    toggleBlur,
    setBlurAmount,
    startProcessing,
    stopProcessing,
    loadModel,
  };
}
