import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Network, Users, Settings, Presentation } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { Button } from '@/components/ui/button';
import { AgenticAIPresentation } from '@/components/presentation/AgenticAIPresentation';

// Import the ecosystem components
import AgenticEcosystem from './AgenticEcosystem';
import AgenticAPIEcosystem from './AgenticAPIEcosystem';

// Role-specific components - defined before use to avoid React error #185
const OnboardingAgentsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Onboarding Team Agent Dashboard
        </h3>
        <p className="text-blue-700">
          This functionality is exclusively for onboarding team workflows and 
          is not visible to other roles.
        </p>
      </div>
      
      {/* Onboarding-specific agent functionality goes here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-medium mb-2">Treatment Center Verification Agent</h4>
          <p className="text-sm text-muted-foreground">
            Automates verification of treatment center credentials and documentation.
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-medium mb-2">Compliance Assessment Agent</h4>
          <p className="text-sm text-muted-foreground">
            Validates compliance requirements during onboarding process.
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-medium mb-2">Documentation Processing Agent</h4>
          <p className="text-sm text-muted-foreground">
            Processes and validates submitted onboarding documents.
          </p>
        </div>
      </div>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState('agentic-ecosystem');
  const [showPresentation, setShowPresentation] = useState(false);
  const { userRoles } = useMasterAuth();
  console.log('🎭 User roles:', userRoles);

  // Role-based access control
  const isSuperAdmin = userRoles.includes('superAdmin');
  const isOnboardingTeam = userRoles.includes('onboardingTeam');
  const isAdmin = userRoles.includes('admin');

  // Determine available tabs based on role
  const getAvailableTabs = () => {
    const tabs = [];
    
    // Base tabs available to all roles
    tabs.push({
      value: 'agentic-ecosystem',
      label: 'Agentic Ecosystem',
      icon: Bot,
      component: <AgenticEcosystem />
    });

    // SuperAdmin and Admin only tabs
    if (isSuperAdmin || isAdmin) {
      tabs.push({
        value: 'agentic-api-ecosystem',
        label: 'Agentic API Ecosystem',
        icon: Network,
        component: <AgenticAPIEcosystem />
      });
    }

    // OnboardingTeam specific tabs
    if (isOnboardingTeam) {
      tabs.push({
        value: 'onboarding-agents',
        label: 'Onboarding Agents',
        icon: Users,
        component: <OnboardingAgentsView />
      });
    }

    // SuperAdmin exclusive tabs
    if (isSuperAdmin) {
      tabs.push({
        value: 'agent-settings',
        label: 'Agent Settings',
        icon: Settings,
        component: <AgentSettingsView />
      });
    }

    return tabs;
  };

  const availableTabs = getAvailableTabs();

  // Default tab is already set to 'agentic-ecosystem' in useState

  // Get grid class based on number of tabs
  const getGridClass = (tabCount: number) => {
    switch(tabCount) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-2';
    }
  };

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
                  ? 'Manage agents for treatment center onboarding workflows'
                  : 'Manage and deploy intelligent agents for healthcare automation'
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
            <TabsList className={`grid w-full ${getGridClass(availableTabs.length)}`}>
              {availableTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {availableTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="space-y-4">
                {tab.component}
              </TabsContent>
            ))}
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