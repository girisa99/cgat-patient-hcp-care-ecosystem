/**
 * PO Actions View — "What does the PO still need to do?"
 *
 * BIDIRECTIONAL WIRING:
 * ─ Dev completes task → PO item auto-detects readiness → shows "Ready to action" banner
 * ─ PO marks item done → related dev tasks get status-confirmed (noted, not forced-completed)
 * ─ All state syncs live to Supabase — Claude and Lovable see updates instantly
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2, Circle, AlertTriangle, Flag, ClipboardList,
  ChevronDown, ChevronRight, ExternalLink, Brain, Zap, Users,
  ShieldCheck, HelpCircle, Eye, ThumbsUp, Unlock, Bell, Sparkles,
  ArrowRight, Clock,
} from 'lucide-react';
import { PO_CHECKLISTS } from './data-dependencies';
import type { POChecklistItem, TaskStatus } from './types';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface POActionsViewProps {
  currentDay: number;
  poChecklist: Record<string, boolean>;
  onUpdateChecklist: (checklist: Record<string, boolean>) => void;
  getTaskStatus: (id: string) => TaskStatus;
  /** When PO marks an item done, we can confirm/note the related dev tasks */
  onUpdateTaskStatus?: (taskId: string, status: TaskStatus, note?: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<POChecklistItem['category'], {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  verify:  { label: 'Verify',  icon: Eye,       color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  approve: { label: 'Approve', icon: ThumbsUp,   color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  decide:  { label: 'Decide',  icon: HelpCircle, color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  unblock: { label: 'Unblock', icon: Unlock,     color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200' },
};

const DEV_CONFIG = {
  claude:  { label: 'Claude',  icon: Brain, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  lovable: { label: 'Lovable', icon: Zap,   color: 'text-pink-700',   bg: 'bg-pink-50',   border: 'border-pink-200' },
  both:    { label: 'Both',    icon: Users, color: 'text-slate-700',  bg: 'bg-slate-50',  border: 'border-slate-200' },
};

const DAY_THEMES = ['Foundation & Assessment', 'Genie Deck + Landing Products', 'Genie Spark + Landing Demos', 'Genie Mind + Landing Polish', 'Integration & Merge'];

/** Returns true if ALL related dev tasks are done (or no related tasks exist) */
function isDevWorkReady(item: POChecklistItem, getTaskStatus: (id: string) => TaskStatus): boolean {
  if (item.relatedTasks.length === 0) return true;
  return item.relatedTasks.every(id => getTaskStatus(id) === 'completed');
}

/** Returns { done, inProgress, pending } counts */
function relatedTaskBreakdown(item: POChecklistItem, getTaskStatus: (id: string) => TaskStatus) {
  let done = 0, inProgress = 0, pending = 0;
  for (const id of item.relatedTasks) {
    const s = getTaskStatus(id);
    if (s === 'completed') done++;
    else if (s === 'in-progress') inProgress++;
    else pending++;
  }
  return { done, inProgress, pending, total: item.relatedTasks.length };
}

// ─── Single checklist item card ───────────────────────────────────────────────

function POActionCard({
  item,
  isDone,
  onToggle,
  getTaskStatus,
  isNewlyUnlocked,
}: {
  item: POChecklistItem;
  isDone: boolean;
  onToggle: (id: string, done: boolean, note?: string) => void;
  getTaskStatus: (id: string) => TaskStatus;
  isNewlyUnlocked: boolean;
}) {
  const navigate = useNavigate();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const catCfg = CATEGORY_CONFIG[item.category];
  const devCfg = DEV_CONFIG[item.developer];
  const CatIcon = catCfg.icon;
  const DevIcon = devCfg.icon;

  const devReady = isDevWorkReady(item, getTaskStatus);
  const breakdown = relatedTaskBreakdown(item, getTaskStatus);

  return (
    <div className={cn(
      'border rounded-lg p-4 transition-all',
      isDone
        ? 'bg-muted/30 border-border opacity-60'
        : isNewlyUnlocked
          ? 'bg-emerald-50/50 border-emerald-300 shadow-sm ring-1 ring-emerald-200'
          : devReady
            ? 'bg-card border-border shadow-sm'
            : 'bg-card border-border',
    )}>
      {/* "Ready to action" banner — fires when dev tasks just completed */}
      {!isDone && isNewlyUnlocked && (
        <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 bg-emerald-100 border border-emerald-300 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-bold text-emerald-700">Dev work just completed — ready for your action!</span>
          <Bell className="w-3 h-3 text-emerald-500 ml-auto animate-pulse shrink-0" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => !isDone && devReady && onToggle(item.id, true, note || undefined)}
          disabled={!devReady && !isDone}
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : devReady
                ? 'border-emerald-400 hover:bg-emerald-50 cursor-pointer'
                : 'border-muted-foreground/30 cursor-not-allowed opacity-50',
          )}
        >
          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
        </button>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground">{item.id}</span>
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', catCfg.color, catCfg.bg, catCfg.border)}>
                <CatIcon className="w-2.5 h-2.5" />{catCfg.label}
              </span>
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', devCfg.color, devCfg.bg, devCfg.border)}>
                <DevIcon className="w-2.5 h-2.5" />{devCfg.label}
              </span>
            </div>

            {/* Related task pills */}
            {item.relatedTasks.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {item.relatedTasks.map(tid => {
                  const st = getTaskStatus(tid);
                  return (
                    <span key={tid} className={cn(
                      'text-[9px] font-mono px-1.5 py-0.5 rounded border',
                      st === 'completed'   ? 'bg-green-50 text-green-700 border-green-200' :
                      st === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                             'bg-muted text-muted-foreground border-border',
                    )}>
                      {tid} {st === 'completed' ? '✓' : st === 'in-progress' ? '…' : '○'}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Title */}
          <p className={cn('text-sm font-semibold mt-1.5', isDone && 'line-through text-muted-foreground')}>
            {item.title}
          </p>

          {/* Description */}
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>

          {/* Dev task progress bar (when tasks exist and not all done) */}
          {item.relatedTasks.length > 0 && !isDone && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Dev tasks: {breakdown.done}/{breakdown.total} done
                  {breakdown.inProgress > 0 && <span className="text-amber-600 ml-1">· {breakdown.inProgress} in progress</span>}
                </span>
                {devReady
                  ? <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />Ready for PO</span>
                  : <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" />Waiting on dev</span>
                }
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', devReady ? 'bg-emerald-500' : 'bg-amber-400')}
                  style={{ width: `${breakdown.total > 0 ? Math.round((breakdown.done / breakdown.total) * 100) : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Waiting banner when dev tasks incomplete */}
          {!isDone && !devReady && breakdown.pending === breakdown.total && breakdown.total > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Dev work not started — PO action blocked until tasks complete
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {item.route && !isDone && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                onClick={() => navigate(item.route!)}>
                <ExternalLink className="w-3 h-3" />Open {item.route}
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-muted-foreground"
              onClick={() => setNoteOpen(o => !o)}>
              <ClipboardList className="w-3 h-3" />
              {noteOpen ? 'Hide note' : 'Add note'}
            </Button>
            {!isDone && devReady && (
              <Button
                size="sm"
                className={cn('h-7 text-xs gap-1.5 text-white', isNewlyUnlocked ? 'bg-emerald-600 hover:bg-emerald-700 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700')}
                onClick={() => onToggle(item.id, true, note || undefined)}
              >
                <CheckCircle2 className="w-3 h-3" />Mark Done
              </Button>
            )}
            {isDone && (
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-muted-foreground"
                onClick={() => onToggle(item.id, false)}>
                Undo
              </Button>
            )}
          </div>

          {/* Note area */}
          {noteOpen && (
            <div className="mt-2 space-y-1.5">
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add PO decision or note here…"
                className="text-xs min-h-[60px] resize-none"
              />
              {note && devReady && (
                <Button size="sm" className="h-7 text-xs" onClick={() => {
                  onToggle(item.id, true, note);
                  setNoteOpen(false);
                }}>
                  Save & Mark Done
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Day Section ──────────────────────────────────────────────────────────────

function DaySection({
  day, items, poChecklist, onToggle, getTaskStatus, currentDay, newlyUnlockedIds,
}: {
  day: number;
  items: POChecklistItem[];
  poChecklist: Record<string, boolean>;
  onToggle: (id: string, done: boolean, note?: string) => void;
  getTaskStatus: (id: string) => TaskStatus;
  currentDay: number;
  newlyUnlockedIds: Set<string>;
}) {
  const [open, setOpen] = useState(day <= currentDay);

  const doneCount = items.filter(i => poChecklist[i.id]).length;
  const pendingCount = items.length - doneCount;
  const isPast = day < currentDay;
  const isToday = day === currentDay;

  // Count items that are newly unlocked (dev done, PO not yet done)
  const newlyUnlockedCount = items.filter(i => newlyUnlockedIds.has(i.id)).length;

  // Summary: which categories are pending?
  const pendingByCategory = items
    .filter(i => !poChecklist[i.id])
    .reduce<Record<string, number>>((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {});

  return (
    <div className={cn(
      'border rounded-xl overflow-hidden transition-all',
      newlyUnlockedCount > 0 ? 'border-emerald-300 shadow-sm' : '',
      day > currentDay ? 'opacity-50' : '',
    )}>
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          newlyUnlockedCount > 0
            ? 'bg-emerald-50 hover:bg-emerald-100'
            : isPast && pendingCount > 0
              ? 'bg-red-50 hover:bg-red-100'
              : isPast
                ? 'bg-green-50 hover:bg-green-100'
                : isToday
                  ? 'bg-primary/5 hover:bg-primary/10'
                  : 'bg-muted/40 hover:bg-muted/60',
        )}
      >
        {/* Day badge */}
        <span className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
          newlyUnlockedCount > 0      ? 'bg-emerald-500 text-white' :
          isPast && pendingCount > 0  ? 'bg-red-500 text-white' :
          isPast && pendingCount === 0 ? 'bg-green-500 text-white' :
          isToday                      ? 'bg-primary text-primary-foreground' :
                                         'bg-muted-foreground/20 text-muted-foreground',
        )}>
          {isPast && pendingCount === 0 ? '✓' : newlyUnlockedCount > 0 ? <Bell className="w-3.5 h-3.5" /> : day}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Day {day} · {DAY_THEMES[day - 1]}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {doneCount}/{items.length} PO items done
            {newlyUnlockedCount > 0 && (
              <span className="ml-2 font-bold text-emerald-600">
                — {newlyUnlockedCount} newly ready to action!
              </span>
            )}
            {newlyUnlockedCount === 0 && pendingCount > 0 && (
              <span className={cn('ml-2 font-semibold', isPast ? 'text-red-600' : 'text-amber-600')}>
                — {pendingCount} still pending
              </span>
            )}
          </p>
        </div>

        {/* Category pills */}
        <div className="hidden sm:flex items-center gap-1 flex-wrap justify-end">
          {newlyUnlockedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
              <Sparkles className="w-2.5 h-2.5" />{newlyUnlockedCount} ready
            </span>
          )}
          {Object.entries(pendingByCategory).map(([cat, count]) => {
            const cfg = CATEGORY_CONFIG[cat as POChecklistItem['category']];
            const Icon = cfg.icon;
            return (
              <span key={cat} className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border', cfg.color, cfg.bg, cfg.border)}>
                <Icon className="w-2.5 h-2.5" />{count}
              </span>
            );
          })}
        </div>

        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Item list */}
      {open && (
        <div className="px-4 py-3 space-y-3 bg-background border-t">
          {items.map(item => (
            <POActionCard
              key={item.id}
              item={item}
              isDone={!!poChecklist[item.id]}
              onToggle={onToggle}
              getTaskStatus={getTaskStatus}
              isNewlyUnlocked={newlyUnlockedIds.has(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export const POActionsView: React.FC<POActionsViewProps> = ({
  currentDay,
  poChecklist,
  onUpdateChecklist,
  getTaskStatus,
  onUpdateTaskStatus,
}) => {
  const [filterMode, setFilterMode] = useState<'pending' | 'all'>('pending');
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');

  // ── Compute "newly unlocked" items ──────────────────────────────────────────
  // An item is "newly unlocked" when:
  //   1. PO hasn't marked it done yet
  //   2. All related dev tasks ARE completed
  // We track a "seen" set so we only flash items the FIRST time dev work completes.
  const seenReadyRef = useRef<Set<string>>(new Set());
  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const freshlyReady = new Set<string>();
    for (const item of PO_CHECKLISTS) {
      if (poChecklist[item.id]) continue; // already done
      if (item.day > currentDay) continue; // future
      if (!isDevWorkReady(item, getTaskStatus)) continue; // dev not done yet
      // Dev IS done and PO hasn't acted yet
      if (!seenReadyRef.current.has(item.id)) {
        freshlyReady.add(item.id);
        seenReadyRef.current.add(item.id);
      }
    }
    if (freshlyReady.size > 0) {
      setNewlyUnlockedIds(prev => {
        const next = new Set(prev);
        freshlyReady.forEach(id => next.add(id));
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTaskStatus, poChecklist, currentDay]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalItems = PO_CHECKLISTS.length;
  const doneItems = PO_CHECKLISTS.filter(i => poChecklist[i.id]).length;
  const pendingItems = totalItems - doneItems;
  const overdueItems = PO_CHECKLISTS.filter(i => i.day < currentDay && !poChecklist[i.id]);
  const todayItems = PO_CHECKLISTS.filter(i => i.day === currentDay && !poChecklist[i.id]);
  const readyToActionCount = newlyUnlockedIds.size;

  const pendingByCategory = PO_CHECKLISTS
    .filter(i => !poChecklist[i.id] && i.day <= currentDay)
    .reduce<Record<string, number>>((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {});

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredItems = PO_CHECKLISTS.filter(i => {
    const dayMatch = filterDay === 'all' || i.day === filterDay;
    const modeMatch = filterMode === 'all' || !poChecklist[i.id];
    return dayMatch && modeMatch;
  });

  const byDay = filteredItems.reduce<Record<number, POChecklistItem[]>>((acc, i) => {
    if (!acc[i.day]) acc[i.day] = [];
    acc[i.day].push(i);
    return acc;
  }, {});

  // ── Toggle handler (bidirectional) ───────────────────────────────────────────
  const handleToggle = (id: string, done: boolean, note?: string) => {
    // 1. Update PO checklist state (syncs to Supabase)
    onUpdateChecklist({ ...poChecklist, [id]: done });

    // 2. If marking done, remove from newly-unlocked flash set
    if (done) {
      setNewlyUnlockedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }

    // 3. When PO marks an "approve" or "unblock" item done AND dev tasks exist,
    //    add a PO-confirmation note to those tasks (does NOT force-complete them —
    //    only Claude/Lovable can mark their own tasks complete)
    if (done && onUpdateTaskStatus) {
      const item = PO_CHECKLISTS.find(i => i.id === id);
      if (item && (item.category === 'approve' || item.category === 'unblock')) {
        for (const taskId of item.relatedTasks) {
          const currentStatus = getTaskStatus(taskId);
          // Only add note if task is still pending/in-progress — don't downgrade completed tasks
          if (currentStatus === 'pending') {
            onUpdateTaskStatus(taskId, 'in-progress', `PO approved via ${id}${note ? ': ' + note : ''} — cleared to proceed`);
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Flag className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold">PO Actions Required</h2>
          {readyToActionCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-bold animate-pulse">
              <Bell className="w-3 h-3" />{readyToActionCount} newly ready!
            </span>
          )}
          {overdueItems.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold">
              <AlertTriangle className="w-3 h-3" />{overdueItems.length} overdue
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Dynamically tracks when dev tasks complete and flags PO items that are now actionable. State syncs live to Supabase — Claude and Lovable see your decisions instantly.
        </p>
      </div>

      {/* ── "Newly ready" spotlight banner ── */}
      {readyToActionCount > 0 && (
        <div className="border border-emerald-300 bg-emerald-50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />Dev work just completed — your turn!
          </p>
          {PO_CHECKLISTS.filter(i => newlyUnlockedIds.has(i.id)).map(item => (
            <div key={item.id} className="flex items-center gap-2 text-xs text-emerald-700 bg-white rounded border border-emerald-200 px-3 py-2">
              <ArrowRight className="w-3 h-3 shrink-0 text-emerald-500" />
              <span className="font-mono text-emerald-500 shrink-0">{item.id}</span>
              <span className="font-semibold">{item.title}</span>
              <span className="ml-auto text-[10px] shrink-0 font-semibold uppercase text-emerald-600">
                {CATEGORY_CONFIG[item.category].label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={cn('border rounded-lg p-3', readyToActionCount > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-card')}>
          <p className={cn('text-2xl font-bold', readyToActionCount > 0 ? 'text-emerald-700' : 'text-foreground')}>
            {readyToActionCount > 0 ? readyToActionCount : pendingItems}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {readyToActionCount > 0 ? 'Ready to Action' : 'Total Pending'}
          </p>
        </div>
        <div className="border rounded-lg p-3 bg-red-50 border-red-200">
          <p className="text-2xl font-bold text-red-700">{overdueItems.length}</p>
          <p className="text-xs text-red-600 mt-0.5">Overdue (Days 1–{currentDay - 1})</p>
        </div>
        <div className="border rounded-lg p-3 bg-amber-50 border-amber-200">
          <p className="text-2xl font-bold text-amber-700">{todayItems.length}</p>
          <p className="text-xs text-amber-600 mt-0.5">Today (Day {currentDay})</p>
        </div>
        <div className="border rounded-lg p-3 bg-green-50 border-green-200">
          <p className="text-2xl font-bold text-green-700">{doneItems}</p>
          <p className="text-xs text-green-600 mt-0.5">Completed</p>
        </div>
      </div>

      {/* ── Category breakdown ── */}
      {Object.keys(pendingByCategory).length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
          <span className="text-xs font-semibold text-muted-foreground self-center">Active pending by type:</span>
          {Object.entries(pendingByCategory).map(([cat, count]) => {
            const cfg = CATEGORY_CONFIG[cat as POChecklistItem['category']];
            const Icon = cfg.icon;
            return (
              <span key={cat} className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border', cfg.color, cfg.bg, cfg.border)}>
                <Icon className="w-3 h-3" />{cfg.label}: {count}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Critical open decisions ── */}
      {['PO-206', 'PO-305'].some(id => !poChecklist[id]) && (
        <div className="border border-amber-300 bg-amber-50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />Open Decisions Blocking Dev Work
          </p>
          {!poChecklist['PO-206'] && (
            <div className="text-xs text-amber-700 bg-white rounded border border-amber-200 px-3 py-2">
              <span className="font-semibold">PO-206:</span> Tier gating for /genie-deck — choose (A) soft-gate CTA only OR (B) hard redirect guard. Unblocks Claude & Lovable.
            </div>
          )}
          {!poChecklist['PO-305'] && (
            <div className="text-xs text-amber-700 bg-white rounded border border-amber-200 px-3 py-2">
              <span className="font-semibold">PO-305:</span> AI generation quality — is simulated AI acceptable for MVP or require real API? Unblocks C-301 final sign-off.
            </div>
          )}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border overflow-hidden text-xs font-semibold">
          <button
            onClick={() => setFilterMode('pending')}
            className={cn('px-3 py-1.5 transition-colors', filterMode === 'pending' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
          >
            Pending only
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={cn('px-3 py-1.5 transition-colors', filterMode === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
          >
            All items
          </button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 1, 2, 3, 4, 5] as const).map(d => (
            <button
              key={d}
              onClick={() => setFilterDay(d)}
              className={cn(
                'px-2.5 py-1 rounded-md border text-xs font-medium transition-colors',
                filterDay === d ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-muted border-border',
              )}
            >
              {d === 'all' ? 'All Days' : `Day ${d}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Day sections ── */}
      {Object.keys(byDay).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <ShieldCheck className="w-12 h-12 text-green-500" />
          <p className="text-base font-semibold text-green-700">All PO items done for this filter! 🎉</p>
          <p className="text-sm">Switch to "All items" to review completed actions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byDay)
            .sort(([a], [b]) => +a - +b)
            .map(([dayStr, items]) => (
              <DaySection
                key={dayStr}
                day={+dayStr}
                items={items}
                poChecklist={poChecklist}
                onToggle={handleToggle}
                getTaskStatus={getTaskStatus}
                currentDay={currentDay}
                newlyUnlockedIds={newlyUnlockedIds}
              />
            ))}
        </div>
      )}

      {/* ── How it works legend ── */}
      <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">How dynamic updates work</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Dev completes task</p>
              <p>PO item auto-highlights with "Ready to action" banner. No manual refresh needed.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">PO marks item done</p>
              <p>For Approve/Unblock items: pending dev tasks are flagged "PO cleared — proceed" so Claude & Lovable know.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-3 h-3 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Live Supabase sync</p>
              <p>All checklist changes sync instantly. Both Claude and Lovable see PO decisions in real-time.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1 border-t">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="flex items-center gap-1.5">
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', cfg.color, cfg.bg, cfg.border)}>
                  <Icon className="w-2.5 h-2.5" />{cfg.label}
                </span>
              </div>
            );
          })}
          <span className="text-[10px] text-muted-foreground self-center ml-1">
            Dev task pills: ✓ done · … in-progress · ○ pending
          </span>
        </div>
      </div>
    </div>
  );
};

export default POActionsView;
