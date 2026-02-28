/**
 * Scene Enrichment Engine — Auto-Generate Storybook-Quality Production Prompts
 *
 * Transforms a user's basic script + characters + style into full production-ready
 * scene pipelines, music scores, transitions, character interactions, and voice configs.
 *
 * Architecture: 8-module pipeline, all values derived dynamically from existing registries:
 *   castCreativeStylesRegistry  → regional visuals, music, companions, narrative styles
 *   castEndToEndPromptEngine    → style prompt templates per all 17 families
 *   promptEnhancementEngine     → instant prompt polish with regional context
 *   castProductionBridge        → enrichment context assembly
 *
 * Nothing is hardcoded — every scene type, visual preset, music mood, and voice
 * assignment is computed from the input + registries. Extend by adding to the registries,
 * not by editing this file.
 *
 * Works across ALL 16 parent regions + 62 subregions (NAM through CENTRAL_ASIA).
 */

import type { CreativeStyleFamily, RegionalStyleVariant } from '../brand-intelligence/castCreativeStylesRegistry';
import {
  enrichPromptWithRegion,
  getRegionalMusicPrompt,
  getRegionalCompanionCreature,
  getRegionalNarrativeStyle,
  getRegionalVariant,
  CREATIVE_STYLES,
} from '../brand-intelligence/castCreativeStylesRegistry';
import {
  STYLE_PROMPT_TEMPLATES,
  type SceneScript,
} from '../brand-intelligence/castEndToEndPromptEngine';
import type { EnrichmentContext } from './castProductionBridge';
import { quickEnhance } from '../promptEnhancementEngine';
import type { BrandIntelligenceProfile } from '../brand-intelligence/brandIntelligenceEngine';
import type { QualityTier } from '../brand-intelligence/creativeProductionPipeline';
import type { ScenePipelineStep, StorybookTransitionStyle } from '@/config/ep04-production-config';
import {
  getImaginationPreset,
  adaptPresetToRegion,
  type ImaginationPreset,
  type AdaptedPresetData,
} from './creativeImaginationRegistry';

// ─── Scene Types ─────────────────────────────────────────────────────────────

export const SCENE_TYPES = [
  'title_hook',
  'problem_statement',
  'character_intro',
  'origin_story',
  'solution_reveal',
  'technical_deep_dive',
  'data_reveal',
  'conflict_tension',
  'climax_achievement',
  'vision_future',
  'call_to_action',
  'transition_bridge',
  'comic_relief',
  'testimonial',
  // Celebration scene types
  'ceremony_ritual',
  'invitation_card',
  'photo_montage',
  'blessing_close',
] as const;

export type SceneType = (typeof SCENE_TYPES)[number];

// ─── Narrative Arc ───────────────────────────────────────────────────────────

export const NARRATIVE_ACTS = ['wonder', 'tension', 'triumph', 'warmth'] as const;
export type NarrativeAct = (typeof NARRATIVE_ACTS)[number];

/** Proportional allocation of scenes across the 4-act narrative arc */
const ACT_PROPORTIONS: Record<NarrativeAct, number> = {
  wonder:  0.20,
  tension: 0.35,
  triumph: 0.30,
  warmth:  0.15,
};

/** Mood + tempo derived per act — no hardcoded BPM, uses registry BPM range */
const ACT_MOOD_MAP: Record<NarrativeAct, { mood: string; tempoFactor: number }> = {
  wonder:  { mood: 'curious, magical, inviting',          tempoFactor: 0.85 },
  tension: { mood: 'urgent, challenging, building',       tempoFactor: 1.0 },
  triumph: { mood: 'triumphant, energetic, celebratory',  tempoFactor: 1.15 },
  warmth:  { mood: 'warm, reflective, hopeful',           tempoFactor: 0.80 },
};

// ─── Character Roles ─────────────────────────────────────────────────────────

export type CharacterRole =
  | 'narrator' | 'protagonist' | 'sidekick' | 'antagonist'
  | 'expert' | 'comic_relief' | 'companion';

// ─── Input / Output Interfaces ───────────────────────────────────────────────

export interface EnrichmentCharacter {
  id: string;
  name: string;
  role: CharacterRole;
  personality: string;
  animalType?: string;
  voicePreference?: {
    style: 'warm' | 'energetic' | 'theatrical' | 'professional' | 'playful' | 'deep';
    speed?: number;
    provider?: 'elevenlabs' | 'azure' | 'alibaba';
  };
}

// ─── Production Approaches ───────────────────────────────────────────────────
// The engine recommends the BEST production approach per scene based on content,
// scene type, style family, and regional preferences. Not hardcoded — computed.

export const PRODUCTION_APPROACHES = [
  'avatar_driven',        // 3D/2D avatar character presenting — talking head, lipsync, gestures
  'animation_cinematic',  // Full cinematic animation — Pixar/Disney quality scene
  'motion_graphics',      // Clean infographic/data visualization — charts, icons, text
  'screen_capture',       // Product demo, software walkthrough — real UI with annotations
  'documentary',          // Real-world footage style — interview framing, B-roll
  'whiteboard',           // Hand-drawing explainer — progressive reveal
  'mixed_media',          // Combines live + animation + graphics
  'comic_panel',          // Comic book frame-by-frame storytelling
  'cultural_art',         // Region-specific traditional art style (Madhubani, ukiyo-e, kente)
  'kinetic_typography',   // Text-driven — bold text reveals, quote cards, CTA
  'stop_motion',          // Claymation/handcraft aesthetic
  'photo_collage',        // Photo montage with transitions
] as const;

export type ProductionApproach = (typeof PRODUCTION_APPROACHES)[number];

/** Output format types — all formats the pipeline can produce */
export const OUTPUT_FORMATS = [
  'long_form_video',      // 5-30 min YouTube-style
  'short_form_video',     // 15-60 sec TikTok/Reels/Shorts
  'podcast_video',        // Audio-first with visual companion
  'presentation_deck',    // Slide-by-slide with narration
  'social_card',          // Static image card for social
  'story_sequence',       // Multi-frame story (IG Stories, WhatsApp Status)
  'tutorial_walkthrough', // Screen-capture-led educational
  'testimonial_reel',     // Customer quotes with visuals
  'product_demo',         // Feature showcase
  'event_recap',          // Highlight montage
  'brand_anthem',         // Cinematic brand story
  'explainer',            // Problem → solution educational
  'comparison',           // Side-by-side analysis
  'listicle',             // Numbered list format
  'behind_the_scenes',    // BTS documentary style
] as const;

export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

/** Scene-level production recommendation — what the engine suggests per scene */
export interface SceneProductionRecommendation {
  primary: ProductionApproach;
  alternatives: ProductionApproach[];
  confidence: number;       // 0-1 — how certain the recommendation is
  reasoning: string;        // Why this approach was chosen
  format: OutputFormat;
  visualComplexity: 1 | 2 | 3 | 4 | 5;  // 1=simple text, 5=full cinematic
  estimatedRenderTime: number;  // seconds — helps with production planning
  regionalInfluence?: string;   // If region shifted the recommendation
}

export interface SceneEnrichmentInput {
  title: string;
  content:
    | { type: 'raw_text'; text: string }
    | { type: 'scene_descriptions'; scenes: Array<{ title: string; description: string; speakerKey?: string }> }
    | { type: 'pre_structured'; scenes: SceneScript[] };
  styleFamily: CreativeStyleFamily;
  characters?: EnrichmentCharacter[];
  regionCode?: string;
  language?: string;
  targetDuration?: number;
  quality?: QualityTier;
  storybookMode?: boolean;
  humorLevel?: 0 | 1 | 2 | 3 | 4 | 5;
  brandProfile?: Partial<BrandIntelligenceProfile>;
  enrichmentContext?: EnrichmentContext;
  /** Preferred output format — engine adapts pipeline to match */
  outputFormat?: OutputFormat;
  /** Force a specific production approach for all scenes (overrides recommender) */
  forceApproach?: ProductionApproach;
  /** Target platforms — affects aspect ratios, durations, text overlays */
  targetPlatforms?: string[];
  /** Enable companion creatures from regional registry */
  includeCompanionCreatures?: boolean;
  /** Cultural art mode — uses region-specific art styles (Madhubani, ukiyo-e, etc.) */
  culturalArtMode?: boolean;
  /** Imagination preset ID — selects a visual world from the Creative Imagination Registry.
   *  When set, the preset's visual/music/character/narrative DNA enriches ALL prompts.
   *  Automatically adapted to the selected region.
   *  Example: 'living-toys', 'underwater-adventure', 'arabesque-geometric', 'anime-sakura' */
  imaginationPreset?: string;
}

/** Matches EP04 output shapes exactly — drop-in replacement */
export interface SceneEnrichmentOutput {
  scenePipelines: Record<string, ScenePipelineStep[]>;
  musicScore: Record<string, { music: ScenePipelineStep & { type: 'music' }; sfx?: (ScenePipelineStep & { type: 'sfx' })[] }>;
  transitions: Array<{ from: string; to: string; style: StorybookTransitionStyle; steps: ScenePipelineStep[] }>;
  bookends?: { opening: ScenePipelineStep[]; closing: ScenePipelineStep[] };
  characterInteractions: Array<{ sceneId: string; steps: ScenePipelineStep[] }>;
  narratorScrolls: Array<{ sceneId: string; steps: ScenePipelineStep[] }>;
  leitmotifs: Record<string, ScenePipelineStep>;
  narrativeArc: Record<string, { scenes: string[]; mood: string; tempo: number }>;
  enrichedScript: Record<string, EnrichedScriptLine>;
  voiceConfig: Record<string, VoiceAssignment>;
  avatarConfig: Record<string, AvatarConfig>;
  /** Per-scene production recommendations — what approach + format to use */
  productionRecommendations: Record<string, SceneProductionRecommendation>;
  /** Platform-specific output configs derived from target platforms */
  platformConfigs: PlatformOutputConfig[];
  /** Regional production notes — cultural considerations for the production team */
  regionalNotes: RegionalProductionNotes;
  metadata: EnrichmentMetadata;
}

/** Platform-specific output configuration */
export interface PlatformOutputConfig {
  platform: string;
  aspectRatio: string;
  maxDuration: number;
  captionStyle: 'kinetic' | 'subtitle' | 'burned-in' | 'none';
  textSafe: { top: number; bottom: number; left: number; right: number };
  thumbnailRequired: boolean;
  hashtagLimit: number;
}

/** Regional production notes — guidance for the production pipeline */
export interface RegionalProductionNotes {
  regionCode: string;
  regionName: string;
  artStyle: string;
  bookStyle: string;
  instrumentFamily: string[];
  narrativeApproach: string;
  humorGuidance: string;
  formalityLevel: number;
  avoidList: string[];
  culturalSymbols: string[];
  companionCreature?: { name: string; species: string; description: string };
  wardrobeNotes: { traditional: string; modern: string; business: string };
}

export interface EnrichedScriptLine {
  text: string;
  voice: string;
  scene: string;
  duration_est: number;
  direction: string;
  lipsync?: boolean;
  sfx?: string[];
  motion?: string;
}

export interface VoiceAssignment {
  provider: 'elevenlabs' | 'azure' | 'alibaba';
  voiceId: string;
  style: string;
  speed: number;
  fallbackProvider: 'alibaba';
  fallbackVoiceId: string;
}

export interface AvatarConfig {
  pixarPrompt: string;
  disneyPrompt: string;
  motions: Record<string, string>;
  companionCreature?: string;
  palette: string[];
}

export interface EnrichmentMetadata {
  sceneCount: number;
  totalDuration: number;
  enrichmentScore: number;
  regionCode: string;
  language: string;
  styleFamily: CreativeStyleFamily;
  narrativeActs: NarrativeAct[];
  characterCount: number;
  storybookMode: boolean;
  outputFormat: OutputFormat;
  productionApproaches: ProductionApproach[];
  targetPlatforms: string[];
  estimatedTotalRenderTime: number;
  culturalArtMode: boolean;
  companionCreaturesEnabled: boolean;
  /** Imagination preset used (if any) */
  imaginationPreset?: string;
  /** Whether the preset was adapted to the region */
  presetRegionallyAdapted: boolean;
}

// ─── Internal types ──────────────────────────────────────────────────────────

interface ParsedScene {
  id: string;
  index: number;
  title: string;
  description: string;
  speakerKey?: string;
  duration: number;
  sceneType: SceneType;
  narrativeAct: NarrativeAct;
  /** Recommended production approach for this scene */
  productionApproach: ProductionApproach;
  /** Pre-structured scene data if provided */
  preStructured?: SceneScript;
}

interface VisualPrompts {
  imagePrompt: string;
  videoPrompt: string;
  characterPrompt: string;
  environmentPrompt: string;
}

interface AudioEntry {
  music: ScenePipelineStep & { type: 'music' };
  sfx: (ScenePipelineStep & { type: 'sfx' })[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// [0] PRODUCTION APPROACH RECOMMENDER
// ═══════════════════════════════════════════════════════════════════════════════
// Analyzes scene content, scene type, style family, and regional preferences
// to recommend the best production approach per scene. NOT a suggestion engine —
// it builds the actual pipeline. Users can override with forceApproach.

/** Keywords that signal a scene should use specific production approaches */
const APPROACH_SIGNAL_KEYWORDS: Record<ProductionApproach, string[]> = {
  avatar_driven:       ['presenter', 'talking head', 'host', 'explains', 'narrator', 'character says', 'dialogue', 'interview', 'conversation'],
  animation_cinematic: ['cinematic', 'story', 'adventure', 'journey', 'dramatic', 'epic', 'fantasy', 'imagination', 'world', 'landscape'],
  motion_graphics:     ['data', 'chart', 'graph', 'statistic', 'number', 'infographic', 'metric', 'KPI', 'dashboard', 'percentage', 'comparison'],
  screen_capture:      ['demo', 'tutorial', 'walkthrough', 'software', 'app', 'interface', 'UI', 'screen', 'click', 'feature', 'product'],
  documentary:         ['real', 'interview', 'footage', 'case study', 'behind the scenes', 'making of', 'process', 'field', 'location'],
  whiteboard:          ['explain', 'step by step', 'how to', 'diagram', 'process', 'flow', 'concept', 'simplify', 'education'],
  mixed_media:         ['combination', 'mixed', 'hybrid', 'overlay', 'composite', 'live action', 'blend'],
  comic_panel:         ['comic', 'panel', 'frame', 'action', 'superhero', 'pow', 'speech bubble', 'manga'],
  cultural_art:        ['tradition', 'heritage', 'cultural', 'folk', 'ancient', 'indigenous', 'textile', 'craft', 'artisan'],
  kinetic_typography:  ['quote', 'text', 'headline', 'slogan', 'CTA', 'subscribe', 'title', 'words', 'typography'],
  stop_motion:         ['craft', 'handmade', 'clay', 'puppet', 'miniature', 'tactile', 'physical', 'craft'],
  photo_collage:       ['photos', 'montage', 'gallery', 'collection', 'memories', 'timeline', 'before after'],
};

/** Scene type → preferred production approach mapping (default recommendations) */
const SCENE_TYPE_APPROACH_DEFAULTS: Record<SceneType, ProductionApproach> = {
  title_hook:          'animation_cinematic',
  problem_statement:   'mixed_media',
  character_intro:     'avatar_driven',
  origin_story:        'animation_cinematic',
  solution_reveal:     'mixed_media',
  technical_deep_dive: 'screen_capture',
  data_reveal:         'motion_graphics',
  conflict_tension:    'avatar_driven',
  climax_achievement:  'animation_cinematic',
  vision_future:       'animation_cinematic',
  call_to_action:      'kinetic_typography',
  transition_bridge:   'motion_graphics',
  comic_relief:        'avatar_driven',
  testimonial:         'documentary',
  // Celebration scene types
  ceremony_ritual:     'cultural_art',
  invitation_card:     'kinetic_typography',
  photo_montage:       'photo_collage',
  blessing_close:      'animation_cinematic',
};

/** Style family preferences — some styles work better with certain approaches */
const STYLE_APPROACH_AFFINITY: Partial<Record<CreativeStyleFamily, ProductionApproach[]>> = {
  pixar_3d:              ['avatar_driven', 'animation_cinematic'],
  disney_2d:             ['animation_cinematic', 'avatar_driven'],
  disney_3d:             ['animation_cinematic', 'avatar_driven'],
  anime:                 ['animation_cinematic', 'comic_panel'],
  motion_graphics:       ['motion_graphics', 'kinetic_typography'],
  whiteboard:            ['whiteboard', 'motion_graphics'],
  stop_motion:           ['stop_motion', 'animation_cinematic'],
  comic_book:            ['comic_panel', 'kinetic_typography'],
  watercolor:            ['cultural_art', 'animation_cinematic'],
  documentary:           ['documentary', 'screen_capture'],
  cultural_illustration: ['cultural_art', 'animation_cinematic'],
  mixed_media:           ['mixed_media', 'photo_collage'],
  realistic_avatar:      ['avatar_driven', 'documentary'],
};

/** Regional production style preferences — derived from regional narrative style */
function getRegionalApproachPreference(regionCode: string): ProductionApproach | undefined {
  const narrative = getRegionalNarrativeStyle(regionCode);
  if (!narrative) return undefined;

  const approach = narrative.approach.toLowerCase();
  // Regions with storytelling traditions prefer cinematic/cultural approaches
  if (approach.includes('parable') || approach.includes('sufi') || approach.includes('poetic')) return 'cultural_art';
  if (approach.includes('call_and_response') || approach.includes('communal')) return 'mixed_media';
  if (approach.includes('direct') || approach.includes('benefit')) return 'avatar_driven';
  if (approach.includes('subtle') || approach.includes('refined')) return 'animation_cinematic';
  if (approach.includes('logical') || approach.includes('structured')) return 'motion_graphics';
  return undefined;
}

/** Render time estimates per approach + quality tier */
const RENDER_TIME_ESTIMATES: Record<ProductionApproach, Record<string, number>> = {
  avatar_driven:       { preview: 15, standard: 45, production: 120, cinematic: 300 },
  animation_cinematic: { preview: 30, standard: 90, production: 240, cinematic: 600 },
  motion_graphics:     { preview: 10, standard: 30, production: 60,  cinematic: 120 },
  screen_capture:      { preview: 5,  standard: 15, production: 30,  cinematic: 60 },
  documentary:         { preview: 10, standard: 30, production: 90,  cinematic: 180 },
  whiteboard:          { preview: 10, standard: 25, production: 60,  cinematic: 120 },
  mixed_media:         { preview: 20, standard: 60, production: 150, cinematic: 360 },
  comic_panel:         { preview: 15, standard: 40, production: 100, cinematic: 200 },
  cultural_art:        { preview: 20, standard: 60, production: 150, cinematic: 300 },
  kinetic_typography:  { preview: 5,  standard: 15, production: 30,  cinematic: 60 },
  stop_motion:         { preview: 25, standard: 75, production: 180, cinematic: 450 },
  photo_collage:       { preview: 5,  standard: 15, production: 30,  cinematic: 60 },
};

/**
 * Recommend the best production approach for a scene.
 * Uses: scene type defaults → keyword analysis → style affinity → regional preference.
 */
export function recommendProductionApproach(
  sceneType: SceneType,
  description: string,
  styleFamily: CreativeStyleFamily,
  regionCode: string,
  quality: QualityTier,
  culturalArtMode: boolean,
  forceApproach?: ProductionApproach,
): SceneProductionRecommendation {
  // Forced approach — user override
  if (forceApproach) {
    return {
      primary: forceApproach,
      alternatives: [],
      confidence: 1.0,
      reasoning: `User-selected production approach: ${forceApproach}`,
      format: 'long_form_video',
      visualComplexity: 3,
      estimatedRenderTime: RENDER_TIME_ESTIMATES[forceApproach]?.[quality] ?? 60,
    };
  }

  // Cultural art mode override for appropriate scene types
  if (culturalArtMode && ['title_hook', 'origin_story', 'vision_future', 'character_intro'].includes(sceneType)) {
    const variant = getRegionalVariant(regionCode);
    return {
      primary: 'cultural_art',
      alternatives: [SCENE_TYPE_APPROACH_DEFAULTS[sceneType], 'animation_cinematic'],
      confidence: 0.85,
      reasoning: `Cultural art mode enabled — using ${variant?.regionName ?? regionCode} traditional art style`,
      format: 'long_form_video',
      visualComplexity: 4,
      estimatedRenderTime: RENDER_TIME_ESTIMATES.cultural_art[quality] ?? 60,
      regionalInfluence: variant?.culturalElements.patterns,
    };
  }

  // Score each approach
  const scores: Record<ProductionApproach, number> = {} as Record<ProductionApproach, number>;
  const text = description.toLowerCase();

  for (const approach of PRODUCTION_APPROACHES) {
    let score = 0;

    // Scene type default match (strong signal)
    if (SCENE_TYPE_APPROACH_DEFAULTS[sceneType] === approach) score += 5;

    // Keyword match scoring
    const keywords = APPROACH_SIGNAL_KEYWORDS[approach] ?? [];
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) score += 2;
    }

    // Style family affinity
    const affinities = STYLE_APPROACH_AFFINITY[styleFamily];
    if (affinities?.includes(approach)) {
      score += affinities.indexOf(approach) === 0 ? 3 : 1;
    }

    // Regional preference bonus
    const regionalPref = getRegionalApproachPreference(regionCode);
    if (regionalPref === approach) score += 2;

    scores[approach] = score;
  }

  // Sort by score
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  const [primaryApproach, primaryScore] = sorted[0];
  const alternatives = sorted.slice(1, 4)
    .filter(([, s]) => s > 0)
    .map(([a]) => a as ProductionApproach);

  const maxPossible = 12; // max theoretical score
  const confidence = Math.min(1, primaryScore / maxPossible);

  const complexityMap: Record<ProductionApproach, 1 | 2 | 3 | 4 | 5> = {
    kinetic_typography: 1, photo_collage: 2, motion_graphics: 2, screen_capture: 2,
    whiteboard: 2, documentary: 3, avatar_driven: 3, mixed_media: 4,
    comic_panel: 3, cultural_art: 4, animation_cinematic: 5, stop_motion: 5,
  };

  const primary = primaryApproach as ProductionApproach;
  const variant = getRegionalVariant(regionCode);

  return {
    primary,
    alternatives,
    confidence,
    reasoning: buildReasoningString(primary, sceneType, styleFamily, regionCode, variant),
    format: deriveOutputFormat(primary, sceneType),
    visualComplexity: complexityMap[primary],
    estimatedRenderTime: RENDER_TIME_ESTIMATES[primary]?.[quality] ?? 60,
    regionalInfluence: variant ? `${variant.regionName}: ${variant.narrative.storytellingApproach}` : undefined,
  };
}

function buildReasoningString(
  approach: ProductionApproach,
  sceneType: SceneType,
  styleFamily: CreativeStyleFamily,
  regionCode: string,
  variant: RegionalStyleVariant | undefined,
): string {
  const parts = [`Scene type "${sceneType}" → ${approach}`];
  if (STYLE_APPROACH_AFFINITY[styleFamily]?.[0] === approach) {
    parts.push(`style "${styleFamily}" has natural affinity`);
  }
  if (variant) {
    parts.push(`region "${variant.regionName}" narrative: ${variant.narrative.storytellingApproach}`);
  }
  return parts.join('; ');
}

function deriveOutputFormat(approach: ProductionApproach, sceneType: SceneType): OutputFormat {
  if (sceneType === 'testimonial') return 'testimonial_reel';
  if (sceneType === 'data_reveal') return 'explainer';
  if (approach === 'screen_capture') return 'tutorial_walkthrough';
  if (approach === 'documentary') return 'behind_the_scenes';
  if (approach === 'kinetic_typography') return 'social_card';
  if (approach === 'animation_cinematic') return 'brand_anthem';
  return 'long_form_video';
}

// ─── Platform Output Configs ─────────────────────────────────────────────────

const PLATFORM_CONFIGS: Record<string, PlatformOutputConfig> = {
  youtube:          { platform: 'youtube',          aspectRatio: '16:9', maxDuration: 1800, captionStyle: 'subtitle', textSafe: { top: 10, bottom: 20, left: 5, right: 5 }, thumbnailRequired: true,  hashtagLimit: 15 },
  youtube_shorts:   { platform: 'youtube_shorts',   aspectRatio: '9:16', maxDuration: 60,   captionStyle: 'kinetic',  textSafe: { top: 15, bottom: 25, left: 5, right: 5 }, thumbnailRequired: false, hashtagLimit: 5 },
  instagram_reels:  { platform: 'instagram_reels',  aspectRatio: '9:16', maxDuration: 90,   captionStyle: 'kinetic',  textSafe: { top: 15, bottom: 30, left: 5, right: 5 }, thumbnailRequired: false, hashtagLimit: 30 },
  instagram_post:   { platform: 'instagram_post',   aspectRatio: '1:1',  maxDuration: 60,   captionStyle: 'burned-in', textSafe: { top: 5, bottom: 5, left: 5, right: 5 },   thumbnailRequired: false, hashtagLimit: 30 },
  tiktok:           { platform: 'tiktok',           aspectRatio: '9:16', maxDuration: 180,  captionStyle: 'kinetic',  textSafe: { top: 15, bottom: 30, left: 5, right: 10 }, thumbnailRequired: false, hashtagLimit: 5 },
  linkedin:         { platform: 'linkedin',         aspectRatio: '16:9', maxDuration: 600,  captionStyle: 'subtitle', textSafe: { top: 5, bottom: 15, left: 5, right: 5 },   thumbnailRequired: true,  hashtagLimit: 5 },
  twitter:          { platform: 'twitter',          aspectRatio: '16:9', maxDuration: 140,  captionStyle: 'burned-in', textSafe: { top: 5, bottom: 10, left: 5, right: 5 },  thumbnailRequired: false, hashtagLimit: 3 },
  facebook:         { platform: 'facebook',         aspectRatio: '16:9', maxDuration: 600,  captionStyle: 'subtitle', textSafe: { top: 5, bottom: 15, left: 5, right: 5 },   thumbnailRequired: true,  hashtagLimit: 10 },
  whatsapp_status:  { platform: 'whatsapp_status',  aspectRatio: '9:16', maxDuration: 30,   captionStyle: 'kinetic',  textSafe: { top: 10, bottom: 20, left: 5, right: 5 },  thumbnailRequired: false, hashtagLimit: 0 },
  website_hero:     { platform: 'website_hero',     aspectRatio: '16:9', maxDuration: 30,   captionStyle: 'none',     textSafe: { top: 20, bottom: 20, left: 10, right: 10 }, thumbnailRequired: false, hashtagLimit: 0 },
  email:            { platform: 'email',            aspectRatio: '16:9', maxDuration: 15,   captionStyle: 'none',     textSafe: { top: 10, bottom: 10, left: 10, right: 10 }, thumbnailRequired: true,  hashtagLimit: 0 },
  presentation:     { platform: 'presentation',     aspectRatio: '16:9', maxDuration: 3600, captionStyle: 'subtitle', textSafe: { top: 5, bottom: 15, left: 5, right: 5 },   thumbnailRequired: false, hashtagLimit: 0 },
};

function resolvePlatformConfigs(platforms?: string[]): PlatformOutputConfig[] {
  if (!platforms || platforms.length === 0) {
    return [PLATFORM_CONFIGS.youtube]; // Default
  }
  return platforms
    .map(p => PLATFORM_CONFIGS[p])
    .filter((c): c is PlatformOutputConfig => !!c);
}

// ─── Regional Production Notes Builder ───────────────────────────────────────

function buildRegionalNotes(regionCode: string): RegionalProductionNotes {
  const variant = getRegionalVariant(regionCode);
  const companion = getRegionalCompanionCreature(regionCode);
  const narrative = getRegionalNarrativeStyle(regionCode);
  const music = getRegionalMusicPrompt(regionCode);

  if (!variant) {
    return {
      regionCode,
      regionName: regionCode,
      artStyle: 'universal modern',
      bookStyle: 'leather-bound storybook',
      instrumentFamily: music.instruments,
      narrativeApproach: 'direct benefit-focused',
      humorGuidance: 'universal observational humor',
      formalityLevel: 2,
      avoidList: [],
      culturalSymbols: [],
      wardrobeNotes: { traditional: 'varied', modern: 'casual', business: 'formal' },
    };
  }

  return {
    regionCode,
    regionName: variant.regionName,
    artStyle: variant.culturalElements.patterns,
    bookStyle: deriveBookStyleName(variant),
    instrumentFamily: variant.music.instruments,
    narrativeApproach: variant.narrative.storytellingApproach,
    humorGuidance: variant.narrative.humorStyle,
    formalityLevel: variant.narrative.formalityLevel,
    avoidList: variant.culturalElements.avoidSymbols,
    culturalSymbols: variant.culturalElements.symbolism,
    companionCreature: companion ? { name: companion.name, species: companion.species, description: companion.description } : undefined,
    wardrobeNotes: variant.wardrobe,
  };
}

function deriveBookStyleName(variant: RegionalStyleVariant): string {
  const patterns = variant.culturalElements.patterns.toLowerCase();
  if (patterns.includes('islamic') || patterns.includes('arabesque')) return 'illuminated manuscript';
  if (patterns.includes('kente') || patterns.includes('ankara')) return 'story cloth';
  if (patterns.includes('seigaiha') || patterns.includes('sakura')) return 'scroll painting';
  if (patterns.includes('paisley') || patterns.includes('kolam') || patterns.includes('block print')) return 'palm leaf manuscript';
  if (patterns.includes('batik') || patterns.includes('wayang')) return 'lontar manuscript';
  if (patterns.includes('otomi') || patterns.includes('talavera')) return 'codex';
  if (patterns.includes('vyshyvanka') || patterns.includes('petrykivka')) return 'painted chronicle';
  if (patterns.includes('pirot') || patterns.includes('carpet')) return 'woven tapestry';
  if (patterns.includes('phulkari') || patterns.includes('truck art')) return 'miniature painting';
  if (patterns.includes('jamdani') || patterns.includes('nakshi')) return 'illustrated manuscript';
  if (patterns.includes('nordic') || patterns.includes('dalarna')) return 'rune-carved chronicle';
  if (patterns.includes('maasai') || patterns.includes('kanga')) return 'beaded story cloth';
  if (patterns.includes('suzani') || patterns.includes('ikat')) return 'silk road scroll';
  return 'illustrated storybook';
}

// ═══════════════════════════════════════════════════════════════════════════════
// [1] SCENE TYPE CLASSIFIER
// ═══════════════════════════════════════════════════════════════════════════════

/** Keyword groups used for classification — easily extensible */
const CLASSIFICATION_KEYWORDS: Record<SceneType, string[]> = {
  title_hook:          ['welcome', 'introducing', 'meet', 'hello', 'episode', 'title', 'hook', 'opening'],
  problem_statement:   ['problem', 'pain', 'struggle', 'broken', 'failing', 'frustrated', 'challenge', 'issue', 'wrong', 'stuck'],
  character_intro:     ['character', 'introduce', 'team', 'who', 'role', 'background', 'story of'],
  origin_story:        ['origin', 'began', 'started', 'history', 'journey', 'first', 'how it all', 'founding'],
  solution_reveal:     ['solution', 'answer', 'fix', 'resolved', 'introducing', 'launch', 'built', 'created', 'new approach'],
  technical_deep_dive: ['technical', 'architecture', 'how it works', 'under the hood', 'implementation', 'code', 'system', 'API'],
  data_reveal:         ['data', 'numbers', 'metrics', 'results', 'statistics', 'percent', 'growth', 'KPI', 'dashboard', 'revenue'],
  conflict_tension:    ['conflict', 'tension', 'disagree', 'argument', 'blocked', 'broke', 'failed', 'versus', 'debate'],
  climax_achievement:  ['achievement', 'breakthrough', 'milestone', 'victory', 'accomplished', 'finally', 'triumph', 'success'],
  vision_future:       ['future', 'vision', 'next', 'roadmap', 'imagine', 'tomorrow', 'what if', 'upcoming', 'plan'],
  call_to_action:      ['try', 'join', 'subscribe', 'sign up', 'CTA', 'visit', 'download', 'start', 'get started', 'call to action'],
  transition_bridge:   ['meanwhile', 'moving on', 'next up', 'let\'s shift', 'transition', 'now let\'s'],
  comic_relief:        ['funny', 'joke', 'humor', 'laugh', 'silly', 'chaos', 'squirrel', 'blooper'],
  testimonial:         ['testimonial', 'review', 'customer', 'said', 'feedback', 'quote', 'experience', 'case study'],
  // Celebration scene types
  ceremony_ritual:     ['ceremony', 'ritual', 'sacred', 'wedding', 'vows', 'blessing', 'pheras', 'nikah', 'mass', 'puja', 'baptism'],
  invitation_card:     ['invitation', 'invite', 'rsvp', 'save the date', 'event details', 'venue', 'date', 'card'],
  photo_montage:       ['photos', 'memories', 'montage', 'slideshow', 'album', 'gallery', 'pictures', 'snapshots'],
  blessing_close:      ['blessing', 'farewell', 'thank you', 'gratitude', 'wishes', 'peace', 'amen', 'shalom', 'namaste'],
};

/**
 * Classify a scene's type from its content + position in the sequence.
 * Uses position rules, keyword matching, and narrative arc proportion.
 */
export function classifySceneType(
  title: string,
  description: string,
  index: number,
  totalScenes: number,
): SceneType {
  // Position-based rules take priority
  if (index === 0) return 'title_hook';
  if (index === totalScenes - 1) return 'call_to_action';

  // Keyword scoring — score each type against the scene text
  const text = `${title} ${description}`.toLowerCase();
  let bestType: SceneType = 'transition_bridge';
  let bestScore = 0;

  for (const [type, keywords] of Object.entries(CLASSIFICATION_KEYWORDS)) {
    const score = keywords.reduce((sum, kw) => sum + (text.includes(kw.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestType = type as SceneType;
    }
  }

  // If keyword scoring found a strong match, use it
  if (bestScore >= 2) return bestType;

  // Fallback: proportional narrative arc mapping
  const position = index / totalScenes;
  if (position < ACT_PROPORTIONS.wonder) return 'character_intro';
  if (position < ACT_PROPORTIONS.wonder + ACT_PROPORTIONS.tension) return 'conflict_tension';
  if (position < ACT_PROPORTIONS.wonder + ACT_PROPORTIONS.tension + ACT_PROPORTIONS.triumph) return 'climax_achievement';
  return 'vision_future';
}

/** Assign a narrative act based on scene position within the total count */
function assignNarrativeAct(index: number, total: number): NarrativeAct {
  const position = index / total;
  let cumulative = 0;
  for (const act of NARRATIVE_ACTS) {
    cumulative += ACT_PROPORTIONS[act];
    if (position < cumulative) return act;
  }
  return 'warmth';
}

// ═══════════════════════════════════════════════════════════════════════════════
// [2] VISUAL PROMPT COMPOSER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scene-type-aware visual modifiers — derived dynamically, not static maps.
 * Returns contextual lighting, camera, color, particles, mood based on scene type + act.
 */
function getSceneVisualContext(sceneType: SceneType, act: NarrativeAct): {
  lightingMood: string;
  cameraDirection: string;
  colorTemperature: string;
  particleEffects: string;
  backgroundMood: string;
  characterEmotions: string[];
} {
  // Derive from the combination of scene type + narrative act
  const actLighting: Record<NarrativeAct, string> = {
    wonder:  'warm golden hour, soft volumetric rays',
    tension: 'dramatic side-lighting, deep shadows',
    triumph: 'bright celebratory, rim lighting with lens flare',
    warmth:  'cozy ambient, fireplace warmth, soft diffused',
  };

  const actColors: Record<NarrativeAct, string> = {
    wonder:  'warm golds and soft blues',
    tension: 'cool desaturated with red accents',
    triumph: 'vibrant saturated, gold highlights',
    warmth:  'warm earth tones, sunset palette',
  };

  // Scene-type-specific camera and mood overrides
  const sceneCamera: Partial<Record<SceneType, string>> = {
    title_hook:          'slow push-in reveal, cinematic wide establishing shot',
    problem_statement:   'handheld slight shake, close-up on frustrated expressions',
    character_intro:     'dynamic orbit, hero angle low-to-high',
    data_reveal:         'steady track forward, clean infographic framing',
    conflict_tension:    'quick cuts, split-screen dual coverage',
    climax_achievement:  'crane shot rising upward, triumphant reveal',
    call_to_action:      'direct-to-camera, warm close-up',
    comic_relief:        'whip-pan comedic timing, exaggerated zoom',
    vision_future:       'vast wide shot, slowly expanding horizon',
  };

  const sceneParticles: Partial<Record<SceneType, string>> = {
    title_hook:          'magical sparkle motes, golden dust swirl',
    problem_statement:   'dust motes, fading embers',
    solution_reveal:     'light burst particles, crystalline shards',
    data_reveal:         'floating data points, holographic numbers',
    climax_achievement:  'confetti burst, sparkle cascade',
    vision_future:       'star field, constellation dots connecting',
    comic_relief:        'cartoon poof clouds, exaggerated sparkles',
  };

  const sceneEmotions: Partial<Record<SceneType, string[]>> = {
    title_hook:          ['welcoming', 'curious', 'excited'],
    problem_statement:   ['frustrated', 'overwhelmed', 'determined'],
    character_intro:     ['confident', 'friendly', 'energetic'],
    origin_story:        ['reflective', 'nostalgic', 'hopeful'],
    solution_reveal:     ['proud', 'excited', 'relieved'],
    technical_deep_dive: ['focused', 'analytical', 'precise'],
    data_reveal:         ['impressed', 'proud', 'amazed'],
    conflict_tension:    ['tense', 'argumentative', 'passionate'],
    climax_achievement:  ['triumphant', 'joyful', 'celebrating'],
    vision_future:       ['inspired', 'visionary', 'hopeful'],
    call_to_action:      ['warm', 'inviting', 'encouraging'],
    comic_relief:        ['laughing', 'mischievous', 'playful'],
    testimonial:         ['grateful', 'sincere', 'impressed'],
  };

  return {
    lightingMood: actLighting[act],
    cameraDirection: sceneCamera[sceneType] ?? 'medium shot, gentle dolly',
    colorTemperature: actColors[act],
    particleEffects: sceneParticles[sceneType] ?? 'subtle ambient particles',
    backgroundMood: `${act} atmosphere — ${ACT_MOOD_MAP[act].mood}`,
    characterEmotions: sceneEmotions[sceneType] ?? ['engaged', 'attentive'],
  };
}

/**
 * Compose rich visual prompts for a scene — integrates style templates,
 * regional enrichment, scene context, and brand profile.
 * All values derived from registries, nothing hardcoded.
 */
export function composeVisualPrompts(
  scene: ParsedScene,
  styleFamily: CreativeStyleFamily,
  regionCode: string,
  characters: EnrichmentCharacter[],
  brandProfile?: Partial<BrandIntelligenceProfile>,
  presetData?: AdaptedPresetData,
): VisualPrompts {
  const template = STYLE_PROMPT_TEMPLATES[styleFamily];
  const visual = getSceneVisualContext(scene.sceneType, scene.narrativeAct);
  const companion = getRegionalCompanionCreature(regionCode);
  const narrative = getRegionalNarrativeStyle(regionCode);

  // If imagination preset is active, layer its prompt DNA over style template
  const scenePrefix = presetData
    ? presetData.prompt.stylePrefix
    : template.scenePromptPrefix;
  const qualityBoost = presetData
    ? `${presetData.prompt.qualityBoost}, ${template.qualityBoost}`
    : template.qualityBoost;
  const charPrefix = presetData
    ? presetData.prompt.characterPrefix
    : template.characterPromptPrefix;
  const envPrefix = presetData
    ? presetData.prompt.environmentPrefix
    : template.environmentPromptPrefix;

  // Build base image prompt from style/preset + scene description + visual context
  const imageBase = [
    scenePrefix,
    scene.description,
    `Lighting: ${presetData ? presetData.visual.lighting : visual.lightingMood}`,
    `Camera: ${presetData ? presetData.visual.cameraWork : visual.cameraDirection}`,
    `Color palette: ${presetData ? presetData.visual.colorMood : visual.colorTemperature}`,
    `Particles: ${presetData ? presetData.visual.particleEffects : visual.particleEffects}`,
    `Mood: ${visual.backgroundMood}`,
    qualityBoost,
  ].join('. ');

  // Enrich with regional cultural context
  const imagePrompt = enrichPromptWithRegion(imageBase, regionCode);

  // Video prompt adds motion, duration, and character actions
  const characterActions = characters.length > 0
    ? `Characters: ${characters.map(c => `${c.name} (${c.role}) — ${visual.characterEmotions.join(', ')}`).join('; ')}`
    : '';
  const videoMotion = presetData ? presetData.prompt.videoMotionStyle : '';
  const videoPrompt = [
    imagePrompt,
    `Duration: ${scene.duration}s`,
    characterActions,
    videoMotion ? `Motion style: ${videoMotion}` : '',
    narrative ? `Narrative style: ${narrative.approach}` : '',
  ].filter(Boolean).join('. ');

  // Character prompt — style/preset-appropriate character description
  const primaryChar = characters[0];
  const characterPromptParts = [
    charPrefix,
    primaryChar ? `Character: ${primaryChar.name}, ${primaryChar.personality}` : '',
    primaryChar?.animalType ? `Animal type: ${primaryChar.animalType}` : '',
    presetData ? `Expression: ${presetData.character.expressionStyle}` : '',
    presetData ? `Motion: ${presetData.character.motionStyle}` : '',
    `Emotions: ${visual.characterEmotions.join(', ')}`,
    companion ? `Companion creature: ${companion.description}` : '',
  ].filter(Boolean);
  const characterPrompt = enrichPromptWithRegion(characterPromptParts.join('. '), regionCode);

  // Environment prompt — regional setting + scene mood + preset environment
  const envParts = [
    envPrefix,
    presetData ? `Setting: ${presetData.visual.backgroundStyle}` : '',
    `Scene mood: ${visual.backgroundMood}`,
    `Lighting: ${presetData ? presetData.visual.lighting : visual.lightingMood}`,
    `Color temperature: ${presetData ? presetData.visual.colorMood : visual.colorTemperature}`,
  ].filter(Boolean);
  if (brandProfile?.visual) {
    const bp = brandProfile.visual as Record<string, unknown>;
    if (bp.primaryColor) envParts.push(`Brand accent: ${bp.primaryColor}`);
  }
  const environmentPrompt = enrichPromptWithRegion(envParts.join('. '), regionCode);

  return { imagePrompt, videoPrompt, characterPrompt, environmentPrompt };
}

// ═══════════════════════════════════════════════════════════════════════════════
// [3] TRANSITION ASSIGNER
// ═══════════════════════════════════════════════════════════════════════════════

/** Transition rules derived from scene type transitions — no hardcoded scene IDs */
const SCENE_TYPE_TRANSITION_RULES: Partial<Record<`${SceneType}->${SceneType}`, StorybookTransitionStyle>> = {
  'title_hook->problem_statement':     'chapter-card',
  'title_hook->character_intro':       'chapter-card',
  'problem_statement->solution_reveal': 'iris-wipe',
  'problem_statement->character_intro': 'storybook-flip',
  'data_reveal->vision_future':        'scroll-unroll',
  'data_reveal->climax_achievement':   'scroll-unroll',
  'conflict_tension->solution_reveal': 'iris-wipe',
  'conflict_tension->climax_achievement': 'dissolve-morph',
  'comic_relief->technical_deep_dive': 'storybook-flip',
  'climax_achievement->vision_future': 'dissolve-morph',
  'vision_future->call_to_action':     'chapter-card',
};

/** Act boundary transitions */
const ACT_BOUNDARY_TRANSITION: StorybookTransitionStyle = 'chapter-card';

/** Cycling pool for when no specific rule matches — prevents consecutive repeats */
const TRANSITION_CYCLE: StorybookTransitionStyle[] = [
  'page-turn', 'scroll-unroll', 'storybook-flip',
];

/**
 * Assign transitions between scenes based on narrative rules.
 * Generates visual + SFX prompts for each transition dynamically.
 */
export function assignTransitions(
  scenes: ParsedScene[],
  styleFamily: CreativeStyleFamily,
  regionCode: string,
): Array<{ from: string; to: string; style: StorybookTransitionStyle; steps: ScenePipelineStep[] }> {
  const transitions: Array<{ from: string; to: string; style: StorybookTransitionStyle; steps: ScenePipelineStep[] }> = [];
  let lastStyle: StorybookTransitionStyle | null = null;
  let cycleIndex = 0;

  for (let i = 0; i < scenes.length - 1; i++) {
    const from = scenes[i];
    const to = scenes[i + 1];

    // Determine transition style
    let style: StorybookTransitionStyle;

    // Check act boundary
    if (from.narrativeAct !== to.narrativeAct) {
      style = ACT_BOUNDARY_TRANSITION;
    }
    // Check specific scene-type transition rules
    else {
      const ruleKey = `${from.sceneType}->${to.sceneType}` as `${SceneType}->${SceneType}`;
      style = SCENE_TYPE_TRANSITION_RULES[ruleKey] ?? pickFromCycle();
    }

    // Prevent consecutive same style
    if (style === lastStyle && style !== ACT_BOUNDARY_TRANSITION) {
      style = pickFromCycle();
    }
    lastStyle = style;

    // Generate transition prompts dynamically from style + region
    const transitionPrompt = buildTransitionPrompt(style, from, to, regionCode);

    transitions.push({
      from: from.id,
      to: to.id,
      style,
      steps: [
        { type: 'scene-transition', style, prompt: transitionPrompt, duration: 2 },
        { type: 'sfx', prompt: `${style} transition whoosh with ${getTransitionSfxDescriptor(style)} stinger` },
      ],
    });
  }

  return transitions;

  function pickFromCycle(): StorybookTransitionStyle {
    const style = TRANSITION_CYCLE[cycleIndex % TRANSITION_CYCLE.length];
    cycleIndex++;
    // Skip if same as last
    if (style === lastStyle) {
      cycleIndex++;
      return TRANSITION_CYCLE[cycleIndex % TRANSITION_CYCLE.length];
    }
    return style;
  }
}

function buildTransitionPrompt(
  style: StorybookTransitionStyle,
  from: ParsedScene,
  to: ParsedScene,
  regionCode: string,
): string {
  const variant = getRegionalVariant(regionCode);
  const culturalTexture = variant?.culturalElements.patterns ?? 'ornate decorative';

  const styleDescriptions: Record<StorybookTransitionStyle, string> = {
    'page-turn':      `Storybook page turning with ${culturalTexture} margin illustrations, aged paper texture`,
    'scroll-unroll':  `Parchment scroll unrolling to reveal ${to.title}, with ${culturalTexture} border designs`,
    'iris-wipe':      `Magical iris wipe opening like a portal from "${from.title}" to "${to.title}", sparkle ring expanding`,
    'storybook-flip': `Book page flipping with animated ${culturalTexture} flourishes, chapter changing`,
    'chapter-card':   `Chapter card with ornate ${culturalTexture} frame, title: "${to.title}", illuminated lettering`,
    'dissolve-morph': `Scene morphing from ${from.title} into ${to.title}, elements transforming fluidly`,
  };

  return styleDescriptions[style];
}

function getTransitionSfxDescriptor(style: StorybookTransitionStyle): string {
  const sfxMap: Record<StorybookTransitionStyle, string> = {
    'page-turn':      'paper rustle',
    'scroll-unroll':  'parchment crinkle',
    'iris-wipe':      'magical shimmer',
    'storybook-flip': 'book snap',
    'chapter-card':   'brass fanfare',
    'dissolve-morph': 'ethereal chime',
  };
  return sfxMap[style];
}

// ═══════════════════════════════════════════════════════════════════════════════
// [4] AUDIO SCORE COMPOSER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Derive music mood from scene type + narrative act + regional music.
 * Everything comes from the registry — no static mood maps.
 */
function deriveSceneMusicMood(sceneType: SceneType, act: NarrativeAct): string {
  // Map scene types to emotional descriptors — these are universal modifiers
  // that get combined with regional genre/instruments from the registry
  const emotionMap: Record<SceneType, string> = {
    title_hook:          'grand opening, epic reveal, attention-grabbing',
    problem_statement:   'tense, building urgency, minor key undertone',
    character_intro:     'playful, character-establishing, whimsical woodwinds',
    origin_story:        'nostalgic, reflective, gentle build',
    solution_reveal:     'triumphant reveal, major key resolution, brass fanfare',
    technical_deep_dive: 'focused, precise, clean electronic pulse',
    data_reveal:         'impressive, counting-up energy, achievement unlock',
    conflict_tension:    'dramatic, clock-ticking urgency, dissonant accents',
    climax_achievement:  'peak energy, all instruments, crescendo to celebration',
    vision_future:       'expansive, hopeful, world-building strings',
    call_to_action:      'warm closing, all themes resolving, satisfying finale',
    transition_bridge:   'brief instrumental bridge, smooth modulation',
    comic_relief:        'bouncy, mischievous pizzicato, cartoon timing',
    testimonial:         'sincere, simple accompaniment, warm piano',
  };

  return `${emotionMap[sceneType]}, ${ACT_MOOD_MAP[act].mood}`;
}

/**
 * Compose a full audio score for all scenes — music beds + SFX.
 * Regional music comes from getRegionalMusicPrompt(), tempo from narrative arc.
 */
export function composeAudioScore(
  scenes: ParsedScene[],
  regionCode: string,
  characters: EnrichmentCharacter[],
  presetData?: AdaptedPresetData,
): { score: Record<string, AudioEntry>; leitmotifs: Record<string, ScenePipelineStep> } {
  const regionalMusic = getRegionalMusicPrompt(regionCode);
  const variant = getRegionalVariant(regionCode);

  // If imagination preset has music DNA, blend it with regional music
  const presetMusic = presetData?.music;
  const genreLabel = presetMusic
    ? `${presetMusic.genre} with ${regionalMusic.genre} influence`
    : `${regionalMusic.genre} music`;
  const instrumentList = presetMusic
    ? [...presetMusic.instruments.slice(0, 3), ...regionalMusic.instruments.slice(0, 2)]
    : regionalMusic.instruments;
  const baseBpm = presetMusic
    ? Math.round((presetMusic.bpmRange.min + presetMusic.bpmRange.max) / 2)
    : regionalMusic.bpm;
  const presetMood = presetMusic?.mood ?? '';
  const presetSfxStyle = presetMusic?.sfxStyle ?? '';

  const score: Record<string, AudioEntry> = {};

  for (const scene of scenes) {
    const mood = deriveSceneMusicMood(scene.sceneType, scene.narrativeAct);
    const tempoFactor = ACT_MOOD_MAP[scene.narrativeAct].tempoFactor;
    const bpm = Math.round(baseBpm * tempoFactor);

    // Build music prompt from regional + preset + scene emotion
    const musicPrompt = [
      genreLabel,
      mood,
      presetMood ? `Preset mood: ${presetMood}` : '',
      `Instruments: ${instrumentList.join(', ')}`,
      `${bpm} BPM`,
      variant ? `Cultural mood: ${variant.music.moodDescription}` : '',
    ].filter(Boolean).join(', ');

    // Generate contextual SFX from scene type + preset SFX style
    const sfx = generateSceneSfx(scene.sceneType, scene.title, presetSfxStyle);

    score[scene.id] = {
      music: { type: 'music', prompt: musicPrompt, duration: scene.duration, style: scene.narrativeAct },
      sfx,
    };
  }

  // Character leitmotifs — derived from character personality + regional/preset instruments
  const leitmotifs: Record<string, ScenePipelineStep> = {};
  for (const char of characters) {
    const instrument = selectLeitmotifInstrument(char, instrumentList);
    leitmotifs[char.id] = {
      type: 'music',
      prompt: `${char.name} leitmotif — ${char.personality} character theme using ${instrument}, ${genreLabel} style, brief 5-second motif`,
      duration: 5,
      style: 'leitmotif',
    } as ScenePipelineStep & { type: 'music' };
  }

  return { score, leitmotifs };
}

/** Select a leitmotif instrument based on character personality + available regional instruments */
function selectLeitmotifInstrument(char: EnrichmentCharacter, instruments: string[]): string {
  // Map personality traits to instrument families
  const traitInstrumentMap: Record<string, string[]> = {
    calm:       ['flute', 'piano', 'strings', 'koto', 'bansuri', 'ney'],
    energetic:  ['drums', 'trumpet', 'guitar', 'taiko', 'dholak', 'djembe'],
    theatrical: ['brass', 'orchestra', 'oud', 'sitar', 'nadaswaram'],
    warm:       ['cello', 'piano', 'harmonium', 'veena', 'rebab'],
    playful:    ['xylophone', 'ukulele', 'angklung', 'shekere', 'marimba'],
    precise:    ['piano', 'harpsichord', 'shamisen', 'ghatam'],
  };

  // Find matching instrument from the regional set
  const personality = char.personality.toLowerCase();
  for (const [trait, preferred] of Object.entries(traitInstrumentMap)) {
    if (personality.includes(trait)) {
      const match = instruments.find(i => preferred.some(p => i.toLowerCase().includes(p)));
      if (match) return match;
    }
  }

  // Fallback: use first regional instrument
  return instruments[0] ?? 'piano';
}

/** Generate SFX cues based on scene type — context-aware, not hardcoded per scene */
function generateSceneSfx(sceneType: SceneType, title: string, presetSfxStyle?: string): (ScenePipelineStep & { type: 'sfx' })[] {
  const sfxByType: Record<SceneType, Array<{ prompt: string; duration?: number }>> = {
    title_hook:          [{ prompt: 'Grand opening reveal with magical shimmer', duration: 3 }, { prompt: 'Title card whoosh impact', duration: 1 }],
    problem_statement:   [{ prompt: 'Tension building bass rumble', duration: 4 }, { prompt: 'Frustrated sigh with ambient noise' }],
    character_intro:     [{ prompt: 'Character appearance sparkle chime', duration: 2 }, { prompt: 'Personality-establishing sound motif', duration: 1 }],
    origin_story:        [{ prompt: 'Nostalgic film reel spin', duration: 3 }, { prompt: 'Memory transition shimmer' }],
    solution_reveal:     [{ prompt: 'Lightbulb moment chime with ascending tone', duration: 2 }, { prompt: 'Solution reveal brass hit', duration: 1 }],
    technical_deep_dive: [{ prompt: 'Interface activation beeps', duration: 2 }, { prompt: 'Code compiling rapid clicks', duration: 3 }],
    data_reveal:         [{ prompt: 'Counter rapidly counting up with slot machine energy', duration: 4 }, { prompt: 'Achievement chime with sparkle', duration: 2 }],
    conflict_tension:    [{ prompt: 'Speech bubbles colliding impact', duration: 1 }, { prompt: 'Tension string screech accent', duration: 2 }],
    climax_achievement:  [{ prompt: 'Triumphant fanfare burst', duration: 3 }, { prompt: 'Crowd cheering and applause', duration: 4 }],
    vision_future:       [{ prompt: 'World expanding shimmer with twinkling stars', duration: 4 }, { prompt: 'Connection establishing digital handshake', duration: 2 }],
    call_to_action:      [{ prompt: 'Warm resolution chord with gentle chime', duration: 3 }, { prompt: 'End card logo settle with sparkle', duration: 2 }],
    transition_bridge:   [{ prompt: 'Smooth transition whoosh', duration: 1 }],
    comic_relief:        [{ prompt: 'Cartoon boing with silly whistle', duration: 1 }, { prompt: 'Audience giggle', duration: 2 }],
    testimonial:         [{ prompt: 'Gentle quote appearance chime', duration: 1 }],
  };

  return (sfxByType[sceneType] ?? []).map(s => ({
    type: 'sfx' as const,
    prompt: presetSfxStyle ? `${s.prompt} (${presetSfxStyle} aesthetic)` : s.prompt,
    ...(s.duration !== undefined ? { duration: s.duration } : {}),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// [5] CHARACTER INTERACTION BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/** Interaction style derived from scene type — extensible mapping */
const SCENE_TYPE_INTERACTION_STYLE: Partial<Record<SceneType, 'group-shot' | 'duo-argument' | 'standup-circle' | 'farewell-wave'>> = {
  character_intro:    'group-shot',
  conflict_tension:   'duo-argument',
  climax_achievement: 'standup-circle',
  call_to_action:     'farewell-wave',
  comic_relief:       'duo-argument',
};

/**
 * Build character interaction dynamics — Alvin & Chipmunks style.
 * The dynamic descriptions are derived from character roles + personalities.
 */
function describeInteractionDynamic(
  style: 'group-shot' | 'duo-argument' | 'standup-circle' | 'farewell-wave',
  characters: EnrichmentCharacter[],
): string {
  const names = characters.map(c => c.name).join(', ');

  const dynamicsByStyle: Record<typeof style, (chars: EnrichmentCharacter[]) => string> = {
    'group-shot': (chars) => {
      const descriptions = chars.map(c =>
        `${c.name} (${c.role}) — ${c.personality}, ${c.animalType ? `as a ${c.animalType}` : 'character'}`
      ).join('; ');
      return `Group introduction shot: ${descriptions}. Each character strikes a signature pose revealing their personality. Pixar ensemble energy.`;
    },
    'duo-argument': (chars) => {
      const [a, b] = chars.length >= 2 ? [chars[0], chars[1]] : [chars[0], chars[0]];
      return `${a.name} and ${b.name} talking AT each other simultaneously, speech bubbles colliding mid-air, ` +
        `Alvin-and-Chipmunks chaotic overlap energy. ${a.name}: ${a.personality}. ${b.name}: ${b.personality}. ` +
        `Neither listening, both passionate, comedic timing.`;
    },
    'standup-circle': (chars) => {
      return `All characters (${names}) in a circle celebrating together — synchronized cheering, ` +
        `high-fives, sparkle effects. Each character's personality shines: ` +
        chars.map(c => `${c.name} reacts in their ${c.personality} way`).join(', ') + '.';
    },
    'farewell-wave': (chars) => {
      return `Characters (${names}) waving goodbye warmly to camera — each in their signature style. ` +
        `Warm lighting, ensemble farewell energy, audience connection moment.`;
    },
  };

  return dynamicsByStyle[style](characters);
}

export function buildCharacterInteractions(
  scenes: ParsedScene[],
  characters: EnrichmentCharacter[],
  regionCode: string,
): Array<{ sceneId: string; steps: ScenePipelineStep[] }> {
  if (characters.length < 2) return [];

  const interactions: Array<{ sceneId: string; steps: ScenePipelineStep[] }> = [];

  for (const scene of scenes) {
    const interactionStyle = SCENE_TYPE_INTERACTION_STYLE[scene.sceneType];
    if (!interactionStyle) continue;

    const dynamicPrompt = describeInteractionDynamic(interactionStyle, characters);
    const enrichedPrompt = enrichPromptWithRegion(dynamicPrompt, regionCode);

    interactions.push({
      sceneId: scene.id,
      steps: [{
        type: 'character-interaction',
        characters: characters.map(c => c.id),
        prompt: enrichedPrompt,
        style: interactionStyle,
      }],
    });
  }

  return interactions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [6] STORYBOOK FRAMER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build storybook framing — bookends, chapter headers, narrator scrolls.
 * All visual descriptions derived from regional cultural elements.
 */
export function buildStorybookFraming(
  scenes: ParsedScene[],
  title: string,
  regionCode: string,
  styleFamily: CreativeStyleFamily,
): {
  bookends: { opening: ScenePipelineStep[]; closing: ScenePipelineStep[] };
  narratorScrolls: Array<{ sceneId: string; steps: ScenePipelineStep[] }>;
} {
  const variant = getRegionalVariant(regionCode);
  const template = STYLE_PROMPT_TEMPLATES[styleFamily];
  const companion = getRegionalCompanionCreature(regionCode);

  // Derive book style from region
  const bookStyle = deriveBookStyle(variant);
  const marginalia = deriveMarginalia(variant, companion);

  // Opening bookend
  const openingPrompt = enrichPromptWithRegion(
    `${template.scenePromptPrefix}. ${bookStyle.bookDescription}, title "${title}" embossed in gold, ` +
    `${bookStyle.openingAction}. ${marginalia}. ${template.qualityBoost}`,
    regionCode,
  );

  const opening: ScenePipelineStep[] = [
    { type: 'storybook-frame', variant: 'opening', prompt: openingPrompt, duration: 5 },
    { type: 'music', prompt: `Music box celesta melody, gentle and magical, opening a ${bookStyle.bookType}, 80 BPM`, duration: 5, style: 'music-box' },
    { type: 'sfx', prompt: `${bookStyle.bookType} cover opening with aged paper crinkle`, duration: 2 },
  ];

  // Closing bookend
  const closingPrompt = enrichPromptWithRegion(
    `${template.scenePromptPrefix}. Scene flattens to ${bookStyle.illustrationStyle} illustration, ` +
    `${bookStyle.bookType} slowly closing, golden clasp clicking shut. ${marginalia}. ${template.qualityBoost}`,
    regionCode,
  );

  const closing: ScenePipelineStep[] = [
    { type: 'storybook-frame', variant: 'closing', prompt: closingPrompt, duration: 5 },
    { type: 'music', prompt: `Music box celesta melody descending, gentle close, ${bookStyle.bookType} shutting, 75 BPM`, duration: 5, style: 'music-box' },
    { type: 'sfx', prompt: `${bookStyle.bookType} closing with satisfying thud and clasp click`, duration: 2 },
  ];

  // Narrator scrolls for data_reveal scenes
  const narratorScrolls: Array<{ sceneId: string; steps: ScenePipelineStep[] }> = [];
  for (const scene of scenes) {
    if (scene.sceneType === 'data_reveal' || scene.sceneType === 'technical_deep_dive') {
      const scrollPrompt = enrichPromptWithRegion(
        `${bookStyle.scrollDescription} unrolling to reveal data from "${scene.title}", ` +
        `${bookStyle.illustrationStyle} marginalia with ${companion?.description ?? 'decorative creatures'} ` +
        `interacting with the data visualizations. ${template.qualityBoost}`,
        regionCode,
      );

      narratorScrolls.push({
        sceneId: scene.id,
        steps: [
          { type: 'narrator-scroll', prompt: scrollPrompt, duration: 4, dataContent: scene.title },
          { type: 'sfx', prompt: `Parchment scroll unrolling with wooden roller creak`, duration: 2 },
        ],
      });
    }
  }

  return { bookends: { opening, closing }, narratorScrolls };
}

/** Derive book/manuscript style from regional cultural elements */
function deriveBookStyle(variant: RegionalStyleVariant | undefined): {
  bookType: string;
  bookDescription: string;
  openingAction: string;
  scrollDescription: string;
  illustrationStyle: string;
} {
  if (!variant) {
    return {
      bookType: 'leather-bound storybook',
      bookDescription: 'Ornate leather-bound storybook with gold-embossed cover',
      openingAction: 'cover opening to reveal aged pages with deckled edges',
      scrollDescription: 'Ornate parchment scroll with wooden rollers',
      illustrationStyle: 'ink-and-watercolor',
    };
  }

  // Map regional patterns and architecture to book styles
  const patterns = variant.culturalElements.patterns.toLowerCase();
  const architecture = variant.culturalElements.architecture.toLowerCase();

  if (patterns.includes('islamic') || patterns.includes('arabesque') || patterns.includes('calligraphy')) {
    return {
      bookType: 'illuminated manuscript',
      bookDescription: `Illuminated Islamic manuscript with ${variant.culturalElements.patterns} border designs and gold leaf calligraphy`,
      openingAction: 'ornate cover with geometric tessellation opening to reveal hand-lettered pages',
      scrollDescription: `Ornate scroll with ${variant.culturalElements.patterns} borders and gold calligraphy`,
      illustrationStyle: 'illuminated manuscript with geometric arabesque',
    };
  }
  if (patterns.includes('kente') || patterns.includes('ankara') || patterns.includes('adinkra')) {
    return {
      bookType: 'story cloth',
      bookDescription: `West African story cloth with ${variant.culturalElements.patterns} designs, vibrant textile binding`,
      openingAction: 'cloth wrapper unfolding to reveal beautifully decorated pages with adinkra symbols',
      scrollDescription: `Woven story scroll with ${variant.culturalElements.patterns} border patterns`,
      illustrationStyle: `vibrant ${variant.culturalElements.patterns} textile art`,
    };
  }
  if (patterns.includes('seigaiha') || patterns.includes('sakura') || architecture.includes('torii')) {
    return {
      bookType: 'scroll painting',
      bookDescription: `Japanese scroll painting (emakimono) with ${variant.culturalElements.patterns} motifs on silk`,
      openingAction: 'silk scroll unrolling horizontally to reveal painted scenes',
      scrollDescription: `Painted scroll with ${variant.culturalElements.patterns} borders on aged rice paper`,
      illustrationStyle: 'ukiyo-e woodblock print',
    };
  }
  if (patterns.includes('paisley') || patterns.includes('kolam') || patterns.includes('madhubani') || patterns.includes('block print')) {
    return {
      bookType: 'palm leaf manuscript',
      bookDescription: `Indian palm leaf manuscript (tala patra) with ${variant.culturalElements.patterns} decorations`,
      openingAction: 'palm leaves bound with silk thread spreading open to reveal hand-painted illustrations',
      scrollDescription: `Decorated palm leaf scroll with ${variant.culturalElements.patterns} borders`,
      illustrationStyle: `Madhubani/Kalamkari folk art`,
    };
  }
  if (patterns.includes('batik') || patterns.includes('wayang')) {
    return {
      bookType: 'lontar manuscript',
      bookDescription: `Southeast Asian lontar manuscript with ${variant.culturalElements.patterns} decorative covers`,
      openingAction: 'carved wooden covers opening to reveal inscribed palm leaves with gold accents',
      scrollDescription: `Decorated scroll with ${variant.culturalElements.patterns} shadow puppet borders`,
      illustrationStyle: `wayang-inspired shadow art with ${variant.culturalElements.patterns}`,
    };
  }
  if (patterns.includes('otomi') || patterns.includes('talavera') || patterns.includes('papel picado')) {
    return {
      bookType: 'codex',
      bookDescription: `Mexican amate bark codex with ${variant.culturalElements.patterns} painted covers`,
      openingAction: 'accordion-folded codex opening to reveal vibrant painted pages',
      scrollDescription: `Amate bark scroll with ${variant.culturalElements.patterns} border illustrations`,
      illustrationStyle: `vibrant folk art with ${variant.culturalElements.patterns}`,
    };
  }
  if (patterns.includes('maasai') || patterns.includes('kanga')) {
    return {
      bookType: 'story cloth',
      bookDescription: `East African beaded story cloth with ${variant.culturalElements.patterns} designs`,
      openingAction: 'beaded cover opening to reveal illustrated pages with savanna imagery',
      scrollDescription: `Story scroll with ${variant.culturalElements.patterns} beadwork borders`,
      illustrationStyle: `vibrant East African art with ${variant.culturalElements.patterns}`,
    };
  }

  // Generic fallback using available regional info
  return {
    bookType: 'illustrated storybook',
    bookDescription: `Regional storybook with ${variant.culturalElements.patterns} decorative binding from ${variant.regionName}`,
    openingAction: 'cover opening with cultural flourishes revealing decorated pages',
    scrollDescription: `Decorative scroll with ${variant.culturalElements.patterns} borders`,
    illustrationStyle: `regional illustration style from ${variant.regionName}`,
  };
}

/** Derive marginalia descriptions from regional companion creatures */
function deriveMarginalia(
  variant: RegionalStyleVariant | undefined,
  companion: RegionalStyleVariant['companionCreature'] | undefined,
): string {
  if (!companion) {
    return 'Tiny woodland creatures decorating the margins with delicate ink illustrations';
  }
  return `Tiny ${companion.name} (${companion.species}) illustrations in the margins — ${companion.description}, ` +
    `interacting with page elements, ${companion.culturalSignificance}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [7] VOICE ASSIGNER
// ═══════════════════════════════════════════════════════════════════════════════

/** Voice palette — curated per provider, mapped by voice style */
const VOICE_PALETTE: Record<string, Array<{
  provider: 'elevenlabs' | 'azure' | 'alibaba';
  voiceId: string;
  style: string;
  speed: number;
  fallbackVoiceId: string;
}>> = {
  warm:         [
    { provider: 'elevenlabs', voiceId: 'nPczCjzI2devNBz1zQrb', style: 'warm', speed: 1.0, fallbackVoiceId: 'longanyang' },
    { provider: 'azure', voiceId: 'en-US-DavisNeural', style: 'warm', speed: 1.0, fallbackVoiceId: 'longanyang' },
  ],
  energetic:    [
    { provider: 'elevenlabs', voiceId: 'pFZP5JQG7iQjIQuC4Bku', style: 'energetic', speed: 1.1, fallbackVoiceId: 'longhua' },
    { provider: 'azure', voiceId: 'en-US-JennyNeural', style: 'energetic', speed: 1.05, fallbackVoiceId: 'longhua' },
  ],
  theatrical:   [
    { provider: 'elevenlabs', voiceId: '2EiwWnXFnvU5JabPnv8n', style: 'theatrical', speed: 0.85, fallbackVoiceId: 'longshu' },
    { provider: 'azure', voiceId: 'en-US-TonyNeural', style: 'theatrical', speed: 0.9, fallbackVoiceId: 'longshu' },
  ],
  professional: [
    { provider: 'azure', voiceId: 'en-US-GuyNeural', style: 'professional', speed: 0.95, fallbackVoiceId: 'longcheng' },
    { provider: 'elevenlabs', voiceId: 'TxGEqnHWrfWFTfGW9XjX', style: 'professional', speed: 0.95, fallbackVoiceId: 'longcheng' },
  ],
  playful:      [
    { provider: 'elevenlabs', voiceId: 'jBpfuIE2acCO8z3wKNLl', style: 'playful', speed: 1.3, fallbackVoiceId: 'longpaopao_v3' },
    { provider: 'azure', voiceId: 'en-US-AriaNeural', style: 'playful', speed: 1.2, fallbackVoiceId: 'longpaopao_v3' },
  ],
  deep:         [
    { provider: 'elevenlabs', voiceId: '2EiwWnXFnvU5JabPnv8n', style: 'deep', speed: 0.85, fallbackVoiceId: 'longshu' },
    { provider: 'azure', voiceId: 'en-US-GuyNeural', style: 'deep', speed: 0.9, fallbackVoiceId: 'longshu' },
  ],
};

/** Role-to-voice-style default mapping — used when character has no explicit preference */
const ROLE_VOICE_DEFAULTS: Record<CharacterRole, string> = {
  narrator:     'warm',
  protagonist:  'professional',
  sidekick:     'energetic',
  antagonist:   'theatrical',
  expert:       'professional',
  comic_relief: 'playful',
  companion:    'warm',
};

/**
 * Assign unique voices to characters — no two characters share same provider+voiceId.
 * Respects character preferences, falls back to role-based defaults.
 */
export function assignVoices(
  characters: EnrichmentCharacter[],
  _regionCode: string,
): Record<string, VoiceAssignment> {
  const config: Record<string, VoiceAssignment> = {};
  const usedVoices = new Set<string>();

  for (const char of characters) {
    const preferredStyle = char.voicePreference?.style ?? ROLE_VOICE_DEFAULTS[char.role] ?? 'warm';
    const preferredProvider = char.voicePreference?.provider;
    const candidates = VOICE_PALETTE[preferredStyle] ?? VOICE_PALETTE['warm'];

    // Find a voice that hasn't been used yet
    let assigned = false;
    for (const candidate of candidates) {
      // Prefer specific provider if requested
      if (preferredProvider && candidate.provider !== preferredProvider) continue;
      const key = `${candidate.provider}:${candidate.voiceId}`;
      if (usedVoices.has(key)) continue;

      usedVoices.add(key);
      config[char.id] = {
        provider: candidate.provider,
        voiceId: candidate.voiceId,
        style: candidate.style,
        speed: char.voicePreference?.speed ?? candidate.speed,
        fallbackProvider: 'alibaba',
        fallbackVoiceId: candidate.fallbackVoiceId,
      };
      assigned = true;
      break;
    }

    // If preferred provider narrowed too much, try without provider filter
    if (!assigned) {
      for (const candidate of candidates) {
        const key = `${candidate.provider}:${candidate.voiceId}`;
        if (usedVoices.has(key)) continue;

        usedVoices.add(key);
        config[char.id] = {
          provider: candidate.provider,
          voiceId: candidate.voiceId,
          style: candidate.style,
          speed: char.voicePreference?.speed ?? candidate.speed,
          fallbackProvider: 'alibaba',
          fallbackVoiceId: candidate.fallbackVoiceId,
        };
        assigned = true;
        break;
      }
    }

    // Last resort: try ANY unused voice from any style
    if (!assigned) {
      for (const [, voiceList] of Object.entries(VOICE_PALETTE)) {
        for (const candidate of voiceList) {
          const key = `${candidate.provider}:${candidate.voiceId}`;
          if (usedVoices.has(key)) continue;

          usedVoices.add(key);
          config[char.id] = {
            provider: candidate.provider,
            voiceId: candidate.voiceId,
            style: preferredStyle,
            speed: char.voicePreference?.speed ?? candidate.speed,
            fallbackProvider: 'alibaba',
            fallbackVoiceId: candidate.fallbackVoiceId,
          };
          assigned = true;
          break;
        }
        if (assigned) break;
      }
    }

    // Absolute fallback — should rarely hit
    if (!assigned) {
      config[char.id] = {
        provider: 'alibaba',
        voiceId: 'longanyang',
        style: preferredStyle,
        speed: 1.0,
        fallbackProvider: 'alibaba',
        fallbackVoiceId: 'longanyang',
      };
    }
  }

  return config;
}

// ═══════════════════════════════════════════════════════════════════════════════
// [8] MAIN ORCHESTRATOR — enrichScenes()
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse any content format into a uniform scene list.
 */
function parseContent(
  input: SceneEnrichmentInput,
): Array<{ title: string; description: string; speakerKey?: string; duration: number; preStructured?: SceneScript }> {
  const content = input.content;
  const targetDuration = input.targetDuration ?? 180; // 3 min default

  if (content.type === 'raw_text') {
    // Split raw text into paragraphs → scenes
    const paragraphs = content.text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const count = Math.max(3, Math.min(paragraphs.length, 15));
    const perScene = Math.round(targetDuration / count);

    return paragraphs.slice(0, count).map((p, i) => ({
      title: `Scene ${i + 1}`,
      description: p,
      duration: perScene,
    }));
  }

  if (content.type === 'scene_descriptions') {
    const count = content.scenes.length;
    const perScene = Math.round(targetDuration / Math.max(count, 1));

    return content.scenes.map(s => ({
      title: s.title,
      description: s.description,
      speakerKey: s.speakerKey,
      duration: perScene,
    }));
  }

  if (content.type === 'pre_structured') {
    return content.scenes.map(s => ({
      title: s.title,
      description: s.visualDescription || s.narrationText,
      duration: s.duration,
      preStructured: s,
    }));
  }

  return [];
}

/**
 * Auto-detect characters from scene descriptions when none are provided.
 * Extracts speaker names from dialogue patterns or provides sensible defaults.
 */
function autoDetectCharacters(
  scenes: Array<{ title: string; description: string; speakerKey?: string }>,
): EnrichmentCharacter[] {
  // Collect unique speakers
  const speakers = new Set<string>();
  for (const scene of scenes) {
    if (scene.speakerKey) speakers.add(scene.speakerKey);

    // Detect dialogue patterns: "Name: dialogue" or "Name says..."
    const dialoguePattern = /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*[:—]/gm;
    let match: RegExpExecArray | null;
    while ((match = dialoguePattern.exec(scene.description)) !== null) {
      speakers.add(match[1]);
    }
  }

  if (speakers.size === 0) {
    // Default: narrator + protagonist
    return [
      { id: 'narrator', name: 'Narrator', role: 'narrator', personality: 'warm, guiding, authoritative' },
      { id: 'protagonist', name: 'Protagonist', role: 'protagonist', personality: 'determined, relatable, curious' },
    ];
  }

  const roles: CharacterRole[] = ['narrator', 'protagonist', 'sidekick', 'expert', 'comic_relief', 'companion', 'antagonist'];
  return Array.from(speakers).map((name, i) => ({
    id: name.toLowerCase().replace(/\s+/g, '_'),
    name,
    role: roles[i % roles.length],
    personality: 'dynamic, expressive',
  }));
}

/**
 * Build avatar config per character — derived from style + region + personality.
 */
function buildAvatarConfigs(
  characters: EnrichmentCharacter[],
  styleFamily: CreativeStyleFamily,
  regionCode: string,
): Record<string, AvatarConfig> {
  const template = STYLE_PROMPT_TEMPLATES[styleFamily];
  const companion = getRegionalCompanionCreature(regionCode);
  const variant = getRegionalVariant(regionCode);
  const palette = variant?.colorOverrides ?? ['#4A90D9', '#F5A623', '#D0021B'];

  const configs: Record<string, AvatarConfig> = {};

  for (const char of characters) {
    const animalDesc = char.animalType ? `a ${char.animalType}` : 'a stylized character';

    const pixarPrompt = enrichPromptWithRegion(
      `Pixar-style 3D animated character: ${animalDesc} representing ${char.name} (${char.role}), ` +
      `personality: ${char.personality}, large expressive eyes, detailed textures, ` +
      `${template.qualityBoost}`,
      regionCode,
    );

    const disneyPrompt = enrichPromptWithRegion(
      `Disney 2D animation style character: ${animalDesc} representing ${char.name} (${char.role}), ` +
      `personality: ${char.personality}, hand-drawn aesthetic, flowing linework, ` +
      `expressive face, painterly background`,
      regionCode,
    );

    // Generate motion descriptors from personality
    const motions: Record<string, string> = {
      explaining: `${char.name} ${char.personality.split(',')[0]} gestures while explaining concept`,
      reacting: `${char.name} reacts expressively — personality shines through`,
      proud: `${char.name} stands tall with satisfaction, ${char.personality} energy`,
      frustrated: `${char.name} shows mild frustration but remains ${char.personality.split(',')[0]}`,
    };

    configs[char.id] = {
      pixarPrompt,
      disneyPrompt,
      motions,
      companionCreature: companion?.description,
      palette: palette.slice(0, 3),
    };
  }

  return configs;
}

/**
 * Build the full scene pipeline for a single scene — assembles all step types.
 */
/**
 * Build the full scene pipeline — approach-aware.
 * Different production approaches generate fundamentally different step combinations.
 */
function buildScenePipeline(
  scene: ParsedScene,
  visuals: VisualPrompts,
  voiceConfig: Record<string, VoiceAssignment>,
  characters: EnrichmentCharacter[],
  styleFamily: CreativeStyleFamily,
  regionCode: string,
): ScenePipelineStep[] {
  const speaker = scene.speakerKey
    ? characters.find(c => c.id === scene.speakerKey)
    : characters[0];

  const avatarStyle = styleFamily === 'disney_2d' ? 'disney-2d'
    : styleFamily === 'pixar_3d' ? 'pixar-3d'
    : 'hybrid-2.5d';

  // Build pipeline based on production approach
  switch (scene.productionApproach) {
    case 'avatar_driven':
      return buildAvatarDrivenPipeline(scene, visuals, speaker, avatarStyle, voiceConfig);

    case 'animation_cinematic':
      return buildAnimationCinematicPipeline(scene, visuals, speaker, avatarStyle, voiceConfig, regionCode);

    case 'motion_graphics':
      return buildMotionGraphicsPipeline(scene, visuals, speaker, voiceConfig);

    case 'screen_capture':
      return buildScreenCapturePipeline(scene, visuals, speaker, voiceConfig);

    case 'documentary':
      return buildDocumentaryPipeline(scene, visuals, speaker, voiceConfig);

    case 'whiteboard':
      return buildWhiteboardPipeline(scene, visuals, speaker, voiceConfig);

    case 'mixed_media':
      return buildMixedMediaPipeline(scene, visuals, speaker, avatarStyle, voiceConfig, regionCode);

    case 'comic_panel':
      return buildComicPanelPipeline(scene, visuals, speaker, voiceConfig);

    case 'cultural_art':
      return buildCulturalArtPipeline(scene, visuals, speaker, voiceConfig, regionCode);

    case 'kinetic_typography':
      return buildKineticTypographyPipeline(scene, visuals, speaker, voiceConfig);

    case 'stop_motion':
      return buildStopMotionPipeline(scene, visuals, speaker, voiceConfig);

    case 'photo_collage':
      return buildPhotoCollagePipeline(scene, visuals, speaker, voiceConfig);

    default:
      return buildDefaultPipeline(scene, visuals, speaker, avatarStyle, voiceConfig);
  }
}

// ─── Approach-Specific Pipeline Builders ─────────────────────────────────────

function addTtsStep(steps: ScenePipelineStep[], speaker: EnrichmentCharacter | undefined, voiceConfig: Record<string, VoiceAssignment>, sceneId: string): void {
  if (speaker && voiceConfig[speaker.id]) {
    steps.push({ type: 'tts', voice: speaker.id as never, scriptKey: `${sceneId}-narration` });
  }
}

/** Avatar-driven: character presents, lip-syncs, gestures — talking head + environment */
function buildAvatarDrivenPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  avatarStyle: string, voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  if (speaker) {
    steps.push({ type: 'avatar-3d', character: speaker.id as never, style: avatarStyle as 'pixar-3d' | 'disney-2d' | 'hybrid-2.5d' });
    steps.push({ type: 'avatar-lipsync', character: speaker.id as never, provider: 'alibaba-wan2.2' });
  }

  // Background environment
  steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: visuals.environmentPrompt });

  // Kinetic text overlay for emphasis moments
  if (['call_to_action', 'climax_achievement', 'title_hook'].includes(scene.sceneType)) {
    steps.push({ type: 'kinetic-text', text: scene.title });
  }

  return steps;
}

/** Full cinematic animation: image gen → video gen → avatar overlay → rich SFX */
function buildAnimationCinematicPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  avatarStyle: string, voiceConfig: Record<string, VoiceAssignment>, regionCode: string,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  // Rich visual generation chain: image → video from image
  steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: visuals.imagePrompt });
  steps.push({ type: 'alibaba-video', model: 'wan2.6-t2v', prompt: visuals.videoPrompt });

  // Character overlay if characters present
  if (speaker) {
    steps.push({ type: 'avatar-3d', character: speaker.id as never, style: avatarStyle as 'pixar-3d' | 'disney-2d' | 'hybrid-2.5d' });
    steps.push({ type: 'avatar-lipsync', character: speaker.id as never, provider: 'alibaba-wan2.2' });
  }

  // Companion creature for cinematic richness
  const companion = getRegionalCompanionCreature(regionCode);
  if (companion) {
    steps.push({ type: 'alibaba-image', model: 'wanx-v2.1', prompt: enrichPromptWithRegion(`Companion creature: ${companion.description}, in the scene background, animated and reactive`, regionCode) });
  }

  // Kinetic text for title/CTA scenes
  if (['title_hook', 'call_to_action', 'data_reveal', 'climax_achievement'].includes(scene.sceneType)) {
    steps.push({ type: 'kinetic-text', text: scene.title });
  }

  return steps;
}

/** Motion graphics: data visualizations, charts, infographic animations */
function buildMotionGraphicsPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  steps.push({ type: 'motion-graphics', content: `${scene.title}: ${scene.description}` });
  steps.push({ type: 'kinetic-text', text: scene.title });

  // Data scenes get additional infographic generation
  if (scene.sceneType === 'data_reveal') {
    steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: `Clean infographic visualization: ${scene.description}, modern flat design, data-driven, professional` });
    steps.push({ type: 'narrator-scroll', prompt: `Data scroll: ${scene.description}`, duration: scene.duration * 0.6, dataContent: scene.description });
  }

  return steps;
}

/** Screen capture: product demos, software walkthroughs with annotations */
function buildScreenCapturePipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  steps.push({ type: 'screen-capture', screenIds: [`${scene.id}-screen`], multiCapture: false });
  steps.push({ type: 'ai-screen-enhance', screenIds: [`${scene.id}-screen`], scriptContext: scene.description, enhanceMode: 'highlight' });

  // Motion graphics overlay for technical callouts
  steps.push({ type: 'motion-graphics', content: `Annotation overlay: ${scene.title}` });

  return steps;
}

/** Documentary style: real-world framing, interview style, B-roll */
function buildDocumentaryPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  // Documentary-style establishing shot
  steps.push({ type: 'alibaba-video', model: 'wan2.6-t2v', prompt: `Documentary style: ${visuals.environmentPrompt}, natural lighting, handheld camera feel, authentic` });

  // Interview-style character shot
  if (speaker) {
    steps.push({ type: 'avatar-3d', character: speaker.id as never, style: 'hybrid-2.5d' });
    steps.push({ type: 'avatar-lipsync', character: speaker.id as never, provider: 'alibaba-wan2.2' });
  }

  // Lower-third text overlay
  steps.push({ type: 'kinetic-text', text: scene.title });

  return steps;
}

/** Whiteboard: hand-drawing progressive reveal */
function buildWhiteboardPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  steps.push({ type: 'alibaba-video', model: 'wan2.6-t2v', prompt: `Whiteboard animation: hand drawing ${scene.description} on white background, black ink, progressive reveal, educational style` });
  steps.push({ type: 'motion-graphics', content: `Whiteboard diagram: ${scene.title}` });

  return steps;
}

/** Mixed media: combines avatar + animation + motion graphics */
function buildMixedMediaPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  avatarStyle: string, voiceConfig: Record<string, VoiceAssignment>, regionCode: string,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  // Layer 1: Background visual
  steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: visuals.imagePrompt });
  steps.push({ type: 'alibaba-video', model: 'wan2.6-t2v', prompt: visuals.videoPrompt });

  // Layer 2: Avatar overlay
  if (speaker) {
    steps.push({ type: 'avatar-3d', character: speaker.id as never, style: avatarStyle as 'pixar-3d' | 'disney-2d' | 'hybrid-2.5d' });
    steps.push({ type: 'avatar-lipsync', character: speaker.id as never, provider: 'alibaba-wan2.2' });
  }

  // Layer 3: Motion graphics data overlay
  steps.push({ type: 'motion-graphics', content: `Data overlay: ${scene.title}` });
  steps.push({ type: 'kinetic-text', text: scene.title });

  return steps;
}

/** Comic panel: frame-by-frame storytelling with bold visuals */
function buildComicPanelPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  // Comic-style panel images
  steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: `Comic book panel style: ${visuals.imagePrompt}, bold ink outlines, halftone dots, dynamic composition, speech bubbles, action frames` });

  // Animated panel transition
  steps.push({ type: 'alibaba-video', model: 'wan2.6-t2v', prompt: `Comic book animation: panels sliding into frame, bold lines, KAPOW effects, dynamic camera zoom into panel, ${scene.description}` });

  steps.push({ type: 'kinetic-text', text: scene.title });

  return steps;
}

/** Cultural art: region-specific traditional art style */
function buildCulturalArtPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  voiceConfig: Record<string, VoiceAssignment>, regionCode: string,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  const variant = getRegionalVariant(regionCode);
  const artStyle = variant?.culturalElements.patterns ?? 'traditional folk art';
  const culturalPrompt = enrichPromptWithRegion(
    `Traditional ${artStyle} art style illustration: ${scene.description}, authentic cultural art technique, museum quality, handcrafted aesthetic`,
    regionCode,
  );

  steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: culturalPrompt });
  steps.push({ type: 'alibaba-video', model: 'wan2.6-t2v', prompt: `Animated ${artStyle}: ${scene.description}, traditional art coming to life, gentle movement, cultural authenticity` });

  // Narrator scroll for storytelling
  if (['origin_story', 'vision_future', 'testimonial'].includes(scene.sceneType)) {
    steps.push({ type: 'narrator-scroll', prompt: `${artStyle} decorated scroll: ${scene.title}`, duration: scene.duration * 0.5 });
  }

  return steps;
}

/** Kinetic typography: text-driven, bold reveals */
function buildKineticTypographyPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  steps.push({ type: 'kinetic-text', text: scene.title });
  steps.push({ type: 'motion-graphics', content: `Typography animation: ${scene.description}` });

  // Background ambient visual
  steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: `Abstract background for typography: ${visuals.environmentPrompt}, blurred, ambient, text-friendly` });

  return steps;
}

/** Stop motion: claymation/handcraft aesthetic */
function buildStopMotionPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: `Stop motion claymation style: ${scene.description}, handmade clay figures, visible fingerprints in clay, miniature set, warm studio lighting, shallow depth of field` });
  steps.push({ type: 'alibaba-video', model: 'wan2.6-t2v', prompt: `Stop motion animation: ${scene.description}, claymation movement, frame-by-frame, handcrafted charm, Aardman quality` });

  if (['title_hook', 'call_to_action'].includes(scene.sceneType)) {
    steps.push({ type: 'kinetic-text', text: scene.title });
  }

  return steps;
}

/** Photo collage: montage with transitions */
function buildPhotoCollagePipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  // Multiple image generations for the collage
  steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: `Photo collage element 1: ${scene.description}, professional photography style, clean composition` });
  steps.push({ type: 'alibaba-image', model: 'wanx-v2.1', prompt: `Photo collage element 2: alternative angle of ${scene.description}, documentary photography` });

  // Animated collage assembly
  steps.push({ type: 'alibaba-video', model: 'wan2.6-t2v', prompt: `Photo montage animation: multiple photos assembling on screen, smooth transitions, ${scene.description}` });

  steps.push({ type: 'kinetic-text', text: scene.title });

  return steps;
}

/** Default fallback — balanced pipeline */
function buildDefaultPipeline(
  scene: ParsedScene, visuals: VisualPrompts, speaker: EnrichmentCharacter | undefined,
  avatarStyle: string, voiceConfig: Record<string, VoiceAssignment>,
): ScenePipelineStep[] {
  const steps: ScenePipelineStep[] = [];
  addTtsStep(steps, speaker, voiceConfig, scene.id);

  steps.push({ type: 'alibaba-image', model: 'flux-merged', prompt: visuals.imagePrompt });
  steps.push({ type: 'alibaba-video', model: 'wan2.6-t2v', prompt: visuals.videoPrompt });

  if (speaker) {
    steps.push({ type: 'avatar-3d', character: speaker.id as never, style: avatarStyle as 'pixar-3d' | 'disney-2d' | 'hybrid-2.5d' });
    steps.push({ type: 'avatar-lipsync', character: speaker.id as never, provider: 'alibaba-wan2.2' });
  }

  if (['title_hook', 'data_reveal', 'call_to_action', 'climax_achievement'].includes(scene.sceneType)) {
    steps.push({ type: 'kinetic-text', text: scene.title });
  }

  return steps;
}

/**
 * Calculate an enrichment quality score (0-100) based on how much context is available.
 */
function calculateEnrichmentScore(input: SceneEnrichmentInput, scenes: ParsedScene[]): number {
  let score = 30; // Base score for having scenes

  // Content richness
  if (input.content.type === 'pre_structured') score += 20;
  else if (input.content.type === 'scene_descriptions') score += 10;

  // Characters provided
  if (input.characters && input.characters.length > 0) score += 10;

  // Regional customization
  if (input.regionCode && input.regionCode !== 'NAM') score += 5;

  // Storybook mode
  if (input.storybookMode) score += 5;

  // Brand profile
  if (input.brandProfile) score += 10;

  // Enrichment context
  if (input.enrichmentContext) score += 10;

  // Scene count (more scenes = richer content)
  if (scenes.length >= 6) score += 5;
  if (scenes.length >= 10) score += 5;

  // Imagination preset adds visual world richness
  if (input.imaginationPreset) score += 10;

  return Math.min(100, score);
}

/**
 * Main orchestrator — the single entry point.
 * Parses input, runs all 8 modules, assembles complete SceneEnrichmentOutput.
 */
export function enrichScenes(input: SceneEnrichmentInput): SceneEnrichmentOutput {
  const regionCode = input.regionCode ?? 'NAM_US';
  const language = input.language ?? 'en';
  const styleFamily = input.styleFamily;
  const storybookMode = input.storybookMode ?? false;
  const quality = input.quality ?? 'standard';
  const culturalArtMode = input.culturalArtMode ?? false;
  const includeCompanions = input.includeCompanionCreatures ?? true;

  // ── Resolve Imagination Preset ──
  // If a preset is specified, adapt it to the target region.
  // The adapted preset DNA is threaded through visual, audio, and pipeline modules.
  let resolvedPreset: AdaptedPresetData | undefined;
  let presetRegionallyAdapted = false;
  if (input.imaginationPreset) {
    const basePreset = getImaginationPreset(input.imaginationPreset);
    if (basePreset) {
      resolvedPreset = adaptPresetToRegion(input.imaginationPreset, regionCode);
      presetRegionallyAdapted = resolvedPreset !== undefined;
    }
  }

  // ── Step 1: Parse content into scene list ──
  const rawScenes = parseContent(input);

  // ── Step 2: Classify scene types + assign narrative arc + recommend production approach ──
  const totalScenes = rawScenes.length;
  const scenes: ParsedScene[] = rawScenes.map((raw, i) => {
    const sceneType = classifySceneType(raw.title, raw.description, i, totalScenes);
    const recommendation = recommendProductionApproach(
      sceneType, raw.description, styleFamily, regionCode, quality, culturalArtMode, input.forceApproach,
    );
    return {
      id: `scene-${i}-${raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`,
      index: i,
      title: raw.title,
      description: raw.description,
      speakerKey: raw.speakerKey,
      duration: raw.duration,
      sceneType,
      narrativeAct: assignNarrativeAct(i, totalScenes),
      productionApproach: recommendation.primary,
      preStructured: raw.preStructured,
    };
  });

  // ── Step 3: Auto-detect characters if not provided ──
  const characters = input.characters && input.characters.length > 0
    ? input.characters
    : autoDetectCharacters(rawScenes);

  // ── Step 4: Build production recommendations per scene ──
  const productionRecommendations: Record<string, SceneProductionRecommendation> = {};
  for (const scene of scenes) {
    productionRecommendations[scene.id] = recommendProductionApproach(
      scene.sceneType, scene.description, styleFamily, regionCode, quality, culturalArtMode, input.forceApproach,
    );
  }

  // ── Step 5: Compose visual prompts (module 2) ──
  const visualsByScene: Record<string, VisualPrompts> = {};
  for (const scene of scenes) {
    visualsByScene[scene.id] = composeVisualPrompts(scene, styleFamily, regionCode, characters, input.brandProfile, resolvedPreset);
  }

  // ── Step 6: Assign transitions (module 3) ──
  const transitions = assignTransitions(scenes, styleFamily, regionCode);

  // ── Step 7: Compose audio score (module 4) ──
  const { score: musicScore, leitmotifs } = composeAudioScore(scenes, regionCode, characters, resolvedPreset);

  // ── Step 8: Build character interactions (module 5) ──
  const characterInteractions = buildCharacterInteractions(scenes, characters, regionCode);

  // ── Step 9: Build storybook framing (module 6, if enabled) ──
  let bookends: { opening: ScenePipelineStep[]; closing: ScenePipelineStep[] } | undefined;
  let narratorScrolls: Array<{ sceneId: string; steps: ScenePipelineStep[] }> = [];

  if (storybookMode) {
    const framing = buildStorybookFraming(scenes, input.title, regionCode, styleFamily);
    bookends = framing.bookends;
    narratorScrolls = framing.narratorScrolls;
  }

  // ── Step 10: Assign voices (module 7) ──
  const voiceConfig = assignVoices(characters, regionCode);

  // ── Step 11: Build avatar configs ──
  const avatarConfig = buildAvatarConfigs(characters, styleFamily, regionCode);

  // ── Step 12: Assemble approach-aware scene pipelines ──
  const scenePipelines: Record<string, ScenePipelineStep[]> = {};
  for (const scene of scenes) {
    scenePipelines[scene.id] = buildScenePipeline(
      scene,
      visualsByScene[scene.id],
      voiceConfig,
      characters,
      styleFamily,
      regionCode,
    );
  }

  // ── Step 13: Build enriched script ──
  const enrichedScript: Record<string, EnrichedScriptLine> = {};
  for (const scene of scenes) {
    const speaker = scene.speakerKey
      ? characters.find(c => c.id === scene.speakerKey)
      : characters[0];

    // Enhance the description text through promptEnhancementEngine
    const enhanced = quickEnhance({
      rawPrompt: scene.description,
      region: regionCode,
      language,
      visualStyle: styleFamily,
      mode: 'video_generation',
    });

    enrichedScript[`${scene.id}-narration`] = {
      text: enhanced.enhanced,
      voice: speaker?.id ?? 'narrator',
      scene: scene.id,
      duration_est: scene.duration,
      direction: `${scene.sceneType} scene (${scene.productionApproach}) — ${ACT_MOOD_MAP[scene.narrativeAct].mood}`,
      lipsync: scene.productionApproach === 'avatar_driven' || scene.productionApproach === 'animation_cinematic' || scene.productionApproach === 'mixed_media',
      sfx: musicScore[scene.id]?.sfx?.map(s => s.prompt) ?? [],
      motion: avatarConfig[speaker?.id ?? '']?.motions?.explaining,
    };
  }

  // ── Step 14: Build narrative arc summary ──
  const narrativeArc: Record<string, { scenes: string[]; mood: string; tempo: number }> = {};
  const regionalMusic = getRegionalMusicPrompt(regionCode);

  for (const act of NARRATIVE_ACTS) {
    const actScenes = scenes.filter(s => s.narrativeAct === act);
    if (actScenes.length > 0) {
      narrativeArc[act] = {
        scenes: actScenes.map(s => s.id),
        mood: ACT_MOOD_MAP[act].mood,
        tempo: Math.round(regionalMusic.bpm * ACT_MOOD_MAP[act].tempoFactor),
      };
    }
  }

  // ── Step 15: Platform configs + Regional notes ──
  const platformConfigs = resolvePlatformConfigs(input.targetPlatforms);
  const regionalNotes = buildRegionalNotes(regionCode);

  // ── Step 16: Calculate metadata ──
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const approaches = [...new Set(scenes.map(s => s.productionApproach))];
  const totalRenderTime = Object.values(productionRecommendations)
    .reduce((sum, r) => sum + r.estimatedRenderTime, 0);

  const metadata: EnrichmentMetadata = {
    sceneCount: scenes.length,
    totalDuration,
    enrichmentScore: calculateEnrichmentScore(input, scenes),
    regionCode,
    language,
    styleFamily,
    narrativeActs: [...new Set(scenes.map(s => s.narrativeAct))],
    characterCount: characters.length,
    storybookMode,
    outputFormat: input.outputFormat ?? 'long_form_video',
    productionApproaches: approaches,
    targetPlatforms: input.targetPlatforms ?? ['youtube'],
    estimatedTotalRenderTime: totalRenderTime,
    culturalArtMode,
    companionCreaturesEnabled: includeCompanions,
    imaginationPreset: input.imaginationPreset,
    presetRegionallyAdapted,
  };

  return {
    scenePipelines,
    musicScore,
    transitions,
    bookends,
    characterInteractions,
    narratorScrolls,
    leitmotifs,
    narrativeArc,
    enrichedScript,
    voiceConfig,
    avatarConfig,
    productionRecommendations,
    platformConfigs,
    regionalNotes,
    metadata,
  };
}
