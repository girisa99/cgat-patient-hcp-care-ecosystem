import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AgentActionsContent } from '@/components/agentic/AgentActionsContent';
import { AgentAssignmentOverview } from '@/components/agentic/AgentAssignmentOverview';
import { SystemConnectors } from '@/components/agentic/SystemConnectors';
import { EnhancedConnectorSystem } from '@/components/agentic/enhanced-connector/EnhancedConnectorSystem';
import { KnowledgeBaseManager } from '@/components/agentic/KnowledgeBaseManager';
import { RAGComplianceWorkflow } from '@/components/rag/RAGComplianceWorkflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Info, Plug, Zap, Settings, BookOpen, Database, Brain, CheckCircle, Sparkles, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
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
  const [activeTab, setActiveTab] = useState('actions');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [knowledgeBaseIds, setKnowledgeBaseIds] = useState<string[]>([]);

  const handleAutoSuggest = async () => {
    setIsGenerating(true);
    try {
      // This would typically call the AgentActionsManager's suggest function
      toast.success('Auto-suggest functionality triggered');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAction = () => {
    // This would typically trigger adding a new action
    toast.success('Add action functionality triggered');
  };

  const handleReviewContinue = () => {
    if (actions.length === 0) {
      toast.error('Please configure at least one action before continuing');
      return;
    }
    toast.success('Actions reviewed successfully! Ready to proceed.');
  };

  return (
    <div className="space-y-6">
      {/* Main Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Actions & Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure actions, system connectors, knowledge base, and RAG workflow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            {actions.length} Actions Configured
          </Badge>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAutoSuggest}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Auto-Suggest
            </Button>
            <Button size="sm" onClick={handleAddAction}>
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
            {actions.length > 0 && (
              <Button variant="default" size="sm" onClick={handleReviewContinue}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Review & Continue
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Unified Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Actions & Templates
          </TabsTrigger>
          <TabsTrigger value="connectors" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            System Connectors
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="rag" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            RAG Compliance
          </TabsTrigger>
        </TabsList>

        {/* Actions Tab */}
        <TabsContent value="actions" className="mt-6">
          <AgentActionsContent
            onActionsChange={onActionsChange}
            initialActions={actions}
            agentType={agentType}
            agentPurpose={agentPurpose}
            agentId={agentId || sessionId}
          />
        </TabsContent>

        {/* Connectors Tab */}
        <TabsContent value="connectors" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  System Connectors
                </CardTitle>
                <CardDescription>
                  Configure and manage system integrations and data connectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedConnectorSystem
                  agentId={agentId || sessionId}
                  actions={actions}
                  onAssignmentsChange={(assignments) => {
                    // Handle assignment changes
                    console.log('Assignments updated:', assignments);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Knowledge Base Management
                </CardTitle>
                <CardDescription>
                  Manage knowledge sources and configure data ingestion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KnowledgeBaseManager
                  agentId={agentId || sessionId}
                  actions={actions}
                  onKnowledgeSourcesChange={(sources) => {
                    setKnowledgeBaseIds(sources.map(s => s.id));
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RAG Compliance Tab */}
        <TabsContent value="rag" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  RAG Compliance Workflow
                </CardTitle>
                <CardDescription>
                  Configure retrieval-augmented generation compliance and validation workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RAGComplianceWorkflow
                  knowledgeBaseIds={knowledgeBaseIds}
                  complianceEnabled={ragEnabled}
                  onComplianceChange={setRagEnabled}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};