/**
 * AI Scene Customizer
 * Routes prompts through ai-universal-processor for intelligent scene modification.
 * Falls back to local regex parsing if edge function unavailable.
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Send,
  Loader2,
  Lightbulb,
  Undo2,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowUpDown,
  Languages,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';
import { getZoneForRegion, ZONE_ROUTING_CONFIG } from '@/config/master-ecosystem-registry';

interface AISceneCustomizerProps {
  scenes: BlueprintScene[];
  onScenesModified?: (scenes: BlueprintScene[], changeDescription: string) => void;
  /** Optional: current language for transcreation context */
  language?: string;
  /** Optional: regional zone for provider routing */
  region?: string;
  className?: string;
}

// Scene type definitions for AI generation
const SCENE_TEMPLATES: Record<string, Partial<BlueprintScene>> = {
  testimonial: {
    scene_type: 'testimonial',
    title: 'Customer Testimonial',
    description: 'Social proof with real customer story',
    duration_seconds: 20,
    min_duration_seconds: 10,
    max_duration_seconds: 45,
    script_template: '{{customer_name}} shares their experience: "{{testimonial_quote}}"',
    is_optional: true,
    is_repeatable: true,
  },
  demo: {
    scene_type: 'demo',
    title: 'Product Demo',
    description: 'Screen recording or walkthrough of product features',
    duration_seconds: 30,
    min_duration_seconds: 15,
    max_duration_seconds: 60,
    script_template: 'Watch how {{product_name}} helps you {{action_verb}} in just {{time_frame}}.',
    is_optional: false,
    is_repeatable: false,
  },
  cta: {
    scene_type: 'cta',
    title: 'Call to Action',
    description: 'Drive viewers to take the next step',
    duration_seconds: 10,
    min_duration_seconds: 5,
    max_duration_seconds: 20,
    script_template: '{{cta_text}} — Visit {{url}} to get started today.',
    is_optional: false,
    is_repeatable: false,
  },
  intro: {
    scene_type: 'intro',
    title: 'Hook / Introduction',
    description: 'Grab attention in the first few seconds',
    duration_seconds: 10,
    min_duration_seconds: 5,
    max_duration_seconds: 15,
    script_template: 'What if you could {{value_proposition}} in half the time?',
    is_optional: false,
    is_repeatable: false,
  },
  feature: {
    scene_type: 'feature',
    title: 'Feature Highlight',
    description: 'Showcase a specific product feature or benefit',
    duration_seconds: 20,
    min_duration_seconds: 10,
    max_duration_seconds: 40,
    script_template: 'Key Feature: {{feature_name}} — {{feature_description}}',
    is_optional: true,
    is_repeatable: true,
  },
  comparison: {
    scene_type: 'content',
    title: 'Before vs After',
    description: 'Visual comparison showing transformation',
    duration_seconds: 15,
    min_duration_seconds: 10,
    max_duration_seconds: 30,
    script_template: 'Before {{product_name}}: {{pain_point}}. After: {{benefit}}.',
    is_optional: true,
    is_repeatable: false,
  },
  pricing: {
    scene_type: 'content',
    title: 'Pricing / Plans',
    description: 'Overview of pricing tiers and value',
    duration_seconds: 15,
    min_duration_seconds: 10,
    max_duration_seconds: 25,
    script_template: 'Starting at just {{price}} per {{period}}. Choose the plan that fits you.',
    is_optional: true,
    is_repeatable: false,
  },
  outro: {
    scene_type: 'outro',
    title: 'Closing / Outro',
    description: 'Wrap up with brand outro and final message',
    duration_seconds: 8,
    min_duration_seconds: 5,
    max_duration_seconds: 15,
    script_template: '{{brand_name}} — {{tagline}}',
    is_optional: false,
    is_repeatable: false,
  },
};

// Prompt suggestions
const PROMPT_SUGGESTIONS = [
  'Add a testimonial scene after the demo',
  'Make it shorter — remove optional scenes',
  'Add a pricing section before the CTA',
  'Swap the intro with a stronger hook',
  'Add a before/after comparison',
  'Duplicate the feature scene for 3 features',
];

// ============================================
// LLM-POWERED INTENT PARSING
// ============================================

interface ParsedIntent {
  action: 'add' | 'remove' | 'reorder' | 'modify' | 'duplicate';
  sceneType?: string;
  position?: 'before' | 'after' | 'start' | 'end';
  targetScene?: string;
  description: string;
  modifiedScript?: string;
}

/**
 * Route prompt through ai-universal-processor for intelligent parsing.
 * Falls back to local regex if edge function fails.
 */
async function parsePromptWithAI(
  prompt: string,
  existingScenes: BlueprintScene[],
  region?: string,
): Promise<{ intents: ParsedIntent[]; usedAI: boolean }> {
  try {
    const sceneContext = existingScenes.map((s, i) => ({
      index: i,
      type: s.scene_type,
      title: s.title,
      optional: s.is_optional,
      duration: s.duration_seconds,
    }));

    const availableTypes = Object.keys(SCENE_TEMPLATES);
    const systemPrompt = `You are a video production scene sequencing assistant. Given a user prompt and current scene list, return a JSON array of intents.

Current scenes:
${JSON.stringify(sceneContext, null, 2)}

Available scene types: ${availableTypes.join(', ')}

Return JSON array of objects with these fields:
- action: "add" | "remove" | "reorder" | "modify" | "duplicate"
- sceneType: string (MUST be one of the available scene types listed above — NEVER null or empty for "add" actions. Pick the closest match.)
- position: "before" | "after" | "start" | "end" (for add only)
- targetScene: string (scene type or title to position relative to)
- description: string (human-readable summary)

IMPORTANT: For "add" actions, sceneType is REQUIRED and must be one of: ${availableTypes.join(', ')}. If unsure, use "feature" as default.

ONLY return valid JSON array, no other text.`;

    // Use AI routing intelligence: resolve zone → primary LLM provider
    const resolvedRegion = region || 'global';
    const zone = getZoneForRegion(resolvedRegion);
    const zoneConfig = ZONE_ROUTING_CONFIG[zone];
    const routedProvider = zoneConfig?.primaryLLM || 'gemini';

    console.log(`[AISceneCustomizer] Routing: region=${resolvedRegion} → zone=${zone} → provider=${routedProvider}`);

    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'generate',
        provider: routedProvider,
        prompt: prompt,
        systemPrompt,
        temperature: 0.3,
        maxTokens: 500,
        context: { 
          sceneCount: existingScenes.length, 
          region: resolvedRegion,
          zone,
          taskType: 'scene_customization' 
        },
      },
    });

    if (error) throw error;

    const content = data?.content || data?.result || '';
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ParsedIntent[];
      return { intents: parsed, usedAI: true };
    }

    throw new Error('No valid JSON in response');
  } catch (err) {
    console.warn('[AISceneCustomizer] LLM fallback to local parsing:', err);
    return { intents: parsePromptLocal(prompt, existingScenes), usedAI: false };
  }
}

/**
 * Local regex fallback parser (original logic preserved)
 */
function parsePromptLocal(prompt: string, existingScenes: BlueprintScene[]): ParsedIntent[] {
  const lower = prompt.toLowerCase();
  const intents: ParsedIntent[] = [];

  // Detect ADD intent
  const addPatterns = [
    /add (?:a |an )?(\w+)(?: scene)?/i,
    /insert (?:a |an )?(\w+)(?: scene)?/i,
    /include (?:a |an )?(\w+)(?: scene)?/i,
  ];

  for (const pattern of addPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const sceneType = match[1];
      let position: 'before' | 'after' | 'start' | 'end' = 'end';
      let targetScene: string | undefined;

      if (lower.includes('after the')) {
        position = 'after';
        const afterMatch = lower.match(/after (?:the )?(\w+)/);
        targetScene = afterMatch?.[1];
      } else if (lower.includes('before the')) {
        position = 'before';
        const beforeMatch = lower.match(/before (?:the )?(\w+)/);
        targetScene = beforeMatch?.[1];
      } else if (lower.includes('at the start') || lower.includes('at the beginning')) {
        position = 'start';
      }

      intents.push({ action: 'add', sceneType, position, targetScene, description: `Add ${sceneType} scene` });
    }
  }

  // Detect REMOVE intent
  if (lower.includes('remove') || lower.includes('delete') || lower.includes('drop')) {
    if (lower.includes('optional')) {
      intents.push({ action: 'remove', description: 'Remove all optional scenes' });
    } else {
      const removeMatch = lower.match(/(?:remove|delete|drop) (?:the )?(\w+)/);
      if (removeMatch) {
        intents.push({ action: 'remove', sceneType: removeMatch[1], description: `Remove ${removeMatch[1]} scene` });
      }
    }
  }

  // Detect SHORTER intent
  if (lower.includes('shorter') || lower.includes('make it short') || lower.includes('condense')) {
    intents.push({ action: 'remove', description: 'Remove optional scenes to shorten' });
  }

  // Detect DUPLICATE intent
  if (lower.includes('duplicate') || lower.includes('repeat') || lower.includes('copy')) {
    const dupMatch = lower.match(/(?:duplicate|repeat|copy) (?:the )?(\w+)/);
    if (dupMatch) {
      intents.push({ action: 'duplicate', sceneType: dupMatch[1], description: `Duplicate ${dupMatch[1]} scene` });
    }
  }

  // Detect SWAP/REORDER intent
  if (lower.includes('swap') || lower.includes('move') || lower.includes('reorder')) {
    intents.push({ action: 'reorder', description: 'Reorder scenes' });
  }

  // Fallback: if no intent detected, try to add based on keywords
  if (intents.length === 0) {
    const sceneTypes = Object.keys(SCENE_TEMPLATES);
    for (const type of sceneTypes) {
      if (lower.includes(type)) {
        intents.push({ action: 'add', sceneType: type, position: 'end', description: `Add ${type} scene` });
        break;
      }
    }
  }

  return intents;
}

// ============================================
// APPLY INTENTS TO SCENES
// ============================================

function applyIntents(
  scenes: BlueprintScene[],
  intents: ParsedIntent[],
): { newScenes: BlueprintScene[]; changes: string[] } {
  let newScenes = [...scenes];
  const changes: string[] = [];

  for (const intent of intents) {
    switch (intent.action) {
      case 'add': {
        // Resolve scene type: exact match → fuzzy match → fallback to 'feature'
        let resolvedType = intent.sceneType || '';
        let template = SCENE_TEMPLATES[resolvedType];
        
        if (!template && resolvedType) {
          // Fuzzy match: find closest scene template key
          const lower = resolvedType.toLowerCase().replace(/[^a-z]/g, '');
          const templateKeys = Object.keys(SCENE_TEMPLATES);
          const fuzzyMatch = templateKeys.find(k => 
            k.includes(lower) || lower.includes(k) ||
            SCENE_TEMPLATES[k].title?.toLowerCase().includes(resolvedType.toLowerCase())
          );
          if (fuzzyMatch) {
            resolvedType = fuzzyMatch;
            template = SCENE_TEMPLATES[fuzzyMatch];
          }
        }
        
        // Final fallback: use 'feature' template
        if (!template) {
          resolvedType = 'feature';
          template = SCENE_TEMPLATES['feature'];
          console.warn(`[AISceneCustomizer] Unknown type "${intent.sceneType}", falling back to "feature"`);
        }

        const newScene: BlueprintScene = {
          id: crypto.randomUUID(),
          blueprint_id: scenes[0]?.blueprint_id || '',
          scene_key: `custom_${resolvedType}_${Date.now()}`,
          title: template.title || 'Custom Scene',
          description: template.description || null,
          order_index: newScenes.length,
          scene_type: template.scene_type || 'content',
          script_template: template.script_template || null,
          script_variables: [],
          duration_seconds: template.duration_seconds || 15,
          min_duration_seconds: template.min_duration_seconds || 5,
          max_duration_seconds: template.max_duration_seconds || 60,
          visual_config: {},
          audio_config: {},
          transition_config: {},
          is_optional: template.is_optional ?? true,
          is_repeatable: template.is_repeatable ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (intent.position === 'start') {
          newScenes.unshift(newScene);
        } else if (intent.position === 'after' && intent.targetScene) {
          const targetIdx = newScenes.findIndex(s =>
            s.scene_type.includes(intent.targetScene!) ||
            s.title.toLowerCase().includes(intent.targetScene!)
          );
          newScenes.splice(targetIdx >= 0 ? targetIdx + 1 : newScenes.length, 0, newScene);
        } else if (intent.position === 'before' && intent.targetScene) {
          const targetIdx = newScenes.findIndex(s =>
            s.scene_type.includes(intent.targetScene!) ||
            s.title.toLowerCase().includes(intent.targetScene!)
          );
          newScenes.splice(targetIdx >= 0 ? targetIdx : newScenes.length, 0, newScene);
        } else {
          const ctaIdx = newScenes.findIndex(s => s.scene_type === 'cta' || s.scene_type === 'outro');
          newScenes.splice(ctaIdx >= 0 ? ctaIdx : newScenes.length, 0, newScene);
        }
        changes.push(`✅ Added "${newScene.title}" scene`);
        break;
      }

      case 'remove': {
        if (intent.description.includes('optional')) {
          const before = newScenes.length;
          newScenes = newScenes.filter(s => !s.is_optional);
          changes.push(`✅ Removed ${before - newScenes.length} optional scenes`);
        } else if (intent.sceneType) {
          const idx = newScenes.findIndex(s =>
            s.scene_type.includes(intent.sceneType!) ||
            s.title.toLowerCase().includes(intent.sceneType!)
          );
          if (idx >= 0) {
            const removed = newScenes.splice(idx, 1)[0];
            changes.push(`✅ Removed "${removed.title}"`);
          } else {
            changes.push(`⚠️ No "${intent.sceneType}" scene found`);
          }
        }
        break;
      }

      case 'duplicate': {
        if (intent.sceneType) {
          const idx = newScenes.findIndex(s =>
            s.scene_type.includes(intent.sceneType!) ||
            s.title.toLowerCase().includes(intent.sceneType!)
          );
          if (idx >= 0) {
            const clone = {
              ...newScenes[idx],
              id: crypto.randomUUID(),
              scene_key: `${newScenes[idx].scene_key}_copy`,
              title: `${newScenes[idx].title} (Copy)`,
              order_index: idx + 1,
            };
            newScenes.splice(idx + 1, 0, clone);
            changes.push(`✅ Duplicated "${newScenes[idx].title}"`);
          }
        }
        break;
      }

      case 'reorder':
        changes.push('ℹ️ Use drag handles in the timeline to reorder scenes');
        break;

      default:
        changes.push(`ℹ️ ${intent.description}`);
    }
  }

  // Re-index
  newScenes = newScenes.map((s, i) => ({ ...s, order_index: i }));

  return { newScenes, changes };
}

// ============================================
// COMPONENT
// ============================================

export function AISceneCustomizer({
  scenes,
  onScenesModified,
  language,
  region,
  className,
}: AISceneCustomizerProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastChanges, setLastChanges] = useState<string[]>([]);
  const [previousScenes, setPreviousScenes] = useState<BlueprintScene[] | null>(null);
  const [usedAI, setUsedAI] = useState(false);

  const handleCustomize = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);

    try {
      // Route through LLM with local fallback
      const { intents, usedAI: aiUsed } = await parsePromptWithAI(prompt, scenes, region);
      setUsedAI(aiUsed);

      if (intents.length === 0) {
        setLastChanges(['⚠️ Could not understand the request. Try a suggestion below.']);
        setIsProcessing(false);
        return;
      }

      const { newScenes, changes } = applyIntents(scenes, intents);

      if (aiUsed) {
        const zone = getZoneForRegion(region || 'global');
        const provider = ZONE_ROUTING_CONFIG[zone]?.primaryLLM || 'gemini';
        changes.unshift(`🤖 Parsed via AI — Zone: ${zone} → Provider: ${provider}`);
      }

      setPreviousScenes(scenes);
      setLastChanges(changes);
      setPrompt('');

      if (onScenesModified && (newScenes.length !== scenes.length || 
          newScenes.some((s, i) => s.id !== scenes[i]?.id))) {
        onScenesModified(newScenes, changes.join('; '));
      }
    } catch (err) {
      setLastChanges(['❌ Failed to process request']);
    } finally {
      setIsProcessing(false);
    }
  }, [prompt, scenes, region, onScenesModified]);

  const handleUndo = useCallback(() => {
    if (previousScenes && onScenesModified) {
      onScenesModified(previousScenes, 'Undo last change');
      setPreviousScenes(null);
      setLastChanges(['↩️ Reverted to previous state']);
    }
  }, [previousScenes, onScenesModified]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Prompt Input */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-lg border border-primary/20 p-3 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">AI Scene Customizer</span>
          {usedAI && (
            <Badge variant="outline" className="text-[9px] h-4 gap-1">
              <Globe className="h-2.5 w-2.5" />
              LLM-Routed
            </Badge>
          )}
          {language && language !== 'en' && (
            <Badge variant="outline" className="text-[9px] h-4 gap-1">
              <Languages className="h-2.5 w-2.5" />
              {language.toUpperCase()}
            </Badge>
          )}
          {previousScenes && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-[10px] gap-1 ml-auto"
              onClick={handleUndo}
            >
              <Undo2 className="h-3 w-3" />
              Undo
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder='e.g., "Add a testimonial scene after the demo" or "Make it shorter"'
            className="h-14 text-xs resize-none flex-1 bg-background/80"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCustomize();
              }
            }}
          />
          <Button
            size="sm"
            className="h-14 px-3"
            onClick={handleCustomize}
            disabled={!prompt.trim() || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-1">
          <Lightbulb className="h-3 w-3 text-muted-foreground mt-0.5" />
          {PROMPT_SUGGESTIONS.slice(0, 4).map(suggestion => (
            <Button
              key={suggestion}
              variant="ghost"
              size="sm"
              className="h-5 text-[10px] text-muted-foreground hover:text-foreground px-1.5"
              onClick={() => setPrompt(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      {/* Change Log */}
      {lastChanges.length > 0 && (
        <div className="bg-muted/30 rounded-md p-2 space-y-1">
          {lastChanges.map((change, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              {change.startsWith('✅') ? (
                <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
              ) : change.startsWith('⚠️') ? (
                <Lightbulb className="h-3 w-3 text-yellow-500 flex-shrink-0" />
              ) : change.startsWith('❌') ? (
                <Trash2 className="h-3 w-3 text-destructive flex-shrink-0" />
              ) : change.startsWith('🤖') ? (
                <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
              ) : (
                <ArrowUpDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              )}
              <span className="text-muted-foreground">{change.replace(/^[✅⚠️❌ℹ️↩️🤖]\s?/, '')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AISceneCustomizer;
