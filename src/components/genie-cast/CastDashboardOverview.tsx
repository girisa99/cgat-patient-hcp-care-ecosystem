/**
 * CastDashboardOverview — Glassmorphic + Region-Aware Dashboard v2
 *
 * Features:
 * - 3 rotating hero banners with region-positioned content
 * - Horizontal scrolling workflow steps on mobile
 * - Stat cards with themed background images
 * - Glass morphism throughout with backdrop-blur
 * - AI Engine panel with background image
 * - Broken thumbnail fallback handling
 * - Fully responsive: distinct mobile vs desktop layouts
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAutoScrollOnHover } from '@/hooks/useAutoScrollOnHover';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjects } from '@/hooks/useCastProjects';
import { useVideoBlueprints } from '@/hooks/useVideoBlueprints';
import { useCastContentRegistry } from '@/hooks/useCastContentRegistry';
import { useCastProduction } from '@/hooks/useCastProduction';
import { useRegionalLanguage } from '@/hooks/useRegionalLanguage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Video, FolderOpen, LayoutTemplate, Palette, BarChart3,
  Settings, Sparkles, TrendingUp, Globe, Zap,
  Play, ArrowRight, Layers, Film,
  Activity, ChevronRight, Star, HelpCircle, Info,
  Clapperboard, Wand2, Send, MonitorPlay, FileVideo, Image,
  Cpu, Languages, Map, Radar, Boxes, ChevronLeft,
  FileText, Mic, Presentation, Share2, Youtube, Linkedin,
  Instagram, Music, Headphones, PenTool, Plus, Heart,
  Folder,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  REGION_GROUP_DISPLAY,
  type DashboardSection,
} from '@/services/production/dashboardThumbnailService';
import { REGIONAL_SUB_REGIONS } from '@/config/regionalSubRegions';

// ── Asset imports ───────────────────────────────────────────────────────────
import castWorkflowCreate from '@/assets/cast-workflow-create.jpg';
import castWorkflowProduce from '@/assets/cast-workflow-produce.jpg';
import castWorkflowPublish from '@/assets/cast-workflow-publish.jpg';
import castNavProjects from '@/assets/cast-nav-projects.jpg';
import castNavTemplates from '@/assets/cast-nav-templates.jpg';
import castNavAssets from '@/assets/cast-nav-assets.jpg';
import castNavBrand from '@/assets/cast-nav-brand.jpg';
import castNavAnalytics from '@/assets/cast-nav-analytics.jpg';
import castNavSettings from '@/assets/cast-nav-settings.jpg';
import castAiEngine from '@/assets/cast-ai-engine.jpg';
import castHero1 from '@/assets/cast-hero-1.jpg';
import castHero2 from '@/assets/cast-hero-2.jpg';
import castHero3 from '@/assets/cast-hero-3.jpg';

type NavView = 'workspace' | 'projects' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings';

interface CastDashboardOverviewProps {
  onNavigate: (view: NavView) => void;
  /** Called when user clicks "Start Create". Optional categoryId/formatId pre-selects that item. */
  onStartCreate: (categoryId?: string, formatId?: string) => void;
  className?: string;
}

// ── Video stats from database ───────────────────────────────────────────────
function useVideoStats() {
  return useQuery({
    queryKey: ['dashboard-video-stats-v2'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('id, generation_status, language_name, created_at, title, thumbnail_url, video_url, content_type, industry, duration_seconds')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      const videos = data || [];
      const completed = videos.filter(v => v.generation_status === 'completed').length;
      const languages = new Set(videos.map(v => v.language_name).filter(Boolean));
      const recentVideos = videos.slice(0, 6);
      return {
        total: videos.length,
        completed,
        processing: videos.filter(v => v.generation_status === 'processing').length,
        failed: videos.filter(v => v.generation_status === 'failed').length,
        languageCount: languages.size,
        successRate: videos.length > 0 ? Math.round((completed / videos.length) * 100) : 0,
        recentVideos,
      };
    },
    staleTime: 30000,
  });
}

// ── Hero banner data per region ─────────────────────────────────────────────
const HERO_BANNERS = [
  {
    image: castHero1,
    title: 'Make It. Show It. Scale It.',
    subtitle: 'We built Cast to market our own products — now use it to market yours. Universal Enrichment powers every asset.',
    gradient: 'from-purple-900/80 via-purple-900/50 to-transparent',
  },
  {
    image: castHero2,
    title: '14 Regions × 40+ Sub-Regions × 6 Platforms',
    subtitle: 'One production run → localized for every market. Enrichment handles voiceover, captions, and brand context per region.',
    gradient: 'from-blue-900/80 via-blue-900/50 to-transparent',
  },
  {
    image: castHero3,
    title: 'Your Tools. Your Pipeline. No Agency.',
    subtitle: 'Cast pulls from 5 enrichment layers — Product, Brand, Audience, Regional, Competitor — and routes to the optimal AI model.',
    gradient: 'from-emerald-900/80 via-emerald-900/50 to-transparent',
  },
];

// ── 3-Banner Carousel ───────────────────────────────────────────────────────
const HeroCarousel: React.FC<{
  regionLabel: string;
  regionFlag: string;
  culturalTone: string;
  onStartCreate: () => void;
  llmProvider: string;
  ttsProvider: string;
}> = ({ regionLabel, regionFlag, culturalTone, onStartCreate, llmProvider, ttsProvider }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive(i => (i + 1) % 3), 6000);
    return () => clearInterval(timer);
  }, []);

  const banner = HERO_BANNERS[active];

  return (
    <div className="relative overflow-hidden rounded-2xl glass-elevated">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        {HERO_BANNERS.map((b, i) => (
          <img
            key={i}
            src={b.image}
            alt=""
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-700',
              i === active ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
        <div className={cn('absolute inset-0 bg-gradient-to-r', banner.gradient)} />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8 min-h-[160px] md:min-h-[200px] flex flex-col justify-between">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg">{banner.title}</h1>
          <p className="text-xs md:text-sm text-white/80 max-w-lg drop-shadow">{banner.subtitle}</p>

          {/* Region badges — desktop */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/10 backdrop-blur-md border border-white/20 text-white">
              <Globe className="w-3 h-3" /> {regionFlag} {regionLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/10 backdrop-blur-md border border-white/10 text-white/70">
              <Cpu className="w-3 h-3" /> LLM: {llmProvider}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/10 backdrop-blur-md border border-white/10 text-white/70">
              <Languages className="w-3 h-3" /> TTS: {ttsProvider}
            </span>
            {culturalTone && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-amber-500/20 backdrop-blur-md border border-amber-400/20 text-amber-200">
                <Star className="w-3 h-3" /> {culturalTone}
              </span>
            )}
          </div>
        </div>

        {/* Bottom row: CTA + dots */}
        <div className="flex items-center justify-between mt-4">
          <Button
            onClick={onStartCreate}
            size="sm"
            className="gap-2 bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" /> Create New Content
          </Button>
          <div className="flex items-center gap-2">
            <button onClick={() => setActive(i => (i - 1 + 3) % 3)} className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50',
                  )}
                />
              ))}
            </div>
            <button onClick={() => setActive(i => (i + 1) % 3)} className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Workflow Step Card ───────────────────────────────────────────────────────
const WORKFLOW_TOOLTIPS: Record<number, string> = {
  1: 'CREATE: Write scripts, choose scenes, set style, select regions & languages. This is where your content journey begins.',
  2: 'PRODUCE: AI generates videos, presentations, podcasts using GPU rendering. Universal Enrichment powers every asset.',
  3: 'PUBLISH: Distribute to YouTube, LinkedIn, TikTok, Instagram. Schedule, analyze, and A/B test across all 16 regions.',
};

const WorkflowStepCard: React.FC<{
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  thumbnailSrc: string;
  gradientFrom: string;
  onClick: () => void;
}> = ({ step, icon, title, description, iconBg, thumbnailSrc, gradientFrom, onClick }) => (
  <button
    onClick={onClick}
    className="group relative rounded-2xl overflow-hidden text-left transition-all cursor-pointer glass-card hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] min-w-[220px] md:min-w-0 md:flex-1 shrink-0"
  >
    <div className="relative w-full aspect-[16/9] overflow-hidden">
      <img src={thumbnailSrc} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white uppercase tracking-widest cursor-help">Step {step}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px] text-xs">{WORKFLOW_TOOLTIPS[step] || `Step ${step} of the Cast pipeline`}</TooltipContent>
      </Tooltip>
    </div>
    <div className="relative z-10 p-3 md:p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn('w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all group-hover:scale-110', iconBg)}>
          {icon}
        </div>
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
      </div>
      <p className="text-[11px] text-muted-foreground/80 leading-relaxed line-clamp-2">{description}</p>
      <div className="mt-2 flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Get Started <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  </button>
);

// ── Stat Card tooltips ──────────────────────────────────────────────────────
const STAT_TOOLTIPS: Record<string, string> = {
  Videos: 'Total videos generated across all regions and languages. Click to view projects.',
  Projects: 'Active Cast projects. Each project can contain multiple scenes, styles, and output formats.',
  Templates: 'Reusable blueprints for quick content creation. Organized by category.',
  Languages: 'Unique languages used in your content. Cast supports 85+ languages across 16 regions.',
};

// ── Stat Card with background image ─────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  iconBg: string;
  accentColor: string;
  backgroundSrc?: string;
  onClick?: () => void;
}> = ({ icon, label, value, subtitle, trend, iconBg, accentColor, backgroundSrc, onClick }) => (
  <button
    onClick={onClick}
    className="group relative rounded-2xl text-left transition-all w-full overflow-hidden glass-card hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
  >
    {/* Background image */}
    {backgroundSrc && (
      <div className="absolute inset-0 z-0">
        <img src={backgroundSrc} alt="" className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity" loading="lazy" />
      </div>
    )}
    {/* Glow accent */}
    <div className={cn('absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-25 group-hover:opacity-45 transition-opacity', accentColor)} />
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

    <div className="relative z-10 p-3 md:p-4">
      <div className="flex items-start justify-between">
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider cursor-help flex items-center gap-1">{label} <Info className="w-2.5 h-2.5 opacity-40" /></p>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-xs">{STAT_TOOLTIPS[label] || `${label} metric`}</TooltipContent>
          </Tooltip>
          <p className="text-xl md:text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn('p-2 md:p-2.5 rounded-xl backdrop-blur-md transition-all group-hover:scale-110 group-hover:shadow-lg border', iconBg)}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-medium text-emerald-400">{trend}</span>
        </div>
      )}
    </div>
  </button>
);

// ── Video Thumbnail with broken-image fallback ──────────────────────────────
const VideoThumbCard: React.FC<{
  title: string;
  thumbnail?: string | null;
  status: string;
  language?: string | null;
  duration?: number | null;
  time: string;
}> = ({ title, thumbnail, status, language, duration, time }) => {
  const [imgError, setImgError] = useState(false);

  const statusStyles = status === 'completed'
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : status === 'processing'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-red-500/20 text-red-300 border-red-500/30';

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] relative">
      <div className="absolute inset-0 backdrop-blur-xl bg-card/40" />
      <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-purple-600/10 overflow-hidden">
        {thumbnail && !imgError ? (
          <img
            src={thumbnail}
            alt={title || 'Video'}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 via-purple-600/10 to-pink-500/10">
            <div className="w-12 h-12 rounded-xl bg-white/[0.06] backdrop-blur-md flex items-center justify-center border border-white/[0.1]">
              <Film className="w-5 h-5 text-muted-foreground/40" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
        </div>
        {duration && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-medium text-white">
            {formatDuration(duration)}
          </div>
        )}
        <div className={cn('absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-semibold capitalize backdrop-blur-md', statusStyles)}>
          {status}
        </div>
      </div>
      <div className="relative z-10 p-2.5">
        <p className="text-xs font-semibold text-foreground truncate">{title || 'Untitled Video'}</p>
        <div className="flex items-center gap-2 mt-1">
          {language && <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Globe className="w-2.5 h-2.5" /> {language}</span>}
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
      </div>
    </div>
  );
};

// ── Navigation Card with thumbnail ──────────────────────────────────────────
const NavCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
  countLabel?: string;
  iconBg: string;
  accentColor: string;
  thumbnailSrc?: string;
  onClick: () => void;
}> = ({ icon, title, description, count, countLabel, iconBg, accentColor, thumbnailSrc, onClick }) => (
  <button
    onClick={onClick}
    className="group relative rounded-2xl text-left transition-all w-full overflow-hidden glass-card hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
  >
    {thumbnailSrc && (
      <div className="relative w-full aspect-[2/1] overflow-hidden">
        <img src={thumbnailSrc} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/40 to-transparent" />
      </div>
    )}
    <div className={cn('absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity', accentColor)} />
    <div className="relative z-10 p-3 md:p-4">
      <div className="flex items-start gap-3">
        <div className={cn('w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0 transition-all group-hover:scale-110 group-hover:shadow-lg border', iconBg)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">{title}</h4>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5 line-clamp-1">{description}</p>
          {count !== undefined && (
            <div className="mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border backdrop-blur-sm bg-white/[0.04] border-white/[0.08] text-muted-foreground">
                {count} {countLabel || 'items'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  </button>
);

// ── Region Zones Bar ────────────────────────────────────────────────────────
const RegionZonesBar: React.FC<{ currentRegion: string }> = ({ currentRegion }) => {
  const topRegions = ['nam', 'europe', 'mena', 'india', 'cjk', 'sea', 'africa', 'latam'];
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {topRegions.map(key => {
        const info = REGION_GROUP_DISPLAY[key];
        if (!info) return null;
        const isActive = currentRegion.toLowerCase().includes(key) ||
          (key === 'nam' && currentRegion.startsWith('NAM')) ||
          (key === 'europe' && currentRegion.startsWith('EU')) ||
          (key === 'mena' && currentRegion.startsWith('MENA')) ||
          (key === 'india' && currentRegion.startsWith('INDIA')) ||
          (key === 'cjk' && currentRegion.startsWith('CJK')) ||
          (key === 'sea' && currentRegion.startsWith('SEA')) ||
          (key === 'africa' && currentRegion.startsWith('AFRICA')) ||
          (key === 'latam' && currentRegion.startsWith('LATAM'));
        return (
          <div
            key={key}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border backdrop-blur-sm transition-all shrink-0',
              isActive
                ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_8px_rgba(var(--primary-rgb,99,102,241),0.2)]'
                : 'bg-white/[0.03] border-white/[0.06] text-muted-foreground/50 hover:bg-white/[0.06] hover:text-muted-foreground',
            )}
          >
            <span>{info.icon}</span>
            <span>{info.label}</span>
          </div>
        );
      })}
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-white/[0.03] border border-white/[0.06] text-muted-foreground/40 shrink-0">
        +8 more
      </div>
    </div>
  );
};

// ── Workflow Auto-Scroll Section ─────────────────────────────────────────────
const WorkflowAutoScroll: React.FC<{ onStartCreate: () => void }> = ({ onStartCreate }) => {
  const { scrollRef, onMouseEnter, onMouseLeave } = useAutoScrollOnHover({ speed: 0.8 });
  return (
    <div
      ref={scrollRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="flex gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth cursor-default"
    >
      <WorkflowStepCard step={1} icon={<Wand2 className="w-4 h-4 text-purple-300" />} title="Create" description="Write scripts, choose output format, set your creative direction with AI" iconBg="bg-purple-500/15 border-purple-500/25" thumbnailSrc={castWorkflowCreate} gradientFrom="from-purple-500/20" onClick={onStartCreate} />
      <WorkflowStepCard step={2} icon={<Clapperboard className="w-4 h-4 text-blue-300" />} title="Produce" description="Generate videos, presentations, podcasts with regional AI intelligence" iconBg="bg-blue-500/15 border-blue-500/25" thumbnailSrc={castWorkflowProduce} gradientFrom="from-blue-500/20" onClick={onStartCreate} />
      <WorkflowStepCard step={3} icon={<Send className="w-4 h-4 text-emerald-300" />} title="Publish" description="Distribute content to platforms, track analytics across all regions" iconBg="bg-emerald-500/15 border-emerald-500/25" thumbnailSrc={castWorkflowPublish} gradientFrom="from-emerald-500/20" onClick={onStartCreate} />
    </div>
  );
};

// ── Quick Access with auto-scroll on hover ───────────────────────────────────
const QuickAccessSection: React.FC<{
  totalProjects: number;
  totalTemplates: number;
  totalStyles: number;
  videoStats: any;
  onNavigate: (view: NavView) => void;
}> = ({ totalProjects, totalTemplates, totalStyles, videoStats, onNavigate }) => {
  const { scrollRef, onMouseEnter, onMouseLeave } = useAutoScrollOnHover({ speed: 1.0 });

  const items = [
    { icon: <FolderOpen className="w-4 h-4 text-blue-300" />, title: 'Projects', desc: 'Manage video projects', count: totalProjects, countLabel: 'projects', iconBg: 'bg-blue-500/15 border-blue-500/25', accent: 'bg-blue-500', thumb: castNavProjects, nav: 'projects' as NavView },
    { icon: <LayoutTemplate className="w-4 h-4 text-purple-300" />, title: 'Templates', desc: 'Browse blueprints', count: totalTemplates, countLabel: 'blueprints', iconBg: 'bg-purple-500/15 border-purple-500/25', accent: 'bg-purple-500', thumb: castNavTemplates, nav: 'templates' as NavView },
    { icon: <Image className="w-4 h-4 text-emerald-300" />, title: 'Assets', desc: 'Images, video & audio', count: totalStyles, countLabel: 'styles', iconBg: 'bg-emerald-500/15 border-emerald-500/25', accent: 'bg-emerald-500', thumb: castNavAssets, nav: 'assets' as NavView },
    { icon: <Palette className="w-4 h-4 text-amber-300" />, title: 'Brand Kit', desc: 'Colors, fonts & logos', iconBg: 'bg-amber-500/15 border-amber-500/25', accent: 'bg-amber-500', thumb: castNavBrand, nav: 'brand-kit' as NavView },
    { icon: <BarChart3 className="w-4 h-4 text-indigo-300" />, title: 'Analytics', desc: 'Performance metrics', count: videoStats?.completed || 0, countLabel: 'videos', iconBg: 'bg-indigo-500/15 border-indigo-500/25', accent: 'bg-indigo-500', thumb: castNavAnalytics, nav: 'analytics' as NavView },
    { icon: <Settings className="w-4 h-4 text-slate-300" />, title: 'Settings', desc: 'Integrations & prefs', iconBg: 'bg-slate-500/15 border-slate-500/25', accent: 'bg-slate-500', thumb: castNavSettings, nav: 'settings' as NavView },
  ];

  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-3">
        <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
          <Boxes className="w-3 h-3" /> Quick Access
        </h3>
        <span className="text-[9px] text-muted-foreground/40 italic">hover to scroll →</span>
      </div>
      <div
        ref={scrollRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth cursor-default"
      >
        {items.map(item => (
          <div key={item.title} className="min-w-[200px] w-[200px] shrink-0">
            <NavCard
              icon={item.icon}
              title={item.title}
              description={item.desc}
              count={item.count}
              countLabel={item.countLabel}
              iconBg={item.iconBg}
              accentColor={item.accent}
              thumbnailSrc={item.thumb}
              onClick={() => onNavigate(item.nav)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Content Pipeline — Created / Produced / Published ───────────────────────
const PIPELINE_STAGES = [
  { key: 'created', label: 'Created', icon: <PenTool className="w-3.5 h-3.5" />, color: 'text-purple-300', bg: 'bg-purple-500/10 border-purple-500/20' },
  { key: 'produced', label: 'Produced', icon: <Clapperboard className="w-3.5 h-3.5" />, color: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'published', label: 'Published', icon: <Share2 className="w-3.5 h-3.5" />, color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
] as const;

const CONTENT_TYPE_META: Record<string, { icon: React.ReactNode; label: string }> = {
  video: { icon: <Video className="w-3 h-3" />, label: 'Video' },
  full_demo_production: { icon: <Film className="w-3 h-3" />, label: 'Full Demo' },
  script: { icon: <FileText className="w-3 h-3" />, label: 'Script' },
  tts: { icon: <Headphones className="w-3 h-3" />, label: 'TTS Audio' },
  audio: { icon: <Music className="w-3 h-3" />, label: 'Audio' },
  presentation: { icon: <Presentation className="w-3 h-3" />, label: 'PPT' },
  podcast: { icon: <Mic className="w-3 h-3" />, label: 'Podcast' },
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <Youtube className="w-3 h-3" />,
  linkedin: <Linkedin className="w-3 h-3" />,
  instagram: <Instagram className="w-3 h-3" />,
  tiktok: <Share2 className="w-3 h-3" />,
};

const ContentPipelineSection: React.FC<{
  projects: any;
  videoStats: any;
  onNavigate: (view: NavView) => void;
  onStartCreate: () => void;
}> = ({ projects, videoStats, onNavigate, onStartCreate }) => {
  const allProjects = projects.projects || [];
  const { scrollRef, onMouseEnter, onMouseLeave } = useAutoScrollOnHover({ speed: 1.0 });

  const pipelineItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      stage: 'created' | 'produced' | 'published';
      contentType: string;
      platforms?: string[];
      time: string;
      status: string;
      thumbnail?: string | null;
    }> = [];

    allProjects.forEach((p: any) => {
      const stage = p.final_video_url ? 'published' : p.status === 'completed' ? 'produced' : 'created';
      items.push({
        id: p.id,
        title: p.title || 'Untitled Project',
        stage,
        contentType: p.content_type || 'video',
        platforms: p.secondary_platforms || [],
        time: p.updated_at || p.created_at,
        status: p.status || 'draft',
        thumbnail: p.thumbnail_url || null,
      });
    });

    (videoStats?.recentVideos || []).forEach((v: any) => {
      if (items.some(i => i.title === v.title)) return;
      items.push({
        id: v.id,
        title: v.title || 'Untitled Video',
        stage: v.generation_status === 'completed' ? 'produced' : 'created',
        contentType: v.content_type || 'video',
        time: v.created_at,
        status: v.generation_status || 'pending',
        thumbnail: v.thumbnail_url || null,
      });
    });

    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  }, [allProjects, videoStats?.recentVideos]);

  const stageCounts = useMemo(() => ({
    created: pipelineItems.filter(i => i.stage === 'created').length,
    produced: pipelineItems.filter(i => i.stage === 'produced').length,
    published: pipelineItems.filter(i => i.stage === 'published').length,
  }), [pipelineItems]);

  // Stage-specific background images for empty thumbnail fallback
  const STAGE_BG: Record<string, string> = {
    created: castWorkflowCreate,
    produced: castWorkflowProduce,
    published: castWorkflowPublish,
  };

  return (
    <div className="relative glass-card rounded-2xl overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src={castHero2} alt="" className="w-full h-full object-cover opacity-[0.08]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-br from-card/90 via-card/80 to-card/70" />
      </div>
      <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-15 bg-blue-500" />

      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3 h-3" /> Content Pipeline
            <Tooltip>
              <TooltipTrigger asChild><HelpCircle className="w-3 h-3 opacity-40 cursor-help" /></TooltipTrigger>
              <TooltipContent side="right" className="max-w-[240px] text-xs">Track content through 3 stages: Created (scripted & configured), Produced (AI-generated & rendered), Published (distributed to platforms). Each piece moves through the full pipeline.</TooltipContent>
            </Tooltip>
          </h3>
          <div className="flex items-center gap-2">
            {PIPELINE_STAGES.map(s => (
              <span key={s.key} className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border', s.bg)}>
                {s.icon} {stageCounts[s.key as keyof typeof stageCounts]} {s.label}
              </span>
            ))}
            <span className="text-[9px] text-muted-foreground/40 italic hidden sm:inline">hover to scroll →</span>
          </div>
        </div>

        {pipelineItems.length > 0 ? (
          <div
            ref={scrollRef}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth cursor-default"
          >
            {pipelineItems.map(item => {
              const typeMeta = CONTENT_TYPE_META[item.contentType] || CONTENT_TYPE_META.video;
              const stageInfo = PIPELINE_STAGES.find(s => s.key === item.stage)!;
              const thumbSrc = item.thumbnail || STAGE_BG[item.stage] || castWorkflowCreate;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate('projects')}
                  className="group glass-card rounded-xl overflow-hidden text-left hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all min-w-[200px] w-[200px] shrink-0"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden">
                    <img src={thumbSrc} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = STAGE_BG[item.stage] || castWorkflowCreate; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
                    <div className={cn('absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-semibold border backdrop-blur-md', stageInfo.bg)}>
                      {stageInfo.icon} {stageInfo.label}
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-[9px] text-white/80">
                      {typeMeta.icon} {typeMeta.label}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-semibold text-foreground truncate">{item.title}</p>
                    {item.platforms && item.platforms.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {item.platforms.slice(0, 3).map((p: string) => (
                          <span key={p} className="w-4 h-4 rounded bg-white/[0.04] flex items-center justify-center text-muted-foreground/40">
                            {PLATFORM_ICONS[p] || <Share2 className="w-2.5 h-2.5" />}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[9px] text-muted-foreground/40 mt-1">
                      {item.time ? formatDistanceToNow(new Date(item.time), { addSuffix: true }) : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <Layers className="w-6 h-6 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground/60">No content in pipeline yet</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs gap-1.5" onClick={onStartCreate}>
              <Sparkles className="w-3 h-3" /> Create First Content
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export function CastDashboardOverview({ onNavigate, onStartCreate, className }: CastDashboardOverviewProps) {
  const projects = useCastProjects();
  const blueprints = useVideoBlueprints();
  const registry = useCastContentRegistry();
  const production = useCastProduction();
  const { data: videoStats } = useVideoStats();

  const regional = useRegionalLanguage();
  const regionCode = useMemo(() => {
    const bundle = regional.currentBundle;
    if (!bundle) return 'NAM_US';
    const bundleToRegion: Record<string, string> = {
      english_core: 'NAM_US', europe: 'EU_DACH', asia: 'CJK_JP',
      india: 'INDIA_PAN', mea: 'MENA_GULF', africa: 'AFRICA_EAST', latam: 'LATAM_BR',
    };
    return bundleToRegion[bundle.id] || 'NAM_US';
  }, [regional.currentBundle]);

  const currentSubRegion = useMemo(() => {
    for (const group of Object.values(REGIONAL_SUB_REGIONS)) {
      const found = group.find(sr => sr.code === regionCode);
      if (found) return found;
    }
    return { code: regionCode, label: 'Global', nativeLabel: 'Global', flag: '🌐', culturalTone: 'innovative-global', emotionalRegister: 'aspirational' };
  }, [regionCode]);

  const activeProjects = projects.getActiveProjects?.() || [];
  const totalProjects = projects.projects?.length || 0;
  const totalTemplates = blueprints.blueprints?.length || 0;
  const totalFormats = registry.formats?.length || 0;
  const totalStyles = registry.visualStyles?.length || 0;
  const totalCategories = registry.categories?.length || 0;

  return (
    <TooltipProvider delayDuration={200}>
    <div className={cn('space-y-4 md:space-y-6 p-3 md:p-5', className)}>

      {/* ── 3-Banner Hero Carousel ─────────────────────────────────────── */}
      <HeroCarousel
        regionLabel={currentSubRegion.label}
        regionFlag={currentSubRegion.flag}
        culturalTone={currentSubRegion.culturalTone}
        onStartCreate={onStartCreate}
        llmProvider={regional.llmProvider || 'Claude'}
        ttsProvider={regional.ttsProvider || 'Azure Neural'}
      />

      {/* ── EP04 Quick Access — navigate directly to production page ───── */}
      {(() => {
        const ep04Project = (projects.projects || []).find(
          (p: any) => p.style_intent === 'ep04-sprint-documentary' || (p.title && p.title.toLowerCase().includes('ep04'))
        );
        return (
          <button
            onClick={() => {
              const url = ep04Project ? `/ep04-production?projectId=${ep04Project.id}` : '/ep04-production';
              window.location.href = url;
            }}
            className="w-full group relative rounded-2xl overflow-hidden border border-amber-500/20 glass-card hover:border-amber-500/40 hover:shadow-lg transition-all text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-purple-500/5" />
            <div className="relative z-10 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center backdrop-blur-md shrink-0">
                <Film className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">EP04 — Sprint Documentary</p>
                <p className="text-xs text-muted-foreground">
                  {ep04Project
                    ? `Production stage: ${(ep04Project as any).production_stage?.replace(/_/g, ' ') || 'producing'} · 12 scenes · 5 voices · ~27 min`
                    : '12 scenes · 5 voices · ~27 min · Click to open production'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ep04Project && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    <Zap className="w-3 h-3" /> {(ep04Project as any).status || 'active'}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
          </button>
        );
      })()}

      {/* ── Region Zones — horizontal scroll on mobile ─────────────────── */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
            <Map className="w-3 h-3" /> Supported Regions
            <Tooltip>
              <TooltipTrigger asChild><HelpCircle className="w-3 h-3 opacity-40 cursor-help" /></TooltipTrigger>
              <TooltipContent side="right" className="max-w-[260px] text-xs">Cast supports 16 parent regions (NAM, EU, MENA, India, CJK, SEA, Africa, LATAM, and more), 62 cultural subregions, and 85+ languages. Content is automatically adapted with regional tone, cultural context, and localized voiceover.</TooltipContent>
            </Tooltip>
          </h3>
          <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">16 regions | 62 subregions | 85+ languages</span>
        </div>
        <RegionZonesBar currentRegion={regionCode} />
      </div>

      {/* ── Active Production Banner ──────────────────────────────────── */}
      {production.isProducing && (
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 glass-card">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
          <div className="relative z-10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center backdrop-blur-md">
                <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Production in Progress</p>
                <p className="text-xs text-muted-foreground">{production.state.currentTask || 'Processing...'}</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{production.state.progress}%</p>
            </div>
            <Progress value={production.state.progress} className="mt-3 h-2 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-400" />
          </div>
        </div>
      )}

      {/* ── Workflow Steps — horizontal scroll on mobile ──────────────── */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-1 mb-3 flex items-center gap-1.5">
          <Radar className="w-3 h-3" /> Your Workflow
          <Tooltip>
            <TooltipTrigger asChild><HelpCircle className="w-3 h-3 opacity-40 cursor-help" /></TooltipTrigger>
            <TooltipContent side="right" className="max-w-[240px] text-xs">The 3-step Cast pipeline: CREATE your content (scripts, scenes, styles) → PRODUCE with AI (GPU rendering, TTS, captions) → PUBLISH everywhere (schedule, distribute, analyze).</TooltipContent>
          </Tooltip>
        </h3>
        <WorkflowAutoScroll onStartCreate={onStartCreate} />
      </div>

      {/* ── Content Categories — browse all verticals ──────────────── */}
      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
            <Boxes className="w-3 h-3" /> Content Categories
            <Tooltip>
              <TooltipTrigger asChild><HelpCircle className="w-3 h-3 opacity-40 cursor-help" /></TooltipTrigger>
              <TooltipContent side="right" className="max-w-[260px] text-xs">Browse all content verticals — from Healthcare and Education to Celebrations and Media. Click any category to jump directly into the Create wizard with it pre-selected.</TooltipContent>
            </Tooltip>
          </h3>
          <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">{totalCategories} categories | {totalFormats} formats</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {(registry.categories || []).map((cat) => {
            const IconComp = (cat.icon && (LucideIcons as any)[cat.icon]) || Folder;
            const formatCount = registry.getFormatsForCategory(cat.id)?.length || 0;
            return (
              <button
                key={cat.id}
                onClick={() => onStartCreate(cat.id)}
                className="group flex items-start gap-2.5 p-3 rounded-xl glass-card border border-white/[0.06] hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', cat.color ? 'bg-opacity-15' : 'bg-primary/15')}>
                  <IconComp className={cn('w-4 h-4', cat.color || 'text-primary')} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{cat.label}</p>
                  {cat.description && (
                    <p className="text-[9px] text-muted-foreground/60 line-clamp-2 mt-0.5">{cat.description}</p>
                  )}
                  <p className="text-[9px] text-muted-foreground/40 mt-1">{formatCount} format{formatCount !== 1 ? 's' : ''}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Formats — output types available ──────────────── */}
      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3 h-3" /> Content Formats
            <Tooltip>
              <TooltipTrigger asChild><HelpCircle className="w-3 h-3 opacity-40 cursor-help" /></TooltipTrigger>
              <TooltipContent side="right" className="max-w-[260px] text-xs">Available output formats — Video, Podcast, Presentation, Webcast, Celebration formats, and more. Each format has specialized editors and production pipelines.</TooltipContent>
            </Tooltip>
          </h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible md:pb-0">
          {(registry.formats || []).map((fmt) => {
            const FmtIcon = (fmt.icon && (LucideIcons as any)[fmt.icon]) || FileText;
            return (
              <button
                key={fmt.id}
                onClick={() => onStartCreate(undefined, fmt.id)}
                className="group min-w-[140px] md:min-w-0 flex items-center gap-2 p-2.5 rounded-xl glass-card border border-white/[0.06] hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
              >
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', fmt.color ? 'bg-opacity-15' : 'bg-primary/10')}>
                  <FmtIcon className={cn('w-3.5 h-3.5', fmt.color || 'text-primary')} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-foreground truncate group-hover:text-primary transition-colors">{fmt.label}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {fmt.requires_tts && <span className="text-[8px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-400">TTS</span>}
                    {fmt.requires_video && <span className="text-[8px] px-1 py-0.5 rounded bg-purple-500/10 text-purple-400">Video</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KPI Stats — horizontal scroll on mobile, 4-col on desktop ── */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
        <StatCard
          icon={<Video className="w-4 h-4 text-primary" />}
          label="Videos"
          value={videoStats?.total || 0}
          subtitle={`${videoStats?.completed || 0} completed`}
          trend={videoStats?.successRate ? `${videoStats.successRate}% success` : undefined}
          iconBg="bg-primary/15 border-primary/25"
          accentColor="bg-primary"
          backgroundSrc={castWorkflowProduce}
          onClick={() => onNavigate('projects')}
        />
        <StatCard
          icon={<FolderOpen className="w-4 h-4 text-blue-300" />}
          label="Projects"
          value={activeProjects.length}
          subtitle={`${totalProjects} total`}
          iconBg="bg-blue-500/15 border-blue-500/25"
          accentColor="bg-blue-500"
          backgroundSrc={castNavProjects}
          onClick={() => onNavigate('projects')}
        />
        <StatCard
          icon={<LayoutTemplate className="w-4 h-4 text-purple-300" />}
          label="Templates"
          value={totalTemplates}
          subtitle={`${Object.keys(blueprints.blueprintsByCategory || {}).length} categories`}
          iconBg="bg-purple-500/15 border-purple-500/25"
          accentColor="bg-purple-500"
          backgroundSrc={castNavTemplates}
          onClick={() => onNavigate('templates')}
        />
        <StatCard
          icon={<Globe className="w-4 h-4 text-cyan-300" />}
          label="Languages"
          value={videoStats?.languageCount || 0}
          subtitle={`${totalFormats} formats`}
          iconBg="bg-cyan-500/15 border-cyan-500/25"
          accentColor="bg-cyan-500"
          backgroundSrc={castHero3}
          onClick={() => onNavigate('analytics')}
        />
      </div>

      {/* ── Recent Videos ─────────────────────────────────────────────── */}
      {videoStats?.recentVideos && videoStats.recentVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
              <Film className="w-3 h-3" /> Recent Videos
            </h3>
            <button onClick={() => onNavigate('projects')} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0">
            {videoStats.recentVideos.map((video: any) => (
              <div key={video.id} className="min-w-[180px] md:min-w-0">
                <VideoThumbCard
                  title={video.title}
                  thumbnail={video.thumbnail_url}
                  status={video.generation_status || 'pending'}
                  language={video.language_name}
                  duration={video.duration_seconds}
                  time={video.created_at ? formatDistanceToNow(new Date(video.created_at), { addSuffix: true }) : ''}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Access — horizontal scroll with arrows ───────────────── */}
      <QuickAccessSection
        totalProjects={totalProjects}
        totalTemplates={totalTemplates}
        totalStyles={totalStyles}
        videoStats={videoStats}
        onNavigate={onNavigate}
      />

      {/* ── Content Pipeline — what was created, produced, published ──── */}
      <ContentPipelineSection
        projects={projects}
        videoStats={videoStats}
        onNavigate={onNavigate}
        onStartCreate={onStartCreate}
      />

      {/* ── Bottom Row: AI Engine (compact) + Activity + Templates ────── */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* AI Engine — compact card */}
        <div className="glass-card rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 z-0">
            <img src={castAiEngine} alt="" className="w-full h-full object-cover opacity-20" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/65 to-card/55" />
          </div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full blur-2xl opacity-20 bg-purple-500" />
          <div className="relative z-10 p-3">
            <h4 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Cpu className="w-3 h-3" /> AI Engine
              <Tooltip>
                <TooltipTrigger asChild><HelpCircle className="w-3 h-3 opacity-40 cursor-help" /></TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-xs">19+ AI providers across 4 zones: Claude Zone, Alibaba Zone, Gemini Zone, and Fallback Zone (GPT-4o). Auto-routed by region and language for optimal quality.</TooltipContent>
              </Tooltip>
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: <Cpu className="w-3 h-3 text-purple-300" />, label: 'LLM', value: regional.llmProvider || 'Claude' },
                { icon: <Languages className="w-3 h-3 text-blue-300" />, label: 'TTS', value: regional.ttsProvider || 'Azure' },
                { icon: <FileVideo className="w-3 h-3 text-emerald-300" />, label: 'Formats', value: totalFormats },
                { icon: <Palette className="w-3 h-3 text-amber-300" />, label: 'Styles', value: totalStyles },
                { icon: <Layers className="w-3 h-3 text-cyan-300" />, label: 'Categories', value: totalCategories },
                { icon: <Zap className="w-3 h-3 text-pink-300" />, label: 'Capabilities', value: registry.productionCapabilities?.length || 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  {item.icon}
                  <span className="text-[10px] text-muted-foreground/60">{item.label}</span>
                  <span className="text-[10px] font-bold text-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed — compact */}
        <div className="glass-card rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 z-0">
            <img src={castNavAnalytics} alt="" className="w-full h-full object-cover opacity-15" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-br from-card/85 via-card/70 to-card/55" />
          </div>
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 bg-emerald-500" />
          <div className="relative z-10 p-3">
            <h4 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Activity Feed
              <Tooltip>
                <TooltipTrigger asChild><HelpCircle className="w-3 h-3 opacity-40 cursor-help" /></TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-xs">Real-time feed of your recent video generations, completions, and production activity.</TooltipContent>
              </Tooltip>
            </h4>
            {videoStats?.recentVideos && videoStats.recentVideos.length > 0 ? (
              <ScrollArea className="h-[160px]">
                <div className="space-y-1.5">
                  {videoStats.recentVideos.slice(0, 5).map((video: any) => {
                    const dotColor = video.generation_status === 'completed' ? 'bg-emerald-400' : video.generation_status === 'processing' ? 'bg-amber-400' : 'bg-red-400';
                    return (
                      <div key={video.id} className="flex items-center gap-2 py-1 px-1">
                        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
                        <p className="text-[11px] text-foreground truncate flex-1">{video.title || 'Untitled'}</p>
                        <span className="text-[9px] text-muted-foreground/50 shrink-0">
                          {video.created_at ? formatDistanceToNow(new Date(video.created_at), { addSuffix: true }) : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <MonitorPlay className="w-5 h-5 opacity-30 mb-2" />
                <p className="text-[11px]">No activity yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Templates — new vs existing */}
        <div className="glass-card rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 z-0">
            <img src={castNavTemplates} alt="" className="w-full h-full object-cover opacity-15" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-br from-card/85 via-card/70 to-card/55" />
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 bg-purple-500" />
          <div className="relative z-10 p-3">
            <h4 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <LayoutTemplate className="w-3 h-3" /> Templates
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <LayoutTemplate className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{totalTemplates}</p>
                    <p className="text-[9px] text-muted-foreground/60">Existing Templates</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1 text-primary"
                  onClick={() => onNavigate('templates')}
                >
                  Browse <ArrowRight className="w-2.5 h-2.5" />
                </Button>
              </div>
              <button
                onClick={() => onStartCreate()}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">Create New</p>
                  <p className="text-[9px] text-muted-foreground/60">Start from scratch or AI</p>
                </div>
              </button>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {Object.entries(blueprints.blueprintsByCategory || {}).slice(0, 4).map(([cat, items]) => (
                  <div key={cat} className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-[10px] font-medium text-foreground truncate capitalize">{cat}</p>
                    <p className="text-[9px] text-muted-foreground/50">{(items as any[]).length} items</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}

export default CastDashboardOverview;
