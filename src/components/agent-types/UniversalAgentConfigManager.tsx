import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Brain, 
  FileText, 
  MessageSquare,
  Settings,
  Database,
  Eye,
  Mic,
  Phone,
  Mail,
  Users,
  Zap,
  Send
} from 'lucide-react';
import { ConversationManager } from '@/components/conversation/ConversationManager';
import { EnhancedDeploymentManager } from '@/components/deployment/EnhancedDeploymentManager';
import { UniversalVoiceInterface } from '@/components/voice/UniversalVoiceInterface';
import { toast } from 'sonner';

interface AgentTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: {
    conversational_ai: boolean;
    audit_trails: boolean;
    llm_selection: boolean;
    label_studio: boolean;
    multi_channel: boolean;
    voice_support: boolean;
    form_auto_fill: boolean;
    real_time_validation: boolean;
  };
  deployment_channels: string[];
  supported_outputs: string[];
}

const AGENT_TYPE_CONFIGS: AgentTypeConfig[] = [
  {
    id: 'conversational',
    name: 'Conversational AI',
    description: 'Natural language conversations with intelligent data extraction',
    icon: <Bot className="h-6 w-6" />,
    features: {
      conversational_ai: true,
      audit_trails: true,
      llm_selection: true,
      label_studio: true,
      multi_channel: true,
      voice_support: true,
      form_auto_fill: true,
      real_time_validation: true,
    },
    deployment_channels: ['web', 'mobile', 'voice', 'sms', 'whatsapp', 'facebook'],
    supported_outputs: ['database', 'api', 'email', 'sms', 'excel', 'pdf']
  },
  {
    id: 'structured',
    name: 'Structured AI',
    description: 'Step-by-step guided processes with AI assistance',
    icon: <Brain className="h-6 w-6" />,
    features: {
      conversational_ai: true,
      audit_trails: true,
      llm_selection: true,
      label_studio: true,
      multi_channel: true,
      voice_support: false,
      form_auto_fill: true,
      real_time_validation: true,
    },
    deployment_channels: ['web', 'mobile', 'email'],
    supported_outputs: ['database', 'api', 'email', 'excel']
  },
  {
    id: 'traditional_form',
    name: 'Traditional Forms',
    description: 'Classic web forms with basic validation',
    icon: <FileText className="h-6 w-6" />,
    features: {
      conversational_ai: false,
      audit_trails: true,
      llm_selection: false,
      label_studio: false,
      multi_channel: false,
      voice_support: false,
      form_auto_fill: false,
      real_time_validation: true,
    },
    deployment_channels: ['web'],
    supported_outputs: ['database', 'email', 'excel']
  },
  {
    id: 'fax',
    name: 'Fax Processing',
    description: 'Automated fax processing with OCR and data extraction',
    icon: <Send className="h-6 w-6" />,
    features: {
      conversational_ai: false,
      audit_trails: true,
      llm_selection: true,
      label_studio: true,
      multi_channel: false,
      voice_support: false,
      form_auto_fill: false,
      real_time_validation: false,
    },
    deployment_channels: ['fax'],
    supported_outputs: ['database', 'api', 'email']
  },
  {
    id: 'pdf',
    name: 'PDF Processing',
    description: 'Intelligent PDF form processing and field extraction',
    icon: <FileText className="h-6 w-6" />,
    features: {
      conversational_ai: false,
      audit_trails: true,
      llm_selection: true,
      label_studio: true,
      multi_channel: false,
      voice_support: false,
      form_auto_fill: false,
      real_time_validation: false,
    },
    deployment_channels: ['web', 'email'],
    supported_outputs: ['database', 'api', 'email', 'excel']
  }
];

interface UniversalAgentConfigManagerProps {
  onAgentTypeSelect?: (agentType: AgentTypeConfig) => void;
  selectedAgentType?: string;
}

export const UniversalAgentConfigManager: React.FC<UniversalAgentConfigManagerProps> = ({
  onAgentTypeSelect,
  selectedAgentType
}) => {
  const [activeTab, setActiveTab] = useState<'selection' | 'configuration' | 'deployment'>('selection');
  const [selectedConfig, setSelectedConfig] = useState<AgentTypeConfig | null>(
    selectedAgentType ? AGENT_TYPE_CONFIGS.find(c => c.id === selectedAgentType) || null : null
  );
  const [showConversationDemo, setShowConversationDemo] = useState(false);
  const [showVoiceDemo, setShowVoiceDemo] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);

  const handleAgentTypeSelect = (config: AgentTypeConfig) => {
    setSelectedConfig(config);
    setActiveTab('configuration');
    if (onAgentTypeSelect) {
      onAgentTypeSelect(config);
    }
    toast.success(`Selected agent type: ${config.name}`);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'web': return <Bot className="h-4 w-4" />;
      case 'mobile': return <Phone className="h-4 w-4" />;
      case 'facebook': return <Users className="h-4 w-4" />;
      case 'fax': return <Send className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const renderFeatureBadge = (feature: string, enabled: boolean) => (
    <Badge
      key={feature}
      variant={enabled ? "default" : "secondary"}
      className={`flex items-center gap-1 ${enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
    >
      {enabled ? '✓' : '✗'}
      {feature.replace(/_/g, ' ')}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Universal Agent Configuration</h2>
          <p className="text-muted-foreground">
            Configure different agent types with conversational AI, audit trails, and deployment options
          </p>
        </div>
        {selectedConfig && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-2">
              {selectedConfig.icon}
              {selectedConfig.name}
            </Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="selection">Agent Types</TabsTrigger>
          <TabsTrigger value="configuration" disabled={!selectedConfig}>Configuration</TabsTrigger>
          <TabsTrigger value="deployment" disabled={!selectedConfig}>Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="selection" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AGENT_TYPE_CONFIGS.map((config) => (
              <Card 
                key={config.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedConfig?.id === config.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleAgentTypeSelect(config)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {config.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{config.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(config.features).slice(0, 3).map(([feature, enabled]) => 
                          renderFeatureBadge(feature, enabled)
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Deployment Channels</h4>
                      <div className="flex flex-wrap gap-2">
                        {config.deployment_channels.slice(0, 3).map((channel) => (
                          <Badge key={channel} variant="outline" className="flex items-center gap-1">
                            {getChannelIcon(channel)}
                            {channel}
                          </Badge>
                        ))}
                        {config.deployment_channels.length > 3 && (
                          <Badge variant="outline">+{config.deployment_channels.length - 3} more</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          {selectedConfig && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {selectedConfig.icon}
                    {selectedConfig.name} Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Available Features</h3>
                      <div className="grid gap-2">
                        {Object.entries(selectedConfig.features).map(([feature, enabled]) => (
                          <div key={feature} className="flex items-center justify-between p-2 rounded border">
                            <span className="flex items-center gap-2">
                              {feature === 'conversational_ai' && <MessageSquare className="h-4 w-4" />}
                              {feature === 'audit_trails' && <Database className="h-4 w-4" />}
                              {feature === 'label_studio' && <Eye className="h-4 w-4" />}
                              {feature === 'voice_support' && <Mic className="h-4 w-4" />}
                              <span className="text-sm">{feature.replace(/_/g, ' ')}</span>
                            </span>
                            <Badge variant={enabled ? "default" : "secondary"}>
                              {enabled ? 'Available' : 'Not Available'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Deployment Channels</h3>
                      <div className="grid gap-2">
                        {selectedConfig.deployment_channels.map((channel) => (
                          <div key={channel} className="flex items-center gap-2 p-2 rounded border">
                            {getChannelIcon(channel)}
                            <span className="text-sm capitalize">{channel}</span>
                            <Badge variant="outline" className="ml-auto">Available</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-3">Output Formats</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedConfig.supported_outputs.map((output) => (
                        <Badge key={output} variant="outline" className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {output}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedConfig.features.conversational_ai && (
                <Card>
                  <CardHeader>
                    <CardTitle>Conversational AI Demo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-muted-foreground">
                        Experience the conversational AI capabilities with audit trails and data capture
                      </p>
                      <Button
                        onClick={() => setShowConversationDemo(!showConversationDemo)}
                        variant="outline"
                      >
                        {showConversationDemo ? 'Hide Demo' : 'Try Demo'}
                      </Button>
                    </div>
                    
                    {showConversationDemo && (
                      <div className="border rounded-lg p-4">
                        <ConversationManager
                          agentId={`demo-${selectedConfig.id}`}
                          enrollmentContext={{
                            process_type: 'demo_enrollment',
                            agent_type: selectedConfig.id,
                            capture_fields: [
                              'personal_information',
                              'contact_details',
                              'preferences'
                            ]
                          }}
                          onDataCapture={(data) => {
                            console.log('Demo data captured:', data);
                            toast.success('Data captured from conversation');
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {(selectedConfig.features.voice_support || selectedConfig.id === 'fax' || selectedConfig.id === 'pdf') && (
                <Card>
                  <CardHeader>
                    <CardTitle>Voice Interface Demo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-muted-foreground">
                        Experience voice-to-text and text-to-voice capabilities optimized for {selectedConfig.name}
                      </p>
                      <Button
                        onClick={() => setShowVoiceDemo(!showVoiceDemo)}
                        variant="outline"
                      >
                        {showVoiceDemo ? 'Hide Voice Demo' : 'Try Voice Demo'}
                      </Button>
                    </div>
                    
                    {showVoiceDemo && (
                      <div className="border rounded-lg p-4">
                        <UniversalVoiceInterface
                          agentType={selectedConfig.id as any}
                          channelType="online"
                          onDataCapture={(data) => {
                            console.log('Voice demo data captured:', data);
                            toast.success('Voice data captured successfully');
                          }}
                          onStatusChange={(status) => {
                            console.log('Voice demo status:', status);
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          {selectedConfig && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Configuration</CardTitle>
                  <p className="text-muted-foreground">
                    Configure deployment settings including environments, testing, and channel assignments
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowDeployment(!showDeployment)}
                    className="w-full"
                  >
                    {showDeployment ? 'Hide Deployment Manager' : 'Open Deployment Manager'}
                  </Button>
                  
                  {showDeployment && (
                    <div className="mt-4">
                      <EnhancedDeploymentManager
                        onDeploy={(deploymentConfig) => {
                          console.log('Deployment configuration:', deploymentConfig);
                          toast.success('Agent deployment configuration saved');
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};