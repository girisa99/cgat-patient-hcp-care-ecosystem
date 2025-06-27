
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Grid, GridItem } from '@/components/ui/layout/Grid';
import PublishedApisSection from '../PublishedApisSection';
import ExternalApiPublisher from '../ExternalApiPublisher';

export const PublishedApisTabContent: React.FC = () => {
  return (
    <TabsContent value="published" className="space-y-6">
      <Grid cols={12} gap="lg">
        <GridItem span={12}>
          <PublishedApisSection />
        </GridItem>
        <GridItem span={12}>
          <ExternalApiPublisher />
        </GridItem>
      </Grid>
    </TabsContent>
  );
};
