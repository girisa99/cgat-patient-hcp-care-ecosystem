import React from 'react';
import { UnifiedAgentBuilder } from './UnifiedAgentBuilder';
import { CustomerJourneyBuilder } from '../workflow-builder/CustomerJourneyBuilder';
import { AgentConfigurationManager } from '../workflow-builder/AgentConfigurationManager';

interface AgentBuilderIntegratorProps {
  mode: 'unified' | 'advanced';
  onModeChange: (mode: 'unified' | 'advanced') => void;
}

export const AgentBuilderIntegrator: React.FC<AgentBuilderIntegratorProps> = ({
  mode,
  onModeChange
}) => {
  const handleUnifiedComplete = (agentData: any) => {
    // Auto-populate all existing components with generated data
    console.log('🎉 Agent created via unified builder:', agentData);
    
    // Option to switch to advanced mode for fine-tuning
    if (agentData.requiresCustomization) {
      onModeChange('advanced');
    }
  };

  if (mode === 'unified') {
    return (
      <div className="h-full">
        <UnifiedAgentBuilder onComplete={handleUnifiedComplete} />
        
        {/* Quick switch to advanced mode */}
        <div className="fixed bottom-4 right-4">
          <button 
            onClick={() => onModeChange('advanced')}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Need custom controls? Switch to Advanced Mode
          </button>
        </div>
      </div>
    );
  }

  // Advanced mode - your existing detailed builder
  return (
    <div className="h-full">
      <CustomerJourneyBuilder />
      {/* All your existing detailed components */}
    </div>
  );
};