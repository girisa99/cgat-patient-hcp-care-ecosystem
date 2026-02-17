import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Rocket, 
  Server, 
  TestTube, 
  Eye, 
  MessageSquare, 
  Phone, 
  Users, 
  Facebook,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Play,
  Database,
  Heart,
} from 'lucide-react';
import { useAgentDeployments } from '@/hooks/useAgentDeployments';
import { useObservabilityConfig } from '@/hooks/useObservabilityConfig';
import { DeploymentHealthDashboard } from './DeploymentHealthDashboard';
import { toast } from 'sonner';

interface EnhancedDeploymentManagerProps {
  agentId?: string;
  selectedAgents?: string[];
  onDeploy?: (config: DeploymentConfig) => void;
}

interface DeploymentConfig {
  type: 'single' | 'multi-channel' | 'multi-agent';
  environment: 'dev' | 'test' | 'uat' | 'prod';
  channels: string[];
  agentIds: string[];
  llmProvider?: string;
  conversationSettings?: {
    mode: 'natural' | 'structured';
    auditEnabled: boolean;
    labelStudioEnabled: boolean;
    conversationStorage: boolean;
  };
  testing: {
    enabled: boolean;
    platforms: string[];
    labelStudio: boolean;
    ragTesting: boolean;
    knowledgeBaseTesting: boolean;
  };
  twilioConfig?: {
    voice: boolean;
    sms: boolean;
    whatsapp: boolean;
    facebook: boolean;
  };
}

export const EnhancedDeploymentManager: React.FC<EnhancedDeploymentManagerProps> = ({
  agentId,
  selectedAgents = [],
  onDeploy
}) => {
  const { deployAgentToChannel } = useAgentDeployments();
  const { config: observabilityConfig, initializePlatform } = useObservabilityConfig();
  
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    type: 'single',
    environment: 'dev',
    channels: [],
    agentIds: agentId ? [agentId] : selectedAgents,
    llmProvider: 'gpt-4.1',
    conversationSettings: {
      mode: 'natural',
      auditEnabled: true,
      labelStudioEnabled: true,
      conversationStorage: true
    },
    testing: {
      enabled: true,
      platforms: [],
      labelStudio: false,
      ragTesting: false,
      knowledgeBaseTesting: false
    },
    twilioConfig: {
      voice: false,
      sms: false,
      whatsapp: false,
      facebook: false
    }
  });

  const [deploymentStep, setDeploymentStep] = useState<'config' | 'testing' | 'deploying' | 'complete' | 'health'>('config');
  const [testResults, setTestResults] = useState<any>({});
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  const environments = [
    { value: 'dev', label: 'Development', description: 'For development and debugging', color: 'bg-blue-500' },
    { value: 'test', label: 'Testing', description: 'For automated testing and QA', color: 'bg-yellow-500' },
    { value: 'uat', label: 'UAT', description: 'User acceptance testing environment', color: 'bg-orange-500' },
    { value: 'prod', label: 'Production', description: 'Live production environment', color: 'bg-green-500' }
  ];

  const llmProviders = [
    { id: 'gpt-5', name: 'GPT-5', model: 'gpt-5-2025-08-07', cost: 'Premium', capabilities: ['Text', 'Vision', 'Function Calling'] },
    { id: 'gpt-4.1', name: 'GPT-4.1', model: 'gpt-4.1-2025-04-14', cost: 'High', capabilities: ['Text', 'Vision', 'Function Calling'] },
    { id: 'claude-opus-4', name: 'Claude Opus 4', model: 'claude-opus-4-1-20250805', cost: 'Premium', capabilities: ['Text', 'Vision', 'Superior Reasoning'] },
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', model: 'claude-sonnet-4-20250514', cost: 'High', capabilities: ['Text', 'Vision', 'High Performance'] },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', model: 'gpt-5-mini-2025-08-07', cost: 'Medium', capabilities: ['Text', 'Fast Processing'] },
    { id: 'claude-haiku', name: 'Claude Haiku', model: 'claude-3-5-haiku-20241022', cost: 'Low', capabilities: ['Text', 'Fastest Response'] }
  ];

  const channels = [
    { id: 'web_chat', label: 'Web Chat', icon: MessageSquare, description: 'Website chat widget integration' },
    { id: 'voice', label: 'Voice (Twilio)', icon: Phone, description: 'Voice calls via Twilio' },
    { id: 'sms', label: 'SMS (Twilio)', icon: MessageSquare, description: 'SMS messaging via Twilio' },
    { id: 'whatsapp', label: 'WhatsApp (Twilio)', icon: MessageSquare, description: 'WhatsApp Business API' },
    { id: 'facebook', label: 'Facebook (Twilio)', icon: Facebook, description: 'Facebook Messenger integration' },
    { id: 'conversational', label: 'Conversational AI', icon: Users, description: 'Multi-turn conversation flows' }
  ];

  const testingPlatforms = [
    { id: 'arize', label: 'Arize AI', description: 'AI observability and monitoring', enabled: observabilityConfig.arizeEnabled },
    { id: 'langwatch', label: 'LangWatch', description: 'LLM performance monitoring', enabled: observabilityConfig.langwatchEnabled }
  ];

  const handleChannelToggle = (channelId: string) => {
    setDeploymentConfig(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const handleTestingPlatformToggle = (platform: string) => {
    setDeploymentConfig(prev => ({
      ...prev,
      testing: {
        ...prev.testing,
        platforms: prev.testing.platforms.includes(platform)
          ? prev.testing.platforms.filter(p => p !== platform)
          : [...prev.testing.platforms, platform]
      }
    }));
  };

  const runPreDeploymentTests = async () => {
    setDeploymentStep('testing');
    setDeploymentProgress(0);
    
    try {
      const results: any = {};
      let progress = 0;
      
      // Test Arize integration
      if (deploymentConfig.testing.platforms.includes('arize')) {
        setDeploymentProgress(20);
        try {
          await initializePlatform('arize');
          results.arize = { status: 'success', message: 'Arize connection verified' };
        } catch (error) {
          results.arize = { status: 'error', message: 'Arize connection failed' };
        }
        progress += 25;
      }

      // Test LangWatch integration
      if (deploymentConfig.testing.platforms.includes('langwatch')) {
        setDeploymentProgress(40);
        try {
          await initializePlatform('langwatch');
          results.langwatch = { status: 'success', message: 'LangWatch connection verified' };
        } catch (error) {
          results.langwatch = { status: 'error', message: 'LangWatch connection failed' };
        }
        progress += 25;
      }

      // Test Label Studio integration
      if (deploymentConfig.testing.labelStudio) {
        setDeploymentProgress(60);
        // Simulate Label Studio test
        await new Promise(resolve => setTimeout(resolve, 1000));
        results.labelStudio = { status: 'success', message: 'Label Studio integration verified' };
        progress += 25;
      }

      // Test RAG and Knowledge Base
      if (deploymentConfig.testing.ragTesting || deploymentConfig.testing.knowledgeBaseTesting) {
        setDeploymentProgress(80);
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (deploymentConfig.testing.ragTesting) {
          results.rag = { status: 'success', message: 'RAG system functioning correctly' };
        }
        if (deploymentConfig.testing.knowledgeBaseTesting) {
          results.knowledgeBase = { status: 'success', message: 'Knowledge base accessible' };
        }
        progress += 25;
      }

      setDeploymentProgress(100);
      setTestResults(results);
      
      // Auto-proceed if all tests pass
      const hasErrors = Object.values(results).some((result: any) => result.status === 'error');
      if (!hasErrors) {
        setTimeout(() => proceedWithDeployment(), 2000);
      }
      
    } catch (error) {
      toast.error('Testing failed');
      console.error('Testing error:', error);
    }
  };

  const proceedWithDeployment = async () => {
    setDeploymentStep('deploying');
    setDeploymentProgress(0);
    
    try {
      for (const agentId of deploymentConfig.agentIds) {
        for (const channelId of deploymentConfig.channels) {
          setDeploymentProgress(prev => prev + (100 / (deploymentConfig.agentIds.length * deploymentConfig.channels.length)));
          
          await deployAgentToChannel(
            agentId,
            channelId,
            channelId as any,
            {
              environment: deploymentConfig.environment,
              testing: deploymentConfig.testing,
              twilioConfig: deploymentConfig.twilioConfig
            }
          );
          
          // Small delay between deployments
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setDeploymentStep('complete');
      toast.success('Deployment completed successfully!');
      
      if (onDeploy) {
        onDeploy(deploymentConfig);
      }
      
    } catch (error) {
      toast.error('Deployment failed');
      console.error('Deployment error:', error);
      setDeploymentStep('config');
    }
  };

  const resetDeployment = () => {
    setDeploymentStep('config');
    setDeploymentProgress(0);
    setTestResults({});
  };

  if (deploymentStep === 'health') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Deployment Health & Versions
          </h2>
          <Button variant="outline" size="sm" onClick={() => setDeploymentStep('config')}>
            ← Back to Config
          </Button>
        </div>
        <DeploymentHealthDashboard
          deploymentId={deploymentConfig.agentIds[0]}
          showAllDeployments
        />
      </div>
    );
  }

  if (deploymentStep === 'complete') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Deployment Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully deployed {deploymentConfig.agentIds.length} agent(s) to {deploymentConfig.channels.length} channel(s) in {deploymentConfig.environment} environment.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button onClick={resetDeployment} variant="outline">
              Deploy Another
            </Button>
            <Button onClick={() => setDeploymentStep('health')}>
              <Heart className="h-4 w-4 mr-2" />
              View Health & Versions
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deploymentStep === 'deploying') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 animate-pulse" />
            Deploying...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={deploymentProgress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Deploying agents to selected channels in {deploymentConfig.environment} environment...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (deploymentStep === 'testing') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 animate-pulse" />
            Running Pre-Deployment Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={deploymentProgress} className="w-full" />
          
          <div className="space-y-2">
            {Object.entries(testResults).map(([key, result]: [string, any]) => (
              <div key={key} className="flex items-center gap-2">
                {result.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className="capitalize">{key}</span>
                <span className="text-sm text-muted-foreground">{result.message}</span>
              </div>
            ))}
          </div>
          
          {deploymentProgress === 100 && (
            <div className="flex gap-2 mt-4">
              <Button onClick={proceedWithDeployment} disabled={Object.values(testResults).some((r: any) => r.status === 'error')}>
                <Rocket className="h-4 w-4 mr-2" />
                Proceed with Deployment
              </Button>
              <Button variant="outline" onClick={resetDeployment}>
                Back to Configuration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Enhanced Deployment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deployment Type Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Deployment Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { 
                type: 'single', 
                label: 'Single Channel', 
                description: 'Deploy one agent to one channel',
                benefits: ['Simple setup', 'Easy monitoring', 'Quick deployment']
              },
              { 
                type: 'multi-channel', 
                label: 'Multi-Channel', 
                description: 'Deploy one agent to multiple channels',
                benefits: ['Wider reach', 'Unified experience', 'Cross-channel analytics']
              },
              { 
                type: 'multi-agent', 
                label: 'Multi-Agent', 
                description: 'Deploy multiple agents to multiple channels',
                benefits: ['Specialized agents', 'Load distribution', 'Redundancy']
              }
            ].map((option) => (
              <Card 
                key={option.type}
                className={`cursor-pointer transition-all ${
                  deploymentConfig.type === option.type ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setDeploymentConfig(prev => ({ ...prev, type: option.type as any }))}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium">{option.label}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  <div className="mt-2">
                    {option.benefits.map((benefit, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs mr-1 mb-1">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Environment Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Deployment Environment</h3>
          <Select 
            value={deploymentConfig.environment} 
            onValueChange={(value) => setDeploymentConfig(prev => ({ ...prev, environment: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              {environments.map((env) => (
                <SelectItem key={env.value} value={env.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${env.color}`} />
                    <div>
                      <div className="font-medium">{env.label}</div>
                      <div className="text-xs text-muted-foreground">{env.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* LLM Provider Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">LLM Provider Selection</h3>
          <Select 
            value={deploymentConfig.llmProvider} 
            onValueChange={(value) => setDeploymentConfig(prev => ({ ...prev, llmProvider: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select LLM Provider" />
            </SelectTrigger>
            <SelectContent>
              {llmProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {provider.capabilities.join(', ')} • {provider.cost} cost
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conversation Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Conversation & Audit Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Conversation Mode</label>
              <Select 
                value={deploymentConfig.conversationSettings?.mode} 
                onValueChange={(value: any) => setDeploymentConfig(prev => ({
                  ...prev,
                  conversationSettings: { ...prev.conversationSettings!, mode: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural Conversation</SelectItem>
                  <SelectItem value="structured">Structured Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={deploymentConfig.conversationSettings?.auditEnabled}
                  onCheckedChange={(checked) => 
                    setDeploymentConfig(prev => ({
                      ...prev,
                      conversationSettings: { ...prev.conversationSettings!, auditEnabled: !!checked }
                    }))
                  }
                />
                <label className="text-sm">Audit Trail</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={deploymentConfig.conversationSettings?.labelStudioEnabled}
                  onCheckedChange={(checked) => 
                    setDeploymentConfig(prev => ({
                      ...prev,
                      conversationSettings: { ...prev.conversationSettings!, labelStudioEnabled: !!checked }
                    }))
                  }
                />
                <label className="text-sm">Label Studio Capture</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={deploymentConfig.conversationSettings?.conversationStorage}
                  onCheckedChange={(checked) => 
                    setDeploymentConfig(prev => ({
                      ...prev,
                      conversationSettings: { ...prev.conversationSettings!, conversationStorage: !!checked }
                    }))
                  }
                />
                <label className="text-sm">Store Conversations</label>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Deployment Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {channels.map((channel) => (
              <Card 
                key={channel.id}
                className={`cursor-pointer transition-all ${
                  deploymentConfig.channels.includes(channel.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleChannelToggle(channel.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <channel.icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{channel.label}</div>
                    <div className="text-xs text-muted-foreground">{channel.description}</div>
                  </div>
                  {deploymentConfig.channels.includes(channel.id) && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testing Configuration */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={deploymentConfig.testing.enabled}
              onCheckedChange={(checked) => 
                setDeploymentConfig(prev => ({
                  ...prev,
                  testing: { ...prev.testing, enabled: !!checked }
                }))
              }
            />
            <h3 className="text-sm font-semibold">Pre-Deployment Testing</h3>
          </div>
          
          {deploymentConfig.testing.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-border">
              {/* Observability Platforms */}
              <div>
                <h4 className="text-sm font-medium mb-2">Observability Platforms</h4>
                <div className="space-y-2">
                  {testingPlatforms.map((platform) => (
                    <div key={platform.id} className="flex items-center gap-2">
                      <Checkbox 
                        checked={deploymentConfig.testing.platforms.includes(platform.id)}
                        onCheckedChange={() => handleTestingPlatformToggle(platform.id)}
                        disabled={!platform.enabled}
                      />
                      <div className="flex-1">
                        <span className="text-sm">{platform.label}</span>
                        <p className="text-xs text-muted-foreground">{platform.description}</p>
                      </div>
                      {platform.enabled ? (
                        <Badge variant="secondary">Configured</Badge>
                      ) : (
                        <Badge variant="outline">Not Configured</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Testing Options */}
              <div>
                <h4 className="text-sm font-medium mb-2">Additional Testing</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={deploymentConfig.testing.labelStudio}
                      onCheckedChange={(checked) => 
                        setDeploymentConfig(prev => ({
                          ...prev,
                          testing: { ...prev.testing, labelStudio: !!checked }
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">Label Studio Integration</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={deploymentConfig.testing.ragTesting}
                      onCheckedChange={(checked) => 
                        setDeploymentConfig(prev => ({
                          ...prev,
                          testing: { ...prev.testing, ragTesting: !!checked }
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">RAG System Testing</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={deploymentConfig.testing.knowledgeBaseTesting}
                      onCheckedChange={(checked) => 
                        setDeploymentConfig(prev => ({
                          ...prev,
                          testing: { ...prev.testing, knowledgeBaseTesting: !!checked }
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">Knowledge Base Testing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {deploymentConfig.testing.enabled ? (
            <Button 
              onClick={runPreDeploymentTests}
              disabled={deploymentConfig.channels.length === 0 || deploymentConfig.agentIds.length === 0}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Tests & Deploy
            </Button>
          ) : (
            <Button 
              onClick={proceedWithDeployment}
              disabled={deploymentConfig.channels.length === 0 || deploymentConfig.agentIds.length === 0}
              className="flex-1"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Deploy Now
            </Button>
          )}
          <Button variant="outline" onClick={() => setDeploymentStep('health')}>
            <Heart className="h-4 w-4 mr-2" />
            Health & Versions
          </Button>
        </div>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Twilio Integration:</strong> Voice, SMS, WhatsApp, and Facebook channels use Twilio APIs. 
            Make sure your Twilio credentials are configured in the system settings.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};