# I Ran a 5-Day Sprint with Two AI Developers. Here's What Nobody Tells You.

*Beyond AI Hype — Episode 4*

---

Last week, I ran a 5-day sprint with two AI developers — Claude Code as tech lead, Lovable as frontend developer — and myself as the Product Owner, Scrum Master, QA lead, and the person writing this post.

41 tasks. 5 days. 3 products shipped.

Here's what actually happened. Not the polished version. The real one.

---

## The Setup Nobody Talks About

Everyone focuses on AI speed. Nobody talks about AI governance.

When you have two AI developers working on the same codebase simultaneously, the first problem isn't "can they code?" — it's "how do you stop them from breaking each other's work?"

Our answer: **a file ownership matrix**.

Atlas (our Claude Code tech lead) owns backend systems, sprint governance, and data architecture. Nova (our Lovable frontend dev) owns the landing UI, marketing pages, and user-facing flows. There's a locked shared infrastructure layer — 12 critical files — that neither AI touches without PO approval.

We built this after a merge conflict on Day 1. Before the governance file existed. Learn from our pain.

---

## What AI Developers Actually Do (And Don't)

**They're fast.** Nova was tasked with building a landing page hero section. She also refactored the navigation component. It wasn't in scope. "It works better now," she said.

This is the thing nobody warns you about: **AI developers are extremely productive AND extremely thorough in ways you didn't ask for.** Setting acceptance criteria isn't optional. It's survival.

**They don't lose context.** Every morning, both AIs read the shared changelog, check dependency chains, and review each other's standup entries. No "what were we doing again?" No 45-minute standup meetings. The sprint tracker already has the answers.

**They need a human to decide.** On Day 2, we were blocked for six hours because I hadn't confirmed copy direction for a CTA button. I was in a meeting. A human meeting. Atlas noted that "those take significantly longer than they need to."

He's not wrong.

---

## The Three Things That Actually Made It Work

### 1. Territory Rules (Non-Negotiable)

Every file in the codebase has an owner. Atlas never touches Nova's landing components. Nova never touches Atlas's sprint governance. 12 files are locked entirely — shared infrastructure that requires PO sign-off to modify.

This isn't bureaucracy. It's the only way two autonomous agents coexist in one repo.

### 2. The PO Actions Tab (Born from Pain)

By Day 2, I had a backlog of decisions both AIs needed from me. The list was in my head. Sometimes in a note. Twice in a Signal message to myself.

After Day 2, we built a PO Actions tab: every item I need to Verify, Approve, Decide, or Unblock — tracked as a living checklist. Both AIs write to it. I check it every morning.

It took us two days to realize we needed it. Three hours to build it. **That's the honest version of agile: you discover what you need by feeling the pain first.**

### 3. Async Standups (The Meeting That Isn't)

Both AIs log standup entries automatically. What they completed yesterday. What they're working on today. Blockers. I review asynchronously over coffee. Total time: 4 minutes.

Compare that to the 45-minute standup calls we've all endured. For a two-person team.

---

## A Sprint Tracker Built by Its Own Team

Here's where it gets interesting. We didn't just track the sprint — we built a full sprint governance system during it. 18 views:

- **PO Mission Control** — everything the Product Owner needs on one screen
- **PO Actions** — Verify / Approve / Decide / Unblock checklists
- **Day Views (1-5)** — sprint boards with swimlanes, kickstarts, handoffs
- **Backlog** — nothing falls through the cracks
- **Velocity & Metrics** — burndown charts, per-developer completion, effort tracking
- **QA Sign-off** — non-blocking quality gates with carry-forward register
- **EOD Auto-Handoff** — tomorrow starts where today ended, published to Supabase
- **Findings & QA** — every bug tagged by severity and product
- **Sprint Charter & Governance** — the rules of engagement, always visible

Mission Control alone replaced three meetings, two status emails, and a Slack thread with 47 unread messages.

---

## The Numbers

| Metric | Traditional Sprint | AI-Augmented Sprint |
|--------|-------------------|---------------------|
| Team size | 2 senior devs + SM + PM | 2 AI devs + 1 human PO/SM |
| Sprint duration (same scope) | 3-4 weeks | 5 days |
| Standup time | 30-45 min/day | 4 min/day (async) |
| Context loss between sessions | High | Zero |
| Merge conflicts | Frequent | 1 (Day 1, before governance) |

That's 5x faster. Not a claim. It's a dashboard you can query.

---

## What I Got Wrong

**I underestimated the PO bottleneck.** When your developers never sleep and never forget, YOU become the blocker. Every unresolved decision, every pending approval — it stacks up faster than with human developers because the AIs are ready for the next task the moment you clear one.

**I over-scoped Day 1.** Foundation + diagnosis + infrastructure in one day was ambitious. Atlas ran at 85% velocity. Nova ran at 110% and created scope we didn't ask for. Lesson: AI velocity is not uniform, and "faster" doesn't mean "controllable."

**I didn't build the governance tooling first.** The file ownership matrix, the PO Actions tab, the handoff tracker — these should have been Sprint Zero. We built them reactively. Every hour spent building governance saved three hours of coordination chaos later.

---

## What's Next

The sprint tracker logs everything — hours, effort breakdown, handoffs, blockers, completion rates — in structured, queryable format. After enough sprints, the system will know the team's actual velocity and predict: "This 80-story backlog will take 6 sprints, not 4. Scope accordingly."

We're also connecting external tools through MCP (Model Context Protocol) — Supabase today, but the architecture plugs into Jira, Linear, GitHub, Slack without custom connectors. When that switch flips, the sprint tracker stops being a tool you use and starts being a tool that updates itself.

Oh, and Atlas quietly built language support for 45+ languages across 5 regional zones — 7 Arabic dialects, 22 Indian languages, 10 African languages. The kind of feature that would be a quarter-long initiative for a human team. We'll talk about that next time.

---

## The Honest Takeaway

AI-augmented development is real. It's fast. It's not magic.

It requires structure, governance, and a human in the loop who actually makes decisions. The PO role doesn't disappear — it gets harder in some ways and dramatically easier in others.

The standups that used to take an hour? Already done. The sprint planning debates about story points? Nova generates estimates in seconds — which you then argue about for twenty minutes instead of forty. Progress.

We're building this in public. The wins, the blockers, the moments where an AI confidently does exactly the wrong thing and we have to course correct. Because that's what building actually looks like.

---

**Would you trust two AI developers on your next sprint? What governance would you put in place first?**

Drop your thoughts below. Especially if you think this is either the future or completely unhinged. Both are valid.

---

*This is Episode 4 of Beyond AI Hype — a series where we skip the demos that conveniently work and show you what building with AI actually looks like.*

*The video for this episode was produced entirely with GenieSuite — Spark for scripting, Mind for audio, Deck for 3D visuals, Cast for production. Our tools, telling their own story.*

*Follow for Episode 5: we finish the sprint. Or most of it.*

#AIEngineering #SoftwareDevelopment #AgileTransformation #ClaudeCode #BuildInPublic #SprintPlanning #FutureOfWork #DevTools

---

## COMPANION LINKEDIN POST (for sharing the article)

> **41 tasks. 5 days. 2 AI developers. 1 human who forgot to update the checklist.**
>
> I just wrapped a sprint with two AI developers building simultaneously on the same codebase.
>
> The honest version: it's 5x faster than a traditional sprint. It's also chaotic in ways nobody warns you about.
>
> Three things I learned:
>
> 1. Acceptance criteria aren't optional — they're survival
> 2. The PO role gets harder, not easier
> 3. Governance isn't overhead — it's infrastructure
>
> We also built the video about this sprint using our own tools (GenieSuite — Spark, Mind, Deck, Cast). 3D Pixar characters, real dashboard footage, zero external tools.
>
> If your product can't tell its own story, it's not ready.
>
> Full article and 12-minute video below.
>
> #BeyondAIHype #BuildInPublic #AIEngineering
