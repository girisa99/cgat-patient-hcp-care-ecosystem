/**
 * MCP STEPWISE ENROLLMENT AGENT
 * Schema-driven patient enrollment following exact form structure
 * Uses Patient ID as primary key with proper enrollment source tracking
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { MCPWelcomeOverview } from './MCPWelcomeOverview';
import SignatureCanvas from 'react-signature-canvas';
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

// Enhanced components for better UX
import { EnrollmentSectionProgressTracker } from '../patient-enrollment/EnrollmentSectionProgressTracker';
import { FieldByFieldCollector } from '../patient-enrollment/FieldByFieldCollector';
import { EnhancedRealtimeProgressTracker } from '../patient-enrollment/EnhancedRealtimeProgressTracker';
import { EnhancedSectionCompletionModal } from '../patient-enrollment/EnhancedSectionCompletionModal';

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
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Enhanced UX state
  const [showSectionCompletion, setShowSectionCompletion] = useState(false);
  const [completedSectionData, setCompletedSectionData] = useState<any>(null);
  const [showFieldByField, setShowFieldByField] = useState(false);
  
  // Consent sub-steps state machine and signature ref
  const [consentSubStep, setConsentSubStep] = useState<'provider_info' | 'treatment_center' | 'patient_method' | 'provider_signature'>('provider_info');
  const signatureRef = useRef<SignatureCanvas | null>(null);

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

      // Prefill submission method as MCP and persist source
      setCollectedData(prev => ({ ...prev, submission_method: enrollmentSource }));
      await supabase
        .from('patient_enrollments')
        .update({ 
          // Cast to any to avoid types mismatch until Supabase types refresh
          enrollment_source: enrollmentSource,
          submission_method: 'conversational_agent',
          agent_channel: 'mcp'
        } as any)
        .eq('id', patientId);

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

      // Build MCP context from current state
      const baseContext = {
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

      // 1) Extract data from the USER message first (prevents loops)
      const extractedFromUser = extractDataFromMessage(message, currentSectionMapping);
      console.log('🔍 Extracted from user message:', extractedFromUser);
      
      if (Object.keys(extractedFromUser).length > 0) {
        console.debug('MCP extracted from user:', extractedFromUser);
        
        // Merge with existing data first
        const mergedData = { ...collectedData, ...extractedFromUser };
        setCollectedData(mergedData);
        
        // Persist to database
        await updateRealtimeDataWithMapping(currentSectionMapping, extractedFromUser);

        // CRITICAL: Handle consent method selection completion
        if (currentSectionMapping.sectionKey === 'consent_management' && extractedFromUser.patient_consent_method) {
          console.log('✅ Consent method selected:', extractedFromUser.patient_consent_method);
          setConsentMethod(extractedFromUser.patient_consent_method as ConsentMethod);
          await triggerConsentCollection(extractedFromUser.patient_consent_method as ConsentMethod, patientId);
          
          // Check if all consent requirements are now met
          const updatedStep = computeConsentSubStep(mergedData);
          console.log('🔄 Updated consent sub-step after method selection:', updatedStep);
          setConsentSubStep(updatedStep);
        }

        // Record verification when any NPI is present in this section
        const hasNPI = !!(extractedFromUser.provider_npi || extractedFromUser.referring_provider_npi || extractedFromUser.facility_npi);
        if (hasNPI) {
          await supabase
            .from('patient_enrollments')
            .update({ verification_method: 'npi_agent' } as any)
            .eq('id', patientId);
        }
      }

      // 2) Generate AI response using the UPDATED context
      const mergedCollected = { ...collectedData, ...extractedFromUser };
      const aiResponse = await generateSchemaAwareResponse(
        message,
        { ...baseContext, collectedData: mergedCollected },
        currentSectionMapping
      );

      // Add AI response to conversation
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        step: currentStep.id,
        metadata: { 
          mcpTools: currentStep.mcpTools,
          extractedData: extractedFromUser,
          sectionMapping: currentSectionMapping.sectionKey,
          destinationTable: currentSectionMapping.destinationTable
        }
      };

      setMcpSession(prev => prev ? {
        ...prev,
        conversationHistory: [...prev.conversationHistory, aiMessage]
      } : null);

      // 3) Determine if step can progress based on merged data
      const isStepComplete = checkStepCompletionWithMapping(currentSectionMapping, mergedCollected);
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


  // Consent sub-step calculator ensures strict ordering
  const computeConsentSubStep = (data: Record<string, any>) => {
    console.log('🔍 Computing consent sub-step with data:', data);
    const hasValidNpi = data?.provider_npi && /^\d{10}$/.test(String(data.provider_npi));
    const hasProvider = data?.provider_name;
    const hasTreatmentCenter = data?.treatment_center;
    const hasConsentMethod = data?.patient_consent_method;
    
    console.log('📋 Consent requirements check:', {
      hasProvider,
      hasValidNpi,
      hasTreatmentCenter,
      hasConsentMethod,
      provider_name: data?.provider_name,
      provider_npi: data?.provider_npi,
      treatment_center: data?.treatment_center,
      patient_consent_method: data?.patient_consent_method
    });
    
    if (!hasProvider || !hasValidNpi) {
      console.log('➡️ Sub-step: provider_info (missing provider or NPI)');
      return 'provider_info';
    }
    if (!hasTreatmentCenter) {
      console.log('➡️ Sub-step: treatment_center');
      return 'treatment_center';
    }
    if (!hasConsentMethod) {
      console.log('➡️ Sub-step: patient_method');
      return 'patient_method';
    }
    
    console.log('➡️ Sub-step: provider_signature (all consent info collected)');
    return 'provider_signature';
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
        // Use strict sub-step state machine to prevent skipping
        const currentSubStep = computeConsentSubStep(context.collectedData);
        setConsentSubStep(currentSubStep);
        
        switch (currentSubStep) {
          case 'provider_info':
            const hasValidNpi = context.collectedData?.provider_npi && /^\d{10}$/.test(String(context.collectedData.provider_npi));
            if (!context.collectedData?.provider_name) {
              return `For consent management, I need the healthcare provider's information first. Please provide the provider's full name who will be handling your care.`;
            } else if (!hasValidNpi) {
              // Trigger NPI verification agent if provider name exists
              if (context.collectedData.provider_name) {
                await triggerNPIVerification(context.collectedData.provider_name);
              }
              return `Thank you! Now I need the provider's 10-digit NPI number for verification and credentialing purposes. Please provide the NPI number for ${context.collectedData.provider_name}.`;
            }
            break;
            
          case 'treatment_center':
            return `Great! I have the provider information. Now I need the treatment center where you'll be receiving care. Please provide the name of the treatment center or facility.`;
            
          case 'patient_method':
            return `Perfect! Now I need to know your preferred method for providing consent. Please choose one of the following:\n\n• **WhatsApp** - Receive consent link via WhatsApp\n• **SMS/Text** - Receive consent link via text message\n• **Email** - Receive consent form via email\n• **Voice** - Complete consent via voice call\n• **Verbal** - Provide verbal consent during this session\n• **Digital Signature** - Sign electronically now\n\nWhich method would you prefer?`;
            
          case 'provider_signature':
            return `Excellent! I have all the consent information. Now I need the healthcare provider to review and authorize this enrollment by providing their signature below.`;
            
          default:
            return `All consent management steps completed. Moving to personal information collection.`;
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

  // NEW: Extract structured data directly from the user's message
  // This prevents loops where the assistant keeps asking because it was parsing its own prompt
  const extractDataFromMessage = (message: string, sectionMapping: any): Record<string, any> => {
    const data: Record<string, any> = {};
    const lower = message.toLowerCase();

    // Detect NPIs (10 digits)
    const npiMatches = message.match(/\b\d{10}\b/g) || [];
    if (npiMatches.length > 0) {
      // Map NPIs to fields present in this section
      sectionMapping.fields.forEach((f: any) => {
        const key = f.fieldKey as string;
        if (!data[key] && /provider_npi|referring_provider_npi/i.test(key)) {
          data[key] = npiMatches[0];
        }
        if (!data[key] && /treatment_center_npi|facility_npi/i.test(key) && npiMatches[1]) {
          data[key] = npiMatches[1];
        }
      });
    }

    // CRITICAL FIX: Detect consent method selection
    if (sectionMapping.fields.some((f: any) => f.fieldKey === 'patient_consent_method')) {
      const consentMethodMatches = [
        { keywords: ['whatsapp', 'whats app', 'what\'s app'], method: 'whatsapp' },
        { keywords: ['sms', 'text', 'message'], method: 'sms' },
        { keywords: ['email', 'e-mail'], method: 'email' },
        { keywords: ['voice', 'call', 'phone'], method: 'voice' },
        { keywords: ['verbal', 'verbally'], method: 'verbal' },
        { keywords: ['digital', 'signature', 'sign'], method: 'digital_signature' }
      ];
      
      for (const match of consentMethodMatches) {
        if (match.keywords.some(keyword => lower.includes(keyword))) {
          data.patient_consent_method = match.method;
          break;
        }
      }
    }

    // Detect provider name when present in this section
    if (sectionMapping.fields.some((f: any) => f.fieldKey === 'provider_name')) {
      if (lower.includes('npi')) {
        const idx = lower.indexOf('npi');
        const nameSeg = message.slice(0, idx).replace(/^\s*dr\.?\s*/i, '').replace(/[,;:]\s*$/,'').trim();
        if (nameSeg && nameSeg.length > 2) {
          data['provider_name'] = nameSeg;
        }
      } else {
        const drMatch = message.match(/^(?:dr\.?\s*)?([a-zA-Z][a-zA-Z\s'.-]{2,})$/);
        if (drMatch) {
          data['provider_name'] = drMatch[1].trim();
        }
      }
    }

    // Detect treatment center name
    if (sectionMapping.fields.some((f: any) => f.fieldKey === 'treatment_center')) {
      // Look for treatment center keywords
      const centerKeywords = ['treatment center', 'medical center', 'clinic', 'hospital', 'facility'];
      const centerMatch = centerKeywords.find(keyword => lower.includes(keyword));
      if (centerMatch) {
        // Extract text around the keyword
        const words = message.split(/\s+/);
        const keywordIndex = words.findIndex(word => word.toLowerCase().includes(centerMatch.split(' ')[0]));
        if (keywordIndex >= 0) {
          // Take words around the keyword to form center name
          const start = Math.max(0, keywordIndex - 2);
          const end = Math.min(words.length, keywordIndex + 3);
          const centerName = words.slice(start, end).join(' ').replace(/[,;:]\s*$/,'').trim();
          if (centerName.length > 5) {
            data['treatment_center'] = centerName;
          }
        }
      } else {
        // If no keywords, treat entire message as potential center name (for simple responses)
        const simpleName = message.trim().replace(/[,;:]\s*$/,'');
        if (simpleName.length > 2 && simpleName.length < 100 && !lower.includes('method') && !lower.includes('consent')) {
          data['treatment_center'] = simpleName;
        }
      }
    }

    // Detect consent method keywords
    const consentField = sectionMapping.fields.find((f: any) => f.fieldKey === 'patient_consent_method');
    if (consentField?.options?.length) {
      for (const opt of consentField.options) {
        const variant = String(opt).replace(/_/g, ' ').toLowerCase();
        if (lower.includes(variant) || lower.includes(String(opt).toLowerCase())) {
          data['patient_consent_method'] = opt;
          break;
        }
      }
    }

    return data;
  };

  // Update real-time data with proper table mapping
  const updateRealtimeDataWithMapping = async (sectionMapping: any, data: Record<string, any>) => {
    try {
      // Map field keys to destination columns
      const mappedData: Record<string, any> = {};
      sectionMapping.fields.forEach((field: any) => {
        if (data[field.fieldKey] !== undefined) {
          mappedData[field.destinationColumn] = data[field.fieldKey];
        }
      });

      // Always include updated_at
      const updateData = {
        ...mappedData,
        updated_at: new Date().toISOString()
      };

      if (sectionMapping.destinationTable === 'patient_enrollments') {
        // Update main enrollment row by id
        await supabase
          .from('patient_enrollments')
          .update(updateData)
          .eq('id', patientId);
      } else {
        // For child tables, upsert by enrollment_id foreign key
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

  // Trigger NPI verification agent
  const triggerNPIVerification = async (providerName: string) => {
    try {
      toast({
        title: "NPI Verification",
        description: `Initiating NPI verification for ${providerName}...`,
      });
      
      // Call NPI verification edge function
      const { data, error } = await supabase.functions.invoke('npi-verification-agent', {
        body: { 
          provider_name: providerName,
          patient_id: patientId,
          session_id: mcpSession?.sessionId
        }
      });
      
      if (error) throw error;
      
      if (data?.npi) {
        // Auto-fill NPI if found
        const sectionMapping = getSectionByKey('consent_management');
        await updateRealtimeDataWithMapping(sectionMapping, { 
          provider_npi: data.npi,
          provider_verified: true 
        });
        
        toast({
          title: "NPI Found",
          description: `NPI ${data.npi} verified for ${providerName}`,
        });
      }
    } catch (error) {
      console.error('NPI verification error:', error);
    }
  };

  // Trigger consent collection based on method
  const triggerConsentCollection = async (method: ConsentMethod, patientId: string) => {
    try {
      // Get patient contact info for triggering background agents
      const contactInfo = {
        email: collectedData.email_address || collectedData.email,
        phone: collectedData.cell_phone || collectedData.phone_number
      };

      switch (method) {
        case 'whatsapp':
          // Trigger WhatsApp consent agent
          await supabase.functions.invoke('whatsapp-consent-agent', {
            body: { 
              patient_id: patientId,
              phone: contactInfo.phone,
              provider_name: collectedData.provider_name,
              treatment_center: collectedData.treatment_center
            }
          });
          toast({
            title: "WhatsApp Consent Initiated",
            description: "WhatsApp consent agent will send consent link to patient's phone number.",
          });
          break;
          
        case 'sms':
          // Trigger SMS consent agent
          await supabase.functions.invoke('sms-consent-agent', {
            body: { 
              patient_id: patientId,
              phone: contactInfo.phone,
              provider_name: collectedData.provider_name
            }
          });
          toast({
            title: "SMS Consent Initiated",
            description: "SMS consent agent will send consent link to patient.",
          });
          break;
          
        case 'email':
          // Trigger email consent agent
          await supabase.functions.invoke('email-consent-agent', {
            body: { 
              patient_id: patientId,
              email: contactInfo.email,
              provider_name: collectedData.provider_name
            }
          });
          toast({
            title: "Email Consent Initiated",
            description: "Email consent agent will send consent form to patient.",
          });
          break;
          
        case 'voice':
          // Trigger voice consent agent
          await supabase.functions.invoke('voice-consent-agent', {
            body: { 
              patient_id: patientId,
              phone: contactInfo.phone,
              provider_name: collectedData.provider_name
            }
          });
          toast({
            title: "Voice Consent Scheduled",
            description: "Voice consent agent will initiate call to patient.",
          });
          break;
          
        case 'verbal':
          // Handle verbal consent in this session
          toast({
            title: "Verbal Consent Ready",
            description: "Verbal consent will be recorded in this session.",
          });
          break;
          
        case 'digital_signature':
          // Handle digital signature in UI
          toast({
            title: "Digital Signature Ready",
            description: "Patient can provide digital signature in the interface.",
          });
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Consent collection trigger error:', error);
      toast({
        title: "Consent Agent Error",
        description: "Failed to trigger consent collection. Please try manual process.",
        variant: "destructive"
      });
    }
  };

  // Accept provider signature and progress
  const handleAcceptSignature = async () => {
    try {
      if (!signatureRef.current) return;
      const dataUrl = signatureRef.current.getTrimmedCanvas().toDataURL('image/png');
      if (!dataUrl || dataUrl.length < 200) {
        toast({ title: 'Signature required', description: 'Please sign in the box before accepting.', variant: 'destructive' });
        return;
      }
      const sectionMapping = getSectionByKey('consent_management');
      await updateRealtimeDataWithMapping(sectionMapping, { provider_signature: dataUrl });

      // Add assistant message and attempt progression
      setMcpSession(prev => prev ? {
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          {
            role: 'assistant',
            content: 'Provider authorization signature captured successfully. Proceeding to the next step.',
            timestamp: new Date().toISOString(),
            step: 'consent_management',
            metadata: { event: 'provider_signature_captured' }
          }
        ]
      } : null);

      const merged = { ...collectedData, provider_signature: dataUrl };
      const complete = checkStepCompletionWithMapping(sectionMapping as any, merged);
      if (complete) {
        toast({
          title: "Consent Management Completed! 🎉",
          description: "All consent information captured. Moving to patient information collection.",
        });
        setTimeout(() => advanceToNextStep(), 1000);
      }
    } catch (e) {
      console.error('Signature accept error', e);
      toast({ title: 'Error', description: 'Failed to save signature. Please try again.', variant: 'destructive' });
    }
  };
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

  // Initialize session after welcome
  useEffect(() => {
    if (!showWelcome && !mcpSession) {
      initializeMCPSession();
    }
  }, [showWelcome, mcpSession]);

  const currentStep = enrollmentSteps[currentStepIndex];
  const progress = Math.round(((currentStepIndex + 1) / enrollmentSteps.length) * 100);

  // Show welcome overview first
  if (showWelcome) {
    return (
      <MCPWelcomeOverview 
        onStart={() => setShowWelcome(false)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                MCP Patient Enrollment Agent
                <Badge variant="secondary">Enhanced UX</Badge>
              </CardTitle>
              {patientEnrollmentSession && (
                <div className="text-sm text-muted-foreground">
                  Patient ID: {patientId} | Source: {enrollmentSource.toUpperCase()} | Status: {patientEnrollmentSession.enrollment_status}
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Current Step */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <currentStep.icon className="h-5 w-5" />
                  {currentStep.name}
                  {currentStep.realtimeEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Activity className="h-3 w-3 mr-1" />
                      Real-time
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFieldByField(!showFieldByField)}
                >
                  {showFieldByField ? 'Chat Mode' : 'Field Mode'}
                </Button>
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

              {/* Provider Signature Capture */}
              {currentStep.id === 'consent_management' && consentSubStep === 'provider_signature' && (
                <Card className="mt-4 border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-amber-600" />
                      Provider Authorization Signature Required
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      The healthcare provider must review and sign below to authorize this patient enrollment.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                      <p className="text-sm font-medium mb-2">Provider Signature:</p>
                      <div className="border border-gray-400 rounded">
                        <SignatureCanvas
                          ref={signatureRef}
                          canvasProps={{
                            width: 400,
                            height: 150,
                            className: 'signature-canvas w-full'
                          }}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => signatureRef.current?.clear()}
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleAcceptSignature}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Signature
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Progress & Tools */}
        <div className="space-y-6">
          {/* Enhanced Real-time Progress Tracker */}
          <EnhancedRealtimeProgressTracker
            patientId={patientId}
            sessionId={mcpSession?.sessionId || ''}
            onSectionComplete={(sectionKey) => {
              setCompletedSectionData({ sectionKey, completedAt: new Date() });
              setShowSectionCompletion(true);
            }}
            onProgressUpdate={(progress) => {
              // Handle progress updates
              console.log('Progress updated:', progress);
            }}
            dashboardSyncEnabled={true}
          />

          {/* MCP Tools Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Active MCP Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentStep.mcpTools.map((tool, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <Badge variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Section Completion Modal */}
      {showSectionCompletion && completedSectionData && (
        <EnhancedSectionCompletionModal
          isOpen={showSectionCompletion}
          onClose={() => setShowSectionCompletion(false)}
          onContinue={() => {
            setShowSectionCompletion(false);
            advanceToNextStep();
          }}
          completedSection={{
            sectionKey: completedSectionData.sectionKey,
            sectionTitle: currentStep.name,
            description: currentStep.description,
            completedFields: Object.keys(collectedData).length,
            totalFields: currentStep.requiredFields.length,
            requiredFields: currentStep.requiredFields.length,
            completionTime: 120, // Mock data
            dataCollected: Object.entries(collectedData).map(([key, value]) => ({
              fieldName: key,
              displayName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              value
            }))
          }}
          nextSection={currentStepIndex < enrollmentSteps.length - 1 ? {
            sectionKey: enrollmentSteps[currentStepIndex + 1].id,
            sectionTitle: enrollmentSteps[currentStepIndex + 1].name,
            description: enrollmentSteps[currentStepIndex + 1].description,
            estimatedTime: 5,
            totalFields: enrollmentSteps[currentStepIndex + 1].requiredFields.length,
            requiredFields: enrollmentSteps[currentStepIndex + 1].requiredFields.length,
            keyFields: enrollmentSteps[currentStepIndex + 1].requiredFields.slice(0, 3)
          } : null}
          overallProgress={progress}
          totalSections={enrollmentSteps.length}
          completedSections={currentStepIndex}
        />
      )}

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