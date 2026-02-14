/**
 * Sortable Scene Item
 * Individual scene card with drag-and-drop, inline editing, visual config toggles
 * Used within SceneTimelineTab with @dnd-kit/sortable
 * 
 * Capabilities now pull from cast_ai_capabilities DB table for full coverage
 */

import React, { useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight,
  Sparkles,
  Layers,
  Target,
  CheckCircle2,
  Video,
  FileText,
  Trash2,
  GripVertical,
  Copy,
  Save,
  X,
  User,
  Box,
  Wand2,
  Glasses,
  Mic,
  Film,
  Image as ImageIcon,
  Languages,
  Volume2,
  Mic2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';
import { useCastCapabilities } from '@/hooks/useCastRegistry';

export interface ApprovedMessagingContext {
  hook?: string;
  cta?: string;
  valueProposition?: string;
  benefits?: string[];
  painPoints?: string[];
  differentiators?: string[];
  shortScript?: string;
  productId?: string;
}

interface SortableSceneItemProps {
  scene: BlueprintScene;
  index: number;
  isExpanded: boolean;
  isEditable: boolean;
  effectiveDuration: number;
  formatDuration: (seconds: number) => string;
  onExpandScene: (sceneId: string | null) => void;
  onDurationChange: (sceneId: string, duration: number) => void;
  onRemoveScene: (sceneId: string) => void;
  onDuplicateScene: (sceneId: string) => void;
  onScriptChange: (sceneId: string, script: string) => void;
  onVisualConfigChange: (sceneId: string, config: Record<string, any>) => void;
  /** Approved messaging for resolving {{variables}} in script previews */
  approvedMessaging?: ApprovedMessagingContext | null;
  /** Product name for display */
  productName?: string;
  /** Thumbnail URL for this scene (from product assets) */
  sceneThumbnailUrl?: string;
}

const sceneTypeColors: Record<string, string> = {
  intro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  hero_banner: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  content: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  feature: 'bg-green-500/20 text-green-400 border-green-500/30',
  demo: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  testimonial: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  social_proof: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  positioning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  stats: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  benefits: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  regional_highlight: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  pain_point: 'bg-red-500/20 text-red-400 border-red-500/30',
  trust: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  pricing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  messaging: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  cta: 'bg-primary/20 text-primary border-primary/30',
  outro: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const sceneTypeIcons: Record<string, React.ReactNode> = {
  intro: <Sparkles className="h-3 w-3" />,
  hero_banner: <Layers className="h-3 w-3" />,
  content: <FileText className="h-3 w-3" />,
  feature: <Layers className="h-3 w-3" />,
  demo: <Video className="h-3 w-3" />,
  testimonial: <Target className="h-3 w-3" />,
  social_proof: <Target className="h-3 w-3" />,
  positioning: <Target className="h-3 w-3" />,
  stats: <FileText className="h-3 w-3" />,
  benefits: <CheckCircle2 className="h-3 w-3" />,
  regional_highlight: <Sparkles className="h-3 w-3" />,
  pain_point: <FileText className="h-3 w-3" />,
  trust: <CheckCircle2 className="h-3 w-3" />,
  pricing: <FileText className="h-3 w-3" />,
  messaging: <FileText className="h-3 w-3" />,
  cta: <ChevronRight className="h-3 w-3" />,
  outro: <CheckCircle2 className="h-3 w-3" />,
};

// Icon mapping for dynamic capabilities from DB
const CAPABILITY_ICON_MAP: Record<string, React.ReactNode> = {
  avatar_generation: <User className="h-3 w-3" />,
  '3d_generation': <Box className="h-3 w-3" />,
  animation: <Wand2 className="h-3 w-3" />,
  video_generation: <Film className="h-3 w-3" />,
  image_generation: <ImageIcon className="h-3 w-3" />,
  tts: <Volume2 className="h-3 w-3" />,
  lip_sync: <Mic2 className="h-3 w-3" />,
  voice_cloning: <Mic className="h-3 w-3" />,
  translation: <Languages className="h-3 w-3" />,
  transcription: <FileText className="h-3 w-3" />,
};

// Map DB capability values to visual_config keys
const CAPABILITY_TO_CONFIG_KEY: Record<string, string> = {
  avatar_generation: 'avatarEnabled',
  '3d_generation': '3dEnabled',
  animation: 'animationEnabled',
  lip_sync: 'lipsyncEnabled',
  video_generation: 'videoEnabled',
  image_generation: 'imageEnabled',
  tts: 'ttsEnabled',
  voice_cloning: 'voiceCloningEnabled',
  translation: 'translationEnabled',
  transcription: 'transcriptionEnabled',
};

/** Resolve {{variable}} placeholders with approved messaging values */
function resolveScriptVariables(script: string, messaging?: ApprovedMessagingContext | null, productName?: string): string {
  if (!script || !messaging) return script;
  return script
    .replace(/\{\{hook\}\}/g, messaging.hook || '{{hook}}')
    .replace(/\{\{cta\}\}/g, messaging.cta || '{{cta}}')
    .replace(/\{\{value_proposition\}\}/g, messaging.valueProposition || '{{value_proposition}}')
    .replace(/\{\{product_name\}\}/g, productName || messaging.productId || '{{product_name}}')
    .replace(/\{\{benefits\}\}/g, (messaging.benefits || []).join('. ') || '{{benefits}}')
    .replace(/\{\{pain_points\}\}/g, (messaging.painPoints || []).join('. ') || '{{pain_points}}')
    .replace(/\{\{differentiators\}\}/g, (messaging.differentiators || []).join('. ') || '{{differentiators}}')
    .replace(/\{\{short_script\}\}/g, messaging.shortScript || '{{short_script}}');
}

export function SortableSceneItem({
  scene,
  index,
  isExpanded,
  isEditable,
  effectiveDuration,
  formatDuration,
  onExpandScene,
  onDurationChange,
  onRemoveScene,
  onDuplicateScene,
  onScriptChange,
  onVisualConfigChange,
  approvedMessaging,
  productName,
  sceneThumbnailUrl,
}: SortableSceneItemProps) {
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState(scene.script_template || '');

  // Fetch full capabilities from DB
  const { data: dbCapabilities = [] } = useCastCapabilities();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as any,
  };

  const handleSaveScript = useCallback(() => {
    onScriptChange(scene.id, editedScript);
    setIsEditingScript(false);
  }, [scene.id, editedScript, onScriptChange]);

  const handleCancelScript = useCallback(() => {
    setEditedScript(scene.script_template || '');
    setIsEditingScript(false);
  }, [scene.script_template]);

  const handleVisualToggle = useCallback((key: string, enabled: boolean) => {
    const updatedConfig = { ...scene.visual_config, [key]: enabled };
    onVisualConfigChange(scene.id, updatedConfig);
  }, [scene.id, scene.visual_config, onVisualConfigChange]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        isExpanded ? "border-primary/50 shadow-sm" : "border-border/50",
        isDragging && "shadow-lg ring-2 ring-primary/30"
      )}
    >
      {/* Scene Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors",
          sceneTypeColors[scene.scene_type] || sceneTypeColors.content
        )}
        onClick={() => onExpandScene(isExpanded ? null : scene.id)}
      >
        <div className="flex items-center gap-3">
          {isEditable && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 hover:bg-background/30 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
          )}
          {/* Scene thumbnail from product assets */}
          {sceneThumbnailUrl ? (
            <div className="w-10 h-10 rounded overflow-hidden border border-border/50 flex-shrink-0">
              <img src={sceneThumbnailUrl} alt={scene.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              {sceneTypeIcons[scene.scene_type]}
              <span className="font-medium">{scene.title}</span>
              {scene.is_optional && (
                <Badge variant="outline" className="text-[10px] h-4">Optional</Badge>
              )}
              {scene.is_repeatable && (
                <Badge variant="outline" className="text-[10px] h-4 border-primary/30 text-primary">Repeatable</Badge>
              )}
              {productName && (
                <Badge variant="secondary" className="text-[10px] h-4">{productName}</Badge>
              )}
            </div>
            <p className="text-xs opacity-70 capitalize">{scene.scene_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-sm font-medium">{formatDuration(effectiveDuration)}</span>
            <p className="text-[10px] text-muted-foreground">
              {formatDuration(scene.min_duration_seconds)} – {formatDuration(scene.max_duration_seconds)}
            </p>
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </div>
      </div>

      {/* Expanded Scene Details */}
      {isExpanded && (
        <div className="p-4 bg-card/50 border-t border-border/50 space-y-4">
          {/* Duration Slider */}
          {isEditable && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Duration: {formatDuration(effectiveDuration)}
                </label>
                <span className="text-[10px] text-muted-foreground">
                  Min {formatDuration(scene.min_duration_seconds)} • Max {formatDuration(scene.max_duration_seconds)}
                </span>
              </div>
              <Slider
                value={[effectiveDuration]}
                min={scene.min_duration_seconds}
                max={scene.max_duration_seconds}
                step={5}
                onValueChange={([val]) => onDurationChange(scene.id, val)}
                className="w-full"
              />
            </div>
          )}

          {/* Script Template — Editable */}
          {scene.script_template && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-medium text-muted-foreground">Script Template</h4>
                {isEditable && !isEditingScript && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 text-[10px] gap-1 text-primary"
                    onClick={() => {
                      setEditedScript(scene.script_template || '');
                      setIsEditingScript(true);
                    }}
                  >
                    <FileText className="h-3 w-3" />
                    Edit Script
                  </Button>
                )}
              </div>
              {isEditingScript ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedScript}
                    onChange={(e) => setEditedScript(e.target.value)}
                    className="text-sm font-mono min-h-[80px] bg-background/80"
                    placeholder="Enter script template... Use {{variable_name}} for dynamic content"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Badge variant="outline" className="text-[9px] h-4">
                      Variables: {'{{product_name}}'}, {'{{feature_name}}'}, etc.
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={handleCancelScript}
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={handleSaveScript}
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm bg-background/50 p-3 rounded-md font-mono text-muted-foreground whitespace-pre-wrap">
                  {resolveScriptVariables(scene.script_template || '', approvedMessaging, productName)}
                </p>
              )}
            </div>
          )}

          {/* Scene Details Grid */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Scene Type</span>
              <span className="capitalize">{scene.scene_type}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Scene Key</span>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{scene.scene_key}</code>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Repeatable</span>
              <span>{scene.is_repeatable ? '✅ Yes' : '❌ No'}</span>
            </div>
          </div>

          {/* Visual Config Toggles (P1) */}
          {isEditable && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Scene Capabilities ({dbCapabilities.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dbCapabilities.map((cap) => {
                  const configKey = CAPABILITY_TO_CONFIG_KEY[cap.value] || `${cap.value}Enabled`;
                  const isEnabled = !!(scene.visual_config as any)?.[configKey];
                  return (
                    <div
                      key={cap.value}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border transition-colors",
                        isEnabled
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/50 bg-muted/20"
                      )}
                    >
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleVisualToggle(configKey, checked)}
                        className="scale-75"
                      />
                      <div className="flex items-center gap-1.5 text-xs">
                        {CAPABILITY_ICON_MAP[cap.value] || <Sparkles className="h-3 w-3" />}
                        <span className={isEnabled ? 'text-foreground' : 'text-muted-foreground'}>
                          {cap.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions Row */}
          {isEditable && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              {scene.is_repeatable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-primary hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateScene(scene.id);
                  }}
                >
                  <Copy className="h-3 w-3" />
                  Duplicate Scene
                </Button>
              )}
              {scene.is_optional && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive gap-1 ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveScene(scene.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove Scene
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
