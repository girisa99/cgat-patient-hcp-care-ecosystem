/**
 * VersionComparisonPanel - Side-by-side version comparison
 * 
 * Competitive Differentiator #4: Version History
 * Allows users to compare and revert to previous versions
 */

import React, { useState } from 'react';
import { 
  History, 
  ArrowLeftRight, 
  RotateCcw, 
  Check, 
  Clock,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { VersionSnapshot, RegenerationFeedback } from '@/hooks/useSmartRegeneration';

// ============================================================================
// TYPES
// ============================================================================

interface VersionComparisonPanelProps {
  versions: VersionSnapshot[];
  currentVersionId: string;
  onRevert: (versionId: string) => void;
  onCompare?: (versionId1: string, versionId2: string) => void;
  renderContent?: (content: any) => React.ReactNode;
  className?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function FeedbackBadge({ feedback }: { feedback: RegenerationFeedback }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <MessageSquare className="h-3 w-3" />
      <span>Feedback: {feedback.reason.replace('_', ' ')}</span>
    </div>
  );
}

function QualityScore({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 90) return 'text-primary bg-primary/10';
    if (score >= 75) return 'text-accent-foreground bg-accent/50';
    return 'text-destructive bg-destructive/10';
  };

  return (
    <Badge variant="outline" className={cn("text-xs", getColor())}>
      <Star className="h-3 w-3 mr-1" />
      {score}% quality
    </Badge>
  );
}

function VersionCard({
  version,
  isCurrent,
  isOriginal,
  isSelected,
  onSelect,
  onRevert,
  renderContent,
}: {
  version: VersionSnapshot;
  isCurrent: boolean;
  isOriginal: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onRevert: () => void;
  renderContent?: (content: any) => React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className={cn(
        "p-3 transition-all cursor-pointer",
        isSelected && "ring-2 ring-primary",
        isCurrent && "border-primary bg-primary/5"
      )}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">v{version.version}</span>
          {isOriginal && (
            <Badge variant="secondary" className="text-xs">Original</Badge>
          )}
          {isCurrent && (
            <Badge variant="default" className="text-xs">Current</Badge>
          )}
        </div>
        {version.qualityScore && (
          <QualityScore score={version.qualityScore} />
        )}
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Clock className="h-3 w-3" />
        <span>{version.timestamp.toLocaleString()}</span>
      </div>

      {/* Feedback if present */}
      {version.feedback && (
        <FeedbackBadge feedback={version.feedback} />
      )}

      {/* Content preview */}
      {renderContent && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-primary hover:underline mt-2">
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Hide preview
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show preview
                </>
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-2 bg-muted/30 rounded-md text-sm">
            {renderContent(version.content)}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Revert button */}
      {!isCurrent && (
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-3"
          onClick={(e) => {
            e.stopPropagation();
            onRevert();
          }}
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Revert to this version
        </Button>
      )}
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VersionComparisonPanel({
  versions,
  currentVersionId,
  onRevert,
  onCompare,
  renderContent,
  className,
}: VersionComparisonPanelProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Handle version selection for comparison
  const handleVersionSelect = (versionId: string) => {
    if (!isCompareMode) {
      setSelectedVersions([versionId]);
      return;
    }

    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(prev => prev.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, versionId]);
    } else {
      // Replace oldest selection
      setSelectedVersions(prev => [prev[1], versionId]);
    }
  };

  // Trigger comparison
  const handleCompare = () => {
    if (selectedVersions.length === 2 && onCompare) {
      onCompare(selectedVersions[0], selectedVersions[1]);
    }
  };

  if (versions.length === 0) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No version history yet</p>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="font-medium">Version History</span>
          <Badge variant="secondary">{versions.length} versions</Badge>
        </div>
        
        {onCompare && versions.length >= 2 && (
          <Button
            size="sm"
            variant={isCompareMode ? 'default' : 'outline'}
            onClick={() => setIsCompareMode(!isCompareMode)}
          >
            <ArrowLeftRight className="h-3 w-3 mr-2" />
            {isCompareMode ? 'Exit Compare' : 'Compare'}
          </Button>
        )}
      </div>

      {/* Compare mode instructions */}
      {isCompareMode && (
        <div className="mb-4 p-2 bg-primary/10 rounded-md text-sm">
          <p className="text-primary">
            Select 2 versions to compare ({selectedVersions.length}/2 selected)
          </p>
          {selectedVersions.length === 2 && (
            <Button
              size="sm"
              className="mt-2"
              onClick={handleCompare}
            >
              <Check className="h-3 w-3 mr-2" />
              Compare Selected
            </Button>
          )}
        </div>
      )}

      {/* Version list */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {versions
            .slice()
            .reverse()
            .map(version => (
              <VersionCard
                key={version.id}
                version={version}
                isCurrent={version.id === currentVersionId}
                isOriginal={version.isOriginal || false}
                isSelected={selectedVersions.includes(version.id)}
                onSelect={() => handleVersionSelect(version.id)}
                onRevert={() => onRevert(version.id)}
                renderContent={renderContent}
              />
            ))}
        </div>
      </ScrollArea>

      {/* Competitive differentiator message */}
      <div className="mt-4 pt-3 border-t text-center">
        <p className="text-xs text-muted-foreground">
          🎯 <strong>Unlike competitors</strong>: We keep all your versions. Revert anytime.
        </p>
      </div>
    </Card>
  );
}

export default VersionComparisonPanel;
