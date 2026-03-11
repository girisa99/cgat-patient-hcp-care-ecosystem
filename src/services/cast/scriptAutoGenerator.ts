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
