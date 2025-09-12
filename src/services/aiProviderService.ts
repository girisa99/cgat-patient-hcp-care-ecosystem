import { supabase } from '@/integrations/supabase/client';

export interface AIProvider {
  id: 'openai' | 'claude' | 'gemini';
  name: string;
  models: string[];
  capabilities: string[];
}

export interface AIRequest {
  provider: 'openai' | 'claude' | 'gemini';
  model?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  context?: any;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metadata?: any;
}

// AI providers are now managed by the universal AI system via useUniversalAI()
// This service provides the implementation layer only

export class AIProviderService {
  private static instance: AIProviderService;

  static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  /**
   * @deprecated Use useUniversalAI() hook instead
   * Get all available AI providers
   */
  getProviders(): AIProvider[] {
    return [];
  }

  /**
   * @deprecated Use useUniversalAI() hook instead
   * Get a specific provider by ID
   */
  getProvider(providerId: string): AIProvider | undefined {
    return undefined;
  }

  /**
   * Get models for a specific provider
   */
  getModelsForProvider(providerId: string): string[] {
    const provider = this.getProvider(providerId);
    return provider?.models || [];
  }

  /**
   * Generate AI response using specified provider
   */
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: request.provider,
          model: request.model || this.getDefaultModel(request.provider),
          prompt: request.prompt,
          systemPrompt: request.systemPrompt,
          temperature: request.temperature || 0.7,
          maxTokens: request.maxTokens || 1000,
          context: request.context
        }
      });

      if (error) throw error;

      return {
        content: data.content,
        provider: data.provider,
        model: data.model,
        usage: data.usage,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('AI Provider Service Error:', error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate agent workflow using AI
   */
  async generateAgent(prompt: string, provider: 'openai' | 'claude' | 'gemini' = 'openai'): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-agent-from-prompt', {
        body: {
          prompt: prompt.trim(),
          provider,
          generateConnections: true,
          includeTemplates: true
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Agent Generation Error:', error);
      throw new Error(`Agent generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test workflow node using AI
   */
  async testWorkflowNode(
    nodeData: any, 
    inputData: any, 
    provider: 'openai' | 'claude' | 'gemini' = 'openai'
  ): Promise<AIResponse> {
    const systemPrompt = `You are a workflow testing assistant. Analyze the provided node and input data, then simulate realistic execution results.

Node Type: ${nodeData.type}
Node Label: ${nodeData.label || 'Unnamed Node'}
Node Configuration: ${JSON.stringify(nodeData.data || {}, null, 2)}

Provide a realistic response that this node would generate, including:
1. Processed output data
2. Any status messages
3. Execution time estimate
4. Success/failure status

Format your response as JSON with these fields:
{
  "success": boolean,
  "output": any,
  "message": string,
  "executionTime": number,
  "status": "completed" | "failed" | "warning"
}`;

    const prompt = `Input Data: ${JSON.stringify(inputData, null, 2)}

Process this input through the node and return the expected output.`;

    return await this.generateResponse({
      provider,
      prompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 500,
      context: { nodeType: nodeData.type, testing: true }
    });
  }

  /**
   * Analyze workflow using AI
   */
  async analyzeWorkflow(
    nodes: any[], 
    edges: any[], 
    provider: 'openai' | 'claude' | 'gemini' = 'openai'
  ): Promise<AIResponse> {
    const systemPrompt = `You are a workflow analysis expert. Analyze the provided workflow structure and provide insights.

Analyze the workflow for:
1. Structural issues (disconnected nodes, missing connections)
2. Logic problems (unreachable nodes, circular dependencies)
3. Performance concerns (bottlenecks, inefficient paths)
4. Best practice violations
5. Optimization suggestions

Format your response as JSON with these fields:
{
  "complexity": "simple" | "moderate" | "complex",
  "riskAssessment": "low" | "medium" | "high",
  "issues": [{"type": "error" | "warning" | "suggestion", "message": string, "nodeId": string?}],
  "suggestions": [string],
  "estimatedRunTime": number,
  "estimatedCost": number
}`;

    const prompt = `Workflow Structure:
Nodes (${nodes.length}): ${JSON.stringify(nodes.map(n => ({ id: n.id, type: n.type, label: n.data?.label })), null, 2)}
Edges (${edges.length}): ${JSON.stringify(edges.map(e => ({ source: e.source, target: e.target })), null, 2)}

Provide a comprehensive analysis of this workflow.`;

    return await this.generateResponse({
      provider,
      prompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 1000,
      context: { analysis: true, nodeCount: nodes.length, edgeCount: edges.length }
    });
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: string): string {
    switch (provider) {
      case 'openai': return 'gpt-4o-mini';
      case 'claude': return 'claude-3-haiku';
      case 'gemini': return 'gemini-pro';
      default: return 'gpt-4o-mini';
    }
  }

  /**
   * Check if provider is available (has API key configured)
   */
  async checkProviderAvailability(provider: 'openai' | 'claude' | 'gemini'): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('check-ai-provider', {
        body: { provider }
      });
      
      return !error && data?.available === true;
    } catch {
      return false;
    }
  }

  /**
   * @deprecated Use useUniversalAI() hook instead
   * Get available providers (only those with API keys configured)
   */
  async getAvailableProviders(): Promise<AIProvider[]> {
    // This method is deprecated - use useUniversalAI() hook instead
    return [];
  }
}

// Export singleton instance
export const aiProviderService = AIProviderService.getInstance();