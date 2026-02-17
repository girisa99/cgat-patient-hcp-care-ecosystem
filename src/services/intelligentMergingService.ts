import { SelectedModelConfig } from '@/components/ai/CrossCategoryModelSelector';

export interface ModelResponse {
  modelId: string;
  provider: string;
  category: 'llm' | 'small' | 'vision' | 'mcp';
  role: 'primary' | 'secondary' | 'specialized';
  response: string;
  confidence: number;
  processingTime: number;
  metadata?: Record<string, any>;
}

export interface MergedResponse {
  finalResponse: string;
  contributingModels: string[];
  mergingStrategy: string;
  confidenceScore: number;
  processingBreakdown: {
    reasoning: string[];
    specializedInsights: string[];
    supportingEvidence: string[];
  };
  metadata: {
    totalProcessingTime: number;
    modelWeights: Record<string, number>;
    mergingApproach: string;
  };
}

export class IntelligentMergingService {
  /**
   * Merge responses from multiple models intelligently based on their roles and strengths
   */
  static mergeResponses(
    responses: ModelResponse[], 
    selectedModels: SelectedModelConfig[],
    mergingStrategy: 'weighted' | 'consensus' | 'hierarchical' | 'specialized' = 'weighted'
  ): MergedResponse {
    
    // Sort responses by role priority and confidence
    const sortedResponses = this.sortResponsesByPriority(responses, selectedModels);
    
    let finalResponse = '';
    let mergingApproach = '';
    const contributingModels: string[] = [];
    const processingBreakdown = {
      reasoning: [] as string[],
      specializedInsights: [] as string[],
      supportingEvidence: [] as string[]
    };

    switch (mergingStrategy) {
      case 'hierarchical':
        ({ finalResponse, mergingApproach } = this.hierarchicalMerging(sortedResponses, processingBreakdown));
        break;
      
      case 'consensus':
        ({ finalResponse, mergingApproach } = this.consensusMerging(sortedResponses, processingBreakdown));
        break;
      
      case 'specialized':
        ({ finalResponse, mergingApproach } = this.specializedMerging(sortedResponses, processingBreakdown));
        break;
      
      case 'weighted':
      default:
        ({ finalResponse, mergingApproach } = this.weightedMerging(sortedResponses, selectedModels, processingBreakdown));
        break;
    }

    // Collect contributing models
    responses.forEach(response => {
      contributingModels.push(`${response.provider}-${response.modelId}`);
    });

    // Calculate overall confidence
    const confidenceScore = this.calculateOverallConfidence(responses, selectedModels);

    // Calculate model weights
    const modelWeights: Record<string, number> = {};
    selectedModels.forEach(model => {
      modelWeights[`${model.provider}-${model.model}`] = model.weight;
    });

    return {
      finalResponse,
      contributingModels,
      mergingStrategy,
      confidenceScore,
      processingBreakdown,
      metadata: {
        totalProcessingTime: responses.reduce((sum, r) => sum + r.processingTime, 0),
        modelWeights,
        mergingApproach
      }
    };
  }

  /**
   * Sort responses by role priority and confidence
   */
  private static sortResponsesByPriority(
    responses: ModelResponse[], 
    selectedModels: SelectedModelConfig[]
  ): ModelResponse[] {
    const rolePriority = { primary: 3, secondary: 2, specialized: 1 };
    
    return responses.sort((a, b) => {
      const aModel = selectedModels.find(m => m.model === a.modelId);
      const bModel = selectedModels.find(m => m.model === b.modelId);
      
      const aPriority = aModel ? rolePriority[aModel.role] : 0;
      const bPriority = bModel ? rolePriority[bModel.role] : 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      return b.confidence - a.confidence; // Higher confidence first
    });
  }

  /**
   * Hierarchical merging - Primary model leads, others support
   */
  private static hierarchicalMerging(
    sortedResponses: ModelResponse[],
    breakdown: { reasoning: string[]; specializedInsights: string[]; supportingEvidence: string[] }
  ) {
    const primaryResponse = sortedResponses.find(r => r.role === 'primary');
    const secondaryResponses = sortedResponses.filter(r => r.role === 'secondary');
    const specializedResponses = sortedResponses.filter(r => r.role === 'specialized');

    let finalResponse = primaryResponse?.response || sortedResponses[0]?.response || '';
    
    // Add specialized insights
    if (specializedResponses.length > 0) {
      const insights = specializedResponses.map(r => r.response).join('\n\n');
      finalResponse += `\n\n**Specialized Analysis:**\n${insights}`;
      breakdown.specializedInsights.push(...specializedResponses.map(r => `${r.provider}: ${r.response}`));
    }

    // Add supporting evidence from secondary models
    if (secondaryResponses.length > 0) {
      const evidence = secondaryResponses
        .filter(r => r.confidence > 0.7)
        .map(r => `• ${r.response}`)
        .join('\n');
      
      if (evidence) {
        finalResponse += `\n\n**Supporting Analysis:**\n${evidence}`;
        breakdown.supportingEvidence.push(...secondaryResponses.map(r => `${r.provider}: ${r.response}`));
      }
    }

    breakdown.reasoning.push(`Primary response from ${primaryResponse?.provider || 'primary model'}`);

    return {
      finalResponse,
      mergingApproach: 'Primary model leads with specialized and secondary support'
    };
  }

  /**
   * Weighted merging based on model weights and confidence
   */
  private static weightedMerging(
    sortedResponses: ModelResponse[],
    selectedModels: SelectedModelConfig[],
    breakdown: { reasoning: string[]; specializedInsights: string[]; supportingEvidence: string[] }
  ) {
    // Group responses by category
    const responsesByCategory: Record<string, ModelResponse[]> = {};
    sortedResponses.forEach(response => {
      if (!responsesByCategory[response.category]) {
        responsesByCategory[response.category] = [];
      }
      responsesByCategory[response.category].push(response);
    });

    let finalResponse = '';

    // Start with LLM responses (main reasoning)
    if (responsesByCategory.llm) {
      const llmResponse = this.selectBestResponse(responsesByCategory.llm, selectedModels);
      finalResponse = llmResponse.response;
      breakdown.reasoning.push(`Primary reasoning from ${llmResponse.provider}-${llmResponse.modelId}`);
    }

    // Add vision analysis if present
    if (responsesByCategory.vision) {
      const visionResponse = this.selectBestResponse(responsesByCategory.vision, selectedModels);
      finalResponse += `\n\n**Visual Analysis:**\n${visionResponse.response}`;
      breakdown.specializedInsights.push(`Visual: ${visionResponse.provider}-${visionResponse.modelId}`);
    }

    // Add small model insights (fast analysis)
    if (responsesByCategory.small) {
      const smallResponse = this.selectBestResponse(responsesByCategory.small, selectedModels);
      finalResponse += `\n\n**Quick Analysis:**\n${smallResponse.response}`;
      breakdown.supportingEvidence.push(`Quick: ${smallResponse.provider}-${smallResponse.modelId}`);
    }

    // Add MCP tool results
    if (responsesByCategory.mcp) {
      const mcpResponses = responsesByCategory.mcp;
      const mcpResults = mcpResponses.map(r => `• ${r.response}`).join('\n');
      finalResponse += `\n\n**External Tools & Integrations:**\n${mcpResults}`;
      breakdown.specializedInsights.push(...mcpResponses.map(r => `MCP: ${r.provider}-${r.modelId}`));
    }

    return {
      finalResponse,
      mergingApproach: 'Weighted merging by category with confidence-based selection'
    };
  }

  /**
   * Consensus merging - Find common themes and agreements
   */
  private static consensusMerging(
    sortedResponses: ModelResponse[],
    breakdown: { reasoning: string[]; specializedInsights: string[]; supportingEvidence: string[] }
  ) {
    // Simple consensus: majority wins for key points
    const responses = sortedResponses.map(r => r.response);
    
    // For now, use the highest confidence response as base
    const baseResponse = sortedResponses[0];
    let finalResponse = baseResponse.response;

    // Add agreements from other models
    const agreementPoints: string[] = [];
    sortedResponses.slice(1).forEach(response => {
      if (response.confidence > 0.8) {
        agreementPoints.push(`${response.provider}: ${response.response}`);
      }
    });

    if (agreementPoints.length > 0) {
      finalResponse += `\n\n**Supporting Consensus:**\n${agreementPoints.map(p => `• ${p}`).join('\n')}`;
    }

    breakdown.reasoning.push(`Consensus based on ${sortedResponses.length} models`);
    breakdown.supportingEvidence.push(...agreementPoints);

    return {
      finalResponse,
      mergingApproach: 'Consensus-based merging with agreement detection'
    };
  }

  /**
   * Specialized merging - Each model contributes its strength
   */
  private static specializedMerging(
    sortedResponses: ModelResponse[],
    breakdown: { reasoning: string[]; specializedInsights: string[]; supportingEvidence: string[] }
  ) {
    let finalResponse = '';
    
    // Group by category and let each contribute its specialty
    const categories = ['llm', 'vision', 'small', 'mcp'] as const;
    
    categories.forEach(category => {
      const categoryResponses = sortedResponses.filter(r => r.category === category);
      if (categoryResponses.length === 0) return;

      const bestResponse = categoryResponses.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      const sectionTitle = {
        llm: 'Comprehensive Analysis',
        vision: 'Visual Processing',
        small: 'Efficient Analysis',
        mcp: 'Tool Integration'
      }[category];

      if (finalResponse) finalResponse += '\n\n';
      finalResponse += `**${sectionTitle}:**\n${bestResponse.response}`;
      
      breakdown.specializedInsights.push(`${category}: ${bestResponse.provider}-${bestResponse.modelId}`);
    });

    return {
      finalResponse,
      mergingApproach: 'Specialized contribution from each model category'
    };
  }

  /**
   * Select the best response from a category based on weight and confidence
   */
  private static selectBestResponse(
    responses: ModelResponse[], 
    selectedModels: SelectedModelConfig[]
  ): ModelResponse {
    return responses.reduce((best, current) => {
      const currentModel = selectedModels.find(m => m.model === current.modelId);
      const bestModel = selectedModels.find(m => m.model === best.modelId);
      
      const currentScore = (currentModel?.weight || 0) * current.confidence;
      const bestScore = (bestModel?.weight || 0) * best.confidence;
      
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate overall confidence score
   */
  private static calculateOverallConfidence(
    responses: ModelResponse[], 
    selectedModels: SelectedModelConfig[]
  ): number {
    let totalWeightedConfidence = 0;
    let totalWeight = 0;

    responses.forEach(response => {
      const model = selectedModels.find(m => m.model === response.modelId);
      if (model) {
        totalWeightedConfidence += response.confidence * model.weight;
        totalWeight += model.weight;
      }
    });

    return totalWeight > 0 ? totalWeightedConfidence / totalWeight : 0;
  }

  /**
   * Determine the best merging strategy based on selected models
   */
  static suggestMergingStrategy(selectedModels: SelectedModelConfig[]): 'weighted' | 'consensus' | 'hierarchical' | 'specialized' {
    const categories = new Set(selectedModels.map(m => m.category));
    const hasPrimary = selectedModels.some(m => m.role === 'primary');
    const hasSpecialized = selectedModels.some(m => m.role === 'specialized');

    if (categories.size >= 3) {
      return 'specialized'; // Multiple categories benefit from specialized merging
    }
    
    if (hasPrimary && selectedModels.length > 2) {
      return 'hierarchical'; // Clear hierarchy with supporting models
    }
    
    if (selectedModels.length >= 3) {
      return 'consensus'; // Multiple models can form consensus
    }
    
    return 'weighted'; // Default weighted approach
  }
}