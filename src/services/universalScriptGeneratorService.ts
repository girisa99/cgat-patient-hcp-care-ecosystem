/**
 * UNIVERSAL SCRIPT GENERATOR SERVICE (B1)
 * 
 * AI-powered script generator that outputs UniversalScriptLine[] within
 * a full UniversalEpisodeManifest. Works with ANY Genie product.
 * 
 * Pipeline:
 *   1. Accept prompt + product + region + characters
 *   2. Build system prompt with product constraints + cultural direction
 *   3. Call AI via existing edge function (ai-universal-processor)
 *   4. Parse AI output into UniversalScriptLine[]
 *   5. Enrich with regional cultural traits (B2 pipe)
 *   6. Assemble into UniversalEpisodeManifest
 *   7. Validate against product constraints
 * 
 * @see src/config/universal-script-schema.ts — schema contract
 * @see src/services/regionalTranscreationService.ts — B2 enrichment
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  GenieProduct,
  ScriptPurpose,
  EmotionalTone,
  UniversalScriptLine,
  UniversalSceneDefinition,
  UniversalCharacter,
  UniversalEpisodeManifest,
  VoiceConfig,
  CulturalTraits,
} from '@/config/universal-script-schema';
import {
  PRODUCT_CONSTRAINTS,
  getProductConstraints,
  validateManifest,
} from '@/config/universal-script-schema';
import {
  enrichScriptLineWithRegion,
  enrichCharacterWithRegion,
  getTranscreationDirectionPrompt,
  getTranscreationTraits,
  getRegionalVoiceRouting,
} from '@/services/regionalTranscreationService';
import { getVoicesForMode } from '@/config/scriptModePresets';

// ─── INPUT TYPES ──────────────────────────────────────────────────────────────

export interface ScriptGenerationRequest {
  /** User prompt describing the content */
  prompt: string;
  /** Target product */
  product: GenieProduct;
  /** Script purpose */
  purpose: ScriptPurpose;
  /** Region code from regional registry (e.g., "INDIA_SOUTH_TA", "MENA_UAE") */
  regionCode?: string;
  /** Target language (BCP47, default: "en") */
  language?: string;
  /** Characters to use (auto-generated if not provided) */
  characters?: UniversalCharacter[];
  /** Emotional tone for the episode */
  emotionalTone?: EmotionalTone;
  /** Number of scenes (auto-calculated from constraints if not provided) */
  sceneCount?: number;
  /** Storage paths for the orchestrator */
  storagePaths?: UniversalEpisodeManifest['storagePaths'];
  /** Additional context (brand info, audience data, etc.) */
  additionalContext?: string;
}

export interface ScriptGenerationResult {
  success: boolean;
  manifest?: UniversalEpisodeManifest;
  validation?: { valid: boolean; errors: string[] };
  error?: string;
  /** Time taken in ms */
  durationMs?: number;
  /** AI provider used */
  provider?: string;
}

// ─── DYNAMIC CHARACTER RESOLUTION ─────────────────────────────────────────────

/** Character role definitions — voices resolved dynamically per region/product */
const CHARACTER_ROLES: Array<{ key: string; name: string; role: string; gender: 'male' | 'female'; motionStyle: UniversalCharacter['motionStyle'] }> = [
  { key: 'host', name: 'Atlas', role: 'Primary host and narrator', gender: 'male', motionStyle: 'measured' },
  { key: 'cohost', name: 'Nova', role: 'Co-host and challenger', gender: 'female', motionStyle: 'expressive' },
  { key: 'cohost', name: 'Nova', role: 'Co-host and challenger', gender: 'female', motionStyle: 'expressive' },
];

/**
 * Resolve characters with voice configs from existing infrastructure.
 * Uses getRegionalVoiceRouting for region-aware voice, falls back to scriptModePresets.
 */
function resolveCharacters(
  product: GenieProduct,
  regionCode?: string,
  multiCharacter = false,
): UniversalCharacter[] {
  const roles = multiCharacter ? CHARACTER_ROLES : [CHARACTER_ROLES[0]];

  // If region provided, use regional voice routing (parent→child inheritance built-in)
  if (regionCode) {
    const voiceRouting = getRegionalVoiceRouting(
      regionCode,
      roles.map(r => ({ key: r.key, gender: r.gender })),
    );
    return roles.map(role => ({
      key: role.key,
      name: role.name,
      role: role.role,
      voice: voiceRouting[role.key] || getFallbackVoice(role.gender),
      avatarStyle: 'pixar-3d' as const,
      motionStyle: role.motionStyle,
    }));
  }

  // No region — use scriptModePresets voices
  const modeVoices = getVoicesForMode('video');
  return roles.map((role, i) => {
    const preset = modeVoices[i] || modeVoices[0];
    return {
      key: role.key,
      name: role.name,
      role: role.role,
      voice: {
        provider: preset.provider as VoiceConfig['provider'],
        voiceId: preset.voiceId,
        fallbackProvider: 'alibaba' as const,
        fallbackVoice: 'longxiaochun',
        stability: preset.stability,
        similarityBoost: preset.similarityBoost,
        speed: preset.speed,
      },
      avatarStyle: 'pixar-3d' as const,
      motionStyle: role.motionStyle,
    };
  });
}

/** Safe fallback voice when no regional voice found */
function getFallbackVoice(gender: 'male' | 'female'): VoiceConfig {
  const modeVoices = getVoicesForMode('video');
  const preset = modeVoices[0];
  return {
    provider: (preset?.provider || 'elevenlabs') as VoiceConfig['provider'],
    voiceId: preset?.voiceId || 'onwK4e9ZLuTAKqWW03F9',
    fallbackProvider: 'alibaba',
    fallbackVoice: 'longxiaochun',
    stability: preset?.stability ?? 0.5,
    similarityBoost: preset?.similarityBoost ?? 0.75,
    speed: preset?.speed ?? 1.0,
  };
}

// ─── SYSTEM PROMPT BUILDER ────────────────────────────────────────────────────

function buildSystemPrompt(req: ScriptGenerationRequest): string {
  const constraints = getProductConstraints(req.product);
  const chars = req.characters || resolveCharacters(req.product, req.regionCode, false);
  const charNames = chars.map(c => `${c.key} (${c.name} — ${c.role})`).join(', ');
  const maxScenes = req.sceneCount || Math.min(constraints.maxScenes, 8);
  const maxDuration = constraints.maxDurationSeconds;
  const wpm = constraints.targetWPM;
  const tone = req.emotionalTone || constraints.defaultTone;

  // Cultural direction from B2 pipeline
  const culturalDirective = req.regionCode
    ? getTranscreationDirectionPrompt(req.regionCode, tone, req.product)
    : '';

  return `You are a professional script writer for the Genie Suite "${req.product}" product.

OUTPUT FORMAT: You MUST return valid JSON only. No markdown, no explanation, just the JSON object.

PRODUCT CONSTRAINTS:
- Product: ${req.product}
- Purpose: ${req.purpose}
- Max duration: ${maxDuration}s
- Max scenes: ${maxScenes}
- Target WPM: ${wpm}
- Allowed scene types: ${constraints.allowedSceneTypes.join(', ')}
- Multi-character: ${constraints.multiCharacter}
- Interactive elements: ${constraints.interactive}
- Emotional tone: ${tone}

CHARACTERS:
${charNames}

${culturalDirective ? `\nCULTURAL DIRECTION:\n${culturalDirective}\n` : ''}
${req.additionalContext ? `\nADDITIONAL CONTEXT:\n${req.additionalContext}\n` : ''}

RETURN THIS EXACT JSON STRUCTURE:
{
  "title": "Episode title",
  "subtitle": "Tagline",
  "scenes": [
    {
      "id": "scene-0-intro",
      "title": "Scene title",
      "sceneType": "talking-head",
      "transitionIn": "fade",
      "layout": "fullscreen",
      "music": { "prompt": "background music description", "volume": 0.3 },
      "lines": [
        {
          "key": "s0-line-0",
          "text": "The exact spoken text",
          "voice": "host",
          "direction": "Performance direction for delivery",
          "lipsync": true,
          "emotionalTone": "${tone}",
          "sfx": [],
          "motion": "gesture description"
        }
      ]
    }
  ]
}

RULES:
1. Each line's "voice" must match a character key: ${chars.map(c => c.key).join(', ')}
2. Each scene's "sceneType" must be one of: ${constraints.allowedSceneTypes.join(', ')}
3. Keep total word count under ${Math.floor(maxDuration * wpm / 60)} words
4. Generate ${maxScenes} scenes maximum
5. Make the script engaging, purposeful, and true to the "${tone}" tone
6. Each line should be 1-3 sentences (10-40 words) for natural TTS pacing
7. Include a CTA scene at the end if appropriate`;
}

// ─── AI CALL ──────────────────────────────────────────────────────────────────

interface AISceneOutput {
  id: string;
  title: string;
  sceneType: string;
  transitionIn?: string;
  layout?: string;
  music?: { prompt?: string; volume?: number };
  lines: Array<{
    key: string;
    text: string;
    voice: string;
    direction?: string;
    lipsync?: boolean;
    emotionalTone?: string;
    sfx?: string[];
    motion?: string;
    visualRef?: string;
    links?: Array<{ label: string; url: string; type: string }>;
  }>;
}

interface AIScriptOutput {
  title: string;
  subtitle?: string;
  scenes: AISceneOutput[];
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<{ data: AIScriptOutput; provider: string }> {
  const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
    body: {
      prompt: userPrompt,
      systemPrompt,
      responseFormat: 'json',
      maxTokens: 4000,
      temperature: 0.7,
    },
  });

  if (error) throw new Error(`AI call failed: ${error.message}`);

  // Parse the response — handle both direct JSON and text-wrapped JSON
  let parsed: AIScriptOutput;
  const provider = data?.provider || data?.model || 'unknown';

  if (data?.result && typeof data.result === 'object' && data.result.scenes) {
    parsed = data.result as AIScriptOutput;
  } else {
    const raw = data?.result || data?.content || data?.text || data?.response || '';
    const jsonStr = typeof raw === 'string' ? raw : JSON.stringify(raw);

    // Extract JSON from potential markdown wrapping
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI returned no valid JSON');
    parsed = JSON.parse(jsonMatch[0]);
  }

  if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
    throw new Error('AI output missing scenes array');
  }

  return { data: parsed, provider };
}

// ─── MANIFEST ASSEMBLER ──────────────────────────────────────────────────────

function assembleManifest(
  req: ScriptGenerationRequest,
  aiOutput: AIScriptOutput,
): UniversalEpisodeManifest {
  const constraints = getProductConstraints(req.product);
  const characters = req.characters || resolveCharacters(
    req.product, req.regionCode, constraints.multiCharacter,
  );

  // Enrich characters with regional traits
  const enrichedCharacters = req.regionCode
    ? characters.map(c => enrichCharacterWithRegion(c, req.regionCode!))
    : characters;

  // Characters are already enriched — use as final
  const finalCharacters = enrichedCharacters;

  // Build script lines map
  const scriptLines: Record<string, UniversalScriptLine> = {};
  const sceneDefs: UniversalSceneDefinition[] = [];
  const wpm = constraints.targetWPM;

  for (const scene of aiOutput.scenes) {
    const scriptKeys: string[] = [];
    let sceneDuration = 0;

    for (const line of scene.lines) {
      const wordCount = line.text.split(/\s+/).length;
      const durationEst = Math.round((wordCount / wpm) * 60 * 10) / 10; // round to 0.1s

      let scriptLine: UniversalScriptLine = {
        key: line.key,
        text: line.text,
        voice: line.voice,
        scene: scene.id,
        durationEst,
        direction: line.direction || '',
        lipsync: line.lipsync ?? true,
        sfx: line.sfx,
        motion: line.motion,
        visualRef: line.visualRef,
        emotionalTone: (line.emotionalTone as EmotionalTone) || req.emotionalTone || constraints.defaultTone,
        links: line.links as UniversalScriptLine['links'],
      };

      // B2 enrichment — inject cultural traits
      if (req.regionCode) {
        scriptLine = enrichScriptLineWithRegion(scriptLine, req.regionCode, scriptLine.emotionalTone);
      }

      scriptLines[line.key] = scriptLine;
      scriptKeys.push(line.key);
      sceneDuration += durationEst;
    }

    sceneDefs.push({
      id: scene.id,
      title: scene.title,
      sceneType: scene.sceneType,
      scriptKeys,
      durationEst: sceneDuration,
      transitionIn: (scene.transitionIn as UniversalSceneDefinition['transitionIn']) || 'fade',
      layout: (scene.layout as UniversalSceneDefinition['layout']) || 'fullscreen',
      music: scene.music ? {
        prompt: scene.music.prompt,
        volume: scene.music.volume ?? 0.3,
        fadeIn: 2,
        fadeOut: 2,
      } : undefined,
    });
  }

  // Build voice routing
  const voiceRouting: Record<string, VoiceConfig> = {};
  for (const char of finalCharacters) {
    voiceRouting[char.key] = char.voice;
  }

  // Get cultural traits for episode level
  const culturalTraits: CulturalTraits | undefined = req.regionCode
    ? getTranscreationTraits(req.regionCode)
    : undefined;

  const storagePaths = req.storagePaths || {
    bucket: 'genie-media',
    ttsPrefix: `${req.product}-generated-tts`,
    musicPrefix: `${req.product}-generated-music`,
    sfxPrefix: `${req.product}-generated-sfx`,
    screenshotBucket: 'product-screenshots',
    screenshotPattern: 'screenshots/{id}.png',
  };

  return {
    id: `${req.product}-${Date.now()}`,
    title: aiOutput.title || 'Generated Script',
    subtitle: aiOutput.subtitle,
    product: req.product,
    purpose: req.purpose,
    language: req.language || 'en',
    regionCode: req.regionCode,
    scenes: sceneDefs,
    scriptLines,
    characters: finalCharacters,
    voiceRouting,
    storagePaths,
    maxDurationSeconds: constraints.maxDurationSeconds,
    maxScenes: constraints.maxScenes,
    targetWPM: constraints.targetWPM,
    culturalTraits,
    emotionalArc: sceneDefs.map(scene => {
      // Derive emotional tone from each scene's dominant line tone (not hardcoded)
      const sceneLines = scene.scriptKeys.map(k => scriptLines[k]).filter(Boolean);
      const dominantTone = sceneLines[0]?.emotionalTone || req.emotionalTone || constraints.defaultTone;
      return dominantTone;
    }),
    createdAt: new Date().toISOString(),
    version: 1,
  };
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/**
 * Generate a complete UniversalEpisodeManifest from a text prompt.
 * 
 * This is the B1 pipeline:
 *   prompt → AI → UniversalScriptLine[] → B2 enrichment → manifest → validate
 */
export async function generateUniversalScript(
  request: ScriptGenerationRequest,
): Promise<ScriptGenerationResult> {
  const startTime = Date.now();

  try {
    // 1. Build system prompt
    const systemPrompt = buildSystemPrompt(request);

    // 2. Call AI
    const { data: aiOutput, provider } = await callAI(systemPrompt, request.prompt);

    // 3. Assemble manifest (includes B2 enrichment)
    const manifest = assembleManifest(request, aiOutput);

    // 4. Validate
    const validation = validateManifest(manifest);

    return {
      success: true,
      manifest,
      validation,
      durationMs: Date.now() - startTime,
      provider,
    };
  } catch (err) {
    console.error('[ScriptGenerator] Error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Generate script for multiple regions (fan-out).
 * Uses B2 enrichment per region.
 */
export async function generateMultiRegionScript(
  request: ScriptGenerationRequest,
  regionCodes: string[],
): Promise<Record<string, ScriptGenerationResult>> {
  const results: Record<string, ScriptGenerationResult> = {};

  // Generate base script first (or use first region)
  const baseRegion = regionCodes[0] || request.regionCode;
  const baseResult = await generateUniversalScript({
    ...request,
    regionCode: baseRegion,
  });

  if (!baseResult.success || !baseResult.manifest) {
    // All regions fail if base fails
    for (const code of regionCodes) {
      results[code] = baseResult;
    }
    return results;
  }

  results[baseRegion || 'global'] = baseResult;

  // Transcreate for remaining regions by re-enriching the base
  for (const regionCode of regionCodes.slice(1)) {
    try {
      const regionalManifest: UniversalEpisodeManifest = {
        ...baseResult.manifest,
        id: `${request.product}-${regionCode}-${Date.now()}`,
        regionCode,
        culturalTraits: getTranscreationTraits(regionCode),
        scriptLines: Object.fromEntries(
          Object.entries(baseResult.manifest.scriptLines).map(([key, line]) => [
            key,
            enrichScriptLineWithRegion(line, regionCode, line.emotionalTone),
          ]),
        ),
        characters: baseResult.manifest.characters.map(c =>
          enrichCharacterWithRegion(c, regionCode),
        ),
      };

      const validation = validateManifest(regionalManifest);
      results[regionCode] = {
        success: true,
        manifest: regionalManifest,
        validation,
        provider: baseResult.provider,
      };
    } catch (err) {
      results[regionCode] = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return results;
}

// ─── HOOK-FRIENDLY WRAPPER ──────────────────────────────────────────────────

export const universalScriptGeneratorService = {
  generate: generateUniversalScript,
  generateMultiRegion: generateMultiRegionScript,
};
