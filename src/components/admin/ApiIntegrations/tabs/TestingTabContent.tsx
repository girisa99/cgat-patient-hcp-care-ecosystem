
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ApiTestingInterface } from '../ApiTestingInterface';

interface TestingTabContentProps {
  integrations: any[];
  onClose: () => void;
}

export const TestingTabContent: React.FC<TestingTabContentProps> = ({
  integrations,
  onClose
}) => {
  return (
    <TabsContent value="testing" className="w-full space-y-6">
      <div className="w-full">
        <ApiTestingInterface 
          integration={integrations?.[0]} 
          onClose={onClose}
        />
      </div>
    </TabsContent>
  );
};
