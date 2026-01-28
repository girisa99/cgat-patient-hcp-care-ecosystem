/**
 * PRODUCTION HUB ADMIN PANEL - UNIFIED
 * 
 * Consolidated admin panel with CATEGORIZED navigation:
 * - PIPELINE: Kanban, Calendar, Appointments
 * - CONTENT: Library, Create, Scheduler
 * - ANALYTICS: Performance, Enterprise, Errors
 * - ADMIN: Workspaces, Team, Whitelabel, Activity
 * - AI/SYSTEM: AI Intelligence, Command Center
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Video, Calendar, BarChart3, 
  Globe, Wand2, Sparkles,
  Building2, Users, Paintbrush,
  FolderOpen, Layers, KanbanSquare,
  CalendarDays, Loader2, CalendarCheck,
  AlertTriangle, MessageSquare, Command,
  Brain, ChevronDown, Workflow, 
  FileVideo, Settings2, Send
} from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import type { EventCategory } from '@/types/shows';
import { cn } from '@/lib/utils';

// Lazy load heavy components
const GenieCommandCenter = lazy(() => import('@/components/diagrams/genie-command-center/GenieCommandCenter'));
const AIIntelligenceHub = lazy(() => import('@/components/ai/AIIntelligenceHub'));
const VerticalKanban = lazy(() => import('@/components/production/VerticalKanban').then(m => ({ default: m.VerticalKanban })));
const ProductionCalendar = lazy(() => import('@/components/production/ProductionCalendar').then(m => ({ default: m.ProductionCalendar })));
const AppointmentScheduler = lazy(() => import('@/components/arc/AppointmentScheduler').catch(() => ({ default: () => <div className="p-8 text-center text-muted-foreground">Appointments module loading...</div> })));

interface ProductionHubAdminProps {
  className?: string;
}

type AdminTab = 'kanban' | 'calendar' | 'appointments' | 'library' | 'composition' | 'scheduler' | 'analytics' | 'enterprise-analytics' | 'error-analytics' | 'collaboration' | 'workspaces' | 'team' | 'whitelabel' | 'ai-intelligence' | 'command-center';

// Tab categories for organized navigation
const TAB_CATEGORIES = {
  pipeline: {
    label: '📊 Pipeline',
    icon: Workflow,
    tabs: [
      { id: 'kanban', label: 'Kanban Board', icon: KanbanSquare, description: 'Visual production pipeline' },
      { id: 'calendar', label: 'Calendar View', icon: CalendarDays, description: 'Schedule timeline' },
      { id: 'appointments', label: 'Appointments', icon: CalendarCheck, description: 'Meetings & events' },
    ]
  },
  content: {
    label: '🎬 Content',
    icon: FileVideo,
    tabs: [
      { id: 'library', label: 'Content Library', icon: FolderOpen, description: 'Browse all content' },
      { id: 'composition', label: 'Create New', icon: Layers, description: 'Composition studio' },
      { id: 'scheduler', label: 'Scheduler', icon: Calendar, description: 'Multi-platform publishing' },
    ]
  },
  analytics: {
    label: '📈 Analytics',
    icon: BarChart3,
    tabs: [
      { id: 'analytics', label: 'Performance', icon: BarChart3, description: 'Production metrics' },
      { id: 'enterprise-analytics', label: 'Enterprise', icon: Globe, description: 'Enterprise analytics' },
      { id: 'error-analytics', label: 'Error Tracking', icon: AlertTriangle, description: 'Diagnostics' },
    ]
  },
  admin: {
    label: '⚙️ Admin',
    icon: Settings2,
    tabs: [
      { id: 'workspaces', label: 'Workspaces', icon: Building2, description: 'Manage workspaces' },
      { id: 'team', label: 'Team', icon: Users, description: 'Team management' },
      { id: 'whitelabel', label: 'Whitelabel', icon: Paintbrush, description: 'Custom branding' },
      { id: 'collaboration', label: 'Activity', icon: MessageSquare, description: 'Team activity feed' },
    ]
  },
  system: {
    label: '🧠 AI & System',
    icon: Brain,
    tabs: [
      { id: 'ai-intelligence', label: 'AI Intelligence', icon: Brain, description: 'AI routing & models' },
      { id: 'command-center', label: 'Command Center', icon: Command, description: 'System overview' },
    ]
  },
};

export const ProductionHubAdmin: React.FC<ProductionHubAdminProps> = ({ className }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { 
    shows, 
    isLoading: showsLoading, 
    updateStage,
    updateMeetingStage,
    updateEventStage,
    getShowsByStage 
  } = useShows();
  
  const initialTab = (searchParams.get('tab') as AdminTab) || 'kanban';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [activeCategory, setActiveCategory] = useState<EventCategory>('media_production');
  const [selectedShow, setSelectedShow] = useState<any>(null);
  
  const showId = searchParams.get('show');
  const linkScriptId = searchParams.get('linkScript');
  const showsByStage = getShowsByStage(activeCategory);

  useEffect(() => {
    if (showId || linkScriptId) {
      setActiveTab('composition');
      if (showId) {
        toast.info(`Opening show: ${showId}`);
      } else if (linkScriptId) {
        toast.info('Ready to link script to new composition');
      }
    }
  }, [showId, linkScriptId]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab as AdminTab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', newTab);
    newParams.delete('show');
    newParams.delete('linkScript');
    setSearchParams(newParams);
  };

  const handleEditComposition = (compositionId: string) => {
    setActiveTab('composition');
    toast.info(`Editing composition: ${compositionId}`);
  };

  const handleCreateNew = () => {
    setActiveTab('composition');
  };

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

  // Find which category contains the current tab
  const getCurrentCategory = () => {
    for (const [key, category] of Object.entries(TAB_CATEGORIES)) {
      if (category.tabs.some(t => t.id === activeTab)) {
        return key;
      }
    }
    return 'pipeline';
  };

  // Get current tab info
  const getCurrentTabInfo = () => {
    for (const category of Object.values(TAB_CATEGORIES)) {
      const tab = category.tabs.find(t => t.id === activeTab);
      if (tab) return tab;
    }
    return TAB_CATEGORIES.pipeline.tabs[0];
  };

  const TabLoading = () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="ml-3 text-muted-foreground">Loading...</span>
    </div>
  );

  const currentTabInfo = getCurrentTabInfo();

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-primary" />
            Production Hub Admin
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and publish multi-modal content across all platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Arc Integration
          </Badge>
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
            13 AI Providers
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Videos Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <Sparkles className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Compositions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Globe className="w-5 h-5" style={{ color: '#06B6D4' }} />
              </div>
              <div>
                <p className="text-2xl font-bold">14</p>
                <p className="text-xs text-muted-foreground">Languages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Calendar className="w-5 h-5" style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5" style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <p className="text-2xl font-bold">8.5K</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorized Navigation Bar */}
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
          {Object.entries(TAB_CATEGORIES).map(([key, category]) => (
            <DropdownMenu key={key}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={getCurrentCategory() === key ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    getCurrentCategory() === key && "bg-primary text-primary-foreground"
                  )}
                >
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {category.label}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {category.tabs.map(tab => (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                          "gap-2 cursor-pointer",
                          activeTab === tab.id && "bg-primary/10 text-primary"
                        )}
                      >
                        <tab.icon className="w-4 h-4" />
                        <div className="flex-1">
                          <p className="font-medium">{tab.label}</p>
                          <p className="text-xs text-muted-foreground">{tab.description}</p>
                        </div>
                        {activeTab === tab.id && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {tab.description}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {/* Current Tab Indicator */}
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <currentTabInfo.icon className="w-4 h-4" />
            <span className="hidden md:inline">{currentTabInfo.label}</span>
          </div>
        </div>
      </TooltipProvider>

      {/* Content Area - Hidden Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="hidden">
          <TabsList>
            {Object.values(TAB_CATEGORIES).flatMap(cat => 
              cat.tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
              ))
            )}
          </TabsList>
        </div>

        {/* Kanban Tab */}
        <TabsContent value="kanban" className="mt-4 space-y-4">
          {/* Category Selector */}
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b">
            <span className="text-sm font-medium text-muted-foreground">Category:</span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={activeCategory === 'media_production' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('media_production')}
                className="gap-2"
              >
                <Video className="w-4 h-4" />
                Media Productions
              </Button>
              <Button
                variant={activeCategory === 'business_meeting' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('business_meeting')}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Business Meetings
              </Button>
              <Button
                variant={activeCategory === 'event' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('event')}
                className="gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Events
              </Button>
              <Button
                variant={activeCategory === 'genie_demo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('genie_demo')}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Genie Demos
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
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-4">
          <Suspense fallback={<TabLoading />}>
            <ProductionCalendar 
              shows={shows}
              onShowClick={handleShowClick}
            />
          </Suspense>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="mt-4">
          <Suspense fallback={<TabLoading />}>
            <AppointmentScheduler />
          </Suspense>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="mt-4">
          <ContentLibrary onEdit={handleEditComposition} />
        </TabsContent>

        {/* Composition Tab */}
        <TabsContent value="composition" className="mt-4">
          <UnifiedCompositionStudio />
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler" className="mt-4">
          <ContentSchedulerDashboard />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <ProductionAnalytics />
        </TabsContent>

        {/* Enterprise Analytics Tab */}
        <TabsContent value="enterprise-analytics" className="mt-4">
          <TieredAnalyticsDashboard accessLevel="enterprise" />
        </TabsContent>

        {/* Error Analytics Tab */}
        <TabsContent value="error-analytics" className="mt-4">
          <ErrorAnalyticsDashboard />
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamActivityFeed />
            <NotificationsPanel />
          </div>
        </TabsContent>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces" className="mt-4">
          <WorkspaceManagement />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-4">
          <TeamInviteManagement />
        </TabsContent>

        {/* Whitelabel Tab */}
        <TabsContent value="whitelabel" className="mt-4">
          <WhitelabelConfiguration />
        </TabsContent>

        {/* AI Intelligence Tab */}
        <TabsContent value="ai-intelligence" className="mt-4">
          <Suspense fallback={<TabLoading />}>
            <AIIntelligenceHub />
          </Suspense>
        </TabsContent>

        {/* Command Center Tab */}
        <TabsContent value="command-center" className="mt-4">
          <Suspense fallback={<TabLoading />}>
            <GenieCommandCenter />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionHubAdmin;
