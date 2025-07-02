
import React from 'react';
import { Section } from '@/components/ui/layout/Section';
import { InternalApiEndpointsList } from '../InternalApiEndpointsList';
import CreateIntegrationDialog from '../CreateIntegrationDialog';

interface InternalApisTabContentProps {
  internalApis: any[];
  searchTerm: string;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  onEditApi: (api: any) => void;
  onDeleteApi: (id: string) => Promise<void>;
  onTestEndpoint: (endpoint: any) => Promise<void>;
}

export const InternalApisTabContent: React.FC<InternalApisTabContentProps> = ({
  internalApis,
  searchTerm,
  createDialogOpen,
  setCreateDialogOpen,
  onEditApi,
  onDeleteApi,
  onTestEndpoint
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
        onDownloadCollection={() => {}}
        onViewDetails={() => {}}
        onViewDocumentation={() => {}}
        onCopyUrl={() => {}}
      />
    </Section>
  );
};
