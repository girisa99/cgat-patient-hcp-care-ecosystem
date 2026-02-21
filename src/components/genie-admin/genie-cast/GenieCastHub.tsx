/**
 * GENIE CAST HUB
 * Main wrapper for Genie Cast — StepWizard wraps existing consolidated tabs.
 * Wizard sidebar (desktop) / dots (mobile) navigate CREATE → PRODUCE → PUBLISH.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { VideoStyleType } from './VideoStyleCards';
import type { ProductGallery } from '../MultiScreenshotGallery';
import { toast } from 'sonner';
import { GenieCastConsolidatedTabs, type ConsolidatedTab } from './GenieCastConsolidatedTabs';
import { StepWizardProvider, StepWizard, useStepWizard, type WizardStep } from '@/components/shared/step-wizard';
import { Sparkles, Video, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

// AI-generated step thumbnails
import stepIntentThumb from '@/assets/wizard-icons/step-intent.png';
import stepStyleThumb from '@/assets/wizard-icons/step-style.png';
import stepReviewThumb from '@/assets/wizard-icons/step-review.png';

// Storage keys for persistence
const STORAGE_KEY = 'genie_cast_hub_state';

interface GenieCastHubState {
  selectedVideoStyles: VideoStyleType[];
}

const defaultStyles: VideoStyleType[] = [
  'educational',
  'smart_storytelling',
  'hook_videos',
  'ugc_avatar_photorealistic',
  'product_demo',
];

/** Maps wizard step index → consolidated tab key */
const STEP_TO_TAB: ConsolidatedTab[] = ['create', 'produce', 'publish'];

/**
 * Bridge component that syncs wizard step ↔ consolidated tabs.
 * Must be inside StepWizardProvider.
 */
const WizardTabBridge: React.FC<{
  selectedVideoStyles: VideoStyleType[];
  onStylesChange: (styles: VideoStyleType[]) => void;
  screenshotGalleries: ProductGallery[];
  onGalleriesUpdated: (galleries: ProductGallery[]) => void;
  totalScreenshots: number;
  onGenerate: () => void;
  isGenerating: boolean;
  direction: 'ltr' | 'rtl';
}> = ({
  selectedVideoStyles,
  onStylesChange,
  screenshotGalleries,
  onGalleriesUpdated,
  totalScreenshots,
  onGenerate,
  isGenerating,
  direction,
}) => {
  const { currentStep, goToStep } = useStepWizard();
  const activeTab = STEP_TO_TAB[currentStep] || 'create';

  // When the consolidated tabs want to change main tab, sync wizard
  const handleMainTabChange = useCallback((tab: ConsolidatedTab) => {
    const idx = STEP_TO_TAB.indexOf(tab);
    if (idx >= 0 && idx !== currentStep) {
      goToStep(idx);
    }
  }, [currentStep, goToStep]);

  return (
    <GenieCastConsolidatedTabs
      selectedVideoStyles={selectedVideoStyles}
      onStylesChange={onStylesChange}
      screenshotGalleries={screenshotGalleries}
      onGalleriesUpdated={onGalleriesUpdated}
      totalScreenshots={totalScreenshots}
      onGenerate={onGenerate}
      isGenerating={isGenerating}
      wizardMode
      activeMainTabOverride={activeTab}
      onMainTabChange={handleMainTabChange}
      defaultTab="create"
    />
  );
};

export const GenieCastHub: React.FC = () => {
  // Track component mount state
  const isMounted = useRef(true);
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
    const state: GenieCastHubState = { selectedVideoStyles };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [selectedVideoStyles]);

  // Track mount lifecycle
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Video generation started!');
    } catch (error) {
      console.error('[GenieCastHub] Generation failed:', error);
      toast.error('Failed to start generation');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedVideoStyles]);

  // Wizard steps config
  const steps = useMemo<WizardStep[]>(() => [
    {
      id: 'create',
      label: 'CREATE',
      localLabel: wizardDirection === 'rtl' ? 'إنشاء' : undefined,
      description: 'Intent, Templates & Assets',
      localDescription: wizardDirection === 'rtl' ? 'النية والقوالب والأصول' : undefined,
      thumbnail: stepIntentThumb,
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'produce',
      label: 'PRODUCE',
      localLabel: wizardDirection === 'rtl' ? 'إنتاج' : undefined,
      description: 'Generate, Edit & Manage',
      localDescription: wizardDirection === 'rtl' ? 'توليد وتحرير وإدارة' : undefined,
      thumbnail: stepStyleThumb,
      icon: <Video className="w-4 h-4" />,
    },
    {
      id: 'publish',
      label: 'PUBLISH',
      localLabel: wizardDirection === 'rtl' ? 'نشر' : undefined,
      description: 'Schedule, Distribute & Optimize',
      localDescription: wizardDirection === 'rtl' ? 'جدولة وتوزيع وتحسين' : undefined,
      thumbnail: stepReviewThumb,
      icon: <Share2 className="w-4 h-4" />,
    },
  ], [wizardDirection]);

  return (
    <div className="space-y-4">
      {/* RTL toggle for testing */}
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWizardDirection(d => d === 'ltr' ? 'rtl' : 'ltr')}
          className="rounded-lg gap-1.5 h-8 text-xs"
        >
          <Globe className="w-3.5 h-3.5" />
          {wizardDirection === 'ltr' ? 'LTR' : 'RTL'}
        </Button>
      </div>

      {/* StepWizard wrapping the existing consolidated tabs */}
      <div className="min-h-[500px]">
        <StepWizardProvider
          config={{
            steps,
            direction: wizardDirection,
            locale: wizardDirection === 'rtl' ? 'ar' : 'en',
            onComplete: () => toast.success('🚀 Workflow complete!'),
            allowJumpBack: true,
          }}
        >
          <StepWizard
            completeLabel="Finish"
            localCompleteLabel={wizardDirection === 'rtl' ? 'إنهاء' : undefined}
            nextLabel="Next"
            localNextLabel={wizardDirection === 'rtl' ? 'التالي' : undefined}
            prevLabel="Back"
            localPrevLabel={wizardDirection === 'rtl' ? 'السابق' : undefined}
          >
            {/* Single child — bridge reads currentStep from wizard context and syncs to consolidated tabs */}
            <WizardTabBridge
              selectedVideoStyles={selectedVideoStyles}
              onStylesChange={handleStylesChange}
              screenshotGalleries={screenshotGalleries}
              onGalleriesUpdated={handleGalleriesUpdated}
              totalScreenshots={totalScreenshots}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              direction={wizardDirection}
            />
          </StepWizard>
        </StepWizardProvider>
      </div>
    </div>
  );
};

export default GenieCastHub;
