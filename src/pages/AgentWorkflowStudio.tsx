import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Target, Map, Bot, Settings, Phone, TestTube, Rocket, 
  ArrowRight, CheckCircle, RotateCcw, Eye, X, Workflow
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useNavigate, Link } from 'react-router-dom';
import { useAgentBuilder } from '@/components/agent-builder/AgentBuilderProvider';
import ModePicker from '@/components/agent-builder/ModePicker';
import { Helmet } from 'react-helmet-async';
import { useApiServices } from '@/hooks/useApiServices';
import { EnhancedLSPanel } from '@/components/label-studio/EnhancedLSPanel';
import { ModelManagementDashboard } from '@/components/ModelManagement/ModelManagementDashboard';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedJourneyDesigner, type JourneyStep } from '@/components/journey/EnhancedJourneyDesigner';
import MCPDemoComponent from '@/components/MCPDemoComponent';
interface AgentWorkflowStudioProps {
  embedded?: boolean;
}

const AgentWorkflowStudio: React.FC<AgentWorkflowStudioProps> = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useMasterToast();
  const { mode, user } = useAgentBuilder();
  const { apiServices, isLoading: isLoadingServices } = useApiServices();
  
  const [currentStep, setCurrentStep] = useState('usecase');
  const [previewMode, setPreviewMode] = useState(false);
  const [lsProjectId, setLsProjectId] = useState<number | undefined>(undefined);
  const [journeySteps, setJourneySteps] = useState([
    { id: '1', title: 'Initial Contact', description: 'Patient reaches out for care' },
    { id: '2', title: 'Information Gathering', description: 'Collect patient details and needs' },
    { id: '3', title: 'Processing & Routing', description: 'Determine best care pathway' }
  ]);
  const [selectedUseCase, setSelectedUseCase] = useState<string>('patient-onboarding');
  const [agentName, setAgentName] = useState<string>('Patient Onboarding Assistant');

  // Default Label Studio project to last used from latest agent
  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id || user?.id;
        if (!userId) return;
        const { data, error } = await supabase
          .from('agents')
          .select('configuration, created_at, created_by')
          .eq('created_by', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (!error && data && data.length) {
          const lastProjectId = (data[0] as any)?.configuration?.labelStudioBinding?.projectId;
          if (lastProjectId) setLsProjectId(Number(lastProjectId));
        }
      } catch {}
    })();
  }, [user?.id]);

  // Keyboard navigation: Left/Right to move between steps
  const gotoPrev = () => {
    const idx = wizardSteps.findIndex(s => s.id === currentStep);
    if (idx > 0) setCurrentStep(wizardSteps[idx - 1].id);
  };
  const gotoNext = () => {
    const idx = wizardSteps.findIndex(s => s.id === currentStep);
    if (idx < wizardSteps.length - 1) setCurrentStep(wizardSteps[idx + 1].id);
  };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') gotoPrev();
      if (e.key === 'ArrowRight') gotoNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep]);

  // Wizard steps based on user requirements
  const wizardSteps = [
    { 
      id: 'usecase', 
      title: 'Use Case Definition', 
      description: 'Define your agent purpose and scope',
      icon: Target,
      completed: false 
    },
    { 
      id: 'journey', 
      title: 'Customer Journey', 
      description: 'Map the customer experience flow',
      icon: Map,
      completed: false 
    },
    { 
      id: 'ecosystem', 
      title: 'Agent Ecosystem', 
      description: 'Configure canvas, actions & templates',
      icon: Bot,
      completed: false 
    },
    { 
      id: 'config', 
      title: 'System Configuration', 
      description: 'Connectors, knowledge base & RAG',
      icon: Settings,
      completed: false 
    },
    { 
      id: 'channels', 
      title: 'Channel & Voice Setup', 
      description: 'Communication channels and voice',
      icon: Phone,
      completed: false 
    },
    { 
      id: 'testing', 
      title: 'Testing', 
      description: 'Validate before deployment',
      icon: TestTube,
      completed: false 
    },
    { 
      id: 'deployment', 
      title: 'Deployment', 
      description: 'Launch your agent',
      icon: Rocket,
      completed: false 
    }
  ];

  const handleStepComplete = (stepId: string) => {
    const currentIndex = wizardSteps.findIndex(step => step.id === stepId);
    const nextStep = wizardSteps[currentIndex + 1];
    
    if (nextStep) {
      setCurrentStep(nextStep.id);
      showSuccess(`${wizardSteps[currentIndex].title} completed! Moving to ${nextStep.title}.`);
    } else {
      showSuccess('Agent creation completed successfully!');
    }
  };

  const handleAddStep = () => {
    const newStepId = (journeySteps.length + 1).toString();
    const newStep = {
      id: newStepId,
      title: `New Step ${newStepId}`,
      description: 'Describe this step in the customer journey'
    };
    setJourneySteps([...journeySteps, newStep]);
    showSuccess('New journey step added successfully!');
  };

  const handleRemoveStep = (stepId: string) => {
    if (journeySteps.length <= 2) {
      showError('Cannot remove step. Minimum 2 steps required.');
      return;
    }
    setJourneySteps(journeySteps.filter(step => step.id !== stepId));
    showSuccess('Journey step removed successfully!');
  };

  const handleStepUpdate = (stepId: string, field: 'title' | 'description', value: string) => {
    setJourneySteps(journeySteps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  const handleReset = () => {
    setCurrentStep('usecase');
    setPreviewMode(false);
    showSuccess('Workflow reset. Starting fresh!');
  };

  // Render content based on build mode and current step
  const renderStepContent = () => {
    const stepContent = {
      usecase: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Target className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Define Your Use Case</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start by clearly defining what your AI agent should do. This helps generate the most relevant customer journey and configuration.
            </p>
            
            {mode === 'prompt' && (
              <div className="max-w-2xl mx-auto">
                <div className="p-6 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-4">Describe Your Agent (AI Prompt Mode)</h3>
                  <textarea 
                    className="w-full h-32 p-3 border rounded-lg resize-none"
                    placeholder="Example: Create a patient onboarding agent that guides new patients through registration, insurance verification, and medical history collection. The agent should be empathetic, collect required documents, and schedule initial appointments."
                  />
                  <Button className="mt-4" onClick={() => handleStepComplete('usecase')}>
                    Generate Journey with AI
                  </Button>
                </div>
              </div>
            )}
            
            {mode === 'manual' && (
              <div className="max-w-2xl mx-auto">
                <div className="p-6 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-4">Manual Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Agent Name</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded" 
                          placeholder="e.g., Patient Onboarding Assistant" 
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Primary Purpose</label>
                        <select 
                          className="w-full p-2 border rounded"
                          value={selectedUseCase}
                          onChange={(e) => setSelectedUseCase(e.target.value)}
                        >
                          <option value="patient-onboarding">Patient Onboarding</option>
                          <option value="appointment-scheduling">Appointment Scheduling</option>
                          <option value="treatment-support">Treatment Support</option>
                          <option value="insurance-processing">Insurance Processing</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Target Audience</label>
                        <input type="text" className="w-full p-2 border rounded" placeholder="e.g., New patients, Existing patients, Care providers" />
                      </div>
                    </div>
                  <Button className="mt-4" onClick={() => handleStepComplete('usecase')}>
                    Continue to Journey Mapping
                  </Button>
                </div>
              </div>
            )}

            {mode === 'visual' && (
              <div className="max-w-2xl mx-auto">
                <div className="p-6 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-4">Visual Builder Mode</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use drag-and-drop canvas to visually design your agent workflow
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded cursor-pointer hover:bg-muted/50">
                      <Bot className="h-8 w-8 mb-2" />
                      <div className="text-sm font-medium">Healthcare Agent</div>
                      <div className="text-xs text-muted-foreground">Patient care focused</div>
                    </div>
                    <div className="p-4 border rounded cursor-pointer hover:bg-muted/50">
                      <Target className="h-8 w-8 mb-2" />
                      <div className="text-sm font-medium">Custom Agent</div>
                      <div className="text-xs text-muted-foreground">Build from scratch</div>
                    </div>
                  </div>
                  <Button className="mt-4" onClick={() => handleStepComplete('usecase')}>
                    Open Visual Canvas
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ),

      journey: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Map className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Customer Journey Mapping</h2>
            <p className="text-muted-foreground mb-6">
              Define the customer experience flow and touchpoints
            </p>
            
            <div className="max-w-6xl mx-auto">
              <EnhancedJourneyDesigner
                steps={journeySteps.map(step => ({
                  id: step.id,
                  title: step.title,
                  description: step.description,
                  type: 'action' as const,
                  connectors: [],
                  actions: [],
                  requirements: [],
                  estimatedDuration: 5
                }))}
                useCase={selectedUseCase || ''}
                onStepsChange={(newSteps) => {
                  const updatedSteps = newSteps.map(step => ({
                    id: step.id,
                    title: step.title,
                    description: step.description
                  }));
                  setJourneySteps(updatedSteps);
                }}
                onGenerateEcosystem={() => handleStepComplete('journey')}
              />
            </div>
          </div>
        </div>
      ),

      ecosystem: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Bot className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Agent Ecosystem</h2>
            <p className="text-muted-foreground mb-6">
              Configure canvas, actions, and templates
            </p>
            
            <Tabs defaultValue="overview" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-4" level="child">
                <TabsTrigger value="overview" level="child">Overview</TabsTrigger>
                <TabsTrigger value="canvas" level="child">Canvas</TabsTrigger>
                <TabsTrigger value="actions" level="child">Actions</TabsTrigger>
                <TabsTrigger value="templates" level="child">Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" level="child" className="space-y-4">
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Generated for: {agentName}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use Case: {selectedUseCase.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on {journeySteps.length} journey steps: {journeySteps.map(step => step.title).join(' → ')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Workflow className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-medium">Workflow Nodes</div>
                      <div className="text-2xl font-bold">{journeySteps.length * 4}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {journeySteps.length} journey × 4 nodes each
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-medium">Decision Points</div>
                      <div className="text-2xl font-bold">{Math.max(journeySteps.length - 1, 1)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Between journey steps
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-medium">AI Actions</div>
                      <div className="text-2xl font-bold">{journeySteps.length * 2}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        2 AI actions per step
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="canvas" level="child">
                <div className="p-6 border rounded-lg min-h-[400px] bg-muted/10">
                  <div className="text-center py-16">
                    <Workflow className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Visual Workflow Canvas</h3>
                    <p className="text-muted-foreground">Drag and drop interface for building agent workflows</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="actions" level="child">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="font-medium mb-2">Data Collection</div>
                        <div className="text-sm text-muted-foreground">Gather patient information</div>
                        <Badge variant="outline" className="mt-2">Active</Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="font-medium mb-2">Appointment Booking</div>
                        <div className="text-sm text-muted-foreground">Schedule patient visits</div>
                        <Badge variant="outline" className="mt-2">Active</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="templates" level="child">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Bot className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">Healthcare Onboarding</div>
                      <div className="text-xs text-muted-foreground mt-1">Complete patient intake process</div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">Appointment Management</div>
                      <div className="text-xs text-muted-foreground mt-1">Scheduling and reminders</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <Button onClick={() => handleStepComplete('ecosystem')}>
                Continue to Configuration
              </Button>
            </div>
          </div>
        </div>
      ),

      config: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Settings className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">System Configuration</h2>
            <p className="text-muted-foreground mb-6">
              Configure connectors, knowledge base, and RAG settings
            </p>
            
            <Tabs defaultValue="models" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-6" level="child">
                <TabsTrigger value="models" level="child">AI Models</TabsTrigger>
                <TabsTrigger value="connectors" level="child">System Connectors</TabsTrigger>
                <TabsTrigger value="label" level="child">Label Studio</TabsTrigger>
                <TabsTrigger value="mcp" level="child">MCP</TabsTrigger>
                <TabsTrigger value="knowledge" level="child">Knowledge Base</TabsTrigger>
                <TabsTrigger value="rag" level="child">RAG</TabsTrigger>
              </TabsList>
              
              <TabsContent value="models" level="child" className="space-y-4">
                <ModelManagementDashboard />
              </TabsContent>
              
              <TabsContent value="connectors" level="child" className="space-y-4">
                {isLoadingServices ? (
                  <div className="text-sm text-muted-foreground p-4">Loading services…</div>
                ) : apiServices.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {apiServices.map((svc: any) => (
                      <Card key={svc.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{svc.name}</div>
                              <div className="text-xs text-muted-foreground">{svc.type} • {svc.base_url || 'no base URL'}</div>
                            </div>
                            <Badge variant={svc.status === 'active' ? 'outline' : 'secondary'}>
                              {svc.status || 'unknown'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">No connectors found. Add integrations in API Ecosystem.</div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="label" level="child" className="space-y-4">
                <EnhancedLSPanel projectId={lsProjectId} />
              </TabsContent>
              
              <TabsContent value="mcp" level="child" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Model Context Protocol tools for agent actions.</p>
                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border">
                      <strong>What is MCP Tools?</strong> Model Context Protocol provides standardized tools for your agent to interact with external systems, databases, and APIs. Use this to connect your agent to healthcare systems, file systems, and other data sources.
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Configure MCP Tools
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>MCP Tools Configuration</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <MCPDemoComponent />
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="text-xs text-muted-foreground">
                    <strong>Default Mode:</strong> MCP servers start in development mode. Use the dialog above to configure and start your MCP servers without leaving this workflow.
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="knowledge" level="child">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Medical Knowledge Base</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Upload and manage medical protocols, procedures, and reference materials
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Upload Documents</Button>
                        <Button variant="outline" size="sm">Manage Sources</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="rag" level="child">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-4">RAG Configuration</div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Embedding Model</label>
                          <select className="w-full mt-1 p-2 border rounded">
                            <option>OpenAI Ada v2</option>
                            <option>Cohere Embed v3</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Chunk Size</label>
                          <input type="number" defaultValue={1024} className="w-full mt-1 p-2 border rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <Button onClick={() => handleStepComplete('config')}>
                Continue to Channels Setup
              </Button>
            </div>
          </div>
        </div>
      ),

      channels: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Phone className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Channel & Voice Setup</h2>
            <p className="text-muted-foreground mb-6">
              Configure communication channels and voice settings
            </p>
            
            <Tabs defaultValue="channels" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-3" level="child">
                <TabsTrigger value="channels" level="child">Channels</TabsTrigger>
                <TabsTrigger value="voice" level="child">Voice Settings</TabsTrigger>
                <TabsTrigger value="integration" level="child">Integration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="channels" level="child" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Phone className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">Phone</div>
                      <div className="text-xs text-muted-foreground mt-1">Voice calls</div>
                      <Badge variant="outline" className="mt-2">Configure</Badge>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Bot className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">Web Chat</div>
                      <div className="text-xs text-muted-foreground mt-1">Website integration</div>
                      <Badge variant="outline" className="mt-2">Configure</Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="voice" level="child">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-4">Voice Configuration</div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Voice Model</label>
                          <select className="w-full mt-1 p-2 border rounded">
                            <option>OpenAI TTS</option>
                            <option>ElevenLabs</option>
                            <option>Azure Speech</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Voice Type</label>
                          <select className="w-full mt-1 p-2 border rounded">
                            <option>Professional Female</option>
                            <option>Professional Male</option>
                            <option>Friendly Female</option>
                            <option>Friendly Male</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="integration" level="child">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Integration Code</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Embed this code in your website or application
                      </div>
                      <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                        {`<script>
  // Agent integration code
  window.HealthcareAgent = {
    apiKey: 'your-api-key',
    agentId: 'agent-123'
  };
</script>`}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <Button onClick={() => handleStepComplete('channels')}>
                Continue to Testing
              </Button>
            </div>
          </div>
        </div>
      ),

      testing: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <TestTube className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Testing Phase</h2>
            <p className="text-muted-foreground mb-6">
              Validate your agent before deployment
            </p>
            
            <div className="max-w-4xl mx-auto space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Test Scenarios</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">New Patient Registration</div>
                        <div className="text-sm text-muted-foreground">Complete onboarding flow</div>
                      </div>
                      <Button variant="outline" size="sm">Run Test</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Appointment Scheduling</div>
                        <div className="text-sm text-muted-foreground">Book and manage appointments</div>
                      </div>
                      <Button variant="outline" size="sm">Run Test</Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline">Run All Tests</Button>
                    <Button onClick={() => handleStepComplete('testing')}>
                      Proceed to Deployment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ),

      deployment: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Rocket className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Deployment</h2>
            <p className="text-muted-foreground mb-6">
              Launch your agent to production
            </p>
            
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Deployment Summary</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span>Agent Name:</span>
                      <span className="font-medium">Patient Onboarding Assistant</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Channels:</span>
                      <span className="font-medium">Web, Phone, Chat</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="outline">Ready to Deploy</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" onClick={() => setPreviewMode(true)}>
                      Preview
                    </Button>
                    <Button onClick={() => {
                      showSuccess('Agent deployed successfully!');
                      setTimeout(() => navigate('/agents'), 2000);
                    }}>
                      Deploy Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    };

    return stepContent[currentStep as keyof typeof stepContent] || stepContent.usecase;
  };

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => 
    embedded ? <>{children}</> : <AppLayout>{children}</AppLayout>;

  return (
    <Wrapper>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Helmet>
          <title>Agent Workflow Builder | Prompt, Visual, Manual</title>
          <meta name="description" content="Build AI agents with Prompt, Visual, or Manual modes. Configure models (OpenAI, Anthropic, Azure, Gemini), connectors, Label Studio, and MCP." />
          <link rel="canonical" href="/agents/workflow-studio" />
        </Helmet>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Workflow className="h-8 w-8 text-primary" />
              Agent Workflow Builder
              <Badge variant="secondary">{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</Badge>
            </h1>
            <p className="text-muted-foreground mt-2">
              Build intelligent healthcare agents with guided workflows
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div><ModePicker /></div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-1" />
              {previewMode ? 'Hide Preview' : 'Preview'}
            </Button>
          </div>
        </div>

        {/* Progress Wizard */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6 overflow-x-auto scrollbar-hide">
              {wizardSteps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = step.completed;
                const stepIndex = wizardSteps.findIndex(s => s.id === currentStep);
                const currentIndex = wizardSteps.findIndex(s => s.id === step.id);
                const isPast = currentIndex < stepIndex;
                
                return (
                  <div key={step.id} className="flex items-center nav-item">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all cursor-pointer
                      ${isActive ? 'border-primary bg-primary text-primary-foreground' : ''}
                      ${isPast ? 'border-green-500 bg-green-500 text-white' : 'border-muted'}
                      ${!isActive && !isPast ? 'border-muted text-muted-foreground' : ''}
                    `}
                    onClick={() => setCurrentStep(step.id)}
                    >
                      {isPast ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className={`text-sm font-medium text-stable ${
                        isActive ? 'text-primary' : isPast ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground text-stable">
                        {step.description}
                      </div>
                    </div>
                    
                    {index < wizardSteps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground mx-4 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardContent className="p-0">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        {previewMode && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Agent Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-muted/10">
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Patient Onboarding Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Hello! I'm here to help you get started with your healthcare journey.
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Badge variant="outline">Active</Badge>
                    <Badge variant="outline">Web Chat</Badge>
                    <Badge variant="outline">Phone Ready</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ModePicker />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">MCP Tools</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>MCP Tools Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <MCPDemoComponent />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={gotoPrev} disabled={wizardSteps.findIndex(s => s.id === currentStep) === 0}>Previous</Button>
              <Button onClick={gotoNext} disabled={wizardSteps.findIndex(s => s.id === currentStep) === wizardSteps.length - 1}>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default AgentWorkflowStudio;