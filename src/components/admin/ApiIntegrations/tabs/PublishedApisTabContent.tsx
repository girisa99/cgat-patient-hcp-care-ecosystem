
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import PublishedApisSection from '../PublishedApisSection';
import ExternalApiPublisher from '../ExternalApiPublisher';

export const PublishedApisTabContent: React.FC = () => {
  return (
    <TabsContent value="published" className="space-y-6">
      <PublishedApisSection />
      <ExternalApiPublisher />
    </TabsContent>
  );
};
