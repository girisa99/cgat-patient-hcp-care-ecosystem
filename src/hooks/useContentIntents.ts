/**
 * useContentIntents - Database-driven content intent registry
 * 
 * Fetches intents from `content_intents` table with fallback to hardcoded defaults.
 * Follows the dynamicMarketingRegistryService pattern (React Query + cache + fallback).
 * 
 * Supports:
 * - System defaults (is_system_default = true)
 * - User-created custom intents
 * - Sub-intents via parent_intent_id
 * - CRUD mutations for superAdmin / owner
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface ContentIntent {
  id: string;
  intent_key: string;
  label: string;
  description: string;
  category: string;
  default_styles: string[];
  icon: string | null;
  sort_order: number;
  is_system_default: boolean;
  is_active: boolean;
  parent_intent_id: string | null;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ContentIntentCategory = 'marketing' | 'education' | 'enterprise' | 'social' | 'healthcare' | 'creative' | 'internal' | 'events';

// ============================================================================
// HARDCODED FALLBACK (used only if DB is unavailable)
// ============================================================================

const FALLBACK_INTENTS: ContentIntent[] = [
  { id: 'fb-1', intent_key: 'product-demo', label: 'Product Demo', description: 'Showcase product features', category: 'marketing', default_styles: ['product_demo'], icon: null, sort_order: 1, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-2', intent_key: 'hero-banner', label: 'Hero Banner', description: 'Landing page hero video', category: 'marketing', default_styles: ['hook_videos'], icon: null, sort_order: 2, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-3', intent_key: 'educational', label: 'Educational', description: 'Training & learning content', category: 'education', default_styles: ['educational'], icon: null, sort_order: 3, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-4', intent_key: 'testimonial', label: 'Testimonial', description: 'Customer success stories', category: 'marketing', default_styles: ['ugc_avatar_photorealistic'], icon: null, sort_order: 4, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-5', intent_key: 'case-study', label: 'Case Study', description: 'In-depth customer stories', category: 'enterprise', default_styles: ['smart_storytelling'], icon: null, sort_order: 5, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-6', intent_key: 'social-short', label: 'Social Short', description: 'Short-form social content', category: 'social', default_styles: ['hook_videos'], icon: null, sort_order: 6, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-7', intent_key: 'how-to', label: 'How-To Guide', description: 'Step-by-step tutorials', category: 'education', default_styles: ['educational'], icon: null, sort_order: 7, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-8', intent_key: 'thought-leadership', label: 'Thought Leadership', description: 'Industry expert content', category: 'enterprise', default_styles: ['smart_storytelling'], icon: null, sort_order: 8, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-9', intent_key: 'explainer', label: 'Explainer', description: 'Concept explainer video', category: 'education', default_styles: ['educational', 'animation_3d_explainer'], icon: null, sort_order: 9, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-10', intent_key: 'internal-comms', label: 'Internal Comms', description: 'Company announcements', category: 'enterprise', default_styles: ['corporate_training'], icon: null, sort_order: 10, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-11', intent_key: 'event-promo', label: 'Event Promo', description: 'Event promotion & recap', category: 'marketing', default_styles: ['event_recap'], icon: null, sort_order: 11, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
  { id: 'fb-12', intent_key: 'investor-update', label: 'Investor Update', description: 'Stakeholder communications', category: 'enterprise', default_styles: ['investor_pitch'], icon: null, sort_order: 12, is_system_default: true, is_active: true, parent_intent_id: null, user_id: null, metadata: {}, created_at: '', updated_at: '' },
];

// ============================================================================
// FETCH
// ============================================================================

const fetchContentIntents = async (): Promise<ContentIntent[]> => {
  const { data, error } = await (supabase as any)
    .from('content_intents')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('[useContentIntents] DB fetch failed, using fallback:', error.message);
    return FALLBACK_INTENTS;
  }

  return (data as ContentIntent[]) ?? FALLBACK_INTENTS;
};

// ============================================================================
// HOOK
// ============================================================================

export const useContentIntents = () => {
  const queryClient = useQueryClient();
  const queryKey = ['content_intents'];

  const query = useQuery({
    queryKey,
    queryFn: fetchContentIntents,
    staleTime: 5 * 60 * 1000, // 5 min cache
    placeholderData: FALLBACK_INTENTS,
  });

  const intents = query.data ?? FALLBACK_INTENTS;

  // Helpers
  const getByKey = (key: string) => intents.find(i => i.intent_key === key);
  const getByCategory = (cat: string) => intents.filter(i => i.category === cat && !i.parent_intent_id);
  const getSubIntents = (parentKey: string) => {
    const parent = getByKey(parentKey);
    if (!parent) return [];
    return intents.filter(i => i.parent_intent_id === parent.id);
  };
  const categories = [...new Set(intents.map(i => i.category))];
  const topLevel = intents.filter(i => !i.parent_intent_id);

  // Mutations
  const createIntent = useMutation({
    mutationFn: async (intent: Partial<ContentIntent>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from('content_intents')
        .insert({ ...intent, user_id: user?.id, is_system_default: false });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateIntent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ContentIntent> }) => {
      const { error } = await (supabase as any)
        .from('content_intents')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteIntent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('content_intents')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    intents,
    topLevel,
    categories,
    isLoading: query.isLoading,
    error: query.error,
    getByKey,
    getByCategory,
    getSubIntents,
    createIntent,
    updateIntent,
    deleteIntent,
    refetch: query.refetch,
  };
};

export default useContentIntents;
