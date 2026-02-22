/**
 * GENIE CAST HUB
 * Main wrapper for the consolidated 4-tab Genie Cast interface.
 * Glass morphism shell with region-aware CastRegionSelector + ProviderPipelineBadge.
 *
 * Architecture:
 *   GenieCastHub (shell + provider context)
 *     └─ CastRegionSelector (language/zone picker — drives ALL provider routing)
 *     └─ ProviderPipelineBadge (shows AI pipeline for selected region)
 *     └─ GenieCastConsolidatedTabs (4-tab UI)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { VideoStyleType } from './VideoStyleCards';
import type { ProductGallery } from '../MultiScreenshotGallery';
import { toast } from 'sonner';
import { GenieCastConsolidatedTabs } from './GenieCastConsolidatedTabs';
import { CastRegionSelector } from './CastRegionSelector';
import { useProviderRouting } from '@/hooks/useProviderRouting';
import { ProviderPipelineBadge } from '@/components/ui/ProviderPipelineBadge';

type ConsolidatedTab = 'create' | 'produce' | 'manage' | 'publish' | 'landing';

// Storage keys for persistence
const STORAGE_KEY = 'genie_cast_hub_state';

interface GenieCastHubState {
  selectedVideoStyles: VideoStyleType[];
  activeTab: ConsolidatedTab;
  languageCode: string;
}

const defaultStyles: VideoStyleType[] = [
  'educational',
  'smart_storytelling',
  'hook_videos',
  'ugc_avatar_photorealistic',
  'product_demo',
];

export const GenieCastHub: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isMounted = useRef(true);

  // Restore persisted state
  const [selectedVideoStyles, setSelectedVideoStyles] = useState<VideoStyleType[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GenieCastHubState;
        return parsed.selectedVideoStyles || defaultStyles;
      }
    } catch (e) {
      console.warn('[GenieCastHub] Failed to restore state:', e);
    }
    return defaultStyles;
  });

  // Language / region — persisted, drives provider routing
  const [languageCode, setLanguageCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).languageCode || 'en';
    } catch { /* ignore */ }
    return searchParams.get('lang') || 'en';
  });

  // Provider routing — single source of truth for ALL AI providers
  const routing = useProviderRouting(languageCode);

  const [screenshotGalleries, setScreenshotGalleries] = useState<ProductGallery[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalScreenshots = screenshotGalleries.reduce(
    (total, gallery) => total + gallery.screenshots.length,
    0,
  );

  // Persist state changes
  useEffect(() => {
    const state: GenieCastHubState = {
      selectedVideoStyles,
      activeTab: 'create',
      languageCode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [selectedVideoStyles, languageCode]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Handlers
  const handleStylesChange = useCallback((styles: VideoStyleType[]) => {
    if (!isMounted.current) return;
    setSelectedVideoStyles(styles);
  }, []);

  const handleGalleriesUpdated = useCallback((galleries: ProductGallery[]) => {
    if (!isMounted.current) return;
    setScreenshotGalleries(galleries);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selectedVideoStyles.length === 0) {
      toast.error('Please select at least one video style');
      return;
    }

    setIsGenerating(true);
    try {
      // TODO: Wire to genie-cast-assembler edge function with routing.tts.provider, routing.video.provider etc.
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Video generation started!');
    } catch (error) {
      console.error('[GenieCastHub] Generation failed:', error);
      toast.error('Failed to start generation');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedVideoStyles]);

  // Deep link support: ?tab=produce&action=generate
  const defaultTab = (searchParams.get('tab') as ConsolidatedTab) || 'create';

  return (
    <div className="space-y-3" dir={routing.isRTL ? 'rtl' : 'ltr'}>
      {/* Shell Header — Region selector + AI Pipeline Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <CastRegionSelector
          languageCode={languageCode}
          onLanguageChange={setLanguageCode}
        />
        <ProviderPipelineBadge routing={routing} mode="compact" className="flex-1" />
      </div>

      {/* Main 4-Tab Interface */}
      <GenieCastConsolidatedTabs
        selectedVideoStyles={selectedVideoStyles}
        onStylesChange={handleStylesChange}
        screenshotGalleries={screenshotGalleries}
        onGalleriesUpdated={handleGalleriesUpdated}
        totalScreenshots={totalScreenshots}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        defaultTab={defaultTab}
      />
    </div>
  );
};

export default GenieCastHub;
