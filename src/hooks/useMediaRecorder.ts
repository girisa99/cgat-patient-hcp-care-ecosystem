import { useState, useRef, useCallback } from 'react';

export type RecordingMode = 'webcam' | 'screen' | 'screen+webcam';

interface MediaRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  error: string | null;
  isMicEnabled: boolean;
}

interface UseMediaRecorderReturn extends MediaRecorderState {
  startRecording: (mode: RecordingMode, withMic?: boolean) => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  toggleMic: () => void;
  webcamStream: MediaStream | null;
  screenStream: MediaStream | null;
  combinedStream: MediaStream | null;
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [state, setState] = useState<MediaRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    recordedBlob: null,
    recordedUrl: null,
    error: null,
    isMicEnabled: true,
  });

  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const micStreamRef = useRef<MediaStream | null>(null);

  const stopAllStreams = useCallback(() => {
    webcamStream?.getTracks().forEach(track => track.stop());
    screenStream?.getTracks().forEach(track => track.stop());
    combinedStream?.getTracks().forEach(track => track.stop());
    micStreamRef.current?.getTracks().forEach(track => track.stop());
    setWebcamStream(null);
    setScreenStream(null);
    setCombinedStream(null);
    micStreamRef.current = null;
  }, [webcamStream, screenStream, combinedStream]);

  const toggleMic = useCallback(() => {
    // Toggle mic enabled state
    setState(prev => {
      const newMicState = !prev.isMicEnabled;
      // If recording, mute/unmute the audio tracks
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = newMicState;
        });
      }
      return { ...prev, isMicEnabled: newMicState };
    });
  }, []);

  const startRecording = useCallback(async (mode: RecordingMode, withMic: boolean = true) => {
    try {
      setState(prev => ({ ...prev, error: null, isMicEnabled: withMic }));
      chunksRef.current = [];

      let finalStream: MediaStream;

      if (mode === 'webcam') {
        // Webcam + microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: withMic,
        });
        setWebcamStream(stream);
        micStreamRef.current = stream;
        finalStream = stream;
      } else if (mode === 'screen') {
        // Screen + system/mic audio
        const display = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080 },
          audio: true,
        });
        
        // Also capture microphone if enabled
        if (withMic) {
          try {
            const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = mic;
            // Combine screen video with mic audio
            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();
            
            // Add display audio if available
            display.getAudioTracks().forEach(track => {
              const source = audioContext.createMediaStreamSource(new MediaStream([track]));
              source.connect(destination);
            });
            
            // Add mic audio
            mic.getAudioTracks().forEach(track => {
              const source = audioContext.createMediaStreamSource(new MediaStream([track]));
              source.connect(destination);
            });
            
            finalStream = new MediaStream([
              ...display.getVideoTracks(),
              ...destination.stream.getAudioTracks(),
            ]);
            setScreenStream(display);
          } catch {
            // Fallback: just use display stream
            finalStream = display;
            setScreenStream(display);
          }
        } else {
          finalStream = display;
          setScreenStream(display);
        }
      } else {
        // Screen + webcam picture-in-picture + audio
        const display = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080 },
          audio: true,
        });
        
        const webcam = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: withMic,
        });
        
        micStreamRef.current = webcam;
        setScreenStream(display);
        setWebcamStream(webcam);
        
        // Create canvas for picture-in-picture compositing
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d')!;
        
        const screenVideo = document.createElement('video');
        screenVideo.srcObject = display;
        screenVideo.muted = true;
        await screenVideo.play();
        
        const webcamVideo = document.createElement('video');
        webcamVideo.srcObject = webcam;
        webcamVideo.muted = true;
        await webcamVideo.play();
        
        // Composite loop
        const drawFrame = () => {
          ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
          // Draw webcam in bottom-right corner
          const pipWidth = 320;
          const pipHeight = 240;
          const padding = 20;
          ctx.drawImage(
            webcamVideo,
            canvas.width - pipWidth - padding,
            canvas.height - pipHeight - padding,
            pipWidth,
            pipHeight
          );
          requestAnimationFrame(drawFrame);
        };
        drawFrame();
        
        // Combine audio
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();
        
        display.getAudioTracks().forEach(track => {
          const source = audioContext.createMediaStreamSource(new MediaStream([track]));
          source.connect(destination);
        });
        
        if (withMic) {
          webcam.getAudioTracks().forEach(track => {
            const source = audioContext.createMediaStreamSource(new MediaStream([track]));
            source.connect(destination);
          });
        }
        
        const canvasStream = canvas.captureStream(30);
        finalStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...destination.stream.getAudioTracks(),
        ]);
      }

      setCombinedStream(finalStream);

      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setState(prev => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          recordedBlob: blob,
          recordedUrl: url,
        }));
        stopAllStreams();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        }));
      }, 1000);

      setState(prev => ({ ...prev, isRecording: true, isPaused: false }));
    } catch (error) {
      console.error('Recording error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start recording',
      }));
      stopAllStreams();
    }
  }, [stopAllStreams]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [state.isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      const pausedDuration = state.duration;
      startTimeRef.current = Date.now() - pausedDuration * 1000;
      timerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        }));
      }, 1000);
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [state.isRecording, state.isPaused, state.duration]);

  const resetRecording = useCallback(() => {
    if (state.recordedUrl) {
      URL.revokeObjectURL(state.recordedUrl);
    }
    stopAllStreams();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      recordedBlob: null,
      recordedUrl: null,
      error: null,
      isMicEnabled: true,
    });
    chunksRef.current = [];
  }, [state.recordedUrl, stopAllStreams]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    toggleMic,
    webcamStream,
    screenStream,
    combinedStream,
  };
}
