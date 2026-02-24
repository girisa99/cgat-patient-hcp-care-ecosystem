/**
 * Hook for accessing industry templates from the DB.
 *
 * Replaces the hardcoded INDUSTRY_TEMPLATES + TEMPLATE_CHAPTERS constants
 * that were in SimpleCompositionStudio.tsx. Now reads from video_blueprints
 * table (tagged with industry_tags = ['industry_template']).
 *
 * Falls back to hardcoded definitions if DB has none (pre-migration).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { INDUSTRY_TEMPLATE_DEFINITIONS, type IndustryTemplateDefinition } from '@/services/industryTemplateSeed';

export interface IndustryTemplate {
  /** DB UUID (or hardcoded ID if fallback) */
  id: string;
  /** Original template key (e.g. 'saudi_vision_2030') */
  sourceId: string;
  /** Display label */
  label: string;
  /** Category group (e.g. 'Government', 'India') */
  category: string;
  /** Short description */
  description: string;
  /** Chapter titles in order */
  chapters: string[];
  /** Whether this came from DB or hardcoded fallback */
  fromDB: boolean;
}

/**
 * Shape matching MultiSelectOption for direct use in dropdowns.
 */
export interface IndustryTemplateOption {
  id: string;
  value: string;
  label: string;
  category: string;
  description?: string;
}

export function useIndustryTemplates() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['industry-templates'],
    queryFn: async (): Promise<{ templates: IndustryTemplate[]; fromDB: boolean }> => {
      // Try DB first
      const { data, error } = await supabase
        .from('video_blueprints')
        .select(`
          id,
          name,
          description,
          category,
          default_settings,
          industry_tags,
          blueprint_scenes (
            title,
            order_index
          )
        `)
        .contains('industry_tags', ['industry_template'])
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return {
          templates: data.map((bp: any) => ({
            id: bp.id,
            sourceId: (bp.default_settings as any)?.sourceId || bp.id,
            label: bp.name,
            category: bp.category || 'other',
            description: bp.description || '',
            chapters: (bp.blueprint_scenes || [])
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((s: any) => s.title),
            fromDB: true,
          })),
          fromDB: true,
        };
      }

      // Fallback to hardcoded definitions
      return {
        templates: INDUSTRY_TEMPLATE_DEFINITIONS.map(t => ({
          id: t.id,
          sourceId: t.id,
          label: t.label,
          category: t.category,
          description: t.description,
          chapters: t.chapters,
          fromDB: false,
        })),
        fromDB: false,
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const templates = query.data?.templates || [];
  const fromDB = query.data?.fromDB || false;

  // Group by category
  const byCategory = templates.reduce((acc, t) => {
    const cat = t.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {} as Record<string, IndustryTemplate[]>);

  // Get chapter titles by sourceId (for compatibility with old TEMPLATE_CHAPTERS usage)
  const getChapters = (sourceId: string): string[] => {
    const tmpl = templates.find(t => t.sourceId === sourceId || t.id === sourceId);
    return tmpl?.chapters || [];
  };

  // Convert to MultiSelectOption format for dropdowns
  const asMultiSelectOptions: IndustryTemplateOption[] = templates.map(t => ({
    id: t.sourceId,
    value: t.sourceId,
    label: t.label,
    category: t.category,
    description: t.description,
  }));

  // Seed industry templates (run migration)
  const seedMutation = useMutation({
    mutationFn: async () => {
      const { seedIndustryTemplates } = await import('@/services/industryTemplateSeed');
      return seedIndustryTemplates();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industry-templates'] });
      queryClient.invalidateQueries({ queryKey: ['video-blueprints'] });
    },
  });

  return {
    templates,
    fromDB,
    byCategory,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    getChapters,
    asMultiSelectOptions,
    seedTemplates: seedMutation.mutate,
    isSeeding: seedMutation.isPending,
  };
}
