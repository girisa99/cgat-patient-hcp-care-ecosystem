
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedChannelMatrix } from './EnhancedChannelMatrix';
import VoiceConfigurationView from '@/components/deployment/VoiceConfigurationView';
import { LiveAgentTransfer } from '@/components/agent-testing/LiveAgentTransfer';
import SharedVoiceConnectors from '@/components/voice/SharedVoiceConnectors';
import { DeploymentFlowManager } from './DeploymentFlowManager';
import { 
  Grid, 
  Phone, 
  Users, 
  Network,
  Rocket
} from 'lucide-react';

interface ChannelAndVoiceSetupProps {
  agentSession?: any;
}

const ChannelAndVoiceSetup: React.FC<ChannelAndVoiceSetupProps> = ({ agentSession }) => {
  const [activeSubTab, setActiveSubTab] = useState('channel-matrix');

  const subTabs = [
    { 
      id: 'channel-matrix', 
      label: 'Enhanced Channel Assignment Matrix', 
      icon: Grid,
      component: () => <EnhancedChannelMatrix />,
      description: 'Configure channels including scheduling, Uber, voice, and webchat with Gen AI capabilities.'
    },
    { 
      id: 'voice-config', 
      label: 'Voice Configuration', 
      icon: Phone,
      component: VoiceConfigurationView,
      description: 'Configure voice adapters and settings for audio interactions.'
    },
    { 
      id: 'live-transfer', 
      label: 'Live Agent Transfer', 
      icon: Users,
      component: LiveAgentTransfer,
      description: 'Configure live handoff when users request to speak with human agents.'
    },
    { 
      id: 'system-connectors', 
      label: 'System Connectors & API Ecosystem', 
      icon: Network,
      component: SharedVoiceConnectors,
      description: 'Manage voice system connectors, API integrations, and external service connections.'
    },
    {
      id: 'deployment-flow',
      label: 'Deployment Flow Verification',
      icon: Rocket,
      component: () => <DeploymentFlowManager agentSession={agentSession} />,
      description: 'Verify complete configuration flow and generate deployment code snippets.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-green-900 mb-3 text-lg">Channel & Voice Configuration</h3>
        <p className="text-green-700">
          Configure channel assignments, voice adapters, communication settings, and verify the complete deployment flow from configuration to code generation.
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="child-tabs grid grid-cols-5">
          {subTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="child-tab-trigger flex flex-col items-center gap-1 p-3"
              >
                <IconComponent className="h-4 w-4" />
                <span className="font-medium text-xs text-center leading-tight">
                  {tab.label.split(' ').slice(0, 2).join(' ')}
                  {tab.label.split(' ').length > 2 && (
                    <>
                      <br />
                      {tab.label.split(' ').slice(2).join(' ')}
                    </>
                  )}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {subTabs.map((tab) => {
          return (
            <TabsContent key={tab.id} value={tab.id} className="child-tab-content">
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    {tab.description}
                  </p>
                </div>
                {tab.id === 'channel-matrix' && <EnhancedChannelMatrix />}
                {tab.id === 'voice-config' && <VoiceConfigurationView />}
                {tab.id === 'live-transfer' && <LiveAgentTransfer />}
                {tab.id === 'system-connectors' && <SharedVoiceConnectors />}
                {tab.id === 'deployment-flow' && <DeploymentFlowManager agentSession={agentSession} />}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ChannelAndVoiceSetup;
