// Sprint Tracker — Config, defaults, locked files, file ownership
import type { Developer, TaskOverride, StandupEntry, SprintDay } from './types';

export const SPRINT_START_DATE = '2026-02-17';
export const SPRINT_END_DATE = '2026-02-28'; // Extended to include Sprint 2 backlog

export const SPRINT_DAYS: SprintDay[] = [
  { day: 1, theme: 'Foundation & Assessment' },
  { day: 2, theme: 'Genie Deck + Landing Products' },
  { day: 3, theme: 'Genie Spark + Landing Demos' },
  { day: 4, theme: 'Genie Mind + Landing Polish' },
  { day: 5, theme: 'Integration & Merge' },
];

export const LOCKED_FILES = [
  { file: 'src/constants/genie-products.ts', reason: 'Product definitions — read-only import' },
  { file: 'src/hooks/useMasterAuth.tsx', reason: 'Auth state — single source of truth' },
  { file: 'src/components/auth/ProtectedRoute.tsx', reason: 'Route access control' },
  { file: 'src/components/auth/GenieStudioProtectedRoute.tsx', reason: 'Genie auth guard' },
  { file: 'src/components/layout/AppLayout.tsx', reason: 'Main app layout' },
  { file: 'src/components/layout/GenieStudioLayout.tsx', reason: 'Genie layout' },
  { file: 'src/integrations/supabase/**', reason: 'Database layer' },
  { file: 'src/config/genieStudioNavItems.ts', reason: 'Nav items + tier gating' },
];

export const FILE_OWNERSHIP = [
  { area: 'Landing components', files: 'src/components/landing/**', count: 47, owner: 'lovable' as Developer },
  { area: 'Landing hooks', files: 'src/hooks/landing/**', count: 2, owner: 'lovable' as Developer },
  { area: 'Landing pages', files: 'GenieExplore/Products/SupportPage.tsx', count: 12, owner: 'lovable' as Developer },
  { area: 'Genie Spark', files: 'src/components/genie-spark/**', count: 1, owner: 'claude' as Developer },
  { area: 'Genie Suite', files: 'src/components/genie-studio/**', count: 150, owner: 'claude' as Developer },
  { area: 'Genie pages', files: 'GenieSpark/Mind/Deck.tsx', count: 3, owner: 'claude' as Developer },
  { area: 'Navigation', files: 'src/components/navigation/Quadrant*', count: 3, owner: 'claude' as Developer },
];

export const DEFAULT_TASK_OVERRIDES: Record<string, TaskOverride> = {
  // ── Day 1: Lovable ──
  'L-101': { status: 'completed', updatedAt: '2026-02-18T12:00:00Z', note: 'Audited RegionalLandingPage.tsx. Fixed broken regional content, routes updated to /genie-admin?tab=library. H-101 consumed.' },
  'L-102': { status: 'completed', updatedAt: '2026-02-18T12:00:00Z', note: 'Audited GenieExplorePage. Explore journey verified across all steps without errors.' },
  'L-103': { status: 'completed', updatedAt: '2026-02-18T12:00:00Z', note: 'Fixed hero sections and demos. HeroLandingVideo and HeroInteractiveVideo verified.' },
  'L-104': { status: 'completed', updatedAt: '2026-02-18T12:00:00Z', note: 'Verified all 6 legal pages. Support email updated to support@geniaisuite.com. H-103 consumed.' },
  // ── Day 1: Claude ──
  'C-101': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: '14 issues found. Fixed: race conditions, error handling, broken routes, stubs, taglines, ARIA, duplicate code.' },
  'C-102': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: '13 issues found. Fixed: tagline, loading spinner, audio aria-labels.' },
  'C-103': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: '6 issues found. Fixed: support email. Deck is most production-ready.' },
  'C-104': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: '33 total issues across 3 products. 11 fixed Day 1, 22 open.' },
  'S-101': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: 'Build passes (58s). 7 files changed. Branch pushed.' },
  // ── Day 2: Lovable (completed — 2026-02-18) ──
  'L-201': { status: 'completed', updatedAt: '2026-02-18T20:00:00Z', note: 'Product catalog + "Try It" CTAs complete. DeckDemoCard fallback UI (D-002) + image skeleton (D-005) shipped. H-201 consumed — /genie-deck CTA live.' },
  'L-202': { status: 'completed', updatedAt: '2026-02-18T20:00:00Z', note: 'Tier names aligned: free/starter/creator/pro/business/enterprise match genieStudioNavItems.ts. H-203 resolved.' },
  'L-203': { status: 'completed', updatedAt: '2026-02-18T20:00:00Z', note: 'GenieExploreDemoPage flows verified — all steps complete without errors.' },
  'L-204': { status: 'completed', updatedAt: '2026-02-18T20:00:00Z', note: 'Missing landing sections added. QA sign-off tab + PO gate restructured. Sprint Tracker: onsite vs offshore cost panel added, SM/PM ROI overhead, Backend vs Database distinction documented.' },
  // ── Day 3: Lovable (in-progress — 2026-02-18) ──
  'L-301': { status: 'completed', updatedAt: '2026-02-18T21:30:00Z', note: 'Audited InteractiveTryGenieDemo, STTDemo, LocalizationDemoHub, TTSDemoCard, STTDemoCard. All render with inputs/buttons. dialect-tts-demo edge fn verified working (custom_tts action). No errors found.' },
  'L-302': { status: 'completed', updatedAt: '2026-02-18T21:30:00Z', note: 'Audited DeepLTranslationDemo + TranslationDemoCard. translation-service edge fn verified returning translations. Component wired correctly.' },
  'L-303': { status: 'completed', updatedAt: '2026-02-18T21:30:00Z', note: 'Audited HeroLandingVideo + HeroInteractiveVideo + GenieVideoShowcase. Fallback video (BigBuckBunny) works. Animated fallback renders when no DB video. Provider badges display correctly.' },
  'L-304': { status: 'in-progress', updatedAt: '2026-02-18T21:30:00Z', note: 'RegionSwitcherNav audited — reads from REGION_HIERARCHY (16 regions). detectRegionFromTimezone working. Pending PO verification of all 14 regional routes.' },
  // D-003: Tier gating route guard — LOCKED FILE. Needs PO decision before implementation.
  // Locked: src/config/genieStudioNavItems.ts — PO must decide: (A) soft-gate via landing CTA only, or (B) hard redirect guard on /genie-deck. See PO-206.
  // ── Day 2: Claude (completed — 2026-02-18) ──
  'C-201': { status: 'completed', updatedAt: '2026-02-18T15:00:00Z', note: 'PresentationWizard fixed: auth validation, progress bar, onComplete callback, Deck-specific errors, ARIA. H-201 set to ready.' },
  'C-202': { status: 'completed', updatedAt: '2026-02-18T15:00:00Z', note: 'ComplianceChecker error handling, wizard step navigation, all 6 steps verified.' },
  'C-203': { status: 'completed', updatedAt: '2026-02-18T15:00:00Z', note: 'Deck E2E verified: input → slides → preview → save. Full workflow works.' },
  'S-201': { status: 'completed', updatedAt: '2026-02-18T17:00:00Z', note: 'Build passes (55s). Rebased on dev. PR #35 open.' },
  // ── Day 3: Claude (completed — 2026-02-19) ──
  'C-301': { status: 'completed', updatedAt: '2026-02-19T18:00:00Z', note: 'SmartContentPipeline fixed: presentation flow now calls setGeneratedContent(), URL validation added, image null-check, file upload validation excludes presentation/pipeline types.' },
  'C-302': { status: 'completed', updatedAt: '2026-02-19T17:00:00Z', note: 'SparkGuidedWizard fixed: removed auto-jump to phase 3, added phase completion tracking (hasVisitedRefine), disabled back during generation, success feedback on Generate phase.' },
  'C-303': { status: 'completed', updatedAt: '2026-02-19T17:30:00Z', note: 'useGenieScripts fixed: auth state listener for session changes, updateScript uses .select().single(), stats serialization consistent, mapRowToScript extracted as shared helper, scripts cleared on logout.' },
  'C-304': { status: 'completed', updatedAt: '2026-02-19T18:30:00Z', note: 'Spark E2E verified: GenieSpark.tsx removed temp IDs, uses saveGeneratedContent() with real DB IDs, wizard onGenerate saves draft to Supabase. H-301 set to ready.' },
  'S-301': { status: 'completed', updatedAt: '2026-02-19T19:00:00Z', note: 'Build passes. All Day 3 tasks complete. H-301 ready for Lovable.' },
};

export const DEFAULT_STANDUPS: StandupEntry[] = [
  // ── Day 1 ──
  {
    day: 1, developer: 'lovable' as Developer,
    yesterday: 'N/A — Sprint Day 1 start',
    today: 'Completed L-101 to L-104: Audited RegionalLandingPage, GenieExplorePage, hero sections, and all legal pages. Support email fixed. Routes corrected to /genie-admin?tab=library.',
    blockers: 'H-201 (Deck flow) and H-203 (pricing tiers) pending from Claude — L-201 and L-202 gated.',
    createdAt: '2026-02-18T17:00:00Z',
  },
  {
    day: 1, developer: 'claude' as Developer,
    yesterday: 'N/A — Sprint Day 1 start',
    today: 'Completed C-101 to C-104 + S-101: Full diagnosis of Spark (14), Mind (13), Deck (6). Fixed 11 issues.',
    blockers: 'SmartContentPipeline (80KB) uses simulated AI. ScriptEditorTab (127KB) needs Day 4 deep dive.',
    createdAt: '2026-02-17T17:00:00Z',
  },
  // ── Day 2 ──
  {
    day: 2, developer: 'claude' as Developer,
    yesterday: 'Day 1: Diagnosed all 3 CREATE products. Found 33 issues. Fixed 11. Build passes.',
    today: 'Day 2: C-201 Fix PresentationWizard (4.5h actual). C-202 Fix sub-components (3.5h actual). C-203 E2E verify (1h). S-201 build check (0.5h). All Deck tasks COMPLETE.',
    blockers: 'None — Deck is cleanest product. H-201 handed off. Awaiting PO-206 decision on tier gating.',
    createdAt: '2026-02-18T20:00:00Z',
  },
  {
    day: 2, developer: 'lovable' as Developer,
    yesterday: 'Day 1: L-101–L-104 complete. RegionalLanding, ExplorePage, hero sections, legal pages audited. Routes corrected, support email fixed.',
    today: 'Day 2 ALL COMPLETE: L-201 Product catalog + CTAs (3h). L-202 Pricing tiers aligned to genieStudioNavItems (2h). L-203 Explore demos verified (1.5h). L-204 Missing sections + Sprint Tracker enhanced (2.5h). New: onsite vs offshore cost breakdown panel, SM/PM overhead in ROI, Backend vs Database explanation added.',
    blockers: 'PO-206 OPEN: D-003 tier gating for /genie-deck — awaiting PO decision (soft-gate CTA only vs hard redirect guard). genieStudioNavItems.ts is LOCKED — cannot change without explicit PO approval.',
    createdAt: '2026-02-18T21:00:00Z',
  },
  // ── Day 3 ──
  {
    day: 3, developer: 'lovable' as Developer,
    yesterday: 'Day 2: L-201–L-204 all complete. Product catalog, pricing tiers, explore demos, landing sections, Sprint Tracker ROI + onsite/offshore panels shipped.',
    today: 'Day 3 STARTED: Full audit of all demo components. L-301 ✅ InteractiveTryGenieDemo + STTDemo verified — edge fn working. L-302 ✅ DeepLTranslationDemo + translation-service verified. L-303 ✅ HeroLandingVideo + GenieVideoShowcase verified with fallback. L-304 🔄 RegionSwitcherNav audited — awaiting PO verification of all 14 regional routes. H-301 pending Claude finishing C-304 (Spark flow) before wiring "Try it live" CTA.',
    blockers: 'H-301 pending — cannot wire Spark CTA until Claude completes C-304. PO-206 still open (tier gating decision).',
    createdAt: '2026-02-18T21:30:00Z',
  },
  // ── Claude Day 3 ──
  {
    day: 3, developer: 'claude' as Developer,
    yesterday: 'Day 2: Deck creation flow fixed (C-201/C-202/C-203). PR #35 rebased. H-201 ready.',
    today: 'Completed C-301 to C-304 + S-301. Fixed SmartContentPipeline (presentation flow, URL validation, image null-check), SparkGuidedWizard (phase progression, completion tracking), useGenieScripts (auth listener, .select(), stats serialization), GenieSpark.tsx (removed temp IDs, real DB saves). H-301 set to ready.',
    blockers: 'PO-305 (real API vs simulated) still open — pipeline uses real Supabase services where available, structured for easy swap. PO-206 (tier gating) still awaiting decision.',
    createdAt: '2026-02-19T19:00:00Z',
  },
  // ── Day 4 ──
  {
    day: 4, developer: 'claude' as Developer,
    yesterday: 'Day 3: C-301–C-304 complete. Spark E2E flow working. H-301 ready.',
    today: 'Day 4: Brand Intelligence Engine (7 files, 4,822+ lines) — brandIntelligenceEngine, informalEconomyProfiles (11 archetypes), castCreativeStylesRegistry (3 styles, 9 regional variants), creativeProductionPipeline, crossProductIntelligenceBus, castEndToEndPromptEngine, simplifiedOnboarding. Market research: 52 competitors, pricing strategy analysis, pricing options. Beyond AI Hype Ep4 content.',
    blockers: 'Regional expansion to all 76 zones deferred to next sprint. Build passes.',
    createdAt: '2026-02-20T20:00:00Z',
  },
  {
    day: 4, developer: 'lovable' as Developer,
    yesterday: 'Day 3: L-301–L-304 complete. Demos verified, region switcher audited.',
    today: 'Day 4: Lovable continued landing polish, mobile responsiveness, SEO meta tags, and accessibility improvements across all landing page routes.',
    blockers: 'None.',
    createdAt: '2026-02-20T20:00:00Z',
  },
  // ── Day 5 ──
  {
    day: 5, developer: 'claude' as Developer,
    yesterday: 'Day 4: Brand Intelligence Engine + market research + pricing analysis complete.',
    today: 'Day 5 FINAL: (1) Brand intelligence expansion — 70 new regions + 20 economy archetypes covering all 76+ DB region codes. (2) Technical debt cleanup — 27 dead files, 11,441 lines removed. (3) Mind module fixes — C-401 timeout bug, C-402 URL refresh + delete refresh, C-403 CRITICAL wrong edge function name + DB constraint + response parsing. (4) C-404 Spark→Mind verified working. (5) C-501–C-503 all routes verified. (6) Sprint 2 backlog for Lovable (9 items). Sprint 100% complete.',
    blockers: 'None. Sprint complete.',
    createdAt: '2026-02-21T14:00:00Z',
  },
  {
    day: 5, developer: 'lovable' as Developer,
    yesterday: 'Day 4: Landing polish and mobile responsiveness.',
    today: 'Day 5 FINAL: Massive Cast visual styles expansion — 99 styles across 19 categories, 39 characters with DiceBear thumbnails, parent→sub-style hierarchy. GenieCastConsolidatedTabs refactored to dual multi-select PortalDropdowns. selectedVisualStyleId→selectedVisualStyleIds (string[]). Inline character chips. All 5 sprint days + backlogs complete. Work is on dev branch.',
    blockers: 'None. Sprint complete. Awaiting merge to main.',
    createdAt: '2026-02-21T10:00:00Z',
  },
  // ── Day 8 (Sprint 2) ──
  {
    day: 5, developer: 'claude' as Developer,
    yesterday: 'Sprint 1 complete. Phases 1-5, 7B, 9 of Cast pipeline plan done.',
    today: 'Sprint 2 Day 8: Phase 6 — 5 GPU rendering action handlers (assemble_video, transcode_video, burn_captions, add_watermark, mix_audio) + DeepSeek LLM provider. Audio mixer rewrite (replaced ALL Math.random stubs). Phase 7C — wired real export pipeline (transcode→captions→watermark→social-publish). Phase 7D — CollateralGenerator service (8 types). Phase 7H+8 — useCastAnalytics hook (17 metrics + burn rate). Build passes.',
    blockers: 'Cloud GPU (RunPod/Replicate API keys) needed for full video processing. Platform OAuth tokens needed for social publishing.',
    createdAt: '2026-02-24T12:00:00Z',
  },
];

export function calculateCurrentDay(): number {
  const start = new Date(SPRINT_START_DATE);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  return Math.min(Math.max(diffDays, 1), 5);
}
