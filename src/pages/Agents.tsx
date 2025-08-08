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
import DeploymentReadyView from '@/components/deployment/DeploymentReadyView';
import EnhancedDeploymentReadyView from '@/components/deployment/EnhancedDeploymentReadyView';
import VoiceConfigurationView from '@/components/deployment/VoiceConfigurationView';
import ActiveDeploymentsView from '@/components/deployment/ActiveDeploymentsView';
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
  Network,
  Phone,
  Activity
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

  // Generate available tabs based on user roles - reorganized for better UX flow
  const availableTabs = [
    { id: 'ecosystem', label: 'Agent Ecosystem', component: 'AgenticEcosystem' },
    ...(isOnboardingTeam ? [{ id: 'onboarding', label: 'Treatment Centers', component: 'OnboardingAgentsView' }] : []),
    { id: 'deployment-ready', label: 'Deployment Ready', component: 'DeploymentReady' },
    { id: 'channel-assignment', label: 'Channel & Voice Setup', component: 'ChannelAssignment' },
    { id: 'testing', label: 'Agent Testing', component: 'AgentTestingInterface' },
    { id: 'active-deployments', label: 'Active Deployments', component: 'ActiveDeployments' },
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
            <TabsList className="parent-tabs">
              {availableTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="parent-tab-trigger"
                >
                  {tab.id === 'ecosystem' && <Bot className="h-5 w-5" />}
                  {tab.id === 'onboarding' && <Users className="h-5 w-5" />}
                  {tab.id === 'deployment-ready' && <Rocket className="h-5 w-5" />}
                  {tab.id === 'channel-assignment' && <Grid className="h-5 w-5" />}
                  {tab.id === 'testing' && <TestTube className="h-5 w-5" />}
                  {tab.id === 'active-deployments' && <Activity className="h-5 w-5" />}
                  {tab.id === 'settings' && <Settings className="h-5 w-5" />}
                  <span className="font-semibold">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="ecosystem" className="parent-tab-content">
              <AgenticEcosystem />
            </TabsContent>
            
            <TabsContent value="deployment-ready" className="parent-tab-content">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-blue-900 mb-3 text-lg">Ready for Deployment</h3>
                  <p className="text-blue-700">
                    View agents from the ecosystem and sessions from treatment centers that are ready to be deployed to live channels. This shows the complete data flow from creation to deployment.
                  </p>
                </div>
                <EnhancedDeploymentReadyView />
              </div>
            </TabsContent>

            <TabsContent value="channel-assignment" className="parent-tab-content">
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-green-900 mb-3 text-lg">Channel & Voice Configuration</h3>
                  <p className="text-green-700">
                    Configure channel assignments, voice adapters, and communication settings all in one place.
                  </p>
                </div>
                
                {/* Channel Assignment Matrix */}
                <AgentChannelAssignmentMatrix />
                
                {/* Voice Configuration */}
                <div className="border-t border-border/30 pt-8">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 mb-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Phone className="h-6 w-6 text-purple-600" />
                      Voice Configuration
                    </h2>
                    <p className="text-purple-700">Configure voice adapters and settings for audio interactions.</p>
                  </div>
                  <VoiceConfigurationView />
                </div>
                
                {/* Live Agent Transfer */}
                <div className="border-t border-border/30 pt-8">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Users className="h-6 w-6 text-orange-600" />
                      Live Agent Transfer
                    </h2>
                    <p className="text-orange-700">
                      Configure live handoff when users request to speak with a human agent during conversations.
                    </p>
                  </div>
                  <LiveAgentTransfer />
                </div>

                {/* System Connectors - Merged from separate tab */}
                <div className="border-t border-border/30 pt-8">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6 mb-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Network className="h-6 w-6 text-indigo-600" />
                      System Connectors & API Ecosystem
                    </h2>
                    <p className="text-indigo-700">
                      Manage API integrations, system connectors, and external service connections for your agents.
                    </p>
                  </div>
                  <AgenticAPIEcosystem />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testing" className="parent-tab-content">
              <AgentTestingInterface />
            </TabsContent>

            <TabsContent value="active-deployments" className="parent-tab-content">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-orange-900 mb-3 text-lg">Active Deployments</h3>
                  <p className="text-orange-700">
                    Monitor and manage currently deployed agents across all channels.
                  </p>
                </div>
                <ActiveDeploymentsView />
              </div>
            </TabsContent>
            {isOnboardingTeam && (
              <TabsContent value="onboarding" className="parent-tab-content">
                <OnboardingAgentsView />
              </TabsContent>
            )}
            
            {isSuperAdmin && (
              <TabsContent value="settings" className="parent-tab-content">
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