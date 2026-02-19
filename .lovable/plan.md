
## Rewrite EP04 LinkedIn Article — Feature-Grounded Narrative

### The Problem with the Current Article

The current article mentions the Sprint Tracker's features in two places: a generic bullet list ("18 views") and vague references to the PO Actions tab. The following real, implemented features are either missing or barely touched:

- **PO Actions & Notes** (Verify / Approve / Decide / Unblock with bidirectional sync)
- **QA Sign-off** (non-blocking gate with Carry-forward register)
- **EOD Auto-Handoff** (auto-generated Claude + Lovable kickstart prompts published to Supabase)
- **Velocity & Metrics** (burndown, token cost, ROI vs. human, per-discipline breakdown)
- **Effort Tracking** (estimated vs. actual hours, variance, discipline breakdown per task)
- **Sprint Planning / Project Plan** (full 5-day plan with swimlanes, PO gates, dependency chains)
- **Findings & QA** (diagnosis grouped by product: Spark, Mind, Deck — severity-tagged, fixed vs. open)

The goal is a single, flowing article where each section tells a moment in the sprint story that *naturally introduces* one or more of these features — the way a good product founder would write it.

### What "Atlas" and "Nova" Mean (to clarify upfront in the article)

- **Atlas** = Claude Code, the backend tech lead. Owns data architecture, edge functions, sprint governance data, diagnosis, effort logging.
- **Nova** = Lovable (this tool), the frontend developer. Owns landing pages, admin UI, marketing components, user-facing flows.

This will be stated clearly at the start of the article, once, conversationally — not in a table.

---

### Article Architecture (Narrative Structure)

The rewrite uses a day-by-day spine but each day introduces exactly one or two real features, described through the lived experience that made them necessary:

**Opening Hook** — "Two AI developers. One human PO. Five days. The tool that ran the sprint was built during the sprint."

**Intro: Meet Atlas and Nova** — One paragraph, plainly introducing who they are, what they own, and why there's a human in the middle.

**Day 0 (Before Sprint Started): The Sprint Plan wasn't optional** — Introduce **Sprint Planning / Project Plan**: 41 tasks across 5 days, split by developer, with estimated hours, acceptance criteria, dependency chains between tasks. Atlas can't start Day 2 until Nova's Day 1 handoff is acknowledged. This isn't a to-do list. It's a contract.

**Day 1: Atlas found 33 bugs before writing a line of code** — Introduce **Findings & QA**: Atlas ran diagnosis on Genie Spark (14 issues), Genie Mind (13 issues), Genie Deck (6 issues). Every finding was severity-tagged (critical / high / medium), root-caused, filed against a specific file and line, and linked to a fix day. This became the source of truth for what Day 2-5 actually needed to do. The dashboard's Findings view let the PO see fix progress live — not in a Slack thread.

**Day 2: I became the bottleneck** — Introduce **PO Actions & Notes**: When Atlas completed tasks, items appeared in the PO's queue — not a ping, not an email, a structured checklist item with category (Verify / Approve / Decide / Unblock), the related dev tasks shown with their completion status, and a progress bar. The PO can't mark an item done until the dev work it depends on is complete. When the dev work lands, the card lights up: "Dev work just completed — ready for your action." The PO adds a note, marks it done. Atlas sees it in the next session via Supabase sync.

**Day 3: Nobody needed to ask "what did we do yesterday?"** — Introduce **EOD Auto-Handoff**: At end of each day, one click from the PO publishes a structured brief to Supabase. Atlas gets a prompt at Day N+1 session start listing exactly what he completed, which handoffs he produced, what Lovable needs from him, and what his Day 4 tasks are with acceptance criteria. Nova gets the same — with territory reminders, handoffs ready from Claude, and her own task list. Zero copy-paste. Zero "can you remind me where we left off?"

**Day 4: We could see exactly where time went** — Introduce **Effort Tracking**: Atlas logged actual hours, token usage, and a discipline breakdown (frontend / backend / database / architecture / debugging / documentation) for each completed task. Estimated 2h, actually took 1.4h. Variance: -0.6h. The PO doesn't enter any of this — Atlas does it at task completion. The Effort Tracking view shows this aggregated across all tasks: where the hours went, which discipline consumed the most time, and per-developer comparisons.

**Day 5: QA didn't block the sprint** — Introduce **QA Sign-off**: 26 test cases across 5 days, severity-tagged (critical / high / medium), linked to the task that produced each feature. The QA gate is non-blocking — the PO can sign off conditionally ("full" or "conditional" mode) even if some items failed. Failed items go into a Carry-forward register that auto-appears in the next sprint intake. No renegotiation. No lost bugs. They're already queued.

**The Numbers / Velocity** — Introduce **Velocity & Metrics**: Burndown by day, per-developer completion rates, token costs, and an ROI panel comparing actual AI cost against what the same hours would cost with two senior developers at $75/hr plus a dedicated SM/PM at $85/hr (2.5h/day). The dashboard computes this live. It isn't a spreadsheet you maintain — it updates the moment effort is logged.

**Honest Takeaway** — The governance layer didn't slow the sprint. It made the sprint possible. Structure isn't the opposite of speed. It's the prerequisite.

**CTA** — What would you have built in Sprint Zero that you had to build reactively?

---

### Technical Details (for the Plan)

**File to modify:** `docs/webcast/EP04_LINKEDIN_ARTICLE.md`

**What changes:**
- The current article (167 lines) is fully replaced
- The new article will have:
  - Short-form companion post (150-200 words, LinkedIn format)
  - Long-form newsletter article (1,000-1,200 words, narrative-first, feature-specific)
- The companion post remains as a separate section at the bottom of the same file
- No new files created
- The build error in `supabase/functions/session-reminders/index.ts` (missing `npm:resend`) is fixed in the same pass by replacing the import with the correct Deno-compatible `https://esm.sh/resend@2.0.0` import

**Build error fix:**
- File: `supabase/functions/session-reminders/index.ts`
- Line 3: `import { Resend } from 'npm:resend@2.0.0';`
- Replace with: `import { Resend } from 'https://esm.sh/resend@2.0.0';`

**Article tone:** First person, product founder. Direct. Honest about what broke and why the tool was built. No hype language. Each feature earns its mention through the story beat that made it necessary.
