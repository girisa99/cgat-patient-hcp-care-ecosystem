/**
 * STREAMLINED CANVAS VIEW
 * Simplified canvas when coming from Admin Dashboard
 * Shows only the builder - no confusing template/generate options
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Play,
  Save as SaveIcon,
  Sparkles,
  CheckCircle,
  Bot,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FixedAdvancedReactFlow } from './FixedAdvancedReactFlow';
import { EnhancedAIAssistPanel } from './EnhancedAIAssistPanel';
import { useAIServiceHealth } from '@/hooks/useAIServiceHealth';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';

interface AgentContext {
  id?: string;
  name: string;
  description?: string;
  useCaseId?: string;
  useCase?: { name: string; description?: string };
  brandName?: string;
  channels?: string[];
}

interface StreamlinedCanvasViewProps {
  agentContext: AgentContext;
  prefillPrompt?: string;
  onBack: () => void;
}

export const StreamlinedCanvasView: React.FC<StreamlinedCanvasViewProps> = ({
  agentContext,
  prefillPrompt,
  onBack
}) => {
  const navigate = useNavigate();
  const { user } = useMasterAuth();
  const { status: aiHealth, checkHealth } = useAIServiceHealth();
  
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<any[]>([]);
  const [showUnifiedAssist, setShowUnifiedAssist] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Knowledge Base and RAG Configuration
  const [knowledgeBaseConfig, setKnowledgeBaseConfig] = useState<{
    enabled: boolean;
    knowledgeBaseIds: string[];
    contextWindow: number;
  }>({
    enabled: true,
    knowledgeBaseIds: [],
    contextWindow: 5,
  });
  
  const [ragConfig, setRagConfig] = useState<{
    enabled: boolean;
    chunkSize: number;
    overlapSize: number;
    embeddingModel: string;
    retrievalTopK: number;
  }>({
    enabled: true,
    chunkSize: 500,
    overlapSize: 50,
    embeddingModel: 'text-embedding-ada-002',
    retrievalTopK: 5,
  });

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Generate initial nodes based on use case context
  useEffect(() => {
    if (agentContext && workflowNodes.length === 0) {
      const starterNodes = generateStarterNodes(agentContext);
      setWorkflowNodes(starterNodes.nodes);
      setWorkflowEdges(starterNodes.edges);
    }
  }, [agentContext]);

  const generateStarterNodes = (context: AgentContext) => {
    const nodes = [
      {
        id: 'start-node',
        type: 'enhanced',
        position: { x: 150, y: 50 },
        data: {
          label: 'Start',
          type_key: 'trigger',
          intent: 'Initiate workflow',
          configuration: {},
          isWorkflowNode: true,
        }
      },
      {
        id: 'agent-node',
        type: 'enhanced',
        position: { x: 150, y: 130 },
        data: {
          label: context.name || 'AI Agent',
          type_key: 'ai_agent',
          intent: context.useCase?.description || 'Process user request',
          configuration: {
            name: context.name,
            description: context.description,
            useCase: context.useCase?.name,
          },
          isWorkflowNode: true,
        }
      },
      {
        id: 'response-node',
        type: 'enhanced',
        position: { x: 150, y: 210 },
        data: {
          label: 'Response',
          type_key: 'output',
          intent: 'Return result to user',
          configuration: {},
          isWorkflowNode: true,
        }
      }
    ];

    const edges = [
      { id: 'e-start-agent', source: 'start-node', target: 'agent-node', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e-agent-response', source: 'agent-node', target: 'response-node', type: 'smoothstep', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
    ];

    return { nodes, edges };
  };

  const handleWorkflowUpdate = (nodes: any[], edges: any[]) => {
    setWorkflowNodes(nodes || []);
    setWorkflowEdges(edges || []);
    setHasUnsavedChanges(true);
  };

  const handleNodesGenerated = useCallback((newNodes: any[]) => {
    setWorkflowNodes(prev => [...prev, ...newNodes]);
    setHasUnsavedChanges(true);
    toast.success(`Added ${newNodes.length} node(s)`);
  }, []);

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save');
      return;
    }

    setIsSaving(true);
    try {
      if (agentContext.id) {
        const { error } = await supabase
          .from('agents')
          .update({
            configuration: {
              workflow: {
                nodes: workflowNodes,
                edges: workflowEdges,
              },
              knowledgeBase: knowledgeBaseConfig,
              ragConfig: ragConfig,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', agentContext.id);

        if (error) throw error;
        toast.success('Agent workflow saved');
      } else {
        const { error } = await supabase
          .from('agents')
          .insert({
            name: agentContext.name,
            description: agentContext.description,
            use_case: agentContext.useCaseId,
            brand: agentContext.brandName,
            created_by: user.id,
            configuration: {
              workflow: {
                nodes: workflowNodes,
                edges: workflowEdges,
              },
              knowledgeBase: knowledgeBaseConfig,
              ragConfig: ragConfig,
            },
            status: 'draft',
          });

        if (error) throw error;
        toast.success('Agent created with workflow');
      }
      
      setHasUnsavedChanges(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = async () => {
    // Save first
    await handleSave();
    
    if (!agentContext.id) {
      toast.error('Please save the agent first');
      return;
    }

    try {
      // Update agent status to active
      const { error } = await supabase
        .from('agents')
        .update({
          status: 'active',
          deployment_config: {
            deployed_at: new Date().toISOString(),
            deployed_by: user?.id,
            channels: agentContext.channels || ['web'],
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', agentContext.id);

      if (error) throw error;

      // Log analytics event
      await supabase.from('agent_performance_metrics').insert({
        agent_id: agentContext.id,
        metric_type: 'deployment',
        metric_value: 1,
        metadata: {
          event: 'agent_deployed',
          workflow_nodes: workflowNodes.length,
          workflow_edges: workflowEdges.length,
        },
      });

      toast.success('Agent deployed successfully');
      setShowDeployDialog(false);
      
      // Navigate back to admin
      navigate('/admin', { state: { deployedAgentId: agentContext.id } });
    } catch (e: any) {
      toast.error(e?.message || 'Deployment failed');
    }
  };

  const handleBackToAdmin = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Save before leaving?')) {
        handleSave().then(() => navigate('/admin'));
        return;
      }
    }
    navigate('/admin');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Streamlined Header */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackToAdmin}
            className="flex items-center gap-1 h-8 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="font-medium">{agentContext.name}</span>
            {agentContext.useCase && (
              <Badge variant="secondary" className="text-xs">
                {agentContext.useCase.name}
              </Badge>
            )}
          </div>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
              Unsaved changes
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={aiHealth.overallHealthy ? 'secondary' : 'destructive'} className="text-xs">
            AI {aiHealth.overallHealthy ? '●' : '○'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3" 
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <SaveIcon className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button 
            size="sm" 
            className="h-8 px-3" 
            onClick={() => setShowDeployDialog(true)}
            disabled={workflowNodes.length === 0}
          >
            <Play className="w-4 h-4 mr-1.5" />
            Deploy
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            className="h-8 px-3" 
            onClick={() => setShowUnifiedAssist(!showUnifiedAssist)} 
            disabled={!aiHealth.overallHealthy}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            AI Assist
          </Button>
        </div>
      </div>

      {/* Agent Context Banner */}
      <div className="border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Building workflow for:</span>
            <span className="font-medium">{agentContext.name}</span>
          </div>
          {agentContext.description && (
            <>
              <div className="h-4 w-px bg-border" />
              <span className="text-muted-foreground truncate max-w-md">
                {agentContext.description}
              </span>
            </>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            Right-click canvas to add nodes
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative">
        <FixedAdvancedReactFlow 
          initialNodes={workflowNodes}
          initialEdges={workflowEdges}
          onWorkflowUpdate={handleWorkflowUpdate}
        />

        {/* Enhanced AI Assist Panel */}
        <EnhancedAIAssistPanel
          isOpen={showUnifiedAssist}
          onClose={() => setShowUnifiedAssist(false)}
          agentContext={agentContext}
          workflowNodes={workflowNodes}
          workflowEdges={workflowEdges}
          onNodesGenerated={handleNodesGenerated}
        />
      </div>

      {/* Deploy Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deploy {agentContext.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Your agent workflow has {workflowNodes.length} nodes and is ready for deployment.
            </p>
            
            {/* KB/RAG Summary */}
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Knowledge Base:</span>
                <Badge variant={knowledgeBaseConfig.enabled ? 'default' : 'secondary'}>
                  {knowledgeBaseConfig.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">RAG Processing:</span>
                <Badge variant={ragConfig.enabled ? 'default' : 'secondary'}>
                  {ragConfig.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              {knowledgeBaseConfig.knowledgeBaseIds.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {knowledgeBaseConfig.knowledgeBaseIds.length} knowledge base(s) connected
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeployDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleDeploy}>
                <Play className="h-4 w-4 mr-2" />
                Deploy & Return to Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
