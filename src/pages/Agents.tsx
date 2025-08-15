import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Bot, 
  Users, 
  Settings, 
  Rocket, 
  TestTube, 
  Grid,
  Workflow,
  Presentation,
  ArrowLeft,
  Database,
  Mic,
  Zap
} from 'lucide-react';

// Import agent builder components
import { ModeSelector, type AgentMode } from '@/components/agent-builder/ModeSelector';
import { PromptAssistant } from '@/components/agent-builder/PromptAssistant';
import AgentTabs from '@/components/agent-builder/AgentTabs';
import AppLayout from '@/components/layout/AppLayout';
import AgenticEcosystem from '@/pages/AgenticEcosystem';
import { DeploymentManagementInterface } from '@/components/deployment/DeploymentManagementInterface';
import { AgentTestingInterface } from '@/components/agent-testing/AgentTestingInterface';
import ChannelAndVoiceSetup from '@/components/agent-deployment/ChannelAndVoiceSetup';
import { AgenticAIPresentation } from '@/components/presentation/AgenticAIPresentation';
import DeploymentReadyView from '@/components/deployment/DeploymentReadyView';
import EnhancedDeploymentReadyView from '@/components/deployment/EnhancedDeploymentReadyView';
import { Link } from 'react-router-dom';
import ActiveDeploymentsView from '@/components/deployment/ActiveDeploymentsView';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useQueryClient } from '@tanstack/react-query';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAgentSession } from '@/hooks/useAgentSession';
import { supabase } from '@/integrations/supabase/client';
import TreatmentCentersView from '@/components/onboarding/TreatmentCentersView';
import { AgentBuilderProvider, useAgentBuilder } from '@/components/agent-builder/AgentBuilderProvider';
import ModePicker from '@/components/agent-builder/ModePicker';
import { IntelligentQuestionnaire } from '@/components/agent-builder/IntelligentQuestionnaire';
import { Intelligence } from './Intelligence';
import EmbeddedWorkflowStudio from '@/components/agent-builder/EmbeddedWorkflowStudio';

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

const AgentsInner = () => {
  console.log('🚀 Agents page rendering...');
  
  // Original state
  const [showWelcomeFlow, setShowWelcomeFlow] = useState(false);
  const [welcomeData, setWelcomeData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('ecosystem');
  const [openBuilderSignal, setOpenBuilderSignal] = useState(0);
  const [showPresentation, setShowPresentation] = useState(false);
  
  // New agent builder state
  const [selectedMode, setSelectedMode] = useState<AgentMode | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showPromptAssistant, setShowPromptAssistant] = useState(false);
  const [agentBuilderTab, setAgentBuilderTab] = useState('canvas-designer');

  const { userRoles, user } = useMasterAuth();
  const queryClient = useQueryClient();
  const { userSessions, isLoading: sessionsLoading, setCurrentSessionId } = useAgentBuilder();

  // Role-based access control
  const isSuperAdmin = userRoles.includes('superAdmin');
  const isOnboardingTeam = userRoles.includes('onboardingTeam');
  const isAdmin = userRoles.includes('admin');

  // Handle mode selection
  const handleModeSelect = (mode: AgentMode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
    
    // Set default tab based on mode
    if (mode === 'visual') {
      setAgentBuilderTab('canvas-designer');
    } else {
      setAgentBuilderTab('agent-config');
    }
    
    toast.success(`Switched to ${mode === 'visual' ? 'Visual Workflow' : 'Manual Configuration'} mode`);
  };

  const handleBackToModeSelector = () => {
    setShowModeSelector(true);
    setSelectedMode(null);
    setShowPromptAssistant(false);
  };

  const handlePromptGenerate = (prompt: string, generatedConfig: any) => {
    console.log('Generated config:', generatedConfig);
    
    if (selectedMode === 'visual') {
      // Apply visual configuration
      console.log('Applying visual workflow:', generatedConfig);
    } else {
      // Apply manual configuration
      console.log('Applying manual config:', generatedConfig);
    }
    
    setShowPromptAssistant(false);
  };

  // Show mode selector if no mode selected or user wants to change mode
  if (showModeSelector || !selectedMode) {
    return (
      <AppLayout>
        <div className="p-6">
          <ModeSelector 
            onModeSelect={handleModeSelect}
            selectedMode={selectedMode || undefined}
          />
        </div>
      </AppLayout>
    );
  }

  // Main agent builder interface
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with mode switch option */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToModeSelector}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Mode
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Agent Builder</h1>
              <p className="text-muted-foreground mt-1">
                Building with {selectedMode === 'visual' ? 'Visual Workflow' : 'Manual Configuration'} mode
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPromptAssistant(!showPromptAssistant)}
              className="flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              AI Assistant
            </Button>
          </div>
        </div>

        {/* Agent Builder Tabs */}
        <AgentTabs
          mode={selectedMode}
          activeTab={agentBuilderTab}
          onTabChange={setAgentBuilderTab}
        >
          {/* Visual Mode Tabs */}
          {selectedMode === 'visual' && (
            <>
              <TabsContent value="canvas-designer" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="w-5 h-5" />
                      Visual Workflow Canvas
                    </CardTitle>
                    <CardDescription>
                      Drag and drop components to build your agent's workflow visually
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 border border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Workflow className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Visual workflow builder integration coming soon</p>
                        <Button variant="outline" size="sm">
                          Start Building
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="flow-testing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="w-5 h-5" />
                      Flow Testing
                    </CardTitle>
                    <CardDescription>
                      Test your visual workflow with sample data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Workflow testing interface</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          {/* Manual Mode Tabs */}
          {selectedMode === 'manual' && (
            <>
              <TabsContent value="agent-config" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Agent Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your agent's basic settings and behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Agent configuration forms will be here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions-connectors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Actions & Connectors
                    </CardTitle>
                    <CardDescription>
                      Define actions and external system integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Actions and connectors configuration</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="knowledge-base" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Knowledge Base
                    </CardTitle>
                    <CardDescription>
                      Upload documents and configure data sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Knowledge base configuration</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voice-channels" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Voice Channels
                    </CardTitle>
                    <CardDescription>
                      Configure voice and audio capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Voice channel configuration</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          {/* Common Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Deployment
                </CardTitle>
                <CardDescription>
                  Deploy your agent to various channels and platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Deployment configuration and channel setup</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </AgentTabs>

        {/* Prompt Assistant */}
        {selectedMode && (
          <PromptAssistant
            mode={selectedMode}
            isVisible={showPromptAssistant}
            onToggle={() => setShowPromptAssistant(!showPromptAssistant)}
            onGenerate={handlePromptGenerate}
          />
        )}
      </div>
    </AppLayout>
  );
};

const Agents: React.FC = () => (
  <AgentBuilderProvider>
    <AgentsInner />
  </AgentBuilderProvider>
);

export default Agents;