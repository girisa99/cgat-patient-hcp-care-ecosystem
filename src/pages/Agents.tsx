import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgenticEcosystem from '@/pages/AgenticEcosystem';
import { DeploymentManagementInterface } from '@/components/deployment/DeploymentManagementInterface';
import { AgentTestingInterface } from '@/components/agent-testing/AgentTestingInterface';
import { LiveAgentTransfer } from '@/components/agent-testing/LiveAgentTransfer';
import { AgentChannelAssignmentMatrix } from '@/components/agent-deployment/AgentChannelAssignmentMatrix';
import AgenticAPIEcosystem from '@/pages/AgenticAPIEcosystem';
import { AgenticAIPresentation } from '@/components/presentation/AgenticAIPresentation';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { 
  Bot, 
  Settings, 
  Users, 
  Presentation,
  X,
  TestTube,
  UserCog,
  Grid,
  Rocket,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Role-specific components - defined before use to avoid React error #185
import TreatmentCentersView from '@/components/onboarding/TreatmentCentersView';

const OnboardingAgentsView = () => {
  return <TreatmentCentersView />;
};

const AgentSettingsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          SuperAdmin Only - Agent Configuration
        </h3>
        <p className="text-red-700">
          Advanced agent settings and configurations - SuperAdmin exclusive access.
        </p>
      </div>
      
      {/* SuperAdmin-only settings would go here */}
      <div className="space-y-4">
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-medium mb-2">Global Agent Settings</h4>
          <p className="text-sm text-muted-foreground">
            Configure system-wide agent parameters and security settings.
          </p>
        </div>
      </div>
    </div>
  );
};

const Agents = () => {
  console.log('🚀 Agents page rendering...');
  const [activeTab, setActiveTab] = useState('ecosystem');
  const [showPresentation, setShowPresentation] = useState(false);
  const { userRoles } = useMasterAuth();
  console.log('🎭 User roles:', userRoles);

  // Role-based access control
  const isSuperAdmin = userRoles.includes('superAdmin');
  const isOnboardingTeam = userRoles.includes('onboardingTeam');
  const isAdmin = userRoles.includes('admin');

  // Generate available tabs based on user roles - reorganized structure
  const availableTabs = [
    { id: 'ecosystem', label: 'Agent Ecosystem', component: 'AgenticEcosystem' },
    { id: 'deployment', label: 'Agent Deployment', component: 'DeploymentManagementInterface' },
    { id: 'testing', label: 'Agent Testing', component: 'AgentTestingInterface' },
    { id: 'channels', label: 'Channel Management', component: 'AgentChannelAssignmentMatrix' },
    { id: 'connectors', label: 'System Connectors', component: 'AgenticAPIEcosystem' },
    ...(isOnboardingTeam ? [{ id: 'onboarding', label: 'Treatment Centers', component: 'OnboardingAgentsView' }] : []),
    ...(isSuperAdmin ? [{ id: 'settings', label: 'Agent Settings', component: 'AgentSettingsView' }] : []),
  ];

  // Add error boundary for debugging
  try {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Role-specific header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isOnboardingTeam && !isSuperAdmin ? 'Treatment Center Agents' : 'Agents'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isOnboardingTeam && !isSuperAdmin 
                  ? 'Create, configure, and deploy agents for treatment center onboarding workflows. Use Deployment Management to deploy agents to live channels.'
                  : 'Create, configure, and deploy intelligent agents for healthcare automation across multiple channels.'
                }
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowPresentation(!showPresentation)}
              className="flex items-center gap-2"
            >
              <Presentation className="w-4 h-4" />
              {showPresentation ? 'Hide' : 'Show'} AI Presentation
            </Button>
          </div>

          {/* AI Presentation Display */}
          {showPresentation && (
            <div className="mb-8">
              <AgenticAIPresentation />
            </div>
          )}

          {/* Dynamic Tabs based on role */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full gap-2 h-auto p-2 justify-start overflow-x-auto">
              {availableTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 min-w-fit"
                >
                  {tab.id === 'ecosystem' && <Bot className="h-4 w-4" />}
                  {tab.id === 'deployment' && <Rocket className="h-4 w-4" />}
                  {tab.id === 'testing' && <TestTube className="h-4 w-4" />}
                  {tab.id === 'channels' && <Grid className="h-4 w-4" />}
                  {tab.id === 'connectors' && <Network className="h-4 w-4" />}
                  {tab.id === 'onboarding' && <Users className="h-4 w-4" />}
                  {tab.id === 'settings' && <Settings className="h-4 w-4" />}
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="ecosystem">
              <AgenticEcosystem />
            </TabsContent>
            
            <TabsContent value="deployment">
              <DeploymentManagementInterface />
            </TabsContent>

            <TabsContent value="testing">
              <AgentTestingInterface />
            </TabsContent>

            <TabsContent value="channels">
              <div className="space-y-6">
                <AgentChannelAssignmentMatrix />
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Live Agent Transfer</h2>
                  <p className="text-muted-foreground mb-4">
                    Configure live handoff when users request to speak with a human agent during conversations.
                  </p>
                  <LiveAgentTransfer />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="connectors">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">System Connectors & API Ecosystem</h3>
                  <p className="text-blue-700 text-sm">
                    Manage API integrations, system connectors, and external service connections for your agents.
                  </p>
                </div>
                <AgenticAPIEcosystem />
              </div>
            </TabsContent>
            
            {isOnboardingTeam && (
              <TabsContent value="onboarding">
                <OnboardingAgentsView />
              </TabsContent>
            )}
            
            {isSuperAdmin && (
              <TabsContent value="settings">
                <AgentSettingsView />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </AppLayout>
    );
  } catch (error) {
    console.error('🚨 Error in Agents component:', error);
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Agents</h1>
          <p className="text-muted-foreground">
            There was an error loading the agents interface. Please check the console for details.
          </p>
        </div>
      </AppLayout>
    );
  }
};

export default Agents;