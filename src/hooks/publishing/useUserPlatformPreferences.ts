/**
 * useUserPlatformPreferences — CRUD hook for user's preferred platforms,
 * formats, delivery modes, and auto-publish settings.
 *
 * Reads from / writes to `user_platform_preferences` Supabase table.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  SocialPlatformId,
  ContentFormatId,
  DeliveryMode,
} from '@/types/publishing';
import type { OutletPlatformId } from '@/types/publishing';
import type { MessagingArchetype, IndustryVertical } from '@/services/publishing/autoPublishContentEngine';
import { toast } from 'sonner';

// ─── Shape ──────────────────────────────────────────────────────────────────

export interface UserPlatformPreferences {
  preferredPlatforms: SocialPlatformId[];
  preferredOutlets: OutletPlatformId[];
  preferredFormats: ContentFormatId[];
  defaultDeliveryMode: DeliveryMode;
  defaultRegion?: string;
  defaultSubRegion?: string;
  defaultLanguage: string;
  timezone: string;
  preferredIndustries: IndustryVertical[];
  preferredMessagingTones: MessagingArchetype[];
  autoPublishEnabled: boolean;
  autoPublishCadenceDays: number;
  autoPublishRequireApproval: boolean;
}

const DEFAULT_PREFS: UserPlatformPreferences = {
  preferredPlatforms: [],
  preferredOutlets: [],
  preferredFormats: [],
  defaultDeliveryMode: 'download_export',
  defaultLanguage: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  preferredIndustries: [],
  preferredMessagingTones: [],
  autoPublishEnabled: false,
  autoPublishCadenceDays: 2,
  autoPublishRequireApproval: true,
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useUserPlatformPreferences() {
  const [preferences, setPreferences] = useState<UserPlatformPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setPreferences(DEFAULT_PREFS);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_platform_preferences' as any)
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          // Table may not exist yet — use defaults silently
          console.warn('[useUserPlatformPreferences] Load error (using defaults):', error.message);
          setPreferences(DEFAULT_PREFS);
        } else if (data) {
          setPreferences(mapRowToPrefs(data));
        } else {
          setPreferences(DEFAULT_PREFS);
        }
      } catch {
        if (!cancelled) setPreferences(DEFAULT_PREFS);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Persist changes
  const updatePreferences = useCallback(async (partial: Partial<UserPlatformPreferences>) => {
    setPreferences(prev => {
      const next = { ...(prev || DEFAULT_PREFS), ...partial };
      // Fire-and-forget persist
      persistPrefs(next).catch(() => {});
      return next;
    });
  }, []);

  // Toggle helpers
  const togglePlatform = useCallback((id: SocialPlatformId) => {
    setPreferences(prev => {
      if (!prev) return prev;
      const list = [...prev.preferredPlatforms];
      const idx = list.indexOf(id);
      if (idx >= 0) list.splice(idx, 1); else list.push(id);
      const next = { ...prev, preferredPlatforms: list };
      persistPrefs(next).catch(() => {});
      return next;
    });
  }, []);

  const toggleOutlet = useCallback((id: OutletPlatformId) => {
    setPreferences(prev => {
      if (!prev) return prev;
      const list = [...prev.preferredOutlets];
      const idx = list.indexOf(id);
      if (idx >= 0) list.splice(idx, 1); else list.push(id);
      const next = { ...prev, preferredOutlets: list };
      persistPrefs(next).catch(() => {});
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setPreferences(DEFAULT_PREFS);
    persistPrefs(DEFAULT_PREFS).catch(() => {});
    toast.info('Platform preferences reset to defaults');
  }, []);

  return {
    preferences,
    isLoading,
    updatePreferences,
    togglePlatform,
    toggleOutlet,
    resetToDefaults,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapRowToPrefs(row: any): UserPlatformPreferences {
  return {
    preferredPlatforms: Array.isArray(row.preferred_platforms) ? row.preferred_platforms : [],
    preferredOutlets: Array.isArray(row.preferred_outlets) ? row.preferred_outlets : [],
    preferredFormats: Array.isArray(row.preferred_formats) ? row.preferred_formats : [],
    defaultDeliveryMode: row.default_delivery_mode || 'download_export',
    defaultRegion: row.default_region || undefined,
    defaultSubRegion: row.default_sub_region || undefined,
    defaultLanguage: row.default_language || 'en',
    timezone: row.timezone || 'UTC',
    preferredIndustries: Array.isArray(row.preferred_industries) ? row.preferred_industries : [],
    preferredMessagingTones: Array.isArray(row.preferred_messaging_tones) ? row.preferred_messaging_tones : [],
    autoPublishEnabled: !!row.auto_publish_enabled,
    autoPublishCadenceDays: row.auto_publish_cadence_days ?? 2,
    autoPublishRequireApproval: row.auto_publish_require_approval ?? true,
  };
}

async function persistPrefs(prefs: UserPlatformPreferences): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const row = {
      user_id: session.user.id,
      preferred_platforms: prefs.preferredPlatforms,
      preferred_outlets: prefs.preferredOutlets,
      preferred_formats: prefs.preferredFormats,
      default_delivery_mode: prefs.defaultDeliveryMode,
      default_region: prefs.defaultRegion || null,
      default_sub_region: prefs.defaultSubRegion || null,
      default_language: prefs.defaultLanguage,
      timezone: prefs.timezone,
      preferred_industries: prefs.preferredIndustries,
      preferred_messaging_tones: prefs.preferredMessagingTones,
      auto_publish_enabled: prefs.autoPublishEnabled,
      auto_publish_cadence_days: prefs.autoPublishCadenceDays,
      auto_publish_require_approval: prefs.autoPublishRequireApproval,
    };

    await supabase
      .from('user_platform_preferences' as any)
      .upsert(row, { onConflict: 'user_id' });
  } catch (err) {
    console.warn('[useUserPlatformPreferences] Persist error:', err);
  }
}
