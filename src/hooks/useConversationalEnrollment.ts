/**
 * CONVERSATIONAL ENROLLMENT HOOK
 * Manages conversational enrollment state, AI processing, and data extraction
 */
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRealAIIntegration } from './useRealAIIntegration';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface ConversationSession {
  sessionId: string;
  moduleType: ModuleType;
  currentSection: string;
  collectedData: Record<string, any>;
  messages: ConversationMessage[];
  progress: number;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    section?: string;
    extractedData?: Record<string, any>;
    confidence?: number;
    intent?: string;
  };
}

interface DataExtractionResult {
  extractedData: Record<string, any>;
  confidence: number;
  nextPrompt?: string;
  sectionComplete?: boolean;
  validationErrors?: string[];
}

export const useConversationalEnrollment = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { generateWorkflowFromPrompt, isGenerating } = useRealAIIntegration();

  // Start new conversation session
  const startConversation = useCallback(async (moduleType: ModuleType): Promise<string> => {
    try {
      setError(null);
      
      const sessionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newSession: ConversationSession = {
        sessionId,
        moduleType,
        currentSection: 'personal_info',
        collectedData: {},
        messages: [],
        progress: 0,
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date()
      };

      // Save session to database
      const { error: saveError } = await supabase
        .from('enrollment_instances')
        .insert({
          id: sessionId,
          template_id: `${moduleType}_template`,
          module_type: moduleType,
          status: 'in_progress',
          form_data: {},
          conversation_data: {
            messages: [],
            currentSection: 'personal_info',
            progress: 0
          },
          metadata: {
            conversation_session: true,
            started_at: new Date().toISOString()
          }
        });

      if (saveError) throw saveError;

      setSession(newSession);
      
      toast({
        title: "Conversation Started",
        description: "Your AI enrollment assistant is ready to help you.",
      });

      return sessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      setError(errorMessage);
      toast({
        title: "Start Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  // Process user message with AI
  const processMessage = useCallback(async (
    message: string,
    context?: Record<string, any>
  ): Promise<{
    response: string;
    extractedData?: Record<string, any>;
    nextSection?: string;
    confidence: number;
  }> => {
    if (!session) {
      throw new Error('No active conversation session');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create enhanced prompt for AI processing
      const enhancedPrompt = createEnhancedPrompt(message, session, context);
      
      // Process with AI integration
      const aiResult = await generateWorkflowFromPrompt({
        prompt: enhancedPrompt,
        context: {
          existingNodes: [],
          templateId: `${session.moduleType}_template`,
          industry: 'healthcare',
          category: session.moduleType
        },
        config: {
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000
        }
      });

      if (!aiResult.success) {
        throw new Error(aiResult.error || 'AI processing failed');
      }

      // Extract structured data from AI response
      const extractionResult = await extractDataFromAIResponse(
        aiResult.workflow,
        session.currentSection,
        session.moduleType
      );

      // Update session with new data
      const updatedData = { ...session.collectedData, ...extractionResult.extractedData };
      const newProgress = calculateProgress(updatedData, session.moduleType);
      
      const userMessage: ConversationMessage = {
        id: `msg_${Date.now()}_user`,
        type: 'user',
        content: message,
        timestamp: new Date()
      };

      const agentMessage: ConversationMessage = {
        id: `msg_${Date.now()}_agent`,
        type: 'agent',
        content: extractionResult.nextPrompt || "Thank you for that information. What else can you tell me?",
        timestamp: new Date(),
        metadata: {
          section: session.currentSection,
          extractedData: extractionResult.extractedData,
          confidence: extractionResult.confidence
        }
      };

      const updatedSession: ConversationSession = {
        ...session,
        collectedData: updatedData,
        messages: [...session.messages, userMessage, agentMessage],
        progress: newProgress,
        lastActivity: new Date()
      };

      // Save updated session to database
      await saveSessionToDatabase(updatedSession);
      
      setSession(updatedSession);

      // Check if section is complete
      let nextSection = session.currentSection;
      if (extractionResult.sectionComplete) {
        nextSection = getNextSection(session.currentSection, session.moduleType);
        if (nextSection !== session.currentSection) {
          await transitionToSection(nextSection);
        }
      }

      return {
        response: agentMessage.content,
        extractedData: extractionResult.extractedData,
        nextSection: nextSection !== session.currentSection ? nextSection : undefined,
        confidence: extractionResult.confidence
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [session, generateWorkflowFromPrompt]);

  // Create enhanced prompt for AI
  const createEnhancedPrompt = (
    message: string,
    session: ConversationSession,
    context?: Record<string, any>
  ): string => {
    const sectionPrompts = getSectionPrompts(session.moduleType);
    const currentSectionInfo = sectionPrompts[session.currentSection];

    return `
You are an expert enrollment assistant helping with ${session.moduleType} enrollment. 

CURRENT SECTION: ${session.currentSection}
SECTION REQUIREMENTS: ${currentSectionInfo?.requirements?.join(', ') || 'General information'}
ALREADY COLLECTED: ${JSON.stringify(session.collectedData)}

USER MESSAGE: "${message}"

INSTRUCTIONS:
1. Extract any relevant structured data from the user's message
2. Validate the information against section requirements
3. Provide a natural, helpful response that guides the user
4. If the section is complete, indicate readiness to move to the next section
5. If information is missing or unclear, ask clarifying questions

RESPONSE FORMAT:
{
  "response": "Natural language response to user",
  "extracted_data": { "field_name": "value" },
  "confidence": 0.95,
  "section_complete": false,
  "next_prompt": "What to ask next"
}

Focus on being conversational, helpful, and thorough while maintaining HIPAA compliance for medical information.
`;
  };

  // Extract data from AI response
  const extractDataFromAIResponse = async (
    aiResponse: any,
    section: string,
    moduleType: ModuleType
  ): Promise<DataExtractionResult> => {
    try {
      // Parse AI response if it's JSON
      let parsedResponse = aiResponse;
      if (typeof aiResponse === 'string') {
        parsedResponse = JSON.parse(aiResponse);
      }

      return {
        extractedData: parsedResponse.extracted_data || {},
        confidence: parsedResponse.confidence || 0.8,
        nextPrompt: parsedResponse.response || parsedResponse.next_prompt,
        sectionComplete: parsedResponse.section_complete || false,
        validationErrors: parsedResponse.validation_errors || []
      };
    } catch (err) {
      console.warn('Failed to parse AI response, using fallback extraction', err);
      
      // Fallback to pattern-based extraction
      return {
        extractedData: {},
        confidence: 0.5,
        nextPrompt: "Could you please provide more details?",
        sectionComplete: false
      };
    }
  };

  // Calculate progress based on collected data
  const calculateProgress = (data: Record<string, any>, moduleType: ModuleType): number => {
    const requiredFields = getRequiredFields(moduleType);
    const completedFields = Object.keys(data).filter(key => 
      data[key] && data[key] !== '' && requiredFields.includes(key)
    );
    
    return Math.min((completedFields.length / requiredFields.length) * 90, 90); // Cap at 90% until signature
  };

  // Get required fields for module type
  const getRequiredFields = (moduleType: ModuleType): string[] => {
    const fields = {
      patient: [
        'full_name', 'date_of_birth', 'email', 'phone', 'address',
        'emergency_contact_name', 'emergency_contact_phone',
        'insurance_provider', 'insurance_member_id',
        'current_medications', 'allergies', 'medical_conditions'
      ],
      treatment_center: [
        'facility_name', 'facility_address', 'facility_phone', 'facility_email',
        'primary_contact_name', 'license_number', 'accreditation',
        'services_offered', 'insurance_accepted'
      ],
      customer: [
        'full_name', 'email', 'phone', 'company_name',
        'preferences', 'communication_method'
      ],
      manufacturer: [
        'company_name', 'business_address', 'business_phone', 'business_email',
        'primary_contact', 'business_type', 'product_categories',
        'certifications', 'tax_id'
      ]
    };
    
    return fields[moduleType] || [];
  };

  // Get section prompts for each module type
  const getSectionPrompts = (moduleType: ModuleType) => {
    return {
      personal_info: {
        requirements: ['full_name', 'date_of_birth', 'email', 'phone', 'address'],
        prompt: "Let's start with your basic information."
      },
      insurance_info: {
        requirements: ['insurance_provider', 'insurance_member_id', 'group_number'],
        prompt: "Now let's collect your insurance information."
      },
      medical_history: {
        requirements: ['current_medications', 'allergies', 'medical_conditions'],
        prompt: "Please share your medical history with me."
      },
      preferences: {
        requirements: ['communication_preferences', 'appointment_preferences'],
        prompt: "Let's set up your preferences."
      },
      review: {
        requirements: [],
        prompt: "Let's review all the information we've collected."
      }
    };
  };

  // Get next section in flow
  const getNextSection = (currentSection: string, moduleType: ModuleType): string => {
    const sectionFlow = {
      patient: ['personal_info', 'insurance_info', 'medical_history', 'preferences', 'review'],
      treatment_center: ['facility_info', 'licensing', 'services', 'insurance', 'review'],
      customer: ['personal_info', 'company_info', 'preferences', 'review'],
      manufacturer: ['company_info', 'products', 'certifications', 'review']
    };

    const flow = sectionFlow[moduleType] || sectionFlow.patient;
    const currentIndex = flow.indexOf(currentSection);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : currentSection;
  };

  // Transition to new section
  const transitionToSection = useCallback(async (newSection: string) => {
    if (!session) return;

    const sectionPrompts = getSectionPrompts(session.moduleType);
    const nextPrompt = sectionPrompts[newSection]?.prompt || `Let's move on to ${newSection}.`;

    const transitionMessage: ConversationMessage = {
      id: `msg_${Date.now()}_transition`,
      type: 'system',
      content: `Great! We've completed the ${session.currentSection} section. ${nextPrompt}`,
      timestamp: new Date(),
      metadata: { section: newSection }
    };

    const updatedSession: ConversationSession = {
      ...session,
      currentSection: newSection,
      messages: [...session.messages, transitionMessage],
      lastActivity: new Date()
    };

    await saveSessionToDatabase(updatedSession);
    setSession(updatedSession);
  }, [session]);

  // Save session to database
  const saveSessionToDatabase = async (sessionData: ConversationSession) => {
    try {
      const { error } = await supabase
        .from('enrollment_instances')
        .update({
          form_data: sessionData.collectedData,
          conversation_data: {
            messages: sessionData.messages,
            currentSection: sessionData.currentSection,
            progress: sessionData.progress
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData.sessionId);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to save session:', err);
      // Don't throw error to prevent conversation interruption
    }
  };

  // Resume existing conversation
  const resumeConversation = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('enrollment_instances')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      const resumedSession: ConversationSession = {
        sessionId: data.id,
        moduleType: data.module_type as ModuleType,
        currentSection: 'personal_info',
        collectedData: {},
        messages: [],
        progress: 0,
        isActive: data.status === 'in_progress',
        createdAt: new Date(data.created_at),
        lastActivity: new Date(data.updated_at)
      };

      setSession(resumedSession);
      
      toast({
        title: "Conversation Resumed",
        description: "Continuing where you left off.",
      });

      return resumedSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume conversation';
      setError(errorMessage);
      throw err;
    }
  }, [toast]);

  // Complete conversation and generate PDF
  const completeConversation = useCallback(async (signatureData?: string) => {
    if (!session) {
      throw new Error('No active conversation session');
    }

    try {
      setIsProcessing(true);

      // Final data with signature
      const finalData = {
        ...session.collectedData,
        signature: signatureData,
        completed_at: new Date().toISOString(),
        method: 'conversational_ai'
      };

      // Update database
      const { error: updateError } = await supabase
        .from('enrollment_instances')
        .update({
          status: 'completed',
          form_data: finalData,
          completed_at: new Date().toISOString()
        })
        .eq('id', session.sessionId);

      if (updateError) throw updateError;

      // Generate PDF
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke(
        'generate-enrollment-pdf',
        {
          body: {
            instanceId: session.sessionId,
            enrollmentData: finalData,
            signature: signatureData
          }
        }
      );

      if (pdfError) throw pdfError;

      const updatedSession: ConversationSession = {
        ...session,
        collectedData: finalData,
        progress: 100,
        isActive: false,
        lastActivity: new Date()
      };

      setSession(updatedSession);

      return {
        instanceId: session.sessionId,
        pdfUrl: pdfData?.pdfUrl,
        data: finalData
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete conversation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [session]);

  return {
    session,
    isProcessing: isProcessing || isGenerating,
    error,
    startConversation,
    processMessage,
    resumeConversation,
    completeConversation,
    transitionToSection
  };
};