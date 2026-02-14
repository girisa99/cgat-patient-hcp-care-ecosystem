/**
 * Blueprint Preview Modal - Scene Timeline Tab
 * Interactive scene editing with drag-and-drop reorder, inline editing,
 * visual config toggles, add/remove/duplicate
 * 
 * P5 Enhancement: Scenes are enriched with Content Pool context
 * (product metadata, brand assets, regional scripts) for consistent messaging
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Clock, Info, Package, Palette, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';
import { SortableSceneItem } from './SortableSceneItem';
import { AddSceneDropdown } from './AddSceneDropdown';
import { AISceneCustomizer } from './AISceneCustomizer';
import { TranslationTranscreationToggle } from '../TranslationTranscreationToggle';
import { useSceneEnrichment } from '@/hooks/useSceneEnrichment';
import { toast } from 'sonner';

import type { ApprovedMessagingContext } from './SortableSceneItem';

interface SceneTimelineTabProps {
  scenes: BlueprintScene[];
  expandedScene: string | null;
  onExpandScene: (sceneId: string | null) => void;
  formatDuration: (seconds: number) => string;
  isEditable?: boolean;
  onScenesModified?: (scenes: BlueprintScene[], description: string) => void;
  /** Language code for AI routing context */
  language?: string;
  /** Regional zone for provider routing */
  region?: string;
  /** Show transcreation toggle in scene timeline */
  showTranscreation?: boolean;
  /** Approved messaging for resolving {{variables}} in scenes */
  approvedMessaging?: ApprovedMessagingContext | null;
  /** Selected product name */
  productName?: string;
  /** Product screenshots/assets for per-scene thumbnails */
  productAssets?: Array<{ id: string; url: string; type: string }>;
}

export function SceneTimelineTab({
  scenes,
  expandedScene,
  onExpandScene,
  formatDuration,
  isEditable = true,
  onScenesModified,
  language = 'en',
  region = 'global',
  showTranscreation = false,
  approvedMessaging,
  productName,
  productAssets = [],
}: SceneTimelineTabProps) {
  const [durationOverrides, setDurationOverrides] = useState<Record<string, number>>({});

  const getEffectiveDuration = (scene: BlueprintScene) => {
    return durationOverrides[scene.id] ?? scene.duration_seconds;
  };

  const totalDuration = scenes.reduce((sum, s) => sum + getEffectiveDuration(s), 0);

  // Auto-assign product asset thumbnails to scenes
  const sceneThumbnails = useMemo(() => {
    if (productAssets.length === 0) return {};
    const map: Record<string, string> = {};
    scenes.forEach((scene, i) => {
      if (productAssets.length > 0) {
        const asset = productAssets[i % productAssets.length];
        map[scene.id] = (asset as any).thumbnailUrl || (asset as any).public_url || asset.url;
      }
    });
    return map;
  }, [scenes, productAssets]);

  // ====== DND-KIT SENSORS ======
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ====== HANDLERS ======
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = scenes.findIndex(s => s.id === active.id);
    const newIndex = scenes.findIndex(s => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(scenes, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order_index: i,
    }));

    onScenesModified?.(reordered, `Moved "${scenes[oldIndex].title}" to position ${newIndex + 1}`);
    toast.success(`Moved "${scenes[oldIndex].title}" to position ${newIndex + 1}`);
  }, [scenes, onScenesModified]);

  const handleDurationChange = useCallback((sceneId: string, duration: number) => {
    setDurationOverrides(prev => ({ ...prev, [sceneId]: duration }));
  }, []);

  const handleRemoveScene = useCallback((sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    if (!scene.is_optional) {
      toast.error('Required scenes cannot be removed');
      return;
    }

    const updated = scenes
      .filter(s => s.id !== sceneId)
      .map((s, i) => ({ ...s, order_index: i }));

    onScenesModified?.(updated, `Removed "${scene.title}"`);
    toast.success(`Removed "${scene.title}"`);

    // Clear expanded state if removed scene was expanded
    if (expandedScene === sceneId) {
      onExpandScene(null);
    }
  }, [scenes, expandedScene, onScenesModified, onExpandScene]);

  const handleDuplicateScene = useCallback((sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const idx = scenes.findIndex(s => s.id === sceneId);
    const clone: BlueprintScene = {
      ...scene,
      id: crypto.randomUUID(),
      scene_key: `${scene.scene_key}_copy_${Date.now()}`,
      title: `${scene.title} (Copy)`,
      order_index: idx + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...scenes];
    updated.splice(idx + 1, 0, clone);
    const reindexed = updated.map((s, i) => ({ ...s, order_index: i }));

    onScenesModified?.(reindexed, `Duplicated "${scene.title}"`);
    toast.success(`Duplicated "${scene.title}"`);
  }, [scenes, onScenesModified]);

  const handleScriptChange = useCallback((sceneId: string, script: string) => {
    const updated = scenes.map(s =>
      s.id === sceneId
        ? { ...s, script_template: script, updated_at: new Date().toISOString() }
        : s
    );
    onScenesModified?.(updated, `Updated script for "${scenes.find(s => s.id === sceneId)?.title}"`);
    toast.success('Script template saved');
  }, [scenes, onScenesModified]);

  const handleVisualConfigChange = useCallback((sceneId: string, config: Record<string, any>) => {
    const updated = scenes.map(s =>
      s.id === sceneId
        ? { ...s, visual_config: config, updated_at: new Date().toISOString() }
        : s
    );
    onScenesModified?.(updated, `Updated visual config for "${scenes.find(s => s.id === sceneId)?.title}"`);
  }, [scenes, onScenesModified]);

  // P5: Enrich scenes with Content Pool context
  const { enrichedScenes, enrichmentStatus, aiPromptContext } = useSceneEnrichment({
    scenes,
  });

  return (
    <div className="p-6 space-y-4">
      {/* P5: Enrichment Context Banner */}
      {enrichmentStatus.hasProductContext && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Content Pool Enriched
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
            {enrichmentStatus.hasProductContext && (
              <div className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" />
                <span>Product context active</span>
              </div>
            )}
            {enrichmentStatus.hasBrandContext && (
              <div className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" />
                <span>Brand assets applied</span>
              </div>
            )}
            {enrichmentStatus.hasAudienceContext && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>Audience persona active</span>
              </div>
            )}
            {enrichmentStatus.approvedScriptCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px]">
                  {enrichmentStatus.approvedScriptCount} approved scripts
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Summary Bar */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 border border-border/50">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Total: {formatDuration(totalDuration)}</span>
          <span className="text-xs text-muted-foreground">({scenes.length} scenes)</span>
        </div>
        {isEditable && (
          <Badge variant="outline" className="text-[10px]">
            Drag to reorder • Click to expand & edit
          </Badge>
        )}
      </div>

      {/* Scene List with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={scenes.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {scenes.map((scene, index) => (
              <SortableSceneItem
                key={scene.id}
                scene={scene}
                index={index}
                isExpanded={expandedScene === scene.id}
                isEditable={isEditable}
                effectiveDuration={getEffectiveDuration(scene)}
                formatDuration={formatDuration}
                onExpandScene={onExpandScene}
                onDurationChange={handleDurationChange}
                onRemoveScene={handleRemoveScene}
                onDuplicateScene={handleDuplicateScene}
                onScriptChange={handleScriptChange}
                onVisualConfigChange={handleVisualConfigChange}
                approvedMessaging={approvedMessaging}
                productName={productName}
                sceneThumbnailUrl={sceneThumbnails[scene.id]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Scene Button (P0 — now wired up) */}
      {isEditable && (
        <div className="flex items-center justify-center pt-2">
          <AddSceneDropdown
            scenes={scenes}
            onScenesModified={onScenesModified}
          />
        </div>
      )}

      {/* AI Scene Customizer — routes through LLM with local fallback */}
      {isEditable && (
        <AISceneCustomizer
          scenes={scenes}
          onScenesModified={onScenesModified}
          language={language}
          region={region}
        />
      )}

      {/* Per-Scene Translation vs Transcreation (CREATE workflow) */}
      {isEditable && showTranscreation && (
        <TranslationTranscreationToggle
          sourceText={expandedScene 
            ? scenes.find(s => s.id === expandedScene)?.script_template || ''
            : ''
          }
          sourceLanguage="en"
          region={region}
          onResult={(result) => {
            console.log('[CREATE/SceneTimeline] Transcreation result:', result.mode, result.targetLanguage);
          }}
          compact
        />
      )}

      {/* Info Note */}
      <div className="text-[10px] text-muted-foreground text-center bg-muted/20 rounded-md p-2">
        💡 Drag scenes to reorder • Click to expand & edit scripts • Toggle capabilities per scene • Required scenes cannot be removed
      </div>
    </div>
  );
}
