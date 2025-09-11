import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Settings, 
  Zap, 
  TestTube, 
  Rocket, 
  Eye,
  Database,
  MessageSquare,
  Phone,
  Users,
  Shield,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Play,
  GitBranch,
  Network,
  Activity
} from 'lucide-react';

// Import existing components to avoid duplication
import { AgentEcosystemDashboard } from '@/components/agent-ecosystem/AgentEcosystemDashboard';
import { EnhancedDeploymentManager } from '@/components/deployment/EnhancedDeploymentManager';
import { ObservabilityDashboard } from '@/components/observability/ObservabilityDashboard';
import MCPDemoComponent from '@/components/MCPDemoComponent';
import { useAgents } from '@/hooks/useAgents';

interface ConsolidatedAgentDashboardProps {
  agentId?: string;
}

type DashboardStep = 'overview' | 'creation' | 'template' | 'environment' | 'testing' | 'deployment' | 'monitoring';

export const ConsolidatedAgentDashboard: React.FC<ConsolidatedAgentDashboardProps> = ({
  agentId
}) => {
  const [currentStep, setCurrentStep] = useState<DashboardStep>('overview');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(agentId ? [agentId] : []);
  const { agents } = useAgents();

  const steps = [
    { id: 'overview', label: 'Overview', icon: Activity, description: 'Agent ecosystem overview and status' },
    { id: 'creation', label: 'Agent Management', icon: Bot, description: 'Create and manage AI agents' },
    { id: 'template', label: 'Templates & Workflows', icon: GitBranch, description: 'Configure templates and workflows' },
    { id: 'environment', label: 'Environment & Channels', icon: Network, description: 'Assign environments and channels' },
    { id: 'testing', label: 'Testing & QA', icon: TestTube, description: 'Test with Arize and LangWatch' },
    { id: 'deployment', label: 'Deploy', icon: Rocket, description: 'Deploy agents to channels' },
    { id: 'monitoring', label: 'Monitor', icon: Eye, description: 'Monitor and analyze performance' }
  ];

  const getCurrentStepInfo = () => steps.find(step => step.id === currentStep);

  const getStepProgress = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'overview':
        return <AgentEcosystemDashboard agentId={agentId} />;
      
      case 'creation':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Agent Management Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Existing Agent Creation System</p>
                  <p className="text-muted-foreground mb-4">
                    Use the existing Agent Builder with Patient Enrollment Flow including:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                    <Badge variant="secondary">Consent Forms</Badge>
                    <Badge variant="secondary">Patient Info</Badge>
                    <Badge variant="secondary">Provider & Treatment</Badge>
                    <Badge variant="secondary">Insurance</Badge>
                    <Badge variant="secondary">Clinical & Treatment</Badge>
                    <Badge variant="secondary">PDF Generation</Badge>
                    <Badge variant="secondary">Digital Signature</Badge>
                    <Badge variant="secondary">Real-time Sync</Badge>
                  </div>
                  <Button onClick={() => window.location.href = '/agents'}>
                    Open Agent Builder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Templates & Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Templates */}
                <div>
                  <h3 className="font-semibold mb-3">Available Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium">Patient Enrollment Template</h4>
                        <p className="text-sm text-muted-foreground">Pre-configured with all enrollment sections</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">Consent</Badge>
                          <Badge variant="outline" className="text-xs">Patient</Badge>
                          <Badge variant="outline" className="text-xs">Provider</Badge>
                          <Badge variant="outline" className="text-xs">Insurance</Badge>
                          <Badge variant="outline" className="text-xs">Clinical</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium">Healthcare MCP Template</h4>
                        <p className="text-sm text-muted-foreground">Custom Healthcare Model Context Protocol</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">Clinical Decision</Badge>
                          <Badge variant="outline" className="text-xs">Compliance</Badge>
                          <Badge variant="outline" className="text-xs">Patient Records</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Integrations */}
                <div>
                  <h3 className="font-semibold mb-3">Active Integrations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Label Studio</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <Database className="h-4 w-4 text-green-500" />
                      <span className="text-sm">RAG System</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Healthcare MCP</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Knowledge Base</span>
                    </div>
                  </div>
                </div>

                {/* MCP Demo Access */}
                <div>
                  <h3 className="font-semibold mb-3">Model Context Protocol (MCP)</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Healthcare MCP Server</p>
                          <p className="text-sm text-muted-foreground">Custom implementation with clinical tools</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/mcp'}
                        >
                          Configure MCP
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'environment':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Environment & Channel Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Available Channels */}
                  <div>
                    <h3 className="font-semibold mb-3">Available Channels</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">ElevenLabs</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Voice & TTS</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Twilio</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Voice, SMS, WhatsApp</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">HuggingFace</span>
                        </div>
                        <p className="text-xs text-muted-foreground">ML Models</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="h-4 w-4 text-red-500" />
                          <span className="font-medium">Gemini</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Google AI</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">Vision Models</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Image Analysis</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">Small LMs</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Efficient Models</p>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Agent Configuration */}
                  <div>
                    <h3 className="font-semibold mb-3">Agent Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium">Single Channel</h4>
                          <p className="text-sm text-muted-foreground">One agent per channel</p>
                          <Badge variant="outline" className="mt-2">Recommended for specialized tasks</Badge>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium">Multi-Channel</h4>
                          <p className="text-sm text-muted-foreground">Multiple agents across channels</p>
                          <Badge variant="outline" className="mt-2">Best for complex workflows</Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'testing':
        return <ObservabilityDashboard />;

      case 'deployment':
        return <EnhancedDeploymentManager agentId={agentId} selectedAgents={selectedAgents} />;

      case 'monitoring':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Real-time Monitoring & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Arize AI Integration</h3>
                      <p className="text-sm text-muted-foreground mb-3">ML model monitoring and drift detection</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Model performance tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Data drift detection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Real-time alerts</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">LangWatch Integration</h3>
                      <p className="text-sm text-muted-foreground mb-3">LLM-native monitoring and optimization</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Conversation flow analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Prompt optimization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">LLM performance metrics</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Select a step to continue</div>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consolidated Agent Management</h1>
          <p className="text-muted-foreground">
            Complete agent lifecycle from creation to monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Workflow Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(getStepProgress())}% Complete
            </span>
          </div>
          <Progress value={getStepProgress()} className="mb-4" />
          
          {/* Step Navigation */}
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => {
              const currentIndex = steps.findIndex(s => s.id === currentStep);
              const isActive = step.id === currentStep;
              const isCompleted = index < currentIndex;
              const isAccessible = index <= currentIndex + 1;
              
              return (
                <Button
                  key={step.id}
                  variant={isActive ? 'default' : isCompleted ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => isAccessible && setCurrentStep(step.id as DashboardStep)}
                  disabled={!isAccessible}
                  className="flex items-center gap-2"
                >
                  <step.icon className="h-3 w-3" />
                  {step.label}
                  {isCompleted && <CheckCircle className="h-3 w-3" />}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getCurrentStepInfo()?.icon && React.createElement(getCurrentStepInfo()!.icon, { className: "h-5 w-5" })}
            {getCurrentStepInfo()?.label}
          </CardTitle>
          <p className="text-muted-foreground">{getCurrentStepInfo()?.description}</p>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {renderStepContent()}
      </div>

      {/* Navigation Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.id === currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1].id as DashboardStep);
                }
              }}
              disabled={steps.findIndex(s => s.id === currentStep) === 0}
            >
              Previous Step
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1].id as DashboardStep);
                  }
                }}
                disabled={steps.findIndex(s => s.id === currentStep) === steps.length - 1}
              >
                Next Step
                <Play className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
