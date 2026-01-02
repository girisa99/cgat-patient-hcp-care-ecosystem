/**
 * Camera Hook - Handles camera initialization and controls
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CameraState } from '../types';

interface UseCameraOptions {
  autoStart?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { autoStart = true } = options;
  
  const [state, setState] = useState<CameraState>({
    stream: null,
    isEnabled: true,
    isMicEnabled: true,
    isLoading: true,
    error: null,
  });
  
  const streamRef = useRef<MediaStream | null>(null);

  const initCamera = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not available in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: true,
      });

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
      let errorMessage = 'Camera error: ' + err.message;
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permission.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is in use by another application.';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Camera blocked due to security restrictions.';
      }
      
      console.error('[Camera] Error:', errorMessage);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return null;
    }
  }, []);

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

  // Auto-start camera
  useEffect(() => {
    if (autoStart) {
      initCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [autoStart, initCamera, stopCamera]);

  return {
    ...state,
    initCamera,
    toggleCamera,
    toggleMic,
    stopCamera,
  };
}
