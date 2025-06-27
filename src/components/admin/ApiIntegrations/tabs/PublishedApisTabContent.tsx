
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import PublishedApisSection from '../PublishedApisSection';
import ExternalApiPublisher from '../ExternalApiPublisher';

export const PublishedApisTabContent: React.FC = () => {
  return (
    <TabsContent value="published" className="w-full space-y-6">
      <div className="w-full space-y-6">
        <div className="w-full">
          <PublishedApisSection />
        </div>
        <div className="w-full">
          <ExternalApiPublisher />
        </div>
      </div>
    </TabsContent>
  );
};
