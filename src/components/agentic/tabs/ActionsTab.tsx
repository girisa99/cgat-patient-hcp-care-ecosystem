import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentActionsManager } from '@/components/agentic/AgentActionsManager';
import { AgentAssignmentOverview } from '@/components/agentic/AgentAssignmentOverview';
import { SystemConnectors } from '@/components/agentic/SystemConnectors';
import { EnhancedConnectorSystem } from '@/components/agentic/enhanced-connector/EnhancedConnectorSystem';
import { KnowledgeBaseManager } from '@/components/agentic/KnowledgeBaseManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Info, Plug, Zap, Settings, BookOpen, Database } from 'lucide-react';
import { AgentAction } from '@/components/agentic/AgentActionsManager';

interface ActionsTabProps {
  sessionId: string;
  actions: AgentAction[];
  onActionsChange: (actions: AgentAction[]) => void;
  agentType?: string;
  agentPurpose?: string;
}

export const ActionsTab: React.FC<ActionsTabProps> = ({
  sessionId,
  actions,
  onActionsChange,
  agentType,
  agentPurpose
}) => {
  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Actions, Connectors & Knowledge
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete agent configuration: actions, connectors, knowledge bases, and assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            {actions.length} Actions Configured
          </Badge>
        </div>
      </div>

      {/* Consolidated Configuration Tabs */}
      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="connectors" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Connectors
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        {/* Actions Tab */}
        <TabsContent value="actions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Actions & Tasks</CardTitle>
              <CardDescription>
                Configure agent actions, assign AI models, and manage task workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentActionsManager
                onActionsChange={onActionsChange}
                initialActions={actions}
                agentType={agentType}
                agentPurpose={agentPurpose}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connectors Tab */}
        <TabsContent value="connectors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Connectors & Assignment</CardTitle>
              <CardDescription>
                Manage system connectors and assign them to agent actions based on usecase, description, and requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedConnectorSystem 
                agentId={sessionId}
                actions={actions.map(action => ({
                  id: action.id,
                  name: action.name,
                  type: action.type,
                  category: action.category,
                  description: action.description
                }))}
                onAssignmentsChange={() => {
                  console.log('Connector assignments changed');
                }}
                agentType={agentType}
                agentPurpose={agentPurpose}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Tab */}
        <TabsContent value="knowledge" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Management</CardTitle>
              <CardDescription>
                Manage knowledge sources, RAG workflows, and knowledge base assignments for your agent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnowledgeBaseManager 
                agentId={sessionId}
                actions={actions.map(action => ({
                  id: action.id,
                  name: action.name,
                  type: action.type,
                  category: action.category,
                  description: action.description
                }))}
                onKnowledgeSourcesChange={(sources) => {
                  console.log('Knowledge sources changed:', sources);
                }}
                agentType={agentType}
                agentPurpose={agentPurpose}
                agentTopic={agentType ? `${agentType} Knowledge and modalaties` : 'Healthcare Operations'}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Overview Tab */}
        <TabsContent value="assignments" className="mt-6">
          {actions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Assignment Overview</CardTitle>
                <CardDescription>
                  View and manage connector, API, AI model, and MCP assignments for all actions and tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentAssignmentOverview
                  sessionId={sessionId}
                  actions={actions}
                  onAssignmentChange={() => {
                    console.log('Assignments changed');
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Actions Configured</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure actions in the Actions tab to see assignment options
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};