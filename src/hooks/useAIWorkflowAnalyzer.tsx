import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

export interface WorkflowIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'suggestion';
  severity: 'high' | 'medium' | 'low';
  nodeId?: string;
  edgeId?: string;
  title: string;
  description: string;
  suggestion: string;
  autoFixAvailable: boolean;
  category: 'connection' | 'configuration' | 'performance' | 'logic' | 'data';
}

export interface ExecutionStep {
  id: string;
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
  logs: string[];
  metrics?: {
    memory?: number;
    cpu?: number;
    tokens?: number;
    cost?: number;
  };
}

export interface WorkflowAnalysis {
  issues: WorkflowIssue[];
  suggestions: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedRunTime: number;
  estimatedCost: number;
  riskAssessment: 'low' | 'medium' | 'high';
}

export const useAIWorkflowAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [analysis, setAnalysis] = useState<WorkflowAnalysis | null>(null);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  
  const { showSuccess, showError, showInfo } = useMasterToast();
  const lastErrorAtRef = useRef(0);
  const errorCooldownMs = 10000;
  // Concurrency guards to prevent re-entrancy / feedback loops
  const analyzeLockRef = useRef(false);
  const execLockRef = useRef(false);
  const analyzeWorkflow = useCallback(async (
    nodes: any[], 
    edges: any[], 
    options: { 
      aiProvider?: 'openai' | 'claude' | 'gemini', 
      generateCode?: boolean,
      analysisType?: 'comprehensive' | 'ai-enhanced' | 'structure' | 'prompt-alignment',
      connectionAnalysis?: boolean,
      nodeSpecificAnalysis?: boolean,
      templateGeneration?: boolean,
      userPrompt?: string
    } = {}
  ) => {
    // prevent re-entrancy and storms
    if (isAnalyzing || analyzeLockRef.current) return;
    analyzeLockRef.current = true;
    setIsAnalyzing(true);
    
    try {
      const { 
        aiProvider = 'openai', 
        generateCode = true, 
        analysisType = 'ai-enhanced',
        connectionAnalysis = true,
        nodeSpecificAnalysis = true,
        templateGeneration = true,
        userPrompt
      } = options;

      // Call AI analysis edge function with connection-aware analysis
      const { data, error } = await supabase.functions.invoke('analyze-workflow-suggestions', {
        body: { 
          nodes: nodes.map(n => ({
            id: n.id,
            type: n.type,
            data: n.data,
            position: n.position
          })),
          edges: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle
          })),
          analysisType,
          aiProvider,
          generateCode,
          connectionAnalysis,
          nodeSpecificAnalysis,
          templateGeneration,
          userPrompt
        }
      });

      if (error) throw error;

      const analysisResult: WorkflowAnalysis = {
        issues: data?.issues || [],
        suggestions: data?.suggestions || [],
        complexity: data?.complexity || 'simple',
        estimatedRunTime: data?.estimatedRunTime || 0,
        estimatedCost: data?.estimatedCost || 0,
        riskAssessment: data?.riskAssessment || 'low'
      };

      // Add AI-specific and connection-aware results
      if (data?.codeFixSuggestions) {
        (analysisResult as any).codeFixSuggestions = data.codeFixSuggestions;
      }
      if (data?.aiSuggestions) {
        (analysisResult as any).aiSuggestions = data.aiSuggestions;
      }
      if (data?.connectionAnalysis) {
        (analysisResult as any).connectionAnalysis = data.connectionAnalysis;
      }
      if (data?.nodeSpecificFixes) {
        (analysisResult as any).nodeSpecificFixes = data.nodeSpecificFixes;
      }
      if (data?.templateNodes) {
        (analysisResult as any).templateNodes = data.templateNodes;
      }
      if (data?.workflowContext) {
        (analysisResult as any).workflowContext = data.workflowContext;
      }

      setAnalysis(analysisResult);
      
      const hasCodeFixes = data?.codeFixSuggestions?.length > 0;
      const hasNodeFixes = data?.nodeSpecificFixes?.length > 0;
      const hasTemplates = data?.templateNodes?.length > 0;
      const criticalIssues = analysisResult.issues.filter(i => i.severity === 'high');
      
      if (hasCodeFixes || hasNodeFixes || hasTemplates) {
        const fixCount = (data?.codeFixSuggestions?.length || 0) + (data?.nodeSpecificFixes?.length || 0);
        const templateCount = data?.templateNodes?.length || 0;
        showInfo(`Connection-aware analysis complete! Found ${fixCount} fixes and ${templateCount} template suggestions using ${aiProvider.toUpperCase()}`);
      } else if (criticalIssues.length > 0) {
        showError(`Found ${criticalIssues.length} critical issues that need attention`);
      } else if (analysisResult.issues.length > 0) {
        showInfo(`Found ${analysisResult.issues.length} potential improvements`);
      }

    } catch (error: any) {
      console.error('Workflow analysis failed:', error);
      const now = Date.now();
      if (now - lastErrorAtRef.current > errorCooldownMs) {
        showError(`Analysis failed: ${error.message}`);
        lastErrorAtRef.current = now;
      }
    } finally {
      setIsAnalyzing(false);
      analyzeLockRef.current = false;
    }
  }, [isAnalyzing, showError, showInfo]);

  const executeWorkflowWithAI = useCallback(async (
    nodes: any[], 
    edges: any[], 
    input: any,
    onStepUpdate?: (step: ExecutionStep) => void
  ) => {
    // prevent re-entrancy
    if (isExecuting || execLockRef.current) return;
    execLockRef.current = true;
    setIsExecuting(true);
    setCurrentStep(null);
    
    // Initialize execution steps
    const steps: ExecutionStep[] = nodes.map(node => ({
      id: `step-${node.id}`,
      nodeId: node.id,
      nodeName: node.data?.label || node.id,
      status: 'pending',
      logs: []
    }));
    
    setExecutionSteps(steps);

    try {
      // Find entry point (nodes with no incoming edges)
      const nodeIds = new Set(nodes.map(n => n.id));
      const targetNodes = new Set(edges.map(e => e.target));
      const entryNodes = nodes.filter(n => !targetNodes.has(n.id));
      
      let currentData = input;
      
      // Execute nodes in topological order
      for (const node of nodes) {
        const stepIndex = steps.findIndex(s => s.nodeId === node.id);
        if (stepIndex === -1) continue;
        
        const step = steps[stepIndex];
        step.status = 'running';
        step.startTime = new Date();
        step.input = currentData;
        step.logs.push(`Starting execution of node: ${step.nodeName}`);
        
        setCurrentStep(step.id);
        setExecutionSteps([...steps]);
        onStepUpdate?.(step);

        try {
          // Simulate AI processing
          const { data: result, error } = await supabase.functions.invoke('test-api-service', {
            body: {
              nodeId: node.id,
              nodeType: node.type,
              nodeConfig: node.data,
              input: currentData,
              context: {
                workflowId: 'current-workflow',
                stepId: step.id,
                previousSteps: steps.slice(0, stepIndex).filter(s => s.status === 'completed')
              }
            }
          });

          if (error) throw error;

          step.status = 'completed';
          step.endTime = new Date();
          step.duration = step.endTime.getTime() - step.startTime.getTime();
          step.output = result.output;
          step.logs.push(`Node execution completed successfully`);
          
          if (result.metrics) {
            step.metrics = result.metrics;
            step.logs.push(`Metrics: ${JSON.stringify(result.metrics)}`);
          }

          currentData = result.output || currentData;

        } catch (nodeError: any) {
          step.status = 'failed';
          step.endTime = new Date();
          step.duration = step.endTime ? step.endTime.getTime() - step.startTime.getTime() : 0;
          step.error = nodeError.message;
          step.logs.push(`❌ Error: ${nodeError.message}`);
          
          const now = Date.now();
          if (now - lastErrorAtRef.current > errorCooldownMs) {
            showError(`Node ${step.nodeName} failed: ${nodeError.message}`);
            lastErrorAtRef.current = now;
          }
          break;
        }
        
        setExecutionSteps([...steps]);
        onStepUpdate?.(step);
        
        // Brief pause between steps for better UX
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const failedSteps = steps.filter(s => s.status === 'failed');
      const completedSteps = steps.filter(s => s.status === 'completed');
      
      if (failedSteps.length > 0) {
        showError(`Workflow failed at ${failedSteps.length} steps`);
      } else {
        // keep success toast minimal to avoid noise
        // showSuccess(`Workflow completed: ${completedSteps.length} steps.`);
      }

    } catch (error: any) {
      console.error('Workflow execution failed:', error);
      const now = Date.now();
      if (now - lastErrorAtRef.current > errorCooldownMs) {
        showError(`Execution failed: ${error.message}`);
        lastErrorAtRef.current = now;
      }
    } finally {
      setIsExecuting(false);
      setCurrentStep(null);
      execLockRef.current = false;
    }
  }, [isExecuting, showError]);

  const fixIssue = useCallback(async (issue: WorkflowIssue, nodes: any[], edges: any[]) => {
    if (!issue.autoFixAvailable) {
      showError('Auto-fix not available for this issue');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-journey-suggestions', {
        body: {
          action: 'fix-issue',
          issue,
          workflow: { nodes, edges }
        }
      });

      if (error) throw error;
      
      showSuccess(`Issue "${issue.title}" has been fixed`);
      return data.updatedWorkflow;
      
    } catch (error: any) {
      console.error('Auto-fix failed:', error);
      showError(`Auto-fix failed: ${error.message}`);
      return null;
    }
  }, [showSuccess, showError]);

  const generateOptimizations = useCallback(async (nodes: any[], edges: any[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-workflow-suggestions', {
        body: {
          action: 'optimize',
          nodes,
          edges
        }
      });

      if (error) throw error;
      
      return data.optimizations || [];
      
    } catch (error: any) {
      console.error('Optimization generation failed:', error);
      showError(`Optimization failed: ${error.message}`);
      return [];
    }
  }, [showError]);

  return {
    // State
    isAnalyzing,
    isExecuting,
    analysis,
    executionSteps,
    currentStep,
    
    // Actions
    analyzeWorkflow,
    executeWorkflowWithAI,
    fixIssue,
    generateOptimizations
  };
};