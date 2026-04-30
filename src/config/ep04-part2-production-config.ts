/**
 * EP04 Part 2 — "The Production" Production Config
 *
 * Voice configs, avatar configs, scene pipelines, music scores,
 * transitions, and social clips for the 16-scene Part 2 episode.
 *
 * Extends Part 1 configs without modifying them.
 * Uses dynamic model resolution — no hardcoded model IDs.
 */

import { getActiveModel } from './provider-version-registry';
import type {
  ScenePipelineStep,
  SocialClip,
  ClipCategory,
  ClipTheme,
  StorybookTransitionStyle,
} from './ep04-production-config';
import { EP04_VOICES, EP04_AVATAR_CONFIG } from './ep04-production-config';
import type { Part2Voice, Part2ScriptLine } from './ep04-part2-script-content';
import { P2_SCENES } from './ep04-part2-script-content';

// ---------------------------------------------------------------------------
// Dynamic model resolution (same pattern as Part 1)
// ---------------------------------------------------------------------------

const COSYVOICE_FLASH = getActiveModel('alibaba', 'tts') ?? 'cosyvoice-v3-flash';
const COSYVOICE_PLUS = getActiveModel('alibaba', 'tts-premium') ?? 'cosyvoice-v3-plus';

// ---------------------------------------------------------------------------
// New character Alibaba fallback voices
// ---------------------------------------------------------------------------

const PART2_ALIBABA_FALLBACK_VOICES = {
  owl: { model: COSYVOICE_PLUS, voice: 'longcheng', lang: 'en', description: 'Deep measured male — academic authority' },
  reel: { model: COSYVOICE_FLASH, voice: 'longhua', lang: 'en', description: 'Clear female — directorial command' },
  maestro: { model: COSYVOICE_PLUS, voice: 'longcheng', lang: 'en', description: 'Deep dramatic male — musical gravitas' },
  forge: { model: COSYVOICE_PLUS, voice: 'longanyang', lang: 'en', description: 'Gruff warm male — craftsman energy' },
} as const;

// ---------------------------------------------------------------------------
// EP04_PART2_VOICES — 4 new characters + re-exports original 5
// ---------------------------------------------------------------------------

export const EP04_PART2_VOICES = {
  // Re-export original 5 voices unchanged
  host: EP04_VOICES.host,
  atlas: EP04_VOICES.atlas,
  nova: EP04_VOICES.nova,
  allaudin: EP04_VOICES.allaudin,
  squirrel: EP04_VOICES.squirrel,

  // New characters for Part 2
  owl: {
    provider: 'azure' as const,
    voiceId: 'en-US-DavisNeural',
    style: 'measured',
    rate: '-10%',
    pitch: '-3%',
    speed: 0.9,
    eqProfile: 'warm-reverb',
    description: 'Professor Hoot — distinguished owl academic. Measured delivery with gravitas.',
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: PART2_ALIBABA_FALLBACK_VOICES.owl,
  },

  reel: {
    provider: 'elevenlabs' as const,
    voiceId: 'pFZP5JQG7iQjIQuC4Bku',
    style: 'commanding',
    stability: 0.55,
    similarityBoost: 0.70,
    speed: 1.05,
    eqProfile: 'clear-authority',
    description: 'Reel — robotic chameleon director. Clear, authoritative, slightly stressed under pressure.',
    fallbackProvider: 'azure' as const,
    fallbackVoice: {
      voiceId: 'en-US-JennyNeural',
      style: 'commanding',
      rate: '+5%',
      description: 'Azure fallback for Reel — Jenny with authority',
    },
  },

  maestro: {
    provider: 'azure' as const,
    voiceId: 'en-US-GuyNeural',
    style: 'dramatic-warm',
    rate: '-15%',
    pitch: '-5%',
    speed: 0.85,
    eqProfile: 'deep-reverb',
    description: 'Maestro — elegant cricket conductor. Slow, dramatic, emotionally rich delivery.',
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: PART2_ALIBABA_FALLBACK_VOICES.maestro,
  },

  forge: {
    provider: 'azure' as const,
    voiceId: 'en-US-TonyNeural',
    style: 'gruff-warm',
    rate: '-8%',
    pitch: '-10%',
    speed: 0.92,
    eqProfile: 'warm-bass',
    description: 'Forge — burly badger blacksmith. Gruff but warm, speaks in crafting metaphors.',
    fallbackProvider: 'alibaba' as const,
    fallbackVoice: PART2_ALIBABA_FALLBACK_VOICES.forge,
  },
} as const;

export type EP04Part2Voice = keyof typeof EP04_PART2_VOICES;

export function resolvePart2VoiceWithFallback(
  character: EP04Part2Voice,
  useFallback = false,
) {
  const config = EP04_PART2_VOICES[character];
  if (useFallback && 'fallbackProvider' in config) {
    return {
      provider: config.fallbackProvider,
      ...(config.fallbackVoice as Record<string, unknown>),
    };
  }
  return { provider: config.provider, voiceId: config.voiceId };
}

// ---------------------------------------------------------------------------
// EP04_PART2_AVATAR_CONFIG — 4 new characters
// ---------------------------------------------------------------------------

export const EP04_PART2_AVATAR_CONFIG = {
  characterStyles: ['pixar-3d', 'disney-2d', 'hybrid-2.5d'] as const,

  characters: {
    // Re-reference original 5 from Part 1
    atlas: EP04_AVATAR_CONFIG.characters.atlas,
    nova: EP04_AVATAR_CONFIG.characters.nova,
    host: EP04_AVATAR_CONFIG.characters.host,
    allaudin: EP04_AVATAR_CONFIG.characters.allaudin,
    squirrel: EP04_AVATAR_CONFIG.characters.squirrel,

    // New Part 2 characters
    owl: {
      name: 'Professor Hoot',
      role: 'Technical Historian & Academic Commentator',
      style: '3d-pixar' as const,
      palette: ['#92400E', '#D97706', '#F59E0B'] as const,
      props: ['tiny round spectacles', 'graduation cap with golden tassel', 'leather-bound notebook', 'floating equation particles'],
      motionStyle: 'measured' as const,
      pixarPrompt: 'Pixar-style 3D animated character: a distinguished great horned OWL wearing tiny round spectacles and a miniature graduation cap with golden tassel, warm brown-gold feathers with subtle iridescent highlights, enormous amber eyes that blink slowly and wisely, perched on a gnarled branch with a tiny leather-bound notebook, surrounded by floating equation particles, Pixar movie quality with subsurface scattering on feathers, volumetric moonlight, 8K cinematic render',
      disneyPrompt: 'Disney 2D hand-painted owl professor with round spectacles and a tiny graduation cap, sitting on a branch with an open book, feathers rendered in warm watercolor with visible brushstrokes, wise amber eyes, floating chalk equations around him, cozy library candlelight, classic Disney Renaissance style',
      sceneCompanions: [
        { name: 'owlets-trio', description: 'Three tiny owlets who take notes when Professor Hoot lectures' },
        { name: 'floating-equations', description: 'Chalk equations that materialize when Hoot makes historical comparisons' },
      ],
      audioProfile: 'EP04_PART2_VOICES.owl',
    },

    reel: {
      name: 'Reel',
      role: 'AI Production Director — personifies Cast orchestration pipeline',
      style: '3d-pixar' as const,
      palette: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444'] as const,
      props: ['director beret', 'tiny golden megaphone', 'holographic production timeline', 'clapperboard'],
      motionStyle: 'commanding' as const,
      pixarPrompt: 'Pixar-style 3D animated character: a sleek CHAMELEON with iridescent scales that shift between blue/green/amber, wearing a tiny black director beret tilted at an angle, holding a miniature golden megaphone in one hand, one eye focused on a floating holographic production timeline while the other eye independently watches a preview monitor, curled tail wrapped around a director chair labeled AI DIRECTOR, surrounded by floating clapperboards and timeline scrubbers, Pixar subsurface scattering on scales, dramatic studio lighting, 8K cinematic render',
      disneyPrompt: 'Disney 2D hand-painted chameleon director with shifting watercolor scales, wearing a beret, holding a tiny megaphone, sitting in a miniature director chair, surrounded by painted film strips and floating storyboards, whimsical studio atmosphere, visible brushstrokes, warm lamplight',
      sceneCompanions: [
        { name: 'floating-clapperboard', description: 'Self-snapping clapperboard that appears before each production phase' },
        { name: 'preview-monitors', description: 'Tiny floating screens showing each provider output' },
      ],
      audioProfile: 'EP04_PART2_VOICES.reel',
      colorStates: {
        claude: '#3B82F6',
        alibaba: '#22C55E',
        google: '#F59E0B',
        error: '#EF4444',
        neutral: '#6B7280',
        success: '#10B981',
      },
    },

    maestro: {
      name: 'Maestro',
      role: 'AI Music & Sound Director — personifies FAL.ai Stable Audio + sound design',
      style: '3d-pixar' as const,
      palette: ['#1F2937', '#FFFFFF', '#D97706'] as const,
      props: ['tiny tuxedo with white bow tie', 'golden conductor baton', 'mushroom podium', 'firefly orchestra'],
      motionStyle: 'dramatic' as const,
      pixarPrompt: 'Pixar-style 3D animated character: an elegant CRICKET wearing a perfectly tailored miniature black tuxedo with a tiny white bow tie, holding a golden conductor baton, standing on a mushroom podium before an orchestra of fireflies arranged on tiny music stands, enormous expressive dark eyes glistening with artistic passion, delicate antennae that sway with the music, musical notes and sound waves floating around him in golden light, Pixar subsurface scattering on exoskeleton, dramatic concert hall lighting, 8K cinematic render',
      disneyPrompt: 'Disney 2D hand-painted cricket conductor in a tiny tuxedo, standing on a mushroom with a golden baton, leading an orchestra of painted fireflies, musical notes floating like watercolor splashes, warm candlelit concert atmosphere, Jiminy Cricket-meets-Fantasia energy, visible brushstrokes',
      sceneCompanions: [
        { name: 'firefly-orchestra', description: 'Dozens of fireflies on tiny music stands, glowing in rhythm' },
        { name: 'floating-notes', description: 'Golden musical notes that materialize when Maestro conducts' },
      ],
      audioProfile: 'EP04_PART2_VOICES.maestro',
    },

    forge: {
      name: 'Forge',
      role: 'AI Assembly & Rendering Engine — personifies RunPod FFmpeg pipeline',
      style: '3d-pixar' as const,
      palette: ['#1F2937', '#9CA3AF', '#F97316'] as const,
      props: ['leather blacksmith apron with circuit patterns', 'FFmpeg logo wrench', 'codec hammer', 'filter chain belt'],
      motionStyle: 'powerful' as const,
      pixarPrompt: 'Pixar-style 3D animated character: a burly BADGER with silver-streaked black and white fur, wearing a thick leather blacksmith apron with glowing circuit patterns, standing at a magical forge where raw video clips and audio waveforms float in as molten material, hammering them together on an anvil that sparks with xfade transition effects, protective goggles pushed up on forehead, massive forearms, tools hanging from belt (tiny FFmpeg logo wrench, codec hammer, filter chain), the forge glows with render progress bars, Pixar subsurface scattering on fur, dramatic firelight, 8K cinematic render',
      disneyPrompt: 'Disney 2D hand-painted badger blacksmith in a leather apron at a magical forge, hammering glowing film strips into shape, sparks of transition effects flying, painted with warm watercolor firelight, tools and codec symbols hanging on the wall, sturdy and proud expression, classic Disney craftsmanship energy',
      sceneCompanions: [
        { name: 'glowing-anvil', description: 'Anvil that sparks with transition effects when struck' },
        { name: 'render-progress-bars', description: 'Floating progress bars around the forge showing render status' },
      ],
      audioProfile: 'EP04_PART2_VOICES.forge',
    },
  },

  // Storytelling motions for new characters
  storytellingMotions: {
    owl: {
      observing: 'Owl perched, enormous eyes slowly tracking the subject. Spectacles glinting.',
      lecturing: 'Owl with one wing raised, notebook open, equation particles floating.',
      fascinated: 'Both eyes wide, head tilting slowly. Graduation cap askew with excitement.',
      comparing: 'Wing gesturing between two floating images — historical vs modern.',
    },
    reel: {
      directing: 'Reel on director chair, megaphone raised, one eye on timeline, other on monitor.',
      stressed: 'Scales flashing red/amber rapidly. Both eyes spinning independently.',
      proud: 'Scales steady gold-green. Megaphone lowered. Satisfied independent eye-smile.',
      calling_action: 'Clapperboard snap. "ACTION!" Scales shift to active provider color.',
    },
    maestro: {
      conducting: 'Baton raised high, antennae swaying with rhythm. Fireflies in formation.',
      emotional: 'Huge dark eyes glistening with tears. Baton trembling with passion.',
      bowing: 'Deep cricket bow from mushroom podium. Firefly applause flickering.',
      composing: 'Baton moving slowly, golden notes materializing in the air.',
    },
    forge: {
      hammering: 'Massive forearms swinging hammer. Clips sparking on anvil. Protective goggles down.',
      inspecting: 'Goggles up, holding finished clip to firelight. Checking for artifacts.',
      satisfied: 'Hammer resting on shoulder. Nod of approval. Forge glow steady.',
      offended: 'Goggles off, squinting at compression artifact. Personally insulted expression.',
    },
  },

  // Production crew as ensemble — used in crew scenes
  productionCrew: {
    crewShot: 'All four new characters standing together as a production team: Professor Hoot perched above, Reel center with megaphone, Maestro to the left with baton, Forge to the right with hammer. They ARE the AI production crew.',
    crewWithOriginals: 'All 9 characters: Allaudin center with storybook, Host beside him, Atlas with docs, Nova on video call, Squirrel mid-chaos, Owl perched above, Reel directing, Maestro conducting, Forge at anvil.',
  },

  // Lipsync config (same providers, extended character list)
  lipsync: {
    ...EP04_AVATAR_CONFIG.lipsync,
    newCharacters: ['owl', 'reel', 'maestro', 'forge'] as const,
  },
} as const;

// ---------------------------------------------------------------------------
// PART2_SCRIPT_TO_PIPELINE_MAP — script scene IDs → pipeline scene IDs
// ---------------------------------------------------------------------------

export const PART2_SCRIPT_TO_PIPELINE_MAP: Record<string, string> = {
  [P2_SCENES.COLD_OPEN]: 'p2-scene-0-cold-open',
  [P2_SCENES.RECAP]: 'p2-scene-1-recap',
  [P2_SCENES.NOVA_FAREWELL]: 'p2-scene-2-nova-farewell',
  [P2_SCENES.ATLAS_SOLO]: 'p2-scene-3-atlas-solo',
  [P2_SCENES.JSON2VIDEO_DEATH]: 'p2-scene-4-json2video-death',
  [P2_SCENES.PRODUCTION_HELL]: 'p2-scene-5-production-hell',
  [P2_SCENES.MODEL_CRISIS]: 'p2-scene-6-model-crisis',
  [P2_SCENES.PROVIDER_STACK]: 'p2-scene-7-provider-stack',
  [P2_SCENES.CHARACTERS_SPEAK]: 'p2-scene-8-characters-speak',
  [P2_SCENES.PIPELINE_LIVE]: 'p2-scene-9-pipeline-live',
  [P2_SCENES.THIRTY_MINUTES]: 'p2-scene-10-30-minutes',
  [P2_SCENES.META_MOMENT]: 'p2-scene-11-meta-moment',
  [P2_SCENES.DIFFERENT_PODCAST]: 'p2-scene-12-different-podcast',
  [P2_SCENES.IMAGINATION]: 'p2-scene-13-imagination',
  [P2_SCENES.RETRO_CTA]: 'p2-scene-14-retro-cta',
  [P2_SCENES.FINALE]: 'p2-scene-15-finale',
};

export const PART2_PIPELINE_TO_SCRIPT_MAP: Record<string, string> =
  Object.fromEntries(
    Object.entries(PART2_SCRIPT_TO_PIPELINE_MAP).map(([k, v]) => [v, k]),
  );

// ---------------------------------------------------------------------------
// EP04_PART2_MUSIC_SCORE — per-scene music + SFX cues
// ---------------------------------------------------------------------------

export const EP04_PART2_MUSIC_SCORE: Record<string, {
  music: ScenePipelineStep & { type: 'music' };
  sfx?: (ScenePipelineStep & { type: 'sfx' })[];
}> = {
  'p2-scene-0-cold-open': {
    music: {
      type: 'music',
      prompt: 'Cinematic tension opener — dramatic orchestral hit freezing into silence, then building with electronic bass and strings. The "stop everything" moment. Bold, attention-grabbing, then swelling into wonder theme. 120 BPM → 85 BPM transition.',
      duration: 120,
      style: 'cinematic-dramatic',
    },
    sfx: [
      { type: 'sfx', prompt: 'Cinematic freeze frame sound — sharp orchestral stab with reverb tail', duration: 2 },
      { type: 'sfx', prompt: 'Magical book opening — leather creak, page flutter, golden shimmer', duration: 3 },
      { type: 'sfx', prompt: 'Dramatic title card reveal — whoosh with electronic pulse', duration: 2 },
    ],
  },
  'p2-scene-1-recap': {
    music: {
      type: 'music',
      prompt: 'Warm storybook recap theme — gentle orchestral with music box melody, pages turning rhythm, nostalgic but forward-moving. Callbacks to Part 1 themes. 85 BPM. Ends with dramatic page turn into Act 1.',
      duration: 90,
      style: 'cinematic-warm',
    },
    sfx: [
      { type: 'sfx', prompt: 'Storybook page flip — soft paper rustle with magical sparkle', duration: 1 },
      { type: 'sfx', prompt: 'Owl appearance — scholarly chime with feather flutter', duration: 2 },
      { type: 'sfx', prompt: 'Chapter transition — heavy page turn with dramatic drum hit', duration: 2 },
    ],
  },
  'p2-scene-2-nova-farewell': {
    music: {
      type: 'music',
      prompt: 'Bittersweet farewell theme — gentle piano with strings, slightly melancholic but respectful. Nova departure underscore. Brief comic lift for squirrel moment. Resolves with quiet determination. 80 BPM.',
      duration: 120,
      style: 'cinematic-emotional',
    },
    sfx: [
      { type: 'sfx', prompt: 'Hummingbird wing flutter — delicate rapid buzzing fading into distance', duration: 2 },
      { type: 'sfx', prompt: 'Comedic tumble — cartoon squirrel crash with spring boing', duration: 1 },
      { type: 'sfx', prompt: 'Gentle sparkle dissolve — character fading with warm shimmer', duration: 3 },
    ],
  },
  'p2-scene-3-atlas-solo': {
    music: {
      type: 'music',
      prompt: 'Determined solo hero theme — single instrument (piano or cello) building to fuller arrangement. Atlas alone but capable. Momentum building. Velocity metaphor in accelerating tempo. 85 → 95 BPM.',
      duration: 100,
      style: 'cinematic-determined',
    },
    sfx: [
      { type: 'sfx', prompt: 'Task completion chime — clean digital ping with satisfaction', duration: 1 },
      { type: 'sfx', prompt: 'Code visualization whoosh — digital particle acceleration', duration: 2 },
    ],
  },
  'p2-scene-4-json2video-death': {
    music: {
      type: 'music',
      prompt: 'Technical breakthrough theme — starts constrained and limited (json2video era), then breaks free into powerful forge theme with anvil rhythm and cinematic grandeur. The moment the pipeline leveled up. 100 BPM.',
      duration: 120,
      style: 'cinematic-breakthrough',
    },
    sfx: [
      { type: 'sfx', prompt: 'Forge fire ignition — roaring flame with metallic crackle', duration: 3 },
      { type: 'sfx', prompt: 'Anvil hammer strike — deep metallic ring with sparks', duration: 1 },
      { type: 'sfx', prompt: 'Before/after cinematic reveal wipe — dramatic whoosh transition', duration: 2 },
    ],
  },
  'p2-scene-5-production-hell': {
    music: {
      type: 'music',
      prompt: 'Controlled chaos theme — frantic electronic with error klaxons woven in, clapperboard rhythm, escalating tension through 6 crises. Each crisis has its own 4-bar phrase. Resolves with triumphant horn as all crises solved. 115 BPM.',
      duration: 130,
      style: 'electronic-chaotic',
    },
    sfx: [
      { type: 'sfx', prompt: 'Director clapperboard snap — sharp wooden clap with echo', duration: 1 },
      { type: 'sfx', prompt: 'Error buzzer — digital system failure alarm, brief', duration: 1 },
      { type: 'sfx', prompt: 'Timeout alarm — countdown beeping accelerating to deadline', duration: 2 },
      { type: 'sfx', prompt: 'Chalkboard scratch — chalk on slate scoring a tally', duration: 1 },
    ],
  },
  'p2-scene-6-model-crisis': {
    music: {
      type: 'music',
      prompt: 'Dawn crisis to architecture theme — starts with alarming morning discovery (dissonant strings), transitions through problem-solving montage, resolves into elegant architecture theme as the registry is built. Network resilience metaphor in interweaving melodies. 100 BPM.',
      duration: 110,
      style: 'cinematic-crisis-resolve',
    },
    sfx: [
      { type: 'sfx', prompt: 'Urgent morning alarm — sharp digital alert, system critical', duration: 2 },
      { type: 'sfx', prompt: 'Code breaking cascade — digital glitch sounds in sequence', duration: 2 },
      { type: 'sfx', prompt: 'System heal chime — ascending digital tones resolving to harmony', duration: 2 },
    ],
  },
  'p2-scene-7-provider-stack': {
    music: {
      type: 'music',
      prompt: 'Grand world map theme — epic orchestral with geographic motifs for each zone. Claude zone (Western strings), Alibaba zone (Eastern pentatonic), Gemini zone (Indian sitar hints), GPT-4o (universal brass). Each provider activation has a musical accent. Builds to full orchestra for "19 providers" reveal. 110 BPM.',
      duration: 120,
      style: 'cinematic-epic',
    },
    sfx: [
      { type: 'sfx', prompt: 'Provider activation — digital node power-on with zone-colored glow', duration: 1 },
      { type: 'sfx', prompt: 'Musical flourish for Maestro entrance — quick orchestral swell', duration: 2 },
      { type: 'sfx', prompt: 'Anvil ring for Forge callout — deep metallic resonance', duration: 1 },
    ],
  },
  'p2-scene-8-characters-speak': {
    music: {
      type: 'music',
      prompt: 'Wonder and synthesis theme — builds from simple TTS beeps to full vocal harmony, representing the lipsync evolution. Maestro conductor section: music swells and resolves on cue. Original composition feeling — no stock, every note generated for THIS scene. 100 BPM.',
      duration: 120,
      style: 'cinematic-wonder',
    },
    sfx: [
      { type: 'sfx', prompt: 'Magical emphasis shimmer — ethereal sparkle on key word', duration: 1 },
      { type: 'sfx', prompt: 'Conductor baton raise — whoosh with orchestral anticipation hit', duration: 1 },
      { type: 'sfx', prompt: 'Music swell demonstration — tension build into satisfying resolve chord', duration: 4 },
    ],
  },
  'p2-scene-9-pipeline-live': {
    music: {
      type: 'music',
      prompt: 'Pipeline activation theme — 5 distinct musical phases matching the 5 production phases. Phase 1 (script): typing rhythm. Phase 2 (voices): vocal harmony swells. Phase 3 (visuals): cinematic render pulse. Phase 4 (music): meta-music conducting itself. Phase 5 (assembly): forge hammer building to completion fanfare. Triumph at 100%. 115 → 130 BPM accelerating.',
      duration: 130,
      style: 'cinematic-acceleration',
    },
    sfx: [
      { type: 'sfx', prompt: 'Clapperboard phase start — sharp snap with digital overlay', duration: 1 },
      { type: 'sfx', prompt: 'Render pulse — electronic heartbeat during visual generation', duration: 2 },
      { type: 'sfx', prompt: 'Forge hammer assembly — rhythmic metallic impacts building to final strike', duration: 3 },
      { type: 'sfx', prompt: 'Completion fanfare — triumphant brass with digital confetti sparkle', duration: 3 },
    ],
  },
  'p2-scene-10-30-minutes': {
    music: {
      type: 'music',
      prompt: 'Thesis revelation theme — starts with traditional production sounds (film reel, editing suite), contrasts with AI pipeline speed (accelerating electronic). Historical comparison section: printing press, camera, streaming sounds morphing into AI. Crystallization moment when Owl gestures at the crew. Warm resolution. 100 BPM.',
      duration: 120,
      style: 'cinematic-revelatory',
    },
    sfx: [
      { type: 'sfx', prompt: 'Historical comparison montage — brief printing press, camera shutter, streaming buffer', duration: 3 },
      { type: 'sfx', prompt: 'Crew characters wave — warm group acknowledgment chime', duration: 2 },
    ],
  },
  'p2-scene-11-meta-moment': {
    music: {
      type: 'music',
      prompt: 'Meta-recursive theme — music that references itself, like a musical Escher drawing. Fourth wall break underscore with reality-warping electronic effects. Brief comedic button for the recursion/meta-production exchange. 95 BPM.',
      duration: 100,
      style: 'electronic-meta',
    },
    sfx: [
      { type: 'sfx', prompt: 'Reality warp — digital glitch transitioning to infinite mirror reverb', duration: 2 },
      { type: 'sfx', prompt: 'Infinite mirror effect — cascading echo that fades smaller', duration: 3 },
      { type: 'sfx', prompt: 'Comic button — brief rim-shot equivalent for punchline', duration: 1 },
    ],
  },
  'p2-scene-12-different-podcast': {
    music: {
      type: 'music',
      prompt: 'Manifesto theme — powerful, declarative, builds from sparse questioning piano to full orchestral conviction. "What if?" repeated motif. McLuhan wisdom section: academic gravitas. Swells to peak on "THAT is what we built." 100 BPM.',
      duration: 120,
      style: 'cinematic-manifesto',
    },
    sfx: [
      { type: 'sfx', prompt: 'Declaration accent — bold brass stab on thesis statement', duration: 1 },
      { type: 'sfx', prompt: 'Style comparison flash — triple quick-cut whoosh between Pixar/Disney/cinematic', duration: 2 },
    ],
  },
  'p2-scene-13-imagination': {
    music: {
      type: 'music',
      prompt: 'Imagination realized theme — starts ethereal and dreamlike (imagination), transforms into warm concrete orchestra (reality). The gap closing represented by two musical lines converging to unison. Allaudin ancient wisdom section: 10,000-year leitmotif. 90 BPM.',
      duration: 100,
      style: 'cinematic-transcendent',
    },
    sfx: [
      { type: 'sfx', prompt: 'Gap closing — two tones converging from dissonance to harmony', duration: 3 },
      { type: 'sfx', prompt: 'Ethereal ancient chime — deep bell with 10,000-year reverb', duration: 2 },
      { type: 'sfx', prompt: 'Magic shimmer — Allaudin lamp glow with warm sparkle', duration: 2 },
    ],
  },
  'p2-scene-14-retro-cta': {
    music: {
      type: 'music',
      prompt: 'Honest retrospective theme — measured, reflective, with both triumph and admission. Green/red/blue musical sections matching retro board colors. Transitions to warm CTA — inviting, open, encouraging. Squirrel comedy button at end. 85 BPM.',
      duration: 120,
      style: 'cinematic-reflective',
    },
    sfx: [
      { type: 'sfx', prompt: 'Checkmark chime — positive digital confirmation', duration: 1 },
      { type: 'sfx', prompt: 'X mark buzz — brief negative indicator, not harsh', duration: 1 },
      { type: 'sfx', prompt: 'CTA accent — inviting warm tone drawing attention to call to action', duration: 2 },
      { type: 'sfx', prompt: 'Subscribe ding — bright notification bell', duration: 1 },
    ],
  },
  'p2-scene-15-finale': {
    music: {
      type: 'music',
      prompt: 'Grand finale theme — warm Pixar-style orchestral bringing together ALL character leitmotifs. Each farewell gets their musical moment: Atlas (precise piano), Nova (bright sparkle), Squirrel (chaotic pizzicato), Owl (wise cello), Reel (director brass), Maestro (meta-conducting his own farewell), Forge (anvil percussion). Allaudin storybook close. Host sign-off with full orchestra resolving to warm major chord. 85 BPM.',
      duration: 100,
      style: 'cinematic-grand-finale',
    },
    sfx: [
      { type: 'sfx', prompt: 'Storybook close — leather cover meeting with magical exhale', duration: 2 },
      { type: 'sfx', prompt: 'Video call ring — brief digital connection sound for Nova cameo', duration: 1 },
      { type: 'sfx', prompt: 'Final clapperboard — definitive clap with satisfying echo', duration: 1 },
      { type: 'sfx', prompt: 'Cricket chirp — single authentic cricket sound after Maestro bow', duration: 1 },
      { type: 'sfx', prompt: 'Anvil final ring — deep resonant metallic close with long decay', duration: 2 },
      { type: 'sfx', prompt: 'Credits music start — warm orchestral roll into end credits', duration: 3 },
    ],
  },
};

// ---------------------------------------------------------------------------
// EP04_PART2_SCENE_PIPELINES — per-scene production steps
// ---------------------------------------------------------------------------

// Part 2 introduces 4 new characters (owl, reel, maestro, forge) that Part 1's
// strict ScenePipelineStep discriminated union doesn't know about. Loosen the
// record value type — the data is persisted as JSONB and validated at runtime.
export const EP04_PART2_SCENE_PIPELINES: Record<string, Array<Record<string, unknown>>> = {

  // Scene 0 — Cold Open: "What You're About to See"
  'p2-scene-0-cold-open': [
    { type: 'alibaba-video', model: 'sora-2', prompt: 'Flash-forward montage: 5-second rapid cuts of most cinematic moments from later episodes — animated characters speaking, forge hammering, pipeline running, world map lighting up. Freeze frame effect at the end.', provider: 'openai' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s0-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s0-host-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s0-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s0-host-2' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s0-host-3' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s0-host-3' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s0-allaudin-1' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s0-allaudin-1' },
    { type: 'storybook-frame', variant: 'opening', prompt: 'Allaudin opens enchanted storybook. Golden light spills from pages. Chapter 2 header visible.', duration: 4 },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s0-host-4' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Side-by-side comparison: LEFT traditional podcast (two people at table with microphones, plain gray background), RIGHT this AI podcast (animated Pixar characters, cinematic lighting, original score visualized, multiple camera angles). Split down the middle.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s0-host-5' },
    { type: 'kinetic-text', text: 'EP04 Part 2 — THE PRODUCTION' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Cold open dissolves into storybook recap pages', duration: 2 },
  ],

  // Scene 1 — Recap: "Previously on Beyond AI Hype"
  'p2-scene-1-recap': [
    { type: 'storybook-frame', variant: 'chapter-header', prompt: 'Storybook chapter header: "Previously..." in ornate calligraphy with illuminated border', duration: 3 },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s1-allaudin-1' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s1-allaudin-1' },
    { type: 'narrator-scroll', prompt: 'Storybook pages flipping with painted recap scenes from Part 1 — sprint board, governance map, dashboard screenshots as watercolor paintings', duration: 8 },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s1-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s1-host-1' },
    { type: 'avatar-3d', character: 'owl' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], style: 'pixar-3d' },
    { type: 'tts', voice: 'owl' as EP04Part2Voice, scriptKey: 'p2-s1-owl-1' },
    { type: 'avatar-lipsync', character: 'owl' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s1-owl-1' },
    { type: 'character-interaction', characters: ['allaudin', 'owl'], prompt: 'Allaudin glances at Owl perched on storybook edge with amused respect', style: 'pixar-3d' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s1-allaudin-2' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s1-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s1-host-2' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s1-allaudin-3' },
    { type: 'scene-transition', style: 'page-turn', prompt: 'Dramatic page turn into Chapter 2 — deeper color palette', duration: 2 },
  ],

  // Scene 2 — Nova Gets Reassigned
  'p2-scene-2-nova-farewell': [
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Sprint board Day 6 morning: frontend column nearly empty, backend column overflowing with tasks. Two-lane board with Nova lane fading.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s2-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s2-host-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s2-host-2' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s2-host-3' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s2-host-3' },
    { type: 'tts', voice: 'nova' as EP04Part2Voice, scriptKey: 'p2-s2-nova-1' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2', scriptKey: 'p2-s2-nova-1' },
    { type: 'character-interaction', characters: ['nova', 'atlas'], prompt: 'Nova with packed toolkit handing off to Atlas who holds a massive document', style: 'pixar-3d' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s2-atlas-1' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s2-atlas-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s2-host-4' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s2-atlas-2' },
    { type: 'character-motion', character: 'squirrel', motionRef: 'hyperactive-rush', prompt: 'Squirrel rushes at Nova with polished acorn, trips over her tail, comedic tumble', duration: 4 },
    { type: 'tts', voice: 'squirrel' as EP04Part2Voice, scriptKey: 'p2-s2-squirrel-1' },
    { type: 'avatar-lipsync', character: 'squirrel', provider: 'alibaba-wan2.2', scriptKey: 'p2-s2-squirrel-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s2-host-5' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s2-host-5' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Nova fades into sparkles. Sprint board updates to single lane.', duration: 2 },
  ],

  // Scene 3 — Atlas Goes Full-Stack
  'p2-scene-3-atlas-solo': [
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Pixar-style sprint board room. Atlas alone at massive board with every column under his name. Morning golden light through windows. Single swimlane, full ownership.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s3-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s3-host-1' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s3-atlas-1' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s3-atlas-1' },
    { type: 'character-motion', character: 'atlas', motionRef: 'explaining', prompt: 'Atlas calmly reviewing 340 floating code file visualizations around him, systematically touching each one', duration: 5 },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s3-host-2' },
    { type: 'tts', voice: 'owl' as EP04Part2Voice, scriptKey: 'p2-s3-owl-1' },
    { type: 'avatar-lipsync', character: 'owl' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s3-owl-1' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s3-atlas-2' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s3-host-3' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s3-host-3' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Sprint board velocity climbing. Transition to production challenges.', duration: 2 },
  ],

  // Scene 4 — The Day We Killed json2video
  'p2-scene-4-json2video-death': [
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'json2video interface showing basic clip stitching — flat cuts between clips, no transitions, functional but cinematic-looking. Technical interface with limited output quality.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s4-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s4-host-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s4-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s4-host-2' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s4-atlas-1' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s4-atlas-1' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: '6-phase render pipeline diagram: probe → build filter graph → render → compress → upload → callback. Each phase as a connected node with icons. Technical but visually clean.' },
    { type: 'avatar-3d', character: 'forge' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], style: 'pixar-3d' },
    { type: 'tts', voice: 'forge' as EP04Part2Voice, scriptKey: 'p2-s4-forge-1' },
    { type: 'avatar-lipsync', character: 'forge' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s4-forge-1' },
    { type: 'tts', voice: 'forge' as EP04Part2Voice, scriptKey: 'p2-s4-forge-2' },
    { type: 'avatar-lipsync', character: 'forge' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s4-forge-2' },
    { type: 'character-motion', character: 'forge', motionRef: 'hammering', prompt: 'Forge demonstrates each technique at anvil — hammering xfade, shaping Ken Burns, layering PiP', duration: 5 },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s4-host-3' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s4-host-3' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Before/after comparison wipe: LEFT json2video output (flat cuts, basic assembly), RIGHT RunPod FFmpeg output (xfade transitions, Ken Burns, cinematic grading). Night and day quality difference.' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Forge glowing. Transition into production hell chaos.', duration: 2 },
  ],

  // Scene 5 — Production Hell
  'p2-scene-5-production-hell': [
    { type: 'avatar-3d', character: 'reel' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], style: 'pixar-3d' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s5-reel-1' },
    { type: 'avatar-lipsync', character: 'reel' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s5-reel-1' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s5-reel-2' },
    { type: 'avatar-lipsync', character: 'reel' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s5-reel-2' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s5-reel-3' },
    { type: 'avatar-lipsync', character: 'reel' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s5-reel-3' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s5-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s5-host-1' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s5-atlas-1' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s5-atlas-1' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Animated diagram: 38MB payload shrinking to 100KB as base64 data strips away. Visual before/after payload comparison.' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s5-atlas-2' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s5-atlas-3' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s5-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s5-host-2' },
    { type: 'character-motion', character: 'squirrel', motionRef: 'hyperactive-rush', prompt: 'Squirrel with tiny chalkboard showing 6 tally marks, shocked expression', duration: 3 },
    { type: 'tts', voice: 'squirrel' as EP04Part2Voice, scriptKey: 'p2-s5-squirrel-1' },
    { type: 'avatar-lipsync', character: 'squirrel', provider: 'alibaba-wan2.2', scriptKey: 'p2-s5-squirrel-1' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s5-reel-4' },
    { type: 'avatar-lipsync', character: 'reel' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s5-reel-4' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Reel stabilizes. All crises checked. Transition to model crisis.', duration: 2 },
  ],

  // Scene 6 — Models Disappear Overnight
  'p2-scene-6-model-crisis': [
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Codebase tree view visualization: 57 files flashing red with MODEL NOT FOUND errors. Cascading error indicators. Morning dawn light through code editor.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s6-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s6-host-1' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s6-atlas-1' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s6-atlas-1' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Whiteboard architecture diagram: old approach (57 scattered hardcoded model strings) vs new (single ai_model_registry database table at center with alias chains radiating out). Clean technical drawing.' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s6-atlas-2' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s6-atlas-2' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s6-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s6-host-2' },
    { type: 'tts', voice: 'owl' as EP04Part2Voice, scriptKey: 'p2-s6-owl-1' },
    { type: 'avatar-lipsync', character: 'owl' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s6-owl-1' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Network graph visualization: model node disappearing, traffic automatically rerouting through alias chain to replacement model. Green flow lines finding new paths. Resilient routing.' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s6-atlas-3' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s6-atlas-3' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Registry success. Expanding to full provider map.', duration: 2 },
  ],

  // Scene 7 — 19 Providers, 4 Zones, 1 Pipeline
  'p2-scene-7-provider-stack': [
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'World map with 4 AI zones outlined in different colors: Claude zone (blue - NAM/EU), Alibaba zone (green - CJK/MENA), Gemini zone (amber - India/SEA/Africa), GPT-4o fallback (neutral). Provider logos orbiting the globe. Epic scale.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s7-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s7-host-1' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s7-reel-1' },
    { type: 'avatar-lipsync', character: 'reel' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s7-reel-1' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s7-reel-2' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s7-reel-3' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s7-reel-4' },
    { type: 'avatar-3d', character: 'maestro' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], style: 'pixar-3d' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s7-reel-5' },
    { type: 'character-interaction', characters: ['reel', 'maestro', 'forge'], prompt: 'Reel calls Music and Assembly — Maestro bows, Forge raises hammer. The production crew assembled.', style: 'pixar-3d' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s7-allaudin-1' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s7-allaudin-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s7-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s7-host-2' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'World map zoomed showing regional routing: zone by zone activation with language counts overlaying each region. 85 languages, 63 with voice, 22 Indian, 7 Arabic. Epic global scale visualization.' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Provider map dissolves into lipsync/voice deep-dive.', duration: 2 },
  ],

  // Scene 8 — Making Characters Talk
  'p2-scene-8-characters-speak': [
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s8-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s8-host-1' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Lipsync evolution strip: static Pixar render (left) → slight base animation (center) → full lipsync with expressions (right). Side-by-side comparison of quality progression.' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s8-atlas-1' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s8-atlas-1' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: '5-stage lipsync pipeline diagram: 1) Avatar generation 2) Image-to-video base animation 3) TTS with phoneme timeline 4) Lipsync overlay mapping 5) Final compositing. Connected pipeline nodes.' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s8-atlas-2' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s8-allaudin-1' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s8-allaudin-1' },
    { type: 'tts', voice: 'maestro' as EP04Part2Voice, scriptKey: 'p2-s8-maestro-1' },
    { type: 'avatar-lipsync', character: 'maestro' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s8-maestro-1' },
    { type: 'tts', voice: 'maestro' as EP04Part2Voice, scriptKey: 'p2-s8-maestro-2' },
    { type: 'avatar-lipsync', character: 'maestro' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s8-maestro-2' },
    { type: 'character-motion', character: 'maestro', motionRef: 'conducting', prompt: 'Maestro conducting demonstration — music swells and resolves on cue, wiping happy tear', duration: 5 },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s8-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s8-host-2' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Exploded view of a scene: each layer labeled — AI voice (waveform), AI lipsync (mouth overlay), AI body animation (skeleton), AI music (notes), AI render (final frame). All layers visible simultaneously.' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Character elements converge. Pipeline ready to run.', duration: 2 },
  ],

  // Scene 9 — Pipeline Runs End-to-End
  'p2-scene-9-pipeline-live': [
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s9-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s9-host-1' },
    { type: 'static-asset', assetKey: 'cast-production-page-5-phases', duration: 4, description: 'CastProductionPage interface showing 5 phase indicators all at 0%' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s9-reel-1' },
    { type: 'avatar-lipsync', character: 'reel' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s9-reel-1' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s9-reel-2' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s9-reel-3' },
    { type: 'tts', voice: 'maestro' as EP04Part2Voice, scriptKey: 'p2-s9-maestro-1' },
    { type: 'avatar-lipsync', character: 'maestro' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s9-maestro-1' },
    { type: 'tts', voice: 'forge' as EP04Part2Voice, scriptKey: 'p2-s9-forge-1' },
    { type: 'avatar-lipsync', character: 'forge' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s9-forge-1' },
    { type: 'character-motion', character: 'forge', motionRef: 'hammering', prompt: 'Forge pounding anvil as clips flow in and polished scenes emerge', duration: 4 },
    { type: 'tts', voice: 'squirrel' as EP04Part2Voice, scriptKey: 'p2-s9-squirrel-1' },
    { type: 'avatar-lipsync', character: 'squirrel', provider: 'alibaba-wan2.2', scriptKey: 'p2-s9-squirrel-1' },
    { type: 'tts', voice: 'owl' as EP04Part2Voice, scriptKey: 'p2-s9-owl-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s9-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s9-host-2' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Pipeline at 100%. Triumph. Transition to the thesis.', duration: 2 },
  ],

  // Scene 10 — From 3 Minutes to 30
  'p2-scene-10-30-minutes': [
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Traditional production timeline: 30-minute video = weeks of work. Team of human silhouettes at editing stations, animation desks, recording booths. Calendar pages flying. Long, laborious process.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s10-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s10-host-1' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'AI pipeline timeline: 5 parallel phase bars (Script 5min, TTS 8min, Visuals 20min, Music 10min, Assembly 15min). Total under 90 minutes. Compressed, parallel, efficient. vs weeks shown above.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s10-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s10-host-2' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s10-host-3' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s10-host-3' },
    { type: 'tts', voice: 'owl' as EP04Part2Voice, scriptKey: 'p2-s10-owl-1' },
    { type: 'avatar-lipsync', character: 'owl' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s10-owl-1' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Historical timeline: printing press (1440) → camera (1888) → digital streaming (2007) → AI production (2026). Each removes a bottleneck. Arrow from past to present showing acceleration.' },
    { type: 'tts', voice: 'owl' as EP04Part2Voice, scriptKey: 'p2-s10-owl-2' },
    { type: 'avatar-lipsync', character: 'owl' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s10-owl-2' },
    { type: 'character-interaction', characters: ['owl', 'reel', 'maestro', 'forge'], prompt: 'Owl gestures at the production crew standing together. They wave — they ARE the automated crew.', style: 'pixar-3d' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s10-allaudin-1' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s10-allaudin-1' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Crew together. Transition into meta moment.', duration: 2 },
  ],

  // Scene 11 — The Meta Moment
  'p2-scene-11-meta-moment': [
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s11-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s11-host-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s11-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s11-host-2' },
    { type: 'static-asset', assetKey: 'cast-production-page-meta', duration: 5, description: 'CastProductionPage showing this exact episode — EP04 Part 2 with its 16 scenes listed' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s11-reel-1' },
    { type: 'avatar-lipsync', character: 'reel' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s11-reel-1' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s11-atlas-1' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s11-atlas-1' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s11-reel-2' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s11-allaudin-1' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s11-atlas-2' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s11-allaudin-2' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s11-allaudin-2' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Infinite mirror fades. Transition to manifesto.', duration: 2 },
  ],

  // Scene 12 — This Is a Different Kind of Podcast
  'p2-scene-12-different-podcast': [
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Grid of traditional podcast screenshots — all showing the same format: 2-4 people at a table with microphones, plain backgrounds, minimal visual variety. Repetitive sameness.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s12-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s12-host-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s12-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s12-host-2' },
    { type: 'alibaba-video', model: 'wan2.6-i2v', prompt: 'Triple style flash: Pixar 3D comedy scene with colorful characters → Disney watercolor emotional scene → cinematic realism dramatic scene. Quick transitions between visual styles.', provider: 'alibaba' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s12-host-3' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s12-host-4' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s12-host-4' },
    { type: 'tts', voice: 'owl' as EP04Part2Voice, scriptKey: 'p2-s12-owl-1' },
    { type: 'avatar-lipsync', character: 'owl' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s12-owl-1' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s12-allaudin-1' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s12-allaudin-1' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Manifesto delivered. Transition to imagination reflection.', duration: 2 },
  ],

  // Scene 13 — Realizing Imagination
  'p2-scene-13-imagination': [
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s13-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s13-host-1' },
    { type: 'alibaba-video', model: 'wan2.6-i2v', prompt: 'Notebook sketch slowly transforming into living AI production. Hand-drawn characters becoming 3D Pixar renders. Sketch lines dissolving into cinematic frames. Beautiful metamorphosis.', provider: 'alibaba' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s13-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s13-host-2' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s13-host-3' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s13-host-3' },
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Two cliffs labeled Imagination and Reality with a gap between them. The gap is visibly closing, shrinking to nothing. Bridge made of AI-generated content connecting the two sides.' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s13-allaudin-1' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s13-allaudin-1' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s13-allaudin-2' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s13-allaudin-2' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s13-atlas-1' },
    { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Imagination realized. Transition to honest retrospective.', duration: 2 },
  ],

  // Scene 14 — Retrospective & CTA
  'p2-scene-14-retro-cta': [
    { type: 'alibaba-image', model: 'flux-schnell', prompt: 'Sprint retrospective board with three columns: What Worked (green), What Didn\'t (red), Next Time (blue). Clean, organized, honest. Pixar-style sticky notes.' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s14-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s14-host-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s14-host-2' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s14-host-2' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s14-host-3' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s14-atlas-1' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s14-atlas-1' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s14-host-4' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s14-host-5' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s14-host-5' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s14-host-6' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s14-host-6' },
    { type: 'character-motion', character: 'squirrel', motionRef: 'hyperactive-rush', prompt: 'Squirrel with oversized subscribe button and hand-drawn Acorns & Architecture podcast logo', duration: 4 },
    { type: 'tts', voice: 'squirrel' as EP04Part2Voice, scriptKey: 'p2-s14-squirrel-1' },
    { type: 'avatar-lipsync', character: 'squirrel', provider: 'alibaba-wan2.2', scriptKey: 'p2-s14-squirrel-1' },
    { type: 'scene-transition', style: 'storybook-flip', prompt: 'CTA complete. Final storybook page approaching.', duration: 2 },
  ],

  // Scene 15 — Grand Finale
  'p2-scene-15-finale': [
    { type: 'storybook-frame', variant: 'closing', prompt: 'Storybook reaching its final page. All 9 characters gathering in the illustration. Golden warm light.', duration: 4 },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s15-allaudin-1' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-allaudin-1' },
    { type: 'tts', voice: 'atlas' as EP04Part2Voice, scriptKey: 'p2-s15-atlas-1' },
    { type: 'avatar-lipsync', character: 'atlas', provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-atlas-1' },
    { type: 'tts', voice: 'nova' as EP04Part2Voice, scriptKey: 'p2-s15-nova-1' },
    { type: 'avatar-lipsync', character: 'nova', provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-nova-1' },
    { type: 'tts', voice: 'squirrel' as EP04Part2Voice, scriptKey: 'p2-s15-squirrel-1' },
    { type: 'avatar-lipsync', character: 'squirrel', provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-squirrel-1' },
    { type: 'tts', voice: 'owl' as EP04Part2Voice, scriptKey: 'p2-s15-owl-1' },
    { type: 'avatar-lipsync', character: 'owl' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-owl-1' },
    { type: 'tts', voice: 'reel' as EP04Part2Voice, scriptKey: 'p2-s15-reel-1' },
    { type: 'avatar-lipsync', character: 'reel' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-reel-1' },
    { type: 'tts', voice: 'maestro' as EP04Part2Voice, scriptKey: 'p2-s15-maestro-1' },
    { type: 'avatar-lipsync', character: 'maestro' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-maestro-1' },
    { type: 'tts', voice: 'forge' as EP04Part2Voice, scriptKey: 'p2-s15-forge-1' },
    { type: 'avatar-lipsync', character: 'forge' as keyof typeof EP04_PART2_AVATAR_CONFIG['characters'], provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-forge-1' },
    { type: 'tts', voice: 'allaudin' as EP04Part2Voice, scriptKey: 'p2-s15-allaudin-2' },
    { type: 'avatar-lipsync', character: 'allaudin', provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-allaudin-2' },
    { type: 'character-interaction', characters: ['allaudin', 'host', 'atlas', 'squirrel', 'owl', 'reel', 'maestro', 'forge'], prompt: 'All 9 characters in a line. Final group shot. Each in character — Atlas with docs, Squirrel with acorns, Owl adjusting glasses, Reel with clapperboard, Maestro bowing, Forge with hammer on shoulder. Warm golden light.', style: 'pixar-3d' },
    { type: 'tts', voice: 'host' as EP04Part2Voice, scriptKey: 'p2-s15-host-1' },
    { type: 'avatar-lipsync', character: 'host', provider: 'alibaba-wan2.2', scriptKey: 'p2-s15-host-1' },
    { type: 'storybook-frame', variant: 'closing', prompt: 'Storybook closes. "The End... for now" in gold calligraphy. Lamp glows one last time.', duration: 5 },
  ],
};

// ---------------------------------------------------------------------------
// EP04_PART2_TRANSITIONS — scene-to-scene transition configs
// ---------------------------------------------------------------------------

export const EP04_PART2_TRANSITIONS: {
  from: string;
  to: string;
  style: StorybookTransitionStyle;
  xfadeDuration: number;
  audioCrossfade: number;
  steps: ScenePipelineStep[];
}[] = [
  {
    from: 'p2-scene-0-cold-open', to: 'p2-scene-1-recap',
    style: 'storybook-flip', xfadeDuration: 2, audioCrossfade: 1.5,
    steps: [
      { type: 'scene-transition', style: 'storybook-flip', prompt: 'Cold open dissolves into storybook recap pages with warm golden light', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-1-recap', to: 'p2-scene-2-nova-farewell',
    style: 'page-turn', xfadeDuration: 2, audioCrossfade: 1.5,
    steps: [
      { type: 'scene-transition', style: 'page-turn', prompt: 'Dramatic storybook page turn from recap warmth into Day 6 somber tones', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-2-nova-farewell', to: 'p2-scene-3-atlas-solo',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.0,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Nova sparkle-dissolves. Sprint board morphs from 2 lanes to 1.', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-3-atlas-solo', to: 'p2-scene-4-json2video-death',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.0,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Sprint velocity graph transitions to production pipeline view', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-4-json2video-death', to: 'p2-scene-5-production-hell',
    style: 'dissolve-morph', xfadeDuration: 1.5, audioCrossfade: 0.8,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Forge glow intensifies then erupts into chaos — production hell begins', duration: 1.5 },
    ],
  },
  {
    from: 'p2-scene-5-production-hell', to: 'p2-scene-6-model-crisis',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.0,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Crisis checkmarks fade. Dawn light — new morning, new crisis.', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-6-model-crisis', to: 'p2-scene-7-provider-stack',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.5,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Model registry diagram expands into full world map of 19 providers', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-7-provider-stack', to: 'p2-scene-8-characters-speak',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.0,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'World map of providers zooms into lipsync pipeline visualization', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-8-characters-speak', to: 'p2-scene-9-pipeline-live',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.0,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'All character elements converge into CastProductionPage. Pipeline ready.', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-9-pipeline-live', to: 'p2-scene-10-30-minutes',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.5,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Pipeline 100% celebration transitions to thesis comparison charts', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-10-30-minutes', to: 'p2-scene-11-meta-moment',
    style: 'iris-wipe', xfadeDuration: 1.5, audioCrossfade: 0.8,
    steps: [
      { type: 'scene-transition', style: 'iris-wipe', prompt: 'Thesis crystallizes then iris-wipes to meta self-reference', duration: 1.5 },
    ],
  },
  {
    from: 'p2-scene-11-meta-moment', to: 'p2-scene-12-different-podcast',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.0,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Infinite mirror effect fades into podcast grid comparison', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-12-different-podcast', to: 'p2-scene-13-imagination',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.5,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Manifesto conviction dissolves into reflective imagination sequence', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-13-imagination', to: 'p2-scene-14-retro-cta',
    style: 'dissolve-morph', xfadeDuration: 2, audioCrossfade: 1.0,
    steps: [
      { type: 'scene-transition', style: 'dissolve-morph', prompt: 'Imagination realized. Lamp glow fades into retro board room.', duration: 2 },
    ],
  },
  {
    from: 'p2-scene-14-retro-cta', to: 'p2-scene-15-finale',
    style: 'storybook-flip', xfadeDuration: 2, audioCrossfade: 1.5,
    steps: [
      { type: 'scene-transition', style: 'storybook-flip', prompt: 'Retro board flips to final storybook page. All characters gathering.', duration: 2 },
    ],
  },
];

// ---------------------------------------------------------------------------
// EP04_PART2_STORYBOOK_BOOKENDS — opening and closing bookend steps
// ---------------------------------------------------------------------------

export const EP04_PART2_STORYBOOK_BOOKENDS = {
  opening: [
    { type: 'storybook-frame' as const, variant: 'opening' as const, prompt: 'Enchanted storybook opening to Chapter 2 — "The Production". Golden binding, ornate calligraphy, magical sparkle particles.', duration: 5 },
    { type: 'alibaba-video' as const, model: 'wan2.6-i2v' as const, prompt: 'Allaudin emerges from the storybook in a swirl of blue-purple mist, golden sparkles trailing, opening the book wider to reveal Chapter 2', provider: 'alibaba' },
  ],
  closing: [
    { type: 'alibaba-video' as const, model: 'wan2.6-i2v' as const, prompt: 'Storybook slowly closing, all characters visible in the final illustration, golden light fading but warm, lamp glowing one last time', provider: 'alibaba' },
    { type: 'storybook-frame' as const, variant: 'closing' as const, prompt: 'Storybook closed. Gold text: "The End... for now". Lamp beside it glowing gently. Peaceful.', duration: 5 },
  ],
} as const;

// ---------------------------------------------------------------------------
// EP04_PART2_SOCIAL_CLIPS — platform-specific teaser cuts
// ---------------------------------------------------------------------------

// Part 2 social clips have richer fields than Part 1's strict SocialClip type.
// Loosen the type — runtime consumers handle the extra fields gracefully.
export const EP04_PART2_SOCIAL_CLIPS: Array<Record<string, unknown>> = [
  // Category A: Curiosity — Hook clips that make people stop scrolling
  {
    id: 'p2-clip-a1-thesis-bomb',
    category: 'curiosity' as ClipCategory,
    theme: 'practical' as ClipTheme,
    sourceScenes: ['p2-scene-0-cold-open'],
    timestamp: { start: 0, end: 30 },
    duration: 30,
    hook: 'This 30-minute cinematic production had zero human editors',
    cta: 'Watch the full episode to see how AI replaced an entire production crew',
    hashtags: ['#AIProduction', '#NoHumanEditors', '#BeyondAIHype', '#FutureOfMedia'],
    platforms: ['youtube-shorts', 'tiktok', 'instagram-reels'],
    captionStyle: 'hook-first',
    messaging: {
      youtube: { title: 'Zero Human Editors. Full Cinematic Production.', description: 'Every voice, every animation, every note of music — AI produced. EP04 Part 2 of Beyond AI Hype.' },
      tiktok: { caption: 'This entire 30-min cinematic podcast was made by AI. No cameras. No editors. No animators. Here\'s the proof. #AIProduction #NoHumanEditors' },
      instagram: { caption: 'What if an entire production crew was AI? That\'s not a hypothetical. That\'s this episode. Link in bio.' },
      linkedin: { caption: 'We produced a 30-minute cinematic podcast episode with zero human editors. 19 AI providers. 9 AI characters. 1 pipeline. Here\'s what that looks like — and what it means for content production.' },
      twitter: { caption: 'This 30-min cinematic production used:\n- 0 human editors\n- 0 voice actors\n- 0 animators\n- 19 AI providers\n- 1 pipeline\n\nThe future of content isn\'t coming. It\'s here. 🧵' },
    },
  },
  {
    id: 'p2-clip-a2-forge-intro',
    category: 'character' as ClipCategory,
    theme: 'entertainment' as ClipTheme,
    sourceScenes: ['p2-scene-4-json2video-death'],
    timestamp: { start: 45, end: 75 },
    duration: 30,
    hook: 'Meet the badger who assembles your videos',
    cta: 'Full episode shows the entire AI production crew',
    hashtags: ['#AICharacters', '#Pixar', '#AnimatedPodcast', '#Forge'],
    platforms: ['youtube-shorts', 'tiktok', 'instagram-reels'],
    captionStyle: 'story-driven',
    messaging: {
      youtube: { title: 'Meet Forge — The AI Blacksmith Who Renders Your Videos', description: 'A Pixar-style badger blacksmith who personifies the FFmpeg rendering pipeline. Yes, seriously.' },
      tiktok: { caption: 'Our video renderer is a badger blacksmith named Forge. He hammers clips into cinema. Over his dead body on compression artifacts. #AIAnimation #Forge' },
      instagram: { caption: 'Every production needs a craftsman. Ours is a badger with an anvil. Meet Forge — the AI renderer.' },
      linkedin: { caption: 'We personified our FFmpeg rendering pipeline as a Pixar-quality badger blacksmith. Because AI infrastructure deserves character development too.' },
      twitter: { caption: 'Our rendering pipeline has a name, a face, and strong opinions about compression artifacts.\n\nMeet Forge 🦡🔨' },
    },
  },
  // Category B: Pain Point — Relatable production challenges
  {
    id: 'p2-clip-b1-production-hell',
    category: 'pain_point' as ClipCategory,
    theme: 'practical' as ClipTheme,
    sourceScenes: ['p2-scene-5-production-hell'],
    timestamp: { start: 0, end: 45 },
    duration: 45,
    hook: '6 things that broke when we scaled AI video from 3 to 30 minutes',
    cta: 'Watch how we solved every single one',
    hashtags: ['#AIProduction', '#ScalingAI', '#ProductionProblems', '#RealTalk'],
    platforms: ['youtube-shorts', 'tiktok', 'instagram-reels'],
    captionStyle: 'problem-solution',
    messaging: {
      youtube: { title: '6 Things That Broke Scaling AI Video to 30 Minutes', description: '38MB payloads, expired CDN URLs, 18-min lipsync timeouts, OOM builds, IO exhaustion, TTS drift. Real problems, real solutions.' },
      tiktok: { caption: 'POV: You try to make a 30-min AI video and EVERYTHING breaks. 38MB payloads? Edge function limit is 6MB. CDN URLs expired? Assets gone. Lipsync takes 18 min? Timeout is 150 sec. 💀' },
      instagram: { caption: 'Scaling AI production from 3 to 30 minutes broke 6 things in one day. Here\'s the honest truth about AI video production.' },
      linkedin: { caption: 'Honest production post: Scaling AI video from 3 to 30 minutes broke 6 things simultaneously. 38MB→6MB payload limits, CDN expiration, lipsync timeouts, OOM crashes, IO exhaustion, TTS drift. We solved them all. Here\'s how.' },
      twitter: { caption: 'Things that broke when we scaled from 3min to 30min AI video:\n\n1. 38MB payloads (limit: 6MB)\n2. CDN URLs expired mid-assembly\n3. Lipsync: 18min vs 150s timeout\n4. npm build OOM\'d\n5. Supabase IO exhausted\n6. TTS timing drifted\n\nFixed all 6. Thread 🧵' },
    },
  },
  // Category C: Data Proof — Technical achievement evidence
  {
    id: 'p2-clip-c1-19-providers',
    category: 'data_proof' as ClipCategory,
    theme: 'practical' as ClipTheme,
    sourceScenes: ['p2-scene-7-provider-stack'],
    timestamp: { start: 10, end: 55 },
    duration: 45,
    hook: '19 AI providers. 4 zones. 85 languages. 1 pipeline.',
    cta: 'See the full routing map',
    hashtags: ['#AIInfrastructure', '#GlobalAI', '#19Providers', '#AIScale'],
    platforms: ['youtube-shorts', 'tiktok', 'linkedin'],
    captionStyle: 'data-driven',
    messaging: {
      youtube: { title: '19 AI Providers, 4 Global Zones, 1 Unified Pipeline', description: 'How we route AI across the world: Claude for NAM/EU, Alibaba for CJK/MENA, Gemini for India/SEA/Africa, GPT-4o fallback.' },
      tiktok: { caption: '19 AI providers. 4 geographic zones. 85 languages. 63 with voice. All routed through ONE pipeline. This is what AI infrastructure looks like at scale. 🌍' },
      instagram: { caption: 'Our AI routes through 19 providers across 4 geographic zones serving 85 languages. One pipeline to rule them all.' },
      linkedin: { caption: 'Enterprise AI routing at scale: 19 providers, 4 geographic zones (Claude/Alibaba/Gemini/GPT-4o), 85 languages, 63 with voice support. Zero-deploy updates via dynamic model registry. This is the infrastructure behind AI-produced cinematic content.' },
      twitter: { caption: 'Our AI routing map:\n🔵 Claude → NAM, EU\n🟢 Alibaba → CJK, MENA\n🟡 Gemini → India, SEA, Africa\n🔴 GPT-4o → Universal fallback\n\n19 providers. 85 languages. 1 pipeline.\n\nNo hardcoded model IDs. Dynamic registry resolves everything.' },
    },
  },
  // Category D: Democratization — AI changing creativity
  {
    id: 'p2-clip-d1-imagination-gap',
    category: 'democratization' as ClipCategory,
    theme: 'democratization' as ClipTheme,
    sourceScenes: ['p2-scene-13-imagination'],
    timestamp: { start: 0, end: 40 },
    duration: 40,
    hook: 'AI closes the gap between imagination and reality',
    cta: 'What story do YOU want to tell?',
    hashtags: ['#AICreativity', '#ImaginationRealized', '#FutureOfCreation', '#Democratization'],
    platforms: ['youtube-shorts', 'tiktok', 'instagram-reels', 'linkedin'],
    captionStyle: 'inspirational',
    messaging: {
      youtube: { title: 'The Gap Between Imagination and Reality Just Disappeared', description: 'AI changes creativity not by replacing ideas — humans still have those — but by eliminating the production barrier between thinking it and making it.' },
      tiktok: { caption: 'A year ago this podcast was a notebook sketch. Today it\'s a 30-min cinematic production. AI didn\'t give me the idea. It gave me the ability to MAKE IT. 🎬✨' },
      instagram: { caption: 'The gap between imagination and reality used to be filled with: budget, time, team, equipment. AI just... closed the gap. What will YOU create?' },
      linkedin: { caption: 'AI doesn\'t change what we imagine. It changes what we can CREATE. The gap between a notebook sketch and a 30-minute cinematic production used to be months of work and thousands of dollars. Now it\'s 90 minutes and a pipeline.' },
      twitter: { caption: 'AI didn\'t give me better ideas.\n\nIt gave me the ability to MAKE the ideas I already had.\n\nNotebook sketch → 30-min cinematic production in 90 minutes.\n\nThe gap between imagination and reality just disappeared.' },
    },
  },
  // Category E: Teaser — Episode preview clips
  {
    id: 'p2-clip-e1-meta-moment',
    category: 'teaser' as ClipCategory,
    theme: 'entertainment' as ClipTheme,
    sourceScenes: ['p2-scene-11-meta-moment'],
    timestamp: { start: 0, end: 30 },
    duration: 30,
    hook: 'This episode was made by the same AI pipeline it describes',
    cta: 'Watch the full recursive experience',
    hashtags: ['#Meta', '#AIProduction', '#RecursiveAI', '#BeyondAIHype'],
    platforms: ['youtube-shorts', 'tiktok', 'instagram-reels'],
    captionStyle: 'hook-first',
    messaging: {
      youtube: { title: 'This Episode Was Made By the AI It Describes', description: 'The most recursive moment in podcast history: the Cast pipeline produced the episode explaining the Cast pipeline.' },
      tiktok: { caption: 'Wait... this episode about AI production was MADE by the AI production pipeline it\'s describing? That\'s recursion. Or as Atlas says, "self-referential meta-production." 🤓' },
      instagram: { caption: 'The AI that made this episode is the same AI this episode is about. Yes, it\'s as mind-bending as it sounds.' },
      linkedin: { caption: 'We produced an episode about our AI production pipeline... using the AI production pipeline. The medium isn\'t just the message — it\'s the product, the proof, and the pitch simultaneously.' },
      twitter: { caption: 'This episode:\n- Describes an AI pipeline\n- Was produced BY that pipeline\n- Shows the pipeline running\n- While the pipeline runs it\n\nAllaudin: "Recursion"\nAtlas: "Self-referential meta-production"\nAllaudin: "I preferred my version"' },
    },
  },
  // Category F: Character — Character-driven entertainment
  {
    id: 'p2-clip-f1-crew-assembly',
    category: 'character' as ClipCategory,
    theme: 'entertainment' as ClipTheme,
    sourceScenes: ['p2-scene-9-pipeline-live', 'p2-scene-15-finale'],
    timestamp: { start: 0, end: 45 },
    duration: 45,
    hook: 'Meet the AI production crew: an owl, a chameleon, a cricket, and a badger',
    cta: 'They directed, scored, and rendered this entire episode',
    hashtags: ['#AICrewIntro', '#PixarMeetsAI', '#AnimatedPodcast', '#BeyondAIHype'],
    platforms: ['youtube-shorts', 'tiktok', 'instagram-reels'],
    captionStyle: 'character-intro',
    messaging: {
      youtube: { title: 'Meet the AI Crew: Owl Professor, Chameleon Director, Cricket Composer, Badger Renderer', description: 'Your new favorite characters: Professor Hoot (historian), Reel (director), Maestro (composer), and Forge (renderer). All AI. All Pixar-quality.' },
      tiktok: { caption: 'Our production crew:\n🦉 Professor Hoot - historian\n🦎 Reel - director\n🦗 Maestro - composer\n🦡 Forge - renderer\n\nAll AI. All Pixar quality. All have opinions about their jobs. 😂' },
      instagram: { caption: 'Traditional podcast: 1 human with a mic. Our podcast: a genie, a bear, a fox, a squirrel, an owl, a chameleon, a cricket, and a badger. Welcome to the future.' },
      linkedin: { caption: 'We personified our AI production pipeline as Pixar-quality characters. Not just as entertainment — but because making infrastructure visible and relatable is the best way to explain it.' },
      twitter: { caption: 'Our production team:\n\n🦉 Professor Hoot: "Fascinating..."\n🦎 Reel: "ACTION!"\n🦗 Maestro: *wipes tear* "Beautiful"\n🦡 Forge: "Not a single artifact"\n\nAll AI. All Pixar-quality. All extremely opinionated about their jobs.' },
    },
  },
];

// ---------------------------------------------------------------------------
// EP04_PART2_THUMBNAILS — thumbnail options for platforms
// ---------------------------------------------------------------------------

export const EP04_PART2_THUMBNAILS = [
  {
    id: 'p2-thumb-1-crew-shot',
    concept: 'All 9 characters in epic crew shot — production crew front and center',
    text: 'EP2 Part 2: THE PRODUCTION',
    prompt: 'Epic Pixar-style group shot: 9 animated characters in a cinematic production studio. Center: Allaudin (genie) with storybook. Around him: Host (human), Atlas (bear with glasses), Squirrel (hyperactive), Nova (fox on video screen), Professor Hoot (owl with glasses), Reel (chameleon with beret), Maestro (cricket in tuxedo), Forge (badger at anvil). Dramatic studio lighting. Text overlay: THE PRODUCTION. 16:9 YouTube thumbnail.',
  },
  {
    id: 'p2-thumb-2-pipeline-proof',
    concept: 'Split screen: notebook sketch transforming into cinematic production',
    text: 'AI Closed the Gap',
    prompt: 'Split thumbnail: LEFT is a hand-drawn notebook sketch (simple pencil characters), RIGHT is the same characters as full Pixar 3D renders. An arrow or morph effect connecting them. Text: "AI CLOSED THE GAP". Clean, bold, 16:9.',
  },
  {
    id: 'p2-thumb-3-forge-hero',
    concept: 'Forge at his anvil hammering a cinematic scene into existence',
    text: '19 Providers. 1 Pipeline.',
    prompt: 'Forge the badger blacksmith at his glowing anvil, hammering a video clip that sparkles with xfade transitions. Behind him, a world map with 19 provider logos lit up. Text: "19 PROVIDERS. 1 PIPELINE." Dramatic firelight, Pixar quality, 16:9.',
  },
] as const;

// ---------------------------------------------------------------------------
// Pipeline readiness checklist for Part 2
// ---------------------------------------------------------------------------

export const EP04_PART2_PIPELINE_READINESS = [
  { id: 'p2-ready-1', phase: 'script', check: 'All 16 scenes have script content', status: 'ready' },
  { id: 'p2-ready-2', phase: 'script', check: 'All 9 voices have lines assigned', status: 'ready' },
  { id: 'p2-ready-3', phase: 'script', check: 'SyncMarkers on all dialogue lines', status: 'ready' },
  { id: 'p2-ready-4', phase: 'script', check: 'Narrator bridges for all 15 transitions', status: 'ready' },
  { id: 'p2-ready-5', phase: 'voices', check: '5 original voices configured (from Part 1)', status: 'ready' },
  { id: 'p2-ready-6', phase: 'voices', check: '4 new voices configured (owl, reel, maestro, forge)', status: 'ready' },
  { id: 'p2-ready-7', phase: 'voices', check: 'Alibaba CosyVoice fallbacks for all new voices', status: 'ready' },
  { id: 'p2-ready-8', phase: 'avatars', check: '4 new character Pixar prompts defined', status: 'ready' },
  { id: 'p2-ready-9', phase: 'avatars', check: '4 new character Disney prompts defined', status: 'ready' },
  { id: 'p2-ready-10', phase: 'avatars', check: 'Scene companions for all new characters', status: 'ready' },
  { id: 'p2-ready-11', phase: 'pipeline', check: 'Scene pipelines for all 16 scenes', status: 'ready' },
  { id: 'p2-ready-12', phase: 'pipeline', check: 'Music score for all 16 scenes', status: 'ready' },
  { id: 'p2-ready-13', phase: 'pipeline', check: 'SFX cues for all 16 scenes', status: 'ready' },
  { id: 'p2-ready-14', phase: 'pipeline', check: 'Transitions for all 15 scene boundaries', status: 'ready' },
  { id: 'p2-ready-15', phase: 'pipeline', check: 'Storybook bookends (opening + closing)', status: 'ready' },
  { id: 'p2-ready-16', phase: 'social', check: 'Social clips for all platforms', status: 'ready' },
  { id: 'p2-ready-17', phase: 'social', check: 'Thumbnail options defined', status: 'ready' },
  { id: 'p2-ready-18', phase: 'models', check: 'No hardcoded model IDs — all via getActiveModel()', status: 'ready' },
  { id: 'p2-ready-19', phase: 'models', check: 'Dynamic model resolution with fallback chain', status: 'ready' },
  { id: 'p2-ready-20', phase: 'keys', check: 'All keys prefixed p2- — no Part 1 collisions', status: 'ready' },
] as const;

// ---------------------------------------------------------------------------
// PART 2 — Transition → parent scene map
// Bridges have scene `p2-transition-N-to-M`; this map folds them into scene N
// (matches Part 1's TRANSITION_TO_SCENE pattern in EP04Production.tsx).
// ---------------------------------------------------------------------------

export const PART2_TRANSITION_TO_SCENE: Record<string, string> = {
  'p2-transition-0-to-1':   P2_SCENES.COLD_OPEN,
  'p2-transition-1-to-2':   P2_SCENES.RECAP,
  'p2-transition-2-to-3':   P2_SCENES.NOVA_FAREWELL,
  'p2-transition-3-to-4':   P2_SCENES.ATLAS_SOLO,
  'p2-transition-4-to-5':   P2_SCENES.JSON2VIDEO_DEATH,
  'p2-transition-5-to-6':   P2_SCENES.PRODUCTION_HELL,
  'p2-transition-6-to-7':   P2_SCENES.MODEL_CRISIS,
  'p2-transition-7-to-8':   P2_SCENES.PROVIDER_STACK,
  'p2-transition-8-to-9':   P2_SCENES.CHARACTERS_SPEAK,
  'p2-transition-9-to-10':  P2_SCENES.PIPELINE_LIVE,
  'p2-transition-10-to-11': P2_SCENES.THIRTY_MINUTES,
  'p2-transition-11-to-12': P2_SCENES.META_MOMENT,
  'p2-transition-12-to-13': P2_SCENES.DIFFERENT_PODCAST,
  'p2-transition-13-to-14': P2_SCENES.IMAGINATION,
  'p2-transition-14-to-15': P2_SCENES.RETRO_CTA,
};

// ---------------------------------------------------------------------------
// EP04_PART2_CHARACTER_INTERACTIONS — Pixar group/duo/crew shots per scene
// Extracted from EP04_PART2_SCENE_PIPELINES so the page can render them as
// dedicated cards (single source of truth — same data, presentation layer).
// ---------------------------------------------------------------------------
export const EP04_PART2_CHARACTER_INTERACTIONS: {
  sceneId: string;
  steps: Array<Record<string, unknown>>;
}[] = [
  {
    sceneId: P2_SCENES.RECAP,
    steps: [
      { type: 'character-interaction', characters: ['allaudin', 'owl'], prompt: 'Allaudin glances at Owl perched on storybook edge with amused respect', style: 'pixar-3d' },
    ],
  },
  {
    sceneId: P2_SCENES.NOVA_FAREWELL,
    steps: [
      { type: 'character-interaction', characters: ['nova', 'atlas'], prompt: 'Nova with packed toolkit handing off to Atlas who holds a massive document', style: 'pixar-3d' },
    ],
  },
  {
    sceneId: P2_SCENES.PROVIDER_STACK,
    steps: [
      { type: 'character-interaction', characters: ['reel', 'maestro', 'forge'], prompt: 'Reel calls Music and Assembly — Maestro bows, Forge raises hammer. The production crew assembled.', style: 'pixar-3d' },
    ],
  },
  {
    sceneId: P2_SCENES.THIRTY_MINUTES,
    steps: [
      { type: 'character-interaction', characters: ['owl', 'reel', 'maestro', 'forge'], prompt: 'Owl gestures at the production crew standing together. They wave — they ARE the automated crew.', style: 'pixar-3d' },
    ],
  },
  {
    sceneId: P2_SCENES.FINALE,
    steps: [
      { type: 'character-interaction', characters: ['allaudin', 'host', 'atlas', 'squirrel', 'owl', 'reel', 'maestro', 'forge'], prompt: 'All 9 characters in a line. Final group shot. Each in character — Atlas with docs, Squirrel with acorns, Owl adjusting glasses, Reel with clapperboard, Maestro bowing, Forge with hammer on shoulder. Warm golden light.', style: 'pixar-3d' },
    ],
  },
];

// ---------------------------------------------------------------------------
// EP04_PART2_NARRATOR_SCROLLS — parchment scroll data reveals per scene
// ---------------------------------------------------------------------------
export const EP04_PART2_NARRATOR_SCROLLS: {
  sceneId: string;
  steps: Array<Record<string, unknown>>;
}[] = [
  {
    sceneId: P2_SCENES.RECAP,
    steps: [
      { type: 'narrator-scroll', prompt: 'Storybook pages flipping with painted recap scenes from Part 1 — sprint board, governance map, dashboard screenshots as watercolor paintings', duration: 8 },
    ],
  },
];

// ---------------------------------------------------------------------------
// PART 2 — UI display config (single source of truth — do NOT hardcode in pages)
// ---------------------------------------------------------------------------

/** Human-readable scene titles. Keyed by P2_SCENES.* values. */
export const EP04_PART2_SCENE_TITLES: Record<string, string> = {
  [P2_SCENES.COLD_OPEN]:         'Scene 0 — Cold Open · What You\'re About to See',
  [P2_SCENES.RECAP]:             'Scene 1 — Recap · The Story So Far',
  [P2_SCENES.NOVA_FAREWELL]:     'Scene 2 — Nova\'s Farewell',
  [P2_SCENES.ATLAS_SOLO]:        'Scene 3 — Atlas Flies Solo',
  [P2_SCENES.JSON2VIDEO_DEATH]:  'Scene 4 — json2video Dies',
  [P2_SCENES.PRODUCTION_HELL]:   'Scene 5 — Production Hell',
  [P2_SCENES.MODEL_CRISIS]:      'Scene 6 — The Model Crisis',
  [P2_SCENES.PROVIDER_STACK]:    'Scene 7 — The 19-Provider Stack',
  [P2_SCENES.CHARACTERS_SPEAK]:  'Scene 8 — Characters Come Alive',
  [P2_SCENES.PIPELINE_LIVE]:     'Scene 9 — Pipeline Goes Live',
  [P2_SCENES.THIRTY_MINUTES]:    'Scene 10 — 30 Minutes of AI',
  [P2_SCENES.META_MOMENT]:       'Scene 11 — The Meta Moment',
  [P2_SCENES.DIFFERENT_PODCAST]: 'Scene 12 — A Different Kind of Podcast',
  [P2_SCENES.IMAGINATION]:       'Scene 13 — What If We Could Imagine?',
  [P2_SCENES.RETRO_CTA]:         'Scene 14 — Retro & CTA',
  [P2_SCENES.FINALE]:            'Scene 15 — Finale · The End... For Now',
};

/**
 * Voice → tailwind badge classes. Derived from each character's primary palette
 * (from EP04_PART2_AVATAR_CONFIG) so badges visually match the avatar. Keep
 * this in sync if a character's palette changes in EP04_PART2_AVATAR_CONFIG.
 */
export const EP04_PART2_VOICE_BADGE_CLASSES: Record<string, string> = {
  host:     'bg-amber-500/15 text-amber-600 border-amber-500/30',
  atlas:    'bg-sky-500/15 text-sky-600 border-sky-500/30',
  nova:     'bg-rose-500/15 text-rose-600 border-rose-500/30',
  squirrel: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  allaudin: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
  owl:      'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  reel:     'bg-pink-500/15 text-pink-600 border-pink-500/30',
  maestro:  'bg-indigo-500/15 text-indigo-600 border-indigo-500/30',
  forge:    'bg-red-500/15 text-red-600 border-red-500/30',
};
