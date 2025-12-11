/**
 * AGENT ARCHITECTURE INTELLIGENCE SERVICE
 * Analyzes user intent, use case, and context to recommend optimal agent architecture
 * Provides transparency on how user input influences recommendations
 */

export type AgentArchitectureType = 'single' | 'multi-agent' | 'a2a' | 'agentic' | 'swarm' | 'conversational' | 'mcp-sdk';

export interface ArchitectureRecommendation {
  architecture: AgentArchitectureType;
  confidence: number;
  label: string;
  description: string;
  color: string;
  reasoning: string[];
  matchedKeywords: string[];
  suggestedNodes: string[];
  useCaseAlignment: number;
  complexityScore: number;
}

export interface ArchitectureAnalysis {
  primaryRecommendation: ArchitectureRecommendation;
  alternativeRecommendations: ArchitectureRecommendation[];
  inputFactors: InputFactor[];
  useCaseCategory: string;
  complexityLevel: 'simple' | 'moderate' | 'complex' | 'enterprise';
  requiresMultiChannel: boolean;
  requiresRealTimeSync: boolean;
  requiresAutonomy: boolean;
}

export interface InputFactor {
  factor: string;
  weight: number;
  detected: boolean;
  influence: 'strong' | 'moderate' | 'weak';
  architecturesInfluenced: AgentArchitectureType[];
}

// Architecture definitions with characteristics
const ARCHITECTURE_DEFINITIONS: Record<AgentArchitectureType, {
  label: string;
  description: string;
  color: string;
  keywords: string[];
  useCases: string[];
  complexity: number;
  suggestedNodes: string[];
}> = {
  'single': {
    label: 'Single Agent',
    description: 'Traditional single agent for straightforward tasks with clear input/output',
    color: 'hsl(var(--muted-foreground))',
    keywords: ['simple', 'basic', 'straightforward', 'single task', 'one agent', 'direct'],
    useCases: ['simple chatbot', 'FAQ bot', 'basic customer service', 'information retrieval'],
    complexity: 1,
    suggestedNodes: ['ai_agent', 'input_handler', 'output_formatter']
  },
  'conversational': {
    label: 'Conversational Agent',
    description: 'Context-aware conversational agent with memory and dialogue management',
    color: '#3B82F6',
    keywords: ['conversation', 'chat', 'dialogue', 'context', 'memory', 'follow-up', 'natural language'],
    useCases: ['patient intake', 'support chat', 'appointment scheduling', 'consultation'],
    complexity: 2,
    suggestedNodes: ['conversation_engine', 'context_manager', 'dialogue_flow', 'memory_store']
  },
  'mcp-sdk': {
    label: 'MCP SDK Integration',
    description: 'Agents with Model Context Protocol for tool calling, data sync, and external integrations',
    color: '#8B5CF6',
    keywords: ['integration', 'API', 'tool', 'sync', 'CRM', 'database', 'external', 'webhook', 'Salesforce', 'HubSpot'],
    useCases: ['data sync', 'CRM integration', 'external API calls', 'form processing', 'enrollment'],
    complexity: 3,
    suggestedNodes: ['mcp_tool', 'data_sync', 'api_connector', 'webhook_handler']
  },
  'multi-agent': {
    label: 'Multi-Agent System',
    description: 'Coordinated team of specialized agents working together on complex tasks',
    color: '#10B981',
    keywords: ['team', 'multiple', 'coordinate', 'specialized', 'parallel', 'distributed', 'collaborate'],
    useCases: ['complex workflows', 'multi-step processes', 'parallel processing', 'specialized tasks'],
    complexity: 4,
    suggestedNodes: ['agent_team', 'task_router', 'coordinator', 'shared_context']
  },
  'a2a': {
    label: 'A2A Protocol',
    description: 'Google A2A Protocol compliant agents with standardized communication and task handoff',
    color: '#6366F1',
    keywords: ['A2A', 'protocol', 'handoff', 'transfer', 'interoperability', 'standard', 'agent-to-agent'],
    useCases: ['cross-system integration', 'agent interoperability', 'task delegation', 'federated agents'],
    complexity: 5,
    suggestedNodes: ['a2a_agent', 'task_handoff', 'communication_hub', 'agent_card']
  },
  'agentic': {
    label: 'Agentic AI',
    description: 'Autonomous agents with reasoning, planning, and self-reflection capabilities',
    color: '#EF4444',
    keywords: ['autonomous', 'reasoning', 'planning', 'goal', 'self', 'reflect', 'learn', 'adapt', 'ReAct'],
    useCases: ['autonomous research', 'complex problem solving', 'adaptive workflows', 'goal-driven tasks'],
    complexity: 5,
    suggestedNodes: ['react_loop', 'goal_decomposition', 'self_reflection', 'tool_chain']
  },
  'swarm': {
    label: 'Swarm Intelligence',
    description: 'Collective decision-making using swarm intelligence and emergent behavior',
    color: '#F59E0B',
    keywords: ['swarm', 'collective', 'voting', 'consensus', 'distributed', 'emergent', 'crowd'],
    useCases: ['collective decisions', 'distributed consensus', 'multi-perspective analysis', 'crowd intelligence'],
    complexity: 5,
    suggestedNodes: ['swarm_decision', 'voting_node', 'consensus_builder', 'aggregator']
  }
};

// Use case to architecture mapping
const USE_CASE_MAPPINGS: Record<string, { primary: AgentArchitectureType; alternatives: AgentArchitectureType[] }> = {
  'patient onboarding': { primary: 'conversational', alternatives: ['mcp-sdk', 'multi-agent'] },
  'patient enrollment': { primary: 'mcp-sdk', alternatives: ['conversational', 'multi-agent'] },
  'order status': { primary: 'single', alternatives: ['conversational', 'mcp-sdk'] },
  'order management': { primary: 'multi-agent', alternatives: ['mcp-sdk', 'a2a'] },
  'treatment center onboarding': { primary: 'multi-agent', alternatives: ['mcp-sdk', 'agentic'] },
  'manufacturing onboarding': { primary: 'multi-agent', alternatives: ['mcp-sdk', 'a2a'] },
  'npi verification': { primary: 'mcp-sdk', alternatives: ['single', 'conversational'] },
  'credentialing': { primary: 'multi-agent', alternatives: ['mcp-sdk', 'agentic'] },
  'research assistant': { primary: 'agentic', alternatives: ['multi-agent', 'swarm'] },
  'complex analysis': { primary: 'agentic', alternatives: ['swarm', 'multi-agent'] },
  'customer support': { primary: 'conversational', alternatives: ['single', 'multi-agent'] },
  'data integration': { primary: 'mcp-sdk', alternatives: ['a2a', 'multi-agent'] },
  'workflow automation': { primary: 'multi-agent', alternatives: ['agentic', 'mcp-sdk'] },
  'cross-system': { primary: 'a2a', alternatives: ['multi-agent', 'mcp-sdk'] },
  'autonomous task': { primary: 'agentic', alternatives: ['multi-agent', 'swarm'] },
  'group decision': { primary: 'swarm', alternatives: ['multi-agent', 'agentic'] }
};

class AgentArchitectureIntelligence {
  /**
   * Analyze user input and context to recommend optimal agent architecture
   */
  analyzeAndRecommend(
    userInput: string,
    useCase?: string,
    existingNodes?: any[],
    agentDescription?: string
  ): ArchitectureAnalysis {
    const combinedInput = `${userInput} ${useCase || ''} ${agentDescription || ''}`.toLowerCase();
    
    // Analyze input factors
    const inputFactors = this.analyzeInputFactors(combinedInput);
    
    // Score each architecture
    const architectureScores = this.scoreArchitectures(combinedInput, inputFactors, existingNodes);
    
    // Sort by score
    const sortedArchitectures = Object.entries(architectureScores)
      .sort(([, a], [, b]) => b.confidence - a.confidence);
    
    // Determine complexity level
    const complexityLevel = this.determineComplexityLevel(inputFactors, combinedInput);
    
    // Check for specific requirements
    const requiresMultiChannel = this.checkMultiChannelRequirement(combinedInput);
    const requiresRealTimeSync = this.checkRealTimeSyncRequirement(combinedInput);
    const requiresAutonomy = this.checkAutonomyRequirement(combinedInput);
    
    // Adjust scores based on requirements
    if (requiresAutonomy) {
      architectureScores['agentic'].confidence *= 1.3;
    }
    if (requiresMultiChannel) {
      architectureScores['multi-agent'].confidence *= 1.2;
      architectureScores['a2a'].confidence *= 1.2;
    }
    
    // Re-sort after adjustments
    const finalSorted = Object.entries(architectureScores)
      .sort(([, a], [, b]) => b.confidence - a.confidence);
    
    const [primaryKey, primaryRec] = finalSorted[0];
    const alternatives = finalSorted.slice(1, 4).map(([, rec]) => rec);
    
    return {
      primaryRecommendation: primaryRec,
      alternativeRecommendations: alternatives,
      inputFactors,
      useCaseCategory: this.categorizeUseCase(combinedInput),
      complexityLevel,
      requiresMultiChannel,
      requiresRealTimeSync,
      requiresAutonomy
    };
  }

  /**
   * Analyze what factors in the input influence the recommendation
   */
  private analyzeInputFactors(input: string): InputFactor[] {
    const factors: InputFactor[] = [];
    
    // Check for autonomy indicators
    const autonomyKeywords = ['autonomous', 'automatic', 'self', 'independent', 'without human', 'goal-driven'];
    const hasAutonomy = autonomyKeywords.some(k => input.includes(k));
    factors.push({
      factor: 'Autonomous Operation',
      weight: 0.25,
      detected: hasAutonomy,
      influence: hasAutonomy ? 'strong' : 'weak',
      architecturesInfluenced: ['agentic', 'swarm']
    });
    
    // Check for collaboration indicators
    const collaborationKeywords = ['team', 'multiple agents', 'coordinate', 'collaborate', 'together', 'parallel'];
    const hasCollaboration = collaborationKeywords.some(k => input.includes(k));
    factors.push({
      factor: 'Multi-Agent Collaboration',
      weight: 0.25,
      detected: hasCollaboration,
      influence: hasCollaboration ? 'strong' : 'weak',
      architecturesInfluenced: ['multi-agent', 'a2a', 'swarm']
    });
    
    // Check for integration indicators
    const integrationKeywords = ['crm', 'salesforce', 'hubspot', 'api', 'webhook', 'sync', 'integrate', 'external'];
    const hasIntegration = integrationKeywords.some(k => input.includes(k));
    factors.push({
      factor: 'External Integration',
      weight: 0.2,
      detected: hasIntegration,
      influence: hasIntegration ? 'strong' : 'moderate',
      architecturesInfluenced: ['mcp-sdk', 'a2a']
    });
    
    // Check for conversation indicators
    const conversationKeywords = ['conversation', 'chat', 'dialogue', 'talk', 'discuss', 'memory', 'context'];
    const hasConversation = conversationKeywords.some(k => input.includes(k));
    factors.push({
      factor: 'Conversational Flow',
      weight: 0.15,
      detected: hasConversation,
      influence: hasConversation ? 'moderate' : 'weak',
      architecturesInfluenced: ['conversational', 'single']
    });
    
    // Check for complexity indicators
    const complexityKeywords = ['complex', 'enterprise', 'multiple steps', 'workflow', 'process', 'sophisticated'];
    const hasComplexity = complexityKeywords.some(k => input.includes(k));
    factors.push({
      factor: 'Workflow Complexity',
      weight: 0.15,
      detected: hasComplexity,
      influence: hasComplexity ? 'strong' : 'weak',
      architecturesInfluenced: ['multi-agent', 'agentic', 'a2a']
    });
    
    // Check for A2A specific indicators
    const a2aKeywords = ['a2a', 'protocol', 'handoff', 'transfer', 'interoperability', 'standardized'];
    const hasA2A = a2aKeywords.some(k => input.includes(k));
    factors.push({
      factor: 'A2A Protocol Requirements',
      weight: 0.2,
      detected: hasA2A,
      influence: hasA2A ? 'strong' : 'weak',
      architecturesInfluenced: ['a2a']
    });
    
    // Check for reasoning/planning indicators
    const reasoningKeywords = ['reason', 'plan', 'think', 'analyze', 'decide', 'strategy', 'reflect', 'learn'];
    const hasReasoning = reasoningKeywords.some(k => input.includes(k));
    factors.push({
      factor: 'Reasoning & Planning',
      weight: 0.2,
      detected: hasReasoning,
      influence: hasReasoning ? 'strong' : 'weak',
      architecturesInfluenced: ['agentic', 'swarm']
    });
    
    return factors;
  }

  /**
   * Score each architecture based on input and factors
   */
  private scoreArchitectures(
    input: string,
    factors: InputFactor[],
    existingNodes?: any[]
  ): Record<AgentArchitectureType, ArchitectureRecommendation> {
    const scores: Record<AgentArchitectureType, ArchitectureRecommendation> = {} as any;
    
    for (const [archType, def] of Object.entries(ARCHITECTURE_DEFINITIONS)) {
      const architecture = archType as AgentArchitectureType;
      
      // Base score from keyword matching
      const matchedKeywords = def.keywords.filter(k => input.includes(k));
      let keywordScore = matchedKeywords.length / def.keywords.length;
      
      // Score from use case matching
      const useCaseScore = def.useCases.filter(uc => 
        input.includes(uc.toLowerCase())
      ).length / def.useCases.length;
      
      // Score from factor influence
      let factorScore = 0;
      factors.forEach(factor => {
        if (factor.detected && factor.architecturesInfluenced.includes(architecture)) {
          factorScore += factor.weight;
        }
      });
      
      // Combine scores
      let confidence = (keywordScore * 0.3) + (useCaseScore * 0.3) + (factorScore * 0.4);
      
      // Add baseline for common architectures
      if (architecture === 'single') confidence += 0.1;
      if (architecture === 'conversational') confidence += 0.15;
      if (architecture === 'mcp-sdk') confidence += 0.1;
      
      // Check existing nodes for architecture hints
      if (existingNodes && existingNodes.length > 0) {
        const existingArchitecture = this.detectArchitectureFromNodes(existingNodes);
        if (existingArchitecture === architecture) {
          confidence += 0.2;
        }
      }
      
      // Generate reasoning
      const reasoning: string[] = [];
      if (matchedKeywords.length > 0) {
        reasoning.push(`Detected keywords: ${matchedKeywords.join(', ')}`);
      }
      factors.filter(f => f.detected && f.architecturesInfluenced.includes(architecture))
        .forEach(f => reasoning.push(`${f.factor} detected (${f.influence} influence)`));
      
      if (reasoning.length === 0) {
        reasoning.push('Default option for general use cases');
      }
      
      scores[architecture] = {
        architecture,
        confidence: Math.min(confidence, 1),
        label: def.label,
        description: def.description,
        color: def.color,
        reasoning,
        matchedKeywords,
        suggestedNodes: def.suggestedNodes,
        useCaseAlignment: useCaseScore,
        complexityScore: def.complexity / 5
      };
    }
    
    return scores;
  }

  /**
   * Detect architecture from existing workflow nodes
   */
  private detectArchitectureFromNodes(nodes: any[]): AgentArchitectureType {
    const nodeTypes = nodes.map(n => n.data?.type_key || n.type).filter(Boolean);
    
    // Check for specific node types
    if (nodeTypes.some(t => ['swarm_decision', 'voting_node'].includes(t))) return 'swarm';
    if (nodeTypes.some(t => ['a2a_agent', 'task_handoff', 'communication_hub'].includes(t))) return 'a2a';
    if (nodeTypes.some(t => ['react_loop', 'goal_decomposition', 'self_reflection'].includes(t))) return 'agentic';
    if (nodeTypes.some(t => ['agent_team', 'task_router', 'coordinator'].includes(t))) return 'multi-agent';
    if (nodeTypes.some(t => ['mcp_tool', 'data_sync', 'api_connector'].includes(t))) return 'mcp-sdk';
    if (nodeTypes.some(t => ['conversation_engine', 'context_manager', 'dialogue_flow'].includes(t))) return 'conversational';
    
    return 'single';
  }

  /**
   * Determine overall complexity level
   */
  private determineComplexityLevel(factors: InputFactor[], input: string): 'simple' | 'moderate' | 'complex' | 'enterprise' {
    const activeFactors = factors.filter(f => f.detected);
    const strongFactors = activeFactors.filter(f => f.influence === 'strong');
    
    if (input.includes('enterprise') || strongFactors.length >= 4) return 'enterprise';
    if (strongFactors.length >= 2 || activeFactors.length >= 4) return 'complex';
    if (activeFactors.length >= 2) return 'moderate';
    return 'simple';
  }

  /**
   * Check if multi-channel deployment is needed
   */
  private checkMultiChannelRequirement(input: string): boolean {
    const multiChannelKeywords = ['multiple channels', 'multi-channel', 'web and voice', 'sms', 'whatsapp', 'email', 'slack'];
    return multiChannelKeywords.some(k => input.includes(k));
  }

  /**
   * Check if real-time sync is needed
   */
  private checkRealTimeSyncRequirement(input: string): boolean {
    const realTimeKeywords = ['real-time', 'realtime', 'instant', 'live', 'immediate sync', 'live data'];
    return realTimeKeywords.some(k => input.includes(k));
  }

  /**
   * Check if autonomous operation is needed
   */
  private checkAutonomyRequirement(input: string): boolean {
    const autonomyKeywords = ['autonomous', 'self-driving', 'automatic', 'without supervision', 'independent'];
    return autonomyKeywords.some(k => input.includes(k));
  }

  /**
   * Categorize the use case
   */
  private categorizeUseCase(input: string): string {
    for (const [useCase, mapping] of Object.entries(USE_CASE_MAPPINGS)) {
      if (input.includes(useCase)) {
        return useCase;
      }
    }
    return 'general';
  }

  /**
   * Get architecture explanation for users
   */
  getArchitectureExplanation(architecture: AgentArchitectureType): {
    whatItIs: string;
    whenToUse: string[];
    capabilities: string[];
    limitations: string[];
  } {
    const explanations: Record<AgentArchitectureType, any> = {
      'single': {
        whatItIs: 'A single AI agent handling tasks directly without coordination with other agents.',
        whenToUse: ['Simple FAQ or information retrieval', 'Direct question-answering', 'Basic task completion'],
        capabilities: ['Fast response', 'Low complexity', 'Easy to deploy'],
        limitations: ['Cannot handle complex multi-step workflows', 'No parallel processing', 'Limited context']
      },
      'conversational': {
        whatItIs: 'An agent with memory and context tracking for natural multi-turn conversations.',
        whenToUse: ['Patient intake interviews', 'Support conversations', 'Guided form filling'],
        capabilities: ['Context retention', 'Follow-up handling', 'Dialogue management'],
        limitations: ['Single conversation focus', 'Limited tool integration', 'Sequential processing']
      },
      'mcp-sdk': {
        whatItIs: 'Agent integrated with Model Context Protocol for tool calling and external system integration.',
        whenToUse: ['CRM data sync', 'Form submission to databases', 'API integrations', 'Webhook handling'],
        capabilities: ['External tool calling', 'Data sync', 'CRM integration', 'Webhook support'],
        limitations: ['Requires external system setup', 'More complex configuration']
      },
      'multi-agent': {
        whatItIs: 'A coordinated team of specialized agents working together on complex tasks.',
        whenToUse: ['Complex workflows requiring multiple specializations', 'Parallel task processing', 'Enterprise processes'],
        capabilities: ['Specialization', 'Parallel processing', 'Complex workflow handling', 'Scalability'],
        limitations: ['Higher complexity', 'Coordination overhead', 'More resources needed']
      },
      'a2a': {
        whatItIs: 'Google A2A Protocol compliant agents with standardized communication and task handoff.',
        whenToUse: ['Cross-system agent interoperability', 'Standardized task delegation', 'Federated agent systems'],
        capabilities: ['Interoperability', 'Standardized protocols', 'Task handoff', 'Agent discovery'],
        limitations: ['Protocol compliance overhead', 'Requires A2A-compatible agents']
      },
      'agentic': {
        whatItIs: 'Autonomous agents with reasoning, planning, and self-reflection for complex goal achievement.',
        whenToUse: ['Autonomous research tasks', 'Complex problem solving', 'Goal-driven workflows', 'Adaptive tasks'],
        capabilities: ['Autonomous reasoning', 'Planning', 'Self-reflection', 'Tool chaining', 'Goal decomposition'],
        limitations: ['Unpredictable execution time', 'Higher compute costs', 'Requires careful goal definition']
      },
      'swarm': {
        whatItIs: 'Collective decision-making system using multiple agents for consensus and distributed intelligence.',
        whenToUse: ['Group decisions', 'Multi-perspective analysis', 'Distributed consensus', 'Risk assessment'],
        capabilities: ['Collective intelligence', 'Voting mechanisms', 'Consensus building', 'Diverse perspectives'],
        limitations: ['Requires multiple agents', 'Longer decision time', 'Complex consensus management']
      }
    };
    
    return explanations[architecture];
  }

  /**
   * Get recommended nodes for an architecture
   */
  getRecommendedNodes(architecture: AgentArchitectureType): string[] {
    return ARCHITECTURE_DEFINITIONS[architecture]?.suggestedNodes || [];
  }
}

export const agentArchitectureIntelligence = new AgentArchitectureIntelligence();
export default agentArchitectureIntelligence;
