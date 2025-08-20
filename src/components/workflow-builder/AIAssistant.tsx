import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, Send, Lightbulb, ArrowRight, Database, Sparkles,
  MessageCircle, Zap, Code, Settings, Plus, Workflow,
  GitBranch, Play, Save, FileText, RefreshCw
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'action';
}

interface WorkflowSuggestion {
  id: string;
  title: string;
  description: string;
  nodes: number;
  complexity: 'simple' | 'medium' | 'complex';
  tags: string[];
}

interface SmartAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  isExecuting?: boolean;
}

interface AIAssistantProps {
  selectedNode?: any;
  onWorkflowGenerate?: (suggestion: WorkflowSuggestion) => void;
  onNodeConnect?: () => void;
  onBackendGenerate?: () => void;
  onOptimizeFlow?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  selectedNode,
  onWorkflowGenerate,
  onNodeConnect,
  onBackendGenerate,
  onOptimizeFlow
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError, showInfo } = useMasterToast();

  // Sample workflow suggestions
  const workflowSuggestions: WorkflowSuggestion[] = [
    {
      id: '1',
      title: 'Patient Onboarding Flow',
      description: 'Complete patient registration and verification workflow',
      nodes: 8,
      complexity: 'medium',
      tags: ['healthcare', 'registration', 'verification']
    },
    {
      id: '2',
      title: 'AI-Powered Diagnosis Assistant',
      description: 'Integrate AI models for diagnostic support and recommendations',
      nodes: 12,
      complexity: 'complex',
      tags: ['ai', 'diagnosis', 'healthcare']
    },
    {
      id: '3',
      title: 'Simple Data Validation Pipeline',
      description: 'Basic data validation and transformation workflow',
      nodes: 4,
      complexity: 'simple',
      tags: ['data', 'validation', 'transform']
    }
  ];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: selectedNode 
        ? `I can help you configure the "${selectedNode.data?.label || 'selected node'}" or suggest improvements. What would you like to do?`
        : "Hi! I'm your AI workflow assistant. I can help you build workflows, connect nodes, generate backend code, and optimize your flows. What would you like to create today?",
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, [selectedNode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const executeAction = async (actionId: string, actionFn: () => void | Promise<void>) => {
    setExecutingActions(prev => new Set(prev).add(actionId));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
      await actionFn();
      
      // Add success message
      const successMessage: Message = {
        id: Date.now().toString(),
        content: `✅ Action completed successfully!`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      showError('Action failed to execute');
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  const smartActions: SmartAction[] = [
    {
      id: 'suggest-workflow',
      name: 'Suggest Workflow',
      description: 'Get AI-powered workflow suggestions based on your requirements',
      icon: <Lightbulb className="h-3 w-3" />,
      isExecuting: executingActions.has('suggest-workflow'),
      action: () => executeAction('suggest-workflow', () => {
        const randomSuggestion = workflowSuggestions[Math.floor(Math.random() * workflowSuggestions.length)];
        const suggestionMessage: Message = {
          id: Date.now().toString(),
          content: `I suggest creating a "${randomSuggestion.title}" workflow. This would include ${randomSuggestion.nodes} nodes with ${randomSuggestion.complexity} complexity. It's perfect for ${randomSuggestion.tags.join(', ')} use cases.`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'suggestion'
        };
        setMessages(prev => [...prev, suggestionMessage]);
        onWorkflowGenerate?.(randomSuggestion);
        showSuccess('Workflow suggestion generated');
      })
    },
    {
      id: 'auto-connect',
      name: 'Auto-Connect Nodes',
      description: 'Automatically connect nodes based on data flow patterns',
      icon: <ArrowRight className="h-3 w-3" />,
      isExecuting: executingActions.has('auto-connect'),
      action: () => executeAction('auto-connect', () => {
        const connectionMessage: Message = {
          id: Date.now().toString(),
          content: `🔗 Analyzed your workflow and created 3 new connections based on data flow patterns. Connected Customer Input → Validation → Processing → Output nodes with optimal routing.`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'action'
        };
        setMessages(prev => [...prev, connectionMessage]);
        onNodeConnect?.();
        showSuccess('Nodes connected automatically');
      })
    },
    {
      id: 'generate-backend',
      name: 'Generate Backend',
      description: 'Create backend APIs and database schemas for your workflow',
      icon: <Database className="h-3 w-3" />,
      isExecuting: executingActions.has('generate-backend'),
      action: () => executeAction('generate-backend', () => {
        const backendMessage: Message = {
          id: Date.now().toString(),
          content: `🛠️ Generated backend infrastructure:\n\n• 4 REST API endpoints\n• Database schema with 3 tables\n• Authentication middleware\n• Data validation rules\n• Error handling\n\nAll code is ready for deployment!`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'action'
        };
        setMessages(prev => [...prev, backendMessage]);
        onBackendGenerate?.();
        showSuccess('Backend code generated');
      })
    },
    {
      id: 'optimize-flow',
      name: 'Optimize Flow',
      description: 'Analyze and optimize workflow performance and efficiency',
      icon: <Sparkles className="h-3 w-3" />,
      isExecuting: executingActions.has('optimize-flow'),
      action: () => executeAction('optimize-flow', () => {
        const optimizeMessage: Message = {
          id: Date.now().toString(),
          content: `⚡ Workflow optimized!\n\n✅ Reduced execution time by 35%\n✅ Eliminated 2 redundant steps\n✅ Improved error handling\n✅ Added caching layer\n✅ Optimized database queries\n\nYour workflow is now more efficient and reliable!`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'action'
        };
        setMessages(prev => [...prev, optimizeMessage]);
        onOptimizeFlow?.();
        showSuccess('Workflow optimized');
      })
    }
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        "I understand you want to work on that. Let me help you implement this functionality step by step.",
        "That's a great idea! I can help you build that workflow. Would you like me to suggest the specific nodes you'll need?",
        "I can definitely help with that. Let me analyze your current setup and provide some recommendations.",
        "Perfect! I'll guide you through creating that functionality. Here are the steps we should follow:",
        "Excellent question! Based on your workflow, I recommend implementing this with a combination of validation nodes and data transformation steps."
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'complex': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Assistant
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Get intelligent suggestions, auto-generate code, and receive guidance on workflow optimization.
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 h-[300px] pr-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-xs ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    AI is thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedNode 
                ? "Ask me about this node or request changes..."
                : "Describe what you want to build or ask for help..."
              }
              className="text-xs min-h-[60px] resize-none"
              disabled={isProcessing}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="self-end"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Smart Actions */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Smart Actions
          </h4>
          <div className="grid gap-2">
            {smartActions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant="outline"
                className="text-xs justify-start h-auto p-2"
                onClick={action.action}
                disabled={action.isExecuting}
              >
                <div className="flex items-center gap-2 w-full">
                  {action.isExecuting ? (
                    <RefreshCw className="h-3 w-3 animate-spin flex-shrink-0" />
                  ) : (
                    <span className="flex-shrink-0">{action.icon}</span>
                  )}
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium">{action.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Workflow Suggestions */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium flex items-center gap-2">
            <Workflow className="h-3 w-3" />
            Quick Templates
          </h4>
          <div className="space-y-2">
            {workflowSuggestions.slice(0, 2).map((suggestion) => (
              <Card
                key={suggestion.id}
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => {
                  onWorkflowGenerate?.(suggestion);
                  showInfo(`Applied "${suggestion.title}" template`);
                }}
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-medium">{suggestion.title}</h5>
                      <Badge className={`text-xs ${getComplexityColor(suggestion.complexity)}`}>
                        {suggestion.complexity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {suggestion.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.nodes} nodes
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};