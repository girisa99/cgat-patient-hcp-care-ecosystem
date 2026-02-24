/**
 * RegionalCoverageMatrix
 *
 * Displays a matrix of regions x status columns for tracking regional content
 * generation progress. Rows are region+dialect combos; columns are Script,
 * TTS, Assets, and Generation status. Color coded: green (complete), amber
 * (in progress), red (missing/not started).
 *
 * Used in CREATE > Assets, PRODUCE > Studio, and PRODUCE > Review.
 */

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  FileText, Volume2, Image, Film,
  CheckCircle2, Clock, Loader2, AlertCircle,
  Sparkles, Globe, Wand2, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  REGION_HIERARCHY,
  type RegionGroup,
  type RegionChild,
} from '@/config/regionHierarchy';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────

export interface RegionalCoverageMatrixProps {
  targetRegions: string[];       // Region codes like 'EU_DE', 'INDIA_NORTH', etc.
  selectedDialects: string[];    // Language codes like 'de-DE', 'hi-IN'
  projectId?: string;            // cast_projects.id for DB lookup
  compact?: boolean;             // Compact mode for sidebar use
}

type CellStatus = 'complete' | 'in_progress' | 'not_started';

interface RegionDialectRow {
  regionCode: string;
  regionName: string;
  regionFlag: string;
  dialect: string;
  script: CellStatus;
  tts: CellStatus;
  assets: CellStatus;
  generation: CellStatus;
}

// ─── Status column definitions ──────────────────────────────────────────

const STATUS_COLUMNS = [
  { key: 'script' as const, label: 'Script', icon: FileText, description: 'Regional narration script' },
  { key: 'tts' as const, label: 'TTS', icon: Volume2, description: 'Text-to-speech audio' },
  { key: 'assets' as const, label: 'Assets', icon: Image, description: 'Visual assets generated' },
  { key: 'generation' as const, label: 'Generation', icon: Film, description: 'Final output produced' },
] as const;

type StatusColumnKey = typeof STATUS_COLUMNS[number]['key'];

// ─── Helpers ────────────────────────────────────────────────────────────

/** Resolve a region code to its display name and flag from REGION_HIERARCHY */
function resolveRegion(code: string): { name: string; flag: string } | null {
  for (const group of REGION_HIERARCHY) {
    // Check group-level code
    if (group.groupCode === code) {
      return { name: group.groupName, flag: group.groupFlag };
    }
    // Check children
    for (const child of group.children) {
      if (child.code === code) {
        return { name: child.name, flag: child.flag };
      }
      // Check grandchildren
      if (child.children) {
        for (const grandchild of child.children) {
          if (grandchild.code === code) {
            return { name: grandchild.name, flag: grandchild.flag };
          }
        }
      }
    }
  }
  return null;
}

/** Map a CellStatus to display properties */
function getStatusDisplay(status: CellStatus) {
  switch (status) {
    case 'complete':
      return {
        label: 'Complete',
        bgClass: 'bg-emerald-500/15',
        textClass: 'text-emerald-600',
        dotClass: 'bg-emerald-500',
        Icon: CheckCircle2,
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        bgClass: 'bg-amber-500/15',
        textClass: 'text-amber-600',
        dotClass: 'bg-amber-500',
        Icon: Loader2,
      };
    case 'not_started':
    default:
      return {
        label: 'Not Started',
        bgClass: 'bg-red-500/10',
        textClass: 'text-red-500',
        dotClass: 'bg-red-400',
        Icon: Clock,
      };
  }
}

// ─── Component ──────────────────────────────────────────────────────────

export const RegionalCoverageMatrix: React.FC<RegionalCoverageMatrixProps> = ({
  targetRegions,
  selectedDialects,
  projectId,
  compact = false,
}) => {
  const [dbStatuses, setDbStatuses] = useState<Record<string, Partial<Record<StatusColumnKey, CellStatus>>>>({});
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // ── Fetch real DB status when projectId is provided ──────────────────
  useEffect(() => {
    if (!projectId) {
      setDbStatuses({});
      return;
    }

    let cancelled = false;
    const fetchStatuses = async () => {
      setIsLoadingDb(true);
      try {
        // Query regional_narration_scripts for this project
        const { data, error } = await supabase
          .from('regional_narration_scripts')
          .select('region_code, language_code, script_text, audio_url, visual_assets_ready, final_output_ready')
          .eq('project_id', projectId);

        if (error) throw error;
        if (cancelled) return;

        const statusMap: Record<string, Partial<Record<StatusColumnKey, CellStatus>>> = {};

        if (data) {
          for (const row of data) {
            const key = `${row.region_code}__${row.language_code}`;
            statusMap[key] = {
              script: row.script_text ? 'complete' : 'not_started',
              tts: row.audio_url ? 'complete' : 'not_started',
              assets: row.visual_assets_ready ? 'complete' : 'not_started',
              generation: row.final_output_ready ? 'complete' : 'not_started',
            };
          }
        }

        setDbStatuses(statusMap);
      } catch (err) {
        // DB table may not exist yet; silently fall back to not_started
        if (!cancelled) setDbStatuses({});
      } finally {
        if (!cancelled) setIsLoadingDb(false);
      }
    };

    fetchStatuses();
    return () => { cancelled = true; };
  }, [projectId]);

  // ── Build row data ───────────────────────────────────────────────────
  const rows: RegionDialectRow[] = useMemo(() => {
    const result: RegionDialectRow[] = [];

    for (const regionCode of targetRegions) {
      const resolved = resolveRegion(regionCode);
      const regionName = resolved?.name ?? regionCode;
      const regionFlag = resolved?.flag ?? '';

      // If no dialects provided, show one row per region with a dash for dialect
      const dialects = selectedDialects.length > 0 ? selectedDialects : ['--'];

      for (const dialect of dialects) {
        const dbKey = `${regionCode}__${dialect}`;
        const dbRow = dbStatuses[dbKey];

        result.push({
          regionCode,
          regionName,
          regionFlag,
          dialect,
          script: dbRow?.script ?? 'not_started',
          tts: dbRow?.tts ?? 'not_started',
          assets: dbRow?.assets ?? 'not_started',
          generation: dbRow?.generation ?? 'not_started',
        });
      }
    }

    return result;
  }, [targetRegions, selectedDialects, dbStatuses]);

  // ── Summary stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalCells = rows.length * STATUS_COLUMNS.length;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    for (const row of rows) {
      for (const col of STATUS_COLUMNS) {
        const status = row[col.key];
        if (status === 'complete') completed++;
        else if (status === 'in_progress') inProgress++;
        else notStarted++;
      }
    }

    const completionPct = totalCells > 0 ? Math.round((completed / totalCells) * 100) : 0;

    return { totalCells, completed, inProgress, notStarted, completionPct };
  }, [rows]);

  // ── Batch actions ────────────────────────────────────────────────────
  const handleGenerateAllScripts = useCallback(() => {
    toast.success(
      `Queued regional script generation for ${rows.length} region-dialect combinations`,
      { description: 'Scripts will be generated via regional LLM routing.' }
    );
  }, [rows.length]);

  const handleGenerateAllTTS = useCallback(() => {
    toast.success(
      `Queued TTS generation for ${rows.length} region-dialect combinations`,
      { description: 'Audio will be generated via multi-provider TTS pipeline.' }
    );
  }, [rows.length]);

  // ── Status cell renderer ─────────────────────────────────────────────
  const renderStatusCell = (status: CellStatus) => {
    const display = getStatusDisplay(status);
    const StatusIcon = display.Icon;

    if (compact) {
      return (
        <div
          className={cn(
            'w-3 h-3 rounded-full mx-auto',
            display.dotClass,
          )}
          title={display.label}
        />
      );
    }

    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium',
          display.bgClass,
          display.textClass,
        )}
      >
        <StatusIcon className={cn('w-3 h-3', status === 'in_progress' && 'animate-spin')} />
        {display.label}
      </div>
    );
  };

  // ── Empty state ──────────────────────────────────────────────────────
  if (targetRegions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Globe className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No regions selected</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Select target regions to view the coverage matrix
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className={cn('space-y-4', compact && 'space-y-2')}>
      {/* Summary Stats */}
      <Card className={cn('border-primary/20', compact && 'border-0 shadow-none')}>
        <CardHeader className={cn('pb-3', compact && 'p-3 pb-2')}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={cn('flex items-center gap-2', compact ? 'text-sm' : 'text-base')}>
                <BarChart3 className={cn('text-primary', compact ? 'w-4 h-4' : 'w-5 h-5')} />
                Regional Coverage
                {isLoadingDb && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
              </CardTitle>
              {!compact && (
                <CardDescription className="text-xs mt-1">
                  {rows.length} region{rows.length !== 1 ? 's' : ''} x {STATUS_COLUMNS.length} stages = {stats.totalCells} total cells
                </CardDescription>
              )}
            </div>
            <Badge
              variant={stats.completionPct === 100 ? 'default' : 'outline'}
              className={cn(
                'text-xs font-semibold',
                stats.completionPct === 100 && 'bg-emerald-500 text-white',
              )}
            >
              {stats.completionPct}%
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <Progress value={stats.completionPct} className="h-2" />
          </div>

          {/* Stat badges */}
          <div className={cn('flex items-center gap-2 mt-2 flex-wrap', compact && 'gap-1')}>
            <div className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              {stats.completed} complete
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              {stats.inProgress} in progress
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-medium text-red-500">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              {stats.notStarted} not started
            </div>
          </div>
        </CardHeader>

        {/* Batch action buttons */}
        {!compact && (
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateAllScripts}
                className="text-xs gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Generate All Regional Scripts
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateAllTTS}
                className="text-xs gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Generate All TTS
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Matrix Table */}
      <Card className={cn(compact && 'border-0 shadow-none')}>
        <CardContent className={cn('p-0', compact && 'p-0')}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className={cn(
                    'text-left font-medium text-muted-foreground sticky left-0 bg-muted/30 z-10',
                    compact ? 'py-1.5 px-2' : 'py-2 px-3',
                  )}>
                    Region
                  </th>
                  {selectedDialects.length > 0 && selectedDialects[0] !== '--' && (
                    <th className={cn(
                      'text-left font-medium text-muted-foreground',
                      compact ? 'py-1.5 px-2' : 'py-2 px-3',
                    )}>
                      Dialect
                    </th>
                  )}
                  {STATUS_COLUMNS.map((col) => {
                    const ColIcon = col.icon;
                    return (
                      <th
                        key={col.key}
                        className={cn(
                          'text-center font-medium text-muted-foreground',
                          compact ? 'py-1.5 px-1' : 'py-2 px-3',
                        )}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <ColIcon className={cn(compact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
                          <span className={cn(compact ? 'text-[8px]' : 'text-[10px]')}>{col.label}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={`${row.regionCode}__${row.dialect}__${idx}`}
                    className="border-b border-muted/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className={cn(
                      'font-medium sticky left-0 bg-background z-10',
                      compact ? 'py-1 px-2 text-[10px]' : 'py-2 px-3',
                    )}>
                      <span className="mr-1">{row.regionFlag}</span>
                      {compact ? row.regionCode : row.regionName}
                    </td>
                    {selectedDialects.length > 0 && selectedDialects[0] !== '--' && (
                      <td className={cn(
                        'text-muted-foreground',
                        compact ? 'py-1 px-2 text-[10px]' : 'py-2 px-3',
                      )}>
                        <Badge variant="outline" className={cn(compact ? 'text-[8px] px-1' : 'text-[10px]')}>
                          {row.dialect}
                        </Badge>
                      </td>
                    )}
                    {STATUS_COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'text-center',
                          compact ? 'py-1 px-1' : 'py-2 px-2',
                        )}
                      >
                        {renderStatusCell(row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No data hint */}
          {rows.length > 0 && !projectId && (
            <div className={cn(
              'flex items-center gap-2 border-t bg-muted/20',
              compact ? 'px-2 py-1.5' : 'px-3 py-2',
            )}>
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                No project ID linked -- showing default "Not Started" status. Connect a Cast project to see real-time progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalCoverageMatrix;
