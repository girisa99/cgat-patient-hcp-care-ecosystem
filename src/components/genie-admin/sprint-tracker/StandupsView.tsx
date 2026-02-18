// Sprint Tracker — Standups View
// Layout: Day tabs (1-5) across top, Claude + Lovable cards side-by-side per day
// Auto-filled: existing standup data populates automatically; add-form at bottom per day

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Brain, Save, AlertTriangle, CheckCircle2, Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Developer, StandupEntry } from './types';
import { SPRINT_DAYS } from './data-config';

interface StandupsViewProps {
  standups: StandupEntry[];
  selectedDay: number;
  onAddStandup: (entry: Omit<StandupEntry, 'createdAt'>) => void;
}

// ─── Role config ──────────────────────────────────────────────────────────────

const DEV_CFG = {
  claude: {
    label: 'Claude',
    role: 'Tech Lead',
    icon: Brain,
    border: 'border-violet-400',
    headerBg: 'bg-violet-50',
    iconCls: 'text-violet-600',
    badgeCls: 'bg-violet-100 text-violet-700 border-violet-300',
    dotCls: 'bg-violet-400',
  },
  lovable: {
    label: 'Lovable',
    role: 'Dev / UI',
    icon: Zap,
    border: 'border-pink-400',
    headerBg: 'bg-pink-50',
    iconCls: 'text-pink-600',
    badgeCls: 'bg-pink-100 text-pink-700 border-pink-300',
    dotCls: 'bg-pink-400',
  },
} as const;

// ─── Single developer standup card ───────────────────────────────────────────

function StandupCard({ entry, dev }: { entry?: StandupEntry; dev: Developer }) {
  const cfg = DEV_CFG[dev];
  const Icon = cfg.icon;

  if (!entry) {
    return (
      <div className={cn(
        'rounded-xl border-2 border-dashed p-5 flex flex-col items-center justify-center gap-2 min-h-[140px]',
        dev === 'claude' ? 'border-violet-200' : 'border-pink-200',
      )}>
        <Icon className={cn('w-5 h-5 opacity-30', cfg.iconCls)} />
        <p className="text-xs text-muted-foreground text-center">No standup logged yet</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border-2 overflow-hidden', cfg.border)}>
      {/* Card header */}
      <div className={cn('flex items-center gap-2 px-4 py-2.5', cfg.headerBg)}>
        <Icon className={cn('w-4 h-4 shrink-0', cfg.iconCls)} />
        <span className="font-semibold text-sm">{cfg.label}</span>
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border', cfg.badgeCls)}>
          {cfg.role}
        </Badge>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Card body */}
      <div className="px-4 py-3 space-y-2.5 bg-card">
        {entry.yesterday && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Completed
            </p>
            <p className="text-sm leading-relaxed">{entry.yesterday}</p>
          </div>
        )}
        {entry.today && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" /> Working on
            </p>
            <p className="text-sm leading-relaxed">{entry.today}</p>
          </div>
        )}
        {entry.blockers && entry.blockers !== 'None' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 mb-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Blockers
            </p>
            <p className="text-sm text-amber-900 leading-relaxed">{entry.blockers}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add standup form (collapsed by default) ──────────────────────────────────

function AddStandupForm({ day, dev, onSave }: {
  day: number; dev: Developer; onSave: (entry: Omit<StandupEntry, 'createdAt'>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const cfg = DEV_CFG[dev];
  const Icon = cfg.icon;

  const handleSave = () => {
    if (!yesterday.trim() && !today.trim()) return;
    onSave({ day, developer: dev, yesterday, today, blockers: blockers || 'None' });
    setYesterday(''); setToday(''); setBlockers('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed text-xs font-medium transition-all',
          dev === 'claude'
            ? 'border-violet-300 text-violet-600 hover:bg-violet-50'
            : 'border-pink-300 text-pink-600 hover:bg-pink-50',
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        <Icon className="w-3.5 h-3.5" />
        Add {cfg.label} standup
      </button>
    );
  }

  return (
    <div className={cn('rounded-xl border-2 overflow-hidden', cfg.border)}>
      <div className={cn('flex items-center gap-2 px-4 py-2', cfg.headerBg)}>
        <Icon className={cn('w-4 h-4', cfg.iconCls)} />
        <span className="text-sm font-semibold">{cfg.label} — Day {day} Standup</span>
      </div>
      <div className="px-4 py-3 space-y-2.5 bg-card">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Completed</p>
          <Textarea value={yesterday} onChange={e => setYesterday(e.target.value)} rows={2} className="text-sm" placeholder="What did I complete?" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Working on</p>
          <Textarea value={today} onChange={e => setToday(e.target.value)} rows={2} className="text-sm" placeholder="What am I working on today?" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Blockers</p>
          <Textarea value={blockers} onChange={e => setBlockers(e.target.value)} rows={1} className="text-sm" placeholder="Any blockers? (leave blank if none)" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs h-7">
            <Save className="w-3.5 h-3.5" /> Log Standup
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="text-xs h-7">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const StandupsView: React.FC<StandupsViewProps> = ({ standups, selectedDay, onAddStandup }) => {
  const [activeDay, setActiveDay] = useState(selectedDay);

  // Last standup per dev per day
  const getEntry = (day: number, dev: Developer): StandupEntry | undefined => {
    const all = standups.filter(s => s.day === day && s.developer === dev);
    return all[all.length - 1]; // most recent
  };

  const hasAny = (day: number) => standups.some(s => s.day === day);

  return (
    <div className="space-y-4">

      {/* ── Day tabs ── */}
      <div className="flex items-center gap-0 border-b overflow-x-auto">
        {SPRINT_DAYS.map(d => {
          const filled = hasAny(d.day);
          const isActive = activeDay === d.day;
          const isToday = d.day === selectedDay;

          return (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-sm font-medium transition-all whitespace-nowrap shrink-0',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
              )}
            >
              <span className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                filled   ? 'bg-green-500 text-white' :
                isToday  ? 'bg-primary text-primary-foreground' :
                           'bg-muted text-muted-foreground',
              )}>
                {filled ? '✓' : d.day}
              </span>
              Day {d.day}
              {isToday && !isActive && (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1 rounded">TODAY</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Day header ── */}
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold">Day {activeDay}</span>
        <span className="text-sm text-muted-foreground">—</span>
        <span className="text-sm text-muted-foreground">{SPRINT_DAYS[activeDay - 1]?.theme}</span>
        {activeDay === selectedDay && (
          <Badge className="text-[10px] px-2 py-0 bg-primary/10 text-primary border border-primary/20">Today</Badge>
        )}
      </div>

      {/* ── Side-by-side cards ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <StandupCard entry={getEntry(activeDay, 'claude')} dev="claude" />
          <AddStandupForm day={activeDay} dev="claude" onSave={onAddStandup} />
        </div>
        <div className="space-y-2">
          <StandupCard entry={getEntry(activeDay, 'lovable')} dev="lovable" />
          <AddStandupForm day={activeDay} dev="lovable" onSave={onAddStandup} />
        </div>
      </div>

      {/* ── History: multiple entries in day ── */}
      {(() => {
        const dayEntries = standups.filter(s => s.day === activeDay);
        if (dayEntries.length <= 2) return null;
        return (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Earlier entries this day</p>
            {dayEntries.slice(0, -2).map((entry, i) => {
              const cfg = DEV_CFG[entry.developer];
              return (
                <div key={i} className={cn('border-l-4 pl-3 py-1', entry.developer === 'claude' ? 'border-violet-300' : 'border-pink-300')}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={cn('text-xs font-semibold', cfg.iconCls)}>{cfg.label}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  {entry.yesterday && <p className="text-xs text-muted-foreground line-clamp-1">✓ {entry.yesterday}</p>}
                  {entry.today && <p className="text-xs text-muted-foreground line-clamp-1">→ {entry.today}</p>}
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};
