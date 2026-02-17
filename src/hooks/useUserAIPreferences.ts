/**
 * useUserAIPreferences - Global AI provider preference management
 * 
 * Persists user's preferred AI providers to Supabase.
 * Works across all 8 Genie Suite products.
 * Follows "Both" model: global defaults + per-template overrides.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDefaultZoneProviders, mergeProviderPreferences } from '@/config/aiProvidersConfig';

export interface UserAIPreference {
  id: string;
  user_id: string;
  selected_providers: string[];
  category_overrides: Record<string, string[]>;
  product_scope: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserAIPreferences = (productScope?: string) => {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserAIPreference | null>(null);

  // Load preferences for current user + product scope
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const query = supabase
        .from('user_ai_preferences')
        .select('*')
        .eq('user_id', user.id);

      // Match product scope (null = global)
      if (productScope) {
        query.eq('product_scope', productScope);
      } else {
        query.is('product_scope', null);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;

      if (data) {
        setPreferences({
          id: data.id,
          user_id: data.user_id,
          selected_providers: data.selected_providers || [],
          category_overrides: (data.category_overrides as Record<string, string[]>) || {},
          product_scope: data.product_scope,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    } catch (error) {
      console.error('Error loading AI preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [productScope]);

  // Save or update preferences
  const savePreferences = useCallback(async (
    selectedProviders: string[],
    categoryOverrides?: Record<string, string[]>
  ) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const payload = {
        user_id: user.id,
        selected_providers: selectedProviders,
        category_overrides: categoryOverrides || {},
        product_scope: productScope || null,
      };

      const { data, error } = await supabase
        .from('user_ai_preferences')
        .upsert(payload, { onConflict: 'user_id,product_scope' })
        .select()
        .single();

      if (error) throw error;

      const saved: UserAIPreference = {
        id: data.id,
        user_id: data.user_id,
        selected_providers: data.selected_providers || [],
        category_overrides: (data.category_overrides as Record<string, string[]>) || {},
        product_scope: data.product_scope,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setPreferences(saved);
      return saved;
    } catch (error) {
      console.error('Error saving AI preferences:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [productScope]);

  /**
   * Get effective providers: merges global prefs with optional template overrides.
   * Use this in any product to resolve which providers to use.
   */
  const getEffectiveProviders = useCallback((templateProviders?: string[]): string[] => {
    const globalProviders = preferences?.selected_providers || [];
    return mergeProviderPreferences(globalProviders, templateProviders);
  }, [preferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    loading,
    preferences,
    loadPreferences,
    savePreferences,
    getEffectiveProviders,
    /** Fallback: zone defaults if no preferences saved */
    zoneDefaults: getDefaultZoneProviders(),
  };
};
