/**
 * usePublishingSession — The ONE hook any product calls for publishing.
 *
 * Composes: useSocialOAuth + captionGenerator + platformRegistry +
 * unifiedEcosystemPublishingService + socialCutsService
 *
 * Usage:
 *   const pub = usePublishingSession({ sourceProduct: 'cast', initialContent: pkg });
 *   pub.togglePlatform('youtube');
 *   pub.publish();
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  SocialPlatformId,
  ContentFormatId,
  DeliveryMode,
  PlatformCaption,
  PublishingContentPackage,
  PublishingTarget,
  PublishingOperationResult,
  GenieProduct,
} from '@/types/publishing';
import { getPlatformFamily } from '@/types/publishing';
import {
  PLATFORM_REGISTRY,
  getAllPlatforms,
  getPlatformsForRegion,
  type UnifiedPlatformDef,
} from '@/services/publishing/platformRegistry';
import { generateCaptionsSync } from '@/services/publishing/captionGenerator';
import { useSocialOAuth, type SocialPlatform as OAuthPlatform } from '@/hooks/useSocialOAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserPlatformPreferences } from './useUserPlatformPreferences';

// ─── Options ────────────────────────────────────────────────────────────────

export interface UsePublishingSessionOptions {
  sourceProduct: GenieProduct;
  initialContent?: PublishingContentPackage;
  region?: string;
  subRegion?: string;
  language?: string;
}

// ─── Return Type ────────────────────────────────────────────────────────────

export interface UsePublishingSessionReturn {
  // Content
  content: PublishingContentPackage | null;
  setContent: (c: PublishingContentPackage) => void;

  // Platform selection
  selectedPlatforms: Set<SocialPlatformId>;
  togglePlatform: (id: SocialPlatformId) => void;
  selectAll: () => void;
  clearAll: () => void;

  // Per-platform format
  selectedFormats: Record<string, ContentFormatId>;
  setFormat: (platformId: SocialPlatformId, format: ContentFormatId) => void;

  // Delivery mode
  deliveryModes: Record<string, DeliveryMode>;
  setDeliveryMode: (platformId: SocialPlatformId, mode: DeliveryMode) => void;

  // Captions
  captions: Record<string, PlatformCaption>;
  setCaptions: (c: Record<string, PlatformCaption>) => void;
  updateCaption: (platformId: SocialPlatformId, updates: Partial<PlatformCaption>) => void;
  regenerateCaptions: () => void;

  // OAuth
  connections: ReturnType<typeof useSocialOAuth>['connections'];
  connect: (platform: OAuthPlatform) => Promise<void>;
  disconnect: (platform: OAuthPlatform) => Promise<void>;

  // Actions
  publish: () => Promise<PublishingOperationResult[]>;
  isPublishing: boolean;
  publishResults: PublishingOperationResult[];

  // Scheduling
  scheduledAt: string | null;
  setScheduledAt: (dt: string | null) => void;

  // Platform data
  platforms: UnifiedPlatformDef[];
  availablePlatformsForRegion: UnifiedPlatformDef[];
  connectedPlatforms: SocialPlatformId[];
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePublishingSession(
  options: UsePublishingSessionOptions,
): UsePublishingSessionReturn {
  const { sourceProduct, initialContent, region, subRegion, language } = options;

  // ── State ───────────────────────────────────────────────────────────────
  const [content, setContent] = useState<PublishingContentPackage | null>(
    initialContent || null,
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<SocialPlatformId>>(new Set());
  const [selectedFormats, setSelectedFormats] = useState<Record<string, ContentFormatId>>({});
  const [deliveryModes, setDeliveryModes] = useState<Record<string, DeliveryMode>>({});
  const [captions, setCaptions] = useState<Record<string, PlatformCaption>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishingOperationResult[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);

  // ── OAuth ───────────────────────────────────────────────────────────────
  const oauth = useSocialOAuth();

  // ── User Preferences (pre-select preferred platforms) ──────────────────
  const { preferences: userPrefs } = useUserPlatformPreferences();

  useEffect(() => {
    if (userPrefs?.preferredPlatforms?.length && selectedPlatforms.size === 0) {
      const prefSet = new Set<SocialPlatformId>(userPrefs.preferredPlatforms);
      setSelectedPlatforms(prefSet);
      // Set default formats/delivery for each
      for (const id of userPrefs.preferredPlatforms) {
        const reg = PLATFORM_REGISTRY[id];
        setSelectedFormats(f => ({
          ...f,
          [id]: f[id] || (reg?.supportsShorts ? 'short_video' : 'long_video'),
        }));
        setDeliveryModes(d => ({
          ...d,
          [id]: d[id] || (userPrefs.defaultDeliveryMode || 'direct_publish'),
        }));
      }
    }
  }, [userPrefs]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Platform data ─────────────────────────────────────────────────────
  const platforms = useMemo(() => getAllPlatforms(), []);

  const availablePlatformsForRegion = useMemo(() => {
    if (!region) return platforms;
    return getPlatformsForRegion(region);
  }, [region, platforms]);

  const connectedPlatforms = useMemo<SocialPlatformId[]>(() => {
    const connected: SocialPlatformId[] = [];
    for (const plat of platforms) {
      const family = getPlatformFamily(plat.id);
      const oauthKey = family as OAuthPlatform;
      if (oauth.connections[oauthKey]?.connected) {
        connected.push(plat.id);
      }
    }
    return connected;
  }, [platforms, oauth.connections]);

  // ── Platform selection ────────────────────────────────────────────────
  const togglePlatform = useCallback((id: SocialPlatformId) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Default format + delivery mode for newly selected platform
        const reg = PLATFORM_REGISTRY[id];
        if (!selectedFormats[id]) {
          setSelectedFormats(f => ({
            ...f,
            [id]: reg?.supportsShorts ? 'short_video' : 'long_video',
          }));
        }
        if (!deliveryModes[id]) {
          setDeliveryModes(d => ({ ...d, [id]: 'direct_publish' }));
        }
      }
      return next;
    });
  }, [selectedFormats, deliveryModes]);

  const selectAll = useCallback(() => {
    const allIds = new Set(availablePlatformsForRegion.map(p => p.id));
    setSelectedPlatforms(allIds);
  }, [availablePlatformsForRegion]);

  const clearAll = useCallback(() => {
    setSelectedPlatforms(new Set());
  }, []);

  // ── Formats & Delivery ───────────────────────────────────────────────
  const setFormat = useCallback((platformId: SocialPlatformId, format: ContentFormatId) => {
    setSelectedFormats(prev => ({ ...prev, [platformId]: format }));
  }, []);

  const setDeliveryMode = useCallback((platformId: SocialPlatformId, mode: DeliveryMode) => {
    setDeliveryModes(prev => ({ ...prev, [platformId]: mode }));
  }, []);

  // ── Captions ──────────────────────────────────────────────────────────
  const updateCaption = useCallback((platformId: SocialPlatformId, updates: Partial<PlatformCaption>) => {
    setCaptions(prev => ({
      ...prev,
      [platformId]: { ...prev[platformId], ...updates } as PlatformCaption,
    }));
  }, []);

  const regenerateCaptions = useCallback(() => {
    if (!content || selectedPlatforms.size === 0) return;
    const generated = generateCaptionsSync({
      baseTitle: content.title,
      baseDescription: content.rawDescription,
      contentType: selectedFormats[Array.from(selectedPlatforms)[0]] || 'short_video',
      platforms: Array.from(selectedPlatforms),
      language: language || content.language || 'en',
      region: region || content.region,
      subRegion: subRegion || content.subRegion,
    });
    setCaptions(generated);
  }, [content, selectedPlatforms, selectedFormats, language, region, subRegion]);

  // ── Publish ───────────────────────────────────────────────────────────
  const publish = useCallback(async (): Promise<PublishingOperationResult[]> => {
    if (!content) {
      toast.error('No content to publish');
      return [];
    }

    if (selectedPlatforms.size === 0) {
      toast.error('No platforms selected');
      return [];
    }

    setIsPublishing(true);
    const results: PublishingOperationResult[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to publish');
        return [];
      }

      // Build targets
      const targets: PublishingTarget[] = Array.from(selectedPlatforms).map(platformId => ({
        platformId,
        contentFormatId: selectedFormats[platformId] || 'short_video',
        deliveryMode: deliveryModes[platformId] || 'direct_publish',
        enabled: true,
        caption: captions[platformId],
        scheduledAt: scheduledAt || undefined,
        visibility: 'public' as const,
      }));

      // Call social-publish edge function for each target
      for (const target of targets) {
        const mode = target.deliveryMode;

        if (mode === 'download_export') {
          // For downloads, just provide the URL
          results.push({
            platformId: target.platformId,
            success: true,
            deliveryMode: mode,
            downloadUrl: content.primaryUrl,
          });
          continue;
        }

        if (mode === 'url_share') {
          results.push({
            platformId: target.platformId,
            success: true,
            deliveryMode: mode,
            postUrl: content.primaryUrl,
          });
          continue;
        }

        // Direct publish or scheduled
        try {
          const caption = target.caption;
          const { data, error } = await supabase.functions.invoke('social-publish', {
            body: {
              platform: getPlatformFamily(target.platformId),
              content: {
                title: caption?.shortCaption || content.title,
                text: caption?.longDescription || content.rawDescription,
                mediaUrl: content.primaryUrl,
                thumbnailUrl: content.thumbnailUrl,
                contentType: content.contentType,
                tags: caption?.hashtags?.map(h => h.replace('#', '')) || [],
                visibility: target.visibility || 'public',
              },
              scheduledAt: mode === 'scheduled' ? target.scheduledAt : undefined,
              sourceProduct,
            },
          });

          if (error) throw error;

          results.push({
            platformId: target.platformId,
            success: true,
            deliveryMode: mode,
            postId: data?.postId,
            postUrl: data?.postUrl,
          });
        } catch (err) {
          results.push({
            platformId: target.platformId,
            success: false,
            deliveryMode: mode,
            error: err instanceof Error ? err.message : 'Publishing failed',
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        toast.success(`Published to ${successCount} platform${successCount > 1 ? 's' : ''}`);
      }
      const failCount = results.filter(r => !r.success).length;
      if (failCount > 0) {
        toast.error(`Failed on ${failCount} platform${failCount > 1 ? 's' : ''}`);
      }

      setPublishResults(results);
      return results;
    } catch (error) {
      console.error('[usePublishingSession] Publish error:', error);
      toast.error('Publishing failed');
      return [];
    } finally {
      setIsPublishing(false);
    }
  }, [content, selectedPlatforms, selectedFormats, deliveryModes, captions, scheduledAt, sourceProduct]);

  // ── Return ────────────────────────────────────────────────────────────
  return {
    content,
    setContent,
    selectedPlatforms,
    togglePlatform,
    selectAll,
    clearAll,
    selectedFormats,
    setFormat,
    deliveryModes,
    setDeliveryMode,
    captions,
    setCaptions,
    updateCaption,
    regenerateCaptions,
    connections: oauth.connections,
    connect: oauth.connect,
    disconnect: oauth.disconnect,
    publish,
    isPublishing,
    publishResults,
    scheduledAt,
    setScheduledAt,
    platforms,
    availablePlatformsForRegion,
    connectedPlatforms,
  };
}
