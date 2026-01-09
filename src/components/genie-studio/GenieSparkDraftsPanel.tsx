/**
 * Genie Spark Drafts Panel - Display and manage generated content drafts
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Video,
  Mic,
  Radio,
  Presentation,
  Download,
  Trash2,
  MoreHorizontal,
  Clock,
  PenTool,
  Volume2,
  Send,
  Eye,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { GenieSparkDraft } from './useGenieSparkSession';

interface GenieSparkDraftsPanelProps {
  drafts: GenieSparkDraft[];
  onSelectDraft: (draft: GenieSparkDraft) => void;
  onDeleteDraft: (id: string) => void;
  onExportDraft: (id: string) => void;
  onSendToEditor: (draft: GenieSparkDraft) => void;
  onSendToVibe: (draft: GenieSparkDraft) => void;
  selectedDraftId?: string;
  className?: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'podcast_script':
      return <Radio className="h-4 w-4" />;
    case 'video_script':
      return <Video className="h-4 w-4" />;
    case 'presentation_script':
      return <Presentation className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getSourceIcon = (sourceType: string) => {
  switch (sourceType) {
    case 'url':
      return '🔗';
    case 'document':
      return '📄';
    case 'image':
      return '🖼️';
    case 'audio':
      return '🎵';
    default:
      return '📝';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'saved':
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Saved
        </Badge>
      );
    case 'exported':
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
          <Download className="h-3 w-3 mr-1" />
          Exported
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-xs">
          <Sparkles className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      );
  }
};

export function GenieSparkDraftsPanel({
  drafts,
  onSelectDraft,
  onDeleteDraft,
  onExportDraft,
  onSendToEditor,
  onSendToVibe,
  selectedDraftId,
  className,
}: GenieSparkDraftsPanelProps) {
  if (drafts.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="pt-6 pb-6 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No drafts yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Generated scripts will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Generated Drafts
            </CardTitle>
            <CardDescription className="text-xs">
              {drafts.length} draft{drafts.length !== 1 ? 's' : ''} • Click to preview
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-2">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer group",
                  selectedDraftId === draft.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
                )}
                onClick={() => onSelectDraft(draft)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      {getTypeIcon(draft.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{draft.title}</span>
                        <span className="text-xs">{getSourceIcon(draft.sourceType)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(draft.status)}
                        <span className="text-xs text-muted-foreground">
                          {draft.metadata?.wordCount || 0} words
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(draft.updatedAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => onSelectDraft(draft)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onSendToEditor(draft)}>
                        <PenTool className="h-4 w-4 mr-2" />
                        Open in Script Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendToVibe(draft)}>
                        <Mic className="h-4 w-4 mr-2" />
                        Send to Vibe Recording
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onExportDraft(draft.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Script
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => onDeleteDraft(draft.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Preview snippet */}
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2 ml-11">
                  {draft.content.slice(0, 150).replace(/[#*_]/g, '')}...
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
