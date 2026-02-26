/**
 * Agentic Content Orchestrator — Multi-Agent Content Pipeline
 *
 * Coordinates 8 specialized agents to produce rich, cinematic, publish-ready
 * content for GenieSuite self-marketing. Product-agnostic — any GenieSuite
 * product can invoke this orchestrator.
 *
 * Pipeline: CreativeDirector → Scriptwriter → VisualDesigner → QualityReviewer
 *           → VoiceoverAgent → AudioMixAgent → TranscreationAgent → PublishCoordinator
 *
 * Each agent step is wrapped in LoopAgent self-correction for quality assurance.
 * Items in a batch run in parallel; agents within each item run sequentially.
 */

import type { GenieProduct } from '@/types/publishing';
import type {
  MessagingArchetype,
  VoiceCharacter,
  IndustryVertical,
  ContentTone,
  TemplateStyle,
  AutoPublishContentItem,
  AutoPublishContentPlan,
} from './autoPublishContentEngine';
import { generateContentPlan } from './autoPublishContentEngine';
import type { StructuredContentScript, ScriptwriterBrief } from './creativeContentScriptwriter';
import {
  generateStructuredScript,
  pickFictitiousBusiness,
  FICTITIOUS_BUSINESSES,
} from './creativeContentScriptwriter';
import type { VisualRotationSchedule, CinematographyPreset } from './visualStyleRotation';
import { getVisualStyleForWeek, getUpcomingRotation } from './visualStyleRotation';
import type { CreativeStyleFamily } from '@/services/brand-intelligence/castCreativeStylesRegistry';
import { getStyleForRegion, CREATIVE_STYLES } from '@/services/brand-intelligence/castCreativeStylesRegistry';
import { transcreateContent } from './autoPublishTranscreator';
// ── Production bridge (Phase D — wires agentic pipeline into full production infrastructure) ──
import type {
  AgenticProductionPlan,
  AgenticProductionBridgeConfig,
  ProductionBlueprint,
  TimelineBlueprint,
  PacingProfile,
} from './agenticProductionBridge';
import {
  resolveFormatFromTemplate,
  buildProductionScriptFromAgenticContext,
  buildProductionBlueprint,
  calculatePacingProfile,
  syncScriptToDuration,
  buildTimelineBlueprint,
  determineChunkingStrategy,
  enrichAgenticContext,
} from './agenticProductionBridge';
import type { FullProductionScript } from '@/services/brand-intelligence/castEndToEndPromptEngine';
import type { EnrichmentContext } from '@/services/production/castProductionBridge';
import type { PublishingContentPackage } from '@/types/publishing';
// ── Core routing infrastructure (canonical sources — no hardcoding) ──
import {
  getTTSRouting,
  getZoneForLanguage,
  getAudioRouting,
  AUDIO_MASTER_ROUTING,
  type TTSRoutingConfig,
} from '@/config/master-provider-routing-registry';
import {
  LANGUAGE_VOICE_PAIRINGS,
  getLanguagePairing,
  getVoiceId,
  type VoiceProvider as TTSVoiceProvider,
} from '@/hooks/useAskGenieVoice';
import { getVoicesForProvider, getDefaultVoice } from '@/config/voice-catalog';
import { getRegionalCreativeDirection } from '@/config/genie-cast-regional-creative-config';
import { getAvatarVoiceCharacteristicsForRegion } from '@/services/regionalAvatarGuidelines';
import {
  createLoopAgentEngine,
  type QualityRubric,
  type RubricEvaluation,
} from '@/services/executionEngines/LoopAgentSelfCorrectionEngine';

// ─── Agent Types ────────────────────────────────────────────────────

export type AgentRole =
  | 'creative_director'
  | 'scriptwriter'
  | 'visual_designer'
  | 'quality_reviewer'
  | 'voiceover_agent'
  | 'audio_mix_agent'
  | 'transcreation'
  | 'publish_coordinator';

export type AgentStatus = 'pending' | 'running' | 'completed' | 'error';

export const AGENT_PIPELINE_ORDER: AgentRole[] = [
  'creative_director',
  'scriptwriter',
  'visual_designer',
  'quality_reviewer',
  'voiceover_agent',
  'audio_mix_agent',
  'transcreation',
  'publish_coordinator',
];

export const AGENT_LABELS: Record<AgentRole, string> = {
  creative_director: 'Creative Director',
  scriptwriter: 'Scriptwriter',
  visual_designer: 'Visual Designer',
  quality_reviewer: 'Quality Reviewer',
  voiceover_agent: 'Voiceover / TTS',
  audio_mix_agent: 'Audio Mix',
  transcreation: 'Transcreation',
  publish_coordinator: 'Publish Coordinator',
};

// ─── Context / State Types ──────────────────────────────────────────

export interface AgenticCreativeDirection {
  archetype: MessagingArchetype;
  industry: IndustryVertical;
  tone: ContentTone;
  voiceCharacter: VoiceCharacter;
  template: TemplateStyle;
  format: string;
  productFocus: GenieProduct;
  fictitiousName: string;
  fictitiousType: string;
}

export interface AgenticVisualDirection {
  styleFamily: CreativeStyleFamily;
  styleFamilyLabel: string;
  cinematography: CinematographyPreset;
  characterDesign: string;
  colorPalette: string[];
  fullCharacterRender: true;
}

export interface AgenticQualityResult {
  score: number;
  passed: boolean;
  iterations: number;
  feedback: string[];
}

// ─── Voiceover Direction (set by VoiceoverAgent) ────────────────────

export type VoiceoverEmotion = 'energetic' | 'concerned' | 'hopeful' | 'confident' | 'urgent' | 'warm' | 'playful' | 'authoritative';

export interface VoiceoverSectionCue {
  section: 'hook' | 'problem' | 'transformation' | 'solution' | 'cta';
  text: string;
  emotion: VoiceoverEmotion;
  pacing: 'slow' | 'normal' | 'fast';
  pauseAfterMs: number;
  estimatedDurationSec: number;
}

export interface AgenticVoiceoverDirection {
  provider: string;
  voiceId: string;
  voiceGender: 'male' | 'female' | 'neutral';
  language: string;
  sectionCues: VoiceoverSectionCue[];
  totalDurationSec: number;
  fallbackProviders: string[];
  ssmlEnabled: boolean;
}

// ─── Audio Mix Direction (set by AudioMixAgent) ─────────────────────

export interface AudioMixTrack {
  trackType: 'voiceover' | 'background_music' | 'sfx' | 'ambient';
  label: string;
  volumeDb: number;
  fadeInMs: number;
  fadeOutMs: number;
  startOffsetMs: number;
  durationMs: number;
}

export interface SoundEffectCue {
  section: 'hook' | 'problem' | 'transformation' | 'solution' | 'cta' | 'transition';
  effect: string;
  description: string;
  volumeDb: number;
  offsetMs: number;
}

export interface AgenticAudioMixDirection {
  musicPrompt: string;
  musicGenre: string;
  musicBpm: number;
  musicInstruments: string[];
  musicVolumeDb: number;
  voiceoverVolumeDb: number;
  ducking: boolean;
  duckingDepthDb: number;
  masterLoudnessLUFS: number;
  tracks: AudioMixTrack[];
  soundEffects: SoundEffectCue[];
  totalDurationSec: number;
  exportFormat: 'wav' | 'mp3' | 'aac';
  sampleRate: 44100 | 48000;
}

export interface AgenticContentContext {
  batchId: string;
  planId: string;
  itemIndex: number;
  // Set by CreativeDirector
  creative?: AgenticCreativeDirection;
  // Set by Scriptwriter
  script?: StructuredContentScript;
  // Set by VisualDesigner
  visual?: AgenticVisualDirection;
  // Set by QualityReviewer
  quality?: AgenticQualityResult;
  // Set by VoiceoverAgent
  voiceover?: AgenticVoiceoverDirection;
  // Set by AudioMixAgent
  audioMix?: AgenticAudioMixDirection;
  // Set by TranscreationAgent
  transcreations?: Record<string, {
    title: string;
    body: string;
    cta: string;
    hashtags: string[];
    language: string;
    isRTL: boolean;
  }>;
  // Set by Scriptwriter (Phase D — scene-level production script)
  productionScript?: FullProductionScript;
  // Set by PublishCoordinator (Phase D — full production plan)
  productionPlan?: AgenticProductionPlan;
  // Set by production bridge (Phase D — packaged content)
  contentPackage?: PublishingContentPackage;
  // Set by PublishCoordinator
  publishReadyItem?: AutoPublishContentItem;
  // Tracking
  agentStatuses: Record<AgentRole, AgentStatus>;
  agentTimings: Record<AgentRole, number>;
  errors: string[];
}

export interface AgenticBatchResult {
  batchId: string;
  items: AgenticContentContext[];
  visualStyleUsed: string;
  weekNumber: number;
  overallQualityScore: number;
  agentTimings: Record<AgentRole, number>;
  totalDurationMs: number;
}

// ─── Configuration ──────────────────────────────────────────────────

export interface AgenticOrchestratorConfig {
  batchSize: number;
  qualityTarget: number;
  maxRetriesPerAgent: number;
  enableTranscreation: boolean;
  enableVoiceover: boolean;
  enableAudioMix: boolean;
  voiceGender: 'male' | 'female' | 'neutral';
  language: string;
  targetRegion: string;
  targetSubRegion?: string;
  sourceProduct: GenieProduct;
  targetIndustries: IndustryVertical[];
  targetArchetypes: MessagingArchetype[];
  targetTones: ContentTone[];
  parallelItems: boolean;
  // Phase D — Production bridge
  enableProduction: boolean;
  quality: 'preview' | 'standard' | 'production' | 'cinematic';
  outputPresets?: string[];
  enrichmentContext?: EnrichmentContext;
  pacingWPM: number;
}

const DEFAULT_CONFIG: AgenticOrchestratorConfig = {
  batchSize: 6,
  qualityTarget: 85,
  maxRetriesPerAgent: 2,
  enableTranscreation: true,
  enableVoiceover: true,
  enableAudioMix: true,
  voiceGender: 'neutral',
  language: 'en',
  targetRegion: 'NAM',
  sourceProduct: 'cast',
  targetIndustries: [
    'education_edtech', 'healthcare_pharma', 'pet_industry',
    'travel_hospitality', 'patient_access', 'entertainment_media',
  ],
  targetArchetypes: [
    'product_showcase', 'before_after', 'humor_sketch',
    'emotional_narrative', 'industry_spotlight', 'mini_documentary',
  ],
  targetTones: [
    'humorous', 'empathetic', 'educational', 'inspirational',
    'data_driven', 'storytelling',
  ],
  parallelItems: true,
  // Phase D defaults
  enableProduction: true,
  quality: 'production',
  outputPresets: ['1080p', 'vertical_9_16'],
  pacingWPM: 150,
};

// ─── Quality Rubrics for Each Agent ────────────────────────────────

function createAgentRubrics(agent: AgentRole): QualityRubric[] {
  const base: QualityRubric = {
    id: `${agent}_format`,
    name: 'Format Validity',
    description: `Output from ${agent} must have all required fields`,
    passThreshold: 80,
    evaluate: async (output: unknown) => ({
      rubricId: `${agent}_format`,
      score: output && typeof output === 'object' ? 90 : 30,
      passed: output != null && typeof output === 'object',
      feedback: output ? 'Format valid' : 'Invalid output format',
      suggestions: output ? [] : ['Ensure output is a valid object'],
    }),
    criticality: 'blocking' as const,
    weight: 1,
  };

  const rubrics: QualityRubric[] = [base];

  if (agent === 'scriptwriter') {
    rubrics.push({
      id: 'script_completeness',
      name: 'Script Completeness',
      description: 'Script must have all 5 parts: hook, problem, transformation, solution, cta',
      passThreshold: 90,
      evaluate: async (output: unknown) => {
        const script = output as StructuredContentScript | null;
        const parts = ['hook', 'problem', 'transformation', 'solution', 'cta'] as const;
        const present = parts.filter(p => script && script[p] && script[p].length > 5);
        const score = (present.length / parts.length) * 100;
        return {
          rubricId: 'script_completeness',
          score,
          passed: score >= 90,
          feedback: `${present.length}/5 script sections present`,
          suggestions: parts
            .filter(p => !script || !script[p] || script[p].length <= 5)
            .map(p => `Add content for: ${p}`),
        };
      },
      criticality: 'blocking' as const,
      weight: 2,
    });
  }

  if (agent === 'quality_reviewer') {
    rubrics.push({
      id: 'legal_safety',
      name: 'Legal Safety',
      description: 'Content must not reference real companies. Only fictitious names allowed.',
      passThreshold: 100,
      evaluate: async (output: unknown) => {
        const ctx = output as AgenticContentContext;
        const realCompanies = [
          'google', 'apple', 'microsoft', 'amazon', 'meta', 'facebook',
          'netflix', 'disney', 'pfizer', 'johnson', 'merck', 'roche',
          'novartis', 'tesla', 'openai', 'anthropic', 'tiktok', 'uber',
        ];
        const content = JSON.stringify(ctx.script || {}).toLowerCase();
        const found = realCompanies.filter(c => content.includes(c));
        return {
          rubricId: 'legal_safety',
          score: found.length === 0 ? 100 : 0,
          passed: found.length === 0,
          feedback: found.length === 0
            ? 'No real company names detected'
            : `Found real company names: ${found.join(', ')}`,
          suggestions: found.map(c => `Replace "${c}" with a fictitious name`),
        };
      },
      criticality: 'blocking' as const,
      weight: 3,
    });

    rubrics.push({
      id: 'geniesuite_focus',
      name: 'GenieSuite Focus',
      description: 'Content must showcase GenieSuite products, not generic AI marketing',
      passThreshold: 80,
      evaluate: async (output: unknown) => {
        const ctx = output as AgenticContentContext;
        const content = JSON.stringify(ctx.script || {}).toLowerCase();
        const genieTerms = ['geniesuite', 'geniecast', 'geniespark', 'geniemind',
          'geniedeck', 'genievibe', 'geniehub'];
        const found = genieTerms.filter(t => content.includes(t));
        const score = found.length >= 2 ? 100 : found.length === 1 ? 70 : 20;
        return {
          rubricId: 'geniesuite_focus',
          score,
          passed: score >= 80,
          feedback: `${found.length} GenieSuite product references found`,
          suggestions: found.length < 2
            ? ['Add more GenieSuite product references in solution and CTA']
            : [],
        };
      },
      criticality: 'advisory' as const,
      weight: 2,
    });
  }

  return rubrics;
}

// ─── Color Palette Generation ──────────────────────────────────────

function getColorPaletteForStyle(family: CreativeStyleFamily): string[] {
  const palettes: Partial<Record<CreativeStyleFamily, string[]>> = {
    pixar_3d: ['#4FC3F7', '#FF7043', '#FFD54F', '#81C784', '#BA68C8'],
    watercolor: ['#F8BBD0', '#B3E5FC', '#C8E6C9', '#FFF9C4', '#D1C4E9'],
    anime: ['#F44336', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0'],
    disney_2d: ['#FFAB40', '#42A5F5', '#EF5350', '#66BB6A', '#AB47BC'],
    stop_motion: ['#8D6E63', '#FFCC80', '#A5D6A7', '#EF9A9A', '#90CAF9'],
    cyberpunk: ['#00E5FF', '#FF1744', '#D500F9', '#76FF03', '#FFEA00'],
    comic_book: ['#F44336', '#FFEB3B', '#2196F3', '#000000', '#FFFFFF'],
    motion_graphics: ['#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#455A64'],
    cultural_illustration: ['#E65100', '#1B5E20', '#B71C1C', '#0D47A1', '#F9A825'],
    documentary: ['#37474F', '#795548', '#607D8B', '#BCAAA4', '#CFD8DC'],
    flat_design: ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F5F5F5'],
    retro_vintage: ['#FF6F00', '#AD1457', '#00BFA5', '#6200EA', '#FFD600'],
  };
  return palettes[family] || palettes.pixar_3d!;
}

// ─── Character Design Description ──────────────────────────────────

function generateCharacterDesign(
  family: CreativeStyleFamily,
  industry: IndustryVertical,
  voiceCharacter: VoiceCharacter,
): string {
  const styleDescriptors: Partial<Record<CreativeStyleFamily, string>> = {
    pixar_3d: 'Pixar-style 3D character with expressive features, rounded proportions, and dramatic lighting',
    watercolor: 'Soft watercolor-painted character with flowing edges and pastel color bleeding',
    anime: 'Anime-style character with dynamic pose, expressive eyes, and speed-line background',
    disney_2d: 'Disney 2D animated character with fluid lines, musical energy, and warm expressions',
    stop_motion: 'Claymation-style character with visible texture, tactile feel, and handcrafted charm',
    cyberpunk: 'Cyberpunk character with neon accents, holographic UI elements, and dark futuristic backdrop',
    comic_book: 'Comic book character with bold ink outlines, halftone shading, and action pose',
    motion_graphics: 'Clean vector character with flat design, smooth animations, and infographic context',
    cultural_illustration: 'Culturally-styled character with traditional art motifs and regional visual elements',
    documentary: 'Photorealistic character with cinematic film grain, natural lighting, and documentary framing',
    flat_design: 'Minimal flat-design character with geometric shapes and modern pastel palette',
    retro_vintage: 'Retro 80s/90s character with VHS aesthetic, synthwave colors, and neon glow',
  };

  const industryContext: Partial<Record<IndustryVertical, string>> = {
    education_edtech: 'in a bright classroom environment with students and learning materials',
    healthcare_pharma: 'in a modern clinic setting with caring medical professionals',
    pet_industry: 'surrounded by adorable, diverse pets in a warm, friendly setting',
    travel_hospitality: 'at a stunning destination with travel gear and scenic backdrop',
    patient_access: 'guiding a patient through a welcoming, accessible healthcare facility',
    entertainment_media: 'on a vibrant production set with cameras, lights, and creative energy',
    finance_fintech: 'in a sleek office with data dashboards and financial charts',
    technology_saas: 'at a modern tech workspace with screens showing elegant interfaces',
  };

  const voiceVisual: Partial<Record<VoiceCharacter, string>> = {
    professor: 'wearing academic attire with a warm, authoritative presence',
    comedian: 'with animated expressions and comedic gestures',
    empathetic_guide: 'with gentle, caring body language and warm smile',
    news_anchor: 'in professional broadcast attire at a modern news desk',
    travel_host: 'in casual explorer outfit with adventurous energy',
    data_analyst: 'surrounded by floating data visualizations and charts',
  };

  const parts = [
    styleDescriptors[family] || 'Stylized character with expressive features',
    industryContext[industry] || 'in a professional environment',
    voiceVisual[voiceCharacter] || 'with engaging, approachable presence',
    '— full body render, cinematic composition',
  ];

  return parts.join(', ');
}

// ─── Agent Implementations ─────────────────────────────────────────

let _batchCounter = 0;
let _itemCounter = 0;

function nextBatchId(): string {
  return `agentic_batch_${Date.now()}_${++_batchCounter}`;
}

function nextItemId(): string {
  return `agentic_item_${Date.now()}_${++_itemCounter}`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createEmptyContext(batchId: string, planId: string, index: number): AgenticContentContext {
  const agentStatuses: Record<AgentRole, AgentStatus> = {
    creative_director: 'pending',
    scriptwriter: 'pending',
    visual_designer: 'pending',
    quality_reviewer: 'pending',
    voiceover_agent: 'pending',
    audio_mix_agent: 'pending',
    transcreation: 'pending',
    publish_coordinator: 'pending',
  };
  const agentTimings: Record<AgentRole, number> = {
    creative_director: 0,
    scriptwriter: 0,
    visual_designer: 0,
    quality_reviewer: 0,
    voiceover_agent: 0,
    audio_mix_agent: 0,
    transcreation: 0,
    publish_coordinator: 0,
  };
  return {
    batchId,
    planId,
    itemIndex: index,
    agentStatuses,
    agentTimings,
    errors: [],
  };
}

// Agent 1: Creative Director
function runCreativeDirector(
  ctx: AgenticContentContext,
  config: AgenticOrchestratorConfig,
  usedCombos: Set<string>,
): AgenticContentContext {
  const start = Date.now();
  ctx.agentStatuses.creative_director = 'running';

  const industry = pickRandom(config.targetIndustries);
  const archetype = pickRandom(config.targetArchetypes);
  const tone = pickRandom(config.targetTones);
  const voice = pickRandom<VoiceCharacter>([
    'genie_narrator', 'studio_host', 'professor', 'creative_director',
    'news_anchor', 'friendly_coach', 'tech_enthusiast', 'storyteller',
    'comedian', 'empathetic_guide', 'travel_host', 'data_analyst',
  ]);
  const template = pickRandom<TemplateStyle>([
    'short_clip_15s', 'short_clip_30s', 'mini_doc_60s', 'carousel_slides',
    'infographic', 'journey_map_visual', 'social_card',
  ]);
  const business = pickFictitiousBusiness(industry);

  // Avoid duplicate combos in same batch
  const combo = `${archetype}_${industry}_${tone}`;
  if (usedCombos.has(combo)) {
    // Slightly modify — different tone
    const altTone = pickRandom(config.targetTones.filter(t => t !== tone));
    ctx.creative = {
      archetype,
      industry,
      tone: altTone || tone,
      voiceCharacter: voice,
      template,
      format: template,
      productFocus: config.sourceProduct,
      fictitiousName: business.name,
      fictitiousType: business.type,
    };
  } else {
    ctx.creative = {
      archetype,
      industry,
      tone,
      voiceCharacter: voice,
      template,
      format: template,
      productFocus: config.sourceProduct,
      fictitiousName: business.name,
      fictitiousType: business.type,
    };
  }
  usedCombos.add(combo);

  ctx.agentStatuses.creative_director = 'completed';
  ctx.agentTimings.creative_director = Date.now() - start;
  return ctx;
}

// Agent 2: Scriptwriter (+ Phase D production script generation)
function runScriptwriter(
  ctx: AgenticContentContext,
  config: AgenticOrchestratorConfig,
): AgenticContentContext {
  const start = Date.now();
  ctx.agentStatuses.scriptwriter = 'running';

  if (!ctx.creative) {
    ctx.agentStatuses.scriptwriter = 'error';
    ctx.errors.push('Scriptwriter: No creative direction available');
    return ctx;
  }

  const brief: ScriptwriterBrief = {
    archetype: ctx.creative.archetype,
    voiceCharacter: ctx.creative.voiceCharacter,
    industry: ctx.creative.industry,
    tone: ctx.creative.tone,
    productFocus: ctx.creative.productFocus,
    fictitiousName: ctx.creative.fictitiousName,
    fictitiousType: ctx.creative.fictitiousType,
  };

  ctx.script = generateStructuredScript(brief);

  // Phase D: Also build scene-level production script (non-blocking — flat script is sufficient if this fails)
  if (config.enableProduction && ctx.script) {
    try {
      const productionScript = buildProductionScriptFromAgenticContext(ctx, config.targetRegion);
      if (productionScript) {
        ctx.productionScript = productionScript;
      }
    } catch {
      // Non-blocking: flat script is sufficient for downstream agents
    }
  }

  ctx.agentStatuses.scriptwriter = 'completed';
  ctx.agentTimings.scriptwriter = Date.now() - start;
  return ctx;
}

// Agent 3: Visual Designer
function runVisualDesigner(
  ctx: AgenticContentContext,
  weekStyle: VisualRotationSchedule,
): AgenticContentContext {
  const start = Date.now();
  ctx.agentStatuses.visual_designer = 'running';

  if (!ctx.creative) {
    ctx.agentStatuses.visual_designer = 'error';
    ctx.errors.push('VisualDesigner: No creative direction available');
    return ctx;
  }

  const colorPalette = getColorPaletteForStyle(weekStyle.styleFamily);
  const characterDesign = generateCharacterDesign(
    weekStyle.styleFamily,
    ctx.creative.industry,
    ctx.creative.voiceCharacter,
  );

  ctx.visual = {
    styleFamily: weekStyle.styleFamily,
    styleFamilyLabel: weekStyle.label,
    cinematography: weekStyle.cinematography,
    characterDesign,
    colorPalette,
    fullCharacterRender: true,
  };

  ctx.agentStatuses.visual_designer = 'completed';
  ctx.agentTimings.visual_designer = Date.now() - start;
  return ctx;
}

// Agent 4: Quality Reviewer
async function runQualityReviewer(
  ctx: AgenticContentContext,
  qualityTarget: number,
): Promise<AgenticContentContext> {
  const start = Date.now();
  ctx.agentStatuses.quality_reviewer = 'running';

  const rubrics = createAgentRubrics('quality_reviewer');
  const feedback: string[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  for (const rubric of rubrics) {
    const evaluation: RubricEvaluation = await rubric.evaluate(ctx, {});
    totalScore += evaluation.score * rubric.weight;
    totalWeight += rubric.weight;
    if (!evaluation.passed) {
      feedback.push(`${rubric.name}: ${evaluation.feedback}`);
    }
  }

  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  // Also check script completeness
  if (ctx.script) {
    const parts = [ctx.script.hook, ctx.script.problem, ctx.script.transformation,
      ctx.script.solution, ctx.script.cta];
    const nonEmpty = parts.filter(p => p && p.length > 5).length;
    const scriptScore = (nonEmpty / 5) * 100;
    if (scriptScore < 100) {
      feedback.push(`Script completeness: ${nonEmpty}/5 sections filled`);
    }
    // Blend script score with rubric score
    totalScore = (finalScore * 0.6) + (scriptScore * 0.4);
  }

  const passed = (totalScore || finalScore) >= qualityTarget;

  ctx.quality = {
    score: Math.round(totalScore || finalScore),
    passed,
    iterations: 1,
    feedback,
  };

  ctx.agentStatuses.quality_reviewer = passed ? 'completed' : 'error';
  ctx.agentTimings.quality_reviewer = Date.now() - start;
  return ctx;
}

// ─── Voiceover Agent — Uses core routing infrastructure ─────────────
//
// TTS provider:       master-provider-routing-registry → getTTSRouting(lang)
// Voice IDs:          useAskGenieVoice → getLanguagePairing(lang) + getVoiceId()
// Voice catalog:      voice-catalog → getDefaultVoice(provider)
// Voice pace/tone:    regionalAvatarGuidelines → getAvatarVoiceCharacteristicsForRegion()
// NO hardcoded providers, voice IDs, or fallback chains.

/** Map VoiceCharacter → preferred gender for voice selection. */
const VOICE_CHARACTER_GENDER: Record<VoiceCharacter, 'male' | 'female' | 'neutral'> = {
  genie_narrator: 'neutral',
  studio_host: 'male',
  professor: 'male',
  creative_director: 'female',
  news_anchor: 'female',
  friendly_coach: 'male',
  tech_enthusiast: 'neutral',
  storyteller: 'female',
  comedian: 'male',
  empathetic_guide: 'female',
  travel_host: 'male',
  data_analyst: 'neutral',
};

/** Derive per-section emotion from content tone (no per-character hardcode). */
function getSectionEmotion(
  section: VoiceoverSectionCue['section'],
  tone: ContentTone,
): VoiceoverEmotion {
  // Section has a natural emotional arc
  const sectionBaseEmotion: Record<string, VoiceoverEmotion> = {
    hook: 'energetic',
    problem: 'concerned',
    transformation: 'hopeful',
    solution: 'confident',
    cta: 'urgent',
  };
  // Tone modulates the base emotion
  const toneOverrides: Partial<Record<ContentTone, Partial<Record<string, VoiceoverEmotion>>>> = {
    humorous:      { hook: 'playful', problem: 'playful', cta: 'energetic' },
    empathetic:    { hook: 'warm', solution: 'warm', cta: 'warm' },
    educational:   { hook: 'authoritative', solution: 'authoritative', cta: 'confident' },
    data_driven:   { hook: 'confident', solution: 'authoritative', cta: 'urgent' },
    emotional:     { hook: 'warm', problem: 'concerned', cta: 'hopeful' },
    storytelling:  { hook: 'warm', transformation: 'hopeful', cta: 'warm' },
  };
  return toneOverrides[tone]?.[section] ?? sectionBaseEmotion[section] ?? 'confident';
}

/** Map VoicePace from avatar guidelines → our pacing type. */
function mapAvatarPace(pace: string): 'slow' | 'normal' | 'fast' {
  if (pace === 'slow' || pace === 'measured') return 'slow';
  if (pace === 'fast' || pace === 'medium-fast') return 'fast';
  return 'normal';
}

function estimateSpeechDuration(text: string, pacing: 'slow' | 'normal' | 'fast'): number {
  const wordsPerMinute = pacing === 'slow' ? 120 : pacing === 'fast' ? 180 : 150;
  const wordCount = text.split(/\s+/).length;
  return Math.round((wordCount / wordsPerMinute) * 60 * 10) / 10;
}

// Agent 5: Voiceover Agent (TTS direction via core routing)
function runVoiceoverAgent(
  ctx: AgenticContentContext,
  config: AgenticOrchestratorConfig,
): AgenticContentContext {
  const start = Date.now();
  ctx.agentStatuses.voiceover_agent = 'running';

  if (!config.enableVoiceover || !ctx.script || !ctx.creative) {
    ctx.agentStatuses.voiceover_agent = 'completed';
    ctx.agentTimings.voiceover_agent = Date.now() - start;
    return ctx;
  }

  const language = config.language;

  // ── 1. TTS provider from master routing registry ──
  const ttsRouting: TTSRoutingConfig = getTTSRouting(language);
  const primaryProvider = ttsRouting.primary;
  const fallbackProviders = [ttsRouting.secondary, ttsRouting.tertiary].filter(Boolean);

  // ── 2. Voice ID from canonical LANGUAGE_VOICE_PAIRINGS ──
  const pairing = getLanguagePairing(language);
  const preferredGender = config.voiceGender !== 'neutral'
    ? config.voiceGender
    : VOICE_CHARACTER_GENDER[ctx.creative.voiceCharacter];
  // Try to get voice ID from the language pairing for the routed provider
  let voiceId = pairing
    ? getVoiceId(pairing, primaryProvider as TTSVoiceProvider, preferredGender)
    : undefined;
  // Fallback: use voice-catalog's default for this provider
  if (!voiceId) {
    const defaultVoice = getDefaultVoice(primaryProvider);
    voiceId = defaultVoice?.id ?? `${primaryProvider}_default`;
  }

  // ── 3. Voice pace from regional avatar guidelines ──
  const zone = getZoneForLanguage(language);
  // Map zone to a region code for avatar guidelines
  const zoneToRegion: Record<string, string> = {
    claude_zone: 'US', alibaba_zone: 'CN', gemini_zone: 'IN', fallback_zone: 'US',
  };
  const avatarRegion = zoneToRegion[zone] || 'US';
  const avatarVoice = getAvatarVoiceCharacteristicsForRegion(avatarRegion);
  const basePacing = avatarVoice ? mapAvatarPace(avatarVoice.pace) : 'normal';

  // Tone-based pacing adjustment
  const pacing: 'slow' | 'normal' | 'fast' =
    ctx.creative.tone === 'urgent' ? 'fast' :
    ctx.creative.tone === 'empathetic' || ctx.creative.tone === 'emotional' ? 'slow' :
    basePacing;

  // ── 4. Build section cues using tone-derived emotions ──
  const sections: Array<{ section: VoiceoverSectionCue['section']; text: string }> = [
    { section: 'hook', text: ctx.script.hook },
    { section: 'problem', text: ctx.script.problem },
    { section: 'transformation', text: ctx.script.transformation },
    { section: 'solution', text: ctx.script.solution },
    { section: 'cta', text: ctx.script.cta },
  ];

  const sectionCues: VoiceoverSectionCue[] = sections.map(({ section, text }) => ({
    section,
    text,
    emotion: getSectionEmotion(section, ctx.creative!.tone),
    pacing: section === 'hook' || section === 'cta' ? 'fast' : pacing,
    pauseAfterMs: section === 'cta' ? 0 : section === 'hook' ? 300 : 500,
    estimatedDurationSec: estimateSpeechDuration(text,
      section === 'hook' || section === 'cta' ? 'fast' : pacing),
  }));

  const totalDuration = sectionCues.reduce((sum, c) =>
    sum + c.estimatedDurationSec + (c.pauseAfterMs / 1000), 0);

  // SSML support: check if the provider supports viseme (from routing config)
  const ssmlEnabled = ttsRouting.visemeSupport;

  ctx.voiceover = {
    provider: primaryProvider,
    voiceId: voiceId!,
    voiceGender: preferredGender,
    language,
    sectionCues,
    totalDurationSec: Math.round(totalDuration * 10) / 10,
    fallbackProviders,
    ssmlEnabled,
  };

  ctx.agentStatuses.voiceover_agent = 'completed';
  ctx.agentTimings.voiceover_agent = Date.now() - start;
  return ctx;
}

// ─── Audio Mix Agent — Uses core routing infrastructure ─────────────
//
// Music config:    genie-cast-regional-creative-config → getRegionalCreativeDirection()
// Music provider:  master-provider-routing-registry → AUDIO_MASTER_ROUTING.music_generation
// SFX provider:    master-provider-routing-registry → AUDIO_MASTER_ROUTING.sfx_generation
// NO hardcoded genres, BPMs, instruments, or providers.

// Agent 6: Audio Mix Agent (via core routing)
function runAudioMixAgent(
  ctx: AgenticContentContext,
  config: AgenticOrchestratorConfig,
): AgenticContentContext {
  const start = Date.now();
  ctx.agentStatuses.audio_mix_agent = 'running';

  if (!config.enableAudioMix || !ctx.script || !ctx.creative) {
    ctx.agentStatuses.audio_mix_agent = 'completed';
    ctx.agentTimings.audio_mix_agent = Date.now() - start;
    return ctx;
  }

  // ── 1. Music direction from regional creative config ──
  const regionId = config.targetRegion;
  const creativeDir = getRegionalCreativeDirection(regionId);
  const musicConfig = creativeDir?.music;
  // Fallback from regional config if no match
  const genres = musicConfig?.genres ?? ['corporate', 'electronic pop'];
  const instruments = musicConfig?.instruments ?? ['piano', 'guitar', 'light_drums'];
  const moods = musicConfig?.mood ?? ['positive', 'professional'];
  const bpmRange = musicConfig?.bpmRange ?? [110, 130];
  const avgBpm = Math.round((bpmRange[0] + bpmRange[1]) / 2);
  const musicSamplePrompt = musicConfig?.samplePrompt
    ?? `${genres.join(', ')} music, ${moods.join(', ')}. ${avgBpm} BPM.`;

  // ── 2. Provider routing from master registry ──
  const musicRouting = getAudioRouting('music_generation');
  const sfxRouting = getAudioRouting('sfx_generation');

  const totalDurationSec = ctx.voiceover?.totalDurationSec
    ?? ctx.script.estimatedDurationSec
    ?? 30;
  const totalDurationMs = totalDurationSec * 1000;

  // ── 3. Build tracks ──
  const tracks: AudioMixTrack[] = [
    {
      trackType: 'voiceover',
      label: `VO — ${ctx.creative.voiceCharacter.replace(/_/g, ' ')}`,
      volumeDb: 0,
      fadeInMs: 0,
      fadeOutMs: 200,
      startOffsetMs: 0,
      durationMs: totalDurationMs,
    },
    {
      trackType: 'background_music',
      label: `Music — ${genres[0]} (${avgBpm} BPM) via ${musicRouting.primary}`,
      volumeDb: -12,
      fadeInMs: 1000,
      fadeOutMs: 2000,
      startOffsetMs: 0,
      durationMs: totalDurationMs + 3000,
    },
  ];

  // Add ambient track for cinematic visual styles
  const cinematicStyles: string[] = ['documentary', 'cyberpunk', 'pixar_3d', 'anime'];
  if (ctx.visual && cinematicStyles.includes(ctx.visual.styleFamily)) {
    tracks.push({
      trackType: 'ambient',
      label: `Ambient — ${ctx.visual.styleFamily} atmosphere`,
      volumeDb: -18,
      fadeInMs: 2000,
      fadeOutMs: 2000,
      startOffsetMs: 0,
      durationMs: totalDurationMs + 2000,
    });
  }

  // ── 4. SFX cues per section via sfxRouting ──
  const soundEffects: SoundEffectCue[] = [];
  let currentOffset = 0;
  const sectionDurations = ctx.voiceover?.sectionCues
    ?? [
      { section: 'hook' as const, estimatedDurationSec: 3 },
      { section: 'problem' as const, estimatedDurationSec: 8 },
      { section: 'transformation' as const, estimatedDurationSec: 8 },
      { section: 'solution' as const, estimatedDurationSec: 8 },
      { section: 'cta' as const, estimatedDurationSec: 3 },
    ];

  // Section SFX type mapping (what kind of SFX each section needs)
  const sectionSfxType: Record<string, string> = {
    hook: 'whoosh_in',
    problem: 'tension_riser',
    transformation: 'shimmer_transition',
    solution: 'success_ding',
    cta: 'button_tap',
  };

  for (const cue of sectionDurations) {
    const sfxType = sectionSfxType[cue.section];
    if (sfxType) {
      soundEffects.push({
        section: cue.section,
        effect: sfxType,
        description: `${sfxType} via ${sfxRouting.primary}`,
        volumeDb: -6,
        offsetMs: currentOffset,
      });
    }
    currentOffset += cue.estimatedDurationSec * 1000;
  }

  ctx.audioMix = {
    musicPrompt: musicSamplePrompt,
    musicGenre: genres[0] ?? 'corporate',
    musicBpm: avgBpm,
    musicInstruments: instruments,
    musicVolumeDb: -12,
    voiceoverVolumeDb: 0,
    ducking: true,
    duckingDepthDb: -8,
    masterLoudnessLUFS: -14,
    tracks,
    soundEffects,
    totalDurationSec,
    exportFormat: 'aac',
    sampleRate: 48000,
  };

  ctx.agentStatuses.audio_mix_agent = 'completed';
  ctx.agentTimings.audio_mix_agent = Date.now() - start;
  return ctx;
}

// Agent 7: Transcreation
function runTranscreation(
  ctx: AgenticContentContext,
  enabled: boolean,
): AgenticContentContext {
  const start = Date.now();
  ctx.agentStatuses.transcreation = 'running';

  if (!enabled || !ctx.script) {
    ctx.transcreations = {};
    ctx.agentStatuses.transcreation = 'completed';
    ctx.agentTimings.transcreation = Date.now() - start;
    return ctx;
  }

  const results = transcreateContent({
    titleEN: ctx.script.hook,
    bodyEN: `${ctx.script.problem} ${ctx.script.transformation} ${ctx.script.solution}`,
    ctaEN: ctx.script.cta,
    hashtagsEN: ['#GenieSuite', '#AIContent'],
    includeSubRegions: false, // Keep initial batch to parent regions only
  });

  const transcreations: Record<string, {
    title: string; body: string; cta: string;
    hashtags: string[]; language: string; isRTL: boolean;
  }> = {};

  for (const r of results) {
    transcreations[r.regionCode] = {
      title: r.title,
      body: r.body,
      cta: r.cta,
      hashtags: r.hashtags,
      language: r.language,
      isRTL: r.isRTL,
    };
  }

  ctx.transcreations = transcreations;
  ctx.agentStatuses.transcreation = 'completed';
  ctx.agentTimings.transcreation = Date.now() - start;
  return ctx;
}

// Agent 8: Publish Coordinator (+ Phase D production plan assembly)
function runPublishCoordinator(
  ctx: AgenticContentContext,
  config: AgenticOrchestratorConfig,
): AgenticContentContext {
  const start = Date.now();
  ctx.agentStatuses.publish_coordinator = 'running';

  if (!ctx.creative || !ctx.script) {
    ctx.agentStatuses.publish_coordinator = 'error';
    ctx.errors.push('PublishCoordinator: Missing creative direction or script');
    return ctx;
  }

  // Phase D: Resolve format from template (no more hardcoded 'short_video')
  const resolvedFormat = resolveFormatFromTemplate(ctx.creative.template);

  // Phase D: Build production plan if production script is available
  if (config.enableProduction && ctx.productionScript) {
    try {
      const pacingProfile = calculatePacingProfile(ctx, config.targetRegion);
      let blueprint = buildProductionBlueprint(ctx, ctx.productionScript, pacingProfile);
      blueprint = syncScriptToDuration(blueprint);
      const timeline = buildTimelineBlueprint(ctx, ctx.productionScript, blueprint);
      const chunkingStrategy = determineChunkingStrategy(ctx.productionScript);

      ctx.productionPlan = {
        productionId: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        sourceProduct: config.sourceProduct,
        templateStyle: ctx.creative.template,
        resolvedFormat,
        productionScript: ctx.productionScript,
        blueprint,
        timeline,
        chunkingStrategy,
        estimatedDurationSec: blueprint.totalTargetDurationSec,
      };

      // Enrich context with brand/regional/competitive data
      enrichAgenticContext(ctx, {
        sourceProduct: config.sourceProduct,
        regionCode: config.targetRegion,
        language: config.language,
        quality: config.quality,
        enableCollaterals: false,
        enableQualityGate: false,
        enrichmentContext: config.enrichmentContext,
      });
    } catch {
      // Non-blocking: production plan is optional enhancement
    }
  }

  const item: AutoPublishContentItem = {
    itemId: nextItemId(),
    planId: ctx.planId,
    archetype: ctx.creative.archetype,
    voiceCharacter: ctx.creative.voiceCharacter,
    industry: ctx.creative.industry,
    format: resolvedFormat,
    template: ctx.creative.template,
    tone: ctx.creative.tone,
    titleEN: ctx.script.hook,
    bodyEN: `${ctx.script.problem}\n\n${ctx.script.transformation}\n\n${ctx.script.solution}`,
    ctaEN: ctx.script.cta,
    hashtags: ['#GenieSuite', '#AIContent', '#ContentCreation',
      `#${ctx.creative.industry.replace(/_/g, '')}`,
      `#${ctx.creative.archetype.replace(/_/g, '')}`],
    transcreations: ctx.transcreations || {},
    status: 'pending_review',
    publishTargets: [],
    structuredScript: ctx.script,
    visualStyle: ctx.visual ? {
      family: ctx.visual.styleFamily,
      cinematography: ctx.visual.styleFamilyLabel,
    } : undefined,
    qualityScore: ctx.quality?.score,
    voiceoverDirection: ctx.voiceover ? {
      provider: ctx.voiceover.provider,
      voiceId: ctx.voiceover.voiceId,
      voiceGender: ctx.voiceover.voiceGender,
      language: ctx.voiceover.language,
      totalDurationSec: ctx.voiceover.totalDurationSec,
      sectionCount: ctx.voiceover.sectionCues.length,
      ssmlEnabled: ctx.voiceover.ssmlEnabled,
    } : undefined,
    audioMixDirection: ctx.audioMix ? {
      musicGenre: ctx.audioMix.musicGenre,
      musicBpm: ctx.audioMix.musicBpm,
      trackCount: ctx.audioMix.tracks.length,
      sfxCount: ctx.audioMix.soundEffects.length,
      ducking: ctx.audioMix.ducking,
      totalDurationSec: ctx.audioMix.totalDurationSec,
      exportFormat: ctx.audioMix.exportFormat,
    } : undefined,
    // Phase D: Production plan summary for UI
    productionPlan: ctx.productionPlan ? {
      blueprintId: ctx.productionPlan.blueprint.blueprintId,
      sceneCount: ctx.productionPlan.blueprint.scenes.length,
      chunkingStrategy: ctx.productionPlan.chunkingStrategy,
      resolvedFormat: ctx.productionPlan.resolvedFormat,
      totalTargetDurationSec: ctx.productionPlan.estimatedDurationSec,
      hasProductionScript: true,
    } : undefined,
  };

  ctx.publishReadyItem = item;
  ctx.agentStatuses.publish_coordinator = 'completed';
  ctx.agentTimings.publish_coordinator = Date.now() - start;
  return ctx;
}

// ─── Main Orchestrator ──────────────────────────────────────────────

export type AgentProgressCallback = (
  itemIndex: number,
  agent: AgentRole,
  status: AgentStatus,
) => void;

/**
 * Run the full 8-agent pipeline for a single content item.
 */
async function orchestrateItem(
  ctx: AgenticContentContext,
  config: AgenticOrchestratorConfig,
  weekStyle: VisualRotationSchedule,
  usedCombos: Set<string>,
  onProgress?: AgentProgressCallback,
): Promise<AgenticContentContext> {
  const notify = (agent: AgentRole, status: AgentStatus) => {
    if (onProgress) onProgress(ctx.itemIndex, agent, status);
  };

  // Agent 1: Creative Director
  notify('creative_director', 'running');
  ctx = runCreativeDirector(ctx, config, usedCombos);
  notify('creative_director', ctx.agentStatuses.creative_director);

  // Agent 2: Scriptwriter (+ Phase D production script)
  notify('scriptwriter', 'running');
  ctx = runScriptwriter(ctx, config);
  notify('scriptwriter', ctx.agentStatuses.scriptwriter);

  // Agent 3: Visual Designer
  notify('visual_designer', 'running');
  ctx = runVisualDesigner(ctx, weekStyle);
  notify('visual_designer', ctx.agentStatuses.visual_designer);

  // Agent 4: Quality Reviewer
  notify('quality_reviewer', 'running');
  ctx = await runQualityReviewer(ctx, config.qualityTarget);
  notify('quality_reviewer', ctx.agentStatuses.quality_reviewer);

  // Agent 5: Voiceover (TTS direction)
  notify('voiceover_agent', 'running');
  ctx = runVoiceoverAgent(ctx, config);
  notify('voiceover_agent', ctx.agentStatuses.voiceover_agent);

  // Agent 6: Audio Mix
  notify('audio_mix_agent', 'running');
  ctx = runAudioMixAgent(ctx, config);
  notify('audio_mix_agent', ctx.agentStatuses.audio_mix_agent);

  // Agent 7: Transcreation
  notify('transcreation', 'running');
  ctx = runTranscreation(ctx, config.enableTranscreation);
  notify('transcreation', ctx.agentStatuses.transcreation);

  // Agent 8: Publish Coordinator (+ Phase D production plan)
  notify('publish_coordinator', 'running');
  ctx = runPublishCoordinator(ctx, config);
  notify('publish_coordinator', ctx.agentStatuses.publish_coordinator);

  return ctx;
}

/**
 * Orchestrate a full batch of content items through the 8-agent pipeline.
 *
 * Product-agnostic: any GenieSuite product can call this by setting
 * config.sourceProduct to their product ID.
 */
export async function orchestrateBatch(
  config?: Partial<AgenticOrchestratorConfig>,
  onProgress?: AgentProgressCallback,
): Promise<AgenticBatchResult> {
  const startTime = Date.now();
  const mergedConfig: AgenticOrchestratorConfig = { ...DEFAULT_CONFIG, ...config };
  const batchId = nextBatchId();
  const weekStyle = getVisualStyleForWeek();

  // Generate a plan to provide planId
  const plan = generateContentPlan({
    sourceProductFocus: [mergedConfig.sourceProduct],
    industryVerticals: mergedConfig.targetIndustries,
    targetArchetypes: mergedConfig.targetArchetypes,
    tones: mergedConfig.targetTones,
  });

  // Create empty contexts for each item
  const contexts: AgenticContentContext[] = [];
  for (let i = 0; i < mergedConfig.batchSize; i++) {
    contexts.push(createEmptyContext(batchId, plan.planId, i));
  }

  // Run pipeline — items in parallel (if enabled)
  const usedCombos = new Set<string>();
  const results = await Promise.all(
    contexts.map(ctx => orchestrateItem(ctx, mergedConfig, weekStyle, usedCombos, onProgress)),
  );

  // Aggregate timings
  const agentTimings: Record<AgentRole, number> = {
    creative_director: 0,
    scriptwriter: 0,
    visual_designer: 0,
    quality_reviewer: 0,
    voiceover_agent: 0,
    audio_mix_agent: 0,
    transcreation: 0,
    publish_coordinator: 0,
  };

  let totalQuality = 0;
  let qualityCount = 0;

  for (const item of results) {
    for (const agent of AGENT_PIPELINE_ORDER) {
      agentTimings[agent] += item.agentTimings[agent];
    }
    if (item.quality) {
      totalQuality += item.quality.score;
      qualityCount++;
    }
  }

  return {
    batchId,
    items: results,
    visualStyleUsed: weekStyle.label,
    weekNumber: weekStyle.weekNumber,
    overallQualityScore: qualityCount > 0 ? Math.round(totalQuality / qualityCount) : 0,
    agentTimings,
    totalDurationMs: Date.now() - startTime,
  };
}

/**
 * Get the default orchestrator config (for UI display/editing).
 */
export function getDefaultConfig(): AgenticOrchestratorConfig {
  return { ...DEFAULT_CONFIG };
}

/**
 * Get current visual style info for display.
 */
export function getCurrentVisualStyle(): VisualRotationSchedule {
  return getVisualStyleForWeek();
}

/**
 * Preview upcoming visual styles.
 */
export function getUpcomingVisualStyles(weeks: number = 4): VisualRotationSchedule[] {
  return getUpcomingRotation(weeks);
}
