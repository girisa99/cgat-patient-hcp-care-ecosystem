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

// ─── THREE-VOICE TTS CONFIGURATION ───────────────────────────────────────────
// Each character uses a distinct provider + voice to be distinguishable on audio.
export const EP04_VOICES = {
  /** Host = warm, podcast-style. ElevenLabs Rachel — conversational, direct. */
  host: {
    provider: 'elevenlabs',
    voiceId: 'rachel',          // ElevenLabs voice ID: "Rachel"
    style: 'conversational',
    stability: 0.5,
    similarityBoost: 0.75,
    eqProfile: 'warm',          // Applied in post: slight low-mid warmth
    description: 'Host narration — warm, self-deprecating, direct to camera',
  },
  /** Atlas = measured, slight reverb. Azure Neural "en-US-GuyNeural" */
  atlas: {
    provider: 'azure',
    voiceId: 'en-US-GuyNeural',
    style: 'professional',
    rate: '-5%',                // Slightly slower — measured, precise
    pitch: '-2%',               // Slightly lower — authoritative
    eqProfile: 'reverb',        // Subtle server-room reverb
    description: 'Atlas (Claude) — backend tech lead, measured, calm engineer',
  },
  /** Nova = bright, energetic. ElevenLabs Domi — fast delivery, compressed. */
  nova: {
    provider: 'elevenlabs',
    voiceId: 'domi',            // ElevenLabs voice ID: "Domi"
    style: 'energetic',
    stability: 0.35,            // Less stable = more expressive variation
    similarityBoost: 0.65,
    eqProfile: 'bright',        // Brighter EQ, compressed
    description: 'Nova (Lovable) — frontend dev, fast delivery, energetic',
  },
} as const;

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

// ─── SCENE PIPELINE REQUIREMENTS ─────────────────────────────────────────────
// For each scene: what pipelines fire, in what order, with which assets.
// Used by the Cast assembler orchestration layer.
export type ScenePipelineStep =
  | { type: 'tts'; voice: EP04Voice; scriptKey: string }
  | { type: 'screen-capture'; screenIds: string[]; multiCapture: boolean }
  | { type: 'avatar-3d'; character: keyof typeof EP04_AVATAR_CONFIG['characters']; style?: 'pixar-3d' | 'disney-2d' | 'hybrid-2.5d' }
  | { type: 'avatar-lipsync'; character: keyof typeof EP04_AVATAR_CONFIG['characters']; provider: 'alibaba-wan2.2' | 'alibaba-omniavatar' | 'modelslab' }
  | { type: 'alibaba-video'; model: 'wan2.1-t2v' | 'wan2.6-t2v' | 'wan2.6-i2v' | 'wan2.1-i2v'; prompt: string; referenceImage?: string }
  | { type: 'alibaba-image'; model: 'flux-merged' | 'wanx-v2.1'; prompt: string }
  | { type: 'music'; prompt: string; duration: number; style?: string }
  | { type: 'sfx'; prompt: string; duration?: number }
  | { type: 'motion-graphics'; content: string }
  | { type: 'kinetic-text'; text: string };

// ─── EP04 MUSIC & SFX SCORE ──────────────────────────────────────────────────
// Background music beds and sound effects per scene. Generated via ElevenLabs.
export const EP04_MUSIC_SCORE: Record<string, { music: ScenePipelineStep & { type: 'music' }; sfx?: (ScenePipelineStep & { type: 'sfx' })[] }> = {
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
    { type: 'screen-capture', screenIds: ['findings-qa'], multiCapture: false },
    { type: 'avatar-3d', character: 'atlas', style: 'pixar-3d' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-refactored-nav' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'host-not-in-scope' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-works-better' },
    { type: 'kinetic-text', text: 'Setting acceptance criteria isn\'t optional. It\'s survival.' },
  ],
  'scene-5-day2': [
    { type: 'tts', voice: 'host', scriptKey: 'day2-velocity-narration' },
    { type: 'screen-capture', screenIds: ['day-2-view'], multiCapture: false },
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'A frozen task card encased in ice slowly cracking and thawing as a small fox character taps it impatiently, Pixar-quality animation, dramatic lighting' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-blocked-six-hours' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'host-in-a-meeting' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-human-meetings' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'screen-capture', screenIds: ['po-actions'], multiCapture: false },
    { type: 'tts', voice: 'host', scriptKey: 'host-po-actions-built' },
  ],
  'scene-6-day3': [
    { type: 'tts', voice: 'host', scriptKey: 'day3-velocity-mismatch' },
    { type: 'screen-capture', screenIds: ['day-3-view', 'velocity-metrics'], multiCapture: true },
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
    { type: 'alibaba-video', model: 'wan2.6-t2v', prompt: 'Split-screen comparison: LEFT side shows chaotic traditional standup with people talking over each other, RIGHT side shows calm AI-powered async standup with organized data flowing smoothly, cinematic quality' },
    { type: 'screen-capture', screenIds: ['standup-entries'], multiCapture: false },
    { type: 'screen-capture', screenIds: ['qa-signoff'], multiCapture: false },
    { type: 'screen-capture', screenIds: ['eod-handoff'], multiCapture: false },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-context-loss' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-200k-window' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2' },
    { type: 'tts', voice: 'host', scriptKey: 'host-forgot-breakfast' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2' },
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
// 5 clips per production plan — timestamp references + hooks.
export const EP04_SOCIAL_CLIPS = [
  { id: 'clip-1-847-lines',     timestamp: '1:30–2:00', duration: 30, hook: 'Atlas wrote 847 lines of session instructions. At 11 PM.' },
  { id: 'clip-2-six-hours',     timestamp: '5:45–6:15', duration: 30, hook: 'We were blocked for six hours. Because I was in a meeting.' },
  { id: 'clip-3-110-percent',   timestamp: '7:00–7:30', duration: 30, hook: 'Nova delivered at 110% velocity. By improving things that weren\'t in scope.' },
  { id: 'clip-4-forgot-breakfast', timestamp: '8:30–9:00', duration: 30, hook: 'Atlas: context loss is the primary source of rework. Nova: I have a 200K window. Me: I forgot what I had for breakfast.' },
  { id: 'clip-5-five-x',        timestamp: '10:00–10:30', duration: 30, hook: '5x faster. This isn\'t a claim. It\'s a dashboard you can query.' },
] as const;

// ─── THUMBNAIL OPTIONS CONFIG ─────────────────────────────────────────────────
export const EP04_THUMBNAILS = [
  { id: 'thumb-1', concept: 'The wise bear (Atlas) and energetic fox (Nova) flanking the human PO at a glowing holographic sprint board, golden retriever at their feet, squirrels and owls watching from the board edges, Pixar cinema lighting',     text: '41 Tasks. 5 Days. 2 AIs.' },
  { id: 'thumb-2', concept: 'Split-screen: LEFT = Disney-painted woodland standup circle with animals listening, RIGHT = real sprint dashboard screenshot showing 5x velocity, dramatic diagonal divider with golden sparkles', text: '5x Faster?' },
  { id: 'thumb-3', concept: 'All three characters (bear Atlas, fox Nova, human Host) sitting on a log in a forest clearing turned tech hub, surrounded by their animal companions (owl, hummingbird, golden retriever, squirrels), morning sunlight, "Zero Standup Meetings" floating as holographic text above them, Pixar movie poster composition',               text: 'Zero Standup Meetings' },
] as const;
