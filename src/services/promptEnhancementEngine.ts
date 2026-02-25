/**
 * PROMPT ENHANCEMENT ENGINE
 *
 * Takes the user's raw prompt/script and enhances it based on full production context:
 * - Region & subregion (cultural nuance, local references, color palettes)
 * - Language (tone, formality level, idiomatic expressions)
 * - Content format (video, podcast, presentation, social, avatar)
 * - Visual style (pixar, anime, cinematic, minimalist, etc.)
 * - Intent (marketing, education, entertainment, healthcare, etc.)
 * - Combination modes (avatar + video, character-based + story, etc.)
 *
 * Returns:
 * - Enhanced prompt with professional creative direction
 * - Multiple enhancement suggestions the user can pick from
 * - Preview of what the enhanced prompt will generate
 *
 * Works for ALL 16 regions, 62 subregions, 85+ languages.
 * Reusable across Cast, Deck, Spark, and Mind.
 */

import { supabase } from '@/integrations/supabase/client';
import { REGIONAL_SUB_REGIONS, type SubRegionOption } from '@/config/regionalSubRegions';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PromptContext {
  /** Raw user input */
  rawPrompt: string;
  /** Region code (e.g., 'NAM_US', 'CJK', 'MENA_AR_SA') */
  region?: string;
  /** Subregion code (e.g., 'JP', 'IN_TN', 'BR') */
  subRegion?: string;
  /** Output language code (e.g., 'en', 'zh', 'ar', 'hi') */
  language?: string;
  /** Content format name (e.g., 'video', 'podcast', 'presentation', 'social_short') */
  format?: string;
  /** Visual style (e.g., 'pixar_3d', 'anime', 'cinematic', 'photorealistic') */
  visualStyle?: string;
  /** Content intent/category (e.g., 'marketing', 'education', 'healthcare') */
  intent?: string;
  /** Target audience description */
  audience?: string;
  /** Brand tone (e.g., 'professional', 'playful', 'authoritative') */
  brandTone?: string;
  /** Enhancement mode — what kind of creative upgrade to apply */
  mode?: EnhancementMode;
}

export type EnhancementMode =
  | 'creative_writing'    // Narrative, storytelling, emotional arcs
  | 'image_generation'    // Visual prompts for AI image generators
  | 'video_generation'    // Scene descriptions, camera direction, pacing
  | 'brainstorming'       // Ideation, concept expansion, alternatives
  | 'character_roleplay'  // Avatar, character-driven, dialogue
  | 'avatar_presenter'    // Professional avatar presentation scripts
  | 'combination'         // Multi-modal: avatar + video + story
  | 'auto';               // Auto-detect best mode from context

export interface EnhancedPrompt {
  /** The fully enhanced prompt, ready for production */
  enhanced: string;
  /** What mode was used for enhancement */
  mode: EnhancementMode;
  /** Brief explanation of what was improved */
  improvements: string[];
  /** Estimated quality boost (0-100) */
  qualityScore: number;
}

export interface PromptSuggestion {
  id: string;
  label: string;
  description: string;
  enhancedPrompt: string;
  mode: EnhancementMode;
  qualityScore: number;
}

export interface PromptEnhancementResult {
  /** Primary enhanced prompt (best recommendation) */
  primary: EnhancedPrompt;
  /** Alternative suggestions (2-4 variants) */
  suggestions: PromptSuggestion[];
  /** Preview description of expected output */
  preview: string;
  /** Regional/cultural notes applied */
  regionalNotes: string[];
  /** Detected language formality level */
  formalityLevel: 'casual' | 'neutral' | 'formal' | 'ceremonial';
}

// ── Regional Prompt Enrichment Data ──────────────────────────────────────────
// All 16 parent regions + key subregion overrides.
// Aligned 1:1 with regionHierarchy (16 parents, 62 subregions).

interface RegionalProfile {
  narrativeStyle: string;
  colorPalette: string;
  culturalReferences: string;
  musicMood: string;
  formalityDefault: 'casual' | 'neutral' | 'formal' | 'ceremonial';
  toneGuidance: string;
}

const REGIONAL_CREATIVE_PROFILES: Record<string, RegionalProfile> = {
  // ── 1. NORTH AMERICA (NAM) ──────────────────────────────────────────────────
  NAM: {
    narrativeStyle: 'Direct, results-oriented storytelling with clear value proposition',
    colorPalette: 'Bold primary colors, high contrast, clean whites',
    culturalReferences: 'Innovation, individual achievement, tech-forward',
    musicMood: 'Upbeat corporate, indie acoustic, electronic pop',
    formalityDefault: 'casual',
    toneGuidance: 'Conversational yet professional. Use action verbs. Keep it punchy.',
  },
  NAM_US: {
    narrativeStyle: 'Direct, results-oriented storytelling with clear value proposition',
    colorPalette: 'Bold primary colors, high contrast, clean whites',
    culturalReferences: 'Innovation, individual achievement, tech-forward, startup culture',
    musicMood: 'Upbeat corporate, indie acoustic, lo-fi hip-hop, electronic pop',
    formalityDefault: 'casual',
    toneGuidance: 'Conversational yet professional. Use action verbs. Keep it punchy. TED-talk energy.',
  },
  NAM_CA: {
    narrativeStyle: 'Inclusive, multicultural storytelling with progressive values',
    colorPalette: 'Nature-inspired tones, maple red, clean whites, forest green',
    culturalReferences: 'Inclusivity, multiculturalism, nature, bilingual (EN/FR)',
    musicMood: 'Indie folk, ambient electronic, multicultural fusion',
    formalityDefault: 'neutral',
    toneGuidance: 'Warm, inclusive, and professional. Bilingual sensitivity. Value diversity and sustainability.',
  },

  // ── 2. EUROPE (EU) ─────────────────────────────────────────────────────────
  EU: {
    narrativeStyle: 'Sophisticated, measured storytelling with cultural depth',
    colorPalette: 'Muted earth tones, heritage blues, elegant grays',
    culturalReferences: 'Craftsmanship, heritage, sustainability, community',
    musicMood: 'Classical ambient, refined electronic, orchestral',
    formalityDefault: 'neutral',
    toneGuidance: 'Balanced formality. Value substance over hype. Reference quality and tradition.',
  },
  EU_WEST: {
    narrativeStyle: 'Understated British storytelling, dry wit, premium quality focus',
    colorPalette: 'Heritage navy, racing green, cream, burgundy',
    culturalReferences: 'British craftsmanship, understated luxury, heritage brands',
    musicMood: 'Britpop undertones, orchestral, refined electronic',
    formalityDefault: 'neutral',
    toneGuidance: 'Understate rather than oversell. Dry humor welcome. Quality speaks for itself.',
  },
  EU_DACH: {
    narrativeStyle: 'Precise, engineering-focused, trust-through-expertise',
    colorPalette: 'Steel blue, precise white, forest green, dark graphite',
    culturalReferences: 'Engineering excellence, Ordnung, precision, Mittelstand craftsmanship',
    musicMood: 'Minimal techno, classical precision, ambient industrial',
    formalityDefault: 'formal',
    toneGuidance: 'Data-driven. Precise language. Avoid hyperbole. Build trust through expertise.',
  },
  EU_FRANCE: {
    narrativeStyle: 'Elegant intellectual storytelling with philosophical depth',
    colorPalette: 'Parisian gray, elegant cream, lavender, muted gold',
    culturalReferences: 'Art de vivre, haute couture, gastronomy, philosophical tradition',
    musicMood: 'French chanson, elegant jazz, electronic (French touch)',
    formalityDefault: 'formal',
    toneGuidance: 'Elegant and refined. Intellectual depth valued. Celebrate art and savoir-faire.',
  },
  EU_BENELUX: {
    narrativeStyle: 'Direct, pragmatic, value-focused with design sensibility',
    colorPalette: 'Orange accent, clean whites, modern blues, functional greens',
    culturalReferences: 'Design thinking, trade heritage, directness, cycling culture',
    musicMood: 'Electronic dance, progressive, ambient modern',
    formalityDefault: 'casual',
    toneGuidance: 'Direct and no-nonsense. Value clarity over flourish. Practical and design-forward.',
  },
  EU_IBERIA: {
    narrativeStyle: 'Passionate, warm, life-celebrating storytelling',
    colorPalette: 'Warm terracotta, Mediterranean blue, sunlit gold, olive green',
    culturalReferences: 'Family, gastronomy, football, fiestas, Mediterranean lifestyle',
    musicMood: 'Flamenco fusion, Latin pop, Mediterranean chill',
    formalityDefault: 'casual',
    toneGuidance: 'Warm and expressive. Celebrate passion and life. Community and family first.',
  },
  EU_ITALY: {
    narrativeStyle: 'Artisan-quality storytelling with aesthetic mastery',
    colorPalette: 'Renaissance gold, marble white, espresso brown, olive',
    culturalReferences: 'La dolce vita, artisan quality, fashion, gastronomy, design',
    musicMood: 'Operatic ambient, modern Italian pop, cinematic orchestral',
    formalityDefault: 'neutral',
    toneGuidance: 'Beauty matters. Celebrate craftsmanship. Sensory-rich language. Bella figura.',
  },
  EU_NORDIC: {
    narrativeStyle: 'Minimalist, trust-based, sustainability-driven',
    colorPalette: 'Scandinavian white, muted blues, natural wood, sage green',
    culturalReferences: 'Hygge, lagom, sustainability, flat hierarchy, design simplicity',
    musicMood: 'Nordic ambient, minimal electronic, folk acoustic',
    formalityDefault: 'casual',
    toneGuidance: 'Understated trust. Less is more. Sustainability as core value. Egalitarian tone.',
  },
  EU_EAST: {
    narrativeStyle: 'Transformation storytelling, bridging heritage and innovation',
    colorPalette: 'Deep reds, gold accents, forest green, slate gray',
    culturalReferences: 'Historical resilience, tech emergence, cultural pride, EU integration',
    musicMood: 'Eastern European folk fusion, modern electronic, cinematic',
    formalityDefault: 'neutral',
    toneGuidance: 'Balance tradition with progress. Value resilience and transformation. Cultural pride.',
  },

  // ── 3. EASTERN EUROPE & CAUCASUS (EURASIA) ─────────────────────────────────
  EURASIA: {
    narrativeStyle: 'Resilient, tech-forward storytelling bridging East and West',
    colorPalette: 'Deep slate, amber, sunflower gold, iron gray',
    culturalReferences: 'Tech resilience, cultural crossroads, innovation under adversity',
    musicMood: 'Eastern European electronic, folk-modern fusion, cinematic drama',
    formalityDefault: 'neutral',
    toneGuidance: 'Authentic and strong. Value resilience and innovation. Bridge cultures with respect.',
  },
  EE_UKRAINE: {
    narrativeStyle: 'Resilient tech storytelling with creative spirit',
    colorPalette: 'Sunflower gold, sky blue, wheat amber, digital teal',
    culturalReferences: 'Tech innovation, resilience, creative spirit, IT excellence',
    musicMood: 'Ukrainian folk-electronic fusion, cinematic, modern pop',
    formalityDefault: 'neutral',
    toneGuidance: 'Strong yet warm. Celebrate resilience and tech innovation. Forward-looking.',
  },
  EE_BALKANS: {
    narrativeStyle: 'Passionate bridge-culture storytelling with authentic voice',
    colorPalette: 'Deep reds, turquoise, copper, mountain green',
    culturalReferences: 'Cultural bridge, passionate authenticity, gastronomy, music festivals',
    musicMood: 'Balkan brass fusion, turbo-folk modern, world music',
    formalityDefault: 'neutral',
    toneGuidance: 'Passionate and authentic. Celebrate cultural richness. Bridge traditions and modernity.',
  },
  EE_CAUCASUS: {
    narrativeStyle: 'Ancient-meets-modern storytelling with hospitality warmth',
    colorPalette: 'Mountain grey, wine burgundy, ancient gold, forest deep green',
    culturalReferences: 'Ancient civilizations, hospitality, wine culture, mountain heritage',
    musicMood: 'Polyphonic choir, traditional instruments, ambient cinematic',
    formalityDefault: 'formal',
    toneGuidance: 'Warm hospitality with depth. Honor ancient traditions. Pride in heritage.',
  },

  // ── 4. TURKEY ───────────────────────────────────────────────────────────────
  TURKEY: {
    narrativeStyle: 'Cosmopolitan bridge between East and West, ambitious and heritage-rich',
    colorPalette: 'Ottoman red, turquoise, warm gold, ceramic blue',
    culturalReferences: 'East-West bridge, hospitality, Ottoman heritage, modern ambition',
    musicMood: 'Turkish pop, oud-electronic fusion, Anatolian rock',
    formalityDefault: 'neutral',
    toneGuidance: 'Ambitious yet respectful. Bridge heritage and modernity. Warm hospitality in tone.',
  },
  TURKEY_ISTANBUL: {
    narrativeStyle: 'Cosmopolitan, ambitious, trend-setting at the crossroads',
    colorPalette: 'Bosphorus blue, modern gold, metropolitan gray, sunset orange',
    culturalReferences: 'Global city, startup hub, fashion-forward, Ottoman cosmopolitan',
    musicMood: 'Istanbul electronic, Turkish pop, global fusion',
    formalityDefault: 'neutral',
    toneGuidance: 'Cosmopolitan and ambitious. Global mindset. Bridge continents in every sentence.',
  },
  TURKEY_ANATOLIA: {
    narrativeStyle: 'Heartland authenticity with warm, rooted storytelling',
    colorPalette: 'Earth reds, Cappadocian cream, wheat gold, highland green',
    culturalReferences: 'Anatolian heartland, agricultural pride, ancient Hittite heritage',
    musicMood: 'Anatolian folk, bağlama, traditional Turkish classical',
    formalityDefault: 'formal',
    toneGuidance: 'Rooted and authentic. Honor tradition. Warm, communal, family-centric.',
  },

  // ── 5. MENA (Middle East & North Africa) ────────────────────────────────────
  MENA: {
    narrativeStyle: 'Warm, relationship-focused with poetic elements and hospitality',
    colorPalette: 'Gold, emerald green, deep burgundy, desert sand',
    culturalReferences: 'Hospitality, family honor, generosity, spiritual depth',
    musicMood: 'Oud-based, qanun melodies, modern Arabic pop fusion',
    formalityDefault: 'formal',
    toneGuidance: 'Warm and respectful. Use flowery language where appropriate. Emphasize trust and relationships.',
  },
  MENA_GULF: {
    narrativeStyle: 'Aspirational luxury with visionary ambition',
    colorPalette: 'Royal gold, pearl white, desert sand, luxury emerald',
    culturalReferences: 'Vision 2030, luxury, futuristic ambition, pearl heritage, hospitality',
    musicMood: 'Arabic pop, khaleeji, oud-electronic fusion, cinematic',
    formalityDefault: 'formal',
    toneGuidance: 'Prestige and vision. Aspirational language. Future-forward with heritage respect.',
  },
  MENA_LEVANT: {
    narrativeStyle: 'Cosmopolitan creative storytelling with artistic depth',
    colorPalette: 'Cedar green, Mediterranean blue, warm stone, rose',
    culturalReferences: 'Creative arts, resilience, cosmopolitan culture, gastronomy',
    musicMood: 'Levantine pop, jazz-Arabic fusion, indie',
    formalityDefault: 'neutral',
    toneGuidance: 'Artistic and cosmopolitan. Creative expression valued. Blend tradition with modernity.',
  },
  MENA_EGYPT: {
    narrativeStyle: 'Witty, relatable storytelling with warmth and humor',
    colorPalette: 'Nile blue, desert gold, pharaonic amber, lush green',
    culturalReferences: 'Egyptian humor, Umm el-Dunya pride, cinema heritage, street culture',
    musicMood: 'Shaabi, Egyptian pop, mahraganat, cinematic orchestral',
    formalityDefault: 'neutral',
    toneGuidance: 'Warm and witty. Humor is king. Relatable everyday examples. Egyptian pride.',
  },
  MENA_MAGHREB: {
    narrativeStyle: 'Vibrant multicultural storytelling with French-Arabic fusion',
    colorPalette: 'Zellige blue, terracotta, mint green, saffron',
    culturalReferences: 'Multicultural identity, cuisine, music, French-Arabic bilingualism',
    musicMood: 'Raï, chaabi, gnawa, North African electronic',
    formalityDefault: 'neutral',
    toneGuidance: 'Vibrant and multicultural. Celebrate hybrid identity. Modern pride with tradition.',
  },
  MENA_IRAQ: {
    narrativeStyle: 'Heritage-forward storytelling with renewal and strength',
    colorPalette: 'Mesopotamian gold, river blue, date palm green, ancient brick',
    culturalReferences: 'Cradle of civilization, resilience, renewal, cultural heritage',
    musicMood: 'Iraqi maqam, modern Iraqi pop, classical Arabic',
    formalityDefault: 'formal',
    toneGuidance: 'Dignified and strong. Honor ancient heritage. Forward-looking renewal.',
  },
  MENA_YEMEN: {
    narrativeStyle: 'Poetic, traditional storytelling with dignity and depth',
    colorPalette: 'Mountain stone, deep green, traditional indigo, honey gold',
    culturalReferences: 'Poetry tradition, coffee origin, architectural heritage, dignity',
    musicMood: 'Yemeni folk, traditional poetry recitation, ambient',
    formalityDefault: 'formal',
    toneGuidance: 'Poetic and dignified. Respect tradition deeply. Connection and community.',
  },
  MENA_ISRAEL: {
    narrativeStyle: 'Bold startup storytelling with chutzpah and innovation',
    colorPalette: 'Tech blue, startup white, Mediterranean azure, innovation green',
    culturalReferences: 'Startup nation, chutzpah, innovation, diverse melting pot',
    musicMood: 'Israeli pop, Mediterranean fusion, electronic, mizrachi',
    formalityDefault: 'casual',
    toneGuidance: 'Bold and innovative. Chutzpah-driven. Direct and challenging. Startup energy.',
  },

  // ── 6. AFRICA ───────────────────────────────────────────────────────────────
  AFR: {
    narrativeStyle: 'Vibrant, rhythmic, community-powered with oral tradition influence',
    colorPalette: 'Earth reds, sun yellows, lush greens, Kente patterns',
    culturalReferences: 'Ubuntu, oral tradition, innovation, resilience, community',
    musicMood: 'Afrobeats, highlife, amapiano, traditional drums',
    formalityDefault: 'neutral',
    toneGuidance: 'Energetic and communal. Use storytelling and rhythm. Celebrate resilience and innovation.',
  },
  AFRICA_EAST: {
    narrativeStyle: 'Mobile-first hustle storytelling with entrepreneurial spirit',
    colorPalette: 'Savanna gold, Maasai red, mountain green, sky blue',
    culturalReferences: 'M-Pesa revolution, safari heritage, Swahili culture, tech hubs',
    musicMood: 'Bongo flava, Kenyan gengetone, East African pop',
    formalityDefault: 'neutral',
    toneGuidance: 'Entrepreneurial energy. Mobile-first thinking. Opportunity and growth focus.',
  },
  AFRICA_WEST: {
    narrativeStyle: 'Nollywood-vibrant storytelling with creative community energy',
    colorPalette: 'Ankara patterns, rich gold, vibrant green, royal purple',
    culturalReferences: 'Nollywood, Afrobeats, fashion, entrepreneurship, community',
    musicMood: 'Afrobeats, highlife, juju music, hip-hop fusion',
    formalityDefault: 'neutral',
    toneGuidance: 'Vibrant and creative. Big personality energy. Celebrate culture and hustle.',
  },
  AFRICA_SOUTH: {
    narrativeStyle: 'Rainbow-nation storytelling celebrating diversity and innovation',
    colorPalette: 'Rainbow spectrum, Ndebele patterns, gold, deep blue',
    culturalReferences: 'Rainbow nation, ubuntu, innovation, diverse cultures, resilience',
    musicMood: 'Amapiano, kwaito, Afro-house, maskandi',
    formalityDefault: 'neutral',
    toneGuidance: 'Celebrate diversity. Resilience and innovation. Ubuntu spirit. Forward-looking.',
  },
  AFRICA_NORTH: {
    narrativeStyle: 'Crossroads storytelling bridging Arab and African identity',
    colorPalette: 'Saharan gold, Mediterranean blue, ancient stone, mint green',
    culturalReferences: 'Cultural crossroads, ancient civilizations, modernity, multilingualism',
    musicMood: 'North African electronic, chaabi, gnawa-jazz fusion',
    formalityDefault: 'neutral',
    toneGuidance: 'Bridge cultures. Modern with deep roots. Multicultural confidence.',
  },
  AFRICA_FRANCO: {
    narrativeStyle: 'Francophone-elegant storytelling with sophistication and unity',
    colorPalette: 'Elegant gold, forest green, French-African fusion, sunset orange',
    culturalReferences: 'Francophone identity, literature, sapeur fashion, cultural unity',
    musicMood: 'Coupé-décalé, rumba, afro-jazz, zouk',
    formalityDefault: 'neutral',
    toneGuidance: 'Elegant and unified. Francophone sophistication. Celebrate Pan-African francophone identity.',
  },

  // ── 7. INDIA ────────────────────────────────────────────────────────────────
  IND: {
    narrativeStyle: 'Storytelling through examples, family-centric, aspirational',
    colorPalette: 'Saffron, deep pink, royal purple, turmeric gold',
    culturalReferences: 'Family values, spiritual growth, education, festivals',
    musicMood: 'Bollywood-inspired, tabla + modern beats, devotional ambient',
    formalityDefault: 'neutral',
    toneGuidance: 'Warm and encouraging. Use relatable examples. Mix English with local flavor.',
  },
  INDIA_NORTH: {
    narrativeStyle: 'Bollywood-warm storytelling with family aspiration',
    colorPalette: 'Holi colors, saffron, deep pink, royal blue',
    culturalReferences: 'Bollywood, family aspiration, festivals (Diwali/Holi), street food culture',
    musicMood: 'Bollywood, Punjabi beats, devotional, indie Hindi',
    formalityDefault: 'neutral',
    toneGuidance: 'Warm and aspirational. Family values front and center. Bollywood-level emotion OK.',
  },
  INDIA_SOUTH: {
    narrativeStyle: 'Tech-heritage storytelling blending tradition with innovation',
    colorPalette: 'Temple gold, silk magenta, banana leaf green, Dravidian red',
    culturalReferences: 'Tech hubs (Bangalore), classical arts, temple heritage, coffee culture',
    musicMood: 'Carnatic fusion, Tamil/Telugu cinema, ambient Veena',
    formalityDefault: 'neutral',
    toneGuidance: 'Pride in excellence. Blend tech prowess with cultural depth. Respect classical arts.',
  },
  INDIA_EAST: {
    narrativeStyle: 'Intellectual-artistic storytelling with cultural depth',
    colorPalette: 'Bengal white and red, Durga gold, river blue, autumn orange',
    culturalReferences: 'Bengali intellectualism, Durga Puja, literature, artistic tradition',
    musicMood: 'Rabindra sangeet, Bengali rock, folk-fusion',
    formalityDefault: 'neutral',
    toneGuidance: 'Intellectual and artistic. Cultural depth matters. Literature and art references.',
  },
  INDIA_WEST: {
    narrativeStyle: 'Entrepreneurial-vibrant storytelling with business community energy',
    colorPalette: 'Bandhani patterns, business gold, Rajasthani colors, coastal blue',
    culturalReferences: 'Entrepreneurship, trade heritage, Navratri, cricket, Bollywood business',
    musicMood: 'Garba, Gujarati folk-pop, Marathi lavani fusion',
    formalityDefault: 'neutral',
    toneGuidance: 'Business-savvy and vibrant. Community and commerce. Celebratory energy.',
  },
  INDIA_PAN: {
    narrativeStyle: 'Unity-in-diversity storytelling with national pride',
    colorPalette: 'Tricolor saffron-white-green, Ashoka blue, festival spectrum',
    culturalReferences: 'Unity in diversity, Make in India, Digital India, cricket, national pride',
    musicMood: 'Fusion Bollywood, patriotic, indie pan-Indian',
    formalityDefault: 'neutral',
    toneGuidance: 'National pride with inclusive spirit. Celebrate diversity. Aspirational India story.',
  },

  // ── 8. PAKISTAN ──────────────────────────────────────────────────────────────
  PAKISTAN: {
    narrativeStyle: 'Refined Urdu storytelling with cultural depth and family honor',
    colorPalette: 'Emerald green, moon white, truck-art rainbow, deep rose',
    culturalReferences: 'Family honor, poetry (ghazal), hospitality, truck art, cricket',
    musicMood: 'Qawwali, Coke Studio fusion, Pakistani pop, Sufi rock',
    formalityDefault: 'formal',
    toneGuidance: 'Respectful and refined. Honor family values. Poetry and music are cultural pillars.',
  },
  PK_PUNJAB: {
    narrativeStyle: 'High-energy celebration storytelling with josh (passion)',
    colorPalette: 'Truck art vibrant, bhangra yellow, festive red, phulkari patterns',
    culturalReferences: 'Bhangra, festivals, food culture, agricultural pride, energy',
    musicMood: 'Bhangra, Punjabi pop, dhol beats, Coke Studio',
    formalityDefault: 'casual',
    toneGuidance: 'High energy and celebratory. Josh (passion) in every word. Family and food.',
  },
  PK_SINDH: {
    narrativeStyle: 'Sufi-depth storytelling with mystical and heritage elements',
    colorPalette: 'Ajrak blue-red, Indus river blue, desert gold, Sufi green',
    culturalReferences: 'Sufi tradition (Shah Abdul Latif), Mohenjo-daro, ajrak craft, river culture',
    musicMood: 'Sufi kalam, Sindhi folk, mystical ambient',
    formalityDefault: 'formal',
    toneGuidance: 'Mystical and deep. Sufi wisdom. Heritage pride. Poetic and contemplative.',
  },
  PK_KPK: {
    narrativeStyle: 'Honor-driven storytelling with courage and hospitality',
    colorPalette: 'Mountain gray, tribal patterns, warrior green, hospitality gold',
    culturalReferences: 'Pashtunwali code, hospitality, mountain heritage, courage, attan dance',
    musicMood: 'Pashto folk, rabab, attan rhythms, Pashto pop',
    formalityDefault: 'formal',
    toneGuidance: 'Dignified and strong. Honor and hospitality. Courage and community. Respect tradition.',
  },
  PK_URDU: {
    narrativeStyle: 'Refined adab (etiquette) storytelling with poetic elegance',
    colorPalette: 'Mughal white, emerald green, refined gold, calligraphy black',
    culturalReferences: 'Urdu poetry (Ghalib/Iqbal), adab, classical music, literary tradition',
    musicMood: 'Ghazal, classical, qawwali, refined pop',
    formalityDefault: 'formal',
    toneGuidance: 'Elegant and refined. Urdu literary quality. Adab (etiquette) in tone. Poetic flourish.',
  },

  // ── 9. BANGLADESH ───────────────────────────────────────────────────────────
  BANGLADESH: {
    narrativeStyle: 'Youth-driven modern storytelling with Bengali cultural depth',
    colorPalette: 'Emerald green, river blue, golden jute, lotus pink',
    culturalReferences: 'Language pride (Ekushey), textile heritage, rivers, cricket, youth energy',
    musicMood: 'Bengali rock, Baul folk, modern Bangla pop',
    formalityDefault: 'neutral',
    toneGuidance: 'Youth energy with cultural pride. Language is identity. Progress and resilience.',
  },
  BD_DHAKA: {
    narrativeStyle: 'Urban-modern storytelling with youth and tech energy',
    colorPalette: 'Digital teal, urban gray, startup green, youth pink',
    culturalReferences: 'Tech startups, garment industry innovation, urban youth culture, Pohela Boishakh',
    musicMood: 'Modern Bangla pop, indie Bengali, hip-hop Bengali',
    formalityDefault: 'casual',
    toneGuidance: 'Modern and energetic. Youth-driven. Tech-forward with Bengali roots.',
  },
  BD_CHITTAGONG: {
    narrativeStyle: 'Port-city trade storytelling with enterprise spirit',
    colorPalette: 'Ocean blue, port steel, hill green, trade gold',
    culturalReferences: 'Trade heritage, port city, hill tracts diversity, ship-breaking industry',
    musicMood: 'Chittagongian folk, trade city ambient, fusion',
    formalityDefault: 'neutral',
    toneGuidance: 'Enterprise-minded. Trade and resilience. Diverse community. Port city energy.',
  },

  // ── 10. SOUTH ASIA (Extended) ───────────────────────────────────────────────
  SOUTH_ASIA: {
    narrativeStyle: 'Himalayan-rooted storytelling with spiritual depth and community',
    colorPalette: 'Mountain white, prayer flag colors, tropical green, deep blue',
    culturalReferences: 'Spiritual traditions, natural beauty, community harmony, sustainable living',
    musicMood: 'Himalayan ambient, folk instruments, meditation sounds',
    formalityDefault: 'neutral',
    toneGuidance: 'Mindful and community-rooted. Honor nature and spirituality. Gentle strength.',
  },
  SA_NEPAL: {
    narrativeStyle: 'Himalayan-humble storytelling with community warmth',
    colorPalette: 'Mountain white, prayer flag spectrum, Everest blue, temple gold',
    culturalReferences: 'Himalayas, Namaste culture, Dashain/Tihar, mountaineering, community',
    musicMood: 'Nepali folk, sarangi, modern Nepali pop',
    formalityDefault: 'neutral',
    toneGuidance: 'Humble and warm. Community first. Mountain metaphors. Spiritual depth.',
  },
  SA_SRILANKA: {
    narrativeStyle: 'Island serendipity storytelling with renewal and resilience',
    colorPalette: 'Ceylon tea amber, tropical green, ocean blue, temple gold',
    culturalReferences: 'Tea heritage, Buddhist/Hindu traditions, cricket, serendipity, pearl of Indian Ocean',
    musicMood: 'Baila, Sinhala pop, Buddhist chanting ambient, Tamil cinema',
    formalityDefault: 'neutral',
    toneGuidance: 'Warm serendipity. Renewal and hope. Island beauty. Cultural harmony.',
  },
  SA_BHUTAN: {
    narrativeStyle: 'Gross National Happiness storytelling with mindful balance',
    colorPalette: 'Prayer flag spectrum, deep orange, forest green, mountain white',
    culturalReferences: 'GNH (Gross National Happiness), Dzong architecture, Buddhism, dragon kingdom',
    musicMood: 'Buddhist chanting, traditional instruments, serene ambient',
    formalityDefault: 'formal',
    toneGuidance: 'Mindful and balanced. Happiness over materialism. Deep respect for nature and tradition.',
  },
  SA_MALDIVES: {
    narrativeStyle: 'Paradise-premium storytelling with luxury and sustainability',
    colorPalette: 'Ocean turquoise, coral pink, sand white, sunset gold',
    culturalReferences: 'Paradise islands, sustainability, ocean conservation, luxury tourism',
    musicMood: 'Island ambient, boduberu drums, ocean soundscapes',
    formalityDefault: 'neutral',
    toneGuidance: 'Premium and sustainable. Ocean metaphors. Luxury with environmental consciousness.',
  },

  // ── 11. SOUTHEAST ASIA (SEA) ────────────────────────────────────────────────
  SEA: {
    narrativeStyle: 'Community-oriented, respectful, nature-connected',
    colorPalette: 'Tropical greens, ocean blues, coral, golden temple tones',
    culturalReferences: 'Community harmony, nature, spirituality, modern progress',
    musicMood: 'Gamelan-inspired, tropical house, ambient nature sounds',
    formalityDefault: 'neutral',
    toneGuidance: 'Gentle and respectful. Emphasize community benefit. Blend modern with traditional.',
  },
  SEA_MALAY: {
    narrativeStyle: 'Halal-economy storytelling with community prosperity focus',
    colorPalette: 'Islamic green, batik patterns, tropical emerald, royal yellow',
    culturalReferences: 'Halal economy, batik heritage, Ramadan, gotong-royong (mutual aid)',
    musicMood: 'Dangdut, Malay pop, gamelan, nasyid',
    formalityDefault: 'neutral',
    toneGuidance: 'Community prosperity. Halal-conscious. Mutual aid spirit. Modern with tradition.',
  },
  SEA_THAI: {
    narrativeStyle: 'Sabai (easy-going) creative storytelling with harmony and beauty',
    colorPalette: 'Temple gold, orchid purple, tropical green, royal blue',
    culturalReferences: 'Sabai-sabai (relaxed), wai greeting, temple culture, Thai cuisine, Songkran',
    musicMood: 'Thai pop, luk thung, Thai electronic, temple bells',
    formalityDefault: 'neutral',
    toneGuidance: 'Harmonious and beautiful. Sabai energy. Respect hierarchy. Celebrate beauty and cuisine.',
  },
  SEA_VIET: {
    narrativeStyle: 'Dynamic-rising storytelling with ambition and resilience',
    colorPalette: 'Star red, bamboo green, lotus pink, rice paddy gold',
    culturalReferences: 'Rising tiger economy, resilience, street food culture, ao dai elegance',
    musicMood: 'Vietnamese pop, đàn tranh, modern Vietnamese electronic',
    formalityDefault: 'neutral',
    toneGuidance: 'Dynamic and ambitious. Rising economy energy. Resilience celebrated. Modern progress.',
  },
  SEA_PHIL: {
    narrativeStyle: 'Bayanihan-warm storytelling with family and joy',
    colorPalette: 'Fiesta red, ocean blue, jeepney rainbow, star gold',
    culturalReferences: 'Bayanihan (community), family OFW, fiestas, Taglish language, basketball',
    musicMood: 'OPM (Original Pilipino Music), karaoke anthems, P-pop',
    formalityDefault: 'casual',
    toneGuidance: 'Warm and joyful. Family is everything. Community spirit. Taglish natural. Fiesta energy.',
  },
  SEA_PAN: {
    narrativeStyle: 'Kiasu-excellence storytelling with premium efficiency',
    colorPalette: 'Merlion silver, garden green, tech blue, premium black',
    culturalReferences: 'Kiasu (must-win), garden city, multicultural harmony, food courts, efficiency',
    musicMood: 'Singapore pop, multicultural fusion, premium ambient',
    formalityDefault: 'neutral',
    toneGuidance: 'Premium and efficient. Kiasu excellence. Multicultural sophistication. Results-driven.',
  },

  // ── 12. CJK (China-Japan-Korea) ─────────────────────────────────────────────
  CJK: {
    narrativeStyle: 'Harmony-focused, group-oriented, respect for hierarchy',
    colorPalette: 'Red and gold (prosperity), jade green, deep indigo',
    culturalReferences: 'Harmony, collective success, technological mastery, seasonal beauty',
    musicMood: 'Traditional instruments fused with modern beats, ambient guzheng/shamisen',
    formalityDefault: 'formal',
    toneGuidance: 'Respectful tone. Indirect persuasion. Emphasize collective benefit. Avoid direct confrontation.',
  },
  CJK_CN: {
    narrativeStyle: 'Guochao (national trend) storytelling with tech-pride',
    colorPalette: 'Lucky red, imperial gold, WeChat green, tech blue',
    culturalReferences: 'Guochao, tech innovation, 5000-year heritage, Double 11, social commerce',
    musicMood: 'C-pop, guzheng-electronic fusion, mandopop, cinematic',
    formalityDefault: 'formal',
    toneGuidance: 'National pride with tech-forward vision. Guochao trend. Collective achievement. WeChat-native.',
  },
  CJK_JP: {
    narrativeStyle: 'Omotenashi (hospitality) storytelling with precision and respect',
    colorPalette: 'Cherry blossom pink, zen white, indigo, matcha green, torii red',
    culturalReferences: 'Omotenashi, mono no aware (beauty of impermanence), kawaii, craftsmanship',
    musicMood: 'J-pop, shamisen-electronic, anime OST, ambient zen',
    formalityDefault: 'formal',
    toneGuidance: 'Precise and respectful. Omotenashi spirit. Seasonal awareness. Subtle beauty over bold claims.',
  },
  CJK_KR: {
    narrativeStyle: 'Hallyu (Korean wave) storytelling with cool innovation',
    colorPalette: 'K-pop neon, hanbok pastel, tech silver, skin-care white',
    culturalReferences: 'Hallyu, K-pop, K-beauty, ppalli-ppalli (fast culture), tech gadgets',
    musicMood: 'K-pop, K-drama OST, Korean R&B, trot-modern',
    formalityDefault: 'neutral',
    toneGuidance: 'Cool and trendy. Hallyu energy. Fast-paced innovation. Visual perfection matters.',
  },
  CJK_TW: {
    narrativeStyle: 'Creative-artisan storytelling with warmth and quality',
    colorPalette: 'Bubble tea pastel, night market neon, jade green, heritage red',
    culturalReferences: 'Night market culture, bubble tea, tech artisanship, creative freedom, warmth',
    musicMood: 'Mandopop (indie), Taiwanese folk, electronic pop',
    formalityDefault: 'neutral',
    toneGuidance: 'Warm and creative. Artisan quality. Indie spirit. Night market accessibility.',
  },

  // ── 13. LATIN AMERICA (LATAM) ───────────────────────────────────────────────
  LATAM: {
    narrativeStyle: 'Passionate, emotional, family and faith centered',
    colorPalette: 'Vibrant tropical, warm terracotta, festive carnival',
    culturalReferences: 'Family, passion, celebration, football, samba, resilience',
    musicMood: 'Bossa nova, reggaeton, salsa, MPB',
    formalityDefault: 'casual',
    toneGuidance: 'Passionate and expressive. Emphasize emotion and connection. Celebrate life and community.',
  },
  LATAM_MX: {
    narrativeStyle: 'Calidez (warmth) and creativity storytelling',
    colorPalette: 'Alebrije rainbow, Oaxacan earth, Frida pink, cactus green',
    culturalReferences: 'Día de los Muertos, gastronomy (tacos/mole), alebrijes, family warmth',
    musicMood: 'Mariachi, reggaeton, Mexican cumbia, banda, son jarocho',
    formalityDefault: 'casual',
    toneGuidance: 'Warm and creative. Family at the center. Humor and heart. Mexicanidad pride.',
  },
  LATAM_BR: {
    narrativeStyle: 'Jeitinho brasileiro — creative, rhythmic, joyful storytelling',
    colorPalette: 'Carnival rainbow, Amazon green, Copacabana blue, football gold',
    culturalReferences: 'Carnival, samba, futebol, jeitinho (creative problem-solving), Amazon',
    musicMood: 'Samba, bossa nova, funk carioca, MPB, sertanejo, axé',
    formalityDefault: 'casual',
    toneGuidance: 'Joyful and rhythmic. Jeitinho spirit. Creative and warm. Celebrate life (alegria).',
  },
  LATAM_CONE: {
    narrativeStyle: 'Porteño-intellectual storytelling with passionate debate',
    colorPalette: 'Tango black and red, Patagonia blue, mate green, gaucho brown',
    culturalReferences: 'Tango, mate, asado, literary tradition (Borges), football, gaucho',
    musicMood: 'Tango nuevo, Argentine rock, cumbia villera, folklore',
    formalityDefault: 'neutral',
    toneGuidance: 'Intellectual and passionate. Debate is welcome. Literary quality. Tango-level emotion.',
  },
  LATAM_ANDES: {
    narrativeStyle: 'Andean-authentic storytelling with heritage and progress',
    colorPalette: 'Andean earth tones, alpaca brown, quinoa gold, mountain blue',
    culturalReferences: 'Inca heritage, pachamama, quinoa economy, textile tradition, café culture',
    musicMood: 'Andean folk, zampoña, cumbia andina, modern Latin pop',
    formalityDefault: 'neutral',
    toneGuidance: 'Authentic and grounded. Honor pachamama (earth). Heritage with forward progress.',
  },
  LATAM_CARIB: {
    narrativeStyle: 'Tropical-energetic storytelling with celebration and color',
    colorPalette: 'Caribbean turquoise, tropical fruit colors, sunset orange, party gold',
    culturalReferences: 'Caribbean coast fiestas, vallenato, coastal relaxation, salsa culture',
    musicMood: 'Vallenato, salsa, champeta, Caribbean reggaeton',
    formalityDefault: 'casual',
    toneGuidance: 'Energetic and tropical. Celebration is the default mode. Rhythm in every sentence.',
  },

  // ── 14. CARIBBEAN ───────────────────────────────────────────────────────────
  CARIBBEAN: {
    narrativeStyle: 'Island-vibes storytelling with rhythm, resilience, and joy',
    colorPalette: 'Ocean turquoise, Rastafari colors, tropical fruit, sunset gradient',
    culturalReferences: 'Island culture, reggae, carnival, rum, resilience, diaspora',
    musicMood: 'Reggae, dancehall, soca, calypso, zouk',
    formalityDefault: 'casual',
    toneGuidance: 'Irie and confident. Island rhythm in language. Celebrate culture and resilience.',
  },
  CARIBBEAN_EN: {
    narrativeStyle: 'Irie-confident storytelling with rhythm and cultural pride',
    colorPalette: 'Rastafari red-gold-green, ocean blue, sunset orange, carnival colors',
    culturalReferences: 'Reggae, cricket, carnival, jerk cuisine, Marley legacy, rum culture',
    musicMood: 'Reggae, dancehall, soca, chutney, Caribbean pop',
    formalityDefault: 'casual',
    toneGuidance: 'Irie confidence. Island rhythmic speech. Cultural pride. Patois flavor welcome.',
  },
  CARIBBEAN_FR: {
    narrativeStyle: 'Créole-fusion storytelling with artistic resilience',
    colorPalette: 'Tropical green, Créole red, French-Caribbean blue, volcanic black',
    culturalReferences: 'Créolité, Aimé Césaire, carnival, rum rhum, French-African-Caribbean identity',
    musicMood: 'Zouk, kompa, French Caribbean hip-hop, gwoka',
    formalityDefault: 'neutral',
    toneGuidance: 'Artistic and resilient. Créole fusion identity. French elegance meets Caribbean soul.',
  },

  // ── 15. OCEANIA ─────────────────────────────────────────────────────────────
  OCEANIA: {
    narrativeStyle: 'No-worries authentic storytelling with nature and mateship',
    colorPalette: 'Outback red, ocean blue, eucalyptus green, beach sand',
    culturalReferences: 'Mateship, outdoor lifestyle, sustainability, indigenous heritage',
    musicMood: 'Indie Australian, didgeridoo ambient, surf rock, electronic',
    formalityDefault: 'casual',
    toneGuidance: 'Authentic and direct. No tall-poppy syndrome. Down-to-earth. Nature connection.',
  },
  OCEANIA_AU: {
    narrativeStyle: 'No-worries direct storytelling with mateship authenticity',
    colorPalette: 'Outback ochre, surf blue, bush green, golden wattle',
    culturalReferences: 'Mateship, BBQ culture, sport (cricket/AFL/rugby), bushland, indigenous Dreamtime',
    musicMood: 'Indie Australian rock, didgeridoo ambient, electronic, surf',
    formalityDefault: 'casual',
    toneGuidance: 'Direct and authentic. No worries mate. Anti-pretension. Mateship and fair go.',
  },
  OCEANIA_NZ: {
    narrativeStyle: 'Kiwi-inclusive storytelling with aroha (love) and sustainability',
    colorPalette: 'Silver fern, All Blacks black, Māori patterns, lake turquoise',
    culturalReferences: 'Aroha (love), kaitiakitanga (guardianship), haka, LOTR landscapes, innovation',
    musicMood: 'Kiwi indie, Māori poi music, ambient nature, reggae-influenced',
    formalityDefault: 'casual',
    toneGuidance: 'Inclusive with aroha. Sustainability core. Kiwi understated humor. Māori cultural respect.',
  },

  // ── 16. CENTRAL ASIA ────────────────────────────────────────────────────────
  CENTRAL_ASIA: {
    narrativeStyle: 'Silk Road storytelling bridging ancient trade with modern vision',
    colorPalette: 'Steppe gold, ceramic blue, yurt white, silk road amber',
    culturalReferences: 'Silk Road heritage, nomadic tradition, modern transformation, energy resources',
    musicMood: 'Dombra, throat singing, Central Asian pop, ambient steppe',
    formalityDefault: 'neutral',
    toneGuidance: 'Visionary and heritage-proud. Silk Road metaphors. Scale and ambition. Modern transformation.',
  },
  CA_KZ: {
    narrativeStyle: 'Steppe-ambition storytelling with scale and vision',
    colorPalette: 'Steppe gold, sky blue, Astana silver, energy amber',
    culturalReferences: 'Steppe heritage, space (Baikonur), energy sector, modern Astana, eagle hunting',
    musicMood: 'Dombra pop fusion, Kazakh electronic, throat singing modern',
    formalityDefault: 'neutral',
    toneGuidance: 'Visionary and ambitious. Think big (steppe-scale). Modern nation building. Energy and space.',
  },
  CA_UZ: {
    narrativeStyle: 'Silk Road revival storytelling with heritage transformation',
    colorPalette: 'Samarkand blue, Registan gold, ceramic turquoise, silk white',
    culturalReferences: 'Samarkand/Bukhara, Silk Road, ceramic art, plov cuisine, Islamic geometry',
    musicMood: 'Shashmaqam, Uzbek pop, traditional dutar, modern fusion',
    formalityDefault: 'neutral',
    toneGuidance: 'Heritage revival. Silk Road identity. Transformation narrative. Artisan quality.',
  },
  CA_AZ: {
    narrativeStyle: 'Crossroads-energy storytelling with fire and innovation',
    colorPalette: 'Flame orange, Caspian blue, oil black, modern teal',
    culturalReferences: 'Land of Fire, Caspian energy, mugham music, modern Baku, F1',
    musicMood: 'Mugham-electronic fusion, Azerbaijani pop, tar and kamancha',
    formalityDefault: 'neutral',
    toneGuidance: 'Fire and innovation. Crossroads energy. Modern Baku confidence. East-West fusion.',
  },
};

// ── Region Resolution ─────────────────────────────────────────────────────────
// Maps any region/subregion code to the correct creative profile.
// Lookup order: exact match → parent prefix → parent key alias → fallback NAM.

/** Alias map: old/short keys → canonical parent region key */
const PARENT_REGION_ALIASES: Record<string, string> = {
  // Legacy aliases from old 8-region system
  EUR: 'EU',
  SAM: 'LATAM',
  // Provider routing codes that differ from our keys
  INDIA: 'IND',
  AFRICA: 'AFR',
};

/**
 * Resolve any region/subregion code to the best matching RegionalProfile.
 * Handles: exact subregion (MENA_GULF), parent (MENA), aliased (EUR→EU), prefixed (NAM_CA→NAM).
 */
function resolveRegionalProfile(region: string, subRegion?: string): RegionalProfile {
  // 1. Try exact subregion match first
  if (subRegion && REGIONAL_CREATIVE_PROFILES[subRegion]) {
    return REGIONAL_CREATIVE_PROFILES[subRegion];
  }

  // 2. Try exact region match
  if (REGIONAL_CREATIVE_PROFILES[region]) {
    return REGIONAL_CREATIVE_PROFILES[region];
  }

  // 3. Try alias
  const aliased = PARENT_REGION_ALIASES[region];
  if (aliased && REGIONAL_CREATIVE_PROFILES[aliased]) {
    return REGIONAL_CREATIVE_PROFILES[aliased];
  }

  // 4. Try splitting on underscore to find parent (e.g., NAM_US → NAM, MENA_GULF → MENA)
  const parts = region.split('_');
  if (parts.length >= 2) {
    const parentKey = parts[0];
    if (REGIONAL_CREATIVE_PROFILES[parentKey]) {
      return REGIONAL_CREATIVE_PROFILES[parentKey];
    }
    const parentAliased = PARENT_REGION_ALIASES[parentKey];
    if (parentAliased && REGIONAL_CREATIVE_PROFILES[parentAliased]) {
      return REGIONAL_CREATIVE_PROFILES[parentAliased];
    }
  }

  // 5. Fallback
  return REGIONAL_CREATIVE_PROFILES.NAM;
}

/**
 * Get subregion cultural tone from the canonical config.
 * Used to enrich prompts with subregion-specific cultural nuance.
 */
function getSubRegionCulturalContext(region: string, subRegion?: string): { culturalTone: string; emotionalRegister: string } | null {
  const regionSlug = region.toLowerCase().split('_')[0];
  // Map parent region keys to the slug keys in REGIONAL_SUB_REGIONS
  const slugMap: Record<string, string> = {
    nam: 'nam', eu: 'europe', eur: 'europe', mena: 'mena', ind: 'india', india: 'india',
    afr: 'africa', africa: 'africa', sea: 'sea', cjk: 'cjk', latam: 'latam',
    sam: 'latam', caribbean: 'caribbean', oceania: 'oceania', turkey: 'turkey',
    pakistan: 'pakistan', pk: 'pakistan', bangladesh: 'bangladesh', bd: 'bangladesh',
    eurasia: 'eastern_europe', ee: 'eastern_europe', central_asia: 'central_asia',
    ca: 'central_asia', south_asia: 'south_asia', sa: 'south_asia',
  };
  const slug = slugMap[regionSlug] || regionSlug;
  const subs = REGIONAL_SUB_REGIONS[slug];
  if (!subs) return null;

  const code = subRegion || region;
  const match = subs.find(s => s.code === code);
  return match ? { culturalTone: match.culturalTone, emotionalRegister: match.emotionalRegister } : null;
}

// ── Format-Specific Enhancement Templates ────────────────────────────────────

const FORMAT_ENHANCEMENT_TEMPLATES: Record<string, {
  promptPrefix: string;
  structureGuide: string;
  qualityBoost: string;
}> = {
  video: {
    promptPrefix: 'Create a compelling video that',
    structureGuide: 'Include: opening hook (3s), main content with visual transitions, clear CTA, engaging pacing',
    qualityBoost: 'Cinematic quality. Professional color grading. Smooth transitions. Dynamic camera movement.',
  },
  podcast: {
    promptPrefix: 'Create an engaging podcast dialogue where',
    structureGuide: 'Include: attention-grabbing intro, conversational flow with natural turns, actionable takeaways, memorable close',
    qualityBoost: 'Natural conversation flow. Varied pacing. Emotional beats. Clear speaker differentiation.',
  },
  presentation: {
    promptPrefix: 'Create a professional presentation that',
    structureGuide: 'Include: impactful title slide, problem-solution arc, data visualization, memorable close with CTA',
    qualityBoost: 'Clean layouts. Data-driven visuals. Consistent typography. Progressive disclosure.',
  },
  social_short: {
    promptPrefix: 'Create a viral short-form content piece that',
    structureGuide: 'Include: 1-3 second hook, rapid value delivery, pattern interrupts, share-worthy ending',
    qualityBoost: 'Vertical format. Bold text overlays. Quick cuts. Trending audio-ready.',
  },
  avatar: {
    promptPrefix: 'Create a professional avatar presentation where',
    structureGuide: 'Include: confident intro, clear speech pacing, hand gestures, eye contact with camera, natural pauses',
    qualityBoost: 'Professional lighting. Clean background. Natural lip-sync. Appropriate wardrobe.',
  },
  image: {
    promptPrefix: 'Create a stunning visual that',
    structureGuide: 'Include: clear focal point, balanced composition, appropriate mood lighting, brand-consistent elements',
    qualityBoost: 'High resolution. Professional composition. Balanced lighting. Rich detail.',
  },
};

// ── Mode Detection ───────────────────────────────────────────────────────────

function detectBestMode(context: PromptContext): EnhancementMode {
  const prompt = context.rawPrompt.toLowerCase();
  const format = (context.format || '').toLowerCase();

  // Format-driven detection
  if (format.includes('podcast') || format.includes('dialogue') || format.includes('interview')) return 'character_roleplay';
  if (format.includes('presentation') || format.includes('slide') || format.includes('deck')) return 'creative_writing';
  if (format.includes('avatar') || format.includes('presenter')) return 'avatar_presenter';
  if (format.includes('short') || format.includes('reel') || format.includes('tiktok')) return 'video_generation';

  // Content-driven detection
  if (prompt.includes('brainstorm') || prompt.includes('ideas') || prompt.includes('concept')) return 'brainstorming';
  if (prompt.includes('character') || prompt.includes('roleplay') || prompt.includes('persona')) return 'character_roleplay';
  if (prompt.includes('image') || prompt.includes('photo') || prompt.includes('visual') || prompt.includes('illustration')) return 'image_generation';
  if (prompt.includes('video') || prompt.includes('scene') || prompt.includes('cinematic')) return 'video_generation';
  if (prompt.includes('avatar') || prompt.includes('presenter') || prompt.includes('host')) return 'avatar_presenter';

  // Style-driven detection
  if (context.visualStyle) {
    const style = context.visualStyle.toLowerCase();
    if (style.includes('anime') || style.includes('pixar') || style.includes('3d')) return 'image_generation';
    if (style.includes('cinematic') || style.includes('documentary')) return 'video_generation';
  }

  return 'creative_writing'; // default
}

// ── Core Enhancement Logic ───────────────────────────────────────────────────

function buildEnhancementSystemPrompt(context: PromptContext, mode: EnhancementMode): string {
  const region = context.region || 'NAM_US';
  const regionProfile = resolveRegionalProfile(region, context.subRegion);
  const formatTemplate = FORMAT_ENHANCEMENT_TEMPLATES[context.format || 'video'] || FORMAT_ENHANCEMENT_TEMPLATES.video;
  const subRegionContext = getSubRegionCulturalContext(region, context.subRegion);

  const subRegionBlock = subRegionContext
    ? `\n- Cultural Tone: ${subRegionContext.culturalTone}\n- Emotional Register: ${subRegionContext.emotionalRegister}`
    : '';

  return `You are a world-class creative director and prompt engineer specializing in AI-powered content creation.

TASK: Enhance the user's raw prompt into a professional, production-ready creative brief.

CONTEXT:
- Region: ${region}${context.subRegion ? ` / Sub-region: ${context.subRegion}` : ''} (${regionProfile.narrativeStyle})
- Language: ${context.language || 'en'}
- Format: ${context.format || 'video'}
- Visual Style: ${context.visualStyle || 'professional'}
- Intent: ${context.intent || 'general'}
- Audience: ${context.audience || 'general audience'}
- Brand Tone: ${context.brandTone || regionProfile.formalityDefault}
- Enhancement Mode: ${mode}

REGIONAL CREATIVE PROFILE:
- Narrative Style: ${regionProfile.narrativeStyle}
- Color Palette: ${regionProfile.colorPalette}
- Cultural References: ${regionProfile.culturalReferences}
- Music Mood: ${regionProfile.musicMood}
- Tone: ${regionProfile.toneGuidance}${subRegionBlock}

FORMAT REQUIREMENTS:
- Structure: ${formatTemplate.structureGuide}
- Quality: ${formatTemplate.qualityBoost}

ENHANCEMENT MODE "${mode}" GUIDELINES:
${getModeGuidelines(mode)}

RULES:
1. Preserve the user's core message and intent
2. Add professional creative direction (camera angles, lighting, pacing, transitions)
3. Include regional/cultural nuance appropriate for ${region}${context.subRegion ? ` (${context.subRegion})` : ''}
4. Use ${context.language || 'en'} linguistic patterns (idioms, formality, sentence structure)
5. Add sensory details (colors, textures, sounds, movement)
6. Include emotional arc (hook → tension → resolution → CTA)
7. Keep it actionable — every line should translate to a production decision
8. If the language is not English, write the enhanced prompt in that language with English technical terms

Return a JSON object:
{
  "enhanced": "The fully enhanced prompt (3-8 paragraphs)",
  "improvements": ["List of 3-5 specific improvements made"],
  "qualityScore": 85,
  "preview": "1-2 sentence preview of expected output",
  "suggestions": [
    {"label": "Variant Name", "description": "Why this variant", "enhancedPrompt": "Alternative enhanced version", "qualityScore": 80},
    {"label": "Variant 2", "description": "Why", "enhancedPrompt": "...", "qualityScore": 75}
  ],
  "regionalNotes": ["Cultural notes applied"],
  "formalityLevel": "neutral"
}`;
}

function getModeGuidelines(mode: EnhancementMode): string {
  switch (mode) {
    case 'creative_writing':
      return `- Build a narrative arc (setup, rising action, climax, resolution)
- Use vivid sensory language and metaphors
- Create emotional resonance with the audience
- Include dialogue or internal monologue where appropriate`;
    case 'image_generation':
      return `- Specify composition (rule of thirds, leading lines, symmetry)
- Include lighting direction (golden hour, studio, dramatic, soft)
- Detail color palette and mood
- Describe textures, materials, and depth of field
- Add style modifiers (photorealistic, illustration, watercolor, 3D render)`;
    case 'video_generation':
      return `- Include camera directions (dolly in, crane shot, tracking, handheld)
- Specify pacing and transitions (cut, crossfade, whip pan)
- Describe motion and energy level per scene
- Include audio cues (music builds, silence, sound effects)
- Structure as scene-by-scene breakdown`;
    case 'brainstorming':
      return `- Expand the concept into 5-7 creative angles
- Include unexpected connections and analogies
- Suggest visual metaphors and storytelling hooks
- Provide multiple tonal variants (serious, playful, provocative)`;
    case 'character_roleplay':
      return `- Define character personalities, motivations, and speech patterns
- Write natural dialogue with subtext
- Include stage directions and emotional beats
- Create chemistry and dynamic between characters`;
    case 'avatar_presenter':
      return `- Write for a professional on-camera presenter
- Include natural pauses, emphasis points, and gesture cues
- Structure as teleprompter-friendly paragraphs
- Add warmth and authority to the delivery`;
    case 'combination':
      return `- Blend visual, verbal, and musical elements
- Create transitions between avatar and B-roll segments
- Include both spoken narration and visual-only moments
- Balance information density with visual breathing room`;
    default:
      return '- Improve clarity, engagement, and production quality';
  }
}

// ── Main API ─────────────────────────────────────────────────────────────────

/**
 * Enhance a raw prompt using AI with full regional/format/style context.
 * Calls ai-universal-processor for the actual AI enhancement.
 */
export async function enhancePrompt(context: PromptContext): Promise<PromptEnhancementResult> {
  const mode = context.mode === 'auto' || !context.mode
    ? detectBestMode(context)
    : context.mode;

  const systemPrompt = buildEnhancementSystemPrompt(context, mode);

  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'generate_script',
        provider: 'claude',
        model: 'claude-sonnet-4-20250514',
        prompt: `${systemPrompt}\n\nUSER'S RAW PROMPT:\n"${context.rawPrompt}"`,
        maxTokens: 3000,
      },
    });

    if (error) throw error;

    const content = data?.result || data?.text || data?.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        primary: {
          enhanced: parsed.enhanced || context.rawPrompt,
          mode,
          improvements: parsed.improvements || [],
          qualityScore: parsed.qualityScore || 70,
        },
        suggestions: (parsed.suggestions || []).map((s: Record<string, unknown>, i: number) => ({
          id: `suggestion-${i}`,
          label: (s.label as string) || `Variant ${i + 1}`,
          description: (s.description as string) || '',
          enhancedPrompt: (s.enhancedPrompt as string) || '',
          mode,
          qualityScore: (s.qualityScore as number) || 65,
        })),
        preview: parsed.preview || '',
        regionalNotes: parsed.regionalNotes || [],
        formalityLevel: parsed.formalityLevel || 'neutral',
      };
    }

    // Fallback: AI returned non-JSON, use raw text as enhancement
    return buildFallbackResult(context.rawPrompt, content, mode);
  } catch (err) {
    console.error('Prompt enhancement failed:', err);
    return buildFallbackResult(context.rawPrompt, '', mode);
  }
}

/**
 * Quick, local-only enhancement without AI call.
 * Useful for real-time preview while user types.
 */
export function quickEnhance(context: PromptContext): EnhancedPrompt {
  const mode = context.mode === 'auto' || !context.mode
    ? detectBestMode(context)
    : context.mode;

  const region = context.region || 'NAM_US';
  const regionProfile = resolveRegionalProfile(region, context.subRegion);
  const formatTemplate = FORMAT_ENHANCEMENT_TEMPLATES[context.format || 'video'] || FORMAT_ENHANCEMENT_TEMPLATES.video;
  const subRegionContext = getSubRegionCulturalContext(region, context.subRegion);
  const regionLabel = context.subRegion || region;

  const improvements: string[] = [];
  let enhanced = context.rawPrompt;

  // Add format prefix if missing
  if (!enhanced.toLowerCase().startsWith('create')) {
    enhanced = `${formatTemplate.promptPrefix} ${enhanced}`;
    improvements.push('Added format-specific creative direction');
  }

  // Add regional flavor (with subregion nuance if available)
  enhanced += `\n\nRegional context: ${regionProfile.narrativeStyle}. Color palette: ${regionProfile.colorPalette}. Tone: ${regionProfile.toneGuidance}`;
  if (subRegionContext) {
    enhanced += ` Cultural tone: ${subRegionContext.culturalTone}. Emotional register: ${subRegionContext.emotionalRegister}.`;
  }
  improvements.push(`Applied ${regionLabel} regional creative profile`);

  // Add quality boost
  enhanced += `\n\n${formatTemplate.qualityBoost}`;
  improvements.push('Added production quality specifications');

  // Add style direction
  if (context.visualStyle) {
    enhanced += `\n\nVisual style: ${context.visualStyle}. Maintain consistent aesthetic throughout.`;
    improvements.push(`Applied ${context.visualStyle} style direction`);
  }

  return {
    enhanced,
    mode,
    improvements,
    qualityScore: Math.min(85, 50 + improvements.length * 10),
  };
}

function buildFallbackResult(rawPrompt: string, aiText: string, mode: EnhancementMode): PromptEnhancementResult {
  const enhanced = aiText || rawPrompt;
  return {
    primary: {
      enhanced,
      mode,
      improvements: ['Basic enhancement applied'],
      qualityScore: 60,
    },
    suggestions: [],
    preview: 'Enhancement used fallback — review and refine manually',
    regionalNotes: [],
    formalityLevel: 'neutral',
  };
}
