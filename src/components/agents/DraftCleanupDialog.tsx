import React from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { useDraftCleanup } from '@/hooks/useDraftCleanup';
import { formatDistanceToNow } from 'date-fns';

export const DraftCleanupDialog: React.FC = () => {
  const {
    showCleanupDialog,
    setShowCleanupDialog,
    cleanupPreview,
    oldDrafts,
    performCleanup,
    dismissCleanup,
    isCleaningUp,
  } = useDraftCleanup();

  if (!showCleanupDialog) return null;

  const totalCount = cleanupPreview?.total_count || 0;

  return (
    <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Old Draft Agents Found
          </DialogTitle>
          <DialogDescription>
            We found {totalCount} draft agent{totalCount === 1 ? '' : 's'} that haven't been updated in over 7 days.
            Would you like to clean them up to keep your workspace organized?
          </DialogDescription>
        </DialogHeader>

        {oldDrafts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Old Draft Agents</span>
            </div>
            
            <ScrollArea className="max-h-60 w-full rounded-md border">
              <div className="p-4 space-y-3">
                {oldDrafts.map((draft) => (
                  <div
                    key={`${draft.table_source}-${draft.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{draft.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {draft.table_source === 'agents' ? 'Agent' : 'Session'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Last updated {formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {draft.days_old} days old
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">What will happen?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Draft agents and sessions older than 7 days will be permanently deleted</li>
                <li>• Active or deployed agents will not be affected</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={dismissCleanup} disabled={isCleaningUp}>
            Keep All Drafts
          </Button>
          <Button 
            onClick={performCleanup} 
            disabled={isCleaningUp}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isCleaningUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Cleaning Up...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {totalCount} Old Draft{totalCount === 1 ? '' : 's'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};