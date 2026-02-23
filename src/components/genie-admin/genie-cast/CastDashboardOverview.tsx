/**
 * CastDashboardOverview — Impressive glassmorphic dashboard with KPIs and drill-down
 *
 * Shows at-a-glance stats for the entire Genie Cast workspace, with quick-access
 * cards that navigate to Projects, Templates, Assets, Analytics, etc.
 *
 * Data sources: useCastProjects, useVideoBlueprints, useCastContentRegistry,
 * useCastProduction, useAdvancedAnalytics (all real data, no mocks).
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
  Activity, Shield, ChevronRight, Star, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type NavView = 'workspace' | 'projects' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings';

interface CastDashboardOverviewProps {
  onNavigate: (view: NavView) => void;
  onStartCreate: () => void;
  className?: string;
}

// ── Video stats from database ────────────────────────────────────────────────
function useVideoStats() {
  return useQuery({
    queryKey: ['dashboard-video-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('id, generation_status, language_name, created_at, title')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      const videos = data || [];
      const completed = videos.filter(v => v.generation_status === 'completed').length;
      const processing = videos.filter(v => v.generation_status === 'processing').length;
      const failed = videos.filter(v => v.generation_status === 'failed').length;
      const languages = new Set(videos.map(v => v.language_name).filter(Boolean));
      const recentVideos = videos.slice(0, 5);
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

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  color: string;
}> = ({ icon, label, value, subtitle, trend, color }) => (
  <div className={cn(
    'relative p-4 rounded-xl border backdrop-blur-md overflow-hidden transition-all hover:scale-[1.02]',
    `border-${color}-500/20 bg-${color}-500/5`,
  )}>
    <div className="absolute top-0 right-0 w-20 h-20 -mr-4 -mt-4 rounded-full opacity-[0.06]"
      style={{ background: `radial-gradient(circle, var(--${color}) 0%, transparent 70%)` }} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className={cn('p-2 rounded-lg', `bg-${color}-500/10`)}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp className="w-3 h-3 text-emerald-500" />
        <span className="text-[10px] font-medium text-emerald-600">{trend}</span>
      </div>
    )}
  </div>
);

// ── Quick Action Card ────────────────────────────────────────────────────────
const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
  countLabel?: string;
  color: string;
  onClick: () => void;
}> = ({ icon, title, description, count, countLabel, color, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'group relative p-4 rounded-xl border text-left transition-all w-full',
      'hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]',
      'backdrop-blur-md overflow-hidden',
      `border-${color}-500/15 bg-${color}-500/[0.03] hover:bg-${color}-500/[0.06]`,
    )}
  >
    <div className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
      style={{ background: `linear-gradient(135deg, hsl(var(--${color}) / 0.04) 0%, transparent 60%)` }} />
    <div className="relative flex items-start gap-3">
      <div className={cn('p-2.5 rounded-xl shrink-0', `bg-${color}-500/10 group-hover:bg-${color}-500/15`)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
        {count !== undefined && (
          <Badge variant="outline" className={cn('mt-2 text-[10px]', `text-${color}-600 border-${color}-500/25`)}>
            {count} {countLabel || 'items'}
          </Badge>
        )}
      </div>
    </div>
  </button>
);

// ── Recent Activity Item ─────────────────────────────────────────────────────
const ActivityItem: React.FC<{
  title: string;
  status: string;
  time: string;
  language?: string;
}> = ({ title, status, time, language }) => {
  const statusColor = status === 'completed' ? 'emerald' : status === 'processing' ? 'amber' : 'red';
  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <div className={cn('w-2 h-2 rounded-full', `bg-${statusColor}-500`)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{title || 'Untitled'}</p>
        <p className="text-[10px] text-muted-foreground">{time}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {language && (
          <Badge variant="outline" className="text-[9px] h-4">
            <Globe className="w-2.5 h-2.5 mr-0.5" />
            {language}
          </Badge>
        )}
        <Badge variant="outline" className={cn('text-[9px] h-4 capitalize', `text-${statusColor}-600 border-${statusColor}-500/25`)}>
          {status}
        </Badge>
      </div>
    </div>
  );
};

// ── Main Dashboard ───────────────────────────────────────────────────────────
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
      {/* Hero section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            Genie Cast Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-powered video production with regional intelligence
          </p>
        </div>
        <Button
          onClick={onStartCreate}
          className="gap-2 bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Create New
        </Button>
      </div>

      {/* Active production banner */}
      {production.isProducing && (
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Production in Progress</p>
              <p className="text-xs text-muted-foreground">{production.state.currentTask || 'Processing...'}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-amber-600">{production.state.progress}%</p>
            </div>
          </div>
          <Progress value={production.state.progress} className="mt-2 h-1.5 [&>div]:bg-amber-500" />
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Video className="w-4 h-4 text-primary" />}
          label="Videos Produced"
          value={videoStats?.total || 0}
          subtitle={`${videoStats?.completed || 0} completed`}
          trend={videoStats?.successRate ? `${videoStats.successRate}% success` : undefined}
          color="primary"
        />
        <StatCard
          icon={<FolderOpen className="w-4 h-4 text-blue-500" />}
          label="Active Projects"
          value={activeProjects.length}
          subtitle={`${totalProjects} total projects`}
          color="blue"
        />
        <StatCard
          icon={<LayoutTemplate className="w-4 h-4 text-purple-500" />}
          label="Templates"
          value={totalTemplates}
          subtitle={`${Object.keys(blueprints.blueprintsByCategory || {}).length} categories`}
          color="purple"
        />
        <StatCard
          icon={<Globe className="w-4 h-4 text-cyan-500" />}
          label="Languages"
          value={videoStats?.languageCount || 0}
          subtitle={`${totalFormats} formats available`}
          color="cyan"
        />
      </div>

      {/* Quick Access Grid + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Navigation Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Quick Access</h3>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <QuickActionCard
              icon={<FolderOpen className="w-4 h-4 text-blue-500" />}
              title="Projects"
              description="View and manage video projects"
              count={totalProjects}
              countLabel="projects"
              color="blue"
              onClick={() => onNavigate('projects')}
            />
            <QuickActionCard
              icon={<LayoutTemplate className="w-4 h-4 text-purple-500" />}
              title="Templates"
              description="Browse video blueprints"
              count={totalTemplates}
              countLabel="blueprints"
              color="purple"
              onClick={() => onNavigate('templates')}
            />
            <QuickActionCard
              icon={<Package className="w-4 h-4 text-emerald-500" />}
              title="Assets"
              description="Images, videos, audio library"
              count={totalStyles}
              countLabel="visual styles"
              color="emerald"
              onClick={() => onNavigate('assets')}
            />
            <QuickActionCard
              icon={<Palette className="w-4 h-4 text-amber-500" />}
              title="Brand Kit"
              description="Brand colors, fonts, voice"
              color="amber"
              onClick={() => onNavigate('brand-kit')}
            />
            <QuickActionCard
              icon={<BarChart3 className="w-4 h-4 text-indigo-500" />}
              title="Analytics"
              description="Performance and engagement"
              count={videoStats?.completed || 0}
              countLabel="completed videos"
              color="indigo"
              onClick={() => onNavigate('analytics')}
            />
            <QuickActionCard
              icon={<Settings className="w-4 h-4 text-slate-500" />}
              title="Settings"
              description="Integrations and preferences"
              color="slate"
              onClick={() => onNavigate('settings')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Recent Activity</h3>
          <div className="rounded-xl border border-border/15 bg-card/30 backdrop-blur-md p-3">
            {videoStats?.recentVideos && videoStats.recentVideos.length > 0 ? (
              <ScrollArea className="h-[280px]">
                <div className="divide-y divide-border/10">
                  {videoStats.recentVideos.map((video: any) => (
                    <ActivityItem
                      key={video.id}
                      title={video.title}
                      status={video.generation_status || 'pending'}
                      time={video.created_at ? formatDistanceToNow(new Date(video.created_at), { addSuffix: true }) : ''}
                      language={video.language_name}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Clock className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">No recent activity</p>
                <Button variant="link" size="sm" className="mt-1 text-xs" onClick={onStartCreate}>
                  Create your first video
                </Button>
              </div>
            )}
          </div>

          {/* Production capabilities summary */}
          <div className="rounded-xl border border-border/15 bg-card/30 backdrop-blur-md p-3">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Capabilities</h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                { icon: <Film className="w-3 h-3" />, label: `${totalFormats} Formats` },
                { icon: <Palette className="w-3 h-3" />, label: `${totalStyles} Styles` },
                { icon: <Layers className="w-3 h-3" />, label: `${totalCategories} Categories` },
                { icon: <Shield className="w-3 h-3" />, label: `${registry.productionCapabilities?.length || 0} AI Caps` },
              ].map(item => (
                <Badge key={item.label} variant="outline" className="text-[9px] gap-1">
                  {item.icon}
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CastDashboardOverview;
