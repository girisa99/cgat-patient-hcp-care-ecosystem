// Sprint Tracker — Cross-Functional Dependencies & Handoffs
//
// This file maps every point where Claude's work touches Lovable's and vice versa.
// Both developers read this at session start. The PO/SM uses it to verify handoffs.

import type { Handoff, DependencyChain, POChecklistItem } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// HANDOFFS: Every artifact that crosses the Claude ↔ Lovable boundary
// ─────────────────────────────────────────────────────────────────────────────

export const HANDOFFS: Handoff[] = [
  // ── Day 1 ──
  {
    id: 'H-101',
    title: 'Route corrections for landing CTAs',
    from: 'claude', to: 'lovable', direction: 'claude-to-lovable',
    day: 1,
    producerTaskId: 'C-101',
    consumerTaskId: 'L-101',
    artifact: 'Route `/genie-studio/productions` → `/genie-admin?tab=library`',
    consumerNotes: 'Update any landing page links that pointed to the old route. Use `/genie-admin?tab=library` for production hub.',
    status: 'ready',
    priority: 'critical',
  },
  {
    id: 'H-102',
    title: 'Corrected product taglines',
    from: 'claude', to: 'lovable', direction: 'claude-to-lovable',
    day: 1,
    producerTaskId: 'C-104',
    consumerTaskId: 'L-101',
    artifact: 'Mind tagline: "AI That Understands" (not "Think Beyond Limits")',
    consumerNotes: 'Always import from `GENIE_PRODUCTS.mind.tagline`. Never hardcode.',
    status: 'ready',
    priority: 'high',
  },
  {
    id: 'H-103',
    title: 'Support email standardized',
    from: 'claude', to: 'lovable', direction: 'claude-to-lovable',
    day: 1,
    producerTaskId: 'C-103',
    consumerTaskId: 'L-104',
    artifact: 'Email: `support@geniaisuite.com` (not example.com)',
    consumerNotes: 'Use this email on support pages and legal pages.',
    status: 'ready',
    priority: 'medium',
  },

  // ── Day 2 — Sprint Tracker UI/UX Handoff ──
  {
    id: 'H-110',
    title: 'Sprint Tracker UI/UX → Lovable owns visual polish',
    from: 'claude', to: 'lovable', direction: 'claude-to-lovable',
    day: 2,
    producerTaskId: 'C-104',
    consumerTaskId: 'L-110',
    artifact: 'Sprint Tracker modular components at src/components/genie-admin/sprint-tracker/ (12 files). Data layer, types, hooks, and tab structure are complete. Lovable owns all visual/UI/UX improvements.',
    consumerNotes: `Sprint Tracker UI/UX is now Lovable's responsibility. Claude built:
- 7 tab views (Board, Standups, Dependencies, Findings, Metrics, Strategy, PO Gate)
- Data files (data-tasks.ts, data-dependencies.ts, data-findings.ts, data-config.ts)
- Hook (useSprintTracker.ts) and types (types.ts)
- Route: /genie-admin?tab=sprint-tracker

Lovable should:
1. Restyle all tab views with proper Shadcn/Tailwind polish
2. Make the Kanban board drag-and-drop friendly
3. Add animations, transitions, and mobile responsiveness
4. Improve card layouts, color coding, and visual hierarchy
5. Optionally render Mermaid diagrams inline (or replace with React-based visualizations)

Do NOT change: data structures, types, hook logic, or data-dependencies.ts handoff/chain data.`,
    status: 'ready',
    priority: 'high',
  },

  // ── Day 2 ──
  {
    id: 'H-201',
    title: 'Deck creation flow working → landing can link to it',
    from: 'claude', to: 'lovable', direction: 'claude-to-lovable',
    day: 2,
    producerTaskId: 'C-203',
    consumerTaskId: 'L-201',
    artifact: 'Route `/genie-deck` now has working creation flow',
    consumerNotes: 'Product catalog can show "Try Deck" CTA linking to `/genie-deck`. Verify it loads.',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'H-202',
    title: 'Product catalog data → must match genie-products.ts',
    from: 'lovable', to: 'claude', direction: 'lovable-to-claude',
    day: 2,
    producerTaskId: 'L-201',
    consumerTaskId: 'C-201',
    artifact: 'Product descriptions, features, pricing from GenieProductsPage.tsx',
    consumerNotes: 'If Lovable changes product descriptions, Claude should verify Deck/Spark/Mind match.',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'H-203',
    title: 'Pricing tier names → must match genieStudioNavItems tier gating',
    from: 'lovable', to: 'claude', direction: 'bidirectional',
    day: 2,
    producerTaskId: 'L-202',
    consumerTaskId: 'C-201',
    artifact: 'Pricing tier names (starter/pro/enterprise) and feature lists',
    consumerNotes: 'Both devs must use same tier names. Source of truth: `genieStudioNavItems.ts` (locked).',
    status: 'pending',
    priority: 'critical',
  },

  // ── Day 3 ──
  {
    id: 'H-301',
    title: 'Spark creation flow working → demos can reference it',
    from: 'claude', to: 'lovable', direction: 'claude-to-lovable',
    day: 3,
    producerTaskId: 'C-304',
    consumerTaskId: 'L-301',
    artifact: 'Route `/genie-spark` has working prompt→generate→save flow',
    consumerNotes: 'Interactive demos (STT, translation) can link to Spark as "Try it live".',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'H-302',
    title: 'Demo data format → must match SmartContentPipeline input',
    from: 'lovable', to: 'claude', direction: 'lovable-to-claude',
    day: 3,
    producerTaskId: 'L-301',
    consumerTaskId: 'C-301',
    artifact: 'Demo output format (text, audio, translation results)',
    consumerNotes: 'If demos produce content that feeds into Spark, format must match SmartContentPipeline props.',
    status: 'pending',
    priority: 'medium',
  },

  // ── Day 4 ──
  {
    id: 'H-401',
    title: 'Mind editing flow working → landing can showcase it',
    from: 'claude', to: 'lovable', direction: 'claude-to-lovable',
    day: 4,
    producerTaskId: 'C-404',
    consumerTaskId: 'L-401',
    artifact: 'Route `/genie-mind` has working script editing + voiceover',
    consumerNotes: 'Mobile responsive landing should include Mind in product showcase.',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'H-402',
    title: 'Mobile breakpoints → shared across landing and studio',
    from: 'lovable', to: 'claude', direction: 'bidirectional',
    day: 4,
    producerTaskId: 'L-401',
    consumerTaskId: 'C-401',
    artifact: 'Breakpoints: sm=640px, md=768px, lg=1024px, xl=1280px',
    consumerNotes: 'Both devs use Tailwind defaults. If Lovable customizes, Claude needs to know.',
    status: 'pending',
    priority: 'medium',
  },

  // ── Day 5 ──
  {
    id: 'H-501',
    title: 'Claude merges to main FIRST',
    from: 'claude', to: 'lovable', direction: 'claude-to-lovable',
    day: 5,
    producerTaskId: 'C-504',
    consumerTaskId: 'L-504',
    artifact: 'Main branch with all CREATE tool fixes merged',
    consumerNotes: 'Lovable MUST rebase onto main AFTER Claude merges. Do NOT merge in parallel.',
    status: 'pending',
    priority: 'critical',
  },
  {
    id: 'H-502',
    title: 'Landing → Studio navigation verified end-to-end',
    from: 'lovable', to: 'claude', direction: 'bidirectional',
    day: 5,
    producerTaskId: 'L-502',
    consumerTaskId: 'C-501',
    artifact: 'Full navigation path: landing → auth → genie-studio → spark/mind/deck',
    consumerNotes: 'Both devs verify their side of the navigation chain works.',
    status: 'pending',
    priority: 'critical',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEPENDENCY CHAINS: Which tasks block which
// ─────────────────────────────────────────────────────────────────────────────

export const DEPENDENCY_CHAINS: DependencyChain[] = [
  // Day 1 → Day 2 chains
  { taskId: 'C-201', blockedBy: ['C-101', 'C-103'], unblocks: ['C-202', 'C-203'] },
  { taskId: 'C-202', blockedBy: ['C-201'], unblocks: ['C-203'] },
  { taskId: 'C-203', blockedBy: ['C-201', 'C-202'], unblocks: ['H-201'] },
  { taskId: 'L-201', blockedBy: ['L-101'], unblocks: ['L-203', 'H-202'] },
  { taskId: 'L-202', blockedBy: ['L-101'], unblocks: ['H-203'] },

  // Day 2 → Day 3 chains
  { taskId: 'C-301', blockedBy: ['C-101'], unblocks: ['C-302', 'C-304'] },
  { taskId: 'C-302', blockedBy: ['C-101'], unblocks: ['C-304'] },
  { taskId: 'C-303', blockedBy: ['C-101'], unblocks: ['C-304'] },
  { taskId: 'C-304', blockedBy: ['C-301', 'C-302', 'C-303'], unblocks: ['H-301'] },
  { taskId: 'L-301', blockedBy: ['L-101', 'L-102'], unblocks: ['L-302', 'H-302'] },

  // Day 3 → Day 4 chains
  { taskId: 'C-401', blockedBy: ['C-102'], unblocks: ['C-404'] },
  { taskId: 'C-404', blockedBy: ['C-304', 'C-401'], unblocks: ['H-401'] },
  { taskId: 'L-401', blockedBy: ['L-101', 'L-201'], unblocks: ['L-402', 'H-402'] },

  // Day 4 → Day 5 chains
  { taskId: 'C-501', blockedBy: ['C-203', 'C-304', 'C-404'], unblocks: ['C-504'] },
  { taskId: 'C-504', blockedBy: ['C-501', 'C-502', 'C-503'], unblocks: ['H-501'] },
  { taskId: 'L-501', blockedBy: ['L-101', 'L-201', 'L-301', 'L-401'], unblocks: ['L-504'] },
  { taskId: 'L-504', blockedBy: ['L-501', 'L-502', 'L-503', 'H-501'], unblocks: ['S-501'] },
  { taskId: 'S-501', blockedBy: ['C-504', 'L-504'], unblocks: [] },
];

// ─────────────────────────────────────────────────────────────────────────────
// PO/SM DAILY CHECKLISTS: What to verify, approve, decide, unblock each day
// ─────────────────────────────────────────────────────────────────────────────

export const PO_CHECKLISTS: POChecklistItem[] = [
  // ── Day 1 ──
  { id: 'PO-101', day: 1, category: 'verify', title: 'Both devs have branches created and pushed', description: 'Check git branch -r for both claude/* and lovable/* branches', developer: 'both', relatedTasks: [], completed: false },
  { id: 'PO-102', day: 1, category: 'verify', title: 'Claude diagnosis report reviewed', description: 'Read GENIESUITE_DAY1_DIAGNOSIS.md — 33 issues found. Do you agree with severity ratings?', developer: 'claude', relatedTasks: ['C-104'], completed: false },
  { id: 'PO-103', day: 1, category: 'approve', title: 'Fix priority order agreed', description: 'Claude proposes: Day2=Deck, Day3=Spark, Day4=Mind. Approve or re-order?', developer: 'claude', relatedTasks: ['C-201', 'C-301', 'C-401'], completed: false },
  { id: 'PO-104', day: 1, category: 'verify', title: 'Lovable landing audit complete', description: 'Check L-101 to L-104 — are audit findings documented?', developer: 'lovable', relatedTasks: ['L-101', 'L-102', 'L-103', 'L-104'], completed: false },
  { id: 'PO-105', day: 1, category: 'decide', title: 'Which open issues are must-fix vs nice-to-have?', description: 'Claude found 22 open issues. Categorize: must-fix for MVP vs post-sprint.', developer: 'both', relatedTasks: ['C-104'], completed: false },
  { id: 'PO-106', day: 1, category: 'verify', title: 'Build passes on both branches', description: 'Run npm run build. Both branches should be green.', developer: 'both', relatedTasks: ['S-101'], completed: false },

  // ── Day 2 ──
  { id: 'PO-201', day: 2, category: 'verify', title: 'Deck creation flow works end-to-end', description: 'Visit /genie-deck and create a test presentation through all 6 wizard steps.', route: '/genie-deck', developer: 'claude', relatedTasks: ['C-201', 'C-202', 'C-203'], completed: false },
  { id: 'PO-202', day: 2, category: 'verify', title: 'Product catalog renders correctly', description: 'Visit /products and verify all 3 products show with correct info.', route: '/products', developer: 'lovable', relatedTasks: ['L-201'], completed: false },
  { id: 'PO-203', day: 2, category: 'approve', title: 'Pricing tiers match between landing and studio', description: 'Compare pricing on /products page with tier gating in genieStudioNavItems.ts', developer: 'both', relatedTasks: ['L-202', 'H-203'], completed: false },
  { id: 'PO-204', day: 2, category: 'decide', title: 'Landing CTA → Deck link approved', description: 'Lovable\'s product page links to /genie-deck. Verify Claude\'s Deck is ready.', developer: 'both', relatedTasks: ['H-201'], completed: false },
  { id: 'PO-205', day: 2, category: 'unblock', title: 'Handoff H-201 acknowledged', description: 'Confirm Lovable has acknowledged the Deck route is live and working.', developer: 'lovable', relatedTasks: ['H-201'], completed: false },

  // ── Day 3 ──
  { id: 'PO-301', day: 3, category: 'verify', title: 'Spark creation flow works end-to-end', description: 'Visit /genie-spark, enter a prompt, generate content, save script.', route: '/genie-spark', developer: 'claude', relatedTasks: ['C-301', 'C-302', 'C-303', 'C-304'], completed: false },
  { id: 'PO-302', day: 3, category: 'verify', title: 'Interactive demos respond correctly', description: 'Test STT demo, translation demo, video showcase on landing page.', route: '/', developer: 'lovable', relatedTasks: ['L-301', 'L-302', 'L-303'], completed: false },
  { id: 'PO-303', day: 3, category: 'approve', title: 'Demo → Spark "Try it live" link approved', description: 'Landing demos should link to /genie-spark. Verify flow.', developer: 'both', relatedTasks: ['H-301'], completed: false },
  { id: 'PO-304', day: 3, category: 'verify', title: 'All 14 regions switch correctly', description: 'Test region switcher — content changes per region.', route: '/', developer: 'lovable', relatedTasks: ['L-304'], completed: false },
  { id: 'PO-305', day: 3, category: 'decide', title: 'AI generation quality acceptable?', description: 'Review SmartContentPipeline output. Is simulated AI OK for MVP or need real API?', developer: 'claude', relatedTasks: ['C-301'], completed: false },

  // ── Day 4 ──
  { id: 'PO-401', day: 4, category: 'verify', title: 'Mind script editing works', description: 'Visit /genie-mind, load a script, edit it, verify save.', route: '/genie-mind', developer: 'claude', relatedTasks: ['C-401'], completed: false },
  { id: 'PO-402', day: 4, category: 'verify', title: 'Spark → Mind flow works', description: 'Create script in Spark, navigate to Mind, verify script appears.', route: '/genie-spark', developer: 'claude', relatedTasks: ['C-404'], completed: false },
  { id: 'PO-403', day: 4, category: 'verify', title: 'Mobile responsiveness acceptable', description: 'Test landing page at 375px, 768px, 1024px viewports.', route: '/', developer: 'lovable', relatedTasks: ['L-401'], completed: false },
  { id: 'PO-404', day: 4, category: 'approve', title: 'SEO meta tags correct', description: 'Check OG tags, descriptions, titles for each region.', developer: 'lovable', relatedTasks: ['L-402'], completed: false },
  { id: 'PO-405', day: 4, category: 'decide', title: 'All 3 CREATE modules ready for integration?', description: 'Spark, Mind, Deck all functional. Ready for Day 5 integration test?', developer: 'both', relatedTasks: ['S-401'], completed: false },

  // ── Day 5 ──
  { id: 'PO-501', day: 5, category: 'verify', title: 'All 3 CREATE routes load without errors', description: 'Visit /genie-spark, /genie-mind, /genie-deck — no console errors.', developer: 'claude', relatedTasks: ['C-501'], completed: false },
  { id: 'PO-502', day: 5, category: 'verify', title: 'All landing routes load without errors', description: 'Visit /, /explore, /products, /support — no console errors.', developer: 'lovable', relatedTasks: ['L-501'], completed: false },
  { id: 'PO-503', day: 5, category: 'verify', title: 'Full navigation: landing → auth → studio → create', description: 'End-to-end user journey from landing page to creating content.', developer: 'both', relatedTasks: ['L-502', 'C-502', 'H-502'], completed: false },
  { id: 'PO-504', day: 5, category: 'approve', title: 'Claude merge to main approved', description: 'Build passes. All CREATE fixes verified. Approve merge.', developer: 'claude', relatedTasks: ['C-504', 'H-501'], completed: false },
  { id: 'PO-505', day: 5, category: 'approve', title: 'Lovable rebase + merge approved', description: 'Lovable rebased onto main (after Claude). Build passes. Approve merge.', developer: 'lovable', relatedTasks: ['L-504'], completed: false },
  { id: 'PO-506', day: 5, category: 'verify', title: 'Final build on main passes', description: 'Both branches merged. npm run build on main. All routes work.', developer: 'both', relatedTasks: ['S-501'], completed: false },
];
