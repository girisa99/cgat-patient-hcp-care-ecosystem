import React, { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, 
  TrendingUp, 
  Zap, 
  Users, 
  Database,
  MessageSquare,
  Settings,
  Plus,
  ArrowRight,
  Brain,
  Target,
  CheckCircle
} from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';

interface NodeRecommendation {
  id: string;
  nodeType: string;
  displayName: string;
  category: string;
  reason: string;
  confidence: number;
  position: { x: number; y: number };
  connections: {
    sourceId?: string;
    targetId?: string;
  };
  icon: string;
  color: string;
  benefits: string[];
  aiPrompt?: string;
}

interface IntelligentNodeRecommendationsProps {
  nodes: Node[];
  edges: Edge[];
  onRecommendationAccept: (recommendation: NodeRecommendation) => void;
  onRecommendationGenerate: (prompt: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const IntelligentNodeRecommendations: React.FC<IntelligentNodeRecommendationsProps> = ({
  nodes,
  edges,
  onRecommendationAccept,
  onRecommendationGenerate,
  isVisible,
  onToggle
}) => {
  const { nodeTypes, categories } = useWorkflowNodes();
  const { showSuccess, showError } = useMasterToast();
  const [recommendations, setRecommendations] = useState<NodeRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<NodeRecommendation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // AI-powered workflow analysis for intelligent recommendations
  const analyzeWorkflowGaps = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      // Analyze current workflow structure
      const workflowAnalysis = {
        nodeTypes: nodes.map(n => ({ id: n.id, type: n.type, category: n.data?.category })),
        connections: edges.map(e => ({ source: e.source, target: e.target })),
        gaps: detectWorkflowGaps(nodes, edges),
        patterns: detectWorkflowPatterns(nodes, edges)
      };

      // Generate AI-powered recommendations
      const { data: aiRecommendations, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'analyze_workflow_gaps',
          workflow: workflowAnalysis,
          availableNodeTypes: nodeTypes.map(nt => ({
            type_key: nt.type_key,
            display_name: nt.display_name,
            category: nt.category?.name,
            capabilities: nt.capabilities,
            description: nt.description
          })),
          provider: 'openai'
        }
      });

      if (error) throw error;

      // Process AI recommendations with intelligent positioning
      const processedRecommendations = generateIntelligentRecommendations(
        workflowAnalysis,
        aiRecommendations?.recommendations || []
      );

      setRecommendations(processedRecommendations);
      showSuccess(`Generated ${processedRecommendations.length} intelligent recommendations`);
    } catch (error) {
      console.error('Workflow analysis error:', error);
      // Fallback to rule-based recommendations
      const fallbackRecommendations = generateRuleBasedRecommendations();
      setRecommendations(fallbackRecommendations);
      showSuccess(`Generated ${fallbackRecommendations.length} recommendations (fallback mode)`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodes, edges, nodeTypes, showSuccess, showError]);

  // Detect gaps in workflow (missing common patterns)
  const detectWorkflowGaps = (nodes: Node[], edges: Edge[]) => {
    const gaps = [];
    const nodeTypeSet = new Set(nodes.map(n => String(n.data?.category || '').toLowerCase()));
    
    // Common workflow patterns to check
    const patterns = [
      { name: 'error_handling', nodes: ['error', 'exception', 'fallback'] },
      { name: 'data_validation', nodes: ['validation', 'schema', 'check'] },
      { name: 'logging', nodes: ['log', 'audit', 'monitor'] },
      { name: 'authentication', nodes: ['auth', 'login', 'verify'] },
      { name: 'data_transformation', nodes: ['transform', 'map', 'filter'] }
    ];

    patterns.forEach(pattern => {
      const hasPattern = pattern.nodes.some(nodeType => 
        nodeTypeSet.has(nodeType) || 
        nodes.some(n => String(n.data?.type_key || '').toLowerCase().includes(nodeType))
      );
      if (!hasPattern) {
        gaps.push(pattern.name);
      }
    });

    return gaps;
  };

  // Detect existing workflow patterns
  const detectWorkflowPatterns = (nodes: Node[], edges: Edge[]) => {
    const patterns = [];
    
    // Sequential flow
    if (edges.length >= nodes.length - 1) {
      patterns.push('sequential');
    }
    
    // Branching
    const sourceCounts = new Map();
    edges.forEach(e => {
      sourceCounts.set(e.source, (sourceCounts.get(e.source) || 0) + 1);
    });
    if (Array.from(sourceCounts.values()).some(count => count > 1)) {
      patterns.push('branching');
    }
    
    // Multi-agent
    const agentNodes = nodes.filter(n => 
      String(n.data?.category || '').toLowerCase().includes('agent') ||
      String(n.data?.type_key || '').toLowerCase().includes('agent')
    );
    if (agentNodes.length > 1) {
      patterns.push('multi_agent');
    }

    return patterns;
  };

  // Generate intelligent recommendations based on AI analysis
  const generateIntelligentRecommendations = (analysis: any, aiSuggestions: any[]) => {
    const recommendations: NodeRecommendation[] = [];
    let positionX = Math.max(...nodes.map(n => n.position.x)) + 350;
    let positionY = 100;

    // Process AI suggestions
    aiSuggestions.forEach((suggestion, index) => {
      const nodeType = nodeTypes.find(nt => 
        nt.type_key === suggestion.nodeType || 
        nt.display_name.toLowerCase() === suggestion.nodeType.toLowerCase()
      );

      if (nodeType) {
        recommendations.push({
          id: `ai-rec-${index}`,
          nodeType: nodeType.type_key,
          displayName: nodeType.display_name,
          category: nodeType.category?.name || 'general',
          reason: suggestion.reason || 'AI-recommended enhancement',
          confidence: suggestion.confidence || 0.8,
          position: { x: positionX, y: positionY + (index * 120) },
          connections: {
            sourceId: suggestion.connectAfter,
            targetId: suggestion.connectBefore
          },
          icon: String(nodeType.icon || 'Circle'),
          color: String(nodeType.color || '#6b7280'),
          benefits: suggestion.benefits || ['Improves workflow efficiency'],
          aiPrompt: suggestion.prompt
        });
      }
    });

    return recommendations;
  };

  // Fallback rule-based recommendations
  const generateRuleBasedRecommendations = () => {
    const recommendations: NodeRecommendation[] = [];
    let positionX = Math.max(...nodes.map(n => n.position.x)) + 350;
    let positionY = 100;

    // Error handling recommendation
    const hasErrorHandling = nodes.some(n => 
      String(n.data?.type_key || '').toLowerCase().includes('error') ||
      String(n.data?.category || '').toLowerCase().includes('error')
    );

    if (!hasErrorHandling && nodes.length > 2) {
      const errorNodeType = nodeTypes.find(nt => 
        nt.type_key.includes('error') || nt.display_name.toLowerCase().includes('error')
      );
      
      if (errorNodeType) {
        recommendations.push({
          id: 'rule-error-handling',
          nodeType: errorNodeType.type_key,
          displayName: errorNodeType.display_name,
          category: errorNodeType.category?.name || 'error_handling',
          reason: 'Add error handling for robustness',
          confidence: 0.9,
          position: { x: positionX, y: positionY },
          connections: {},
          icon: String(errorNodeType.icon || 'AlertTriangle'),
          color: String(errorNodeType.color || '#ef4444'),
          benefits: ['Improves workflow reliability', 'Better error recovery', 'Enhanced user experience']
        });
        positionY += 120;
      }
    }

    // Logging recommendation
    const hasLogging = nodes.some(n => 
      String(n.data?.type_key || '').toLowerCase().includes('log') ||
      String(n.data?.type_key || '').toLowerCase().includes('audit')
    );

    if (!hasLogging && nodes.length > 1) {
      const logNodeType = nodeTypes.find(nt => 
        nt.type_key.includes('log') || nt.display_name.toLowerCase().includes('log')
      );
      
      if (logNodeType) {
        recommendations.push({
          id: 'rule-logging',
          nodeType: logNodeType.type_key,
          displayName: logNodeType.display_name,
          category: logNodeType.category?.name || 'monitoring',
          reason: 'Add logging for observability',
          confidence: 0.8,
          position: { x: positionX, y: positionY },
          connections: {},
          icon: String(logNodeType.icon || 'FileText'),
          color: String(logNodeType.color || '#10b981'),
          benefits: ['Better debugging', 'Audit trail', 'Performance monitoring']
        });
        positionY += 120;
      }
    }

    return recommendations;
  };

  // Auto-analyze when nodes change
  useEffect(() => {
    if (nodes.length > 0 && isVisible) {
      analyzeWorkflowGaps();
    }
  }, [nodes.length, isVisible, analyzeWorkflowGaps]);

  const handleAcceptRecommendation = (recommendation: NodeRecommendation) => {
    onRecommendationAccept(recommendation);
    setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
    showSuccess(`Added ${recommendation.displayName} to workflow`);
  };

  const handleGenerateWithAI = (recommendation: NodeRecommendation) => {
    const prompt = recommendation.aiPrompt || 
      `Add a ${recommendation.displayName} node to handle ${recommendation.reason.toLowerCase()}`;
    onRecommendationGenerate(prompt);
    setShowDetails(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Lightbulb, TrendingUp, Zap, Users, Database, MessageSquare, Settings,
      Plus, ArrowRight, Brain, Target, CheckCircle
    };
    return icons[iconName] || Settings;
  };

  if (!isVisible) {
    return (
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
        <Button
          onClick={onToggle}
          size="sm"
          className="rounded-full shadow-lg"
          title="Show Intelligent Recommendations"
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card className="fixed top-20 right-4 w-80 max-h-[70vh] shadow-xl z-40 bg-background/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              Smart Recommendations
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <Plus className="h-4 w-4 rotate-45" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-3 text-sm">Analyzing workflow...</span>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Your workflow looks great!</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={analyzeWorkflowGaps}
                    >
                      Re-analyze
                    </Button>
                  </div>
                ) : (
                  recommendations.map((rec) => {
                    const IconComponent = getIconComponent(rec.icon);
                    return (
                      <Card key={rec.id} className="border border-border/50 hover:border-primary/50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: rec.color }}
                            >
                              <IconComponent className="h-4 w-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">{rec.displayName}</h4>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getConfidenceColor(rec.confidence)}`}
                                >
                                  {Math.round(rec.confidence * 100)}%
                                </Badge>
                              </div>
                              
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {rec.reason}
                              </p>
                              
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  className="text-xs h-6"
                                  onClick={() => handleAcceptRecommendation(rec)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs h-6"
                                  onClick={() => {
                                    setSelectedRecommendation(rec);
                                    setShowDetails(true);
                                  }}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Recommendation Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRecommendation && (
                <>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedRecommendation.color }}
                  >
                    {React.createElement(getIconComponent(selectedRecommendation.icon), { className: "h-4 w-4" })}
                  </div>
                  {selectedRecommendation.displayName}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedRecommendation && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Recommendation Reason</h4>
                <p className="text-sm text-muted-foreground">{selectedRecommendation.reason}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Benefits</h4>
                <ul className="text-sm space-y-1">
                  {selectedRecommendation.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleAcceptRecommendation(selectedRecommendation)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Workflow
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateWithAI(selectedRecommendation)}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};