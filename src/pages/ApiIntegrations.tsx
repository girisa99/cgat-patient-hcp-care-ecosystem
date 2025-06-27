
import React from 'react';
import { Section } from '@/components/ui/layout/Section';
import ApiIntegrationsManager from '@/components/admin/ApiIntegrations/ApiIntegrationsManager';

const ApiIntegrations = () => {
  return (
    <Section>
      <ApiIntegrationsManager />
    </Section>
  );
};

export default ApiIntegrations;
