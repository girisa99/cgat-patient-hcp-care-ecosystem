/**
 * Scene Asset Mapper
 * Auto-assigns brand assets (screenshots, logos) to blueprint scenes
 * with drag-drop override capability
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Shuffle,
  Check,
  X,
  GripVertical,
  Layers,
  Sparkles,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';

export interface AssetItem {
  id: string;
  name: string;
  url: string;
  type: 'screenshot' | 'logo' | 'image' | 'video';
  thumbnailUrl?: string;
}

export interface SceneAssetMapping {
  sceneId: string;
  sceneKey: string;
  sceneTitle: string;
  sceneType: string;
  assignedAsset: AssetItem | null;
  isAutoAssigned: boolean;
}

interface SceneAssetMapperProps {
  scenes: BlueprintScene[];
  availableAssets: AssetItem[];
  onMappingsChange?: (mappings: SceneAssetMapping[]) => void;
  className?: string;
}

/**
 * Auto-assignment strategy:
 * 1. Intro scenes → first logo or first screenshot
 * 2. Feature/demo scenes → screenshots in order
 * 3. CTA/outro scenes → logo or last screenshot
 * 4. Content scenes → remaining screenshots distributed evenly
 */
function autoAssignAssets(
  scenes: BlueprintScene[],
  assets: AssetItem[]
): SceneAssetMapping[] {
  const logos = assets.filter(a => a.type === 'logo');
  const screenshots = assets.filter(a => a.type === 'screenshot' || a.type === 'image');
  let screenshotIndex = 0;

  return scenes.map((scene) => {
    let assignedAsset: AssetItem | null = null;

    switch (scene.scene_type) {
      case 'intro':
        assignedAsset = logos[0] || screenshots[0] || null;
        break;
      case 'outro':
      case 'cta':
        assignedAsset = logos[0] || screenshots[screenshots.length - 1] || null;
        break;
      case 'feature':
      case 'demo':
      case 'content':
      case 'testimonial':
      default:
        if (screenshotIndex < screenshots.length) {
          assignedAsset = screenshots[screenshotIndex];
          screenshotIndex++;
        } else if (screenshots.length > 0) {
          // Wrap around
          assignedAsset = screenshots[screenshotIndex % screenshots.length];
          screenshotIndex++;
        }
        break;
    }

    return {
      sceneId: scene.id,
      sceneKey: scene.scene_key,
      sceneTitle: scene.title,
      sceneType: scene.scene_type,
      assignedAsset,
      isAutoAssigned: true,
    };
  });
}

export function SceneAssetMapper({
  scenes,
  availableAssets,
  onMappingsChange,
  className,
}: SceneAssetMapperProps) {
  const [mappings, setMappings] = useState<SceneAssetMapping[]>([]);
  const [draggedAssetId, setDraggedAssetId] = useState<string | null>(null);
  const [dragOverSceneId, setDragOverSceneId] = useState<string | null>(null);

  // Auto-assign on mount or when scenes/assets change
  useEffect(() => {
    const auto = autoAssignAssets(scenes, availableAssets);
    setMappings(auto);
    onMappingsChange?.(auto);
  }, [scenes, availableAssets]);

  const handleResetAll = useCallback(() => {
    const auto = autoAssignAssets(scenes, availableAssets);
    setMappings(auto);
    onMappingsChange?.(auto);
  }, [scenes, availableAssets, onMappingsChange]);

  const handleDragStart = (e: React.DragEvent, assetId: string) => {
    setDraggedAssetId(assetId);
    e.dataTransfer.setData('text/plain', assetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, sceneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSceneId(sceneId);
  };

  const handleDragLeave = () => {
    setDragOverSceneId(null);
  };

  const handleDrop = (e: React.DragEvent, sceneId: string) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData('text/plain');
    const asset = availableAssets.find(a => a.id === assetId);
    if (!asset) return;

    setMappings(prev => {
      const updated = prev.map(m =>
        m.sceneId === sceneId
          ? { ...m, assignedAsset: asset, isAutoAssigned: false }
          : m
      );
      onMappingsChange?.(updated);
      return updated;
    });

    setDraggedAssetId(null);
    setDragOverSceneId(null);
  };

  const handleClearScene = (sceneId: string) => {
    setMappings(prev => {
      const updated = prev.map(m =>
        m.sceneId === sceneId
          ? { ...m, assignedAsset: null, isAutoAssigned: false }
          : m
      );
      onMappingsChange?.(updated);
      return updated;
    });
  };

  const assignedCount = mappings.filter(m => m.assignedAsset).length;
  const totalScenes = mappings.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Scene Asset Mapping</h3>
          <Badge variant="outline" className="text-[10px]">
            {assignedCount}/{totalScenes} assigned
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleResetAll}
                >
                  <RotateCcw className="h-3 w-3" />
                  Auto-assign
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset all assignments using smart auto-assign</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Instructions */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded-md p-2 border border-border/30">
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Drag assets from the panel below onto scenes to override auto-assignment</span>
      </div>

      {/* Two-column layout: Scenes (left) + Available Assets (right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scene Slots */}
        <div className="md:col-span-2 space-y-2">
          {mappings.map((mapping, index) => (
            <div
              key={mapping.sceneId}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                dragOverSceneId === mapping.sceneId
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border/50 bg-card/50 hover:border-border"
              )}
              onDragOver={(e) => handleDragOver(e, mapping.sceneId)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, mapping.sceneId)}
            >
              {/* Scene Number */}
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                {index + 1}
              </div>

              {/* Scene Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{mapping.sceneTitle}</span>
                  <Badge variant="outline" className="text-[9px] capitalize h-4 flex-shrink-0">
                    {mapping.sceneType}
                  </Badge>
                </div>
              </div>

              {/* Assigned Asset Preview */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {mapping.assignedAsset ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-16 h-10 rounded border border-border/50 overflow-hidden bg-muted">
                      <img
                        src={mapping.assignedAsset.thumbnailUrl || mapping.assignedAsset.url}
                        alt={mapping.assignedAsset.name}
                        className="w-full h-full object-cover"
                      />
                      {mapping.isAutoAssigned && (
                        <div className="absolute top-0.5 left-0.5">
                          <Sparkles className="h-2.5 w-2.5 text-primary" />
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleClearScene(mapping.sceneId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-16 h-10 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Asset Panel */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Available Assets ({availableAssets.length})
          </div>
          <ScrollArea className="h-[300px] rounded-lg border border-border/50 bg-muted/20 p-2">
            {availableAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Upload className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No assets available. Upload screenshots and logos in Brand Assets.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableAssets.map((asset) => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, asset.id)}
                    className={cn(
                      "relative rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:border-primary/50 hover:shadow-sm",
                      draggedAssetId === asset.id
                        ? "opacity-50 border-primary"
                        : "border-border/50"
                    )}
                  >
                    <div className="aspect-video bg-muted">
                      <img
                        src={asset.thumbnailUrl || asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1">
                      <p className="text-[9px] text-muted-foreground truncate">{asset.name}</p>
                    </div>
                    <div className="absolute top-1 right-1">
                      <GripVertical className="h-3 w-3 text-muted-foreground/60" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
