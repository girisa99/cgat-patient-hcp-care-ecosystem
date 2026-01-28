/**
 * PRODUCTION HUB ADMIN PANEL - UNIFIED
 * 
 * Redesigned with SIDE PANEL navigation:
 * - Left panel: Categories & tabs
 * - Right panel: Content view only
 * - Categories renamed for clarity:
 *   - WORKFLOW: Kanban, Calendar, Appointments
 *   - ASSETS: Library, Create, Publisher
 *   - INSIGHTS: Performance, Enterprise, Diagnostics
 *   - SETTINGS: Workspaces, Team, Branding, Activity
 *   - AI TOOLS: Intelligence, Command Center
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Video, Calendar, BarChart3, 
  Globe, Wand2, Sparkles,
  Building2, Users, Paintbrush,
  FolderOpen, Layers, KanbanSquare,
  CalendarDays, Loader2, CalendarCheck,
  AlertTriangle, MessageSquare, Command,
  Brain, ChevronDown, ChevronRight,
  FileVideo, Settings2, Send,
  PanelLeftClose, PanelLeft, LayoutGrid,
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

/**
 * CLEARER Category Names:
 * - WORKFLOW: Managing your production pipeline (tasks, schedules, meetings)
 * - ASSETS: All your content & creation tools
 * - INSIGHTS: Analytics, reports, diagnostics
 * - SETTINGS: Workspace/team/branding configuration
 * - AI TOOLS: AI intelligence & system control
 */
const TAB_CATEGORIES = {
  workflow: {
    label: 'Workflow',
    description: 'Manage tasks & schedules',
    icon: LayoutGrid,
    tabs: [
      { id: 'kanban', label: 'Task Board', icon: KanbanSquare, description: 'Drag-and-drop task management' },
      { id: 'calendar', label: 'Schedule', icon: CalendarDays, description: 'Calendar timeline view' },
      { id: 'appointments', label: 'Meetings', icon: CalendarCheck, description: 'Book & manage meetings' },
    ]
  },
  assets: {
    label: 'Assets',
    description: 'Content & creation',
    icon: FileVideo,
    tabs: [
      { id: 'library', label: 'Library', icon: FolderOpen, description: 'Browse all your content' },
      { id: 'composition', label: 'Create', icon: Layers, description: 'New composition studio' },
      { id: 'scheduler', label: 'Publisher', icon: Send, description: 'Schedule & distribute' },
    ]
  },
  insights: {
    label: 'Insights',
    description: 'Analytics & reports',
    icon: BarChart3,
    tabs: [
      { id: 'analytics', label: 'Performance', icon: BarChart3, description: 'Production metrics' },
      { id: 'enterprise-analytics', label: 'Enterprise', icon: Globe, description: 'Business analytics' },
      { id: 'error-analytics', label: 'Diagnostics', icon: AlertTriangle, description: 'Error tracking & health' },
    ]
  },
  settings: {
    label: 'Settings',
    description: 'Configuration',
    icon: Settings2,
    tabs: [
      { id: 'workspaces', label: 'Workspaces', icon: Building2, description: 'Manage workspaces' },
      { id: 'team', label: 'Team', icon: Users, description: 'Team members & roles' },
      { id: 'whitelabel', label: 'Branding', icon: Paintbrush, description: 'Custom branding' },
      { id: 'collaboration', label: 'Activity', icon: MessageSquare, description: 'Team activity feed' },
    ]
  },
  ai: {
    label: 'AI Tools',
    description: 'Intelligence & system',
    icon: Brain,
    tabs: [
      { id: 'ai-intelligence', label: 'AI Hub', icon: Brain, description: 'AI routing & models' },
      { id: 'command-center', label: 'Control Center', icon: Command, description: 'System overview' },
    ]
  },
};

const CATEGORY_ORDER = ['workflow', 'assets', 'insights', 'settings', 'ai'];

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>(['workflow']);
  
  const showId = searchParams.get('show');
  const linkScriptId = searchParams.get('linkScript');
  const showsByStage = getShowsByStage(activeCategory);

  // Set initial open category based on active tab
  useEffect(() => {
    const category = getCurrentCategoryKey();
    if (!openCategories.includes(category)) {
      setOpenCategories(prev => [...prev, category]);
    }
  }, [activeTab]);

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

  const getCurrentCategoryKey = (): string => {
    for (const [key, category] of Object.entries(TAB_CATEGORIES)) {
      if (category.tabs.some(t => t.id === activeTab)) {
        return key;
      }
    }
    return 'workflow';
  };

  const getCurrentTabInfo = () => {
    for (const category of Object.values(TAB_CATEGORIES)) {
      const tab = category.tabs.find(t => t.id === activeTab);
      if (tab) return tab;
    }
    return TAB_CATEGORIES.workflow.tabs[0];
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const TabLoading = () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="ml-3 text-muted-foreground">Loading...</span>
    </div>
  );

  const currentTabInfo = getCurrentTabInfo();
  const currentCategoryKey = getCurrentCategoryKey();

  return (
    <div className={cn("flex h-[calc(100vh-8rem)]", className)}>
      {/* LEFT SIDE PANEL - Navigation */}
      <aside 
        className={cn(
          "flex-shrink-0 border-r bg-muted/30 transition-all duration-300 overflow-hidden",
          sidebarCollapsed ? "w-14" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Side Panel Header */}
          <div className="flex items-center justify-between p-3 border-b bg-background">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">Production Hub</span>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? (
                    <PanelLeft className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {sidebarCollapsed ? 'Expand panel' : 'Collapse panel'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Navigation Categories */}
          <ScrollArea className="flex-1 py-2">
            <TooltipProvider delayDuration={0}>
              <div className="space-y-1 px-2">
                {CATEGORY_ORDER.map(categoryKey => {
                  const category = TAB_CATEGORIES[categoryKey as keyof typeof TAB_CATEGORIES];
                  const isOpen = openCategories.includes(categoryKey);
                  const isActiveCategory = currentCategoryKey === categoryKey;
                  const CategoryIcon = category.icon;

                  if (sidebarCollapsed) {
                    // Collapsed: Show only icons with dropdown on hover
                    return (
                      <div key={categoryKey} className="py-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={isActiveCategory ? "secondary" : "ghost"}
                              size="icon"
                              className="w-10 h-10"
                              onClick={() => handleTabChange(category.tabs[0].id)}
                            >
                              <CategoryIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="space-y-1">
                            <p className="font-medium">{category.label}</p>
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  }

                  // Expanded: Show collapsible categories
                  return (
                    <Collapsible
                      key={categoryKey}
                      open={isOpen}
                      onOpenChange={() => toggleCategory(categoryKey)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between px-3 py-2 h-auto",
                            isActiveCategory && "bg-primary/10 text-primary"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4" />
                            <div className="text-left">
                              <p className="text-sm font-medium">{category.label}</p>
                              <p className="text-xs text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 pt-1 space-y-1">
                        {category.tabs.map(tab => {
                          const TabIcon = tab.icon;
                          const isActive = activeTab === tab.id;
                          
                          return (
                            <Tooltip key={tab.id}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={isActive ? "secondary" : "ghost"}
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start gap-2 h-9",
                                    isActive && "bg-primary/15 text-primary font-medium"
                                  )}
                                  onClick={() => handleTabChange(tab.id)}
                                >
                                  <TabIcon className="h-4 w-4" />
                                  <span>{tab.label}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                {tab.description}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </TooltipProvider>
          </ScrollArea>
        </div>
      </aside>

      {/* RIGHT PANEL - Content View */}
      <main className="flex-1 overflow-hidden">
        {/* Content Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <currentTabInfo.icon className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-semibold">{currentTabInfo.label}</h2>
              <p className="text-xs text-muted-foreground">{currentTabInfo.description}</p>
            </div>
          </div>
          
          {/* Quick Actions based on current tab */}
          {activeTab === 'composition' && (
            <Button size="sm" onClick={handleCreateNew}>
              <Layers className="w-4 h-4 mr-2" />
              New Composition
            </Button>
          )}
        </div>

        {/* Content Area */}
        <ScrollArea className="h-[calc(100%-65px)]">
          <div className="p-4">
            {/* Kanban Tab */}
            {activeTab === 'kanban' && (
              <div className="space-y-4">
                {/* Category Selector */}
                <div className="flex flex-wrap items-center gap-3 pb-4 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Type:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={activeCategory === 'media_production' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory('media_production')}
                      className="gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Media
                    </Button>
                    <Button
                      variant={activeCategory === 'business_meeting' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory('business_meeting')}
                      className="gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Meetings
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
                      Demos
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
              <ContentLibrary />
            )}

            {/* Composition Tab */}
            {activeTab === 'composition' && (
              <UnifiedCompositionStudio />
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
              <Suspense fallback={<TabLoading />}>
                <GenieCommandCenter />
              </Suspense>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default ProductionHubAdmin;
