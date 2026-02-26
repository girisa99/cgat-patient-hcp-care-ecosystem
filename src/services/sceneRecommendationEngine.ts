/**
 * Scene Recommendation Engine — AI that SUGGESTS, never RESTRICTS
 *
 * Core principle: Every recommendation is dismissible. The user always has
 * the final say. We provide context-aware suggestions to make creation
 * EASIER, not to limit options.
 *
 * Recommendation types:
 * - Style: "This scene would look great in cinematic style based on your script"
 * - B-roll: "Add stock footage of [X] to support the voiceover"
 * - Duration: "This scene's script needs ~20s at normal pace, currently set to 10s"
 * - Transition: "A fade transition would work well between these different styles"
 * - Music: "The mood shifts here — consider changing background music"
 * - Format: "This scene works well as a standalone TikTok clip"
 * - Caption: "Enable animated captions for higher engagement"
 * - Thumbnail: "Scene 3 has the strongest visual for a thumbnail"
 * - Clip: "Scenes 1+2 together make a strong 30s social clip"
 * - Reorder: "Move the testimonial before the CTA for better conversion"
 * - Add scene: "Consider adding a data/stats scene after the problem statement"
 * - Transcreation: "For MENA region, suggest wardrobe change from casual to formal"
 *
 * Integrates with:
 * - Brand Intelligence (tone, style preferences)
 * - Google Places (real business data for context)
 * - Regional Transcreation (cultural adaptation suggestions)
 * - Content Quality Agent (quality scoring)
 *
 * @see src/services/sceneCompositionEngine.ts — scene operations
 * @see src/components/genie-hub/composition-studio/types.ts — types
 */

import type {
  CompositionScene,
  SceneRecommendation,
  SceneStyle,
  CompositionElementType,
  ContentScenario,
  VisualSource,
  MotionPreset,
  SlideFramework,
  CharacterStyle,
  CharacterScale,
  RenderingMode,
  SceneRenderConfig,
  ChartType,
  DataSource,
  ContentVerification,
  CrossFormatConversionType,
  LanguageQualityCheck,
  CitationConfig,
} from '@/components/genie-hub/composition-studio/types';

// ─── Recommendation Generator ────────────────────────────────────────────────

export interface RecommendationContext {
  /** Target audience description */
  audience?: string;
  /** Brand tone (e.g., 'professional', 'playful', 'luxury') */
  brandTone?: string;
  /** Target region for transcreation */
  targetRegion?: string;
  /** Content intent (promo, tutorial, testimonial, etc.) */
  intent?: string;
  /** Content scenario (product_video, explainer, investor_pitch, etc.) */
  scenario?: ContentScenario;
  /** Business tier from economy profiles */
  businessTier?: 'nano' | 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  /** Google Places data available */
  hasGooglePlaces?: boolean;
  /** Target platforms */
  targetPlatforms?: string[];
  /** Whether user has screen recordings available */
  hasScreenRecordings?: boolean;
  /** Whether user has uploaded product images/screenshots */
  hasProductAssets?: boolean;
  /** Product/app name for context */
  productName?: string;
  /** Industry vertical */
  industry?: string;
}

/** Generate recommendations for a set of scenes */
export function generateRecommendations(
  scenes: CompositionScene[],
  context: RecommendationContext = {},
): SceneRecommendation[] {
  const recommendations: SceneRecommendation[] = [];

  // Run all recommendation generators
  recommendations.push(...recommendDurationFixes(scenes));
  recommendations.push(...recommendTransitions(scenes));
  recommendations.push(...recommendStyles(scenes, context));
  recommendations.push(...recommendBRoll(scenes));
  recommendations.push(...recommendClips(scenes, context));
  recommendations.push(...recommendMusicChanges(scenes));
  recommendations.push(...recommendCaptions(scenes, context));
  recommendations.push(...recommendThumbnails(scenes));
  recommendations.push(...recommendMissingScenes(scenes, context));
  recommendations.push(...recommendReordering(scenes));
  recommendations.push(...recommendTranscreation(scenes, context));
  recommendations.push(...recommendFormats(scenes, context));

  // Scenario-based & visual pipeline recommendations
  recommendations.push(...recommendScenarioPipelines(scenes, context));
  recommendations.push(...recommendVisualSources(scenes, context));
  recommendations.push(...recommendVisualEnhancements(scenes, context));
  recommendations.push(...recommendMotionPresets(scenes, context));
  recommendations.push(...recommendSizeVariants(scenes, context));
  recommendations.push(...recommendCombinationChains(scenes, context));

  // Frameworks, character styles, and rendering modes
  recommendations.push(...recommendSlideFrameworks(scenes, context));
  recommendations.push(...recommendCharacterStyles(scenes, context));
  recommendations.push(...recommendRenderingModes(scenes, context));

  // Data, verification, spell check, cross-format
  recommendations.push(...recommendVisualizationTypes(scenes, context));
  recommendations.push(...recommendDataSources(scenes, context));
  recommendations.push(...recommendContentVerification(scenes, context));
  recommendations.push(...recommendSpellGrammar(scenes, context));
  recommendations.push(...recommendCrossFormatConversions(scenes, context));
  recommendations.push(...recommendCitations(scenes, context));

  // Sort by confidence (highest first)
  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

// ─── Duration Recommendations ────────────────────────────────────────────────

function recommendDurationFixes(scenes: CompositionScene[]): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    const scriptLength = scene.voiceover.text.length;
    if (scriptLength === 0) continue;

    // Average speaking rate: ~150 words/min = ~2.5 words/sec = ~13 chars/sec
    const estimatedDuration = Math.ceil(scriptLength / 13);
    const diff = Math.abs(estimatedDuration - scene.duration);

    if (diff > 5) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'duration',
        sceneId: scene.id,
        title: `Adjust duration for "${scene.title}"`,
        description: `Script length suggests ~${estimatedDuration}s at normal pace. Currently set to ${scene.duration}s.`,
        confidence: Math.min(0.9, diff / 20),
        reason: estimatedDuration > scene.duration
          ? 'The voiceover may feel rushed at the current duration'
          : 'There may be dead air at the current duration',
        action: { duration: estimatedDuration },
      });
    }
  }

  return recs;
}

// ─── Transition Recommendations ──────────────────────────────────────────────

function recommendTransitions(scenes: CompositionScene[]): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (let i = 0; i < scenes.length - 1; i++) {
    const current = scenes[i];
    const next = scenes[i + 1];

    // If adjacent scenes have different visual types, suggest a transition
    if (current.visual.type !== next.visual.type && !current.visual.transitionOut) {
      const transitionType = getRecommendedTransition(current.visual.type, next.visual.type);

      recs.push({
        id: crypto.randomUUID(),
        type: 'transition',
        sceneId: current.id,
        title: `Add ${transitionType} transition`,
        description: `Between "${current.title}" (${current.visual.type}) and "${next.title}" (${next.visual.type})`,
        confidence: 0.7,
        reason: 'Different visual styles benefit from smooth transitions',
        action: { transitionOut: transitionType, nextSceneTransitionIn: transitionType },
      });
    }
  }

  return recs;
}

function getRecommendedTransition(fromType: CompositionElementType, toType: CompositionElementType): string {
  // Avatar to video or vice versa → fade
  if ((fromType === 'avatar' && toType === 'video') || (fromType === 'video' && toType === 'avatar')) {
    return 'fade';
  }
  // 3D scenes → zoom
  if (fromType === '3d' || toType === '3d') return 'zoom';
  // Slides → slide
  if (fromType === 'slide' || toType === 'slide') return 'slide';
  // Default → fade
  return 'fade';
}

// ─── Style Recommendations ───────────────────────────────────────────────────

function recommendStyles(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    if (scene.sceneStyle) continue; // Already has a style

    const suggestedStyle = inferStyleFromContext(scene, context);
    if (suggestedStyle) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'style',
        sceneId: scene.id,
        title: `Try "${suggestedStyle}" style`,
        description: `Based on ${context.brandTone ? `your "${context.brandTone}" brand tone` : 'the scene content'}`,
        confidence: 0.6,
        reason: `The "${suggestedStyle}" style complements this type of content`,
        action: { sceneStyle: suggestedStyle },
      });
    }
  }

  return recs;
}

function inferStyleFromContext(scene: CompositionScene, context: RecommendationContext): SceneStyle | null {
  // Match brand tone to style
  const toneToStyle: Record<string, SceneStyle> = {
    professional: 'corporate',
    playful: 'playful',
    luxury: 'luxury',
    authentic: 'documentary',
    modern: 'futuristic',
    traditional: 'cultural',
    minimal: 'minimalist',
  };

  if (context.brandTone && toneToStyle[context.brandTone]) {
    return toneToStyle[context.brandTone];
  }

  // Infer from visual type
  switch (scene.visual.type) {
    case 'avatar': return 'corporate';
    case '3d': return 'futuristic';
    case 'cinematic': return 'cinematic';
    case 'animation': return 'playful';
    default: return null;
  }
}

// ─── B-Roll Recommendations ──────────────────────────────────────────────────

function recommendBRoll(scenes: CompositionScene[]): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    // Scenes with only TTS and no engaging visual could benefit from B-roll
    if (
      scene.voiceover.type === 'tts' &&
      scene.visual.type === 'static' &&
      (!scene.bRoll || scene.bRoll.length === 0)
    ) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'broll',
        sceneId: scene.id,
        title: 'Add B-roll footage',
        description: `"${scene.title}" has a static visual with voiceover — B-roll would add visual interest`,
        confidence: 0.75,
        reason: 'Static visuals with voiceover benefit from supplementary footage',
        action: {
          bRoll: {
            source: 'stock',
            position: 'fullscreen',
            searchQuery: extractBRollQuery(scene.voiceover.text),
          },
        },
      });
    }

    // Long scenes (>30s) without B-roll
    if (scene.duration > 30 && (!scene.bRoll || scene.bRoll.length === 0)) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'broll',
        sceneId: scene.id,
        title: 'Add B-roll to long scene',
        description: `"${scene.title}" is ${scene.duration}s — B-roll can maintain viewer attention`,
        confidence: 0.5,
        reason: 'Scenes longer than 30 seconds benefit from visual variety',
        action: {
          bRoll: {
            source: 'stock',
            position: 'pip_bottomright',
            searchQuery: extractBRollQuery(scene.voiceover.text),
          },
        },
      });
    }
  }

  return recs;
}

function extractBRollQuery(text: string): string {
  // Extract key nouns/themes from script for B-roll search
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  // Return first 3 meaningful words as search query
  return words.slice(0, 3).join(' ') || 'business professional';
}

// ─── Clip Recommendations ────────────────────────────────────────────────────

function recommendClips(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    if (scene.isClipCandidate) continue;

    // Short, high-energy scenes are good clip candidates
    if (scene.duration <= 30 && scene.visual.type !== 'static') {
      const platforms = context.targetPlatforms || ['tiktok', 'instagram', 'youtube_shorts'];
      recs.push({
        id: crypto.randomUUID(),
        type: 'clip',
        sceneId: scene.id,
        title: `Extract as social clip`,
        description: `"${scene.title}" (${scene.duration}s) could work as a standalone clip`,
        confidence: 0.6,
        reason: 'Short, visual scenes perform well as social media clips',
        action: { isClipCandidate: true, suggestedPlatforms: platforms },
      });
    }

    // Intro/hook scenes are always good clips
    if (scene.title.toLowerCase().includes('intro') || scene.title.toLowerCase().includes('hook')) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'clip',
        sceneId: scene.id,
        title: 'Use intro as teaser clip',
        description: 'Introduction scenes make great teaser content for social media',
        confidence: 0.8,
        reason: 'Hook/intro scenes have the highest engagement potential',
        action: { isClipCandidate: true, suggestedPlatforms: ['tiktok', 'instagram', 'youtube_shorts'] },
      });
    }
  }

  return recs;
}

// ─── Music Recommendations ───────────────────────────────────────────────────

function recommendMusicChanges(scenes: CompositionScene[]): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  // Check if any scenes have background music configured
  const scenesWithMusic = scenes.filter(s => s.backgroundMusic?.enabled);
  const scenesWithoutMusic = scenes.filter(s => !s.backgroundMusic?.enabled);

  // If some scenes have music but others don't, suggest consistency
  if (scenesWithMusic.length > 0 && scenesWithoutMusic.length > 0 && scenesWithoutMusic.length <= 3) {
    for (const scene of scenesWithoutMusic) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'music',
        sceneId: scene.id,
        title: 'Add background music',
        description: `"${scene.title}" doesn't have background music while other scenes do`,
        confidence: 0.5,
        reason: 'Consistent background music creates a more cohesive experience',
        action: { backgroundMusic: { enabled: true, source: 'generate' } },
      });
    }
  }

  return recs;
}

// ─── Caption Recommendations ─────────────────────────────────────────────────

function recommendCaptions(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  const hasCaptions = scenes.some(s => s.captionOverrides?.enabled);
  if (hasCaptions) return recs; // Already using captions

  // Recommend captions for social-targeted content
  const socialPlatforms = ['tiktok', 'instagram', 'facebook', 'linkedin', 'twitter'];
  const targetsSocial = context.targetPlatforms?.some(p => socialPlatforms.includes(p));

  if (targetsSocial) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'caption',
      title: 'Enable auto-captions',
      description: '85% of social media videos are watched without sound — captions increase engagement',
      confidence: 0.85,
      reason: 'Social media viewers predominantly watch without sound',
      action: { captionOverrides: { enabled: true, style: 'animated', position: 'bottom' } },
    });
  }

  return recs;
}

// ─── Thumbnail Recommendations ───────────────────────────────────────────────

function recommendThumbnails(scenes: CompositionScene[]): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  // Find the best scene for a thumbnail
  const scoredScenes = scenes.map(scene => ({
    scene,
    score: thumbnailScore(scene),
  })).sort((a, b) => b.score - a.score);

  const best = scoredScenes[0];
  if (best && best.score > 0.5 && !best.scene.thumbnailConfig?.customUrl) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'thumbnail',
      sceneId: best.scene.id,
      title: `Use "${best.scene.title}" for thumbnail`,
      description: 'This scene has the strongest visual for a project thumbnail',
      confidence: best.score,
      reason: `Score: visual impact (${best.scene.visual.type}), duration, and position`,
      action: { thumbnailConfig: { autoGenerate: true, style: 'branded' } },
    });
  }

  return recs;
}

function thumbnailScore(scene: CompositionScene): number {
  let score = 0.3; // base

  // Visual type bonus
  const typeScores: Record<string, number> = {
    cinematic: 0.4, video: 0.3, avatar: 0.25, '3d': 0.35,
    animation: 0.2, static: 0.1, broll: 0.15,
  };
  score += typeScores[scene.visual.type] || 0.1;

  // Has style variants = more visual options
  if (scene.styleVariants?.length) score += 0.1;

  // Position bonus (intro scenes make good thumbnails)
  if (scene.order <= 2) score += 0.1;

  return Math.min(1, score);
}

// ─── Missing Scene Recommendations ──────────────────────────────────────────

function recommendMissingScenes(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];
  const titles = scenes.map(s => s.title.toLowerCase());

  // Check for common missing scenes
  if (!titles.some(t => t.includes('intro') || t.includes('hook') || t.includes('opening'))) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'add_scene',
      title: 'Add an intro/hook scene',
      description: 'A strong opening hook increases viewer retention',
      confidence: 0.8,
      reason: 'Videos without a hook in the first 3 seconds lose most viewers',
      action: { template: 'cinematic_intro', position: 'start' },
    });
  }

  if (!titles.some(t => t.includes('cta') || t.includes('call to action') || t.includes('closing'))) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'add_scene',
      title: 'Add a call-to-action scene',
      description: 'End with a clear CTA to drive viewer action',
      confidence: 0.85,
      reason: 'Content without a CTA has significantly lower conversion rates',
      action: { template: 'talking_head', position: 'end', title: 'Call to Action' },
    });
  }

  // For promo content, suggest testimonial if missing
  if (context.intent === 'promo' && !titles.some(t => t.includes('testimonial') || t.includes('social proof'))) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'add_scene',
      title: 'Add a testimonial scene',
      description: 'Social proof increases trust and conversion',
      confidence: 0.65,
      reason: 'Promotional content performs better with customer testimonials',
      action: { template: 'testimonial', position: 'before_cta' },
    });
  }

  // For tutorial content, suggest data scene if missing
  if (context.intent === 'tutorial' && !titles.some(t => t.includes('data') || t.includes('stat'))) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'add_scene',
      title: 'Add a data/stats scene',
      description: 'Key metrics reinforce the educational value',
      confidence: 0.5,
      reason: 'Tutorial content benefits from supporting data points',
      action: { template: 'data_visualization', position: 'before_cta' },
    });
  }

  return recs;
}

// ─── Reorder Recommendations ─────────────────────────────────────────────────

function recommendReordering(scenes: CompositionScene[]): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  // Check if CTA is not at the end
  const ctaIdx = scenes.findIndex(s =>
    s.title.toLowerCase().includes('cta') || s.title.toLowerCase().includes('call to action')
  );
  if (ctaIdx >= 0 && ctaIdx < scenes.length - 2) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'reorder',
      sceneId: scenes[ctaIdx].id,
      title: 'Move CTA closer to end',
      description: `"${scenes[ctaIdx].title}" is at position ${ctaIdx + 1} of ${scenes.length} — CTAs work best near the end`,
      confidence: 0.7,
      reason: 'Call-to-action scenes convert better when placed after all supporting content',
      action: { moveToIndex: scenes.length - 1 },
    });
  }

  // Check if testimonial is before problem statement
  const testimonialIdx = scenes.findIndex(s => s.title.toLowerCase().includes('testimonial'));
  const problemIdx = scenes.findIndex(s =>
    s.title.toLowerCase().includes('problem') || s.title.toLowerCase().includes('pain')
  );
  if (testimonialIdx >= 0 && problemIdx >= 0 && testimonialIdx < problemIdx) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'reorder',
      sceneId: scenes[testimonialIdx].id,
      title: 'Move testimonial after problem statement',
      description: 'Social proof is more effective after the audience understands the problem',
      confidence: 0.6,
      reason: 'Problem → Solution → Proof is a proven storytelling structure',
      action: { moveToIndex: problemIdx + 1 },
    });
  }

  return recs;
}

// ─── Transcreation Recommendations ──────────────────────────────────────────

function recommendTranscreation(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];
  if (!context.targetRegion) return recs;

  const regionSuggestions: Record<string, {
    wardrobe?: string;
    companion?: string;
    music?: string;
    setting?: string;
  }> = {
    'in': { wardrobe: 'Traditional Indian formal', companion: 'Family-oriented', music: 'Bollywood acoustic', setting: 'Vibrant market or modern office' },
    'sa': { wardrobe: 'Thobe/Abaya', companion: 'Male presenter preferred', music: 'Oud-based ambient', setting: 'Modern Gulf architecture' },
    'jp': { wardrobe: 'Minimal, clean-cut', companion: 'Solo presenter', music: 'Gentle electronic/ambient', setting: 'Zen garden or tech office' },
    'kr': { wardrobe: 'K-fashion trendy', companion: 'Youth-oriented duo', music: 'K-pop influenced', setting: 'Neon cityscape' },
    'ng': { wardrobe: 'Ankara/Agbada', companion: 'Community group', music: 'Afrobeats', setting: 'Lagos modern' },
    'br': { wardrobe: 'Casual professional', companion: 'Friendly group', music: 'Bossa nova/sertanejo', setting: 'Urban Brazilian' },
  };

  const regionCode = context.targetRegion.substring(0, 2).toLowerCase();
  const suggestions = regionSuggestions[regionCode];
  if (!suggestions) return recs;

  for (const scene of scenes) {
    if (scene.transcreationOverrides) continue; // Already has overrides

    if (scene.visual.type === 'avatar') {
      recs.push({
        id: crypto.randomUUID(),
        type: 'transcreation',
        sceneId: scene.id,
        title: `Adapt "${scene.title}" for ${context.targetRegion}`,
        description: `Suggest regional wardrobe, music, and setting changes`,
        confidence: 0.7,
        reason: 'Cultural adaptation (transcreation) dramatically improves regional engagement vs. simple translation',
        action: {
          transcreationOverrides: {
            regionCode: context.targetRegion,
            ...suggestions,
          },
        },
      });
    }
  }

  return recs;
}

// ─── Format Recommendations ──────────────────────────────────────────────────

function recommendFormats(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  // If project is > 2 min and no shorts format, suggest it
  if (totalDuration > 120) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'format',
      title: 'Generate short clips',
      description: `Your project is ${Math.round(totalDuration / 60)}min — extract 15-60s clips for social`,
      confidence: 0.75,
      reason: 'Long-form content repurposed as short clips extends reach significantly',
      action: { outputFormats: ['video_9_16', 'video_1_1'] },
    });
  }

  // If any scene has voiceover, suggest podcast audio extraction
  const hasVoiceover = scenes.some(s => s.voiceover.type !== 'none');
  if (hasVoiceover && totalDuration > 60) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'format',
      title: 'Extract podcast audio',
      description: 'Repurpose the voiceover as a podcast episode or audio clip',
      confidence: 0.5,
      reason: 'Audio content reaches audiences during commutes and workouts',
      action: { outputFormats: ['audio_only'] },
    });
  }

  // If scenes have slides, suggest presentation export
  const hasSlides = scenes.some(s => s.visual.type === 'slide');
  if (hasSlides) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'format',
      title: 'Export as presentation',
      description: 'Generate a downloadable slide deck from your slide scenes',
      confidence: 0.7,
      reason: 'Slide scenes can be exported as standalone presentations',
      action: { outputFormats: ['slide_image'] },
    });
  }

  return recs;
}

// ─── Scenario Pipeline Recommendations ───────────────────────────────────────

/** Scenario-aware pipeline recommendations with full combination chains */

interface ScenarioPipelineTemplate {
  scenario: ContentScenario;
  description: string;
  recommendedSceneTypes: Array<{
    title: string;
    visualType: CompositionElementType;
    visualSource: VisualSource;
    motionPreset: MotionPreset;
    style: SceneStyle;
    duration: number;
    hasBRoll: boolean;
  }>;
  pipelineChain: Array<{ step: number; label: string; pipelineId: string; description: string }>;
}

const SCENARIO_PIPELINES: ScenarioPipelineTemplate[] = [
  {
    scenario: 'product_video',
    description: 'Software/app showcase with screen captures, AI-enhanced visuals, and voiceover',
    recommendedSceneTypes: [
      { title: 'Hook / Problem', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'cinematic', duration: 8, hasBRoll: false },
      { title: 'Product Introduction', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 15, hasBRoll: false },
      { title: 'Feature Demo 1', visualType: 'screen_recording', visualSource: 'screen_capture_enhanced', motionPreset: 'slow_zoom_in', style: 'minimalist', duration: 20, hasBRoll: true },
      { title: 'Feature Demo 2', visualType: 'screen_recording', visualSource: 'screen_capture_enhanced', motionPreset: 'tracking_shot', style: 'minimalist', duration: 20, hasBRoll: true },
      { title: 'AI-Enhanced Screenshots', visualType: 'static', visualSource: 'ai_regenerated', motionPreset: 'parallax', style: 'corporate', duration: 10, hasBRoll: false },
      { title: 'Social Proof', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'corporate', duration: 12, hasBRoll: false },
      { title: 'CTA', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'slow_zoom_out', style: 'corporate', duration: 8, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Screen Capture', pipelineId: 'screen-capture', description: 'Record or import product screens' },
      { step: 2, label: 'AI Enhance Screens', pipelineId: 'image-enhance', description: 'Upscale, denoise, add annotations' },
      { step: 3, label: 'Generate Script', pipelineId: 'ai-universal-processor', description: 'Auto-generate voiceover script from product context' },
      { step: 4, label: 'AI Visuals from Script', pipelineId: 'video-generate', description: 'Generate cinematic/animated visuals for non-screen scenes' },
      { step: 5, label: 'TTS Voiceover', pipelineId: 'text-to-speech', description: 'Generate voice from script' },
      { step: 6, label: 'Add Captions', pipelineId: 'caption-generate', description: 'Auto-generate captions for accessibility' },
      { step: 7, label: 'Assemble', pipelineId: 'video-assembly', description: 'Stitch all scenes with transitions' },
      { step: 8, label: 'Multi-Size Export', pipelineId: 'pipeline-editor-processor', description: 'Export in 16:9, 9:16, 1:1' },
    ],
  },
  {
    scenario: 'explainer',
    description: 'How-it-works explainer with animated visuals, whiteboard, and clear narration',
    recommendedSceneTypes: [
      { title: 'Problem Statement', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'hand_drawn', duration: 12, hasBRoll: false },
      { title: 'Solution Overview', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'hand_drawn', duration: 20, hasBRoll: false },
      { title: 'Step 1', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'hand_drawn', duration: 15, hasBRoll: true },
      { title: 'Step 2', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'hand_drawn', duration: 15, hasBRoll: true },
      { title: 'Step 3', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'hand_drawn', duration: 15, hasBRoll: true },
      { title: 'Result / Benefit', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_out', style: 'playful', duration: 10, hasBRoll: false },
      { title: 'CTA', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 8, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Script Generation', pipelineId: 'ai-universal-processor', description: 'Generate step-by-step explainer script' },
      { step: 2, label: 'Whiteboard Animation', pipelineId: 'video-generate', description: 'Generate hand-drawn animation frames' },
      { step: 3, label: 'Motion Apply', pipelineId: 'pipeline-editor-processor', description: 'Apply kinetic text and morph animations' },
      { step: 4, label: 'TTS Narration', pipelineId: 'text-to-speech', description: 'Clear, paced narration voice' },
      { step: 5, label: 'Background Music', pipelineId: 'audio-mixer', description: 'Light, upbeat background music' },
      { step: 6, label: 'Assemble', pipelineId: 'video-assembly', description: 'Stitch with smooth transitions' },
    ],
  },
  {
    scenario: 'investor_pitch',
    description: 'Investor deck with live data, slides, avatar presenter, and compelling visuals',
    recommendedSceneTypes: [
      { title: 'Vision Statement', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'luxury', duration: 12, hasBRoll: false },
      { title: 'Market Opportunity', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 20, hasBRoll: false },
      { title: 'Product Demo', visualType: 'screen_recording', visualSource: 'screen_capture_enhanced', motionPreset: 'slow_zoom_in', style: 'corporate', duration: 30, hasBRoll: false },
      { title: 'Traction & Metrics', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'futuristic', duration: 15, hasBRoll: false },
      { title: 'Business Model', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'minimalist', duration: 15, hasBRoll: false },
      { title: 'Team', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 12, hasBRoll: true },
      { title: 'Ask / CTA', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_out', style: 'luxury', duration: 10, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Google Places Enrich', pipelineId: 'local-business-enrichment', description: 'Pull live business data, reviews, competitors' },
      { step: 2, label: 'Brand Intelligence', pipelineId: 'ai-universal-processor', description: 'Economy profile + STORM analysis' },
      { step: 3, label: 'Script Generation', pipelineId: 'ai-universal-processor', description: 'Investor-optimized script with data points' },
      { step: 4, label: 'Slide Generation', pipelineId: 'slides-generate', description: 'Auto-generate presentation slides' },
      { step: 5, label: 'Screen Capture + Enhance', pipelineId: 'image-enhance', description: 'AI-enhanced product demo screens' },
      { step: 6, label: 'Avatar + Lip Sync', pipelineId: 'avatar-generate', description: 'Professional avatar presenter' },
      { step: 7, label: 'Data Visualization', pipelineId: 'video-generate', description: 'Animated charts and metrics' },
      { step: 8, label: 'Assemble + Export', pipelineId: 'video-assembly', description: 'Full deck + video + slide export' },
    ],
  },
  {
    scenario: 'social_promo',
    description: 'Short, punchy social media content optimized for vertical platforms',
    recommendedSceneTypes: [
      { title: 'Hook (3s)', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'whip_pan', style: 'street', duration: 3, hasBRoll: false },
      { title: 'Problem', visualType: 'video', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'playful', duration: 5, hasBRoll: false },
      { title: 'Solution', visualType: 'video', visualSource: 'ai_from_script', motionPreset: 'tracking_shot', style: 'playful', duration: 8, hasBRoll: false },
      { title: 'Demo Flash', visualType: 'screen_recording', visualSource: 'screen_capture_enhanced', motionPreset: 'slow_zoom_in', style: 'minimalist', duration: 6, hasBRoll: false },
      { title: 'Social Proof', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 4, hasBRoll: false },
      { title: 'CTA', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 4, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Script (Short-Form)', pipelineId: 'ai-universal-processor', description: 'Punchy, hook-first script for social' },
      { step: 2, label: 'AI Visuals', pipelineId: 'video-generate', description: 'Fast-paced AI-generated clips' },
      { step: 3, label: 'Music + SFX', pipelineId: 'audio-mixer', description: 'Trending audio, sound effects' },
      { step: 4, label: 'Animated Captions', pipelineId: 'caption-generate', description: 'Bold, animated karaoke captions' },
      { step: 5, label: 'Multi-Size', pipelineId: 'pipeline-editor-processor', description: '9:16 primary + 1:1 + 16:9' },
    ],
  },
  {
    scenario: 'webinar_recording',
    description: 'Professional webinar/webcast with screen share, avatar PiP, and slides',
    recommendedSceneTypes: [
      { title: 'Welcome / Intro', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 20, hasBRoll: false },
      { title: 'Agenda Slide', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 10, hasBRoll: false },
      { title: 'Content Section 1', visualType: 'screen_recording', visualSource: 'screen_capture_raw', motionPreset: 'slow_zoom_in', style: 'corporate', duration: 60, hasBRoll: false },
      { title: 'Content Section 2', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'corporate', duration: 45, hasBRoll: false },
      { title: 'Demo', visualType: 'screen_recording', visualSource: 'screen_capture_enhanced', motionPreset: 'tracking_shot', style: 'minimalist', duration: 60, hasBRoll: false },
      { title: 'Q&A', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 30, hasBRoll: false },
      { title: 'Wrap-Up + CTA', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'slow_zoom_out', style: 'corporate', duration: 15, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Slide Generation', pipelineId: 'slides-generate', description: 'Generate presentation slides' },
      { step: 2, label: 'Screen Capture', pipelineId: 'screen-capture', description: 'Record product demo sections' },
      { step: 3, label: 'Avatar Presenter', pipelineId: 'avatar-generate', description: 'Professional avatar with lip-sync' },
      { step: 4, label: 'PiP Composite', pipelineId: 'pipeline-editor-processor', description: 'Avatar picture-in-picture over slides/screen' },
      { step: 5, label: 'TTS or Voice Clone', pipelineId: 'text-to-speech', description: 'Generate or clone presenter voice' },
      { step: 6, label: 'Assemble', pipelineId: 'video-assembly', description: 'Full webinar assembly' },
    ],
  },
  {
    scenario: 'brand_story',
    description: 'Emotional brand narrative with cinematic B-roll, avatar, and cultural adaptation',
    recommendedSceneTypes: [
      { title: 'Opening — Emotion', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'cinematic', duration: 10, hasBRoll: true },
      { title: 'Origin Story', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'tracking_shot', style: 'documentary', duration: 20, hasBRoll: true },
      { title: 'Mission / Values', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'luxury', duration: 15, hasBRoll: false },
      { title: 'Impact Montage', visualType: 'broll', visualSource: 'stock_footage', motionPreset: 'slow_pan', style: 'documentary', duration: 15, hasBRoll: true },
      { title: 'Customer Voice', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'documentary', duration: 20, hasBRoll: false },
      { title: 'Future Vision', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'drone_aerial', style: 'cinematic', duration: 12, hasBRoll: false },
      { title: 'CTA', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_out', style: 'luxury', duration: 8, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Brand Intelligence', pipelineId: 'ai-universal-processor', description: 'STORM framework analysis' },
      { step: 2, label: 'Story Script', pipelineId: 'ai-universal-processor', description: 'Narrative-driven script generation' },
      { step: 3, label: 'Cinematic Visuals', pipelineId: 'video-generate', description: 'Film-quality AI-generated footage' },
      { step: 4, label: 'B-Roll Search', pipelineId: 'stock-footage-search', description: 'Curated stock footage matching brand' },
      { step: 5, label: 'Avatar Presenter', pipelineId: 'avatar-generate', description: 'Authentic brand avatar' },
      { step: 6, label: 'Cinematic Score', pipelineId: 'audio-mixer', description: 'Emotional background music' },
      { step: 7, label: 'Color Grade', pipelineId: 'pipeline-editor-processor', description: 'Consistent cinematic color grading' },
      { step: 8, label: 'Transcreation', pipelineId: 'translation-service', description: 'Cultural adaptation per region' },
    ],
  },
  // ─── NEW SCENARIO PIPELINES ─────────────────────────────────────────────────
  {
    scenario: 'ppt_to_cinematic',
    description: 'Create PPT slides (optionally in 3D), then convert to cinematic video storytelling — customer journey, infographics, data as narrative',
    recommendedSceneTypes: [
      { title: 'Title / Hook', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'cinematic', duration: 8, hasBRoll: false },
      { title: 'Problem / Context', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 15, hasBRoll: false },
      { title: 'Customer Journey Map', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'corporate', duration: 20, hasBRoll: false },
      { title: 'Data / Infographic', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'futuristic', duration: 15, hasBRoll: false },
      { title: 'Key Insight', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'dolly_zoom', style: 'cinematic', duration: 12, hasBRoll: true },
      { title: 'Solution Showcase (3D)', visualType: '3d', visualSource: 'ai_from_script', motionPreset: 'orbit', style: 'futuristic', duration: 15, hasBRoll: false },
      { title: 'Conclusion + CTA', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_out', style: 'luxury', duration: 10, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Slide Generation', pipelineId: 'slides-generate', description: 'Generate slides with framework layout (customer journey, infographic, data)' },
      { step: 2, label: '3D Slide Rendering', pipelineId: 'alibaba-3d-generator', description: 'Convert flat slides to 3D rendered presentations with depth and perspective' },
      { step: 3, label: 'Data Visualization', pipelineId: 'ai-universal-processor', description: 'Generate animated charts, graphs, and infographics from slide data' },
      { step: 4, label: 'Cinematic Scene Gen', pipelineId: 'video-generate', description: 'Convert each slide into a cinematic video scene with motion and effects' },
      { step: 5, label: 'Narration', pipelineId: 'text-to-speech', description: 'Generate voiceover narration telling the slide content as a story' },
      { step: 6, label: 'Cinematic Score', pipelineId: 'audio-mixer', description: 'Add dramatic/emotional music to match the narrative arc' },
      { step: 7, label: 'Transitions + Color', pipelineId: 'pipeline-editor-processor', description: 'Cinematic transitions between scenes, consistent color grading' },
      { step: 8, label: 'Fact Check + Citations', pipelineId: 'ai-quality-assessment', description: 'Verify all data claims, add source citations to end card' },
      { step: 9, label: 'Assembly', pipelineId: 'video-assembly', description: 'Stitch slides→3D→cinematic into final video' },
    ],
  },
  {
    scenario: 'market_analysis',
    description: 'Market research presentation — statistics, graphs, data sources, competitive study with referenced URLs',
    recommendedSceneTypes: [
      { title: 'Executive Summary', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'corporate', duration: 12, hasBRoll: false },
      { title: 'Market Size (TAM/SAM/SOM)', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'minimalist', duration: 20, hasBRoll: false },
      { title: 'Industry Trends', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'futuristic', duration: 18, hasBRoll: true },
      { title: 'Competitive Landscape', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'corporate', duration: 20, hasBRoll: false },
      { title: 'Customer Segments', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'corporate', duration: 15, hasBRoll: false },
      { title: 'Key Statistics', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 12, hasBRoll: false },
      { title: 'Sources & References', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'static', style: 'minimalist', duration: 8, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Research Collection', pipelineId: 'crawl-relevant-content', description: 'Web crawl for market data, statistics, and research reports' },
      { step: 2, label: 'Data Extraction', pipelineId: 'ai-universal-processor', description: 'Extract statistics, graphs, and key data points with source URLs' },
      { step: 3, label: 'Data Visualization', pipelineId: 'slides-generate', description: 'Generate charts, graphs, and infographic slides from data' },
      { step: 4, label: 'Narrative Script', pipelineId: 'ai-universal-processor', description: 'Generate analytical narration from data (with source attribution)' },
      { step: 5, label: 'Spell + Fact Check', pipelineId: 'ai-quality-assessment', description: 'Verify statistics, check sources, flag AI-generated approximations' },
      { step: 6, label: 'Animated Data', pipelineId: 'video-generate', description: 'Animate charts and statistics with count-up effects' },
      { step: 7, label: 'Citations End Card', pipelineId: 'slides-generate', description: 'Generate bibliography/sources slide with all URLs and references' },
      { step: 8, label: 'Assembly', pipelineId: 'video-assembly', description: 'Stitch into cohesive research presentation video' },
    ],
  },
  {
    scenario: 'data_story',
    description: 'Data storytelling — transform raw statistics and research into a narrative video journey',
    recommendedSceneTypes: [
      { title: 'The Big Question', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'cinematic', duration: 10, hasBRoll: false },
      { title: 'Context / Background', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'documentary', duration: 18, hasBRoll: true },
      { title: 'Key Statistic 1', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 12, hasBRoll: false },
      { title: 'The Journey (Timeline)', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'minimalist', duration: 20, hasBRoll: false },
      { title: 'Key Statistic 2', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 12, hasBRoll: false },
      { title: 'Insight / So What', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'dolly_zoom', style: 'cinematic', duration: 15, hasBRoll: true },
      { title: 'Sources & Disclaimer', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'static', style: 'minimalist', duration: 6, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Data Import', pipelineId: 'document-processor', description: 'Import data from CSV, PDF, URL, or manual input' },
      { step: 2, label: 'Story Arc Gen', pipelineId: 'ai-universal-processor', description: 'Transform raw data into narrative arc with characters and journey' },
      { step: 3, label: 'Visualization Gen', pipelineId: 'slides-generate', description: 'Generate animated charts, infographics, and stat callouts' },
      { step: 4, label: 'Cinematic Scenes', pipelineId: 'video-generate', description: 'Generate visual metaphors and B-roll for emotional impact' },
      { step: 5, label: 'Narration', pipelineId: 'text-to-speech', description: 'Storyteller-style voice generation' },
      { step: 6, label: 'Verification', pipelineId: 'ai-quality-assessment', description: 'Cross-check all data claims against source documents' },
      { step: 7, label: 'Assembly', pipelineId: 'video-assembly', description: 'Final story assembly with pacing and music' },
    ],
  },
  {
    scenario: 'case_study_video',
    description: 'Case study — before/after journey with metrics, testimonial, and transformation arc',
    recommendedSceneTypes: [
      { title: 'Client Introduction', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 12, hasBRoll: false },
      { title: 'The Challenge (Before)', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'documentary', duration: 18, hasBRoll: true },
      { title: 'Key Metrics (Before)', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 10, hasBRoll: false },
      { title: 'Solution Implementation', visualType: 'screen_recording', visualSource: 'screen_capture_enhanced', motionPreset: 'tracking_shot', style: 'corporate', duration: 25, hasBRoll: false },
      { title: 'Transformation Journey', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'minimalist', duration: 15, hasBRoll: false },
      { title: 'Key Metrics (After)', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 12, hasBRoll: false },
      { title: 'Testimonial Quote', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'documentary', duration: 15, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Case Data Import', pipelineId: 'document-processor', description: 'Import case study data, metrics, testimonials' },
      { step: 2, label: 'Before/After Script', pipelineId: 'ai-universal-processor', description: 'Generate transformation narrative with data points' },
      { step: 3, label: 'Metrics Visualization', pipelineId: 'slides-generate', description: 'Before/after comparison charts and KPI cards' },
      { step: 4, label: 'Journey Map', pipelineId: 'slides-generate', description: 'Customer journey visualization with touchpoints' },
      { step: 5, label: 'Cinematic B-Roll', pipelineId: 'video-generate', description: 'Contextual visuals for challenge and solution' },
      { step: 6, label: 'Fact Check', pipelineId: 'ai-quality-assessment', description: 'Verify all metrics and claims' },
      { step: 7, label: 'Assembly', pipelineId: 'video-assembly', description: 'Full case study video with dramatic arc' },
    ],
  },
  {
    scenario: 'infographic_video',
    description: 'Transform infographic data into an animated video — statistics come alive with motion and narration',
    recommendedSceneTypes: [
      { title: 'Title / Topic', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 6, hasBRoll: false },
      { title: 'Stat Block 1', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 10, hasBRoll: false },
      { title: 'Process / Flow', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'minimalist', duration: 15, hasBRoll: false },
      { title: 'Comparison Chart', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 12, hasBRoll: false },
      { title: 'Stat Block 2', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 10, hasBRoll: false },
      { title: 'Key Takeaway', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'playful', duration: 8, hasBRoll: false },
      { title: 'Sources', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'static', style: 'minimalist', duration: 5, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Data Input', pipelineId: 'document-processor', description: 'Import data, statistics, or existing infographic image' },
      { step: 2, label: 'Infographic Layout', pipelineId: 'ai-universal-processor', description: 'Generate infographic layout with icons, stats, and flow' },
      { step: 3, label: 'Animation', pipelineId: 'video-generate', description: 'Animate each data block with count-up, grow, reveal effects' },
      { step: 4, label: 'Narration', pipelineId: 'text-to-speech', description: 'Generate voiceover explaining the data points' },
      { step: 5, label: 'Source Citations', pipelineId: 'ai-universal-processor', description: 'Generate source attribution cards with URLs' },
      { step: 6, label: 'Assembly', pipelineId: 'video-assembly', description: 'Stitch animated infographic into video' },
    ],
  },
  // ─── INDUSTRY-SPECIFIC SCENARIO PIPELINES ─────────────────────────────────
  { scenario: 'patient_education', description: 'Patient-friendly medical education — simple animations, clear narration, accessible language',
    recommendedSceneTypes: [
      { title: 'Condition Overview', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'playful', duration: 15, hasBRoll: false },
      { title: 'How It Affects You', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'minimalist', duration: 20, hasBRoll: false },
      { title: 'Treatment Options', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 20, hasBRoll: false },
      { title: 'What to Expect', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'playful', duration: 15, hasBRoll: false },
      { title: 'Next Steps', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 12, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Medical Content', pipelineId: 'ai-universal-processor', description: 'Generate patient-friendly content (8th grade reading level)' },
      { step: 2, label: 'Medical Illustrations', pipelineId: 'video-generate', description: 'Simple medical animations and illustrations' },
      { step: 3, label: 'Accessibility Check', pipelineId: 'ai-quality-assessment', description: 'Verify reading level, medical accuracy, accessibility' },
      { step: 4, label: 'Narration', pipelineId: 'text-to-speech', description: 'Clear, slow-paced narration' },
      { step: 5, label: 'Multi-Language', pipelineId: 'translation-service', description: 'Translate with cultural sensitivity' },
      { step: 6, label: 'Assembly', pipelineId: 'video-assembly', description: 'Assemble with captions and large text' },
    ],
  },
  { scenario: 'hcp_training', description: 'Healthcare professional training — clinical data, protocols, evidence-based',
    recommendedSceneTypes: [
      { title: 'Clinical Background', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'corporate', duration: 20, hasBRoll: false },
      { title: 'Mechanism of Action', visualType: '3d', visualSource: 'ai_from_script', motionPreset: 'orbit', style: 'futuristic', duration: 30, hasBRoll: false },
      { title: 'Clinical Trial Data', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'minimalist', duration: 25, hasBRoll: false },
      { title: 'Treatment Protocol', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'corporate', duration: 20, hasBRoll: false },
      { title: 'References', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'static', style: 'minimalist', duration: 8, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Clinical Research', pipelineId: 'crawl-relevant-content', description: 'Gather clinical data, guidelines, peer-reviewed research' },
      { step: 2, label: 'Data Extract', pipelineId: 'ai-universal-processor', description: 'Extract endpoints, p-values, confidence intervals' },
      { step: 3, label: '3D Medical Viz', pipelineId: 'alibaba-3d-generator', description: '3D molecular/anatomical visualizations' },
      { step: 4, label: 'Evidence Slides', pipelineId: 'slides-generate', description: 'Forest plots, survival curves, KM curves' },
      { step: 5, label: 'Compliance', pipelineId: 'ai-quality-assessment', description: 'Verify fair balance, ISI, off-label disclaimers' },
      { step: 6, label: 'Assembly', pipelineId: 'video-assembly', description: 'Assemble with references footer' },
    ],
  },
  { scenario: 'recruitment_video', description: 'Employer brand / recruitment — culture, team, benefits, open positions',
    recommendedSceneTypes: [
      { title: 'Company Intro', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'cinematic', duration: 10, hasBRoll: true },
      { title: 'Culture & Values', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 20, hasBRoll: true },
      { title: 'Benefits & Perks', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 15, hasBRoll: false },
      { title: 'Open Positions', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'corporate', duration: 12, hasBRoll: false },
      { title: 'Apply CTA', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'slow_zoom_out', style: 'corporate', duration: 8, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Company Data', pipelineId: 'local-business-enrichment', description: 'Pull company info, photos, reviews' },
      { step: 2, label: 'Culture Script', pipelineId: 'ai-universal-processor', description: 'Authentic employer brand narrative' },
      { step: 3, label: 'Team Visuals', pipelineId: 'video-generate', description: 'Office/team B-roll' },
      { step: 4, label: 'Avatar', pipelineId: 'avatar-generate', description: 'Diverse team member avatars' },
      { step: 5, label: 'Assembly', pipelineId: 'video-assembly', description: 'Upbeat recruitment video' },
    ],
  },
  { scenario: 'quarterly_report', description: 'QBR — KPI dashboards, trend analysis, strategic commentary',
    recommendedSceneTypes: [
      { title: 'Quarter Highlights', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'corporate', duration: 12, hasBRoll: false },
      { title: 'Revenue & Growth', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'minimalist', duration: 20, hasBRoll: false },
      { title: 'KPI Dashboard', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 20, hasBRoll: false },
      { title: 'Next Quarter', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'futuristic', duration: 15, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Data Import', pipelineId: 'document-processor', description: 'Import KPIs and metrics' },
      { step: 2, label: 'Dashboard', pipelineId: 'slides-generate', description: 'Animated KPI dashboards' },
      { step: 3, label: 'Commentary', pipelineId: 'ai-universal-processor', description: 'Strategic commentary' },
      { step: 4, label: 'Verification', pipelineId: 'ai-quality-assessment', description: 'Verify financial data' },
      { step: 5, label: 'Assembly', pipelineId: 'video-assembly', description: 'QBR video' },
    ],
  },
  { scenario: 'ad_creative', description: 'Paid ad creative — hook, problem, solution, social proof, CTA (15-60s)',
    recommendedSceneTypes: [
      { title: 'Hook (3s)', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'whip_pan', style: 'street', duration: 3, hasBRoll: false },
      { title: 'Problem', visualType: 'video', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'playful', duration: 5, hasBRoll: false },
      { title: 'Solution', visualType: 'video', visualSource: 'ai_from_script', motionPreset: 'tracking_shot', style: 'playful', duration: 8, hasBRoll: false },
      { title: 'Social Proof', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 4, hasBRoll: false },
      { title: 'CTA', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 3, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Ad Copy', pipelineId: 'ai-universal-processor', description: 'Hook-first ad script' },
      { step: 2, label: 'Visuals', pipelineId: 'video-generate', description: 'Attention-grabbing visuals' },
      { step: 3, label: 'Captions', pipelineId: 'caption-generate', description: 'Bold animated captions' },
      { step: 4, label: 'Multi-Size', pipelineId: 'pipeline-editor-processor', description: '9:16, 1:1, 16:9, 4:5' },
      { step: 5, label: 'A/B Variants', pipelineId: 'pipeline-editor-processor', description: '3-5 ad variants for testing' },
    ],
  },
  { scenario: 'course_lecture', description: 'E-learning lecture — avatar teacher, slides, whiteboard, quiz',
    recommendedSceneTypes: [
      { title: 'Lesson Overview', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 15, hasBRoll: false },
      { title: 'Theory', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 30, hasBRoll: false },
      { title: 'Visual Explanation', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'hand_drawn', duration: 25, hasBRoll: false },
      { title: 'Demo', visualType: 'screen_recording', visualSource: 'screen_capture_enhanced', motionPreset: 'slow_zoom_in', style: 'minimalist', duration: 30, hasBRoll: false },
      { title: 'Quiz', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 15, hasBRoll: false },
      { title: 'Summary', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 10, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Curriculum', pipelineId: 'ai-universal-processor', description: 'Structured lesson script' },
      { step: 2, label: 'Slides', pipelineId: 'slides-generate', description: 'Educational slides with diagrams' },
      { step: 3, label: 'Avatar', pipelineId: 'avatar-generate', description: 'Teacher avatar' },
      { step: 4, label: 'Quiz Cards', pipelineId: 'ai-universal-processor', description: 'Quiz questions and answers' },
      { step: 5, label: 'Narration', pipelineId: 'text-to-speech', description: 'Educational pacing' },
      { step: 6, label: 'Assembly', pipelineId: 'video-assembly', description: 'Lecture with chapters' },
    ],
  },
  { scenario: 'destination_showcase', description: 'Travel destination — aerial, attractions, cuisine, accommodation, itinerary',
    recommendedSceneTypes: [
      { title: 'Aerial Opening', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'drone_aerial', style: 'cinematic', duration: 10, hasBRoll: true },
      { title: 'Attractions', visualType: 'broll', visualSource: 'stock_footage', motionPreset: 'tracking_shot', style: 'cinematic', duration: 20, hasBRoll: true },
      { title: 'Cuisine', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'luxury', duration: 15, hasBRoll: true },
      { title: 'Itinerary Map', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'playful', duration: 15, hasBRoll: false },
      { title: 'Book Now', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'luxury', duration: 8, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Google Places', pipelineId: 'local-business-enrichment', description: 'Destination data, reviews, photos, POIs' },
      { step: 2, label: 'Script', pipelineId: 'ai-universal-processor', description: 'Engaging travel narrative' },
      { step: 3, label: 'Aerial Visuals', pipelineId: 'video-generate', description: 'Drone-style destination footage' },
      { step: 4, label: 'Route Map', pipelineId: 'slides-generate', description: 'Animated itinerary map' },
      { step: 5, label: 'Transcreation', pipelineId: 'translation-service', description: 'Adapt for tourist markets' },
      { step: 6, label: 'Assembly', pipelineId: 'video-assembly', description: 'Cinematic travel video' },
    ],
  },
  { scenario: 'product_showcase', description: 'E-commerce product showcase — 3D orbit, features, specs, reviews, buy CTA',
    recommendedSceneTypes: [
      { title: 'Product Hero', visualType: '3d', visualSource: 'ai_from_script', motionPreset: 'orbit', style: 'luxury', duration: 10, hasBRoll: false },
      { title: 'Features', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 15, hasBRoll: false },
      { title: 'Close-Ups', visualType: '3d', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'luxury', duration: 12, hasBRoll: false },
      { title: 'Reviews', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 10, hasBRoll: false },
      { title: 'Buy CTA', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'luxury', duration: 5, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: '3D Model', pipelineId: 'alibaba-3d-generator', description: '3D product model from photos/description' },
      { step: 2, label: 'Product Copy', pipelineId: 'ai-universal-processor', description: 'Feature descriptions and persuasive copy' },
      { step: 3, label: 'Reviews', pipelineId: 'local-business-enrichment', description: 'Real customer reviews and ratings' },
      { step: 4, label: 'Render', pipelineId: 'video-generate', description: '3D product with orbit and zoom' },
      { step: 5, label: 'Multi-Size', pipelineId: 'pipeline-editor-processor', description: 'Website, social, marketplace' },
    ],
  },
  { scenario: 'vehicle_showcase', description: 'Automotive showcase — 3D orbit, interior/exterior, specs, test drive',
    recommendedSceneTypes: [
      { title: 'Reveal', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'luxury', duration: 8, hasBRoll: false },
      { title: 'Exterior 360', visualType: '3d', visualSource: 'ai_from_script', motionPreset: 'orbit', style: 'luxury', duration: 15, hasBRoll: false },
      { title: 'Interior', visualType: '3d', visualSource: 'ai_from_script', motionPreset: 'tracking_shot', style: 'luxury', duration: 20, hasBRoll: false },
      { title: 'Performance', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'futuristic', duration: 12, hasBRoll: false },
      { title: 'Driving', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'drone_aerial', style: 'cinematic', duration: 15, hasBRoll: true },
      { title: 'Configure', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'luxury', duration: 8, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: '3D Vehicle', pipelineId: 'alibaba-3d-generator', description: 'Detailed 3D vehicle model' },
      { step: 2, label: 'Renders', pipelineId: 'video-generate', description: 'Cinematic exterior/interior renders' },
      { step: 3, label: 'Spec Cards', pipelineId: 'slides-generate', description: 'Animated specs (HP, torque, 0-60, range)' },
      { step: 4, label: 'Driving Footage', pipelineId: 'video-generate', description: 'AI driving experience footage' },
      { step: 5, label: 'Narration', pipelineId: 'text-to-speech', description: 'Premium voice narration' },
      { step: 6, label: 'Assembly', pipelineId: 'video-assembly', description: 'Cinematic vehicle showcase' },
    ],
  },
  { scenario: 'fundraising_appeal', description: 'Nonprofit fundraising — emotional story, impact data, donation CTA',
    recommendedSceneTypes: [
      { title: 'The Challenge', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'documentary', duration: 15, hasBRoll: true },
      { title: 'A Story', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'documentary', duration: 20, hasBRoll: false },
      { title: 'Impact Numbers', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 12, hasBRoll: false },
      { title: 'How You Help', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'playful', duration: 15, hasBRoll: false },
      { title: 'Donate CTA', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'slow_zoom_in', style: 'documentary', duration: 10, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'Impact Story', pipelineId: 'ai-universal-processor', description: 'Emotional fundraising narrative' },
      { step: 2, label: 'Impact Viz', pipelineId: 'slides-generate', description: 'Animated impact statistics' },
      { step: 3, label: 'Avatar', pipelineId: 'avatar-generate', description: 'Culturally appropriate avatars' },
      { step: 4, label: 'Score', pipelineId: 'audio-mixer', description: 'Emotional background music' },
      { step: 5, label: 'Assembly', pipelineId: 'video-assembly', description: 'With donation link overlay' },
    ],
  },
  { scenario: 'architectural_walkthrough', description: 'Architecture walkthrough — 3D renders, floor plans, VR tour',
    recommendedSceneTypes: [
      { title: 'Aerial Approach', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'drone_aerial', style: 'cinematic', duration: 10, hasBRoll: false },
      { title: 'Exterior', visualType: '3d', visualSource: 'ai_from_script', motionPreset: 'orbit', style: 'luxury', duration: 15, hasBRoll: false },
      { title: 'Floor Plan', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'slow_zoom_in', style: 'minimalist', duration: 12, hasBRoll: false },
      { title: 'Interior Walk', visualType: '3d', visualSource: 'ai_from_script', motionPreset: 'tracking_shot', style: 'luxury', duration: 30, hasBRoll: false },
      { title: 'Contact', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'corporate', duration: 8, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: '3D Model', pipelineId: 'alibaba-3d-generator', description: '3D architectural walkthrough' },
      { step: 2, label: 'Floor Plans', pipelineId: 'slides-generate', description: 'Annotated floor plans' },
      { step: 3, label: 'Materials', pipelineId: 'video-generate', description: 'Material/texture renders' },
      { step: 4, label: 'Narration', pipelineId: 'text-to-speech', description: 'Premium narration' },
      { step: 5, label: 'VR Export', pipelineId: 'pipeline-editor-processor', description: 'Optional VR/360 export' },
      { step: 6, label: 'Assembly', pipelineId: 'video-assembly', description: 'Cinematic architecture video' },
    ],
  },
  { scenario: 'youtube_series', description: 'YouTube series — branded intro, chapters, end screen, SEO optimized',
    recommendedSceneTypes: [
      { title: 'Branded Intro', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 5, hasBRoll: false },
      { title: 'Hook', visualType: 'avatar', visualSource: 'ai_from_prompt', motionPreset: 'static', style: 'corporate', duration: 15, hasBRoll: false },
      { title: 'Chapter 1', visualType: 'video', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'corporate', duration: 90, hasBRoll: true },
      { title: 'Chapter 2', visualType: 'video', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'corporate', duration: 90, hasBRoll: true },
      { title: 'End Screen', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'playful', duration: 15, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'SEO Research', pipelineId: 'crawl-relevant-content', description: 'Keywords, trending topics' },
      { step: 2, label: 'Script + Chapters', pipelineId: 'ai-universal-processor', description: 'YouTube-optimized script' },
      { step: 3, label: 'Avatar', pipelineId: 'avatar-generate', description: 'Consistent series presenter' },
      { step: 4, label: 'Visuals', pipelineId: 'video-generate', description: 'Supporting visuals and B-roll' },
      { step: 5, label: 'Thumbnail', pipelineId: 'thumbnail-generate', description: 'Click-worthy thumbnail' },
      { step: 6, label: 'Captions', pipelineId: 'caption-generate', description: 'Auto-captions for SEO' },
      { step: 7, label: 'Assembly', pipelineId: 'video-assembly', description: 'With intro, chapters, end screen' },
    ],
  },
  { scenario: 'sustainability_report', description: 'ESG / sustainability report — environmental metrics, initiatives, impact',
    recommendedSceneTypes: [
      { title: 'ESG Summary', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'minimalist', duration: 12, hasBRoll: false },
      { title: 'Environmental Metrics', visualType: 'animation', visualSource: 'ai_from_script', motionPreset: 'morph', style: 'minimalist', duration: 20, hasBRoll: false },
      { title: 'Initiatives', visualType: 'cinematic', visualSource: 'ai_from_script', motionPreset: 'slow_pan', style: 'documentary', duration: 20, hasBRoll: true },
      { title: 'Goals', visualType: 'slide', visualSource: 'ai_from_script', motionPreset: 'kinetic_text', style: 'corporate', duration: 15, hasBRoll: false },
    ],
    pipelineChain: [
      { step: 1, label: 'ESG Data', pipelineId: 'document-processor', description: 'Import sustainability metrics' },
      { step: 2, label: 'Impact Viz', pipelineId: 'slides-generate', description: 'Environmental impact visualizations' },
      { step: 3, label: 'Narrative', pipelineId: 'text-to-speech', description: 'Inspiring sustainability narration' },
      { step: 4, label: 'Assembly', pipelineId: 'video-assembly', description: 'ESG video report' },
    ],
  },
];

function recommendScenarioPipelines(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  // If project has a scenario, recommend the full pipeline chain
  if (context.scenario) {
    const template = SCENARIO_PIPELINES.find(t => t.scenario === context.scenario);
    if (template) {
      // Check if user already has scenes matching the template
      const hasEnoughScenes = scenes.length >= template.recommendedSceneTypes.length * 0.5;

      if (!hasEnoughScenes) {
        recs.push({
          id: crypto.randomUUID(),
          type: 'scenario',
          title: `Recommended structure for ${formatScenarioName(context.scenario)}`,
          description: template.description,
          confidence: 0.9,
          reason: `Based on your "${context.scenario}" scenario, here's a proven scene structure and pipeline`,
          action: {
            scenario: context.scenario,
            recommendedScenes: template.recommendedSceneTypes,
          },
          combinationSteps: template.pipelineChain,
          alternatives: getScenarioAlternatives(context.scenario),
        });
      }
    }
  }

  // Auto-detect scenario from existing scenes if none set
  if (!context.scenario && scenes.length > 0) {
    const detected = detectScenario(scenes, context);
    if (detected) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'scenario',
        title: `Detected scenario: ${formatScenarioName(detected)}`,
        description: `Your scenes look like a "${formatScenarioName(detected)}" project — want to apply the recommended pipeline?`,
        confidence: 0.6,
        reason: 'Auto-detected from your scene titles, visual types, and content intent',
        action: { scenario: detected },
        alternatives: [
          { label: 'Product Video', action: { scenario: 'product_video' } },
          { label: 'Explainer', action: { scenario: 'explainer' } },
          { label: 'Social Promo', action: { scenario: 'social_promo' } },
          { label: 'Brand Story', action: { scenario: 'brand_story' } },
        ],
      });
    }
  }

  return recs;
}

function detectScenario(scenes: CompositionScene[], context: RecommendationContext): ContentScenario | null {
  const types = scenes.map(s => s.visual.type);
  const titles = scenes.map(s => s.title.toLowerCase()).join(' ');

  if (types.includes('screen_recording') && (titles.includes('demo') || titles.includes('feature'))) return 'product_video';
  if (titles.includes('investor') || titles.includes('pitch') || titles.includes('funding')) return 'investor_pitch';
  if (titles.includes('explain') || titles.includes('how') || titles.includes('step')) return 'explainer';
  if (types.includes('slide') && titles.includes('webinar')) return 'webinar_recording';
  if (context.intent === 'promo' && scenes.every(s => s.duration <= 15)) return 'social_promo';
  if (titles.includes('brand') || titles.includes('story') || titles.includes('mission')) return 'brand_story';
  if (titles.includes('testimonial') || titles.includes('customer')) return 'testimonial_video';
  return null;
}

function formatScenarioName(scenario: ContentScenario): string {
  return scenario.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getScenarioAlternatives(scenario: ContentScenario): SceneRecommendation['alternatives'] {
  const allScenarios: ContentScenario[] = ['product_video', 'explainer', 'investor_pitch', 'social_promo', 'webinar_recording', 'brand_story'];
  return allScenarios
    .filter(s => s !== scenario)
    .slice(0, 3)
    .map(s => ({
      label: formatScenarioName(s),
      action: { scenario: s },
    }));
}

// ─── Visual Source Recommendations ───────────────────────────────────────────

function recommendVisualSources(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    if (scene.visualPipeline?.source) continue; // Already has a source configured

    const sources = getRecommendedVisualSources(scene, context);
    if (sources.length === 0) continue;

    const primary = sources[0];
    recs.push({
      id: crypto.randomUUID(),
      type: 'visual_source',
      sceneId: scene.id,
      title: `Visual source: ${formatVisualSource(primary.source)}`,
      description: primary.description,
      confidence: primary.confidence,
      reason: primary.reason,
      action: {
        visualPipeline: {
          source: primary.source,
          enhanceWithAI: primary.enhanceWithAI,
          generateFromScript: primary.generateFromScript,
          regenerateFromOriginal: primary.regenerateFromOriginal,
        },
      },
      alternatives: sources.slice(1).map(s => ({
        label: formatVisualSource(s.source),
        action: {
          visualPipeline: {
            source: s.source,
            enhanceWithAI: s.enhanceWithAI,
            generateFromScript: s.generateFromScript,
            regenerateFromOriginal: s.regenerateFromOriginal,
          },
        },
      })),
    });
  }

  return recs;
}

interface VisualSourceSuggestion {
  source: VisualSource;
  description: string;
  reason: string;
  confidence: number;
  enhanceWithAI?: boolean;
  generateFromScript?: boolean;
  regenerateFromOriginal?: boolean;
}

function getRecommendedVisualSources(scene: CompositionScene, context: RecommendationContext): VisualSourceSuggestion[] {
  const suggestions: VisualSourceSuggestion[] = [];
  const type = scene.visual.type;
  const title = scene.title.toLowerCase();

  // Screen recording scenes
  if (type === 'screen_recording') {
    suggestions.push({
      source: 'screen_capture_enhanced',
      description: 'Auto-capture product screens, then AI-enhance for polish (annotations, zoom highlights, better quality)',
      reason: 'Raw screen recordings benefit from AI enhancement for professional quality',
      confidence: 0.85,
      enhanceWithAI: true,
    });
    suggestions.push({
      source: 'screen_capture_raw',
      description: 'Use raw screen recording as-is for authentic feel',
      reason: 'Authentic screen captures feel more genuine to some audiences',
      confidence: 0.5,
    });
    suggestions.push({
      source: 'ai_regenerated',
      description: 'AI-regenerate better quality screens from your originals — improved layout, cleaner UI, branded colors',
      reason: 'AI regeneration can produce idealized product screenshots for marketing',
      confidence: 0.7,
      regenerateFromOriginal: true,
    });
  }

  // Static/image scenes
  if (type === 'static') {
    suggestions.push({
      source: 'ai_from_script',
      description: 'Auto-generate images from your scene script using AI',
      reason: 'Script-based image generation ensures visuals match your narrative',
      confidence: 0.75,
      generateFromScript: true,
    });
    if (context.hasProductAssets) {
      suggestions.push({
        source: 'ai_regenerated',
        description: 'AI-regenerate from your uploaded product images with better quality/style',
        reason: 'Enhance your existing product images with AI for consistent visual quality',
        confidence: 0.8,
        regenerateFromOriginal: true,
        enhanceWithAI: true,
      });
    }
    suggestions.push({
      source: 'stock_footage',
      description: 'Pull from stock image libraries matching your script keywords',
      reason: 'Stock images provide professional photography instantly',
      confidence: 0.5,
    });
  }

  // Video scenes
  if (type === 'video' || type === 'cinematic') {
    suggestions.push({
      source: 'ai_from_script',
      description: 'AI-generate video clips directly from your scene script',
      reason: 'Script-driven video generation creates visuals perfectly matched to your narrative',
      confidence: 0.8,
      generateFromScript: true,
    });
    suggestions.push({
      source: 'ai_from_prompt',
      description: 'Generate from a custom visual prompt for precise creative control',
      reason: 'Custom prompts give you exact creative direction over the visual',
      confidence: 0.7,
    });
    suggestions.push({
      source: 'stock_footage',
      description: 'Use professional stock video footage',
      reason: 'Stock footage provides high-quality, pre-shot content instantly',
      confidence: 0.4,
    });
  }

  // Animation scenes
  if (type === 'animation') {
    suggestions.push({
      source: 'ai_from_script',
      description: 'Auto-generate animations from your script text (kinetic typography, illustrations)',
      reason: 'Script-driven animation creates visuals synchronized with your narrative',
      confidence: 0.85,
      generateFromScript: true,
    });
  }

  // Slides
  if (type === 'slide') {
    suggestions.push({
      source: 'ai_from_script',
      description: 'Auto-generate professional slides from your script content',
      reason: 'AI slide generation creates on-brand presentations from script text',
      confidence: 0.9,
      generateFromScript: true,
    });
  }

  // Default fallback — AI from script is always an option
  if (suggestions.length === 0 && scene.voiceover.text.length > 0) {
    suggestions.push({
      source: 'ai_from_script',
      description: 'Auto-generate visuals from your scene script',
      reason: 'Script-based generation ensures visual-audio alignment',
      confidence: 0.6,
      generateFromScript: true,
    });
    suggestions.push({
      source: 'generated_default',
      description: 'Use a platform-generated default visual (can be replaced later)',
      reason: 'Quick placeholder to keep moving — swap out anytime',
      confidence: 0.3,
    });
  }

  return suggestions;
}

function formatVisualSource(source: VisualSource): string {
  const labels: Record<VisualSource, string> = {
    screen_capture_raw: 'Raw Screen Capture',
    screen_capture_enhanced: 'AI-Enhanced Screen Capture',
    ai_from_script: 'AI from Script',
    ai_from_prompt: 'AI from Custom Prompt',
    ai_regenerated: 'AI Regenerated (Better Quality)',
    uploaded_raw: 'Your Upload (Raw)',
    uploaded_enhanced: 'Your Upload (AI-Enhanced)',
    stock_footage: 'Stock Footage',
    live_camera: 'Live Camera',
    generated_default: 'Platform Default',
    composite: 'Multi-Source Composite',
  };
  return labels[source] || source;
}

// ─── Visual Enhancement Recommendations ─────────────────────────────────────

function recommendVisualEnhancements(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    const source = scene.visualPipeline?.source;

    // Raw screen captures → suggest AI enhancement
    if (source === 'screen_capture_raw' && !scene.visualPipeline?.enhanceWithAI) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'visual_enhance',
        sceneId: scene.id,
        title: 'AI-enhance this screen recording',
        description: 'Upscale resolution, add cursor highlights, smooth animations, add branded annotations',
        confidence: 0.85,
        reason: 'AI enhancement makes raw screen captures look professional-grade',
        action: {
          visualPipeline: {
            ...scene.visualPipeline,
            enhanceWithAI: true,
            qualityEnhance: { enabled: true, sharpening: 0.7, colorCorrection: true },
          },
        },
        alternatives: [
          { label: 'Enhance + Upscale 4K', action: { qualityEnhance: { enabled: true, targetResolution: '4k', sharpening: 0.5 } } },
          { label: 'Enhance + Annotations', action: { enhanceWithAI: true, aiEnhancePrompt: 'Add cursor highlights and UI annotations' } },
          { label: 'AI Regenerate (new screens)', action: { source: 'ai_regenerated', regenerateFromOriginal: true } },
        ],
      });
    }

    // Raw uploads → suggest enhancement
    if (source === 'uploaded_raw' && !scene.visualPipeline?.enhanceWithAI) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'visual_enhance',
        sceneId: scene.id,
        title: 'Enhance your uploaded visual',
        description: 'AI upscale, denoise, color correct, and match to your brand colors',
        confidence: 0.7,
        reason: 'AI enhancement can significantly improve uploaded content quality',
        action: {
          visualPipeline: {
            ...scene.visualPipeline,
            enhanceWithAI: true,
            qualityEnhance: { enabled: true, denoiseStrength: 0.5, colorCorrection: true },
          },
        },
      });
    }

    // Any scene with video → suggest quality enhance if not already set
    if (
      (scene.visual.type === 'video' || scene.visual.type === 'cinematic') &&
      scene.status === 'complete' &&
      !scene.visualPipeline?.qualityEnhance?.enabled
    ) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'regenerate',
        sceneId: scene.id,
        title: 'Regenerate for better quality',
        description: `Re-generate "${scene.title}" with higher quality settings or a different AI model`,
        confidence: 0.4,
        reason: 'AI video generation quality varies — regenerating can produce better results',
        action: {
          regenerateFromOriginal: true,
          qualityEnhance: { enabled: true, sharpening: 0.5, frameInterpolation: true },
        },
        alternatives: [
          { label: 'Same style, better quality', action: { regenerateFromOriginal: true, qualityEnhance: { enabled: true } } },
          { label: 'Different AI model', action: { regenerateFromOriginal: true, alternateProvider: true } },
          { label: 'Different style entirely', action: { regenerateFromOriginal: false } },
        ],
      });
    }
  }

  return recs;
}

// ─── Motion Preset Recommendations ──────────────────────────────────────────

function recommendMotionPresets(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    if (scene.motionPreset && scene.motionPreset !== 'none') continue;

    const suggestions = getRecommendedMotions(scene, context);
    if (suggestions.length === 0) continue;

    const primary = suggestions[0];
    recs.push({
      id: crypto.randomUUID(),
      type: 'motion',
      sceneId: scene.id,
      title: `Add "${primary.preset}" motion`,
      description: primary.description,
      confidence: primary.confidence,
      reason: primary.reason,
      action: { motionPreset: primary.preset },
      alternatives: suggestions.slice(1, 4).map(s => ({
        label: formatMotionPreset(s.preset),
        action: { motionPreset: s.preset },
      })),
    });
  }

  return recs;
}

interface MotionSuggestion {
  preset: MotionPreset;
  description: string;
  reason: string;
  confidence: number;
}

function getRecommendedMotions(scene: CompositionScene, context: RecommendationContext): MotionSuggestion[] {
  const suggestions: MotionSuggestion[] = [];
  const type = scene.visual.type;
  const style = scene.sceneStyle;

  // Static images → Ken Burns or parallax
  if (type === 'static' || type === 'broll') {
    suggestions.push(
      { preset: 'slow_pan', description: 'Gentle Ken Burns pan across the image', reason: 'Static images feel more dynamic with subtle camera movement', confidence: 0.8 },
      { preset: 'slow_zoom_in', description: 'Gradual zoom to draw viewer attention', reason: 'Zoom creates focus and draws the eye to key elements', confidence: 0.7 },
      { preset: 'parallax', description: 'Depth-based parallax for a 3D feel', reason: 'Parallax adds perceived depth to 2D images', confidence: 0.6 },
    );
  }

  // Slides → kinetic text
  if (type === 'slide') {
    suggestions.push(
      { preset: 'kinetic_text', description: 'Animate text elements flying in sequentially', reason: 'Kinetic typography makes data-heavy slides engaging', confidence: 0.85 },
      { preset: 'morph', description: 'Smooth morph transition between data points', reason: 'Morph transitions help viewers follow data changes', confidence: 0.7 },
    );
  }

  // 3D models → orbit
  if (type === '3d') {
    suggestions.push(
      { preset: 'orbit', description: '360-degree orbit around the 3D model', reason: '3D models are best experienced from multiple angles', confidence: 0.9 },
      { preset: 'slow_zoom_in', description: 'Zoom into model details', reason: 'Close-up reveals details in 3D models', confidence: 0.6 },
    );
  }

  // Cinematic → tracking or drone
  if (type === 'cinematic') {
    suggestions.push(
      { preset: 'tracking_shot', description: 'Camera follows subject through the scene', reason: 'Tracking shots create cinematic movement', confidence: 0.8 },
      { preset: 'drone_aerial', description: 'Aerial flyover for epic scale', reason: 'Aerial shots add grandeur to cinematic content', confidence: 0.65 },
      { preset: 'dolly_zoom', description: 'Vertigo-style dolly zoom for dramatic effect', reason: 'Dolly zoom creates powerful dramatic emphasis', confidence: 0.5 },
    );
  }

  // Screen recordings → subtle zoom for focus
  if (type === 'screen_recording') {
    suggestions.push(
      { preset: 'slow_zoom_in', description: 'Gradually zoom into the action area', reason: 'Zoom helps viewers focus on the relevant UI elements', confidence: 0.75 },
      { preset: 'tracking_shot', description: 'Follow cursor/interaction points', reason: 'Tracking the interaction makes demos easier to follow', confidence: 0.65 },
    );
  }

  // Style-based overrides
  if (style === 'documentary') {
    suggestions.push(
      { preset: 'handheld', description: 'Slight handheld shake for authenticity', reason: 'Handheld motion adds an authentic, documentary feel', confidence: 0.7 },
    );
  }

  if (style === 'street') {
    suggestions.push(
      { preset: 'whip_pan', description: 'Fast whip pan for energy', reason: 'Whip pans add urgency and energy to street-style content', confidence: 0.6 },
    );
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

function formatMotionPreset(preset: MotionPreset): string {
  return preset.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Size Variant Recommendations ───────────────────────────────────────────

function recommendSizeVariants(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  // Only recommend size variants at project level (not per-scene)
  const hasAnySizeVariants = scenes.some(s => s.sizeVariants && s.sizeVariants.length > 0);
  if (hasAnySizeVariants) return recs;

  const platforms = context.targetPlatforms || [];
  const needsVertical = platforms.some(p => ['tiktok', 'instagram', 'youtube_shorts'].includes(p));
  const needsSquare = platforms.some(p => ['instagram', 'linkedin', 'facebook'].includes(p));
  const needsWide = platforms.some(p => ['youtube', 'website', 'landing_page'].includes(p));

  const variants: Array<{ name: string; width: number; height: number; ratio: string; platform: string }> = [];

  if (needsVertical) {
    variants.push({ name: 'Vertical (TikTok/Reels)', width: 1080, height: 1920, ratio: '9:16', platform: 'tiktok' });
  }
  if (needsSquare) {
    variants.push({ name: 'Square (Instagram/LinkedIn)', width: 1080, height: 1080, ratio: '1:1', platform: 'instagram' });
  }
  if (needsWide) {
    variants.push({ name: 'Widescreen (YouTube)', width: 1920, height: 1080, ratio: '16:9', platform: 'youtube' });
  }

  // Instagram portrait
  if (platforms.includes('instagram')) {
    variants.push({ name: 'Portrait (Instagram Feed)', width: 1080, height: 1350, ratio: '4:5', platform: 'instagram_feed' });
  }

  if (variants.length > 1) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'size_variant',
      title: `Generate ${variants.length} size variants`,
      description: `Auto-export in ${variants.map(v => v.ratio).join(', ')} for your target platforms`,
      confidence: 0.8,
      reason: 'Each platform has an optimal aspect ratio — smart cropping maximizes impact',
      action: {
        sizeVariants: variants.map(v => ({
          id: crypto.randomUUID(),
          name: v.name,
          width: v.width,
          height: v.height,
          aspectRatio: v.ratio,
          platform: v.platform,
          cropStrategy: 'smart_focus',
          scaleMode: 'fill',
        })),
      },
      alternatives: [
        { label: 'Center Crop', action: { cropStrategy: 'center' } },
        { label: 'Smart Focus (AI)', action: { cropStrategy: 'smart_focus' } },
        { label: 'Custom Crop per Scene', action: { cropStrategy: 'custom' } },
      ],
    });
  }

  return recs;
}

// ─── Combination Chain Recommendations ──────────────────────────────────────

function recommendCombinationChains(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  // Product video with screens → recommend the full enhancement chain
  const hasScreenScenes = scenes.some(s => s.visual.type === 'screen_recording');
  const hasAvatarScenes = scenes.some(s => s.visual.type === 'avatar');
  const hasAIScenes = scenes.some(s => s.visual.type === 'video' || s.visual.type === 'cinematic');

  if (hasScreenScenes && hasAIScenes) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'combination',
      title: 'Screen + AI Visual combo pipeline',
      description: 'Enhance screen recordings with AI, generate cinematic scenes from script, then stitch with matching transitions',
      confidence: 0.8,
      reason: 'Combining real screen captures with AI-generated scenes creates professional product videos',
      action: { combinationChain: 'product_to_campaign' },
      combinationSteps: [
        { step: 1, label: 'Screen Capture', pipelineId: 'screen-capture', description: 'Import or record product screens' },
        { step: 2, label: 'AI Enhance', pipelineId: 'image-enhance', description: 'Upscale, annotate, add focus highlights' },
        { step: 3, label: 'AI Visuals', pipelineId: 'video-generate', description: 'Generate cinematic scenes from script' },
        { step: 4, label: 'Match Styles', pipelineId: 'pipeline-editor-processor', description: 'Color-grade all scenes to match' },
        { step: 5, label: 'Stitch', pipelineId: 'video-assembly', description: 'Assemble with smooth transitions' },
      ],
    });
  }

  if (hasAvatarScenes && hasScreenScenes) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'combination',
      title: 'Avatar + Screen PiP combo',
      description: 'Overlay avatar presenter as picture-in-picture on screen recordings',
      confidence: 0.75,
      reason: 'Avatar PiP adds a human touch to screen recordings, increasing engagement',
      action: { combinationChain: 'avatar_pip_screen' },
      combinationSteps: [
        { step: 1, label: 'Screen Record', pipelineId: 'screen-capture', description: 'Product demo recording' },
        { step: 2, label: 'Avatar Generate', pipelineId: 'avatar-generate', description: 'Professional talking head' },
        { step: 3, label: 'Lip Sync', pipelineId: 'lip-sync', description: 'Sync avatar to voiceover' },
        { step: 4, label: 'PiP Composite', pipelineId: 'pipeline-editor-processor', description: 'Avatar in corner over screen' },
      ],
    });
  }

  // Script exists but no visuals → recommend full generation pipeline
  const allDraft = scenes.every(s => s.status === 'draft');
  const allHaveScripts = scenes.every(s => s.voiceover.text.length > 20);
  if (allDraft && allHaveScripts && !hasAIScenes && !hasScreenScenes) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'combination',
      title: 'Script → Full video pipeline',
      description: 'You have scripts but no visuals yet — generate everything from your scripts in one pipeline run',
      confidence: 0.9,
      reason: 'Your scripts are ready — the pipeline can generate visuals, voice, music, and assemble automatically',
      action: { combinationChain: 'script_to_video' },
      combinationSteps: [
        { step: 1, label: 'TTS Voice', pipelineId: 'text-to-speech', description: 'Generate voiceover from scripts' },
        { step: 2, label: 'AI Visuals', pipelineId: 'video-generate', description: 'Generate visuals matching each scene script' },
        { step: 3, label: 'Background Music', pipelineId: 'audio-mixer', description: 'Generate mood-matched background music' },
        { step: 4, label: 'Captions', pipelineId: 'caption-generate', description: 'Auto-generate captions' },
        { step: 5, label: 'Thumbnails', pipelineId: 'thumbnail-generate', description: 'Extract best frames as thumbnails' },
        { step: 6, label: 'Assemble', pipelineId: 'video-assembly', description: 'Stitch everything together' },
        { step: 7, label: 'Multi-Size', pipelineId: 'pipeline-editor-processor', description: 'Export in all target sizes' },
      ],
    });
  }

  return recs;
}

// ─── Slide Framework Recommendations ────────────────────────────────────────

function recommendSlideFrameworks(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    if (scene.visual.type !== 'slide' || scene.slideFramework) continue;

    const frameworks = getRecommendedFrameworks(scene, context);
    if (frameworks.length === 0) continue;

    const primary = frameworks[0];
    recs.push({
      id: crypto.randomUUID(),
      type: 'slide_framework',
      sceneId: scene.id,
      title: `Use "${primary.label}" framework`,
      description: primary.description,
      confidence: primary.confidence,
      reason: primary.reason,
      action: { slideFramework: primary.framework, renderConfig: { slideFramework: primary.framework } },
      alternatives: frameworks.slice(1, 4).map(f => ({
        label: f.label,
        action: { slideFramework: f.framework },
      })),
    });
  }

  return recs;
}

interface FrameworkSuggestion {
  framework: SlideFramework;
  label: string;
  description: string;
  confidence: number;
  reason: string;
}

function getRecommendedFrameworks(scene: CompositionScene, context: RecommendationContext): FrameworkSuggestion[] {
  const suggestions: FrameworkSuggestion[] = [];
  const title = scene.title.toLowerCase();
  const script = scene.voiceover.text.toLowerCase();

  // Scenario-based framework matching
  if (context.scenario === 'investor_pitch') {
    if (title.includes('market') || script.includes('market size') || script.includes('tam')) {
      suggestions.push({ framework: 'tam_sam_som', label: 'TAM/SAM/SOM', description: 'Market sizing with nested circles', confidence: 0.9, reason: 'Investors expect structured market sizing' });
    }
    if (title.includes('competition') || title.includes('competitor') || script.includes('competitor')) {
      suggestions.push({ framework: 'quadrant', label: 'Competitive Quadrant', description: '2x2 positioning vs competitors', confidence: 0.85, reason: 'Visual competitive positioning resonates with investors' });
    }
    if (title.includes('traction') || title.includes('metric') || script.includes('revenue') || script.includes('growth')) {
      suggestions.push({ framework: 'kpi_dashboard', label: 'KPI Dashboard', description: 'Key metrics with gauges and trends', confidence: 0.85, reason: 'Traction slides need clear, scannable KPIs' });
      suggestions.push({ framework: 'bridge_waterfall', label: 'Bridge/Waterfall', description: 'Revenue bridge showing growth drivers', confidence: 0.7, reason: 'Waterfall charts show how you get from A to B' });
    }
    if (title.includes('business model') || title.includes('model') || script.includes('revenue model')) {
      suggestions.push({ framework: 'funnel', label: 'Funnel Diagram', description: 'Revenue funnel from awareness to conversion', confidence: 0.8, reason: 'Funnel visualization makes business models intuitive' });
    }
    if (title.includes('roadmap') || title.includes('plan') || title.includes('timeline')) {
      suggestions.push({ framework: 'timeline_roadmap', label: 'Product Roadmap', description: 'Horizontal timeline with milestones', confidence: 0.9, reason: 'Investors want to see where you\'re headed' });
      suggestions.push({ framework: 'three_horizons', label: 'Three Horizons', description: 'Short/medium/long term growth strategy', confidence: 0.75, reason: 'Three Horizons shows strategic depth' });
    }
    // Default for investor: exec summary
    suggestions.push({ framework: 'exec_summary', label: 'Executive Summary', description: 'Insight → So What → Now What', confidence: 0.6, reason: 'Classic consulting structure for any investor slide' });
  }

  // Content-intent based
  if (context.intent === 'comparison') {
    suggestions.push({ framework: 'quadrant', label: 'Quadrant Analysis', description: 'Position options on a 2x2 matrix', confidence: 0.85, reason: '2x2 matrices make comparisons instantly clear' });
  }

  if (context.intent === 'tutorial' || title.includes('step') || title.includes('process') || title.includes('how')) {
    suggestions.push({ framework: 'swimlane', label: 'Process Swimlane', description: 'Step-by-step process with role lanes', confidence: 0.8, reason: 'Swimlanes clarify who does what in a process' });
    suggestions.push({ framework: 'customer_journey', label: 'Journey Map', description: 'Stage-by-stage journey visualization', confidence: 0.7, reason: 'Journey maps show the user flow visually' });
  }

  // Keyword-based detection from title/script
  if (title.includes('strength') || title.includes('weakness') || script.includes('swot')) {
    suggestions.push({ framework: 'swot', label: 'SWOT Analysis', description: '2x2 strategic analysis grid', confidence: 0.9, reason: 'SWOT is the most recognized strategic framework' });
  }

  if (title.includes('story') || title.includes('narrative') || context.scenario === 'brand_story') {
    suggestions.push({ framework: 'hero_journey', label: "Hero's Journey", description: '3-act transformation arc', confidence: 0.8, reason: 'Story-driven slides follow narrative structure' });
    suggestions.push({ framework: 'scqa', label: 'SCQA', description: 'Situation → Complication → Question → Answer', confidence: 0.7, reason: 'SCQA is a proven consulting storytelling framework' });
  }

  if (title.includes('benefit') || title.includes('value') || title.includes('why')) {
    suggestions.push({ framework: 'problem_solution', label: 'Problem → Solution', description: 'Problem, agitate, solve, benefit, CTA', confidence: 0.75, reason: 'Problem-solution structure is the most persuasive' });
    suggestions.push({ framework: 'aida', label: 'AIDA', description: 'Attention → Interest → Desire → Action', confidence: 0.65, reason: 'AIDA is a classic marketing persuasion framework' });
  }

  if (title.includes('ecosystem') || title.includes('stakeholder') || script.includes('partner')) {
    suggestions.push({ framework: 'ecosystem_map', label: 'Ecosystem Map', description: 'Stakeholder and partnership visualization', confidence: 0.8, reason: 'Ecosystem maps show relationship complexity visually' });
  }

  // Fallback: Pyramid Principle is always a safe suggestion
  if (suggestions.length === 0) {
    suggestions.push({ framework: 'pyramid_principle', label: 'Pyramid Principle', description: 'Answer-first, then supporting arguments', confidence: 0.5, reason: 'The Pyramid Principle works for any data-driven slide' });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ─── Character Style Recommendations ────────────────────────────────────────

function recommendCharacterStyles(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    if (scene.renderConfig?.characterConfig) continue; // Already configured

    // Only recommend character styles for avatar, video, cinematic, animation scenes
    const visualType = scene.visual.type;
    if (!['avatar', 'video', 'cinematic', 'animation', '3d'].includes(visualType)) continue;

    const styles = getRecommendedCharacterStyles(scene, context);
    if (styles.length === 0) continue;

    const primary = styles[0];
    recs.push({
      id: crypto.randomUUID(),
      type: 'character_style',
      sceneId: scene.id,
      title: `${primary.label} character style`,
      description: primary.description,
      confidence: primary.confidence,
      reason: primary.reason,
      action: {
        renderConfig: {
          characterConfig: {
            characterStyle: primary.style,
            characterScale: primary.scale,
            count: 1,
          },
        },
      },
      alternatives: styles.slice(1, 4).map(s => ({
        label: s.label,
        action: {
          renderConfig: {
            characterConfig: {
              characterStyle: s.style,
              characterScale: s.scale,
              count: 1,
            },
          },
        },
      })),
    });
  }

  return recs;
}

interface CharacterStyleSuggestion {
  style: CharacterStyle;
  scale: CharacterScale;
  label: string;
  description: string;
  confidence: number;
  reason: string;
}

function getRecommendedCharacterStyles(scene: CompositionScene, context: RecommendationContext): CharacterStyleSuggestion[] {
  const suggestions: CharacterStyleSuggestion[] = [];
  const type = scene.visual.type;
  const style = scene.sceneStyle;

  // Avatar scenes — recommend character rendering style + scale
  if (type === 'avatar') {
    suggestions.push(
      { style: 'realistic_3d', scale: 'medium_shot', label: 'Realistic 3D Presenter', description: 'Photorealistic talking head (MetaHuman quality)', confidence: 0.8, reason: 'Realistic avatars build trust for professional content' },
      { style: 'pixar_3d', scale: 'medium_shot', label: 'Pixar-Style 3D', description: 'Expressive, friendly Pixar-quality character', confidence: 0.75, reason: 'Pixar-style characters are engaging and approachable' },
      { style: 'flat_2d', scale: 'three_quarter', label: 'Flat 2D Character', description: 'Clean, modern flat design character', confidence: 0.6, reason: 'Flat characters work well for explainer content' },
      { style: 'anime_2d', scale: 'medium_shot', label: 'Anime Style', description: 'Japanese anime character style', confidence: 0.5, reason: 'Anime style resonates with younger audiences and CJK markets' },
    );
  }

  // Cinematic scenes
  if (type === 'cinematic') {
    suggestions.push(
      { style: 'cinematic_real', scale: 'full_body', label: 'Cinematic Live-Action', description: 'Film-quality photorealistic characters', confidence: 0.85, reason: 'Cinematic scenes demand realistic character rendering' },
      { style: 'cinematic_noir', scale: 'close_up', label: 'Film Noir', description: 'High contrast, dramatic shadows', confidence: 0.5, reason: 'Noir style adds dramatic tension' },
      { style: 'cinematic_scifi', scale: 'full_body', label: 'Sci-Fi Cinematic', description: 'Futuristic characters (Blade Runner, Tron)', confidence: 0.4, reason: 'Sci-fi style suits tech and innovation narratives' },
    );
  }

  // 3D scenes
  if (type === '3d') {
    suggestions.push(
      { style: 'pixar_3d', scale: 'full_body', label: 'Pixar/Disney 3D', description: 'High-quality stylized 3D with expressive features', confidence: 0.85, reason: 'Pixar-quality 3D is universally appealing and memorable' },
      { style: 'low_poly_3d', scale: 'full_body', label: 'Low Poly 3D', description: 'Abstract geometric 3D style', confidence: 0.6, reason: 'Low-poly is modern, fast to render, and trendy' },
      { style: 'voxel_3d', scale: 'full_body', label: 'Voxel 3D', description: 'Blocky, Minecraft-inspired characters', confidence: 0.4, reason: 'Voxel style is fun for gaming and youth audiences' },
      { style: 'claymation_3d', scale: 'full_body', label: 'Claymation', description: 'Stop-motion clay texture (Wallace & Gromit)', confidence: 0.45, reason: 'Claymation adds charm and uniqueness' },
    );
  }

  // Animation scenes
  if (type === 'animation') {
    suggestions.push(
      { style: 'flat_2d', scale: 'three_quarter', label: 'Flat 2D Animation', description: 'Clean vector animation (Material Design inspired)', confidence: 0.8, reason: 'Flat animation is fast, clean, and professional' },
      { style: 'sketch_2d', scale: 'three_quarter', label: 'Sketch Animation', description: 'Hand-drawn pencil sketch feel', confidence: 0.65, reason: 'Sketch style adds authenticity to whiteboard content' },
      { style: 'comic_2d', scale: 'medium_shot', label: 'Comic Book', description: 'Bold outlines, comic panels, action effects', confidence: 0.55, reason: 'Comic style is energetic and attention-grabbing' },
      { style: 'pixel_art_2d', scale: 'full_body', label: 'Pixel Art', description: 'Retro 8-bit / 16-bit pixel characters', confidence: 0.4, reason: 'Pixel art is nostalgic and distinctive for tech audiences' },
    );
  }

  // Style-based overrides
  if (style === 'luxury') {
    suggestions.unshift({ style: 'cinematic_real', scale: 'close_up', label: 'Luxury Cinematic', description: 'Premium, photorealistic with shallow depth of field', confidence: 0.9, reason: 'Luxury brands need photorealistic, high-production characters' });
  }
  if (style === 'hand_drawn') {
    suggestions.unshift({ style: 'sketch_2d', scale: 'three_quarter', label: 'Hand-Drawn Sketch', description: 'Pencil sketch characters on whiteboard', confidence: 0.9, reason: 'Hand-drawn style matches your scene aesthetic' });
  }
  if (style === 'futuristic') {
    suggestions.unshift({ style: 'cinematic_scifi', scale: 'full_body', label: 'Sci-Fi Characters', description: 'Futuristic characters with holographic elements', confidence: 0.85, reason: 'Futuristic style demands sci-fi character rendering' });
  }

  // Region/audience overrides
  if (context.targetRegion?.startsWith('jp') || context.targetRegion?.startsWith('kr')) {
    suggestions.push({ style: 'anime_2d', scale: 'medium_shot', label: 'Anime (CJK)', description: 'Anime character style popular in Japan/Korea', confidence: 0.8, reason: 'Anime resonates strongly with CJK audiences' });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ─── Rendering Mode Recommendations ─────────────────────────────────────────

function recommendRenderingModes(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    if (scene.renderConfig?.renderingMode) continue; // Already configured

    const modes = getRecommendedRenderingModes(scene, context);
    if (modes.length === 0) continue;

    const primary = modes[0];
    recs.push({
      id: crypto.randomUUID(),
      type: 'rendering_mode',
      sceneId: scene.id,
      title: `Render as "${primary.label}"`,
      description: primary.description,
      confidence: primary.confidence,
      reason: primary.reason,
      action: {
        renderConfig: {
          renderingMode: primary.mode,
          lighting: primary.lighting,
          colorGrade: primary.colorGrade,
          depthOfField: primary.depthOfField,
          filmGrain: primary.filmGrain,
        },
      },
      alternatives: modes.slice(1, 4).map(m => ({
        label: m.label,
        action: {
          renderConfig: {
            renderingMode: m.mode,
            lighting: m.lighting,
            colorGrade: m.colorGrade,
          },
        },
      })),
    });
  }

  return recs;
}

interface RenderModeSuggestion {
  mode: RenderingMode;
  label: string;
  description: string;
  confidence: number;
  reason: string;
  lighting?: SceneRenderConfig['lighting'];
  colorGrade?: SceneRenderConfig['colorGrade'];
  depthOfField?: SceneRenderConfig['depthOfField'];
  filmGrain?: number;
}

function getRecommendedRenderingModes(scene: CompositionScene, context: RecommendationContext): RenderModeSuggestion[] {
  const suggestions: RenderModeSuggestion[] = [];
  const type = scene.visual.type;
  const style = scene.sceneStyle;

  // Map visual type to rendering modes
  if (type === 'cinematic') {
    suggestions.push(
      { mode: 'photorealistic', label: 'Photorealistic Cinema', description: 'Film-quality with cinematic color grading and shallow DOF', confidence: 0.9, reason: 'Cinematic scenes should look like professional film', lighting: 'dramatic', colorGrade: 'cinematic_teal_orange', depthOfField: 'shallow', filmGrain: 0.15 },
      { mode: 'vintage_film', label: 'Vintage Film Look', description: 'Retro 8mm/Super 8 with grain and warm tones', confidence: 0.5, reason: 'Vintage film adds nostalgic warmth', lighting: 'warm', colorGrade: 'warm_vintage', filmGrain: 0.4 },
      { mode: 'neon_glow', label: 'Neon Cyberpunk', description: 'Neon lights, reflections, cyberpunk atmosphere', confidence: 0.4, reason: 'Neon glow is striking for tech/futuristic content', lighting: 'neon', colorGrade: 'vibrant' },
    );
  }

  if (type === 'avatar') {
    suggestions.push(
      { mode: 'photorealistic', label: 'Photorealistic', description: 'Realistic rendering with studio lighting', confidence: 0.8, reason: 'Realistic avatars build trust', lighting: 'studio', colorGrade: 'none', depthOfField: 'shallow' },
      { mode: 'stylized_3d', label: 'Stylized 3D', description: 'Pixar-quality stylized rendering', confidence: 0.7, reason: 'Stylized 3D is appealing and friendly', lighting: 'natural' },
      { mode: 'cel_shaded', label: 'Cel Shaded', description: 'Cartoon-like flat shading on 3D model', confidence: 0.5, reason: 'Cel shading makes 3D characters feel hand-animated', lighting: 'studio' },
    );
  }

  if (type === 'animation') {
    suggestions.push(
      { mode: 'flat_design', label: 'Flat Design', description: 'Clean, minimal 2D with bold colors', confidence: 0.85, reason: 'Flat design is the standard for professional animation', lighting: 'natural', colorGrade: 'vibrant' },
      { mode: 'watercolor', label: 'Watercolor', description: 'Soft, painted watercolor aesthetic', confidence: 0.5, reason: 'Watercolor adds artistic warmth to animations', colorGrade: 'pastel' },
      { mode: 'pencil_sketch', label: 'Pencil Sketch', description: 'Hand-drawn pencil/charcoal look', confidence: 0.6, reason: 'Sketch rendering is great for whiteboard explainers' },
    );
  }

  if (type === '3d') {
    suggestions.push(
      { mode: 'stylized_3d', label: 'Stylized 3D', description: 'Appealing, stylized 3D rendering', confidence: 0.8, reason: '3D models look best with stylized rendering', lighting: 'studio' },
      { mode: 'holographic', label: 'Holographic', description: 'Translucent, holographic 3D display', confidence: 0.6, reason: 'Holographic rendering adds futuristic appeal to 3D models', lighting: 'neon' },
      { mode: 'wireframe', label: 'Wireframe', description: 'Technical wireframe visualization', confidence: 0.4, reason: 'Wireframe shows technical structure of 3D models' },
      { mode: 'isometric', label: 'Isometric', description: 'Isometric projection for clean technical view', confidence: 0.55, reason: 'Isometric view is clear and professional for product 3D' },
    );
  }

  if (type === 'static' || type === 'broll') {
    suggestions.push(
      { mode: 'photorealistic', label: 'Photo Quality', description: 'Professional photography look', confidence: 0.7, reason: 'Photo-quality rendering makes images look professional', colorGrade: 'none' },
      { mode: 'oil_painting', label: 'Oil Painting', description: 'Rich, textured oil paint aesthetic', confidence: 0.3, reason: 'Oil painting style adds artistic uniqueness' },
      { mode: 'miniature', label: 'Tilt-Shift Miniature', description: 'Selective focus making scenes look like tiny models', confidence: 0.4, reason: 'Tilt-shift creates a unique, attention-grabbing look', depthOfField: 'tilt_shift' },
    );
  }

  if (type === 'slide') {
    suggestions.push(
      { mode: 'flat_design', label: 'Flat Design Slides', description: 'Clean, modern flat design for presentations', confidence: 0.9, reason: 'Flat design is the standard for professional slides', colorGrade: 'none' },
      { mode: 'isometric', label: 'Isometric Slides', description: 'Isometric illustrations in slides for a 3D feel', confidence: 0.5, reason: 'Isometric adds visual depth to data presentations' },
    );
  }

  // Style-based overrides
  if (style === 'retro') {
    suggestions.unshift({ mode: 'vintage_film', label: 'Vintage Film', description: 'Retro film grain, warm tones, vignette', confidence: 0.9, reason: 'Retro style should use vintage film rendering', colorGrade: 'warm_vintage', filmGrain: 0.3, lighting: 'warm' });
  }
  if (style === 'luxury') {
    suggestions.unshift({ mode: 'photorealistic', label: 'Luxury Photorealistic', description: 'Ultra-premium with shallow DOF and golden hour lighting', confidence: 0.9, reason: 'Luxury demands photorealistic, premium rendering', lighting: 'golden_hour', colorGrade: 'cinematic_teal_orange', depthOfField: 'shallow' });
  }
  if (style === 'futuristic') {
    suggestions.unshift({ mode: 'neon_glow', label: 'Neon Futuristic', description: 'Neon lights, holographic elements, cyberpunk', confidence: 0.85, reason: 'Futuristic style pairs naturally with neon rendering', lighting: 'neon', colorGrade: 'vibrant' });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ─── Visualization Type Recommendations ──────────────────────────────────────

function recommendVisualizationTypes(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    // Only recommend for slides/animation/static scenes that discuss data
    if (!['slide', 'animation', 'static'].includes(scene.visual.type)) continue;
    if (scene.dataVisualizations && scene.dataVisualizations.length > 0) continue;

    const script = scene.voiceover.text.toLowerCase();
    const title = scene.title.toLowerCase();
    const chartSuggestions = detectChartType(title, script, context);

    if (chartSuggestions.length === 0) continue;

    const primary = chartSuggestions[0];
    recs.push({
      id: crypto.randomUUID(),
      type: 'visualization',
      sceneId: scene.id,
      title: `Add ${primary.label} visualization`,
      description: primary.description,
      confidence: primary.confidence,
      reason: primary.reason,
      action: {
        dataVisualizations: [{
          id: crypto.randomUUID(),
          chartType: primary.chartType,
          title: scene.title,
          data: [],
          dataSources: [],
          chartConfig: { animated: true, animationStyle: primary.animationStyle, showLegend: true },
          requiresVerification: true,
        }],
      },
      alternatives: chartSuggestions.slice(1, 4).map(c => ({
        label: c.label,
        action: { chartType: c.chartType },
      })),
    });
  }

  return recs;
}

interface ChartSuggestion {
  chartType: ChartType;
  label: string;
  description: string;
  confidence: number;
  reason: string;
  animationStyle: 'count_up' | 'grow' | 'reveal' | 'fade_in' | 'draw';
}

function detectChartType(title: string, script: string, context: RecommendationContext): ChartSuggestion[] {
  const suggestions: ChartSuggestion[] = [];
  const combined = `${title} ${script}`;

  if (combined.includes('market size') || combined.includes('tam') || combined.includes('sam') || combined.includes('som')) {
    suggestions.push({ chartType: 'funnel', label: 'Market Funnel (TAM/SAM/SOM)', description: 'Nested funnel showing addressable market layers', confidence: 0.9, reason: 'Market sizing data is best visualized as a nested funnel', animationStyle: 'grow' });
  }
  if (combined.includes('growth') || combined.includes('trend') || combined.includes('over time') || combined.includes('year')) {
    suggestions.push({ chartType: 'line', label: 'Trend Line Chart', description: 'Line/area chart showing growth or trend over time', confidence: 0.85, reason: 'Time-series data is most intuitive as a line chart', animationStyle: 'draw' });
    suggestions.push({ chartType: 'area', label: 'Area Chart', description: 'Filled area chart showing cumulative growth', confidence: 0.7, reason: 'Area charts emphasize volume of growth', animationStyle: 'grow' });
  }
  if (combined.includes('compare') || combined.includes('vs') || combined.includes('versus') || combined.includes('competitor')) {
    suggestions.push({ chartType: 'bar', label: 'Comparison Bar Chart', description: 'Side-by-side bar chart for direct comparison', confidence: 0.85, reason: 'Bar charts make comparisons instantly scannable', animationStyle: 'grow' });
    suggestions.push({ chartType: 'radar', label: 'Radar Comparison', description: 'Multi-axis radar for capability comparison', confidence: 0.65, reason: 'Radar charts compare across multiple dimensions simultaneously', animationStyle: 'draw' });
  }
  if (combined.includes('share') || combined.includes('breakdown') || combined.includes('portion') || combined.includes('distribution')) {
    suggestions.push({ chartType: 'pie', label: 'Pie/Donut Chart', description: 'Proportional breakdown visualization', confidence: 0.75, reason: 'Pie charts clearly show parts of a whole', animationStyle: 'grow' });
    suggestions.push({ chartType: 'treemap', label: 'Treemap', description: 'Hierarchical proportional rectangles', confidence: 0.6, reason: 'Treemaps show proportional hierarchy with more detail than pie', animationStyle: 'grow' });
  }
  if (combined.includes('journey') || combined.includes('stages') || combined.includes('flow') || combined.includes('conversion')) {
    suggestions.push({ chartType: 'funnel', label: 'Funnel Diagram', description: 'Stage-by-stage funnel with drop-off rates', confidence: 0.85, reason: 'Funnel visualizes conversion progression', animationStyle: 'reveal' });
    suggestions.push({ chartType: 'sankey', label: 'Sankey Flow', description: 'Flow quantities between stages', confidence: 0.7, reason: 'Sankey diagrams show flow and drop-off between stages', animationStyle: 'draw' });
  }
  if (combined.includes('kpi') || combined.includes('metric') || combined.includes('score') || combined.includes('nps')) {
    suggestions.push({ chartType: 'gauge', label: 'Gauge Meter', description: 'KPI gauges with progress toward target', confidence: 0.85, reason: 'Gauge meters instantly communicate performance vs target', animationStyle: 'count_up' });
  }
  if (combined.includes('map') || combined.includes('region') || combined.includes('country') || combined.includes('geographic')) {
    suggestions.push({ chartType: 'geographic', label: 'Geographic Map', description: 'Map-based visualization with regional data', confidence: 0.85, reason: 'Geographic data is most intuitive on a map', animationStyle: 'reveal' });
  }
  if (combined.includes('timeline') || combined.includes('milestone') || combined.includes('roadmap')) {
    suggestions.push({ chartType: 'timeline', label: 'Timeline', description: 'Chronological timeline with milestones', confidence: 0.9, reason: 'Timelines visualize chronological progression', animationStyle: 'reveal' });
  }
  if (combined.includes('network') || combined.includes('connection') || combined.includes('relationship') || combined.includes('partner')) {
    suggestions.push({ chartType: 'network', label: 'Network Graph', description: 'Node-and-edge relationship visualization', confidence: 0.75, reason: 'Network graphs show complex relationships', animationStyle: 'fade_in' });
  }
  if (combined.includes('stat') || combined.includes('number') || combined.includes('percentage') || combined.includes('%')) {
    suggestions.push({ chartType: 'bar', label: 'Statistic Bar', description: 'Animated stat bars with count-up numbers', confidence: 0.7, reason: 'Key statistics benefit from animated count-up presentation', animationStyle: 'count_up' });
  }
  if (combined.includes('org') || combined.includes('team') || combined.includes('hierarchy') || combined.includes('structure')) {
    suggestions.push({ chartType: 'org_chart', label: 'Org Chart', description: 'Organizational hierarchy visualization', confidence: 0.85, reason: 'Org charts show reporting structure clearly', animationStyle: 'reveal' });
  }
  if (combined.includes('idea') || combined.includes('brainstorm') || combined.includes('concept')) {
    suggestions.push({ chartType: 'mind_map', label: 'Mind Map', description: 'Radial concept map with branches', confidence: 0.8, reason: 'Mind maps visualize ideation and concept relationships', animationStyle: 'reveal' });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ─── Data Source Recommendations ─────────────────────────────────────────────

function recommendDataSources(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    const script = scene.voiceover.text.toLowerCase();
    if (script.length < 30) continue;

    // Detect claims that need data sources
    const hasStatistics = /\d+%|\$[\d,.]+|[\d,.]+\s*(million|billion|trillion|users|customers|revenue)/i.test(scene.voiceover.text);
    const hasClaims = /(according to|research shows|studies show|data suggests|survey found|report by)/i.test(scene.voiceover.text);
    const hasUnreferencedData = hasStatistics && (!scene.dataSources || scene.dataSources.length === 0);

    if (hasUnreferencedData) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'data_source',
        sceneId: scene.id,
        title: 'Add data sources for statistics',
        description: `"${scene.title}" contains statistics or data claims — add source URLs for credibility and transparency`,
        confidence: 0.9,
        reason: 'Statistics and data claims should cite their source for credibility. AI-generated data may contain errors.',
        action: {
          dataSources: [{
            id: crypto.randomUUID(),
            type: 'ai_generated' as const,
            label: 'AI-Generated (needs verification)',
            verified: false,
            dataConfidence: 0.5,
          }],
        },
        alternatives: [
          { label: 'Add URL source', action: { sourceType: 'url' } },
          { label: 'Add research paper', action: { sourceType: 'research_paper' } },
          { label: 'Mark as estimated', action: { sourceType: 'ai_generated', dataConfidence: 0.3 } },
          { label: 'Google Places data', action: { sourceType: 'google_places' } },
        ],
      });
    }

    if (hasClaims && (!scene.dataSources || scene.dataSources.length === 0)) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'data_source',
        sceneId: scene.id,
        title: 'Verify cited claims',
        description: `"${scene.title}" references external data ("according to...", "research shows...") — attach the actual source`,
        confidence: 0.85,
        reason: 'Claims referencing external research should link to the actual source document',
        action: {
          needsSourceVerification: true,
        },
      });
    }

    // For Google Places enriched projects — recommend live data injection
    if (context.hasGooglePlaces && !scene.dataSources?.some(d => d.type === 'google_places')) {
      const mentionsBusiness = /review|rating|star|hour|competitor|nearby|location/i.test(scene.voiceover.text);
      if (mentionsBusiness) {
        recs.push({
          id: crypto.randomUUID(),
          type: 'data_source',
          sceneId: scene.id,
          title: 'Inject Google Places live data',
          description: 'Use real business data (ratings, reviews, hours, competitors) from Google Places API',
          confidence: 0.8,
          reason: 'Live Google Places data adds authenticity — real reviews and ratings are more compelling than generic claims',
          action: {
            dataSources: [{
              id: crypto.randomUUID(),
              type: 'google_places' as const,
              label: 'Google Places API (Live)',
              verified: true,
              dataConfidence: 0.95,
            }],
          },
        });
      }
    }
  }

  return recs;
}

// ─── Content Verification Recommendations ───────────────────────────────────

function recommendContentVerification(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    if (scene.verifications && scene.verifications.length > 0) continue;
    const script = scene.voiceover.text;
    if (script.length < 20) continue;

    // Detect verifiable claims
    const verifiablePatterns = [
      { pattern: /\d+%/g, target: 'statistic' as const, label: 'percentages' },
      { pattern: /\$[\d,.]+\s*(million|billion|trillion)?/gi, target: 'statistic' as const, label: 'monetary values' },
      { pattern: /in\s+\d{4}/g, target: 'date' as const, label: 'dates/years' },
      { pattern: /(founded|established|launched)\s+in/gi, target: 'date' as const, label: 'founding dates' },
      { pattern: /"[^"]{10,}"/g, target: 'quote' as const, label: 'quotes' },
      { pattern: /(https?:\/\/[^\s]+)/g, target: 'url' as const, label: 'URLs' },
      { pattern: /(?:CEO|CTO|founder|president)\s+of\s+\w+/gi, target: 'name' as const, label: 'named people' },
    ];

    const detectedClaims: string[] = [];
    for (const { pattern, label } of verifiablePatterns) {
      const matches = script.match(pattern);
      if (matches && matches.length > 0) {
        detectedClaims.push(`${matches.length} ${label}`);
      }
    }

    if (detectedClaims.length > 0) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'verification',
        sceneId: scene.id,
        title: `Verify AI-generated content in "${scene.title}"`,
        description: `Detected: ${detectedClaims.join(', ')}. AI-generated content may contain errors — please verify.`,
        confidence: 0.85,
        reason: 'AI-generated statistics, dates, names, and quotes should be verified before publishing. Errors can damage credibility.',
        action: {
          verifications: detectedClaims.map(claim => ({
            id: crypto.randomUUID(),
            target: 'claim' as const,
            content: claim,
            status: 'unverified' as const,
            confidence: 0.5,
          })),
        },
        alternatives: [
          { label: 'Auto-verify with AI', action: { verifyMode: 'ai_auto' } },
          { label: 'Flag for human review', action: { verifyMode: 'human' } },
          { label: 'Add disclaimer', action: { addDisclaimer: true } },
        ],
      });
    }
  }

  return recs;
}

// ─── Spell Check & Grammar Recommendations ──────────────────────────────────

function recommendSpellGrammar(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  for (const scene of scenes) {
    if (scene.languageQuality) continue; // Already checked
    const script = scene.voiceover.text;
    if (script.length < 20) continue;

    // Basic heuristic checks (real spell check would use API)
    const issues: string[] = [];

    // Check for common doubled words
    const doubledWords = script.match(/\b(\w+)\s+\1\b/gi);
    if (doubledWords) issues.push(`${doubledWords.length} doubled word(s)`);

    // Check for missing capitalization after periods
    const missingCaps = script.match(/\.\s+[a-z]/g);
    if (missingCaps && missingCaps.length > 0) issues.push(`${missingCaps.length} missing capitalization(s)`);

    // Check for very long sentences (readability)
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 40);
    if (longSentences.length > 0) issues.push(`${longSentences.length} very long sentence(s) — may reduce clarity`);

    // Check for passive voice indicators
    const passiveIndicators = script.match(/\b(was|were|been|being|is|are)\s+\w+ed\b/gi);
    if (passiveIndicators && passiveIndicators.length > 2) issues.push(`${passiveIndicators.length} passive voice instance(s)`);

    // Check for jargon/complexity (simple readability heuristic)
    const avgWordLength = script.split(/\s+/).reduce((sum, w) => sum + w.length, 0) / Math.max(script.split(/\s+/).length, 1);
    if (avgWordLength > 6.5) issues.push('High average word length — may be too complex for general audience');

    // Always recommend spell/grammar check for scripts over a certain length
    if (script.length > 100 || issues.length > 0) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'spell_grammar',
        sceneId: scene.id,
        title: issues.length > 0 ? `Review language quality in "${scene.title}"` : `Run spell & grammar check on "${scene.title}"`,
        description: issues.length > 0
          ? `Detected: ${issues.join('; ')}. Run full spell check + grammar + clarity analysis.`
          : `No obvious issues detected, but a full spell check + readability analysis is recommended before publishing.`,
        confidence: issues.length > 0 ? 0.8 : 0.5,
        reason: 'AI-generated scripts can contain spelling errors, grammar issues, and unclear phrasing. Checking ensures professional quality.',
        action: {
          runSpellCheck: true,
          runGrammarCheck: true,
          runClarityCheck: true,
          detectedIssues: issues,
        },
        alternatives: [
          { label: 'Auto-fix all', action: { autoFix: true } },
          { label: 'Review manually', action: { manualReview: true } },
          { label: 'Simplify language', action: { simplify: true, targetReadingLevel: 'Grade 8' } },
        ],
      });
    }
  }

  return recs;
}

// ─── Cross-Format Conversion Recommendations ────────────────────────────────

function recommendCrossFormatConversions(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  const hasSlides = scenes.some(s => s.visual.type === 'slide');
  const hasCinematic = scenes.some(s => s.visual.type === 'cinematic');
  const has3D = scenes.some(s => s.visual.type === '3d');
  const hasVoiceover = scenes.some(s => s.voiceover.type !== 'none');
  const hasAnimation = scenes.some(s => s.visual.type === 'animation');

  // Slides → cinematic video (the PPT to cinematic flow)
  if (hasSlides && !hasCinematic) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'cross_format',
      title: 'Convert slides to cinematic video',
      description: 'Transform your slide scenes into a cinematic storytelling video — each slide becomes a movie scene with motion, effects, and narration',
      confidence: 0.8,
      reason: 'Slide content can reach a wider audience as cinematic video — story format is more engaging than static slides',
      action: {
        conversionType: 'slides_to_cinematic',
        settings: {
          cinematicStyle: 'cinematic',
          narrationStyle: 'voiceover',
          animationIntensity: 0.7,
          preserveSources: true,
        },
      },
      combinationSteps: [
        { step: 1, label: 'Slide Analysis', description: 'Extract content, data points, and narrative from each slide' },
        { step: 2, label: 'Story Arc', description: 'Reorganize slide content into a narrative arc' },
        { step: 3, label: 'Cinematic Generation', description: 'Generate cinematic visuals for each story beat' },
        { step: 4, label: 'Motion + Transitions', description: 'Add cinematic motion, camera angles, transitions' },
        { step: 5, label: 'Narration', description: 'Generate storytelling voiceover from slide content' },
        { step: 6, label: 'Assembly', description: 'Final cinematic video assembly' },
      ],
      alternatives: [
        { label: 'Slides → 3D Presentation', action: { conversionType: 'slides_to_3d' } },
        { label: 'Slides → Narrated Video', action: { conversionType: 'slides_to_video' } },
        { label: 'Keep as slides', action: { conversionType: 'none' } },
      ],
    });
  }

  // Slides + 3D → cinematic (the user's exact flow: PPT in 3D → cinematic video)
  if (hasSlides && has3D) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'cross_format',
      title: '3D slides → cinematic story video',
      description: 'Your 3D slide scenes can be converted into a cinematic video — customer journey, infographics, and data come alive as a story',
      confidence: 0.85,
      reason: '3D presentation content makes stunning cinematic video — data visualizations look impressive in motion',
      action: {
        conversionType: 'slides_to_cinematic',
        settings: {
          renderAs3D: true,
          cinematicStyle: 'cinematic',
          animationIntensity: 0.8,
        },
      },
    });
  }

  // Infographic/data scenes → animated video
  if (hasAnimation && scenes.some(s => s.dataVisualizations && s.dataVisualizations.length > 0)) {
    recs.push({
      id: crypto.randomUUID(),
      type: 'cross_format',
      title: 'Convert infographics to animated video',
      description: 'Transform static data visualizations into animated video with count-up effects, transitions, and narration',
      confidence: 0.75,
      reason: 'Animated data videos get higher engagement than static infographics on social media',
      action: {
        conversionType: 'infographic_to_video',
        settings: { animationIntensity: 0.6 },
      },
    });
  }

  // Any project with voiceover → podcast extraction
  if (hasVoiceover && scenes.length >= 3) {
    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
    if (totalDuration > 120) {
      recs.push({
        id: crypto.randomUUID(),
        type: 'cross_format',
        title: 'Extract as podcast episode',
        description: 'Your voiceover content can be repurposed as a podcast — add intro/outro music and publish to podcast platforms',
        confidence: 0.6,
        reason: 'Video content easily repurposes as audio — doubles your content output with minimal extra effort',
        action: {
          conversionType: 'video_to_podcast',
          settings: { narrationStyle: 'voiceover' },
        },
      });
    }
  }

  return recs;
}

// ─── Citation / Reference Recommendations ───────────────────────────────────

function recommendCitations(scenes: CompositionScene[], context: RecommendationContext): SceneRecommendation[] {
  const recs: SceneRecommendation[] = [];

  // Check if any scenes have data sources but no citation config
  const scenesWithSources = scenes.filter(s => s.dataSources && s.dataSources.length > 0);
  const hasAnyCitationConfig = scenes.some(s => s.citationConfig);

  if (scenesWithSources.length > 0 && !hasAnyCitationConfig) {
    const aiGeneratedSources = scenesWithSources
      .flatMap(s => s.dataSources || [])
      .filter(d => d.type === 'ai_generated');

    recs.push({
      id: crypto.randomUUID(),
      type: 'citation',
      title: 'Configure citation display',
      description: `${scenesWithSources.length} scene(s) have data sources. Choose how to display references and AI disclaimers.`,
      confidence: 0.75,
      reason: 'Transparent data attribution builds trust. AI-generated content should be disclosed.',
      action: {
        citationConfig: {
          displayMode: 'footnote',
          format: 'apa',
          showAIDisclaimer: aiGeneratedSources.length > 0,
          disclaimerPosition: 'end_card',
          aiDisclaimerText: 'Some data in this content was AI-generated. Sources have been verified where possible.',
        },
      },
      alternatives: [
        { label: 'Footnotes', action: { displayMode: 'footnote' } },
        { label: 'End card bibliography', action: { displayMode: 'bibliography' } },
        { label: 'Inline tooltips', action: { displayMode: 'tooltip' } },
        { label: 'Voiceover mention', action: { disclaimerPosition: 'voiceover_mention' } },
      ],
    });
  }

  return recs;
}

// ─── Apply Recommendation ────────────────────────────────────────────────────

/** Apply a recommendation's action to a scene or project */
export function applyRecommendation(
  scenes: CompositionScene[],
  recommendation: SceneRecommendation,
): CompositionScene[] {
  const { sceneId, action, type } = recommendation;

  if (sceneId) {
    // Scene-level recommendation
    return scenes.map(s => {
      if (s.id !== sceneId) return s;

      switch (type) {
        case 'duration':
          return { ...s, duration: (action as any).duration || s.duration };
        case 'transition':
          return {
            ...s,
            visual: { ...s.visual, transitionOut: (action as any).transitionOut },
          };
        case 'style':
          return { ...s, sceneStyle: (action as any).sceneStyle };
        case 'broll':
          return {
            ...s,
            bRoll: [...(s.bRoll || []), { id: crypto.randomUUID(), ...(action as any).bRoll }],
          };
        case 'clip':
          return {
            ...s,
            isClipCandidate: true,
            clipMetadata: { suggestedPlatforms: (action as any).suggestedPlatforms || [] },
          };
        case 'music':
          return { ...s, backgroundMusic: (action as any).backgroundMusic };
        case 'caption':
          return { ...s, captionOverrides: (action as any).captionOverrides };
        case 'thumbnail':
          return { ...s, thumbnailConfig: (action as any).thumbnailConfig };
        case 'transcreation':
          return { ...s, transcreationOverrides: (action as any).transcreationOverrides };
        case 'visual_source':
        case 'visual_enhance':
        case 'regenerate':
          return {
            ...s,
            visualPipeline: { ...s.visualPipeline, ...(action as any).visualPipeline },
            status: 'draft', // Needs regeneration
          };
        case 'motion':
          return { ...s, motionPreset: (action as any).motionPreset };
        case 'size_variant':
          return {
            ...s,
            sizeVariants: [
              ...(s.sizeVariants || []),
              ...((action as any).sizeVariants || []),
            ],
          };
        case 'scenario':
          return { ...s, scenario: (action as any).scenario || s.scenario };
        case 'slide_framework':
          return { ...s, slideFramework: (action as any).slideFramework || s.slideFramework };
        case 'character_style':
          return {
            ...s,
            renderConfig: {
              ...s.renderConfig,
              renderingMode: s.renderConfig?.renderingMode || 'stylized_3d',
              ...(action as any).renderConfig,
            },
            status: 'draft',
          };
        case 'rendering_mode':
          return {
            ...s,
            renderConfig: {
              ...s.renderConfig,
              ...(action as any).renderConfig,
            },
            status: 'draft',
          };
        case 'combination':
        case 'cross_format':
          // Combination chains and cross-format conversions are project-level actions
          return s;
        case 'reorder': {
          // Handled at project level, not scene level
          return s;
        }
        case 'visualization':
          return {
            ...s,
            dataVisualizations: [
              ...(s.dataVisualizations || []),
              ...((action as any).dataVisualizations || []),
            ],
          };
        case 'data_source':
          return {
            ...s,
            dataSources: [
              ...(s.dataSources || []),
              ...((action as any).dataSources || []),
            ],
          };
        case 'verification':
          return {
            ...s,
            verifications: [
              ...(s.verifications || []),
              ...((action as any).verifications || []),
            ],
          };
        case 'spell_grammar':
          return {
            ...s,
            languageQuality: (action as any).languageQuality || s.languageQuality,
          };
        case 'citation':
          return {
            ...s,
            citationConfig: (action as any).citationConfig || s.citationConfig,
          };
        default:
          return s;
      }
    });
  }

  // Project-level recommendations (no specific scene)
  return scenes;
}

/** Dismiss a recommendation (mark as dismissed) */
export function dismissRecommendation(
  recommendations: SceneRecommendation[],
  recommendationId: string,
): SceneRecommendation[] {
  return recommendations.map(r =>
    r.id === recommendationId ? { ...r, dismissed: true } : r
  );
}

/** Get active (non-dismissed, non-applied) recommendations */
export function getActiveRecommendations(recommendations: SceneRecommendation[]): SceneRecommendation[] {
  return recommendations.filter(r => !r.dismissed && !r.applied);
}

/** Get recommendations for a specific scene */
export function getSceneRecommendations(
  recommendations: SceneRecommendation[],
  sceneId: string,
): SceneRecommendation[] {
  return recommendations.filter(r => r.sceneId === sceneId && !r.dismissed && !r.applied);
}
