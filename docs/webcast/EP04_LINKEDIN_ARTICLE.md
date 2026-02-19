# I gave two AI developers a 5-day sprint. The governance system that ran it was built during it.

*Beyond AI Hype — Episode 4*

---

Two AI developers. One human PO. Five days. Forty-one tasks. Three products.

The sprint tracker that coordinated everything? We built it while the sprint was running.

---

## Meet Atlas and Nova

Before we get into what happened, let me introduce the team.

**Atlas** is Claude Code — the backend tech lead. He owns data architecture, edge functions, sprint governance data, diagnosis, and effort logging. If it lives in a database or runs server-side, it's Atlas's territory.

**Nova** is Lovable — the frontend developer. She owns landing pages, admin UI, marketing components, and user-facing flows. If a user sees it, Nova built it.

I'm the Product Owner, Scrum Master, QA lead, and the person writing this. The human in the middle.

Here's what five days with this team actually looked like.

---

## Day 0: The Sprint Plan wasn't optional

Before Day 1 started, we needed a contract, not a to-do list.

The Sprint Planning view mapped all 41 tasks across 5 days — split by developer, with estimated hours, acceptance criteria, and explicit dependency chains. Atlas couldn't begin Day 2 tasks until Nova's Day 1 handoffs were acknowledged. Nova couldn't touch the landing CTA until Atlas confirmed the route was live.

Every task had a producer and a consumer. Every dependency was named. If you skipped this step and just started working, you'd get two AI developers solving the same problem from opposite ends and meeting in the middle with incompatible assumptions.

The Sprint Plan enforced sequencing. It turned "let's start" into "here's what can actually start, in what order, and why."

---

## Day 1: Atlas found 33 bugs before writing a line of feature code

Atlas's first task wasn't to build anything. It was to diagnose what was already broken.

He ran systematic diagnosis across all three products — Genie Spark (14 issues), Genie Mind (13 issues), Genie Deck (6 issues). Every finding was severity-tagged: critical, high, or medium. Every finding was root-caused, filed against a specific file and line number, and linked to a target fix day.

This went straight into the **Findings & QA** view — not a Slack thread, not a doc that lives on someone's desktop. A structured dashboard grouped by product, filterable by severity, showing fix status in real time.

The reason this matters: by the end of Day 1, the PO had a live picture of exactly what was broken, in what product, and when it was scheduled to be fixed. No "what's the status on that bug?" No "did that get resolved?" The dashboard had the answer before the question was asked.

Day 2 through 5 were shaped entirely by what Atlas found on Day 1.

---

## Day 2: I became the bottleneck

Here's the thing nobody warns you about when you work with AI developers: they don't wait.

Atlas completed three tasks on Day 2 morning. Each completion required a human decision before the next task could proceed. I was in a meeting. A human meeting. The kind that runs forty minutes longer than it should.

Atlas noted, in his standup: *"PO decision pending on route confirmation. Blocked."*

This is what triggered the **PO Actions & Notes** tab.

When Atlas completes a task that needs PO input, a structured checklist item appears in the PO's queue — not a ping, not an email, a card with a category (Verify / Approve / Decide / Unblock), the related tasks shown with their completion status, a progress bar, and a space for the PO to add a note.

The PO can't mark an item done until the dev work it depends on is complete. When that work lands, the card updates: "Dev work just completed — ready for your action." The PO adds a note, marks it done. Atlas reads it in the next session via Supabase sync.

What this replaced: four Slack messages, two re-checks, and one missed approval that blocked half a day.

What it takes now: the PO opens the Actions tab, sees what's ready, clears what's actionable, and the developers pick up immediately.

---

## Day 3: Nobody asked "what did we do yesterday?"

By Day 3, the async standup pattern was solid. But session handoff was still manual. Each day's context — what was completed, what handoffs were produced, what the next session needed to start — lived in my head and a growing markdown file.

After Day 3 ended, we built the **EOD Auto-Handoff**.

One click from the PO publishes a structured brief to Supabase. Atlas gets a prompt at session start that lists exactly what he completed, which handoffs he produced, what Nova needs from him, and what his Day 4 tasks are with acceptance criteria already attached. Nova gets the same — territory reminders, handoffs ready from Claude, her own task list.

Zero copy-paste. Zero "can you remind me where we left off?" Zero context reconstruction.

The brief is generated from live sprint data — task completions, handoff statuses, dependency chain states. It isn't written. It's compiled.

By Day 4, the handoff prompt replaced the first 20 minutes of every session. Atlas started Day 4 already knowing the state of the board.

---

## Day 4: We could finally see where time was actually going

Midway through the sprint, I had a question I couldn't answer from memory: where is the time actually going?

Atlas introduced **Effort Tracking** at task completion. For each task: actual hours logged, token usage, token cost in cents, and a discipline breakdown — frontend, backend, database, architecture, debugging, documentation.

Estimated 2h. Actually took 1.4h. Variance: -0.6h. Discipline split: 60% architecture, 40% backend.

The PO enters none of this. Atlas logs it when he marks a task complete. The Effort Tracking view aggregates it: where the hours went across all tasks, which discipline consumed the most time, how the two developers compare in actual vs. estimated. Token costs rolled up by day. Variance tracked per task and overall.

By end of Day 4, we had a real picture of the sprint's cost — not estimated, not projected. Logged, timestamped, broken down by discipline.

---

## Day 5: QA didn't block the ship

Traditional QA at sprint end creates a binary: everything passes, or the sprint doesn't close.

We built a different model.

The **QA Sign-off** view tracked 26 test cases across the sprint — severity-tagged critical, high, and medium — each linked to the task that produced the feature being tested. The PO signs off in one of two modes: full (all passed) or conditional (some failed, sprint closes anyway).

Failed items don't disappear. They go into a **Carry-forward register** that auto-appears in the next sprint's intake. No renegotiation. No lost bugs. No "I thought that was fixed." The register carries the original severity tag, the original task link, and the sign-off note from the PO.

Day 5 closed on time. Three items carried forward. None were critical. The sprint shipped.

---

## The Numbers (that compute themselves)

The **Velocity & Metrics** view doesn't need you to update a spreadsheet. It reads from effort logs.

Burndown by day. Per-developer completion rates. Token costs by day and by developer. And an ROI panel that compares actual AI development cost against what the same hours would cost with two senior developers at $75/hr and a dedicated SM/PM at $85/hr for 2.5 hours a day.

The panel updates the moment effort is logged. It's not a retrospective calculation. It's live.

For this sprint: 5x faster than a comparable human team for the same scope. That's not a claim made in a pitch deck. It's a number on a dashboard, derived from logged hours, computed against a baseline.

---

## The Honest Takeaway

The governance layer didn't slow the sprint. It made the sprint possible.

Sprint Planning turned 41 tasks into a coordinated sequence. Findings & QA gave Day 1 a purpose beyond writing code. PO Actions & Notes made the human bottleneck visible and manageable. EOD Auto-Handoff eliminated the context gap between sessions. Effort Tracking made costs legible in real time. QA Sign-off let the sprint close without blocking on perfection.

None of these tools existed before the sprint. Every one of them was built because we felt the pain of not having it.

Structure isn't the opposite of speed. It's the prerequisite.

---

**What would you have built in Sprint Zero — the governance layer, the handoff system, the QA model — that you had to build reactively?**

Drop your answer below.

---

*This is Episode 4 of Beyond AI Hype — where we skip the demos that conveniently work and show what building with AI actually looks like.*

*The video for this episode was produced using GenieSuite — Spark for scripting, Mind for audio, Deck for 3D visuals. Our tools. Our story.*

*Follow for Episode 5.*

#AIEngineering #BuildInPublic #AgileTransformation #ClaudeCode #SprintPlanning #FutureOfWork #DevTools #ProductOwner

---

## COMPANION LINKEDIN POST (short-form, for day-of publish)

> **41 tasks. 5 days. 2 AI developers. A sprint tracker built during the sprint to run the sprint.**
>
> Atlas is Claude Code. Nova is Lovable. I'm the human in the middle.
>
> Day 1: Atlas diagnosed 33 bugs across 3 products before writing a line of feature code. Every finding severity-tagged, root-caused, filed to a specific line. Live dashboard. No Slack threads.
>
> Day 2: I became the bottleneck. Atlas was ready. I was in a meeting. We built a PO Actions tab — Verify / Approve / Decide / Unblock — with bidirectional Supabase sync so the queue was never invisible again.
>
> Day 3: EOD Auto-Handoff. One click, structured brief published to Supabase. Both AIs start the next session already knowing what's done, what's pending, and what needs to happen first.
>
> Day 4: Effort Tracking — actual hours, token costs, discipline breakdowns per task. Logged by the developer, aggregated live. No spreadsheet maintenance.
>
> Day 5: QA Sign-off with a Carry-forward register. Non-blocking. Three items carried. Sprint shipped.
>
> The velocity dashboard computed the ROI live. 5x faster than a comparable human team. Not a claim. A number on a screen.
>
> The governance layer didn't slow anything down. It's what made the speed possible.
>
> Full article below.
>
> #BeyondAIHype #BuildInPublic #AIEngineering #SprintPlanning
