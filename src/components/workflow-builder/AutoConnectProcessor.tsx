import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle, 
  Settings,
  Brain,
  ArrowRight,
  Network
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { fetchWithTimeout } from '@/hooks/shared/useFetchWithTimeout';

interface AutoConnectProcessorProps {
  nodes: any[];
  edges: any[];
  onConnectionsUpdate: (connections: any[]) => void;
  onNodesUpdate: (nodes: any[]) => void;
  className?: string;
}

interface ConnectionSuggestion {
  id: string;
  sourceId: string;
  targetId: string;
  confidence: number;
  reasoning: string;
  type: 'logical' | 'semantic' | 'workflow' | 'ai-recommended';
  autoApply: boolean;
}

interface NodeTemplate {
  nodeId: string;
  templateType: string;
  configuration: any;
  description: string;
}

export const AutoConnectProcessor: React.FC<AutoConnectProcessorProps> = ({
  nodes,
  edges,
  onConnectionsUpdate,
  onNodesUpdate,
  className = ""
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [templates, setTemplates] = useState<NodeTemplate[]>([]);
  const [processResult, setProcessResult] = useState<any>(null);
  const { showSuccess, showError, showInfo } = useMasterToast();

  const processAutoConnections = async () => {
    if (nodes.length < 2) {
      showInfo('Need at least 2 nodes to generate connections');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await fetchWithTimeout<{
        suggestions?: ConnectionSuggestion[];
        templates?: NodeTemplate[];
      }>(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-auto-connections`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          nodes,
          edges,
          generateTemplates: true,
          intelligentRouting: true
        }),
        timeoutMs: 30000, // 30 second timeout for AI processing
      });

      if (result.error) {
        throw result.error;
      }
      
      setSuggestions(result.data?.suggestions || []);
      setTemplates(result.data?.templates || []);
      setProcessResult(result.data);
      
      // Auto-apply high-confidence connections
      const autoConnections = result.data?.suggestions
        ?.filter((s: ConnectionSuggestion) => s.autoApply && s.confidence > 0.8)
        ?.map((s: ConnectionSuggestion) => ({
          id: s.id,
          source: s.sourceId,
          target: s.targetId,
          type: 'smoothstep',
          animated: s.type === 'ai-recommended',
          label: s.reasoning
        }));

      if (autoConnections?.length > 0) {
        onConnectionsUpdate([...edges, ...autoConnections]);
        showSuccess(`Auto-applied ${autoConnections.length} high-confidence connections`);
      }

    } catch (error) {
      console.error('Error processing auto-connections:', error);
      showError('Failed to process auto-connections');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyConnection = (suggestion: ConnectionSuggestion) => {
    const newEdge = {
      id: suggestion.id,
      source: suggestion.sourceId,
      target: suggestion.targetId,
      type: 'smoothstep',
      animated: suggestion.type === 'ai-recommended',
      label: suggestion.reasoning,
      style: { stroke: getConnectionColor(suggestion.type) }
    };

    onConnectionsUpdate([...edges, newEdge]);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    showSuccess('Connection applied successfully');
  };

  const applyTemplate = (template: NodeTemplate) => {
    const updatedNodes = nodes.map(node => 
      node.id === template.nodeId 
        ? {
            ...node,
            data: {
              ...node.data,
              template: template.templateType,
              configuration: template.configuration,
              isConfigured: true,
              // Apply node-type specific configurations
              ...(node.type === 'agent' && {
                aiProvider: template.configuration?.aiProvider || 'openai',
                model: template.configuration?.model || 'gpt-4o-mini',
                systemPrompt: template.configuration?.systemPrompt || ''
              }),
              ...(node.type === 'http' && {
                endpoint: template.configuration?.endpoint || '',
                method: template.configuration?.method || 'GET',
                headers: template.configuration?.headers || {}
              }),
              ...(node.type === 'condition' && {
                conditions: template.configuration?.conditions || [],
                evaluationType: template.configuration?.evaluationType || 'rule-based'
              })
            }
          }
        : node
    );

    onNodesUpdate(updatedNodes);
    setTemplates(prev => prev.filter(t => t.nodeId !== template.nodeId));
    showSuccess(`Template applied to ${nodes.find(n => n.id === template.nodeId)?.type || 'node'}`);
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'logical': return '#10B981';
      case 'semantic': return '#3B82F6';
      case 'workflow': return '#8B5CF6';
      case 'ai-recommended': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Auto-Connect Processor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={processAutoConnections}
            disabled={isProcessing || nodes.length < 2}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Processing Connections...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Analyze & Auto-Connect ({nodes.length} nodes)
              </>
            )}
          </Button>

          {processResult && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {processResult.autoApplied || 0}
                </div>
                <div className="text-xs text-green-600">Auto-Applied</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {suggestions.length}
                </div>
                <div className="text-xs text-blue-600">Suggestions</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {templates.length}
                </div>
                <div className="text-xs text-purple-600">Templates</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              Connection Suggestions ({suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            style={{ borderColor: getConnectionColor(suggestion.type) }}
                          >
                            {suggestion.type}
                          </Badge>
                          <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="text-sm mb-2">
                          <span className="font-medium">
                            {nodes.find(n => n.id === suggestion.sourceId)?.data?.label || suggestion.sourceId}
                          </span>
                          <ArrowRight className="h-3 w-3 mx-2 inline" />
                          <span className="font-medium">
                            {nodes.find(n => n.id === suggestion.targetId)?.data?.label || suggestion.targetId}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.reasoning}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => applyConnection(suggestion)}
                        className="ml-3"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Node Templates */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Node Templates ({templates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.nodeId} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{template.templateType}</Badge>
                        </div>
                        <div className="text-sm font-medium mb-1">
                          {nodes.find(n => n.id === template.nodeId)?.data?.label || template.nodeId}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => applyTemplate(template)}
                        className="ml-3"
                      >
                        Apply Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};