
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Eye, 
  Settings, 
  TrendingUp,
  RotateCcw,
  Trash2,
  RefreshCw,
  Rocket,
  ArrowUpCircle
} from 'lucide-react';

interface ApiCardActionsProps {
  api: any;
  type: 'internal' | 'external' | 'published';
  isProcessing: string | null;
  onPublish?: (api: any) => void;
  onConfigure?: (api: any) => void;
  onViewAnalytics?: (api: any) => void;
  onRevertToDraft?: (api: any) => void;
  onCancelPublication?: (api: any) => void;
  onStatusUpdate?: (apiId: string, status: string) => void;
  onViewDetails?: (apiId: string) => void;
  isUpdatingStatus?: boolean;
}

export const ApiCardActions: React.FC<ApiCardActionsProps> = ({
  api,
  type,
  isProcessing,
  onPublish,
  onConfigure,
  onViewAnalytics,
  onRevertToDraft,
  onCancelPublication,
  onStatusUpdate,
  onViewDetails,
  isUpdatingStatus
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Internal API Publish Button */}
      {type === 'internal' && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onPublish?.(api)}
          className="bg-blue-50 hover:bg-blue-100 flex-shrink-0"
          disabled={isProcessing !== null}
        >
          {isProcessing === `publish-${api.id}` ? (
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <ArrowUpCircle className="h-3 w-3 mr-1" />
          )}
          Publish
        </Button>
      )}
      
      {/* Published/External API Management Buttons */}
      {(type === 'published' || type === 'external') && (
        <>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onConfigure?.(api)}
            disabled={isProcessing !== null}
            className="bg-gray-50 hover:bg-gray-100 flex-shrink-0"
          >
            {isProcessing !== null ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Settings className="h-3 w-3 mr-1" />
            )}
            Manage
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewAnalytics?.(api)}
            disabled={isProcessing !== null}
            className="bg-blue-50 hover:bg-blue-100 flex-shrink-0"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Analytics
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                disabled={isProcessing !== null}
                className="bg-orange-50 hover:bg-orange-100 flex-shrink-0"
              >
                {isProcessing === `revert-${api.id}` ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RotateCcw className="h-3 w-3 mr-1" />
                )}
                Revert
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revert to Draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will change the status back to draft and unpublish the API. 
                  The API will no longer be accessible to external developers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRevertToDraft?.(api)}>
                  Revert to Draft
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="destructive"
                disabled={isProcessing !== null}
                className="flex-shrink-0"
              >
                {isProcessing === `cancel-${api.id}` ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-1" />
                )}
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Publication?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the external API and all its data. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep API</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onCancelPublication?.(api)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      
      {/* External API Publish Button (for draft/review status) */}
      {(type === 'external' && (api.status === 'draft' || api.status === 'review')) && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onStatusUpdate?.(api.id, 'published')}
          disabled={isProcessing !== null || isUpdatingStatus}
          className="bg-green-50 hover:bg-green-100 flex-shrink-0"
        >
          {isProcessing === `status-${api.id}` || isUpdatingStatus ? (
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Rocket className="h-3 w-3 mr-1" />
          )}
          Publish
        </Button>
      )}
      
      {/* View Details Button - Always last */}
      <Button 
        size="sm" 
        variant="ghost"
        onClick={() => onViewDetails?.(api.id)}
        disabled={isProcessing !== null}
        className="flex-shrink-0 ml-auto"
      >
        <Eye className="h-3 w-3 mr-1" />
        View
      </Button>
    </div>
  );
};
