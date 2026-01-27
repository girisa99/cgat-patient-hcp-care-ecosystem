/**
 * PRODUCTION HUB ADMIN PANEL
 * 
 * Comprehensive admin panel for managing:
 * - Landing video generation with AI (TTS, Avatars, 3D)
 * - Advanced Avatar & 3D generation (Alibaba, Meshy, ModelsLab, DeepSeek)
 * - Content scheduler across 14 regions and 6 platforms
 * - Analytics and monitoring for videos and scheduler
 * 
 * Tied to Arc/Production Hub functionality
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, Calendar, BarChart3, Settings, 
  Globe, Wand2, Play, RefreshCw, User, Box,
  Building2, Users, Paintbrush
} from 'lucide-react';
import { VideoGenerationStudio } from './VideoGenerationStudio';
import { ContentSchedulerDashboard } from './ContentSchedulerDashboard';
import { ProductionAnalytics } from './ProductionAnalytics';
import { AdvancedAvatarGenerationPanel } from './AdvancedAvatarGenerationPanel';
import { WorkspaceManagement } from './WorkspaceManagement';
import { TeamInviteManagement } from './TeamInviteManagement';
import { WhitelabelConfiguration } from './WhitelabelConfiguration';

interface ProductionHubAdminProps {
  className?: string;
}

export const ProductionHubAdmin: React.FC<ProductionHubAdminProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('video-studio');

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
            Manage AI video generation, avatars, 3D content, scheduling, and analytics
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
                <User className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Avatars Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Box className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">3D Models</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Globe className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">14</p>
                <p className="text-xs text-muted-foreground">Active Regions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">8.5K</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="video-studio" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span className="hidden lg:inline">Video Studio</span>
          </TabsTrigger>
          <TabsTrigger value="avatar-3d" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden lg:inline">Avatar & 3D</span>
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

        <TabsContent value="video-studio" className="mt-6">
          <VideoGenerationStudio />
        </TabsContent>

        <TabsContent value="avatar-3d" className="mt-6">
          <AdvancedAvatarGenerationPanel />
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
