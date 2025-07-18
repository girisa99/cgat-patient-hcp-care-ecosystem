import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Workflow, 
  Bot, 
  Zap, 
  GitBranch, 
  Settings2,
  Palette,
  MessageSquare,
  Users,
  Building,
  Save,
  RefreshCw,
  Upload,
  Download
} from 'lucide-react';

interface AgentNode {
  id: string;
  type: 'cell-therapy' | 'gene-therapy' | 'personalized-medicine' | 'radioland-treatment' | 'assessment-shared';
  name: string;
  description: string;
  capabilities: string[];
  connections: string[];
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

interface WorkflowConnection {
  from: string;
  to: string;
  condition?: string;
  dataMapping?: Record<string, string>;
}

interface ConversationalChannel {
  id: string;
  type: 'web-chat' | 'voice' | 'sms' | 'whatsapp' | 'api' | 'embed';
  name: string;
  configuration: Record<string, any>;
  agents: string[];
}

export const AgenticWorkflowBuilder: React.FC = () => {
  const [agents, setAgents] = useState<AgentNode[]>([
    {
      id: 'cell-therapy-agent',
      type: 'cell-therapy',
      name: 'Cell Therapy Specialist',
      description: 'Specialized agent for CAR-T, stem cell, and regenerative therapies',
      capabilities: ['treatment-planning', 'protocol-optimization', 'safety-monitoring'],
      connections: ['assessment-shared'],
      branding: {
        primaryColor: '#10b981',
        secondaryColor: '#065f46'
      }
    },
    {
      id: 'gene-therapy-agent',
      type: 'gene-therapy',
      name: 'Gene Therapy Advisor',
      description: 'Advanced genetic modification and gene delivery system expert',
      capabilities: ['genetic-analysis', 'vector-selection', 'dosing-optimization'],
      connections: ['assessment-shared'],
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af'
      }
    },
    {
      id: 'personalized-medicine-agent',
      type: 'personalized-medicine',
      name: 'Precision Medicine Coordinator',
      description: 'Patient-specific treatment customization and biomarker analysis',
      capabilities: ['biomarker-analysis', 'patient-stratification', 'outcome-prediction'],
      connections: ['cell-therapy-agent', 'gene-therapy-agent'],
      branding: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#5b21b6'
      }
    },
    {
      id: 'radioland-agent',
      type: 'radioland-treatment',
      name: 'Radioland Treatment Expert',
      description: 'Specialized in radiopharmaceutical and targeted radiation therapies',
      capabilities: ['radiation-planning', 'isotope-selection', 'dosimetry-calculation'],
      connections: ['assessment-shared'],
      branding: {
        primaryColor: '#f59e0b',
        secondaryColor: '#92400e'
      }
    },
    {
      id: 'assessment-shared',
      type: 'assessment-shared',
      name: 'Shared Assessment Hub',
      description: 'Common assessment framework for all modalities',
      capabilities: ['risk-assessment', 'eligibility-screening', 'outcome-tracking'],
      connections: [],
      branding: {
        primaryColor: '#6b7280',
        secondaryColor: '#374151'
      }
    }
  ]);

  const [channels, setChannels] = useState<ConversationalChannel[]>([
    {
      id: 'web-portal',
      type: 'web-chat',
      name: 'Healthcare Provider Portal',
      configuration: {
        theme: 'clinical',
        multiAgent: true,
        authentication: 'required'
      },
      agents: ['cell-therapy-agent', 'gene-therapy-agent', 'personalized-medicine-agent']
    },
    {
      id: 'patient-app',
      type: 'embed',
      name: 'Patient Mobile App',
      configuration: {
        theme: 'patient-friendly',
        multiAgent: false,
        primaryAgent: 'personalized-medicine-agent'
      },
      agents: ['personalized-medicine-agent']
    }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [workflowConnections, setWorkflowConnections] = useState<WorkflowConnection[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [secondaryColor, setSecondaryColor] = useState('#065f46');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [logo, setLogo] = useState<string | null>(null);

  const handleAgentDrop = useCallback((event: React.DragEvent) => {
    // Implement drag & drop logic for workflow canvas
    event.preventDefault();
    console.log('Agent dropped on workflow canvas');
  }, []);

  const addWorkflowConnection = useCallback((from: string, to: string) => {
    setWorkflowConnections(prev => [
      ...prev,
      { from, to, condition: 'on_completion', dataMapping: {} }
    ]);
  }, []);

  const handleSaveTemplate = useCallback(() => {
    const template = {
      agents,
      channels,
      workflowConnections,
      branding: {
        primaryColor,
        secondaryColor,
        accentColor,
        logo
      }
    };
    
    // Save to localStorage for now (could be enhanced to save to Supabase)
    localStorage.setItem('agentic-workflow-template', JSON.stringify(template));
    toast.success('Template saved successfully!');
  }, [agents, channels, workflowConnections, primaryColor, secondaryColor, accentColor, logo]);

  const handleRefresh = useCallback(() => {
    // Reset to default state
    setSelectedAgent(null);
    setWorkflowConnections([]);
    setPrimaryColor('#10b981');
    setSecondaryColor('#065f46');
    setAccentColor('#3b82f6');
    setLogo(null);
    toast.success('Workflow refreshed!');
  }, []);

  const handleImportTemplate = useCallback(() => {
    const savedTemplate = localStorage.getItem('agentic-workflow-template');
    if (savedTemplate) {
      try {
        const template = JSON.parse(savedTemplate);
        setAgents(template.agents || agents);
        setChannels(template.channels || channels);
        setWorkflowConnections(template.workflowConnections || []);
        setPrimaryColor(template.branding?.primaryColor || '#10b981');
        setSecondaryColor(template.branding?.secondaryColor || '#065f46');
        setAccentColor(template.branding?.accentColor || '#3b82f6');
        setLogo(template.branding?.logo || null);
        toast.success('Template imported successfully!');
      } catch (error) {
        toast.error('Failed to import template');
      }
    } else {
      toast.error('No saved template found');
    }
  }, [agents, channels]);

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogo(result);
        toast.success('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleColorChange = useCallback((color: string, type: 'primary' | 'secondary' | 'accent') => {
    switch (type) {
      case 'primary':
        setPrimaryColor(color);
        break;
      case 'secondary':
        setSecondaryColor(color);
        break;
      case 'accent':
        setAccentColor(color);
        break;
    }
    toast.success(`${type} color updated!`);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agentic Healthcare Treatment Workflow Builder
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveTemplate} variant="default" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleImportTemplate} variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agents" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="agents">
                <Users className="h-4 w-4 mr-2" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="workflow">
                <Workflow className="h-4 w-4 mr-2" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="channels">
                <MessageSquare className="h-4 w-4 mr-2" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="branding">
                <Palette className="h-4 w-4 mr-2" />
                Branding
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <Card 
                    key={agent.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedAgent === agent.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', agent.id)}
                  >
                    <CardHeader 
                      className="pb-2"
                      style={{ backgroundColor: agent.branding?.primaryColor + '10' }}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {agent.name}
                        </CardTitle>
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: agent.branding?.primaryColor }}
                          className="text-white"
                        >
                          {agent.type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {agent.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold">Capabilities:</h4>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="workflow" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-96">
                <div 
                  className="w-full h-full flex items-center justify-center text-muted-foreground"
                  onDrop={handleAgentDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="text-center">
                    <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Drag agents here to build your healthcare treatment workflow</p>
                    <p className="text-sm mt-2">Connect agents to create multi-modal treatment paths</p>
                  </div>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workflow Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workflowConnections.map((connection, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-sm">{connection.from}</span>
                        <GitBranch className="h-4 w-4" />
                        <span className="text-sm">{connection.to}</span>
                        <Badge variant="outline">{connection.condition}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((channel) => (
                  <Card key={channel.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {channel.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{channel.type}</Badge>
                        <Badge variant="outline">
                          {channel.agents.length} agents
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Configuration:</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {Object.entries(channel.configuration).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key}:</span>
                              <span>{value.toString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Customization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Primary Brand Color</label>
                      <Input 
                        type="color" 
                        className="h-10" 
                        value={primaryColor}
                        onChange={(e) => handleColorChange(e.target.value, 'primary')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Secondary Brand Color</label>
                      <Input 
                        type="color" 
                        className="h-10" 
                        value={secondaryColor}
                        onChange={(e) => handleColorChange(e.target.value, 'secondary')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Accent Color</label>
                      <Input 
                        type="color" 
                        className="h-10" 
                        value={accentColor}
                        onChange={(e) => handleColorChange(e.target.value, 'accent')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Organization Logo</label>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>
                  
                  {/* Logo Preview */}
                  {logo && (
                    <div className="mt-4">
                      <label className="text-sm font-medium">Logo Preview</label>
                      <div className="mt-2 p-4 border rounded-lg bg-muted">
                        <img 
                          src={logo} 
                          alt="Organization Logo" 
                          className="max-h-20 max-w-40 object-contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Color Preview */}
                  <div className="mt-4">
                    <label className="text-sm font-medium">Color Preview</label>
                    <div className="flex gap-2 mt-2">
                      <div 
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: primaryColor }}
                        title="Primary Color"
                      />
                      <div 
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: secondaryColor }}
                        title="Secondary Color"
                      />
                      <div 
                        className="w-16 h-16 rounded border"
                        style={{ backgroundColor: accentColor }}
                        title="Accent Color"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgenticWorkflowBuilder;