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
import { UseCaseSelector } from '@/components/agentic/UseCaseSelector';
import { JourneyEditor } from '@/components/agentic/JourneyEditor';
import { StreamlinedAgentWizard } from '@/components/agentic/StreamlinedAgentWizard';
import { ReactFlowWrapper as CustomerJourneyBuilder } from '@/components/workflow-builder/ReactFlowWrapper';
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
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showPromptAssistant, setShowPromptAssistant] = useState(false);
  const [agentBuilderTab, setAgentBuilderTab] = useState('canvas-designer');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
  const [visualWorkflowSubTab, setVisualWorkflowSubTab] = useState('use-case');
  const [selectedUseCase, setSelectedUseCase] = useState('');
  const [journeyStages, setJourneyStages] = useState<any[]>([]);
  const [wizardData, setWizardData] = useState<any>({});

  const { userRoles, user } = useMasterAuth();
  const queryClient = useQueryClient();
  const { userSessions, isLoading: sessionsLoading, setCurrentSessionId, currentSessionId, currentSession, actions, setActions } = useAgentBuilder();

  // Role-based access control
  const isSuperAdmin = userRoles.includes('superAdmin');
  const isOnboardingTeam = userRoles.includes('onboardingTeam');
  const isAdmin = userRoles.includes('admin');

  // Initialize questionnaire first for new users
  useEffect(() => {
    try {
      const completed = localStorage.getItem('agentBuilder_questionnaireCompleted') === 'true';
      setHasCompletedQuestionnaire(completed);
      
      // Show questionnaire first for new users, then mode selector
      if (!completed && (userSessions?.length ?? 0) === 0) {
        setShowQuestionnaire(true);
        setShowModeSelector(false);
      } else {
        setShowQuestionnaire(false);
        setShowModeSelector(true);
      }
    } catch (e) {
      console.warn('Questionnaire init failed:', e);
      setShowModeSelector(true);
    }
  }, [userSessions]);

  // Auto-open Canvas after wizard completion or when receiving a global open event
  useEffect(() => {
    const openCanvas = (cfg?: any) => {
      setSelectedMode('visual' as any);
      setShowModeSelector(false);
      setAgentBuilderTab(cfg?.tab || 'canvas-designer');
      setVisualWorkflowSubTab(cfg?.subTab || 'canvas');
      toast.success('Continuing on Canvas');
    };
    
    const handleWizardComplete = (e: any) => {
      const { sessionId, switchTab, wizardData } = e.detail || {};
      console.log('🎉 Wizard completed, switching to:', switchTab, { sessionId, wizardData });
      
      if (sessionId) {
        setCurrentSessionId(sessionId);
      }
      
      if (switchTab) {
        setSelectedMode('visual' as any);
        setShowModeSelector(false);
        setAgentBuilderTab(switchTab);
        toast.success('Wizard completed! Now configure your models and templates.');
      } else {
        openCanvas(e.detail);
      }
    };
    
    try {
      const stored = localStorage.getItem('agentBuilder_next');
      if (stored) {
        const cfg = JSON.parse(stored);
        localStorage.removeItem('agentBuilder_next');
        openCanvas(cfg);
      }
    } catch {}
    
    const canvasHandler = (e: any) => openCanvas(e?.detail);
    window.addEventListener('agentBuilder:openCanvas', canvasHandler as any);
    window.addEventListener('agentBuilder:completeWizard', handleWizardComplete as any);
    
    return () => {
      window.removeEventListener('agentBuilder:openCanvas', canvasHandler as any);
      window.removeEventListener('agentBuilder:completeWizard', handleWizardComplete as any);
    };
  }, [setCurrentSessionId]);

  // Handle questionnaire completion - proceed to mode selection
  const handleQuestionnaireComplete = (data: any) => {
    console.log('Questionnaire completed:', data);
    setHasCompletedQuestionnaire(true);
    setShowQuestionnaire(false);
    setShowModeSelector(true);
    
    try { 
      localStorage.setItem('agentBuilder_questionnaireCompleted', 'true'); 
    } catch {}
    
    toast.success('Great! Now choose your building approach.');
  };

  // Handle mode selection - proceed to use case selection
  const handleModeSelect = (mode: AgentMode) => {
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

  // Handle use case selection - proceed to journey stages
  const handleUseCaseSelect = (useCase: string) => {
    setSelectedUseCase(useCase);
    setVisualWorkflowSubTab('journey');
    toast.success('Use case selected! Now define your journey stages.');
  };

  // Handle journey completion - proceed to wizard
  const handleJourneyComplete = (stages: any[]) => {
    setJourneyStages(stages);
    setVisualWorkflowSubTab('wizard');
    toast.success('Journey stages defined! Complete your agent setup.');
  };

  // Handle wizard completion - proceed to canvas
  const handleWizardComplete = (data: any) => {
    setWizardData(data);
    setVisualWorkflowSubTab('canvas');
    toast.success('Setup complete! Customize your agent\'s appearance.');
  };

  // Back navigation handlers
  const handleBackToQuestionnaire = () => {
    setShowModeSelector(false);
    setShowQuestionnaire(true);
  };

  const handleBackToModeSelector = () => {
    setShowModeSelector(true);
    setSelectedMode(null);
    setShowPromptAssistant(false);
  };

  const handleBackToUseCase = () => {
    setVisualWorkflowSubTab('use-case');
    setSelectedUseCase('');
  };

  const handleBackToJourney = () => {
    setVisualWorkflowSubTab('journey');
  };

  const handleBackToWizard = () => {
    setVisualWorkflowSubTab('wizard');
  };

  const handlePromptGenerate = (prompt: string, generatedConfig: any) => {
    console.log('Generated config:', generatedConfig);
    
    if (selectedMode === 'visual') {
      // Apply visual configuration - store generated nodes, keep flow at beginning (Use Case)
      console.log('Applying visual workflow:', generatedConfig);
      
      // Store the generated workflow data
      setWizardData(prev => ({
        ...prev,
        generatedWorkflow: generatedConfig,
        prompt: prompt
      }));
      
      // Stay aligned with guided flow order
      setAgentBuilderTab('canvas-designer');
      setVisualWorkflowSubTab('use-case');
      
      toast.success('Workflow generated! Start with Use Case → Journey → Wizard → Canvas.');
    } else {
      // Apply manual configuration
      console.log('Applying manual config:', generatedConfig);
      
      // Store the generated config
      setWizardData(prev => ({
        ...prev,
        generatedConfig: generatedConfig,
        prompt: prompt
      }));
      
      toast.success('Configuration generated! Review the settings.');
    }
    
    setShowPromptAssistant(false);
  };

  // Show questionnaire if needed
  if (showQuestionnaire) {
    return (
      <AppLayout>
        <div className="p-6">
          <IntelligentQuestionnaire 
            onComplete={handleQuestionnaireComplete} 
          />
        </div>
      </AppLayout>
    );
  }

  // Show mode selector if no mode selected or user wants to change mode
  if (showModeSelector || !selectedMode) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Choose Your Building Approach</h1>
              <p className="text-muted-foreground">Select how you'd like to build your agent</p>
            </div>
            <div className="flex items-center gap-2">
              {!hasCompletedQuestionnaire ? (
                <Button variant="secondary" onClick={() => setShowQuestionnaire(true)}>
                  Start Guided Questionnaire
                </Button>
              ) : (
                <Button variant="outline" onClick={handleBackToQuestionnaire}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Questionnaire  
                </Button>
              )}
              <Button variant="outline" onClick={() => handleModeSelect('visual' as any)} title="Skip straight to Visual Workflow">
                Quick Start (Visual)
              </Button>
            </div>
          </div>
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
        {/* Header with navigation and mode info */}
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
                      </TabsList>

                      <TabsContent value="use-case" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🎯 Select Use Case
                              <Badge variant="secondary">Step 1 of 4</Badge>
                            </CardTitle>
                            <CardDescription>
                              Choose what type of agent you want to build or describe your specific needs
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <UseCaseSelector
                              selectedUseCase={selectedUseCase}
                              onUseCaseChange={handleUseCaseSelect}
                              selectedCategories={[]}
                              selectedTopics={[]}
                            />
                            <div className="flex gap-2 pt-4">
                              <Button variant="outline" onClick={handleBackToModeSelector}>
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Mode Selection
                              </Button>
                              <Button 
                                className="flex-1" 
                                disabled={!selectedUseCase}
                                onClick={() => handleUseCaseSelect(selectedUseCase)}
                              >
                                Continue to Journey Stages
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="journey" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🗺️ Journey Stages
                              <Badge variant="secondary">Step 2 of 4</Badge>
                            </CardTitle>
                            <CardDescription>
                              Define the stages your agent will guide users through. Add, edit, or get AI suggestions for optimal user journeys.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <JourneyEditor 
                              templateId={currentSession?.template_id || undefined}
                              sessionId={currentSessionId}
                              useCase={selectedUseCase}
                              onApplied={handleJourneyComplete}
                            />
                            <div className="flex gap-2 pt-4">
                              <Button variant="outline" onClick={handleBackToUseCase}>
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Use Case
                              </Button>
                              <Button className="flex-1" onClick={() => handleJourneyComplete(journeyStages)}>
                                Continue to Setup Wizard
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="wizard" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🧙‍♂️ Agent Creation Wizard
                              <Badge variant="secondary">Step 3 of 4</Badge>
                            </CardTitle>
                            <CardDescription>
                              Complete your agent setup with categories, business units, topics, and single/multi-agent configurations
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <StreamlinedAgentWizard />
                            <div className="flex gap-2 pt-4">
                              <Button variant="outline" onClick={handleBackToJourney}>
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Journey
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="canvas" level="child" className="mt-6">
                        <Card className="border-dashed">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🎨 Visual Canvas & Branding
                              <Badge variant="secondary">Step 4 of 4</Badge>
                            </CardTitle>
                            <CardDescription>
                              Customize your agent's visual appearance with color palette, logo upload, templates, and preview functionality
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {/* Show Visual Workflow if generated */}
                            {wizardData.generatedWorkflow && (
                              <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold">AI Generated Workflow</h3>
                                  <Badge variant="secondary">From: "{wizardData.prompt || 'AI Assistant'}"</Badge>
                                </div>
                                <div className="h-96 border rounded-lg bg-muted/10 overflow-hidden">
                                  <CustomerJourneyBuilder 
                                    initialWorkflow={wizardData.generatedWorkflow}
                                    onSave={(workflow) => {
                                      setWizardData(prev => ({...prev, savedWorkflow: workflow}));
                                      toast.success('Visual workflow saved!');
                                    }}
                                    onGenerateAgent={(workflow) => {
                                      console.log('Generate agent from workflow:', workflow);
                                      toast.success('Agent configuration generated from workflow!');
                                    }}
                                  />
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                  <p className="text-sm text-blue-700">
                                    <strong>✨ AI Generated:</strong> This visual workflow was created from your prompt. 
                                    You can modify nodes, connections, and settings using the visual editor above.
                                  </p>
                                </div>
                              </div>
                            )}

                            <EnhancedAgentCanvas 
                              initialName={wizardData.name || ""}
                              initialTagline={wizardData.tagline || ""}
                              initialPrimaryColor="#3b82f6"
                              initialSecondaryColor="#8b5cf6"
                              initialAccentColor="#06b6d4"
                              onNameChange={(name) => setWizardData(prev => ({...prev, name}))}
                              onTaglineChange={(tagline) => setWizardData(prev => ({...prev, tagline}))}
                              onPrimaryColorChange={(color) => setWizardData(prev => ({...prev, primaryColor: color}))}
                              onSecondaryColorChange={(color) => setWizardData(prev => ({...prev, secondaryColor: color}))}
                              onAccentColorChange={(color) => setWizardData(prev => ({...prev, accentColor: color}))}
                              onLogoChange={(file, url) => setWizardData(prev => ({...prev, logoFile: file, logoUrl: url}))}
                            />
                            <div className="flex gap-2 pt-6 border-t mt-6">
                              <Button variant="outline" onClick={handleBackToWizard}>
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Wizard
                              </Button>
                              <Button 
                                className="flex-1" 
                                size="lg"
                                onClick={() => setAgentBuilderTab('models-templates')}
                              >
                                🤖 Complete Setup & Configure Models
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
                      AI Models & Templates
                    </CardTitle>
                    <CardDescription>
                      Configure AI models, select templates, and define actions & tasks for your agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ModelManagementDashboard />
                    
                    {/* Actions & Tasks Section - Integrated after model selection */}
                    <div className="mt-8 pt-6 border-t">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Actions & Tasks Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                          Define what your agent can do and automate based on the selected model and templates.
                        </p>
                      </div>
                      <ActionsTab
                        sessionId={currentSessionId || ''}
                        actions={actions}
                        onActionsChange={setActions}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="agent-config" level="parent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Agent Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure basic agent settings, behavior, and core parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-4">Basic Agent Settings</h4>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="agent-name">Agent Name</Label>
                            <Input id="agent-name" placeholder="Enter your agent's name" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="agent-description">Description</Label>
                            <Textarea id="agent-description" placeholder="Describe what your agent does..." rows={3} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="response-time">Response Time (seconds)</Label>
                            <Input id="response-time" type="number" placeholder="5" />
                          </div>
                        </div>
                      </div>
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
                    <div className="space-y-6">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-4">Basic Agent Settings</h4>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="manual-agent-name">Agent Name</Label>
                            <Input id="manual-agent-name" placeholder="Enter your agent's name" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="manual-agent-description">Description</Label>
                            <Textarea id="manual-agent-description" placeholder="Describe what your agent does..." rows={3} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="manual-response-time">Response Time (seconds)</Label>
                            <Input id="manual-response-time" type="number" placeholder="5" />
                          </div>
                        </div>
                      </div>
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
                    <ModelManagementDashboard 
                      selectedTemplate={currentSession ? {
                        id: currentSession.template_id,
                        name: currentSession.name,
                        description: currentSession.description,
                        template_type: currentSession.template_type,
                        journey_stages: []
                      } : undefined}
                      templateId={currentSession?.template_id}
                    />
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
                    <ActionsTab
                      sessionId={currentSessionId || ''}
                      actions={actions}
                      onActionsChange={setActions}
                    />
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