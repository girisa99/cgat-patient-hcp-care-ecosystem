/**
 * GENIE CAST HUB
 * Main wrapper for the consolidated 4-tab Genie Cast interface
 * Manages state and passes to GenieCastConsolidatedTabs
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GenieCastConsolidatedTabs, type ConsolidatedTab } from './GenieCastConsolidatedTabs';
import type { VideoStyleType } from './VideoStyleCards';
import type { ProductGallery } from '../MultiScreenshotGallery';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Storage keys for persistence
const STORAGE_KEY = 'genie_cast_hub_state';

interface GenieCastHubState {
  selectedVideoStyles: VideoStyleType[];
  activeTab: ConsolidatedTab;
}

const defaultStyles: VideoStyleType[] = [
  'educational',
  'smart_storytelling',
  'hook_videos',
  'ugc_avatar_photorealistic',
  'product_demo',
];

export const GenieCastHub: React.FC = () => {
  // Track component mount state
  const isMounted = useRef(true);
  
  // Persist state to localStorage
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

  const [screenshotGalleries, setScreenshotGalleries] = useState<ProductGallery[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate total screenshots
  const totalScreenshots = screenshotGalleries.reduce(
    (total, gallery) => total + gallery.screenshots.length, 
    0
  );

  // Persist state changes
  useEffect(() => {
    const state: GenieCastHubState = {
      selectedVideoStyles,
      activeTab: 'create',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [selectedVideoStyles]);

  // Track mount lifecycle
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
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
      // TODO: Implement actual generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Video generation started!');
    } catch (error) {
      console.error('[GenieCastHub] Generation failed:', error);
      toast.error('Failed to start generation');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedVideoStyles]);

  return (
    <div className="space-y-4">
      <GenieCastConsolidatedTabs
        selectedVideoStyles={selectedVideoStyles}
        onStylesChange={handleStylesChange}
        screenshotGalleries={screenshotGalleries}
        onGalleriesUpdated={handleGalleriesUpdated}
        totalScreenshots={totalScreenshots}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        defaultTab="create"
      />
    </div>
  );
};

export default GenieCastHub;
