
import React from 'react';
import { ApiCard } from './ApiCard';
import { ApiEmptyState } from './ApiEmptyState';

interface ApiSectionStateProps {
  apis: any[];
  type: 'internal' | 'external' | 'published';
  title: string;
  icon: React.ReactNode;
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

export const ApiSectionState: React.FC<ApiSectionStateProps> = ({
  apis,
  type,
  title,
  icon,
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
  // Empty State
  if (apis.length === 0) {
    return <ApiEmptyState title={title} type={type} icon={icon} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
      {apis.slice(0, 3).map((api) => (
        <ApiCard
          key={api.id}
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
      ))}
      
      {apis.length > 3 && (
        <div className="col-span-full text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-sm text-muted-foreground">
            +{apis.length - 3} more {title.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
};
