import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Lightbulb, 
  Zap, 
  Target, 
  AlertTriangle,
  CheckCircle, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Settings,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useIntelligentWorkflowBuilder } from '@/hooks/useIntelligentWorkflowBuilder';
import { useMasterToast } from '@/hooks/useMasterToast';

interface IntelligentWorkflowAssistantProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onSuggestionApply?: (suggestion: any) => void;
  scenario?: string;
}

export const IntelligentWorkflowAssistant: React.FC<IntelligentWorkflowAssistantProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onSuggestionApply,
  scenario
}) => {
  const { showSuccess, showInfo } = useMasterToast();
  const {
    suggestions,
    useCaseAnalysis,
    isAnalyzing,
    isOptimizing,
    analyzeUseCase,
    getIntelligentNodeSuggestions,
    analyzeNodeCompatibility,
    generateOptimalConnections,
    suggestConnectorSwaps,
    optimizeWorkflow,
    applySuggestion
  } = useIntelligentWorkflowBuilder();

  const [useCaseInput, setUseCaseInput] = useState(scenario || '');
  const [selectedNodeForConnectors, setSelectedNodeForConnectors] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [autoAnalyzeEnabled, setAutoAnalyzeEnabled] = useState(true);

  // Auto-analyze when nodes change
  useEffect(() => {
    if (autoAnalyzeEnabled && nodes.length > 0 && useCaseInput) {
      const timeoutId = setTimeout(() => {
        analyzeUseCase(useCaseInput, nodes, edges);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, useCaseInput, autoAnalyzeEnabled, analyzeUseCase]);

  const handleAnalyzeUseCase = useCallback(async () => {
    if (!useCaseInput.trim()) {
      showInfo('Please describe your use case first');
      return;
    }
    await analyzeUseCase(useCaseInput, nodes, edges);
  }, [useCaseInput, nodes, edges, analyzeUseCase, showInfo]);

  const handleGenerateConnections = useCallback(() => {
    const optimalConnections = generateOptimalConnections(nodes, useCaseInput);
    
    // Convert to edges and add to workflow
    const newEdges = optimalConnections.map(conn => ({
      id: `edge-${conn.source}-${conn.target}`,
      source: conn.source,
      target: conn.target,
      type: 'smoothstep',
      animated: true,
      data: { 
        confidence: conn.confidence,
        reason: conn.reason,
        aiGenerated: true
      },
      style: { 
        stroke: conn.confidence > 0.8 ? '#10b981' : '#f59e0b',
        strokeWidth: 2
      }
    }));

    onEdgesChange([...edges, ...newEdges]);
    showSuccess(`Generated ${newEdges.length} intelligent connections`);
  }, [nodes, edges, useCaseInput, generateOptimalConnections, onEdgesChange, showSuccess]);

  const handleOptimizeWorkflow = useCallback(async () => {
    const optimizations = await optimizeWorkflow(nodes, edges);
    if (optimizations && optimizations.length > 0) {
      setActiveTab('suggestions');
    }
  }, [nodes, edges, optimizeWorkflow]);

  const handleApplySuggestion = useCallback((suggestion: any) => {
    applySuggestion(suggestion, nodes, onNodesChange);
    onSuggestionApply?.(suggestion);
  }, [applySuggestion, nodes, onNodesChange, onSuggestionApply]);

  const handleNodeConnectorAnalysis = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNodeForConnectors(node);
      const swapSuggestions = suggestConnectorSwaps(node, []);
      // Suggestions are automatically added to the suggestions state
      setActiveTab('connectors');
    }
  }, [nodes, suggestConnectorSwaps]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          Intelligent Workflow Assistant
          {isAnalyzing && <RefreshCw className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggestions
              {suggestions.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {suggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="connectors" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Connectors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Describe your workflow use case:</label>
                <Textarea
                  placeholder="e.g., Patient onboarding workflow with AI triage, automated scheduling, and provider coordination..."
                  value={useCaseInput}
                  onChange={(e) => setUseCaseInput(e.target.value)}
                  rows={3}
                  className="mt-2"
                  dir="ltr"
                  style={{ textAlign: 'left', direction: 'ltr' }}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAnalyzeUseCase} 
                  disabled={isAnalyzing || !useCaseInput.trim()}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Use Case
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleOptimizeWorkflow}
                  disabled={isOptimizing || nodes.length === 0}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Optimize
                </Button>
              </div>

              {useCaseAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Use Case Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Industry:</label>
                        <Badge variant="outline" className="ml-2">
                          {useCaseAnalysis.industry}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Complexity:</label>
                        <Badge 
                          variant={useCaseAnalysis.complexity === 'high' ? 'destructive' : 
                                   useCaseAnalysis.complexity === 'medium' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {useCaseAnalysis.complexity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                      <div>
                        <label className="text-sm font-medium">Required Node Types:</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {useCaseAnalysis.requiredNodeTypes?.map(nodeType => (
                            <Badge key={nodeType} variant="secondary" className="text-xs">
                              {nodeType}
                            </Badge>
                          )) || []}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Business Value:</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {useCaseAnalysis.businessValue || 'Not specified'}
                        </p>
                      </div>

                      {(useCaseAnalysis.riskFactors?.length || 0) > 0 && (
                        <div>
                          <label className="text-sm font-medium text-yellow-600">Risk Factors:</label>
                          <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                            {useCaseAnalysis.riskFactors?.map((risk, idx) => (
                              <li key={idx}>{risk}</li>
                            )) || []}
                          </ul>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">AI Suggestions</h3>
              <Badge variant="outline">
                {suggestions.length} suggestions
              </Badge>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {suggestions.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No suggestions available. Analyze your use case to get intelligent recommendations.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  suggestions.map(suggestion => (
                    <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {suggestion.type === 'node_addition' && <Sparkles className="h-4 w-4 text-blue-600" />}
                            {suggestion.type === 'connection' && <Zap className="h-4 w-4 text-green-600" />}
                            {suggestion.type === 'configuration' && <Settings className="h-4 w-4 text-orange-600" />}
                            {suggestion.type === 'optimization' && <TrendingUp className="h-4 w-4 text-purple-600" />}
                            <span className="font-medium">{suggestion.title}</span>
                          </div>
                          <Badge variant={getConfidenceBadge(suggestion.confidence)}>
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.description}
                        </p>
                        
                        <div className="text-xs text-muted-foreground mb-3 bg-muted p-2 rounded">
                          <strong>AI Reasoning:</strong> {suggestion.reasoning}
                        </div>

                        <div className="flex justify-between items-center">
                          <Progress 
                            value={suggestion.confidence * 100} 
                            className="w-24 h-2"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleApplySuggestion(suggestion)}
                          >
                            Apply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Smart Connections</h3>
                <Button onClick={handleGenerateConnections}>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Connections
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Connection Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {nodes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Add nodes to your workflow to analyze potential connections
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>Current Workflow:</strong> {nodes.length} nodes, {edges.length} connections
                      </div>
                      
                      {useCaseAnalysis?.suggestedConnections && (
                        <div>
                          <strong className="text-sm">Suggested Connections:</strong>
                          <div className="mt-2 space-y-2">
                            {useCaseAnalysis.suggestedConnections?.map((conn, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <ArrowRight className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{conn.from} → {conn.to}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(conn.confidence * 100)}%
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {conn.reason}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="connectors" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Connector Intelligence</h3>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Analyze All Nodes
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {nodes.map(node => (
                  <Card key={node.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                           <div className="font-medium">{(node.data as any)?.label || node.id}</div>
                           <div className="text-sm text-muted-foreground">
                             Type: {node.type} • Connectors: {(node.data as any)?.connectors?.length || 0}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleNodeConnectorAnalysis(node.id)}
                        >
                          Analyze
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedNodeForConnectors && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Connector Analysis: {(selectedNodeForConnectors.data as any)?.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>Current Connectors:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(selectedNodeForConnectors.data as any)?.connectors?.map((connector: string) => (
                            <Badge key={connector} variant="outline" className="text-xs">
                              {connector}
                            </Badge>
                          )) || <span className="text-muted-foreground">None configured</span>}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Node Capabilities:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(selectedNodeForConnectors.data as any)?.capabilities?.map((cap: string) => (
                            <Badge key={cap} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          )) || <span className="text-muted-foreground">None specified</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IntelligentWorkflowAssistant;