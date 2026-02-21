/**
 * GENIE CAST HUB — Redesigned 3-Column Liquid Glass Layout
 * 
 * Full Cast UI Redesign:
 * - Left Mode Bar: Sleek vertical nav with animated active indicator
 * - Main Workspace: Content area with refined tab system
 * - Guide Dock: Ori + Arc with handoff animations
 * 
 * Desktop: Left Modes Bar | Main Workspace | Guide Dock
 * Mobile: Horizontal mode selector + workspace + bottom nav
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
import { Sparkles, Video, Share2, Film, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Storage keys
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

const MODE_TO_TAB: Record<CastMode, ConsolidatedTab> = {
  create: 'create',
  produce: 'produce',
  publish: 'publish',
};

// ── Mode Config ──────────────────────────────────────────────────────────────

const MODES: { id: CastMode; label: string; icon: React.ElementType; accent: string }[] = [
  { id: 'create', label: 'Create', icon: Sparkles, accent: 'from-orange-500/20 to-amber-500/10' },
  { id: 'produce', label: 'Produce', icon: Video, accent: 'from-blue-500/20 to-cyan-500/10' },
  { id: 'publish', label: 'Publish', icon: Share2, accent: 'from-purple-500/20 to-violet-500/10' },
];

// ── Left Mode Bar (Redesigned) ───────────────────────────────────────────────

const LeftModeBar: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
}> = ({ activeMode, onModeChange }) => (
  <div
    className={cn(
      'w-[76px] flex-shrink-0 flex flex-col items-center py-5 gap-1',
      'rounded-2xl backdrop-blur-2xl',
      'bg-background/80 border border-border/30',
      'shadow-[0_4px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.06)]',
    )}
  >
    {/* Logo mark */}
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mb-5">
      <Film className="w-5 h-5 text-primary" />
    </div>

    {/* Mode buttons */}
    <div className="flex flex-col gap-1 w-full px-2">
      {MODES.map((mode) => {
        const isActive = activeMode === mode.id;
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              'relative w-full rounded-xl flex flex-col items-center justify-center gap-1 py-3.5 transition-all duration-300',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/80',
            )}
          >
            {/* Active background glow */}
            {isActive && (
              <motion.div
                layoutId="modeBarBg"
                className={cn('absolute inset-0 rounded-xl bg-gradient-to-b', mode.accent)}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
            )}

            {/* Active left indicator */}
            {isActive && (
              <motion.div
                layoutId="modeBarIndicator"
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary"
                style={{ boxShadow: '0 0 10px hsl(var(--primary) / 0.5)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            <Icon className={cn('w-5 h-5 relative z-10', isActive && 'text-primary')} />
            <span className={cn(
              'text-[10px] font-semibold relative z-10 tracking-wide',
              isActive && 'text-foreground',
            )}>
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>

    {/* Spacer */}
    <div className="flex-1" />

    {/* Bottom separator */}
    <div className="w-8 h-[1px] bg-border/20 mb-2" />
    <div className="text-[9px] text-muted-foreground/40 font-mono tracking-widest">CAST</div>
  </div>
);

// ── Mobile Mode Selector (Redesigned) ────────────────────────────────────────

const MobileModeSelector: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
}> = ({ activeMode, onModeChange }) => (
  <div className="flex items-center gap-1 p-1.5 rounded-xl backdrop-blur-2xl bg-background/80 border border-border/30 shadow-sm">
    {MODES.map((mode) => {
      const isActive = activeMode === mode.id;
      const Icon = mode.icon;
      return (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={cn(
            'relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200',
            isActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground/80',
          )}
        >
          {isActive && (
            <motion.div
              layoutId="mobileModeBar"
              className={cn('absolute inset-0 rounded-lg bg-gradient-to-r', mode.accent)}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Icon className={cn('w-4 h-4 relative z-10', isActive && 'text-primary')} />
          <span className="relative z-10">{mode.label}</span>
        </button>
      );
    })}
  </div>
);

// ── Main Hub (Redesigned) ────────────────────────────────────────────────────

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

  useEffect(() => {
    const state: GenieCastHubState = { selectedVideoStyles };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [selectedVideoStyles]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

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
      <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] gap-3 p-3">
        <MobileModeSelector activeMode={mode} onModeChange={handleModeChange} />
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
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
    <div className="flex h-full min-h-[calc(100vh-4rem)] gap-3 p-2">
      {/* Column 1: Left Mode Bar */}
      <LeftModeBar activeMode={mode} onModeChange={handleModeChange} />

      {/* Column 2: Main Workspace */}
      <div
        className={cn(
          'flex-1 min-w-0 overflow-y-auto rounded-2xl',
          'backdrop-blur-2xl bg-background/60 border border-border/20',
        )}
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
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
