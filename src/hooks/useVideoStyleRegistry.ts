/**
 * useVideoStyleRegistry — DB-driven style registry hook
 * 
 * Fetches styles from video_style_registry table with 5-min cache.
 * Falls back to hardcoded style-intent-routing if DB is empty.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VideoStyleRecord {
  id: string;
  style_key: string;
  display_name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  image_providers: any[];
  video_providers: any[];
  avatar_providers: any[];
  three_d_providers: any[];
  motion_providers: any[];
  lipsync_providers: any[];
  target_regions: string[];
  cultural_tags: string[];
  tone_modifier: string;
  aesthetic_keywords: string[];
  supported_formats: string[];
  supported_aspect_ratios: string[];
  default_resolution: string;
  is_active: boolean;
  is_system_default: boolean;
  requires_premium: boolean;
  sort_order: number;
}

async function fetchStyles(category?: string, region?: string): Promise<VideoStyleRecord[]> {
  let query = supabase
    .from('video_style_registry')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }
  if (region) {
    query = query.contains('target_regions', [region]);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('[VideoStyleRegistry] DB fetch failed, using fallback:', error.message);
    return [];
  }
  return (data || []) as unknown as VideoStyleRecord[];
}

export function useVideoStyleRegistry(options?: { category?: string; region?: string }) {
  return useQuery({
    queryKey: ['video-style-registry', options?.category, options?.region],
    queryFn: () => fetchStyles(options?.category, options?.region),
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000,
  });
}

export function useVideoStyleByKey(styleKey: string) {
  return useQuery({
    queryKey: ['video-style-registry', 'key', styleKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_style_registry')
        .select('*')
        .eq('style_key', styleKey)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.warn(`[VideoStyleRegistry] Style ${styleKey} not found in DB`);
        return null;
      }
      return data as unknown as VideoStyleRecord | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Get unique categories from registry */
export function useVideoStyleCategories() {
  const { data: styles, ...rest } = useVideoStyleRegistry();
  const categories = [...new Set((styles || []).map(s => s.category))].sort();
  return { data: categories, ...rest };
}
