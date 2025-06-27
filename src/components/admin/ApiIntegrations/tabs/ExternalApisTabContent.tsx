
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Section } from '@/components/ui/layout/Section';
import { ExternalApiEndpointsList } from '../ExternalApiEndpointsList';
import { CreateIntegrationDialog } from '../CreateIntegrationDialog';

interface ExternalApisTabContentProps {
  externalApis: any[];
  searchTerm: string;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  onDownloadCollection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewDocumentation: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export const ExternalApisTabContent: React.FC<ExternalApisTabContentProps> = ({
  externalApis,
  searchTerm,
  createDialogOpen,
  setCreateDialogOpen,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl
}) => {
  return (
    <TabsContent value="external" className="w-full space-y-6">
      <div className="w-full">
        <Section 
          variant="card" 
          title="External APIs" 
          subtitle={`APIs from external sources (${externalApis?.length || 0} total).`}
          headerActions={
            <CreateIntegrationDialog 
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
            />
          }
          className="w-full"
        >
          <div className="w-full">
            <ExternalApiEndpointsList 
              apis={externalApis || []}
              searchTerm={searchTerm}
              onDownloadCollection={onDownloadCollection}
              onViewDetails={onViewDetails}
              onViewDocumentation={onViewDocumentation}
              onCopyUrl={onCopyUrl}
            />
          </div>
        </Section>
      </div>
    </TabsContent>
  );
};
