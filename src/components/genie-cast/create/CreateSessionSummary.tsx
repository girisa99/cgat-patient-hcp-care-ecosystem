/**
 * CREATE SESSION SUMMARY
 *
 * Compact card that shows all CREATE selections at a glance.
 * Rendered at the top of CREATE/PRODUCE/PUBLISH as a persistent "breadcrumb"
 * so the user always knows what they've configured.
 *
 * Each row is clickable to jump back to that step for editing.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Globe, Palette, Film, Volume2, Users,
  Layers, Settings2, ChevronRight, Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GenieCastSessionState } from '@/hooks/useGenieCastSession';
import type { ContentCategory, ContentFormat as RegistryFormat, ContentSubFormat } from '@/hooks/useCastContentRegistry';

interface CreateSessionSummaryProps {
  session: GenieCastSessionState;
  categories: ContentCategory[];
  formats: RegistryFormat[];
  subFormats: ContentSubFormat[];
  onNavigateToStep?: (step: string) => void;
  className?: string;
  compact?: boolean;
}

interface SummaryRow {
  icon: React.ElementType;
  label: string;
  value: string | null;
  step: string;
  badges?: string[];
}

export function CreateSessionSummary({
  session,
  categories,
  formats,
  subFormats,
  onNavigateToStep,
  className,
  compact = false,
}: CreateSessionSummaryProps) {
  const category = categories.find(c => c.id === session.selectedCategoryId);
  const format = formats.find(f => f.id === session.selectedFormatId);
  const subFormat = subFormats.find(sf => sf.id === session.selectedSubFormatId);

  const rows: SummaryRow[] = [
    {
      icon: Layers,
      label: 'Content',
      value: [category?.label, format?.label, subFormat?.label].filter(Boolean).join(' > ') || null,
      step: 'intent',
    },
    {
      icon: Globe,
      label: 'Platforms',
      value: (session.targetPlatformIds?.length
        ? session.targetPlatformIds.map(p => p.replace(/_/g, ' ')).join(', ')
        : session.primaryPlatform?.replace(/_/g, ' ')) || null,
      step: 'configure',
      badges: [
        ...(session.targetPlatformIds?.length > 1 ? [`${session.targetPlatformIds.length} platforms`] : []),
        ...(session.outputLanguages.length > 1
          ? [`${session.outputLanguages.length} languages`]
          : session.outputLanguages),
      ],
    },
    {
      icon: Palette,
      label: 'Styles',
      value: session.selectedVisualStyleIds.length > 0
        ? `${session.selectedVisualStyleIds.length} style${session.selectedVisualStyleIds.length > 1 ? 's' : ''}`
        : null,
      step: 'configure',
    },
    {
      icon: Film,
      label: 'Quality',
      value: session.productionQuality || null,
      step: 'configure',
      badges: [
        session.selectedResolution,
        session.selectedAspectRatio,
        `${session.targetDuration}s`,
      ].filter(Boolean) as string[],
    },
    {
      icon: Volume2,
      label: 'Audio',
      value: [
        session.lipSyncEnabled ? 'Lip-sync' : null,
        session.dubbingEnabled ? 'Dubbing' : null,
      ].filter(Boolean).join(' + ') || 'Standard',
      step: 'configure',
    },
    {
      icon: Users,
      label: 'Speakers',
      value: session.speakerConfig
        ? `${session.speakerConfig.length} speaker${session.speakerConfig.length > 1 ? 's' : ''}`
        : null,
      step: 'configure',
    },
    {
      icon: Settings2,
      label: 'Template',
      value: session.selectedTemplate?.name || null,
      step: 'templates',
    },
  ];

  // Filter out rows with no value
  const activeRows = rows.filter(r => r.value);

  if (activeRows.length === 0) return null;

  if (compact) {
    return (
      <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
        {activeRows.map((row, i) => (
          <React.Fragment key={row.label}>
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
            <Badge
              variant="secondary"
              className="text-[10px] gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => onNavigateToStep?.(row.step)}
            >
              <row.icon className="w-3 h-3" />
              {row.value}
            </Badge>
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Session Configuration
          </span>
          <Badge variant="outline" className="text-[9px]">
            {activeRows.length}/{rows.length} configured
          </Badge>
        </div>
        <div className="space-y-1.5">
          {activeRows.map(row => (
            <div
              key={row.label}
              className="flex items-center gap-2 group cursor-pointer hover:bg-muted/30 rounded px-1.5 py-0.5 -mx-1.5 transition-colors"
              onClick={() => onNavigateToStep?.(row.step)}
            >
              <row.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-muted-foreground w-16 shrink-0">{row.label}</span>
              <span className="text-xs font-medium truncate flex-1">{row.value}</span>
              {row.badges?.map((badge, i) => (
                <Badge key={i} variant="outline" className="text-[9px] px-1 py-0 shrink-0">
                  {badge}
                </Badge>
              ))}
              <Pencil className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
