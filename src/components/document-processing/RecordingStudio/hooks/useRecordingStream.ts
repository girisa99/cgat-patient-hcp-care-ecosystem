/**
 * useRecordingStream Hook - Dynamic Stream Management
 * 
 * Handles stream selection based on recording mode:
 * - Camera only (with optional background blur)
 * - Screen only
 * - Screen + Camera (PiP canvas composite)
 * 
 * Key features:
 * - Stream combining for screen+camera mode via canvas compositing
 * - Background blur integration
 * - Dynamic stream acquisition at recording start
 */

import { useCallback, useRef, useEffect, useState } from 'react';

export type RecordingMode = 'camera' | 'screen' | 'screen+camera';

export type PipPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type PipSize = 'small' | 'medium' | 'large';

export interface PipConfig {
  enabled: boolean;
  position: PipPosition;
  size: PipSize;
}

export interface UseRecordingStreamOptions {
  /** Current recording mode */
  mode: RecordingMode;
  
  /** Camera stream from useCamera hook */
  cameraStream: MediaStream | null;
  
  /** Screen stream from useScreenShare hook */
  screenStream: MediaStream | null;
  
  /** Function to start screen share (returns stream or null) */
  startScreenShare: () => Promise<MediaStream | null>;
  
  /** Whether screen share is currently active */
  isScreenSharing: boolean;
  
  /** Optional: Blurred camera stream from useMLBackgroundBlur */
  blurredStream?: MediaStream | null;
  
  /** Whether to use blurred stream when available */
  useBlur?: boolean;
  
  /** PiP configuration for screen+camera mode */
  pipConfig?: PipConfig;
}

export interface UseRecordingStreamReturn {
  /** Get the appropriate stream for recording (call at recording start) */
  getRecordingStream: () => Promise<MediaStream | null>;
  
  /** Preview stream for display (may differ from recording stream) */
  previewStream: MediaStream | null;
  
  /** Whether streams are ready for the current mode */
  isReady: boolean;
  
  /** Error if stream acquisition failed */
  error: Error | null;
  
  /** Clean up any composite streams */
  cleanup: () => void;
}

// PiP size configurations (width x height)
const PIP_SIZES: Record<PipSize, { width: number; height: number }> = {
  small: { width: 160, height: 120 },
  medium: { width: 240, height: 180 },
  large: { width: 320, height: 240 },
};

// PiP position offset from edge
const PIP_MARGIN = 20;
const PIP_BORDER_RADIUS = 8;
const CANVAS_FRAME_RATE = 30;

export function useRecordingStream(options: UseRecordingStreamOptions): UseRecordingStreamReturn {
  const {
    mode,
    cameraStream,
    screenStream,
    startScreenShare,
    isScreenSharing,
    blurredStream,
    useBlur = false,
    pipConfig = { enabled: true, position: 'bottom-right', size: 'medium' },
  } = options;

  // Store options in refs to prevent stale closures without causing re-renders
  const modeRef = useRef(mode);
  const cameraStreamRef = useRef(cameraStream);
  const screenStreamRef = useRef(screenStream);
  const startScreenShareRef = useRef(startScreenShare);
  const isScreenSharingRef = useRef(isScreenSharing);
  const blurredStreamRef = useRef(blurredStream);
  const useBlurRef = useRef(useBlur);
  
  // Update refs when values change
  useEffect(() => {
    modeRef.current = mode;
    cameraStreamRef.current = cameraStream;
    screenStreamRef.current = screenStream;
    startScreenShareRef.current = startScreenShare;
    isScreenSharingRef.current = isScreenSharing;
    blurredStreamRef.current = blurredStream;
    useBlurRef.current = useBlur;
  }, [mode, cameraStream, screenStream, startScreenShare, isScreenSharing, blurredStream, useBlur]);

  const [error, setError] = useState<Error | null>(null);
  
  // Refs for canvas compositing cleanup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipConfigRef = useRef(pipConfig);
  
  // Update pipConfig ref
  useEffect(() => {
    pipConfigRef.current = pipConfig;
  }, [pipConfig]);

  // Get the effective camera stream (blurred or normal) - also stored in ref
  const effectiveCameraStream = useBlur && blurredStream ? blurredStream : cameraStream;
  const effectiveCameraStreamRef = useRef(effectiveCameraStream);
  useEffect(() => {
    effectiveCameraStreamRef.current = effectiveCameraStream;
  }, [effectiveCameraStream]);

  /**
   * Clean up composite resources - stable reference
   */
  const cleanupRef = useRef<() => void>(() => {});
  cleanupRef.current = () => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clean up video elements
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
      screenVideoRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
      cameraVideoRef.current = null;
    }
    
    // Clear canvas ref
    canvasRef.current = null;
    
    // Stop combined stream tracks (but not original tracks)
    if (combinedStreamRef.current) {
      const canvasTracks = combinedStreamRef.current.getVideoTracks().filter(
        track => track.label.includes('canvas') || !track.label
      );
      canvasTracks.forEach(track => track.stop());
      combinedStreamRef.current = null;
    }
  };
  
  const cleanup = useCallback(() => {
    cleanupRef.current();
  }, []);

  /**
   * Combine screen and camera streams into a single stream with PiP
   * Uses canvas compositing for proper overlay - stable function reference
   */
  const combineStreamsWithPip = useCallback((
    screen: MediaStream,
    camera: MediaStream
  ): MediaStream => {
    // Clean up previous composite
    cleanupRef.current();
    
    // Create canvas for compositing
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[useRecordingStream] Failed to get canvas context');
      return screen; // Fallback to screen only
    }

    // Create video elements for streams
    const screenVideo = document.createElement('video');
    screenVideo.srcObject = screen;
    screenVideo.muted = true;
    screenVideo.playsInline = true;
    screenVideoRef.current = screenVideo;

    const cameraVideo = document.createElement('video');
    cameraVideo.srcObject = camera;
    cameraVideo.muted = true;
    cameraVideo.playsInline = true;
    cameraVideoRef.current = cameraVideo;

    // Start playing videos
    screenVideo.play().catch(err => console.warn('[useRecordingStream] Screen video play error:', err));
    cameraVideo.play().catch(err => console.warn('[useRecordingStream] Camera video play error:', err));

    // Wait for metadata then start compositing
    const setupCanvas = () => {
      // Set canvas size to screen size
      canvas.width = screenVideo.videoWidth || 1920;
      canvas.height = screenVideo.videoHeight || 1080;

      // Get current pipConfig from ref
      const currentPipConfig = pipConfigRef.current;
      
      // Calculate PiP dimensions and position
      const pipSize = PIP_SIZES[currentPipConfig.size];
      const pipWidth = pipSize.width;
      const pipHeight = pipSize.height;
      
      let pipX: number, pipY: number;
      switch (currentPipConfig.position) {
        case 'top-left':
          pipX = PIP_MARGIN;
          pipY = PIP_MARGIN;
          break;
        case 'top-right':
          pipX = canvas.width - pipWidth - PIP_MARGIN;
          pipY = PIP_MARGIN;
          break;
        case 'bottom-left':
          pipX = PIP_MARGIN;
          pipY = canvas.height - pipHeight - PIP_MARGIN;
          break;
        case 'bottom-right':
        default:
          pipX = canvas.width - pipWidth - PIP_MARGIN;
          pipY = canvas.height - pipHeight - PIP_MARGIN;
          break;
      }

      // Animation loop to composite frames
      const drawFrame = () => {
        if (!canvasRef.current || !ctx) return; // Stop if cleaned up
        
        // Draw screen (full canvas)
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

        if (currentPipConfig.enabled) {
          // Draw camera PiP with rounded corners
          ctx.save();
          
          // Create rounded rectangle clip path
          ctx.beginPath();
          ctx.moveTo(pipX + PIP_BORDER_RADIUS, pipY);
          ctx.lineTo(pipX + pipWidth - PIP_BORDER_RADIUS, pipY);
          ctx.quadraticCurveTo(pipX + pipWidth, pipY, pipX + pipWidth, pipY + PIP_BORDER_RADIUS);
          ctx.lineTo(pipX + pipWidth, pipY + pipHeight - PIP_BORDER_RADIUS);
          ctx.quadraticCurveTo(pipX + pipWidth, pipY + pipHeight, pipX + pipWidth - PIP_BORDER_RADIUS, pipY + pipHeight);
          ctx.lineTo(pipX + PIP_BORDER_RADIUS, pipY + pipHeight);
          ctx.quadraticCurveTo(pipX, pipY + pipHeight, pipX, pipY + pipHeight - PIP_BORDER_RADIUS);
          ctx.lineTo(pipX, pipY + PIP_BORDER_RADIUS);
          ctx.quadraticCurveTo(pipX, pipY, pipX + PIP_BORDER_RADIUS, pipY);
          ctx.closePath();
          ctx.clip();
          
          // Draw camera video
          ctx.drawImage(cameraVideo, pipX, pipY, pipWidth, pipHeight);
          
          ctx.restore();
          
          // Draw border (outside clip)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pipX + PIP_BORDER_RADIUS, pipY);
          ctx.lineTo(pipX + pipWidth - PIP_BORDER_RADIUS, pipY);
          ctx.quadraticCurveTo(pipX + pipWidth, pipY, pipX + pipWidth, pipY + PIP_BORDER_RADIUS);
          ctx.lineTo(pipX + pipWidth, pipY + pipHeight - PIP_BORDER_RADIUS);
          ctx.quadraticCurveTo(pipX + pipWidth, pipY + pipHeight, pipX + pipWidth - PIP_BORDER_RADIUS, pipY + pipHeight);
          ctx.lineTo(pipX + PIP_BORDER_RADIUS, pipY + pipHeight);
          ctx.quadraticCurveTo(pipX, pipY + pipHeight, pipX, pipY + pipHeight - PIP_BORDER_RADIUS);
          ctx.lineTo(pipX, pipY + PIP_BORDER_RADIUS);
          ctx.quadraticCurveTo(pipX, pipY, pipX + PIP_BORDER_RADIUS, pipY);
          ctx.closePath();
          ctx.stroke();
        }

        animationFrameRef.current = requestAnimationFrame(drawFrame);
      };

      drawFrame();
    };

    // Wait for both videos to have metadata
    Promise.all([
      new Promise<void>(resolve => {
        if (screenVideo.readyState >= 1) {
          resolve();
        } else {
          screenVideo.onloadedmetadata = () => resolve();
        }
      }),
      new Promise<void>(resolve => {
        if (cameraVideo.readyState >= 1) {
          resolve();
        } else {
          cameraVideo.onloadedmetadata = () => resolve();
        }
      }),
    ]).then(setupCanvas).catch(err => {
      console.error('[useRecordingStream] Error setting up canvas:', err);
    });

    // Capture canvas stream
    const canvasStream = canvas.captureStream(CANVAS_FRAME_RATE);
    
    // Combine audio from both sources
    const audioTracks: MediaStreamTrack[] = [];
    
    // Add camera audio (microphone) - primary
    camera.getAudioTracks().forEach(track => {
      audioTracks.push(track);
    });
    
    // Add screen audio if available (system audio)
    screen.getAudioTracks().forEach(track => {
      // Clone to avoid conflicts
      audioTracks.push(track.clone());
    });

    // Create combined stream with canvas video + mixed audio
    const combined = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks,
    ]);

    combinedStreamRef.current = combined;
    console.log('[useRecordingStream] Created composite stream with PiP');
    
    return combined;
  }, []); // Empty deps - uses refs for all values

  /**
   * Get the recording stream - called at recording start
   * Uses refs to prevent stale closures - stable function reference
   */
  const getRecordingStream = useCallback(async (): Promise<MediaStream | null> => {
    setError(null);
    
    // Read current values from refs
    const currentMode = modeRef.current;
    const currentCameraStream = effectiveCameraStreamRef.current;
    const currentScreenStream = screenStreamRef.current;
    const currentIsScreenSharing = isScreenSharingRef.current;
    const currentStartScreenShare = startScreenShareRef.current;
    const currentUseBlur = useBlurRef.current;

    console.log('[useRecordingStream] getRecordingStream called:', {
      mode: currentMode,
      hasCameraStream: !!currentCameraStream,
      hasScreenStream: !!currentScreenStream,
      isScreenSharing: currentIsScreenSharing,
    });

    try {
      switch (currentMode) {
        case 'camera': {
          if (!currentCameraStream) {
            throw new Error('Camera stream not available');
          }
          console.log('[useRecordingStream] Using camera stream', currentUseBlur ? '(blurred)' : '(normal)');
          return currentCameraStream;
        }

        case 'screen': {
          let stream = currentScreenStream;
          
          // Start screen share if not already active
          if (!stream && !currentIsScreenSharing) {
            console.log('[useRecordingStream] Starting screen share...');
            stream = await currentStartScreenShare();
          }
          
          if (!stream) {
            throw new Error('Screen share cancelled or failed');
          }
          
          console.log('[useRecordingStream] Using screen stream');
          return stream;
        }

        case 'screen+camera': {
          let screen = currentScreenStream;
          
          // Start screen share if not already active
          if (!screen && !currentIsScreenSharing) {
            console.log('[useRecordingStream] Starting screen share for screen+camera...');
            screen = await currentStartScreenShare();
          }
          
          if (!screen) {
            throw new Error('Screen share cancelled or failed');
          }
          
          if (!currentCameraStream) {
            throw new Error('Camera stream not available for screen+camera mode');
          }
          
          console.log('[useRecordingStream] Combining screen and camera streams with PiP');
          return combineStreamsWithPip(screen, currentCameraStream);
        }

        default:
          throw new Error(`Unknown recording mode: ${currentMode}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Stream acquisition failed');
      console.error('[useRecordingStream] Error:', error);
      setError(error);
      return null;
    }
  }, [combineStreamsWithPip]); // Only depends on combineStreamsWithPip which is stable

  // Determine if we're ready to record
  const isReady = (() => {
    switch (mode) {
      case 'camera':
        return !!effectiveCameraStream;
      case 'screen':
        // Ready if we have stream OR can request it
        return !!screenStream || !isScreenSharing;
      case 'screen+camera':
        return !!effectiveCameraStream && (!!screenStream || !isScreenSharing);
      default:
        return false;
    }
  })();

  // Get preview stream (for display, not recording)
  const previewStream = (() => {
    switch (mode) {
      case 'camera':
        return effectiveCameraStream;
      case 'screen':
        return screenStream;
      case 'screen+camera':
        // For preview, show screen or camera - PiP handled in recording
        return screenStream || effectiveCameraStream;
      default:
        return null;
    }
  })();

  // Cleanup on unmount or mode change
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [mode, cleanup]);

  return {
    getRecordingStream,
    previewStream,
    isReady,
    error,
    cleanup,
  };
}

export default useRecordingStream;
