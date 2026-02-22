/**
 * GENIE CAST HUB — Modern SaaS Dashboard (Full Redesign v2)
 * 
 * Reference: Dark sidebar + clean workspace + right panel
 * Characters: Ori (Creative) + Arc (Systems) — NO Atlas/Nova
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { VideoStyleType } from './VideoStyleCards';
import type { ProductGallery } from '../MultiScreenshotGallery';
import { toast } from 'sonner';
import { GenieCastConsolidatedTabs, type ConsolidatedTab } from './GenieCastConsolidatedTabs';
import { GuideDock } from '@/components/shared/GuideDock';
import { useGuideStore, GUIDE_CHARACTERS, type CastMode } from '@/stores/guideStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Video, Share2, Film, Plus, Search, Bell,
  Home, FolderOpen, Users, LayoutTemplate, Package,
  Palette, BarChart3, Settings, HelpCircle, ChevronRight,
  Zap, Grid3X3, List, Globe, CreditCard, Info,
  Layers, Clock, ArrowUpRight, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Storage keys
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

const MODES: { id: CastMode; label: string; icon: React.ElementType; gradient: string }[] = [
  { id: 'create', label: 'Create', icon: Sparkles, gradient: 'from-amber-500 to-orange-600' },
  { id: 'produce', label: 'Produce', icon: Video, gradient: 'from-blue-500 to-cyan-600' },
  { id: 'publish', label: 'Publish', icon: Share2, gradient: 'from-violet-500 to-purple-600' },
];

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'ai-devs', label: 'AI Developers', icon: Users, badge: 'New' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'assets', label: 'Assets', icon: Package, hasSubmenu: true },
  { id: 'brand-kit', label: 'Brand Kit', icon: Palette },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// ── Left Sidebar ─────────────────────────────────────────────────────────────

const LeftSidebar: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
  activeView: string;
  onViewChange: (view: string) => void;
}> = ({ activeMode, onModeChange, activeView, onViewChange }) => (
  <div className="w-[230px] flex-shrink-0 flex flex-col bg-[hsl(230_25%_12%)] text-white rounded-2xl overflow-hidden">
    {/* Brand */}
    <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
        <Film className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className="text-sm font-bold tracking-tight">Genie Suite</span>
    </div>

    {/* New Project CTA */}
    <div className="px-4 mb-5">
      <Button className="w-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2">
        <Plus className="w-4 h-4" />
        New Project
      </Button>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const isActive = activeView === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all',
              isActive
                ? 'bg-white/10 text-white font-medium'
                : 'text-white/55 hover:text-white/85 hover:bg-white/[0.04]',
            )}
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge className="h-[18px] px-1.5 text-[9px] bg-emerald-500/25 text-emerald-400 border-0 font-semibold">
                {item.badge}
              </Badge>
            )}
            {item.hasSubmenu && <ChevronRight className="w-3.5 h-3.5 opacity-30" />}
          </button>
        );
      })}
    </nav>

    {/* Divider */}
    <div className="mx-4 my-2 h-px bg-white/[0.06]" />

    {/* Settings */}
    <div className="px-3 pb-2">
      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/55 hover:text-white/85 hover:bg-white/[0.04] transition-all">
        <Settings className="w-[18px] h-[18px]" />
        <span className="flex-1 text-left">Settings</span>
        <ChevronRight className="w-3.5 h-3.5 opacity-30" />
      </button>
    </div>

    {/* Active Project Card */}
    <div className="mx-3 mb-3 p-3.5 rounded-xl bg-white/[0.05] border border-white/[0.06]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-white/90">EP04 – Genie Cast</span>
        <ChevronDown className="w-3.5 h-3.5 text-white/30" />
      </div>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex-1 h-[6px] rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: '0%' }}
            animate={{ width: '72%' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[11px] text-white/50 font-mono tabular-nums">72%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-1.5">
          {['ori', 'arc'].map((a) => (
            <div key={a} className={cn(
              'w-6 h-6 rounded-full border-2 border-[hsl(230_25%_12%)] flex items-center justify-center text-[9px]',
              a === 'ori' ? 'bg-cyan-500/20' : 'bg-indigo-500/20',
            )}>
              {a === 'ori' ? '✨' : '⚡'}
            </div>
          ))}
        </div>
        <span className="text-[10px] text-white/40 ml-auto">...</span>
      </div>
    </div>
  </div>
);

// ── Top Header Bar ───────────────────────────────────────────────────────────

const TopHeader: React.FC<{ userName?: string }> = ({ userName }) => (
  <div className="flex items-center justify-between px-6 py-3 border-b border-border/20">
    {/* Left: Region */}
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground rounded-lg">
        <Globe className="w-3.5 h-3.5" />
        North America (2)
        <ChevronDown className="w-3 h-3" />
      </Button>
    </div>

    {/* Center: Search */}
    <div className="flex-1 max-w-md mx-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          placeholder="Search projects, assets, AI..."
          className="h-9 pl-9 text-sm bg-muted/30 border-border/20 rounded-xl placeholder:text-muted-foreground/40"
        />
      </div>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-50">
        <CreditCard className="w-3.5 h-3.5" />
        Credits
        <Badge className="h-5 px-1.5 text-[10px] bg-emerald-500/15 text-emerald-600 border-0 font-bold">840</Badge>
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
        <Bell className="w-4 h-4 text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
        <Info className="w-4 h-4 text-muted-foreground" />
      </Button>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-border/30 flex items-center justify-center text-xs font-bold text-foreground">
        {userName ? userName[0].toUpperCase() : 'U'}
      </div>
    </div>
  </div>
);

// ── Welcome Section ──────────────────────────────────────────────────────────

const WelcomeSection: React.FC<{ userName?: string }> = ({ userName }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">
        Welcome back{userName ? `, ${userName}` : ''}! 👋
      </h1>
      <p className="text-sm text-muted-foreground mt-1">Let's build something incredible today.</p>
    </div>
    <div className="flex items-center gap-3">
      {[
        { label: 'Active Projects', value: '12', change: '+20%', changeColor: 'text-emerald-500' },
        { label: 'AI Developers', value: '2', sub: 'Ori • Arc' },
        { label: 'Next Launch', value: 'EP04', sub: 'In 3 days' },
      ].map((stat) => (
        <div key={stat.label} className="px-4 py-3 rounded-xl bg-background border border-border/30 min-w-[130px]">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-foreground">{stat.value}</span>
            {stat.change && <span className={cn('text-[11px] font-semibold', stat.changeColor)}>{stat.change}</span>}
          </div>
          {stat.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>}
        </div>
      ))}
    </div>
  </div>
);

// ── Create New Project Section ───────────────────────────────────────────────

const INDUSTRIES = [
  { id: 'entertainment', label: 'Entertainment & Media', icon: Film },
  { id: 'tech', label: 'Tech & SaaS', icon: Zap },
  { id: 'healthcare', label: 'Healthcare', icon: '❤️' },
  { id: 'ecommerce', label: 'E-Commerce', icon: Package },
  { id: 'education', label: 'Education', icon: '✅' },
  { id: 'finance', label: 'Finance', icon: BarChart3 },
  { id: 'realestate', label: 'Real Estate', icon: Home },
  { id: 'more', label: 'More', icon: '•••' },
];

const CreateNewProjectSection: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-foreground mb-4">Create New Project</h2>
      
      {/* Start options */}
      <div className="flex gap-3 mb-5">
        {[
          { label: 'Start from Scratch', icon: Sparkles, active: true },
          { label: 'Use Template', icon: LayoutTemplate },
          { label: 'Import Brief', icon: FolderOpen },
        ].map((opt) => (
          <Button
            key={opt.label}
            variant={opt.active ? 'default' : 'outline'}
            className={cn(
              'h-11 px-5 rounded-xl gap-2.5 text-sm font-medium',
              opt.active
                ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15'
                : 'border-border/40 hover:bg-muted/40',
            )}
          >
            <opt.icon className="w-4 h-4" />
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Industry picker */}
      <p className="text-sm font-semibold text-foreground mb-3">Pick Industry</p>
      <div className="flex flex-wrap gap-2">
        {INDUSTRIES.map((ind) => {
          const isActive = selectedIndustry === ind.id;
          return (
            <button
              key={ind.id}
              onClick={() => setSelectedIndustry(isActive ? null : ind.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border',
                isActive
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-background border-border/30 text-foreground hover:bg-muted/30 hover:border-border/50',
              )}
            >
              {typeof ind.icon === 'string' ? (
                <span className="text-sm">{ind.icon}</span>
              ) : (
                <ind.icon className="w-4 h-4" />
              )}
              {ind.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Active Projects Grid ─────────────────────────────────────────────────────

const DEMO_PROJECTS = [
  { id: 'ep04', title: 'EP04 – Genie Cast', status: 'In Production', statusColor: 'text-primary', progress: 72, timeline: 'Launch in 3 days', urgent: true },
  { id: 'ep05', title: 'EP05 – AI Agents', status: 'Script Ready', statusColor: 'text-emerald-500', progress: 45, timeline: 'Launch in 1 week' },
  { id: 'ep06', title: 'EP06 – Future of Work', status: 'Planning', statusColor: 'text-violet-500', progress: 20 },
];

const ActiveProjectsGrid: React.FC<{ onOpenProject: () => void }> = ({ onOpenProject }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Active Projects</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border/30 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'grid' ? 'bg-muted/60 text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid3X3 className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'list' ? 'bg-muted/60 text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-lg border-border/30">
            <Plus className="w-3.5 h-3.5" /> New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {DEMO_PROJECTS.map((proj) => (
          <motion.div
            key={proj.id}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={onOpenProject}
            className="group cursor-pointer rounded-2xl border border-border/30 bg-background overflow-hidden hover:border-border/60 hover:shadow-md transition-all"
          >
            {/* Thumbnail placeholder */}
            <div className="h-36 bg-gradient-to-br from-muted/40 to-muted/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-sm font-bold text-foreground">{proj.title}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Share2 className="w-3 h-3 text-muted-foreground" />
                  <span className={cn('text-[11px] font-semibold', proj.statusColor)}>{proj.status}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all duration-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono tabular-nums">{proj.progress}%</span>
              </div>
              {proj.timeline && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{proj.timeline}</span>
                  {proj.urgent && <span className="text-[11px]">🔥</span>}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Right Panel ──────────────────────────────────────────────────────────────

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
      <div className="rounded-2xl bg-background border border-border/30 p-4">
        <h3 className="text-sm font-bold text-foreground mb-4">Project Timeline</h3>
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
                      : 'bg-muted/20 border-border/40 text-muted-foreground',
                )}>
                  {step.status === 'done' ? '✓' : idx + 1}
                </div>
                {idx < timelineSteps.length - 1 && (
                  <div className={cn('w-[2px] h-6 my-1 rounded-full',
                    step.status === 'done' ? 'bg-emerald-500/40' : 'bg-border/20',
                  )} />
                )}
              </div>
              <div className="pt-0.5 flex-1">
                <p className={cn('text-xs font-medium',
                  step.status === 'done' ? 'text-foreground/70' : step.status === 'active' ? 'text-foreground' : 'text-muted-foreground',
                )}>
                  {step.label}
                </p>
                {step.status === 'done' && <Badge className="h-4 px-1.5 text-[9px] bg-emerald-500/15 text-emerald-500 border-0 mt-0.5">Done</Badge>}
                {step.status === 'active' && <span className="text-[10px] text-primary font-medium">In Progress</span>}
              </div>
              {step.status === 'active' && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* AI Developers — Ori & Arc ONLY */}
      <div className="rounded-2xl bg-background border border-border/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">AI Developers</h3>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="space-y-3">
          {/* Arc — Systems Guide */}
          <div className={cn(
            'flex items-center gap-3 p-2.5 rounded-xl transition-all',
            agent === 'arc' ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-muted/20',
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              {agent === 'arc' && (
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground">Arc</p>
                <Badge className="h-3.5 px-1 text-[8px] bg-emerald-500/20 text-emerald-400 border-0">✓</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Systems Architect</p>
            </div>
          </div>

          {/* Ori — Creative Guide */}
          <div className={cn(
            'flex items-center gap-3 p-2.5 rounded-xl transition-all',
            agent === 'ori' ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-muted/20',
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 flex items-center justify-center border border-cyan-500/20">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              {agent === 'ori' && (
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground">Ori</p>
                <Badge className="h-3.5 px-1 text-[8px] bg-emerald-500/20 text-emerald-400 border-0">✓</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">UI/UX & Creative</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-3 border-t border-border/15">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {['Generate Script', 'Create Scene', 'Add Character'].map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="h-7 text-[10px] rounded-lg border-border/20 bg-background/50 hover:bg-muted/30 justify-start px-2"
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
            'relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all',
            isActive ? 'text-foreground bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground/80',
          )}
        >
          <Icon className={cn('w-4 h-4', isActive && 'text-primary')} />
          <span>{mode.label}</span>
        </button>
      );
    })}
  </div>
);

// ── Home Dashboard View ──────────────────────────────────────────────────────

const HomeDashboard: React.FC<{ userName?: string; onOpenWorkspace: () => void }> = ({ userName, onOpenWorkspace }) => (
  <div className="p-6">
    <WelcomeSection userName={userName} />
    <CreateNewProjectSection />
    <ActiveProjectsGrid onOpenProject={onOpenWorkspace} />
  </div>
);

// ── Main Hub ─────────────────────────────────────────────────────────────────

export const GenieCastHub: React.FC = () => {
  const isMounted = useRef(true);
  const isMobile = useIsMobile();
  const { mode, setMode, dispatch } = useGuideStore();
  const { profile } = useMasterAuth();
  const userName = profile?.first_name || undefined;

  // View: 'home' shows dashboard, anything else shows workspace
  const [activeView, setActiveView] = useState('home');

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
    } catch (error) {
      toast.error('Failed to start generation');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedVideoStyles, dispatch]);

  const handleModeChange = useCallback((newMode: CastMode) => {
    setMode(newMode);
    dispatch({ type: 'SWITCH_MODE', mode: newMode });
    setActiveView('workspace'); // Switch to workspace on mode change
  }, [setMode, dispatch]);

  const activeTab = MODE_TO_TAB[mode];

  const handleMainTabChange = useCallback((tab: ConsolidatedTab) => {
    const newMode = Object.entries(MODE_TO_TAB).find(([, t]) => t === tab)?.[0] as CastMode | undefined;
    if (newMode && newMode !== mode) handleModeChange(newMode);
  }, [mode, handleModeChange]);

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
  }, []);

  const openWorkspace = useCallback(() => {
    setActiveView('workspace');
  }, []);

  // Determine main content
  const isHomeDashboard = activeView === 'home';

  // ── Mobile Layout ──────────────────────────────────────────────────────────
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

  // ── Desktop 3-Column Layout ────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] gap-3 p-2">
      {/* Column 1: Left Sidebar */}
      <LeftSidebar
        activeMode={mode}
        onModeChange={handleModeChange}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* Column 2: Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden rounded-2xl bg-background border border-border/20">
        <TopHeader userName={userName} />

        <div className="flex-1 overflow-y-auto">
          {isHomeDashboard ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <HomeDashboard userName={userName} onOpenWorkspace={openWorkspace} />
            </motion.div>
          ) : (
            <div className="h-full">
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
          )}
        </div>
      </div>

      {/* Column 3: Right Panel */}
      <RightPanel />
    </div>
  );
};

export default GenieCastHub;
