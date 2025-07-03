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
import { ApiSummary } from '@/types/api';

interface ApiCardActionsProps {
  api: ApiSummary;
  type: 'internal' | 'external' | 'published';
  isProcessing: string | null;
  onPublish?: (api: ApiSummary) => void;
  onConfigure?: (api: ApiSummary) => void;
  onViewAnalytics?: (api: ApiSummary) => void;
  onRevertToDraft?: (api: ApiSummary) => void;
  onCancelPublication?: (api: ApiSummary) => void;
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
    <div className="space-y-3">
      {/* Primary Actions Row */}
      <div className="flex flex-wrap gap-2">
        {/* Internal API Publish Button */}
        {type === 'internal' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onPublish?.(api)}
            className="bg-blue-50 hover:bg-blue-100"
            disabled={isProcessing !== null}
          >
            {isProcessing === `publish-${api.id}` ? (
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
            ) : (
              <ArrowUpCircle className="h-3 w-3 mr-2" />
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
              className="bg-gray-50 hover:bg-gray-100"
            >
              {isProcessing !== null ? (
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <Settings className="h-3 w-3 mr-2" />
              )}
              Manage
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewAnalytics?.(api)}
              disabled={isProcessing !== null}
              className="bg-blue-50 hover:bg-blue-100"
            >
              <TrendingUp className="h-3 w-3 mr-2" />
              Analytics
            </Button>
          </>
        )}
        
        {/* External API Publish Button (for draft/review status) */}
        {(type === 'external' && (api.status === 'draft' || api.status === 'review')) && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onStatusUpdate?.(api.id, 'published')}
            disabled={isProcessing !== null || isUpdatingStatus}
            className="bg-green-50 hover:bg-green-100"
          >
            {isProcessing === `status-${api.id}` || isUpdatingStatus ? (
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
            ) : (
              <Rocket className="h-3 w-3 mr-2" />
            )}
            Publish
          </Button>
        )}
        
        {/* View Details Button */}
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => onViewDetails?.(api.id)}
          disabled={isProcessing !== null}
          className="ml-auto"
        >
          <Eye className="h-3 w-3 mr-2" />
          View
        </Button>
      </div>

      {/* Secondary Actions Row (for destructive actions) */}
      {(type === 'published' || type === 'external') && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                disabled={isProcessing !== null}
                className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
              >
                {isProcessing === `revert-${api.id}` ? (
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-3 w-3 mr-2" />
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
                variant="outline"
                disabled={isProcessing !== null}
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
              >
                {isProcessing === `cancel-${api.id}` ? (
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-2" />
                )}
                Delete
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
        </div>
      )}
    </div>
  );
};
