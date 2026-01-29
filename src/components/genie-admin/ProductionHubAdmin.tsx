/**
 * PRODUCTION HUB ADMIN PANEL
 * 
 * SIMPLIFIED: No internal sidebar - navigation is now in global sidebar
 * This component just renders the content based on the tab parameter
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Video, Users, CalendarDays, Sparkles, Loader2 } from 'lucide-react';
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

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as AdminTab;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

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

  return (
    <div className={cn("h-full min-h-[calc(100vh-4rem)]", className)}>
      <ScrollArea className="h-full">
        <div className="p-2 sm:p-4">
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

          {/* Composition Tab */}
          {activeTab === 'composition' && (
            <UnifiedCompositionStudio 
              compositionId={searchParams.get('show') || undefined}
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
            <Suspense fallback={<TabLoading />}>
              <GenieCommandCenter />
            </Suspense>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProductionHubAdmin;
