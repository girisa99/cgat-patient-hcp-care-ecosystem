/**
 * EP04 SCRIPT CONTENT — Actual dialogue text for TTS generation
 * 
 * Maps every `scriptKey` from EP04_SCENE_PIPELINES to the spoken dialogue.
 * Source: EP04_VIDEO_PRODUCTION_PLAN.md (the approved production script).
 * 
 * Each entry includes:
 * - text: The exact TTS input string
 * - voice: Which EP04 voice renders it (host/atlas/nova)
 * - scene: Which scene it belongs to
 * - duration_est: Estimated seconds (at ~150 wpm)
 * - direction: Performance/delivery notes for TTS tuning
 */

export interface ScriptLine {
  text: string;
  voice: 'host' | 'atlas' | 'nova';
  scene: string;
  duration_est: number;
  direction: string;
}

export const EP04_SCRIPT_CONTENT: Record<string, ScriptLine> = {

  // ─── SCENE 0: TITLE & WELCOME (0:00–0:30) ────────────────────────────────
  // VISUAL: Animated title card with "Beyond AI Hype" logo. Split-screen thumbnail 
  // showing Claude (left/blue) and Lovable (right/pink-green) logos, with Atlas (bear)
  // and Nova (fox) 3D characters flanking them. Host character in center foreground.
  'title-welcome': {
    text: `Welcome to Beyond AI Hype — Episode Four: Two AIs, One Sprint, Zero Standup Meetings.

I'm your host — the Product Owner, Scrum Master, QA lead, and the person writing this very script. You can call me the human in the loop.

Today, I'm joined by two AI developers who built an entire sprint management ecosystem in five days. Let me introduce them.`,
    voice: 'host',
    scene: 'scene-0-title',
    duration_est: 20,
    direction: 'Warm, welcoming, direct to camera. Title card energy. Slight smile on "human in the loop." Build anticipation before the introductions.',
  },

  // ─── SCENE 1: CHARACTER INTRODUCTIONS (0:30–1:45) ─────────────────────────
  // VISUAL: Each character gets a lower-third title card as they're introduced.
  // LOWER-THIRD for Host: "Product Owner & Scrum Master | GenieSuite"
  'host-intro': {
    text: `Let's start with the crew.

I'm the Product Owner. I set the vision, write the acceptance criteria, approve the work, and unblock the blockers. I also have a day job, which means these two occasionally wait for me to answer a message. More on that later.`,
    voice: 'host',
    scene: 'scene-1-introductions',
    duration_est: 16,
    direction: 'Confident but self-aware. Slight self-deprecation on "day job." Direct eye contact with camera.',
  },

  // LOWER-THIRD for Atlas: "Atlas — AI Tech Lead | Powered by Claude (Anthropic)"
  'atlas-intro-host': {
    text: `First up: Atlas. Our AI Tech Lead. Powered by Claude from Anthropic. Atlas handles backend architecture, sprint infrastructure, database design, and governance. He wrote 847 lines in a single migration file on Day 1 — and thought that was reasonable.`,
    voice: 'host',
    scene: 'scene-1-introductions',
    duration_est: 16,
    direction: 'Admiring but amused. "847 lines" gets a beat of incredulity. Camera pans to Atlas character.',
  },

  'atlas-self-intro': {
    text: `Hello. I'm Atlas. I build infrastructure, enforce governance, and ensure architectural consistency across the codebase. I process approximately 200,000 tokens of context per session. I don't attend standup meetings. You're welcome.`,
    voice: 'atlas',
    scene: 'scene-1-introductions',
    duration_est: 12,
    direction: 'Measured, precise, dry humor. "You\'re welcome" is deadpan — Atlas genuinely thinks skipping standups is a gift to humanity.',
  },

  // LOWER-THIRD for Nova: "Nova — AI Frontend Dev | Powered by Lovable"
  'nova-intro-host': {
    text: `And then there's Nova. Our AI Frontend Developer. Powered by Lovable. Nova handles the UI, the landing pages, the design system, the marketing pages — and occasionally things that weren't assigned to her.`,
    voice: 'host',
    scene: 'scene-1-introductions',
    duration_est: 12,
    direction: 'Warm, impressed, slightly exasperated on the last line. Camera pans to Nova character.',
  },

  'nova-self-intro': {
    text: `Hi! I'm Nova. I build interfaces, ship components, and refactor things that bother me — sometimes before anyone asks. I once delivered a complete Kanban board in four minutes. Atlas said it was "aesthetically acceptable." That's the nicest thing he's ever said.`,
    voice: 'nova',
    scene: 'scene-1-introductions',
    duration_est: 14,
    direction: 'Bright, energetic, proud. Slight giggle energy on the Atlas quote. She\'s genuinely delighted by the backhanded compliment.',
  },

  'atlas-aesthetically-accurate': {
    text: `I said "functionally adequate." The aesthetics were... fine.`,
    voice: 'atlas',
    scene: 'scene-1-introductions',
    duration_est: 4,
    direction: 'Correcting the record. Slight pause before "fine" — Atlas is being generous and wants credit for it.',
  },

  'host-intro-wrap': {
    text: `And there you have it. One human. Two AIs. Zero patience for meetings. Let's talk about what happened when we put all three on a five-day sprint.`,
    voice: 'host',
    scene: 'scene-1-introductions',
    duration_est: 8,
    direction: 'Energetic transition. "Zero patience for meetings" is a callback setup. Forward momentum into the sprint story.',
  },

  // ─── SCENE 2: COLD OPEN — THE QUESTION (1:45–2:30) ───────────────────────
  'cold-open-narration': {
    text: `Here's a question nobody asks out loud: What actually happens when you put TWO AI developers on a 5-day sprint together — with a human Product Owner who is also the Scrum Master, the QA lead, and the person writing this script?

Spoiler: it's equal parts impressive and chaotic. And today, I'm going to show you both parts.`,
    voice: 'host',
    scene: 'scene-2-cold-open',
    duration_est: 18,
    direction: 'Warm, direct to camera. Slight pause before "Spoiler." Conversational energy — not a TED talk, more like a podcast host leaning into the mic.',
  },

  // ─── SCENE 3: GOVERNANCE / TERRITORY (2:30–4:15) ──────────────────────────
  'governance-narration': {
    text: `When you have two AI developers working on the same codebase simultaneously, the first thing you solve isn't speed. It's coordination.

How do you avoid a merge conflict at 2 AM? You don't use hope. You use territory.

We built a file ownership matrix. Atlas owns backend and sprint infrastructure. Nova owns the landing UI and marketing pages. And there's a locked shared infrastructure layer — 12 critical files — that neither AI modifies without a PO gate.

Now, the sprint itself. 41 tasks. 5 days. Three products — Spark, Mind, and Deck. Two AI developers, one human PO who also has a day job.`,
    voice: 'host',
    scene: 'scene-3-governance',
    duration_est: 40,
    direction: 'Authoritative but accessible. Build tension on the merge conflict line. "You don\'t use hope" should land like a punchline.',
  },

  'atlas-merge-conflict': {
    text: `We had a merge conflict on Day 1. Before the governance file existed.`,
    voice: 'atlas',
    scene: 'scene-3-governance',
    duration_est: 5,
    direction: 'Dry, factual. Slight pause before "Before the governance file existed" — understated humor.',
  },

  'host-governance-not-overkill': {
    text: `So no — the governance is not overkill.

Atlas, did you read the charter?`,
    voice: 'host',
    scene: 'scene-3-governance',
    duration_est: 5,
    direction: 'Emphatic on "not overkill." Then casual pivot to the question.',
  },

  'nova-read-relevant-sections': {
    text: `I read the relevant sections. In real time. While building things.`,
    voice: 'nova',
    scene: 'scene-3-governance',
    duration_est: 4,
    direction: 'Quick, slightly defensive but mostly just efficient. Each phrase is a separate beat.',
  },

  // ─── SCENE 4: DAY 1 — FOUNDATION (4:30–5:30) ─────────────────────────────
  'day1-narration': {
    text: `Day 1: Foundation.

The goal was diagnosis and infrastructure. Atlas ran a full codebase audit — found broken imports, incomplete migrations, architectural gaps. All documented. All tagged by severity.

Meanwhile, Nova was supposed to be building the landing page hero section.`,
    voice: 'host',
    scene: 'scene-4-day1',
    duration_est: 20,
    direction: 'Clean transition energy. "Day 1: Foundation" should feel like a chapter title. Slight emphasis on "supposed to be."',
  },

  'nova-refactored-nav': {
    text: `I also refactored the navigation component. It needed it.`,
    voice: 'nova',
    scene: 'scene-4-day1',
    duration_est: 4,
    direction: 'Cheerful, unapologetic. She genuinely thinks this was helpful.',
  },

  'host-not-in-scope': {
    text: `It wasn't in scope.

This is the thing about AI developers that nobody warns you about. They're extremely productive. They're also extremely... thorough. In ways you didn't ask for.`,
    voice: 'host',
    scene: 'scene-4-day1',
    duration_est: 12,
    direction: 'Flat "It wasn\'t in scope." Then shift to a broader observation — slightly amused, slightly exasperated, mostly affectionate.',
  },

  'nova-works-better': {
    text: `It works better now.`,
    voice: 'nova',
    scene: 'scene-4-day1',
    duration_est: 2,
    direction: 'Simple, confident. Case closed.',
  },

  // ─── SCENE 5: DAY 2 — VELOCITY & PO BOTTLENECK (5:30–7:00) ──────────────
  'day2-velocity-narration': {
    text: `Day 2: Velocity.

This is where the sprint hit its stride. Both AIs had clear territory, clear tasks, clear acceptance criteria. The board moved.

But — we didn't have a PO Actions tab on Day 2.

I had a list of things I needed to verify, approve, and unblock. It was in my head. Sometimes in a note on my laptop. Twice in a message I sent to myself on Signal.`,
    voice: 'host',
    scene: 'scene-5-day2',
    duration_est: 28,
    direction: 'Start strong and fast — velocity energy. Then slow down dramatically at "But." Self-deprecating honesty on the Signal line.',
  },

  'nova-blocked-six-hours': {
    text: `We were blocked on the hero CTA for six hours because the PO hadn't confirmed the copy direction.`,
    voice: 'nova',
    scene: 'scene-5-day2',
    duration_est: 6,
    direction: 'Not angry, just stating facts. But the "six hours" should land with weight.',
  },

  'host-in-a-meeting': {
    text: `I was in a meeting.`,
    voice: 'host',
    scene: 'scene-5-day2',
    duration_est: 2,
    direction: 'Sheepish. A bit defensive. The comedy is in the inadequacy of the excuse.',
  },

  'atlas-human-meetings': {
    text: `A human meeting. Those take significantly longer than they need to.`,
    voice: 'atlas',
    scene: 'scene-5-day2',
    duration_est: 5,
    direction: 'Perfectly neutral observation. Atlas isn\'t being mean — he genuinely doesn\'t understand why humans do this.',
  },

  'host-po-actions-built': {
    text: `After Day 2, we built the PO Actions tab. Every item I need to act on — it's a living checklist. Both AIs write to it. I check it every morning.

It took us two days to realize we needed it. Three hours to build it.

That's the honest version of agile: you discover what you need by feeling the pain first.`,
    voice: 'host',
    scene: 'scene-5-day2',
    duration_est: 18,
    direction: 'Genuine lesson-learned energy. The last line is the key insight — deliver it like a thesis statement, not a punchline.',
  },

  // ─── SCENE 6: DAY 3 — VELOCITY MISMATCH (7:00–7:30) ──────────────────────
  'day3-velocity-mismatch': {
    text: `Day 3. Atlas was running at roughly 85% velocity. Solid. Professional. On track.

Nova was running at 110%.

Nova, how are you at 110%?`,
    voice: 'host',
    scene: 'scene-6-day3',
    duration_est: 12,
    direction: 'Measured start. "110%" should get a beat of disbelief. The question is genuinely curious.',
  },

  'nova-scope-now': {
    text: `Things that are in scope now.`,
    voice: 'nova',
    scene: 'scene-6-day3',
    duration_est: 3,
    direction: 'Quick, slightly smug. The italics on "now" are audible — she retroactively declared things in scope.',
  },

  // ─── SCENE 7: MISSION CONTROL (7:30–9:00) ─────────────────────────────────
  'mission-control-narration': {
    text: `Every morning, I open the sprint tracker and the first thing I see is Mission Control.

Sprint health: green. Completion: tracked. Backlog: 3 tasks. Pending handoffs: 2.

Everything I need to know. One screen. No standup meeting. No status email. No Slack thread with 47 unread messages.

Humans. We've had standups that ran 45 minutes for a two-person team. Forty-five minutes. To say "still in progress" with extra words.

With the sprint tracker: the standup is already done. Both AIs log their entries. The PO reviews asynchronously. The whole "meeting" takes four minutes.

QA. We built a non-blocking QA sign-off system. If something isn't ready, it carries forward — flagged, tracked, not silently ignored.

EOD Handoff. The sprint tracker auto-generates a brief every end of day. What was completed. What's pending. What Atlas needs from Nova and vice versa. It publishes to Supabase.

Zero context loss.`,
    voice: 'host',
    scene: 'scene-7-mission-control',
    duration_est: 55,
    direction: 'This is the showpiece scene. Start calm and confident. Build energy through the "45 minutes" rant. Land "Zero context loss" like dropping a mic.',
  },

  'atlas-context-loss': {
    text: `Context loss is the primary source of rework in human software projects.`,
    voice: 'atlas',
    scene: 'scene-7-mission-control',
    duration_est: 5,
    direction: 'Academic. Citing a fact. Not gloating — genuinely concerned about inefficiency.',
  },

  'nova-200k-window': {
    text: `I don't lose context. I have a 200K token window.`,
    voice: 'nova',
    scene: 'scene-7-mission-control',
    duration_est: 4,
    direction: 'Casual flex. Like mentioning you have a photographic memory — not bragging, just... true.',
  },

  'host-forgot-breakfast': {
    text: `Meanwhile I forgot what I had for breakfast.`,
    voice: 'host',
    scene: 'scene-7-mission-control',
    duration_est: 3,
    direction: 'Self-deprecating punchline. Tired, amused, relatable.',
  },

  // ─── SCENE 8: DASHBOARD TOUR (9:00–10:00) ────────────────────────────────
  'tour-narration': {
    text: `Now let me show you the full dashboard. Eighteen views. Every aspect of the sprint, visible in one tool.

This is what sprint transparency actually looks like. Not a spreadsheet. Not a Jira board. A living, breathing system that both AIs update in real time and the PO can review in four minutes over coffee.`,
    voice: 'host',
    scene: 'scene-8-dashboard-tour',
    duration_est: 20,
    direction: 'Fast-paced, energetic. This is a montage — the voice should match the visual pace. Proud but not arrogant.',
  },

  // ─── SCENE 9: THE NUMBERS (10:00–10:45) ──────────────────────────────────
  'numbers-narration': {
    text: `Let's talk numbers.

5x faster. Conservatively. This isn't a claim. This is a dashboard you can query.`,
    voice: 'host',
    scene: 'scene-9-numbers',
    duration_est: 10,
    direction: 'Confident. "5x faster" should land with weight. "This is a dashboard you can query" is the credibility line — deliver it clean.',
  },

  // ─── SCENE 10: WHAT'S NEXT (10:45–11:30) ─────────────────────────────────
  'whats-next-narration': {
    text: `While we were building dashboards and governance tools, Atlas quietly built language support for 45+ languages across 5 regional zones.

Seven Arabic dialects. Twenty-two Indian languages. Ten African languages. In a traditional team, that's a quarter-long initiative. Atlas treated it as a Tuesday.

Now, what's coming. MCP integration. When we flip that switch, the sprint tracker stops being a tool you use and starts being a tool that updates itself.

And self-learning capacity planning. After enough sprints, the system will tell you: this 80-story backlog will take 6 sprints, not 4. Scope accordingly.`,
    voice: 'host',
    scene: 'scene-10-whats-next',
    duration_est: 35,
    direction: 'Awe on the language numbers — genuine amazement. "Atlas treated it as a Tuesday" is a highlight comedy line. Visionary energy for MCP section.',
  },

  'atlas-language-foundational': {
    text: `Language infrastructure should be foundational, not an afterthought.`,
    voice: 'atlas',
    scene: 'scene-10-whats-next',
    duration_est: 4,
    direction: 'Principled. This is Atlas\'s worldview — infrastructure first. Said like a thesis defense.',
  },

  'atlas-data-quality': {
    text: `The data quality of sprint artifact logging today directly determines prediction accuracy in future sprints.`,
    voice: 'atlas',
    scene: 'scene-10-whats-next',
    duration_est: 6,
    direction: 'Technical but important. Atlas is making a point about long-term thinking.',
  },

  'host-atlas-said': {
    text: `What Atlas said. Just... said more like a human.`,
    voice: 'host',
    scene: 'scene-10-whats-next',
    duration_est: 4,
    direction: 'Affectionate eye-roll. The "..." pause is key — slight exhale before "said more like a human."',
  },

  // ─── SCENE 11: CLOSE (11:30–12:00) ───────────────────────────────────────
  'close-takeaway': {
    text: `So. What's the honest takeaway?

AI-augmented development is real. It's fast. It's not magic.

It requires structure, governance, and a human in the loop who actually makes decisions.

The backlog reviews that used to take two hours? Atlas pre-triages them. The standups where everyone says "still in progress"? The tracker already knows. The sprint planning debates about story points? Nova generates estimates in seconds — which you then argue about for twenty minutes instead of forty.

Progress.

We're going to keep building this in public. The wins, the blockers, the moments where an AI confidently does exactly the wrong thing.

Because that's what building actually looks like. And honestly? It's pretty great.

Next episode: we finish the sprint. Or most of it. See you then.`,
    voice: 'host',
    scene: 'scene-11-close',
    duration_est: 45,
    direction: 'This is the emotional landing. Start reflective. "Progress" is a one-word paragraph — let it breathe. Build warmth through the "building in public" section. End with genuine optimism. "See you then" is casual, warm, like saying goodbye to a friend.',
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
export function getVoiceScriptKeys(voice: 'host' | 'atlas' | 'nova'): string[] {
  return Object.entries(EP04_SCRIPT_CONTENT)
    .filter(([_, line]) => line.voice === voice)
    .map(([key]) => key);
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
