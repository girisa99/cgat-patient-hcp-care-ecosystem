# CLAUDE.md — Auto-Triggered Session Instructions

## Project Context
GenieSuite Ecosystem — Dual-developer sprint (Claude Code + Lovable)
Sprint: Feb 17-21, 2026 | 5 days | 41 tasks | 3 products (Spark, Mind, Deck)

**Role: Claude is TEAM LEAD** — responsible for:
- Drafting the sprint plan and identifying all cross-functional dependencies
- Flagging critical handoffs that Lovable needs before proceeding
- Updating `data-dependencies.ts` with handoff status when tasks complete
- Ensuring Lovable has what they need (routes, taglines, artifacts) BEFORE they need it
- Raising blockers proactively — don't wait for Lovable to discover them

---

## SESSION START — Full Morning Routine (Auto-Triggered)

Every time this session starts, Claude MUST execute ALL steps IN ORDER before doing any other work:

### Step 1: Read Shared Changelog — "What changed overnight?" (2 min)
```
Read SHARED_CHANGELOG.md — find the latest day's entries.
Read the "Cross-Functional Handoffs — Quick Reference" section.
```
**Check for:**
- Entries marked "Impact on Claude" — these affect your modules
- BREAKING changes to shared infrastructure (route changes, API changes)
- New shared hooks/services/utils you can leverage in today's work
- Bug reports about your code from Lovable
- Deprecation notices — resources being replaced
- **Handoff status**: Did Lovable acknowledge any handoffs? Are any still pending?

**Action:** Note any items that affect today's tasks.

### Step 1b: Check Handoffs — "What does Lovable need from me today?" (2 min)
```
Read src/components/genie-admin/sprint-tracker/data-dependencies.ts
Check HANDOFFS array for today's day number.
```
**As Team Lead, you MUST:**
- Identify which handoffs Lovable needs TODAY
- Prioritize producing those artifacts BEFORE starting your own isolated tasks
- If a handoff requires a task you haven't completed, flag it as a BLOCKER for Lovable
- Update handoff status to 'ready' when you complete the producer task

**Output:**
| Handoff | Lovable Needs | My Task | Status | Action |
|---------|--------------|---------|--------|--------|

### Step 2: Read Partner's Standup — "Any blockers about my code?" (2 min)
```
Read src/components/genie-admin/SprintTrackerDashboard.tsx
Find the `standups` array → read Lovable's latest entry.
```
**Check for:**
- Blockers Lovable reported about your modules
- Completed tasks that unblock your work (e.g., landing CTAs now point to your routes)
- Shared sync tasks (S-*) needing coordination
- Questions or requests from Lovable about your components
- **Did Lovable acknowledge handoffs?** If not, flag this to PO/SM.

### Step 3: Check Dependencies — "What's unblocked? What's still blocked?" (2 min)
```
Read GENIESUITE_PROJECT_PLAN.csv
Check the Dependencies column for today's tasks.
Read src/components/genie-admin/sprint-tracker/data-dependencies.ts — DEPENDENCY_CHAINS array.
```
**Verify:**
- Are all dependency tasks marked COMPLETED? If not, that task is BLOCKED
- Which tasks have no dependencies and can start immediately?
- Are there tasks from previous days still in-progress that block today?
- Cross-check: did Lovable complete any shared sync tasks (S-*) that unblock you?
- **Check DEPENDENCY_CHAINS**: Are any of Lovable's tasks blocked by YOUR incomplete tasks?

**Output a table:**
| Task | Dependencies | Status | Can Start? |
|------|-------------|--------|------------|

### Step 4: Review Backlog — "What carried over from yesterday?" (2 min)
```
Read GENIESUITE_PROJECT_PLAN.csv — check ALL previous days' tasks.
```
**Check for:**
- Tasks from previous days still NOT marked COMPLETED → these are backlog
- Open issues from Day 1 diagnosis (GENIESUITE_DAY1_DIAGNOSIS.md) still unresolved
- Any tasks you marked "in-progress" but didn't finish
- Priority re-assessment: should any backlog item take precedence over today's tasks?

**Output:**
- Backlog items (carried from previous days)
- Today's planned tasks
- Recommended priority order

### Step 5: Check Shared Resources — "What's newly available?" (1 min)
```
Read SHARED_CHANGELOG.md → "Quick Reference" section at bottom.
```
**Check for:**
- New hooks Lovable created that you can import
- New UI components available in src/components/ui/
- Updated service APIs or config changes
- Any shared resource YOU created that Lovable is now depending on (don't break it!)

### Step 6: Build Check — "Is the codebase healthy?" (1 min)
```bash
npm run build
```
- If build PASSES: proceed to Step 7
- If build FAILS: investigate what changed, fix before proceeding, document in standup

### Step 7: Git Sync — "Am I up to date?" (1 min)
```bash
git fetch origin main
git log --oneline origin/main..HEAD | head -10
```
- If new commits on main: rebase if needed
- Verify no unexpected file changes in your territory

### After Morning Routine — Report to User:
```
Summarize in a structured message:

📅 Sprint Day N (Feb NN) — [Theme]

✅ COMPLETED (previous days):
- C-NNN: <task> — done
- C-NNN: <task> — done

📋 BACKLOG (carried over):
- C-NNN: <task> — reason it's incomplete

🎯 TODAY'S TASKS:
1. C-NNN: <task> [Priority] — can start ✓ | blocked by X
2. C-NNN: <task> [Priority] — can start ✓ | blocked by X

📝 FROM LOVABLE:
- <any relevant changes, blockers, or requests>

🔗 HANDOFFS FOR LOVABLE TODAY:
- H-NNN: <artifact> — status: ready ✓ | pending ⏳ | blocked ❌
- H-NNN: <artifact> — status: ready ✓ | pending ⏳ | blocked ❌

🔧 SHARED RESOURCES:
- <new hooks/services available>

🏗️ BUILD: ✅ passing | ❌ failing (details)

Ready to start Day N tasks?
```

---

## DURING WORK — Continuous Updates

While working on tasks throughout the day:

### On Task Start:
- Update task status to "in-progress" in your local tracking
- Note the start time

### On Finding a Bug or Issue:
- Add to GENIESUITE_DAY1_DIAGNOSIS.md if it's a new finding
- If it affects Lovable's code, add a SHARED_CHANGELOG entry immediately
- If it blocks your work, document the blocker

### On Creating/Modifying Shared Resources:
- Add SHARED_CHANGELOG entry IMMEDIATELY (don't wait for EOD)
- Include: what changed, why, how to use it, impact on Lovable

### On Completing a Task:
- Update CSV: mark COMPLETED, fill Actual Effort, fill Findings Summary
- If the task produced shared resources, update SHARED_CHANGELOG
- **TEAM LEAD DUTY:** Check if this task is a producer for any Handoff.
  If yes, update the handoff status in `data-dependencies.ts` to 'ready'
  and add a SHARED_CHANGELOG entry so Lovable knows immediately.

### On Completing a Handoff Producer Task:
- Update `data-dependencies.ts` — set handoff status to `'ready'`
- Update SHARED_CHANGELOG with what Lovable can now use
- Update the "Cross-Functional Handoffs" table in SHARED_CHANGELOG

### On Getting Blocked:
- Document the blocker with specifics
- Check if Lovable's work can help unblock
- Consider re-prioritizing to work on unblocked tasks first
- **If Lovable is blocked by YOUR work**, escalate priority of the blocking task

---

## SESSION END — EOD Routine (Before Stopping)

Before ending any session, Claude MUST complete ALL steps:

### 1. Update Shared Changelog
Add entries to `SHARED_CHANGELOG.md` for EVERY shared resource you created/modified/fixed today.
```markdown
### [HH:MM] <Type> — <Short Description>
- **File(s):** `path/to/file.ts`
- **Changed By:** Claude
- **What Changed:** Brief description
- **Why:** Motivation / bug fix / enhancement
- **How to Use:** Import path or code example
- **Impact on Your Work:**
  - Claude: <what you should remember>
  - Lovable: <what Lovable needs to know>
- **Breaking Changes:** None | <description>
```

### 2. Add Standup Entry
Add your standup to the `standups` array in `SprintTrackerDashboard.tsx`:
```typescript
{
  day: N,
  developer: 'claude' as Developer,
  yesterday: 'Completed C-NNN: ..., C-NNN: ...',
  today: 'Next session: C-NNN: ..., C-NNN: ...',
  blockers: 'None' | 'Specific blocker with details...',
  createdAt: 'YYYY-MM-DDTHH:MM:SSZ',
}
```

### 3. Update CSV Status
In `GENIESUITE_PROJECT_PLAN.csv`:
- Mark completed tasks as `COMPLETED`
- Fill `Actual Effort` with hours spent
- Fill `Findings Summary` with what you discovered/built
- Add notes for any blockers or issues

### 4. Review What Carries to Tomorrow
- List any unfinished tasks → these become tomorrow's backlog
- List any new issues discovered → add target day
- List any dependency changes → update Dependencies column

### 5. Build + Commit + Push
```bash
npm run build && git add -A && git commit -m "day N: <summary>" && git push -u origin claude/genie-suite-ecosystem-Zm8XP
```

---

## Territory Rules

### My Files (Claude owns):
- `src/pages/GenieSpark.tsx`, `GenieMind.tsx`, `GenieDeck.tsx`
- `src/components/genie-studio/**` (150+ files)
- `src/components/genie-spark/**`
- `src/components/genie-admin/**`
- `src/components/navigation/Quadrant*`

### Never Touch (Lovable's files):
- `src/components/landing/**`
- `src/hooks/landing/**`
- `src/pages/GenieExplore*.tsx`, `GenieProducts*.tsx`, `GenieSupport*.tsx`

### Never Modify (Locked shared infrastructure):
- `src/constants/genie-products.ts` (read-only import)
- `src/hooks/useMasterAuth.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/components/auth/GenieStudioProtectedRoute.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/GenieStudioLayout.tsx`
- `src/integrations/supabase/**`
- `src/config/genieStudioNavItems.ts`

## Key Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Sprint tracker: navigate to `/genie-admin?tab=sprint-tracker`
