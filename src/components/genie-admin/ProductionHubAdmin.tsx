/**
 * PRODUCTION HUB ADMIN PANEL
 * 
 * Unified admin panel for managing:
 * - Content Library: View/edit existing generated content
 * - Composition Studio: Multi-modal, multi-language content creation
 * - Content scheduler across 14 regions and 6 platforms
 * - Analytics and monitoring for videos and scheduler
 * - Workspace and team management
 * 
 * Tied to Arc/Production Hub functionality
 * Supports deep-linking via URL params (?show=id, ?linkScript=id, ?tab=xxx)
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, Calendar, BarChart3, 
  Globe, Wand2, Sparkles,
  Building2, Users, Paintbrush,
  FolderOpen, Layers
} from 'lucide-react';
import { UnifiedCompositionStudio, ContentLibrary } from './composition-studio';
import { ContentSchedulerDashboard } from './ContentSchedulerDashboard';
import { ProductionAnalytics } from './ProductionAnalytics';
import { WorkspaceManagement } from './WorkspaceManagement';
import { TeamInviteManagement } from './TeamInviteManagement';
import { WhitelabelConfiguration } from './WhitelabelConfiguration';
import { toast } from 'sonner';

interface ProductionHubAdminProps {
  className?: string;
}

type AdminTab = 'library' | 'composition' | 'scheduler' | 'analytics' | 'workspaces' | 'team' | 'whitelabel';

export const ProductionHubAdmin: React.FC<ProductionHubAdminProps> = ({ className }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL or default to 'library'
  const initialTab = (searchParams.get('tab') as AdminTab) || 'library';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  
  // Handle deep-linking for show/script
  const showId = searchParams.get('show');
  const linkScriptId = searchParams.get('linkScript');

  useEffect(() => {
    // If coming with show or script params, switch to composition tab
    if (showId || linkScriptId) {
      setActiveTab('composition');
      if (showId) {
        toast.info(`Opening show: ${showId}`);
      } else if (linkScriptId) {
        toast.info('Ready to link script to new composition');
      }
    }
  }, [showId, linkScriptId]);

  // Sync tab changes to URL
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab as AdminTab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', newTab);
    // Clear show/script params when changing tabs
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

      {/* Main Tabs - Content Library as primary, then Composition Studio */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden lg:inline">Content Library</span>
            <span className="lg:hidden">Library</span>
          </TabsTrigger>
          <TabsTrigger value="composition" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden lg:inline">Create New</span>
            <span className="lg:hidden">Create</span>
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden lg:inline">Scheduler</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden lg:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden lg:inline">Workspaces</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden lg:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="whitelabel" className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            <span className="hidden lg:inline">Whitelabel</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Library - View existing content */}
        <TabsContent value="library" className="mt-6">
          <ContentLibrary 
            onEdit={handleEditComposition}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>

        {/* Composition Studio - Create new content */}
        <TabsContent value="composition" className="mt-6">
          <UnifiedCompositionStudio />
        </TabsContent>

        <TabsContent value="scheduler" className="mt-6">
          <ContentSchedulerDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <ProductionAnalytics />
        </TabsContent>

        <TabsContent value="workspaces" className="mt-6">
          <WorkspaceManagement />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamInviteManagement />
        </TabsContent>

        <TabsContent value="whitelabel" className="mt-6">
          <WhitelabelConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionHubAdmin;
