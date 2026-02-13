/**
 * useSceneScriptGenerator — AI-powered per-scene script generation
 * 
 * Implements "AI Suggest → User Approve per scene" workflow.
 * Uses ai-universal-processor with action='generate_scene_scripts'.
 * 
 * Integrates with:
 * - useUnifiedAuthoring (messaging context)
 * - useGenieCastSession (template + capability context)
 * - ScriptTemplateMapper (UI rendering)
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SceneScript, MessagingContent, TemplateMapping } from '@/hooks/useUnifiedAuthoring';

// ============================================================================
// TYPES
// ============================================================================

export interface SceneScriptSuggestion {
  sceneKey: string;
  sceneTitle: string;
  scriptText: string;
  visualDirection?: string;
  variablesFilled?: Record<string, string>;
  suggestedDuration?: number;
  toneNote?: string;
  provider: string;
  model: string;
}

export interface SceneGenerationStatus {
  sceneId: string;
  status: 'idle' | 'generating' | 'suggested' | 'approved' | 'rejected' | 'editing';
  suggestion?: SceneScriptSuggestion;
  error?: string;
}

export interface UseSceneScriptGeneratorOptions {
  messaging: MessagingContent | null;
  mapping: TemplateMapping | null;
  capabilities?: string[];
  product?: string;
  region?: string;
  language?: string;
  onSceneUpdate: (sceneId: string, updates: Partial<SceneScript>) => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSceneScriptGenerator(options: UseSceneScriptGeneratorOptions) {
  const { messaging, mapping, capabilities, product, region, language, onSceneUpdate } = options;

  const [sceneStatuses, setSceneStatuses] = useState<Map<string, SceneGenerationStatus>>(new Map());
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const scenes = mapping?.scenes || [];

  // Get status for a scene
  const getSceneStatus = useCallback((sceneId: string): SceneGenerationStatus => {
    return sceneStatuses.get(sceneId) || { sceneId, status: 'idle' };
  }, [sceneStatuses]);

  // Update status for a scene
  const updateSceneStatus = useCallback((sceneId: string, updates: Partial<SceneGenerationStatus>) => {
    setSceneStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(sceneId) || { sceneId, status: 'idle' as const };
      next.set(sceneId, { ...current, ...updates });
      return next;
    });
  }, []);

  // Generate script for a single scene
  const generateForScene = useCallback(async (sceneIndex: number): Promise<SceneScriptSuggestion | null> => {
    const scene = scenes[sceneIndex];
    if (!scene) return null;

    updateSceneStatus(scene.sceneId, { status: 'generating', error: undefined });
    setIsGenerating(true);

    try {
      const previousScene = sceneIndex > 0 ? scenes[sceneIndex - 1] : null;
      const nextScene = sceneIndex < scenes.length - 1 ? scenes[sceneIndex + 1] : null;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate_scene_scripts',
          provider: 'gemini',
          prompt: `Generate script for scene: ${scene.title}`,
          sceneKey: scene.sceneKey,
          sceneTitle: scene.title,
          sceneType: scene.sceneKey, // e.g. 'hook', 'feature_1', 'cta'
          scriptTemplate: scene.scriptText || undefined,
          messaging: messaging ? {
            hook: messaging.hook,
            valueProposition: messaging.valueProposition,
            painPoints: messaging.painPoints,
            benefits: messaging.benefits,
            differentiators: messaging.differentiators,
            cta: messaging.cta,
            shortScript: messaging.shortScript,
          } : undefined,
          capabilities,
          product,
          region,
          language,
          durationSeconds: scene.durationSeconds,
          previousSceneScript: previousScene?.editedText || previousScene?.scriptText || undefined,
          nextSceneTitle: nextScene?.title || undefined,
        }
      });

      if (error) throw error;

      const suggestion: SceneScriptSuggestion = {
        sceneKey: scene.sceneKey,
        sceneTitle: scene.title,
        scriptText: data.scriptText || '',
        visualDirection: data.visualDirection,
        variablesFilled: data.variablesFilled,
        suggestedDuration: data.suggestedDuration,
        toneNote: data.toneNote,
        provider: data.provider || 'gemini',
        model: data.model || 'gemini-2.0-flash',
      };

      updateSceneStatus(scene.sceneId, { status: 'suggested', suggestion });
      return suggestion;
    } catch (err: any) {
      console.error(`[SceneScriptGen] Failed for scene ${scene.sceneKey}:`, err);
      updateSceneStatus(scene.sceneId, { status: 'idle', error: err.message });
      toast.error(`Script generation failed for "${scene.title}"`, { description: err.message });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [scenes, messaging, capabilities, product, region, language, updateSceneStatus]);

  // Generate for current scene (progressive flow)
  const generateForCurrentScene = useCallback(async () => {
    return generateForScene(currentSceneIndex);
  }, [generateForScene, currentSceneIndex]);

  // Approve suggestion for a scene → applies to ScriptTemplateMapper
  const approveSuggestion = useCallback((sceneId: string) => {
    const status = sceneStatuses.get(sceneId);
    if (!status?.suggestion) return;

    onSceneUpdate(sceneId, {
      scriptText: status.suggestion.scriptText,
      sourceType: 'messaging',
      approvalStatus: 'approved',
      durationSeconds: status.suggestion.suggestedDuration || undefined,
    });

    updateSceneStatus(sceneId, { status: 'approved' });

    // Auto-advance to next scene
    const currentIdx = scenes.findIndex(s => s.sceneId === sceneId);
    if (currentIdx >= 0 && currentIdx < scenes.length - 1) {
      setCurrentSceneIndex(currentIdx + 1);
    }

    toast.success(`Script approved for "${status.suggestion.sceneTitle}"`);
  }, [sceneStatuses, scenes, onSceneUpdate, updateSceneStatus]);

  // Reject suggestion → user can regenerate or manually edit
  const rejectSuggestion = useCallback((sceneId: string) => {
    updateSceneStatus(sceneId, { status: 'rejected' });
    toast.info('Script rejected — regenerate or edit manually');
  }, [updateSceneStatus]);

  // Regenerate for a specific scene
  const regenerateForScene = useCallback(async (sceneId: string) => {
    const idx = scenes.findIndex(s => s.sceneId === sceneId);
    if (idx >= 0) {
      setCurrentSceneIndex(idx);
      return generateForScene(idx);
    }
    return null;
  }, [scenes, generateForScene]);

  // Batch generate all remaining scenes
  const generateAllRemaining = useCallback(async () => {
    const results: SceneScriptSuggestion[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const status = getSceneStatus(scenes[i].sceneId);
      if (status.status === 'approved') continue; // Skip already approved
      const result = await generateForScene(i);
      if (result) results.push(result);
    }
    return results;
  }, [scenes, getSceneStatus, generateForScene]);

  // Stats
  const stats = {
    total: scenes.length,
    approved: scenes.filter(s => getSceneStatus(s.sceneId).status === 'approved').length,
    suggested: scenes.filter(s => getSceneStatus(s.sceneId).status === 'suggested').length,
    remaining: scenes.filter(s => !['approved', 'suggested'].includes(getSceneStatus(s.sceneId).status)).length,
    currentScene: scenes[currentSceneIndex] || null,
    isComplete: scenes.every(s => getSceneStatus(s.sceneId).status === 'approved'),
  };

  return {
    // State
    sceneStatuses,
    currentSceneIndex,
    setCurrentSceneIndex,
    isGenerating,
    stats,

    // Actions
    generateForScene,
    generateForCurrentScene,
    generateAllRemaining,
    approveSuggestion,
    rejectSuggestion,
    regenerateForScene,
    getSceneStatus,
  };
}
