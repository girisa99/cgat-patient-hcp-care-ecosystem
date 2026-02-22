/**
 * GENIE CAST HUB — Modern SaaS Dashboard with Glassmorphism
 * 
 * Characters: Ori (Creative) + Arc (Systems) — NO Atlas/Nova
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
import { motion } from 'framer-motion';
import {
  Sparkles, Video, Share2, Film, Plus, Search, Bell,
  Home, FolderOpen, Users, LayoutTemplate, Package,
  Palette, BarChart3, Settings, ChevronRight,
  Zap, Grid3X3, List, Globe, CreditCard, Info,
  Clock, ChevronDown, Play, Wand2, Layers,
  Image, Megaphone, Brain, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

type NavView = 'home' | 'workspace' | 'projects' | 'ai-devs' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings';

const NAV_ITEMS: { id: NavView; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'workspace', label: 'Workspace', icon: Layers },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'ai-devs', label: 'AI Developers', icon: Users, badge: '2' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'assets', label: 'Assets', icon: Package },
  { id: 'brand-kit', label: 'Brand Kit', icon: Palette },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// ── Glass Card wrapper ───────────────────────────────────────────────────────
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}> = ({ children, className, hover = false, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      'rounded-2xl border backdrop-blur-xl overflow-hidden transition-all duration-300',
      'bg-card/60 border-border/20',
      'shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.08)]',
      hover && 'cursor-pointer hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:border-border/40',
      onClick && 'cursor-pointer',
      className,
    )}
  >
    {/* Top shine */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none" />
    <div className="relative z-[1]">{children}</div>
  </div>
);

// ── Left Sidebar ─────────────────────────────────────────────────────────────
const LeftSidebar: React.FC<{
  activeMode: CastMode;
  onModeChange: (mode: CastMode) => void;
  activeView: NavView;
  onViewChange: (view: NavView) => void;
}> = ({ activeMode, onModeChange, activeView, onViewChange }) => (
  <div className="w-[230px] flex-shrink-0 flex flex-col rounded-2xl overflow-hidden backdrop-blur-2xl bg-[hsl(230_25%_10%/0.95)] border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
    {/* Brand */}
    <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
        <Film className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-bold tracking-tight text-white">Genie Suite</span>
    </div>

    {/* New Project CTA */}
    <div className="px-4 mb-4">
      <Button
        onClick={() => onViewChange('workspace')}
        className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl gap-2 shadow-[0_0_16px_rgba(99,102,241,0.25)]"
      >
        <Plus className="w-4 h-4" />
        New Project
      </Button>
    </div>

    {/* Workflow Modes */}
    <div className="px-4 mb-3">
      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">Workflow</p>
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        {MODES.map(m => {
          const active = activeMode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => { onModeChange(m.id); onViewChange('workspace'); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all',
                active
                  ? 'bg-white/[0.12] text-white shadow-sm'
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
                ? 'bg-white/[0.1] text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]',
            )}
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge className="h-[18px] px-1.5 text-[9px] bg-primary/25 text-primary border-0 font-semibold">
                {item.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </nav>

    {/* Settings */}
    <div className="px-3 pb-2 mt-2 border-t border-white/[0.06] pt-2">
      <button
        onClick={() => onViewChange('settings')}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all"
      >
        <Settings className="w-[18px] h-[18px]" />
        <span className="flex-1 text-left">Settings</span>
      </button>
    </div>

    {/* Active Project Card */}
    <div className="mx-3 mb-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
      <button onClick={() => onViewChange('workspace')} className="w-full text-left">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-white/90">EP04 – Genie Cast</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        </div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex-1 h-[6px] rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
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
                'w-6 h-6 rounded-full border-2 border-[hsl(230_25%_10%)] flex items-center justify-center text-[9px]',
                a === 'ori' ? 'bg-cyan-500/25' : 'bg-indigo-500/25',
              )}>
                {a === 'ori' ? '✨' : '⚡'}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-white/40 ml-auto">Active</span>
        </div>
      </button>
    </div>
  </div>
);

// ── Top Header Bar ───────────────────────────────────────────────────────────
const TopHeader: React.FC<{ userName?: string }> = ({ userName }) => (
  <div className="flex items-center justify-between px-6 py-3 border-b border-border/15 backdrop-blur-md bg-background/80">
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground rounded-lg">
        <Globe className="w-3.5 h-3.5" />
        North America (2)
        <ChevronDown className="w-3 h-3" />
      </Button>
    </div>
    <div className="flex-1 max-w-md mx-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          placeholder="Search projects, assets, AI..."
          className="h-9 pl-9 text-sm bg-muted/20 border-border/15 rounded-xl placeholder:text-muted-foreground/40 backdrop-blur-sm"
        />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 backdrop-blur-sm">
        <CreditCard className="w-3.5 h-3.5" />
        <Badge className="h-5 px-1.5 text-[10px] bg-emerald-500/15 text-emerald-600 border-0 font-bold">840</Badge>
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
        <Bell className="w-4 h-4 text-muted-foreground" />
      </Button>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border border-border/30 flex items-center justify-center text-xs font-bold text-foreground backdrop-blur-sm">
        {userName ? userName[0].toUpperCase() : 'U'}
      </div>
    </div>
  </div>
);

// ── Project thumbnails with visual content ───────────────────────────────────
const PROJECT_THUMBNAILS: { icon: React.ElementType; gradient: string; accent: string }[] = [
  { icon: Megaphone, gradient: 'from-rose-500/30 via-orange-400/20 to-amber-500/10', accent: 'text-rose-400' },
  { icon: Brain, gradient: 'from-blue-500/30 via-indigo-400/20 to-violet-500/10', accent: 'text-blue-400' },
  { icon: Wand2, gradient: 'from-violet-500/30 via-purple-400/20 to-fuchsia-500/10', accent: 'text-violet-400' },
];

const DEMO_PROJECTS = [
  { id: 'ep04', title: 'EP04 – Genie Cast', status: 'In Production', statusColor: 'text-primary', progress: 72, timeline: 'Launch in 3 days', urgent: true, thumb: 0 },
  { id: 'ep05', title: 'EP05 – AI Agents', status: 'Script Ready', statusColor: 'text-emerald-500', progress: 45, timeline: 'Launch in 1 week', thumb: 1 },
  { id: 'ep06', title: 'EP06 – Future of Work', status: 'Planning', statusColor: 'text-violet-500', progress: 20, thumb: 2 },
];

// ── Home Dashboard ───────────────────────────────────────────────────────────
const HomeDashboard: React.FC<{ userName?: string; onOpenWorkspace: () => void }> = ({ userName, onOpenWorkspace }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const INDUSTRIES = [
    { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
    { id: 'tech', label: 'Tech & SaaS', emoji: '⚡' },
    { id: 'healthcare', label: 'Healthcare', emoji: '❤️' },
    { id: 'ecommerce', label: 'E-Commerce', emoji: '🛒' },
    { id: 'education', label: 'Education', emoji: '📚' },
    { id: 'finance', label: 'Finance', emoji: '💰' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{userName ? `, ${userName}` : ''}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Let's build something incredible today.</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: 'Active Projects', value: '12', change: '+20%' },
            { label: 'AI Developers', value: '2', sub: 'Ori • Arc' },
            { label: 'Next Launch', value: 'EP04', sub: 'In 3 days' },
          ].map((stat) => (
            <GlassCard key={stat.label} className="relative px-4 py-3 min-w-[130px]">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold text-foreground">{stat.value}</span>
                {stat.change && <span className="text-[11px] font-semibold text-emerald-500">{stat.change}</span>}
              </div>
              {stat.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>}
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Create New Project */}
      <GlassCard className="relative p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Create New Project</h2>
        <div className="flex gap-3 mb-5">
          {[
            { label: 'Start from Scratch', icon: Sparkles, active: true },
            { label: 'Use Template', icon: LayoutTemplate },
            { label: 'Import Brief', icon: FileText },
          ].map((opt) => (
            <Button
              key={opt.label}
              variant="outline"
              onClick={onOpenWorkspace}
              className={cn(
                'h-11 px-5 rounded-xl gap-2.5 text-sm font-medium backdrop-blur-sm',
                opt.active
                  ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/15 shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                  : 'border-border/30 hover:bg-muted/30',
              )}
            >
              <opt.icon className="w-4 h-4" />
              {opt.label}
            </Button>
          ))}
        </div>

        <p className="text-sm font-semibold text-foreground mb-3">Pick Industry</p>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => {
            const isActive = selectedIndustry === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(isActive ? null : ind.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border backdrop-blur-sm',
                  isActive
                    ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                    : 'bg-card/40 border-border/20 text-foreground hover:bg-card/60 hover:border-border/40',
                )}
              >
                <span>{ind.emoji}</span>
                {ind.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Active Projects</h2>
          <Button variant="outline" size="sm" onClick={onOpenWorkspace} className="h-8 gap-1.5 text-xs rounded-lg border-border/30 backdrop-blur-sm">
            <Plus className="w-3.5 h-3.5" /> New
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {DEMO_PROJECTS.map((proj) => {
            const thumb = PROJECT_THUMBNAILS[proj.thumb];
            const Icon = thumb.icon;
            return (
              <GlassCard key={proj.id} hover onClick={onOpenWorkspace} className="relative group">
                {/* Thumbnail with visual content */}
                <div className={cn('h-36 relative overflow-hidden bg-gradient-to-br', thumb.gradient)}>
                  {/* Decorative elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/[0.1] flex items-center justify-center shadow-lg">
                        <Icon className={cn('w-8 h-8', thumb.accent)} />
                      </div>
                      {/* Floating dots */}
                      <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white/[0.06] backdrop-blur-sm" />
                      <div className="absolute -bottom-2 -left-4 w-4 h-4 rounded-full bg-white/[0.08] backdrop-blur-sm" />
                    </div>
                  </div>
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card/90 to-transparent" />
                  {/* Play button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>
                  </div>
                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm font-bold text-foreground">{proj.title}</h3>
                    <span className={cn('text-[11px] font-semibold', proj.statusColor)}>{proj.status}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
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
              </GlassCard>
            );
          })}
        </div>
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
      <GlassCard className="relative p-4">
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
                      ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                      : 'bg-muted/20 border-border/30 text-muted-foreground',
                )}>
                  {step.status === 'done' ? '✓' : idx + 1}
                </div>
                {idx < timelineSteps.length - 1 && (
                  <div className={cn('w-[2px] h-6 my-1 rounded-full',
                    step.status === 'done' ? 'bg-emerald-500/40' : 'bg-border/15',
                  )} />
                )}
              </div>
              <div className="pt-0.5 flex-1">
                <p className={cn('text-xs font-medium',
                  step.status === 'active' ? 'text-foreground' : 'text-muted-foreground',
                )}>
                  {step.label}
                </p>
                {step.status === 'done' && <Badge className="h-4 px-1.5 text-[9px] bg-emerald-500/15 text-emerald-500 border-0 mt-0.5">Done</Badge>}
                {step.status === 'active' && <span className="text-[10px] text-primary font-medium">In Progress</span>}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI Developers — Ori & Arc */}
      <GlassCard className="relative p-4">
        <h3 className="text-sm font-bold text-foreground mb-4">AI Developers</h3>
        <div className="space-y-3">
          {/* Arc */}
          <div className={cn(
            'flex items-center gap-3 p-2.5 rounded-xl transition-all backdrop-blur-sm',
            agent === 'arc' ? 'bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_16px_rgba(99,102,241,0.1)]' : 'hover:bg-muted/15',
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 flex items-center justify-center border border-indigo-500/20 backdrop-blur-md">
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
                <Badge className="h-3.5 px-1 text-[8px] bg-emerald-500/20 text-emerald-400 border-0">Active</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Systems Architect</p>
            </div>
          </div>

          {/* Ori */}
          <div className={cn(
            'flex items-center gap-3 p-2.5 rounded-xl transition-all backdrop-blur-sm',
            agent === 'ori' ? 'bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_16px_rgba(6,182,212,0.1)]' : 'hover:bg-muted/15',
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 flex items-center justify-center border border-cyan-500/20 backdrop-blur-md">
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
                <Badge className="h-3.5 px-1 text-[8px] bg-emerald-500/20 text-emerald-400 border-0">Active</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">UI/UX & Creative</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-3 border-t border-border/10">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {['Generate Script', 'Create Scene', 'Add Character', 'Preview'].map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                onClick={() => toast.info(`${action} — coming soon`)}
                className="h-7 text-[10px] rounded-lg border-border/15 bg-card/40 hover:bg-card/60 backdrop-blur-sm justify-start px-2"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </GlassCard>

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
  <div className="flex items-center gap-1 p-1 rounded-xl bg-card/40 border border-border/15 backdrop-blur-xl">
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

// ── Placeholder views for nav items ─────────────────────────────────────────
const PlaceholderView: React.FC<{ title: string; description: string; icon: React.ElementType }> = ({ title, description, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
    <GlassCard className="relative p-8 text-center max-w-md">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/15 backdrop-blur-md">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </GlassCard>
  </div>
);

const NAV_PLACEHOLDERS: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  projects: { title: 'Projects', description: 'View and manage all your video projects in one place.', icon: FolderOpen },
  'ai-devs': { title: 'AI Developers', description: 'Ori & Arc are your AI development team. Configure their capabilities here.', icon: Users },
  templates: { title: 'Templates', description: 'Browse and create templates for rapid video production.', icon: LayoutTemplate },
  assets: { title: 'Asset Library', description: 'Manage your images, videos, audio, and brand assets.', icon: Image },
  'brand-kit': { title: 'Brand Kit', description: 'Configure your brand colors, fonts, logos, and guidelines.', icon: Palette },
  analytics: { title: 'Analytics', description: 'Track performance, engagement, and ROI across all your content.', icon: BarChart3 },
  settings: { title: 'Settings', description: 'Configure your workspace, integrations, and preferences.', icon: Settings },
};

// ── Main Hub ─────────────────────────────────────────────────────────────────
export const GenieCastHub: React.FC = () => {
  const isMounted = useRef(true);
  const isMobile = useIsMobile();
  const { mode, setMode, dispatch } = useGuideStore();
  const { profile } = useMasterAuth();
  const userName = profile?.first_name || undefined;

  const [activeView, setActiveView] = useState<NavView>('home');

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

  const handleViewChange = useCallback((view: NavView) => {
    setActiveView(view);
  }, []);

  const openWorkspace = useCallback(() => {
    setActiveView('workspace');
  }, []);

  // Render main content based on activeView
  const renderMainContent = () => {
    if (activeView === 'home') {
      return <HomeDashboard userName={userName} onOpenWorkspace={openWorkspace} />;
    }
    if (activeView === 'workspace') {
      return (
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
      );
    }
    const placeholder = NAV_PLACEHOLDERS[activeView];
    if (placeholder) {
      return <PlaceholderView {...placeholder} />;
    }
    return null;
  };

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
      <LeftSidebar
        activeMode={mode}
        onModeChange={handleModeChange}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden rounded-2xl bg-background/80 backdrop-blur-xl border border-border/15 shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
        <TopHeader userName={userName} />
        <div className="flex-1 overflow-y-auto">
          {renderMainContent()}
        </div>
      </div>

      <RightPanel />
    </div>
  );
};

export default GenieCastHub;
