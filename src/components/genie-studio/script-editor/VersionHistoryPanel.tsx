/**
 * VersionHistoryPanel - Script version tracking with comparison and rollback
 * Uses the existing useScriptVersions hook infrastructure.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  History,
  GitCompare,
  RotateCcw,
  Check,
  X,
  Clock,
  FileText,
  Sparkles,
  Edit3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScriptStats } from './types';
import { calculateStats } from './utils';

export interface ScriptVersionEntry {
  id: string;
  versionNumber: number;
  content: string;
  enhancedContent?: string;
  versionType: 'original' | 'enhanced' | 'manual_edit' | 'transcreation';
  changeSummary?: string;
  createdAt: number;
  wordCount: number;
  languageCode?: string;
}

interface VersionHistoryPanelProps {
  isVisible: boolean;
  onClose: () => void;
  versions: ScriptVersionEntry[];
  currentContent: string;
  onRestoreVersion: (version: ScriptVersionEntry) => void;
  onSaveVersion: (content: string, type: ScriptVersionEntry['versionType'], summary: string) => void;
}

const VERSION_TYPE_STYLES: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  original: { color: 'blue', icon: <FileText className="h-3 w-3" />, label: 'Original' },
  enhanced: { color: 'purple', icon: <Sparkles className="h-3 w-3" />, label: 'Enhanced' },
  manual_edit: { color: 'amber', icon: <Edit3 className="h-3 w-3" />, label: 'Manual Edit' },
  transcreation: { color: 'cyan', icon: <FileText className="h-3 w-3" />, label: 'Transcreation' },
};

export function VersionHistoryPanel({
  isVisible,
  onClose,
  versions,
  currentContent,
  onRestoreVersion,
  onSaveVersion,
}: VersionHistoryPanelProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[string | null, string | null]>([null, null]);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  if (!isVisible) return null;

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  const v1 = compareVersions[0] ? versions.find(v => v.id === compareVersions[0]) : null;
  const v2 = compareVersions[1] ? versions.find(v => v.id === compareVersions[1]) : null;

  const handleSelectForCompare = (versionId: string) => {
    if (!compareMode) return;
    setCompareVersions(prev => {
      if (!prev[0]) return [versionId, null];
      if (!prev[1] && prev[0] !== versionId) return [prev[0], versionId];
      return [versionId, null];
    });
  };

  return (
    <div className="mb-6 p-4 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-500" />
          Version History ({versions.length} versions)
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setCompareMode(!compareMode); setCompareVersions([null, null]); }}
            className={compareMode ? 'bg-indigo-500' : ''}
          >
            <GitCompare className="h-4 w-4 mr-1" />
            {compareMode ? 'Exit Compare' : 'Compare'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {compareMode && (
        <div className="mb-3 p-2 rounded bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs text-indigo-600">
            Select two versions to compare. Click on version cards below.
            {compareVersions[0] && !compareVersions[1] && ' Now select the second version.'}
          </p>
        </div>
      )}

      {/* Compare View */}
      {compareMode && v1 && v2 && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <VersionPreviewCard version={v1} label={`v${v1.versionNumber}`} />
          <VersionPreviewCard version={v2} label={`v${v2.versionNumber}`} />
        </div>
      )}

      <ScrollArea className="max-h-[350px] pr-2">
        <div className="space-y-2">
          {sortedVersions.map((version, idx) => {
            const style = VERSION_TYPE_STYLES[version.versionType] || VERSION_TYPE_STYLES.original;
            const isExpanded = expandedVersionId === version.id;
            const isSelected = compareVersions.includes(version.id);
            const isCurrent = idx === 0;

            return (
              <div
                key={version.id}
                className={cn(
                  "p-3 rounded-lg border bg-background transition-all",
                  isSelected && "ring-2 ring-indigo-500/50",
                  compareMode && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => handleSelectForCompare(version.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] bg-${style.color}-500/10 text-${style.color}-600 border-${style.color}-500/30`}>
                      {style.icon}
                      <span className="ml-1">v{version.versionNumber}</span>
                    </Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {style.label}
                    </Badge>
                    {isCurrent && (
                      <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30" variant="outline">
                        Current
                      </Badge>
                    )}
                    {version.languageCode && version.languageCode !== 'en' && (
                      <Badge variant="secondary" className="text-[10px]">
                        {version.languageCode}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(version.createdAt).toLocaleDateString()} {new Date(version.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs text-muted-foreground">{version.wordCount}w</span>
                    {!compareMode && (
                      <>
                        <Button
                          variant="ghost" size="sm" className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); setExpandedVersionId(isExpanded ? null : version.id); }}
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                        {!isCurrent && (
                          <Button
                            variant="outline" size="sm" className="h-6 px-2 text-xs"
                            onClick={(e) => { e.stopPropagation(); onRestoreVersion(version); }}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />Restore
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {version.changeSummary && (
                  <p className="text-xs text-muted-foreground mt-1">{version.changeSummary}</p>
                )}
                {isExpanded && !compareMode && (
                  <div className="mt-2 p-2 rounded bg-muted/50 border border-border/50">
                    <p className="text-xs font-mono whitespace-pre-wrap line-clamp-6">{version.content}</p>
                  </div>
                )}
              </div>
            );
          })}

          {versions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No versions recorded yet</p>
              <p className="text-xs mt-1">Versions are saved when you analyze, enhance, or save scripts</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function VersionPreviewCard({ version, label }: { version: ScriptVersionEntry; label: string }) {
  const style = VERSION_TYPE_STYLES[version.versionType] || VERSION_TYPE_STYLES.original;
  return (
    <div className="p-3 rounded-lg border bg-background">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs">{label}</Badge>
        <Badge variant="outline" className="text-[10px] capitalize">{style.label}</Badge>
        <span className="text-xs text-muted-foreground">{version.wordCount} words</span>
      </div>
      <ScrollArea className="h-[150px]">
        <p className="text-xs font-mono whitespace-pre-wrap">{version.content}</p>
      </ScrollArea>
    </div>
  );
}
