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
  Building2,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
import { EnhancedAgentCanvas } from '@/components/agentic/EnhancedAgentCanvas';
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
  const [visualWorkflowSubTab, setVisualWorkflowSubTab] = useState('use-case');

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
      setVisualWorkflowSubTab('use-case');
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
                      <TabsList level="child" className="grid w-full grid-cols-5">
                        <TabsTrigger 
                          level="child" 
                          value="use-case"
                          title="Select your agent's use case"
                        >
                          🎯 Use Case
                        </TabsTrigger>
                        <TabsTrigger 
                          level="child" 
                          value="journey"
                          title="Define journey stages"
                        >
                          🗺️ Journey
                        </TabsTrigger>
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
                          title="Visual canvas with palette, logo & templates"
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
                      </TabsList>

                      <TabsContent value="use-case" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🎯 Select Use Case
                              <Badge variant="secondary">Step 1 of 5</Badge>
                            </CardTitle>
                            <CardDescription>
                              Choose what type of agent you want to build
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setVisualWorkflowSubTab('journey')}>
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="text-lg font-medium">🏥 Healthcare Assistant</div>
                                    <p className="text-sm text-muted-foreground">Patient support, provider onboarding, care management</p>
                                    <Button size="sm" className="w-full">Select This Use Case</Button>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setVisualWorkflowSubTab('journey')}>
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="text-lg font-medium">💼 Business Operations</div>
                                    <p className="text-sm text-muted-foreground">Workflow automation, data processing, reporting</p>
                                    <Button size="sm" className="w-full">Select This Use Case</Button>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setVisualWorkflowSubTab('journey')}>
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="text-lg font-medium">🎓 Education & Training</div>
                                    <p className="text-sm text-muted-foreground">Learning paths, skill assessment, progress tracking</p>
                                    <Button size="sm" className="w-full">Select This Use Case</Button>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setVisualWorkflowSubTab('journey')}>
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="text-lg font-medium">🔧 Custom Solution</div>
                                    <p className="text-sm text-muted-foreground">Build from scratch with custom requirements</p>
                                    <Button size="sm" className="w-full">Select This Use Case</Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="journey" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🗺️ Journey Stages
                              <Badge variant="secondary">Step 2 of 5</Badge>
                            </CardTitle>
                            <CardDescription>
                              Define the stages your agent will guide users through
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                                  <div>
                                    <div className="font-medium">Initial Assessment</div>
                                    <div className="text-sm text-muted-foreground">Gather user requirements and context</div>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">Edit</Button>
                              </div>
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">2</div>
                                  <div>
                                    <div className="font-medium">Solution Design</div>
                                    <div className="text-sm text-muted-foreground">Create personalized action plan</div>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">Edit</Button>
                              </div>
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">3</div>
                                  <div>
                                    <div className="font-medium">Implementation</div>
                                    <div className="text-sm text-muted-foreground">Execute the solution step by step</div>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">Edit</Button>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                Add Stage
                              </Button>
                              <Button className="flex-1" onClick={() => setVisualWorkflowSubTab('wizard')}>
                                Continue to Wizard Setup
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="wizard" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🧙‍♂️ Setup Wizard
                              <Badge variant="secondary">Step 3 of 5</Badge>
                            </CardTitle>
                            <CardDescription>
                              Configure your agent's core settings and behavior
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4">
                              <Card>
                                <CardContent className="p-4">
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="agent-name">Agent Name</Label>
                                      <Input id="agent-name" placeholder="Enter your agent's name" />
                                    </div>
                                    <div>
                                      <Label htmlFor="agent-purpose">Agent Purpose</Label>
                                      <Textarea id="agent-purpose" placeholder="Describe what your agent will do..." rows={3} />
                                    </div>
                                    <div>
                                      <Label htmlFor="communication-style">Communication Style</Label>
                                      <select className="w-full p-2 border rounded-md">
                                        <option value="">Select communication style</option>
                                        <option value="professional">Professional & Formal</option>
                                        <option value="friendly">Friendly & Conversational</option>
                                        <option value="supportive">Supportive & Empathetic</option>
                                        <option value="concise">Direct & Concise</option>
                                      </select>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            <Button className="w-full" onClick={() => setVisualWorkflowSubTab('canvas')}>
                              Continue to Visual Canvas
                            </Button>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="canvas" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🎨 Visual Canvas & Branding
                              <Badge variant="secondary">Step 4 of 5</Badge>
                            </CardTitle>
                            <CardDescription>
                              Customize your agent's visual appearance with color palette, logo, and templates
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <EnhancedAgentCanvas 
                              initialName=""
                              initialTagline=""
                              initialPrimaryColor="#3b82f6"
                              initialSecondaryColor="#8b5cf6"
                              initialAccentColor="#06b6d4"
                              onNameChange={(name) => console.log('Name changed:', name)}
                              onTaglineChange={(tagline) => console.log('Tagline changed:', tagline)}
                              onPrimaryColorChange={(color) => console.log('Primary color changed:', color)}
                              onSecondaryColorChange={(color) => console.log('Secondary color changed:', color)}
                              onAccentColorChange={(color) => console.log('Accent color changed:', color)}
                              onLogoChange={(file, url) => console.log('Logo changed:', file, url)}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="actions" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              ⚡ Actions & Tasks
                              <Badge variant="secondary">Step 5 of 5</Badge>
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
                            <div className="pt-4 border-t">
                              <Button className="w-full" size="lg">
                                🚀 Deploy Your Agent
                              </Button>
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