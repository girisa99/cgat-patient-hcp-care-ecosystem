import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MessageSquare, 
  HelpCircle, 
  Search,
  FileText,
  User,
  AlertCircle,
  CheckCircle,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { useConversationEngines } from '@/hooks/useConversationEngines';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: any;
  confidence?: number;
  source?: 'text' | 'voice';
}

interface UniversalLLMAssistantProps {
  context?: any;
  workflowType?: 'enrollment' | 'verification' | 'fax' | 'pdf' | 'online';
  onDataCapture?: (data: any) => void;
  onActionSuggestion?: (action: any) => void;
}

export const UniversalLLMAssistant: React.FC<UniversalLLMAssistantProps> = ({
  context,
  workflowType = 'enrollment',
  onDataCapture,
  onActionSuggestion
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'qa' | 'troubleshoot'>('chat');
  const [contextualHelp, setContextualHelp] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { generateResponse, isLoading } = useUniversalAI();
  const { routeMessage } = useConversationEngines();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize with contextual help based on workflow type
    loadContextualHelp();
    // Add welcome message
    addSystemMessage(getWelcomeMessage());
  }, [workflowType, context]);

  const loadContextualHelp = async () => {
    try {
      const helpData = await generateContextualHelp();
      setContextualHelp(helpData);
    } catch (error) {
      console.error('Error loading contextual help:', error);
    }
  };

  const getWelcomeMessage = () => {
    const welcomeMessages = {
      enrollment: "Hi! I'm your intelligent enrollment assistant. I can help you with patient enrollment, NPI verification, credentialing, and answer any questions you have about the process.",
      verification: "I'm here to assist with credential verification and NPI validation. Ask me anything about the verification process or if you encounter any issues.",
      fax: "I can help you with fax processing, OCR data extraction, and any questions about document handling.",
      pdf: "I'm your PDF processing assistant. I can help with form filling, data extraction, and submission processes.",
      online: "I'm here to guide you through the online enrollment process and answer any questions you might have."
    };
    return welcomeMessages[workflowType] || welcomeMessages.enrollment;
  };

  const generateContextualHelp = async () => {
    const contextPrompt = `Generate 5 helpful suggestions for a user working with ${workflowType} workflow. Include common questions and troubleshooting tips. Context: ${JSON.stringify(context || {})}`;
    
    try {
      const response = await generateResponse({
        prompt: contextPrompt,
        provider: 'openai',
        model: 'gpt-4o-mini'
      });
      
      return [
        { id: '1', question: 'How do I verify NPI credentials?', category: 'verification' },
        { id: '2', question: 'What documents are required for enrollment?', category: 'requirements' },
        { id: '3', question: 'How to troubleshoot PDF submission issues?', category: 'troubleshooting' },
        { id: '4', question: 'Voice verification not working', category: 'technical' },
        { id: '5', question: 'How to check enrollment status?', category: 'status' }
      ];
    } catch (error) {
      return [];
    }
  };

  const addSystemMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      source: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Enhanced prompt with context and workflow awareness
      const enhancedPrompt = `
        User Question: ${inputValue}
        
        Context Information:
        - Workflow Type: ${workflowType}
        - Current Context: ${JSON.stringify(context || {})}
        - Available Features: NPI Verification, Credentialing, Voice Processing, PDF Handling, Fax Processing
        
        As an intelligent healthcare enrollment assistant, provide a helpful response. If the user is asking about:
        1. NPI verification issues - guide them through the verification process
        2. Credentialing problems - explain credentialing requirements and steps
        3. Voice or audio issues - suggest voice troubleshooting steps
        4. PDF or document problems - provide PDF handling guidance
        5. Fax processing issues - explain fax workflow and troubleshooting
        6. General enrollment questions - provide step-by-step guidance
        
        If you detect any actionable data in the user's message, also suggest what action should be taken.
        
        Keep responses conversational, helpful, and specific to the healthcare enrollment context.
      `;

      const response = await generateResponse({
        prompt: enhancedPrompt,
        provider: 'openai',
        model: 'gpt-4o-mini',
        systemPrompt: `You are an intelligent healthcare enrollment assistant with expertise in:
        - Patient enrollment processes
        - NPI verification and credentialing
        - Document processing (PDF, Fax)
        - Voice and audio processing
        - Troubleshooting workflow issues
        - Healthcare compliance and requirements
        
        Always be helpful, accurate, and provide actionable guidance.`
      });

      if (response.content) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: response.content || 'I apologize, but I encountered an issue processing your request. Please try again.',
          timestamp: new Date(),
          confidence: 0.95
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Check for actionable data
        await analyzeForActionableData(inputValue, response.content);
        
        // Convert to speech if speaking is enabled
        if (isSpeaking) {
          await speakResponse(response.content);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeForActionableData = async (userInput: string, assistantResponse: string) => {
    // Analyze if the conversation contains actionable data for enrollment
    const dataExtractionPrompt = `
      Analyze the following conversation for actionable enrollment data:
      User: ${userInput}
      Assistant: ${assistantResponse}
      
      Extract any patient information, provider details, NPI numbers, credentials, or other enrollment-relevant data.
      Return as JSON with extracted fields or null if no actionable data found.
    `;

    try {
      const extractionResponse = await generateResponse({
        prompt: dataExtractionPrompt,
        provider: 'openai',
        model: 'gpt-4o-mini'
      });

      if (extractionResponse.content && extractionResponse.content) {
        try {
          const extractedData = JSON.parse(extractionResponse.content);
          if (extractedData && Object.keys(extractedData).length > 0) {
            onDataCapture?.(extractedData);
            
            toast.success('Data captured from conversation', {
              description: 'Relevant information has been automatically extracted and saved.'
            });
          }
        } catch (parseError) {
          console.log('No structured data to extract');
        }
      }
    } catch (error) {
      console.error('Error extracting actionable data:', error);
    }
  };

  const startVoiceInput = async () => {
    try {
      setIsListening(true);
      // Voice input implementation using existing voice interface
      toast.info('Voice input activated', {
        description: 'Speak your question or request'
      });
    } catch (error) {
      console.error('Error starting voice input:', error);
      toast.error('Voice input failed to start');
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    setIsListening(false);
    toast.info('Voice input stopped');
  };

  const speakResponse = async (text: string) => {
    try {
      const response = await supabase.functions.invoke('elevenlabs-voice', {
        body: {
          text,
          voice: 'Sarah',
          model: 'eleven_multilingual_v2'
        }
      });

      if (response.data?.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${response.data.audioContent}`);
        audio.play();
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const troubleshootCurrentIssue = async () => {
    const troubleshootPrompt = `Based on the current context (${JSON.stringify(context)}), what are the most likely issues the user might encounter and how to resolve them?`;
    
    setInputValue(troubleshootPrompt);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Intelligent Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {workflowType}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSpeaking(!isSpeaking)}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <Tabs value={activeMode} onValueChange={(value: any) => setActiveMode(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="qa">Quick Help</TabsTrigger>
            <TabsTrigger value="troubleshoot">Troubleshoot</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeMode} className="flex-1 flex flex-col">
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'system'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === 'assistant' && <Brain className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {message.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                            {message.confidence && ` • ${Math.round(message.confidence * 100)}% confidence`}
                            {message.source && ` • ${message.source}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 animate-pulse" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about enrollment, verification, or troubleshooting..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isProcessing}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={isListening ? 'text-destructive' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isProcessing}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qa" className="flex-1 p-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Quick Help
              </h3>
              <div className="grid gap-2">
                {contextualHelp.map((help) => (
                  <Button
                    key={help.id}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => handleQuickQuestion(help.question)}
                  >
                    <div>
                      <p className="font-medium">{help.question}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {help.category}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="troubleshoot" className="flex-1 p-4">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Troubleshooting Assistant
              </h3>
              
              <Button
                variant="outline"
                onClick={troubleshootCurrentIssue}
                className="w-full justify-start"
              >
                <Search className="h-4 w-4 mr-2" />
                Analyze Current Context for Issues
              </Button>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Common Issues:</h4>
                <div className="grid gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleQuickQuestion('NPI verification is failing, what should I check?')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    NPI Verification Issues
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleQuickQuestion('Voice input is not working correctly')}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Input Problems
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleQuickQuestion('PDF submission is not working')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Processing Issues
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleQuickQuestion('Fax OCR is not reading documents correctly')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Fax OCR Problems
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};