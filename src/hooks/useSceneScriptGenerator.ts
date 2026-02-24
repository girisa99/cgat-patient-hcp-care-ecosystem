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
  /** Which messaging elements were auto-assigned to this scene */
  assignedMessaging?: SceneMessagingAssignment;
}

/** Maps scene types to the messaging elements that AI auto-assigns */
export interface SceneMessagingAssignment {
  sceneType: string;
  elements: string[]; // e.g. ['hook', 'valueProposition']
  reasoning: string;  // e.g. 'Hero Banner benefits from positioning + tagline'
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
// AI-SMART SCENE-TO-MESSAGING MAPPING
// ============================================================================

/**
 * Determines which messaging elements best fit each scene type.
 * This is the "AI-smart assignment" logic — scene type drives which
 * high-level messaging elements are injected into the script prompt.
 */
const SCENE_MESSAGING_MAP: Record<string, { elements: string[]; reasoning: string }> = {
  // Opening scenes → hook + value proposition
  intro: {
    elements: ['hook', 'subHook', 'valueProposition', 'openingLine'],
    reasoning: 'Introduction grabs attention with hook and establishes value proposition',
  },
  hook: {
    elements: ['hook', 'subHook', 'openingLine'],
    reasoning: 'Hook scene uses the primary hook and opening line to capture attention',
  },
  // Hero/banner scenes → positioning + tagline + headline
  hero_banner: {
    elements: ['headline', 'valueProposition', 'cta', 'differentiators'],
    reasoning: 'Hero Banner showcases positioning with headline, value prop, and key differentiators',
  },
  positioning_statement: {
    elements: ['valueProposition', 'differentiators', 'headline'],
    reasoning: 'Positioning statement uses value proposition and competitive differentiators',
  },
  // Feature/product scenes → benefits + pain points
  feature: {
    elements: ['benefits', 'painPoints', 'shortScript'],
    reasoning: 'Feature scene highlights benefits that solve specific pain points',
  },
  demo: {
    elements: ['benefits', 'shortScript', 'transitionPhrases'],
    reasoning: 'Demo scene walks through benefits with script narration and transitions',
  },
  product_showcase: {
    elements: ['benefits', 'differentiators', 'mediumScript'],
    reasoning: 'Product showcase combines benefits with differentiators for impact',
  },
  // Comparison/competitive scenes
  comparison: {
    elements: ['differentiators', 'painPoints', 'benefits'],
    reasoning: 'Comparison scene contrasts differentiators against competitor pain points',
  },
  // Social proof / testimonial
  testimonial: {
    elements: ['benefits', 'valueProposition'],
    reasoning: 'Testimonial reinforces benefits and value proposition through social proof',
  },
  // Stats / data scenes
  stats_data: {
    elements: ['benefits', 'differentiators'],
    reasoning: 'Stats scene uses quantifiable benefits and differentiators',
  },
  regional_highlights: {
    elements: ['valueProposition', 'benefits', 'transitionPhrases'],
    reasoning: 'Regional highlights adapt value proposition to local context',
  },
  // CTA / closing scenes → CTA + closing line
  cta: {
    elements: ['cta', 'ctaSecondary', 'closingLine'],
    reasoning: 'CTA scene drives action with primary and secondary calls-to-action',
  },
  outro: {
    elements: ['closingLine', 'cta', 'differentiators'],
    reasoning: 'Outro wraps up with closing line, final CTA, and memorable differentiator',
  },
  closing: {
    elements: ['closingLine', 'cta', 'differentiators'],
    reasoning: 'Closing reinforces the CTA and leaves with a differentiator',
  },
  // Pricing
  pricing: {
    elements: ['cta', 'benefits', 'valueProposition'],
    reasoning: 'Pricing scene ties cost to value proposition and benefits',
  },
};

/**
 * Get smart messaging assignment for a scene type.
 * Falls back to a generic set if scene type is unknown.
 */
export function getSmartMessagingAssignment(sceneType: string): SceneMessagingAssignment {
  const normalized = sceneType.toLowerCase().replace(/[^a-z_]/g, '');
  const mapping = SCENE_MESSAGING_MAP[normalized];
  
  if (mapping) {
    return { sceneType: normalized, ...mapping };
  }
  
  // Check partial matches (e.g., 'custom_hero_banner_123' → 'hero_banner')
  for (const [key, val] of Object.entries(SCENE_MESSAGING_MAP)) {
    if (normalized.includes(key)) {
      return { sceneType: key, ...val };
    }
  }
  
  // Default fallback: use hook + benefits + CTA
  return {
    sceneType: normalized,
    elements: ['hook', 'benefits', 'cta'],
    reasoning: 'Generic scene uses hook, benefits, and CTA as baseline messaging',
  };
}

/**
 * Extract messaging values for assigned elements
 */
export function extractMessagingForScene(
  messaging: MessagingContent,
  assignment: SceneMessagingAssignment
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  
  for (const element of assignment.elements) {
    const value = (messaging as any)[element];
    if (value !== undefined && value !== null && value !== '') {
      result[element] = value;
    }
  }
  
  return result;
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

  // Generate script for a single scene with AI-smart messaging assignment
  const generateForScene = useCallback(async (sceneIndex: number): Promise<SceneScriptSuggestion | null> => {
    const scene = scenes[sceneIndex];
    if (!scene) return null;

    updateSceneStatus(scene.sceneId, { status: 'generating', error: undefined });
    setIsGenerating(true);

    try {
      const previousScene = sceneIndex > 0 ? scenes[sceneIndex - 1] : null;
      const nextScene = sceneIndex < scenes.length - 1 ? scenes[sceneIndex + 1] : null;

      // AI-smart assignment: determine which messaging elements fit this scene
      const sceneType = scene.sceneKey.replace(/^custom_/, '').replace(/_\d+$/, '');
      const assignment = getSmartMessagingAssignment(sceneType);
      const assignedValues = messaging ? extractMessagingForScene(messaging, assignment) : {};

      console.log(`[SceneScriptGen] Smart assignment for "${scene.title}" (${sceneType}):`, assignment.elements, '→', Object.keys(assignedValues));

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate_scene_scripts',
          provider: 'gemini',
          prompt: `Generate script for scene: ${scene.title}`,
          sceneKey: scene.sceneKey,
          sceneTitle: scene.title,
          sceneType,
          scriptTemplate: scene.scriptText || undefined,
          // Full messaging context for reference
          messaging: messaging ? {
            hook: messaging.hook,
            valueProposition: messaging.valueProposition,
            painPoints: messaging.painPoints,
            benefits: messaging.benefits,
            differentiators: messaging.differentiators,
            cta: messaging.cta,
            shortScript: messaging.shortScript,
          } : undefined,
          // AI-smart: focused elements for THIS scene
          smartAssignment: {
            assignedElements: assignment.elements,
            assignedValues,
            reasoning: assignment.reasoning,
          },
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
        model: data.model || 'gemini-2.5-flash',
        assignedMessaging: assignment,
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
