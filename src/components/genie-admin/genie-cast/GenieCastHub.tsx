/**
 * GENIE CAST HUB — Modern SaaS 3-Column Layout (Full Redesign)
 * 
 * Reference: Dark sidebar + clean workspace + right panel with timeline/AI devs
 * 
 * Desktop: Dark Left Sidebar | Main Workspace (light/themed) | Right Panel
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
import { 
  Sparkles, Video, Share2, Film, Plus, Search, Bell, 
  Home, FolderOpen, Users, LayoutTemplate, Package, 
  Palette, BarChart3, Settings, HelpCircle, ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

const MODES: { id: CastMode; label: string; icon: React.ElementType; gradient: string }[] = [
  { id: 'create', label: 'Create', icon: Sparkles, gradient: 'from-amber-500 to-orange-600' },
  { id: 'produce', label: 'Produce', icon: Video, gradient: 'from-blue-500 to-cyan-600' },
  { id: 'publish', label: 'Publish', icon: Share2, gradient: 'from-violet-500 to-purple-600' },
];

// ── Sidebar Nav Items ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'ai-devs', label: 'AI Developers', icon: Users, badge: 'New' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'assets', label: 'Assets', icon: Package, hasSubmenu: true },
  { id: 'brand-kit', label: 'Brand Kit', icon: Palette },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const NAV_BOTTOM = [
  { id: 'settings', label: 'Settings', icon: Settings, hasSubmenu: true },
];

// ── Left Sidebar (Dark, Reference-Matched) ───────────────────────────────────

const LeftSidebar: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
}> = ({ activeMode, onModeChange }) => {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <div className="w-[220px] flex-shrink-0 flex flex-col bg-[hsl(var(--sidebar-background,222_47%_11%))] text-[hsl(var(--sidebar-foreground,210_40%_98%))] rounded-2xl overflow-hidden">
      {/* Brand header */}
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Film className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold tracking-tight">Genie Suite</span>
      </div>

      {/* New Project CTA */}
      <div className="px-3 mb-4">
        <Button
          className="w-full h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg gap-1.5"
          size="sm"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </Button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150',
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge className="h-4 px-1.5 text-[9px] bg-green-500/20 text-green-400 border-0">
                  {item.badge}
                </Badge>
              )}
              {item.hasSubmenu && <ChevronRight className="w-3 h-3 opacity-40" />}
            </button>
          );
        })}
      </nav>

      {/* Mode Switcher */}
      <div className="px-3 py-3 border-t border-white/5">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">Workflow</p>
        <div className="space-y-0.5">
          {MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200',
                  isActive
                    ? 'text-white font-medium'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarModeActive"
                    className="absolute inset-0 rounded-lg bg-white/8"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={cn(
                  'w-6 h-6 rounded-md flex items-center justify-center',
                  isActive
                    ? `bg-gradient-to-br ${mode.gradient}`
                    : 'bg-white/5',
                )}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="relative z-10">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="px-2 pb-3 space-y-0.5">
        {NAV_BOTTOM.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.hasSubmenu && <ChevronRight className="w-3 h-3 opacity-40 ml-auto" />}
            </button>
          );
        })}
      </div>

      {/* Active project card */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-white/5 border border-white/8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white/90 truncate">EP04 – Genie Cast</span>
          <ChevronRight className="w-3 h-3 text-white/30" />
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: '0%' }}
              animate={{ width: '72%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] text-white/50 font-mono">72%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1.5">
            {['ori', 'arc'].map((a) => (
              <div key={a} className="w-5 h-5 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                <span className="text-[8px]">{a === 'ori' ? '✨' : '⚡'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="px-3 pb-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors">
          <HelpCircle className="w-3.5 h-3.5" />
          Help & Support
        </button>
      </div>
    </div>
  );
};

// ── Right Panel (Timeline + AI Developers) ──────────────────────────────────

const RightPanel: React.FC = () => {
  const { agent } = useGuideStore();

  const timelineSteps = [
    { label: 'Content Intent', status: 'done' as const },
    { label: 'Style & Characters', status: 'active' as const },
    { label: 'Storyboard', status: 'pending' as const },
    { label: 'Production', status: 'pending' as const },
    { label: 'Publish', status: 'pending' as const },
  ];

  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
      {/* Project Timeline */}
      <div className="rounded-2xl bg-background/80 backdrop-blur-xl border border-border/30 p-4">
        <h3 className="text-sm font-bold text-foreground mb-4">Project Timeline</h3>
        <div className="space-y-1">
          {timelineSteps.map((step, idx) => (
            <div key={step.label} className="flex items-start gap-3">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2',
                  step.status === 'done'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : step.status === 'active'
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-muted/20 border-border/40 text-muted-foreground',
                )}>
                  {step.status === 'done' ? '✓' : idx + 1}
                </div>
                {idx < timelineSteps.length - 1 && (
                  <div className={cn(
                    'w-[2px] h-6 my-1 rounded-full',
                    step.status === 'done' ? 'bg-green-500/40' : 'bg-border/20',
                  )} />
                )}
              </div>
              {/* Step label */}
              <div className="pt-0.5">
                <p className={cn(
                  'text-xs font-medium',
                  step.status === 'done'
                    ? 'text-foreground/70'
                    : step.status === 'active'
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                )}>
                  {step.label}
                </p>
                {step.status === 'done' && (
                  <span className="text-[10px] text-green-400 font-medium">Done</span>
                )}
                {step.status === 'active' && (
                  <span className="text-[10px] text-primary font-medium">In Progress</span>
                )}
              </div>
              {step.status === 'active' && (
                <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Developers Card */}
      <div className="rounded-2xl bg-background/80 backdrop-blur-xl border border-border/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">AI Developers</h3>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="space-y-3">
          {/* Arc */}
          <div className={cn(
            'flex items-center gap-3 p-2.5 rounded-xl transition-all',
            agent === 'arc' ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-muted/30',
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              {agent === 'arc' && (
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground">Atlas</p>
                <Badge className="h-3.5 px-1 text-[8px] bg-green-500/20 text-green-400 border-0">✓</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Systems Architect</p>
            </div>
          </div>

          {/* Ori */}
          <div className={cn(
            'flex items-center gap-3 p-2.5 rounded-xl transition-all',
            agent === 'ori' ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-muted/30',
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 flex items-center justify-center border border-cyan-500/20">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              {agent === 'ori' && (
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground">Nova</p>
                <Badge className="h-3.5 px-1 text-[8px] bg-green-500/20 text-green-400 border-0">✓</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">UI/UX & Frontend</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-3 border-t border-border/20">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {['Generate Script', 'Create Scene', 'Add Character'].map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="h-7 text-[10px] rounded-lg border-border/30 bg-background/50 hover:bg-muted/40 justify-start px-2"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Guide Dock */}
      <GuideDock />
    </div>
  );
};

// ── Mobile Mode Selector ────────────────────────────────────────────────────

const MobileModeSelector: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
}> = ({ activeMode, onModeChange }) => (
  <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/20">
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
              ? 'text-foreground bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground/80',
          )}
        >
          <Icon className={cn('w-4 h-4', isActive && 'text-primary')} />
          <span>{mode.label}</span>
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
      {/* Column 1: Left Sidebar */}
      <LeftSidebar activeMode={mode} onModeChange={handleModeChange} />

      {/* Column 2: Main Workspace */}
      <div className="flex-1 min-w-0 overflow-y-auto rounded-2xl bg-background border border-border/20 shadow-sm">
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

      {/* Column 3: Right Panel */}
      <RightPanel />
    </div>
  );
};

export default GenieCastHub;
