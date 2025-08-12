import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Steps component removed for now
import { 
  Workflow, Sparkles, Bot, Play, CheckCircle, Settings, 
  Users, MessageCircle, Monitor, ArrowRight, Download,
  Save, Eye, Rocket, TestTube, RotateCcw
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useNavigate } from 'react-router-dom';
import { 
  CustomerJourneyBuilder, 
  AIWorkflowGenerator, 
  NoCodeAgentConfigurator,
  IntegratedWorkflowBuilder 
} from '@/components/workflow-builder';
import { useAgentPersistence } from '@/hooks/useAgentPersistence';

interface WorkflowStudioState {
  currentStep: number;
  workflow: any;
  agentConfiguration: any;
  generatedCode: string;
  deploymentConfig: any;
}

const AgentWorkflowStudio: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useMasterToast();
  const { saveAgentSession, deployAgent } = useAgentPersistence();
  
  const [studioState, setStudioState] = useState<WorkflowStudioState>({
    currentStep: 0,
    workflow: null,
    agentConfiguration: null,
    generatedCode: '',
    deploymentConfig: null
  });

  const [activeTab, setActiveTab] = useState('generator');
  const [isDeploying, setIsDeploying] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Workflow generation complete
  const handleWorkflowGenerated = (workflow: any) => {
    setStudioState(prev => ({ ...prev, workflow, currentStep: 1 }));
    setActiveTab('configurator');
    showSuccess('Workflow generated! Now configure your agent.');
  };

  // Agent configuration complete
  const handleConfigurationComplete = (config: any, code: string) => {
    setStudioState(prev => ({ 
      ...prev, 
      agentConfiguration: config, 
      generatedCode: code,
      currentStep: 2 
    }));
    setActiveTab('review');
    showSuccess('Agent configured! Ready for review and testing.');
  };

  // Deploy agent
  const handleDeploy = async () => {
    if (!studioState.workflow || !studioState.agentConfiguration) {
      showError('Please complete workflow and configuration first');
      return;
    }

    setIsDeploying(true);
    
    try {
      // Save agent session with all workflow data
      const sessionData = {
        name: studioState.agentConfiguration.basic.name,
        description: studioState.agentConfiguration.basic.description,
        canvas: {
          workflow_steps: studioState.workflow.nodes,
          workflow_edges: studioState.workflow.edges,
          configuration: studioState.agentConfiguration
        },
        actions: {
          capabilities: studioState.agentConfiguration.capabilities,
          channels: studioState.agentConfiguration.channels
        },
        deployment: studioState.agentConfiguration.deployment
      };

      await saveAgentSession(sessionData);
      
      // Deploy with configuration
      await deployAgent(studioState.agentConfiguration.deployment);
      
      setStudioState(prev => ({ ...prev, currentStep: 3 }));
      showSuccess('Agent deployed successfully!');
      
      // Navigate to agent management
      setTimeout(() => {
        navigate('/agents');
      }, 2000);
      
    } catch (error) {
      showError('Deployment failed. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  // Test configuration
  const handleTest = () => {
    if (!studioState.agentConfiguration) {
      showError('Please complete configuration first');
      return;
    }

    // Simulate testing
    showSuccess('Test environment launched! Check the preview panel.');
    setPreviewMode(true);
  };

  // Reset workflow studio
  const handleReset = () => {
    setStudioState({
      currentStep: 0,
      workflow: null,
      agentConfiguration: null,
      generatedCode: '',
      deploymentConfig: null
    });
    setActiveTab('generator');
    setPreviewMode(false);
  };

  const steps = [
    { title: 'Generate Workflow', description: 'Create customer journey with AI', icon: Sparkles },
    { title: 'Configure Agent', description: 'Set up AI agent capabilities', icon: Settings },
    { title: 'Review & Test', description: 'Test before deployment', icon: TestTube },
    { title: 'Deploy', description: 'Launch your agent', icon: Rocket }
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Workflow className="h-8 w-8 text-primary" />
              Agent Workflow Studio
              <Badge variant="secondary">AI-Powered</Badge>
            </h1>
            <p className="text-muted-foreground mt-2">
              Create, configure, and deploy AI agents through visual workflows - no coding required
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-1" />
              {previewMode ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = index === studioState.currentStep;
                const isCompleted = index < studioState.currentStep;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${isActive ? 'border-primary bg-primary text-primary-foreground' : ''}
                      ${isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-muted'}
                      ${!isActive && !isCompleted ? 'border-muted text-muted-foreground' : ''}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground mx-4" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{studioState.workflow ? '✓' : '—'}</div>
                <div className="text-xs text-muted-foreground">Workflow</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{studioState.agentConfiguration ? '✓' : '—'}</div>
                <div className="text-xs text-muted-foreground">Configuration</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{studioState.generatedCode ? '✓' : '—'}</div>
                <div className="text-xs text-muted-foreground">Code Generated</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">{studioState.currentStep >= 3 ? '✓' : '—'}</div>
                <div className="text-xs text-muted-foreground">Deployed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Workflow Builder
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {studioState.currentStep >= 2 && (
                      <>
                        <Button variant="outline" onClick={handleTest}>
                          <TestTube className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button 
                          onClick={handleDeploy}
                          disabled={isDeploying}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Rocket className="h-4 w-4 mr-1" />
                          {isDeploying ? 'Deploying...' : 'Deploy Agent'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                    <TabsTrigger 
                      value="generator" 
                      className="flex items-center gap-2"
                      disabled={studioState.currentStep > 1}
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Generator
                    </TabsTrigger>
              <TabsTrigger 
                value="builder" 
                className="flex items-center gap-2"
              >
                <Workflow className="h-4 w-4" />
                Integrated Builder
              </TabsTrigger>
                    <TabsTrigger 
                      value="configurator" 
                      className="flex items-center gap-2"
                      disabled={!studioState.workflow}
                    >
                      <Settings className="h-4 w-4" />
                      Agent Config
                    </TabsTrigger>
                    <TabsTrigger 
                      value="review" 
                      className="flex items-center gap-2"
                      disabled={!studioState.agentConfiguration}
                    >
                      <Monitor className="h-4 w-4" />
                      Review & Deploy
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="generator" className="p-6 min-h-[600px]">
                    <AIWorkflowGenerator 
                      onWorkflowGenerated={handleWorkflowGenerated}
                    />
                  </TabsContent>

                  <TabsContent value="builder" className="p-0 min-h-[600px]">
                    <IntegratedWorkflowBuilder 
                      initialWorkflow={studioState.workflow}
                      onSave={(workflow) => {
                        setStudioState(prev => ({ ...prev, workflow }));
                        showSuccess('Integrated workflow saved successfully!');
                      }}
                      onGenerateAgent={(workflow) => {
                        setStudioState(prev => ({ ...prev, workflow }));
                        setActiveTab('configurator');
                      }}
                      onTest={(testData) => {
                        showSuccess('Real-time testing completed!');
                        setPreviewMode(true);
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="configurator" className="p-6 min-h-[600px]">
                    <NoCodeAgentConfigurator 
                      workflow={studioState.workflow}
                      onConfigurationComplete={handleConfigurationComplete}
                      onPreview={(config) => {
                        showSuccess('Configuration preview ready!');
                        setPreviewMode(true);
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="review" className="p-6 min-h-[600px]">
                    <div className="space-y-6">
                      {/* Configuration Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Configuration Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {studioState.agentConfiguration && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="font-medium text-sm">Agent Details</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {studioState.agentConfiguration.basic.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {studioState.agentConfiguration.basic.description}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">Channels</h4>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(studioState.agentConfiguration.channels)
                                      .filter(([_, config]: [string, any]) => config.enabled)
                                      .map(([channel, _]) => (
                                        <Badge key={channel} variant="outline" className="text-xs">
                                          {channel}
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">AI Model</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {studioState.agentConfiguration.capabilities.nlpModel}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {studioState.agentConfiguration.capabilities.contextAwareness}% context awareness
                                  </p>
                                </div>
                              </div>

                              {/* Code Preview */}
                              {studioState.generatedCode && (
                                <div className="mt-6">
                                  <h4 className="font-medium text-sm mb-2">Generated Code Preview</h4>
                                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-32">
                                    <code>{studioState.generatedCode.substring(0, 300)}...</code>
                                  </pre>
                                  <Button variant="outline" size="sm" className="mt-2">
                                    <Download className="h-3 w-3 mr-1" />
                                    Download Full Code
                                  </Button>
                                </div>
                              )}

                              {/* Deployment Actions */}
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">Ready for deployment</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" onClick={handleTest}>
                                    <TestTube className="h-4 w-4 mr-1" />
                                    Test Configuration
                                  </Button>
                                  <Button 
                                    onClick={handleDeploy}
                                    disabled={isDeploying}
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    <Rocket className="h-4 w-4 mr-1" />
                                    {isDeploying ? 'Deploying...' : 'Deploy Now'}
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>

                      {/* Deployment Success */}
                      {studioState.currentStep >= 3 && (
                        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-6 w-6 text-green-600" />
                              <div>
                                <h3 className="font-semibold text-green-800 dark:text-green-200">
                                  Agent Deployed Successfully!
                                </h3>
                                <p className="text-sm text-green-600 dark:text-green-300">
                                  Your agent is now live and ready to handle customer interactions.
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate('/agents')}
                              >
                                <Monitor className="h-4 w-4 mr-1" />
                                View in Dashboard
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReset()}
                              >
                                <Sparkles className="h-4 w-4 mr-1" />
                                Create Another Agent
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('generator')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start New Workflow
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  disabled={!studioState.workflow}
                  onClick={() => setActiveTab('builder')}
                >
                  <Workflow className="h-4 w-4 mr-2" />
                  Edit Workflow
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate('/agents')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Agent Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Help & Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tips & Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>💡 Start with a clear use case for better AI generation</p>
                <p>🎯 Define specific touchpoints and decision points</p>
                <p>⚙️ Configure automation levels based on complexity</p>
                <p>🧪 Always test before deploying to production</p>
                <p>📊 Monitor performance after deployment</p>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            {previewMode && studioState.agentConfiguration && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded text-xs">
                    <p className="font-medium">Agent: {studioState.agentConfiguration.basic.name}</p>
                    <p className="text-muted-foreground mt-1">
                      {studioState.agentConfiguration.basic.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="font-medium">Status:</span> Ready to Deploy
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Channels:</span> {
                        Object.entries(studioState.agentConfiguration.channels)
                          .filter(([_, config]: [string, any]) => config.enabled)
                          .length
                      } enabled
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AgentWorkflowStudio;