# GenieSuite Ecosystem: Dual Developer Strategy & Project Plan
## Parallel Development with Lovable + Claude Code

---

## 1. Executive Summary

This document outlines the parallel development strategy for the CGAT Patient HCP Care Ecosystem, treating **Lovable** and **Claude Code** as two independent developers working simultaneously on the same codebase without conflicts.

| | Lovable (Developer 1) | Claude Code (Developer 2) |
|---|---|---|
| **Focus** | Frontend Marketing & Landing Page | GenieSuite CREATE Tools |
| **Modules** | Landing Page, Explore, Products, Pricing, Legal, Auth UI | Genie Spark, Genie Mind, Genie Deck |
| **Scope** | Broad improvements to marketing frontend | Broad improvements to content creation pipeline |
| **Branch** | `lovable/landing-updates` | `claude/genie-suite-ecosystem-Zm8XP` |

---

## 2. Codebase Architecture Overview

### 2.1 Technology Stack
- **Frontend**: React 18.3.1 + React Router DOM 6.30.1
- **UI Framework**: Shadcn/ui + Radix UI + Tailwind CSS
- **Build**: Vite 5.4.19
- **Auth**: Supabase
- **State**: React Context + React Query
- **Total Files**: 600+ components, 150+ hooks, 100+ services

### 2.2 GenieSuite Content Pipeline
```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT CREATION PIPELINE                     │
│                                                                  │
│   SPARK (Create)      MIND (Enhance)       DECK (Present)       │
│   ┌──────────┐       ┌──────────┐         ┌──────────┐         │
│   │ Generate │──────▶│ Edit     │         │ Standalone│         │
│   │ Scripts  │ save  │ Scripts  │         │ Slides   │         │
│   │ via AI   │       │ + Audio  │         │ via AI   │         │
│   └──────────┘       └──────────┘         └──────────┘         │
│        │                   │                                     │
│        └───────┬───────────┘                                     │
│                ▼                                                  │
│   ┌─────────────────────┐                                        │
│   │   useGenieScripts   │  ← Shared hook (Supabase)             │
│   │ useGenieMediaLibrary│  ← Shared hook (Supabase)             │
│   └─────────────────────┘                                        │
│                                                                  │
│   Future phases: Vibe (Record) → Hub (Manage) → Cast (Publish)  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Key Components Per Module

**Genie Spark** (Script Generation)
- `src/pages/GenieSpark.tsx` — Page entry point
- `src/components/genie-spark/SparkGuidedWizard.tsx` — Step-by-step wizard
- `src/components/genie-studio/SmartContentPipeline.tsx` — AI content engine
- `src/components/genie-studio/QuickTemplateSelector.tsx` — Template picker
- `src/components/genie-studio/ImageScriptAssembler.tsx` — Image-to-script

**Genie Mind** (Script Management & Editing)
- `src/pages/GenieMind.tsx` — Page entry point
- `src/components/genie-studio/ScriptEditorTab.tsx` — Full script editor (127KB)
- `src/components/genie-studio/SavedAudioCard.tsx` — Voiceover display
- `src/components/genie-studio/CrossFunctionalMusic.tsx` — Music generation
- `src/components/genie-studio/BatchScriptGenerationWorkflow.tsx` — Batch creation

**Genie Deck** (Presentation Generator)
- `src/pages/GenieDeck.tsx` — Page entry point
- `src/components/genie-studio/presentation-generator/PresentationWizard.tsx` — 6-step wizard
- `src/components/genie-studio/presentation-generator/**` — 80+ sub-components

---

## 3. File Ownership & Boundaries

### 3.1 Lovable's Territory (Landing & Marketing)

| Category | Files | Count |
|----------|-------|-------|
| Landing Components | `src/components/landing/**` | 47 files |
| Landing Hooks | `src/hooks/landing/**` | 2 files |
| Regional Config | `src/config/regionalLandingConfig.ts` | 1 file |
| Explore Page | `src/pages/GenieExplorePage.tsx` | 1 file |
| Products Page | `src/pages/GenieProductsPage.tsx` | 1 file |
| Support Page | `src/pages/GenieSupportPage.tsx` | 1 file |
| Auth Pages (UI) | `src/pages/Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` | 3 files |
| Legal Pages | `src/pages/*PolicyPage.tsx`, `TermsOfServicePage.tsx` | 6 files |
| UI Components | `src/components/ui/**` (minor tweaks only) | shared |
| **Total** | | **~62 files** |

### 3.2 Claude's Territory (GenieSuite CREATE)

| Category | Files | Count |
|----------|-------|-------|
| Spark Page | `src/pages/GenieSpark.tsx` | 1 file |
| Mind Page | `src/pages/GenieMind.tsx` | 1 file |
| Deck Page | `src/pages/GenieDeck.tsx` | 1 file |
| Spark Components | `src/components/genie-spark/**` | 1+ files |
| Studio Components | `src/components/genie-studio/**` | 150+ files |
| Navigation | `src/components/navigation/Quadrant*.tsx` | 3 files |
| Genie Context | `src/contexts/GenieStudioSharedContext.tsx` | 1 file |
| Genie Config | `src/config/genie-sitemap.ts` | 1 file |
| App Routing | `src/App.tsx` (GenieSuite route block only, lines 368-440) | 1 file |
| Genie Hooks | `src/hooks/useGenie*.ts` (scripts, media, auth) | 5+ files |
| **Total** | | **~165 files** |

### 3.3 Locked Files (No Man's Land)

These files are used by BOTH modules. Neither developer modifies them during this cycle.

| File | What It Controls | Risk if Modified |
|------|-----------------|-----------------|
| `src/constants/genie-products.ts` | Product names, taglines, tier definitions, language lists | Breaks both landing display AND genie navigation |
| `src/hooks/useMasterAuth.tsx` | Auth state, roles, session | Breaks all authenticated routes |
| `src/components/auth/ProtectedRoute.tsx` | Route access control | Breaks all protected pages |
| `src/components/auth/GenieStudioProtectedRoute.tsx` | Genie-specific auth | Breaks all genie pages |
| `src/components/layout/AppLayout.tsx` | Main app layout wrapper | Breaks page structure |
| `src/components/layout/GenieStudioLayout.tsx` | Genie layout wrapper | Breaks genie pages |
| `src/integrations/supabase/**` | Database client, types | Breaks all data operations |
| `src/config/genieStudioNavItems.ts` | Nav items + tier gating | Breaks navigation for both |

### 3.4 Overlap Risk Assessment

```
CONFLICT RISK MATRIX:

                    Lovable touches?
                    YES         NO
Claude      YES  │ DANGER  │  SAFE    │
touches?         │ (0 files)│ (165 files)│
            NO   │ SAFE    │  LOCKED  │
                 │(62 files)│ (8 files) │

Result: ZERO overlapping files between Lovable and Claude scopes
```

---

## 4. Git Branch Strategy

### 4.1 Branch Structure
```
main (stable)
  │
  ├── lovable/landing-updates              ← Lovable works here
  │   └── Only: components/landing/**, hooks/landing/**, landing pages
  │
  └── claude/genie-suite-ecosystem-Zm8XP   ← Claude works here
      └── Only: genie-spark/**, genie-studio/**, Genie pages, App.tsx routes
```

### 4.2 Merge Order
1. **Claude merges first** — GenieSuite changes are more isolated
2. **Lovable rebases** onto updated main
3. **Lovable merges** — Landing changes are fully independent, zero conflicts expected
4. **Final build check** on main

### 4.3 Conflict Resolution (if any)
The only file that could theoretically conflict is `App.tsx` if both sides add routes. Resolution: keep both route blocks, they are in different line ranges:
- Landing routes: lines 196-238
- GenieSuite routes: lines 368-440

---

## 5. Daily Sprint Plan

### Sprint 1 — Day 1: Foundation & Assessment

| Time | Lovable Tasks | Claude Tasks |
|------|--------------|-------------|
| Morning | Audit `RegionalLandingPage.tsx` for broken regional content | Read & diagnose `GenieSpark.tsx` — trace creation flow |
| Morning | Audit `GenieExplorePage` — verify explore journey | Read & diagnose `GenieMind.tsx` — trace editing flow |
| Afternoon | Fix broken hero sections in `components/landing/` | Read & diagnose `GenieDeck.tsx` — trace presentation flow |
| Afternoon | Verify all legal pages render | Document all issues found in Spark/Mind/Deck |
| EOD | `npm run build` — verify no breaks | `npm run build` — verify no breaks |

**Standup Output:**
- Lovable: "Audited landing page, found X broken sections, fixed Y"
- Claude: "Diagnosed all 3 CREATE modules, found: [list of issues]"

---

### Sprint 2 — Day 2: Genie Deck + Landing Products

| Time | Lovable Tasks | Claude Tasks |
|------|--------------|-------------|
| Morning | Fix/enhance `GenieProductsPage.tsx` — product catalog | Fix `GenieDeck.tsx` creation flow |
| Morning | Fix pricing section in landing page | Fix `PresentationWizard` 6-step flow |
| Afternoon | Verify Explore demo pages work | Fix presentation-generator sub-components |
| Afternoon | Add any missing landing page sections | Verify: Deck creates presentations end-to-end |
| EOD | `npm run build` | `npm run build` |

**Standup Output:**
- Lovable: "Products page rendering correctly, pricing section fixed"
- Claude: "Deck creation flow working — presentations generate successfully"
- Deck is standalone, so this is risk-free for both sides

---

### Sprint 3 — Day 3: Genie Spark + Landing Demos

| Time | Lovable Tasks | Claude Tasks |
|------|--------------|-------------|
| Morning | Fix interactive demos (`InteractiveTryGenieDemo`, `STTDemo`) | Fix `GenieSpark.tsx` — `SmartContentPipeline` generation |
| Morning | Fix `DeepLTranslationDemo` | Fix `SparkGuidedWizard` step-by-step flow |
| Afternoon | Fix video showcases (`GenieVideoShowcase`, `HeroLandingVideo`) | Fix script save via `useGenieScripts` |
| Afternoon | Verify region switching across all 14 regions | Verify: Spark creates & saves scripts to Supabase |
| EOD | `npm run build` | `npm run build` |

**Standup Output:**
- Lovable: "Interactive demos working, video showcases rendering"
- Claude: "Spark generates scripts and saves them — verified in Supabase"

---

### Sprint 4 — Day 4: Genie Mind + Landing Polish

| Time | Lovable Tasks | Claude Tasks |
|------|--------------|-------------|
| Morning | Mobile responsiveness polish | Fix `GenieMind.tsx` — `ScriptEditorTab` editing |
| Morning | SEO verification (meta tags, social sharing) | Fix voiceover display (`SavedAudioCard`) |
| Afternoon | Performance optimization (lazy loading, images) | Fix `CrossFunctionalMusic` generation |
| Afternoon | Cross-browser testing | Verify: Spark → Mind flow (script created in Spark appears in Mind) |
| EOD | `npm run build` | `npm run build` |

**Standup Output:**
- Lovable: "Landing page polished — mobile, SEO, performance optimized"
- Claude: "Mind editing working — scripts from Spark load and edit correctly"

---

### Sprint 5 — Day 5: Integration & Merge

| Time | Lovable Tasks | Claude Tasks |
|------|--------------|-------------|
| Morning | Final verification: all landing routes work | Final verification: all GenieSuite CREATE routes work |
| Morning | Test: `/genie-landing/nam`, `/explore`, `/products`, `/pricing` | Test: `/genie-spark`, `/genie-mind`, `/genie-deck` |
| Afternoon | Verify: landing → auth → genie-studio navigation | Verify: QuadrantNavigation between Spark/Mind/Deck |
| Afternoon | Prepare merge (rebase if needed) | Merge to main first |
| EOD | Merge after Claude | Final `npm run build` on main |

**Standup Output:**
- Claude: "Merged to main — all CREATE tools functional"
- Lovable: "Rebased and merged — no conflicts, all routes verified"

---

## 6. Daily Standup Template

Each developer answers 3 questions daily:

```
DAILY STANDUP — [Date]
Developer: [Lovable / Claude]

1. What did I complete yesterday?
   - [List completed tasks]

2. What am I working on today?
   - [List today's tasks]

3. Any blockers or shared file needs?
   - [List any locked files that need modification]
   - [List any coordination needed with other developer]

Files modified: [git diff --name-only]
Build status: [PASS / FAIL]
```

---

## 7. Conflict Prevention Protocol

### Before Every Commit
| # | Check | How |
|---|-------|-----|
| 1 | Build passes | `npm run build` |
| 2 | No locked file changes | `git diff --name-only` — verify against locked list |
| 3 | Lovable didn't touch genie files | `git diff --name-only` — no `genie-` prefixed files |
| 4 | Claude didn't touch landing files | `git diff --name-only` — no `landing/` files |
| 5 | genie-products.ts untouched | `git diff src/constants/genie-products.ts` = empty |
| 6 | useMasterAuth.tsx untouched | `git diff src/hooks/useMasterAuth.tsx` = empty |

### If a Locked File Must Change
1. **STOP** — Do not modify on your branch
2. **COMMUNICATE** — Tell the other developer what needs changing and why
3. **AGREE** — Decide who makes the change on which branch
4. **SYNC** — The other developer pulls the change before continuing
5. **NEVER** modify the same locked file on both branches

---

## 8. Success Criteria

### Sprint Exit Criteria

| Sprint | Lovable Success | Claude Success |
|--------|----------------|---------------|
| Day 1 | Landing page audit complete, issues documented | All 3 modules diagnosed, issues documented |
| Day 2 | Products + pricing pages working | Deck creates presentations end-to-end |
| Day 3 | Interactive demos functional | Spark generates and saves scripts |
| Day 4 | Landing page fully polished | Mind edits scripts, Spark→Mind flow works |
| Day 5 | All landing routes verified, merged | All CREATE routes verified, merged |

### Final Acceptance
- [ ] `npm run build` passes on main after both merges
- [ ] Landing routes work: `/genie-landing/nam`, `/explore`, `/products`, `/pricing`
- [ ] GenieSuite routes work: `/genie-spark`, `/genie-mind`, `/genie-deck`
- [ ] No locked files were modified
- [ ] Content pipeline: Script created in Spark → visible in Mind → editable
- [ ] Deck: Presentations generate independently

---

## 9. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Both devs modify App.tsx | Low | Medium | Claude owns App.tsx; Lovable requests route additions |
| Shared UI component breaks | Low | Low | Lovable owns ui/**; changes are minor tweaks only |
| Auth system needs changes | Low | High | Locked file — neither touches without coordination |
| Supabase schema conflict | Low | High | Locked — schema changes require joint planning |
| Build fails after merge | Medium | Medium | Both run build before merge; Claude merges first |
| Scope creep into Vibe/Hub/Cast | Medium | Low | Strict scope: Claude = Spark/Mind/Deck only this cycle |

---

## 10. Future Phases

This strategy covers **Phase 1** (CREATE tools). Future phases follow the same pattern:

| Phase | Lovable Focus | Claude Focus | Timeline |
|-------|--------------|-------------|----------|
| **Phase 1** (Current) | Landing page improvements | Spark, Mind, Deck fixes | Week 1 |
| **Phase 2** | Explore journey enhancements | Vibe (recording) + Hub (production) | Week 2 |
| **Phase 3** | Marketing & SEO | Cast (publishing) + Ask Genie (AI assistant) | Week 3 |
| **Phase 4** | Analytics dashboard | Full pipeline integration testing | Week 4 |

---

## Appendix A: File Count Summary

| Area | File Count | Owner |
|------|-----------|-------|
| Landing components | 47 | Lovable |
| Landing hooks | 2 | Lovable |
| Landing pages | 12 | Lovable |
| Genie Studio components | 150+ | Claude |
| Genie Spark components | 1+ | Claude |
| Genie pages (Spark/Mind/Deck) | 3 | Claude |
| Navigation (Quadrant) | 3 | Claude |
| Locked shared files | 8 | Neither |
| **Total in scope** | **~230** | |

## Appendix B: Key Shared Hooks Reference

| Hook | Location | Used By | Database Table |
|------|----------|---------|---------------|
| `useGenieScripts` | `src/components/genie-studio/useGenieScripts.ts` | Spark, Mind | `genie_scripts` |
| `useGenieMediaLibrary` | `src/components/genie-studio/useGenieMediaLibrary.ts` | Mind | `generated_media` |
| `useMasterAuth` | `src/hooks/useMasterAuth.tsx` | All (LOCKED) | `profiles`, `user_roles` |
| `useGenieStudioAuth` | `src/hooks/useGenieStudioAuth.ts` | All Genie pages | `genie_studio_users` |
