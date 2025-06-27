
import React from 'react';
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
    <ApiTestingInterface 
      integration={integrations?.[0]} 
      onClose={onClose}
    />
  );
};
