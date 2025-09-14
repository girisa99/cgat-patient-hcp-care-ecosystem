/**
 * ENHANCED AI PROCESSING SERVICE
 * Multi-provider AI processing with intelligent fallback mechanisms
 * and advanced error handling and response optimization
 */
import { supabase } from '@/integrations/supabase/client';
import { featureIntegrationEngine, ProcessingRequest } from './featureIntegrationEngine';

export interface AIProvider {
  id: 'openai' | 'claude' | 'gemini';
  name: string;
  priority: number;
  available: boolean;
  lastChecked: string;
  models: string[];
  capabilities: string[];
}

export interface EnhancedAIRequest {
  prompt: string;
  provider?: 'openai' | 'claude' | 'gemini';
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  enabledFeatures?: string[];
  medicalContext?: boolean;
  selectedMCPTools?: string[];
  knowledgeBase?: string;
  useFeatureEngine?: boolean;
  fallbackEnabled?: boolean;
}

export interface EnhancedAIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: any;
  timestamp: string;
  processingMetadata?: {
    featuresUsed: string[];
    processingTime: number;
    contextSources: string[];
    confidence: number;
    fallbackUsed?: boolean;
    providerAttempts: string[];
  };
  featureContext?: any;
}

export class EnhancedAIService {
  private static instance: EnhancedAIService;
  private providerHealth: Map<string, boolean> = new Map();
  private lastHealthCheck: Date = new Date(0);
  private healthCheckInterval = 30000; // 30 seconds
  
  static getInstance(): EnhancedAIService {
    if (!EnhancedAIService.instance) {
      EnhancedAIService.instance = new EnhancedAIService();
    }
    return EnhancedAIService.instance;
  }

  async generateResponse(request: EnhancedAIRequest): Promise<EnhancedAIResponse> {
    const startTime = Date.now();
    const providerAttempts: string[] = [];
    
    console.log('🚀 Enhanced AI Service processing request:', {
      provider: request.provider,
      model: request.model,
      features: request.enabledFeatures,
      useFeatureEngine: request.useFeatureEngine
    });

    // Check provider health
    await this.checkProviderHealth();

    // Process with Feature Integration Engine if enabled
    let enhancedPrompt = request.prompt;
    let systemPrompt = request.systemPrompt || '';
    let featureContext: any = {};
    let processingMetadata: any = {};

    if (request.useFeatureEngine && request.enabledFeatures?.length) {
      try {
        console.log('🔄 Using Feature Integration Engine...');
        const featureRequest: ProcessingRequest = {
          prompt: request.prompt,
          enabledFeatures: request.enabledFeatures,
          medicalContext: request.medicalContext,
          selectedMCPTools: request.selectedMCPTools,
          knowledgeBase: request.knowledgeBase
        };

        const featureResult = await featureIntegrationEngine.processRequest(featureRequest);
        enhancedPrompt = featureResult.enhancedPrompt;
        systemPrompt = featureResult.systemPrompt;
        featureContext = featureResult.featureContext;
        processingMetadata = featureResult.processingMetadata;
        
        console.log('✅ Feature Integration completed:', {
          featuresUsed: processingMetadata.featuresUsed,
          contextSources: processingMetadata.contextSources
        });
      } catch (error) {
        console.warn('⚠️ Feature Integration Engine failed, proceeding with basic processing:', error);
      }
    }

    // Determine provider priority order
    const providers = await this.getProviderPriorityOrder(request.provider);
    let lastError: Error | null = null;

    // Attempt to get response from providers with fallback
    for (const provider of providers) {
      if (!request.fallbackEnabled && provider !== (request.provider || 'openai')) {
        continue; // Skip fallback if disabled
      }

      try {
        console.log(`🎯 Attempting provider: ${provider}`);
        providerAttempts.push(provider);

        const response = await this.callProvider(provider, {
          ...request,
          prompt: enhancedPrompt,
          systemPrompt
        });

        console.log(`✅ Success with provider: ${provider}`);

        const totalProcessingTime = Date.now() - startTime;
        
        return {
          ...response,
          processingMetadata: {
            ...processingMetadata,
            processingTime: totalProcessingTime,
            fallbackUsed: provider !== (request.provider || 'openai'),
            providerAttempts
          },
          featureContext
        };

      } catch (error) {
        console.warn(`❌ Provider ${provider} failed:`, error);
        lastError = error as Error;
        this.markProviderUnhealthy(provider);
        
        // If this is the last provider, we'll throw the error
        if (providers.indexOf(provider) === providers.length - 1) {
          break;
        }
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    console.error('🚨 All AI providers failed:', lastError);
    throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  private async callProvider(provider: string, request: EnhancedAIRequest): Promise<EnhancedAIResponse> {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider,
        model: request.model || this.getDefaultModel(provider),
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        temperature: request.temperature || 0.7,
        maxTokens: request.maxTokens || 1000
      }
    });

    if (error) {
      throw new Error(`Provider ${provider} error: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      content: data.content,
      provider,
      model: request.model || this.getDefaultModel(provider),
      usage: data.usage,
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  private async getProviderPriorityOrder(preferredProvider?: string): Promise<string[]> {
    const healthyProviders = Array.from(this.providerHealth.entries())
      .filter(([_, healthy]) => healthy)
      .map(([provider, _]) => provider);

    const allProviders = ['openai', 'claude', 'gemini'];
    
    // If preferred provider is healthy, put it first
    if (preferredProvider && healthyProviders.includes(preferredProvider)) {
      const otherHealthy = healthyProviders.filter(p => p !== preferredProvider);
      return [preferredProvider, ...otherHealthy];
    }

    // Return healthy providers in priority order, then unhealthy ones as last resort
    const unhealthyProviders = allProviders.filter(p => !healthyProviders.includes(p));
    return [...healthyProviders, ...unhealthyProviders];
  }

  private getDefaultModel(provider: string): string {
    const defaultModels = {
      'openai': 'gpt-4o-mini',
      'claude': 'claude-3-5-haiku-20241022',
      'gemini': 'gemini-pro'
    };
    return defaultModels[provider as keyof typeof defaultModels] || 'gpt-4o-mini';
  }

  private async checkProviderHealth(): Promise<void> {
    const now = new Date();
    if (now.getTime() - this.lastHealthCheck.getTime() < this.healthCheckInterval) {
      return; // Skip if checked recently
    }

    console.log('🔍 Checking provider health...');
    
    const providers = ['openai', 'claude', 'gemini'];
    const healthPromises = providers.map(async (provider) => {
      try {
        const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
          body: { action: 'health_check', provider }
        });
        if (error) throw error;
        const healthy = !!data && data.status === 'ok';
        return { provider, healthy };
      } catch (error) {
        console.warn(`Health check failed for ${provider}:`, error);
        return { provider, healthy: false };
      }
    });

    const results = await Promise.allSettled(healthPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.providerHealth.set(result.value.provider, result.value.healthy);
      } else {
        this.providerHealth.set(providers[index], false);
      }
    });

    this.lastHealthCheck = now;
    
    const healthyCount = Array.from(this.providerHealth.values()).filter(Boolean).length;
    console.log(`📊 Provider health check complete: ${healthyCount}/${providers.length} healthy`);
  }

  private markProviderUnhealthy(provider: string): void {
    this.providerHealth.set(provider, false);
    console.log(`🔴 Marked provider ${provider} as unhealthy`);
  }

  async getProviderStatus(): Promise<AIProvider[]> {
    await this.checkProviderHealth();
    
    return [
      {
        id: 'openai',
        name: 'OpenAI',
        priority: 1,
        available: this.providerHealth.get('openai') || false,
        lastChecked: this.lastHealthCheck.toISOString(),
        models: ['gpt-5-2025-08-07', 'gpt-4o-mini', 'gpt-4.1-2025-04-14'],
        capabilities: ['text', 'vision', 'reasoning']
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        priority: 2,
        available: this.providerHealth.get('claude') || false,
        lastChecked: this.lastHealthCheck.toISOString(),
        models: ['claude-opus-4-1-20250805', 'claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
        capabilities: ['text', 'vision', 'analysis']
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        priority: 3,
        available: this.providerHealth.get('gemini') || false,
        lastChecked: this.lastHealthCheck.toISOString(),
        models: ['gemini-pro', 'gemini-pro-vision'],
        capabilities: ['text', 'vision', 'multimodal']
      }
    ];
  }

  async testProvider(provider: 'openai' | 'claude' | 'gemini'): Promise<boolean> {
    try {
      const testResponse = await this.callProvider(provider, {
        prompt: 'Test connection',
        model: this.getDefaultModel(provider),
        maxTokens: 10
      });
      
      this.providerHealth.set(provider, true);
      return true;
    } catch (error) {
      console.error(`Provider test failed for ${provider}:`, error);
      this.providerHealth.set(provider, false);
      return false;
    }
  }
}

export const enhancedAIService = EnhancedAIService.getInstance();