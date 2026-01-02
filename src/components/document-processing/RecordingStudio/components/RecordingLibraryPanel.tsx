/**
 * Recording Library Panel Component
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Play, Download, Trash2, X, Library } from 'lucide-react';
import type { LibraryRecording } from '../types';

interface RecordingLibraryPanelProps {
  recordings: LibraryRecording[];
  isOpen: boolean;
  onClose: () => void;
  onPlay: (id: number) => void;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export function RecordingLibraryPanel({
  recordings,
  isOpen,
  onClose,
  onPlay,
  onDownload,
  onDelete,
  isLoading,
}: RecordingLibraryPanelProps) {
  const [previewId, setPreviewId] = useState<number | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Library className="w-5 h-5" />
            Recording Library
            <span className="text-sm font-normal text-muted-foreground">
              ({recordings.length} recording{recordings.length !== 1 ? 's' : ''})
            </span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Library className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recordings yet</p>
              <p className="text-sm mt-1">Your recordings will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-muted/50 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{rec.name}</h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span>{formatDate(rec.timestamp)}</span>
                        <span>⏱ {formatDuration(rec.duration)}</span>
                        <span>📦 {formatSize(rec.size)}</span>
                      </div>
                      {rec.scriptTitle && (
                        <span className="text-xs text-primary mt-1 block">
                          📝 {rec.scriptTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        setPreviewId(rec.id);
                        onPlay(rec.id);
                      }}
                    >
                      <Play className="w-3 h-3" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => onDownload(rec.id)}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm('Delete this recording? This cannot be undone.')) {
                          onDelete(rec.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
