// Sprint Tracker — Shared Infrastructure Change Registry
//
// PURPOSE: Every time Claude or Lovable touches a shared file/component/service,
// it is logged here. Both developers see ALL changes automatically — no manual input.
// The system surfaces "Impact on You" alerts to the OTHER developer.

import type { Developer } from './types';

export type ChangeImpact = 'breaking' | 'attention' | 'info';
export type ChangeCategory = 'route' | 'schema' | 'hook' | 'service' | 'config' | 'component' | 'type' | 'auth' | 'navigation';

export interface SharedInfraChange {
  id: string;
  timestamp: string;
  changedBy: Developer;
  category: ChangeCategory;
  impact: ChangeImpact;
  file: string;
  what: string;               // Short description of what changed
  why: string;                // Why it was changed
  howToUse?: string;          // If the other dev needs to adopt it
  breakingDetail?: string;    // If breaking: exactly what breaks + how to fix
  impactOn: {
    claude: string | null;    // null = not affected
    lovable: string | null;
  };
  taskId?: string;            // Which sprint task produced this change
  acknowledged: {
    claude: boolean;
    lovable: boolean;
  };
}

// ─── Shared files that BOTH devs can touch ──────────────────────────────────

export const SHARED_FILES = [
  // Routes & Navigation
  'src/App.tsx',
  'src/pages/Index.tsx',
  // Locked shared infrastructure (read only — but tracked for awareness)
  'src/constants/genie-products.ts',
  'src/config/genieStudioNavItems.ts',
  'src/hooks/useMasterAuth.tsx',
  'src/components/auth/ProtectedRoute.tsx',
  'src/components/auth/GenieStudioProtectedRoute.tsx',
  'src/components/layout/AppLayout.tsx',
  'src/components/layout/GenieStudioLayout.tsx',
  // Supabase types (auto-generated but everyone reads it)
  'src/integrations/supabase/types.ts',
  'src/integrations/supabase/client.ts',
  // Shared UI tokens
  'src/index.css',
  'tailwind.config.ts',
  // Navigation shared between Claude + Lovable zones
  'src/components/navigation/QuadrantNavigation.tsx',
  'src/components/navigation/QuadrantNavigationHub.tsx',
  // The sprint tracker itself (both read)
  'src/components/genie-admin/sprint-tracker/data-dependencies.ts',
  'src/components/genie-admin/sprint-tracker/data-config.ts',
];

// ─── Shared services / hooks both devs depend on ───────────────────────────

export const SHARED_SERVICES = [
  { name: 'useMasterAuth', file: 'src/hooks/useMasterAuth.tsx', owner: 'locked' as const },
  { name: 'supabase client', file: 'src/integrations/supabase/client.ts', owner: 'locked' as const },
  { name: 'GENIE_PRODUCTS', file: 'src/constants/genie-products.ts', owner: 'locked' as const },
  { name: 'genieStudioNavItems', file: 'src/config/genieStudioNavItems.ts', owner: 'locked' as const },
  { name: 'QuadrantNavigation', file: 'src/components/navigation/QuadrantNavigation.tsx', owner: 'claude' as Developer },
  { name: 'AppLayout', file: 'src/components/layout/AppLayout.tsx', owner: 'locked' as const },
  { name: 'TailwindConfig', file: 'tailwind.config.ts', owner: 'both' as const },
  { name: 'GlobalCSS', file: 'src/index.css', owner: 'both' as const },
];

// ─── Actual change log (auto-populated from task completions) ──────────────
// These are seeded from Day 1 verified work. New entries append via the UI.

export const SHARED_INFRA_CHANGES: SharedInfraChange[] = [
  // ── Day 1: Claude → Lovable ──
  {
    id: 'SIC-101',
    timestamp: '2026-02-17T14:00:00Z',
    changedBy: 'claude',
    category: 'route',
    impact: 'breaking',
    file: 'src/components/genie-admin/sprint-tracker/data-config.ts',
    what: 'Route corrected: `/genie-studio/productions` → `/genie-admin?tab=library`',
    why: 'Old route was dead — no page exists at /genie-studio/productions',
    breakingDetail: 'Any CTA or link pointing to /genie-studio/productions will 404. Update to /genie-admin?tab=library.',
    impactOn: {
      claude: null,
      lovable: 'Update landing CTAs: RegionalLandingPage.tsx, any CTA that said "Go to Productions". Use /genie-admin?tab=library.',
    },
    taskId: 'C-101',
    acknowledged: { claude: true, lovable: true },
  },
  {
    id: 'SIC-102',
    timestamp: '2026-02-17T14:30:00Z',
    changedBy: 'claude',
    category: 'config',
    impact: 'attention',
    file: 'src/constants/genie-products.ts',
    what: 'Mind tagline is "AI That Understands" — NOT "Think Beyond Limits"',
    why: 'Hardcoded wrong tagline found in GenieMind.tsx. GENIE_PRODUCTS is source of truth.',
    howToUse: 'Import: `import { GENIE_PRODUCTS } from "@/constants/genie-products"` then use `GENIE_PRODUCTS.mind.tagline`',
    impactOn: {
      claude: null,
      lovable: 'Check landing page for any hardcoded Mind taglines. Replace with GENIE_PRODUCTS.mind.tagline import.',
    },
    taskId: 'C-102',
    acknowledged: { claude: true, lovable: true },
  },
  {
    id: 'SIC-103',
    timestamp: '2026-02-17T15:00:00Z',
    changedBy: 'claude',
    category: 'config',
    impact: 'attention',
    file: 'support email',
    what: 'Support email standardized to support@geniaisuite.com',
    why: 'GenieDeck.tsx had example.com placeholder. Standardized across all products.',
    howToUse: 'Use: support@geniaisuite.com everywhere. Never example.com.',
    impactOn: {
      claude: null,
      lovable: 'Verify legal pages (L-104 scope): privacy, terms, support — all use support@geniaisuite.com.',
    },
    taskId: 'C-103',
    acknowledged: { claude: true, lovable: true },
  },
  // ── Day 1: Lovable → Claude ──
  {
    id: 'SIC-104',
    timestamp: '2026-02-18T12:00:00Z',
    changedBy: 'lovable',
    category: 'route',
    impact: 'info',
    file: 'src/components/landing/RegionalLandingPage.tsx',
    what: 'Broken regional content fixed. CTA routes updated to /genie-admin?tab=library',
    why: 'L-101 audit — found dead routes and broken regional content',
    impactOn: {
      claude: 'Landing CTAs now point correctly to Claude-owned routes (/genie-admin?tab=library). No action needed from Claude.',
      lovable: null,
    },
    taskId: 'L-101',
    acknowledged: { claude: true, lovable: true },
  },
  {
    id: 'SIC-105',
    timestamp: '2026-02-18T13:00:00Z',
    changedBy: 'lovable',
    category: 'component',
    impact: 'info',
    file: 'src/pages/GenieExplorePage.tsx',
    what: 'Explore journey verified and fixed — all steps complete without errors',
    why: 'L-102 — broken explore journey steps found and resolved',
    impactOn: {
      claude: 'GenieExplorePage links to Claude-owned products. Verify /genie-spark, /genie-mind, /genie-deck load when Explore links to them.',
      lovable: null,
    },
    taskId: 'L-102',
    acknowledged: { claude: true, lovable: true },
  },
  // ── Day 2: Lovable → Claude (completed 2026-02-18) ──
  {
    id: 'SIC-201',
    timestamp: '2026-02-18T20:00:00Z',
    changedBy: 'lovable',
    category: 'component',
    impact: 'info',
    file: 'src/components/landing/DeckDemoCard.tsx',
    what: 'L-201 complete: Product catalog + "Try It" CTAs shipped. DeckDemoCard fallback UI + image skeleton added.',
    why: 'Day 2 Lovable tasks — product page and Deck CTA live',
    howToUse: 'Landing /genie-deck CTA is live. Claude can now verify the Deck route loads from the landing page.',
    impactOn: {
      claude: 'Landing /genie-deck CTA is live. Run E2E: landing → /genie-deck → PresentationWizard.',
      lovable: null,
    },
    taskId: 'L-201',
    acknowledged: { claude: false, lovable: true },
  },
  {
    id: 'SIC-202',
    timestamp: '2026-02-18T20:00:00Z',
    changedBy: 'lovable',
    category: 'config',
    impact: 'info',
    file: 'src/components/landing/ (pricing/tier components)',
    what: 'L-202 complete: Tier names aligned — free/starter/creator/pro/business/enterprise match genieStudioNavItems.ts',
    why: 'H-203 resolution — pricing tier consistency across landing and studio',
    impactOn: {
      claude: null,
      lovable: null,
    },
    taskId: 'L-202',
    acknowledged: { claude: false, lovable: true },
  },
];

// ─── Storage key for runtime acknowledgments ───────────────────────────────

export const SIC_ACK_KEY = 'genie_sprint_sic_acks_v1';

export function getSicAcks(): Record<string, { ackedAt: string }> {
  try {
    const s = localStorage.getItem(SIC_ACK_KEY);
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
}

export function setSicAck(sicId: string) {
  const acks = getSicAcks();
  acks[sicId] = { ackedAt: new Date().toISOString() };
  localStorage.setItem(SIC_ACK_KEY, JSON.stringify(acks));
}

// ─── Auto-generate a change entry from a task completion ──────────────────

export function buildAutoChangeFromTask(
  taskId: string,
  developer: Developer,
  files: string[],
  summary: string,
): Omit<SharedInfraChange, 'id' | 'acknowledged'> {
  const sharedFiles = files.filter(f =>
    SHARED_FILES.some(sf => f.includes(sf.replace('**', '')) || sf === f)
  );

  const isShared = sharedFiles.length > 0;
  const otherDev: Developer = developer === 'claude' ? 'lovable' : 'claude';

  return {
    timestamp: new Date().toISOString(),
    changedBy: developer,
    category: 'component',
    impact: isShared ? 'attention' : 'info',
    file: sharedFiles[0] ?? files[0] ?? 'multiple files',
    what: summary,
    why: `Task ${taskId} completion`,
    impactOn: {
      [developer]: null,
      [otherDev]: isShared
        ? `${developer === 'claude' ? 'Claude' : 'Lovable'} modified ${sharedFiles.join(', ')} as part of ${taskId}. Review if your work depends on these files.`
        : null,
    } as SharedInfraChange['impactOn'],
    taskId,
  };
}
