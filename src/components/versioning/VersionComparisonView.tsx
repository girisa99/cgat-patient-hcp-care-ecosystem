/**
 * Version Comparison View
 * P4-VER-06: Side-by-side version comparison UI
 * 
 * Features:
 * - Split-screen diff view
 * - Visual diff highlighting
 * - Property-level change tracking
 * - Restore to previous version
 * - Branch creation from version
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  GitCompare,
  History,
  Minus,
  Plus,
  RotateCcw,
  SplitSquareHorizontal,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VersionData {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  title?: string;
  description?: string;
  data: Record<string, unknown>;
  metadata?: {
    pipelineId?: string;
    productType?: string;
    changes?: string[];
  };
}

export interface PropertyDiff {
  path: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  leftValue?: unknown;
  rightValue?: unknown;
}

interface VersionComparisonViewProps {
  versions: VersionData[];
  currentVersionId?: string;
  onRestore?: (versionId: string) => void;
  onBranch?: (versionId: string, branchName: string) => void;
  className?: string;
}

export const VersionComparisonView: React.FC<VersionComparisonViewProps> = ({
  versions,
  currentVersionId,
  onRestore,
  onBranch,
  className,
}) => {
  const [leftVersionId, setLeftVersionId] = useState<string>(
    versions.length > 1 ? versions[versions.length - 2].id : versions[0]?.id || ''
  );
  const [rightVersionId, setRightVersionId] = useState<string>(
    versions[versions.length - 1]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const leftVersion = versions.find(v => v.id === leftVersionId);
  const rightVersion = versions.find(v => v.id === rightVersionId);

  // Calculate diffs
  const diffs = useMemo(() => {
    if (!leftVersion || !rightVersion) return [];

    const calculateDiffs = (
      left: Record<string, unknown>,
      right: Record<string, unknown>,
      prefix = ''
    ): PropertyDiff[] => {
      const result: PropertyDiff[] = [];
      const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);

      allKeys.forEach(key => {
        const path = prefix ? `${prefix}.${key}` : key;
        const leftVal = left[key];
        const rightVal = right[key];

        if (!(key in left)) {
          result.push({ path, type: 'added', rightValue: rightVal });
        } else if (!(key in right)) {
          result.push({ path, type: 'removed', leftValue: leftVal });
        } else if (typeof leftVal === 'object' && typeof rightVal === 'object' && 
                   leftVal !== null && rightVal !== null && 
                   !Array.isArray(leftVal) && !Array.isArray(rightVal)) {
          result.push(...calculateDiffs(
            leftVal as Record<string, unknown>,
            rightVal as Record<string, unknown>,
            path
          ));
        } else if (JSON.stringify(leftVal) !== JSON.stringify(rightVal)) {
          result.push({ path, type: 'modified', leftValue: leftVal, rightValue: rightVal });
        } else {
          result.push({ path, type: 'unchanged', leftValue: leftVal, rightValue: rightVal });
        }
      });

      return result;
    };

    return calculateDiffs(leftVersion.data, rightVersion.data);
  }, [leftVersion, rightVersion]);

  const filteredDiffs = showUnchanged ? diffs : diffs.filter(d => d.type !== 'unchanged');

  const stats = useMemo(() => ({
    added: diffs.filter(d => d.type === 'added').length,
    removed: diffs.filter(d => d.type === 'removed').length,
    modified: diffs.filter(d => d.type === 'modified').length,
    unchanged: diffs.filter(d => d.type === 'unchanged').length,
  }), [diffs]);

  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const formatValue = (value: unknown): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getDiffIcon = (type: PropertyDiff['type']) => {
    switch (type) {
      case 'added': return <Plus className="h-3 w-3 text-green-500" />;
      case 'removed': return <Minus className="h-3 w-3 text-red-500" />;
      case 'modified': return <GitCompare className="h-3 w-3 text-amber-500" />;
      case 'unchanged': return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getDiffBg = (type: PropertyDiff['type']) => {
    switch (type) {
      case 'added': return 'bg-green-500/10 border-green-500/20';
      case 'removed': return 'bg-red-500/10 border-red-500/20';
      case 'modified': return 'bg-amber-500/10 border-amber-500/20';
      case 'unchanged': return 'bg-muted/50';
    }
  };

  const handleSwapVersions = () => {
    const temp = leftVersionId;
    setLeftVersionId(rightVersionId);
    setRightVersionId(temp);
  };

  const handleBranch = () => {
    if (!rightVersion || !onBranch) return;
    const branchName = prompt('Enter branch name:', `branch-from-${rightVersion.version}`);
    if (branchName) {
      onBranch(rightVersion.id, branchName);
    }
  };

  if (versions.length < 2) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>At least 2 versions required for comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Version Comparison
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'split' ? 'unified' : 'split')}
            >
              <SplitSquareHorizontal className="h-4 w-4 mr-2" />
              {viewMode === 'split' ? 'Unified' : 'Split'}
            </Button>
            
            {onBranch && (
              <Button variant="outline" size="sm" onClick={handleBranch}>
                <GitBranch className="h-4 w-4 mr-2" />
                Branch
              </Button>
            )}
            
            {onRestore && rightVersion && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onRestore(rightVersion.id)}
                disabled={rightVersion.id === currentVersionId}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Version Selectors */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Base Version</label>
            <Select value={leftVersionId} onValueChange={setLeftVersionId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {versions.map(v => (
                  <SelectItem key={v.id} value={v.id} disabled={v.id === rightVersionId}>
                    {v.version} - {new Date(v.createdAt).toLocaleDateString()}
                    {v.title && ` (${v.title})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" size="icon" onClick={handleSwapVersions} className="mt-5">
            <ArrowLeft className="h-4 w-4" />
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Compare Version</label>
            <Select value={rightVersionId} onValueChange={setRightVersionId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {versions.map(v => (
                  <SelectItem key={v.id} value={v.id} disabled={v.id === leftVersionId}>
                    {v.version} - {new Date(v.createdAt).toLocaleDateString()}
                    {v.title && ` (${v.title})`}
                    {v.id === currentVersionId && ' (current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline" className="text-green-600 border-green-300">
            <Plus className="h-3 w-3 mr-1" />
            {stats.added} added
          </Badge>
          <Badge variant="outline" className="text-red-600 border-red-300">
            <Minus className="h-3 w-3 mr-1" />
            {stats.removed} removed
          </Badge>
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            <GitCompare className="h-3 w-3 mr-1" />
            {stats.modified} modified
          </Badge>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUnchanged(!showUnchanged)}
            className="text-xs"
          >
            {showUnchanged ? 'Hide' : 'Show'} unchanged ({stats.unchanged})
          </Button>
        </div>

        <Separator />

        {/* Diff Content */}
        <ScrollArea className="h-[500px] pr-4">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {leftVersion?.version}
                </div>
                {filteredDiffs.map(diff => (
                  <div
                    key={diff.path}
                    className={cn(
                      "p-2 rounded border text-sm",
                      diff.type === 'added' ? 'opacity-30' : getDiffBg(diff.type)
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {getDiffIcon(diff.type)}
                      <span className="font-mono text-xs">{diff.path}</span>
                    </div>
                    {diff.type !== 'added' && (
                      <pre className="mt-1 text-xs overflow-auto max-h-20">
                        {formatValue(diff.leftValue)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {rightVersion?.version}
                  {rightVersion?.id === currentVersionId && (
                    <Badge variant="default" className="ml-2 text-xs">current</Badge>
                  )}
                </div>
                {filteredDiffs.map(diff => (
                  <div
                    key={diff.path}
                    className={cn(
                      "p-2 rounded border text-sm",
                      diff.type === 'removed' ? 'opacity-30' : getDiffBg(diff.type)
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {getDiffIcon(diff.type)}
                      <span className="font-mono text-xs">{diff.path}</span>
                    </div>
                    {diff.type !== 'removed' && (
                      <pre className="mt-1 text-xs overflow-auto max-h-20">
                        {formatValue(diff.rightValue)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Unified View */
            <div className="space-y-2">
              {filteredDiffs.map(diff => (
                <div
                  key={diff.path}
                  className={cn("rounded border", getDiffBg(diff.type))}
                >
                  <button
                    onClick={() => togglePath(diff.path)}
                    className="w-full p-2 flex items-center gap-2 text-left text-sm hover:bg-accent/50"
                  >
                    {getDiffIcon(diff.type)}
                    <span className="font-mono text-xs flex-1">{diff.path}</span>
                    <Badge variant="outline" className="text-xs">
                      {diff.type}
                    </Badge>
                    {expandedPaths.has(diff.path) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedPaths.has(diff.path) && (
                    <div className="px-2 pb-2 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Before</span>
                        <pre className={cn(
                          "text-xs p-2 rounded bg-background/50 overflow-auto max-h-32",
                          diff.type === 'added' && "text-muted-foreground italic"
                        )}>
                          {diff.type === 'added' ? '(not present)' : formatValue(diff.leftValue)}
                        </pre>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">After</span>
                        <pre className={cn(
                          "text-xs p-2 rounded bg-background/50 overflow-auto max-h-32",
                          diff.type === 'removed' && "text-muted-foreground italic"
                        )}>
                          {diff.type === 'removed' ? '(removed)' : formatValue(diff.rightValue)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {filteredDiffs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No differences found between these versions</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VersionComparisonView;
