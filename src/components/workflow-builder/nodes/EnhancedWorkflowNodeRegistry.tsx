import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Database, 
  Globe, 
  Mic, 
  Shield, 
  TestTube, 
  Rocket, 
  Zap,
  Settings,
  FlowiseInspired as Flow,
  Brain,
  Users,
  FileText,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Import all available node types
import {
  UseCaseNode,
  AIModelsNode,
  JourneyStagesNode,
  WizardNode,
  ActionsNode,
  ConnectorsNode,
  KnowledgeBaseNode,
  TestingNode,
  DeploymentNode,
  AIIntelligenceNode,
  AgentNode,
  DataSourceNode,
  FlowiseInspiredNode,
  TemplateConfigurationNode,
  HumanInputNode,
  AIModelConfigurationNode,
  FlowControlConfigurationNode,
  HTTPConfigurationNode,
  VoiceConfigurationNode,
  HealthcareComplianceConfigurationNode,
  VectorStoreConfigurationNode,
  TestingConfigurationNode,
  DeploymentConfigurationNode,
  DatabaseConfigurationNode
} from './index';

interface NodeCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  nodes: WorkflowNodeDefinition[];
}

interface WorkflowNodeDefinition {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  category: string;
  isCore: boolean;
  isActive: boolean;
  healthStatus: 'healthy' | 'warning' | 'error';
  integrations: string[];
  lastUpdated: string;
}

export const EnhancedWorkflowNodeRegistry: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('core');
  const [nodeUsageStats, setNodeUsageStats] = useState<Record<string, number>>({});

  // Complete node definitions with all available nodes
  const nodeDefinitions: WorkflowNodeDefinition[] = [
    // Core Nodes
    {
      id: 'use-case',
      name: 'Use Case Definition',
      description: 'Define the primary use case and objectives for the workflow',
      component: UseCaseNode,
      category: 'core',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['all'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'journey-stages',
      name: 'Journey Stages',
      description: 'Configure multi-step user journeys and stage transitions',
      component: JourneyStagesNode,
      category: 'core',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['ui', 'forms', 'ai'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'wizard',
      name: 'Wizard Flow',
      description: 'Create step-by-step guided workflows with validation',
      component: WizardNode,
      category: 'core',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['forms', 'validation'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'human-input',
      name: 'Human Input',
      description: 'Capture and validate human input across multiple channels',
      component: HumanInputNode,
      category: 'core',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['forms', 'voice', 'chat', 'fax'],
      lastUpdated: '2024-01-10'
    },

    // AI & Intelligence Nodes
    {
      id: 'ai-models',
      name: 'AI Models',
      description: 'Configure and manage AI models for processing and analysis',
      component: AIModelsNode,
      category: 'ai',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['openai', 'anthropic', 'local'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'ai-model-config',
      name: 'AI Model Configuration',
      description: 'Advanced AI model settings and parameters',
      component: AIModelConfigurationNode,
      category: 'ai',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['ai'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'ai-intelligence',
      name: 'AI Intelligence',
      description: 'Advanced AI reasoning and decision-making capabilities',
      component: AIIntelligenceNode,
      category: 'ai',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['ai', 'ml'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'agent',
      name: 'Intelligent Agent',
      description: 'Create autonomous AI agents with specific roles and capabilities',
      component: AgentNode,
      category: 'ai',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['ai', 'automation'],
      lastUpdated: '2024-01-10'
    },

    // Integration & Connectivity Nodes
    {
      id: 'actions',
      name: 'Actions & Automation',
      description: 'Define automated actions and business logic triggers',
      component: ActionsNode,
      category: 'integration',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['automation', 'triggers'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'connectors',
      name: 'System Connectors',
      description: 'Connect to external systems and APIs',
      component: ConnectorsNode,
      category: 'integration',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['api', 'webhooks', 'database'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'http-config',
      name: 'HTTP Configuration',
      description: 'Configure HTTP requests, APIs, and external connections',
      component: HTTPConfigurationNode,
      category: 'integration',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['api', 'rest', 'webhooks'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'flow-control',
      name: 'Flow Control',
      description: 'Manage workflow routing, conditions, and business logic',
      component: FlowControlConfigurationNode,
      category: 'integration',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['logic', 'routing'],
      lastUpdated: '2024-01-10'
    },

    // Data & Storage Nodes
    {
      id: 'data-source',
      name: 'Data Sources',
      description: 'Configure and manage various data input sources',
      component: DataSourceNode,
      category: 'data',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['database', 'files', 'api'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'database-config',
      name: 'Database Configuration',
      description: 'Advanced database connectivity and query configuration',
      component: DatabaseConfigurationNode,
      category: 'data',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['supabase', 'postgresql', 'sql'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'knowledge-base',
      name: 'Knowledge Base',
      description: 'Manage knowledge repositories and information sources',
      component: KnowledgeBaseNode,
      category: 'data',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['documents', 'search', 'ai'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'vector-store',
      name: 'Vector Store',
      description: 'Configure vector databases for AI-powered search and retrieval',
      component: VectorStoreConfigurationNode,
      category: 'data',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['vector-db', 'embeddings', 'search'],
      lastUpdated: '2024-01-10'
    },

    // Communication & Channels
    {
      id: 'voice-config',
      name: 'Voice Configuration',
      description: 'Configure voice interactions, speech-to-text, and text-to-speech',
      component: VoiceConfigurationNode,
      category: 'communication',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['voice', 'stt', 'tts'],
      lastUpdated: '2024-01-10'
    },

    // Compliance & Security
    {
      id: 'healthcare-compliance',
      name: 'Healthcare Compliance',
      description: 'Ensure HIPAA, FDA, and healthcare regulatory compliance',
      component: HealthcareComplianceConfigurationNode,
      category: 'compliance',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['hipaa', 'fda', 'audit'],
      lastUpdated: '2024-01-10'
    },

    // Testing & Quality
    {
      id: 'testing',
      name: 'Testing & Validation',
      description: 'Automated testing and quality assurance workflows',
      component: TestingNode,
      category: 'testing',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['testing', 'validation'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'testing-config',
      name: 'Testing Configuration',
      description: 'Advanced testing scenarios and validation rules',
      component: TestingConfigurationNode,
      category: 'testing',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['testing', 'validation', 'qa'],
      lastUpdated: '2024-01-10'
    },

    // Deployment & Operations
    {
      id: 'deployment',
      name: 'Deployment',
      description: 'Configure deployment strategies and environments',
      component: DeploymentNode,
      category: 'deployment',
      isCore: true,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['deployment', 'cicd'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'deployment-config',
      name: 'Deployment Configuration',
      description: 'Advanced deployment settings and environment management',
      component: DeploymentConfigurationNode,
      category: 'deployment',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['deployment', 'environments'],
      lastUpdated: '2024-01-10'
    },

    // Template & Configuration
    {
      id: 'template-config',
      name: 'Template Configuration',
      description: 'Configure workflow templates and reusable patterns',
      component: TemplateConfigurationNode,
      category: 'template',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['templates', 'configuration'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'flowise-inspired',
      name: 'Flowise-Inspired Node',
      description: 'Advanced workflow orchestration with visual programming',
      component: FlowiseInspiredNode,
      category: 'template',
      isCore: false,
      isActive: true,
      healthStatus: 'healthy',
      integrations: ['workflow', 'orchestration'],
      lastUpdated: '2024-01-10'
    }
  ];

  // Category definitions
  const categories: NodeCategory[] = [
    {
      id: 'core',
      name: 'Core Workflow',
      description: 'Essential building blocks for any workflow',
      icon: <Settings className="h-5 w-5" />,
      nodes: nodeDefinitions.filter(n => n.category === 'core')
    },
    {
      id: 'ai',
      name: 'AI & Intelligence',
      description: 'AI models, agents, and intelligent processing',
      icon: <Brain className="h-5 w-5" />,
      nodes: nodeDefinitions.filter(n => n.category === 'ai')
    },
    {
      id: 'integration',
      name: 'Integration & Connectivity',
      description: 'Connect systems, APIs, and external services',
      icon: <Globe className="h-5 w-5" />,
      nodes: nodeDefinitions.filter(n => n.category === 'integration')
    },
    {
      id: 'data',
      name: 'Data & Storage',
      description: 'Data sources, databases, and knowledge management',
      icon: <Database className="h-5 w-5" />,
      nodes: nodeDefinitions.filter(n => n.category === 'data')
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Voice, chat, and multi-channel interactions',
      icon: <MessageSquare className="h-5 w-5" />,
      nodes: nodeDefinitions.filter(n => n.category === 'communication')
    },
    {
      id: 'compliance',
      name: 'Compliance & Security',
      description: 'Healthcare compliance, security, and audit trails',
      icon: <Shield className="h-5 w-5" />,
      nodes: nodeDefinitions.filter(n => n.category === 'compliance')
    },
    {
      id: 'testing',
      name: 'Testing & Quality',
      description: 'Testing frameworks and quality assurance',
      icon: <TestTube className="h-5 w-5" />,
      nodes: nodeDefinitions.filter(n => n.category === 'testing')
    },
    {
      id: 'deployment',
      name: 'Deployment',
      description: 'Deployment strategies and environment management',
      icon: <Rocket className="h-5 w-5" />,
      nodes: nodeDefinitions.filter(n => n.category === 'deployment')
    },
    {
      id: 'template',
      name: 'Templates',
      description: 'Workflow templates and configuration management',
      icon: <FileText className="h-5 w-5" />,
      nodes: nodeDefinitions.filter(n => n.category === 'template')
    }
  ];

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const totalNodes = nodeDefinitions.length;
  const activeNodes = nodeDefinitions.filter(n => n.isActive).length;
  const healthyNodes = nodeDefinitions.filter(n => n.healthStatus === 'healthy').length;

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNodes}</div>
            <p className="text-xs text-muted-foreground">Available node types</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeNodes}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyNodes}</div>
            <p className="text-xs text-muted-foreground">Healthy nodes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Node categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Node Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-9 w-full">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-1 text-xs"
            >
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Badge variant="secondary">
                  {category.nodes.length} nodes
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.nodes.map((node) => (
                  <Card key={node.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{node.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          {node.isCore && <Badge variant="default" className="text-xs">Core</Badge>}
                          {getHealthIcon(node.healthStatus)}
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {node.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {node.integrations.slice(0, 3).map((integration) => (
                          <Badge key={integration} variant="outline" className="text-xs">
                            {integration}
                          </Badge>
                        ))}
                        {node.integrations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{node.integrations.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Updated: {node.lastUpdated}</span>
                        <span className={`px-2 py-1 rounded ${
                          node.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {node.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};