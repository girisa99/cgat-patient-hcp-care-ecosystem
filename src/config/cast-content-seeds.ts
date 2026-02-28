/**
 * CAST CONTENT SEEDS
 *
 * Code-defined seed categories and formats that are ALWAYS available,
 * even before DB rows exist. DB entries with the same `name` take precedence.
 *
 * This file seeds ALL core categories (8 DB-equivalent + celebrations)
 * and ALL core formats (8 DB-equivalent + 14 celebration-specific).
 *
 * To add a new vertical:
 *   1. Add a seed category entry below
 *   2. Add seed format entries below
 *   3. Add category↔format links
 *   4. That's it — FormatStudioRouter pattern-matches format names automatically
 *
 * When the DB row is eventually created (via admin panel or migration),
 * the DB version supersedes the seed. Seeds are fallbacks, not overrides.
 */

import type { ContentCategory, ContentFormat, CategoryFormatLink } from '@/hooks/useCastContentRegistry';

// ─── SEED CATEGORIES ────────────────────────────────────────────────────────
// Mirrors the 8 DB-seeded categories + Celebrations vertical.
// DB entries with matching `name` override these at runtime.

export const SEED_CATEGORIES: ContentCategory[] = [
  {
    id: 'seed-media',
    name: 'media',
    label: 'Media & Entertainment',
    icon: 'Film',
    color: 'text-blue-600',
    description: 'General media production — videos, films, trailers, and entertainment content',
    sort_order: 1,
    is_active: true,
    metadata: { seed: true },
  },
  {
    id: 'seed-healthcare',
    name: 'healthcare',
    label: 'Healthcare',
    icon: 'HeartPulse',
    color: 'text-red-600',
    description: 'Healthcare industry content — patient education, HCP training, clinical summaries',
    sort_order: 2,
    is_active: true,
    metadata: { seed: true },
  },
  {
    id: 'seed-education',
    name: 'education',
    label: 'Education',
    icon: 'GraduationCap',
    color: 'text-green-600',
    description: 'Educational and training content — courses, tutorials, e-learning modules',
    sort_order: 3,
    is_active: true,
    metadata: { seed: true },
  },
  {
    id: 'seed-government',
    name: 'government',
    label: 'Government',
    icon: 'Landmark',
    color: 'text-slate-600',
    description: 'Government and public sector — policy announcements, civic engagement, PSAs',
    sort_order: 4,
    is_active: true,
    metadata: { seed: true },
  },
  {
    id: 'seed-oil-gas',
    name: 'oil_gas',
    label: 'Oil & Gas',
    icon: 'Fuel',
    color: 'text-amber-600',
    description: 'Energy sector content — safety training, ESG reports, operational updates',
    sort_order: 5,
    is_active: true,
    metadata: { seed: true },
  },
  {
    id: 'seed-travel',
    name: 'travel',
    label: 'Travel & Hospitality',
    icon: 'Plane',
    color: 'text-cyan-600',
    description: 'Travel and tourism content — destination showcases, hotel tours, cultural guides',
    sort_order: 6,
    is_active: true,
    metadata: { seed: true },
  },
  {
    id: 'seed-commercial',
    name: 'commercial',
    label: 'Commercial & Marketing',
    icon: 'Megaphone',
    color: 'text-purple-600',
    description: 'Commercial and brand content — ads, product demos, brand stories, campaigns',
    sort_order: 7,
    is_active: true,
    metadata: { seed: true },
  },
  {
    id: 'seed-technology',
    name: 'technology',
    label: 'Technology',
    icon: 'Cpu',
    color: 'text-indigo-600',
    description: 'Tech industry content — product walkthroughs, architecture diagrams, demos',
    sort_order: 8,
    is_active: true,
    metadata: { seed: true },
  },
  {
    id: 'seed-celebrations',
    name: 'celebrations',
    label: 'Celebrations',
    icon: 'Heart',
    color: 'text-pink-600',
    description: 'Weddings, festivals, religious ceremonies, life milestones, corporate events, sports, inaugurations & more',
    sort_order: 9,
    is_active: true,
    metadata: { seed: true, vertical: 'celebrations' },
  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

/** Generic format seed builder */
function coreFormat(
  idSuffix: string,
  name: string,
  label: string,
  icon: string,
  color: string,
  description: string,
  opts: {
    messaging?: boolean;
    tts?: boolean;
    video?: boolean;
    sortOrder: number;
    checklist?: string[];
  },
): ContentFormat {
  return {
    id: `seed-core-${idSuffix}`,
    name,
    label,
    icon,
    color,
    description,
    requires_messaging: opts.messaging ?? false,
    requires_tts: opts.tts ?? false,
    requires_video: opts.video ?? false,
    enrichment_config: {},
    editor_placeholder: null,
    checklist: opts.checklist || ['Content created', 'Quality review passed', 'Assets embedded', 'Ready for export'],
    sort_order: opts.sortOrder,
    is_active: true,
  };
}

/** Celebration format seed builder */
function celebrationFormat(
  idSuffix: string,
  name: string,
  label: string,
  icon: string,
  color: string,
  description: string,
  defaultFormat: string,
  opts: { tts?: boolean; video?: boolean; sortOrder: number },
): ContentFormat {
  return {
    id: `seed-celebration-${idSuffix}`,
    name,
    label,
    icon,
    color,
    description,
    requires_messaging: false,
    requires_tts: opts.tts ?? false,
    requires_video: opts.video ?? false,
    enrichment_config: { vertical: 'celebrations', defaultFormat },
    editor_placeholder: null,
    checklist: ['Ceremony type selected', 'Region & city chosen', 'Personalization complete', 'Cultural style applied', 'Ready to generate'],
    sort_order: opts.sortOrder,
    is_active: true,
  };
}

// ─── SEED FORMATS — CORE (8 DB-equivalent) ─────────────────────────────────

const CORE_FORMATS: ContentFormat[] = [
  coreFormat('podcast', 'podcast', 'Podcast', 'Mic', 'text-orange-600',
    'Audio podcast episodes — interviews, panel discussions, narrated stories',
    { tts: true, sortOrder: 1, checklist: ['Script finalized', 'Speaker roles assigned', 'Audio generated', 'Intro/outro added', 'Ready for export'] }),
  coreFormat('webcast', 'webcast', 'Webcast', 'Radio', 'text-red-600',
    'Live or recorded webcasts — product launches, town halls, virtual events',
    { messaging: true, tts: true, video: true, sortOrder: 2, checklist: ['Agenda set', 'Speakers configured', 'Visual assets ready', 'Stream/recording configured', 'Ready for broadcast'] }),
  coreFormat('video', 'video', 'Video', 'Video', 'text-blue-600',
    'Video content — shorts, long-form, cinematic, educational, promotional',
    { messaging: true, tts: true, video: true, sortOrder: 3, checklist: ['Script written', 'Visual style chosen', 'Scenes configured', 'Audio/music set', 'Ready for production'] }),
  coreFormat('presentation', 'presentation', 'Presentation / PPT', 'Presentation', 'text-teal-600',
    'Slide decks — pitch decks, investor presentations, training materials, keynotes',
    { messaging: true, sortOrder: 4, checklist: ['Outline created', 'Slides designed', 'Speaker notes added', 'Data visualizations embedded', 'Ready for export'] }),
  coreFormat('script', 'script', 'Script / Narration', 'FileText', 'text-slate-600',
    'Written scripts — video narration, voiceover scripts, dialogue drafts',
    { sortOrder: 5, checklist: ['Draft written', 'Tone reviewed', 'Speaker roles assigned', 'Ready for production'] }),
  coreFormat('tts', 'tts', 'Text-to-Speech', 'Volume2', 'text-green-600',
    'AI-generated speech — voiceovers, narration, multilingual audio',
    { tts: true, sortOrder: 6, checklist: ['Text finalized', 'Voice selected', 'Language/accent set', 'Audio generated', 'Quality reviewed'] }),
  coreFormat('voice', 'voice', 'Voice / Voiceover', 'AudioLines', 'text-violet-600',
    'Professional voiceover — character voices, dubbing, multilingual narration',
    { tts: true, sortOrder: 7, checklist: ['Script ready', 'Voice talent selected', 'Recording configured', 'Post-processing set', 'Ready for export'] }),
  coreFormat('ugc', 'ugc', 'User Generated Content', 'Users', 'text-amber-600',
    'UGC-style content — testimonials, reviews, social proof, community stories',
    { video: true, sortOrder: 8, checklist: ['Source content identified', 'Curation complete', 'Brand compliance checked', 'Edit/remix configured', 'Ready for export'] }),
];

// ─── SEED FORMATS — ALL 14 CELEBRATION OUTPUT FORMATS ───────────────────────

const CELEBRATION_FORMATS: ContentFormat[] = [
  // ── Video Formats ──────────────────────────────────────────────────────
  celebrationFormat(
    'invitation-video', 'celebration_invitation_video', 'Invitation Video',
    'Heart', 'text-pink-600',
    'Cinematic invitation video with cultural themes, music, and personalization',
    'invitation_video', { tts: true, video: true, sortOrder: 901 },
  ),
  celebrationFormat(
    'save-the-date', 'celebration_save_the_date', 'Save the Date',
    'Calendar', 'text-rose-600',
    'Short animated save-the-date teaser with cultural motifs',
    'save_the_date', { video: true, sortOrder: 902 },
  ),
  celebrationFormat(
    'ceremony-recap', 'celebration_ceremony_recap_video', 'Ceremony Recap Video',
    'Video', 'text-purple-600',
    'Full ceremony video with ritual phases, cultural music, and blessings',
    'ceremony_recap_video', { tts: true, video: true, sortOrder: 903 },
  ),
  celebrationFormat(
    'photo-montage', 'celebration_photo_montage_video', 'Photo Montage Video',
    'Image', 'text-indigo-600',
    'Photo slideshow with elegant transitions, narration, and cultural music',
    'photo_montage_video', { tts: true, video: true, sortOrder: 904 },
  ),
  celebrationFormat(
    'social-clip', 'celebration_social_clip', 'Social Clip',
    'Play', 'text-blue-600',
    'Short social media clip for sharing celebration moments',
    'social_clip', { video: true, sortOrder: 905 },
  ),
  celebrationFormat(
    'thank-you-video', 'celebration_thank_you_video', 'Thank You Video',
    'Heart', 'text-pink-500',
    'Heartfelt thank-you video for guests with cultural blessing and music',
    'thank_you_video', { tts: true, video: true, sortOrder: 906 },
  ),
  celebrationFormat(
    'highlight-reel', 'celebration_highlight_reel', 'Highlight Reel',
    'Film', 'text-amber-600',
    'Best moments highlight reel with dynamic editing and music',
    'highlight_reel', { tts: true, video: true, sortOrder: 907 },
  ),
  celebrationFormat(
    'announcement-video', 'celebration_announcement_video', 'Announcement Video',
    'Video', 'text-emerald-600',
    'Event announcement video for sharing news with family and friends',
    'announcement_video', { tts: true, video: true, sortOrder: 908 },
  ),
  celebrationFormat(
    'tribute-video', 'celebration_tribute_video', 'Tribute Video',
    'Heart', 'text-violet-600',
    'Tribute or memorial video with photos, narration, and meaningful music',
    'tribute_video', { tts: true, video: true, sortOrder: 909 },
  ),
  celebrationFormat(
    'webcast-live', 'celebration_webcast_live', 'Live Webcast',
    'Globe', 'text-red-600',
    'Live ceremony webcast with multi-camera angles and real-time streaming',
    'webcast_live', { tts: true, video: true, sortOrder: 910 },
  ),

  // ── Non-Video Formats ─────────────────────────────────────────────────
  celebrationFormat(
    'digital-invitation', 'celebration_digital_invitation', 'Digital Invitation Card',
    'Heart', 'text-pink-500',
    'Animated digital invitation card with cultural motifs and event details',
    'digital_invitation', { sortOrder: 911 },
  ),
  celebrationFormat(
    'couples-podcast', 'celebration_couples_podcast', "Couple's Story Podcast",
    'Mic', 'text-orange-600',
    'Narrated love story podcast with cultural context and family voices',
    'couples_story_podcast', { tts: true, sortOrder: 912 },
  ),
  celebrationFormat(
    'ceremony-program-pptx', 'celebration_ceremony_program_pptx', 'Ceremony Program (Slides)',
    'Presentation', 'text-teal-600',
    'Ceremony program slide deck with ritual phases, cultural art, and details',
    'ceremony_program_pptx', { sortOrder: 913 },
  ),
  celebrationFormat(
    'print-invitation-pdf', 'celebration_print_invitation_pdf', 'Print Invitation (PDF)',
    'FileText', 'text-stone-600',
    'Print-ready invitation PDF with cultural design, calligraphy, and QR code',
    'print_invitation_pdf', { sortOrder: 914 },
  ),
];

// ─── COMBINED SEED FORMATS ──────────────────────────────────────────────────

export const SEED_FORMATS: ContentFormat[] = [...CORE_FORMATS, ...CELEBRATION_FORMATS];

// ─── SEED CATEGORY ↔ FORMAT LINKS ──────────────────────────────────────────
// Core formats are linked to ALL categories (available everywhere).
// Celebration-specific formats are linked only to the celebrations category.

const CORE_FORMAT_IDS = new Set(CORE_FORMATS.map(f => f.id));

export const SEED_CATEGORY_FORMAT_LINKS: CategoryFormatLink[] = [
  // Every category gets access to core formats (video, podcast, presentation, etc.)
  ...SEED_CATEGORIES.flatMap(cat =>
    CORE_FORMATS.map(fmt => ({
      id: `seed-link-${cat.id}-${fmt.id}`,
      category_id: cat.id,
      format_id: fmt.id,
      enrichment_overrides: {},
      blueprint_template_id: null,
      is_active: true,
    })),
  ),
  // Celebration-specific formats linked only to celebrations category
  ...CELEBRATION_FORMATS.map(fmt => ({
    id: `seed-link-celebrations-${fmt.id}`,
    category_id: 'seed-celebrations',
    format_id: fmt.id,
    enrichment_overrides: {},
    blueprint_template_id: null,
    is_active: true,
  })),
];

// ─── MERGE HELPER ───────────────────────────────────────────────────────────

/**
 * Merge seed entries with DB entries. DB entries with matching `name` take
 * precedence. Seeds only appear when no DB equivalent exists.
 *
 * This is the ONLY function consumers call — it's generic and works for
 * categories, formats, or any array with a `name` field.
 */
export function mergeWithSeeds<T extends { name: string }>(
  dbEntries: T[],
  seeds: T[],
): T[] {
  const dbNames = new Set(dbEntries.map(e => e.name));
  const newSeeds = seeds.filter(s => !dbNames.has(s.name));
  return [...dbEntries, ...newSeeds];
}
