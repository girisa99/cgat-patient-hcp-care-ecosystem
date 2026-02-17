/**
 * useMediaLibrary Hook - Extracted from GenieStudio.tsx
 * Custom hook to load media from localStorage
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { MediaItem } from '../types/studio-types';

export function useMediaLibrary() {
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [audios, setAudios] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMedia = () => {
    setIsLoading(true);
    try {
      const savedMedia = localStorage.getItem('recordedMedia');
      if (savedMedia) {
        const allMedia = JSON.parse(savedMedia);
        setVideos(allMedia.filter((m: any) => m.type === 'video').map((v: any, i: number) => ({
          id: v.id || `video-${i}`,
          name: v.name || `Video ${i + 1}`,
          type: 'video' as const,
          url: v.url,
          timestamp: v.timestamp || Date.now(),
          duration: v.duration,
          size: v.size
        })));
        
        const audioItems = allMedia.filter((m: any) => m.type === 'audio').map((a: any, i: number) => ({
          id: a.id || `audio-${i}`,
          name: a.name || `Audio ${i + 1}`,
          type: 'audio' as const,
          url: a.url,
          timestamp: a.timestamp || Date.now(),
          duration: a.duration,
          size: a.size
        }));
        setAudios(audioItems);
      }

      const generatedAudios = localStorage.getItem('generatedAudiosMetadata');
      if (generatedAudios) {
        const generated = JSON.parse(generatedAudios);
        const generatedItems: MediaItem[] = generated.map((a: any, i: number) => ({
          id: a.id || `gen-audio-${i}`,
          name: a.title || a.name || 'Generated Audio',
          type: 'audio' as const,
          url: a.audioUrl || a.url,
          timestamp: a.generatedAt ? new Date(a.generatedAt).getTime() : Date.now()
        }));
        setAudios(prev => [...prev, ...generatedItems]);
      }
    } catch (e) {
      console.error('Failed to load media library:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const deleteMedia = (id: string, type: 'video' | 'audio') => {
    try {
      const savedMedia = localStorage.getItem('recordedMedia');
      if (savedMedia) {
        const allMedia = JSON.parse(savedMedia);
        const filtered = allMedia.filter((m: any) => m.id !== id);
        localStorage.setItem('recordedMedia', JSON.stringify(filtered));
      }
      
      if (type === 'video') {
        setVideos(prev => prev.filter(v => v.id !== id));
      } else {
        setAudios(prev => prev.filter(a => a.id !== id));
      }
      toast.success(`${type === 'video' ? 'Video' : 'Audio'} deleted`);
    } catch (e) {
      toast.error('Failed to delete media');
    }
  };

  return { videos, audios, isLoading, loadMedia, deleteMedia };
}
