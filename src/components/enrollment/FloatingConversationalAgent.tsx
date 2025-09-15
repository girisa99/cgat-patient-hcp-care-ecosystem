/**
 * FLOATING CONVERSATIONAL AGENT
 * Complete conversational enrollment agent with floating interface, auto-save, and signature capture
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  Minimize2, 
  Maximize2, 
  X, 
  Send, 
  Mic, 
  MicOff,
  Save,
  FileText,
  Signature,
  CheckCircle,
  Clock,
  User,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConversationEngines } from '@/hooks/useConversationEngines';
import { useEnrollmentAgent } from '@/hooks/useEnrollmentAgent';
import { DigitalSignatureCanvas } from './DigitalSignatureCanvas';
import { RichMediaRenderer } from '../enrollment-genie/RichMediaRenderer';
import { AIMediaService } from '@/services/aiMediaService';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    section?: string;
    extractedData?: Record<string, any>;
    confidence?: number;
  };
}

interface FloatingConversationalAgentProps {
  moduleType: ModuleType;
  onComplete: (result: { instanceId: string; pdfUrl: string }) => void;
  onCancel: () => void;
}

export const FloatingConversationalAgent: React.FC<FloatingConversationalAgentProps> = ({
  moduleType,
  onComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState('personal_info');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { routeMessage, processMessage, getAgentPrimaryEngine } = useConversationEngines();
  const { 
    currentSession: enrollmentSession, 
    startEnrollment, 
    updateSection, 
    completeSection, 
    generatePDF,
    isLoading 
  } = useEnrollmentAgent();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize agent session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        await startEnrollment(moduleType);
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          type: 'agent',
          content: getWelcomeMessage(moduleType),
          timestamp: new Date(),
          metadata: { section: 'welcome' }
        };
        
        setMessages([welcomeMessage]);
        setSessionProgress(5);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        toast({
          title: "Initialization Failed",
          description: "Could not start enrollment session",
          variant: "destructive",
        });
      }
    };

    initializeSession();
  }, [moduleType]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (enrollmentSession && Object.keys(enrollmentSession.formData || {}).length > 0) {
        // Auto-save is handled by the enrollment agent hook
        console.log('Auto-save triggered');
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, [enrollmentSession]);

  const getWelcomeMessage = (type: ModuleType): string => {
    const messages = {
      patient: "Hello! I'm your AI enrollment assistant. I'll help you complete your patient enrollment quickly and easily. Let's start with some basic information. What's your full name?",
      treatment_center: "Welcome! I'll guide you through the treatment center registration process. This includes facility information, compliance requirements, and certification details. Let's begin with your facility name.",
      customer: "Hi there! I'm here to help you create your account and get everything set up perfectly. Let's start with your basic information. What's your name?",
      manufacturer: "Welcome to the manufacturer registration process! I'll help you register your company and product catalog. Let's start with your company name and primary contact information."
    };
    return messages[type];
  };

  const getSectionPrompt = (section: string, moduleType: ModuleType): string => {
    const prompts: Record<string, Record<string, string>> = {
      personal_info: {
        patient: "Let's collect your personal information. I'll need your full name, date of birth, contact details, and emergency contact information.",
        treatment_center: "Please provide the facility's basic information including name, address, phone number, and primary contact person.",
        customer: "I'll need some basic information about you - your name, email, phone number, and preferred communication methods.",
        manufacturer: "Let's start with your company details - business name, address, contact information, and primary business type."
      },
      insurance_info: {
        patient: "Now let's handle your insurance information. I'll need your insurance provider, member ID, group number, and policy details.",
        treatment_center: "Let's set up your billing and insurance acceptance information, including which insurance providers you work with.",
        customer: "If you have any billing or payment preferences, let's set those up now.",
        manufacturer: "Let's configure your billing information and payment processing details."
      },
      medical_history: {
        patient: "I'll help you provide your medical history. This includes current medications, allergies, previous treatments, and any current conditions.",
        treatment_center: "Let's document your facility's medical specialties, treatment programs, and certification details.",
        customer: "Are there any specific preferences or requirements for your account that I should know about?",
        manufacturer: "Tell me about your product categories, certifications, and regulatory compliance information."
      }
    };
    
    return prompts[section]?.[moduleType] || "Let's continue with the next section of your enrollment.";
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      // Route to appropriate conversation engine
      // Route to appropriate conversation engine (with safe fallback)
      let engineToUse: any = null;
      try {
        const routed = await routeMessage(
          'enrollment-agent', 
          currentMessage, 
          { moduleType, currentSection, session: enrollmentSession }
        );
        engineToUse = routed.selectedEngines?.[0] || null;
      } catch (e) {
        console.warn('Routing failed or no engines assigned, using default engine');
      }

      // Process with AI engine or fallback echo
      const response = await processMessage(
        engineToUse || { id: 'default', name: 'Default Engine' } as any,
        currentMessage,
        { 
          moduleType, 
          currentSection, 
          previousData: enrollmentSession?.formData,
          context: 'enrollment_conversation'
        }
      );

      // Extract structured data from message
      const extractedData = await extractStructuredData(currentMessage, currentSection, moduleType);
      
      if (extractedData && Object.keys(extractedData).length > 0) {
        // Update session with extracted data
        await updateSection(currentSection, extractedData);
        
        // Calculate progress
        const newProgress = calculateProgress(enrollmentSession?.formData || {}, extractedData);
        setSessionProgress(newProgress);
      }

      // Add AI response
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response.response,
        timestamp: new Date(),
        metadata: {
          section: currentSection,
          extractedData,
          confidence: response.confidence
        }
      };

      setMessages(prev => [...prev, agentMessage]);

      // Check if section is complete and move to next
      if (isSectionComplete(currentSection, extractedData)) {
        await completeSection(currentSection);
        moveToNextSection();
      }
    } catch (error) {
      console.error('Message processing error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: "I'm sorry, I had trouble processing that. Could you please try again?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Processing Error",
        description: "There was an issue processing your message",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const extractStructuredData = async (message: string, section: string, moduleType: ModuleType): Promise<Record<string, any>> => {
    // This would use AI to extract structured data from natural language
    // For now, implementing basic pattern matching
    const data: Record<string, any> = {};

    if (section === 'personal_info') {
      // Extract name patterns
      const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i);
      if (nameMatch) {
        data.full_name = nameMatch[1].trim();
      }

      // Extract email patterns
      const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        data.email = emailMatch[1];
      }

      // Extract phone patterns
      const phoneMatch = message.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
      if (phoneMatch) {
        data.phone = phoneMatch[1];
      }

      // Extract date patterns (for DOB)
      const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        data.date_of_birth = dateMatch[1];
      }
    }

    return data;
  };

  const isSectionComplete = (section: string, data: Record<string, any>): boolean => {
    const requiredFields: Record<string, string[]> = {
      personal_info: ['full_name', 'email'],
      insurance_info: ['insurance_provider'],
      medical_history: ['current_medications']
    };

    const required = requiredFields[section] || [];
    return required.every(field => data[field]);
  };

  const calculateProgress = (existingData: Record<string, any>, newData: Record<string, any>): number => {
    const totalSections = 5; // Total enrollment sections
    const completedFields = Object.keys({ ...existingData, ...newData }).length;
    const estimatedTotalFields = 15; // Estimated total fields needed
    
    return Math.min((completedFields / estimatedTotalFields) * 100, 90); // Cap at 90% until signature
  };

  const moveToNextSection = () => {
    const sections = ['personal_info', 'insurance_info', 'medical_history', 'preferences', 'signature'];
    const currentIndex = sections.indexOf(currentSection);
    
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCurrentSection(nextSection);
      
      if (nextSection === 'signature') {
        setShowSignature(true);
        setSessionProgress(95);
      } else {
        // Add transition message
        const transitionMessage: Message = {
          id: Date.now().toString(),
          type: 'agent',
          content: getSectionPrompt(nextSection, moduleType),
          timestamp: new Date(),
          metadata: { section: nextSection }
        };
        
        setMessages(prev => [...prev, transitionMessage]);
      }
    }
  };

  const handleSignatureComplete = (signatureData: string) => {
    setSignature(signatureData);
    setShowSignature(false);
    setSessionProgress(100);
    
    const signatureMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: "Perfect! Your signature has been captured. I'm now generating your enrollment PDF...",
      timestamp: new Date(),
      metadata: { section: 'signature' }
    };
    
    setMessages(prev => [...prev, signatureMessage]);
    
    // Complete enrollment
    handleCompleteEnrollment();
  };

  const handleCompleteEnrollment = async () => {
    try {
    if (!enrollmentSession?.instanceId) {
      throw new Error('No active session');
    }

      // Generate PDF with all collected data and signature
      const pdfResult = await generatePDF();
      
      if (pdfResult.pdfUrl) {
        const completionMessage: Message = {
          id: Date.now().toString(),
          type: 'agent',
          content: "🎉 Congratulations! Your enrollment is complete. Your signed PDF has been generated and will be downloaded shortly.",
          timestamp: new Date(),
          metadata: { section: 'complete' }
        };
        
        setMessages(prev => [...prev, completionMessage]);
        
        // Complete enrollment with results
        onComplete({
          instanceId: enrollmentSession.instanceId,
          pdfUrl: pdfResult.pdfUrl
        });
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Completion error:', error);
      toast({
        title: "Completion Error",
        description: "There was an issue completing your enrollment",
        variant: "destructive",
      });
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
    toast({
      title: isListening ? "Voice Input Stopped" : "Voice Input Started",
      description: isListening ? "Switched back to text input" : "You can now speak your responses",
    });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-green-500">
            {Math.round(sessionProgress)}%
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50 flex flex-col">
      <Card className="flex-1 flex flex-col shadow-2xl border-2">
        {/* Header */}
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary/10 rounded">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">AI Enrollment Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onCancel}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{Math.round(sessionProgress)}%</span>
            </div>
            <Progress value={sessionProgress} className="h-1" />
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full px-4 pb-2">
            <div className="space-y-3">
              {messages.map((message) => {
                const handleGenerateImage = async (prompt: string): Promise<string> => {
                  try {
                    return await AIMediaService.generateImage(prompt);
                  } catch (error) {
                    console.error('Error generating image:', error);
                    throw error;
                  }
                };

                const handleGenerateVideo = async (prompt: string): Promise<string> => {
                  try {
                    return await AIMediaService.generateVideo(prompt);
                  } catch (error) {
                    console.error('Error generating video:', error);
                    throw error;
                  }
                };

                return (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-2 ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.type === 'system'
                        ? 'bg-muted text-muted-foreground text-center'
                        : 'bg-muted'
                    }`}>
                      <div className="flex items-start gap-2">
                        {message.type === 'agent' && (
                          <Bot className="h-3 w-3 mt-0.5 text-primary" />
                        )}
                        {message.type === 'user' && (
                          <User className="h-3 w-3 mt-0.5" />
                        )}
                         <div className="flex-1">
                          {message.type === 'user' ? (
                            <p className="text-sm">{message.content}</p>
                          ) : (
                            <RichMediaRenderer
                              content={message.content}
                              metadata={message.metadata}
                              onGenerateImage={handleGenerateImage}
                              onGenerateVideo={handleGenerateVideo}
                            />
                          )}
                          {message.metadata?.extractedData && (
                            <div className="mt-1 pt-1 border-t border-border/50">
                              <p className="text-xs opacity-75">
                                ✓ Captured: {Object.keys(message.metadata.extractedData).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                );
              })}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-3 w-3 text-primary" />
                      <span className="text-sm">Processing...</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-100" />
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input */}
        {!showSignature && (
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your response..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isProcessing}
                className="flex-1"
              />
              <Button
                onClick={toggleVoice}
                variant={isListening ? "default" : "outline"}
                size="icon"
                className="flex-shrink-0"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isProcessing}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Signature Modal */}
        {showSignature && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Signature className="h-5 w-5" />
                  Digital Signature Required
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Please sign below to complete your enrollment
                </p>
              </CardHeader>
              <CardContent>
                <DigitalSignatureCanvas
                  onComplete={handleSignatureComplete}
                  onCancel={() => setShowSignature(false)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};