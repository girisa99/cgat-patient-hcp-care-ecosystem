/**
 * CEREMONY CULTURAL CONFIG
 *
 * Maps (ceremonyType x region/subregion) → cultural production metadata.
 * Extends (not replaces) existing CreativeDirectionSet from genie-cast-regional-creative-config.ts.
 *
 * Fallback chain: subregion → parent region → generic ceremony defaults
 * So even without a specific entry, every ceremony × region combination works.
 *
 * Covers ALL 16 parent regions × 62 subregions.
 */

import type { CeremonyCategory } from './ceremony-type-registry';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface CeremonyColorPalette {
  primary: string;
  accent: string;
  forbidden: string[];
  significance: Record<string, string>;
}

export interface CeremonySymbol {
  name: string;
  description: string;
  promptModifier: string;
}

export interface CeremonyMusic {
  genres: string[];
  instruments: string[];
  mood: string[];
  samplePrompt: string;
}

export interface CeremonyAttire {
  primary: string;
  secondary: string;
  guests: string;
  accessories: string[];
}

export interface CeremonySetting {
  venue: string;
  decorations: string[];
  lighting: string;
  environmentPrompt: string;
}

export interface CeremonyNarrative {
  storytellingStyle: string;
  emotionalArc: string[];
  coreValues: string[];
  greetingPhrase?: string;
  blessingPhrase?: string;
}

export interface CeremonyLocation {
  cityPromptModifiers: Record<string, string>;
  defaultVenues: string[];
  landscape: string;
  seasonalContext?: string;
}

export interface CeremonyCulturalOverride {
  /** Ceremony type ID */
  ceremonyId: string;
  /** Region or subregion code */
  regionCode: string;
  /** Local name for this ceremony */
  localName: string;
  /** Ritual phases → map to scene chapters */
  ritualPhases: string[];
  /** Color palette with cultural significance */
  colorPalette: CeremonyColorPalette;
  /** Cultural symbols for prompt injection */
  symbols: CeremonySymbol[];
  /** Music direction */
  music: CeremonyMusic;
  /** Attire descriptions */
  attire: CeremonyAttire;
  /** Venue/setting */
  setting: CeremonySetting;
  /** Narrative style */
  narrative: CeremonyNarrative;
  /** Art style preference */
  artStylePreference?: string;
  /** Right-to-left text direction */
  isRTL?: boolean;
  /** Sensitivity notes for AI generation */
  sensitivityNotes: string[];
  /** Location-aware generation context */
  location?: CeremonyLocation;
}

// ─── GENERIC DEFAULTS (fallback when no region-specific entry exists) ────────

const GENERIC_WEDDING_DEFAULT: Omit<CeremonyCulturalOverride, 'ceremonyId' | 'regionCode'> = {
  localName: 'Wedding',
  ritualPhases: ['processional', 'vows', 'ring-exchange', 'pronouncement', 'recessional'],
  colorPalette: {
    primary: '#FFFFFF',
    accent: '#D4AF37',
    forbidden: [],
    significance: { white: 'purity', gold: 'prosperity' },
  },
  symbols: [
    { name: 'rings', description: 'Wedding rings symbolizing eternal bond', promptModifier: 'golden wedding rings with diamond, elegant' },
    { name: 'flowers', description: 'Floral arrangements', promptModifier: 'lush white and blush pink floral arrangements' },
  ],
  music: {
    genres: ['classical', 'romantic'],
    instruments: ['piano', 'strings', 'harp'],
    mood: ['romantic', 'elegant', 'emotional'],
    samplePrompt: 'Romantic classical wedding music with piano and strings, elegant and emotional',
  },
  attire: {
    primary: 'White wedding gown',
    secondary: 'Dark suit or tuxedo',
    guests: 'Formal attire',
    accessories: ['veil', 'bouquet', 'boutonniere'],
  },
  setting: {
    venue: 'Elegant ceremony venue',
    decorations: ['flowers', 'candles', 'white drapery'],
    lighting: 'Warm golden ambient lighting',
    environmentPrompt: 'Beautiful wedding venue with elegant decorations, warm lighting, floral arrangements',
  },
  narrative: {
    storytellingStyle: 'Romantic and heartfelt',
    emotionalArc: ['anticipation', 'joy', 'tears', 'celebration'],
    coreValues: ['love', 'commitment', 'family', 'togetherness'],
    greetingPhrase: 'Together with their families',
    blessingPhrase: 'May your love story be eternal',
  },
  sensitivityNotes: ['Respect diverse family structures', 'Avoid assumptions about gender roles'],
};

const GENERIC_FESTIVAL_DEFAULT: Omit<CeremonyCulturalOverride, 'ceremonyId' | 'regionCode'> = {
  localName: 'Festival',
  ritualPhases: ['greeting', 'celebration', 'feast', 'wishes'],
  colorPalette: {
    primary: '#FFD700',
    accent: '#FF6347',
    forbidden: [],
    significance: { gold: 'joy', red: 'energy' },
  },
  symbols: [
    { name: 'lantern', description: 'Festival lantern', promptModifier: 'glowing festival lanterns, warm atmosphere' },
  ],
  music: {
    genres: ['festive', 'folk'],
    instruments: ['drums', 'flute'],
    mood: ['joyful', 'energetic', 'festive'],
    samplePrompt: 'Festive celebration music with drums and flute, joyful and energetic',
  },
  attire: { primary: 'Festive clothing', secondary: 'Traditional attire', guests: 'Festive wear', accessories: [] },
  setting: {
    venue: 'Festival grounds',
    decorations: ['lanterns', 'banners', 'flowers'],
    lighting: 'Warm festive lighting',
    environmentPrompt: 'Vibrant festival atmosphere with colorful decorations and warm lighting',
  },
  narrative: {
    storytellingStyle: 'Festive and communal',
    emotionalArc: ['excitement', 'togetherness', 'joy'],
    coreValues: ['community', 'tradition', 'celebration'],
  },
  sensitivityNotes: ['Respect religious significance', 'Avoid trivializing sacred aspects'],
};

const GENERIC_LIFE_EVENT_DEFAULT: Omit<CeremonyCulturalOverride, 'ceremonyId' | 'regionCode'> = {
  localName: 'Celebration',
  ritualPhases: ['welcome', 'main-event', 'celebration'],
  colorPalette: {
    primary: '#87CEEB',
    accent: '#FFB6C1',
    forbidden: [],
    significance: { blue: 'happiness', pink: 'joy' },
  },
  symbols: [],
  music: {
    genres: ['pop', 'feel-good'],
    instruments: ['guitar', 'piano'],
    mood: ['happy', 'upbeat'],
    samplePrompt: 'Happy upbeat celebration music',
  },
  attire: { primary: 'Smart casual', secondary: 'Casual', guests: 'Casual', accessories: [] },
  setting: {
    venue: 'Party venue',
    decorations: ['balloons', 'streamers', 'banners'],
    lighting: 'Bright and cheerful lighting',
    environmentPrompt: 'Cheerful celebration venue with colorful decorations',
  },
  narrative: {
    storytellingStyle: 'Warm and personal',
    emotionalArc: ['anticipation', 'joy', 'celebration'],
    coreValues: ['family', 'love', 'joy'],
  },
  sensitivityNotes: [],
};

// ─── CULTURAL OVERRIDES ──────────────────────────────────────────────────────

export const CEREMONY_CULTURAL_OVERRIDES: CeremonyCulturalOverride[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // INDIA — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'INDIA',
    localName: 'Shubh Vivah',
    ritualPhases: ['baraat', 'milni', 'jai-mala', 'kanyadaan', 'pheras', 'sindoor', 'vidaai'],
    colorPalette: {
      primary: '#CC0000', accent: '#FFD700',
      forbidden: ['#000000', '#FFFFFF'],
      significance: { red: 'prosperity & fertility', gold: 'wealth & purity', green: 'new beginnings' },
    },
    symbols: [
      { name: 'mandap', description: 'Sacred wedding canopy', promptModifier: 'ornate mandap with marigold garlands, red drapes, and golden pillars' },
      { name: 'kalash', description: 'Sacred pot', promptModifier: 'brass kalash with coconut and mango leaves' },
      { name: 'fire', description: 'Sacred fire (Agni)', promptModifier: 'sacred fire burning in havan kund, golden flames' },
      { name: 'marigold', description: 'Marigold garlands', promptModifier: 'cascading orange and yellow marigold garland strings' },
    ],
    music: {
      genres: ['indian-classical', 'shehnai', 'bollywood'],
      instruments: ['shehnai', 'dhol', 'tabla', 'sitar'],
      mood: ['festive', 'sacred', 'romantic', 'energetic'],
      samplePrompt: 'Traditional Indian wedding music with shehnai and dhol, festive and auspicious',
    },
    attire: {
      primary: 'Red and gold bridal lehenga with heavy embroidery',
      secondary: 'Ivory or cream sherwani with gold embroidery',
      guests: 'Bright colorful sarees and kurta-pajamas',
      accessories: ['maang tikka', 'chooda', 'kalire', 'sehra', 'jootis'],
    },
    setting: {
      venue: 'Decorated mandap in palace courtyard or luxury hotel',
      decorations: ['marigold strings', 'banana leaves', 'rangoli', 'diyas', 'red drapes'],
      lighting: 'Warm golden lighting with diyas and fairy lights',
      environmentPrompt: 'Grand Indian wedding mandap with marigold garlands, golden lighting, red and gold drapes, traditional decorations',
    },
    narrative: {
      storytellingStyle: 'Grand, vibrant, and deeply traditional',
      emotionalArc: ['anticipation', 'festivity', 'sacred-vows', 'emotional-vidaai', 'celebration'],
      coreValues: ['family', 'tradition', 'dharma', 'union-of-families'],
      greetingPhrase: 'Shubh Vivah ke shubh avsar par',
      blessingPhrase: 'Sada suhagan raho',
    },
    artStylePreference: 'Rajput miniature painting',
    sensitivityNotes: ['Respect caste/community customs', 'Include dowry-free messaging where appropriate', 'Sacred fire imagery must be respectful'],
    location: {
      cityPromptModifiers: {
        'Delhi': 'Mughal architecture, Qutub Minar skyline, wide boulevards',
        'Jaipur': 'Pink City palace architecture, Hawa Mahal, Rajput royal aesthetic',
        'Udaipur': 'Lake Palace, Aravalli hills, romantic lakeside setting',
        'Mumbai': 'Marine Drive, Art Deco architecture, cosmopolitan luxury',
        'Agra': 'Taj Mahal gardens, Mughal sandstone architecture',
        'Jodhpur': 'Blue City, Mehrangarh Fort backdrop, desert royal aesthetic',
      },
      defaultVenues: ['mandap in palace courtyard', 'luxury hotel ballroom', 'temple hall', 'farmhouse lawn'],
      landscape: 'Golden Rajasthani desert landscape or lush Northern plains',
    },
  },

  {
    ceremonyId: 'wedding-traditional', regionCode: 'INDIA_SOUTH',
    localName: 'Kalyanam',
    ritualPhases: ['vratham', 'kashi-yatra', 'muhurtham', 'thali-tying', 'saptapadi', 'arundhati', 'grihapravesam'],
    colorPalette: {
      primary: '#CC0000', accent: '#FFD700',
      forbidden: ['#000000'],
      significance: { red: 'auspiciousness', gold: 'purity', white: 'peace' },
    },
    symbols: [
      { name: 'thali', description: 'Sacred wedding necklace', promptModifier: 'golden thali/mangalsutra with sacred pendant' },
      { name: 'banana-tree', description: 'Banana tree decorations', promptModifier: 'fresh banana trees flanking the mandapam entrance' },
      { name: 'kolam', description: 'Traditional floor art', promptModifier: 'intricate white kolam rangoli pattern on red floor' },
    ],
    music: {
      genres: ['carnatic', 'nadaswaram', 'classical-south'],
      instruments: ['nadaswaram', 'thavil', 'veena', 'mridangam'],
      mood: ['auspicious', 'sacred', 'traditional'],
      samplePrompt: 'Traditional South Indian wedding music with nadaswaram and thavil, auspicious and sacred',
    },
    attire: {
      primary: 'Red Kanjivaram silk saree with gold zari border',
      secondary: 'White dhoti with gold border and angavastram',
      guests: 'Silk sarees and formal dhotis',
      accessories: ['temple jewelry', 'jasmine flowers in hair', 'toe rings'],
    },
    setting: {
      venue: 'Temple mandapam or decorated marriage hall',
      decorations: ['banana trees', 'mango leaves toran', 'jasmine strings', 'brass lamps'],
      lighting: 'Warm traditional brass oil lamp lighting',
      environmentPrompt: 'South Indian wedding mandapam with banana tree decorations, jasmine garlands, brass oil lamps, temple architecture',
    },
    narrative: {
      storytellingStyle: 'Sacred and classical with Vedic undertones',
      emotionalArc: ['devotion', 'sacred-rituals', 'family-union', 'celebration'],
      coreValues: ['dharma', 'family-honor', 'tradition', 'spiritual-union'],
      greetingPhrase: 'Subha Muhurtham',
      blessingPhrase: 'Sowmangalyam bhavathi',
    },
    artStylePreference: 'Tanjore painting style',
    sensitivityNotes: ['Respect Vedic ritual sequence', 'Muhurtham timing is sacred'],
    location: {
      cityPromptModifiers: {
        'Chennai': 'Dravidian temple gopuram, Marina Beach, colonial architecture',
        'Hyderabad': 'Charminar, Golconda Fort, Nizami pearl heritage',
        'Bangalore': 'Garden City, modern tech cosmopolitan with temple gardens',
        'Kochi': 'Kerala backwaters, Chinese fishing nets, lush green tropics',
        'Mysore': 'Mysore Palace, royal Wodeyar heritage, sandalwood',
      },
      defaultVenues: ['temple mandapam', 'marriage hall', 'heritage palace'],
      landscape: 'Lush tropical greenery with temple gopurams',
      seasonalContext: 'Post-monsoon green',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PAKISTAN — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'PAKISTAN',
    localName: 'Shadi / Nikah',
    ritualPhases: ['mehndi', 'baraat', 'nikah', 'rukhsati', 'walima'],
    colorPalette: {
      primary: '#8B0000', accent: '#FFD700',
      forbidden: [],
      significance: { red: 'joy & celebration', gold: 'luxury', green: 'Islam & prosperity' },
    },
    symbols: [
      { name: 'jhoomar', description: 'Bridal headpiece', promptModifier: 'ornate golden jhoomar bridal headpiece with pearls' },
      { name: 'sehra', description: 'Groom face veil', promptModifier: 'traditional sehra with flower strings covering grooms face' },
    ],
    music: {
      genres: ['qawwali', 'ghazal', 'dholki'],
      instruments: ['dholak', 'harmonium', 'tabla', 'sitar'],
      mood: ['festive', 'romantic', 'energetic'],
      samplePrompt: 'Pakistani wedding music with dholak and harmonium, festive qawwali-inspired celebration',
    },
    attire: {
      primary: 'Red gharara or sharara with heavy gold zardozi embroidery',
      secondary: 'Gold or cream sherwani with embroidered dupatta',
      guests: 'Colorful shalwar kameez and sarees',
      accessories: ['jhoomar', 'nath', 'churiyan', 'sehra', 'khussa'],
    },
    setting: {
      venue: 'Grand marquee or heritage haveli',
      decorations: ['red roses', 'fairy lights', 'chandeliers', 'gold drapes'],
      lighting: 'Dramatic chandelier and fairy light combinations',
      environmentPrompt: 'Grand Pakistani wedding marquee with red roses, crystal chandeliers, gold and burgundy drapes',
    },
    narrative: {
      storytellingStyle: 'Romantic with Islamic reverence',
      emotionalArc: ['mehndi-joy', 'baraat-grandeur', 'nikah-solemnity', 'rukhsati-emotion', 'walima-celebration'],
      coreValues: ['family-honor', 'faith', 'hospitality', 'new-beginnings'],
      greetingPhrase: 'Mubarak ho! Shadi ki dawat',
      blessingPhrase: 'Allah Pak apko khush rakhe',
    },
    sensitivityNotes: ['Respect Islamic values', 'Gender-appropriate seating if traditional'],
    location: {
      cityPromptModifiers: {
        'Lahore': 'Badshahi Mosque, Mughal architecture, Lahori food culture',
        'Karachi': 'Arabian Sea coast, modern cosmopolitan, Clifton beach',
        'Islamabad': 'Margalla Hills, Faisal Mosque, modern capital aesthetic',
      },
      defaultVenues: ['grand marquee', 'heritage haveli', 'luxury hotel'],
      landscape: 'Mughal-inspired architecture and lush gardens',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MENA — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'MENA',
    localName: 'Zaffa / Nikah',
    ritualPhases: ['henna-night', 'katb-al-kitab', 'zaffa-procession', 'walima-reception'],
    colorPalette: {
      primary: '#FFFFFF', accent: '#C5A35A',
      forbidden: [],
      significance: { white: 'purity', gold: 'luxury & wealth', green: 'Islam' },
    },
    symbols: [
      { name: 'kosha', description: 'Bridal stage', promptModifier: 'ornate white and gold kosha bridal stage with flower arrangements' },
      { name: 'henna', description: 'Henna art', promptModifier: 'intricate Arabic henna patterns on hands' },
    ],
    music: {
      genres: ['arabic-pop', 'khaleeji', 'dabke'],
      instruments: ['oud', 'darbuka', 'qanun', 'nay'],
      mood: ['celebratory', 'luxurious', 'romantic'],
      samplePrompt: 'Arabic wedding music with oud and darbuka, luxurious and celebratory',
    },
    attire: {
      primary: 'White or ivory bridal gown with gold embroidery',
      secondary: 'White thobe or bisht with gold trim',
      guests: 'Elegant abayas and thobes',
      accessories: ['gold jewelry sets', 'tiara', 'henna'],
    },
    setting: {
      venue: 'Luxury hotel ballroom or palace',
      decorations: ['white roses', 'crystal chandeliers', 'gold accents', 'orchids'],
      lighting: 'Dramatic crystal chandelier lighting with gold warm tones',
      environmentPrompt: 'Luxurious Middle Eastern wedding venue with crystal chandeliers, white roses, gold accents, and ornate kosha',
    },
    narrative: {
      storytellingStyle: 'Grand, luxurious, and celebratory',
      emotionalArc: ['henna-intimacy', 'nikah-solemnity', 'zaffa-grandeur', 'reception-joy'],
      coreValues: ['family-honor', 'generosity', 'faith', 'hospitality'],
      greetingPhrase: 'Alf mabrook!',
      blessingPhrase: 'Barakallahu lakuma wa baraka alaikuma',
    },
    isRTL: true,
    sensitivityNotes: ['Respect gender separation if traditional', 'Islamic values in content', 'Modest imagery'],
    location: {
      cityPromptModifiers: {
        'Dubai': 'Burj Khalifa, desert dunes, ultra-luxury modern architecture',
        'Abu Dhabi': 'Sheikh Zayed Grand Mosque, pearl heritage, Saadiyat Island',
        'Doha': 'The Pearl, Museum of Islamic Art, Gulf waterfront',
        'Riyadh': 'Kingdom Tower, Diriyah heritage, Arabian desert',
        'Cairo': 'Pyramids of Giza, Nile river, Islamic Cairo minarets',
        'Beirut': 'Mediterranean coast, French-Ottoman architecture, Raouche Rocks',
      },
      defaultVenues: ['luxury hotel ballroom', 'desert resort', 'palace banquet hall'],
      landscape: 'Arabian desert with modern luxury skyline',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CJK — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'CJK_CN',
    localName: '婚礼 (Hunli)',
    ritualPhases: ['tea-ceremony', 'door-games', 'banquet', 'toasts', 'final-send-off'],
    colorPalette: {
      primary: '#CC0000', accent: '#FFD700',
      forbidden: ['#FFFFFF', '#000000'],
      significance: { red: 'luck & joy', gold: 'wealth', pink: 'romance' },
    },
    symbols: [
      { name: 'double-happiness', description: '囍 character', promptModifier: 'large red and gold double happiness 囍 character' },
      { name: 'dragon-phoenix', description: 'Dragon and phoenix pair', promptModifier: 'golden dragon and phoenix pair symbolizing perfect union' },
      { name: 'red-lantern', description: 'Red lanterns', promptModifier: 'rows of red paper lanterns with gold tassels' },
    ],
    music: {
      genres: ['chinese-classical', 'c-pop-ballad'],
      instruments: ['guzheng', 'erhu', 'pipa', 'dizi'],
      mood: ['romantic', 'auspicious', 'festive'],
      samplePrompt: 'Traditional Chinese wedding music with guzheng and erhu, romantic and auspicious',
    },
    attire: {
      primary: 'Red qipao or xiuhefu with gold dragon-phoenix embroidery',
      secondary: 'Tang suit or Western tuxedo with red boutonniere',
      guests: 'Formal attire, avoid white and black',
      accessories: ['phoenix crown', 'gold jewelry', 'red veil'],
    },
    setting: {
      venue: 'Grand banquet hall or traditional courtyard',
      decorations: ['red lanterns', 'double happiness signs', 'red silk drapes', 'gold accents'],
      lighting: 'Red and gold warm lighting with lantern glow',
      environmentPrompt: 'Grand Chinese wedding banquet hall with red lanterns, double happiness characters, gold and red silk decorations',
    },
    narrative: {
      storytellingStyle: 'Auspicious and family-centered',
      emotionalArc: ['tea-ceremony-respect', 'playful-door-games', 'grand-banquet', 'toasts-celebration'],
      coreValues: ['filial-piety', 'family-unity', 'prosperity', 'harmony'],
      greetingPhrase: '恭喜恭喜！',
      blessingPhrase: '百年好合，早生贵子',
    },
    sensitivityNotes: ['Avoid number 4 (death association)', 'White = mourning in traditional context'],
    location: {
      cityPromptModifiers: {
        'Beijing': 'Forbidden City, red walls, Imperial architecture, hutongs',
        'Shanghai': 'The Bund, Art Deco, modern luxury with traditional gardens',
        'Guangzhou': 'Canton Tower, Pearl River, Cantonese culture',
        'Chengdu': 'Sichuan teahouse culture, panda motifs, bamboo gardens',
      },
      defaultVenues: ['grand banquet hall', 'traditional courtyard siheyuan', 'luxury hotel'],
      landscape: 'Traditional Chinese garden with pavilions and bridges',
    },
  },

  {
    ceremonyId: 'wedding-traditional', regionCode: 'CJK_JP',
    localName: '結婚式 (Kekkonshiki)',
    ritualPhases: ['san-san-kudo', 'ring-exchange', 'sake-ceremony', 'reception'],
    colorPalette: {
      primary: '#FFFFFF', accent: '#CC0000',
      forbidden: [],
      significance: { white: 'purity & new beginnings', red: 'joy', gold: 'prosperity' },
    },
    symbols: [
      { name: 'torii', description: 'Shinto shrine gate', promptModifier: 'vermillion torii gate at a serene Shinto shrine' },
      { name: 'tsuru', description: 'Origami cranes', promptModifier: 'one thousand colorful origami paper cranes (senbazuru)' },
      { name: 'sake', description: 'Sake cups', promptModifier: 'three ceremonial sake cups for san-san-kudo ritual' },
    ],
    music: {
      genres: ['japanese-classical', 'gagaku'],
      instruments: ['koto', 'shakuhachi', 'shamisen', 'taiko'],
      mood: ['serene', 'elegant', 'ceremonial'],
      samplePrompt: 'Japanese wedding music with koto and shakuhachi, serene and elegant Shinto ceremony',
    },
    attire: {
      primary: 'White shiromuku kimono or uchikake with crane motifs',
      secondary: 'Black montsuki haori hakama with family crest',
      guests: 'Formal kimono or dark suits',
      accessories: ['wataboshi head covering', 'sensu fan', 'obi'],
    },
    setting: {
      venue: 'Shinto shrine or Japanese garden',
      decorations: ['paper cranes', 'ikebana arrangements', 'bamboo', 'seasonal flowers'],
      lighting: 'Natural soft lighting filtering through paper screens',
      environmentPrompt: 'Serene Shinto shrine ceremony with torii gate, zen garden, cherry blossoms, natural lighting through shoji screens',
    },
    narrative: {
      storytellingStyle: 'Minimalist, serene, and deeply respectful',
      emotionalArc: ['reverence', 'sacred-ritual', 'quiet-joy', 'family-bond'],
      coreValues: ['harmony', 'respect', 'purity', 'endurance'],
      greetingPhrase: 'ご結婚おめでとうございます',
      blessingPhrase: '末永くお幸せに',
    },
    sensitivityNotes: ['Respect Shinto customs', 'Seasonal awareness (cherry blossom, autumn leaves, etc.)'],
    location: {
      cityPromptModifiers: {
        'Tokyo': 'Meiji Shrine, modern skyline, Imperial Palace gardens',
        'Kyoto': 'Bamboo grove, Fushimi Inari, traditional machiya architecture',
        'Osaka': 'Osaka Castle, vibrant Dotonbori, cherry blossom parks',
        'Nara': 'Ancient temples, deer park, peaceful forested shrines',
      },
      defaultVenues: ['Shinto shrine', 'Japanese garden', 'ryokan banquet hall'],
      landscape: 'Zen garden with cherry blossoms and bamboo',
      seasonalContext: 'Cherry blossom spring or autumn maple',
    },
  },

  {
    ceremonyId: 'wedding-traditional', regionCode: 'CJK_KR',
    localName: '결혼식 (Gyeolhonsik)',
    ritualPhases: ['pyebaek', 'ceremony', 'jeonse', 'reception'],
    colorPalette: {
      primary: '#CC0000', accent: '#0000CC',
      forbidden: [],
      significance: { red: 'yang/happiness', blue: 'yin/fidelity', white: 'purity' },
    },
    symbols: [
      { name: 'mandarin-ducks', description: 'Symbol of marital fidelity', promptModifier: 'carved wooden mandarin ducks (wedding ducks) on red silk' },
      { name: 'gourd', description: 'Gourd cups', promptModifier: 'two halves of a gourd used as ceremonial cups' },
    ],
    music: {
      genres: ['korean-classical', 'pansori', 'k-pop-ballad'],
      instruments: ['gayageum', 'daegeum', 'janggu'],
      mood: ['elegant', 'festive', 'romantic'],
      samplePrompt: 'Korean wedding music with gayageum, elegant and romantic traditional Korean ceremony',
    },
    attire: {
      primary: 'Red and green hanbok with intricate embroidery',
      secondary: 'Blue and red dopo (grooms hanbok)',
      guests: 'Formal hanbok or Western formal wear',
      accessories: ['jokduri crown', 'daenggi ribbon', 'norigae pendants'],
    },
    setting: {
      venue: 'Traditional hanok or modern wedding hall',
      decorations: ['folding screens', 'red and blue silk', 'chrysanthemums'],
      lighting: 'Warm traditional lighting',
      environmentPrompt: 'Korean pyebaek ceremony in traditional hanok with wooden folding screens, silk cushions, and chrysanthemum arrangements',
    },
    narrative: {
      storytellingStyle: 'Respectful and family-oriented with modern touches',
      emotionalArc: ['tradition', 'respect-for-elders', 'joyful-union', 'celebration'],
      coreValues: ['filial-piety', 'respect', 'harmony', 'fidelity'],
      greetingPhrase: '결혼을 축하합니다!',
      blessingPhrase: '행복하게 오래오래 사세요',
    },
    sensitivityNotes: ['Pyebaek bowing ritual is deeply significant', 'Respect elder hierarchy'],
    location: {
      cityPromptModifiers: {
        'Seoul': 'Gyeongbokgung Palace, Bukchon Hanok Village, modern Gangnam',
        'Busan': 'Haeundae Beach, colorful Gamcheon Village',
        'Jeju': 'Volcanic island, haenyeo culture, black stone walls',
      },
      defaultVenues: ['traditional hanok', 'modern wedding hall', 'hotel ballroom'],
      landscape: 'Traditional Korean hanok village with mountains',
      seasonalContext: 'Chuseok harvest or spring cherry blossom',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // EU — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'EU',
    localName: 'Wedding',
    ritualPhases: ['processional', 'readings', 'vows', 'ring-exchange', 'kiss', 'recessional', 'reception'],
    colorPalette: {
      primary: '#FFFFFF', accent: '#6B8E23',
      forbidden: [],
      significance: { white: 'purity', green: 'growth', blue: 'loyalty' },
    },
    symbols: [
      { name: 'church', description: 'Cathedral or chapel', promptModifier: 'Gothic European cathedral with stained glass windows' },
      { name: 'rings', description: 'Wedding bands', promptModifier: 'elegant platinum wedding bands on lace pillow' },
    ],
    music: {
      genres: ['classical', 'baroque', 'romantic'],
      instruments: ['organ', 'strings', 'harp', 'choir'],
      mood: ['elegant', 'romantic', 'solemn'],
      samplePrompt: 'European wedding music with organ and strings quartet, elegant cathedral ceremony',
    },
    attire: {
      primary: 'White designer wedding gown with cathedral train',
      secondary: 'Tailored morning suit or dark tuxedo',
      guests: 'Formal cocktail or black tie',
      accessories: ['veil', 'tiara', 'cufflinks'],
    },
    setting: {
      venue: 'Historic cathedral or countryside estate',
      decorations: ['white roses', 'ivy', 'candelabras', 'linen runners'],
      lighting: 'Natural light through stained glass, candlelight for reception',
      environmentPrompt: 'Elegant European wedding in historic cathedral with stained glass windows, white roses, and candlelight',
    },
    narrative: {
      storytellingStyle: 'Elegant and timeless',
      emotionalArc: ['procession', 'sacred-vows', 'joyful-kiss', 'grand-reception'],
      coreValues: ['love', 'commitment', 'tradition', 'elegance'],
    },
    sensitivityNotes: ['Respect secular vs religious preferences'],
    location: {
      cityPromptModifiers: {
        'Paris': 'Eiffel Tower, Seine river, Parisian balconies, lavender fields',
        'Rome': 'Colosseum, Roman fountains, Tuscan countryside',
        'London': 'Westminster, English gardens, countryside manor',
        'Barcelona': 'Gaudi architecture, Mediterranean blue, Catalan charm',
        'Prague': 'Charles Bridge, Gothic spires, Old Town cobblestones',
        'Santorini': 'White-washed walls, blue domes, Aegean Sea sunset',
      },
      defaultVenues: ['historic cathedral', 'countryside chateau', 'luxury hotel'],
      landscape: 'European countryside with rolling hills and vineyards',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NAM — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'NAM',
    localName: 'Wedding',
    ritualPhases: ['processional', 'opening', 'readings', 'vows', 'ring-exchange', 'pronouncement', 'first-kiss', 'recessional', 'reception'],
    colorPalette: {
      primary: '#FFFFFF', accent: '#C5A35A',
      forbidden: [],
      significance: { white: 'purity', gold: 'elegance', blush: 'romance' },
    },
    symbols: [
      { name: 'bouquet', description: 'Bridal bouquet', promptModifier: 'elegant bridal bouquet with white roses, peonies, and eucalyptus' },
    ],
    music: {
      genres: ['classical', 'pop-ballad', 'country', 'jazz'],
      instruments: ['piano', 'strings', 'guitar', 'saxophone'],
      mood: ['romantic', 'joyful', 'elegant'],
      samplePrompt: 'Modern American wedding music with piano and strings, romantic and joyful',
    },
    attire: {
      primary: 'White wedding gown',
      secondary: 'Tuxedo or tailored suit',
      guests: 'Semi-formal to black tie',
      accessories: ['veil', 'bouquet', 'boutonniere', 'garter'],
    },
    setting: {
      venue: 'Barn, garden, beach, or ballroom',
      decorations: ['centerpieces', 'fairy lights', 'mason jars', 'burlap runners'],
      lighting: 'Warm bistro/fairy lights or natural outdoor lighting',
      environmentPrompt: 'Beautiful American wedding venue with fairy lights, elegant floral centerpieces, and warm ambiance',
    },
    narrative: {
      storytellingStyle: 'Personal, heartfelt, and modern',
      emotionalArc: ['getting-ready', 'first-look', 'ceremony', 'first-dance', 'party'],
      coreValues: ['love', 'partnership', 'individuality', 'celebration'],
    },
    sensitivityNotes: ['Inclusive of diverse family structures'],
    location: {
      cityPromptModifiers: {
        'New York': 'Manhattan skyline, Central Park, Brooklyn Bridge golden hour',
        'Los Angeles': 'Pacific coast sunset, Santa Monica pier, palm trees',
        'Chicago': 'Lake Michigan, Art Institute, downtown riverwalk',
        'Nashville': 'Music City, rustic barn, country charm',
        'Napa Valley': 'Vineyard rows, Tuscan-inspired winery, golden hillsides',
        'Miami': 'Art Deco South Beach, tropical palms, ocean breeze',
      },
      defaultVenues: ['barn', 'garden estate', 'beach resort', 'hotel ballroom'],
      landscape: 'Varied American landscape — coast, mountain, countryside',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AFRICA — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'AFRICA_WEST',
    localName: 'Traditional Wedding',
    ritualPhases: ['introduction-of-families', 'dowry-ceremony', 'traditional-rites', 'blessing', 'reception-feast'],
    colorPalette: {
      primary: '#FFD700', accent: '#228B22',
      forbidden: [],
      significance: { gold: 'royalty & wealth', green: 'life', white: 'purity' },
    },
    symbols: [
      { name: 'kola-nut', description: 'Kola nut offering', promptModifier: 'traditional kola nut on carved wooden plate, symbol of welcome' },
      { name: 'aso-oke', description: 'Woven fabric', promptModifier: 'richly woven aso-oke fabric in gold and burgundy patterns' },
    ],
    music: {
      genres: ['afrobeats', 'highlife', 'juju', 'fuji'],
      instruments: ['talking-drum', 'djembe', 'shekere', 'agogo'],
      mood: ['energetic', 'celebratory', 'rhythmic'],
      samplePrompt: 'West African wedding music with talking drums and highlife rhythm, energetic and celebratory',
    },
    attire: {
      primary: 'Aso-oke wrapper and blouse with gele headtie',
      secondary: 'Agbada or dashiki with fila cap',
      guests: 'Matching aso-ebi family fabric outfits',
      accessories: ['gele headtie', 'coral beads', 'gold jewelry'],
    },
    setting: {
      venue: 'Outdoor marquee or cultural center',
      decorations: ['ankara fabric drapes', 'tropical flowers', 'woven baskets'],
      lighting: 'Warm golden stage lighting with colored accent lights',
      environmentPrompt: 'Vibrant West African wedding celebration with colorful aso-oke fabrics, tropical flowers, and energetic atmosphere',
    },
    narrative: {
      storytellingStyle: 'Vibrant, community-centered, and joyful',
      emotionalArc: ['family-introduction', 'cultural-rites', 'blessings', 'dance-celebration'],
      coreValues: ['community', 'family-lineage', 'respect-for-elders', 'celebration'],
      greetingPhrase: 'E ku odun! (Yoruba)',
      blessingPhrase: 'May your union be blessed with abundance',
    },
    sensitivityNotes: ['Respect tribal/ethnic customs', 'Dowry customs vary by community'],
    location: {
      cityPromptModifiers: {
        'Lagos': 'Victoria Island skyline, Lekki, vibrant city energy',
        'Accra': 'Black Star Square, Osu Castle, Ghanaian kente culture',
      },
      defaultVenues: ['outdoor marquee', 'cultural center', 'luxury hotel'],
      landscape: 'Tropical West African landscape with vibrant colors',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LATAM — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'LATAM_MX',
    localName: 'Boda',
    ritualPhases: ['church-ceremony', 'arras-coins', 'lasso-ceremony', 'bouquet-bible', 'reception-fiesta'],
    colorPalette: {
      primary: '#FFFFFF', accent: '#FF6347',
      forbidden: [],
      significance: { white: 'purity', red: 'passion', gold: 'prosperity' },
    },
    symbols: [
      { name: 'lasso', description: 'Wedding lasso (lazo)', promptModifier: 'ornate rosary-style wedding lasso placed around couples shoulders' },
      { name: 'arras', description: '13 gold coins', promptModifier: 'thirteen golden arras coins in ornate chest' },
      { name: 'papel-picado', description: 'Cut paper banners', promptModifier: 'colorful papel picado tissue paper banner garlands' },
    ],
    music: {
      genres: ['mariachi', 'ranchera', 'cumbia', 'salsa'],
      instruments: ['trumpet', 'violin', 'guitar', 'guitarron', 'vihuela'],
      mood: ['passionate', 'festive', 'romantic'],
      samplePrompt: 'Mexican wedding music with mariachi band, passionate trumpets and romantic strings',
    },
    attire: {
      primary: 'White wedding gown with mantilla veil',
      secondary: 'Charro suit or dark formal suit',
      guests: 'Festive formal wear',
      accessories: ['mantilla veil', 'fan', 'rosary'],
    },
    setting: {
      venue: 'Colonial church and hacienda reception',
      decorations: ['papel picado', 'candles', 'cacti', 'marigolds', 'colorful tiles'],
      lighting: 'Warm candlelight with colorful papel picado shadows',
      environmentPrompt: 'Mexican wedding at colonial hacienda with papel picado, marigolds, candlelight, and rustic elegance',
    },
    narrative: {
      storytellingStyle: 'Passionate, family-rooted, and vibrant',
      emotionalArc: ['church-devotion', 'lasso-unity', 'first-dance', 'fiesta-celebration'],
      coreValues: ['faith', 'family', 'passion', 'unity'],
      greetingPhrase: '¡Felicidades!',
      blessingPhrase: 'Que Dios los bendiga siempre',
    },
    sensitivityNotes: ['Catholic traditions prominent', 'Respect padrinos (godparents) role'],
    location: {
      cityPromptModifiers: {
        'Mexico City': 'Palacio de Bellas Artes, Chapultepec, colonial Centro Historico',
        'Cancun': 'Caribbean beach, turquoise water, Mayan ruins nearby',
        'Oaxaca': 'Colonial architecture, Monte Alban, mezcal culture',
        'San Miguel de Allende': 'Pink stone architecture, cobblestone streets, Parroquia church',
      },
      defaultVenues: ['colonial church', 'hacienda', 'beach resort'],
      landscape: 'Colonial Mexican architecture with vibrant colors',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SEA — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'SEA_THAI',
    localName: 'งานแต่งงาน (Ngan Taeng Ngan)',
    ritualPhases: ['khan-maak-procession', 'gate-crashing', 'water-pouring', 'wrist-tying', 'reception'],
    colorPalette: {
      primary: '#FFD700', accent: '#FF69B4',
      forbidden: ['#000000'],
      significance: { gold: 'prosperity', pink: 'love', white: 'Buddhism & purity' },
    },
    symbols: [
      { name: 'sai-sin', description: 'Sacred white thread', promptModifier: 'white sacred sai sin thread connecting couple during ceremony' },
      { name: 'khan-maak', description: 'Dowry procession containers', promptModifier: 'golden khan maak tiered pedestals with offerings' },
    ],
    music: {
      genres: ['thai-classical', 'luk-thung', 'thai-pop'],
      instruments: ['ranat-ek', 'khim', 'pi-nai'],
      mood: ['graceful', 'joyful', 'elegant'],
      samplePrompt: 'Thai wedding music with ranat and pi nai, graceful and auspicious ceremony',
    },
    attire: {
      primary: 'Thai silk chut thai with gold accessories',
      secondary: 'Suea phraratchathan (Thai formal wear)',
      guests: 'Thai silk formal wear',
      accessories: ['dok mai chan flower', 'mongkol crown', 'gold belt'],
    },
    setting: {
      venue: 'Temple or luxury hotel with Thai garden',
      decorations: ['orchids', 'jasmine garlands', 'gold silk', 'lotus flowers'],
      lighting: 'Warm golden temple lighting',
      environmentPrompt: 'Thai Buddhist wedding ceremony with temple architecture, orchid garlands, golden silk drapes, and lotus arrangements',
    },
    narrative: {
      storytellingStyle: 'Graceful and Buddhist-influenced',
      emotionalArc: ['procession-excitement', 'sacred-blessing', 'water-pouring-love', 'celebration'],
      coreValues: ['respect-for-elders', 'Buddhism', 'generosity', 'harmony'],
    },
    sensitivityNotes: ['Buddhist monks blessing is sacred', 'Respect for Thai royal imagery'],
    location: {
      cityPromptModifiers: {
        'Bangkok': 'Grand Palace, Chao Phraya River, ornate temple spires',
        'Chiang Mai': 'Mountain temples, lantern festivals, teak architecture',
        'Phuket': 'Andaman Sea, tropical beach resort, karst islands',
      },
      defaultVenues: ['Buddhist temple', 'luxury hotel', 'tropical garden'],
      landscape: 'Thai temple architecture with tropical gardens',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // OCEANIA — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'OCEANIA_NZ',
    localName: 'Wedding / Hui Aranga',
    ritualPhases: ['powhiri-welcome', 'karanga-call', 'ceremony', 'hongi-greeting', 'hakari-feast'],
    colorPalette: {
      primary: '#FFFFFF', accent: '#228B22',
      forbidden: [],
      significance: { green: 'land & life', white: 'purity', black: 'strength & tradition' },
    },
    symbols: [
      { name: 'fern', description: 'Silver fern (koru)', promptModifier: 'unfurling silver fern koru spiral, symbol of new life and growth' },
      { name: 'greenstone', description: 'Pounamu', promptModifier: 'carved pounamu greenstone pendant, taonga treasure' },
    ],
    music: {
      genres: ['maori-traditional', 'polynesian', 'contemporary-nz'],
      instruments: ['pukaea', 'koauau', 'guitar'],
      mood: ['powerful', 'spiritual', 'warm'],
      samplePrompt: 'New Zealand wedding music with Maori chant and contemporary guitar, powerful and spiritual',
    },
    attire: {
      primary: 'White gown with Maori korowai cloak',
      secondary: 'Formal suit with pounamu pendant',
      guests: 'Smart casual or formal with Polynesian elements',
      accessories: ['korowai cloak', 'pounamu pendant', 'piupiu skirt'],
    },
    setting: {
      venue: 'Marae or scenic outdoor venue',
      decorations: ['fern fronds', 'native flora', 'carved panels'],
      lighting: 'Natural outdoor lighting',
      environmentPrompt: 'New Zealand wedding at marae with carved wooden panels, native ferns, mountain backdrop, and traditional Maori elements',
    },
    narrative: {
      storytellingStyle: 'Spiritual and connected to land',
      emotionalArc: ['welcome-powhiri', 'spiritual-ceremony', 'hongi-connection', 'feast-celebration'],
      coreValues: ['manaakitanga-hospitality', 'whanau-family', 'kaitiakitanga-guardianship'],
    },
    sensitivityNotes: ['Respect tikanga Maori protocols', 'Haka is sacred, not entertainment'],
    location: {
      cityPromptModifiers: {
        'Auckland': 'Sky Tower, Waitemata Harbour, volcanic cones',
        'Queenstown': 'Remarkables mountain range, Lake Wakatipu, adventure capital',
        'Wellington': 'Harbour city, Te Papa museum, cable car hillside',
      },
      defaultVenues: ['marae meeting house', 'vineyard', 'mountain lodge'],
      landscape: 'Dramatic New Zealand mountains, lakes, and native bush',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CENTRAL ASIA — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'CENTRAL_ASIA',
    localName: 'Toy / Wedding',
    ritualPhases: ['kuda-soruv', 'nikah', 'kelin-salom', 'wedding-feast', 'kelin-tushirish'],
    colorPalette: {
      primary: '#DC143C', accent: '#FFD700',
      forbidden: [],
      significance: { red: 'joy & life', gold: 'wealth', white: 'purity' },
    },
    symbols: [
      { name: 'yurt', description: 'Traditional yurt', promptModifier: 'ornate white felt yurt with colorful embroidered entrance' },
      { name: 'suzani', description: 'Embroidered textile', promptModifier: 'richly embroidered suzani textile with pomegranate and floral patterns' },
    ],
    music: {
      genres: ['central-asian-folk', 'maqam'],
      instruments: ['dombra', 'rubab', 'doira', 'chang'],
      mood: ['festive', 'energetic', 'traditional'],
      samplePrompt: 'Central Asian wedding music with dombra and doira drums, festive nomadic celebration',
    },
    attire: {
      primary: 'Atlas silk dress with gold embroidery and headdress',
      secondary: 'Chapan robe with tubeteika cap',
      guests: 'Traditional silk atlas or modern formal',
      accessories: ['gold headdress', 'atlas silk', 'tubeteika cap'],
    },
    setting: {
      venue: 'Yurt or banquet hall',
      decorations: ['suzani textiles', 'silk drapes', 'pomegranate motifs'],
      lighting: 'Warm interior lighting with silk lanterns',
      environmentPrompt: 'Central Asian wedding feast in decorated yurt with suzani textiles, silk drapes, and golden lighting',
    },
    narrative: {
      storytellingStyle: 'Nomadic grandeur and hospitality',
      emotionalArc: ['family-negotiation', 'nikah-blessing', 'bride-welcome', 'grand-feast'],
      coreValues: ['hospitality', 'family-honor', 'generosity', 'respect-for-elders'],
      greetingPhrase: 'Toyingiz muborak!',
    },
    sensitivityNotes: ['Respect Islamic customs combined with nomadic traditions'],
    location: {
      cityPromptModifiers: {
        'Tashkent': 'Registan-inspired tilework, Chorsu bazaar, modern Uzbek capital',
        'Samarkand': 'Registan Square, turquoise domes, Silk Road grandeur',
        'Almaty': 'Tien Shan mountains, green apple orchards, modern Kazakhstan',
        'Baku': 'Flame Towers, Old City, Caspian Sea waterfront',
      },
      defaultVenues: ['decorated yurt', 'banquet hall', 'palace courtyard'],
      landscape: 'Silk Road architecture with turquoise domes and mountain backdrop',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TURKEY — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'TURKEY',
    localName: 'Düğün',
    ritualPhases: ['kina-gecesi', 'nikah', 'wedding-ceremony', 'dugun-reception'],
    colorPalette: {
      primary: '#CC0000', accent: '#FFD700',
      forbidden: [],
      significance: { red: 'life & passion', gold: 'prosperity', white: 'purity' },
    },
    symbols: [
      { name: 'henna', description: 'Kina henna night', promptModifier: 'ornate henna patterns on brides hands with gold coins pressed in palm' },
      { name: 'gold-coins', description: 'Gold coin gifts', promptModifier: 'guests pinning gold coins and bills to bride and groom sash' },
    ],
    music: {
      genres: ['turkish-folk', 'turkish-pop', 'arabesque'],
      instruments: ['davul', 'zurna', 'baglama', 'kanun'],
      mood: ['energetic', 'emotional', 'festive'],
      samplePrompt: 'Turkish wedding music with davul and zurna, energetic halay dance celebration',
    },
    attire: {
      primary: 'Red henna dress for kina gecesi, white wedding gown for ceremony',
      secondary: 'Dark formal suit',
      guests: 'Elegant formal wear',
      accessories: ['red veil for kina', 'gold belt', 'gold jewelry'],
    },
    setting: {
      venue: 'Hotel ballroom or outdoor garden',
      decorations: ['gold accents', 'red roses', 'Turkish lanterns'],
      lighting: 'Dramatic spotlight and warm ambient',
      environmentPrompt: 'Turkish wedding celebration with gold and red decorations, dramatic lighting, and energetic dance floor',
    },
    narrative: {
      storytellingStyle: 'Emotional and grand',
      emotionalArc: ['emotional-kina-gecesi', 'solemn-nikah', 'joyful-ceremony', 'energetic-reception'],
      coreValues: ['family', 'tradition', 'hospitality', 'generosity'],
      greetingPhrase: 'Düğünümüze davetlisiniz!',
      blessingPhrase: 'Allah mesut etsin',
    },
    sensitivityNotes: ['Kina gecesi has deeply emotional significance', 'Respect secular vs religious preferences'],
    location: {
      cityPromptModifiers: {
        'Istanbul': 'Bosphorus Bridge, Blue Mosque, Hagia Sophia, Ottoman grandeur',
        'Cappadocia': 'Hot air balloons, fairy chimneys, cave hotel romance',
        'Antalya': 'Turquoise Mediterranean coast, ancient ruins, luxury resorts',
      },
      defaultVenues: ['Bosphorus waterfront venue', 'luxury hotel ballroom', 'Ottoman-era palace'],
      landscape: 'Bosphorus waterfront with Ottoman architecture',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BANGLADESH — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'BANGLADESH',
    localName: 'বিবাহ (Bibaho)',
    ritualPhases: ['gaye-holud', 'mehndi', 'akd-nikah', 'bou-bhaat-walima'],
    colorPalette: {
      primary: '#CC0000', accent: '#FFD700',
      forbidden: [],
      significance: { red: 'joy', gold: 'prosperity', yellow: 'turmeric blessing' },
    },
    symbols: [
      { name: 'paan', description: 'Betel leaf', promptModifier: 'decorative betel leaf and nut arrangement on brass plate' },
      { name: 'turmeric', description: 'Gaye holud turmeric', promptModifier: 'golden turmeric paste on decorated brass plate with flowers' },
    ],
    music: {
      genres: ['bengali-folk', 'baul', 'rabindra-sangeet'],
      instruments: ['dotara', 'tabla', 'harmonium', 'ektara'],
      mood: ['romantic', 'festive', 'soulful'],
      samplePrompt: 'Bengali wedding music with dotara and tabla, soulful Rabindra Sangeet melodies',
    },
    attire: {
      primary: 'Red Benarasi saree with gold zari work',
      secondary: 'Cream or gold sherwani with red dupatta',
      guests: 'Colorful sarees and sherwanis',
      accessories: ['gold jewelry sets', 'tikli', 'alta (red dye on feet)'],
    },
    setting: {
      venue: 'Community center or luxury hotel',
      decorations: ['marigold and jasmine garlands', 'banana leaves', 'tuberose strings'],
      lighting: 'Warm fairy light and chandelier combination',
      environmentPrompt: 'Bengali wedding with marigold garlands, jasmine strings, warm lighting, and vibrant red and gold decorations',
    },
    narrative: {
      storytellingStyle: 'Romantic and poetic with Bengali literary influence',
      emotionalArc: ['turmeric-joy', 'nikah-solemnity', 'reception-feast', 'emotional-farewell'],
      coreValues: ['family', 'poetry', 'hospitality', 'cultural-pride'],
      greetingPhrase: 'শুভ বিবাহ!',
      blessingPhrase: 'তোমাদের জীবন সুখময় হোক',
    },
    sensitivityNotes: ['Respect Hindu/Muslim wedding differences in Bangladesh'],
    location: {
      cityPromptModifiers: {
        'Dhaka': 'Lalbagh Fort, Ahsan Manzil pink palace, vibrant city energy',
        'Chittagong': 'Hill tracts, coastal beauty, diverse tribal cultures',
        'Sylhet': 'Tea gardens, haor wetlands, green rolling hills',
      },
      defaultVenues: ['community center', 'luxury hotel ballroom', 'banquet hall'],
      landscape: 'Lush green Bengali delta landscape',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // EURASIA — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'EURASIA',
    localName: 'Свадьба (Svadba)',
    ritualPhases: ['vykup-nevesty', 'church-ceremony', 'bread-salt', 'reception-banquet', 'toasts'],
    colorPalette: {
      primary: '#FFFFFF', accent: '#FFD700',
      forbidden: [],
      significance: { white: 'purity', gold: 'prosperity', red: 'beauty' },
    },
    symbols: [
      { name: 'bread-salt', description: 'Karavai bread', promptModifier: 'ornate round karavai wedding bread with salt, decorated with dough braids' },
      { name: 'icons', description: 'Orthodox icons', promptModifier: 'golden Orthodox icon of Christ and Virgin Mary with oil lamp' },
    ],
    music: {
      genres: ['slavic-folk', 'russian-classical', 'pop'],
      instruments: ['bayan', 'balalaika', 'domra'],
      mood: ['emotional', 'festive', 'dramatic'],
      samplePrompt: 'Eastern European wedding music with bayan accordion and folk songs, festive and emotional',
    },
    attire: {
      primary: 'White wedding gown, optionally with Orthodox crown',
      secondary: 'Dark formal suit',
      guests: 'Elegant formal wear',
      accessories: ['Orthodox crowns (venets)', 'veil', 'karavai bread'],
    },
    setting: {
      venue: 'Orthodox cathedral and banquet restaurant',
      decorations: ['white roses', 'golden icons', 'crystal chandeliers'],
      lighting: 'Cathedral candlelight and golden ambient',
      environmentPrompt: 'Orthodox wedding ceremony with golden iconostasis, candlelight, white roses, and solemn cathedral atmosphere',
    },
    narrative: {
      storytellingStyle: 'Dramatic and deeply emotional',
      emotionalArc: ['playful-vykup', 'sacred-crowning', 'bread-salt-welcome', 'toasts-celebration'],
      coreValues: ['family', 'faith', 'hospitality', 'endurance'],
      greetingPhrase: 'Горько! (Gorko!)',
      blessingPhrase: 'Совет да любовь!',
    },
    sensitivityNotes: ['Respect Orthodox vs secular preferences', 'Vykup nevesty is playful, not transactional'],
    location: {
      cityPromptModifiers: {
        'Moscow': 'Kremlin, Red Square, golden onion domes, Bolshoi',
        'St. Petersburg': 'Winter Palace, Neva River, white nights, Hermitage',
        'Tbilisi': 'Old Town, sulfur baths, Georgian Orthodox churches',
      },
      defaultVenues: ['Orthodox cathedral', 'banquet restaurant', 'palace hall'],
      landscape: 'Eastern European cityscape with golden-domed churches',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CARIBBEAN — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'CARIBBEAN',
    localName: 'Beach Wedding',
    ritualPhases: ['beach-processional', 'ceremony', 'sand-ceremony', 'reception-party'],
    colorPalette: {
      primary: '#40E0D0', accent: '#FFD700',
      forbidden: [],
      significance: { turquoise: 'Caribbean sea', gold: 'sunshine', white: 'sand' },
    },
    symbols: [
      { name: 'conch-shell', description: 'Conch shell', promptModifier: 'large pink conch shell on white sand beach' },
      { name: 'tropical-flowers', description: 'Tropical blooms', promptModifier: 'vibrant hibiscus and frangipani tropical flower arrangements' },
    ],
    music: {
      genres: ['reggae', 'soca', 'calypso', 'steel-pan'],
      instruments: ['steel-pan', 'guitar', 'drums', 'maracas'],
      mood: ['laid-back', 'joyful', 'tropical'],
      samplePrompt: 'Caribbean beach wedding music with steel pan drums and reggae guitar, tropical and joyful',
    },
    attire: {
      primary: 'Flowing beach wedding dress',
      secondary: 'Linen suit in light colors',
      guests: 'Resort casual, tropical prints',
      accessories: ['flower crown', 'shell jewelry', 'barefoot sandals'],
    },
    setting: {
      venue: 'White sand beach at sunset',
      decorations: ['bamboo arch', 'tropical flowers', 'tiki torches', 'seashells'],
      lighting: 'Golden hour sunset and tiki torch firelight',
      environmentPrompt: 'Caribbean beach wedding at sunset with bamboo arch, tropical flowers, turquoise water, and golden sky',
    },
    narrative: {
      storytellingStyle: 'Relaxed, joyful, and sun-kissed',
      emotionalArc: ['tropical-arrival', 'barefoot-ceremony', 'sunset-kiss', 'beach-party'],
      coreValues: ['love', 'freedom', 'joy', 'island-spirit'],
    },
    sensitivityNotes: ['Respect island-specific customs and cultures'],
    location: {
      cityPromptModifiers: {
        'Montego Bay': 'Jamaican coast, Blue Mountains backdrop, reggae vibes',
        'Punta Cana': 'Dominican palm-lined beach, crystal clear Caribbean water',
        'Nassau': 'Bahamian pink sand, colonial architecture, island charm',
      },
      defaultVenues: ['white sand beach', 'island resort', 'beachfront villa'],
      landscape: 'Caribbean white sand beach with turquoise water',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SOUTH ASIA — Weddings
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'wedding-traditional', regionCode: 'SOUTH_ASIA',
    localName: 'Wedding',
    ritualPhases: ['welcome', 'religious-ceremony', 'feast', 'celebration'],
    colorPalette: {
      primary: '#CC0000', accent: '#FFD700',
      forbidden: [],
      significance: { red: 'auspiciousness', gold: 'prosperity' },
    },
    symbols: [
      { name: 'mandala', description: 'Sacred mandala design', promptModifier: 'intricate colorful mandala pattern with lotus center' },
    ],
    music: {
      genres: ['south-asian-folk', 'classical'],
      instruments: ['sitar', 'tabla', 'flute'],
      mood: ['sacred', 'festive'],
      samplePrompt: 'South Asian wedding music blending classical instruments with festive rhythm',
    },
    attire: {
      primary: 'Red or maroon saree/lehenga',
      secondary: 'Sherwani or formal suit',
      guests: 'Colorful traditional attire',
      accessories: ['gold jewelry', 'flower garlands'],
    },
    setting: {
      venue: 'Temple or decorated hall',
      decorations: ['flower garlands', 'oil lamps', 'silk drapes'],
      lighting: 'Warm golden oil lamp lighting',
      environmentPrompt: 'South Asian wedding venue with flower garlands, oil lamps, golden drapes, and sacred atmosphere',
    },
    narrative: {
      storytellingStyle: 'Sacred and family-centered',
      emotionalArc: ['welcome', 'sacred-vows', 'family-blessing', 'feast'],
      coreValues: ['family', 'tradition', 'spirituality'],
    },
    sensitivityNotes: ['Respect diverse South Asian religious traditions'],
    location: {
      cityPromptModifiers: {
        'Kathmandu': 'Himalayan temples, Durbar Square, Swayambhunath stupa',
        'Colombo': 'Indian Ocean coast, Buddhist temples, colonial architecture',
      },
      defaultVenues: ['temple', 'hotel ballroom', 'garden'],
      landscape: 'Himalayan foothills or tropical island coast',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FESTIVALS — Region-specific overrides
  // ══════════════════════════════════════════════════════════════════════════

  {
    ceremonyId: 'diwali', regionCode: 'INDIA',
    localName: 'दीपावली (Deepavali)',
    ritualPhases: ['dhanteras', 'choti-diwali', 'lakshmi-puja', 'govardhan-puja', 'bhai-dooj'],
    colorPalette: {
      primary: '#FFD700', accent: '#FF6347',
      forbidden: [],
      significance: { gold: 'Lakshmi/prosperity', orange: 'sacred fire', purple: 'spirituality' },
    },
    symbols: [
      { name: 'diya', description: 'Oil lamp', promptModifier: 'rows of glowing clay diyas with orange flames against dark background' },
      { name: 'rangoli', description: 'Floor art', promptModifier: 'colorful intricate rangoli pattern with flower petals and colored powder' },
      { name: 'fireworks', description: 'Festival fireworks', promptModifier: 'sparkling fireworks bursting over illuminated temple skyline' },
    ],
    music: {
      genres: ['devotional', 'bollywood-festive'],
      instruments: ['shehnai', 'tabla', 'sitar', 'bells'],
      mood: ['festive', 'spiritual', 'joyful'],
      samplePrompt: 'Diwali festive music with shehnai and bells, spiritual and joyful celebration of lights',
    },
    attire: {
      primary: 'Festive saree or lehenga in jewel tones',
      secondary: 'Kurta-pajama or sherwani in gold/maroon',
      guests: 'Festive ethnic wear',
      accessories: ['gold jewelry', 'bindis', 'bangles'],
    },
    setting: {
      venue: 'Decorated home or temple',
      decorations: ['diyas', 'rangoli', 'marigold torans', 'fairy lights'],
      lighting: 'Warm diya and fairy light glow against night sky',
      environmentPrompt: 'Diwali celebration with glowing diyas, colorful rangoli, marigold garlands, and sparkling lights against night sky',
    },
    narrative: {
      storytellingStyle: 'Spiritual and family-centered joy',
      emotionalArc: ['preparation', 'puja-devotion', 'lights-celebration', 'family-togetherness'],
      coreValues: ['light-over-darkness', 'prosperity', 'family', 'spirituality'],
      greetingPhrase: 'शुभ दीपावली!',
      blessingPhrase: 'May Goddess Lakshmi bless your home with light and prosperity',
    },
    sensitivityNotes: ['Respect religious significance — not just a party', 'Be mindful of firecracker pollution concerns'],
  },

  {
    ceremonyId: 'eid-al-fitr', regionCode: 'MENA',
    localName: 'عيد الفطر',
    ritualPhases: ['eid-prayer', 'family-visits', 'feast', 'gift-giving'],
    colorPalette: {
      primary: '#006400', accent: '#FFD700',
      forbidden: [],
      significance: { green: 'Islam & paradise', gold: 'blessings', white: 'purity' },
    },
    symbols: [
      { name: 'crescent', description: 'Crescent moon', promptModifier: 'golden crescent moon and star against deep blue sky' },
      { name: 'mosque', description: 'Mosque', promptModifier: 'beautiful illuminated mosque with minarets at twilight' },
    ],
    music: {
      genres: ['nasheed', 'arabic-instrumental'],
      instruments: ['oud', 'nay', 'frame-drum'],
      mood: ['serene', 'grateful', 'joyful'],
      samplePrompt: 'Eid celebration music with oud and nay, serene and joyful Islamic celebration',
    },
    attire: {
      primary: 'New elegant abaya or dress',
      secondary: 'New white thobe or formal wear',
      guests: 'Best formal wear',
      accessories: ['oud perfume', 'prayer beads'],
    },
    setting: {
      venue: 'Mosque and family home',
      decorations: ['crescent moon decor', 'lanterns', 'date palm arrangements'],
      lighting: 'Warm lantern glow',
      environmentPrompt: 'Eid al-Fitr celebration with illuminated mosque, crescent moon decorations, warm lantern lighting',
    },
    narrative: {
      storytellingStyle: 'Grateful, communal, and spiritually grounded',
      emotionalArc: ['morning-prayer', 'family-reunion', 'feast-sharing', 'gratitude'],
      coreValues: ['gratitude', 'generosity', 'community', 'faith'],
      greetingPhrase: 'عيد مبارك!',
      blessingPhrase: 'تقبل الله منا ومنكم',
    },
    isRTL: true,
    sensitivityNotes: ['Respect fasting sacrifice', 'Zakat (charity) is integral to Eid'],
  },
];

// ─── FALLBACK CHAIN RESOLUTION ───────────────────────────────────────────────

/** Map subregion → parent region */
const SUBREGION_TO_PARENT: Record<string, string> = {
  NAM_US: 'NAM', NAM_CA: 'NAM',
  EU_WEST: 'EU', EU_DACH: 'EU', EU_FRANCE: 'EU', EU_BENELUX: 'EU', EU_IBERIA: 'EU', EU_ITALY: 'EU', EU_NORDIC: 'EU', EU_EAST: 'EU',
  EE_UKRAINE: 'EURASIA', EE_BALKANS: 'EURASIA', EE_CAUCASUS: 'EURASIA',
  TURKEY_ISTANBUL: 'TURKEY', TURKEY_ANATOLIA: 'TURKEY',
  MENA_GULF: 'MENA', MENA_LEVANT: 'MENA', MENA_EGYPT: 'MENA', MENA_MAGHREB: 'MENA', MENA_IRAQ: 'MENA', MENA_YEMEN: 'MENA', MENA_ISRAEL: 'MENA',
  AFRICA_WEST: 'AFRICA', AFRICA_EAST: 'AFRICA', AFRICA_SOUTH: 'AFRICA', AFRICA_NORTH: 'AFRICA', AFRICA_FRANCO: 'AFRICA',
  INDIA_NORTH: 'INDIA', INDIA_SOUTH: 'INDIA', INDIA_EAST: 'INDIA', INDIA_WEST: 'INDIA', INDIA_TN: 'INDIA',
  PK_PUNJAB: 'PAKISTAN', PK_SINDH: 'PAKISTAN', PK_KPK: 'PAKISTAN', PK_URDU: 'PAKISTAN',
  BD_DHAKA: 'BANGLADESH', BD_CHITTAGONG: 'BANGLADESH',
  SA_NEPAL: 'SOUTH_ASIA', SA_SRILANKA: 'SOUTH_ASIA', SA_BHUTAN: 'SOUTH_ASIA', SA_MALDIVES: 'SOUTH_ASIA',
  SEA_MALAY: 'SEA', SEA_THAI: 'SEA', SEA_VIET: 'SEA', SEA_PHIL: 'SEA', SEA_PAN: 'SEA',
  CJK_CN: 'CJK', CJK_JP: 'CJK', CJK_KR: 'CJK', CJK_TW: 'CJK',
  LATAM_MX: 'LATAM', LATAM_BR: 'LATAM', LATAM_CONE: 'LATAM', LATAM_ANDES: 'LATAM', LATAM_CARIB: 'LATAM',
  CARIBBEAN_EN: 'CARIBBEAN', CARIBBEAN_FR: 'CARIBBEAN',
  OCEANIA_AU: 'OCEANIA', OCEANIA_NZ: 'OCEANIA',
  CA_KZ: 'CENTRAL_ASIA', CA_UZ: 'CENTRAL_ASIA', CA_AZ: 'CENTRAL_ASIA',
};

/** Get parent region for a subregion code */
export function getParentRegion(regionCode: string): string | undefined {
  return SUBREGION_TO_PARENT[regionCode];
}

/** Default overrides by category (used as final fallback) */
const CATEGORY_DEFAULTS: Record<string, Omit<CeremonyCulturalOverride, 'ceremonyId' | 'regionCode'>> = {
  wedding: GENERIC_WEDDING_DEFAULT,
  pre_post_wedding: GENERIC_WEDDING_DEFAULT,
  religious: GENERIC_LIFE_EVENT_DEFAULT,
  life_milestone: GENERIC_LIFE_EVENT_DEFAULT,
  festival: GENERIC_FESTIVAL_DEFAULT,
  corporate_event: GENERIC_LIFE_EVENT_DEFAULT,
  memorial: GENERIC_LIFE_EVENT_DEFAULT,
  sports_event: GENERIC_LIFE_EVENT_DEFAULT,
  inauguration: GENERIC_LIFE_EVENT_DEFAULT,
  travel: GENERIC_LIFE_EVENT_DEFAULT,
  entertainment: GENERIC_LIFE_EVENT_DEFAULT,
  community: GENERIC_LIFE_EVENT_DEFAULT,
  custom: GENERIC_LIFE_EVENT_DEFAULT,
};

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Get cultural override with fallback chain: subregion → parent region → generic
 *
 * @example getCulturalOverrideWithFallback('wedding-traditional', 'INDIA_NORTH', 'wedding')
 */
export function getCulturalOverrideWithFallback(
  ceremonyId: string,
  regionCode: string,
  category: CeremonyCategory,
): CeremonyCulturalOverride {
  // 1. Exact match: ceremonyId + regionCode
  const exact = CEREMONY_CULTURAL_OVERRIDES.find(
    o => o.ceremonyId === ceremonyId && o.regionCode === regionCode
  );
  if (exact) return exact;

  // 2. Parent region match
  const parent = getParentRegion(regionCode);
  if (parent) {
    const parentMatch = CEREMONY_CULTURAL_OVERRIDES.find(
      o => o.ceremonyId === ceremonyId && o.regionCode === parent
    );
    if (parentMatch) return { ...parentMatch, regionCode }; // Return with original regionCode
  }

  // 3. Generic ceremony defaults for any region (same ceremony, any region)
  const anyRegion = CEREMONY_CULTURAL_OVERRIDES.find(o => o.ceremonyId === ceremonyId);
  if (anyRegion) return { ...anyRegion, regionCode };

  // 4. Category defaults
  const catDefault = CATEGORY_DEFAULTS[category] ?? GENERIC_LIFE_EVENT_DEFAULT;
  return {
    ...catDefault,
    ceremonyId,
    regionCode,
  };
}

/** Get all overrides for a specific ceremony type */
export function getOverridesForCeremony(ceremonyId: string): CeremonyCulturalOverride[] {
  return CEREMONY_CULTURAL_OVERRIDES.filter(o => o.ceremonyId === ceremonyId);
}

/** Get all overrides for a specific region */
export function getOverridesForRegion(regionCode: string): CeremonyCulturalOverride[] {
  return CEREMONY_CULTURAL_OVERRIDES.filter(o => o.regionCode === regionCode);
}

/** Get city prompt modifier for a given region and city */
export function getCityPromptModifier(regionCode: string, cityName: string): string | undefined {
  const overrides = CEREMONY_CULTURAL_OVERRIDES.filter(o => o.regionCode === regionCode);
  for (const o of overrides) {
    const modifier = o.location?.cityPromptModifiers[cityName];
    if (modifier) return modifier;
  }
  return undefined;
}
