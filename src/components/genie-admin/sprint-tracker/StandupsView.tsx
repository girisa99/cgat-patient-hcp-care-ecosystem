// Sprint Tracker — Standups View (timeline + form)
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Zap, Brain, Save, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Developer, StandupEntry } from './types';
import { SPRINT_DAYS } from './data-config';

interface StandupsViewProps {
  standups: StandupEntry[];
  selectedDay: number;
  onAddStandup: (entry: Omit<StandupEntry, 'createdAt'>) => void;
}

function StandupForm({ day, developer, onSave }: {
  day: number; developer: Developer; onSave: (entry: Omit<StandupEntry, 'createdAt'>) => void;
}) {
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const isLovable = developer === 'lovable';

  const handleSave = () => {
    if (!yesterday.trim() && !today.trim()) return;
    onSave({ day, developer, yesterday, today, blockers });
    setYesterday(''); setToday(''); setBlockers('');
  };

  return (
    <Card className={cn('border-t-2', isLovable ? 'border-t-pink-400' : 'border-t-purple-400')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {isLovable ? <Zap className="w-4 h-4 text-pink-600" /> : <Brain className="w-4 h-4 text-purple-600" />}
          {isLovable ? 'Lovable' : 'Claude Code'} — Day {day} Standup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground">What did I complete?</label>
          <Textarea value={yesterday} onChange={e => setYesterday(e.target.value)} rows={2} className="mt-1 text-sm" placeholder="List completed tasks..." />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">What am I working on today?</label>
          <Textarea value={today} onChange={e => setToday(e.target.value)} rows={2} className="mt-1 text-sm" placeholder="List today's focus..." />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Blockers or shared needs?</label>
          <Textarea value={blockers} onChange={e => setBlockers(e.target.value)} rows={2} className="mt-1 text-sm" placeholder="Any blockers or coordination needs..." />
        </div>
        <Button size="sm" onClick={handleSave} className="gap-1.5">
          <Save className="w-4 h-4" /> Log Standup
        </Button>
      </CardContent>
    </Card>
  );
}

export const StandupsView: React.FC<StandupsViewProps> = ({ standups, selectedDay, onAddStandup }) => {
  const dayStandups = standups.filter(s => s.day === selectedDay);
  const allByDay = [1, 2, 3, 4, 5].map(d => ({
    day: d,
    theme: SPRINT_DAYS[d - 1]?.theme ?? '',
    entries: standups.filter(s => s.day === d),
  })).filter(d => d.entries.length > 0 || d.day === selectedDay);

  return (
    <div className="space-y-6">
      {/* Standup forms */}
      <div className="grid lg:grid-cols-2 gap-4">
        <StandupForm day={selectedDay} developer="lovable" onSave={onAddStandup} />
        <StandupForm day={selectedDay} developer="claude" onSave={onAddStandup} />
      </div>

      <Separator />

      {/* Standup timeline */}
      <h3 className="text-base font-semibold flex items-center gap-2">
        <MessageSquare className="w-4 h-4" /> Standup Timeline
      </h3>

      <div className="space-y-6">
        {allByDay.map(({ day, theme, entries }) => (
          <div key={day}>
            {/* Day header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                day === selectedDay ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}>
                {day}
              </div>
              <div className="flex-1">
                <span className={cn('text-sm font-medium', day === selectedDay && 'text-primary')}>Day {day}</span>
                <span className="text-sm text-muted-foreground ml-2">{theme}</span>
              </div>
              <Badge variant="outline" className="text-xs">{entries.length} entries</Badge>
            </div>

            {/* Timeline entries with left connector */}
            <div className="ml-4 border-l-2 border-muted pl-4 space-y-3">
              {entries.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">No standups logged yet for this day.</p>
              )}

              {entries.map((s, i) => {
                const isLovable = s.developer === 'lovable';
                return (
                  <div key={i} className="relative">
                    {/* Connector dot */}
                    <div className={cn(
                      'absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border-2 bg-background',
                      isLovable ? 'border-pink-400' : 'border-purple-400',
                    )} />
                    <Card className={cn('bg-muted/30 border-l-4',
                      isLovable ? 'border-l-pink-400' : 'border-l-purple-400')}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {isLovable ? <Zap className="w-4 h-4 text-pink-600" /> : <Brain className="w-4 h-4 text-purple-600" />}
                          <span className="text-sm font-semibold">{isLovable ? 'Lovable' : 'Claude Code'}</span>
                          <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</span>
                        </div>
                        {s.yesterday && <div className="text-sm"><span className="font-medium">Completed:</span> {s.yesterday}</div>}
                        {s.today && <div className="text-sm"><span className="font-medium">Working on:</span> {s.today}</div>}
                        {s.blockers && s.blockers !== 'None' && (
                          <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                            <span className="font-medium">Blockers:</span> {s.blockers}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
