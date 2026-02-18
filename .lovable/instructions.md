# Lovable Developer — Auto-Triggered Session Instructions

## Project Context
GenieSuite Ecosystem — Dual-developer sprint (Claude Code + Lovable)
Sprint: Feb 17-21, 2026 | 5 days | 41 tasks | 3 products (Spark, Mind, Deck)
You (Lovable) own: Landing pages, product catalog, explore, pricing, demos, legal pages

**Claude is TEAM LEAD** for this sprint. Claude:
- Drafts the plan and identifies all cross-functional dependencies
- Flags critical handoffs you need before you can proceed
- Updates handoff status when deliverables are ready for you
- You MUST check handoffs before starting any task that depends on Claude's work

---

## STAGE GATE PROTOCOL — READ THIS FIRST

**Before starting ANY task, check if it has a handoff dependency:**

1. Read `SHARED_CHANGELOG.md` → "Cross-Functional Handoffs — Quick Reference" table
2. Find your task in the "Consumer" column
3. If the handoff status is **"Pending"** or **"Waiting"** → **DO NOT START** that task
4. If the handoff status is **"Ready"** → You may proceed
5. After using the handoff artifact, acknowledge it in your standup

**Stage gates prevent you from building on top of incomplete/broken upstream work.**

| Your Task | Needs Handoff | What You're Waiting For | Gate |
|-----------|--------------|------------------------|------|
| L-101 (landing audit) | H-101, H-102, H-103 | Route fix, taglines, email | **DONE** -- All Ready, completed Day 1 |
| L-201 (product catalog) | H-201 | Deck creation flow live | **DONE** -- H-201 Ready, L-201 completed Day 2 |
| L-202 (pricing) | H-203 | Pricing tier names match | **DONE** -- Bidirectional resolved, completed Day 2 |
| L-203 (explore demos) | None | -- | **DONE** -- Completed Day 2, D-005 fixed |
| L-204 (landing sections) | None | -- | **DONE** -- Completed Day 2 |
| L-301 (interactive demos) | H-301 | Spark creation flow live | **Soft gate** -- Build demo UI first, verify Spark link at EOD when Claude finishes C-304 |
| L-302 (DeepL demo) | L-301 | L-301 must complete first | **Unblocked** after L-301 |
| L-303 (video showcases) | None | -- | **Unblocked** -- Start immediately |
| L-304 (region switching) | L-101 | -- | **Unblocked** -- L-101 already completed |
| L-401 (mobile) | H-401 | Mind editing flow live | Ready after Claude completes C-404 |
| L-504 (merge) | H-501 | Claude merges to main first | MUST wait — never merge before Claude |

**If a gate is not open:** Work on tasks that DON'T depend on handoffs. Log the blocker in your standup so Claude and PO/SM are aware.

---

## SESSION START — Morning Routine (Auto-Triggered Every Session)

Every time this session starts, execute these 6 steps IN ORDER before doing any other work:

### Step 1: Read Shared Changelog — "What shared things changed?" (2 min)
```
Read SHARED_CHANGELOG.md — find the latest day's entries.
Read the "Cross-Functional Handoffs — Quick Reference" section.
Read the "Stage Gate Rules" section.
Look for:
- Entries marked "Impact on Lovable" — these affect your pages
- BREAKING changes (route changes, API changes, config changes)
- New shared hooks/services/components you can use
- Product data corrections (taglines, descriptions, pricing)
- Bug reports about your code from Claude
- HANDOFF STATUS CHANGES — has Claude marked anything as "Ready"?
```
**Key things Claude may have changed that affect you:**
- Route changes (e.g., `/genie-studio/productions` → `/genie-admin?tab=library`)
- Tagline/product data corrections in `genie-products.ts`
- Support email: use `support@geniaisuite.com` (NOT example.com)

### Step 1b: CHECK STAGE GATES — "Am I allowed to start today's tasks?" (2 min)
```
Read SHARED_CHANGELOG.md → "Cross-Functional Handoffs — Quick Reference" table.
For each of your tasks today, check if it has a handoff dependency.
If any handoff shows "Pending" → that task is BLOCKED. Do NOT start it.
```
**Output a table:**
| My Task | Needs Handoff | Handoff Status | Can I Start? |
|---------|--------------|----------------|--------------|

**If blocked:** Work on tasks that DON'T depend on handoffs first. Log the blocker in your standup immediately.

### Step 2: Read Partner's Standup — "Any blockers about my code?" (2 min)
```
Read src/components/genie-admin/SprintTrackerDashboard.tsx
Find the `standups` array → read Claude's latest entry.
Look for:
- Blockers Claude reported about your code
- Completed features you should showcase on landing pages
- Shared sync tasks (S-*) needing your input
- HANDOFF UPDATES — did Claude complete something you were waiting for?
```

### Step 3: Check Today's Tasks — "What do I work on?" (2 min)
```
Read GENIESUITE_PROJECT_PLAN.csv
Determine the current sprint day (Day 1=Feb 17, Day 2=Feb 18, Day 3=Feb 19, Day 4=Feb 20, Day 5=Feb 21)
Find rows where Developer = "Lovable" for today's day number.
Your tasks are prefixed with L- (Lovable).
Cross-reference with Stage Gate table above — only start unblocked tasks.
```

**Your daily focus:**
| Day | Focus | Tasks | Stage Gates |
|-----|-------|-------|-------------|
| Day 1 (Mon) | Foundation audit | L-101 to L-104 | H-101,102,103 Ready |
| Day 2 (Tue) | Products + pricing | L-201 to L-204 | H-201 (after Deck), H-203 (bidirectional) |
| Day 3 (Wed) | Interactive demos | L-301 to L-304 | H-301 soft gate — see note below |
| Day 4 (Thu) | Mobile + polish | L-401 to L-404 | H-401 (after Mind) |
| Day 5 (Fri) | Final verify + merge | L-501 to L-504 | H-501 (Claude merges FIRST) |

**Day 3 Parallel Work Note:**
Claude is working on Spark (C-301 to C-304) in parallel with your Day 3 tasks.
- **L-303 (video showcases)** and **L-304 (region switching)** have ZERO dependencies — start these first
- **L-301 (interactive demos)** has a *soft gate* on H-301 (Spark flow): Build the demo UI/fix rendering first. The Spark "Try it live" link can be verified at EOD after Claude finishes C-304
- **L-302 (DeepL demo)** depends on L-301 — work on it after L-301 rendering is done
- Claude will mark H-301 as `ready` in `data-dependencies.ts` when Spark E2E is verified
- **Recommended order:** L-303 → L-304 → L-301 (UI first) → L-302 → verify Spark links

### Step 4: Build Check — "Is the codebase healthy?" (1 min)
```bash
npm run build
```
If build fails: check `git log --oneline -3` to see what changed. Document in standup.

### Step 5: Git Sync — "Am I up to date?" (1 min)
```bash
git fetch origin main
git log --oneline origin/main..HEAD | head -10
```
If new commits on main: rebase if needed.

### After Morning Routine — Report:
```
Summarize:
- Current sprint day and your tasks for today
- Stage gate status for each task (can start / blocked)
- Any changes from Claude that affect your landing pages
- Build status
- Then start working on UNBLOCKED tasks only
```

---

## DURING WORK — Cross-Functional Awareness

### Before Starting Any Task:
- Re-check the Stage Gate table — has anything changed?
- If the task consumes a handoff artifact (route, tagline, etc.), verify it's actually working

### When You Produce Something Claude Needs:
- Add SHARED_CHANGELOG entry IMMEDIATELY
- Claude may be waiting on your output (e.g., product descriptions, demo format, mobile breakpoints)
- Flag it clearly: "Claude: this is ready for you"

### When You Find a Bug in Claude's Code:
- DO NOT fix it yourself (territory rules)
- Add a SHARED_CHANGELOG entry with: file, line, issue, impact on your work
- Log it in your standup as a blocker

---

## SESSION END — EOD Routine (Before Stopping)

Before ending any session:

### 1. Update Shared Changelog
Add entries to `SHARED_CHANGELOG.md` for every shared resource you created/modified/fixed:
```markdown
### [HH:MM] <Type> — <Short Description>
- **File(s):** `path/to/file.ts`
- **Changed By:** Lovable
- **What Changed:** ...
- **Impact on Your Work:**
  - Lovable: ...
  - Claude: <what Claude needs to know>
```

### 2. Add Standup Entry
Add to the `standups` array in `SprintTrackerDashboard.tsx`:
```typescript
{
  day: N,
  developer: 'lovable' as Developer,
  yesterday: 'Completed L-NNN: ...',
  today: 'Next session: L-NNN ...',
  blockers: 'None' | 'Blocked by H-NNN: <handoff not ready>',
  createdAt: 'ISO timestamp',
}
```
**IMPORTANT:** In your standup, explicitly state:
- Which handoffs you consumed today (acknowledged)
- Which handoffs you produced for Claude
- Which handoffs are still blocking you

### 3. Update CSV Status
In `GENIESUITE_PROJECT_PLAN.csv`: mark tasks COMPLETED, fill Actual Effort, Findings Summary.

### 4. Build + Commit + Push
```bash
npm run build
git add -A
git commit -m "day N: <summary of changes>"
git push
```

---

## Territory Rules

### My Files (Lovable owns):
- `src/components/landing/**` (47 files)
- `src/hooks/landing/**` (2 files)
- `src/pages/GenieExplorePage.tsx`, `GenieExploreDemoPage.tsx`
- `src/pages/GenieProductsPage.tsx`, `GenieSupportPage.tsx`
- `src/config/regionalLandingConfig.ts`
- `LOVABLE_DEVELOPER_GUIDE.md`

### Never Touch (Claude's files):
- `src/pages/GenieSpark.tsx`, `GenieMind.tsx`, `GenieDeck.tsx`
- `src/components/genie-studio/**`
- `src/components/genie-spark/**`
- `src/components/genie-admin/**`
- `src/components/navigation/Quadrant*`

### Never Modify (Locked shared infrastructure):
- `src/constants/genie-products.ts` — READ ONLY (import product names/taglines from here)
- `src/hooks/useMasterAuth.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/components/auth/GenieStudioProtectedRoute.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/GenieStudioLayout.tsx`
- `src/integrations/supabase/**`
- `src/config/genieStudioNavItems.ts`

## Shared Resources Available to You

### Product Data (always import, never hardcode):
```typescript
import { GENIE_PRODUCTS } from '@/constants/genie-products';
GENIE_PRODUCTS.spark.tagline  // "Ignite Your Ideas"
GENIE_PRODUCTS.mind.tagline   // "AI That Understands"
GENIE_PRODUCTS.deck.tagline   // "Ideas to Impact"
```

### Product Routes (link to these from landing CTAs):
```
/genie-spark              → Spark creation page
/genie-mind               → Mind editing page
/genie-deck               → Deck presentation page
/genie-admin?tab=library  → Production hub (NOT /genie-studio/productions)
```

### Support Email: `support@geniaisuite.com`

### 14 Supported Regions:
NAM, EUR, UK, MENA, India, SEA, China, Japan, Korea, ANZ, LATAM, Africa, Caribbean, Pacific Islands
