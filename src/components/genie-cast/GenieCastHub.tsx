/**
 * GENIE CAST HUB — Full-Width Single-Panel Layout with Region-Aware Provider Routing
 *
 * No sidebar. Everything navigated via a clean top bar.
 * Workflow modes (Create/Produce/Publish) + nav in one horizontal strip.
 * AI Devs / Timeline accessible via a slide-out drawer.
 *
 * Provider routing: CastRegionSelector drives useProviderRouting → ProviderPipelineBadge.
 * Language selection persisted to localStorage, drives ALL AI provider routing.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import arcAvatar from '@/assets/characters/arc-avatar.png';
import oriAvatar from '@/assets/characters/ori-avatar.png';
import type { VideoStyleType } from './VideoStyleCards';
import type { ProductGallery } from '@/components/genie-hub/MultiScreenshotGallery';
import { toast } from 'sonner';
import { GenieCastConsolidatedTabs, type ConsolidatedTab } from './GenieCastConsolidatedTabs';
import { CastRegionSelector } from './CastRegionSelector';
import { useProviderRouting } from '@/hooks/useProviderRouting';
import { ProviderPipelineBadge } from '@/components/ui/ProviderPipelineBadge';
import { GuideDock } from '@/components/shared/GuideDock';
import { useGuideStore, type CastMode } from '@/stores/guideStore';
import { useIsMobile, useDeviceType } from '@/hooks/use-mobile';
import { CastMobileLayout } from './CastMobileLayout';
import { CastTabletLayout } from './CastTabletLayout';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCastProduction } from '@/hooks/useCastProduction';
import { useGenieCastSession } from '@/hooks/useGenieCastSession';
import { buildRequestFromCastSession, assembleEnrichmentContext } from '@/services/production/castProductionBridge';
import { useTierGatedAction } from '@/hooks/useTierGatedAction';
import { quickEnhance, enhancePrompt, type PromptContext } from '@/services/promptEnhancementEngine';
import { useLSCastIntegration } from '@/hooks/useLSCastIntegration';
import { useCastSceneEnrichment } from '@/hooks/useCastSceneEnrichment';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
import type { SceneEnrichmentInput } from '@/services/production/sceneEnrichmentEngine';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Video, Share2, Film,
  Users, Zap, X, PanelRight, HelpCircle,
  FolderOpen, LayoutTemplate, Package, Palette, BarChart3, Settings, Image,
  Loader2, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Lazy-loaded navigation view components
const LazyContentLibraryGrid = lazy(() => import('./ContentLibraryGrid'));
const LazyCastProjectsList = lazy(() => import('./CastProjectsList'));
const LazyBlueprintTemplatesGrid = lazy(() =>
  import('./BlueprintTemplatesGrid').then(m => ({ default: m.BlueprintTemplatesGrid as React.ComponentType<Record<string, never>> }))
);
const LazyAnalyticsDashboard = lazy(() =>
  import('./AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard }))
);
const LazyWorkspaceManagement = lazy(() => import('@/components/genie-hub/WorkspaceManagement'));
const LazyIntegrationsSettings = lazy(() => import('@/components/settings/IntegrationsSettingsPage'));
const LazyCastDashboard = lazy(() => import('./CastDashboardOverview'));

const STORAGE_KEY = 'genie_cast_hub_state';

interface GenieCastHubState {
  selectedVideoStyles: VideoStyleType[];
  languageCode: string;
}

const defaultStyles: VideoStyleType[] = [
  'educational', 'smart_storytelling', 'hook_videos',
  'ugc_avatar_photorealistic', 'product_demo',
];

const MODE_TO_TAB: Record<CastMode, ConsolidatedTab> = {
  create: 'create', produce: 'produce', publish: 'publish',
};

const MODES: { id: CastMode; label: string; icon: React.ElementType; tooltip: string }[] = [
  { id: 'create', label: 'Create', icon: Sparkles, tooltip: 'Write scripts, configure scenes, choose styles, select regions & languages' },
  { id: 'produce', label: 'Produce', icon: Video, tooltip: 'AI generation, GPU rendering, TTS voiceover, captions, assembly' },
  { id: 'publish', label: 'Publish', icon: Share2, tooltip: 'Distribute to platforms, schedule posts, A/B test, track analytics' },
];

type NavView = 'workspace' | 'projects' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings';

const SECONDARY_NAV: { id: NavView; label: string; icon: React.ElementType; tooltip: string }[] = [
  { id: 'projects', label: 'Projects', icon: FolderOpen, tooltip: 'Manage your video projects — create, edit, and track production status' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, tooltip: 'Browse and use reusable content blueprints organized by category' },
  { id: 'assets', label: 'Assets', icon: Package, tooltip: 'Your media library — images, videos, audio, and brand assets' },
  { id: 'brand-kit', label: 'Brand Kit', icon: Palette, tooltip: 'Configure brand colors, fonts, logos, and visual identity' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, tooltip: 'Performance metrics, engagement data, and content insights' },
  { id: 'settings', label: 'Settings', icon: Settings, tooltip: 'Integrations, preferences, API keys, and account settings' },
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
      <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/30 border border-border/10">
        {MODES.map(m => {
          const active = activeMode === m.id;
          const Icon = m.icon;
          return (
            <Tooltip key={m.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => { onModeChange(m.id); }}
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
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[220px] text-xs">{m.tooltip}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      </TooltipProvider>

      {/* Divider */}
      <div className="w-px h-5 bg-border/20" />

      {/* Secondary Nav — scrollable on smaller screens */}
      <TooltipProvider delayDuration={300}>
      <div className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Your Cast dashboard — overview, stats, and quick actions</TooltipContent>
        </Tooltip>
        {SECONDARY_NAV.map(item => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <button
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
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px] text-xs">{item.tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      </TooltipProvider>

      {/* AI Devs toggle */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">View AI developer agents, production timeline, and project info</TooltipContent>
        </Tooltip>
      </TooltipProvider>
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

// ── Loading fallback for lazy views ──────────────────────────────────────────
const NavViewFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">Loading...</p>
    </div>
  </div>
);

// ── Back Button (scoped to Cast — never navigates outside) ──────────────────
const CastBackButton: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = 'Back to Dashboard' }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors mb-3 group"
  >
    <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
    {label}
  </button>
);

// ── Navigation View Renderer ────────────────────────────────────────────────
const NavViewContent: React.FC<{ view: NavView; onBack: () => void }> = ({ view, onBack }) => {
  switch (view) {
    case 'projects':
      return (
        <div className="p-4 space-y-4">
          <CastBackButton onClick={onBack} />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Projects</h2>
              <p className="text-xs text-muted-foreground">Your video content library</p>
            </div>
          </div>
          <Suspense fallback={<NavViewFallback />}>
            <LazyCastProjectsList />
          </Suspense>
        </div>
      );
    case 'templates':
      return (
        <div className="p-4 space-y-4">
          <CastBackButton onClick={onBack} />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Templates</h2>
              <p className="text-xs text-muted-foreground">Browse and manage video blueprints</p>
            </div>
          </div>
          <Suspense fallback={<NavViewFallback />}>
            <LazyBlueprintTemplatesGrid />
          </Suspense>
        </div>
      );
    case 'assets':
      return (
        <div className="p-4 space-y-4">
          <CastBackButton onClick={onBack} />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Asset Library</h2>
              <p className="text-xs text-muted-foreground">Images, videos, audio, and brand assets</p>
            </div>
          </div>
          <Suspense fallback={<NavViewFallback />}>
            <LazyContentLibraryGrid />
          </Suspense>
        </div>
      );
    case 'brand-kit':
      return (
        <div className="p-4 space-y-4">
          <CastBackButton onClick={onBack} />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Palette className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Brand Kit</h2>
              <p className="text-xs text-muted-foreground">Colors, fonts, logos, and voice guidelines</p>
            </div>
          </div>
          <Suspense fallback={<NavViewFallback />}>
            <LazyWorkspaceManagement />
          </Suspense>
        </div>
      );
    case 'analytics':
      return (
        <div className="p-4 space-y-4">
          <CastBackButton onClick={onBack} />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Analytics</h2>
              <p className="text-xs text-muted-foreground">Performance metrics and engagement</p>
            </div>
          </div>
          <Suspense fallback={<NavViewFallback />}>
            <LazyAnalyticsDashboard />
          </Suspense>
        </div>
      );
    case 'settings':
      return (
        <div className="p-4 space-y-4">
          <CastBackButton onClick={onBack} />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Settings</h2>
              <p className="text-xs text-muted-foreground">Integrations, workspace, and preferences</p>
            </div>
          </div>
          <Suspense fallback={<NavViewFallback />}>
            <LazyIntegrationsSettings />
          </Suspense>
        </div>
      );
    default:
      return null;
  }
};

// ── Main Hub ─────────────────────────────────────────────────────────────────
export const GenieCastHub: React.FC = () => {
  const isMounted = useRef(true);
  const isMobile = useIsMobile();
  const deviceType = useDeviceType();
  const { mode, setMode, dispatch } = useGuideStore();

  const [activeView, setActiveView] = useState<NavView>('workspace');
  const [showDashboard, setShowDashboard] = useState(true); // Show dashboard overview by default
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

  // Language / region — persisted, drives provider routing
  const [languageCode, setLanguageCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).languageCode || 'en';
    } catch { /* ignore */ }
    return 'en';
  });

  // Provider routing — single source of truth for ALL AI providers
  const routing = useProviderRouting(languageCode);

  const [screenshotGalleries, setScreenshotGalleries] = useState<ProductGallery[]>([]);
  const totalScreenshots = screenshotGalleries.reduce((t, g) => t + g.screenshots.length, 0);

  // Production pipeline hook (Phase 6A — replaces fake 2s timeout)
  const production = useCastProduction();
  const isGenerating = production.isProducing;

  // Persistent session state — single source of truth for all CREATE selections
  const castSession = useGenieCastSession();

  // Credit + tier gate for generation
  const tierGate = useTierGatedAction('avatar', 'free', 'video_generation');

  // Label Studio training data capture for Cast pipeline
  const lsCast = useLSCastIntegration();

  // Scene enrichment — builds full production pipeline configs (pipelines, music, voices, avatars)
  const sceneEnrichment = useCastSceneEnrichment();

  // Project persistence — for seeding enrichment output to DB
  const projectPersistence = useCastProjectPersistence();

  // Persist state changes (styles + language)
  useEffect(() => {
    const state: GenieCastHubState = { selectedVideoStyles, languageCode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [selectedVideoStyles, languageCode]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Refresh enrichment when language/region changes
  useEffect(() => {
    production.refreshEnrichment(languageCode);
  }, [languageCode, production.refreshEnrichment]);

  // EP04 project auto-creation is handled by EP04Production.tsx — removed from here to prevent duplicates

  const handleStylesChange = useCallback((styles: VideoStyleType[]) => {
    if (!isMounted.current) return;
    setSelectedVideoStyles(styles);
  }, []);

  const handleGalleriesUpdated = useCallback((galleries: ProductGallery[]) => {
    if (!isMounted.current) return;
    setScreenshotGalleries(galleries);
  }, []);

  const handleGenerate = useCallback(async (formatName?: string) => {
    const session = castSession.session;

    // Validate minimum CREATE requirements
    const validationErrors: string[] = [];
    if (!session.selectedCategoryId && !session.selectedFormatId) {
      validationErrors.push('Select a content category and format');
    }
    if (!session.selectedFormatId) {
      validationErrors.push('Select a content format');
    }
    if (session.selectedVisualStyleIds.length === 0 && selectedVideoStyles.length === 0) {
      validationErrors.push('Select at least one visual style');
    }
    if (session.outputLanguages.length === 0) {
      validationErrors.push('Select at least one output language');
    }
    if (validationErrors.length > 0) {
      validationErrors.forEach(err => toast.error(err));
      return;
    }

    // Build enrichment context from brand intelligence
    const enrichment = assembleEnrichmentContext(null, session.selectedRegion || 'en');

    // Build typed production request from persistent session (no more raw localStorage)
    const request = buildRequestFromCastSession(session, enrichment);

    // Override videoStyles from prop if session has none (backward compat)
    if (request.videoStyles.length === 0 || (request.videoStyles.length === 1 && request.videoStyles[0] === 'professional')) {
      request.videoStyles = selectedVideoStyles.length > 0 ? selectedVideoStyles : ['professional'];
    }

    // ── Auto-enhance prompt before production ──────────────────────────────
    // Uses region/subregion routing + format/style context to improve the script
    if (request.scriptContent && request.scriptContent.length > 10) {
      const promptCtx: PromptContext = {
        rawPrompt: request.scriptContent,
        region: session.selectedRegion || 'NAM_US',
        language: request.inputLanguage || 'en',
        format: formatName || request.selectedFormats?.[0] || 'video',
        visualStyle: request.videoStyles?.[0],
        intent: request.intent,
        mode: 'auto',
      };

      // Quick local enhancement (instant, no AI call)
      const quick = quickEnhance(promptCtx);
      if (quick.qualityScore > 60) {
        toast.info(`Prompt enhanced (quality: ${quick.qualityScore}/100) — ${quick.improvements[0] || 'improved'}`, { duration: 3000 });
        request.scriptContent = quick.enhanced;
      }

      // Full AI enhancement runs in background — updates production if it completes in time
      enhancePrompt(promptCtx).then(result => {
        if (result.primary.qualityScore > quick.qualityScore) {
          toast.success(`AI prompt enhancement applied (${result.primary.qualityScore}/100)`, { duration: 3000 });
        }
      }).catch(() => { /* non-blocking — quick enhance already applied */ });
    }

    // ── Scene Enrichment — build full production pipeline configs ──────────
    // Calls enrichScenes() to auto-generate: scenePipelines, musicScore,
    // transitions, voiceConfig, avatarConfig — the SAME shapes EP04 uses.
    // Then persists to DB so the PRODUCE pipeline reads from DB identically.
    try {
      const enrichmentInput: SceneEnrichmentInput = {
        title: request.scriptTitle || 'Untitled',
        content: { type: 'raw_text', text: request.scriptContent || '' },
        styleFamily: (request.videoStyles?.[0] as any) || 'pixar_3d',
        regionCode: session.selectedRegion || 'NAM_US',
        language: request.inputLanguage || 'en',
        targetDuration: session.targetDuration,
        quality: (request.quality as any) || 'production',
        storybookMode: true,
        imaginationPreset: session.imaginationPreset || undefined,
        outputFormat: 'long_form_video',
        targetPlatforms: [session.primaryPlatform],
        enrichmentContext: enrichment,
      };

      const enrichmentOutput = sceneEnrichment.enrich(enrichmentInput);
      castSession.setSceneEnrichmentOutput(enrichmentOutput);

      // Persist enrichment to DB — seeds scene configs from enrichment output
      if (session.projectId) {
        await projectPersistence.seedEnrichmentToDB(session.projectId, enrichmentOutput);
        toast.success(`Enrichment seeded: ${Object.keys(enrichmentOutput.scenePipelines).length} scenes configured`);
      }
    } catch (enrichErr) {
      console.warn('[GenieCastHub] Scene enrichment failed (non-blocking):', enrichErr);
      // Non-blocking — production continues even without enrichment
    }

    // Use format-specific routing when triggered from FormatStudioRouter
    const activeFormats = formatName
      ? [formatName]
      : request.selectedFormats;

    // Capture generation start for Label Studio training
    lsCast.captureGenerationStart({
      formatName: formatName || activeFormats?.[0],
      provider: routing.provider?.id || 'openai',
      region: session.selectedRegion || undefined,
      videoStyles: request.videoStyles,
      scriptLength: request.scriptContent?.length,
      creditCost: tierGate.creditCost,
    });

    // Show credit cost before proceeding
    if (tierGate.creditCost > 0) {
      toast.info(`Starting ${formatName || 'multi-format'} production (${tierGate.creditCost} credits, enrichment: ${request.enrichmentScore}/100)...`);
    } else {
      toast.info(`Starting ${formatName || 'multi-format'} production (enrichment: ${request.enrichmentScore}/100)...`);
    }

    // Credit + tier gate wraps the actual production call
    const success = await tierGate.execute(async () => {
      await production.startProduction({
        scriptContent: request.scriptContent,
        scriptTitle: request.scriptTitle,
        inputMode: request.scriptMode,
        intent: request.intent,
        selectedFormats: activeFormats as any,
        inputLanguage: request.inputLanguage,
        outputLanguages: request.outputLanguages,
        videoStyles: request.videoStyles,
        scenario: request.scenario,
        sceneStyle: request.sceneStyle,
        quality: request.quality as any,
        avatarGender: request.avatarGender,
        includeMusic: request.includeMusic,
        includeCaptions: request.includeCaptions,
      });
    });

    // Capture generation result for LS training
    lsCast.captureGenerationComplete({
      formatName: formatName || activeFormats?.[0],
      provider: routing.provider?.id || 'openai',
      duration: 0, // placeholder — real timing tracked by production hook
      success: !!success,
    });

    if (success) {
      dispatch({ type: 'STEP_COMPLETED', stepId: 'generate' });
    }
  }, [castSession.session, selectedVideoStyles, dispatch, production, tierGate, lsCast, routing.provider, sceneEnrichment, projectPersistence, castSession]);

  const handleModeChange = useCallback((newMode: CastMode) => {
    lsCast.captureModeChange(mode, newMode);
    setMode(newMode);
    dispatch({ type: 'SWITCH_MODE', mode: newMode });
    setActiveView('workspace');
    setShowDashboard(false); // Hide dashboard — go straight to Create/Produce/Publish workspace
  }, [setMode, dispatch, mode, lsCast]);

  const activeTab = MODE_TO_TAB[mode];

  const handleMainTabChange = useCallback((tab: ConsolidatedTab) => {
    const newMode = Object.entries(MODE_TO_TAB).find(([, t]) => t === tab)?.[0] as CastMode | undefined;
    if (newMode && newMode !== mode) handleModeChange(newMode);
  }, [mode, handleModeChange]);

  // Handle nav view changes — show dashboard when going back to workspace
  const handleViewChange = useCallback((view: NavView) => {
    setActiveView(view);
    if (view === 'workspace') {
      setShowDashboard(true);
    }
  }, []);

  // Derive zone for CSS accent coloring (must be before early returns to respect Rules of Hooks)
  const castZone = useMemo(() => {
    const lc = languageCode.split('-')[0]?.toLowerCase() || 'en';
    if (['ar', 'he', 'fa'].includes(lc)) return 'mena';
    if (['zh', 'ja', 'ko'].includes(lc)) return 'cjk';
    if (['hi', 'te', 'ta', 'bn', 'ur', 'mr', 'gu', 'pa', 'ml', 'kn'].includes(lc)) return 'india';
    if (['id', 'ms', 'th', 'vi', 'tl'].includes(lc)) return 'sea';
    if (['sw', 'yo', 'am', 'ha'].includes(lc)) return 'africa';
    if (['fr', 'de', 'it', 'nl', 'pl', 'ru', 'sv', 'da', 'no', 'fi', 'el', 'ro', 'cs'].includes(lc)) return 'europe';
    if (['es', 'pt'].includes(lc)) return 'latam';
    if (['en'].includes(lc)) return 'nam';
    return 'nam';
  }, [languageCode]);

  const isNavView = activeView !== 'workspace';

  // Shared workspace content for mobile/tablet
  const workspaceContent = (
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
  );

  const dashboardContent = (
    <Suspense fallback={<NavViewFallback />}>
      <LazyCastDashboard
        onNavigate={handleViewChange}
        onStartCreate={() => { setShowDashboard(false); handleModeChange('create'); }}
      />
    </Suspense>
  );

  // ── Mobile: App-like bottom nav + progressive disclosure ──────────────────
  if (deviceType === 'mobile') {
    return (
      <div dir={routing.isRTL ? 'rtl' : 'ltr'}>
        <CastMobileLayout
          mode={mode}
          onModeChange={handleModeChange}
          showDashboard={showDashboard}
          onShowDashboard={setShowDashboard}
          videoStats={production.state}
          totalProjects={0}
          totalTemplates={0}
          onStartCreate={() => { setShowDashboard(false); handleModeChange('create'); }}
          dashboardContent={dashboardContent}
        >
          {workspaceContent}
        </CastMobileLayout>
      </div>
    );
  }

  // Tablet uses the same desktop layout (no sidebar)

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

  // castZone moved above early returns (Rules of Hooks)

  // ── Desktop: Top nav + full-width glassmorphic workspace ───────────────────
  return (
    <div
      className="flex flex-col h-full min-h-[calc(100vh-4rem)]"
      dir={routing.isRTL ? 'rtl' : 'ltr'}
      data-cast-zone={castZone}
    >
      <TopNav
        activeMode={mode}
        onModeChange={handleModeChange}
        activeView={activeView}
        onViewChange={handleViewChange}
        onToggleDrawer={() => setDrawerOpen(prev => !prev)}
      />

      {/* Region selector + AI Pipeline Badge — below top nav */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 pt-3">
        <CastRegionSelector
          languageCode={languageCode}
          onLanguageChange={setLanguageCode}
        />
        <ProviderPipelineBadge routing={routing} mode="compact" className="flex-1" />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Dashboard overview — shown when on workspace + dashboard mode */}
        {!isNavView && showDashboard && (
          <div className="cast-workspace-glass">
            {/* Ambient gradient mesh — the WOW depth layer */}
            <div className="cast-ambient-mesh">
              <div className="cast-ambient-blob" />
            </div>
            {/* Glass shine overlay */}
            <div className="cast-glass-shine" />
            <div className="relative z-[2]">
              <Suspense fallback={<NavViewFallback />}>
                <LazyCastDashboard
                  onNavigate={handleViewChange}
                  onStartCreate={() => { setShowDashboard(false); handleModeChange('create'); }}
                />
              </Suspense>
            </div>
          </div>
        )}
        {/* Glassmorphic workspace container — Create/Produce/Publish tabs */}
        {!isNavView && !showDashboard && (
          <div className="cast-workspace-glass">
            {/* Ambient gradient mesh */}
            <div className="cast-ambient-mesh">
              <div className="cast-ambient-blob" />
            </div>
            {/* Glass shine overlay */}
            <div className="cast-glass-shine" />
            <div className="relative z-[2]">
              <CastBackButton onClick={() => { setShowDashboard(true); }} label="Back to Dashboard" />
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
        )}
        {/* Navigation views — glassmorphic container for non-workspace views */}
        {isNavView && (
          <div className="cast-workspace-glass min-h-[500px]">
            <div className="cast-ambient-mesh">
              <div className="cast-ambient-blob" />
            </div>
            <div className="cast-glass-shine" />
            <div className="relative z-[2]">
              <NavViewContent view={activeView} onBack={() => handleViewChange('workspace')} />
            </div>
          </div>
        )}
      </div>

      <FloatingAIDevs />
      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default GenieCastHub;
