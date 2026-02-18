// Sprint Tracker — Config, defaults, locked files, file ownership
import type { Developer, TaskOverride, StandupEntry, SprintDay } from './types';

export const SPRINT_START_DATE = '2026-02-17';
export const SPRINT_END_DATE = '2026-02-21';

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
  { area: 'Genie Studio', files: 'src/components/genie-studio/**', count: 150, owner: 'claude' as Developer },
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
  // ── Day 2: Lovable (gated) ──
  'L-201': { status: 'in-progress', updatedAt: '2026-02-18T12:00:00Z', note: 'GATED: Waiting on H-201 (Deck flow live at /genie-deck) from Claude.' },
  'L-202': { status: 'in-progress', updatedAt: '2026-02-18T12:00:00Z', note: 'GATED: Waiting on H-203 (pricing tier name alignment) from Claude.' },
  'L-203': { status: 'pending', updatedAt: '2026-02-18T12:00:00Z', note: 'No hard gate — can start when L-201 is unblocked.' },
  'L-204': { status: 'pending', updatedAt: '2026-02-18T12:00:00Z', note: 'No hard gate — can start anytime.' },
};

export const DEFAULT_STANDUPS: StandupEntry[] = [
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
  {
    day: 2, developer: 'claude' as Developer,
    yesterday: 'Day 1: Diagnosed all 3 CREATE products. Found 33 issues. Fixed 11. Build passes.',
    today: 'Day 2: C-201 Fix PresentationWizard (4h). C-202 Fix sub-components (3h). C-203 E2E verify (1h).',
    blockers: 'None — Deck is cleanest product.',
    createdAt: '2026-02-17T17:00:00Z',
  },
];

export function calculateCurrentDay(): number {
  const start = new Date(SPRINT_START_DATE);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  return Math.min(Math.max(diffDays, 1), 5);
}
