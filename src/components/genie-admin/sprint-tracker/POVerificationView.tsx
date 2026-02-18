// Sprint Tracker — PO/SM Verification & Planning View
// Daily checklist for the Product Owner / Scrum Master to verify, approve, decide, unblock

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardCheck, CheckCircle2, Eye, ThumbsUp, HelpCircle, KeyRound,
  Calendar, ArrowRight, AlertTriangle, Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PO_CHECKLISTS, HANDOFFS, DEPENDENCY_CHAINS } from './data-dependencies';
import { SPRINT_TASKS } from './data-tasks';
import { SPRINT_DAYS } from './data-config';
import type { TaskStatus, Developer, POChecklistItem } from './types';

const CATEGORY_CONFIG = {
  verify: { label: 'Verify', icon: Eye, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  approve: { label: 'Approve', icon: ThumbsUp, color: 'text-green-600', bgColor: 'bg-green-50' },
  decide: { label: 'Decide', icon: HelpCircle, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  unblock: { label: 'Unblock', icon: KeyRound, color: 'text-red-600', bgColor: 'bg-red-50' },
};

const STORAGE_KEY = 'genie_sprint_po_checklist';

interface POVerificationViewProps {
  currentDay: number;
  getTaskStatus: (id: string) => TaskStatus;
}

export const POVerificationView: React.FC<POVerificationViewProps> = ({ currentDay, getTaskStatus }) => {
  // PO checklist state persisted to localStorage
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const [notes, setNotes] = useState<Record<number, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_notes');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const [selectedDay, setSelectedDay] = useState(currentDay);

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
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

  const dayItems = PO_CHECKLISTS.filter(item => item.day === selectedDay);
  const dayComplete = dayItems.every(item => checked[item.id]);
  const dayProgress = dayItems.filter(item => checked[item.id]).length;

  // Tomorrow's plan: tasks that should be ready
  const tomorrowDay = Math.min(selectedDay + 1, 5);
  const tomorrowTasks = SPRINT_TASKS.filter(t => t.day === tomorrowDay);
  const tomorrowHandoffs = HANDOFFS.filter(h => h.day === tomorrowDay);

  // Identify blockers for tomorrow
  const tomorrowBlockers = tomorrowTasks.filter(task => {
    const chain = DEPENDENCY_CHAINS.find(c => c.taskId === task.id);
    if (!chain) return false;
    return chain.blockedBy.some(depId => {
      if (depId.startsWith('H-')) return true; // handoff not yet tracked
      return getTaskStatus(depId) !== 'completed';
    });
  });

  return (
    <div className="space-y-6">
      {/* ── Day selector ── */}
      <div className="flex gap-2 flex-wrap items-center">
        <ClipboardCheck className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground mr-2">PO Daily Checklist:</span>
        {SPRINT_DAYS.map(d => {
          const items = PO_CHECKLISTS.filter(i => i.day === d.day);
          const done = items.filter(i => checked[i.id]).length;
          const allDone = done === items.length;
          return (
            <button key={d.day} onClick={() => setSelectedDay(d.day)}
              className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                selectedDay === d.day ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
                d.day === currentDay && selectedDay !== d.day && 'ring-2 ring-primary/30')}>
              {allDone && <CheckCircle2 className="w-3.5 h-3.5" />}
              Day {d.day} ({done}/{items.length})
            </button>
          );
        })}
      </div>

      {/* ── Completion banner ── */}
      {dayComplete && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Day {selectedDay} verification complete!</p>
              <p className="text-sm text-green-600">All {dayItems.length} items verified. Ready for next day planning.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Checklist grouped by category ── */}
      {(['verify', 'approve', 'decide', 'unblock'] as const).map(cat => {
        const items = dayItems.filter(i => i.category === cat);
        if (items.length === 0) return null;
        const config = CATEGORY_CONFIG[cat];
        const Icon = config.icon;

        return (
          <Card key={cat}>
            <CardHeader className={cn('pb-2', config.bgColor)}>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className={cn('w-5 h-5', config.color)} />
                {config.label} ({items.filter(i => checked[i.id]).length}/{items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-3">
              {items.map(item => (
                <div key={item.id} className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-all',
                  checked[item.id] ? 'bg-green-50/50' : 'hover:bg-muted/50',
                )}>
                  <Checkbox
                    checked={checked[item.id] || false}
                    onCheckedChange={() => toggleCheck(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', checked[item.id] && 'line-through text-muted-foreground')}>
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.developer === 'both' ? (
                        <Badge variant="outline" className="text-xs">Both devs</Badge>
                      ) : item.developer === 'lovable' ? (
                        <Badge className="text-xs bg-pink-100 text-pink-700">Lovable</Badge>
                      ) : (
                        <Badge className="text-xs bg-purple-100 text-purple-700">Claude</Badge>
                      )}
                      {item.route && (
                        <Badge variant="outline" className="text-xs font-mono">{item.route}</Badge>
                      )}
                      {item.relatedTasks.map(t => {
                        const st = getTaskStatus(t);
                        return (
                          <Badge key={t} variant="outline" className={cn('text-xs font-mono',
                            st === 'completed' ? 'text-green-600 border-green-300' :
                            st === 'in-progress' ? 'text-blue-600 border-blue-300' :
                            'text-gray-500')}>
                            {t} ({st})
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <Separator />

      {/* ── PO Notes for the Day ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Save className="w-5 h-5" /> PO Notes — Day {selectedDay}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes[selectedDay] || ''}
            onChange={e => updateNote(selectedDay, e.target.value)}
            placeholder={`Decisions made, feedback given, things to follow up on for Day ${selectedDay}...`}
            rows={4}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1.5">Auto-saved to browser. Use this for your daily notes.</p>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Tomorrow's Plan ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Plan for Day {tomorrowDay}
            <Badge variant="outline" className="text-xs">{SPRINT_DAYS[tomorrowDay - 1]?.theme}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Blocker alert */}
          {tomorrowBlockers.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                <AlertTriangle className="w-4 h-4" />
                {tomorrowBlockers.length} tasks blocked for tomorrow
              </div>
              {tomorrowBlockers.map(task => {
                const chain = DEPENDENCY_CHAINS.find(c => c.taskId === task.id);
                const unmet = chain?.blockedBy.filter(d => {
                  if (d.startsWith('H-')) return true;
                  return getTaskStatus(d) !== 'completed';
                }) ?? [];
                return (
                  <div key={task.id} className="flex items-start gap-2 text-sm pl-6 flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs shrink-0">{task.id}</Badge>
                    <span className="flex-1 min-w-0">{task.title}</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <ArrowRight className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="text-red-600 text-xs font-medium shrink-0">needs:</span>
                      {unmet.map(dep => (
                        <Badge key={dep} variant="outline" className="font-mono text-xs text-red-600 border-red-300">{dep}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tasks by developer */}
          {(['claude', 'lovable'] as Developer[]).map(dev => {
            const devTasks = tomorrowTasks.filter(t => t.developer === dev);
            if (devTasks.length === 0) return null;
            const totalHours = devTasks.reduce((s, t) => s + t.estimatedHours, 0);
            return (
              <div key={dev}>
                <div className="flex items-center gap-2 mb-2">
                  {dev === 'lovable'
                    ? <Badge className="bg-pink-100 text-pink-700">Lovable</Badge>
                    : <Badge className="bg-purple-100 text-purple-700">Claude</Badge>}
                  <span className="text-sm text-muted-foreground">{devTasks.length} tasks, ~{totalHours}h estimated</span>
                </div>
                <div className="space-y-1.5 pl-2">
                  {devTasks.map(task => {
                    const chain = DEPENDENCY_CHAINS.find(c => c.taskId === task.id);
                    const isBlocked = chain?.blockedBy.some(d => {
                      if (d.startsWith('H-')) return true;
                      return getTaskStatus(d) !== 'completed';
                    });
                    return (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="font-mono text-xs w-14 justify-center">{task.id}</Badge>
                        <Badge className={cn('text-xs',
                          task.priority === 'high' ? 'bg-orange-500 text-white' :
                          task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-600')}>{task.priority}</Badge>
                        <span className={cn('flex-1 truncate', isBlocked && 'text-red-600')}>
                          {task.title}
                        </span>
                        {isBlocked
                          ? <Badge className="bg-red-100 text-red-700 text-xs">Blocked</Badge>
                          : <Badge className="bg-green-100 text-green-700 text-xs">Can Start</Badge>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Handoffs for tomorrow */}
          {tomorrowHandoffs.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Handoffs to coordinate:</p>
              <div className="space-y-1.5 pl-2">
                {tomorrowHandoffs.map(h => (
                  <div key={h.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-mono text-xs">{h.id}</Badge>
                    <Badge className={cn('text-xs',
                      h.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white')}>{h.priority}</Badge>
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
