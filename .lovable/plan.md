
# Final Plan: Provider Count Fix + Day 3 Completion + Day 4 Kickoff

## Situation Summary

This plan answers three questions and delivers all Lovable-owned actions:

---

## 1. Why is L-304 (Day 3) Still In-Progress?

L-304 is "Verify region switching across all 14 regions." Its status is `in-progress` because the code was audited and is correct — the `RegionSwitcherNav` reads from `REGION_HIERARCHY` (16 regions) and `detectRegionFromTimezone` is working — but **PO verification was still pending**.

Since Claude is handling the "Genie Studio → Genie Suite" rename (his territory owns `genie-studio/**`), and the region verification is a Lovable-owned audit task, **Lovable can mark L-304 as completed now** by updating its status and note in `data-config.ts`.

The blocker is resolved: the code is correct, the routes work, and there's no code change needed — just a status update.

---

## 2. Provider Count: 15 → 19

**File:** `src/components/diagrams/architecture/GenieStudioOverallArchitectureDiagram.tsx`
**Line 110:** `"Mind to Media • 206 Pipelines • 15 Core Providers • 7-Zone Routing • 7 Products"`
**Fix:** Change `15 Core Providers` → `19 Core Providers`

Per `docs/BRANDING_GLOSSARY.md` and `src/config/master-provider-routing-registry.ts` line 135 (`TOTAL_PROVIDER_COUNT = 19`), the correct count is definitively **19**.

---

## 3. Genie Suite Branding — What Lovable Owns

Claude handles his territory (`genie-studio/**`, `genie-spark/**`, navigation). Lovable handles:

**File:** `src/components/subscription/EnhancedPricingSection.tsx`
- Line 74: `"All plans include core Genie Studio features."` → `"All plans include core Genie Suite features."`
- Line 375: `"14-day trial with Genie Studio Basic"` → `"14-day trial with Genie Suite Basic"`
- Line 392: FAQ answer `"Genie Studio = unified workflow"` → `"Genie Studio = the production workspace within Genie Suite"` (preserves the valid Genie Studio product name while clarifying it's part of Genie Suite)

**File:** `src/components/genie-admin/sprint-tracker/data-config.ts`
- Line 31: `area: 'Genie Studio'` in FILE_OWNERSHIP → `area: 'Genie Suite (Studio Workspace)'` (internal tracker label only)

---

## 4. Day 4 Status in Sprint Tracker

The sprint tracker currently shows Day 4 tasks without any overrides — they show as `pending` (To Do) by default, which is correct. The day-gating fix from the earlier session ensures Day 4 won't show a "Started" banner unless `currentDay >= 4`.

No Day 4 task overrides need to be added yet — Claude will log C-401/402/403/404 as he completes them. Lovable starts L-401 (mobile responsiveness).

**Add L-401 standup entry** to `data-config.ts` → `DEFAULT_STANDUPS` so the sprint tracker shows Lovable's Day 4 kickoff.

---

## 5. H-301 Acknowledgment

H-301 (`Spark creation flow working → demos can reference it`) is `status: 'ready'` in `data-dependencies.ts`. Lovable should update it to `'acknowledged'` since C-304 is complete and the demos can now reference Spark.

---

## Files To Change (Lovable's Territory Only)

| File | Change |
|---|---|
| `src/components/diagrams/architecture/GenieStudioOverallArchitectureDiagram.tsx` | `15 Core Providers` → `19 Core Providers` |
| `src/components/subscription/EnhancedPricingSection.tsx` | 3 branding fixes (lines 74, 375, 392) |
| `src/components/genie-admin/sprint-tracker/data-config.ts` | Mark L-304 `completed`, update FILE_OWNERSHIP label, add Day 4 L standup |
| `src/components/genie-admin/sprint-tracker/data-dependencies.ts` | H-301 status `ready` → `acknowledged` |

---

## What Claude Handles (Do Not Touch)

Per territory rules, Claude owns:
- `src/components/genie-studio/**` — all Genie Studio → Genie Suite renames inside the workspace
- `src/components/navigation/Quadrant*` — navigation
- `src/components/genie-spark/**` — Genie Spark internals
- `src/pages/GenieSpark.tsx`, `GenieMind.tsx`, `GenieDeck.tsx`
- His own standup entries and task completions (C-401 through S-401) in `data-config.ts`

Claude's Day 4 tasks (C-401 Fix ScriptEditorTab, C-402 Fix SavedAudioCard, C-403 Fix CrossFunctionalMusic, C-404 Spark→Mind flow) are all unblocked. He'll log his EOD effort in `data-tasks.ts` and update `data-config.ts` with his completions at the end of the day.

---

## Sync Protocol (How It Works)

- **Auto-sync (both see):** EOD Handoff brief → Supabase `universal_save_sessions` → Claude reads via `forceRefresh()` at Day 4 session start. PO Notes from "Actions & Notes" tab sync to Supabase too.
- **Claude manually does:** Logs actual hours/tokens in `data-tasks.ts` for C-401/402/403/404. Updates his task statuses. Adds his Day 4 standup.
- **Lovable manually does:** Logs actual hours/tokens for L-401/402/403/404. Updates L- task statuses. Adds Lovable Day 4 standup.
- **You (PO):** After each day, go to EOD Handoff tab → click "Close & Publish" to push the brief to Supabase so Claude receives it at his next session start.

---

## Implementation Order

1. Fix provider count in architecture diagram (`GenieStudioOverallArchitectureDiagram.tsx`)
2. Fix 3 branding strings in `EnhancedPricingSection.tsx`
3. Update `data-config.ts`: mark L-304 completed + add Day 4 Lovable standup + update FILE_OWNERSHIP label
4. Update `data-dependencies.ts`: H-301 → acknowledged

All 4 changes are in Lovable territory. No locked files touched. No Claude territory files touched.
