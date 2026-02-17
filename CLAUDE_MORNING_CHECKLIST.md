# Claude Developer — Morning Checklist

**Role:** GenieSuite CREATE tools (Genie Spark, Genie Mind, Genie Deck, Admin, Navigation)
**Sprint:** Feb 17-21, 2026

> This checklist is DIFFERENT from Lovable's morning checklist.
> Claude focuses on CREATE module internals; Lovable focuses on landing/marketing.
> Both share the same SHARED_CHANGELOG.md for cross-developer visibility.

---

## Every Morning: 5-Step Startup (in order)

### Step 1: Read Shared Changelog (2 min)
```
READ: SHARED_CHANGELOG.md
```
**What to look for:**
- Did Lovable create or update any shared hooks, services, or utilities you can leverage?
- Did Lovable report bugs in your files? (Check entries marked "Impact on Claude")
- Are there any BREAKING changes to shared infrastructure?
- Are there new shared UI components you should use instead of building custom ones?

**Action items from changelog:**
- [ ] Note any new shared resources to use in today's work
- [ ] Note any bug reports that affect your modules
- [ ] Note any route changes that affect cross-module navigation

### Step 2: Check Lovable's Standup (2 min)
```
READ: src/components/genie-admin/SprintTrackerDashboard.tsx
       → Find the `standups` array
       → Read Lovable's latest entry
```
**What to look for:**
- Any blockers Lovable reported about your code
- Whether Lovable completed tasks that unblock your work (e.g., landing CTAs now point to your routes)
- Shared sync tasks (S-*) that need coordination

### Step 3: Check Your Task Schedule (2 min)
```
READ: GENIESUITE_PROJECT_PLAN.csv
       → Filter for today's Day number
       → Look at rows with Developer = "Claude"
```

**Your daily focus areas:**
| Day | Focus | Key Tasks |
|-----|-------|-----------|
| Day 1 (Feb 17) | Diagnose all 3 products | C-101 to C-104 |
| Day 2 (Feb 18) | Fix Genie Deck end-to-end | C-201 to C-203 |
| Day 3 (Feb 19) | Fix Genie Spark AI pipeline | C-301 to C-304 |
| Day 4 (Feb 20) | Fix Genie Mind editor | C-401 to C-404 |
| Day 5 (Feb 21) | Final verification + merge | C-501 to C-504 |

### Step 4: Run Build (1 min)
```bash
npm run build
```
- If build fails: check `git log --oneline -3` to see what changed
- If Lovable's changes broke the build: document in your standup entry
- DO NOT proceed until build passes

### Step 5: Check for Merge Conflicts (1 min)
```bash
git fetch origin main
git log --oneline origin/main..HEAD | head -10
```
- If new commits on main: `git rebase origin/main` (resolve conflicts if needed)
- Verify no unexpected file changes in your territory

---

## Your Territory (Files You Own)

```
src/pages/GenieSpark.tsx              ← Spark creation page
src/pages/GenieMind.tsx               ← Mind editing page
src/pages/GenieDeck.tsx               ← Deck presentation page
src/pages/GenieVibe.tsx               ← Vibe page (if exists)
src/components/genie-studio/**        ← 150+ studio components
src/components/genie-spark/**         ← Spark-specific components
src/components/genie-admin/**         ← Admin hub + sprint tracker
src/components/navigation/Quadrant*   ← Product navigation
GENIESUITE_DAY1_DIAGNOSIS.md          ← Your diagnosis (you maintain)
GENIESUITE_DUAL_DEVELOPER_STRATEGY.md ← Strategy doc (you maintain)
```

## Locked Files (Never Modify)
```
src/constants/genie-products.ts       ← READ ONLY — import from it
src/hooks/useMasterAuth.tsx           ← Auth state
src/components/auth/ProtectedRoute.tsx
src/components/auth/GenieStudioProtectedRoute.tsx
src/components/layout/AppLayout.tsx
src/components/layout/GenieStudioLayout.tsx
src/integrations/supabase/**
src/config/genieStudioNavItems.ts
```

## Lovable's Territory (Never Modify)
```
src/components/landing/**             ← All landing page components
src/hooks/landing/**                  ← Landing hooks
src/pages/GenieExplorePage.tsx
src/pages/GenieExploreDemoPage.tsx
src/pages/GenieProductsPage.tsx
src/pages/GenieSupportPage.tsx
src/pages/GeniePricingPage.tsx
src/config/regionalLandingConfig.ts
LOVABLE_DEVELOPER_GUIDE.md
```

---

## End-of-Day: Update Shared Changelog

Before ending your session, you MUST:

### 1. Add Changelog Entries
Edit `SHARED_CHANGELOG.md` — add entries for every shared resource you created, modified, or fixed:
```markdown
### [HH:MM] <Type> — <Short Description>
- **File(s):** `path/to/file.ts`
- **Changed By:** Claude
- **What Changed:** ...
- **Impact on Your Work:**
  - Claude: ...
  - Lovable: <what Lovable needs to know>
```

### 2. Add Your Standup Entry
Edit `SprintTrackerDashboard.tsx` — add to the `standups` array:
```typescript
{
  day: N,
  developer: 'claude' as Developer,
  yesterday: 'Completed C-NNN: ...',
  today: 'Working on C-NNN: ...',
  blockers: 'None' | 'Specific blocker...',
  createdAt: '2026-02-NNT09:00:00Z',
},
```

### 3. Update CSV Status
Edit `GENIESUITE_PROJECT_PLAN.csv`:
- Mark completed tasks as `COMPLETED`
- Fill `Actual Effort` hours
- Fill `Findings Summary`

### 4. Build Check
```bash
npm run build  # MUST pass before commit
```

### 5. Commit & Push
```bash
git add -A && git commit -m "day N: <summary of changes>"
git push origin claude/genie-suite-ecosystem-Zm8XP
```

---

## Open Issues Assigned to You

> Updated daily. Check GENIESUITE_PROJECT_PLAN.csv for the latest.

### Day 2 Targets
- D-002: DeckDemoCard fallback UI
- D-003: Tier gating client-side check
- D-004: Generic error messages
- D-005: AI image loading skeleton
- D-006: Carousel aria-pressed
- X-002: QuadrantProductHeader hardcodes data

### Day 3 Targets
- S-006: SmartContentPipeline simulated AI
- S-008: SparkGuidedWizard fake generation
- S-011: Image-to-Script navigation
- S-012: QuickTemplateSelector pre-fill
- S-013: Refine/Export phase completion

### Day 4 Targets
- M-002: Voiceover save stub
- M-003: ScriptEditorTab 127KB deep dive
- M-004: Audio delete cross-product
- M-005: CrossFunctionalMusic API
- M-009: Stats bar mobile grid
- M-010: Tab URL sync
- M-011: Script card navigation
- M-012: SavedAudioCard stale URL
- M-013: BatchScriptGenerationWorkflow callbacks

### Day 5 Targets
- X-003: Shared error boundary
- C-501 to C-504: Final verification and merge
