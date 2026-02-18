/**
 * DayPageView — Day-centric sprint board (Jira-mappable)
 *
 * Sections per day:
 *   0. PO/SM GATE — what the PO must do today (approve / verify / decide / unblock)
 *   1. KICKSTART — who depends on what, who is waiting, who is unblocked
 *   2. SPRINT BOARD — 4 columns (To Do | In Progress | Done | Won't Do)
 *      - empty columns collapse to a thin strip; active columns expand
 *      - swimlanes: Claude (violet) | Lovable (pink)
 *   3. DAILY STANDUP — side-by-side developer cards with process flow
 *   4. HANDOFFS — compact issue-link rows
 *
 * Jira mapping:
 *   Day     = Epic / Sprint
 *   Task    = Story / Issue (key: C-201, L-201)
 *   Column  = Status (To Do / In Progress / Done / Won't Do)
 *   Swimlane= Assignee
 *   Handoff = Issue Link (blocks / is blocked by)
 *   Standup = Sprint Ceremony
 *   PO Gate = Release Gate
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Brain, Zap, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, Ban, Save, ChevronDown, ChevronRight,
  FileCode, Link2, MessageSquare, Rocket, Users,
  ArrowDown, Hourglass, PlayCircle, Flag, Eye,
  ThumbsUp, HelpCircle, KeyRound, ShieldCheck, GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRINT_TASKS } from './data-tasks';
import { HANDOFFS, DEPENDENCY_CHAINS, PO_CHECKLISTS } from './data-dependencies';
import { DAY1_FINDINGS } from './data-findings';
import type { Developer, TaskStatus, StandupEntry, HandoffStatus } from './types';

// ─── Design tokens ────────────────────────────────────────────────────────────

const DEV = {
  claude: {
    label: 'Claude', role: 'Tech Lead',
    Icon: Brain,
    headerBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconCls: 'text-violet-600',
    rowAccent: 'border-l-violet-400',
    swimBorder: 'border-violet-200 dark:border-violet-800',
    tagCls: 'bg-violet-100 text-violet-800 border-violet-300',
    dot: 'bg-violet-500',
  },
  lovable: {
    label: 'Lovable', role: 'Dev / UI',
    Icon: Zap,
    headerBg: 'bg-pink-50 dark:bg-pink-950/30',
    iconCls: 'text-pink-600',
    rowAccent: 'border-l-pink-400',
    swimBorder: 'border-pink-200 dark:border-pink-800',
    tagCls: 'bg-pink-100 text-pink-800 border-pink-300',
    dot: 'bg-pink-500',
  },
} as const;

const PO_CFG = {
  verify:  { label: 'Verify',  Icon: Eye,        cls: 'text-blue-700 bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  approve: { label: 'Approve', Icon: ThumbsUp,    cls: 'text-green-700 bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  decide:  { label: 'Decide',  Icon: HelpCircle,  cls: 'text-amber-700 bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  unblock: { label: 'Unblock', Icon: KeyRound,    cls: 'text-red-700 bg-red-50 border-red-200',      badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
} as const;

// Column definitions — controls order and appearance
const COLS: { status: TaskStatus; label: string; dotCls: string; hdrCls: string; emptyLabel: string }[] = [
  { status: 'pending',     label: 'To Do',       dotCls: 'bg-muted-foreground/40', hdrCls: 'text-muted-foreground', emptyLabel: 'Nothing queued' },
  { status: 'in-progress', label: 'In Progress',  dotCls: 'bg-blue-500',            hdrCls: 'text-blue-700',         emptyLabel: 'Nothing active' },
  { status: 'completed',   label: 'Done',         dotCls: 'bg-green-500',           hdrCls: 'text-green-700',        emptyLabel: 'Nothing done yet' },
  { status: 'rejected',    label: "Won't Do",     dotCls: 'bg-red-400',             hdrCls: 'text-red-600',          emptyLabel: 'None skipped' },
];

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-muted-foreground/30',
};

const HANDOFF_CFG: Record<HandoffStatus, { label: string; cls: string; dot: string }> = {
  pending:      { label: 'Waiting',  cls: 'text-amber-700 bg-amber-50 border-amber-200',   dot: 'bg-amber-400' },
  ready:        { label: 'Ready',    cls: 'text-blue-700 bg-blue-50 border-blue-200',       dot: 'bg-blue-400'  },
  acknowledged: { label: 'Ack\'d',  cls: 'text-green-700 bg-green-50 border-green-200',    dot: 'bg-green-400' },
  blocked:      { label: 'Blocked',  cls: 'text-red-700 bg-red-50 border-red-200',          dot: 'bg-red-500'   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isHandoffReady(hid: string, getStatus: (id: string) => TaskStatus): boolean {
  const h = HANDOFFS.find(x => x.id === hid);
  if (!h) return false;
  if (h.status === 'ready' || h.status === 'acknowledged') return true;
  return getStatus(h.producerTaskId) === 'completed';
}

function getUnmetDeps(taskId: string, getStatus: (id: string) => TaskStatus): string[] {
  const chain = DEPENDENCY_CHAINS.find(c => c.taskId === taskId);
  if (!chain) return [];
  return chain.blockedBy.filter(dep =>
    dep.startsWith('H-') ? !isHandoffReady(dep, getStatus) : getStatus(dep) !== 'completed',
  );
}

// ─── PO/SM Gate Section ───────────────────────────────────────────────────────

const PO_STORAGE_KEY = 'genie_sprint_po_checklist';

function POGateSection({
  day, getTaskStatus,
}: {
  day: number;
  getTaskStatus: (id: string) => TaskStatus;
}) {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(PO_STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });

  const dayItems = PO_CHECKLISTS.filter(i => i.day === day);
  if (dayItems.length === 0) return null;

  const done = dayItems.filter(i => checked[i.id]).length;
  const pct = Math.round((done / dayItems.length) * 100);
  const allDone = done === dayItems.length;

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Group by category for display
  const byCategory = (['verify', 'approve', 'decide', 'unblock'] as const).map(cat => ({
    cat,
    items: dayItems.filter(i => i.category === cat),
  })).filter(g => g.items.length > 0);

  // What MUST be done for day to start (unblock items)
  const unblockItems = dayItems.filter(i => i.category === 'unblock');
  const criticalApprove = dayItems.filter(i => i.category === 'approve');

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50/30 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 hover:bg-emerald-100/50 transition-colors text-left"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        <Flag className="w-3 h-3 text-emerald-600 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">PO / SM Gate — Day {day}</span>
        <span className="text-[10px] text-emerald-600 ml-1">What the Product Owner must do today</span>
        <div className="ml-auto flex items-center gap-2">
          {allDone ? (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Gate Cleared
            </span>
          ) : (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
              {done}/{dayItems.length} · {pct}%
            </span>
          )}
          {open ? <ChevronDown className="w-3.5 h-3.5 text-emerald-600" /> : <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />}
        </div>
      </button>

      {open && (
        <div className="p-3 space-y-3">

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 shrink-0">{pct}% cleared</span>
          </div>

          {/* Critical: What PO must unblock TODAY for day to proceed */}
          {(unblockItems.length > 0 || criticalApprove.length > 0) && (
            <div className="rounded border border-amber-200 bg-amber-50/70 p-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800">Must Do First — Day {day} Cannot Start Without These</span>
              </div>
              {[...unblockItems, ...criticalApprove].map(item => {
                const cfg = PO_CFG[item.category as keyof typeof PO_CFG];
                const Icon = cfg.Icon;
                return (
                  <div key={item.id} className="flex items-start gap-2 text-[10px]">
                    <Checkbox
                      checked={checked[item.id] || false}
                      onCheckedChange={() => toggleCheck(item.id)}
                      className="mt-0.5 h-3 w-3"
                    />
                    <Icon className={cn('w-3 h-3 shrink-0 mt-0.5', cfg.cls.includes('blue') ? 'text-blue-600' : cfg.cls.includes('green') ? 'text-green-600' : cfg.cls.includes('amber') ? 'text-amber-600' : 'text-red-600')} />
                    <div className="flex-1 min-w-0">
                      <span className={cn('font-semibold', checked[item.id] && 'line-through text-muted-foreground')}>{item.title}</span>
                      <p className="text-muted-foreground mt-0.5">{item.description}</p>
                      {item.relatedTasks.length > 0 && (
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {item.relatedTasks.map(t => {
                            const st = getTaskStatus(t);
                            return (
                              <span key={t} className={cn('font-mono text-[8px] px-1 py-0.5 rounded border',
                                st === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                st === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-muted text-muted-foreground border-border'
                              )}>{t}</span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {checked[item.id] && <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Process flow: who is waiting for PO action */}
          <div className="rounded border border-emerald-200 bg-white/50 overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-emerald-100">
              {byCategory.map(({ cat, items }) => {
                const cfg = PO_CFG[cat];
                const Icon = cfg.Icon;
                const catDone = items.filter(i => checked[i.id]).length;
                return (
                  <div key={cat} className="p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                      <Icon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{cfg.label}</span>
                      <span className="ml-auto text-[9px] font-semibold text-muted-foreground">{catDone}/{items.length}</span>
                    </div>
                    {items.map(item => (
                      <div key={item.id} className="flex items-start gap-1.5">
                        <Checkbox
                          checked={checked[item.id] || false}
                          onCheckedChange={() => toggleCheck(item.id)}
                          className="mt-0.5 h-3 w-3 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-[10px] leading-snug', checked[item.id] ? 'line-through text-muted-foreground' : 'text-foreground')}>
                            {item.title}
                          </p>
                          {/* Who is affected */}
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {item.developer === 'both' ? (
                              <>
                                <span className="text-[8px] font-mono bg-violet-50 border border-violet-200 text-violet-700 px-1 rounded">Claude</span>
                                <span className="text-[8px] font-mono bg-pink-50 border border-pink-200 text-pink-700 px-1 rounded">Lovable</span>
                              </>
                            ) : item.developer === 'claude' ? (
                              <span className="text-[8px] font-mono bg-violet-50 border border-violet-200 text-violet-700 px-1 rounded">→ Claude</span>
                            ) : (
                              <span className="text-[8px] font-mono bg-pink-50 border border-pink-200 text-pink-700 px-1 rounded">→ Lovable</span>
                            )}
                            {item.route && (
                              <span className="text-[8px] font-mono text-muted-foreground">{item.route}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Who is waiting for PO today */}
          {(() => {
            const waitingDevs: { dev: Developer; items: typeof dayItems }[] = [];
            const claudeItems = dayItems.filter(i => i.developer === 'claude' && !checked[i.id]);
            const lovableItems = dayItems.filter(i => i.developer === 'lovable' && !checked[i.id]);
            const bothItems = dayItems.filter(i => i.developer === 'both' && !checked[i.id]);
            if (claudeItems.length > 0 || bothItems.length > 0)
              waitingDevs.push({ dev: 'claude', items: [...claudeItems, ...bothItems] });
            if (lovableItems.length > 0 || bothItems.length > 0)
              waitingDevs.push({ dev: 'lovable', items: [...lovableItems, ...bothItems] });

            if (waitingDevs.length === 0) return (
              <div className="flex items-center gap-1.5 text-[10px] text-green-700 px-1">
                <CheckCircle2 className="w-3 h-3" /> All PO actions complete — both devs unblocked ✓
              </div>
            );

            return (
              <div className="flex items-center gap-2 flex-wrap text-[10px]">
                <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground font-medium">Waiting on PO:</span>
                {waitingDevs.map(({ dev }, i) => {
                  const cfg = DEV[dev];
                  const Icon = cfg.Icon;
                  return (
                    <React.Fragment key={dev}>
                      {i > 0 && <span className="text-muted-foreground">&amp;</span>}
                      <span className={cn('flex items-center gap-1 font-semibold', cfg.iconCls)}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </React.Fragment>
                  );
                })}
                <span className="text-muted-foreground">— complete PO actions above to unblock</span>
              </div>
            );
          })()}

        </div>
      )}
    </section>
  );
}

// ─── Issue Row (flat, Jira-style) ─────────────────────────────────────────────

function IssueRow({
  taskId, getTaskStatus, onStatusChange, taskOverrides,
}: {
  taskId: string;
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, s: TaskStatus) => void;
  taskOverrides: Record<string, { status: TaskStatus; note?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const task = SPRINT_TASKS.find(t => t.id === taskId);
  if (!task) return null;

  const status   = getTaskStatus(taskId);
  const isDone   = status === 'completed';
  const isWIP    = status === 'in-progress';
  const isRej    = status === 'rejected';
  const unmet    = getUnmetDeps(taskId, getTaskStatus);
  const isGated  = unmet.length > 0 && !isDone && !isWIP;
  const note     = taskOverrides[taskId]?.note;
  const findings = DAY1_FINDINGS[taskId];
  const dev      = DEV[task.developer];

  return (
    <div className={cn(
      'border-l-[3px] rounded-r bg-card border border-l-0 border-border/60 text-xs',
      isGated ? 'border-l-amber-400' : isDone ? 'border-l-green-400 opacity-60' : isRej ? 'border-l-red-300 opacity-50' : dev.rowAccent,
    )}>
      {/* Main row */}
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <span title={`Priority: ${task.priority}`} className={cn('w-1.5 h-1.5 rounded-sm shrink-0', PRIORITY_DOT[task.priority])} />
        <span className="font-mono text-[9px] text-muted-foreground shrink-0 w-10">{task.id}</span>
        <span className={cn('flex-1 min-w-0 truncate leading-tight', isDone || isRej ? 'line-through text-muted-foreground' : '')}>
          {task.title}
        </span>
        <span className="text-[8px] text-muted-foreground shrink-0 hidden lg:inline">{task.estimatedHours}h</span>
        {/* Actions */}
        <div className="flex gap-0.5 shrink-0">
          <button onClick={() => onStatusChange(task.id, isDone ? 'pending' : 'completed')}
            className={cn('w-5 h-5 rounded flex items-center justify-center border transition-colors',
              isDone ? 'bg-green-500 border-green-600 text-white' : 'border-border hover:bg-green-50 hover:border-green-300 text-muted-foreground')}>
            <CheckCircle2 className="w-3 h-3" />
          </button>
          <button onClick={() => onStatusChange(task.id, isWIP ? 'pending' : 'in-progress')}
            disabled={isGated && !isWIP}
            className={cn('w-5 h-5 rounded flex items-center justify-center border transition-colors',
              isWIP ? 'bg-blue-500 border-blue-600 text-white' : 'border-border hover:bg-blue-50 hover:border-blue-300 text-muted-foreground',
              isGated && !isWIP && 'opacity-30 cursor-not-allowed')}>
            <Clock className="w-3 h-3" />
          </button>
          <button onClick={() => setOpen(o => !o)}
            className="w-5 h-5 rounded flex items-center justify-center border border-border hover:bg-muted transition-colors text-muted-foreground">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Blocker pill */}
      {isGated && (
        <div className="flex items-center flex-wrap gap-1 px-2 pb-1 text-[9px] text-amber-800">
          <Ban className="w-2.5 h-2.5 shrink-0" />
          {unmet.map(d => (
            <span key={d} className="font-mono bg-amber-100 border border-amber-300 px-1 rounded">{d}</span>
          ))}
        </div>
      )}
      {note && !open && (
        <p className="px-2 pb-1 text-[9px] text-muted-foreground italic truncate">{note}</p>
      )}

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-border/30 bg-muted/5 px-2 py-2 space-y-1.5">
          {note && <p className="italic text-[10px] text-muted-foreground">{note}</p>}
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Acceptance Criteria</p>
            <p className="text-[10px]">{task.acceptanceCriteria}</p>
          </div>
          {task.notes && (
            <div className="flex gap-1 px-1.5 py-1 bg-amber-50 border border-amber-200 rounded text-[9px] text-amber-800">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />{task.notes}
            </div>
          )}
          {task.filesInvolved.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.filesInvolved.map(f => (
                <span key={f} className="inline-flex items-center gap-0.5 bg-muted border border-border/40 px-1 py-0.5 rounded font-mono text-[8px]">
                  <FileCode className="w-2 h-2" />{f.split('/').pop()}
                </span>
              ))}
            </div>
          )}
          {findings && findings.findings.length > 0 && (
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Findings ({findings.findings.length})</p>
              {findings.findings.slice(0, 4).map(f => (
                <div key={f.id} className="flex items-center gap-1.5 text-[9px]">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', f.status === 'fixed' ? 'bg-green-500' : 'bg-amber-500')} />
                  <span className="flex-1 truncate text-muted-foreground">{f.issue}</span>
                  <span className={f.status === 'fixed' ? 'text-green-600' : 'text-amber-600'}>{f.status}</span>
                </div>
              ))}
              {findings.findings.length > 4 && (
                <p className="text-[9px] text-muted-foreground">+{findings.findings.length - 4} more…</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Adaptive Kanban column — collapses when empty ────────────────────────────

function KanbanColumn({
  col, ids, getTaskStatus, onStatusChange, taskOverrides,
}: {
  col: typeof COLS[0];
  ids: string[];
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, s: TaskStatus) => void;
  taskOverrides: Record<string, { status: TaskStatus; note?: string }>;
}) {
  const [collapsed, setCollapsed] = useState(ids.length === 0);
  const hasItems = ids.length > 0;
  const isActive = col.status === 'in-progress';

  // Empty columns are collapsed by default — click header to expand
  if (!hasItems && collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className={cn(
          'flex items-center justify-center gap-1.5 px-2 py-2 rounded border border-dashed border-border/40 text-[9px] text-muted-foreground/40 hover:border-border/70 hover:text-muted-foreground transition-all',
          'min-w-[80px] w-full',
        )}
        title={`${col.label} (empty)`}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', col.dotCls)} />
        <span className="font-semibold uppercase tracking-wide">{col.label}</span>
        <span className="ml-auto opacity-50">0</span>
      </button>
    );
  }

  return (
    <div className={cn(
      'flex flex-col min-w-0 flex-1 rounded border border-border/50',
      isActive && hasItems ? 'ring-1 ring-blue-300/50' : '',
    )}>
      {/* Column header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 rounded-t border-b border-border/40 text-left w-full hover:bg-muted/30 transition-colors',
          hasItems ? 'bg-muted/20' : 'bg-muted/5',
        )}
      >
        <span className={cn('w-2 h-2 rounded-full shrink-0', col.dotCls)} />
        <span className={cn('text-[10px] font-bold uppercase tracking-wide flex-1', col.hdrCls)}>
          {col.label}
        </span>
        {hasItems && (
          <span className={cn('text-[9px] font-bold px-1 py-0.5 rounded-full', col.hdrCls, 'bg-transparent')}>
            {ids.length}
          </span>
        )}
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          : <ChevronDown  className="w-3 h-3 text-muted-foreground/50 shrink-0" />}
      </button>

      {/* Tasks */}
      {!collapsed && (
        <div className="flex-1 p-1.5 space-y-1.5">
          {ids.length === 0 ? (
            <p className="text-[9px] text-muted-foreground/40 text-center py-3 italic">{col.emptyLabel}</p>
          ) : (
            ids.map(id => (
              <IssueRow
                key={id}
                taskId={id}
                getTaskStatus={getTaskStatus}
                onStatusChange={onStatusChange}
                taskOverrides={taskOverrides}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Swimlane (one per developer) ────────────────────────────────────────────

function Swimlane({
  dev, ids, getTaskStatus, onStatusChange, taskOverrides,
}: {
  dev: Developer;
  ids: string[];
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, s: TaskStatus) => void;
  taskOverrides: Record<string, { status: TaskStatus; note?: string }>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const cfg = DEV[dev];
  const Icon = cfg.Icon;

  const done  = ids.filter(id => getTaskStatus(id) === 'completed').length;
  const wip   = ids.filter(id => getTaskStatus(id) === 'in-progress').length;
  const total = ids.length;

  const byStatus = (s: TaskStatus) => ids.filter(id => getTaskStatus(id) === s);
  const activeCols = COLS.filter(c => byStatus(c.status).length > 0).length;

  return (
    <div className={cn('rounded-lg border', cfg.swimBorder)}>
      {/* Swimlane header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-t-lg text-left transition-colors hover:bg-muted/20', cfg.headerBg)}
      >
        {collapsed ? <ChevronRight className={cn('w-3.5 h-3.5', cfg.iconCls)} /> : <ChevronDown className={cn('w-3.5 h-3.5', cfg.iconCls)} />}
        <Icon className={cn('w-3.5 h-3.5 shrink-0', cfg.iconCls)} />
        <span className="text-sm font-semibold">{cfg.label}</span>
        <span className="text-xs text-muted-foreground">· {cfg.role}</span>
        <div className="ml-auto flex items-center gap-2">
          {wip > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {wip} active
            </span>
          )}
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', cfg.tagCls)}>
            {done}/{total} done
          </span>
        </div>
      </button>

      {/* Columns — adaptive flex layout */}
      {!collapsed && (
        <div className={cn(
          'flex gap-2 p-2',
          activeCols >= 3 ? 'overflow-x-auto' : '',
        )}>
          {COLS.map(col => {
            const colIds = byStatus(col.status);
            return (
              <div
                key={col.status}
                className={cn(
                  'flex flex-col min-w-0',
                  colIds.length > 0 ? 'flex-1 min-w-[180px]' : 'w-[80px] shrink-0',
                )}
              >
                <KanbanColumn
                  col={col}
                  ids={colIds}
                  getTaskStatus={getTaskStatus}
                  onStatusChange={onStatusChange}
                  taskOverrides={taskOverrides}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Kickstart Section — who is waiting for what ──────────────────────────────

function KickstartSection({
  day, getTaskStatus,
}: {
  day: number;
  getTaskStatus: (id: string) => TaskStatus;
}) {
  const dayHandoffs = HANDOFFS.filter(h => h.day === day);
  if (dayHandoffs.length === 0 && day === 1) return null;

  const ready    = dayHandoffs.filter(h => isHandoffReady(h.id, getTaskStatus));
  const waiting  = dayHandoffs.filter(h => !isHandoffReady(h.id, getTaskStatus));

  const claudeNeeds  = dayHandoffs.filter(h => h.to === 'claude'  && !isHandoffReady(h.id, getTaskStatus));
  const lovableNeeds = dayHandoffs.filter(h => h.to === 'lovable' && !isHandoffReady(h.id, getTaskStatus));

  const dayTasks = SPRINT_TASKS.filter(t => t.day === day);
  const unblocked = dayTasks.filter(t => getUnmetDeps(t.id, getTaskStatus).length === 0 && getTaskStatus(t.id) === 'pending');
  const blocked   = dayTasks.filter(t => getUnmetDeps(t.id, getTaskStatus).length > 0  && getTaskStatus(t.id) !== 'completed');

  return (
    <section className="rounded-lg border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/40">
        <Rocket className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground">Day {day} Kickstart</span>
        <span className="text-[10px] text-muted-foreground">— Who starts, who waits, who unblocks</span>
        <div className="ml-auto flex gap-2">
          {ready.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
              {ready.length} handoff{ready.length > 1 ? 's' : ''} ready
            </span>
          )}
          {waiting.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              {waiting.length} waiting
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40">

        {/* Col 1: Who can start NOW */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <PlayCircle className="w-3 h-3 text-green-600 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-green-700">Can Start Now</span>
            <span className="ml-auto text-[9px] text-muted-foreground">{unblocked.length} task{unblocked.length !== 1 ? 's' : ''}</span>
          </div>
          {unblocked.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">All tasks gated or done</p>
          ) : (
            unblocked.slice(0, 6).map(t => {
              const cfg = DEV[t.developer];
              const Icon = cfg.Icon;
              return (
                <div key={t.id} className="flex items-center gap-1.5 text-[10px]">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                  <Icon className={cn('w-2.5 h-2.5 shrink-0', cfg.iconCls)} />
                  <span className="font-mono text-muted-foreground w-10 shrink-0">{t.id}</span>
                  <span className="truncate flex-1 text-foreground">{t.title}</span>
                </div>
              );
            })
          )}
          {unblocked.length > 6 && (
            <p className="text-[9px] text-muted-foreground">+{unblocked.length - 6} more</p>
          )}
        </div>

        {/* Col 2: Who is waiting for what */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Hourglass className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Waiting For</span>
          </div>
          {claudeNeeds.length === 0 && lovableNeeds.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">No blockers — all handoffs satisfied ✓</p>
          ) : (
            <>
              {claudeNeeds.map(h => (
                <div key={h.id} className="text-[10px] flex items-start gap-1.5">
                  <Brain className="w-3 h-3 text-violet-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-violet-700">Claude needs:</p>
                    <p className="text-muted-foreground truncate">{h.artifact}</p>
                    <p className="text-[9px] text-muted-foreground">from <span className="font-semibold">{DEV[h.from].label}</span> · {h.id}</p>
                  </div>
                </div>
              ))}
              {lovableNeeds.map(h => (
                <div key={h.id} className="text-[10px] flex items-start gap-1.5">
                  <Zap className="w-3 h-3 text-pink-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-pink-700">Lovable needs:</p>
                    <p className="text-muted-foreground truncate">{h.artifact}</p>
                    <p className="text-[9px] text-muted-foreground">from <span className="font-semibold">{DEV[h.from].label}</span> · {h.id}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Col 3: Blocked tasks */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Ban className="w-3 h-3 text-red-500 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-red-600">Gated / Blocked</span>
            <span className="ml-auto text-[9px] text-muted-foreground">{blocked.length} task{blocked.length !== 1 ? 's' : ''}</span>
          </div>
          {blocked.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">Nothing blocked 🎉</p>
          ) : (
            blocked.slice(0, 6).map(t => {
              const deps = getUnmetDeps(t.id, getTaskStatus);
              const cfg = DEV[t.developer];
              return (
                <div key={t.id} className="text-[10px] flex items-start gap-1.5">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-1', cfg.dot)} />
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-muted-foreground">{t.id}</span>
                    <span className="ml-1 text-foreground truncate">{t.title.slice(0, 40)}{t.title.length > 40 ? '…' : ''}</span>
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {deps.slice(0, 3).map(d => (
                        <span key={d} className="font-mono text-[8px] bg-red-50 border border-red-200 text-red-700 px-1 rounded">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {blocked.length > 6 && (
            <p className="text-[9px] text-muted-foreground">+{blocked.length - 6} more gated</p>
          )}
        </div>

      </div>

      {/* Process flow row */}
      {(claudeNeeds.length > 0 || lovableNeeds.length > 0) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50/50 border-t border-amber-100 flex-wrap">
          <ArrowDown className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="text-[10px] text-amber-800 font-medium">Unblocking flow today:</span>
          {claudeNeeds.concat(lovableNeeds).map((h, i) => (
            <React.Fragment key={h.id}>
              {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />}
              <span className="text-[9px] flex items-center gap-1">
                <span className={cn('font-semibold', h.from === 'claude' ? 'text-violet-700' : 'text-pink-700')}>
                  {DEV[h.from].label}
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                <span className={cn('font-semibold', h.to === 'claude' ? 'text-violet-700' : 'text-pink-700')}>
                  {DEV[h.to].label}
                </span>
                <span className="font-mono text-muted-foreground">({h.id})</span>
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Auto-fill helpers ────────────────────────────────────────────────────────

function buildYesterdayFill(day: number, dev: Developer, getTaskStatus: (id: string) => TaskStatus): string {
  const prevDay = day - 1;
  if (prevDay < 1) return 'N/A — Sprint Day 1 start';
  const prevDone = SPRINT_TASKS
    .filter(t => t.developer === dev && t.day === prevDay && getTaskStatus(t.id) === 'completed')
    .map(t => t.id);
  if (prevDone.length === 0) return 'No tasks completed on Day ' + prevDay;
  return `Completed ${prevDone.join(', ')} on Day ${prevDay}.`;
}

function buildTodayFill(day: number, dev: Developer, getTaskStatus: (id: string) => TaskStatus): string {
  const todayTasks = SPRINT_TASKS
    .filter(t => t.developer === dev && t.day === day)
    .map(t => ({ ...t, status: getTaskStatus(t.id) }));
  const wip    = todayTasks.filter(t => t.status === 'in-progress').map(t => t.id);
  const todo   = todayTasks.filter(t => t.status === 'pending').map(t => t.id);
  const active = [...wip, ...todo.slice(0, 3)];
  if (active.length === 0) return 'All Day ' + day + ' tasks complete ✓';
  const labels = active.map(id => {
    const t = SPRINT_TASKS.find(x => x.id === id);
    return t ? `${id} — ${t.title.slice(0, 40)}` : id;
  });
  return labels.join('\n');
}

function buildBlockersFill(day: number, dev: Developer, getTaskStatus: (id: string) => TaskStatus): string {
  const waiting = HANDOFFS.filter(
    h => h.day === day && h.to === dev && !isHandoffReady(h.id, getTaskStatus),
  );
  if (waiting.length === 0) return 'None';
  return waiting.map(h => `${h.id} (${h.artifact}) pending from ${DEV[h.from].label} — ${
    SPRINT_TASKS.filter(t => h.consumerTaskId === t.id).map(t => t.id).join(', ') || 'see handoffs'
  } gated.`).join('\n');
}

// ─── Standup section — side-by-side process-flow cards ───────────────────────

function StandupCard({
  entry, dev, day, getTaskStatus, onSave,
}: {
  entry: StandupEntry | undefined;
  dev: Developer;
  day: number;
  getTaskStatus: (id: string) => TaskStatus;
  onSave: (e: Omit<StandupEntry, 'createdAt'>) => void;
}) {
  const cfg = DEV[dev];
  const Icon = cfg.Icon;

  const [editing, setEditing] = useState(!entry);
  const [done,  setDone]  = useState(() => entry?.yesterday ?? buildYesterdayFill(day, dev, getTaskStatus));
  const [now,   setNow]   = useState(() => entry?.today     ?? buildTodayFill(day, dev, getTaskStatus));
  const [block, setBlock] = useState(() => entry?.blockers  ?? buildBlockersFill(day, dev, getTaskStatus));

  React.useEffect(() => {
    if (entry && !editing) {
      setDone(entry.yesterday);
      setNow(entry.today);
      setBlock(entry.blockers ?? 'None');
    }
  }, [entry]);

  const openEdit = () => {
    if (!entry) {
      setDone(buildYesterdayFill(day, dev, getTaskStatus));
      setNow(buildTodayFill(day, dev, getTaskStatus));
      setBlock(buildBlockersFill(day, dev, getTaskStatus));
    } else {
      setDone(entry.yesterday);
      setNow(entry.today);
      setBlock(entry.blockers ?? 'None');
    }
    setEditing(true);
  };

  const save = () => {
    if (!done.trim() && !now.trim()) return;
    onSave({ day, developer: dev, yesterday: done, today: now, blockers: block || 'None' });
    setEditing(false);
  };

  // What is this dev waiting on TODAY from PO or the other dev?
  const dayHandoffsNeeded = HANDOFFS.filter(h => h.day === day && h.to === dev && !isHandoffReady(h.id, getTaskStatus));
  const dayTasksForDev = SPRINT_TASKS.filter(t => t.developer === dev && t.day === day);
  const blockedCount = dayTasksForDev.filter(t => getUnmetDeps(t.id, getTaskStatus).length > 0 && getTaskStatus(t.id) !== 'completed').length;
  const canStartCount = dayTasksForDev.filter(t => getUnmetDeps(t.id, getTaskStatus).length === 0 && getTaskStatus(t.id) === 'pending').length;

  return (
    <div className={cn('rounded-lg border flex-1 min-w-0', cfg.swimBorder)}>
      {/* Card header */}
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-t-lg border-b border-border/30', cfg.headerBg)}>
        <Icon className={cn('w-3.5 h-3.5 shrink-0', cfg.iconCls)} />
        <span className="text-xs font-semibold">{cfg.label}</span>
        <span className="text-[10px] text-muted-foreground">{cfg.role}</span>

        {/* Status pills */}
        <div className="ml-auto flex items-center gap-1.5">
          {canStartCount > 0 && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
              {canStartCount} ready
            </span>
          )}
          {blockedCount > 0 && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              {blockedCount} gated
            </span>
          )}
          {entry && !editing && (
            <>
              <span className="text-[9px] text-muted-foreground">
                {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                onClick={openEdit}
                className={cn(
                  'text-[9px] flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-dashed transition-colors',
                  dev === 'claude'
                    ? 'border-violet-300 text-violet-600 hover:bg-violet-100'
                    : 'border-pink-300 text-pink-600 hover:bg-pink-100',
                )}
              >
                <MessageSquare className="w-2.5 h-2.5" /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* What this dev is waiting on today — always visible */}
      {dayHandoffsNeeded.length > 0 && (
        <div className="px-3 pt-2 pb-0">
          <div className="flex items-start gap-1.5 px-2 py-1.5 rounded bg-amber-50 border border-amber-200 text-[9px] text-amber-800">
            <Hourglass className="w-3 h-3 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Waiting on: </span>
              {dayHandoffsNeeded.map((h, i) => (
                <React.Fragment key={h.id}>
                  {i > 0 && ', '}
                  <span className="font-mono">{h.id}</span>
                  <span className="text-amber-700"> from {DEV[h.from].label}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── View mode ─────────────────────── */}
      {entry && !editing && (
        <div className="px-3 py-2.5 space-y-2 text-xs">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">✓ Completed</p>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{entry.yesterday}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">→ Working On</p>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{entry.today}</p>
          </div>
          {entry.blockers && entry.blockers !== 'None' ? (
            <div className="flex items-start gap-1.5 px-2 py-1.5 rounded bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              <p className="text-[10px] whitespace-pre-line">{entry.blockers}</p>
            </div>
          ) : (
            <p className="text-[9px] text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> No blockers
            </p>
          )}
        </div>
      )}

      {/* ── Edit / Add mode (auto-filled) ─── */}
      {(!entry || editing) && (
        <div className="px-3 py-2.5 space-y-2">
          {!entry && (
            <p className="text-[9px] text-muted-foreground italic flex items-center gap-1">
              <Rocket className="w-3 h-3 text-primary" />
              Auto-filled from Day {day} task progress — edit &amp; save to lock in.
            </p>
          )}

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground block mb-0.5">
              ✓ Completed (yesterday / prior)
            </label>
            <Textarea
              value={done}
              onChange={e => setDone(e.target.value)}
              rows={2}
              className="text-xs resize-none"
              placeholder="What was completed…"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground block mb-0.5">
              → Working On today
            </label>
            <Textarea
              value={now}
              onChange={e => setNow(e.target.value)}
              rows={3}
              className="text-xs resize-none"
              placeholder="Today's focus…"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground block mb-0.5">
              ⚠ Blockers / Waiting for
            </label>
            <Textarea
              value={block}
              onChange={e => setBlock(e.target.value)}
              rows={2}
              className="text-xs resize-none"
              placeholder="Blockers (leave blank if none)"
            />
          </div>

          <div className="flex gap-1.5">
            <Button size="sm" onClick={save} className="h-7 text-xs gap-1">
              <Save className="w-3 h-3" /> Save &amp; Trigger Day {day} Flow
            </Button>
            {(entry || editing) && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs">
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Handoff row ──────────────────────────────────────────────────────────────

function HandoffRow({ h, getTaskStatus }: { h: typeof HANDOFFS[0]; getTaskStatus: (id: string) => TaskStatus }) {
  const [open, setOpen] = useState(false);
  const ready = isHandoffReady(h.id, getTaskStatus);
  const live: HandoffStatus = ready
    ? (h.status === 'acknowledged' ? 'acknowledged' : 'ready')
    : h.status === 'blocked' ? 'blocked' : 'pending';
  const sc = HANDOFF_CFG[live];
  const from = DEV[h.from];
  const to   = DEV[h.to];

  return (
    <div className="border-b border-border/30 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/20 transition-colors text-xs text-left">
        <span className={cn('w-2 h-2 rounded-full shrink-0', sc.dot)} />
        <span className="font-mono text-[9px] text-muted-foreground w-10 shrink-0">{h.id}</span>
        <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0', from.tagCls)}>{from.label}</span>
        <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
        <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0', to.tagCls)}>{to.label}</span>
        <span className="flex-1 min-w-0 truncate text-foreground ml-1">{h.title}</span>
        <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0', sc.cls)}>{sc.label}</span>
        <span className="text-[9px] text-muted-foreground capitalize shrink-0 hidden sm:block">{h.priority}</span>
        {open ? <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-3 text-[10px] space-y-1 text-muted-foreground border-t border-border/20 pt-2 bg-muted/5">
          <p><span className="font-semibold text-foreground">Artifact:</span> {h.artifact}</p>
          <p><span className="font-semibold text-foreground">Notes for {to.label}:</span> {h.consumerNotes}</p>
          <p><span className="font-semibold text-foreground">Producer task:</span> <span className="font-mono">{h.producerTaskId}</span></p>
          <p><span className="font-semibold text-foreground">Consumer task:</span> <span className="font-mono">{h.consumerTaskId}</span></p>
        </div>
      )}
    </div>
  );
}

// ─── Day Start / Sign-off Workflow Banner ────────────────────────────────────

const DAY_START_KEY = 'genie_sprint_day_start_v1';
const DAY_SIGNOFF_KEY = 'genie_sprint_day_signoff_v1';

type DayWorkflowState = {
  startedAt: string | null;
  startedBy: string;
  standupClaudeDone: boolean;
  standupLovableDone: boolean;
  signedOffAt: string | null;
};

function DayWorkflowBanner({
  day, claudeSD, lovableSD, getTaskStatus,
}: {
  day: number;
  claudeSD: StandupEntry | undefined;
  lovableSD: StandupEntry | undefined;
  getTaskStatus: (id: string) => TaskStatus;
}) {
  const storageKey = `${DAY_START_KEY}_day${day}`;
  const signoffKey = `${DAY_SIGNOFF_KEY}_day${day}`;

  const [wf, setWf] = React.useState<DayWorkflowState>(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : { startedAt: null, startedBy: '', standupClaudeDone: false, standupLovableDone: false, signedOffAt: null };
    } catch { return { startedAt: null, startedBy: '', standupClaudeDone: false, standupLovableDone: false, signedOffAt: null }; }
  });

  // Auto-detect standup status from actual saved entries
  const claudeUp    = !!claudeSD;
  const lovableUp   = !!lovableSD;
  const bothUp      = claudeUp && lovableUp;
  const dayTasks    = SPRINT_TASKS.filter(t => t.day === day);
  const doneTasks   = dayTasks.filter(t => getTaskStatus(t.id) === 'completed').length;
  const allDone     = doneTasks === dayTasks.length;
  const isStarted   = !!wf.startedAt;
  const isSignedOff = !!wf.signedOffAt;

  // Dynamic change-rate threshold: tighter early (Days 1-2), looser late (Days 4-5)
  const dayThreshold = day <= 2 ? 25 : day === 3 ? 35 : 50;

  const persist = (next: DayWorkflowState) => {
    setWf(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const startDay = () => persist({ ...wf, startedAt: new Date().toISOString(), startedBy: 'PO/SM' });
  const signOff  = () => persist({ ...wf, signedOffAt: new Date().toISOString() });
  const reset    = () => { persist({ startedAt: null, startedBy: '', standupClaudeDone: false, standupLovableDone: false, signedOffAt: null }); localStorage.removeItem(signoffKey); };

  // Steps: 1=PO Start Day  2=Standups  3=Tasks done  4=Sign-off
  const step1 = isStarted;
  const step2 = bothUp;
  const step3 = allDone;
  const step4 = isSignedOff;

  const fmtTime = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  if (isSignedOff) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50/50 px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-green-800">Day {day} Complete — Signed Off ✓</p>
          <p className="text-[10px] text-green-700">Started: {fmtTime(wf.startedAt)} · Signed off: {fmtTime(wf.signedOffAt)} · {doneTasks}/{dayTasks.length} tasks done</p>
        </div>
        <button onClick={reset} className="text-[9px] text-green-700 hover:underline shrink-0">Reset</button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 border-b border-primary/20">
        <Rocket className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Day {day} Workflow · Start → Standups → Work → Sign-off</span>
        <span className="ml-auto text-[9px] text-muted-foreground">Change-rate threshold: <strong>{dayThreshold}%</strong> (Day {day} dynamic)</span>
      </div>

      {/* 4-step checklist */}
      <div className="grid grid-cols-4 divide-x divide-border/40">
        {/* Step 1 — PO Starts Day */}
        <div className={cn('p-3 space-y-2', step1 ? 'bg-green-50/30' : 'bg-amber-50/30')}>
          <div className="flex items-center gap-1.5">
            <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0', step1 ? 'bg-green-500 text-white' : 'bg-amber-400 text-white')}>
              {step1 ? '✓' : '1'}
            </span>
            <span className="text-[10px] font-bold">PO/SM Starts Day</span>
          </div>
          <p className="text-[9px] text-muted-foreground">PO clicks Start Day to open the sprint board. Tasks unlock for both developers.</p>
          {step1 ? (
            <p className="text-[9px] text-green-700 font-semibold">✓ Started at {fmtTime(wf.startedAt)}</p>
          ) : (
            <button
              onClick={startDay}
              className="w-full text-[10px] font-bold px-2 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              ▶ Start Day {day}
            </button>
          )}
        </div>

        {/* Step 2 — Standups */}
        <div className={cn('p-3 space-y-2', step2 ? 'bg-green-50/30' : step1 ? 'bg-blue-50/30' : 'bg-muted/20 opacity-60')}>
          <div className="flex items-center gap-1.5">
            <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0', step2 ? 'bg-green-500 text-white' : step1 ? 'bg-blue-500 text-white' : 'bg-muted-foreground/30 text-muted-foreground')}>
              {step2 ? '✓' : '2'}
            </span>
            <span className="text-[10px] font-bold">Standups Filed</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px]">
              <Brain className={cn('w-3 h-3 shrink-0', claudeUp ? 'text-green-600' : 'text-muted-foreground')} />
              <span className={claudeUp ? 'text-green-700 font-semibold' : 'text-muted-foreground'}>Claude {claudeUp ? '✓' : '⏳ pending'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <Zap className={cn('w-3 h-3 shrink-0', lovableUp ? 'text-green-600' : 'text-muted-foreground')} />
              <span className={lovableUp ? 'text-green-700 font-semibold' : 'text-muted-foreground'}>Lovable {lovableUp ? '✓' : '⏳ pending'}</span>
            </div>
          </div>
          {step2 && <p className="text-[9px] text-green-700 font-semibold">✓ Both standups saved</p>}
        </div>

        {/* Step 3 — Work */}
        <div className={cn('p-3 space-y-2', step3 ? 'bg-green-50/30' : step2 ? 'bg-violet-50/20' : 'bg-muted/20 opacity-60')}>
          <div className="flex items-center gap-1.5">
            <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0', step3 ? 'bg-green-500 text-white' : step2 ? 'bg-violet-500 text-white' : 'bg-muted-foreground/30 text-muted-foreground')}>
              {step3 ? '✓' : '3'}
            </span>
            <span className="text-[10px] font-bold">Tasks Complete</span>
          </div>
          <div className="space-y-1">
            {(['claude', 'lovable'] as Developer[]).map(dev => {
              const devTasks  = dayTasks.filter(t => t.developer === dev);
              const devDone   = devTasks.filter(t => getTaskStatus(t.id) === 'completed').length;
              const devSP     = devTasks.reduce((s, t) => s + t.estimatedHours, 0);
              const cfg       = DEV[dev];
              const DevIcon   = cfg.Icon;
              return (
                <div key={dev} className="flex items-center gap-1 text-[9px]">
                  <DevIcon className={cn('w-3 h-3', cfg.iconCls)} />
                  <span className={cn('font-mono', cfg.iconCls)}>{dev === 'claude' ? 'C' : 'L'}</span>
                  <span className="text-muted-foreground">{devDone}/{devTasks.length}</span>
                  <span className="text-muted-foreground text-[8px]">· {devSP}SP</span>
                </div>
              );
            })}
          </div>
          <p className={cn('text-[9px] font-semibold', step3 ? 'text-green-700' : 'text-muted-foreground')}>{doneTasks}/{dayTasks.length} tasks done</p>
        </div>

        {/* Step 4 — PO Sign-off */}
        <div className={cn('p-3 space-y-2', step4 ? 'bg-green-50/30' : step3 ? 'bg-emerald-50/30' : 'bg-muted/20 opacity-60')}>
          <div className="flex items-center gap-1.5">
            <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0', step4 ? 'bg-green-500 text-white' : step3 ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/30 text-muted-foreground')}>
              {step4 ? '✓' : '4'}
            </span>
            <span className="text-[10px] font-bold">PO Sign-off</span>
          </div>
          <p className="text-[9px] text-muted-foreground">PO verifies AC on all tasks. Day is closed. Claude merges first on Day 5.</p>
          {step3 && !step4 && (
            <button
              onClick={signOff}
              className="w-full text-[10px] font-bold px-2 py-1.5 rounded bg-emerald-600 text-white hover:opacity-90 transition-opacity"
            >
              ✓ Sign Off Day {day}
            </button>
          )}
          {step4 && <p className="text-[9px] text-green-700 font-semibold">✓ Signed off at {fmtTime(wf.signedOffAt)}</p>}
          {!step3 && !step4 && <p className="text-[8px] text-muted-foreground italic">Available after all tasks done</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface DayPageViewProps {
  day: number;
  theme: string;
  standups: StandupEntry[];
  onAddStandup: (entry: Omit<StandupEntry, 'createdAt'>) => void;
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, status: TaskStatus) => void;
  taskOverrides: Record<string, { status: TaskStatus; note?: string }>;
}

export const DayPageView: React.FC<DayPageViewProps> = ({
  day, theme, standups, onAddStandup, getTaskStatus, onStatusChange, taskOverrides,
}) => {
  const dayTasks     = SPRINT_TASKS.filter(t => t.day === day);
  const claudeIds    = dayTasks.filter(t => t.developer === 'claude').map(t => t.id);
  const lovableIds   = dayTasks.filter(t => t.developer === 'lovable').map(t => t.id);
  const dayHandoffs  = HANDOFFS.filter(h => h.day === day);
  const dayStandups  = standups.filter(s => s.day === day);

  const doneTasks   = dayTasks.filter(t => getTaskStatus(t.id) === 'completed').length;
  const readyHoffs  = dayHandoffs.filter(h => isHandoffReady(h.id, getTaskStatus)).length;

  const claudeSD  = [...dayStandups.filter(s => s.developer === 'claude')].pop();
  const lovableSD = [...dayStandups.filter(s => s.developer === 'lovable')].pop();

  return (
    <div className="space-y-5">

      {/* ── Day Workflow Banner ───────────────────────────────────────────── */}
      <DayWorkflowBanner day={day} claudeSD={claudeSD} lovableSD={lovableSD} getTaskStatus={getTaskStatus} />

      {/* ── Epic header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 px-2 py-0.5 rounded">
              Epic · Day {day}
            </span>
            <span className="text-[10px] text-muted-foreground">Feb {16 + day}, 2026</span>
          </div>
          <h2 className="text-base font-bold leading-none">{theme}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={cn('px-2 py-1 rounded-full border font-semibold text-[10px]',
            doneTasks === dayTasks.length ? 'bg-green-50 text-green-700 border-green-200' : 'bg-muted text-muted-foreground border-border')}>
            {doneTasks}/{dayTasks.length} tasks
          </span>
          {dayHandoffs.length > 0 && (
            <span className={cn('px-2 py-1 rounded-full border font-semibold text-[10px]',
              readyHoffs === dayHandoffs.length ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
              {readyHoffs}/{dayHandoffs.length} handoffs
            </span>
          )}
        </div>
      </div>

      {/* ── 0. PO / SM GATE ──────────────────────────────────────────────── */}
      <POGateSection day={day} getTaskStatus={getTaskStatus} />

      {/* ── 1. KICKSTART ─────────────────────────────────────────────────── */}
      <KickstartSection day={day} getTaskStatus={getTaskStatus} />

      {/* ── 2. SPRINT BOARD ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2.5">
          <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sprint Board</span>
          <Separator className="flex-1" />
          <span className="text-[9px] text-muted-foreground">Swimlanes · adaptive columns</span>
        </div>
        <div className="space-y-2.5">
          {claudeIds.length > 0 && (
            <Swimlane dev="claude"  ids={claudeIds}  getTaskStatus={getTaskStatus} onStatusChange={onStatusChange} taskOverrides={taskOverrides} />
          )}
          {lovableIds.length > 0 && (
            <Swimlane dev="lovable" ids={lovableIds} getTaskStatus={getTaskStatus} onStatusChange={onStatusChange} taskOverrides={taskOverrides} />
          )}
        </div>
      </section>

      {/* ── 3. DAILY STANDUP ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2.5">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Daily Standup</span>
          <Separator className="flex-1" />
          <span className="text-[9px] text-muted-foreground italic">Auto-filled from task progress · click Edit to update</span>
        </div>

        {/* Process flow header: who waits on whom */}
        {dayHandoffs.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2.5 rounded-lg bg-muted/30 border border-border/40 flex-wrap text-[10px]">
            <Users className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="font-semibold text-muted-foreground">Day {day} Process Flow:</span>
            {dayHandoffs.map((h, i) => {
              const fromCfg = DEV[h.from];
              const toCfg = DEV[h.to];
              const rdy = isHandoffReady(h.id, getTaskStatus);
              return (
                <React.Fragment key={h.id}>
                  {i > 0 && <span className="text-muted-foreground/40">·</span>}
                  <span className="flex items-center gap-1">
                    <span className={cn('font-semibold', fromCfg.iconCls)}>{fromCfg.label}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className={cn('font-semibold', toCfg.iconCls)}>{toCfg.label}</span>
                    <span className="font-mono text-muted-foreground text-[8px]">({h.id})</span>
                    <span className={cn('text-[8px] px-1 rounded border font-semibold',
                      rdy ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}>{rdy ? '✓ ready' : '⏳ pending'}</span>
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 flex-col sm:flex-row">
          <StandupCard
            entry={claudeSD}
            dev="claude"
            day={day}
            getTaskStatus={getTaskStatus}
            onSave={onAddStandup}
          />
          <StandupCard
            entry={lovableSD}
            dev="lovable"
            day={day}
            getTaskStatus={getTaskStatus}
            onSave={onAddStandup}
          />
        </div>
        {dayStandups.length > 2 && (
          <p className="text-[9px] text-muted-foreground mt-1.5 pl-1">
            +{dayStandups.length - 2} earlier updates (showing latest per dev)
          </p>
        )}
      </section>

      {/* ── 4. HANDOFFS / ISSUE LINKS ────────────────────────────────────── */}
      {dayHandoffs.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2.5">
            <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Issue Links · Handoffs</span>
            <Separator className="flex-1" />
            <span className="text-[9px] text-muted-foreground">{dayHandoffs.length} link{dayHandoffs.length > 1 ? 's' : ''}</span>
          </div>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="grid grid-cols-[8px_40px_1fr_auto_auto_16px] gap-2 px-3 py-1.5 bg-muted/30 border-b border-border text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
              <span /><span>ID</span><span>Title</span><span>Status</span><span className="hidden sm:block">Priority</span><span />
            </div>
            {dayHandoffs.map(h => <HandoffRow key={h.id} h={h} getTaskStatus={getTaskStatus} />)}
          </div>
        </section>
      )}

    </div>
  );
};
