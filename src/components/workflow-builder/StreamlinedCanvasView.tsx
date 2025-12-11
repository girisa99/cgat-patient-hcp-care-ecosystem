/**
 * STREAMLINED CANVAS VIEW
 * Simplified canvas when coming from Admin Dashboard
 * Shows only the builder - no confusing template/generate options
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Play,
  Save as SaveIcon,
  Sparkles,
  Bot,
  CheckCircle,
  Send,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FixedAdvancedReactFlow } from './FixedAdvancedReactFlow';
import { useAIServiceHealth } from '@/hooks/useAIServiceHealth';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useUniversalAI } from '@/hooks/useUniversalAI';

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
  const { generateResponse, isLoading: isAILoading } = useUniversalAI();
  
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<any[]>([]);
  const [showUnifiedAssist, setShowUnifiedAssist] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

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

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      const response = await generateResponse({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        prompt: `Generate workflow nodes for: ${aiPrompt}. Agent context: ${agentContext.name} - ${agentContext.description || ''}. Return a JSON array of nodes with label, type (action/condition/output), and description.`,
      });

      // Parse AI response to extract nodes
      if (response?.content) {
        try {
          // Try to extract JSON from response
          const jsonMatch = response.content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedNodes = JSON.parse(jsonMatch[0]);
            const newNodes = parsedNodes.map((n: any, idx: number) => ({
              id: `gen-${Date.now()}-${idx}`,
              type: 'enhanced',
              position: { x: 400 + (idx % 3) * 200, y: 100 + Math.floor(idx / 3) * 150 },
              data: {
                label: n.label || n.name || `Node ${idx + 1}`,
                type_key: n.type || 'action',
                configuration: n.configuration || {},
                isWorkflowNode: true,
              }
            }));
            setWorkflowNodes(prev => [...prev, ...newNodes]);
            setHasUnsavedChanges(true);
            toast.success(`Added ${newNodes.length} nodes`);
          } else {
            // Fallback: create a single node from the prompt
            const newNode = {
              id: `gen-${Date.now()}`,
              type: 'enhanced',
              position: { x: 400, y: 200 },
              data: {
                label: aiPrompt.slice(0, 30),
                type_key: 'action',
                configuration: { description: aiPrompt },
                isWorkflowNode: true,
              }
            };
            setWorkflowNodes(prev => [...prev, newNode]);
            setHasUnsavedChanges(true);
            toast.success('Added node from prompt');
          }
        } catch {
          toast.error('Could not parse AI response');
        }
      }
      setAiPrompt('');
    } catch (e: any) {
      toast.error('AI generation failed');
    }
  };

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
              }
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
              }
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

        {/* AI Assist Panel */}
        {showUnifiedAssist && (
          <div className="absolute top-4 right-4 w-96 z-50">
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Workflow Assistant
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setShowUnifiedAssist(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Describe nodes or workflow steps to add to your canvas
                </p>
                <Textarea 
                  placeholder="e.g., Add a condition node to check user input, then branch to success or error handling..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <Button 
                  onClick={handleAIGenerate}
                  disabled={isAILoading || !aiPrompt.trim()}
                  className="w-full"
                  size="sm"
                >
                  {isAILoading ? (
                    'Generating...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Generate Nodes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Deploy Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy {agentContext.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Your agent workflow has {workflowNodes.length} nodes and is ready for deployment.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeployDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Deployment initiated');
                setShowDeployDialog(false);
              }}>
                <Play className="h-4 w-4 mr-2" />
                Deploy Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
