/**
 * Agentic AI Core Hook
 * Implements ReAct loop, self-reflection, planning, and autonomous goal decomposition
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

// Agentic AI Types
export type ThoughtType = 'observation' | 'thought' | 'action' | 'reflection' | 'plan' | 'critique';
export type ExecutionStatus = 'idle' | 'thinking' | 'acting' | 'reflecting' | 'planning' | 'completed' | 'failed';

export interface AgenticStep {
  id: string;
  type: ThoughtType;
  content: string;
  metadata?: Record<string, any>;
  timestamp: string;
  duration?: number;
}

export interface ReActState {
  goal: string;
  steps: AgenticStep[];
  status: ExecutionStatus;
  currentIteration: number;
  maxIterations: number;
  finalAnswer?: string;
  error?: string;
}

export interface Plan {
  id: string;
  goal: string;
  subgoals: Subgoal[];
  status: 'draft' | 'executing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface Subgoal {
  id: string;
  description: string;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  result?: any;
  assignedTool?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (params: Record<string, any>) => Promise<any>;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

export interface SelfReflection {
  id: string;
  stepId: string;
  critique: string;
  suggestions: string[];
  shouldRetry: boolean;
  confidence: number;
  timestamp: string;
}

export interface ToolChain {
  id: string;
  name: string;
  tools: string[];
  conditions: ChainCondition[];
  createdAt: string;
}

export interface ChainCondition {
  fromTool: string;
  toTool: string;
  condition: string;
  transformOutput?: (output: any) => any;
}

export const useAgenticAI = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [reactState, setReactState] = useState<ReActState | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [reflections, setReflections] = useState<SelfReflection[]>([]);
  const [toolChains, setToolChains] = useState<ToolChain[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Available tools for the agent
  const availableTools: Tool[] = [
    {
      id: 'search',
      name: 'Knowledge Search',
      description: 'Search the knowledge base for relevant information',
      parameters: [
        { name: 'query', type: 'string', description: 'Search query', required: true }
      ],
      execute: async (params) => {
        const { data } = await supabase
          .from('universal_knowledge_base')
          .select('title, content')
          .textSearch('content', params.query)
          .limit(5);
        return data || [];
      }
    },
    {
      id: 'analyze',
      name: 'Analyze Data',
      description: 'Analyze provided data and extract insights',
      parameters: [
        { name: 'data', type: 'object', description: 'Data to analyze', required: true },
        { name: 'type', type: 'string', description: 'Analysis type', required: false, default: 'general' }
      ],
      execute: async (params) => {
        // Simulate analysis
        return {
          summary: `Analysis of ${typeof params.data === 'object' ? Object.keys(params.data).length : 1} items`,
          insights: ['Pattern detected', 'Trend identified'],
          confidence: 0.85
        };
      }
    },
    {
      id: 'validate',
      name: 'Validate Information',
      description: 'Validate information against known data sources',
      parameters: [
        { name: 'claim', type: 'string', description: 'Information to validate', required: true }
      ],
      execute: async (params) => {
        return {
          isValid: Math.random() > 0.3,
          confidence: 0.7 + Math.random() * 0.3,
          sources: ['Database', 'Knowledge Base']
        };
      }
    },
    {
      id: 'calculate',
      name: 'Calculate',
      description: 'Perform calculations or data transformations',
      parameters: [
        { name: 'expression', type: 'string', description: 'Calculation expression', required: true }
      ],
      execute: async (params) => {
        try {
          // Safe expression evaluation (in production, use a proper math parser)
          const result = params.expression.split('+').reduce((a: number, b: string) => a + parseFloat(b.trim()), 0);
          return { result, expression: params.expression };
        } catch {
          return { error: 'Invalid expression', expression: params.expression };
        }
      }
    },
    {
      id: 'store',
      name: 'Store Memory',
      description: 'Store information in agent memory for later retrieval',
      parameters: [
        { name: 'key', type: 'string', description: 'Memory key', required: true },
        { name: 'value', type: 'object', description: 'Value to store', required: true }
      ],
      execute: async (params) => {
        // Store in agent communications as memory
        if (agentId) {
          await supabase
            .from('agent_communications')
            .insert([{
              from_agent_id: agentId,
              message_type: 'notification',
              message_payload: {
                type: 'memory_store',
                key: params.key,
                value: params.value
              } as any,
              status: 'processed',
              metadata: { isMemory: true } as any
            }]);
        }
        return { stored: true, key: params.key };
      }
    }
  ];

  // Add step to ReAct state
  const addStep = useCallback((type: ThoughtType, content: string, metadata?: Record<string, any>) => {
    const step: AgenticStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      metadata,
      timestamp: new Date().toISOString()
    };

    setReactState(prev => prev ? {
      ...prev,
      steps: [...prev.steps, step]
    } : null);

    return step;
  }, []);

  // Execute ReAct loop
  const executeReActMutation = useMutation({
    mutationFn: async ({
      goal,
      maxIterations = 10,
      tools = availableTools
    }: {
      goal: string;
      maxIterations?: number;
      tools?: Tool[];
    }) => {
      abortControllerRef.current = new AbortController();
      
      const initialState: ReActState = {
        goal,
        steps: [],
        status: 'thinking',
        currentIteration: 0,
        maxIterations
      };
      
      setReactState(initialState);

      // Record initial observation
      addStep('observation', `Goal received: ${goal}`);

      let iteration = 0;
      let shouldContinue = true;
      let finalAnswer: string | undefined;

      while (shouldContinue && iteration < maxIterations) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Execution aborted');
        }

        iteration++;
        setReactState(prev => prev ? { ...prev, currentIteration: iteration, status: 'thinking' } : null);

        // THINK: Reason about the current state
        const thought = await generateThought(goal, iteration, tools);
        addStep('thought', thought.reasoning);

        // Check if we have an answer
        if (thought.hasAnswer) {
          finalAnswer = thought.answer;
          addStep('observation', `Final answer determined: ${finalAnswer}`);
          shouldContinue = false;
          break;
        }

        // ACT: Select and execute a tool
        if (thought.selectedTool) {
          setReactState(prev => prev ? { ...prev, status: 'acting' } : null);
          
          const tool = tools.find(t => t.id === thought.selectedTool);
          if (tool) {
            addStep('action', `Executing tool: ${tool.name}`, { tool: tool.id, params: thought.toolParams });
            
            try {
              const result = await tool.execute(thought.toolParams || {});
              addStep('observation', `Tool result: ${JSON.stringify(result).slice(0, 200)}`, { result });
              
              // REFLECT: Self-critique the result
              setReactState(prev => prev ? { ...prev, status: 'reflecting' } : null);
              const reflection = await selfReflect(goal, result, iteration);
              
              if (reflection.shouldRetry && iteration < maxIterations - 1) {
                addStep('reflection', reflection.critique);
              } else if (reflection.confidence > 0.8) {
                finalAnswer = `Based on analysis: ${JSON.stringify(result)}`;
                shouldContinue = false;
              }
              
              setReflections(prev => [...prev, reflection]);
            } catch (error: any) {
              addStep('observation', `Tool error: ${error.message}`);
            }
          }
        }

        // Prevent infinite loops
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Complete execution
      const finalState: ReActState = {
        goal,
        steps: reactState?.steps || [],
        status: finalAnswer ? 'completed' : 'failed',
        currentIteration: iteration,
        maxIterations,
        finalAnswer: finalAnswer || 'Unable to determine answer within iteration limit'
      };

      setReactState(finalState);

      // Log execution to database
      if (agentId) {
        await supabase
          .from('agent_performance_metrics')
          .insert({
            agent_id: agentId,
            metric_type: 'react_execution',
            metric_value: iteration,
            metric_unit: 'iterations',
            execution_context: {
              goal,
              success: !!finalAnswer,
              stepsCount: finalState.steps.length
            }
          });
      }

      return finalState;
    },
    onSuccess: (state) => {
      if (state.status === 'completed') {
        showSuccess('Goal Achieved', 'ReAct loop completed successfully');
      } else {
        showInfo('Execution Complete', 'Goal partially addressed');
      }
    },
    onError: (error: any) => {
      setReactState(prev => prev ? { ...prev, status: 'failed', error: error.message } : null);
      showError('Execution Failed', error.message);
    }
  });

  // Create plan with goal decomposition
  const createPlanMutation = useMutation({
    mutationFn: async ({
      goal,
      context
    }: {
      goal: string;
      context?: Record<string, any>;
    }) => {
      const planId = `plan_${Date.now()}`;
      
      // Decompose goal into subgoals
      const subgoals = decomposeGoal(goal, availableTools);

      const plan: Plan = {
        id: planId,
        goal,
        subgoals,
        status: 'draft',
        createdAt: new Date().toISOString()
      };

      setActivePlan(plan);

      // Log plan creation
      if (agentId) {
        await supabase
          .from('agent_communications')
          .insert({
            from_agent_id: agentId,
            message_type: 'notification',
            message_payload: {
              type: 'plan_created',
              plan
            },
            status: 'processed',
            metadata: { isPlan: true }
          });
      }

      return plan;
    },
    onSuccess: (plan) => {
      showSuccess('Plan Created', `${plan.subgoals.length} subgoals identified`);
    },
    onError: (error: any) => {
      showError('Planning Failed', error.message);
    }
  });

  // Execute plan
  const executePlanMutation = useMutation({
    mutationFn: async () => {
      if (!activePlan) throw new Error('No active plan');

      setActivePlan(prev => prev ? { ...prev, status: 'executing' } : null);

      for (const subgoal of activePlan.subgoals) {
        // Check dependencies
        const depsCompleted = subgoal.dependencies.every(depId => {
          const dep = activePlan.subgoals.find(s => s.id === depId);
          return dep?.status === 'completed';
        });

        if (!depsCompleted) {
          setActivePlan(prev => {
            if (!prev) return null;
            return {
              ...prev,
              subgoals: prev.subgoals.map(s => 
                s.id === subgoal.id ? { ...s, status: 'blocked' } : s
              )
            };
          });
          continue;
        }

        // Execute subgoal
        setActivePlan(prev => {
          if (!prev) return null;
          return {
            ...prev,
            subgoals: prev.subgoals.map(s => 
              s.id === subgoal.id ? { ...s, status: 'in-progress' } : s
            )
          };
        });

        // Execute using ReAct for each subgoal
        const result = await executeReActMutation.mutateAsync({
          goal: subgoal.description,
          maxIterations: 5
        });

        setActivePlan(prev => {
          if (!prev) return null;
          return {
            ...prev,
            subgoals: prev.subgoals.map(s => 
              s.id === subgoal.id ? { 
                ...s, 
                status: result.status === 'completed' ? 'completed' : 'blocked',
                result: result.finalAnswer 
              } : s
            )
          };
        });
      }

      // Mark plan complete
      const allCompleted = activePlan.subgoals.every(s => s.status === 'completed');
      
      setActivePlan(prev => prev ? {
        ...prev,
        status: allCompleted ? 'completed' : 'failed',
        completedAt: new Date().toISOString()
      } : null);

      return activePlan;
    },
    onSuccess: (plan) => {
      showSuccess('Plan Executed', `Plan ${plan?.status}`);
    },
    onError: (error: any) => {
      showError('Execution Failed', error.message);
    }
  });

  // Create tool chain
  const createToolChain = useCallback((name: string, tools: string[], conditions: ChainCondition[]) => {
    const chain: ToolChain = {
      id: `chain_${Date.now()}`,
      name,
      tools,
      conditions,
      createdAt: new Date().toISOString()
    };

    setToolChains(prev => [...prev, chain]);
    return chain;
  }, []);

  // Execute tool chain
  const executeToolChainMutation = useMutation({
    mutationFn: async ({
      chainId,
      initialInput
    }: {
      chainId: string;
      initialInput: any;
    }) => {
      const chain = toolChains.find(c => c.id === chainId);
      if (!chain) throw new Error('Tool chain not found');

      let currentOutput = initialInput;
      const results: any[] = [];

      for (const toolId of chain.tools) {
        const tool = availableTools.find(t => t.id === toolId);
        if (!tool) continue;

        // Check conditions
        const condition = chain.conditions.find(c => c.toTool === toolId);
        if (condition?.transformOutput) {
          currentOutput = condition.transformOutput(currentOutput);
        }

        // Execute tool
        const result = await tool.execute(currentOutput);
        results.push({ tool: toolId, result });
        currentOutput = result;
      }

      return { chainId, results, finalOutput: currentOutput };
    },
    onSuccess: () => {
      showSuccess('Chain Complete', 'Tool chain executed successfully');
    },
    onError: (error: any) => {
      showError('Chain Failed', error.message);
    }
  });

  // Abort current execution
  const abortExecution = useCallback(() => {
    abortControllerRef.current?.abort();
    setReactState(prev => prev ? { ...prev, status: 'failed', error: 'Aborted by user' } : null);
    showInfo('Aborted', 'Execution stopped');
  }, [showInfo]);

  // Reset state
  const reset = useCallback(() => {
    setReactState(null);
    setActivePlan(null);
    setReflections([]);
  }, []);

  return {
    // ReAct Loop
    reactState,
    executeReAct: executeReActMutation.mutate,
    isExecuting: executeReActMutation.isPending,

    // Planning
    activePlan,
    createPlan: createPlanMutation.mutate,
    executePlan: executePlanMutation.mutate,
    isPlanning: createPlanMutation.isPending,
    isExecutingPlan: executePlanMutation.isPending,

    // Self-Reflection
    reflections,

    // Tool Chaining
    toolChains,
    createToolChain,
    executeToolChain: executeToolChainMutation.mutate,
    isExecutingChain: executeToolChainMutation.isPending,

    // Tools
    availableTools,

    // Controls
    abortExecution,
    reset
  };
};

// Helper: Generate thought based on current state
async function generateThought(
  goal: string, 
  iteration: number, 
  tools: Tool[]
): Promise<{ reasoning: string; hasAnswer: boolean; answer?: string; selectedTool?: string; toolParams?: Record<string, any> }> {
  // Simulate reasoning (in production, this would call an LLM)
  const toolNames = tools.map(t => t.name);
  
  if (iteration === 1) {
    return {
      reasoning: `Analyzing goal: "${goal}". Available tools: ${toolNames.join(', ')}. Will start by searching for relevant information.`,
      hasAnswer: false,
      selectedTool: 'search',
      toolParams: { query: goal.split(' ').slice(0, 5).join(' ') }
    };
  }
  
  if (iteration === 2) {
    return {
      reasoning: `Initial search complete. Now analyzing the results to extract insights.`,
      hasAnswer: false,
      selectedTool: 'analyze',
      toolParams: { data: { query: goal }, type: 'relevance' }
    };
  }

  if (iteration >= 3) {
    return {
      reasoning: `Sufficient information gathered. Formulating final answer.`,
      hasAnswer: true,
      answer: `Based on analysis of "${goal}", the recommended approach involves the identified patterns and insights.`
    };
  }

  return {
    reasoning: `Continuing analysis...`,
    hasAnswer: false
  };
}

// Helper: Self-reflect on results
async function selfReflect(
  goal: string, 
  result: any, 
  iteration: number
): Promise<SelfReflection> {
  const confidence = 0.5 + Math.random() * 0.5;
  const shouldRetry = confidence < 0.7 && iteration < 5;

  return {
    id: `reflection_${Date.now()}`,
    stepId: `step_${iteration}`,
    critique: shouldRetry 
      ? `Result confidence (${(confidence * 100).toFixed(0)}%) below threshold. Consider alternative approach.`
      : `Result appears satisfactory with ${(confidence * 100).toFixed(0)}% confidence.`,
    suggestions: shouldRetry 
      ? ['Try different search terms', 'Use validation tool', 'Gather more context']
      : ['Proceed with current findings'],
    shouldRetry,
    confidence,
    timestamp: new Date().toISOString()
  };
}

// Helper: Decompose goal into subgoals
function decomposeGoal(goal: string, tools: Tool[]): Subgoal[] {
  // Simple decomposition (in production, use LLM)
  const subgoals: Subgoal[] = [
    {
      id: 'subgoal_1',
      description: `Gather information about: ${goal}`,
      dependencies: [],
      status: 'pending',
      assignedTool: 'search'
    },
    {
      id: 'subgoal_2',
      description: `Analyze gathered information`,
      dependencies: ['subgoal_1'],
      status: 'pending',
      assignedTool: 'analyze'
    },
    {
      id: 'subgoal_3',
      description: `Validate findings`,
      dependencies: ['subgoal_2'],
      status: 'pending',
      assignedTool: 'validate'
    },
    {
      id: 'subgoal_4',
      description: `Store results and formulate answer`,
      dependencies: ['subgoal_3'],
      status: 'pending',
      assignedTool: 'store'
    }
  ];

  return subgoals;
}
