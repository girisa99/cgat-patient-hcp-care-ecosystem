import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentActionsManager } from '@/components/agentic/AgentActionsManager';
import { AgentAssignmentOverview } from '@/components/agentic/AgentAssignmentOverview';
import { SystemConnectors } from '@/components/agentic/SystemConnectors';
import { EnhancedConnectorSystem } from '@/components/agentic/enhanced-connector/EnhancedConnectorSystem';
import { KnowledgeBaseManager } from '@/components/agentic/KnowledgeBaseManager';
import { RAGComplianceWorkflow } from '@/components/rag/RAGComplianceWorkflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Info, Plug, Zap, Settings, BookOpen, Database, Brain } from 'lucide-react';
import { AgentAction } from '@/components/agentic/AgentActionsManager';

interface ConsolidatedActionsTabProps {
  sessionId: string;
  actions: AgentAction[];
  onActionsChange: (actions: AgentAction[]) => void;
  agentType?: string;
  agentPurpose?: string;
  agentId?: string;
}

export const ConsolidatedActionsTab: React.FC<ConsolidatedActionsTabProps> = ({
  sessionId,
  actions,
  onActionsChange,
  agentType,
  agentPurpose,
  agentId
}) => {
  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Actions & Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete agent configuration: actions, system connectors, knowledge base, and assignments
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Actions & Templates
          </TabsTrigger>
          <TabsTrigger value="connectors" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            System Connectors
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Knowledge Base & RAG
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
                agentId={agentId || sessionId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Connectors Tab */}
        <TabsContent value="connectors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Connectors & Integration</CardTitle>
              <CardDescription>
                Manage system connectors and assign them to agent actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="system" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="system">Available Connectors</TabsTrigger>
                  <TabsTrigger value="enhanced">Enhanced & Assignment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="system">
                  <SystemConnectors />
                </TabsContent>
                
                <TabsContent value="enhanced">
                  <EnhancedConnectorSystem 
                    agentId={agentId || sessionId}
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Tab */}
        <TabsContent value="knowledge" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base & RAG</CardTitle>
              <CardDescription>
                Manage knowledge sources, RAG workflows, and knowledge base assignments
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
                    agentId={agentId || sessionId}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};