import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Bot, User, Settings, Code, X, Activity } from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { ArizeIntegration } from './ArizeIntegration';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'configuration' | 'code' | 'suggestion';
}

interface NodeChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeType: string;
  currentConfig: any;
  onConfigurationUpdate: (nodeId: string, config: any) => void;
  assistMode?: 'build' | 'generate' | 'test' | 'deploy' | 'configure';
}

export const NodeChatInterface: React.FC<NodeChatInterfaceProps> = ({
  isOpen,
  onClose,
  nodeId,
  nodeType,
  currentConfig,
  onConfigurationUpdate,
  assistMode = 'configure',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { generateResponse, testNode, analyzeWorkflow, generateAgent, isLoading } = useUniversalAI();

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, nodeId, nodeType]);

  const initializeChat = () => {
    const getModeSpecificWelcome = () => {
      switch (assistMode) {
        case 'build':
          return `Hi! I'm here to help you build your ${nodeType} node. I can help you:
• Design the node architecture
• Set up connections and data flow
• Configure processing logic
• Optimize for performance

What would you like to build?`;
        case 'generate':
          return `Hi! I'm here to help generate your ${nodeType} node. I can:
• Auto-generate configuration based on requirements
• Create templates for common use cases
• Generate code and settings
• Suggest optimal parameters

What should I generate for you?`;
        case 'test':
          return `Hi! I'm here to help test your ${nodeType} node. I can:
• Run test scenarios on your configuration
• Validate node functionality
• Check for potential issues
• Performance test the node

What would you like to test?`;
        case 'deploy':
          return `Hi! I'm here to help deploy your ${nodeType} node. I can:
• Prepare deployment configuration
• Set up environment variables
• Configure monitoring and alerts
• Handle production settings

What deployment help do you need?`;
        default:
          return `Hi! I'm here to help you configure your ${nodeType} node. You can ask me to:
• Change specific settings (e.g., "Set temperature to 0.8")
• Explain configuration options
• Suggest optimal settings for your use case
• Generate configuration code

What would you like to configure?`;
      }
    };

    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: getModeSpecificWelcome(),
      timestamp: new Date(),
      type: 'suggestion',
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const getModeSpecificSystemPrompt = () => {
        const basePrompt = `You are an AI assistant helping with a ${nodeType} node in a workflow builder. 

Current configuration:
${JSON.stringify(currentConfig, null, 2)}

Node type: ${nodeType}
Assist mode: ${assistMode}`;

        switch (assistMode) {
          case 'build':
            return `${basePrompt}

Your role in BUILD mode:
1. Help design and architect the node structure
2. Suggest optimal configurations for the use case
3. Provide building blocks and templates
4. Guide through setup process step by step

When providing responses:
- Focus on architecture and design decisions
- Provide clear step-by-step instructions
- Include configuration in JSON format when helpful
- Explain design rationale`;

          case 'generate':
            return `${basePrompt}

Your role in GENERATE mode:
1. Auto-generate complete configurations based on requirements
2. Create ready-to-use templates and presets
3. Generate code snippets and settings
4. Provide multiple configuration options

When providing responses:
- Always include complete configuration in JSON format
- Provide multiple variants when applicable
- Generate comprehensive settings
- Include usage examples`;

          case 'test':
            return `${basePrompt}

Your role in TEST mode:
1. Create test scenarios for the node configuration
2. Validate settings and identify potential issues
3. Suggest test cases and validation steps
4. Provide performance analysis

When providing responses:
- Include test scenarios and expected results
- Identify potential configuration issues
- Suggest improvements based on testing
- Provide validation steps`;

          case 'deploy':
            return `${basePrompt}

Your role in DEPLOY mode:
1. Prepare production-ready configurations
2. Set up monitoring and alerting
3. Configure environment-specific settings
4. Provide deployment checklists

When providing responses:
- Include production-ready configuration
- Provide deployment steps and checklists
- Include monitoring and alerting setup
- Consider security and performance aspects`;

          default:
            return `${basePrompt}

Your role in CONFIGURE mode:
1. Help users modify configuration settings through natural language
2. Provide explanations for configuration options
3. Suggest optimal settings for different use cases
4. Generate configuration updates in JSON format when requested

When providing configuration updates, always respond with:
1. A clear explanation of what you're changing
2. The updated configuration in JSON format wrapped in \`\`\`json blocks
3. Why these changes are beneficial`;
        }
      };

      // Handle different assist modes with specific actions
      if (assistMode === 'test' && inputValue.toLowerCase().includes('test')) {
        // Use the testNode function for testing
        const testResult = await testNode(currentConfig, { message: inputValue }, 'openai');
        
        const testMessage: ChatMessage = {
          id: Date.now().toString() + '_test',
          role: 'assistant',
          content: `Test completed! Here are the results:

**Status:** ${testResult.status}
**Success:** ${testResult.success ? 'Yes' : 'No'}
**Execution Time:** ${testResult.executionTime}ms

**Output:**
\`\`\`json
${JSON.stringify(testResult.output, null, 2)}
\`\`\`

**Message:** ${testResult.message}`,
          timestamp: new Date(),
          type: 'configuration',
        };
        
        setMessages(prev => [...prev, testMessage]);
        setIsTyping(false);
        return;
      }

      const response = await generateResponse({
        prompt: inputValue,
        systemPrompt: getModeSpecificSystemPrompt(),
        provider: 'openai',
        model: 'gpt-4o-mini',
      });
      
      // Convert response to string if it's an object
      const responseText = typeof response === 'string' ? response : response?.content || JSON.stringify(response);

      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        type: responseText.includes('```json') ? 'configuration' : 'suggestion',
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Extract and apply JSON configuration if present
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const newConfig = JSON.parse(jsonMatch[1]);
          onConfigurationUpdate(nodeId, { ...currentConfig, ...newConfig });
        } catch (error) {
          console.error('Failed to parse configuration JSON:', error);
        }
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getMessageStyle = (message: ChatMessage) => {
    if (message.role === 'user') {
      return 'ml-12 bg-primary text-primary-foreground';
    }
    if (message.type === 'configuration') {
      return 'mr-12 bg-emerald-50 border-emerald-200 dark:bg-emerald-950';
    }
    return 'mr-12 bg-muted';
  };

  const renderMessageContent = (content: string) => {
    // Handle JSON code blocks
    if (content.includes('```json')) {
      const parts = content.split(/(```json\n[\s\S]*?\n```)/);
      return parts.map((part, index) => {
        if (part.startsWith('```json')) {
          const jsonCode = part.replace(/```json\n|\n```/g, '');
          return (
            <div key={index} className="my-2">
              <Badge variant="secondary" className="mb-2">
                <Code className="h-3 w-3 mr-1" />
                Configuration Update
              </Badge>
              <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm overflow-x-auto">
                <code>{jsonCode}</code>
              </pre>
            </div>
          );
        }
        return <div key={index} className="whitespace-pre-wrap">{part}</div>;
      });
    }
    
    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  const getTestingCategories = () => {
    switch (nodeType) {
      case 'agent':
        return ['Model Performance', 'Response Quality', 'Prompt Effectiveness', 'Memory Usage'];
      case 'api':
        return ['Endpoint Connectivity', 'Response Time', 'Error Handling', 'Rate Limiting'];
      case 'database':
        return ['Connection Pool', 'Query Performance', 'Data Integrity', 'Security Policies'];
      default:
        return ['Functionality Test', 'Performance Test', 'Integration Test', 'Error Handling'];
    }
  };

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI {assistMode.charAt(0).toUpperCase() + assistMode.slice(1)} Assistant - {nodeType} Node
              <Badge variant="outline" className="ml-2">
                {assistMode.toUpperCase()}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="testing">Testing & Arize</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className={getMessageStyle(message)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getMessageIcon(message.role)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">
                              {message.role === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.type && (
                              <Badge variant="outline" className="text-xs">
                                {message.type}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm">
                            {renderMessageContent(message.content)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {isTyping && (
                  <Card className="mr-12 bg-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to configure your node... (e.g., 'Set temperature to 0.8' or 'Optimize for creative writing')"
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="flex-1 flex flex-col mt-4">
            <div className="space-y-4">
              <ArizeIntegration 
                nodeId={nodeId}
                nodeType={nodeType}
                testingMode={assistMode === 'test' ? 'test' : assistMode}
                onTestResults={(results) => {
                  addMessage(`Test completed with status: ${results.status}. Metrics: Latency ${results.metrics.latency.toFixed(1)}ms, Accuracy ${(results.metrics.accuracy * 100).toFixed(1)}%`, 'assistant');
                }}
              />
              
              {assistMode === 'test' && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Testing Categories for {nodeType}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getTestingCategories().map((category, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm"
                        onClick={() => addMessage(`Starting ${category} test...`, 'user')}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="config" className="flex-1 mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Current Configuration
                </h4>
                <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
                  {JSON.stringify(currentConfig, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};