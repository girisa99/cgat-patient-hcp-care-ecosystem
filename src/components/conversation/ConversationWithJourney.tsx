import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Clock, AlertCircle } from 'lucide-react';
import { useAgentConversations } from '@/hooks/useAgentConversations';
import { JourneyContext, JourneyStage } from '@/hooks/useJourneyExecution';
import JourneyProgressIndicator from '@/components/journey/JourneyProgressIndicator';
import JourneyStageActions from '@/components/journey/JourneyStageActions';

interface ConversationWithJourneyProps {
  agentId: string;
  agentName?: string;
  onClose?: () => void;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const ConversationWithJourney: React.FC<ConversationWithJourneyProps> = ({
  agentId,
  agentName = 'Agent',
  onClose
}) => {
  const {
    conversations,
    createConversation,
    sendMessage,
    getConversation,
    getJourneyContext,
    getCurrentJourneyStage,
    progressJourneyStage,
    validateStageConditions,
    loading
  } = useAgentConversations();

  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [journeyContext, setJourneyContext] = useState<JourneyContext | null>(null);
  const [currentStage, setCurrentStage] = useState<JourneyStage | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  // Initialize conversation and journey
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const conversation = await createConversation(
          agentId,
          `session_${Date.now()}`,
          `Conversation with ${agentName}`,
          { agent_name: agentName },
          true // Initialize journey
        );

        if (conversation) {
          setCurrentConversation(conversation);
          await loadJourneyData(conversation.id);
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
      }
    };

    initializeSession();
  }, [agentId, agentName, createConversation]);

  // Load journey context and current stage
  const loadJourneyData = async (conversationId: string) => {
    try {
      const context = await getJourneyContext(conversationId);
      if (context) {
        setJourneyContext(context);
        const stage = getCurrentJourneyStage(context);
        setCurrentStage(stage);
      }
    } catch (error) {
      console.error('Failed to load journey data:', error);
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation || sending) return;

    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
      metadata: {
        journey_stage_id: currentStage?.id,
        stage_context: currentStage?.title
      }
    };

    try {
      setSending(true);
      setMessageInput('');

      // Send user message
      await sendMessage(currentConversation.id, userMessage);

      // Simulate agent response (in real implementation, this would be handled by the agent)
      setTimeout(async () => {
        const agentResponse: ConversationMessage = {
          id: `msg_${Date.now() + 1}`,
          type: 'agent',
          content: generateStageContextResponse(userMessage.content, currentStage),
          timestamp: new Date().toISOString(),
          metadata: {
            journey_stage_id: currentStage?.id,
            stage_context: currentStage?.title,
            generated: true
          }
        };

        await sendMessage(currentConversation.id, agentResponse);
        
        // Update conversation state
        const updatedConversation = getConversation(currentConversation.id);
        if (updatedConversation) {
          setCurrentConversation(updatedConversation);
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  // Generate contextual responses based on current journey stage
  const generateStageContextResponse = (userInput: string, stage: JourneyStage | null): string => {
    if (!stage) return "I'm here to help! How can I assist you today?";

    switch (stage.type) {
      case 'information_gathering':
        return `Thank you for that information. For this ${stage.title} stage, I need to gather some details. ${stage.description || ''}. What else can you tell me?`;
      case 'decision_point':
        return `I understand. We're at a ${stage.title} stage where we need to make some decisions. ${stage.description || ''}. Based on what you've shared, here are some options...`;
      case 'action_required':
        return `Great! For this ${stage.title} stage, we need to take some action. ${stage.description || ''}. Let me help you with the next steps.`;
      case 'completion':
        return `Excellent! We're in the final ${stage.title} stage. ${stage.description || ''}. Let's wrap this up properly.`;
      default:
        return `Thank you for your message. We're currently in the ${stage.title} stage. How can I help you move forward?`;
    }
  };

  // Handle journey stage progression
  const handleProgressStage = async (nextStageId?: string, reason?: string, data?: any) => {
    if (!currentConversation) return;

    try {
      await progressJourneyStage(currentConversation.id, nextStageId, reason, data);
      await loadJourneyData(currentConversation.id);
    } catch (error) {
      console.error('Failed to progress stage:', error);
    }
  };

  // Validate current stage conditions
  const handleValidateStage = (stage: JourneyStage) => {
    if (!currentConversation) return { valid: true, errors: [] };

    const validation = validateStageConditions(stage, currentConversation.conversation_data || []);
    return {
      valid: validation.valid,
      errors: [
        ...validation.missingFields.map(field => `Missing required field: ${field}`),
        ...validation.errors
      ]
    };
  };

  if (loading && !currentConversation) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Initializing conversation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-4 w-full max-w-7xl mx-auto">
      {/* Main Conversation Area */}
      <div className="flex-1">
        <Card className="h-[700px] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversation with {agentName}</CardTitle>
              <div className="flex items-center gap-2">
                {currentStage && (
                  <Badge variant="outline" className="text-sm">
                    {currentStage.title}
                  </Badge>
                )}
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <Separator />
          
          {/* Messages Area */}
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Welcome Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm">
                        Hello! I'm {agentName}. I'll be guiding you through our journey stages to help you achieve your goals. 
                        {currentStage && ` We'll start with: ${currentStage.title}.`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Conversation Messages */}
                {currentConversation?.conversation_data?.map((message: ConversationMessage) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {message.type === 'user' ? (
                        <User className="w-5 h-5 text-primary" />
                      ) : message.type === 'system' ? (
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Bot className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-8' 
                          : message.type === 'system'
                          ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        {message.metadata?.stage_context && (
                          <Badge variant="secondary" className="text-xs">
                            {message.metadata.stage_context}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {sending && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Agent is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={sending}
                />
                <Button onClick={handleSendMessage} disabled={sending || !messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Sidebar */}
      <div className="w-80 space-y-4">
        <JourneyProgressIndicator 
          journeyContext={journeyContext}
          className="sticky top-4"
        />
        
        <JourneyStageActions
          conversationId={currentConversation?.id || ''}
          journeyContext={journeyContext}
          currentStage={currentStage}
          onProgressStage={handleProgressStage}
          onValidateStage={handleValidateStage}
          disabled={!currentConversation}
        />
      </div>
    </div>
  );
};

export default ConversationWithJourney;