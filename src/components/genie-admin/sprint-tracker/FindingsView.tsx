// Sprint Tracker — Findings View (expandable diagnosis grouped by product)
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bug, Zap, Brain, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DAY1_FINDINGS } from './data-findings';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-red-300 bg-red-50 text-red-800',
  high: 'border-orange-300 bg-orange-50 text-orange-800',
  medium: 'border-blue-300 bg-blue-50 text-blue-800',
  low: 'border-gray-300 bg-gray-50 text-gray-700',
};

const PRODUCT_GROUPS = [
  { key: 'C-101', label: 'Genie Spark', icon: Zap, color: 'text-orange-600' },
  { key: 'C-102', label: 'Genie Mind', icon: Brain, color: 'text-purple-600' },
  { key: 'C-103', label: 'Genie Deck', icon: Layers, color: 'text-blue-600' },
  { key: 'C-104', label: 'Cross-Product', icon: Bug, color: 'text-amber-600' },
];

export const FindingsView: React.FC = () => {
  // Aggregate stats
  const allFindings = Object.values(DAY1_FINDINGS).flatMap(tf => tf.findings);
  const totalOpen = allFindings.filter(f => f.status === 'open').length;
  const totalFixed = allFindings.filter(f => f.status === 'fixed').length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{allFindings.length}</p>
          <p className="text-sm text-muted-foreground">Total Issues</p>
        </CardContent></Card>
        <Card className="bg-green-50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{totalFixed}</p>
          <p className="text-sm text-green-600">Fixed</p>
        </CardContent></Card>
        <Card className="bg-amber-50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{totalOpen}</p>
          <p className="text-sm text-amber-600">Open</p>
        </CardContent></Card>
        <Card className="bg-blue-50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{Math.round((totalFixed / Math.max(allFindings.length, 1)) * 100)}%</p>
          <p className="text-sm text-blue-600">Resolution Rate</p>
        </CardContent></Card>
      </div>

      {/* Grouped by product */}
      <Accordion type="multiple" defaultValue={['C-101', 'C-102', 'C-103']} className="space-y-3">
        {PRODUCT_GROUPS.map(({ key, label, icon: Icon, color }) => {
          const data = DAY1_FINDINGS[key];
          if (!data || data.findings.length === 0) return null;
          const open = data.findings.filter(f => f.status === 'open').length;
          const fixed = data.findings.filter(f => f.status === 'fixed').length;

          return (
            <AccordionItem key={key} value={key} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <Icon className={cn('w-5 h-5', color)} />
                  <span className="text-base font-semibold">{label}</span>
                  <div className="flex gap-2 ml-auto mr-4">
                    {data.issuesBySeverity.critical > 0 && <Badge className="bg-red-500 text-white text-xs">{data.issuesBySeverity.critical} crit</Badge>}
                    {data.issuesBySeverity.high > 0 && <Badge className="bg-orange-500 text-white text-xs">{data.issuesBySeverity.high} high</Badge>}
                    <Badge variant="outline" className="text-xs text-green-700">{fixed} fixed</Badge>
                    {open > 0 && <Badge variant="outline" className="text-xs text-amber-700">{open} open</Badge>}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground mb-3 italic">{data.summary}</p>
                <div className="space-y-2">
                  {data.findings.map(f => (
                    <div key={f.id} className={cn('p-3 rounded border text-sm', SEVERITY_STYLES[f.severity])}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{f.id}</span>
                          <Badge className={cn('text-xs', SEVERITY_STYLES[f.severity])}>{f.severity}</Badge>
                        </div>
                        <span className={cn('text-xs font-bold uppercase',
                          f.status === 'fixed' ? 'text-green-700' : 'text-amber-700',
                        )}>
                          {f.status === 'fixed' ? 'FIXED' : 'OPEN'}
                        </span>
                      </div>
                      <p className="font-medium">{f.issue}</p>
                      <p className="opacity-75 mt-1">Root cause: {f.rootCause}</p>
                      <p className="font-mono text-xs opacity-60 mt-1">
                        {f.file}{f.line ? `:${f.line}` : ''}{f.fixedIn ? ` — commit: ${f.fixedIn}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Open issues by target day */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bug className="w-5 h-5 text-amber-600" /> Open Issues by Target Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          {[2, 3, 4, 5].map(targetDay => {
            const openForDay = allFindings.filter(f => {
              if (f.status !== 'open') return false;
              if (f.id.startsWith('D-') || (f.id.startsWith('X-') && f.id !== 'X-003')) return targetDay === 2;
              if (f.id.startsWith('S-')) return targetDay === 3;
              if (f.id.startsWith('M-')) return targetDay === 4;
              if (f.id === 'X-003') return targetDay === 5;
              return false;
            });
            if (openForDay.length === 0) return null;
            return (
              <div key={targetDay} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Day {targetDay}</Badge>
                  <Badge className="bg-amber-100 text-amber-800 text-xs">{openForDay.length} open</Badge>
                </div>
                <div className="space-y-1.5 pl-2">
                  {openForDay.map(f => (
                    <div key={f.id} className="flex items-center gap-2 text-sm">
                      <span className="font-mono font-bold text-xs w-12">{f.id}</span>
                      <Badge className={cn('text-xs', SEVERITY_STYLES[f.severity])}>{f.severity}</Badge>
                      <span className="truncate">{f.issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
