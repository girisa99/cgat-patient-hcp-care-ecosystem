/**
 * GENIE CAST HUB — Clean 2-Panel Layout
 * 
 * Fixed: Removed 3-column nesting / iframe-in-iframe feel
 * Now: Slim sidebar + full workspace. Timeline/AI devs in slide-out drawer.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Sparkles, Video, Share2, Film, Plus,
  Home, FolderOpen, Users, LayoutTemplate, Package,
  Palette, BarChart3, Settings, ChevronRight,
  Zap, Clock, PanelRightOpen, PanelRightClose, X,
  Megaphone, Brain, Wand2, Play, FileText, Image
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

const NAV_ITEMS: { id: NavView; label: string; icon: React.ElementType }[] = [
  { id: 'workspace', label: 'Workspace', icon: Home },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'assets', label: 'Assets', icon: Package },
  { id: 'brand-kit', label: 'Brand Kit', icon: Palette },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// ── Slim Left Sidebar ────────────────────────────────────────────────────────
const LeftSidebar: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  onTogglePanel: () => void;
  panelOpen: boolean;
}> = ({ activeMode, onModeChange, activeView, onViewChange, onTogglePanel, panelOpen }) => (
  <div className="w-[200px] flex-shrink-0 flex flex-col bg-[hsl(230_25%_8%)] rounded-xl overflow-hidden">
    {/* Brand */}
    <div className="flex items-center gap-2 px-4 pt-4 pb-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <Film className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-sm font-bold text-white">Genie Cast</span>
    </div>

    {/* Workflow Modes */}
    <div className="px-3 py-2">
      <p className="text-[9px] font-semibold text-white/30 uppercase tracking-wider mb-1.5 px-1">Workflow</p>
      <div className="space-y-0.5">
        {MODES.map(m => {
          const active = activeMode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => { onModeChange(m.id); onViewChange('workspace'); }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                active
                  ? 'bg-primary/20 text-primary'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>
    </div>

    <div className="h-px bg-white/[0.06] mx-3" />

    {/* Nav */}
    <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const isActive = activeView === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all',
              isActive
                ? 'bg-white/[0.08] text-white font-medium'
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </button>
        );
      })}
    </nav>

    {/* AI Devs + Panel Toggle */}
    <div className="px-3 pb-3 space-y-2">
      <button
        onClick={onTogglePanel}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
      >
        <Users className="w-4 h-4" />
        <span className="flex-1 text-left">AI Devs</span>
        <Badge className="h-4 px-1 text-[8px] bg-emerald-500/20 text-emerald-400 border-0">2</Badge>
      </button>

      <button
        onClick={() => onViewChange('settings')}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
      >
        <Settings className="w-4 h-4" />
        Settings
      </button>
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          {/* Drawer */}
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
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
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
                        {step.status === 'done' && <Badge className="h-4 px-1.5 text-[9px] bg-emerald-500/15 text-emerald-500 border-0 mt-0.5">Done</Badge>}
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
                    { id: 'arc', name: 'Arc', role: 'Systems Architect', icon: Zap, color: 'indigo' },
                    { id: 'ori', name: 'Ori', role: 'UI/UX & Creative', icon: Sparkles, color: 'cyan' },
                  ].map((dev) => (
                    <div key={dev.id} className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                      agent === dev.id
                        ? `bg-${dev.color}-500/10 border-${dev.color}-500/20`
                        : 'bg-card/40 border-border/10 hover:bg-card/60',
                    )}>
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center border',
                        `bg-${dev.color}-500/20 border-${dev.color}-500/20`,
                      )}>
                        <dev.icon className={cn('w-4 h-4', `text-${dev.color}-400`)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{dev.name}</span>
                          <Badge className="h-3.5 px-1 text-[8px] bg-emerald-500/20 text-emerald-400 border-0">Active</Badge>
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
    <div className="p-8 text-center max-w-md rounded-2xl border border-border/15 bg-card/40 backdrop-blur-xl">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/15">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

// ── Mobile Mode Selector ────────────────────────────────────────────────────
const MobileModeSelector: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
}> = ({ activeMode, onModeChange }) => (
  <div className="flex items-center gap-1 p-1 rounded-xl bg-card/40 border border-border/15">
    {MODES.map((m) => {
      const isActive = activeMode === m.id;
      const Icon = m.icon;
      return (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all',
            isActive ? 'text-foreground bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground/80',
          )}
        >
          <Icon className={cn('w-4 h-4', isActive && 'text-primary')} />
          {m.label}
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
  const { profile } = useMasterAuth();

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

  // Render workspace or placeholder
  const renderMainContent = () => {
    if (activeView === 'workspace') {
      return (
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
      );
    }
    const placeholder = NAV_PLACEHOLDERS[activeView];
    if (placeholder) return <PlaceholderView {...placeholder} />;
    return null;
  };

  // ── Mobile ─────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] gap-3 p-3">
        <MobileModeSelector activeMode={mode} onModeChange={handleModeChange} />
        <div className="flex-1 min-h-0">
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
        </div>
      </div>
    );
  }

  // ── Desktop: Sidebar + Full Workspace ──────────────────────────────────────
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] gap-2 p-2">
      <LeftSidebar
        activeMode={mode}
        onModeChange={handleModeChange}
        activeView={activeView}
        onViewChange={setActiveView}
        onTogglePanel={() => setDrawerOpen(prev => !prev)}
        panelOpen={drawerOpen}
      />

      {/* Main workspace — takes full remaining width */}
      <div className="flex-1 min-w-0 overflow-y-auto rounded-xl border border-border/10 bg-background/60 backdrop-blur-sm">
        {renderMainContent()}
      </div>

      {/* Right drawer — slides over, not inline */}
      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default GenieCastHub;
