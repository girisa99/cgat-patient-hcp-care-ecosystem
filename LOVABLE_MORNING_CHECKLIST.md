# Lovable Developer — Morning Checklist

**Role:** Landing page, product catalog, explore pages, pricing, demos, legal pages
**Sprint:** Feb 17-21, 2026

> This checklist is DIFFERENT from Claude's morning checklist.
> Lovable focuses on landing/marketing surfaces; Claude focuses on CREATE module internals.
> Both share the same SHARED_CHANGELOG.md for cross-developer visibility.

---

## Every Morning: 5-Step Startup (in order)

### Step 1: Read Shared Changelog (2 min)
```
READ: SHARED_CHANGELOG.md
```
**What to look for:**
- Did Claude create or update any shared hooks, services, or utilities you can leverage?
- Did Claude fix bugs that affect your landing pages? (Check entries marked "Impact on Lovable")
- Are there any BREAKING changes? (route changes, API changes, config changes)
- Did Claude add new shared UI components you should use?
- Did Claude fix product data you display? (taglines, descriptions, pricing tiers)

**Action items from changelog:**
- [ ] Note any route changes (e.g., `/genie-studio/productions` → `/genie-admin?tab=library`)
- [ ] Note any tagline/product data corrections
- [ ] Note any new shared hooks/services available
- [ ] Note any bug reports about your code

### Step 2: Check Claude's Standup (2 min)
```
READ: src/components/genie-admin/SprintTrackerDashboard.tsx
       → Find the `standups` array
       → Read Claude's latest entry
```
**What to look for:**
- Blockers Claude reported about your code
- Whether Claude completed tasks that affect your pages (product routes, navigation, auth flows)
- Any new CREATE module features you should showcase on landing pages
- Shared sync tasks (S-*) that need your input

### Step 3: Check Your Task Schedule (2 min)
```
READ: GENIESUITE_PROJECT_PLAN.csv
       → Filter for today's Day number
       → Look at rows with Developer = "Lovable"
```

**Your daily focus areas:**
| Day | Focus | Key Tasks |
|-----|-------|-----------|
| Day 1 (Feb 17) | Foundation audit | L-101 to L-104 |
| Day 2 (Feb 18) | Products + pricing | L-201 to L-204 |
| Day 3 (Feb 19) | Interactive demos | L-301 to L-304 |
| Day 4 (Feb 20) | Mobile + polish | L-401 to L-404 |
| Day 5 (Feb 21) | Final verify + merge | L-501 to L-504 |

### Step 4: Run Build (1 min)
```bash
npm run build
```
- If build fails: check `git log --oneline -3` to see what changed
- If Claude's changes broke the build: document in your standup entry
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
src/components/landing/**             ← All landing page components (47 files)
src/hooks/landing/**                  ← Landing page hooks (2 files)
src/pages/GenieExplorePage.tsx         ← Explore journey page
src/pages/GenieExploreDemoPage.tsx     ← Explore demo page
src/pages/GenieProductsPage.tsx        ← Product catalog page
src/pages/GenieSupportPage.tsx         ← Support page
src/pages/GeniePricingPage.tsx         ← Pricing page (if exists)
src/config/regionalLandingConfig.ts    ← Regional content config
LOVABLE_DEVELOPER_GUIDE.md            ← Your full guide
GENIESUITE_PROJECT_PLAN.csv           ← Update your task status here
```

## Locked Files (Never Modify)
```
src/constants/genie-products.ts       ← READ ONLY — import taglines/names
src/hooks/useMasterAuth.tsx           ← Auth state
src/components/auth/ProtectedRoute.tsx
src/components/auth/GenieStudioProtectedRoute.tsx
src/components/layout/AppLayout.tsx
src/components/layout/GenieStudioLayout.tsx
src/integrations/supabase/**
src/config/genieStudioNavItems.ts
```

## Claude's Territory (Never Modify)
```
src/pages/GenieSpark.tsx
src/pages/GenieMind.tsx
src/pages/GenieDeck.tsx
src/components/genie-studio/**        ← 150+ files
src/components/genie-spark/**
src/components/genie-admin/**
src/components/navigation/Quadrant*
GENIESUITE_DAY1_DIAGNOSIS.md
GENIESUITE_DUAL_DEVELOPER_STRATEGY.md
```

---

## Key Shared Resources You Should Use

> Always import from shared sources — never hardcode product data.

### Product Data (from `@/constants/genie-products`)
```typescript
import { GENIE_PRODUCTS, GENIE_SUITE } from '@/constants/genie-products';

// Product names, taglines, descriptions, logos:
GENIE_PRODUCTS.spark.name        // "Genie Spark"
GENIE_PRODUCTS.spark.tagline     // "Ignite Your Ideas"
GENIE_PRODUCTS.mind.tagline      // "AI That Understands"
GENIE_PRODUCTS.deck.tagline      // "Ideas to Impact"
GENIE_SUITE.tagline              // "Mind to Media"
```

### Support Email
```
support@geniaisuite.com   ← Use this everywhere (NOT example.com)
```

### Product Routes (link to these from landing CTAs)
```
/genie-spark              ← Spark creation page
/genie-mind               ← Mind editing page
/genie-deck               ← Deck presentation page
/genie-admin?tab=library  ← Production hub (NOT /genie-studio/productions)
```

### Subscription Tiers (for pricing pages)
```
Free:     Spark only (5 scripts/month)
Starter:  Spark + Mind
Business: Spark + Mind + Vibe + Deck
Pro:      All 7 products (unlimited)
```

### 14 Supported Regions
```
NAM, EUR, UK, MENA, India, SEA, China, Japan, Korea, ANZ, LATAM, Africa, Caribbean, Pacific Islands
```

---

## End-of-Day: Update Shared Changelog

Before ending your session, you MUST:

### 1. Add Changelog Entries
Edit `SHARED_CHANGELOG.md` — add entries for every shared resource you created, modified, or fixed:
```markdown
### [HH:MM] <Type> — <Short Description>
- **File(s):** `path/to/file.ts`
- **Changed By:** Lovable
- **What Changed:** ...
- **Impact on Your Work:**
  - Lovable: ...
  - Claude: <what Claude needs to know>
```

### 2. Add Your Standup Entry
Edit `SprintTrackerDashboard.tsx` — add to the `standups` array:
```typescript
{
  day: N,
  developer: 'lovable' as Developer,
  yesterday: 'Completed L-NNN: ...',
  today: 'Working on L-NNN: ...',
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
git push
```

---

## What's Different From Claude's Morning Checklist?

| Aspect | Claude Checks | Lovable Checks |
|--------|---------------|----------------|
| **Primary focus** | CREATE module bugs (Spark/Mind/Deck internals) | Landing page rendering, demos, pricing |
| **Route changes** | Internal navigation between Spark/Mind/Deck | CTA links from landing → studio |
| **Shared resources** | Uses hooks/services for AI, media, scripts | Uses product constants for display |
| **Bug impact** | Checks if Lovable found bugs in CREATE modules | Checks if Claude fixed routes/data that landing displays |
| **Open issues** | S-*, M-*, D-* issues in code | L-* tasks for landing/marketing |
| **Key data** | Script schemas, AI provider configs | Product names, taglines, pricing, regions |
| **Merge order** | Merges to main FIRST on Day 5 | Merges AFTER Claude on Day 5 |

Both developers read the SAME `SHARED_CHANGELOG.md` — but they look for different things in it.
