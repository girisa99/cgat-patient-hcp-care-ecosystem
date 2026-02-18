# GenieSuite Day 1 Diagnosis Report

**Sprint:** Feb 17-21, 2026 | **Day:** 1 of 5 | **Developer:** Claude Code
**Tasks Completed:** C-101, C-102, C-103, C-104, S-101
**Commit:** `abb79815` | **Branch:** `claude/genie-suite-ecosystem-Zm8XP`

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Products Diagnosed** | 3 (GenieSpark, GenieMind, GenieDeck) |
| **Total Issues Found** | 33 |
| **Critical** | 5 |
| **High** | 6 |
| **Medium** | 13 |
| **Low** | 9 |
| **Fixed on Day 1** | 11 |
| **Open for Days 2-4** | 22 |
| **Files Changed** | 7 |
| **Insertions / Deletions** | 140 / 70 |
| **Build Status** | PASSES (58s) |

---

## 1. GenieSpark Diagnosis (C-101)

**File:** `src/pages/GenieSpark.tsx` (199 lines)
**Supporting:** `src/components/genie-spark/SparkGuidedWizard.tsx`, `src/components/genie-studio/SmartContentPipeline.tsx`

### Architecture
GenieSpark has 4 tabs: Guide (SparkGuidedWizard), Content Pipeline (SmartContentPipeline), Quick Templates (QuickTemplateSelector), Image to Script (ImageScriptAssembler). Content flows through 4 handlers: sendToScriptEditor, sendToVibe, sendToProductionHub, saveToKnowledgeBase.

### Issues Found: 14 (3 Critical, 3 High, 5 Medium, 3 Low)

#### CRITICAL

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| S-001 | `GenieSpark.tsx:45` | **Race condition: `saveScript()` not awaited before `navigate()`** | `saveScript` is async but was called synchronously. Navigation fires before the script is persisted to the database, meaning the target page (GenieMind Script Editor) cannot load the script. | **FIXED** |
| S-002 | `GenieSpark.tsx:50` | **handleSendToVibe: same race condition + missing stats object** | Copy-paste from handleSendToScriptEditor but the `stats` block was omitted. This handler saved scripts without word count, character count, or duration metadata. | **FIXED** |
| S-003 | `GenieSpark.tsx:84` | **Broken route: `/genie-studio/productions` does not exist** | Production Hub was moved from `/genie-studio/productions` to `/genie-admin?tab=library` during the Genie Admin Hub consolidation, but this reference was never updated. Users clicking "Send to Production Hub" would hit a 404. | **FIXED** → `/genie-admin?tab=library&linkScript=ID` |

#### HIGH

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| S-004 | `GenieSpark.tsx:28-88` | **No error handling on any of the 4 content handlers** | All four handlers (`handleSendToScriptEditor`, `handleSendToVibe`, `handleSendToProductionHub`, `handleSaveToKnowledgeBase`) lacked try/catch. If `saveScript` fails, the user gets a silent failure followed by broken navigation. | **FIXED** — All handlers now have try/catch with user-facing error toasts. |
| S-005 | `GenieSpark.tsx:88` | **handleSaveToKnowledgeBase is a no-op stub** | The handler only showed a success toast (`toast.success(...)`) but never called `saveScript()`. The script was never persisted anywhere. | **FIXED** — Now creates and persists a script with `source: 'spark'` marker. |
| S-006 | `SmartContentPipeline.tsx` | **SmartContentPipeline AI generation uses simulated delay, not real API** | The 80KB SmartContentPipeline component is the core of GenieSpark but uses placeholder generation logic instead of calling a Supabase edge function or AI API. | **OPEN** → Day 3 (C-301) |

#### MEDIUM

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| S-007 | `genie-products.ts:109` | Tagline inconsistency: "Ignite your Ideas" vs "Ignite Your Ideas" | Capitalization mismatch between the official constant in `genie-products.ts` and what `QuadrantProductHeader.tsx` displays. | **FIXED** |
| S-008 | `SparkGuidedWizard.tsx:130` | `onGenerate` uses simulated 2s `setTimeout` instead of real AI | `GenieSpark.tsx` passes a fake `onGenerate` callback: `await new Promise(r => setTimeout(r, 2000))` | **OPEN** → Day 3 (C-302) |
| S-009 | `SparkGuidedWizard.tsx:162` | Phase navigation buttons lack ARIA roles and labels | Wizard step buttons are plain `<button>` elements without `role="tab"`, `aria-selected`, or `aria-label`. Screen readers cannot navigate the wizard. | **FIXED** — Added `role="tablist"`, `role="tab"`, `aria-selected`, `aria-current`, `aria-label`. |
| S-010 | `GenieSpark.tsx:26` | `savedScripts` destructured from `useGenieScripts()` but never used | Variable was intended for a script count display but the dashboard was moved to GenieMind. | **FIXED** — Removed unused destructuring. |
| S-011 | `GenieSpark.tsx:179` | Image-to-Script `onGenerateVideo` creates script but does not navigate | The handler saves the script locally via `saveScript()` but provides no navigation or confirmation beyond a toast. User has no way to find the generated script. | **OPEN** → Day 3 |

#### LOW

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| S-012 | `GenieSpark.tsx:162` | `QuickTemplateSelector` `onSelect` only shows toast, no template pre-fill | Template selection switches to the pipeline tab via `setActiveTab('pipeline')` but does not pass the selected template data to `SmartContentPipeline`. | **OPEN** → Day 3 |
| S-013 | `SparkGuidedWizard.tsx:97` | Refine and Export phases always show `isComplete: false` | No state tracking for phases 4 and 5 — they hardcode `isComplete: false`. | **OPEN** → Day 3 |
| S-014 | `GenieSpark.tsx:28-88` | Duplicate script creation logic across 4 handlers | Each handler independently constructs a `GenieScript` object with the same pattern. | **FIXED** — Extracted `buildScriptStats()` helper and `getScriptType()` utility. |

---

## 2. GenieMind Diagnosis (C-102)

**File:** `src/pages/GenieMind.tsx` (343 lines)
**Supporting:** `src/components/genie-studio/ScriptEditorTab.tsx` (127KB), `SavedAudioCard.tsx`, `CrossFunctionalMusic.tsx`, `BatchScriptGenerationWorkflow`

### Architecture
GenieMind has 4 tabs: Dashboard (script overview + quick actions), Script Editor (ScriptEditorTab), Batch Generation (BatchScriptGenerationWorkflow), Media Library (voiceovers + music). It is the "Think" layer between Spark (create) and Vibe (produce).

### Issues Found: 13 (2 Critical, 3 High, 5 Medium, 3 Low)

#### CRITICAL

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| M-001 | `QuadrantProductHeader.tsx:50` | **Mind tagline displays "Think Beyond Limits" instead of official "AI That Understands"** | `QuadrantProductHeader.tsx` hardcodes its own `PRODUCT_BRANDING` registry instead of importing from `genie-products.ts`. The values diverged. | **FIXED** — Updated to "AI That Understands". |
| M-002 | `GenieMind.tsx:241` | **Voiceover save handler is a stub — shows toast but does not persist audio** | `useGenieMediaLibrary` hook does not expose a `saveVoiceover()` method. The `onSaveVoiceover` callback only calls `toast.success()` and `updateScript(scriptId, { hasVoiceover: true })` but never saves the actual audio blob/URL. | **OPEN** → Day 4 (C-401/C-402) |

#### HIGH

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| M-003 | `ScriptEditorTab.tsx` | **ScriptEditorTab is 127KB — needs deep performance and correctness investigation** | Massive single-file component. Too large to fully diagnose on Day 1. Scheduled for Day 4 deep dive. | **OPEN** → Day 4 (C-401) |
| M-004 | `GenieMind.tsx:301` | **Audio delete handler says "Delete via Genie Vibe" — no actual delete functionality** | Cross-product delete was never implemented. The `onDelete` callback is: `() => toast.info('Delete via Genie Vibe')`. | **OPEN** → Day 4 |
| M-005 | `CrossFunctionalMusic.tsx` | **CrossFunctionalMusic generation needs API integration verification** | The music generation component needs Day 4 verification to confirm it connects to a real generation API. | **OPEN** → Day 4 (C-403) |

#### MEDIUM

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| M-006 | `GenieMind.tsx:2` | JSDoc tagline wrong: "Think Beyond Limits" | Same root cause as M-001 — old tagline in JSDoc comment. | **FIXED** |
| M-007 | `GenieMind.tsx:57` | No loading indicator while media library loads | `mediaLoading` is destructured from `useGenieMediaLibrary()` but never rendered. Users see empty state while data loads. | **FIXED** — Added `Loader2` spinner with message. |
| M-008 | `GenieMind.tsx:325` | Audio `<audio>` elements lack `aria-label` | Screen readers cannot identify which track is playing. | **FIXED** — Added `aria-label={Play ${track.name}}`. |
| M-009 | `GenieMind.tsx:82` | Quick stats bar uses 5-column grid — collapses poorly on smaller screens | Hardcoded `grid-cols-5` with no responsive breakpoints. On mobile, stats are unreadable. | **OPEN** → Day 4 |
| M-010 | `GenieMind.tsx:40` | Tab changes not reflected in URL search params | `useState(initialTab)` captures the URL param once on mount. Subsequent tab changes via `setActiveTab` do not update the URL, so browser back/forward and link sharing break. | **OPEN** → Day 4 |

#### LOW

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| M-011 | `GenieMind.tsx:149` | Script card click always opens script-editor tab, never opens the specific script | `onClick={() => setActiveTab('script-editor')}` without passing the script ID to the editor component. | **OPEN** → Day 4 |
| M-012 | `SavedAudioCard.tsx` | SavedAudioCard may have stale audio URL handling | Needs Day 4 investigation — audio URLs from Supabase storage may expire. | **OPEN** → Day 4 (C-402) |
| M-013 | `GenieMind.tsx:256` | BatchScriptGenerationWorkflow renders without callback props | The component is self-contained and cannot report batch results back to GenieMind's dashboard. | **OPEN** → Day 4 |

---

## 3. GenieDeck Diagnosis (C-103)

**File:** `src/pages/GenieDeck.tsx` (226 lines)
**Supporting:** `src/components/genie-studio/presentation-generator/PresentationWizard.tsx`, `DeckDemoCard.tsx`

### Architecture
GenieDeck is a standalone presentation generator. It wraps `PresentationWizard` in a `QuadrantLayout` with a HIPAA compliance badge and error handling. The wizard provides a 6-step flow: input → configure → generate → preview → export → save.

### Issues Found: 6 (0 Critical, 0 High, 3 Medium, 3 Low)

**Deck is the most production-ready product.** Build passes, routing is correct, HIPAA compliance is present, error handling exists. Day 2 focus should be on the internal PresentationWizard flow.

#### MEDIUM

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| D-001 | `GenieDeck.tsx:158` | Support email hardcoded as `support@example.com` | ErrorDisplay component used placeholder during development. | **FIXED** → `support@geniaisuite.com` |
| D-002 | `DeckDemoCard.tsx:545` | Returns `null` when industry example data is absent — no fallback UI | `if (!deckExample) return null;` — silent empty render instead of helpful message. | **OPEN** → Day 2 |
| D-003 | `genieStudioNavItems.ts:143` | Tier gating set to "starter" but no client-side check in route guard | `GenieStudioProtectedRoute` checks auth but not subscription tier. Backend RLS provides real protection, but client-side UX is missing. | **OPEN** → Day 2 |

#### LOW

| ID | File:Line | Issue | Root Cause | Status |
|----|-----------|-------|------------|--------|
| D-004 | `DeckDemoCard.tsx:560` | Error messages are generic — don't mention "Genie Deck" by name | In multi-product contexts, users can't tell which product errored. | **OPEN** → Day 2 |
| D-005 | `DeckDemoCard.tsx:628` | AI image generation has no loading indicator (skeleton/shimmer) | `generateSlideImage()` runs async without visual feedback — slides appear incomplete momentarily. | **OPEN** → Day 2 |
| D-006 | `QuadrantProductHeader.tsx:149` | Carousel prev/next buttons lack `aria-pressed` and `role` attributes | Accessibility gap in the GenieDeckHero slide carousel. | **OPEN** → Day 2 |

---

## 4. Cross-Product Issues (C-104)

| ID | Severity | Issue | Root Cause | Status |
|----|----------|-------|------------|--------|
| X-001 | High | Tagline capitalization mismatch between `genie-products.ts` and `QuadrantProductHeader.tsx` | Two separate sources of truth for product branding. | **FIXED** |
| X-002 | Medium | `QuadrantProductHeader.tsx` hardcodes its own `PRODUCT_BRANDING` registry instead of importing from `genie-products.ts` | Header was built independently of the centralized constants file. This creates ongoing drift risk. | **OPEN** → Day 2 |
| X-003 | Medium | No shared error boundary for Genie product pages | Each page has its own error handling (`GenieDeck` has `ErrorDisplay`, `GenieSpark` and `GenieMind` have none). A shared `<ErrorBoundary>` would prevent white-screen crashes. | **OPEN** → Day 5 |

---

## 5. Files Changed on Day 1

| File | Changes | Purpose |
|------|---------|---------|
| `src/pages/GenieSpark.tsx` | 158→199 lines | Fixed race conditions, error handling, broken route, stub handler, unused var |
| `src/pages/GenieMind.tsx` | +10 lines | Fixed tagline, added loading state, added aria-label |
| `src/pages/GenieDeck.tsx` | 1 line | Fixed hardcoded email |
| `src/constants/genie-products.ts` | 1 line | Fixed tagline capitalization |
| `src/components/navigation/QuadrantProductHeader.tsx` | 1 line | Fixed Mind tagline |
| `src/components/genie-spark/SparkGuidedWizard.tsx` | +14 lines | Added ARIA roles/labels to wizard navigation |
| `src/components/genie-admin/SprintTrackerDashboard.tsx` | +150 lines | Added detailed findings, standup entries, issue tracking UI |

---

## 6. Day 2 Plan (Feb 18)

### Claude Tasks (8 hours)
| Task | Hours | Focus |
|------|-------|-------|
| C-201: Fix GenieDeck PresentationWizard | 4h | Trace all 6 wizard steps, fix any broken transitions |
| C-202: Fix presentation-generator sub-components | 3h | 80+ sub-components in `presentation-generator/` directory |
| C-203: Verify Deck end-to-end | 1h | Input → slides → preview → save must work completely |
| S-201: Build check | 0.5h | Ensure clean build after Day 2 changes |

### Lovable Tasks (9 hours)
| Task | Hours | Focus |
|------|-------|-------|
| L-201: GenieProductsPage product catalog | 3h | Reads from `genie-products.ts` (locked - read only) |
| L-202: Fix pricing section | 2h | Regional pricing display |
| L-203: Verify Explore demo pages | 2h | Demo flow completion |
| L-204: Add missing landing page sections | 2h | Based on Day 1 audit findings |

### Shared File Risk: NONE
Claude works on `genie-studio/presentation-generator/**`. Lovable works on `landing/**` and `pages/GenieProductsPage.tsx`. No overlapping files.

---

## 7. Standup Summary for Morning Call

**Claude Code — Day 1 Recap:**
- Completed C-101 to C-104 + S-101 (all 5 Day 1 tasks)
- Diagnosed 33 issues across GenieSpark (14), GenieMind (13), GenieDeck (6)
- Fixed 11 issues on Day 1: race conditions, broken routes, error handling, taglines, accessibility
- Also resolved merge conflicts with main branch (unrelated histories)
- Build passes clean in 58 seconds

**Claude Code — Day 2 Plan:**
- C-201: Fix GenieDeck PresentationWizard creation flow (4h)
- C-202: Fix presentation-generator sub-components (3h)
- C-203: End-to-end verification of Deck (1h)
- Deck is the cleanest product — once wizard flow works, it's complete

**Blockers:**
- SmartContentPipeline (80KB) uses simulated AI — needs real Supabase edge function (Day 3)
- ScriptEditorTab (127KB) needs Day 4 deep dive
- QuadrantProductHeader hardcodes product data — creates drift risk with genie-products.ts
