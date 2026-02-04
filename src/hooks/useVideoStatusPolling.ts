/**
 * VIDEO STATUS POLLING HOOK
 * 
 * Polls the genie-cast-status edge function to check for completed videos
 * that were still processing when the original request timed out.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingVideo {
  id: string;
  languageCode: string;
  languageName: string;
  projectId?: string;
}

interface VideoStatus {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  progress?: number;
  error?: string;
}

interface UseVideoStatusPollingOptions {
  pollInterval?: number; // ms, default 10000 (10s)
  maxAttempts?: number;  // default 60 (10 min with 10s interval)
  onVideoComplete?: (video: VideoStatus) => void;
  onVideoFailed?: (video: VideoStatus) => void;
}

export function useVideoStatusPolling(options: UseVideoStatusPollingOptions = {}) {
  const {
    pollInterval = 10000,
    maxAttempts = 60,
    onVideoComplete,
    onVideoFailed,
  } = options;

  const [pendingVideos, setPendingVideos] = useState<PendingVideo[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [statuses, setStatuses] = useState<Map<string, VideoStatus>>(new Map());
  const attemptCountRef = useRef<Map<string, number>>(new Map());
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add a video to the polling queue
  const addPendingVideo = useCallback((video: PendingVideo) => {
    setPendingVideos(prev => {
      if (prev.some(v => v.id === video.id)) return prev;
      return [...prev, video];
    });
    attemptCountRef.current.set(video.id, 0);
  }, []);

  // Remove a video from polling
  const removePendingVideo = useCallback((videoId: string) => {
    setPendingVideos(prev => prev.filter(v => v.id !== videoId));
    attemptCountRef.current.delete(videoId);
  }, []);

  // Check status for all pending videos
  const checkAllStatuses = useCallback(async () => {
    if (pendingVideos.length === 0) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    try {
      const { data, error } = await supabase.functions.invoke('genie-cast-status', {
        body: {},
      });

      if (error) {
        console.error('Status check error:', error);
        return;
      }

      const results = data?.results || [];
      const newStatuses = new Map(statuses);

      for (const result of results) {
        const video = pendingVideos.find(v => v.id === result.id);
        if (!video) continue;

        const count = (attemptCountRef.current.get(result.id) || 0) + 1;
        attemptCountRef.current.set(result.id, count);

        const status: VideoStatus = {
          id: result.id,
          status: result.status,
          videoUrl: result.videoUrl,
          thumbnailUrl: result.thumbnailUrl,
          progress: result.progress,
          error: result.error,
        };

        newStatuses.set(result.id, status);

        if (result.status === 'completed') {
          removePendingVideo(result.id);
          toast.success(`Video for ${video.languageName} is ready!`, {
            description: 'The video has finished rendering.',
            action: {
              label: 'View',
              onClick: () => {
                if (result.videoUrl) {
                  window.open(result.videoUrl, '_blank');
                }
              },
            },
          });
          onVideoComplete?.(status);
        } else if (result.status === 'failed') {
          removePendingVideo(result.id);
          toast.error(`Video for ${video.languageName} failed`, {
            description: result.error || 'Rendering failed',
          });
          onVideoFailed?.(status);
        } else if (count >= maxAttempts) {
          removePendingVideo(result.id);
          toast.warning(`Video for ${video.languageName} timed out`, {
            description: 'Check the Genie Cast library later.',
          });
        }
      }

      setStatuses(newStatuses);
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, [pendingVideos, statuses, maxAttempts, onVideoComplete, onVideoFailed, removePendingVideo]);

  // Start/stop polling based on pending videos
  useEffect(() => {
    if (pendingVideos.length === 0) {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    const poll = async () => {
      await checkAllStatuses();
      if (pendingVideos.length > 0) {
        pollingTimeoutRef.current = setTimeout(poll, pollInterval);
      }
    };

    poll();

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [pendingVideos.length, pollInterval, checkAllStatuses]);

  // Check a specific video immediately
  const checkVideoStatus = useCallback(async (videoId: string): Promise<VideoStatus | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('genie-cast-status', {
        body: { videoId },
      });

      if (error || !data?.video) return null;

      const status: VideoStatus = {
        id: data.video.id,
        status: data.video.status,
        videoUrl: data.video.videoUrl,
        thumbnailUrl: data.video.thumbnailUrl,
        progress: data.video.progress,
        error: data.video.error,
      };

      setStatuses(prev => new Map(prev).set(videoId, status));
      return status;
    } catch {
      return null;
    }
  }, []);

  return {
    pendingVideos,
    isPolling,
    statuses,
    addPendingVideo,
    removePendingVideo,
    checkVideoStatus,
    checkAllStatuses,
  };
}
