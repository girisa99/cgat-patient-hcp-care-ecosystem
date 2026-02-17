import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Bot, Settings, MessageCircle, Brain, Zap, Shield, 
  Monitor, Database, Code, Palette, CheckCircle, 
  AlertTriangle, Clock, Users, Play, Save, Download,
  Sparkles, Workflow, Phone, Mail, Calendar
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AgentConfiguration {
  basic: {
    name: string;
    description: string;
    personality: string;
    responseStyle: string;
    language: string;
    timezone: string;
  };
  capabilities: {
    nlpModel: string;
    conversationMemory: boolean;
    multiLanguage: boolean;
    contextAwareness: number;
    learningEnabled: boolean;
    customIntents: string[];
  };
  channels: {
    webChat: { enabled: boolean; settings: any };
    voice: { enabled: boolean; settings: any };
    email: { enabled: boolean; settings: any };
    sms: { enabled: boolean; settings: any };
  };
  automation: {
    autoResponses: boolean;
    escalationRules: any[];
    workingHours: any;
    fallbackBehavior: string;
    confidenceThreshold: number;
  };
  integration: {
    databases: string[];
    apis: string[];
    webhooks: string[];
    authentication: string;
  };
  deployment: {
    environment: string;
    scalingMode: string;
    monitoring: boolean;
    logging: boolean;
    security: any;
  };
}

interface NoCodeAgentConfiguratorProps {
  workflow?: any;
  onConfigurationComplete?: (config: AgentConfiguration, code: string) => void;
  onPreview?: (config: AgentConfiguration) => void;
}

export const NoCodeAgentConfigurator: React.FC<NoCodeAgentConfiguratorProps> = ({
  workflow,
  onConfigurationComplete,
  onPreview
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [configuration, setConfiguration] = useState<AgentConfiguration>({
    basic: {
      name: workflow?.name || 'New AI Agent',
      description: workflow?.description || '',
      personality: 'professional',
      responseStyle: 'concise',
      language: 'en',
      timezone: 'UTC'
    },
    capabilities: {
      nlpModel: 'gpt-4o-mini',
      conversationMemory: true,
      multiLanguage: false,
      contextAwareness: 80,
      learningEnabled: true,
      customIntents: []
    },
    channels: {
      webChat: { enabled: true, settings: {} },
      voice: { enabled: false, settings: {} },
      email: { enabled: false, settings: {} },
      sms: { enabled: false, settings: {} }
    },
    automation: {
      autoResponses: true,
      escalationRules: [],
      workingHours: { enabled: false },
      fallbackBehavior: 'human_handoff',
      confidenceThreshold: 75
    },
    integration: {
      databases: [],
      apis: [],
      webhooks: [],
      authentication: 'api_key'
    },
    deployment: {
      environment: 'production',
      scalingMode: 'auto',
      monitoring: true,
      logging: true,
      security: { encryption: true, rls: true }
    }
  });

  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  // Update configuration from workflow data
  useEffect(() => {
    if (workflow) {
      // Extract channel preferences from workflow nodes
      const touchpoints = workflow.nodes?.filter((node: any) => node.type === 'touchpoint') || [];
      
      setConfiguration(prev => {
        const channels = { ...prev.channels };
        
        touchpoints.forEach((touchpoint: any) => {
          if (touchpoint.data?.channel) {
            const channelKey = touchpoint.data.channel === 'chat' ? 'webChat' : touchpoint.data.channel;
            if (channels[channelKey as keyof typeof channels]) {
              channels[channelKey as keyof typeof channels].enabled = true;
            }
          }
        });

        return {
          ...prev,
          basic: {
            ...prev.basic,
            name: workflow.name || prev.basic.name,
            description: workflow.description || prev.basic.description
          },
          channels
        };
      });
    }
  }, [workflow]);

  // Generate agent code based on configuration
  const generateAgentCode = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate code generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const code = `
// Generated AI Agent Configuration
// Auto-generated on ${new Date().toISOString()}

import { createAgent } from '@/lib/agent-framework';

const ${configuration.basic.name.replace(/\s+/g, '')}Agent = createAgent({
  // Basic Configuration
  name: "${configuration.basic.name}",
  description: "${configuration.basic.description}",
  personality: "${configuration.basic.personality}",
  responseStyle: "${configuration.basic.responseStyle}",
  
  // AI Capabilities
  nlp: {
    model: "${configuration.capabilities.nlpModel}",
    contextAwareness: ${configuration.capabilities.contextAwareness / 100},
    conversationMemory: ${configuration.capabilities.conversationMemory},
    multiLanguage: ${configuration.capabilities.multiLanguage}
  },
  
  // Channel Configuration
  channels: {
    webChat: {
      enabled: ${configuration.channels.webChat.enabled},
      settings: {
        theme: "modern",
        position: "bottom-right",
        greeting: "Hello! How can I help you today?"
      }
    },
    voice: {
      enabled: ${configuration.channels.voice.enabled},
      settings: {
        provider: "elevenlabs",
        voice: "professional"
      }
    }
  },
  
  // Automation Rules
  automation: {
    autoResponses: ${configuration.automation.autoResponses},
    confidenceThreshold: ${configuration.automation.confidenceThreshold / 100},
    fallbackBehavior: "${configuration.automation.fallbackBehavior}",
    workingHours: ${JSON.stringify(configuration.automation.workingHours)}
  },
  
  // Integration
  integrations: {
    database: {
      enabled: ${configuration.integration.databases.length > 0},
      connections: ${JSON.stringify(configuration.integration.databases)}
    },
    apis: ${JSON.stringify(configuration.integration.apis)},
    webhooks: ${JSON.stringify(configuration.integration.webhooks)}
  },
  
  // Deployment
  deployment: {
    environment: "${configuration.deployment.environment}",
    scaling: "${configuration.deployment.scalingMode}",
    monitoring: ${configuration.deployment.monitoring},
    security: ${JSON.stringify(configuration.deployment.security)}
  }
});

// Export for deployment
export default ${configuration.basic.name.replace(/\s+/g, '')}Agent;

// Deployment function
export const deploy${configuration.basic.name.replace(/\s+/g, '')}Agent = async () => {
  try {
    const deployment = await ${configuration.basic.name.replace(/\s+/g, '')}Agent.deploy();
    console.log('Agent deployed successfully:', deployment);
    return deployment;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
};
`;

      setGeneratedCode(code);
      showSuccess('Agent code generated successfully!');
      
    } catch (error) {
      showError('Failed to generate agent code');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update configuration helper
  const updateConfig = (section: keyof AgentConfiguration, updates: any) => {
    setConfiguration(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  // Complete configuration and pass to parent
  const handleComplete = () => {
    if (onConfigurationComplete && generatedCode) {
      onConfigurationComplete(configuration, generatedCode);
    }
    showSuccess('Agent configuration completed!');
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(configuration);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              No-Code Agent Configurator
              <Badge variant="secondary">Visual Builder</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePreview}>
                <Play className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button 
                onClick={generateAgentCode}
                disabled={isGenerating}
                variant="outline"
              >
                <Code className="h-4 w-4 mr-1" />
                {isGenerating ? 'Generating...' : 'Generate Code'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="capabilities" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                Integration
              </TabsTrigger>
              <TabsTrigger value="deployment" className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                Deploy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input
                      id="agent-name"
                      value={configuration.basic.name}
                      onChange={(e) => updateConfig('basic', { name: e.target.value })}
                      placeholder="Enter agent name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={configuration.basic.description}
                      onChange={(e) => updateConfig('basic', { description: e.target.value })}
                      placeholder="Describe what your agent does"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="personality">Personality</Label>
                    <Select 
                      value={configuration.basic.personality} 
                      onValueChange={(value) => updateConfig('basic', { personality: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="helpful">Helpful</SelectItem>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="empathetic">Empathetic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="response-style">Response Style</Label>
                    <Select 
                      value={configuration.basic.responseStyle} 
                      onValueChange={(value) => updateConfig('basic', { responseStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Primary Language</Label>
                    <Select 
                      value={configuration.basic.language} 
                      onValueChange={(value) => updateConfig('basic', { language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={configuration.basic.timezone} 
                      onValueChange={(value) => updateConfig('basic', { timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="CST">Central Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nlp-model">AI Model</Label>
                    <Select 
                      value={configuration.capabilities.nlpModel} 
                      onValueChange={(value) => updateConfig('capabilities', { nlpModel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o (Most Capable)</SelectItem>
                        <SelectItem value="claude-3">Claude 3 (Great Reasoning)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Context Awareness: {configuration.capabilities.contextAwareness}%</Label>
                    <Slider
                      value={[configuration.capabilities.contextAwareness]}
                      onValueChange={([value]) => updateConfig('capabilities', { contextAwareness: value })}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values improve conversation continuity but use more resources
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="memory">Conversation Memory</Label>
                      <p className="text-xs text-muted-foreground">Remember conversation history</p>
                    </div>
                    <Switch
                      id="memory"
                      checked={configuration.capabilities.conversationMemory}
                      onCheckedChange={(checked) => updateConfig('capabilities', { conversationMemory: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="multilang">Multi-Language</Label>
                      <p className="text-xs text-muted-foreground">Support multiple languages</p>
                    </div>
                    <Switch
                      id="multilang"
                      checked={configuration.capabilities.multiLanguage}
                      onCheckedChange={(checked) => updateConfig('capabilities', { multiLanguage: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="learning">Learning Enabled</Label>
                      <p className="text-xs text-muted-foreground">Improve from interactions</p>
                    </div>
                    <Switch
                      id="learning"
                      checked={configuration.capabilities.learningEnabled}
                      onCheckedChange={(checked) => updateConfig('capabilities', { learningEnabled: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">Web Chat</span>
                    </div>
                    <Switch
                      checked={configuration.channels.webChat.enabled}
                      onCheckedChange={(checked) => 
                        updateConfig('channels', { 
                          webChat: { ...configuration.channels.webChat, enabled: checked }
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Website chat widget integration
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium text-sm">Voice</span>
                    </div>
                    <Switch
                      checked={configuration.channels.voice.enabled}
                      onCheckedChange={(checked) => 
                        updateConfig('channels', { 
                          voice: { ...configuration.channels.voice, enabled: checked }
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Phone and voice interactions
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium text-sm">Email</span>
                    </div>
                    <Switch
                      checked={configuration.channels.email.enabled}
                      onCheckedChange={(checked) => 
                        updateConfig('channels', { 
                          email: { ...configuration.channels.email, enabled: checked }
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email-based interactions
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">SMS</span>
                    </div>
                    <Switch
                      checked={configuration.channels.sms.enabled}
                      onCheckedChange={(checked) => 
                        updateConfig('channels', { 
                          sms: { ...configuration.channels.sms, enabled: checked }
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Text message interactions
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-response">Auto Responses</Label>
                      <p className="text-xs text-muted-foreground">Automatically respond to common queries</p>
                    </div>
                    <Switch
                      id="auto-response"
                      checked={configuration.automation.autoResponses}
                      onCheckedChange={(checked) => updateConfig('automation', { autoResponses: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confidence Threshold: {configuration.automation.confidenceThreshold}%</Label>
                    <Slider
                      value={[configuration.automation.confidenceThreshold]}
                      onValueChange={([value]) => updateConfig('automation', { confidenceThreshold: value })}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum confidence before escalating to human
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fallback">Fallback Behavior</Label>
                    <Select 
                      value={configuration.automation.fallbackBehavior} 
                      onValueChange={(value) => updateConfig('automation', { fallbackBehavior: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="human_handoff">Transfer to Human</SelectItem>
                        <SelectItem value="apologize">Apologize and Ask Again</SelectItem>
                        <SelectItem value="provide_contact">Provide Contact Info</SelectItem>
                        <SelectItem value="schedule_callback">Schedule Callback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Database Connections</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="supabase" className="h-4 w-4" />
                      <Label htmlFor="supabase">Supabase (Current)</Label>
                      <Badge variant="secondary">Connected</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="postgres" className="h-4 w-4" />
                      <Label htmlFor="postgres">PostgreSQL</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">API Integrations</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="openai" className="h-4 w-4" />
                      <Label htmlFor="openai">OpenAI API</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="webhook" className="h-4 w-4" />
                      <Label htmlFor="webhook">Custom Webhooks</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deployment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select 
                      value={configuration.deployment.environment} 
                      onValueChange={(value) => updateConfig('deployment', { environment: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scaling">Scaling Mode</Label>
                    <Select 
                      value={configuration.deployment.scalingMode} 
                      onValueChange={(value) => updateConfig('deployment', { scalingMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto Scaling</SelectItem>
                        <SelectItem value="manual">Manual Scaling</SelectItem>
                        <SelectItem value="fixed">Fixed Resources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="monitoring">Monitoring</Label>
                      <p className="text-xs text-muted-foreground">Enable performance monitoring</p>
                    </div>
                    <Switch
                      id="monitoring"
                      checked={configuration.deployment.monitoring}
                      onCheckedChange={(checked) => updateConfig('deployment', { monitoring: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="logging">Logging</Label>
                      <p className="text-xs text-muted-foreground">Enable detailed logging</p>
                    </div>
                    <Switch
                      id="logging"
                      checked={configuration.deployment.logging}
                      onCheckedChange={(checked) => updateConfig('deployment', { logging: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Generated Code Preview */}
          {generatedCode && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Generated Code Preview
                </h3>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
              <pre className="text-xs overflow-auto max-h-64 bg-background p-3 rounded">
                <code>{generatedCode.substring(0, 500)}...</code>
              </pre>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Configuration ready</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setConfiguration(prev => ({ ...prev }))}>
                <Save className="h-4 w-4 mr-1" />
                Save Config
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={!generatedCode}
                className="bg-primary hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Complete Setup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};