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
  DEFAULT_FALLBACK_VOICE,
  DEFAULT_ELEVENLABS_VOICE_ID,
  DEFAULT_AVATAR_STYLE,
  DEFAULT_STORAGE_PATHS,
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
  /** User prompt describing the content — can be in ANY language */
  prompt: string;
  /** Target product */
  product: GenieProduct;
  /** Script purpose */
  purpose: ScriptPurpose;
  /** Region code from regional registry (e.g., "INDIA_SOUTH_TA", "MENA_UAE") */
  regionCode?: string;
  /** Target language (BCP47, default: "en") — output language for the script */
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
  /**
   * Translation provider preference for multilingual input handling.
   * Default: auto-selects best provider based on detected language.
   * DeepL for European, Alibaba for CJK, AI for others.
   */
  translationProvider?: 'deepl' | 'google' | 'alibaba' | 'ai' | 'auto';
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
      avatarStyle: DEFAULT_AVATAR_STYLE,
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
        fallbackProvider: DEFAULT_FALLBACK_VOICE.provider,
        fallbackVoice: DEFAULT_FALLBACK_VOICE.voiceId,
        stability: preset.stability,
        similarityBoost: preset.similarityBoost,
        speed: preset.speed,
      },
      avatarStyle: DEFAULT_AVATAR_STYLE,
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
    voiceId: preset?.voiceId || DEFAULT_ELEVENLABS_VOICE_ID,
    fallbackProvider: DEFAULT_FALLBACK_VOICE.provider,
    fallbackVoice: DEFAULT_FALLBACK_VOICE.voiceId,
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
    ...DEFAULT_STORAGE_PATHS,
    ttsPrefix: `${req.product}-${DEFAULT_STORAGE_PATHS.ttsPrefix}`,
    musicPrefix: `${req.product}-${DEFAULT_STORAGE_PATHS.musicPrefix}`,
    sfxPrefix: `${req.product}-${DEFAULT_STORAGE_PATHS.sfxPrefix}`,
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

// ─── MULTILINGUAL INPUT PIPELINE ─────────────────────────────────────────────

/** European language codes where DeepL excels */
const DEEPL_LANGUAGES = new Set([
  'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'cs', 'da', 'el',
  'et', 'fi', 'hu', 'id', 'lt', 'lv', 'nb', 'ro', 'sk', 'sl', 'sv', 'tr', 'uk',
]);
/** CJK + SEA language codes where Alibaba excels */
const ALIBABA_LANGUAGES = new Set(['zh', 'ja', 'ko', 'th', 'vi', 'ms', 'id']);

/**
 * Auto-select the best translation provider based on detected input language.
 * Uses existing provider strengths: DeepL → European, Alibaba → CJK/SEA, AI → all others.
 */
function selectTranslationProvider(detectedLang: string, preference?: string): string {
  if (preference && preference !== 'auto') return preference;
  const langBase = detectedLang.split('-')[0].toLowerCase();
  if (langBase === 'en') return 'none'; // No translation needed
  if (DEEPL_LANGUAGES.has(langBase)) return 'deepl';
  if (ALIBABA_LANGUAGES.has(langBase)) return 'alibaba';
  return 'ai'; // Gemini/GPT fallback for Arabic, Hindi, Urdu, Swahili, etc.
}

/**
 * Detect input language, translate prompt to English for AI processing,
 * and return metadata for downstream transcreation.
 * Uses the existing translation-service edge function.
 */
async function processMultilingualInput(
  prompt: string,
  translationProvider?: string,
): Promise<{
  translatedPrompt: string;
  detectedLanguage: string;
  wasTranslated: boolean;
  provider: string;
}> {
  // Step 1: Detect language via existing translation-service
  try {
    const { data: detectResult, error: detectError } = await supabase.functions.invoke('translation-service', {
      body: { action: 'detect', provider: 'ai', text: prompt.substring(0, 500) },
    });

    if (detectError) throw detectError;

    const detectedLang = detectResult?.detectedLanguage || 'en';
    const langBase = detectedLang.split('-')[0].toLowerCase();

    // If already English, skip translation
    if (langBase === 'en') {
      return { translatedPrompt: prompt, detectedLanguage: 'en', wasTranslated: false, provider: 'none' };
    }

    // Step 2: Select best provider and translate to English
    const provider = selectTranslationProvider(detectedLang, translationProvider);

    const { data: translateResult, error: translateError } = await supabase.functions.invoke('translation-service', {
      body: {
        action: 'translate',
        provider,
        text: prompt,
        sourceLanguage: detectedLang,
        targetLanguage: 'en',
        context: 'video script generation prompt',
      },
    });

    if (translateError) throw translateError;

    const translatedText = translateResult?.translatedText || prompt;
    console.log(`[ScriptGenerator] Multilingual: ${detectedLang} → en via ${provider}`);

    return {
      translatedPrompt: translatedText,
      detectedLanguage: detectedLang,
      wasTranslated: true,
      provider,
    };
  } catch (err) {
    console.warn('[ScriptGenerator] Translation failed, using original prompt:', err);
    return { translatedPrompt: prompt, detectedLanguage: 'unknown', wasTranslated: false, provider: 'none' };
  }
}

/**
 * Transcreate generated script lines back to the target language.
 * Uses the existing translation-service transcreation action.
 */
async function transcreateScriptLines(
  manifest: UniversalEpisodeManifest,
  targetLanguage: string,
  regionCode: string,
): Promise<UniversalEpisodeManifest> {
  const langBase = targetLanguage.split('-')[0].toLowerCase();
  if (langBase === 'en') return manifest; // Already in English

  const provider = selectTranslationProvider(targetLanguage);
  const updatedLines = { ...manifest.scriptLines };

  // Transcreate each line (sequential to avoid rate limits on translation service)
  for (const [key, line] of Object.entries(updatedLines)) {
    try {
      const { data, error } = await supabase.functions.invoke('translation-service', {
        body: {
          action: 'transcreate',
          provider,
          text: line.text,
          sourceLanguage: 'en',
          targetLanguage,
          region: regionCode,
          context: `Scene: ${line.scene}. Direction: ${line.direction}. Tone: ${line.emotionalTone}.`,
        },
      });

      if (!error && data?.transcreatedText) {
        updatedLines[key] = {
          ...line,
          text: data.transcreatedText,
          direction: line.direction ? `[${targetLanguage.toUpperCase()}] ${line.direction}` : '',
        };
      }
    } catch {
      // Keep English text if transcreation fails for this line
      console.warn(`[ScriptGenerator] Transcreation failed for ${key}, keeping English`);
    }
  }

  return { ...manifest, scriptLines: updatedLines, language: targetLanguage };
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/**
 * Generate a complete UniversalEpisodeManifest from a text prompt in ANY language.
 * 
 * Full multilingual pipeline:
 *   1. Detect input language (Thai, Arabic, Hindi, etc.)
 *   2. Translate prompt → English (via DeepL/Alibaba/AI — auto-selected)
 *   3. Generate script via AI in English
 *   4. Enrich with B2 regional/cultural transcreation
 *   5. Transcreate output back to target language (if non-English)
 *   6. Validate manifest
 */
export async function generateUniversalScript(
  request: ScriptGenerationRequest,
): Promise<ScriptGenerationResult> {
  const startTime = Date.now();

  try {
    // 1. Multilingual input: detect + translate prompt to English
    const { translatedPrompt, detectedLanguage, wasTranslated, provider: translationProvider } =
      await processMultilingualInput(request.prompt, request.translationProvider);

    // Auto-set language from detection if not explicitly provided
    const targetLanguage = request.language || (wasTranslated ? detectedLanguage : 'en');

    // 2. Build system prompt (uses English prompt for AI)
    const enrichedRequest = { ...request, prompt: translatedPrompt };
    const systemPrompt = buildSystemPrompt(enrichedRequest);

    // 3. Call AI with English prompt
    const { data: aiOutput, provider: aiProvider } = await callAI(systemPrompt, translatedPrompt);

    // 4. Assemble manifest with B2 cultural enrichment
    const baseManifest = assembleManifest(enrichedRequest, aiOutput);

    // 5. Transcreate output to target language if needed
    const manifest = wasTranslated
      ? await transcreateScriptLines(baseManifest, targetLanguage, request.regionCode || '')
      : baseManifest;

    // 6. Validate
    const validation = validateManifest(manifest);

    return {
      success: true,
      manifest,
      validation,
      durationMs: Date.now() - startTime,
      provider: aiProvider,
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
