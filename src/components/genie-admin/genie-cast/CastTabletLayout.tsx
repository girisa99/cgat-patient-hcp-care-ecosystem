/**
 * CastTabletLayout — Unique split-view layout for tablet devices (768-1023px)
 *
 * Features:
 * - Persistent sidebar navigation (collapsible)
 * - Main content area with 2-column grids
 * - Pixar characters (Ori & Arc) in sidebar glassmorphism
 * - Tablet-optimized hero and messaging
 */

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Sparkles, Video, Share2, Film,
  FolderOpen, LayoutTemplate, Package, Palette, BarChart3, Settings,
  ChevronRight, ChevronLeft, Globe, Zap,
  PanelLeft, Users, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CastMode } from '@/stores/guideStore';
import castHeroTablet from '@/assets/cast-hero-tablet.jpg';
import oriAvatar from '@/assets/characters/ori-avatar.png';
import arcAvatar from '@/assets/characters/arc-avatar.png';

type TabletView = 'dashboard' | 'create' | 'produce' | 'publish' | 'projects' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings';

interface CastTabletLayoutProps {
  mode: CastMode;
  onModeChange: (mode: CastMode) => void;
  showDashboard: boolean;
  onShowDashboard: (show: boolean) => void;
  onStartCreate: () => void;
  regionSelector: React.ReactNode;
  pipelineBadge: React.ReactNode;
  children: React.ReactNode;
  dashboardContent: React.ReactNode;
}

// ── Sidebar Nav Items ────────────────────────────────────────────────────────
const PRIMARY_NAV = [
  { id: 'dashboard' as TabletView, label: 'Dashboard', icon: Home },
  { id: 'create' as TabletView, label: 'Create', icon: Sparkles, mode: 'create' as CastMode },
  { id: 'produce' as TabletView, label: 'Produce', icon: Video, mode: 'produce' as CastMode },
  { id: 'publish' as TabletView, label: 'Publish', icon: Share2, mode: 'publish' as CastMode },
];

const SECONDARY_NAV = [
  { id: 'projects' as TabletView, label: 'Projects', icon: FolderOpen },
  { id: 'templates' as TabletView, label: 'Templates', icon: LayoutTemplate },
  { id: 'assets' as TabletView, label: 'Assets', icon: Package },
  { id: 'analytics' as TabletView, label: 'Analytics', icon: BarChart3 },
  { id: 'settings' as TabletView, label: 'Settings', icon: Settings },
];

// ── Tablet messaging ─────────────────────────────────────────────────────────
const TABLET_HERO = {
  title: 'Your Creative Command Center',
  subtitle: 'Manage, produce, and distribute AI-powered content across every region — optimized for your workspace.',
};

// ── Main Component ───────────────────────────────────────────────────────────
export const CastTabletLayout: React.FC<CastTabletLayoutProps> = ({
  mode,
  onModeChange,
  showDashboard,
  onShowDashboard,
  onStartCreate,
  regionSelector,
  pipelineBadge,
  children,
  dashboardContent,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<TabletView>('dashboard');

  const handleNavClick = (item: typeof PRIMARY_NAV[0] | typeof SECONDARY_NAV[0]) => {
    setActiveView(item.id);
    if (item.id === 'dashboard') {
      onShowDashboard(true);
    } else if ('mode' in item && item.mode) {
      onShowDashboard(false);
      onModeChange(item.mode);
    }
  };

  const sidebarWidth = collapsed ? 'w-16' : 'w-56';

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)]">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className={cn(
        'shrink-0 transition-all duration-300 border-r border-border/15 bg-background/60 backdrop-blur-xl flex flex-col',
        sidebarWidth,
      )}>
        {/* Brand + collapse toggle */}
        <div className="flex items-center gap-2 px-3 h-14 border-b border-border/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-sm font-bold text-foreground">Genie Cast</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <PanelLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="px-2 pt-3 space-y-0.5">
          {PRIMARY_NAV.map(item => {
            const active = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
                  collapsed && 'justify-center px-2',
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn('w-4.5 h-4.5 shrink-0', active && 'text-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-3 my-3 border-t border-border/10" />

        {/* Secondary Navigation */}
        <div className="px-2 space-y-0.5 flex-1">
          {SECONDARY_NAV.map(item => {
            const active = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
                  collapsed && 'justify-center px-2',
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Ori & Arc — bottom of sidebar */}
        <div className={cn(
          'mx-2 mb-3 rounded-xl glass-card border border-border/10 overflow-hidden transition-all',
          collapsed && 'mx-1',
        )}>
          <div className={cn('flex items-center gap-2 p-2', collapsed && 'flex-col p-1.5')}>
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border border-cyan-400/30 overflow-hidden bg-card/60 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                <img src={oriAvatar} alt="Ori" className="w-full h-full object-cover" />
              </div>
              <div className="w-7 h-7 rounded-full border border-indigo-400/30 overflow-hidden bg-card/60 shadow-[0_0_8px_rgba(99,102,241,0.15)]">
                <img src={arcAvatar} alt="Arc" className="w-full h-full object-cover" />
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-foreground">AI Guides</p>
                <p className="text-[9px] text-muted-foreground">Ready to help</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with region + pipeline */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-border/10 bg-background/60 backdrop-blur-md">
          {regionSelector}
          <div className="flex-1 overflow-hidden">
            {pipelineBadge}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' ? (
              <motion.div
                key="tablet-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Tablet hero banner */}
                <div className="relative overflow-hidden m-4 rounded-2xl">
                  <div className="absolute inset-0 z-0">
                    <img src={castHeroTablet} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
                  </div>
                  <div className="relative z-10 p-6 min-h-[140px] flex flex-col justify-center">
                    <h1 className="text-xl font-bold text-foreground">{TABLET_HERO.title}</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">{TABLET_HERO.subtitle}</p>
                    <Button onClick={onStartCreate} size="sm" className="mt-3 gap-2 w-fit">
                      <Sparkles className="w-3.5 h-3.5" /> Create Content
                    </Button>
                  </div>
                </div>

                {/* Dashboard content */}
                {dashboardContent}
              </motion.div>
            ) : (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                {/* Back to dashboard */}
                <button
                  onClick={() => { setActiveView('dashboard'); onShowDashboard(true); }}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors mb-3 group"
                >
                  <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Dashboard
                </button>

                {/* Workspace children */}
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CastTabletLayout;
