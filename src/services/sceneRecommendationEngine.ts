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
 * @see src/components/genie-admin/composition-studio/types.ts — types
 */

import type {
  CompositionScene,
  SceneRecommendation,
  SceneStyle,
  CompositionElementType,
} from '@/components/genie-admin/composition-studio/types';

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
  /** Business tier from economy profiles */
  businessTier?: 'nano' | 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  /** Google Places data available */
  hasGooglePlaces?: boolean;
  /** Target platforms */
  targetPlatforms?: string[];
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
        case 'reorder': {
          // Handled at project level, not scene level
          return s;
        }
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
