import React, { useState, useCallback, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  ArrowUpDown, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Brain,
  Eye,
  Database
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ConnectorType {
  id: string;
  name: string;
  type: 'ai_model' | 'api' | 'database' | 'service';
  provider?: string;
  capabilities: string[];
  performance: {
    speed: number;
    accuracy: number;
    cost: number;
  };
  compatible_with: string[];
  requirements: {
    api_key?: boolean;
    subscription?: boolean;
    rate_limits?: string;
  };
}

interface SwapRecommendation {
  id: string;
  fromConnector: string;
  toConnector: string;
  reason: string;
  impact: {
    performance: number;
    cost: number;
    complexity: number;
  };
  confidence: number;
  category: 'upgrade' | 'cost_optimization' | 'feature_enhancement' | 'compatibility';
}

interface ConnectorSwapManagerProps {
  node: Node;
  onNodeUpdate: (nodeId: string, updates: any) => void;
}

export const ConnectorSwapManager: React.FC<ConnectorSwapManagerProps> = ({
  node,
  onNodeUpdate
}) => {
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [availableConnectors, setAvailableConnectors] = useState<ConnectorType[]>([]);
  const [currentConnectors, setCurrentConnectors] = useState<string[]>((node.data?.connectors as string[]) || []);
  const [swapRecommendations, setSwapRecommendations] = useState<SwapRecommendation[]>([]);
  const [selectedSwap, setSelectedSwap] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Initialize with sample connectors (in real implementation, fetch from API)
  useEffect(() => {
    const sampleConnectors: ConnectorType[] = [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        type: 'ai_model',
        provider: 'OpenAI',
        capabilities: ['text', 'conversation', 'reasoning'],
        performance: { speed: 85, accuracy: 80, cost: 90 },
        compatible_with: ['healthcare', 'general', 'customer-service'],
        requirements: { api_key: true, rate_limits: '10K RPM' }
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        type: 'ai_model',
        provider: 'OpenAI',
        capabilities: ['text', 'conversation', 'reasoning', 'vision', 'multimodal'],
        performance: { speed: 70, accuracy: 95, cost: 40 },
        compatible_with: ['healthcare', 'general', 'customer-service', 'medical-imaging'],
        requirements: { api_key: true, subscription: true, rate_limits: '5K RPM' }
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        type: 'ai_model',
        provider: 'Anthropic',
        capabilities: ['text', 'reasoning', 'analysis', 'coding'],
        performance: { speed: 75, accuracy: 90, cost: 60 },
        compatible_with: ['healthcare', 'general', 'analysis'],
        requirements: { api_key: true, rate_limits: '8K RPM' }
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        type: 'ai_model',
        provider: 'Google',
        capabilities: ['text', 'conversation', 'multimodal', 'vision'],
        performance: { speed: 80, accuracy: 85, cost: 70 },
        compatible_with: ['healthcare', 'general', 'multimodal'],
        requirements: { api_key: true, rate_limits: '15K RPM' }
      },
      {
        id: 'ehr-connector',
        name: 'EHR Integration',
        type: 'api',
        capabilities: ['patient-data', 'medical-records', 'scheduling'],
        performance: { speed: 60, accuracy: 95, cost: 80 },
        compatible_with: ['healthcare', 'patient-care'],
        requirements: { api_key: true, subscription: true }
      },
      {
        id: 'fhir-connector',
        name: 'FHIR API',
        type: 'api',
        capabilities: ['healthcare-standards', 'interoperability', 'patient-data'],
        performance: { speed: 70, accuracy: 90, cost: 85 },
        compatible_with: ['healthcare', 'compliance'],
        requirements: { api_key: true }
      }
    ];
    
    setAvailableConnectors(sampleConnectors);
  }, []);

  // Analyze current connectors and generate recommendations
  const analyzeConnectors = useCallback(() => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const recommendations: SwapRecommendation[] = [];
      
      // Check for upgrades based on node type and capabilities
      if (node.type?.includes('agent')) {
        // If using basic model but has vision requirements
        if (currentConnectors.includes('gpt-4o-mini') && (node.data?.capabilities as string[])?.includes('vision')) {
          recommendations.push({
            id: 'upgrade-vision',
            fromConnector: 'gpt-4o-mini',
            toConnector: 'gpt-4o',
            reason: 'Node requires vision capabilities for image processing',
            impact: { performance: 15, cost: -50, complexity: 5 },
            confidence: 0.9,
            category: 'feature_enhancement'
          });
        }

        // If handling complex healthcare scenarios
        if ((node.data?.categories as string[])?.includes('healthcare') && !currentConnectors.includes('claude-3-5-sonnet')) {
          recommendations.push({
            id: 'healthcare-optimization',
            fromConnector: currentConnectors[0] || 'gpt-4o-mini',
            toConnector: 'claude-3-5-sonnet',
            reason: 'Claude excels at medical reasoning and analysis tasks',
            impact: { performance: 10, cost: -10, complexity: 2 },
            confidence: 0.8,
            category: 'upgrade'
          });
        }

        // Cost optimization recommendations
        if (currentConnectors.includes('gpt-4o') && !(node.data?.capabilities as string[])?.includes('vision')) {
          recommendations.push({
            id: 'cost-optimize',
            fromConnector: 'gpt-4o',
            toConnector: 'gpt-4o-mini',
            reason: 'No vision capabilities needed, save costs with mini model',
            impact: { performance: -5, cost: 50, complexity: -2 },
            confidence: 0.75,
            category: 'cost_optimization'
          });
        }
      }

      // Healthcare-specific connector recommendations
      if ((node.data?.categories as string[])?.includes('healthcare') || (node.data?.use_case as string)?.includes('patient')) {
        if (!currentConnectors.includes('ehr-connector')) {
          recommendations.push({
            id: 'add-ehr',
            fromConnector: '',
            toConnector: 'ehr-connector',
            reason: 'Healthcare workflows benefit from EHR integration',
            impact: { performance: 20, cost: -15, complexity: 10 },
            confidence: 0.85,
            category: 'feature_enhancement'
          });
        }
      }

      setSwapRecommendations(recommendations);
      setIsAnalyzing(false);
    }, 1500);
  }, [node, currentConnectors]);

  // Apply connector swap
  const applySwap = useCallback((recommendation: SwapRecommendation) => {
    const updatedConnectors = [...currentConnectors];
    
    if (recommendation.fromConnector) {
      // Replace existing connector
      const index = updatedConnectors.indexOf(recommendation.fromConnector);
      if (index !== -1) {
        updatedConnectors[index] = recommendation.toConnector;
      }
    } else {
      // Add new connector
      updatedConnectors.push(recommendation.toConnector);
    }
    
    setCurrentConnectors(updatedConnectors);
    
    // Update node data
    onNodeUpdate(node.id, {
      ...node.data,
      connectors: updatedConnectors,
      lastModified: new Date().toISOString()
    });

    // Remove applied recommendation
    setSwapRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
    
    showSuccess(`Applied connector swap: ${recommendation.toConnector}`);
    setShowConfirmDialog(false);
  }, [currentConnectors, node, onNodeUpdate, showSuccess]);

  const manualSwap = useCallback((fromConnector: string, toConnector: string) => {
    const updatedConnectors = currentConnectors.map(c => 
      c === fromConnector ? toConnector : c
    );
    
    setCurrentConnectors(updatedConnectors);
    onNodeUpdate(node.id, {
      ...node.data,
      connectors: updatedConnectors
    });
    
    showSuccess(`Swapped ${fromConnector} → ${toConnector}`);
  }, [currentConnectors, node, onNodeUpdate, showSuccess]);

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Connector Management
          <Badge variant="outline" className="ml-auto">
            {currentConnectors.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              Recommendations
              {swapRecommendations.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {swapRecommendations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Swap</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Active Connectors</h4>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={analyzeConnectors}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>

              {currentConnectors.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    No connectors configured for this node
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {currentConnectors.map(connectorId => {
                    const connector = availableConnectors.find(c => c.id === connectorId);
                    return (
                      <Card key={connectorId}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {connector?.type === 'ai_model' && <Brain className="h-4 w-4 text-blue-600" />}
                                {connector?.type === 'api' && <Zap className="h-4 w-4 text-green-600" />}
                                {connector?.type === 'database' && <Database className="h-4 w-4 text-purple-600" />}
                                <span className="font-medium">{connector?.name || connectorId}</span>
                                {connector?.provider && (
                                  <Badge variant="outline" className="text-xs">
                                    {connector.provider}
                                  </Badge>
                                )}
                              </div>
                              
                              {connector && (
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Speed:</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={connector.performance.speed} className="w-16 h-2" />
                                      <span className={getPerformanceColor(connector.performance.speed)}>
                                        {connector.performance.speed}%
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <span className="text-muted-foreground">Accuracy:</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={connector.performance.accuracy} className="w-16 h-2" />
                                      <span className={getPerformanceColor(connector.performance.accuracy)}>
                                        {connector.performance.accuracy}%
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <span className="text-muted-foreground">Cost Efficiency:</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={connector.performance.cost} className="w-16 h-2" />
                                      <span className={getPerformanceColor(connector.performance.cost)}>
                                        {connector.performance.cost}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">AI Recommendations</h4>
              <Button 
                size="sm" 
                variant="outline"
                onClick={analyzeConnectors}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Refresh'}
              </Button>
            </div>

            {swapRecommendations.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isAnalyzing ? 'Analyzing connectors...' : 'No recommendations available. Click "Analyze" to get suggestions.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {swapRecommendations.map(recommendation => (
                  <Card key={recommendation.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {recommendation.category === 'upgrade' && <ArrowUpDown className="h-4 w-4 text-blue-600" />}
                              {recommendation.category === 'cost_optimization' && <Zap className="h-4 w-4 text-green-600" />}
                              {recommendation.category === 'feature_enhancement' && <Sparkles className="h-4 w-4 text-purple-600" />}
                              {recommendation.category === 'compatibility' && <CheckCircle className="h-4 w-4 text-orange-600" />}
                              <span className="font-medium capitalize">{recommendation.category.replace('_', ' ')}</span>
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-2">
                              {recommendation.fromConnector ? (
                                <>Replace <Badge variant="outline" className="mx-1 text-xs">{recommendation.fromConnector}</Badge> with <Badge variant="outline" className="mx-1 text-xs">{recommendation.toConnector}</Badge></>
                              ) : (
                                <>Add <Badge variant="outline" className="mx-1 text-xs">{recommendation.toConnector}</Badge></>
                              )}
                            </div>
                            
                            <p className="text-sm">{recommendation.reason}</p>
                          </div>
                          
                          <Badge variant="outline">
                            {Math.round(recommendation.confidence * 100)}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div className="flex justify-between">
                            <span>Performance:</span>
                            <span className={getImpactColor(recommendation.impact.performance)}>
                              {recommendation.impact.performance > 0 ? '+' : ''}{recommendation.impact.performance}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <span className={getImpactColor(recommendation.impact.cost)}>
                              {recommendation.impact.cost > 0 ? '+' : ''}{recommendation.impact.cost}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Complexity:</span>
                            <span className={getImpactColor(recommendation.impact.complexity)}>
                              {recommendation.impact.complexity > 0 ? '+' : ''}{recommendation.impact.complexity}%
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <Progress value={recommendation.confidence * 100} className="w-20 h-2" />
                          
                          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedSwap(recommendation.id)}>
                                Apply Swap
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Connector Swap</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>Are you sure you want to apply this connector swap?</p>
                                <div className="p-4 bg-muted rounded-lg">
                                  <p className="text-sm"><strong>Action:</strong> {recommendation.reason}</p>
                                  <p className="text-sm"><strong>Impact:</strong> Performance {recommendation.impact.performance > 0 ? '+' : ''}{recommendation.impact.performance}%, Cost {recommendation.impact.cost > 0 ? '+' : ''}{recommendation.impact.cost}%</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={() => applySwap(recommendation)} className="flex-1">
                                    Confirm
                                  </Button>
                                  <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Manual Connector Swap</h4>
              <div className="space-y-4">
                {currentConnectors.map((connector, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Badge variant="outline">{connector}</Badge>
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <Select onValueChange={(value) => manualSwap(connector, value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select replacement" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableConnectors
                          .filter(c => c.id !== connector)
                          .map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                
                {currentConnectors.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No connectors to swap
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConnectorSwapManager;