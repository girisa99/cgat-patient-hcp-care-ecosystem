/**
 * MCP STEPWISE ENROLLMENT AGENT
 * Schema-driven patient enrollment following exact form structure
 * Uses Patient ID as primary key with proper enrollment source tracking
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Shield, 
  FileCheck, 
  MessageCircle, 
  CheckCircle,
  Bot,
  Database,
  Activity,
  Zap,
  AlertCircle,
  Workflow,
  Heart,
  Building2,
  CreditCard,
  Stethoscope
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ENROLLMENT_SECTION_MAPPINGS, 
  getSectionByKey, 
  getNextSection,
  type EnrollmentSectionKey,
  type PatientEnrollmentSession,
  type EnrollmentSource,
  type ConsentMethod
} from '@/types/patientEnrollmentMapping';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface MCPStepwiseEnrollmentAgentProps {
  moduleType: ModuleType;
  onComplete?: (result: { instanceId: string; pdfUrl: string }) => void;
  onCancel?: () => void;
}

interface EnrollmentStep {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  mcpTools: string[];
  realtimeEnabled: boolean;
  requiredFields: string[];
  validationRules: Record<string, any>;
  aiPrompt: string;
}

interface MCPSession {
  sessionId: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  currentStep: string;
  conversationHistory: ConversationMessage[];
  mcpTools: string[];
  metadata: Record<string, any>;
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  step: string;
  metadata: Record<string, any>;
}

export const MCPStepwiseEnrollmentAgent: React.FC<MCPStepwiseEnrollmentAgentProps> = ({
  moduleType,
  onComplete,
  onCancel
}) => {
  const { toast } = useToast();

  // Generate enrollment steps from schema-mapped sections
  const enrollmentSteps: EnrollmentStep[] = Object.values(ENROLLMENT_SECTION_MAPPINGS).map(section => {
    const iconMap: Record<EnrollmentSectionKey, any> = {
      submission_method: Workflow,
      consent_management: Shield,
      patient_information: User,
      provider_treatment_center: Stethoscope,
      insurance_information: CreditCard,
      clinical_treatment: Heart,
      final_submit: FileCheck
    };

    return {
      id: section.sectionKey,
      name: section.sectionTitle,
      icon: iconMap[section.sectionKey],
      description: section.description,
      mcpTools: ['get_schema', 'query_data', 'insert_data', 'get_conversation_context'],
      realtimeEnabled: section.realtimeEnabled,
      requiredFields: section.requiredFields,
      validationRules: section.validationRules,
      aiPrompt: getAIPromptForSection(section.sectionKey)
    };
  });

  // AI prompts for each section
  function getAIPromptForSection(sectionKey: EnrollmentSectionKey): string {
    const prompts: Record<EnrollmentSectionKey, string> = {
      submission_method: 'Welcome! I see you\'ve chosen MCP (Conversational Agent) for your enrollment. Let\'s get started with collecting your information.',
      consent_management: 'Now I need to capture your consent information. I\'ll need details about your healthcare provider and your preferred method for providing consent.',
      patient_information: 'Let\'s collect your basic information. I\'ll ask for your name, date of birth, contact details, and address information.',
      provider_treatment_center: 'I need information about your healthcare provider and treatment center, including NPI verification for credentialing.',
      insurance_information: 'Now let\'s verify your insurance coverage. I\'ll need your insurance card information to check benefits.',
      clinical_treatment: 'Finally, I need some clinical information about your condition and treatment goals.',
      final_submit: 'Let\'s review all the information we\'ve collected and submit your enrollment.'
    };
    return prompts[sectionKey];
  }

  // State management
  const [mcpSession, setMcpSession] = useState<MCPSession | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Patient enrollment session tracking
  const [patientEnrollmentSession, setPatientEnrollmentSession] = useState<PatientEnrollmentSession | null>(null);
  const [patientId] = useState(() => crypto.randomUUID());
  const [enrollmentSource] = useState<EnrollmentSource>('mcp'); // Set as MCP source
  const [consentMethod, setConsentMethod] = useState<ConsentMethod | null>(null);

  // Initialize MCP session with patient enrollment tracking
  const initializeMCPSession = async (): Promise<{ session: MCPSession; enrollment: PatientEnrollmentSession } | null> => {
    try {
      const sessionId = crypto.randomUUID();
      
      const initialAssistantMessage: ConversationMessage = {
        role: 'assistant',
        content: getAIPromptForSection(enrollmentSteps[0].id as EnrollmentSectionKey),
        timestamp: new Date().toISOString(),
        step: enrollmentSteps[0].id,
        metadata: { mcpTools: enrollmentSteps[0].mcpTools }
      };

      const newSession: MCPSession = {
        sessionId,
        status: 'active',
        currentStep: enrollmentSteps[0].id,
        conversationHistory: [initialAssistantMessage],
        mcpTools: enrollmentSteps[0].mcpTools,
        metadata: {
          enrollmentType: 'patient_enrollment',
          startTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          source: 'mcp_agent',
          patientId: patientId
        }
      };

      // Initialize patient enrollment session
      const enrollmentSession: PatientEnrollmentSession = {
        patient_id: patientId,
        session_id: sessionId,
        enrollment_source: enrollmentSource,
        consent_method: 'digital_signature', // Default, will be updated in consent section
        current_section: 'submission_method',
        enrollment_status: 'in_progress',
        progress_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          mcp_session: newSession.metadata,
          workflow_version: '1.0.0'
        }
      };

      setMcpSession(newSession);
      setPatientEnrollmentSession(enrollmentSession);
      
      // Initialize in database with patient_id as primary key
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user?.id) {
        toast({
          title: "Sign-in required",
          description: "Please sign in to start an enrollment session.",
          variant: "destructive",
        });
        return null;
      }

      await supabase.from('patient_enrollments').insert({
        id: patientId, // Using patient_id as the primary key
        session_id: sessionId,
        enrollment_status: 'in_progress',
        current_section: 'submission_method',
        progress_percentage: 0,
        metadata: enrollmentSession.metadata,
        user_id: authUser.user.id
      });

      toast({
        title: "Enrollment Started",
        description: `MCP enrollment session initialized for Patient ID: ${patientId}`,
      });
      
      return { session: newSession, enrollment: enrollmentSession };
      
    } catch (error) {
      console.error('Failed to initialize MCP session:', error);
      toast({
        title: "Session Error",
        description: "Failed to start enrollment session. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };
  // Process user message with MCP and schema mapping
  const processMessageWithMCP = async (message: string) => {
    if (!mcpSession || !patientEnrollmentSession || isProcessing || !message.trim()) return;
    
    setIsProcessing(true);
    const currentStep = enrollmentSteps[currentStepIndex];
    const currentSectionMapping = getSectionByKey(currentStep.id as EnrollmentSectionKey);
    
    try {
      // Add user message to conversation
      const userMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        step: currentStep.id,
        metadata: {
          patientId: patientId,
          sectionKey: currentSectionMapping.sectionKey
        }
      };

      setMcpSession(prev => prev ? {
        ...prev,
        conversationHistory: [...prev.conversationHistory, userMessage]
      } : null);

      // Clear input after sending
      setCurrentMessage('');

      // Use MCP context with schema mapping
      const mcpContext = {
        sessionId: mcpSession.sessionId,
        patientId: patientId,
        currentStep: currentStep.id,
        currentSection: currentSectionMapping,
        stepDescription: currentStep.description,
        requiredFields: currentStep.requiredFields,
        validationRules: currentStep.validationRules,
        mcpTools: currentStep.mcpTools,
        collectedData: collectedData,
        conversationHistory: mcpSession.conversationHistory,
        enrollmentSource: enrollmentSource,
        consentMethod: consentMethod
      };

      // Simulate AI processing with schema-aware response
      const aiResponse = await generateSchemaAwareResponse(message, mcpContext, currentSectionMapping);

      // Extract and validate data using schema mapping
      const extractedData = extractDataFromResponse(aiResponse, currentSectionMapping.fields);
      if (Object.keys(extractedData).length > 0) {
        await updateRealtimeDataWithMapping(currentSectionMapping, extractedData);
        
        // Update consent method if we're in consent management section
        if (currentSectionMapping.sectionKey === 'consent_management' && extractedData.patient_consent_method) {
          setConsentMethod(extractedData.patient_consent_method as ConsentMethod);
          
          // Trigger consent collection workflow
          await triggerConsentCollection(extractedData.patient_consent_method as ConsentMethod, patientId);
        }
      }

      // Add AI response to conversation
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        step: currentStep.id,
        metadata: { 
          mcpTools: currentStep.mcpTools,
          extractedData: extractedData,
          sectionMapping: currentSectionMapping.sectionKey,
          destinationTable: currentSectionMapping.destinationTable
        }
      };

      setMcpSession(prev => prev ? {
        ...prev,
        conversationHistory: [...prev.conversationHistory, aiMessage]
      } : null);

      // Check if step is complete using schema validation
      const isStepComplete = checkStepCompletionWithMapping(currentSectionMapping, { ...collectedData, ...extractedData });
      if (isStepComplete && currentStepIndex < enrollmentSteps.length - 1) {
        setTimeout(() => {
          advanceToNextStep();
        }, 1500);
      }

    } catch (error) {
      console.error('MCP processing error:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate schema-aware AI response
  const generateSchemaAwareResponse = async (
    message: string, 
    context: any, 
    sectionMapping: any
  ): Promise<string> => {
    // Simulate intelligent response based on current section and required fields
    const { sectionKey } = sectionMapping;
    
    switch (sectionKey) {
      case 'submission_method':
        return `I see you've chosen MCP (Conversational Agent) as your enrollment method. This allows us to walk through each section step by step. Ready to continue with consent management?`;
      
      case 'consent_management':
        if (!context.collectedData.provider_name) {
          return `For consent management, I need information about your healthcare provider. Can you tell me the provider's name and NPI number who will be handling your care?`;
        } else if (!context.collectedData.patient_consent_method) {
          return `Great! Now I need to know your preferred method for providing consent. Would you like to provide consent via WhatsApp, SMS, email, verbal consent, or digital signature?`;
        } else {
          return `Perfect! I have your provider information and consent preference. Let's proceed to collect your personal information.`;
        }
      
      case 'patient_information':
        if (!context.collectedData.first_name) {
          return `Now I'll collect your basic information. Let's start with your full name and date of birth. What is your first and last name?`;
        } else if (!context.collectedData.email_address) {
          return `Thank you! Now I need your contact information. What's your email address and cell phone number?`;
        } else {
          return `Great! I have your basic information. Let's move on to your provider and treatment center details.`;
        }
      
      case 'provider_treatment_center':
        return `Now I need information about your healthcare provider for NPI verification. Can you provide the referring provider's NPI number?`;
      
      case 'insurance_information':
        return `Let's verify your insurance coverage. I'll need your insurance provider name, member ID, and policy holder information from your insurance card.`;
      
      case 'clinical_treatment':
        return `Finally, I need some clinical information. What is your primary diagnosis or the main reason for seeking treatment?`;
      
      case 'final_submit':
        return `Perfect! We've collected all the necessary information. Let me review everything with you before we submit your enrollment. Everything looks good - would you like to proceed with the final submission?`;
      
      default:
        return `I'm ready to help you with the ${sectionMapping.sectionTitle}. Please provide the required information.`;
    }
  };

  // Extract data from AI response using field mapping
  const extractDataFromResponse = (response: string, fields: any[]): Record<string, any> => {
    const extractedData: Record<string, any> = {};
    
    // Simple extraction logic - in real implementation, this would use NLP
    fields.forEach(field => {
      if (response.toLowerCase().includes(field.fieldKey.toLowerCase())) {
        // Simulate data extraction based on field type
        switch (field.fieldType) {
          case 'email':
            const emailMatch = response.match(/[\w\.-]+@[\w\.-]+\.\w+/);
            if (emailMatch) extractedData[field.fieldKey] = emailMatch[0];
            break;
          case 'phone':
            const phoneMatch = response.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
            if (phoneMatch) extractedData[field.fieldKey] = phoneMatch[0];
            break;
          default:
            // For text fields, extract based on context
            break;
        }
      }
    });
    
    return extractedData;
  };

  // Update real-time data with proper table mapping
  const updateRealtimeDataWithMapping = async (sectionMapping: any, data: Record<string, any>) => {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
        patient_id: patientId
      };

      // Update appropriate table based on section mapping
      if (sectionMapping.destinationTable === 'patient_enrollments') {
        await supabase
          .from('patient_enrollments')
          .update(updateData)
          .eq('id', patientId);
      } else {
        // Handle other destination tables
        await supabase
          .from(sectionMapping.destinationTable)
          .upsert({
            ...updateData,
            enrollment_id: patientId
          });
      }

      setCollectedData(prev => ({ ...prev, ...data }));
      
      // Update progress
      const progress = Math.round(((currentStepIndex + 1) / enrollmentSteps.length) * 100);
      await supabase
        .from('patient_enrollments')
        .update({ 
          progress_percentage: progress,
          current_section: sectionMapping.sectionKey 
        })
        .eq('id', patientId);

    } catch (error) {
      console.error('Real-time update error:', error);
    }
  };

  // Trigger consent collection based on method
  const triggerConsentCollection = async (method: ConsentMethod, patientId: string) => {
    try {
      switch (method) {
        case 'whatsapp':
          // Trigger WhatsApp consent workflow
          toast({
            title: "WhatsApp Consent",
            description: "WhatsApp consent link will be sent to the patient's phone number.",
          });
          break;
        case 'sms':
          // Trigger SMS consent workflow
          toast({
            title: "SMS Consent",
            description: "SMS consent link will be sent to the patient.",
          });
          break;
        case 'email':
          // Trigger email consent workflow
          toast({
            title: "Email Consent",
            description: "Consent form will be emailed to the patient.",
          });
          break;
        case 'verbal':
          // Handle verbal consent process
          toast({
            title: "Verbal Consent",
            description: "Verbal consent will be recorded during the call.",
          });
          break;
        default:
          // Handle digital signature or other methods
          break;
      }
    } catch (error) {
      console.error('Consent collection trigger error:', error);
    }
  };

  // Check step completion with schema validation
  const checkStepCompletionWithMapping = (sectionMapping: any, data: Record<string, any>): boolean => {
    return sectionMapping.requiredFields.every((field: string) => {
      return data[field] && data[field].toString().trim() !== '';
    });
  };

  // Advance to next step
  const advanceToNextStep = async () => {
    if (currentStepIndex < enrollmentSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      
      const nextStep = enrollmentSteps[nextIndex];
      setMcpSession(prev => prev ? {
        ...prev,
        currentStep: nextStep.id,
        mcpTools: nextStep.mcpTools
      } : null);

      // Update database
      await supabase
        .from('patient_enrollments')
        .update({ 
          current_section: nextStep.id as EnrollmentSectionKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      toast({
        title: "Step Completed",
        description: `Moving to ${nextStep.name}`,
      });
    }
  };

  // Initialize session on component mount
  useEffect(() => {
    initializeMCPSession();
  }, []);

  const currentStep = enrollmentSteps[currentStepIndex];
  const progress = Math.round(((currentStepIndex + 1) / enrollmentSteps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            MCP Patient Enrollment Agent
            <Badge variant="secondary">Schema-Driven</Badge>
          </CardTitle>
          {patientEnrollmentSession && (
            <div className="text-sm text-muted-foreground">
              Patient ID: {patientId} | Source: {enrollmentSource.toUpperCase()} | Status: {patientEnrollmentSession.enrollment_status}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStepIndex + 1} of {enrollmentSteps.length}</span>
              <span>{currentStep.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <currentStep.icon className="h-5 w-5" />
            {currentStep.name}
            {currentStep.realtimeEnabled && (
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Conversation */}
          <div className="border rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto bg-muted/30">
            {!mcpSession ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Initializing agent...</p>
                <p className="text-xs mt-1">{currentStep.aiPrompt}</p>
              </div>
            ) : (mcpSession.conversationHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start the conversation by typing your message below</p>
                <p className="text-xs mt-1">{currentStep.aiPrompt}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mcpSession.conversationHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-background border p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && mcpSession) {
                  processMessageWithMCP(currentMessage);
                }
              }}
              placeholder={currentStep.aiPrompt}
              className="flex-1 px-3 py-2 border rounded-md"
              disabled={isProcessing || !mcpSession}
            />
            <Button 
              onClick={() => processMessageWithMCP(currentMessage)}
              disabled={isProcessing || !currentMessage.trim() || !mcpSession}
            >
              Send
            </Button>
          </div>

          {/* MCP Tools */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Active MCP Tools:</span>
            {currentStep.mcpTools.map((tool, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {tool}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {currentStepIndex === enrollmentSteps.length - 1 && (
          <Button onClick={() => onComplete?.({ instanceId: patientId, pdfUrl: '' })}>
            Complete Enrollment
          </Button>
        )}
      </div>
    </div>
  );
};