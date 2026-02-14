/**
 * SceneScriptAIPanel — AI Suggest → User Approve per scene
 * 
 * Sits alongside ScriptTemplateMapper to provide:
 * - Per-scene AI script generation
 * - Suggestion preview with approve/reject
 * - Progressive scene-by-scene workflow
 * - Capability badges per scene
 * - Visual direction notes
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, Check, X, RefreshCw, ChevronRight, ChevronLeft,
  Loader2, Eye, Wand2, Zap, ArrowRight, Film,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UseSceneScriptGeneratorOptions } from '@/hooks/useSceneScriptGenerator';
import { useSceneScriptGenerator, getSmartMessagingAssignment } from '@/hooks/useSceneScriptGenerator';
import type { SceneScript, TemplateMapping, MessagingContent } from '@/hooks/useUnifiedAuthoring';

interface SceneScriptAIPanelProps {
  mapping: TemplateMapping | null;
  messaging: MessagingContent | null;
  capabilities?: string[];
  product?: string;
  region?: string;
  language?: string;
  onSceneUpdate: (sceneId: string, updates: Partial<SceneScript>) => void;
  compact?: boolean;
}

export const SceneScriptAIPanel: React.FC<SceneScriptAIPanelProps> = ({
  mapping,
  messaging,
  capabilities,
  product,
  region,
  language,
  onSceneUpdate,
  compact = false,
}) => {
  const {
    currentSceneIndex,
    setCurrentSceneIndex,
    isGenerating,
    stats,
    generateForCurrentScene,
    generateAllRemaining,
    approveSuggestion,
    rejectSuggestion,
    regenerateForScene,
    getSceneStatus,
  } = useSceneScriptGenerator({
    messaging,
    mapping,
    capabilities,
    product,
    region,
    language,
    onSceneUpdate,
  });

  const [showAllScenes, setShowAllScenes] = useState(false);
  const scenes = mapping?.scenes || [];
  const currentScene = scenes[currentSceneIndex];
  const currentStatus = currentScene ? getSceneStatus(currentScene.sceneId) : null;

  if (!mapping || scenes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Wand2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Select a template and generate messaging first to enable AI script suggestions
          </p>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Script Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {stats.approved}/{stats.total} approved
            </Badge>
            {!stats.isComplete && (
              <Button
                size="sm"
                variant="outline"
                onClick={generateAllRemaining}
                disabled={isGenerating}
                className="gap-1 text-xs h-7"
              >
                <Zap className="h-3 w-3" />
                Generate All
              </Button>
            )}
          </div>
        </div>
        <Progress value={progressPercent} className="h-1.5 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scene Navigator */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {scenes.map((scene, idx) => {
            const status = getSceneStatus(scene.sceneId);
            return (
              <button
                key={scene.sceneId}
                onClick={() => setCurrentSceneIndex(idx)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition-all flex-shrink-0",
                  idx === currentSceneIndex && "border-primary bg-primary/10 text-primary",
                  idx !== currentSceneIndex && status.status === 'approved' && "border-primary/30 bg-primary/5 text-primary/70",
                  idx !== currentSceneIndex && status.status === 'suggested' && "border-yellow-500/30 bg-yellow-500/5 text-yellow-600",
                  idx !== currentSceneIndex && status.status === 'idle' && "border-muted text-muted-foreground hover:bg-muted/50",
                  idx !== currentSceneIndex && status.status === 'rejected' && "border-destructive/30 text-destructive/70",
                )}
              >
                {status.status === 'approved' ? (
                  <Check className="h-2.5 w-2.5" />
                ) : status.status === 'suggested' ? (
                  <Eye className="h-2.5 w-2.5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
                <span className="hidden sm:inline max-w-[60px] truncate">{scene.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Scene Card */}
        {currentScene && currentStatus && (
          <div className="border rounded-lg p-4 space-y-3">
            {/* Scene Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Film className="h-3.5 w-3.5 text-muted-foreground" />
                  Scene {currentSceneIndex + 1}: {currentScene.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentScene.sceneKey} · {currentScene.durationSeconds}s
                  {currentScene.scriptText && ' · has template'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
                  disabled={currentSceneIndex === 0}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentSceneIndex(Math.min(scenes.length - 1, currentSceneIndex + 1))}
                  disabled={currentSceneIndex === scenes.length - 1}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Capability Badges */}
            {capabilities && capabilities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {capabilities.map(cap => (
                  <Badge key={cap} variant="secondary" className="text-[9px]">
                    {cap}
                  </Badge>
                ))}
              </div>
            )}

            {/* AI-Smart Messaging Assignment */}
            {messaging && (() => {
              const sceneType = currentScene.sceneKey.replace(/^custom_/, '').replace(/_\d+$/, '');
              const assignment = getSmartMessagingAssignment(sceneType);
              return (
                <div className="p-2 bg-accent/30 rounded border border-accent/50 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium text-foreground/80">Smart Assignment</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {assignment.elements.map(el => (
                      <Badge key={el} variant="outline" className="text-[9px] bg-primary/5 border-primary/20">
                        {el.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">{assignment.reasoning}</p>
                </div>
              );
            })()}

            {/* Template Pattern (if exists) */}
            {currentScene.scriptText && (
              <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground border">
                <span className="font-medium text-foreground/70">Template: </span>
                {currentScene.scriptText}
              </div>
            )}

            {/* AI Suggestion or Generate Button */}
            {currentStatus.status === 'idle' || currentStatus.status === 'rejected' ? (
              <div className="text-center py-4">
                <Button
                  onClick={generateForCurrentScene}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? 'Generating...' : currentStatus.status === 'rejected' ? 'Regenerate Script' : 'Generate Script'}
                </Button>
                {currentStatus.error && (
                  <p className="text-xs text-destructive mt-2">{currentStatus.error}</p>
                )}
              </div>
            ) : currentStatus.status === 'generating' ? (
              <div className="text-center py-6">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">AI is writing the script...</p>
              </div>
            ) : currentStatus.status === 'suggested' && currentStatus.suggestion ? (
              <div className="space-y-3">
                {/* Suggested Script */}
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm leading-relaxed">{currentStatus.suggestion.scriptText}</p>
                </div>

                {/* Visual Direction */}
                {currentStatus.suggestion.visualDirection && (
                  <div className="p-2 bg-muted/30 rounded text-xs">
                    <span className="font-medium">🎬 Visual: </span>
                    {currentStatus.suggestion.visualDirection}
                  </div>
                )}

                {/* Tone + Duration */}
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {currentStatus.suggestion.toneNote && (
                    <Badge variant="outline" className="text-[9px]">
                      Tone: {currentStatus.suggestion.toneNote}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[9px]">
                    ~{currentStatus.suggestion.suggestedDuration || currentScene.durationSeconds}s
                  </Badge>
                  <Badge variant="outline" className="text-[9px]">
                    via {currentStatus.suggestion.provider}
                  </Badge>
                </div>

                {/* Variables Filled */}
                {currentStatus.suggestion.variablesFilled && Object.keys(currentStatus.suggestion.variablesFilled).length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Variables filled: </span>
                    {Object.entries(currentStatus.suggestion.variablesFilled).map(([k, v]) => (
                      <Badge key={k} variant="secondary" className="text-[9px] mr-1">
                        {`{{${k}}}`} → {String(v).slice(0, 30)}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => regenerateForScene(currentScene.sceneId)}
                    disabled={isGenerating}
                    className="gap-1 text-xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectSuggestion(currentScene.sceneId)}
                      className="gap-1 text-xs text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveSuggestion(currentScene.sceneId)}
                      className="gap-1 text-xs"
                    >
                      <Check className="h-3 w-3" />
                      Approve & Next
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : currentStatus.status === 'approved' ? (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Approved</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentStatus.suggestion?.scriptText || currentScene.editedText || currentScene.scriptText}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => regenerateForScene(currentScene.sceneId)}
                  disabled={isGenerating}
                  className="gap-1 text-xs mt-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Re-generate
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* Completion Banner */}
        {stats.isComplete && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
            <Check className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-sm font-medium text-primary">All {stats.total} scenes approved!</p>
            <p className="text-xs text-muted-foreground">Ready for TTS generation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SceneScriptAIPanel;
