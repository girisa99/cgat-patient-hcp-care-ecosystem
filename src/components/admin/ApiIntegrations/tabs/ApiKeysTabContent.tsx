
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Section } from '@/components/ui/layout/Section';
import ApiKeyManager from '../ApiKeyManager';
import ApiKeyIntegrationMonitor from '../ApiKeyIntegrationMonitor';

export const ApiKeysTabContent: React.FC = () => {
  return (
    <TabsContent value="keys" className="w-full space-y-6">
      <div className="w-full">
        <Section 
          variant="card" 
          title="API Key Management" 
          subtitle="Manage your API keys and access tokens"
          className="w-full"
        >
          <div className="w-full space-y-6">
            <div className="w-full">
              <ApiKeyManager />
            </div>
            <div className="w-full">
              <ApiKeyIntegrationMonitor />
            </div>
          </div>
        </Section>
      </div>
    </TabsContent>
  );
};
