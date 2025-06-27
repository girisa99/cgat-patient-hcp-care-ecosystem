
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import DeveloperPortal from '../DeveloperPortal';

export const DeveloperTabContent: React.FC = () => {
  return (
    <TabsContent value="developer" className="space-y-6">
      <DeveloperPortal />
    </TabsContent>
  );
};
