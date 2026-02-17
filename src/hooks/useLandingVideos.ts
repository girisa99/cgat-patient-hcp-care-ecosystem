/**
 * Hook for fetching landing page videos from database
 * Videos are managed via admin panel and stored in landing_page_videos table
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LandingVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  region: string;
  language_code: string;
  language_name: string;
  industry: string | null;
  content_type: string;
  placement: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  duration_seconds: number | null;
  ai_confidence: number;
  generation_pipeline: string | null;
}

interface UseLandingVideosOptions {
  placement?: string;
  region?: string;
  featuredOnly?: boolean;
}

export function useLandingVideos(options: UseLandingVideosOptions = {}) {
  const [videos, setVideos] = useState<LandingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [options.placement, options.region, options.featuredOnly]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('landing_page_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (options.placement) {
        query = query.eq('placement', options.placement);
      }

      if (options.region) {
        query = query.eq('region', options.region);
      }

      if (options.featuredOnly) {
        query = query.eq('is_featured', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setVideos((data || []) as LandingVideo[]);
    } catch (err) {
      console.error('Error fetching landing videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  // Get unique languages from available videos
  const availableLanguages = Array.from(
    new Map(videos.map(v => [v.language_code, { code: v.language_code, name: v.language_name }])).values()
  );

  // Get unique regions
  const availableRegions = [...new Set(videos.map(v => v.region))];

  // Get videos by language
  const getVideosByLanguage = (languageCode: string) => 
    videos.filter(v => v.language_code === languageCode);

  // Get featured video for a region
  const getFeaturedVideo = (region: string) =>
    videos.find(v => v.region === region && v.is_featured) || videos.find(v => v.region === region);

  // Increment view count (using direct update)
  const recordView = async (videoId: string) => {
    try {
      // Simple increment via update - no RPC needed
      const video = videos.find(v => v.id === videoId);
      if (video) {
        await supabase
          .from('landing_page_videos')
          .update({ view_count: (video.view_count || 0) + 1 })
          .eq('id', videoId);
      }
    } catch (err) {
      // Silently fail - view tracking is non-critical
      console.debug('View tracking skipped:', err);
    }
  };

  return {
    videos,
    loading,
    error,
    availableLanguages,
    availableRegions,
    getVideosByLanguage,
    getFeaturedVideo,
    recordView,
    refetch: fetchVideos,
  };
}

export default useLandingVideos;
