/**
 * Blueprint Preview Modal
 * Shows template details with scene timeline and preview capabilities
 * Combines modal + inline expansion for rich preview experience
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Clock,
  Layers,
  Target,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Video,
  FileText,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoBlueprint, BlueprintScene } from '@/hooks/useVideoBlueprints';

interface BlueprintPreviewModalProps {
  blueprint: VideoBlueprint | null;
  scenes: BlueprintScene[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (blueprint: VideoBlueprint) => void;
  onAssign?: (blueprint: VideoBlueprint, productId: string) => void;
}

const sceneTypeColors: Record<string, string> = {
  intro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  content: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  feature: 'bg-green-500/20 text-green-400 border-green-500/30',
  demo: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  testimonial: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  cta: 'bg-primary/20 text-primary border-primary/30',
  outro: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const sceneTypeIcons: Record<string, React.ReactNode> = {
  intro: <Sparkles className="h-3 w-3" />,
  content: <FileText className="h-3 w-3" />,
  feature: <Layers className="h-3 w-3" />,
  demo: <Video className="h-3 w-3" />,
  testimonial: <Target className="h-3 w-3" />,
  cta: <ChevronRight className="h-3 w-3" />,
  outro: <CheckCircle2 className="h-3 w-3" />,
};

export function BlueprintPreviewModal({
  blueprint,
  scenes,
  isOpen,
  onClose,
  onSelect,
  onAssign,
}: BlueprintPreviewModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedScene, setExpandedScene] = useState<string | null>(null);

  if (!blueprint) return null;

  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const requiredScenes = scenes.filter(s => !s.is_optional);
  const optionalScenes = scenes.filter(s => s.is_optional);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{blueprint.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{blueprint.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">
                {blueprint.category}
              </Badge>
              {blueprint.is_system_default && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  System Template
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 border-b border-border/50">
            <TabsList className="bg-transparent">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                Overview
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-primary/10">
                Scene Timeline
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10">
                Style & Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6 mt-0">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Duration</span>
                  </div>
                  <p className="text-xl font-bold">{formatDuration(totalDuration)}</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Layers className="h-4 w-4" />
                    <span className="text-xs">Scenes</span>
                  </div>
                  <p className="text-xl font-bold">{scenes.length}</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs">Required</span>
                  </div>
                  <p className="text-xl font-bold">{requiredScenes.length}</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-xs">Platforms</span>
                  </div>
                  <p className="text-xl font-bold">{blueprint.target_platform?.length || 0}</p>
                </div>
              </div>

              {/* Scene Flow Preview */}
              <div>
                <h3 className="text-sm font-medium mb-3">Scene Flow</h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {scenes.map((scene, index) => (
                    <React.Fragment key={scene.id}>
                      <div
                        className={cn(
                          "flex-shrink-0 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all hover:scale-105",
                          sceneTypeColors[scene.scene_type] || sceneTypeColors.content,
                          scene.is_optional && "opacity-60 border-dashed"
                        )}
                        onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                      >
                        <div className="flex items-center gap-2">
                          {sceneTypeIcons[scene.scene_type]}
                          <span>{scene.title}</span>
                        </div>
                        <div className="text-xs opacity-70 mt-0.5">
                          {formatDuration(scene.duration_seconds)}
                        </div>
                      </div>
                      {index < scenes.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Target Platforms */}
              <div>
                <h3 className="text-sm font-medium mb-3">Target Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {(blueprint.target_platform || []).map((platform) => (
                    <Badge key={platform} variant="secondary" className="capitalize">
                      {platform.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Industry Tags */}
              {blueprint.industry_tags && blueprint.industry_tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Best For</h3>
                  <div className="flex flex-wrap gap-2">
                    {blueprint.industry_tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="capitalize">
                        {tag.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="p-6 space-y-4 mt-0">
              <div className="space-y-3">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className={cn(
                      "border rounded-lg overflow-hidden transition-all",
                      expandedScene === scene.id ? "border-primary/50" : "border-border/50"
                    )}
                  >
                    {/* Scene Header */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                        sceneTypeColors[scene.scene_type] || sceneTypeColors.content
                      )}
                      onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {sceneTypeIcons[scene.scene_type]}
                            <span className="font-medium">{scene.title}</span>
                            {scene.is_optional && (
                              <Badge variant="outline" className="text-xs">Optional</Badge>
                            )}
                          </div>
                          <p className="text-xs opacity-70 capitalize">{scene.scene_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{formatDuration(scene.duration_seconds)}</span>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform",
                          expandedScene === scene.id && "rotate-90"
                        )} />
                      </div>
                    </div>

                    {/* Expanded Scene Details */}
                    {expandedScene === scene.id && (
                      <div className="p-4 bg-card/50 border-t border-border/50 space-y-3">
                        {scene.script_template && (
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Script Template</h4>
                            <p className="text-sm bg-background/50 p-3 rounded-md font-mono">
                              {scene.script_template}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Min Duration:</span>
                            <span className="ml-2">{formatDuration(scene.min_duration_seconds)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Duration:</span>
                            <span className="ml-2">{formatDuration(scene.max_duration_seconds)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Repeatable:</span>
                            <span className="ml-2">{scene.is_repeatable ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-6 space-y-6 mt-0">
              {/* Style Preset */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Style Preset
                </h3>
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <pre className="text-sm text-muted-foreground overflow-x-auto">
                    {JSON.stringify(blueprint.style_preset, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Default Settings */}
              <div>
                <h3 className="text-sm font-medium mb-3">Default Settings</h3>
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <pre className="text-sm text-muted-foreground overflow-x-auto">
                    {JSON.stringify(blueprint.default_settings, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border/50 flex justify-between items-center bg-card/50">
          <div className="text-sm text-muted-foreground">
            Used {blueprint.usage_count} times
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSelect(blueprint)} className="gap-2">
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
