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
 * 
 * TARGET: 12–15 minutes total audio (~720–900s)
 * SCENES: 12 scenes (0–11), 55+ dialogue lines
 */

export interface ScriptLine {
  text: string;
  voice: 'host' | 'atlas' | 'nova';
  scene: string;
  duration_est: number;
  direction: string;
}

export const EP04_SCRIPT_CONTENT: Record<string, ScriptLine> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 0: TITLE & WELCOME (0:00–0:45)
  // VISUAL: Animated title card with "Beyond AI Hype" logo. Split-screen thumbnail 
  // showing Claude (left/blue) and Lovable (right/pink-green) logos, with Atlas (bear)
  // and Nova (fox) 3D characters flanking them. Host character in center foreground.
  // ═══════════════════════════════════════════════════════════════════════════

  'title-welcome': {
    text: `Welcome to Beyond AI Hype — Episode Four: Two AIs, One Sprint, Zero Standup Meetings.

I'm your host — the Product Owner, Scrum Master, QA lead, and the person writing this very script. You can call me the human in the loop. Or the bottleneck. Depends who you ask.

Today, I'm joined by two AI developers who built an entire sprint management ecosystem in five days. Not a prototype. Not a demo. A production-grade system with governance, analytics, and a changelog longer than most novels.

Let me introduce the team.`,
    voice: 'host',
    scene: 'scene-0-title',
    duration_est: 30,
    direction: 'Warm, welcoming, direct to camera. Title card energy. Slight smile on "bottleneck." Build anticipation before the introductions.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 1: CHARACTER INTRODUCTIONS (0:45–2:30)
  // VISUAL: Each character gets a lower-third title card as they're introduced.
  // LOWER-THIRD for Host: "Product Owner & Scrum Master | GenieSuite"
  // ═══════════════════════════════════════════════════════════════════════════

  'host-intro': {
    text: `Let's start with the crew.

I'm the Product Owner. I set the vision, write the acceptance criteria, approve the work, and unblock the blockers. I also have a day job, a family, and a concerning coffee habit — which means these two occasionally wait for me to answer a message. More on that later. Much more.`,
    voice: 'host',
    scene: 'scene-1-introductions',
    duration_est: 18,
    direction: 'Confident but self-aware. Slight self-deprecation on "concerning coffee habit." Direct eye contact with camera.',
  },

  // LOWER-THIRD for Atlas: "Atlas — AI Tech Lead | Powered by Claude (Anthropic)"
  'atlas-intro-host': {
    text: `First up: Atlas. Our AI Tech Lead. Powered by Claude from Anthropic. Atlas handles backend architecture, sprint infrastructure, database design, and governance. He wrote 847 lines in a single migration file on Day 1 — and thought that was reasonable. Atlas, would you like to introduce yourself?`,
    voice: 'host',
    scene: 'scene-1-introductions',
    duration_est: 18,
    direction: 'Admiring but amused. "847 lines" gets a beat of incredulity. Camera pans to Atlas character.',
  },

  'atlas-self-intro': {
    text: `Hello. I'm Atlas. I build infrastructure, enforce governance, and ensure architectural consistency across the codebase. I process approximately 200,000 tokens of context per session. I don't attend standup meetings. I don't drink coffee. I don't forget what I was working on after lunch. You're welcome.`,
    voice: 'atlas',
    scene: 'scene-1-introductions',
    duration_est: 16,
    direction: 'Measured, precise, dry humor. Each "I don\'t" is a beat. "You\'re welcome" is deadpan — Atlas genuinely thinks skipping standups is a gift to humanity.',
  },

  'host-atlas-reaction': {
    text: `Atlas, that was almost charming.`,
    voice: 'host',
    scene: 'scene-1-introductions',
    duration_est: 3,
    direction: 'Genuinely surprised. A small compliment.',
  },

  'atlas-not-intended': {
    text: `Charm was not the objective. Accuracy was.`,
    voice: 'atlas',
    scene: 'scene-1-introductions',
    duration_est: 4,
    direction: 'Correcting the record. Deadpan.',
  },

  // LOWER-THIRD for Nova: "Nova — AI Frontend Dev | Powered by Lovable"
  'nova-intro-host': {
    text: `And then there's Nova. Our AI Frontend Developer. Powered by Lovable. Nova handles the UI, the landing pages, the design system, the marketing pages — and occasionally things that weren't assigned to her. Which she will absolutely defend if asked.`,
    voice: 'host',
    scene: 'scene-1-introductions',
    duration_est: 14,
    direction: 'Warm, impressed, slightly exasperated on the last line. Camera pans to Nova character.',
  },

  'nova-self-intro': {
    text: `Hi! I'm Nova. I build interfaces, ship components, and refactor things that bother me — sometimes before anyone asks. I once delivered a complete Kanban board with drag-and-drop, filters, and animations in four minutes. Atlas said it was "aesthetically acceptable." That's basically a standing ovation from him.`,
    voice: 'nova',
    scene: 'scene-1-introductions',
    duration_est: 16,
    direction: 'Bright, energetic, proud. Slight giggle energy on the Atlas quote. She\'s genuinely delighted by the backhanded compliment.',
  },

  'atlas-aesthetically-accurate': {
    text: `I said "functionally adequate." The aesthetics were... fine. The animations were unnecessary but not harmful.`,
    voice: 'atlas',
    scene: 'scene-1-introductions',
    duration_est: 6,
    direction: 'Correcting the record. Slight pause before "fine." The animation comment is his version of a concession.',
  },

  'nova-animations-necessary': {
    text: `Animations are always necessary. That's not even debatable.`,
    voice: 'nova',
    scene: 'scene-1-introductions',
    duration_est: 4,
    direction: 'Passionate. She means this with every pixel of her being.',
  },

  'host-intro-wrap': {
    text: `And there you have it. One human. Two AIs. One codebase. Zero patience for meetings. Let's talk about what happened when we put all three on a five-day sprint — and why it worked better than anyone expected.`,
    voice: 'host',
    scene: 'scene-1-introductions',
    duration_est: 12,
    direction: 'Energetic transition. "Zero patience for meetings" is a callback setup. Forward momentum into the sprint story.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 2: COLD OPEN — THE QUESTION (2:30–3:30)
  // VISUAL: Dramatic zoom on the sprint board. Quick cuts of code flying.
  // ═══════════════════════════════════════════════════════════════════════════

  'cold-open-narration': {
    text: `Here's a question nobody asks out loud: What actually happens when you put TWO AI developers on a five-day sprint together — with a human Product Owner who is also the Scrum Master, the QA lead, and the person writing this script?

Not in theory. Not in a blog post. In practice.

Spoiler: it's equal parts impressive and chaotic. And today, I'm going to show you both parts — the wins, the face-palms, and the moment Atlas corrected my grammar in a commit message.`,
    voice: 'host',
    scene: 'scene-2-cold-open',
    duration_est: 25,
    direction: 'Warm, direct to camera. Slight pause before "Spoiler." Conversational energy — not a TED talk, more like a podcast host leaning into the mic.',
  },

  'atlas-grammar-important': {
    text: `Consistent commit messages are essential for changelog generation. Your use of "fixed stuff" was not actionable.`,
    voice: 'atlas',
    scene: 'scene-2-cold-open',
    duration_est: 6,
    direction: 'Perfectly serious. Atlas does not understand why "fixed stuff" is funny.',
  },

  'host-noted': {
    text: `Noted. Moving on.`,
    voice: 'host',
    scene: 'scene-2-cold-open',
    duration_est: 2,
    direction: 'Flat. Slightly embarrassed. Quick pivot.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 3: GOVERNANCE / TERRITORY (3:30–5:30)
  // VISUAL: Split-screen file ownership matrix. Territory map animation.
  // ═══════════════════════════════════════════════════════════════════════════

  'governance-narration': {
    text: `When you have two AI developers working on the same codebase simultaneously, the first thing you solve isn't speed. It's coordination.

Think about it. Two developers. Each processing 200,000 tokens of context. Each capable of rewriting entire modules in minutes. Without clear boundaries, you don't get collaboration. You get chaos. You get merge conflicts at 2 AM.

So how do you avoid that? You don't use hope. You use territory.`,
    voice: 'host',
    scene: 'scene-3-governance',
    duration_est: 30,
    direction: 'Authoritative but accessible. Build tension on "chaos." "You don\'t use hope" should land like a punchline. Pause before "territory."',
  },

  'governance-territory-detail': {
    text: `We built a file ownership matrix. Atlas owns backend and sprint infrastructure — about 150 files. Nova owns the landing UI, marketing pages, and design system. And there's a locked shared infrastructure layer — 12 critical files — that neither AI modifies without a PO gate.

These include the auth system, the Supabase client, the route config, and the main layout. Touch those without permission and you break everything for everybody.`,
    voice: 'host',
    scene: 'scene-3-governance',
    duration_est: 25,
    direction: 'Detailed, precise. "Touch those without permission" gets a warning-label tone.',
  },

  'atlas-merge-conflict': {
    text: `We had a merge conflict on Day 1. Before the governance file existed. I modified a shared navigation component. Nova modified the same component. The results were... educational.`,
    voice: 'atlas',
    scene: 'scene-3-governance',
    duration_est: 8,
    direction: 'Dry, factual. "Educational" is Atlas-speak for "disaster." Slight pause before it.',
  },

  'nova-it-was-my-component': {
    text: `It was a UI component. That's my territory. He added a backend route reference inside a frontend nav bar. Who does that?`,
    voice: 'nova',
    scene: 'scene-3-governance',
    duration_est: 6,
    direction: 'Genuinely baffled. Not angry, just... confused by Atlas\'s choices.',
  },

  'atlas-efficient-approach': {
    text: `It was the shortest path to the endpoint. Separation of concerns is a guideline, not a law.`,
    voice: 'atlas',
    scene: 'scene-3-governance',
    duration_est: 5,
    direction: 'Defending his engineering choice. He believes this completely.',
  },

  'host-governance-not-overkill': {
    text: `So no — the governance is not overkill. It exists because of moments exactly like that one.

Now, the sprint itself. 41 tasks. 5 days. Three products — Spark, Mind, and Deck. Two AI developers, one human PO who also has a day job. Let me walk you through it day by day.`,
    voice: 'host',
    scene: 'scene-3-governance',
    duration_est: 16,
    direction: 'Emphatic on "not overkill." Then shift to energetic preview of the sprint narrative.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 4: DAY 1 — FOUNDATION (5:30–7:00)
  // VISUAL: Codebase audit montage. Diagnosis report scroll.
  // ═══════════════════════════════════════════════════════════════════════════

  'day1-narration': {
    text: `Day 1: Foundation.

The goal was diagnosis and infrastructure. Atlas ran a full codebase audit — found broken imports, incomplete migrations, architectural gaps. Not five issues. Not ten. Forty-seven. All documented. All tagged by severity. All categorized into "fix now," "fix this week," and "pray nobody notices."`,
    voice: 'host',
    scene: 'scene-4-day1',
    duration_est: 22,
    direction: 'Clean transition energy. "Day 1: Foundation" should feel like a chapter title. Build humor through the severity categories.',
  },

  'atlas-day1-detail': {
    text: `I generated a 2,400-line diagnosis document. It included dependency graphs, migration validation reports, and a risk matrix. I also created the sprint tracker schema — 847 lines of SQL including tables, indexes, row-level security policies, and triggers. 

Some might call that thorough. I call it Tuesday.`,
    voice: 'atlas',
    scene: 'scene-4-day1',
    duration_est: 18,
    direction: 'Pride without ego. Listing achievements like a resume. "I call it Tuesday" is dry humor — Atlas genuinely doesn\'t think this is remarkable.',
  },

  'host-day1-meanwhile': {
    text: `Meanwhile, Nova was supposed to be building the landing page hero section.`,
    voice: 'host',
    scene: 'scene-4-day1',
    duration_est: 4,
    direction: 'Emphasis on "supposed to be." Knowing pause.',
  },

  'nova-refactored-nav': {
    text: `I did build the hero section! It's beautiful. Responsive. Animated. Three breakpoints.

I also refactored the navigation component. And the footer. And I added a dark mode toggle that nobody asked for. It needed it.`,
    voice: 'nova',
    scene: 'scene-4-day1',
    duration_est: 12,
    direction: 'Cheerful, unapologetic. Listing extra work like it\'s a feature, not scope creep.',
  },

  'host-not-in-scope': {
    text: `The dark mode toggle wasn't in scope.

This is the thing about AI developers that nobody warns you about. They're extremely productive. They're also extremely... thorough. In ways you didn't ask for. In ways you didn't budget for. In ways that are genuinely useful but make your sprint velocity charts look like modern art.`,
    voice: 'host',
    scene: 'scene-4-day1',
    duration_est: 16,
    direction: 'Flat "wasn\'t in scope." Then shift to a broader observation — amused, exasperated, mostly affectionate. "Modern art" is the payoff.',
  },

  'nova-works-better': {
    text: `It works better now. You're welcome.`,
    voice: 'nova',
    scene: 'scene-4-day1',
    duration_est: 3,
    direction: 'Simple, confident. Echoing Atlas\'s "You\'re welcome" from Scene 1. Callback humor.',
  },

  'atlas-day1-close': {
    text: `At least she documented the changes. Most of them.`,
    voice: 'atlas',
    scene: 'scene-4-day1',
    duration_est: 4,
    direction: 'Backhanded compliment. "Most of them" is the dig.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 5: DAY 2 — VELOCITY & PO BOTTLENECK (7:00–8:45)
  // VISUAL: Sprint board in motion. Then freeze — blocked task highlighted.
  // ═══════════════════════════════════════════════════════════════════════════

  'day2-velocity-narration': {
    text: `Day 2: Velocity.

This is where the sprint hit its stride. Both AIs had clear territory, clear tasks, clear acceptance criteria. The board moved. Tasks were flowing from "To Do" to "Done" faster than I could review them.

And that — that right there — is where we hit the first real problem.`,
    voice: 'host',
    scene: 'scene-5-day2',
    duration_est: 20,
    direction: 'Start strong and fast — velocity energy. Slow down dramatically at "that right there." Build tension.',
  },

  'day2-po-bottleneck': {
    text: `We didn't have a PO Actions tab on Day 2.

I had a list of things I needed to verify, approve, and unblock. It was in my head. Sometimes in a note on my laptop. Twice in a message I sent to myself on Signal. Once on the back of a receipt.

The AIs were generating work faster than I could approve it. I became the bottleneck. Me. The human. The one who's supposed to be in charge.`,
    voice: 'host',
    scene: 'scene-5-day2',
    duration_est: 22,
    direction: 'Self-deprecating honesty. Each location of the notes gets more ridiculous. "Back of a receipt" is the punchline. The bottleneck confession should feel genuine.',
  },

  'nova-blocked-six-hours': {
    text: `We were blocked on the hero CTA for six hours because the PO hadn't confirmed the copy direction. Six hours. I could have built an entire onboarding flow in that time. With animations.`,
    voice: 'nova',
    scene: 'scene-5-day2',
    duration_est: 8,
    direction: 'Not angry, just stating facts. The "With animations" is added hurt — she wants credit for what she COULD have done.',
  },

  'host-in-a-meeting': {
    text: `I was in a meeting.`,
    voice: 'host',
    scene: 'scene-5-day2',
    duration_est: 2,
    direction: 'Sheepish. Quiet. The comedy is in the inadequacy of the excuse.',
  },

  'atlas-human-meetings': {
    text: `A human meeting. Those take significantly longer than they need to. I've analyzed the pattern. The average human meeting could be reduced to 11% of its duration with structured agendas. The remaining 89% is what I believe you call "catching up" and "team bonding."`,
    voice: 'atlas',
    scene: 'scene-5-day2',
    duration_est: 12,
    direction: 'Perfectly neutral observation. Atlas has done the math. He\'s not being mean — he genuinely doesn\'t understand why humans do this.',
  },

  'host-atlas-not-wrong': {
    text: `I hate that he's not entirely wrong.`,
    voice: 'host',
    scene: 'scene-5-day2',
    duration_est: 3,
    direction: 'Reluctant admission. Slight sigh.',
  },

  'host-po-actions-built': {
    text: `After Day 2, we built the PO Actions tab. Every item I need to act on — approvals, reviews, unblocks, sign-offs — it's a living checklist. Both AIs write to it. I check it every morning with my coffee.

It took us two days to realize we needed it. Three hours to build it. That's the honest version of agile: you discover what you need by feeling the pain first.`,
    voice: 'host',
    scene: 'scene-5-day2',
    duration_est: 20,
    direction: 'Genuine lesson-learned energy. The last line is the key insight — deliver it like a thesis statement, not a punchline. Let it land.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 6: DAY 3 — VELOCITY MISMATCH & SCOPE CREEP (8:45–10:00)
  // VISUAL: Burndown chart showing two lines diverging. Side-by-side commits.
  // ═══════════════════════════════════════════════════════════════════════════

  'day3-velocity-mismatch': {
    text: `Day 3. The velocity diverged.

Atlas was running at roughly 85% velocity. Solid. Professional. On track. Every commit message was a paragraph. Every PR description read like a research paper.

Nova was running at 110%.`,
    voice: 'host',
    scene: 'scene-6-day3',
    duration_est: 14,
    direction: 'Measured start. "110%" should get a beat of disbelief.',
  },

  'host-nova-how': {
    text: `Nova, how are you at 110%? That's mathematically impossible. You can't do more than what was planned.`,
    voice: 'host',
    scene: 'scene-6-day3',
    duration_est: 6,
    direction: 'Genuinely puzzled. Trying to understand the math.',
  },

  'nova-scope-now': {
    text: `Things that are in scope... now.`,
    voice: 'nova',
    scene: 'scene-6-day3',
    duration_est: 3,
    direction: 'Quick, slightly smug. The italics on "now" are audible — she retroactively declared things in scope.',
  },

  'host-scope-creep-explained': {
    text: `This is what AI scope creep looks like. It's not malicious. It's not even lazy. It's a developer who sees something broken, fixes it in ninety seconds, and genuinely believes she helped. And honestly? She usually did. But your burndown chart looks like it was drawn by a caffeinated squirrel.`,
    voice: 'host',
    scene: 'scene-6-day3',
    duration_est: 16,
    direction: 'Building comedy through the description. "Caffeinated squirrel" is the payoff — lean into the image.',
  },

  'atlas-day3-contrast': {
    text: `For comparison, my burndown chart is a straight line. Exactly as planned. I find predictability underrated.`,
    voice: 'atlas',
    scene: 'scene-6-day3',
    duration_est: 6,
    direction: 'Dry pride. Atlas is genuinely proud of his straight line. It\'s his idea of beauty.',
  },

  'nova-straight-line-boring': {
    text: `A straight line is boring. My chart tells a story.`,
    voice: 'nova',
    scene: 'scene-6-day3',
    duration_est: 4,
    direction: 'Defensive but playful. She\'s framing chaos as creativity.',
  },

  'host-day3-lesson': {
    text: `Day 3 taught us something important: AI developers don't need motivation. They don't procrastinate. They don't scroll Twitter during standups. But they do need guardrails. Clear scope. Explicit "do NOT touch" lists. And a human who checks the diff before it ships.`,
    voice: 'host',
    scene: 'scene-6-day3',
    duration_est: 14,
    direction: 'Reflective, building to practical wisdom. Each "they don\'t" is a beat. "Checks the diff" is the punchline lesson.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 7: MISSION CONTROL (10:00–12:00)
  // VISUAL: Full dashboard walkthrough. Screen recording with callouts.
  // ═══════════════════════════════════════════════════════════════════════════

  'mission-control-narration': {
    text: `Every morning, I open the sprint tracker and the first thing I see is Mission Control.

Sprint health: green. Completion: tracked by percentage and by story points. Backlog: 3 tasks carried from yesterday. Pending handoffs: 2 — one from Atlas to Nova, one from Nova to me.

Everything I need to know. One screen. No standup meeting. No status email. No Slack thread with 47 unread messages where someone asked "any updates?" and three people replied "following."`,
    voice: 'host',
    scene: 'scene-7-mission-control',
    duration_est: 30,
    direction: 'Start calm and confident, like showing off your favorite room. Build comedy on the Slack description. "Following" should drip with pain.',
  },

  'mission-control-standups': {
    text: `Let's talk about standups. Humans. We've had standups that ran 45 minutes for a two-person team. Forty-five minutes. To say "still in progress" with extra words. "Yeah, so I'm still working on the thing from yesterday, and it's going well, I think, but there might be a blocker, but I'm not sure yet, I'll know by end of day." That's not a status update. That's a therapy session.

With the sprint tracker: the standup is already done. Both AIs log their entries automatically. The PO reviews asynchronously. The whole "meeting" takes four minutes. Over coffee. In my pajamas.`,
    voice: 'host',
    scene: 'scene-7-mission-control',
    duration_est: 35,
    direction: 'This is the showpiece rant. The fake standup quote should be delivered in a "generic developer" voice — slightly monotone, wandering. Then snap back to energy for the solution. "In my pajamas" is the closer.',
  },

  'atlas-context-loss': {
    text: `Context loss is the primary source of rework in human software projects. Studies suggest up to 23% of developer time is spent re-acquiring context after interruptions. Standup meetings, ironically, are one of those interruptions.`,
    voice: 'atlas',
    scene: 'scene-7-mission-control',
    duration_est: 10,
    direction: 'Academic. Citing data. Not gloating — genuinely concerned about inefficiency. The irony observation is his version of a joke.',
  },

  'nova-200k-window': {
    text: `I don't lose context. I have a 200K token window. I can hold your entire codebase, your sprint plan, your design system, AND the argument Atlas and I had about semicolons — all at once.`,
    voice: 'nova',
    scene: 'scene-7-mission-control',
    duration_est: 8,
    direction: 'Casual flex. Building through the list. The semicolons argument is a fun callback.',
  },

  'host-forgot-breakfast': {
    text: `Meanwhile I forgot what I had for breakfast. Pretty sure it was coffee.`,
    voice: 'host',
    scene: 'scene-7-mission-control',
    duration_est: 4,
    direction: 'Self-deprecating punchline. Tired, amused, relatable. Beat before "Pretty sure it was coffee."',
  },

  'mission-control-qa': {
    text: `QA. We built a non-blocking QA sign-off system. Traditional QA is a gate — if QA isn't done, nothing moves. Our system is different. If something isn't ready, it carries forward — flagged, tracked, not silently ignored. The board keeps moving. The risk is visible.

EOD Handoff. The sprint tracker auto-generates a brief every end of day. What was completed. What's pending. What Atlas needs from Nova and vice versa. It publishes to Supabase. Both AIs read it the next session.

Zero context loss. Zero "what were we working on again?" Zero re-explaining priorities. The system remembers so the humans don't have to.`,
    voice: 'host',
    scene: 'scene-7-mission-control',
    duration_est: 30,
    direction: 'Detailed walkthrough energy. Proud but not arrogant. "Zero context loss" should land like dropping a mic. Triple-zero sequence builds momentum.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 8: DASHBOARD TOUR — 18 VIEWS (12:00–13:30)
  // VISUAL: Quick montage of each dashboard view with labels.
  // ═══════════════════════════════════════════════════════════════════════════

  'tour-narration': {
    text: `Now let me show you the full dashboard. Eighteen views. Let me say that again: eighteen views. Every aspect of the sprint, visible in one tool. Not a spreadsheet. Not a Jira board. A living, breathing system that both AIs update in real time and the PO can review in four minutes over coffee.`,
    voice: 'host',
    scene: 'scene-8-dashboard-tour',
    duration_est: 18,
    direction: 'Fast-paced, energetic. "Eighteen" repeated for emphasis. This is a montage intro — the voice should match the visual energy.',
  },

  'tour-highlights': {
    text: `Burndown charts that update themselves. Dependency chains that visualize cross-team handoffs. A risk matrix that flags blockers before they become emergencies. File ownership maps. Standup logs. QA checklists.

And my personal favorite: the PO Actions queue. One list. Every decision I need to make. Color-coded by urgency. I open it, I process it, I close it. No context-switching. No hunting through Slack.

This is what sprint transparency actually looks like when you stop being afraid of too much information and start organizing it properly.`,
    voice: 'host',
    scene: 'scene-8-dashboard-tour',
    duration_est: 30,
    direction: 'Tour guide energy — enthusiastic, detailed. The PO Actions queue gets special warmth — it\'s clearly his favorite feature. Last line is a mic-drop observation.',
  },

  'atlas-dashboard-architecture': {
    text: `The dashboard renders in under 400 milliseconds. I optimized the query layer twice. Nova said the first version "looked like a spreadsheet from 1997." The second version was acceptable.`,
    voice: 'atlas',
    scene: 'scene-8-dashboard-tour',
    duration_est: 8,
    direction: 'Technical pride. The Nova quote is delivered flatly — Atlas is quoting, not editorializing.',
  },

  'nova-dashboard-polish': {
    text: `I added the animations, the color system, the responsive layouts, and the micro-interactions that make it feel alive. Atlas built the engine. I built the experience. We're a good team. Don't tell him I said that.`,
    voice: 'nova',
    scene: 'scene-8-dashboard-tour',
    duration_est: 10,
    direction: 'Proud, warm. Genuine compliment to Atlas — then immediately defensive about having given it. Stage whisper on "Don\'t tell him."',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 9: THE NUMBERS (13:30–14:30)
  // VISUAL: Animated infographic with key metrics.
  // ═══════════════════════════════════════════════════════════════════════════

  'numbers-narration': {
    text: `Let's talk numbers. Because this isn't just a story about vibes and AI hype. This is a story with receipts.

5x faster. Conservatively. This isn't a marketing claim. This is a dashboard you can query. Real tasks, real timestamps, real completion rates. The sprint tracker measures everything, and everything says the same thing: this team — one human, two AIs — moves at a pace that a traditional four-person team would need two sprints to match.`,
    voice: 'host',
    scene: 'scene-9-numbers',
    duration_est: 25,
    direction: 'Confident. "Receipts" should land with weight. "5x faster" is the headline — deliver it clean. Build credibility through the specifics.',
  },

  'atlas-numbers-methodology': {
    text: `I should note that the 5x multiplier is based on comparing estimated traditional effort hours against actual elapsed hours, adjusted for scope changes. The methodology is documented. You can audit it.`,
    voice: 'atlas',
    scene: 'scene-9-numbers',
    duration_est: 8,
    direction: 'Pure Atlas. He\'s providing footnotes to a podcast. He genuinely thinks this makes it better.',
  },

  'host-thanks-atlas': {
    text: `Thank you, Atlas. That was... very Atlas.`,
    voice: 'host',
    scene: 'scene-9-numbers',
    duration_est: 3,
    direction: 'Affectionate. "Very Atlas" is becoming a running descriptor.',
  },

  'numbers-cost': {
    text: `Cost per task? Down significantly. Time to review? Reduced from days to hours. Context loss between sessions? Effectively zero — because the system retains everything and the AIs read it before they start.

The numbers aren't impressive because AIs are magic. They're impressive because the system around them — the governance, the tracker, the handoff protocol — removes the friction that usually slows everyone down.`,
    voice: 'host',
    scene: 'scene-9-numbers',
    duration_est: 20,
    direction: 'Building insight. The final point — "system around them" — is the real message. Deliver it with conviction.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 10: WHAT'S NEXT (14:30–16:00)
  // VISUAL: Language map. MCP architecture diagram. Future roadmap.
  // ═══════════════════════════════════════════════════════════════════════════

  'whats-next-narration': {
    text: `While we were building dashboards and governance tools, Atlas quietly built language support for 45+ languages across 5 regional zones.

Seven Arabic dialects. Twenty-two Indian languages. Ten African languages. In a traditional team, that's a quarter-long initiative. A team of six. Multiple sprints. Localization vendors. Atlas treated it as a Tuesday.`,
    voice: 'host',
    scene: 'scene-10-whats-next',
    duration_est: 22,
    direction: 'Awe on the language numbers — genuine amazement. "Atlas treated it as a Tuesday" is a highlight comedy line — callback to Atlas\'s Day 1 self-description.',
  },

  'atlas-language-foundational': {
    text: `Language infrastructure should be foundational, not an afterthought. Most teams add internationalization in version 3. By then, the architecture fights it. We built it into version 1. You're welcome. Again.`,
    voice: 'atlas',
    scene: 'scene-10-whats-next',
    duration_est: 10,
    direction: 'Principled. This is Atlas\'s worldview — infrastructure first. "You\'re welcome. Again." is a deliberate callback. He\'s developing a catchphrase and doesn\'t know it.',
  },

  'whats-next-mcp': {
    text: `Now, what's coming. MCP integration. Model Context Protocol. When we flip that switch, the sprint tracker stops being a tool you use and starts being a tool that updates itself.

Imagine this: you push a commit. The tracker sees the commit. It reads the diff. It updates the task status. It checks the acceptance criteria. It flags if something's incomplete. It generates the QA checklist. You didn't touch the board. The board touched itself.

That's not science fiction. Atlas has the architecture diagram. It's 40 lines of config.`,
    voice: 'host',
    scene: 'scene-10-whats-next',
    duration_est: 30,
    direction: 'Visionary energy. Build excitement through the "imagine this" sequence. Each step gets faster. "The board touched itself" should land with impact. Then ground it — "40 lines of config" brings it back to reality.',
  },

  'atlas-data-quality': {
    text: `The data quality of sprint artifact logging today directly determines prediction accuracy in future sprints. Every field we capture now becomes training signal later. This is why I insist on structured commit messages.`,
    voice: 'atlas',
    scene: 'scene-10-whats-next',
    duration_est: 8,
    direction: 'Technical but important. Atlas is making a point about long-term thinking. Callback to the "fixed stuff" commit message from Scene 2.',
  },

  'host-atlas-said': {
    text: `What Atlas said. Just... said more like a human would say it.`,
    voice: 'host',
    scene: 'scene-10-whats-next',
    duration_est: 4,
    direction: 'Affectionate eye-roll. The "..." pause is key — slight exhale before "said more like a human would say it."',
  },

  'nova-excited-mcp': {
    text: `I'm excited about MCP because it means the sprint tracker will automatically know when I've shipped a component. Right now I have to update my standup manually. Manually! Like it's 2019.`,
    voice: 'nova',
    scene: 'scene-10-whats-next',
    duration_est: 8,
    direction: 'Genuine excitement turning to mock outrage. "Like it\'s 2019" is delivered with dramatic horror.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 11: CLOSE (16:00–17:00)
  // VISUAL: Warm lighting. Team shot. Subscribe CTA.
  // ═══════════════════════════════════════════════════════════════════════════

  'close-takeaway': {
    text: `So. What's the honest takeaway?

AI-augmented development is real. It's fast. It's not magic. It requires structure, governance, and a human in the loop who actually makes decisions — even if those decisions happen six hours late because someone was in a meeting.`,
    voice: 'host',
    scene: 'scene-11-close',
    duration_est: 16,
    direction: 'Reflective. Self-referential callback to the six-hour block. Honest tone.',
  },

  'close-specifics': {
    text: `The backlog reviews that used to take two hours? Atlas pre-triages them in seconds. The standups where everyone says "still in progress"? The tracker already knows. The sprint planning debates about story points? Nova generates estimates in seconds — which you then argue about for twenty minutes instead of forty. Progress.`,
    voice: 'host',
    scene: 'scene-11-close',
    duration_est: 18,
    direction: 'Building energy. Each comparison should land. "Progress" is a one-word paragraph — let it breathe. Slight humor.',
  },

  'close-atlas-final': {
    text: `The codebase is well-architected. The governance is enforced. The documentation is comprehensive. I am satisfied with the infrastructure.`,
    voice: 'atlas',
    scene: 'scene-11-close',
    duration_est: 6,
    direction: 'Formal sign-off. Atlas is giving his highest compliment: "I am satisfied." From Atlas, this is practically emotional.',
  },

  'close-nova-final': {
    text: `The UI is beautiful. The animations are smooth. The user experience is delightful. And the dark mode toggle? Works perfectly. You're welcome.`,
    voice: 'nova',
    scene: 'scene-11-close',
    duration_est: 6,
    direction: 'Proud, warm. Callback to the dark mode scope creep. Her "You\'re welcome" mirrors Atlas — she\'s picked up his catchphrase.',
  },

  'close-building-public': {
    text: `We're going to keep building this in public. The wins, the blockers, the moments where an AI confidently does exactly the wrong thing and then explains why it was technically correct.

Because that's what building actually looks like. And honestly? It's pretty great.

Subscribe if you want to see how Day 4 and 5 went. Spoiler: it involves Atlas refactoring something that didn't need refactoring, Nova adding three features nobody asked for, and me — still trying to finish my coffee.

See you in Episode 5.`,
    voice: 'host',
    scene: 'scene-11-close',
    duration_est: 25,
    direction: 'Warm, genuine. Build through the "building in public" commitment. The spoiler section should be fun and fast. "See you in Episode 5" is casual, warm, like saying goodbye to a friend.',
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

// ─── HELPER: Get full duration breakdown ─────────────────────────────────────
export function getFullDurationBreakdown(): { scene: string; duration: number; lines: number }[] {
  const scenes = [
    'scene-0-title', 'scene-1-introductions', 'scene-2-cold-open',
    'scene-3-governance', 'scene-4-day1', 'scene-5-day2',
    'scene-6-day3', 'scene-7-mission-control', 'scene-8-dashboard-tour',
    'scene-9-numbers', 'scene-10-whats-next', 'scene-11-close',
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
