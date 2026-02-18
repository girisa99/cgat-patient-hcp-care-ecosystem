/**
 * PO Actions View — "What does the PO still need to do?"
 *
 * Shows ALL PO checklist items grouped by Day, filtered to what's still
 * pending. PO can mark items done (persisted via syncPOChecklist).
 * Lovable and Claude both see the same live state.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2, Circle, AlertTriangle, Flag, ClipboardList,
  ChevronDown, ChevronRight, ExternalLink, Brain, Zap, Users,
  ShieldCheck, HelpCircle, Eye, ThumbsUp, Unlock,
} from 'lucide-react';
import { PO_CHECKLISTS } from './data-dependencies';
import type { POChecklistItem } from './types';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface POActionsViewProps {
  currentDay: number;
  poChecklist: Record<string, boolean>;
  onUpdateChecklist: (checklist: Record<string, boolean>) => void;
  getTaskStatus: (id: string) => import('./types').TaskStatus;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<POChecklistItem['category'], {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  verify:  { label: 'Verify',  icon: Eye,          color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  approve: { label: 'Approve', icon: ThumbsUp,      color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  decide:  { label: 'Decide',  icon: HelpCircle,    color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  unblock: { label: 'Unblock', icon: Unlock,        color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
};

const DEV_CONFIG = {
  claude:  { label: 'Claude',  icon: Brain, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  lovable: { label: 'Lovable', icon: Zap,   color: 'text-pink-700',   bg: 'bg-pink-50',   border: 'border-pink-200' },
  both:    { label: 'Both',    icon: Users, color: 'text-slate-700',  bg: 'bg-slate-50',  border: 'border-slate-200' },
};

const DAY_THEMES = ['Foundation & Assessment', 'Genie Deck + Landing Products', 'Genie Spark + Landing Demos', 'Genie Mind + Landing Polish', 'Integration & Merge'];

// ─── Single checklist item card ───────────────────────────────────────────────

function POActionCard({
  item,
  isDone,
  onToggle,
  relatedTaskStatuses,
}: {
  item: POChecklistItem;
  isDone: boolean;
  onToggle: (id: string, done: boolean) => void;
  relatedTaskStatuses: Record<string, import('./types').TaskStatus>;
}) {
  const navigate = useNavigate();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const catCfg = CATEGORY_CONFIG[item.category];
  const devCfg = DEV_CONFIG[item.developer];
  const CatIcon = catCfg.icon;
  const DevIcon = devCfg.icon;

  // Are related dev tasks all done?
  const relatedDone = item.relatedTasks.length === 0 || item.relatedTasks.every(
    id => relatedTaskStatuses[id] === 'completed'
  );

  return (
    <div className={cn(
      'border rounded-lg p-4 transition-all',
      isDone
        ? 'bg-muted/30 border-border opacity-60'
        : 'bg-card border-border shadow-sm',
    )}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(item.id, !isDone)}
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-muted-foreground/40 hover:border-emerald-400',
          )}
        >
          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3 opacity-0" />}
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
                  const st = relatedTaskStatuses[tid];
                  return (
                    <span key={tid} className={cn(
                      'text-[9px] font-mono px-1.5 py-0.5 rounded border',
                      st === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
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

          {/* Dev tasks not done warning */}
          {!isDone && !relatedDone && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Waiting on dev tasks to complete before PO can verify
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
            {!isDone && relatedDone && (
              <Button size="sm" className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onToggle(item.id, true)}>
                <CheckCircle2 className="w-3 h-3" />Mark Done
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
              {note && (
                <Button size="sm" className="h-7 text-xs" onClick={() => {
                  onToggle(item.id, true);
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
  day, items, poChecklist, onToggle, getTaskStatus, currentDay,
}: {
  day: number;
  items: POChecklistItem[];
  poChecklist: Record<string, boolean>;
  onToggle: (id: string, done: boolean) => void;
  getTaskStatus: (id: string) => import('./types').TaskStatus;
  currentDay: number;
}) {
  const [open, setOpen] = useState(day <= currentDay);

  const doneCount = items.filter(i => poChecklist[i.id]).length;
  const pendingCount = items.length - doneCount;
  const isPast = day < currentDay;
  const isToday = day === currentDay;

  const relatedTaskStatuses: Record<string, import('./types').TaskStatus> = {};
  items.forEach(i => i.relatedTasks.forEach(t => { relatedTaskStatuses[t] = getTaskStatus(t); }));

  // Summary: which categories are pending?
  const pendingByCategory = items
    .filter(i => !poChecklist[i.id])
    .reduce<Record<string, number>>((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {});

  return (
    <div className={cn(
      'border rounded-xl overflow-hidden',
      day > currentDay ? 'opacity-50' : '',
    )}>
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          isPast && pendingCount > 0
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
          isPast && pendingCount > 0  ? 'bg-red-500 text-white' :
          isPast && pendingCount === 0 ? 'bg-green-500 text-white' :
          isToday                      ? 'bg-primary text-primary-foreground' :
                                         'bg-muted-foreground/20 text-muted-foreground',
        )}>
          {isPast && pendingCount === 0 ? '✓' : day}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Day {day} · {DAY_THEMES[day - 1]}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {doneCount}/{items.length} PO items done
            {pendingCount > 0 && (
              <span className={cn('ml-2 font-semibold', isPast ? 'text-red-600' : 'text-amber-600')}>
                — {pendingCount} still pending
              </span>
            )}
          </p>
        </div>

        {/* Category pills */}
        <div className="hidden sm:flex items-center gap-1 flex-wrap justify-end">
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
              relatedTaskStatuses={relatedTaskStatuses}
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
}) => {
  const [filterMode, setFilterMode] = useState<'pending' | 'all'>('pending');
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');

  // Compute stats
  const totalItems = PO_CHECKLISTS.length;
  const doneItems = PO_CHECKLISTS.filter(i => poChecklist[i.id]).length;
  const pendingItems = totalItems - doneItems;

  // Past-day pending items are overdue
  const overdueItems = PO_CHECKLISTS.filter(i => i.day < currentDay && !poChecklist[i.id]);
  const todayItems = PO_CHECKLISTS.filter(i => i.day === currentDay && !poChecklist[i.id]);

  // Category breakdown of pending
  const pendingByCategory = PO_CHECKLISTS
    .filter(i => !poChecklist[i.id] && i.day <= currentDay)
    .reduce<Record<string, number>>((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {});

  // Build filtered list
  const filteredItems = PO_CHECKLISTS.filter(i => {
    const dayMatch = filterDay === 'all' || i.day === filterDay;
    const modeMatch = filterMode === 'all' || !poChecklist[i.id];
    return dayMatch && modeMatch;
  });

  // Group by day
  const byDay = filteredItems.reduce<Record<number, POChecklistItem[]>>((acc, i) => {
    if (!acc[i.day]) acc[i.day] = [];
    acc[i.day].push(i);
    return acc;
  }, {});

  const handleToggle = (id: string, done: boolean) => {
    onUpdateChecklist({ ...poChecklist, [id]: done });
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Flag className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold">PO Actions Required</h2>
          {overdueItems.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold">
              <AlertTriangle className="w-3 h-3" />{overdueItems.length} overdue
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Every PO action required to unblock development. Updated live by both Lovable and Claude.
        </p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border rounded-lg p-3 bg-card">
          <p className="text-2xl font-bold text-foreground">{pendingItems}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Pending</p>
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
              />
            ))}
        </div>
      )}

      {/* ── Legend ── */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Legend</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', cfg.color, cfg.bg, cfg.border)}>
                  <Icon className="w-2.5 h-2.5" />{cfg.label}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Dev task pills show status: ✓ completed · … in-progress · ○ pending. PO can mark items done once related dev tasks are complete.
          State is synced live — both Claude and Lovable see updates instantly.
        </p>
      </div>
    </div>
  );
};

export default POActionsView;
