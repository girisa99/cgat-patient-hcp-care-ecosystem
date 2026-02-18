// Sprint Tracker — PO/SM Verification & Planning View — UX Polished
// - Progress bar at top
// - Category grouping with collapsible sections
// - "Mark all verified" per category button
// - Emoji icons: verify ✓ | approve 👍 | decide 🤔 | unblock 🔓

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardCheck, CheckCircle2, Eye, ThumbsUp, HelpCircle, KeyRound,
  Calendar, ArrowRight, AlertTriangle, Save, ChevronDown, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PO_CHECKLISTS, HANDOFFS, DEPENDENCY_CHAINS } from './data-dependencies';
import { SPRINT_TASKS } from './data-tasks';
import { SPRINT_DAYS } from './data-config';
import type { TaskStatus, Developer } from './types';

const CATEGORY_CONFIG = {
  verify:  { label: 'Verify',  emoji: '✓', icon: Eye,       color: 'text-blue-600',  bgColor: 'bg-blue-50',  borderColor: 'border-blue-200',  badgeCls: 'bg-blue-100 text-blue-700' },
  approve: { label: 'Approve', emoji: '👍', icon: ThumbsUp,  color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', badgeCls: 'bg-green-100 text-green-700' },
  decide:  { label: 'Decide',  emoji: '🤔', icon: HelpCircle,color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', badgeCls: 'bg-amber-100 text-amber-700' },
  unblock: { label: 'Unblock', emoji: '🔓', icon: KeyRound,  color: 'text-red-600',   bgColor: 'bg-red-50',   borderColor: 'border-red-200',   badgeCls: 'bg-red-100 text-red-700' },
};

const STORAGE_KEY = 'genie_sprint_po_checklist';

interface POVerificationViewProps {
  currentDay: number;
  getTaskStatus: (id: string) => TaskStatus;
}

export const POVerificationView: React.FC<POVerificationViewProps> = ({ currentDay, getTaskStatus }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });

  const [notes, setNotes] = useState<Record<number, string>>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY + '_notes'); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    verify: true, approve: true, decide: true, unblock: true,
  });

  const [selectedDay, setSelectedDay] = useState(currentDay);

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markAllCategory = (cat: string, items: typeof dayItems) => {
    setChecked(prev => {
      const allDone = items.every(i => prev[i.id]);
      const next = { ...prev };
      items.forEach(i => { next[i.id] = !allDone; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateNote = (day: number, value: string) => {
    setNotes(prev => {
      const next = { ...prev, [day]: value };
      localStorage.setItem(STORAGE_KEY + '_notes', JSON.stringify(next));
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const dayItems = PO_CHECKLISTS.filter(item => item.day === selectedDay);
  const dayComplete = dayItems.every(item => checked[item.id]);
  const dayProgress = dayItems.filter(item => checked[item.id]).length;
  const dayProgressPct = dayItems.length > 0 ? Math.round((dayProgress / dayItems.length) * 100) : 0;

  // Tomorrow's plan
  const tomorrowDay = Math.min(selectedDay + 1, 5);
  const tomorrowTasks = SPRINT_TASKS.filter(t => t.day === tomorrowDay);
  const tomorrowHandoffs = HANDOFFS.filter(h => h.day === tomorrowDay);
  const tomorrowBlockers = tomorrowTasks.filter(task => {
    const chain = DEPENDENCY_CHAINS.find(c => c.taskId === task.id);
    if (!chain) return false;
    return chain.blockedBy.some(depId => {
      if (depId.startsWith('H-')) return true;
      return getTaskStatus(depId) !== 'completed';
    });
  });

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start gap-3 pb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            📋 PO Actions & Notes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your single source of truth — Verify · Approve · Decide · Unblock · Notes per day.
            <span className="ml-1 inline-flex items-center gap-1 text-green-600 font-medium">
              <Save className="w-3 h-3" /> Auto-saved to browser.
            </span>
          </p>
        </div>
      </div>

      {/* ── Day selector ── */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm font-semibold mr-1">Sprint Day:</span>
        {SPRINT_DAYS.map(d => {
          const items = PO_CHECKLISTS.filter(i => i.day === d.day);
          const done = items.filter(i => checked[i.id]).length;
          const allDone = done === items.length && items.length > 0;
          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5',
                selectedDay === d.day ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80',
                d.day === currentDay && selectedDay !== d.day && 'ring-2 ring-primary/30',
              )}
            >
              {allDone && <CheckCircle2 className="w-3 h-3" />}
              Day {d.day}
              <span className="opacity-70">({done}/{items.length})</span>
            </button>
          );
        })}
      </div>

      {/* ── Progress bar ── */}
      <Card className={cn(dayComplete ? 'border-green-300 bg-green-50' : '')}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                Day {selectedDay} Verification
                {dayComplete && <span className="ml-2 text-green-700">— Complete! 🎉</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {dayProgress} of {dayItems.length} items verified
              </p>
            </div>
            <Badge className={cn(
              'text-base font-bold px-3 py-1',
              dayComplete ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-muted text-foreground',
            )}>
              {dayProgressPct}%
            </Badge>
          </div>
          <Progress
            value={dayProgressPct}
            className="h-3"
          />

          {/* Category quick overview */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {(['verify', 'approve', 'decide', 'unblock'] as const).map(cat => {
              const items = dayItems.filter(i => i.category === cat);
              const done = items.filter(i => checked[i.id]).length;
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <div key={cat} className={cn('rounded-lg p-2 text-center border', cfg.borderColor, cfg.bgColor)}>
                  <p className="text-lg leading-none">{cfg.emoji}</p>
                  <p className="text-[10px] font-semibold mt-0.5">{cfg.label}</p>
                  <p className={cn('text-[11px] font-bold', cfg.color)}>{done}/{items.length}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Collapsible category sections ── */}
      {(['verify', 'approve', 'decide', 'unblock'] as const).map(cat => {
        const items = dayItems.filter(i => i.category === cat);
        if (items.length === 0) return null;
        const cfg = CATEGORY_CONFIG[cat];
        const Icon = cfg.icon;
        const doneCnt = items.filter(i => checked[i.id]).length;
        const allDone = doneCnt === items.length;
        const isOpen = openCategories[cat] !== false;

        return (
          <Collapsible key={cat} open={isOpen} onOpenChange={() => toggleCategory(cat)}>
            <Card className={cn('overflow-hidden', allDone && 'border-green-300')}>
              {/* Header */}
              <CollapsibleTrigger asChild>
                <div className={cn(
                  'flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors',
                  cfg.bgColor,
                )}>
                  <div className="flex items-center gap-2">
                    {isOpen
                      ? <ChevronDown className={cn('w-4 h-4', cfg.color)} />
                      : <ChevronRight className={cn('w-4 h-4', cfg.color)} />}
                    <span className="text-lg">{cfg.emoji}</span>
                    <Icon className={cn('w-4 h-4', cfg.color)} />
                    <span className={cn('text-sm font-semibold', cfg.color)}>{cfg.label}</span>
                    <Badge className={cn('text-xs', cfg.badgeCls)}>
                      {doneCnt}/{items.length}
                    </Badge>
                    {allDone && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={e => { e.stopPropagation(); markAllCategory(cat, items); }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {items.every(i => checked[i.id]) ? 'Uncheck All' : 'Mark All ✓'}
                  </Button>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="p-0">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 border-t transition-colors',
                        checked[item.id] ? 'bg-green-50/50' : 'hover:bg-muted/30',
                        idx === 0 && 'border-t',
                      )}
                    >
                      <Checkbox
                        checked={checked[item.id] || false}
                        onCheckedChange={() => toggleCheck(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium',
                          checked[item.id] && 'line-through text-muted-foreground',
                        )}>
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {item.developer === 'both' ? (
                            <Badge variant="outline" className="text-xs">Both devs</Badge>
                          ) : item.developer === 'lovable' ? (
                            <Badge className="text-xs bg-pink-100 text-pink-700">⚡ Lovable</Badge>
                          ) : (
                            <Badge className="text-xs bg-purple-100 text-purple-700">🧠 Claude</Badge>
                          )}
                          {item.route && (
                            <Badge variant="outline" className="text-xs font-mono">{item.route}</Badge>
                          )}
                          {item.relatedTasks.map(t => {
                            const st = getTaskStatus(t);
                            return (
                              <Badge key={t} variant="outline" className={cn('text-xs font-mono',
                                st === 'completed' ? 'text-green-600 border-green-300' :
                                st === 'in-progress' ? 'text-blue-600 border-blue-300' : 'text-gray-500',
                              )}>
                                {t} ({st})
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      <Separator />

      {/* ── PO Notes ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Save className="w-4 h-4" /> PO Notes — Day {selectedDay}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes[selectedDay] || ''}
            onChange={e => updateNote(selectedDay, e.target.value)}
            placeholder={`Decisions made, feedback given, follow-ups for Day ${selectedDay}...`}
            rows={3}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1.5">Auto-saved to browser.</p>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Tomorrow's Plan ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Plan for Day {tomorrowDay}
            <Badge variant="outline" className="text-xs">{SPRINT_DAYS[tomorrowDay - 1]?.theme}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tomorrowBlockers.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                <AlertTriangle className="w-4 h-4" />
                {tomorrowBlockers.length} tasks blocked for tomorrow
              </div>
              {tomorrowBlockers.map(task => {
                const chain = DEPENDENCY_CHAINS.find(c => c.taskId === task.id);
                const unmet = chain?.blockedBy.filter(d => d.startsWith('H-') ? true : getTaskStatus(d) !== 'completed') ?? [];
                return (
                  <div key={task.id} className="flex items-start gap-2 text-xs pl-6 flex-wrap">
                    <Badge variant="outline" className="font-mono shrink-0">{task.id}</Badge>
                    <span className="flex-1 min-w-0">{task.title}</span>
                    <div className="flex items-center gap-1 flex-wrap shrink-0">
                      <ArrowRight className="w-3 h-3 text-red-400" />
                      <span className="text-red-600 font-medium">needs:</span>
                      {unmet.map(dep => <Badge key={dep} variant="outline" className="font-mono text-red-600 border-red-300">{dep}</Badge>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(['claude', 'lovable'] as Developer[]).map(dev => {
            const devTasks = tomorrowTasks.filter(t => t.developer === dev);
            if (devTasks.length === 0) return null;
            const totalHours = devTasks.reduce((s, t) => s + t.estimatedHours, 0);
            return (
              <div key={dev}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={dev === 'lovable' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}>
                    {dev === 'lovable' ? '⚡ Lovable' : '🧠 Claude'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{devTasks.length} tasks · ~{totalHours}h</span>
                </div>
                <div className="space-y-1.5 pl-2">
                  {devTasks.map(task => {
                    const chain = DEPENDENCY_CHAINS.find(c => c.taskId === task.id);
                    const isBlocked = chain?.blockedBy.some(d => d.startsWith('H-') ? true : getTaskStatus(d) !== 'completed');
                    return (
                      <div key={task.id} className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="font-mono w-14 justify-center">{task.id}</Badge>
                        <Badge className={cn('text-[10px]',
                          task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600',
                        )}>{task.priority}</Badge>
                        <span className={cn('flex-1 truncate', isBlocked && 'text-red-600')}>{task.title}</span>
                        {isBlocked
                          ? <Badge className="bg-red-100 text-red-700 text-[10px]">Blocked</Badge>
                          : <Badge className="bg-green-100 text-green-700 text-[10px]">Can Start</Badge>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {tomorrowHandoffs.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Handoffs to coordinate:</p>
              <div className="space-y-1.5 pl-2">
                {tomorrowHandoffs.map(h => (
                  <div key={h.id} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="font-mono">{h.id}</Badge>
                    <Badge className={cn('text-[10px]', h.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white')}>
                      {h.priority}
                    </Badge>
                    <span className="truncate">{h.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
