import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SessionControls, SessionList } from '@/components/agentic/SessionControls';
import { AgentIntegrationStatus } from '@/components/agentic/AgentIntegrationStatus';

// Import all existing components to preserve functionality
import { EnhancedAgentCanvas } from '@/components/agentic/EnhancedAgentCanvas';
import { AgentActionsManager } from '@/components/agentic/AgentActionsManager';
import { SystemConnectors } from '@/components/agentic/SystemConnectors';
import { EnhancedConnectorSystem } from '@/components/agentic/enhanced-connector/EnhancedConnectorSystem';
import { ConnectorAssignmentManager } from '@/components/agentic/ConnectorAssignmentManager';
import { KnowledgeBaseManager } from '@/components/agentic/KnowledgeBaseManager';
import { RAGComplianceWorkflow } from '@/components/rag/RAGComplianceWorkflow';
import { AgentChannelAssignmentMatrix } from '@/components/agent-deployment/AgentChannelAssignmentMatrix';
import { PreDeploymentReview } from '@/components/agent-deployment/PreDeploymentReview';
import { CategoryMapping } from '@/components/agentic/CategoryMapping';
import { UseCaseSelector } from '@/components/agentic/UseCaseSelector';
import { ConsolidatedActionsTab } from '@/components/agentic/tabs/ConsolidatedActionsTab';
import LSBindingPanel, { type LSBinding } from '@/components/label-studio/LSBindingPanel';
import { useLabelStudio } from '@/hooks/useLabelStudio';
import { Switch } from '@/components/ui/switch';

// Import existing hooks to preserve functionality
import { useAgentSession } from '@/hooks/useAgentSession';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { AgentSession } from '@/types/agent-session';
import { AgentAction } from '@/components/agentic/AgentActionsManager';

// Import icons
import { 
  Bot, Settings, Palette, Zap, Database, Brain, Rocket, 
  Plus, CheckCircle, Clock, AlertTriangle, User, FileText,
  Target, Plug, BookOpen, Play, Pause, Save
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorManager } from '@/utils/error/ErrorManager';
// Removed useAgentAutoSave import as it doesn't exist

// Step configuration with progress tracking
interface BuilderStep {
  id: AgentSession['current_step'];
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted: (session: AgentSession | null) => boolean;
  isRequired: boolean;
}

const BUILDER_STEPS: BuilderStep[] = [
  {
    id: 'basic_info',
    title: 'Agent Creation',
    description: 'Define basic agent information and purpose',
    icon: Bot,
    isCompleted: (session) => !!(session?.basic_info?.name && session?.basic_info?.purpose),
    isRequired: true
  },
  {
    id: 'canvas',
    title: 'Canvas',
    description: 'Configure visual identity and branding',
    icon: Palette,
    isCompleted: (session) => !!(session?.canvas && Object.keys(session.canvas).length > 0),
    isRequired: false
  },
  {
    id: 'actions',
    title: 'Actions',
    description: 'Configure agent actions and workflows',
    icon: Zap,
    isCompleted: (session) => !!(session?.actions && Object.keys(session.actions).length > 0),
    isRequired: true
  },
  {
    id: 'connectors',
    title: 'Connectors',
    description: 'Set up external system integrations',
    icon: Plug,
    isCompleted: (session) => !!(session?.connectors && Object.keys(session.connectors).length > 0),
    isRequired: true
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    description: 'Configure knowledge bases and sources',
    icon: Brain,
    isCompleted: (session) => !!(session?.knowledge && Object.keys(session.knowledge).length > 0),
    isRequired: true
  },
  {
    id: 'rag',
    title: 'RAG',
    description: 'Set up retrieval augmented generation',
    icon: Database,
    isCompleted: (session) => !!(session?.rag && Object.keys(session.rag).length > 0),
    isRequired: true
  },
  {
    id: 'deploy',
    title: 'Deployment',
    description: 'Deploy your agent to channels and go live',
    icon: Rocket,
    isCompleted: (session) => session?.status === 'deployed',
    isRequired: true
  }
];

interface UnifiedAgentBuilderProps {
  step?: AgentSession['current_step'];
}

export const UnifiedAgentBuilder: React.FC<UnifiedAgentBuilderProps> = ({ step }) => {
  console.log('🚀 UnifiedAgentBuilder rendering with step:', step);
  
  // Always call hooks in the same order - CRITICAL for React hook rules
  const { user } = useMasterAuth();
  
  // STABLE state initialization - these must always be declared in the same order
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<AgentSession['current_step']>(step || 'basic_info');
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [isClient, setIsClient] = useState(false);
  // Label Studio integration state (scoped to Unified Builder)
  const [useLabelStudioEnabled, setUseLabelStudioEnabled] = useState(false);
  const [lsBinding, setLsBinding] = useState<LSBinding | undefined>({ appliesTo: { prompts: true, visual: false, templates: false } });
  const { listProjectTasks, loading: lsLoading } = useLabelStudio();
  
  // STABLE sessionId for hook consistency
  const stableSessionId = currentSessionId || '';
  console.log('🔍 Using stable sessionId:', stableSessionId);
  
  // Client-side initialization effect
  useEffect(() => {
    try {
      setIsClient(true);
      
      // Initialize from localStorage only on client side
      const savedSessionId = localStorage.getItem('unifiedBuilder_currentSessionId');
      const savedStep = localStorage.getItem('unifiedBuilder_currentStep') as AgentSession['current_step'];
      
      if (savedSessionId) {
        setCurrentSessionId(savedSessionId);
      }
      
      if (savedStep && !step) {
        setCurrentStep(savedStep);
      } else if (step) {
        console.log('🎯 Setting currentStep from prop:', step);
        setCurrentStep(step);
      }
    } catch (error) {
      errorManager.reportError(error as Error, {
        component: 'UnifiedAgentBuilder',
        severity: 'medium',
        additionalContext: { step, action: 'localStorage_initialization' }
      });
    }
  }, [step]);
  
  // Always call hook with consistent parameters (fix for React error #185)
  const {
    currentSession,
    userSessions,
    createSession,
    updateSession,
    autoSave,
    deleteSession,
    deployAgent,
    isLoading,
  } = useAgentSession(stableSessionId || undefined);

  // Session management functions
  const handleCreateNewSession = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create an agent session.",
        variant: "destructive"
      });
      return;
    }

    createSession.mutate({
      name: `New Agent ${Date.now()}`,
      description: 'AI Agent created with Unified Builder',
      basic_info: {
        name: `New Agent ${Date.now()}`,
        description: 'AI Agent created with Unified Builder',
      }
    }, {
      onSuccess: (session) => {
        setCurrentSessionId(session.id);
        setCurrentStep('basic_info');
        setShowNewSessionDialog(false);
      },
      onError: (error) => {
        console.error('Failed to create session:', error);
        toast({
          title: "Error",
          description: "Failed to create agent session. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  // Auto-create session when step is provided but no session exists
  useEffect(() => {
    if (step && !currentSessionId && !isLoading && user) {
      handleCreateNewSession();
    }
  }, [step, currentSessionId, isLoading, user]);

  // Persist current session ID to localStorage
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('unifiedBuilder_currentSessionId', currentSessionId);
    } else {
      localStorage.removeItem('unifiedBuilder_currentSessionId');
    }
  }, [currentSessionId]);

  // Persist current step to localStorage
  useEffect(() => {
    if (currentStep) {
      localStorage.setItem('unifiedBuilder_currentStep', currentStep);
    }
  }, [currentStep]);

  // Calculate overall progress
  const calculateProgress = () => {
    if (!currentSession) return 0;
    const completedSteps = BUILDER_STEPS.filter(step => step.isCompleted(currentSession)).length;
    return Math.round((completedSteps / BUILDER_STEPS.length) * 100);
  };

  // Update current step when step prop changes
  useEffect(() => {
    if (step && step !== currentStep) {
      console.log('🔄 Step prop changed, updating currentStep from', currentStep, 'to', step);
      setCurrentStep(step);
    }
  }, [step, currentStep]);

  // Preserve current step and session on navigation/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSessionId && currentStep) {
        localStorage.setItem('unifiedBuilder_preserveState', JSON.stringify({
          sessionId: currentSessionId,
          step: currentStep,
          timestamp: Date.now()
        }));
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from cache, restore state
        const preserved = localStorage.getItem('unifiedBuilder_preserveState');
        if (preserved) {
          try {
            const { sessionId, step } = JSON.parse(preserved);
            setCurrentSessionId(sessionId);
            setCurrentStep(step);
            console.log('🔄 Restored state from cache:', { sessionId, step });
          } catch (error) {
            console.error('Failed to restore preserved state:', error);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [currentSessionId, currentStep]);

  // Auto-save is handled through the updateSession mutation
  // Manual save is triggered through the SessionControls component

  // Persist session and step state on navigation
  useEffect(() => {
    if (currentSession && currentSessionId) {
      console.log('🔄 Updating session with current step:', currentStep);
      updateSession.mutate({
        sessionId: currentSessionId,
        updates: { current_step: currentStep }
      });
    }
  }, [currentStep]);

  // Session management functions
  const handleSelectSession = (session: AgentSession) => {
    setCurrentSessionId(session.id);
    setCurrentStep(session.current_step || 'basic_info');
    setShowSessionList(false);
  };

  const handleStepComplete = (stepId: string) => {
    const currentStepIndex = BUILDER_STEPS.findIndex(step => step.id === currentStep);
    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex < BUILDER_STEPS.length) {
      const nextStep = BUILDER_STEPS[nextStepIndex];
      setCurrentStep(nextStep.id);
      
      if (currentSessionId) {
        updateSession.mutate({
          sessionId: currentSessionId,
          updates: { current_step: nextStep.id }
        });
      }
    }
  };

  const handleDeployAgent = async () => {
    if (!currentSessionId || !currentSession) return;

    try {
      // Auto-assign knowledge bases if not already assigned
      const knowledgeAssignments = currentSession.knowledge?.knowledge_bases || [];
      const channelAssignments = currentSession.deployment?.config?.channels || [];
      
      // Auto-assign default knowledge base and channels
      const deploymentData = {
        ...currentSession,
        deployment: {
          ...currentSession.deployment,
          config: {
            auto_knowledge_assignment: knowledgeAssignments.length > 0 ? true : false,
            auto_channel_assignment: channelAssignments.length > 0 ? true : false,
            knowledge_bases: knowledgeAssignments,
            channels: channelAssignments.length > 0 ? channelAssignments : ['web_chat', 'api']
          },
          environment: 'production',
          scaling_config: {
            max_concurrent_sessions: 100,
            timeout_minutes: 30
          }
        },
        status: 'deployed' as const
      };

      console.log('🚀 Deploying agent with data:', deploymentData);

      await updateSession.mutateAsync({
        sessionId: currentSessionId,
        updates: deploymentData
      });

      deployAgent.mutate(currentSessionId, {
        onSuccess: () => {
          toast({
            title: "Deployment Successful",
            description: "Your agent has been deployed with auto-assigned knowledge bases and channels!",
          });
          
          // Don't reset session - keep user on deployment view
          setCurrentStep('deploy');
          
          console.log('✅ Agent deployed successfully');
        },
        onError: (error) => {
          console.error('❌ Deployment failed:', error);
          toast({
            title: "Deployment Failed",
            description: "Failed to deploy agent. Please try again.",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error('❌ Pre-deployment setup failed:', error);
      toast({
        title: "Deployment Failed",
        description: "Failed to prepare agent for deployment.",
        variant: "destructive"
      });
    }
  };

  // Step status indicators
  const getStepStatus = (step: BuilderStep) => {
    if (!currentSession) return 'pending';
    if (step.isCompleted(currentSession)) return 'completed';
    if (step.id === currentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (step: BuilderStep) => {
    const status = getStepStatus(step);
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'active') return <Clock className="h-4 w-4 text-blue-600" />;
    return <step.icon className="h-4 w-4 text-gray-400" />;
  };

  // Show loading state while session is being fetched
  if (currentSessionId && isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agent session...</p>
        </div>
      </div>
    );
  }

  // Show loading state when auto-creating session
  if (step && !currentSessionId && !isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Creating new agent session...</p>
        </div>
      </div>
    );
  }

  // If no session is active or session failed to load, show session management
  if (!currentSessionId || (!currentSession && !isLoading)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Agent Builder</h2>
            <p className="text-muted-foreground">Create and manage your intelligent agents with unified workflow</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateNewSession}>
              <Plus className="h-4 w-4 mr-2" />
              New Agent
            </Button>
            {userSessions && userSessions.length > 0 && (
              <Button variant="outline" onClick={() => setShowSessionList(true)}>
                <Bot className="h-4 w-4 mr-2" />
                Continue Session
              </Button>
            )}
          </div>
        </div>

        {/* Session List */}
        {(showSessionList || (userSessions && userSessions.length > 0)) && (
          <SessionList
            sessions={userSessions || []}
            onSelectSession={handleSelectSession}
            onDeleteSession={(sessionId) => {
              deleteSession.mutate(sessionId);
            }}
          />
        )}

        {/* Getting Started Card */}
        <Card>
          <CardHeader>
            <CardTitle>Unified Agent Builder</CardTitle>
            <CardDescription>
              Complete agent development workflow: Creation → Canvas → Actions → Connectors → Knowledge → Deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {BUILDER_STEPS.map((step) => (
                <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <step.icon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateNewSession} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Start Building Your Agent
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render specific step content when step prop is provided
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic_info':
        return renderBasicInfoStep();
      case 'canvas':
        return renderCanvasStep();
      case 'actions':
        return renderActionsStep();
      case 'connectors':
        return renderConnectorsStep();
      case 'knowledge':
        return renderKnowledgeStep();
      case 'rag':
        return renderRAGStep();
      case 'deploy':
        return renderDeployStep();
      default:
        return renderBasicInfoStep();
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Creation & Configuration
          </CardTitle>
          <CardDescription>
            Define your agent's core identity, purpose, and capabilities or start from a template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Creation</TabsTrigger>
              <TabsTrigger value="templates">From Template</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="mt-6">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Agent Name</label>
                      <input 
                        type="text"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        value={currentSession?.basic_info?.name || currentSession?.name || ''}
                        onChange={(e) => {
                          if (currentSessionId && currentSession) {
                            updateSession.mutate({
                              sessionId: currentSessionId,
                              updates: {
                                name: e.target.value,
                                basic_info: {
                                  ...currentSession.basic_info,
                                  name: e.target.value
                                }
                              }
                            });
                          }
                        }}
                        placeholder="Enter agent name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Purpose</label>
                      <input 
                        type="text"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        value={currentSession?.basic_info?.purpose || ''}
                        onChange={(e) => {
                          if (currentSessionId && currentSession) {
                            updateSession.mutate({
                              sessionId: currentSessionId,
                              updates: {
                                basic_info: {
                                  ...currentSession.basic_info,
                                  purpose: e.target.value
                                }
                              }
                            });
                          }
                        }}
                        placeholder="What is this agent's main purpose?"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Brand/Organization</label>
                      <input 
                        type="text"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        value={currentSession?.basic_info?.brand || ''}
                        onChange={(e) => {
                          if (currentSessionId && currentSession) {
                            updateSession.mutate({
                              sessionId: currentSessionId,
                              updates: {
                                basic_info: {
                                  ...currentSession.basic_info,
                                  brand: e.target.value
                                }
                              }
                            });
                          }
                        }}
                        placeholder="Your organization or brand name"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea 
                        className="w-full mt-1 px-3 py-2 border rounded-md h-24"
                        value={currentSession?.basic_info?.description || currentSession?.description || ''}
                        onChange={(e) => {
                          if (currentSessionId && currentSession) {
                            updateSession.mutate({
                              sessionId: currentSessionId,
                              updates: {
                                description: e.target.value,
                                basic_info: {
                                  ...currentSession.basic_info,
                                  description: e.target.value
                                }
                              }
                            });
                          }
                        }}
                        placeholder="Describe what this agent will do"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Use Case</label>
                      <UseCaseSelector
                        selectedUseCase={currentSession?.basic_info?.use_case || ''}
                        onUseCaseChange={(value) => {
                          if (currentSessionId) {
                            updateSession.mutate({
                              sessionId: currentSessionId,
                              updates: {
                                basic_info: {
                                  ...currentSession.basic_info,
                                  use_case: value
                                }
                              }
                            });
                          }
                        }}
                        selectedCategories={currentSession?.basic_info?.categories || []}
                        selectedTopics={currentSession?.basic_info?.topics || []}
                      />
                    </div>
                  </div>
                </div>

                {/* Categories, Business Units, and Topics Selection */}
                <CategoryMapping
                  selectedCategories={currentSession?.basic_info?.categories || []}
                  selectedBusinessUnits={currentSession?.basic_info?.business_units || []}
                  selectedTopics={currentSession?.basic_info?.topics || []}
                  onCategoriesChange={(categories) => {
                    if (currentSessionId) {
                      updateSession.mutate({
                        sessionId: currentSessionId,
                        updates: {
                          basic_info: {
                            ...currentSession.basic_info,
                            categories
                          }
                        }
                      });
                    }
                  }}
                  onBusinessUnitsChange={(business_units) => {
                    if (currentSessionId) {
                      updateSession.mutate({
                        sessionId: currentSessionId,
                        updates: {
                          basic_info: {
                            ...currentSession.basic_info,
                            business_units
                          }
                        }
                      });
                    }
                  }}
                  onTopicsChange={(topics) => {
                    if (currentSessionId) {
                      updateSession.mutate({
                        sessionId: currentSessionId,
                        updates: {
                          basic_info: {
                            ...currentSession.basic_info,
                            topics
                          }
                        }
                      });
                    }
                  }}
                />

                {/* Selected Items Summary */}
                {((currentSession?.basic_info?.categories?.length || 0) > 0 || 
                  (currentSession?.basic_info?.topics?.length || 0) > 0 || 
                  (currentSession?.basic_info?.business_units?.length || 0) > 0) && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Selected Options</h4>
                    <div className="space-y-2">
                      {(currentSession?.basic_info?.categories?.length || 0) > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Categories: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentSession?.basic_info?.categories?.map((category, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {(currentSession?.basic_info?.topics?.length || 0) > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Topics: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentSession?.basic_info?.topics?.map((topic, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {(currentSession?.basic_info?.business_units?.length || 0) > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Business Units: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentSession?.basic_info?.business_units?.map((unit, index) => (
                              <Badge key={index} variant="default" className="text-xs">
                                {unit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button variant="outline" onClick={() => setShowSessionList(true)}>
                    Back to Sessions
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      if (currentSessionId) {
                        updateSession.mutate({
                          sessionId: currentSessionId,
                          updates: { current_step: currentStep }
                        });
                      }
                    }}>
                      Save & Continue Later
                    </Button>
                    <Button onClick={() => handleStepComplete('basic_info')}>
                      Next: Canvas
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
              
              <TabsContent value="templates" className="mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Choose from pre-built agent templates to get started quickly
                  </p>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Agent templates will be integrated here</p>
                    <p className="text-sm">Pre-configured agents for different use cases</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  const renderCanvasStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Canvas & Branding Configuration
        </CardTitle>
        <CardDescription>
          Customize your agent's visual identity and white-label settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EnhancedAgentCanvas 
          initialName={currentSession?.canvas?.name || currentSession?.basic_info?.name || ''}
          initialTagline={currentSession?.canvas?.tagline || 'Your AI healthcare partner'}
          initialPrimaryColor={currentSession?.canvas?.primaryColor || '#3b82f6'}
          initialSecondaryColor={currentSession?.canvas?.secondaryColor || '#8b5cf6'} 
          initialAccentColor={currentSession?.canvas?.accentColor || '#06b6d4'}
          initialLogo={currentSession?.canvas?.logo || ''}
          onNameChange={(name) => {
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: {
                  canvas: {
                    ...currentSession?.canvas,
                    name: name
                  }
                }
              });
            }
          }}
          onTaglineChange={(tagline) => {
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: {
                  canvas: {
                    ...currentSession?.canvas,
                    tagline: tagline
                  }
                }
              });
            }
          }}
          onPrimaryColorChange={(color) => {
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: {
                  canvas: {
                    ...currentSession?.canvas,
                    primaryColor: color
                  }
                }
              });
            }
          }}
          onSecondaryColorChange={(color) => {
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: {
                  canvas: {
                    ...currentSession?.canvas,
                    secondaryColor: color
                  }
                }
              });
            }
          }}
          onAccentColorChange={(color) => {
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: {
                  canvas: {
                    ...currentSession?.canvas,
                    accentColor: color
                  }
                }
              });
            }
          }}
          onLogoChange={(file, url) => {
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: {
                  canvas: {
                    ...currentSession?.canvas,
                    logo: url,
                    logoFile: file?.name || null
                  }
                }
              });
            }
          }}
        />
        
        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setCurrentStep('basic_info')}>
            Previous: Basic Info
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              if (currentSessionId) {
                updateSession.mutate({
                  sessionId: currentSessionId,
                  updates: { current_step: currentStep }
                });
              }
            }}>
              Save & Continue Later
            </Button>
            <Button onClick={() => setCurrentStep('actions')}>
              Next: Actions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Apply Label Studio tasks as actions in the current session
  const applyLSForPrompts = async () => {
    if (!useLabelStudioEnabled || !lsBinding?.projectId || !lsBinding?.appliesTo?.prompts) return;
    try {
      const lsProjectId = lsBinding.projectId as number;
      const tasks: any[] = await listProjectTasks(lsProjectId, 1, 10);
      const newActions: AgentAction[] = (tasks || []).map((t) => {
        const data = t?.data || {};
        const baseName: string = (data.title || data.name || data.text || `Task ${t.id}`).toString();
        const trimmed = baseName.length > 40 ? baseName.slice(0, 40) + '…' : baseName;
        return {
          id: `ls-${t.id}`,
          name: trimmed,
          description: 'Imported from Label Studio task',
          category: 'analysis',
          type: 'on_demand',
          parameters: { lsTaskId: t.id, lsProjectId },
          isEnabled: true,
          priority: 'medium',
          tasks: []
        } as AgentAction;
      });
      const existingIds = new Set((actions || []).map(a => a.id));
      const merged = [...actions, ...newActions.filter(a => !existingIds.has(a.id))];
      setActions(merged);
      if (currentSessionId) {
        updateSession.mutate({
          sessionId: currentSessionId,
          updates: {
            actions: {
              assigned_actions: merged,
              custom_actions: [],
              configurations: {}
            }
          }
        });
      }
      toast({ title: 'Prompts seeded', description: `Added ${merged.length - actions.length} actions from Label Studio` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Seeding failed', description: 'Could not import tasks from Label Studio', variant: 'destructive' });
    }
  };

  const renderActionsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Actions Configuration
        </CardTitle>
        <CardDescription>
          Configure agent actions, workflows, and task management
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Enhanced Label Studio Integration */}
        <div className="mb-6 space-y-4 border rounded-lg p-4 bg-muted/30 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enhanced Label Studio Integration</p>
              <p className="text-xs text-muted-foreground">Advanced Label Studio features with real-time sync and annotation workflows</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={useLabelStudioEnabled} onCheckedChange={setUseLabelStudioEnabled} />
              <span className="text-sm">{useLabelStudioEnabled ? 'Enhanced Mode' : 'Basic Mode'}</span>
            </div>
          </div>
          {useLabelStudioEnabled && (
            <>
              <LSBindingPanel value={lsBinding} onBind={setLsBinding} />
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {lsBinding?.projectId ? `Connected to Project ${lsBinding.projectId}` : 'No project selected'}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={applyLSForPrompts} disabled={!lsBinding?.projectId || lsLoading}>
                    {lsLoading ? 'Applying…' : 'Quick Seed'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      // Could open enhanced panel or redirect to advanced features
                      window.open(`#/agents/label-studio/${lsBinding?.projectId}`, '_blank');
                    }}
                    disabled={!lsBinding?.projectId}
                  >
                    Advanced Panel
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        <AgentActionsManager
          agentId={currentSessionId || ''}
          onActionsChange={(newActions) => {
            setActions(newActions);
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: {
                  actions: {
                    assigned_actions: newActions,
                    custom_actions: [],
                    configurations: {}
                  }
                }
              });
            }
          }}
          agentType={currentSession?.basic_info?.agent_type || 'single'}
          agentPurpose={currentSession?.basic_info?.purpose || ''}
        />
        
        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setCurrentStep('canvas')}>
            Previous: Canvas
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              if (currentSessionId) {
                updateSession.mutate({
                  sessionId: currentSessionId,
                  updates: { current_step: currentStep }
                });
              }
            }}>
              Save & Continue Later
            </Button>
            <Button onClick={() => setCurrentStep('connectors')}>
              Next: Connectors
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderConnectorsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5" />
          System Connectors & Integrations
        </CardTitle>
        <CardDescription>
          Connect to APIs, databases, and external services. Assign connectors to actions and tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SystemConnectors />
        
        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setCurrentStep('actions')}>
            Previous: Actions
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              if (currentSessionId) {
                updateSession.mutate({
                  sessionId: currentSessionId,
                  updates: { current_step: currentStep }
                });
              }
            }}>
              Save & Continue Later
            </Button>
            <Button onClick={() => setCurrentStep('knowledge')}>
              Next: Knowledge
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderKnowledgeStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Knowledge Base Management
        </CardTitle>
        <CardDescription>
          Configure knowledge sources, documents, and data for your agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <KnowledgeBaseManager 
          agentId={currentSessionId || ''}
          actions={actions}
          onKnowledgeSourcesChange={(knowledgeSources) => {
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: { 
                  knowledge: {
                    knowledge_bases: knowledgeSources,
                    documents: [],
                    urls: [],
                    auto_generated_content: []
                  }
                }
              });
            }
          }}
        />
        
        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setCurrentStep('connectors')}>
            Previous: Connectors
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              if (currentSessionId) {
                updateSession.mutate({
                  sessionId: currentSessionId,
                  updates: { current_step: currentStep }
                });
              }
            }}>
              Save & Continue Later
            </Button>
            <Button onClick={() => setCurrentStep('rag')}>
              Next: RAG
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderRAGStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          RAG Configuration
        </CardTitle>
        <CardDescription>
          Set up retrieval augmented generation and AI reasoning capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RAGComplianceWorkflow
          knowledgeBaseIds={[]}
          complianceEnabled={true}
          onComplianceChange={(enabled) => {
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: { 
                  rag: {
                    ...currentSession?.rag,
                    configurations: {
                      ...currentSession?.rag?.configurations,
                      compliance_enabled: enabled
                    }
                  }
                }
              });
            }
          }}
        />
        
        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t mt-6">
          <Button variant="outline" onClick={() => setCurrentStep('knowledge')}>
            Previous: Knowledge
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              if (currentSessionId) {
                updateSession.mutate({
                  sessionId: currentSessionId,
                  updates: { current_step: currentStep }
                });
              }
            }}>
              Save & Continue Later
            </Button>
            <Button onClick={() => setCurrentStep('deploy')}>
              Next: Deploy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDeployStep = () => (
    <div className="space-y-6">
      {/* Pre-deployment Comprehensive Review */}
      <PreDeploymentReview session={currentSession} />
      
      {/* Channel Assignment Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Channel Deployment
          </CardTitle>
          <CardDescription>
            Configure deployment to channels and environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentChannelAssignmentMatrix />
        </CardContent>
      </Card>
      
      {/* Final Deployment Actions */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Deploy Agent</CardTitle>
          <CardDescription>
            All configurations have been reviewed and validated. Ready for deployment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Deployment will create a production-ready agent with all configured features.
              </p>
            </div>
            <Button 
              onClick={handleDeployAgent}
              disabled={deployAgent.isPending || !BUILDER_STEPS.slice(0, -1).every(step => step.isCompleted(currentSession) || !step.isRequired)}
              className="gap-2"
              size="lg"
            >
              <Rocket className="h-4 w-4" />
              {deployAgent.isPending ? 'Deploying...' : 'Deploy Agent'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main unified builder interface
  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{currentSession.name}</h2>
          <p className="text-muted-foreground">{currentSession.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">Progress</p>
            <p className="text-xs text-muted-foreground">{calculateProgress()}% Complete</p>
          </div>
          <div className="w-24">
            <Progress value={calculateProgress()} />
          </div>
        </div>
      </div>

      {/* Session Controls */}
      <SessionControls
        session={currentSession}
        onSave={() => {
          if (currentSessionId && currentSession) {
            // Prepare comprehensive update data
            const updates: any = { 
              current_step: currentStep,
              updated_at: new Date().toISOString()
            };
            
            // Save current form data based on the current step
            if (currentStep === 'basic_info' && currentSession.basic_info) {
              updates.basic_info = currentSession.basic_info;
            } else if (currentStep === 'canvas' && currentSession.canvas) {
              updates.canvas = currentSession.canvas;
            } else if (currentStep === 'actions' && currentSession.actions) {
              updates.actions = currentSession.actions;
            } else if (currentStep === 'connectors' && currentSession.connectors) {
              updates.connectors = currentSession.connectors;
            } else if (currentStep === 'knowledge' && currentSession.knowledge) {
              updates.knowledge = currentSession.knowledge;
            } else if (currentStep === 'rag' && currentSession.rag) {
              updates.rag = currentSession.rag;
            } else if (currentStep === 'deploy' && currentSession.deployment) {
              updates.deployment = currentSession.deployment;
            }
            
            updateSession.mutate({
              sessionId: currentSessionId,
              updates
            }, {
              onSuccess: () => {
                toast({
                  title: "Progress Saved",
                  description: "Your agent configuration has been saved successfully.",
                });
              }
            });
          } else {
            toast({
              title: "Save Failed",
              description: "No active session to save. Please create a new agent first.",
              variant: "destructive",
            });
          }
        }}
        onDelete={() => {
          if (currentSessionId && deleteSession) {
            deleteSession.mutate(currentSessionId, {
              onSuccess: () => {
                setCurrentSessionId(null);
                setCurrentStep('basic_info');
                // Clear localStorage
                localStorage.removeItem('unifiedBuilder_currentSessionId');
                localStorage.removeItem('unifiedBuilder_currentStep');
                // Go back to overview after deleting
                window.localStorage.setItem('agenticEcosystem_activeTab', 'overview');
                
                toast({
                  title: "Session Deleted",
                  description: "Agent session has been permanently deleted.",
                });
              },
              onError: (error) => {
                toast({
                  title: "Delete Failed", 
                  description: error.message,
                  variant: "destructive",
                });
              }
            });
          } else {
            toast({
              title: "Delete Failed",
              description: "No active session to delete.",
              variant: "destructive",
            });
          }
        }}
        onExit={() => {
          setCurrentSessionId(null);
          setCurrentStep('basic_info');
          // Go back to overview when exiting
          setCurrentStep('basic_info');
          window.localStorage.setItem('agenticEcosystem_activeTab', 'overview');
        }}
        isSaving={updateSession.isPending}
      />

      {/* Integration Status */}
      <AgentIntegrationStatus 
        sessionId={currentSessionId}
        sessionData={currentSession}
      />

      {/* Step Progress Indicator */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            {BUILDER_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  getStepStatus(step) === 'completed' ? 'bg-green-100 text-green-700' :
                  getStepStatus(step) === 'active' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {getStepIcon(step)}
                  <span className="font-medium">{step.title}</span>
                </div>
                {index < BUILDER_STEPS.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Render step content based on current step */}
      {renderStepContent()}

    </div>
  );
};
