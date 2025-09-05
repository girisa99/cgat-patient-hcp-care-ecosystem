import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Brain, Zap, Settings } from 'lucide-react';
import { PromptBasedAgentGenerator } from '../agent-builder/PromptBasedAgentGenerator';
import { AdvancedReactFlowWrapper } from '../workflow-builder/AdvancedReactFlow';
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
    
        // Enhance nodes with comprehensive configuration from category system
        const enhancedNodes = (agentData.nodes || []).map((node: any) => {
          const baseConfiguration = {
            // Basic settings for all nodes
            name: node.data?.name || node.data?.label,
            description: node.data?.description,
            enabled: true,
            
            // Preserve existing configuration
            ...node.data?.configuration
          };

          // Node-specific configuration based on type
          let specificConfiguration = {};
          
          switch (node.type) {
            case 'condition':
              specificConfiguration = {
                model: node.data?.model || 'ChatAnthropic',
                instructions: node.data?.instructions || 'Determine the appropriate condition based on input',
                input: node.data?.input || '{{question}}',
                scenarios: node.data?.scenarios || [{ text: 'Default scenario' }],
                overrideSystemPrompt: false
              };
              break;
              
            case 'customFunction':
              specificConfiguration = {
                inputVariables: node.data?.inputVariables || [{ name: 'input', value: '{{input}}' }],
                javascriptFunction: node.data?.javascriptFunction || '// Your JavaScript code here\nreturn { result: input };',
                updateFlowState: node.data?.updateFlowState || []
              };
              break;
              
            case 'executeFlow':
              specificConfiguration = {
                connectCredential: node.data?.connectCredential || 'default',
                selectFlow: node.data?.selectFlow || '',
                input: node.data?.input || '{{input}}',
                baseUrl: node.data?.baseUrl || 'http://localhost:3000',
                returnResponseAs: node.data?.returnResponseAs || 'json',
                updateFlowState: node.data?.updateFlowState || []
              };
              break;
              
            case 'directReply':
              specificConfiguration = {
                message: node.data?.message || 'Default reply message'
              };
              break;
              
            case 'humanInput':
              specificConfiguration = {
                descriptionType: node.data?.descriptionType || 'fixed'
              };
              break;
              
            case 'http':
              specificConfiguration = {
                httpCredential: node.data?.httpCredential || '',
                method: node.data?.method || 'GET',
                url: node.data?.url || '',
                headers: node.data?.headers || [],
                queryParams: node.data?.queryParams || [],
                bodyType: node.data?.bodyType || 'JSON',
                responseType: node.data?.responseType || 'JSON'
              };
              break;
              
            case 'agent':
              specificConfiguration = {
                provider: node.data?.provider || 'ChatAnthropic',
                model: node.data?.model || 'claude-sonnet-4-0',
                temperature: node.data?.temperature || 0.7,
                maxTokens: node.data?.maxTokens || 4000,
                messages: node.data?.messages || [],
                tools: node.data?.tools || [],
                enableMemory: true,
                memoryType: 'All Messages'
              };
              break;
              
            case 'start':
              specificConfiguration = {
                inputType: node.data?.inputType || 'chat',
                ephemeralMemory: node.data?.ephemeralMemory || false,
                flowState: node.data?.flowState || [],
                persistState: node.data?.persistState || false,
                triggerType: node.data?.triggerType || 'manual'
              };
              break;
              
            default:
              // Generic configuration for other node types
              specificConfiguration = {
                logicType: 'condition',
                conditions: []
              };
          }

          return {
            ...node,
            data: {
              ...node.data,
              // Preserve category system integration
              type_key: node.data?.type_key || node.type,
              category: node.data?.category,
              personalized: node.data?.personalized || true,
              // Apply comprehensive configuration structure
              configuration: {
                ...baseConfiguration,
                ...specificConfiguration
              },
              // Connect to unified AI assist system
              unified_ai_generated: true,
              generation_source: 'unified_ai_assist'
            }
          };
        });

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
                <AdvancedReactFlowWrapper
                  initialNodes={nodes}
                  initialEdges={edges}
                  onSave={(workflow) => {
                    setNodes(workflow.nodes);
                    setEdges(workflow.edges);
                  }}
                  workflowType="visual"
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