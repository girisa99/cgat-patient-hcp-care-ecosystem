/**
 * Conflict Resolution Dialog
 * Handles simultaneous edits to the same element with visual diff
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Check, 
  X, 
  GitMerge, 
  ArrowRight,
  Clock,
  User,
  FileText,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCollaboratorColor } from './CollaboratorCursors';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export interface ConflictVersion {
  userId: string;
  userName: string;
  avatarUrl?: string;
  timestamp: string;
  data: Record<string, unknown>;
  changes: PropertyChange[];
}

export interface PropertyChange {
  property: string;
  oldValue: unknown;
  newValue: unknown;
  displayName: string;
}

export interface Conflict {
  id: string;
  elementId: string;
  elementName: string;
  elementType: string;
  localVersion: ConflictVersion;
  remoteVersion: ConflictVersion;
  baseVersion?: Record<string, unknown>;
}

interface ConflictResolutionDialogProps {
  conflict: Conflict | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolution: 'local' | 'remote' | 'merge', mergedData?: Record<string, unknown>) => void;
}

// ============================================================================
// VERSION CARD COMPONENT
// ============================================================================

function VersionCard({
  version,
  label,
  isSelected,
  onSelect,
}: {
  version: ConflictVersion;
  label: 'Your Changes' | 'Their Changes';
  isSelected: boolean;
  onSelect: () => void;
}) {
  const color = getCollaboratorColor(version.userId);

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all",
        isSelected 
          ? "ring-2 ring-primary shadow-md" 
          : "hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {label === 'Your Changes' ? (
              <User className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Avatar className="h-5 w-5 border" style={{ borderColor: color }}>
                <AvatarImage src={version.avatarUrl} />
                <AvatarFallback 
                  className="text-[8px] text-white"
                  style={{ backgroundColor: color }}
                >
                  {version.userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            {label}
          </CardTitle>
          {isSelected && (
            <Badge variant="default" className="text-[10px]">
              Selected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
          <span className="mx-1">•</span>
          <span className="font-medium">{version.userName}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {version.changes.map((change, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="font-medium text-muted-foreground min-w-[80px]">
                {change.displayName}:
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="line-through text-muted-foreground/50">
                  {formatValue(change.oldValue)}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {formatValue(change.newValue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MERGE PREVIEW COMPONENT
// ============================================================================

function MergePreview({
  local,
  remote,
  selectedProperties,
  onToggleProperty,
}: {
  local: ConflictVersion;
  remote: ConflictVersion;
  selectedProperties: Record<string, 'local' | 'remote'>;
  onToggleProperty: (property: string, source: 'local' | 'remote') => void;
}) {
  const allProperties = useMemo(() => {
    const props = new Set<string>();
    local.changes.forEach(c => props.add(c.property));
    remote.changes.forEach(c => props.add(c.property));
    return Array.from(props);
  }, [local, remote]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Select which version to use for each property:
      </p>
      {allProperties.map((prop) => {
        const localChange = local.changes.find(c => c.property === prop);
        const remoteChange = remote.changes.find(c => c.property === prop);
        const selected = selectedProperties[prop] || 'local';

        return (
          <div key={prop} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <span className="font-medium text-xs min-w-[80px]">
              {localChange?.displayName || remoteChange?.displayName}
            </span>
            <div className="flex-1 flex items-center gap-2">
              <Button
                variant={selected === 'local' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => onToggleProperty(prop, 'local')}
              >
                {formatValue(localChange?.newValue ?? localChange?.oldValue)}
              </Button>
              <Button
                variant={selected === 'remote' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => onToggleProperty(prop, 'remote')}
              >
                {formatValue(remoteChange?.newValue ?? remoteChange?.oldValue)}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ConflictResolutionDialog({
  conflict,
  isOpen,
  onClose,
  onResolve,
}: ConflictResolutionDialogProps) {
  const [selectedTab, setSelectedTab] = useState<'compare' | 'merge'>('compare');
  const [selectedVersion, setSelectedVersion] = useState<'local' | 'remote'>('local');
  const [mergeSelections, setMergeSelections] = useState<Record<string, 'local' | 'remote'>>({});

  if (!conflict) return null;

  const handleResolve = () => {
    if (selectedTab === 'merge') {
      // Build merged data from selections
      const mergedData = { ...conflict.localVersion.data };
      Object.entries(mergeSelections).forEach(([prop, source]) => {
        const version = source === 'local' ? conflict.localVersion : conflict.remoteVersion;
        const change = version.changes.find(c => c.property === prop);
        if (change) {
          mergedData[prop] = change.newValue;
        }
      });
      onResolve('merge', mergedData);
    } else {
      onResolve(selectedVersion);
    }
  };

  const handleToggleProperty = (property: string, source: 'local' | 'remote') => {
    setMergeSelections(prev => ({ ...prev, [property]: source }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Edit Conflict Detected
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{conflict.elementName}</span> ({conflict.elementType}) 
            was modified by another user while you were editing.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compare" className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Compare Versions
            </TabsTrigger>
            <TabsTrigger value="merge" className="flex items-center gap-1.5">
              <GitMerge className="h-3.5 w-3.5" />
              Smart Merge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compare" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <VersionCard
                version={conflict.localVersion}
                label="Your Changes"
                isSelected={selectedVersion === 'local'}
                onSelect={() => setSelectedVersion('local')}
              />
              <VersionCard
                version={conflict.remoteVersion}
                label="Their Changes"
                isSelected={selectedVersion === 'remote'}
                onSelect={() => setSelectedVersion('remote')}
              />
            </div>
          </TabsContent>

          <TabsContent value="merge" className="mt-4">
            <ScrollArea className="h-64">
              <MergePreview
                local={conflict.localVersion}
                remote={conflict.remoteVersion}
                selectedProperties={mergeSelections}
                onToggleProperty={handleToggleProperty}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1.5" />
            Cancel Edit
          </Button>
          <Button onClick={handleResolve}>
            <Check className="h-4 w-4 mr-1.5" />
            {selectedTab === 'merge' ? 'Apply Merged Changes' : `Use ${selectedVersion === 'local' ? 'My' : 'Their'} Version`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)';
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 30) + '...';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value).slice(0, 50);
}

export default ConflictResolutionDialog;
