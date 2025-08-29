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
import { Send, Bot, User, Settings, Code, X } from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';

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
}

export const NodeChatInterface: React.FC<NodeChatInterfaceProps> = ({
  isOpen,
  onClose,
  nodeId,
  nodeType,
  currentConfig,
  onConfigurationUpdate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { generateResponse, isLoading } = useUniversalAI();

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, nodeId, nodeType]);

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm here to help you configure your ${nodeType} node. You can ask me to:

• Change specific settings (e.g., "Set temperature to 0.8")
• Explain configuration options
• Suggest optimal settings for your use case
• Generate configuration code

What would you like to configure?`,
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
      const systemPrompt = `You are an AI assistant helping to configure a ${nodeType} node in a workflow builder. 

Current configuration:
${JSON.stringify(currentConfig, null, 2)}

Your role:
1. Help users modify configuration settings through natural language
2. Provide explanations for configuration options
3. Suggest optimal settings for different use cases
4. Generate configuration updates in JSON format when requested

When providing configuration updates, always respond with:
1. A clear explanation of what you're changing
2. The updated configuration in JSON format wrapped in \`\`\`json blocks
3. Why these changes are beneficial

Be conversational but precise. Focus on the specific node type and its configuration options.`;

      const response = await generateResponse({
        prompt: inputValue,
        systemPrompt,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Configuration Assistant - {nodeType} Node
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};