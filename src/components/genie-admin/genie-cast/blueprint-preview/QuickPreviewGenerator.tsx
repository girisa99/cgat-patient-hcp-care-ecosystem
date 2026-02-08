/**
 * Quick Preview Generator
 * Orchestrates both Storyboard (free) and Low-res Video (480p) preview modes
 * Integrates SceneAssetMapper + StoryboardPreview
 */

import React, { useState, useMemo } from 'react';
import {
  Play,
  Image as ImageIcon,
  Film,
  Wand2,
  Loader2,
  Eye,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';
import { SceneAssetMapper, type AssetItem, type SceneAssetMapping } from './SceneAssetMapper';
import { StoryboardPreview } from './StoryboardPreview';

interface QuickPreviewGeneratorProps {
  scenes: BlueprintScene[];
  blueprintId: string;
  blueprintName: string;
  /** If provided, filters available assets to only those belonging to this product */
  productFilter?: string;
  className?: string;
}

type PreviewMode = 'setup' | 'storyboard' | 'video';

export function QuickPreviewGenerator({
  scenes,
  blueprintId,
  blueprintName,
  productFilter,
  className,
}: QuickPreviewGeneratorProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<PreviewMode>('setup');
  const [mappings, setMappings] = useState<SceneAssetMapping[]>([]);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assets' | 'preview'>('assets');

  // Load available brand assets from Supabase storage
  const [availableAssets, setAvailableAssets] = useState<AssetItem[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // Load assets on mount
  React.useEffect(() => {
    loadBrandAssets();
  }, []);

  const loadBrandAssets = async () => {
    setIsLoadingAssets(true);
    try {
      // Load from product-screenshots bucket — files are in 'screenshots/' subfolder
      const { data: screenshots } = await supabase.storage
        .from('product-screenshots')
        .list('screenshots', { limit: 50 });

      // Load from brand-assets bucket — logos are at the ROOT level (not in 'logos/' subfolder)
      const { data: brandFiles } = await supabase.storage
        .from('brand-assets')
        .list('', { limit: 50 });

      const assets: AssetItem[] = [];

      // Map screenshots (stored under screenshots/ prefix)
      // If productFilter is set, only include screenshots for that product
      if (screenshots) {
        for (const file of screenshots) {
          if (file.name && !file.name.startsWith('.') && file.id) {
            // Product filter: check if filename starts with the product ID
            if (productFilter && !file.name.startsWith(`${productFilter}-`)) {
              continue; // Skip assets not belonging to the filtered product
            }
            const { data: urlData } = supabase.storage
              .from('product-screenshots')
              .getPublicUrl(`screenshots/${file.name}`);
            assets.push({
              id: `screenshot-${file.id}`,
              name: file.name,
              url: urlData.publicUrl,
              type: 'screenshot',
            });
          }
        }
      }

      // Map logos — filter by product if specified
      if (brandFiles) {
        for (const file of brandFiles) {
          if (file.name && !file.name.startsWith('.') && file.id && file.name.includes('logo')) {
            // Product filter: only include logo for specific product
            if (productFilter && !file.name.includes(`genie-${productFilter}`)) {
              continue;
            }
            const { data: urlData } = supabase.storage
              .from('brand-assets')
              .getPublicUrl(file.name);
            assets.push({
              id: `logo-${file.id}`,
              name: file.name,
              url: urlData.publicUrl,
              type: 'logo',
            });
          }
        }
      }

      // Also add demo images as additional assets
      if (brandFiles) {
        for (const file of brandFiles) {
          if (file.name && !file.name.startsWith('.') && file.id && file.name.includes('demo')) {
            const { data: urlData } = supabase.storage
              .from('brand-assets')
              .getPublicUrl(file.name);
            assets.push({
              id: `image-${file.id}`,
              name: file.name,
              url: urlData.publicUrl,
              type: 'image',
            });
          }
        }
      }

      console.log(`✅ Loaded ${assets.length} brand assets (${assets.filter(a => a.type === 'logo').length} logos, ${assets.filter(a => a.type === 'screenshot').length} screenshots, ${assets.filter(a => a.type === 'image').length} images)`);
      setAvailableAssets(assets);
    } catch (err) {
      console.error('Failed to load brand assets:', err);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Scene durations map
  const sceneDurations = useMemo(() => {
    const map: Record<string, number> = {};
    scenes.forEach(s => {
      map[s.id] = s.duration_seconds;
    });
    return map;
  }, [scenes]);

  const handleMappingsChange = (newMappings: SceneAssetMapping[]) => {
    setMappings(newMappings);
  };

  const handleShowStoryboard = () => {
    if (mappings.filter(m => m.assignedAsset).length === 0) {
      toast({
        title: 'No Assets Assigned',
        description: 'Assign at least one asset to a scene to see the storyboard preview.',
        variant: 'destructive',
      });
      return;
    }
    setActiveTab('preview');
    setMode('storyboard');
  };

  const handleRequestVideoPreview = async () => {
    setIsGeneratingVideo(true);
    try {
      // Build scene-to-asset mapping for the assembler
      const sceneAssets = mappings.map(m => ({
        scene_id: m.sceneId,
        scene_key: m.sceneKey,
        asset_url: m.assignedAsset?.url || null,
        asset_type: m.assignedAsset?.type || null,
        duration: sceneDurations[m.sceneId] || 5,
      }));

      const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
        body: {
          action: 'preview',
          language: 'en',
          blueprint_id: blueprintId,
          quality: '480p',
          scene_assets: sceneAssets,
          preview_mode: true,
        },
      });

      if (error) throw error;

      if (data?.video_url) {
        setVideoPreviewUrl(data.video_url);
        setMode('video');
        toast({
          title: 'Video Preview Ready',
          description: 'Your 480p preview has been generated.',
        });
      } else if (data?.status === 'pending') {
        toast({
          title: 'Video Processing',
          description: 'Your preview is being generated. Check back in a moment.',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Preview Failed',
        description: err.message || 'Could not generate video preview',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const assignedCount = mappings.filter(m => m.assignedAsset).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Quick Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] cursor-pointer transition-colors",
              activeTab === 'assets' && "bg-primary/10 border-primary/30"
            )}
            onClick={() => setActiveTab('assets')}
          >
            <ImageIcon className="h-3 w-3 mr-1" />
            Asset Setup
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] cursor-pointer transition-colors",
              activeTab === 'preview' && "bg-primary/10 border-primary/30"
            )}
            onClick={handleShowStoryboard}
          >
            <Play className="h-3 w-3 mr-1" />
            Preview
          </Badge>
        </div>
      </div>

      {/* Asset Setup Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          {isLoadingAssets ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SceneAssetMapper
              scenes={scenes}
              availableAssets={availableAssets}
              onMappingsChange={handleMappingsChange}
            />
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5" />
              {assignedCount > 0
                ? `${assignedCount} scenes with assets ready`
                : 'Assign assets to preview'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleShowStoryboard}
                disabled={assignedCount === 0}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Storyboard (Free)
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleRequestVideoPreview}
                disabled={assignedCount === 0 || isGeneratingVideo}
              >
                {isGeneratingVideo ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Film className="h-3.5 w-3.5" />
                )}
                Video 480p (~1 credit)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          {mode === 'storyboard' && (
            <StoryboardPreview
              mappings={mappings}
              sceneDurations={sceneDurations}
              onRequestVideoPreview={handleRequestVideoPreview}
            />
          )}

          {mode === 'video' && videoPreviewUrl && (
            <div className="space-y-3">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border/50">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                />
                <Badge className="absolute top-3 right-3 bg-primary/80 text-primary-foreground border-0 text-[10px]">
                  480p Preview
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded-md p-2 border border-border/30">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>This is a low-res preview. Final production will be rendered at full quality.</span>
              </div>
            </div>
          )}

          {mode === 'video' && !videoPreviewUrl && isGeneratingVideo && (
            <div className="flex items-center justify-center h-48 bg-muted/20 rounded-lg border border-border/50">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Generating 480p preview...</p>
                <p className="text-[10px] text-muted-foreground mt-1">This may take 30-60 seconds</p>
              </div>
            </div>
          )}

          {/* Back to Setup */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => setActiveTab('assets')}
          >
            ← Back to Asset Setup
          </Button>
        </div>
      )}
    </div>
  );
}
