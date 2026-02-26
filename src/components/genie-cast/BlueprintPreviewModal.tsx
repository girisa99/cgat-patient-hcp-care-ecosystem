/**
 * Blueprint Preview Modal
 * Shows template details with scene timeline, AI provider info, and preview capabilities
 * Refactored into focused sub-components for each tab
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  Eye,
  Save,
  Loader2,
  Undo2,
  CheckCircle2,
  Cloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoBlueprint, BlueprintScene } from '@/hooks/useVideoBlueprints';
import { useBlueprintDraft } from '@/hooks/useBlueprintDraft';
import { useGenieCastSession } from '@/hooks/useGenieCastSession';
import { useProductContext } from '@/hooks/useProductContext';
import { OverviewTab } from './blueprint-preview/OverviewTab';
import { SceneTimelineTab } from './blueprint-preview/SceneTimelineTab';
import { AIModelsTab } from './blueprint-preview/AIModelsTab';
import { ProductionConfigTab } from './blueprint-preview/ProductionConfigTab';
import { QuickPreviewGenerator } from './blueprint-preview/QuickPreviewGenerator';

interface BlueprintPreviewModalProps {
  blueprint: VideoBlueprint | null;
  scenes: BlueprintScene[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (blueprint: VideoBlueprint, overrides?: { targetPlatforms?: string[] }) => void;
  onAssign?: (blueprint: VideoBlueprint, productId: string) => void;
  onRegenerateThumbnail?: (blueprintId: string, prompt: string) => void;
  isRegenerating?: boolean;
  selectedVideoStyles?: any[];
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
  selectedVideoStyles,
}: BlueprintPreviewModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedScene, setExpandedScene] = useState<string | null>(null);
  const [userPlatforms, setUserPlatforms] = useState<string[]>(blueprint?.target_platform || []);

  // Auto-fetch scenes from DB when not passed inline
  const shouldFetchScenes = scenes.length === 0 && !!blueprint?.id;
  const { data: fetchedScenes } = useQuery({
    queryKey: ['blueprint-scenes-preview', blueprint?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blueprint_scenes')
        .select('*')
        .eq('blueprint_id', blueprint!.id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as BlueprintScene[];
    },
    enabled: shouldFetchScenes,
    staleTime: 5 * 60 * 1000,
  });
  const resolvedScenes = scenes.length > 0 ? scenes : (fetchedScenes || []);

  // Product context for scene enrichment
  const { session } = useGenieCastSession();
  const productCtx = useProductContext(session.selectedProductId);

  // Database-backed draft persistence (replaces local state)
  const {
    scenes: draftScenes,
    hasDraft,
    isLoading: isDraftLoading,
    isSaving,
    lastSavedAt,
    draftStatus,
    updateScenes,
    saveNow,
    commitDraft,
    discardDraft,
    changeLog,
  } = useBlueprintDraft(blueprint?.id ?? null, resolvedScenes);

  const handleScenesModified = (updatedScenes: BlueprintScene[], description: string) => {
    updateScenes(updatedScenes, description);
  };

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
    onSelect(blueprint, { targetPlatforms: userPlatforms });
    onClose();
  };

  const handleRegenerateThumbnail = (prompt: string) => {
    onRegenerateThumbnail?.(blueprint.id, prompt);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent 
        className="max-w-5xl p-0 bg-background/95 backdrop-blur-xl border-border/50 !flex !flex-col overflow-hidden"
        style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
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
                <TabsTrigger value="preview" className="data-[state=active]:bg-primary/10">
                  <Eye className="h-3 w-3 mr-1" />
                  Quick Preview
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
                scenes={draftScenes}
                targetPlatforms={userPlatforms}
                suggestedPlatforms={blueprint.target_platform || []}
                industryTags={blueprint.industry_tags || []}
                expandedScene={expandedScene}
                onExpandScene={setExpandedScene}
                onSwitchToTimeline={() => setActiveTab('timeline')}
                onPlatformsChange={setUserPlatforms}
                formatDuration={formatDuration}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <SceneTimelineTab
                scenes={draftScenes}
                expandedScene={expandedScene}
                onExpandScene={setExpandedScene}
                formatDuration={formatDuration}
                isEditable={true}
                onScenesModified={handleScenesModified}
                approvedMessaging={session.approvedMessaging}
                productName={productCtx.product?.name}
                productAssets={productCtx.assets.map(a => ({
                  id: a.id,
                  url: a.public_url || a.storage_path || '',
                  type: 'screenshot',
                }))}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="p-6">
                <QuickPreviewGenerator
                  scenes={draftScenes}
                  blueprintId={blueprint.id}
                  blueprintName={blueprint.name}
                  selectedVideoStyles={selectedVideoStyles}
                />
              </div>
            </TabsContent>

            <TabsContent value="ai-models" className="mt-0">
              <AIModelsTab
                blueprint={blueprint}
                onRegenerateThumbnail={handleRegenerateThumbnail}
                isRegenerating={isRegenerating}
                region={blueprint.target_regions?.[0] || 'global'}
              />
            </TabsContent>

            <TabsContent value="production-config" className="mt-0">
              <ProductionConfigTab 
                blueprint={blueprint} 
                selectedVideoStyles={selectedVideoStyles}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions - ALWAYS visible outside scroll area */}
        <div className="p-4 border-t border-border/50 flex justify-between items-center bg-background flex-shrink-0" style={{ flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Used {blueprint.usage_count} times
            </div>
            {/* Draft status indicator */}
            {hasDraft && (
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </Badge>
                ) : lastSavedAt ? (
                  <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30">
                    <Cloud className="h-3 w-3" />
                    Saved
                  </Badge>
                ) : null}
                {draftStatus === 'committed' && (
                  <Badge className="text-[10px] gap-1 bg-primary text-primary-foreground border-0">
                    <CheckCircle2 className="h-3 w-3" />
                    Committed
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {hasDraft && draftStatus === 'draft' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 text-destructive hover:text-destructive"
                  onClick={discardDraft}
                >
                  <Undo2 className="h-3 w-3" />
                  Discard Changes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={saveNow}
                  disabled={isSaving}
                >
                  <Save className="h-3 w-3" />
                  Save Draft
                </Button>
              </>
            )}
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
