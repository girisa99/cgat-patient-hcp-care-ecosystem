# Shared Ecosystem Changelog

**Purpose:** Track all changes to shared resources (hooks, utils, services, configs, components) so both developers know exactly what was updated and what's newly available each morning.

**Rule:** Any time either developer creates, modifies, or enhances a shared resource, they MUST add an entry here. Both developers read this file at the start of every session.

---

## How to Use This Changelog

### For the Developer Making Changes
After you update or create a shared resource:
1. Add a new entry under the current day's section
2. Use the format below
3. Include: what changed, why, and how to use it

### For the Developer Reading Changes
At session start:
1. Find the latest day's section
2. Read all entries since your last session
3. Check "Impact on Your Work" for action items
4. Look for new hooks/utils/services you can leverage

### Entry Format
```markdown
### [HH:MM] <Type> — <Short Description>
- **File(s):** `path/to/file.ts`
- **Changed By:** Claude | Lovable
- **What Changed:** Brief description of the change
- **Why:** Motivation / bug fix / enhancement
- **How to Use:** Code example or import path
- **Impact on Your Work:**
  - Claude: <what Claude should know>
  - Lovable: <what Lovable should know>
- **Breaking Changes:** None | <description>
```

### Change Types
| Type | Meaning |
|------|---------|
| NEW | Brand new shared resource created |
| FIX | Bug fix in existing shared resource |
| ENHANCE | Enhancement to existing shared resource |
| DEPRECATE | Resource is being replaced — migrate away |
| BREAKING | API/signature change that requires updates |

---

## Day 1 — Monday, Feb 17, 2026

### [10:00] FIX — Race condition in GenieSpark content handlers
- **File(s):** `src/pages/GenieSpark.tsx`
- **Changed By:** Claude
- **What Changed:** All 4 content handlers (`handleSendToScriptEditor`, `handleSendToVibe`, `handleSendToProductionHub`, `handleSaveToKnowledgeBase`) now properly `await saveScript()` before navigation. Added try/catch with error toasts.
- **Why:** Scripts were not persisting before page navigation, causing blank script editors.
- **How to Use:** No API change — handlers now work correctly.
- **Impact on Your Work:**
  - Claude: Fixed. Will complete wizard flow in Day 3.
  - Lovable: If you link to Spark from landing CTAs, the create flow now works end-to-end.
- **Breaking Changes:** None

### [11:00] FIX — Broken route `/genie-studio/productions`
- **File(s):** `src/pages/GenieSpark.tsx`
- **Changed By:** Claude
- **What Changed:** Updated route from `/genie-studio/productions` (404) to `/genie-admin?tab=library&linkScript=ID`
- **Why:** Production Hub was moved during Genie Admin consolidation.
- **How to Use:** Use `/genie-admin?tab=library` to link to production hub.
- **Impact on Your Work:**
  - Claude: Fixed internally.
  - Lovable: If you reference production hub from landing pages, use the new route.
- **Breaking Changes:** Route changed — old route is 404.

### [12:00] FIX — Product tagline capitalization mismatch
- **File(s):** `src/constants/genie-products.ts`, `src/components/navigation/QuadrantProductHeader.tsx`
- **Changed By:** Claude
- **What Changed:** Standardized taglines to match `genie-products.ts` canonical values. Mind tagline fixed from "Think Beyond Limits" to "AI That Understands".
- **Why:** Inconsistent taglines between navigation header and product constants.
- **How to Use:** Always import from `@/constants/genie-products` — never hardcode taglines.
- **Impact on Your Work:**
  - Claude: Fixed in QuadrantProductHeader.
  - Lovable: If you display taglines on landing/products pages, import from `GENIE_PRODUCTS.*.tagline`.
- **Breaking Changes:** None — tagline values corrected.

### [13:00] FIX — Deck support email hardcoded
- **File(s):** `src/pages/GenieDeck.tsx`
- **Changed By:** Claude
- **What Changed:** Changed `support@example.com` to `support@geniaisuite.com`
- **Why:** Placeholder email was never updated.
- **How to Use:** If you need a support email, use `support@geniaisuite.com`
- **Impact on Your Work:**
  - Claude: Fixed.
  - Lovable: Use `support@geniaisuite.com` in any landing/support pages.
- **Breaking Changes:** None

### [15:00] ENHANCE — Sprint Tracker Dashboard
- **File(s):** `src/components/genie-admin/SprintTrackerDashboard.tsx`
- **Changed By:** Claude
- **What Changed:** Added comprehensive 41-task sprint tracking, Daily Review tab with standup logs, Day 1 diagnosis findings viewer, file ownership matrix, and progress metrics.
- **Why:** Need centralized sprint visibility for both developers.
- **How to Use:** Visit `/genie-admin?tab=sprint-tracker` or read the component's `SPRINT_TASKS` and `standups` arrays.
- **Impact on Your Work:**
  - Claude: Update `DEFAULT_TASK_OVERRIDES` and `standups` array daily.
  - Lovable: Read standups + task overrides every morning. Add your own standups here.
- **Breaking Changes:** None — new feature.

---

## Day 2 — Tuesday, Feb 18, 2026

> Both developers: Add your entries here as you work today.
> Remember to check Day 1 entries if this is your first session.

---

## Day 3 — Wednesday, Feb 19, 2026

> Entries will be added as work progresses.

---

## Day 4 — Thursday, Feb 20, 2026

> Entries will be added as work progresses.

---

## Day 5 — Friday, Feb 21, 2026

> Final merge day. Document any last-minute shared changes here.

---

## Quick Reference: Shared Resources Available

This section is a living index of shared resources both developers can use. Updated as new resources are created.

### Shared Hooks (import from `@/hooks/`)
| Hook | Purpose | Added |
|------|---------|-------|
| `useMasterAuth` | Authentication state (LOCKED — read-only) | Pre-sprint |
| `useGlobalTier` | Cross-product subscription tier access | Pre-sprint |
| `useFetchWithTimeout` | Edge function calls with timeout | Pre-sprint |
| `useSharedModuleLogic` | Common module patterns | Pre-sprint |
| `useAudioElement` | Audio playback with cleanup | Pre-sprint |

### Shared Services (import from `@/services/`)
| Service | Purpose | Added |
|---------|---------|-------|
| `aiProviderService` | Multi-provider AI routing | Pre-sprint |
| `aiMediaService` | Media generation orchestration | Pre-sprint |
| `regionalLanguageService` | i18n and locale management | Pre-sprint |
| `regionalComplianceRegistry` | Region-specific compliance rules | Pre-sprint |

### Shared Config (import from `@/shared/config/`)
| Config | Purpose | Added |
|--------|---------|-------|
| `product-config.ts` | Product boundaries, routes, feature flags | Pre-sprint |

### Shared Constants (import from `@/constants/`)
| Constant | Purpose | Added |
|----------|---------|-------|
| `genie-products.ts` | Product names, taglines, logos (LOCKED) | Pre-sprint |

### Shared UI Components (import from `@/components/ui/`)
| Component | Purpose | Added |
|-----------|---------|-------|
| `shadcn/ui` suite | 40+ base UI primitives | Pre-sprint |
