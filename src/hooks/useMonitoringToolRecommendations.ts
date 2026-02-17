import { useState, useCallback } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface MonitoringTool {
  name: string;
  category: 'apm' | 'observability' | 'workflow' | 'realtime' | 'ml_ops' | 'infrastructure';
  valueAdd: string[];
  integrationComplexity: 'low' | 'medium' | 'high';
  costTier: 'free' | 'paid' | 'enterprise';
  bestFor: string[];
  arizeCompatibility: 'complementary' | 'alternative' | 'overlapping';
  implementationUrl?: string;
}

const RECOMMENDED_MONITORING_TOOLS: MonitoringTool[] = [
  // APM & Observability
  {
    name: 'Datadog',
    category: 'apm',
    valueAdd: [
      'Real-time infrastructure monitoring',
      'Custom dashboards and alerting',
      'Log aggregation and analysis',
      'Distributed tracing with APM',
      'Machine learning anomaly detection'
    ],
    integrationComplexity: 'medium',
    costTier: 'enterprise',
    bestFor: ['Production environments', 'Large scale deployments', 'Multi-service architectures'],
    arizeCompatibility: 'complementary',
    implementationUrl: 'https://docs.datadoghq.com/api/latest/'
  },
  {
    name: 'New Relic',
    category: 'apm',
    valueAdd: [
      'Full-stack observability',
      'AI-powered incident intelligence',
      'Browser and mobile monitoring',
      'Synthetic monitoring',
      'Database performance insights'
    ],
    integrationComplexity: 'medium',
    costTier: 'paid',
    bestFor: ['Application performance', 'User experience monitoring', 'DevOps teams'],
    arizeCompatibility: 'complementary'
  },
  {
    name: 'Grafana + Prometheus',
    category: 'observability',
    valueAdd: [
      'Open-source flexibility',
      'Custom metrics collection',
      'Beautiful visualization dashboards',
      'Alertmanager integration',
      'Cost-effective scaling'
    ],
    integrationComplexity: 'high',
    costTier: 'free',
    bestFor: ['Custom monitoring needs', 'Cost-conscious teams', 'Kubernetes environments'],
    arizeCompatibility: 'complementary'
  },
  
  // Workflow-Specific
  {
    name: 'Temporal',
    category: 'workflow',
    valueAdd: [
      'Workflow state management',
      'Automatic retries and compensation',
      'Workflow versioning and migration',
      'Event sourcing capabilities',
      'Long-running workflow support'
    ],
    integrationComplexity: 'high',
    costTier: 'free',
    bestFor: ['Complex workflow orchestration', 'Microservices coordination', 'Fault-tolerant systems'],
    arizeCompatibility: 'complementary'
  },
  {
    name: 'Apache Airflow',
    category: 'workflow',
    valueAdd: [
      'DAG-based workflow definition',
      'Rich UI for workflow monitoring',
      'Extensive operator ecosystem',
      'Scheduling and dependency management',
      'Plugin architecture'
    ],
    integrationComplexity: 'medium',
    costTier: 'free',
    bestFor: ['Data pipelines', 'ETL processes', 'Scheduled workflows'],
    arizeCompatibility: 'complementary'
  },
  
  // Real-time & ML-specific
  {
    name: 'Weights & Biases (wandb)',
    category: 'ml_ops',
    valueAdd: [
      'ML experiment tracking',
      'Model versioning and registry',
      'Hyperparameter optimization',
      'Dataset versioning',
      'Model performance monitoring'
    ],
    integrationComplexity: 'low',
    costTier: 'paid',
    bestFor: ['ML model development', 'AI experimentation', 'Model lifecycle management'],
    arizeCompatibility: 'alternative'
  },
  {
    name: 'MLflow',
    category: 'ml_ops',
    valueAdd: [
      'Open-source ML lifecycle management',
      'Model registry and serving',
      'Experiment tracking',
      'Reproducible ML pipelines',
      'Multi-framework support'
    ],
    integrationComplexity: 'medium',
    costTier: 'free',
    bestFor: ['ML model management', 'Experiment reproducibility', 'Multi-team ML projects'],
    arizeCompatibility: 'alternative'
  },
  
  // Infrastructure & Real-time
  {
    name: 'Honeycomb',
    category: 'observability',
    valueAdd: [
      'High-cardinality observability',
      'Interactive query interface',
      'Distributed tracing',
      'Real-time debugging',
      'Context-aware alerting'
    ],
    integrationComplexity: 'medium',
    costTier: 'paid',
    bestFor: ['Complex distributed systems', 'Debugging production issues', 'High-traffic applications'],
    arizeCompatibility: 'complementary'
  },
  {
    name: 'Sentry',
    category: 'apm',
    valueAdd: [
      'Error tracking and monitoring',
      'Performance monitoring',
      'Release health tracking',
      'User context and breadcrumbs',
      'Integration with development workflow'
    ],
    integrationComplexity: 'low',
    costTier: 'paid',
    bestFor: ['Error monitoring', 'Developer productivity', 'Application reliability'],
    arizeCompatibility: 'complementary'
  }
];

export const useMonitoringToolRecommendations = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [implementationPlan, setImplementationPlan] = useState<any>(null);
  const { showSuccess, showInfo } = useMasterToast();

  const getToolsByCategory = useCallback((category: MonitoringTool['category']) => {
    return RECOMMENDED_MONITORING_TOOLS.filter(tool => tool.category === category);
  }, []);

  const getComplementaryTools = useCallback(() => {
    return RECOMMENDED_MONITORING_TOOLS.filter(tool => tool.arizeCompatibility === 'complementary');
  }, []);

  const getAlternativeTools = useCallback(() => {
    return RECOMMENDED_MONITORING_TOOLS.filter(tool => tool.arizeCompatibility === 'alternative');
  }, []);

  const generateImplementationPlan = useCallback((toolNames: string[]) => {
    const tools = RECOMMENDED_MONITORING_TOOLS.filter(tool => toolNames.includes(tool.name));
    
    const plan = {
      phase1: {
        name: 'Foundation Setup',
        duration: '2-3 weeks',
        tools: tools.filter(t => t.integrationComplexity === 'low'),
        description: 'Quick wins with easy integrations'
      },
      phase2: {
        name: 'Core Monitoring',
        duration: '4-6 weeks',
        tools: tools.filter(t => t.integrationComplexity === 'medium'),
        description: 'Primary monitoring infrastructure'
      },
      phase3: {
        name: 'Advanced Features',
        duration: '6-8 weeks',
        tools: tools.filter(t => t.integrationComplexity === 'high'),
        description: 'Complex integrations and custom solutions'
      },
      totalCost: tools.reduce((cost, tool) => {
        const tierCosts = { free: 0, paid: 100, enterprise: 500 };
        return cost + tierCosts[tool.costTier];
      }, 0),
      keyBenefits: [
        ...new Set(tools.flatMap(t => t.valueAdd))
      ].slice(0, 8)
    };

    setImplementationPlan(plan);
    showSuccess(`Implementation plan generated for ${tools.length} tools`);
    return plan;
  }, [showSuccess]);

  const getToolRecommendations = useCallback((useCase: string) => {
    const useCaseMap: Record<string, string[]> = {
      'startup': ['Sentry', 'Grafana + Prometheus', 'MLflow'],
      'enterprise': ['Datadog', 'New Relic', 'Temporal', 'Weights & Biases (wandb)'],
      'ml_focused': ['Weights & Biases (wandb)', 'MLflow', 'Arize', 'Honeycomb'],
      'workflow_heavy': ['Temporal', 'Apache Airflow', 'Grafana + Prometheus'],
      'cost_conscious': ['Grafana + Prometheus', 'MLflow', 'Apache Airflow', 'Sentry'],
      'debugging_focus': ['Honeycomb', 'Sentry', 'Datadog', 'New Relic']
    };

    return useCaseMap[useCase] || [];
  }, []);

  const addToSelection = useCallback((toolName: string) => {
    setSelectedTools(prev => {
      if (prev.includes(toolName)) {
        return prev.filter(t => t !== toolName);
      }
      return [...prev, toolName];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTools([]);
    setImplementationPlan(null);
  }, []);

  const getIntegrationGuide = useCallback((toolName: string) => {
    const tool = RECOMMENDED_MONITORING_TOOLS.find(t => t.name === toolName);
    if (!tool) return null;

    const guides: Record<string, any> = {
      'Datadog': {
        setup: [
          'Install Datadog agent in your infrastructure',
          'Configure APM tracing in your application',
          'Set up custom metrics collection',
          'Create dashboards for workflow monitoring'
        ],
        codeExample: `
// Datadog integration example
import { StatsD } from 'node-statsd';
const statsd = new StatsD();

// Track workflow execution
statsd.increment('workflow.execution.started');
statsd.timing('workflow.execution.duration', executionTime);
statsd.gauge('workflow.active_connections', connectionCount);
        `,
        cost: '$15-100/host/month',
        estimatedSetupTime: '1-2 weeks'
      },
      'Temporal': {
        setup: [
          'Deploy Temporal server (self-hosted or cloud)',
          'Install Temporal SDK in your application',
          'Define workflows as code',
          'Set up monitoring and alerts'
        ],
        codeExample: `
// Temporal workflow example
import { workflow } from '@temporalio/workflow';

export const workflowExecution = workflow.defineWorkflow({
  type: 'WorkflowExecution',
  execute: async (input) => {
    // Workflow logic with automatic state management
    const result = await activity.processNode(input);
    return result;
  }
});
        `,
        cost: 'Free (self-hosted) or $200+/month (cloud)',
        estimatedSetupTime: '2-4 weeks'
      },
      'Grafana + Prometheus': {
        setup: [
          'Deploy Prometheus server',
          'Install Grafana',
          'Configure service discovery',
          'Create custom dashboards',
          'Set up alerting rules'
        ],
        codeExample: `
// Prometheus metrics example
import { register, Counter, Histogram } from 'prom-client';

const workflowExecutions = new Counter({
  name: 'workflow_executions_total',
  help: 'Total number of workflow executions',
  labelNames: ['status', 'workflow_type']
});

const executionDuration = new Histogram({
  name: 'workflow_execution_duration_seconds',
  help: 'Workflow execution duration'
});
        `,
        cost: 'Free (self-hosted)',
        estimatedSetupTime: '1-3 weeks'
      }
    };

    return guides[toolName] || null;
  }, []);

  return {
    // Tool data
    allTools: RECOMMENDED_MONITORING_TOOLS,
    selectedTools,
    implementationPlan,

    // Filtering functions
    getToolsByCategory,
    getComplementaryTools,
    getAlternativeTools,
    getToolRecommendations,

    // Actions
    addToSelection,
    clearSelection,
    generateImplementationPlan,
    getIntegrationGuide
  };
};