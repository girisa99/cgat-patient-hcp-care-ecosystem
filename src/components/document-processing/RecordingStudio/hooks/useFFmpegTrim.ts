/**
 * FFmpeg WASM Hook for precise video trimming
 * Uses @ffmpeg/ffmpeg for browser-based video processing
 */

import { useState, useCallback, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface UseFFmpegTrimReturn {
  isLoaded: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  loadFFmpeg: () => Promise<boolean>;
  trimVideo: (
    inputBlob: Blob,
    startTime: number,
    endTime: number,
    options?: TrimOptions
  ) => Promise<Blob | null>;
  extractAudio: (inputBlob: Blob) => Promise<Blob | null>;
  mergeAudioVideo: (videoBlob: Blob, audioBlob: Blob) => Promise<Blob | null>;
  convertToMp4: (inputBlob: Blob) => Promise<Blob | null>;
}

interface TrimOptions {
  outputFormat?: 'webm' | 'mp4';
  quality?: 'low' | 'medium' | 'high';
  preserveAudio?: boolean;
}

export function useFFmpegTrim(): UseFFmpegTrimReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Load FFmpeg WASM
  const loadFFmpeg = useCallback(async (): Promise<boolean> => {
    if (isLoaded && ffmpegRef.current) return true;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[FFmpeg] Loading FFmpeg WASM...');
      
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      
      // Set up progress handler
      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });
      
      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });
      
      // Load FFmpeg with WASM files from CDN
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      console.log('[FFmpeg] Loaded successfully');
      setIsLoaded(true);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load FFmpeg';
      console.error('[FFmpeg] Load error:', message);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded]);

  // Trim video with precise start/end times
  const trimVideo = useCallback(async (
    inputBlob: Blob,
    startTime: number,
    endTime: number,
    options: TrimOptions = {}
  ): Promise<Blob | null> => {
    if (!ffmpegRef.current || !isLoaded) {
      const loaded = await loadFFmpeg();
      if (!loaded) return null;
    }
    
    const ffmpeg = ffmpegRef.current!;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      const { outputFormat = 'webm', quality = 'high', preserveAudio = true } = options;
      
      // Write input file to FFmpeg virtual filesystem
      const inputName = 'input.webm';
      const outputName = `output.${outputFormat}`;
      
      await ffmpeg.writeFile(inputName, await fetchFile(inputBlob));
      
      // Build FFmpeg command
      const duration = endTime - startTime;
      
      // Quality presets
      const qualitySettings = {
        low: { crf: 35, preset: 'ultrafast' },
        medium: { crf: 28, preset: 'fast' },
        high: { crf: 23, preset: 'medium' },
      };
      
      const { crf, preset } = qualitySettings[quality];
      
      const args = [
        '-i', inputName,
        '-ss', startTime.toFixed(3),
        '-t', duration.toFixed(3),
        '-c:v', outputFormat === 'mp4' ? 'libx264' : 'libvpx-vp9',
        '-crf', crf.toString(),
      ];
      
      if (outputFormat === 'mp4') {
        args.push('-preset', preset);
      }
      
      if (preserveAudio) {
        args.push('-c:a', outputFormat === 'mp4' ? 'aac' : 'libopus');
      } else {
        args.push('-an');
      }
      
      args.push('-y', outputName);
      
      console.log('[FFmpeg] Running trim:', args.join(' '));
      await ffmpeg.exec(args);
      
      // Read output file
      const data = await ffmpeg.readFile(outputName);
      // Handle FFmpeg FileData type - use slice to create a proper ArrayBuffer
      const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
      const outputBlob = new Blob([bytes.slice(0)], { 
        type: outputFormat === 'mp4' ? 'video/mp4' : 'video/webm' 
      });
      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      
      console.log('[FFmpeg] Trim complete, output size:', outputBlob.size);
      return outputBlob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Trim failed';
      console.error('[FFmpeg] Trim error:', message);
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [isLoaded, loadFFmpeg]);

  // Extract audio from video
  const extractAudio = useCallback(async (inputBlob: Blob): Promise<Blob | null> => {
    if (!ffmpegRef.current || !isLoaded) {
      const loaded = await loadFFmpeg();
      if (!loaded) return null;
    }
    
    const ffmpeg = ffmpegRef.current!;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      await ffmpeg.writeFile('input.webm', await fetchFile(inputBlob));
      
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-vn',
        '-acodec', 'libmp3lame',
        '-q:a', '2',
        '-y', 'output.mp3'
      ]);
      const data = await ffmpeg.readFile('output.mp3');
      const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
      const outputBlob = new Blob([bytes.slice(0)], { type: 'audio/mp3' });
      
      await ffmpeg.deleteFile('input.webm');
      await ffmpeg.deleteFile('output.mp3');
      
      return outputBlob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audio extraction failed';
      console.error('[FFmpeg] Extract audio error:', message);
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [isLoaded, loadFFmpeg]);

  // Merge audio and video
  const mergeAudioVideo = useCallback(async (
    videoBlob: Blob,
    audioBlob: Blob
  ): Promise<Blob | null> => {
    if (!ffmpegRef.current || !isLoaded) {
      const loaded = await loadFFmpeg();
      if (!loaded) return null;
    }
    
    const ffmpeg = ffmpegRef.current!;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      await ffmpeg.writeFile('video.webm', await fetchFile(videoBlob));
      await ffmpeg.writeFile('audio.mp3', await fetchFile(audioBlob));
      
      await ffmpeg.exec([
        '-i', 'video.webm',
        '-i', 'audio.mp3',
        '-c:v', 'copy',
        '-c:a', 'libopus',
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-shortest',
        '-y', 'output.webm'
      ]);
      const data = await ffmpeg.readFile('output.webm');
      const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
      const outputBlob = new Blob([bytes.slice(0)], { type: 'video/webm' });
      
      await ffmpeg.deleteFile('video.webm');
      await ffmpeg.deleteFile('audio.mp3');
      await ffmpeg.deleteFile('output.webm');
      
      return outputBlob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Merge failed';
      console.error('[FFmpeg] Merge error:', message);
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [isLoaded, loadFFmpeg]);

  // Convert to MP4 for wider compatibility
  const convertToMp4 = useCallback(async (inputBlob: Blob): Promise<Blob | null> => {
    if (!ffmpegRef.current || !isLoaded) {
      const loaded = await loadFFmpeg();
      if (!loaded) return null;
    }
    
    const ffmpeg = ffmpegRef.current!;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      await ffmpeg.writeFile('input.webm', await fetchFile(inputBlob));
      
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y', 'output.mp4'
      ]);
      const data = await ffmpeg.readFile('output.mp4');
      const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
      const outputBlob = new Blob([bytes.slice(0)], { type: 'video/mp4' });
      
      await ffmpeg.deleteFile('input.webm');
      await ffmpeg.deleteFile('output.mp4');
      
      return outputBlob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      console.error('[FFmpeg] Convert error:', message);
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [isLoaded, loadFFmpeg]);

  return {
    isLoaded,
    isLoading,
    isProcessing,
    progress,
    error,
    loadFFmpeg,
    trimVideo,
    extractAudio,
    mergeAudioVideo,
    convertToMp4,
  };
}
