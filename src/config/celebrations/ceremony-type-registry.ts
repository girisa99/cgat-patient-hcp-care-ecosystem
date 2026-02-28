/**
 * CEREMONY TYPE REGISTRY
 *
 * Master registry of ALL ceremony/celebration/event types.
 * Categories are extensible — adding a new event type (inauguration, sports, travel)
 * is just adding an entry here. No pipeline code changes needed.
 *
 * The system is event-type agnostic at the pipeline level.
 * Cultural config, scene templates, and production bridge all work with ANY type
 * as long as it has a registry entry.
 */

// ─── TYPES ───────────────────────────────────────────────────────────────────

/** Extensible event categories — add new ones freely */
export type CeremonyCategory =
  | 'wedding'
  | 'pre_post_wedding'
  | 'religious'
  | 'life_milestone'
  | 'festival'
  | 'corporate_event'
  | 'memorial'
  | 'sports_event'
  | 'inauguration'
  | 'travel'
  | 'entertainment'
  | 'community'
  | 'custom';

export type WeddingVariant = 'traditional' | 'destination' | 'fusion' | 'interfaith' | 'elopement' | 'renewal';

export type CelebrationOutputFormat =
  | 'invitation_video'
  | 'save_the_date'
  | 'digital_invitation'
  | 'couples_story_podcast'
  | 'ceremony_program_pptx'
  | 'ceremony_recap_video'
  | 'photo_montage_video'
  | 'social_clip'
  | 'thank_you_video'
  | 'print_invitation_pdf'
  | 'webcast_live'
  | 'highlight_reel'
  | 'announcement_video'
  | 'tribute_video';

export type CeremonyRole =
  | 'bride' | 'groom' | 'couple' | 'officiant' | 'narrator'
  | 'host' | 'guest_of_honor' | 'family' | 'emcee'
  | 'player' | 'team' | 'speaker' | 'performer' | 'organizer';

/** Default emotional tones for ceremonies */
export type CeremonyTone =
  | 'romantic' | 'joyful' | 'sacred' | 'festive' | 'nostalgic'
  | 'celebratory' | 'elegant' | 'playful' | 'dramatic' | 'reverent'
  | 'energetic' | 'solemn' | 'adventurous' | 'inspirational';

export interface CeremonyTypeDefinition {
  /** Unique ceremony ID (e.g., 'wedding-traditional', 'diwali', 'nfl-game-day') */
  id: string;
  /** Display name */
  name: string;
  /** Category for grouping */
  category: CeremonyCategory;
  /** Wedding variant if applicable */
  weddingVariant?: WeddingVariant;
  /** Default emotional tone */
  defaultTone: CeremonyTone;
  /** Output formats available for this type */
  availableFormats: CelebrationOutputFormat[];
  /** Default scene chapters */
  defaultChapters: string[];
  /** Typical roles in this ceremony */
  typicalRoles: CeremonyRole[];
  /** Regions with cultural overrides */
  culturalRegions: string[];
  /** Supports cross-cultural/fusion variants */
  supportsFusion: boolean;
  /** Can user upload existing invitation to redesign */
  supportsUploadRedesign: boolean;
  /** Icon for UI */
  icon: string;
  /** Tags for search */
  tags: string[];
  /** Brief description */
  description: string;
}

// ─── COMMON FORMAT SETS ──────────────────────────────────────────────────────

const WEDDING_FORMATS: CelebrationOutputFormat[] = [
  'invitation_video', 'save_the_date', 'digital_invitation',
  'couples_story_podcast', 'ceremony_program_pptx', 'ceremony_recap_video',
  'photo_montage_video', 'social_clip', 'thank_you_video',
  'print_invitation_pdf', 'webcast_live', 'highlight_reel',
];

const LIFE_EVENT_FORMATS: CelebrationOutputFormat[] = [
  'invitation_video', 'digital_invitation', 'announcement_video',
  'photo_montage_video', 'social_clip', 'thank_you_video',
  'print_invitation_pdf', 'highlight_reel',
];

const FESTIVAL_FORMATS: CelebrationOutputFormat[] = [
  'announcement_video', 'digital_invitation', 'social_clip',
  'photo_montage_video', 'highlight_reel',
];

const CORPORATE_FORMATS: CelebrationOutputFormat[] = [
  'invitation_video', 'digital_invitation', 'ceremony_program_pptx',
  'webcast_live', 'highlight_reel', 'social_clip', 'announcement_video',
];

const ALL_REGIONS = [
  'NAM', 'EU', 'EURASIA', 'TURKEY', 'MENA', 'AFRICA',
  'INDIA', 'PAKISTAN', 'BANGLADESH', 'SOUTH_ASIA', 'SEA', 'CJK',
  'LATAM', 'CARIBBEAN', 'OCEANIA', 'CENTRAL_ASIA',
];

// ─── MASTER REGISTRY ─────────────────────────────────────────────────────────

export const CEREMONY_TYPES: Record<string, CeremonyTypeDefinition> = {

  // ── WEDDINGS (6) ───────────────────────────────────────────────────────────

  'wedding-traditional': {
    id: 'wedding-traditional',
    name: 'Traditional Wedding',
    category: 'wedding',
    weddingVariant: 'traditional',
    defaultTone: 'romantic',
    availableFormats: WEDDING_FORMATS,
    defaultChapters: ['title-reveal', 'our-story', 'ceremony-preview', 'event-details', 'closing-blessing'],
    typicalRoles: ['bride', 'groom', 'officiant', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '💍',
    tags: ['wedding', 'traditional', 'ceremony', 'marriage', 'nuptials'],
    description: 'Traditional wedding ceremony with cultural customs specific to the selected region.',
  },

  'wedding-destination': {
    id: 'wedding-destination',
    name: 'Destination Wedding',
    category: 'wedding',
    weddingVariant: 'destination',
    defaultTone: 'adventurous',
    availableFormats: WEDDING_FORMATS,
    defaultChapters: ['destination-reveal', 'our-journey', 'the-venue', 'ceremony-preview', 'closing-blessing'],
    typicalRoles: ['bride', 'groom', 'narrator', 'host'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: true,
    supportsUploadRedesign: true,
    icon: '✈️',
    tags: ['wedding', 'destination', 'travel', 'beach', 'abroad'],
    description: 'Destination wedding at a scenic location, blending travel adventure with ceremony.',
  },

  'wedding-fusion': {
    id: 'wedding-fusion',
    name: 'Fusion / Multicultural Wedding',
    category: 'wedding',
    weddingVariant: 'fusion',
    defaultTone: 'celebratory',
    availableFormats: WEDDING_FORMATS,
    defaultChapters: ['title-reveal', 'two-cultures', 'our-story', 'ceremony-blend', 'event-details', 'closing-blessing'],
    typicalRoles: ['bride', 'groom', 'officiant', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: true,
    supportsUploadRedesign: true,
    icon: '🌍',
    tags: ['wedding', 'fusion', 'multicultural', 'intercultural', 'blended'],
    description: 'Multicultural wedding blending traditions from two or more cultures.',
  },

  'wedding-interfaith': {
    id: 'wedding-interfaith',
    name: 'Interfaith Wedding',
    category: 'wedding',
    weddingVariant: 'interfaith',
    defaultTone: 'sacred',
    availableFormats: WEDDING_FORMATS,
    defaultChapters: ['title-reveal', 'two-faiths', 'our-story', 'ceremony-rituals', 'event-details', 'closing-blessing'],
    typicalRoles: ['bride', 'groom', 'officiant', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: true,
    supportsUploadRedesign: true,
    icon: '🕊️',
    tags: ['wedding', 'interfaith', 'multi-religion', 'spiritual'],
    description: 'Interfaith wedding honoring multiple religious traditions.',
  },

  'wedding-elopement': {
    id: 'wedding-elopement',
    name: 'Elopement',
    category: 'wedding',
    weddingVariant: 'elopement',
    defaultTone: 'romantic',
    availableFormats: ['invitation_video', 'announcement_video', 'social_clip', 'photo_montage_video', 'digital_invitation'],
    defaultChapters: ['title-reveal', 'our-story', 'the-moment', 'announcement'],
    typicalRoles: ['bride', 'groom', 'narrator'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: false,
    icon: '💝',
    tags: ['wedding', 'elopement', 'intimate', 'secret', 'announcement'],
    description: 'Intimate elopement ceremony or post-elopement announcement.',
  },

  'wedding-renewal': {
    id: 'wedding-renewal',
    name: 'Vow Renewal',
    category: 'wedding',
    weddingVariant: 'renewal',
    defaultTone: 'nostalgic',
    availableFormats: WEDDING_FORMATS,
    defaultChapters: ['title-reveal', 'our-journey-together', 'ceremony-renewal', 'event-details', 'closing-blessing'],
    typicalRoles: ['couple', 'officiant', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '💞',
    tags: ['wedding', 'renewal', 'vows', 'anniversary', 'celebration'],
    description: 'Vow renewal ceremony celebrating years of marriage.',
  },

  // ── PRE/POST WEDDING (5) ──────────────────────────────────────────────────

  'engagement': {
    id: 'engagement',
    name: 'Engagement Party',
    category: 'pre_post_wedding',
    defaultTone: 'joyful',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['announcement', 'the-proposal', 'celebration-details', 'save-the-date'],
    typicalRoles: ['couple', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '💎',
    tags: ['engagement', 'proposal', 'ring', 'pre-wedding'],
    description: 'Engagement announcement and party invitation.',
  },

  'mehndi-henna': {
    id: 'mehndi-henna',
    name: 'Mehndi / Henna Night',
    category: 'pre_post_wedding',
    defaultTone: 'festive',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'henna-ceremony', 'music-dance', 'event-details'],
    typicalRoles: ['bride', 'narrator', 'family', 'performer'],
    culturalRegions: ['INDIA', 'PAKISTAN', 'BANGLADESH', 'MENA', 'TURKEY', 'CENTRAL_ASIA', 'AFRICA'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🖐️',
    tags: ['mehndi', 'henna', 'pre-wedding', 'tradition'],
    description: 'Mehndi/henna ceremony — pre-wedding celebration with traditional art.',
  },

  'sangeet': {
    id: 'sangeet',
    name: 'Sangeet Night',
    category: 'pre_post_wedding',
    defaultTone: 'festive',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'performances', 'dance-floor', 'event-details'],
    typicalRoles: ['couple', 'family', 'performer', 'emcee'],
    culturalRegions: ['INDIA', 'PAKISTAN', 'SOUTH_ASIA'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🎶',
    tags: ['sangeet', 'dance', 'music', 'pre-wedding', 'bollywood'],
    description: 'Sangeet night — music and dance celebration before the wedding.',
  },

  'rehearsal-dinner': {
    id: 'rehearsal-dinner',
    name: 'Rehearsal Dinner',
    category: 'pre_post_wedding',
    defaultTone: 'elegant',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'toasts-speeches', 'dinner-details', 'event-info'],
    typicalRoles: ['couple', 'host', 'family', 'narrator'],
    culturalRegions: ['NAM', 'EU', 'OCEANIA'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🍽️',
    tags: ['rehearsal', 'dinner', 'pre-wedding', 'formal'],
    description: 'Rehearsal dinner — intimate pre-wedding gathering.',
  },

  'honeymoon': {
    id: 'honeymoon',
    name: 'Honeymoon Video',
    category: 'pre_post_wedding',
    defaultTone: 'adventurous',
    availableFormats: ['photo_montage_video', 'social_clip', 'highlight_reel'],
    defaultChapters: ['departure', 'destination', 'adventures', 'memories'],
    typicalRoles: ['couple', 'narrator'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: false,
    icon: '🏖️',
    tags: ['honeymoon', 'travel', 'post-wedding', 'adventure'],
    description: 'Honeymoon travel video montage.',
  },

  // ── RELIGIOUS CEREMONIES (10) ──────────────────────────────────────────────

  'naming-ceremony': {
    id: 'naming-ceremony',
    name: 'Naming Ceremony',
    category: 'religious',
    defaultTone: 'sacred',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'name-reveal', 'blessing', 'celebration'],
    typicalRoles: ['family', 'officiant', 'narrator', 'guest_of_honor'],
    culturalRegions: ['INDIA', 'AFRICA', 'SOUTH_ASIA', 'SEA'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '👶',
    tags: ['naming', 'baby', 'ceremony', 'newborn', 'naamkaran'],
    description: 'Baby naming ceremony with cultural/religious traditions.',
  },

  'baptism': {
    id: 'baptism',
    name: 'Baptism / Christening',
    category: 'religious',
    defaultTone: 'sacred',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'ceremony', 'blessing', 'celebration'],
    typicalRoles: ['family', 'officiant', 'narrator', 'guest_of_honor'],
    culturalRegions: ['NAM', 'EU', 'EURASIA', 'LATAM', 'AFRICA', 'OCEANIA', 'CARIBBEAN'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '⛪',
    tags: ['baptism', 'christening', 'christian', 'sacrament'],
    description: 'Christian baptism or christening ceremony.',
  },

  'bar-bat-mitzvah': {
    id: 'bar-bat-mitzvah',
    name: 'Bar/Bat Mitzvah',
    category: 'religious',
    defaultTone: 'celebratory',
    availableFormats: [...LIFE_EVENT_FORMATS, 'ceremony_program_pptx'],
    defaultChapters: ['welcome', 'torah-reading', 'speech', 'celebration', 'party'],
    typicalRoles: ['guest_of_honor', 'family', 'officiant', 'narrator'],
    culturalRegions: ['NAM', 'EU', 'MENA'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '✡️',
    tags: ['bar-mitzvah', 'bat-mitzvah', 'jewish', 'coming-of-age'],
    description: 'Jewish coming-of-age ceremony.',
  },

  'upanayanam': {
    id: 'upanayanam',
    name: 'Upanayanam / Sacred Thread',
    category: 'religious',
    defaultTone: 'sacred',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'ceremony', 'sacred-thread', 'blessing', 'feast'],
    typicalRoles: ['guest_of_honor', 'family', 'officiant', 'narrator'],
    culturalRegions: ['INDIA', 'SOUTH_ASIA'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🙏',
    tags: ['upanayanam', 'janoi', 'thread-ceremony', 'hindu', 'brahmin'],
    description: 'Hindu sacred thread ceremony (Upanayanam/Janoi).',
  },

  'aqeeqah': {
    id: 'aqeeqah',
    name: 'Aqeeqah',
    category: 'religious',
    defaultTone: 'sacred',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'baby-blessing', 'ceremony', 'feast'],
    typicalRoles: ['family', 'officiant', 'narrator', 'guest_of_honor'],
    culturalRegions: ['MENA', 'PAKISTAN', 'BANGLADESH', 'INDIA', 'SEA', 'TURKEY', 'CENTRAL_ASIA', 'AFRICA'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🌙',
    tags: ['aqeeqah', 'aqiqah', 'islamic', 'baby', 'celebration'],
    description: 'Islamic celebration for a newborn child.',
  },

  'first-communion': {
    id: 'first-communion',
    name: 'First Communion',
    category: 'religious',
    defaultTone: 'sacred',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'ceremony', 'blessing', 'celebration'],
    typicalRoles: ['guest_of_honor', 'family', 'officiant', 'narrator'],
    culturalRegions: ['NAM', 'EU', 'LATAM', 'CARIBBEAN'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '✝️',
    tags: ['communion', 'catholic', 'christian', 'sacrament'],
    description: 'Catholic First Holy Communion ceremony.',
  },

  'confirmation': {
    id: 'confirmation',
    name: 'Confirmation',
    category: 'religious',
    defaultTone: 'reverent',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'ceremony', 'blessing', 'celebration'],
    typicalRoles: ['guest_of_honor', 'family', 'officiant', 'narrator'],
    culturalRegions: ['NAM', 'EU', 'LATAM', 'OCEANIA'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🕊️',
    tags: ['confirmation', 'christian', 'sacrament', 'faith'],
    description: 'Christian Confirmation ceremony.',
  },

  'quinceanera': {
    id: 'quinceanera',
    name: 'Quinceañera',
    category: 'religious',
    defaultTone: 'celebratory',
    availableFormats: [...LIFE_EVENT_FORMATS, 'ceremony_program_pptx'],
    defaultChapters: ['welcome', 'church-ceremony', 'waltz', 'party', 'toast'],
    typicalRoles: ['guest_of_honor', 'family', 'officiant', 'narrator', 'emcee'],
    culturalRegions: ['LATAM', 'NAM', 'CARIBBEAN'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '👑',
    tags: ['quinceanera', 'quince', 'fifteen', 'latin', 'coming-of-age'],
    description: 'Latin American 15th birthday celebration.',
  },

  'amrit-sanchar': {
    id: 'amrit-sanchar',
    name: 'Amrit Sanchar',
    category: 'religious',
    defaultTone: 'sacred',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'ceremony', 'initiation', 'blessing'],
    typicalRoles: ['guest_of_honor', 'family', 'officiant', 'narrator'],
    culturalRegions: ['INDIA'],
    supportsFusion: false,
    supportsUploadRedesign: false,
    icon: '🪯',
    tags: ['amrit', 'sikh', 'initiation', 'khalsa'],
    description: 'Sikh initiation ceremony.',
  },

  'janoi': {
    id: 'janoi',
    name: 'Janoi / Thread Ceremony',
    category: 'religious',
    defaultTone: 'sacred',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'sacred-thread', 'ceremony', 'feast'],
    typicalRoles: ['guest_of_honor', 'family', 'officiant', 'narrator'],
    culturalRegions: ['INDIA', 'SOUTH_ASIA'],
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🧵',
    tags: ['janoi', 'thread', 'hindu', 'ceremony'],
    description: 'Sacred thread ceremony — Gujarati/Maharashtrian variant.',
  },

  // ── LIFE MILESTONES (8) ────────────────────────────────────────────────────

  'baby-shower': {
    id: 'baby-shower',
    name: 'Baby Shower',
    category: 'life_milestone',
    defaultTone: 'joyful',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'parent-story', 'games-activities', 'event-details'],
    typicalRoles: ['guest_of_honor', 'host', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🍼',
    tags: ['baby-shower', 'baby', 'expecting', 'parents', 'godh-bharai'],
    description: 'Baby shower / Godh Bharai / Seemantham celebration.',
  },

  'gender-reveal': {
    id: 'gender-reveal',
    name: 'Gender Reveal',
    category: 'life_milestone',
    defaultTone: 'playful',
    availableFormats: ['announcement_video', 'social_clip', 'digital_invitation', 'photo_montage_video'],
    defaultChapters: ['intro', 'suspense', 'the-reveal', 'celebration'],
    typicalRoles: ['couple', 'narrator', 'family'],
    culturalRegions: ['NAM', 'EU', 'LATAM', 'OCEANIA'],
    supportsFusion: false,
    supportsUploadRedesign: false,
    icon: '🎀',
    tags: ['gender-reveal', 'baby', 'announcement', 'surprise'],
    description: 'Gender reveal party or announcement video.',
  },

  'birthday-milestone': {
    id: 'birthday-milestone',
    name: 'Milestone Birthday',
    category: 'life_milestone',
    defaultTone: 'celebratory',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'life-highlights', 'tribute-messages', 'party-details'],
    typicalRoles: ['guest_of_honor', 'host', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🎂',
    tags: ['birthday', 'milestone', '30th', '40th', '50th', '60th', '70th'],
    description: 'Milestone birthday celebration (30th, 40th, 50th, etc.).',
  },

  'birthday-child': {
    id: 'birthday-child',
    name: "Child's Birthday",
    category: 'life_milestone',
    defaultTone: 'playful',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'birthday-theme', 'activities', 'party-details'],
    typicalRoles: ['guest_of_honor', 'host', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🎈',
    tags: ['birthday', 'child', 'kids', 'party', '1st'],
    description: "Child's birthday party invitation or announcement.",
  },

  'graduation': {
    id: 'graduation',
    name: 'Graduation',
    category: 'life_milestone',
    defaultTone: 'inspirational',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['congratulations', 'journey', 'ceremony-preview', 'celebration-details'],
    typicalRoles: ['guest_of_honor', 'narrator', 'family', 'speaker'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🎓',
    tags: ['graduation', 'commencement', 'degree', 'school', 'university'],
    description: 'Graduation ceremony celebration or announcement.',
  },

  'retirement': {
    id: 'retirement',
    name: 'Retirement',
    category: 'life_milestone',
    defaultTone: 'nostalgic',
    availableFormats: [...LIFE_EVENT_FORMATS, 'tribute_video'],
    defaultChapters: ['career-highlights', 'tribute-messages', 'farewell', 'celebration'],
    typicalRoles: ['guest_of_honor', 'host', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🏆',
    tags: ['retirement', 'farewell', 'career', 'tribute'],
    description: 'Retirement celebration and tribute video.',
  },

  'anniversary': {
    id: 'anniversary',
    name: 'Anniversary',
    category: 'life_milestone',
    defaultTone: 'romantic',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['years-together', 'memories', 'celebration-details', 'blessing'],
    typicalRoles: ['couple', 'narrator', 'family', 'host'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '💑',
    tags: ['anniversary', 'silver', 'golden', 'years', 'celebration'],
    description: 'Wedding anniversary celebration.',
  },

  'housewarming': {
    id: 'housewarming',
    name: 'Housewarming',
    category: 'life_milestone',
    defaultTone: 'joyful',
    availableFormats: LIFE_EVENT_FORMATS,
    defaultChapters: ['welcome', 'the-new-home', 'blessing', 'party-details'],
    typicalRoles: ['host', 'narrator', 'family'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false,
    supportsUploadRedesign: true,
    icon: '🏠',
    tags: ['housewarming', 'new-home', 'griha-pravesh', 'moving'],
    description: 'Housewarming / Griha Pravesh celebration.',
  },

  // ── FESTIVALS (15) ─────────────────────────────────────────────────────────

  'diwali': {
    id: 'diwali', name: 'Diwali', category: 'festival', defaultTone: 'festive',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'significance', 'celebrations', 'wishes'],
    typicalRoles: ['narrator', 'family', 'host'],
    culturalRegions: ['INDIA', 'SOUTH_ASIA', 'SEA', 'NAM', 'EU'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🪔', tags: ['diwali', 'deepavali', 'lights', 'hindu', 'festival'],
    description: 'Festival of Lights — Diwali greetings and celebration.',
  },

  'eid-al-fitr': {
    id: 'eid-al-fitr', name: 'Eid al-Fitr', category: 'festival', defaultTone: 'joyful',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['eid-mubarak', 'prayers', 'feast', 'wishes'],
    typicalRoles: ['narrator', 'family', 'host'],
    culturalRegions: ['MENA', 'PAKISTAN', 'BANGLADESH', 'INDIA', 'SEA', 'TURKEY', 'CENTRAL_ASIA', 'AFRICA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🌙', tags: ['eid', 'fitr', 'ramadan', 'islamic', 'celebration'],
    description: 'Eid al-Fitr — celebration marking the end of Ramadan.',
  },

  'eid-al-adha': {
    id: 'eid-al-adha', name: 'Eid al-Adha', category: 'festival', defaultTone: 'sacred',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'sacrifice', 'feast', 'wishes'],
    typicalRoles: ['narrator', 'family'],
    culturalRegions: ['MENA', 'PAKISTAN', 'BANGLADESH', 'INDIA', 'SEA', 'TURKEY', 'CENTRAL_ASIA', 'AFRICA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🐑', tags: ['eid', 'adha', 'qurbani', 'islamic', 'sacrifice'],
    description: 'Eid al-Adha — Festival of Sacrifice.',
  },

  'christmas': {
    id: 'christmas', name: 'Christmas', category: 'festival', defaultTone: 'joyful',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'nativity', 'celebration', 'wishes'],
    typicalRoles: ['narrator', 'family', 'host'],
    culturalRegions: ['NAM', 'EU', 'EURASIA', 'LATAM', 'CARIBBEAN', 'OCEANIA', 'AFRICA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🎄', tags: ['christmas', 'xmas', 'holiday', 'christian', 'winter'],
    description: 'Christmas greetings and celebration.',
  },

  'chinese-new-year': {
    id: 'chinese-new-year', name: 'Chinese New Year / Lunar New Year', category: 'festival', defaultTone: 'festive',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'zodiac', 'traditions', 'wishes'],
    typicalRoles: ['narrator', 'family'],
    culturalRegions: ['CJK', 'SEA', 'NAM'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🧧', tags: ['chinese-new-year', 'lunar', 'spring-festival', 'zodiac'],
    description: 'Chinese/Lunar New Year celebration.',
  },

  'thanksgiving': {
    id: 'thanksgiving', name: 'Thanksgiving', category: 'festival', defaultTone: 'nostalgic',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['gratitude', 'family-gathering', 'feast', 'wishes'],
    typicalRoles: ['narrator', 'family', 'host'],
    culturalRegions: ['NAM'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🦃', tags: ['thanksgiving', 'gratitude', 'american', 'feast'],
    description: 'Thanksgiving celebration and gratitude.',
  },

  'nowruz': {
    id: 'nowruz', name: 'Nowruz', category: 'festival', defaultTone: 'festive',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'haft-sin', 'spring', 'wishes'],
    typicalRoles: ['narrator', 'family'],
    culturalRegions: ['MENA', 'CENTRAL_ASIA', 'TURKEY'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🌱', tags: ['nowruz', 'norooz', 'persian', 'spring', 'new-year'],
    description: 'Persian/Central Asian New Year — Nowruz.',
  },

  'hanukkah': {
    id: 'hanukkah', name: 'Hanukkah', category: 'festival', defaultTone: 'joyful',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'menorah', 'traditions', 'wishes'],
    typicalRoles: ['narrator', 'family'],
    culturalRegions: ['NAM', 'EU', 'MENA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🕎', tags: ['hanukkah', 'chanukah', 'jewish', 'menorah', 'lights'],
    description: 'Hanukkah — Festival of Lights.',
  },

  'easter': {
    id: 'easter', name: 'Easter', category: 'festival', defaultTone: 'joyful',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'resurrection', 'celebration', 'wishes'],
    typicalRoles: ['narrator', 'family'],
    culturalRegions: ['NAM', 'EU', 'EURASIA', 'LATAM', 'CARIBBEAN', 'OCEANIA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🐣', tags: ['easter', 'pascha', 'resurrection', 'christian', 'spring'],
    description: 'Easter / Pascha celebration.',
  },

  'holi': {
    id: 'holi', name: 'Holi', category: 'festival', defaultTone: 'playful',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'colors', 'celebration', 'wishes'],
    typicalRoles: ['narrator', 'family'],
    culturalRegions: ['INDIA', 'SOUTH_ASIA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🎨', tags: ['holi', 'colors', 'hindu', 'spring', 'festival'],
    description: 'Holi — Festival of Colors.',
  },

  'navratri': {
    id: 'navratri', name: 'Navratri', category: 'festival', defaultTone: 'sacred',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'nine-nights', 'garba', 'wishes'],
    typicalRoles: ['narrator', 'family', 'performer'],
    culturalRegions: ['INDIA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🪘', tags: ['navratri', 'durga', 'garba', 'dandiya', 'hindu'],
    description: 'Navratri — Nine Nights of worship and dance.',
  },

  'onam': {
    id: 'onam', name: 'Onam', category: 'festival', defaultTone: 'festive',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'pookalam', 'sadya', 'wishes'],
    typicalRoles: ['narrator', 'family'],
    culturalRegions: ['INDIA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🌸', tags: ['onam', 'kerala', 'harvest', 'mahabali'],
    description: 'Onam — Kerala harvest festival.',
  },

  'pongal': {
    id: 'pongal', name: 'Pongal', category: 'festival', defaultTone: 'festive',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'harvest', 'celebration', 'wishes'],
    typicalRoles: ['narrator', 'family'],
    culturalRegions: ['INDIA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🍚', tags: ['pongal', 'tamil', 'harvest', 'thai-pongal'],
    description: 'Pongal — Tamil harvest festival.',
  },

  'vesak': {
    id: 'vesak', name: 'Vesak', category: 'festival', defaultTone: 'reverent',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'buddha', 'meditation', 'wishes'],
    typicalRoles: ['narrator'],
    culturalRegions: ['SOUTH_ASIA', 'SEA', 'CJK'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🪷', tags: ['vesak', 'buddha', 'buddhist', 'enlightenment'],
    description: 'Vesak — celebration of Buddha.',
  },

  'songkran': {
    id: 'songkran', name: 'Songkran', category: 'festival', defaultTone: 'playful',
    availableFormats: FESTIVAL_FORMATS,
    defaultChapters: ['greeting', 'water-festival', 'celebration', 'wishes'],
    typicalRoles: ['narrator', 'family'],
    culturalRegions: ['SEA'],
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '💦', tags: ['songkran', 'thai', 'water', 'new-year'],
    description: 'Songkran — Thai New Year water festival.',
  },

  // ── CORPORATE EVENTS (4) ──────────────────────────────────────────────────

  'corporate-gala': {
    id: 'corporate-gala', name: 'Corporate Gala', category: 'corporate_event', defaultTone: 'elegant',
    availableFormats: CORPORATE_FORMATS,
    defaultChapters: ['welcome', 'keynote', 'awards', 'networking', 'closing'],
    typicalRoles: ['host', 'speaker', 'emcee', 'narrator', 'organizer'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false, supportsUploadRedesign: true,
    icon: '🎩', tags: ['gala', 'corporate', 'formal', 'black-tie'],
    description: 'Corporate gala dinner or formal event.',
  },

  'award-ceremony': {
    id: 'award-ceremony', name: 'Award Ceremony', category: 'corporate_event', defaultTone: 'dramatic',
    availableFormats: CORPORATE_FORMATS,
    defaultChapters: ['opening', 'nominees', 'awards', 'acceptance', 'closing'],
    typicalRoles: ['host', 'emcee', 'guest_of_honor', 'narrator', 'performer'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false, supportsUploadRedesign: true,
    icon: '🏅', tags: ['award', 'ceremony', 'recognition', 'achievement'],
    description: 'Award ceremony and recognition event.',
  },

  'team-celebration': {
    id: 'team-celebration', name: 'Team Celebration', category: 'corporate_event', defaultTone: 'celebratory',
    availableFormats: CORPORATE_FORMATS,
    defaultChapters: ['welcome', 'achievements', 'highlights', 'team-spirit', 'closing'],
    typicalRoles: ['host', 'narrator', 'organizer'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🎊', tags: ['team', 'celebration', 'corporate', 'achievement'],
    description: 'Team or department celebration event.',
  },

  'milestone-celebration': {
    id: 'milestone-celebration', name: 'Company Milestone', category: 'corporate_event', defaultTone: 'inspirational',
    availableFormats: CORPORATE_FORMATS,
    defaultChapters: ['welcome', 'journey', 'milestone', 'vision', 'celebration'],
    typicalRoles: ['host', 'speaker', 'narrator', 'organizer'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false, supportsUploadRedesign: true,
    icon: '🚀', tags: ['milestone', 'company', 'anniversary', 'ipo', 'launch'],
    description: 'Company milestone celebration (IPO, anniversary, product launch).',
  },

  // ── SPORTS EVENTS (extensibility demo) ────────────────────────────────────

  'game-day': {
    id: 'game-day', name: 'Game Day Party', category: 'sports_event', defaultTone: 'energetic',
    availableFormats: ['invitation_video', 'digital_invitation', 'social_clip', 'announcement_video'],
    defaultChapters: ['team-intro', 'matchup', 'party-details', 'lets-go'],
    typicalRoles: ['host', 'narrator', 'team'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🏟️', tags: ['game-day', 'sports', 'football', 'soccer', 'nfl', 'nba', 'cricket', 'watch-party'],
    description: 'Game day watch party — NFL, NBA, soccer, cricket, any sport.',
  },

  'tournament': {
    id: 'tournament', name: 'Tournament / Competition', category: 'sports_event', defaultTone: 'dramatic',
    availableFormats: ['announcement_video', 'highlight_reel', 'social_clip', 'ceremony_program_pptx'],
    defaultChapters: ['welcome', 'teams', 'schedule', 'brackets', 'closing'],
    typicalRoles: ['host', 'narrator', 'team', 'organizer'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🏆', tags: ['tournament', 'competition', 'bracket', 'championship'],
    description: 'Tournament or competition event.',
  },

  // ── INAUGURATION / OPENING (extensibility demo) ───────────────────────────

  'inauguration': {
    id: 'inauguration', name: 'Inauguration / Grand Opening', category: 'inauguration', defaultTone: 'inspirational',
    availableFormats: [...CORPORATE_FORMATS, 'photo_montage_video'],
    defaultChapters: ['welcome', 'vision', 'ribbon-cutting', 'tour', 'celebration'],
    typicalRoles: ['host', 'speaker', 'guest_of_honor', 'narrator', 'organizer'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false, supportsUploadRedesign: true,
    icon: '🎀', tags: ['inauguration', 'grand-opening', 'launch', 'ribbon-cutting', 'store', 'office'],
    description: 'Inauguration or grand opening of a new place, store, office, or venue.',
  },

  // ── MEMORIAL (1) ──────────────────────────────────────────────────────────

  'memorial': {
    id: 'memorial', name: 'Memorial / Tribute', category: 'memorial', defaultTone: 'solemn',
    availableFormats: ['tribute_video', 'photo_montage_video', 'ceremony_program_pptx', 'digital_invitation', 'webcast_live'],
    defaultChapters: ['tribute-opening', 'life-story', 'memories', 'tribute-messages', 'closing'],
    typicalRoles: ['narrator', 'family', 'speaker', 'officiant'],
    culturalRegions: ALL_REGIONS,
    supportsFusion: false, supportsUploadRedesign: false,
    icon: '🕯️', tags: ['memorial', 'tribute', 'remembrance', 'celebration-of-life', 'funeral'],
    description: 'Memorial service or celebration of life tribute.',
  },
};

// ─── REGISTRY API ────────────────────────────────────────────────────────────

/** Get a ceremony type definition by ID */
export function getCeremonyType(id: string): CeremonyTypeDefinition | undefined {
  return CEREMONY_TYPES[id];
}

/** Get all ceremony types for a category */
export function getCeremonyTypesByCategory(category: CeremonyCategory): CeremonyTypeDefinition[] {
  return Object.values(CEREMONY_TYPES).filter(ct => ct.category === category);
}

/** Get all ceremony categories in use */
export function getAllCategories(): CeremonyCategory[] {
  const cats = new Set(Object.values(CEREMONY_TYPES).map(ct => ct.category));
  return Array.from(cats);
}

/** Search ceremony types by name or tag */
export function searchCeremonyTypes(query: string): CeremonyTypeDefinition[] {
  const lower = query.toLowerCase();
  return Object.values(CEREMONY_TYPES).filter(ct =>
    ct.name.toLowerCase().includes(lower) ||
    ct.description.toLowerCase().includes(lower) ||
    ct.tags.some(tag => tag.includes(lower))
  );
}

/** Get ceremony types that have cultural overrides for a given region */
export function getCeremonyTypesForRegion(regionCode: string): CeremonyTypeDefinition[] {
  return Object.values(CEREMONY_TYPES).filter(ct =>
    ct.culturalRegions.includes(regionCode)
  );
}

/** Get all ceremony types that support upload redesign */
export function getRedesignableCeremonyTypes(): CeremonyTypeDefinition[] {
  return Object.values(CEREMONY_TYPES).filter(ct => ct.supportsUploadRedesign);
}

/** Get available output formats for a ceremony type */
export function getFormatsForCeremony(ceremonyId: string): CelebrationOutputFormat[] {
  return CEREMONY_TYPES[ceremonyId]?.availableFormats ?? [];
}

/** Get all ceremony type IDs */
export function getAllCeremonyTypeIds(): string[] {
  return Object.keys(CEREMONY_TYPES);
}

/** Get category display info */
export function getCategoryDisplayInfo(): Array<{ id: CeremonyCategory; name: string; icon: string; count: number }> {
  const categories: Array<{ id: CeremonyCategory; name: string; icon: string }> = [
    { id: 'wedding', name: 'Weddings', icon: '💍' },
    { id: 'pre_post_wedding', name: 'Pre/Post Wedding', icon: '💎' },
    { id: 'religious', name: 'Religious Ceremonies', icon: '🙏' },
    { id: 'life_milestone', name: 'Life Milestones', icon: '🎂' },
    { id: 'festival', name: 'Festivals', icon: '🎉' },
    { id: 'corporate_event', name: 'Corporate Events', icon: '🎩' },
    { id: 'sports_event', name: 'Sports Events', icon: '🏟️' },
    { id: 'inauguration', name: 'Inaugurations', icon: '🎀' },
    { id: 'memorial', name: 'Memorials', icon: '🕯️' },
    { id: 'custom', name: 'Custom Events', icon: '✨' },
  ];

  return categories.map(c => ({
    ...c,
    count: getCeremonyTypesByCategory(c.id).length,
  })).filter(c => c.count > 0);
}
