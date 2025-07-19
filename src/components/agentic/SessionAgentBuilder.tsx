import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SessionControls, SessionList } from '@/components/agentic/SessionControls';
import { AgentCanvas } from '@/components/agentic/AgentCanvas';
import { AgentTemplates } from '@/components/agentic/AgentTemplates';
import { AgentCreationWizard } from '@/components/agentic/AgentCreationWizard';
import { SystemConnectors } from '@/components/agentic/SystemConnectors';
import { AgentDeployment } from '@/components/agentic/AgentDeployment';
import { KnowledgeBaseManager } from '@/components/rag/KnowledgeBaseManager';
import { RAGRecommendations } from '@/components/rag/RAGRecommendations';
import { useAgentSession } from '@/hooks/useAgentSession';
import { AgentSession } from '@/types/agent-session';
import { Plus, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SessionAgentBuilder = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<AgentSession['current_step']>('basic_info');
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    name: '',
    description: '',
    template_id: '',
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
    if (!newSessionData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your agent.",
        variant: "destructive",
      });
      return;
    }

    createSession.mutate({
      ...newSessionData,
      basic_info: {
        name: newSessionData.name,
        description: newSessionData.description,
      }
    }, {
      onSuccess: (session) => {
        setCurrentSessionId(session.id);
        setCurrentStep('basic_info');
        setShowNewSessionDialog(false);
        setNewSessionData({ name: '', description: '', template_id: '', template_type: 'custom' });
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
    const sessionData = {
      name: template.name,
      description: template.description,
      template_id: template.id,
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

    createSession.mutate(sessionData, {
      onSuccess: (session) => {
        setCurrentSessionId(session.id);
        setCurrentStep('basic_info');
        toast({
          title: "Template Applied",
          description: "You can now edit and customize this template.",
        });
      }
    });
  };

  // If no session is active, show session management
  if (!currentSessionId || !currentSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Agent Builder</h2>
            <p className="text-muted-foreground">Create and manage your AI agents</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowNewSessionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Agent
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
              <Button onClick={() => handleTemplateSelect({ 
                id: 'sample', 
                name: 'Sample Template', 
                description: 'A sample AI agent template' 
              })}>
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

      {/* Main Tabs */}
      <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as AgentSession['current_step'])}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic_info">Basic Info</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="connectors">Connectors</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="rag">RAG</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        <TabsContent value="basic_info" className="space-y-4">
          <AgentCreationWizard />
        </TabsContent>

        <TabsContent value="canvas" className="space-y-4">
          <AgentCanvas />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Actions</CardTitle>
                <CardDescription>Configure actions and behaviors for your agent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Configure the actions your agent can perform and the tasks it can execute.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connectors" className="space-y-4">
          <SystemConnectors />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <KnowledgeBaseManager />
        </TabsContent>

        <TabsContent value="rag" className="space-y-4">
          <RAGRecommendations />
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};