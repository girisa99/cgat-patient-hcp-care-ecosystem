import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, Bot, AlertTriangle, ArrowRight, GitBranch, Settings, 
  Database, Zap, MessageCircle, X, Move, Minimize2, Maximize2,
  Plus, Target, Clock, Users, Shield, Bell, Workflow, Code2
} from 'lucide-react';
import { Node, Edge, MarkerType } from '@xyflow/react';

interface SuggestedNode {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'logic' | 'ai' | 'action' | 'integration' | 'decision';
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  config: any;
}

interface AIInsightsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onAddNode: (nodeData: SuggestedNode) => void;
  currentNodes: Node[];
  onNodeSuggestion: (suggestions: SuggestedNode[]) => void;
}

const SUGGESTED_NODE_TYPES: SuggestedNode[] = [
  {
    id: 'logic-decision',
    type: 'decision',
    label: 'Decision Logic',
    description: 'Add conditional branching and decision points',
    icon: GitBranch,
    category: 'logic',
    priority: 'high',
    config: {
      conditions: [],
      defaultPath: null,
      evaluationType: 'rule-based'
    }
  },
  {
    id: 'ai-agent',
    type: 'agent',
    label: 'AI Agent',
    description: 'Intelligent conversational agent with NLP capabilities',
    icon: Bot,
    category: 'ai',
    priority: 'high',
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: '',
      capabilities: ['conversation', 'reasoning', 'task-completion']
    }
  },
  {
    id: 'escalation-rule',
    type: 'escalation',
    label: 'Escalation Rule',
    description: 'Define escalation paths and trigger conditions',
    icon: AlertTriangle,
    category: 'logic',
    priority: 'medium',
    config: {
      triggers: [],
      escalationLevels: [],
      timeout: 300,
      notificationChannels: []
    }
  },
  {
    id: 'follow-up-action',
    type: 'followup',
    label: 'Follow-up Action',
    description: 'Automated follow-up tasks and reminders',
    icon: Clock,
    category: 'action',
    priority: 'medium',
    config: {
      delay: 24,
      delayUnit: 'hours',
      actionType: 'reminder',
      template: '',
      conditions: []
    }
  },
  {
    id: 'user-assignment',
    type: 'assignment',
    label: 'User Assignment',
    description: 'Assign tasks to specific users or roles',
    icon: Users,
    category: 'action',
    priority: 'medium',
    config: {
      assignmentType: 'role-based',
      roles: [],
      users: [],
      loadBalancing: 'round-robin'
    }
  },
  {
    id: 'validation-check',
    type: 'validation',
    label: 'Validation Check',
    description: 'Validate data and inputs before processing',
    icon: Shield,
    category: 'logic',
    priority: 'medium',
    config: {
      validationRules: [],
      errorHandling: 'stop',
      customValidation: null
    }
  },
  {
    id: 'notification-action',
    type: 'notification',
    label: 'Notification',
    description: 'Send notifications via email, SMS, or push',
    icon: Bell,
    category: 'action',
    priority: 'low',
    config: {
      channels: ['email'],
      template: '',
      recipients: [],
      conditions: []
    }
  },
  {
    id: 'api-integration',
    type: 'api',
    label: 'API Integration',
    description: 'Connect to external APIs and services',
    icon: Database,
    category: 'integration',
    priority: 'high',
    config: {
      endpoint: '',
      method: 'GET',
      headers: {},
      authentication: 'none',
      responseMapping: {}
    }
  },
  {
    id: 'workflow-trigger',
    type: 'trigger',
    label: 'Workflow Trigger',
    description: 'Start workflows based on events or conditions',
    icon: Zap,
    category: 'logic',
    priority: 'high',
    config: {
      triggerType: 'event',
      eventSource: '',
      conditions: [],
      debounce: 0
    }
  },
  {
    id: 'custom-action',
    type: 'custom',
    label: 'Custom Action',
    description: 'Execute custom code or scripts',
    icon: Code2,
    category: 'action',
    priority: 'low',
    config: {
      runtime: 'javascript',
      code: '',
      parameters: {},
      timeout: 30
    }
  }
];

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  isVisible,
  onClose,
  onAddNode,
  currentNodes,
  onNodeSuggestion
}) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // AI-powered node suggestions based on current workflow
  const generateSmartSuggestions = useCallback(() => {
    const suggestions: SuggestedNode[] = [];
    const nodeTypes = currentNodes.map(node => node.type);
    
    // Logic: If there are decision nodes but no escalation, suggest escalation
    if (nodeTypes.includes('decision') && !nodeTypes.includes('escalation')) {
      suggestions.push(SUGGESTED_NODE_TYPES.find(n => n.id === 'escalation-rule')!);
    }
    
    // Logic: If there are agents but no validation, suggest validation
    if (nodeTypes.includes('agent') && !nodeTypes.includes('validation')) {
      suggestions.push(SUGGESTED_NODE_TYPES.find(n => n.id === 'validation-check')!);
    }
    
    // Logic: If workflow is complex, suggest follow-up actions
    if (currentNodes.length > 5 && !nodeTypes.includes('followup')) {
      suggestions.push(SUGGESTED_NODE_TYPES.find(n => n.id === 'follow-up-action')!);
    }
    
    // Always suggest high-priority nodes that aren't present
    SUGGESTED_NODE_TYPES
      .filter(node => node.priority === 'high' && !nodeTypes.includes(node.type))
      .forEach(node => suggestions.push(node));
      
    onNodeSuggestion(suggestions.slice(0, 6)); // Limit to 6 suggestions
    return suggestions;
  }, [currentNodes, onNodeSuggestion]);

  useEffect(() => {
    if (isVisible) {
      generateSmartSuggestions();
    }
  }, [isVisible, generateSmartSuggestions]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragStart.x)),
        y: Math.max(0, Math.min(window.innerHeight - 600, e.clientY - dragStart.y))
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const filteredNodes = selectedCategory === 'all' 
    ? SUGGESTED_NODE_TYPES 
    : SUGGESTED_NODE_TYPES.filter(node => node.category === selectedCategory);

  const smartSuggestions = generateSmartSuggestions();

  if (!isVisible) return null;

  return (
    <Card 
      className="fixed bg-white/95 backdrop-blur border shadow-2xl z-[9999] w-96"
      style={{ 
        left: position.x, 
        top: position.y,
        height: isMinimized ? 'auto' : '600px'
      }}
    >
      <CardHeader 
        className="cursor-move bg-gradient-to-r from-purple-50 to-blue-50 border-b p-3"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-sm font-semibold">AI Node Insights</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0">
          {/* Smart Suggestions */}
          {smartSuggestions.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-medium">Smart Suggestions</h3>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => smartSuggestions.forEach((n) => onAddNode(n))}
                >
                  Apply All
                </Button>
              </div>
              <div className="space-y-2">
                {smartSuggestions.slice(0, 3).map((node) => {
                  const Icon = node.icon;
                  return (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => onAddNode(node)}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="text-xs font-medium">{node.label}</div>
                          <div className="text-xs text-muted-foreground">{node.description.slice(0, 40)}...</div>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" className="h-7 px-2 text-xs"
                        onClick={(e) => { e.stopPropagation(); onAddNode(node); }}
                      >
                        Configure
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'logic', label: 'Logic' },
                { key: 'ai', label: 'AI' },
                { key: 'action', label: 'Actions' },
                { key: 'integration', label: 'Integration' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedCategory === key ? "default" : "outline"}
                  onClick={() => setSelectedCategory(key)}
                  className="h-6 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Available Nodes */}
          <ScrollArea className="h-96">
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-medium mb-3">Available Nodes</h3>
              {filteredNodes.map((node) => {
                const Icon = node.icon;
                const isAlreadyAdded = currentNodes.some(n => n.type === node.type);
                
                return (
                  <div
                    key={node.id}
                    className={`p-3 border rounded-lg hover:shadow-sm transition-all cursor-pointer ${
                      isAlreadyAdded ? 'bg-gray-50 opacity-60' : 'bg-white hover:border-blue-300'
                    }`}
                    onClick={() => !isAlreadyAdded && onAddNode(node)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          node.priority === 'high' ? 'bg-red-100 text-red-600' :
                          node.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{node.label}</h4>
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {node.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{node.description}</p>
                          {node.dependencies && (
                            <div className="mt-2">
                              <p className="text-xs text-blue-600">
                                Requires: {node.dependencies.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={node.priority === 'high' ? 'destructive' : 
                                  node.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {node.priority}
                        </Badge>
                        {!isAlreadyAdded && (
                          <Button size="sm" variant="secondary" className="h-7 px-2 text-xs"
                            onClick={(e) => { e.stopPropagation(); onAddNode(node); }}
                          >
                            Configure
                          </Button>
                        )}
                        {isAlreadyAdded && (
                          <Badge variant="outline" className="text-xs">
                            Added
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};