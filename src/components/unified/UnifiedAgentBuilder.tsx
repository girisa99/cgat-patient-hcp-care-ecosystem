import React from 'react';
import ProgressiveAgentBuilder from './ProgressiveAgentBuilder';

interface UnifiedAgentBuilderProps {
  step?: string;
}

export const UnifiedAgentBuilder: React.FC<UnifiedAgentBuilderProps> = ({ step }) => {
  return <ProgressiveAgentBuilder step={step} />;
};

export default UnifiedAgentBuilder;