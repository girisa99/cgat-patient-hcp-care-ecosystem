/**
 * CONVERSATIONAL ENROLLMENT HOOK
 * Integrates AI agents with Universal Enrollment System
 */
import { useState, useCallback, useRef } from 'react';
import { useUniversalAI } from './useUniversalAI';
import { useUniversalEnrollment } from './useUniversalEnrollment';
import { useMasterToast } from './useMasterToast';
import { supabase } from '@/integrations/supabase/client';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface ConversationContext {
  moduleType: ModuleType;
  currentSection: string;
  completedSections: string[];
  formData: Record<string, any>;
  instanceId: string | null;
  templateId: string | null;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface SectionProgress {
  name: string;
  completed: boolean;
  data: Record<string, any>;
  required: boolean;
}

export const useConversationalEnrollment = () => {
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [sectionProgress, setSectionProgress] = useState<SectionProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  
  const { generateResponse } = useUniversalAI();
  const { createInstance, updateInstance, fetchTemplates, templates } = useUniversalEnrollment();
  const { showSuccess, showError } = useMasterToast();
  
  const conversationId = useRef<string>(crypto.randomUUID());

  // Initialize conversation for specific module type
  const initializeConversation = useCallback(async (moduleType: ModuleType, templateId?: string) => {
    try {
      setIsProcessing(true);
      
      // Get template if specified
      let template = null;
      if (templateId) {
        await fetchTemplates();
        template = templates.find(t => t.id === templateId);
      }
      
      // Create enrollment instance
      const instanceData = {
        template_id: templateId || null,
        module_type: moduleType,
        enrollment_data: {},
        submission_method: 'conversational_ai',
        status: 'in_progress',
        progress: 0,
        current_step: 'intake'
      };
      
      const instance = await createInstance(instanceData);
      
      // Initialize context
      const newContext: ConversationContext = {
        moduleType,
        currentSection: 'introduction',
        completedSections: [],
        formData: {},
        instanceId: instance?.id || null,
        templateId: templateId || null
      };
      
      setContext(newContext);
      
      // Initialize sections based on module type
      const sections = getSectionsForModule(moduleType);
      setSectionProgress(sections.map(section => ({
        name: section.name,
        completed: false,
        data: {},
        required: section.required
      })));
      
      // Generate initial greeting message
      const greetingPrompt = generateGreetingPrompt(moduleType, template);
      const response = await generateResponse({
        provider: 'openai',
        prompt: greetingPrompt,
        systemPrompt: getSystemPrompt(moduleType),
        temperature: 0.7
      });
      
      if (response) {
        addMessage('assistant', response.content);
      }
      
      return instance;
    } catch (error) {
      showError('Failed to initialize conversation');
      console.error('Conversation initialization error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [generateResponse, createInstance, fetchTemplates, showError]);

  // Send user message and get AI response
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!context) return;
    
    addMessage('user', userMessage);
    setIsProcessing(true);
    
    try {
      // Generate AI response with context
      const prompt = generateContextualPrompt(userMessage, context, sectionProgress, messages);
      const response = await generateResponse({
        provider: 'openai',
        prompt,
        systemPrompt: getSystemPrompt(context.moduleType),
        temperature: 0.7,
        context: {
          moduleType: context.moduleType,
          currentSection: context.currentSection,
          formData: context.formData,
          completedSections: context.completedSections
        }
      });
      
      if (response) {
        addMessage('assistant', response.content);
        
        // Process any data extraction or form updates
        await processResponseForDataExtraction(response.content, userMessage);
      }
    } catch (error) {
      showError('Failed to process message');
      console.error('Message processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [context, sectionProgress, messages, generateResponse, showError]);

  // Extract and update form data from conversation
  const processResponseForDataExtraction = useCallback(async (aiResponse: string, userMessage: string) => {
    if (!context) return;
    
    try {
      // Use AI to extract structured data from the conversation
      const extractionPrompt = `
        Extract any form data from this conversation exchange:
        User: "${userMessage}"
        Assistant: "${aiResponse}"
        
        Current section: ${context.currentSection}
        Module type: ${context.moduleType}
        
        Return only a JSON object with extracted field values, or empty object if none:
        `;
      
      const extractionResponse = await generateResponse({
        provider: 'openai',
        prompt: extractionPrompt,
        systemPrompt: 'You are a data extraction assistant. Return only valid JSON.',
        temperature: 0.1
      });
      
      if (extractionResponse) {
        try {
          const extractedData = JSON.parse(extractionResponse.content);
          if (Object.keys(extractedData).length > 0) {
            await updateFormData(extractedData);
          }
        } catch (parseError) {
          console.warn('Failed to parse extracted data:', parseError);
        }
      }
    } catch (error) {
      console.error('Data extraction error:', error);
    }
  }, [context, generateResponse]);

  // Update form data and save to database
  const updateFormData = useCallback(async (newData: Record<string, any>) => {
    if (!context?.instanceId) return;
    
    const updatedFormData = { ...context.formData, ...newData };
    
    setContext(prev => prev ? { ...prev, formData: updatedFormData } : null);
    
    // Update enrollment instance
    try {
      await updateInstance(context.instanceId, {
        enrollment_data: updatedFormData,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update instance:', error);
    }
  }, [context, updateInstance]);

  // Move to next section
  const progressToSection = useCallback(async (sectionName: string) => {
    if (!context) return;
    
    // Mark current section as completed
    setSectionProgress(prev => 
      prev.map(section => 
        section.name === context.currentSection 
          ? { ...section, completed: true, data: context.formData }
          : section
      )
    );
    
    // Update context
    setContext(prev => prev ? {
      ...prev,
      currentSection: sectionName,
      completedSections: [...prev.completedSections, prev.currentSection]
    } : null);
    
    // Generate section introduction
    const sectionPrompt = generateSectionPrompt(sectionName, context.moduleType);
    const response = await generateResponse({
      provider: 'openai',
      prompt: sectionPrompt,
      systemPrompt: getSystemPrompt(context.moduleType),
      temperature: 0.7
    });
    
    if (response) {
      addMessage('assistant', response.content);
    }
  }, [context, generateResponse]);

  // Complete enrollment and generate PDF
  const completeEnrollment = useCallback(async () => {
    if (!context?.instanceId) return;
    
    try {
      setIsProcessing(true);
      
      // Update instance to completed
      await updateInstance(context.instanceId, {
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString()
      });
      
      // Generate PDF
      const pdfUrl = await generateEnrollmentPDF(context);
      
      showSuccess('Enrollment completed successfully!');
      
      return { instanceId: context.instanceId, pdfUrl };
    } catch (error) {
      showError('Failed to complete enrollment');
      console.error('Enrollment completion error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [context, updateInstance, showSuccess, showError]);

  // Helper function to add messages
  const addMessage = useCallback((type: 'user' | 'assistant' | 'system', content: string) => {
    const message: ConversationMessage = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, message]);
  }, []);

  return {
    context,
    messages,
    sectionProgress,
    isProcessing,
    signatureData,
    setSignatureData,
    initializeConversation,
    sendMessage,
    progressToSection,
    updateFormData,
    completeEnrollment,
    conversationId: conversationId.current
  };
};

// Helper functions
const getSectionsForModule = (moduleType: ModuleType) => {
  const sectionMap = {
    patient: [
      { name: 'personal_info', required: true },
      { name: 'medical_history', required: true },
      { name: 'insurance_info', required: true },
      { name: 'emergency_contacts', required: true },
      { name: 'consent_forms', required: true }
    ],
    treatment_center: [
      { name: 'facility_info', required: true },
      { name: 'licensing', required: true },
      { name: 'staff_credentials', required: true },
      { name: 'services_offered', required: true },
      { name: 'compliance_docs', required: true }
    ],
    customer: [
      { name: 'company_info', required: true },
      { name: 'contact_details', required: true },
      { name: 'business_requirements', required: true },
      { name: 'integration_needs', required: false }
    ],
    manufacturer: [
      { name: 'company_details', required: true },
      { name: 'product_catalog', required: true },
      { name: 'manufacturing_specs', required: true },
      { name: 'quality_certifications', required: true },
      { name: 'distribution_network', required: false }
    ]
  };
  
  return sectionMap[moduleType] || [];
};

const generateGreetingPrompt = (moduleType: ModuleType, template: any) => {
  return `Generate a friendly greeting for ${moduleType} enrollment. 
  Explain that I'm an AI assistant who will help them complete their enrollment through conversation.
  Mention that we'll go through each section step by step, and they can ask questions at any time.
  Keep it conversational and welcoming. Start with the first section after the greeting.`;
};

const generateSectionPrompt = (sectionName: string, moduleType: ModuleType) => {
  return `Generate an introduction for the "${sectionName}" section of ${moduleType} enrollment.
  Explain what information we'll be collecting in this section and ask for the first piece of information needed.
  Be conversational and helpful.`;
};

const generateContextualPrompt = (
  userMessage: string, 
  context: ConversationContext, 
  sectionProgress: SectionProgress[], 
  messages: ConversationMessage[]
) => {
  const recentMessages = messages.slice(-6).map(m => `${m.type}: ${m.content}`).join('\n');
  
  return `
    Context:
    - Module: ${context.moduleType}
    - Current section: ${context.currentSection}
    - Completed sections: ${context.completedSections.join(', ')}
    - Current form data: ${JSON.stringify(context.formData)}
    
    Recent conversation:
    ${recentMessages}
    
    User message: "${userMessage}"
    
    Respond helpfully to continue the enrollment process. If the user provided information for the current section,
    acknowledge it and ask for the next piece of information. If the section is complete, suggest moving to the next section.
    Be conversational and natural.
  `;
};

const getSystemPrompt = (moduleType: ModuleType) => {
  return `You are a helpful AI assistant specializing in ${moduleType} enrollment. 
  Your job is to guide users through the enrollment process conversationally, 
  collecting required information section by section. Be friendly, professional, 
  and ensure all required information is collected accurately.`;
};

const generateEnrollmentPDF = async (context: ConversationContext) => {
  try {
    const response = await supabase.functions.invoke('generate-enrollment-pdf', {
      body: {
        moduleType: context.moduleType,
        formData: context.formData,
        instanceId: context.instanceId
      }
    });
    
    if (response.error) throw response.error;
    return response.data?.pdfUrl;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};