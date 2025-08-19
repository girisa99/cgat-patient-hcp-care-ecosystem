import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { CustomerJourneyBuilder } from './CustomerJourneyBuilder';

interface ReactFlowWrapperProps {
  initialWorkflow?: any;
  onSave?: (workflow: any) => void;
  onGenerateAgent?: (workflow: any) => void;
}

export const ReactFlowWrapper: React.FC<ReactFlowWrapperProps> = (props) => {
  return (
    <ReactFlowProvider>
      <CustomerJourneyBuilder {...props} />
    </ReactFlowProvider>
  );
};