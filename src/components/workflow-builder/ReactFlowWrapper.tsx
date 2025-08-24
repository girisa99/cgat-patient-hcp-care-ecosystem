import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { AdvancedReactFlowWrapper } from './AdvancedReactFlow';

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
  // Convert legacy props to AdvancedReactFlow format
  const advancedProps = {
    initialNodes: props.initialWorkflow?.nodes || [],
    initialEdges: props.initialWorkflow?.edges || [],
    onSave: props.onSave,
    workflowType: 'visual' as const,
    sessionId: props.sessionId,
    fitParent: true, // Use parent height instead of screen
    useCaseData: props.useCaseData,
    capturedRequirements: props.capturedRequirements,
    journeyStages: props.journeyStages
  };

  return (
    <ReactFlowProvider>
      <AdvancedReactFlowWrapper {...advancedProps} />
    </ReactFlowProvider>
  );
};