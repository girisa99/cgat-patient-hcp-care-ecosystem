import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { Lightbulb, Plus, ArrowRight, Zap, Bot, MessageSquare, Settings, Phone, Calendar } from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AutoSuggestConnectorProps {
  selectedNode: Node | null;
  onSuggestionAccepted: (suggestion: NodeSuggestion) => void;
  manualSteps?: string[];
  capturedRequirements?: {
    connectors: string[];
    actions: string[];
    steps: string[];
    integrations: string[];
  };
  workflowContext?: {
    type: 'visual' | 'manual';
    stage: string;
    useCaseData?: any;
    capturedRequirements?: any;
    journeyStages?: any[];
  };
  contextualSuggestions?: any[];
}

interface NodeSuggestion {
  id: string;
  type: 'touchpoint' | 'decision' | 'agent' | 'action';
  label: string;
  description: string;
  position: { x: number; y: number };
  data: any;
  connectionType: 'sequential' | 'conditional' | 'parallel';
  confidence: number;
}

export const AutoSuggestConnector: React.FC<AutoSuggestConnectorProps> = ({
  selectedNode,
  onSuggestionAccepted,
  manualSteps = [],
  capturedRequirements,
  workflowContext,
  contextualSuggestions = []
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [suggestions, setSuggestions] = useState<NodeSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showSuccess, showError } = useMasterToast();
  const { getNodes } = useReactFlow();

  const generateSuggestions = useCallback(async () => {
    if (!selectedNode && !promptInput.trim()) return;

    setIsGenerating(true);
    try {
      const currentNodes = getNodes();
      const context = {
        selectedNode: selectedNode?.data,
        currentWorkflow: currentNodes.map(n => ({ type: n.type, label: n.data.label })),
        manualSteps,
        capturedRequirements,
        prompt: promptInput
      };

      // Generate intelligent suggestions based on context
      const intelligentSuggestions = generateIntelligentSuggestions(context);
      setSuggestions(intelligentSuggestions);
      
      showSuccess("Suggestions Generated", `Found ${intelligentSuggestions.length} intelligent next steps`);
    } catch (error) {
      showError("Generation Failed", "Could not generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNode, promptInput, manualSteps, capturedRequirements, getNodes, showSuccess, showError]);

  const generateIntelligentSuggestions = (context: any): NodeSuggestion[] => {
    const suggestions: NodeSuggestion[] = [];
    const baseX = selectedNode?.position.x || 300;
    const baseY = selectedNode?.position.y || 100;

    // Rule-based suggestions based on current node type and manual steps
    if (selectedNode?.type === 'customer') {
      suggestions.push({
        id: `touchpoint-${Date.now()}`,
        type: 'touchpoint',
        label: 'Initial Contact Channel',
        description: 'Primary communication channel for customer interaction',
        position: { x: baseX + 250, y: baseY },
        data: {
          channel: 'chat',
          automationLevel: 75,
          dataFields: ['customer_id', 'contact_method', 'initial_request'],
          connectors: ['input', 'output', 'escalation']
        },
        connectionType: 'sequential',
        confidence: 0.9
      });
    }

    if (selectedNode?.type === 'touchpoint') {
      suggestions.push({
        id: `decision-${Date.now()}`,
        type: 'decision',
        label: 'Route Decision',
        description: 'Determine next step based on customer input',
        position: { x: baseX + 250, y: baseY },
        data: {
          conditions: ['urgent', 'routine', 'information'],
          dataFields: ['decision_criteria', 'routing_logic', 'outcome'],
          connectors: ['input', 'urgent_output', 'routine_output', 'info_output']
        },
        connectionType: 'conditional',
        confidence: 0.85
      }, {
        id: `agent-${Date.now()}`,
        type: 'agent',
        label: 'Processing Agent',
        description: 'AI agent to handle the request',
        position: { x: baseX + 250, y: baseY + 100 },
        data: {
          capabilities: ['processing', 'validation', 'response'],
          dataFields: ['request_data', 'processed_result', 'confidence_score'],
          connectors: ['input', 'output', 'error', 'escalation']
        },
        connectionType: 'sequential',
        confidence: 0.8
      });
    }

    // Add suggestions based on manual steps and captured requirements
    if (manualSteps.length > 0) {
      manualSteps.forEach((step, idx) => {
        if (!context.currentWorkflow.some((n: any) => n.label.toLowerCase().includes(step.toLowerCase()))) {
          suggestions.push({
            id: `manual-step-${idx}`,
            type: 'touchpoint',
            label: step,
            description: `Manual workflow step: ${step}`,
            position: { x: baseX + (idx + 1) * 250, y: baseY + 150 },
            data: {
              step: step,
              automationLevel: 60,
              dataFields: ['step_input', 'step_output', 'status'],
              connectors: ['input', 'output', 'validation']
            },
            connectionType: 'sequential',
            confidence: 0.7
          });
        }
      });
    }

    // Add suggestions based on captured requirements
    if (capturedRequirements?.actions.length) {
      capturedRequirements.actions.slice(0, 2).forEach((action, idx) => {
        suggestions.push({
          id: `action-${idx}`,
          type: 'agent',
          label: action,
          description: `Automated action: ${action}`,
          position: { x: baseX + 250, y: baseY + (idx + 1) * 80 },
          data: {
            action: action,
            capabilities: [action.toLowerCase()],
            dataFields: ['action_input', 'action_output', 'execution_status'],
            connectors: ['trigger', 'output', 'error', 'success']
          },
          connectionType: 'parallel',
          confidence: 0.75
        });
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  };

  const acceptSuggestion = (suggestion: NodeSuggestion) => {
    onSuggestionAccepted(suggestion);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    showSuccess("Node Added", `Added ${suggestion.label} to workflow`);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'touchpoint': return <MessageSquare className="h-4 w-4" />;
      case 'decision': return <Settings className="h-4 w-4" />;
      case 'agent': return <Bot className="h-4 w-4" />;
      case 'action': return <Zap className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'sequential': return <ArrowRight className="h-3 w-3" />;
      case 'conditional': return <Settings className="h-3 w-3" />;
      case 'parallel': return <Zap className="h-3 w-3" />;
      default: return <ArrowRight className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Prompt Input */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Smart Suggestions</h3>
            </div>
            
            <Textarea
              placeholder="Describe what should happen next... (e.g., 'After customer inquiry, route to appropriate specialist')"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="min-h-[80px]"
            />
            
            <Button 
              onClick={generateSuggestions} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Smart Suggestions'}
              <Lightbulb className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auto-generated Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Suggested Next Steps</h4>
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    {getNodeIcon(suggestion.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{suggestion.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(suggestion.confidence * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                      
                      {/* Data Fields Preview */}
                      {suggestion.data.dataFields && Array.isArray(suggestion.data.dataFields) && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {suggestion.data.dataFields.slice(0, 3).map((field: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {suggestion.data.dataFields.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{suggestion.data.dataFields.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Connection Type */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getConnectionIcon(suggestion.connectionType)}
                        <span className="capitalize">{suggestion.connectionType} connection</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => acceptSuggestion(suggestion)}
                    className="shrink-0"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Context Information */}
      {selectedNode && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Current Context</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Selected:</strong> {String(selectedNode.data.label)}</p>
              <p><strong>Type:</strong> {selectedNode.type}</p>
              {selectedNode.data.dataFields && Array.isArray(selectedNode.data.dataFields) && (
                <p><strong>Data Fields:</strong> {selectedNode.data.dataFields.join(', ')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};