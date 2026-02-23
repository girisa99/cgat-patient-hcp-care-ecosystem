/**
 * CastDashboardOverview — Glassmorphic + AI Thumbnail + Region-Aware Dashboard
 *
 * Features:
 * - LiquidGlass + glass-card/glass-panel CSS for real glassmorphism with backdrop-blur
 * - AI-powered thumbnail generation via core engine (Gemini 2 Pro / WanX / FLUX)
 * - Region/subregion-aware: adapts visuals, icons, hero content per user's region
 * - Supports all 16 parent regions, 56 zones via useRegionalLanguage
 * - Workflow visualization: Create -> Produce -> Publish with glassmorphic step cards
 * - Provider-routed image generation: CJK→Alibaba, SEA/India→Gemini, Western→Gemini
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjects } from '@/hooks/useCastProjects';
import { useVideoBlueprints } from '@/hooks/useVideoBlueprints';
import { useCastContentRegistry } from '@/hooks/useCastContentRegistry';
import { useCastProduction } from '@/hooks/useCastProduction';
import { useRegionalLanguage } from '@/hooks/useRegionalLanguage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Video, FolderOpen, LayoutTemplate, Package, Palette, BarChart3,
  Settings, Sparkles, TrendingUp, Globe, Zap, CheckCircle2,
  Clock, Play, ArrowRight, Layers, Film, Users, DollarSign,
  Activity, Shield, ChevronRight, Star, Eye, Share2,
  Clapperboard, Wand2, Send, MonitorPlay, FileVideo, Image,
  Cpu, Languages, Map, Radar, Boxes, PanelTop,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  generateDashboardThumbnail,
  getRegionVisualStyle,
  REGION_GROUP_DISPLAY,
  type DashboardSection,
  type ThumbnailResult,
} from '@/services/production/dashboardThumbnailService';
import { REGIONAL_SUB_REGIONS } from '@/config/regionalSubRegions';

type NavView = 'workspace' | 'projects' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings';

interface CastDashboardOverviewProps {
  onNavigate: (view: NavView) => void;
  onStartCreate: () => void;
  className?: string;
}

// ── Video stats + thumbnails from database ──────────────────────────────────
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
      const processing = videos.filter(v => v.generation_status === 'processing').length;
      const failed = videos.filter(v => v.generation_status === 'failed').length;
      const languages = new Set(videos.map(v => v.language_name).filter(Boolean));
      const recentVideos = videos.slice(0, 6);
      return {
        total: videos.length,
        completed,
        processing,
        failed,
        languageCount: languages.size,
        successRate: videos.length > 0 ? Math.round((completed / videos.length) * 100) : 0,
        recentVideos,
      };
    },
    staleTime: 30000,
  });
}

// ── AI Thumbnail hook — generates region-aware thumbnails via core engine ────
function useAIThumbnail(section: DashboardSection, regionCode: string) {
  return useQuery({
    queryKey: ['ai-thumbnail', section, regionCode],
    queryFn: () => generateDashboardThumbnail(section, regionCode),
    staleTime: 1000 * 60 * 30, // 30 min cache
    retry: 1,
    enabled: !!regionCode,
  });
}

// ── Glassmorphic Hero Banner with region-aware AI thumbnail ─────────────────
const HeroBanner: React.FC<{
  regionCode: string;
  regionLabel: string;
  regionFlag: string;
  culturalTone: string;
  onStartCreate: () => void;
  llmProvider: string;
  ttsProvider: string;
}> = ({ regionCode, regionLabel, regionFlag, culturalTone, onStartCreate, llmProvider, ttsProvider }) => {
  const { data: heroThumb } = useAIThumbnail('hero', regionCode);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background — AI-generated or gradient+SVG fallback */}
      <div className="absolute inset-0 z-0">
        {heroThumb?.imageUrl ? (
          <img
            src={heroThumb.imageUrl}
            alt="AI-generated hero"
            className="w-full h-full object-cover opacity-30 blur-sm scale-105"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br', heroThumb?.gradient || 'from-primary/20 via-purple-600/15 to-pink-500/10')} />
        )}
        {/* SVG pattern overlay */}
        {heroThumb?.svgPattern && (
          <div
            className="absolute inset-0 opacity-60"
            style={{ backgroundImage: heroThumb.svgPattern, backgroundRepeat: 'repeat' }}
          />
        )}
        {/* Glass frost overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/65 to-background/45 backdrop-blur-xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-primary/25">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Genie Cast Studio</h1>
              <p className="text-xs text-muted-foreground">AI-powered content production — Video, PPT, Scripts, Podcasts with regional intelligence</p>
            </div>
          </div>

          {/* Region context badge */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <div className="glass-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-primary/20">
              <Globe className="w-3 h-3 text-primary" />
              <span className="text-primary">{regionFlag} {regionLabel}</span>
            </div>
            <div className="glass-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-muted-foreground/10">
              <Cpu className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">LLM: {llmProvider}</span>
            </div>
            <div className="glass-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-muted-foreground/10">
              <Languages className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">TTS: {ttsProvider}</span>
            </div>
            {culturalTone && (
              <div className="glass-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-amber-500/20">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300/80">{culturalTone}</span>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onStartCreate}
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary via-purple-600 to-pink-500 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Create New Content
        </Button>
      </div>
    </div>
  );
};

// ── Glassmorphic Workflow Step with AI thumbnail background ──────────────────
const WorkflowStepCard: React.FC<{
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  glowColor: string;
  gradientFrom: string;
  gradientTo: string;
  section: DashboardSection;
  regionCode: string;
  onClick: () => void;
  isLast?: boolean;
}> = ({ step, icon, title, description, iconBg, glowColor, gradientFrom, gradientTo, section, regionCode, onClick, isLast }) => {
  const { data: thumb } = useAIThumbnail(section, regionCode);

  return (
    <div className="flex items-start gap-3 flex-1 min-w-[200px]">
      <button
        onClick={onClick}
        className={cn(
          'group relative flex-1 rounded-2xl overflow-hidden text-left transition-all cursor-pointer',
          'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
          'border border-white/[0.08]',
        )}
      >
        {/* AI thumbnail or gradient+SVG background */}
        <div className="absolute inset-0 z-0">
          {thumb?.imageUrl ? (
            <img
              src={thumb.imageUrl}
              alt={title}
              className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity scale-110"
            />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br', thumb?.gradient || `${gradientFrom} ${gradientTo}`, !thumb?.gradient && 'opacity-30')} />
          )}
          {/* SVG pattern overlay */}
          {thumb?.svgPattern && (
            <div
              className="absolute inset-0 opacity-60"
              style={{ backgroundImage: thumb.svgPattern, backgroundRepeat: 'repeat' }}
            />
          )}
          {/* Glass frost overlay */}
          <div className="absolute inset-0 backdrop-blur-xl bg-background/60" />
        </div>

        {/* Glass glow effect */}
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'bg-gradient-to-br',
          gradientFrom, gradientTo,
          'mix-blend-soft-light',
        )} style={{ opacity: 0.05 }} />

        {/* Inner shine */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none z-[1]" />

        {/* Content */}
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-md transition-all',
              'group-hover:scale-110 group-hover:shadow-lg',
              'border',
              iconBg,
            )}>
              {icon}
            </div>
            <div>
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Step {step}</span>
              <h4 className="text-sm font-bold text-foreground">{title}</h4>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">{description}</p>
          <div className="mt-3 flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Get Started <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </button>
      {!isLast && (
        <div className="hidden lg:flex items-center self-center pt-3">
          <ArrowRight className="w-5 h-5 text-muted-foreground/20" />
        </div>
      )}
    </div>
  );
};

// ── Glassmorphic Stat Card with glow ────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  glowClass: string;
  iconBg: string;
  accentColor: string;
  onClick?: () => void;
}> = ({ icon, label, value, subtitle, trend, glowClass, iconBg, accentColor, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'group relative rounded-2xl text-left transition-all w-full overflow-hidden',
      'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
      'border border-white/[0.08]',
    )}
  >
    {/* Glass background */}
    <div className="absolute inset-0 backdrop-blur-xl bg-card/50" />
    {/* Glow accent */}
    <div className={cn(
      'absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity',
      accentColor,
    )} />
    {/* Inner shine */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none" />

    <div className="relative z-10 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn(
          'p-2.5 rounded-xl backdrop-blur-md transition-all group-hover:scale-110 group-hover:shadow-lg border',
          iconBg,
        )}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2.5">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-medium text-emerald-400">{trend}</span>
        </div>
      )}
    </div>
  </button>
);

// ── Video Thumbnail Card with glassmorphic overlay ──────────────────────────
const VideoThumbCard: React.FC<{
  title: string;
  thumbnail?: string | null;
  status: string;
  language?: string | null;
  duration?: number | null;
  time: string;
}> = ({ title, thumbnail, status, language, duration, time }) => {
  const statusStyles = status === 'completed'
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : status === 'processing'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-red-500/20 text-red-300 border-red-500/30';

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="group rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] border border-white/[0.08] relative">
      {/* Glass background */}
      <div className="absolute inset-0 backdrop-blur-xl bg-card/40" />

      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-purple-600/10 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title || 'Video'}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.06] backdrop-blur-md flex items-center justify-center border border-white/[0.1]">
              <Film className="w-5 h-5 text-muted-foreground/40" />
            </div>
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
        </div>
        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-medium text-white">
            {formatDuration(duration)}
          </div>
        )}
        {/* Status badge */}
        <div className={cn('absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-semibold capitalize backdrop-blur-md', statusStyles)}>
          {status}
        </div>
      </div>
      {/* Info */}
      <div className="relative z-10 p-2.5">
        <p className="text-xs font-semibold text-foreground truncate">{title || 'Untitled Video'}</p>
        <div className="flex items-center gap-2 mt-1">
          {language && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Globe className="w-2.5 h-2.5" /> {language}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
      </div>
    </div>
  );
};

// ── Navigation Card with AI thumbnail + glassmorphism ───────────────────────
const NavCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
  countLabel?: string;
  iconBg: string;
  accentColor: string;
  section: DashboardSection;
  regionCode: string;
  onClick: () => void;
}> = ({ icon, title, description, count, countLabel, iconBg, accentColor, section, regionCode, onClick }) => {
  const { data: thumb } = useAIThumbnail(section, regionCode);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative rounded-2xl text-left transition-all w-full overflow-hidden',
        'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
        'border border-white/[0.08]',
      )}
    >
      {/* AI thumbnail or gradient+SVG background */}
      <div className="absolute inset-0 z-0">
        {thumb?.imageUrl ? (
          <img
            src={thumb.imageUrl}
            alt={title}
            className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity"
          />
        ) : thumb?.gradient ? (
          <div className={cn('w-full h-full bg-gradient-to-br', thumb.gradient)} />
        ) : null}
        {/* SVG pattern overlay */}
        {thumb?.svgPattern && (
          <div
            className="absolute inset-0 opacity-50"
            style={{ backgroundImage: thumb.svgPattern, backgroundRepeat: 'repeat' }}
          />
        )}
        <div className="absolute inset-0 backdrop-blur-xl bg-card/60" />
      </div>

      {/* Glow orb */}
      <div className={cn(
        'absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-15 group-hover:opacity-30 transition-opacity',
        accentColor,
      )} />

      {/* Inner shine */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none z-[1]" />

      {/* Content */}
      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0',
            'transition-all group-hover:scale-110 group-hover:shadow-lg border',
            iconBg,
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">{title}</h4>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5 line-clamp-1">{description}</p>
            {count !== undefined && (
              <div className="mt-2">
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
};

// ── Region Zones Overview — shows supported regions as glass badges ─────────
const RegionZonesBar: React.FC<{ currentRegion: string }> = ({ currentRegion }) => {
  const topRegions = ['nam', 'europe', 'mena', 'india', 'cjk', 'sea', 'africa', 'latam'];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
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
              'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border backdrop-blur-sm transition-all',
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
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-white/[0.03] border border-white/[0.06] text-muted-foreground/40">
        +8 more
      </div>
    </div>
  );
};

// ── Main Dashboard ──────────────────────────────────────────────────────────
export function CastDashboardOverview({ onNavigate, onStartCreate, className }: CastDashboardOverviewProps) {
  const projects = useCastProjects();
  const blueprints = useVideoBlueprints();
  const registry = useCastContentRegistry();
  const production = useCastProduction();
  const { data: videoStats } = useVideoStats();

  // Region awareness via core engine
  const regional = useRegionalLanguage();
  const regionCode = useMemo(() => {
    // Derive region code from the current bundle/detection
    const bundle = regional.currentBundle;
    if (!bundle) return 'NAM_US';
    // Map bundle type to a default region code
    const bundleToRegion: Record<string, string> = {
      english_core: 'NAM_US',
      europe: 'EU_DACH',
      asia: 'CJK_JP',
      india: 'INDIA_PAN',
      mea: 'MENA_GULF',
      africa: 'AFRICA_EAST',
      latam: 'LATAM_BR',
    };
    return bundleToRegion[bundle.id] || 'NAM_US';
  }, [regional.currentBundle]);

  // Find current region's display info
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
    <div className={cn('space-y-6 p-5', className)}>
      {/* ── Hero Banner with Region Context ─────────────────────────────── */}
      <HeroBanner
        regionCode={regionCode}
        regionLabel={currentSubRegion.label}
        regionFlag={currentSubRegion.flag}
        culturalTone={currentSubRegion.culturalTone}
        onStartCreate={onStartCreate}
        llmProvider={regional.llmProvider || 'Claude'}
        ttsProvider={regional.ttsProvider || 'Azure Neural'}
      />

      {/* ── Region Zones Bar ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
            <Map className="w-3 h-3" /> Supported Regions
          </h3>
          <span className="text-[10px] text-muted-foreground/40">16 regions | 56+ zones | 75+ languages</span>
        </div>
        <RegionZonesBar currentRegion={regionCode} />
      </div>

      {/* ── Active Production Banner ─────────────────────────────────────── */}
      {production.isProducing && (
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/20">
          <div className="absolute inset-0 backdrop-blur-xl bg-card/50" />
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
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-400">{production.state.progress}%</p>
              </div>
            </div>
            <Progress value={production.state.progress} className="mt-3 h-2 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-400" />
          </div>
        </div>
      )}

      {/* ── Workflow Steps: Create → Produce → Publish ──────────────────── */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-1 mb-3 flex items-center gap-1.5">
          <Radar className="w-3 h-3" /> Your Workflow
        </h3>
        <div className="flex flex-col lg:flex-row gap-3">
          <WorkflowStepCard
            step={1}
            icon={<Wand2 className="w-5 h-5 text-purple-300" />}
            title="Create"
            description="Write scripts, choose output (Video, PPT, Podcast, Script), select styles and set your creative direction with AI"
            iconBg="bg-purple-500/15 border-purple-500/25"
            glowColor="purple"
            gradientFrom="from-purple-500/20"
            gradientTo="to-violet-600/10"
            section="workflow-create"
            regionCode={regionCode}
            onClick={onStartCreate}
          />
          <WorkflowStepCard
            step={2}
            icon={<Clapperboard className="w-5 h-5 text-blue-300" />}
            title="Produce"
            description="Generate videos, presentations, podcasts with AI. Apply regional intelligence and multi-language support"
            iconBg="bg-blue-500/15 border-blue-500/25"
            glowColor="blue"
            gradientFrom="from-blue-500/20"
            gradientTo="to-cyan-600/10"
            section="workflow-produce"
            regionCode={regionCode}
            onClick={onStartCreate}
          />
          <WorkflowStepCard
            step={3}
            icon={<Send className="w-5 h-5 text-emerald-300" />}
            title="Publish"
            description="Distribute content to platforms, track analytics and optimize engagement across all regions"
            iconBg="bg-emerald-500/15 border-emerald-500/25"
            glowColor="green"
            gradientFrom="from-emerald-500/20"
            gradientTo="to-green-600/10"
            section="workflow-publish"
            regionCode={regionCode}
            onClick={onStartCreate}
            isLast
          />
        </div>
      </div>

      {/* ── KPI Stats Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Video className="w-5 h-5 text-primary" />}
          label="Videos Produced"
          value={videoStats?.total || 0}
          subtitle={`${videoStats?.completed || 0} completed`}
          trend={videoStats?.successRate ? `${videoStats.successRate}% success` : undefined}
          glowClass="glass-glow-primary"
          iconBg="bg-primary/15 border-primary/25"
          accentColor="bg-primary"
          onClick={() => onNavigate('projects')}
        />
        <StatCard
          icon={<FolderOpen className="w-5 h-5 text-blue-300" />}
          label="Active Projects"
          value={activeProjects.length}
          subtitle={`${totalProjects} total projects`}
          glowClass="glass-glow-azure"
          iconBg="bg-blue-500/15 border-blue-500/25"
          accentColor="bg-blue-500"
          onClick={() => onNavigate('projects')}
        />
        <StatCard
          icon={<LayoutTemplate className="w-5 h-5 text-purple-300" />}
          label="Templates"
          value={totalTemplates}
          subtitle={`${Object.keys(blueprints.blueprintsByCategory || {}).length} categories`}
          glowClass=""
          iconBg="bg-purple-500/15 border-purple-500/25"
          accentColor="bg-purple-500"
          onClick={() => onNavigate('templates')}
        />
        <StatCard
          icon={<Globe className="w-5 h-5 text-cyan-300" />}
          label="Languages"
          value={videoStats?.languageCount || 0}
          subtitle={`${totalFormats} formats available`}
          glowClass=""
          iconBg="bg-cyan-500/15 border-cyan-500/25"
          accentColor="bg-cyan-500"
          onClick={() => onNavigate('analytics')}
        />
      </div>

      {/* ── Recent Videos with Thumbnails ─────────────────────────────────── */}
      {videoStats?.recentVideos && videoStats.recentVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
              <Film className="w-3 h-3" /> Recent Videos
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {videoStats.recentVideos.map((video: any) => (
              <VideoThumbCard
                key={video.id}
                title={video.title}
                thumbnail={video.thumbnail_url}
                status={video.generation_status || 'pending'}
                language={video.language_name}
                duration={video.duration_seconds}
                time={video.created_at ? formatDistanceToNow(new Date(video.created_at), { addSuffix: true }) : ''}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Access Navigation + Activity ─────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Navigation Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-1 flex items-center gap-1.5">
            <Boxes className="w-3 h-3" /> Quick Access
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <NavCard
              icon={<FolderOpen className="w-5 h-5 text-blue-300" />}
              title="Projects"
              description="View and manage all video projects"
              count={totalProjects}
              countLabel="projects"
              iconBg="bg-blue-500/15 border-blue-500/25"
              accentColor="bg-blue-500"
              section="projects"
              regionCode={regionCode}
              onClick={() => onNavigate('projects')}
            />
            <NavCard
              icon={<LayoutTemplate className="w-5 h-5 text-purple-300" />}
              title="Templates"
              description="Browse video blueprints and presets"
              count={totalTemplates}
              countLabel="blueprints"
              iconBg="bg-purple-500/15 border-purple-500/25"
              accentColor="bg-purple-500"
              section="templates"
              regionCode={regionCode}
              onClick={() => onNavigate('templates')}
            />
            <NavCard
              icon={<Image className="w-5 h-5 text-emerald-300" />}
              title="Asset Library"
              description="Images, videos, audio and visual styles"
              count={totalStyles}
              countLabel="visual styles"
              iconBg="bg-emerald-500/15 border-emerald-500/25"
              accentColor="bg-emerald-500"
              section="assets"
              regionCode={regionCode}
              onClick={() => onNavigate('assets')}
            />
            <NavCard
              icon={<Palette className="w-5 h-5 text-amber-300" />}
              title="Brand Kit"
              description="Brand colors, fonts, voice and logos"
              iconBg="bg-amber-500/15 border-amber-500/25"
              accentColor="bg-amber-500"
              section="brand-kit"
              regionCode={regionCode}
              onClick={() => onNavigate('brand-kit')}
            />
            <NavCard
              icon={<BarChart3 className="w-5 h-5 text-indigo-300" />}
              title="Analytics"
              description="Performance, engagement and ROI metrics"
              count={videoStats?.completed || 0}
              countLabel="completed videos"
              iconBg="bg-indigo-500/15 border-indigo-500/25"
              accentColor="bg-indigo-500"
              section="analytics"
              regionCode={regionCode}
              onClick={() => onNavigate('analytics')}
            />
            <NavCard
              icon={<Settings className="w-5 h-5 text-slate-300" />}
              title="Settings"
              description="Integrations, publishing and preferences"
              iconBg="bg-slate-500/15 border-slate-500/25"
              accentColor="bg-slate-500"
              section="settings"
              regionCode={regionCode}
              onClick={() => onNavigate('settings')}
            />
          </div>
        </div>

        {/* Right column — Activity + AI Capabilities */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-1 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Activity Feed
          </h3>

          {/* Activity panel */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
            <div className="absolute inset-0 backdrop-blur-xl bg-card/50" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 p-3">
              {videoStats?.recentVideos && videoStats.recentVideos.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {videoStats.recentVideos.map((video: any) => {
                      const statusDot = video.generation_status === 'completed'
                        ? 'bg-emerald-400' : video.generation_status === 'processing'
                          ? 'bg-amber-400' : 'bg-red-400';
                      const statusBadge = video.generation_status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : video.generation_status === 'processing'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-red-500/10 text-red-300 border-red-500/20';
                      return (
                        <div key={video.id} className="flex items-center gap-2.5 py-1.5 px-1">
                          <div className={cn('w-2 h-2 rounded-full shrink-0 shadow-lg', statusDot)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{video.title || 'Untitled'}</p>
                            <p className="text-[10px] text-muted-foreground/60">
                              {video.created_at ? formatDistanceToNow(new Date(video.created_at), { addSuffix: true }) : ''}
                            </p>
                          </div>
                          <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium border backdrop-blur-sm capitalize shrink-0', statusBadge)}>
                            {video.generation_status || 'pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.08] mb-3">
                    <MonitorPlay className="w-6 h-6 opacity-30" />
                  </div>
                  <p className="text-xs font-medium">No videos yet</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">Create your first video to see activity</p>
                  <Button variant="outline" size="sm" className="mt-3 text-xs gap-1.5 backdrop-blur-md bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]" onClick={onStartCreate}>
                    <Sparkles className="w-3 h-3" /> Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* AI Engine Capabilities */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
            <div className="absolute inset-0 backdrop-blur-xl bg-card/50" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 p-3">
              <h4 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Cpu className="w-3 h-3" /> AI Engine
              </h4>
              <div className="space-y-2">
                {[
                  { icon: <Cpu className="w-3.5 h-3.5 text-purple-300" />, label: 'LLM Provider', value: regional.llmProvider || 'Claude', bg: 'bg-purple-500/10' },
                  { icon: <Languages className="w-3.5 h-3.5 text-blue-300" />, label: 'TTS Provider', value: regional.ttsProvider || 'Azure Neural', bg: 'bg-blue-500/10' },
                  { icon: <FileVideo className="w-3.5 h-3.5 text-emerald-300" />, label: 'Video Formats', value: totalFormats, bg: 'bg-emerald-500/10' },
                  { icon: <Palette className="w-3.5 h-3.5 text-amber-300" />, label: 'Visual Styles', value: totalStyles, bg: 'bg-amber-500/10' },
                  { icon: <Layers className="w-3.5 h-3.5 text-cyan-300" />, label: 'Categories', value: totalCategories, bg: 'bg-cyan-500/10' },
                  { icon: <Zap className="w-3.5 h-3.5 text-pink-300" />, label: 'AI Capabilities', value: registry.productionCapabilities?.length || 0, bg: 'bg-pink-500/10' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/[0.06]', item.bg)}>
                      {item.icon}
                    </div>
                    <span className="text-[11px] text-muted-foreground/70 flex-1">{item.label}</span>
                    <span className="text-[11px] font-bold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CastDashboardOverview;
