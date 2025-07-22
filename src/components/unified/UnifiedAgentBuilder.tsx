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
import { CategoryMapping } from '@/components/agentic/CategoryMapping';
import { UseCaseSelector } from '@/components/agentic/UseCaseSelector';

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

// Step configuration with progress tracking
interface BuilderStep {
  id: AgentSession['current_step'];
  title: string;
  description: string;
  icon: React.ComponentType<any>;
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
    title: 'Canvas & Branding',
    description: 'Configure visual identity and white-label settings',
    icon: Palette,
    isCompleted: (session) => !!(session?.canvas && Object.keys(session.canvas).length > 0),
    isRequired: false
  },
  {
    id: 'actions',
    title: 'Actions & Configuration',
    description: 'Set up actions, tasks, AI models, and workflows',
    icon: Zap,
    isCompleted: (session) => !!(session?.actions && Object.keys(session.actions).length > 0),
    isRequired: true
  },
  {
    id: 'connectors',
    title: 'System Connectors',
    description: 'Connect to APIs, databases, and external services',
    icon: Plug,
    isCompleted: (session) => !!(session?.connectors && Object.keys(session.connectors).length > 0),
    isRequired: true
  },
  {
    id: 'knowledge',
    title: 'Knowledge & RAG',
    description: 'Configure knowledge base and RAG capabilities',
    icon: Brain,
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
  const { user } = useMasterAuth();
  
  // Initialize state with localStorage persistence
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('unifiedBuilder_currentSessionId') || null;
    }
    return null;
  });
  
  const [currentStep, setCurrentStep] = useState<AgentSession['current_step']>(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('unifiedBuilder_currentStep') as AgentSession['current_step'];
      return savedStep || step || 'basic_info';
    }
    return step || 'basic_info';
  });
  
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [actions, setActions] = useState<AgentAction[]>([]);
  
  const {
    currentSession,
    userSessions,
    createSession,
    updateSession,
    autoSave,
    deleteSession,
    deployAgent,
    isLoading,
  } = useAgentSession(currentSessionId || undefined);

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
      setCurrentStep(step);
    }
  }, [step]);

  // Auto-save functionality
  useEffect(() => {
    if (currentSession && currentSessionId) {
      const autoSaveTimer = setTimeout(() => {
        autoSave.mutate({
          sessionId: currentSessionId,
          updates: { current_step: currentStep }
        });
      }, 2000);
      return () => clearTimeout(autoSaveTimer);
    }
  }, [currentStep, currentSession, currentSessionId, autoSave]);

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

  const handleDeployAgent = () => {
    if (!currentSessionId) return;

    deployAgent.mutate(currentSessionId, {
      onSuccess: () => {
        toast({
          title: "Deployment Successful",
          description: "Your agent has been deployed and is now live!",
        });
        setCurrentSessionId(null);
        setCurrentStep('basic_info');
        setShowSessionList(true);
      }
    });
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

  // If step prop is provided but no session exists, auto-create one
  if (step && !currentSessionId && !isLoading) {
    handleCreateNewSession();
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
                          if (currentSessionId) {
                            updateSession.mutate({
                              sessionId: currentSessionId,
                              updates: {
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
                          if (currentSessionId) {
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
                          if (currentSessionId) {
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
                          if (currentSessionId) {
                            updateSession.mutate({
                              sessionId: currentSessionId,
                              updates: {
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
      </CardContent>
    </Card>
  );

  const renderActionsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Actions & Task Configuration
        </CardTitle>
        <CardDescription>
          Configure agent actions, assign AI models, and manage task workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AgentActionsManager
          onActionsChange={(newActions) => {
            setActions(newActions);
            if (currentSessionId) {
              updateSession.mutate({
                sessionId: currentSessionId,
                updates: {
                  actions: {
                    assigned_actions: newActions
                  }
                }
              });
            }
          }}
          initialActions={actions}
          agentType={currentSession?.basic_info?.agent_type}
          agentPurpose={currentSession?.basic_info?.purpose}
        />
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
        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="system">System Connectors</TabsTrigger>
            <TabsTrigger value="enhanced">Enhanced Connectors</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system">
            <SystemConnectors />
          </TabsContent>
          
          <TabsContent value="enhanced">
            <EnhancedConnectorSystem 
              agentId={currentSessionId || ''}
              actions={actions}
              onAssignmentsChange={() => {}}
            />
          </TabsContent>
          
          <TabsContent value="assignments">
            <ConnectorAssignmentManager 
              agentId={currentSessionId || ''}
              actions={actions}
              onAssignmentsChange={(assignments) => {
                if (currentSessionId) {
                  updateSession.mutate({
                    sessionId: currentSessionId,
                    updates: {
                      connectors: {
                        assigned_connectors: assignments
                      }
                    }
                  });
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const renderKnowledgeStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Knowledge Base & RAG Configuration
        </CardTitle>
        <CardDescription>
          Configure knowledge bases, upload documents, and set up RAG capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="rag">RAG Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="knowledge">
            <KnowledgeBaseManager 
              agentId={currentSessionId || ''}
              actions={actions}
              onKnowledgeSourcesChange={() => {}}
            />
          </TabsContent>
          
          <TabsContent value="rag">
            <RAGComplianceWorkflow 
              knowledgeBaseIds={[]}
              complianceEnabled={true}
              onComplianceChange={() => {}}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const renderDeployStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Agent Deployment
        </CardTitle>
        <CardDescription>
          Deploy your agent to channels and configure omni-channel deployment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pre-deployment checklist */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Pre-deployment Checklist</h4>
            <div className="space-y-2">
              {BUILDER_STEPS.slice(0, -1).map((step) => (
                <div key={step.id} className="flex items-center gap-2">
                  {step.isCompleted(currentSession) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className={`text-sm ${step.isCompleted(currentSession) ? 'text-green-700' : 'text-yellow-700'}`}>
                    {step.title}
                  </span>
                  {step.isRequired && !step.isCompleted(currentSession) && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deployment interface */}
          <AgentChannelAssignmentMatrix />
          
          {/* Deployment actions */}
          <div className="flex justify-end items-center pt-4 border-t">
            <Button 
              onClick={handleDeployAgent}
              disabled={deployAgent.isPending || !BUILDER_STEPS.slice(0, -1).every(step => step.isCompleted(currentSession) || !step.isRequired)}
              className="gap-2"
            >
              <Rocket className="h-4 w-4" />
              {deployAgent.isPending ? 'Deploying...' : 'Deploy Agent'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
          if (currentSessionId) {
            updateSession.mutate({
              sessionId: currentSessionId,
              updates: { current_step: currentStep }
            });
          }
        }}
        onDelete={() => {
          if (currentSessionId && deleteSession) {
            deleteSession.mutate(currentSessionId, {
              onSuccess: () => {
                setCurrentSessionId(null);
                setCurrentStep('basic_info');
                // Go back to overview after deleting
                window.localStorage.setItem('agenticEcosystem_activeTab', 'overview');
                window.location.reload(); // Refresh to show overview
              }
            });
          }
        }}
        onExit={() => {
          setCurrentSessionId(null);
          setCurrentStep('basic_info');
          // Go back to overview when exiting
          window.localStorage.setItem('agenticEcosystem_activeTab', 'overview');
          window.location.reload(); // Refresh to show overview
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
