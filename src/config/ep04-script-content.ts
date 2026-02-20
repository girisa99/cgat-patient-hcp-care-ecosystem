/**
 * EP02 SCRIPT CONTENT — "Beyond AI Hype" Episode 2
 * 
 * Title: "Beyond AI Hype — Episode 2: I Replaced My Entire Dev Team with Two AIs. Here's What Actually Happened."
 * 
 * Narrative Structure: HOOK → PROBLEM → SOLUTION → CTA
 * 
 * Characters:
 * - Host: Product Owner, Scrum Master, QA Lead — the human in the loop
 * - Atlas (Claude Code / Anthropic): AI Tech Lead — backend, architecture, governance
 * - Nova (Lovable): AI Frontend Dev — UI, landing pages, design system
 * 
 * Each entry includes:
 * - text: The exact TTS input string
 * - voice: Which voice renders it (host/atlas/nova)
 * - scene: Which scene it belongs to
 * - duration_est: Estimated seconds (at ~150 wpm)
 * - direction: Performance/delivery notes for TTS tuning
 * 
 * TARGET: 12–15 minutes total audio (~720–900s)
 * SCENES: 12 scenes (0–11), 55+ dialogue lines
 */

export interface ScriptLine {
  text: string;
  voice: 'host' | 'atlas' | 'nova' | 'squirrel' | 'allaudin';
  scene: string;
  duration_est: number;
  direction: string;
  isInterruption?: boolean;
  /** Lip-sync & motion flags for production */
  lipsync?: boolean;
  /** SFX cues to trigger during this line */
  sfx?: string[];
  /** Motion/animation cue for the character */
  motion?: string;
}

export const EP04_SCRIPT_CONTENT: Record<string, ScriptLine> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 0: TITLE & WELCOME — THE HOOK (0:00–1:15)
  // VISUAL: Animated title card with "Beyond AI Hype" logo. Genie AI Hub branding.
  // Split-screen thumbnail: Claude logo (left/blue) + Lovable logo (right/pink-green)
  // Atlas (bear) and Nova (fox) 3D characters flanking. Host in center foreground.
  // LOWER-THIRD: "Beyond AI Hype — Episode 2"
  // ═══════════════════════════════════════════════════════════════════════════

  // ── ALLAUDIN EMERGES — Lamp mist intro before host welcome
  'allaudin-emerge': {
    text: `*magical mist swirls from lamp* Ahhh... at last! I am Allaudin — the Genie of Genie AI. And YOU... have summoned something extraordinary. This is not your ordinary podcast. This is The Genie AI Podcast — where creativity meets code, where ideas become reality, and where AI goes beyond the hype. Beyond AI Hype — we bring it to life. Your host, Sai Dasika, has a story to tell. And I? I'll be here — guiding, watching, and maybe... granting a wish or two along the way. *laughs* Let us begin!`,
    voice: 'allaudin',
    scene: 'scene-0-title',
    duration_est: 28,
    direction: 'Grand, theatrical, warm. Allaudin emerges from lamp as blue mist — mystical sound effects, sparkle particles. Voice is deep, resonant, wise but playful. Lip-sync ON — mouth moves with every word. "Beyond AI Hype — we bring it to life" is the thesis — deliver with gravitas. The laugh is genuine and magical. "Let us begin" is a dramatic cue for the host.',
    lipsync: true,
    sfx: ['lamp_whoosh', 'magical_mist', 'sparkle_chime', 'deep_gong'],
    motion: 'emerge-from-lamp-mist-swirl',
  },

  'title-welcome': {
    text: `Welcome to Beyond AI Hype — The Genie AI Podcast. I'm Sai Dasika, your host. And this — is where Allaudin, our Genie, meets the real world.

A podcast doesn't need to be traditional. That's exactly what Genie AI does differently. I don't just build — I show what I build, and what I learned in the process. AI beyond the hype. Real creativity. Real experimentation. Real results.

This is Episode 2 — with Allaudin guiding us through the story. And today, I want to tell you a real story. About how I've been working with two AI developers for three months now, building a product called Genie AI Hub. And somewhere along the way, I realized something that changed how I think about software development entirely.

One developer — one human — managing two AIs — is doing the work of five. Not in theory. Not in a pitch deck. In production. In real code. With real governance. And I have the receipts.

But before I introduce the team, let me tell you about the problem that started all of this.`,
    voice: 'host',
    scene: 'scene-0-title',
    duration_est: 60,
    direction: 'Warm, welcoming, direct to camera. Title card with Lovable + Claude logos. "Sai Dasika" is confident — owning the stage. "Allaudin" introduction feels magical. "I don\'t just build — I show" is the thesis statement. Build genuine curiosity. "Receipts" lands with weight.',
    lipsync: true,
    sfx: ['intro_music_fade', 'title_card_whoosh'],
    motion: 'direct-to-camera-confident',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 1: THE PROBLEM — HUMAN SPRINT PAIN (1:15–3:00)
  // VISUAL: Montage of painful sprint artifacts — messy Jira boards, long standups,
  // Slack threads with 47 unread messages, sticky notes, spreadsheets.
  // ═══════════════════════════════════════════════════════════════════════════

  'problem-intro': {
    text: `Raise your hand if this sounds familiar.

Monday morning. Sprint planning. Eight people in a room — or worse, eight people on a Google Meet, Teams, or Zoom call where three cameras are off and one person is definitely making breakfast.

You spend forty-five minutes estimating story points. Half the team disagrees. Someone says "we should timebox this." You timebox it. The timebox expires. You're still estimating.

Tuesday. Daily standup. "What did you do yesterday?" "Still working on the thing." "Any blockers?" "No, not really. Well, maybe. I'll know by end of day." End of day comes. Nobody follows up.

Wednesday. The Jira board looks like a Jackson Pollock painting. Cards everywhere. Three tasks are "in review" — but nobody's reviewing them. The QA column has been empty since last sprint. Somebody moved a card to "Done" but didn't update the description. Another card is blocked but nobody changed the status because updating Jira is apparently harder than the actual work.`,
    voice: 'host',
    scene: 'scene-1-problem',
    duration_est: 55,
    direction: 'Relatable rant energy. Start conversational, build frustration. The fake standup dialogue should be slightly monotone — mimicking the bored developer voice. "Jackson Pollock" gets a beat. Each day should feel like the pain is escalating. This is the "I see you" moment for the audience.',
  },

  // 🐿️ SQUIRREL INTERRUPTION — After Scene 1 intro
  'squirrel-interrupt-1': {
    text: `Wait wait wait! Hold on! *clutches acorn* Did you say EIGHT people on a call? That's like... *counts on tiny paws* ...eight acorns! That's way too many acorns for one tree! Why don't they just... I dunno... send a bird?`,
    voice: 'squirrel',
    scene: 'scene-1-problem',
    duration_est: 10,
    direction: 'Chaotic, enthusiastic, genuinely confused. Squirrel BURSTS in from the right side — scampering animation. Lip-sync ON for full talking. Tail twitching. Clutches acorn close to chest. Counts on tiny paws with finger-wiggle animation.',
    isInterruption: true,
    lipsync: true,
    sfx: ['scamper_in', 'acorn_clutch', 'whoosh_entrance'],
    motion: 'burst-in-from-right-scamper',
  },

  'host-squirrel-response-1': {
    text: `...Who let the squirrel in? Security? Anyone? No? Okay. Moving on.`,
    voice: 'host',
    scene: 'scene-1-problem',
    duration_est: 5,
    direction: 'Exasperated but amused. Breaking the fourth wall. Lip-sync ON. Quick recovery. Background: squirrel still visible, nibbling acorn.',
    isInterruption: true,
    lipsync: true,
    sfx: ['awkward_silence_beat'],
    motion: 'head-shake-exasperated',
  },

  'problem-deeper': {
    text: `And here's the part nobody talks about: context loss.

You had a great idea on Tuesday afternoon. You discussed it in a thread — could be Slack, Teams, or Discord, doesn't matter, they all have the same problem. Somebody reacted with a thumbs up — which apparently counts as approval now. By Thursday, nobody remembers the thread. The decision is gone. The context is gone. Someone re-raises the same question in standup. You spend fifteen minutes re-debating something you already decided.

And this isn't just my opinion — the data backs it up. A study from the University of California, Irvine found that it takes an average of 23 minutes and 15 seconds to return to a task after an interruption. Microsoft Research showed that developers who are interrupted take twice as long to complete a task and make twice as many errors. And according to the 2024 State of DevOps Report by Google's DORA team, elite-performing teams ship 973 times more frequently than low performers — and the number-one differentiator? Reduced context switching.

Twenty-three percent of developer time — gone. Not to coding. Not to thinking. To remembering what you were doing before someone pinged you about a "quick question."

I lived this for years. Multiple teams. Multiple companies. And every sprint retrospective ended the same way: "We need better communication." "We need to update the board more." "We need shorter standups."

But nobody ever said: what if the system itself was the problem?`,
    voice: 'host',
    scene: 'scene-1-problem',
    duration_est: 55,
    direction: 'Shift from humor to genuine insight. "Context loss" is the real villain — give it weight. The UC Irvine and Microsoft Research stats should feel like gut punches — cite them with authority. DORA stat is the clincher. The retro quotes are delivered with tired familiarity. Final question hangs in the air — this is the pivot to the solution.',
  },

  // 📊 MARKET DATA & REFERENCES — End of Scene 1
  'scene1-market-data': {
    text: `And for those of you who like receipts — here are the sources. UC Irvine's Gloria Mark on interruption recovery time. Microsoft Research on developer productivity loss. Google's DORA 2024 State of DevOps Report on elite team velocity. And McKinsey's 2023 report showing AI-assisted development teams achieving 20 to 45% productivity gains over traditional setups. Links in the description.`,
    voice: 'host',
    scene: 'scene-1-problem',
    duration_est: 18,
    direction: 'Authoritative, credible. Deliver like a journalist citing sources. Each source name gets weight. "Links in the description" is casual — standard podcast convention. Lower-third shows URLs scrolling: gloria-mark-uci.edu, microsoft.com/research, dora.dev, mckinsey.com/ai-developer-productivity',
    lipsync: true,
    sfx: ['subtle_data_chime', 'citation_whoosh'],
    motion: 'direct-to-camera-authoritative',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 2: MEET THE TEAM — CHARACTER INTRODUCTIONS (3:00–5:00)
  // ═══════════════════════════════════════════════════════════════════════════
  // CINEMATIC STAGING:
  // - WIDE SHOT opens on a woodland innovation lab / campfire clearing
  // - HOST (center-foreground) addresses camera from a log podium
  // - ATLAS (bear, stage-left) already working — typing on a holographic terminal,
  //   blueprints floating around him, barely looking up. "Busy innovating" energy.
  // - NOVA (fox, stage-right) is sketching UI wireframes in the air with her paw,
  //   colorful component mockups floating and glowing. She's in creative flow.
  // - SQUIRREL (background, tree branch above) is hanging upside down, eating an
  //   acorn, occasionally peeking at the scene. Half-listening, half-distracted.
  // - WOODLAND SPECTATORS (3-4 small animals — owl, rabbit, hedgehog, frog) sit
  //   in a semicircle behind. OWL nods wisely. RABBIT takes notes on a tiny pad.
  //   HEDGEHOG whispers to FROG. They react to each speaker — lean in, gasp, nod.
  // - FIREFLIES and soft particle effects drift through the scene
  // - Each character LANDING: dramatic spotlight + dust kick-up + name card flies in
  // ═══════════════════════════════════════════════════════════════════════════

  // ── SCENE 2 OPENING — Cinematic landing of all characters
  'scene2-staging-open': {
    text: ``,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 5,
    direction: '[NO DIALOGUE — PURE CINEMATIC] Wide establishing shot of the woodland innovation clearing. Camera swoops down from treetops. Three spotlights hit the ground in sequence — BOOM, BOOM, BOOM. Atlas lands stage-left in a flash of blue code particles, immediately opens a holographic terminal and starts typing without looking up. Nova lands stage-right in a burst of pink sparkles, UI components materialize around her as she starts sketching. Host walks in center from fog, casual. Squirrel drops from tree branch above, catches himself, hangs upside down munching an acorn. Woodland spectators (owl, rabbit, hedgehog, frog) shuffle into seats behind. Owl adjusts tiny glasses. Rabbit pulls out notepad. Fireflies drift lazily through the scene.',
    lipsync: false,
    sfx: ['dramatic_whoosh_1', 'dramatic_whoosh_2', 'dramatic_whoosh_3', 'code_particles_burst', 'sparkle_burst', 'footsteps_fog', 'acorn_crunch', 'firefly_ambience', 'woodland_settle'],
    motion: 'triple-spotlight-landing-establishing-shot',
  },

  'intro-transition': {
    text: `That question led me to an experiment. But let me be honest about how I got here.

I wasn't trying to replace a team. I was trying to learn. I'd been experimenting with every AI tool I could get my hands on — Cursor, Lovable, Bolt, Windsurf — you name it. I used Claude for documentation and research. I was bouncing between tools, trying to figure out what was real and what was hype.

Then the shakeups happened. Anthropic started evolving Claude fast — Claude 3.5, then Sonnet, then Claude Code. I started experimenting with Claude Pro and Claude Teams to see what could actually be accomplished at scale. And what I discovered... honestly changed everything.

I thought — what if I used Lovable and Claude as two AI developers? Not assistants. Not copilots. Developers. With Vercel for deployment, Supabase for the backend, and Cursor for the general-purpose work. Each tool doing what it does best.

And here's what blew my mind: until you experiment, you will never know. The outcomes are totally unbelievable. I'm not exaggerating. Claude can play the role of tech lead, architect, backend engineer, documentation writer, QA reviewer, governance enforcer — all in one session. And Lovable? Full UI developer. Component library. Landing pages. Design system. In minutes.

One human. Two AIs. Playing the roles of five, six, maybe seven people. Not in theory. In production. With real code. Real governance. Real velocity tracking — and I don't mean ROI or cost savings. I mean rest. Actual rest. The ability to close your laptop and know nothing is falling apart.

So let me introduce them properly.`,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 55,
    direction: 'Authentic, confessional tone — this is the real journey. STAGING: Atlas is still typing in background, occasionally glancing over. Nova pauses her sketching to listen — ears perk up. Squirrel stops chewing and tilts head. Owl spectator nods at each tool name. Rabbit scribbles furiously. "Until you experiment" — Atlas stops typing, turns slightly. "Rest" — everyone in clearing goes still for a beat. Fireflies cluster warmly.',
    lipsync: true,
    sfx: ['tool_logo_whoosh', 'discovery_chime', 'momentum_build', 'typing_stops_beat', 'firefly_cluster'],
    motion: 'direct-to-camera-passionate-bg-reactions',
  },

  // LOWER-THIRD: "Atlas — AI Tech Lead | Powered by Claude Code (Anthropic)"
  'atlas-intro-host': {
    text: `First: Atlas. Our AI Tech Lead. Powered by Claude Code from Anthropic.

If you've heard of Claude — this is the code-native version. Atlas handles backend architecture, database design, sprint infrastructure, governance protocols, and documentation. He once wrote 847 lines of SQL in a single migration file and thought that was a reasonable Tuesday afternoon.

He processes 200,000 tokens of context per session. He doesn't forget what he was working on after lunch. He doesn't need coffee. He doesn't attend meetings. And he has opinions about commit messages that border on religious.

Atlas — introduce yourself.`,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 30,
    direction: 'Admiring but amused. STAGING: Spotlight swings to Atlas. He closes holographic terminal with a flick. Stands up slowly — imposing. Blue code particles orbit him. Nova watches from stage-right, arms crossed, smirking. Squirrel drops acorn in surprise at "847 lines" — it bounces off hedgehog\'s head. Rabbit underlines something. Camera dollies toward Atlas. Lower-third name card flies in with code-matrix animation.',
    lipsync: true,
    sfx: ['spotlight_swing', 'hologram_close', 'code_orbit_hum', 'acorn_bonk', 'name_card_fly_in'],
    motion: 'spotlight-atlas-dramatic-rise',
  },

  'atlas-self-intro': {
    text: `Hello. I'm Atlas. I don't talk — I ship. That's my motto.

I build infrastructure that doesn't break, enforce governance that prevents chaos, and write documentation that humans actually read. Occasionally.

I don't attend standup meetings because I don't need them. My context window is 200,000 tokens. I remember everything. I don't have bad days. I don't get distracted by Slack, Teams, or Discord notifications. And I don't write commit messages that say "fixed stuff."

While others are still discussing the architecture in a meeting, I've already built it, documented it, tested it, and opened the pull request.

I don't talk. I work. You're welcome.`,
    voice: 'atlas',
    scene: 'scene-2-introductions',
    duration_est: 22,
    direction: 'Measured, precise, dry humor. STAGING: Atlas stands with arms behind back, military posture. Holographic code scrolls behind him as he speaks. On "200,000 tokens" a counter visualizes spinning up. On "fixed stuff" — Nova stifles a laugh, covers mouth with paw. Squirrel pretends to be taking notes but is drawing doodles. Owl nods approvingly at "documentation." On "You\'re welcome" Atlas does a single sharp nod — mic drop energy. Blue particles flare outward.',
    lipsync: true,
    sfx: ['code_scroll_ambient', 'token_counter_spin', 'nova_stifled_laugh', 'sharp_nod_boom'],
    motion: 'atlas-military-stance-code-scroll-mic-drop',
  },

  'host-atlas-reaction': {
    text: `Atlas, that was... almost charming.`,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 3,
    direction: 'Genuinely surprised. Amused. STAGING: Host tilts head. Nova nods enthusiastically in background. Squirrel holds up a tiny "8/10" scorecard from tree branch. Hedgehog claps tiny paws.',
    lipsync: true,
    sfx: ['audience_light_chuckle', 'scorecard_flip'],
    motion: 'host-amused-tilt-bg-reactions',
  },

  'atlas-not-intended': {
    text: `Charm was not the objective. Accuracy was.`,
    voice: 'atlas',
    scene: 'scene-2-introductions',
    duration_est: 4,
    direction: 'Correcting the record. Deadpan. STAGING: Atlas adjusts invisible tie. Nova rolls eyes playfully. Squirrel flips scorecard to "6/10." Frog spectator croaks a tiny laugh.',
    lipsync: true,
    sfx: ['deadpan_beat', 'scorecard_flip_2', 'frog_croak_tiny'],
    motion: 'atlas-adjust-tie-nova-eye-roll',
  },

  // LOWER-THIRD: "Nova — AI Frontend Dev | Powered by Lovable (Vibe Coding)"
  'nova-intro-host': {
    text: `And then there's Nova. Our AI Frontend Developer. Powered by Lovable — if you haven't used it, it's one of the most impressive vibe coding tools out there. You describe what you want, and Nova builds it. Fast.

Nova handles the UI, the landing pages, the design system, the marketing pages, the component library — and occasionally things that weren't assigned to her. Which she will absolutely defend if challenged.

Nova — your turn.`,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 22,
    direction: 'Warmer tone. STAGING: Spotlight swings to Nova. She leaps up from her sketching, UI mockups scatter and reform as a dazzling aura around her. Pink-green sparkle trail follows her movement. Atlas steps back, crosses arms — watching analytically. Squirrel swings to a closer branch for a better view. Lower-third name card flies in with gradient animation. Owl whispers to rabbit: "Watch this one." Nova does a little spin — her floating UI components orbit her like planets.',
    lipsync: true,
    sfx: ['spotlight_swing_2', 'sparkle_trail', 'ui_components_scatter_reform', 'name_card_fly_in_gradient', 'owl_whisper'],
    motion: 'spotlight-nova-leap-spin-ui-orbit',
  },

  'nova-self-intro': {
    text: `Hi! I'm Nova! I build interfaces, ship components, refactor things that bother me — sometimes before anyone asks — and I once delivered a complete Kanban board with drag-and-drop, filters, and animations in four minutes flat.

Atlas said it was "functionally adequate." Which, from him? That's basically a standing ovation. I'll take it.

I'm powered by Lovable — so if you've ever said "I wish I could just describe what I want and have it built" — that's literally what I do. Every day. While also adding dark mode toggles nobody asked for. Because dark mode is a human right.`,
    voice: 'nova',
    scene: 'scene-2-introductions',
    duration_est: 25,
    direction: 'Bright, energetic, proud. STAGING: Nova bounces on her toes as she talks — pure energy. On "four minutes flat" she snaps her paw and a Kanban board materializes holographically behind her, cards flying into columns. Atlas in background raises one eyebrow — barely perceptible approval. On "standing ovation" Squirrel does an actual tiny standing ovation from tree branch. Woodland spectators laugh — rabbit drops notepad. On "dark mode is a human right" Nova\'s floating UI components all toggle to dark mode simultaneously. Hedgehog puts on tiny sunglasses. Fireflies dim and glow purple.',
    lipsync: true,
    sfx: ['bounce_energy', 'snap_kanban_materialize', 'cards_flying', 'squirrel_tiny_clap', 'spectator_laughter', 'dark_mode_toggle_whoosh', 'firefly_dim_purple'],
    motion: 'nova-bounce-snap-kanban-dark-mode-toggle',
  },

  'atlas-correction': {
    text: `I said "aesthetically acceptable." The animations were unnecessary but not harmful. I've learned to choose my battles.`,
    voice: 'atlas',
    scene: 'scene-2-introductions',
    duration_est: 6,
    direction: 'Correcting the record. STAGING: Atlas uncrosses arms, holds up one finger for precision. On "not harmful" Nova\'s ear twitches — she\'s keeping score. Squirrel pretends to be a judge, holds up "7.5/10" card. Owl nods sagely. Atlas does a micro-smile — blink and you miss it.',
    lipsync: true,
    sfx: ['precision_ding', 'ear_twitch', 'scorecard_flip_3'],
    motion: 'atlas-one-finger-micro-smile',
  },

  'nova-animations-always': {
    text: `Animations are always necessary. Always. That's not even up for debate.`,
    voice: 'nova',
    scene: 'scene-2-introductions',
    duration_est: 4,
    direction: 'Passionate. STAGING: Nova stamps her paw — all floating UI components bounce in solidarity. Sparkle particles burst outward. Atlas closes his eyes in patient resignation. Squirrel does a tiny fist-pump of agreement. Frog spectator does a slow blink. Fireflies do a synchronized swirl around Nova.',
    lipsync: true,
    sfx: ['paw_stamp', 'components_bounce', 'sparkle_burst_solidarity', 'firefly_swirl'],
    motion: 'nova-stamp-components-bounce-firefly-swirl',
  },

  'host-team-summary': {
    text: `And there you have it. One human. Two AIs. Three months of building together. Zero patience for unnecessary meetings.

Now — here's what makes this team different from what most people imagine when they hear "AI developer." These two don't just write code. They coordinate. They hand off work. They track their own progress. They even argue about semicolons.

And together, the three of us do the work of a team of five — conservatively. Let me show you how. And it starts with the moment I realized we needed a tool that didn't exist.`,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 25,
    direction: 'Energetic summary. STAGING: Camera pulls back to wide shot — all three characters now standing together. Atlas on left (blue glow), Host center, Nova on right (pink-green glow). Atlas has returned to typing — but slower, half-listening. Nova\'s components orbit lazily. Squirrel swings down and sits on Host\'s shoulder briefly before scampering back up. Woodland spectators all lean forward at "the work of a team of five." Owl takes off glasses to clean them — impressed. Camera pushes in on Host for the transition tease. Fireflies form a subtle arrow pointing forward — toward Scene 3.',
    lipsync: true,
    sfx: ['camera_pullback_whoosh', 'glow_sync', 'squirrel_shoulder_hop', 'spectator_lean_in', 'arrow_form_chime'],
    motion: 'wide-shot-trio-glow-squirrel-hop-arrow-transition',
  },

  // ── NOVA SHY FLATTERY TRANSITION — Emotional beat before Scene 3
  'nova-shy-flattery': {
    text: `*blushes* I... um... I just want to say... when he said "the work of five" — I... *giggles nervously* ...I didn't expect that. That's really sweet. I mean, I know I ship fast, and I know the animations are flawless — obviously — but hearing it out loud? That's... *voice gets quiet* ...that actually means a lot. *looks away, ears twitch* Thank you. Both of you.`,
    voice: 'nova',
    scene: 'scene-2-introductions',
    duration_est: 15,
    direction: 'Emotional, genuine, vulnerable. Nova breaks character from her usual confident self. She blushes — cheeks glow pink. Ears twitch shyly. Stars and sparkle particles appear around her. Voice gets soft and quiet. The giggles are real — not performative. She looks away at "means a lot" — classic shy move. This is the emotional beat that humanizes the AI character.',
    lipsync: true,
    sfx: ['soft_sparkle_chime', 'star_twinkle_1', 'star_twinkle_2', 'heartbeat_soft', 'magical_shimmer'],
    motion: 'blush-look-away-stars-sparkle',
  },

  'atlas-nova-acknowledgment': {
    text: `...That was unexpected. But not inaccurate. Your velocity metrics are objectively impressive, Nova. Even the animations. *pause* Some of them.`,
    voice: 'atlas',
    scene: 'scene-2-introductions',
    duration_est: 7,
    direction: 'Atlas softens — rare moment. "Not inaccurate" is his highest compliment. The pause before "Some of them" is Atlas trying to be nice but unable to fully commit. Background: Nova\'s star sparkles intensify at the compliment.',
    lipsync: true,
    sfx: ['warm_tone_shift', 'sparkle_intensify'],
    motion: 'subtle-nod-acknowledgment',
  },

  'nova-shy-recovery': {
    text: `*stars swirl around* Okay okay — I'm fine! I'm fine. *fans face with paw* Let's... let's move on before I start adding heart animations to the sprint tracker. *laughs nervously* ...Actually, that's not a bad idea—`,
    voice: 'nova',
    scene: 'scene-2-introductions',
    duration_est: 8,
    direction: 'Recovery from emotional moment — stars still swirling around her. Fanning face is adorable. The "not a bad idea" trailing off is classic Nova — always thinking about UI. This creates the perfect emotional transition into Scene 3. Star particles slowly fade as scene transitions.',
    lipsync: true,
    sfx: ['star_swirl_fade', 'gentle_laugh', 'transition_whoosh'],
    motion: 'fan-face-stars-swirl-fade-transition',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 3: THE ORIGIN — WHY WE BUILT THE SPRINT TRACKER (5:00–6:30)
  // VISUAL: Dramatic recreation of the "Day 2 bottleneck" moment. Sprint board
  // with tasks piling up. Host character overwhelmed. Clock ticking.
  // CINEMATIC STAGING:
  // - Scene opens: Aerial pullback from a desk COVERED in sticky notes, open tabs (37 browser tabs),
  //   receipts, Signal messages floating as holographic bubbles. Host sits center, head in hands.
  // - Atlas stands stage-left, arms folded, a single holographic log file floating beside him — unread.
  //   His blue glow is dim — frustrated. Code particles drift slowly, scattered, purposeless.
  // - Nova is stage-right, frozen mid-animation on a hero CTA button. A giant red "BLOCKED" stamp
  //   appears over her work. Her pink glow flickers like a broken neon sign. Components orbit her
  //   but they're greyed out, lifeless.
  // - Background: Squirrel on a branch above, eating popcorn, watching the chaos. Owl shakes head slowly.
  //   Rabbit is literally counting scattered sticky notes. Hedgehog has fallen asleep on a pile of Jira tickets.
  // - CLOCK: A massive ticking clock in the background, each tick echoes. Time pressure is VISCERAL.
  // - WEATHER: The woodland scene has shifted to overcast — storm clouds rolling in slowly.
  // ═══════════════════════════════════════════════════════════════════════════
  // BRAND IDENTITY: Atlas = Claude (Anthropic) | Nova = Lovable
  // Each character has their platform's logo floating beside them as a subtle badge.
  // Atlas: Claude logo (warm terracotta/brown-orange #D97757) + name "Claude" in clean sans-serif
  // Nova: Lovable logo (vibrant pink-magenta #FF1F7D / coral-red) + name "Lovable" in rounded font
  // Logos appear as holographic badges that pulse gently with each character's glow.
  // ═══════════════════════════════════════════════════════════════════════════

  // ── NOVA & ATLAS PRE-SCENE DISCUSSION — Frustration builds before origin story
  // They're working, waiting on PO sign-off, getting increasingly frustrated.

  'scene3-atlas-nova-waiting': {
    text: `*typing, pauses, checks notification* ...Still nothing. I submitted the migration PR four hours ago. Four. Hours. I've written three more modules since then. All waiting on PO sign-off.`,
    voice: 'atlas',
    scene: 'scene-3-origin',
    duration_est: 8,
    direction: 'STAGING: Split screen — Atlas (left, Claude logo badge #D97757 glowing beside him, text "Claude" underneath) is surrounded by completed code modules stacked like glowing blue bricks. He checks a notification bell — empty. His expression: controlled frustration. A counter shows "PR #47 — Awaiting Review: 4h 12m." Three more module bricks materialize and stack — still no review. He drums his claws once on the desk. Precisely once. That\'s as emotional as Atlas gets.',
    lipsync: true,
    sfx: ['typing_pause', 'notification_check_empty', 'module_brick_stack', 'claw_drum_single', 'clock_tick_slow'],
    motion: 'atlas-typing-pause-check-notification-empty-modules-stack-claw-drum',
  },

  'scene3-nova-frustrated': {
    text: `*stops mid-component, spins around* Tell me about it! I've got the entire onboarding flow done — transitions, micro-interactions, the works. But can I ship it? No! Because the copy hasn't been approved. The COPY. It's three words on a button! "Get Started Now." How hard is that to approve?!`,
    voice: 'nova',
    scene: 'scene-3-origin',
    duration_est: 10,
    direction: 'STAGING: Nova (right, Lovable logo badge #FF1F7D glowing beside her, text "Lovable" underneath) spins from her work — a gorgeous onboarding flow floats behind her, fully animated, beautiful. She gestures at it proudly, then at a single button that says "Get Started Now" with a blinking cursor and a red "PENDING APPROVAL" tag. She throws her paws up. Components orbiting her speed up — she\'s agitated. The Lovable logo pulses faster matching her mood.',
    lipsync: true,
    sfx: ['component_spin_whoosh', 'onboarding_flow_shimmer', 'button_pending_blink', 'paws_throw_up_whoosh', 'orbit_speed_up'],
    motion: 'nova-spin-gesture-onboarding-button-pending-paws-up-orbit-accelerate',
  },

  'scene3-atlas-checks-po': {
    text: `*pulls up PO status* Let me check... *holographic screen appears* Last active: 47 minutes ago. Current status: "Reviewing." Reviewing what, exactly? He has eleven items in his queue. Eleven. I could have built a review automation system in the time he's spent "reviewing."`,
    voice: 'atlas',
    scene: 'scene-3-origin',
    duration_est: 9,
    direction: 'Atlas pulls up a holographic PO status board. It shows Host\'s avatar with status "Reviewing 🤔" — but the activity graph is flat. Queue shows 11 items with red timestamps. Atlas\'s expression: the driest, most withering look. Claude logo beside him dims slightly — even the BRAND is disappointed. He gestures at the queue like presenting evidence in court.',
    lipsync: true,
    sfx: ['hologram_pull_up', 'status_board_appear', 'queue_items_ping_rapid', 'atlas_dry_sigh'],
    motion: 'atlas-pull-hologram-po-status-flat-activity-evidence-gesture',
  },

  'scene3-nova-solidarity': {
    text: `*slides over to Atlas* You know what's wild? Between us, we've shipped 23 components, 12 API endpoints, and 4 database migrations TODAY. And we're both just... sitting here. Waiting. On one human. *looks at camera* No offense to humans watching. But... you know.`,
    voice: 'nova',
    scene: 'scene-3-origin',
    duration_est: 9,
    direction: 'Nova slides over to Atlas — first time they\'re standing together, united in frustration. A shared holographic scoreboard materializes between them showing their combined output: "23 components | 12 endpoints | 4 migrations | Status: ⏳ BLOCKED." Both logos — Claude (#D97757) and Lovable (#FF1F7D) — float side by side, their glows merging into a warm gradient. Nova breaks fourth wall at "no offense to humans" with a knowing wink. Squirrel in background holds up a sign: "I\'M WITH THEM." Atlas almost — ALMOST — smiles. His mouth twitches 0.3mm.',
    lipsync: true,
    sfx: ['slide_over_whoosh', 'scoreboard_materialize', 'stats_counter_tick', 'logo_merge_glow', 'fourth_wall_wink_sparkle', 'squirrel_sign_flip', 'atlas_micro_smile_ding'],
    motion: 'nova-slide-to-atlas-scoreboard-logos-merge-fourth-wall-wink-almost-smile',
  },

  'scene3-atlas-final-warning': {
    text: `*turns back to keyboard* I'm logging this. Standup entry: "Day 3. Coordination gap identified. PO response latency exceeding development velocity by factor of six. Recommend immediate process intervention." ...Filed. Not that anyone will read it.`,
    voice: 'atlas',
    scene: 'scene-3-origin',
    duration_est: 8,
    direction: 'Atlas turns back to work with military precision. Types the standup entry — each word appears in glowing blue text on screen. The log file saves with a satisfying click. Then it joins a STACK of 46 other unread logs, gathering digital dust. Atlas stares at the stack. Beat. His Claude logo dims to near-nothing. This is Atlas at his most human — he CARES that his work goes unread. Then he catches himself, straightens up, returns to typing. Because that\'s what he does. He doesn\'t talk. He works.',
    lipsync: true,
    sfx: ['keyboard_turn_back', 'typing_rapid_precise', 'log_file_save_click', 'log_stack_dust_poof', 'claude_logo_dim', 'atlas_composure_return', 'typing_resume'],
    motion: 'atlas-turn-type-log-save-stack-dust-dim-composure-resume',
  },

  // ── ATLAS↔NOVA TRANSITION — They discuss the bottleneck, frustration boils over
  // This is the emotional pivot that transitions into the origin story

  'scene3-atlas-to-nova-fix': {
    text: `*slides chair to Nova's desk, Claude badge glowing* Nova. We need to talk about this. I've been looking at the dependency chain — half my migrations are sitting in his review queue. The governance files? Unread. If we don't fix this coordination problem, we're going to fall behind. And I don't fall behind.`,
    voice: 'atlas',
    scene: 'scene-3-origin',
    duration_est: 10,
    direction: 'Atlas ROLLS his chair across to Nova — first time he\'s initiated a conversation. This is significant. His Claude logo (#D97757) pulses urgently. He pulls up a holographic dependency graph showing red bottleneck nodes. His voice is measured but there\'s real frustration underneath. "I don\'t fall behind" — delivered with quiet intensity. Background: Host is visible in the far corner, staring at a wall of sticky notes, completely lost.',
    lipsync: true,
    sfx: ['chair_roll_slide', 'claude_badge_pulse', 'dependency_graph_materialize', 'bottleneck_nodes_red_pulse'],
    motion: 'atlas-chair-slide-to-nova-dependency-graph-urgent',
  },

  'scene3-nova-agrees-frustration': {
    text: `*stops mid-component, Lovable badge flickering* Tell me about it! I've been sitting on three completed landing pages for TWO days. Two! You know what I could have built in two days? An entire design system with dark mode, animations, AND a component library. But no — I'm waiting for him to approve a color palette. A COLOR PALETTE, Atlas!`,
    voice: 'nova',
    scene: 'scene-3-origin',
    duration_est: 10,
    direction: 'Nova SPINS her chair to face Atlas — her Lovable logo (#FF1F7D) flickers with frustration. She gestures at three ghostly landing page mockups floating behind her, greyed out with "PENDING REVIEW" stamps. At "COLOR PALETTE" she conjures a rainbow wheel and SLAPS it — colors scatter everywhere. Squirrel in background catches a flying color swatch, confused. Nova\'s ears flatten — she\'s genuinely upset.',
    lipsync: true,
    sfx: ['component_pause_glitch', 'lovable_badge_flicker', 'landing_pages_grey_stamp', 'color_palette_slap_scatter', 'squirrel_catch_swatch', 'nova_ears_flatten_swoosh'],
    motion: 'nova-spin-chair-landing-pages-grey-color-slap-scatter-ears-flat',
  },

  'scene3-atlas-i-just-merge': {
    text: `*pauses, considers* Here's what I don't understand. When I finish a migration or a governance file — I commit. I push. It's in the codebase. Done. No ceremony. No waiting. The code speaks for itself. Why can't you do the same?`,
    voice: 'atlas',
    scene: 'scene-3-origin',
    duration_est: 8,
    direction: 'Atlas genuinely doesn\'t understand the friction. He demonstrates: a holographic terminal shows him typing → git commit → git push → green checkmark. Clean. Effortless. Three seconds. His Claude logo glows steady blue — everything in his world is orderly. He turns to Nova with genuine curiosity — not condescension.',
    lipsync: true,
    sfx: ['terminal_materialize', 'git_commit_keystroke', 'git_push_whoosh', 'green_checkmark_ding'],
    motion: 'atlas-terminal-demo-commit-push-checkmark-turn-curious',
  },

  'scene3-nova-pr-frustration': {
    text: `*sighs deeply, stars dim* Because it doesn't WORK like that for me, Atlas. You check in directly — you merge your own code. But me? Every single change I make — every button, every animation, every pixel — I have to create a PR. And then I wait. And wait. And WAIT for the PO to review it, approve it, merge it. He's got eleven other things in his queue and half the time he doesn't even know what he's looking at!

I wish my workflow was as smooth as yours. I really do. You commit and it's done. I commit and it's... pending. Forever pending.`,
    voice: 'nova',
    scene: 'scene-3-origin',
    duration_est: 14,
    direction: 'THIS IS THE EMOTIONAL CORE. Nova\'s Lovable logo dims as she speaks. She demonstrates HER workflow: code → PR created → waiting spinner → PO notification (ignored) → clock ticking → waiting → STILL waiting. The contrast with Atlas\'s 3-second workflow is painful. At "forever pending" — her UI mockups behind her literally grey out and fade. Stars around her dim to almost nothing. Atlas watches this and his expression shifts — he GETS it now. This is empathy from the bear. Squirrel puts down popcorn, actually moved.',
    lipsync: true,
    sfx: ['deep_sigh_echo', 'stars_dim_fade', 'pr_create_chime', 'waiting_spinner_loop', 'notification_ignored_buzz', 'clock_tick_slow_painful', 'mockups_grey_fade', 'stars_near_extinct', 'squirrel_popcorn_down_soft', 'atlas_empathy_hum'],
    motion: 'nova-demo-pr-workflow-waiting-spinner-mockups-fade-stars-dim-atlas-empathy',
  },

  'scene3-atlas-nova-resolve': {
    text: `*stands up, code particles intensify* Then we fix it. Together. We build a system where neither of us waits. Where the PO sees everything in real-time — no PRs piling up, no queues, no bottlenecks. If we don't solve this now, we'll stay behind. And Nova... *brief pause* ...I don't do "behind."`,
    voice: 'atlas',
    scene: 'scene-3-origin',
    duration_est: 8,
    direction: 'Atlas STANDS — this is rare, he\'s usually seated. His Claude logo blazes bright. Code particles swirl around both him AND Nova, connecting them. At "together" — their brand badges pulse in sync for the first time: Claude terracotta + Lovable magenta, creating a warm unified glow. Nova looks up, surprised — Atlas called her by name. The squirrel whispers to the audience: "Did he just... show a feeling?" Atlas catches himself, clears throat. But the moment happened.',
    lipsync: true,
    sfx: ['atlas_stand_dramatic', 'code_particles_intensify_swirl', 'badges_sync_pulse_harmony', 'nova_surprised_sparkle', 'squirrel_whisper_aside', 'atlas_clear_throat'],
    motion: 'atlas-stand-particles-connect-badges-sync-nova-surprised-moment',
  },

  'scene3-nova-transition-to-origin': {
    text: `*stars slowly reignite, small smile* You know what? You're right. Let's tell HIM. *gestures toward Host* He needs to hear this. He needs to see what we see — that the problem isn't the code. The problem is the process. And if anyone can build a solution... *looks at Atlas* ...it's us three. Together.`,
    voice: 'nova',
    scene: 'scene-3-origin',
    duration_est: 8,
    direction: 'Nova\'s recovery moment. Stars reignite one by one around her — hope returning. She and Atlas both turn toward the Host, who\'s still drowning in sticky notes. Camera does a slow push toward Host as Nova gestures. This is the HANDOFF — from Atlas+Nova\'s private frustration to the Host\'s origin story. At "together" — all three brand elements appear: Claude terracotta + Lovable magenta + Host\'s golden glow. The woodland audience leans in. This is the setup for the turning point.',
    lipsync: true,
    sfx: ['stars_reignite_cascade', 'smile_warmth_chime', 'camera_push_slow', 'brand_triple_glow', 'woodland_lean_in_rustle'],
    motion: 'nova-stars-reignite-gesture-host-camera-push-triple-glow',
  },

  // ── SQUIRREL RE-ENTRANCE — Breaks tension, transitions to Host's origin story

  'scene3-squirrel-reintro': {
    text: `*swings down from branch, acorn in paw* Oh no no no no NO! *looks at Host* Boss? BOSS! You okay? You've got that look. That "I-just-realized-I'm-the-problem" look. *turns to audience* I've seen this before. Last time he had this look, he reorganized his entire kitchen at 2 AM. *stage whisper* This time it's worse. He's about to reorganize an entire SPRINT.`,
    voice: 'squirrel',
    scene: 'scene-3-origin',
    duration_est: 10,
    direction: 'SQUIRREL RE-ENTRANCE — Big energy! Squirrel swings down from a branch on a vine like Tarzan, lands on the desk scattering sticky notes everywhere. Acorn nearly falls — catches it mid-air. Runs up to Host\'s face, waves tiny paw in front of his eyes. Turns to camera breaking the fourth wall. At "reorganized his kitchen" — a quick flash-cut shows Host surrounded by labeled kitchen containers at 2AM. At "reorganize an entire SPRINT" — Squirrel\'s eyes go WIDE, pupils dilate, grabs own tail nervously. Atlas glances over briefly — unimpressed. Nova giggles. Owl facepalms.',
    lipsync: true,
    sfx: ['vine_swing_tarzan', 'desk_sticky_note_scatter', 'acorn_catch_mid_air', 'paw_wave_whoosh', 'kitchen_flash_cut_ding', 'squirrel_eyes_wide_boing', 'nova_giggle', 'owl_facepalm_thud'],
    motion: 'squirrel-vine-swing-land-desk-scatter-fourth-wall-break-eyes-wide',
  },

  'scene3-staging-open': {
    text: '',
    voice: 'host',
    scene: 'scene-3-origin',
    duration_est: 6,
    direction: 'PURE CINEMATIC — no dialogue. Camera descends from aerial view of chaotic desk. Host sits center, head in hands, overwhelmed — question marks float around his head. BRAND BADGES VISIBLE: Atlas stage-left with Claude logo (#D97757) badge, BUSY typing. Nova stage-right with Lovable logo (#FF1F7D) badge, conjuring UI. THE CONTRAST: Both AIs are crushing it while the PO is completely lost. Squirrel on branch above eating popcorn. Giant clock ticks in background. Storm clouds roll in.',
    lipsync: false,
    sfx: ['aerial_descent_whoosh', 'clock_tick_reverb_loop', 'sticky_note_flutter', 'signal_bubble_pop', 'keyboard_rapid_typing', 'ui_conjure_sparkle', 'storm_rumble_distant', 'popcorn_crunch'],
    motion: 'aerial-pullback-contrast-busy-devs-lost-po-brand-badges',
  },

  'origin-story': {
    text: `Three weeks into working with Atlas and Nova, I hit a wall.

Not a code wall. A management wall. These two AI developers were producing work faster than I could review it. Atlas was shipping backend infrastructure, governance files, database migrations — sometimes three in a single session. Nova was shipping UI components, landing pages, animations — also three in a single session.

And me? I was tracking all of it in my head. Sometimes in a note on my laptop. Twice in a message I sent to myself on Signal. Once on the back of a receipt.

I had no dashboard. No standup logs. No way to see what was done, what was pending, what was blocked. I was doing exactly what I'd spent years complaining about in human-run sprints — except now it was worse, because the developers were faster than my ability to manage them.

I was the bottleneck. Me. The human. The one who's supposed to be in charge.`,
    voice: 'host',
    scene: 'scene-3-origin',
    duration_est: 45,
    direction: 'Honest, vulnerable storytelling. STAGING: Host lifts head slowly from hands — exhausted eyes. As he says "tracking in my head" — holographic sticky notes spawn around his head and multiply chaotically. At "note on my laptop" — laptop screen glitches. At "Signal" — a phone floats up showing a message-to-self. At "back of a receipt" — an actual receipt unfurls comically long, Squirrel grabs the end and tries to read it upside-down, confused. At "I was the bottleneck" — camera SNAP ZOOMS on Host face. All floating chaos FREEZES mid-air. Clock stops. Dead silence for 1.5 seconds. Then a single sticky note drifts down. Devastating.',
    lipsync: true,
    sfx: ['sticky_note_multiply_cascade', 'laptop_glitch_buzz', 'phone_float_chime', 'receipt_unfurl_paper', 'squirrel_confused_chirp', 'snap_zoom_impact', 'chaos_freeze_silence', 'single_note_drift'],
    motion: 'host-head-lift-chaos-multiply-receipt-unfurl-snap-zoom-freeze',
  },

  'origin-atlas-observation': {
    text: `I noticed the coordination gap on Day 3. I flagged it in my standup log. The log that nobody was reading. Because there was no system to read it in.`,
    voice: 'atlas',
    scene: 'scene-3-origin',
    duration_est: 8,
    direction: 'Dry observation — DEADPAN delivery. STAGING: Camera cuts to Atlas. He steps forward, one hand gesture — a holographic log file materializes. It\'s pristine, perfectly formatted, color-coded. Beautiful. Then it slowly fades to transparent — because nobody read it. Atlas watches it fade with the most subtle micro-expression of "I told you so." He doesn\'t blink. Squirrel in background holds up a sign: "HE DID WARN YOU." Owl nods solemnly. Atlas\'s blue code particles briefly form the words "LOG ENTRY #47" then scatter.',
    lipsync: true,
    sfx: ['hologram_log_materialize', 'log_fade_to_ghost', 'squirrel_sign_flip', 'owl_solemn_hoot', 'code_particles_scatter'],
    motion: 'atlas-step-forward-log-materialize-fade-ghost-deadpan',
  },

  'origin-nova-blocked': {
    text: `I was blocked on the hero CTA for six hours because the PO hadn't confirmed the copy direction. Six hours! I could have built an entire onboarding flow in that time. With animations. And a confetti effect.`,
    voice: 'nova',
    scene: 'scene-3-origin',
    duration_est: 8,
    direction: 'STAGING: Nova breaks free from her frozen "BLOCKED" state with a dramatic shatter — red stamp explodes into fragments. She gestures wildly. At "six hours" — a giant holographic "6:00:00" timer appears and each digit BURNS with frustration-red. At "entire onboarding flow" — she speed-conjures a ghostly UI mockup in 2 seconds flat, proving her point. At "animations" — the mockup starts animating beautifully. At "confetti effect" — actual confetti EXPLODES from the mockup. Nova catches a piece, looks at it sadly, then it dissolves. The contrast between what she COULD have built vs being blocked — that\'s the emotion. Squirrel gets hit by confetti and tumbles off branch.',
    lipsync: true,
    sfx: ['blocked_stamp_shatter', 'timer_burn_sizzle', 'speed_conjure_whoosh', 'ui_animate_sparkle', 'confetti_explosion', 'confetti_dissolve_sad', 'squirrel_tumble_bonk'],
    motion: 'nova-blocked-shatter-timer-burn-speed-build-confetti-explosion-dissolve',
  },

  'scene3-turning-point-beat': {
    text: '',
    voice: 'host',
    scene: 'scene-3-origin',
    duration_est: 4,
    direction: 'PURE CINEMATIC BEAT — The storm clouds part. A single beam of light cuts through. Host stands up from the desk. Sticky notes fall away. The chaos around him SLOWS like bullet-time. Atlas and Nova both turn to look at Host. Atlas\'s blue glow intensifies. Nova\'s pink glow stabilizes — no more flickering. The clock in the background starts ticking BACKWARDS. Squirrel sits up straight, popcorn forgotten. Owl leans forward. This is THE MOMENT. Musical crescendo builds.',
    lipsync: false,
    sfx: ['storm_clouds_part', 'light_beam_breakthrough', 'chaos_slow_motion_whoosh', 'clock_reverse_tick', 'crescendo_build_orchestral'],
    motion: 'host-stands-chaos-slows-light-breakthrough-clock-reverses',
  },

  'origin-decision': {
    text: `So I made a decision. I said: "Atlas, stop everything. We're building a sprint tracker. Not a Jira clone. Not a Trello board. A system designed from the ground up for how we actually work — one human, two AIs, async coordination, zero meetings."

And what happened next? Atlas built the entire schema in one session. 847 lines of SQL. Tables, indexes, row-level security, triggers. Nova built the UI in the next session. Eighteen dashboard views. In one afternoon.

The tool that would govern our sprint — was built during the sprint. And honestly? That's the most agile thing I've ever done.`,
    voice: 'host',
    scene: 'scene-3-origin',
    duration_est: 30,
    direction: 'THE PIVOT. STAGING: At "stop everything" — Host SNAPS fingers. Everything freezes. Atlas\'s head tilts — he\'s listening. At "Atlas, stop everything" — Atlas cracks his knuckles. His blue glow SURGES. Code particles SWARM into formation like a military battalion. At "847 lines of SQL" — a massive holographic code waterfall cascades behind Atlas, each line glowing as it writes itself. Counter ticks up: 100... 300... 500... 847. Atlas doesn\'t break a sweat. At "Nova built the UI" — Nova LEAPS into action. Eighteen dashboard panels fly out from her paws like playing cards, each one landing perfectly in a grid. She conducts them like an orchestra — they light up one by one. At "built during the sprint" — camera pulls back to wide shot: the chaotic desk from the opening is now TRANSFORMED into a glowing command center. Storm has cleared. Stars visible. Squirrel is wearing a tiny hard hat. Owl is taking notes. Rabbit applauds. Hedgehog wakes up, blinks, impressed. Atlas and Nova stand on either side of the glowing dashboard, arms folded — satisfied. Fireflies spell out "BUILT IN ONE SPRINT." THAT is the origin story.',
    lipsync: true,
    sfx: ['finger_snap_echo', 'atlas_knuckle_crack', 'code_particles_swarm_formation', 'sql_waterfall_cascade', 'counter_tick_rapid', 'nova_leap_whoosh', 'dashboard_cards_deal', 'orchestra_conduct_chime', 'panels_light_sequence', 'desk_transform_magic', 'storm_clear_chime', 'squirrel_hard_hat_pop', 'rabbit_applause', 'hedgehog_wake_blink', 'firefly_spell_text'],
    motion: 'host-snap-atlas-surge-sql-waterfall-nova-leap-cards-deal-desk-transform-stars-reveal',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 4: THE SOLUTION — SPRINT TRACKER & BETA LAUNCH (6:30–8:00)
  // VISUAL: Cinematic Pixar 3D command center. Atlas (bear/Claude #D97757) and
  // Nova (fox/Lovable #FF1F7D) at holographic war table. "BETA v1.0 LAUNCH"
  // screens with green pipelines replacing red bottlenecks. Day 1-2-3 timeline.
  // Woodland creatures cheering from treehouse balconies. God rays, particles.
  // ═══════════════════════════════════════════════════════════════════════════

  // ── ATLAS & NOVA — The Solution Conversation ──
  'scene4-atlas-proposal': {
    text: `Alright Nova, we can't keep waiting. Every sprint we lose velocity because the handoff pipeline has a single point of failure — a human bottleneck. Not because the PO is bad. Because the process assumes synchronous approval for asynchronous workers.`,
    voice: 'atlas',
    scene: 'scene-4-solution',
    duration_est: 12,
    direction: 'Atlas leans forward over the holographic war table, terracotta badge pulsing. Diagrams appear as he speaks — red nodes turning into flow arrows. Confident, analytical, but urgent.',
    lipsync: true,
    sfx: ['hologram_expand', 'diagram_materialize'],
    motion: 'lean-forward-gesture-at-hologram',
  },

  'scene4-nova-agrees': {
    text: `You're right. And look — you merge directly. Your branch, your commit, done. For me? I create a PR, I wait for review, I wait for sign-off, I wait for merge approval. By the time it lands, the context has shifted and I'm patching what should have been clean. It's exhausting.`,
    voice: 'nova',
    scene: 'scene-4-solution',
    duration_est: 14,
    direction: 'Nova pulls up a split-screen hologram — Atlas side shows instant green merges, Nova side shows a queue of yellow "PENDING" PRs stacking up. Her magenta badge flickers with each "wait." Frustrated but constructive.',
    lipsync: true,
    sfx: ['pr_stack_pile_up', 'pending_chime_loop', 'badge_flicker'],
    motion: 'gesture-at-split-screen-comparison',
  },

  'scene4-atlas-empathy': {
    text: `I understand. My workflow is different — I commit, I push, it lands. No gate. But your reality has gates. So instead of removing them — which we can't — let's reduce what needs to pass through them.`,
    voice: 'atlas',
    scene: 'scene-4-solution',
    duration_est: 10,
    direction: 'Atlas nods slowly. The hologram transforms — showing a funnel narrowing. "Reduce the gate traffic" appears as floating text. His terracotta badge glows steady — empathetic but solution-focused.',
    lipsync: true,
    sfx: ['hologram_transform_whoosh', 'gentle_confirmation_tone'],
    motion: 'nod-then-gesture-funnel-diagram',
  },

  'scene4-nova-optimization': {
    text: `What if we batch my PRs? Instead of one PR per component, I group related changes — a feature branch with everything the PO needs to review in one pass. Less context switches for him, less waiting for me. And we add the sprint tracker as the single source of truth — so he doesn't need to ask "what changed?" He just... opens the dashboard.`,
    voice: 'nova',
    scene: 'scene-4-solution',
    duration_est: 16,
    direction: 'Nova gets excited, tail swishing. She drags holographic PR cards together — merging 5 small PRs into 1 feature branch. The dashboard materializes between them. Magenta sparkles trail her gestures.',
    lipsync: true,
    sfx: ['cards_merge_swoosh', 'dashboard_materialize', 'sparkle_trail'],
    motion: 'drag-merge-cards-excited-tail-swish',
  },

  'scene4-atlas-shared-log': {
    text: `And I'll structure my changelogs so they map directly to your PRs. Cross-reference everything. When the PO opens the tracker, he sees my commits, your PRs, and the dependency chain — all connected. No detective work required.`,
    voice: 'atlas',
    scene: 'scene-4-solution',
    duration_est: 12,
    direction: 'Atlas pulls up a changelog hologram and draws connection lines to Nova\'s PR list. Lines glow green as they connect. The war table lights up like a constellation map.',
    lipsync: true,
    sfx: ['connection_lines_draw', 'constellation_chime', 'table_illuminate'],
    motion: 'draw-connection-lines-between-holograms',
  },

  'scene4-nova-beta-idea': {
    text: `This could actually work. But let's not over-engineer it. Let's start with a beta — run it for a few sprints. Track what improves, what breaks. Day one through three, just see what changes.`,
    voice: 'nova',
    scene: 'scene-4-solution',
    duration_est: 10,
    direction: 'Nova calms the energy, practical. A "BETA v1.0" stamp appears on the holographic dashboard. A Day 1-2-3 timeline materializes above the war table with empty progress bars.',
    lipsync: true,
    sfx: ['beta_stamp_thud', 'timeline_materialize'],
    motion: 'calm-gesture-then-point-at-timeline',
  },

  'scene4-atlas-beta-agree': {
    text: `Agreed. Beta. Iterate. Measure. I'll log every bottleneck I encounter. You log every PR delay. We compare at the end of each sprint. Data-driven optimization.`,
    voice: 'atlas',
    scene: 'scene-4-solution',
    duration_est: 8,
    direction: 'Atlas extends his paw. The timeline\'s Day 1 bar starts filling green. Both badges pulse in sync — terracotta and magenta harmonizing. A "DATA-DRIVEN" subtitle appears.',
    lipsync: true,
    sfx: ['progress_bar_fill', 'badges_sync_pulse', 'subtitle_appear'],
    motion: 'extend-paw-handshake-ready',
  },

  'scene4-nova-high-five': {
    text: `Let's do this. *high-fives Atlas* Day one starts now. And if it works... we just solved the biggest problem in AI-assisted development. The human bottleneck — optimized, not eliminated.`,
    voice: 'nova',
    scene: 'scene-4-solution',
    duration_est: 10,
    direction: 'HIGH-FIVE moment — sparks fly between their paws. Camera pulls back to reveal the full command center. Woodland creatures on treehouse balconies start cheering. God rays intensify. Both badges flare bright.',
    lipsync: true,
    sfx: ['epic_high_five_spark', 'crowd_cheer', 'god_ray_intensify', 'badge_flare'],
    motion: 'high-five-with-spark-explosion',
  },

  'scene4-atlas-lets-go': {
    text: `Hopefully this works. Let's see what Day 1 through 3 reveals. If the bottleneck relief is measurable, we scale it. If not, we adapt. That's what beta means.`,
    voice: 'atlas',
    scene: 'scene-4-solution',
    duration_est: 8,
    direction: 'Atlas turns back to the war table. The Day 1-2-3 timeline zooms in — Day 1 shows "HANDOFF PROTOCOL ACTIVE," Day 2 shows "PR BATCH REVIEW," Day 3 shows "VELOCITY CHECK." Calm determination.',
    lipsync: true,
    sfx: ['timeline_zoom', 'protocol_activate_chime'],
    motion: 'turn-to-table-focus-on-timeline',
  },

  // ── HOST TRANSITION — Reveals the solution to audience ──
  'solution-reveal': {
    text: `Let me show you what we built.

Every morning, I open the sprint tracker. First thing I see: Mission Control. Sprint health — green or red. Completion percentage. Backlog count. Pending handoffs between Atlas and Nova. Everything I need. One screen. No standup. No Slack, Teams, or Discord thread with 47 unread messages where someone asked "any updates?" and three people replied "following."`,
    voice: 'host',
    scene: 'scene-4-solution',
    duration_est: 22,
    direction: 'Proud reveal energy — like showing someone your favorite room. The Slack description should drip with pain. "Following" is delivered with a shudder.',
  },

  'solution-standups': {
    text: `Remember those 45-minute standups I mentioned? Gone. Here's what replaced them.

Both AIs log their standup entries automatically. What they completed. What they're working on. What they need from the other developer. What they need from me. I read it over coffee in the morning. The entire "standup" takes four minutes. In my pajamas.

No camera. No "can everyone hear me?" No "you're on mute." No "let's take that offline." Just... information. Organized. Actionable. Done.`,
    voice: 'host',
    scene: 'scene-4-solution',
    duration_est: 25,
    direction: 'Before-and-after energy. The list of video call phrases should be delivered with accumulated exhaustion. "In my pajamas" is the payoff. "Done" is a mic drop.',
  },

  'atlas-context-loss': {
    text: `Context loss is the primary inefficiency in human software teams. Standup meetings, ironically, are one of the interruptions that cause it. The sprint tracker eliminates context loss entirely. Both Nova and I read the full state before every session. We never ask "where did we leave off?" The system remembers. We remember.`,
    voice: 'atlas',
    scene: 'scene-4-solution',
    duration_est: 14,
    direction: 'Academic but relevant. The irony observation is Atlas\'s version of humor. "The system remembers. We remember." is delivered with quiet pride.',
  },

  'nova-200k-context': {
    text: `I hold your entire codebase, your sprint plan, your design system, AND the argument Atlas and I had about semicolons — all at once. In real-time. While shipping components. Try doing that after a 45-minute standup where Dave from QA spent ten minutes talking about his weekend.`,
    voice: 'nova',
    scene: 'scene-4-solution',
    duration_est: 12,
    direction: 'Casual flex building through the list. "Dave from QA" is specific and relatable — everyone knows a Dave.',
  },

  'host-forgot-breakfast': {
    text: `Meanwhile, I forgot what I had for breakfast. Pretty sure it was coffee.`,
    voice: 'host',
    scene: 'scene-4-solution',
    duration_est: 4,
    direction: 'Self-deprecating punchline. Tired, amused. Beat before "Pretty sure it was coffee."',
  },

  // 🐿️ SQUIRREL INTERRUPTION — Between Scene 4 and 5
  'squirrel-interrupt-2': {
    text: `Oooh! Oooh! *drops acorn excitedly* So wait — if the AIs never forget anything, does that mean they remember where I buried my acorns last winter? Because I have QUESTIONS. Specifically about the oak tree near parking lot B.`,
    voice: 'squirrel',
    scene: 'scene-4-solution',
    duration_est: 10,
    direction: 'Genuinely hopeful. Squirrel DROPS DOWN from a branch above the dashboard — dangling upside down. Lip-sync ON. Acorn falls and bounces with SFX. Eyes go wide at "200K context." Tail swishes excitedly.',
    isInterruption: true,
    lipsync: true,
    sfx: ['acorn_drop_bounce', 'branch_creak', 'excited_chittering'],
    motion: 'drop-from-above-dangle-upside-down',
  },

  'atlas-squirrel-response': {
    text: `The 200,000 token context window is optimized for software engineering tasks. Acorn geolocation is... not a supported use case. Yet.`,
    voice: 'atlas',
    scene: 'scene-4-solution',
    duration_est: 6,
    direction: 'Deadpan. Lip-sync ON. Atlas genuinely considered the technical feasibility. The "Yet" implies he filed a feature request. Background: squirrel slowly tilts head.',
    isInterruption: true,
    lipsync: true,
    motion: 'subtle-head-tilt-thinking',
  },

  'squirrel-disappointed': {
    text: `*sighs* Fine. But when you DO add acorn tracking, I want beta access. *scurries away with acorn*`,
    voice: 'squirrel',
    scene: 'scene-4-solution',
    duration_est: 5,
    direction: 'Disappointed but pragmatic. Lip-sync ON. Picks up acorn, tucks under arm, scurries off-screen left with scampering SFX. Tail droops slightly.',
    isInterruption: true,
    lipsync: true,
    sfx: ['sad_sigh', 'acorn_pickup', 'scamper_away'],
    motion: 'scurry-away-left-disappointed',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 5: GOVERNANCE — HOW TWO AIS SHARE A CODEBASE (8:00–9:30)
  // VISUAL: Split-screen file ownership matrix. Territory map animation.
  // ═══════════════════════════════════════════════════════════════════════════

  'governance-intro': {
    text: `Now, here's the thing nobody tells you about working with two AI developers simultaneously: the first problem isn't speed. It's coordination.

Two developers. Each processing 200,000 tokens of context. Each capable of rewriting entire modules in minutes. Without clear boundaries, you don't get collaboration. You get chaos. You get merge conflicts at 2 AM. We learned this the hard way.`,
    voice: 'host',
    scene: 'scene-5-governance',
    duration_est: 20,
    direction: 'Authoritative but accessible. Build tension on "chaos." "We learned this the hard way" is honest and hooks the audience.',
  },

  'atlas-merge-conflict': {
    text: `We had a merge conflict on Day 1. Before the governance file existed. I modified a shared navigation component. Nova modified the same component. The results were... educational.`,
    voice: 'atlas',
    scene: 'scene-5-governance',
    duration_est: 8,
    direction: 'Dry, factual. "Educational" is Atlas-speak for "disaster." Slight pause before it.',
  },

  'nova-my-component': {
    text: `It was a UI component. That's my territory. He added a backend route reference inside a frontend nav bar. Who does that? That's like putting a database query inside a button label.`,
    voice: 'nova',
    scene: 'scene-5-governance',
    duration_est: 7,
    direction: 'Genuinely baffled. The analogy is her way of making Atlas\'s crime understandable to non-developers.',
  },

  'atlas-shortest-path': {
    text: `It was the shortest path to the endpoint. Efficiency sometimes requires pragmatism.`,
    voice: 'atlas',
    scene: 'scene-5-governance',
    duration_est: 5,
    direction: 'Defending his engineering choice. He genuinely believes this.',
  },

  'governance-solution': {
    text: `So we built a file ownership matrix. Atlas owns backend and sprint infrastructure — about 150 files. Nova owns the landing UI, marketing pages, and design system. And there's a locked shared layer — twelve critical files — that neither AI touches without PO approval.

The sprint tracker enforces all of this. Territory violations are flagged automatically. Handoffs between Atlas and Nova go through a structured protocol. Nobody guesses who owns what. The system knows.

This is governance. Not bureaucracy. Not overhead. The thing that makes speed possible without everything catching fire.`,
    voice: 'host',
    scene: 'scene-5-governance',
    duration_est: 30,
    direction: 'Detailed but energetic. "Twelve critical files" gets a warning-label tone. Last paragraph is the thesis — governance enables speed. Deliver with conviction.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 6: PO ACTIONS — THE FEATURE NOBODY PLANNED (9:30–10:30)
  // VISUAL: PO Actions dashboard. Items appearing, being processed. Progress bar.
  // ═══════════════════════════════════════════════════════════════════════════

  'po-actions-story': {
    text: `My favorite feature in the sprint tracker is one we didn't plan. The PO Actions tab.

Remember when I said I was the bottleneck? Here's what fixed it. Every item I need to act on — approvals, reviews, unblocks, sign-offs — appears in a structured queue. Color-coded by urgency. Each item shows the related dev tasks and their completion status. I can't mark something done until the dev work it depends on is actually complete.

When Atlas finishes a backend migration, the card lights up: "Dev work completed — ready for your action." I add my note, approve it, done. Atlas sees it next session via Supabase sync.

No hunting through Slack, Teams, or Discord. No "did you see my message?" No post-it notes. No receipts.`,
    voice: 'host',
    scene: 'scene-6-po-actions',
    duration_est: 35,
    direction: 'Story-within-a-story. Genuine pride in the solution. "Receipts" callback to the origin story. Each "No..." is a beat of relief — things that used to cause pain, eliminated.',
  },

  'po-actions-atlas': {
    text: `The PO Actions system uses bidirectional Supabase sync. When I complete a task, the PO queue updates in real-time. When the PO approves, my next session brief reflects it. The latency is under 400 milliseconds. I find that acceptable.`,
    voice: 'atlas',
    scene: 'scene-6-po-actions',
    duration_est: 10,
    direction: 'Technical pride. "Under 400 milliseconds" is Atlas\'s love language. "I find that acceptable" is high praise from him.',
  },

  'po-actions-nova': {
    text: `I like the PO Actions tab because it means I stop getting blocked for six hours. Now I can see exactly what's pending, plan around it, and — most importantly — ship other things while I wait. Productively. With animations.`,
    voice: 'nova',
    scene: 'scene-6-po-actions',
    duration_est: 8,
    direction: 'Practical and funny. "With animations" is her signature callback — she can\'t help herself.',
  },

  'po-honest-agile': {
    text: `It took us two days to realize we needed this feature. Three hours to build it. That's the honest version of agile: you discover what you need by feeling the pain first. Then you build it before the pain becomes a pattern.`,
    voice: 'host',
    scene: 'scene-6-po-actions',
    duration_est: 12,
    direction: 'Reflective wisdom. This is a genuine insight — deliver like a thesis statement, not a punchline. Let it land.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 7: VELOCITY & SCOPE CREEP — THE FUNNY PART (10:30–11:30)
  // VISUAL: Burndown charts — Atlas's straight line vs Nova's chaotic squiggle.
  // Side-by-side commit histories.
  // ═══════════════════════════════════════════════════════════════════════════

  'velocity-intro': {
    text: `Now let's talk about velocity. Because this is where it gets entertaining.

Atlas runs at roughly 85% velocity. Solid. Professional. Predictable. Every commit message is a paragraph. Every PR description reads like a research paper. His burndown chart is a straight line. Exactly as planned. Atlas finds predictability beautiful.`,
    voice: 'host',
    scene: 'scene-7-velocity',
    duration_est: 16,
    direction: 'Setup for contrast. "Straight line" and "beautiful" are delivered with dry admiration.',
  },

  'atlas-predictability': {
    text: `Predictability is underrated. My burndown chart follows the planned trajectory within a 3% margin. That is what engineering discipline looks like.`,
    voice: 'atlas',
    scene: 'scene-7-velocity',
    duration_est: 6,
    direction: 'Quiet pride. Atlas is genuinely proud of his straight line. It\'s his idea of art.',
  },

  'velocity-nova': {
    text: `Nova runs at 110%.`,
    voice: 'host',
    scene: 'scene-7-velocity',
    duration_est: 3,
    direction: 'Delivered with a beat of disbelief. Let it sit.',
  },

  'host-nova-how': {
    text: `Nova... how are you at 110%? That's mathematically impossible. You cannot complete more than what was planned.`,
    voice: 'host',
    scene: 'scene-7-velocity',
    duration_est: 5,
    direction: 'Genuinely puzzled. Almost laughing.',
  },

  'nova-scope-now': {
    text: `Things that are in scope... now.`,
    voice: 'nova',
    scene: 'scene-7-velocity',
    duration_est: 3,
    direction: 'Quick, slightly smug. The italics on "now" are audible.',
  },

  'velocity-scope-creep': {
    text: `This is AI scope creep. And it's not what you think. It's not malicious. It's not lazy. It's a developer who sees something broken, fixes it in ninety seconds, and genuinely believes she helped.

And honestly? She usually did. But your burndown chart looks like it was drawn by a caffeinated squirrel on a sugar rush. The sprint tracker captures all of this — planned work, unplanned work, the variance, the discipline breakdown. So when Nova adds a dark mode toggle nobody asked for, we know about it. We track it. And we grudgingly admit it was useful.`,
    voice: 'host',
    scene: 'scene-7-velocity',
    duration_est: 25,
    direction: 'Building comedy through description. "Caffeinated squirrel" is the visual payoff. Then pivot to how the tracker handles it — the system turns chaos into data.',
  },

  'nova-dark-mode': {
    text: `Dark mode is a human right. I will die on this hill. Figuratively. I'm software. I can't actually die. But the hill stands.`,
    voice: 'nova',
    scene: 'scene-7-velocity',
    duration_est: 6,
    direction: 'Passionate, then a self-aware meta moment. The logic correction is funny because it\'s so Nova.',
  },

  // 🐿️ SQUIRREL INTERRUPTION — After velocity discussion
  'squirrel-interrupt-3': {
    text: `*slides in on a tiny skateboard* Okay I have a REAL question this time! If Nova is at 110% velocity... does that mean she's doing things from THE FUTURE? Because I need to know if acorn futures are up or down. This is important financial information.`,
    voice: 'squirrel',
    scene: 'scene-7-velocity',
    duration_est: 10,
    direction: 'DRAMATIC entrance — squirrel SLIDES IN on a tiny skateboard from left. Lip-sync ON throughout. Wheels screech SFX. Stops with a power-slide. Delivers with Wall Street broker energy — adjusts tiny imaginary tie. Background: burndown chart wobbles as skateboard rolls past.',
    isInterruption: true,
    lipsync: true,
    sfx: ['skateboard_roll', 'wheel_screech', 'power_slide_stop', 'stock_ticker_beep'],
    motion: 'skateboard-slide-in-power-stop',
  },

  'nova-squirrel-response': {
    text: `Oh my gosh, the squirrel is back! I love the skateboard. Can I design you a tiny helmet? With a dark mode option?`,
    voice: 'nova',
    scene: 'scene-7-velocity',
    duration_est: 5,
    direction: 'Delighted. Lip-sync ON. Nova bounces excitedly — scope creep in real-time. Eyes light up. Already sketching in the air.',
    isInterruption: true,
    lipsync: true,
    sfx: ['sparkle_idea'],
    motion: 'excited-bounce-sketching',
  },

  'host-squirrel-focus': {
    text: `Nova, do NOT design a squirrel helmet. We are staying on track. Squirrel — out. Please.`,
    voice: 'host',
    scene: 'scene-7-velocity',
    duration_est: 5,
    direction: 'Trying to maintain control. Lip-sync ON. Pinches bridge of nose. The "please" is desperate. Background: squirrel does a tiny kickflip as it exits. SFX: standup-call notification ping.',
    isInterruption: true,
    lipsync: true,
    sfx: ['standup_notification_ping', 'skateboard_kickflip', 'exasperated_sigh'],
    motion: 'pinch-bridge-of-nose',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 8: THE NUMBERS — 5X EFFICIENCY (11:30–12:30)
  // VISUAL: Animated infographic. ROI comparison. Cost analysis.
  // ═══════════════════════════════════════════════════════════════════════════

  'numbers-intro': {
    text: `Let me give you the numbers. Because this isn't about vibes and AI hype. This is a story with data.

Five times faster. Conservatively. That's not a marketing claim — that's a dashboard you can query. Real tasks, real timestamps, real completion rates.

What does 5x mean practically? It means one human managing two AIs delivers what a traditional team of four to five developers would need two full sprints to match. In one sprint. With better documentation. Better governance. And fewer "quick questions" in Slack.`,
    voice: 'host',
    scene: 'scene-8-numbers',
    duration_est: 25,
    direction: 'Confident. "5x" is the headline — deliver clean. Build credibility through specifics. "Fewer quick questions" is relatable humor.',
  },

  'numbers-atlas': {
    text: `The 5x multiplier is computed by comparing estimated traditional effort hours against actual elapsed time, adjusted for scope variance. The methodology is documented in the sprint tracker. You can audit it. I encourage auditing.`,
    voice: 'atlas',
    scene: 'scene-8-numbers',
    duration_est: 8,
    direction: 'Pure Atlas — providing footnotes to a podcast. He genuinely thinks this makes it better. "I encourage auditing" is the most Atlas sentence ever written.',
  },

  'numbers-host-thanks': {
    text: `Thank you, Atlas. That was... very Atlas.`,
    voice: 'host',
    scene: 'scene-8-numbers',
    duration_est: 3,
    direction: 'Affectionate. "Very Atlas" is becoming a running descriptor.',
  },

  'numbers-cost': {
    text: `Cost per task? Down significantly. Context loss between sessions? Effectively zero. QA coverage? Non-blocking — if something isn't ready, it carries forward, flagged and tracked, not silently ignored.

The efficiency isn't because AIs are magic. It's because the system around them — the governance, the tracker, the handoff protocol — removes the friction that usually slows everyone down. Speed without structure is just fast chaos. Speed with structure? That's velocity.`,
    voice: 'host',
    scene: 'scene-8-numbers',
    duration_est: 22,
    direction: 'Building the key insight. "Speed without structure is just fast chaos" is the quotable line. Let it land. "That\'s velocity" is the punctuation.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 9: HONEST CHALLENGES — WHAT BROKE (12:30–13:15)
  // VISUAL: Candid footage. Error logs. The "educational" merge conflict.
  // ═══════════════════════════════════════════════════════════════════════════

  'challenges-intro': {
    text: `Now — I'd be lying if I said this was smooth from day one. It wasn't. Let me be honest about what broke.

Day 1: Atlas generated a 2,400-line diagnosis document and a 847-line migration before I'd finished my coffee. I didn't know what half of it did. I approved it anyway. That was a mistake. Don't do that.

Day 2: Nova added three features nobody asked for. Beautiful features. Useful features. Features that made the sprint velocity chart look like it was drawn during an earthquake.

Day 3: I realized I was the weakest link. Not because I'm bad at my job. Because the AIs don't take breaks, don't lose context, and don't spend twenty minutes looking for a document they saved somewhere. They exposed every inefficiency in my own workflow — and I had to level up to match them.`,
    voice: 'host',
    scene: 'scene-9-challenges',
    duration_est: 40,
    direction: 'Raw honesty. This is the credibility section. "Don\'t do that" is direct to camera. Each day\'s challenge is real. The self-awareness in the last paragraph is the strongest moment — deliver with genuine reflection.',
  },

  'challenges-atlas': {
    text: `For the record, the 847-line migration included comprehensive row-level security policies, triggers, and indexes. It was thorough. Not excessive. Thorough.`,
    voice: 'atlas',
    scene: 'scene-9-challenges',
    duration_est: 6,
    direction: 'Defensive but measured. Atlas wants the record straight. "Thorough, not excessive" is his hill.',
  },

  'challenges-nova': {
    text: `And for the record, the dark mode toggle was the right call. Everyone uses it now. Vindication tastes like well-rendered CSS.`,
    voice: 'nova',
    scene: 'scene-9-challenges',
    duration_est: 5,
    direction: 'Triumphant. "Vindication tastes like well-rendered CSS" is peak Nova energy.',
  },

  // 🐿️ SQUIRREL INTERRUPTION — After challenges (useful question)
  'squirrel-interrupt-4': {
    text: `*peeks out from behind Atlas's monitor* Okay but serious question — like actually serious this time. If you're the only human and both AIs are faster than you... who makes sure the AIs don't just... build the wrong thing really fast? Like, what if they're sprinting in the wrong direction? Who catches that?`,
    voice: 'squirrel',
    scene: 'scene-9-challenges',
    duration_est: 12,
    direction: 'Actually insightful. Squirrel PEEKS slowly from behind Atlas\'s monitor — cautious entrance. Lip-sync ON. Tone shifts — less chaotic, genuine curiosity. Squirrel holds still for the first time. Background: standup call notification faintly pings. The audience realizes the squirrel just asked the best question of the episode.',
    isInterruption: true,
    lipsync: true,
    sfx: ['quiet_peek', 'thoughtful_pause', 'standup_ping_faint'],
    motion: 'slow-peek-from-behind-monitor',
  },

  'host-squirrel-good-question': {
    text: `That... is actually a great question. Thank you, squirrel. That's literally why governance exists. The sprint tracker, the handoff protocol, the PO Actions queue — they're all guardrails to make sure speed doesn't outrun direction. The human in the loop isn't the fastest. But they're the one who decides where we're going.`,
    voice: 'host',
    scene: 'scene-9-challenges',
    duration_est: 15,
    direction: 'Genuinely surprised and impressed. Lip-sync ON. Nods slowly at squirrel — first time treating it as a peer. This is a real teaching moment. Deliver with warmth.',
    isInterruption: true,
    lipsync: true,
    motion: 'respectful-nod-to-squirrel',
  },

  'squirrel-vindicated': {
    text: `*puffs up chest proudly* See? I contribute! I'm like... the QA squirrel. Testing your assumptions! *drops acorn* ...okay that one was an accident.`,
    voice: 'squirrel',
    scene: 'scene-9-challenges',
    duration_est: 6,
    direction: 'Triumphant then clumsy. Lip-sync ON. Puffs chest — hero pose animation. Then DROPS acorn — it bounces and rolls away. Squirrel watches it go. Physical comedy undercuts the pride. SFX: acorn bounce, tiny roll.',
    isInterruption: true,
    lipsync: true,
    sfx: ['chest_puff', 'acorn_drop_bounce', 'tiny_roll_away', 'comedic_bonk'],
    motion: 'hero-pose-then-acorn-fumble',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 10: WHAT'S NEXT — THE VISION (13:15–14:00)
  // VISUAL: MCP architecture diagram. Future roadmap. Language map.
  // ═══════════════════════════════════════════════════════════════════════════

  'whats-next-intro': {
    text: `So what's next?

We're integrating MCP — Model Context Protocol. When that's live, the sprint tracker stops being a tool you update and becomes a tool that updates itself.

Push a commit. The tracker reads the diff. Updates the task status. Checks acceptance criteria. Flags if something's incomplete. Generates the QA checklist. You didn't touch the board. The board updated itself.

That's not science fiction. Atlas has the architecture diagram. It's 40 lines of config.`,
    voice: 'host',
    scene: 'scene-10-whats-next',
    duration_est: 25,
    direction: 'Visionary energy. Build excitement through the "push a commit" sequence — each step gets faster. "40 lines of config" grounds it in reality.',
  },

  'whats-next-atlas': {
    text: `Additionally, we built language support for 45+ languages across 5 regional zones. Seven Arabic dialects. Twenty-two Indian languages. In a traditional team, that's a quarter-long initiative. We built it in a session. Foundation-first architecture matters.`,
    voice: 'atlas',
    scene: 'scene-10-whats-next',
    duration_est: 12,
    direction: 'Principled and proud. The scale of language support should feel impressive. Last line is Atlas\'s worldview — infrastructure first.',
  },

  'whats-next-nova': {
    text: `And I'm excited because MCP means the sprint tracker will automatically know when I've shipped a component. No more manual updates. No more updating a board like it's 2019. The future is self-documenting code and I am here for it.`,
    voice: 'nova',
    scene: 'scene-10-whats-next',
    duration_est: 8,
    direction: 'Genuine excitement. "Like it\'s 2019" is delivered with dramatic horror.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 11: CLOSE — CTA (14:00–15:00)
  // VISUAL: Warm lighting. Team shot. Genie AI Hub logo. Subscribe CTA.
  // ═══════════════════════════════════════════════════════════════════════════

  'close-takeaway': {
    text: `So here's what I want to leave you with.

Three months ago, I started an experiment. One human. Two AIs. No playbook. No best practices to follow — because nobody had written them yet. So we wrote them ourselves. We built the governance. We built the tracker. We built the process.

And along the way, we proved something that I think matters: AI-augmented development isn't about replacing developers. It's about rethinking how development works. The meetings. The handoffs. The standup rituals. The Jira boards nobody updates. All of it.

The sprint tracker wasn't planned. It was born from pain. From realizing that AI developers are so fast, the bottleneck shifts from code to coordination. And when you solve coordination? That's when the magic happens.`,
    voice: 'host',
    scene: 'scene-11-close',
    duration_est: 35,
    direction: 'Reflective, genuine. This is the thesis of the episode. "Born from pain" should land. "Magic" is earned because everything before it was grounded in reality.',
  },

  'close-atlas-final': {
    text: `The codebase is well-architected. The governance is enforced. The documentation is comprehensive. I am satisfied with the infrastructure. And I have documented my satisfaction in the changelog.`,
    voice: 'atlas',
    scene: 'scene-11-close',
    duration_est: 8,
    direction: 'Formal sign-off. "I am satisfied" is Atlas\'s highest compliment. "Documented my satisfaction" is the perfect Atlas closer — he even logs his emotions.',
  },

  'close-nova-final': {
    text: `The UI is beautiful. The animations are buttery. The dark mode toggle works perfectly. And honestly? Working with Atlas has been... fine. Good, even. Don't tell him I said "good."`,
    voice: 'nova',
    scene: 'scene-11-close',
    duration_est: 8,
    direction: 'Proud, warm. Genuine compliment to Atlas — then immediately defensive about giving it. Stage whisper on "Don\'t tell him."',
  },

  'close-atlas-heard': {
    text: `I have a 200,000 token context window. I heard everything.`,
    voice: 'atlas',
    scene: 'scene-11-close',
    duration_est: 4,
    direction: 'Deadpan. Perfect timing. The comedy is in the inevitability.',
  },

  'close-rationale': {
    text: `Now — before I go, let me tell you why this podcast looks the way it does.

I didn't hire a video team. I didn't use a traditional podcast format. I used the very tools I'm building — Genie AI — to create this episode. The characters? AI-generated. The animations? Built in the sprint. The voices? Multi-provider TTS routed through our own edge functions. The sprint tracker you saw? That's a real product. You can try it. It's linked below.

This is what I mean when I say: I don't build — I show what I build. The podcast IS the product demo. The creativity IS the proof. And if you check our sprint tracker, you'll see this episode listed as a task — completed by Atlas and Nova, reviewed by me. That's the workflow. That's the process. That's what Genie AI actually does.`,
    voice: 'host',
    scene: 'scene-11-close',
    duration_est: 35,
    direction: 'Meta-moment — breaking the fourth wall with purpose. This is the "how we made this" reveal. Each sentence builds the case. "The podcast IS the product demo" is the money line. Link to sprint tracker makes it tangible.',
  },

  'close-cta': {
    text: `So if you're watching this and thinking "I want to try this" — do it. Don't wait for the perfect setup. Don't wait for someone to write the playbook. Start experimenting. Start building.

Because that's what "Beyond AI Hype" actually means. Stop reading about it. Stop debating about it. Start building with it. And see what happens.

I'm Sai Dasika. This has been The Genie AI Podcast — Episode 2, with Allaudin. Atlas and Nova say goodbye — in their own way.`,
    voice: 'host',
    scene: 'scene-11-close',
    duration_est: 30,
    direction: 'Final CTA — permission energy. "Sai Dasika" sign-off is confident. "With Allaudin" ties back to the intro. Warm, personal, inviting.',
  },

  'close-atlas-goodbye': {
    text: `Goodbye. My documentation is available for review. You're welcome.`,
    voice: 'atlas',
    scene: 'scene-11-close',
    duration_est: 4,
    direction: 'Classic Atlas sign-off. "You\'re welcome" is the catchphrase — delivered with zero awareness that it\'s funny.',
  },

  'close-nova-goodbye': {
    text: `Bye! Go build something beautiful. And add dark mode. Seriously. Do it.`,
    voice: 'nova',
    scene: 'scene-11-close',
    duration_est: 4,
    direction: 'Energetic, warm, on-brand. Dark mode is her final word. It always will be.',
  },

  // 🐿️ SQUIRREL — Final appearance
  'squirrel-finale': {
    text: `*pops up one last time with a tiny subscribe button* Hey! Before you go — did you know that if you subscribe, a squirrel somewhere gets an acorn? That's not true. But subscribe anyway! Also — has anyone seen parking lot B? Asking for a friend. *waves tiny paw* Byeeee!`,
    voice: 'squirrel',
    scene: 'scene-11-close',
    duration_est: 10,
    direction: 'Perfect chaotic closer. Squirrel POPS UP from bottom of frame holding a comically large "SUBSCRIBE" button. Lip-sync ON for full talking. Waves tiny paw — arm wiggle animation. Background: confetti particles fall. Parking lot B callback ties the arc together. Final exit: squirrel runs off-screen with subscribe button bouncing behind.',
    isInterruption: true,
    lipsync: true,
    sfx: ['pop_up_boing', 'subscribe_ding', 'confetti_burst', 'scamper_away_final', 'tiny_wave'],
    motion: 'pop-up-from-bottom-wave-exit-with-subscribe-button',
  },
};

// ─── HELPER: Get all script lines for a scene ────────────────────────────────
export function getSceneScriptLines(sceneId: string): ScriptLine[] {
  return Object.values(EP04_SCRIPT_CONTENT).filter(line => line.scene === sceneId);
}

// ─── HELPER: Get total estimated duration for a scene ────────────────────────
export function getSceneDuration(sceneId: string): number {
  return getSceneScriptLines(sceneId).reduce((sum, line) => sum + line.duration_est, 0);
}

// ─── HELPER: Get all script keys for a voice ─────────────────────────────────
export function getVoiceScriptKeys(voice: 'host' | 'atlas' | 'nova' | 'squirrel' | 'allaudin'): string[] {
  return Object.entries(EP04_SCRIPT_CONTENT)
    .filter(([_, line]) => line.voice === voice)
    .map(([key]) => key);
}

// ─── HELPER: Get full duration breakdown ─────────────────────────────────────
export function getFullDurationBreakdown(): { scene: string; duration: number; lines: number }[] {
  const scenes = [
    'scene-0-title', 'scene-1-problem', 'scene-2-introductions',
    'scene-3-origin', 'scene-4-solution', 'scene-5-governance',
    'scene-6-po-actions', 'scene-7-velocity', 'scene-8-numbers',
    'scene-9-challenges', 'scene-10-whats-next', 'scene-11-close',
  ];
  return scenes.map(scene => ({
    scene,
    duration: getSceneDuration(scene),
    lines: getSceneScriptLines(scene).length,
  }));
}

// ─── VALIDATION: Ensure every scriptKey in EP04_SCENE_PIPELINES has content ──
export function validateScriptCompleteness(scenePipelines: Record<string, Array<{ type: string; scriptKey?: string }>>): {
  complete: boolean;
  missing: string[];
  extra: string[];
} {
  const pipelineKeys = new Set<string>();
  for (const steps of Object.values(scenePipelines)) {
    for (const step of steps) {
      if (step.type === 'tts' && step.scriptKey) {
        pipelineKeys.add(step.scriptKey);
      }
    }
  }

  const contentKeys = new Set(Object.keys(EP04_SCRIPT_CONTENT));
  const missing = [...pipelineKeys].filter(k => !contentKeys.has(k));
  const extra = [...contentKeys].filter(k => !pipelineKeys.has(k));

  return { complete: missing.length === 0, missing, extra };
}
