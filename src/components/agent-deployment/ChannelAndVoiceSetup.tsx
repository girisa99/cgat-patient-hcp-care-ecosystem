import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentChannelAssignmentMatrix } from '@/components/agent-deployment/AgentChannelAssignmentMatrix';
import VoiceConfigurationView from '@/components/deployment/VoiceConfigurationView';
import { LiveAgentTransfer } from '@/components/agent-testing/LiveAgentTransfer';
import VoiceConnectors from '@/components/voice/VoiceConnectors';
import { 
  Grid, 
  Phone, 
  Users, 
  Network 
} from 'lucide-react';

const ChannelAndVoiceSetup = () => {
  const [activeSubTab, setActiveSubTab] = useState('channel-matrix');

  const subTabs = [
    { 
      id: 'channel-matrix', 
      label: 'Agent Channel Assignment Matrix', 
      icon: Grid,
      component: AgentChannelAssignmentMatrix,
      description: 'Assign agents to communication channels and manage deployment status.'
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
      component: VoiceConnectors,
      description: 'Manage voice system connectors, API integrations, and external service connections.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-green-900 mb-3 text-lg">Channel & Voice Configuration</h3>
        <p className="text-green-700">
          Configure channel assignments, voice adapters, and communication settings through sequential setup tabs.
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="child-tabs">
          {subTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="child-tab-trigger"
              >
                <IconComponent className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {subTabs.map((tab) => {
          const ComponentToRender = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="child-tab-content">
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    {tab.description}
                  </p>
                </div>
                <ComponentToRender />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ChannelAndVoiceSetup;