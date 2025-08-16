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
  Zap,
  Building2
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
import { ActionsTab } from '@/components/agentic/tabs/ActionsTab';
import { ModelManagementDashboard } from '@/components/ModelManagement/ModelManagementDashboard';
import { KnowledgeBaseManager } from '@/components/agentic/KnowledgeBaseManager';
import { EnhancedConnectorSystem } from '@/components/agentic/enhanced-connector/EnhancedConnectorSystem';
import AgenticAPIEcosystem from '@/components/agent-deployment/AgenticAPIEcosystem';
import { AgentChannelAssignmentMatrix } from '@/components/agent-deployment/AgentChannelAssignmentMatrix';
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
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
  const [visualWorkflowSubTab, setVisualWorkflowSubTab] = useState('wizard');

  const { userRoles, user } = useMasterAuth();
  const queryClient = useQueryClient();
  const { userSessions, isLoading: sessionsLoading, setCurrentSessionId, currentSessionId, actions, setActions } = useAgentBuilder();

  // Role-based access control
  const isSuperAdmin = userRoles.includes('superAdmin');
  const isOnboardingTeam = userRoles.includes('onboardingTeam');
  const isAdmin = userRoles.includes('admin');

  // Initialize questionnaire before mode selection for first-time users
  useEffect(() => {
    try {
      const completed = localStorage.getItem('agentBuilder_questionnaireCompleted') === 'true';
      setHasCompletedQuestionnaire(completed);
      const firstTime = !completed && (userSessions?.length ?? 0) === 0;
      if (firstTime) {
        setShowQuestionnaire(true);
        setShowModeSelector(false);
      }
    } catch (e) {
      console.warn('Questionnaire init failed:', e);
    }
  }, [userSessions]);

  // Handle questionnaire completion
  const handleQuestionnaireComplete = (data: any) => {
    console.log('Questionnaire completed:', data);
    setHasCompletedQuestionnaire(true);
    setShowQuestionnaire(false);
    try { localStorage.setItem('agentBuilder_questionnaireCompleted', 'true'); } catch {}
    setShowModeSelector(true);
    toast.success('Questionnaire completed! Now select your building method.');
  };

  // Handle mode selection
  const handleModeSelect = (mode: AgentMode) => {
    // Show questionnaire if not completed and first time building
    if (!hasCompletedQuestionnaire && !userSessions?.length) {
      setShowQuestionnaire(true);
      setSelectedMode(mode);
      return;
    }

    setSelectedMode(mode);
    setShowModeSelector(false);
    
    // Set default tab based on mode
    if (mode === 'visual') {
      setAgentBuilderTab('canvas-designer');
      setVisualWorkflowSubTab('wizard');
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

  // Show questionnaire if needed
  if (showQuestionnaire) {
    return (
      <AppLayout>
        <div className="p-6">
          <IntelligentQuestionnaire onComplete={handleQuestionnaireComplete} />
        </div>
      </AppLayout>
    );
  }

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
              title="Open AI Prompt Assistant"
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
          {/* Visual Mode Tab Contents */}
          {selectedMode === 'visual' && (
            <>
              <TabsContent value="canvas-designer" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="w-5 h-5" />
                      Visual Workflow Builder
                    </CardTitle>
                    <CardDescription>
                      Build your agent using guided wizard, visual canvas, actions, and configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Visual Workflow Subtabs */}
                    <Tabs value={visualWorkflowSubTab} onValueChange={setVisualWorkflowSubTab} className="w-full">
                      <TabsList level="child" className="grid w-full grid-cols-4">
                        <TabsTrigger 
                          level="child" 
                          value="wizard"
                          title="Guided setup wizard for your agent"
                        >
                          🧙‍♂️ Wizard
                        </TabsTrigger>
                        <TabsTrigger 
                          level="child" 
                          value="canvas"
                          title="Visual drag-and-drop workflow builder"
                        >
                          🎨 Canvas
                        </TabsTrigger>
                        <TabsTrigger 
                          level="child" 
                          value="actions"
                          title="Configure agent actions and tasks"
                        >
                          ⚡ Actions
                        </TabsTrigger>
                        <TabsTrigger 
                          level="child" 
                          value="configuration"
                          title="Agent settings and configuration"
                        >
                          ⚙️ Configuration
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="wizard" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🧙‍♂️ Setup Wizard
                              <Badge variant="secondary">Step 1 of 4</Badge>
                            </CardTitle>
                            <CardDescription>
                              Let us guide you through setting up your agent step-by-step
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4">
                              <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h4 className="font-medium">Agent Purpose</h4>
                                  <p className="text-sm text-muted-foreground">Define what your agent will do</p>
                                </div>
                                <Button size="sm" title="Configure agent purpose" onClick={() => setVisualWorkflowSubTab('configuration')}>Configure</Button>
                              </div>
                              <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h4 className="font-medium">Communication Style</h4>
                                  <p className="text-sm text-muted-foreground">Set the agent's personality and tone</p>
                                </div>
                                <Button size="sm" variant="outline" title="Set communication style" onClick={() => setVisualWorkflowSubTab('configuration')}>Set Style</Button>
                              </div>
                              <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h4 className="font-medium">Knowledge Sources</h4>
                                  <p className="text-sm text-muted-foreground">Add documents and data sources</p>
                                </div>
                                <Button size="sm" variant="outline" title="Add knowledge sources" onClick={() => setVisualWorkflowSubTab('actions')}>Add Sources</Button>
                              </div>
                            </div>
                            <Button className="w-full" title="Continue to canvas builder" onClick={() => setVisualWorkflowSubTab('canvas')}>
                              Continue to Canvas Builder
                            </Button>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="canvas" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🎨 Visual Workflow Canvas
                              <Badge variant="secondary">Drag & Drop</Badge>
                            </CardTitle>
                            <CardDescription>
                              Design your agent's conversation flow visually
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <EmbeddedWorkflowStudio />
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="actions" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              ⚡ Actions & Tasks
                              <Badge variant="secondary">Automated</Badge>
                            </CardTitle>
                            <CardDescription>
                              Define what your agent can do and automate
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <ActionsTab
                              sessionId={currentSessionId || ''}
                              actions={actions}
                              onActionsChange={setActions}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="configuration" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              ⚙️ Agent Configuration
                              <Badge variant="secondary">Settings</Badge>
                            </CardTitle>
                            <CardDescription>
                              Fine-tune your agent's behavior and settings
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4">
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Basic Settings</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Agent Name</span>
                                    <Button size="sm" variant="outline" title="Set agent name">Edit</Button>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Response Time</span>
                                    <Button size="sm" variant="outline" title="Configure response timing">Configure</Button>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Language Settings</span>
                                    <Button size="sm" variant="outline" title="Set language preferences">Set Language</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="models-templates" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Models & Templates
                    </CardTitle>
                    <CardDescription>AI models and workflow templates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ModelManagementDashboard />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions-tasks" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Actions & Tasks
                    </CardTitle>
                    <CardDescription>Define automated actions and tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActionsTab
                      sessionId={currentSessionId || ''}
                      actions={actions}
                      onActionsChange={setActions}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connectors-api" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Connectors & APIs
                    </CardTitle>
                    <CardDescription>External system integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <EnhancedConnectorSystem 
                      agentId={currentSessionId || ''}
                      actions={actions.map(action => ({
                        id: action.id,
                        name: action.name,
                        type: action.type,
                        category: action.category,
                        description: action.description
                      }))}
                      onAssignmentsChange={() => {}}
                    />
                    <AgenticAPIEcosystem />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system-config" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      System Configuration
                    </CardTitle>
                    <CardDescription>Core system settings and parameters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">System configuration settings</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="treatment-centers" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Treatment Centers
                    </CardTitle>
                    <CardDescription>Healthcare facility configurations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Treatment centers management</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="flow-testing" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="w-5 h-5" />
                      Flow Testing
                    </CardTitle>
                    <CardDescription>Test your workflow in real-time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AgentTestingInterface />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voice-config" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Voice Configuration
                    </CardTitle>
                    <CardDescription>Voice and speech settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChannelAndVoiceSetup />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="live-agent-transfer" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Live Agent Transfer
                    </CardTitle>
                    <CardDescription>Human handoff configurations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Live agent transfer settings</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="channel-matrix" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid className="w-5 h-5" />
                      Enhanced Channel Matrix
                    </CardTitle>
                    <CardDescription>Multi-channel deployment matrix</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AgentChannelAssignmentMatrix />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deployment-ready" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Deployment Ready
                    </CardTitle>
                    <CardDescription>Pre-deployment validation and checks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EnhancedDeploymentReadyView />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deployment-flow" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Deployment Flow
                    </CardTitle>
                    <CardDescription>Complete deployment pipeline</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <DeploymentManagementInterface />
                    <ActiveDeploymentsView />
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          {/* Manual Mode Tab Contents */}
          {selectedMode === 'manual' && (
            <>
              <TabsContent value="agent-config" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Agent Configuration
                    </CardTitle>
                    <CardDescription>Basic agent settings and behavior</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Agent configuration forms</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="models-templates" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Models & Templates
                    </CardTitle>
                    <CardDescription>AI models and configuration templates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Models and templates configuration</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions-tasks" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Actions & Tasks
                    </CardTitle>
                    <CardDescription>Define automated actions and task workflows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Actions and task workflows</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connectors-api" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Connectors & APIs
                    </CardTitle>
                    <CardDescription>External system integrations and APIs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">System integrations and APIs</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="knowledge-base" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Knowledge Base
                    </CardTitle>
                    <CardDescription>Upload documents and data sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <KnowledgeBaseManager
                      agentId={currentSessionId || ''}
                      actions={actions.map(action => ({
                        id: action.id,
                        name: action.name,
                        type: action.type,
                        category: action.category,
                        description: action.description
                      }))}
                      onKnowledgeSourcesChange={() => {}}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system-config" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      System Configuration
                    </CardTitle>
                    <CardDescription>Advanced system settings and parameters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Advanced system configuration</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="treatment-centers" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Treatment Centers
                    </CardTitle>
                    <CardDescription>Healthcare facility management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Healthcare facility management</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voice-config" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Voice Configuration
                    </CardTitle>
                    <CardDescription>Voice channels and speech settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Voice channels and speech settings</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="live-agent-transfer" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Live Agent Transfer
                    </CardTitle>
                    <CardDescription>Human agent handoff settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Live agent handoff configuration</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="channel-matrix" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid className="w-5 h-5" />
                      Enhanced Channel Matrix
                    </CardTitle>
                    <CardDescription>Multi-channel deployment configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Grid className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Multi-channel deployment setup</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deployment-ready" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Deployment Ready
                    </CardTitle>
                    <CardDescription>Deployment readiness validation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Pre-deployment validation checks</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deployment-flow" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Deployment Flow
                    </CardTitle>
                    <CardDescription>End-to-end deployment process</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Complete deployment process</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
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