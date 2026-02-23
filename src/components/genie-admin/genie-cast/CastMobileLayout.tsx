/**
 * CastMobileLayout — App-like mobile experience for Genie Cast
 *
 * Features:
 * - Bottom tab bar (Dashboard, Create, Produce, Publish)
 * - Full-width story cards with large thumbnails
 * - Progressive disclosure: simplified dashboard with drill-down
 * - Pixar characters (Ori & Arc) in glassmorphism welcome area
 * - Device-specific hero imagery and messaging
 * - Unique mobile images for quick action cards
 */

import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Sparkles, Video, Share2, Film,
  FolderOpen, LayoutTemplate, BarChart3, Settings,
  ChevronRight, Globe, Zap, Play, ArrowRight,
  Loader2, ChevronLeft, Layers, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CastMode } from '@/stores/guideStore';
import castHeroMobile from '@/assets/cast-hero-mobile.jpg';
import oriAvatar from '@/assets/characters/ori-avatar.png';
import arcAvatar from '@/assets/characters/arc-avatar.png';
import imgCreate from '@/assets/cast-mobile-create.jpg';
import imgProjects from '@/assets/cast-mobile-projects.jpg';
import imgTemplates from '@/assets/cast-mobile-templates.jpg';
import imgAnalytics from '@/assets/cast-mobile-analytics.jpg';

type MobileTab = 'dashboard' | 'create' | 'produce' | 'publish';

interface CastMobileLayoutProps {
  mode: CastMode;
  onModeChange: (mode: CastMode) => void;
  showDashboard: boolean;
  onShowDashboard: (show: boolean) => void;
  videoStats?: any;
  totalProjects?: number;
  totalTemplates?: number;
  onStartCreate: () => void;
  children: React.ReactNode; // The workspace tabs content
  dashboardContent: React.ReactNode; // The dashboard overview
}

// ── Device-specific messaging ────────────────────────────────────────────────
const MOBILE_MESSAGES = {
  welcome: {
    title: 'Your Studio, Anywhere',
    subtitle: 'Create professional content on the go with AI-powered production',
  },
  create: {
    title: 'Start Creating',
    subtitle: 'Tap to begin your next masterpiece',
  },
  produce: {
    title: 'Production Hub',
    subtitle: 'Monitor and manage your content pipeline',
  },
  publish: {
    title: 'Go Live',
    subtitle: 'Share your content with the world',
  },
};

// ── Bottom Tab Bar ───────────────────────────────────────────────────────────
const TABS: { id: MobileTab; label: string; icon: React.ElementType; castMode?: CastMode }[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'create', label: 'Create', icon: Sparkles, castMode: 'create' },
  { id: 'produce', label: 'Produce', icon: Video, castMode: 'produce' },
  { id: 'publish', label: 'Publish', icon: Share2, castMode: 'publish' },
];

const BottomTabBar: React.FC<{
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}> = ({ activeTab, onTabChange }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/20 safe-area-bottom">
    <div className="flex items-center justify-around h-14 px-2">
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[56px]',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <div className={cn(
              'w-9 h-6 rounded-full flex items-center justify-center transition-all',
              active && 'bg-primary/10',
            )}>
              <Icon className={cn('w-4 h-4 transition-all', active && 'scale-110')} />
            </div>
            <span className={cn('text-[9px] font-medium', active && 'font-bold')}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

// ── Mobile Hero with Pixar Characters (compact) ──────────────────────────────
const MobileHero: React.FC<{
  onStartCreate: () => void;
}> = ({ onStartCreate }) => (
  <div className="relative overflow-hidden rounded-xl mx-3">
    {/* Hero image */}
    <div className="absolute inset-0 z-0">
      <img src={castHeroMobile} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
    </div>

    {/* Pixar character badges */}
    <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
      <div className="flex -space-x-2">
        <div className="w-7 h-7 rounded-full border-2 border-background/60 overflow-hidden backdrop-blur-md bg-card/40">
          <img src={oriAvatar} alt="Ori" className="w-full h-full object-cover" />
        </div>
        <div className="w-7 h-7 rounded-full border-2 border-background/60 overflow-hidden backdrop-blur-md bg-card/40">
          <img src={arcAvatar} alt="Arc" className="w-full h-full object-cover" />
        </div>
      </div>
      <span className="text-[8px] font-medium text-white/70 bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded-full">
        AI Guides
      </span>
    </div>

    {/* Content — compact */}
    <div className="relative z-10 pt-20 pb-4 px-3">
      <h1 className="text-xl font-bold text-foreground leading-tight">
        {MOBILE_MESSAGES.welcome.title}
      </h1>
      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
        {MOBILE_MESSAGES.welcome.subtitle}
      </p>
      <Button
        onClick={onStartCreate}
        size="sm"
        className="mt-3 gap-1.5 bg-primary text-primary-foreground shadow-lg h-8 text-xs"
      >
        <Plus className="w-3.5 h-3.5" /> New Content
      </Button>
    </div>
  </div>
);

// ── Story Card (Instagram-style full-width) ──────────────────────────────────
const StoryCard: React.FC<{
  title: string;
  subtitle: string;
  thumbnail?: string;
  stage: string;
  contentType: string;
  time: string;
  onClick: () => void;
}> = ({ title, subtitle, thumbnail, stage, contentType, time, onClick }) => {
  const stageColors: Record<string, string> = {
    created: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    produced: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl overflow-hidden glass-card text-left transition-all active:scale-[0.98]"
    >
      {/* Large thumbnail */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/15 via-purple-600/10 to-pink-500/10 flex items-center justify-center">
            <Film className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
        
        {/* Stage badge */}
        <div className={cn('absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold border backdrop-blur-md uppercase tracking-wider', stageColors[stage] || stageColors.created)}>
          {stage}
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-muted-foreground/60">{contentType}</span>
          <span className="text-[10px] text-muted-foreground/40">{time}</span>
        </div>
      </div>
    </button>
  );
};

// ── Quick Action Grid with Images ────────────────────────────────────────────
const QuickActions: React.FC<{
  videoStats?: any;
  totalProjects?: number;
  totalTemplates?: number;
  onStartCreate: () => void;
  onTabChange: (tab: MobileTab) => void;
}> = ({ videoStats, totalProjects = 0, totalTemplates = 0, onStartCreate, onTabChange }) => {
  const actions = [
    { icon: <Sparkles className="w-4 h-4 text-primary" />, label: 'Create', subtitle: 'Start new content', count: undefined, image: imgCreate, action: () => onTabChange('create') },
    { icon: <FolderOpen className="w-4 h-4 text-blue-400" />, label: 'Projects', subtitle: `${totalProjects} active`, count: totalProjects, image: imgProjects, action: () => onTabChange('produce') },
    { icon: <LayoutTemplate className="w-4 h-4 text-purple-400" />, label: 'Templates', subtitle: `${totalTemplates} available`, count: totalTemplates, image: imgTemplates, action: () => onTabChange('create') },
    { icon: <BarChart3 className="w-4 h-4 text-emerald-400" />, label: 'Analytics', subtitle: `${videoStats?.completed || 0} completed`, count: videoStats?.completed || 0, image: imgAnalytics, action: () => onTabChange('produce') },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 px-3">
      {actions.map(a => (
        <button
          key={a.label}
          onClick={a.action}
          className="relative overflow-hidden rounded-xl border border-border/10 backdrop-blur-md transition-all active:scale-[0.96] text-left"
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <img src={a.image} alt="" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/30" />
          </div>
          {/* Content */}
          <div className="relative z-10 p-3 flex flex-col gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-background/60 backdrop-blur-md flex items-center justify-center border border-border/10">
              {a.icon}
            </div>
            <span className="text-xs font-bold text-foreground">{a.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{a.subtitle}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

// ── Ori & Arc Welcome Glass Panel ────────────────────────────────────────────
const GuideWelcomePanel: React.FC = () => (
  <div className="mx-3 rounded-2xl overflow-hidden glass-card border border-border/10">
    <div className="p-4 flex items-center gap-3">
      <div className="flex -space-x-3">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400/30 overflow-hidden bg-card/60 backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          <img src={oriAvatar} alt="Ori" className="w-full h-full object-cover" />
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-indigo-400/30 overflow-hidden bg-card/60 backdrop-blur-md shadow-[0_0_12px_rgba(99,102,241,0.2)]">
          <img src={arcAvatar} alt="Arc" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Ori & Arc are ready</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your AI guides can help with scripts, visuals & production
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
    </div>
  </div>
);

// ── Main Mobile Layout ───────────────────────────────────────────────────────
export const CastMobileLayout: React.FC<CastMobileLayoutProps> = ({
  mode,
  onModeChange,
  showDashboard,
  onShowDashboard,
  videoStats,
  totalProjects,
  totalTemplates,
  onStartCreate,
  children,
  dashboardContent,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('dashboard');

  const handleTabChange = (tab: MobileTab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      onShowDashboard(true);
    } else {
      onShowDashboard(false);
      const modeMap: Record<MobileTab, CastMode> = {
        dashboard: 'create',
        create: 'create',
        produce: 'produce',
        publish: 'publish',
      };
      onModeChange(modeMap[tab]);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] pb-20">
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto space-y-4 pt-3"
          >
            {/* Mobile Hero */}
            <MobileHero onStartCreate={() => handleTabChange('create')} />

            {/* Ori & Arc Glass Panel */}
            <GuideWelcomePanel />

            {/* Quick Actions Grid */}
            <QuickActions
              videoStats={videoStats}
              totalProjects={totalProjects}
              totalTemplates={totalTemplates}
              onStartCreate={onStartCreate}
              onTabChange={handleTabChange}
            />

            {/* KPI Strip */}
            <div className="flex gap-2 px-3 overflow-x-auto scrollbar-none">
              {[
                { label: 'Videos', value: videoStats?.total || 0, color: 'text-primary' },
                { label: 'Success', value: `${videoStats?.successRate || 0}%`, color: 'text-emerald-400' },
                { label: 'Languages', value: videoStats?.languageCount || 0, color: 'text-cyan-400' },
              ].map(kpi => (
                <div key={kpi.label} className="flex-1 min-w-[100px] glass-card rounded-xl p-3 text-center">
                  <p className={cn('text-xl font-bold', kpi.color)}>{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Full Dashboard Content (progressive — scrollable) */}
            <div className="px-0">
              {dashboardContent}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-y-auto"
          >
            {/* Mode header */}
            <div className="px-4 pt-4 pb-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors mb-2 group"
              >
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to Dashboard
              </button>
              <h2 className="text-lg font-bold text-foreground">
                {MOBILE_MESSAGES[activeTab as keyof typeof MOBILE_MESSAGES]?.title || 'Workspace'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {MOBILE_MESSAGES[activeTab as keyof typeof MOBILE_MESSAGES]?.subtitle || ''}
              </p>
            </div>

            {/* Workspace content */}
            <div className="px-3 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default CastMobileLayout;
