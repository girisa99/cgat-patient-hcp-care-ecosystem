/**
 * QA Sign-Off View — Day-by-day testing checklist for PO/SO
 *
 * NON-BLOCKING: Completing sign-off here is NOT required to start the next day.
 * It is an async quality gate for PO/SO to formally acknowledge fixes.
 *
 * Auto-updates: Task statuses from the board feed into sign-off readiness.
 * Manual action: PO/SO must explicitly tick each test to sign off.
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
  ChevronDown, ChevronRight, Lock, Unlock, Info, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRINT_TASKS } from './data-tasks';
import type { TaskStatus } from './types';

const STORAGE_KEY = 'genie_qa_signoff_v1';
const NOTES_KEY = 'genie_qa_signoff_notes_v1';

// ─── QA test cases derived from sprint tasks ──────────────────────────────────

interface QATestItem {
  id: string;         // e.g. QA-101
  day: number;
  taskId: string;     // links back to sprint task
  title: string;      // what to test
  steps: string;      // how to verify
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
  { id: 'QA-105', day: 1, taskId: 'C-101', title: 'GenieSpark diagnosis documented', steps: 'Review Claude\'s findings in Day 1 sprint standup / diagnosis notes', expectedResult: '14 issues identified with root causes and fix plan', module: 'Genie Spark', developer: 'claude', severity: 'high' },
  { id: 'QA-106', day: 1, taskId: 'C-102', title: 'GenieMind diagnosis documented', steps: 'Review Claude\'s findings for Mind module', expectedResult: '13 issues documented', module: 'Genie Mind', developer: 'claude', severity: 'high' },
  { id: 'QA-107', day: 1, taskId: 'C-103', title: 'GenieDeck diagnosis documented', steps: 'Review Claude\'s findings for Deck module', expectedResult: '6 issues documented, Deck confirmed most production-ready', module: 'Genie Deck', developer: 'claude', severity: 'high' },
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
];

// ─── Sign-off status banner ────────────────────────────────────────────────────

function DayBanner({ day, tests, checked, isSigned }: {
  day: number; tests: QATestItem[]; checked: Record<string, boolean>; isSigned: boolean;
}) {
  const done = tests.filter(t => checked[t.id]).length;
  const pct = tests.length > 0 ? Math.round(done / tests.length * 100) : 0;
  const critical = tests.filter(t => t.severity === 'critical');
  const criticalDone = critical.filter(t => checked[t.id]).length;

  return (
    <div className={cn(
      'rounded-lg border p-4 space-y-2.5',
      isSigned ? 'bg-green-50 border-green-300' : pct > 0 ? 'bg-blue-50/40 border-blue-200' : 'bg-card border-border',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSigned
            ? <CheckCircle2 className="w-4 h-4 text-green-600" />
            : <FlaskConical className="w-4 h-4 text-blue-600" />}
          <span className="text-sm font-bold">Day {day} QA — {done}/{tests.length} tests signed off</span>
        </div>
        <Badge className={cn(
          'font-bold',
          pct === 100 ? 'bg-green-100 text-green-700 border-green-300' :
          pct > 50 ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-muted text-foreground',
        )}>
          {pct}%
        </Badge>
      </div>
      <Progress value={pct} className={cn('h-2', pct === 100 && '[&>div]:bg-green-500')} />
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          Critical: {criticalDone}/{critical.length}
        </span>
        <span className="flex items-center gap-1">
          {isSigned ? <Unlock className="w-3 h-3 text-green-600" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
          {isSigned ? 'Signed off ✓' : 'Not yet signed off'}
        </span>
        <span className="ml-auto text-[10px] italic text-muted-foreground">Non-blocking — next day can proceed independently</span>
      </div>
    </div>
  );
}

// ─── Test row ─────────────────────────────────────────────────────────────────

function TestRow({ test, checked, taskStatus, onToggle }: {
  test: QATestItem;
  checked: boolean;
  taskStatus: TaskStatus;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const taskDone = taskStatus === 'completed';

  return (
    <div className={cn(
      'rounded border transition-colors',
      checked ? 'bg-green-50/60 border-green-200' : taskDone ? 'bg-card border-border' : 'bg-muted/20 border-border/50',
    )}>
      <div className="flex items-start gap-3 px-3 py-2.5">
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          disabled={false} // always allow manual sign-off
          className="mt-0.5 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground">{test.id}</span>
            <span className={cn(
              'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase',
              test.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
              test.severity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
              'bg-yellow-50 text-yellow-700 border-yellow-200',
            )}>{test.severity}</span>
            <span className={cn(
              'text-[9px] font-semibold px-1.5 py-0.5 rounded border',
              test.developer === 'lovable' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-violet-50 text-violet-700 border-violet-200',
            )}>{test.developer === 'lovable' ? '⚡ Lovable' : '🧠 Claude'}</span>
            <span className="text-[9px] text-muted-foreground px-1 rounded bg-muted">{test.module}</span>
            {/* Task status live feed */}
            <span className={cn(
              'text-[9px] font-semibold px-1.5 py-0.5 rounded border flex items-center gap-1',
              taskDone ? 'bg-green-50 text-green-700 border-green-200' :
              taskStatus === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-muted text-muted-foreground border-border',
            )}>
              {taskDone ? '✓ ' : taskStatus === 'in-progress' ? '⚙ ' : '○ '}
              {test.taskId} {taskStatus}
            </span>
          </div>
          <p className={cn('text-xs font-medium mt-1', checked && 'line-through text-muted-foreground')}>{test.title}</p>
        </div>

        <button
          onClick={() => setExpanded(o => !o)}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors"
        >
          {expanded
            ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border/40 mt-0">
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

// ─── Main Component ────────────────────────────────────────────────────────────

interface QASignOffViewProps {
  getTaskStatus: (id: string) => TaskStatus;
}

export const QASignOffView: React.FC<QASignOffViewProps> = ({ getTaskStatus }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });

  const [notes, setNotes] = useState<Record<number, string>>(() => {
    try { const s = localStorage.getItem(NOTES_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });

  const [signedDays, setSignedDays] = useState<Record<number, boolean>>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY + '_signed'); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });

  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3>(1);
  const [devFilter, setDevFilter] = useState<'all' | 'claude' | 'lovable'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markAll = (tests: QATestItem[], value: boolean) => {
    setChecked(prev => {
      const next = { ...prev };
      tests.forEach(t => { next[t.id] = value; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const signOffDay = (day: number, tests: QATestItem[]) => {
    const allCriticalDone = tests.filter(t => t.severity === 'critical').every(t => checked[t.id]);
    if (!allCriticalDone) {
      alert('Please sign off all CRITICAL tests before officially signing off the day.');
      return;
    }
    setSignedDays(prev => {
      const next = { ...prev, [day]: true };
      localStorage.setItem(STORAGE_KEY + '_signed', JSON.stringify(next));
      return next;
    });
  };

  const revokeSignOff = (day: number) => {
    setSignedDays(prev => {
      const next = { ...prev, [day]: false };
      localStorage.setItem(STORAGE_KEY + '_signed', JSON.stringify(next));
      return next;
    });
  };

  const updateNote = (day: number, val: string) => {
    setNotes(prev => {
      const next = { ...prev, [day]: val };
      localStorage.setItem(NOTES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const dayTests = QA_TESTS.filter(t => t.day === selectedDay);
  const filteredTests = dayTests.filter(t => {
    if (devFilter !== 'all' && t.developer !== devFilter) return false;
    if (severityFilter !== 'all' && t.severity !== severityFilter) return false;
    return true;
  });

  const isSigned = signedDays[selectedDay] ?? false;
  const allDone = dayTests.every(t => checked[t.id]);
  const allCriticalDone = dayTests.filter(t => t.severity === 'critical').every(t => checked[t.id]);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <FlaskConical className="w-5 h-5 text-primary shrink-0" />
        <span className="text-sm font-bold">Testing & QA Sign-off</span>
        <Badge variant="outline" className="text-xs gap-1">
          <Info className="w-3 h-3" /> Non-blocking — sign off at your own pace
        </Badge>
      </div>

      {/* ── How it works banner ── */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 flex gap-2 items-start text-xs text-blue-900">
        <Shield className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
        <div>
          <p className="font-semibold">How this works</p>
          <p className="mt-0.5 text-blue-800">
            Each test is linked to a sprint task (auto-updated from the board). The task status shows whether the developer has marked it done.
            PO/SO then independently verifies and ticks the QA box. <strong>Signing off a day does NOT block the next day</strong> — work continues in parallel.
            Critical items must be verified before you can formally sign off a day.
          </p>
        </div>
      </div>

      {/* ── Day tabs ── */}
      <div className="flex gap-2 flex-wrap items-center">
        {([1, 2, 3] as const).map(d => {
          const tests = QA_TESTS.filter(t => t.day === d);
          const done = tests.filter(t => checked[t.id]).length;
          const signed = signedDays[d];
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5',
                selectedDay === d ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80',
              )}
            >
              {signed && <CheckCircle2 className="w-3 h-3" />}
              Day {d}
              <span className="opacity-70">({done}/{tests.length})</span>
              {signed && <Badge className="text-[8px] bg-green-500 text-white border-0 px-1 py-0">✓ Signed</Badge>}
            </button>
          );
        })}
        <span className="text-xs text-muted-foreground ml-2">Days 4–5 tests available when those days begin</span>
      </div>

      {/* ── Day summary banner ── */}
      <DayBanner
        day={selectedDay}
        tests={dayTests}
        checked={checked}
        isSigned={isSigned}
      />

      {/* ── Filters ── */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-muted-foreground">Filter:</span>
        {(['all', 'claude', 'lovable'] as const).map(f => (
          <button key={f} onClick={() => setDevFilter(f)}
            className={cn('px-2 py-1 rounded text-xs border transition-colors',
              devFilter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            )}>
            {f === 'all' ? 'All' : f === 'lovable' ? '⚡ Lovable' : '🧠 Claude'}
          </button>
        ))}
        <Separator orientation="vertical" className="h-4" />
        {(['all', 'critical', 'high', 'medium'] as const).map(s => (
          <button key={s} onClick={() => setSeverityFilter(s)}
            className={cn('px-2 py-1 rounded text-xs border transition-colors',
              severityFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            )}>
            {s === 'all' ? 'All severity' : s}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          Showing {filteredTests.length} of {dayTests.length} tests
        </span>
      </div>

      {/* ── Bulk actions ── */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
          onClick={() => markAll(filteredTests, true)}>
          <CheckCircle2 className="w-3 h-3" /> Mark all shown ✓
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
          onClick={() => markAll(filteredTests, false)}>
          Uncheck all shown
        </Button>
      </div>

      {/* ── Test list ── */}
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
            onToggle={() => toggle(test.id)}
          />
        ))}
      </div>

      <Separator />

      {/* ── PO/SO notes ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <ClipboardCheck className="w-3.5 h-3.5" />
          PO/SO Notes — Day {selectedDay}
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

      <Separator />

      {/* ── Official sign-off button ── */}
      <div className={cn(
        'rounded-lg border p-4 flex items-center justify-between gap-4',
        isSigned ? 'bg-green-50 border-green-300' : 'bg-card border-border',
      )}>
        <div>
          <p className="text-sm font-semibold">
            {isSigned ? `✅ Day ${selectedDay} officially signed off` : `Sign off Day ${selectedDay} QA`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSigned
              ? 'You have formally verified the fixes for this day.'
              : allCriticalDone
                ? `All ${dayTests.filter(t => t.severity === 'critical').length} critical tests verified — ready to sign off.`
                : `${dayTests.filter(t => t.severity === 'critical' && !checked[t.id]).length} critical test(s) still need verification.`}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 italic">
            Non-blocking: signing off does not gate Day {selectedDay + 1} work.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {isSigned ? (
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-amber-600 border-amber-300"
              onClick={() => revokeSignOff(selectedDay)}>
              <Clock className="w-3 h-3" /> Revoke Sign-off
            </Button>
          ) : (
            <Button size="sm" className="h-8 text-xs gap-1"
              disabled={!allCriticalDone}
              onClick={() => signOffDay(selectedDay, dayTests)}>
              <Shield className="w-3 h-3" />
              {allCriticalDone ? 'Sign Off Day ' + selectedDay : 'Critical tests pending'}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
};
