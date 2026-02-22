/**
 * GENIE CAST HUB — Full-Width Single-Panel Layout
 * 
 * No sidebar. Everything navigated via a clean top bar.
 * Workflow modes (Create/Produce/Publish) + nav in one horizontal strip.
 * AI Devs / Timeline accessible via a slide-out drawer.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import arcAvatar from '@/assets/characters/arc-avatar.png';
import oriAvatar from '@/assets/characters/ori-avatar.png';
import type { VideoStyleType } from './VideoStyleCards';
import type { ProductGallery } from '../MultiScreenshotGallery';
import { toast } from 'sonner';
import { GenieCastConsolidatedTabs, type ConsolidatedTab } from './GenieCastConsolidatedTabs';
import { GuideDock } from '@/components/shared/GuideDock';
import { useGuideStore, type CastMode } from '@/stores/guideStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Video, Share2, Film, 
  Users, Zap, X, PanelRight,
  FolderOpen, LayoutTemplate, Package, Palette, BarChart3, Settings, Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'genie_cast_hub_state';

interface GenieCastHubState {
  selectedVideoStyles: VideoStyleType[];
}

const defaultStyles: VideoStyleType[] = [
  'educational', 'smart_storytelling', 'hook_videos',
  'ugc_avatar_photorealistic', 'product_demo',
];

const MODE_TO_TAB: Record<CastMode, ConsolidatedTab> = {
  create: 'create', produce: 'produce', publish: 'publish',
};

const MODES: { id: CastMode; label: string; icon: React.ElementType }[] = [
  { id: 'create', label: 'Create', icon: Sparkles },
  { id: 'produce', label: 'Produce', icon: Video },
  { id: 'publish', label: 'Publish', icon: Share2 },
];

type NavView = 'workspace' | 'projects' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings';

const SECONDARY_NAV: { id: NavView; label: string; icon: React.ElementType }[] = [
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'assets', label: 'Assets', icon: Package },
  { id: 'brand-kit', label: 'Brand Kit', icon: Palette },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ── Top Navigation Bar ───────────────────────────────────────────────────────
const TopNav: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  onToggleDrawer: () => void;
}> = ({ activeMode, onModeChange, activeView, onViewChange, onToggleDrawer }) => (
  <div className="border-b border-border/15 bg-background/80 backdrop-blur-md">
    <div className="flex items-center h-12 px-4 gap-4">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Film className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold text-foreground hidden sm:inline">Genie Cast</span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border/20" />

      {/* Workflow Mode Switcher */}
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/30 border border-border/10">
        {MODES.map(m => {
          const active = activeMode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => { onModeChange(m.id); onViewChange('workspace'); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                active
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', active && 'text-primary')} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border/20" />

      {/* Secondary Nav — scrollable on smaller screens */}
      <div className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onViewChange('workspace')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap',
            activeView === 'workspace'
              ? 'text-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
          )}
        >
          Workspace
        </button>
        {SECONDARY_NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap',
              activeView === item.id
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </div>

      {/* AI Devs toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleDrawer}
        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <Users className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">AI Devs</span>
        <Badge className="h-4 px-1 text-[8px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0">2</Badge>
      </Button>
    </div>
  </div>
);

// ── Right Drawer (Timeline + AI Devs) ────────────────────────────────────────
const RightDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { agent } = useGuideStore();

  const timelineSteps = [
    { label: 'Content Intent', status: 'done' as const },
    { label: 'Style & Characters', status: 'active' as const },
    { label: 'Storyboard', status: 'pending' as const },
    { label: 'Production', status: 'pending' as const },
    { label: 'Publish', status: 'pending' as const },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[300px] bg-background border-l border-border/20 shadow-2xl z-50 flex flex-col overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/10">
              <h3 className="text-sm font-bold text-foreground">Project Info</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {/* Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Timeline</h4>
                <div className="space-y-1">
                  {timelineSteps.map((step, idx) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2',
                          step.status === 'done'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : step.status === 'active'
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-muted/20 border-border/30 text-muted-foreground',
                        )}>
                          {step.status === 'done' ? '✓' : idx + 1}
                        </div>
                        {idx < timelineSteps.length - 1 && (
                          <div className={cn('w-[2px] h-5 my-0.5 rounded-full',
                            step.status === 'done' ? 'bg-emerald-500/40' : 'bg-border/15',
                          )} />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className={cn('text-xs font-medium',
                          step.status === 'active' ? 'text-foreground' : 'text-muted-foreground',
                        )}>{step.label}</p>
                        {step.status === 'done' && <Badge className="h-4 px-1.5 text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 mt-0.5">Done</Badge>}
                        {step.status === 'active' && <span className="text-[10px] text-primary">In Progress</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Developers */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI Developers</h4>
                <div className="space-y-2">
                  {[
                    { id: 'arc', name: 'Arc', role: 'Systems Architect', avatar: arcAvatar, activeClass: 'bg-primary/10 border-primary/20' },
                    { id: 'ori', name: 'Ori', role: 'UI/UX & Creative', avatar: oriAvatar, activeClass: 'bg-accent/10 border-accent/20' },
                  ].map((dev) => (
                    <div key={dev.id} className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                      agent === dev.id
                        ? dev.activeClass
                        : 'bg-card/40 border-border/10 hover:bg-card/60',
                    )}>
                      <img src={dev.avatar} alt={dev.name} className="w-10 h-10 rounded-full object-cover border-2 border-border/20 shadow-sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{dev.name}</span>
                          <Badge className="h-3.5 px-1 text-[8px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0">Active</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{dev.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide Dock */}
              <GuideDock />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Placeholder views ───────────────────────────────────────────────────────
const NAV_PLACEHOLDERS: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  projects: { title: 'Projects', description: 'View and manage all your video projects.', icon: FolderOpen },
  templates: { title: 'Templates', description: 'Browse templates for rapid production.', icon: LayoutTemplate },
  assets: { title: 'Asset Library', description: 'Manage images, videos, audio, and brand assets.', icon: Image },
  'brand-kit': { title: 'Brand Kit', description: 'Configure brand colors, fonts, logos.', icon: Palette },
  analytics: { title: 'Analytics', description: 'Track performance and engagement.', icon: BarChart3 },
  settings: { title: 'Settings', description: 'Configure workspace and preferences.', icon: Settings },
};

const PlaceholderView: React.FC<{ title: string; description: string; icon: React.ElementType }> = ({ title, description, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
    <div className="p-8 text-center max-w-md rounded-2xl border border-border/15 bg-card/40">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/15">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

// ── Main Hub ─────────────────────────────────────────────────────────────────
export const GenieCastHub: React.FC = () => {
  const isMounted = useRef(true);
  const isMobile = useIsMobile();
  const { mode, setMode, dispatch } = useGuideStore();

  const [activeView, setActiveView] = useState<NavView>('workspace');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedVideoStyles, setSelectedVideoStyles] = useState<VideoStyleType[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GenieCastHubState;
        return parsed.selectedVideoStyles || defaultStyles;
      }
    } catch {}
    return defaultStyles;
  });

  const [screenshotGalleries, setScreenshotGalleries] = useState<ProductGallery[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const totalScreenshots = screenshotGalleries.reduce((t, g) => t + g.screenshots.length, 0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedVideoStyles }));
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
    } catch {
      toast.error('Failed to start generation');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedVideoStyles, dispatch]);

  const handleModeChange = useCallback((newMode: CastMode) => {
    setMode(newMode);
    dispatch({ type: 'SWITCH_MODE', mode: newMode });
    setActiveView('workspace');
  }, [setMode, dispatch]);

  const activeTab = MODE_TO_TAB[mode];

  const handleMainTabChange = useCallback((tab: ConsolidatedTab) => {
    const newMode = Object.entries(MODE_TO_TAB).find(([, t]) => t === tab)?.[0] as CastMode | undefined;
    if (newMode && newMode !== mode) handleModeChange(newMode);
  }, [mode, handleModeChange]);

  const placeholderInfo = activeView !== 'workspace' ? NAV_PLACEHOLDERS[activeView] : null;

  // ── Mobile: simple mode tabs + workspace ───────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-0.5 p-1.5 mx-3 mt-3 rounded-lg bg-muted/30 border border-border/10">
          {MODES.map(m => {
            const active = mode === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all',
                  active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', active && 'text-primary')} />
                {m.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 min-h-0 p-3">
          <GenieCastConsolidatedTabs
            selectedVideoStyles={selectedVideoStyles}
            onStylesChange={handleStylesChange}
            screenshotGalleries={screenshotGalleries}
            onGalleriesUpdated={handleGalleriesUpdated}
            totalScreenshots={totalScreenshots}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            wizardMode
            activeMainTabOverride={activeTab}
            onMainTabChange={handleMainTabChange}
            defaultTab="create"
          />
        </div>
      </div>
    );
  }

  // ── Floating AI Dev indicators (always visible) ────────────────────────────
  const FloatingAIDevs: React.FC = () => {
    const { agent } = useGuideStore();
    return (
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
        {[
          { id: 'arc', name: 'Arc', avatar: arcAvatar },
          { id: 'ori', name: 'Ori', avatar: oriAvatar },
        ].map(dev => (
          <button
            key={dev.id}
            onClick={() => setDrawerOpen(true)}
            className={cn(
              'group flex items-center gap-2 px-2 py-1.5 rounded-full border backdrop-blur-xl shadow-lg transition-all hover:scale-105',
              'bg-card/60 border-border/20',
              agent === dev.id && 'ring-2 ring-primary/30',
            )}
          >
            <img src={dev.avatar} alt={dev.name} className="w-8 h-8 rounded-full object-cover border border-border/20" />
            <span className="text-xs font-semibold text-foreground hidden group-hover:inline">{dev.name}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        ))}
      </div>
    );
  };

  // ── Desktop: Top nav + full-width glassmorphic workspace ───────────────────
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <TopNav
        activeMode={mode}
        onModeChange={handleModeChange}
        activeView={activeView}
        onViewChange={setActiveView}
        onToggleDrawer={() => setDrawerOpen(prev => !prev)}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {/* Glassmorphic workspace container */}
        <div className={cn(
          activeView === 'workspace' ? '' : 'hidden',
          'rounded-2xl border border-border/15 bg-card/40 backdrop-blur-xl shadow-xl',
          'bg-gradient-to-br from-card/60 via-background/40 to-card/50',
          'relative overflow-hidden',
        )}>
          {/* Inner glass shine */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]" />
          <div className="relative">
            <GenieCastConsolidatedTabs
              selectedVideoStyles={selectedVideoStyles}
              onStylesChange={handleStylesChange}
              screenshotGalleries={screenshotGalleries}
              onGalleriesUpdated={handleGalleriesUpdated}
              totalScreenshots={totalScreenshots}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              wizardMode
              activeMainTabOverride={activeTab}
              onMainTabChange={handleMainTabChange}
              defaultTab="create"
            />
          </div>
        </div>
        {placeholderInfo && <PlaceholderView {...placeholderInfo} />}
      </div>

      <FloatingAIDevs />
      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default GenieCastHub;
