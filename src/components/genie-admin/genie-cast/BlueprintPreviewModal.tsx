/**
 * Blueprint Preview Modal
 * Shows template details with scene timeline, AI provider info, and preview capabilities
 * Refactored into focused sub-components for each tab
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Sparkles,
  Cpu,
  Settings2,
  Globe2,
  Wand2,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoBlueprint, BlueprintScene } from '@/hooks/useVideoBlueprints';
import { OverviewTab } from './blueprint-preview/OverviewTab';
import { SceneTimelineTab } from './blueprint-preview/SceneTimelineTab';
import { AIModelsTab } from './blueprint-preview/AIModelsTab';
import { ProductionConfigTab } from './blueprint-preview/ProductionConfigTab';

interface BlueprintPreviewModalProps {
  blueprint: VideoBlueprint | null;
  scenes: BlueprintScene[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (blueprint: VideoBlueprint) => void;
  onAssign?: (blueprint: VideoBlueprint, productId: string) => void;
  onRegenerateThumbnail?: (blueprintId: string, prompt: string) => void;
  isRegenerating?: boolean;
}

export function BlueprintPreviewModal({
  blueprint,
  scenes,
  isOpen,
  onClose,
  onSelect,
  onAssign,
  onRegenerateThumbnail,
  isRegenerating,
}: BlueprintPreviewModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedScene, setExpandedScene] = useState<string | null>(null);

  if (!blueprint) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Extract AI provider metadata from style_preset
  const stylePreset = blueprint.style_preset as any || {};
  const thumbnailProvider = stylePreset.thumbnail_provider;
  const thumbnailRegion = stylePreset.thumbnail_region;

  const handleUseTemplate = () => {
    onSelect(blueprint);
    onClose();
  };

  const handleRegenerateThumbnail = (prompt: string) => {
    onRegenerateThumbnail?.(blueprint.id, prompt);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-5xl p-0 bg-background/95 backdrop-blur-xl border-border/50 !flex !flex-col overflow-hidden"
        style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Hero Section with Thumbnail */}
          <div className="relative">
            {blueprint.thumbnail_url ? (
              <div className="relative h-40 md:h-48 overflow-hidden">
                <img 
                  src={blueprint.thumbnail_url} 
                  alt={blueprint.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                {/* Region badge */}
                {thumbnailRegion && thumbnailRegion !== 'global' && (
                  <Badge className="absolute top-4 right-4 bg-background/90 text-foreground">
                    <Globe2 className="h-3 w-3 mr-1" />
                    {thumbnailRegion.toUpperCase()}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Title overlaid on gradient */}
            <DialogHeader className="absolute bottom-0 left-0 right-0 p-4 pt-8">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-foreground drop-shadow-sm">{blueprint.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl line-clamp-2">{blueprint.description}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Badge variant="outline" className="capitalize bg-background/80 text-xs">
                    {blueprint.category}
                  </Badge>
                  {blueprint.is_system_default ? (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Built-in Template
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Custom Template
                    </Badge>
                  )}
                  {/* Capability badges */}
                  {(blueprint.default_settings as any)?.avatarEnabled && (
                    <Badge className="bg-primary/80 text-primary-foreground text-xs border-0">Avatar</Badge>
                  )}
                  {(blueprint.default_settings as any)?.['3dEnabled'] && (
                    <Badge className="bg-accent text-accent-foreground text-xs border-0">3D</Badge>
                  )}
                  {(blueprint.default_settings as any)?.animationEnabled && (
                    <Badge className="bg-secondary text-secondary-foreground text-xs border-0">Animation</Badge>
                  )}
                  {(blueprint.default_settings as any)?.arvrEnabled && (
                    <Badge className="bg-muted text-muted-foreground text-xs border-0">AR/VR</Badge>
                  )}
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <TabsList className="bg-transparent">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-primary/10">
                  Scene Timeline
                </TabsTrigger>
                <TabsTrigger value="ai-models" className="data-[state=active]:bg-primary/10">
                  <Cpu className="h-3 w-3 mr-1" />
                  AI Models
                </TabsTrigger>
                <TabsTrigger value="production-config" className="data-[state=active]:bg-primary/10">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Production Config
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-0">
              <OverviewTab
                scenes={scenes}
                targetPlatforms={blueprint.target_platform || []}
                industryTags={blueprint.industry_tags || []}
                expandedScene={expandedScene}
                onExpandScene={setExpandedScene}
                onSwitchToTimeline={() => setActiveTab('timeline')}
                formatDuration={formatDuration}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <SceneTimelineTab
                scenes={scenes}
                expandedScene={expandedScene}
                onExpandScene={setExpandedScene}
                formatDuration={formatDuration}
                isEditable={true}
              />
            </TabsContent>

            <TabsContent value="ai-models" className="mt-0">
              <AIModelsTab
                blueprint={blueprint}
                onRegenerateThumbnail={handleRegenerateThumbnail}
                isRegenerating={isRegenerating}
              />
            </TabsContent>

            <TabsContent value="production-config" className="mt-0">
              <ProductionConfigTab blueprint={blueprint} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions - ALWAYS visible outside scroll area */}
        <div className="p-4 border-t border-border/50 flex justify-between items-center bg-background flex-shrink-0" style={{ flexShrink: 0 }}>
          <div className="text-sm text-muted-foreground">
            Used {blueprint.usage_count} times
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUseTemplate} className="gap-2">
              <Play className="h-4 w-4" />
              Use This Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BlueprintPreviewModal;
