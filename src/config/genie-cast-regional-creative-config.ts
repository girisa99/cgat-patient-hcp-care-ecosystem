/**
 * GENIE CAST — REGIONAL CREATIVE INTELLIGENCE CONFIG
 * 
 * Maps ALL regions/subregions from regionHierarchy.ts to culturally-aware creative parameters:
 * - Character design prompts (Pixar/Disney adaptations)
 * - Music & sound design (genre, instruments, mood)
 * - Visual storytelling style (color palette, lighting, environment)
 * - Emotional tone & narrative pacing
 * - Cultural symbols & metaphors
 * 
 * Used by: prompt enrichment across Genie Cast, Vibe, Deck, Spark
 * Aligned 1:1 with regionHierarchy.ts (16 parent regions, 62 subregions)
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
    wardrobeModifiers: string[];
    culturalCompanions: string[];
    expressionStyle: string;
    colorInfluence: string[];
  };
  /** Music & audio direction */
  music: {
    genres: string[];
    instruments: string[];
    mood: string[];
    bpmRange: [number, number];
    samplePrompt: string;
  };
  /** Visual storytelling style */
  visuals: {
    paletteKeywords: string[];
    lighting: string;
    environmentModifiers: string[];
    motifs: string[];
    animationEnergy: 'contemplative' | 'balanced' | 'vibrant' | 'explosive';
  };
  /** Narrative & emotional tone */
  narrative: {
    storytellingStyle: string;
    pacing: 'slow-deliberate' | 'measured' | 'dynamic' | 'rapid-fire';
    emotionalArc: string[];
    coreValues: string[];
    humorStyle: string;
  };
}

// ─── REGIONAL CREATIVE PROFILES ──────────────────────────────────────────────
// Ordered to match regionHierarchy.ts: NAM → EU → EURASIA → TURKEY → MENA →
// AFRICA → INDIA → PAKISTAN → BANGLADESH → SOUTH_ASIA → SEA → CJK → LATAM →
// CARIBBEAN → OCEANIA → CENTRAL_ASIA

export const REGIONAL_CREATIVE_PROFILES: RegionalCreativeProfile[] = [

  // ═══════════════════════════════════════════════════════════════
  // 1. NORTH AMERICA (NAM)
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'NAM',
    regionName: 'North America',
    subRegions: [
      {
        id: 'NAM_US',
        name: 'United States',
        creative: {
          characters: {
            wardrobeModifiers: ['Silicon Valley casual-cool', 'startup hoodie meets Pixar character design', 'sneaker-culture accents'],
            culturalCompanions: ['a raccoon with a tiny laptop and coffee cup', 'a golden retriever wearing a scrum board collar', 'a bald eagle drone hovering overhead'],
            expressionStyle: 'Direct, energetic TED-talk gestures — confidence with relatability',
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
      {
        id: 'NAM_CA',
        name: 'Canada',
        creative: {
          characters: {
            wardrobeModifiers: ['plaid-tech flannel layers', 'maple leaf circuit-board pins', 'warm winter-tech parkas'],
            culturalCompanions: ['a beaver building data dams from code blocks', 'a moose with antler-mounted displays', 'a friendly goose holding a hockey stick stylus'],
            expressionStyle: 'Warm, polite, inclusive — apologetic humor meets quiet confidence',
            colorInfluence: ['maple red', 'pine green', 'snow white', 'lake blue'],
          },
          music: {
            genres: ['indie folk-electronic', 'ambient post-rock', 'French-Canadian chanson modern'],
            instruments: ['acoustic guitar', 'fiddle', 'synth pads', 'piano', 'harmonica'],
            mood: ['welcoming', 'sincere', 'nature-inspired', 'gently optimistic'],
            bpmRange: [85, 120],
            samplePrompt: 'Indie folk-electronic with acoustic guitar and warm synth pads, Canadian sincerity, nature-inspired ambient textures, gently optimistic, bilingual EN/FR vibe',
          },
          visuals: {
            paletteKeywords: ['maple red', 'pine forest green', 'snow white', 'northern lake blue'],
            lighting: 'Clear northern light with warm cabin glow undertones',
            environmentModifiers: ['mountain lodge tech hubs', 'northern lights backdrops', 'lakeside co-working spaces'],
            motifs: ['maple leaf fractals', 'pine tree silhouettes', 'aurora wave patterns', 'canoe hull curves'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Inclusive narrative — multicultural mosaic, polite tenacity',
            pacing: 'measured',
            emotionalArc: ['thoughtful start', 'collaborative build', 'humble celebration'],
            coreValues: ['inclusivity', 'multiculturalism', 'sustainability', 'politeness'],
            humorStyle: 'Self-effacing, pun-driven, "sorry, not sorry" Canadian wit',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['casual-cool tech wear', 'startup culture accents', 'sneaker and hoodie base'],
        culturalCompanions: ['a raccoon with a laptop', 'a golden retriever helper', 'an eagle drone'],
        expressionStyle: 'Direct, energetic, TED-talk hands',
        colorInfluence: ['tech blue', 'startup green', 'warm orange', 'white'],
      },
      music: {
        genres: ['indie electronic', 'lo-fi hip-hop', 'cinematic'],
        instruments: ['synth', 'guitar', 'finger snaps', 'piano'],
        mood: ['optimistic', 'innovative', 'authentic'],
        bpmRange: [100, 130],
        samplePrompt: 'Upbeat indie electronic with lo-fi warmth, optimistic energy, cinematic American-Canadian quality',
      },
      visuals: {
        paletteKeywords: ['tech blue', 'green', 'white', 'orange'],
        lighting: 'Golden hour with modern LED accents',
        environmentModifiers: ['modern offices', 'coffee shops', 'nature-tech fusion'],
        motifs: ['progress bars', 'mountain peaks', 'circuit paths'],
        animationEnergy: 'vibrant',
      },
      narrative: {
        storytellingStyle: 'Show-don\'t-tell — demo, data, ship',
        pacing: 'dynamic',
        emotionalArc: ['build', 'iterate', 'celebrate'],
        coreValues: ['innovation', 'authenticity', 'speed'],
        humorStyle: 'Self-deprecating, meme-aware, relatable',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. EUROPE (EU) — 8 sub-zones
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'EU',
    regionName: 'Europe',
    subRegions: [
      {
        id: 'EU_WEST',
        name: 'UK & Ireland',
        creative: {
          characters: {
            wardrobeModifiers: ['tweed-tech blazer hybrid', 'tartan circuit-board patterns', 'Wellington boot-meets-sneaker'],
            culturalCompanions: ['a corgi with a tiny crown and clipboard', 'a red fox in a waistcoat analyzing data', 'a hedgehog wearing reading glasses'],
            expressionStyle: 'Dry wit delivery, eyebrow-driven micro-expressions, understated competence',
            colorInfluence: ['royal blue', 'British racing green', 'burgundy', 'cream'],
          },
          music: {
            genres: ['Britpop electronic', 'Celtic ambient', 'trip-hop cinematic'],
            instruments: ['piano', 'strings', 'bodhran', 'synth bass', 'brass section'],
            mood: ['clever', 'understated power', 'cheeky', 'resilient'],
            bpmRange: [90, 130],
            samplePrompt: 'Sophisticated Britpop-electronic with piano and strings, Celtic ambient undertones, clever and understated, cinematic British quality',
          },
          visuals: {
            paletteKeywords: ['royal blue', 'racing green', 'burgundy', 'cream', 'fog grey'],
            lighting: 'Overcast London light with warm pub-glow accents',
            environmentModifiers: ['Victorian-modern glass architecture', 'red brick tech hubs', 'Georgian terrace innovation labs'],
            motifs: ['heraldic crests reimagined', 'clock gear mechanics', 'underground map networks', 'crown jewel data gems'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'British understatement — the punchline lands three seconds after delivery',
            pacing: 'measured',
            emotionalArc: ['quiet competence', 'wry observation', 'dignified triumph'],
            coreValues: ['wit', 'craftsmanship', 'fair play', 'quiet revolution'],
            humorStyle: 'Bone-dry wit, deadpan, Monty Python DNA',
          },
        },
      },
      {
        id: 'EU_DACH',
        name: 'DACH (Germany, Austria, Switzerland)',
        creative: {
          characters: {
            wardrobeModifiers: ['Bauhaus-minimal tech-wear', 'precision-engineered accessories', 'Alpine functional layers'],
            culturalCompanions: ['a German Shepherd with engineering blueprints', 'a clockwork cuckoo bird optimizing timelines', 'a St. Bernard carrying rescue data packs'],
            expressionStyle: 'Precise, methodical, trustworthy — every gesture has purpose',
            colorInfluence: ['industrial grey', 'Bauhaus red', 'Alpine green', 'engineering blue'],
          },
          music: {
            genres: ['Kraftwerk-inspired electronic', 'neo-classical', 'Alpine ambient', 'Berlin techno minimal'],
            instruments: ['synthesizer', 'piano', 'zither', 'cello', 'modular synth'],
            mood: ['precise', 'innovative', 'deeply engineered', 'quietly powerful'],
            bpmRange: [90, 135],
            samplePrompt: 'Kraftwerk-inspired electronic with precise synths and neo-classical piano, Berlin minimal techno undertones, engineered perfection, quietly powerful',
          },
          visuals: {
            paletteKeywords: ['Bauhaus primary', 'Alpine green', 'industrial grey', 'engineering steel blue'],
            lighting: 'Clean, precise studio lighting with dramatic Alpine shadow contrast',
            environmentModifiers: ['Bauhaus architecture', 'Swiss precision labs', 'Black Forest data centers with wooden beams'],
            motifs: ['gear mechanisms', 'Bauhaus geometry', 'cuckoo clock internals', 'Alpine peak graphs'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Engineering narrative — problem → analysis → elegant solution → proof',
            pacing: 'measured',
            emotionalArc: ['meticulous analysis', 'breakthrough insight', 'perfected execution'],
            coreValues: ['Gründlichkeit (thoroughness)', 'precision', 'reliability', 'sustainability'],
            humorStyle: 'Dry technical humor, precision punchlines, self-aware engineering jokes',
          },
        },
      },
      {
        id: 'EU_FRANCE',
        name: 'France & Francophone',
        creative: {
          characters: {
            wardrobeModifiers: ['haute couture tech-wear', 'beret-inspired smart headset', 'art deco accessory accents'],
            culturalCompanions: ['a French bulldog with a scarf and sketchpad', 'a rooster (le coq) with illuminated tail feathers', 'a cat lounging on a stack of code books'],
            expressionStyle: 'Elegant gesticulation, philosophical eyebrow raises, passionate intellectual debate energy',
            colorInfluence: ['Parisian blue', 'wine burgundy', 'crème', 'art deco gold'],
          },
          music: {
            genres: ['French electronic (Daft Punk DNA)', 'chanson moderne', 'impressionist ambient'],
            instruments: ['accordion', 'piano', 'synthesizer', 'violin', 'clarinet'],
            mood: ['sophisticated', 'romantic intellect', 'avant-garde', 'effortlessly cool'],
            bpmRange: [85, 128],
            samplePrompt: 'French electronic with Daft Punk DNA, accordion and piano textures, impressionist ambient layers, sophisticated and effortlessly cool, cinematic Parisian quality',
          },
          visuals: {
            paletteKeywords: ['Parisian blue', 'wine burgundy', 'crème', 'art deco gold', 'charcoal'],
            lighting: 'Soft Parisian morning light with warm café glow',
            environmentModifiers: ['art deco innovation salons', 'Haussmann-style tech spaces', 'jardins de données (data gardens)'],
            motifs: ['art nouveau curves', 'fleur-de-lis circuits', 'Eiffel lattice patterns', 'impressionist data brushstrokes'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Philosophical narrative — "but why?" asked three times before building',
            pacing: 'measured',
            emotionalArc: ['intellectual curiosity', 'aesthetic refinement', 'revolutionary elegance'],
            coreValues: ['liberté (creative freedom)', 'egalité', 'savoir-faire', 'joie de vivre'],
            humorStyle: 'Ironic, intellectual, absurdist — Molière meets tech',
          },
        },
      },
      {
        id: 'EU_BENELUX',
        name: 'Benelux & Netherlands',
        creative: {
          characters: {
            wardrobeModifiers: ['Dutch Design minimalism', 'Delft blue pattern accents', 'cycling-inspired functional wear'],
            culturalCompanions: ['a wise stork delivering data parcels', 'a rabbit on a tiny bicycle with windmill-powered laptop', 'a Dutch draft horse pulling a server cart'],
            expressionStyle: 'Direct, no-nonsense, pragmatic warmth — say what you mean, then share stroopwafel',
            colorInfluence: ['Delft blue', 'tulip orange', 'canal green', 'windmill white'],
          },
          music: {
            genres: ['Dutch EDM-light', 'ambient electronic', 'modern chamber music'],
            instruments: ['piano', 'carillon bells', 'synth', 'cello', 'organ'],
            mood: ['pragmatic', 'innovative', 'welcoming', 'clean'],
            bpmRange: [90, 130],
            samplePrompt: 'Dutch-inspired ambient electronic with carillon bells and clean synths, pragmatic and innovative, cinematic quality with windmill ambience',
          },
          visuals: {
            paletteKeywords: ['Delft blue', 'tulip orange', 'canal green', 'warm white'],
            lighting: 'Flat Dutch light — clear, democratic, no shadows hide anything',
            environmentModifiers: ['canal-side tech offices', 'windmill-powered server farms', 'Vermeer-lit innovation rooms'],
            motifs: ['Delft tile patterns', 'windmill blade rotations', 'tulip field gradients', 'canal grid layouts'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Pragmatic Dutch — "just do it, then discuss over coffee"',
            pacing: 'measured',
            emotionalArc: ['practical start', 'collaborative build', 'shared success'],
            coreValues: ['gezelligheid (coziness/togetherness)', 'directness', 'tolerance', 'innovation'],
            humorStyle: 'Blunt honesty played for laughs, cycling metaphors, "normal is crazy enough"',
          },
        },
      },
      {
        id: 'EU_IBERIA',
        name: 'Spain & Portugal',
        creative: {
          characters: {
            wardrobeModifiers: ['Mediterranean linen-tech blend', 'Moorish geometric pattern trims', 'azulejo tile-inspired accessories'],
            culturalCompanions: ['a bull with gentle eyes reviewing Gantt charts', 'a Portuguese rooster (Galo de Barcelos) with LED plumage', 'a Iberian lynx wearing smart glasses'],
            expressionStyle: 'Passionate, expressive, full-body communication — flamenco hands meet tech demos',
            colorInfluence: ['terracotta', 'ocean blue', 'olive gold', 'azulejo cobalt'],
          },
          music: {
            genres: ['flamenco-electronic fusion', 'Fado-ambient', 'Mediterranean cinematic'],
            instruments: ['Spanish guitar', 'cajón', 'Portuguese guitar (fado)', 'castanets', 'synth pads'],
            mood: ['passionate', 'nostalgic warmth', 'sun-drenched', 'deeply emotional'],
            bpmRange: [85, 130],
            samplePrompt: 'Flamenco-electronic fusion with Spanish guitar and cajón, Fado-ambient undertones, passionate and sun-drenched, Mediterranean cinematic quality',
          },
          visuals: {
            paletteKeywords: ['terracotta', 'Mediterranean blue', 'olive gold', 'azulejo cobalt'],
            lighting: 'Brilliant Mediterranean sun with warm stone reflections and siesta shadows',
            environmentModifiers: ['Moorish arch tech spaces', 'seaside innovation terraces', 'azulejo-tiled data rooms'],
            motifs: ['azulejo tile geometry', 'flamenco movement curves', 'Moorish star patterns', 'grape vine fractals'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Passion-first — build with your heart, prove with your hands',
            pacing: 'dynamic',
            emotionalArc: ['fiery start', 'deep reflection', 'triumphant celebration'],
            coreValues: ['passion', 'family', 'craftsmanship', 'saudade (beautiful longing)'],
            humorStyle: 'Warm teasing, expressive physical comedy, storytelling punchlines',
          },
        },
      },
      {
        id: 'EU_ITALY',
        name: 'Italy',
        creative: {
          characters: {
            wardrobeModifiers: ['Italian tailoring meets tech-wear', 'Renaissance-inspired color blocking', 'Murano glass accessory accents'],
            culturalCompanions: ['a wolf cub (Romulus legacy) with a design tablet', 'a wise cat navigating Roman columns of data', 'a Vespa-riding pigeon delivering messages'],
            expressionStyle: 'Expressive hand gestures, operatic emotional range, design-obsessed attention to detail',
            colorInfluence: ['Renaissance gold', 'Tuscan terracotta', 'marble white', 'deep olive'],
          },
          music: {
            genres: ['opera-electronic fusion', 'Italian cinematic (Morricone)', 'Mediterranean house'],
            instruments: ['violin', 'mandolin', 'piano', 'opera vocals', 'accordion'],
            mood: ['dramatic beauty', 'artisanal pride', 'la dolce vita', 'romantic innovation'],
            bpmRange: [85, 128],
            samplePrompt: 'Italian cinematic with Morricone-inspired orchestral and modern electronic, mandolin and violin, dramatic beauty, la dolce vita energy, artisanal quality',
          },
          visuals: {
            paletteKeywords: ['Renaissance gold', 'Tuscan terracotta', 'marble white', 'deep olive'],
            lighting: 'Caravaggio chiaroscuro meets warm Tuscan afternoon',
            environmentModifiers: ['Roman column server rooms', 'Renaissance fresco command centers', 'Venetian canal data channels'],
            motifs: ['da Vinci spirals', 'Roman arches', 'Venetian mask interfaces', 'olive branch networks'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Operatic arc — whisper to crescendo, beauty in every act',
            pacing: 'dynamic',
            emotionalArc: ['artistic vision', 'dramatic tension', 'masterpiece reveal'],
            coreValues: ['bellezza (beauty)', 'design excellence', 'family', 'la dolce vita'],
            humorStyle: 'Theatrical, expressive hand-gesture comedy, food metaphors for everything',
          },
        },
      },
      {
        id: 'EU_NORDIC',
        name: 'Nordics',
        creative: {
          characters: {
            wardrobeModifiers: ['clean Scandinavian design wear', 'aurora-inspired gradient accents', 'hygge-cozy tech layers'],
            culturalCompanions: ['a snowy owl with aurora-lit eyes', 'a friendly Nordic fox with constellation fur patterns', 'a reindeer pulling a sleigh of data'],
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
      {
        id: 'EU_EAST',
        name: 'Eastern EU Members',
        creative: {
          characters: {
            wardrobeModifiers: ['folk embroidery tech-accents', 'Soviet-era industrial chic reimagined', 'amber jewelry data nodes'],
            culturalCompanions: ['a white stork carrying circuit boards', 'a wise brown bear with a coding notebook', 'a clever lynx leaping between servers'],
            expressionStyle: 'Resilient warmth, understated determination, dry humor through experience',
            colorInfluence: ['amber gold', 'forest green', 'slate grey', 'folk embroidery red'],
          },
          music: {
            genres: ['Slavic folk-electronic', 'Balkan brass modern', 'Eastern European cinematic'],
            instruments: ['cimbalom', 'accordion', 'violin', 'pan flute', 'synth'],
            mood: ['resilient', 'proud', 'nostalgic optimism', 'determined'],
            bpmRange: [90, 135],
            samplePrompt: 'Eastern European folk-electronic with cimbalom and accordion, Slavic melody over modern beats, resilient and proud, nostalgic optimism, cinematic quality',
          },
          visuals: {
            paletteKeywords: ['amber gold', 'forest green', 'slate grey', 'folk red'],
            lighting: 'Autumn forest light with industrial-warm contrast',
            environmentModifiers: ['folk art data centers', 'castle-tech hybrid offices', 'birch forest workspaces'],
            motifs: ['folk embroidery patterns', 'Slavic geometric art', 'amber crystals', 'castle turret networks'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Resilience narrative — through hardship, innovation born from necessity',
            pacing: 'measured',
            emotionalArc: ['quiet start', 'overcoming obstacles', 'earned triumph'],
            coreValues: ['resilience', 'resourcefulness', 'community', 'education'],
            humorStyle: 'Dark humor as survival tool, ironic observations, self-deprecating strength',
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
  // 3. EURASIA (Eastern Europe & Caucasus)
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'EURASIA',
    regionName: 'Eastern Europe & Caucasus',
    subRegions: [
      {
        id: 'EU_UKRAINE',
        name: 'Ukraine',
        creative: {
          characters: {
            wardrobeModifiers: ['vyshyvanka embroidery tech accents', 'sunflower-gold data pins', 'blue-yellow gradient tech-wear'],
            culturalCompanions: ['a nightingale composing code songs', 'a brave cat standing on a server (inspired by Ukrainian war cats)', 'a sunflower robot that turns toward solutions'],
            expressionStyle: 'Defiant optimism, creative resilience, warm but steely determination',
            colorInfluence: ['sunflower yellow', 'sky blue', 'wheat gold', 'vyshyvanka red'],
          },
          music: {
            genres: ['Ukrainian folk-electronic', 'bandura ambient', 'modern Cossack cinematic'],
            instruments: ['bandura', 'sopilka', 'trembita', 'violin', 'electronic beats'],
            mood: ['defiant hope', 'creative resilience', 'proud', 'emotionally deep'],
            bpmRange: [90, 130],
            samplePrompt: 'Ukrainian folk-electronic with bandura melody, defiant and hopeful, modern production over traditional soul, cinematically powerful',
          },
          visuals: {
            paletteKeywords: ['sunflower yellow', 'sky blue', 'wheat gold', 'embroidery red'],
            lighting: 'Wide steppe golden light with dramatic cloud contrast',
            environmentModifiers: ['sunflower field data farms', 'vyshyvanka-patterned interfaces', 'Carpathian mountain servers'],
            motifs: ['vyshyvanka embroidery', 'sunflower spirals', 'trident code symbols', 'wheat wave patterns'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Resilience epic — from challenge to innovation, defiant creativity',
            pacing: 'dynamic',
            emotionalArc: ['determination', 'creative defiance', 'collective victory'],
            coreValues: ['freedom', 'resilience', 'creativity under pressure', 'solidarity'],
            humorStyle: 'Sharp, resilient humor — laughing in the face of difficulty',
          },
        },
      },
      {
        id: 'EU_BALKANS',
        name: 'Balkans',
        creative: {
          characters: {
            wardrobeModifiers: ['Balkan folk vest tech-layer', 'copper filigree accessories', 'mountain wool-tech blend'],
            culturalCompanions: ['a Balkan lynx with map-projection eyes', 'a dancing bear holding a brass instrument', 'a falcon soaring above data valleys'],
            expressionStyle: 'Passionate, communal, table-pounding enthusiasm mixed with poetic reflection',
            colorInfluence: ['copper', 'mountain green', 'adriatic blue', 'rustic red'],
          },
          music: {
            genres: ['Balkan brass-electronic', 'turbo-folk modern', 'Adriatic ambient'],
            instruments: ['trumpet', 'accordion', 'clarinet', 'tapan drum', 'tamburica'],
            mood: ['celebratory chaos', 'passionate', 'bittersweet', 'communal joy'],
            bpmRange: [100, 160],
            samplePrompt: 'Balkan brass-electronic fusion with trumpet and accordion, celebratory energy, bittersweet undertones, Gypsy-inspired rhythm, cinematic Balkan quality',
          },
          visuals: {
            paletteKeywords: ['copper', 'mountain green', 'Adriatic blue', 'rustic terracotta'],
            lighting: 'Mountain morning light with Mediterranean warmth',
            environmentModifiers: ['Ottoman bridge data crossings', 'Adriatic coast co-working terraces', 'mountain fortress innovation labs'],
            motifs: ['bridge arches', 'copper filigree', 'Ottoman geometric tiles', 'mountain river flow charts'],
            animationEnergy: 'explosive',
          },
          narrative: {
            storytellingStyle: 'Balkan storytelling — humor and tragedy intertwined, always over food',
            pacing: 'dynamic',
            emotionalArc: ['dramatic opening', 'shared struggle', 'feasting celebration'],
            coreValues: ['hospitality', 'resilience', 'community', 'humor as survival'],
            humorStyle: 'Self-deprecating national humor, absurdist, always ends with rakija',
          },
        },
      },
      {
        id: 'EU_CAUCASUS',
        name: 'Caucasus (Georgia, Armenia)',
        creative: {
          characters: {
            wardrobeModifiers: ['Georgian chokha-inspired tech coat', 'Armenian khachkar cross patterns', 'mountain wool with circuit embroidery'],
            culturalCompanions: ['a Georgian eagle surveying data mountains', 'an Armenian pomegranate tree producing fruit-shaped data clusters'],
            expressionStyle: 'Warm, feast-table generosity, mountain-strong conviction',
            colorInfluence: ['pomegranate red', 'mountain stone grey', 'wine deep purple', 'khachkar sand'],
          },
          music: {
            genres: ['Georgian polyphonic-electronic', 'Armenian duduk ambient', 'Caucasian cinematic'],
            instruments: ['duduk', 'panduri', 'dhol drum', 'zurna', 'chonguri'],
            mood: ['ancient wisdom', 'mountain strength', 'warm hospitality', 'soulful depth'],
            bpmRange: [75, 115],
            samplePrompt: 'Armenian duduk over Georgian polyphonic harmonies, electronic ambient textures, ancient wisdom meets modern production, soulful and cinematically powerful',
          },
          visuals: {
            paletteKeywords: ['pomegranate red', 'mountain stone', 'wine purple', 'ancient gold'],
            lighting: 'Mountain sunrise with warm stone glow, monastery light',
            environmentModifiers: ['mountain monastery tech retreats', 'vineyard data terraces', 'ancient stone architecture with holographic overlays'],
            motifs: ['khachkar cross carvings', 'pomegranate seeds as data points', 'mountain peak hierarchies', 'vine scroll patterns'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Ancient-modern bridge — 3000-year wisdom applied to tomorrow\'s problem',
            pacing: 'measured',
            emotionalArc: ['heritage grounding', 'mountain ascent', 'feast of celebration'],
            coreValues: ['hospitality', 'ancient wisdom', 'family bonds', 'perseverance'],
            humorStyle: 'Toast-master humor — every joke is wrapped in a blessing',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['folk-tech fusion wear', 'embroidery accents', 'mountain-inspired layers'],
        culturalCompanions: ['a wise eagle', 'a resilient bear cub'],
        expressionStyle: 'Resilient warmth, passionate determination',
        colorInfluence: ['amber', 'mountain green', 'sky blue', 'folk red'],
      },
      music: {
        genres: ['Eastern European folk-electronic', 'ambient cinematic', 'brass fusion'],
        instruments: ['accordion', 'violin', 'drums', 'synth'],
        mood: ['resilient', 'passionate', 'communal'],
        bpmRange: [90, 130],
        samplePrompt: 'Eastern European folk-electronic fusion, resilient and passionate, cinematic quality',
      },
      visuals: {
        paletteKeywords: ['amber', 'green', 'blue', 'folk red'],
        lighting: 'Mountain light with warm contrast',
        environmentModifiers: ['mountain landscapes', 'historic architecture', 'folk-modern blend'],
        motifs: ['embroidery', 'mountain forms', 'bridge arches'],
        animationEnergy: 'balanced',
      },
      narrative: {
        storytellingStyle: 'Resilience through creativity',
        pacing: 'dynamic',
        emotionalArc: ['challenge', 'innovation', 'celebration'],
        coreValues: ['resilience', 'community', 'hospitality'],
        humorStyle: 'Self-deprecating, warm, story-driven',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. TURKEY
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'TURKEY',
    regionName: 'Turkey',
    subRegions: [],
    defaults: {
      characters: {
        wardrobeModifiers: ['Ottoman-modern tech kaftan', 'İznik tile pattern accents', 'tulip motif data pins'],
        culturalCompanions: ['a Turkish Van cat with heterochromatic hologram eyes', 'a whirling dervish owl spinning through data streams', 'a Kangal shepherd dog guarding server clusters'],
        expressionStyle: 'Warm hospitality energy, dramatic storytelling gestures, çay-sharing camaraderie',
        colorInfluence: ['İznik blue', 'tulip red', 'Ottoman gold', 'Bosphorus teal'],
      },
      music: {
        genres: ['Turkish psychedelic rock revival', 'Ottoman classical-electronic', 'Anatolian ambient'],
        instruments: ['saz/bağlama', 'ney flute', 'kanun', 'darbuka', 'kemençe'],
        mood: ['bridge between worlds', 'warm intensity', 'mystical depth', 'bazaar energy'],
        bpmRange: [85, 130],
        samplePrompt: 'Turkish psychedelic rock with bağlama and ney over electronic beats, Ottoman classical undertones, warm intensity, bridge between East and West, cinematic Anatolian quality',
      },
      visuals: {
        paletteKeywords: ['İznik blue', 'tulip red', 'Ottoman gold', 'Bosphorus teal'],
        lighting: 'Bosphorus sunset glow with mosque silhouette backlighting',
        environmentModifiers: ['Grand Bazaar data marketplace', 'Ottoman archway server rooms', 'Cappadocia cave innovation labs'],
        motifs: ['İznik tile patterns', 'tulip fractals', 'Ottoman tughra calligraphy', 'whirling dervish spirals'],
        animationEnergy: 'vibrant',
      },
      narrative: {
        storytellingStyle: 'Bridge narrative — connecting continents, ideas, traditions',
        pacing: 'dynamic',
        emotionalArc: ['invitation', 'shared discovery', 'bridge-building triumph'],
        coreValues: ['hospitality (misafirperverlik)', 'bridge between civilizations', 'entrepreneurial spirit'],
        humorStyle: 'Warm, self-aware, bazaar-haggling wit, çay-break timing',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. MENA — 6 sub-zones
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'MENA',
    regionName: 'Middle East & North Africa',
    subRegions: [
      {
        id: 'MENA_GULF',
        name: 'Gulf States',
        creative: {
          characters: {
            wardrobeModifiers: ['flowing robe-inspired tech wear', 'geometric Islamic art patterns', 'pearl and gold accents'],
            culturalCompanions: ['a falcon with holographic wing displays', 'an Arabian horse with glowing mane data streams', 'an oryx with compass-horn navigation'],
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
        id: 'MENA_EGYPT',
        name: 'Egypt',
        creative: {
          characters: {
            wardrobeModifiers: ['pharaonic collar tech-accessories', 'Nile-blue gradient fabrics', 'hieroglyphic circuit patterns'],
            culturalCompanions: ['a Sphinx cat with riddle-solving AI', 'an ibis bird (Thoth) writing code with its beak', 'a scarab beetle rolling data spheres'],
            expressionStyle: 'Egyptian colloquial warmth, theatrical comedy timing, street-smart wit',
            colorInfluence: ['Nile blue', 'papyrus gold', 'desert sand', 'pharaonic turquoise'],
          },
          music: {
            genres: ['Egyptian pop-electronic (shaabi)', 'orchestral cinematic', 'Nile ambient'],
            instruments: ['oud', 'tabla', 'ney', 'mizmar', 'rababa'],
            mood: ['theatrical', 'street-smart', 'celebratory', 'ancient wonder'],
            bpmRange: [95, 140],
            samplePrompt: 'Egyptian shaabi-electronic with oud and mizmar, theatrical energy, street-smart groove, ancient wonder meets modern Cairo, cinematic quality',
          },
          visuals: {
            paletteKeywords: ['Nile blue', 'papyrus gold', 'desert sand', 'pharaonic turquoise'],
            lighting: 'Nile sunset with pyramid shadow drama',
            environmentModifiers: ['pyramid-shaped data centers', 'Nile river data streams', 'Cairo rooftop tech labs'],
            motifs: ['hieroglyphic code', 'Eye of Horus interfaces', 'scarab computing', 'papyrus scroll UIs'],
            animationEnergy: 'explosive',
          },
          narrative: {
            storytellingStyle: 'Egyptian theatrical — comedy and drama in one breath, street-smart wisdom',
            pacing: 'rapid-fire',
            emotionalArc: ['comedic setup', 'dramatic twist', 'triumphant punchline'],
            coreValues: ['humor as philosophy', 'resourcefulness', 'family', 'ancient pride'],
            humorStyle: 'Sharp Egyptian comedy — fastest wit in the Arab world, physical comedy',
          },
        },
      },
      {
        id: 'MENA_LEVANT',
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
      {
        id: 'MENA_MAGHREB',
        name: 'Maghreb (Morocco, Algeria, Tunisia)',
        creative: {
          characters: {
            wardrobeModifiers: ['Berber-geometric tech patterns', 'zellige mosaic accents', 'djellaba-inspired flowing tech coat'],
            culturalCompanions: ['a Barbary macaque with a mosaic-tile tablet', 'a camel carrying server saddle-bags through data deserts', 'a gecko with color-changing camouflage displays'],
            expressionStyle: 'French-Arabic code-switching fluency, Mediterranean warmth with Saharan depth',
            colorInfluence: ['zellige blue', 'Saharan orange', 'Berber red', 'mint green'],
          },
          music: {
            genres: ['Rai-electronic', 'Gnawa trance-tech', 'Maghreb cinematic'],
            instruments: ['guembri', 'bendir', 'oud', 'accordion', 'krakeb (metal castanets)'],
            mood: ['trance-like focus', 'warm', 'cross-cultural', 'meditative groove'],
            bpmRange: [90, 135],
            samplePrompt: 'Rai-electronic with guembri bass and Gnawa rhythm, Saharan ambient textures, trance-like focus, French-Arabic fusion, cinematically warm',
          },
          visuals: {
            paletteKeywords: ['zellige blue', 'Saharan orange', 'Berber red', 'mint green'],
            lighting: 'Medina lantern glow with Saharan sunset warmth',
            environmentModifiers: ['riad courtyard tech gardens', 'zellige-tiled data rooms', 'Saharan oasis innovation camps'],
            motifs: ['zellige tile geometry', 'Berber tribal symbols', 'desert star navigation', 'medina maze layouts'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Crossroads narrative — where Africa, Europe, and Arabia blend',
            pacing: 'measured',
            emotionalArc: ['cultural layering', 'creative blending', 'harmonious innovation'],
            coreValues: ['hospitality', 'cultural fusion', 'resilience', 'artisanal craft'],
            humorStyle: 'Bilingual wordplay, warm sarcasm, "the souk of ideas" metaphors',
          },
        },
      },
      {
        id: 'MENA_MSA',
        name: 'Pan-Arab (MSA)',
        creative: {
          characters: {
            wardrobeModifiers: ['classical Arab scholarly robes with tech trim', 'calligraphy-inspired patterns', 'inkwell data ports'],
            culturalCompanions: ['a wise phoenix (Anka) rising from data ashes', 'an Arabian leopard reviewing manuscripts'],
            expressionStyle: 'Formal eloquence, poetic precision, scholarly authority',
            colorInfluence: ['ink black', 'parchment gold', 'scholarly green', 'deep navy'],
          },
          music: {
            genres: ['Classical Arabic maqam', 'orchestral news-style', 'Pan-Arab cinematic'],
            instruments: ['oud', 'qanun', 'ney', 'full orchestra', 'choir'],
            mood: ['authoritative', 'timeless', 'formally beautiful', 'intellectual'],
            bpmRange: [70, 100],
            samplePrompt: 'Classical Arabic maqam with oud and qanun, full orchestral arrangement, authoritative and timeless, Pan-Arab cinematic quality, intellectually refined',
          },
          visuals: {
            paletteKeywords: ['ink black', 'parchment gold', 'scholarly green', 'deep navy'],
            lighting: 'Library lantern warmth with scholarly shadow depth',
            environmentModifiers: ['Islamic library archives', 'calligraphy-wall command centers', 'House of Wisdom reimagined as tech hub'],
            motifs: ['Arabic calligraphy', 'scroll unfurling animations', 'geometric stars', 'astrolabe navigation'],
            animationEnergy: 'contemplative',
          },
          narrative: {
            storytellingStyle: 'Scholarly authority — the golden age of knowledge, continued',
            pacing: 'slow-deliberate',
            emotionalArc: ['intellectual foundation', 'knowledge building', 'wisdom revelation'],
            coreValues: ['knowledge', 'eloquence', 'unity', 'scholarly tradition'],
            humorStyle: 'Elegant wordplay, poetic wit, proverb-based wisdom humor',
          },
        },
      },
      {
        id: 'MENA_ISRAEL',
        name: 'Israel',
        creative: {
          characters: {
            wardrobeModifiers: ['kibbutz-casual tech wear', 'startup nation hoodie', 'Mediterranean-modern minimal'],
            culturalCompanions: ['a hoopoe bird (national bird) with startup pitch deck', 'a cyber-chameleon adapting to every tech stack'],
            expressionStyle: 'Direct chutzpah energy, rapid-fire innovation pitch, no hierarchy gestures',
            colorInfluence: ['Mediterranean blue', 'desert sand', 'startup white', 'tech green'],
          },
          music: {
            genres: ['Israeli electronic (Infected Mushroom DNA)', 'Mediterranean folk-fusion', 'startup ambient'],
            instruments: ['synth', 'darbuka', 'guitar', 'electronic beats', 'violin'],
            mood: ['innovative urgency', 'Mediterranean warmth', 'chutzpah confidence', 'desert-tech'],
            bpmRange: [100, 145],
            samplePrompt: 'Israeli psytrance-influenced electronic with Mediterranean folk undertones, innovative urgency, chutzpah confidence, desert-tech atmosphere, cinematic startup energy',
          },
          visuals: {
            paletteKeywords: ['Mediterranean blue', 'desert sand', 'startup white', 'innovation green'],
            lighting: 'Tel Aviv golden hour with Negev desert contrast',
            environmentModifiers: ['Bauhaus Tel Aviv tech offices', 'desert innovation labs', 'Mediterranean rooftop hackathons'],
            motifs: ['circuit board maps', 'desert bloom patterns', 'startup rocket trajectories', 'Mediterranean wave data'],
            animationEnergy: 'explosive',
          },
          narrative: {
            storytellingStyle: 'Startup nation — fail fast, pivot faster, ship yesterday',
            pacing: 'rapid-fire',
            emotionalArc: ['audacious idea', 'rapid iteration', 'disruptive launch'],
            coreValues: ['chutzpah', 'innovation', 'directness', 'resourcefulness'],
            humorStyle: 'Direct, self-deprecating, military-service inside jokes turned tech metaphors',
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
  // 6. AFRICA — 4 sub-zones
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'AFRICA',
    regionName: 'Africa',
    subRegions: [
      {
        id: 'AFRICA_WEST',
        name: 'West Africa',
        creative: {
          characters: {
            wardrobeModifiers: ['Ankara print tech-wear', 'Kente cloth geometric accents', 'Adinkra symbol badges'],
            culturalCompanions: ['a wise tortoise telling stories (Anansi tradition)', 'a crowned crane with data-quill feathers', 'a chameleon shifting between code languages'],
            expressionStyle: 'Storyteller warmth — full expression, community-facing, call-and-response energy',
            colorInfluence: ['Ankara gold', 'forest green', 'burnt sienna', 'indigo'],
          },
          music: {
            genres: ['Afrobeats', 'highlife modern', 'Afro-futurist electronic'],
            instruments: ['talking drum', 'shekere', 'balafon', 'kora', 'thumb piano'],
            mood: ['joyful', 'communal', 'rhythmic confidence', 'celebratory'],
            bpmRange: [105, 140],
            samplePrompt: 'Modern Afrobeats with talking drum and kora, highlife guitar licks, Afro-futurist electronic production, joyful communal energy, cinematic quality',
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
      {
        id: 'AFRICA_EAST',
        name: 'East Africa',
        creative: {
          characters: {
            wardrobeModifiers: ['Maasai-inspired beadwork tech accessories', 'kitenge print layers', 'sisal weave accents'],
            culturalCompanions: ['a giraffe with a periscope-neck scanning horizons', 'a Maasai lion cub with a braided data mane', 'a flamingo flock forming data visualizations'],
            expressionStyle: 'Warm, community-gathering energy, marathon-runner determination',
            colorInfluence: ['Maasai red', 'savanna gold', 'Kilimanjaro blue', 'earth brown'],
          },
          music: {
            genres: ['Bongo Flava', 'taarab-electronic', 'East African cinematic'],
            instruments: ['nyatiti', 'kayamba', 'ngoma drums', 'zeze fiddle', 'guitar'],
            mood: ['sunrise optimism', 'endurance', 'communal warmth', 'safari grandeur'],
            bpmRange: [95, 135],
            samplePrompt: 'Bongo Flava with nyatiti and ngoma drums, taarab-electronic undertones, sunrise optimism, savanna grandeur, East African cinematic quality',
          },
          visuals: {
            paletteKeywords: ['Maasai red', 'savanna gold', 'Kilimanjaro blue', 'earth brown'],
            lighting: 'Savanna sunrise with Kilimanjaro silhouette backlight',
            environmentModifiers: ['savanna tech camps', 'Great Rift Valley data channels', 'Maasai village innovation circles'],
            motifs: ['Maasai bead patterns', 'acacia tree networks', 'animal migration flow charts', 'Swahili script data'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Marathon narrative — steady pace, long-distance vision, finish strong',
            pacing: 'dynamic',
            emotionalArc: ['dawn determination', 'community strength', 'summit celebration'],
            coreValues: ['harambee (pulling together)', 'endurance', 'community', 'nature harmony'],
            humorStyle: 'Warm communal humor, nature metaphors, patient wisdom jokes',
          },
        },
      },
      {
        id: 'AFRICA_SOUTH',
        name: 'Southern Africa',
        creative: {
          characters: {
            wardrobeModifiers: ['shweshwe print tech accents', 'beadwork data jewelry', 'madiba shirt-inspired tech wear'],
            culturalCompanions: ['a wise elephant matriarch leading the team', 'a pangolin with armor-plated firewall scales', 'a springbok leaping over data hurdles'],
            expressionStyle: 'Rainbow nation warmth — multilingual expressiveness, ubuntu spirit gestures',
            colorInfluence: ['rainbow nation colors', 'shweshwe indigo', 'gold reef', 'bushveld green'],
          },
          music: {
            genres: ['Amapiano', 'Afro-house', 'South African jazz-electronic'],
            instruments: ['log drums', 'uhadi bow', 'synth bass', 'electronic pads', 'choir'],
            mood: ['groovy confidence', 'rainbow unity', 'celebratory', 'deeply soulful'],
            bpmRange: [110, 140],
            samplePrompt: 'Amapiano groove with log drums and deep synth bass, South African jazz undertones, rainbow nation celebration, groovy and soulful, cinematic quality',
          },
          visuals: {
            paletteKeywords: ['rainbow nation spectrum', 'shweshwe indigo', 'gold reef', 'bushveld green'],
            lighting: 'Table Mountain sunset with urban Johannesburg neon',
            environmentModifiers: ['Bo-Kaap colorful tech houses', 'Johannesburg skyline innovation', 'safari lodge data retreats'],
            motifs: ['Ndebele geometric murals', 'diamond-cut data crystals', 'springbok leap arcs', 'Table Mountain profiles'],
            animationEnergy: 'explosive',
          },
          narrative: {
            storytellingStyle: 'Rainbow nation — diversity as superpower, ubuntu as operating system',
            pacing: 'dynamic',
            emotionalArc: ['unity in diversity', 'overcoming with groove', 'Amapiano celebration'],
            coreValues: ['ubuntu', 'rainbow diversity', 'reconciliation', 'innovation'],
            humorStyle: 'Multilingual humor, township wit, Trevor Noah DNA',
          },
        },
      },
      {
        id: 'AFRICA_FRANCO',
        name: 'Francophone Africa',
        creative: {
          characters: {
            wardrobeModifiers: ['boubou-inspired flowing tech robes', 'wax print vibrant patterns', 'Sahelian leather craft accents'],
            culturalCompanions: ['a griot parrot reciting code poetry', 'a baobab spirit sharing wisdom', 'a Senegalese fishing eagle diving for data'],
            expressionStyle: 'Francophone eloquence meets African warmth — poetic, philosophical, rhythmic',
            colorInfluence: ['wax print gold', 'Sahel sand', 'river blue', 'baobab bark brown'],
          },
          music: {
            genres: ['Mbalax-electronic', 'Congolese rumba modern', 'Sahel desert blues'],
            instruments: ['sabar drums', 'kora', 'likembe', 'guitar', 'ngoni'],
            mood: ['eloquent', 'communal', 'deeply rhythmic', 'philosophically joyful'],
            bpmRange: [100, 140],
            samplePrompt: 'Mbalax-electronic with sabar drums and kora, Congolese rumba undertones, eloquent and communal, Sahel desert blues atmosphere, cinematic Francophone Africa quality',
          },
          visuals: {
            paletteKeywords: ['wax print gold', 'Sahel sand', 'river blue', 'baobab brown'],
            lighting: 'Sahel golden light with river reflection shimmer',
            environmentModifiers: ['Dakar rooftop innovation labs', 'baobab meeting circles', 'Congo river data barges'],
            motifs: ['Timbuktu manuscript pages', 'fishing net data webs', 'wax print geometry', 'mask-interface designs'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Griot-philosopher — wisdom wrapped in rhythm, knowledge as community gift',
            pacing: 'dynamic',
            emotionalArc: ['ancestral knowledge', 'creative innovation', 'collective celebration'],
            coreValues: ['teranga (hospitality)', 'community wisdom', 'artistic excellence', 'bilingual fluency'],
            humorStyle: 'Philosophical humor, rhythm-based comedy, proverb subversion',
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

  // ═══════════════════════════════════════════════════════════════
  // 7. INDIA — 5 sub-zones
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'INDIA',
    regionName: 'India',
    subRegions: [
      {
        id: 'INDIA_NORTH',
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
        id: 'INDIA_SOUTH',
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
      {
        id: 'INDIA_WEST',
        name: 'West India (Maharashtra, Gujarat)',
        creative: {
          characters: {
            wardrobeModifiers: ['bandhani tie-dye tech patterns', 'Warli art circuit accents', 'Kolhapuri-style tech sandals'],
            culturalCompanions: ['a Gir lion cub managing project boards', 'a Warli art stick-figure AI assistant'],
            expressionStyle: 'Business-savvy warmth, Gujarati entrepreneurial energy, Maharashtrian determination',
            colorInfluence: ['bandhani red', 'Rajasthani blue', 'turmeric yellow', 'cotton white'],
          },
          music: {
            genres: ['Garba-electronic', 'Lavani modern', 'Bollywood business'],
            instruments: ['dhol', 'harmonium', 'dholki', 'tabla', 'synth'],
            mood: ['entrepreneurial', 'festive', 'determined', 'community-driven'],
            bpmRange: [110, 145],
            samplePrompt: 'Garba-electronic fusion with dhol and harmonium, festive business energy, entrepreneurial spirit, Bollywood production quality, community celebration',
          },
          visuals: {
            paletteKeywords: ['bandhani red', 'Rajasthani blue', 'turmeric yellow', 'cotton white'],
            lighting: 'Festival light with warm dandiya sparkle',
            environmentModifiers: ['Warli art data walls', 'textile mill innovation hubs', 'Bollywood studio tech spaces'],
            motifs: ['Warli tribal art', 'bandhani dot patterns', 'dandiya stick rhythms', 'cotton boll data clusters'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Entrepreneurial journey — start small, think big, deliver with community',
            pacing: 'dynamic',
            emotionalArc: ['business vision', 'community rally', 'festive achievement'],
            coreValues: ['entrepreneurship', 'community', 'festival spirit', 'determination'],
            humorStyle: 'Business metaphor humor, Gujarati trading jokes, festive energy',
          },
        },
      },
      {
        id: 'INDIA_EAST',
        name: 'East India (Bengal, Odisha)',
        creative: {
          characters: {
            wardrobeModifiers: ['terracotta-toned handloom tech-wear', 'Pattachitra scroll-art accents', 'Durga puja-inspired dramatic elements'],
            culturalCompanions: ['a Royal Bengal tiger with a poetry notebook', 'a Pattachitra owl illustrating data stories'],
            expressionStyle: 'Intellectual-artistic, Rabindranath Tagore poeticism, gentle but profound',
            colorInfluence: ['terracotta', 'mustard yellow', 'river blue', 'vermillion'],
          },
          music: {
            genres: ['Rabindra sangeet-electronic', 'Baul folk fusion', 'Bengali cinematic'],
            instruments: ['sitar', 'esraj', 'dotara', 'flute', 'tabla'],
            mood: ['poetic', 'intellectually warm', 'culturally rich', 'deeply emotional'],
            bpmRange: [80, 120],
            samplePrompt: 'Rabindra sangeet-electronic with esraj and dotara, Baul folk undertones, poetic and intellectually warm, Bengali cinematic quality, deeply emotional',
          },
          visuals: {
            paletteKeywords: ['terracotta', 'mustard yellow', 'river blue', 'vermillion'],
            lighting: 'Monsoon-filtered light with Durga puja pandal glow',
            environmentModifiers: ['Shantiniketan open-air studios', 'terracotta temple data halls', 'river bank innovation spaces'],
            motifs: ['Pattachitra scroll art', 'Durga iconography reimagined', 'river flow patterns', 'terracotta relief data'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Poetic intellectual — art and science as one, Tagore meets tech',
            pacing: 'measured',
            emotionalArc: ['artistic inquiry', 'philosophical depth', 'cultural celebration'],
            coreValues: ['intellectual pursuit', 'artistic expression', 'cultural pride', 'community'],
            humorStyle: 'Intellectual humor, literary references, gentle Bengali irony',
          },
        },
      },
      {
        id: 'INDIA_PAN',
        name: 'Pan-India (English)',
        creative: {
          characters: {
            wardrobeModifiers: ['modern Indian startup casual', 'fusion traditional-contemporary', 'tricolor subtle accents'],
            culturalCompanions: ['a peacock with holographic tail data display', 'a monkey (Hanuman-inspired) debugging code'],
            expressionStyle: 'Hinglish-fluent, cosmopolitan warmth, IIT-confident delivery',
            colorInfluence: ['saffron', 'white', 'green', 'tech blue'],
          },
          music: {
            genres: ['Bollywood-electronic fusion', 'Indian indie pop', 'AR Rahman cinematic'],
            instruments: ['tabla', 'synth', 'flute', 'guitar', 'strings'],
            mood: ['aspirational', 'modern', 'unifying', 'Bollywood upbeat'],
            bpmRange: [100, 135],
            samplePrompt: 'AR Rahman-inspired cinematic with tabla and modern synths, Bollywood-electronic fusion, aspirational and unifying, Pan-Indian identity, polished production',
          },
          visuals: {
            paletteKeywords: ['saffron', 'white', 'green', 'tech blue'],
            lighting: 'Modern Indian office light with festival warmth undertones',
            environmentModifiers: ['Bangalore tech parks', 'co-working spaces with rangoli', 'modern India skylines'],
            motifs: ['lotus-circuit fusion', 'mandala data viz', 'tricolor gradient', 'startup rocket arcs'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Startup India — jugaad innovation meeting global ambition',
            pacing: 'dynamic',
            emotionalArc: ['ambition', 'hustle', 'global-local triumph'],
            coreValues: ['innovation', 'unity in diversity', 'global ambition'],
            humorStyle: 'Hinglish code-switching humor, IIT-inside-jokes, Bollywood references',
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
  // 8. PAKISTAN
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'PAKISTAN',
    regionName: 'Pakistan',
    subRegions: [],
    defaults: {
      characters: {
        wardrobeModifiers: ['shalwar kameez tech-fusion', 'truck art vibrant patterns', 'Mughal miniature accents'],
        culturalCompanions: ['a markhor (national animal) with spiraling data horns', 'a truck art parrot in full neon plumage', 'a snow leopard from the Karakoram surveying dashboards'],
        expressionStyle: 'Warm hospitality, poetic Urdu eloquence, cricket-commentary enthusiasm',
        colorInfluence: ['emerald green', 'truck art multicolor', 'Mughal gold', 'white'],
      },
      music: {
        genres: ['Qawwali-electronic fusion', 'Coke Studio Pakistan', 'Sufi ambient'],
        instruments: ['harmonium', 'tabla', 'sitar', 'rubab', 'chimta'],
        mood: ['devotional intensity', 'poetic', 'passionate', 'soaring'],
        bpmRange: [85, 130],
        samplePrompt: 'Qawwali-electronic fusion with harmonium and tabla, Coke Studio production quality, devotional intensity meeting modern beats, poetic and soaring, Pakistani cinematic',
      },
      visuals: {
        paletteKeywords: ['emerald green', 'truck art neon', 'Mughal gold', 'marble white'],
        lighting: 'Badshahi Mosque sunset with truck art neon glow',
        environmentModifiers: ['truck art data centers', 'Mughal garden tech spaces', 'Karakoram mountain innovation retreats'],
        motifs: ['truck art florals', 'Mughal miniature UI elements', 'cricket field data layouts', 'Islamic geometry'],
        animationEnergy: 'vibrant',
      },
      narrative: {
        storytellingStyle: 'Poetic passion — Urdu shayari wisdom applied to modern challenges',
        pacing: 'dynamic',
        emotionalArc: ['poetic opening', 'passionate build', 'triumphant sixer'],
        coreValues: ['hospitality (mehmaan nawazi)', 'resilience', 'poetic tradition', 'cricket unity'],
        humorStyle: 'Cricket metaphors, Urdu wordplay, warm teasing between provinces',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 9. BANGLADESH
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'BANGLADESH',
    regionName: 'Bangladesh',
    subRegions: [],
    defaults: {
      characters: {
        wardrobeModifiers: ['muslin-inspired light tech-wear', 'nakshi kantha embroidery accents', 'jamdani weave patterns'],
        culturalCompanions: ['a Royal Bengal tiger cub with a dev notebook', 'a kingfisher (doel) delivering code messages', 'a hilsa fish swimming through data streams'],
        expressionStyle: 'Gentle warmth, literary depth, monsoon-resilient determination',
        colorInfluence: ['river blue', 'rice paddy green', 'monsoon grey', 'terracotta'],
      },
      music: {
        genres: ['Baul-electronic fusion', 'Bengali modern folk', 'Dhaka urban ambient'],
        instruments: ['dotara', 'ektara', 'dhol', 'flute', 'harmonium'],
        mood: ['monsoon depth', 'gentle strength', 'poetic', 'river-flow rhythm'],
        bpmRange: [80, 120],
        samplePrompt: 'Baul-electronic fusion with ektara and dotara, monsoon ambient textures, gentle strength and poetic depth, Bengali river-flow rhythm, cinematic quality',
      },
      visuals: {
        paletteKeywords: ['river blue', 'rice green', 'monsoon grey', 'terracotta'],
        lighting: 'Monsoon sky drama with river reflection shimmer',
        environmentModifiers: ['river delta data networks', 'muslin factory innovation labs', 'rickshaw-art decorated tech hubs'],
        motifs: ['nakshi kantha stitch patterns', 'river delta branching', 'boat hull curves', 'lotus pond layouts'],
        animationEnergy: 'balanced',
      },
      narrative: {
        storytellingStyle: 'River narrative — flowing, adaptive, finding the path through',
        pacing: 'measured',
        emotionalArc: ['gentle determination', 'adaptive innovation', 'collective flow'],
        coreValues: ['resilience', 'literary tradition', 'community', 'adaptability'],
        humorStyle: 'Gentle Bengali humor, literary wit, self-aware understatement',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 10. SOUTH ASIA (Nepal, Sri Lanka, Bhutan, Maldives)
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'SOUTH_ASIA',
    regionName: 'South Asia',
    subRegions: [
      {
        id: 'SA_NEPAL',
        name: 'Nepal',
        creative: {
          characters: {
            wardrobeModifiers: ['Himalayan wool-tech layers', 'mandala-circuit prayer wheel accents', 'topi cap with AR display'],
            culturalCompanions: ['a red panda with a trekking backpack of data', 'a yak carrying server loads up mountain paths'],
            expressionStyle: 'Mountain calm, Sherpa endurance, peaceful strength',
            colorInfluence: ['Himalayan white', 'prayer flag rainbow', 'deep maroon', 'gold'],
          },
          music: {
            genres: ['Himalayan ambient', 'Nepali folk-electronic', 'meditation bowl tech'],
            instruments: ['madal', 'sarangi', 'singing bowls', 'flute', 'damaru'],
            mood: ['mountain serenity', 'endurance', 'spiritual tech', 'peaceful power'],
            bpmRange: [65, 100],
            samplePrompt: 'Himalayan ambient with singing bowls and madal, Nepali folk electronic, mountain serenity, peaceful power, meditation-tech atmosphere',
          },
          visuals: {
            paletteKeywords: ['Himalayan white', 'prayer flag colors', 'deep maroon', 'gold'],
            lighting: 'Crystal Himalayan light with prayer flag color filtering',
            environmentModifiers: ['mountain monastery tech retreats', 'prayer flag data networks', 'Everest base camp innovation'],
            motifs: ['mandala computing', 'prayer wheel rotation', 'mountain peak hierarchies', 'yak trail data paths'],
            animationEnergy: 'contemplative',
          },
          narrative: {
            storytellingStyle: 'Mountain wisdom — steady climb, patient progress, summit perspective',
            pacing: 'slow-deliberate',
            emotionalArc: ['grounding', 'steady ascent', 'summit clarity'],
            coreValues: ['endurance', 'spiritual balance', 'community', 'mountain wisdom'],
            humorStyle: 'Gentle, altitude-based metaphors, Sherpa patience jokes',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['South Asian fusion wear', 'spiritual-tech accents', 'natural fiber base'],
        culturalCompanions: ['a wise elephant', 'a mountain bird', 'a temple monkey'],
        expressionStyle: 'Gentle warmth, spiritual depth, resilient grace',
        colorInfluence: ['earth tones', 'spiritual gold', 'nature green', 'ocean blue'],
      },
      music: {
        genres: ['South Asian ambient', 'folk-electronic', 'meditation modern'],
        instruments: ['flute', 'drums', 'strings', 'singing bowls'],
        mood: ['serene', 'resilient', 'spiritual', 'warm'],
        bpmRange: [70, 110],
        samplePrompt: 'South Asian ambient with traditional instruments, serene and warm, spiritual depth meets modern production',
      },
      visuals: {
        paletteKeywords: ['earth tones', 'gold', 'green', 'blue'],
        lighting: 'Warm temple light with natural glow',
        environmentModifiers: ['temple-tech spaces', 'mountain retreats', 'tropical gardens'],
        motifs: ['mandala', 'lotus', 'mountain forms', 'wave patterns'],
        animationEnergy: 'balanced',
      },
      narrative: {
        storytellingStyle: 'Spiritual-practical wisdom — ancient insight, modern application',
        pacing: 'measured',
        emotionalArc: ['grounding', 'growth', 'enlightened achievement'],
        coreValues: ['harmony', 'wisdom', 'community', 'resilience'],
        humorStyle: 'Gentle, wise, nature-based metaphors',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 11. SOUTHEAST ASIA (SEA) — 5 sub-zones
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'SEA',
    regionName: 'Southeast Asia',
    subRegions: [
      {
        id: 'SEA_MALAY',
        name: 'Malaysia & Indonesia',
        creative: {
          characters: {
            wardrobeModifiers: ['batik-print tech-wear', 'songket weave accents', 'wayang puppet-inspired silhouettes'],
            culturalCompanions: ['an orangutan with a tablet in a rainforest canopy office', 'a hornbill with batik-patterned wings scanning data', 'a Komodo dragon guarding server integrity'],
            expressionStyle: 'Gotong-royong communal warmth, respectful but creative, wayang shadow-play dramatic',
            colorInfluence: ['batik indigo', 'tropical green', 'golden songket', 'ocean teal'],
          },
          music: {
            genres: ['gamelan-electronic', 'dangdut modern', 'Malay pop-ambient'],
            instruments: ['gamelan', 'angklung', 'rebab', 'sape', 'kendang'],
            mood: ['tropical warmth', 'communal harmony', 'rhythmic joy', 'island serenity'],
            bpmRange: [90, 130],
            samplePrompt: 'Gamelan-electronic fusion with angklung and kendang, tropical ambient textures, communal harmony, rhythmic joy, Southeast Asian cinematic quality',
          },
          visuals: {
            paletteKeywords: ['batik indigo', 'tropical green', 'songket gold', 'ocean teal'],
            lighting: 'Tropical afternoon with dappled rainforest canopy light',
            environmentModifiers: ['rainforest canopy tech labs', 'batik-decorated data centers', 'kampung village innovation circles'],
            motifs: ['batik patterns', 'wayang shadow forms', 'tropical flower fractals', 'longhouse architecture'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Gotong-royong — the village builds together, success is shared',
            pacing: 'measured',
            emotionalArc: ['communal invitation', 'collaborative build', 'shared celebration (kenduri)'],
            coreValues: ['gotong-royong (mutual aid)', 'respect (hormat)', 'harmony', 'community'],
            humorStyle: 'Gentle teasing (senda gurau), food analogies, respectful wit',
          },
        },
      },
      {
        id: 'SEA_THAI',
        name: 'Thailand',
        creative: {
          characters: {
            wardrobeModifiers: ['Thai silk-tech blend', 'temple gold accents', 'muay thai wrapping reimagined as tech gloves'],
            culturalCompanions: ['a Thai elephant with golden howdah data center', 'a Siamese cat with jade-green data eyes', 'a fighting fish (betta) with flowing data-fin displays'],
            expressionStyle: 'Wai greeting grace, sanuk (fun-first) approach, gentle but fierce focus',
            colorInfluence: ['temple gold', 'Thai silk purple', 'jade green', 'lotus pink'],
          },
          music: {
            genres: ['Thai pop-electronic', 'traditional piphat modern', 'Bangkok city ambient'],
            instruments: ['ranad ek (xylophone)', 'khim', 'saw duang', 'klong', 'synth'],
            mood: ['sanuk (joyful)', 'graceful', 'vibrant street energy', 'temple calm'],
            bpmRange: [95, 135],
            samplePrompt: 'Thai pop-electronic with ranad ek and khim, Bangkok street energy, temple calm undertones, sanuk joyful groove, Southeast Asian cinematic quality',
          },
          visuals: {
            paletteKeywords: ['temple gold', 'Thai silk purple', 'jade green', 'lotus pink'],
            lighting: 'Temple candlelight glow transitioning to Bangkok neon',
            environmentModifiers: ['temple-tech hybrid spaces', 'floating market data bazaars', 'Bangkok rooftop innovation labs'],
            motifs: ['naga serpent data channels', 'lotus bloom interfaces', 'Thai script flowing animations', 'temple spire network towers'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Sanuk narrative — if it\'s not fun, redesign it until it is',
            pacing: 'dynamic',
            emotionalArc: ['playful start', 'graceful execution', 'joyful result'],
            coreValues: ['sanuk (fun)', 'kreng jai (considerate)', 'sabai sabai (easy-going excellence)'],
            humorStyle: 'Gentle, playful, food-obsessed, never confrontational comedy',
          },
        },
      },
      {
        id: 'SEA_VIET',
        name: 'Vietnam',
        creative: {
          characters: {
            wardrobeModifiers: ['áo dài-inspired tech-wear', 'lacquerware accent accessories', 'conical hat reimagined as AR headset'],
            culturalCompanions: ['a water buffalo calmly debugging in rice paddies', 'a crane (hạc) standing on one leg while coding', 'a turtle (Rùa) from Sword Lake guarding data integrity'],
            expressionStyle: 'Resilient determination, quiet innovation, tiger-economy hustle with poetic soul',
            colorInfluence: ['lacquer red', 'bamboo green', 'ao dai silk white', 'lantern gold'],
          },
          music: {
            genres: ['Vietnamese modern folk', 'Saigon electronic ambient', 'đàn tranh cinematic'],
            instruments: ['đàn tranh', 'đàn bầu', 'sáo trúc (bamboo flute)', 'trống', 'synth'],
            mood: ['resilient', 'poetic', 'tiger-economy drive', 'bamboo-strong flexibility'],
            bpmRange: [85, 125],
            samplePrompt: 'Vietnamese folk-electronic with đàn tranh and đàn bầu, bamboo flute melodies, resilient and poetic, tiger-economy drive, Saigon cinematic ambient quality',
          },
          visuals: {
            paletteKeywords: ['lacquer red', 'bamboo green', 'silk white', 'lantern gold'],
            lighting: 'Hoi An lantern festival warmth with misty morning freshness',
            environmentModifiers: ['bamboo forest servers', 'Hoi An lantern-lit data rooms', 'Mekong Delta floating innovation labs'],
            motifs: ['lantern glow patterns', 'bamboo joint connections', 'dragon boat racing metrics', 'lacquerware layers'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Bamboo resilience — bends but never breaks, quiet strength',
            pacing: 'measured',
            emotionalArc: ['quiet determination', 'adaptive growth', 'earned recognition'],
            coreValues: ['resilience', 'family', 'education', 'quiet excellence'],
            humorStyle: 'Understated, observational, food-and-family-centered',
          },
        },
      },
      {
        id: 'SEA_PHIL',
        name: 'Philippines',
        creative: {
          characters: {
            wardrobeModifiers: ['barong tagalog-tech hybrid', 'jeepney art patterns', 'terno butterfly sleeve accents'],
            culturalCompanions: ['a Philippine eagle with camera-lens eyes', 'a tarsier with giant data-processing eyes', 'a carabao (water buffalo) carrying cloud servers'],
            expressionStyle: 'Bayanihan community energy, Taglish code-switching fluency, karaoke-level enthusiasm',
            colorInfluence: ['jeepney rainbow', 'ocean blue', 'sunset orange', 'tropical green'],
          },
          music: {
            genres: ['OPM (Original Pinoy Music) electronic', 'rondalla modern', 'Manila pop-R&B'],
            instruments: ['bandurria', 'rondalla strings', 'kulintang', 'guitar', 'synth'],
            mood: ['bayanihan warmth', 'resilient joy', 'karaoke confidence', 'island groove'],
            bpmRange: [95, 135],
            samplePrompt: 'OPM-electronic with rondalla strings and kulintang, bayanihan warmth, karaoke confidence energy, island groove, Filipino cinematic quality',
          },
          visuals: {
            paletteKeywords: ['jeepney rainbow', 'ocean blue', 'sunset orange', 'tropical green'],
            lighting: 'Philippine sunset with jeepney chrome reflections',
            environmentModifiers: ['jeepney-decorated tech hubs', 'island co-working beach spaces', 'Manila skyline innovation'],
            motifs: ['jeepney art', 'tarsier eye data scans', 'island archipelago networks', 'tribal tattoo circuits'],
            animationEnergy: 'explosive',
          },
          narrative: {
            storytellingStyle: 'Bayanihan — the whole village lifts the house together',
            pacing: 'dynamic',
            emotionalArc: ['community call', 'joyful collaboration', 'fiesta celebration'],
            coreValues: ['bayanihan (collective effort)', 'resilience', 'family', 'pakikisama (harmony)'],
            humorStyle: 'Self-deprecating, Taglish wordplay, telenovela reactions, karaoke drama',
          },
        },
      },
      {
        id: 'SEA_PAN',
        name: 'Singapore / Pan-SEA',
        creative: {
          characters: {
            wardrobeModifiers: ['smart-casual tropical minimalist', 'Peranakan tile-pattern accents', 'hawker center apron tech-layer'],
            culturalCompanions: ['a Merlion spouting data streams', 'a clever otter family navigating urban data rivers', 'an orchid (Vanda Miss Joaquim) blooming with code'],
            expressionStyle: 'Kiasu efficiency, Singlish-flavored directness, multicultural code-switching',
            colorInfluence: ['garden city green', 'Marina Bay steel blue', 'orchid purple', 'hawker orange'],
          },
          music: {
            genres: ['Singapore electronic minimal', 'SEA-fusion ambient', 'smart nation tech-pop'],
            instruments: ['synth', 'gamelan elements', 'piano', 'electronic beats', 'guzheng'],
            mood: ['efficient elegance', 'multicultural fusion', 'innovation pulse', 'garden city calm'],
            bpmRange: [100, 130],
            samplePrompt: 'Singapore smart-nation electronic with gamelan and guzheng elements, multicultural fusion, efficient elegance, garden city ambient, cinematic production quality',
          },
          visuals: {
            paletteKeywords: ['garden city green', 'Marina Bay blue', 'orchid purple', 'hawker center warm'],
            lighting: 'Clean Singapore twilight with Gardens by the Bay bioluminescence',
            environmentModifiers: ['supertree grove data networks', 'hawker center brainstorm tables', 'Marina Bay floating innovation'],
            motifs: ['Peranakan tile patterns', 'Merlion data fountains', 'orchid bloom fractals', 'MRT network maps'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Smart nation — efficiency is beautiful, multiculturalism is strength',
            pacing: 'measured',
            emotionalArc: ['precise planning', 'multicultural synergy', 'elegant execution'],
            coreValues: ['meritocracy', 'efficiency', 'multiculturalism', 'continuous improvement'],
            humorStyle: 'Singlish-flavored ("can or cannot?"), food-obsessed, kiasu self-awareness',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['tropical tech-wear', 'batik-inspired patterns', 'Southeast Asian fusion'],
        culturalCompanions: ['an orangutan', 'a hornbill', 'an elephant'],
        expressionStyle: 'Warm, communal, respectful yet creative',
        colorInfluence: ['tropical green', 'ocean blue', 'gold', 'batik indigo'],
      },
      music: {
        genres: ['SEA fusion electronic', 'gamelan-modern', 'tropical ambient'],
        instruments: ['gamelan', 'angklung', 'flute', 'drums'],
        mood: ['tropical warmth', 'communal', 'joyful', 'harmonious'],
        bpmRange: [90, 130],
        samplePrompt: 'Southeast Asian fusion with gamelan and tropical textures, communal warmth, joyful and harmonious, cinematic quality',
      },
      visuals: {
        paletteKeywords: ['tropical green', 'ocean blue', 'gold', 'batik indigo'],
        lighting: 'Tropical golden light with temple glow',
        environmentModifiers: ['tropical architecture', 'rainforest-tech blend', 'island spaces'],
        motifs: ['batik patterns', 'lotus', 'tropical flora', 'dragon motifs'],
        animationEnergy: 'balanced',
      },
      narrative: {
        storytellingStyle: 'Community-first — build together, celebrate together',
        pacing: 'measured',
        emotionalArc: ['invitation', 'collaboration', 'shared joy'],
        coreValues: ['community', 'harmony', 'respect', 'adaptability'],
        humorStyle: 'Gentle, food-centric, warmly teasing',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 12. CJK — 4 sub-zones
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'CJK',
    regionName: 'China, Japan & Korea',
    subRegions: [
      {
        id: 'CJK_CN',
        name: 'China / HK / Macau',
        creative: {
          characters: {
            wardrobeModifiers: ['modern qipao/changshan tech-hybrid', 'jade circuit-board accents', 'red-gold prosperity patterns'],
            culturalCompanions: ['a Chinese dragon (龙) coiling through cloud servers', 'a panda reviewing efficiency dashboards with bamboo stylus', 'a crane (仙鹤) calligraphing code'],
            expressionStyle: 'Confident modern sophistication, Douyin-native energy, red-carpet tech presence',
            colorInfluence: ['lucky red', 'jade green', 'imperial gold', 'ink black'],
          },
          music: {
            genres: ['C-pop electronic', 'guzheng ambient modern', 'Shenzhen tech-bass'],
            instruments: ['guzheng', 'erhu', 'pipa', 'dizi flute', 'electronic bass'],
            mood: ['ambitious', 'culturally proud', 'future-forward', 'grand scale'],
            bpmRange: [90, 135],
            samplePrompt: 'C-pop electronic with guzheng and erhu, Shenzhen tech-bass undertones, ambitious and culturally proud, future-forward, grand-scale cinematic Chinese quality',
          },
          visuals: {
            paletteKeywords: ['lucky red', 'jade green', 'imperial gold', 'ink black'],
            lighting: 'Great Wall sunrise with Shenzhen neon contrast',
            environmentModifiers: ['forbidden city data palaces', 'bamboo forest server farms', 'Shenzhen skyline innovation towers'],
            motifs: ['dragon cloud patterns', 'calligraphy brushstroke data', 'Great Wall connectivity', 'lantern festival networks'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Grand ambition — the 5000-year civilization building tomorrow',
            pacing: 'dynamic',
            emotionalArc: ['heritage foundation', 'rapid innovation', 'grand achievement'],
            coreValues: ['collective ambition', 'harmony (和谐)', 'face (面子)', 'rapid progress'],
            humorStyle: 'Douyin-style rapid wit, self-deprecating 打工人 (worker) humor, food analogies',
          },
        },
      },
      {
        id: 'CJK_TW',
        name: 'Taiwan',
        creative: {
          characters: {
            wardrobeModifiers: ['bubble tea pastel tech-wear', 'night market neon accents', 'indigenous Formosan pattern elements'],
            culturalCompanions: ['a Formosan black bear with a boba cup and laptop', 'a mikado pheasant with LED tail feathers', 'a coral reef fish navigating data seas'],
            expressionStyle: 'Friendly, creative maker energy, night-market hustle with design elegance',
            colorInfluence: ['boba pastel', 'night market neon', 'jade mountain green', 'Pacific blue'],
          },
          music: {
            genres: ['Mandopop-indie', 'Taiwanese electronic ambient', 'night market lo-fi'],
            instruments: ['piano', 'erhu', 'synth', 'guitar', 'melodica'],
            mood: ['creative warmth', 'indie spirit', 'maker culture', 'island breeze'],
            bpmRange: [85, 120],
            samplePrompt: 'Taiwanese Mandopop-indie with piano and erhu, night market lo-fi ambient, creative warmth, maker culture spirit, island breeze cinematic quality',
          },
          visuals: {
            paletteKeywords: ['boba pastel', 'neon night', 'jade mountain green', 'Pacific blue'],
            lighting: 'Night market lantern warmth transitioning to Taipei 101 glow',
            environmentModifiers: ['night market innovation stalls', 'mountain temple maker spaces', 'Taipei rooftop labs'],
            motifs: ['bubble tea data visualization', 'temple roof curves', 'semiconductor circuit art', 'indigenous weave patterns'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Maker island — small but mighty, creative freedom, democratic innovation',
            pacing: 'measured',
            emotionalArc: ['creative spark', 'collaborative making', 'indie triumph'],
            coreValues: ['democracy', 'creative freedom', 'maker culture', 'friendliness'],
            humorStyle: 'Self-deprecating, cute aesthetic, boba-everything metaphors',
          },
        },
      },
      {
        id: 'CJK_JP',
        name: 'Japan',
        creative: {
          characters: {
            wardrobeModifiers: ['minimalist tech-kimono hybrid', 'sakura petal accents', 'clean geometric lines'],
            culturalCompanions: ['a serene koi fish swimming through air-data streams', 'a tanuki (raccoon dog) with a tablet', 'a shiba inu with determination ears focused on code'],
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
        id: 'CJK_KR',
        name: 'South Korea',
        creative: {
          characters: {
            wardrobeModifiers: ['sleek K-tech streetwear', 'hanbok-inspired clean lines', 'neon accent trims'],
            culturalCompanions: ['a Korean magpie (까치) with LED tail feathers', 'a playful haetae lion-dog hologram', 'a K-pop cat with choreographed data moves'],
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
  // 13. LATAM — 5 sub-zones
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'LATAM',
    regionName: 'Latin America',
    subRegions: [
      {
        id: 'LATAM_BRAZIL',
        name: 'Brazil',
        creative: {
          characters: {
            wardrobeModifiers: ['tropical print tech-wear', 'capoeira-inspired movement clothes', 'carnival color bursts'],
            culturalCompanions: ['a toucan with holographic beak displaying metrics', 'a capybara wearing headphones reviewing code calmly'],
            expressionStyle: 'Warm, full-body expression — samba energy, infectious joy',
            colorInfluence: ['tropical green', 'sunshine yellow', 'ocean blue', 'carnival magenta'],
          },
          music: {
            genres: ['bossa nova tech-fusion', 'Brazilian funk electronic', 'MPB modern'],
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
        id: 'LATAM_MEXICO',
        name: 'Mexico & Central America',
        creative: {
          characters: {
            wardrobeModifiers: ['Aztec geometric tech patterns', 'Día de Muertos sugar skull accents', 'lucha libre mask elements'],
            culturalCompanions: ['an axolotl with regenerating code abilities', 'a quetzal bird trailing data feathers'],
            expressionStyle: 'Passionate, colorful, dramatic flair — telenovela energy meets tech',
            colorInfluence: ['marigold orange', 'deep magenta', 'turquoise', 'obsidian black'],
          },
          music: {
            genres: ['mariachi electronic fusion', 'Mexican cumbia tech', 'corrido modern'],
            instruments: ['guitarrón', 'vihuela', 'trumpet', 'marimba', 'jarana'],
            mood: ['passionate', 'celebratory', 'proud', 'festive'],
            bpmRange: [105, 140],
            samplePrompt: 'Mariachi-electronic fusion with trumpet and guitarrón, cumbia rhythm with modern beats, passionate and celebratory, cinematic Mexican atmosphere',
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
      {
        id: 'LATAM_ANDEAN',
        name: 'Andean (Colombia, Peru, Ecuador)',
        creative: {
          characters: {
            wardrobeModifiers: ['Andean textile tech-poncho', 'Inca geometric patterns', 'emerald and gold accents'],
            culturalCompanions: ['an Andean condor soaring over data mountains', 'a llama carrying cloud server packs', 'a spectacled bear analyzing data from a tree'],
            expressionStyle: 'Mountain wisdom meets Caribbean coast warmth — cumbia rhythm in everything',
            colorInfluence: ['Andean earth', 'emerald green', 'Inca gold', 'sky blue'],
          },
          music: {
            genres: ['cumbia-electronic', 'Andean folk-fusion', 'reggaeton-lite ambient'],
            instruments: ['charango', 'zampoña (pan flute)', 'quena', 'guacharaca', 'tiple'],
            mood: ['mountain grandeur', 'warm connectivity', 'rhythmic joy', 'ancestral wisdom'],
            bpmRange: [95, 135],
            samplePrompt: 'Cumbia-electronic with charango and zampoña, Andean folk-fusion, mountain grandeur meets warm connectivity, rhythmic joy, cinematic Andean quality',
          },
          visuals: {
            paletteKeywords: ['Andean earth', 'emerald green', 'Inca gold', 'sky blue'],
            lighting: 'Andean highland clarity with cloud forest mist',
            environmentModifiers: ['Machu Picchu terrace data farms', 'cloud forest innovation labs', 'emerald mine data vaults'],
            motifs: ['Inca sun symbols', 'terrace agriculture patterns', 'condor flight paths', 'Nazca line data maps'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Mountain-to-coast — ancestral wisdom flowing to modern innovation',
            pacing: 'measured',
            emotionalArc: ['ancestral grounding', 'joyful discovery', 'elevation achievement'],
            coreValues: ['Pachamama (earth respect)', 'community', 'ancestral knowledge', 'joy'],
            humorStyle: 'Mountain-dry wit with coastal warmth, llama-based analogies',
          },
        },
      },
      {
        id: 'LATAM_CONESUR',
        name: 'Southern Cone (Argentina, Chile, Uruguay)',
        creative: {
          characters: {
            wardrobeModifiers: ['gaucho-tech leather accents', 'mate gourd holster', 'tango-stripe design elements'],
            culturalCompanions: ['a wise owl (lechuza) with tango-dancer posture', 'a penguin from Patagonia running cold data storage', 'a puma navigating Andes data peaks'],
            expressionStyle: 'Passionate intellectual, tango intensity, mate-sharing camaraderie',
            colorInfluence: ['tango red', 'Patagonia blue', 'pampas green', 'wine burgundy'],
          },
          music: {
            genres: ['tango-electronic (tango nuevo)', 'rock nacional', 'Chilean nueva canción modern'],
            instruments: ['bandoneón', 'guitar', 'piano', 'violin', 'synth'],
            mood: ['passionate intellect', 'melancholic beauty', 'fierce pride', 'late-night depth'],
            bpmRange: [85, 125],
            samplePrompt: 'Tango nuevo electronic with bandoneón and guitar, rock nacional energy, passionate intellect, melancholic beauty, cinematic Buenos Aires late-night quality',
          },
          visuals: {
            paletteKeywords: ['tango red', 'Patagonia blue', 'pampas green', 'wine burgundy'],
            lighting: 'Buenos Aires café late-night glow with Patagonia sunset drama',
            environmentModifiers: ['tango hall innovation salons', 'Patagonia data research stations', 'vineyard tech retreats'],
            motifs: ['tango embrace curves', 'Patagonian glacier data', 'mate gourd warmth', 'gaucho knot patterns'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Intellectual passion — debate it over mate, then build it with fire',
            pacing: 'measured',
            emotionalArc: ['intellectual spark', 'passionate debate', 'elegant execution'],
            coreValues: ['intellectual depth', 'passion', 'friendship (mate culture)', 'cultural pride'],
            humorStyle: 'Sharp porteño wit, intellectual sarcasm, mate-sharing rituals',
          },
        },
      },
      {
        id: 'LATAM_CARIB',
        name: 'Caribbean LATAM (DR, PR, Cuba)',
        creative: {
          characters: {
            wardrobeModifiers: ['tropical guayabera tech-shirt', 'salsa-rhythm movement clothes', 'palm frond accents'],
            culturalCompanions: ['a parrot DJ mixing data beats', 'a sea turtle navigating Caribbean data currents', 'a coquí frog singing code melodies'],
            expressionStyle: 'Full-body salsa energy, infectious smile, sabor (flavor) in everything',
            colorInfluence: ['Caribbean turquoise', 'sunset coral', 'palm green', 'rum gold'],
          },
          music: {
            genres: ['salsa-electronic', 'reggaeton-ambient', 'son cubano modern'],
            instruments: ['congas', 'timbales', 'tres guitar', 'maracas', 'synth bass'],
            mood: ['sabor (flavor)', 'infectious groove', 'tropical heat', 'celebratory'],
            bpmRange: [100, 140],
            samplePrompt: 'Salsa-electronic with congas and timbales, reggaeton bass, son cubano warmth, infectious groove, Caribbean tropical heat, cinematic island quality',
          },
          visuals: {
            paletteKeywords: ['Caribbean turquoise', 'sunset coral', 'palm green', 'rum gold'],
            lighting: 'Caribbean sunset with palm shadow patterns',
            environmentModifiers: ['colonial architecture tech labs', 'beach bar brainstorm spaces', 'vintage car (almendrones) mobile offices'],
            motifs: ['palm frond patterns', 'wave rhythm graphics', 'colonial balcony networks', 'domino tile data sets'],
            animationEnergy: 'explosive',
          },
          narrative: {
            storytellingStyle: 'Sabor narrative — everything has flavor, rhythm, and soul',
            pacing: 'rapid-fire',
            emotionalArc: ['rhythmic invitation', 'crescendo collaboration', 'fiesta triumph'],
            coreValues: ['sabor (flavor)', 'community', 'resilience', 'musical soul'],
            humorStyle: 'Quick-fire humor, double meanings, musical timing comedy',
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
  // 14. CARIBBEAN (standalone)
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'CARIBBEAN',
    regionName: 'Caribbean',
    subRegions: [
      {
        id: 'CARIBBEAN_EN',
        name: 'English Caribbean',
        creative: {
          characters: {
            wardrobeModifiers: ['carnival feather-tech headpieces', 'cricket whites with neon accents', 'reggae-colored data-dread cables'],
            culturalCompanions: ['a hummingbird with rainbow-data trail', 'a green sea turtle carrying island server shells', 'a mongoose debugging with speed'],
            expressionStyle: 'Reggae-cool confidence, carnival energy bursts, cricket commentary enthusiasm',
            colorInfluence: ['Rasta green-gold-red', 'Caribbean blue', 'sunset magenta', 'palm green'],
          },
          music: {
            genres: ['reggae-electronic', 'soca-tech', 'dancehall ambient', 'calypso modern'],
            instruments: ['steel pan', 'bass guitar (reggae)', 'drums', 'synth', 'conch shell horn'],
            mood: ['island cool', 'carnival fire', 'one-love unity', 'riddim confidence'],
            bpmRange: [85, 140],
            samplePrompt: 'Reggae-electronic with steel pan and bass, soca rhythm, island cool meets carnival fire, one-love unity, Caribbean cinematic quality',
          },
          visuals: {
            paletteKeywords: ['Rasta spectrum', 'Caribbean blue', 'sunset magenta', 'palm green'],
            lighting: 'Caribbean sunrise gold with carnival spotlight bursts',
            environmentModifiers: ['beach-side tech pavilions', 'carnival float data displays', 'rum shack brainstorm bars'],
            motifs: ['steel pan circular data viz', 'palm leaf networks', 'carnival mask interfaces', 'wave rhythm patterns'],
            animationEnergy: 'explosive',
          },
          narrative: {
            storytellingStyle: 'Irie storytelling — everything works out when the riddim is right',
            pacing: 'dynamic',
            emotionalArc: ['cool invitation', 'building riddim', 'carnival peak'],
            coreValues: ['one love', 'resilience', 'island creativity', 'community'],
            humorStyle: 'Laid-back observational, patois-flavored wit, cricket analogies',
          },
        },
      },
      {
        id: 'CARIBBEAN_FR',
        name: 'French Caribbean',
        creative: {
          characters: {
            wardrobeModifiers: ['Creole madras-tech fabric', 'carnival plume accents', 'French-Caribbean fusion chic'],
            culturalCompanions: ['a Martinique iguana with camouflage data-skin', 'a Haitian rooster with voodoo-tech aura'],
            expressionStyle: 'Créolité fluidity — French elegance meets Caribbean heat',
            colorInfluence: ['madras plaid colors', 'tropical coral', 'French blue', 'spice gold'],
          },
          music: {
            genres: ['zouk-electronic', 'kompa modern', 'Antillean jazz-fusion'],
            instruments: ['ka drum', 'guitar', 'synth', 'bass', 'steel pan'],
            mood: ['zouk romance', 'Créole warmth', 'carnival passion', 'island sophistication'],
            bpmRange: [90, 130],
            samplePrompt: 'Zouk-electronic with ka drum and guitar, kompa-inspired bass, Créole warmth and romance, island sophistication, French Caribbean cinematic quality',
          },
          visuals: {
            paletteKeywords: ['madras plaid', 'tropical coral', 'French blue', 'spice gold'],
            lighting: 'Tropical sun with French café filtered warmth',
            environmentModifiers: ['Creole house tech studios', 'spice market data halls', 'volcanic island labs'],
            motifs: ['madras check patterns', 'spice spiral data', 'volcanic terrain maps', 'Créole script flows'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Créolité — blending French and Caribbean into something entirely new',
            pacing: 'dynamic',
            emotionalArc: ['cultural blending', 'creative fusion', 'joyful synthesis'],
            coreValues: ['créolité (cultural fusion)', 'resilience', 'French-Caribbean duality', 'artistic expression'],
            humorStyle: 'Bilingual Créole-French wordplay, spice metaphors, volcanic temper comedy',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['tropical island tech-wear', 'carnival accents', 'relaxed island style'],
        culturalCompanions: ['a hummingbird', 'a sea turtle', 'a parrot'],
        expressionStyle: 'Island-cool confidence with carnival energy',
        colorInfluence: ['Caribbean blue', 'sunset', 'palm green', 'gold'],
      },
      music: {
        genres: ['Caribbean fusion', 'reggae-electronic', 'island ambient'],
        instruments: ['steel pan', 'drums', 'guitar', 'bass'],
        mood: ['island cool', 'joyful', 'rhythmic'],
        bpmRange: [85, 135],
        samplePrompt: 'Caribbean fusion with steel pan and reggae bass, island cool, joyful rhythm, cinematic tropical quality',
      },
      visuals: {
        paletteKeywords: ['Caribbean blue', 'sunset coral', 'palm green', 'gold'],
        lighting: 'Caribbean golden light with ocean reflections',
        environmentModifiers: ['beach spaces', 'tropical architecture', 'island innovation'],
        motifs: ['palm fronds', 'wave patterns', 'carnival masks'],
        animationEnergy: 'vibrant',
      },
      narrative: {
        storytellingStyle: 'Island rhythm — everything flows when the vibe is right',
        pacing: 'dynamic',
        emotionalArc: ['invitation', 'groove', 'celebration'],
        coreValues: ['community', 'resilience', 'creativity', 'joy'],
        humorStyle: 'Laid-back, rhythmic, warm teasing',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 15. OCEANIA
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'OCEANIA',
    regionName: 'Oceania',
    subRegions: [
      {
        id: 'OCEANIA_AU',
        name: 'Australia',
        creative: {
          characters: {
            wardrobeModifiers: ['outback-tech utility wear', 'Aboriginal dot-art accents', 'coral reef color splashes'],
            culturalCompanions: ['a kangaroo with a joey holding a tablet in its pouch', 'a kookaburra laughing at bug reports', 'a platypus — the ultimate cross-platform creature'],
            expressionStyle: 'No-worries confidence, larrikin humor, "she\'ll be right" energy with sharp competence',
            colorInfluence: ['outback red', 'ocean blue', 'eucalyptus green', 'reef coral'],
          },
          music: {
            genres: ['Australiana electronic', 'didgeridoo ambient', 'indie surf-rock modern'],
            instruments: ['didgeridoo', 'clapsticks', 'guitar', 'synth', 'drums'],
            mood: ['vast open spaces', 'larrikin confidence', 'beach-chill', 'ancient-modern'],
            bpmRange: [85, 125],
            samplePrompt: 'Australiana electronic with didgeridoo drone and clapstick rhythm, indie surf-rock undertones, vast outback atmosphere, larrikin confidence, cinematic quality',
          },
          visuals: {
            paletteKeywords: ['outback red', 'ocean blue', 'eucalyptus green', 'reef coral'],
            lighting: 'Uluru sunrise with Great Barrier Reef underwater glow',
            environmentModifiers: ['outback data stations', 'reef-inspired server architecture', 'surf beach innovation shacks'],
            motifs: ['Aboriginal dot art data viz', 'boomerang return patterns', 'reef coral networks', 'Southern Cross navigation'],
            animationEnergy: 'vibrant',
          },
          narrative: {
            storytellingStyle: 'Aussie understatement — massive achievement described as "not bad, mate"',
            pacing: 'dynamic',
            emotionalArc: ['laid-back start', 'unexpected competence', '"no worries" triumph'],
            coreValues: ['mateship', 'fair go', 'larrikin spirit', 'ancient land respect'],
            humorStyle: 'Dry as the outback, self-deprecating, animal-based metaphors, "she\'ll be right"',
          },
        },
      },
      {
        id: 'OCEANIA_NZ',
        name: 'New Zealand',
        creative: {
          characters: {
            wardrobeModifiers: ['Māori tā moko-inspired tech tattoos', 'merino wool smart-layers', 'pounamu (jade) circuit accents'],
            culturalCompanions: ['a kiwi bird (nocturnal debugger) with tiny AR goggles', 'a tuatara (ancient wisdom) monitoring long-term data trends', 'a Hector\'s dolphin navigating data currents'],
            expressionStyle: 'Haka intensity for big moments, gentle kiwi humility for everything else',
            colorInfluence: ['pounamu jade', 'fern green', 'volcanic black', 'glacier blue'],
          },
          music: {
            genres: ['Māori chant-electronic', 'kiwi indie ambient', 'Pacific fusion'],
            instruments: ['taonga pūoro (traditional instruments)', 'guitar', 'synth', 'drums', 'log drums'],
            mood: ['grounded', 'humble power', 'nature-connected', 'guardian energy'],
            bpmRange: [75, 115],
            samplePrompt: 'Māori chant-electronic with taonga pūoro instruments, kiwi indie ambient, grounded and powerful, nature-connected, New Zealand cinematic quality, haka-level intensity',
          },
          visuals: {
            paletteKeywords: ['pounamu jade', 'fern green', 'volcanic black', 'glacier blue'],
            lighting: 'Middle-earth dramatic — misty mountains with silver fern glow',
            environmentModifiers: ['fern forest data centers', 'volcanic innovation labs', 'Māori meeting house tech spaces (wharenui)'],
            motifs: ['koru (fern spiral) data flows', 'tā moko patterns', 'mountain silhouettes', 'wave guardians'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Kaitiakitanga (guardianship) — build for the seventh generation',
            pacing: 'measured',
            emotionalArc: ['humble beginning', 'nature-guided growth', 'guardian achievement'],
            coreValues: ['kaitiakitanga (guardianship)', 'manaakitanga (hospitality)', 'whanaungatanga (relationships)'],
            humorStyle: 'Self-deprecating kiwi humor, "sweet as", sheep-to-person ratio jokes, understated epic',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['outdoor-tech wear', 'indigenous pattern accents', 'nature-inspired'],
        culturalCompanions: ['a kangaroo', 'a kiwi bird', 'a dolphin'],
        expressionStyle: 'Laid-back confidence with deep competence',
        colorInfluence: ['ocean blue', 'green', 'outback red', 'jade'],
      },
      music: {
        genres: ['Oceanic fusion', 'indigenous-electronic', 'indie ambient'],
        instruments: ['didgeridoo', 'guitar', 'synth', 'drums'],
        mood: ['vast', 'grounded', 'nature-connected'],
        bpmRange: [80, 120],
        samplePrompt: 'Oceanic fusion with indigenous instruments, vast and grounded, nature-connected, cinematic quality',
      },
      visuals: {
        paletteKeywords: ['ocean blue', 'earth red', 'green', 'jade'],
        lighting: 'Southern hemisphere golden light with ocean reflections',
        environmentModifiers: ['coastal spaces', 'natural landscapes', 'outdoor innovation'],
        motifs: ['wave patterns', 'indigenous art', 'natural forms'],
        animationEnergy: 'balanced',
      },
      narrative: {
        storytellingStyle: 'Down-under innovation — humble start, global impact',
        pacing: 'measured',
        emotionalArc: ['grounding', 'natural growth', 'earned respect'],
        coreValues: ['mateship', 'guardianship', 'innovation', 'nature respect'],
        humorStyle: 'Dry, self-deprecating, nature metaphors',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 16. CENTRAL ASIA
  // ═══════════════════════════════════════════════════════════════
  {
    regionId: 'CENTRAL_ASIA',
    regionName: 'Central Asia',
    subRegions: [
      {
        id: 'ASIA_CENTRAL_KZ',
        name: 'Kazakhstan',
        creative: {
          characters: {
            wardrobeModifiers: ['Kazakh chapan-tech robe', 'eagle-hunting gauntlet with AR display', 'yurt-pattern smart textiles'],
            culturalCompanions: ['a golden eagle perched on a developer\'s arm, scanning code', 'a snow leopard stalking through data mountains', 'a steppe horse galloping across dashboards'],
            expressionStyle: 'Steppe-wide confidence, eagle-hunter precision, nomadic adaptability',
            colorInfluence: ['steppe gold', 'sky blue (national flag)', 'eagle brown', 'snow white'],
          },
          music: {
            genres: ['Kazakh dombra-electronic', 'throat singing ambient', 'steppe cinematic'],
            instruments: ['dombra', 'kobyz', 'sybyzgy flute', 'synth pads', 'drums'],
            mood: ['vast steppe freedom', 'eagle-soaring', 'nomadic wisdom', 'modern ambition'],
            bpmRange: [80, 120],
            samplePrompt: 'Kazakh dombra-electronic with kobyz overtones, throat singing ambient, vast steppe atmosphere, eagle-soaring freedom, modern nomadic cinematic quality',
          },
          visuals: {
            paletteKeywords: ['steppe gold', 'sky blue', 'eagle brown', 'snow white'],
            lighting: 'Infinite steppe horizon light with Astana futurist glow',
            environmentModifiers: ['yurt-shaped data centers', 'Astana futurist architecture', 'steppe eagle-view dashboards'],
            motifs: ['Kazakh ornamental patterns', 'eagle flight paths', 'yurt lattice (kerege)', 'Silk Road maps'],
            animationEnergy: 'balanced',
          },
          narrative: {
            storytellingStyle: 'Nomadic innovation — move fast, adapt, carry your home (data) with you',
            pacing: 'measured',
            emotionalArc: ['horizon scanning', 'swift pursuit', 'eagle-catch triumph'],
            coreValues: ['freedom', 'hospitality', 'nomadic wisdom', 'modern ambition'],
            humorStyle: 'Eagle-hunting metaphors, steppe-vast understatement, nomadic practical humor',
          },
        },
      },
    ],
    defaults: {
      characters: {
        wardrobeModifiers: ['Silk Road fusion tech-wear', 'nomadic pattern accents', 'eagle-inspired details'],
        culturalCompanions: ['a golden eagle', 'a snow leopard', 'a steppe horse'],
        expressionStyle: 'Steppe confidence, nomadic adaptability, warm hospitality',
        colorInfluence: ['steppe gold', 'sky blue', 'mountain grey', 'eagle brown'],
      },
      music: {
        genres: ['Central Asian folk-electronic', 'throat singing ambient', 'Silk Road fusion'],
        instruments: ['dombra', 'synth', 'flute', 'drums'],
        mood: ['vast', 'nomadic', 'warm', 'ambitious'],
        bpmRange: [80, 120],
        samplePrompt: 'Central Asian folk-electronic with dombra, vast steppe atmosphere, nomadic warmth, Silk Road cinematic quality',
      },
      visuals: {
        paletteKeywords: ['steppe gold', 'sky blue', 'mountain grey', 'eagle brown'],
        lighting: 'Infinite horizon light with mountain contrast',
        environmentModifiers: ['Silk Road innovation hubs', 'steppe landscapes', 'futurist architecture'],
        motifs: ['nomadic patterns', 'eagle motifs', 'yurt geometry', 'Silk Road paths'],
        animationEnergy: 'balanced',
      },
      narrative: {
        storytellingStyle: 'Silk Road narrative — connecting worlds through trade and innovation',
        pacing: 'measured',
        emotionalArc: ['horizon', 'journey', 'arrival'],
        coreValues: ['hospitality', 'adaptability', 'trade', 'freedom'],
        humorStyle: 'Nomadic practical humor, eagle metaphors, warm understatement',
      },
    },
  },
];

// ─── REGION ID MAPPING ───────────────────────────────────────────────────────
// Maps regionHierarchy.ts groupCodes to creative profile IDs

const REGION_ID_MAP: Record<string, string> = {
  'NAM': 'NAM',
  'EU': 'EU',
  'EURASIA': 'EURASIA',
  'TURKEY': 'TURKEY',
  'MENA': 'MENA',
  'AFRICA': 'AFRICA',
  'INDIA': 'INDIA',
  'PAKISTAN': 'PAKISTAN',
  'BANGLADESH': 'BANGLADESH',
  'SOUTH_ASIA': 'SOUTH_ASIA',
  'SEA': 'SEA',
  'CJK': 'CJK',
  'LATAM': 'LATAM',
  'CARIBBEAN': 'CARIBBEAN',
  'OCEANIA': 'OCEANIA',
  'CENTRAL_ASIA': 'CENTRAL_ASIA',
  // Legacy aliases for backward compatibility
  'north-america': 'NAM',
  'europe': 'EU',
  'india': 'INDIA',
  'mena': 'MENA',
  'east-asia': 'CJK',
  'latam': 'LATAM',
  'africa': 'AFRICA',
};

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
  const mappedId = REGION_ID_MAP[regionId] || regionId;
  const profile = REGIONAL_CREATIVE_PROFILES.find(r => r.regionId === mappedId);
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
  const mappedId = REGION_ID_MAP[regionId] || regionId;
  const profile = REGIONAL_CREATIVE_PROFILES.find(r => r.regionId === mappedId);
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
  const mappedId = REGION_ID_MAP[regionId] || regionId;
  const profile = REGIONAL_CREATIVE_PROFILES.find(r => r.regionId === mappedId);
  if (!profile) return null;

  if (subRegionId) {
    return profile.subRegions.find(s => s.id === subRegionId)?.creative ?? profile.defaults;
  }
  return profile.defaults;
}

/**
 * Gets all available region IDs for iteration.
 */
export function getAllCreativeRegionIds(): string[] {
  return REGIONAL_CREATIVE_PROFILES.map(p => p.regionId);
}

/**
 * Gets all sub-region IDs for a given parent region.
 */
export function getSubRegionIds(regionId: string): string[] {
  const mappedId = REGION_ID_MAP[regionId] || regionId;
  const profile = REGIONAL_CREATIVE_PROFILES.find(r => r.regionId === mappedId);
  return profile?.subRegions.map(s => s.id) ?? [];
}
