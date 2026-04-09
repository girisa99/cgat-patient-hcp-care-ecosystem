/**
 * SCRIPT AUTO-GENERATOR
 *
 * Orchestrates the full prompt-to-script pipeline:
 *   User prompt → promptEnhancementEngine → template selection
 *   → castEndToEndPromptEngine → full production script
 *
 * This is the bridge between a user's simple description and a
 * complete production-ready script with scenes, dialogue, visual
 * directions, and music cues.
 *
 * @see src/config/scriptTemplates.ts — template structures
 * @see src/services/cast/projectPipelineGenerator.ts — pipeline config
 * @see src/config/universal-script-schema.ts — output schema
 */

import type {
  UniversalScriptLine,
  UniversalSceneDefinition,
  UniversalCharacter,
  UniversalEpisodeManifest,
  ScriptPurpose,
  EmotionalTone,
  VoiceConfig,
} from '@/config/universal-script-schema';
import { getScriptTemplate, scaleTemplateToDuration, type ScriptTemplate, type ScriptTemplateBeat } from '@/config/scriptTemplates';
import type { CastProjectConfig, GeneratedPipeline } from './projectPipelineGenerator';
import { supabase } from '@/integrations/supabase/client';

// ─── SCRIPT GENERATION INPUT ────────────────────────────────────────────────

export interface ScriptGenerationInput {
  /** User's raw prompt/description */
  prompt: string;
  /** Project configuration */
  projectConfig: CastProjectConfig;
  /** Generated pipeline (from projectPipelineGenerator) */
  pipeline: GeneratedPipeline;
  /** Characters to use (from pipeline.suggestedCharacters or user-defined) */
  characters: Partial<UniversalCharacter>[];
  /** Additional context (brand profile, competitor info, etc.) */
  context?: {
    brandName?: string;
    brandIndustry?: string;
    keyMessages?: string[];
    targetPainPoints?: string[];
    competitorDifferentiators?: string[];
    complianceNotes?: string[];
  };
}

/** Output of the script auto-generator */
export interface GeneratedScript {
  /** Complete episode manifest ready for orchestration */
  manifest: UniversalEpisodeManifest;
  /** The template that was used */
  templateUsed: string;
  /** Metadata about the generation */
  meta: {
    totalLines: number;
    totalScenes: number;
    estimatedDuration: number;
    speakerCount: number;
    wordsPerMinute: number;
  };
}

// ─── SCRIPT GENERATION ──────────────────────────────────────────────────────

/**
 * Generate a complete production script from a user prompt.
 *
 * This function creates the script structure (scenes, lines, timing)
 * locally. The actual AI-generated dialogue content is produced by
 * calling castEndToEndPromptEngine via the universal-scene-orchestrator.
 *
 * The output is a complete UniversalEpisodeManifest that can be
 * sent directly to the orchestrator for production.
 */
export function generateScriptStructure(input: ScriptGenerationInput): GeneratedScript {
  const { prompt, projectConfig, pipeline, characters, context } = input;
  const { format, industry, tone, durationTarget, baseLanguage, regionCode } = projectConfig;

  // 1. Get template for this format
  const template = getScriptTemplate(format) || getScriptTemplate('explainer')!;
  const scaledBeats = scaleTemplateToDuration(template, durationTarget);

  // 2. Generate scene definitions from template beats
  const scenes: UniversalSceneDefinition[] = [];
  const scriptLines: Record<string, UniversalScriptLine> = {};
  let lineIndex = 0;

  for (let beatIndex = 0; beatIndex < scaledBeats.length; beatIndex++) {
    const beat = scaledBeats[beatIndex];
    const sceneId = `scene-${beatIndex}-${beat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    // Determine number of lines for this scene
    const lineCount = Math.max(
      beat.minLines,
      Math.min(beat.maxLines, Math.round(beat.durationSeconds / 8)) // ~8s per line average
    );

    // Generate script line placeholders for each line in the scene
    const sceneLineKeys: string[] = [];
    const speakerRotation = characters.length > 0 ? characters : [{ key: 'narrator' }];

    for (let li = 0; li < lineCount; li++) {
      const lineKey = `${sceneId}-line-${li}`;
      const speaker = speakerRotation[li % speakerRotation.length];
      const lineDuration = Math.round(beat.durationSeconds / lineCount);

      scriptLines[lineKey] = {
        key: lineKey,
        text: '', // To be filled by AI script generation
        voice: speaker.key || 'narrator',
        scene: sceneId,
        durationEst: lineDuration,
        direction: buildDirection(beat, li, lineCount),
        lipsync: beat.requiresSpeaker,
        emotionalTone: beat.tone,
        regionCode,
        metadata: {
          beatName: beat.name,
          beatPurpose: beat.purpose,
          contentGuide: beat.contentGuide,
          lineIndexInBeat: li,
          totalLinesInBeat: lineCount,
        },
      };

      sceneLineKeys.push(lineKey);
      lineIndex++;
    }

    // Get music config from pipeline
    const pipelineScene = pipeline.scenes[beatIndex];
    const musicConfig = pipelineScene?.music;

    scenes.push({
      id: sceneId,
      title: beat.name,
      sceneType: beat.sceneType,
      scriptKeys: sceneLineKeys,
      durationEst: beat.durationSeconds,
      music: musicConfig ? {
        prompt: musicConfig.prompt,
        volume: 0.3,
        fadeIn: 0.5,
        fadeOut: 0.5,
        loop: true,
      } : undefined,
      transitionIn: beatIndex === 0 ? 'fade' : 'dissolve',
      transitionOut: beatIndex === scaledBeats.length - 1 ? 'fade' : 'dissolve',
      layout: beat.requiresSpeaker && characters.length >= 2 ? 'split-screen' : 'fullscreen',
    });
  }

  // 3. Build voice routing
  const voiceRouting: Record<string, VoiceConfig> = {};
  for (const char of characters) {
    if (char.key && char.voice) {
      voiceRouting[char.key] = char.voice;
    }
  }

  // 4. Build the episode manifest
  const manifest: UniversalEpisodeManifest = {
    id: projectConfig.projectId,
    title: projectConfig.title,
    subtitle: prompt.slice(0, 100),
    product: 'cast',
    purpose: pipeline.scriptPurpose,
    language: baseLanguage || 'en-US',
    regionCode,
    scenes,
    scriptLines,
    characters: characters as UniversalCharacter[],
    voiceRouting,
    storagePaths: {
      bucket: 'cast-production',
      ttsPrefix: `${projectConfig.projectId}/tts`,
      musicPrefix: `${projectConfig.projectId}/music`,
      sfxPrefix: `${projectConfig.projectId}/sfx`,
      screenshotBucket: 'cast-screenshots',
      screenshotPattern: `${projectConfig.projectId}/screenshots/{screenId}.png`,
    },
    maxDurationSeconds: durationTarget * 1.2, // 20% buffer
    targetWPM: 150,
  };

  // 5. Calculate metadata
  const totalLines = Object.keys(scriptLines).length;
  const estimatedDuration = scenes.reduce((sum, s) => sum + s.durationEst, 0);

  return {
    manifest,
    templateUsed: template.id,
    meta: {
      totalLines,
      totalScenes: scenes.length,
      estimatedDuration,
      speakerCount: characters.length,
      wordsPerMinute: 150,
    },
  };
}

/**
 * Build a performance direction string for a script line.
 */
function buildDirection(
  beat: ScriptTemplateBeat & { durationSeconds: number },
  lineIndex: number,
  totalLines: number
): string {
  const parts: string[] = [];

  // Position cue
  if (lineIndex === 0) parts.push('Opening of section');
  else if (lineIndex === totalLines - 1) parts.push('Closing of section');

  // Tone cue
  parts.push(`Tone: ${beat.tone}`);

  // Purpose cue
  parts.push(beat.contentGuide);

  return parts.join('. ');
}

/**
 * Build an AI prompt for script content generation.
 * This prompt is sent to the LLM to fill in the actual dialogue.
 */
export function buildScriptGenerationPrompt(input: ScriptGenerationInput): string {
  const { prompt, projectConfig, pipeline, characters, context } = input;
  const template = getScriptTemplate(projectConfig.format);

  const characterDescriptions = characters
    .map(c => `- ${c.name} (${c.role}): ${c.motionStyle || 'natural'} delivery`)
    .join('\n');

  const templateStructure = template?.beats
    .map((b, i) => `${i + 1}. ${b.name} — ${b.purpose} (${b.tone}, ${Math.round(b.durationRatio * 100)}% of duration)`)
    .join('\n') || '';

  const contextNotes = context ? [
    context.brandName ? `Brand: ${context.brandName}` : '',
    context.keyMessages?.length ? `Key messages: ${context.keyMessages.join('; ')}` : '',
    context.targetPainPoints?.length ? `Pain points: ${context.targetPainPoints.join('; ')}` : '',
    context.complianceNotes?.length ? `Compliance: ${context.complianceNotes.join('; ')}` : '',
  ].filter(Boolean).join('\n') : '';

  return `Generate a production script for a ${projectConfig.format} video.

TOPIC: ${prompt}

INDUSTRY: ${projectConfig.industry}
AUDIENCE: ${projectConfig.targetAudience}
TONE: ${projectConfig.tone}
DURATION: ${projectConfig.durationTarget} seconds
LANGUAGE: ${projectConfig.baseLanguage}

CHARACTERS:
${characterDescriptions}

STRUCTURE (follow this template):
${templateStructure}

${contextNotes ? `CONTEXT:\n${contextNotes}` : ''}

INSTRUCTIONS:
- Write natural, conversational dialogue (not stiff corporate-speak)
- Each line should be 1-3 sentences, suitable for TTS at ~150 WPM
- Include visual directions in [brackets] for each scene
- Include music/SFX cues where appropriate
- Match the emotional tone specified for each section
- Total script should fill approximately ${projectConfig.durationTarget} seconds
`;
}

/**
 * Validate a generated script against the template constraints.
 */
export function validateScript(
  manifest: UniversalEpisodeManifest,
  template: ScriptTemplate
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check scene count
  if (manifest.scenes.length < template.beats.length * 0.5) {
    issues.push(`Too few scenes: ${manifest.scenes.length} (expected ~${template.beats.length})`);
  }

  // Check total duration
  const totalDuration = manifest.scenes.reduce((sum, s) => sum + s.durationEst, 0);
  if (manifest.maxDurationSeconds && totalDuration > manifest.maxDurationSeconds) {
    issues.push(`Duration ${totalDuration}s exceeds max ${manifest.maxDurationSeconds}s`);
  }

  // Check all script lines have text
  const emptyLines = Object.values(manifest.scriptLines).filter(l => !l.text);
  if (emptyLines.length > 0) {
    issues.push(`${emptyLines.length} script lines have no text (pending AI generation)`);
  }

  // Check speaker count
  if (template.minSpeakers > manifest.characters.length) {
    issues.push(`Need ${template.minSpeakers}+ speakers, have ${manifest.characters.length}`);
  }

  return { valid: issues.length === 0, issues };
}

// ─── AI SCRIPT CONTENT GENERATION ───────────────────────────────────────────

/**
 * Parse AI response into per-line dialogue text.
 *
 * Expected AI response format:
 * ```
 * SCENE: scene-0-hook
 * [speaker-1] Welcome to today's session on insulin management...
 * [speaker-2] That's right. Let me walk you through the key concepts...
 *
 * SCENE: scene-1-problem
 * [speaker-1] One of the biggest challenges patients face...
 * ```
 *
 * Falls back to line-by-line splitting if structured format not detected.
 */
function parseScriptResponse(
  response: string,
  manifest: UniversalEpisodeManifest,
): Record<string, string> {
  const lineTexts: Record<string, string> = {};
  const allLineKeys = Object.keys(manifest.scriptLines);

  // Try structured parsing: SCENE headers + [speaker] lines
  const sceneBlocks = response.split(/^SCENE:\s*/m).filter(Boolean);

  if (sceneBlocks.length > 1) {
    let globalLineIndex = 0;

    for (const block of sceneBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      // First line might be scene ID
      const sceneHeader = lines[0];

      // Find matching scene
      const matchedScene = manifest.scenes.find(s =>
        sceneHeader.includes(s.id) || sceneHeader.toLowerCase().includes(s.title.toLowerCase())
      );
      const sceneLineKeys = matchedScene?.scriptKeys || [];

      // Parse dialogue lines (with or without [speaker] tags)
      const dialogueLines = lines.slice(1).filter(l =>
        !l.startsWith('---') && !l.startsWith('===') && l.length > 5
      );

      for (let i = 0; i < dialogueLines.length; i++) {
        // Strip [speaker] tag if present
        let text = dialogueLines[i].replace(/^\[[\w-]+\]\s*/, '');
        // Strip visual directions in brackets at start
        text = text.replace(/^\[.*?\]\s*/, '');

        const targetKey = sceneLineKeys[i] || allLineKeys[globalLineIndex];
        if (targetKey) {
          lineTexts[targetKey] = text;
        }
        globalLineIndex++;
      }

      // If scene had fewer dialogue lines than expected, advance index
      if (dialogueLines.length < sceneLineKeys.length) {
        globalLineIndex += sceneLineKeys.length - dialogueLines.length;
      }
    }
  } else {
    // Fallback: split by non-empty lines, assign sequentially
    const lines = response
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 10 && !l.startsWith('#') && !l.startsWith('SCENE') && !l.startsWith('---'));

    for (let i = 0; i < Math.min(lines.length, allLineKeys.length); i++) {
      let text = lines[i];
      text = text.replace(/^\[[\w-]+\]\s*/, '');
      text = text.replace(/^\d+\.\s*/, '');
      text = text.replace(/^\[.*?\]\s*/, '');
      lineTexts[allLineKeys[i]] = text;
    }
  }

  return lineTexts;
}

/**
 * Generate actual dialogue content for a script structure using AI.
 *
 * Takes a manifest with empty script line text fields and fills them
 * with AI-generated dialogue via the ai-universal-processor edge function.
 *
 * @param input - Script generation input (prompt, config, characters)
 * @param manifest - Script structure with empty text fields to fill
 * @returns Updated manifest with dialogue text filled in, or null on failure
 */
export async function generateScriptContent(
  input: ScriptGenerationInput,
  manifest: UniversalEpisodeManifest,
): Promise<{ manifest: UniversalEpisodeManifest; tokensUsed: number } | null> {
  const { prompt, projectConfig, characters } = input;

  // Build a detailed prompt that includes the exact structure to fill
  const sceneStructure = manifest.scenes.map(scene => {
    const sceneLines = scene.scriptKeys.map(key => {
      const line = manifest.scriptLines[key];
      return `  [${line?.voice || 'narrator'}] {${key}} — ${line?.direction || ''}`;
    }).join('\n');

    return `SCENE: ${scene.id} — "${scene.title}" (${scene.durationEst}s)
${sceneLines}`;
  }).join('\n\n');

  const characterList = characters
    .map(c => `- ${c.key}: ${c.name} (${c.role}) — ${c.motionStyle || 'natural'} delivery`)
    .join('\n');

  const systemPrompt = `You are a professional scriptwriter for video production. Write natural, engaging dialogue that sounds conversational (not corporate-speak). Each line should be 1-3 sentences, optimized for text-to-speech at ~150 words per minute.

OUTPUT FORMAT: For each scene, write dialogue lines preceded by the scene header. Use exactly this format:

SCENE: <scene-id>
[<speaker-key>] The dialogue text for this line...
[<speaker-key>] The next dialogue line...

Write EXACTLY the number of lines shown in the structure below. Each {line-key} placeholder needs ONE line of dialogue.`;

  const userPrompt = `Generate a ${projectConfig.format} script about: ${prompt}

INDUSTRY: ${projectConfig.industry}
AUDIENCE: ${projectConfig.targetAudience}
TONE: ${projectConfig.tone}
DURATION: ${projectConfig.durationTarget} seconds
LANGUAGE: ${projectConfig.baseLanguage}

CHARACTERS:
${characterList}

STRUCTURE TO FILL (write exactly one dialogue line per placeholder):
${sceneStructure}

Write engaging, natural dialogue for each line. Match the emotional tone and purpose described in each direction. Total word count should be approximately ${Math.round(projectConfig.durationTarget * 150 / 60)} words (150 WPM × ${projectConfig.durationTarget}s).`;

  // L42: 3× retry with exponential backoff + 60s timeout per attempt
  const SCRIPT_RETRY_BACKOFFS = [0, 3000, 10000]; // 0s, 3s, 10s
  const SCRIPT_TIMEOUT_MS = 60000; // 60s

  let responseText: string | null = null;
  let data: Record<string, unknown> | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      const backoff = SCRIPT_RETRY_BACKOFFS[attempt] || 10000;
      console.log(`[ScriptGen] Retry ${attempt + 1}/3 after ${backoff / 1000}s`);
      await new Promise(r => setTimeout(r, backoff));
    }

    try {
      const invokePromise = supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          maxTokens: 4000,
        },
      });
      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>(resolve =>
        setTimeout(() => resolve({ data: null, error: { message: `Script generation timed out after ${SCRIPT_TIMEOUT_MS / 1000}s` } }), SCRIPT_TIMEOUT_MS)
      );
      const result = await Promise.race([invokePromise, timeoutPromise]);

      if (result.error) {
        const msg = result.error?.message || '';
        const isTransient = /timeout|timed out|5\d\d|rate.?limit|ECONNRESET/i.test(msg);
        if (isTransient) {
          console.warn(`[ScriptGen] Transient error (attempt ${attempt + 1}):`, msg);
          continue;
        }
        console.error('[ScriptGen] Non-transient error:', msg);
        return null;
      }

      data = result.data as Record<string, unknown>;
      responseText = ((data?.text || data?.content || data?.message || '') as string);

      if (responseText && responseText.length >= 50) {
        break; // Success
      }

      console.warn(`[ScriptGen] Too-short response (attempt ${attempt + 1}): ${responseText?.length || 0} chars`);
      responseText = null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`[ScriptGen] Exception (attempt ${attempt + 1}):`, msg);
      if (attempt === 2) return null;
    }
  }

  try {
    if (!responseText || responseText.length < 50) {
      console.error('[ScriptGen] Failed to get valid AI response after 3 attempts');
      return null;
    }

    // Parse response into per-line texts
    const lineTexts = parseScriptResponse(responseText, manifest);
    const filledCount = Object.keys(lineTexts).length;
    const totalLines = Object.keys(manifest.scriptLines).length;

    console.log(`[ScriptGen] Filled ${filledCount}/${totalLines} lines from AI response`);

    if (filledCount === 0) {
      console.error('[ScriptGen] Failed to parse any lines from AI response');
      return null;
    }

    // Validation: warn if less than 50% of lines were filled (partial success)
    const fillRatio = filledCount / totalLines;
    if (fillRatio < 0.5) {
      console.warn(`[ScriptGen] Low fill ratio: ${(fillRatio * 100).toFixed(0)}% — AI response may not match template structure`);
    }

    // Merge AI-generated text into the manifest
    const updatedScriptLines = { ...manifest.scriptLines };
    for (const [key, text] of Object.entries(lineTexts)) {
      if (updatedScriptLines[key]) {
        updatedScriptLines[key] = { ...updatedScriptLines[key], text };
      }
    }

    const updatedManifest: UniversalEpisodeManifest = {
      ...manifest,
      scriptLines: updatedScriptLines,
    };

    const tokensUsed = (data?.tokensUsed as number) || Math.round(responseText!.length / 4);

    return { manifest: updatedManifest, tokensUsed };
  } catch (err) {
    console.error('[ScriptGen] generateScriptContent failed:', err);
    return null;
  }
}
