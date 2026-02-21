/**
 * GENIE CAST HUB — Redesigned 3-Column Liquid Glass Layout
 * 
 * Desktop: Left Modes Bar | Main Workspace | Guide Dock (Ori + Arc)
 * Mobile: Compact horizontal mode bar + full workspace + sticky bottom nav
 * 
 * Architecture:
 * - Zustand (useGuideStore) for global guide dock state
 * - StepWizard for CREATE sub-step navigation
 * - GuideDock for Ori + Arc character interactions
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { VideoStyleType } from './VideoStyleCards';
import type { ProductGallery } from '../MultiScreenshotGallery';
import { toast } from 'sonner';
import { GenieCastConsolidatedTabs, type ConsolidatedTab } from './GenieCastConsolidatedTabs';
import { GuideDock } from '@/components/shared/GuideDock';
import { useGuideStore, GUIDE_CHARACTERS, type CastMode } from '@/stores/guideStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Video, Share2, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

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

/** Maps mode to consolidated tab key */
const MODE_TO_TAB: Record<CastMode, ConsolidatedTab> = {
  create: 'create',
  produce: 'produce',
  publish: 'publish',
};

// ── Left Mode Bar ────────────────────────────────────────────────────────────

const MODES: { id: CastMode; label: string; icon: React.ReactNode }[] = [
  { id: 'create', label: 'Create', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'produce', label: 'Produce', icon: <Video className="w-5 h-5" /> },
  { id: 'publish', label: 'Publish', icon: <Share2 className="w-5 h-5" /> },
];

const LeftModeBar: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
}> = ({ activeMode, onModeChange }) => (
  <div className="w-[72px] flex-shrink-0 flex flex-col items-center py-6 gap-2 rounded-2xl backdrop-blur-xl bg-white/[0.02] border border-white/[0.06]"
    style={{
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}
  >
    {/* Logo */}
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-4">
      <Film className="w-5 h-5 text-primary" />
    </div>

    {/* Mode buttons */}
    {MODES.map((mode) => {
      const isActive = activeMode === mode.id;
      return (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={cn(
            'relative w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300',
            isActive
              ? 'bg-white/[0.08] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
              : 'text-muted-foreground hover:text-foreground/80 hover:bg-white/[0.04]',
          )}
        >
          {mode.icon}
          <span className="text-[10px] font-medium">{mode.label}</span>
          
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="activeModeBar"
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb,99,102,241),0.5)]"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      );
    })}
  </div>
);

// ── Mobile Mode Selector ─────────────────────────────────────────────────────

const MobileModeSelector: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
}> = ({ activeMode, onModeChange }) => (
  <div className="flex items-center gap-1 p-1 rounded-xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.06]">
    {MODES.map((mode) => {
      const isActive = activeMode === mode.id;
      return (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200',
            isActive
              ? 'bg-white/[0.08] text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground/80',
          )}
        >
          {mode.icon}
          {mode.label}
        </button>
      );
    })}
  </div>
);

// ── Main Hub ─────────────────────────────────────────────────────────────────

export const GenieCastHub: React.FC = () => {
  const isMounted = useRef(true);
  const isMobile = useIsMobile();
  const { mode, setMode, dispatch } = useGuideStore();

  // Persist video styles
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

  const totalScreenshots = screenshotGalleries.reduce(
    (total, gallery) => total + gallery.screenshots.length,
    0,
  );

  // Persist state changes
  useEffect(() => {
    const state: GenieCastHubState = { selectedVideoStyles };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [selectedVideoStyles]);

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
      dispatch({ type: 'STEP_COMPLETED', stepId: 'generate' });
    } catch (error) {
      console.error('[GenieCastHub] Generation failed:', error);
      toast.error('Failed to start generation');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedVideoStyles, dispatch]);

  const handleModeChange = useCallback((newMode: CastMode) => {
    setMode(newMode);
    dispatch({ type: 'SWITCH_MODE', mode: newMode });
  }, [setMode, dispatch]);

  // Sync mode to tab
  const activeTab = MODE_TO_TAB[mode];

  const handleMainTabChange = useCallback((tab: ConsolidatedTab) => {
    const newMode = Object.entries(MODE_TO_TAB).find(([, t]) => t === tab)?.[0] as CastMode | undefined;
    if (newMode && newMode !== mode) {
      handleModeChange(newMode);
    }
  }, [mode, handleModeChange]);

  // ── Mobile Layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] gap-3">
        {/* Mode selector */}
        <MobileModeSelector activeMode={mode} onModeChange={handleModeChange} />
        
        {/* Main workspace */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <GenieCastConsolidatedTabs
                selectedVideoStyles={selectedVideoStyles}
                onStylesChange={handleStylesChange}
                screenshotGalleries={screenshotGalleries}
                onGalleriesUpdated={handleGalleriesUpdated}
                totalScreenshots={totalScreenshots}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                activeMainTabOverride={activeTab}
                onMainTabChange={handleMainTabChange}
                defaultTab="create"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Desktop 3-Column Layout ────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] gap-3">
      {/* Column 1: Left Mode Bar */}
      <LeftModeBar activeMode={mode} onModeChange={handleModeChange} />

      {/* Column 2: Main Workspace */}
      <div className="flex-1 min-w-0 overflow-y-auto rounded-2xl backdrop-blur-xl bg-white/[0.01] border border-white/[0.04]"
        style={{
          boxShadow: '0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <GenieCastConsolidatedTabs
              selectedVideoStyles={selectedVideoStyles}
              onStylesChange={handleStylesChange}
              screenshotGalleries={screenshotGalleries}
              onGalleriesUpdated={handleGalleriesUpdated}
              totalScreenshots={totalScreenshots}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              activeMainTabOverride={activeTab}
              onMainTabChange={handleMainTabChange}
              defaultTab="create"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Column 3: Guide Dock */}
      <GuideDock className="flex-shrink-0" />
    </div>
  );
};

export default GenieCastHub;
