/**
 * CAST CONTENT SEEDS
 *
 * Code-defined seed categories and formats that are ALWAYS available,
 * even before DB rows exist. DB entries with the same `name` take precedence.
 *
 * To add a new vertical (sports, travel, inaugurations, etc.):
 *   1. Add a seed category entry below
 *   2. Add seed format entries below
 *   3. That's it — FormatStudioRouter pattern-matches format names automatically
 *
 * When the DB row is eventually created (via admin panel or migration),
 * the DB version supersedes the seed. Seeds are fallbacks, not overrides.
 */

import type { ContentCategory, ContentFormat, CategoryFormatLink } from '@/hooks/useCastContentRegistry';

// ─── SEED CATEGORIES ────────────────────────────────────────────────────────

export const SEED_CATEGORIES: ContentCategory[] = [
  {
    id: 'seed-celebrations',
    name: 'celebrations',
    label: 'Celebrations',
    icon: 'Heart',
    color: 'text-pink-600',
    description: 'Weddings, festivals, religious ceremonies, life milestones, corporate events, sports, inaugurations & more',
    sort_order: 90,
    is_active: true,
    metadata: { seed: true, vertical: 'celebrations' },
  },
];

// ─── HELPER ─────────────────────────────────────────────────────────────────

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

// ─── SEED FORMATS — ALL 14 CELEBRATION OUTPUT FORMATS ───────────────────────

export const SEED_FORMATS: ContentFormat[] = [
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

// ─── SEED CATEGORY ↔ FORMAT LINKS ──────────────────────────────────────────

export const SEED_CATEGORY_FORMAT_LINKS: CategoryFormatLink[] = SEED_FORMATS.map(fmt => ({
  id: `seed-link-${fmt.id}`,
  category_id: 'seed-celebrations',
  format_id: fmt.id,
  enrichment_overrides: {},
  blueprint_template_id: null,
  is_active: true,
}));

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
