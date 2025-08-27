import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ValidationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message?: string;
  details?: string;
  recommendations?: string[];
  autoFixAvailable?: boolean;
  manualFixSteps?: string[];
  executionTime?: number;
}

export interface WorkflowValidationResult {
  overallStatus: 'passed' | 'failed' | 'warning';
  score: number;
  steps: ValidationStep[];
  criticalIssues: string[];
  warnings: string[];
  autoFixableIssues: number;
  manualFixRequiredIssues: number;
  executionSummary: {
    totalSteps: number;
    passedSteps: number;
    failedSteps: number;
    warningSteps: number;
    totalExecutionTime: number;
  };
}

export interface FixOption {
  id: string;
  type: 'auto' | 'manual';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedTime: string;
  steps?: string[];
  autoFixFunction?: () => Promise<boolean>;
}

export const useWorkflowValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<WorkflowValidationResult | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [fixOptions, setFixOptions] = useState<FixOption[]>([]);

  const validateWorkflow = useCallback(async (nodes: any[], edges: any[], userPrompt?: string) => {
    setIsValidating(true);
    setCurrentStep('Initializing validation...');
    
    try {
      const steps: ValidationStep[] = [
        { id: 'structure', name: 'Workflow Structure Analysis', status: 'pending' },
        { id: 'connections', name: 'Node Connections Validation', status: 'pending' },
        { id: 'configuration', name: 'Node Configuration Check', status: 'pending' },
        { id: 'data_flow', name: 'Data Flow Analysis', status: 'pending' },
        { id: 'security', name: 'Security & Compliance Check', status: 'pending' },
        { id: 'performance', name: 'Performance Analysis', status: 'pending' },
        { id: 'prompt_alignment', name: 'Prompt Alignment Check', status: 'pending' },
        { id: 'execution_readiness', name: 'Execution Readiness', status: 'pending' }
      ];

      setValidationResult({
        overallStatus: 'warning',
        score: 0,
        steps,
        criticalIssues: [],
        warnings: [],
        autoFixableIssues: 0,
        manualFixRequiredIssues: 0,
        executionSummary: {
          totalSteps: steps.length,
          passedSteps: 0,
          failedSteps: 0,
          warningSteps: 0,
          totalExecutionTime: 0
        }
      });

      const results = await Promise.all([
        validateStructure(nodes, edges),
        validateConnections(nodes, edges),
        validateConfiguration(nodes),
        validateDataFlow(nodes, edges),
        validateSecurity(nodes),
        validatePerformance(nodes, edges),
        validatePromptAlignment(nodes, edges, userPrompt),
        validateExecutionReadiness(nodes, edges)
      ]);

      const updatedSteps = steps.map((step, index) => ({
        ...step,
        ...results[index]
      }));

      const passedSteps = updatedSteps.filter(s => s.status === 'passed').length;
      const failedSteps = updatedSteps.filter(s => s.status === 'failed').length;
      const warningSteps = updatedSteps.filter(s => s.status === 'warning').length;
      const totalExecutionTime = updatedSteps.reduce((sum, step) => sum + (step.executionTime || 0), 0);

      const criticalIssues = updatedSteps
        .filter(s => s.status === 'failed')
        .map(s => s.message || s.name);

      const warnings = updatedSteps
        .filter(s => s.status === 'warning')
        .map(s => s.message || s.name);

      const autoFixableIssues = updatedSteps.filter(s => s.autoFixAvailable).length;
      const manualFixRequiredIssues = updatedSteps.filter(s => s.manualFixSteps?.length).length;

      const score = Math.round((passedSteps / steps.length) * 100);
      const overallStatus = failedSteps > 0 ? 'failed' : warningSteps > 0 ? 'warning' : 'passed';

      const finalResult: WorkflowValidationResult = {
        overallStatus,
        score,
        steps: updatedSteps,
        criticalIssues,
        warnings,
        autoFixableIssues,
        manualFixRequiredIssues,
        executionSummary: {
          totalSteps: steps.length,
          passedSteps,
          failedSteps,
          warningSteps,
          totalExecutionTime
        }
      };

      setValidationResult(finalResult);
      generateFixOptions(updatedSteps);

      toast.success(`Validation complete! Score: ${score}/100`);

    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation failed: ' + error.message);
    } finally {
      setIsValidating(false);
      setCurrentStep(null);
    }
  }, []);

  const validateStructure = async (nodes: any[], edges: any[]): Promise<Partial<ValidationStep>> => {
    setCurrentStep('Analyzing workflow structure...');
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-workflow-suggestions', {
        body: { nodes, edges, analysisType: 'structure' }
      });

      if (error) throw error;

      const hasStartNode = nodes.some(n => n.type === 'start' || n.data?.isStart);
      const hasEndNode = nodes.some(n => n.type === 'end' || n.data?.isEnd);
      const hasIsolatedNodes = nodes.some(n => !edges.some(e => e.source === n.id || e.target === n.id));

      if (!hasStartNode || !hasEndNode) {
        return {
          status: 'failed',
          message: 'Missing start or end nodes',
          recommendations: ['Add a start node', 'Add an end node'],
          autoFixAvailable: true,
          executionTime: Date.now() - startTime
        };
      }

      if (hasIsolatedNodes) {
        return {
          status: 'warning',
          message: 'Found isolated nodes',
          recommendations: ['Connect isolated nodes or remove them'],
          autoFixAvailable: true,
          executionTime: Date.now() - startTime
        };
      }

      return {
        status: 'passed',
        message: 'Workflow structure is valid',
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'failed',
        message: 'Structure validation failed: ' + error.message,
        executionTime: Date.now() - startTime
      };
    }
  };

  const validateConnections = async (nodes: any[], edges: any[]): Promise<Partial<ValidationStep>> => {
    setCurrentStep('Validating node connections...');
    const startTime = Date.now();

    const issues = [];
    const warnings = [];

    // Check for disconnected nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const disconnectedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (disconnectedNodes.length > 0) {
      warnings.push(`${disconnectedNodes.length} disconnected nodes found`);
    }

    // Check for circular dependencies
    const hasCircularDependency = detectCircularDependency(nodes, edges);
    if (hasCircularDependency) {
      issues.push('Circular dependency detected');
    }

    // Check for invalid connections
    const invalidConnections = edges.filter(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      return !sourceNode || !targetNode;
    });

    if (invalidConnections.length > 0) {
      issues.push(`${invalidConnections.length} invalid connections found`);
    }

    const status = issues.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'passed';
    const message = issues.length > 0 ? issues.join(', ') : warnings.length > 0 ? warnings.join(', ') : 'All connections are valid';

    return {
      status,
      message,
      recommendations: [
        ...(disconnectedNodes.length > 0 ? ['Connect or remove disconnected nodes'] : []),
        ...(hasCircularDependency ? ['Resolve circular dependencies'] : []),
        ...(invalidConnections.length > 0 ? ['Fix invalid connections'] : [])
      ],
      autoFixAvailable: disconnectedNodes.length > 0 || invalidConnections.length > 0,
      manualFixSteps: hasCircularDependency ? ['Review workflow logic', 'Identify circular paths', 'Restructure workflow'] : undefined,
      executionTime: Date.now() - startTime
    };
  };

  const validateConfiguration = async (nodes: any[]): Promise<Partial<ValidationStep>> => {
    setCurrentStep('Checking node configurations...');
    const startTime = Date.now();

    const issues = [];
    const warnings = [];

    for (const node of nodes) {
      // Check required fields
      if (!node.data?.label && !node.data?.name) {
        warnings.push(`Node ${node.id} missing label/name`);
      }

      // Check node-specific configurations
      switch (node.type) {
        case 'voice':
          if (!node.data?.voiceConfig?.provider) {
            issues.push(`Voice node ${node.id} missing provider configuration`);
          }
          break;
        case 'healthcare':
          if (!node.data?.complianceLevel) {
            issues.push(`Healthcare node ${node.id} missing compliance level`);
          }
          break;
        case 'vector':
          if (!node.data?.vectorConfig?.dimension) {
            issues.push(`Vector node ${node.id} missing dimension configuration`);
          }
          break;
      }
    }

    const status = issues.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'passed';
    const message = issues.length > 0 ? `${issues.length} configuration issues found` : 
                   warnings.length > 0 ? `${warnings.length} configuration warnings` : 'All configurations are valid';

    return {
      status,
      message,
      details: [...issues, ...warnings].join(', '),
      recommendations: [
        'Review node configurations',
        'Ensure all required fields are filled',
        'Validate provider settings'
      ],
      autoFixAvailable: warnings.length > 0,
      manualFixSteps: issues.length > 0 ? [
        'Review each flagged node',
        'Complete required configuration fields',
        'Test individual node configurations'
      ] : undefined,
      executionTime: Date.now() - startTime
    };
  };

  const validateDataFlow = async (nodes: any[], edges: any[]): Promise<Partial<ValidationStep>> => {
    setCurrentStep('Analyzing data flow...');
    const startTime = Date.now();

    // Simulate data flow analysis
    const dataFlowIssues = [];
    const dataTypes = new Map<string, string>();

    // Track data types through the flow
    nodes.forEach(node => {
      if (node.data?.outputType) {
        dataTypes.set(node.id, node.data.outputType);
      }
    });

    // Check type compatibility
    edges.forEach(edge => {
      const sourceType = dataTypes.get(edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      const expectedType = targetNode?.data?.expectedInputType;

      if (sourceType && expectedType && sourceType !== expectedType) {
        dataFlowIssues.push(`Type mismatch: ${edge.source} (${sourceType}) -> ${edge.target} (expects ${expectedType})`);
      }
    });

    const status = dataFlowIssues.length > 0 ? 'warning' : 'passed';
    const message = dataFlowIssues.length > 0 ? `${dataFlowIssues.length} data flow issues found` : 'Data flow is valid';

    return {
      status,
      message,
      details: dataFlowIssues.join(', '),
      recommendations: dataFlowIssues.length > 0 ? [
        'Add data transformation nodes',
        'Check input/output type compatibility',
        'Review data flow logic'
      ] : ['Data flow is optimized'],
      autoFixAvailable: false,
      manualFixSteps: dataFlowIssues.length > 0 ? [
        'Identify type mismatches',
        'Add transformation nodes',
        'Validate data types'
      ] : undefined,
      executionTime: Date.now() - startTime
    };
  };

  const validateSecurity = async (nodes: any[]): Promise<Partial<ValidationStep>> => {
    setCurrentStep('Performing security check...');
    const startTime = Date.now();

    const securityIssues = [];
    const warnings = [];

    nodes.forEach(node => {
      // Check for sensitive data handling
      if (node.type === 'healthcare' && !node.data?.encryption) {
        securityIssues.push(`Healthcare node ${node.id} lacks encryption`);
      }

      // Check for API key exposure
      if (node.data?.apiKey && !node.data.secure) {
        warnings.push(`Node ${node.id} may expose API keys`);
      }

      // Check compliance requirements
      if (node.type === 'database' && !node.data?.accessControl) {
        securityIssues.push(`Database node ${node.id} missing access control`);
      }
    });

    const status = securityIssues.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'passed';
    const message = securityIssues.length > 0 ? `${securityIssues.length} security issues found` : 
                   warnings.length > 0 ? `${warnings.length} security warnings` : 'Security check passed';

    return {
      status,
      message,
      details: [...securityIssues, ...warnings].join(', '),
      recommendations: [
        'Enable encryption for sensitive data',
        'Secure API key storage',
        'Implement access controls',
        'Review compliance requirements'
      ],
      autoFixAvailable: warnings.length > 0,
      manualFixSteps: securityIssues.length > 0 ? [
        'Review security policies',
        'Implement encryption',
        'Configure access controls',
        'Validate compliance settings'
      ] : undefined,
      executionTime: Date.now() - startTime
    };
  };

  const validatePerformance = async (nodes: any[], edges: any[]): Promise<Partial<ValidationStep>> => {
    setCurrentStep('Analyzing performance...');
    const startTime = Date.now();

    const performanceWarnings = [];
    
    // Check workflow complexity
    if (nodes.length > 50) {
      performanceWarnings.push('Large workflow may impact performance');
    }

    // Check for potential bottlenecks
    const highDegreeNodes = nodes.filter(node => {
      const incomingEdges = edges.filter(e => e.target === node.id).length;
      const outgoingEdges = edges.filter(e => e.source === node.id).length;
      return incomingEdges + outgoingEdges > 10;
    });

    if (highDegreeNodes.length > 0) {
      performanceWarnings.push(`${highDegreeNodes.length} potential bottleneck nodes found`);
    }

    // Check for resource-intensive operations
    const resourceIntensiveNodes = nodes.filter(node => 
      node.type === 'ai-model' || node.type === 'vector' || node.type === 'database'
    );

    if (resourceIntensiveNodes.length > 10) {
      performanceWarnings.push('High number of resource-intensive operations');
    }

    const status = performanceWarnings.length > 0 ? 'warning' : 'passed';
    const message = performanceWarnings.length > 0 ? 'Performance optimization recommended' : 'Performance looks good';

    return {
      status,
      message,
      details: performanceWarnings.join(', '),
      recommendations: [
        'Consider workflow optimization',
        'Implement caching where appropriate',
        'Monitor resource usage',
        'Consider parallel processing'
      ],
      executionTime: Date.now() - startTime
    };
  };

  const validatePromptAlignment = async (nodes: any[], edges: any[], userPrompt?: string): Promise<Partial<ValidationStep>> => {
    setCurrentStep('Checking prompt alignment...');
    const startTime = Date.now();

    if (!userPrompt) {
      return {
        status: 'warning',
        message: 'No user prompt provided for alignment check',
        executionTime: Date.now() - startTime
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('analyze-workflow-suggestions', {
        body: { 
          nodes, 
          edges, 
          userPrompt,
          analysisType: 'prompt_alignment'
        }
      });

      if (error) throw error;

      const alignmentScore = data?.alignmentScore || 0;
      const suggestions = data?.suggestions || [];

      const status = alignmentScore >= 80 ? 'passed' : alignmentScore >= 60 ? 'warning' : 'failed';
      const message = `Prompt alignment score: ${alignmentScore}%`;

      return {
        status,
        message,
        details: suggestions.join(', '),
        recommendations: suggestions,
        manualFixSteps: alignmentScore < 60 ? [
          'Review workflow against original prompt',
          'Adjust node configurations',
          'Realign workflow objectives'
        ] : undefined,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Prompt alignment check failed: ' + error.message,
        executionTime: Date.now() - startTime
      };
    }
  };

  const validateExecutionReadiness = async (nodes: any[], edges: any[]): Promise<Partial<ValidationStep>> => {
    setCurrentStep('Checking execution readiness...');
    const startTime = Date.now();

    const issues = [];
    const warnings = [];

    // Check for required configurations
    const unconfiguredNodes = nodes.filter(node => {
      switch (node.type) {
        case 'voice':
          return !node.data?.voiceConfig?.provider;
        case 'healthcare':
          return !node.data?.complianceLevel;
        case 'vector':
          return !node.data?.vectorConfig;
        case 'database':
          return !node.data?.connectionString;
        default:
          return false;
      }
    });

    if (unconfiguredNodes.length > 0) {
      issues.push(`${unconfiguredNodes.length} nodes need configuration`);
    }

    // Check for missing credentials
    const nodesNeedingCredentials = nodes.filter(node => 
      node.data?.requiresAuth && !node.data?.credentials
    );

    if (nodesNeedingCredentials.length > 0) {
      warnings.push(`${nodesNeedingCredentials.length} nodes need credentials`);
    }

    const status = issues.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'passed';
    const message = issues.length > 0 ? 'Not ready for execution' : 
                   warnings.length > 0 ? 'Execution possible with warnings' : 'Ready for execution';

    return {
      status,
      message,
      details: [...issues, ...warnings].join(', '),
      recommendations: [
        'Complete node configurations',
        'Add required credentials',
        'Test individual components',
        'Verify external dependencies'
      ],
      autoFixAvailable: false,
      manualFixSteps: [
        'Review each flagged node',
        'Complete required configurations',
        'Add necessary credentials',
        'Test workflow execution'
      ],
      executionTime: Date.now() - startTime
    };
  };

  const generateFixOptions = (steps: ValidationStep[]) => {
    const options: FixOption[] = [];

    steps.forEach(step => {
      if (step.status === 'failed' || step.status === 'warning') {
        if (step.autoFixAvailable) {
          options.push({
            id: `auto-${step.id}`,
            type: 'auto',
            title: `Auto-fix ${step.name}`,
            description: `Automatically resolve issues in ${step.name.toLowerCase()}`,
            impact: step.status === 'failed' ? 'high' : 'medium',
            estimatedTime: '< 1 minute',
            autoFixFunction: async () => {
              // Implement auto-fix logic based on step type
              return await performAutoFix(step.id);
            }
          });
        }

        if (step.manualFixSteps) {
          options.push({
            id: `manual-${step.id}`,
            type: 'manual',
            title: `Manual fix for ${step.name}`,
            description: step.message || `Fix issues in ${step.name.toLowerCase()}`,
            impact: step.status === 'failed' ? 'high' : 'medium',
            estimatedTime: '5-15 minutes',
            steps: step.manualFixSteps
          });
        }
      }
    });

    setFixOptions(options);
  };

  const performAutoFix = async (stepId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-executor', {
        body: { 
          action: 'auto_fix',
          stepId,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
      return data?.success || false;
    } catch (error) {
      console.error('Auto-fix failed:', error);
      toast.error('Auto-fix failed: ' + error.message);
      return false;
    }
  };

  const detectCircularDependency = (nodes: any[], edges: any[]): boolean => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (hasCycle(node.id)) return true;
    }

    return false;
  };

  return {
    isValidating,
    validationResult,
    currentStep,
    fixOptions,
    validateWorkflow,
    performAutoFix
  };
};