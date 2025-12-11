/**
 * REACT LOOP ENGINE
 * Implements the ReAct (Reasoning + Acting) pattern for autonomous agents
 * Cycles through Think → Act → Observe → Reflect until goal achieved
 */

export interface ReActConfig {
  maxIterations: number;
  reflectionEnabled: boolean;
  planningDepth: number;
  timeoutMs: number;
  learningEnabled: boolean;
  tools: ReActTool[];
}

export interface ReActTool {
  id: string;
  name: string;
  description: string;
  execute: (input: any) => Promise<any>;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export interface ReActStep {
  iteration: number;
  phase: 'think' | 'act' | 'observe' | 'reflect';
  content: string;
  toolUsed?: string;
  toolInput?: any;
  toolOutput?: any;
  reasoning?: string;
  timestamp: Date;
  durationMs: number;
}

export interface ReActResult {
  success: boolean;
  goal: string;
  finalAnswer: any;
  steps: ReActStep[];
  totalIterations: number;
  totalDurationMs: number;
  reflections: string[];
  learnings?: string[];
}

export interface ThoughtProcess {
  observation: string;
  thought: string;
  action: string;
  actionInput: any;
}

export class ReActLoopEngine {
  private config: ReActConfig;
  private steps: ReActStep[] = [];
  private reflections: string[] = [];
  private currentIteration = 0;
  private startTime: number = 0;

  constructor(config: Partial<ReActConfig> = {}) {
    this.config = {
      maxIterations: config.maxIterations || 10,
      reflectionEnabled: config.reflectionEnabled ?? true,
      planningDepth: config.planningDepth || 3,
      timeoutMs: config.timeoutMs || 60000,
      learningEnabled: config.learningEnabled ?? true,
      tools: config.tools || [],
    };
  }

  /**
   * Register a tool for the agent to use
   */
  registerTool(tool: ReActTool): void {
    this.config.tools.push(tool);
  }

  /**
   * Execute the ReAct loop for a given goal
   */
  async execute(
    goal: string,
    context: Record<string, any> = {},
    thinkFn: (observation: string, goal: string, history: ReActStep[]) => Promise<ThoughtProcess>
  ): Promise<ReActResult> {
    this.startTime = Date.now();
    this.steps = [];
    this.reflections = [];
    this.currentIteration = 0;

    let currentObservation = `Goal: ${goal}\nContext: ${JSON.stringify(context)}`;
    let finalAnswer: any = null;
    let success = false;

    try {
      while (this.currentIteration < this.config.maxIterations) {
        // Check timeout
        if (Date.now() - this.startTime > this.config.timeoutMs) {
          this.reflections.push('Timeout reached before goal completion');
          break;
        }

        this.currentIteration++;

        // THINK Phase
        const thinkStart = Date.now();
        const thoughtProcess = await thinkFn(currentObservation, goal, this.steps);
        
        this.addStep({
          phase: 'think',
          content: thoughtProcess.thought,
          reasoning: thoughtProcess.thought,
          durationMs: Date.now() - thinkStart,
        });

        // Check if goal is achieved (action is "finish" or similar)
        if (this.isGoalAchieved(thoughtProcess)) {
          finalAnswer = thoughtProcess.actionInput;
          success = true;
          break;
        }

        // ACT Phase
        const actStart = Date.now();
        const tool = this.findTool(thoughtProcess.action);
        
        if (!tool) {
          this.addStep({
            phase: 'act',
            content: `Tool not found: ${thoughtProcess.action}`,
            toolUsed: thoughtProcess.action,
            durationMs: Date.now() - actStart,
          });
          currentObservation = `Error: Tool "${thoughtProcess.action}" not found. Available tools: ${this.config.tools.map(t => t.name).join(', ')}`;
          continue;
        }

        let toolOutput: any;
        try {
          toolOutput = await tool.execute(thoughtProcess.actionInput);
          this.addStep({
            phase: 'act',
            content: `Executed ${tool.name}`,
            toolUsed: tool.name,
            toolInput: thoughtProcess.actionInput,
            toolOutput,
            durationMs: Date.now() - actStart,
          });
        } catch (error: any) {
          toolOutput = { error: error.message };
          this.addStep({
            phase: 'act',
            content: `Error executing ${tool.name}: ${error.message}`,
            toolUsed: tool.name,
            toolInput: thoughtProcess.actionInput,
            toolOutput,
            durationMs: Date.now() - actStart,
          });
        }

        // OBSERVE Phase
        const observeStart = Date.now();
        currentObservation = this.formatObservation(tool.name, thoughtProcess.actionInput, toolOutput);
        this.addStep({
          phase: 'observe',
          content: currentObservation,
          durationMs: Date.now() - observeStart,
        });

        // REFLECT Phase (if enabled)
        if (this.config.reflectionEnabled && this.currentIteration % 3 === 0) {
          const reflectStart = Date.now();
          const reflection = this.reflect(goal, this.steps);
          this.reflections.push(reflection);
          this.addStep({
            phase: 'reflect',
            content: reflection,
            durationMs: Date.now() - reflectStart,
          });
        }
      }
    } catch (error: any) {
      this.reflections.push(`Fatal error: ${error.message}`);
    }

    return {
      success,
      goal,
      finalAnswer,
      steps: this.steps,
      totalIterations: this.currentIteration,
      totalDurationMs: Date.now() - this.startTime,
      reflections: this.reflections,
      learnings: this.config.learningEnabled ? this.extractLearnings() : undefined,
    };
  }

  /**
   * Add a step to the execution history
   */
  private addStep(step: Omit<ReActStep, 'iteration' | 'timestamp'>): void {
    this.steps.push({
      ...step,
      iteration: this.currentIteration,
      timestamp: new Date(),
    });
  }

  /**
   * Check if the goal has been achieved
   */
  private isGoalAchieved(thought: ThoughtProcess): boolean {
    const finishActions = ['finish', 'complete', 'done', 'final_answer', 'respond'];
    return finishActions.includes(thought.action.toLowerCase());
  }

  /**
   * Find a tool by name
   */
  private findTool(name: string): ReActTool | undefined {
    return this.config.tools.find(
      t => t.name.toLowerCase() === name.toLowerCase() || 
           t.id.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Format observation from tool output
   */
  private formatObservation(toolName: string, input: any, output: any): string {
    if (output?.error) {
      return `Tool ${toolName} failed: ${output.error}`;
    }
    return `Tool ${toolName} returned: ${JSON.stringify(output)}`;
  }

  /**
   * Reflect on progress towards goal
   */
  private reflect(goal: string, steps: ReActStep[]): string {
    const actSteps = steps.filter(s => s.phase === 'act');
    const successfulActions = actSteps.filter(s => !s.toolOutput?.error).length;
    const failedActions = actSteps.filter(s => s.toolOutput?.error).length;

    const reflections: string[] = [];
    
    if (failedActions > successfulActions) {
      reflections.push('More actions failed than succeeded. Consider adjusting approach.');
    }
    
    if (this.currentIteration > this.config.maxIterations / 2) {
      reflections.push('Halfway through iterations. Focus on most promising path.');
    }

    const toolUsage = actSteps.reduce((acc, s) => {
      acc[s.toolUsed || 'unknown'] = (acc[s.toolUsed || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTool = Object.entries(toolUsage).sort(([,a], [,b]) => b - a)[0];
    if (mostUsedTool && mostUsedTool[1] > 2) {
      reflections.push(`Heavy reliance on ${mostUsedTool[0]}. Consider diversifying approach.`);
    }

    return reflections.length > 0 
      ? reflections.join(' ') 
      : 'Progress is on track. Continue current approach.';
  }

  /**
   * Extract learnings from the execution
   */
  private extractLearnings(): string[] {
    const learnings: string[] = [];

    // Learn from successful patterns
    const successfulPatterns = this.steps
      .filter(s => s.phase === 'act' && !s.toolOutput?.error)
      .map(s => s.toolUsed);

    if (successfulPatterns.length > 0) {
      learnings.push(`Successful tools: ${[...new Set(successfulPatterns)].join(', ')}`);
    }

    // Learn from failures
    const failedPatterns = this.steps
      .filter(s => s.phase === 'act' && s.toolOutput?.error)
      .map(s => `${s.toolUsed}: ${s.toolOutput?.error}`);

    if (failedPatterns.length > 0) {
      learnings.push(`Avoid: ${failedPatterns.slice(0, 3).join('; ')}`);
    }

    // Learn from efficiency
    const avgStepDuration = this.steps.reduce((acc, s) => acc + s.durationMs, 0) / this.steps.length;
    learnings.push(`Average step duration: ${avgStepDuration.toFixed(0)}ms`);

    return learnings;
  }

  /**
   * Get available tools
   */
  getAvailableTools(): ReActTool[] {
    return this.config.tools;
  }

  /**
   * Reset the engine state
   */
  reset(): void {
    this.steps = [];
    this.reflections = [];
    this.currentIteration = 0;
  }
}

// Predefined tools for common operations
export const BUILTIN_TOOLS: ReActTool[] = [
  {
    id: 'search',
    name: 'search',
    description: 'Search for information in knowledge base',
    execute: async (query: string) => ({ results: [], query }),
  },
  {
    id: 'calculate',
    name: 'calculate',
    description: 'Perform mathematical calculations',
    execute: async (expression: string) => {
      try {
        // Safe eval alternative
        const result = Function(`"use strict"; return (${expression})`)();
        return { result };
      } catch (e) {
        return { error: 'Invalid expression' };
      }
    },
  },
  {
    id: 'finish',
    name: 'finish',
    description: 'Complete the task with final answer',
    execute: async (answer: any) => ({ answer }),
  },
];

// Export factory function
export const createReActEngine = (config?: Partial<ReActConfig>) => new ReActLoopEngine(config);
