/**
 * CELEBRATION PRODUCTION BRIDGE
 *
 * Glue layer that resolves ceremony + culture + template → SceneEnrichmentInput
 * that the existing enrichment engine consumes.
 *
 * Handles:
 * - Cultural token resolution ({{colorPalette.primary}}, {{symbols[0].promptModifier}}, etc.)
 * - Ceremony role → character mapping
 * - Scene template → pipeline config translation
 * - Location-aware prompt injection
 * - Merging celebration cultural override with base regional creative config
 */

import { getCeremonyType, type CeremonyTypeDefinition, type CelebrationOutputFormat, type CeremonyRole } from '@/config/celebrations/ceremony-type-registry';
import { getCulturalOverrideWithFallback, getCityPromptModifier, type CeremonyCulturalOverride } from '@/config/celebrations/ceremony-cultural-config';
import { getSceneTemplate, type CeremonySceneTemplate, type CeremonySceneDefinition } from '@/config/celebrations/ceremony-scene-templates';
import type { SceneEnrichmentInput } from '@/services/production/sceneEnrichmentEngine';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface CelebrationProductionRequest {
  /** Ceremony type ID from registry */
  ceremonyId: string;
  /** Parent region code (one of 16) */
  regionCode: string;
  /** Subregion code (one of 62, optional) */
  subregionCode?: string;
  /** Output format */
  format: CelebrationOutputFormat;
  /** Language code for TTS/text */
  language: string;
  /** City name for location-aware generation */
  city?: string;
  /** Personalization data */
  personalization: CelebrationPersonalization;
  /** Visual style preference */
  visualStyle?: string;
  /** Quality tier */
  quality?: 'preview' | 'production' | 'cinematic';
  /** Reference photos (uploaded by user) */
  photos?: CelebrationPhotos;
  /** Whether this is a redesign from uploaded invitation */
  isRedesign?: boolean;
  /** Original invitation data (for redesign flow) */
  originalInvitationData?: Record<string, unknown>;
}

export interface CelebrationPersonalization {
  /** Names map: role → name */
  names: Record<string, string>;
  /** Event date */
  eventDate?: string;
  /** Event time */
  eventTime?: string;
  /** Venue name */
  venue?: string;
  /** Full venue address */
  venueAddress?: string;
  /** Custom message or quote */
  customMessage?: string;
  /** RSVP details (URL, phone, email) */
  rsvpDetails?: string;
  /** Additional context (theme, special requests) */
  additionalContext?: string;
}

export interface CelebrationPhotos {
  bride?: { url: string; consentGranted: boolean };
  groom?: { url: string; consentGranted: boolean };
  couple?: { url: string; consentGranted: boolean };
  venue?: { url: string };
  additional?: Array<{ url: string }>;
}

export interface CelebrationEnrichmentResult {
  /** Scene enrichment input ready for the engine */
  enrichmentInput: SceneEnrichmentInput;
  /** Resolved cultural override data */
  culturalOverride: CeremonyCulturalOverride;
  /** Resolved scene template */
  sceneTemplate: CeremonySceneTemplate;
  /** Ceremony type definition */
  ceremonyType: CeremonyTypeDefinition;
  /** Scene pipelines ready for orchestrator */
  scenePipelines: Record<string, Array<{ type: string; [key: string]: unknown }>>;
}

// ─── CULTURAL TOKEN RESOLUTION ───────────────────────────────────────────────

/**
 * Replace cultural tokens in prompt templates.
 * Tokens: {{colorPalette.primary}}, {{symbols[0].promptModifier}}, {{attire.primary}}, etc.
 */
export function resolveCulturalTokens(
  template: string,
  override: CeremonyCulturalOverride,
  personalization?: CelebrationPersonalization,
): string {
  let result = template;

  // Color palette tokens
  result = result.replace(/\{\{colorPalette\.primary\}\}/g, override.colorPalette.primary);
  result = result.replace(/\{\{colorPalette\.accent\}\}/g, override.colorPalette.accent);

  // Symbol tokens
  if (override.symbols.length > 0) {
    result = result.replace(/\{\{symbols\[0\]\.promptModifier\}\}/g, override.symbols[0].promptModifier);
    result = result.replace(/\{\{symbols\[0\]\.name\}\}/g, override.symbols[0].name);
  }
  if (override.symbols.length > 1) {
    result = result.replace(/\{\{symbols\[1\]\.promptModifier\}\}/g, override.symbols[1].promptModifier);
  }

  // Attire tokens
  result = result.replace(/\{\{attire\.primary\}\}/g, override.attire.primary);
  result = result.replace(/\{\{attire\.secondary\}\}/g, override.attire.secondary);

  // Setting tokens
  result = result.replace(/\{\{setting\.environmentPrompt\}\}/g, override.setting.environmentPrompt);
  result = result.replace(/\{\{setting\.lighting\}\}/g, override.setting.lighting);
  result = result.replace(/\{\{setting\.decorations\}\}/g, override.setting.decorations.join(', '));

  // Narrative tokens
  result = result.replace(/\{\{greetingPhrase\}\}/g, override.narrative.greetingPhrase || '');
  result = result.replace(/\{\{blessingPhrase\}\}/g, override.narrative.blessingPhrase || '');

  // Personalization tokens
  if (personalization) {
    result = result.replace(/\{\{names\.bride\}\}/g, personalization.names.bride || '');
    result = result.replace(/\{\{names\.groom\}\}/g, personalization.names.groom || '');
    result = result.replace(/\{\{venue\}\}/g, personalization.venue || '');
    result = result.replace(/\{\{eventDate\}\}/g, personalization.eventDate || '');
  }

  return result;
}

// ─── CHARACTER MAPPING ───────────────────────────────────────────────────────

/**
 * Map ceremony roles to enrichment characters.
 */
export function buildCeremonyCharacters(
  roles: CeremonyRole[],
  override: CeremonyCulturalOverride,
  personalization?: CelebrationPersonalization,
): Array<{ name: string; role: string; description: string; attire?: string }> {
  return roles.map(role => {
    const name = personalization?.names[role] || role.charAt(0).toUpperCase() + role.slice(1);
    let attire: string | undefined;
    let description = '';

    switch (role) {
      case 'bride':
        attire = override.attire.primary;
        description = `Bride in ${override.attire.primary} with ${override.attire.accessories.join(', ')}`;
        break;
      case 'groom':
        attire = override.attire.secondary;
        description = `Groom in ${override.attire.secondary}`;
        break;
      case 'couple':
        description = `Couple together, bride in ${override.attire.primary}, partner in ${override.attire.secondary}`;
        break;
      case 'officiant':
        description = 'Ceremony officiant in ceremonial attire';
        break;
      case 'narrator':
        description = 'Warm narrator voice guiding the audience through the celebration';
        break;
      case 'family':
        attire = override.attire.guests;
        description = `Family members in ${override.attire.guests}`;
        break;
      default:
        description = `${role.charAt(0).toUpperCase() + role.slice(1)} participating in the celebration`;
    }

    return { name, role, description, attire };
  });
}

// ─── MAIN BRIDGE FUNCTION ────────────────────────────────────────────────────

/**
 * Build a SceneEnrichmentInput from a CelebrationProductionRequest.
 * This is the main entry point — resolves ceremony + culture + template → standard input.
 */
export function buildCelebrationEnrichmentInput(
  request: CelebrationProductionRequest,
): CelebrationEnrichmentResult | null {
  // 1. Resolve ceremony type from registry
  const ceremonyType = getCeremonyType(request.ceremonyId);
  if (!ceremonyType) return null;

  // 2. Resolve cultural override (subregion → parent → generic fallback)
  const regionCode = request.subregionCode || request.regionCode;
  const culturalOverride = getCulturalOverrideWithFallback(
    request.ceremonyId,
    regionCode,
    ceremonyType.category,
  );

  // 3. Resolve scene template for (ceremony, format)
  const sceneTemplate = getSceneTemplate(request.ceremonyId, request.format);
  if (!sceneTemplate) return null;

  // 4. Build location-aware prompt modifier
  let locationModifier = '';
  if (request.city) {
    locationModifier = getCityPromptModifier(regionCode, request.city)
      || culturalOverride.location?.landscape
      || '';
  }

  // 5. Build characters from ceremony roles
  const characters = buildCeremonyCharacters(
    ceremonyType.typicalRoles,
    culturalOverride,
    request.personalization,
  );

  // 6. Build enriched script content from scene template
  const enrichedScript: Record<string, string> = {};
  const scenePipelines: Record<string, Array<{ type: string; [key: string]: unknown }>> = {};

  for (const scene of sceneTemplate.scenes) {
    if (scene.optional && !request.personalization.additionalContext) continue;

    // Resolve cultural tokens in visual prompt
    let visualPrompt = resolveCulturalTokens(
      scene.visualPromptTemplate,
      culturalOverride,
      request.personalization,
    );

    // Inject location modifier
    if (locationModifier) {
      visualPrompt += `, ${locationModifier}`;
    }

    // Inject photo reference if available
    const photoRef = getPhotoForScene(scene, request.photos);

    enrichedScript[scene.sceneKey] = visualPrompt;

    // Build pipeline steps for this scene
    scenePipelines[scene.sceneKey] = buildScenePipelineSteps(
      scene,
      visualPrompt,
      culturalOverride,
      request,
      photoRef,
    );
  }

  // 7. Build SceneEnrichmentInput
  const enrichmentInput: SceneEnrichmentInput = {
    title: buildTitle(request, culturalOverride),
    content: Object.values(enrichedScript),
    styleFamily: mapStyleFamily(request.visualStyle),
    characters,
    regionCode: request.regionCode,
    language: request.language,
    targetDuration: sceneTemplate.targetDuration,
    quality: request.quality || 'production',
    storybookMode: true,
    humorLevel: ceremonyType.defaultTone === 'playful' ? 3 : 1,
    enrichmentContext: {
      ceremonyId: request.ceremonyId,
      ceremonyName: ceremonyType.name,
      category: ceremonyType.category,
      culturalOverride: {
        localName: culturalOverride.localName,
        ritualPhases: culturalOverride.ritualPhases,
        colorPalette: culturalOverride.colorPalette,
        music: culturalOverride.music,
        narrative: culturalOverride.narrative,
      },
      personalization: request.personalization,
      city: request.city,
      locationModifier,
    },
    outputFormat: mapOutputFormat(request.format),
    culturalArtMode: culturalOverride.artStylePreference ? true : false,
    imaginationPreset: 'cinematic',
  };

  return {
    enrichmentInput,
    culturalOverride,
    sceneTemplate,
    ceremonyType,
    scenePipelines,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function buildTitle(
  request: CelebrationProductionRequest,
  override: CeremonyCulturalOverride,
): string {
  const names = request.personalization.names;
  const bride = names.bride || names.guest_of_honor || names.host || '';
  const groom = names.groom || '';

  if (bride && groom) {
    return `${override.localName}: ${bride} & ${groom}`;
  }
  if (bride) {
    return `${override.localName}: ${bride}`;
  }
  return override.localName;
}

function mapStyleFamily(visualStyle?: string): string {
  if (!visualStyle) return 'cinematic_4k';
  const lower = visualStyle.toLowerCase();
  if (lower.includes('pixar') || lower.includes('3d')) return 'pixar_3d';
  if (lower.includes('watercolor')) return 'watercolor';
  if (lower.includes('anime')) return 'anime';
  if (lower.includes('cultural')) return 'cultural_art';
  return 'cinematic_4k';
}

function mapOutputFormat(format: CelebrationOutputFormat): string {
  const map: Record<string, string> = {
    invitation_video: 'long_form_video',
    save_the_date: 'short_form_video',
    digital_invitation: 'social_card',
    couples_story_podcast: 'podcast_video',
    ceremony_program_pptx: 'presentation_deck',
    ceremony_recap_video: 'long_form_video',
    photo_montage_video: 'story_sequence',
    social_clip: 'short_form_video',
    thank_you_video: 'short_form_video',
    print_invitation_pdf: 'social_card',
    webcast_live: 'long_form_video',
    highlight_reel: 'long_form_video',
    announcement_video: 'short_form_video',
    tribute_video: 'long_form_video',
  };
  return map[format] || 'long_form_video';
}

function getPhotoForScene(
  scene: CeremonySceneDefinition,
  photos?: CelebrationPhotos,
): string | undefined {
  if (!photos) return undefined;

  // Photo montage scenes use couple/additional photos
  if (scene.sceneTypeId === 'photo-montage') {
    return photos.couple?.url || photos.additional?.[0]?.url;
  }

  // Scenes with couple get couple photo
  if (scene.speakers.includes('couple') || scene.speakers.includes('bride')) {
    if (photos.couple?.consentGranted && photos.couple?.url) return photos.couple.url;
    if (photos.bride?.consentGranted && photos.bride?.url) return photos.bride.url;
  }

  // Venue scenes
  if (scene.sceneKey.includes('venue') || scene.sceneKey.includes('setting')) {
    return photos.venue?.url;
  }

  return undefined;
}

function buildScenePipelineSteps(
  scene: CeremonySceneDefinition,
  resolvedPrompt: string,
  override: CeremonyCulturalOverride,
  request: CelebrationProductionRequest,
  photoRef?: string,
): Array<{ type: string; [key: string]: unknown }> {
  const steps: Array<{ type: string; [key: string]: unknown }> = [];

  // Image generation step (most scenes need a background)
  if (['ceremony-ritual', 'invitation-card', 'photo-montage', 'blessing-close', 'title-card', 'b-roll-narration'].includes(scene.sceneTypeId)) {
    steps.push({
      type: photoRef ? 'alibaba-image' : 'alibaba-image',
      model: 'flux-merged',
      prompt: resolvedPrompt,
      referenceImage: photoRef,
    });
  }

  // Video generation (for non-static scenes)
  if (['ceremony-ritual', 'b-roll-narration', 'photo-montage'].includes(scene.sceneTypeId)) {
    steps.push({
      type: 'alibaba-video',
      model: 'wan2.6-t2v',
      prompt: resolvedPrompt,
      referenceImage: photoRef,
    });
  }

  // TTS for spoken scenes
  if (scene.speakers.length > 0) {
    steps.push({
      type: 'tts',
      voice: 'narrator',
      scriptKey: scene.sceneKey,
      language: request.language,
    });
  }

  // Music for all scenes with musicMood
  if (scene.musicMood && scene.musicMood !== 'none') {
    steps.push({
      type: 'music',
      prompt: `${override.music.samplePrompt}, mood: ${scene.musicMood}`,
      genres: override.music.genres,
      instruments: override.music.instruments,
    });
  }

  // Kinetic text for invitation cards and blessings
  if (['invitation-card', 'blessing-close', 'title-card'].includes(scene.sceneTypeId)) {
    steps.push({
      type: 'kinetic-text',
      text: scene.title,
      colorPalette: override.colorPalette,
    });
  }

  return steps;
}

/**
 * Merge celebration cultural override with base regional creative config.
 * Celebration-specific data takes precedence.
 */
export function mergeWithBaseRegional(
  culturalOverride: CeremonyCulturalOverride,
  baseRegionalConfig?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...baseRegionalConfig,
    colorPalette: culturalOverride.colorPalette,
    musicMood: culturalOverride.music.mood,
    narrativeStyle: culturalOverride.narrative.storytellingStyle,
    artStyle: culturalOverride.artStylePreference,
    isRTL: culturalOverride.isRTL,
    sensitivityNotes: culturalOverride.sensitivityNotes,
  };
}
