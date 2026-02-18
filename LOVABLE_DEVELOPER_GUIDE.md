# Lovable Developer Guide — GenieSuite 5-Day Sprint

**Sprint:** Feb 17-21, 2026
**Your Role:** Landing page, product catalog, explore pages, pricing, demos, legal pages
**Partner:** Claude Code (Genie Spark, Genie Mind, Genie Deck, admin, navigation)

---

## DAILY MORNING ROUTINE (Do This Every Session Start)

> **Quick Start:** Follow `LOVABLE_MORNING_CHECKLIST.md` for a streamlined, Lovable-specific checklist.
> Claude has a separate checklist: `CLAUDE_MORNING_CHECKLIST.md` (different focus areas).

### Step 0: Read Shared Changelog (NEW — Most Important)
```
READ: SHARED_CHANGELOG.md
```
This is the single source of truth for what changed overnight. Both developers update it.
Look for entries marked "Impact on Lovable" — these tell you exactly what you need to know.

### Step 1: Read Claude's Latest Updates
```
READ these files at the start of every session:
1. SHARED_CHANGELOG.md — What shared resources changed (NEW)
2. GENIESUITE_DAY1_DIAGNOSIS.md — Claude's diagnosis findings (will be updated daily)
3. GENIESUITE_PROJECT_PLAN.csv — Full sprint plan with status, findings, actual effort
4. src/components/genie-admin/SprintTrackerDashboard.tsx — Sprint Tracker (look at SPRINT_TASKS array for your tasks, DEFAULT_TASK_OVERRIDES for Claude's completed work)
```

### Step 2: Check Current Day's Tasks
Find your tasks for the current day in `GENIESUITE_PROJECT_PLAN.csv`:
- Your tasks are prefixed with `L-` (Lovable)
- Claude's tasks are prefixed with `C-` (Claude)
- Sync tasks are prefixed with `S-` (Shared)

### Step 3: Review Standup Logs
In `SprintTrackerDashboard.tsx`, check the `standups` array in `useSprintTrackerState()` for Claude's standup entries — these tell you what was done yesterday, what's planned today, and any blockers.

### Step 4: Check for Merge Conflicts
```bash
git fetch origin main
git log --oneline origin/main..HEAD | head -5
```

### Step 5: Run Build Before Starting
```bash
npm run build
```
If build fails, STOP and check what changed on main.

---

## YOUR TASK SCHEDULE

### Day 1 (Feb 17) — Foundation & Assessment
| Task | Priority | Files | Acceptance Criteria |
|------|----------|-------|---------------------|
| L-101: Audit RegionalLandingPage.tsx | High | `src/components/landing/RegionalLandingPage.tsx` | All 14 regions render without errors |
| L-102: Audit GenieExplorePage | High | `src/pages/GenieExplorePage.tsx` | Explore steps 1-N complete without errors |
| L-103: Fix broken hero sections | Medium | `src/components/landing/HeroLandingVideo.tsx`, `HeroInteractiveVideo.tsx` | Hero videos play, interactive elements respond |
| L-104: Verify legal pages | Low | `src/pages/TermsOfServicePage.tsx`, `PrivacyPolicyPage.tsx` | All 6 legal pages load and display content |

### Day 2 (Feb 18) — Products + Pricing
| Task | Priority | Files | Acceptance Criteria |
|------|----------|-------|---------------------|
| L-201: Fix GenieProductsPage | High | `src/pages/GenieProductsPage.tsx` | Product catalog shows all 7 products correctly |
| L-202: Fix pricing section | High | `src/components/landing/RegionalPricingSection.tsx` | Pricing tiers correct per region |
| L-203: Verify Explore demos | Medium | `src/pages/GenieExploreDemoPage.tsx` | Demo flows complete |
| L-204: Add missing landing sections | Medium | `src/components/landing/**` | All planned sections present |

### Day 3 (Feb 19) — Interactive Demos
| Task | Priority | Files | Acceptance Criteria |
|------|----------|-------|---------------------|
| L-301: Fix interactive demos | High | `InteractiveTryGenieDemo.tsx`, `STTDemo.tsx` | Demos respond to user interaction |
| L-302: Fix DeepLTranslationDemo | Medium | `DeepLTranslationDemo.tsx` | Translation works with sample text |
| L-303: Fix video showcases | High | `GenieVideoShowcase.tsx`, `HeroLandingVideo.tsx` | Videos play and showcase sections render |
| L-304: Verify region switching | Medium | `RegionSwitcherNav.tsx`, `regionalLandingConfig.ts` | All 14 regions work |

### Day 4 (Feb 20) — Mobile + Polish
| Task | Priority | Files | Acceptance Criteria |
|------|----------|-------|---------------------|
| L-401: Mobile responsiveness | High | `src/components/landing/**` | Landing renders on 320px, 375px, 768px |
| L-402: SEO meta tags | Medium | `RegionalLandingPage.tsx` | OG tags present per region |
| L-403: Performance optimization | Medium | `src/components/landing/**` | Lighthouse improved, lazy loading verified |
| L-404: Cross-browser testing | Low | `src/components/landing/**` | Works on Chrome, Firefox, Safari, Edge |

### Day 5 (Feb 21) — Final Verification + Merge
| Task | Priority | Files | Acceptance Criteria |
|------|----------|-------|---------------------|
| L-501: All landing routes work | High | Routes: `/genie-landing/nam`, `/explore`, `/products`, `/pricing` | No errors on any route |
| L-502: Navigation: landing → auth → studio | High | Landing page CTA links | Full navigation flow works |
| L-503: Run build and prepare merge | High | Full codebase | Build passes |
| L-504: Rebase and merge | High | Git operations | Clean merge (AFTER Claude merges first) |

---

## HOW TO UPDATE STATUS DAILY

### 1. Update the CSV Project Plan
Edit `GENIESUITE_PROJECT_PLAN.csv`:
- Change your task `Status` column from `Not Started` to `In Progress` or `COMPLETED`
- Fill in `Actual Effort` column with real hours spent
- Fill in `Findings Summary` with what you discovered and fixed
- Add any new issues found in the `Notes` column

### 2. Add Your Standup to Sprint Tracker
In `src/components/genie-admin/SprintTrackerDashboard.tsx`, find the `standups` array inside `useSprintTrackerState()` and add an entry like this:

```typescript
{
  day: 2, // current sprint day
  developer: 'lovable' as Developer,
  yesterday: 'Completed L-101: Audited RegionalLandingPage - found 5 broken region configs. Fixed NAM, EUR, MENA.',
  today: 'Working on L-201 (GenieProductsPage) and L-202 (pricing section). Will update product catalog display.',
  blockers: 'Need to verify if regional pricing data comes from config or Supabase.',
  createdAt: '2026-02-18T09:00:00Z', // use current date
},
```

### 3. Update Task Overrides (Mark Tasks Done)
In the same file, add your completed tasks to `DEFAULT_TASK_OVERRIDES`:

```typescript
'L-101': { status: 'completed', updatedAt: '2026-02-17T17:00:00Z', note: 'Describe what you found and fixed' },
```

### 4. Run Build
```bash
npm run build
```
Build MUST pass before every commit. If it fails, fix before committing.

---

## FILES YOU CAN MODIFY (Your Territory)

```
src/components/landing/**           ← All landing page components (47 files)
src/hooks/landing/**                ← Landing page hooks (2 files)
src/pages/GenieExplorePage.tsx       ← Explore journey page
src/pages/GenieExploreDemoPage.tsx   ← Explore demo page
src/pages/GenieProductsPage.tsx      ← Product catalog page
src/pages/GenieSupportPage.tsx       ← Support page
src/pages/GeniePricingPage.tsx       ← Pricing page (if exists)
src/config/regionalLandingConfig.ts  ← Regional content config
GENIESUITE_PROJECT_PLAN.csv          ← Update your task status here
LOVABLE_DEVELOPER_GUIDE.md           ← This file (you can add notes)
```

---

## FILES YOU MUST NEVER MODIFY (Locked)

These files are shared infrastructure. Modifying them will cause merge conflicts.

```
NEVER MODIFY:
├── src/constants/genie-products.ts      ← Product definitions (READ ONLY — import from it)
├── src/hooks/useMasterAuth.tsx          ← Auth state
├── src/components/auth/ProtectedRoute.tsx
├── src/components/auth/GenieStudioProtectedRoute.tsx
├── src/components/layout/AppLayout.tsx  ← Main app layout
├── src/components/layout/GenieStudioLayout.tsx
├── src/integrations/supabase/**         ← Database layer
├── src/config/genieStudioNavItems.ts    ← Nav items + tier gating
└── src/App.tsx                          ← Route definitions
```

---

## FILES YOU MUST NEVER TOUCH (Claude's Territory)

These are Claude's files. Do not modify, delete, or restructure them.

```
HANDS OFF:
├── src/pages/GenieSpark.tsx
├── src/pages/GenieMind.tsx
├── src/pages/GenieDeck.tsx
├── src/pages/GenieVibe.tsx (if exists)
├── src/components/genie-studio/**       ← 150+ files, all Claude's
├── src/components/genie-spark/**        ← Spark-specific components
├── src/components/genie-admin/**        ← Admin hub + sprint tracker
├── src/components/navigation/Quadrant*.tsx
├── GENIESUITE_DAY1_DIAGNOSIS.md         ← Claude's diagnosis (read only)
└── GENIESUITE_DUAL_DEVELOPER_STRATEGY.md
```

---

## IMPORTANT PRODUCT CONTEXT

### Official Taglines (from `src/constants/genie-products.ts`)
Import these — never hardcode them:

| Product | Tagline | Import |
|---------|---------|--------|
| Genie Spark | "Ignite Your Ideas" | `GENIE_PRODUCTS.spark.tagline` |
| Genie Mind | "AI That Understands" | `GENIE_PRODUCTS.mind.tagline` |
| Genie Vibe | "Script to Screen" | `GENIE_PRODUCTS.vibe.tagline` |
| Genie Deck | "Ideas to Impact" | `GENIE_PRODUCTS.deck.tagline` |
| Genie Hub | "Your Creative Command Center" | `GENIE_PRODUCTS.hub.tagline` |
| Genie Cast | "Make It. Show It. Scale It." | `GENIE_PRODUCTS.cast.tagline` |
| Genie Suite | "Mind to Media" | `GENIE_SUITE.tagline` |

**How to use:**
```typescript
import { GENIE_PRODUCTS, GENIE_SUITE } from '@/constants/genie-products';

// Use in components:
<h2>{GENIE_PRODUCTS.spark.name}</h2>        // "Genie Spark"
<p>{GENIE_PRODUCTS.spark.tagline}</p>         // "Ignite Your Ideas"
<p>{GENIE_PRODUCTS.spark.description}</p>     // Full description
<img src={GENIE_PRODUCTS.spark.logos.combined} />  // Product logo
```

### Subscription Tiers
```
Free:     Spark only (5 scripts/month)
Starter:  Spark + Mind
Business: Spark + Mind + Vibe + Deck
Pro:      All 7 products (unlimited)
```

### 14 Supported Regions
NAM (North America), EUR (Europe), UK, MENA (Middle East), India, SEA (Southeast Asia), China, Japan, Korea, ANZ (Australia/NZ), LATAM (Latin America), Africa, Caribbean, Pacific Islands

---

## MERGE ORDER (Day 5)

1. Claude merges to `main` FIRST
2. Lovable then rebases onto updated `main` and merges
3. This prevents merge conflicts

```bash
# Day 5 merge procedure for Lovable:
git fetch origin main
git rebase origin/main
npm run build   # Must pass!
git push
# Then create PR to main
```

---

## END-OF-DAY CHECKLIST

Before ending your session each day:

- [ ] **SHARED_CHANGELOG.md updated** with entries for any shared resources you created/modified/fixed
- [ ] All assigned tasks for the day marked as completed (or noted as in-progress with reason)
- [ ] `npm run build` passes
- [ ] CSV updated with status, actual effort, and findings
- [ ] Standup entry added to SprintTrackerDashboard.tsx for next morning
- [ ] No locked files modified (check with `git diff --name-only`)
- [ ] No Claude territory files modified (check for `genie-studio/`, `genie-spark/`, `genie-admin/`)
- [ ] Changes committed with descriptive message
- [ ] Branch pushed to remote

---

## IF YOU FIND BUGS IN CLAUDE'S FILES

Do NOT fix them yourself. Instead:
1. Document the issue in `GENIESUITE_PROJECT_PLAN.csv` under a new row
2. Add a note in your standup entry under `blockers`
3. Claude will see it at the start of the next session
