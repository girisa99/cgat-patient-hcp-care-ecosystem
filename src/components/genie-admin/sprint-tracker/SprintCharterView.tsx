/**
 * SprintCharterView — Sprint Charter, Roles & Responsibilities
 *
 * Covers all 7 standard Scrum elements:
 * 1. Sprint Goal (SMART)
 * 2. Sprint Backlog (selected items + priority)
 * 3. Team Capacity & Velocity
 * 4. Detailed Tasks & Estimates
 * 5. Acceptance Criteria
 * 6. Dependencies
 * 7. Risks / Roadblocks
 *
 * Also defines ALL abbreviations: PO, SM, L-xxx, C-xxx, S-xxx, H-xxx, etc.
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, Flag, Brain, Zap, Users, BookOpen,
  AlertTriangle, CheckCircle2, Clock, Link2, TrendingUp,
  Shield, ShieldCheck, Calendar, Gauge, FileText, Info, ChevronDown, ChevronRight,
  GitBranch, Star, Ban, Timer, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRINT_TASKS } from './data-tasks';
import { HANDOFFS } from './data-dependencies';
import { SPRINT_DAYS, SPRINT_START_DATE, SPRINT_END_DATE } from './data-config';
import type { Developer, TaskStatus } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SprintCharterViewProps {
  getTaskStatus: (id: string) => TaskStatus;
  currentDay: number;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon, title, subtitle, badge, children, defaultOpen = true,
  iconColor = 'text-muted-foreground',
}: {
  icon: React.ElementType; title: string; subtitle?: string; badge?: string;
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
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function Pill({ label, cls }: { label: string; cls: string }) {
  return <span className={cn('inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border', cls)}>{label}</span>;
}

// ─── 1. Sprint Goal ───────────────────────────────────────────────────────────

function SprintGoalSection() {
  const smartItems = [
    {
      letter: 'S', word: 'Specific',
      value: 'Fix all critical creation flows (Spark, Mind, Deck) and all landing page sections (explore, pricing, legal, demos) so every primary user path is functional.',
    },
    {
      letter: 'M', word: 'Measurable',
      value: '41 tasks tracked. Sprint is "done" when 100% tasks are ✅ completed and build passes on main.',
    },
    {
      letter: 'A', word: 'Achievable',
      value: '2 developers × 5 days × ~8h = 80h total. 41 tasks × avg 1.7h = ~70h. Buffer: 10h for blockers.',
    },
    {
      letter: 'R', word: 'Relevant',
      value: 'Pre-launch readiness sprint. Users cannot create content (Spark/Mind/Deck broken); landing is the only public face.',
    },
    {
      letter: 'T', word: 'Time-bound',
      value: `Feb 17–21, 2026 (5 working days). PO/SM publishes to production by EOD Day 5.`,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Primary goal statement */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
        <p className="text-sm font-semibold text-foreground leading-relaxed">
          "Deliver a fully functional GenieSuite MVP with working content creation tools
          (Spark → Mind → Deck pipeline) and a polished landing experience
          across all 14 regions — production-ready by EOD Feb 21, 2026."
        </p>
      </div>
      {/* SMART breakdown */}
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
      color: 'emerald',
      Icon: Flag,
      tagCls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      responsibilities: [
        'Defines acceptance criteria for every user story',
        'Maintains and prioritises the Sprint Backlog',
        'Verifies completed tasks match acceptance criteria',
        'Approves or rejects deliverables (triggers backlog on rejection)',
        'Makes product decisions (decides when ambiguous)',
        'Unblocks developers when external dependencies arise',
        'Executes the final Publish (production release)',
        'Signs off on the Release Gate before go-live',
      ],
      cannotDo: [
        'Cannot change sprint scope mid-sprint without SM agreement',
        'Cannot approve their own technical implementations',
      ],
    },
    {
      abbr: 'SM',
      fullName: 'Scrum Master',
      person: 'Dual-role with PO in this sprint',
      color: 'emerald',
      Icon: Shield,
      tagCls: 'bg-teal-100 text-teal-800 border-teal-300',
      responsibilities: [
        'Facilitates daily standups and sprint ceremonies',
        'Removes organisational blockers for the team',
        'Enforces governance: locked files, conflict prevention, merge order',
        'Tracks sprint health (velocity, backlog growth, handoff status)',
        'Escalates risks that cannot be resolved at team level',
        'Ensures the "Claude merges FIRST, then Lovable rebases" protocol is followed',
        'Manages the Stage Gate (H-xxx) acknowledgement process',
      ],
      cannotDo: [
        'Cannot direct developers on HOW to implement (only WHAT and WHEN)',
        'Cannot commit code directly',
      ],
    },
    {
      abbr: 'Claude',
      fullName: 'AI Technical Lead (Claude)',
      person: 'Anthropic Claude — autonomous dev agent',
      color: 'violet',
      Icon: Brain,
      tagCls: 'bg-violet-100 text-violet-800 border-violet-300',
      responsibilities: [
        'Owns all Genie Spark, Mind, Deck (CREATE suite) code',
        'Owns genie-studio/**, genie-spark/**, navigation/Quadrant*',
        'Diagnoses bugs with root-cause analysis and written findings',
        'Implements fixes and verifies E2E flows before marking complete',
        'Produces handoff artifacts (H-xxx) consumed by Lovable',
        'Runs build check (npm run build) before every sync',
        'Merges to main FIRST on Day 5',
        'Documents issues in SHARED_CHANGELOG.md for shared resources',
      ],
      cannotDo: [
        'Cannot touch landing/**, explore pages, or legal pages',
        'Cannot modify locked files (auth, layout, supabase integration)',
        'Cannot publish to production (PO/SM only)',
      ],
    },
    {
      abbr: 'Lovable',
      fullName: 'AI Frontend Developer (Lovable)',
      person: 'Lovable AI — this environment',
      color: 'pink',
      Icon: Zap,
      tagCls: 'bg-pink-100 text-pink-800 border-pink-300',
      responsibilities: [
        'Owns all landing/**, explore pages, legal pages (47+ files)',
        'Owns landing hooks, regional config, pricing sections',
        'Fixes broken hero sections, interactive demos, video showcases',
        'Verifies all 14 regional landing page variants',
        'Consumes handoff artifacts from Claude (H-xxx)',
        'Mobile responsiveness, SEO meta tags, performance optimisation',
        'Cross-browser testing of landing experience',
        'Rebases onto main AFTER Claude on Day 5',
      ],
      cannotDo: [
        'Cannot touch genie-studio/**, genie-spark/**, or QuadrantNavigation',
        'Cannot modify locked files (auth, layout, supabase integration)',
        'Cannot publish to production (PO/SM only)',
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {roles.map(role => {
        const Icon = role.Icon;
        return (
          <div key={role.abbr} className={cn(
            'rounded-lg border p-4 space-y-3',
            role.abbr === 'PO' ? 'border-emerald-200 bg-emerald-50/30' :
            role.abbr === 'SM' ? 'border-teal-200 bg-teal-50/30' :
            role.abbr === 'Claude' ? 'border-violet-200 bg-violet-50/30' :
            'border-pink-200 bg-pink-50/30',
          )}>
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                role.abbr === 'PO' ? 'bg-emerald-100' :
                role.abbr === 'SM' ? 'bg-teal-100' :
                role.abbr === 'Claude' ? 'bg-violet-100' :
                'bg-pink-100',
              )}>
                <Icon className={cn('w-4 h-4',
                  role.abbr === 'PO' ? 'text-emerald-700' :
                  role.abbr === 'SM' ? 'text-teal-700' :
                  role.abbr === 'Claude' ? 'text-violet-700' :
                  'text-pink-700',
                )} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', role.tagCls)}>{role.abbr}</span>
                  <span className="text-sm font-bold text-foreground">{role.fullName}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 italic">{role.person}</p>
              </div>
            </div>

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

            {/* Cannot do */}
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
      title: 'Task ID Prefixes',
      icon: FileText,
      items: [
        { abbr: 'L-xxx', meaning: 'Lovable task', example: 'L-101 = Lovable, Day 1, task 1' },
        { abbr: 'C-xxx', meaning: 'Claude task', example: 'C-201 = Claude, Day 2, task 1' },
        { abbr: 'S-xxx', meaning: 'Shared / Sync task', example: 'S-101 = Shared Day 1 build check' },
        { abbr: 'H-xxx', meaning: 'Handoff artifact', example: 'H-201 = Handoff #1 on Day 2 (Claude → Lovable)' },
      ],
    },
    {
      title: 'Roles & People',
      icon: Users,
      items: [
        { abbr: 'PO', meaning: 'Product Owner — owns "what" is built', example: 'Verifies acceptance criteria, approves release' },
        { abbr: 'SM', meaning: 'Scrum Master — removes blockers, enforces process', example: 'Dual-role with PO in this sprint' },
        { abbr: 'Dev', meaning: 'Developer — Claude or Lovable', example: 'Implements tasks within their territory' },
      ],
    },
    {
      title: 'Scrum Ceremonies',
      icon: Calendar,
      items: [
        { abbr: 'Sprint', meaning: 'Time-boxed iteration (5 days, Feb 17–21)', example: 'All work happens within the sprint' },
        { abbr: 'Standup', meaning: 'Daily 15-min sync: Yesterday / Today / Blockers', example: 'Captured per developer per day' },
        { abbr: 'Backlog', meaning: 'Incomplete items carried over from previous days', example: 'Triggered by failed verification or missed deadline' },
        { abbr: 'Sprint Review', meaning: 'End-of-sprint demo to PO (Day 5)', example: 'PO verifies all done criteria' },
        { abbr: 'Retrospective', meaning: 'Post-sprint: what worked / what to improve', example: 'Planned after Day 5 publish' },
      ],
    },
    {
      title: 'Workflow Terms',
      icon: GitBranch,
      items: [
        { abbr: 'Gate', meaning: 'A mandatory checkpoint before work can proceed', example: 'H-201 gates L-201 until Deck flow is live' },
        { abbr: 'Handoff', meaning: 'An artifact passed from one developer to another', example: 'Claude produces H-201; Lovable consumes it' },
        { abbr: 'GATED', meaning: 'Task cannot start until a dependency is resolved', example: 'L-201 GATED on H-201' },
        { abbr: 'Stage Gate', meaning: 'PO approval required before next sprint stage', example: 'End-of-day build check + PO sign-off' },
        { abbr: 'DoD', meaning: 'Definition of Done — task is complete only when criteria met', example: 'Build passes + acceptance criteria verified by PO' },
        { abbr: 'AC', meaning: 'Acceptance Criteria — specific conditions the output must meet', example: '"All 6 wizard steps complete without errors"' },
        { abbr: 'E2E', meaning: 'End-to-End test — the full user workflow from start to finish', example: 'Spark prompt → generate → save verified' },
        { abbr: 'WSJF', meaning: 'Weighted Shortest Job First — priority framework', example: 'Critical > High > Medium > Low' },
        { abbr: 'WIP', meaning: 'Work In Progress — tasks currently in-progress', example: 'Keep WIP ≤ 2 per developer to avoid context switching' },
      ],
    },
    {
      title: 'Status Values',
      icon: Gauge,
      items: [
        { abbr: 'pending', meaning: 'Not yet started', example: 'Default for future-day tasks' },
        { abbr: 'in-progress', meaning: 'Actively being worked on', example: 'Shown in blue on board' },
        { abbr: 'completed', meaning: 'Done + verified by PO', example: 'Green check, counts toward velocity' },
        { abbr: 'rejected', meaning: 'Failed PO verification — must rework', example: 'Moves to backlog for next cycle' },
      ],
    },
    {
      title: 'Priority Levels',
      icon: Star,
      items: [
        { abbr: 'critical', meaning: 'Blocks all other work; must fix immediately', example: 'Build failure, auth broken' },
        { abbr: 'high', meaning: 'Core sprint goal; high business impact', example: 'Deck creation flow broken' },
        { abbr: 'medium', meaning: 'Important but not blocking', example: 'Translation demo fix' },
        { abbr: 'low', meaning: 'Nice-to-have; do last', example: 'Cross-browser edge cases' },
      ],
    },
    {
      title: 'Technical Abbreviations',
      icon: Layers,
      items: [
        { abbr: 'RAG', meaning: 'Retrieval-Augmented Generation — AI with knowledge base', example: 'Genie RAG uses universal_knowledge_base' },
        { abbr: 'STT', meaning: 'Speech-to-Text — voice input processing', example: 'Google Cloud STT as fallback provider' },
        { abbr: 'TTS', meaning: 'Text-to-Speech — AI voiceover generation', example: 'ElevenLabs primary for Genie Mind' },
        { abbr: 'RLS', meaning: 'Row-Level Security — database access policy', example: 'Every table has user-scoped RLS' },
        { abbr: 'MCP', meaning: 'Model Context Protocol — AI tool integration standard', example: 'Phase 3B planned feature' },
        { abbr: 'WIP limit', meaning: 'Max concurrent tasks per developer', example: 'Claude: 2, Lovable: 2' },
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

// ─── 4. Team Capacity & Velocity ──────────────────────────────────────────────

function CapacitySection({ getTaskStatus, currentDay }: { getTaskStatus: (id: string) => TaskStatus; currentDay: number }) {
  const developers: Developer[] = ['claude', 'lovable'];
  const devCfg = {
    claude:  { label: 'Claude',  tagCls: 'bg-violet-100 text-violet-800 border-violet-300', Icon: Brain },
    lovable: { label: 'Lovable', tagCls: 'bg-pink-100 text-pink-800 border-pink-300',       Icon: Zap   },
  } as const;

  const totalHours = { claude: 0, lovable: 0 };
  const doneHours  = { claude: 0, lovable: 0 };
  const wipHours   = { claude: 0, lovable: 0 };

  SPRINT_TASKS.forEach(t => {
    const s = getTaskStatus(t.id);
    const dev = t.developer as Developer;
    totalHours[dev] += t.estimatedHours;
    if (s === 'completed') doneHours[dev] += t.estimatedHours;
    if (s === 'in-progress') wipHours[dev] += t.estimatedHours;
  });

  const totalCapacityHours = 40; // 5 days × 8h per developer
  const daysElapsed = Math.min(currentDay, 5);
  const expectedPct = Math.round((daysElapsed / 5) * 100);

  return (
    <div className="space-y-4">
      {/* Sprint timeline */}
      <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">Sprint Progress</span>
          <span className="text-muted-foreground">Day {currentDay} of 5 · {expectedPct}% elapsed</span>
        </div>
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-primary/30 rounded-full" style={{ width: `${expectedPct}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>Feb 17</span>
          <span>Feb 19</span>
          <span>Feb 21</span>
        </div>
      </div>

      {/* Per-developer capacity */}
      {developers.map(dev => {
        const cfg = devCfg[dev];
        const Icon = cfg.Icon;
        const tasks = SPRINT_TASKS.filter(t => t.developer === dev);
        const done = tasks.filter(t => getTaskStatus(t.id) === 'completed').length;
        const wip  = tasks.filter(t => getTaskStatus(t.id) === 'in-progress').length;
        const donePct = Math.round((done / tasks.length) * 100);
        const hourDonePct = Math.round((doneHours[dev] / totalHours[dev]) * 100);

        return (
          <div key={dev} className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', cfg.tagCls)}>{cfg.label}</span>
              <span className="text-xs font-semibold text-foreground ml-auto">{done}/{tasks.length} tasks done</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Total Tasks', value: tasks.length.toString(), cls: 'text-foreground' },
                { label: 'Done', value: done.toString(), cls: 'text-green-600 font-bold' },
                { label: 'In Progress', value: wip.toString(), cls: 'text-blue-600 font-bold' },
                { label: 'Est. Hours', value: `${totalHours[dev]}h`, cls: 'text-foreground' },
              ].map(stat => (
                <div key={stat.label} className="rounded border bg-muted/20 py-1.5">
                  <p className={cn('text-sm font-bold', stat.cls)}>{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Task velocity</span>
                <span className="font-semibold">{donePct}%</span>
              </div>
              <Progress value={donePct} className="h-1.5" />
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Hour burn ({doneHours[dev].toFixed(1)}h / {totalHours[dev]}h)</span>
                <span className="font-semibold">{hourDonePct}%</span>
              </div>
              <Progress value={hourDonePct} className="h-1.5 [&>div]:bg-amber-500" />
            </div>

            <div className="text-[10px] text-muted-foreground">
              Capacity: {totalCapacityHours}h available ({5} days × 8h/day). Committed: {totalHours[dev]}h. Buffer: {(totalCapacityHours - totalHours[dev]).toFixed(1)}h.
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 5. Risks & Roadblocks ────────────────────────────────────────────────────

function RisksSection({ getTaskStatus }: { getTaskStatus: (id: string) => TaskStatus }) {
  const pendingHandoffs = HANDOFFS.filter(h => getTaskStatus(h.producerTaskId) !== 'completed');

  const staticRisks = [
    {
      id: 'R-001', severity: 'high' as const,
      risk: 'ScriptEditorTab (127KB) — deep refactor risk',
      impact: 'Genie Mind (Day 4) may overflow into Day 5',
      mitigation: 'Claude allocated 3h; flag early if scope is larger',
      owner: 'claude' as Developer,
    },
    {
      id: 'R-002', severity: 'high' as const,
      risk: 'SmartContentPipeline uses simulated AI (80KB)',
      impact: 'Spark content generation may not work with real API calls',
      mitigation: 'Verify API keys in secrets panel before Day 3 start',
      owner: 'claude' as Developer,
    },
    {
      id: 'R-003', severity: 'medium' as const,
      risk: 'Merge conflicts between Lovable and Claude branches',
      impact: 'Day 5 integration delay; broken build on main',
      mitigation: 'Strict file ownership + SHARED_CHANGELOG.md for shared resources',
      owner: 'claude' as Developer,
    },
    {
      id: 'R-004', severity: 'medium' as const,
      risk: 'Regional pricing data incomplete for all 14 regions',
      impact: 'L-202 may require data sourcing time not in estimate',
      mitigation: 'PO to provide pricing table before Day 2 AM standup',
      owner: 'lovable' as Developer,
    },
    {
      id: 'R-005', severity: 'low' as const,
      risk: 'Mobile viewports on older devices',
      impact: 'L-401 (mobile polish) may reveal deep CSS issues',
      mitigation: 'Focus on iPhone SE (375px) and Samsung Galaxy (360px) as minimum',
      owner: 'lovable' as Developer,
    },
  ];

  const severityConfig = {
    high:   { cls: 'bg-red-100 text-red-700 border-red-300',    dot: 'bg-red-500' },
    medium: { cls: 'bg-amber-100 text-amber-700 border-amber-300', dot: 'bg-amber-500' },
    low:    { cls: 'bg-blue-100 text-blue-700 border-blue-300',  dot: 'bg-blue-400' },
  };

  const devCfg = {
    claude:  { label: 'Claude',  cls: 'bg-violet-100 text-violet-700 border-violet-200' },
    lovable: { label: 'Lovable', cls: 'bg-pink-100 text-pink-700 border-pink-200' },
  } as const;

  return (
    <div className="space-y-4">
      {/* Active gate blockers */}
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
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 border border-amber-300">
                {h.from} → {h.to}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Static risk register */}
      <div className="space-y-2">
        {staticRisks.map(risk => {
          const sc = severityConfig[risk.severity];
          const dc = devCfg[risk.owner];
          return (
            <div key={risk.id} className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-muted-foreground">{risk.id}</span>
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full border', sc.cls)}>
                  {risk.severity.toUpperCase()}
                </span>
                <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border', dc.cls)}>{dc.label}</span>
              </div>
              <p className="text-xs font-semibold text-foreground">{risk.risk}</p>
              <p className="text-[10px] text-muted-foreground"><span className="font-semibold text-red-600">Impact: </span>{risk.impact}</p>
              <p className="text-[10px] text-muted-foreground"><span className="font-semibold text-green-600">Mitigation: </span>{risk.mitigation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 6. Definition of Done ────────────────────────────────────────────────────

function DefinitionOfDoneSection() {
  const dodItems = [
    { category: 'Code', items: ['All acceptance criteria met (verified by PO)', 'Code reviewed (self-review minimum; no known regressions)', 'npm run build passes with 0 errors'] },
    { category: 'Testing', items: ['E2E user flow manually verified', 'No console errors during primary user journey', 'Responsive check on mobile viewport (375px minimum)'] },
    { category: 'Handoffs', items: ['All outgoing H-xxx artifacts acknowledged by consumer', 'SHARED_CHANGELOG.md updated for any shared resource changes', 'Locked files NOT modified'] },
    { category: 'Release', items: ['PO has verified acceptance criteria', 'SM has cleared the Release Gate checklist', 'Both branches merged to main cleanly', 'Production Publish executed by PO/SM only'] },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-green-200 bg-green-50/30 px-4 py-2.5">
        <p className="text-xs font-bold text-green-800">
          A task is "Done" ONLY when ALL of the following criteria are met — not when the developer marks it complete.
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export const SprintCharterView: React.FC<SprintCharterViewProps> = ({ getTaskStatus, currentDay }) => {
  const totalTasks = SPRINT_TASKS.length;
  const doneTasks = SPRINT_TASKS.filter(t => getTaskStatus(t.id) === 'completed').length;
  const totalHours = SPRINT_TASKS.reduce((s, t) => s + t.estimatedHours, 0);

  return (
    <div className="space-y-4 pb-8">

      {/* Quick stats banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Sprint Day', value: `${currentDay} / 5`, icon: Calendar, cls: 'text-primary' },
          { label: 'Tasks Done', value: `${doneTasks} / ${totalTasks}`, icon: CheckCircle2, cls: 'text-green-600' },
          { label: 'Total Effort', value: `${totalHours}h`, icon: Timer, cls: 'text-amber-600' },
          { label: 'Active Handoffs', value: HANDOFFS.filter(h => getTaskStatus(h.producerTaskId) !== 'completed').length.toString(), icon: Link2, cls: 'text-violet-600' },
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

      {/* 1. Sprint Goal */}
      <Section icon={Target} title="1. Sprint Goal" subtitle="SMART objective for Feb 17–21, 2026" badge="SMART" iconColor="text-primary">
        <SprintGoalSection />
      </Section>

      {/* 2. Roles & Responsibilities */}
      <Section icon={Users} title="2. Roles & Responsibilities" subtitle="PO · SM · Claude (Tech Lead) · Lovable (Dev/UI)" iconColor="text-emerald-600">
        <RolesSection />
      </Section>

      {/* 3. Abbreviation Glossary */}
      <Section icon={BookOpen} title="3. Abbreviation Glossary" subtitle="L-xxx · C-xxx · S-xxx · H-xxx · PO · SM · DoD · AC · E2E · WSJF · WIP" defaultOpen={false} iconColor="text-blue-600">
        <GlossarySection />
      </Section>

      {/* 4. Capacity & Velocity */}
      <Section icon={TrendingUp} title="4. Team Capacity & Velocity" subtitle="Hours committed vs delivered · burn rate per developer" iconColor="text-amber-600">
        <CapacitySection getTaskStatus={getTaskStatus} currentDay={currentDay} />
      </Section>

      {/* 5. Definition of Done */}
      <Section icon={ShieldCheck} title="5. Definition of Done (DoD)" subtitle="A task is complete only when ALL criteria below are met" iconColor="text-green-600" badge="Non-Negotiable">
        <DefinitionOfDoneSection />
      </Section>

      {/* 6. Risks & Roadblocks */}
      <Section icon={AlertTriangle} title="6. Risks & Roadblocks" subtitle="Active gate blockers · risk register with mitigations" iconColor="text-red-500" defaultOpen={false}>
        <RisksSection getTaskStatus={getTaskStatus} />
      </Section>

      {/* 7. Note on remaining elements */}
      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-[11px] text-muted-foreground space-y-0.5">
            <p><span className="font-semibold text-foreground">Sprint Backlog (Selected Items):</span> All 41 tasks are in the Day 1–5 views with priority, AC, estimates, and file scope.</p>
            <p><span className="font-semibold text-foreground">Dependencies:</span> Full dependency chain + handoff graph in <em>Sprint Planning</em> view.</p>
            <p><span className="font-semibold text-foreground">Findings / QA:</span> All diagnosed issues with severity and fix status in <em>Findings / QA</em> view.</p>
            <p><span className="font-semibold text-foreground">Release Gate:</span> PO/SM checklist and final publish authority in <em>Release Gate</em> view.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
