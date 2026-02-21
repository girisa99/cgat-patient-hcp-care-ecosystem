/**
 * GENIE CAST HUB
 * Main wrapper for Genie Cast — now supports both legacy tabs and new StepWizard.
 * Toggle between views during migration; wizard will become default.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { VideoStyleType } from './VideoStyleCards';
import type { ProductGallery } from '../MultiScreenshotGallery';
import { toast } from 'sonner';
import { GenieCastConsolidatedTabs } from './GenieCastConsolidatedTabs';
import { CreateWizardDemo } from './CreateWizardDemo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, LayoutGrid, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConsolidatedTab = 'create' | 'produce' | 'manage' | 'publish' | 'landing';

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
  const [useWizardView, setUseWizardView] = useState(true);
  const [wizardDirection, setWizardDirection] = useState<'ltr' | 'rtl'>('ltr');
  
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
      {/* View toggle + RTL demo switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={useWizardView ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUseWizardView(true)}
            className={cn(
              'rounded-lg gap-1.5 h-8 text-xs',
              useWizardView && 'bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_12px_rgba(var(--primary-rgb,99,102,241),0.25)]',
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Wizard
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-white/20 ml-1">NEW</Badge>
          </Button>
          <Button
            variant={!useWizardView ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUseWizardView(false)}
            className="rounded-lg gap-1.5 h-8 text-xs"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Classic Tabs
          </Button>
        </div>

        {useWizardView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWizardDirection(d => d === 'ltr' ? 'rtl' : 'ltr')}
            className="rounded-lg gap-1.5 h-8 text-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            {wizardDirection === 'ltr' ? 'LTR' : 'RTL'}
          </Button>
        )}
      </div>

      {/* Content */}
      {useWizardView ? (
        <div className="min-h-[500px]">
          <CreateWizardDemo direction={wizardDirection} locale={wizardDirection === 'rtl' ? 'ar' : 'en'} />
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default GenieCastHub;
