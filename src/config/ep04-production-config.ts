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

// Alibaba CosyVoice fallback voices (WebSocket API, cosyvoice-v3-flash model)
export const ALIBABA_FALLBACK_VOICES = {
  host:     { model: 'cosyvoice-v3-flash', voice: 'longanyang',     lang: 'en', description: 'Sunny young man — warm podcast host fallback' },
  atlas:    { model: 'cosyvoice-v3-flash', voice: 'longcheng',      lang: 'en', description: 'Professional male — measured engineer fallback' },
  nova:     { model: 'cosyvoice-v3-flash', voice: 'longhua',        lang: 'en', description: 'Bright female — energetic dev fallback' },
  allaudin: { model: 'cosyvoice-v3-plus',  voice: 'longshu',        lang: 'en', description: 'Deep male — theatrical narrator fallback' },
  squirrel: { model: 'cosyvoice-v3-flash', voice: 'longpaopao_v3',  lang: 'en', description: 'Bubble voice child — chaotic squirrel fallback' },
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
  /** Nova (Lovable) = bright, energetic. ElevenLabs Lily — fast delivery, expressive. */
  nova: {
    provider: 'elevenlabs' as const,
    voiceId: 'pFZP5JQG7iQjIQuC4Bku',  // Lily — bright female, energetic
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: ALIBABA_FALLBACK_VOICES.nova,
    style: 'energetic',
    stability: 0.35,
    similarityBoost: 0.65,
    speed: 1.1,
    eqProfile: 'bright',
    description: 'Nova (Lovable) — frontend dev, fast delivery, energetic',
  },
  /** Allaudin (Genie) = deep, theatrical, magical. ElevenLabs Clyde (war-vet gravelly) OR Alibaba longshu. */
  allaudin: {
    provider: 'elevenlabs' as const,
    voiceId: '2EiwWnXFnvU5JabPnv8n',  // Clyde — deep, gravelly, theatrical (video game character voice)
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: ALIBABA_FALLBACK_VOICES.allaudin,
    style: 'theatrical',
    stability: 0.35,
    similarityBoost: 0.85,
    speed: 0.85,
    eqProfile: 'deep-reverb',
    description: 'Allaudin (Genie) — deep, gravelly, theatrical narrator with mystical presence',
  },
  /** Squirrel = high-pitched, chaotic, childish. ElevenLabs Gigi (animation child voice) OR Alibaba longpaopao. */
  squirrel: {
    provider: 'elevenlabs' as const,
    voiceId: 'jBpfuIE2acCO8z3wKNLl',  // Gigi — childish American, designed for animation
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: ALIBABA_FALLBACK_VOICES.squirrel,
    style: 'chaotic',
    stability: 0.15,
    similarityBoost: 0.4,
    speed: 1.4,
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
      props: ['half-empty coffee mug', 'sticky notes', 'checklist papers', 'a loyal dog companion'],
      motionStyle: 'direct',            // Direct to camera, self-deprecating shrug, dog tilts head
      audioProfile: EP04_VOICES.host,
      // --- PIXAR-STYLE PROMPT: A relatable human PO with animal listeners ---
      pixarPrompt: 'Pixar-style 3D animated character: a warm, slightly disheveled HUMAN product owner in earth-tone business casual (rolled sleeves, loosened tie), perpetually holding a half-empty oversized coffee mug with "PO Life" written on it, expressive Pixar-proportioned face with big tired-but-passionate eyes, surrounded by a cloud of floating sticky notes and checklist papers, a loyal scruffy GOLDEN RETRIEVER sitting beside him wearing a tiny "Scrum Master" badge looking up adoringly, in a cozy home office with dual monitors showing sprint dashboards, warm lamplight, subtle Pixar subsurface skin shading, stylized proportions with slightly large head and expressive hands, photorealistic hair with Pixar stylization, 8K cinematic render',
      // --- DISNEY-STYLE PROMPT: Painted warm narrator ---
      disneyPrompt: 'Disney 2D animation style character: a warm-hearted human narrator in a cozy earth-tone cardigan, hand-painted with visible brushstrokes, kind expressive eyes with slight bags underneath (too many sprints), holding an enormous steaming coffee mug, surrounded by hand-drawn sticky notes that flutter like butterflies, a loyal golden retriever drawn in classic Disney style sitting at his feet with a tiny scrum board collar, painterly home office background with soft watercolor lighting, classic Disney warmth and charm with modern tech elements painted in',
      sceneCompanions: [
        'The golden retriever fetching a rolled-up sprint report like a newspaper, tail wagging proudly',
        'A cat sleeping on the keyboard who accidentally closes a Jira ticket by stepping on Enter',
        'A parrot on a perch repeating standup phrases: "No blockers! No blockers!" in a tiny voice',
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
  | { type: 'avatar-lipsync'; character: keyof typeof EP04_AVATAR_CONFIG['characters']; provider: 'alibaba-wan2.2' | 'alibaba-omniavatar' | 'modelslab' }
  | { type: 'alibaba-video'; model: 'wan2.1-t2v' | 'wan2.6-t2v' | 'wan2.6-i2v' | 'wan2.1-i2v'; prompt: string; referenceImage?: string }
  | { type: 'alibaba-image'; model: 'flux-merged' | 'wanx-v2.1' | 'qwen-image-max'; prompt: string }
  | { type: 'music'; prompt: string; duration: number; style?: string }
  | { type: 'sfx'; prompt: string; duration?: number }
  | { type: 'motion-graphics'; content: string }
  | { type: 'kinetic-text'; text: string }
  // ─── STORYBOOK PIPELINE STEP TYPES ─────────────────────────────────────
  | { type: 'scene-transition'; style: 'page-turn' | 'scroll-unroll' | 'iris-wipe' | 'storybook-flip' | 'chapter-card' | 'dissolve-morph'; prompt: string; duration: number }
  | { type: 'storybook-frame'; variant: 'opening' | 'closing' | 'chapter-header'; prompt: string; duration: number }
  | { type: 'character-interaction'; characters: string[]; prompt: string; style?: 'group-shot' | 'duo-argument' | 'standup-circle' | 'farewell-wave' }
  | { type: 'narrator-scroll'; prompt: string; duration: number; dataContent?: string };

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
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Magical lamp emerging from darkness, blue mist swirling outward, sparkle particles filling the frame, a majestic genie silhouette materializing from the mist, cinematic Pixar quality, dramatic volumetric lighting, 8K' },
    { type: 'tts', voice: 'allaudin', scriptKey: 'allaudin-emerge' },
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'title-welcome' },
    { type: 'kinetic-text', text: 'Beyond AI Hype — Episode 2' },
    { type: 'music', prompt: 'Mystical orchestral opening, deep gong reverberating, magical chimes ascending, transitioning to warm podcast intro theme, epic to intimate, 95 BPM', duration: 30, style: 'cinematic' },
    { type: 'sfx', prompt: 'Lamp whoosh with magical mist swirl and sparkle chimes' },
  ],
  'scene-1-cold-open': [
    { type: 'kinetic-text', text: '41 tasks. 5 days. 2 AI developers.' },
    { type: 'tts', voice: 'host', scriptKey: 'cold-open-narration' },
    { type: 'screen-capture', screenIds: ['po-mission-control'], multiCapture: false },
    { type: 'motion-graphics', content: 'sprint-dashboard-montage' },
  ],
  'scene-2-meet-team': [
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'tts', voice: 'host', scriptKey: 'meet-host' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2' },
    { type: 'screen-capture', screenIds: ['po-actions'], multiCapture: false },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-847-lines' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'host-847-response' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-waiting-suboptimal' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'kinetic-text', text: 'NOBODY TOUCHES ANYONE ELSE\'S FILES.' },
  ],
  'scene-3-governance': [
    { type: 'tts', voice: 'host', scriptKey: 'governance-narration' },
    { type: 'screen-capture', screenIds: ['sprint-charter', 'governance-guide'], multiCapture: true },
    { type: 'ai-screen-enhance', screenIds: ['sprint-charter', 'governance-guide'], scriptContext: 'Sprint charter defining territory rules — Claude owns backend, Lovable owns frontend. Governance guide with file ownership boundaries.', enhanceMode: 'highlight', focusAreas: ['territory-map', 'file-ownership-rules', 'merge-conflict-policy'] },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Cinematic aerial fly-through of a divided miniature city: blue crystal towers on left, green garden towers on right, golden bridge connecting them, Pixar-quality 3D, dramatic sunset lighting' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-merge-conflict' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'host-governance-not-overkill' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-read-relevant-sections' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'alibaba-image', model: 'wanx-v2.1', prompt: 'Infographic showing sprint territory map with two color-coded zones (blue Atlas, green Nova), clear boundary lines, task distribution icons, clean professional design' },
  ],
  'scene-4-day1': [
    { type: 'tts', voice: 'host', scriptKey: 'day1-narration' },
    { type: 'screen-capture', screenIds: ['day-1-view'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['day-1-view'], scriptContext: 'Day 1 sprint view — 12 tasks started, Atlas diagnoses 847-line session instructions, Nova refactors navigation. Focus on task cards and status columns.', enhanceMode: 'stylize', focusAreas: ['task-cards', 'status-columns', 'developer-assignments'] },
    { type: 'screen-capture', screenIds: ['findings-qa'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['findings-qa'], scriptContext: 'QA findings from Day 1 — scope creep detected, acceptance criteria discussion. Highlight the finding severity and action items.', enhanceMode: 'highlight', focusAreas: ['finding-severity', 'action-items', 'scope-flags'] },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-refactored-nav' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar 3D animation: fox character unrolls a large paper scroll across a holographic war table, grabs a quill pen and scribbles a sprint board with colorful task columns and sticky notes, bear character takes the quill and adds precise annotations with a ruler, both hold the scroll up to camera proudly — warm lighting, god rays, cinematic quality' },
    { type: 'tts', voice: 'host', scriptKey: 'host-not-in-scope' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-works-better' },
    { type: 'kinetic-text', text: 'Setting acceptance criteria isn\'t optional. It\'s survival.' },
  ],
  'scene-5-day2': [
    { type: 'tts', voice: 'host', scriptKey: 'day2-velocity-narration' },
    { type: 'screen-capture', screenIds: ['day-2-view'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['day-2-view'], scriptContext: 'Day 2 — Nova blocked for 6 hours waiting on PO approval. Velocity dip visible. The frozen task and blocker status are the key story points.', enhanceMode: 'highlight', focusAreas: ['blocked-tasks', 'velocity-dip', 'blocker-status-red'] },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'A frozen task card encased in ice slowly cracking and thawing as a small fox character taps it impatiently, Pixar-quality animation, dramatic lighting' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-blocked-six-hours' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'host-in-a-meeting' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-human-meetings' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'screen-capture', screenIds: ['po-actions'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['po-actions'], scriptContext: 'PO Actions dashboard built to prevent future blockers — async approval queue, priority flags, response time tracking.', enhanceMode: 'stylize', focusAreas: ['approval-queue', 'priority-flags', 'response-times'] },
    { type: 'tts', voice: 'host', scriptKey: 'host-po-actions-built' },
  ],
  'scene-6-day3': [
    { type: 'tts', voice: 'host', scriptKey: 'day3-velocity-mismatch' },
    { type: 'screen-capture', screenIds: ['day-3-view', 'velocity-metrics'], multiCapture: true },
    { type: 'ai-screen-enhance', screenIds: ['day-3-view', 'velocity-metrics'], scriptContext: 'Day 3 velocity mismatch — Claude completing 8 tasks/day vs Lovable at 3. Velocity chart shows diverging lines. The gap is the story.', enhanceMode: 'highlight', focusAreas: ['velocity-comparison-chart', 'task-completion-rates', 'developer-velocity-gap'] },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-scope-now' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'alibaba-video', model: 'wan2.6-i2v', prompt: 'Velocity chart bars growing dynamically with sparkle effects, camera slowly zooming out to reveal full sprint dashboard, smooth cinematic motion', referenceImage: 'velocity-metrics-screenshot' },
  ],
  'scene-7-mission-control': [
    { type: 'tts', voice: 'host', scriptKey: 'mission-control-narration' },
    { type: 'screen-capture', screenIds: ['po-mission-control'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['po-mission-control'], scriptContext: 'PO Mission Control — the async standup replacement. Shows real-time status of both AI developers without meetings. Key: no context-switching cost.', enhanceMode: 'stylize', focusAreas: ['developer-status-cards', 'async-standup-feed', 'blocker-alerts'] },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Split-screen comparison: LEFT side shows chaotic traditional standup with people talking over each other, RIGHT side shows calm AI-powered async standup with organized data flowing smoothly, cinematic quality' },
    { type: 'screen-capture', screenIds: ['standup-entries'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['standup-entries'], scriptContext: 'Async standup entries — structured yesterday/today/blockers format from both AIs. Clean, no meeting needed. Highlight the structured format.', enhanceMode: 'highlight', focusAreas: ['standup-structure', 'blocker-flags', 'handoff-notes'] },
    { type: 'screen-capture', screenIds: ['qa-signoff'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['qa-signoff'], scriptContext: 'QA sign-off dashboard — automated quality gates, test results, approval status per task.', enhanceMode: 'highlight', focusAreas: ['quality-gates', 'approval-badges', 'test-results'] },
    { type: 'screen-capture', screenIds: ['eod-handoff'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['eod-handoff'], scriptContext: 'End-of-day handoff — context transfer between developers for next session continuity.', enhanceMode: 'highlight', focusAreas: ['handoff-summary', 'next-session-priorities', 'dependency-flags'] },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-context-loss' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-200k-window' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'host-forgot-breakfast' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Pixar 3D animation: bear character unrolls a pristine white scroll showing a perfectly straight burndown chart line, then fox character yanks out a crumpled paint-splattered enormous scroll that extends off the table, her chart line zigzags wildly with sticky notes and doodles everywhere, bear reaches for his ruler and fox slaps his paw away — comedic timing, warm studio lighting' },
  ],
  'scene-8-dashboard-tour': [
    { type: 'tts', voice: 'host', scriptKey: 'tour-narration' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2' },
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
    // Animate each screenshot with subtle pan/zoom via Alibaba i2v
    { type: 'alibaba-video', model: 'wan2.6-i2v', prompt: 'Ken Burns style slow zoom and pan across a software dashboard screenshot, subtle particle effects, professional product demo feel', referenceImage: 'auto-captured-screenshots' },
  ],
  'scene-9-numbers': [
    { type: 'tts', voice: 'host', scriptKey: 'numbers-narration' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2' },
    { type: 'alibaba-image', model: 'wanx-v2.1', prompt: '3D comparison infographic table: Traditional Sprint (left, red) vs AI Sprint (right, green), showing metrics — velocity 5x, blockers 0, async standups, clean modern design with depth and shadows' },
    { type: 'alibaba-video', model: 'wan2.6-i2v', prompt: 'Animated infographic with numbers counting up dynamically, bars growing, green checkmarks appearing, professional motion graphics style', referenceImage: 'comparison-infographic' },
    { type: 'screen-capture', screenIds: ['velocity-metrics'], multiCapture: false },
    { type: 'ai-screen-enhance', screenIds: ['velocity-metrics'], scriptContext: 'Final velocity metrics — 41 tasks completed, 5x traditional speed, zero blockers at sprint end. The big number reveal moment.', enhanceMode: 'redraw', focusAreas: ['total-velocity-number', 'completion-percentage', 'zero-blockers-badge'] },
  ],
  'scene-10-whats-next': [
    { type: 'tts', voice: 'host', scriptKey: 'whats-next-narration' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Animated world map with language zones lighting up one by one — Arabic, Hindi, Mandarin, Spanish — each zone pulses with a unique color, camera slowly rotating around a 3D globe, cinematic sci-fi feel' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-language-foundational' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'MCP network diagram coming alive: central hub pulsing with energy, connection lines extending to Jira, GitHub, Slack nodes, data packets flowing as glowing orbs, dark tech background with blue-violet nebula, 3D space visualization' },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Velocity prediction chart animating forward in time, trend line curving upward with confidence intervals fading in, futuristic holographic display style' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-data-quality' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'host-atlas-said' },
  ],
  'scene-11-close': [
    { type: 'avatar-3d', character: 'host', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-3d', character: 'nova', style: 'disney-2d' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'close-takeaway' },
    { type: 'screen-capture', screenIds: ['day-5-view'], multiCapture: false },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'End card: three animated characters (bear, fox, human) standing together in a sunlit forest-tech hub, golden retriever at their feet, woodland creatures gathered around, text "Two AIs, One Sprint, Zero Standup Meetings" floating above in holographic letters, cinematic Pixar quality, warm golden hour lighting, 8K' },
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
      { type: 'sfx', prompt: 'Page turning with subtle ominous undertone, distant thunder rumble', duration: 2 },
    ],
  },
  {
    from: 'scene-9-challenges', to: 'scene-10-whats-next', style: 'dissolve-morph',
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'The stormy illustration dissolves and morphs — raindrops transforming into stars, dark clouds becoming a bright galaxy, the sprint board transforming into a constellation map of connected services, magical metamorphosis, Pixar quality', duration: 3 },
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
