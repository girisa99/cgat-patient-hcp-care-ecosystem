
import React from 'react';
import { Section } from '@/components/ui/layout/Section';
import { InternalApiEndpointsList } from '../InternalApiEndpointsList';
import CreateIntegrationDialog from '../CreateIntegrationDialog';

interface InternalApisTabContentProps {
  internalApis: any[];
  searchTerm: string;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  onDownloadCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewDocumentation: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export const InternalApisTabContent: React.FC<InternalApisTabContentProps> = ({
  internalApis,
  searchTerm,
  createDialogOpen,
  setCreateDialogOpen,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl
}) => {
  return (
    <Section 
      variant="card" 
      title="Internal APIs" 
      subtitle={`APIs developed and managed internally (${internalApis?.length || 0} total).`}
      headerActions={
        <CreateIntegrationDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      }
    >
      <InternalApiEndpointsList 
        apis={internalApis || []} 
        searchTerm={searchTerm}
        onDownloadCollection={onDownloadCollection}
        onViewDetails={onViewDetails}
        onViewDocumentation={onViewDocumentation}
        onCopyUrl={onCopyUrl}
      />
    </Section>
  );
};
