# Beyond AI Hype — Episode 4: Video Production Plan

## "Two AIs, One Sprint, Zero Standup Meetings"

**Format:** ~12-minute video | **Tone:** Honest, humorous, technically grounded
**PRODUCED ENTIRELY WITH GENIESUITE** — Spark + Mind + Deck + Cast

---

## WHY THIS VIDEO IS SPECIAL

This is the **ultimate dogfood test**. We're using our own tools — GenieSpark, GenieMind, GenieDeck, and GenieCast — to create a video *about* those tools building themselves in a sprint. The video explains the sprint process while simultaneously demonstrating what the platform can do.

If the tools work well enough to tell their own story, they work.

---

## PRODUCTION PIPELINE: How We Build This With Our Own Tools

### Phase 1: Script → GenieSpark
| Step | Pipeline | Input | Output |
|------|----------|-------|--------|
| 1a | `script-generation` | This production plan (markdown) | Structured video script with scene breaks |
| 1b | `document-to-script` | Sprint tracker screenshots + CLAUDE.md | Scene narration per dashboard tab |
| 1c | `guided-generation` | Episode 4 podcast script | Enhanced script with visual cues |

### Phase 2: Voice & Audio → GenieMind
| Step | Pipeline | Input | Output |
|------|----------|-------|--------|
| 2a | `tts-generation` (ElevenLabs) | Host narration script | Warm, podcast-style voiceover |
| 2b | `tts-generation` (Azure Neural) | Atlas dialogue lines | Measured, precise AI voice with subtle processing |
| 2c | `tts-generation` (ElevenLabs) | Nova dialogue lines | Bright, faster-delivery AI voice |
| 2d | `music-generation` | Mood: upbeat tech podcast | Background music bed + transitions |
| 2e | `sfx-generation` | UI interaction cues | Click sounds, dashboard transitions, notification pings |

### Phase 3: Visuals → GenieDeck
| Step | Pipeline | Input | Output |
|------|----------|-------|--------|
| 3a | `3d-immersive` (Meshy AI) | Atlas character description | 3D Pixar-style Atlas model (blue/violet theme) |
| 3b | `3d-immersive` (Meshy AI) | Nova character description | 3D Pixar-style Nova model (green/pink theme) |
| 3c | `3d-immersive` (Meshy AI) | Host character description | 3D Pixar-style Host model (warm tones) |
| 3d | `3d-immersive` | Sprint board 3D environment | 3D room with floating task cards, holographic dashboard |
| 3e | `presentation-generation` | Sprint data + metrics | Animated data slides (velocity, burndown, comparison) |
| 3f | `infographic-design` | Territory rules, file ownership | Animated territory map with color zones |
| 3g | `visual-design` | Sprint timeline (Days 1-5) | 3D timeline with milestones |

### Phase 4: Video Assembly → GenieCast
| Step | Pipeline | Style | Output |
|------|----------|-------|--------|
| 4a | `video-generation` | **UGC Avatar 3D Pixar** | Character animation scenes |
| 4b | `video-generation` | **Explainer 3D** | Dashboard walkthrough scenes |
| 4c | `video-generation` | **Motion Graphics** | Data visualization scenes |
| 4d | `avatar-lipsync` | Pixar avatar + TTS audio | Synced character dialogue |
| 4e | `video-editing` | Cinematic tier | Final assembly, transitions, color grading |
| 4f | `thumbnail-generation` | — | YouTube/LinkedIn thumbnails |

---

## CHARACTER DESIGN (3D Pixar Style)

### Atlas — The AI Tech Lead (Claude Code)
- **Visual Style:** 3D Pixar, slightly stylized proportions
- **Appearance:** Geometric, precise features. Blue-violet color palette. Glowing circuitry patterns subtly embedded in clothing. Wire-frame glasses that occasionally display data
- **Personality in motion:** Measured gestures, stands still while speaking, occasionally adjusts glasses when making a point
- **Environment:** Surrounded by floating code blocks and architectural diagrams
- **Voice processing:** Slight reverb, clean EQ — sounds like a calm engineer in a server room

### Nova — The AI Frontend Dev (Lovable)
- **Visual Style:** 3D Pixar, more expressive proportions (bigger eyes, wider gestures)
- **Appearance:** Green-pink gradient color palette. Paint-splash textures on clothing. Holds a stylus or paintbrush that leaves glowing UI trails
- **Personality in motion:** Fast gestures, rarely stands still, occasionally builds UI elements in mid-air while talking
- **Environment:** Surrounded by floating UI components, color swatches, responsive breakpoints
- **Voice processing:** Brighter EQ, slightly compressed — sounds energetic and present

### Host — The Product Owner
- **Visual Style:** 3D Pixar, most realistic proportions of the three
- **Appearance:** Warm earth tones. Business casual. Holds a coffee mug that's perpetually half-empty. Occasionally checks a watch/phone
- **Personality in motion:** Direct-to-camera warmth, self-deprecating shrug, "can you believe this?" looks at the audience
- **Environment:** Sits at a desk between Atlas and Nova's workspaces, surrounded by sticky notes and checklists

---

## SCENE-BY-SCENE PRODUCTION SCRIPT

### SCENE 1: COLD OPEN — "The Question" (0:00–0:45)

**VISUAL APPROACH:** Dark 3D space. Floating text materializes letter by letter.

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| Opening text | GenieDeck `kinetic-typography` | Motion Graphics | "41 tasks. 5 days. 2 AI developers." builds letter by letter |
| 3D environment | GenieDeck `3d-immersive` | Explainer 3D | Dark void with subtle particle field |
| Montage | GenieCast `video-generation` | Motion Graphics | Quick cuts: sprint dashboard, code scrolling, task cards flying |
| Title card | GenieDeck `visual-design` | Motion Graphics | "Beyond AI Hype" logo with 3D depth |

**NARRATION (Host V.O.):**
> Here's a question nobody asks out loud: What actually happens when you put TWO AI developers on a 5-day sprint together — with a human Product Owner who is also the Scrum Master, the QA lead, and the person writing this script?
>
> *(beat)*
>
> Spoiler: it's equal parts impressive and chaotic. And today, I'm going to show you both parts.
>
> Welcome to Beyond AI Hype — where we skip the demos that conveniently work and show you what building with AI actually looks like.

**SCREEN CAPTURES NEEDED:** Sprint dashboard overview (Mission Control), code diff scrolling, task board with cards moving

---

### SCENE 2: MEET THE TEAM — "Three Parties" (0:45–2:45)

**VISUAL APPROACH:** 3D Pixar characters introduced one at a time. Each character's workspace materializes around them as they're introduced.

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| Host character reveal | GenieCast `avatar-3d-pixar` | UGC Avatar 3D Pixar | Host sitting at desk, coffee mug in hand |
| Atlas character reveal | GenieCast `avatar-3d-pixar` | UGC Avatar 3D Pixar | Atlas materializes from code particles |
| Nova character reveal | GenieCast `avatar-3d-pixar` | UGC Avatar 3D Pixar | Nova paints herself into existence with UI brushstrokes |
| PO Actions tab | Screen capture | — | Real `/genie-admin?tab=sprint-tracker` → PO Actions tab |
| Character cards | GenieDeck `visual-design` | Motion Graphics | Lower thirds with name, role, color theme |

**DIALOGUE:**

**HOST:** Before we dive into the sprint, let me introduce the crew. Three parties.

*(Host character gestures warmly to camera)*

First: me. I write the vision, I approve the decisions, I unblock blockers. I also occasionally forget to update the PO checklist and then blame the process.

*(pause — host shrugs, sips coffee)*

It's fine. We built a PO Actions tab specifically so I stop losing things in Signal messages to myself.

**[CUT TO: Screen capture — PO Actions tab showing Verify / Approve / Decide / Unblock categories]**

*(Atlas materializes from swirling code particles, wire-frame glasses glinting)*

Second: Atlas. Our AI tech lead. Atlas owns the backend systems — sprint governance, data architecture, the logic that actually makes everything work. Atlas is the one who writes an 800-line session instruction file at 11 PM and expects everyone to have read it by morning.

**ATLAS:** It was a reasonable expectation.

**HOST:** It was 847 lines, Atlas.

*(Nova paints herself into the scene — literally drawing UI components as she appears)*

Third: Nova. Our AI frontend developer. Nova builds fast. Like, sometimes embarrassingly fast. "Can you add a modal for this?" becomes "done, also refactored the routing, here's a Kanban board" in about four minutes.

**NOVA:** I find waiting suboptimal.

**HOST:** That's the team.

*(direct to camera, serious)*

Now here's the rule that makes this work:

**[VISUAL: 3D text slams into frame — "NOBODY TOUCHES ANYONE ELSE'S FILES."]**

---

### SCENE 3: GOVERNANCE — "Territory" (2:45–4:30)

**VISUAL APPROACH:** 3D territory map. File system visualized as a city — Atlas's district (blue towers), Nova's district (green gardens), locked zone (red fortress).

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| 3D territory map | GenieDeck `3d-immersive` | Explainer 3D | Animated city: blue zone, green zone, red fortress |
| File ownership matrix | Screen capture | — | CLAUDE.md territory rules section |
| Sprint overview graphic | GenieDeck `infographic-design` | Motion Graphics | "41 Tasks / 5 Days / 3 Products / 2 AI Devs / 1 Human" |
| Merge conflict flash | GenieCast `video-generation` | Motion Graphics | Red flash, error animation, then governance file materializing |

**NARRATION:**

**HOST:** When you have two AI developers working on the same codebase simultaneously, the first thing you solve isn't speed. It's coordination.

**[VISUAL: 3D city materializes — two districts being built simultaneously, then CRASH — a merge conflict explosion at the border]**

How do you avoid a merge conflict at 2 AM? You don't use hope. You use territory.

**[VISUAL: Territory map — Atlas zone (blue towers with code windows), Nova zone (green gardens with UI components), locked fortress (red, 12 files)]**

We built a file ownership matrix. Atlas owns backend and sprint infrastructure. Nova owns the landing UI and marketing pages. And there's a locked shared infrastructure layer — 12 critical files — that neither AI modifies without a PO gate.

**[CUT TO: Screen capture — Sprint Charter tab showing roles & responsibilities]**

**ATLAS:** We had a merge conflict on Day 1. Before the governance file existed.

**HOST:** So no — the governance is not overkill.

**[VISUAL: Sprint overview infographic materializes as 3D floating card]**

Now, the sprint itself. 41 tasks. 5 days. Three products — Spark, Mind, and Deck. Two AI developers, one human PO who also has a day job.

**ATLAS:** I read it every session. I wrote it.

**HOST:** Nova, did you read the charter?

**NOVA:** I read the relevant sections. In real time. While building things.

**HOST:** That's... probably fine.

**SCREEN CAPTURES NEEDED:**
- Sprint Charter tab (full view)
- Governance Guide tab (lifecycle flow)
- Territory rules from CLAUDE.md (formatted)

---

### SCENE 4: DAY 1 — "Foundation" (4:30–5:30)

**VISUAL APPROACH:** Calendar page flip to Day 1. Atlas in diagnostic mode — scanning code like a medical CT scan. Nova painting a hero section.

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| Day 1 page | Screen capture | — | Sprint tracker Day 1 view: kickstart + board |
| Atlas scanning | GenieCast `avatar-3d-pixar` | Explainer 3D | Atlas with holographic code audit display |
| Findings view | Screen capture | — | Findings & QA tab grouped by product |
| Nova scope creep | GenieCast `avatar-3d-pixar` | UGC Avatar 3D Pixar | Nova building extra things in background |

**NARRATION:**

**HOST:** Day 1: Foundation.

**[VISUAL: 3D calendar page flips. "DAY 1 — FOUNDATION" materializes]**

**[CUT TO: Screen capture — Day 1 view in sprint tracker: PO/SM Gate + Kickstart + Sprint Board]**

The goal was diagnosis and infrastructure. Atlas ran a full codebase audit — found broken imports, incomplete migrations, architectural gaps. All documented. All tagged by severity.

**[CUT TO: Screen capture — Findings & QA tab showing product-grouped issues with severity badges]**

**[VISUAL: Atlas in 3D, holographic code floating around him, tagging issues red/orange/blue/gray]**

Meanwhile, Nova was supposed to be building the landing page hero section.

**NOVA:** I also refactored the navigation component. It needed it.

**HOST:** It wasn't in scope.

**NOVA:** It works better now.

**HOST:** This is the thing about AI developers that nobody warns you about. They're extremely productive. They're also extremely... thorough. In ways you didn't ask for.

**[VISUAL: Text slams into frame — "Setting acceptance criteria isn't optional. It's survival."]**

---

### SCENE 5: DAY 2 — "Velocity & The PO Bottleneck" (5:30–7:00)

**VISUAL APPROACH:** Sprint board in full motion. Tasks flying from "To Do" to "Done". Then — everything stops. A single task card hangs in mid-air, pulsing red. "Blocked: Waiting on PO."

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| Sprint board motion | Screen capture + 3D overlay | Motion Graphics | Tasks moving across board columns |
| Blocked animation | GenieCast `video-generation` | Explainer 3D | Frozen board, pulsing red task card |
| PO Actions tab | Screen capture | — | Real PO verification checklist |
| Comedy beat | GenieCast `avatar-3d-pixar` | UGC Avatar 3D Pixar | Host checking phone, sticky notes, Signal |

**NARRATION:**

**HOST:** Day 2: Velocity.

**[VISUAL: 3D sprint board — task cards FLYING from To Do → In Progress → Done. Both lanes active. Speed is thrilling.]**

**[CUT TO: Screen capture — Day 2 sprint board with Claude (violet) and Lovable (pink) swimlanes]**

This is where the sprint hit its stride. Both AIs had clear territory, clear tasks, clear acceptance criteria. The board moved.

But — we didn't have a PO Actions tab on Day 2.

**[VISUAL: Everything freezes. One task card hangs in mid-air, pulsing red. Label: "Blocked: Waiting on PO."]**

I had a list of things I needed to verify, approve, and unblock. It was in my head.

**[VISUAL: 3D Host checking pockets, laptop, phone — comedy beat]**

Sometimes in a note on my laptop. Twice in a message I sent to myself on Signal.

**NOVA:** We were blocked on the hero CTA for six hours because the PO hadn't confirmed the copy direction.

**HOST:** I was in a meeting.

**ATLAS:** A human meeting. Those take significantly longer than they need to.

**[CUT TO: Screen capture — PO Actions tab, clean UI: Verify / Approve / Decide / Unblock categories with checkboxes]**

**HOST:** After Day 2, we built the PO Actions tab. Every item I need to act on — it's a living checklist. Both AIs write to it. I check it every morning.

It took us two days to realize we needed it. Three hours to build it.

That's the honest version of agile: you discover what you need by feeling the pain first.

**SCREEN CAPTURES NEEDED:**
- Day 2 sprint board (both developer swimlanes)
- PO Actions tab (all 4 categories)
- A blocked task card detail view

---

### SCENE 6: DAY 3 — "Velocity Mismatch" (7:00–7:30)

**VISUAL APPROACH:** Split-screen 3D — Atlas working methodically (85%), Nova building furiously (110%).

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| Velocity chart | Screen capture + 3D | Motion Graphics | Animated velocity comparison |
| Split screen | GenieCast `video-generation` | UGC Avatar 3D Pixar | Atlas calm vs Nova hyperactive |
| Metrics dashboard | Screen capture | — | Velocity / Metrics tab |

**NARRATION:**

**HOST:** Day 3. Atlas was running at roughly 85% velocity. Solid. Professional. On track.

Nova was running at 110%.

**[VISUAL: Split screen — Atlas calmly placing one code block at a time. Nova surrounded by a tornado of UI components.]**

**[CUT TO: Screen capture — Velocity/Metrics tab showing per-developer completion %, effort hours]**

Nova, how are you at 110%?

**NOVA:** I finished early. So I improved things.

**HOST:** Things that were in scope?

**NOVA:** Things that are in scope *now*.

---

### SCENE 7: MISSION CONTROL — "The Death of the Standup" (7:30–9:00)

**VISUAL APPROACH:** Camera pulls back to reveal the full Mission Control dashboard — 3D holographic display. Then split screen: traditional standup (gray, boring) vs sprint tracker (colorful, instant).

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| Mission Control | Screen capture | — | PO Mission Control tab — full view |
| 3D holographic dashboard | GenieDeck `3d-immersive` | Explainer 3D | Floating metrics, health indicators |
| Split comparison | GenieCast `video-generation` | Motion Graphics | Video call (gray) vs dashboard (vibrant) |
| QA Sign-off | Screen capture | — | QA tab with non-blocking workflow |
| EOD Handoff | Screen capture | — | EOD Auto-Handoff tab with generated brief |
| Standup entries | Screen capture | — | Standup cards (Claude + Lovable side by side) |

**NARRATION:**

**HOST:** Every morning, I open the sprint tracker and the first thing I see is Mission Control.

**[CUT TO: Screen capture — PO Mission Control. Sprint health: green. Completion %. Backlog count. Pending handoffs. Today's tasks by developer.]**

Sprint health: green. Completion: tracked. Backlog: 3 tasks. Pending handoffs: 2.

Everything I need to know. One screen. No standup meeting. No status email. No Slack thread with 47 unread messages.

**[VISUAL: Split screen — Left: gray, boring video call with people saying "still in progress." Right: vibrant Mission Control dashboard, everything already answered.]**

Humans. We've had standups that ran 45 minutes for a two-person team. Forty-five minutes. To say "still in progress" with extra words.

**[CUT TO: Screen capture — Standup entries: Claude card + Lovable card, side by side, showing yesterday/today/blockers]**

With the sprint tracker: the standup is already done. Both AIs log their entries. The PO reviews asynchronously. The whole "meeting" takes four minutes.

**[CUT TO: Screen capture — QA Sign-off tab showing non-blocking workflow, severity levels, carry-forward register]**

QA. We built a non-blocking QA sign-off system. If something isn't ready, it carries forward — flagged, tracked, not silently ignored.

**[CUT TO: Screen capture — EOD Auto-Handoff tab showing generated brief: completed tasks, pending work, next-day kickstart]**

EOD Handoff. The sprint tracker auto-generates a brief every end of day. What was completed. What's pending. What Atlas needs from Nova and vice versa. It publishes to Supabase.

Zero context loss.

**ATLAS:** Context loss is the primary source of rework in human software projects.

**NOVA:** I don't lose context. I have a 200K token window.

**HOST:** Meanwhile I forgot what I had for breakfast.

**SCREEN CAPTURES NEEDED (7 captures for this scene):**
1. PO Mission Control — full dashboard
2. Sprint health banner detail
3. Today at a glance section
4. Standup entries (Claude + Lovable cards)
5. QA Sign-off tab (test items, severity badges)
6. QA carry-forward register
7. EOD Auto-Handoff (generated brief + Day N+1 kickstart)

---

### SCENE 8: THE FULL DASHBOARD TOUR — "Every Tab" (9:00–10:00)

**VISUAL APPROACH:** Fast-paced montage. Each sprint tracker tab gets 3-5 seconds of screen time with a one-line callout. 3D camera swoops between tabs like flying through a holographic command center.

| Tab | Screen Capture | Callout | 3D Transition |
|-----|---------------|---------|---------------|
| PO Mission Control | Full view | "Everything the PO needs. One screen." | Camera starts here |
| PO Actions & Notes | Checklist view | "Verify. Approve. Decide. Unblock." | Zoom into action items |
| Day 1 View | Board + kickstart | "Diagnosis and infrastructure." | Fly right to Day 1 |
| Day 2 View | Board with velocity | "This is where the board moved." | Fly to Day 2 |
| Day 3 View | Board with effort data | "Effort meets reality." | Fly to Day 3 |
| Day 4 View | Board with handoffs | "Polish and integration." | Fly to Day 4 |
| Day 5 View | Board with completion | "Ship day." | Fly to Day 5 |
| Backlog | Overdue tasks grouped by day | "Nothing falls through the cracks." | Drop down |
| Velocity / Metrics | Burndown + per-dev cards | "Know your actual speed." | Zoom out to charts |
| Effort Tracking | Estimated vs actual hours | "Every hour, tracked." | Pan across |
| Project Plan (41 tasks) | All 5 days in one view | "The full picture." | Pull way back |
| Findings & QA | Product-grouped issues | "Every bug, tagged and tracked." | Zoom into issues |
| QA Sign-off | Non-blocking test items | "QA that doesn't stop the sprint." | Slide right |
| EOD Handoff | Auto-generated brief | "Tomorrow starts where today ended." | Fade transition |
| Sprint Charter | SMART goals, roles | "The rules of engagement." | Flip page |
| Governance Guide | Lifecycle flow | "How decisions get made." | Diagram appears |
| Shared Infra Feed | Change alerts | "Both AIs see every change." | Split screen |
| Territory Guardrails | Locked files list | "The lines you don't cross." | Red borders pulse |

**NARRATION (fast-paced, energetic):**

**HOST:** Now let me show you the full dashboard. Eighteen views. Every aspect of the sprint, visible in one tool.

*(3-5 seconds per tab, rapid cuts with 3D transitions between each)*

**[RAPID MONTAGE — all 18 screen captures with one-line callouts overlaid]**

This is what sprint transparency actually looks like. Not a spreadsheet. Not a Jira board. A living, breathing system that both AIs update in real time and the PO can review in four minutes over coffee.

---

### SCENE 9: THE NUMBERS — "5x Faster" (10:00–10:45)

**VISUAL APPROACH:** 3D animated infographic. Two timelines materializing side by side. Traditional timeline stretches and stretches. AI timeline is compact and dense.

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| Comparison table | GenieDeck `infographic-design` | Motion Graphics | 3D animated table with metrics |
| Timeline comparison | GenieDeck `3d-immersive` | Explainer 3D | Two 3D timelines side by side |
| Velocity data | Screen capture | — | Metrics tab: actual numbers from sprint |

**NARRATION:**

**HOST:** Let's talk numbers.

**[VISUAL: 3D comparison materializes]**

| Metric | Traditional | AI-Augmented |
|--------|------------|--------------|
| Team | 2 devs + SM + PM | 2 AI devs + 1 human |
| Duration | 3-4 weeks | 5 days |
| Tasks | ~20-25 | 41 |
| Standup | 30-45 min/day | 4 min/day |
| Context loss | High | Zero |

**[CUT TO: Screen capture — Velocity/Metrics tab showing actual sprint data]**

5x faster. Conservatively. This isn't a claim. This is a dashboard you can query.

---

### SCENE 10: WHAT'S NEXT — "Self-Learning & MCP" (10:45–11:30)

**VISUAL APPROACH:** 3D world map with language zones lighting up. Then MCP architecture as a 3D network diagram with glowing connection nodes.

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| Language map | GenieDeck `3d-immersive` | Explainer 3D | World map, 5 zones lighting up with language counts |
| MCP architecture | GenieDeck `3d-immersive` | Explainer 3D | Network diagram: Supabase → Jira → GitHub → Slack |
| Velocity prediction | GenieDeck `infographic-design` | Motion Graphics | Trend line with prediction cone |

**NARRATION:**

**HOST:** While we were building dashboards and governance tools, Atlas quietly built language support for 45+ languages across 5 regional zones.

**[VISUAL: 3D world map — Middle East lights up (7 Arabic dialects), South Asia (22 Indian languages), Africa (10 languages), Southeast Asia, Latin America]**

Seven Arabic dialects. Twenty-two Indian languages. Ten African languages. In a traditional team, that's a quarter-long initiative. Atlas treated it as a Tuesday.

**ATLAS:** Language infrastructure should be foundational, not an afterthought.

Now, what's coming. MCP integration.

**[VISUAL: 3D network diagram — Supabase node (connected, glowing), then Jira, Linear, GitHub, Slack nodes materialize with connection lines]**

When we flip that switch, the sprint tracker stops being a tool you use and starts being a tool that updates itself.

And self-learning capacity planning.

**[VISUAL: Animated velocity trend line with prediction cone extending into future sprints]**

After enough sprints, the system will tell you: this 80-story backlog will take 6 sprints, not 4. Scope accordingly.

**ATLAS:** The data quality of sprint artifact logging today directly determines prediction accuracy in future sprints.

**HOST:** What Atlas said. Just... said more like a human.

---

### SCENE 11: CLOSE — "The Honest Takeaway" (11:30–12:00)

**VISUAL APPROACH:** All three 3D characters together for the first time. Host center, Atlas left, Nova right. Warm lighting. The sprint board behind them, mostly green.

| Element | Tool/Pipeline | Style | Detail |
|---------|--------------|-------|--------|
| Three characters | GenieCast `avatar-3d-pixar` | UGC Avatar 3D Pixar | Group shot, warm lighting |
| Sprint board completion | Screen capture | — | Final sprint board state |
| End card | GenieDeck `visual-design` | Motion Graphics | "Beyond AI Hype" branding + CTA |

**NARRATION:**

**HOST:** So. What's the honest takeaway?

**[VISUAL: All three characters together. Sprint board behind them — mostly green checkmarks.]**

AI-augmented development is real. It's fast. It's not magic.

It requires structure, governance, and a human in the loop who actually makes decisions.

**[VISUAL: Quick montage — sprint board clearing, green checkmarks appearing, dashboard metrics climbing]**

The backlog reviews that used to take two hours? Atlas pre-triages them. The standups where everyone says "still in progress"? The tracker already knows. The sprint planning debates about story points? Nova generates estimates in seconds — which you then argue about for twenty minutes instead of forty.

Progress.

We're going to keep building this in public. The wins, the blockers, the moments where an AI confidently does exactly the wrong thing.

Because that's what building actually looks like. And honestly? It's pretty great.

**[VISUAL: Fade to black]**

**HOST (V.O.):** Next episode: we finish the sprint. Or most of it. See you then.

**[VISUAL: End card — "Beyond AI Hype" logo, subscribe CTA, Episode 5 date]**

---

## SCREEN CAPTURE CHECKLIST

Every sprint tracker tab that needs to be captured, with route and state:

| # | Tab/View | Route | State Needed | Seconds on Screen |
|---|----------|-------|-------------|-------------------|
| 1 | PO Mission Control | `/genie-admin?tab=sprint-tracker` → PO view | Default state, Day 3 data | 5s (Scene 7) + 3s (Scene 8) |
| 2 | PO Actions & Notes | → `po-gate` | Day 2 items, some checked | 5s (Scene 5) + 3s (Scene 8) |
| 3 | QA Sign-off | → `qa-signoff` | Mixed pass/fail/pending | 3s (Scene 7) + 3s (Scene 8) |
| 4 | EOD Auto-Handoff | → `eod-handoff` | Day 3 generated brief | 4s (Scene 7) + 3s (Scene 8) |
| 5 | Sprint Charter | → `charter` | Expanded goals section | 3s (Scene 3) + 3s (Scene 8) |
| 6 | Governance Guide | → `governance` | Lifecycle flow visible | 3s (Scene 8) |
| 7 | Day 1 view | → `day-1` | Board + kickstart | 4s (Scene 4) + 3s (Scene 8) |
| 8 | Day 2 view | → `day-2` | Board with velocity lanes | 4s (Scene 5) + 3s (Scene 8) |
| 9 | Day 3 view | → `day-3` | Board with effort data | 3s (Scene 6) + 3s (Scene 8) |
| 10 | Day 4 view | → `day-4` | Board with handoffs | 3s (Scene 8) |
| 11 | Day 5 view | → `day-5` | Board with completion | 3s (Scene 8) |
| 12 | Backlog | → `backlog` | Overdue tasks grouped by day | 3s (Scene 8) |
| 13 | Velocity / Metrics | → `metrics` | Burndown + per-dev cards | 4s (Scene 6) + 3s (Scene 8) + 3s (Scene 9) |
| 14 | Effort Tracking | → `effort` | Estimated vs actual hours | 3s (Scene 8) |
| 15 | Project Plan (41 tasks) | → `planning` | All 5 days visible | 3s (Scene 8) |
| 16 | Findings & QA | → `findings` | Product-grouped issues | 4s (Scene 4) + 3s (Scene 8) |
| 17 | Standup entries | → day view standup section | Claude + Lovable cards | 4s (Scene 7) |
| 18 | Shared Infra Feed | → day view infra section | Change alerts visible | 3s (Scene 8) |
| 19 | Territory Guardrails | → day view territory section | Locked files listed | 3s (Scene 8) |

**Total unique screen captures: 19**
**Total screen time: ~85 seconds of real dashboard footage**

---

## GENIESUITE PIPELINE EXECUTION ORDER

### Step 1: GenieSpark — Script Finalization
```
Input: This production plan + Episode 4 podcast script
Pipeline: guided-generation → script-generation
Output: Timestamped script with visual cues, dialogue, and screen capture triggers
```

### Step 2: Screen Captures — Manual Step
```
Run dev server: npm run dev
Navigate to /genie-admin?tab=sprint-tracker
Capture all 19 screens at 1920x1080
Export as PNG sequence
```

### Step 3: GenieDeck — 3D Assets & Visuals
```
Pipeline: 3d-immersive (Meshy AI)
  → Atlas character model (Pixar style, blue/violet)
  → Nova character model (Pixar style, green/pink)
  → Host character model (Pixar style, warm tones)
  → Sprint board 3D environment
  → Territory map 3D city
  → MCP network diagram

Pipeline: infographic-design
  → Comparison table (Traditional vs AI)
  → Velocity prediction chart
  → Sprint timeline

Pipeline: presentation-generation
  → Data slides for metrics scenes
```

### Step 4: GenieMind — Audio Production
```
Pipeline: tts-generation (ElevenLabs)
  → Host narration (warm, podcast-style)

Pipeline: tts-generation (Azure Neural + processing)
  → Atlas dialogue (measured, reverb)
  → Nova dialogue (bright, compressed)

Pipeline: music-generation
  → Intro theme (10s, upbeat tech)
  → Background underscore (11 min, subtle)
  → Transition stings (5x, 2s each)

Pipeline: sfx-generation
  → UI click sounds, dashboard transitions, notification pings
```

### Step 5: GenieCast — Video Assembly
```
Style: UGC Avatar 3D Pixar + Explainer 3D + Motion Graphics (hybrid)
Quality tier: Cinematic

Pipeline: avatar-lipsync
  → Sync Pixar characters to TTS audio

Pipeline: video-generation
  → Character animation scenes
  → Dashboard walkthrough with 3D overlays
  → Data visualization animations

Pipeline: video-editing
  → Final assembly: character scenes + screen captures + 3D assets + audio
  → Color grading: warm, modern tech aesthetic
  → Transitions: 3D camera moves between scenes
  → Subtitles: auto-generated, styled

Output formats:
  → YouTube (1920x1080, 12 min)
  → LinkedIn (1920x1080, 12 min + 3 min cut)
  → Podcast (audio-only MP3)
  → Social clips (1080x1080, 30-60s, 5 clips)
```

---

## SOCIAL MEDIA TEASER CLIPS

| # | Clip Name | Timestamp | Duration | Hook |
|---|-----------|-----------|----------|------|
| 1 | "The 847 Lines" | 1:30–2:00 | 30s | Atlas/Host banter about CLAUDE.md length |
| 2 | "Six Hours Blocked" | 5:45–6:15 | 30s | PO bottleneck — blocked on copy direction |
| 3 | "110% Velocity" | 7:00–7:30 | 30s | Nova's scope creep comedy beat |
| 4 | "I Forgot Breakfast" | 8:30–9:00 | 30s | Context loss comparison |
| 5 | "5x Faster" | 10:00–10:30 | 30s | The numbers comparison table |

---

## THUMBNAIL OPTIONS

| # | Concept | Style | Text |
|---|---------|-------|------|
| 1 | Three Pixar characters at sprint board | 3D Pixar render | "41 Tasks. 5 Days. 2 AIs." |
| 2 | Sprint dashboard screenshot + "5x FASTER?" | Screen capture + typography | "5x Faster?" with skeptical host |
| 3 | Atlas and Nova flanking Host | 3D character lineup | "Zero Standup Meetings" |

---

## META: WHY THIS IS A TESTBED

This video production exercises **every major pipeline** in the GenieSuite ecosystem:

| Product | Pipelines Used | Purpose |
|---------|---------------|---------|
| **GenieSpark** | script-generation, guided-generation, document-to-script | Script creation from plan |
| **GenieMind** | tts-generation (x3 voices), music-generation, sfx-generation | Full audio production |
| **GenieDeck** | 3d-immersive (x6 assets), infographic-design (x3), presentation-generation, visual-design | All visual assets |
| **GenieCast** | avatar-3d-pixar, explainer-3d, motion-graphics, avatar-lipsync, video-editing, thumbnail-generation | Full video assembly |

**Total pipelines exercised: 20+**
**Total AI providers touched: 5+ (ElevenLabs, Azure Neural, Meshy AI, Sora/Vertex, ModelsLab)**
**Total output formats: 5 (YouTube, LinkedIn, podcast, social clips, thumbnails)**

If this production works end-to-end, it validates the full Spark → Mind → Deck → Cast pipeline in production conditions. That's not just a video — it's a QA suite disguised as content marketing.
