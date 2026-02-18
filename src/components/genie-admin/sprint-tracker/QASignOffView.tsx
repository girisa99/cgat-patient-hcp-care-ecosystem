/**
 * QA Sign-Off View — End-of-Sprint / Pre-Next-Sprint Gate
 *
 * KEY DESIGN CHANGES:
 *  • No per-day dependency — PO/SO signs off at their own pace, never blocks dev work
 *  • Conditional / Partial sign-off — can formally sign off even if some items fail
 *  • Carry-forward register — failed items are captured and auto-appear in next sprint intake
 *  • Sprint-level final sign-off gate (replaces daily gates)
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2, Clock, AlertTriangle, FlaskConical, ClipboardCheck,
  ChevronDown, ChevronRight, Unlock, Info, Shield, FileMinus2,
  PackagePlus, CalendarClock, RotateCcw, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRINT_TASKS } from './data-tasks';
import type { TaskStatus } from './types';

const STORAGE_KEY   = 'genie_qa_signoff_v3';
const NOTES_KEY     = 'genie_qa_signoff_notes_v3';
const CARRYOVER_KEY = 'genie_qa_carryover_v3';
const SIGNOFF_KEY   = 'genie_qa_sprint_signoff_v3';

// ─── QA test cases ────────────────────────────────────────────────────────────

interface QATestItem {
  id: string;
  day: number;
  taskId: string;
  title: string;
  steps: string;
  expectedResult: string;
  module: string;
  developer: 'claude' | 'lovable';
  severity: 'critical' | 'high' | 'medium';
}

const QA_TESTS: QATestItem[] = [
  // ── Day 1 ──
  { id: 'QA-101', day: 1, taskId: 'L-101', title: 'Regional landing page renders all regions', steps: 'Open landing page → click each of 14 region flags → check no console errors', expectedResult: 'All regions switch without blank content or JS errors', module: 'Landing', developer: 'lovable', severity: 'high' },
  { id: 'QA-102', day: 1, taskId: 'L-102', title: 'Explore journey completes all steps', steps: 'Go to /explore → progress through each step of the Genie Explore journey', expectedResult: 'All steps load and advance without errors', module: 'Explore', developer: 'lovable', severity: 'high' },
  { id: 'QA-103', day: 1, taskId: 'L-103', title: 'Hero video and interactive elements respond', steps: 'Open landing page → check hero video plays → interact with hero demo elements', expectedResult: 'Video loads and plays, interactive elements respond to clicks', module: 'Landing', developer: 'lovable', severity: 'medium' },
  { id: 'QA-104', day: 1, taskId: 'L-104', title: 'All 6 legal pages load with correct email', steps: 'Visit Terms, Privacy, Cookie Policy, Refund, Acceptable Use, GDPR pages', expectedResult: 'All 6 pages load, support email shows support@geniaisuite.com', module: 'Legal', developer: 'lovable', severity: 'medium' },
  { id: 'QA-105', day: 1, taskId: 'C-101', title: 'GenieSpark diagnosis documented', steps: "Review Claude's findings in Day 1 sprint standup / diagnosis notes", expectedResult: '14 issues identified with root causes and fix plan', module: 'Genie Spark', developer: 'claude', severity: 'high' },
  { id: 'QA-106', day: 1, taskId: 'C-102', title: 'GenieMind diagnosis documented', steps: "Review Claude's findings for Mind module", expectedResult: '13 issues documented', module: 'Genie Mind', developer: 'claude', severity: 'high' },
  { id: 'QA-107', day: 1, taskId: 'C-103', title: 'GenieDeck diagnosis documented', steps: "Review Claude's findings for Deck module", expectedResult: '6 issues documented, Deck confirmed most production-ready', module: 'Genie Deck', developer: 'claude', severity: 'high' },
  { id: 'QA-108', day: 1, taskId: 'S-101', title: 'Build passes on both branches', steps: 'Check build logs — both claude and lovable branches should be green', expectedResult: 'npm run build exits 0 on both branches', module: 'CI/CD', developer: 'claude', severity: 'critical' },

  // ── Day 2 ──
  { id: 'QA-201', day: 2, taskId: 'C-201', title: 'Deck PresentationWizard creates presentations', steps: 'Go to /genie-deck → start wizard → fill all steps → generate slides', expectedResult: 'Presentation generates and shows slides without errors', module: 'Genie Deck', developer: 'claude', severity: 'critical' },
  { id: 'QA-202', day: 2, taskId: 'C-202', title: 'All 6 Deck wizard steps complete', steps: 'Walk through each of the 6 wizard steps in /genie-deck', expectedResult: 'Each step advances cleanly — no stuck states or console errors', module: 'Genie Deck', developer: 'claude', severity: 'high' },
  { id: 'QA-203', day: 2, taskId: 'C-203', title: 'Deck end-to-end: input → slides → preview → save', steps: 'Full flow: Enter topic → generate → preview slides → save presentation', expectedResult: 'Presentation saved and retrievable from My Presentations', module: 'Genie Deck', developer: 'claude', severity: 'critical' },
  { id: 'QA-204', day: 2, taskId: 'L-201', title: 'Product catalog shows all 3 products', steps: 'Visit /products → check Spark, Mind, Deck cards show correct info', expectedResult: 'All 3 products render with correct names, descriptions, CTAs', module: 'Products', developer: 'lovable', severity: 'high' },
  { id: 'QA-205', day: 2, taskId: 'L-202', title: 'Pricing tiers display correctly', steps: 'Check pricing section — tiers match: free/starter/creator/pro/business/enterprise', expectedResult: 'Tier names match genieStudioNavItems.ts exactly', module: 'Pricing', developer: 'lovable', severity: 'high' },
  { id: 'QA-206', day: 2, taskId: 'L-203', title: 'Explore demo pages complete without errors', steps: 'Visit /explore-demo, progress through demo flows', expectedResult: 'No JS errors, all demo steps reachable', module: 'Explore', developer: 'lovable', severity: 'medium' },
  { id: 'QA-207', day: 2, taskId: 'L-204', title: 'Missing landing sections now present', steps: 'Scroll landing page top-to-bottom, check no missing section placeholders', expectedResult: 'All planned sections render with real content', module: 'Landing', developer: 'lovable', severity: 'medium' },
  { id: 'QA-208', day: 2, taskId: 'S-201', title: 'Day 2 build passes — Deck working', steps: 'Check build logs for Day 2 sync task', expectedResult: 'Build green, /genie-deck functional', module: 'CI/CD', developer: 'claude', severity: 'critical' },

  // ── Day 3 ──
  { id: 'QA-301', day: 3, taskId: 'C-301', title: 'SmartContentPipeline generates content', steps: 'Go to /genie-spark → enter topic → trigger AI generation', expectedResult: 'Script content generates from prompt, no empty output', module: 'Genie Spark', developer: 'claude', severity: 'critical' },
  { id: 'QA-302', day: 3, taskId: 'C-302', title: 'SparkGuidedWizard all steps complete', steps: 'Walk through guided wizard in Spark from step 1 to final step', expectedResult: 'Each wizard step advances, no stuck or skipped steps', module: 'Genie Spark', developer: 'claude', severity: 'high' },
  { id: 'QA-303', day: 3, taskId: 'C-303', title: 'Script saves to Supabase', steps: 'Generate a script in Spark → click Save → verify it appears in saved list', expectedResult: 'Script persists to genie_scripts table, reloads on next visit', module: 'Genie Spark', developer: 'claude', severity: 'critical' },
  { id: 'QA-304', day: 3, taskId: 'C-304', title: 'Spark end-to-end: prompt → generate → save', steps: 'Full flow: Enter prompt → generate → review → save script', expectedResult: 'Entire Spark workflow completes in one session', module: 'Genie Spark', developer: 'claude', severity: 'critical' },
  { id: 'QA-305', day: 3, taskId: 'L-301', title: 'Interactive demos respond to user input', steps: 'Test STT demo (speak or type), test Try Genie interactive demo', expectedResult: 'Demos respond and show output within 3s', module: 'Landing', developer: 'lovable', severity: 'high' },
  { id: 'QA-306', day: 3, taskId: 'L-302', title: 'DeepL translation demo works', steps: 'Type text in translation demo, select language, check output', expectedResult: 'Translation result appears with correct language', module: 'Landing', developer: 'lovable', severity: 'medium' },
  { id: 'QA-307', day: 3, taskId: 'L-303', title: 'Video showcases play correctly', steps: 'Open landing page → play GenieVideoShowcase and HeroLandingVideo', expectedResult: 'Both videos load and play without errors', module: 'Landing', developer: 'lovable', severity: 'high' },
  { id: 'QA-308', day: 3, taskId: 'L-304', title: 'All 14 regions switch content correctly', steps: 'Click each region in RegionSwitcherNav — verify content changes', expectedResult: 'Each of 14 regions loads distinct regional content', module: 'Landing', developer: 'lovable', severity: 'medium' },

  // ── Day 4 ──
  { id: 'QA-401', day: 4, taskId: 'C-401', title: 'GenieMind knowledge base returns answers', steps: 'Go to /genie-mind → ask a question → verify AI responds from KB', expectedResult: 'Answer is contextually relevant, not hallucinated', module: 'Genie Mind', developer: 'claude', severity: 'critical' },
  { id: 'QA-402', day: 4, taskId: 'C-402', title: 'Mind conversation history persists', steps: 'Start a Mind conversation → close tab → reopen → history present', expectedResult: 'Previous messages visible on revisit', module: 'Genie Mind', developer: 'claude', severity: 'high' },
  { id: 'QA-403', day: 4, taskId: 'L-401', title: 'Landing polish — no broken layouts', steps: 'View landing page on mobile + desktop, check spacing and responsiveness', expectedResult: 'No overflow, clipping, or z-index issues on either viewport', module: 'Landing', developer: 'lovable', severity: 'high' },

  // ── Day 5 ──
  { id: 'QA-501', day: 5, taskId: 'S-501', title: 'Merge: Lovable rebases onto Claude cleanly', steps: 'Check CI/CD for merge conflicts and build result after merge', expectedResult: 'Zero merge conflicts, build passes post-merge', module: 'CI/CD', developer: 'claude', severity: 'critical' },
  { id: 'QA-502', day: 5, taskId: 'S-501', title: 'All 3 products functional on merged branch', steps: 'Test /genie-spark, /genie-mind, /genie-deck on the merged branch', expectedResult: 'Each product core flow works end-to-end', module: 'All Products', developer: 'claude', severity: 'critical' },
  { id: 'QA-503', day: 5, taskId: 'S-501', title: 'Landing + Studio nav links all correct', steps: 'Click every nav link on landing + inside Genie Studio', expectedResult: 'No 404s, no broken routes', module: 'Navigation', developer: 'lovable', severity: 'high' },
];

// ─── Carry-forward item ───────────────────────────────────────────────────────

interface CarryForwardItem {
  qaId: string;
  title: string;
  module: string;
  severity: 'critical' | 'high' | 'medium';
  day: number;
  reason: string;  // PO notes why it failed / was deferred
  addedAt: string;
}

// ─── Sprint sign-off record ───────────────────────────────────────────────────

interface SprintSignOff {
  signedAt: string;
  signedBy: string;
  mode: 'full' | 'conditional';
  passingCount: number;
  failingCount: number;
  carryForwardCount: number;
  overallNote: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeverityBadge({ s }: { s: 'critical' | 'high' | 'medium' }) {
  return (
    <span className={cn(
      'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase',
      s === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
      s === 'high'     ? 'bg-orange-50 text-orange-700 border-orange-200' :
                         'bg-yellow-50 text-yellow-700 border-yellow-200',
    )}>{s}</span>
  );
}

function DayPillBar({
  selectedDay, setSelectedDay, checked, signedDays, currentDay,
}: {
  selectedDay: number;
  setSelectedDay: (d: number) => void;
  checked: Record<string, boolean>;
  signedDays: Record<number, boolean>;
  currentDay: number;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      {([1, 2, 3, 4, 5] as const).map(d => {
        const tests  = QA_TESTS.filter(t => t.day === d);
        const done   = tests.filter(t => checked[t.id]).length;
        const signed = signedDays[d];
        const future = d > currentDay; // grey out days not yet started
        return (
          <button
            key={d}
            onClick={() => !future && setSelectedDay(d)}
            disabled={future}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5',
              selectedDay === d
                ? 'bg-primary text-primary-foreground border-primary'
                : future
                  ? 'bg-muted/40 text-muted-foreground/50 border-transparent cursor-not-allowed opacity-50'
                  : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80',
            )}
          >
            {signed && <CheckCircle2 className="w-3 h-3" />}
            Day {d}
            {!future && <span className="opacity-70">({done}/{tests.length})</span>}
            {future && <span className="opacity-40">(not started)</span>}
          </button>
        );
      })}
    </div>
  );
}

function TestRow({
  test, checked, taskStatus, isCarryForward, onToggle, onMarkCarryForward,
}: {
  test: QATestItem;
  checked: boolean;
  taskStatus: TaskStatus;
  isCarryForward: boolean;
  onToggle: () => void;
  onMarkCarryForward: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const taskDone = taskStatus === 'completed';

  return (
    <div className={cn(
      'rounded border transition-colors',
      checked          ? 'bg-green-50/60 border-green-200' :
      isCarryForward   ? 'bg-amber-50/50 border-amber-200' :
      taskDone         ? 'bg-card border-border' :
                         'bg-muted/20 border-border/50',
    )}>
      <div className="flex items-start gap-3 px-3 py-2.5">
        <Checkbox checked={checked} onCheckedChange={onToggle} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground">{test.id}</span>
            <SeverityBadge s={test.severity} />
            <span className={cn(
              'text-[9px] font-semibold px-1.5 py-0.5 rounded border',
              test.developer === 'lovable' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-violet-50 text-violet-700 border-violet-200',
            )}>{test.developer === 'lovable' ? '⚡ Lovable' : '🧠 Claude'}</span>
            <span className="text-[9px] text-muted-foreground px-1 rounded bg-muted">{test.module}</span>
            <span className={cn(
              'text-[9px] font-semibold px-1.5 py-0.5 rounded border flex items-center gap-1',
              taskDone ? 'bg-green-50 text-green-700 border-green-200' :
              taskStatus === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-muted text-muted-foreground border-border',
            )}>
              {taskDone ? '✓ ' : taskStatus === 'in-progress' ? '⚙ ' : '○ '}{test.taskId} {taskStatus}
            </span>
            {isCarryForward && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300 flex items-center gap-1">
                <PackagePlus className="w-2.5 h-2.5" /> Carry-forward
              </span>
            )}
          </div>
          <p className={cn('text-xs font-medium mt-1', checked && 'line-through text-muted-foreground')}>{test.title}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!checked && !isCarryForward && (
            <button
              title="Mark as carry-forward to next sprint"
              onClick={onMarkCarryForward}
              className="w-6 h-6 rounded flex items-center justify-center text-amber-500 hover:bg-amber-50 border border-amber-200 transition-colors"
            >
              <PackagePlus className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setExpanded(o => !o)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors"
          >
            {expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border/40">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-2">Steps</p>
            <p className="text-xs text-foreground mt-0.5">{test.steps}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Expected Result</p>
            <p className="text-xs text-foreground mt-0.5">{test.expectedResult}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Carry-forward panel ──────────────────────────────────────────────────────

function CarryForwardPanel({
  items, onRemove,
}: {
  items: CarryForwardItem[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <PackagePlus className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-bold text-amber-800">
          Carry-Forward Register — {items.length} item{items.length > 1 ? 's' : ''} → Next Sprint
        </span>
        <Badge className="bg-amber-200 text-amber-800 border-amber-400 text-[10px]">Will appear in next sprint intake</Badge>
      </div>
      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.qaId} className="flex items-start gap-2 text-xs bg-white rounded border border-amber-200 px-3 py-2">
            <SeverityBadge s={item.severity} />
            <span className="font-mono text-muted-foreground w-14 shrink-0">{item.qaId}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{item.title}</p>
              {item.reason && <p className="text-muted-foreground mt-0.5 italic">{item.reason}</p>}
            </div>
            <span className="text-muted-foreground shrink-0 text-[10px]">Day {item.day}</span>
            <button
              onClick={() => onRemove(item.qaId)}
              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              title="Remove from carry-forward"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-amber-700 italic">
        These items will NOT block this sprint's sign-off but must be addressed in the next cycle's Day 1 planning.
      </p>
    </div>
  );
}

// ─── Sprint-level sign-off panel ─────────────────────────────────────────────

function SprintSignOffPanel({
  allTests, checked, carryForward, sprintSignOff, onSignOff, onRevoke,
}: {
  allTests: QATestItem[];
  checked: Record<string, boolean>;
  carryForward: CarryForwardItem[];
  sprintSignOff: SprintSignOff | null;
  onSignOff: (mode: 'full' | 'conditional', note: string, signedBy: string) => void;
  onRevoke: () => void;
}) {
  const [note, setNote] = useState(sprintSignOff?.overallNote ?? '');
  const [signedBy, setSignedBy] = useState(sprintSignOff?.signedBy ?? '');
  const [open, setOpen] = useState(!sprintSignOff);

  const passing    = allTests.filter(t => checked[t.id]).length;
  const failing    = allTests.filter(t => !checked[t.id] && !carryForward.find(c => c.qaId === t.id)).length;
  const cfCount    = carryForward.length;
  const critFail   = allTests.filter(t => t.severity === 'critical' && !checked[t.id] && !carryForward.find(c => c.qaId === t.id)).length;
  const canFull    = failing === 0 && cfCount === 0;
  const canConditional = passing > 0 && critFail === 0; // no unresolved criticals

  if (sprintSignOff) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-green-800">
              Sprint Signed Off — {sprintSignOff.mode === 'conditional' ? 'Conditional ✓' : 'Full ✓'}
            </span>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-200 text-green-800">{sprintSignOff.passingCount} passed</Badge>
            {sprintSignOff.carryForwardCount > 0 && <Badge className="bg-amber-200 text-amber-800">{sprintSignOff.carryForwardCount} carry-forward</Badge>}
            {sprintSignOff.failingCount > 0 && <Badge className="bg-red-100 text-red-700">{sprintSignOff.failingCount} unresolved</Badge>}
          </div>
        </div>
        <div className="text-xs text-green-800 space-y-0.5">
          <p><span className="font-semibold">Signed by:</span> {sprintSignOff.signedBy}</p>
          <p><span className="font-semibold">Signed at:</span> {new Date(sprintSignOff.signedAt).toLocaleString()}</p>
          {sprintSignOff.overallNote && <p className="italic mt-1">{sprintSignOff.overallNote}</p>}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-amber-600 border-amber-300"
          onClick={onRevoke}>
          <RotateCcw className="w-3 h-3" /> Revoke Sprint Sign-off
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-primary" />
        <span className="text-sm font-bold">Sprint Sign-off Gate</span>
        <Badge variant="outline" className="text-xs">End-of-sprint · non-blocking for dev work</Badge>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
          <p className="text-lg font-bold text-green-700">{passing}</p>
          <p className="text-[10px] text-green-600 font-semibold">Verified ✓</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
          <p className="text-lg font-bold text-amber-700">{cfCount}</p>
          <p className="text-[10px] text-amber-600 font-semibold">Carry-forward →</p>
        </div>
        <div className={cn('rounded-lg border p-3 text-center', critFail > 0 ? 'border-red-200 bg-red-50' : 'border-border bg-muted/30')}>
          <p className={cn('text-lg font-bold', critFail > 0 ? 'text-red-700' : 'text-muted-foreground')}>{failing}</p>
          <p className="text-[10px] text-muted-foreground font-semibold">Unresolved</p>
        </div>
      </div>

      {critFail > 0 && (
        <div className="flex gap-2 items-start rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>{critFail} critical item{critFail > 1 ? 's' : ''}</strong> not verified and not marked carry-forward.
            Please either verify them or mark them carry-forward before signing off conditionally.
          </span>
        </div>
      )}

      {/* Sign-off form */}
      {open && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signed by (PO/SM name)</label>
            <input
              className="w-full text-sm border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Your name..."
              value={signedBy}
              onChange={e => setSignedBy(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Sprint Sign-off Notes
            </label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Overall sprint quality notes, known exceptions, conditions for next sprint..."
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              className="h-9 text-xs gap-2 bg-green-600 hover:bg-green-700"
              disabled={!canFull || !signedBy.trim()}
              onClick={() => onSignOff('full', note, signedBy)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Full Sign-off ({allTests.length}/{allTests.length} passed)
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs gap-2 border-amber-400 text-amber-700 hover:bg-amber-50"
              disabled={!canConditional || !signedBy.trim()}
              onClick={() => onSignOff('conditional', note, signedBy)}
            >
              <FileMinus2 className="w-3.5 h-3.5" />
              Conditional Sign-off ({passing} passed · {cfCount} carry-forward)
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            <strong>Full:</strong> all tests verified, nothing carry-forward. &nbsp;
            <strong>Conditional:</strong> some items deferred to next sprint — no unresolved criticals allowed.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface QASignOffViewProps {
  getTaskStatus: (id: string) => TaskStatus;
  currentDay: number;
}

export const QASignOffView: React.FC<QASignOffViewProps> = ({ getTaskStatus, currentDay }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [notes, setNotes] = useState<Record<number, string>>(() => {
    try { const s = localStorage.getItem(NOTES_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [signedDays] = useState<Record<number, boolean>>({});  // kept for day pill display only
  const [carryForward, setCarryForward] = useState<CarryForwardItem[]>(() => {
    try { const s = localStorage.getItem(CARRYOVER_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [sprintSignOff, setSprintSignOff] = useState<SprintSignOff | null>(() => {
    try { const s = localStorage.getItem(SIGNOFF_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [carryReasonMap, setCarryReasonMap] = useState<Record<string, string>>({});

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [devFilter, setDevFilter] = useState<'all' | 'claude' | 'lovable'>('all');
  const [sevFilter, setSevFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [activePanel, setActivePanel] = useState<'tests' | 'carryforward' | 'signoff'>('tests');

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // If now verified, remove from carry-forward
      if (next[id]) {
        setCarryForward(cf => {
          const filtered = cf.filter(c => c.qaId !== id);
          localStorage.setItem(CARRYOVER_KEY, JSON.stringify(filtered));
          return filtered;
        });
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markAllShown = (tests: QATestItem[], value: boolean) => {
    setChecked(prev => {
      const next = { ...prev };
      tests.forEach(t => { next[t.id] = value; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markCarryForward = (test: QATestItem) => {
    const reason = carryReasonMap[test.id] ?? '';
    setCarryForward(prev => {
      if (prev.find(c => c.qaId === test.id)) return prev;
      const next = [...prev, {
        qaId: test.id, title: test.title, module: test.module,
        severity: test.severity, day: test.day,
        reason, addedAt: new Date().toISOString(),
      }];
      localStorage.setItem(CARRYOVER_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeCarryForward = (qaId: string) => {
    setCarryForward(prev => {
      const next = prev.filter(c => c.qaId !== qaId);
      localStorage.setItem(CARRYOVER_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSprintSignOff = (mode: 'full' | 'conditional', note: string, signedBy: string) => {
    const allTests = QA_TESTS;
    const record: SprintSignOff = {
      signedAt: new Date().toISOString(),
      signedBy,
      mode,
      passingCount: allTests.filter(t => checked[t.id]).length,
      failingCount: allTests.filter(t => !checked[t.id] && !carryForward.find(c => c.qaId === t.id)).length,
      carryForwardCount: carryForward.length,
      overallNote: note,
    };
    localStorage.setItem(SIGNOFF_KEY, JSON.stringify(record));
    setSprintSignOff(record);
  };

  const revokeSprintSignOff = () => {
    localStorage.removeItem(SIGNOFF_KEY);
    setSprintSignOff(null);
  };

  const updateNote = (day: number, val: string) => {
    setNotes(prev => {
      const next = { ...prev, [day]: val };
      localStorage.setItem(NOTES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const dayTests      = QA_TESTS.filter(t => t.day === selectedDay);
  const filteredTests = dayTests.filter(t => {
    if (devFilter !== 'all' && t.developer !== devFilter) return false;
    if (sevFilter  !== 'all' && t.severity  !== sevFilter)  return false;
    return true;
  });

  const allDone     = dayTests.every(t => checked[t.id]);
  const dayPassing  = dayTests.filter(t => checked[t.id]).length;
  const dayPct      = dayTests.length > 0 ? Math.round(dayPassing / dayTests.length * 100) : 0;

  // Sprint-wide totals (for top strip)
  const sprintPassing  = QA_TESTS.filter(t => checked[t.id]).length;
  const sprintTotal    = QA_TESTS.length;
  const sprintPct      = Math.round(sprintPassing / sprintTotal * 100);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <FlaskConical className="w-5 h-5 text-primary shrink-0" />
        <span className="text-sm font-bold">Testing & QA Sign-off</span>
        <Badge variant="outline" className="text-xs gap-1">
          <Info className="w-3 h-3" /> Non-blocking — sign off at your own pace, never gates dev work
        </Badge>
        {sprintSignOff && (
          <Badge className={cn('text-xs gap-1', sprintSignOff.mode === 'full' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white')}>
            {sprintSignOff.mode === 'full' ? '✅ Sprint Signed Off (Full)' : '⚡ Sprint Signed Off (Conditional)'}
          </Badge>
        )}
      </div>

      {/* ── Sprint-wide progress strip ── */}
      <div className="rounded-lg border bg-card p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground uppercase tracking-wide">Sprint-wide QA Progress</span>
          <span className="font-bold">{sprintPassing}/{sprintTotal} tests verified · {carryForward.length} carry-forward</span>
        </div>
        <Progress value={sprintPct} className={cn('h-2.5', sprintPct === 100 && '[&>div]:bg-green-500')} />
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span className="text-green-600 font-semibold">✓ {sprintPassing} verified</span>
          <span className="text-amber-600 font-semibold">→ {carryForward.length} carry-forward</span>
          <span>{sprintTotal - sprintPassing - carryForward.length} unresolved</span>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 flex gap-2 items-start text-xs text-blue-900">
        <Shield className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
        <div>
          <p className="font-semibold">How this works</p>
          <p className="mt-0.5 text-blue-800">
            Verify tests day-by-day at your own pace. Failed items can be <strong>marked carry-forward</strong> (deferred to next sprint) — they won't block sign-off.
            A <strong>Conditional Sign-off</strong> is available once all criticals are either verified or carry-forwarded.
            <strong> Dev work is never blocked</strong> by this gate.
          </p>
        </div>
      </div>

      {/* ── Panel switcher ── */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {(['tests', 'carryforward', 'signoff'] as const).map(panel => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={cn(
              'flex-1 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5',
              activePanel === panel ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {panel === 'tests'       && <><FlaskConical className="w-3.5 h-3.5" /> Tests by Day</>}
            {panel === 'carryforward' && <><PackagePlus  className="w-3.5 h-3.5" /> Carry-Forward {carryForward.length > 0 && `(${carryForward.length})`}</>}
            {panel === 'signoff'     && <><CalendarClock className="w-3.5 h-3.5" /> Sprint Sign-off</>}
          </button>
        ))}
      </div>

      {/* ════ PANEL: TESTS ════ */}
      {activePanel === 'tests' && (
        <div className="space-y-4">
          {/* Day pills */}
          <DayPillBar
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            checked={checked}
            signedDays={signedDays}
            currentDay={currentDay}
          />

          {/* Day progress */}
          <div className={cn(
            'rounded-lg border p-3 space-y-2',
            allDone ? 'bg-green-50 border-green-300' : dayPct > 0 ? 'bg-blue-50/30 border-blue-200' : 'bg-card border-border',
          )}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Day {selectedDay} — {dayPassing}/{dayTests.length} verified</span>
              <Badge className={cn('font-bold', dayPct === 100 ? 'bg-green-100 text-green-700' : 'bg-muted text-foreground')}>{dayPct}%</Badge>
            </div>
            <Progress value={dayPct} className={cn('h-2', dayPct === 100 && '[&>div]:bg-green-500')} />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-muted-foreground">Filter:</span>
            {(['all', 'claude', 'lovable'] as const).map(f => (
              <button key={f} onClick={() => setDevFilter(f)}
                className={cn('px-2 py-1 rounded text-xs border transition-colors',
                  devFilter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80')}>
                {f === 'all' ? 'All' : f === 'lovable' ? '⚡ Lovable' : '🧠 Claude'}
              </button>
            ))}
            <Separator orientation="vertical" className="h-4" />
            {(['all', 'critical', 'high', 'medium'] as const).map(s => (
              <button key={s} onClick={() => setSevFilter(s)}
                className={cn('px-2 py-1 rounded text-xs border transition-colors',
                  sevFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80')}>
                {s === 'all' ? 'All severity' : s}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">{filteredTests.length}/{dayTests.length}</span>
          </div>

          {/* Bulk */}
          <div className="flex gap-2 flex-wrap items-center">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => markAllShown(filteredTests, true)}>
              <CheckCircle2 className="w-3 h-3" /> Mark all shown ✓
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => markAllShown(filteredTests, false)}>
              Uncheck all shown
            </Button>
            <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
              <PackagePlus className="w-3 h-3 text-amber-500" /> Click orange icon on any row to carry-forward to next sprint
            </span>
          </div>

          {/* Test list */}
          <div className="space-y-2">
            {filteredTests.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No tests match current filters.</p>
            )}
            {filteredTests.map(test => (
              <TestRow
                key={test.id}
                test={test}
                checked={checked[test.id] ?? false}
                taskStatus={getTaskStatus(test.taskId)}
                isCarryForward={!!carryForward.find(c => c.qaId === test.id)}
                onToggle={() => toggle(test.id)}
                onMarkCarryForward={() => markCarryForward(test)}
              />
            ))}
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" /> PO/SO Notes — Day {selectedDay}
            </p>
            <Textarea
              value={notes[selectedDay] ?? ''}
              onChange={e => updateNote(selectedDay, e.target.value)}
              placeholder={`Issues found, deferred items, follow-up actions for Day ${selectedDay} QA...`}
              rows={3}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">Auto-saved to browser.</p>
          </div>
        </div>
      )}

      {/* ════ PANEL: CARRY-FORWARD ════ */}
      {activePanel === 'carryforward' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 text-xs text-blue-900 flex gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Items here are <strong>officially deferred</strong> to the next sprint cycle. They will appear in Day 1 planning as pre-existing issues. They do NOT block this sprint's conditional sign-off (provided no unresolved criticals remain).</p>
          </div>

          {carryForward.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <PackagePlus className="w-10 h-10 opacity-30" />
              <p className="text-sm">No carry-forward items yet.</p>
              <p className="text-xs">Go to the Tests tab and click the <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-amber-700 text-[10px]"><PackagePlus className="w-2.5 h-2.5" /> icon</span> on any failed test.</p>
            </div>
          ) : (
            <CarryForwardPanel items={carryForward} onRemove={removeCarryForward} />
          )}

          {carryForward.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold">Next Sprint Intake Checklist Preview:</p>
              {carryForward.map(item => (
                <p key={item.qaId} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="font-mono text-[10px]">{item.qaId}</span>
                  <span>{item.title}</span>
                  <Badge className="text-[9px] ml-auto">{item.module}</Badge>
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════ PANEL: SPRINT SIGN-OFF ════ */}
      {activePanel === 'signoff' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 text-xs text-blue-900 flex gap-2">
            <Shield className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <p className="font-semibold">Sprint Sign-off — End of Week / Pre-Next-Sprint</p>
              <p className="mt-0.5">This gate is only required <strong>before starting the next sprint</strong>. Dev work is <strong>never blocked</strong> by this gate. You can do a <strong>Full Sign-off</strong> (everything verified) or a <strong>Conditional Sign-off</strong> (some items carry-forward, no unresolved criticals).</p>
            </div>
          </div>

          <SprintSignOffPanel
            allTests={QA_TESTS}
            checked={checked}
            carryForward={carryForward}
            sprintSignOff={sprintSignOff}
            onSignOff={handleSprintSignOff}
            onRevoke={revokeSprintSignOff}
          />

          {sprintSignOff && carryForward.length > 0 && (
            <CarryForwardPanel items={carryForward} onRemove={removeCarryForward} />
          )}
        </div>
      )}

    </div>
  );
};
