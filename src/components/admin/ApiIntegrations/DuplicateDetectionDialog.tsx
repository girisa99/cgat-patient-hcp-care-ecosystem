
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, RefreshCw, Rocket } from 'lucide-react';

interface DuplicateDetectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  duplicateInfo: any;
  isProcessing: string | null;
  onSyncEndpoints: () => void;
  onForceRepublish: () => void;
}

export const DuplicateDetectionDialog: React.FC<DuplicateDetectionDialogProps> = ({
  isOpen,
  onOpenChange,
  duplicateInfo,
  isProcessing,
  onSyncEndpoints,
  onForceRepublish
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Duplicate API Detected
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>An API with similar properties already exists:</p>
            {duplicateInfo && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                <div><strong>Existing API:</strong> {duplicateInfo.existingApi.external_name}</div>
                <div><strong>Version:</strong> {duplicateInfo.existingApi.version}</div>
                <div><strong>Status:</strong> {duplicateInfo.existingApi.status}</div>
                <div><strong>Created:</strong> {new Date(duplicateInfo.existingApi.created_at).toLocaleDateString()}</div>
              </div>
            )}
            <p>You can either sync new endpoints to the existing API or force republish as a new API.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing === 'sync'}>Cancel</AlertDialogCancel>
          <Button 
            variant="outline" 
            onClick={onSyncEndpoints}
            className="bg-blue-50 hover:bg-blue-100"
            disabled={isProcessing === 'sync'}
          >
            {isProcessing === 'sync' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Endpoints Only
          </Button>
          <AlertDialogAction 
            onClick={onForceRepublish}
            disabled={isProcessing === 'sync'}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Force Republish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
