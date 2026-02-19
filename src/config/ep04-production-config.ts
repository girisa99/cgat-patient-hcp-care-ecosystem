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
  characters: {
    atlas: {
      style: '3d-pixar',
      palette: ['#3B82F6', '#7C3AED'],  // Blue/violet
      props: ['wire-frame glasses', 'floating code blocks', 'architectural diagrams'],
      motionStyle: 'measured',          // Stands still, adjusts glasses
      audioProfile: EP04_VOICES.atlas,
      meshyPrompt: 'Pixar-style 3D character, geometric precise features, blue-violet color palette, glowing circuit patterns on clothing, wire-frame glasses with data readouts, calm engineer archetype, stylized proportions, clean render',
    },
    nova: {
      style: '3d-pixar',
      palette: ['#22C55E', '#EC4899'],  // Green/pink gradient
      props: ['glowing stylus/paintbrush', 'floating UI components', 'color swatches'],
      motionStyle: 'expressive',        // Fast gestures, builds UI in mid-air
      audioProfile: EP04_VOICES.nova,
      meshyPrompt: 'Pixar-style 3D character, expressive proportions with bigger eyes, green-pink gradient paint-splash clothing, glowing UI paintbrush that leaves trails, energetic frontend developer archetype, stylized proportions, clean render',
    },
    host: {
      style: '3d-pixar',
      palette: ['#D97706', '#92400E'],  // Warm earth tones
      props: ['half-empty coffee mug', 'sticky notes', 'checklist papers'],
      motionStyle: 'direct',            // Direct to camera, self-deprecating shrug
      audioProfile: EP04_VOICES.host,
      meshyPrompt: 'Pixar-style 3D character, most realistic proportions, warm earth tones, business casual, perpetually half-empty coffee mug, surrounded by sticky notes and checklists, product owner archetype, stylized proportions, clean render',
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
      meshyPrompt: '3D room with floating holographic task cards arranged in Kanban columns, glowing dashboard screens, futuristic tech command center, violet and blue lighting, Pixar-style render quality',
    },
    territoryCity: {
      meshyPrompt: '3D city with two districts: left district blue glass towers with code windows (Atlas), right district green gardens with floating UI components (Nova), red fortress at center border, aerial view, Pixar-style',
    },
    mcpNetwork: {
      meshyPrompt: '3D network diagram with glowing connection nodes: central Supabase hub connected to Jira, Linear, GitHub, Slack nodes with animated data flow lines, dark space background, tech-minimal Pixar style',
    },
  },
} as const;

// ─── SCENE PIPELINE REQUIREMENTS ─────────────────────────────────────────────
// For each scene: what pipelines fire, in what order, with which assets.
// Used by the Cast assembler orchestration layer.
export type ScenePipelineStep =
  | { type: 'tts'; voice: EP04Voice; scriptKey: string }
  | { type: 'screen-capture'; screenIds: string[]; multiCapture: boolean }
  | { type: 'avatar-3d'; character: keyof typeof EP04_AVATAR_CONFIG['characters'] }
  | { type: 'motion-graphics'; content: string }
  | { type: 'kinetic-text'; text: string };

export const EP04_SCENE_PIPELINES: Record<string, ScenePipelineStep[]> = {
  'scene-1-cold-open': [
    { type: 'kinetic-text', text: '41 tasks. 5 days. 2 AI developers.' },
    { type: 'tts', voice: 'host', scriptKey: 'cold-open-narration' },
    { type: 'screen-capture', screenIds: ['po-mission-control'], multiCapture: false },
    { type: 'motion-graphics', content: 'sprint-dashboard-montage' },
  ],
  'scene-2-meet-team': [
    { type: 'avatar-3d', character: 'host' },
    { type: 'tts', voice: 'host', scriptKey: 'meet-host' },
    { type: 'screen-capture', screenIds: ['po-actions'], multiCapture: false },
    { type: 'avatar-3d', character: 'atlas' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-847-lines' },
    { type: 'tts', voice: 'host', scriptKey: 'host-847-response' },
    { type: 'avatar-3d', character: 'nova' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-waiting-suboptimal' },
    { type: 'kinetic-text', text: 'NOBODY TOUCHES ANYONE ELSE\'S FILES.' },
  ],
  'scene-3-governance': [
    { type: 'tts', voice: 'host', scriptKey: 'governance-narration' },
    { type: 'screen-capture', screenIds: ['sprint-charter', 'governance-guide'], multiCapture: true },
    { type: 'motion-graphics', content: 'territory-city-3d' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-merge-conflict' },
    { type: 'tts', voice: 'host', scriptKey: 'host-governance-not-overkill' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-read-relevant-sections' },
    { type: 'motion-graphics', content: 'sprint-overview-infographic' },
  ],
  'scene-4-day1': [
    { type: 'tts', voice: 'host', scriptKey: 'day1-narration' },
    { type: 'screen-capture', screenIds: ['day-1-view'], multiCapture: false },
    { type: 'screen-capture', screenIds: ['findings-qa'], multiCapture: false },
    { type: 'avatar-3d', character: 'atlas' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-refactored-nav' },
    { type: 'tts', voice: 'host', scriptKey: 'host-not-in-scope' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-works-better' },
    { type: 'kinetic-text', text: 'Setting acceptance criteria isn\'t optional. It\'s survival.' },
  ],
  'scene-5-day2': [
    { type: 'tts', voice: 'host', scriptKey: 'day2-velocity-narration' },
    { type: 'screen-capture', screenIds: ['day-2-view'], multiCapture: false },
    { type: 'motion-graphics', content: 'frozen-blocked-task' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-blocked-six-hours' },
    { type: 'tts', voice: 'host', scriptKey: 'host-in-a-meeting' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-human-meetings' },
    { type: 'screen-capture', screenIds: ['po-actions'], multiCapture: false },
    { type: 'tts', voice: 'host', scriptKey: 'host-po-actions-built' },
  ],
  'scene-6-day3': [
    { type: 'tts', voice: 'host', scriptKey: 'day3-velocity-mismatch' },
    { type: 'screen-capture', screenIds: ['day-3-view', 'velocity-metrics'], multiCapture: true },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-scope-now' },
    { type: 'avatar-3d', character: 'atlas' },
    { type: 'avatar-3d', character: 'nova' },
  ],
  'scene-7-mission-control': [
    { type: 'tts', voice: 'host', scriptKey: 'mission-control-narration' },
    { type: 'screen-capture', screenIds: ['po-mission-control'], multiCapture: false },
    { type: 'motion-graphics', content: 'standup-comparison-split' },
    { type: 'screen-capture', screenIds: ['standup-entries'], multiCapture: false },
    { type: 'screen-capture', screenIds: ['qa-signoff'], multiCapture: false },
    { type: 'screen-capture', screenIds: ['eod-handoff'], multiCapture: false },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-context-loss' },
    { type: 'tts', voice: 'nova', scriptKey: 'nova-200k-window' },
    { type: 'tts', voice: 'host', scriptKey: 'host-forgot-breakfast' },
  ],
  'scene-8-dashboard-tour': [
    { type: 'tts', voice: 'host', scriptKey: 'tour-narration' },
    // All 18 screens captured as rapid-cut montage (3-5s each)
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
  ],
  'scene-9-numbers': [
    { type: 'tts', voice: 'host', scriptKey: 'numbers-narration' },
    { type: 'motion-graphics', content: 'comparison-table-3d' },
    { type: 'screen-capture', screenIds: ['velocity-metrics'], multiCapture: false },
    { type: 'motion-graphics', content: 'timeline-comparison' },
  ],
  'scene-10-whats-next': [
    { type: 'tts', voice: 'host', scriptKey: 'whats-next-narration' },
    { type: 'motion-graphics', content: 'world-map-language-zones' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-language-foundational' },
    { type: 'motion-graphics', content: 'mcp-network-diagram' },
    { type: 'motion-graphics', content: 'velocity-prediction-trend' },
    { type: 'tts', voice: 'atlas', scriptKey: 'atlas-data-quality' },
    { type: 'tts', voice: 'host', scriptKey: 'host-atlas-said' },
  ],
  'scene-11-close': [
    { type: 'avatar-3d', character: 'host' },
    { type: 'avatar-3d', character: 'atlas' },
    { type: 'avatar-3d', character: 'nova' },
    { type: 'tts', voice: 'host', scriptKey: 'close-takeaway' },
    { type: 'screen-capture', screenIds: ['day-5-view'], multiCapture: false },
    { type: 'motion-graphics', content: 'end-card-cta' },
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
  // PHASE 3: Visuals — 3D
  { pipeline: '3d-immersive atlas-character',       status: '✅ READY',     edgeFn: 'alibaba-3d-generator',      notes: 'MESHY_API_KEY present; deferred (60-90s/model)' },
  { pipeline: '3d-immersive nova-character',        status: '✅ READY',     edgeFn: 'alibaba-3d-generator',      notes: 'MESHY_API_KEY present; deferred' },
  { pipeline: '3d-immersive host-character',        status: '✅ READY',     edgeFn: 'alibaba-3d-generator',      notes: 'MESHY_API_KEY present; deferred' },
  { pipeline: '3d-immersive environments',          status: '✅ READY',     edgeFn: 'alibaba-3d-generator',      notes: 'Sprint board room, territory city, MCP network' },
  { pipeline: 'infographic-design',                 status: '✅ READY',     edgeFn: 'ai-image-generator',        notes: 'Comparison table, velocity prediction, timeline' },
  // PHASE 3: Visuals — Screens
  { pipeline: 'screen-capture (19 screens)',        status: '✅ AUTO',      edgeFn: 'MultiScreenshotGallery',    notes: 'html2canvas on sprint-tracker tabs; upload to product-screenshots bucket' },
  // PHASE 4: Video Assembly
  { pipeline: 'avatar-lipsync (Pixar chars)',       status: '⚠️ DEFERRED', edgeFn: 'ai-video-generator',        notes: 'Alibaba Wan2.2 → ModelsLab fallback; heavy asset, runs as background job' },
  { pipeline: 'video-generation character scenes',  status: '✅ READY',     edgeFn: 'genie-cast-assembler',      notes: 'Drives avatar scenes via ai-video-generator' },
  { pipeline: 'video-generation motion-graphics',   status: '✅ READY',     edgeFn: 'modelslab-media',           notes: 'AnimateDiff for transitions + motion graphics' },
  { pipeline: 'video-editing final assembly',       status: '✅ READY',     edgeFn: 'genie-cast-assembler',      notes: 'JSON2Video stitch — JSON2VIDEO_API_KEY present' },
  { pipeline: 'thumbnail-generation',               status: '✅ READY',     edgeFn: 'auto-thumbnail-generator',  notes: 'YouTube/LinkedIn thumbnails post-assembly' },
  // PUBLISH
  { pipeline: 'social-publish youtube/linkedin',    status: '✅ SKELETON',  edgeFn: 'social-publish',            notes: 'Phase 3B per CAST_PIPELINE_USAGE_MAP.md' },
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
  { id: 'thumb-1', concept: 'Three Pixar characters at sprint board',     text: '41 Tasks. 5 Days. 2 AIs.' },
  { id: 'thumb-2', concept: 'Sprint dashboard screenshot + "5x FASTER?"', text: '5x Faster?' },
  { id: 'thumb-3', concept: 'Atlas and Nova flanking Host',               text: 'Zero Standup Meetings' },
] as const;
