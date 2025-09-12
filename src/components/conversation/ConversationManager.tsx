import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Download, 
  Save, 
  Settings, 
  User, 
  Bot, 
  Eye, 
  Database,
  FileText,
  Mic,
  MicOff,
  Brain,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { toast } from 'sonner';

interface ConversationManagerProps {
  agentId?: string;
  enrollmentContext?: any;
  onDataCapture?: (data: any) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
  labelStudioData?: any;
}

interface LLMProvider {
  id: string;
  name: string;
  model: string;
  capabilities: string[];
  cost: string;
}

const llmProviders: LLMProvider[] = [
  {
    id: 'gpt-5',
    name: 'GPT-5',
    model: 'gpt-5-2025-08-07',
    capabilities: ['Text', 'Vision', 'Function Calling'],
    cost: 'Premium'
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    model: 'gpt-4.1-2025-04-14',
    capabilities: ['Text', 'Vision', 'Function Calling'],
    cost: 'High'
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    model: 'claude-opus-4-1-20250805',
    capabilities: ['Text', 'Vision', 'Superior Reasoning'],
    cost: 'Premium'
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    model: 'claude-sonnet-4-20250514',
    capabilities: ['Text', 'Vision', 'High Performance'],
    cost: 'High'
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    model: 'gpt-5-mini-2025-08-07',
    capabilities: ['Text', 'Fast Processing'],
    cost: 'Medium'
  },
  {
    id: 'claude-haiku',
    name: 'Claude Haiku',
    model: 'claude-3-5-haiku-20241022',
    capabilities: ['Text', 'Fastest Response'],
    cost: 'Low'
  }
];

export const ConversationManager: React.FC<ConversationManagerProps> = ({
  agentId,
  enrollmentContext,
  onDataCapture
}) => {
  const { generateResponse } = useUniversalAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedLLM, setSelectedLLM] = useState('gpt-4.1');
  const [isRecording, setIsRecording] = useState(false);
  const [conversationMode, setConversationMode] = useState<'natural' | 'structured'>('natural');
  const [labelStudioEnabled, setLabelStudioEnabled] = useState(true);
  const [auditMode, setAuditMode] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    initializeConversation();
  }, [agentId]);

  const initializeConversation = async () => {
    try {
      // Always create a local session so UI is ready even if DB is unavailable
      const localId = `conv_${Date.now()}`;
      setConversationId(localId);

      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date(),
        metadata: { type: 'welcome' }
      };
      setMessages([welcomeMessage]);

      // Try to persist to Supabase if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user; running local-only conversation');
        return;
      }

      const { data, error } = await supabase
        .from('agent_conversations')
        .insert({
          agent_id: agentId || 'default',
          user_id: user.id,
          session_id: localId,
          title: `Enrollment Conversation ${new Date().toLocaleString()}`,
          conversation_data: [],
          metadata: {
            llm_provider: selectedLLM,
            conversation_mode: conversationMode,
            label_studio_enabled: labelStudioEnabled,
            audit_enabled: auditMode,
            enrollment_context: enrollmentContext
          }
        })
        .select()
        .single();

      if (error) throw error;
      setConversationId(data.id);

    } catch (error) {
      console.warn('Non-blocking: failed to persist conversation to DB', error);
      // Do not block UI or show error toast here
    }
  };
  const getWelcomeMessage = () => {
    if (conversationMode === 'natural') {
      return `Hi there! I'm here to help you with your enrollment process. I'll make this as natural and conversational as possible. 

Let's start by getting to know you a bit. What brings you to us today, and what kind of assistance are you looking for? Feel free to share as much or as little as you're comfortable with - we can always fill in details as we go along.`;
    } else {
      return `Welcome to the enrollment process. I'll guide you through each step systematically to ensure we capture all necessary information accurately. 

Let's begin with your basic information. Could you please provide your full name and primary contact information?`;
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    console.log('📤 ConversationManager sending message:', currentMessage);

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
      metadata: { llm_provider: selectedLLM }
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Store message in database (non-blocking)
      try {
        await updateConversationInDB([...messages, userMessage]);
      } catch (dbError) {
        console.warn('Non-blocking: DB update failed', dbError);
      }

      // Get AI response
      console.log('🤖 Getting AI response...');
      const aiResponse = await getAIResponse(messageToProcess, [...messages, userMessage]);
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: { 
          llm_provider: selectedLLM,
          extracted_data: aiResponse.extractedData
        },
        labelStudioData: labelStudioEnabled ? aiResponse.labelStudioData : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Store updated conversation (non-blocking)
      try {
        await updateConversationInDB([...messages, userMessage, assistantMessage]);
      } catch (dbError) {
        console.warn('Non-blocking: DB update failed', dbError);
      }

      // Trigger data capture if enrollment data was extracted
      if (aiResponse.extractedData && onDataCapture) {
        onDataCapture(aiResponse.extractedData);
      }

    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Add error message to conversation
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        metadata: { error: true, llm_provider: selectedLLM }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (userInput: string, conversationHistory: Message[]) => {
    // Map LLM selection to provider and model
    const id = selectedLLM.toLowerCase();
    let provider: 'openai' | 'claude' | 'gemini' = 'openai';
    if (id.includes('claude')) provider = 'claude';
    else if (id.includes('gemini')) provider = 'gemini';

    const selected = llmProviders.find(p => p.id === selectedLLM);
    const model = selected?.model || (provider === 'openai' ? 'gpt-4.1-2025-04-14' : provider === 'claude' ? 'claude-sonnet-4-20250514' : 'gemini-1.5-pro');

    const response = await generateResponse({
      prompt: userInput,
      provider,
      model,
      context: {
        conversation_mode: conversationMode,
        enrollment_context: enrollmentContext,
        conversation_history: conversationHistory.slice(-10), // Last 10 messages for context
        label_studio_enabled: labelStudioEnabled,
        extract_enrollment_data: true
      },
      temperature: 0.7,
      maxTokens: 1000
    });

    if (!response?.content) throw new Error('No response from AI');
    return { 
      content: response.content,
      extractedData: null,
      labelStudioData: null
    };
  };

  const updateConversationInDB = async (updatedMessages: Message[]) => {
    if (!conversationId) return;

    await supabase
      .from('agent_conversations')
      .update({
        conversation_data: updatedMessages as any,
        updated_at: new Date().toISOString(),
        metadata: {
          llm_provider: selectedLLM,
          conversation_mode: conversationMode,
          label_studio_enabled: labelStudioEnabled,
          audit_enabled: auditMode,
          enrollment_context: enrollmentContext,
          message_count: updatedMessages.length
        }
      })
      .eq('id', conversationId);
  };

  const downloadConversation = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('agent_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      const conversationData = {
        conversation_id: conversationId,
        agent_id: agentId,
        created_at: data.created_at,
        updated_at: data.updated_at,
        llm_provider: selectedLLM,
        conversation_mode: conversationMode,
        messages: messages,
        metadata: data.metadata,
        audit_info: {
          total_messages: messages.length,
          user_messages: messages.filter(m => m.role === 'user').length,
          assistant_messages: messages.filter(m => m.role === 'assistant').length,
          conversation_duration: new Date().getTime() - new Date(data.created_at).getTime(),
          label_studio_enabled: labelStudioEnabled
        }
      };

      const blob = new Blob([JSON.stringify(conversationData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${conversationId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Conversation downloaded successfully');
    } catch (error) {
      console.error('Error downloading conversation:', error);
      toast.error('Failed to download conversation');
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // TODO: Implement voice recording functionality
    toast.info('Voice recording feature coming soon');
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Enrollment Conversation
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={conversationMode === 'natural' ? 'default' : 'secondary'}>
              {conversationMode === 'natural' ? 'Natural' : 'Structured'}
            </Badge>
            <Badge variant="outline">{llmProviders.find(p => p.id === selectedLLM)?.name}</Badge>
          </div>
        </div>
        
        {/* Configuration Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium">LLM Provider</label>
            <Select value={selectedLLM} onValueChange={setSelectedLLM}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {llmProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {provider.capabilities.join(', ')} • {provider.cost}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Conversation Mode</label>
            <Select value={conversationMode} onValueChange={(value: any) => setConversationMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Natural Conversation
                  </div>
                </SelectItem>
                <SelectItem value="structured">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Structured Form
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={labelStudioEnabled} 
                onCheckedChange={(checked) => setLabelStudioEnabled(!!checked)}
              />
              <label className="text-sm">Label Studio Capture</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={auditMode} 
                onCheckedChange={(checked) => setAuditMode(!!checked)}
              />
              <label className="text-sm">Audit Trail</label>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <User className="h-6 w-6 mt-1" />
                    ) : (
                      <Bot className="h-6 w-6 mt-1" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.labelStudioData && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Captured
                        </Badge>
                      )}
                      {message.metadata?.extracted_data && (
                        <Badge variant="outline" className="text-xs">
                          <Database className="h-3 w-3 mr-1" />
                          Data Extracted
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Bot className="h-6 w-6 mt-1" />
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">Thinking...</div>
                    <Sparkles className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder={
                conversationMode === 'natural'
                  ? "Share what's on your mind..."
                  : "Please provide the requested information..."
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="min-h-[60px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              variant="outline"
              size="sm"
              className={isRecording ? 'bg-red-500 text-white' : ''}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={sendMessage} disabled={!currentMessage.trim() || isLoading}>
              Send
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <Alert className="flex-1 mr-4">
            <AlertDescription className="text-xs">
              {auditMode && labelStudioEnabled && (
                <span>
                  🔒 Audit mode enabled - All interactions are being logged for compliance.
                  📊 Label Studio is capturing structured data from your responses.
                </span>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button onClick={downloadConversation} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => {}} variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};