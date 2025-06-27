
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { ApiCardActions } from './ApiCardActions';

interface ApiCardProps {
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

export const ApiCard: React.FC<ApiCardProps> = ({
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold truncate">{api.external_name || api.name}</h4>
                {api.status && (
                  <Badge variant={api.status === 'published' ? 'default' : 'secondary'}>
                    {api.status}
                  </Badge>
                )}
                {(type === 'published' || type === 'external') && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Synced
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {api.external_description || api.description || 'No description available'}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Version {api.version || '1.0.0'}</span>
                {api.endpoints?.length && (
                  <>
                    <span>•</span>
                    <span>{api.endpoints.length} endpoints</span>
                  </>
                )}
                {(type === 'published' || type === 'external') && api.published_at && (
                  <>
                    <span>•</span>
                    <span>Published {new Date(api.published_at).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="pt-2 border-t border-gray-100">
            <ApiCardActions
              api={api}
              type={type}
              isProcessing={isProcessing}
              onPublish={onPublish}
              onConfigure={onConfigure}
              onViewAnalytics={onViewAnalytics}
              onRevertToDraft={onRevertToDraft}
              onCancelPublication={onCancelPublication}
              onStatusUpdate={onStatusUpdate}
              onViewDetails={onViewDetails}
              isUpdatingStatus={isUpdatingStatus}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
