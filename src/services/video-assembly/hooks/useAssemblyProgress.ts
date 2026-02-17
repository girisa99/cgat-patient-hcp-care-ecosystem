/**
 * useAssemblyProgress Hook
 * 
 * Real-time progress tracking for video assembly jobs
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { videoAssemblyService } from '../VideoAssemblyService';
import type { AssemblyProgress, AssemblyEvent, AssemblyJobStatus } from '../types';

interface UseAssemblyProgressOptions {
  jobId?: string;
  pollInterval?: number; // ms, default 2000
  onPhaseChange?: (phase: AssemblyJobStatus) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface UseAssemblyProgressReturn {
  progress: AssemblyProgress | null;
  isActive: boolean;
  currentPhase: AssemblyJobStatus | null;
  estimatedTimeRemaining: number | null;
  elapsedTime: number;
  
  // Actions
  startTracking: (jobId: string) => void;
  stopTracking: () => void;
}

export function useAssemblyProgress(options: UseAssemblyProgressOptions = {}): UseAssemblyProgressReturn {
  const {
    jobId: initialJobId,
    pollInterval = 2000,
    onPhaseChange,
    onComplete,
    onError,
  } = options;

  const [progress, setProgress] = useState<AssemblyProgress | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<AssemblyJobStatus | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const jobIdRef = useRef<string | null>(initialJobId || null);
  const startTimeRef = useRef<number | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate estimated time remaining
  const estimatedTimeRemaining = progress?.estimatedRemainingSeconds ?? null;

  // Handle progress updates
  const handleProgressUpdate = useCallback((event: AssemblyEvent) => {
    if (event.type === 'progress_update') {
      const newProgress = event.data as AssemblyProgress;
      setProgress(newProgress);
      
      // Check for phase change
      if (newProgress.currentPhase !== currentPhase) {
        setCurrentPhase(newProgress.currentPhase);
        onPhaseChange?.(newProgress.currentPhase);
      }
    }
    
    if (event.type === 'job_completed') {
      setIsActive(false);
      onComplete?.();
    }
    
    if (event.type === 'job_failed') {
      setIsActive(false);
      const error = event.data as { message?: string };
      onError?.(error.message || 'Assembly failed');
    }
  }, [currentPhase, onPhaseChange, onComplete, onError]);

  // Start tracking a job
  const startTracking = useCallback((jobId: string) => {
    // Clean up previous tracking
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    jobIdRef.current = jobId;
    startTimeRef.current = Date.now();
    setIsActive(true);
    setElapsedTime(0);

    // Subscribe to job events
    unsubscribeRef.current = videoAssemblyService.subscribeToJob(jobId, handleProgressUpdate);

    // Start elapsed time counter
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    // Initial progress fetch
    const job = videoAssemblyService.getJob(jobId);
    if (job) {
      setProgress(job.progress);
      setCurrentPhase(job.progress.currentPhase);
    }
  }, [handleProgressUpdate]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  // Auto-start if jobId provided
  useEffect(() => {
    if (initialJobId) {
      startTracking(initialJobId);
    }
    
    return () => {
      stopTracking();
    };
  }, [initialJobId, startTracking, stopTracking]);

  return {
    progress,
    isActive,
    currentPhase,
    estimatedTimeRemaining,
    elapsedTime,
    startTracking,
    stopTracking,
  };
}

/**
 * Format elapsed time as mm:ss
 */
export function formatElapsedTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get phase display name
 */
export function getPhaseDisplayName(phase: AssemblyJobStatus): string {
  const phaseNames: Record<AssemblyJobStatus, string> = {
    queued: 'Queued',
    preprocessing: 'Preparing',
    generating_tts: 'Generating Audio',
    generating_visuals: 'Creating Visuals',
    assembling: 'Assembling Video',
    rendering: 'Rendering',
    uploading: 'Uploading',
    completed: 'Complete',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  return phaseNames[phase] || phase;
}
