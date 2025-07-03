
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { ApiCardActions } from './ApiCardActions';
import { ApiSummary } from '@/types/api';

interface ApiCardProps {
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
    <Card className="hover:shadow-md transition-shadow min-w-0">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 flex-wrap">
                <h4 className="font-semibold text-lg flex-1 min-w-0 break-words">
                  {api.external_name || api.name}
                </h4>
                <div className="flex items-center gap-2 flex-shrink-0">
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
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {api.external_description || api.description || 'No description available'}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
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
          <div className="pt-4 border-t border-gray-100">
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
