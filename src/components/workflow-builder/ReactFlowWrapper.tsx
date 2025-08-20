import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { CustomerJourneyBuilder } from './CustomerJourneyBuilder';

interface ReactFlowWrapperProps {
  initialWorkflow?: any;
  onSave?: (workflow: any) => void;
  onGenerateAgent?: (workflow: any) => void;
  // Unified builder context
  useCaseData?: {
    name: string;
    description: string;
    selectedUseCase?: any;
    detailedUseCase?: string;
    targetUsers?: string;
    expectedOutcomes?: string;
  };
  capturedRequirements?: {
    connectors: string[];
    actions: string[];
    steps: string[];
    integrations: string[];
  };
  journeyStages?: any[];
  sessionId?: string;
}

export const ReactFlowWrapper: React.FC<ReactFlowWrapperProps> = (props) => {
  return (
    <ReactFlowProvider>
      <CustomerJourneyBuilder {...props} />
    </ReactFlowProvider>
  );
};