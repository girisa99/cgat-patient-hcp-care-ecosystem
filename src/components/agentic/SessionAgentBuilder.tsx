import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SessionControls, SessionList } from '@/components/agentic/SessionControls';
import { EnhancedAgentCanvas } from '@/components/agentic/EnhancedAgentCanvas';
import { AgentTemplates } from '@/components/agentic/AgentTemplates';
import { AgentActionsManager } from '@/components/agentic/AgentActionsManager';
import { AgentDeployment } from '@/components/agentic/AgentDeployment';
import { RAGComplianceWorkflow } from '@/components/rag/RAGComplianceWorkflow';
import { AgentIntegrationStatus } from '@/components/agentic/AgentIntegrationStatus';
import { ActionsTab } from '@/components/agentic/tabs/ActionsTab';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { AgentSession } from '@/types/agent-session';
import { Plus, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CategoryMapping } from './CategoryMapping';
import { UseCaseSelector } from './UseCaseSelector';

export const SessionAgentBuilder = () => {
  const { user } = useMasterAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<AgentSession['current_step']>('basic_info');
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    name: '',
    description: '',
    template_id: null as string | null,
    template_type: 'custom' as const,
  });

  const {
    currentSession,
    userSessions,
    createSession,
    updateSession,
    autoSave,
    deleteSession,
    deployAgent,
  } = useAgentSession(currentSessionId || undefined);

  // Auto-save functionality
  useEffect(() => {
    if (currentSession && currentSessionId) {
      const autoSaveTimer = setTimeout(() => {
        autoSave.mutate({
          sessionId: currentSessionId,
          updates: { current_step: currentStep }
        });
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [currentStep, currentSession, currentSessionId, autoSave]);

  const handleCreateNewSession = () => {
    console.log('🚀 handleCreateNewSession called');
    console.log('🚀 User state:', user);
    console.log('🚀 Session data to create:', newSessionData);
    
    if (!user) {
      console.log('❌ No user found, showing auth error');
      toast({
        title: "Authentication Required",
        description: "Please log in to create an agent session.",
        variant: "destructive"
      });
      return;
    }

    if (!newSessionData.name.trim()) {
      console.log('❌ No agent name provided');
      toast({
        title: "Name Required",
        description: "Please enter a name for your agent.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Calling createSession.mutate with data:', newSessionData);
    createSession.mutate({
      ...newSessionData,
      basic_info: {
        name: newSessionData.name,
        description: newSessionData.description,
      }
    }, {
      onSuccess: (session) => {
        console.log('✅ Session created successfully:', session);
        setCurrentSessionId(session.id);
        setCurrentStep('basic_info');
        setShowNewSessionDialog(false);
        setNewSessionData({ name: '', description: '', template_id: null, template_type: 'custom' });
      },
      onError: (error) => {
        console.error('❌ Failed to create session:', error);
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
    setCurrentStep(session.current_step);
    setShowSessionList(false);
  };

  const handleSaveAndContinue = () => {
    if (!currentSessionId) return;

    updateSession.mutate({
      sessionId: currentSessionId,
      updates: { 
        current_step: currentStep,
        status: 'in_progress'
      }
    });
  };

  const handleExit = () => {
    if (currentSession && currentSessionId) {
      updateSession.mutate({
        sessionId: currentSessionId,
        updates: { current_step: currentStep }
      });
    }
    setCurrentSessionId(null);
    setCurrentStep('basic_info');
    setShowSessionList(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession.mutate(sessionId, {
      onSuccess: () => {
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setCurrentStep('basic_info');
        }
      }
    });
  };

  const handleDeployAgent = () => {
    if (!currentSessionId) return;

    deployAgent.mutate(currentSessionId, {
      onSuccess: () => {
        setCurrentSessionId(null);
        setCurrentStep('basic_info');
        setShowSessionList(true);
      }
    });
  };

  const handleTemplateSelect = (template: any) => {
    console.log('Template selected:', template);
    console.log('User from auth:', user);
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create an agent session.",
        variant: "destructive"
      });
      return;
    }

    const sessionData = {
      name: template.name,
      description: template.description,
      template_id: template.id === 'sample' ? null : template.id, // Convert 'sample' to null for UUID
      template_type: 'ai_generated' as const,
      basic_info: {
        name: template.name,
        description: template.description,
        purpose: template.purpose,
        use_case: template.use_case,
        brand: template.brand,
        categories: template.categories || [],
        topics: template.topics || [],
        business_units: template.business_units || [],
      }
    };

    console.log('Creating session with data:', sessionData);
    createSession.mutate(sessionData, {
      onSuccess: (session) => {
        console.log('Session created successfully:', session);
        setCurrentSessionId(session.id);
        setCurrentStep('basic_info');
        toast({
          title: "Template Applied",
          description: "You can now edit and customize this template.",
        });
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

  // If no session is active, show session management
  if (!currentSessionId || !currentSession) {
    console.log('🚨 SessionAgentBuilder: No active session, showing session management UI');
    console.log('🚨 User auth state:', user);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Agent Builder</h2>
            <p className="text-muted-foreground">Create and manage your AI agents</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {
              console.log('New Agent button clicked, user:', user);
              if (!user) {
                toast({
                  title: "Authentication Required",
                  description: "Please log in to create an agent session.",
                  variant: "destructive"
                });
                return;
              }
              console.log('Opening new session dialog');
              setShowNewSessionDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Agent
            </Button>
            {/* Debug button for testing session creation directly */}
            <Button variant="outline" onClick={() => {
              console.log('🧪 Test session creation button clicked');
              if (!user) {
                console.log('❌ No user for test');
                return;
              }
              console.log('🧪 Testing direct session creation...');
              createSession.mutate({
                name: 'Test Agent ' + Date.now(),
                description: 'Test agent for debugging',
                template_type: 'custom'
              });
            }}>
              🧪 Test Create
            </Button>
            {userSessions.length > 0 && (
              <Button variant="outline" onClick={() => setShowSessionList(true)}>
                <Bot className="h-4 w-4 mr-2" />
                Continue Session
              </Button>
            )}
          </div>
        </div>

        {/* Session List */}
        {(showSessionList || userSessions.length > 0) && (
          <SessionList
            sessions={userSessions}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {/* Templates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Start from Template</CardTitle>
            <CardDescription>Choose a pre-built template to get started quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-muted-foreground">Template selection will be implemented here.</p>
              <Button onClick={() => {
                console.log('Try Sample Template button clicked, user:', user);
                if (!user) {
                  toast({
                    title: "Authentication Required", 
                    description: "Please log in to create an agent session.",
                    variant: "destructive"
                  });
                  return;
                }
                handleTemplateSelect({ 
                  id: 'sample', 
                  name: 'Sample Template', 
                  description: 'A sample AI agent template' 
                });
              }}>
                Try Sample Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* New Session Dialog */}
        <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Start building a new AI agent from scratch
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={newSessionData.name}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter agent name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newSessionData.description}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this agent will do"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNewSession} disabled={createSession.isPending}>
                  {createSession.isPending ? 'Creating...' : 'Create Agent'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Agent builder with tabs and session controls
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{currentSession.name}</h2>
          <p className="text-muted-foreground">{currentSession.description}</p>
        </div>
      </div>

      {/* Session Controls */}
      <SessionControls
        session={currentSession}
        onSave={handleSaveAndContinue}
        onExit={handleExit}
        isSaving={updateSession.isPending}
      />

      {/* Integration Status */}
      <AgentIntegrationStatus 
        sessionId={currentSessionId!}
        sessionData={currentSession}
      />

      {/* Main Tabs */}
      <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as AgentSession['current_step'])}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic_info">Agent Creation</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="actions">Actions & Config</TabsTrigger>
          <TabsTrigger value="rag">RAG</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        <TabsContent value="basic_info" className="space-y-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Creation</CardTitle>
                <CardDescription>Configure your agent's basic details, categories, and purpose</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Agent Type Selection */}
                <div>
                  <Label className="text-base font-medium">Agent Type</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose between single agent or multi-agent configuration</p>
                  <Select
                    value={currentSession.basic_info?.agent_type || 'single'}
                    onValueChange={(value) => {
                      if (currentSessionId) {
                        updateSession.mutate({
                          sessionId: currentSessionId,
                          updates: {
                            basic_info: {
                              ...currentSession.basic_info,
                              agent_type: value
                            }
                          }
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select agent type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-md z-50">
                      <SelectItem value="single">Single Agent</SelectItem>
                      <SelectItem value="multi">Multi-Agent Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input
                      id="agent-name"
                      value={currentSession.basic_info?.name || currentSession.name}
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
                    <Label htmlFor="agent-purpose">Purpose</Label>
                    <Input
                      id="agent-purpose"
                      value={currentSession.basic_info?.purpose || ''}
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
                </div>

                <div>
                  <Label htmlFor="agent-description">Description</Label>
                  <Textarea
                    id="agent-description"
                    value={currentSession.basic_info?.description || currentSession.description}
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
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agent-brand">Brand/Organization</Label>
                    <Input
                      id="agent-brand"
                      value={currentSession.basic_info?.brand || ''}
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
                  <div>
                    <Label htmlFor="agent-use-case">Use Case</Label>
                    <UseCaseSelector
                      selectedUseCase={currentSession.basic_info?.use_case || ''}
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
                      selectedCategories={currentSession.basic_info?.categories || []}
                      selectedTopics={currentSession.basic_info?.topics || []}
                    />
                  </div>
                </div>

                {/* Categories, Business Units, and Topics Selection */}
                <CategoryMapping
                  selectedCategories={currentSession.basic_info?.categories || []}
                  selectedBusinessUnits={currentSession.basic_info?.business_units || []}
                  selectedTopics={currentSession.basic_info?.topics || []}
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
                {((currentSession.basic_info?.categories?.length || 0) > 0 || 
                  (currentSession.basic_info?.topics?.length || 0) > 0 || 
                  (currentSession.basic_info?.business_units?.length || 0) > 0) && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Selected Options</h4>
                    <div className="space-y-2">
                      {(currentSession.basic_info?.categories?.length || 0) > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Categories: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentSession.basic_info?.categories?.map((category, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {(currentSession.basic_info?.topics?.length || 0) > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Topics: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentSession.basic_info?.topics?.map((topic, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {(currentSession.basic_info?.business_units?.length || 0) > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Business Units: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentSession.basic_info?.business_units?.map((unit, index) => (
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowSessionList(true)}>
                  Back to Sessions
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveAndContinue}>
                    Save & Continue Later
                  </Button>
                  <Button onClick={() => setCurrentStep('canvas')}>
                    Next: Canvas
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="canvas" className="space-y-4">
          <div className="space-y-6">
            <EnhancedAgentCanvas 
              initialName={currentSession.basic_info?.name || currentSession.name}
              initialTagline={currentSession.basic_info?.brand || ''}
              onNameChange={(name) => {
                if (currentSessionId) {
                  updateSession.mutate({
                    sessionId: currentSessionId,
                    updates: {
                      basic_info: {
                        ...currentSession.basic_info,
                        name
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
                      basic_info: {
                        ...currentSession.basic_info,
                        brand: tagline
                      }
                    }
                  });
                }
              }}
            />
            <Card>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('basic_info')}>
                  Previous: Agent Creation
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveAndContinue}>
                    Save & Continue Later
                  </Button>
                  <Button onClick={() => setCurrentStep('actions')}>
                    Next: Actions
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="space-y-6">
            <ActionsTab
              sessionId={currentSessionId!}
              actions={currentSession.actions?.assigned_actions || []}
              onActionsChange={(actions) => {
                if (currentSessionId) {
                  updateSession.mutate({
                    sessionId: currentSessionId,
                    updates: {
                      actions: {
                        assigned_actions: actions,
                        custom_actions: [],
                        configurations: {}
                      }
                    }
                  });
                }
              }}
              agentType={currentSession.basic_info?.use_case || 'assistant'}
              agentPurpose={currentSession.basic_info?.purpose || ''}
              onNavigatePrevious={() => setCurrentStep('canvas')}
              onNavigateNext={() => setCurrentStep('rag')}
              onSaveAndContinue={handleSaveAndContinue}
            />
          </div>
        </TabsContent>


        <TabsContent value="rag" className="space-y-4">
          <div className="space-y-6">
            <RAGComplianceWorkflow
              knowledgeBaseIds={currentSession.knowledge?.knowledge_bases || []}
              complianceEnabled={true}
              onComplianceChange={(enabled) => {
                if (currentSessionId) {
                  updateSession.mutate({
                    sessionId: currentSessionId,
                    updates: {
                      rag: {
                        ...currentSession.rag,
                        configurations: {
                          ...currentSession.rag?.configurations,
                          compliance_enabled: enabled
                        }
                      }
                    }
                  });
                }
              }}
            />
            <Card>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('actions')}>
                  Previous: Actions
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveAndContinue}>
                    Save & Continue Later
                  </Button>
                  <Button onClick={() => setCurrentStep('deploy')}>
                    Next: Deploy
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
          <div className="space-y-6">
            <AgentDeployment 
              agents={[{
                id: currentSessionId || '',
                name: currentSession.basic_info?.name || currentSession.name,
                description: currentSession.basic_info?.description || currentSession.description,
                status: 'draft',
                connections: [],
                role: 'Assistant',
                template: 'custom'
              }]}
              onDeploy={() => handleDeployAgent()}
            />
            <Card>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('rag')}>
                  Previous: RAG
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveAndContinue}>
                    Save Progress
                  </Button>
                  <Button onClick={handleDeployAgent} disabled={deployAgent.isPending}>
                    {deployAgent.isPending ? 'Deploying...' : 'Deploy Agent'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};