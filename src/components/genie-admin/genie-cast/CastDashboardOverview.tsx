/**
 * CastDashboardOverview — Glassmorphic dashboard with KPIs, thumbnails, workflow steps
 *
 * Fixes from previous version:
 * - All Tailwind classes are explicit (no dynamic `bg-${color}` patterns)
 * - Uses codebase glass-card / glass-panel CSS classes for real glassmorphism
 * - Fetches thumbnail_url from landing_page_videos for visual previews
 * - Clear Create -> Produce -> Publish workflow step visualization
 * - Navigation cards are visually distinct and clearly clickable
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjects } from '@/hooks/useCastProjects';
import { useVideoBlueprints } from '@/hooks/useVideoBlueprints';
import { useCastContentRegistry } from '@/hooks/useCastContentRegistry';
import { useCastProduction } from '@/hooks/useCastProduction';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type NavView = 'workspace' | 'projects' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings';

interface CastDashboardOverviewProps {
  onNavigate: (view: NavView) => void;
  onStartCreate: () => void;
  className?: string;
}

const THUMB_PLACEHOLDER = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=225&fit=crop&auto=format';

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

// ── Glassmorphic Stat Card (explicit classes, no dynamic patterns) ───────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  glowClass: string;
  iconBg: string;
  onClick?: () => void;
}> = ({ icon, label, value, subtitle, trend, glowClass, iconBg, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'glass-card group relative p-4 rounded-xl text-left transition-all w-full',
      'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
      glowClass,
    )}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className={cn(
        'p-2.5 rounded-xl backdrop-blur-sm transition-transform group-hover:scale-110',
        iconBg,
      )}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp className="w-3 h-3 text-emerald-500" />
        <span className="text-[10px] font-medium text-emerald-500">{trend}</span>
      </div>
    )}
  </button>
);

// ── Workflow Step Card ───────────────────────────────────────────────────────
const WorkflowStep: React.FC<{
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  borderClass: string;
  onClick: () => void;
  isLast?: boolean;
}> = ({ step, icon, title, description, iconBg, borderClass, onClick, isLast }) => (
  <div className="flex items-start gap-3 flex-1 min-w-[180px]">
    <button
      onClick={onClick}
      className={cn(
        'glass-card group relative flex-1 p-4 rounded-xl text-left transition-all',
        'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
        borderClass,
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-110',
          iconBg,
        )}>
          {icon}
        </div>
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Step {step}</span>
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-3 flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Get Started <ArrowRight className="w-3 h-3" />
      </div>
    </button>
    {!isLast && (
      <div className="hidden lg:flex items-center self-center pt-3">
        <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
      </div>
    )}
  </div>
);

// ── Video Thumbnail Card ────────────────────────────────────────────────────
const VideoThumbCard: React.FC<{
  title: string;
  thumbnail?: string | null;
  status: string;
  language?: string | null;
  duration?: number | null;
  time: string;
}> = ({ title, thumbnail, status, language, duration, time }) => {
  const statusStyles = status === 'completed'
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : status === 'processing'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel group rounded-xl overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01]">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted/20 overflow-hidden">
        <img
          src={thumbnail || THUMB_PLACEHOLDER}
          alt={title || 'Video'}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = THUMB_PLACEHOLDER; }}
        />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
        </div>
        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-medium text-white">
            {formatDuration(duration)}
          </div>
        )}
        {/* Status badge */}
        <div className={cn('absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md border text-[9px] font-semibold capitalize backdrop-blur-sm', statusStyles)}>
          {status}
        </div>
      </div>
      {/* Info */}
      <div className="p-2.5">
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

// ── Navigation Card (glassmorphic, clearly clickable) ───────────────────────
const NavCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
  countLabel?: string;
  iconBg: string;
  glowClass: string;
  onClick: () => void;
}> = ({ icon, title, description, count, countLabel, iconBg, glowClass, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'glass-card group relative p-4 rounded-xl text-left transition-all w-full',
      'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
      glowClass,
    )}
  >
    <div className="flex items-start gap-3">
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0',
        'transition-all group-hover:scale-110 group-hover:shadow-lg',
        iconBg,
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
        {count !== undefined && (
          <div className="mt-2">
            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary/80">
              {count} {countLabel || 'items'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  </button>
);

// ── Main Dashboard ──────────────────────────────────────────────────────────
export function CastDashboardOverview({ onNavigate, onStartCreate, className }: CastDashboardOverviewProps) {
  const projects = useCastProjects();
  const blueprints = useVideoBlueprints();
  const registry = useCastContentRegistry();
  const production = useCastProduction();
  const { data: videoStats } = useVideoStats();

  const activeProjects = projects.getActiveProjects?.() || [];
  const totalProjects = projects.projects?.length || 0;
  const totalTemplates = blueprints.blueprints?.length || 0;
  const totalFormats = registry.formats?.length || 0;
  const totalStyles = registry.visualStyles?.length || 0;
  const totalCategories = registry.categories?.length || 0;

  return (
    <div className={cn('space-y-6 p-5', className)}>
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Film className="w-4 h-4 text-white" />
            </div>
            Genie Cast Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1 ml-[42px]">
            AI-powered video production with regional intelligence
          </p>
        </div>
        <Button
          onClick={onStartCreate}
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary via-purple-600 to-pink-500 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Create New Video
        </Button>
      </div>

      {/* ── Active Production Banner ─────────────────────────────────────── */}
      {production.isProducing && (
        <div className="glass-card p-4 rounded-xl border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Production in Progress</p>
              <p className="text-xs text-muted-foreground">{production.state.currentTask || 'Processing...'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-500">{production.state.progress}%</p>
            </div>
          </div>
          <Progress value={production.state.progress} className="mt-3 h-2 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-400" />
        </div>
      )}

      {/* ── Workflow Steps: Create -> Produce -> Publish ──────────────────── */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-3">
          Your Workflow
        </h3>
        <div className="flex flex-col lg:flex-row gap-3">
          <WorkflowStep
            step={1}
            icon={<Wand2 className="w-5 h-5 text-purple-400" />}
            title="Create"
            description="Write scripts, choose styles, select characters and set your creative direction"
            iconBg="bg-purple-500/15 border border-purple-500/20"
            borderClass="border-purple-500/15 hover:border-purple-500/30"
            onClick={onStartCreate}
          />
          <WorkflowStep
            step={2}
            icon={<Clapperboard className="w-5 h-5 text-blue-400" />}
            title="Produce"
            description="Generate videos with AI, apply regional intelligence and multi-language support"
            iconBg="bg-blue-500/15 border border-blue-500/20"
            borderClass="border-blue-500/15 hover:border-blue-500/30"
            onClick={onStartCreate}
          />
          <WorkflowStep
            step={3}
            icon={<Send className="w-5 h-5 text-emerald-400" />}
            title="Publish"
            description="Distribute to platforms, track analytics and optimize engagement across regions"
            iconBg="bg-emerald-500/15 border border-emerald-500/20"
            borderClass="border-emerald-500/15 hover:border-emerald-500/30"
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
          iconBg="bg-primary/15 border border-primary/20"
          onClick={() => onNavigate('projects')}
        />
        <StatCard
          icon={<FolderOpen className="w-5 h-5 text-blue-400" />}
          label="Active Projects"
          value={activeProjects.length}
          subtitle={`${totalProjects} total projects`}
          glowClass="glass-glow-azure"
          iconBg="bg-blue-500/15 border border-blue-500/20"
          onClick={() => onNavigate('projects')}
        />
        <StatCard
          icon={<LayoutTemplate className="w-5 h-5 text-purple-400" />}
          label="Templates"
          value={totalTemplates}
          subtitle={`${Object.keys(blueprints.blueprintsByCategory || {}).length} categories`}
          glowClass=""
          iconBg="bg-purple-500/15 border border-purple-500/20"
          onClick={() => onNavigate('templates')}
        />
        <StatCard
          icon={<Globe className="w-5 h-5 text-cyan-400" />}
          label="Languages"
          value={videoStats?.languageCount || 0}
          subtitle={`${totalFormats} formats available`}
          glowClass=""
          iconBg="bg-cyan-500/15 border border-cyan-500/20"
          onClick={() => onNavigate('analytics')}
        />
      </div>

      {/* ── Recent Videos with Thumbnails ─────────────────────────────────── */}
      {videoStats?.recentVideos && videoStats.recentVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Recent Videos
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

      {/* ── Quick Access Navigation + Capabilities ───────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Navigation Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Quick Access</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <NavCard
              icon={<FolderOpen className="w-5 h-5 text-blue-400" />}
              title="Projects"
              description="View and manage all video projects"
              count={totalProjects}
              countLabel="projects"
              iconBg="bg-blue-500/15 border border-blue-500/20"
              glowClass="glass-glow-azure"
              onClick={() => onNavigate('projects')}
            />
            <NavCard
              icon={<LayoutTemplate className="w-5 h-5 text-purple-400" />}
              title="Templates"
              description="Browse video blueprints and presets"
              count={totalTemplates}
              countLabel="blueprints"
              iconBg="bg-purple-500/15 border border-purple-500/20"
              glowClass="glass-glow-primary"
              onClick={() => onNavigate('templates')}
            />
            <NavCard
              icon={<Image className="w-5 h-5 text-emerald-400" />}
              title="Asset Library"
              description="Images, videos, audio and visual styles"
              count={totalStyles}
              countLabel="visual styles"
              iconBg="bg-emerald-500/15 border border-emerald-500/20"
              glowClass="glass-glow-success"
              onClick={() => onNavigate('assets')}
            />
            <NavCard
              icon={<Palette className="w-5 h-5 text-amber-400" />}
              title="Brand Kit"
              description="Brand colors, fonts, voice and logos"
              iconBg="bg-amber-500/15 border border-amber-500/20"
              glowClass="glass-glow-warning"
              onClick={() => onNavigate('brand-kit')}
            />
            <NavCard
              icon={<BarChart3 className="w-5 h-5 text-indigo-400" />}
              title="Analytics"
              description="Performance, engagement and ROI metrics"
              count={videoStats?.completed || 0}
              countLabel="completed videos"
              iconBg="bg-indigo-500/15 border border-indigo-500/20"
              glowClass=""
              onClick={() => onNavigate('analytics')}
            />
            <NavCard
              icon={<Settings className="w-5 h-5 text-slate-400" />}
              title="Settings"
              description="Integrations, publishing and preferences"
              iconBg="bg-slate-500/15 border border-slate-500/20"
              glowClass=""
              onClick={() => onNavigate('settings')}
            />
          </div>
        </div>

        {/* Right column — Activity + Capabilities */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Activity Feed</h3>
          <div className="glass-panel rounded-xl p-3">
            {videoStats?.recentVideos && videoStats.recentVideos.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {videoStats.recentVideos.map((video: any) => {
                    const statusDot = video.generation_status === 'completed'
                      ? 'bg-emerald-500' : video.generation_status === 'processing'
                        ? 'bg-amber-500' : 'bg-red-500';
                    const statusBadge = video.generation_status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                      : video.generation_status === 'processing'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                        : 'bg-red-500/15 text-red-400 border-red-500/25';
                    return (
                      <div key={video.id} className="flex items-center gap-2.5 py-1.5 px-1">
                        <div className={cn('w-2 h-2 rounded-full shrink-0', statusDot)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{video.title || 'Untitled'}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {video.created_at ? formatDistanceToNow(new Date(video.created_at), { addSuffix: true }) : ''}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn('text-[9px] h-4 capitalize shrink-0', statusBadge)}>
                          {video.generation_status || 'pending'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <div className="w-12 h-12 rounded-xl bg-muted/10 flex items-center justify-center mb-3">
                  <MonitorPlay className="w-6 h-6 opacity-30" />
                </div>
                <p className="text-xs font-medium">No videos yet</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Create your first video to see activity</p>
                <Button variant="outline" size="sm" className="mt-3 text-xs gap-1.5 glass-badge" onClick={onStartCreate}>
                  <Sparkles className="w-3 h-3" /> Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Production capabilities */}
          <div className="glass-panel rounded-xl p-3">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Platform Capabilities
            </h4>
            <div className="space-y-2">
              {[
                { icon: <FileVideo className="w-3.5 h-3.5 text-blue-400" />, label: 'Video Formats', value: totalFormats, bg: 'bg-blue-500/10' },
                { icon: <Palette className="w-3.5 h-3.5 text-purple-400" />, label: 'Visual Styles', value: totalStyles, bg: 'bg-purple-500/10' },
                { icon: <Layers className="w-3.5 h-3.5 text-emerald-400" />, label: 'Categories', value: totalCategories, bg: 'bg-emerald-500/10' },
                { icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, label: 'AI Capabilities', value: registry.productionCapabilities?.length || 0, bg: 'bg-amber-500/10' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', item.bg)}>
                    {item.icon}
                  </div>
                  <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                  <span className="text-xs font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CastDashboardOverview;
