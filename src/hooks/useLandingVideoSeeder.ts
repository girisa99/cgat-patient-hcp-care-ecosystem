/**
 * Landing Video Seeder Hook
 * Seeds initial video entries in landing_page_videos for the 7-product showcase
 * Videos are stored as placeholder entries that get populated when generated
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GENIE_STUDIO_FULL_SCRIPT } from '@/config/genie-studio-video-script';
import { toast } from 'sonner';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', region: 'US' },
  { code: 'ar', name: 'Arabic', region: 'SA' },
  { code: 'hi', name: 'Hindi', region: 'IN' },
  { code: 'te', name: 'Telugu', region: 'IN' },
  { code: 'ta', name: 'Tamil', region: 'IN' },
  { code: 'bn', name: 'Bengali', region: 'IN' },
  { code: 'zh', name: 'Chinese', region: 'CN' },
  { code: 'ja', name: 'Japanese', region: 'JP' },
  { code: 'ko', name: 'Korean', region: 'KR' },
  { code: 'es', name: 'Spanish', region: 'ES' },
  { code: 'fr', name: 'French', region: 'FR' },
  { code: 'pt', name: 'Portuguese', region: 'BR' },
  { code: 'de', name: 'German', region: 'DE' },
  { code: 'sw', name: 'Swahili', region: 'KE' },
];

export interface VideoSeedEntry {
  title: string;
  description: string;
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

export function useLandingVideoSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Seed video entries for all chapters and languages
   */
  const seedLandingVideos = useCallback(async () => {
    setIsSeeding(true);
    setProgress(0);

    try {
      const chapters = GENIE_STUDIO_FULL_SCRIPT.chapters;
      const entries: VideoSeedEntry[] = [];
      
      let count = 0;
      const total = chapters.length * SUPPORTED_LANGUAGES.length;

      for (const chapter of chapters) {
        for (const lang of SUPPORTED_LANGUAGES) {
          count++;
          setProgress((count / total) * 100);

          entries.push({
            title: `${chapter.title} - ${lang.name}`,
            description: chapter.voiceover?.en?.slice(0, 200) || chapter.title,
            video_url: '', // Placeholder - will be generated
            thumbnail_url: null,
            region: lang.region,
            language_code: lang.code,
            language_name: lang.name,
            industry: 'technology',
            content_type: chapter.id,
            placement: 'hero_showcase',
            display_order: chapters.indexOf(chapter),
            is_active: true,
            is_featured: chapter.id === 'opening',
            view_count: 0,
            duration_seconds: parseInt(chapter.duration) || 45,
            ai_confidence: 0.85,
            generation_pipeline: 'genie-studio-landing',
          });
        }
      }

      // Check if entries already exist
      const { data: existing } = await supabase
        .from('landing_page_videos')
        .select('id, content_type, language_code')
        .eq('placement', 'hero_showcase');

      // Filter out duplicates
      const existingKeys = new Set(
        (existing || []).map(e => `${e.content_type}-${e.language_code}`)
      );
      
      const newEntries = entries.filter(
        e => !existingKeys.has(`${e.content_type}-${e.language_code}`)
      );

      if (newEntries.length === 0) {
        toast.info('All video entries already exist');
        return { success: true, count: 0 };
      }

      // Insert new entries
      const { error } = await supabase
        .from('landing_page_videos')
        .insert(newEntries);

      if (error) throw error;

      toast.success(`Seeded ${newEntries.length} video entries`);
      return { success: true, count: newEntries.length };

    } catch (error) {
      console.error('Error seeding videos:', error);
      toast.error('Failed to seed video entries');
      return { success: false, error };
    } finally {
      setIsSeeding(false);
      setProgress(100);
    }
  }, []);

  /**
   * Get seeding status for admin UI
   */
  const getSeederStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from('landing_page_videos')
      .select('id, content_type, language_code, video_url, is_active')
      .eq('placement', 'hero_showcase');

    if (error) return { total: 0, withVideo: 0, pending: 0 };

    const total = data?.length || 0;
    const withVideo = data?.filter(v => v.video_url && v.video_url.length > 0).length || 0;
    const pending = total - withVideo;

    return { total, withVideo, pending };
  }, []);

  return {
    seedLandingVideos,
    getSeederStatus,
    isSeeding,
    progress,
  };
}

export default useLandingVideoSeeder;
