/**
 * SWARM DECISION ENGINE
 * Implements swarm intelligence for collective decision-making
 * Supports weighted voting, consensus building, and emergent behavior
 */

export interface SwarmParticipant {
  id: string;
  name: string;
  weight: number;
  specialization?: string;
  performanceScore?: number;
}

export interface SwarmVote {
  participantId: string;
  choice: string;
  confidence: number;
  reasoning?: string;
  timestamp: Date;
}

export interface SwarmDecisionConfig {
  decisionMethod: 'weighted_voting' | 'consensus' | 'majority' | 'unanimous';
  confidenceThreshold: number;
  minParticipants: number;
  timeoutMs: number;
  allowAbstention: boolean;
  requireReasoning: boolean;
}

export interface SwarmDecisionResult {
  decision: string;
  confidence: number;
  participantCount: number;
  votes: Record<string, number>;
  consensusReached: boolean;
  reasoning: string[];
  dissent?: string[];
  metadata: {
    method: string;
    duration: number;
    iterations: number;
  };
}

export class SwarmDecisionEngine {
  private config: SwarmDecisionConfig;
  private participants: Map<string, SwarmParticipant> = new Map();
  private votes: SwarmVote[] = [];
  private iterationCount = 0;

  constructor(config: Partial<SwarmDecisionConfig> = {}) {
    this.config = {
      decisionMethod: config.decisionMethod || 'weighted_voting',
      confidenceThreshold: config.confidenceThreshold || 0.7,
      minParticipants: config.minParticipants || 3,
      timeoutMs: config.timeoutMs || 30000,
      allowAbstention: config.allowAbstention ?? true,
      requireReasoning: config.requireReasoning ?? false,
    };
  }

  /**
   * Register a participant in the swarm
   */
  registerParticipant(participant: SwarmParticipant): void {
    this.participants.set(participant.id, participant);
  }

  /**
   * Remove a participant from the swarm
   */
  removeParticipant(participantId: string): void {
    this.participants.delete(participantId);
  }

  /**
   * Submit a vote from a participant
   */
  submitVote(vote: SwarmVote): boolean {
    if (!this.participants.has(vote.participantId)) {
      console.warn(`Unknown participant: ${vote.participantId}`);
      return false;
    }

    // Replace existing vote from same participant
    this.votes = this.votes.filter(v => v.participantId !== vote.participantId);
    this.votes.push(vote);
    return true;
  }

  /**
   * Execute swarm decision-making process
   */
  async makeDecision(
    question: string,
    options: string[],
    agentResponses?: Array<{ agentId: string; choice: string; confidence: number; reasoning?: string }>
  ): Promise<SwarmDecisionResult> {
    const startTime = Date.now();
    this.iterationCount++;

    // If agent responses provided, convert to votes
    if (agentResponses) {
      for (const response of agentResponses) {
        const participant = this.participants.get(response.agentId);
        if (participant) {
          this.submitVote({
            participantId: response.agentId,
            choice: response.choice,
            confidence: response.confidence,
            reasoning: response.reasoning,
            timestamp: new Date(),
          });
        }
      }
    }

    // Check minimum participants
    if (this.votes.length < this.config.minParticipants) {
      return {
        decision: '',
        confidence: 0,
        participantCount: this.votes.length,
        votes: {},
        consensusReached: false,
        reasoning: [`Insufficient participants: ${this.votes.length}/${this.config.minParticipants}`],
        metadata: {
          method: this.config.decisionMethod,
          duration: Date.now() - startTime,
          iterations: this.iterationCount,
        },
      };
    }

    // Execute decision method
    let result: SwarmDecisionResult;
    switch (this.config.decisionMethod) {
      case 'weighted_voting':
        result = this.weightedVoting(options);
        break;
      case 'consensus':
        result = this.consensusBuilding(options);
        break;
      case 'majority':
        result = this.majorityVoting(options);
        break;
      case 'unanimous':
        result = this.unanimousDecision(options);
        break;
      default:
        result = this.weightedVoting(options);
    }

    result.metadata = {
      method: this.config.decisionMethod,
      duration: Date.now() - startTime,
      iterations: this.iterationCount,
    };

    return result;
  }

  /**
   * Weighted voting: Each participant's vote is weighted by their weight factor
   */
  private weightedVoting(options: string[]): SwarmDecisionResult {
    const weightedVotes: Record<string, number> = {};
    const reasoning: string[] = [];
    let totalWeight = 0;

    for (const option of options) {
      weightedVotes[option] = 0;
    }

    for (const vote of this.votes) {
      const participant = this.participants.get(vote.participantId);
      if (!participant) continue;

      const weight = participant.weight * vote.confidence;
      weightedVotes[vote.choice] = (weightedVotes[vote.choice] || 0) + weight;
      totalWeight += weight;

      if (vote.reasoning) {
        reasoning.push(`${participant.name}: ${vote.reasoning}`);
      }
    }

    // Normalize votes
    const normalizedVotes: Record<string, number> = {};
    for (const [option, weight] of Object.entries(weightedVotes)) {
      normalizedVotes[option] = totalWeight > 0 ? weight / totalWeight : 0;
    }

    // Find winner
    const sortedOptions = Object.entries(normalizedVotes).sort(([, a], [, b]) => b - a);
    const [winningOption, winningScore] = sortedOptions[0];

    return {
      decision: winningOption,
      confidence: winningScore,
      participantCount: this.votes.length,
      votes: normalizedVotes,
      consensusReached: winningScore >= this.config.confidenceThreshold,
      reasoning,
      dissent: sortedOptions.slice(1).map(([opt, score]) => `${opt}: ${(score * 100).toFixed(1)}%`),
      metadata: { method: 'weighted_voting', duration: 0, iterations: 0 },
    };
  }

  /**
   * Consensus building: Iterate until threshold reached or timeout
   */
  private consensusBuilding(options: string[]): SwarmDecisionResult {
    // Start with weighted voting result
    const result = this.weightedVoting(options);

    // If already at threshold, return
    if (result.confidence >= this.config.confidenceThreshold) {
      result.consensusReached = true;
      return result;
    }

    // Identify areas of agreement and disagreement
    const sortedVotes = Object.entries(result.votes).sort(([, a], [, b]) => b - a);
    const topChoice = sortedVotes[0][0];
    const secondChoice = sortedVotes[1]?.[0];

    result.reasoning.push(
      `Consensus not reached. Top choice: ${topChoice} (${(result.confidence * 100).toFixed(1)}%).` +
      (secondChoice ? ` Alternative: ${secondChoice}` : '')
    );

    return result;
  }

  /**
   * Simple majority voting
   */
  private majorityVoting(options: string[]): SwarmDecisionResult {
    const voteCounts: Record<string, number> = {};
    const reasoning: string[] = [];

    for (const option of options) {
      voteCounts[option] = 0;
    }

    for (const vote of this.votes) {
      voteCounts[vote.choice] = (voteCounts[vote.choice] || 0) + 1;
      if (vote.reasoning) {
        const participant = this.participants.get(vote.participantId);
        reasoning.push(`${participant?.name || 'Unknown'}: ${vote.reasoning}`);
      }
    }

    const total = this.votes.length;
    const normalizedVotes: Record<string, number> = {};
    for (const [option, count] of Object.entries(voteCounts)) {
      normalizedVotes[option] = total > 0 ? count / total : 0;
    }

    const sortedOptions = Object.entries(normalizedVotes).sort(([, a], [, b]) => b - a);
    const [winningOption, winningScore] = sortedOptions[0];

    return {
      decision: winningOption,
      confidence: winningScore,
      participantCount: this.votes.length,
      votes: normalizedVotes,
      consensusReached: winningScore > 0.5,
      reasoning,
      metadata: { method: 'majority', duration: 0, iterations: 0 },
    };
  }

  /**
   * Unanimous decision: All must agree
   */
  private unanimousDecision(options: string[]): SwarmDecisionResult {
    const result = this.majorityVoting(options);
    result.consensusReached = result.confidence === 1.0;
    return result;
  }

  /**
   * Update participant weights based on performance
   */
  updateParticipantWeight(participantId: string, performanceScore: number): void {
    const participant = this.participants.get(participantId);
    if (participant) {
      // Adjust weight based on performance (learning rate of 0.1)
      const learningRate = 0.1;
      participant.weight = participant.weight * (1 - learningRate) + performanceScore * learningRate;
      participant.performanceScore = performanceScore;
    }
  }

  /**
   * Reset votes for new decision
   */
  reset(): void {
    this.votes = [];
    this.iterationCount = 0;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      participants: Array.from(this.participants.values()),
      votes: this.votes,
      config: this.config,
      iterationCount: this.iterationCount,
    };
  }
}

// Export singleton factory
export const createSwarmEngine = (config?: Partial<SwarmDecisionConfig>) => new SwarmDecisionEngine(config);
