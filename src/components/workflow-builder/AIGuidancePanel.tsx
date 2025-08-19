import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, Lightbulb, ArrowRight, CheckCircle, AlertTriangle, 
  Sparkles, MessageCircle, Send, RefreshCw
} from 'lucide-react';

interface AIGuidanceStep {
  id: string;
  type: 'suggestion' | 'next_step' | 'improvement' | 'warning';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
}

interface AIGuidancePanelProps {
  currentWorkflow: any;
  onApplySuggestion: (suggestion: AIGuidanceStep) => void;
  onUserPrompt: (prompt: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const AIGuidancePanel: React.FC<AIGuidancePanelProps> = ({
  currentWorkflow,
  onApplySuggestion,
  onUserPrompt,
  isVisible,
  onToggle
}) => {
  const [suggestions, setSuggestions] = useState<AIGuidanceStep[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'ai';
    message: string;
    timestamp: Date;
  }>>([
    {
      type: 'ai',
      message: 'Hi! I\'m your AI assistant. I\'ll help guide you through building your workflow. What would you like to create?',
      timestamp: new Date()
    }
  ]);

  // Analyze workflow and generate suggestions
  const analyzeWorkflow = async () => {
    if (!currentWorkflow?.nodes?.length) {
      setSuggestions([
        {
          id: '1',
          type: 'next_step',
          title: 'Start Building Your Workflow',
          description: 'Add your first node to begin creating your customer journey',
          action: 'Add Customer Touchpoint',
          priority: 'high'
        }
      ]);
      return;
    }

    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI analysis

    const newSuggestions: AIGuidanceStep[] = [];
    const nodes = currentWorkflow.nodes || [];
    const edges = currentWorkflow.edges || [];

    // Analyze node completeness
    nodes.forEach((node: any) => {
      if (!node.data?.description || node.data.description.includes('Configure this')) {
        newSuggestions.push({
          id: `desc_${node.id}`,
          type: 'improvement',
          title: `Complete ${node.data?.label || 'Node'} Configuration`,
          description: 'Add a detailed description to improve workflow clarity',
          action: `Configure ${node.data?.label || 'Node'}`,
          priority: 'medium'
        });
      }

      if (node.type === 'agent' && !node.data?.aiModel) {
        newSuggestions.push({
          id: `model_${node.id}`,
          type: 'warning',
          title: 'AI Model Not Selected',
          description: 'Select an AI model for optimal agent performance',
          action: 'Select Model',
          priority: 'high'
        });
      }
    });

    // Analyze workflow structure
    if (nodes.length > 0 && edges.length === 0) {
      newSuggestions.push({
        id: 'connections',
        type: 'next_step',
        title: 'Connect Your Nodes',
        description: 'Draw connections between nodes to define the workflow flow',
        action: 'Add Connections',
        priority: 'high'
      });
    }

    // Check for missing decision points
    const hasDecisions = nodes.some((node: any) => node.type === 'decision');
    if (nodes.length > 2 && !hasDecisions) {
      newSuggestions.push({
        id: 'decision_points',
        type: 'suggestion',
        title: 'Add Decision Points',
        description: 'Consider adding decision nodes to handle different customer scenarios',
        action: 'Add Decision Node',
        priority: 'medium'
      });
    }

    // Check for agent integration
    const hasAgents = nodes.some((node: any) => node.type === 'agent');
    if (nodes.length > 1 && !hasAgents) {
      newSuggestions.push({
        id: 'ai_agent',
        type: 'suggestion',
        title: 'Add AI Agent',
        description: 'Integrate AI agents to automate parts of your workflow',
        action: 'Add AI Agent',
        priority: 'medium'
      });
    }

    // Suggest next logical steps
    if (nodes.length >= 3 && edges.length >= 2) {
      newSuggestions.push({
        id: 'testing',
        type: 'next_step',
        title: 'Test Your Workflow',
        description: 'Your workflow looks ready for testing and optimization',
        action: 'Run Test',
        priority: 'medium'
      });
    }

    setSuggestions(newSuggestions);
    setIsAnalyzing(false);
  };

  // Handle user prompt submission
  const handleUserPrompt = async () => {
    if (!userPrompt.trim()) return;

    // Add user message to conversation
    const userMessage = {
      type: 'user' as const,
      message: userPrompt,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, userMessage]);

    // Process prompt and get AI response
    onUserPrompt(userPrompt);
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const aiResponse = generateAIResponse(userPrompt);
    const aiMessage = {
      type: 'ai' as const,
      message: aiResponse,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, aiMessage]);

    setUserPrompt('');
  };

  const generateAIResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('add') || lowerPrompt.includes('create')) {
      return "I can help you add components! Based on your workflow, I suggest adding a customer touchpoint first, followed by an interaction point. Would you like me to guide you through this?";
    }
    
    if (lowerPrompt.includes('connect') || lowerPrompt.includes('link')) {
      return "To connect nodes, simply drag from one node's edge to another. I recommend connecting in logical order: Customer → Touchpoint → Decision → Agent. Shall I analyze your current connections?";
    }
    
    if (lowerPrompt.includes('test') || lowerPrompt.includes('validate')) {
      return "Great idea! To test your workflow, make sure all nodes are configured and connected. I can help validate your setup and suggest improvements. Would you like me to run a workflow analysis?";
    }
    
    return "I understand you want to improve your workflow. Let me analyze your current setup and provide specific recommendations. What specific aspect would you like me to focus on?";
  };

  // Auto-analyze when workflow changes
  useEffect(() => {
    analyzeWorkflow();
  }, [currentWorkflow]);

  const handleApplySuggestion = (suggestion: AIGuidanceStep) => {
    onApplySuggestion(suggestion);
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestion.id ? { ...s, completed: true } : s
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'next_step': return <ArrowRight className="h-4 w-4" />;
      case 'improvement': return <Sparkles className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg z-50"
        size="sm"
      >
        <Bot className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[24rem] h-[70vh] max-h-[85vh] shadow-xl z-50 flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            AI Workflow Assistant
            <Badge variant="secondary">Beta</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3 space-y-3 overflow-hidden">
        {/* Conversation Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium">Conversation</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={analyzeWorkflow}
              disabled={isAnalyzing}
            >
              <RefreshCw className={`h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 border rounded-md p-2">
            <div className="space-y-2">
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-xs ${
                      msg.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2 mt-2">
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Ask me anything about your workflow..."
              className="text-xs resize-none"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleUserPrompt();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleUserPrompt}
              disabled={!userPrompt.trim()}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="flex-shrink-0">
          <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Smart Suggestions
            {isAnalyzing && <RefreshCw className="h-3 w-3 animate-spin" />}
          </h4>
          
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className={`p-2 ${suggestion.completed ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        {getTypeIcon(suggestion.type)}
                        <span className="text-xs font-medium truncate">
                          {suggestion.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs px-1 py-0 ${getPriorityColor(suggestion.priority)}`}
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                    
                    {!suggestion.completed && suggestion.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="text-xs px-2 py-1 h-6 flex-shrink-0"
                      >
                        {suggestion.action}
                      </Button>
                    )}
                    
                    {suggestion.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </Card>
              ))}
              
              {suggestions.length === 0 && !isAnalyzing && (
                <div className="text-center text-xs text-muted-foreground py-4">
                  Your workflow looks great! Keep building or ask me for help.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};