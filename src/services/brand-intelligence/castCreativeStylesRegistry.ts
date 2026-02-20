/**
 * Cast Creative Styles Registry
 *
 * Every animation/character/visual style available for video production.
 * Includes Pixar 3D, Disney 2D, Anime, regional fiction characters,
 * cultural humor patterns, and lip-sync configuration.
 *
 * Each style has regional variants — a Pixar-style character in India
 * looks and behaves differently from one in Japan or Nigeria.
 *
 * Also serves as the enrichment layer for Lovable's regional creative config —
 * `enrichPromptWithRegion()` and `getRegionalMusicPrompt()` live here.
 */

// ─── Style Family Definitions ────────────────────────────────────────────────

export type CreativeStyleFamily =
  | 'pixar_3d'              // Pixar-like 3D animation — expressive, detailed, cinematic lighting
  | 'disney_2d'             // Disney classic 2D — hand-drawn feel, fluid motion, musical
  | 'disney_3d'             // Disney 3D (Frozen/Moana style) — stylized 3D, emotional
  | 'anime'                 // Japanese anime — multiple sub-styles (shonen, studio ghibli, chibi)
  | 'cartoon_classic'       // Looney Tunes / Tom & Jerry — exaggerated, slapstick, rubber hose
  | 'motion_graphics'       // Clean infographic-style animation — data, charts, icons
  | 'whiteboard'            // Whiteboard explainer — hand-drawing style
  | 'stop_motion'           // Claymation / stop-motion aesthetic
  | 'comic_book'            // Marvel/DC comic panel style — bold lines, action frames
  | 'watercolor'            // Soft watercolor illustration in motion
  | 'flat_design'           // Minimal flat illustration — Google/Apple style
  | 'realistic_avatar'      // Photorealistic AI avatar — talking head
  | 'cultural_illustration' // Region-specific art style (Madhubani, Ankara, Ukiyo-e, etc.)
  | 'retro_vintage'         // 80s/90s retro aesthetic
  | 'cyberpunk'             // Neon, dark, futuristic
  | 'documentary'           // Documentary-style — real footage + overlays
  | 'mixed_media';          // Combination of live action + animation

export type AnimeSubStyle =
  | 'studio_ghibli'    // Miyazaki — warm, nature, magical realism
  | 'shonen'           // Dragon Ball / Naruto — action, energy, speed lines
  | 'shojo'            // Sailor Moon — romantic, sparkles, emotional
  | 'chibi'            // Super deformed, cute, comedic
  | 'cyberpunk_anime'  // Akira / Ghost in the Shell — dark, tech
  | 'slice_of_life';   // Calm, everyday, relatable

// ─── Character Types ─────────────────────────────────────────────────────────

export type CharacterType =
  | 'human_realistic'       // Photorealistic human avatar
  | 'human_stylized'        // Stylized human (Pixar/Disney proportions)
  | 'animal_anthropomorphic' // Animals with human traits (Zootopia style)
  | 'mascot'                // Brand mascot character
  | 'mythical_creature'     // Dragons, phoenixes, cultural myths
  | 'robot_ai'              // Robot/AI assistant character
  | 'chibi'                 // Super-deformed cute character
  | 'cultural_figure'       // Regional cultural figures (generic, not specific people)
  | 'abstract_shape'        // Abstract shapes with personality (Inside Out style)
  | 'narrator_only';        // No visible character — voice only

export interface CharacterDesign {
  id: string;
  name: string;
  type: CharacterType;
  style: CreativeStyleFamily;
  description: string;

  // Appearance
  appearance: {
    bodyType: 'standard' | 'chibi' | 'tall_slim' | 'stout' | 'muscular' | 'elderly';
    skinTone: string;              // Adaptive per region
    hairStyle: string;
    clothing: string;              // Region/culture appropriate
    accessories: string[];         // Cultural accessories
    distinguishingFeatures: string[];
  };

  // Expression range
  expressions: {
    neutral: string;               // Prompt modifier for neutral face
    happy: string;
    excited: string;
    thinking: string;
    surprised: string;
    concerned: string;
    laughing: string;
    proud: string;
    confused: string;
  };

  // Animation capabilities
  animation: {
    lipSyncCapable: boolean;
    fullBodyCapable: boolean;
    supportedActions: string[];    // 'talking', 'pointing', 'walking', 'dancing', 'cooking', etc.
    motionStyle: string;           // 'bouncy', 'smooth', 'snappy', 'floaty'
  };

  // Cultural adaptation
  culturalAdaptation: {
    regionCode: string;
    wardrobeVariant: string;       // Region-specific clothing
    companionCreature?: string;    // Cultural mascot/animal
    gestureModifiers: string[];    // Region-appropriate gestures
    avoidGestures: string[];       // Culturally inappropriate gestures
  };

  // Generation config
  generationConfig: {
    primaryProvider: string;        // 'meshy', 'alibaba', 'flux'
    promptPrefix: string;           // Style-specific prompt prefix
    negativePrompt: string;         // What to avoid
    referenceImageUrl?: string;
    consistencyToken?: string;      // For maintaining character consistency across scenes
  };
}

// ─── Creative Style Profiles ─────────────────────────────────────────────────

export interface CreativeStyleProfile {
  id: string;
  family: CreativeStyleFamily;
  name: string;
  description: string;
  inspiration: string;                // "Inspired by Pixar's Inside Out"

  // Visual spec
  visual: {
    colorPalette: string[];
    lightingStyle: string;           // 'warm_studio', 'cinematic_dramatic', 'flat_bright'
    backgroundStyle: string;         // 'detailed_environment', 'gradient_simple', 'blurred_bokeh'
    outlineStyle: 'none' | 'thin' | 'bold' | 'sketchy';
    textureDetail: 1 | 2 | 3 | 4 | 5;  // 1=flat, 5=hyper-detailed
    renderQuality: string;
  };

  // Motion spec
  motion: {
    fps: 24 | 30 | 60;
    motionStyle: 'smooth' | 'snappy' | 'bouncy' | 'cinematic' | 'hand_drawn';
    cameraWork: string;              // 'static', 'dynamic_orbit', 'documentary_handheld'
    transitionStyle: string;         // 'clean_cuts', 'whip_pan', 'morph', 'match_cut'
    particleEffects: boolean;
    physicsSimulation: boolean;
  };

  // Audio pairing
  audio: {
    musicGenre: string;
    musicBPM: { min: number; max: number };
    musicMood: string;
    musicInstruments: string[];
    sfxStyle: string;                // 'realistic', 'cartoon_exaggerated', 'subtle', 'none'
    voiceStyle: string;              // 'warm_narrator', 'character_voices', 'documentary'
  };

  // Humor style
  humor: {
    humorType: HumorType;
    exaggerationLevel: 1 | 2 | 3 | 4 | 5;  // 1=subtle, 5=slapstick
    timingStyle: string;             // 'deadpan', 'quick_wit', 'slow_burn', 'physical'
    appropriateFor: string[];        // Audience types
  };

  // Prompt engineering
  promptConfig: {
    stylePrefix: string;             // Prepend to all image/video gen prompts
    qualityModifiers: string;        // 'masterpiece, best quality, 8k, raytracing'
    negativePrompt: string;
    provider: string;
    modelPreference: string;
  };

  // Regional variants
  regionalVariants: Record<string, RegionalStyleVariant>;
}

export interface RegionalStyleVariant {
  regionCode: string;
  regionName: string;

  // Visual overrides
  colorOverrides?: string[];         // Region-specific color preferences
  lightingOverride?: string;         // 'golden_hour_tropical', 'overcast_london'
  environmentStyle: string;          // 'bustling_indian_market', 'serene_japanese_garden'

  // Character wardrobe
  wardrobe: {
    traditional: string;             // Traditional clothing description
    modern: string;                  // Modern/casual clothing
    business: string;                // Business attire
  };

  // Companion creature
  companionCreature?: {
    name: string;
    species: string;
    description: string;
    culturalSignificance: string;
  };

  // Cultural elements
  culturalElements: {
    architecture: string;
    vegetation: string;
    patterns: string;                // 'paisley', 'geometric_islamic', 'kente_cloth'
    symbolism: string[];
    avoidSymbols: string[];          // Culturally inappropriate
  };

  // Music
  music: {
    genre: string;
    instruments: string[];
    bpmRange: { min: number; max: number };
    moodDescription: string;
  };

  // Narrative style
  narrative: {
    storytellingApproach: string;    // 'direct', 'parable', 'call_response', 'poetic'
    humorStyle: string;              // 'wordplay', 'situational', 'slapstick', 'self_deprecating'
    formalityLevel: 1 | 2 | 3 | 4 | 5;
    emotionalTone: string;
  };
}

export type HumorType =
  | 'wordplay'           // Puns, double meanings — works in CJK, European languages
  | 'situational'        // Relatable everyday situations — universal
  | 'slapstick'          // Physical comedy — exaggerated falls, reactions (Pixar/Disney)
  | 'self_deprecating'   // Self-aware humor — popular in UK, Australia, Japan
  | 'observational'      // "Have you noticed..." — Jerry Seinfeld style
  | 'absurdist'          // Random, surreal — popular with younger audiences
  | 'cultural_reference' // References to local culture, food, habits — highly regional
  | 'none';              // Professional tone, no humor

// ─── Pre-built Style Profiles ────────────────────────────────────────────────

export const CREATIVE_STYLES: CreativeStyleProfile[] = [
  {
    id: 'pixar_3d_universal',
    family: 'pixar_3d',
    name: 'Pixar 3D Universal',
    description: 'Pixar-inspired 3D animation — expressive characters, rich environments, cinematic lighting. Think Inside Out meets your brand.',
    inspiration: 'Pixar Animation Studios (Inside Out, Coco, Soul, Ratatouille)',
    visual: {
      colorPalette: ['#4A90D9', '#F5A623', '#D0021B', '#7ED321', '#BD10E0'],
      lightingStyle: 'warm_studio_with_dramatic_accents',
      backgroundStyle: 'detailed_3d_environment',
      outlineStyle: 'none',
      textureDetail: 5,
      renderQuality: 'ray_traced_global_illumination',
    },
    motion: {
      fps: 24,
      motionStyle: 'bouncy',
      cameraWork: 'cinematic_with_rack_focus',
      transitionStyle: 'match_cut_and_morph',
      particleEffects: true,
      physicsSimulation: true,
    },
    audio: {
      musicGenre: 'orchestral_with_whimsy',
      musicBPM: { min: 100, max: 140 },
      musicMood: 'hopeful and adventurous with emotional depth',
      musicInstruments: ['orchestra', 'piano', 'xylophone', 'french_horn'],
      sfxStyle: 'cartoon_exaggerated',
      voiceStyle: 'character_voices_with_personality',
    },
    humor: {
      humorType: 'situational',
      exaggerationLevel: 4,
      timingStyle: 'quick_wit',
      appropriateFor: ['all_ages', 'family', 'business_casual'],
    },
    promptConfig: {
      stylePrefix: 'pixar style 3D animation, expressive character design, subsurface scattering skin, detailed eyes with reflections, studio quality lighting, depth of field',
      qualityModifiers: 'masterpiece, best quality, 8k render, ray tracing, global illumination, subsurface scattering',
      negativePrompt: 'realistic, photographic, uncanny valley, low poly, flat shading, anime style',
      provider: 'meshy',
      modelPreference: 'meshy-4',
    },
    regionalVariants: {
      'INDIA_NORTH': {
        regionCode: 'INDIA_NORTH',
        regionName: 'North India',
        colorOverrides: ['#FF6B00', '#FFD700', '#8B0000', '#228B22'],
        lightingOverride: 'warm_golden_diwali_glow',
        environmentStyle: 'vibrant north indian marketplace with marigold garlands, colorful fabrics, and chai stalls',
        wardrobe: {
          traditional: 'kurta pajama with Nehru vest, women in salwar kameez with dupatta',
          modern: 'jeans and kurta combo, sneakers',
          business: 'formal kurta with churidar, or western suit',
        },
        companionCreature: {
          name: 'Mitthu',
          species: 'Indian Parrot (Tota)',
          description: 'Bright green parrot with red beak, wise-cracking, sits on shoulder',
          culturalSignificance: 'Parrots symbolize wisdom and communication in Indian culture',
        },
        culturalElements: {
          architecture: 'jharokha windows, colorful havelis, temple spires',
          vegetation: 'banyan trees, marigold flowers, mango trees, tulsi plant',
          patterns: 'paisley, block print, bandhani tie-dye, Mughal jali lattice',
          symbolism: ['namaste gesture', 'tilak on forehead', 'rangoli on floor', 'diya lamps'],
          avoidSymbols: ['shoes near sacred spaces', 'left hand for giving'],
        },
        music: {
          genre: 'Bollywood-orchestral fusion',
          instruments: ['tabla', 'sitar', 'flute (bansuri)', 'harmonium', 'dholak'],
          bpmRange: { min: 110, max: 150 },
          moodDescription: 'energetic and celebratory with melodic hooks, like a Bollywood dance number meets corporate confidence',
        },
        narrative: {
          storytellingApproach: 'parable_with_family_wisdom',
          humorStyle: 'situational with chai-shop philosophy',
          formalityLevel: 3,
          emotionalTone: 'warm, family-oriented, aspirational',
        },
      },

      'INDIA_SOUTH': {
        regionCode: 'INDIA_SOUTH',
        regionName: 'South India',
        colorOverrides: ['#8B4513', '#FFD700', '#006400', '#FF4500'],
        lightingOverride: 'warm_tropical_temple_glow',
        environmentStyle: 'lush south indian landscape with coconut palms, temple gopurams, and banana leaf meals',
        wardrobe: {
          traditional: 'veshti/dhoti with angavastram for men, silk saree with temple jewelry for women',
          modern: 'casual cotton kurta, lungi casual at home',
          business: 'formal saree or western suit with subtle silk accents',
        },
        companionCreature: {
          name: 'Gaja',
          species: 'Baby Elephant',
          description: 'Small decorated elephant calf, gentle and wise, with painted forehead',
          culturalSignificance: 'Elephants are auspicious in South Indian temple culture',
        },
        culturalElements: {
          architecture: 'dravidian temple gopurams, laterite stone houses, tiled roofs',
          vegetation: 'coconut palms, banana plants, jasmine, lotus ponds',
          patterns: 'kolam floor designs, temple pillar carvings, Kanchipuram silk weave',
          symbolism: ['kolam at doorstep', 'brass oil lamps', 'banana leaf meals', 'jasmine in hair'],
          avoidSymbols: ['beef references', 'shoes in temple'],
        },
        music: {
          genre: 'Carnatic-cinematic fusion',
          instruments: ['veena', 'mridangam', 'violin (Carnatic style)', 'nadaswaram', 'ghatam'],
          bpmRange: { min: 90, max: 130 },
          moodDescription: 'rhythmic and meditative with sudden bursts of energy, like a Carnatic composition meets tech startup energy',
        },
        narrative: {
          storytellingApproach: 'logical_progression_with_cultural_depth',
          humorStyle: 'self-deprecating and witty',
          formalityLevel: 3,
          emotionalTone: 'intellectual, warm, culturally proud',
        },
      },

      'MENA_GULF': {
        regionCode: 'MENA_GULF',
        regionName: 'Gulf (UAE, Saudi, Qatar)',
        colorOverrides: ['#C5A55A', '#1B4B6B', '#FFFFFF', '#006233'],
        lightingOverride: 'golden_desert_sunset_luxury',
        environmentStyle: 'modern dubai skyline blending with traditional arabic architecture, geometric patterns',
        wardrobe: {
          traditional: 'thobe/dishdasha with ghutra headwear for men, abaya with elegant embroidery for women',
          modern: 'designer thobe with modern cuts, luxury casual',
          business: 'formal thobe or western suit with arabic touches',
        },
        companionCreature: {
          name: 'Saqi',
          species: 'Arabian Falcon (Saqr)',
          description: 'Majestic falcon with golden hood, perched on arm, symbol of heritage and vision',
          culturalSignificance: 'Falconry is the national sport and symbol of Gulf heritage',
        },
        culturalElements: {
          architecture: 'mashrabiya screens, islamic geometric arches, wind towers, modern glass towers',
          vegetation: 'date palms, desert roses, oasis gardens',
          patterns: 'islamic geometric tessellation, arabesque, calligraphy art',
          symbolism: ['coffee pot (dallah)', 'incense (oud/bukhoor)', 'crescent moon', 'palm tree'],
          avoidSymbols: ['alcohol imagery', 'pork references', 'inappropriate dress'],
        },
        music: {
          genre: 'Arabic-electronic fusion with oud',
          instruments: ['oud', 'qanun', 'ney flute', 'darbuka', 'electronic beats'],
          bpmRange: { min: 95, max: 125 },
          moodDescription: 'luxurious and sophisticated with desert mystique, blending heritage with futurism',
        },
        narrative: {
          storytellingApproach: 'vision_and_ambition_focused',
          humorStyle: 'light and respectful',
          formalityLevel: 4,
          emotionalTone: 'prestigious, visionary, hospitality-focused',
        },
      },

      'AFRICA_WEST': {
        regionCode: 'AFRICA_WEST',
        regionName: 'West Africa (Nigeria, Ghana)',
        colorOverrides: ['#008751', '#FFD700', '#E63946', '#FF6B35'],
        lightingOverride: 'vibrant_tropical_sunset',
        environmentStyle: 'bustling lagos/accra street scene with vibrant market colors, palm trees, and energetic crowds',
        wardrobe: {
          traditional: 'agbada/babariga for men, aso oke/ankara wrapper for women, gele headwrap',
          modern: 'ankara-print shirt with jeans, casual streetwear',
          business: 'senator style or corporate ankara suit',
        },
        companionCreature: {
          name: 'Anansi',
          species: 'Wise Spider',
          description: 'Colorful spider with kente-cloth pattern, clever and humorous, web-spinning storyteller',
          culturalSignificance: 'Anansi the Spider is the greatest storyteller in West African folklore',
        },
        culturalElements: {
          architecture: 'painted compound walls, zinc roofs, modern highrise mixed with traditional',
          vegetation: 'palm trees, tropical flowers, bougainvillea',
          patterns: 'kente cloth, ankara/wax print, adinkra symbols, beadwork',
          symbolism: ['gye nyame (God\'s supremacy)', 'sankofa bird', 'kola nut hospitality', 'palm wine gourd'],
          avoidSymbols: ['juju/voodoo stereotypes', 'poverty porn imagery'],
        },
        music: {
          genre: 'Afrobeats with highlife influences',
          instruments: ['talking drum', 'shekere', 'agogo bell', 'synth bass', 'guitar'],
          bpmRange: { min: 105, max: 130 },
          moodDescription: 'infectious afrobeats energy, confident swagger, warm community vibes',
        },
        narrative: {
          storytellingApproach: 'call_and_response_communal',
          humorStyle: 'sharp observational with cultural references',
          formalityLevel: 2,
          emotionalTone: 'bold, proud, communal, aspirational',
        },
      },

      'CJK_JP': {
        regionCode: 'CJK_JP',
        regionName: 'Japan',
        colorOverrides: ['#BC002D', '#FFFFFF', '#000000', '#FFB7C5'],
        lightingOverride: 'soft_anime_bloom_with_sakura',
        environmentStyle: 'tokyo cityscape at night blending with serene temple gardens, cherry blossoms',
        wardrobe: {
          traditional: 'kimono with obi for formal, yukata for casual/summer',
          modern: 'harajuku street fashion or clean minimalist',
          business: 'dark suit with subtle pocket square, restrained elegance',
        },
        companionCreature: {
          name: 'Kitsune',
          species: 'Fox Spirit',
          description: 'Small fox with glowing tail, mischievous but wise, shifting between cute and mysterious',
          culturalSignificance: 'Kitsune are shapeshifting fox spirits in Japanese folklore, associated with wisdom',
        },
        culturalElements: {
          architecture: 'torii gates, zen garden, modern tokyo glass, traditional machiya',
          vegetation: 'cherry blossoms (sakura), bamboo, bonsai, maple (momiji)',
          patterns: 'seigaiha waves, asanoha hemp leaf, sakura motifs, uroko scales',
          symbolism: ['torii gate', 'daruma doll', 'origami crane', 'enso circle'],
          avoidSymbols: ['number 4 prominently', 'white chrysanthemum (funeral)'],
        },
        music: {
          genre: 'J-Pop meets orchestral with shamisen',
          instruments: ['shamisen', 'koto', 'taiko drum', 'shakuhachi', 'synth'],
          bpmRange: { min: 100, max: 145 },
          moodDescription: 'precise and polished with emotional depth, balancing kawaii energy with zen minimalism',
        },
        narrative: {
          storytellingApproach: 'subtle_and_refined',
          humorStyle: 'self-deprecating and absurdist (tsukkomi-boke)',
          formalityLevel: 4,
          emotionalTone: 'respectful, precise, with hidden warmth',
        },
      },

      'LATAM_MEXICO': {
        regionCode: 'LATAM_MEXICO',
        regionName: 'Mexico & Central America',
        colorOverrides: ['#006847', '#CE1126', '#FFD700', '#FF6B00'],
        lightingOverride: 'warm_golden_fiesta_lighting',
        environmentStyle: 'colorful mexican street with papel picado banners, colonial architecture, and vibrant market stalls',
        wardrobe: {
          traditional: 'guayabera for men, huipil or rebozo for women',
          modern: 'casual with colorful accents, huarache sandals',
          business: 'smart casual with cultural touches',
        },
        companionCreature: {
          name: 'Pepita',
          species: 'Alebrije (Spirit Animal)',
          description: 'Colorful fantastical creature — part jaguar, part eagle, part lizard — with vibrant painted patterns',
          culturalSignificance: 'Alebrijes are spirit guides in Mexican folklore, popularized by Pixar\'s Coco',
        },
        culturalElements: {
          architecture: 'colonial churches, zocalo plazas, painted concrete, mercado stalls',
          vegetation: 'cacti, agave, bougainvillea, tropical flowers',
          patterns: 'otomi embroidery, huichol beadwork, talavera tile, papel picado',
          symbolism: ['sugar skull (calavera)', 'marigold (cempasúchil)', 'eagle and serpent', 'Virgin of Guadalupe'],
          avoidSymbols: ['narco references', 'stereotypical sombrero/poncho cliches'],
        },
        music: {
          genre: 'Regional Mexican fusion with modern beats',
          instruments: ['mariachi trumpet', 'guitarrón', 'vihuela', 'accordion', 'marimba'],
          bpmRange: { min: 100, max: 140 },
          moodDescription: 'festive and passionate with deep emotional currents, from mariachi pride to cumbia joy',
        },
        narrative: {
          storytellingApproach: 'passionate_family_centered',
          humorStyle: 'albur wordplay and situational comedy',
          formalityLevel: 2,
          emotionalTone: 'warm, passionate, family-proud, celebratory',
        },
      },

      'SEA_MALAY': {
        regionCode: 'SEA_MALAY',
        regionName: 'Malaysia & Indonesia',
        colorOverrides: ['#006400', '#FFD700', '#8B4513', '#FF4500'],
        lightingOverride: 'warm_tropical_market_glow',
        environmentStyle: 'bustling SEA market with batik fabrics, tropical fruit stalls, and kampung houses among modern towers',
        wardrobe: {
          traditional: 'batik shirt for men, kebaya with sarong for women, songkok/kopiah cap',
          modern: 'casual tropical — batik-print modern shirts',
          business: 'batik formal shirt (Malaysian national attire for business)',
        },
        companionCreature: {
          name: 'Naga',
          species: 'Friendly Naga Dragon',
          description: 'Small serpentine dragon with golden scales, playful, associated with water and prosperity',
          culturalSignificance: 'Naga dragons appear in Malay and Indonesian mythology as protectors',
        },
        culturalElements: {
          architecture: 'kampung houses on stilts, minaret domes, shophouse rows',
          vegetation: 'coconut palms, frangipani, durian trees, rice paddies',
          patterns: 'batik (parang, kawung, mega mendung), songket weave, wayang kulit shadow puppet',
          symbolism: ['batik pattern', 'rice paddy', 'wayang puppet', 'kris dagger (ceremonial)'],
          avoidSymbols: ['pork/alcohol in Muslim contexts', 'left hand for giving'],
        },
        music: {
          genre: 'Gamelan meets modern pop',
          instruments: ['gamelan', 'angklung', 'rebab', 'kendang drum', 'suling flute'],
          bpmRange: { min: 90, max: 120 },
          moodDescription: 'warm and welcoming with rhythmic gamelan undercurrent, tropical ease with entrepreneurial spirit',
        },
        narrative: {
          storytellingApproach: 'communal_and_harmonious',
          humorStyle: 'gentle situational with food references',
          formalityLevel: 3,
          emotionalTone: 'warm, communal, respectful, harmonious',
        },
      },

      'NAM_US': {
        regionCode: 'NAM_US',
        regionName: 'United States',
        colorOverrides: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        lightingOverride: 'clean_modern_studio',
        environmentStyle: 'modern silicon valley campus or diverse american street scene',
        wardrobe: {
          traditional: 'casual americana — jeans, flannel, varied cultural backgrounds',
          modern: 'tech casual — hoodie, sneakers, diverse fashion',
          business: 'business casual — blazer without tie, or full corporate',
        },
        companionCreature: {
          name: 'Chip',
          species: 'Robot Dog',
          description: 'Friendly robot dog companion — sleek, modern, loyal, with holographic displays',
          culturalSignificance: 'Tech innovation companion — represents American innovation culture',
        },
        culturalElements: {
          architecture: 'glass office buildings, suburban homes, diverse urban landscapes',
          vegetation: 'varied — oak trees, modern landscaping, rooftop gardens',
          patterns: 'geometric modern, tech-inspired grids, clean lines',
          symbolism: ['innovation lightbulb', 'diverse team', 'startup garage', 'scaling graph'],
          avoidSymbols: ['political divisive imagery'],
        },
        music: {
          genre: 'Indie pop meets corporate uplift',
          instruments: ['acoustic guitar', 'synth pad', 'claps', 'ukulele', 'whistle hook'],
          bpmRange: { min: 110, max: 135 },
          moodDescription: 'upbeat, optimistic, "everything is possible" energy with clean production',
        },
        narrative: {
          storytellingApproach: 'direct_benefit_focused',
          humorStyle: 'quick observational and self-aware',
          formalityLevel: 2,
          emotionalTone: 'optimistic, diverse, innovative, can-do',
        },
      },

      'AFRICA_EAST': {
        regionCode: 'AFRICA_EAST',
        regionName: 'East Africa (Kenya, Tanzania)',
        colorOverrides: ['#006B3F', '#BB0000', '#000000', '#FFD700'],
        lightingOverride: 'savanna_golden_hour',
        environmentStyle: 'nairobi tech hub meets savanna landscape with acacia trees and modern skyline',
        wardrobe: {
          traditional: 'kikoy wrap, maasai-inspired beadwork, kanzu for formal',
          modern: 'smart casual with local prints, tech startup style',
          business: 'suit with Kenyan-flag lapel pin or subtle local textile accent',
        },
        companionCreature: {
          name: 'Twiga',
          species: 'Baby Giraffe',
          description: 'Small friendly giraffe with wise eyes and gentle manner, long neck for seeing far ahead',
          culturalSignificance: 'The giraffe represents foresight and vision in East African symbolism',
        },
        culturalElements: {
          architecture: 'modern Nairobi buildings, traditional boma, safari lodge style',
          vegetation: 'acacia trees, savanna grass, baobab, coffee plants, tea gardens',
          patterns: 'maasai beadwork, kanga prints, kiondo weave patterns',
          symbolism: ['M-Pesa mobile money', 'safari sunrise', 'uhuru torch', 'communal gathering'],
          avoidSymbols: ['poverty stereotypes', 'war imagery', 'tribalism references'],
        },
        music: {
          genre: 'Bongo Flava meets Benga',
          instruments: ['nyatiti', 'djembe', 'electronic beats', 'guitar', 'brass section'],
          bpmRange: { min: 100, max: 125 },
          moodDescription: 'warm savanna energy with tech hub ambition, community strength meets innovation',
        },
        narrative: {
          storytellingApproach: 'communal_with_ubuntu_spirit',
          humorStyle: 'gentle and community-oriented',
          formalityLevel: 3,
          emotionalTone: 'aspirational, communal, resilient, tech-forward',
        },
      },
    },
  },

  {
    id: 'disney_2d_universal',
    family: 'disney_2d',
    name: 'Disney 2D Classic',
    description: 'Disney hand-drawn animation feel — flowing movements, musical quality, emotional storytelling',
    inspiration: 'Disney (Aladdin, Lion King, Moana, Encanto)',
    visual: {
      colorPalette: ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3B1F2B'],
      lightingStyle: 'theatrical_with_dramatic_shadows',
      backgroundStyle: 'painterly_detailed_backgrounds',
      outlineStyle: 'thin',
      textureDetail: 4,
      renderQuality: 'hand_drawn_digital_composite',
    },
    motion: {
      fps: 24,
      motionStyle: 'smooth',
      cameraWork: 'multiplane_parallax',
      transitionStyle: 'musical_transition_and_wipe',
      particleEffects: true,
      physicsSimulation: false,
    },
    audio: {
      musicGenre: 'broadway_musical_cinematic',
      musicBPM: { min: 80, max: 150 },
      musicMood: 'emotional storytelling with musical crescendos and character themes',
      musicInstruments: ['full_orchestra', 'piano', 'choir', 'ethnic_instruments'],
      sfxStyle: 'cartoon_exaggerated',
      voiceStyle: 'character_voices_with_singing',
    },
    humor: {
      humorType: 'situational',
      exaggerationLevel: 3,
      timingStyle: 'quick_wit',
      appropriateFor: ['all_ages', 'family'],
    },
    promptConfig: {
      stylePrefix: 'disney 2D animation style, hand-drawn look, expressive linework, watercolor backgrounds, theatrical lighting, flowing animation',
      qualityModifiers: 'masterpiece, disney quality, hand-drawn, cel-shaded, detailed backgrounds',
      negativePrompt: '3D render, photorealistic, anime style, low quality, blurry',
      provider: 'flux',
      modelPreference: 'flux-1.1-pro',
    },
    regionalVariants: {},
  },

  {
    id: 'anime_universal',
    family: 'anime',
    name: 'Anime Universal',
    description: 'Japanese anime style — multiple sub-styles from Ghibli warmth to Shonen energy',
    inspiration: 'Studio Ghibli, Makoto Shinkai, Shonen Jump, Kyoto Animation',
    visual: {
      colorPalette: ['#FF6B9D', '#C44AFF', '#0099FF', '#FFD93D', '#FF4D4D'],
      lightingStyle: 'dramatic_with_bloom_and_lens_flare',
      backgroundStyle: 'detailed_painted_backgrounds_with_atmospheric_depth',
      outlineStyle: 'bold',
      textureDetail: 3,
      renderQuality: 'cel_shaded_with_post_processing',
    },
    motion: {
      fps: 24,
      motionStyle: 'snappy',
      cameraWork: 'dynamic_with_speed_lines',
      transitionStyle: 'whip_pan_and_dramatic_zoom',
      particleEffects: true,
      physicsSimulation: false,
    },
    audio: {
      musicGenre: 'j_pop_rock_orchestral',
      musicBPM: { min: 120, max: 170 },
      musicMood: 'dramatic and emotional with high energy peaks and tender valleys',
      musicInstruments: ['electric_guitar', 'piano', 'strings', 'synth', 'drums'],
      sfxStyle: 'anime_stylized',
      voiceStyle: 'anime_voice_acting',
    },
    humor: {
      humorType: 'absurdist',
      exaggerationLevel: 5,
      timingStyle: 'quick_wit',
      appropriateFor: ['youth', 'tech_savvy', 'creative'],
    },
    promptConfig: {
      stylePrefix: 'anime style, detailed cel-shading, expressive eyes, dynamic pose, atmospheric lighting, detailed background art',
      qualityModifiers: 'masterpiece, best quality, anime key visual, detailed, vibrant colors',
      negativePrompt: '3D render, photorealistic, western cartoon, low quality, deformed',
      provider: 'flux',
      modelPreference: 'flux-1.1-pro',
    },
    regionalVariants: {},
  },
];

// ─── Prompt Enrichment Functions ─────────────────────────────────────────────
// These are the functions Lovable's handoff mentioned — enrichPromptWithRegion(), etc.
// Consolidated here as part of our unified system.

export function enrichPromptWithRegion(basePrompt: string, regionCode: string): string {
  // Find the best matching style variant
  for (const style of CREATIVE_STYLES) {
    const variant = style.regionalVariants[regionCode];
    if (variant) {
      const culturalContext = [
        `Setting: ${variant.environmentStyle}`,
        `Clothing: ${variant.wardrobe.modern}`,
        `Architecture: ${variant.culturalElements.architecture}`,
        `Vegetation: ${variant.culturalElements.vegetation}`,
        `Patterns: ${variant.culturalElements.patterns}`,
        variant.colorOverrides ? `Color palette: ${variant.colorOverrides.join(', ')}` : '',
        variant.lightingOverride ? `Lighting: ${variant.lightingOverride}` : '',
        variant.companionCreature ? `Companion: ${variant.companionCreature.description}` : '',
      ].filter(Boolean).join('. ');

      return `${basePrompt}. Cultural context for ${variant.regionName}: ${culturalContext}`;
    }
  }

  return basePrompt;
}

export function getRegionalMusicPrompt(regionCode: string): {
  prompt: string;
  genre: string;
  bpm: number;
  instruments: string[];
} {
  for (const style of CREATIVE_STYLES) {
    const variant = style.regionalVariants[regionCode];
    if (variant) {
      const avgBPM = Math.round((variant.music.bpmRange.min + variant.music.bpmRange.max) / 2);
      return {
        prompt: `${variant.music.genre} music, ${variant.music.moodDescription}. Instruments: ${variant.music.instruments.join(', ')}. ${avgBPM} BPM.`,
        genre: variant.music.genre,
        bpm: avgBPM,
        instruments: variant.music.instruments,
      };
    }
  }

  // Default fallback
  return {
    prompt: 'upbeat corporate music, positive and professional, 120 BPM',
    genre: 'corporate',
    bpm: 120,
    instruments: ['piano', 'guitar', 'light_drums'],
  };
}

export function getRegionalNarrativeStyle(regionCode: string): {
  approach: string;
  humorStyle: string;
  formalityLevel: number;
  emotionalTone: string;
} | undefined {
  for (const style of CREATIVE_STYLES) {
    const variant = style.regionalVariants[regionCode];
    if (variant) {
      return {
        approach: variant.narrative.storytellingApproach,
        humorStyle: variant.narrative.humorStyle,
        formalityLevel: variant.narrative.formalityLevel,
        emotionalTone: variant.narrative.emotionalTone,
      };
    }
  }
  return undefined;
}

export function getRegionalCompanionCreature(regionCode: string): RegionalStyleVariant['companionCreature'] | undefined {
  for (const style of CREATIVE_STYLES) {
    const variant = style.regionalVariants[regionCode];
    if (variant?.companionCreature) return variant.companionCreature;
  }
  return undefined;
}

export function getStyleForRegion(family: CreativeStyleFamily, regionCode: string): CreativeStyleProfile | undefined {
  return CREATIVE_STYLES.find(s => s.family === family && s.regionalVariants[regionCode]);
}

export function getAllStyleFamilies(): CreativeStyleFamily[] {
  return [...new Set(CREATIVE_STYLES.map(s => s.family))];
}

export function getStyleById(id: string): CreativeStyleProfile | undefined {
  return CREATIVE_STYLES.find(s => s.id === id);
}
