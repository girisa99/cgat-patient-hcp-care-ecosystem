import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Brain,
  Zap,
  Target
} from 'lucide-react';
import { useConversationEngines } from '@/hooks/useConversationEngines';
import { supabase } from '@/integrations/supabase/client';
import { 
  ConversationMessage, 
  MultiModelConversation, 
  ModelConfiguration 
} from '@/types/conversation-engine';
import { toast } from '@/hooks/use-toast';

interface MultiModelChatInterfaceProps {
  agentId?: string;
  className?: string;
}

export const MultiModelChatInterface: React.FC<MultiModelChatInterfaceProps> = ({ 
  agentId,
  className 
}) => {
  const { engines, getAgentEngines, processMessage } = useConversationEngines();
  const [conversationMode, setConversationMode] = useState<'single' | 'multi-model' | 'comparative'>('single');
  const [activeModels, setActiveModels] = useState<ModelConfiguration[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<MultiModelConversation | null>(null);
  const [splitView, setSplitView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    if (agentId) {
      initializeConversation();
    }
  }, [agentId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeConversation = async () => {
    try {
      const sessionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('multi_model_conversations')
        .insert({
          session_id: sessionId,
          conversation_mode: conversationMode,
          active_models: activeModels as any,
          conversation_history: [] as any,
          model_responses: {} as any,
          user_preferences: {
            response_format: conversationMode === 'comparative' ? 'comparison' : 'single',
            show_confidence_scores: true,
          } as any,
          context_data: {} as any,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      setConversation(data as MultiModelConversation);

      // Load available engines for agent
      if (agentId) {
        const agentEngines = getAgentEngines(agentId);
        const defaultModels = agentEngines.slice(0, 2).map(ae => {
          const engine = engines.find(e => e.id === ae.conversation_engine_id);
          return {
            engine_id: ae.conversation_engine_id,
            engine_name: engine?.name || 'Unknown',
            role: ae.role === 'fallback' ? 'secondary' : ae.role as ModelConfiguration['role'],
          };
        });
        setActiveModels(defaultModels);
      }
    } catch (err) {
      console.error('Error initializing conversation:', err);
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize conversation session",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversation || isProcessing) return;

    const newMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      if (conversationMode === 'single' || conversationMode === 'multi-model') {
        // Process with primary model
        const primaryModel = activeModels.find(m => m.role === 'primary') || activeModels[0];
        if (primaryModel) {
          const engine = engines.find(e => e.id === primaryModel.engine_id);
          if (engine) {
            const result = await processMessage(engine, inputMessage);
            
            const assistantMessage: ConversationMessage = {
              id: `msg_${Date.now()}_response`,
              type: 'assistant',
              content: result.response,
              timestamp: new Date().toISOString(),
              model_source: engine.name,
              confidence_score: result.confidence,
              intent_classification: {
                intent: result.intent || 'unknown',
                confidence: result.confidence,
                entities: result.entities || {},
              },
            };

            setMessages(prev => [...prev, assistantMessage]);
          }
        }
      } else if (conversationMode === 'comparative') {
        // Process with multiple models for comparison
        const responses = await Promise.all(
          activeModels.map(async (model) => {
            const engine = engines.find(e => e.id === model.engine_id);
            if (!engine) return null;
            
            const result = await processMessage(engine, inputMessage);
            return {
              model,
              engine,
              result,
            };
          })
        );

        // Create comparative response message
        const comparativeMessage: ConversationMessage = {
          id: `msg_${Date.now()}_comparative`,
          type: 'assistant',
          content: 'Multiple model responses:',
          timestamp: new Date().toISOString(),
          metadata: {
            comparative_responses: responses.filter(r => r !== null),
          },
        };

        setMessages(prev => [...prev, comparativeMessage]);
      }

      // Update conversation in database
      await supabase
        .from('multi_model_conversations')
        .update({
          conversation_history: [...messages, newMessage] as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversation.id);

    } catch (err) {
      console.error('Error processing message:', err);
      toast({
        title: "Processing Failed",
        description: "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModeChange = (mode: 'single' | 'multi-model' | 'comparative') => {
    setConversationMode(mode);
    setSplitView(mode === 'comparative');
  };

  const getEngineIcon = (engineType: string) => {
    switch (engineType) {
      case 'llm':
        return <Brain className="h-4 w-4" />;
      case 'sml':
        return <Zap className="h-4 w-4" />;
      case 'mcp':
        return <Target className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const renderMessage = (message: ConversationMessage) => {
    if (message.type === 'user') {
      return (
        <div className="flex items-start gap-3 justify-end">
          <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-xs">
            <p className="text-sm">{message.content}</p>
          </div>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      );
    }

    if (message.metadata?.comparative_responses) {
      // Render comparative responses
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-medium">Model Comparison</span>
          </div>
          
          {splitView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {message.metadata.comparative_responses.map((response: any, index: number) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getEngineIcon(response.engine.engine_type)}
                    <span className="font-medium text-sm">{response.engine.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(response.result.confidence * 100)}%
                    </Badge>
                  </div>
                  <p className="text-sm">{response.result.response}</p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {message.metadata.comparative_responses.map((response: any, index: number) => (
                <div key={index} className="border-l-2 border-primary pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    {getEngineIcon(response.engine.engine_type)}
                    <span className="font-medium text-sm">{response.engine.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(response.result.confidence * 100)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{response.result.response}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Regular assistant message
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4" />
        </div>
        <div className="bg-secondary rounded-lg px-4 py-2 max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            {message.model_source && (
              <span className="text-xs text-muted-foreground">{message.model_source}</span>
            )}
            {message.confidence_score && (
              <Badge variant="outline" className="text-xs">
                {Math.round(message.confidence_score * 100)}%
              </Badge>
            )}
          </div>
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Multi-Model Conversation</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={conversationMode} onValueChange={handleModeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Model</SelectItem>
                <SelectItem value="multi-model">Multi-Model</SelectItem>
                <SelectItem value="comparative">Comparative</SelectItem>
              </SelectContent>
            </Select>
            
            {conversationMode === 'comparative' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSplitView(!splitView)}
              >
                {splitView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Active Models */}
        <div className="flex flex-wrap gap-2">
          {activeModels.map((model, index) => {
            const engine = engines.find(e => e.id === model.engine_id);
            return (
              <Badge key={index} variant="secondary" className="text-xs">
                {getEngineIcon(engine?.engine_type || '')}
                <span className="ml-1">{model.engine_name}</span>
              </Badge>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-96 w-full pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Bot className="h-8 w-8 mb-2" />
                <p className="text-sm">Start a conversation with your multi-model agent</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id}>
                  {renderMessage(message)}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <Separator />
        
        {/* Input */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isProcessing}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Processing with {conversationMode === 'comparative' ? 'multiple models' : 'selected model'}...
          </div>
        )}
      </CardContent>
    </Card>
  );
};