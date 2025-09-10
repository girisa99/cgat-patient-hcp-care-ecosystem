/**
 * AGENT ENROLLMENT FLOW
 * Handles the complete AI-powered enrollment process
 * Connects to backend and updates frontend in real-time
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Loader2,
  Download,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface ConversationMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface SectionProgress {
  name: string;
  completed: boolean;
  data: Record<string, any>;
}

interface AgentEnrollmentFlowProps {
  moduleType: ModuleType;
  onComplete: (data: { instanceId: string; pdfUrl: string }) => void;
  onCancel: () => void;
}

export const AgentEnrollmentFlow: React.FC<AgentEnrollmentFlowProps> = ({
  moduleType,
  onComplete,
  onCancel
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sectionProgress, setSectionProgress] = useState<SectionProgress[]>([]);
  const [currentSection, setCurrentSection] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [instanceId] = useState(() => crypto.randomUUID());
  const { toast } = useToast();

  // Initialize conversation
  useEffect(() => {
    initializeConversation();
  }, [moduleType]);

  const initializeConversation = async () => {
    setIsLoading(true);
    try {
      // Initialize sections based on module type
      const sections = getSectionsForModule(moduleType);
      setSectionProgress(sections.map(name => ({ name, completed: false, data: {} })));

      // Start with AI greeting
      const greeting = await getInitialGreeting(moduleType);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      }]);

      setCurrentSection(sections[0]);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start enrollment process",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSectionsForModule = (module: ModuleType): string[] => {
    const sectionMap = {
      patient: ['Demographics', 'Medical History', 'Insurance Information', 'Consent & Agreements'],
      treatment_center: ['Facility Information', 'Licensing & Certifications', 'Staff Credentials', 'Service Agreements'],
      customer: ['Account Information', 'Service Preferences', 'Billing Setup', 'Account Verification'],
      manufacturer: ['Company Details', 'Product Catalog', 'Certifications & Compliance', 'Partnership Agreements']
    };
    return sectionMap[module];
  };

  const getInitialGreeting = async (module: ModuleType): Promise<string> => {
    const greetings = {
      patient: "Hello! I'm your AI enrollment assistant. I'll help you complete your patient enrollment quickly and efficiently. We'll go through your demographics, medical history, insurance, and consent forms. Shall we begin with your basic information?",
      treatment_center: "Welcome! I'm here to help with your treatment center onboarding. I'll guide you through facility information, licensing, staff credentials, and service agreements. Let's start with your facility details.",
      customer: "Hi there! I'll assist with your customer enrollment today. We'll set up your account, preferences, billing, and verify your information. Ready to get started with your account details?",
      manufacturer: "Greetings! I'm your manufacturer registration assistant. I'll help you register your company, catalog products, verify certifications, and set up partnership agreements. Let's begin with your company information."
    };
    return greetings[module];
  };

  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Send to AI agent for processing
      const { data, error } = await supabase.functions.invoke('chat-with-claude', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are an enrollment assistant for ${moduleType} enrollment. Current section: ${currentSection}. 
              Extract structured data from user responses and ask follow-up questions. 
              Respond in JSON format with: { "message": "response text", "extractedData": {}, "isComplete": boolean, "nextQuestion": "question" }`
            },
            {
              role: 'user', 
              content: userMessage.content
            }
          ],
          model: 'claude-3-5-sonnet-20241022'
        }
      });

      if (error) throw error;

      const aiResponse = data.content;
      let parsedResponse;
      
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        // Fallback if not valid JSON
        parsedResponse = {
          message: aiResponse,
          extractedData: {},
          isComplete: false,
          nextQuestion: null
        };
      }

      // Add AI response to messages
      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: parsedResponse.message,
        timestamp: new Date(),
        metadata: parsedResponse
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update form data
      if (parsedResponse.extractedData && Object.keys(parsedResponse.extractedData).length > 0) {
        setFormData(prev => ({
          ...prev,
          [currentSection]: {
            ...prev[currentSection],
            ...parsedResponse.extractedData
          }
        }));
      }

      // Check if section is complete
      if (parsedResponse.isComplete) {
        // Mark current section as complete
        setSectionProgress(prev => 
          prev.map(section => 
            section.name === currentSection 
              ? { ...section, completed: true, data: formData[currentSection] || {} }
              : section
          )
        );

        // Move to next section or complete
        const currentIndex = sectionProgress.findIndex(s => s.name === currentSection);
        const nextSection = sectionProgress[currentIndex + 1];
        
        if (nextSection) {
          setCurrentSection(nextSection.name);
        } else {
          // All sections complete - generate PDF and finish
          await completeEnrollment();
        }
      }

    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, isLoading, currentSection, formData, sectionProgress, moduleType, toast]);

  const completeEnrollment = async () => {
    try {
      setIsLoading(true);

      // Generate PDF with collected data
      const { data, error } = await supabase.functions.invoke('generate-enrollment-pdf', {
        body: {
          moduleType,
          formData,
          instanceId
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your enrollment has been completed successfully.",
      });

      onComplete({
        instanceId,
        pdfUrl: data.pdfUrl
      });

    } catch (error) {
      console.error('Error completing enrollment:', error);
      toast({
        title: "Error",
        description: "Failed to complete enrollment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completedSections = sectionProgress.filter(s => s.completed).length;
  const progressPercentage = (completedSections / sectionProgress.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Bot className="h-6 w-6" />
              AI-Powered {moduleType.replace('_', ' ')} Enrollment
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {completedSections} of {sectionProgress.length} sections</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Section: {currentSection}</CardTitle>
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="flex-1">
        <CardContent className="p-0">
          {/* Messages */}
          <div className="max-h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    message.role === 'user' ? 'bg-primary' : 'bg-muted'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your response here..."
                className="resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!currentInput.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Section Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectionProgress.map((section) => (
              <div
                key={section.name}
                className={`p-3 rounded-lg border ${
                  section.completed
                    ? 'bg-green-50 border-green-200'
                    : section.name === currentSection
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-muted/50 border-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  {section.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : section.name === currentSection ? (
                    <Clock className="h-4 w-4 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{section.name}</span>
                </div>
                <Badge 
                  variant={section.completed ? "default" : section.name === currentSection ? "secondary" : "outline"}
                  className="mt-2"
                >
                  {section.completed ? 'Complete' : section.name === currentSection ? 'In Progress' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};