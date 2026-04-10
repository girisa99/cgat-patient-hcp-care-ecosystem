/**
 * UNIFIED AI CONNECTOR SERVICE
 * Connects all agent types to the same Universal AI infrastructure
 * Provides consistent AI capabilities across:
 * - Genie AI (public/internal)
 * - Enrollment agents
 * - Order status agents
 * - Treatment center onboarding
 * - Manufacturing onboarding
 */
import { supabase } from '@/integrations/supabase/client';
import { agentInfrastructureHub, UnifiedAgentConfig } from './agentInfrastructureHub';
import { EnrollmentMCPBridge } from './enrollmentMCPBridge';

// Screen mode types for different conversation interfaces
export type ScreenMode = 'default' | 'single' | 'split' | 'form-specific';

// Conversation context type
export type ConversationContextType = 
  | 'general' 
  | 'enrollment_form' 
  | 'order_tracking' 
  | 'treatment_onboarding'
  | 'manufacturing_onboarding'
  | 'patient_intake';

// Universal AI provider configuration
export interface UniversalAIProviderConfig {
  provider: 'openai' | 'claude' | 'gemini';
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Screen mode configuration per use case
export interface ScreenModeConfig {
  defaultMode: ScreenMode;
  availableModes: ScreenMode[];
  formSpecificFields?: string[];
  splitViewPanels?: {
    left: 'conversation' | 'form' | 'status';
    right: 'conversation' | 'form' | 'status' | 'analytics';
  };
}

// Use case screen configurations
export const USE_CASE_SCREEN_CONFIGS: Record<string, ScreenModeConfig> = {
  patient_intake: {
    defaultMode: 'form-specific',
    availableModes: ['default', 'single', 'split', 'form-specific'],
    formSpecificFields: [
      'patient_demographics', 'insurance_info', 'medical_history', 
      'consent_forms', 'clinical_assessment'
    ],
    splitViewPanels: { left: 'form', right: 'conversation' },
  },
  enrollment: {
    defaultMode: 'form-specific',
    availableModes: ['default', 'single', 'split', 'form-specific'],
    formSpecificFields: [
      'patient_info', 'provider_info', 'insurance_verification', 
      'npi_verification', 'consent_management'
    ],
    splitViewPanels: { left: 'form', right: 'conversation' },
  },
  order_status: {
    defaultMode: 'single',
    availableModes: ['default', 'single', 'split'],
    splitViewPanels: { left: 'conversation', right: 'status' },
  },
  treatment_center_onboarding: {
    defaultMode: 'split',
    availableModes: ['default', 'single', 'split', 'form-specific'],
    formSpecificFields: [
      'center_info', 'credentialing', 'compliance_docs', 
      'npi_verification', 'provider_agreements'
    ],
    splitViewPanels: { left: 'form', right: 'conversation' },
  },
  manufacturing_onboarding: {
    defaultMode: 'split',
    availableModes: ['default', 'single', 'split', 'form-specific'],
    formSpecificFields: [
      'facility_info', 'compliance_docs', 'quality_certifications',
      'equipment_specs', 'process_documentation'
    ],
    splitViewPanels: { left: 'form', right: 'conversation' },
  },
  general: {
    defaultMode: 'default',
    availableModes: ['default', 'single'],
  },
};

// AI model categories for different use cases
const MODEL_CATEGORIES = {
  llm: {
    openai: ['gpt-5-2025-08-07', 'gpt-4.1-2025-04-14', 'o3-2025-04-16'],
    claude: ['claude-opus-4-6', 'claude-sonnet-4-6'],
    gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-pro'],
  },
  small: {
    openai: ['gpt-5-mini-2025-08-07', 'gpt-5-nano-2025-08-07', 'gpt-4o-mini'],
    claude: ['claude-haiku-4-5'],
    gemini: ['gemini-2.5-flash'],
  },
  healthcare: {
    specialized: ['biomed-llama-7b', 'clinical-bert', 'pubmed-gpt', 'pharma-t5'],
  },
  mcp: {
    healthcare: ['healthcare-ai-mcp-server', 'biomcp-biotech-pharma-server'],
    general: ['filesystem-mcp-server', 'database-mcp-toolbox'],
  },
};

// Unified AI request interface
export interface UnifiedAIRequest {
  agentId?: string;
  deploymentId?: string;
  useCaseId: string;
  prompt: string;
  conversationContext: ConversationContextType;
  screenMode?: ScreenMode;
  formContext?: {
    currentSection?: string;
    completedFields?: string[];
    formData?: Record<string, any>;
  };
  providerConfig?: Partial<UniversalAIProviderConfig>;
}

// Unified AI response interface
export interface UnifiedAIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: {
    screenMode: ScreenMode;
    conversationContext: ConversationContextType;
    mcpToolsUsed?: string[];
    formFieldsUpdated?: string[];
  };
}

class UnifiedAIConnector {
  private agentConfigs: Map<string, UnifiedAgentConfig> = new Map();
  
  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: 'openai' | 'claude' | 'gemini'): string {
    switch (provider) {
      case 'openai': return 'gpt-4o-mini';
      case 'claude': return 'claude-haiku-4-5';
      case 'gemini': return 'gemini-2.5-flash';
      default: return 'gpt-4o-mini';
    }
  }

  /**
   * Get system prompt for use case and context
   */
  private getSystemPrompt(useCaseId: string, context: ConversationContextType, screenMode: ScreenMode): string {
    const basePrompt = 'You are a helpful AI assistant.';
    
    const useCasePrompts: Record<string, string> = {
      patient_intake: `You are a healthcare patient intake specialist. Guide patients through the enrollment process, verify information, and ensure HIPAA compliance. ${screenMode === 'form-specific' ? 'Focus on the current form section being completed.' : ''}`,
      enrollment: `You are an enrollment specialist helping with patient and provider enrollment. Verify NPI numbers, insurance information, and manage consent workflows. ${screenMode === 'form-specific' ? 'Guide the user through each form field contextually.' : ''}`,
      order_status: `You are an order tracking specialist. Help users check order status, track shipments, and resolve order-related inquiries. Provide clear, concise status updates.`,
      treatment_center_onboarding: `You are a treatment center onboarding specialist. Guide facilities through credentialing, compliance documentation, and NPI verification. ${screenMode === 'split' ? 'Provide guidance while they complete the forms.' : ''}`,
      manufacturing_onboarding: `You are a manufacturing facility onboarding specialist. Help facilities complete compliance documentation, quality certifications, and process documentation. ${screenMode === 'split' ? 'Assist with form completion in real-time.' : ''}`,
    };

    return useCasePrompts[useCaseId] || basePrompt;
  }

  /**
   * Get screen mode configuration for a use case
   */
  getScreenModeConfig(useCaseId: string): ScreenModeConfig {
    return USE_CASE_SCREEN_CONFIGS[useCaseId] || USE_CASE_SCREEN_CONFIGS.general;
  }

  /**
   * Generate AI response using unified infrastructure
   */
  async generateResponse(request: UnifiedAIRequest): Promise<UnifiedAIResponse | null> {
    try {
      const screenModeConfig = this.getScreenModeConfig(request.useCaseId);
      const screenMode = request.screenMode || screenModeConfig.defaultMode;
      
      const provider = request.providerConfig?.provider || 'gemini';
      const model = request.providerConfig?.model || this.getDefaultModel(provider);
      const systemPrompt = request.providerConfig?.systemPrompt || 
        this.getSystemPrompt(request.useCaseId, request.conversationContext, screenMode);

      // Build context-aware prompt
      let enhancedPrompt = request.prompt;
      if (request.formContext && screenMode === 'form-specific') {
        enhancedPrompt = `[Current Section: ${request.formContext.currentSection || 'general'}]
[Completed Fields: ${request.formContext.completedFields?.join(', ') || 'none'}]
User Query: ${request.prompt}`;
      }

      // Call the universal AI processor
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider,
          model,
          prompt: enhancedPrompt,
          systemPrompt,
          temperature: request.providerConfig?.temperature || 0.7,
          maxTokens: request.providerConfig?.maxTokens || 1000,
          action: 'generate',
          context: {
            useCaseId: request.useCaseId,
            conversationContext: request.conversationContext,
            screenMode,
            formContext: request.formContext,
          },
        },
      });

      if (error) throw new Error(error.message);

      // Process MCP tools if agent is configured
      let mcpToolsUsed: string[] = [];
      if (request.agentId) {
        const mcpBridge = agentInfrastructureHub.getMCPBridge(request.agentId);
        if (mcpBridge && request.formContext) {
          // Auto-trigger MCP tools based on context
          mcpToolsUsed = await this.autoTriggerMCPTools(
            request.agentId,
            mcpBridge,
            request.conversationContext,
            request.formContext
          );
        }
      }

      return {
        content: data.content,
        provider: data.provider || provider,
        model: data.model || model,
        usage: data.usage,
        metadata: {
          screenMode,
          conversationContext: request.conversationContext,
          mcpToolsUsed,
          formFieldsUpdated: request.formContext?.completedFields,
        },
      };
    } catch (error) {
      console.error('Unified AI generation failed:', error);
      return null;
    }
  }

  /**
   * Auto-trigger MCP tools based on conversation context
   */
  private async autoTriggerMCPTools(
    agentId: string,
    bridge: EnrollmentMCPBridge,
    context: ConversationContextType,
    formContext: UnifiedAIRequest['formContext']
  ): Promise<string[]> {
    const toolsUsed: string[] = [];

    try {
      // Auto-trigger NPI verification if provider info is present
      if (formContext?.formData?.npi_number && context !== 'general') {
        await agentInfrastructureHub.executeMCPTool(
          agentId,
          'verify-npi',
          { npiNumber: formContext.formData.npi_number }
        );
        toolsUsed.push('verify-npi');
      }

      // Auto-trigger insurance verification if insurance data is present
      if (formContext?.formData?.insurance_member_id && context !== 'general') {
        await agentInfrastructureHub.executeMCPTool(
          agentId,
          'validate-insurance',
          {
            memberId: formContext.formData.insurance_member_id,
            payerName: formContext.formData.insurance_payer,
            groupNumber: formContext.formData.insurance_group,
          }
        );
        toolsUsed.push('validate-insurance');
      }

      // Auto-trigger smart routing if navigating form
      if (formContext?.currentSection) {
        await agentInfrastructureHub.executeMCPTool(
          agentId,
          'smart-field-routing',
          {
            current_section: formContext.currentSection,
            completed_fields: formContext.completedFields || [],
          }
        );
        toolsUsed.push('smart-field-routing');
      }
    } catch (error) {
      console.error('MCP auto-trigger error:', error);
    }

    return toolsUsed;
  }

  /**
   * Initialize agent with unified AI and screen mode config
   */
  async initializeUnifiedAgent(params: {
    name: string;
    useCaseId: string;
    branding: { brandName: string; primaryColor?: string; logoUrl?: string };
    screenMode?: ScreenMode;
    providerConfig?: Partial<UniversalAIProviderConfig>;
    enabledFeatures?: string[];
    channels?: string[];
  }): Promise<{ success: boolean; agentId?: string; config?: UnifiedAgentConfig; error?: string }> {
    try {
      // Get screen mode config for use case
      const screenModeConfig = this.getScreenModeConfig(params.useCaseId);
      const effectiveScreenMode = params.screenMode || screenModeConfig.defaultMode;

      // Add screen mode to features
      const featuresWithScreenMode = [
        ...(params.enabledFeatures || []),
        `screen_mode_${effectiveScreenMode}`,
      ];

      // Initialize through infrastructure hub
      const result = await agentInfrastructureHub.initializeAgent({
        name: params.name,
        useCaseId: params.useCaseId,
        branding: params.branding,
        enabledFeatures: featuresWithScreenMode,
        channels: params.channels,
        mcpConfig: {
          enableNPIVerification: ['patient_intake', 'enrollment', 'treatment_center_onboarding'].includes(params.useCaseId),
          enableInsuranceVerification: ['patient_intake', 'enrollment'].includes(params.useCaseId),
          enableSmartRouting: effectiveScreenMode === 'form-specific' || effectiveScreenMode === 'split',
          enableCredentialing: ['treatment_center_onboarding', 'manufacturing_onboarding'].includes(params.useCaseId),
          enableDBSync: true,
          enableAnalytics: true,
        },
      });

      if (result.success && result.config) {
        this.agentConfigs.set(result.config.agentId, result.config);
      }

      return {
        success: result.success,
        agentId: result.config?.agentId,
        config: result.config,
        error: result.error,
      };
    } catch (error) {
      console.error('Failed to initialize unified agent:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get models by category
   */
  getModelsByCategory(category: 'llm' | 'small' | 'healthcare' | 'mcp'): Record<string, string[]> {
    return MODEL_CATEGORIES[category] || {};
  }

  /**
   * Get recommended models for use case
   */
  getRecommendedModels(useCaseId: string): { provider: string; model: string; reason: string }[] {
    const recommendations: { provider: string; model: string; reason: string }[] = [];

    switch (useCaseId) {
      case 'patient_intake':
      case 'enrollment':
        recommendations.push(
          { provider: 'gemini', model: 'gemini-2.5-flash', reason: 'Fast responses for form guidance' },
          { provider: 'openai', model: 'gpt-4o-mini', reason: 'Cost-effective for high volume' },
        );
        break;
      case 'treatment_center_onboarding':
      case 'manufacturing_onboarding':
        recommendations.push(
          { provider: 'claude', model: 'claude-haiku-4-5', reason: 'Strong document analysis' },
          { provider: 'gemini', model: 'gemini-2.5-pro', reason: 'Large context for complex docs' },
        );
        break;
      case 'order_status':
        recommendations.push(
          { provider: 'openai', model: 'gpt-4o-mini', reason: 'Fast, cost-effective responses' },
          { provider: 'gemini', model: 'gemini-2.5-flash', reason: 'Low latency tracking queries' },
        );
        break;
      default:
        recommendations.push(
          { provider: 'gemini', model: 'gemini-2.5-flash', reason: 'General purpose, balanced' },
        );
    }

    return recommendations;
  }

  /**
   * Stream AI response (for real-time interfaces)
   */
  async streamResponse(
    request: UnifiedAIRequest,
    onChunk: (chunk: string) => void,
    onComplete: (response: UnifiedAIResponse) => void
  ): Promise<void> {
    const screenModeConfig = this.getScreenModeConfig(request.useCaseId);
    const screenMode = request.screenMode || screenModeConfig.defaultMode;
    
    const provider = request.providerConfig?.provider || 'gemini';
    const model = request.providerConfig?.model || this.getDefaultModel(provider);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-universal-processor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          provider,
          model,
          prompt: request.prompt,
          systemPrompt: this.getSystemPrompt(request.useCaseId, request.conversationContext, screenMode),
          stream: true,
          action: 'generate',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Stream failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      onComplete({
        content: fullContent,
        provider,
        model,
        metadata: {
          screenMode,
          conversationContext: request.conversationContext,
        },
      });
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }
}

export const unifiedAIConnector = new UnifiedAIConnector();
