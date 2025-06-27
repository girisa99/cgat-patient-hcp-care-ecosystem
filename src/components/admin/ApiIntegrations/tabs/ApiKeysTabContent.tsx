
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Section } from '@/components/ui/layout/Section';
import ApiKeyManager from '../ApiKeyManager';
import ApiKeyIntegrationMonitor from '../ApiKeyIntegrationMonitor';

export const ApiKeysTabContent: React.FC = () => {
  return (
    <TabsContent value="keys" className="space-y-6">
      <Section 
        variant="card" 
        title="API Key Management" 
        subtitle="Manage your API keys and access tokens"
      >
        <div className="space-y-6">
          <ApiKeyManager />
          <ApiKeyIntegrationMonitor />
        </div>
      </Section>
    </TabsContent>
  );
};
