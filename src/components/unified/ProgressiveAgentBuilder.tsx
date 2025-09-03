import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Brain, Zap, Settings } from 'lucide-react';
import { PromptBasedAgentGenerator } from '../agent-builder/PromptBasedAgentGenerator';
import { ReactFlowWrapper } from '../workflow-builder/ReactFlowWrapper';
import { AutoConnectProcessor } from '../workflow-builder/AutoConnectProcessor';

interface ProgressiveAgentBuilderProps {
  step?: string;
  onComplete?: (agentData: any) => void;
  prefillPrompt?: string;
}

export const ProgressiveAgentBuilder: React.FC<ProgressiveAgentBuilderProps> = ({ 
  step, 
  onComplete,
  prefillPrompt 
}) => {
  const [currentStep, setCurrentStep] = useState(step || 'prompt');
  const [generatedAgent, setGeneratedAgent] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const handleAgentGeneration = (agentData: any) => {
    console.log('Generated agent:', agentData);
    
    // Enhance nodes with personalized functionality from category system
    const enhancedNodes = (agentData.nodes || []).map((node: any) => ({
      ...node,
      data: {
        ...node.data,
        // Preserve category system integration
        type_key: node.data?.type_key || node.type,
        category: node.data?.category,
        personalized: node.data?.personalized || true,
        // Maintain existing personalized capabilities
        capabilities: node.data?.capabilities || [],
        requirements: node.data?.requirements || {},
        configuration: node.data?.configuration || {},
        // Connect to unified AI assist system
        unified_ai_generated: true,
        generation_source: 'unified_ai_assist',
        // Add start node configuration
        ...(node.type === 'start' && {
          input_type: node.data?.input_type || 'chat',
          ephemeral_memory: node.data?.ephemeral_memory || false,
          flow_state: node.data?.flow_state || [],
          persist_state: node.data?.persist_state || false,
          trigger_type: node.data?.trigger_type || 'manual'
        }),
        // Add ecosystem-specific properties based on node type
        ...(node.type === 'agent' && {
          aiProvider: node.data?.aiProvider || 'openai',
          model: node.data?.model || 'gpt-4o-mini'
        }),
        ...(node.type === 'condition' && {
          evaluationType: 'rule-based',
          conditions: node.data?.conditions || []
        }),
        ...(node.type === 'http' && {
          method: 'GET',
          timeout: 30000
        }),
        ...(node.type === 'database' && {
          connectionType: 'read-write',
          queryType: 'select'
        })
      }
    }));

    setGeneratedAgent({
      ...agentData,
      nodes: enhancedNodes
    });
    setNodes(enhancedNodes);
    setEdges(agentData.edges || []);
    setCurrentStep('visual');
  };

  const handleConnectionsUpdate = (newEdges: any[]) => {
    setEdges(newEdges);
  };

  const handleNodesUpdate = (newNodes: any[]) => {
    setNodes(newNodes);
  };

  const handleComplete = () => {
    const finalAgent = {
      ...generatedAgent,
      nodes,
      edges,
      completedAt: new Date().toISOString()
    };
    onComplete?.(finalAgent);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Progressive Agent Builder</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={currentStep === 'prompt' ? 'default' : 'secondary'}>
              1. Prompt
            </Badge>
            <Badge variant={currentStep === 'visual' ? 'default' : 'secondary'}>
              2. Visual
            </Badge>
            <Badge variant={currentStep === 'optimize' ? 'default' : 'secondary'}>
              3. Optimize
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={currentStep} onValueChange={setCurrentStep} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prompt" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Prompt Generation
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-2" disabled={!generatedAgent}>
              <Zap className="h-4 w-4" />
              Visual Builder
            </TabsTrigger>
            <TabsTrigger value="optimize" className="flex items-center gap-2" disabled={!generatedAgent}>
              <Settings className="h-4 w-4" />
              Auto-Optimize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="h-full p-4">
            <PromptBasedAgentGenerator 
              onGenerate={handleAgentGeneration} 
              prefillPrompt={prefillPrompt}
            />
          </TabsContent>

          <TabsContent value="visual" className="h-full p-0">
            {generatedAgent && (
              <div className="h-full">
                <ReactFlowWrapper
                  initialWorkflow={{ nodes, edges }}
                  onSave={(workflow) => {
                    setNodes(workflow.nodes);
                    setEdges(workflow.edges);
                  }}
                  useCaseData={{
                    name: generatedAgent.agentName,
                    description: generatedAgent.description
                  }}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="optimize" className="h-full p-4">
            {generatedAgent && (
              <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <AutoConnectProcessor
                        nodes={nodes}
                        edges={edges}
                        onConnectionsUpdate={handleConnectionsUpdate}
                        onNodesUpdate={handleNodesUpdate}
                      />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Agent Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Name:</span>
                            <span className="font-medium">{generatedAgent.agentName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Nodes:</span>
                            <span className="font-medium">{nodes.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Connections:</span>
                            <span className="font-medium">{edges.length}</span>
                          </div>
                        </div>
                        
                        <Button onClick={handleComplete} className="w-full" size="lg">
                          Complete Agent Setup
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProgressiveAgentBuilder;