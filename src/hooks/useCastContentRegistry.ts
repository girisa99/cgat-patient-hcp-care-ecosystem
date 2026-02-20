/**
 * useCastContentRegistry — Dynamic, DB-driven content categories & formats
 * 
 * Fetches categories and formats from cast_content_categories / cast_content_formats.
 * Supports adding new categories/formats on-the-fly (no code changes needed).
 * Connected to universal enrichment via enrichment_config on formats.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContentCategory {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface ContentFormat {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  description: string | null;
  requires_messaging: boolean;
  requires_tts: boolean;
  requires_video: boolean;
  enrichment_config: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryFormatLink {
  id: string;
  category_id: string;
  format_id: string;
  enrichment_overrides: Record<string, unknown>;
  blueprint_template_id: string | null;
  is_active: boolean;
}

export function useCastContentRegistry() {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [formats, setFormats] = useState<ContentFormat[]>([]);
  const [categoryFormats, setCategoryFormats] = useState<CategoryFormatLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, fmtRes, cfRes] = await Promise.all([
        supabase.from('cast_content_categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('cast_content_formats').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('cast_category_formats').select('*').eq('is_active', true),
      ]);

      if (catRes.error) throw catRes.error;
      if (fmtRes.error) throw fmtRes.error;
      if (cfRes.error) throw cfRes.error;

      setCategories((catRes.data || []) as unknown as ContentCategory[]);
      setFormats((fmtRes.data || []) as unknown as ContentFormat[]);
      setCategoryFormats((cfRes.data || []) as unknown as CategoryFormatLink[]);
    } catch (err: any) {
      console.error('[useCastContentRegistry] Failed to fetch:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /** Get formats available for a given category. If no links exist, all formats are available. */
  const getFormatsForCategory = useCallback((categoryId: string): ContentFormat[] => {
    const links = categoryFormats.filter(cf => cf.category_id === categoryId);
    if (links.length === 0) return formats; // All formats available
    const linkedFormatIds = new Set(links.map(l => l.format_id));
    return formats.filter(f => linkedFormatIds.has(f.id));
  }, [formats, categoryFormats]);

  /** Check if a format requires a separate messaging/positioning step */
  const requiresMessaging = useCallback((formatId: string, categoryId?: string): boolean => {
    // Check category-specific override first
    if (categoryId) {
      const link = categoryFormats.find(cf => cf.category_id === categoryId && cf.format_id === formatId);
      if (link?.enrichment_overrides && typeof (link.enrichment_overrides as any).requires_messaging === 'boolean') {
        return (link.enrichment_overrides as any).requires_messaging;
      }
    }
    // Fall back to format default
    const format = formats.find(f => f.id === formatId);
    return format?.requires_messaging ?? false;
  }, [formats, categoryFormats]);

  /** Add a new category dynamically */
  const addCategory = useCallback(async (data: { name: string; label: string; icon?: string; color?: string; description?: string }) => {
    try {
      const { data: newCat, error } = await supabase
        .from('cast_content_categories')
        .insert({
          name: data.name.toLowerCase().replace(/\s+/g, '_'),
          label: data.label,
          icon: data.icon || 'Folder',
          color: data.color || 'text-primary',
          description: data.description || null,
          sort_order: categories.length + 1,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success(`Category "${data.label}" added`);
      await fetchAll();
      return newCat;
    } catch (err: any) {
      console.error('[useCastContentRegistry] Failed to add category:', err);
      toast.error('Failed to add category');
      return null;
    }
  }, [categories.length, fetchAll]);

  /** Add a new format dynamically */
  const addFormat = useCallback(async (data: {
    name: string;
    label: string;
    icon?: string;
    color?: string;
    description?: string;
    requires_messaging?: boolean;
    requires_tts?: boolean;
    requires_video?: boolean;
  }) => {
    try {
      const { data: newFmt, error } = await supabase
        .from('cast_content_formats')
        .insert({
          name: data.name.toLowerCase().replace(/\s+/g, '_'),
          label: data.label,
          icon: data.icon || 'FileText',
          color: data.color || 'text-primary',
          description: data.description || null,
          requires_messaging: data.requires_messaging ?? false,
          requires_tts: data.requires_tts ?? false,
          requires_video: data.requires_video ?? false,
          sort_order: formats.length + 1,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success(`Format "${data.label}" added`);
      await fetchAll();
      return newFmt;
    } catch (err: any) {
      console.error('[useCastContentRegistry] Failed to add format:', err);
      toast.error('Failed to add format');
      return null;
    }
  }, [formats.length, fetchAll]);

  return {
    categories,
    formats,
    categoryFormats,
    isLoading,
    refresh: fetchAll,
    getFormatsForCategory,
    requiresMessaging,
    addCategory,
    addFormat,
  };
}
