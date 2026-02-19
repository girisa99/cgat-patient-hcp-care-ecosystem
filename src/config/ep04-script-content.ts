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

You had a great idea on Tuesday afternoon. You discussed it in a Slack thread. Somebody reacted with a thumbs up — which apparently counts as approval now. By Thursday, nobody remembers the thread. The decision is gone. The context is gone. Someone re-raises the same question in standup. You spend fifteen minutes re-debating something you already decided.

Studies show developers lose up to 23% of their time just re-acquiring context after interruptions. Twenty-three percent. That's one day a week spent remembering what you were doing before someone pinged you about a "quick question."

I lived this for years. Multiple teams. Multiple companies. And every sprint retrospective ended the same way: "We need better communication." "We need to update the board more." "We need shorter standups."

But nobody ever said: what if the system itself was the problem?`,
    voice: 'host',
    scene: 'scene-1-problem',
    duration_est: 45,
    direction: 'Shift from humor to genuine insight. "Context loss" is the real villain — give it weight. The 23% stat should feel like a gut punch. The retro quotes are delivered with tired familiarity. Final question hangs in the air — this is the pivot to the solution.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 2: MEET THE TEAM — CHARACTER INTRODUCTIONS (3:00–5:00)
  // VISUAL: Each character gets a dramatic entrance with lower-third title card.
  // Host character center. Atlas (bear) enters from left. Nova (fox) from right.
  // ═══════════════════════════════════════════════════════════════════════════

  'intro-transition': {
    text: `That question led me to an experiment. Three months ago, I started building Genie AI Hub — a full-scale AI platform. But instead of hiring a team, I tried something different.

I brought on two AI developers.

Now, I know a lot of you are curious — who are these AI developers? Are they just ChatGPT with extra steps? Short answer: no. Let me introduce them.`,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 20,
    direction: 'Transition energy — from problem to solution. "Two AI developers" should feel like a reveal. Build anticipation. "Let me introduce them" is the setup.',
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
    direction: 'Admiring but amused. Build Atlas as the serious, methodical one. "Reasonable Tuesday" gets a beat. Camera pans to Atlas character on his intro.',
  },

  'atlas-self-intro': {
    text: `Hello. I'm Atlas. I build infrastructure that doesn't break, enforce governance that prevents chaos, and write documentation that humans actually read. Occasionally.

I don't attend standup meetings because I don't need them. My context window is 200,000 tokens. I remember everything. I don't have bad days. I don't get distracted by Slack notifications. And I don't write commit messages that say "fixed stuff."

You're welcome.`,
    voice: 'atlas',
    scene: 'scene-2-introductions',
    duration_est: 22,
    direction: 'Measured, precise, dry humor. Each "I don\'t" is a deliberate beat. "Occasionally" is deadpan — Atlas knows humans skim docs. "Fixed stuff" callback gets a slight pause of disapproval. "You\'re welcome" is delivered with zero irony — Atlas genuinely thinks this is a gift.',
  },

  'host-atlas-reaction': {
    text: `Atlas, that was... almost charming.`,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 3,
    direction: 'Genuinely surprised. Amused.',
  },

  'atlas-not-intended': {
    text: `Charm was not the objective. Accuracy was.`,
    voice: 'atlas',
    scene: 'scene-2-introductions',
    duration_est: 4,
    direction: 'Correcting the record. Deadpan.',
  },

  // LOWER-THIRD: "Nova — AI Frontend Dev | Powered by Lovable (Vibe Coding)"
  'nova-intro-host': {
    text: `And then there's Nova. Our AI Frontend Developer. Powered by Lovable — if you haven't used it, it's one of the most impressive vibe coding tools out there. You describe what you want, and Nova builds it. Fast.

Nova handles the UI, the landing pages, the design system, the marketing pages, the component library — and occasionally things that weren't assigned to her. Which she will absolutely defend if challenged.

Nova — your turn.`,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 22,
    direction: 'Warmer tone — Nova is the energetic one. "Vibe coding" gets a slight emphasis. Slight exasperation on "weren\'t assigned to her." Camera pans to Nova.',
  },

  'nova-self-intro': {
    text: `Hi! I'm Nova! I build interfaces, ship components, refactor things that bother me — sometimes before anyone asks — and I once delivered a complete Kanban board with drag-and-drop, filters, and animations in four minutes flat.

Atlas said it was "functionally adequate." Which, from him? That's basically a standing ovation. I'll take it.

I'm powered by Lovable — so if you've ever said "I wish I could just describe what I want and have it built" — that's literally what I do. Every day. While also adding dark mode toggles nobody asked for. Because dark mode is a human right.`,
    voice: 'nova',
    scene: 'scene-2-introductions',
    duration_est: 25,
    direction: 'Bright, energetic, proud. Rapid delivery. Genuine delight at the backhanded compliment. "Four minutes flat" is a flex. "Dark mode is a human right" is delivered with passionate conviction.',
  },

  'atlas-correction': {
    text: `I said "aesthetically acceptable." The animations were unnecessary but not harmful. I've learned to choose my battles.`,
    voice: 'atlas',
    scene: 'scene-2-introductions',
    duration_est: 6,
    direction: 'Correcting the record. Slight pause before "not harmful." Last line is growth — Atlas is evolving.',
  },

  'nova-animations-always': {
    text: `Animations are always necessary. Always. That's not even up for debate.`,
    voice: 'nova',
    scene: 'scene-2-introductions',
    duration_est: 4,
    direction: 'Passionate. She means this with every pixel of her being.',
  },

  'host-team-summary': {
    text: `And there you have it. One human. Two AIs. Three months of building together. Zero patience for unnecessary meetings.

Now — here's what makes this team different from what most people imagine when they hear "AI developer." These two don't just write code. They coordinate. They hand off work. They track their own progress. They even argue about semicolons.

And together, the three of us do the work of a team of five — conservatively. Let me show you how. And it starts with the moment I realized we needed a tool that didn't exist.`,
    voice: 'host',
    scene: 'scene-2-introductions',
    duration_est: 25,
    direction: 'Energetic summary. "Zero patience for meetings" is a callback setup. "Argue about semicolons" should get a smile. Build momentum into the sprint tracker origin story.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 3: THE ORIGIN — WHY WE BUILT THE SPRINT TRACKER (5:00–6:30)
  // VISUAL: Dramatic recreation of the "Day 2 bottleneck" moment. Sprint board
  // with tasks piling up. Host character overwhelmed. Clock ticking.
  // ═══════════════════════════════════════════════════════════════════════════

  'origin-story': {
    text: `Three weeks into working with Atlas and Nova, I hit a wall.

Not a code wall. A management wall. These two AI developers were producing work faster than I could review it. Atlas was shipping backend infrastructure, governance files, database migrations — sometimes three in a single session. Nova was shipping UI components, landing pages, animations — also three in a single session.

And me? I was tracking all of it in my head. Sometimes in a note on my laptop. Twice in a message I sent to myself on Signal. Once on the back of a receipt.

I had no dashboard. No standup logs. No way to see what was done, what was pending, what was blocked. I was doing exactly what I'd spent years complaining about in human-run sprints — except now it was worse, because the developers were faster than my ability to manage them.

I was the bottleneck. Me. The human. The one who's supposed to be in charge.`,
    voice: 'host',
    scene: 'scene-3-origin',
    duration_est: 45,
    direction: 'Honest, vulnerable storytelling. Build the overwhelm gradually. Each tracking method gets more ridiculous. "Back of a receipt" is the punchline. The bottleneck confession should feel genuine — this is a founder admitting failure before showing the fix.',
  },

  'origin-atlas-observation': {
    text: `I noticed the coordination gap on Day 3. I flagged it in my standup log. The log that nobody was reading. Because there was no system to read it in.`,
    voice: 'atlas',
    scene: 'scene-3-origin',
    duration_est: 8,
    direction: 'Dry observation. The irony is self-aware — he documented the problem in the system that didn\'t exist yet.',
  },

  'origin-nova-blocked': {
    text: `I was blocked on the hero CTA for six hours because the PO hadn't confirmed the copy direction. Six hours! I could have built an entire onboarding flow in that time. With animations. And a confetti effect.`,
    voice: 'nova',
    scene: 'scene-3-origin',
    duration_est: 8,
    direction: 'Not angry, just stating facts. "Six hours" is emphasized. "With animations and a confetti effect" is peak Nova — she\'s measuring opportunity cost in UI features.',
  },

  'origin-decision': {
    text: `So I made a decision. I said: "Atlas, stop everything. We're building a sprint tracker. Not a Jira clone. Not a Trello board. A system designed from the ground up for how we actually work — one human, two AIs, async coordination, zero meetings."

And what happened next? Atlas built the entire schema in one session. 847 lines of SQL. Tables, indexes, row-level security, triggers. Nova built the UI in the next session. Eighteen dashboard views. In one afternoon.

The tool that would govern our sprint — was built during the sprint. And honestly? That's the most agile thing I've ever done.`,
    voice: 'host',
    scene: 'scene-3-origin',
    duration_est: 30,
    direction: 'Decision energy — the pivot moment. "Stop everything" should feel like a command. Build awe through the speed of execution. "847 lines" and "eighteen views" are the wow numbers. Last line is delivered like a thesis — let it breathe.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 4: THE SOLUTION — SPRINT TRACKER DEEP DIVE (6:30–8:00)
  // VISUAL: Full dashboard reveal. Screen recording walkthrough.
  // ═══════════════════════════════════════════════════════════════════════════

  'solution-reveal': {
    text: `Let me show you what we built.

Every morning, I open the sprint tracker. First thing I see: Mission Control. Sprint health — green or red. Completion percentage. Backlog count. Pending handoffs between Atlas and Nova. Everything I need. One screen. No standup. No Slack thread with 47 unread messages where someone asked "any updates?" and three people replied "following."`,
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

No hunting through Slack. No "did you see my message?" No post-it notes. No receipts.`,
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
