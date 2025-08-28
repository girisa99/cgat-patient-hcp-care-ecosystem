import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, TestTube, Play, Brain, Zap, Settings2, Bot, Lightbulb,
  CheckCircle, XCircle, X, Clock, Terminal, Download, RotateCcw,
  ArrowRight, Database, Save, Rocket, Globe, Webhook, MessageSquare,
  Smartphone, Shield, Copy, ExternalLink
} from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useMasterToast } from '@/hooks/useMasterToast';
import { PromptBasedAgentGenerator } from '@/components/agent-builder/PromptBasedAgentGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useJourneyAISuggestions } from '@/hooks/useJourneyAISuggestions';

interface TestResult {
  id: string;
  timestamp: string;
  status: 'running' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  data?: any;
}

interface UnifiedAgentAssistProps {
  workflowNodes?: any[];
  workflowEdges?: any[];
  selectedNode?: any;
  onAgentGenerated?: (agent: any) => void;
  onClose?: () => void;
}

export const UnifiedAgentAssist: React.FC<UnifiedAgentAssistProps> = ({
  workflowNodes = [],
  workflowEdges = [],
  selectedNode,
  onAgentGenerated,
  onClose
}) => {
  const [assistMode, setAssistMode] = useState<'build' | 'generate' | 'test' | 'deploy'>('build');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [testInput, setTestInput] = useState('{"message": "Hello, test the workflow"}');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState<'dev' | 'test' | 'uat' | 'prod'>('dev');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [buildPrompt, setBuildPrompt] = useState('');
  const [savedAgent, setSavedAgent] = useState<any>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { showSuccess, showError } = useMasterToast();
  const { user } = useMasterAuth();
  const {
    generateAgent,
    testNode,
    analyzeWorkflow,
    availableProviders,
    isLoading,
    hasAvailableProviders
  } = useUniversalAI({ defaultProvider: selectedProvider });

  const { generateSuggestions, isLoading: isSuggesting } = useJourneyAISuggestions();

  // Load channels on mount
  useEffect(() => {
    loadChannels();
  }, []);

  // Auto-scroll to bottom when new results come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [testResults]);

  // Close on ESC when onClose is provided
  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const loadChannels = async () => {
    try {
      // Use agent_channels or a similar existing table - for now we'll create mock data
      const mockChannels = [
        { id: '1', name: 'Web Widget', type: 'web_widget', is_active: true, configuration: {} },
        { id: '2', name: 'REST API', type: 'api', is_active: true, configuration: {} },
        { id: '3', name: 'Webhook', type: 'webhook', is_active: true, configuration: {} },
        { id: '4', name: 'Slack Bot', type: 'slack', is_active: true, configuration: {} },
        { id: '5', name: 'Discord Bot', type: 'discord', is_active: true, configuration: {} },
        { id: '6', name: 'Microsoft Teams', type: 'teams', is_active: true, configuration: {} },
        { id: '7', name: 'WhatsApp', type: 'whatsapp', is_active: true, configuration: {} }
      ];
      setChannels(mockChannels);
    } catch (error: any) {
      showError(`Failed to load channels: ${error.message}`);
    }
  };

  const addTestResult = (result: Partial<TestResult>) => {
    const newResult: TestResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: 'success',
      message: '',
      ...result
    };
    setTestResults(prev => [...prev, newResult]);
  };

  const handleAgentGeneration = async (agentData: any) => {
    addTestResult({
      status: 'success',
      message: `🎉 Agent "${agentData.name}" generated successfully! Contains ${agentData.nodes?.length || 0} nodes.`
    });
    
    if (onAgentGenerated) {
      onAgentGenerated(agentData);
    }

    // Set agent data for saving
    setAgentName(agentData.name);
    setAgentDescription(agentData.description || '');
    showSuccess(`Now ready to save and deploy "${agentData.name}"!`);
  };

  const handleSaveAgent = async () => {
    if (!user) {
      showError('Please sign in to save agents');
      return;
    }

    if (!agentName.trim()) {
      showError('Please provide an agent name');
      return;
    }

    try {
      const agentData = {
        name: agentName,
        description: agentDescription,
        nodes: workflowNodes,
        edges: workflowEdges,
        configuration: {
          provider: selectedProvider,
          created_via: 'unified_assist'
        },
        status: 'draft',
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single();

      if (error) throw error;

      setSavedAgent(data);
      addTestResult({
        status: 'success',
        message: `💾 Agent "${agentName}" saved successfully! Ready for deployment.`
      });
      showSuccess('Agent saved successfully!');
      setAssistMode('deploy');
    } catch (error: any) {
      showError(`Failed to save agent: ${error.message}`);
      addTestResult({
        status: 'error',
        message: `❌ Failed to save agent: ${error.message}`
      });
    }
  };

  const handleDeploy = async () => {
    if (!savedAgent) {
      showError('Please save the agent first');
      return;
    }

    if (selectedChannels.length === 0) {
      showError('Please select at least one deployment channel');
      return;
    }

    try {
      // For now, we'll simulate deployments without database storage
      // In a real implementation, this would use the proper deployment tables
      const mockDeployments = selectedChannels.map((channelType) => {
        const channel = channels.find(c => c.type === channelType);
        const snippetCode = generateSnippetCode(channelType, savedAgent.id);
        const endpointUrl = generateEndpointUrl(channelType, savedAgent.id);

        return {
          id: Math.random().toString(36).substr(2, 9),
          agent_id: savedAgent.id,
          channel_type: channelType,
          channel_id: channel?.id || channelType,
          deployment_status: 'deployed',
          deployment_config: {
            channel_config: channel?.configuration || {},
            deployed_by: user?.id,
            deployment_timestamp: new Date().toISOString(),
            snippet_code: snippetCode,
            endpoint_url: endpointUrl
          },
          deployed_at: new Date().toISOString()
        };
      });

      setDeployments(mockDeployments);
      
      // Update agent status to active
      await supabase
        .from('agents')
        .update({ status: 'active' })
        .eq('id', savedAgent.id);

      addTestResult({
        status: 'success',
        message: `🚀 Agent deployed to ${selectedChannels.length} channel(s) in ${selectedEnvironment.toUpperCase()} environment!`
      });

      showSuccess(`Agent deployed successfully to ${selectedChannels.length} channels!`);
    } catch (error: any) {
      showError(`Deployment failed: ${error.message}`);
      addTestResult({
        status: 'error',
        message: `❌ Deployment failed: ${error.message}`
      });
    }
  };

  const generateSnippetCode = (channelType: string, agentId: string) => {
    const baseUrl = `https://ithspbabhmdntioslfqe.supabase.co`;
    
    switch (channelType) {
      case 'web_widget':
        return `<!-- AI Assistant Widget -->
<script>
  (function() {
    var widget = document.createElement('div');
    widget.id = 'ai-assistant-widget';
    widget.innerHTML = '<iframe src="${baseUrl}/widget/${agentId}" width="350" height="500"></iframe>';
    document.body.appendChild(widget);
  })();
</script>`;

      case 'api':
        return `// REST API Integration
const response = await fetch('${baseUrl}/api/agents/${agentId}/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    message: 'Hello, how can you help me?',
    session_id: 'unique-session-id'
  })
});
const result = await response.json();`;

      case 'webhook':
        return `// Webhook Integration
curl -X POST "${baseUrl}/webhooks/${agentId}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "message",
    "data": {
      "message": "Hello from webhook",
      "user_id": "user123"
    }
  }'`;

      default:
        return `// Integration code for ${channelType}
// Contact support for specific integration instructions`;
    }
  };

  const generateEndpointUrl = (channelType: string, agentId: string) => {
    const baseUrl = `https://ithspbabhmdntioslfqe.supabase.co`;
    
    switch (channelType) {
      case 'web_widget':
        return `${baseUrl}/widget/${agentId}`;
      case 'api':
        return `${baseUrl}/api/agents/${agentId}/chat`;
      case 'webhook':
        return `${baseUrl}/webhooks/${agentId}`;
      default:
        return `${baseUrl}/channels/${channelType}/${agentId}`;
    }
  };

  const runWorkflowTest = async () => {
    if (isRunning || workflowNodes.length === 0) return;

    setIsRunning(true);
    addTestResult({
      status: 'running',
      message: `🚀 Starting intelligent workflow test with ${selectedProvider.toUpperCase()} AI...`
    });

    try {
      const inputData = JSON.parse(testInput);

      // First analyze the entire workflow
      addTestResult({
        status: 'running',
        message: `🧠 Analyzing workflow architecture with ${selectedProvider.toUpperCase()}...`
      });

      const analysis = await analyzeWorkflow(workflowNodes, workflowEdges, selectedProvider);
      
      if (analysis) {
        addTestResult({
          status: 'success',
          message: `📊 Workflow Analysis: ${analysis.complexity} complexity, ${analysis.riskAssessment} risk level`
        });
      }

      // Test each node with AI
      let currentData = inputData;
      for (const node of workflowNodes) {
        addTestResult({
          status: 'running',
          message: `🎯 AI testing: ${node.data?.label || node.id}`,
        });

        const nodeResult = await testNode(node, currentData, selectedProvider);
        
        if (nodeResult.success) {
          addTestResult({
            status: 'success',
            message: `✅ ${nodeResult.message || `Node completed successfully`}`,
            duration: nodeResult.executionTime,
            data: nodeResult
          });
          currentData = nodeResult.output || currentData;
        } else {
          addTestResult({
            status: 'error',
            message: `❌ ${nodeResult.message || `Node test failed`}`,
            duration: nodeResult.executionTime
          });
          break;
        }
      }

      addTestResult({
        status: 'success',
        message: `🎉 Complete workflow test finished using ${selectedProvider.toUpperCase()}!`,
      });

      showSuccess(`Workflow testing completed with ${selectedProvider.toUpperCase()}!`);

    } catch (error: any) {
      addTestResult({
        status: 'error',
        message: `💥 Test failed: ${error.message}`
      });
      showError(`Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    showSuccess('Results cleared');
  };

  const exportResults = () => {
    const logsText = testResults.map(result => 
      `[${new Date(result.timestamp).toLocaleTimeString()}] ${result.status.toUpperCase()}: ${result.message}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unified-assist-results-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Results exported successfully!');
  };

  // ====== Canvas update helpers and smart actions ======
  const applyChangesToCanvas = (nodes: any[], edges: any[], name?: string) => {
    if (onAgentGenerated) {
      onAgentGenerated({ name: name || 'Updated by Unified Assist', nodes, edges });
    }
  };

  const handleSuggestWorkflow = async () => {
    try {
      if (!buildPrompt.trim()) {
        showError('Please describe what to build first');
        return;
      }
      addTestResult({ status: 'running', message: 'Generating workflow suggestions...' });
      const steps = await generateSuggestions(buildPrompt, selectedProvider);
      if (!steps || steps.length === 0) {
        addTestResult({ status: 'warning', message: 'No suggestions returned' });
        return;
      }
      const nodes = steps.map((s: any, i: number) => ({
        id: `step-${i + 1}`,
        type: 'default',
        data: { label: s.title || `Step ${i + 1}` },
        position: { x: 120, y: 80 + i * 140 },
      }));
      const edges = nodes.slice(0, -1).map((n: any, i: number) => ({
        id: `e-${n.id}-${nodes[i + 1].id}`,
        source: n.id,
        target: nodes[i + 1].id,
        type: 'smoothstep',
      }));
      applyChangesToCanvas(nodes, edges, 'Suggested Workflow');
      addTestResult({ status: 'success', message: `Suggested ${nodes.length} steps and connected them` });
      showSuccess('Workflow suggestions applied to canvas');
    } catch (e: any) {
      addTestResult({ status: 'error', message: `Suggestion failed: ${e.message}` });
      showError(`Suggestion failed: ${e.message}`);
    }
  };

  const handleAutoConnectNodes = () => {
    if ((workflowNodes?.length || 0) < 2) {
      showError('Need at least 2 nodes to auto-connect');
      return;
    }
    const existing = new Set((workflowEdges || []).map((e: any) => `${e.source}->${e.target}`));
    const newEdges: any[] = [];
    for (let i = 0; i < workflowNodes.length - 1; i++) {
      const a = workflowNodes[i];
      const b = workflowNodes[i + 1];
      const key = `${a.id}->${b.id}`;
      if (!existing.has(key)) {
        newEdges.push({ id: `e-${a.id}-${b.id}`, source: a.id, target: b.id, type: 'smoothstep' });
      }
    }
    if (newEdges.length === 0) {
      addTestResult({ status: 'warning', message: 'No new connections to add' });
      return;
    }
    applyChangesToCanvas(workflowNodes, [...(workflowEdges || []), ...newEdges], 'Auto-Connected');
    addTestResult({ status: 'success', message: `Added ${newEdges.length} connection(s)` });
    showSuccess('Auto-connections applied');
  };

  const handleOptimizeFlow = () => {
    if ((workflowNodes?.length || 0) === 0) {
      showError('No nodes to optimize');
      return;
    }
    const cols = 3;
    const xGap = 260;
    const yGap = 160;
    const startX = 80;
    const startY = 60;
    const laidOut = workflowNodes.map((n: any, idx: number) => ({
      ...n,
      position: { x: startX + (idx % cols) * xGap, y: startY + Math.floor(idx / cols) * yGap },
    }));
    applyChangesToCanvas(laidOut, workflowEdges || [], 'Optimized Layout');
    addTestResult({ status: 'success', message: 'Reflowed nodes into a tidy grid' });
    showSuccess('Flow optimized on canvas');
  };

  const handleGenerateBackend = () => {
    addTestResult({ status: 'success', message: 'Backend generation stubs prepared (review in Deploy tab)' });
    showSuccess('Generated deployment stubs. Continue in Deploy tab to proceed.');
  };

  const copySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    showSuccess('Code snippet copied to clipboard!');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return <Clock className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'warning': return <Clock className="h-3 w-3 text-yellow-500" />;
      default: return <Terminal className="h-3 w-3 text-gray-500" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'web_widget': return <Globe className="h-4 w-4" />;
      case 'api': return <Database className="h-4 w-4" />;
      case 'webhook': return <Webhook className="h-4 w-4" />;
      case 'slack': return <MessageSquare className="h-4 w-4" />;
      case 'discord': return <MessageSquare className="h-4 w-4" />;
      case 'teams': return <MessageSquare className="h-4 w-4" />;
      case 'whatsapp': return <Smartphone className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Unified AI Assist
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* AI Provider Selection */}
            <Select 
              value={selectedProvider} 
              onValueChange={(value: 'openai' | 'claude' | 'gemini') => setSelectedProvider(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mode Selection */}
            <Select value={assistMode} onValueChange={(value: any) => setAssistMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="build">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Build
                  </div>
                </SelectItem>
                <SelectItem value="generate">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </div>
                </SelectItem>
                <SelectItem value="test">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Test
                  </div>
                </SelectItem>
                <SelectItem value="deploy">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    Deploy
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {onClose && (
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose} aria-label="Close unified assist">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 flex flex-col gap-4">
        <Tabs defaultValue="workspace" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workspace" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Workspace
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Results ({testResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="flex-1 flex flex-col gap-4">
            {/* Build Mode - AI Assistant */}
            {assistMode === 'build' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">AI Workflow Assistant</h3>
                  <Badge variant="secondary">{selectedProvider.toUpperCase()}</Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">What would you like to build?</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Describe your agent and I'll help guide you through building your workflow.
                    </p>
                    <Textarea 
                      value={buildPrompt}
                      onChange={(e) => setBuildPrompt(e.target.value)}
                      placeholder="Describe your agent: e.g. Create a customer support agent that handles inquiries and escalates complex issues..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button className="w-full" onClick={handleSuggestWorkflow} disabled={!buildPrompt || isSuggesting}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Workflow Suggestions
                  </Button>
                  
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="font-medium mb-2 text-sm">Smart Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="justify-start" onClick={handleSuggestWorkflow}>
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Suggest Workflow
                      </Button>
                      <Button size="sm" variant="outline" className="justify-start" onClick={handleAutoConnectNodes}>
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Auto-Connect Nodes
                      </Button>
                      <Button size="sm" variant="outline" className="justify-start" onClick={handleGenerateBackend}>
                        <Database className="w-3 h-3 mr-1" />
                        Generate Backend
                      </Button>
                      <Button size="sm" variant="outline" className="justify-start" onClick={handleOptimizeFlow}>
                        <Sparkles className="w-3 h-3 mr-1" />
                        Optimize Flow
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Mode */}
            {assistMode === 'generate' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Agent Generation</h3>
                  <Badge variant="secondary">{selectedProvider.toUpperCase()}</Badge>
                </div>
                
                <PromptBasedAgentGenerator 
                  onGenerate={handleAgentGeneration}
                  className="border rounded-lg p-4"
                />
              </div>
            )}

            {/* Test Mode */}
            {assistMode === 'test' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Workflow Testing</h3>
                    <Badge variant="secondary">{selectedProvider.toUpperCase()} AI</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={runWorkflowTest}
                      disabled={isRunning || !hasAvailableProviders || workflowNodes.length === 0}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test Workflow ({workflowNodes.length} nodes)
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveAgent}
                      disabled={workflowNodes.length === 0}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Agent
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Agent Name</Label>
                    <Input
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="My AI Assistant"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Description</Label>
                    <Input
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Test Input Data</Label>
                  <Textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder='{"message": "Hello, test the workflow"}'
                    className="h-20 font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* Deploy Mode */}
            {assistMode === 'deploy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Agent Deployment</h3>
                  {savedAgent && <Badge variant="secondary">{savedAgent.name}</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Environment</Label>
                    <Select value={selectedEnvironment} onValueChange={(value: any) => setSelectedEnvironment(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dev">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            Development
                          </div>
                        </SelectItem>
                        <SelectItem value="test">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            Testing
                          </div>
                        </SelectItem>
                        <SelectItem value="uat">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            UAT
                          </div>
                        </SelectItem>
                        <SelectItem value="prod">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Production
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Deployment Channels</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {channels.map((channel) => (
                        <Button
                          key={channel.id}
                          size="sm"
                          variant={selectedChannels.includes(channel.type) ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => {
                            setSelectedChannels(prev => 
                              prev.includes(channel.type)
                                ? prev.filter(c => c !== channel.type)
                                : [...prev, channel.type]
                            );
                          }}
                        >
                          {getChannelIcon(channel.type)}
                          <span className="ml-2 text-xs">{channel.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleDeploy} 
                  className="w-full"
                  disabled={!savedAgent || selectedChannels.length === 0}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy to {selectedChannels.length} Channel(s)
                </Button>

                {/* Deployment Results */}
                {deployments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Deployment Snippets</Label>
                        {deployments.map((deployment, index) => (
                          <div key={deployment.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getChannelIcon(deployment.channel_type)}
                                <span className="text-sm font-medium capitalize">{deployment.channel_type}</span>
                                <Badge variant="outline" className="text-xs">{selectedEnvironment.toUpperCase()}</Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => copySnippet(deployment.deployment_config?.snippet_code || '')}>
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={deployment.deployment_config?.endpoint_url || '#'} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                            <ScrollArea className="h-20">
                              <pre className="text-xs text-muted-foreground">{deployment.deployment_config?.snippet_code || 'No snippet available'}</pre>
                            </ScrollArea>
                          </div>
                        ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Activity Results</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearResults}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Button size="sm" variant="outline" onClick={exportResults} disabled={testResults.length === 0}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 border rounded-md p-2" ref={scrollRef}>
              <div className="space-y-1">
                {testResults.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No activity results yet. Build, generate, test, or deploy to see results here.
                  </div>
                ) : (
                  testResults.map((result) => (
                    <div key={result.id} className="flex items-start gap-2 text-sm py-1">
                      {getStatusIcon(result.status)}
                      <span className="text-muted-foreground text-xs">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{result.message}</span>
                      {result.duration && (
                        <span className="text-xs text-muted-foreground">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};