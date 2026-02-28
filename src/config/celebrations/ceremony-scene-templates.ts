/**
 * CEREMONY SCENE TEMPLATES
 *
 * Maps (ceremonyType x outputFormat) → ordered scene template with pipeline hints.
 * Each template defines the scene structure, cultural slots, and production hints
 * that feed into the enrichment engine.
 *
 * Templates are format-agnostic at the pipeline level — the same cultural data
 * is used regardless of whether output is video, podcast, PPTX, or digital card.
 */

import type { CelebrationOutputFormat } from './ceremony-type-registry';

// ─── TYPES ───────────────────────────────────────────────────────────────────

/** Cultural slot types that get injected from CeremonyCulturalOverride */
export type CulturalSlot =
  | 'colorPalette'
  | 'symbols'
  | 'music'
  | 'attire'
  | 'setting'
  | 'narrative'
  | 'greetingPhrase'
  | 'blessingPhrase'
  | 'ritualPhases'
  | 'location';

/** Production hint for visual generation */
export type ProductionHint =
  | 'animation_cinematic'
  | 'cultural_art'
  | 'kinetic_typography'
  | 'photo_collage'
  | 'motion_graphics'
  | 'documentary'
  | 'talking_head'
  | 'interview'
  | 'stop_motion';

export interface CeremonySceneDefinition {
  /** Unique scene key within this template */
  sceneKey: string;
  /** Human-readable scene title */
  title: string;
  /** Maps to scene type registry ID */
  sceneTypeId: string;
  /** Duration range in seconds */
  durationRange: { min: number; max: number };
  /** Which cultural fields to inject from CeremonyCulturalOverride */
  culturalSlots: CulturalSlot[];
  /** Visual generation approach hint */
  productionHint: ProductionHint;
  /** Template for AI visual prompt — tokens replaced with cultural data */
  visualPromptTemplate: string;
  /** Music mood for this scene */
  musicMood: string;
  /** Which ceremony roles speak in this scene */
  speakers: string[];
  /** Whether this scene can be skipped */
  optional: boolean;
}

export interface CeremonySceneTemplate {
  /** Ceremony type ID */
  ceremonyId: string;
  /** Output format */
  format: CelebrationOutputFormat;
  /** Total target duration in seconds */
  targetDuration: number;
  /** Ordered scenes */
  scenes: CeremonySceneDefinition[];
}

// ─── SCENE TEMPLATES ─────────────────────────────────────────────────────────

export const CEREMONY_SCENE_TEMPLATES: CeremonySceneTemplate[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // WEDDING — Invitation Video (90s, 5 scenes)
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional',
    format: 'invitation_video',
    targetDuration: 90,
    scenes: [
      {
        sceneKey: 'title-reveal',
        title: 'Title Reveal',
        sceneTypeId: 'title-card',
        durationRange: { min: 8, max: 15 },
        culturalSlots: ['symbols', 'colorPalette', 'greetingPhrase'],
        productionHint: 'cultural_art',
        visualPromptTemplate: '{{symbols[0].promptModifier}} with {{colorPalette.primary}} and {{colorPalette.accent}} tones, elegant title reveal animation, {{greetingPhrase}}',
        musicMood: 'auspicious-intro',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'our-story',
        title: 'Our Story',
        sceneTypeId: 'b-roll-narration',
        durationRange: { min: 20, max: 30 },
        culturalSlots: ['attire', 'setting', 'colorPalette', 'location'],
        productionHint: 'animation_cinematic',
        visualPromptTemplate: 'Couple in {{attire.primary}} and {{attire.secondary}}, {{setting.environmentPrompt}}, romantic cinematic shot, warm golden lighting',
        musicMood: 'romantic',
        speakers: ['narrator'],
        optional: false,
      },
      {
        sceneKey: 'ceremony-preview',
        title: 'Ceremony Preview',
        sceneTypeId: 'ceremony-ritual',
        durationRange: { min: 15, max: 25 },
        culturalSlots: ['ritualPhases', 'symbols', 'setting', 'music'],
        productionHint: 'animation_cinematic',
        visualPromptTemplate: 'Sacred ceremony moment with {{symbols[0].promptModifier}}, {{setting.decorations}} surrounding, {{setting.lighting}}, cinematic montage of ritual phases',
        musicMood: 'sacred',
        speakers: ['narrator'],
        optional: false,
      },
      {
        sceneKey: 'event-details',
        title: 'Event Details',
        sceneTypeId: 'invitation-card',
        durationRange: { min: 12, max: 20 },
        culturalSlots: ['colorPalette', 'symbols', 'narrative'],
        productionHint: 'kinetic_typography',
        visualPromptTemplate: 'Elegant animated event details card with {{colorPalette.primary}} background, {{symbols[0].promptModifier}} border motifs, date and venue text reveal',
        musicMood: 'elegant',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'closing-blessing',
        title: 'Closing Blessing',
        sceneTypeId: 'blessing-close',
        durationRange: { min: 8, max: 15 },
        culturalSlots: ['blessingPhrase', 'colorPalette', 'symbols', 'narrative'],
        productionHint: 'cultural_art',
        visualPromptTemplate: '{{blessingPhrase}} in elegant calligraphy over {{colorPalette.accent}} background with {{symbols[0].promptModifier}}, warm glow, fade out',
        musicMood: 'blessing',
        speakers: ['narrator'],
        optional: false,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WEDDING — Save the Date (20s, 2 scenes)
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional',
    format: 'save_the_date',
    targetDuration: 20,
    scenes: [
      {
        sceneKey: 'date-reveal',
        title: 'Date Reveal',
        sceneTypeId: 'invitation-card',
        durationRange: { min: 10, max: 15 },
        culturalSlots: ['colorPalette', 'symbols', 'greetingPhrase'],
        productionHint: 'kinetic_typography',
        visualPromptTemplate: 'Animated save the date card with {{colorPalette.primary}} background, {{symbols[0].promptModifier}}, date numbers reveal with {{colorPalette.accent}} accent animation',
        musicMood: 'anticipation',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'couple-teaser',
        title: 'Couple Teaser',
        sceneTypeId: 'b-roll-narration',
        durationRange: { min: 5, max: 10 },
        culturalSlots: ['attire', 'setting', 'colorPalette'],
        productionHint: 'animation_cinematic',
        visualPromptTemplate: 'Brief romantic shot of couple in {{attire.primary}}, {{setting.environmentPrompt}}, dreamy cinematic quality',
        musicMood: 'romantic-brief',
        speakers: [],
        optional: false,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WEDDING — Digital Invitation Card (15s animated loop)
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional',
    format: 'digital_invitation',
    targetDuration: 15,
    scenes: [
      {
        sceneKey: 'names-reveal',
        title: 'Names & Motifs',
        sceneTypeId: 'invitation-card',
        durationRange: { min: 8, max: 10 },
        culturalSlots: ['colorPalette', 'symbols', 'greetingPhrase'],
        productionHint: 'motion_graphics',
        visualPromptTemplate: 'Names reveal with {{symbols[0].promptModifier}} cultural motifs, {{colorPalette.primary}} and {{colorPalette.accent}} color scheme, elegant animation loop',
        musicMood: 'gentle',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'details-overlay',
        title: 'Event Details',
        sceneTypeId: 'invitation-card',
        durationRange: { min: 5, max: 8 },
        culturalSlots: ['colorPalette', 'symbols'],
        productionHint: 'kinetic_typography',
        visualPromptTemplate: 'Event details text overlay with subtle {{symbols[0].promptModifier}} background, clean typography, loopable animation',
        musicMood: 'elegant',
        speakers: [],
        optional: false,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WEDDING — Couples Story Podcast (10-20 min, 6 scenes)
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional',
    format: 'couples_story_podcast',
    targetDuration: 900,
    scenes: [
      {
        sceneKey: 'podcast-intro',
        title: 'Introduction',
        sceneTypeId: 'talking-head',
        durationRange: { min: 60, max: 120 },
        culturalSlots: ['narrative', 'greetingPhrase'],
        productionHint: 'talking_head',
        visualPromptTemplate: 'Podcast studio setup with warm lighting, couple portrait in background, cozy atmosphere',
        musicMood: 'warm-intro',
        speakers: ['narrator'],
        optional: false,
      },
      {
        sceneKey: 'how-they-met',
        title: 'How They Met',
        sceneTypeId: 'b-roll-narration',
        durationRange: { min: 120, max: 240 },
        culturalSlots: ['narrative', 'setting', 'location'],
        productionHint: 'documentary',
        visualPromptTemplate: 'Romantic cinematic b-roll of couple in {{setting.environmentPrompt}}, storytelling montage',
        musicMood: 'romantic-storytelling',
        speakers: ['narrator', 'couple'],
        optional: false,
      },
      {
        sceneKey: 'the-proposal',
        title: 'The Proposal',
        sceneTypeId: 'b-roll-narration',
        durationRange: { min: 120, max: 180 },
        culturalSlots: ['narrative', 'location'],
        productionHint: 'animation_cinematic',
        visualPromptTemplate: 'Dramatic proposal moment recreation, cinematic golden hour, emotional close-up',
        musicMood: 'dramatic-romantic',
        speakers: ['narrator', 'couple'],
        optional: false,
      },
      {
        sceneKey: 'cultural-traditions',
        title: 'Cultural Traditions',
        sceneTypeId: 'ceremony-ritual',
        durationRange: { min: 120, max: 240 },
        culturalSlots: ['ritualPhases', 'symbols', 'music', 'narrative', 'attire'],
        productionHint: 'cultural_art',
        visualPromptTemplate: 'Cultural ceremony traditions explained visually with {{symbols[0].promptModifier}}, {{attire.primary}}, educational storytelling',
        musicMood: 'cultural-ambient',
        speakers: ['narrator'],
        optional: false,
      },
      {
        sceneKey: 'family-voices',
        title: 'Family Voices',
        sceneTypeId: 'interview-2shot',
        durationRange: { min: 120, max: 180 },
        culturalSlots: ['narrative'],
        productionHint: 'interview',
        visualPromptTemplate: 'Family interview setting, warm lighting, personal testimonials about the couple',
        musicMood: 'emotional',
        speakers: ['family'],
        optional: true,
      },
      {
        sceneKey: 'invitation-close',
        title: 'Invitation & Close',
        sceneTypeId: 'blessing-close',
        durationRange: { min: 60, max: 120 },
        culturalSlots: ['blessingPhrase', 'narrative', 'greetingPhrase'],
        productionHint: 'talking_head',
        visualPromptTemplate: 'Closing blessing with event details, warm farewell, {{blessingPhrase}}',
        musicMood: 'warm-close',
        speakers: ['narrator'],
        optional: false,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WEDDING — Ceremony Program PPTX (8 slides)
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional',
    format: 'ceremony_program_pptx',
    targetDuration: 0,
    scenes: [
      {
        sceneKey: 'cover',
        title: 'Cover — Names & Date',
        sceneTypeId: 'title-card',
        durationRange: { min: 0, max: 0 },
        culturalSlots: ['colorPalette', 'symbols', 'greetingPhrase'],
        productionHint: 'cultural_art',
        visualPromptTemplate: 'Wedding program cover with {{symbols[0].promptModifier}}, names in elegant script, {{colorPalette.primary}} theme',
        musicMood: 'none',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'welcome',
        title: 'Welcome Message',
        sceneTypeId: 'invitation-card',
        durationRange: { min: 0, max: 0 },
        culturalSlots: ['greetingPhrase', 'narrative', 'colorPalette'],
        productionHint: 'kinetic_typography',
        visualPromptTemplate: 'Welcome slide with {{greetingPhrase}} in local language, elegant typography, {{colorPalette.accent}} accents',
        musicMood: 'none',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'ceremony-phase-1',
        title: 'Ceremony Phase 1',
        sceneTypeId: 'ceremony-ritual',
        durationRange: { min: 0, max: 0 },
        culturalSlots: ['ritualPhases', 'symbols', 'attire'],
        productionHint: 'cultural_art',
        visualPromptTemplate: 'Ceremony phase illustration with {{symbols[0].promptModifier}}, traditional ceremony in progress',
        musicMood: 'none',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'ceremony-phase-2',
        title: 'Ceremony Phase 2',
        sceneTypeId: 'ceremony-ritual',
        durationRange: { min: 0, max: 0 },
        culturalSlots: ['ritualPhases', 'symbols', 'attire'],
        productionHint: 'cultural_art',
        visualPromptTemplate: 'Second ceremony phase with sacred ritual elements, traditional attire, cultural authenticity',
        musicMood: 'none',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'ceremony-phase-3',
        title: 'Ceremony Phase 3',
        sceneTypeId: 'ceremony-ritual',
        durationRange: { min: 0, max: 0 },
        culturalSlots: ['ritualPhases', 'symbols'],
        productionHint: 'cultural_art',
        visualPromptTemplate: 'Third ceremony phase with culmination ritual, emotional moment',
        musicMood: 'none',
        speakers: [],
        optional: true,
      },
      {
        sceneKey: 'ceremony-phase-4',
        title: 'Ceremony Phase 4',
        sceneTypeId: 'ceremony-ritual',
        durationRange: { min: 0, max: 0 },
        culturalSlots: ['ritualPhases', 'symbols'],
        productionHint: 'cultural_art',
        visualPromptTemplate: 'Final ceremony phase with completion and blessing',
        musicMood: 'none',
        speakers: [],
        optional: true,
      },
      {
        sceneKey: 'reception-details',
        title: 'Reception Details',
        sceneTypeId: 'invitation-card',
        durationRange: { min: 0, max: 0 },
        culturalSlots: ['setting', 'colorPalette'],
        productionHint: 'kinetic_typography',
        visualPromptTemplate: 'Reception details slide with venue information, menu highlights, timeline, {{colorPalette.primary}} theme',
        musicMood: 'none',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'thank-you',
        title: 'Thank You',
        sceneTypeId: 'blessing-close',
        durationRange: { min: 0, max: 0 },
        culturalSlots: ['blessingPhrase', 'colorPalette', 'symbols'],
        productionHint: 'cultural_art',
        visualPromptTemplate: 'Thank you slide with {{blessingPhrase}}, {{symbols[0].promptModifier}}, elegant close',
        musicMood: 'none',
        speakers: [],
        optional: false,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WEDDING — Photo Montage Video (60s, 4 scenes)
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional',
    format: 'photo_montage_video',
    targetDuration: 60,
    scenes: [
      {
        sceneKey: 'montage-intro',
        title: 'Opening',
        sceneTypeId: 'title-card',
        durationRange: { min: 5, max: 10 },
        culturalSlots: ['colorPalette', 'greetingPhrase'],
        productionHint: 'motion_graphics',
        visualPromptTemplate: 'Elegant photo montage opening with {{colorPalette.primary}} color wash, names reveal',
        musicMood: 'romantic-intro',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'memories',
        title: 'Memories Slideshow',
        sceneTypeId: 'photo-montage',
        durationRange: { min: 30, max: 40 },
        culturalSlots: ['music', 'colorPalette', 'setting'],
        productionHint: 'photo_collage',
        visualPromptTemplate: 'Photo slideshow with elegant transitions, {{colorPalette.accent}} frame accents, Ken Burns effect',
        musicMood: 'romantic-nostalgia',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'highlights',
        title: 'Ceremony Highlights',
        sceneTypeId: 'photo-montage',
        durationRange: { min: 15, max: 20 },
        culturalSlots: ['ritualPhases', 'symbols', 'setting'],
        productionHint: 'photo_collage',
        visualPromptTemplate: 'Ceremony highlight photos with {{symbols[0].promptModifier}} overlay graphics, dynamic transitions',
        musicMood: 'celebratory',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'montage-close',
        title: 'Closing',
        sceneTypeId: 'blessing-close',
        durationRange: { min: 5, max: 10 },
        culturalSlots: ['blessingPhrase', 'colorPalette'],
        productionHint: 'motion_graphics',
        visualPromptTemplate: '{{blessingPhrase}} over final photo, gentle fade to {{colorPalette.primary}}',
        musicMood: 'warm-close',
        speakers: [],
        optional: false,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GENERIC TEMPLATES — Work for ANY ceremony type
  // ══════════════════════════════════════════════════════════════════════════

  // Generic Invitation Video (works for any ceremony/event)
  {
    ceremonyId: '_generic',
    format: 'invitation_video',
    targetDuration: 60,
    scenes: [
      {
        sceneKey: 'title-reveal',
        title: 'Event Title',
        sceneTypeId: 'title-card',
        durationRange: { min: 5, max: 12 },
        culturalSlots: ['colorPalette', 'symbols', 'greetingPhrase'],
        productionHint: 'motion_graphics',
        visualPromptTemplate: 'Event title reveal with {{colorPalette.primary}} theme, elegant motion graphics',
        musicMood: 'intro',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'event-story',
        title: 'Event Story',
        sceneTypeId: 'b-roll-narration',
        durationRange: { min: 15, max: 25 },
        culturalSlots: ['setting', 'narrative', 'colorPalette'],
        productionHint: 'animation_cinematic',
        visualPromptTemplate: '{{setting.environmentPrompt}}, cinematic establishing shot with warm color grading',
        musicMood: 'upbeat',
        speakers: ['narrator'],
        optional: false,
      },
      {
        sceneKey: 'event-details',
        title: 'Event Details',
        sceneTypeId: 'invitation-card',
        durationRange: { min: 10, max: 15 },
        culturalSlots: ['colorPalette'],
        productionHint: 'kinetic_typography',
        visualPromptTemplate: 'Event details card with date, time, venue, clean typography on {{colorPalette.primary}} background',
        musicMood: 'elegant',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'closing',
        title: 'Closing',
        sceneTypeId: 'blessing-close',
        durationRange: { min: 5, max: 10 },
        culturalSlots: ['blessingPhrase', 'colorPalette'],
        productionHint: 'motion_graphics',
        visualPromptTemplate: 'Closing message with {{blessingPhrase}}, gentle fade',
        musicMood: 'close',
        speakers: ['narrator'],
        optional: false,
      },
    ],
  },

  // Generic Announcement Video (works for any event type)
  {
    ceremonyId: '_generic',
    format: 'announcement_video',
    targetDuration: 30,
    scenes: [
      {
        sceneKey: 'announcement',
        title: 'Announcement',
        sceneTypeId: 'title-card',
        durationRange: { min: 8, max: 15 },
        culturalSlots: ['colorPalette', 'greetingPhrase'],
        productionHint: 'kinetic_typography',
        visualPromptTemplate: 'Bold announcement title with {{colorPalette.primary}} accent, energetic text reveal',
        musicMood: 'energetic',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'details',
        title: 'Key Details',
        sceneTypeId: 'invitation-card',
        durationRange: { min: 10, max: 15 },
        culturalSlots: ['colorPalette'],
        productionHint: 'motion_graphics',
        visualPromptTemplate: 'Key details with clean design, essential info displayed clearly',
        musicMood: 'upbeat',
        speakers: ['narrator'],
        optional: false,
      },
    ],
  },

  // Generic Social Clip (works for any event type)
  {
    ceremonyId: '_generic',
    format: 'social_clip',
    targetDuration: 15,
    scenes: [
      {
        sceneKey: 'hook',
        title: 'Hook',
        sceneTypeId: 'title-card',
        durationRange: { min: 3, max: 5 },
        culturalSlots: ['colorPalette'],
        productionHint: 'motion_graphics',
        visualPromptTemplate: 'Eye-catching hook with bold text and {{colorPalette.primary}} color pop',
        musicMood: 'energetic',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'highlight',
        title: 'Key Moment',
        sceneTypeId: 'b-roll-narration',
        durationRange: { min: 7, max: 10 },
        culturalSlots: ['setting', 'colorPalette'],
        productionHint: 'animation_cinematic',
        visualPromptTemplate: 'Key moment highlight, cinematic quality, social-media optimized framing (9:16)',
        musicMood: 'upbeat',
        speakers: [],
        optional: false,
      },
    ],
  },

  // Generic Highlight Reel
  {
    ceremonyId: '_generic',
    format: 'highlight_reel',
    targetDuration: 45,
    scenes: [
      {
        sceneKey: 'reel-intro',
        title: 'Reel Intro',
        sceneTypeId: 'title-card',
        durationRange: { min: 3, max: 5 },
        culturalSlots: ['colorPalette'],
        productionHint: 'motion_graphics',
        visualPromptTemplate: 'Dynamic reel intro with event branding',
        musicMood: 'energetic-intro',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'highlights',
        title: 'Best Moments',
        sceneTypeId: 'montage-reel',
        durationRange: { min: 30, max: 35 },
        culturalSlots: ['music', 'setting'],
        productionHint: 'photo_collage',
        visualPromptTemplate: 'Rapid montage of best moments with dynamic transitions, music-synced cuts',
        musicMood: 'energetic',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'reel-close',
        title: 'Closing',
        sceneTypeId: 'cta-outro',
        durationRange: { min: 5, max: 8 },
        culturalSlots: ['colorPalette'],
        productionHint: 'motion_graphics',
        visualPromptTemplate: 'Closing with event branding and CTA',
        musicMood: 'close',
        speakers: [],
        optional: false,
      },
    ],
  },

  // Generic Tribute Video
  {
    ceremonyId: '_generic',
    format: 'tribute_video',
    targetDuration: 180,
    scenes: [
      {
        sceneKey: 'tribute-open',
        title: 'Opening',
        sceneTypeId: 'title-card',
        durationRange: { min: 10, max: 15 },
        culturalSlots: ['colorPalette', 'narrative'],
        productionHint: 'animation_cinematic',
        visualPromptTemplate: 'Solemn tribute opening with soft lighting, name and dates, gentle animation',
        musicMood: 'solemn',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'life-story',
        title: 'Life Story',
        sceneTypeId: 'b-roll-narration',
        durationRange: { min: 60, max: 90 },
        culturalSlots: ['narrative', 'setting'],
        productionHint: 'documentary',
        visualPromptTemplate: 'Life story narration with photo transitions, gentle cinematic quality',
        musicMood: 'emotional-narrative',
        speakers: ['narrator'],
        optional: false,
      },
      {
        sceneKey: 'memories-montage',
        title: 'Memories',
        sceneTypeId: 'photo-montage',
        durationRange: { min: 45, max: 60 },
        culturalSlots: ['music'],
        productionHint: 'photo_collage',
        visualPromptTemplate: 'Photo montage of memories with gentle transitions and soft overlay effects',
        musicMood: 'nostalgic',
        speakers: [],
        optional: false,
      },
      {
        sceneKey: 'tribute-close',
        title: 'Closing Tribute',
        sceneTypeId: 'blessing-close',
        durationRange: { min: 15, max: 25 },
        culturalSlots: ['blessingPhrase', 'colorPalette', 'narrative'],
        productionHint: 'animation_cinematic',
        visualPromptTemplate: 'Final tribute message with {{blessingPhrase}}, gentle fade to white',
        musicMood: 'peaceful-close',
        speakers: ['narrator'],
        optional: false,
      },
    ],
  },
];

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Get scene template for a ceremony × format combination.
 * Falls back to generic template if no specific one exists.
 */
export function getSceneTemplate(
  ceremonyId: string,
  format: CelebrationOutputFormat,
): CeremonySceneTemplate | undefined {
  // 1. Exact match
  const exact = CEREMONY_SCENE_TEMPLATES.find(
    t => t.ceremonyId === ceremonyId && t.format === format
  );
  if (exact) return exact;

  // 2. Generic template for this format
  const generic = CEREMONY_SCENE_TEMPLATES.find(
    t => t.ceremonyId === '_generic' && t.format === format
  );
  if (generic) {
    return { ...generic, ceremonyId };
  }

  return undefined;
}

/** Get all available templates for a ceremony type */
export function getTemplatesForCeremony(ceremonyId: string): CeremonySceneTemplate[] {
  const specific = CEREMONY_SCENE_TEMPLATES.filter(t => t.ceremonyId === ceremonyId);
  const genericFormats = new Set(specific.map(t => t.format));

  // Add generic templates for formats not covered by specific templates
  const generics = CEREMONY_SCENE_TEMPLATES
    .filter(t => t.ceremonyId === '_generic' && !genericFormats.has(t.format))
    .map(t => ({ ...t, ceremonyId }));

  return [...specific, ...generics];
}

/** Get all formats that have templates (specific or generic) */
export function getAvailableFormats(): CelebrationOutputFormat[] {
  const formats = new Set(CEREMONY_SCENE_TEMPLATES.map(t => t.format));
  return Array.from(formats);
}

/** Get scene count for a template */
export function getSceneCount(ceremonyId: string, format: CelebrationOutputFormat): number {
  const template = getSceneTemplate(ceremonyId, format);
  return template?.scenes.length ?? 0;
}

/** Get total duration for a template (target) */
export function getTargetDuration(ceremonyId: string, format: CelebrationOutputFormat): number {
  const template = getSceneTemplate(ceremonyId, format);
  return template?.targetDuration ?? 60;
}
