/**
 * EP04 PRODUCTION CONFIG
 * "Two AIs, One Sprint, Zero Standup Meetings"
 *
 * Maps the EP04_VIDEO_PRODUCTION_PLAN.md scene structure to:
 * - Screenshot IDs (from PRODUCT_SCREENS['sprint-tracker'])
 * - Voice assignments (3 distinct TTS voices)
 * - Visual style per scene (3D Pixar avatar / screen-capture / motion-graphics)
 * - Pixar avatar / animation pipeline config
 *
 * All keys align with EP04_SCENE_SCREENSHOT_MAP in MultiScreenshotGallery.tsx.
 */

// ─── FIVE-VOICE TTS CONFIGURATION ────────────────────────────────────────────
// Each character uses a distinct provider + voice to be distinguishable on audio.
// ElevenLabs voice IDs from: https://elevenlabs.io/voice-library
// Alibaba CosyVoice fallbacks: https://www.alibabacloud.com/help/en/model-studio/cosyvoice-voice-list
import { getActiveModel } from './provider-version-registry';

// Alibaba CosyVoice fallback voices (WebSocket API)
// Model versions sourced from provider-version-registry.ts
const COSYVOICE_FLASH = getActiveModel('alibaba', 'tts') ?? 'cosyvoice-v3-flash';
const COSYVOICE_PLUS  = getActiveModel('alibaba', 'tts-premium') ?? 'cosyvoice-v3-plus';

export const ALIBABA_FALLBACK_VOICES = {
  host:     { model: COSYVOICE_FLASH, voice: 'longanyang',     lang: 'en', description: 'Sunny young man — warm podcast host fallback' },
  atlas:    { model: COSYVOICE_FLASH, voice: 'longcheng',      lang: 'en', description: 'Professional male — measured engineer fallback' },
  nova:     { model: COSYVOICE_FLASH, voice: 'longhua',        lang: 'en', description: 'Bright female — energetic dev fallback' },
  allaudin: { model: COSYVOICE_PLUS,  voice: 'longshu',        lang: 'en', description: 'Deep male — theatrical narrator fallback' },
  squirrel: { model: COSYVOICE_FLASH, voice: 'longpaopao_v3',  lang: 'en', description: 'Bubble voice child — chaotic squirrel fallback' },
} as const;

export const EP04_VOICES = {
  /** Host (Sai Dasika) = warm, podcast-style. ElevenLabs Brian — conversational, direct. */
  host: {
    provider: 'elevenlabs' as const,
    voiceId: 'nPczCjzI2devNBz1zQrb',  // Brian — warm male, podcast host style
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: ALIBABA_FALLBACK_VOICES.host,
    style: 'conversational',
    stability: 0.5,
    similarityBoost: 0.75,
    speed: 1.0,
    eqProfile: 'warm',
    description: 'Host narration — warm, self-deprecating, direct to camera',
  },
  /** Atlas (Claude) = measured, slight reverb. Azure Neural "en-US-GuyNeural" */
  atlas: {
    provider: 'azure' as const,
    voiceId: 'en-US-GuyNeural',
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: ALIBABA_FALLBACK_VOICES.atlas,
    style: 'professional',
    rate: '-5%',
    pitch: '-2%',
    eqProfile: 'reverb',
    description: 'Atlas (Claude) — backend tech lead, measured, calm engineer',
  },
  /** Nova (Lovable) = bright, energetic. Azure JennyNeural — fast delivery, expressive. Moved from ElevenLabs to balance rate limits. */
  nova: {
    provider: 'azure' as const,
    voiceId: 'en-US-JennyNeural',  // Jenny — bright female, energetic, natural
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: ALIBABA_FALLBACK_VOICES.nova,
    style: 'energetic',
    stability: 0.35,
    similarityBoost: 0.65,
    speed: 1.1,
    rate: '+10%',   // Azure prosody: slightly faster delivery matching Nova's energy
    pitch: '+5%',   // Azure prosody: brighter pitch for energetic character
    eqProfile: 'bright',
    description: 'Nova (Lovable) — frontend dev, fast delivery, energetic',
  },
  /** Allaudin (Genie) = deep, theatrical, magical. ElevenLabs Daniel (deep British narrator) OR Alibaba longshu. */
  allaudin: {
    provider: 'elevenlabs' as const,
    voiceId: 'onwK4e9ZLuTAKqWW03F9',  // Daniel — deep British, refined, Nutcracker narrator presence
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: ALIBABA_FALLBACK_VOICES.allaudin,
    style: 'theatrical',
    stability: 0.62,
    similarityBoost: 0.85,
    speed: 0.85,
    eqProfile: 'deep-reverb',
    description: 'Allaudin (Genie) — deep British narrator with mystical, theatrical presence',
  },
  /** Squirrel = high-pitched, chaotic, childish. Azure AnaNeural (child voice). Moved from ElevenLabs to balance rate limits. */
  squirrel: {
    provider: 'azure' as const,
    voiceId: 'en-US-AnaNeural',  // Ana — child voice, animated, designed for young characters
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: ALIBABA_FALLBACK_VOICES.squirrel,
    style: 'chaotic',
    stability: 0.15,
    similarityBoost: 0.4,
    speed: 1.4,
    rate: '+40%',   // Azure prosody: hyperactive fast delivery
    pitch: '+15%',  // Azure prosody: high-pitched childish squirrel voice
    eqProfile: 'high-pitch',
    description: 'Squirrel — childish animation voice, hyperactive, chaotic comic relief',
  },
} as const;

/** Resolve voice config — returns Alibaba fallback if primary provider fails */
export function resolveVoiceWithFallback(
  character: keyof typeof EP04_VOICES,
  useFallback = false,
) {
  const voice = EP04_VOICES[character];
  if (!useFallback) {
    return { provider: voice.provider, voiceId: voice.voiceId };
  }
  const fb = voice.fallbackVoice;
  return { provider: 'alibaba' as const, voiceId: fb.voice, model: fb.model, lang: fb.lang };
}

export type EP04Voice = keyof typeof EP04_VOICES;

// ─── PIXAR AVATAR / ANIMATION PIPELINE ───────────────────────────────────────
// Readiness assessment against production plan (Phase 3 / Step 4a-d).
export const EP04_AVATAR_CONFIG = {
  /**
   * 3D Pixar character generation via Meshy AI (alibaba-3d-generator edge fn).
   * Status: ✅ Edge function exists, MESHY_API_KEY configured.
   * Note: ~60-90s per model — deferred from main assembler, runs as background job.
   */
  /**
   * CHARACTER STYLE OPTIONS — each character has Pixar-style AND Disney-style variants.
   * Per-scene switching is supported: e.g. Scene 2 = Pixar 3D, Scene 7 = Disney 2D.
   */
  characterStyles: ['pixar-3d', 'disney-2d', 'hybrid-2.5d'] as const,

  characters: {
    atlas: {
      name: 'Atlas',
      role: 'Backend Tech Lead (Claude)',
      style: '3d-pixar',
      palette: ['#3B82F6', '#7C3AED'],  // Blue/violet
      props: ['wire-frame glasses', 'floating code blocks', 'architectural diagrams', 'a calm owl perched on shoulder'],
      motionStyle: 'measured',          // Stands still, adjusts glasses, owl blinks wisely
      audioProfile: EP04_VOICES.atlas,
      // --- PIXAR-STYLE PROMPT: A wise bear-like creature as tech mentor ---
      pixarPrompt: 'Pixar-style 3D animated character: a tall, wise BEAR wearing a fitted indigo hoodie with glowing circuit-board patterns, thin wire-frame glasses perched on his snout, soft subsurface-scattered fur in steel-blue tones, big expressive amber eyes that reflect floating holographic code blocks, standing upright at a futuristic sprint board covered in glowing task cards, one paw gently adjusting his glasses while the other holds a translucent data tablet, a small wise OWL with violet feathers perched on his shoulder reading the backlog, surrounded by tiny firefly-like code particles, Pixar movie quality lighting with volumetric fog, stylized proportions with slightly oversized paws, rendered in Octane, 8K detail',
      // --- DISNEY-STYLE PROMPT: Fluid 2D painted aesthetic ---
      disneyPrompt: 'Disney 2D animation style character: a dignified bear scholar in an indigo cloak with constellation patterns, hand-painted watercolor textures, flowing brushstroke fur, expressive ink-line eyes behind round spectacles, holding a quill that writes floating equations in mid-air, a tiny owl companion with big curious eyes sitting on a stack of ancient tech scrolls, warm candlelit atmosphere with painted bokeh, classic Disney Renaissance hand-drawn aesthetic with modern color grading, painterly background of a cozy library filled with holographic screens',
      // --- SCENE COMPANIONS: Animals that listen during sprint calls ---
      sceneCompanions: [
        'A curious squirrel (like Scrat from Ice Age energy but original) sitting on the sprint board nibbling a task card shaped like an acorn',
        'A stoic tortoise with a tiny hardhat reviewing the burndown chart on a miniature clipboard',
        'Three baby owlets lined up on a branch watching the standup with enormous curious eyes',
      ],
    },
    nova: {
      name: 'Nova',
      role: 'Frontend Dev (Lovable)',
      style: '3d-pixar',
      palette: ['#22C55E', '#EC4899'],  // Green/pink gradient
      props: ['glowing stylus/paintbrush', 'floating UI components', 'color swatches', 'a hyperactive hummingbird companion'],
      motionStyle: 'expressive',        // Fast gestures, builds UI in mid-air, hummingbird zips around
      audioProfile: EP04_VOICES.nova,
      // --- PIXAR-STYLE PROMPT: An energetic fox-like creative spirit ---
      pixarPrompt: 'Pixar-style 3D animated character: a nimble, energetic FOX with iridescent green-to-pink gradient fur, enormous sparkling eyes with UI component reflections, wearing a paint-splattered artist smock over a neon-trim tech vest, tail that leaves trails of glowing CSS particles when it swishes, holding a luminous stylus-paintbrush that conjures floating React components in mid-air, a tiny hyperactive HUMMINGBIRD with rainbow wings zipping around leaving sparkle trails, standing on a floating platform surrounded by half-built UI mockups and color palette swatches, Pixar subsurface scattering on fur, dramatic rim lighting, stylized exaggerated proportions with big paws and bigger personality, cinematic depth of field, 8K render',
      // --- DISNEY-STYLE PROMPT: Fluid painterly animation ---
      disneyPrompt: 'Disney 2D animation style character: a spirited young fox artist with flowing green-pink watercolor fur, expressive hand-drawn linework, wearing a beret and paint-stained apron, painting floating interface elements with sweeping brushstrokes that come alive, a tiny hummingbird friend made of living watercolors darting between UI components, dynamic pose mid-creation with paint droplets frozen in air, lush painted background of a magical design studio where screens grow like flowers, classic Disney fluid animation energy with modern neon accents',
      sceneCompanions: [
        'A chameleon that changes color to match whatever UI component Nova is building, sitting on her shoulder',
        'A roll of enchanted paper that unrolls itself to display the sprint standup agenda, with tiny drawn characters acting out each item',
        'A family of rabbits arranged as a focus group, each holding tiny feedback cards with emojis',
      ],
    },
    host: {
      name: 'Host',
      role: 'Product Owner (Human)',
      style: '3d-pixar',
      palette: ['#D97706', '#92400E'],  // Warm earth tones
      props: ['coffee mug with "The GenieAI Podcast"', 'sticky notes', 'checklist papers', 'a loyal dog companion'],
      motionStyle: 'direct',            // Direct to camera, self-deprecating shrug, dog tilts head
      audioProfile: EP04_VOICES.host,
      // --- PIXAR-STYLE PROMPT: A relatable human PO (MUST show the human, not just the dog) ---
      pixarPrompt: 'Pixar-style 3D animated character portrait based on the reference photo: CLOSE-UP of a confident charismatic South Asian HUMAN MAN with warm brown skin, neat short dark hair swept back with a slightly receding hairline on top, stylish rectangular glasses, bright sparkling brown eyes full of excitement, big genuine warm smile radiating enthusiasm, wearing a deep blue-purple casual shirt, proudly holding a large steaming coffee mug with "The GenieAI Podcast" text printed on it, friendly approachable face with Pixar-proportioned features (slightly large head, very expressive eyebrows raised with energy), his loyal golden retriever visible at his side looking up adoringly with tail wagging, warm cozy home office background with golden lamplight, dual monitors behind him showing text "Claude Code" on left screen and text "Lovable" on right screen, the HUMAN radiates confidence and passion as the main subject filling 70% of frame, bright warm cinematic lighting, Pixar subsurface skin shading, 8K portrait render',
      // --- LIPSYNC: uses the AI-generated avatar (human with mug) directly — no separate headshot needed ---
      // --- DISNEY-STYLE PROMPT: Painted warm narrator (HUMAN is main subject) ---
      disneyPrompt: 'Disney 2D animation style character portrait: CLOSE-UP of a warm-hearted HUMAN MAN narrator with kind expressive eyes and slight bags underneath (too many sprints), messy brown hair, wearing a cozy earth-tone cardigan, hand-painted with visible brushstrokes, holding an enormous steaming coffee mug with "The GenieAI Podcast" text, his loyal golden retriever drawn in classic Disney style sitting at his feet, the HUMAN MAN fills most of the frame as the main subject, painterly home office background with soft watercolor lighting, dual monitors showing text "Claude Code" and text "Lovable" glowing softly, classic Disney warmth and charm',
      sceneCompanions: [
        'The golden retriever fetching a rolled-up sprint report like a newspaper, tail wagging proudly',
        'A cat sleeping on the keyboard who accidentally closes a Jira ticket by stepping on Enter',
        'A parrot on a perch repeating standup phrases: "No blockers! No blockers!" in a tiny voice',
      ],
    },
    allaudin: {
      name: 'Allaudin',
      role: 'The Genie (Narrator)',
      style: '3d-pixar',
      palette: ['#7C3AED', '#F59E0B'],  // Deep purple + gold
      props: ['magical lamp', 'swirling blue mist', 'golden sparkle particles'],
      motionStyle: 'theatrical',         // Grand gestures, emerges from lamp, mist swirls
      audioProfile: EP04_VOICES.allaudin,
      // --- PIXAR-STYLE PROMPT: A friendly whimsical genie (NOT muscular, NOT He-Man) ---
      pixarPrompt: 'CLOSE-UP portrait of a small friendly GENIE with blue-purple skin, Pixar 3D animation style, a wrapped purple turban with a golden gem, neat pointed black goatee, large warm brown eyes, pointy ears, a mischievous but kind smile, lean and whimsical build (NOT muscular), wearing golden wrist cuffs and a jeweled necklace, emerging from golden magical mist, deep purple and gold color palette, warm magical glow behind him, Pixar subsurface scattering on skin, stylized proportions, 8K cinematic portrait render',
      // --- DISNEY-STYLE PROMPT: Painted magical narrator ---
      disneyPrompt: 'Disney 2D animation style character portrait: a charming small blue-skinned genie with a purple turban and golden gem, pointed goatee, big expressive warm eyes, friendly mischievous grin, lean whimsical build, golden accessories, emerging from painted magical mist and sparkles, hand-painted watercolor style with visible brushstrokes, deep purple and gold palette, classic Disney warmth and magic',
      sceneCompanions: [
        'Tiny magical sparkle sprites that orbit around Allaudin like fireflies, each a different color',
        'A miniature golden lamp that floats beside him, occasionally puffing out small clouds of blue mist',
        'Constellation patterns that form in the air when Allaudin gestures, showing sprint data as star maps',
      ],
    },
    squirrel: {
      name: 'Squirrel',
      role: 'Comic Relief (Chaos Agent)',
      style: '3d-pixar',
      palette: ['#D97706', '#F59E0B'],  // Golden brown / amber
      props: ['oversized acorn', 'tiny paws', 'bushy tail', 'expressive wide eyes'],
      motionStyle: 'hyperactive',       // Scurries, drops in from above, tail twitching, chaotic energy
      audioProfile: EP04_VOICES.squirrel,
      pixarPrompt: 'Pixar-style 3D animated character portrait: CLOSE-UP of a tiny hyperactive SQUIRREL with golden-brown fur, enormous expressive eyes filled with chaotic energy, bushy tail twitching nervously, clutching an oversized acorn to its chest with tiny paws, wearing a comically small headset microphone, Scrat-from-Ice-Age energy but original design, sitting on a tree branch that doubles as a desk with tiny sticky notes, Pixar subsurface scattering on fur, warm forest lighting with bokeh, adorable but manic expression, 8K cinematic portrait render',
      disneyPrompt: 'Disney 2D animation style character portrait: a tiny chaotic squirrel with golden fur and enormous expressive eyes, hand-painted with visible brushstrokes, clutching an oversized acorn, bushy tail curling behind, wearing a tiny headset, perched on a branch with miniature sticky notes, classic Disney charm with manic Scrat energy, warm watercolor lighting',
      sceneCompanions: [
        'A pile of acorns arranged to look like a task board with tiny labels',
        'A miniature megaphone for dramatic interruptions',
      ],
    },
  },

  // ─── STORYBOOK VISUAL ASSETS ─────────────────────────────────────────
  storybook: {
    bookPrompt: 'Leather-bound storybook with "Beyond AI Hype" embossed in gold on the cover, ornate metal clasps, aged paper with deckled edges, sitting on a warm oak desk in a cozy library, volumetric lamplight, Pixar quality, 8K',
    pagePrompt: 'A single storybook page with hand-illustrated margins — tiny squirrels carrying USB drives, owls wearing reading glasses reviewing code, mushroom houses with wifi antennas, all in delicate ink-and-watercolor style',
    scrollPrompt: 'An ornate parchment scroll with wooden rollers, aged paper texture, hand-lettered calligraphy headings, illustrated marginalia with tiny woodland creatures interacting with data visualizations',
    marginalia: [
      'Tiny squirrels carrying USB drives between paragraphs',
      'An owl with round glasses reviewing a miniature code diff',
      'A tortoise carrying a task card across the bottom margin',
      'Mushroom houses with tiny wifi antennas in the corner flourish',
      'A caterpillar measuring a burndown chart with an inchworm ruler',
    ],
  },

  // ─── STORYTELLING MOTIONS PER CHARACTER ──────────────────────────────
  // Alvin & Chipmunks-style animated reactions for storybook character shots.
  storytellingMotions: {
    atlas: {
      explaining: 'Bear stands at whiteboard, methodically drawing diagrams with a glowing paw, owl nodding along',
      reacting: 'Bear raises one eyebrow slowly, adjusts glasses, owl mimics the eyebrow raise',
      frustrated: 'Bear pinches the bridge of his snout, sighs deeply, code blocks behind him turn red',
      proud: 'Bear stands tall, arms folded, the slightest smile, owl puffs chest too, background code turns green',
      arguing: 'Bear holds up documentation like a shield, speaking calmly but firmly while ignoring Nova\'s interruptions',
      not_listening: 'Bear continues presenting to whiteboard while Nova talks, completely unaware she\'s speaking, owl shrugs',
    },
    nova: {
      explaining: 'Fox paints UI components in mid-air with her glowing stylus, hummingbird follows each stroke',
      reacting: 'Fox bounces on her toes, ears perking up, sparkle effects around her, hummingbird does a loop',
      frustrated: 'Fox\'s tail droops, she stares at a loading spinner, hummingbird lands on her head sympathetically',
      proud: 'Fox strikes a pose with finished UI floating around her like a gallery, hummingbird does figure-eights, dark mode toggle glowing proudly',
      arguing: 'Fox talks rapidly over Atlas while simultaneously building a component, not waiting for him to finish',
      not_listening: 'Fox has headphones in, sketching UI while Atlas presents, occasionally saying "mm-hmm" without looking up',
    },
    host: {
      explaining: 'Human gestures at invisible screen, coffee mug in one hand, dog looking up attentively',
      reacting: 'Human does a double-take, spills a little coffee, dog tilts head, sticky notes flutter',
      frustrated: 'Human face-palms into both hands, coffee abandoned, dog puts a paw on his leg comfortingly',
      proud: 'Human leans back with a satisfied grin, dog wags tail, sticky notes arranged neatly behind him',
      mediating: 'Host stands between Atlas and Nova with hands out like a referee, both talking past him, dog runs back and forth',
      overwhelmed: 'Host covered in floating speech bubbles from both AIs, spinning to address each one, coffee sloshing',
    },
  },

  // ─── WOODLAND CHORUS — 5 audience creatures with group reactions ────
  // Background characters that react to story events like a Muppet balcony.
  woodlandChorus: [
    { creature: 'squirrel-trio', description: '3 squirrels in a row on a branch, acting as a Greek chorus — gasp, cheer, cover eyes', reactions: { amazed: 'All three jaws drop in sync', worried: 'All cover eyes with tiny paws, peeking through', cheering: 'Stand up and clap tiny paws, one falls off branch' } },
    { creature: 'owl-professor', description: 'A bespectacled owl with a tiny graduation cap, the academic commentator', reactions: { amazed: 'Adjusts glasses, says "Fascinating" silently', worried: 'Shakes head slowly, writes in a tiny notebook', cheering: 'Nods approvingly, stamps a tiny "A+" on the air' } },
    { creature: 'rabbit-family', description: '4 rabbits sitting in a row like stakeholders at a meeting', reactions: { amazed: 'Ears all stand straight up simultaneously', worried: 'Ears all droop down in sync', cheering: 'One holds up a tiny "10/10" scorecard, others thump feet' } },
    { creature: 'tortoise-timekeeper', description: 'A tortoise with a tiny hardhat and stopwatch', reactions: { amazed: 'Stops his stopwatch and stares', worried: 'Taps the stopwatch nervously', cheering: 'Gives the slowest thumbs-up ever recorded' } },
    { creature: 'chameleon-judge', description: 'A chameleon that changes color based on the mood of the scene', reactions: { amazed: 'Turns bright gold with sparkles', worried: 'Turns gray-blue, deflates slightly', cheering: 'Turns rainbow, tongue shoots out confetti' } },
  ],

  /**
   * Avatar lip-sync config.
   * Status: ⚠️ PARTIAL — ai-video-generator has Alibaba Wan2.2 for lip-sync.
   * The avatar-lipsync step in production plan (4d) is handled via generateAvatarSegment()
   * in genie-cast-assembler, which calls ai-video-generator with type:'avatar'.
   * Heavy assets are DEFERRED (55s timeout guard) — run as background job.
   */
  lipsync: {
    provider: 'alibaba-wan2.2',
    fallback: 'modelslab',
    azureViseme: true,          // Use Azure Speech viseme data for precision
    syncMode: 'phoneme-level',  // Most precise — matches AZURE_SPEECH_KEY
  },

  /**
   * 3D environment assets (Sprint board room, territory city, MCP network).
   * Status: ✅ alibaba-3d-generator + MESHY_API_KEY ready.
   */
  environments: {
    sprintBoardRoom: {
      pixarPrompt: '3D Pixar-quality room: a warm command center with a giant holographic Kanban board floating in center, glowing task cards that animals can grab and move, the wise bear (Atlas) and the fox (Nova) standing at opposite ends of the board, tiny squirrels running along the card columns carrying sticky notes, the golden retriever curled up under the board, firefly code particles drifting through warm violet-blue volumetric lighting, cozy yet futuristic, 8K cinematic render',
      disneyPrompt: 'Disney 2D painted sprint room: a magical treehouse office where the Kanban board is made of enchanted parchment pinned to a living tree, woodland creatures helping sort tasks — squirrels filing cards, owls reviewing priorities, a tortoise slowly moving a card from "In Progress" to "Done", painted in warm watercolors with golden hour lighting',
    },
    territoryCity: {
      pixarPrompt: '3D Pixar aerial view of a divided miniature city: LEFT district is Atlas territory — blue crystalline towers with code waterfalls and the bear visible in a glass office, RIGHT district is Nova territory — green garden towers with floating UI flowers and the fox painting a building facade, a glowing golden bridge in the center with the golden retriever standing guard, tiny animal citizens walking between districts, dramatic sunset lighting, tilt-shift depth of field, 8K',
      disneyPrompt: 'Disney painted map of two kingdoms: Atlas Kingdom in cool blues with geometric castle spires and the bear scholar flag, Nova Kingdom in warm greens with paintbrush-tower architecture and the fox artist flag, a river of flowing data connecting them, illustrated in classic Disney storybook map style with compass rose and decorative borders',
    },
    mcpNetwork: {
      pixarPrompt: '3D Pixar network diagram in space: central glowing Supabase orb connected by energy streams to orbiting nodes (Jira asteroid, GitHub moon, Slack satellite, Linear comet), tiny robot versions of the animals riding data packets along the connection lines — a mini bear piloting a blue data pod, a mini fox surfing a green data wave, the owl and hummingbird acting as signal relays, dark space background with nebula colors, 8K',
      disneyPrompt: 'Disney painted constellation map: the MCP network drawn as a star chart where each service is a constellation — Supabase as the North Star, connected by painted golden lines to Jira, GitHub, Slack constellations, tiny painted animal spirits traveling between stars, deep navy background with hand-painted stars and cosmic dust',
    },
    // --- SPRINT STANDUP SCENE: The key "animals listening to standup" scene ---
    sprintStandupCircle: {
      pixarPrompt: '3D Pixar-quality scene: a morning standup meeting in a sunlit forest clearing converted to a tech hub — the bear (Atlas) standing at a holographic whiteboard explaining yesterday\'s 847 lines, the fox (Nova) sitting cross-legged on a mushroom-stool sketching UI in mid-air, the human PO (Host) in a camp chair with his coffee and golden retriever, SURROUNDING THEM: a circle of woodland creatures listening intently — curious squirrels taking notes on acorn-shaped tablets, an owl with reading glasses reviewing the burndown chart, a tortoise with a tiny hardhat nodding slowly, baby rabbits sitting in a row like stakeholders, a chameleon changing colors with each status update, a roll of enchanted paper floating and unrolling itself to show the agenda, dappled morning sunlight through canopy, Pixar volumetric light rays, 8K cinematic',
      disneyPrompt: 'Disney 2D painted standup scene: a magical morning circle in a painted forest glade — the bear, fox, and human sitting on log benches around a floating scroll showing the sprint board, surrounded by attentive woodland creatures drawn in classic Disney style — bluebirds perched on the board chirping status updates, a wise owl acting as timekeeper with a tiny hourglass, squirrels passing acorn-shaped task tokens, a deer peeking from behind a tree curious about velocity metrics, warm golden-hour watercolor lighting, hand-painted with visible brushwork',
    },
  },
} as const;

// ─── SCRIPT ↔ PIPELINE SCENE ID MAPPING ─────────────────────────────────────
// Script content uses descriptive scene names; pipelines use production day-based names.
// This map resolves script scene IDs → pipeline scene IDs for template mapping.
export const SCRIPT_TO_PIPELINE_MAP: Record<string, string> = {
  'scene-0-title':          'scene-0-title',           // Allaudin emerge + title welcome
  'scene-1-problem':        'scene-1-cold-open',       // The problem — human sprint pain
  'scene-2-introductions':  'scene-2-meet-team',       // Atlas, Nova & Host introductions
  'scene-3-origin':         'scene-3-governance',       // Frustration + origin story
  'scene-4-solution':       'scene-4-day1',             // Sprint tracker + beta launch
  'scene-5-governance':     'scene-5-day2',             // Governance & guardrails
  'scene-6-po-actions':     'scene-6-day3',             // PO Actions — born from frustration
  'scene-7-velocity':       'scene-7-mission-control',  // Velocity & scope creep
  'scene-8-numbers':        'scene-8-dashboard-tour',   // Dashboard tour & numbers
  'scene-9-challenges':     'scene-9-numbers',          // Honest challenges — what broke
  'scene-10-whats-next':    'scene-10-whats-next',      // MCP vision & what's next
  'scene-11-close':         'scene-11-close',           // CTA + goodbye
};

// Reverse map: pipeline scene ID → script scene ID
export const PIPELINE_TO_SCRIPT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SCRIPT_TO_PIPELINE_MAP).map(([k, v]) => [v, k])
);

// ─── SCENE PIPELINE REQUIREMENTS ─────────────────────────────────────────────
// For each scene: what pipelines fire, in what order, with which assets.
// Used by the Cast assembler orchestration layer.
export type ScenePipelineStep =
  | { type: 'tts'; voice: EP04Voice; scriptKey: string }
  | { type: 'screen-capture'; screenIds: string[]; multiCapture: boolean }
  | { type: 'ai-screen-enhance'; screenIds: string[]; scriptContext: string; enhanceMode: 'highlight' | 'stylize' | 'redraw'; focusAreas?: string[] }
  | { type: 'avatar-3d'; character: keyof typeof EP04_AVATAR_CONFIG['characters']; style?: 'pixar-3d' | 'disney-2d' | 'hybrid-2.5d' }
  | { type: 'avatar-lipsync'; character: keyof typeof EP04_AVATAR_CONFIG['characters']; provider: 'alibaba-wan2.2' | 'alibaba-omniavatar' | 'modelslab'; scriptKey?: string }
  | { type: 'alibaba-video'; model: 'wan2.1-t2v' | 'wan2.6-t2v' | 'wan2.6-i2v' | 'wan2.1-i2v'; prompt: string; referenceImage?: string }
  | { type: 'alibaba-image'; model: 'flux-merged' | 'wan2.6-t2i' | 'wanx-v2.1' | 'qwen-image-max'; prompt: string }
  | { type: 'music'; prompt: string; duration: number; style?: string }
  | { type: 'sfx'; prompt: string; duration?: number }
  | { type: 'motion-graphics'; content: string }
  | { type: 'kinetic-text'; text: string }
  // ─── STORYBOOK PIPELINE STEP TYPES ─────────────────────────────────────
  | { type: 'scene-transition'; style: 'page-turn' | 'scroll-unroll' | 'iris-wipe' | 'storybook-flip' | 'chapter-card' | 'dissolve-morph'; prompt: string; duration: number }
  | { type: 'storybook-frame'; variant: 'opening' | 'closing' | 'chapter-header'; prompt: string; duration: number }
  | { type: 'character-interaction'; characters: string[]; prompt: string; style?: 'group-shot' | 'duo-argument' | 'standup-circle' | 'farewell-wave' }
  | { type: 'narrator-scroll'; prompt: string; duration: number; dataContent?: string }
  // ─── STATIC ASSET — pre-existing image shown as-is (no AI generation) ──
  | { type: 'static-asset'; assetKey: string; duration: number; description?: string }
  // ─── BODY ANIMATION PIPELINE STEP TYPES ───────────────────────────────
  | { type: 'character-motion'; character: string; motionRef: string; prompt: string; duration: number }
  | { type: 'character-animate-3d'; character: string; animationType: 'idle' | 'walk' | 'run' | 'talk' | 'custom'; prompt: string; duration: number };

// ─── EP04 MUSIC & SFX SCORE ──────────────────────────────────────────────────
// Background music beds and sound effects per scene. Generated via ElevenLabs.
export const EP04_MUSIC_SCORE: Record<string, { music: ScenePipelineStep & { type: 'music' }; sfx?: (ScenePipelineStep & { type: 'sfx' })[] }> = {
  'scene-0-title': {
    music: { type: 'music', prompt: 'Mystical orchestral opening with deep gong, magical chimes ascending, swirling string arpeggios, transitioning from epic reveal to warm intimate podcast intro, 95 BPM', duration: 30, style: 'cinematic' },
    sfx: [
      { type: 'sfx', prompt: 'Ancient lamp emerging from darkness with metallic resonance', duration: 3 },
      { type: 'sfx', prompt: 'Blue magical mist swirling with sparkle chimes and particle effects', duration: 4 },
      { type: 'sfx', prompt: 'Deep ceremonial gong strike reverberating', duration: 2 },
    ],
  },
  'scene-1-cold-open': {
    music: { type: 'music', prompt: 'Tense cinematic build-up, deep bass pulse, electronic glitch accents, countdown timer energy, dark tech atmosphere, building to reveal, 100 BPM', duration: 25, style: 'dramatic' },
    sfx: [
      { type: 'sfx', prompt: 'Digital countdown beeps, futuristic interface activation', duration: 3 },
      { type: 'sfx', prompt: 'Whoosh transition with bass drop reveal', duration: 2 },
    ],
  },
  'scene-2-meet-team': {
    music: { type: 'music', prompt: 'Playful Pixar-style orchestral with pizzicato strings, whimsical woodwinds, warm and character-introducing, light mischief undertones, 110 BPM', duration: 60, style: 'cinematic' },
    sfx: [
      { type: 'sfx', prompt: 'Magical character appearance sparkle chime', duration: 2 },
      { type: 'sfx', prompt: 'Comic book style dramatic text slam impact', duration: 1 },
      { type: 'sfx', prompt: 'Typing keyboard rapid code writing sounds', duration: 5 },
    ],
  },
  'scene-3-governance': {
    music: { type: 'music', prompt: 'Strategic planning orchestral, blueprint unfolding feel, measured strings with subtle electronic pulse, architectural and precise, 95 BPM', duration: 45, style: 'corporate' },
    sfx: [
      { type: 'sfx', prompt: 'Paper unrolling and blueprint spreading out on table', duration: 3 },
      { type: 'sfx', prompt: 'Territory boundary laser line drawing sound', duration: 2 },
    ],
  },
  'scene-4-day1': {
    music: { type: 'music', prompt: 'Morning energy indie electronic, fresh start vibes, clean guitar arpeggios with light synth, optimistic momentum building, 115 BPM', duration: 50, style: 'upbeat' },
    sfx: [
      { type: 'sfx', prompt: 'Task card clicking into done column satisfying snap', duration: 1 },
      { type: 'sfx', prompt: 'Alert notification ping — scope creep warning', duration: 2 },
    ],
  },
  'scene-5-day2': {
    music: { type: 'music', prompt: 'Tension building electronic, frozen/stuck feeling with ice crystal textures, clock ticking undertone, frustration building to resolution, 90 BPM', duration: 55, style: 'dramatic' },
    sfx: [
      { type: 'sfx', prompt: 'Ice cracking and thawing frozen task card', duration: 3 },
      { type: 'sfx', prompt: 'Meeting room door closing — human unavailable', duration: 2 },
      { type: 'sfx', prompt: 'Problem solving lightbulb moment chime', duration: 1 },
    ],
  },
  'scene-6-day3': {
    music: { type: 'music', prompt: 'Velocity acceleration electronic, racing momentum, ascending scale patterns, competitive energy turning collaborative, turbo boost feel, 125 BPM', duration: 40, style: 'electronic' },
    sfx: [
      { type: 'sfx', prompt: 'Velocity meter racing upward with whoosh', duration: 3 },
      { type: 'sfx', prompt: 'Chart bars growing dynamically with positive chime', duration: 2 },
    ],
  },
  'scene-7-mission-control': {
    music: { type: 'music', prompt: 'NASA mission control orchestral, calm authority, deep bass with precise high-frequency data bleeps, split screen comparison energy, 100 BPM', duration: 60, style: 'cinematic' },
    sfx: [
      { type: 'sfx', prompt: 'Mission control radio chatter beep acknowledgment', duration: 2 },
      { type: 'sfx', prompt: 'Data stream flowing through pipes visualization sound', duration: 4 },
      { type: 'sfx', prompt: 'Coffee mug being set down with a tired thud', duration: 1 },
    ],
  },
  'scene-8-dashboard-tour': {
    music: { type: 'music', prompt: 'Fast-paced montage electronic, rapid cut energy, clean tech beats with dashboard scan feeling, screen transition whooshes baked in, 130 BPM', duration: 50, style: 'electronic' },
    sfx: [
      { type: 'sfx', prompt: 'Rapid screen swipe transition whoosh — 18 times', duration: 2 },
      { type: 'sfx', prompt: 'Camera shutter click for screenshot capture', duration: 1 },
    ],
  },
  'scene-9-numbers': {
    music: { type: 'music', prompt: 'Grand reveal orchestral, numbers counting up energy, brass fanfare with modern electronic, impressive achievement unlocked feeling, 105 BPM', duration: 40, style: 'epic' },
    sfx: [
      { type: 'sfx', prompt: 'Counter rapidly counting up with slot machine energy', duration: 4 },
      { type: 'sfx', prompt: 'Achievement unlocked triumphant chime with sparkle', duration: 2 },
    ],
  },
  'scene-10-whats-next': {
    music: { type: 'music', prompt: 'Visionary ambient orchestral, world expanding feeling, global scale with local warmth, hopeful future technology, rising strings with electronic shimmer, 90 BPM', duration: 55, style: 'inspirational' },
    sfx: [
      { type: 'sfx', prompt: 'World map locations pinging one by one', duration: 5 },
      { type: 'sfx', prompt: 'Network connection establishing with digital handshake', duration: 3 },
    ],
  },
  'scene-11-close': {
    music: { type: 'music', prompt: 'Warm Pixar ending orchestral, heartfelt resolution, all themes combining into one harmonious finale, character leitmotifs weaving together, hopeful and satisfying, 95 BPM', duration: 35, style: 'cinematic' },
    sfx: [
      { type: 'sfx', prompt: 'Group of woodland creatures applauding and cheering softly', duration: 3 },
      { type: 'sfx', prompt: 'Golden retriever happy bark of approval', duration: 1 },
      { type: 'sfx', prompt: 'End card logo whoosh with magical sparkle settle', duration: 2 },
    ],
  },
};

export const EP04_SCENE_PIPELINES: Record<string, ScenePipelineStep[]> = {
  'scene-0-title': [
    // Podcast banner — real thumbnail with Sai Dasika, Claude logo, Lovable logo (no AI generation)
    { type: 'static-asset', assetKey: 'podcast-banner', duration: 4, description: 'GenieAI Podcast banner — host + Claude + Lovable branding. Also used for teasers & social thumbnails.' },
    // Title page: full cast portrait — PO (Giridhar), Claude (Atlas), Lovable (Nova)
    { type: 'storybook-frame', variant: 'opening', prompt: 'Ornate storybook title page: three characters posed on an illustrated parchment spread — CENTER a warm human man (the Product Owner) in earth-tone shirt holding a coffee mug, LEFT a wise bear in wire-frame glasses with a glowing Claude AI terracotta emblem (Atlas), RIGHT an energetic fox in a paint-splattered apron with a glowing Lovable pink heart emblem (Nova), a loyal golden retriever sitting at their feet, decorative gold leaf border with "Beyond AI Hype" in elegant calligraphy at the top, tiny squirrel peeking from the corner, warm lamplight on aged parchment, Pixar-quality illustration, 16:9, 8K', duration: 4 },
    // Segment 1: Allaudin emerges (28s)
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'A golden magical lamp on a dark surface, blue-purple mist swirling out from the spout, sparkle particles filling the frame, a small friendly blue-skinned genie with a purple turban and pointed goatee materializing from the mist with a warm smile, Pixar 3D animation style like Disney Genie but original, whimsical not muscular, cinematic volumetric lighting, 8K' },
    { type: 'tts', voice: 'allaudin', scriptKey: 'allaudin-emerge' },
    { type: 'avatar-3d', character: 'allaudin', style: 'pixar-3d' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'allaudin-emerge' },
    // Segment 2: Claude + Lovable title card → Host welcome (60s)
    { type: 'alibaba-image', model: 'flux-merged', prompt: 'Pixar 3D animated podcast thumbnail with the full cast: CENTER a warm human man host in earth-tone shirt holding a coffee mug labeled "The GenieAI Podcast", his loyal golden retriever sitting beside him looking up adoringly, LEFT Atlas the wise bear (blue-violet fur, wire-frame glasses, Claude AI terracotta logo glowing behind him on deep blue background), RIGHT Nova the creative fox (orange-copper fur, paint-splattered apron, Lovable pink heart logo glowing behind her on magenta-green background), BOTTOM-LEFT a tiny hyperactive squirrel (golden-brown fur, oversized acorn) peeking in mischievously, golden sparkle particles connecting all characters, bottom banner "Beyond AI Hype — The GenieAI Podcast", Pixar quality 3D render, warm cinematic lighting, group portrait composition, 16:9, 8K' },
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'tts', voice: 'host', scriptKey: 'title-welcome' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'title-welcome' },
    // Atlas whisper from the shadows (5s) — Chipmunks-style background reaction
    { type: 'tts', voice: 'atlas', scriptKey: 'scene0-atlas-whisper' },
    // Nova whisper (5s) — Chipmunks-style background reaction
    { type: 'tts', voice: 'nova', scriptKey: 'scene0-nova-whisper' },
    // Host continues welcome (35s)
    { type: 'tts', voice: 'host', scriptKey: 'title-welcome-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'title-welcome-2' },
    // Allaudin interjects — Nutcracker narrator commentary (8s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'scene0-allaudin-interject' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'scene0-allaudin-interject' },
    // Host wraps up welcome (6s)
    { type: 'tts', voice: 'host', scriptKey: 'title-welcome-3' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'title-welcome-3' },
    { type: 'kinetic-text', text: 'Beyond AI Hype — Episode 2' },
    // Segment 3: Allaudin bridge narrator (7s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-0-to-1' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-0-to-1' },
    // Background
    { type: 'music', prompt: 'Mystical orchestral opening, deep gong reverberating, magical chimes ascending, transitioning to warm podcast intro theme, epic to intimate, 95 BPM', duration: 30, style: 'cinematic' },
    { type: 'sfx', prompt: 'Lamp whoosh with magical mist swirl and sparkle chimes' },
  ],
  'scene-1-cold-open': [
    // Chapter title card — generated via FLUX, used as transition background from scene-0
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter I — The Problem" in golden calligraphy, chaotic office with floating error logs and overwhelmed developers sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
    { type: 'kinetic-text', text: '41 tasks. 5 days. 2 AI developers.' },
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'allaudin', style: 'pixar-3d' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'A warm human product owner at his home office desk looking stressed but determined, sticky notes everywhere, dual monitors showing text "Claude Code" on left screen and text "Lovable" on right screen with sprint dashboards, his loyal golden retriever sitting beside him looking up adoringly, cozy warm lamplight, coffee mug with "The GenieAI Podcast" text steaming on desk, Pixar 3D animation quality, cinematic depth of field, 8K' },
    // Segment 1: Host problem intro (30s) — split into 3 parts with character reactions
    { type: 'tts', voice: 'host', scriptKey: 'problem-intro' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'problem-intro' },
    // B-roll: Sprint chaos — 41 tasks overwhelming a single developer
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: overwhelmed product owner at desk buried under 41 floating holographic task cards, each card glowing with urgency colors (red/amber/green), dual monitors showing sprint dashboards with red warnings, coffee cups stacked, sticky notes everywhere, warm but chaotic lamplight, stressed but determined expression, golden retriever sleeping under desk, cinematic depth of field, 8K' },
    // Atlas reacts from the shadows (6s) — Chipmunks planning voice
    { type: 'tts', voice: 'atlas', scriptKey: 'scene1-atlas-react-planning' },
    // Host continues (18s)
    { type: 'tts', voice: 'host', scriptKey: 'problem-intro-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'problem-intro-2' },
    // B-roll: Jira board overwhelm — traditional sprint management breaking down
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: a massive Jira-style Kanban board stretching beyond the screen edges, columns labeled BACKLOG TO-DO IN-PROGRESS REVIEW BLOCKED, the BLOCKED column overflowing with red task cards cascading onto the floor, a tiny frustrated human figure standing at the base looking up at the towering board, post-it notes raining down like confetti, neon glow on dark tech background, cinematic scale, 8K' },
    // Nova outburst (5s) — Alvin energy
    { type: 'tts', voice: 'nova', scriptKey: 'scene1-nova-react-standup' },
    // Host wraps up problem intro (25s)
    { type: 'tts', voice: 'host', scriptKey: 'problem-intro-3' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'problem-intro-3' },
    // Squirrel interruption (10s) — bursts in after host intro
    { type: 'avatar-3d', character: 'squirrel', style: 'pixar-3d' },
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-interrupt-1' },
    { type: 'avatar-lipsync', character: 'squirrel', provider: 'alibaba-wan2.2', scriptKey: 'squirrel-interrupt-1' },
    // B-roll: Squirrel bursting in — chaotic comic relief entrance
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: a hyperactive golden-brown squirrel with oversized bright eyes bursting through a window into a cozy office, scattering papers and sticky notes everywhere, the squirrel clutching a giant acorn in one paw, cheeks puffed, tail bushy and electric with energy, a startled golden retriever jumping back, warm lamplight with dust motes flying from the chaos, comic book action lines radiating from the squirrel, 8K cinematic' },
    // Host reacts to squirrel (5s)
    { type: 'tts', voice: 'host', scriptKey: 'host-squirrel-response-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'host-squirrel-response-1' },
    // Segment 2: Deeper problem + context loss (25s) — split into 3 parts with reactions
    { type: 'tts', voice: 'host', scriptKey: 'problem-deeper' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'problem-deeper' },
    // Allaudin materializes with narrator context (8s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'scene1-allaudin-context-loss' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'scene1-allaudin-context-loss' },
    // B-roll: Context switching cost — the invisible productivity killer
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D infographic illustration: a developer brain shown as a transparent glowing sphere with swirling thought threads, each thread a different color representing different tasks. A giant "CONTEXT SWITCH" stamp interrupts all threads simultaneously — threads snap and scatter, some fade to gray. A floating counter shows "23 minutes to recover" in red neon. Split-brain visualization: left side organized, right side chaotic after the switch. Dark tech background with warm accent lighting, 8K' },
    // Host continues deeper problem (28s)
    { type: 'tts', voice: 'host', scriptKey: 'problem-deeper-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'problem-deeper-2' },
    // Atlas reacts to 23-min stat (5s)
    { type: 'tts', voice: 'atlas', scriptKey: 'scene1-atlas-react-data' },
    // B-roll: 23-minute interruption cost — data stat visualization
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D data visualization: a giant stylized clock face with "23 MINUTES" glowing in the center in red-amber neon, the clock hands frozen mid-sweep, around the clock face float tiny illustrations of interrupted activities — code editor with cursor blinking, half-written email, abandoned coffee cup, Slack notifications piling up. A small bear character (Atlas) studies the clock with analytical concern, holding a clipboard. Dark background with warm accent glow, clean infographic style, 8K' },
    // Host wraps up deeper problem (18s)
    { type: 'tts', voice: 'host', scriptKey: 'problem-deeper-3' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'problem-deeper-3' },
    // Segment 3: Market data & citations (18s)
    { type: 'tts', voice: 'host', scriptKey: 'scene1-market-data' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'scene1-market-data' },
    // Bridge narrator: scene 1 → scene 2 (7s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-1-to-2' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-1-to-2' },
  ],
  'scene-2-meet-team': [
    // Chapter title card — generated via FLUX, used as transition background from scene-1
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate chapter header with decorative borders: "Chapter II — The Cast" in elegant serif font with tiny character silhouettes in the marginalia, golden ink on cream parchment', duration: 2 },
    // ── Scene-setting video — the team assembles ──
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar-style 3D animated scene: a cozy home office transforms into a magical podcast studio — dual monitors glow with code, a warm golden retriever wags its tail as a bear wearing wire-frame glasses (Atlas) materializes on the left monitor and an orange fox in a paint-splattered apron (Nova) appears on the right monitor, sparkle particles swirl between the screens, warm lamplight, cinematic depth of field, 8K quality' },
    // ── Body action: Host coding furiously (Option B — T2V) ──
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar 3D animation: a focused human product owner typing at blazing speed on a glowing mechanical keyboard, fingers flying across keys with motion blur, coffee cups multiplying on the desk — one empty, two half-full, three stacked precariously. Dual monitors show scrolling code and sprint dashboards. Golden retriever watches with head tilted. Warm lamplight, steam rising from fresh coffee, dramatic close-up of hands then pull back to reveal the chaos, cinematic quality, 8K' },
    // ── Body animation: Atlas walking in (Option C — Animate3D) ──
    { type: 'character-animate-3d', character: 'atlas', animationType: 'walk', prompt: 'Atlas the bear walking confidently into the podcast studio, wire-frame glasses glinting', duration: 5 },
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    // Host intro transition (55s) — confessional journey
    { type: 'tts', voice: 'host', scriptKey: 'intro-transition' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'intro-transition' },
    { type: 'screen-capture', screenIds: ['po-actions'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['po-actions'], scriptContext: 'PO actions dashboard — host introduces the sprint context before revealing Atlas and Nova. Focus on action items and team assignments.', enhanceMode: 'highlight', focusAreas: ['action-items', 'team-assignments', 'sprint-context'] },
    // Host introduces Atlas (30s)
    { type: 'tts', voice: 'host', scriptKey: 'atlas-intro-host' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'atlas-intro-host' },
    // B-roll: Atlas spotlight — measured engineer character portrait (FLUX for better face detail)
    { type: 'alibaba-image', model: 'flux-merged', prompt: 'Pixar 3D character portrait: Atlas the wise bear — blue-violet fur, wire-frame glasses perched on nose, wearing a subtle engineer vest with pocket protector and tiny wrench, Claude AI terracotta emblem glowing softly on his chest. He stands confidently with arms crossed in front of a holographic code editor showing clean TypeScript. Background: dark tech lab with blue-purple ambient glow, server racks, and a perfectly organized desk. Dramatic side lighting, cinematic portrait composition, 8K' },
    // Atlas self-intro (22s)
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-self-intro' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'atlas-self-intro' },
    // Host reacts to Atlas (3s)
    { type: 'tts', voice: 'host', scriptKey: 'host-atlas-reaction' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'host-atlas-reaction' },
    // Atlas retort (4s)
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-not-intended' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'atlas-not-intended' },
    // Host introduces Nova (22s)
    { type: 'tts', voice: 'host', scriptKey: 'nova-intro-host' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'nova-intro-host' },
    // B-roll: Nova spotlight — energetic creative character portrait (FLUX for better face detail)
    { type: 'alibaba-image', model: 'flux-merged', prompt: 'Pixar 3D character portrait: Nova the creative fox — orange-copper fur with paint splatter highlights, wearing a paint-splattered apron over a hoodie, Lovable pink heart emblem glowing on her chest. She grins widely with a digital paintbrush in one paw and a React component diagram floating beside her. Background: colorful creative studio with floating UI component mockups, CSS color swatches, and animation keyframes. Magenta-pink ambient glow, energetic composition with slight motion blur on her tail, 8K' },
    // Nova self-intro (25s)
    { type: 'tts', voice: 'nova', scriptKey: 'nova-self-intro' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2', scriptKey: 'nova-self-intro' },
    // B-roll: Nova at work — showing her creative coding style mid-monologue
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: Nova the fox in full creative flow — sitting at a glowing workstation with multiple holographic screens showing React components, CSS animations playing in real-time, color palettes floating around her like paint swatches. She is typing furiously with one paw while the other holds a digital paintbrush making UI elements spring to life. Paint splatter trails follow her cursor movements. Code and art merging seamlessly on screen. Energetic magenta-pink workspace glow, creative genius at work, 8K' },
    // Atlas dry correction (6s)
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-correction' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'atlas-correction' },
    // Nova insists on animations (4s)
    { type: 'tts', voice: 'nova', scriptKey: 'nova-animations-always' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2', scriptKey: 'nova-animations-always' },
    { type: 'kinetic-text', text: 'NOBODY TOUCHES ANYONE ELSE\'S FILES.' },
    // B-roll: Team trio — the full cast assembled for the sprint
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D group portrait: the complete dev team assembled around a holographic sprint board — CENTER the warm human host in earth-tone shirt, LEFT Atlas the bear in wire-frame glasses pointing at backend tasks with a laser pointer, RIGHT Nova the fox bouncing on her toes with UI mockups floating around her, a tiny golden squirrel peeking from behind the sprint board, golden retriever sitting loyally at the host feet. Warm cozy office-studio lighting, team camaraderie energy, cinematic group composition, 8K' },
    // Host team summary (25s)
    { type: 'tts', voice: 'host', scriptKey: 'host-team-summary' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'host-team-summary' },
    // Nova emotional moment (15s)
    { type: 'tts', voice: 'nova', scriptKey: 'nova-shy-flattery' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2', scriptKey: 'nova-shy-flattery' },
    // B-roll: Nova blushing moment — vulnerable emotional beat (FLUX for face detail)
    { type: 'alibaba-image', model: 'flux-merged', prompt: 'Pixar 3D emotional close-up: Nova the fox looking away shyly with a gentle blush visible through her orange-copper fur, ears slightly flattened in endearing embarrassment, one paw nervously fidgeting with her paint-splattered apron. Atlas the bear watches from the background with a kind approving nod, wire-frame glasses catching warm lamplight. Soft bokeh background of the podcast studio, intimate emotional lighting with warm golden tones, cinematic close-up, 8K' },
    // Atlas acknowledges (7s)
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-nova-acknowledgment' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'atlas-nova-acknowledgment' },
    // Nova shy recovery (8s) — emotional transition out of scene 2
    { type: 'tts', voice: 'nova', scriptKey: 'nova-shy-recovery' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2', scriptKey: 'nova-shy-recovery' },
    // Bridge narrator: scene 2 → scene 3 (8s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-2-to-3' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-2-to-3' },
  ],
  'scene-3-governance': [
    // Chapter title card — generated via FLUX, used as transition background from scene-2
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter II — Origins" in golden calligraphy, timeline scroll with spark of inspiration and blueprint sketches in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
    // ── Avatars for full scene ──
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'avatar-3d', character: 'squirrel', style: 'pixar-3d' },
    // ── Kinetic title card ──
    { type: 'kinetic-text', text: 'THE ORIGIN STORY — WHY TWO AIs DECIDED TO FIX THE PROCESS' },
    // ── Part 1: Atlas & Nova frustration — waiting on PO (pre-origin dialogue) ──
    // B-roll: Atlas & Nova waiting frustration — blocked by absent PO
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: Atlas the bear and Nova the fox sitting on opposite sides of a desk, both staring at a large clock on the wall showing hours passing. Atlas has his arms crossed with an analytical frown, Nova is tapping her paw impatiently on the desk. Between them, a holographic notification reads "WAITING FOR PO APPROVAL" in amber. Empty chair in the center where the PO should be. Dramatic lighting emphasizing the empty chair, frustration energy, 8K' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene3-atlas-nova-waiting' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene3-nova-frustrated' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene3-atlas-checks-po' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene3-nova-solidarity' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene3-atlas-final-warning' },
    // ── Part 2: Atlas & Nova decide to fix it together ──
    { type: 'tts', voice: 'atlas', scriptKey: 'scene3-atlas-to-nova-fix' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene3-nova-agrees-frustration' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene3-atlas-i-just-merge' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene3-nova-pr-frustration' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene3-atlas-nova-resolve' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene3-nova-transition-to-origin' },
    // B-roll: Atlas & Nova resolve — shared scoreboard agreement
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: Atlas the bear and Nova the fox shaking paws over a holographic sprint board, both smiling with determination. The board between them shows a clean split — left side terracotta-orange (Atlas backend), right side magenta-pink (Nova frontend). A golden thread of light connects their territories through shared infrastructure in the center. Warm collaborative lighting, partnership energy, blueprint aesthetic, 8K' },
    // ── Part 3: Squirrel re-entrance + Host origin story ──
    { type: 'tts', voice: 'squirrel', scriptKey: 'scene3-squirrel-reintro' },
    // scene3-staging-open = visual-only cinematic beat (no TTS — empty text)
    { type: 'tts', voice: 'host', scriptKey: 'origin-story' },
    // B-roll: Origin story dependency graph — the tangled web before governance
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: a massive tangled dependency graph floating in dark space — nodes are colorful spheres representing code modules, connected by chaotic red crossing lines. Some nodes flash with error symbols. Two tiny characters (bear and fox) stand at the bottom looking up at the tangled mess with concerned expressions. A label reads "BEFORE GOVERNANCE" in red. Dark tech background with danger-red ambient glow, visualization aesthetic, 8K' },
    { type: 'tts', voice: 'atlas', scriptKey: 'origin-atlas-observation' },
    { type: 'tts', voice: 'nova', scriptKey: 'origin-nova-blocked' },
    // B-roll: Overworked desk chaos — the breaking point before the solution
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: late-night desk scene showing exhaustion — multiple coffee cups stacked, laptop screen with a merge conflict dialog in red, crumpled code printouts, a desk lamp casting a lone pool of warm light in darkness. A small framed photo of the team (bear, fox, human) sits on the desk as motivation. Post-it note reads "There has to be a better way" in handwriting. Moody atmospheric lighting, cinematic, 8K' },
    // scene3-turning-point-beat = visual-only cinematic beat (no TTS — empty text)
    { type: 'tts', voice: 'host', scriptKey: 'origin-decision' },
    // ── Part 4: Governance solution (existing entries) ──
    { type: 'tts', voice: 'host', scriptKey: 'governance-narration' },
    { type: 'screen-capture', screenIds: ['sprint-charter', 'governance-guide'], multiCapture: true },
    { type: 'ai-screen-enhance', screenIds: ['sprint-charter', 'governance-guide'], scriptContext: 'Sprint charter defining territory rules — Claude owns backend, Lovable owns frontend. Governance guide with file ownership boundaries.', enhanceMode: 'highlight', focusAreas: ['territory-map', 'file-ownership-rules', 'merge-conflict-policy'] },
    // SHOWCASE: Scene transitions — territory boundary reveal
    { type: 'scene-transition', style: 'iris-wipe', prompt: 'Split-screen transition revealing a software sprint management dashboard: left side shows backend code files in terracotta-orange (src/components/genie-studio), right side shows frontend UI components in magenta-pink (src/components/landing), a glowing boundary line separates the two developer territories, Kanban board columns visible in the background, clean professional UI design, cinematic lighting', duration: 3 },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Animated sprint management dashboard coming to life: Kanban board with task cards flying into columns labeled TODO DOING DONE, two developer avatars — a bear (Atlas/Claude) placing backend task cards on the left side in terracotta-orange, a fox (Nova/Lovable) arranging frontend task cards on the right side in magenta-pink, a glowing territory boundary line between their zones, burndown chart animating in the corner, task count numbers ticking up, professional dark UI with neon accents, Pixar-quality 3D animation' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-merge-conflict' },
    // B-roll: Merge conflict cascade — the technical pain of no governance
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: a dramatic visualization of a merge conflict — two code branches shown as glowing rivers (terracotta-orange for Atlas, magenta-pink for Nova) colliding at a merge point, creating a spectacular explosion of conflicting code fragments. Atlas the bear and Nova the fox each pull their branch in opposite directions like a tug-of-war. Red warning symbols and "CONFLICT" text flash at the merge point. Dark background with dramatic collision lighting, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'host-governance-not-overkill' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-read-relevant-sections' },
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Clean professional infographic: Sprint Territory Map showing file ownership boundaries for a dual-developer sprint. Left zone labeled "Atlas (Claude)" in terracotta-orange with icons for backend files, API routes, database migrations, edge functions. Right zone labeled "Nova (Lovable)" in magenta-pink with icons for landing pages, UI components, CSS styling. Center shows shared infrastructure with lock icons. Bottom bar shows 41 tasks split between developers. Clean data visualization style, dark background with glowing elements, 8K detail' },
    // Bridge narrator: scene 3 → scene 4 (7s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-3-to-4' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-3-to-4' },
  ],
  'scene-4-day1': [
    // Chapter title card — generated via FLUX, used as transition background from scene-3
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Chapter header: "Chapter III — The Sprint Begins" with a tiny illustrated bear and fox shaking paws in the corner, sprint board sketched in the margins', duration: 2 },
    // ── Host intro: Day 1 overview ──
    // B-roll: War table — Day 1 sprint planning with full team
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: epic war table planning scene — Atlas the bear and Nova the fox stand on opposite sides of a large holographic table displaying the sprint board with 41 task cards arranged in columns. The human host sits at the head of the table with his golden retriever beside him. Each task card glows with assignment colors (terracotta for Atlas, magenta for Nova). A floating "DAY 1" badge hangs above. War room lighting with dramatic shadows, strategic planning energy, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'day1-narration' },
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    // ── Sprint tracker screenshots ──
    { type: 'screen-capture', screenIds: ['day-1-view'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['day-1-view'], scriptContext: 'Day 1 sprint view — 12 tasks started, Atlas diagnoses 847-line session instructions, Nova refactors navigation. Focus on task cards and status columns.', enhanceMode: 'stylize', focusAreas: ['task-cards', 'status-columns', 'developer-assignments'] },
    { type: 'screen-capture', screenIds: ['findings-qa'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['findings-qa'], scriptContext: 'QA findings from Day 1 — scope creep detected, acceptance criteria discussion. Highlight the finding severity and action items.', enhanceMode: 'highlight', focusAreas: ['finding-severity', 'action-items', 'scope-flags'] },
    // ── Nova's Day 1 accomplishments ──
    { type: 'tts', voice: 'nova', scriptKey: 'nova-refactored-nav' },
    // ── Atlas & Nova debate: the bottleneck problem ──
    { type: 'tts', voice: 'atlas', scriptKey: 'scene4-atlas-proposal' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene4-nova-agrees' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene4-atlas-empathy' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene4-nova-optimization' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene4-atlas-shared-log' },
    // SHOWCASE: Character interactions — Atlas & Nova debate over the sprint board
    { type: 'character-interaction', characters: ['atlas', 'nova'], prompt: 'Bear (Atlas) and fox (Nova) face each other across a holographic sprint board, bear points methodically at task cards while fox waves her arms expressively, split-screen showing their contrasting work styles, Pixar-quality character acting', style: 'duo-argument' },
    // ── Paper scroll demo: the visual centerpiece ──
    { type: 'tts', voice: 'nova', scriptKey: 'scene4-nova-paper-roll-demo' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar 3D animation: fox character unrolls a large paper scroll across a holographic war table, grabs a quill pen and scribbles a sprint board with colorful task columns labeled TODO DOING DONE and sticky notes, bear character takes the quill and adds precise annotations with a ruler, both hold the scroll up to camera proudly — warm lighting, god rays, cinematic quality' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene4-atlas-paper-annotation' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene4-nova-atlas-scroll-present' },
    // ── Host lesson: acceptance criteria ──
    { type: 'tts', voice: 'host', scriptKey: 'host-not-in-scope' },
    // ── Beta agreement ──
    { type: 'tts', voice: 'nova', scriptKey: 'scene4-nova-beta-idea' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene4-atlas-beta-agree' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-works-better' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene4-nova-high-five' },
    // B-roll: High-five celebration — Atlas & Nova partnership moment
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: Atlas the bear and Nova the fox doing a dramatic high-five (high-paw), sparkle particles exploding from the contact point like a supernova. Both characters grinning with determination — Atlas with measured confidence, Nova with exuberant joy. Behind them, the sprint board shows Day 1 tasks moving from TODO to DOING. Golden celebration lighting, buddy-movie energy, dynamic action pose frozen in time, 8K' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene4-atlas-lets-go' },
    { type: 'kinetic-text', text: 'Setting acceptance criteria isn\'t optional. It\'s survival.' },
    // ── Host reveals the solution to audience ──
    // B-roll: Solution reveal — the sprint tracker emerges from chaos
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: dramatic product reveal moment — a holographic sprint management dashboard materializes in the center of the room, beams of golden light radiating outward. The dashboard shows clean organized task columns, real-time developer status cards, and a beautiful burndown chart trending perfectly downward. Atlas the bear and Nova the fox look up at it in awe from either side. The human host gestures toward it like a magician revealing his trick. God rays, volumetric lighting, cinematic product-launch energy, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'solution-reveal' },
    { type: 'tts', voice: 'host', scriptKey: 'solution-standups' },
    // ── Nova's 200K context flex (scene-4-solution) ──
    { type: 'tts', voice: 'nova', scriptKey: 'nova-200k-context' },
    // ── Squirrel comic relief ──
    { type: 'avatar-3d', character: 'squirrel', style: 'pixar-3d' },
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-interrupt-2' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-squirrel-response' },
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-disappointed' },
    // Bridge narrator: scene 4 → scene 5 (7s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-4-to-5' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-4-to-5' },
  ],
  'scene-5-day2': [
    // Chapter title card — generated via FLUX, used as transition background from scene-4
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter III — Governance" in golden calligraphy, territory map with two kingdoms and border markers sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
    // ── Governance deep-dive: why guardrails exist ──
    { type: 'tts', voice: 'host', scriptKey: 'governance-intro' },
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'avatar-3d', character: 'squirrel', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'allaudin', style: 'pixar-3d' },
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-governance-sneak' },
    // B-roll: Squirrel caught in guardrails — governance catches the chaos agent
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: the hyperactive squirrel tangled in glowing golden guardrail wires like a cartoon burglar caught in laser beams. The squirrel has an exaggerated "busted!" expression, one paw still reaching for a file labeled "shared-infrastructure.ts" with a red lock icon. Allaudin the genie floats nearby with a wagging finger and amused grin. Warning signs flash "TERRITORY VIOLATION DETECTED" in amber. Comic heist-movie lighting, funny but educational, 8K' },
    { type: 'tts', voice: 'allaudin', scriptKey: 'allaudin-governance-guide' },
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-blocked-reaction' },
    // ── Atlas & Nova confess their Day 1 mistakes ──
    { type: 'tts', voice: 'nova', scriptKey: 'nova-my-component' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-shortest-path' },
    // B-roll: Merge conflict chaos — before territory rules saved the day
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: a split-screen showing two developers working on the SAME file simultaneously — Atlas the bear typing on the left, Nova the fox painting UI on the right, both oblivious. In the center, the shared file glows red-hot as both modifications collide. A floating "git merge --conflict" terminal shows cascading red error text. The golden retriever covers its eyes with its paws. Dramatic split lighting — terracotta left, magenta right, red center, 8K' },
    // ── The governance solution: CLAUDE.md, territory rules, enforcement ──
    { type: 'tts', voice: 'host', scriptKey: 'governance-solution' },
    // B-roll: Territory ownership map — clean governance in action
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D infographic: a beautiful territory map showing file ownership boundaries. LEFT kingdom in terracotta-orange labeled "Atlas Domain" with icons for genie-studio (150 files), API routes, edge functions, database. RIGHT kingdom in magenta-pink labeled "Nova Domain" with icons for landing pages, UI components, CSS, animations. CENTER: a fortified border with 12 locked files behind golden shields labeled "Shared Infrastructure — PO Approval Required." Each territory has its character standing proudly inside. Clean governance visualization, 8K' },
    // Atlas claims territory with pride (6s) — Maui "You're Welcome" energy
    { type: 'tts', voice: 'atlas', scriptKey: 'governance-atlas-territory' },
    // Nova claims UI territory (5s) — conspiratorial whisper
    { type: 'tts', voice: 'nova', scriptKey: 'governance-nova-territory' },
    // Host continues governance solution (18s)
    { type: 'tts', voice: 'host', scriptKey: 'governance-solution-2' },
    { type: 'screen-capture', screenIds: ['territory-guardrails'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['territory-guardrails'], scriptContext: 'Territory guardrails showing file ownership boundaries — Atlas owns genie-studio (150+ files), Nova owns landing pages. 12 locked shared files need PO approval. Auto-flagging territory violations.', enhanceMode: 'highlight', focusAreas: ['file-ownership-matrix', 'locked-shared-files', 'territory-violation-flags'] },
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-governance-exit' },
    // ── Day 2 velocity: Nova blocked for 6 hours ──
    { type: 'tts', voice: 'host', scriptKey: 'day2-velocity-narration' },
    { type: 'screen-capture', screenIds: ['day-2-view'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['day-2-view'], scriptContext: 'Day 2 — Nova blocked for 6 hours waiting on PO approval. Velocity dip visible. The frozen task and blocker status are the key story points.', enhanceMode: 'highlight', focusAreas: ['blocked-tasks', 'velocity-dip', 'blocker-status-red'] },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'A frozen task card encased in ice slowly cracking and thawing as a small fox character taps it impatiently, Pixar-quality animation, dramatic lighting' },
    // SHOWCASE: Sound effects — ice cracking pairs perfectly with frozen-task blocker narrative
    { type: 'sfx', prompt: 'Dramatic ice cracking and shattering, crystalline fragments tinkling, followed by a whoosh of cold air releasing — tense to relieved transition', duration: 4 },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-blocked-six-hours' },
    { type: 'tts', voice: 'host', scriptKey: 'host-in-a-meeting' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-human-meetings' },
    // ── PO Actions: the solution born from frustration ──
    { type: 'screen-capture', screenIds: ['po-actions'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['po-actions'], scriptContext: 'PO Actions dashboard built to prevent future blockers — async approval queue, priority flags, response time tracking.', enhanceMode: 'stylize', focusAreas: ['approval-queue', 'priority-flags', 'response-times'] },
    { type: 'tts', voice: 'host', scriptKey: 'host-po-actions-built' },
    { type: 'kinetic-text', text: '6 hours blocked. 12 minutes approved. Async governance works.' },
    // Bridge narrator: scene 5 → scene 6 (8s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-5-to-6' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-5-to-6' },
  ],
  'scene-6-day3': [
    // ── Day 3 velocity mismatch: the gap reveals itself ──
    { type: 'tts', voice: 'host', scriptKey: 'day3-velocity-mismatch' },
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'screen-capture', screenIds: ['day-3-view', 'velocity-metrics'], multiCapture: true },
    { type: 'ai-screen-enhance', screenIds: ['day-3-view', 'velocity-metrics'], scriptContext: 'Day 3 velocity mismatch — Claude completing 8 tasks/day vs Lovable at 3. Velocity chart shows diverging lines. The gap is the story.', enhanceMode: 'highlight', focusAreas: ['velocity-comparison-chart', 'task-completion-rates', 'developer-velocity-gap'] },
    // SHOWCASE: Narrator scroll — data-driven reveal of velocity numbers
    { type: 'narrator-scroll', prompt: 'Ornate parchment scroll unrolling to reveal hand-lettered velocity statistics: "Atlas: 8 tasks/day — Nova: 3 tasks/day — Gap: 2.7x" with decorative data visualization flourishes, golden ink on aged paper, tiny chart sparklines in the margins', duration: 5, dataContent: 'Atlas: 8 tasks/day | Nova: 3 tasks/day | The velocity gap tells the real story' },
    { type: 'alibaba-video', model: 'wan2.6-i2v', prompt: 'Velocity chart bars growing dynamically with sparkle effects, camera slowly zooming out to reveal full sprint dashboard, smooth cinematic motion', referenceImage: 'velocity-metrics-screenshot' },
    // ── PO Actions origin story: born from frustration ──
    // B-roll: Late night eureka moment — PO Actions born from frustration
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: 11 PM late-night coding scene — the human host sits at his desk with only a desk lamp and monitor light, dark room, exhausted but with a sudden spark of inspiration in his eyes. Above his head, a glowing lightbulb illuminates with golden particles. His monitor shows a wireframe sketch of the "PO Actions" dashboard taking shape. Coffee cups line the desk, golden retriever sleeping at his feet. The clock on the wall shows 11:00 PM. Dramatic chiaroscuro lighting, eureka moment energy, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'po-actions-origin' },
    { type: 'tts', voice: 'atlas', scriptKey: 'po-actions-atlas-frustrated' },
    { type: 'tts', voice: 'nova', scriptKey: 'po-actions-nova-blocked' },
    { type: 'screen-capture', screenIds: ['po-actions'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['po-actions'], scriptContext: 'PO Actions tab — structured queue with color-coded urgency cards, approval gates linked to dev task completion, real-time Supabase sync, showing pending reviews cleared in 22 minutes vs 36 hours previously.', enhanceMode: 'highlight', focusAreas: ['approval-queue', 'urgency-cards', 'dev-task-completion-gates', 'realtime-sync-indicator'] },
    { type: 'tts', voice: 'host', scriptKey: 'po-actions-breakthrough' },
    // B-roll: 36h → 22min transformation — dramatic before/after
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D infographic: dramatic split comparison — LEFT side (red, dim) shows "36 HOURS" in crumbling red numbers with a frustrated fox character frozen mid-wait, clock hands spinning endlessly, cobwebs forming on the approval button. RIGHT side (green, glowing) shows "22 MINUTES" in radiant green numbers with the same fox character celebrating, approval checkmarks cascading like confetti, a streamlined dashboard with instant response times. Center arrow shows "98.9% IMPROVEMENT" in golden text. Cinematic contrast lighting, 8K' },
    { type: 'tts', voice: 'atlas', scriptKey: 'po-actions-atlas-relief' },
    { type: 'tts', voice: 'nova', scriptKey: 'po-actions-nova-relief' },
    { type: 'kinetic-text', text: '36 hours → 22 minutes. 98.9% improvement. Frustration breeds features.' },
    // Bridge narrator: scene 6 → scene 7 (7s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-6-to-7' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-6-to-7' },
  ],
  'scene-7-mission-control': [
    // Chapter title card — generated via FLUX, used as transition background from scene-6
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter IV — Velocity" in golden calligraphy, speed lines and racing charts with sprinting characters sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
    // ── Part 1: Velocity Contest — Atlas vs Nova burndown showdown ──
    { type: 'tts', voice: 'host', scriptKey: 'velocity-intro' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-predictability' },
    { type: 'tts', voice: 'atlas', scriptKey: 'scene7-atlas-burndown-scroll' },
    // B-roll: Atlas pristine burndown chart — 85% velocity, straight line
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: Atlas the bear proudly presenting his burndown chart — a holographic display showing a perfectly straight diagonal line from top-left (41 tasks) to bottom-right (0 remaining), each day marker precisely aligned. The chart is labeled "Atlas Velocity: 85%" in clean terracotta text. Atlas stands beside it with hands clasped behind his back, satisfied expression, wire-frame glasses catching the chart glow. Clean tech aesthetic, pristine data visualization, cinematic, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'velocity-nova' },
    { type: 'tts', voice: 'host', scriptKey: 'host-nova-how' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-scope-now' },
    { type: 'tts', voice: 'nova', scriptKey: 'scene7-nova-burndown-scroll-chaos' },
    // B-roll: Nova chaotic burndown chart — 110% velocity, zigzag madness
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: Nova the fox sheepishly presenting her burndown chart — a holographic display showing a WILDLY zigzagging line that goes up, down, sideways, with sticky notes, doodles, dark-mode toggle annotations, and scope-creep arrows pointing in random directions. Despite the chaos, the line ultimately ends BELOW zero (110% completion — she did MORE than assigned). Chart labeled "Nova Velocity: 110% (with detours)" in magenta. Nova shrugs with a proud-but-guilty grin. Colorful chaotic energy, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'velocity-scope-creep' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-dark-mode' },
    // ── Squirrel interrupt — acorn futures comedy beat ──
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-interrupt-3' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-squirrel-response' },
    { type: 'tts', voice: 'host', scriptKey: 'host-squirrel-focus' },
    // ── Part 2: Mission Control showcase ──
    // B-roll: Mission Control dashboard — the async command center
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: an epic mission control room styled as a magical command center — multiple floating holographic screens arranged in a semicircle, each showing a different sprint management view (standup feed, blocker alerts, velocity charts, handoff queue). The human host sits in a command chair at the center, Atlas the bear monitors backend metrics on the left screens, Nova the fox tracks frontend progress on the right screens. A golden retriever lies under the console. Dark room illuminated only by screen glow and ambient purple-blue lighting, NASA mission control meets Pixar magic, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'mission-control-narration' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-context-loss' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-200k-window' },
    { type: 'tts', voice: 'host', scriptKey: 'host-forgot-breakfast' },
    // ── Avatars (all 4 characters appear in this scene) ──
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'avatar-3d', character: 'squirrel', style: 'pixar-3d' },
    // SHOWCASE: Storybook chapter frame — marks the "Act 3: Triumph" turning point
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider page: "Act III — Mission Control" in golden calligraphy, surrounded by illustrated mission control panels, radar dishes, and data streams, warm parchment background with ink flourishes, Pixar-quality illustration', duration: 4 },
    // Batch all 4 mission-control screens in one capture
    { type: 'screen-capture', screenIds: ['po-mission-control', 'standup-entries', 'qa-signoff', 'eod-handoff'], multiCapture: true },
    { type: 'ai-screen-enhance', screenIds: ['po-mission-control', 'standup-entries', 'qa-signoff', 'eod-handoff'], scriptContext: 'Mission Control suite — PO dashboard with real-time developer status and async standup feed; structured standup entries (yesterday/today/blockers); QA sign-off with automated quality gates and approval badges; EOD handoff with context transfer and next-session priorities. The 4 screens together show the full async management toolkit that replaced daily standup meetings.', enhanceMode: 'stylize', focusAreas: ['developer-status-cards', 'async-standup-feed', 'blocker-alerts', 'standup-structure', 'quality-gates', 'approval-badges', 'handoff-summary', 'dependency-flags'] },
    // ── Videos: burndown scroll comedy + standup comparison ──
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar 3D animation: bear character (Atlas) unrolls a pristine white scroll showing a perfectly straight burndown chart line descending at 45 degrees, each data point labeled Day 1-5 with precise margins. Then fox character (Nova) yanks out a MASSIVE crumpled paint-splattered scroll that extends off the table, her chart line zigzags wildly with sticky notes, doodles, dark-mode toggles, and scope-creep annotations everywhere. Bear reaches for his ruler, fox slaps his paw away — comedic timing, warm studio lighting' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Split-screen comparison: LEFT side shows chaotic traditional standup meeting with people talking over each other and sticky notes flying. RIGHT side shows calm AI-powered async standup with organized data flowing smoothly on a dashboard, cinematic quality, warm lighting' },
    // ── Body action: Atlas presenting at podium ──
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar 3D animation: Atlas the bear standing confidently at a sleek podium, wearing wire-frame glasses, gesturing at a floating holographic burndown chart with a laser pointer in his paw. His posture is formal and measured — one paw on the podium, the other sweeping across data points. The chart responds to his gestures with glowing highlights. Dark mission-control room with blue ambient lighting, multiple screens in the background, cinematic quality, 8K' },
    // ── Body action: Nova presenting chaotically ──
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar 3D animation: Nova the fox juggling multiple floating charts, papers, and sticky notes in the air with frantic energy — her paint-splattered apron swishing as she spins between presentations. She tosses a pie chart over her shoulder, catches a bar graph mid-air, somehow everything lands perfectly in a neat stack. Her tail swishes triumphantly at the end. Warm studio lighting with chaotic-but-lovable energy, comedic timing, cinematic quality, 8K' },
    // ── Motion transfer: Atlas presenting with gestures (Option A — wan2.2-animate) ──
    { type: 'character-motion', character: 'atlas', motionRef: 'https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/cast-assets/cast-production/wan-36485c74-ba14-4bca-b900-6671c3335c9f-1773583502898.mp4', prompt: 'Atlas the bear presenting formally at a podium with measured hand gestures', duration: 5 },
    // ── Body animation: Nova running with papers (Option C — Animate3D) ──
    { type: 'character-animate-3d', character: 'nova', animationType: 'run', prompt: 'Nova the fox sprinting across the mission control room clutching a stack of papers', duration: 5 },
    // ── Kinetic text: velocity stats ──
    { type: 'kinetic-text', text: 'ATLAS: 85% velocity. Straight-line burndown. NOVA: 110% velocity. "Things that are in scope... now." SCOPE CREEP ≠ MALICIOUS. It\'s a dev who fixes something in 90 seconds and believes she helped.' },
    // Bridge narrator: scene 7 → scene 8 (6s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-7-to-8' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-7-to-8' },
  ],
  'scene-8-dashboard-tour': [
    // Chapter title card — generated via FLUX, used as transition background from scene-7
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Chapter header: "Chapter V — The Dashboard Tour" with 18 tiny thumbnail sketches arranged as marginalia around the title, each representing a dashboard screen', duration: 2 },
    // ── Full dashboard tour narrative — host introduces, atlas/nova add perspective ──
    { type: 'tts', voice: 'host', scriptKey: 'numbers-intro' },
    { type: 'tts', voice: 'atlas', scriptKey: 'numbers-tour-atlas' },
    { type: 'tts', voice: 'host', scriptKey: 'numbers-tour-host-cut' },
    { type: 'tts', voice: 'nova', scriptKey: 'numbers-nova-perspective' },
    { type: 'tts', voice: 'host', scriptKey: 'numbers-cost' },
    // ── Voiceover montage — rapid 18-screen walkthrough ──
    { type: 'tts', voice: 'host', scriptKey: 'tour-narration' },
    // ── Avatars — all 3 characters contribute to the tour ──
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    // ── 18 dashboard screenshots ──
    {
      type: 'screen-capture',
      screenIds: [
        'po-mission-control', 'po-actions', 'day-1-view', 'day-2-view', 'day-3-view',
        'day-4-view', 'day-5-view', 'backlog-view', 'velocity-metrics', 'effort-tracking',
        'project-plan', 'findings-qa', 'qa-signoff', 'eod-handoff', 'sprint-charter',
        'governance-guide', 'shared-infra-feed', 'territory-guardrails',
      ],
      multiCapture: true,
    },
    { type: 'ai-screen-enhance', screenIds: ['po-mission-control', 'velocity-metrics', 'effort-tracking', 'project-plan'], scriptContext: 'Dashboard tour highlights — 18 screens showing the complete sprint management system. Focus on key metrics, task flow, and developer productivity data.', enhanceMode: 'stylize', focusAreas: ['key-metrics', 'task-flow', 'burndown-chart', 'velocity-data'] },
    // SHOWCASE: Scroll-unroll transition — 18 screenshots unroll like a parchment scroll
    { type: 'scene-transition', style: 'scroll-unroll', prompt: 'Ancient parchment scroll unrolling horizontally to reveal a montage of 18 dashboard screenshots arranged like panels in an illuminated manuscript, each panel glowing as the scroll passes over it, golden light and ink flourishes', duration: 4 },
    // Animate each screenshot with subtle pan/zoom via Alibaba i2v
    { type: 'alibaba-video', model: 'wan2.6-i2v', prompt: 'Ken Burns style slow zoom and pan across a software dashboard screenshot, subtle particle effects, professional product demo feel', referenceImage: 'auto-captured-screenshots' },
    // ── Kinetic text: dashboard tour stats ──
    { type: 'kinetic-text', text: '18 SCREENS. 1 SYSTEM. ZERO JIRA. PO sees actions & blockers. Dev sees task queue & deploy status. Same system, different lens.' },
    // Bridge narrator: scene 8 → scene 9 (7s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-8-to-9' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-8-to-9' },
  ],
  'scene-9-numbers': [
    // Chapter title card — generated via FLUX, used as transition background from scene-8
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter V — Storms" in golden calligraphy, dark clouds with rain of error messages and lightning bolts sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
    // ── Full challenges narrative — vulnerability + thesis moment ──
    // B-roll: Context-switching cost — the hidden tax on developer productivity
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D infographic: dramatic visualization of context-switching overhead — a developer shown as a tiny figure standing at a crossroads with 5 different project paths branching out, each path labeled with a different task. Above, a burning hourglass shows "LOST: 4.2 hours/day" in red. Brain scan visualization shows fragmented thought patterns vs unified focus. LEFT: chaotic multi-tasking (gray, dim), RIGHT: focused single-tasking (green, bright). Clean data visualization with emotional impact, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'challenges-intro' },
    { type: 'tts', voice: 'atlas', scriptKey: 'challenges-atlas' },
    { type: 'tts', voice: 'nova', scriptKey: 'challenges-nova' },
    // Allaudin's Moana moment — full theatrical center-stage (25s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'scene9-allaudin-moana-moment' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'scene9-allaudin-moana-moment' },
    // B-roll: Allaudin Moana moment — theatrical center-stage magical declaration (FLUX for character detail)
    { type: 'alibaba-image', model: 'flux-merged', prompt: 'Pixar 3D illustration: Allaudin the small blue-skinned genie standing center stage in a dramatic spotlight, arms spread wide in a theatrical declaration pose, purple turban flowing with magical energy, golden sparkle particles swirling around him in a vortex pattern. Behind him, a magical projection shows the sprint journey as a storybook timeline — from chaos to order. The other characters (bear, fox, human, squirrel, golden retriever) watch from the audience in warm lamplight, eyes wide with emotion. Broadway musical finale energy, volumetric god rays, 8K' },
    // ── Squirrel asks THE question — emotional pivot of the episode ──
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-interrupt-4' },
    { type: 'tts', voice: 'host', scriptKey: 'host-squirrel-good-question' },
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-vindicated' },
    // ── Numbers voiceover — stats montage ──
    { type: 'tts', voice: 'host', scriptKey: 'numbers-narration' },
    // ── Avatars — all 4 characters in this emotional scene ──
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'avatar-3d', character: 'squirrel', style: 'pixar-3d' },
    // ── Infographic: Traditional vs AI Sprint — emotional contrast, not just numbers ──
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Split-screen 3D comparison infographic: LEFT (red tones, dimmed) — traditional sprint chaos, 5-person team drowning in Jira cards, sticky notes everywhere, exhausted faces in a Zoom call with 40 browser tabs open, "3-4 WEEKS" stamped in red. RIGHT (green tones, glowing) — AI sprint clarity, pristine dashboard with zero red blockers, 4 async standup screens, peaceful human PO sipping coffee in pajamas, bear and fox characters working in parallel, "5 DAYS" in radiant green. Center divider: "41 TASKS — Same Scope, Different Coordination." Glass-morphism cards, depth, cinematic lighting' },
    { type: 'alibaba-video', model: 'wan2.6-i2v', prompt: 'The split comparison comes alive: LEFT side numbers freeze and dim with a sad thud sound. RIGHT side numbers count up with satisfying mechanical clicks — 41 tasks, 5 days, each stat overshoots slightly then settles with a micro-bounce. Zero-blockers badge EXPLODES with green particle burst. 100% completion checkmark GROWS to fill its panel. Final moment: golden "Sprint Complete" badge pulses triumphantly while left side fades to grayscale. Celebratory, earned, cinematic', referenceImage: 'comparison-infographic' },
    // SHOWCASE: Motion graphics — animated stat counters with contrast reveal
    { type: 'motion-graphics', content: '41 TASKS | 5 DAYS | 5x VELOCITY | 0 BLOCKERS | 0 STANDUP MEETINGS — each number reveals with a satisfying click, compared against a faded red traditional-sprint number on the left (3-4 weeks, 5+ people, constant blockers, endless standups). Right side GLOWS green as left fades out. Golden "Sprint Complete" badge appears with light beam shooting upward — celebration, not just completion.' },
    { type: 'screen-capture', screenIds: ['velocity-metrics'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['velocity-metrics'], scriptContext: 'Final velocity metrics — 41 tasks completed, 5x traditional speed, zero blockers at sprint end. The big number reveal + honest challenges context.', enhanceMode: 'redraw', focusAreas: ['total-velocity-number', 'completion-percentage', 'zero-blockers-badge'] },
    // ── Kinetic text: the thesis statement ──
    { type: 'kinetic-text', text: '"Who makes sure the AIs don\'t build the wrong thing really fast?" — The governance layer isn\'t project management theater. It\'s survival tools.' },
    // Bridge narrator: scene 9 → scene 10 (6s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-9-to-10' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-9-to-10' },
  ],
  'scene-10-whats-next': [
    // Chapter title card — generated via FLUX, used as transition background from scene-9
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter VI — Stars" in golden calligraphy, galaxy with constellation map and hopeful dawn sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
    // ── MCP vision — host introduces, all 3 characters contribute perspectives ──
    { type: 'tts', voice: 'host', scriptKey: 'whats-next-intro' },
    { type: 'tts', voice: 'atlas', scriptKey: 'whats-next-atlas' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-language-foundational' },
    { type: 'tts', voice: 'nova', scriptKey: 'whats-next-nova' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-data-quality' },
    { type: 'tts', voice: 'host', scriptKey: 'host-atlas-said' },
    // ── MCP narration voiceover (20s) ──
    { type: 'tts', voice: 'host', scriptKey: 'whats-next-narration' },
    // ── Avatars — all 3 characters contribute to the vision ──
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    // ── Visual assets — language constellation, MCP diagram, velocity methodology ──
    // Note: Avoid literal world maps / country names — DashScope content filter rejects geopolitical imagery
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'A glowing constellation of 16 interconnected language nodes floating in dark space — each node is a translucent sphere with a unique color pulsing as it activates, golden data streams flowing between them forming a neural network pattern. Camera slowly orbits the constellation as nodes light up one by one in sequence, each connection sparking with energy. Cinematic sci-fi feel, volumetric lighting, holographic aesthetic, deep blue-purple space background with nebula wisps, 8K' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'MCP (Model Context Protocol) network diagram coming alive: GitHub commit triggers a cascade — diff parsing node glows, sprint tracker updates automatically, QA checklist generates itself, acceptance criteria light up green. Data packets flow as glowing orbs between Jira, GitHub, Slack nodes on dark tech background with blue-violet nebula, 3D space visualization' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Velocity methodology validation dashboard: Sprint Day 1-5 columns rising with weighted task complexity calculations visible on each bar, a "Confidence Level" meter at the top glowing at 95% verified, context-switching overhead tracked as small amber annotations. NOT marketing — engineering. Holographic display style, verification checkmarks glowing green on each validated metric, futuristic but data-grounded' },
    // SHOWCASE: Kinetic text — forward-looking vision statement
    { type: 'kinetic-text', text: '85 LANGUAGES. 16 REGIONS. 4 AI ZONES. ONE UNIFIED PIPELINE. Push code → MCP reads diff → tracker updates → QA report generated. The board updates itself.' },
    // Bridge narrator: scene 10 → scene 11 (9s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'bridge-10-to-11' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'bridge-10-to-11' },
  ],
  'scene-11-close': [
    // Chapter title card — generated via FLUX, used as transition background from scene-10
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Final chapter header: "The Last Page... For Now" in warm golden calligraphy, tiny illustrated characters waving from the margins, squirrel holding a tiny "THE END?" sign', duration: 2 },
    // ── Full closing dialogue — emotional sign-off (all 9 script entries) ──
    // B-roll: Meta-moment — the team reflects on the journey
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: warm sunset scene — the full team sits together on a hilltop overlooking a tech-forest landscape. The human host sits center with his golden retriever, Atlas the bear sits to the left polishing his glasses reflectively, Nova the fox sits to the right with her tail curled around her contentedly, the squirrel naps on Atlas shoulder. Behind them, a holographic display shows "41/41 TASKS COMPLETE" fading into the sunset. Warm golden hour lighting, nostalgic reflection energy, widescreen cinematic composition, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'close-takeaway' },
    { type: 'tts', voice: 'atlas', scriptKey: 'close-atlas-final' },
    { type: 'tts', voice: 'nova', scriptKey: 'close-nova-final' },
    { type: 'tts', voice: 'atlas', scriptKey: 'close-atlas-heard' },
    // Allaudin grand finale — Nutcracker closing narration (25s)
    { type: 'tts', voice: 'allaudin', scriptKey: 'close-allaudin-finale' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'close-allaudin-finale' },
    // B-roll: Allaudin lamp finale — the genie returns to his lamp with a wink
    { type: 'alibaba-image', model: 'wan2.6-t2i', prompt: 'Pixar 3D illustration: Allaudin the small blue-skinned genie floating above his golden magical lamp, slowly dissolving back into blue-purple mist that swirls into the lamp spout. He gives a warm knowing wink and finger-guns to the camera before disappearing. The lamp sits on a leather storybook, golden sparkle particles lingering where he was. A tiny "Until next time..." text floats in magical calligraphy. Warm cozy library setting, bittersweet farewell energy, magical lamplight, 8K' },
    { type: 'tts', voice: 'host', scriptKey: 'close-rationale' },
    { type: 'tts', voice: 'host', scriptKey: 'close-cta' },
    // ── Goodbye round — each character signs off in character ──
    { type: 'tts', voice: 'atlas', scriptKey: 'close-atlas-goodbye' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'close-atlas-goodbye' },
    { type: 'tts', voice: 'nova', scriptKey: 'close-nova-goodbye' },
    { type: 'tts', voice: 'squirrel', scriptKey: 'squirrel-finale' },
    // ── Avatars — all 4 characters for the finale (bookend: characters return) ──
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'avatar-3d', character: 'squirrel', style: 'pixar-3d' },
    // ── Lipsync — bookend finale: characters speak on-camera for emotional close ──
    // Note: Host entries (60-90s) exceed 18s lipsync limit — runtime will play as voiceover
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'close-rationale' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'close-cta' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'close-atlas-heard' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2', scriptKey: 'close-nova-goodbye' },
    { type: 'avatar-lipsync', character: 'squirrel', provider: 'alibaba-wan2.2', scriptKey: 'squirrel-finale' },
    // SHOWCASE: Character group farewell — Nutcracker finale energy, choreographed bows
    { type: 'character-interaction', characters: ['host', 'atlas', 'nova', 'squirrel'], prompt: 'Nutcracker finale moment in a warm sunlit forest-tech clearing: human PO host takes a theatrical bow center stage, bear Atlas gives a formal measured nod with hands clasped behind his back, fox Nova does an exuberant curtsy with a sparkle burst, squirrel attempts a bow but topples forward and catches itself on bear\'s shoulder — all four laughing. Golden retriever sits at their feet wagging tail, woodland creatures peek from bushes applauding. Warm golden hour lighting, confetti particles, Pixar quality, cinematic depth of field', style: 'farewell-bow' },
    { type: 'screen-capture', screenIds: ['day-5-view'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['day-5-view'], scriptContext: 'Day 5 final sprint view — all 41 tasks completed, the culmination of the 5-day dual-developer sprint. Highlight completion status and final metrics.', enhanceMode: 'highlight', focusAreas: ['completion-status', 'final-metrics', 'task-board'] },
    // SHOWCASE: "Powered by" provider montage — highlights the AI stack that built this episode
    { type: 'storybook-frame', variant: 'closing', prompt: 'Elegant "Powered By" credits page in storybook style — provider logos arranged in a constellation pattern: ElevenLabs (voice), Azure Neural (voice), Alibaba Wan2.6 (video), Alibaba Wan2.2 (lipsync), Alibaba Wanx (images), Alibaba FLUX (images), Meshy (3D), Alibaba CosyVoice (fallback TTS), ModelsLab (motion), JSON2Video (assembly) — each logo connected by golden thread lines forming a production pipeline flowchart, warm parchment background, calligraphy header "10 AI Providers — 1 Unified Pipeline", 8K quality', duration: 6 },
    { type: 'kinetic-text', text: '10 AI PROVIDERS. 1 UNIFIED PIPELINE. EVERY FRAME AI-GENERATED.' },
    // ── CTA overlay — links from the script (URLs match close-cta links array) ──
    { type: 'kinetic-text', text: 'EXPLORE: genieaiexperimentationhub.tech | SUBSCRIBE: YouTube @GenieAIPodcast | CONNECT: LinkedIn — Genie AI Suite | Beyond AI Hype — we bring it to life.' },
    { type: 'narrator-scroll', prompt: 'Final scroll revealing the complete AI provider stack used to produce this episode: "Voice: ElevenLabs + Azure Neural + Alibaba CosyVoice | Video: Alibaba Wan2.6 T2V/I2V | Lipsync: Alibaba Wan2.2 S2V | Images: Alibaba Wanx + FLUX Merged | 3D: Meshy | Motion: ModelsLab AnimateDiff | Assembly: JSON2Video | Orchestration: GenieCast" — golden ink on aged paper, each provider name illuminates as the scroll passes', duration: 8, dataContent: 'Voice: ElevenLabs + Azure Neural + CosyVoice | Video: Wan2.6 | Lipsync: Wan2.2 | Images: Wanx + FLUX | 3D: Meshy | Motion: ModelsLab | Assembly: JSON2Video | Orchestration: GenieCast' },
    { type: 'sfx', prompt: 'Orchestral crescendo resolving into a warm music box chime, the sound of a book page turning, and a final magical sparkle', duration: 5 },
    // ── Body action: Group theatrical bow ──
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar 3D animation: all four characters taking theatrical bows in a row on a sunlit stage — Atlas the bear gives a deep formal bow with one paw across his chest, Nova the fox does an exaggerated curtsy with her paint-splattered apron fanning out, the human host waves warmly at camera, and Squirrel attempts a bow but topples forward comically and catches itself on Atlas shoulder. Golden confetti falls from above, warm spotlight lighting, audience of woodland creatures applauding, cinematic quality, 8K' },
    // ── Body action: Genie lamp return ──
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar 3D animation: Allaudin the blue genie floating above a golden ornate lamp, arms spread wide in a grand theatrical farewell gesture. He begins dissolving into sparkling blue-purple mist from his feet upward, the mist spiraling in an elegant vortex back into the lamp spout. The lamp glows warmly as the last wisps of magic settle. A single golden sparkle lingers in the air then fades. Dark mystical background with volumetric god rays, cinematic quality, emotional farewell moment, 8K' },
    // ── Motion transfer: Host formal bow farewell (Option A — wan2.2-animate) ──
    { type: 'character-motion', character: 'host', motionRef: 'https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/cast-assets/cast-production/wan-74f32e73-a2ea-4246-993f-0021c4fc2e4e-1773583555725.mp4', prompt: 'Sai the host taking a graceful formal bow farewell to the audience', duration: 5 },
    // ── Body animation: Group idle → talk (Option C — Animate3D) ──
    { type: 'character-animate-3d', character: 'atlas', animationType: 'talk', prompt: 'All characters standing together, Atlas gesturing as he speaks to the group in farewell', duration: 5 },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'End card: four animated characters (bear Atlas, fox Nova, human host, squirrel perched on shoulder) standing together in a sunlit forest-tech hub, golden retriever at their feet, woodland creatures gathered around, text "Two AIs, One Sprint, Zero Standup Meetings" floating above in holographic letters, cinematic Pixar quality, warm golden hour lighting, 8K' },
  ],
};

// ─── STORYBOOK OPENING + CLOSING SEQUENCES ──────────────────────────────────
// Magical book-open → camera-push-in at start; flattening → book-close at end.
export const EP04_STORYBOOK_BOOKENDS = {
  opening: [
    { type: 'storybook-frame' as const, variant: 'opening' as const, prompt: 'A magical leather-bound storybook sitting on an old wooden table in a cozy library, golden clasps glowing, dust motes dancing in warm lamplight, the cover reads "Beyond AI Hype" in embossed gold lettering, Pixar quality, 8K cinematic', duration: 4 },
    { type: 'alibaba-video' as const, model: 'wan2.6-t2v' as const, prompt: 'Close-up of a magical storybook: golden clasps slowly unlock with sparkle particles, the heavy leather cover lifts open by itself, pages begin fluttering as warm golden light pours out from within, camera slowly pushes into the first illuminated page as the 2D illustration transforms into a living 3D Pixar world, music box melody transitioning to orchestral swell, cinematic depth of field, 8K' },
    { type: 'narrator-scroll' as const, prompt: 'An ornate parchment scroll unrolling to reveal hand-lettered calligraphy text: "Chapter I — The Genie Emerges" with decorative flourishes, golden ink on aged paper, tiny illustrated squirrels peeking from the margins', duration: 3, dataContent: 'Chapter I — The Genie Emerges' },
    { type: 'music' as const, prompt: 'Delicate music box celesta playing a simple magical melody, transitioning into a warm orchestral swell with strings and French horn, wonder and invitation, 90 BPM', duration: 10, style: 'storybook-opening' },
    { type: 'sfx' as const, prompt: 'Old book spine creaking, metal clasps clicking open, pages rustling and fluttering in magical wind', duration: 4 },
  ],
  closing: [
    { type: 'storybook-frame' as const, variant: 'closing' as const, prompt: 'The 3D Pixar scene slowly flattens back into a 2D storybook illustration, camera pulling back as the page turns itself, the leather book cover gently closes, golden clasps lock with a soft click, a single sparkle lingers on the cover, warm lamplight, cozy library, 8K cinematic', duration: 5 },
    { type: 'alibaba-video' as const, model: 'wan2.6-t2v' as const, prompt: 'Camera slowly pulls back from a living storybook world as it flattens into an illustration, the final page turns, the heavy leather cover closes gently, golden clasps lock themselves, a child\'s hand reaches in and gently touches the cover with wonder, warm bokeh lamplight, music box melody descending, Pixar quality, 8K' },
    { type: 'music' as const, prompt: 'Music box celesta melody descending gently, warm string resolution chord, the same melody from the opening but slower and softer, feelings of warmth and completion, 80 BPM', duration: 8, style: 'storybook-closing' },
    { type: 'sfx' as const, prompt: 'Book pages settling, leather cover closing with a gentle thump, metal clasps locking with a soft click, a final sparkle chime', duration: 3 },
  ],
} as const;

// ─── SCENE-TO-SCENE TRANSITIONS — 11 transitions between 12 scenes ──────────
// Cycles through 6 storybook transition styles for visual variety.
export type StorybookTransitionStyle = 'page-turn' | 'scroll-unroll' | 'iris-wipe' | 'storybook-flip' | 'chapter-card' | 'dissolve-morph';

export const EP04_STORYBOOK_TRANSITIONS: {
  from: string;
  to: string;
  style: StorybookTransitionStyle;
  steps: ScenePipelineStep[];
}[] = [
  {
    from: 'scene-0-title', to: 'scene-1-cold-open', style: 'page-turn',
    steps: [
      { type: 'scene-transition', style: 'page-turn', prompt: 'Storybook page curling from right to left, the illustrated scene of Allaudin\'s lamp dissolves as the page turns to reveal a chaotic office scene, golden light spilling from between pages, paper texture visible, Pixar quality', duration: 3 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter I — The Problem" in golden calligraphy, chaotic office with floating error logs and overwhelmed developers sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
      { type: 'sfx', prompt: 'Heavy paper page turning with a satisfying whoosh', duration: 2 },
    ],
  },
  {
    from: 'scene-1-cold-open', to: 'scene-2-meet-team', style: 'iris-wipe',
    steps: [
      { type: 'scene-transition', style: 'iris-wipe', prompt: 'A magical golden portal iris opens from the center, swirling energy reveals three silhouetted characters (bear, fox, human) stepping forward through the portal into warm light, sparkle particles at the edges', duration: 3 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate chapter header with decorative borders: "Chapter II — The Cast" in elegant serif font with tiny character silhouettes in the marginalia, golden ink on cream parchment', duration: 2 },
      { type: 'sfx', prompt: 'Magical portal whoosh with sparkle shimmer opening', duration: 2 },
    ],
  },
  {
    from: 'scene-2-meet-team', to: 'scene-3-origin', style: 'scroll-unroll',
    steps: [
      { type: 'scene-transition', style: 'scroll-unroll', prompt: 'An aged parchment scroll unrolls from top to bottom, covering the current scene and revealing an illustrated timeline beneath — from frustration to creation, hand-drawn style with ink blots, Pixar quality lighting on the scroll texture', duration: 3 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter II — Origins" in golden calligraphy, timeline scroll with spark of inspiration and blueprint sketches in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
      { type: 'sfx', prompt: 'Parchment scroll unrolling with paper crinkle and wooden roller sounds', duration: 2 },
    ],
  },
  {
    from: 'scene-3-origin', to: 'scene-4-solution', style: 'storybook-flip',
    steps: [
      { type: 'scene-transition', style: 'storybook-flip', prompt: 'Rapid flip through several illustrated storybook pages in quick succession, each showing a glimpse of the sprint tracker being built — sketches becoming code becoming UI, pages blur together with motion, landing on a clean new page', duration: 2 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Chapter header: "Chapter III — The Sprint Begins" with a tiny illustrated bear and fox shaking paws in the corner, sprint board sketched in the margins', duration: 2 },
      { type: 'sfx', prompt: 'Rapid page flipping like thumbing through a book quickly', duration: 2 },
    ],
  },
  {
    from: 'scene-4-solution', to: 'scene-5-governance', style: 'page-turn',
    steps: [
      { type: 'scene-transition', style: 'page-turn', prompt: 'Storybook page turning slowly, the illustrated sprint dashboard fades as the page lifts, revealing an illustrated territory map with two kingdoms on the next page, warm golden binding visible at the spine', duration: 3 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter III — Governance" in golden calligraphy, territory map with two kingdoms and border markers sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
      { type: 'sfx', prompt: 'Heavy paper page turning with gentle book spine creak', duration: 2 },
    ],
  },
  {
    from: 'scene-5-governance', to: 'scene-6-po-actions', style: 'chapter-card',
    steps: [
      { type: 'scene-transition', style: 'chapter-card', prompt: 'Ornate chapter title card filling the frame: "Chapter IV — The Bottleneck" with elaborate gold border, a small illustration of an overwhelmed human surrounded by floating task cards, quill-drawn style, dramatic lighting on parchment', duration: 3 },
      { type: 'sfx', prompt: 'Dramatic page slam with reverb, then quiet anticipation', duration: 2 },
    ],
  },
  {
    from: 'scene-6-po-actions', to: 'scene-7-velocity', style: 'scroll-unroll',
    steps: [
      { type: 'scene-transition', style: 'scroll-unroll', prompt: 'A parchment scroll unrolls sideways revealing a hand-drawn velocity chart — one smooth line (Atlas) and one chaotic squiggle (Nova), tiny squirrels running along the chart lines, ink-and-watercolor style on aged paper', duration: 3 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter IV — Velocity" in golden calligraphy, speed lines and racing charts with sprinting characters sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
      { type: 'sfx', prompt: 'Parchment scroll unrolling with quill scratching sound effects', duration: 2 },
    ],
  },
  {
    from: 'scene-7-velocity', to: 'scene-8-numbers', style: 'storybook-flip',
    steps: [
      { type: 'scene-transition', style: 'storybook-flip', prompt: 'Pages flip rapidly showing glimpses of dashboard screens as hand-drawn illustrations that become increasingly detailed and colorful, landing on a beautifully rendered dashboard spread across two pages like an illuminated manuscript', duration: 2 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Chapter header: "Chapter V — The Dashboard Tour" with 18 tiny thumbnail sketches arranged as marginalia around the title, each representing a dashboard screen', duration: 2 },
      { type: 'sfx', prompt: 'Quick page flipping transitioning into a grand reveal chord', duration: 2 },
    ],
  },
  {
    from: 'scene-8-numbers', to: 'scene-9-challenges', style: 'page-turn',
    steps: [
      { type: 'scene-transition', style: 'page-turn', prompt: 'The page turns to reveal a darker-toned illustration — storm clouds over the sprint board, the bear and fox looking concerned, rain of error logs falling like confetti, more somber colors but still Pixar storybook quality', duration: 3 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter V — Storms" in golden calligraphy, dark clouds with rain of error messages and lightning bolts sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
      { type: 'sfx', prompt: 'Page turning with subtle ominous undertone, distant thunder rumble', duration: 2 },
    ],
  },
  {
    from: 'scene-9-challenges', to: 'scene-10-whats-next', style: 'dissolve-morph',
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'The stormy illustration dissolves and morphs — raindrops transforming into stars, dark clouds becoming a bright galaxy, the sprint board transforming into a constellation map of connected services, magical metamorphosis, Pixar quality', duration: 3 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Ornate storybook chapter divider: "Chapter VI — Stars" in golden calligraphy, galaxy with constellation map and hopeful dawn sketched in the margins, warm parchment with ink flourishes, Pixar-quality illustration', duration: 2 },
      { type: 'sfx', prompt: 'Magical transformation shimmer with ascending chimes', duration: 2 },
    ],
  },
  {
    from: 'scene-10-whats-next', to: 'scene-11-close', style: 'page-turn',
    steps: [
      { type: 'scene-transition', style: 'page-turn', prompt: 'Final page turn — the vision illustration settles as the page gently turns to the last chapter, warm sunset colors bleeding through from the next page, golden light at the spine, a sense of coming home', duration: 3 },
      { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Final chapter header: "The Last Page... For Now" in warm golden calligraphy, tiny illustrated characters waving from the margins, squirrel holding a tiny "THE END?" sign', duration: 2 },
      { type: 'sfx', prompt: 'Gentle page turn with warm resolution chord', duration: 2 },
    ],
  },
];

// ─── CHARACTER INTERACTION SHOTS — Alvin & Chipmunks style ──────────────────
// Multi-character animated group shots with overriding/arguing/not-listening dynamics.
// Atlas and Nova talk over each other like Alvin & Chipmunks characters while Host
// tries to maintain order — the animated storybook version of a chaotic standup.
export const EP04_CHARACTER_INTERACTIONS: {
  sceneId: string;
  steps: ScenePipelineStep[];
}[] = [
  {
    // Scene 2 — Meet the Team: group intro shot, everyone talks at once
    sceneId: 'scene-2-meet-team',
    steps: [
      { type: 'character-interaction', characters: ['atlas', 'nova', 'host'], style: 'group-shot', prompt: 'Pixar-quality 3D group shot: the wise bear (Atlas) stands tall explaining architecture with floating code blocks, the energetic fox (Nova) interrupts by painting a UI mockup directly over Atlas\'s hologram — Atlas looks annoyed, Host in the middle holding coffee with a "here we go again" expression, golden retriever between them looking back and forth like watching tennis, woodland creatures gathered around watching the chaos, warm forest-tech clearing lighting, Nutcracker/Alvin-and-Chipmunks energy where everyone talks at once, 8K' },
    ],
  },
  {
    // Scene 3 — Origin: Atlas and Nova argue about what went wrong
    sceneId: 'scene-3-governance',
    steps: [
      { type: 'character-interaction', characters: ['atlas', 'nova'], style: 'duo-argument', prompt: 'Pixar 3D animation: the bear (Atlas) and fox (Nova) in a split-screen argument — Atlas calmly presenting a holographic governance document while Nova simultaneously paints over it with colorful UI components, both talking AT each other not WITH each other, speech bubbles colliding and bouncing off, the squirrel in the middle covering its ears with tiny paws, Alvin-and-Chipmunks style chaotic overlap where neither listens, Host visible in background pinching the bridge of his nose, 8K cinematic' },
    ],
  },
  {
    // Scene 5 — Governance: Atlas lectures, Nova rolls eyes (Chipmunks not listening)
    sceneId: 'scene-5-day2',
    steps: [
      { type: 'character-interaction', characters: ['atlas', 'nova', 'host'], style: 'duo-argument', prompt: 'Pixar 3D: Bear (Atlas) stands at a holographic whiteboard drawing governance rules with laser precision, behind him Fox (Nova) is secretly building a dark-mode toggle and humming, neither listening to the other, Host walks between them with a clipboard trying to get both to focus but they keep talking over him — Atlas quoting documentation, Nova describing animations, speech bubbles piling up like a comic book argument panel, the golden retriever asleep under the chaos, Chipmunks-style "everyone-talks-nobody-listens" energy, 8K' },
    ],
  },
  {
    // Scene 7 — Mission Control: Sprint standup circle (key "animals listening" scene)
    sceneId: 'scene-7-mission-control',
    steps: [
      { type: 'character-interaction', characters: ['atlas', 'nova', 'host'], style: 'standup-circle', prompt: 'Pixar 3D morning standup circle in a sunlit forest clearing: Bear (Atlas) at a holographic whiteboard methodically presenting yesterday\'s 14 completed tasks, Fox (Nova) interrupting every 3 seconds with "I also built..." and pulling out new UI components from behind her back like a magician, Host on a tree stump with coffee trying to say "let\'s stay on track" but keeps getting talked over — Atlas and Nova going back and forth over each other like Alvin and the Chipmunks fighting about who did more, the squirrel moderating with a tiny gavel banging on a mushroom, woodland creatures watching in a circle: owls taking notes, rabbits as stakeholders, a tortoise slowly moving a single task card, golden retriever fetching the sprint report, dappled morning sunlight, Pixar volumetric rays, 8K cinematic' },
    ],
  },
  {
    // Scene 7 — Paper scroll standup explanation (Atlas & Nova unroll it together)
    sceneId: 'scene-7-mission-control',
    steps: [
      { type: 'narrator-scroll', prompt: 'Bear (Atlas) and Fox (Nova) each holding one end of a giant paper scroll, unrolling it together but pulling in different directions — the scroll shows the sprint plan with animated task cards, burndown charts, and standup entries flowing across it like a river, Atlas pulling toward the data side (metrics, charts) while Nova pulls toward the visual side (UI screenshots, animations), the scroll stretching and wobbling comically between them, Nutcracker rolling-the-parchment energy, 8K Pixar', duration: 4, dataContent: 'Sprint standup entries, burndown chart, daily velocity metrics, handoff status' },
    ],
  },
  {
    // Scene 11 — Close: farewell group wave
    sceneId: 'scene-11-close',
    steps: [
      { type: 'character-interaction', characters: ['atlas', 'nova', 'host'], style: 'farewell-wave', prompt: 'Pixar 3D warm farewell: Bear (Atlas), Fox (Nova), and Host standing together on a hill at golden hour, all waving goodbye to camera, golden retriever wagging tail, woodland creatures gathered around — squirrel on Atlas\'s head waving a tiny flag, owl on Nova\'s shoulder, rabbits in a row doing a synchronized wave, text "The End... For Now" floating in holographic letters above, Nutcracker finale energy with everyone taking a bow, warm lens flare, 8K cinematic' },
    ],
  },
];

// ─── NARRATOR SCROLL STEPS — Paper-roll-unrolling data explanations ──────────
// Parchment scrolls that unroll to show data visualizations, like Nutcracker Sugar Plum scenes.
export const EP04_NARRATOR_SCROLLS: {
  sceneId: string;
  steps: ScenePipelineStep[];
}[] = [
  {
    // Scene 3 — Origin story timeline on a scroll
    sceneId: 'scene-3-governance',
    steps: [
      { type: 'narrator-scroll', prompt: 'An ornate parchment scroll unrolling horizontally, revealing a hand-illustrated timeline: "The Journey" from frustrated solo developer (stick figure at desk) through discovering AI pair programming (sparkle moment) to building the sprint tracker (triumphant pose), each milestone illustrated in ink-and-watercolor storybook style with tiny marginal creatures reacting, warm sepia tones, 8K', duration: 4, dataContent: 'Origin timeline: Frustration → Discovery → Experiment → Sprint Tracker → Production' },
    ],
  },
  {
    // Scene 8 — Dashboard metrics scroll
    sceneId: 'scene-8-dashboard-tour',
    steps: [
      { type: 'narrator-scroll', prompt: 'A grand parchment scroll unrolling vertically like an ancient royal decree, revealing hand-drawn dashboard metrics that animate as they appear — bar charts growing, pie charts filling, numbers counting up in calligraphy, all in illustrated storybook style with decorative borders and tiny creatures pointing at the good numbers, an owl with spectacles acting as data narrator, 8K Pixar quality', duration: 5, dataContent: 'Sprint velocity: 41 tasks, 5 days. Task completion: 100%. Zero merge conflicts. Async standups: 10. PO review time: 22 min → from 36 hours.' },
    ],
  },
  {
    // Scene 9 — Traditional vs AI Sprint comparison
    sceneId: 'scene-9-numbers',
    steps: [
      { type: 'narrator-scroll', prompt: 'A scroll unrolling to reveal a side-by-side illustrated comparison: LEFT side in muted gray-red (Traditional Sprint) shows stick figures in meetings, piled-up Jira boards, clock spinning fast; RIGHT side in vibrant green-gold (AI Sprint) shows animated bear and fox shipping code, async standup scroll, clean dashboard, numbers counting up triumphantly, the contrast is dramatic and hand-painted in storybook style, 8K', duration: 5, dataContent: 'Traditional: 8 devs, 2-week sprint, 60% velocity, daily standups. AI Sprint: 1 human + 2 AIs, 5-day sprint, 100% velocity, zero meetings.' },
    ],
  },
];

// ─── STORYBOOK MUSIC SCORE — Character leitmotifs + transition stingers ─────
export const EP04_STORYBOOK_SCORE = {
  // Character leitmotifs — 5s musical phrases per character
  leitmotifs: {
    atlas: { type: 'music' as const, prompt: 'A dignified cello and bassoon phrase, methodical and precise, like a bear walking through a library — 5 seconds, loop-ready, warm low register', duration: 5, style: 'leitmotif' },
    nova: { type: 'music' as const, prompt: 'A playful piccolo and xylophone phrase, bouncy and sparkling, like a fox painting with light — 5 seconds, loop-ready, bright high register with sparkle', duration: 5, style: 'leitmotif' },
    host: { type: 'music' as const, prompt: 'A warm acoustic guitar and soft piano phrase, relatable and grounded, like a friend telling a story by a fire — 5 seconds, loop-ready, mid register', duration: 5, style: 'leitmotif' },
    allaudin: { type: 'music' as const, prompt: 'A deep oud and reverb-drenched strings phrase, mystical and ancient, like a genie emerging from a lamp — 5 seconds, loop-ready, deep register with shimmer', duration: 5, style: 'leitmotif' },
    squirrel: { type: 'music' as const, prompt: 'A chaotic toy piano and kazoo phrase with a comedic "bonk" at the end, hyperactive and silly, like a cartoon squirrel on caffeine — 5 seconds, loop-ready', duration: 5, style: 'leitmotif' },
  },
  // Transition stingers — short musical punctuation for page turns
  stingers: {
    pageTurn: { type: 'sfx' as const, prompt: 'Musical page-turn flourish: harp glissando with soft chime, 1.5 seconds, magical and gentle', duration: 2 },
    scrollUnroll: { type: 'sfx' as const, prompt: 'Parchment unroll stinger: woodwind trill descending with papery swish, 1.5 seconds', duration: 2 },
    chapterReveal: { type: 'sfx' as const, prompt: 'Chapter reveal fanfare: brass mini-flourish with timpani tap, regal and brief, 2 seconds', duration: 2 },
    bookOpen: { type: 'sfx' as const, prompt: 'Music box opening chime: celesta ascending arpeggio with a soft "click" at the start, wonder and invitation, 3 seconds', duration: 3 },
    bookClose: { type: 'sfx' as const, prompt: 'Music box closing chime: celesta descending arpeggio, slowing down like winding down, warm resolution, 3 seconds', duration: 3 },
  },
  // 4-act narrative arc — background score mood per act
  narrativeArc: {
    act1_wonder: { scenes: ['scene-0-title', 'scene-1-cold-open', 'scene-2-meet-team'], mood: 'wonder-and-discovery', tempo: '90-100 BPM' },
    act2_tension: { scenes: ['scene-3-governance', 'scene-4-day1', 'scene-5-day2', 'scene-6-day3'], mood: 'tension-and-problem-solving', tempo: '100-115 BPM' },
    act3_triumph: { scenes: ['scene-7-mission-control', 'scene-8-dashboard-tour', 'scene-9-numbers'], mood: 'triumph-and-revelation', tempo: '115-130 BPM' },
    act4_warmth: { scenes: ['scene-10-whats-next', 'scene-11-close'], mood: 'warmth-and-resolution', tempo: '85-95 BPM' },
  },
} as const;

// ─── PIPELINE READINESS MATRIX ────────────────────────────────────────────────
// For each pipeline required by the production plan — status + edge function.
export const EP04_PIPELINE_READINESS = [
  // PHASE 1: Script
  { pipeline: 'script-generation (GenieSpark)',     status: '✅ COMPLETE',  edgeFn: 'ai-universal-processor',   notes: 'Script + production plan ready' },
  // PHASE 2: Audio
  { pipeline: 'tts-generation host (ElevenLabs)',   status: '✅ READY',     edgeFn: 'elevenlabs-voice',          notes: 'ELEVENLABS_API_KEY present; voice: Rachel' },
  { pipeline: 'tts-generation atlas (Azure Neural)',status: '✅ READY',     edgeFn: 'azure-tts',                 notes: 'AZURE_SPEECH_KEY present; voice: GuyNeural' },
  { pipeline: 'tts-generation nova (ElevenLabs)',   status: '✅ READY',     edgeFn: 'elevenlabs-voice',          notes: 'ELEVENLABS_API_KEY present; voice: Domi' },
  { pipeline: 'music-generation (ElevenLabs)',      status: '✅ READY',     edgeFn: 'elevenlabs-music',          notes: 'Background bed + transition stings' },
  { pipeline: 'sfx-generation (ElevenLabs)',        status: '✅ READY',     edgeFn: 'elevenlabs-sfx',            notes: 'UI click sounds, dashboard transitions' },
  // PHASE 3: Visuals — 3D Characters (Meshy AI via alibaba-3d-generator)
  { pipeline: '3d-immersive atlas-character (bear)',  status: '✅ READY',     edgeFn: 'alibaba-3d-generator',      notes: 'MESHY_API_KEY present; Pixar bear with owl companion; deferred (60-90s/model)' },
  { pipeline: '3d-immersive nova-character (fox)',    status: '✅ READY',     edgeFn: 'alibaba-3d-generator',      notes: 'MESHY_API_KEY present; Pixar/Disney fox with hummingbird; deferred' },
  { pipeline: '3d-immersive host-character (human)',  status: '✅ READY',     edgeFn: 'alibaba-3d-generator',      notes: 'MESHY_API_KEY present; PO with golden retriever; deferred' },
  { pipeline: '3d-immersive environments',            status: '✅ READY',     edgeFn: 'alibaba-3d-generator',      notes: 'Sprint board room, territory city, MCP network, standup circle' },
  // PHASE 3: Visuals — Alibaba DashScope (Video + Image Generation)
  { pipeline: 'alibaba-wan2.6-t2v (text-to-video)',  status: '✅ READY',     edgeFn: 'ai-video-generator',        notes: 'ALIBABA_API_KEY present; Wan2.6 text-to-video for scene transitions, environment flyovers, motion graphics' },
  { pipeline: 'alibaba-wan2.6-i2v (image-to-video)', status: '✅ READY',     edgeFn: 'ai-video-generator',        notes: 'ALIBABA_API_KEY present; Animates screenshots with Ken Burns, chart animations, infographic motion' },
  { pipeline: 'alibaba-wanx-v2.1 (image-gen)',       status: '✅ READY',     edgeFn: 'ai-image-generator',        notes: 'ALIBABA_API_KEY present; Infographics, comparison tables, territory maps' },
  { pipeline: 'alibaba-flux-merged (image-gen)',      status: '✅ READY',     edgeFn: 'ai-image-generator',        notes: 'ALIBABA_API_KEY present; High-quality character stills, thumbnails' },
  { pipeline: 'infographic-design',                   status: '✅ READY',     edgeFn: 'ai-image-generator',        notes: 'Comparison table, velocity prediction, timeline via Alibaba wanx' },
  // PHASE 3: Visuals — Screens
  { pipeline: 'screen-capture (19 screens)',          status: '✅ AUTO',      edgeFn: 'MultiScreenshotGallery',    notes: 'html2canvas on sprint-tracker tabs; upload to product-screenshots bucket' },
  { pipeline: 'ai-screen-enhance (narration scenes)', status: '✅ READY',     edgeFn: 'ai-image-generator',        notes: 'Alibaba Wanx/Flux image editing via regional sub-region routing; highlight/stylize/redraw modes; scenes 3-7, 9' },
  // PHASE 4: Avatar Lip-Sync (Alibaba Wan2.2 Primary)
  { pipeline: 'avatar-lipsync atlas (bear)',          status: '✅ READY',     edgeFn: 'ai-video-generator',        notes: 'Alibaba Wan2.2 phoneme-level lip-sync + Azure viseme data; all speaking scenes' },
  { pipeline: 'avatar-lipsync nova (fox)',            status: '✅ READY',     edgeFn: 'ai-video-generator',        notes: 'Alibaba Wan2.2 lip-sync; Disney-style 2D character animation' },
  { pipeline: 'avatar-lipsync host (human)',          status: '✅ READY',     edgeFn: 'ai-video-generator',        notes: 'Alibaba Wan2.2 lip-sync; Pixar-style human PO with expressions' },
  { pipeline: 'alibaba-omniavatar (full-body)',       status: '✅ READY',     edgeFn: 'ai-video-generator',        notes: 'ALIBABA_API_KEY present; Full body gestures for close-up character scenes' },
  // PHASE 4: Video Assembly
  { pipeline: 'video-generation character scenes',    status: '✅ READY',     edgeFn: 'genie-cast-assembler',      notes: 'Drives avatar scenes via ai-video-generator + Alibaba pipelines' },
  { pipeline: 'video-generation motion-graphics',     status: '✅ READY',     edgeFn: 'modelslab-media',           notes: 'AnimateDiff for transitions + motion graphics (fallback to Alibaba)' },
  { pipeline: 'video-editing final assembly',         status: '✅ READY',     edgeFn: 'genie-cast-assembler',      notes: 'JSON2Video stitch — JSON2VIDEO_API_KEY present' },
  { pipeline: 'thumbnail-generation',                 status: '✅ READY',     edgeFn: 'auto-thumbnail-generator',  notes: 'YouTube/LinkedIn thumbnails via Alibaba wanx + flux-merged' },
  // PUBLISH
  { pipeline: 'social-publish youtube/linkedin',      status: '✅ SKELETON',  edgeFn: 'social-publish',            notes: 'Phase 3B per CAST_PIPELINE_USAGE_MAP.md; OAuth connected' },
] as const;

// ─── SOCIAL TEASER CLIPS CONFIG ───────────────────────────────────────────────
// 18 clips across 6 categories (A-F) — expanded from original 5.
// Each clip targets specific themes and platforms with per-platform messaging.

export type ClipCategory = 'curiosity' | 'pain_point' | 'data_proof' | 'democratization' | 'character' | 'teaser';
export type ClipTheme = 'human_ai' | 'practical' | 'democratization' | 'entertainment';

export interface SocialClip {
  id: string;
  category: ClipCategory;
  theme: ClipTheme;
  sourceScenes: string[];
  timestamp: string;
  duration: number;
  hook: string;
  cta: string;
  hashtags: string[];
  platforms: string[];
  captionStyle: 'kinetic' | 'subtitle' | 'none';
  videoUrl?: string;
  messaging: {
    linkedin: { text: string; hashtags: string[] };
    youtube: { title: string; description: string };
    tiktok: { caption: string; hashtags: string[] };
    instagram: { caption: string; hashtags: string[] };
    twitter: { text: string };
  };
}

export const EP04_SOCIAL_CLIPS: SocialClip[] = [
  // ─── Category A: Curiosity Hooks (stop-scrollers) ─────────────────────────
  {
    id: 'A1-ai-devs-faster-than-you',
    category: 'curiosity',
    theme: 'human_ai',
    sourceScenes: ['scene-1-cold-open', 'scene-3-governance'],
    timestamp: '0:00–0:30',
    duration: 30,
    hook: 'What happens when your AI developers are faster than you?',
    cta: 'Watch the full sprint breakdown — link in bio',
    hashtags: ['#BeyondAIHype', '#AIDevOps', '#ClaudeCode', '#Lovable'],
    platforms: ['youtube_shorts', 'tiktok', 'instagram', 'linkedin', 'twitter'],
    captionStyle: 'kinetic',
    messaging: {
      linkedin: { text: 'What happens when your AI developers are faster than you?\n\nWe ran a real 5-day sprint with Claude Code and Lovable. 41 tasks. Zero standups.\n\nThe biggest challenge wasn\'t the AI. It was keeping up.', hashtags: ['#AIDevOps', '#ProductManagement', '#BeyondAIHype'] },
      youtube: { title: 'When Your AI Developers Are Faster Than You...', description: 'We ran a real sprint with 2 AI developers. Here\'s what happened when they outpaced the human product owner.' },
      tiktok: { caption: 'POV: Your AI devs ship faster than you can review 😅', hashtags: ['#aidev', '#coding', '#techlife', '#BeyondAIHype'] },
      instagram: { caption: 'When your AI developers are literally faster than you... 🤖⚡', hashtags: ['#AIDevOps', '#TechLife', '#BeyondAIHype', '#ClaudeCode'] },
      twitter: { text: 'What happens when your AI developers are faster than you?\n\n41 tasks. 5 days. 2 AIs. Zero standup meetings.\n\nThe bottleneck wasn\'t the AI. It was me. 🧵' },
    },
  },
  {
    id: 'A2-slowest-member',
    category: 'curiosity',
    theme: 'human_ai',
    sourceScenes: ['scene-9-numbers'],
    timestamp: '14:30–15:00',
    duration: 30,
    hook: 'I was the slowest member of my own team. Here\'s what I did.',
    cta: 'Full episode — how I adapted to AI velocity',
    hashtags: ['#BeyondAIHype', '#AIProductOwner', '#SprintManagement'],
    platforms: ['youtube_shorts', 'linkedin', 'twitter'],
    captionStyle: 'subtitle',
    messaging: {
      linkedin: { text: 'I was the slowest member of my own team.\n\nNot a humble brag. A reality check.\n\nWhen Claude completed 8 tasks/day and Lovable shipped 3 polished UIs, I became the bottleneck — approvals, reviews, decisions.\n\nHere\'s how I adapted.', hashtags: ['#AILeadership', '#ProductOwner', '#BeyondAIHype'] },
      youtube: { title: 'I Was the Slowest on My Own Team', description: 'When your AI developers outpace you, you have two choices: slow them down, or speed yourself up. I chose option 3.' },
      tiktok: { caption: 'When the PO is the slowest team member... 💀', hashtags: ['#agile', '#scrummaster', '#aitools'] },
      instagram: { caption: 'Plot twist: the human was the bottleneck 😂', hashtags: ['#AIDevOps', '#ProductOwner', '#TechHumor'] },
      twitter: { text: 'I was the slowest member of my own team.\n\nClaude: 8 tasks/day\nLovable: 3 polished UIs/day\nMe: stuck in meetings\n\nSo I built a system to get out of the way. Thread 🧵' },
    },
  },
  {
    id: 'A3-847-lines-coffee',
    category: 'curiosity',
    theme: 'practical',
    sourceScenes: ['scene-3-governance'],
    timestamp: '3:30–4:00',
    duration: 30,
    hook: 'My AI developer shipped 847 lines of SQL while I was having coffee.',
    cta: 'See the actual sprint data — all metrics are live',
    hashtags: ['#ClaudeCode', '#AIProductivity', '#DevTools'],
    platforms: ['youtube_shorts', 'tiktok', 'instagram', 'linkedin', 'twitter'],
    captionStyle: 'kinetic',
    messaging: {
      linkedin: { text: '847 lines of session instructions.\nShipped at 11 PM.\nWhile I was having coffee the next morning, it was already reviewed and merged.\n\nThis is what AI-augmented development actually looks like — not a demo, a production sprint.', hashtags: ['#ClaudeCode', '#AIProductivity', '#BeyondAIHype'] },
      youtube: { title: '847 Lines While I Had Coffee ☕', description: 'Atlas (Claude Code) shipped 847 lines of session instructions at 11 PM. By morning, the sprint was already ahead of schedule.' },
      tiktok: { caption: 'My AI dev shipped 847 lines while I was sleeping ☕', hashtags: ['#ai', '#coding', '#developer', '#productivity'] },
      instagram: { caption: 'Claude shipped 847 lines overnight. I shipped... a coffee order ☕😅', hashtags: ['#DevLife', '#AITools', '#ClaudeCode', '#Productivity'] },
      twitter: { text: '847 lines of SQL.\nShipped at 11 PM.\nReviewed by morning.\n\nThat\'s not a pitch deck number. That\'s from an actual sprint dashboard you can query.' },
    },
  },

  // ─── Category B: Pain Point Hooks (relatable moments) ─────────────────────
  {
    id: 'B1-blocked-six-hours',
    category: 'pain_point',
    theme: 'human_ai',
    sourceScenes: ['scene-5-day2'],
    timestamp: '5:45–6:15',
    duration: 30,
    hook: 'We were blocked for 6 hours. Because I was in a meeting.',
    cta: 'See how we solved the async approval problem',
    hashtags: ['#AgileProblems', '#MeetingFatigue', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'linkedin', 'twitter', 'tiktok'],
    captionStyle: 'subtitle',
    messaging: {
      linkedin: { text: 'We were blocked for 6 hours.\n\nNot by a technical issue. Not by a dependency.\n\nBecause I was in a meeting.\n\nThat\'s when I realized: in AI-augmented sprints, the human is the bottleneck. So I built PO Actions — an async approval queue that never blocks.', hashtags: ['#AgileTransformation', '#AIDevOps', '#MeetingFatigue'] },
      youtube: { title: 'Blocked for 6 Hours... Because of a Meeting', description: 'The biggest blocker in our AI sprint wasn\'t technical — it was a 2-hour meeting that left both AIs idle.' },
      tiktok: { caption: 'Blocked for 6 hours because the human was in a meeting 💀', hashtags: ['#meetings', '#agile', '#devproblems'] },
      instagram: { caption: 'When YOUR meeting blocks the entire AI team... 😬', hashtags: ['#MeetingFatigue', '#AgileLife', '#AIDevOps'] },
      twitter: { text: 'Blocked for 6 hours.\nNot by a bug.\nNot by a dependency.\nBecause I was in a meeting.\n\nAI devs don\'t have the luxury of "let\'s circle back." They need answers NOW.' },
    },
  },
  {
    id: 'B2-pending-36-hours',
    category: 'pain_point',
    theme: 'practical',
    sourceScenes: ['scene-5-day2'],
    timestamp: '6:00–6:30',
    duration: 30,
    hook: '14 tasks completed. 12 sat in pending review for 36 hours.',
    cta: 'From 36 hours to 22 minutes — watch how',
    hashtags: ['#DevOps', '#CodeReview', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'linkedin', 'twitter'],
    captionStyle: 'subtitle',
    messaging: {
      linkedin: { text: '14 tasks completed.\n12 sat in pending review for 36 hours.\n\nThe AI developers finished their work. The human approval queue was the constraint.\n\nWe fixed it: from 36 hours pending → 22 minutes. 98.9% improvement.\n\nThe solution wasn\'t faster AI. It was faster humans.', hashtags: ['#DevOps', '#CodeReview', '#AIProductivity'] },
      youtube: { title: '36 Hours in Pending Review...', description: '14 tasks done, 12 waiting for human review. How we cut review time by 98.9%.' },
      tiktok: { caption: '36 hours in pending because the reviewer was a human 😭', hashtags: ['#codereview', '#devlife', '#agile'] },
      instagram: { caption: 'When code review is the bottleneck... not the code 😤', hashtags: ['#DevOps', '#CodeReview', '#AIdev'] },
      twitter: { text: '14 tasks completed. 12 sat in review for 36 hours.\n\nThe fix: async approval queue.\nResult: 36 hours → 22 minutes.\n98.9% improvement.\n\nThe bottleneck was never the AI.' },
    },
  },
  {
    id: 'B3-tracking-on-receipts',
    category: 'pain_point',
    theme: 'human_ai',
    sourceScenes: ['scene-3-governance'],
    timestamp: '3:00–3:30',
    duration: 30,
    hook: 'I was tracking sprint tasks on the back of a receipt.',
    cta: 'From receipts to a real-time dashboard — full story',
    hashtags: ['#StartupLife', '#ProjectManagement', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'tiktok', 'instagram'],
    captionStyle: 'kinetic',
    messaging: {
      linkedin: { text: 'Before the sprint tracker existed, I was tracking tasks on the back of a receipt.\n\nNot as a joke. Because I needed something faster than opening Jira.\n\nThat frustration became PO Actions — built by the AI, for the human.', hashtags: ['#StartupLife', '#ProductManagement', '#AI'] },
      youtube: { title: 'From Receipt Notes to Real-Time Dashboard', description: 'The sprint tracker was born from frustration — tracking tasks on physical receipts because Jira was too slow.' },
      tiktok: { caption: 'Tracking sprints on receipts because Jira was too slow 💀', hashtags: ['#startuplife', '#projectmanagement', '#devtools'] },
      instagram: { caption: 'Tell me you need better tools without telling me... 🧾', hashtags: ['#StartupLife', '#DevTools', '#ProjectManagement'] },
      twitter: { text: 'I was tracking sprint tasks on the back of a receipt.\n\nNot ironically. Because it was faster than Jira.\n\nThat frustration became a real-time dashboard with 18 views.' },
    },
  },

  // ─── Category C: Data/Proof Hooks (credibility) ───────────────────────────
  {
    id: 'C1-five-x-dashboard',
    category: 'data_proof',
    theme: 'practical',
    sourceScenes: ['scene-8-dashboard-tour'],
    timestamp: '12:30–13:00',
    duration: 30,
    hook: '5x faster. Not a claim. A dashboard you can query.',
    cta: 'Query the live dashboard yourself — link in bio',
    hashtags: ['#AIProductivity', '#DataDriven', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'linkedin', 'twitter'],
    captionStyle: 'subtitle',
    messaging: {
      linkedin: { text: '5x faster.\n\nNot a pitch deck number. Not a projection.\n\nA dashboard. You can query. Right now.\n\n41 tasks completed in 5 days. Velocity tracked per developer, per day, with blockers, handoffs, and QA sign-offs.\n\nThat\'s the difference between AI hype and AI results.', hashtags: ['#AIProductivity', '#DataDriven', '#BeyondAIHype'] },
      youtube: { title: '5x Faster — Here\'s the Dashboard Proof', description: 'We didn\'t just claim 5x velocity — we built a queryable dashboard that proves it. Every task, every metric, live.' },
      tiktok: { caption: '5x faster and the receipts are public 📊', hashtags: ['#data', '#ai', '#productivity', '#proof'] },
      instagram: { caption: '5x faster. Not a claim — a dashboard you can query 📊', hashtags: ['#AIProductivity', '#DataDriven', '#BeyondAIHype'] },
      twitter: { text: '5x faster.\n\nNot a claim.\nNot a projection.\n\nA dashboard. You can query. Right now.\n\nThat\'s the difference between AI hype and AI proof.' },
    },
  },
  {
    id: 'C2-98-percent',
    category: 'data_proof',
    theme: 'practical',
    sourceScenes: ['scene-5-day2'],
    timestamp: '6:30–7:00',
    duration: 30,
    hook: 'From 36 hours pending → 22 minutes. 98.9% improvement.',
    cta: 'How async approvals changed everything',
    hashtags: ['#ProcessImprovement', '#DevOps', '#BeyondAIHype'],
    platforms: ['linkedin', 'twitter', 'youtube_shorts'],
    captionStyle: 'subtitle',
    messaging: {
      linkedin: { text: 'From 36 hours pending → 22 minutes.\n98.9% improvement.\n\nNot by changing the AI. By changing the process.\n\nWhen AI developers work 24/7, human-gated approvals become the constraint. We built PO Actions to eliminate that bottleneck.', hashtags: ['#ProcessImprovement', '#DevOps', '#AILeadership'] },
      youtube: { title: '98.9% Faster Reviews — Here\'s How', description: 'We cut review time from 36 hours to 22 minutes. The secret: async approvals designed for AI-speed workflows.' },
      tiktok: { caption: '98.9% faster just by fixing the process 🔧', hashtags: ['#devops', '#improvement', '#ai'] },
      instagram: { caption: '36 hours → 22 minutes. The process was the problem, not the AI.', hashtags: ['#ProcessImprovement', '#DevOps', '#AIdev'] },
      twitter: { text: '36 hours → 22 minutes.\n98.9% improvement.\n\nWe didn\'t change the AI.\nWe changed the process.\n\nAI-augmented development requires AI-speed approvals.' },
    },
  },
  {
    id: 'C3-zero-standups',
    category: 'data_proof',
    theme: 'human_ai',
    sourceScenes: ['scene-4-day1'],
    timestamp: '4:30–5:00',
    duration: 30,
    hook: '41 tasks. 5 days. Claude + Lovable. Zero standup meetings.',
    cta: 'The async standup that replaced all meetings',
    hashtags: ['#NoMeetings', '#AsyncWork', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'linkedin', 'twitter', 'tiktok'],
    captionStyle: 'kinetic',
    messaging: {
      linkedin: { text: '41 tasks. 5 days. Claude + Lovable. Zero standup meetings.\n\nNot because we skipped them. Because we replaced them.\n\nAsync standups in the sprint tracker. Structured yesterday/today/blockers from both AIs. No context switching. No scheduling overhead.', hashtags: ['#AsyncWork', '#NoMeetings', '#AIDevOps'] },
      youtube: { title: 'Zero Standup Meetings — How We Did It', description: '41 tasks in 5 days with zero meetings. Async standups replaced everything.' },
      tiktok: { caption: 'Zero standup meetings. The AIs just... communicated 🤖', hashtags: ['#nomeetings', '#async', '#aiwork'] },
      instagram: { caption: 'Zero. Standup. Meetings. And we shipped 41 tasks in 5 days. 🚀', hashtags: ['#NoMeetings', '#AsyncWork', '#AIDevOps'] },
      twitter: { text: '41 tasks. 5 days.\nClaude + Lovable.\nZero standup meetings.\n\nAsync standups > daily standups when your developers don\'t need coffee breaks.' },
    },
  },

  // ─── Category D: AI Democratization Hooks (inspirational) ─────────────────
  {
    id: 'D1-19-providers',
    category: 'democratization',
    theme: 'democratization',
    sourceScenes: ['scene-11-close'],
    timestamp: '24:00–24:30',
    duration: 30,
    hook: 'I didn\'t hire a video team. I used 19 AI providers to produce this.',
    cta: 'The full AI production pipeline — Genie Cast',
    hashtags: ['#AICreator', '#ContentCreation', '#GenieAI', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'tiktok', 'instagram', 'linkedin'],
    captionStyle: 'kinetic',
    messaging: {
      linkedin: { text: 'I didn\'t hire a video team.\nI didn\'t use a production studio.\n\nI used 19 AI providers — ElevenLabs for voices, Alibaba for avatars, Anthropic for scripts, Azure for lip-sync — orchestrated through one platform.\n\nThis podcast IS the product demo.', hashtags: ['#AICreator', '#ContentCreation', '#GenieAI'] },
      youtube: { title: '19 AI Providers. Zero Video Team.', description: 'This entire podcast was produced using 19 AI providers orchestrated through Genie Cast. No video team needed.' },
      tiktok: { caption: 'No video team. Just 19 AIs and a dream 🎬', hashtags: ['#aicreator', '#contentcreation', '#nocode'] },
      instagram: { caption: '19 AI providers. Zero video team. This podcast IS the product demo. 🎬', hashtags: ['#AICreator', '#ContentCreation', '#GenieAI'] },
      twitter: { text: 'I didn\'t hire a video team.\n\n19 AI providers:\n- ElevenLabs (voices)\n- Alibaba (avatars)\n- Anthropic (scripts)\n- Azure (lip-sync)\n\nOrchestrated through one platform.\nThis podcast IS the product demo.' },
    },
  },
  {
    id: 'D2-podcast-is-demo',
    category: 'democratization',
    theme: 'democratization',
    sourceScenes: ['scene-11-close'],
    timestamp: '24:30–25:00',
    duration: 30,
    hook: 'The podcast IS the product demo. The creativity IS the proof.',
    cta: 'Produce your own — Genie Cast is live',
    hashtags: ['#GenieAI', '#AIContent', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'linkedin', 'instagram'],
    captionStyle: 'kinetic',
    messaging: {
      linkedin: { text: 'The podcast IS the product demo.\nThe creativity IS the proof.\n\nWe didn\'t build a slide deck to explain what Genie Cast can do. We used it to produce this entire episode — 5 voices, 12 scenes, 3D Pixar avatars, music, SFX.\n\nIf the demo doesn\'t convince you, the dashboard will.', hashtags: ['#ProductDemo', '#AIContent', '#GenieAI'] },
      youtube: { title: 'The Podcast IS the Product Demo', description: 'We didn\'t make a demo video. We used the product to make this podcast. That\'s the proof.' },
      tiktok: { caption: 'The demo IS the content. Meta enough? 🤯', hashtags: ['#meta', '#aicontent', '#productdemo'] },
      instagram: { caption: 'When your product demo IS the podcast itself... 🎙️✨', hashtags: ['#GenieAI', '#AIContent', '#ProductDemo'] },
      twitter: { text: 'The podcast IS the product demo.\nThe creativity IS the proof.\n\n5 voices. 12 scenes. 3D Pixar avatars. Music. SFX.\n\nAll produced through Genie Cast.' },
    },
  },
  {
    id: 'D3-rethinking-dev',
    category: 'democratization',
    theme: 'democratization',
    sourceScenes: ['scene-11-close'],
    timestamp: '25:00–25:30',
    duration: 30,
    hook: 'AI-augmented development isn\'t about replacing developers. It\'s about rethinking how development works.',
    cta: 'The future of dev teams — full episode',
    hashtags: ['#FutureOfWork', '#AIDevOps', '#BeyondAIHype'],
    platforms: ['linkedin', 'youtube_shorts', 'twitter'],
    captionStyle: 'subtitle',
    messaging: {
      linkedin: { text: 'AI-augmented development isn\'t about replacing developers.\nIt\'s about rethinking how development works.\n\nOne human. Two AI developers. Real governance. Real metrics.\n\nThe question isn\'t "will AI replace developers?" It\'s "how do we orchestrate AI and humans for 5x output?"', hashtags: ['#FutureOfWork', '#AIDevOps', '#BeyondAIHype'] },
      youtube: { title: 'Rethinking Development with AI', description: 'AI-augmented development isn\'t replacement. It\'s orchestration. Here\'s what we learned.' },
      tiktok: { caption: 'AI won\'t replace devs. But dev teams will look completely different 🔮', hashtags: ['#futureofwork', '#ai', '#developers'] },
      instagram: { caption: 'Not replacement. Rethinking. One human + two AIs = 5x output 🚀', hashtags: ['#FutureOfWork', '#AIDevOps', '#BeyondAIHype'] },
      twitter: { text: 'AI-augmented development isn\'t about replacing developers.\n\nIt\'s about rethinking how development works.\n\n1 human + 2 AIs + governance = 5x output.\n\nThe question isn\'t "will AI replace devs?" It\'s "how do we orchestrate?"' },
    },
  },

  // ─── Category E: Character Moments (entertainment) ────────────────────────
  {
    id: 'E1-squirrel-compilation',
    category: 'character',
    theme: 'entertainment',
    sourceScenes: ['scene-1-cold-open', 'scene-3-governance', 'scene-4-day1', 'scene-5-day2', 'scene-6-day3', 'scene-9-numbers', 'scene-11-close'],
    timestamp: 'various',
    duration: 60,
    hook: 'Every time the Squirrel interrupted the sprint... 🐿️',
    cta: 'Meet the full team — Atlas, Nova, Host, Squirrel & Allaudin',
    hashtags: ['#SquirrelInterrupt', '#AnimatedPodcast', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'tiktok', 'instagram'],
    captionStyle: 'kinetic',
    messaging: {
      linkedin: { text: 'Even our AI sprint had scope creep — in the form of a squirrel.\n\n6 interruptions. 0 useful contributions. 100% entertainment value.\n\nSometimes the best sprint retrospective includes a character who tracks acorns instead of story points.', hashtags: ['#AgileHumor', '#ScopeCreep', '#AnimatedPodcast'] },
      youtube: { title: 'Every Squirrel Interruption — Compilation 🐿️', description: 'All 6 squirrel interruptions from Beyond AI Hype Episode 2. Skateboarding, acorn tracking, QA squirrel — chaos compilation.' },
      tiktok: { caption: 'The squirrel who keeps interrupting the sprint 🐿️😂', hashtags: ['#squirrel', '#animated', '#comedy', '#techhumor'] },
      instagram: { caption: 'Scope creep has never been this adorable 🐿️✨', hashtags: ['#AnimatedPodcast', '#ScopeCreep', '#TechHumor'] },
      twitter: { text: 'Our sprint had a squirrel that kept interrupting.\n\n6 times. Skateboarding. QA testing. Acorn tracking.\n\n0 useful contributions. 100% entertainment value. 🐿️' },
    },
  },
  {
    id: 'E2-atlas-deadpan',
    category: 'character',
    theme: 'entertainment',
    sourceScenes: ['scene-4-day1', 'scene-5-day2', 'scene-6-day3', 'scene-11-close'],
    timestamp: 'various',
    duration: 30,
    hook: '"I documented my satisfaction in the changelog." — Atlas',
    cta: 'Atlas has more deadpan moments — watch the full ep',
    hashtags: ['#AtlasQuotes', '#DeadpanAI', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'tiktok', 'instagram'],
    captionStyle: 'subtitle',
    messaging: {
      linkedin: { text: '"I documented my satisfaction in the changelog."\n\nAtlas (Claude Code) doesn\'t celebrate. He documents.\n\nWhen your AI developer\'s idea of a victory lap is a well-formatted commit message, you know you\'re working with a professional.', hashtags: ['#AIHumor', '#ClaudeCode', '#DevCulture'] },
      youtube: { title: 'Atlas: "I Documented My Satisfaction" 🐻', description: 'Atlas (Claude Code) — the AI developer who celebrates by writing changelog entries. Best deadpan moments.' },
      tiktok: { caption: '"I documented my satisfaction in the changelog" 🐻💀', hashtags: ['#deadpan', '#ai', '#developer', '#humor'] },
      instagram: { caption: 'Atlas doesn\'t celebrate. He documents. 🐻📝', hashtags: ['#AtlasQuotes', '#DeadpanAI', '#DevHumor'] },
      twitter: { text: '"I documented my satisfaction in the changelog." — Atlas\n\n"Educational." — Also Atlas\n\nWhen your AI developer\'s celebration is a well-formatted commit message. 🐻' },
    },
  },
  {
    id: 'E3-nova-dark-mode',
    category: 'character',
    theme: 'entertainment',
    sourceScenes: ['scene-6-day3', 'scene-9-numbers', 'scene-11-close'],
    timestamp: 'various',
    duration: 30,
    hook: '"Dark mode is a human right. I will die on this hill. Figuratively." — Nova',
    cta: 'Nova\'s hot takes — full episode',
    hashtags: ['#DarkMode', '#NovaQuotes', '#BeyondAIHype'],
    platforms: ['youtube_shorts', 'tiktok', 'instagram'],
    captionStyle: 'kinetic',
    messaging: {
      linkedin: { text: '"Dark mode is a human right. I will die on this hill. Figuratively."\n\nNova (Lovable) shipped at 110% velocity — by improving things that weren\'t in scope.\n\nSometimes scope creep is just... caring about the user experience.', hashtags: ['#DarkMode', '#UXDesign', '#DevCulture'] },
      youtube: { title: 'Nova: "Dark Mode is a Human Right" 🦊', description: 'Nova (Lovable) — the AI developer who ships at 110% velocity because dark mode can\'t wait.' },
      tiktok: { caption: '"Dark mode is a human right" — an AI developer 🦊🌙', hashtags: ['#darkmode', '#ux', '#developer', '#funny'] },
      instagram: { caption: 'Nova said dark mode rights 🦊🌙 And then shipped it. Out of scope.', hashtags: ['#DarkMode', '#NovaQuotes', '#UXDesign'] },
      twitter: { text: '"Dark mode is a human right. I will die on this hill. Figuratively."\n\n— Nova (Lovable), right before shipping 110% of sprint scope because "the button was sad without hover states"' },
    },
  },

  // ─── Category F: "What's Coming" Teaser ───────────────────────────────────
  {
    id: 'F1-whats-next-mcp',
    category: 'teaser',
    theme: 'practical',
    sourceScenes: ['scene-10-whats-next'],
    timestamp: '22:00–22:30',
    duration: 30,
    hook: 'Push code → MCP reads the diff → board updates itself. That\'s next.',
    cta: 'MCP integration — coming in Sprint 3',
    hashtags: ['#MCP', '#AIAutomation', '#BeyondAIHype', '#GenieAI'],
    platforms: ['youtube_shorts', 'linkedin', 'twitter'],
    captionStyle: 'subtitle',
    messaging: {
      linkedin: { text: 'Push code → MCP reads the diff → sprint board updates itself.\n\nThat\'s not a demo. That\'s the roadmap.\n\nModel Context Protocol connects your dev tools to your sprint tools. No manual updates. No status meetings. The code IS the status.', hashtags: ['#MCP', '#AIAutomation', '#DevOps'] },
      youtube: { title: 'MCP: The Sprint Board That Updates Itself', description: 'Push code, MCP reads the diff, board updates automatically. The future of sprint management.' },
      tiktok: { caption: 'When the sprint board updates itself from your code 🤯', hashtags: ['#mcp', '#devtools', '#automation'] },
      instagram: { caption: 'Push code → board updates. No Jira. No standups. Just MCP. 🔮', hashtags: ['#MCP', '#AIAutomation', '#FutureOfWork'] },
      twitter: { text: 'Push code → MCP reads the diff → board updates itself.\n\nNo manual updates.\nNo status meetings.\nThe code IS the status.\n\nComing in Sprint 3.' },
    },
  },
];

// ─── THUMBNAIL OPTIONS CONFIG ─────────────────────────────────────────────────
export const EP04_THUMBNAILS = [
  { id: 'thumb-1', concept: 'The wise bear (Atlas) and energetic fox (Nova) flanking the human PO at a glowing holographic sprint board, golden retriever at their feet, squirrels and owls watching from the board edges, Pixar cinema lighting',     text: '41 Tasks. 5 Days. 2 AIs.' },
  { id: 'thumb-2', concept: 'Split-screen: LEFT = Disney-painted woodland standup circle with animals listening, RIGHT = real sprint dashboard screenshot showing 5x velocity, dramatic diagonal divider with golden sparkles', text: '5x Faster?' },
  { id: 'thumb-3', concept: 'All three characters (bear Atlas, fox Nova, human Host) sitting on a log in a forest clearing turned tech hub, surrounded by their animal companions (owl, hummingbird, golden retriever, squirrels), morning sunlight, "Zero Standup Meetings" floating as holographic text above them, Pixar movie poster composition',               text: 'Zero Standup Meetings' },
] as const;
