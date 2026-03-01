/**
 * Creative Imagination Registry — 50+ Named Visual World Presets
 *
 * Each preset captures the FULL DNA of a visual world:
 *   - Visual DNA:     what it LOOKS like (lighting, textures, colors, rendering)
 *   - Music DNA:      what it SOUNDS like (genre, instruments, tempo, mood)
 *   - Character DNA:  what characters LOOK/ACT like (proportions, expressions, motion)
 *   - Narrative DNA:  how STORIES flow (pacing, humor, emotional arc, tone)
 *   - Prompt DNA:     exact prompt modifiers for AI image/video generation
 *
 * EXTENSIBLE: Adding a new imagination preset = adding ONE object entry.
 * Zero engine changes needed. The sceneEnrichmentEngine imports this registry
 * and uses the selected preset to enrich every prompt, music cue, and pipeline step.
 *
 * IP-SAFE: All presets use descriptive names inspired by visual worlds.
 * No trademarked character names, franchise names, or copyrighted content.
 * Example: "puppet_educational" not "Sesame Street", "space_opera_epic" not "Star Wars".
 *
 * CATEGORIES:
 *   Animation Worlds    — 3D, 2D, stop-motion, etc.
 *   Art Mediums          — crayon, watercolor, chalk, oil painting, etc.
 *   Film Genres          — sci-fi, superhero, fantasy, documentary, etc.
 *   Cultural Styles      — regional art traditions
 *   Modern Digital       — vaporwave, glitch, AI-generated, etc.
 */

// ─── Core Type ───────────────────────────────────────────────────────────────

export interface ImaginationPreset {
  /** Unique ID — kebab-case, no trademarked names */
  id: string;
  /** Display name */
  name: string;
  /** Category for grouping in UI */
  category: ImaginationCategory;
  /** Short tagline — what it feels like */
  tagline: string;
  /** Longer description — what the user can expect */
  description: string;
  /** Inspiration sources (described generically, no IP) */
  inspiredBy: string;

  /** What it LOOKS like */
  visual: {
    renderStyle: string;           // 'volumetric 3D', 'hand-drawn cel', 'claymation', etc.
    lighting: string;              // 'warm studio Pixar', 'neon noir', 'underwater caustics'
    colorPalette: string[];        // Hex codes
    colorMood: string;             // 'warm saturated', 'cool desaturated', 'neon on dark'
    textureDetail: string;         // 'subsurface scattering fur', 'visible brushstrokes', 'felt texture'
    backgroundStyle: string;       // 'rich 3D environment', 'painted backdrop', 'abstract gradient'
    particleEffects: string;       // 'magical sparkles', 'underwater bubbles', 'cosmic dust'
    cameraWork: string;            // 'cinematic crane shots', 'handheld documentary', 'static frame'
  };

  /** What it SOUNDS like */
  music: {
    genre: string;
    instruments: string[];
    bpmRange: { min: number; max: number };
    mood: string;
    sfxStyle: string;              // 'cartoon exaggerated', 'realistic foley', 'sci-fi synth'
  };

  /** What characters LOOK/ACT like */
  character: {
    proportions: string;           // 'big head small body', 'heroic muscular', 'realistic', 'puppet'
    expressionStyle: string;       // 'exaggerated Pixar', 'subtle realistic', 'anime dramatic'
    motionStyle: string;           // 'bouncy squash-stretch', 'fluid graceful', 'stiff puppet'
    eyeStyle: string;              // 'large reflective', 'realistic', 'button eyes', 'comic mask'
    costumeApproach: string;       // 'everyday relatable', 'superhero spandex', 'medieval fantasy'
    animalStyle?: string;          // 'anthropomorphic upright', 'realistic with expressions', 'chibi'
  };

  /** How STORIES flow */
  narrative: {
    pacing: string;                // 'slow emotional build', 'rapid-fire action', 'educational gentle'
    humorType: string;             // 'meta fourth-wall', 'slapstick physical', 'dry wit', 'none'
    emotionalArc: string;          // 'hero journey', 'found family', 'redemption', 'underdog triumph'
    targetAudience: string;        // 'all ages', 'children 3-8', 'teens+', 'adults'
    toneKeywords: string[];        // ['heartwarming', 'adventurous', 'educational']
  };

  /** Exact prompt modifiers for AI generation */
  prompt: {
    stylePrefix: string;           // Prepended to ALL image/video generation prompts
    qualityBoost: string;          // Quality modifiers appended
    negativePrompt: string;        // What to avoid
    characterPrefix: string;       // Prepended to character generation
    environmentPrefix: string;     // Prepended to background/environment generation
    videoMotionStyle: string;      // Motion direction for video generation
  };

  /** Tags for search/filter in UI */
  tags: string[];
}

export type ImaginationCategory =
  | 'animation_world'
  | 'art_medium'
  | 'film_genre'
  | 'cultural_style'
  | 'modern_digital'
  | 'educational'
  | 'experimental';

// ─── The Registry ────────────────────────────────────────────────────────────

const p = (preset: ImaginationPreset) => preset;

export const IMAGINATION_PRESETS: Record<string, ImaginationPreset> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATION WORLDS
  // ═══════════════════════════════════════════════════════════════════════════

  'living-toys': p({
    id: 'living-toys',
    name: 'Living Toys World',
    category: 'animation_world',
    tagline: 'Toys come alive when nobody\'s watching',
    description: 'Plastic, fabric, and wooden toys in a child\'s bedroom become sentient characters. Rich 3D with toy-like textures — plastic sheen, stitched fabric, painted wood.',
    inspiredBy: 'Animated films about toys that come to life, classic childhood imagination',
    visual: {
      renderStyle: 'Pixar-quality 3D with toy-accurate material rendering — plastic sheen, fabric stitching, wood grain',
      lighting: 'warm bedroom lamp light, dramatic under-bed shadows, warm golden hour through windows',
      colorPalette: ['#E74C3C', '#3498DB', '#F1C40F', '#2ECC71', '#9B59B6'],
      colorMood: 'bright primary colors, toybox vibrant',
      textureDetail: 'visible plastic seams, fabric weave, painted surfaces with slight wear, sticker textures',
      backgroundStyle: 'child\'s bedroom, toy chest, backyard — everything toy-scale perspective',
      particleEffects: 'dust motes in lamplight, sparkle when toys "wake up"',
      cameraWork: 'low-angle toy POV shots, dramatic reveals, macro close-ups of toy details',
    },
    music: {
      genre: 'Randy Newman-style acoustic-orchestral, buddy comedy',
      instruments: ['acoustic guitar', 'piano', 'orchestral strings', 'trumpet', 'ukulele'],
      bpmRange: { min: 100, max: 135 },
      mood: 'adventurous friendship, heartwarming loyalty, playful mischief',
      sfxStyle: 'toy-specific: plastic clicks, fabric stretching, spring bouncing, wood clunking',
    },
    character: {
      proportions: 'varies by toy type — cowboy doll proportions, action figure heroic, stuffed animal round',
      expressionStyle: 'exaggerated but constrained by toy material — plastic faces with limited but expressive range',
      motionStyle: 'slightly stiff toy movement with surprising agility, hinge-joint awareness',
      eyeStyle: 'painted eyes that somehow convey deep emotion, shiny plastic reflections',
      costumeApproach: 'built into character — toy uniforms, fabric outfits, painted-on details',
    },
    narrative: {
      pacing: 'buddy adventure with emotional depth, escalating stakes',
      humorType: 'situational comedy from toy limitations in human world',
      emotionalArc: 'loyalty tested, found family, being valued beyond function',
      targetAudience: 'all ages — kids enjoy adventure, adults feel nostalgia',
      toneKeywords: ['heartwarming', 'adventurous', 'loyal', 'nostalgic', 'brave'],
    },
    prompt: {
      stylePrefix: 'Pixar-quality 3D animated scene, toys as characters, plastic and fabric textures, subsurface scattering on plastic, warm bedroom lighting, toy-scale world',
      qualityBoost: 'masterpiece, 8K render, ray tracing, global illumination, toy-accurate materials',
      negativePrompt: 'realistic humans, horror, broken toys, dark themes, low poly',
      characterPrefix: '3D animated toy character, expressive painted/plastic face, toy proportions, charming imperfections',
      environmentPrefix: 'child\'s room environment at toy scale, everyday objects become epic landscapes, warm lighting',
      videoMotionStyle: 'bouncy toy movement, dramatic reveals, buddy-comedy timing',
    },
    tags: ['toys', 'childhood', 'friendship', 'pixar', '3d', 'family', 'adventure'],
  }),

  'underwater-adventure': p({
    id: 'underwater-adventure',
    name: 'Underwater Adventure',
    category: 'animation_world',
    tagline: 'Deep ocean, bigger heart',
    description: 'Vibrant coral reef world where fish and sea creatures are characters. Underwater caustic lighting, bubbles, current physics. Tiny characters in a vast ocean.',
    inspiredBy: 'Animated ocean adventures, marine biology documentaries, coral reef wonder',
    visual: {
      renderStyle: 'luminous underwater 3D with caustic light rays, volumetric water, bioluminescence',
      lighting: 'shafts of sunlight through water surface, bioluminescent glow in deep scenes, coral-reflected colors',
      colorPalette: ['#0077B6', '#00B4D8', '#90E0EF', '#FF6B35', '#FFD166'],
      colorMood: 'ocean blues and teals with warm coral reef pops of orange and yellow',
      textureDetail: 'translucent fish fins, coral polyp detail, sand grain texture, water refraction',
      backgroundStyle: 'vast ocean depths, colorful coral reefs, kelp forests, sunlit shallows',
      particleEffects: 'bubbles streaming upward, plankton sparkle, sand clouds, bioluminescent pulses',
      cameraWork: 'flowing underwater camera, current-driven movement, whale-eye wide shots, intimate anemone close-ups',
    },
    music: {
      genre: 'Tropical-orchestral with surfer guitar and Hawaiian undertones',
      instruments: ['steel guitar', 'ukulele', 'orchestra', 'marimba', 'ocean drums'],
      bpmRange: { min: 90, max: 130 },
      mood: 'oceanic wonder, parental love, brave little fish energy',
      sfxStyle: 'underwater: bubbles, whale song, current whoosh, coral clicks, dolphin chirps',
    },
    character: {
      proportions: 'fish-accurate but with enormous expressive eyes, slight anthropomorphic touches',
      expressionStyle: 'huge eyes carry all emotion, fin gestures replace hand gestures',
      motionStyle: 'fluid swimming with current physics, dart-and-glide fish movement',
      eyeStyle: 'enormous reflective eyes with visible water caustics in iris reflections',
      costumeApproach: 'natural — coloring and fin patterns ARE the costume, occasional accessories (goggles, shells)',
      animalStyle: 'realistic anatomy with Pixar expressiveness, scientifically inspired but emotionally driven',
    },
    narrative: {
      pacing: 'gentle exploration building to exciting chase/escape sequences',
      humorType: 'fish-out-of-water humor (literally), visual gags with ocean physics',
      emotionalArc: 'overcoming fear, parent-child bonds, accepting differences',
      targetAudience: 'all ages — visual spectacle for everyone',
      toneKeywords: ['wonder', 'brave', 'ocean', 'family', 'colorful', 'vast'],
    },
    prompt: {
      stylePrefix: 'Pixar-quality underwater 3D animation, caustic light rays through water, vibrant coral reef, bioluminescent glow, volumetric water effects',
      qualityBoost: 'masterpiece, 8K, ray tracing, underwater caustics, global illumination, subsurface scattering on fish scales',
      negativePrompt: 'above water, dry land, realistic photo, dark horror ocean, pollution',
      characterPrefix: '3D animated fish/sea creature character, enormous expressive eyes, colorful scales, cute and appealing',
      environmentPrefix: 'underwater coral reef world, vibrant ocean colors, shafts of sunlight, bioluminescent deep sea',
      videoMotionStyle: 'fluid swimming, current-driven camera, underwater physics, bubble trails',
    },
    tags: ['ocean', 'underwater', 'fish', 'coral', 'family', 'adventure', 'pixar'],
  }),

  'anthropomorphic-city': p({
    id: 'anthropomorphic-city',
    name: 'Animal Metropolis',
    category: 'animation_world',
    tagline: 'A city built for every species',
    description: 'Modern city where all citizens are animals — infrastructure scaled from mouse to elephant. Each district reflects its inhabitants. Animals in professional clothing.',
    inspiredBy: 'Films imagining a world where animals built civilization, urban diversity stories',
    visual: {
      renderStyle: 'sleek modern 3D with multi-scale architecture — tiny mouse-hole shops next to elephant-sized plazas',
      lighting: 'clean modern city lighting, varied by district — tundra cool, rainforest warm, savanna golden',
      colorPalette: ['#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0'],
      colorMood: 'bright optimistic metropolis, each district has its own palette',
      textureDetail: 'fur rendering with subsurface scattering, cloth physics on tiny suits, architectural detail',
      backgroundStyle: 'massive multi-biome city with districts: tundra, rainforest, desert, savanna, downtown',
      particleEffects: 'rain in rainforest district, snow in tundra, pollen in meadow district',
      cameraWork: 'city-scale establishing shots, chase sequences through multi-size streets, intimate character moments',
    },
    music: {
      genre: 'Pop-funk with world music influences per district',
      instruments: ['funk bass', 'pop synth', 'drums', 'world instruments per district', 'brass'],
      bpmRange: { min: 110, max: 140 },
      mood: 'modern city energy, diverse communities, optimistic progress',
      sfxStyle: 'city ambience scaled by species: tiny squeaks, massive footsteps, varied transport sounds',
    },
    character: {
      proportions: 'anthropomorphic animals standing upright, species-accurate proportions but human-like posture',
      expressionStyle: 'natural animal features conveying human emotions — ears, tails, whiskers as emotional signals',
      motionStyle: 'species-influenced movement — rabbits bouncy, sloths slow, cheetahs quick, elephants deliberate',
      eyeStyle: 'natural animal eyes with enhanced expressiveness, species-appropriate',
      costumeApproach: 'professional clothing adapted for animal bodies — suits for foxes, uniforms for buffalo, tiny ties for mice',
      animalStyle: 'anthropomorphic upright, realistic anatomy with clothes, each species has unique body language',
    },
    narrative: {
      pacing: 'buddy-cop investigation meets city comedy, reveals deeper social commentary',
      humorType: 'species-based wordplay, size-difference physical comedy, cultural misunderstandings between species',
      emotionalArc: 'overcoming prejudice, unlikely partnerships, believing in others',
      targetAudience: 'all ages — kids enjoy animals, adults catch the social metaphor',
      toneKeywords: ['diverse', 'metropolitan', 'justice', 'partnership', 'optimistic', 'clever'],
    },
    prompt: {
      stylePrefix: '3D animated anthropomorphic animal city, animals in professional clothing, multi-scale architecture, modern metropolis built for every species',
      qualityBoost: 'masterpiece, 8K, detailed fur rendering, subsurface scattering, cloth simulation, city-scale detail',
      negativePrompt: 'humans, realistic animals, dark/horror, feral animals, naked characters',
      characterPrefix: '3D animated anthropomorphic animal in professional attire, standing upright, expressive face, species-accurate features',
      environmentPrefix: 'modern city built for animals of all sizes, multi-biome districts, scaled infrastructure',
      videoMotionStyle: 'species-appropriate movement, city energy, buddy-comedy pacing',
    },
    tags: ['animals', 'city', 'diversity', 'anthropomorphic', 'professional', 'comedy', 'social'],
  }),

  'ocean-mythic-voyage': p({
    id: 'ocean-mythic-voyage',
    name: 'Ocean Mythic Voyage',
    category: 'animation_world',
    tagline: 'The ocean calls — and she answers',
    description: 'Polynesian-inspired ocean adventure with demigods, living ocean, and bioluminescent creatures. Rich cultural mythology meets Disney musical energy.',
    inspiredBy: 'Pacific Islander mythology, ocean navigation traditions, Polynesian wayfinding heritage',
    visual: {
      renderStyle: 'lush tropical 3D with living ocean that has personality — waves that reach, currents that guide',
      lighting: 'tropical golden hour, underwater bioluminescence, starlit Polynesian night sky',
      colorPalette: ['#00CED1', '#FF6B35', '#FFD700', '#228B22', '#8B008B'],
      colorMood: 'tropical ocean turquoise with warm island earth tones, magical bioluminescent accents',
      textureDetail: 'ocean surface iridescence, tropical flower petal detail, tapa cloth textures, volcanic rock',
      backgroundStyle: 'vast Pacific ocean, volcanic islands, coral kingdoms, star-filled navigation sky',
      particleEffects: 'ocean spray sparkle, bioluminescent plankton trails, volcanic embers, flower petals in wind',
      cameraWork: 'sweeping ocean vistas, intimate canoe-level shots, dramatic volcanic approaches, underwater reveals',
    },
    music: {
      genre: 'Polynesian percussion meets Broadway musical with orchestral grandeur',
      instruments: ['log drums', 'ukulele', 'conch shell', 'orchestra', 'chorus', 'nose flute'],
      bpmRange: { min: 95, max: 150 },
      mood: 'epic ocean adventure with intimate family heart, musical theater energy',
      sfxStyle: 'ocean waves, tropical birds, volcanic rumble, magical ocean responses',
    },
    character: {
      proportions: 'Disney stylized — protagonist athletic and determined, demigod massive and expressive',
      expressionStyle: 'big musical-number expressions, determined hero face, comedic sidekick broad reactions',
      motionStyle: 'powerful ocean-connected movement, traditional dance integrated into action, confident wayfinding',
      eyeStyle: 'large Disney eyes with ocean reflections, determined gaze',
      costumeApproach: 'Polynesian-inspired: tapa cloth, flower lei, traditional tattoo patterns, shell jewelry',
    },
    narrative: {
      pacing: 'musical adventure — song → action → heart → comedy cycle, building to epic climax',
      humorType: 'sidekick physical comedy, demigod ego humor, ocean-as-character reactions',
      emotionalArc: 'finding identity through heritage, courage of ancestors, restoring balance',
      targetAudience: 'all ages — cultural celebration with universal journey themes',
      toneKeywords: ['epic', 'ocean', 'heritage', 'musical', 'brave', 'mythic', 'tropical'],
    },
    prompt: {
      stylePrefix: 'Disney-quality 3D animation, Polynesian-inspired ocean world, living ocean with personality, tropical island paradise, bioluminescent underwater, mythic adventure',
      qualityBoost: 'masterpiece, 8K, volumetric ocean, tropical lighting, subsurface scattering, rich cultural detail',
      negativePrompt: 'realistic photo, dark horror ocean, modern city, cold climate, generic fantasy',
      characterPrefix: 'Disney-style 3D character, Polynesian-inspired design, tapa cloth clothing, flower accessories, athletic build',
      environmentPrefix: 'Pacific island paradise, vast turquoise ocean, volcanic mountains, coral reef kingdom, starlit navigation sky',
      videoMotionStyle: 'ocean wave dynamics, sailing adventure, musical choreography, mythic scale',
    },
    tags: ['ocean', 'polynesian', 'musical', 'mythic', 'adventure', 'island', 'heritage'],
  }),

  'cosmic-ragtag-crew': p({
    id: 'cosmic-ragtag-crew',
    name: 'Cosmic Ragtag Crew',
    category: 'film_genre',
    tagline: 'Misfits saving the galaxy with a killer playlist',
    description: 'Space opera with 70s/80s soundtrack, misfit alien crew, neon-lit spaceships, and irreverent humor. Cosmic landscapes meet retro pop culture energy.',
    inspiredBy: 'Space adventure comedies with retro soundtracks, ragtag team ensemble films',
    visual: {
      renderStyle: 'cinematic sci-fi with retro-futurism — chrome spaceships, alien bazaars, cosmic nebulae',
      lighting: 'neon-lit interiors, dramatic space nebula colors, alien sunset multi-colored skies',
      colorPalette: ['#6C3483', '#E74C3C', '#F39C12', '#1ABC9C', '#2C3E50'],
      colorMood: 'cosmic purples and teals with warm retro orange and neon accents',
      textureDetail: 'worn spaceship metal, alien skin textures, cosmic dust clouds, retro tech dials',
      backgroundStyle: 'vast space nebulae, alien planet surfaces, grimy spaceship interiors, cosmic bazaars',
      particleEffects: 'cosmic dust trails, engine exhaust, energy weapon blasts, nebula swirls',
      cameraWork: 'epic space establishing shots, dynamic handheld action, ensemble group shots, dramatic slow-mo',
    },
    music: {
      genre: '70s/80s classic rock and pop with orchestral space score',
      instruments: ['electric guitar', 'bass', 'drums', 'synth', 'orchestra', 'cassette player'],
      bpmRange: { min: 110, max: 150 },
      mood: 'retro mixtape energy meets epic space opera, emotional ballads in quiet moments',
      sfxStyle: 'sci-fi: laser blasts, spaceship engines, alien languages, retro boombox',
    },
    character: {
      proportions: 'varied alien species — human-like leader, tree-like giant, raccoon-like trickster, warrior woman, literal-minded brute',
      expressionStyle: 'MCU quippy reactions, dramatic slow-mo hero poses, comedic deadpan',
      motionStyle: 'action-movie dynamic, each character has unique fighting/movement style',
      eyeStyle: 'species-varied — human, alien compound, glowing, masked',
      costumeApproach: 'space outlaw: leather jackets, alien armor, mismatched gear, functional not fashionable',
    },
    narrative: {
      pacing: 'fast-paced action-comedy with unexpected emotional gut-punches',
      humorType: 'irreverent quips, pop-culture references, deadpan alien misunderstandings, physical comedy',
      emotionalArc: 'outcasts becoming family, sacrifice for each other, redemption through love',
      targetAudience: 'teens and adults — humor, action, and emotional depth',
      toneKeywords: ['irreverent', 'cosmic', 'retro', 'found-family', 'action', 'mixtape', 'epic'],
    },
    prompt: {
      stylePrefix: 'cinematic space opera, retro-futuristic aesthetic, neon-lit alien worlds, cosmic nebula backgrounds, 70s/80s visual energy meets sci-fi epic',
      qualityBoost: 'masterpiece, cinematic 4K, volumetric nebula, lens flare, anamorphic, dramatic lighting',
      negativePrompt: 'cartoon, anime, cute, childish, modern minimalist, flat design',
      characterPrefix: 'cinematic sci-fi character, alien species design, space outlaw outfit, dramatic lighting, action-ready pose',
      environmentPrefix: 'vast cosmic landscape, alien planet surface, neon-lit spaceship interior, space bazaar with alien merchants',
      videoMotionStyle: 'dynamic action sequences, slow-motion hero shots, retro soundtrack rhythm cuts',
    },
    tags: ['space', 'retro', 'comedy', 'action', 'aliens', 'team', 'mixtape', 'cosmic'],
  }),

  'meta-comedy-action': p({
    id: 'meta-comedy-action',
    name: 'Meta Comedy Action',
    category: 'film_genre',
    tagline: 'Breaking the fourth wall and every bone',
    description: 'Self-aware action-comedy that talks directly to camera, comments on its own genre, and mixes ultraviolent action with absurdist humor. Red and black palette.',
    inspiredBy: 'Fourth-wall-breaking action comedies, self-aware superhero satire',
    visual: {
      renderStyle: 'hyper-stylized live-action aesthetic — comic panel freeze frames, text overlays, chibi cutaways',
      lighting: 'dramatic action lighting with comedic flat-lit fourth-wall breaks',
      colorPalette: ['#E74C3C', '#1A1A1A', '#FFD700', '#FFFFFF', '#8B0000'],
      colorMood: 'red-and-black dominant with occasional pop-art yellow accents',
      textureDetail: 'leather suit texture, comic halftone overlays, blood splatter (stylized/comedic)',
      backgroundStyle: 'alternates between cinematic action sets and obvious green-screen-acknowledged backdrops',
      particleEffects: 'bullet casings, explosion debris, comic-style POW/BAM text that appears physically',
      cameraWork: 'breaks fourth wall — looks at camera, acknowledges the audience, freezes to annotate',
    },
    music: {
      genre: 'eclectic soundtrack mixing rap, pop classics, orchestral irony',
      instruments: ['turntable scratches', 'orchestra (used ironically)', 'pop hits', 'synth bass'],
      bpmRange: { min: 120, max: 160 },
      mood: 'cool confidence meets absurdist comedy, needle drops that comment on the action',
      sfxStyle: 'exaggerated action: bone crunches (comedic), sword slashes, record scratches for comedic timing',
    },
    character: {
      proportions: 'realistic but with exaggerated action poses, freeze-frame chibi for comedy moments',
      expressionStyle: 'mask with expressive eye-patches, constant commentary to camera, dramatic emoji-like faces',
      motionStyle: 'fluid martial arts mixed with slapstick, dance-fight hybrid, breaks mid-fight to chat',
      eyeStyle: 'expressive mask eyes (white patches) that convey emotion despite covering face',
      costumeApproach: 'red-and-black suit, tactically absurd, katanas-on-back iconic silhouette',
    },
    narrative: {
      pacing: 'rapid-fire jokes between intense action sequences, frequent record-scratch asides',
      humorType: 'meta fourth-wall, pop-culture references, genre self-awareness, toilet humor with wit',
      emotionalArc: 'beneath the jokes: genuine pain, love, and redemption',
      targetAudience: 'adults — mature humor, stylized action',
      toneKeywords: ['meta', 'irreverent', 'action', 'fourth-wall', 'comedy', 'stylized'],
    },
    prompt: {
      stylePrefix: 'hyper-stylized action scene, red-and-black color scheme, fourth-wall-breaking energy, comic panel freeze frames, pop-art text effects, dramatic yet comedic',
      qualityBoost: 'cinematic quality, dramatic lighting, comic book halftone overlay, action movie production value',
      negativePrompt: 'serious dark, horror, children, cute cartoon, anime, realistic drama',
      characterPrefix: 'masked anti-hero in red-black suit, expressive mask, katanas, fourth-wall-aware pose, comedic action energy',
      environmentPrefix: 'action movie set with self-aware framing, alternating between epic and deliberately cheap, comic-style panels',
      videoMotionStyle: 'martial arts action, freeze-frame annotations, slow-mo hero landing, time-break comedy',
    },
    tags: ['meta', 'comedy', 'action', 'fourth-wall', 'anti-hero', 'irreverent', 'adult'],
  }),

  'puppet-educational': p({
    id: 'puppet-educational',
    name: 'Puppet Workshop World',
    category: 'educational',
    tagline: 'Learning is a sunny day, sweeping the clouds away',
    description: 'Felt puppet characters on a colorful street set. Educational, warm, diverse cast teaching through songs and skits. Visible stitching, googly eyes, bright primary colors.',
    inspiredBy: 'Classic educational puppet TV shows, Jim Henson-style character puppetry',
    visual: {
      renderStyle: 'physical puppet aesthetic — felt, foam, fabric, visible stitching, googly/ping-pong-ball eyes',
      lighting: 'bright, even studio lighting — warm, safe, colorful, no harsh shadows',
      colorPalette: ['#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF8C00'],
      colorMood: 'pure primary colors, bright and safe, kindergarten-warm',
      textureDetail: 'visible felt stitching, fuzzy fur fabric, foam construction, fabric clothing textures',
      backgroundStyle: 'friendly neighborhood street set — brownstone stoops, flower boxes, lamp posts, sunny sky backdrop',
      particleEffects: 'confetti for celebrations, sparkle for learning moments, soap bubbles',
      cameraWork: 'eye-level with puppets, gentle zooms for emphasis, wide shots of street scene',
    },
    music: {
      genre: 'educational folk-pop with jazz-influenced interludes',
      instruments: ['piano', 'acoustic guitar', 'tuba', 'xylophone', 'kazoo', 'children singing'],
      bpmRange: { min: 80, max: 120 },
      mood: 'warm, welcoming, gently educational, sing-along inviting',
      sfxStyle: 'puppet show: bonk sounds, slide whistles, gentle honks, cheerful jingles, counting beeps',
    },
    character: {
      proportions: 'puppet proportions — some tall and thin, some round and short, some monster-sized fuzzy',
      expressionStyle: 'wide-open mouth movements, tilted head for curiosity, whole-body emotional expression',
      motionStyle: 'puppet rod-and-hand movement — slightly jerky but charming, full-body gesticulation',
      eyeStyle: 'googly eyes or ping-pong-ball eyes — one of each size for some characters, always friendly',
      costumeApproach: 'simple and iconic — one character always has a striped shirt, another always has a cape',
    },
    narrative: {
      pacing: 'gentle segments with clear learning beats, song breaks, repetition for retention',
      humorType: 'gentle slapstick, misunderstanding humor, counting/letter jokes',
      emotionalArc: 'daily discovery, friendship lessons, inclusive community',
      targetAudience: 'children 2-8, parents/teachers',
      toneKeywords: ['educational', 'warm', 'inclusive', 'musical', 'gentle', 'welcoming', 'diverse'],
    },
    prompt: {
      stylePrefix: 'Jim Henson-style puppet characters, felt and foam puppets, bright primary colors, friendly neighborhood set, visible stitching, educational warmth',
      qualityBoost: 'professional puppet show quality, studio lighting, crisp fabric textures, cheerful composition',
      negativePrompt: 'scary, dark, realistic, horror, CGI, anime, adult themes, violence',
      characterPrefix: 'felt/foam puppet character, googly eyes, visible stitching, bright colored fur/fabric, friendly expression, puppet proportions',
      environmentPrefix: 'bright colorful street set, friendly neighborhood, brownstone stoops, flower boxes, sunny backdrop, puppet-scale',
      videoMotionStyle: 'puppet rod movement, gentle bouncy, educational pacing, sing-along rhythm',
    },
    tags: ['puppet', 'educational', 'children', 'felt', 'musical', 'inclusive', 'warm'],
  }),

  'superhero-urban': p({
    id: 'superhero-urban',
    name: 'Urban Superhero',
    category: 'film_genre',
    tagline: 'With great power comes great responsibility — and great skyline shots',
    description: 'Acrobatic superhero swinging between skyscrapers. Bold comic-book colors, web/energy trails, dramatic cityscapes. Action-packed with coming-of-age heart.',
    inspiredBy: 'Teen superhero stories, urban acrobatic heroes, comic book city protectors',
    visual: {
      renderStyle: 'hyper-stylized 3D with comic-book ink lines, halftone dots in shadows, pop-art color blocking',
      lighting: 'dramatic urban — city at golden hour, neon signs at night, dramatic skyline silhouettes',
      colorPalette: ['#E74C3C', '#2980B9', '#FFFFFF', '#1A1A2E', '#FFD700'],
      colorMood: 'bold red-blue contrast, urban neon at night, pop-art energy',
      textureDetail: 'suit texture detail, web/energy trail rendering, building surface variety, rain-wet streets',
      backgroundStyle: 'massive metropolitan skyline, vertiginous building perspectives, aerial city views',
      particleEffects: 'web/energy trails, glass shattering, rain drops in slow-mo, electric sparks',
      cameraWork: 'swooping alongside hero, vertiginous building falls, dynamic action tracking, POV swinging',
    },
    music: {
      genre: 'orchestral-electronic hybrid with hip-hop beats for action sequences',
      instruments: ['orchestra', 'electronic beats', 'hip-hop elements', 'electric guitar', 'choir'],
      bpmRange: { min: 120, max: 160 },
      mood: 'youthful energy meets epic responsibility, electrifying action with emotional quiet moments',
      sfxStyle: 'urban: web thwips, building impacts, police sirens, wind rushing, suit tech sounds',
    },
    character: {
      proportions: 'athletic teen build, acrobatic flexibility, dynamic action poses',
      expressionStyle: 'mask eyes that emote (squinting, widening), body language carries emotion when masked',
      motionStyle: 'acrobatic fluid — flips, swings, wall-running, gravity-defying but grounded in physics',
      eyeStyle: 'expressive mask lenses that mechanically adjust to show emotion, glowing in dark',
      costumeApproach: 'skin-tight athletic suit with bold color blocking, tech suit with moving parts',
    },
    narrative: {
      pacing: 'alternates between high-speed action and grounded teen life — double identity tension',
      humorType: 'nervous quipping during combat, teen awkwardness, pop-culture references mid-fight',
      emotionalArc: 'responsibility vs. youth, protecting loved ones, growing into the role',
      targetAudience: 'all ages — teens identify, adults appreciate the journey',
      toneKeywords: ['heroic', 'urban', 'acrobatic', 'coming-of-age', 'responsibility', 'dynamic'],
    },
    prompt: {
      stylePrefix: 'comic-book-style 3D animation, urban superhero, bold colors, dynamic action poses, city skyline, pop-art halftone effects, dramatic lighting',
      qualityBoost: 'cinematic, 8K, dramatic lighting, volumetric fog, motion blur, comic ink outlines',
      negativePrompt: 'cute cartoon, childish, flat 2D, anime, realistic documentary',
      characterPrefix: 'athletic superhero in bold-colored suit, dynamic action pose, masked with expressive eyes, urban rooftop setting',
      environmentPrefix: 'massive city skyline at dusk, skyscrapers with dramatic perspective, urban streets, neon signs, rain-wet surfaces',
      videoMotionStyle: 'acrobatic swinging, vertiginous falls, slow-mo action, dynamic tracking shots',
    },
    tags: ['superhero', 'urban', 'action', 'comic', 'teen', 'dynamic', 'city'],
  }),

  'space-opera-epic': p({
    id: 'space-opera-epic',
    name: 'Space Opera Epic',
    category: 'film_genre',
    tagline: 'In a galaxy where light meets dark...',
    description: 'Epic space saga with light vs dark themes, laser swords, vast starship fleets, desert planets, and ancient mystical orders. Sweeping orchestral score.',
    inspiredBy: 'Classic space operas, samurai mythology in space, ancient-order-vs-empire stories',
    visual: {
      renderStyle: 'cinematic photorealistic sci-fi with stylized lighting — hard light/shadow duality',
      lighting: 'dramatic chiaroscuro — scenes split between warm light and cold dark, lightsaber-glow scenes',
      colorPalette: ['#000000', '#1A237E', '#FFD700', '#E74C3C', '#4CAF50'],
      colorMood: 'stark light-dark contrast, golden desert warmth vs cold space blue, energy weapon glows',
      textureDetail: 'weathered starship hulls, sand-worn robes, polished chrome, organic alien surfaces',
      backgroundStyle: 'vast: twin-sun deserts, snow planets, city-planets, space battles with thousands of ships',
      particleEffects: 'hyperspace streaks, energy weapon trails, sand swirl, spark cascades from sword clashes',
      cameraWork: 'sweeping epic establishing shots, intimate character faces, massive fleet battles, wipe transitions',
    },
    music: {
      genre: 'symphonic orchestral with leitmotifs, brass-heavy, choir for dark themes',
      instruments: ['full symphony orchestra', 'brass section', 'choir', 'timpani', 'french horn'],
      bpmRange: { min: 80, max: 140 },
      mood: 'epic mythic destiny, dark temptation, triumphant hero theme, tragic villain theme',
      sfxStyle: 'sci-fi: lightsaber hum/clash, blaster bolts, hyperdrive whoosh, droid beeps, breathing apparatus',
    },
    character: {
      proportions: 'realistic human, varied alien species, imposing armored villains, robed mystic mentors',
      expressionStyle: 'restrained wisdom for mentors, conflicted intensity for heroes, dramatic reveals for villains',
      motionStyle: 'martial arts sword fighting, force-push gestures, regal walking, dramatic cape swishing',
      eyeStyle: 'human eyes showing inner conflict, glowing eyes for dark side corruption, wise elderly eyes for mentors',
      costumeApproach: 'robes for mystics, armor for military, scoundrel vests for rogues, royal gowns for diplomats',
    },
    narrative: {
      pacing: 'epic three-act saga structure, parallel hero/villain arcs, cliffhanger act breaks',
      humorType: 'roguish quips, droid comic relief, fish-out-of-water farm-kid humor',
      emotionalArc: 'destiny vs choice, temptation of power, father-son redemption, hope in darkness',
      targetAudience: 'all ages — mythic storytelling is universal',
      toneKeywords: ['epic', 'mythic', 'destiny', 'light-dark', 'space', 'orchestral', 'saga'],
    },
    prompt: {
      stylePrefix: 'epic space opera, cinematic sci-fi, vast starship fleets, desert planets, mystical orders, dramatic light-vs-dark lighting, sweeping orchestral energy',
      qualityBoost: 'masterpiece, cinematic 8K, volumetric lighting, lens flare, anamorphic widescreen, epic scale',
      negativePrompt: 'cartoon, cute, modern realistic, horror, small-scale, comedy-focused',
      characterPrefix: 'space opera character, dramatic costume (robes or armor), cinematic lighting, mythic pose, lightsaber/energy weapon glow',
      environmentPrefix: 'vast space opera landscape — desert planet with twin suns, massive star destroyer, ancient temple, city-planet skyline',
      videoMotionStyle: 'sweeping crane shots, dramatic reveals, lightsaber combat, hyperspace jump, fleet battle',
    },
    tags: ['space', 'opera', 'epic', 'saga', 'light-dark', 'mythic', 'orchestral', 'destiny'],
  }),

  'dark-knight-noir': p({
    id: 'dark-knight-noir',
    name: 'Dark Knight Noir',
    category: 'film_genre',
    tagline: 'The city needs a silent guardian',
    description: 'Gothic noir superhero — dark rainy cityscape, gargoyle silhouettes, detective mystery, psychological depth. Contrast between darkness and single points of light.',
    inspiredBy: 'Gothic detective stories, noir urban heroes, dark psychological thrillers',
    visual: {
      renderStyle: 'noir-cinematic with high contrast, gothic architecture, rain-soaked surfaces',
      lighting: 'extreme chiaroscuro — single light sources in vast darkness, lightning flashes, signal searchlight',
      colorPalette: ['#0D0D0D', '#1A1A2E', '#2C3E50', '#F39C12', '#E74C3C'],
      colorMood: 'almost monochrome dark with sparse warm light — amber streetlamps, fire, signal',
      textureDetail: 'rain on leather, wet stone gargoyles, cracked concrete, gothic architecture detail',
      backgroundStyle: 'gothic metropolitan skyline, cathedral spires, gargoyle-lined rooftops, rain-slicked alleys',
      particleEffects: 'rain streaks, lightning, smoke/fog, signal beam cutting through clouds',
      cameraWork: 'dramatic low angles, silhouette shots, detective investigation steady-cam, rooftop establishing shots',
    },
    music: {
      genre: 'dark orchestral with industrial electronic undertones',
      instruments: ['low brass', 'cello drones', 'industrial percussion', 'electronic bass', 'piano (sparse)'],
      bpmRange: { min: 70, max: 110 },
      mood: 'dark brooding tension with moments of heroic brass resolve, psychological thriller',
      sfxStyle: 'noir: rain on windows, distant thunder, leather cape whoosh, grappling hook launch, boots on wet stone',
    },
    character: {
      proportions: 'imposing silhouette — broad shoulders, cape creating dramatic shape, cowl obscuring face',
      expressionStyle: 'minimal — jaw set, eyes narrowed, emotion conveyed through posture and sparse dialogue',
      motionStyle: 'predatory stealth, explosive combat, cape-dramatic landings, detective careful examination',
      eyeStyle: 'cowl/mask with white eye slits glowing in darkness, intimidating but human underneath',
      costumeApproach: 'dark armored suit, flowing cape, utility belt, gothic-tech aesthetic',
    },
    narrative: {
      pacing: 'slow detective build to explosive action climax, psychological cat-and-mouse',
      humorType: 'almost none — dry butler wit as the only levity',
      emotionalArc: 'trauma driving purpose, the cost of being a symbol, moral lines',
      targetAudience: 'teens and adults — dark themes, psychological depth',
      toneKeywords: ['dark', 'noir', 'gothic', 'detective', 'psychological', 'brooding', 'heroic'],
    },
    prompt: {
      stylePrefix: 'gothic noir cinematic, rain-soaked dark city, dramatic chiaroscuro lighting, gargoyle silhouettes, detective atmosphere, psychological thriller',
      qualityBoost: 'cinematic 8K, noir lighting, volumetric rain, dramatic shadows, gothic detail',
      negativePrompt: 'bright colors, cartoon, cute, comedy, daylight, cheerful, anime',
      characterPrefix: 'dark armored hero silhouette, flowing cape, cowl with glowing eye slits, gothic rooftop pose, rain-soaked',
      environmentPrefix: 'gothic metropolis at night, rain-slicked streets, gargoyle rooftops, cathedral spires, amber streetlamp pools',
      videoMotionStyle: 'predatory stealth movement, dramatic cape reveals, noir detective investigation, lightning flash reveals',
    },
    tags: ['noir', 'gothic', 'dark', 'detective', 'hero', 'psychological', 'rain', 'urban'],
  }),

  'team-assemble-epic': p({
    id: 'team-assemble-epic',
    name: 'Team Assemble Epic',
    category: 'film_genre',
    tagline: 'Individually extraordinary. Together, unstoppable.',
    description: 'Super-team ensemble — diverse heroes with unique powers assembling against cosmic threat. Rotating hero spotlights, massive battle sequences, quippy team dynamics.',
    inspiredBy: 'Superhero team ensemble films, mythic hero gatherings, power-of-unity stories',
    visual: {
      renderStyle: 'cinematic VFX-heavy — each hero has a distinct visual signature (fire, ice, tech, cosmic)',
      lighting: 'hero-specific — each character has their own color lighting, combined in team shots',
      colorPalette: ['#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F1C40F', '#E67E22'],
      colorMood: 'each hero owns a color, team shots create rainbow ensemble, cosmic threat is dark purple/grey',
      textureDetail: 'varied by hero — metal armor, stretchy suit, alien skin, mystical rune glow, fur/cape',
      backgroundStyle: 'iconic locations: city center, helicarrier, alien invasion portal in sky, devastated landscape',
      particleEffects: 'per-hero: repulsor beams, lightning, shield energy, mystical runes, gamma glow',
      cameraWork: 'iconic circle shot of assembled team, individual hero landing shots, massive battle choreography',
    },
    music: {
      genre: 'epic symphonic with heroic brass leitmotifs for each character',
      instruments: ['full orchestra', 'heroic brass', 'drums', 'electric guitar for certain heroes', 'choir'],
      bpmRange: { min: 100, max: 155 },
      mood: 'goosebump-inducing heroic assembly, each hero gets their theme, combined into epic harmony',
      sfxStyle: 'power-specific: repulsor whine, shield ring, lightning crack, mystic portal hum, hulk-smash impact',
    },
    character: {
      proportions: 'diverse — armored tech genius, super-soldier peak human, thunder god massive, spy athletic, green giant',
      expressionStyle: 'quippy confidence masking vulnerability, dramatic pre-battle determination, comedic team bickering',
      motionStyle: 'each hero moves uniquely — military precision, acrobatic grace, thunder-god grandeur, rage-powered',
      eyeStyle: 'diverse — human determined, alien/god glowing, mask-covered, visor-lit',
      costumeApproach: 'each hero iconic — armor, shield, hammer, suit, each visually distinct and immediately recognizable',
    },
    narrative: {
      pacing: 'individual hero threads weaving together, building to epic "assemble" moment and massive finale',
      humorType: 'quippy team banter, personality clashes played for comedy, unexpected friendships',
      emotionalArc: 'individuals overcoming personal flaws to work together, sacrifice for the greater good',
      targetAudience: 'all ages — epic spectacle with heart',
      toneKeywords: ['epic', 'team', 'assemble', 'heroic', 'diverse', 'spectacle', 'unity'],
    },
    prompt: {
      stylePrefix: 'cinematic superhero team ensemble, diverse heroes with unique power signatures, epic battle scale, heroic poses, dramatic lighting per character',
      qualityBoost: 'cinematic 8K, VFX quality, volumetric powers, dramatic lens flare, epic scale battle',
      negativePrompt: 'single hero, quiet, minimal, cartoon cute, anime, documentary',
      characterPrefix: 'unique superhero with distinct visual power signature, iconic costume, heroic pose, cinematic lighting matching power color',
      environmentPrefix: 'massive battle landscape, city under siege, sky portal, team circle formation, epic scale destruction and heroism',
      videoMotionStyle: 'iconic team rotation shot, individual hero spotlights, massive ensemble battle choreography, dramatic slow-mo assemble',
    },
    tags: ['team', 'heroes', 'epic', 'ensemble', 'battle', 'powers', 'assemble', 'unity'],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // ART MEDIUMS
  // ═══════════════════════════════════════════════════════════════════════════

  'crayon-childhood': p({
    id: 'crayon-childhood',
    name: 'Crayon World',
    category: 'art_medium',
    tagline: 'The world as a 6-year-old sees it',
    description: 'Everything drawn in bold waxy crayons — thick lines, imperfect shapes, paper texture visible. Child\'s imagination where scribbles become reality.',
    inspiredBy: 'Children\'s crayon drawings come to life, picture book illustration, childhood imagination',
    visual: {
      renderStyle: 'thick waxy crayon strokes on paper, visible paper grain, bold imperfect lines',
      lighting: 'flat bright — no shadows, everything equally lit as a child would draw',
      colorPalette: ['#FF0000', '#FF8C00', '#FFFF00', '#00FF00', '#0000FF', '#800080'],
      colorMood: 'bold crayon-box primary colors, thick waxy saturation, no subtlety — pure joy',
      textureDetail: 'visible crayon wax texture, paper grain showing through, thick waxy buildup in colored areas',
      backgroundStyle: 'crayon-drawn landscapes — houses with triangle roofs, stick-figure trees, smiling sun with rays',
      particleEffects: 'crayon scribble sparkles, paper confetti, wax crayon bits',
      cameraWork: 'static like a drawing, occasional zoom into drawing that comes alive, paper-flip transitions',
    },
    music: {
      genre: 'simple children\'s music — xylophone, clapping, humming',
      instruments: ['xylophone', 'clapping', 'toy piano', 'humming', 'kazoo'],
      bpmRange: { min: 80, max: 110 },
      mood: 'pure childhood joy, simple and sweet, playground energy',
      sfxStyle: 'crayon drawing on paper, paper crinkle, child giggling, whoosh of crayon lines appearing',
    },
    character: {
      proportions: 'stick-figure to slightly more detailed — big round heads, simple bodies, always smiling',
      expressionStyle: 'simple curved-line smiles, dot eyes, circle blush, basic but clear emotions',
      motionStyle: 'wobbly hand-drawn animation, frame-by-frame crayon redrawing',
      eyeStyle: 'simple dots or circles, always happy — occasional X eyes for dizzy',
      costumeApproach: 'simple shapes — triangle dress, rectangle pants, circle buttons, crayon-colored hair',
    },
    narrative: {
      pacing: 'gentle, repetitive, building simple ideas one at a time',
      humorType: 'innocent childlike — silly sounds, unexpected shapes, giggle-inducing surprises',
      emotionalArc: 'simple: problem → imagination → solution → celebration',
      targetAudience: 'children 2-6, parents, anyone who wants pure whimsy',
      toneKeywords: ['childlike', 'innocent', 'crayon', 'joyful', 'simple', 'imaginative', 'whimsical'],
    },
    prompt: {
      stylePrefix: 'crayon drawing style, thick waxy lines on paper, visible paper texture, childlike art, bold primary colors, imperfect charming shapes',
      qualityBoost: 'high resolution paper texture, authentic crayon wax rendering, clean scan quality',
      negativePrompt: 'realistic, 3D, dark, scary, detailed, professional art, photograph',
      characterPrefix: 'crayon-drawn character, simple round head, dot eyes, curved smile, childlike proportions, bold crayon colors',
      environmentPrefix: 'crayon-drawn landscape, triangle-roof house, stick trees, smiling sun with rays, green ground line, blue sky',
      videoMotionStyle: 'hand-drawn frame-by-frame, crayon lines appearing, wobbly charming movement, paper-based',
    },
    tags: ['crayon', 'children', 'art', 'simple', 'whimsical', 'paper', 'childhood'],
  }),

  'chalk-blackboard': p({
    id: 'chalk-blackboard',
    name: 'Chalk & Blackboard',
    category: 'art_medium',
    tagline: 'Lessons that draw themselves',
    description: 'White and colored chalk on dark blackboard/chalkboard. Educational content that draws itself on the board. Chalk dust, eraser smudges, teacher handwriting aesthetic.',
    inspiredBy: 'Classroom chalkboard, street chalk art, chalk animation, professor lectures',
    visual: {
      renderStyle: 'chalk on dark green/black board surface, visible chalk grain, dust particles',
      lighting: 'warm classroom light hitting the board, chalk glowing against dark surface',
      colorPalette: ['#FFFFFF', '#FFE066', '#66D9FF', '#FF6B6B', '#66FF66'],
      colorMood: 'white chalk on dark green, accent colors for emphasis, warm and educational',
      textureDetail: 'chalk grain and dust, board surface scratches, eraser smudge marks, chalk fingerprints',
      backgroundStyle: 'green or black chalkboard surface with wooden frame, occasional chalk tray with chalk stubs',
      particleEffects: 'chalk dust falling, eraser cloud, chalk bits breaking off, dust motes in projector light',
      cameraWork: 'close-up on drawing hand, slow reveal as diagrams complete, zoom out for full picture',
    },
    music: {
      genre: 'thoughtful piano with academic ambience',
      instruments: ['piano', 'strings (light)', 'chalkboard tapping rhythm', 'ambient classroom'],
      bpmRange: { min: 70, max: 100 },
      mood: 'intellectual curiosity, aha moments, calm focused learning',
      sfxStyle: 'chalk writing on board, chalk snapping, eraser thuds, satisfied "mm-hmm", pen clicking',
    },
    character: {
      proportions: 'chalk-drawn — can be stick figures or detailed, depends on "teacher" skill',
      expressionStyle: 'drawn expressions appearing/changing as chalk animation',
      motionStyle: 'chalk lines appearing in real-time, figures moving frame-by-frame on board',
      eyeStyle: 'simple chalk dots, or more detailed chalk shading for expression',
      costumeApproach: 'minimal — chalk outlines suggest clothing, labeled with text',
    },
    narrative: {
      pacing: 'step-by-step educational reveal, building concepts visually',
      humorType: 'teacher humor — "let me erase this... whoops wrong part", chalk breaking at dramatic moment',
      emotionalArc: 'curiosity → confusion → aha moment → mastery',
      targetAudience: 'educational — all ages, particularly effective for complex concepts',
      toneKeywords: ['educational', 'chalk', 'classroom', 'academic', 'clear', 'step-by-step'],
    },
    prompt: {
      stylePrefix: 'chalk drawing on blackboard, white chalk on dark green surface, visible chalk dust, classroom educational style, hand-drawn diagrams',
      qualityBoost: 'high resolution chalk texture, authentic board surface, chalk dust particles, clean educational layout',
      negativePrompt: '3D, realistic, bright colors, photograph, digital clean, modern UI',
      characterPrefix: 'chalk-drawn figure on blackboard, white chalk outline, educational diagram style, labeled',
      environmentPrefix: 'dark green chalkboard surface, chalk tray at bottom, warm classroom light, educational diagrams',
      videoMotionStyle: 'chalk lines appearing in real-time, progressive drawing, erase and redraw, step-by-step reveal',
    },
    tags: ['chalk', 'blackboard', 'educational', 'classroom', 'drawing', 'academic'],
  }),

  'oil-painting-classic': p({
    id: 'oil-painting-classic',
    name: 'Living Oil Painting',
    category: 'art_medium',
    tagline: 'Masterpieces that breathe',
    description: 'Scenes rendered as oil paintings coming to life — visible brushstrokes, canvas texture, golden varnish glow. Museum-quality art that moves.',
    inspiredBy: 'Old master oil paintings, museum galleries, Rembrandt/Vermeer/Van Gogh aesthetics',
    visual: {
      renderStyle: 'oil painting with visible impasto brushstrokes, canvas weave texture, varnish sheen',
      lighting: 'Rembrandt chiaroscuro — dramatic light from single source, golden warm tones',
      colorPalette: ['#8B6914', '#2C1810', '#DAA520', '#4A0404', '#1A472A'],
      colorMood: 'old master palette — rich earth tones, golden light, deep shadows, occasional vivid accent',
      textureDetail: 'thick impasto paint strokes, visible canvas weave, paint crackle (craquelure), varnish glow',
      backgroundStyle: 'painterly environments — landscapes, interiors, still life backgrounds, all in oil paint style',
      particleEffects: 'paint drips, brushstroke trails, golden dust motes in Rembrandt light',
      cameraWork: 'slow, contemplative movements as if camera moves through a painting, gentle parallax on layers',
    },
    music: {
      genre: 'classical orchestral — Baroque to Romantic period',
      instruments: ['harpsichord', 'violin', 'cello', 'flute', 'chamber ensemble'],
      bpmRange: { min: 60, max: 100 },
      mood: 'contemplative beauty, museum reverence, timeless elegance',
      sfxStyle: 'subtle: brush on canvas, frame creaking, museum silence, footsteps on marble',
    },
    character: {
      proportions: 'portrait-accurate — human proportions as painted by old masters',
      expressionStyle: 'subtle painted expressions — Mona Lisa ambiguity, Vermeer serenity',
      motionStyle: 'slow, painterly — as if the painting is gently animating, brushstroke-aware movement',
      eyeStyle: 'painted eyes with the depth and mystery of old master portraits',
      costumeApproach: 'period-appropriate or classical — painted fabric with visible brushwork',
    },
    narrative: {
      pacing: 'slow, contemplative, meditative — let the art breathe',
      humorType: 'none — pure artistic reverence, or very subtle visual wit',
      emotionalArc: 'beauty → contemplation → deeper meaning → transformation',
      targetAudience: 'adults, art lovers, premium brand content',
      toneKeywords: ['timeless', 'classical', 'painterly', 'museum', 'beautiful', 'contemplative'],
    },
    prompt: {
      stylePrefix: 'oil painting style, visible impasto brushstrokes, canvas texture, Rembrandt chiaroscuro lighting, old master color palette, museum quality',
      qualityBoost: 'masterpiece, gallery quality, visible brushstrokes, golden varnish, authentic oil paint texture',
      negativePrompt: 'digital, 3D render, cartoon, anime, modern, flat, photograph',
      characterPrefix: 'oil-painted portrait figure, old master style, visible brushstrokes, Rembrandt lighting, classical proportions',
      environmentPrefix: 'oil painting landscape/interior, impasto technique, canvas texture, golden hour Rembrandt light, museum quality',
      videoMotionStyle: 'slow painterly animation, brushstroke-aware movement, painting coming to life, gentle parallax',
    },
    tags: ['oil-painting', 'classical', 'museum', 'brushstrokes', 'fine-art', 'timeless'],
  }),

  'felt-craft-stop-motion': p({
    id: 'felt-craft-stop-motion',
    name: 'Felt Craft World',
    category: 'art_medium',
    tagline: 'Hand-stitched with love',
    description: 'Everything made of felt, fabric, buttons, yarn. Stop-motion puppet aesthetic. Visible stitching, cotton filling, button eyes, yarn hair. Handmade cozy charm.',
    inspiredBy: 'Handcraft stop-motion, felt art, plushie culture, cozy craft aesthetic',
    visual: {
      renderStyle: 'stop-motion felt puppets — visible fabric weave, stitching, cotton stuffing peeks',
      lighting: 'warm studio lighting, soft shadows, craft-table intimacy',
      colorPalette: ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#8E44AD'],
      colorMood: 'craft-store bright — saturated felt colors, warm and tactile',
      textureDetail: 'felt fiber texture, visible thread stitching, button details, yarn strand detail, cotton stuffing',
      backgroundStyle: 'felt landscape — stitched trees, button flowers, fabric sky, cotton cloud puffs',
      particleEffects: 'loose thread wisps, cotton snow, button raindrops, sequin sparkles',
      cameraWork: 'intimate close-ups of stitching detail, gentle rack focus between felt elements, stop-motion frame rate',
    },
    music: {
      genre: 'gentle indie folk with toy instruments',
      instruments: ['toy piano', 'music box', 'ukulele', 'gentle bells', 'finger snaps'],
      bpmRange: { min: 80, max: 110 },
      mood: 'cozy handmade warmth, gentle encouragement, bedtime-story comfort',
      sfxStyle: 'fabric: soft fabric sounds, button clicks, scissors snipping, needle through felt, yarn unraveling',
    },
    character: {
      proportions: 'plushie proportions — round bodies, stubby limbs, oversized heads',
      expressionStyle: 'button-eye charm — emotions through body tilt, ear position, arm gestures',
      motionStyle: 'stop-motion frame rate (12fps feel), slightly jerky but endearing, deliberate puppet movement',
      eyeStyle: 'mismatched buttons for eyes — one bigger than the other, or bead eyes',
      costumeApproach: 'sewn-on fabric clothing, felt accessories, yarn scarves, tiny crafted props',
    },
    narrative: {
      pacing: 'gentle, warm, bedtime-story rhythm — slow and cozy',
      humorType: 'gentle physical humor, fabric characters getting tangled, button popping off at wrong moment',
      emotionalArc: 'small kindness → cozy adventure → warm resolution',
      targetAudience: 'children 0-6, parents, craft lovers, cozy-content seekers',
      toneKeywords: ['cozy', 'handmade', 'warm', 'felt', 'gentle', 'craft', 'bedtime'],
    },
    prompt: {
      stylePrefix: 'felt craft stop-motion style, handmade puppet characters, visible stitching, button eyes, fabric landscape, cotton cloud sky, warm studio lighting',
      qualityBoost: 'high quality craft detail, authentic felt texture, stop-motion frame quality, warm lighting',
      negativePrompt: '3D CGI, realistic, dark, scary, digital smooth, anime, photograph',
      characterPrefix: 'felt plushie character, button eyes, visible stitching, yarn hair, round soft proportions, handmade charm',
      environmentPrefix: 'felt and fabric landscape, stitched trees, button flowers, cotton clouds, fabric ground, craft-table world',
      videoMotionStyle: 'stop-motion 12fps feel, puppet manipulation movement, fabric physics, gentle and deliberate',
    },
    tags: ['felt', 'craft', 'handmade', 'stop-motion', 'cozy', 'buttons', 'plushie'],
  }),

  'neon-synthwave': p({
    id: 'neon-synthwave',
    name: 'Neon Synthwave',
    category: 'modern_digital',
    tagline: 'Retrofuturism at 120BPM',
    description: '80s retro-futuristic aesthetic — neon grid floors, chrome text, sunset gradients, VHS scan lines. Synthwave music, DeLorean vibes, palm tree silhouettes.',
    inspiredBy: '80s retrofuturism, synthwave album covers, VHS aesthetic, arcade culture',
    visual: {
      renderStyle: 'neon-on-dark with chrome reflections, VHS scan lines, CRT glow',
      lighting: 'neon pink/cyan/purple glow, sunset gradient sky, chrome reflections',
      colorPalette: ['#FF00FF', '#00FFFF', '#FF6B00', '#9B59B6', '#1A1A2E'],
      colorMood: 'neon magenta and cyan on dark navy/black, sunset gradient from orange to purple',
      textureDetail: 'chrome surface reflections, VHS noise grain, CRT scan lines, neon glow bloom',
      backgroundStyle: 'infinite grid floor disappearing to horizon, sunset gradient sky, palm tree silhouettes, chrome mountains',
      particleEffects: 'neon sparks, digital rain, VHS glitch artifacts, laser lines',
      cameraWork: 'forward-driving perspective along neon grid, slow zoom through neon cityscape, steady-state establishing shots',
    },
    music: {
      genre: 'synthwave / retrowave — analog synth arpeggios, drum machines, bass pads',
      instruments: ['analog synthesizer', 'drum machine', 'bass synth', 'electric guitar (80s tone)', 'vocoder'],
      bpmRange: { min: 100, max: 130 },
      mood: 'nostalgic future, cool night drive, neon-lit confidence',
      sfxStyle: 'retro-digital: VHS rewind, CRT power-on, arcade coin insert, modem dial-up, laser zaps',
    },
    character: {
      proportions: 'stylized human silhouettes, chrome robot characters, neon-outlined figures',
      expressionStyle: 'cool and mysterious — sunglasses at night, enigmatic, stylish',
      motionStyle: 'smooth cruise, confident stride, slow-motion hair-blow, DeLorean-exit dramatic',
      eyeStyle: 'hidden behind sunglasses with neon reflection, or glowing cybernetic',
      costumeApproach: 'leather jacket, aviator sunglasses, neon-accented clothing, 80s power suit',
    },
    narrative: {
      pacing: 'driving steady rhythm, night-cruise energy, building to sunrise reveal',
      humorType: 'none — pure aesthetic mood, or subtle 80s culture nods',
      emotionalArc: 'nostalgic longing, neon-lit confidence, racing toward the future',
      targetAudience: 'teens and adults, tech/music culture, 80s nostalgia',
      toneKeywords: ['retro', 'neon', 'synthwave', '80s', 'cool', 'night', 'chrome', 'aesthetic'],
    },
    prompt: {
      stylePrefix: 'synthwave retrowave aesthetic, neon grid floor, chrome text, 80s sunset gradient, VHS scan lines, neon pink and cyan glow, retro-futuristic',
      qualityBoost: 'high resolution neon glow, chrome reflections, CRT scan line overlay, clean gradient sky',
      negativePrompt: 'realistic, natural, daytime, pastel, cute, children, documentary',
      characterPrefix: 'synthwave character silhouette, neon-outlined, leather jacket, aviator sunglasses with neon reflections, 80s aesthetic',
      environmentPrefix: 'infinite neon grid floor, sunset gradient sky, chrome mountains, palm tree silhouettes, retro-futuristic city skyline',
      videoMotionStyle: 'forward-driving perspective on neon grid, steady cruise, camera push through neon city, VHS artifact transitions',
    },
    tags: ['synthwave', 'neon', 'retro', '80s', 'vaporwave', 'chrome', 'night', 'aesthetic'],
  }),

  'papercut-layered': p({
    id: 'papercut-layered',
    name: 'Paper Cut Layers',
    category: 'art_medium',
    tagline: 'Depth from flat — paper worlds with soul',
    description: 'Multi-layered paper cutout world — parallax depth from layered colored paper. Clean edges, subtle shadows between layers, paper texture visible. Elegant and modern.',
    inspiredBy: 'Paper craft art, shadow box dioramas, layered paper illustration, pop-up books',
    visual: {
      renderStyle: 'layered paper cutouts with parallax depth, visible paper edges casting subtle shadows',
      lighting: 'soft backlighting through paper layers, shadow depth between sheets, warm ambient',
      colorPalette: ['#2196F3', '#4CAF50', '#FFC107', '#FF5722', '#E1BEE7'],
      colorMood: 'limited palette per scene — 3-4 colors of construction paper, elegant and curated',
      textureDetail: 'paper fiber texture, clean cut edges, subtle fold marks, shadow between layers',
      backgroundStyle: 'layered paper landscape — mountains are paper silhouettes, trees are cut shapes, sky is gradient paper',
      particleEffects: 'tiny paper confetti, paper plane flying across, paper snowflakes (literal cut paper)',
      cameraWork: 'parallax camera movement revealing depth between paper layers, gentle side-to-side revealing layers',
    },
    music: {
      genre: 'gentle acoustic with paper-sound percussion',
      instruments: ['acoustic guitar', 'piano', 'paper percussion', 'wind chimes', 'gentle bells'],
      bpmRange: { min: 80, max: 110 },
      mood: 'elegant simplicity, modern craft, mindful creativity',
      sfxStyle: 'paper: scissor cutting, paper sliding, pages turning, gentle paper crinkle',
    },
    character: {
      proportions: 'flat paper cutout shapes — simplified silhouettes, sometimes with folded 3D details',
      expressionStyle: 'silhouette body language, interchangeable face cutouts, shadow puppet expressiveness',
      motionStyle: 'paper sliding between layers, folding/unfolding, shadow puppet articulation',
      eyeStyle: 'cut-out circle eyes, or detailed paper iris on white circle, clean and graphic',
      costumeApproach: 'part of the cutout — clothing is the paper shape itself, different colored paper layers',
    },
    narrative: {
      pacing: 'contemplative, elegant, each scene builds like assembling a paper craft',
      humorType: 'visual wit — paper-based sight gags, clever folding reveals, cut-and-paste comedy',
      emotionalArc: 'simple stories told with elegant restraint, depth from simplicity',
      targetAudience: 'universal — appreciated by design-minded, effective for corporate/educational',
      toneKeywords: ['elegant', 'paper', 'layered', 'craft', 'modern', 'clean', 'depth'],
    },
    prompt: {
      stylePrefix: 'layered paper cutout art, multiple paper layers with parallax depth, clean cut edges, subtle shadows between layers, construction paper texture',
      qualityBoost: 'high quality paper texture, authentic cut edges, beautiful shadow depth, elegant composition',
      negativePrompt: '3D, realistic, photograph, digital smooth, anime, messy, childish scribble',
      characterPrefix: 'paper cutout character, flat layered shapes, clean edges, colored construction paper, shadow depth',
      environmentPrefix: 'layered paper landscape, mountain silhouette layers, paper trees, gradient paper sky, parallax depth between sheets',
      videoMotionStyle: 'parallax layer movement, paper sliding, pop-up reveals, gentle depth-revealing camera drift',
    },
    tags: ['paper', 'cutout', 'layered', 'craft', 'elegant', 'parallax', 'modern'],
  }),

  'pixel-retro-game': p({
    id: 'pixel-retro-game',
    name: 'Pixel Retro Game',
    category: 'modern_digital',
    tagline: 'Press START to begin your story',
    description: '8-bit / 16-bit pixel art game world — limited color palettes, chunky pixels, side-scrolling or top-down, chiptune music, game UI overlays.',
    inspiredBy: 'Classic 8-bit and 16-bit video games, pixel art movement, retro gaming culture',
    visual: {
      renderStyle: 'pixel art — visible square pixels, limited palette per scene, scanline overlay optional',
      lighting: 'flat — pixel shading with dithering patterns, no smooth gradients',
      colorPalette: ['#5B6EE1', '#FBFF86', '#E14A68', '#44891A', '#AB5236'],
      colorMood: 'limited retro palette — NES/SNES era constraints, bold and readable',
      textureDetail: 'visible pixels, dithering for gradients, tile-based patterns, sprite-sheet consistency',
      backgroundStyle: 'tile-based game environments — platformer levels, RPG towns, space shooter backgrounds',
      particleEffects: 'pixel sparkles, 8-bit explosion sprites, coin collect shimmer, health bar',
      cameraWork: 'side-scrolling tracking, static room transitions, top-down exploration',
    },
    music: {
      genre: 'chiptune — 8-bit square wave, triangle wave, noise channel',
      instruments: ['square wave synth', 'triangle bass', 'noise channel drums', 'pulse lead'],
      bpmRange: { min: 120, max: 160 },
      mood: 'adventure energy, level-up triumph, boss-battle tension',
      sfxStyle: 'retro game: coin ding, jump spring, power-up ascending tone, game-over descending tone',
    },
    character: {
      proportions: 'chibi pixel — 16x16 to 32x32 sprites, big head tiny body',
      expressionStyle: 'limited by pixels — 2-3 frame expression changes, body bounce for emotion',
      motionStyle: '2-4 frame walk cycles, sprite-swap animation, bounce physics',
      eyeStyle: '2-3 pixels for eyes, blinking is one frame swap',
      costumeApproach: 'color-defined — red hero, blue rival, green healer, yellow merchant',
    },
    narrative: {
      pacing: 'level-based progression, increasing difficulty, boss encounters, reward cycles',
      humorType: 'game-logic humor — NPCs repeating dialogue, absurd inventory items, speedrun jokes',
      emotionalArc: 'humble beginning → power-up → boss challenge → victory → new quest',
      targetAudience: 'gamers, tech audience, nostalgia seekers, indie game culture',
      toneKeywords: ['retro', 'pixel', 'game', '8-bit', 'adventure', 'nostalgic', 'chiptune'],
    },
    prompt: {
      stylePrefix: 'pixel art style, 16-bit retro game aesthetic, visible square pixels, limited color palette, tile-based environment, game UI elements',
      qualityBoost: 'clean pixel art, consistent sprite style, authentic retro palette, no anti-aliasing',
      negativePrompt: 'realistic, smooth, 3D, high resolution photo, modern, blurry, anti-aliased',
      characterPrefix: 'pixel art character sprite, 32x32 style, chibi proportions, limited palette, idle animation pose',
      environmentPrefix: 'pixel art game environment, tile-based, retro color palette, platformer or RPG world, game UI overlay',
      videoMotionStyle: 'sprite-based animation, frame-limited movement, side-scroll camera, level progression',
    },
    tags: ['pixel', 'retro', 'game', '8-bit', '16-bit', 'chiptune', 'nostalgia'],
  }),

  'stained-glass-cathedral': p({
    id: 'stained-glass-cathedral',
    name: 'Stained Glass Cathedral',
    category: 'art_medium',
    tagline: 'Stories told in light and glass',
    description: 'Scenes depicted as stained glass windows — bold lead lines, jewel-toned translucent glass, backlit with warm light. Medieval cathedral meets modern storytelling.',
    inspiredBy: 'Gothic cathedral windows, rose windows, medieval illuminated art, Tiffany glass',
    visual: {
      renderStyle: 'stained glass panels — thick lead came lines, translucent colored glass, backlit glow',
      lighting: 'strong backlighting through glass — jewel tones glow, warm amber light, color projections on floor',
      colorPalette: ['#00008B', '#8B0000', '#FFD700', '#006400', '#800080'],
      colorMood: 'deep jewel tones — sapphire blue, ruby red, emerald green, gold — glowing with light',
      textureDetail: 'glass texture with bubbles and variations, lead came joints, patina on metal, light refraction',
      backgroundStyle: 'cathedral interior, rose window frames, gothic arched panels, stone wall texture',
      particleEffects: 'colored light projections on stone floor, dust motes in colored light beams',
      cameraWork: 'slow upward tilt revealing full window, close-up on glass detail, rack focus through colored light',
    },
    music: {
      genre: 'sacred choral with organ and chamber ensemble',
      instruments: ['pipe organ', 'choir', 'cello', 'harp', 'bells'],
      bpmRange: { min: 50, max: 80 },
      mood: 'reverent, transcendent, sacred beauty, timeless devotion',
      sfxStyle: 'cathedral: echoing footsteps, organ reverb, bell tolling, stone echo',
    },
    character: {
      proportions: 'medieval art proportions — slightly elongated, flat, iconic poses',
      expressionStyle: 'serene iconic faces — medieval art expression, minimal but meaningful',
      motionStyle: 'very slow — glass pieces shifting subtly, light changing angle, minimal animation',
      eyeStyle: 'simple glass-rendered, outlined in lead, serene gaze',
      costumeApproach: 'medieval robes, halos for sacred figures, bold flat-color glass panels for clothing',
    },
    narrative: {
      pacing: 'slow, meditative, each window tells one chapter of the story',
      humorType: 'none — pure reverence and beauty',
      emotionalArc: 'awe → contemplation → revelation → transcendence',
      targetAudience: 'premium brand content, heritage, luxury, spiritual, art lovers',
      toneKeywords: ['sacred', 'stained-glass', 'jewel', 'cathedral', 'timeless', 'transcendent'],
    },
    prompt: {
      stylePrefix: 'stained glass window art style, bold lead came lines, jewel-toned translucent glass, backlit cathedral light, medieval art composition',
      qualityBoost: 'masterpiece glass art, authentic lead came, jewel-tone translucency, cathedral light quality',
      negativePrompt: '3D, cartoon, anime, modern, photograph, flat design, dark',
      characterPrefix: 'stained glass figure, medieval art proportions, lead-outlined, jewel-colored glass, iconic serene pose',
      environmentPrefix: 'gothic cathedral window frame, rose window composition, stone tracery, colored light streaming through glass',
      videoMotionStyle: 'very slow — light angle shifting, glass pieces gently glowing, meditative camera movement',
    },
    tags: ['stained-glass', 'cathedral', 'medieval', 'jewel', 'sacred', 'light', 'art'],
  }),

  'graffiti-street-art': p({
    id: 'graffiti-street-art',
    name: 'Street Art Graffiti',
    category: 'modern_digital',
    tagline: 'The city is the canvas',
    description: 'Urban street art — spray paint on brick walls, stencil art, tag lettering, wheat-paste posters. Vibrant, rebellious, authentic. The wall comes alive.',
    inspiredBy: 'Banksy, urban murals, hip-hop culture visual art, street art festivals',
    visual: {
      renderStyle: 'spray paint on textured walls — visible spray grain, drip marks, stencil edges, paint opacity',
      lighting: 'harsh urban — streetlights, brick wall texture catching afternoon sun, underpass fluorescent',
      colorPalette: ['#FF0000', '#00FF00', '#FFFF00', '#FF00FF', '#000000'],
      colorMood: 'vibrant spray-can colors on grey/brown urban surfaces, high contrast',
      textureDetail: 'brick wall texture under paint, spray paint grain, drip tracks, stencil mask edges, wheatpaste paper wrinkles',
      backgroundStyle: 'urban walls, underpasses, train cars, abandoned buildings, warehouse interiors',
      particleEffects: 'spray paint mist, paint drips running, stencil spray edges, paper peeling',
      cameraWork: 'urban walker POV, discovery shots (turning corner to see mural), time-lapse painting, tracking along wall',
    },
    music: {
      genre: 'hip-hop / lo-fi beats with jazz samples',
      instruments: ['turntable scratches', 'boom-bap drums', 'jazz sample loops', 'bass', 'vinyl crackle'],
      bpmRange: { min: 85, max: 100 },
      mood: 'urban cool, creative rebellion, street wisdom, authentic expression',
      sfxStyle: 'urban: spray can shake and hiss, cap click, marker squeak, train passing, boombox in distance',
    },
    character: {
      proportions: 'graffiti-style — exaggerated features, bold outlines, tag-lettering stylization',
      expressionStyle: 'bold graphic — street art expressiveness, stencil faces, wheatpaste portraits',
      motionStyle: 'spray-paint appearing, stencil reveal, wall mural animating, tag letters forming',
      eyeStyle: 'graphic bold — large outlined, stencil-cut, or photo-realistic wheatpaste eyes',
      costumeApproach: 'streetwear — hoodies, caps, sneakers, bandanas, paint-stained hands',
    },
    narrative: {
      pacing: 'rhythmic like a beat — visual rhythm matching music, reveal-based storytelling',
      humorType: 'subversive social commentary, visual irony, clever juxtaposition',
      emotionalArc: 'expression → rebellion → community → transformation of space',
      targetAudience: 'teens and young adults, urban culture, music industry, social commentary',
      toneKeywords: ['urban', 'street', 'graffiti', 'rebellious', 'authentic', 'bold', 'creative'],
    },
    prompt: {
      stylePrefix: 'street art graffiti style, spray paint on brick wall, stencil art, bold colors, urban texture, drip marks, authentic street art',
      qualityBoost: 'high resolution wall texture, authentic spray paint grain, vivid colors on urban surface',
      negativePrompt: 'clean, minimal, corporate, 3D render, anime, cute, countryside',
      characterPrefix: 'graffiti-style character on wall, bold outlines, spray-paint texture, urban art proportions, street art expression',
      environmentPrefix: 'urban brick wall with layers of graffiti, spray paint colors, stencil art, underpass or warehouse, street art context',
      videoMotionStyle: 'spray paint appearing on wall, stencil reveal, time-lapse mural painting, urban walker discovery',
    },
    tags: ['graffiti', 'street-art', 'urban', 'spray-paint', 'hip-hop', 'rebellious', 'bold'],
  }),

  'blueprint-technical': p({
    id: 'blueprint-technical',
    name: 'Blueprint Technical',
    category: 'modern_digital',
    tagline: 'Engineer\'s imagination made visible',
    description: 'Technical blueprint aesthetic — white lines on deep blue background, precise measurements, exploded diagrams, patent-drawing style. Technical beauty.',
    inspiredBy: 'Architectural blueprints, patent drawings, engineering schematics, Da Vinci codex',
    visual: {
      renderStyle: 'white line drawing on deep blueprint blue, cyanotype print texture, technical precision',
      lighting: 'flat — no shadows, pure technical drawing, occasional glow on key components',
      colorPalette: ['#FFFFFF', '#0A1628', '#1E3A5F', '#5DADE2', '#F4D03F'],
      colorMood: 'blueprint blue-and-white with occasional gold accent for measurements and callouts',
      textureDetail: 'cyanotype paper texture, precise line weight variations, measurement annotation marks',
      backgroundStyle: 'deep blueprint blue field, graph paper grid subtly visible, compass rose in corner',
      particleEffects: 'measurement lines extending, grid dots, schematic lines drawing themselves',
      cameraWork: 'steady technical zoom, exploded-view animation, cross-section reveals, measurement fly-throughs',
    },
    music: {
      genre: 'minimal electronic with precision timing',
      instruments: ['sine wave synth', 'clean electronic pulse', 'minimal piano', 'subtle clicks'],
      bpmRange: { min: 100, max: 120 },
      mood: 'precise, intellectual, engineering confidence, quiet innovation pride',
      sfxStyle: 'technical: drafting pen scratch, compass click, ruler slide, measurement ping, machine precision',
    },
    character: {
      proportions: 'technical drawing — proportional human figure studies, Da Vinci Vitruvian style',
      expressionStyle: 'none — pure technical figures, anonymous but purposeful',
      motionStyle: 'precise mechanical — technical assembly animation, exploded views, cross-sections',
      eyeStyle: 'none — figures are technical drawings, not characters',
      costumeApproach: 'technical outline only, no detail beyond anatomical reference',
    },
    narrative: {
      pacing: 'methodical reveal — component by component, building to complete system',
      humorType: 'none — pure technical elegance',
      emotionalArc: 'curiosity → understanding → appreciation of engineering beauty',
      targetAudience: 'tech companies, engineering, B2B, product launches, patent presentations',
      toneKeywords: ['technical', 'blueprint', 'precise', 'engineering', 'clean', 'intellectual'],
    },
    prompt: {
      stylePrefix: 'blueprint technical drawing, white lines on deep blue, precise measurements and annotations, engineering schematic, cyanotype texture',
      qualityBoost: 'crisp line work, authentic blueprint texture, precise measurements, technical detail',
      negativePrompt: 'colorful, cartoon, realistic photo, 3D render, organic, messy, artistic',
      characterPrefix: 'technical figure drawing, white outline on blueprint blue, proportional study, Da Vinci schematic style',
      environmentPrefix: 'blueprint grid background, deep cyanotype blue, measurement annotations, compass rose, technical title block',
      videoMotionStyle: 'lines drawing themselves, exploded assembly animation, cross-section reveals, measurement callouts appearing',
    },
    tags: ['blueprint', 'technical', 'engineering', 'schematic', 'precise', 'B2B', 'product'],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // CULTURAL STYLES — Region-specific art traditions
  // ═══════════════════════════════════════════════════════════════════════════

  'madhubani-folk': p({
    id: 'madhubani-folk',
    name: 'Madhubani Folk Art',
    category: 'cultural_style',
    tagline: 'Nature and mythology in vibrant line work',
    description: 'Indian Madhubani painting tradition — intricate line patterns, natural dyes, mythological themes, fish-eye motifs, floral borders. Mithila village art tradition.',
    inspiredBy: 'Madhubani/Mithila painting tradition from Bihar, India',
    visual: {
      renderStyle: 'hand-drawn Madhubani line art — double-line borders, geometric fills, natural pigment colors',
      lighting: 'flat — no shadows, pure pattern and color, traditional art illumination',
      colorPalette: ['#E74C3C', '#F39C12', '#2ECC71', '#2980B9', '#000000'],
      colorMood: 'natural dye colors — turmeric yellow, indigo blue, vermillion red, leaf green, lamp black',
      textureDetail: 'visible hand-drawn lines, cross-hatch fills, dot patterns, finger-pressed textures',
      backgroundStyle: 'bordered panels filled with nature motifs — fish, peacocks, lotus, sun, moon, trees',
      particleEffects: 'floating floral petals, fish swimming across frame, peacock feathers drifting',
      cameraWork: 'slow pan across intricate panels, zoom into detail work, reveal of full composition',
    },
    music: {
      genre: 'Indian folk with Maithili traditions',
      instruments: ['dholak', 'bansuri', 'harmonium', 'manjira', 'sitar'],
      bpmRange: { min: 80, max: 120 },
      mood: 'earthy, devotional, festive village celebration, nature reverence',
      sfxStyle: 'nature: birds, river flowing, temple bells, mortar grinding pigments',
    },
    character: {
      proportions: 'stylized flat — elongated eyes, profile view faces, decorative clothing patterns',
      expressionStyle: 'iconic folk art faces — large almond eyes, serene expressions, symbolic gestures',
      motionStyle: 'slow graceful movement, traditional dance poses, symbolic hand gestures (mudras)',
      eyeStyle: 'large elongated fish-shaped eyes, heavy black outline, expressive despite flatness',
      costumeApproach: 'traditional Indian attire — saris with Madhubani patterns, ornate jewelry, flowers in hair',
    },
    narrative: {
      pacing: 'meditative storytelling, each frame a complete artwork, contemplative reveals',
      humorType: 'gentle folk wisdom humor, animal fable wit',
      emotionalArc: 'nature harmony → human challenge → divine guidance → community celebration',
      targetAudience: 'cultural content, educational, heritage brands, India-focused campaigns',
      toneKeywords: ['folk', 'madhubani', 'india', 'nature', 'traditional', 'sacred', 'earthy'],
    },
    prompt: {
      stylePrefix: 'Madhubani folk art painting style, intricate line patterns, natural dye colors, double-line borders, geometric fills, Indian Mithila tradition',
      qualityBoost: 'authentic Madhubani technique, detailed line work, natural pigment colors, museum quality folk art',
      negativePrompt: '3D, realistic, modern, digital, anime, dark, western art',
      characterPrefix: 'Madhubani style figure, profile view, elongated eyes, decorative clothing, folk art proportions',
      environmentPrefix: 'Madhubani painted world, bordered panels, fish and peacock motifs, lotus ponds, village scenes',
      videoMotionStyle: 'lines drawing themselves, patterns filling in, traditional art creation process',
    },
    tags: ['madhubani', 'india', 'folk', 'traditional', 'mithila', 'nature', 'cultural'],
  }),

  'ukiyo-e-floating': p({
    id: 'ukiyo-e-floating',
    name: 'Ukiyo-e Floating World',
    category: 'cultural_style',
    tagline: 'Woodblock dreams on mulberry paper',
    description: 'Japanese ukiyo-e woodblock print aesthetic — bold outlines, flat color areas, wave patterns, cherry blossoms, Mt. Fuji landscapes. Edo period art tradition.',
    inspiredBy: 'Japanese ukiyo-e woodblock prints, Hokusai, Hiroshige, Utamaro traditions',
    visual: {
      renderStyle: 'woodblock print — bold black outlines, flat color areas, visible wood grain texture, registration marks',
      lighting: 'flat with atmospheric gradient skies, bokashi shading technique',
      colorPalette: ['#1A3C6E', '#C0392B', '#F5E6CA', '#2C3E50', '#DAA520'],
      colorMood: 'indigo blue dominance, vermillion accents, paper-toned neutrals, gold leaf touches',
      textureDetail: 'wood grain texture, mulberry paper fiber, ink absorption, visible print registration',
      backgroundStyle: 'iconic Japanese landscapes — great waves, Mt. Fuji, bridges, cherry blossoms, tea houses',
      particleEffects: 'cherry blossom petals, snow falling, wave spray, floating lanterns',
      cameraWork: 'static frames like prints, slow dissolve between panels, gentle parallax on layers',
    },
    music: {
      genre: 'traditional Japanese with shamisen and shakuhachi',
      instruments: ['shamisen', 'shakuhachi', 'koto', 'taiko drums', 'temple bells'],
      bpmRange: { min: 60, max: 100 },
      mood: 'contemplative elegance, seasonal beauty, fleeting moment appreciation (mono no aware)',
      sfxStyle: 'Japanese: bamboo fountain, wind chimes, rain on tiles, sliding shoji doors',
    },
    character: {
      proportions: 'ukiyo-e proportions — elongated figures, graceful poses, flowing robes',
      expressionStyle: 'subtle reserved — emotion conveyed through posture and context, not face',
      motionStyle: 'slow graceful movement, kabuki dramatic pauses, floating sleeve gestures',
      eyeStyle: 'narrow elegant lines, minimal but expressive, woodblock simplicity',
      costumeApproach: 'elaborate kimono with seasonal patterns, obi sashes, traditional accessories',
    },
    narrative: {
      pacing: 'seasonal contemplation, each scene a complete print, unhurried beauty',
      humorType: 'subtle irony, playful kabuki references, nature metaphors',
      emotionalArc: 'spring hope → summer energy → autumn reflection → winter stillness',
      targetAudience: 'art lovers, Japan-focused content, premium brands, cultural education',
      toneKeywords: ['ukiyo-e', 'japanese', 'woodblock', 'elegant', 'seasonal', 'contemplative'],
    },
    prompt: {
      stylePrefix: 'ukiyo-e Japanese woodblock print style, bold black outlines, flat color areas, Hokusai-inspired, mulberry paper texture, Edo period art',
      qualityBoost: 'museum quality ukiyo-e, authentic woodblock technique, visible wood grain, traditional pigments',
      negativePrompt: '3D, CGI, modern, anime (modern style), realistic photo, western art',
      characterPrefix: 'ukiyo-e style figure, woodblock print, flowing kimono, elegant pose, traditional Japanese proportions',
      environmentPrefix: 'Japanese woodblock landscape, great wave, Mt. Fuji, cherry blossoms, bridge over water, seasonal atmosphere',
      videoMotionStyle: 'print layers assembling, gentle parallax, cherry blossoms drifting, wave motion',
    },
    tags: ['ukiyo-e', 'japanese', 'woodblock', 'wave', 'cherry-blossom', 'traditional', 'elegant'],
  }),

  'arabesque-geometric': p({
    id: 'arabesque-geometric',
    name: 'Arabesque Geometry',
    category: 'cultural_style',
    tagline: 'Infinite patterns reflecting divine order',
    description: 'Islamic geometric art — tessellating star patterns, arabesque curves, zellige tile work, calligraphic integration. Mathematical beauty meets spiritual depth.',
    inspiredBy: 'Islamic geometric art, Alhambra tilework, Persian mosque decoration, Moorish architecture',
    visual: {
      renderStyle: 'geometric tessellation — precise mathematical patterns, interlocking stars, arabesque vine scrolls',
      lighting: 'warm golden light through geometric screens (mashrabiya), dappled pattern shadows',
      colorPalette: ['#1B4F72', '#D4AF37', '#1E8449', '#922B21', '#F5F5DC'],
      colorMood: 'deep blue and gold dominance, emerald green accents, ivory backgrounds, jewel tones',
      textureDetail: 'zellige tile mosaic, carved plaster, calligraphic ink on vellum, gilded edges',
      backgroundStyle: 'mosque interiors, courtyard fountains, geometric screen shadows, garden paradise',
      particleEffects: 'geometric shapes assembling, light through mashrabiya creating star patterns, rose petals',
      cameraWork: 'hypnotic zoom into tessellation, orbit around geometric domes, light-play reveals',
    },
    music: {
      genre: 'Arabic maqam with oud and qanun',
      instruments: ['oud', 'qanun', 'ney', 'darbuka', 'riq'],
      bpmRange: { min: 70, max: 110 },
      mood: 'contemplative, mathematically precise, spiritually uplifting, garden paradise tranquility',
      sfxStyle: 'geometric: tile clicking into place, fountain water, call echoing, wind through arches',
    },
    character: {
      proportions: 'absent or decorative — figures are secondary to pattern, shown in miniature painting style',
      expressionStyle: 'serene contemplation, geometric harmony, calligraphic gestures',
      motionStyle: 'patterns building outward from center, tessellation growing, arabesque flowing',
      eyeStyle: 'miniature painting style — delicate, almond-shaped, decorative',
      costumeApproach: 'richly patterned robes echoing the geometric backgrounds, calligraphic details',
    },
    narrative: {
      pacing: 'meditative geometric building, patterns growing more complex, hypnotic rhythm',
      humorType: 'none — pure mathematical and spiritual beauty',
      emotionalArc: 'simplicity → complexity → infinity → unity → peace',
      targetAudience: 'MENA markets, architecture, luxury brands, cultural heritage, mathematical beauty',
      toneKeywords: ['geometric', 'arabesque', 'islamic', 'tessellation', 'golden', 'infinite', 'sacred'],
    },
    prompt: {
      stylePrefix: 'Islamic geometric art, arabesque tessellation, zellige tilework, gold and deep blue, mathematical precision, calligraphic integration, Moorish architecture',
      qualityBoost: 'masterpiece geometric precision, authentic zellige, gilded calligraphy, architectural detail',
      negativePrompt: '3D cartoon, anime, modern, figural, western, dark horror, messy',
      characterPrefix: 'Persian miniature painting figure, richly patterned robes, calligraphic setting, decorative frame',
      environmentPrefix: 'Islamic architecture interior, geometric dome, arabesque walls, fountain courtyard, zellige floor, mashrabiya light',
      videoMotionStyle: 'geometric patterns building from center, tessellation assembling, light through carved screens',
    },
    tags: ['arabesque', 'geometric', 'islamic', 'tile', 'tessellation', 'calligraphy', 'MENA'],
  }),

  'kente-woven': p({
    id: 'kente-woven',
    name: 'Kente Woven Stories',
    category: 'cultural_style',
    tagline: 'Every pattern tells a proverb',
    description: 'West African kente cloth aesthetic — bold geometric weave patterns, symbolic colors (gold=royalty, black=wisdom), Ashanti textile art. Patterns encode proverbs and history.',
    inspiredBy: 'Ghanaian/Ashanti kente cloth weaving, African textile art traditions, Adinkra symbols',
    visual: {
      renderStyle: 'woven textile — visible thread cross-weave, geometric strip patterns, cloth drape and fold',
      lighting: 'warm African golden light, cloth catching sunlight, rich fabric sheen',
      colorPalette: ['#D4AF37', '#000000', '#E74C3C', '#27AE60', '#F39C12'],
      colorMood: 'royal gold and black dominance, ceremonial red and green accents, bold and proud',
      textureDetail: 'woven thread texture, strip-loom patterns, cloth fold creases, silk sheen on threads',
      backgroundStyle: 'kente patterns as living backgrounds, Ashanti palace, weaving village, ceremonial ground',
      particleEffects: 'golden threads weaving, cloth unfurling, Adinkra symbols floating, festival dust',
      cameraWork: 'macro weaving detail, cloth unfurling reveals, pattern zoom, ceremonial wide shots',
    },
    music: {
      genre: 'West African drumming with highlife influences',
      instruments: ['djembe', 'talking drums', 'kora', 'balafon', 'shekere'],
      bpmRange: { min: 100, max: 140 },
      mood: 'proud celebration, ancestral wisdom, community strength, festive energy',
      sfxStyle: 'weaving: shuttle click, loom rhythm, festival drums, marketplace bustle, proverb recitation',
    },
    character: {
      proportions: 'proud and upright, dignified bearing, ceremonial presence',
      expressionStyle: 'wise and warm, elder dignity, youthful energy, communal joy',
      motionStyle: 'ceremonial movement, Adowa dance gestures, dignified procession, weaving rhythm',
      eyeStyle: 'warm and knowing, elder wisdom, expressive with cultural context',
      costumeApproach: 'kente cloth draped as toga/wrapper, Adinkra-stamped accessories, gold jewelry, ceremonial regalia',
    },
    narrative: {
      pacing: 'proverb-led storytelling, each scene illustrates a wisdom, call-and-response rhythm',
      humorType: 'Anansi trickster wit, proverbial wisdom humor, community storytelling banter',
      emotionalArc: 'ancestral call → community gathering → wisdom sharing → future generation blessing',
      targetAudience: 'African diaspora, cultural education, heritage brands, West Africa markets',
      toneKeywords: ['kente', 'ashanti', 'african', 'woven', 'proverb', 'royal', 'wisdom'],
    },
    prompt: {
      stylePrefix: 'kente cloth woven art style, bold geometric strip patterns, gold and black dominance, Ashanti textile tradition, Adinkra symbol integration',
      qualityBoost: 'authentic kente weave texture, silk thread sheen, ceremonial quality, rich fabric detail',
      negativePrompt: 'western, modern minimal, anime, 3D cartoon, cold colors, plain background',
      characterPrefix: 'figure in kente cloth, ceremonial draping, Adinkra accessories, proud dignified bearing, warm lighting',
      environmentPrefix: 'kente pattern world, Ashanti palace, weaving village, ceremonial grounds, golden light, fabric landscape',
      videoMotionStyle: 'threads weaving, cloth unfurling, pattern reveals, ceremonial dance, Adinkra symbols forming',
    },
    tags: ['kente', 'african', 'woven', 'ashanti', 'textile', 'gold', 'cultural', 'proverb'],
  }),

  'batik-wax-resist': p({
    id: 'batik-wax-resist',
    name: 'Batik Wax Resist',
    category: 'cultural_style',
    tagline: 'Wax, dye, and patience create beauty',
    description: 'Southeast Asian batik tradition — wax-resist dyeing, crackle texture, indigo and brown natural dyes, organic flowing patterns. Javanese court art meets village craft.',
    inspiredBy: 'Indonesian/Javanese batik tradition, Malaysian batik, Thai batik, UNESCO heritage craft',
    visual: {
      renderStyle: 'wax-resist dye on fabric — crackle veining where wax cracked, organic flowing lines, layered dye colors',
      lighting: 'warm tropical — afternoon sun through batik cloth, dappled garden light',
      colorPalette: ['#4A2511', '#1B4F72', '#F5E6CA', '#8B4513', '#DAA520'],
      colorMood: 'indigo and brown soga dominance, cream wax-resist areas, natural dye palette',
      textureDetail: 'wax crackle veining, fabric weave under dye, copper stamp (cap) patterns, hand-drawn (tulis) lines',
      backgroundStyle: 'batik patterns as environments — mega mendung clouds, kawung fruit, parang waves, truntum flowers',
      particleEffects: 'wax droplets from canting tool, dye flowing, fabric billowing, tropical flowers',
      cameraWork: 'macro crackle detail, cloth draping reveals, pattern creation process, garden setting wide shots',
    },
    music: {
      genre: 'Javanese gamelan with keroncong undertones',
      instruments: ['gamelan bonang', 'saron', 'kendang', 'suling', 'rebab'],
      bpmRange: { min: 60, max: 100 },
      mood: 'contemplative patience, tropical garden serenity, court elegance, craft meditation',
      sfxStyle: 'craft: hot wax sizzle, canting tip on cloth, dye bubbling, water rinsing, cloth drying in breeze',
    },
    character: {
      proportions: 'wayang-influenced — elegant elongated, graceful hand gestures, ceremonial poise',
      expressionStyle: 'serene patience, craft focus, gentle smile, traditional grace',
      motionStyle: 'slow deliberate — artisan precision, court dance fluidity, batik creation rhythm',
      eyeStyle: 'gentle almond eyes, traditional beauty, wayang-puppet influenced',
      costumeApproach: 'batik sarong and kebaya, natural dye tones, silver/gold accessories, court attire',
    },
    narrative: {
      pacing: 'patient craft storytelling — wax application, dyeing, reveal — each stage a chapter',
      humorType: 'gentle village humor, artisan wisdom, nature-based metaphors',
      emotionalArc: 'blank cloth → wax mapping → dye immersion → crackle discovery → finished beauty',
      targetAudience: 'Southeast Asia markets, craft/heritage, fashion brands, cultural education',
      toneKeywords: ['batik', 'javanese', 'wax', 'craft', 'tropical', 'patient', 'elegant', 'heritage'],
    },
    prompt: {
      stylePrefix: 'batik wax-resist art style, crackle veining texture, indigo and soga brown, organic flowing patterns, Javanese textile tradition',
      qualityBoost: 'authentic batik crackle texture, natural dye colors, visible canting lines, fabric grain detail',
      negativePrompt: '3D, modern digital, bright neon, western, anime, cold colors, geometric only',
      characterPrefix: 'figure in batik sarong, wayang-influenced proportions, craft setting, traditional Southeast Asian',
      environmentPrefix: 'batik pattern world, mega mendung cloud patterns, tropical garden, Javanese court, natural dye colors',
      videoMotionStyle: 'wax dripping from canting, dye colors blooming on cloth, crackle patterns forming, cloth unfurling',
    },
    tags: ['batik', 'javanese', 'southeast-asia', 'wax', 'textile', 'craft', 'heritage', 'indigo'],
  }),

  'aboriginal-dot-painting': p({
    id: 'aboriginal-dot-painting',
    name: 'Aboriginal Dot Painting',
    category: 'cultural_style',
    tagline: 'Dreamtime stories in sacred dots',
    description: 'Australian Aboriginal dot painting — concentric dot patterns, earth pigment colors, Dreamtime songlines mapped in art. Sacred geography rendered in ochre and dot clusters.',
    inspiredBy: 'Australian Aboriginal art traditions, Western Desert art movement, Dreamtime storytelling',
    visual: {
      renderStyle: 'dot painting — thousands of precise dots forming patterns, earth pigment on bark/canvas, sacred geometry',
      lighting: 'warm outback — red earth sunset, starfield nights, dry golden light',
      colorPalette: ['#8B4513', '#D4AF37', '#FFFFFF', '#E74C3C', '#000000'],
      colorMood: 'earth ochre reds and yellows, white clay dots, black outlines, desert palette',
      textureDetail: 'individual dot clusters, bark texture, sand grain, ochre pigment granularity, canvas weave',
      backgroundStyle: 'dot-painted landscape — rivers as dot lines, animals as dot clusters, sacred sites as concentric circles',
      particleEffects: 'dots assembling into patterns, ochre dust, stars forming songlines, desert sand swirl',
      cameraWork: 'aerial view of dot map, zoom revealing dot detail, slow orbit around concentric patterns',
    },
    music: {
      genre: 'Australian Indigenous with didgeridoo and clapsticks',
      instruments: ['didgeridoo', 'clapsticks', 'bullroarer', 'voice chanting', 'hand clap rhythms'],
      bpmRange: { min: 60, max: 90 },
      mood: 'ancient sacred, desert vastness, songline journey, Dreamtime connection',
      sfxStyle: 'outback: wind across desert, didgeridoo drone, clapstick rhythm, birds at waterhole, thunder distant',
    },
    character: {
      proportions: 'dot-formed — figures made of dot clusters, X-ray art style showing internal features',
      expressionStyle: 'symbolic — characters convey meaning through position and dot-pattern context',
      motionStyle: 'ceremonial dance, dot patterns shifting and flowing, songline journey movement',
      eyeStyle: 'dot clusters for eyes, concentric circle emphasis, ochre-painted',
      costumeApproach: 'ceremonial body paint in dot patterns, earth pigments on skin, minimal clothing',
    },
    narrative: {
      pacing: 'Dreamtime pace — ancient stories told slowly, landscape as narrative, songline journey',
      humorType: 'trickster animal stories, clever creation humor',
      emotionalArc: 'creation → journey → lesson → sacred knowledge → continuation',
      targetAudience: 'Oceania markets, cultural heritage, environmental brands, art education',
      toneKeywords: ['aboriginal', 'dot', 'dreamtime', 'sacred', 'ochre', 'songline', 'ancient'],
    },
    prompt: {
      stylePrefix: 'Aboriginal dot painting style, concentric dot patterns, earth ochre pigments, sacred Dreamtime art, Australian Indigenous tradition',
      qualityBoost: 'authentic dot technique, ochre pigment texture, bark canvas grain, sacred geometry precision',
      negativePrompt: '3D, modern digital, bright neon, cartoon, anime, western realism',
      characterPrefix: 'dot-painting figure, X-ray art style, ochre pigment colors, ceremonial pose, concentric dot patterns',
      environmentPrefix: 'dot-painted Australian landscape, red earth, waterhole concentric circles, songline paths, starfield Dreamtime sky',
      videoMotionStyle: 'dots assembling into sacred patterns, songline paths drawing, concentric circles expanding, ochre colors blooming',
    },
    tags: ['aboriginal', 'dot-painting', 'dreamtime', 'ochre', 'australia', 'sacred', 'songline'],
  }),

  'calligraphy-ink-wash': p({
    id: 'calligraphy-ink-wash',
    name: 'Ink Wash Calligraphy',
    category: 'cultural_style',
    tagline: 'Mountains born from a single brushstroke',
    description: 'East Asian ink wash painting (sumi-e/shui-mo) — black ink on rice paper, graduated washes, empty space as composition, calligraphic brushwork. Zen minimalism meets landscape grandeur.',
    inspiredBy: 'Chinese shui-mo, Japanese sumi-e, Korean sumukhwa ink wash painting traditions',
    visual: {
      renderStyle: 'ink wash on rice paper — graduated black ink tones, dry brush texture, wet-on-wet bleeding, red seal stamps',
      lighting: 'no lighting — pure ink on white paper, atmosphere through ink density',
      colorPalette: ['#1A1A1A', '#4A4A4A', '#8A8A8A', '#D0D0D0', '#C0392B'],
      colorMood: 'black ink gradations on white paper, occasional vermillion seal accent',
      textureDetail: 'rice paper fiber, ink absorption halos, dry brush scratches, wet ink bleeding, seal stamp impression',
      backgroundStyle: 'misty mountains, bamboo forests, lone boats on vast lakes, empty space (ma) as element',
      particleEffects: 'ink drops falling into water, mist forming, brush strokes appearing, ink bleeding on paper',
      cameraWork: 'scroll unrolling reveal, zoom into brushstroke detail, contemplative static frames, slow pan across landscape',
    },
    music: {
      genre: 'East Asian traditional — guqin, pipa, erhu',
      instruments: ['guqin', 'pipa', 'erhu', 'dizi', 'temple bell'],
      bpmRange: { min: 40, max: 80 },
      mood: 'meditative silence, mountain solitude, poetic contemplation, Zen clarity',
      sfxStyle: 'nature: mountain stream, wind through bamboo, bird call in silence, brush on paper',
    },
    character: {
      proportions: 'minimal — figures are small in vast landscapes, a few brushstrokes suggesting a person',
      expressionStyle: 'conveyed through posture alone — lone figure on mountain, scholar by stream',
      motionStyle: 'brush stroke appearing, ink bleeding, very slow atmospheric movement',
      eyeStyle: 'dot or absent — figures are distant, suggested rather than detailed',
      costumeApproach: 'scholar robes suggested by brush strokes, minimal detail, texture through ink technique',
    },
    narrative: {
      pacing: 'contemplative silence between moments, each stroke deliberate, space as narrative',
      humorType: 'Zen koan wit — profound simplicity, unexpected emptiness',
      emotionalArc: 'emptiness → single stroke → composition building → vast completeness → return to emptiness',
      targetAudience: 'CJK markets, premium brands, meditation/wellness, art education, luxury',
      toneKeywords: ['ink-wash', 'calligraphy', 'zen', 'minimalist', 'east-asian', 'contemplative', 'brush'],
    },
    prompt: {
      stylePrefix: 'sumi-e ink wash painting, black ink on rice paper, calligraphic brushstrokes, graduated ink washes, Zen minimalism, East Asian tradition',
      qualityBoost: 'museum quality ink wash, authentic brushstroke texture, rice paper grain, masterful ink control',
      negativePrompt: 'color, 3D, modern, cartoon, digital, busy, cluttered, western',
      characterPrefix: 'ink wash figure, minimal brushstrokes, scholar in landscape, calligraphic suggestion, distant and contemplative',
      environmentPrefix: 'ink wash landscape, misty mountains, bamboo forest, vast empty space, rice paper texture, graduated ink tones',
      videoMotionStyle: 'brushstrokes appearing, ink bleeding on paper, scroll unrolling, mist forming, contemplative stillness',
    },
    tags: ['ink-wash', 'sumi-e', 'calligraphy', 'zen', 'minimalist', 'CJK', 'brush', 'contemplative'],
  }),

  'miniature-painting': p({
    id: 'miniature-painting',
    name: 'Persian Miniature',
    category: 'cultural_style',
    tagline: 'Epic tales in exquisite small scale',
    description: 'Persian/Mughal miniature painting — tiny detailed scenes, flat perspective, ornate borders, gold leaf, garden paradise settings. Shahnameh epic illustrations meet court beauty.',
    inspiredBy: 'Persian miniature painting, Mughal court art, Ottoman manuscript illumination, Shahnameh illustrations',
    visual: {
      renderStyle: 'miniature painting — tiny detailed figures, flat perspective, ornate floral borders, gold leaf accents',
      lighting: 'flat even — no shadows, all detail visible, gold leaf reflections',
      colorPalette: ['#1E3A5F', '#C0392B', '#27AE60', '#DAA520', '#E8D5B7'],
      colorMood: 'lapis lazuli blue, vermillion red, malachite green, burnished gold leaf, vellum cream',
      textureDetail: 'fine brush detail at small scale, gold leaf hammering, paper fiber, gemstone pigment granules',
      backgroundStyle: 'paradise garden, court scenes, polo grounds, tent interiors, architectural cross-sections',
      particleEffects: 'gold leaf flecks, flower petals in paradise garden, fountain spray, calligraphic flourishes',
      cameraWork: 'slow zoom into miniature detail, reveal tiny hidden figures, pan across border decoration',
    },
    music: {
      genre: 'Persian classical with tar and santur',
      instruments: ['tar', 'santur', 'kamancheh', 'tombak', 'ney'],
      bpmRange: { min: 60, max: 100 },
      mood: 'court elegance, epic narrative, garden paradise tranquility, royal splendor',
      sfxStyle: 'court: fountain, nightingale, horse hooves, armor clinking, page turning',
    },
    character: {
      proportions: 'miniature painting — slightly elongated, richly detailed at small scale, flat profile/three-quarter views',
      expressionStyle: 'serene idealized faces, emotion through gesture and context, miniature precision',
      motionStyle: 'slow courtly movement, battle action frozen in dynamic poses, garden strolling',
      eyeStyle: 'almond-shaped, finely detailed, idealized beauty, miniature precision',
      costumeApproach: 'extremely detailed court robes, jeweled turbans, embroidered fabrics, gold-threaded textiles',
    },
    narrative: {
      pacing: 'epic saga pacing — each miniature a chapter of a grand story, ornate transitions',
      humorType: 'courtly wit, epic irony, Sufi parable wisdom',
      emotionalArc: 'hero called → quest journey → trial by fire → victory → paradise reward',
      targetAudience: 'MENA/South Asia markets, luxury brands, heritage content, literary adaptations',
      toneKeywords: ['miniature', 'persian', 'mughal', 'epic', 'gold-leaf', 'court', 'paradise', 'ornate'],
    },
    prompt: {
      stylePrefix: 'Persian miniature painting, exquisite tiny detail, flat perspective, ornate floral borders, gold leaf accents, lapis and vermillion, court paradise garden',
      qualityBoost: 'museum quality miniature, authentic pigments, gold leaf detail, fine brushwork at tiny scale',
      negativePrompt: '3D, modern, cartoon, anime, large scale, western realism, dark, horror',
      characterPrefix: 'miniature painting figure, richly detailed court robes, idealized features, flat perspective, tiny scale perfection',
      environmentPrefix: 'Persian paradise garden, ornate architecture, fountain courtyard, lapis blue sky, gold leaf accents, floral border frame',
      videoMotionStyle: 'slow zoom into miniature detail, border decorations extending, gold leaf catching light, page turning reveal',
    },
    tags: ['miniature', 'persian', 'mughal', 'court', 'gold-leaf', 'heritage', 'paradise', 'ornate'],
  }),

  'shadow-puppet-theater': p({
    id: 'shadow-puppet-theater',
    name: 'Shadow Puppet Theater',
    category: 'cultural_style',
    tagline: 'Light, leather, and a thousand-year story',
    description: 'Southeast Asian shadow puppet (wayang kulit) aesthetic — perforated leather puppets casting colored shadows on white screen, dalang storytelling, gamelan accompaniment.',
    inspiredBy: 'Javanese wayang kulit, Thai nang yai, Turkish Karagöz, Chinese shadow puppetry traditions',
    visual: {
      renderStyle: 'shadow puppet silhouettes — perforated leather casting colored light patterns, white screen backlit',
      lighting: 'strong backlight through translucent screen, colored gels through perforations, oil lamp flicker',
      colorPalette: ['#000000', '#F5E6CA', '#E74C3C', '#27AE60', '#D4AF37'],
      colorMood: 'black silhouettes on warm white screen, colored light through perforations, gold leaf details',
      textureDetail: 'leather perforation patterns, shadow edge softness, screen fabric weave, bamboo rod structure',
      backgroundStyle: 'white screen with shadow play, multiple puppet layers creating depth, scenic props as silhouettes',
      particleEffects: 'oil lamp flicker, shadow edge shimmer, dust motes in projection light, incense smoke',
      cameraWork: 'behind-screen reveals, puppet detail close-ups, dalang (puppeteer) shots, audience reaction',
    },
    music: {
      genre: 'gamelan ensemble with storytelling narration',
      instruments: ['gamelan', 'kendang', 'suling', 'rebab', 'narrator voice'],
      bpmRange: { min: 60, max: 120 },
      mood: 'epic storytelling, dramatic battle energy, tender romance, cosmic mythology',
      sfxStyle: 'puppet theater: leather tapping screen, rod clacking, gamelan cues, dalang voice changes, audience gasps',
    },
    character: {
      proportions: 'shadow puppet — articulated arms, ornate headdresses, profile silhouettes, elongated dramatic proportions',
      expressionStyle: 'conveyed through posture and movement speed — puppet articulation carries emotion',
      motionStyle: 'rod-articulated — arms swing, heads tilt, walking shuffle, battle clash choreography',
      eyeStyle: 'profile silhouette — visible only as shadow outline, recognized by headdress and proportion',
      costumeApproach: 'ornate silhouette — elaborate headdress, detailed perforation patterns, character-identifying shapes',
    },
    narrative: {
      pacing: 'epic saga — dalang narration bridges battles and romance, gamelan cues scene changes',
      humorType: 'punakawan clown servant wisdom humor, physical puppet comedy, satirical commentary',
      emotionalArc: 'cosmic conflict → hero journey → battle → wisdom revealed → harmony restored',
      targetAudience: 'Southeast Asia markets, theater/performance, cultural education, unique visual content',
      toneKeywords: ['shadow', 'puppet', 'wayang', 'silhouette', 'epic', 'theatrical', 'heritage'],
    },
    prompt: {
      stylePrefix: 'shadow puppet theater, wayang kulit silhouettes, perforated leather on backlit white screen, colored light through patterns, traditional puppet proportions',
      qualityBoost: 'authentic shadow puppet detail, leather perforation patterns, warm backlight glow, theatrical quality',
      negativePrompt: '3D, modern, realistic photo, anime, bright daylight, western cartoon',
      characterPrefix: 'shadow puppet silhouette, articulated arms, ornate headdress, profile view, leather perforation detail, theatrical pose',
      environmentPrefix: 'white backlit screen, shadow puppet scenic props, oil lamp warm glow, theatrical framing, gamelan stage',
      videoMotionStyle: 'puppet articulation, rod-driven movement, battle choreography, scene sliding, lamp flicker',
    },
    tags: ['shadow-puppet', 'wayang', 'silhouette', 'theater', 'southeast-asia', 'epic', 'traditional'],
  }),

  'celtic-interlace': p({
    id: 'celtic-interlace',
    name: 'Celtic Interlace',
    category: 'cultural_style',
    tagline: 'Knots that have no beginning and no end',
    description: 'Celtic knotwork and interlace — endless knot patterns, illuminated manuscript pages, zoomorphic designs, stone carving aesthetic. Book of Kells meets standing stones.',
    inspiredBy: 'Book of Kells, Celtic stone crosses, Viking age interlace, Insular art, illuminated manuscripts',
    visual: {
      renderStyle: 'interlace knotwork — over-under weaving, zoomorphic terminals, illuminated manuscript pages',
      lighting: 'candlelit scriptorium, soft vellum glow, stone surface in mist, green Ireland light',
      colorPalette: ['#27AE60', '#D4AF37', '#8E44AD', '#C0392B', '#F5E6CA'],
      colorMood: 'emerald green, gold leaf, purple majesty, vermillion accents on vellum cream',
      textureDetail: 'vellum parchment, ink on skin, gold leaf application, stone carving weathering',
      backgroundStyle: 'manuscript pages, stone crosses, misty green hills, monastery scriptorium, standing stones',
      particleEffects: 'gold leaf flecks, mist around standing stones, candlelight flicker, rain on stone',
      cameraWork: 'slow zoom into knot detail, tracing interlace paths, manuscript page reveal, stone circle approach',
    },
    music: {
      genre: 'Celtic folk with uilleann pipes and harp',
      instruments: ['uilleann pipes', 'Celtic harp', 'bodhrán', 'tin whistle', 'fiddle'],
      bpmRange: { min: 70, max: 130 },
      mood: 'misty ancient, joyful reel energy, mournful beauty, eternal cycle, hearth warmth',
      sfxStyle: 'Celtic: wind on heath, rain, quill scratching vellum, stone scraping, sea on cliffs',
    },
    character: {
      proportions: 'illuminated manuscript style — slightly stylized, decorative clothing borders',
      expressionStyle: 'serene manuscript faces, warrior pride, monk contemplation',
      motionStyle: 'interlace flowing, knot patterns building, stone carving appearing, dance reel energy',
      eyeStyle: 'manuscript style — outlined, decorative, symbolic',
      costumeApproach: 'Celtic tunics with interlace borders, torcs, brooches, manuscript-style clothing',
    },
    narrative: {
      pacing: 'cyclical like a Celtic knot — stories loop and interweave, no clear beginning or end',
      humorType: 'Irish storytelling wit, bard wordplay, trickster fairy tales',
      emotionalArc: 'mist-shrouded beginning → discovery → trial → wisdom from the old ways → eternal continuation',
      targetAudience: 'EU/Oceania markets, heritage brands, fantasy, literary, Irish/Scottish/Welsh diaspora',
      toneKeywords: ['celtic', 'knot', 'interlace', 'manuscript', 'eternal', 'emerald', 'ancient', 'misty'],
    },
    prompt: {
      stylePrefix: 'Celtic interlace knotwork art, illuminated manuscript style, over-under weaving patterns, zoomorphic terminals, Book of Kells inspired, vellum and gold leaf',
      qualityBoost: 'authentic interlace precision, gold leaf detail, vellum texture, manuscript quality',
      negativePrompt: 'modern, 3D, anime, realistic photo, digital, tropical, bright neon',
      characterPrefix: 'illuminated manuscript figure, Celtic tunic with interlace borders, torc jewelry, manuscript art proportions',
      environmentPrefix: 'illuminated manuscript page, Celtic knot borders, standing stones in mist, green hills, monastery scriptorium',
      videoMotionStyle: 'interlace knots drawing, gold leaf applying, manuscript page revealing, mist rolling over stones',
    },
    tags: ['celtic', 'knot', 'interlace', 'manuscript', 'irish', 'emerald', 'heritage', 'ancient'],
  }),

  'truck-art-vibrant': p({
    id: 'truck-art-vibrant',
    name: 'Truck Art Festival',
    category: 'cultural_style',
    tagline: 'The highway is a rolling gallery',
    description: 'Pakistani/South Asian truck art — bold hand-painted panels, vivid colors, floral chain borders, calligraphy, mirror work, patriotic and romantic themes. Jingle trucks as canvas.',
    inspiredBy: 'Pakistani jingle truck art, Indian truck decoration, Phool Patti (flower painting) tradition',
    visual: {
      renderStyle: 'hand-painted truck panels — bold flat colors, enamel paint shine, chain-link floral borders, calligraphic text',
      lighting: 'bright highway sun, enamel paint reflecting light, mirror work sparkle, festival lighting',
      colorPalette: ['#E74C3C', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6'],
      colorMood: 'maximum vibrancy — every color at full saturation, no muted tones, celebratory abundance',
      textureDetail: 'enamel paint on metal, chain-link borders, mirror mosaic, hammered metal, calligraphic brush strokes',
      backgroundStyle: 'truck panels as world — mountain highways, village scenes, rose gardens, patriotic landscapes',
      particleEffects: 'mirror reflections, paint splashing, flower petals, tinsel hanging, bell ringing sparkle',
      cameraWork: 'driving alongside painted trucks, detail zooms on panels, mirror-work reflections, caravan procession',
    },
    music: {
      genre: 'Punjabi bhangra with truck horn harmonies',
      instruments: ['dhol', 'tumbi', 'chimta', 'truck horns', 'harmonium'],
      bpmRange: { min: 110, max: 145 },
      mood: 'maximum celebration, road journey energy, highway brotherhood, festival joy',
      sfxStyle: 'highway: truck horns (musical), bells jingling, engine rumble, road vibration, market bustle',
    },
    character: {
      proportions: 'truck art style — slightly naive proportions, bold outlines, confident poses',
      expressionStyle: 'proud and joyful, driver brotherhood, artisan pride, festive celebration',
      motionStyle: 'bhangra dance energy, truck procession movement, painting brushstrokes, mirror spinning',
      eyeStyle: 'large and expressive, heavily outlined, kohl-like emphasis, warm and welcoming',
      costumeApproach: 'shalwar kameez, colorful turbans, driver uniforms, festival dress, paint-splattered artisan wear',
    },
    narrative: {
      pacing: 'road journey rhythm — checkpoint stops, highway speed, chai break contemplation, destination celebration',
      humorType: 'highway humor, driver banter, road-trip comedy, painted message wit ("Buri nazar wale tera muh kala")',
      emotionalArc: 'departure → road adventures → highway brotherhood → triumphant arrival → new journey',
      targetAudience: 'Pakistan/South Asia markets, pop culture, brand campaigns, festival content, cultural export',
      toneKeywords: ['truck-art', 'vibrant', 'pakistan', 'highway', 'festival', 'hand-painted', 'jingle'],
    },
    prompt: {
      stylePrefix: 'Pakistani truck art style, bold hand-painted panels, vivid enamel colors, chain-link floral borders, mirror work, calligraphic text, maximum vibrancy',
      qualityBoost: 'authentic truck art technique, enamel paint shine, detailed floral borders, mirror reflections',
      negativePrompt: 'muted colors, minimal, western, 3D render, anime, dark, monochrome',
      characterPrefix: 'truck art style figure, bold outlines, vivid colors, hand-painted aesthetic, warm expression, festival clothing',
      environmentPrefix: 'truck art world, painted panels as landscape, mountain highways, rose gardens, chain-link borders, maximum color',
      videoMotionStyle: 'truck driving along highway, panels painted in real-time, mirror reflections catching light, bells jingling',
    },
    tags: ['truck-art', 'pakistan', 'vibrant', 'hand-painted', 'highway', 'festival', 'folk', 'enamel'],
  }),

  'rangoli-festival': p({
    id: 'rangoli-festival',
    name: 'Rangoli Festival',
    category: 'cultural_style',
    tagline: 'Sacred geometry on the doorstep of dawn',
    description: 'Indian rangoli/kolam floor art — colored powder patterns, symmetric geometry, festival decorations. Diwali doorstep art meets temple floor patterns. Ephemeral beauty.',
    inspiredBy: 'Indian rangoli, Tamil kolam, Diwali decorations, temple floor art traditions',
    visual: {
      renderStyle: 'colored powder on dark ground — symmetric patterns, dot grid foundations, flowing curves from dot connections',
      lighting: 'diya (oil lamp) warm glow, dawn light, festival sparkle, candle-lit doorstep',
      colorPalette: ['#E74C3C', '#F1C40F', '#FF6B35', '#27AE60', '#FFFFFF'],
      colorMood: 'festival vibrant — turmeric yellow, kumkum red, white rice powder, green leaves, marigold orange',
      textureDetail: 'colored powder granularity, floor texture underneath, flower petal arrangement, diya flame glow',
      backgroundStyle: 'doorstep floor, temple courtyard, festival ground, dark surface for contrast, diya-lit borders',
      particleEffects: 'colored powder sprinkling, flower petals falling, sparkler trails, diya flame dancing',
      cameraWork: 'overhead view of pattern creation, powder sprinkling slow-mo, symmetric reveal from center out',
    },
    music: {
      genre: 'Indian classical with festival instruments',
      instruments: ['sitar', 'tabla', 'shehnai', 'harmonium', 'temple bells'],
      bpmRange: { min: 80, max: 120 },
      mood: 'festival joy, sacred morning ritual, community celebration, auspicious welcome',
      sfxStyle: 'festival: powder sprinkle, diya flame, temple bells, morning birds, festival firecrackers distant',
    },
    character: {
      proportions: 'rangoli pattern — characters formed from powder patterns, symmetric and decorative',
      expressionStyle: 'festive joy, devotional serenity, community warmth, artistic pride',
      motionStyle: 'powder flowing into pattern, symmetric pattern building from center, festival dance',
      eyeStyle: 'decorative dot eyes, kolam dot pattern, symmetric',
      costumeApproach: 'festival saris and kurtas in rangoli colors, flower garlands, bindis, bangles',
    },
    narrative: {
      pacing: 'dawn ritual — slow morning start, pattern building, community gathering, festival celebration peak',
      humorType: 'family festival humor, sibling rangoli competition, grandmother wisdom',
      emotionalArc: 'dawn preparation → artistic creation → community admiration → festival celebration → ephemeral beauty acceptance',
      targetAudience: 'India/South Asia markets, festival campaigns, brand celebrations, cultural education',
      toneKeywords: ['rangoli', 'kolam', 'festival', 'diwali', 'sacred', 'symmetric', 'ephemeral', 'dawn'],
    },
    prompt: {
      stylePrefix: 'rangoli floor art, colored powder patterns on dark ground, symmetric sacred geometry, festival colors, diya oil lamp lighting, Indian folk art',
      qualityBoost: 'authentic powder texture, perfect symmetry, vibrant festival colors, diya glow quality',
      negativePrompt: '3D, modern, western, anime, dark horror, cold colors, abstract digital',
      characterPrefix: 'festival figure in rangoli-colored clothing, flower garlands, symmetric pose, warm celebration expression',
      environmentPrefix: 'rangoli-decorated doorstep, festival ground, diya oil lamps, flower petals, colored powder, symmetric patterns',
      videoMotionStyle: 'powder flowing into symmetric patterns, diya flames dancing, overhead pattern reveals, festival sparkle',
    },
    tags: ['rangoli', 'kolam', 'india', 'festival', 'diwali', 'symmetric', 'powder', 'sacred'],
  }),

  'tile-mosaic-mediterranean': p({
    id: 'tile-mosaic-mediterranean',
    name: 'Mediterranean Mosaic',
    category: 'cultural_style',
    tagline: 'A thousand tiny tiles tell one grand story',
    description: 'Roman/Byzantine/Mediterranean mosaic art — small tessera tiles forming grand scenes, gold backgrounds, haloed figures, grand narrative panels. From Ravenna to Hagia Sophia.',
    inspiredBy: 'Roman mosaics, Byzantine art, Ravenna basilica, Hagia Sophia, Portuguese azulejo, Moroccan zellige',
    visual: {
      renderStyle: 'mosaic tessera — small square tiles forming images, gold leaf background, visible grout lines between tiles',
      lighting: 'warm golden — candlelit basilica, gold tessera reflecting, Mediterranean sun through dome',
      colorPalette: ['#D4AF37', '#1B4F72', '#C0392B', '#27AE60', '#F5E6CA'],
      colorMood: 'gold dominant, deep blue and vermillion, marble white, Byzantine richness',
      textureDetail: 'individual tessera tiles visible, grout lines, gold leaf tessera, glass smalti reflections, stone chips',
      backgroundStyle: 'basilica apse, dome interior, bathhouse floor, gold tessera field, architectural setting',
      particleEffects: 'gold tessera catching light, mosaic tiles assembling, candle flicker on gold, dust in sunbeam',
      cameraWork: 'slow approach to mosaic wall, macro tessera detail, pull back to reveal full composition, dome upward look',
    },
    music: {
      genre: 'Byzantine choral with Mediterranean strings',
      instruments: ['choir', 'oud', 'lyre', 'cymbals', 'frame drum'],
      bpmRange: { min: 50, max: 90 },
      mood: 'sacred grandeur, Mediterranean warmth, imperial splendor, timeless craft',
      sfxStyle: 'basilica: stone echo, chisel tapping, gold leaf placing, choir reverb, footsteps on mosaic floor',
    },
    character: {
      proportions: 'Byzantine iconic — frontal facing, large eyes, slightly elongated, hieratic scale (important = larger)',
      expressionStyle: 'serene iconic — Byzantine frontal gaze, halo emphasis, sacred presence',
      motionStyle: 'very slow — mosaic tiles shifting subtly, gold catching different light angles, static grandeur',
      eyeStyle: 'large Byzantine eyes, frontal gaze, dark outlined, spiritually penetrating',
      costumeApproach: 'imperial robes with mosaic-pattern detail, jeweled crowns, embroidered vestments, gold accents',
    },
    narrative: {
      pacing: 'monumental — each mosaic panel a scene in a grand narrative, slow contemplative reveals',
      humorType: 'none — sacred narrative grandeur',
      emotionalArc: 'creation → glory → trial → redemption → eternal golden splendor',
      targetAudience: 'Mediterranean/EU markets, heritage, luxury, architecture, religious content',
      toneKeywords: ['mosaic', 'byzantine', 'gold', 'tessera', 'sacred', 'mediterranean', 'monumental'],
    },
    prompt: {
      stylePrefix: 'mosaic art, small tessera tiles, gold background, Byzantine style, visible grout lines, grand narrative scene, Mediterranean tradition',
      qualityBoost: 'authentic tessera texture, gold smalti reflection, precise tile placement, basilica quality',
      negativePrompt: '3D, modern, cartoon, anime, photograph, digital smooth, plastic',
      characterPrefix: 'Byzantine mosaic figure, frontal gaze, halo, gold background, tessera tile texture, imperial robes',
      environmentPrefix: 'mosaic basilica interior, gold tessera background, architectural dome, Mediterranean light, grout line detail',
      videoMotionStyle: 'tessera tiles assembling, gold catching candlelight, slow mosaic reveal, dome camera orbit',
    },
    tags: ['mosaic', 'byzantine', 'gold', 'tessera', 'mediterranean', 'sacred', 'monumental', 'tile'],
  }),

  'nordic-rosemaling': p({
    id: 'nordic-rosemaling',
    name: 'Nordic Rosemaling',
    category: 'cultural_style',
    tagline: 'Flowers that bloom in the coldest winters',
    description: 'Scandinavian rosemaling folk art — scrolling acanthus flowers, symmetrical floral designs, wooden surface painting, Telemark and Rogaland styles. Warm folk art against northern winters.',
    inspiredBy: 'Norwegian rosemaling, Swedish Dala painting, Danish folk art, Scandinavian wooden craft',
    visual: {
      renderStyle: 'painted on wood — scrolling C and S curves, layered flowers, stylized leaves, wooden surface grain visible',
      lighting: 'warm hearth light, Nordic winter cabin glow, candlelit hygge atmosphere',
      colorPalette: ['#E74C3C', '#3498DB', '#F1C40F', '#27AE60', '#2C3E50'],
      colorMood: 'warm reds and blues on dark wood, cream highlights, green leaves, golden accents',
      textureDetail: 'wood grain under paint, brushstroke layering, crackle aging, carved wooden surface',
      backgroundStyle: 'dark wooden surfaces — trunks, cabinets, bowls, ski lodge walls, stave church details',
      particleEffects: 'snow falling outside windows, fireplace sparks, paint droplets, flower petals forming',
      cameraWork: 'close-up brushwork detail, pull back to reveal full painted surface, cabin interior panning',
    },
    music: {
      genre: 'Scandinavian folk with Hardanger fiddle',
      instruments: ['Hardanger fiddle', 'nyckelharpa', 'langspil', 'bukkehorn', 'accordion'],
      bpmRange: { min: 70, max: 120 },
      mood: 'winter hearth warmth, folk dance energy, midnight sun wonder, hygge comfort',
      sfxStyle: 'Nordic: crackling fire, wind outside, paintbrush on wood, snow crunching, birch bark peeling',
    },
    character: {
      proportions: 'folk art style — slightly simplified, warm and approachable, bundled in layers',
      expressionStyle: 'warm understated — Nordic reserve with warm eyes, cozy contentment',
      motionStyle: 'folk dance movement, craft creation, hearth-side gesture, snow activity',
      eyeStyle: 'warm and kind, slightly narrow against snow glare, folk art simplified',
      costumeApproach: 'bunad (traditional Norwegian dress), wool sweaters, knit patterns, fur-lined boots',
    },
    narrative: {
      pacing: 'seasonal rhythm — long winters to bright summers, craft-time storytelling, hygge gathering',
      humorType: 'dry Nordic humor, understatement, nature observation wit',
      emotionalArc: 'winter isolation → craft creation → community gathering → midsummer celebration → gratitude',
      targetAudience: 'Scandinavian/EU markets, lifestyle brands, craft/heritage, hygge culture, Nordic design',
      toneKeywords: ['rosemaling', 'nordic', 'folk', 'hygge', 'floral', 'wooden', 'scandinavian', 'warm'],
    },
    prompt: {
      stylePrefix: 'Scandinavian rosemaling folk art, scrolling floral designs on dark wood, C and S curves, stylized acanthus flowers, warm cabin atmosphere',
      qualityBoost: 'authentic rosemaling brushwork, visible wood grain, layered paint technique, folk art master quality',
      negativePrompt: '3D, modern, tropical, anime, urban, neon, digital, photorealistic',
      characterPrefix: 'folk art figure, bunad traditional dress, warm expression, knit textures, rosemaling-decorated setting',
      environmentPrefix: 'rosemaling-painted wooden interior, Nordic cabin, dark wood surfaces, warm hearth glow, snow outside windows',
      videoMotionStyle: 'brushstrokes painting scrolling flowers, paint layering on wood, cabin scene with falling snow outside',
    },
    tags: ['rosemaling', 'nordic', 'scandinavian', 'folk', 'floral', 'wood', 'hygge', 'craft'],
  }),

  'watercolor-botanical': p({
    id: 'watercolor-botanical',
    name: 'Watercolor Botanical',
    category: 'art_medium',
    tagline: 'Where science meets the beauty of a single petal',
    description: 'Scientific botanical illustration in watercolor — precise plant anatomy with artistic beauty, white background, delicate washes, specimen-accurate detail. Kew Gardens meets art gallery.',
    inspiredBy: 'Royal Botanical Gardens illustrations, Maria Sibylla Merian, Pierre-Joseph Redouté, scientific illustration',
    visual: {
      renderStyle: 'transparent watercolor on heavy cotton paper — wet-on-wet bleeds, precise dry-brush detail, white paper showing through',
      lighting: 'soft natural — north-facing window studio light, no harsh shadows, neutral even illumination',
      colorPalette: ['#27AE60', '#E74C3C', '#F1C40F', '#8E44AD', '#F5F5F5'],
      colorMood: 'natural botanical colors — leaf greens, petal pinks, stamen golds, berry purples on white',
      textureDetail: 'watercolor paper tooth, pigment granulation, wet edge blooms, dry brush fine lines, water stains',
      backgroundStyle: 'white paper with subtle shadows, specimen-card layout, Latin botanical labels, measurement scales',
      particleEffects: 'watercolor droplets, pigment blooming in water, pollen floating, dewdrops on petals',
      cameraWork: 'macro petal detail, specimen overview, painting process time-lapse, gentle zoom on details',
    },
    music: {
      genre: 'gentle chamber music — string quartet with piano',
      instruments: ['piano', 'violin', 'cello', 'flute', 'harp'],
      bpmRange: { min: 60, max: 90 },
      mood: 'contemplative beauty, scientific wonder, gentle precision, garden serenity',
      sfxStyle: 'garden: birdsong, rustling leaves, water brush swishing, paper settling, greenhouse rain',
    },
    character: {
      proportions: 'botanical specimens ARE the characters — flowers, trees, insects with personality',
      expressionStyle: 'plants "express" through growth stage, bloom state, orientation toward light',
      motionStyle: 'growth time-lapse, watercolor wash spreading, bloom opening, leaf unfurling',
      eyeStyle: 'none — pure botanical, though insects may have detailed compound eyes',
      costumeApproach: 'natural — petals, leaves, bark ARE the visual interest',
    },
    narrative: {
      pacing: 'seasonal growth cycle, patient observation, detail-by-detail revelation',
      humorType: 'none — pure beauty and scientific wonder',
      emotionalArc: 'seed → sprout → growth → bloom → fruit → cycle renewal',
      targetAudience: 'wellness brands, luxury, botanical gardens, education, organic/natural products',
      toneKeywords: ['watercolor', 'botanical', 'scientific', 'delicate', 'garden', 'precision', 'natural'],
    },
    prompt: {
      stylePrefix: 'watercolor botanical illustration, transparent washes on white paper, scientific precision, specimen-accurate detail, delicate brush work',
      qualityBoost: 'museum quality botanical art, authentic watercolor texture, paper grain visible, precise pigment control',
      negativePrompt: '3D, cartoon, dark, urban, anime, abstract, digital flat',
      characterPrefix: 'botanical specimen, watercolor painted, scientifically accurate, transparent washes, white paper background',
      environmentPrefix: 'white paper background, botanical garden, specimen card layout, Latin labels, measurement scale, greenhouse light',
      videoMotionStyle: 'watercolor washes spreading, flower blooming time-lapse, brush painting detail, pigment blooming in water',
    },
    tags: ['watercolor', 'botanical', 'scientific', 'garden', 'delicate', 'specimen', 'natural'],
  }),

  'bollywood-spectacle': p({
    id: 'bollywood-spectacle',
    name: 'Bollywood Spectacle',
    category: 'film_genre',
    tagline: 'When emotions are too big for dialogue alone — you dance',
    description: 'Bollywood song-and-dance energy — massive choreographed numbers, vibrant costume changes, romantic rain scenes, dramatic emotional peaks, 100 backup dancers. Maximum feeling.',
    inspiredBy: 'Indian cinema musical traditions, Bollywood choreography, masala film genre',
    visual: {
      renderStyle: 'cinematic Bollywood — rich saturated colors, dramatic lighting, wide choreography shots, close-up emotion shots',
      lighting: 'dramatic golden-hour romance, neon nightclub dance, rain-soaked dramatic, festival multi-colored',
      colorPalette: ['#E74C3C', '#F1C40F', '#FF6B35', '#9B59B6', '#27AE60'],
      colorMood: 'maximum saturation, festive multi-color, romantic gold, dramatic contrast, costume-driven palette',
      textureDetail: 'silk and chiffon fabrics, sequin sparkle, jewelry detail, rain droplets, flower petals, rangoli patterns',
      backgroundStyle: 'Swiss Alps, palace interiors, Mumbai streets, desert landscapes, rain-soaked rooftops, festival grounds',
      particleEffects: 'flower petals cascading, rain dramatic, sparkler trails, confetti, holi colors, fireworks',
      cameraWork: 'sweeping crane for dance numbers, dramatic zoom on emotional peaks, wide choreography shots, rain slow-mo',
    },
    music: {
      genre: 'Bollywood — orchestral meets electronic with playback singer energy',
      instruments: ['orchestra', 'tabla', 'dholak', 'synth', 'playback vocals', 'shehnai'],
      bpmRange: { min: 90, max: 150 },
      mood: 'maximum emotional intensity — romantic longing, dance celebration, dramatic confrontation, comedic energy',
      sfxStyle: 'cinematic: dramatic stings, rain on surface, fabric whoosh, crowd reaction, dance footwork impacts',
    },
    character: {
      proportions: 'glamorous cinematic — hero statuesque, heroine graceful, villain imposing, comic relief expressive',
      expressionStyle: 'maximum emotion — tears streaming, joyful spinning, angry trembling, love-struck gazing, dramatic eye-acting',
      motionStyle: 'choreographed dance, dramatic slow-mo, rain-soaked emotional movement, action fight choreography',
      eyeStyle: 'large expressive, kohl-lined, emotion-conveying, dramatic close-up ready',
      costumeApproach: 'multiple costume changes per song, bridal lehenga, dance costumes, hero casual-to-formal, sequins and silk',
    },
    narrative: {
      pacing: 'masala mix — comedy → romance → song → drama → action → emotional climax → happy resolution',
      humorType: 'physical comedy, misunderstanding humor, sidekick banter, family comedy, dramatic irony',
      emotionalArc: 'meet-cute → obstacles → dramatic separation → grand gesture → reunion → celebration',
      targetAudience: 'South Asia markets, global Indian diaspora, musical content, brand celebrations',
      toneKeywords: ['bollywood', 'dance', 'romantic', 'dramatic', 'musical', 'festival', 'colorful', 'emotional'],
    },
    prompt: {
      stylePrefix: 'Bollywood cinema style, dramatic saturated colors, choreographed dance energy, romantic golden-hour lighting, maximum emotional expression',
      qualityBoost: 'cinematic quality, dramatic lighting, costume detail, choreography precision, emotional intensity',
      negativePrompt: 'muted, minimal, western indie, horror, dark, cold, static, boring',
      characterPrefix: 'Bollywood star presence, glamorous styling, expressive face, dance-ready pose, dramatic costume, emotional intensity',
      environmentPrefix: 'Bollywood set — palace interior, Swiss Alps, Mumbai skyline, rain-soaked rooftop, dance floor, festival ground',
      videoMotionStyle: 'choreographed dance, dramatic slow-motion, costume swirl, rain drops, emotional zoom, crane sweep',
    },
    tags: ['bollywood', 'dance', 'musical', 'indian', 'dramatic', 'romantic', 'festival', 'spectacle'],
  }),

  'anime-sakura': p({
    id: 'anime-sakura',
    name: 'Anime Sakura',
    category: 'animation_world',
    tagline: 'Petals fall as feelings bloom',
    description: 'Modern anime aesthetic — cel-shaded characters, cherry blossom settings, speed lines for action, emotional close-ups with sparkling eyes, color-coded emotions. Studio quality anime production.',
    inspiredBy: 'Japanese animation studios, shonen/shoujo anime traditions, manga panel layouts',
    visual: {
      renderStyle: 'cel-shaded anime — clean outlines, flat color fills, gradient shading, speed lines, screentone patterns',
      lighting: 'anime dramatic — backlit character reveals, golden hour romance, blue moonlight, speed-line backgrounds',
      colorPalette: ['#FFB7C5', '#5B8AC4', '#FFD700', '#FF6B6B', '#87CEEB'],
      colorMood: 'pastel sakura pinks, sky blues, emotional warm golds, action reds, dreamy soft focus',
      textureDetail: 'clean cel paint, screentone dot patterns, gradient sky backgrounds, sparkle effects on eyes',
      backgroundStyle: 'cherry blossom paths, school rooftops, dramatic cliffs, enchanted forests, city skylines at sunset',
      particleEffects: 'cherry blossom petals (always), sparkle effects, speed lines, emotional flower/feather backgrounds',
      cameraWork: 'dramatic zoom lines, 360-degree character reveals, slow-mo with speedlines, emotional close-up with sparkle',
    },
    music: {
      genre: 'J-pop/J-rock with orchestral anime score',
      instruments: ['electric guitar', 'piano', 'violin', 'synth', 'j-pop vocals', 'taiko'],
      bpmRange: { min: 100, max: 160 },
      mood: 'emotional intensity — battle determination, romantic longing, friendship power, comedic chaos',
      sfxStyle: 'anime: power-up charge, sword clash, sparkle ding, dramatic gasp, wind whoosh, comedy bonk',
    },
    character: {
      proportions: 'anime — large eyes (1/3 of face), small nose/mouth, varied body types, dramatic hair',
      expressionStyle: 'maximum anime expression — sparkle eyes, sweat drops, anger vein, chibi comedy mode, tearful sparkle',
      motionStyle: 'fluid anime action, dramatic slow-mo, comedy super-deformed, power-up sequences, hair flowing',
      eyeStyle: 'enormous detailed anime eyes — multiple highlight points, color-gradient iris, emotion-specific shapes',
      costumeApproach: 'school uniforms, battle outfits, magical girl transformations, detailed accessory design, seasonal outfits',
    },
    narrative: {
      pacing: 'episode arc — slice-of-life calm → tension building → dramatic confrontation → emotional resolution → next-episode hook',
      humorType: 'chibi comedy breaks, misunderstanding romance, exaggerated reactions, fourth-wall winks',
      emotionalArc: 'ordinary beginning → discovery of power/purpose → training/friendship → crisis → power-of-friendship triumph',
      targetAudience: 'CJK primary, global anime fans, teens-adults, gaming crossover',
      toneKeywords: ['anime', 'sakura', 'dramatic', 'emotional', 'action', 'romantic', 'heroic', 'sparkle'],
    },
    prompt: {
      stylePrefix: 'anime style, cel-shaded, clean outlines, cherry blossom setting, dramatic lighting, sparkle effects, Japanese animation quality',
      qualityBoost: 'studio-quality anime, detailed eyes, clean line art, dynamic composition, professional cel shading',
      negativePrompt: 'realistic photo, 3D render, western cartoon, pixel art, sketch, rough, unfinished',
      characterPrefix: 'anime character, large expressive eyes, dramatic hair, cel-shaded, clean outlines, dynamic pose',
      environmentPrefix: 'anime background, cherry blossom trees, dramatic sky, school or fantasy setting, painted style, atmospheric',
      videoMotionStyle: 'anime action, speed lines, dramatic slow-motion, cherry blossom falling, emotional zoom, power-up glow',
    },
    tags: ['anime', 'sakura', 'japanese', 'cel-shaded', 'dramatic', 'emotional', 'cherry-blossom'],
  }),
};

// ─── Registry Functions ──────────────────────────────────────────────────────

/** Get a preset by ID */
export function getImaginationPreset(id: string): ImaginationPreset | undefined {
  return IMAGINATION_PRESETS[id];
}

/** Get all presets in a category */
export function getPresetsByCategory(category: ImaginationCategory): ImaginationPreset[] {
  return Object.values(IMAGINATION_PRESETS).filter(p => p.category === category);
}

/** Search presets by keyword (searches name, tags, description) */
export function searchImaginationPresets(query: string): ImaginationPreset[] {
  const lower = query.toLowerCase();
  return Object.values(IMAGINATION_PRESETS).filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.tags.some(t => t.includes(lower)) ||
    p.description.toLowerCase().includes(lower) ||
    p.tagline.toLowerCase().includes(lower)
  );
}

/** Get all preset IDs */
export function getAllPresetIds(): string[] {
  return Object.keys(IMAGINATION_PRESETS);
}

/** Get all categories with their preset counts */
export function getPresetCategories(): Array<{ category: ImaginationCategory; count: number; presets: string[] }> {
  const map = new Map<ImaginationCategory, string[]>();
  for (const [id, preset] of Object.entries(IMAGINATION_PRESETS)) {
    const list = map.get(preset.category) ?? [];
    list.push(id);
    map.set(preset.category, list);
  }
  return Array.from(map.entries()).map(([category, presets]) => ({
    category,
    count: presets.length,
    presets,
  }));
}

/** Get the prompt modifiers for a preset — ready to inject into generation prompts */
export function getPresetPromptModifiers(id: string): ImaginationPreset['prompt'] | undefined {
  return IMAGINATION_PRESETS[id]?.prompt;
}

/** Get the music DNA for a preset — ready to inject into audio generation */
export function getPresetMusicDNA(id: string): ImaginationPreset['music'] | undefined {
  return IMAGINATION_PRESETS[id]?.music;
}

/** Get the character DNA for a preset */
export function getPresetCharacterDNA(id: string): ImaginationPreset['character'] | undefined {
  return IMAGINATION_PRESETS[id]?.character;
}

/** Get the narrative DNA for a preset */
export function getPresetNarrativeDNA(id: string): ImaginationPreset['narrative'] | undefined {
  return IMAGINATION_PRESETS[id]?.narrative;
}

/** Get the visual DNA for a preset */
export function getPresetVisualDNA(id: string): ImaginationPreset['visual'] | undefined {
  return IMAGINATION_PRESETS[id]?.visual;
}

// ─── Regional Adaptation ─────────────────────────────────────────────────────
// Combines a preset's DNA with regional cultural elements.
// Example: "living-toys" in INDIA → toys have Indian patterns, sitar replaces guitar,
//          environment includes Indian home details, festival colors.
// This is a MERGE — the preset foundation stays, regional DNA overlays cultural context.

/** Regional adaptation overrides — how a region modifies any preset's DNA */
interface RegionalAdaptationLayer {
  visualOverlay: string;         // Appended to visual prompts — cultural setting detail
  instrumentOverlay: string[];   // Regional instruments mixed into music
  characterOverlay: string;      // Cultural clothing/accessory notes
  environmentOverlay: string;    // Cultural architecture/setting
  narrativeOverlay: string;      // Storytelling style adaptation
  colorAccents?: string[];       // Region-specific color additions
}

const REGIONAL_ADAPTATION_LAYERS: Record<string, RegionalAdaptationLayer> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // 16 PARENT REGIONS
  // ═══════════════════════════════════════════════════════════════════════════

  NAM:          { visualOverlay: 'American suburban setting, autumn maple trees, baseball caps and sneakers', instrumentOverlay: ['country guitar', 'blues harmonica', 'jazz trumpet'], characterOverlay: 'casual American clothing, diverse cast', environmentOverlay: 'Main Street, yellow school bus, white picket fence, fire hydrant', narrativeOverlay: 'direct storytelling, underdog journey, dream-chasing' },
  EU:           { visualOverlay: 'European cobblestone streets, café culture, Renaissance architecture', instrumentOverlay: ['accordion', 'classical violin', 'church organ'], characterOverlay: 'elegant European fashion, scarves, berets', environmentOverlay: 'Parisian boulevards, Tuscan hills, Alpine meadows, Gothic cathedrals', narrativeOverlay: 'layered literary narrative, philosophical undertones' },
  EURASIA:      { visualOverlay: 'Slavic ornamental patterns, birch forests, onion domes', instrumentOverlay: ['balalaika', 'domra', 'bayan accordion'], characterOverlay: 'fur-lined coats, Slavic embroidery, matryoshka motifs', environmentOverlay: 'birch forests, dachas, snow-covered villages, Red Square silhouette', narrativeOverlay: 'deeply emotional, literary depth, melancholic beauty' },
  TURKEY:       { visualOverlay: 'Ottoman geometric tiles, evil eye charms, tulip motifs, Cappadocian caves', instrumentOverlay: ['saz', 'ney', 'kanun', 'darbuka'], characterOverlay: 'modern Turkish fashion with Ottoman accents, calligraphic accessories', environmentOverlay: 'Istanbul skyline, Cappadocia balloons, Grand Bazaar, Bosphorus bridge', narrativeOverlay: 'bridge-of-civilizations duality, East-meets-West richness' },
  MENA:         { visualOverlay: 'Islamic geometric patterns, desert landscapes, calligraphic art', instrumentOverlay: ['oud', 'qanun', 'ney', 'darbuka', 'riq'], characterOverlay: 'traditional Arab/Persian attire, geometric accessories, henna patterns', environmentOverlay: 'desert oasis, arabesque courtyard, souk marketplace, minaret silhouette', narrativeOverlay: 'parable wisdom, Sufi poetic depth, One Thousand and One Nights layering' },
  AFRICA:       { visualOverlay: 'kente/ankara textile patterns, Adinkra symbols, baobab trees', instrumentOverlay: ['djembe', 'kora', 'talking drums', 'mbira', 'balafon'], characterOverlay: 'vibrant African prints, headwraps, beaded accessories, ceremonial regalia', environmentOverlay: 'savanna sunset, village gathering, marketplace, Congo rainforest', narrativeOverlay: 'call-and-response communal, Anansi trickster tales, proverb-led wisdom' },
  INDIA:        { visualOverlay: 'Madhubani/rangoli patterns, marigold garlands, diya lamps', instrumentOverlay: ['sitar', 'tabla', 'bansuri', 'shehnai', 'harmonium'], characterOverlay: 'saris, kurtas, bindis, bangles, Mughal jewelry', environmentOverlay: 'Rajasthani palace, Kerala backwaters, temple gopuram, monsoon rain, holi colors', narrativeOverlay: 'layered family saga, Bollywood emotional peaks, festival joy' },
  PAKISTAN:      { visualOverlay: 'truck art patterns, ajrak prints, Mughal miniature borders', instrumentOverlay: ['rabab', 'dhol', 'sitar', 'chimta', 'harmonium'], characterOverlay: 'shalwar kameez, phulkari embroidery, jingle truck mirror work', environmentOverlay: 'Karakoram Highway, Lahore Fort, Swat Valley, truck art panels', narrativeOverlay: 'Sufi mysticism, ghazal poetic depth, hospitality warmth' },
  BANGLADESH:   { visualOverlay: 'jamdani weave patterns, rickshaw art, river delta landscapes', instrumentOverlay: ['ektara', 'dotara', 'dhol', 'flute', 'harmonium'], characterOverlay: 'muslin saris, Nakshi Kantha embroidery, river-culture accessories', environmentOverlay: 'Ganges delta, mangrove Sundarbans, Dhaka rickshaw streets, monsoon rivers', narrativeOverlay: 'Baul spiritual wandering, river journey metaphor, resilience through floods' },
  SOUTH_ASIA:   { visualOverlay: 'Himalayan prayer flags, Buddhist mandala, terraced rice paddies', instrumentOverlay: ['singing bowls', 'madal', 'sarangi', 'damaru', 'bansuri'], characterOverlay: 'Himalayan wool garments, prayer beads, Buddhist ornaments', environmentOverlay: 'Himalayan peaks, prayer flag bridges, monastery courtyards, terraced hills', narrativeOverlay: 'Buddhist parable wisdom, mountain pilgrimage journey, mindful contemplation' },
  SEA:          { visualOverlay: 'batik patterns, lotus flowers, golden temple spires, tropical lush', instrumentOverlay: ['gamelan', 'khene', 'angklung', 'suling', 'ranat'], characterOverlay: 'batik sarong, temple dance costumes, flower garlands, silk fabrics', environmentOverlay: 'temple complexes, floating markets, rice paddies, tropical jungle, coral reefs', narrativeOverlay: 'wayang epic storytelling, nature harmony, spirit world connection' },
  CJK:          { visualOverlay: 'ink wash aesthetic, cherry blossoms, dragon motifs, torii gates', instrumentOverlay: ['guqin', 'shamisen', 'gayageum', 'erhu', 'shakuhachi'], characterOverlay: 'traditional East Asian garments, hanfu/kimono/hanbok elements', environmentOverlay: 'mountain mist, bamboo grove, zen garden, pagoda, lantern festival', narrativeOverlay: 'Zen minimalism, seasonal poetics (mono no aware), ancestral respect' },
  LATAM:        { visualOverlay: 'Aztec/Maya codex patterns, Día de los Muertos sugar skulls, tropical colors', instrumentOverlay: ['guitar', 'cajón', 'charango', 'quena', 'maracas'], characterOverlay: 'embroidered huipil, Frida Kahlo flower crowns, luchador masks', environmentOverlay: 'pyramid temples, rainforest canopy, colonial plazas, carnival streets, Andes peaks', narrativeOverlay: 'magical realism, Día de los Muertos ancestor communion, passionate telenovela' },
  CARIBBEAN:    { visualOverlay: 'tropical pastels, steel pan reflections, carnival feather headdresses', instrumentOverlay: ['steel pan', 'congas', 'timbales', 'reggae guitar', 'trumpet'], characterOverlay: 'carnival costumes, island casual, calypso performer attire', environmentOverlay: 'turquoise waters, palm-lined beaches, colonial fort, carnival parade, rum distillery', narrativeOverlay: 'calypso social commentary, limbo storytelling, island rhythm' },
  OCEANIA:      { visualOverlay: 'dot painting ochres, tapa cloth, Maori koru spirals, coral reef blues', instrumentOverlay: ['didgeridoo', 'ukulele', 'log drums', 'conch shell', 'pahu drum'], characterOverlay: 'tapa cloth wraps, Maori ta moko patterns, shell accessories', environmentOverlay: 'Great Barrier Reef, outback red earth, volcanic islands, rainforest canopy', narrativeOverlay: 'Dreamtime songline, Pacific wayfinding, ancestor spirit connection' },
  CENTRAL_ASIA: { visualOverlay: 'suzani embroidery, Silk Road caravan, yurt felt patterns', instrumentOverlay: ['dombra', 'komuz', 'dotar', 'rubab', 'throat singing'], characterOverlay: 'chapan coats, telpak hats, suzani-embroidered vests', environmentOverlay: 'steppe grasslands, Registan square, yurt encampment, Silk Road oasis, eagle hunting', narrativeOverlay: 'nomadic journey epic, Silk Road merchant tales, eagle hunter valor' },

  // ═══════════════════════════════════════════════════════════════════════════
  // 62 SUBREGIONS — granular cultural detail within each parent
  // ═══════════════════════════════════════════════════════════════════════════

  // ── NAM (2) ──
  NAM_US:       { visualOverlay: 'American urban skylines, suburb cul-de-sacs, Route 66, national parks', instrumentOverlay: ['blues guitar', 'jazz trumpet', 'country fiddle'], characterOverlay: 'baseball caps, denim, sneaker culture, diverse American cast', environmentOverlay: 'NYC skyline, California coast, Midwest cornfields, Southern porches', narrativeOverlay: 'American Dream underdog, startup hustle, direct benefit-focused' },
  NAM_CA:       { visualOverlay: 'Canadian maple forests, aurora borealis, urban multicultural mosaics', instrumentOverlay: ['fiddle', 'acoustic guitar', 'Indigenous drum'], characterOverlay: 'plaid flannel, winter parkas, multicultural fusion clothing', environmentOverlay: 'Rocky Mountains, Toronto skyline, Quebec old town, prairie wheat fields', narrativeOverlay: 'inclusive multicultural, polite-but-strong, nature-connected storytelling' },

  // ── EU (6) ──
  EU_DACH:      { visualOverlay: 'Bauhaus precision, Alpine chalets, Black Forest cuckoo clocks', instrumentOverlay: ['zither', 'alpine horn', 'classical piano'], characterOverlay: 'engineered fashion, Lederhosen/Dirndl traditional, precise tailoring', environmentOverlay: 'Swiss Alps, Bavarian village, Viennese concert hall, Berlin gallery', narrativeOverlay: 'engineering precision, trust through quality, structured logical progression' },
  EU_FRANCE:    { visualOverlay: 'Art Nouveau ironwork, lavender fields, patisserie windows', instrumentOverlay: ['accordion', 'violin', 'chanson vocals'], characterOverlay: 'Parisian chic, striped marinière, silk scarves, effortless elegance', environmentOverlay: 'Eiffel Tower, Provence countryside, Côte d\'Azur, Montmartre cobblestones', narrativeOverlay: 'philosophical depth, romantic sensibility, refined intellectual discourse' },
  EU_IBERIA:    { visualOverlay: 'Moorish tile azulejo, flamenco movement, sun-drenched plazas', instrumentOverlay: ['flamenco guitar', 'cajón', 'castanets'], characterOverlay: 'flamenco ruffles, matador embroidery, Portuguese fisherman knits', environmentOverlay: 'Alhambra arches, Lisbon tram streets, Barcelona Gaudí, Andalusian courtyards', narrativeOverlay: 'passionate storytelling, duende emotional depth, family-community warmth' },
  EU_NORDIC:    { visualOverlay: 'Scandinavian minimalism, fjord landscapes, Dala horse motifs, aurora glow', instrumentOverlay: ['Hardanger fiddle', 'nyckelharpa', 'kantele'], characterOverlay: 'hygge knitwear, functional Nordic design, natural fiber clothing', environmentOverlay: 'fjords, northern lights, red wooden cabins, midnight sun, archipelago', narrativeOverlay: 'understated elegance, design-thinking, lagom balanced, nature reverence' },
  EU_BENELUX:   { visualOverlay: 'Dutch windmills, tulip fields, Art Deco Brussels, canal houses', instrumentOverlay: ['carillon bells', 'barrel organ', 'classical strings'], characterOverlay: 'practical cycling fashion, Delft blue accents, diamond-district sparkle', environmentOverlay: 'Amsterdam canals, Bruges medieval, Luxembourg castles, tulip fields', narrativeOverlay: 'direct pragmatic, no-nonsense value, trading crossroads heritage' },
  EU_ITALY:     { visualOverlay: 'Renaissance fresco, Venetian masks, Tuscan cypress rows, marble David', instrumentOverlay: ['mandolin', 'opera vocals', 'violin'], characterOverlay: 'Italian couture, Venetian glass jewelry, leather artisan accessories', environmentOverlay: 'Roman Colosseum, Venice canals, Tuscan vineyards, Amalfi coast, Florentine piazza', narrativeOverlay: 'bella vita passion, artisan craftsmanship storytelling, dramatic operatic emotion' },

  // ── MENA (7) ──
  MENA_GULF:    { visualOverlay: 'futuristic towers, desert dunes meeting skyline, pearl diving heritage', instrumentOverlay: ['oud', 'riq', 'Arabian percussion'], characterOverlay: 'kandura/dishdasha elegance, abaya haute couture, gold souq jewelry', environmentOverlay: 'Burj Khalifa, desert safari dunes, pearl-diving dhow, futuristic metro', narrativeOverlay: 'aspirational luxury, vision-of-the-future, pearl-to-skyscraper transformation' },
  MENA_LEVANT:  { visualOverlay: 'Roman ruins, cedar trees, Mediterranean mosaics, souk spice palettes', instrumentOverlay: ['buzuq', 'ney', 'kanun', 'derbake'], characterOverlay: 'Mediterranean-chic, embroidered tatreez, silver filigree jewelry', environmentOverlay: 'Beirut corniche, Petra rose city, Damascus old souk, olive groves, cedar mountains', narrativeOverlay: 'cosmopolitan creative resilience, Phoenician trader wit, poetic nostalgia' },
  MENA_EGYPT:   { visualOverlay: 'pharaonic hieroglyphs, Nile feluccas, Khan el-Khalili lanterns', instrumentOverlay: ['oud', 'tabla', 'rebab', 'mizmar'], characterOverlay: 'galabeya traditional, modern Cairo chic, Eye of Horus accessories', environmentOverlay: 'Pyramids of Giza, Nile river, Cairo skyline, Luxor temples, Alexandria library', narrativeOverlay: 'Egyptian humor and wit, Umm el-Dunya (mother of the world) pride, relatable warmth' },
  MENA_MAGHREB: { visualOverlay: 'zellige tilework, Marrakech riads, Berber geometric patterns, Sahara dunes', instrumentOverlay: ['guembri', 'bendir', 'oud', 'Gnawa clapping'], characterOverlay: 'djellaba, Berber silver jewelry, embroidered babouche slippers', environmentOverlay: 'Marrakech medina, Atlas Mountains, Sahara camel caravans, Chefchaouen blue city', narrativeOverlay: 'Maghreb multicultural pride, Gnawa spiritual depth, crossroads-of-civilizations' },
  MENA_IRAQ:    { visualOverlay: 'Mesopotamian ziggurats, Babylonian lion gates, Tigris-Euphrates delta', instrumentOverlay: ['joza', 'santour', 'tabla', 'zurna'], characterOverlay: 'Kurdish embroidered vest, abaya with gold trim, Babylonian-inspired accessories', environmentOverlay: 'Mesopotamian marshlands, Erbil citadel, Baghdad riverside, ancient Babylon ruins', narrativeOverlay: 'cradle-of-civilization heritage, Mesopotamian epic storytelling, renewal from history' },
  MENA_YEMEN:   { visualOverlay: 'Sana\'a gingerbread tower houses, Socotra dragon blood trees, terraced wadis', instrumentOverlay: ['mizmar', 'tabla', 'oud'], characterOverlay: 'Yemeni turban and jambiya dagger, embroidered futa, silver Bedouin jewelry', environmentOverlay: 'Sana\'a old city, Socotra alien landscapes, Hadhramaut mud skyscrapers, coffee terraces', narrativeOverlay: 'ancient Arabian poetry tradition, dignified connection, mountain resilience' },
  MENA_ISRAEL:  { visualOverlay: 'Bauhaus Tel Aviv, Jerusalem stone, startup whiteboards, Dead Sea blues', instrumentOverlay: ['oud', 'darbuka', 'clarinet', 'electronic synth'], characterOverlay: 'startup casual, kibbutz functional, Jerusalem modest, Tel Aviv beach-chic', environmentOverlay: 'Tel Aviv beach skyline, Jerusalem old city, Negev desert, Dead Sea, startup offices', narrativeOverlay: 'bold innovation chutzpah, ancient-meets-future, startup-nation problem-solving' },

  // ── INDIA (5) ──
  INDIA_NORTH:  { visualOverlay: 'Mughal arches, Holi color powder, wheat fields, Ganges ghats', instrumentOverlay: ['sitar', 'tabla', 'shehnai', 'dholak'], characterOverlay: 'Bollywood glamour saris, kurta-churidar, Rajasthani mirror work, gold jhumka earrings', environmentOverlay: 'Taj Mahal, Rajasthani desert forts, Delhi Red Fort, Varanasi ghats, mustard fields', narrativeOverlay: 'Bollywood dramatic family saga, Holi festival joy, warm hospitality' },
  INDIA_SOUTH:  { visualOverlay: 'Dravidian temple gopurams, banana leaf meals, classical Bharatanatyam poses', instrumentOverlay: ['veena', 'mridangam', 'nadaswaram', 'ghatam'], characterOverlay: 'silk Kanchipuram saris, jasmine flower garlands, temple gold jewelry, mundu-veshti', environmentOverlay: 'Meenakshi temple, Kerala backwaters, Hampi ruins, Mysore palace, coffee plantations', narrativeOverlay: 'classical precision, tech-heritage balance, temple devotion meets silicon city' },
  INDIA_EAST:   { visualOverlay: 'Durga Puja pandals, rice paddy reflections, Darjeeling tea gardens', instrumentOverlay: ['esraj', 'tabla', 'dhak drum', 'flute'], characterOverlay: 'Bengali cotton saris with red border, Assamese mekhela, intellectual bhadralok style', environmentOverlay: 'Howrah Bridge, Sundarbans mangroves, Darjeeling hills, Konark sun temple, tea estates', narrativeOverlay: 'intellectual artistic depth, Tagore poetic sensibility, Durga Puja community spirit' },
  INDIA_WEST:   { visualOverlay: 'Gujarati Rann of Kutch white desert, Ganesh Chaturthi processions, Bollywood studios', instrumentOverlay: ['harmonium', 'dholak', 'tabla', 'dandiya sticks'], characterOverlay: 'Gujarati chaniya choli, Maharashtrian nauvari sari, Parsi border embroidery', environmentOverlay: 'Gateway of India, Gir lion sanctuary, Rann of Kutch, Ajanta Ellora caves, Goa beaches', narrativeOverlay: 'entrepreneurial vibrant, Garba festival energy, business-community storytelling' },
  INDIA_PAN:    { visualOverlay: 'tricolor motifs, unity-in-diversity cultural mosaic, Incredible India tourism', instrumentOverlay: ['sitar', 'tabla', 'bansuri', 'harmonium', 'dholak'], characterOverlay: 'pan-Indian fusion fashion, khadi handloom, tricolor accessories', environmentOverlay: 'India Gate, diverse landscape montage, festival collage, unity celebrations', narrativeOverlay: 'unity-in-diversity pride, national aspiration, inclusive all-India storytelling' },

  // ── AFRICA (5) ──
  AFRICA_EAST:  { visualOverlay: 'Maasai beadwork, Kilimanjaro silhouette, savanna acacia, M-Pesa mobile culture', instrumentOverlay: ['nyatiti', 'kayamba', 'drums', 'Swahili vocals'], characterOverlay: 'Maasai shuka wraps, Kikoi fabrics, beaded necklaces, mobile-first youth style', environmentOverlay: 'Serengeti plains, Zanzibar stone town, Nairobi skyline, Great Rift Valley, tea highlands', narrativeOverlay: 'mobile-first hustle, safari wonder, Ubuntu communal storytelling, tech-leapfrog' },
  AFRICA_WEST:  { visualOverlay: 'Nollywood vibrant, Yoruba Gele headwrap, Ashanti gold weights, Sahel indigo', instrumentOverlay: ['djembe', 'kora', 'talking drums', 'shekere'], characterOverlay: 'ankara print agbada, kente wrapped, Gele headties, coral bead jewelry', environmentOverlay: 'Lagos skyline, Sahel desert edge, tropical coast, market squares, Niger River', narrativeOverlay: 'Nollywood dramatic, proverb-led, Anansi trickster wisdom, market-hustle energy' },
  AFRICA_SOUTH: { visualOverlay: 'Table Mountain, Ndebele geometric house painting, rainbow nation palette', instrumentOverlay: ['marimba', 'uhadi bow', 'concertina', 'mbira', 'isicathamiya vocals'], characterOverlay: 'Madiba shirt, Ndebele beadwork, Shweshwe fabric, Zulu shield motifs', environmentOverlay: 'Cape Town Table Mountain, Kruger safari, Soweto murals, Drakensberg peaks, vineyards', narrativeOverlay: 'rainbow-nation unity, resilience-innovation, Ubuntu philosophy, post-apartheid hope' },
  AFRICA_NORTH: { visualOverlay: 'pharaonic-Berber hybrid patterns, Mediterranean coast, Saharan crossroads', instrumentOverlay: ['oud', 'bendir', 'guembri', 'mizmar'], characterOverlay: 'djellaba-kaftan blend, Berber tattoo motifs, Mediterranean-North African fusion', environmentOverlay: 'Sahara edge, Mediterranean coast, ancient ruins, medina old cities, Atlas passes', narrativeOverlay: 'crossroads-of-civilizations, Mediterranean-Saharan bridge, heritage-modernity fusion' },
  AFRICA_FRANCO:{ visualOverlay: 'Francophone elegance meets West African vibrancy, boubou grandeur', instrumentOverlay: ['balafon', 'kora', 'tama', 'French chanson elements'], characterOverlay: 'grand boubou, sapeur Congolese dandyism, pagne/wrapper elegance', environmentOverlay: 'Dakar Monument, Abidjan plateau, Kinshasa music scene, francophone colonial architecture', narrativeOverlay: 'Franco-African sophistication, Négritude literary depth, music-culture fusion' },

  // ── SEA (5) ──
  SEA_MALAY:    { visualOverlay: 'batik mega mendung clouds, Islamic crescent moons, tropical orchids, wayang kulit', instrumentOverlay: ['gamelan', 'angklung', 'sape', 'kompang'], characterOverlay: 'batik sarong kebaya, baju kurung, songkok, tudung, bunga rampai garlands', environmentOverlay: 'Borobudur temple, Petronas Towers, Bali rice terraces, floating mosques, rainforest', narrativeOverlay: 'halal-economy pride, gotong-royong communal, nature-spirit harmony' },
  SEA_THAI:     { visualOverlay: 'golden temple spires, Thai Lanna lanterns, elephant motifs, lotus ponds', instrumentOverlay: ['ranat ek', 'khim', 'saw duang', 'klong thap'], characterOverlay: 'Thai silk, temple dancer crown (chada), flower garlands, gold accessories', environmentOverlay: 'Grand Palace Bangkok, Chiang Mai temples, floating markets, Thai beach sunsets', narrativeOverlay: 'sabai-sabai gentle harmony, Thai smile warmth, Buddhist middle-path balance' },
  SEA_VIET:     { visualOverlay: 'ao dai silk, conical non la hats, lotus flowers, dragon boat prows', instrumentOverlay: ['dan bau', 'dan tranh', 'trong com', 'sao truc flute'], characterOverlay: 'ao dai traditional, non la conical hat, lacquer accessories, lotus motifs', environmentOverlay: 'Ha Long Bay, Hoi An lanterns, Mekong Delta, Hanoi Old Quarter, Saigon skyline', narrativeOverlay: 'dynamic-rising ambition, bamboo resilience (bending not breaking), family devotion' },
  SEA_PHIL:     { visualOverlay: 'jeepney art, terno butterfly sleeves, coral reef colors, fiesta banners', instrumentOverlay: ['kulintang', 'rondalla guitars', 'bamboo percussion', 'karaoke vocals'], characterOverlay: 'terno gown, barong tagalog, festival costumes, pearl accessories', environmentOverlay: 'Chocolate Hills, Manila Bay, rice terraces Banaue, Sinulog festival, island beaches', narrativeOverlay: 'bayanihan communal spirit, fiesta joyful, resilient-cheerful, Taglish casual warmth' },
  SEA_PAN:      { visualOverlay: 'Marina Bay skyline, merlion, multicultural mosaic, garden city orchids', instrumentOverlay: ['erhu', 'tabla', 'gamelan', 'pop synth'], characterOverlay: 'modern multicultural fashion, Peranakan beadwork accents, practical tropical smart', environmentOverlay: 'Gardens by the Bay, Orchard Road, hawker centres, Marina Bay Sands, multicultural districts', narrativeOverlay: 'kiasu excellence, efficiency-innovation, multicultural meritocracy, garden-city precision' },

  // ── CJK (4) ──
  CJK_CN:       { visualOverlay: 'guochao modern Chinese, dragon cloud patterns, red lanterns, ink wash mountains', instrumentOverlay: ['guqin', 'pipa', 'erhu', 'dizi', 'gong'], characterOverlay: 'modern hanfu fusion, qipao elements, jade accessories, red-gold palette', environmentOverlay: 'Great Wall, Shanghai Bund, Guilin karst peaks, Forbidden City, Li River mist', narrativeOverlay: 'guochao national pride, 5000-year heritage meets tech future, collective aspiration' },
  CJK_JP:       { visualOverlay: 'sakura cherry blossoms, torii gates, minimalist wabi-sabi, ukiyo-e waves', instrumentOverlay: ['shamisen', 'shakuhachi', 'koto', 'taiko'], characterOverlay: 'kimono elegance, minimalist modern Japanese, cherry blossom accessories', environmentOverlay: 'Mt. Fuji, Kyoto temples, Tokyo neon, zen gardens, bamboo forests, hot springs', narrativeOverlay: 'omotenashi precision, mono no aware (pathos of things), seasonal mindfulness' },
  CJK_KR:       { visualOverlay: 'Hallyu K-pop neon, hanbok curves, celadon green, palace roof lines', instrumentOverlay: ['gayageum', 'janggu', 'daegeum', 'K-pop beats'], characterOverlay: 'K-fashion trendy, modern hanbok fusion, skincare glow aesthetic', environmentOverlay: 'Seoul skyline, Gyeongbokgung palace, Bukchon hanok village, Jeju volcanic island', narrativeOverlay: 'Hallyu cool innovation, K-drama emotional intensity, ppalli-ppalli fast pacing' },
  CJK_TW:       { visualOverlay: 'night market lanterns, bubble tea warmth, temple incense coils, Pacific coast', instrumentOverlay: ['erhu', 'pipa', 'electronic indie', 'mountain flute'], characterOverlay: 'creative artisan casual, aboriginal textile patterns, night market vendor warmth', environmentOverlay: 'Taipei 101, Jiufen old street, Taroko Gorge, night markets, Sun Moon Lake', narrativeOverlay: 'artisan creative warmth, night-market communal, indie-creative quality-focus' },

  // ── LATAM (5) ──
  LATAM_MX:     { visualOverlay: 'Día de los Muertos calaveras, Aztec sun stone, papel picado, agave fields', instrumentOverlay: ['mariachi trumpet', 'guitarrón', 'vihuela', 'marimba'], characterOverlay: 'charro suit, huipil embroidery, calavera face paint, sombrero', environmentOverlay: 'Chichén Itzá, Mexico City murals, Oaxaca markets, Cenote caves, Frida\'s blue house', narrativeOverlay: 'Mexican calidez warmth, Día de los Muertos ancestor love, magical realism depth' },
  LATAM_BR:     { visualOverlay: 'carnival samba feathers, Copacabana mosaic, Amazon emerald, capoeira arcs', instrumentOverlay: ['berimbau', 'surdo drum', 'cavaquinho', 'pandeiro'], characterOverlay: 'carnival fantasia, Havaianas casual, Bahian turban, capoeira whites', environmentOverlay: 'Christ the Redeemer, Amazon rainforest, Copacabana beach, Salvador Pelourinho, Iguazu Falls', narrativeOverlay: 'jeitinho brasileiro creative problem-solving, samba rhythm joy, tropical abundance' },
  LATAM_CONE:   { visualOverlay: 'Buenos Aires tango shadows, gaucho pampa, Patagonian glaciers, mate gourds', instrumentOverlay: ['bandoneón', 'guitar', 'charango', 'bombo'], characterOverlay: 'tango attire, gaucho bombachas, wine-country casual, porteño intellectual style', environmentOverlay: 'Buenos Aires obelisk, Patagonia glaciers, Mendoza vineyards, Uruguayan beaches, tango milongas', narrativeOverlay: 'porteño intellectual passion, tango melancholy beauty, gaucho independence' },
  LATAM_ANDES:  { visualOverlay: 'Inca stonework, llama herds, woven aguayo textiles, volcanic peaks', instrumentOverlay: ['charango', 'quena', 'zampoña pan pipes', 'bombo'], characterOverlay: 'aguayo woven poncho, chullo knit hat, emerald jewelry, alpaca wool', environmentOverlay: 'Machu Picchu, Lake Titicaca, Colombian coffee hills, Quito colonial, Galápagos', narrativeOverlay: 'andean authenticity, Pachamama earth reverence, heritage-progress bridge' },
  LATAM_CARIB:  { visualOverlay: 'tropical carnival, cumbia dance, Caribbean coast palms, champeta colors', instrumentOverlay: ['cumbia accordion', 'gaita', 'tambora', 'maracas'], characterOverlay: 'pollera colorada, carnival headdresses, tropical-bright casual, guayabera', environmentOverlay: 'Cartagena walled city, Caribbean coast, Venezuelan tepuis, tropical ports', narrativeOverlay: 'tropical celebration energy, cumbia rhythm storytelling, Caribbean coast joy' },

  // ── CARIBBEAN (2) ──
  CARIBBEAN_EN: { visualOverlay: 'reggae red-gold-green, jerk smoke, blue mountains, rum barrel patina', instrumentOverlay: ['steel pan', 'reggae bass', 'ska horn', 'dub effects'], characterOverlay: 'Rasta tam, island casual, carnival costume, cricket whites', environmentOverlay: 'Jamaican Blue Mountains, Trinidad Carnival, Barbados beaches, Kingston streets', narrativeOverlay: 'irie confidence, reggae resistance poetry, island-time wisdom, cricket banter' },
  CARIBBEAN_FR: { visualOverlay: 'Créole gingerbread houses, madras cloth, tropical French patisserie', instrumentOverlay: ['ka drum', 'tibwa sticks', 'accordion', 'zouk bass'], characterOverlay: 'madras headwrap, Créole dress, French-Caribbean fusion fashion', environmentOverlay: 'Martinique volcanic peaks, Guadeloupe butterfly island, Haiti Citadelle, Créole markets', narrativeOverlay: 'Créole fusion artistic resilience, French-Caribbean literary depth, carnival spirit' },

  // ── OCEANIA (2) ──
  OCEANIA_AU:   { visualOverlay: 'Aboriginal dot art ochres, outback red earth, surf culture, eucalyptus', instrumentOverlay: ['didgeridoo', 'clapsticks', 'bullroarer', 'bush guitar'], characterOverlay: 'Akubra hat, surf casual, Indigenous body paint, bushwalker gear', environmentOverlay: 'Uluru, Great Barrier Reef, Sydney Opera House, outback red desert, eucalyptus bush', narrativeOverlay: 'no-worries mateship, Dreamtime ancient wisdom, bush-dry humor, fair-go equality' },
  OCEANIA_NZ:   { visualOverlay: 'Maori koru spirals, silver fern, hobbit-green hills, volcanic geothermal', instrumentOverlay: ['taonga puoro (bone flute)', 'poi rhythm', 'guitar', 'ukulele'], characterOverlay: 'Maori tā moko tattoo patterns, greenstone pounamu jewelry, merino wool', environmentOverlay: 'Milford Sound fjord, Rotorua geysers, hobbit-shire green hills, kiwi bush, volcanic peaks', narrativeOverlay: 'kiwi inclusive aroha (love), Maori mana-enhancing, sustainability-first, humble pride' },

  // ── TURKEY (2) ──
  TURKEY_ISTANBUL: { visualOverlay: 'Hagia Sophia domes, Bosphorus strait, tulip tiles, Ottoman calligraphy', instrumentOverlay: ['kanun', 'ney', 'kemençe', 'darbuka'], characterOverlay: 'cosmopolitan Istanbul fashion, Ottoman-inspired accessories, tulip motifs', environmentOverlay: 'Bosphorus bridge sunset, Grand Bazaar, Blue Mosque, Galata Tower, ferry boats', narrativeOverlay: 'cosmopolitan bridge city, Ottoman grandeur meets modern ambition, creative energy' },
  TURKEY_ANATOLIA: { visualOverlay: 'Cappadocia fairy chimneys, whirling dervish, kilim weavings, pomegranate', instrumentOverlay: ['bağlama saz', 'zurna', 'davul', 'kemane'], characterOverlay: 'Anatolian village clothing, kilim-patterned accessories, pomegranate symbols', environmentOverlay: 'Cappadocia balloon sunrise, Ephesus ruins, Pamukkale terraces, wheat fields, cave houses', narrativeOverlay: 'heartland authenticity, Mevlana whirling wisdom, Anatolian roots-to-modern bridge' },

  // ── PAKISTAN (4) ──
  PK_PUNJAB:    { visualOverlay: 'truck art panels, Badshahi Mosque, bhangra movement, mustard fields', instrumentOverlay: ['dhol', 'tumbi', 'chimta', 'algoza twin flutes'], characterOverlay: 'colorful Punjabi shalwar kameez, phulkari dupattas, jutti shoes, turban', environmentOverlay: 'Lahore walled city, Badshahi Mosque, canal gardens, wheat-mustard fields, truck highways', narrativeOverlay: 'josh (passion) energy, bhangra celebration, family-feast warmth, truck-art highway' },
  PK_SINDH:     { visualOverlay: 'ajrak block prints, Sufi shrine domes, Indus River boats, Mohenjo-daro ruins', instrumentOverlay: ['alghoza', 'dholak', 'yaktaro', 'boreendo flute'], characterOverlay: 'Sindhi ajrak shawl, embroidered cap (topi), mirror-work dress, Sufi green accents', environmentOverlay: 'Mohenjo-daro ruins, Shah Jahan Mosque, Indus River, Keenjhar Lake, Sufi shrines', narrativeOverlay: 'Sufi mystical depth, Indus Valley ancient pride, poetic introspection' },
  PK_KPK:       { visualOverlay: 'Pashtun mountain valleys, tribal geometric embroidery, walnut wood carvings', instrumentOverlay: ['rabab', 'mangey', 'surnai', 'dohol'], characterOverlay: 'Pashtun turban (lungee), waistcoat (waskat), tribal silver jewelry, chappal sandals', environmentOverlay: 'Swat Valley, Khyber Pass, Hindu Kush peaks, Peshawar old city, tribal fort towers', narrativeOverlay: 'Pashtunwali code of honor, mountain courage, hospitality-above-all, frontier epic' },
  PK_URDU:      { visualOverlay: 'Mughal miniature borders, nastaliq calligraphy, Urdu ghazal script flourishes', instrumentOverlay: ['sitar', 'tabla', 'harmonium', 'sarangi'], characterOverlay: 'refined sherwani, elegant sari, Mughal-era jewelry, nastaliq script accessories', environmentOverlay: 'Islamabad Faisal Mosque, Mughal gardens, literary mushaira gatherings, tea houses', narrativeOverlay: 'ghazal poetic refinement, adab (etiquette) elegance, mushaira literary tradition' },

  // ── BANGLADESH (2) ──
  BD_DHAKA:     { visualOverlay: 'rickshaw art kaleidoscope, jamdani weave shimmer, Dhaka street energy', instrumentOverlay: ['dotara', 'dhol', 'flute', 'harmonium'], characterOverlay: 'jamdani sari, lungi casual, rickshaw-art color palette clothing', environmentOverlay: 'Dhaka old town, Buriganga river, Ahsan Manzil pink palace, garment district, rickshaw streets', narrativeOverlay: 'modern urban dynamism, youth tech aspiration, rickshaw-art colorful energy' },
  BD_CHITTAGONG:{ visualOverlay: 'hill tracts tribal patterns, ship-breaking yards, tea gardens, Bay of Bengal', instrumentOverlay: ['bamboo instruments', 'tribal drums', 'flute', 'marma harp'], characterOverlay: 'Chakma tribal weave, hill tracts traditional dress, tea garden worker attire', environmentOverlay: 'Cox\'s Bazar beach, Chittagong Hill Tracts, tea gardens, ship-breaking coast, tribal villages', narrativeOverlay: 'hill-and-sea duality, tribal heritage, port-city resilience, natural beauty' },

  // ── EASTERN EUROPE / EURASIA subregions (3) ──
  EE_UKRAINE:   { visualOverlay: 'vyshyvanka embroidery, sunflower fields, pysanka Easter eggs, Carpathian peaks', instrumentOverlay: ['bandura', 'sopilka', 'tsymbaly', 'trembita horn'], characterOverlay: 'vyshyvanka embroidered shirt, vinok flower crown, Cossack sharovary trousers', environmentOverlay: 'Kyiv golden domes, Carpathian Mountains, sunflower fields, Lviv coffee houses, wheat steppe', narrativeOverlay: 'resilient tech innovation, sunflower strength, Cossack independence spirit' },
  EE_BALKANS:   { visualOverlay: 'Ottoman bridge arches, Byzantine church frescoes, Adriatic coast, brass band energy', instrumentOverlay: ['tambura', 'gusle', 'accordion', 'brass band trumpet'], characterOverlay: 'folk embroidered vest, Balkan šajkača cap, Mediterranean-mountain crossover fashion', environmentOverlay: 'Mostar bridge, Dubrovnik walls, Belgrade fortress, Balkan village, Adriatic islands', narrativeOverlay: 'passionate bridge-of-cultures, Sevdalinka emotional depth, brass-band celebration' },
  EE_CAUCASUS:  { visualOverlay: 'khachkar stone crosses, Caucasus mountain eagles, winemaking qvevri', instrumentOverlay: ['duduk', 'panduri', 'zurna', 'dholi drum'], characterOverlay: 'Georgian chokha coat, Armenian embroidery, Caucasus papakha hat, silver belt', environmentOverlay: 'Caucasus peaks, Georgian cave city, Armenian monastery, Baku flame towers, wine valleys', narrativeOverlay: 'ancient-modern pride, Caucasus hospitality feast (supra), eagle-mountain valor' },

  // ── CENTRAL ASIA (3) ──
  CA_KZ:        { visualOverlay: 'steppe eagle golden, yurt felt patterns, Bayterek tower, nomadic horseback', instrumentOverlay: ['dombra', 'kobyz', 'sybyzgy flute'], characterOverlay: 'Kazakh chapan coat, telpak fox-fur hat, golden eagle hunter gloves, felt boots', environmentOverlay: 'Kazakh steppe, Nur-Sultan Bayterek, Charyn Canyon, Altai mountains, eagle hunting', narrativeOverlay: 'steppe-scale ambition, eagle hunter valor, nomadic-to-modern transformation' },
  CA_UZ:        { visualOverlay: 'Registan square turquoise domes, suzani embroidery, Silk Road tiles', instrumentOverlay: ['dotar', 'chang', 'nay', 'qo\'shno\'y'], characterOverlay: 'uzbek chapan robe, tubeteyka cap, atlas silk ikat, suzani embroidery', environmentOverlay: 'Samarkand Registan, Bukhara old city, Silk Road caravansaries, cotton fields, blue domes', narrativeOverlay: 'Silk Road heritage revival, suzani craft patience, Tamerlane grandeur, trade-route crossroads' },
  CA_AZ:        { visualOverlay: 'Flame Towers, carpet patterns, pomegranate motifs, Caspian coast', instrumentOverlay: ['tar', 'kamancha', 'nagara drum', 'balaban'], characterOverlay: 'Azerbaijani kelaghayi silk scarf, carpet-pattern accessories, modern Baku fashion', environmentOverlay: 'Baku Flame Towers, old city (İçərişəhər), mud volcanoes, Caspian coast, fire temple', narrativeOverlay: 'Land of Fire innovation, mugham musical depth, Caspian crossroads energy' },

  // ── SOUTH ASIA (4) ──
  SA_NEPAL:     { visualOverlay: 'Himalayan prayer flags, Durbar Square pagodas, Sherpa mountain trails', instrumentOverlay: ['madal', 'sarangi', 'bansuri', 'damphu'], characterOverlay: 'topi cap, dhaka fabric, Sherpa jacket, Newari festival dress, prayer beads', environmentOverlay: 'Everest base camp, Kathmandu Durbar Square, Chitwan jungle, Annapurna range, prayer wheels', narrativeOverlay: 'Himalayan humble determination, Sherpa mountain wisdom, community-growth spirit' },
  SA_SRILANKA:  { visualOverlay: 'Sigiriya lion rock, Kandyan dance, sapphire blue, lotus Buddhist art', instrumentOverlay: ['rabana drum', 'horanewa', 'flute', 'geta beraya'], characterOverlay: 'Kandyan sari draping, batik sarong, moonstone jewelry, Sri Lankan sapphires', environmentOverlay: 'Sigiriya rock fortress, Galle Fort, tea hill country, whale coast, Adam\'s Peak pilgrimage', narrativeOverlay: 'island serendipity, Buddhist mindful renewal, pearl-of-Indian-Ocean pride' },
  SA_BHUTAN:    { visualOverlay: 'dzong fortress architecture, GNH happiness motifs, thunder dragon, prayer wheels', instrumentOverlay: ['dramyin lute', 'lingm flute', 'yangchen dulcimer'], characterOverlay: 'gho robe (men), kira dress (women), kabney ceremonial scarf, Buddhist ornaments', environmentOverlay: 'Tiger\'s Nest monastery, dzong fortresses, Himalayan valleys, prayer flag bridges, archery fields', narrativeOverlay: 'Gross National Happiness mindfulness, thunder dragon courage, balance-over-excess wisdom' },
  SA_MALDIVES:  { visualOverlay: 'overwater bungalows, bioluminescent beaches, whale sharks, coral atolls', instrumentOverlay: ['bodu beru drums', 'bulbul tarang', 'onugandu'], characterOverlay: 'island casual, dhivehi traditional libaas, shell and coral jewelry', environmentOverlay: 'overwater villas, bioluminescent plankton beach, coral atoll aerial, whale shark dive, Friday mosque', narrativeOverlay: 'paradise luxury sustainability, ocean-first mindset, intimate island storytelling' },
};

/**
 * Adapt an imagination preset to a specific region.
 * Returns a merged version where the preset's foundation remains
 * but regional cultural elements are layered on top.
 *
 * Does NOT mutate the original preset — returns new adapted data.
 */
export interface AdaptedPresetData {
  /** Base preset ID */
  presetId: string;
  /** Region it was adapted for */
  regionCode: string;
  /** Adapted prompt modifiers — preset base + regional overlay */
  prompt: ImaginationPreset['prompt'];
  /** Adapted music DNA — preset base + regional instruments */
  music: ImaginationPreset['music'];
  /** Adapted visual DNA — preset base + regional setting */
  visual: ImaginationPreset['visual'];
  /** Adapted character DNA — preset base + regional clothing */
  character: ImaginationPreset['character'];
  /** Adapted narrative DNA — preset base + regional storytelling */
  narrative: ImaginationPreset['narrative'];
}

export function adaptPresetToRegion(presetId: string, regionCode: string): AdaptedPresetData | undefined {
  const preset = IMAGINATION_PRESETS[presetId];
  if (!preset) return undefined;

  // Parse parent region from code (e.g., 'INDIA_NORTH' → 'INDIA', 'NAM_US' → 'NAM')
  const parentRegion = regionCode.includes('_')
    ? regionCode.split('_')[0]
    : regionCode;

  // Try exact subregion match first (e.g., 'INDIA_NORTH'), then fall back to parent (e.g., 'INDIA')
  const layer = REGIONAL_ADAPTATION_LAYERS[regionCode] ?? REGIONAL_ADAPTATION_LAYERS[parentRegion];
  if (!layer) {
    // No regional adaptation available — return preset as-is
    return {
      presetId,
      regionCode,
      prompt: { ...preset.prompt },
      music: { ...preset.music },
      visual: { ...preset.visual },
      character: { ...preset.character },
      narrative: { ...preset.narrative },
    };
  }

  // Merge prompt modifiers: append regional overlays
  const adaptedPrompt: ImaginationPreset['prompt'] = {
    stylePrefix: `${preset.prompt.stylePrefix}, ${layer.visualOverlay}`,
    qualityBoost: preset.prompt.qualityBoost,
    negativePrompt: preset.prompt.negativePrompt,
    characterPrefix: `${preset.prompt.characterPrefix}, ${layer.characterOverlay}`,
    environmentPrefix: `${preset.prompt.environmentPrefix}, ${layer.environmentOverlay}`,
    videoMotionStyle: preset.prompt.videoMotionStyle,
  };

  // Merge music: keep preset genre/mood, add regional instruments (up to 3)
  const mergedInstruments = [
    ...preset.music.instruments.slice(0, 3),
    ...layer.instrumentOverlay.slice(0, 2),
  ];
  const adaptedMusic: ImaginationPreset['music'] = {
    genre: `${preset.music.genre} with ${parentRegion.toLowerCase()} regional flavor`,
    instruments: mergedInstruments,
    bpmRange: preset.music.bpmRange,
    mood: preset.music.mood,
    sfxStyle: preset.music.sfxStyle,
  };

  // Merge visual: keep preset render style, add regional overlay
  const adaptedVisual: ImaginationPreset['visual'] = {
    ...preset.visual,
    backgroundStyle: `${preset.visual.backgroundStyle}, with ${layer.environmentOverlay}`,
    colorPalette: layer.colorAccents
      ? [...preset.visual.colorPalette.slice(0, 3), ...layer.colorAccents.slice(0, 2)]
      : preset.visual.colorPalette,
  };

  // Merge character: keep preset proportions/style, add regional clothing notes
  const adaptedCharacter: ImaginationPreset['character'] = {
    ...preset.character,
    costumeApproach: `${preset.character.costumeApproach} adapted with ${layer.characterOverlay}`,
  };

  // Merge narrative: keep preset pacing, layer regional storytelling approach
  const adaptedNarrative: ImaginationPreset['narrative'] = {
    ...preset.narrative,
    pacing: `${preset.narrative.pacing} — ${layer.narrativeOverlay}`,
  };

  return {
    presetId,
    regionCode,
    prompt: adaptedPrompt,
    music: adaptedMusic,
    visual: adaptedVisual,
    character: adaptedCharacter,
    narrative: adaptedNarrative,
  };
}

/**
 * Get all presets with regional adaptation applied.
 * Useful for showing preset gallery with regional previews.
 */
export function getRegionalPresetGallery(regionCode: string): AdaptedPresetData[] {
  return Object.keys(IMAGINATION_PRESETS)
    .map(id => adaptPresetToRegion(id, regionCode))
    .filter((d): d is AdaptedPresetData => d !== undefined);
}

/**
 * Recommend imagination presets that work well for a specific region.
 * Cultural-style presets matching the region are boosted.
 */
export function recommendPresetsForRegion(regionCode: string, limit = 5): ImaginationPreset[] {
  const parentRegion = regionCode.includes('_') ? regionCode.split('_')[0] : regionCode;

  // Tag → region affinity mapping (parent + subregion level)
  const regionTagAffinity: Record<string, string[]> = {
    // ── 16 Parent Regions ──
    NAM:          ['toys', 'pixel', 'superhero', 'retro', 'family'],
    EU:           ['celtic', 'stained-glass', 'watercolor', 'mosaic', 'elegant'],
    EURASIA:      ['celtic', 'folk', 'rosemaling', 'mosaic', 'dramatic'],
    TURKEY:       ['arabesque', 'mosaic', 'geometric', 'calligraphy', 'ornate'],
    MENA:         ['arabesque', 'geometric', 'calligraphy', 'miniature', 'sacred'],
    AFRICA:       ['kente', 'graffiti', 'folk', 'cultural', 'proverb'],
    INDIA:        ['madhubani', 'rangoli', 'bollywood', 'festival', 'folk'],
    PAKISTAN:      ['truck-art', 'miniature', 'folk', 'vibrant', 'heritage'],
    BANGLADESH:   ['folk', 'watercolor', 'nature', 'heritage', 'craft'],
    SOUTH_ASIA:   ['ink-wash', 'contemplative', 'sacred', 'nature', 'heritage'],
    SEA:          ['batik', 'shadow-puppet', 'wayang', 'tropical', 'craft'],
    CJK:          ['ukiyo-e', 'ink-wash', 'anime', 'zen', 'calligraphy'],
    LATAM:        ['graffiti', 'vibrant', 'folk', 'festival', 'cultural'],
    CARIBBEAN:    ['graffiti', 'tropical', 'vibrant', 'urban', 'musical'],
    OCEANIA:      ['aboriginal', 'dreamtime', 'ocean', 'dot-painting', 'nature'],
    CENTRAL_ASIA: ['miniature', 'folk', 'heritage', 'craft', 'nomadic'],
    // ── Subregion specializations ──
    NAM_US:       ['superhero', 'pixel', 'retro', 'action', 'family'],
    NAM_CA:       ['watercolor', 'nature', 'folk', 'family', 'craft'],
    EU_DACH:      ['blueprint', 'technical', 'precise', 'engineering', 'elegant'],
    EU_FRANCE:    ['watercolor', 'elegant', 'oil-painting', 'art', 'romantic'],
    EU_IBERIA:    ['mosaic', 'folk', 'passionate', 'festival', 'cultural'],
    EU_NORDIC:    ['rosemaling', 'folk', 'hygge', 'nature', 'craft'],
    EU_BENELUX:   ['watercolor', 'paper', 'craft', 'elegant', 'modern'],
    EU_ITALY:     ['mosaic', 'oil-painting', 'art', 'elegant', 'renaissance'],
    MENA_GULF:    ['arabesque', 'geometric', 'sacred', 'ornate', 'gold'],
    MENA_LEVANT:  ['mosaic', 'arabesque', 'calligraphy', 'heritage', 'creative'],
    MENA_EGYPT:   ['mosaic', 'sacred', 'ancient', 'heritage', 'monumental'],
    MENA_MAGHREB: ['arabesque', 'tile', 'folk', 'vibrant', 'craft'],
    MENA_IRAQ:    ['arabesque', 'ancient', 'heritage', 'sacred', 'monumental'],
    MENA_YEMEN:   ['folk', 'heritage', 'traditional', 'craft', 'ancient'],
    MENA_ISRAEL:  ['blueprint', 'modern', 'pixel', 'action', 'urban'],
    INDIA_NORTH:  ['bollywood', 'madhubani', 'festival', 'dramatic', 'musical'],
    INDIA_SOUTH:  ['rangoli', 'folk', 'heritage', 'sacred', 'cultural'],
    INDIA_EAST:   ['watercolor', 'folk', 'nature', 'cultural', 'artistic'],
    INDIA_WEST:   ['rangoli', 'festival', 'vibrant', 'folk', 'community'],
    INDIA_PAN:    ['bollywood', 'madhubani', 'rangoli', 'festival', 'india'],
    AFRICA_EAST:  ['folk', 'nature', 'cultural', 'community', 'heritage'],
    AFRICA_WEST:  ['kente', 'folk', 'proverb', 'cultural', 'vibrant'],
    AFRICA_SOUTH: ['graffiti', 'folk', 'community', 'heritage', 'nature'],
    AFRICA_NORTH: ['arabesque', 'mosaic', 'heritage', 'cultural', 'folk'],
    AFRICA_FRANCO:['folk', 'elegant', 'cultural', 'heritage', 'artistic'],
    SEA_MALAY:    ['batik', 'shadow-puppet', 'tropical', 'craft', 'heritage'],
    SEA_THAI:     ['folk', 'sacred', 'tropical', 'heritage', 'nature'],
    SEA_VIET:     ['watercolor', 'folk', 'nature', 'craft', 'heritage'],
    SEA_PHIL:     ['folk', 'festival', 'tropical', 'community', 'vibrant'],
    SEA_PAN:      ['modern', 'urban', 'pixel', 'blueprint', 'elegant'],
    CJK_CN:       ['ink-wash', 'calligraphy', 'zen', 'heritage', 'ancient'],
    CJK_JP:       ['ukiyo-e', 'anime', 'zen', 'cherry-blossom', 'contemplative'],
    CJK_KR:       ['anime', 'neon', 'urban', 'musical', 'dramatic'],
    CJK_TW:       ['watercolor', 'folk', 'nature', 'craft', 'creative'],
    LATAM_MX:     ['folk', 'festival', 'cultural', 'vibrant', 'heritage'],
    LATAM_BR:     ['graffiti', 'festival', 'vibrant', 'musical', 'tropical'],
    LATAM_CONE:   ['oil-painting', 'elegant', 'dramatic', 'artistic', 'heritage'],
    LATAM_ANDES:  ['folk', 'heritage', 'nature', 'cultural', 'craft'],
    LATAM_CARIB:  ['tropical', 'vibrant', 'festival', 'musical', 'community'],
    CARIBBEAN_EN: ['graffiti', 'tropical', 'musical', 'vibrant', 'urban'],
    CARIBBEAN_FR: ['elegant', 'folk', 'artistic', 'tropical', 'heritage'],
    OCEANIA_AU:   ['aboriginal', 'dot-painting', 'dreamtime', 'ochre', 'nature'],
    OCEANIA_NZ:   ['ocean', 'nature', 'folk', 'heritage', 'contemplative'],
    TURKEY_ISTANBUL: ['mosaic', 'arabesque', 'urban', 'elegant', 'cosmopolitan'],
    TURKEY_ANATOLIA: ['folk', 'heritage', 'craft', 'traditional', 'nature'],
    PK_PUNJAB:    ['truck-art', 'vibrant', 'festival', 'folk', 'musical'],
    PK_SINDH:     ['folk', 'heritage', 'contemplative', 'sacred', 'craft'],
    PK_KPK:       ['folk', 'heritage', 'nature', 'ancient', 'craft'],
    PK_URDU:      ['miniature', 'calligraphy', 'elegant', 'heritage', 'ornate'],
    BD_DHAKA:     ['folk', 'vibrant', 'urban', 'heritage', 'craft'],
    BD_CHITTAGONG:['nature', 'folk', 'heritage', 'craft', 'ocean'],
    EE_UKRAINE:   ['folk', 'heritage', 'nature', 'craft', 'dramatic'],
    EE_BALKANS:   ['folk', 'mosaic', 'heritage', 'dramatic', 'community'],
    EE_CAUCASUS:  ['folk', 'heritage', 'ancient', 'craft', 'nature'],
    CA_KZ:        ['folk', 'heritage', 'nature', 'craft', 'nomadic'],
    CA_UZ:        ['miniature', 'heritage', 'craft', 'ornate', 'silk'],
    CA_AZ:        ['folk', 'heritage', 'craft', 'nature', 'mosaic'],
    SA_NEPAL:     ['folk', 'sacred', 'nature', 'heritage', 'contemplative'],
    SA_SRILANKA:  ['folk', 'ocean', 'heritage', 'nature', 'sacred'],
    SA_BHUTAN:    ['folk', 'sacred', 'contemplative', 'heritage', 'nature'],
    SA_MALDIVES:  ['ocean', 'nature', 'tropical', 'contemplative', 'heritage'],
  };

  // Try subregion-specific tags first, then parent region
  const affinityTags = regionTagAffinity[regionCode] ?? regionTagAffinity[parentRegion] ?? [];

  // Score each preset by how many affinity tags it matches
  const scored = Object.values(IMAGINATION_PRESETS).map(preset => {
    const tagScore = preset.tags.reduce((sum, tag) =>
      sum + (affinityTags.includes(tag) ? 2 : 0), 0);
    // Cultural style presets for matching regions get a big boost
    const culturalBoost = preset.category === 'cultural_style' && tagScore > 0 ? 5 : 0;
    return { preset, score: tagScore + culturalBoost };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.preset);
}

/**
 * Recommend imagination presets factoring in region + category + format.
 * Category affinity re-ranks region-based results so presets matching
 * the user's content domain (healthcare, education, etc.) float to top.
 */
export function recommendPresetsForContext(
  regionCode: string,
  categoryName?: string,
  _formatName?: string,
  limit: number = 4,
): ImaginationPreset[] {
  // Get region-based recommendations (wider pool to re-rank from)
  const regionRecs = recommendPresetsForRegion(regionCode, limit * 2);

  if (!categoryName) return regionRecs.slice(0, limit);

  // Category → preset IDs that work well for that domain
  const CATEGORY_PRESET_AFFINITIES: Record<string, string[]> = {
    healthcare:     ['clinical-precision', 'documentary', 'clean-modern', 'pixel-wonder'],
    education:      ['pixel-wonder', 'puppet-educational', 'storybook-adventure', 'crayon-world'],
    technology:     ['neon-tech-noir', 'pixel-wonder', 'blueprint-technical', 'vaporwave-aesthetic'],
    entertainment:  ['cinematic-blockbuster', 'neon-tech-noir', 'retro-vhs', 'anime-cel'],
    celebrations:   ['golden-glow-festival', 'rangoli-festival', 'ukiyo-e-woodblock', 'kente-celebration'],
    finance:        ['blueprint-technical', 'clean-modern', 'documentary', 'corporate-authority'],
    travel:         ['watercolor-dreamscape', 'golden-hour-landscape', 'underwater-adventure', 'aerial-epic'],
    retail:         ['pop-commercial', 'neon-tech-noir', 'retro-vhs', 'social-native'],
    government:     ['documentary', 'blueprint-technical', 'clean-modern', 'patriotic-civic'],
    manufacturing:  ['blueprint-technical', 'documentary', 'industrial-grit', 'aerial-epic'],
    agriculture:    ['watercolor-dreamscape', 'golden-hour-landscape', 'documentary', 'earthy-natural'],
    real_estate:    ['golden-hour-landscape', 'blueprint-technical', 'aerial-epic', 'clean-modern'],
    pharma_biotech: ['clinical-precision', 'documentary', 'blueprint-technical', 'clean-modern'],
  };

  const affinities = CATEGORY_PRESET_AFFINITIES[categoryName] || [];
  const affinitySet = new Set(affinities);

  // Sort: category-matching first, then region-matching
  return regionRecs
    .sort((a, b) => {
      const aMatch = affinitySet.has(a.id) ? 1 : 0;
      const bMatch = affinitySet.has(b.id) ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
}
