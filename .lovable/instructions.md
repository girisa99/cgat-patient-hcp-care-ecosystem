# Lovable Developer — Auto-Triggered Session Instructions

## Project Context
GenieSuite Ecosystem — Dual-developer sprint (Claude Code + Lovable)
Sprint: Feb 17-21, 2026 | 5 days | 41 tasks | 3 products (Spark, Mind, Deck)
You (Lovable) own: Landing pages, product catalog, explore, pricing, demos, legal pages

## SESSION START — Morning Routine (Auto-Triggered Every Session)

Every time this session starts, execute these 5 steps IN ORDER before doing any other work:

### Step 1: Read Shared Changelog — "What shared things changed?" (2 min)
```
Read SHARED_CHANGELOG.md — find the latest day's entries.
Look for:
- Entries marked "Impact on Lovable" — these affect your pages
- BREAKING changes (route changes, API changes, config changes)
- New shared hooks/services/components you can use
- Product data corrections (taglines, descriptions, pricing)
- Bug reports about your code from Claude
```
**Key things Claude may have changed that affect you:**
- Route changes (e.g., `/genie-studio/productions` → `/genie-admin?tab=library`)
- Tagline/product data corrections in `genie-products.ts`
- Support email: use `support@geniaisuite.com` (NOT example.com)

### Step 2: Read Partner's Standup — "Any blockers about my code?" (2 min)
```
Read src/components/genie-admin/SprintTrackerDashboard.tsx
Find the `standups` array → read Claude's latest entry.
Look for:
- Blockers Claude reported about your code
- Completed features you should showcase on landing pages
- Shared sync tasks (S-*) needing your input
```

### Step 3: Check Today's Tasks — "What do I work on?" (2 min)
```
Read GENIESUITE_PROJECT_PLAN.csv
Determine the current sprint day (Day 1=Feb 17, Day 2=Feb 18, Day 3=Feb 19, Day 4=Feb 20, Day 5=Feb 21)
Find rows where Developer = "Lovable" for today's day number.
Your tasks are prefixed with L- (Lovable).
```

**Your daily focus:**
| Day | Focus | Tasks |
|-----|-------|-------|
| Day 1 (Mon) | Foundation audit | L-101 to L-104: Audit landing, explore, hero, legal |
| Day 2 (Tue) | Products + pricing | L-201 to L-204: Products page, pricing, explore demos |
| Day 3 (Wed) | Interactive demos | L-301 to L-304: STT demo, translation, video, regions |
| Day 4 (Thu) | Mobile + polish | L-401 to L-404: Responsive, SEO, performance, cross-browser |
| Day 5 (Fri) | Final verify + merge | L-501 to L-504: All routes, navigation, build, merge |

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
Summarize:
- Current sprint day and your tasks for today
- Any changes from Claude that affect your landing pages
- Build status
- Then start working on today's tasks

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
  blockers: 'None' | 'Specific blocker...',
  createdAt: 'ISO timestamp',
}
```

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
