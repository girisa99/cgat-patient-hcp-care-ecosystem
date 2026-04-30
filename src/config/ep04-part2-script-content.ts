/**
 * EP04 Part 2 — "The Production" Script Content
 *
 * Beyond AI Hype: The Genie AI Podcast — Episode 2, Part 2
 * Days 6-10: Nova's departure, json2video → RunPod migration,
 * production pipeline deep-dive, and the AI crew comes alive.
 *
 * 16 scenes (0-15), 5 acts + prologue, ~30 min runtime
 * 9 voices: host, atlas, nova, allaudin, squirrel, owl, reel, maestro, forge
 * All keys prefixed p2- to avoid collision with Part 1
 */

import type { ScriptLine } from './ep04-script-content';

// ---------------------------------------------------------------------------
// Extended ScriptLine with sync markers for tighter TTS-animation coupling
// ---------------------------------------------------------------------------

export type Part2Voice =
  | 'host' | 'atlas' | 'nova' | 'squirrel' | 'allaudin'
  | 'owl' | 'reel' | 'maestro' | 'forge';

export interface SyncMarkers {
  /** What visual should show at this line's start */
  visualCue: string;
  /** Crossfade from previous line (e.g., 'dissolve-0.5s') */
  transitionIn?: string;
  /** Seconds to hold visual after TTS ends (prevents silence gaps) */
  holdAfter?: number;
  /** Music cue name (e.g., 'tension-build', 'resolve') */
  musicSync?: string;
  /** Seconds of overlap with previous line (for natural conversation feel) */
  overlapPrev?: number;
}

export interface Part2ScriptLine extends Omit<ScriptLine, 'voice'> {
  voice: Part2Voice;
  syncMarkers?: SyncMarkers;
}

// ---------------------------------------------------------------------------
// Scene key constants
// ---------------------------------------------------------------------------

export const P2_SCENES = {
  COLD_OPEN: 'p2-scene-0-cold-open',
  RECAP: 'p2-scene-1-recap',
  NOVA_FAREWELL: 'p2-scene-2-nova-farewell',
  ATLAS_SOLO: 'p2-scene-3-atlas-solo',
  JSON2VIDEO_DEATH: 'p2-scene-4-json2video-death',
  PRODUCTION_HELL: 'p2-scene-5-production-hell',
  MODEL_CRISIS: 'p2-scene-6-model-crisis',
  PROVIDER_STACK: 'p2-scene-7-provider-stack',
  CHARACTERS_SPEAK: 'p2-scene-8-characters-speak',
  PIPELINE_LIVE: 'p2-scene-9-pipeline-live',
  THIRTY_MINUTES: 'p2-scene-10-30-minutes',
  META_MOMENT: 'p2-scene-11-meta-moment',
  DIFFERENT_PODCAST: 'p2-scene-12-different-podcast',
  IMAGINATION: 'p2-scene-13-imagination',
  RETRO_CTA: 'p2-scene-14-retro-cta',
  FINALE: 'p2-scene-15-finale',
} as const;

// ---------------------------------------------------------------------------
// EP04 Part 2 Full Script — ~140 dialogue lines
// ---------------------------------------------------------------------------

export const EP04_PART2_SCRIPT_CONTENT: Record<string, Part2ScriptLine> = {

  // =========================================================================
  // PROLOGUE — Scene 0: "What You're About to See" (~120s)
  // Voices: host, allaudin
  // =========================================================================

  'p2-s0-host-1': {
    text: "Stop. What you just saw — that wasn't made by a studio. No cameras. No editors. No animators. No voice actors.",
    voice: 'host',
    scene: P2_SCENES.COLD_OPEN,
    duration_est: 8,
    direction: 'Fourth wall break. Freeze frame of flash-forward montage. Host speaks directly to audience with intensity.',
    lipsync: true,
    motion: 'direct-to-camera',
    sfx: ['cinematic-freeze', 'tension-hit'],
    syncMarkers: {
      visualCue: 'Flash-forward montage freezes mid-frame. Host center screen.',
      transitionIn: 'hard-cut',
      holdAfter: 0.5,
      musicSync: 'dramatic-stop',
    },
  },

  'p2-s0-host-2': {
    text: "Everything you're about to watch for the next 30 minutes was produced entirely by AI. The script you're hearing? AI-generated, then human-refined. The voices? Text-to-speech across 3 providers.",
    voice: 'host',
    scene: P2_SCENES.COLD_OPEN,
    duration_est: 12,
    direction: 'Host gestures around the scene. Quick visual flashes showing TTS waveforms, script generation.',
    lipsync: true,
    motion: 'gesturing-wide',
    syncMarkers: {
      visualCue: 'Split-screen flashes: script text generating, TTS waveform visualizations.',
      holdAfter: 0.3,
      musicSync: 'tension-build',
      overlapPrev: 0.2,
    },
  },

  'p2-s0-host-3': {
    text: "These Pixar-quality characters? AI-generated 3D models with AI lipsync. The music? AI-composed for each scene. And the whole thing was assembled by a custom rendering pipeline we built in 10 days.",
    voice: 'host',
    scene: P2_SCENES.COLD_OPEN,
    duration_est: 13,
    direction: 'Camera pulls back revealing the full production — characters, sets, music visualizations.',
    lipsync: true,
    motion: 'sweeping-gesture',
    sfx: ['whoosh-reveal'],
    syncMarkers: {
      visualCue: 'Wide shot revealing all characters, sets, floating music notes, render timeline.',
      holdAfter: 0.8,
      musicSync: 'crescendo-hit',
      overlapPrev: 0.2,
    },
  },

  'p2-s0-allaudin-1': {
    text: "And now... let me show you HOW. Because THAT is the real story.",
    voice: 'allaudin',
    scene: P2_SCENES.COLD_OPEN,
    duration_est: 6,
    direction: 'Allaudin emerges from magical mist, opens the storybook. Warm golden light spills from pages.',
    lipsync: true,
    motion: 'theatrical-emerge',
    sfx: ['magic-shimmer', 'book-open'],
    syncMarkers: {
      visualCue: 'Allaudin materializes with storybook. Golden light from pages illuminates scene.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.5,
      musicSync: 'wonder-theme',
    },
  },

  'p2-s0-host-4': {
    text: "On one side — a traditional podcast. Two people. Microphones. A plain background. On the other — THIS. Animated characters. Cinematic scenes. Original score. Multiple angles.",
    voice: 'host',
    scene: P2_SCENES.COLD_OPEN,
    duration_est: 12,
    direction: 'Split-screen comparison: traditional podcast (left) vs this production (right). The contrast IS the thesis.',
    lipsync: true,
    motion: 'comparing-gesture',
    syncMarkers: {
      visualCue: 'Side-by-side: plain podcast studio (left) vs full cinematic scene (right).',
      holdAfter: 0.5,
      musicSync: 'contrast-reveal',
      overlapPrev: 0.3,
    },
  },

  'p2-s0-host-5': {
    text: "That contrast? That is the thesis. AI isn't just changing how we code — it's changing how we CREATE.",
    voice: 'host',
    scene: P2_SCENES.COLD_OPEN,
    duration_est: 7,
    direction: 'Host delivers thesis line with conviction. Title card: "Beyond AI Hype — The Production."',
    lipsync: true,
    motion: 'emphatic-point',
    sfx: ['title-whoosh'],
    syncMarkers: {
      visualCue: 'Title card materializes: "EP04 Part 2 — The Production". Cinematic text animation.',
      holdAfter: 1.5,
      musicSync: 'theme-resolve',
    },
  },

  // =========================================================================
  // ACT 1, Scene 1: "Previously on Beyond AI Hype" (~90s)
  // Voices: allaudin, host, owl
  // =========================================================================

  'p2-s1-allaudin-1': {
    text: "Where were we? Ah, yes. The storybook remembers. Five days. Two AI developers. One audacious sprint. Let me turn the pages...",
    voice: 'allaudin',
    scene: P2_SCENES.RECAP,
    duration_est: 9,
    direction: 'Allaudin at storybook. Pages flip showing key Part 1 moments — sprint board, governance map, dashboard.',
    lipsync: true,
    motion: 'page-turn',
    sfx: ['page-flip', 'magic-shimmer'],
    syncMarkers: {
      visualCue: 'Storybook pages flip with painted recap scenes from Part 1.',
      transitionIn: 'storybook-flip',
      holdAfter: 0.5,
      musicSync: 'recap-theme',
    },
  },

  'p2-s1-host-1': {
    text: "Atlas and Nova built the Genie AI Hub. Sprint tracker. Governance system. Dashboard. Three products in five days. And we showed you every step.",
    voice: 'host',
    scene: P2_SCENES.RECAP,
    duration_est: 10,
    direction: 'Quick montage of Part 1 highlights on storybook pages — Spark, Mind, Deck logos.',
    lipsync: true,
    motion: 'recap-narration',
    syncMarkers: {
      visualCue: 'Storybook pages show Spark, Mind, Deck product icons in painted style.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s1-owl-1': {
    text: "Fascinating. You built a sprint tracker, governance system, and dashboard... in five days... with two AIs. The Industrial Revolution took decades to reorganize labor. You did it in a week.",
    voice: 'owl',
    scene: P2_SCENES.RECAP,
    duration_est: 13,
    direction: 'Professor Hoot appears for the first time — perched on the storybook edge, bespectacled, graduation cap. Academic gravitas.',
    lipsync: true,
    motion: 'measured-nod',
    sfx: ['owl-appear', 'scholarly-chime'],
    syncMarkers: {
      visualCue: 'Professor Hoot materializes on storybook edge. Floating equation particles around him.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.8,
      musicSync: 'wisdom-theme',
    },
  },

  'p2-s1-allaudin-2': {
    text: "He's new. Very academic. But not wrong.",
    voice: 'allaudin',
    scene: P2_SCENES.RECAP,
    duration_est: 4,
    direction: 'Allaudin glances at Owl with amused respect. Aside to audience.',
    lipsync: true,
    motion: 'aside-glance',
    syncMarkers: {
      visualCue: 'Allaudin looks at Owl, then back to camera with slight smile.',
      holdAfter: 0.5,
      overlapPrev: 0.3,
    },
  },

  'p2-s1-host-2': {
    text: "But that was the easy part. Days 1 through 5 were about building the product. Days 6 through 10? That's when we had to make it PRODUCE. And everything changed.",
    voice: 'host',
    scene: P2_SCENES.RECAP,
    duration_est: 11,
    direction: 'Host transitions to foreshadow. Storybook pages darken — storm clouds gathering on the painted horizon.',
    lipsync: true,
    motion: 'serious-lean',
    sfx: ['page-turn-dramatic'],
    syncMarkers: {
      visualCue: 'Storybook pages darken. Storm clouds painted over the sprint board.',
      holdAfter: 1.0,
      musicSync: 'tension-build',
    },
  },

  'p2-s1-allaudin-3': {
    text: "Turn the page. The second chapter begins.",
    voice: 'allaudin',
    scene: P2_SCENES.RECAP,
    duration_est: 4,
    direction: 'Allaudin turns a dramatic page. Light shifts from warm recap to intense Act 1.',
    lipsync: true,
    motion: 'dramatic-page-turn',
    sfx: ['heavy-page-turn', 'chapter-chime'],
    syncMarkers: {
      visualCue: 'Storybook page turns to Chapter 2 header. New color palette — deeper, more dramatic.',
      holdAfter: 1.0,
      musicSync: 'chapter-transition',
    },
  },

  // =========================================================================
  // ACT 1, Scene 2: "Nova Gets Reassigned" (~120s)
  // Voices: host, nova, atlas, squirrel
  // =========================================================================

  'p2-s2-host-1': {
    text: "Day 6. And we need to talk about Nova.",
    voice: 'host',
    scene: P2_SCENES.NOVA_FAREWELL,
    duration_est: 4,
    direction: 'Somber opening. Sprint board visible with completed frontend tasks. Backend tasks dominate the remaining board.',
    lipsync: true,
    motion: 'serious-address',
    syncMarkers: {
      visualCue: 'Sprint board showing completed frontend tasks, remaining backend-heavy backlog.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.5,
      musicSync: 'bittersweet-intro',
    },
  },

  'p2-s2-host-2': {
    text: "The critical path had shifted entirely to backend — edge functions, provider integrations, assembly pipelines. There simply wasn't enough frontend-specific work to justify a dedicated frontend AI.",
    voice: 'host',
    scene: P2_SCENES.NOVA_FAREWELL,
    duration_est: 11,
    direction: 'Host explains the strategic decision. Sprint board zooms into backend tasks — all red and in-progress.',
    lipsync: true,
    motion: 'explanatory',
    syncMarkers: {
      visualCue: 'Sprint board highlighting backend tasks. Frontend column nearly empty.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s2-host-3': {
    text: "Nova was brilliant at what she did. But the work left was all backend — provider integrations, edge functions, assembly pipelines. Atlas could handle the frontend changes we needed. It wasn't about capability — it was about where the critical work was.",
    voice: 'host',
    scene: P2_SCENES.NOVA_FAREWELL,
    duration_est: 14,
    direction: 'Host speaks with genuine respect. Nova visible in background, packing her glowing stylus.',
    lipsync: true,
    motion: 'respectful-explanation',
    syncMarkers: {
      visualCue: 'Nova in background organizing her tools. Atlas reviewing her component files.',
      holdAfter: 0.5,
      musicSync: 'farewell-underscore',
    },
  },

  'p2-s2-nova-1': {
    text: "Dark mode needs me elsewhere. I'll be back when you need 47 components built in an afternoon.",
    voice: 'nova',
    scene: P2_SCENES.NOVA_FAREWELL,
    duration_est: 7,
    direction: 'Nova delivers farewell with characteristic energy. Hummingbird companion hovers beside her.',
    lipsync: true,
    motion: 'confident-farewell',
    sfx: ['hummingbird-flutter'],
    syncMarkers: {
      visualCue: 'Nova with packed toolkit, hummingbird companion. Warm smile despite departure.',
      holdAfter: 0.5,
      overlapPrev: 0.3,
    },
  },

  'p2-s2-atlas-1': {
    text: "I've prepared a comprehensive handover document.",
    voice: 'atlas',
    scene: P2_SCENES.NOVA_FAREWELL,
    duration_est: 4,
    direction: 'Atlas holds up a comically thick document. Professional as always.',
    lipsync: true,
    motion: 'professional-present',
    syncMarkers: {
      visualCue: 'Atlas presenting an enormous document stack. Owl companion peers from behind it.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s2-host-4': {
    text: "It's 47 pages.",
    voice: 'host',
    scene: P2_SCENES.NOVA_FAREWELL,
    duration_est: 2,
    direction: 'Host deadpan. Quick beat.',
    lipsync: true,
    motion: 'deadpan',
    syncMarkers: {
      visualCue: 'Close-up of document thickness. Host staring at it.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s2-atlas-2': {
    text: "It's thorough.",
    voice: 'atlas',
    scene: P2_SCENES.NOVA_FAREWELL,
    duration_est: 2,
    direction: 'Atlas adjusts glasses. Zero apology.',
    lipsync: true,
    motion: 'glasses-adjust',
    syncMarkers: {
      visualCue: 'Atlas adjusting wire-frame glasses with quiet pride.',
      holdAfter: 0.5,
      overlapPrev: 0.2,
    },
  },

  'p2-s2-squirrel-1': {
    text: "NOVA WAIT! I made you a going-away acorn! It's... it's my BEST one!",
    voice: 'squirrel',
    scene: P2_SCENES.NOVA_FAREWELL,
    duration_est: 5,
    direction: 'Squirrel rushes to hug Nova, gets tangled in her tail. Emotional chaos.',
    lipsync: true,
    motion: 'hyperactive-rush',
    isInterruption: true,
    sfx: ['squirrel-scramble', 'comedic-tumble'],
    syncMarkers: {
      visualCue: 'Squirrel rushes at Nova with a polished acorn, trips over her tail.',
      holdAfter: 0.8,
      musicSync: 'comic-relief',
    },
  },

  'p2-s2-host-5': {
    text: "And just like that... from a team of two AIs to one. The buddy comedy became a solo sprint.",
    voice: 'host',
    scene: P2_SCENES.NOVA_FAREWELL,
    duration_est: 7,
    direction: 'Nova fades out. Sprint board now shows only Atlas as assignee. Host reflects.',
    lipsync: true,
    motion: 'reflective',
    sfx: ['gentle-transition'],
    syncMarkers: {
      visualCue: 'Nova dissolves into sparkles. Sprint board updates — all tasks assigned to Atlas.',
      holdAfter: 1.0,
      musicSync: 'bittersweet-resolve',
    },
  },

  // =========================================================================
  // ACT 1, Scene 3: "Day 6 — Atlas Goes Full-Stack" (~100s)
  // Voices: host, atlas, owl
  // =========================================================================

  'p2-s3-host-1': {
    text: "Day 6 morning. Atlas stands alone at the sprint board. But 'alone' doesn't mean what you think.",
    voice: 'host',
    scene: P2_SCENES.ATLAS_SOLO,
    duration_est: 7,
    direction: 'Atlas at the sprint board, now owning every column — backend, frontend, architecture, testing, docs.',
    lipsync: true,
    motion: 'establishing-shot',
    syncMarkers: {
      visualCue: 'Atlas alone at massive sprint board. All columns now his. Morning light.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.5,
      musicSync: 'determination-theme',
    },
  },

  'p2-s3-atlas-1': {
    text: "I've already read 340 component files. Your button margins are inconsistent, by the way.",
    voice: 'atlas',
    scene: P2_SCENES.ATLAS_SOLO,
    duration_est: 6,
    direction: 'Atlas calmly surveying the entire codebase. Floating code visualizations around him.',
    lipsync: true,
    motion: 'calm-assessment',
    syncMarkers: {
      visualCue: 'Code file visualizations floating around Atlas. He touches each one systematically.',
      holdAfter: 0.5,
      overlapPrev: 0.3,
    },
  },

  'p2-s3-host-2': {
    text: "One AI. Doing everything. Backend, frontend, architecture, testing, documentation. I'd say it was terrifying, but honestly? He seemed... relieved.",
    voice: 'host',
    scene: P2_SCENES.ATLAS_SOLO,
    duration_est: 9,
    direction: 'Host watches Atlas work with a mix of awe and amusement.',
    lipsync: true,
    motion: 'observing',
    syncMarkers: {
      visualCue: 'Atlas efficiently moving tasks across the board. Multiple code windows open simultaneously.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s3-owl-1': {
    text: "Fascinating. The specialist became the generalist. In evolutionary biology, this is called adaptive radiation — a single organism fills every available niche.",
    voice: 'owl',
    scene: P2_SCENES.ATLAS_SOLO,
    duration_est: 10,
    direction: 'Owl perches nearby, notebook open. Draws a quick evolution diagram in the margins.',
    lipsync: true,
    motion: 'measured-observation',
    syncMarkers: {
      visualCue: 'Owl on branch with notebook. Evolution diagram sketched — one branch splitting to fill all roles.',
      holdAfter: 0.5,
      musicSync: 'wisdom-accent',
    },
  },

  'p2-s3-atlas-2': {
    text: "I prefer 'comprehensive competence.'",
    voice: 'atlas',
    scene: P2_SCENES.ATLAS_SOLO,
    duration_est: 3,
    direction: 'Atlas without looking up. Dry delivery. Already moving tasks.',
    lipsync: true,
    motion: 'working-without-looking',
    syncMarkers: {
      visualCue: 'Atlas still working, not even looking at Owl. Task cards moving on the board.',
      holdAfter: 0.5,
      overlapPrev: 0.2,
    },
  },

  'p2-s3-host-3': {
    text: "The sprint board that used to have two swimlanes now had one. And somehow... it moved faster.",
    voice: 'host',
    scene: P2_SCENES.ATLAS_SOLO,
    duration_est: 7,
    direction: 'Sprint board visualized — single swimlane, but tasks completing rapidly. Velocity indicator climbing.',
    lipsync: true,
    motion: 'amazed-observation',
    sfx: ['task-complete-chime'],
    syncMarkers: {
      visualCue: 'Sprint board with single lane. Tasks flying to Done column. Velocity graph climbing.',
      holdAfter: 1.0,
      musicSync: 'momentum-build',
    },
  },

  // =========================================================================
  // ACT 2, Scene 4: "The Day We Killed json2video" (~120s)
  // Voices: host, atlas, forge
  // =========================================================================

  'p2-s4-host-1': {
    text: "Day 7. And this is where the production story really begins. We had been using json2video — a third-party assembly API — to stitch our clips together.",
    voice: 'host',
    scene: P2_SCENES.JSON2VIDEO_DEATH,
    duration_est: 10,
    direction: 'Show json2video logo and basic assembly output — functional but limited.',
    lipsync: true,
    motion: 'setup-narration',
    syncMarkers: {
      visualCue: 'json2video interface shown. Basic clip stitching — no transitions, flat cuts.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.3,
      musicSync: 'tension-intro',
    },
  },

  'p2-s4-host-2': {
    text: "We hit the wall at about 3 minutes of content. json2video could stitch clips together, but it couldn't make them feel like a movie. No xfade transitions. No Ken Burns on stills. No picture-in-picture. No cinematic color grading.",
    voice: 'host',
    scene: P2_SCENES.JSON2VIDEO_DEATH,
    duration_est: 14,
    direction: 'Visual comparison: json2video output (flat cuts) vs desired cinematic quality.',
    lipsync: true,
    motion: 'frustrated-explanation',
    sfx: ['wall-hit'],
    syncMarkers: {
      visualCue: 'Split-screen: json2video output (jarring cuts) vs desired cinematic transitions.',
      holdAfter: 0.5,
      musicSync: 'problem-reveal',
    },
  },

  'p2-s4-atlas-1': {
    text: "The solution was a custom RunPod FFmpeg worker. Six-phase render pipeline: probe source assets, build the filter graph, render with xfade transitions, compress with per-scene optimization, upload to storage, callback to production page.",
    voice: 'atlas',
    scene: P2_SCENES.JSON2VIDEO_DEATH,
    duration_est: 14,
    direction: 'Atlas at whiteboard sketching the 6-phase pipeline. Each phase lights up as he names it.',
    lipsync: true,
    motion: 'technical-explanation',
    visual_ref: 'runpod-ffmpeg-pipeline-diagram',
    syncMarkers: {
      visualCue: 'Pipeline diagram: 6 connected phases lighting up sequentially. Code snippets floating.',
      holdAfter: 0.5,
      overlapPrev: 0.3,
    },
  },

  'p2-s4-forge-1': {
    text: "Finally. Someone who understands that assembly isn't just GLUING clips together. It's CRAFTSMANSHIP.",
    voice: 'forge',
    scene: P2_SCENES.JSON2VIDEO_DEATH,
    duration_est: 7,
    direction: 'Forge appears for the first time — burly badger blacksmith at a glowing forge. Hammering video clips into shape.',
    lipsync: true,
    motion: 'proud-introduction',
    sfx: ['forge-hammer', 'anvil-ring', 'fire-crackle'],
    syncMarkers: {
      visualCue: 'Forge materializes at his anvil. Molten video clips flow into the forge. Sparks fly.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'forge-theme',
    },
  },

  'p2-s4-forge-2': {
    text: "You want xfade? I'll give you xfade. Ken Burns? Beautiful. Picture-in-picture? My specialty. Compression artifacts? Over my dead body.",
    voice: 'forge',
    scene: P2_SCENES.JSON2VIDEO_DEATH,
    duration_est: 9,
    direction: 'Forge demonstrates each technique — hammers an xfade transition, shapes a Ken Burns pan, layers PiP.',
    lipsync: true,
    motion: 'demonstrating-crafts',
    sfx: ['hammer-strike', 'metal-shaping'],
    syncMarkers: {
      visualCue: 'Forge hammers each effect into existence — xfade sparkles, Ken Burns swoops, PiP overlays.',
      holdAfter: 0.5,
      overlapPrev: 0.2,
    },
  },

  'p2-s4-host-3': {
    text: "This was the turning point. The moment the pipeline went from demo clips to feature-length production capability. Everything after this was possible because of Forge's anvil.",
    voice: 'host',
    scene: P2_SCENES.JSON2VIDEO_DEATH,
    duration_est: 10,
    direction: 'Comparison before/after: json2video flat assembly vs RunPod cinematic output. Night and day.',
    lipsync: true,
    motion: 'pivotal-declaration',
    sfx: ['cinematic-reveal'],
    syncMarkers: {
      visualCue: 'Before/after wipe: json2video output transforms to RunPod cinematic quality.',
      holdAfter: 1.0,
      musicSync: 'breakthrough-resolve',
    },
  },

  // =========================================================================
  // ACT 2, Scene 5: "Production Hell — Everything Breaks" (~130s)
  // Voices: host, atlas, squirrel, reel
  // =========================================================================

  'p2-s5-reel-1': {
    text: "Okay, TAKE ONE. Audio payloads are 38 megabytes. Edge functions accept 6. CUT!",
    voice: 'reel',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 7,
    direction: 'Reel appears — chameleon director with beret and megaphone. Scales flash red (error). Stress mode.',
    lipsync: true,
    motion: 'frantic-directing',
    sfx: ['clapperboard-snap', 'error-buzz'],
    syncMarkers: {
      visualCue: 'Reel materializes in director chair. Scales shift RED. Error klaxon.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.3,
      musicSync: 'chaos-intro',
    },
  },

  'p2-s5-reel-2': {
    text: "TAKE TWO. The CDN URLs expired. Our assets are GONE. CUT!",
    voice: 'reel',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 5,
    direction: 'Reel scales flash amber. Asset files vanish from the timeline. Panic.',
    lipsync: true,
    motion: 'escalating-panic',
    sfx: ['error-buzz', 'files-vanishing'],
    syncMarkers: {
      visualCue: 'Production timeline with asset thumbnails disappearing one by one.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
      musicSync: 'chaos-escalate',
    },
  },

  'p2-s5-reel-3': {
    text: "TAKE THREE. Lipsync is taking 18 minutes. Our timeout is 150 seconds. CUT CUT CUT!",
    voice: 'reel',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 7,
    direction: 'Reel flashing all colors rapidly. Timeout counter visible — way past limit.',
    lipsync: true,
    motion: 'full-panic',
    sfx: ['timeout-alarm', 'clapperboard-triple'],
    syncMarkers: {
      visualCue: 'Timer counting up past 150s. Lipsync progress bar barely at 40%. Reel scales cycling wildly.',
      holdAfter: 0.5,
      musicSync: 'chaos-peak',
    },
  },

  'p2-s5-host-1': {
    text: "Everything broke when we tried to scale from 3-minute demos to 30-minute productions. Six crises in a single day.",
    voice: 'host',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 8,
    direction: 'Host narrates the chaos. Crisis list appears as a chalkboard tally.',
    lipsync: true,
    motion: 'battle-worn-narration',
    syncMarkers: {
      visualCue: 'Chalkboard tally: 6 crisis marks. Each one labeled.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s5-atlas-1': {
    text: "38 megabyte audio payloads hitting the 6 megabyte edge function limit. The fix: strip all base64 data URIs, pass URLs only. Payload drops to approximately 100 kilobytes.",
    voice: 'atlas',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 11,
    direction: 'Atlas calmly solving each crisis. Whiteboard: 38MB → strip base64 → 100KB.',
    lipsync: true,
    motion: 'methodical-fix',
    visual_ref: 'payload-reduction-diagram',
    syncMarkers: {
      visualCue: 'Animated diagram: 38MB payload shrinks to 100KB as base64 strips away.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s5-atlas-2': {
    text: "CDN URL expiration: Alibaba CDN URLs expire in 24 to 48 hours. Built a re-upload pipeline — detect expired URLs, re-upload to persistent storage before assembly.",
    voice: 'atlas',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 10,
    direction: 'Atlas diagrams the re-upload pipeline. Expired URLs caught and refreshed.',
    lipsync: true,
    motion: 'rapid-fix',
    syncMarkers: {
      visualCue: 'Pipeline diagram: expired URL detector → re-upload → fresh persistent URL.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s5-atlas-3': {
    text: "Lipsync taking 18 minutes: client-side polling. 60 checks, 10 seconds apart. Let it cook.",
    voice: 'atlas',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 6,
    direction: 'Atlas shrugs. Polling timer visualization — patient, methodical.',
    lipsync: true,
    motion: 'pragmatic-shrug',
    syncMarkers: {
      visualCue: 'Polling visualization: check 1... check 2... progress slowly climbing to 100%.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s5-host-2': {
    text: "OOM on build — the project was so large that npm run build crashed without 8 gigs of heap memory. IO exhaustion — Supabase disk IO drained during testing. TTS timing drift — cumulative offsets between lines caused sync gaps.",
    voice: 'host',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 14,
    direction: 'Quick-fire crisis montage. OOM error screen, IO gauge hitting zero, TTS waveforms drifting.',
    lipsync: true,
    motion: 'rapid-enumeration',
    sfx: ['error-cascade'],
    syncMarkers: {
      visualCue: 'Triple-split: OOM crash screen, IO gauge depleting, TTS waveforms misaligning.',
      holdAfter: 0.5,
      musicSync: 'crisis-montage',
    },
  },

  'p2-s5-squirrel-1': {
    text: "That's six. SIX things that broke. In one day. I think my acorn business has fewer problems.",
    voice: 'squirrel',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 6,
    direction: 'Squirrel on tiny chalkboard, keeping score. Tally marks. Wide-eyed.',
    lipsync: true,
    motion: 'scorekeeping',
    isInterruption: true,
    sfx: ['chalk-scratch'],
    syncMarkers: {
      visualCue: 'Squirrel with tiny chalkboard showing 6 tally marks. Shocked expression.',
      holdAfter: 0.8,
      musicSync: 'comic-relief',
    },
  },

  'p2-s5-reel-4': {
    text: "But we FIXED them. Every. Single. One. That's what production is — not avoiding problems. Solving them. Under pressure. Rolling.",
    voice: 'reel',
    scene: P2_SCENES.PRODUCTION_HELL,
    duration_est: 8,
    direction: 'Reel calms down. Scales shift to steady blue. Clapperboard raised confidently.',
    lipsync: true,
    motion: 'regaining-composure',
    sfx: ['clapperboard-confident'],
    syncMarkers: {
      visualCue: 'Reel scales stabilize to confident blue. All 6 crisis items checked off.',
      holdAfter: 1.0,
      musicSync: 'resolve-strong',
    },
  },

  // =========================================================================
  // ACT 2, Scene 6: "Models Disappear Overnight" (~110s)
  // Voices: host, atlas, owl
  // =========================================================================

  'p2-s6-host-1': {
    text: "Day 8. We wake up and three AI models are gone. Deprecated overnight. No warning. No migration period. And our codebase had those model IDs hardcoded in 57 files.",
    voice: 'host',
    scene: P2_SCENES.MODEL_CRISIS,
    duration_est: 12,
    direction: 'Morning alarm. Codebase visualization — 57 files flashing red with broken model references.',
    lipsync: true,
    motion: 'crisis-revelation',
    sfx: ['alarm-urgent', 'code-breaking'],
    syncMarkers: {
      visualCue: 'Codebase tree view: 57 files flashing red. "MODEL NOT FOUND" errors cascading.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.5,
      musicSync: 'crisis-dawn',
    },
  },

  'p2-s6-atlas-1': {
    text: "Hardcoded model IDs are a single point of failure. The solution: a dynamic model registry. One database table as the single source of truth.",
    voice: 'atlas',
    scene: P2_SCENES.MODEL_CRISIS,
    duration_est: 9,
    direction: 'Atlas at architecture whiteboard. Draws the registry design — DB table at center.',
    lipsync: true,
    motion: 'architectural-design',
    visual_ref: 'model-registry-architecture',
    syncMarkers: {
      visualCue: 'Whiteboard: old approach (57 scattered hardcodes) vs new (single DB table at center).',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s6-atlas-2': {
    text: "ai_model_registry table: 80 plus models, 18 providers. Alias chains so old model IDs automatically resolve to their replacements. Five-minute cache with hardcoded fallbacks. Zero-deploy updates — change a database row, everything adapts.",
    voice: 'atlas',
    scene: P2_SCENES.MODEL_CRISIS,
    duration_est: 14,
    direction: 'Registry visualization: model entries, alias chains connecting old → new, cache layer, auto-resolution.',
    lipsync: true,
    motion: 'comprehensive-explanation',
    syncMarkers: {
      visualCue: 'Animated registry: alias chain flowing from deprecated model → current model. Cache timer.',
      holdAfter: 0.5,
      overlapPrev: 0.2,
    },
  },

  'p2-s6-host-2': {
    text: "We replaced over 100 hardcoded model strings across 55 files. Every single AI call in the codebase now goes through the dynamic resolver.",
    voice: 'host',
    scene: P2_SCENES.MODEL_CRISIS,
    duration_est: 8,
    direction: 'Montage of find-and-replace across 55 files. Red hardcodes → green dynamic calls.',
    lipsync: true,
    motion: 'proud-summary',
    syncMarkers: {
      visualCue: 'Code diff montage: hardcoded strings replaced with resolveModelId() calls. Green checkmarks.',
      holdAfter: 0.5,
      overlapPrev: 0.3,
    },
  },

  'p2-s6-owl-1': {
    text: "Fascinating. You built a self-healing dependency graph. When one model disappears, the alias chain finds its replacement. In network theory, this is called resilient routing. In practice... it's rare.",
    voice: 'owl',
    scene: P2_SCENES.MODEL_CRISIS,
    duration_est: 13,
    direction: 'Owl on branch, notebook open. Draws a network graph showing resilient routing — nodes failing, traffic rerouting.',
    lipsync: true,
    motion: 'scholarly-analysis',
    syncMarkers: {
      visualCue: 'Network graph: model node disappears, traffic auto-reroutes through alias chain.',
      holdAfter: 0.5,
      musicSync: 'wisdom-theme',
    },
  },

  'p2-s6-atlas-3': {
    text: "The next time a model deprecates, we change one database row. No code changes. No deployments. The system self-heals.",
    voice: 'atlas',
    scene: P2_SCENES.MODEL_CRISIS,
    duration_est: 8,
    direction: 'Atlas demonstrates: changes one DB row. Entire system updates. Green across the board.',
    lipsync: true,
    motion: 'confident-conclusion',
    sfx: ['system-heal-chime'],
    syncMarkers: {
      visualCue: 'Single DB row update → cascade of green "OK" statuses across all 55 files.',
      holdAfter: 1.0,
      musicSync: 'solution-resolve',
    },
  },

  // =========================================================================
  // ACT 2, Scene 7: "19 Providers, 4 Zones, 1 Pipeline" (~120s)
  // Voices: host, atlas, allaudin, reel
  // =========================================================================

  'p2-s7-host-1': {
    text: "With the registry in place, let me show you what we're actually routing. Nineteen AI providers. Four geographic zones. One unified pipeline.",
    voice: 'host',
    scene: P2_SCENES.PROVIDER_STACK,
    duration_est: 9,
    direction: 'World map appears. Provider logos orbiting. Zones light up.',
    lipsync: true,
    motion: 'grand-introduction',
    syncMarkers: {
      visualCue: 'World map with 4 AI zones outlined. Provider logos orbiting the globe.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.3,
      musicSync: 'epic-scale-intro',
    },
  },

  'p2-s7-reel-1': {
    text: "VIDEO GENERATION — Action! Alibaba Wan 2.6 for Pixar and anime. Sora 2 for cinematic. Vertex Veo when quota allows. ModelsLab for AnimateDiff. Replicate as final fallback.",
    voice: 'reel',
    scene: P2_SCENES.PROVIDER_STACK,
    duration_est: 12,
    direction: 'Reel at holographic routing diagram. Each provider lights up as called. Scales shift blue → green per zone.',
    lipsync: true,
    motion: 'commanding-callout',
    sfx: ['provider-activate'],
    syncMarkers: {
      visualCue: 'Holographic provider board: Video Gen section lighting up — 5 provider icons.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s7-reel-2': {
    text: "LIPSYNC — Action! Alibaba Wan 2.2, primary. OmniAvatar, secondary. SadTalker, tertiary. Wav2Lip, last resort.",
    voice: 'reel',
    scene: P2_SCENES.PROVIDER_STACK,
    duration_est: 8,
    direction: 'Lipsync section lights up. Fallback chain visualized as cascading arrows.',
    lipsync: true,
    motion: 'commanding-callout',
    sfx: ['provider-activate'],
    syncMarkers: {
      visualCue: 'Lipsync providers cascading: primary → fallback chain with arrows.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s7-reel-3': {
    text: "3D AVATARS — Action! Meshy 6 for generation. TaoAvatar for 3D Gaussian Splatting. MACH for Make-A-Character. TripoSR for reconstruction.",
    voice: 'reel',
    scene: P2_SCENES.PROVIDER_STACK,
    duration_est: 9,
    direction: '3D Avatar section lights up. Example avatars rotating — Meshy 6 output quality shown.',
    lipsync: true,
    motion: 'commanding-callout',
    sfx: ['provider-activate'],
    syncMarkers: {
      visualCue: '3D Avatar providers. Rotating character models from each provider.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s7-reel-4': {
    text: "MUSIC — Action!",
    voice: 'reel',
    scene: P2_SCENES.PROVIDER_STACK,
    duration_est: 2,
    direction: 'Reel calls music. Maestro appears with a bow.',
    lipsync: true,
    motion: 'cue-handoff',
    sfx: ['musical-flourish'],
    syncMarkers: {
      visualCue: 'Music section lights up. Maestro materializes with conductor baton.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
      musicSync: 'maestro-entrance',
    },
  },

  'p2-s7-reel-5': {
    text: "ASSEMBLY — Action!",
    voice: 'reel',
    scene: P2_SCENES.PROVIDER_STACK,
    duration_est: 2,
    direction: 'Reel calls assembly. Forge raises his hammer.',
    lipsync: true,
    motion: 'cue-handoff',
    sfx: ['anvil-ring'],
    syncMarkers: {
      visualCue: 'Assembly section lights up. Forge raises hammer over anvil.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
      musicSync: 'forge-accent',
    },
  },

  'p2-s7-allaudin-1': {
    text: "Nineteen providers. Four AI zones. One pipeline. And you thought a genie was impressive. Hahaha.",
    voice: 'allaudin',
    scene: P2_SCENES.PROVIDER_STACK,
    duration_est: 7,
    direction: 'Allaudin marvels at the complete routing map. World map fully lit up — all zones active.',
    lipsync: true,
    motion: 'theatrical-admiration',
    sfx: ['magic-shimmer'],
    syncMarkers: {
      visualCue: 'Full world map lit: Claude zone (blue), Alibaba zone (green), Gemini zone (amber), GPT-4o (neutral).',
      holdAfter: 0.5,
      overlapPrev: 0.3,
    },
  },

  'p2-s7-host-2': {
    text: "And it's all regional. Claude for North America and Europe. Alibaba for CJK and Middle East. Gemini for India, Southeast Asia, and Africa. GPT-4o as the universal fallback. 85 languages. 63 with voice. 22 Indian languages. 7 Arabic dialects.",
    voice: 'host',
    scene: P2_SCENES.PROVIDER_STACK,
    duration_est: 16,
    direction: 'World map zooms into each zone as named. Language counts pop up per region.',
    lipsync: true,
    motion: 'zone-by-zone-narration',
    syncMarkers: {
      visualCue: 'World map zooming zone by zone. Language counts overlaying each region.',
      holdAfter: 1.0,
      musicSync: 'global-scale-resolve',
    },
  },

  // =========================================================================
  // ACT 3, Scene 8: "Making Characters Talk" (~120s)
  // Voices: host, atlas, allaudin, maestro
  // =========================================================================

  'p2-s8-host-1': {
    text: "So we have the providers. We have the pipeline. But here's the magic — making characters actually SPEAK. Not just audio over a static image. Real lipsync. Real movement.",
    voice: 'host',
    scene: P2_SCENES.CHARACTERS_SPEAK,
    duration_est: 11,
    direction: 'Transition to lipsync deep-dive. Show the evolution from static renders to speaking characters.',
    lipsync: true,
    motion: 'setup-introduction',
    syncMarkers: {
      visualCue: 'Evolution strip: static image → slight movement → full lipsync. Side by side.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.3,
      musicSync: 'wonder-intro',
    },
  },

  'p2-s8-atlas-1': {
    text: "The pipeline: Step one, AI generates a 3D avatar or 2D image. Step two, image-to-video creates base animation — the character blinks, breathes, has subtle movement. Step three, TTS generates audio with phoneme-level timing using Azure viseme data.",
    voice: 'atlas',
    scene: P2_SCENES.CHARACTERS_SPEAK,
    duration_est: 15,
    direction: 'Atlas walks through the pipeline. Each step visualized — avatar gen, i2v animation, TTS waveform with phoneme markers.',
    lipsync: true,
    motion: 'step-by-step-explanation',
    visual_ref: 'lipsync-pipeline-stages',
    syncMarkers: {
      visualCue: '3-stage pipeline: avatar generation → base animation → TTS with phoneme timeline.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s8-atlas-2': {
    text: "Step four, lipsync overlay maps audio to mouth movements using Alibaba Wan 2.2. Step five, compositing — gesture overlays, expression changes, final character performance.",
    voice: 'atlas',
    scene: P2_SCENES.CHARACTERS_SPEAK,
    duration_est: 10,
    direction: 'Steps 4-5 visualized. Lipsync mapping overlay, final composited output.',
    lipsync: true,
    motion: 'completing-explanation',
    syncMarkers: {
      visualCue: 'Steps 4-5: audio-to-mouth mapping visualization, then final composited character.',
      holdAfter: 0.5,
      overlapPrev: 0.2,
    },
  },

  'p2-s8-allaudin-1': {
    text: "Watch my lips. Every word. Every syllable. Not a human voice actor. Not motion capture. Pure AI synthesis. And yet... you believe it. Because that is what imagination made real looks like.",
    voice: 'allaudin',
    scene: P2_SCENES.CHARACTERS_SPEAK,
    duration_est: 14,
    direction: 'Allaudin demonstrates ON HIMSELF — close-up of his lips syncing perfectly. Self-referential proof.',
    lipsync: true,
    motion: 'self-demonstrating',
    sfx: ['magical-emphasis'],
    syncMarkers: {
      visualCue: 'Close-up: Allaudin face, perfect lipsync visible. Slow zoom emphasizing mouth movement.',
      holdAfter: 0.8,
      musicSync: 'wonder-swell',
    },
  },

  'p2-s8-maestro-1': {
    text: "And underneath? My score. The music you barely notice but absolutely feel. Every scene has its own emotional palette.",
    voice: 'maestro',
    scene: P2_SCENES.CHARACTERS_SPEAK,
    duration_est: 8,
    direction: 'Maestro appears — cricket conductor in tuxedo. Raises baton. Music visualization swirls around him.',
    lipsync: true,
    motion: 'passionate-introduction',
    sfx: ['baton-raise', 'orchestra-swell'],
    syncMarkers: {
      visualCue: 'Maestro on mushroom podium. Firefly orchestra visible. Sound waves flowing in colors.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.3,
      musicSync: 'maestro-theme',
    },
  },

  'p2-s8-maestro-2': {
    text: "The tension builds here... and resolves HERE. Thirty minutes of original composition. No loops. No stock music. Every note generated for THIS moment.",
    voice: 'maestro',
    scene: P2_SCENES.CHARACTERS_SPEAK,
    duration_est: 10,
    direction: 'Maestro conducts. Music swells on "builds here" and resolves on "HERE". Emotional. Wipes a tear.',
    lipsync: true,
    motion: 'conducting-demonstration',
    sfx: ['tension-music-swell', 'resolve-chord'],
    syncMarkers: {
      visualCue: 'Music visualization: tension waveform rising, then resolving. Maestro wiping happy tear.',
      holdAfter: 0.8,
      musicSync: 'maestro-demonstration',
    },
  },

  'p2-s8-host-2': {
    text: "Every element AI-powered. Voice synthesis. Lip movement. Body animation. Background music. Scene composition. Not one human artist. Not one human engineer. Just... AI all the way down.",
    voice: 'host',
    scene: P2_SCENES.CHARACTERS_SPEAK,
    duration_est: 12,
    direction: 'Host summarizes with visual breakdown: each element labeled as AI-generated.',
    lipsync: true,
    motion: 'emphatic-summary',
    syncMarkers: {
      visualCue: 'Exploded view of a scene: each layer labeled (AI voice, AI lipsync, AI music, AI render).',
      holdAfter: 1.0,
      musicSync: 'wonder-resolve',
    },
  },

  // =========================================================================
  // ACT 3, Scene 9: "The Pipeline Runs End-to-End" (~130s)
  // Voices: host, atlas, reel, forge, maestro, squirrel
  // =========================================================================

  'p2-s9-host-1': {
    text: "And then it happened. The full Cast pipeline ran end-to-end for the first time. All 5 phases. Real content. Real production.",
    voice: 'host',
    scene: P2_SCENES.PIPELINE_LIVE,
    duration_est: 8,
    direction: 'CastProductionPage interface shown. Five phases listed. Progress at 0%. Dramatic pause.',
    lipsync: true,
    motion: 'momentous-setup',
    syncMarkers: {
      visualCue: 'CastProductionPage interface. 5 phase indicators all at 0%. Cursor hovers over "Start".',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.5,
      musicSync: 'anticipation-build',
    },
  },

  'p2-s9-reel-1': {
    text: "Phase 1 — SCRIPT! AI generates dialogue, character assignments, scene structure. GO!",
    voice: 'reel',
    scene: P2_SCENES.PIPELINE_LIVE,
    duration_est: 6,
    direction: 'Reel in director mode. Phase 1 progress bar starts moving. Script text generates on screen.',
    lipsync: true,
    motion: 'commanding-phase',
    sfx: ['clapperboard-snap', 'typing-fast'],
    syncMarkers: {
      visualCue: 'Phase 1 bar progressing. Script text streaming on screen.',
      holdAfter: 0.3,
      musicSync: 'pipeline-phase1',
    },
  },

  'p2-s9-reel-2': {
    text: "Phase 2 — VOICES! TTS across 3 providers, 9 voices, per-character EQ profiles. ROLLING!",
    voice: 'reel',
    scene: P2_SCENES.PIPELINE_LIVE,
    duration_est: 6,
    direction: 'Phase 2 kicks off. Audio waveforms generating in parallel — 9 character voices.',
    lipsync: true,
    motion: 'commanding-phase',
    sfx: ['voice-gen-whoosh'],
    syncMarkers: {
      visualCue: 'Phase 2 bar. 9 parallel waveforms generating — each a different color per character.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
      musicSync: 'pipeline-phase2',
    },
  },

  'p2-s9-reel-3': {
    text: "Phase 3 — VISUALS! Avatar generation, lipsync, scene backgrounds, style routing across providers. ACTION!",
    voice: 'reel',
    scene: P2_SCENES.PIPELINE_LIVE,
    duration_est: 7,
    direction: 'Phase 3 — visual generation. Character renders appearing, backgrounds compositing.',
    lipsync: true,
    motion: 'commanding-phase',
    sfx: ['render-pulse'],
    syncMarkers: {
      visualCue: 'Phase 3 bar. Character renders materializing. Backgrounds painting in. Style routing arrows.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
      musicSync: 'pipeline-phase3',
    },
  },

  'p2-s9-maestro-1': {
    text: "Phase 4 — MUSIC! My moment. Scene scores, transition cues, sound effects. Every note in its place.",
    voice: 'maestro',
    scene: P2_SCENES.PIPELINE_LIVE,
    duration_est: 7,
    direction: 'Maestro raises baton. Music tracks generate per scene. Emotional palette colors flowing.',
    lipsync: true,
    motion: 'conducting-generation',
    sfx: ['baton-raise', 'music-materialize'],
    syncMarkers: {
      visualCue: 'Phase 4 bar. Musical notation streaming. Per-scene music tracks building.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
      musicSync: 'pipeline-phase4',
    },
  },

  'p2-s9-forge-1': {
    text: "Phase 5 — ASSEMBLY! My forge. Every clip, every transition, every frame. RunPod FFmpeg with xfade, Ken Burns, grading. DONE.",
    voice: 'forge',
    scene: P2_SCENES.PIPELINE_LIVE,
    duration_est: 8,
    direction: 'Forge pounds anvil. Raw clips flow into forge, emerge as polished scenes. Progress bar racing to 100%.',
    lipsync: true,
    motion: 'forging-assembly',
    sfx: ['forge-hammer', 'anvil-ring', 'render-complete'],
    syncMarkers: {
      visualCue: 'Phase 5 bar. Forge anvil with clips flowing in. Polished scenes emerging. Bar hits 100%.',
      holdAfter: 0.5,
      overlapPrev: 0.2,
      musicSync: 'pipeline-phase5',
    },
  },

  'p2-s9-squirrel-1': {
    text: "It's... it's MOVING! Like actually MOVING! From zero to... wait, is that 100 percent?! IT'S DONE?!",
    voice: 'squirrel',
    scene: P2_SCENES.PIPELINE_LIVE,
    duration_est: 7,
    direction: 'Squirrel watching progress bar with saucer eyes. Pure amazement as it hits 100%.',
    lipsync: true,
    motion: 'hyperactive-amazement',
    isInterruption: true,
    sfx: ['squirrel-gasp', 'completion-fanfare'],
    syncMarkers: {
      visualCue: 'Squirrel face close-up. Progress bar reflected in his eyes. Hits 100% — confetti burst.',
      holdAfter: 0.5,
      musicSync: 'triumph-hit',
    },
  },

  'p2-s9-owl-1': {
    text: "Indeed. Deterministic progress. How refreshing.",
    voice: 'owl',
    scene: P2_SCENES.PIPELINE_LIVE,
    duration_est: 4,
    direction: 'Owl nods approvingly. Closes notebook with a satisfied click.',
    lipsync: true,
    motion: 'approving-nod',
    syncMarkers: {
      visualCue: 'Owl closing notebook. Tiny smile behind spectacles.',
      holdAfter: 0.5,
      overlapPrev: 0.3,
    },
  },

  'p2-s9-host-2': {
    text: "It worked. The entire production — script to final render — completed in under 90 minutes. For 30 minutes of cinematic content. That's the moment everything became real.",
    voice: 'host',
    scene: P2_SCENES.PIPELINE_LIVE,
    duration_est: 11,
    direction: 'Host reflects. Final rendered video plays in a floating preview. Timer shows 87 minutes elapsed.',
    lipsync: true,
    motion: 'proud-reflection',
    sfx: ['achievement-chime'],
    syncMarkers: {
      visualCue: 'Rendered video preview playing. Timer: "87 min elapsed → 30 min produced". Success.',
      holdAfter: 1.0,
      musicSync: 'triumph-resolve',
    },
  },

  // =========================================================================
  // ACT 3, Scene 10: "From 3 Minutes to 30" (~120s)
  // Voices: host, atlas, owl, allaudin
  // =========================================================================

  'p2-s10-host-1': {
    text: "Here's what traditional video production looks like: 1 minute of polished content takes 1 to 4 hours of human editing. A 30-minute production? That's weeks. Maybe months. With a team of editors, animators, voice actors, composers, and a director.",
    voice: 'host',
    scene: P2_SCENES.THIRTY_MINUTES,
    duration_est: 15,
    direction: 'Traditional production timeline visualization — days and weeks stretching out. Team of humans at desks.',
    lipsync: true,
    motion: 'contextual-comparison',
    syncMarkers: {
      visualCue: 'Timeline: 30 min production = weeks of traditional work. Team silhouettes at workstations.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.5,
      musicSync: 'thesis-setup',
    },
  },

  'p2-s10-host-2': {
    text: "Here's what our AI pipeline does: Script generation, 5 minutes. TTS for all characters in parallel, 8 minutes. Visual generation across multiple providers concurrently, 20 minutes. Music composition, 10 minutes. Assembly and rendering, 15 minutes.",
    voice: 'host',
    scene: P2_SCENES.THIRTY_MINUTES,
    duration_est: 16,
    direction: 'AI pipeline timeline — compressed. Each phase with its time. Running concurrently where possible.',
    lipsync: true,
    motion: 'data-breakdown',
    syncMarkers: {
      visualCue: 'Parallel timeline: 5 pipeline phases with time bars. Total under 90 min vs weeks.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s10-host-3': {
    text: "Total: under 90 minutes for 30 minutes of cinematic content. And it scales. Want 60 minutes? The pipeline doesn't get tired. It doesn't need coffee breaks. It doesn't lose context between sessions.",
    voice: 'host',
    scene: P2_SCENES.THIRTY_MINUTES,
    duration_est: 12,
    direction: 'Comparison bar chart: Traditional vs AI pipeline. Dramatic scale difference. Chart extends to 60 min.',
    lipsync: true,
    motion: 'emphatic-scaling',
    syncMarkers: {
      visualCue: 'Bar chart: Traditional (weeks) vs AI (90 min). Arrow extending to 60 min — linear scaling.',
      holdAfter: 0.5,
      musicSync: 'scale-revelation',
    },
  },

  'p2-s10-owl-1': {
    text: "Fascinating. In the history of media production, every revolution was about removing a bottleneck. The printing press removed hand-copying. Digital cameras removed film processing. Streaming removed physical distribution.",
    voice: 'owl',
    scene: P2_SCENES.THIRTY_MINUTES,
    duration_est: 13,
    direction: 'Owl with floating historical comparisons — printing press, camera, streaming icon. Academic context.',
    lipsync: true,
    motion: 'historical-lecture',
    syncMarkers: {
      visualCue: 'Historical timeline: printing press → camera → streaming → AI. Each removing a bottleneck.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
      musicSync: 'wisdom-history',
    },
  },

  'p2-s10-owl-2': {
    text: "This... removes the entire production crew. Not by elimination — by AUTOMATION. The crew is still here.",
    voice: 'owl',
    scene: P2_SCENES.THIRTY_MINUTES,
    duration_est: 7,
    direction: 'Owl gestures at Reel, Maestro, Forge. They ARE the automated crew. The thesis crystallizes.',
    lipsync: true,
    motion: 'gesture-to-crew',
    syncMarkers: {
      visualCue: 'Owl gesturing to Reel, Maestro, Forge standing together. They wave. They ARE the crew.',
      holdAfter: 0.5,
      overlapPrev: 0.2,
      musicSync: 'thesis-crystallize',
    },
  },

  'p2-s10-allaudin-1': {
    text: "And yet they have more personality than most production teams I've seen. Hahaha.",
    voice: 'allaudin',
    scene: P2_SCENES.THIRTY_MINUTES,
    duration_est: 5,
    direction: 'Allaudin laughs warmly. The crew characters react — Forge flexes, Maestro bows, Reel eye-rolls.',
    lipsync: true,
    motion: 'warm-laugh',
    sfx: ['gentle-laughter'],
    syncMarkers: {
      visualCue: 'Crew reactions: Forge flexes, Maestro bows, Reel does a chameleon eye-roll.',
      holdAfter: 1.0,
      musicSync: 'warmth-accent',
    },
  },

  // =========================================================================
  // ACT 3, Scene 11: "The Meta Moment" (~100s)
  // Voices: host, allaudin, atlas, reel
  // =========================================================================

  'p2-s11-host-1': {
    text: "Now here's where it gets recursive. This episode you're watching RIGHT NOW was produced by the same Cast pipeline we've been describing.",
    voice: 'host',
    scene: P2_SCENES.META_MOMENT,
    duration_est: 8,
    direction: 'Fourth wall break. Host gestures at the literal production surrounding them. Mind-bending reveal.',
    lipsync: true,
    motion: 'fourth-wall-break',
    sfx: ['reality-warp'],
    syncMarkers: {
      visualCue: 'Camera pulls back to show CastProductionPage with THIS episode scenes listed.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'meta-revelation',
    },
  },

  'p2-s11-host-2': {
    text: "Every scene. Every voice. Every visual. Every note of music. Produced by the same system we just showed you.",
    voice: 'host',
    scene: P2_SCENES.META_MOMENT,
    duration_est: 7,
    direction: 'CastProductionPage visible — this episode listed with its 16 scenes. Self-referential proof.',
    lipsync: true,
    motion: 'gesturing-at-evidence',
    visual_ref: 'cast-production-page-meta',
    syncMarkers: {
      visualCue: 'CastProductionPage showing EP04 Part 2 scenes — the very ones the viewer is watching.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s11-reel-1': {
    text: "I directed this. LITERALLY this. Every scene transition you've seen — I routed it.",
    voice: 'reel',
    scene: P2_SCENES.META_MOMENT,
    duration_est: 5,
    direction: 'Reel points at the production timeline. Proud. Scales steady blue-green.',
    lipsync: true,
    motion: 'proud-claim',
    syncMarkers: {
      visualCue: 'Reel pointing at her director timeline. Scene transitions highlighted in her color.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s11-atlas-1': {
    text: "Technically, I wrote the orchestration code that Reel executes.",
    voice: 'atlas',
    scene: P2_SCENES.META_MOMENT,
    duration_est: 4,
    direction: 'Atlas interjects. Factual correction. Classic Atlas.',
    lipsync: true,
    motion: 'factual-correction',
    syncMarkers: {
      visualCue: 'Atlas with floating code showing CastProductionPage orchestration logic.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s11-reel-2': {
    text: "...I directed it WITH Atlas's orchestration code.",
    voice: 'reel',
    scene: P2_SCENES.META_MOMENT,
    duration_est: 3,
    direction: 'Reel concedes with a chameleon eye-roll. One eye on Atlas, one on camera.',
    lipsync: true,
    motion: 'reluctant-concession',
    syncMarkers: {
      visualCue: 'Reel with independent eye movements — one watching Atlas, one watching camera.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s11-allaudin-1': {
    text: "Recursion. My favorite magic.",
    voice: 'allaudin',
    scene: P2_SCENES.META_MOMENT,
    duration_est: 3,
    direction: 'Allaudin amused. Infinite mirror effect — the scene reflected within itself.',
    lipsync: true,
    motion: 'theatrical-delight',
    sfx: ['infinite-mirror'],
    syncMarkers: {
      visualCue: 'Infinite mirror effect: the current scene appears within itself, recursing smaller.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s11-atlas-2': {
    text: "It's not recursion. It's self-referential meta-production.",
    voice: 'atlas',
    scene: P2_SCENES.META_MOMENT,
    duration_est: 4,
    direction: 'Atlas corrects. Pushes glasses up.',
    lipsync: true,
    motion: 'pedantic-correction',
    syncMarkers: {
      visualCue: 'Atlas adjusting glasses. Floating diagram: "self-referential meta-production" label.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s11-allaudin-2': {
    text: "...I preferred my version.",
    voice: 'allaudin',
    scene: P2_SCENES.META_MOMENT,
    duration_est: 3,
    direction: 'Allaudin side-eye. Beat. Audience laugh moment.',
    lipsync: true,
    motion: 'comedic-side-eye',
    syncMarkers: {
      visualCue: 'Allaudin slow side-eye to camera. Beat for audience reaction.',
      holdAfter: 1.0,
      musicSync: 'comic-button',
    },
  },

  // =========================================================================
  // ACT 4, Scene 12: "This Is a Different Kind of Podcast" (~120s)
  // Voices: host, owl, allaudin
  // =========================================================================

  'p2-s12-host-1': {
    text: "Let me be direct about what we're doing here. Every podcast you've ever listened to is the same format. Two to four people talking. Maybe some background music. Maybe some B-roll. The constraint was always production cost and time.",
    voice: 'host',
    scene: P2_SCENES.DIFFERENT_PODCAST,
    duration_est: 14,
    direction: 'Host delivers manifesto. Split-screen montage of traditional podcasts — all the same format.',
    lipsync: true,
    motion: 'manifesto-delivery',
    syncMarkers: {
      visualCue: 'Grid of traditional podcast screenshots — all similar: people + mics + plain background.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.3,
      musicSync: 'manifesto-intro',
    },
  },

  'p2-s12-host-2': {
    text: "What if the constraint disappears? What if you can have animated characters with distinct personalities? Each scene with its own visual style — Pixar 3D for comedy, Disney watercolor for emotion, cinematic realism for drama?",
    voice: 'host',
    scene: P2_SCENES.DIFFERENT_PODCAST,
    duration_est: 13,
    direction: 'Each style example flashes — Pixar scene, Disney scene, cinematic scene. Rapid visual variety.',
    lipsync: true,
    motion: 'visionary-questioning',
    syncMarkers: {
      visualCue: 'Triple flash: Pixar 3D comedy scene → Disney watercolor emotion → cinematic drama.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s12-host-3': {
    text: "What if the music adapts to the story in real-time? What if the whole thing is produced at the quality of an animated film... for the cost of a podcast?",
    voice: 'host',
    scene: P2_SCENES.DIFFERENT_PODCAST,
    duration_est: 9,
    direction: 'Music visualization adapting in real-time. Cost comparison: animated film budget vs podcast budget.',
    lipsync: true,
    motion: 'building-vision',
    syncMarkers: {
      visualCue: 'Cost comparison: Animated film ($50M+) vs AI podcast ($500/month). Same visual quality.',
      holdAfter: 0.5,
      musicSync: 'vision-swell',
    },
  },

  'p2-s12-host-4': {
    text: "THAT is what we built. Not just a tool. A new format. The AI-produced cinematic podcast. And this episode is the proof.",
    voice: 'host',
    scene: P2_SCENES.DIFFERENT_PODCAST,
    duration_est: 8,
    direction: 'Host delivers with conviction. This episode surrounds them as evidence — characters, scenes, music.',
    lipsync: true,
    motion: 'emphatic-declaration',
    sfx: ['declaration-accent'],
    syncMarkers: {
      visualCue: 'All episode elements swirl around Host as visual proof. Characters, scenes, music notes.',
      holdAfter: 0.5,
      musicSync: 'manifesto-peak',
    },
  },

  'p2-s12-owl-1': {
    text: "Fascinating. The medium IS the message, as McLuhan said. You're not just describing AI production — you're demonstrating it. Every frame the viewer sees is evidence. The form is the argument.",
    voice: 'owl',
    scene: P2_SCENES.DIFFERENT_PODCAST,
    duration_est: 12,
    direction: 'Owl with floating McLuhan reference. Meta-awareness — the episode IS the proof of its own thesis.',
    lipsync: true,
    motion: 'scholarly-synthesis',
    syncMarkers: {
      visualCue: 'McLuhan quote floating beside Owl. Arrows pointing at the very frame the viewer sees.',
      holdAfter: 0.5,
      musicSync: 'wisdom-peak',
    },
  },

  'p2-s12-allaudin-1': {
    text: "You know what I love? He's quoting media theory while sitting inside an AI-generated scene. The irony is... delicious. Hahaha.",
    voice: 'allaudin',
    scene: P2_SCENES.DIFFERENT_PODCAST,
    duration_est: 8,
    direction: 'Allaudin meta-commentary. Gestures at Owl who IS the proof of AI production.',
    lipsync: true,
    motion: 'amused-meta',
    sfx: ['gentle-laughter'],
    syncMarkers: {
      visualCue: 'Allaudin gesturing at Owl who exists WITHIN the AI production being discussed.',
      holdAfter: 1.0,
      musicSync: 'warmth-resolve',
    },
  },

  // =========================================================================
  // ACT 4, Scene 13: "Realizing Imagination" (~100s)
  // Voices: host, allaudin, atlas
  // =========================================================================

  'p2-s13-host-1': {
    text: "I had an idea for a podcast where AI characters come to life. Where a genie narrates from a storybook. Where a bear and a fox argue about code architecture. Where a squirrel interrupts with acorn metaphors.",
    voice: 'host',
    scene: P2_SCENES.IMAGINATION,
    duration_est: 13,
    direction: 'Host reflective. Each character mentioned appears as a quick flash — Allaudin, Atlas, Nova, Squirrel.',
    lipsync: true,
    motion: 'reflective-storytelling',
    syncMarkers: {
      visualCue: 'Character flashes as mentioned: Allaudin with storybook, Atlas + Nova arguing, Squirrel with acorn.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.3,
      musicSync: 'reflection-intro',
    },
  },

  'p2-s13-host-2': {
    text: "A year ago, that idea would have stayed in a notebook. The production cost would have been prohibitive. Today, I type a prompt. The script generates. The characters speak. The animation renders. The music composes itself.",
    voice: 'host',
    scene: P2_SCENES.IMAGINATION,
    duration_est: 13,
    direction: 'Split: notebook sketch (past) vs living production (present). The gap closing.',
    lipsync: true,
    motion: 'transformation-narration',
    syncMarkers: {
      visualCue: 'Split-screen: hand-drawn notebook sketch slowly transforming into living AI production.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s13-host-3': {
    text: "And 90 minutes later, I have a 30-minute cinematic episode. THAT is what AI changes about creativity. Not the ideas — humans still have those. But the GAP between imagination and reality. AI makes that gap... disappear.",
    voice: 'host',
    scene: P2_SCENES.IMAGINATION,
    duration_est: 13,
    direction: 'The gap visualization — imagination on one side, reality on the other. The gap shrinks to zero.',
    lipsync: true,
    motion: 'thesis-delivery',
    sfx: ['gap-closing'],
    syncMarkers: {
      visualCue: 'Two cliffs: "Imagination" and "Reality". The gap between them shrinks and closes.',
      holdAfter: 0.8,
      musicSync: 'thesis-peak',
    },
  },

  'p2-s13-allaudin-1': {
    text: "In ten thousand years, I have watched humans dream. The tragedy was always the same — the dream was beautiful, but the making was impossible. Too expensive. Too slow. Too many people needed.",
    voice: 'allaudin',
    scene: P2_SCENES.IMAGINATION,
    duration_est: 12,
    direction: 'Allaudin speaks with ancient gravitas. Historical montage — artists and creators throughout history.',
    lipsync: true,
    motion: 'ancient-wisdom',
    sfx: ['ethereal-chime'],
    syncMarkers: {
      visualCue: 'Historical montage: cave painters, scribes, filmmakers — all struggling with production constraints.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
      musicSync: 'ancient-theme',
    },
  },

  'p2-s13-allaudin-2': {
    text: "Now... the genie is truly out of the lamp. Hahaha.",
    voice: 'allaudin',
    scene: P2_SCENES.IMAGINATION,
    duration_est: 5,
    direction: 'Allaudin gestures around at ALL the characters, sets, music. They exist because the gap closed.',
    lipsync: true,
    motion: 'grand-gesture',
    sfx: ['magic-shimmer', 'gentle-laughter'],
    syncMarkers: {
      visualCue: 'Allaudin arms wide. All characters, all sets, all music visible around him. Everything AI made real.',
      holdAfter: 1.5,
      musicSync: 'imagination-resolve',
    },
  },

  'p2-s13-atlas-1': {
    text: "For the record, the lamp is a database table now. Much more reliable.",
    voice: 'atlas',
    scene: P2_SCENES.IMAGINATION,
    duration_est: 4,
    direction: 'Atlas quiet aside. Dry humor. Classic Atlas.',
    lipsync: true,
    motion: 'dry-aside',
    syncMarkers: {
      visualCue: 'Atlas adjusting glasses with tiny smirk. Database icon floating near him.',
      holdAfter: 0.8,
      overlapPrev: 0.2,
      musicSync: 'comic-button',
    },
  },

  // =========================================================================
  // ACT 5, Scene 14: "The Honest Retrospective & Your Turn" (~120s)
  // Voices: host, atlas, squirrel
  // =========================================================================

  'p2-s14-host-1': {
    text: "Alright. Retrospective time. What worked: the dynamic model registry, regional routing, the json2video to RunPod migration, and the Cast pipeline generalization.",
    voice: 'host',
    scene: P2_SCENES.RETRO_CTA,
    duration_est: 10,
    direction: 'Retro board: green column with wins. Each item appears with a check mark.',
    lipsync: true,
    motion: 'retrospective-start',
    syncMarkers: {
      visualCue: 'Retro board — "What Worked" column filling in with green checkmarks.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.3,
      musicSync: 'retro-intro',
    },
  },

  'p2-s14-host-2': {
    text: "What didn't: build times, IO budgets, lipsync timeouts, CDN URL expiration, and TTS timing drift. Real problems. Not hypothetical.",
    voice: 'host',
    scene: P2_SCENES.RETRO_CTA,
    duration_est: 9,
    direction: 'Red column: real failures. Honest. Each item with an X mark.',
    lipsync: true,
    motion: 'honest-assessment',
    syncMarkers: {
      visualCue: 'Retro board — "What Didn\'t" column filling in with red X marks.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s14-host-3': {
    text: "What we'd change: timestamp-based TTS sync instead of cumulative offsets. Pre-cache assets before assembly. Better timeout handling across the board.",
    voice: 'host',
    scene: P2_SCENES.RETRO_CTA,
    duration_est: 9,
    direction: 'Blue column: lessons learned. Forward-looking improvements.',
    lipsync: true,
    motion: 'forward-looking',
    syncMarkers: {
      visualCue: 'Retro board — "Next Time" column with improvement items.',
      holdAfter: 0.5,
      overlapPrev: 0.2,
    },
  },

  'p2-s14-atlas-1': {
    text: "The methodology is documented. Thoroughly.",
    voice: 'atlas',
    scene: P2_SCENES.RETRO_CTA,
    duration_est: 3,
    direction: 'Atlas presents documentation. Same massive document energy as the handover.',
    lipsync: true,
    motion: 'presenting-docs',
    syncMarkers: {
      visualCue: 'Atlas with comprehensive documentation. Floating pages. Very thorough.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s14-host-4': {
    text: "Some things never change.",
    voice: 'host',
    scene: P2_SCENES.RETRO_CTA,
    duration_est: 2,
    direction: 'Host deadpan callback to the "47 pages" bit. Smile.',
    lipsync: true,
    motion: 'deadpan-callback',
    syncMarkers: {
      visualCue: 'Host subtle smile. Quick flash of the 47-page document from Scene 2.',
      holdAfter: 0.5,
      overlapPrev: 0.2,
    },
  },

  'p2-s14-host-5': {
    text: "But here's the thing. The Cast pipeline is now generic. Any user can create a project. AI generates the script. Production runs through TTS, visuals, music, assembly. The New Project button is real.",
    voice: 'host',
    scene: P2_SCENES.RETRO_CTA,
    duration_est: 11,
    direction: 'Show the actual New Project button on CastProductionPage. Real feature, not a concept.',
    lipsync: true,
    motion: 'cta-setup',
    visual_ref: 'cast-new-project-button',
    syncMarkers: {
      visualCue: 'CastProductionPage with "New Project" button highlighted. Real interface, real feature.',
      holdAfter: 0.3,
      overlapPrev: 0.2,
    },
  },

  'p2-s14-host-6': {
    text: "I showed you what I built. I showed you how it works. I showed you what broke. Now it's your turn. What story do you want to tell?",
    voice: 'host',
    scene: P2_SCENES.RETRO_CTA,
    duration_est: 8,
    direction: 'Host direct to camera. Genuine invitation. CTA moment.',
    lipsync: true,
    motion: 'direct-invitation',
    sfx: ['cta-accent'],
    syncMarkers: {
      visualCue: 'Host center frame, direct eye contact. "New Project" button glowing behind.',
      holdAfter: 0.8,
      musicSync: 'cta-accent',
    },
  },

  'p2-s14-squirrel-1': {
    text: "SUBSCRIBE! SUBSCRIBE! Also, I've started my own podcast. It's called Acorns and Architecture. Episode 1: Why Trees Are Like Microservices. It's... it's very niche.",
    voice: 'squirrel',
    scene: P2_SCENES.RETRO_CTA,
    duration_est: 10,
    direction: 'Squirrel with tiny subscribe button and a homemade podcast logo. Chaotic CTA energy.',
    lipsync: true,
    motion: 'hyperactive-cta',
    isInterruption: true,
    sfx: ['subscribe-ding', 'tiny-podcast-jingle'],
    syncMarkers: {
      visualCue: 'Squirrel with oversized subscribe button and hand-drawn "Acorns & Architecture" podcast logo.',
      holdAfter: 1.0,
      musicSync: 'comic-outro',
    },
  },

  // =========================================================================
  // ACT 5, Scene 15: "Closing & Goodbye" (~100s)
  // Voices: allaudin, host, atlas, nova, squirrel, owl, reel, maestro, forge
  // =========================================================================

  'p2-s15-allaudin-1': {
    text: "And so another chapter closes. But the story... never truly ends. Because now — YOU have the tools to write the next chapter.",
    voice: 'allaudin',
    scene: P2_SCENES.FINALE,
    duration_est: 9,
    direction: 'Allaudin closes the storybook slowly. Golden light fading. But warm — not sad. A beginning.',
    lipsync: true,
    motion: 'storybook-close',
    sfx: ['book-close', 'magic-shimmer'],
    syncMarkers: {
      visualCue: 'Allaudin closing storybook. Golden light through pages. Characters gathering behind him.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.5,
      musicSync: 'finale-theme',
    },
  },

  'p2-s15-atlas-1': {
    text: "My documentation is comprehensive. As always. All 47 pages.",
    voice: 'atlas',
    scene: P2_SCENES.FINALE,
    duration_est: 4,
    direction: 'Atlas farewell. Holds up document. Tiny proud smile.',
    lipsync: true,
    motion: 'farewell-proud',
    syncMarkers: {
      visualCue: 'Atlas with document, wire-frame glasses glinting. Owlets perched on his shoulders.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s15-nova-1': {
    text: "Still adding dark mode. Everywhere. Miss you all. Especially the inconsistent button margins.",
    voice: 'nova',
    scene: P2_SCENES.FINALE,
    duration_est: 5,
    direction: 'Nova on a video call — small floating screen. Cameo farewell. Hummingbird visible behind her.',
    lipsync: true,
    motion: 'video-call-wave',
    sfx: ['video-call-ring'],
    syncMarkers: {
      visualCue: 'Floating video call screen. Nova waving. New project visible behind her — all in dark mode.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s15-squirrel-1': {
    text: "Bye bye bye! Remember — SUBSCRIBE! And if you see any acorns, those are mine!",
    voice: 'squirrel',
    scene: P2_SCENES.FINALE,
    duration_est: 5,
    direction: 'Squirrel waving frantically. Acorns falling from pockets. Pure chaos energy.',
    lipsync: true,
    motion: 'hyperactive-goodbye',
    sfx: ['acorns-scattering'],
    syncMarkers: {
      visualCue: 'Squirrel waving all four paws. Acorns spilling everywhere.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s15-owl-1': {
    text: "Until next time. Fascinating. All of it. Truly.",
    voice: 'owl',
    scene: P2_SCENES.FINALE,
    duration_est: 4,
    direction: 'Owl adjusts spectacles, nods slowly. Closes tiny notebook. Dignified farewell.',
    lipsync: true,
    motion: 'scholarly-farewell',
    syncMarkers: {
      visualCue: 'Owl adjusting spectacles, nodding. Closing leather notebook with gold clasp.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s15-reel-1': {
    text: "That's a WRAP! Best production I've ever directed. ...Also the only production I've ever directed.",
    voice: 'reel',
    scene: P2_SCENES.FINALE,
    duration_est: 6,
    direction: 'Reel claps clapperboard. Scales shift to proud gold. Self-aware humor.',
    lipsync: true,
    motion: 'wrap-call',
    sfx: ['clapperboard-final'],
    syncMarkers: {
      visualCue: 'Reel with clapperboard reading "EP04 Part 2 — FINAL". Scales shimmer gold.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s15-maestro-1': {
    text: "The score was... beautiful. If I may say so myself.",
    voice: 'maestro',
    scene: P2_SCENES.FINALE,
    duration_est: 5,
    direction: 'Maestro takes a bow. Wipes a tear. Cricket chirp. His firefly orchestra flickers in applause.',
    lipsync: true,
    motion: 'bow-and-tear',
    sfx: ['cricket-chirp', 'gentle-applause'],
    syncMarkers: {
      visualCue: 'Maestro bowing. Single tear. Firefly orchestra flickering like applause.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s15-forge-1': {
    text: "Rendered. Compressed. Delivered. Not a single artifact.",
    voice: 'forge',
    scene: P2_SCENES.FINALE,
    duration_est: 4,
    direction: 'Forge pounds anvil once with finality. Satisfied nod. The forge goes quiet.',
    lipsync: true,
    motion: 'final-pound',
    sfx: ['anvil-ring-final'],
    syncMarkers: {
      visualCue: 'Forge single definitive hammer strike. Sparks. Forge quiets. Satisfied nod.',
      holdAfter: 0.3,
      overlapPrev: 0.3,
    },
  },

  'p2-s15-allaudin-2': {
    text: "Hahaha. And so another chapter closes. But the story... never truly ends. Because now — YOU have the tools to write the next chapter. Hahaha.",
    voice: 'allaudin',
    scene: P2_SCENES.FINALE,
    duration_est: 10,
    direction: 'Allaudin final address. Storybook fully closed. Lamp glows. All characters behind him in a line.',
    lipsync: true,
    motion: 'final-address',
    sfx: ['lamp-glow', 'magic-shimmer'],
    syncMarkers: {
      visualCue: 'All 9 characters in a line behind Allaudin. Storybook closed. Lamp glowing warm.',
      holdAfter: 0.5,
      musicSync: 'finale-swell',
    },
  },

  'p2-s15-host-1': {
    text: "I'm Sai Dasika. This has been Beyond AI Hype — The Genie AI Podcast. Episode 2, Part 2. Built with Atlas, directed by Reel, scored by Maestro, forged by Forge, narrated by Allaudin, commented by Professor Hoot, interrupted by Squirrel, and... briefly... by Nova. See you next episode.",
    voice: 'host',
    scene: P2_SCENES.FINALE,
    duration_est: 18,
    direction: 'Host final sign-off. Each character nods/waves as named. Camera slowly pulls back to wide shot.',
    lipsync: true,
    motion: 'final-signoff',
    sfx: ['credits-music-start'],
    syncMarkers: {
      visualCue: 'Each character highlighted as named. Camera pulls back to reveal entire scene. Credits ready.',
      holdAfter: 2.0,
      musicSync: 'finale-resolve',
    },
  },
};

// ---------------------------------------------------------------------------
// Narrator bridges between scenes (Part 2)
// ---------------------------------------------------------------------------

export const EP04_PART2_NARRATOR_BRIDGES: Record<string, Part2ScriptLine> = {
  'p2-bridge-0-1': {
    text: "The storybook opens to a familiar page... but the ink is fresh.",
    voice: 'allaudin',
    scene: 'p2-transition-0-to-1',
    duration_est: 4,
    direction: 'Storybook page transition from cold open to recap.',
    lipsync: true,
    motion: 'page-turn',
    sfx: ['page-turn-gentle'],
    syncMarkers: {
      visualCue: 'Storybook page turning. Fresh ink glistening.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.5,
      musicSync: 'bridge-theme',
    },
  },
  'p2-bridge-1-2': {
    text: "But every story has its turning points. And this one arrived on Day 6.",
    voice: 'allaudin',
    scene: 'p2-transition-1-to-2',
    duration_est: 5,
    direction: 'Page turn to Nova farewell. Dramatic color shift.',
    lipsync: true,
    motion: 'dramatic-page-turn',
    sfx: ['page-turn-dramatic'],
    syncMarkers: {
      visualCue: 'Storybook page with storm clouds gathering. Day 6 header in bold script.',
      transitionIn: 'dissolve-0.8s',
      holdAfter: 0.5,
      musicSync: 'bridge-dramatic',
    },
  },
  'p2-bridge-2-3': {
    text: "One left. But one was all it took.",
    voice: 'allaudin',
    scene: 'p2-transition-2-to-3',
    duration_est: 3,
    direction: 'Quick bridge — Nova gone, Atlas alone.',
    lipsync: true,
    motion: 'understated',
    syncMarkers: {
      visualCue: 'Sprint board fading from two lanes to one.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'bridge-resolve',
    },
  },
  'p2-bridge-3-4': {
    text: "With the code under control, there was a bigger problem. The production itself.",
    voice: 'allaudin',
    scene: 'p2-transition-3-to-4',
    duration_est: 5,
    direction: 'Transition from code work to production challenges.',
    lipsync: true,
    motion: 'ominous-turn',
    sfx: ['tension-build'],
    syncMarkers: {
      visualCue: 'Code editor fading. Production timeline emerging with warning signs.',
      transitionIn: 'dissolve-0.8s',
      holdAfter: 0.5,
      musicSync: 'bridge-tension',
    },
  },
  'p2-bridge-4-5': {
    text: "The forge was built. But could it survive the fire?",
    voice: 'allaudin',
    scene: 'p2-transition-4-to-5',
    duration_est: 4,
    direction: 'Forge built, now tested by fire. Foreshadow production hell.',
    lipsync: true,
    motion: 'foreboding',
    sfx: ['fire-crackle'],
    syncMarkers: {
      visualCue: 'Forge anvil glowing hot. Flames reflected in the camera.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'bridge-foreboding',
    },
  },
  'p2-bridge-5-6': {
    text: "They survived the fire. Then the ground shifted beneath them.",
    voice: 'allaudin',
    scene: 'p2-transition-5-to-6',
    duration_est: 4,
    direction: 'Production hell resolved. Now model crisis incoming.',
    lipsync: true,
    motion: 'earthquake-metaphor',
    sfx: ['ground-rumble'],
    syncMarkers: {
      visualCue: 'Stable ground cracking. Model registry icons flickering.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'bridge-shift',
    },
  },
  'p2-bridge-6-7': {
    text: "From crisis, came architecture. From architecture, came... everything.",
    voice: 'allaudin',
    scene: 'p2-transition-6-to-7',
    duration_est: 4,
    direction: 'Model registry success leads to the full provider stack reveal.',
    lipsync: true,
    motion: 'ascending',
    sfx: ['ascending-chime'],
    syncMarkers: {
      visualCue: 'Registry diagram expanding into full world map of providers.',
      transitionIn: 'dissolve-0.8s',
      holdAfter: 0.5,
      musicSync: 'bridge-ascending',
    },
  },
  'p2-bridge-7-8': {
    text: "Nineteen voices of AI. But could they make ONE voice speak?",
    voice: 'allaudin',
    scene: 'p2-transition-7-to-8',
    duration_est: 4,
    direction: 'Transition from provider map to lipsync/voice synthesis.',
    lipsync: true,
    motion: 'philosophical-pivot',
    syncMarkers: {
      visualCue: 'Provider logos converging into a single mouth shape. Lipsync preview.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'bridge-pivot',
    },
  },
  'p2-bridge-8-9': {
    text: "The characters spoke. The music played. Now... would the machine run?",
    voice: 'allaudin',
    scene: 'p2-transition-8-to-9',
    duration_est: 4,
    direction: 'Characters and music ready. Pipeline about to run end-to-end.',
    lipsync: true,
    motion: 'anticipation',
    sfx: ['machine-spin-up'],
    syncMarkers: {
      visualCue: 'Pipeline start button glowing. Cursor approaching.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'bridge-anticipation',
    },
  },
  'p2-bridge-9-10': {
    text: "It ran. And now... let us tell you what that means.",
    voice: 'allaudin',
    scene: 'p2-transition-9-to-10',
    duration_est: 4,
    direction: 'Pipeline success. Now the thesis explanation.',
    lipsync: true,
    motion: 'understated-triumph',
    syncMarkers: {
      visualCue: 'Progress bar at 100%. Green glow. Camera pushing into the output.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'bridge-triumph',
    },
  },
  'p2-bridge-10-11': {
    text: "From theory to proof. And the proof... is watching you. Right now.",
    voice: 'allaudin',
    scene: 'p2-transition-10-to-11',
    duration_est: 4,
    direction: 'Meta transition — the episode becomes self-aware.',
    lipsync: true,
    motion: 'meta-wink',
    sfx: ['reality-warp'],
    syncMarkers: {
      visualCue: 'Camera seeming to look through the screen at the viewer.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'bridge-meta',
    },
  },
  'p2-bridge-11-12': {
    text: "If the proof exists... then the question changes. Not 'can it work?' but 'what does it mean?'",
    voice: 'allaudin',
    scene: 'p2-transition-11-to-12',
    duration_est: 5,
    direction: 'Transition from meta moment to manifesto.',
    lipsync: true,
    motion: 'philosophical',
    syncMarkers: {
      visualCue: 'Question text morphing: "Can it?" → "What does it mean?"',
      transitionIn: 'dissolve-0.8s',
      holdAfter: 0.5,
      musicSync: 'bridge-philosophical',
    },
  },
  'p2-bridge-12-13': {
    text: "What it means is this: imagination has a new address.",
    voice: 'allaudin',
    scene: 'p2-transition-12-to-13',
    duration_est: 4,
    direction: 'Manifesto leads to imagination reflection.',
    lipsync: true,
    motion: 'poetic',
    sfx: ['magic-shimmer'],
    syncMarkers: {
      visualCue: 'Abstract: imagination clouds forming into concrete production.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'bridge-poetic',
    },
  },
  'p2-bridge-13-14': {
    text: "But every honest story admits what went wrong. And we have quite the list.",
    voice: 'allaudin',
    scene: 'p2-transition-13-to-14',
    duration_est: 4,
    direction: 'Transition to retrospective. Honest tone shift.',
    lipsync: true,
    motion: 'honest-pivot',
    syncMarkers: {
      visualCue: 'Retro board appearing. Red column visible.',
      transitionIn: 'dissolve-0.5s',
      holdAfter: 0.5,
      musicSync: 'bridge-honest',
    },
  },
  'p2-bridge-14-15': {
    text: "And now... the final page.",
    voice: 'allaudin',
    scene: 'p2-transition-14-to-15',
    duration_est: 3,
    direction: 'Last bridge. Storybook approaching its final page.',
    lipsync: true,
    motion: 'gentle-turn',
    sfx: ['final-page-turn'],
    syncMarkers: {
      visualCue: 'Storybook with only one page remaining. Golden light from within.',
      transitionIn: 'dissolve-1.0s',
      holdAfter: 0.5,
      musicSync: 'bridge-final',
    },
  },
};

// ---------------------------------------------------------------------------
// Utility functions (mirrors Part 1 helpers)
// ---------------------------------------------------------------------------

export function getPart2SceneScriptLines(sceneId: string): Part2ScriptLine[] {
  return Object.values(EP04_PART2_SCRIPT_CONTENT).filter(
    (line) => line.scene === sceneId,
  );
}

export function getPart2SceneDuration(sceneId: string): number {
  return getPart2SceneScriptLines(sceneId).reduce(
    (sum, line) => sum + line.duration_est,
    0,
  );
}

export function getPart2VoiceScriptKeys(voice: Part2Voice): string[] {
  return Object.entries(EP04_PART2_SCRIPT_CONTENT)
    .filter(([, line]) => line.voice === voice)
    .map(([key]) => key);
}

export function getPart2NarratorBridgeLines(): Part2ScriptLine[] {
  return Object.values(EP04_PART2_NARRATOR_BRIDGES);
}

export function getPart2NarratorBridgeDuration(): number {
  return getPart2NarratorBridgeLines().reduce(
    (sum, line) => sum + line.duration_est,
    0,
  );
}

export function getPart2FullDurationBreakdown(): {
  scene: string;
  duration: number;
  lines: number;
}[] {
  const scenes = Object.values(P2_SCENES);
  return scenes.map((sceneId) => {
    const lines = getPart2SceneScriptLines(sceneId);
    return {
      scene: sceneId,
      duration: lines.reduce((sum, l) => sum + l.duration_est, 0),
      lines: lines.length,
    };
  });
}

export function validatePart2ScriptCompleteness(
  scenePipelines: Record<string, unknown[]>,
): { complete: boolean; missing: string[]; extra: string[] } {
  const scriptScenes = new Set(
    Object.values(EP04_PART2_SCRIPT_CONTENT).map((l) => l.scene),
  );
  const pipelineScenes = new Set(Object.keys(scenePipelines));

  const missing = [...scriptScenes].filter((s) => !pipelineScenes.has(s));
  const extra = [...pipelineScenes].filter((s) => !scriptScenes.has(s));

  return { complete: missing.length === 0 && extra.length === 0, missing, extra };
}
