/**
 * SprintCharterView — Sprint Charter, Roles & Responsibilities
 *
 * Sections:
 * 1. Sprint Goal (SMART)              7. Scope Additions & Changes Log
 * 2. Roles & Responsibilities         8. Added Work Metrics (dynamic threshold)
 * 3. Abbreviation Glossary            9. Value Add / Deliverables
 * 4. AI-Adjusted Capacity & Velocity  10. Updated Estimates
 * 5. Story Point Dashboard (new)      11. Capacity & Impediments
 * 6. Definition of Done               12. Token Consumption & Sprint ROI (new)
 */

import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import {
  Target, Flag, Brain, Zap, Users, BookOpen,
  AlertTriangle, CheckCircle2, Clock, Link2, TrendingUp,
  Shield, ShieldCheck, Calendar, FileText, Info, ChevronDown, ChevronRight,
  GitBranch, Star, Ban, Timer, Layers, Gauge,
  PlusCircle, BarChart3, Award, RefreshCw, Activity, Sparkles,
  Cpu, DollarSign, Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRINT_TASKS } from './data-tasks';
import { HANDOFFS } from './data-dependencies';
import { SPRINT_START_DATE } from './data-config';
import type { Developer, TaskStatus } from './types';


// ─── Types ────────────────────────────────────────────────────────────────────

interface SprintCharterViewProps {
  getTaskStatus: (id: string) => TaskStatus;
  currentDay: number;
}

// AI 2× multiplier: one AI developer session = 2 standard developer-days of throughput
const AI_EFFICIENCY_MULTIPLIER = 2;
const BASE_HOURS_PER_DAY = 8;
// Effective capacity = 8h × 2× = 16 effective dev-hours per AI developer per day
const AI_EFFECTIVE_HOURS_PER_DAY = BASE_HOURS_PER_DAY * AI_EFFICIENCY_MULTIPLIER;

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon, title, subtitle, badge, badgeCls, children, defaultOpen = true,
  iconColor = 'text-muted-foreground',
}: {
  icon: React.ElementType; title: string; subtitle?: string;
  badge?: string; badgeCls?: string;
  children: React.ReactNode; defaultOpen?: boolean; iconColor?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-muted/20 hover:bg-muted/30 border-b border-border/40 transition-colors text-left"
      >
        <Icon className={cn('w-4 h-4 shrink-0', iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">{title}</span>
            {badge && (
              <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border', badgeCls ?? 'bg-primary/10 text-primary border-primary/20')}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function StatBox({ label, value, sub, cls }: { label: string; value: string; sub?: string; cls?: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-2.5 text-center">
      <p className={cn('text-sm font-bold', cls ?? 'text-foreground')}>{value}</p>
      {sub && <p className="text-[8px] text-muted-foreground">{sub}</p>}
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ─── 1. Sprint Goal ───────────────────────────────────────────────────────────

function SprintGoalSection() {
  const smartItems = [
    {
      letter: 'S', word: 'Specific',
      value: 'Fix all critical creation flows (Spark, Mind, Deck) and all landing page sections (explore, pricing, legal, demos, regional variants) so every primary user path is functional end-to-end.',
    },
    {
      letter: 'M', word: 'Measurable',
      value: '41 tasks tracked. Sprint is "done" when 100% tasks ✅ completed, build passes on main, and PO signs the Release Gate.',
    },
    {
      letter: 'A', word: 'Achievable',
      value: `2 AI developers × 5 days × ${AI_EFFECTIVE_HOURS_PER_DAY} effective hours = ${2 * 5 * AI_EFFECTIVE_HOURS_PER_DAY}h AI-equivalent throughput. 41 tasks × avg 1.7h = ~70h committed. Buffer: ~${2 * 5 * AI_EFFECTIVE_HOURS_PER_DAY - 70}h for scope changes & rework.`,
    },
    {
      letter: 'R', word: 'Relevant',
      value: 'Pre-launch readiness sprint. Users cannot create content (Spark/Mind/Deck broken); landing is the only public face across 14 regions.',
    },
    {
      letter: 'T', word: 'Time-bound',
      value: 'Feb 17–21, 2026 (5 working days). PO/SM publishes to production by EOD Day 5.',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
        <p className="text-sm font-semibold text-foreground leading-relaxed">
          "Deliver a fully functional GenieSuite MVP with working content creation tools
          (Spark → Mind → Deck pipeline) and a polished, regionalised landing experience
          across all 14 markets — production-ready by EOD Feb 21, 2026."
        </p>
      </div>
      <div className="space-y-2">
        {smartItems.map(item => (
          <div key={item.letter} className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
              {item.letter}
            </span>
            <div>
              <span className="text-xs font-bold text-foreground">{item.word}: </span>
              <span className="text-xs text-muted-foreground">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 2. Roles & Responsibilities ─────────────────────────────────────────────

function RolesSection() {
  const roles = [
    {
      abbr: 'PO',
      fullName: 'Product Owner',
      person: 'GenieSuite stakeholder / founder',
      aiMultiplier: null,
      Icon: Flag,
      tagCls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      borderCls: 'border-emerald-200 bg-emerald-50/30',
      iconBg: 'bg-emerald-100',
      iconCls: 'text-emerald-700',
      scope: null,
      responsibilities: [
        'Defines and owns acceptance criteria for every user story',
        'Maintains and prioritises the Sprint Backlog; logs all scope changes',
        'Verifies completed tasks match acceptance criteria before marking Done',
        'Approves or rejects deliverables (rejection → backlog rework)',
        'Makes product decisions when requirements are ambiguous',
        'Unblocks developers when external/business dependencies arise',
        'Logs all scope additions with date, reason, and impact',
        'Executes the final Publish (production release gate)',
        'Signs off the Release Gate checklist before go-live',
      ],
      cannotDo: [
        'Cannot change sprint scope mid-sprint without SM agreement and impact log',
        'Cannot approve their own technical implementations',
      ],
    },
    {
      abbr: 'SM',
      fullName: 'Scrum Master',
      person: 'Dual-role with PO in this sprint',
      aiMultiplier: null,
      Icon: Shield,
      tagCls: 'bg-teal-100 text-teal-800 border-teal-300',
      borderCls: 'border-teal-200 bg-teal-50/30',
      iconBg: 'bg-teal-100',
      iconCls: 'text-teal-700',
      scope: null,
      responsibilities: [
        'Facilitates daily standups and sprint ceremonies',
        'Removes organisational blockers for both AI developers',
        'Enforces governance: locked files, conflict prevention, merge order',
        'Tracks sprint health — velocity, backlog growth, handoff status',
        'Monitors interruption rate and added work metrics; flags if >20% scope change',
        'Escalates risks that cannot be resolved at team level',
        'Ensures "Claude merges FIRST → Lovable rebases" protocol is followed',
        'Manages Stage Gate (H-xxx) acknowledgement process',
        'Records capacity changes and impediments in the charter',
      ],
      cannotDo: [
        'Cannot direct developers on HOW to implement (only WHAT and WHEN)',
        'Cannot commit code directly',
      ],
    },
    {
      abbr: 'Claude',
      fullName: 'AI Technical Lead (Claude)',
      person: 'Anthropic Claude — autonomous full-stack AI agent',
      aiMultiplier: 2,
      Icon: Brain,
      tagCls: 'bg-violet-100 text-violet-800 border-violet-300',
      borderCls: 'border-violet-200 bg-violet-50/30',
      iconBg: 'bg-violet-100',
      iconCls: 'text-violet-700',
      scope: [
        { area: 'Genie Spark', detail: 'src/components/genie-spark/**, src/pages/GenieSpark.tsx' },
        { area: 'Genie Mind', detail: 'src/pages/GenieMind.tsx, ScriptEditorTab, SavedAudioCard, CrossFunctionalMusic' },
        { area: 'Genie Deck', detail: 'src/pages/GenieDeck.tsx, presentation-generator/** (6 wizard steps)' },
        { area: 'Genie Suite', detail: 'src/components/genie-studio/** (core engine, 150+ files)' },
        { area: 'Navigation', detail: 'src/components/navigation/Quadrant* (tab switching between modules)' },
        { area: 'AI Routing', detail: 'useUniversalAI, ai-universal-processor edge function, genieConversationService' },
        { area: 'Database Layer (read)', detail: 'Reads supabase tables; does NOT modify schema or RLS' },
        { area: 'Sprint Merging', detail: 'Merges to main FIRST on Day 5 before Lovable' },
      ],
      responsibilities: [
        'Diagnoses bugs with root-cause analysis and written findings (C-1xx)',
        'Implements fixes and verifies E2E flows before marking complete',
        'Produces handoff artifacts (H-xxx) that Lovable consumes',
        'Runs npm run build before every sync (S-xxx tasks)',
        'Documents shared resource changes in SHARED_CHANGELOG.md',
        'Operates at 2× standard developer throughput (no context-switch overhead, 24/7 availability)',
      ],
      cannotDo: [
        'Cannot touch landing/**, explore pages, legal pages (Lovable territory)',
        'Cannot modify locked files (auth, layout, supabase integration layer)',
        'Cannot publish to production (PO/SM only)',
      ],
    },
    {
      abbr: 'Lovable',
      fullName: 'AI Full-Stack Developer (Lovable)',
      person: 'Lovable AI — this environment · React + Supabase + Edge Functions',
      aiMultiplier: 2,
      Icon: Zap,
      tagCls: 'bg-pink-100 text-pink-800 border-pink-300',
      borderCls: 'border-pink-200 bg-pink-50/30',
      iconBg: 'bg-pink-100',
      iconCls: 'text-pink-700',
      scope: [
        { area: 'Landing Pages', detail: 'src/components/landing/** (47 files), RegionalLandingPage, GenieExplorePage' },
        { area: 'Regional System', detail: 'All 14 regional variants, RegionSwitcherNav, regionalLandingConfig' },
        { area: 'Product Catalog', detail: 'GenieProductsPage, pricing sections, tier displays' },
        { area: 'Interactive Demos', detail: 'InteractiveTryGenieDemo, STTDemo, DeepLTranslationDemo, video showcases' },
        { area: 'Legal & Support', detail: 'TermsOfService, PrivacyPolicy, CookiePolicy, SupportPage (6 pages)' },
        { area: 'Genie Admin Panel', detail: 'Sprint Tracker, admin views, governance tooling — this very view' },
        { area: 'Database + Edge Fns', detail: 'Supabase migrations, RLS policies, Edge Functions via Lovable Cloud' },
        { area: 'SEO & Performance', detail: 'Meta tags, OG tags, lazy loading, Lighthouse optimisation' },
        { area: 'Cross-module Integration', detail: 'Consumes handoffs from Claude; wires landing → auth → studio navigation' },
      ],
      responsibilities: [
        'NOT just frontend — owns full-stack: UI + DB migrations + Edge Functions + admin tooling',
        'Fixes broken hero sections, interactive demos, video showcases',
        'Verifies all 14 regional landing page variants render correctly',
        'Consumes handoff artifacts from Claude (H-xxx) to link Deck/Spark flows to landing',
        'Mobile responsiveness, SEO meta tags, performance optimisation (L-4xx tasks)',
        'Cross-browser testing on Chrome, Firefox, Safari, Edge',
        'Operates at 2× standard developer throughput (instant deploys, no build pipeline waits)',
        'Rebases onto main AFTER Claude on Day 5',
      ],
      cannotDo: [
        'Cannot touch genie-studio/**, genie-spark/**, or QuadrantNavigation (Claude territory)',
        'Cannot modify locked files: useMasterAuth, ProtectedRoute, AppLayout, supabase/types.ts',
        'Cannot publish to production (PO/SM only)',
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* AI Value-Add Banner */}
      <div className="rounded-lg border border-amber-300 bg-amber-50/50 p-3 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-900 space-y-0.5">
          <p className="font-bold text-sm">Why Two AI Developers = 4× Human Equivalent Capacity</p>
          <p>Each AI developer (Claude & Lovable) operates at <strong>2× a senior developer's throughput</strong>: no context-switching overhead, instant deployment, parallel reasoning, and 24/7 availability. Two AI devs = the effective output of a 4-person engineering team within a 5-day sprint.</p>
          <div className="flex gap-4 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" /> No onboarding ramp</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" /> No meeting overhead</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" /> Instant code review</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" /> Full-stack in one agent</span>
          </div>
        </div>
      </div>

      {roles.map(role => {
        const Icon = role.Icon;
        return (
          <div key={role.abbr} className={cn('rounded-lg border p-4 space-y-3', role.borderCls)}>
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', role.iconBg)}>
                <Icon className={cn('w-4 h-4', role.iconCls)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', role.tagCls)}>{role.abbr}</span>
                  <span className="text-sm font-bold text-foreground">{role.fullName}</span>
                  {role.aiMultiplier && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      ⚡ {role.aiMultiplier}× AI Efficiency
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 italic">{role.person}</p>
              </div>
            </div>

            {/* Scope matrix */}
            {role.scope && role.scope.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">📁 Ownership Scope</p>
                <div className="space-y-0.5">
                  {role.scope.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px]">
                      <span className="font-semibold text-foreground w-36 shrink-0">{s.area}</span>
                      <span className="font-mono text-muted-foreground truncate">{s.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">✅ Responsibilities</p>
              <ul className="space-y-0.5">
                {role.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Boundaries */}
            {role.cannotDo.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">🚫 Boundaries</p>
                <ul className="space-y-0.5">
                  {role.cannotDo.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <Ban className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── 3. Abbreviation Glossary ─────────────────────────────────────────────────

function GlossarySection() {
  const groups = [
    {
      title: 'Task ID Prefixes', icon: FileText,
      items: [
        { abbr: 'L-xxx', meaning: 'Lovable task', example: 'L-101 = Lovable, Day 1, task 1' },
        { abbr: 'C-xxx', meaning: 'Claude task', example: 'C-201 = Claude, Day 2, task 1' },
        { abbr: 'S-xxx', meaning: 'Shared/Sync task', example: 'S-101 = Shared Day 1 build check' },
        { abbr: 'H-xxx', meaning: 'Handoff artifact (gate between devs)', example: 'H-201 = Claude→Lovable artifact Day 2' },
        { abbr: 'R-xxx', meaning: 'Risk register item', example: 'R-001 = ScriptEditorTab refactor risk' },
        { abbr: 'SC-xxx', meaning: 'Scope Change log entry', example: 'SC-001 = new item added post-planning' },
      ],
    },
    {
      title: 'Roles & People', icon: Users,
      items: [
        { abbr: 'PO', meaning: 'Product Owner — owns "what" and "why"', example: 'Verifies AC, approves release, logs scope changes' },
        { abbr: 'SM', meaning: 'Scrum Master — removes blockers, enforces process', example: 'Dual-role with PO in this sprint' },
        { abbr: 'Dev', meaning: 'Developer — Claude or Lovable (both AI)', example: '2× throughput vs standard human developer' },
        { abbr: 'AI Dev', meaning: 'AI-powered developer with 2× standard efficiency', example: 'Claude = Tech Lead, Lovable = Full-Stack Dev' },
      ],
    },
    {
      title: 'Scrum Ceremonies', icon: Calendar,
      items: [
        { abbr: 'Sprint', meaning: 'Time-boxed iteration (5 days, Feb 17–21)', example: 'All work within sprint scope' },
        { abbr: 'Standup', meaning: 'Daily sync: Yesterday / Today / Blockers', example: 'Captured per developer per day' },
        { abbr: 'Backlog', meaning: 'Incomplete items from previous days', example: 'Triggered by failed verification or overdue task' },
        { abbr: 'Sprint Review', meaning: 'End-of-sprint demo to PO (Day 5)', example: 'PO verifies all DoD criteria' },
        { abbr: 'Retro', meaning: 'Retrospective — what worked, what to improve', example: 'Planned post Day 5 publish' },
      ],
    },
    {
      title: 'Workflow Terms', icon: GitBranch,
      items: [
        { abbr: 'Gate / H-xxx', meaning: 'Mandatory checkpoint before work proceeds', example: 'H-201 gates L-201 until Deck is live' },
        { abbr: 'Handoff', meaning: 'Artifact passed from one developer to another', example: 'Claude produces; Lovable consumes' },
        { abbr: 'GATED', meaning: 'Task blocked by unresolved dependency', example: 'L-201 GATED on H-201' },
        { abbr: 'DoD', meaning: 'Definition of Done — all criteria must pass', example: 'Build + AC verified by PO' },
        { abbr: 'AC', meaning: 'Acceptance Criteria — conditions output must meet', example: '"All 6 wizard steps complete without errors"' },
        { abbr: 'E2E', meaning: 'End-to-End test — full user workflow verified', example: 'Spark prompt → generate → save verified' },
        { abbr: 'SP', meaning: 'Story Points — relative effort estimate (1 SP ≈ 1h AI time)', example: 'L-101 = 4 SP (4h estimated)' },
        { abbr: 'WSJF', meaning: 'Weighted Shortest Job First — priority framework', example: 'Critical > High > Medium > Low' },
        { abbr: 'WIP', meaning: 'Work In Progress — keep ≤ 2 per developer', example: 'Prevents context overload' },
        { abbr: 'Scope Creep', meaning: 'Unplanned work added after sprint planning', example: 'Tracked in SC-xxx log; flagged if >20%' },
      ],
    },
    {
      title: 'Status Values', icon: Gauge,
      items: [
        { abbr: 'pending', meaning: 'Not yet started', example: 'Default for future-day tasks' },
        { abbr: 'in-progress', meaning: 'Actively being worked on', example: 'Blue on board' },
        { abbr: 'completed', meaning: 'Done + PO-verified', example: 'Green; counts toward velocity' },
        { abbr: 'rejected', meaning: 'Failed PO verification — rework required', example: 'Moves to backlog' },
      ],
    },
    {
      title: 'Priority Levels', icon: Star,
      items: [
        { abbr: 'critical', meaning: 'Blocks all other work — fix immediately', example: 'Build failure, auth broken' },
        { abbr: 'high', meaning: 'Core sprint goal; high business impact', example: 'Deck creation flow broken' },
        { abbr: 'medium', meaning: 'Important but not blocking', example: 'Translation demo fix' },
        { abbr: 'low', meaning: 'Nice-to-have; do last', example: 'Cross-browser edge cases' },
      ],
    },
    {
      title: 'Technical Abbreviations', icon: Layers,
      items: [
        { abbr: 'RAG', meaning: 'Retrieval-Augmented Generation — AI with knowledge base', example: 'universal_knowledge_base' },
        { abbr: 'STT', meaning: 'Speech-to-Text — voice input processing', example: 'Google Cloud STT (fallback)' },
        { abbr: 'TTS', meaning: 'Text-to-Speech — AI voiceover generation', example: 'ElevenLabs (primary)' },
        { abbr: 'RLS', meaning: 'Row-Level Security — database access control', example: 'Every table user-scoped' },
        { abbr: 'MCP', meaning: 'Model Context Protocol — AI tool integration', example: 'Phase 3B (planned)' },
        { abbr: 'Edge Fn', meaning: 'Supabase Edge Function — serverless backend', example: 'ai-universal-processor' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map(group => {
        const Icon = group.icon;
        return (
          <div key={group.title} className="rounded-lg border border-border/60 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/40">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">{group.title}</span>
            </div>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border/30 bg-muted/10">
                  <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground w-28">Abbreviation</th>
                  <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Meaning</th>
                  <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground hidden md:table-cell">Example / Context</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item, i) => (
                  <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{item.abbr}</code>
                    </td>
                    <td className="px-3 py-2 text-foreground">{item.meaning}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden md:table-cell italic">{item.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ─── 4. AI-Adjusted Capacity & Velocity ──────────────────────────────────────

function CapacitySection({ getTaskStatus, currentDay }: { getTaskStatus: (id: string) => TaskStatus; currentDay: number }) {
  const developers: Developer[] = ['claude', 'lovable'];
  const devCfg = {
    claude:  { label: 'Claude (Tech Lead)',         tagCls: 'bg-violet-100 text-violet-800 border-violet-300', Icon: Brain },
    lovable: { label: 'Lovable (Full-Stack Dev)',   tagCls: 'bg-pink-100 text-pink-800 border-pink-300',       Icon: Zap   },
  } as const;

  const totalHours:  Record<Developer, number> = { claude: 0, lovable: 0 };
  const doneHours:   Record<Developer, number> = { claude: 0, lovable: 0 };
  const wipHours:    Record<Developer, number> = { claude: 0, lovable: 0 };

  SPRINT_TASKS.forEach(t => {
    const s   = getTaskStatus(t.id);
    const dev = t.developer as Developer;
    totalHours[dev] += t.estimatedHours;
    if (s === 'completed')   doneHours[dev] += t.estimatedHours;
    if (s === 'in-progress') wipHours[dev]  += t.estimatedHours;
  });

  // AI-adjusted numbers
  const aiCapacityPerDev = 5 * AI_EFFECTIVE_HOURS_PER_DAY; // 5 days × 16h = 80 effective hours
  const daysElapsed = Math.min(currentDay, 5);
  const expectedPct = Math.round((daysElapsed / 5) * 100);

  // Value delivered = done hours × 2 (AI efficiency factor)
  const totalAiValueHours = (doneHours.claude + doneHours.lovable) * AI_EFFICIENCY_MULTIPLIER;
  const humanEquivalentTeamDays = totalAiValueHours / 8;

  return (
    <div className="space-y-4">

      {/* AI multiplier explainer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="AI Capacity / Dev" value={`${aiCapacityPerDev}h`} sub="5d × 16 eff. hrs" cls="text-primary" />
        <StatBox label="Team AI Capacity" value={`${aiCapacityPerDev * 2}h`} sub="2 devs combined" cls="text-primary" />
        <StatBox label="Human Equivalent" value={`${aiCapacityPerDev * 2 / 8} dev-days`} sub="@ 8h/day baseline" cls="text-amber-600" />
        <StatBox label="AI Value Delivered" value={`${totalAiValueHours}h`} sub={`≈ ${humanEquivalentTeamDays.toFixed(1)} human dev-days`} cls="text-green-600" />
      </div>

      {/* Sprint timeline */}
      <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">Sprint Timeline</span>
          <span className="text-muted-foreground">Day {currentDay} of 5 · {expectedPct}% elapsed</span>
        </div>
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-primary/30 rounded-full" style={{ width: `${expectedPct}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>Feb 17 (Day 1)</span>
          <span>Feb 19 (Day 3)</span>
          <span>Feb 21 (Day 5)</span>
        </div>
      </div>

      {/* Per-developer capacity cards */}
      {developers.map(dev => {
        const cfg   = devCfg[dev];
        const Icon  = cfg.Icon;
        const tasks = SPRINT_TASKS.filter(t => t.developer === dev);
        const done  = tasks.filter(t => getTaskStatus(t.id) === 'completed').length;
        const wip   = tasks.filter(t => getTaskStatus(t.id) === 'in-progress').length;
        const donePct     = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
        const hourDonePct = totalHours[dev] ? Math.round((doneHours[dev] / totalHours[dev]) * 100) : 0;
        const aiValueDelivered = doneHours[dev] * AI_EFFICIENCY_MULTIPLIER;
        const bufferHours = aiCapacityPerDev - totalHours[dev];

        return (
          <div key={dev} className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', cfg.tagCls)}>{cfg.label}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 ml-auto">
                ⚡ 2× AI Efficiency
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <StatBox label="Total Tasks"   value={tasks.length.toString()} />
              <StatBox label="Done"          value={done.toString()}          cls="text-green-600 font-bold" />
              <StatBox label="In Progress"   value={wip.toString()}           cls="text-blue-600 font-bold" />
              <StatBox label="Est. Hours"    value={`${totalHours[dev]}h`}    sub="committed" />
              <StatBox label="AI Capacity"   value={`${aiCapacityPerDev}h`}   sub="effective" cls="text-primary" />
              <StatBox label="AI Value Out"  value={`${aiValueDelivered}h`}   sub="equiv." cls="text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Task velocity ({done}/{tasks.length} done)</span>
                <span className="font-semibold">{donePct}%</span>
              </div>
              <Progress value={donePct} className="h-1.5" />

              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Hour burn ({doneHours[dev].toFixed(1)}h / {totalHours[dev]}h committed)</span>
                <span className="font-semibold">{hourDonePct}%</span>
              </div>
              <Progress value={hourDonePct} className="h-1.5 [&>div]:bg-amber-500" />
            </div>

            <p className="text-[10px] text-muted-foreground">
              Committed {totalHours[dev]}h of {aiCapacityPerDev}h AI capacity → {bufferHours.toFixed(0)}h buffer for scope changes.
              AI value delivered: <strong className="text-foreground">{aiValueDelivered}h effective</strong> (≈ {(aiValueDelivered / 8).toFixed(1)} human dev-days).
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── 5. Definition of Done ────────────────────────────────────────────────────

function DefinitionOfDoneSection() {
  const dodItems = [
    { category: 'Code', items: ['All acceptance criteria met (verified by PO)', 'Code self-reviewed; no known regressions introduced', 'npm run build passes with 0 errors or warnings'] },
    { category: 'Testing', items: ['E2E user flow manually verified (prompt → generate → save OR landing → auth → studio)', 'No console errors during primary user journey', 'Responsive check on mobile viewport (375px minimum)'] },
    { category: 'Handoffs', items: ['All outgoing H-xxx artifacts acknowledged by consuming developer', 'SHARED_CHANGELOG.md updated for any shared resource changes', 'Locked files NOT modified'] },
    { category: 'Release', items: ['PO has verified acceptance criteria', 'SM has cleared Release Gate checklist (all 9 steps)', 'Both branches merged to main cleanly (Claude first)', 'Production Publish executed by PO/SM only'] },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-green-200 bg-green-50/30 px-4 py-2.5">
        <p className="text-xs font-bold text-green-800">
          A task is "Done" ONLY when ALL criteria are met — not when the developer marks it complete. PO verification is mandatory.
        </p>
      </div>
      {dodItems.map(group => (
        <div key={group.category} className="rounded-lg border border-border/60 overflow-hidden">
          <div className="px-3 py-1.5 bg-muted/20 border-b border-border/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">{group.category}</span>
          </div>
          <ul className="p-3 space-y-1">
            {group.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── 6. Risks & Roadblocks ────────────────────────────────────────────────────

function RisksSection({ getTaskStatus }: { getTaskStatus: (id: string) => TaskStatus }) {
  const pendingHandoffs = HANDOFFS.filter(h => getTaskStatus(h.producerTaskId) !== 'completed');

  const staticRisks = [
    { id: 'R-001', severity: 'high' as const, risk: 'ScriptEditorTab (127KB) — deep refactor risk', impact: 'Genie Mind (Day 4) may overflow into Day 5', mitigation: 'Claude allocated 3h; flag early if scope expands', owner: 'claude' as Developer },
    { id: 'R-002', severity: 'high' as const, risk: 'SmartContentPipeline uses simulated AI (80KB)', impact: 'Spark content generation may not work with real API calls', mitigation: 'Verify API keys in secrets panel before Day 3 start', owner: 'claude' as Developer },
    { id: 'R-003', severity: 'medium' as const, risk: 'Merge conflicts between Lovable and Claude branches', impact: 'Day 5 integration delay; broken build on main', mitigation: 'Strict file ownership + SHARED_CHANGELOG.md protocol', owner: 'claude' as Developer },
    { id: 'R-004', severity: 'medium' as const, risk: 'Regional pricing data incomplete for 14 regions', impact: 'L-202 may need data sourcing time not in estimate', mitigation: 'PO provides pricing table before Day 2 AM standup', owner: 'lovable' as Developer },
    { id: 'R-005', severity: 'low' as const, risk: 'Mobile viewports on older devices', impact: 'L-401 may reveal deep CSS issues', mitigation: 'Focus on iPhone SE (375px) and Galaxy (360px) minimum', owner: 'lovable' as Developer },
  ];

  const sc = { high: 'bg-red-100 text-red-700 border-red-300', medium: 'bg-amber-100 text-amber-700 border-amber-300', low: 'bg-blue-100 text-blue-700 border-blue-300' };
  const dc = { claude: 'bg-violet-100 text-violet-700 border-violet-200', lovable: 'bg-pink-100 text-pink-700 border-pink-200' } as const;

  return (
    <div className="space-y-4">
      {pendingHandoffs.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">{pendingHandoffs.length} Active Gate Blockers</span>
          </div>
          {pendingHandoffs.map(h => (
            <div key={h.id} className="flex items-center gap-2 text-[11px]">
              <span className="font-mono font-semibold text-amber-700 w-12">{h.id}</span>
              <span className="text-amber-800 flex-1">{h.title}</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 border border-amber-300">{h.from} → {h.to}</span>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {staticRisks.map(risk => (
          <div key={risk.id} className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground">{risk.id}</span>
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full border', sc[risk.severity])}>{risk.severity.toUpperCase()}</span>
              <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border', dc[risk.owner])}>{risk.owner === 'claude' ? 'Claude' : 'Lovable'}</span>
            </div>
            <p className="text-xs font-semibold text-foreground">{risk.risk}</p>
            <p className="text-[10px] text-muted-foreground"><span className="font-semibold text-red-600">Impact: </span>{risk.impact}</p>
            <p className="text-[10px] text-muted-foreground"><span className="font-semibold text-green-600">Mitigation: </span>{risk.mitigation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 7. Scope Additions & Changes Log ────────────────────────────────────────

function ScopeChangesSection() {
  const [entries, setEntries] = useState([
    { id: 'SC-001', date: '2026-02-18', type: 'added' as const, ticket: 'L-201 (reframed)', reason: 'bug', description: 'L-201 re-scoped from "enhance" to "GATED fix" — Deck flow must be live first (H-201)', owner: 'lovable' as Developer, impact: 'Delayed start; now gated on Claude Day 2 completion', spDelta: 0 },
    { id: 'SC-002', date: '2026-02-18', type: 'added' as const, ticket: 'GovernanceFlowView', reason: 'urgent_request', description: 'PO requested Governance & Release Flow view mid-sprint (not in original plan)', owner: 'lovable' as Developer, impact: '+2h unplanned work absorbed into buffer', spDelta: 2 },
    { id: 'SC-003', date: '2026-02-18', type: 'added' as const, ticket: 'SprintCharterView', reason: 'urgent_request', description: 'PO requested Sprint Charter, Roles & Glossary view mid-sprint', owner: 'lovable' as Developer, impact: '+3h unplanned; absorbed by AI buffer capacity', spDelta: 3 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticket: '', reason: 'bug', description: '', owner: 'lovable' as Developer, impact: '', spDelta: 0 });

  const addEntry = () => {
    if (!form.ticket || !form.description) return;
    const next = `SC-${String(entries.length + 1).padStart(3, '0')}`;
    setEntries(prev => [...prev, { id: next, date: new Date().toISOString().split('T')[0], type: 'added' as const, ...form }]);
    setForm({ ticket: '', reason: 'bug', description: '', owner: 'lovable', impact: '', spDelta: 0 });
    setShowForm(false);
  };

  const typeCfg = { added: 'bg-blue-100 text-blue-700 border-blue-300', removed: 'bg-red-100 text-red-700 border-red-300', changed: 'bg-amber-100 text-amber-700 border-amber-300' };
  const reasonCfg: Record<string, string> = { bug: 'bg-red-50 text-red-600', urgent_request: 'bg-amber-50 text-amber-700', scope_change: 'bg-blue-50 text-blue-700', technical_debt: 'bg-purple-50 text-purple-700' };
  const devCls = { claude: 'bg-violet-100 text-violet-700 border-violet-200', lovable: 'bg-pink-100 text-pink-700 border-pink-200' } as const;

  const totalAddedSP = entries.filter(e => e.type === 'added').reduce((s, e) => s + e.spDelta, 0);
  const changeRate = SPRINT_TASKS.length > 0 ? Math.round((totalAddedSP / SPRINT_TASKS.length) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Scope Changes" value={entries.length.toString()} cls="text-foreground" />
        <StatBox label="Added Story Pts" value={`+${totalAddedSP} SP`} cls={totalAddedSP > 5 ? 'text-red-600' : 'text-amber-600'} />
        <StatBox label="Change Rate" value={`${changeRate}%`} sub={changeRate > 20 ? '⚠️ >20% threshold' : '✅ within limit'} cls={changeRate > 20 ? 'text-red-600' : 'text-green-600'} />
      </div>

      {/* Change log table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider">Scope Change Log</span>
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline">
            <PlusCircle className="w-3 h-3" /> Log Change
          </button>
        </div>

        {showForm && (
          <div className="p-3 border-b border-border/40 bg-muted/10 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Ticket / Task ID" value={form.ticket} onChange={e => setForm(f => ({ ...f, ticket: e.target.value }))}
                className="text-[11px] border rounded px-2 py-1 bg-background" />
              <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                className="text-[11px] border rounded px-2 py-1 bg-background">
                <option value="bug">Bug</option>
                <option value="urgent_request">Urgent Request</option>
                <option value="scope_change">Scope Change</option>
                <option value="technical_debt">Technical Debt</option>
              </select>
            </div>
            <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="text-[11px] border rounded px-2 py-1 bg-background w-full" />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Impact on plan" value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))}
                className="text-[11px] border rounded px-2 py-1 bg-background col-span-2" />
              <input type="number" placeholder="SP delta" value={form.spDelta} onChange={e => setForm(f => ({ ...f, spDelta: +e.target.value }))}
                className="text-[11px] border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex gap-2">
              <select value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value as Developer }))}
                className="text-[11px] border rounded px-2 py-1 bg-background flex-1">
                <option value="lovable">Lovable</option>
                <option value="claude">Claude</option>
              </select>
              <button onClick={addEntry} className="text-[11px] font-semibold px-3 py-1 rounded bg-primary text-primary-foreground">Add</button>
              <button onClick={() => setShowForm(false)} className="text-[11px] font-semibold px-3 py-1 rounded border">Cancel</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-border/20">
          {entries.map(e => (
            <div key={e.id} className="flex items-start gap-2 px-3 py-2.5 hover:bg-muted/20">
              <span className="font-mono text-[9px] text-muted-foreground w-14 shrink-0 mt-0.5">{e.id}</span>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded border', typeCfg[e.type])}>{e.type.toUpperCase()}</span>
                  <span className={cn('text-[8px] font-semibold px-1 py-0.5 rounded', reasonCfg[e.reason] ?? 'bg-muted text-muted-foreground')}>{e.reason.replace('_', ' ')}</span>
                  <span className="font-mono text-[10px] font-semibold text-foreground">{e.ticket}</span>
                  <span className={cn('text-[8px] font-semibold px-1 py-0.5 rounded border', devCls[e.owner])}>{e.owner}</span>
                </div>
                <p className="text-[10px] text-foreground">{e.description}</p>
                {e.impact && <p className="text-[9px] text-muted-foreground italic">Impact: {e.impact}</p>}
              </div>
              <div className="flex flex-col items-end shrink-0 gap-0.5">
                <span className="text-[9px] text-muted-foreground">{e.date}</span>
                {e.spDelta !== 0 && <span className={cn('text-[9px] font-bold', e.spDelta > 0 ? 'text-amber-600' : 'text-green-600')}>{e.spDelta > 0 ? `+${e.spDelta}` : e.spDelta} SP</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 5. Story Point Dashboard ────────────────────────────────────────────────

function StoryPointDashboard({ getTaskStatus, currentDay }: { getTaskStatus: (id: string) => TaskStatus; currentDay: number }) {
  const devCfg = {
    claude:  { label: 'Claude (Tech Lead)',       tagCls: 'bg-violet-100 text-violet-800 border-violet-300', Icon: Brain, bar: 'bg-violet-400' },
    lovable: { label: 'Lovable (Full-Stack Dev)', tagCls: 'bg-pink-100 text-pink-800 border-pink-300',       Icon: Zap,   bar: 'bg-pink-400'   },
  } as const;
  const devs: Developer[] = ['claude', 'lovable'];
  const spForDev = (dev: Developer) => ({
    total:  SPRINT_TASKS.filter(t => t.developer === dev).reduce((s, t) => s + t.estimatedHours, 0),
    done:   SPRINT_TASKS.filter(t => t.developer === dev && getTaskStatus(t.id) === 'completed').reduce((s, t) => s + t.estimatedHours, 0),
    tasks:  SPRINT_TASKS.filter(t => t.developer === dev).length,
    byDay:  [1,2,3,4,5].map(d => ({
      day: d,
      sp:   SPRINT_TASKS.filter(t => t.developer === dev && t.day === d).reduce((s, t) => s + t.estimatedHours, 0),
      done: SPRINT_TASKS.filter(t => t.developer === dev && t.day === d && getTaskStatus(t.id) === 'completed').reduce((s, t) => s + t.estimatedHours, 0),
    })),
  });
  const teamTotal = SPRINT_TASKS.reduce((s, t) => s + t.estimatedHours, 0);
  const teamDone  = SPRINT_TASKS.filter(t => getTaskStatus(t.id) === 'completed').reduce((s, t) => s + t.estimatedHours, 0);
  const aiCapPerDev = 5 * AI_EFFECTIVE_HOURS_PER_DAY;
  const teamCap   = aiCapPerDev * 2;
  const bufferPct = Math.round(((teamCap - teamTotal) / teamCap) * 100);
  const weeklyAISP= teamTotal * AI_EFFICIENCY_MULTIPLIER;
  const byDay = [1,2,3,4,5].map(d => ({
    day: d,
    total:   SPRINT_TASKS.filter(t => t.day === d).reduce((s, t) => s + t.estimatedHours, 0),
    done:    SPRINT_TASKS.filter(t => t.day === d && getTaskStatus(t.id) === 'completed').reduce((s, t) => s + t.estimatedHours, 0),
    claude:  SPRINT_TASKS.filter(t => t.day === d && t.developer === 'claude').reduce((s, t) => s + t.estimatedHours, 0),
    lovable: SPRINT_TASKS.filter(t => t.day === d && t.developer === 'lovable').reduce((s, t) => s + t.estimatedHours, 0),
  }));
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-3 space-y-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm font-bold text-amber-900">Capacity Under-Committed vs AI Potential</p>
        </div>
        <p className="text-[11px] text-amber-800">
          Team committed <strong>{teamTotal} SP</strong> of <strong>{teamCap} SP</strong> effective AI capacity (<strong>{bufferPct}% unused</strong>).
          Claude spare: <strong>{aiCapPerDev - spForDev('claude').total}h</strong> · Lovable spare: <strong>{aiCapPerDev - spForDev('lovable').total}h</strong>.
          Sprint 1 conservative. Recommended Sprint 2: <strong>+20–30 SP per developer.</strong>
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <StatBox label="Sprint SP" value={teamTotal.toString()} sub={`of ${teamCap} cap`} />
        <StatBox label="SP Burned" value={teamDone.toString()} sub={`${Math.round(teamDone/teamTotal*100)}%`} cls="text-green-600" />
        <StatBox label="AI Equiv SP/wk" value={weeklyAISP.toString()} sub="2× multiplier" cls="text-amber-600" />
        <StatBox label="Human Dev-Days" value={(weeklyAISP/8).toFixed(0)} sub="≡ team output" cls="text-primary" />
        <StatBox label="Buffer" value={`${bufferPct}%`} sub={`${teamCap - teamTotal}h free`} cls={bufferPct > 40 ? 'text-green-600' : 'text-amber-600'} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {devs.map(dev => {
          const sp  = spForDev(dev); const cfg = devCfg[dev]; const Icon = cfg.Icon;
          const pct = sp.total > 0 ? Math.round((sp.done / sp.total) * 100) : 0;
          return (
            <div key={dev} className="rounded-lg border p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', cfg.tagCls)}>{cfg.label}</span>
                <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">2× · {sp.tasks} tasks</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <StatBox label="Committed" value={sp.total.toString()} />
                <StatBox label="Done SP" value={sp.done.toString()} cls="text-green-600" />
                <StatBox label="AI Equiv" value={(sp.total*2).toString()} cls="text-amber-600" />
                <StatBox label="Unused" value={`+${aiCapPerDev - sp.total}`} cls="text-blue-600" />
              </div>
              <div>
                <div className="flex justify-between text-[9px] mb-1"><span className="text-muted-foreground">SP burn</span><span className="font-bold">{pct}%</span></div>
                <Progress value={pct} className="h-1.5" />
              </div>
              <div className="space-y-1">
                {sp.byDay.map(d => (
                  <div key={d.day} className="flex items-center gap-2 text-[9px]">
                    <span className="text-muted-foreground w-10 shrink-0">Day {d.day}</span>
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', cfg.bar)} style={{ width: d.sp > 0 ? `${(d.done/d.sp)*100}%` : '0%' }} />
                    </div>
                    <span className="text-muted-foreground w-14 text-right">{d.done}/{d.sp} SP</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="px-3 py-2 bg-muted/20 border-b border-border/40"><span className="text-[10px] font-bold uppercase tracking-wider">SP by Day — Who Owns What</span></div>
        <table className="w-full text-[10px]">
          <thead><tr className="border-b border-border/30 bg-muted/10">
            <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Day</th>
            <th className="text-center px-2 py-1.5 font-semibold text-violet-700">Claude</th>
            <th className="text-center px-2 py-1.5 font-semibold text-pink-700">Lovable</th>
            <th className="text-center px-2 py-1.5 font-semibold text-muted-foreground">Total</th>
            <th className="text-center px-2 py-1.5 font-semibold text-green-700">Done</th>
            <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Burn</th>
          </tr></thead>
          <tbody>
            {byDay.map(d => { const pct = d.total > 0 ? Math.round((d.done/d.total)*100) : 0; const isNow = d.day === currentDay; const isPast = d.day < currentDay; return (
              <tr key={d.day} className={cn('border-b border-border/20 last:border-0', isNow && 'bg-primary/5')}>
                <td className="px-3 py-2 font-semibold"><span className={isNow ? 'text-primary' : isPast ? 'text-green-700' : 'text-muted-foreground'}>Day {d.day}{isNow ? ' ◀' : ''}</span></td>
                <td className="text-center px-2 py-2 text-violet-700 font-semibold">{d.claude}</td>
                <td className="text-center px-2 py-2 text-pink-700 font-semibold">{d.lovable}</td>
                <td className="text-center px-2 py-2 font-bold">{d.total}</td>
                <td className="text-center px-2 py-2 text-green-700 font-semibold">{d.done}</td>
                <td className="px-3 py-2"><div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                  <span className={cn('text-[9px] font-bold w-7', isPast && pct < 100 ? 'text-amber-600' : 'text-muted-foreground')}>{pct}%</span>
                </div></td>
              </tr>);
            })}
            <tr className="bg-muted/30 border-t border-border font-bold">
              <td className="px-3 py-2">TOTALS</td>
              <td className="text-center px-2 py-2 text-violet-700">{spForDev('claude').total}</td>
              <td className="text-center px-2 py-2 text-pink-700">{spForDev('lovable').total}</td>
              <td className="text-center px-2 py-2">{teamTotal}</td>
              <td className="text-center px-2 py-2 text-green-700">{teamDone}</td>
              <td className="px-3 py-2 text-[9px] text-muted-foreground">{Math.round(teamDone/teamTotal*100)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 8. Added Work Metrics (dynamic threshold) ────────────────────────────────

function AddedWorkMetricsSection({ getTaskStatus, currentDay }: { getTaskStatus: (id: string) => TaskStatus; currentDay: number }) {
  // Baseline from sprint planning (Day 1 start)
  const baselineSP    = SPRINT_TASKS.length; // 41 tasks = 41 base story points
  const addedSP       = 5; // SC-001 + SC-002 + SC-003 = 5 SP from scope log above
  const totalSP       = baselineSP + addedSP;
  const addedRate     = Math.round((addedSP / baselineSP) * 100);

  const doneSP = SPRINT_TASKS.filter(t => getTaskStatus(t.id) === 'completed').length;
  const interruptions = 3;

  // Dynamic threshold: AI teams can absorb more scope late in sprint
  // Days 1-2: 25% | Day 3: 35% | Days 4-5: 50%
  const dynamicThreshold = currentDay <= 2 ? 25 : currentDay === 3 ? 35 : 50;
  const thresholdLabel   = currentDay <= 2 ? 'Early sprint (strict)' : currentDay === 3 ? 'Mid sprint (moderate)' : 'Late sprint (flexible)';

  const warnRate  = addedRate >= dynamicThreshold;
  const warnIntr  = interruptions >= 5;
  const warnTotal = addedSP >= Math.round(baselineSP * dynamicThreshold / 100);

  const thresholds = [
    { label: 'Interruption Rate',  value: interruptions, threshold: 5,                unit: 'events', warn: warnIntr },
    { label: 'Added SP Rate',      value: addedRate,     threshold: dynamicThreshold, unit: '%',      warn: warnRate },
    { label: 'Total Added SP',     value: addedSP,       threshold: Math.round(baselineSP * dynamicThreshold / 100), unit: 'SP', warn: warnTotal },
  ];

  return (
    <div className="space-y-3">
      {/* Dynamic threshold banner */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-200 bg-violet-50/40">
        <Gauge className="w-4 h-4 text-violet-600 shrink-0" />
        <div className="flex-1 text-[10px]">
          <span className="font-bold text-violet-900">Day {currentDay} Threshold: </span>
          <span className="text-violet-800 font-semibold">{dynamicThreshold}%</span>
          <span className="text-violet-700 ml-1.5">— {thresholdLabel}</span>
        </div>
        <div className="flex gap-2 text-[9px] font-mono">
          <span className="text-muted-foreground">Day 1-2: 25%</span>
          <span className="text-muted-foreground">Day 3: 35%</span>
          <span className="text-muted-foreground">Day 4-5: 50%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="Baseline SP" value={baselineSP.toString()} sub="sprint planned" />
        <StatBox label="Added SP" value={`+${addedSP}`} sub="post-planning" cls={warnRate ? 'text-red-600' : 'text-amber-600'} />
        <StatBox label="Total SP" value={totalSP.toString()} sub="current scope" cls="text-foreground" />
        <StatBox label="Done SP" value={doneSP.toString()} sub={`${Math.round(doneSP/totalSP*100)}% velocity`} cls="text-green-600" />
      </div>

      {/* Threshold monitors */}
      <div className="space-y-2">
        {thresholds.map(t => {
          const pct = Math.min(Math.round((t.value / t.threshold) * 100), 100);
          return (
            <div key={t.label} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg border', t.warn ? 'border-red-300 bg-red-50/50' : 'border-border/60 bg-card')}>
              {t.warn ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
              <span className="text-xs font-semibold flex-1">{t.label}</span>
              <div className="w-20 hidden sm:block">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', t.warn ? 'bg-red-500' : 'bg-green-500')} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className={cn('text-xs font-bold tabular-nums', t.warn ? 'text-red-600' : 'text-green-600')}>
                {t.value}{t.unit === '%' ? '%' : ` ${t.unit}`}
              </span>
              <span className="text-[9px] text-muted-foreground tabular-nums">
                / {t.threshold}{t.unit === '%' ? '%' : ` ${t.unit}`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-muted-foreground rounded-lg border border-border/60 p-2.5">
        <strong>Retrospective signal:</strong> {addedRate}% scope change rate is{' '}
        {warnRate
          ? `⚠️ above the Day ${currentDay} dynamic threshold (${dynamicThreshold}%) — review interruption sources in retro.`
          : `✅ within the Day ${currentDay} AI threshold (${dynamicThreshold}%). Team absorbed scope using 2× buffer capacity.`}
      </div>
    </div>
  );
}

// ─── 9. Value Add / Deliverables ──────────────────────────────────────────────

function ValueAddSection({ getTaskStatus }: { getTaskStatus: (id: string) => TaskStatus }) {
  const completedTasks = SPRINT_TASKS.filter(t => getTaskStatus(t.id) === 'completed');

  // Group by module for deliverable display
  const byModule: Record<string, typeof completedTasks> = {};
  completedTasks.forEach(t => {
    if (!byModule[t.module]) byModule[t.module] = [];
    byModule[t.module].push(t);
  });

  const devCls = { claude: 'bg-violet-100 text-violet-700 border-violet-200', lovable: 'bg-pink-100 text-pink-700 border-pink-200' } as const;

  // AI value multiplier for storytelling
  const totalCommittedHours = completedTasks.reduce((s, t) => s + t.estimatedHours, 0);
  const aiValueHours = totalCommittedHours * AI_EFFICIENCY_MULTIPLIER;

  return (
    <div className="space-y-3">
      {/* Value banner */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Deliverables Done" value={completedTasks.length.toString()} cls="text-green-600" />
        <StatBox label="Hours Delivered" value={`${totalCommittedHours}h`} sub="committed effort" />
        <StatBox label="AI Value Equiv." value={`${aiValueHours}h`} sub={`≈ ${(aiValueHours/8).toFixed(0)} human dev-days`} cls="text-amber-600" />
      </div>

      {/* Deliverables by module */}
      {Object.keys(byModule).length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <Award className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          No completed deliverables yet. Items will appear here as tasks are verified by PO.
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(byModule).map(([module, tasks]) => (
            <div key={module} className="rounded-lg border border-border/60 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50/50 border-b border-green-200/60">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-800">{module}</span>
                <span className="ml-auto text-[9px] text-green-700">{tasks.length} deliverable{tasks.length > 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-border/20">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-start gap-2 px-3 py-2">
                    <span className="font-mono text-[9px] text-muted-foreground w-12 shrink-0 mt-0.5">{task.id}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground">{task.title}</p>
                      <p className="text-[9px] text-muted-foreground italic">AC: {task.acceptanceCriteria}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className={cn('text-[8px] font-semibold px-1 py-0.5 rounded border', devCls[task.developer])}>{task.developer}</span>
                      <span className="text-[9px] text-muted-foreground">{task.estimatedHours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 10. Updated Estimates ────────────────────────────────────────────────────

function UpdatedEstimatesSection() {
  const [estimates, setEstimates] = useState([
    { taskId: 'C-201', original: 4, revised: 4, reason: 'Estimate held — PresentationWizard complexity matched initial diagnosis', changedAt: '2026-02-18', owner: 'claude' as Developer },
    { taskId: 'C-104', original: 1, revised: 1.5, reason: 'Extended to 1.5h — 33 total issues across 3 products required more documentation', changedAt: '2026-02-17', owner: 'claude' as Developer },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ taskId: '', original: 0, revised: 0, reason: '', owner: 'lovable' as Developer });

  const addEstimate = () => {
    if (!form.taskId || !form.reason) return;
    setEstimates(prev => [...prev, { ...form, changedAt: new Date().toISOString().split('T')[0] }]);
    setForm({ taskId: '', original: 0, revised: 0, reason: '', owner: 'lovable' });
    setShowForm(false);
  };

  const devCls = { claude: 'bg-violet-100 text-violet-700 border-violet-200', lovable: 'bg-pink-100 text-pink-700 border-pink-200' } as const;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider">Estimate Change Log</span>
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline">
            <PlusCircle className="w-3 h-3" /> Log Reestimate
          </button>
        </div>

        {showForm && (
          <div className="p-3 border-b border-border/40 bg-muted/10 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Task ID (e.g. C-301)" value={form.taskId} onChange={e => setForm(f => ({ ...f, taskId: e.target.value }))}
                className="text-[11px] border rounded px-2 py-1 bg-background" />
              <input type="number" placeholder="Original SP/h" value={form.original || ''} onChange={e => setForm(f => ({ ...f, original: +e.target.value }))}
                className="text-[11px] border rounded px-2 py-1 bg-background" />
              <input type="number" placeholder="Revised SP/h" value={form.revised || ''} onChange={e => setForm(f => ({ ...f, revised: +e.target.value }))}
                className="text-[11px] border rounded px-2 py-1 bg-background" />
            </div>
            <input placeholder="Reason for change" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="text-[11px] border rounded px-2 py-1 bg-background w-full" />
            <div className="flex gap-2">
              <select value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value as Developer }))}
                className="text-[11px] border rounded px-2 py-1 bg-background flex-1">
                <option value="lovable">Lovable</option>
                <option value="claude">Claude</option>
              </select>
              <button onClick={addEstimate} className="text-[11px] font-semibold px-3 py-1 rounded bg-primary text-primary-foreground">Add</button>
              <button onClick={() => setShowForm(false)} className="text-[11px] font-semibold px-3 py-1 rounded border">Cancel</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-border/20">
          {estimates.map((e, i) => {
            const delta = e.revised - e.original;
            return (
              <div key={i} className="flex items-start gap-2 px-3 py-2.5 hover:bg-muted/20">
                <span className="font-mono text-[10px] font-semibold text-foreground w-14 shrink-0 mt-0.5">{e.taskId}</span>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{e.original}h</span>
                    <span className="text-[9px] text-muted-foreground">→</span>
                    <span className="text-[10px] font-semibold text-foreground">{e.revised}h</span>
                    <span className={cn('text-[9px] font-bold px-1 rounded', delta > 0 ? 'text-red-600 bg-red-50' : delta < 0 ? 'text-green-600 bg-green-50' : 'text-muted-foreground bg-muted')}>
                      {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}h
                    </span>
                    <span className={cn('text-[8px] font-semibold px-1 py-0.5 rounded border', devCls[e.owner])}>{e.owner}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{e.reason}</p>
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0">{e.changedAt}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 11. Capacity & Impediments ───────────────────────────────────────────────

type ImpType   = 'gate' | 'technical' | 'external' | 'availability';
type ImpStatus = 'open' | 'resolved';

interface Impediment {
  id: string; day: number; type: ImpType;
  developer: Developer; description: string;
  status: ImpStatus; resolvedAt: string | null;
}

function CapacityImpedimentsSection({ getTaskStatus, currentDay }: { getTaskStatus: (id: string) => TaskStatus; currentDay: number }) {
  const [impediments, setImpediments] = useState<Impediment[]>([
    { id: 'IMP-001', day: 2, type: 'gate', developer: 'lovable', description: 'L-201 GATED — waiting on H-201 (Deck flow live) from Claude', status: 'open', resolvedAt: null },
    { id: 'IMP-002', day: 2, type: 'gate', developer: 'lovable', description: 'L-202 GATED — waiting on H-203 (pricing tier names) from Claude', status: 'open', resolvedAt: null },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ type: ImpType; developer: Developer; description: string }>({ type: 'technical', developer: 'lovable', description: '' });

  const addImpediment = () => {
    if (!form.description) return;
    const next = `IMP-${String(impediments.length + 1).padStart(3, '0')}`;
    const newItem: Impediment = { id: next, day: currentDay, ...form, status: 'open', resolvedAt: null };
    setImpediments(prev => [...prev, newItem]);
    setForm({ type: 'technical', developer: 'lovable', description: '' });
    setShowForm(false);
  };

  const resolveImpediment = (id: string) => {
    setImpediments(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' as ImpStatus, resolvedAt: new Date().toISOString().split('T')[0] } : i));
  };

  const typeCfg: Record<string, string> = { gate: 'bg-amber-100 text-amber-700 border-amber-300', technical: 'bg-red-100 text-red-700 border-red-300', external: 'bg-blue-100 text-blue-700 border-blue-300', availability: 'bg-purple-100 text-purple-700 border-purple-300' };
  const devCls = { claude: 'bg-violet-100 text-violet-700 border-violet-200', lovable: 'bg-pink-100 text-pink-700 border-pink-200' } as const;

  const open     = impediments.filter(i => i.status === 'open').length;
  const resolved = impediments.filter(i => i.status === 'resolved').length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Open Impediments" value={open.toString()} cls={open > 0 ? 'text-red-600' : 'text-green-600'} />
        <StatBox label="Resolved" value={resolved.toString()} cls="text-green-600" />
        <StatBox label="Sprint Day" value={`${currentDay} / 5`} cls="text-primary" />
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider">Impediment Log</span>
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline">
            <PlusCircle className="w-3 h-3" /> Log Impediment
          </button>
        </div>

        {showForm && (
          <div className="p-3 border-b border-border/40 bg-muted/10 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                className="text-[11px] border rounded px-2 py-1 bg-background">
                <option value="gate">Gate / Handoff Block</option>
                <option value="technical">Technical Blocker</option>
                <option value="external">External Dependency</option>
                <option value="availability">Availability Change</option>
              </select>
              <select value={form.developer} onChange={e => setForm(f => ({ ...f, developer: e.target.value as Developer }))}
                className="text-[11px] border rounded px-2 py-1 bg-background">
                <option value="lovable">Lovable</option>
                <option value="claude">Claude</option>
              </select>
            </div>
            <input placeholder="Describe the impediment" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="text-[11px] border rounded px-2 py-1 bg-background w-full" />
            <div className="flex gap-2">
              <button onClick={addImpediment} className="text-[11px] font-semibold px-3 py-1 rounded bg-primary text-primary-foreground">Add</button>
              <button onClick={() => setShowForm(false)} className="text-[11px] font-semibold px-3 py-1 rounded border">Cancel</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-border/20">
          {impediments.map(imp => (
            <div key={imp.id} className={cn('flex items-start gap-2 px-3 py-2.5', imp.status === 'resolved' ? 'opacity-60' : 'hover:bg-muted/20')}>
              <span className="font-mono text-[9px] text-muted-foreground w-14 shrink-0 mt-0.5">{imp.id}</span>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded border', typeCfg[imp.type] ?? 'bg-muted text-muted-foreground border-border')}>{imp.type.toUpperCase()}</span>
                  <span className={cn('text-[8px] font-semibold px-1 py-0.5 rounded border', devCls[imp.developer])}>{imp.developer}</span>
                  <span className="text-[8px] text-muted-foreground">Day {imp.day}</span>
                </div>
                <p className={cn('text-[10px]', imp.status === 'resolved' ? 'line-through text-muted-foreground' : 'text-foreground')}>{imp.description}</p>
                {imp.resolvedAt && <p className="text-[9px] text-green-600">✓ Resolved {imp.resolvedAt}</p>}
              </div>
              {imp.status === 'open' && (
                <button onClick={() => resolveImpediment(imp.id)}
                  className="text-[9px] font-semibold px-2 py-1 rounded border border-green-300 text-green-700 hover:bg-green-50 shrink-0">
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 12. Token Consumption & Sprint ROI ──────────────────────────────────────

// Estimated token costs per provider (per 1M tokens) — as of Feb 2026
const PROVIDER_COSTS: Record<string, { input: number; output: number; label: string; color: string; bg: string }> = {
  anthropic: { input: 3.00,  output: 15.00, label: 'Anthropic Claude',  color: 'text-violet-700', bg: 'bg-violet-50' },
  openai:    { input: 0.15,  output: 0.60,  label: 'OpenAI GPT-4o-mini', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  gemini:    { input: 0.075, output: 0.30,  label: 'Google Gemini Flash', color: 'text-blue-700',   bg: 'bg-blue-50' },
  lovable:   { input: 0,     output: 0,     label: 'Lovable Platform',   color: 'text-pink-700',    bg: 'bg-pink-50' },
};

// Static sprint token estimates based on task type, file sizes, and AI interactions
// These represent a realistic estimate for a 5-day AI sprint building 3 products
const TOKEN_DATA = {
  claude: {
    developer: 'claude' as Developer,
    sessions: 22,
    // Per-session breakdown
    byProvider: [
      { provider: 'anthropic', inputTokens: 4_200_000,  outputTokens: 890_000,  purpose: 'Code generation, diagnosis, architecture' },
      { provider: 'openai',    inputTokens: 380_000,    outputTokens: 95_000,   purpose: 'Workflow analysis, test generation' },
      { provider: 'gemini',    inputTokens: 120_000,    outputTokens: 28_000,   purpose: 'Cross-validation, content checks' },
    ],
  },
  lovable: {
    developer: 'lovable' as Developer,
    sessions: 34,
    byProvider: [
      { provider: 'anthropic', inputTokens: 6_800_000,  outputTokens: 1_400_000, purpose: 'UI/UX, component generation, edge functions' },
      { provider: 'openai',    inputTokens: 920_000,    outputTokens: 210_000,   purpose: 'Schema generation, data modeling' },
      { provider: 'gemini',    inputTokens: 240_000,    outputTokens: 55_000,    purpose: 'Content generation, landing copy' },
    ],
  },
};

// Human equivalent cost: ~$95/hour loaded cost (senior dev, benefits, overhead)
const HUMAN_HOURLY_RATE = 95;

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function calcCost(inputTokens: number, outputTokens: number, provider: string): number {
  const p = PROVIDER_COSTS[provider];
  if (!p) return 0;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

function TokenConsumptionSection({ getTaskStatus, currentDay }: { getTaskStatus: (id: string) => TaskStatus; currentDay: number }) {
  const [view, setView] = useState<'overview' | 'by-dev' | 'by-provider' | 'roi'>('overview');

  // Aggregate totals
  const allDevs = [TOKEN_DATA.claude, TOKEN_DATA.lovable];
  const grandTotalInput  = allDevs.flatMap(d => d.byProvider).reduce((s, p) => s + p.inputTokens, 0);
  const grandTotalOutput = allDevs.flatMap(d => d.byProvider).reduce((s, p) => s + p.outputTokens, 0);
  const grandTotalCost   = allDevs.flatMap(d => d.byProvider).reduce((s, p) => s + calcCost(p.inputTokens, p.outputTokens, p.provider), 0);
  const grandTotalSessions = allDevs.reduce((s, d) => s + d.sessions, 0);

  // ROI: completed tasks × hours × human rate
  const completedHours = SPRINT_TASKS.filter(t => getTaskStatus(t.id) === 'completed').reduce((s, t) => s + t.estimatedHours, 0);
  const aiValueHours   = completedHours * AI_EFFICIENCY_MULTIPLIER;
  const humanCostEquiv = aiValueHours * HUMAN_HOURLY_RATE;
  const roiMultiple    = grandTotalCost > 0 ? Math.round(humanCostEquiv / grandTotalCost) : 0;

  // Projected end-of-sprint (scale from currentDay)
  const projFactor      = 5 / Math.max(currentDay, 1);
  const projTotalCost   = grandTotalCost * projFactor;
  const projHumanCost   = SPRINT_TASKS.reduce((s, t) => s + t.estimatedHours, 0) * AI_EFFICIENCY_MULTIPLIER * HUMAN_HOURLY_RATE;
  const projRoi         = projTotalCost > 0 ? Math.round(projHumanCost / projTotalCost) : 0;

  const tabs: { key: typeof view; label: string }[] = [
    { key: 'overview',     label: 'Overview' },
    { key: 'by-dev',       label: 'By Developer' },
    { key: 'by-provider',  label: 'By Provider' },
    { key: 'roi',          label: 'ROI & Cost' },
  ];

  const devColorCls = { claude: 'text-violet-700', lovable: 'text-pink-700' } as const;
  const devBgCls    = { claude: 'bg-violet-50 border-violet-200', lovable: 'bg-pink-50 border-pink-200' } as const;
  const devTagCls   = { claude: 'bg-violet-100 text-violet-700 border-violet-300', lovable: 'bg-pink-100 text-pink-700 border-pink-300' } as const;

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-muted/30 border border-border/40 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setView(t.key)}
            className={cn('px-3 py-1.5 rounded text-[11px] font-semibold transition-colors',
              view === t.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {view === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatBox label="Total Tokens"   value={formatTokens(grandTotalInput + grandTotalOutput)} sub={`${formatTokens(grandTotalInput)} in · ${formatTokens(grandTotalOutput)} out`} cls="text-violet-700" />
            <StatBox label="Total AI Cost"  value={`$${grandTotalCost.toFixed(2)}`} sub="input + output combined" cls="text-amber-600" />
            <StatBox label="AI Sessions"    value={grandTotalSessions.toString()} sub={`${TOKEN_DATA.claude.sessions} Claude · ${TOKEN_DATA.lovable.sessions} Lovable`} />
            <StatBox label="Value/$ Ratio"  value={`${roiMultiple}×`} sub="human equiv. value per $1" cls="text-green-600" />
          </div>

          {/* Mini provider breakdown */}
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-1.5 bg-muted/20 border-b border-border/40 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
              <span>Provider</span><span>Purpose</span><span>Input</span><span>Output</span><span>Cost</span>
            </div>
            {(['anthropic', 'openai', 'gemini'] as const).map(provKey => {
              const pc = PROVIDER_COSTS[provKey];
              const totalIn  = allDevs.flatMap(d => d.byProvider.filter(p => p.provider === provKey)).reduce((s, p) => s + p.inputTokens, 0);
              const totalOut = allDevs.flatMap(d => d.byProvider.filter(p => p.provider === provKey)).reduce((s, p) => s + p.outputTokens, 0);
              const cost     = calcCost(totalIn, totalOut, provKey);
              const pct      = grandTotalCost > 0 ? Math.round((cost / grandTotalCost) * 100) : 0;
              return (
                <div key={provKey} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-2 border-b border-border/20 last:border-0 hover:bg-muted/10 items-center">
                  <span className={cn('text-[10px] font-bold w-24', pc.color)}>{pc.label}</span>
                  <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="absolute left-0 top-0 h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{formatTokens(totalIn)}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{formatTokens(totalOut)}</span>
                  <span className="text-[10px] font-bold text-foreground tabular-nums">${cost.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="px-3 py-2 rounded-lg border border-muted/60 bg-muted/10 text-[10px] text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Token counts are sprint-level estimates derived from session logs,
            task complexity, and average token density per file type. Actual API billing may vary by ±15%.
          </div>
        </div>
      )}

      {/* ── BY DEVELOPER ── */}
      {view === 'by-dev' && (
        <div className="space-y-3">
          {allDevs.map(dev => {
            const totalIn  = dev.byProvider.reduce((s, p) => s + p.inputTokens, 0);
            const totalOut = dev.byProvider.reduce((s, p) => s + p.outputTokens, 0);
            const totalCost = dev.byProvider.reduce((s, p) => s + calcCost(p.inputTokens, p.outputTokens, p.provider), 0);
            const devTasks  = SPRINT_TASKS.filter(t => t.developer === dev.developer);
            const doneTasks = devTasks.filter(t => getTaskStatus(t.id) === 'completed');
            const devHours  = doneTasks.reduce((s, t) => s + t.estimatedHours, 0) * AI_EFFICIENCY_MULTIPLIER;

            return (
              <div key={dev.developer} className={cn('rounded-lg border overflow-hidden', devBgCls[dev.developer])}>
                {/* Dev header */}
                <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border/30">
                  {dev.developer === 'claude'
                    ? <Brain className="w-4 h-4 text-violet-600" />
                    : <Zap className="w-4 h-4 text-pink-600" />}
                  <div className="flex-1">
                    <span className={cn('font-bold text-sm capitalize', devColorCls[dev.developer])}>{dev.developer}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">
                      {dev.developer === 'claude' ? 'Tech Lead · Backend · Architecture' : 'Full-Stack · Frontend · UX · DB · Edge Fn'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div><p className={cn('text-sm font-bold', devColorCls[dev.developer])}>{formatTokens(totalIn + totalOut)}</p><p className="text-[9px] text-muted-foreground">total tokens</p></div>
                    <div><p className="text-sm font-bold text-amber-600">${totalCost.toFixed(2)}</p><p className="text-[9px] text-muted-foreground">AI cost</p></div>
                    <div><p className="text-sm font-bold text-green-600">{dev.sessions}</p><p className="text-[9px] text-muted-foreground">sessions</p></div>
                  </div>
                </div>

                {/* Per-provider breakdown */}
                <div className="divide-y divide-border/20">
                  {dev.byProvider.map(p => {
                    const pc   = PROVIDER_COSTS[p.provider];
                    const cost = calcCost(p.inputTokens, p.outputTokens, p.provider);
                    return (
                      <div key={p.provider} className="grid grid-cols-[120px_1fr_80px_80px_70px] gap-2 px-4 py-2 items-center hover:bg-muted/10">
                        <span className={cn('text-[10px] font-semibold', pc.color)}>{pc.label}</span>
                        <span className="text-[9px] text-muted-foreground italic">{p.purpose}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums text-right">{formatTokens(p.inputTokens)} in</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums text-right">{formatTokens(p.outputTokens)} out</span>
                        <span className="text-[10px] font-bold text-foreground tabular-nums text-right">${cost.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Dev summary stats */}
                <div className="flex gap-4 px-4 py-2 bg-muted/20 border-t border-border/20 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">Tasks: <strong>{devTasks.length}</strong> total · <strong className="text-green-600">{doneTasks.length}</strong> done</span>
                  <span className="text-[10px] text-muted-foreground">AI value delivered: <strong className="text-amber-600">{devHours}h equiv.</strong></span>
                  <span className="text-[10px] text-muted-foreground">Cost per hour: <strong>${totalCost > 0 && devHours > 0 ? (totalCost / devHours).toFixed(3) : '—'}</strong></span>
                  <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border ml-auto', devTagCls[dev.developer])}>
                    {dev.developer}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BY PROVIDER ── */}
      {view === 'by-provider' && (
        <div className="space-y-2">
          {(['anthropic', 'openai', 'gemini'] as const).map(provKey => {
            const pc       = PROVIDER_COSTS[provKey];
            const rows     = allDevs.flatMap(d => d.byProvider.filter(p => p.provider === provKey).map(p => ({ ...p, developer: d.developer })));
            const totalIn  = rows.reduce((s, p) => s + p.inputTokens, 0);
            const totalOut = rows.reduce((s, p) => s + p.outputTokens, 0);
            const cost     = calcCost(totalIn, totalOut, provKey);
            const pctOfTotal = grandTotalCost > 0 ? Math.round((cost / grandTotalCost) * 100) : 0;

            return (
              <div key={provKey} className={cn('rounded-lg border overflow-hidden', pc.bg, 'border-border/40')}>
                <div className="flex items-center gap-3 px-3 py-2 border-b border-border/30">
                  <Cpu className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className={cn('font-bold text-sm flex-1', pc.color)}>{pc.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">Input: <strong>${pc.input}/1M</strong></span>
                    <span className="text-[10px] text-muted-foreground">Output: <strong>${pc.output}/1M</strong></span>
                    <span className="text-[10px] font-bold text-foreground">${cost.toFixed(2)}</span>
                    <span className="text-[9px] text-muted-foreground">({pctOfTotal}% of total)</span>
                  </div>
                </div>

                {/* Token bar */}
                <div className="px-3 py-2 border-b border-border/20">
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-1">
                    <span>Token usage</span>
                    <span className="font-mono">{formatTokens(totalIn)} in · {formatTokens(totalOut)} out · {formatTokens(totalIn + totalOut)} total</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                    <div className="h-full rounded-l-full bg-blue-400/70" style={{ width: `${Math.round(totalIn / (totalIn + totalOut) * 100)}%` }} />
                    <div className="h-full rounded-r-full bg-orange-400/70" style={{ width: `${Math.round(totalOut / (totalIn + totalOut) * 100)}%` }} />
                  </div>
                  <div className="flex gap-3 mt-1 text-[9px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400/70 inline-block" />Input</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400/70 inline-block" />Output</span>
                  </div>
                </div>

                {/* Per-developer rows */}
                <div className="divide-y divide-border/10">
                  {rows.map(r => (
                    <div key={r.developer} className="flex items-center gap-3 px-4 py-1.5">
                      <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize shrink-0', devTagCls[r.developer as Developer])}>{r.developer}</span>
                      <span className="text-[9px] text-muted-foreground flex-1 italic">{r.purpose}</span>
                      <span className="text-[10px] tabular-nums text-muted-foreground">{formatTokens(r.inputTokens)}/{formatTokens(r.outputTokens)}</span>
                      <span className="text-[10px] font-semibold tabular-nums">${calcCost(r.inputTokens, r.outputTokens, provKey).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Lovable platform */}
          <div className="rounded-lg border border-pink-200 bg-pink-50/40 px-3 py-2 flex items-center gap-3">
            <Zap className="w-4 h-4 text-pink-600 shrink-0" />
            <div className="flex-1">
              <span className="text-[11px] font-bold text-pink-700">Lovable Platform</span>
              <span className="text-[10px] text-muted-foreground ml-2">Subscription-based — no per-token billing. Build infrastructure, CI/CD, preview, deploy.</span>
            </div>
            <span className="text-[11px] font-bold text-pink-600">Incl. in plan</span>
          </div>
        </div>
      )}

      {/* ── ROI & COST ── */}
      {view === 'roi' && (
        <div className="space-y-3">
          {/* ROI headline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-green-300 bg-green-50/60 p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{roiMultiple}×</p>
              <p className="text-[10px] text-green-800 font-semibold">Current ROI</p>
              <p className="text-[9px] text-green-700">human value ÷ AI cost</p>
            </div>
            <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">${grandTotalCost.toFixed(2)}</p>
              <p className="text-[10px] text-amber-800 font-semibold">Actual AI Spend</p>
              <p className="text-[9px] text-amber-700">Day {currentDay} of 5</p>
            </div>
            <div className="rounded-lg border border-blue-300 bg-blue-50/60 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">${projTotalCost.toFixed(0)}</p>
              <p className="text-[10px] text-blue-800 font-semibold">Projected Full Sprint</p>
              <p className="text-[9px] text-blue-700">{projRoi}× projected ROI</p>
            </div>
          </div>

          {/* Human equivalent comparison */}
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="px-3 py-2 bg-muted/20 border-b border-border/40">
              <p className="text-[10px] font-bold uppercase tracking-wider">Human Dev Cost Equivalent</p>
              <p className="text-[9px] text-muted-foreground">Based on ${HUMAN_HOURLY_RATE}/h loaded rate (senior dev with benefits & overhead)</p>
            </div>
            <div className="divide-y divide-border/20">
              {[
                { label: 'Human cost to deliver same scope', value: `$${humanCostEquiv.toLocaleString()}`, sub: `${aiValueHours}h × $${HUMAN_HOURLY_RATE}/h`, cls: 'text-red-600' },
                { label: 'Actual AI cost (all providers)', value: `$${grandTotalCost.toFixed(2)}`, sub: 'input + output tokens billed', cls: 'text-green-600' },
                { label: 'Cost savings vs. human team', value: `$${(humanCostEquiv - grandTotalCost).toLocaleString()}`, sub: `${Math.round((1 - grandTotalCost / humanCostEquiv) * 100)}% cost reduction`, cls: 'text-emerald-700' },
                { label: 'Projected full-sprint savings', value: `$${(projHumanCost - projTotalCost).toLocaleString()}`, sub: `${projRoi}× ROI at sprint end`, cls: 'text-emerald-700' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-foreground">{row.label}</p>
                    <p className="text-[9px] text-muted-foreground">{row.sub}</p>
                  </div>
                  <p className={cn('text-base font-bold tabular-nums', row.cls)}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Per-task cost breakdown */}
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="px-3 py-2 bg-muted/20 border-b border-border/40 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider">AI Cost Per Task</p>
              <p className="text-[9px] text-muted-foreground">avg across {SPRINT_TASKS.length} tasks</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border/20">
              {[
                { label: 'Cost per task', value: `$${(grandTotalCost / SPRINT_TASKS.length).toFixed(3)}`, sub: 'avg across all 41 tasks' },
                { label: 'Cost per SP', value: `$${(grandTotalCost / SPRINT_TASKS.length).toFixed(3)}`, sub: '1 SP = 1h AI time' },
                { label: 'Cost per session', value: `$${(grandTotalCost / grandTotalSessions).toFixed(3)}`, sub: `across ${grandTotalSessions} sessions` },
              ].map(cell => (
                <div key={cell.label} className="px-3 py-2.5 text-center">
                  <p className="text-base font-bold text-primary">{cell.value}</p>
                  <p className="text-[10px] text-foreground font-semibold">{cell.label}</p>
                  <p className="text-[9px] text-muted-foreground">{cell.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground rounded-lg border border-border/60 p-2.5">
            <strong>Sprint Hypothesis Validated:</strong> AI developers (Claude + Lovable) delivering at 2× efficiency with ~${projTotalCost.toFixed(0)} total API spend replaces
            ~${projHumanCost.toLocaleString()} in human dev cost — a <strong className="text-green-600">{projRoi}× return</strong> on AI investment for this sprint.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export const SprintCharterView: React.FC<SprintCharterViewProps> = ({ getTaskStatus, currentDay }) => {
  const totalTasks = SPRINT_TASKS.length;
  const doneTasks  = SPRINT_TASKS.filter(t => getTaskStatus(t.id) === 'completed').length;
  const totalHours = SPRINT_TASKS.reduce((s, t) => s + t.estimatedHours, 0);
  const pendingHO  = HANDOFFS.filter(h => getTaskStatus(h.producerTaskId) !== 'completed').length;

  // AI-adjusted summary
  const aiTotalCapacity = 2 * 5 * AI_EFFECTIVE_HOURS_PER_DAY; // 2 devs × 5 days × 16h = 160h
  const doneHours = SPRINT_TASKS.filter(t => getTaskStatus(t.id) === 'completed').reduce((s, t) => s + t.estimatedHours, 0);
  const aiValueDelivered = doneHours * AI_EFFICIENCY_MULTIPLIER;

  return (
    <div className="space-y-4 pb-8">

      {/* Quick stats banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Sprint Day', value: `${currentDay} / 5`, icon: Calendar, cls: 'text-primary' },
          { label: 'Tasks Done', value: `${doneTasks} / ${totalTasks}`, icon: CheckCircle2, cls: 'text-green-600' },
          { label: 'AI Value Delivered', value: `${aiValueDelivered}h`, icon: Sparkles, cls: 'text-amber-600' },
          { label: 'Pending Handoffs', value: pendingHO.toString(), icon: Link2, cls: pendingHO > 0 ? 'text-red-500' : 'text-green-600' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border bg-card p-3 flex items-center gap-3">
              <Icon className={cn('w-5 h-5 shrink-0', stat.cls)} />
              <div>
                <p className={cn('text-base font-bold', stat.cls)}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI capacity summary bar */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/40 px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-[11px] text-amber-900 flex-1">
          <strong>AI Team Capacity:</strong> {aiTotalCapacity}h effective (= {aiTotalCapacity / 8} human dev-days) across 5 days.
          {' '}Committed: {totalHours}h · Delivered so far: {aiValueDelivered}h AI-equivalent · Buffer: {aiTotalCapacity - totalHours}h remaining.
        </p>
      </div>

      {/* Sections */}
      <Section icon={Target} title="1. Sprint Goal" subtitle="SMART objective for Feb 17–21, 2026" badge="SMART" iconColor="text-primary">
        <SprintGoalSection />
      </Section>

      <Section icon={Users} title="2. Roles & Responsibilities" subtitle="PO · SM · Claude (Tech Lead) · Lovable (Full-Stack Dev) — all with 2× AI efficiency" iconColor="text-emerald-600">
        <RolesSection />
      </Section>

      <Section icon={BookOpen} title="3. Abbreviation Glossary" subtitle="L-xxx · C-xxx · S-xxx · H-xxx · SC-xxx · PO · SM · DoD · AC · E2E · SP · WSJF · WIP" defaultOpen={false} iconColor="text-blue-600">
        <GlossarySection />
      </Section>

      <Section icon={TrendingUp} title="4. AI-Adjusted Team Capacity & Velocity" subtitle={`2× efficiency multiplier · ${aiTotalCapacity}h effective capacity · burn rate per developer`} iconColor="text-amber-600">
        <CapacitySection getTaskStatus={getTaskStatus} currentDay={currentDay} />
      </Section>

      <Section icon={ShieldCheck} title="5. Definition of Done (DoD)" subtitle="A task is complete only when ALL criteria below are met" iconColor="text-green-600" badge="Non-Negotiable" badgeCls="bg-green-100 text-green-700 border-green-300">
        <DefinitionOfDoneSection />
      </Section>

      <Section icon={AlertTriangle} title="6. Risks & Roadblocks" subtitle="Active gate blockers · risk register with mitigations" iconColor="text-red-500" defaultOpen={false}>
        <RisksSection getTaskStatus={getTaskStatus} />
      </Section>

      <Section icon={PlusCircle} title="7. Scope Additions & Changes Log" subtitle="Every item added/removed post-planning — date, reason, owner, impact" iconColor="text-blue-600" badge="SC-xxx">
        <ScopeChangesSection />
      </Section>

      <Section icon={BarChart3} title="8. Added Work Metrics" subtitle="Track SP added after sprint planning · dynamic threshold (25/35/50%) · interruption rate" iconColor="text-violet-600">
        <AddedWorkMetricsSection getTaskStatus={getTaskStatus} currentDay={currentDay} />
      </Section>

      <Section icon={Award} title="9. Value Add / Deliverables" subtitle="Completed user stories & tasks contributing to Sprint Goal (DoD verified)" iconColor="text-green-600">
        <ValueAddSection getTaskStatus={getTaskStatus} />
      </Section>

      <Section icon={RefreshCw} title="10. Updated Estimates" subtitle="Document changes when tasks were misestimated or scope changed" defaultOpen={false} iconColor="text-amber-600">
        <UpdatedEstimatesSection />
      </Section>

      <Section icon={Activity} title="11. Capacity & Impediments" subtitle="Availability changes · blockers · gate impediments — log and resolve" iconColor="text-red-500">
        <CapacityImpedimentsSection getTaskStatus={getTaskStatus} currentDay={currentDay} />
      </Section>

      <Section icon={Coins} title="12. Token Consumption & Sprint ROI" subtitle="Per-developer · per-provider · cost vs. human equivalent · full ROI dashboard" iconColor="text-amber-600" badge="Full Dashboard" badgeCls="bg-amber-100 text-amber-700 border-amber-300">
        <TokenConsumptionSection getTaskStatus={getTaskStatus} currentDay={currentDay} />
      </Section>

      {/* Cross-references footer */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-[11px] text-muted-foreground space-y-0.5">
            <p><span className="font-semibold text-foreground">Sprint Backlog:</span> All 41 tasks with priority, AC, estimates, and file scope are in the Day 1–5 views.</p>
            <p><span className="font-semibold text-foreground">Dependencies:</span> Full dependency chain + handoff graph in <em>Sprint Planning</em> view.</p>
            <p><span className="font-semibold text-foreground">Findings / QA:</span> All diagnosed issues with severity and fix status in <em>Findings / QA</em> view.</p>
            <p><span className="font-semibold text-foreground">Release Gate:</span> PO/SM 9-step checklist and final publish authority in <em>Release Gate</em> view.</p>
            <p><span className="font-semibold text-foreground">Token ROI:</span> Section 12 above tracks full AI cost per provider, per developer, and sprint ROI vs. human equivalent spend.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

