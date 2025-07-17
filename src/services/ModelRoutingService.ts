/**
 * Model Routing Service
 * Handles automatic model selection based on user preferences, task type, and performance requirements
 */

import { 
  ModelConfig, 
  UserModelPreferences, 
  ModelRoutingRule, 
  ModelCapability,
  ALL_MODELS,
  ModelMetrics 
} from '@/types/ModelTypes';

export interface ModelRequest {
  taskType: ModelCapability;
  inputText: string;
  userRole?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  maxLatency?: number; // milliseconds
  maxCost?: number;
  requiresPrivacy?: boolean;
}

export interface ModelResponse {
  selectedModel: ModelConfig;
  fallbackModels: ModelConfig[];
  estimatedCost?: number;
  estimatedLatency?: number;
  reasoning: string[];
}

export class ModelRoutingService {
  private preferences: UserModelPreferences;
  private routingRules: ModelRoutingRule[];
  private modelMetrics: Map<string, ModelMetrics>;

  constructor(
    preferences: UserModelPreferences,
    routingRules: ModelRoutingRule[] = [],
    modelMetrics: ModelMetrics[] = []
  ) {
    this.preferences = preferences;
    this.routingRules = routingRules;
    this.modelMetrics = new Map(modelMetrics.map(m => [m.modelId, m]));
  }

  /**
   * Select the best model for a given request
   */
  selectModel(request: ModelRequest): ModelResponse {
    const reasoning: string[] = [];
    
    // Step 1: Filter models by capability
    let candidateModels = ALL_MODELS.filter(model => 
      model.capabilities.includes(request.taskType)
    );
    reasoning.push(`Filtered to ${candidateModels.length} models with ${request.taskType} capability`);

    // Step 2: Apply user preferences
    candidateModels = this.applyUserPreferences(candidateModels, request, reasoning);

    // Step 3: Apply routing rules
    candidateModels = this.applyRoutingRules(candidateModels, request, reasoning);

    // Step 4: Apply performance constraints
    candidateModels = this.applyPerformanceConstraints(candidateModels, request, reasoning);

    // Step 5: Score and rank models
    const scoredModels = this.scoreModels(candidateModels, request, reasoning);

    // Step 6: Select primary and fallback models
    const selectedModel = scoredModels[0]?.model;
    const fallbackModels = scoredModels.slice(1, 4).map(sm => sm.model);

    if (!selectedModel) {
      // Emergency fallback to any available model
      const emergencyModel = ALL_MODELS.find(m => m.capabilities.includes(request.taskType));
      if (emergencyModel) {
        reasoning.push('Emergency fallback: No models met criteria, using any available model');
        return {
          selectedModel: emergencyModel,
          fallbackModels: [],
          reasoning
        };
      }
      throw new Error('No suitable models found for request');
    }

    return {
      selectedModel,
      fallbackModels,
      estimatedCost: this.estimateCost(selectedModel, request),
      estimatedLatency: this.estimateLatency(selectedModel, request),
      reasoning
    };
  }

  private applyUserPreferences(
    models: ModelConfig[], 
    request: ModelRequest, 
    reasoning: string[]
  ): ModelConfig[] {
    // Respect user's preferred model for this task type
    const preferredModelId = this.preferences.preferredModels[request.taskType];
    const preferredModel = models.find(m => m.id === preferredModelId);
    
    if (preferredModel) {
      reasoning.push(`User prefers ${preferredModel.name} for ${request.taskType} tasks`);
      // Move preferred model to front, but keep others as fallbacks
      models = [preferredModel, ...models.filter(m => m.id !== preferredModelId)];
    }

    // Filter by local model preference
    if (!this.preferences.allowLocalModels) {
      models = models.filter(m => !m.isLocal);
      reasoning.push('Filtered out local models per user preference');
    }

    // Apply fallback strategy
    switch (this.preferences.fallbackStrategy) {
      case 'local-first':
        models.sort((a, b) => {
          if (a.isLocal && !b.isLocal) return -1;
          if (!a.isLocal && b.isLocal) return 1;
          return 0;
        });
        reasoning.push('Prioritized local models (local-first strategy)');
        break;
      
      case 'api-first':
        models.sort((a, b) => {
          if (!a.isLocal && b.isLocal) return -1;
          if (a.isLocal && !b.isLocal) return 1;
          return 0;
        });
        reasoning.push('Prioritized API models (api-first strategy)');
        break;
    }

    return models;
  }

  private applyRoutingRules(
    models: ModelConfig[], 
    request: ModelRequest, 
    reasoning: string[]
  ): ModelConfig[] {
    for (const rule of this.routingRules.filter(r => r.isActive)) {
      // Check if rule conditions match
      const matches = this.ruleMatches(rule, request);
      if (matches) {
        const targetModel = models.find(m => m.id === rule.targetModel);
        if (targetModel) {
          reasoning.push(`Applied routing rule: ${rule.name}`);
          return [targetModel, ...models.filter(m => m.id !== rule.targetModel)];
        }
      }
    }
    return models;
  }

  private ruleMatches(rule: ModelRoutingRule, request: ModelRequest): boolean {
    const { conditions } = rule;
    
    if (conditions.taskType && !conditions.taskType.includes(request.taskType)) {
      return false;
    }
    
    if (conditions.userRole && request.userRole && !conditions.userRole.includes(request.userRole)) {
      return false;
    }
    
    if (conditions.priority && request.priority !== conditions.priority) {
      return false;
    }
    
    if (conditions.requestSize) {
      const textLength = request.inputText.length;
      if (conditions.requestSize.min && textLength < conditions.requestSize.min) return false;
      if (conditions.requestSize.max && textLength > conditions.requestSize.max) return false;
    }
    
    return true;
  }

  private applyPerformanceConstraints(
    models: ModelConfig[], 
    request: ModelRequest, 
    reasoning: string[]
  ): ModelConfig[] {
    let filtered = models;

    // Apply cost constraints
    const maxCost = request.maxCost || this.preferences.maxCostPerRequest;
    if (maxCost > 0) {
      filtered = filtered.filter(model => {
        const estimatedCost = this.estimateCost(model, request);
        return !estimatedCost || estimatedCost <= maxCost;
      });
      reasoning.push(`Filtered by max cost: $${maxCost}`);
    }

    // Apply latency constraints
    if (request.maxLatency) {
      filtered = filtered.filter(model => {
        const estimatedLatency = this.estimateLatency(model, request);
        return estimatedLatency <= request.maxLatency!;
      });
      reasoning.push(`Filtered by max latency: ${request.maxLatency}ms`);
    }

    // Apply privacy constraints
    if (request.requiresPrivacy) {
      filtered = filtered.filter(model => model.isLocal);
      reasoning.push('Filtered to local models for privacy');
    }

    return filtered;
  }

  private scoreModels(
    models: ModelConfig[], 
    request: ModelRequest, 
    reasoning: string[]
  ): Array<{ model: ModelConfig; score: number }> {
    const scoredModels = models.map(model => ({
      model,
      score: this.calculateModelScore(model, request)
    }));

    scoredModels.sort((a, b) => b.score - a.score);
    reasoning.push(`Scored and ranked ${scoredModels.length} models`);
    
    return scoredModels;
  }

  private calculateModelScore(model: ModelConfig, request: ModelRequest): number {
    let score = 0;
    const preference = this.preferences.performancePreference;

    // Base score from accuracy
    const accuracyScore = this.getNumericScore(model.accuracy);
    score += accuracyScore * 30;

    // Performance preference weights
    switch (preference) {
      case 'speed':
        const latencyScore = this.getInverseNumericScore(model.latency);
        score += latencyScore * 40;
        break;
      
      case 'accuracy':
        score += accuracyScore * 40;
        break;
      
      case 'cost':
        if (model.costPerToken) {
          const costScore = Math.max(0, 50 - (model.costPerToken * 100000));
          score += costScore * 40;
        } else {
          score += 40; // Local models are "free"
        }
        break;
      
      case 'privacy':
        if (model.isLocal) score += 40;
        break;
    }

    // Historical performance bonus
    const metrics = this.modelMetrics.get(model.id);
    if (metrics) {
      score += metrics.successRate * 20;
      score += Math.min(metrics.userSatisfactionScore * 10, 10);
    }

    // Context window bonus for large inputs
    const inputLength = request.inputText.length;
    if (inputLength > 1000 && model.contextWindow > 8000) {
      score += 10;
    }

    return score;
  }

  private getNumericScore(value: string): number {
    switch (value) {
      case 'low': return 25;
      case 'medium': return 50;
      case 'high': return 75;
      case 'very-high': return 100;
      default: return 50;
    }
  }

  private getInverseNumericScore(value: string): number {
    switch (value) {
      case 'low': return 100;
      case 'medium': return 50;
      case 'high': return 25;
      default: return 50;
    }
  }

  private estimateCost(model: ModelConfig, request: ModelRequest): number | undefined {
    if (!model.costPerToken) return undefined;
    
    // Rough estimation: input + estimated output tokens
    const inputTokens = Math.ceil(request.inputText.length / 4);
    const estimatedOutputTokens = Math.min(inputTokens * 0.5, 1000);
    const totalTokens = inputTokens + estimatedOutputTokens;
    
    return totalTokens * model.costPerToken;
  }

  private estimateLatency(model: ModelConfig, request: ModelRequest): number {
    // Base latency estimates in milliseconds
    const baseLatency = {
      'low': 200,
      'medium': 1000,
      'high': 3000
    }[model.latency] || 1000;

    // Adjust for input length
    const inputLength = request.inputText.length;
    const lengthMultiplier = 1 + (inputLength / 10000);
    
    return Math.ceil(baseLatency * lengthMultiplier);
  }

  /**
   * Update model metrics after a request
   */
  updateModelMetrics(
    modelId: string, 
    success: boolean, 
    latency: number, 
    tokenCount: number,
    userRating?: number
  ): void {
    const existing = this.modelMetrics.get(modelId);
    
    if (existing) {
      const totalRequests = existing.totalRequests + 1;
      const successRate = success 
        ? (existing.successRate * existing.totalRequests + 100) / totalRequests
        : (existing.successRate * existing.totalRequests) / totalRequests;
      
      const avgLatency = (existing.averageLatency * existing.totalRequests + latency) / totalRequests;
      const avgTokens = (existing.averageTokensPerRequest * existing.totalRequests + tokenCount) / totalRequests;
      
      this.modelMetrics.set(modelId, {
        ...existing,
        totalRequests,
        successRate,
        averageLatency: avgLatency,
        averageTokensPerRequest: avgTokens,
        lastUsed: new Date().toISOString(),
        errorCount: success ? existing.errorCount : existing.errorCount + 1,
        userSatisfactionScore: userRating ? 
          (existing.userSatisfactionScore + userRating) / 2 : 
          existing.userSatisfactionScore
      });
    } else {
      this.modelMetrics.set(modelId, {
        modelId,
        totalRequests: 1,
        successRate: success ? 100 : 0,
        averageLatency: latency,
        averageTokensPerRequest: tokenCount,
        totalCost: 0,
        lastUsed: new Date().toISOString(),
        errorCount: success ? 0 : 1,
        userSatisfactionScore: userRating || 5
      });
    }
  }
}
