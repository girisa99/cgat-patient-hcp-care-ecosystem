/**
 * Screen Share Hook - Handle screen sharing with audio mixing
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export type RecordingMode = 'camera' | 'screen' | 'screen+camera';

interface ScreenShareState {
  screenStream: MediaStream | null;
  isSharing: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useScreenShare() {
  const [state, setState] = useState<ScreenShareState>({
    screenStream: null,
    isSharing: false,
    isLoading: false,
    error: null,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    if (!mountedRef.current) return null;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true, // Capture system audio if available
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return null;
      }

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      streamRef.current = stream;
      
      setState({
        screenStream: stream,
        isSharing: true,
        isLoading: false,
        error: null,
      });

      console.log('[ScreenShare] Started successfully');
      return stream;
    } catch (err: any) {
      let errorMessage = 'Screen sharing failed';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Screen sharing was cancelled or denied';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Screen sharing is not supported in this browser';
      } else {
        errorMessage = `Screen sharing error: ${err.message}`;
      }

      console.error('[ScreenShare] Error:', errorMessage, err);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setState({
      screenStream: null,
      isSharing: false,
      isLoading: false,
      error: null,
    });
    
    console.log('[ScreenShare] Stopped');
  }, []);

  // Combine camera and screen streams with audio
  const combineStreams = useCallback(async (
    cameraStream: MediaStream | null,
    screenStream: MediaStream | null,
    mode: RecordingMode
  ): Promise<MediaStream | null> => {
    if (mode === 'camera' && cameraStream) {
      return cameraStream;
    }

    if (mode === 'screen' && screenStream) {
      // Add microphone audio if camera stream has it
      if (cameraStream) {
        const audioTracks = cameraStream.getAudioTracks();
        if (audioTracks.length > 0) {
          const combined = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...audioTracks,
          ]);
          return combined;
        }
      }
      return screenStream;
    }

    if (mode === 'screen+camera' && screenStream && cameraStream) {
      // Picture-in-picture: Screen with camera overlay
      // For now, return screen with camera audio
      const combined = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...cameraStream.getAudioTracks(),
      ]);
      return combined;
    }

    return cameraStream || screenStream;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      stopScreenShare();
    };
  }, [stopScreenShare]);

  return {
    ...state,
    startScreenShare,
    stopScreenShare,
    combineStreams,
  };
}
