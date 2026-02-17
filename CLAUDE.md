# CLAUDE.md — Auto-Triggered Session Instructions

## Project Context
GenieSuite Ecosystem — Dual-developer sprint (Claude Code + Lovable)
Sprint: Feb 17-21, 2026 | 5 days | 41 tasks | 3 products (Spark, Mind, Deck)

## SESSION START — Morning Routine (Auto-Triggered)

Every time this session starts, Claude MUST execute these 5 steps IN ORDER before doing any other work:

### Step 1: Read Shared Changelog (What changed overnight?)
```
Read SHARED_CHANGELOG.md — find the latest day's entries.
Look for:
- Entries marked "Impact on Claude" — these affect your modules
- Any BREAKING changes to shared infrastructure
- New shared hooks/services/utils you can leverage
- Bug reports about your code from Lovable
```

### Step 2: Read Partner's Standup (Any blockers about my code?)
```
Read src/components/genie-admin/SprintTrackerDashboard.tsx
Find the `standups` array → read Lovable's latest entry.
Look for:
- Blockers Lovable reported about your modules
- Completed tasks that unblock your work
- Shared sync tasks (S-*) needing coordination
```

### Step 3: Check Today's Tasks (What do I work on?)
```
Read GENIESUITE_PROJECT_PLAN.csv
Determine the current sprint day (Day 1=Feb 17, Day 2=Feb 18, etc.)
Find rows where Developer = "Claude" for today's day number.
List your tasks for the day with priorities.
```

### Step 4: Build Check (Is the codebase healthy?)
```bash
npm run build
```
If build fails: investigate what changed, fix before proceeding.

### Step 5: Git Sync (Am I up to date?)
```bash
git fetch origin main
git log --oneline origin/main..HEAD | head -10
```
If new commits on main: rebase if needed.

### After Morning Routine — Report to User:
Summarize in a brief message:
- Current sprint day and your tasks for today
- Any changes from Lovable that affect your work
- Any blockers or risks
- Build status
- Then ask: "Ready to start Day N tasks?"

---

## SESSION END — EOD Routine (Before Stopping)

Before ending any session, Claude MUST:

### 1. Update Shared Changelog
Add entries to `SHARED_CHANGELOG.md` for every shared resource you created/modified/fixed.

### 2. Add Standup Entry
Add your standup to the `standups` array in `SprintTrackerDashboard.tsx`:
```typescript
{
  day: N,
  developer: 'claude' as Developer,
  yesterday: 'Completed C-NNN: ...',
  today: 'Next session: C-NNN ...',
  blockers: 'None' | 'Specific blocker...',
  createdAt: 'ISO timestamp',
}
```

### 3. Update CSV Status
In `GENIESUITE_PROJECT_PLAN.csv`: mark tasks COMPLETED, fill Actual Effort, fill Findings Summary.

### 4. Build + Commit + Push
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
