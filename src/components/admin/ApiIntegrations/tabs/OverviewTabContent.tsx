
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ApiOverviewDashboard from '../ApiOverviewDashboard';

export const OverviewTabContent: React.FC = () => {
  return (
    <TabsContent value="overview" className="space-y-6">
      <ApiOverviewDashboard />
    </TabsContent>
  );
};
