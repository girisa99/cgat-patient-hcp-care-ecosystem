/**
 * GENIE HUB ADMIN PANEL
 *
 * SIMPLIFIED: No internal sidebar - navigation is now in global sidebar
 * This component just renders the content based on the tab parameter
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Users, CalendarDays, Sparkles, Loader2, Download, Film, LayoutGrid, Calendar, UserCog, BarChart3, Palette, ArrowRight, Zap, Brain, Presentation, Building2, Command, Activity, BookOpen, Layers, Settings, Globe, Shield, HelpCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import genieCastLogo from '@/assets/logos/genie-arc-combined.png';
import { DocumentDownloadButton } from './DocumentDownloadButton';
import { UnifiedCompositionStudio, ContentLibrary } from './composition-studio';
import { ContentSchedulerDashboard } from './ContentSchedulerDashboard';
import { ProductionAnalytics } from './ProductionAnalytics';
import { WorkspaceManagement } from './WorkspaceManagement';
import { TeamInviteManagement } from './TeamInviteManagement';
import { WhitelabelConfiguration } from './WhitelabelConfiguration';
import { TieredAnalyticsDashboard } from '@/components/analytics/TieredAnalyticsDashboard';
import { ErrorAnalyticsDashboard } from '@/components/resilience/ErrorAnalyticsDashboard';
import { TeamActivityFeed } from '@/components/collaboration/TeamActivityFeed';
import { NotificationsPanel } from '@/components/collaboration/NotificationsPanel';
import { toast } from 'sonner';
import { useShows } from '@/hooks/useShows';

import type { EventCategory } from '@/types/shows';
import { cn } from '@/lib/utils';
// UnifiedVideoGenerationPanel removed — legacy landing-videos tab consolidated into Genie Cast
import { SubscriberProductSetup } from './SubscriberProductSetup';
import { SubscriberAdminDashboard } from './SubscriberAdminDashboard';
// Lazy load heavy components — v2 (re-bundled 2026-02-18)
const GenieCommandCenter = lazy(() => import('@/components/diagrams/genie-command-center/GenieCommandCenter'));
const AIIntelligenceHub = lazy(() => import('@/components/ai/AIIntelligenceHub'));
const VerticalKanban = lazy(() => import('@/components/production/VerticalKanban').then(m => ({ default: m.VerticalKanban })));
const ProductionCalendar = lazy(() => import('@/components/production/ProductionCalendar').then(m => ({ default: m.ProductionCalendar })));
const AppointmentScheduler = lazy(() => import('@/components/arc/AppointmentScheduler').catch(() => ({ default: () => <div className="p-8 text-center text-muted-foreground">Appointments module loading...</div> })));
const SprintTrackerDashboard = lazy(() => import('./SprintTrackerDashboard'));

interface ProductionHubAdminProps {
  className?: string;
}

type AdminTab = 'overview' | 'kanban' | 'calendar' | 'appointments' | 'library' | 'composition' | 'scheduler' | 'analytics' | 'enterprise-analytics' | 'error-analytics' | 'collaboration' | 'workspaces' | 'team' | 'whitelabel' | 'ai-intelligence' | 'command-center' | 'sprint-tracker' | 'product-setup' | 'subscriber-admin';

export const ProductionHubAdmin: React.FC<ProductionHubAdminProps> = ({ className }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    shows, 
    isLoading: showsLoading, 
    updateStage,
    updateMeetingStage,
    updateEventStage,
    getShowsByStage 
  } = useShows();
  
  const activeTab: AdminTab = React.useMemo(() => {
    const tabFromUrl = searchParams.get('tab') as AdminTab;
    return tabFromUrl || 'overview';
  }, [searchParams]);
  
  const [activeCategory, setActiveCategory] = useState<EventCategory>('media_production');
  const [selectedShow, setSelectedShow] = useState<any>(null);
  
  const showId = searchParams.get('show');
  const linkScriptId = searchParams.get('linkScript');
  const showsByStage = getShowsByStage(activeCategory);

  // Helper to change tab via URL (not state)
  const setActiveTab = (tab: AdminTab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  useEffect(() => {
    if (showId || linkScriptId) {
      if (activeTab !== 'composition') {
        setActiveTab('composition');
      }
      if (showId && activeTab === 'composition') {
        toast.info(`Opening show: ${showId}`);
      } else if (linkScriptId && activeTab === 'composition') {
        toast.info('Ready to link script to new composition');
      }
    }
  }, [showId, linkScriptId, activeTab]);

  const handleShowClick = (show: any) => {
    setSelectedShow(show);
  };

  const handleOpenRecordingStudio = (show: any) => {
    navigate(`/genie-studio?showId=${show.id}`);
  };

  const handleStageChange = async (showId: string, newStage: any) => {
    if (activeCategory === 'business_meeting') {
      await updateMeetingStage(showId, newStage);
    } else if (activeCategory === 'event') {
      await updateEventStage(showId, newStage);
    } else {
      await updateStage(showId, newStage);
    }
  };

  const TabLoading = () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="ml-3 text-muted-foreground">Loading...</span>
    </div>
  );

  // Sprint tracker gets full-screen treatment — no padding wrapper, no scroll area nesting
  if (activeTab === 'sprint-tracker') {
    return (
      <div className={cn("h-full min-h-screen w-full", className)}>
        <Suspense fallback={<TabLoading />}>
          <SprintTrackerDashboard />
        </Suspense>
      </div>
    );
  }

  return (
    <div className={cn("h-full min-h-[calc(100vh-4rem)]", className)}>
      <ScrollArea className="h-full">
        <div className="p-2 sm:p-4">
          {/* Overview Tab — Hub landing dashboard with glass morphism + tooltips */}
          {activeTab === 'overview' && (
            <TooltipProvider delayDuration={200}>
            <div className="space-y-6">
              {/* Hero Banner — gradient glass morph */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-blue-500/20 border border-white/10">
                <div className="absolute inset-0 backdrop-blur-3xl" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10 flex items-center gap-6 p-6 sm:p-8">
                  <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden p-2 shadow-lg flex-shrink-0">
                    <img src={genieCastLogo} alt="Genie Hub" className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        Genie Hub
                      </h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[280px] text-xs">
                          Genie Hub is your central management dashboard for the entire Genie ecosystem. Formerly known as "Arc" and "Admin" — all management features are now unified here under one roof.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your central command center. Manage workspaces, schedule content, coordinate teams, and track performance across all Genie products.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-xs cursor-help">15+ modules</Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px] text-xs">Kanban, Calendar, Scheduler, Library, Composition Studio, Team, Workspaces, Whitelabel, Analytics (3 types), Collaboration, AI Intelligence, Command Center, Product Setup</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs cursor-help">Real-time sync</Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px] text-xs">All Hub modules sync in real time. Team activity feeds, notifications, and task updates propagate instantly.</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs cursor-help">AI-powered</Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px] text-xs">AI Intelligence routing across 19+ providers in 4 zones (Claude, Alibaba, Gemini, Fallback). Covers 16 regions, 62 subregions, 85+ languages.</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions — glass morph cards with tooltips */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px] text-xs">Jump directly into the most commonly used features. Click any card to navigate instantly.</TooltipContent>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: Film, label: 'Open Cast', desc: 'Production studio', color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-purple-400', action: () => navigate('/genie-cast'), tip: 'Opens Genie Cast — the full video production pipeline with CREATE, PRODUCE, and PUBLISH phases.' },
                    { icon: LayoutGrid, label: 'Task Board', desc: 'Kanban workflow', color: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-400', action: () => setActiveTab('kanban'), tip: 'Drag-and-drop Kanban board for managing media productions, meetings, events, and demos.' },
                    { icon: Calendar, label: 'Calendar', desc: 'Schedule & events', color: 'from-green-500/20 to-emerald-500/20', iconColor: 'text-green-400', action: () => setActiveTab('calendar'), tip: 'Production calendar view showing all scheduled shows, recordings, and deadlines.' },
                    { icon: UserCog, label: 'Team', desc: 'Manage members', color: 'from-orange-500/20 to-amber-500/20', iconColor: 'text-orange-400', action: () => setActiveTab('team'), tip: 'Invite team members, assign roles, set permissions, and manage collaboration settings.' },
                  ].map((item) => (
                    <Tooltip key={item.label}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={item.action}
                          className="group relative cursor-pointer rounded-xl border border-white/10 bg-gradient-to-br p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-white/20"
                        >
                          <div className={cn("absolute inset-0 rounded-xl bg-gradient-to-br opacity-50", item.color)} />
                          <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-card/60" />
                          <div className="relative z-10 flex items-center gap-3">
                            <div className={cn("h-10 w-10 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors")}>
                              <item.icon className={cn("h-5 w-5", item.iconColor)} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold group-hover:text-foreground transition-colors">{item.label}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[250px] text-xs">{item.tip}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* What Hub Can Do — capabilities showcase with tooltips */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">What Genie Hub Can Do</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[260px] text-xs">Each card represents a Hub module. Click to open. All modules work across 16 regions, 62 subregions, and 85+ languages.</TooltipContent>
                  </Tooltip>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: CalendarDays, title: 'Schedule & Plan', desc: 'Kanban boards, calendar views, content scheduling, and smart reminders for your entire production pipeline.', color: 'text-blue-400', bg: 'from-blue-500/10 to-indigo-500/10', action: () => setActiveTab('scheduler'), tip: 'Unified scheduler with drag-and-drop calendar, automated reminders, and platform-specific time optimization.' },
                    { icon: Palette, title: 'Brand & Whitelabel', desc: 'Configure brand kits, custom logos, color palettes, and whitelabel settings for client-facing deliverables.', color: 'text-pink-400', bg: 'from-pink-500/10 to-rose-500/10', action: () => setActiveTab('whitelabel'), tip: 'Upload logos, define brand colors, set fonts, and apply white-label settings across all exported content.' },
                    { icon: BarChart3, title: 'Analytics & Reports', desc: 'Production metrics, engagement tracking, error analytics, and performance dashboards across all content.', color: 'text-green-400', bg: 'from-green-500/10 to-emerald-500/10', action: () => setActiveTab('analytics'), tip: 'Track views, engagement, completion rates, and pipeline performance. Includes error analytics and enterprise dashboards.' },
                    { icon: Users, title: 'Team Collaboration', desc: 'Invite team members, assign roles, track activity feeds, and manage notifications in real time.', color: 'text-orange-400', bg: 'from-orange-500/10 to-amber-500/10', action: () => setActiveTab('collaboration'), tip: 'Real-time activity feed, notification center, and team-wide collaboration tools. See who changed what, when.' },
                    { icon: Building2, title: 'Workspace Management', desc: 'Multi-workspace support, environment configuration, and organizational settings for enterprise teams.', color: 'text-teal-400', bg: 'from-teal-500/10 to-cyan-500/10', action: () => setActiveTab('workspaces'), tip: 'Create multiple workspaces for different teams or clients. Each workspace has isolated settings and permissions.' },
                    { icon: Command, title: 'Command Center', desc: 'AI architecture diagrams, routing visualization, and system health monitoring for your entire Genie ecosystem.', color: 'text-violet-400', bg: 'from-violet-500/10 to-purple-500/10', action: () => setActiveTab('command-center'), tip: 'Visual system map showing all AI providers, routing zones, and real-time health status of the Genie ecosystem.' },
                    { icon: Brain, title: 'AI Intelligence', desc: 'AI provider routing, model configuration, zone-aware dispatch, and intelligent content recommendations.', color: 'text-purple-400', bg: 'from-purple-500/10 to-fuchsia-500/10', action: () => setActiveTab('ai-intelligence'), tip: 'Configure AI provider routing across 4 zones (Claude, Alibaba, Gemini, Fallback). Test models and compare outputs.' },
                    { icon: BookOpen, title: 'Content Library', desc: 'Browse, search, and manage all your compositions, scripts, and media assets in one organized library.', color: 'text-cyan-400', bg: 'from-cyan-500/10 to-sky-500/10', action: () => setActiveTab('library'), tip: 'Centralized library of all compositions, scripts, and media. Search, filter, and organize by tags, date, or format.' },
                    { icon: Layers, title: 'Composition Studio', desc: 'Full-featured composition editor with chapter management, scene composition, and multi-language support.', color: 'text-amber-400', bg: 'from-amber-500/10 to-yellow-500/10', action: () => setActiveTab('composition'), tip: 'Advanced editor with chapter management, scene composition, multi-language output, and AI-powered enhancements.' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      onClick={item.action}
                      className="group relative cursor-pointer rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:border-white/20"
                    >
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", item.bg)} />
                      <div className="absolute inset-0 backdrop-blur-sm bg-card/70" />
                      <div className="relative z-10 p-5">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                            <item.icon className={cn("h-4 w-4", item.color)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-semibold group-hover:text-foreground transition-colors">{item.title}</h4>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground/40 hover:text-muted-foreground cursor-help flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[260px] text-xs">{item.tip}</TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-primary/80 flex items-center gap-1 group-hover:text-primary transition-colors">
                            Explore <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom stats strip — glass morph with tooltips */}
              <div className="relative rounded-xl border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-cyan-500/5" />
                <div className="absolute inset-0 backdrop-blur-sm bg-card/50" />
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
                  {[
                    { label: 'Active Modules', value: '15+', icon: Layers, tip: 'Task Board, Calendar, Scheduler, Library, Composition, Team, Workspaces, Whitelabel, Analytics (3), Collaboration, AI Intelligence, Command Center, Setup' },
                    { label: 'AI Providers', value: '19+', icon: Brain, tip: 'Claude, GPT-4o, Gemini, Alibaba Qwen, DeepSeek, Stability AI, ElevenLabs, and more — routed by language and region' },
                    { label: 'Regions', value: '16', icon: Globe, tip: 'NAM, EU, EURASIA, TURKEY, MENA, AFRICA, INDIA, PAKISTAN, BANGLADESH, SOUTH_ASIA, SEA, CJK, LATAM, CARIBBEAN, OCEANIA, CENTRAL_ASIA' },
                    { label: 'Languages', value: '85+', icon: Activity, tip: '85+ production/text languages with 63 having full voice STT/TTS support. All products work across all languages.' },
                  ].map((stat) => (
                    <Tooltip key={stat.label}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 p-4 cursor-help">
                          <stat.icon className="h-4 w-4 text-teal-400 flex-shrink-0" />
                          <div>
                            <p className="text-lg font-bold">{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px] text-xs">{stat.tip}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
            </TooltipProvider>
          )}

          {/* Kanban Tab */}
          {activeTab === 'kanban' && (
            <div className="space-y-3 sm:space-y-4">
              {/* Category Selector - Mobile optimized */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Category:</span>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2">
                  <Button
                    variant={activeCategory === 'media_production' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('media_production')}
                    className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate">Media</span>
                  </Button>
                  <Button
                    variant={activeCategory === 'business_meeting' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('business_meeting')}
                    className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate">Meetings</span>
                  </Button>
                  <Button
                    variant={activeCategory === 'event' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('event')}
                    className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate">Events</span>
                  </Button>
                  <Button
                    variant={activeCategory === 'genie_demo' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('genie_demo')}
                    className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate">Demos</span>
                  </Button>
                </div>
              </div>

              <Suspense fallback={<TabLoading />}>
                <VerticalKanban 
                  showsByStage={showsByStage}
                  onSelectShow={handleShowClick}
                  onUpdateStage={handleStageChange}
                  onOpenRecordingStudio={handleOpenRecordingStudio}
                  eventCategory={activeCategory}
                  isLoading={showsLoading}
                />
              </Suspense>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <Suspense fallback={<TabLoading />}>
              <ProductionCalendar 
                shows={shows}
                onShowClick={handleShowClick}
              />
            </Suspense>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <Suspense fallback={<TabLoading />}>
              <AppointmentScheduler />
            </Suspense>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <ContentLibrary 
              onCreateNew={() => {
                setActiveTab('composition');
                setSearchParams({ tab: 'composition' });
              }}
              onEdit={(compositionId) => {
                setActiveTab('composition');
                setSearchParams({ tab: 'composition', show: compositionId });
              }}
            />
          )}

          {/* Composition Tab — now uses UnifiedCompositionStudio (replaced legacy SimpleCompositionStudio) */}
          {activeTab === 'composition' && (
            <UnifiedCompositionStudio
              compositionId={showId || undefined}
              onOpenLibrary={() => {
                setActiveTab('library');
                setSearchParams({ tab: 'library' });
              }}
            />
          )}

          {/* Scheduler Tab */}
          {activeTab === 'scheduler' && (
            <ContentSchedulerDashboard />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <ProductionAnalytics />
          )}

          {/* Enterprise Analytics */}
          {activeTab === 'enterprise-analytics' && (
            <TieredAnalyticsDashboard accessLevel="internal" />
          )}

          {/* Error Analytics */}
          {activeTab === 'error-analytics' && (
            <ErrorAnalyticsDashboard />
          )}

          {/* Collaboration */}
          {activeTab === 'collaboration' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <TeamActivityFeed />
              <NotificationsPanel />
            </div>
          )}

          {/* Workspaces */}
          {activeTab === 'workspaces' && (
            <WorkspaceManagement />
          )}

          {/* Team */}
          {activeTab === 'team' && (
            <TeamInviteManagement />
          )}

          {/* Whitelabel */}
          {activeTab === 'whitelabel' && (
            <WhitelabelConfiguration />
          )}

          {/* AI Intelligence */}
          {activeTab === 'ai-intelligence' && (
            <Suspense fallback={<TabLoading />}>
              <AIIntelligenceHub />
            </Suspense>
          )}

          {/* Command Center */}
          {activeTab === 'command-center' && (
            <div className="space-y-4">
              {/* Download Button */}
              <div className="flex justify-end">
                <DocumentDownloadButton />
              </div>
              <Suspense fallback={<TabLoading />}>
                <GenieCommandCenter />
              </Suspense>
            </div>
          )}

          {/* Product Setup - Subscriber Onboarding */}
          {activeTab === 'product-setup' && (
            <SubscriberProductSetup userTier="professional" />
          )}

          {/* Subscriber Admin - Full Admin Hub from Cast */}
          {activeTab === 'subscriber-admin' && (
            <SubscriberAdminDashboard userTier="professional" />
          )}

        </div>
      </ScrollArea>
    </div>
  );
};

export default ProductionHubAdmin;
