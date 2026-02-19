/**
 * GENIE CAST — REGIONAL CREATIVE INTELLIGENCE CONFIG
 * 
 * Maps regions/subregions to culturally-aware creative parameters for:
 * - Character design prompts (Pixar/Disney adaptations)
 * - Music & sound design (genre, instruments, mood)
 * - Visual storytelling style (color palette, lighting, environment)
 * - Emotional tone & narrative pacing
 * - Cultural symbols & metaphors
 * 
 * Used by: prompt enrichment across Genie Cast, Vibe, Deck, Spark
 * NOT restricted to EP04 — this is the universal creative layer.
 */

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface RegionalCreativeProfile {
  regionId: string;
  regionName: string;
  subRegions: SubRegionalCreative[];
  /** Default creative profile if no subregion selected */
  defaults: CreativeDirectionSet;
}

export interface SubRegionalCreative {
  id: string;
  name: string;
  creative: CreativeDirectionSet;
}

export interface CreativeDirectionSet {
  /** Character design adaptations */
  characters: {
    /** Cultural clothing/accessory modifiers added to base character prompts */
    wardrobeModifiers: string[];
    /** Animal companions that resonate culturally */
    culturalCompanions: string[];
    /** Gesture and expression style */
    expressionStyle: string;
    /** Color associations */
    colorInfluence: string[];
  };

  /** Music & audio direction */
  music: {
    /** ElevenLabs music prompt enrichment keywords */
    genres: string[];
    /** Traditional/regional instruments to weave in */
    instruments: string[];
    /** Emotional tone keywords */
    mood: string[];
    /** BPM range suggestion */
    bpmRange: [number, number];
    /** Example prompt for background score */
    samplePrompt: string;
  };

  /** Visual storytelling style */
  visuals: {
    /** Color palette keywords for image/video prompts */
    paletteKeywords: string[];
    /** Lighting style */
    lighting: string;
    /** Environment/backdrop modifiers */
    environmentModifiers: string[];
    /** Cultural patterns or motifs */
    motifs: string[];
    /** Animation energy level */
    animationEnergy: 'contemplative' | 'balanced' | 'vibrant' | 'explosive';
  };

  /** Narrative & emotional tone */
  narrative: {
    /** Storytelling tradition reference */
    storytellingStyle: string;
    /** Pacing */
    pacing: 'slow-deliberate' | 'measured' | 'dynamic' | 'rapid-fire';
    /** Emotional arc keywords */
    emotionalArc: string[];
    /** Cultural values to reflect */
    coreValues: string[];
    /** Humor style */
    humorStyle: string;
  };
}

// ─── REGIONAL CREATIVE PROFILES ──────────────────────────────────────────────

export const REGIONAL_CREATIVE_PROFILES: RegionalCreativeProfile[] = [
  // ═══════════════════════════════════════════════════════════════
  // INDIA
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'india',
    regionName: 'India',
    subRegions: [
      {
        id: 'india-north',
        name: 'North India',
        creative: {
          characters: {
            wardrobeModifiers: ['vibrant kurta patterns', 'Mughal-inspired geometric borders', 'gold thread accents'],
            culturalCompanions: ['a peacock with iridescent digital feathers', 'a wise elephant calf carrying a tablet'],
            expressionStyle: 'Bold, dramatic expressions with sweeping hand gestures — Bollywood energy',
            colorInfluence: ['saffron', 'deep red', 'gold', 'royal blue'],
          },
          music: {
            genres: ['Bollywood orchestral', 'Indo-fusion electronic', 'Sufi-inspired ambient'],
            instruments: ['sitar', 'tabla', 'dholak', 'bansuri flute', 'santoor'],
            mood: ['celebratory', 'aspirational', 'grandiose', 'warm'],
            bpmRange: [110, 140],
            samplePrompt: 'Upbeat Bollywood-inspired orchestral fusion with tabla rhythms, soaring sitar melody, modern electronic beats, aspirational and celebratory energy, cinematic quality',
          },
          visuals: {
            paletteKeywords: ['saffron gold', 'royal crimson', 'deep indigo', 'warm amber'],
            lighting: 'Golden hour warmth with dramatic Bollywood-style rim lighting',
            environmentModifiers: ['ornate archways', 'marigold garlands', 'marble textures', 'geometric jali screens'],
            motifs: ['rangoli patterns', 'paisley', 'lotus', 'mandala circuits'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Epic narrative arc — small hero, big journey, triumph',
            pacing: 'dynamic',
            emotionalArc: ['underdog determination', 'collective triumph', 'family pride'],
            coreValues: ['jugaad (creative problem-solving)', 'family honor', 'aspiration'],
            humorStyle: 'Self-deprecating warmth mixed with dramatic exaggeration',
          },
        },
      },
      {
        id: 'india-south',
        name: 'South India',
        creative: {
          characters: {
            wardrobeModifiers: ['silk-inspired textures', 'temple jewelry motifs', 'Kolam-pattern accents'],
            culturalCompanions: ['a temple elephant with glowing circuit trunk', 'a clever parrot perched on a code branch'],
            expressionStyle: 'Precise, methodical expressions with subtle eye movements — classical dance influence',
            colorInfluence: ['temple gold', 'jasmine white', 'deep green', 'bronze'],
          },
          music: {
            genres: ['Carnatic-electronic fusion', 'classical veena ambient', 'South Indian film orchestral'],
            instruments: ['veena', 'mridangam', 'nadaswaram', 'ghatam', 'violin (Carnatic)'],
            mood: ['intellectual', 'precise', 'devotional warmth', 'rhythmically complex'],
            bpmRange: [90, 130],
            samplePrompt: 'Carnatic-electronic fusion with mridangam rhythmic patterns, veena melody over modern synth pads, mathematically precise yet warm, intellectual and engaging',
          },
          visuals: {
            paletteKeywords: ['bronze', 'temple gold', 'deep green', 'jasmine white'],
            lighting: 'Oil lamp warmth mixed with clean tech-blue LED accents',
            environmentModifiers: ['Dravidian temple pillars', 'banana leaf textures', 'Kolam floor patterns'],
            motifs: ['Kolam geometry', 'temple gopuram silhouettes', 'rice paddy terraces'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Methodical build-up — logic first, emotion as payoff',
            pacing: 'measured',
            emotionalArc: ['quiet competence', 'intellectual satisfaction', 'community respect'],
            coreValues: ['education', 'precision', 'humility in mastery'],
            humorStyle: 'Dry wit, understatement, clever wordplay',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['vibrant textile patterns', 'gold accents', 'modern-traditional fusion wear'],
        culturalCompanions: ['a wise elephant calf', 'a colorful parrot', 'a peacock with digital feathers'],
        expressionStyle: 'Warm, expressive, community-oriented gestures',
        colorInfluence: ['saffron', 'deep blue', 'gold', 'green'],
      },
      music: {
        genres: ['Bollywood fusion', 'Indo-electronic', 'classical ambient'],
        instruments: ['sitar', 'tabla', 'flute', 'violin'],
        mood: ['aspirational', 'warm', 'celebratory'],
        bpmRange: [100, 135],
        samplePrompt: 'Modern Indian fusion with tabla and sitar, electronic beats, aspirational and warm, cinematic production quality',
      },
      visuals: {
        paletteKeywords: ['saffron', 'indigo', 'gold', 'lotus pink'],
        lighting: 'Warm golden hour with tech-blue accents',
        environmentModifiers: ['ornate patterns', 'lush greenery', 'modern tech overlay'],
        motifs: ['mandala', 'lotus', 'geometric rangoli'],
        animationEnergy: 'vibrant',
      },
      narrative: {
        storytellingStyle: 'Aspirational journey — relatable hero, collective success',
        pacing: 'dynamic',
        emotionalArc: ['determination', 'community', 'celebration'],
        coreValues: ['innovation within tradition', 'family', 'resilience'],
        humorStyle: 'Warm, self-aware, slightly dramatic',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MENA (Middle East & North Africa)
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'mena',
    regionName: 'MENA',
    subRegions: [
      {
        id: 'mena-gulf',
        name: 'Gulf States',
        creative: {
          characters: {
            wardrobeModifiers: ['flowing robe-inspired tech wear', 'geometric Islamic art patterns', 'pearl and gold accents'],
            culturalCompanions: ['a falcon with holographic wing displays', 'an Arabian horse with glowing mane data streams'],
            expressionStyle: 'Dignified, measured gestures with moments of warm hospitality',
            colorInfluence: ['desert gold', 'pearl white', 'deep teal', 'midnight blue'],
          },
          music: {
            genres: ['Arabic orchestral', 'Gulf khaleeji modern', 'desert ambient electronic'],
            instruments: ['oud', 'qanun', 'ney flute', 'riq', 'darbuka'],
            mood: ['majestic', 'visionary', 'sophisticated', 'desert vastness'],
            bpmRange: [85, 120],
            samplePrompt: 'Majestic Arabic orchestral with oud melody and qanun arpeggios, modern electronic production, desert-inspired ambient textures, visionary and sophisticated, cinematic scale',
          },
          visuals: {
            paletteKeywords: ['desert gold', 'pearl white', 'teal oasis', 'midnight starfield'],
            lighting: 'Desert sunrise glow with cool architectural shadows',
            environmentModifiers: ['Islamic geometric architecture', 'desert dunes as data waves', 'futuristic souk marketplace'],
            motifs: ['arabesque geometry', 'crescent and star', 'palm frond fractals', 'dune wave patterns'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Visionary future-building — from heritage to innovation',
            pacing: 'measured',
            emotionalArc: ['ambition', 'pride in heritage', 'forward vision'],
            coreValues: ['hospitality', 'excellence', 'innovation rooted in tradition'],
            humorStyle: 'Subtle, warm hospitality humor — inviting, never mocking',
          },
        },
      },
      {
        id: 'mena-levant',
        name: 'Levant',
        creative: {
          characters: {
            wardrobeModifiers: ['embroidered vest patterns', 'cedar and olive branch motifs', 'Mediterranean color palette'],
            culturalCompanions: ['a cedar tree sapling that walks and talks', 'a wise turtle dove with a messenger bag'],
            expressionStyle: 'Passionate, conversational, expressive hand-talking',
            colorInfluence: ['olive green', 'Mediterranean blue', 'terracotta', 'cedar brown'],
          },
          music: {
            genres: ['Levantine pop-fusion', 'Mediterranean orchestral', 'dabke electronic'],
            instruments: ['oud', 'buzuq', 'mijwiz', 'tablah', 'accordion'],
            mood: ['warm', 'nostalgic', 'resilient', 'communal joy'],
            bpmRange: [100, 145],
            samplePrompt: 'Warm Levantine fusion with buzuq and oud, Mediterranean orchestral warmth, dabke-inspired rhythm, nostalgic yet forward-looking, communal celebration energy',
          },
          visuals: {
            paletteKeywords: ['olive green', 'Mediterranean blue', 'stone beige', 'sunset coral'],
            lighting: 'Mediterranean golden light with warm stone reflections',
            environmentModifiers: ['stone archways', 'olive groves', 'rooftop terraces', 'mosaic walls'],
            motifs: ['olive branch', 'mosaic patterns', 'cedar tree', 'arch doorways'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Personal storytelling — "let me tell you what happened to me"',
            pacing: 'dynamic',
            emotionalArc: ['resilience', 'humor through hardship', 'communal warmth'],
            coreValues: ['community bonds', 'resilience', 'generosity'],
            humorStyle: 'Sharp wit, self-deprecating, story-driven punchlines',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['geometric pattern accents', 'flowing fabric textures', 'pearl and gold details'],
        culturalCompanions: ['a falcon with data-wing displays', 'a wise desert fox'],
        expressionStyle: 'Dignified warmth with hospitable gestures',
        colorInfluence: ['gold', 'teal', 'white', 'desert sand'],
      },
      music: {
        genres: ['Arabic fusion', 'desert ambient', 'modern oud'],
        instruments: ['oud', 'ney', 'qanun', 'darbuka'],
        mood: ['majestic', 'warm', 'visionary'],
        bpmRange: [90, 125],
        samplePrompt: 'Modern Arabic fusion with oud and electronic textures, majestic and warm, cinematic desert atmosphere',
      },
      visuals: {
        paletteKeywords: ['desert gold', 'teal', 'pearl white', 'deep blue'],
        lighting: 'Desert golden hour with cool shadow contrast',
        environmentModifiers: ['geometric architecture', 'desert landscapes', 'oasis gardens'],
        motifs: ['arabesque', 'geometric stars', 'crescent'],
        animationEnergy: 'balanced',
      },
      narrative: {
        storytellingStyle: 'Heritage meets future — bridging tradition and innovation',
        pacing: 'measured',
        emotionalArc: ['vision', 'pride', 'hospitality'],
        coreValues: ['honor', 'innovation', 'community'],
        humorStyle: 'Warm, inviting, subtle',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // EAST ASIA
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'east-asia',
    regionName: 'East Asia',
    subRegions: [
      {
        id: 'east-asia-japan',
        name: 'Japan',
        creative: {
          characters: {
            wardrobeModifiers: ['minimalist tech-kimono hybrid', 'sakura petal accents', 'clean geometric lines'],
            culturalCompanions: ['a serene koi fish that swims through air-data streams', 'a tanuki (raccoon dog) with a tablet'],
            expressionStyle: 'Precise, subtle micro-expressions — Studio Ghibli influence',
            colorInfluence: ['sakura pink', 'indigo', 'bamboo green', 'cloud white'],
          },
          music: {
            genres: ['J-ambient electronic', 'Studio Ghibli orchestral', 'lo-fi city pop'],
            instruments: ['koto', 'shakuhachi', 'shamisen', 'piano', 'synth pads'],
            mood: ['serene', 'wistful', 'precise beauty', 'mono no aware'],
            bpmRange: [75, 110],
            samplePrompt: 'Serene Japanese ambient with koto and shakuhachi over soft electronic pads, Studio Ghibli-inspired orchestral warmth, wistful and beautiful, lo-fi city pop undertones',
          },
          visuals: {
            paletteKeywords: ['sakura pink', 'indigo', 'bamboo green', 'cloud white', 'vermillion'],
            lighting: 'Soft diffused light like morning mist — Ghibli atmospheric',
            environmentModifiers: ['zen garden with data stones', 'torii gate portals', 'bamboo forest servers'],
            motifs: ['cherry blossom', 'wave patterns (Hokusai)', 'origami', 'kanji brushwork'],
            animationEnergy: 'contemplative',
          },
          narrative: {
            storytellingStyle: 'Quiet revelation — beauty in ordinary moments, subtle profound insight',
            pacing: 'slow-deliberate',
            emotionalArc: ['discovery through stillness', 'craftsmanship pride', 'bittersweet beauty'],
            coreValues: ['kaizen (continuous improvement)', 'respect', 'craftsmanship'],
            humorStyle: 'Gentle absurdist, deadpan observation',
          },
        },
      },
      {
        id: 'east-asia-korea',
        name: 'South Korea',
        creative: {
          characters: {
            wardrobeModifiers: ['sleek K-tech streetwear', 'hanbok-inspired clean lines', 'neon accent trims'],
            culturalCompanions: ['a Korean magpie (까치) with LED tail feathers', 'a playful haetae lion-dog hologram'],
            expressionStyle: 'Dynamic K-drama expressions — peak emotion, satisfying reactions',
            colorInfluence: ['neon pink', 'electric blue', 'clean white', 'soft lavender'],
          },
          music: {
            genres: ['K-pop influenced electronic', 'Korean cinematic orchestral', 'retro synth-wave'],
            instruments: ['gayageum', 'haegeum', 'modern synths', 'layered vocals'],
            mood: ['trendsetting', 'emotionally intense', 'polished', 'addictive'],
            bpmRange: [110, 145],
            samplePrompt: 'Sleek K-pop influenced electronic with gayageum melody, cinematic build-ups, retro synth-wave textures, trendsetting and emotionally intense, polished production',
          },
          visuals: {
            paletteKeywords: ['neon pink', 'electric blue', 'clean white', 'soft lavender'],
            lighting: 'Neon-lit urban with cinematic color grading — K-drama aesthetic',
            environmentModifiers: ['sleek glass surfaces', 'neon-lit streets', 'minimalist tech spaces'],
            motifs: ['clean geometric shapes', 'neon hangul typography', 'wave-slash patterns'],
            animationEnergy: 'explosive',
          },
          narrative: {
            storytellingStyle: 'K-drama arc — build tension, emotional peak, satisfying resolution',
            pacing: 'rapid-fire',
            emotionalArc: ['intense focus', 'dramatic reveal', 'team synergy'],
            coreValues: ['ppalli-ppalli (fast-fast)', 'collective excellence', 'trend leadership'],
            humorStyle: 'Reaction-driven comedy, exaggerated surprise, playful rivalry',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['clean minimalist tech-wear', 'cultural pattern accents', 'precision tailoring'],
        culturalCompanions: ['a koi fish swimming through data', 'a wise crane'],
        expressionStyle: 'Precise, expressive within restraint',
        colorInfluence: ['indigo', 'sakura pink', 'bamboo green', 'pearl'],
      },
      music: {
        genres: ['Asian fusion electronic', 'orchestral ambient', 'lo-fi beats'],
        instruments: ['koto', 'piano', 'synth', 'strings'],
        mood: ['serene', 'precise', 'beautiful'],
        bpmRange: [80, 120],
        samplePrompt: 'East Asian fusion ambient with traditional instruments over modern electronic, serene and precise, cinematic beauty',
      },
      visuals: {
        paletteKeywords: ['indigo', 'sakura', 'bamboo', 'cloud white'],
        lighting: 'Soft atmospheric with clean contrast',
        environmentModifiers: ['zen minimalism', 'nature-tech fusion', 'clean architecture'],
        motifs: ['wave patterns', 'floral', 'geometric precision'],
        animationEnergy: 'balanced',
      },
      narrative: {
        storytellingStyle: 'Precision storytelling — every detail matters',
        pacing: 'measured',
        emotionalArc: ['craft', 'beauty', 'quiet triumph'],
        coreValues: ['craftsmanship', 'harmony', 'innovation'],
        humorStyle: 'Subtle, observational',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // LATIN AMERICA
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'latam',
    regionName: 'Latin America',
    subRegions: [
      {
        id: 'latam-brazil',
        name: 'Brazil',
        creative: {
          characters: {
            wardrobeModifiers: ['tropical print tech-wear', 'capoeira-inspired movement clothes', 'carnival color bursts'],
            culturalCompanions: ['a toucan with holographic beak displaying metrics', 'a capybara wearing headphones reviewing code calmly'],
            expressionStyle: 'Warm, full-body expression — samba energy, infectious joy',
            colorInfluence: ['tropical green', 'sunshine yellow', 'ocean blue', 'carnival magenta'],
          },
          music: {
            genres: ['bossa nova tech-fusion', 'Brazilian funk electronic', 'MPB (Música Popular Brasileira) modern'],
            instruments: ['berimbau', 'pandeiro', 'cavaquinho', 'surdo', 'acoustic guitar'],
            mood: ['joyful', 'sensual rhythm', 'creative flow', 'community warmth'],
            bpmRange: [95, 140],
            samplePrompt: 'Modern bossa nova fusion with electronic beats, pandeiro and cavaquinho groove, tropical warmth, joyful and creative energy, cinematic Brazilian atmosphere',
          },
          visuals: {
            paletteKeywords: ['tropical green', 'sunshine yellow', 'ocean blue', 'carnival magenta'],
            lighting: 'Tropical sunlight with lush color saturation — carnival vibrancy',
            environmentModifiers: ['tropical forest canopy', 'colorful favela architecture', 'beach-tech workspace'],
            motifs: ['tropical leaves', 'carnival masks', 'capoeira movement arcs', 'wave patterns'],
            animationEnergy: 'explosive',
          },
          narrative: {
            storytellingStyle: 'Jeitinho brasileiro — creative workarounds told with joy and rhythm',
            pacing: 'dynamic',
            emotionalArc: ['creative joy', 'community rhythm', 'overcoming with style'],
            coreValues: ['creativity', 'community (comunidade)', 'joyful resilience'],
            humorStyle: 'Physical comedy, rhythmic timing, infectious laughter',
          },
        },
      },
      {
        id: 'latam-mexico',
        name: 'Mexico & Central America',
        creative: {
          characters: {
            wardrobeModifiers: ['Aztec geometric tech patterns', 'Día de Muertos sugar skull accents', 'lucha libre mask elements'],
            culturalCompanions: ['an axolotl with regenerating code abilities', 'a quetzal bird trailing data feathers'],
            expressionStyle: 'Passionate, colorful, with dramatic flair — telenovela energy meets tech',
            colorInfluence: ['marigold orange', 'deep magenta', 'turquoise', 'obsidian black'],
          },
          music: {
            genres: ['mariachi electronic fusion', 'Mexican cumbia tech', 'corrido modern'],
            instruments: ['guitarrón', 'vihuela', 'trumpet', 'marimba', 'jarana'],
            mood: ['passionate', 'celebratory', 'proud', 'festive'],
            bpmRange: [105, 140],
            samplePrompt: 'Mariachi-electronic fusion with trumpet and guitarrón, cumbia rhythm with modern beats, passionate and celebratory, cinematic Mexican atmosphere, proud and festive',
          },
          visuals: {
            paletteKeywords: ['marigold orange', 'deep magenta', 'turquoise', 'obsidian'],
            lighting: 'Warm sunset palette with papel picado filtered light',
            environmentModifiers: ['colorful painted walls', 'Aztec pyramid tech centers', 'marigold-draped workspaces'],
            motifs: ['papel picado', 'Aztec calendar gears', 'sugar skull circuits', 'agave plant forms'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Passionate storytelling — heart first, then head, always with color',
            pacing: 'dynamic',
            emotionalArc: ['pride', 'community celebration', 'creative fire'],
            coreValues: ['familia', 'creative passion', 'cultural pride'],
            humorStyle: 'Colorful exaggeration, affectionate teasing, dramatic reveal',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['vibrant color accents', 'cultural pattern tech-wear', 'warm earth-tone base'],
        culturalCompanions: ['a colorful parrot', 'a wise jaguar cub'],
        expressionStyle: 'Warm, passionate, full-body expressiveness',
        colorInfluence: ['warm gold', 'tropical green', 'sunset orange', 'ocean blue'],
      },
      music: {
        genres: ['Latin fusion', 'tropical electronic', 'acoustic-modern blend'],
        instruments: ['guitar', 'percussion', 'trumpet', 'strings'],
        mood: ['joyful', 'passionate', 'warm'],
        bpmRange: [100, 135],
        samplePrompt: 'Latin fusion with acoustic guitar and percussion, tropical electronic textures, joyful and warm, cinematic quality',
      },
      visuals: {
        paletteKeywords: ['warm gold', 'tropical green', 'sunset', 'ocean blue'],
        lighting: 'Golden hour tropical warmth',
        environmentModifiers: ['colorful architecture', 'lush vegetation', 'open-air spaces'],
        motifs: ['floral', 'geometric', 'wave patterns'],
        animationEnergy: 'vibrant',
      },
      narrative: {
        storytellingStyle: 'Heart-first storytelling with rhythm and color',
        pacing: 'dynamic',
        emotionalArc: ['passion', 'community', 'celebration'],
        coreValues: ['family', 'creativity', 'warmth'],
        humorStyle: 'Warm, physical, story-driven',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // EUROPE
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'europe',
    regionName: 'Europe',
    subRegions: [
      {
        id: 'europe-nordic',
        name: 'Nordic',
        creative: {
          characters: {
            wardrobeModifiers: ['clean Scandinavian design wear', 'aurora-inspired gradient accents', 'hygge-cozy tech layers'],
            culturalCompanions: ['a snowy owl with aurora-lit eyes', 'a friendly Nordic fox with constellation fur patterns'],
            expressionStyle: 'Understated, calm confidence — less is more, every gesture intentional',
            colorInfluence: ['aurora green', 'ice blue', 'birch white', 'midnight indigo'],
          },
          music: {
            genres: ['Nordic ambient electronic', 'post-rock atmospheric', 'Scandinavian jazz'],
            instruments: ['nyckelharpa', 'hardanger fiddle', 'piano', 'atmospheric synths', 'choir pads'],
            mood: ['vast', 'serene', 'contemplative', 'quietly powerful'],
            bpmRange: [65, 100],
            samplePrompt: 'Nordic ambient electronic with nyckelharpa melody, vast atmospheric synths, aurora-inspired pads, contemplative and quietly powerful, Scandinavian cinematic quality',
          },
          visuals: {
            paletteKeywords: ['aurora green', 'ice blue', 'birch white', 'midnight indigo'],
            lighting: 'Northern light glow — soft, diffused, ethereal color washes',
            environmentModifiers: ['birch forest data centers', 'fjord-carved interfaces', 'minimalist glass architecture'],
            motifs: ['runic symbols', 'aurora waves', 'snowflake geometry', 'forest silhouettes'],
            animationEnergy: 'contemplative',
          },
          narrative: {
            storytellingStyle: 'Nordic noir meets hygge — tension through restraint, warmth through simplicity',
            pacing: 'slow-deliberate',
            emotionalArc: ['quiet discovery', 'understated brilliance', 'collective trust'],
            coreValues: ['lagom (balance)', 'trust', 'sustainability', 'equality'],
            humorStyle: 'Dry, deadpan, perfectly timed silence',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['clean modern design', 'subtle cultural accents', 'professional yet approachable'],
        culturalCompanions: ['a clever fox', 'a wise owl'],
        expressionStyle: 'Refined, clear, professional warmth',
        colorInfluence: ['blue', 'green', 'neutral tones', 'accent gold'],
      },
      music: {
        genres: ['European classical-electronic', 'ambient', 'modern orchestral'],
        instruments: ['piano', 'strings', 'synth', 'woodwinds'],
        mood: ['refined', 'innovative', 'sophisticated'],
        bpmRange: [80, 120],
        samplePrompt: 'Modern European orchestral-electronic fusion, refined and innovative, cinematic sophistication',
      },
      visuals: {
        paletteKeywords: ['blue', 'green', 'clean white', 'warm accent'],
        lighting: 'Clean European light with architectural shadows',
        environmentModifiers: ['historic-modern blend architecture', 'green tech spaces', 'open plazas'],
        motifs: ['classical geometry', 'art nouveau lines', 'modern minimal'],
        animationEnergy: 'balanced',
      },
      narrative: {
        storytellingStyle: 'Structured innovation — heritage supporting future vision',
        pacing: 'measured',
        emotionalArc: ['innovation', 'quality', 'collaboration'],
        coreValues: ['quality', 'innovation', 'sustainability'],
        humorStyle: 'Witty, cultured, self-aware',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // NORTH AMERICA
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'north-america',
    regionName: 'North America',
    subRegions: [],
    defaults: {
      characters: {
        wardrobeModifiers: ['Silicon Valley casual-cool', 'startup hoodie meets Pixar character design', 'sneaker-culture accents'],
        culturalCompanions: ['a raccoon with a tiny laptop', 'a bald eagle drone overhead', 'a golden retriever with a scrum board collar'],
        expressionStyle: 'Direct, energetic, TED-talk hands — confidence with relatability',
        colorInfluence: ['tech blue', 'startup green', 'warm orange', 'clean white'],
      },
      music: {
        genres: ['indie electronic', 'lo-fi hip-hop', 'cinematic Americana', 'tech-startup upbeat'],
        instruments: ['electric guitar', 'synth', 'finger snaps', 'ukulele', 'claps'],
        mood: ['optimistic', 'innovative', 'can-do energy', 'authentic'],
        bpmRange: [100, 135],
        samplePrompt: 'Upbeat indie electronic with clean synths, finger snaps, and lo-fi warmth, optimistic startup energy, authentic and innovative, cinematic American quality',
      },
      visuals: {
        paletteKeywords: ['tech blue', 'startup green', 'clean white', 'warm orange'],
        lighting: 'Clean California golden hour with modern LED accents',
        environmentModifiers: ['open-plan offices', 'coffee shops', 'garage startups', 'nature-tech fusion'],
        motifs: ['progress bars', 'rocket ships', 'mountain peaks', 'circuit paths'],
        animationEnergy: 'vibrant',
      },
      narrative: {
        storytellingStyle: 'Show-don\'t-tell — demo it, data it, ship it',
        pacing: 'dynamic',
        emotionalArc: ['build fast', 'fail forward', 'ship and celebrate'],
        coreValues: ['innovation', 'speed', 'authenticity', 'disruption'],
        humorStyle: 'Self-deprecating tech humor, meme-aware, relatable',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // AFRICA
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'africa',
    regionName: 'Africa',
    subRegions: [
      {
        id: 'africa-west',
        name: 'West Africa',
        creative: {
          characters: {
            wardrobeModifiers: ['Ankara print tech-wear', 'Kente cloth geometric accents', 'Adinkra symbol badges'],
            culturalCompanions: ['a wise tortoise telling stories (Anansi tradition)', 'a crowned crane with data-quill feathers'],
            expressionStyle: 'Storyteller warmth — full expression, community-facing, call-and-response energy',
            colorInfluence: ['Ankara gold', 'forest green', 'burnt sienna', 'indigo'],
          },
          music: {
            genres: ['Afrobeats', 'highlife modern', 'Afro-futurist electronic'],
            instruments: ['talking drum', 'shekere', 'balafon', 'kora', 'thumb piano'],
            mood: ['joyful', 'communal', 'rhythmic confidence', 'celebratory'],
            bpmRange: [105, 140],
            samplePrompt: 'Modern Afrobeats with talking drum and kora, highlife guitar licks, Afro-futurist electronic production, joyful communal energy, rhythmic confidence, cinematic quality',
          },
          visuals: {
            paletteKeywords: ['Ankara gold', 'forest green', 'burnt sienna', 'indigo'],
            lighting: 'Warm African sun with dramatic cloud shadow patterns',
            environmentModifiers: ['baobab tree servers', 'Ankara-patterned interfaces', 'open-air tech markets'],
            motifs: ['Adinkra symbols', 'Kente geometry', 'baobab silhouettes', 'cowrie shell data tokens'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Griot tradition — oral storytelling, wisdom through narrative, community witness',
            pacing: 'dynamic',
            emotionalArc: ['collective wisdom', 'joyful innovation', 'ubuntu (I am because we are)'],
            coreValues: ['ubuntu', 'community', 'oral tradition', 'leapfrog innovation'],
            humorStyle: 'Story-within-a-story, proverb punchlines, community laughter',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['vibrant textile patterns', 'earth-tone tech-wear', 'cultural jewelry accents'],
        culturalCompanions: ['a wise tortoise', 'a crowned crane', 'a lion cub'],
        expressionStyle: 'Warm, community-oriented, storyteller energy',
        colorInfluence: ['warm gold', 'earth tones', 'sunset orange', 'deep green'],
      },
      music: {
        genres: ['Afrobeats fusion', 'African orchestral', 'desert blues'],
        instruments: ['kora', 'djembe', 'talking drum', 'thumb piano'],
        mood: ['communal', 'rhythmic', 'warm', 'powerful'],
        bpmRange: [100, 135],
        samplePrompt: 'African fusion with kora and djembe, Afrobeats rhythm, warm communal energy, powerful and cinematic',
      },
      visuals: {
        paletteKeywords: ['warm gold', 'earth tones', 'sunset', 'deep green'],
        lighting: 'African golden hour with dramatic shadows',
        environmentModifiers: ['natural landscapes', 'vibrant markets', 'modern tech hubs'],
        motifs: ['geometric patterns', 'natural forms', 'tribal art'],
        animationEnergy: 'vibrant',
      },
      narrative: {
        storytellingStyle: 'Ubuntu storytelling — community wisdom, collective success',
        pacing: 'dynamic',
        emotionalArc: ['community', 'innovation', 'celebration'],
        coreValues: ['ubuntu', 'community', 'innovation'],
        humorStyle: 'Proverb-based, warm, story-driven',
      },
    },
  },
];

// ─── PROMPT ENRICHMENT ENGINE ────────────────────────────────────────────────

/**
 * Enriches any Genie Cast prompt (character, music, video, image) with
 * cultural and emotional intelligence based on the selected region.
 */
export function enrichPromptWithRegion(
  basePrompt: string,
  regionId: string,
  subRegionId?: string,
  enrichmentType: 'character' | 'music' | 'visual' | 'narrative' = 'visual'
): string {
  const profile = REGIONAL_CREATIVE_PROFILES.find(r => r.regionId === regionId);
  if (!profile) return basePrompt;

  const creative = subRegionId
    ? profile.subRegions.find(s => s.id === subRegionId)?.creative ?? profile.defaults
    : profile.defaults;

  switch (enrichmentType) {
    case 'character':
      return `${basePrompt}, ${creative.characters.wardrobeModifiers.join(', ')}, ${creative.characters.expressionStyle}, color palette: ${creative.characters.colorInfluence.join('/')}, accompanied by ${creative.characters.culturalCompanions[0]}`;

    case 'music':
      return `${basePrompt}, ${creative.music.genres.join(' and ')}, featuring ${creative.music.instruments.slice(0, 3).join(', ')}, mood: ${creative.music.mood.join(', ')}, ${creative.music.bpmRange[0]}-${creative.music.bpmRange[1]} BPM`;

    case 'visual':
      return `${basePrompt}, color palette: ${creative.visuals.paletteKeywords.join(', ')}, ${creative.visuals.lighting}, motifs: ${creative.visuals.motifs.join(', ')}, ${creative.visuals.environmentModifiers[0]}`;

    case 'narrative':
      return `${basePrompt}, storytelling style: ${creative.narrative.storytellingStyle}, emotional arc: ${creative.narrative.emotionalArc.join(' → ')}, pacing: ${creative.narrative.pacing}, humor: ${creative.narrative.humorStyle}`;

    default:
      return basePrompt;
  }
}

/**
 * Gets a region-specific music prompt for ElevenLabs music generation.
 */
export function getRegionalMusicPrompt(
  sceneContext: string,
  regionId: string,
  subRegionId?: string
): string {
  const profile = REGIONAL_CREATIVE_PROFILES.find(r => r.regionId === regionId);
  if (!profile) return `Background music for: ${sceneContext}`;

  const creative = subRegionId
    ? profile.subRegions.find(s => s.id === subRegionId)?.creative ?? profile.defaults
    : profile.defaults;

  return `${sceneContext}, ${creative.music.genres[0]} style, featuring ${creative.music.instruments.slice(0, 2).join(' and ')}, ${creative.music.mood.slice(0, 2).join(' and ')} mood, ${creative.music.bpmRange[0]}-${creative.music.bpmRange[1]} BPM, cinematic production quality`;
}

/**
 * Gets the full creative direction set for a region.
 */
export function getRegionalCreativeDirection(
  regionId: string,
  subRegionId?: string
): CreativeDirectionSet | null {
  const profile = REGIONAL_CREATIVE_PROFILES.find(r => r.regionId === regionId);
  if (!profile) return null;

  if (subRegionId) {
    return profile.subRegions.find(s => s.id === subRegionId)?.creative ?? profile.defaults;
  }
  return profile.defaults;
}
