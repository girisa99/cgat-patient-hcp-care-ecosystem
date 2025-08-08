
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Settings,
  Bot,
  Brain,
  Database,
  Zap,
  Phone,
  MessageCircle,
  Code,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';

interface ConfigurationStep {
  id: string;
  name: string;
  status: 'completed' | 'partial' | 'missing';
  data: any;
  dependencies: string[];
}

interface DeploymentConfiguration {
  agentId: string;
  agentName: string;
  steps: {
    basicInfo: ConfigurationStep;
    canvas: ConfigurationStep;
    actions: ConfigurationStep;
    connectors: ConfigurationStep;
    knowledgeBase: ConfigurationStep;
    voiceConfig: ConfigurationStep;
    channelAssignment: ConfigurationStep;
  };
  deploymentReadiness: number;
  gaps: string[];
  recommendations: string[];
}

export const DeploymentFlowManager: React.FC<{
  agentSession: any;
}> = ({ agentSession }) => {
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfiguration | null>(null);
  const [selectedDeploymentType, setSelectedDeploymentType] = useState<'single' | 'multi'>('single');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    // Always analyze, even with null/undefined session
    analyzeDeploymentReadiness(agentSession);
  }, [agentSession]);

  const analyzeDeploymentReadiness = (session: any) => {
    // Handle missing session with meaningful default configuration
    if (!session) {
      const emptySteps = {
        basicInfo: {
          id: 'basicInfo',
          name: 'Basic Information',
          status: 'missing' as const,
          data: {},
          dependencies: []
        },
        canvas: {
          id: 'canvas',
          name: 'Canvas & Branding',
          status: 'missing' as const,
          data: {},
          dependencies: ['basicInfo']
        },
        actions: {
          id: 'actions',
          name: 'Actions & AI Models',
          status: 'missing' as const,
          data: { assigned_actions: [], ai_models: [], configurations: {}, custom_actions: [] },
          dependencies: ['basicInfo']
        },
        connectors: {
          id: 'connectors',
          name: 'System Connectors',
          status: 'missing' as const,
          data: { assigned_connectors: [], api_integrations: [], configurations: {} },
          dependencies: ['actions']
        },
        knowledgeBase: {
          id: 'knowledgeBase',
          name: 'Knowledge Base',
          status: 'missing' as const,
          data: { knowledge_bases: [], documents: [], urls: [], rag_config: {} },
          dependencies: ['basicInfo']
        },
        voiceConfig: {
          id: 'voiceConfig',
          name: 'Voice Configuration',
          status: 'missing' as const,
          data: {},
          dependencies: ['actions']
        },
        channelAssignment: {
          id: 'channelAssignment',
          name: 'Channel Assignment',
          status: 'missing' as const,
          data: { channels: [], environment: 'production', scaling_config: {} },
          dependencies: ['actions', 'connectors']
        }
      };

      setDeploymentConfig({
        agentId: 'no-session',
        agentName: 'No Agent Session Loaded',
        steps: emptySteps,
        deploymentReadiness: 0,
        gaps: ['Agent session not loaded or selected'],
        recommendations: ['Please select an agent session from a previous configuration step']
      });
      return;
    }

    const config: DeploymentConfiguration = {
      agentId: session.id || 'unknown',
      agentName: session.name || 'Unnamed Agent',
      steps: {
        basicInfo: {
          id: 'basicInfo',
          name: 'Basic Information',
          status: (session.basic_info?.name && session.basic_info?.purpose) ? 'completed' : 
                  session.basic_info?.name ? 'partial' : 'missing',
          data: session.basic_info || {},
          dependencies: []
        },
        canvas: {
          id: 'canvas',
          name: 'Canvas & Branding',
          status: (session.canvas?.name && session.canvas?.primaryColor) ? 'completed' : 
                  session.canvas?.name ? 'partial' : 'missing',
          data: session.canvas || {},
          dependencies: ['basicInfo']
        },
        actions: {
          id: 'actions',
          name: 'Actions & AI Models',
          status: (session.actions?.assigned_actions?.length > 0 || session.deployment?.ai_models?.length > 0) ? 'completed' : 
                  (session.actions?.configurations || session.actions?.custom_actions?.length > 0) ? 'partial' : 'missing',
          data: {
            assigned_actions: session.actions?.assigned_actions || [],
            ai_models: session.deployment?.ai_models || [],
            configurations: session.actions?.configurations || {},
            custom_actions: session.actions?.custom_actions || []
          },
          dependencies: ['basicInfo']
        },
        connectors: {
          id: 'connectors',
          name: 'System Connectors',
          status: (session.connectors?.assigned_connectors?.length > 0 || session.connectors?.api_integrations?.length > 0) ? 'completed' : 
                  session.connectors?.configurations ? 'partial' : 'missing',
          data: {
            assigned_connectors: session.connectors?.assigned_connectors || [],
            api_integrations: session.connectors?.api_integrations || [],
            configurations: session.connectors?.configurations || {}
          },
          dependencies: ['actions']
        },
        knowledgeBase: {
          id: 'knowledgeBase',
          name: 'Knowledge Base',
          status: (session.knowledge?.knowledge_bases?.length > 0 || session.knowledge?.documents?.length > 0) ? 'completed' : 
                  (session.knowledge?.urls?.length > 0 || session.rag?.configurations) ? 'partial' : 'missing',
          data: {
            knowledge_bases: session.knowledge?.knowledge_bases || [],
            documents: session.knowledge?.documents || [],
            urls: session.knowledge?.urls || [],
            rag_config: session.rag?.configurations || {}
          },
          dependencies: ['basicInfo']
        },
        voiceConfig: {
          id: 'voiceConfig',
          name: 'Voice Configuration',
          status: session.deployment?.config?.voice?.provider ? 'completed' : 'missing',
          data: session.deployment?.config?.voice || {},
          dependencies: ['actions']
        },
        channelAssignment: {
          id: 'channelAssignment',
          name: 'Channel Assignment',
          status: session.deployment?.config?.channels ? 'completed' : 
                  session.deployment?.environment ? 'partial' : 'missing',
          data: {
            channels: session.deployment?.config?.channels || [],
            environment: session.deployment?.environment || 'production',
            scaling_config: session.deployment?.scaling_config || {}
          },
          dependencies: ['actions', 'connectors']
        }
      },
      deploymentReadiness: 0,
      gaps: [],
      recommendations: []
    };

    // Calculate readiness percentage
    const completedSteps = Object.values(config.steps).filter(step => step.status === 'completed').length;
    const totalSteps = Object.values(config.steps).length;
    config.deploymentReadiness = Math.round((completedSteps / totalSteps) * 100);

    // Identify gaps and recommendations
    config.gaps = Object.values(config.steps)
      .filter(step => step.status === 'missing')
      .map(step => `Missing: ${step.name}`);

    config.recommendations = generateRecommendations(config.steps);

    setDeploymentConfig(config);
  };

  const generateRecommendations = (steps: any) => {
    const recommendations = [];

    if (steps.actions.status === 'missing') {
      recommendations.push('Configure AI models and actions for intelligent responses');
    }

    if (steps.voiceConfig.status === 'missing') {
      recommendations.push('Set up voice configuration for phone/voice channels');
    }

    if (steps.knowledgeBase.status === 'partial') {
      recommendations.push('Add knowledge base sources for better context awareness');
    }

    if (steps.connectors.status === 'partial') {
      recommendations.push('Configure system connectors for external integrations');
    }

    if (steps.channelAssignment.status === 'missing') {
      recommendations.push('Assign agent to at least one communication channel');
    }

    return recommendations;
  };

  const generateSingleAgentCode = () => {
    if (!deploymentConfig) return '';

    return `
// Single Agent Deployment Configuration
import { AgentDeployment } from '@/lib/agent-deployment';

const agentConfig = {
  // Basic Configuration
  id: "${deploymentConfig.agentId}",
  name: "${deploymentConfig.agentName}",
  
  // AI Models & Actions
  models: ${JSON.stringify(deploymentConfig.steps.actions.data?.models || [], null, 2)},
  actions: ${JSON.stringify(deploymentConfig.steps.actions.data?.assigned_actions || [], null, 2)},
  
  // System Connectors
  connectors: ${JSON.stringify(deploymentConfig.steps.connectors.data?.assigned_connectors || [], null, 2)},
  apiIntegrations: ${JSON.stringify(deploymentConfig.steps.connectors.data?.api_integrations || [], null, 2)},
  
  // Knowledge Base
  knowledgeBase: ${JSON.stringify(deploymentConfig.steps.knowledgeBase.data?.knowledge_bases || [], null, 2)},
  
  // Voice Configuration
  voice: ${JSON.stringify(deploymentConfig.steps.voiceConfig.data || {}, null, 2)},
  
  // Canvas & Branding
  branding: ${JSON.stringify(deploymentConfig.steps.canvas.data || {}, null, 2)}
};

// Channel Configuration
const channelConfig = {
  // Voice Channel
  voice: {
    enabled: ${deploymentConfig.steps.voiceConfig.status === 'completed'},
    provider: "${deploymentConfig.steps.voiceConfig.data?.provider || 'twilio'}",
    phoneNumber: "${deploymentConfig.steps.voiceConfig.data?.phoneNumber || '+1-555-0123'}"
  },
  
  // Web Chat Channel
  webchat: {
    enabled: true,
    genAI: true,
    knowledgeBase: ${deploymentConfig.steps.knowledgeBase.status === 'completed'}
  },
  
  // Email Channel
  email: {
    enabled: false,
    autoReply: true
  },
  
  // Scheduling Channel (if needed)
  scheduling: {
    enabled: false,
    calendar: "google",
    timeSlots: "30min"
  }
};

// Initialize Deployment
const deployment = new AgentDeployment(agentConfig, channelConfig);

// Deploy to Production
deployment.deploy({
  environment: 'production',
  scaling: 'auto',
  monitoring: true,
  logging: 'detailed'
});

// Single Channel Deployment (Web Chat)
deployment.deployToWebChat({
  widgetConfig: {
    theme: agentConfig.branding.primaryColor || '#007bff',
    position: 'bottom-right',
    greeting: \`Hello! I'm \${agentConfig.name}. How can I help you?\`,
    knowledgeBaseEnabled: channelConfig.webchat.knowledgeBase
  }
});

// Voice Channel Deployment
if (channelConfig.voice.enabled) {
  deployment.deployToVoice({
    provider: channelConfig.voice.provider,
    phoneNumber: channelConfig.voice.phoneNumber,
    voiceSettings: agentConfig.voice
  });
}

// Get deployment status
deployment.getStatus().then(status => {
  console.log('Deployment Status:', status);
});

export default deployment;
`;
  };

  const generateMultiAgentCode = () => {
    return `
// Multi-Agent Orchestration Deployment
import { MultiAgentDeployment } from '@/lib/multi-agent-deployment';

const multiAgentConfig = {
  orchestration: {
    type: 'intelligent_routing', // or 'round_robin', 'skill_based'
    routingRules: [
      {
        condition: 'intent.category === "technical"',
        agent: 'technical-support-agent'
      },
      {
        condition: 'intent.category === "sales"',
        agent: 'sales-agent'
      },
      {
        condition: 'default',
        agent: '${deploymentConfig?.agentId}'
      }
    ]
  },
  
  agents: [
    {
      id: '${deploymentConfig?.agentId}',
      name: '${deploymentConfig?.agentName}',
      role: 'primary',
      capabilities: ['general_support', 'knowledge_base'],
      channels: ['webchat', 'voice', 'email']
    },
    {
      id: 'technical-support-agent',
      name: 'Technical Support Specialist',
      role: 'specialized',
      capabilities: ['technical_support', 'troubleshooting'],
      channels: ['voice', 'webchat']
    },
    {
      id: 'sales-agent',
      name: 'Sales Assistant',
      role: 'specialized',
      capabilities: ['sales', 'product_info', 'pricing'],
      channels: ['webchat', 'email']
    }
  ],
  
  sharedResources: {
    knowledgeBase: ${JSON.stringify(deploymentConfig?.steps.knowledgeBase.data?.knowledge_bases || [], null, 2)},
    connectors: ${JSON.stringify(deploymentConfig?.steps.connectors.data?.assigned_connectors || [], null, 2)},
    apis: ${JSON.stringify(deploymentConfig?.steps.connectors.data?.api_integrations || [], null, 2)}
  }
};

// Initialize Multi-Agent Deployment
const multiDeployment = new MultiAgentDeployment(multiAgentConfig);

// Deploy to multiple channels
multiDeployment.deployToChannels({
  webchat: {
    intelligentRouting: true,
    agentHandoff: true,
    contextSharing: true
  },
  voice: {
    skillBasedRouting: true,
    voiceToAgentMapping: {
      'technical-support': 'male-voice',
      'sales': 'female-voice',
      'general': 'neutral-voice'
    }
  }
});

// Monitor multi-agent performance
multiDeployment.enableMonitoring({
  metrics: ['response_time', 'resolution_rate', 'customer_satisfaction'],
  alerting: true,
  dashboards: true
});

export default multiDeployment;
`;
  };

  const handleGenerateCode = () => {
    const code = selectedDeploymentType === 'single' 
      ? generateSingleAgentCode() 
      : generateMultiAgentCode();
    setGeneratedCode(code);
  };

  const downloadDeploymentCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deploymentConfig?.agentName}-${selectedDeploymentType}-agent-deployment.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  if (!deploymentConfig) return null;

  return (
    <div className="space-y-6">
      {/* Deployment Readiness Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Deployment Readiness: {deploymentConfig.agentName}
            </CardTitle>
            <Badge 
              variant={deploymentConfig.deploymentReadiness >= 80 ? "default" : "secondary"}
            >
              {deploymentConfig.deploymentReadiness}% Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={deploymentConfig.deploymentReadiness} className="mb-4" />
          
          {/* Configuration Steps Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.values(deploymentConfig.steps).map((step) => (
              <div key={step.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                {step.status === 'partial' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                {step.status === 'missing' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gaps and Recommendations */}
      {(deploymentConfig.gaps.length > 0 || deploymentConfig.recommendations.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deploymentConfig.gaps.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Missing Configuration:</div>
                  {deploymentConfig.gaps.map((gap, index) => (
                    <div key={index} className="text-sm">• {gap}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {deploymentConfig.recommendations.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Recommendations:</div>
                  {deploymentConfig.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm">• {rec}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Configuration Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Configuration Overview</TabsTrigger>
          <TabsTrigger value="ai-models">AI Models & Actions</TabsTrigger>
          <TabsTrigger value="connectors">Connectors & APIs</TabsTrigger>
          <TabsTrigger value="channels">Channel Assignment</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Code</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(deploymentConfig.steps).map(([key, step]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {step.status === 'partial' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {step.status === 'missing' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {step.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {step.status === 'completed' && 'Configuration complete and ready for deployment'}
                    {step.status === 'partial' && 'Basic configuration present, additional setup recommended'}
                    {step.status === 'missing' && 'Configuration required for full functionality'}
                  </div>
                  {step.data && typeof step.data === 'object' && (
                    <div className="mt-2 text-xs">
                      {Object.keys(step.data).length > 0 ? (
                        <div>
                          {Object.keys(step.data).slice(0, 3).map(key => (
                            <div key={key}>• {key}: {Array.isArray(step.data[key]) ? `${step.data[key].length} items` : 'configured'}</div>
                          ))}
                          {Object.keys(step.data).length > 3 && <div>• ... and more</div>}
                        </div>
                      ) : (
                        <div>No configuration data available</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-models">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Models & Actions Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deploymentConfig.steps.actions.data ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Configured Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(deploymentConfig.steps.actions.data.assigned_actions || []).map((action: any, index: number) => (
                        <div key={index} className="p-2 bg-muted rounded flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          <span className="text-sm">{action.name || `Action ${index + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {deploymentConfig.steps.actions.data.configurations?.ai_models && (
                    <div>
                      <h4 className="font-medium mb-2">AI Models</h4>
                      <div className="space-y-2">
                        {deploymentConfig.steps.actions.data.configurations.ai_models.map((model: any, index: number) => (
                          <div key={index} className="p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              <span className="text-sm font-medium">{model.name || 'AI Model'}</span>
                              <Badge variant="outline">{model.provider || 'Unknown'}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No AI models or actions configured yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                System Connectors & API Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deploymentConfig.steps.connectors.data ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">System Connectors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(deploymentConfig.steps.connectors.data.assigned_connectors || []).map((connector: any, index: number) => (
                        <div key={index} className="p-2 bg-muted rounded flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          <span className="text-sm">{connector.name || `Connector ${index + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">API Integrations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(deploymentConfig.steps.connectors.data.api_integrations || []).map((api: any, index: number) => (
                        <div key={index} className="p-2 bg-muted rounded flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-sm">{api.name || `API ${index + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No connectors or APIs configured yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Channel Assignment & Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">Web Chat</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Gen AI: {deploymentConfig.steps.actions.status === 'completed' ? 'Enabled' : 'Disabled'}</div>
                      <div>Knowledge Base: {deploymentConfig.steps.knowledgeBase.status === 'completed' ? 'Connected' : 'Not Connected'}</div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">Voice Call</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Status: {deploymentConfig.steps.voiceConfig.status === 'completed' ? 'Ready' : 'Not Configured'}</div>
                      <div>Provider: {deploymentConfig.steps.voiceConfig.data?.provider || 'None'}</div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg opacity-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">Scheduling</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Status: Available</div>
                      <div>Calendar: Not Connected</div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg opacity-50">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="h-4 w-4" />
                      <span className="font-medium">Uber Integration</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Status: Available</div>
                      <div>API: Not Connected</div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Additional channels (Scheduling, Uber) can be enabled through the Enhanced Channel Matrix configuration.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Deployment Code Generation
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDeploymentType(selectedDeploymentType === 'single' ? 'multi' : 'single')}
                >
                  {selectedDeploymentType === 'single' ? 'Switch to Multi-Agent' : 'Switch to Single Agent'}
                </Button>
                <Button onClick={handleGenerateCode}>
                  Generate Code
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {generatedCode ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadDeploymentCode}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                    <pre>{generatedCode}</pre>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This code can be deployed anywhere - web applications, mobile apps, or server environments. 
                      The agent configuration flows seamlessly from all previous setup steps.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Click "Generate Code" to create deployment snippets</p>
                  <Button onClick={handleGenerateCode}>
                    Generate {selectedDeploymentType === 'single' ? 'Single' : 'Multi'} Agent Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentFlowManager;
