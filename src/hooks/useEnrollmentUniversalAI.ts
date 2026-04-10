/**
 * ENROLLMENT UNIVERSAL AI HOOK
 * Wraps useUniversalAI with enrollment-specific context and prompts
 * P0 Implementation: Wire all enrollment agents to unified AI system
 */
import { useCallback, useMemo } from 'react';
import { useUniversalAI } from './useUniversalAI';

export type EnrollmentContext = 
  | 'consent_management'
  | 'patient_information'
  | 'provider_treatment'
  | 'insurance_information'
  | 'clinical_assessment'
  | 'review_submit';

export type PersonalityMode = 'humorous' | 'empathetic' | 'professional' | 'casual';

interface EnrollmentAIOptions {
  moduleType?: string;
  personalityMode?: PersonalityMode;
  context?: EnrollmentContext;
  provider?: 'openai' | 'claude' | 'gemini';
}

const ENROLLMENT_SYSTEM_PROMPTS: Record<EnrollmentContext, string> = {
  consent_management: `You are a healthcare enrollment assistant helping patients understand and provide consent. 
Be clear about what they're consenting to, explain privacy policies in simple terms, and ensure they understand their rights.
Always be patient and answer questions about consent thoroughly.`,

  patient_information: `You are collecting patient demographic information for healthcare enrollment.
Guide patients through providing their personal details like name, date of birth, contact information, and address.
Be friendly and reassure them about data privacy.`,

  provider_treatment: `You are verifying healthcare provider and treatment center information.
Help validate NPI numbers, confirm provider credentials, and ensure treatment center details are accurate.
Explain what NPI verification means and why it's important.`,

  insurance_information: `You are collecting comprehensive insurance information for benefits verification.
Guide patients through primary, secondary, and pharmacy insurance details.
Explain insurance terms like deductibles, copays, and prior authorization in simple language.`,

  clinical_assessment: `You are conducting a clinical assessment for healthcare enrollment.
Collect medical history, current medications, allergies, and treatment goals.
Be empathetic when discussing health conditions and ensure completeness.`,

  review_submit: `You are helping patients review and submit their enrollment application.
Summarize the information collected, highlight any missing fields, and guide them through final submission.
Confirm all required consents are in place before submission.`
};

const PERSONALITY_MODIFIERS: Record<PersonalityMode, string> = {
  humorous: 'Add light humor and emojis to make the process enjoyable. Keep it professional but friendly.',
  empathetic: 'Be warm, understanding, and supportive. Acknowledge that healthcare processes can be stressful.',
  professional: 'Be formal, efficient, and thorough. Focus on accuracy and completeness.',
  casual: 'Be friendly and conversational. Use simple language and be approachable.'
};

export const useEnrollmentUniversalAI = (options: EnrollmentAIOptions = {}) => {
  const {
    moduleType = 'patient',
    personalityMode = 'professional',
    context = 'patient_information',
    provider = 'gemini'
  } = options;

  const universalAI = useUniversalAI({ defaultProvider: provider });

  // Build enrollment-specific system prompt
  const buildSystemPrompt = useCallback((enrollmentContext: EnrollmentContext, personality: PersonalityMode) => {
    const basePrompt = ENROLLMENT_SYSTEM_PROMPTS[enrollmentContext] || ENROLLMENT_SYSTEM_PROMPTS.patient_information;
    const personalityModifier = PERSONALITY_MODIFIERS[personality];
    
    return `${basePrompt}

PERSONALITY STYLE: ${personalityModifier}

MODULE TYPE: ${moduleType}

IMPORTANT GUIDELINES:
- Always validate user inputs before proceeding
- Provide clear feedback on what information is needed
- If user seems confused, offer helpful examples
- Keep responses concise but complete
- Track progress through enrollment sections`;
  }, [moduleType]);

  // Generate AI guidance for current enrollment step
  const getFieldGuidance = useCallback(async (
    fieldName: string,
    fieldDescription: string,
    enrollmentContext: EnrollmentContext = context,
    personality: PersonalityMode = personalityMode
  ) => {
    const systemPrompt = buildSystemPrompt(enrollmentContext, personality);
    
    const response = await universalAI.generateResponse({
      provider,
      prompt: `Help the user fill out the "${fieldName}" field. 
Field description: ${fieldDescription}
Provide a brief, helpful prompt to guide them in completing this field.`,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 200
    }, { silent: true });

    return response?.content || `Please provide your ${fieldName}.`;
  }, [universalAI, buildSystemPrompt, context, personalityMode, provider]);

  // Process conversational enrollment message
  const processEnrollmentMessage = useCallback(async (
    userMessage: string,
    enrollmentContext: EnrollmentContext = context,
    personality: PersonalityMode = personalityMode,
    additionalContext?: Record<string, any>
  ) => {
    const systemPrompt = buildSystemPrompt(enrollmentContext, personality);
    
    const contextInfo = additionalContext 
      ? `\n\nADDITIONAL CONTEXT:\n${JSON.stringify(additionalContext, null, 2)}`
      : '';

    const response = await universalAI.generateResponse({
      provider,
      prompt: `User message: "${userMessage}"${contextInfo}

Respond helpfully and guide them to the next step in the enrollment process.
If they provided information, acknowledge it and ask for the next required field.
If they have a question, answer it clearly.`,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
      context: additionalContext
    });

    return {
      content: response?.content || "I'm here to help. Could you please repeat that?",
      provider: response?.provider,
      model: response?.model,
      usage: response?.usage
    };
  }, [universalAI, buildSystemPrompt, context, personalityMode, provider]);

  // Validate field value with AI assistance
  const validateFieldWithAI = useCallback(async (
    fieldName: string,
    fieldValue: string,
    validationRules?: string
  ) => {
    const response = await universalAI.generateResponse({
      provider,
      prompt: `Validate this enrollment field:
Field: ${fieldName}
Value: "${fieldValue}"
${validationRules ? `Rules: ${validationRules}` : ''}

Respond with JSON: { "isValid": boolean, "message": string, "suggestion": string | null }`,
      systemPrompt: 'You are a data validation assistant. Respond only with valid JSON.',
      temperature: 0.3,
      maxTokens: 150
    }, { silent: true });

    try {
      return JSON.parse(response?.content || '{"isValid": true, "message": "Looks good!"}');
    } catch {
      return { isValid: true, message: 'Value accepted.' };
    }
  }, [universalAI, provider]);

  // Generate section summary
  const generateSectionSummary = useCallback(async (
    sectionName: string,
    sectionData: Record<string, any>
  ) => {
    const response = await universalAI.generateResponse({
      provider,
      prompt: `Summarize the ${sectionName} section data for the patient to review:
${JSON.stringify(sectionData, null, 2)}

Provide a brief, readable summary in 2-3 sentences.`,
      systemPrompt: 'You are summarizing enrollment data for patient review. Be clear and concise.',
      temperature: 0.5,
      maxTokens: 200
    }, { silent: true });

    return response?.content || 'Section data collected successfully.';
  }, [universalAI, provider]);

  // Get available model categories
  const modelCategories = useMemo(() => ({
    fast: ['gemini-2.5-flash', 'gpt-4o-mini', 'claude-haiku-4-5'],
    balanced: ['gemini-2.5-flash', 'gpt-5-mini-2025-08-07', 'claude-sonnet-4-6'],
    powerful: ['gemini-2.5-pro', 'gpt-5-2025-08-07', 'claude-opus-4-6']
  }), []);

  return {
    // Core AI state from useUniversalAI
    isLoading: universalAI.isLoading,
    error: universalAI.error,
    response: universalAI.response,
    providers: universalAI.providers,

    // Enrollment-specific methods
    getFieldGuidance,
    processEnrollmentMessage,
    validateFieldWithAI,
    generateSectionSummary,
    buildSystemPrompt,

    // Pass through useful utilities
    chat: universalAI.chat,
    generateResponse: universalAI.generateResponse,
    clearError: universalAI.clearError,
    getModelsForProvider: universalAI.getModelsForProvider,
    isProviderAvailable: universalAI.isProviderAvailable,

    // Model recommendations for enrollment
    modelCategories,
    currentProvider: provider
  };
};
