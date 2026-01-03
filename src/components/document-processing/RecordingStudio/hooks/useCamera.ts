/**
 * Camera Hook - Handles camera initialization and controls with retry logic
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CameraState } from '../types';

interface UseCameraOptions {
  autoStart?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  maxRetries?: number;
  retryDelay?: number;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { autoStart = true, maxRetries = 5, retryDelay = 1500 } = options;
  
  const [state, setState] = useState<CameraState>({
    stream: null,
    isEnabled: true,
    isMicEnabled: true,
    isLoading: true,
    error: null,
  });
  
  const streamRef = useRef<MediaStream | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  const initCamera = useCallback(async (isRetry = false): Promise<MediaStream | null> => {
    if (!mountedRef.current) return null;
    
    if (!isRetry) {
      retryCountRef.current = 0;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not available in this browser');
      }

      // Request with timeout wrapper
      const streamPromise = navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
        },
        audio: true,
      });

      // 30 second timeout for slower devices
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Camera request timeout')), 30000);
      });

      const stream = await Promise.race([streamPromise, timeoutPromise]);

      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return null;
      }

      streamRef.current = stream;
      
      setState({
        stream,
        isEnabled: true,
        isMicEnabled: true,
        isLoading: false,
        error: null,
      });

      console.log('[Camera] Initialized successfully');
      return stream;
    } catch (err: any) {
      let errorMessage = 'Camera error';
      let canRetry = false;
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permission in your browser.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotReadableError' || err.message?.includes('Timeout')) {
        errorMessage = 'Camera is busy or timed out. Retrying...';
        canRetry = true;
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Camera blocked due to security restrictions. Use HTTPS.';
      } else if (err.name === 'AbortError') {
        errorMessage = 'Camera initialization was interrupted.';
        canRetry = true;
      } else {
        errorMessage = `Camera error: ${err.message}`;
        canRetry = true;
      }
      
      console.error('[Camera] Error:', errorMessage, err);
      
      // Retry logic for timeout and busy errors
      if (canRetry && retryCountRef.current < maxRetries && mountedRef.current) {
        retryCountRef.current++;
        console.log(`[Camera] Retrying... (${retryCountRef.current}/${maxRetries})`);
        
        setState(prev => ({ 
          ...prev, 
          isLoading: true, 
          error: `Retrying camera... (${retryCountRef.current}/${maxRetries})` 
        }));
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return initCamera(true);
      }
      
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return null;
    }
  }, [maxRetries, retryDelay]);

  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return;

    const videoTracks = streamRef.current.getVideoTracks();
    const newEnabled = !state.isEnabled;
    
    videoTracks.forEach(track => {
      track.enabled = newEnabled;
    });

    setState(prev => ({ ...prev, isEnabled: newEnabled }));
    console.log('[Camera] Toggle:', newEnabled ? 'ON' : 'OFF');
  }, [state.isEnabled]);

  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;

    const audioTracks = streamRef.current.getAudioTracks();
    const newEnabled = !state.isMicEnabled;
    
    audioTracks.forEach(track => {
      track.enabled = newEnabled;
    });

    setState(prev => ({ ...prev, isMicEnabled: newEnabled }));
    console.log('[Camera] Mic toggle:', newEnabled ? 'ON' : 'OFF');
  }, [state.isMicEnabled]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setState(prev => ({ ...prev, stream: null }));
      console.log('[Camera] Stopped');
    }
  }, []);

  // Retry camera manually
  const retryCamera = useCallback(() => {
    retryCountRef.current = 0;
    initCamera();
  }, [initCamera]);

  // Auto-start camera
  useEffect(() => {
    mountedRef.current = true;
    
    if (autoStart) {
      initCamera();
    }
    
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [autoStart, initCamera, stopCamera]);

  return {
    ...state,
    initCamera,
    toggleCamera,
    toggleMic,
    stopCamera,
    retryCamera,
  };
}
