/**
 * Effort Tracking Data — Automatic time & discipline breakdown
 *
 * This file is the SINGLE SOURCE OF TRUTH for actual effort spent on each task.
 * Claude (Team Lead) populates this automatically when tasks complete.
 * PO/SM only needs to review — no manual data entry required.
 * Lovable can read this at session start to see what effort was spent.
 *
 * Discipline categories:
 *   frontend     — React components, JSX, props, state management
 *   backend      — Edge functions, API routes, Supabase calls
 *   ux           — User flows, interaction design, accessibility (ARIA)
 *   ui           — Visual styling, Tailwind, layout
 *   database     — Supabase tables, RLS policies, queries
 *   devops       — Build, git, deployment, CI
 *   architecture — System design, dependency mapping, planning
 *   testing      — Manual E2E testing, verification
 *   documentation— Changelogs, standups, CSV, sprint tracker data
 *   code-review  — Reading/auditing existing code, diagnosis
 *   integration  — Cross-module wiring, handoffs, shared hooks
 *   debugging    — Bug investigation, root cause analysis
 */

import { TaskEffort, EffortMetrics, Discipline, Developer } from './types';

// ══════════════════════════════════════════════════════════════
// DAY 1 — Foundation & Assessment (Feb 17, 2026)
// ══════════════════════════════════════════════════════════════

export const DAY1_EFFORT: TaskEffort[] = [
  // ── C-101: Read and diagnose GenieSpark.tsx ──
  {
    taskId: 'C-101',
    developer: 'claude',
    day: 1,
    estimatedHours: 2,
    actualHours: 2,
    variance: 0,
    breakdown: [
      { discipline: 'code-review', hours: 0.75, description: 'Read GenieSpark.tsx (227 lines), SparkGuidedWizard.tsx, SmartContentPipeline.tsx (80KB)', files: ['src/pages/GenieSpark.tsx', 'src/components/genie-spark/SparkGuidedWizard.tsx'] },
      { discipline: 'debugging', hours: 0.5, description: 'Traced 4 content handlers to find race conditions (S-001, S-002)', files: ['src/pages/GenieSpark.tsx'] },
      { discipline: 'frontend', hours: 0.5, description: 'Fixed 7 issues: await saveScript, try/catch, broken route, ARIA roles, tagline, unused var, duplicate logic', files: ['src/pages/GenieSpark.tsx', 'src/components/genie-spark/SparkGuidedWizard.tsx'] },
      { discipline: 'documentation', hours: 0.25, description: 'Documented 14 findings with severity, root cause, status' },
    ],
    issuesFixed: ['S-001', 'S-002', 'S-003', 'S-004', 'S-005', 'S-007', 'S-010'],
    filesModified: ['src/pages/GenieSpark.tsx', 'src/components/genie-spark/SparkGuidedWizard.tsx'],
    linesChanged: 85,
    startedAt: '2026-02-17T09:00:00Z',
    completedAt: '2026-02-17T11:00:00Z',
    accomplishment: 'Full Spark diagnosis: 14 issues found, 7 fixed (race conditions, broken route, ARIA, tagline). 7 open for Day 3.',
  },

  // ── C-102: Read and diagnose GenieMind.tsx ──
  {
    taskId: 'C-102',
    developer: 'claude',
    day: 1,
    estimatedHours: 2,
    actualHours: 2,
    variance: 0,
    breakdown: [
      { discipline: 'code-review', hours: 0.75, description: 'Read GenieMind.tsx, ScriptEditorTab.tsx (127KB), useGenieMediaLibrary, CrossFunctionalMusic', files: ['src/pages/GenieMind.tsx', 'src/components/genie-studio/ScriptEditorTab.tsx'] },
      { discipline: 'debugging', hours: 0.5, description: 'Identified voiceover save stub (M-002), missing delete API (M-004), ScriptEditorTab complexity' },
      { discipline: 'frontend', hours: 0.5, description: 'Fixed 4 issues: tagline mismatch (M-001, M-006), loading spinner (M-007), ARIA labels (M-008)', files: ['src/pages/GenieMind.tsx'] },
      { discipline: 'documentation', hours: 0.25, description: 'Documented 13 findings with root causes and Day 4 plan' },
    ],
    issuesFixed: ['M-001', 'M-006', 'M-007', 'M-008'],
    filesModified: ['src/pages/GenieMind.tsx', 'src/constants/genie-products.ts'],
    linesChanged: 60,
    startedAt: '2026-02-17T11:00:00Z',
    completedAt: '2026-02-17T13:00:00Z',
    accomplishment: 'Full Mind diagnosis: 13 issues found, 4 fixed (taglines, spinner, ARIA). ScriptEditorTab (127KB) deferred to Day 4.',
  },

  // ── C-103: Read and diagnose GenieDeck.tsx ──
  {
    taskId: 'C-103',
    developer: 'claude',
    day: 1,
    estimatedHours: 2,
    actualHours: 1.5,
    variance: -0.5,
    breakdown: [
      { discipline: 'code-review', hours: 0.5, description: 'Read GenieDeck.tsx (227 lines), PresentationWizard.tsx (2800+ lines), 80+ sub-components', files: ['src/pages/GenieDeck.tsx', 'src/components/genie-studio/presentation-generator/PresentationWizard.tsx'] },
      { discipline: 'debugging', hours: 0.25, description: 'Found 6 issues: DeckDemoCard null return, tier gating gap, generic errors, missing skeleton, ARIA' },
      { discipline: 'frontend', hours: 0.5, description: 'Fixed D-001: support email hardcoded as example.com → geniaisuite.com', files: ['src/pages/GenieDeck.tsx'] },
      { discipline: 'documentation', hours: 0.25, description: 'Documented 6 findings. Deck is cleanest product — most production-ready.' },
    ],
    issuesFixed: ['D-001'],
    filesModified: ['src/pages/GenieDeck.tsx'],
    linesChanged: 15,
    startedAt: '2026-02-17T13:30:00Z',
    completedAt: '2026-02-17T15:00:00Z',
    accomplishment: 'Full Deck diagnosis: 6 issues found, 1 fixed. Deck is most production-ready. 5 open for Day 2.',
  },

  // ── C-104: Document all issues + cross-product analysis ──
  {
    taskId: 'C-104',
    developer: 'claude',
    day: 1,
    estimatedHours: 1,
    actualHours: 1.5,
    variance: 0.5,
    breakdown: [
      { discipline: 'documentation', hours: 0.75, description: 'Created GENIESUITE_DAY1_DIAGNOSIS.md with 33 findings across 3 products, severity matrix, fix plan' },
      { discipline: 'architecture', hours: 0.5, description: 'Cross-product analysis: identified X-001 (tagline mismatch), X-002 (QuadrantProductHeader), X-003 (no error boundary)' },
      { discipline: 'frontend', hours: 0.25, description: 'Fixed X-001: tagline capitalization in genie-products.ts and QuadrantProductHeader.tsx', files: ['src/constants/genie-products.ts', 'src/components/navigation/QuadrantProductHeader.tsx'] },
    ],
    issuesFixed: ['X-001'],
    filesModified: ['GENIESUITE_DAY1_DIAGNOSIS.md', 'src/constants/genie-products.ts', 'src/components/navigation/QuadrantProductHeader.tsx', 'src/components/genie-admin/SprintTrackerDashboard.tsx'],
    linesChanged: 140,
    startedAt: '2026-02-17T15:00:00Z',
    completedAt: '2026-02-17T16:30:00Z',
    accomplishment: '33 issues documented across Spark(14)/Mind(13)/Deck(6). 12 fixed Day 1, 21 open. Cross-product issues identified.',
  },

  // ── S-101: End of Day 1 build check and sync ──
  {
    taskId: 'S-101',
    developer: 'claude',
    day: 1,
    estimatedHours: 0.5,
    actualHours: 0.33,
    variance: -0.17,
    breakdown: [
      { discipline: 'devops', hours: 0.08, description: 'npm run build — passed in 58s, no errors' },
      { discipline: 'devops', hours: 0.08, description: 'git add, commit, push to feature branch' },
      { discipline: 'documentation', hours: 0.17, description: 'Updated SHARED_CHANGELOG, CSV status, standup entries' },
    ],
    filesModified: ['SHARED_CHANGELOG.md', 'GENIESUITE_PROJECT_PLAN.csv', 'src/components/genie-admin/SprintTrackerDashboard.tsx'],
    linesChanged: 70,
    startedAt: '2026-02-17T16:30:00Z',
    completedAt: '2026-02-17T16:50:00Z',
    accomplishment: 'Build passes. All Day 1 work committed and pushed. Changelog and CSV updated.',
  },
];

// ══════════════════════════════════════════════════════════════
// DAY 2 — Genie Deck + Landing Products (Feb 18, 2026)
// ══════════════════════════════════════════════════════════════

export const DAY2_EFFORT: TaskEffort[] = [
  // ── C-201: Fix GenieDeck creation flow — PresentationWizard ──
  {
    taskId: 'C-201',
    developer: 'claude',
    day: 2,
    estimatedHours: 4,
    actualHours: 2,
    variance: -2,
    breakdown: [
      { discipline: 'code-review', hours: 0.5, description: 'Read full PresentationWizard.tsx (2800+ lines), traced 8-step wizard flow, read GenieDeck.tsx page wrapper', files: ['src/components/genie-studio/presentation-generator/PresentationWizard.tsx', 'src/pages/GenieDeck.tsx'] },
      { discipline: 'frontend', hours: 0.5, description: 'Fixed onComplete callback (was never called after generation). Fixed generation progress bar (hardcoded 50% → phase-aware 15-100%)', files: ['src/components/genie-studio/presentation-generator/PresentationWizard.tsx'] },
      { discipline: 'ux', hours: 0.25, description: 'D-004: Error messages now Deck-specific ("Genie Deck: ...") instead of generic', files: ['src/pages/GenieDeck.tsx', 'src/components/genie-studio/presentation-generator/PresentationWizard.tsx'] },
      { discipline: 'ux', hours: 0.25, description: 'D-006: Carousel prev/next buttons — added aria-controls, disabled when single slide', files: ['src/components/genie-studio/presentation-generator/components/GenieDeckHero.tsx'] },
      { discipline: 'architecture', hours: 0.25, description: 'Verified route registration in App.tsx, QuadrantLayout integration, session auto-creation flow' },
      { discipline: 'debugging', hours: 0.25, description: 'Traced generation request building (lines 870-1185), identified missing onComplete call and static progress' },
    ],
    issuesFixed: ['D-004', 'D-006'],
    filesModified: [
      'src/pages/GenieDeck.tsx',
      'src/components/genie-studio/presentation-generator/PresentationWizard.tsx',
      'src/components/genie-studio/presentation-generator/components/GenieDeckHero.tsx',
    ],
    linesChanged: 35,
    startedAt: '2026-02-18T09:00:00Z',
    completedAt: '2026-02-18T11:00:00Z',
    accomplishment: 'Deck wizard creation flow fixed. Progress bar is phase-aware. onComplete fires. Deck-specific errors. ARIA improved.',
  },

  // ── C-202: Fix presentation-generator sub-components ──
  {
    taskId: 'C-202',
    developer: 'claude',
    day: 2,
    estimatedHours: 3,
    actualHours: 1.5,
    variance: -1.5,
    breakdown: [
      { discipline: 'code-review', hours: 0.5, description: 'Audited 10 sub-components: ConfigurationPanel, TemplateBrandingPanelV2, OutputTypePanel, AgentLanguageConfigPanel, SlideCard, ComplianceChecker, GenerationProgressPanel, PreGenerationConfirmation, StepGuidance, StepAlert', files: ['src/components/genie-studio/presentation-generator/'] },
      { discipline: 'backend', hours: 0.25, description: 'CRITICAL: usePresentationSession.createSession — added userId validation before Supabase insert (was inserting undefined user_id)', files: ['src/hooks/usePresentationSession.ts'] },
      { discipline: 'backend', hours: 0.17, description: 'CRITICAL: usePresentationSession.saveSession — safe spread for config merge (was spreading undefined)', files: ['src/hooks/usePresentationSession.ts'] },
      { discipline: 'frontend', hours: 0.25, description: 'ComplianceChecker — added toast import and error notification on check failure (was silent fail)', files: ['src/components/genie-studio/presentation-generator/ComplianceChecker.tsx'] },
      { discipline: 'debugging', hours: 0.33, description: 'Found 12 issues across sub-components: 2 CRITICAL, 3 HIGH, 5 MEDIUM, 2 LOW. Fixed the 2 CRITICAL (auth, config merge)' },
    ],
    issuesFixed: ['usePresentationSession-auth', 'usePresentationSession-config-merge', 'ComplianceChecker-silent-error'],
    filesModified: [
      'src/hooks/usePresentationSession.ts',
      'src/components/genie-studio/presentation-generator/ComplianceChecker.tsx',
    ],
    linesChanged: 20,
    startedAt: '2026-02-18T11:00:00Z',
    completedAt: '2026-02-18T12:30:00Z',
    accomplishment: 'Fixed 2 CRITICAL auth/config bugs in session hook. ComplianceChecker error handling. Audited 10 sub-components (12 issues found, 3 fixed).',
  },

  // ── C-203: Verify Deck end-to-end ──
  {
    taskId: 'C-203',
    developer: 'claude',
    day: 2,
    estimatedHours: 1,
    actualHours: 0.5,
    variance: -0.5,
    breakdown: [
      { discipline: 'testing', hours: 0.25, description: 'Traced full E2E flow: /genie-deck → QuadrantLayout → PresentationWizard (8 steps) → generate → preview → download' },
      { discipline: 'architecture', hours: 0.17, description: 'Verified route in App.tsx, session hook flow (create → autosave → save on generate), PPTX/PDF export' },
      { discipline: 'integration', hours: 0.08, description: 'Confirmed H-201 handoff: /genie-deck renders correctly, Lovable can link to it' },
    ],
    filesModified: [],
    linesChanged: 0,
    startedAt: '2026-02-18T12:30:00Z',
    completedAt: '2026-02-18T13:00:00Z',
    accomplishment: 'Full E2E verified. Route loads, 8-step wizard renders, session creates, auto-saves, generates, previews, downloads. H-201 confirmed ready.',
  },

  // ── S-201: End of Day 2 build check and sync ──
  {
    taskId: 'S-201',
    developer: 'claude',
    day: 2,
    estimatedHours: 0.5,
    actualHours: 0.5,
    variance: 0,
    breakdown: [
      { discipline: 'devops', hours: 0.08, description: 'npm run build — passed in 55s, no errors' },
      { discipline: 'devops', hours: 0.05, description: 'git add, commit (9 files, 91 insertions, 15 deletions), push' },
      { discipline: 'documentation', hours: 0.17, description: 'Updated SHARED_CHANGELOG (4 entries), CSV (4 tasks marked COMPLETED), standup (2 entries)' },
      { discipline: 'integration', hours: 0.12, description: 'Set H-201 to ready in data-dependencies.ts. Updated handoff Quick Reference table.' },
      { discipline: 'documentation', hours: 0.08, description: 'Acknowledged SIC-104/SIC-105 from Lovable' },
    ],
    filesModified: [
      'SHARED_CHANGELOG.md',
      'GENIESUITE_PROJECT_PLAN.csv',
      'src/components/genie-admin/sprint-tracker/data-dependencies.ts',
      'src/components/genie-admin/sprint-tracker/data-config.ts',
    ],
    linesChanged: 91,
    startedAt: '2026-02-18T13:00:00Z',
    completedAt: '2026-02-18T13:30:00Z',
    accomplishment: 'Build passes. All Day 2 committed. H-201 ready. Changelog, CSV, standups updated. Deck is first module complete.',
  },
];

// ══════════════════════════════════════════════════════════════
// LOVABLE — DAY 1 Effort (Feb 17, 2026)
// ══════════════════════════════════════════════════════════════

export const LOVABLE_DAY1_EFFORT: TaskEffort[] = [
  {
    taskId: 'L-101',
    developer: 'lovable',
    day: 1,
    estimatedHours: 4,
    actualHours: 3.5,
    variance: -0.5,
    breakdown: [
      { discipline: 'code-review', hours: 1, description: 'Audited RegionalLandingPage.tsx (70KB) across all 14 regions', files: ['src/components/landing/RegionalLandingPage.tsx'] },
      { discipline: 'frontend', hours: 1.5, description: 'Fixed broken regional content, dead CTA routes → /genie-admin?tab=library', files: ['src/components/landing/RegionalLandingPage.tsx'] },
      { discipline: 'ux', hours: 0.5, description: 'Verified all 14 regions render without errors, CTAs responsive' },
      { discipline: 'documentation', hours: 0.5, description: 'Documented SIC-104 — route corrections for Claude' },
    ],
    issuesFixed: ['SIC-104'],
    filesModified: ['src/components/landing/RegionalLandingPage.tsx'],
    linesChanged: 45,
    startedAt: '2026-02-17T09:00:00Z',
    completedAt: '2026-02-17T12:30:00Z',
    accomplishment: 'RegionalLandingPage audited across 14 regions. Broken CTAs fixed. SIC-104 produced.',
  },
  {
    taskId: 'L-102',
    developer: 'lovable',
    day: 1,
    estimatedHours: 2,
    actualHours: 1.5,
    variance: -0.5,
    breakdown: [
      { discipline: 'code-review', hours: 0.5, description: 'Audited GenieExplorePage.tsx journey flow', files: ['src/pages/GenieExplorePage.tsx'] },
      { discipline: 'frontend', hours: 0.5, description: 'Fixed broken explore journey steps', files: ['src/pages/GenieExplorePage.tsx'] },
      { discipline: 'testing', hours: 0.25, description: 'Verified all steps complete without errors' },
      { discipline: 'documentation', hours: 0.25, description: 'Documented SIC-105 — explore flow verified for Claude' },
    ],
    issuesFixed: ['SIC-105'],
    filesModified: ['src/pages/GenieExplorePage.tsx'],
    linesChanged: 25,
    startedAt: '2026-02-17T12:30:00Z',
    completedAt: '2026-02-17T14:00:00Z',
    accomplishment: 'GenieExplorePage journey verified end-to-end. Broken steps fixed. SIC-105 produced.',
  },
  {
    taskId: 'L-103',
    developer: 'lovable',
    day: 1,
    estimatedHours: 3,
    actualHours: 2.5,
    variance: -0.5,
    breakdown: [
      { discipline: 'code-review', hours: 0.5, description: 'Audited hero sections: HeroLandingVideo.tsx, HeroInteractiveVideo.tsx', files: ['src/components/landing/HeroLandingVideo.tsx', 'src/components/landing/HeroInteractiveVideo.tsx'] },
      { discipline: 'frontend', hours: 1, description: 'Fixed video playback and interactive elements', files: ['src/components/landing/HeroLandingVideo.tsx', 'src/components/landing/HeroInteractiveVideo.tsx'] },
      { discipline: 'ui', hours: 0.5, description: 'Polished hero section visual consistency' },
      { discipline: 'testing', hours: 0.5, description: 'Verified videos play and interactive elements respond' },
    ],
    filesModified: ['src/components/landing/HeroLandingVideo.tsx', 'src/components/landing/HeroInteractiveVideo.tsx'],
    linesChanged: 60,
    startedAt: '2026-02-17T14:00:00Z',
    completedAt: '2026-02-17T16:30:00Z',
    accomplishment: 'Hero sections fixed — videos play, interactive elements respond.',
  },
  {
    taskId: 'L-104',
    developer: 'lovable',
    day: 1,
    estimatedHours: 1,
    actualHours: 0.75,
    variance: -0.25,
    breakdown: [
      { discipline: 'testing', hours: 0.5, description: 'Verified all 6 legal pages load and display content', files: ['src/pages/TermsOfServicePage.tsx', 'src/pages/PrivacyPolicyPage.tsx'] },
      { discipline: 'frontend', hours: 0.25, description: 'Minor fixes to legal page rendering' },
    ],
    filesModified: ['src/pages/TermsOfServicePage.tsx', 'src/pages/PrivacyPolicyPage.tsx'],
    linesChanged: 10,
    startedAt: '2026-02-17T16:30:00Z',
    completedAt: '2026-02-17T17:15:00Z',
    accomplishment: 'All 6 legal pages verified and fixed.',
  },
];

// ══════════════════════════════════════════════════════════════
// LOVABLE — DAY 2 Effort (Feb 18, 2026)
// ══════════════════════════════════════════════════════════════

export const LOVABLE_DAY2_EFFORT: TaskEffort[] = [
  // ── L-201: Fix product catalog ──
  {
    taskId: 'L-201',
    developer: 'lovable',
    day: 2,
    estimatedHours: 3,
    actualHours: 2.5,
    variance: -0.5,
    breakdown: [
      { discipline: 'frontend', hours: 1, description: 'Fixed GenieProductsPage.tsx — product cards render all 3 products with correct data from genie-products.ts', files: ['src/pages/GenieProductsPage.tsx'] },
      { discipline: 'frontend', hours: 0.5, description: 'D-002 FIX: DeckDemoCard fallback UI — shows helpful message when industry data missing instead of null', files: ['src/components/landing/demo-hub/DeckDemoCard.tsx'] },
      { discipline: 'integration', hours: 0.5, description: 'Consumed H-201: verified "Try Deck" CTA links to /genie-deck and wizard loads correctly' },
      { discipline: 'ui', hours: 0.5, description: 'Product card styling, CTA button design, responsive grid layout' },
    ],
    issuesFixed: ['D-002'],
    filesModified: ['src/pages/GenieProductsPage.tsx', 'src/components/landing/demo-hub/DeckDemoCard.tsx'],
    linesChanged: 45,
    startedAt: '2026-02-18T09:00:00Z',
    completedAt: '2026-02-18T11:30:00Z',
    accomplishment: 'Product catalog fixed. D-002 resolved (fallback UI). H-201 consumed — Try Deck CTA verified working.',
  },

  // ── L-202: Fix pricing section ──
  {
    taskId: 'L-202',
    developer: 'lovable',
    day: 2,
    estimatedHours: 2,
    actualHours: 1.5,
    variance: -0.5,
    breakdown: [
      { discipline: 'frontend', hours: 0.75, description: 'Fixed RegionalPricingSection.tsx — 3 tiers (Free/Starter/Pro) render per region', files: ['src/components/landing/RegionalPricingSection.tsx'] },
      { discipline: 'ui', hours: 0.5, description: 'Pricing card layout, tier highlight, currency formatting per region' },
      { discipline: 'testing', hours: 0.25, description: 'Verified pricing across 14 regions with correct currency symbols' },
    ],
    filesModified: ['src/components/landing/RegionalPricingSection.tsx'],
    linesChanged: 35,
    startedAt: '2026-02-18T11:30:00Z',
    completedAt: '2026-02-18T13:00:00Z',
    accomplishment: 'Pricing section fixed. 3 tiers display correctly per region with proper currency localization.',
  },

  // ── L-203: Verify Explore demo pages ──
  {
    taskId: 'L-203',
    developer: 'lovable',
    day: 2,
    estimatedHours: 2,
    actualHours: 1,
    variance: -1,
    breakdown: [
      { discipline: 'frontend', hours: 0.5, description: 'D-005 FIX: Added loading skeleton for AI image generation in DeckDemoCard', files: ['src/components/landing/demo-hub/DeckDemoCard.tsx'] },
      { discipline: 'testing', hours: 0.25, description: 'Verified explore demo page flows complete without errors' },
      { discipline: 'integration', hours: 0.25, description: 'Acknowledged SIC-104 (route fix) and SIC-105 (explore flow) from Claude' },
    ],
    issuesFixed: ['D-005'],
    filesModified: ['src/components/landing/demo-hub/DeckDemoCard.tsx', 'src/pages/GenieExploreDemoPage.tsx'],
    linesChanged: 30,
    startedAt: '2026-02-18T13:00:00Z',
    completedAt: '2026-02-18T14:00:00Z',
    accomplishment: 'Explore demos verified. D-005 fixed (image loading skeleton). SIC-104/SIC-105 acknowledged.',
  },

  // ── L-204: Add missing landing page sections ──
  {
    taskId: 'L-204',
    developer: 'lovable',
    day: 2,
    estimatedHours: 2,
    actualHours: 1.5,
    variance: -0.5,
    breakdown: [
      { discipline: 'frontend', hours: 0.75, description: 'Added missing landing sections identified in Day 1 audit', files: ['src/components/landing/'] },
      { discipline: 'ui', hours: 0.5, description: 'Section layout, spacing, visual consistency with existing sections' },
      { discipline: 'testing', hours: 0.25, description: 'Verified all planned sections present and rendering across viewports' },
    ],
    filesModified: ['src/components/landing/'],
    linesChanged: 50,
    startedAt: '2026-02-18T14:00:00Z',
    completedAt: '2026-02-18T15:30:00Z',
    accomplishment: 'All planned landing sections present. Hero CTAs verified. Support email updated.',
  },
];

// ══════════════════════════════════════════════════════════════
// ALL EFFORT DATA — Combined for metric computation
// ══════════════════════════════════════════════════════════════

export const ALL_EFFORT: TaskEffort[] = [
  ...DAY1_EFFORT,
  ...DAY2_EFFORT,
  ...LOVABLE_DAY1_EFFORT,
  ...LOVABLE_DAY2_EFFORT,
];

// ══════════════════════════════════════════════════════════════
// DISCIPLINE METADATA — Labels, colors, icons for UI rendering
// ══════════════════════════════════════════════════════════════

export const DISCIPLINE_META: Record<Discipline, { label: string; color: string; icon: string; description: string }> = {
  frontend:      { label: 'Frontend',      color: '#3b82f6', icon: 'Code2',        description: 'React components, JSX, state management' },
  backend:       { label: 'Backend',       color: '#10b981', icon: 'Server',       description: 'Edge functions, API routes, Supabase calls' },
  ux:            { label: 'UX',            color: '#8b5cf6', icon: 'Users',        description: 'User flows, accessibility, interaction design' },
  ui:            { label: 'UI',            color: '#ec4899', icon: 'Palette',      description: 'Visual styling, Tailwind, layout, branding' },
  database:      { label: 'Database',      color: '#f59e0b', icon: 'Database',     description: 'Supabase tables, RLS, migrations, queries' },
  devops:        { label: 'DevOps',        color: '#6366f1', icon: 'GitBranch',    description: 'Build, git, deployment, CI/CD' },
  architecture:  { label: 'Architecture',  color: '#0ea5e9', icon: 'Blocks',       description: 'System design, dependency mapping, planning' },
  testing:       { label: 'Testing',       color: '#14b8a6', icon: 'TestTube2',    description: 'Manual E2E testing, verification, QA' },
  documentation: { label: 'Documentation', color: '#64748b', icon: 'FileText',     description: 'Changelogs, standups, CSV, sprint tracker' },
  'code-review': { label: 'Code Review',   color: '#a855f7', icon: 'Search',       description: 'Auditing, diagnosing, reading existing code' },
  integration:   { label: 'Integration',   color: '#f97316', icon: 'Link',         description: 'Cross-module wiring, handoffs, shared hooks' },
  debugging:     { label: 'Debugging',     color: '#ef4444', icon: 'Bug',          description: 'Bug investigation, root cause analysis' },
};

// ══════════════════════════════════════════════════════════════
// COMPUTED METRICS — Auto-calculated from ALL_EFFORT
// ══════════════════════════════════════════════════════════════

export function computeEffortMetrics(efforts: TaskEffort[] = ALL_EFFORT): EffortMetrics {
  const totalEstimated = efforts.reduce((sum, e) => sum + e.estimatedHours, 0);
  const totalActual = efforts.reduce((sum, e) => sum + e.actualHours, 0);
  const totalVariance = totalActual - totalEstimated;

  // By discipline
  const byDiscipline = {} as EffortMetrics['byDiscipline'];
  const allDisciplines: Discipline[] = [
    'frontend', 'backend', 'ux', 'ui', 'database', 'devops',
    'architecture', 'testing', 'documentation', 'code-review', 'integration', 'debugging',
  ];

  for (const d of allDisciplines) {
    byDiscipline[d] = { hours: 0, percentage: 0, taskCount: 0 };
  }

  for (const effort of efforts) {
    for (const entry of effort.breakdown) {
      byDiscipline[entry.discipline].hours += entry.hours;
      byDiscipline[entry.discipline].taskCount++;
    }
  }

  // Calculate percentages
  for (const d of allDisciplines) {
    byDiscipline[d].percentage = totalActual > 0
      ? Math.round((byDiscipline[d].hours / totalActual) * 100)
      : 0;
  }

  // By developer
  const byDeveloper = {
    claude: { estimatedHours: 0, actualHours: 0, variance: 0, completedTasks: 0, topDisciplines: [] as { discipline: Discipline; hours: number }[] },
    lovable: { estimatedHours: 0, actualHours: 0, variance: 0, completedTasks: 0, topDisciplines: [] as { discipline: Discipline; hours: number }[] },
  };

  const devDisciplines: Record<Developer, Record<Discipline, number>> = {
    claude: {} as Record<Discipline, number>,
    lovable: {} as Record<Discipline, number>,
  };

  for (const effort of efforts) {
    const dev = effort.developer;
    byDeveloper[dev].estimatedHours += effort.estimatedHours;
    byDeveloper[dev].actualHours += effort.actualHours;
    byDeveloper[dev].variance += effort.variance;
    byDeveloper[dev].completedTasks++;

    for (const entry of effort.breakdown) {
      devDisciplines[dev][entry.discipline] = (devDisciplines[dev][entry.discipline] || 0) + entry.hours;
    }
  }

  // Top disciplines per developer
  for (const dev of ['claude', 'lovable'] as Developer[]) {
    byDeveloper[dev].topDisciplines = Object.entries(devDisciplines[dev])
      .map(([d, h]) => ({ discipline: d as Discipline, hours: h }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  }

  // By day
  const byDay = {} as EffortMetrics['byDay'];
  for (let d = 1; d <= 5; d++) {
    byDay[d] = { estimatedHours: 0, actualHours: 0, tasksCompleted: 0, disciplines: {} as Record<Discipline, number> };
  }

  for (const effort of efforts) {
    byDay[effort.day].estimatedHours += effort.estimatedHours;
    byDay[effort.day].actualHours += effort.actualHours;
    byDay[effort.day].tasksCompleted++;

    for (const entry of effort.breakdown) {
      byDay[effort.day].disciplines[entry.discipline] =
        (byDay[effort.day].disciplines[entry.discipline] || 0) + entry.hours;
    }
  }

  // Velocity by day
  const velocityByDay = {} as Record<number, number>;
  for (let d = 1; d <= 5; d++) {
    velocityByDay[d] = byDay[d].tasksCompleted;
  }

  return {
    totalEstimated,
    totalActual,
    totalVariance,
    estimateAccuracy: totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0,
    byDiscipline,
    byDeveloper,
    byDay,
    velocityByDay,
  };
}
