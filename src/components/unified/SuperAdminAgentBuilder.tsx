import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Palette, Zap, Rocket, Plus, Save, User, Database } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useAgents } from '@/hooks/useAgents';
import { toast } from '@/hooks/use-toast';
import { EnhancedAgentCanvas } from '@/components/agentic/EnhancedAgentCanvas';
import { AgentActionsManager } from '@/components/agentic/AgentActionsManager';
import { AgentDeployment } from '@/components/agentic/AgentDeployment';
import { AgentTemplates } from '@/components/agentic/AgentTemplates';

interface SuperAdminAgentBuilderProps {
  step?: string;
}

export const SuperAdminAgentBuilder: React.FC<SuperAdminAgentBuilderProps> = ({ step }) => {
  console.log('🚀 SuperAdminAgentBuilder rendering with step:', step);
  
  // All hooks called at the top level - no conditional hooks
  const { user } = useMasterAuth();
  const { agents = [], createAgent, isCreating, isLoading, error } = useAgents();
  
  const [currentStep, setCurrentStep] = useState(step || 'basic_info');
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    purpose: '',
    use_case: '',
    agent_type: 'single',
    categories: [] as string[],
    business_units: [] as string[],
    topics: [] as string[],
    brand: ''
  });

  // Visual identity state
  const [visualData, setVisualData] = useState({
    name: '',
    tagline: 'Your AI healthcare partner',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    logoUrl: ''
  });

  // Available options for multi-select fields - Healthcare focused
  const availableCategories = ['Clinical Operations', 'Patient Management', 'Administrative Services', 'Quality Assurance', 'Compliance Monitoring', 'Healthcare Technology', 'Telemedicine', 'Emergency Care', 'Pharmacy Services', 'Laboratory Services'];
  const availableBusinessUnits = ['Oncology', 'Cardiology', 'Neurology', 'Pediatrics', 'Surgery', 'Emergency Medicine', 'Radiology', 'Laboratory', 'Pharmacy', 'Administration', 'Compliance', 'IT Support'];
  const availableTopics = ['Patient Care Coordination', 'Treatment Planning', 'Medication Management', 'Appointment Scheduling', 'Medical Records', 'Billing & Insurance', 'Clinical Documentation', 'Quality Metrics', 'Safety Protocols', 'Regulatory Compliance'];

  const handleSaveAgent = async () => {
    try {
      if (!agentData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Agent name is required",
          variant: "destructive"
        });
        return;
      }

      console.log('🚀 Creating agent with data:', agentData);

      await createAgent({
        name: agentData.name,
        description: agentData.description,
        purpose: agentData.purpose,
        use_case: agentData.use_case,
        agent_type: agentData.agent_type,
        categories: agentData.categories,
        business_units: agentData.business_units,
        topics: agentData.topics,
        brand: agentData.brand,
        configuration: {
          visual: visualData
        }
      });

      toast({
        title: "Success",
        description: "Agent created successfully!"
      });
      
      // Reset form after successful creation
      setAgentData({
        name: '',
        description: '',
        purpose: '',
        use_case: '',
        agent_type: 'single',
        categories: [],
        business_units: [],
        topics: [],
        brand: ''
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderManualCreation = () => (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Agent Name *</label>
            <Input 
              type="text"
              value={agentData.name}
              onChange={(e) => setAgentData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter agent name"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={agentData.description}
              onChange={(e) => setAgentData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this agent will do"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Purpose</label>
            <Input 
              type="text"
              value={agentData.purpose}
              onChange={(e) => setAgentData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="What is the main purpose of this agent?"
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Use Case</label>
            <Input 
              type="text"
              value={agentData.use_case}
              onChange={(e) => setAgentData(prev => ({ ...prev, use_case: e.target.value }))}
              placeholder="Specific use case for this agent"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Brand/Organization</label>
            <Input 
              type="text"
              value={agentData.brand}
              onChange={(e) => setAgentData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Brand or organization name"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Categories, Business Units, Topics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories Dropdown with Add New & Deactivate */}
        <div>
          <label className="text-sm font-medium">Categories</label>
          <Select
            value={(agentData.categories && agentData.categories.length > 0) ? agentData.categories[0] : ""}
            onValueChange={(value) => {
              if (value === "add_new") {
                const newCategory = prompt("Enter new category:");
                if (newCategory && newCategory.trim()) {
                  setAgentData(prev => ({
                    ...prev,
                    categories: [...(prev.categories || []), newCategory.trim()]
                  }));
                }
              } else if (value === "deactivate") {
                const categoryToDeactivate = prompt("Enter category name to deactivate:");
                if (categoryToDeactivate) {
                  toast({
                    title: "Category Deactivated",
                    description: `${categoryToDeactivate} has been deactivated`,
                  });
                }
              } else if (value && !(agentData.categories || []).includes(value)) {
                setAgentData(prev => ({
                  ...prev,
                  categories: [...(prev.categories || []), value]
                }));
              }
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select categories" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-md z-50">
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              <SelectItem value="add_new" className="text-blue-600 font-medium">
                + Add New Category
              </SelectItem>
              <SelectItem value="deactivate" className="text-red-600 font-medium">
                ⚠ Deactivate Category
              </SelectItem>
            </SelectContent>
          </Select>
          {(agentData.categories && agentData.categories.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(agentData.categories || []).map((category) => (
                <Badge
                  key={category}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => {
                    setAgentData(prev => ({
                      ...prev,
                      categories: (prev.categories || []).filter(c => c !== category)
                    }));
                  }}
                >
                  {category} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Business Units Dropdown with Add New & Deactivate */}
        <div>
          <label className="text-sm font-medium">Business Units</label>
          <Select
            value={(agentData.business_units && agentData.business_units.length > 0) ? agentData.business_units[0] : ""}
            onValueChange={(value) => {
              if (value === "add_new") {
                const newUnit = prompt("Enter new business unit:");
                if (newUnit && newUnit.trim()) {
                  setAgentData(prev => ({
                    ...prev,
                    business_units: [...(prev.business_units || []), newUnit.trim()]
                  }));
                }
              } else if (value === "deactivate") {
                const unitToDeactivate = prompt("Enter business unit name to deactivate:");
                if (unitToDeactivate) {
                  toast({
                    title: "Business Unit Deactivated",
                    description: `${unitToDeactivate} has been deactivated`,
                  });
                }
              } else if (value && !(agentData.business_units || []).includes(value)) {
                setAgentData(prev => ({
                  ...prev,
                  business_units: [...(prev.business_units || []), value]
                }));
              }
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select business units" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-md z-50">
              {availableBusinessUnits.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
              <SelectItem value="add_new" className="text-blue-600 font-medium">
                + Add New Business Unit
              </SelectItem>
              <SelectItem value="deactivate" className="text-red-600 font-medium">
                ⚠ Deactivate Business Unit
              </SelectItem>
            </SelectContent>
          </Select>
          {(agentData.business_units && agentData.business_units.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(agentData.business_units || []).map((unit) => (
                <Badge
                  key={unit}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => {
                    setAgentData(prev => ({
                      ...prev,
                      business_units: (prev.business_units || []).filter(u => u !== unit)
                    }));
                  }}
                >
                  {unit} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Topics Dropdown with Add New & Deactivate */}
        <div>
          <label className="text-sm font-medium">Topics</label>
          <Select
            value={(agentData.topics && agentData.topics.length > 0) ? agentData.topics[0] : ""}
            onValueChange={(value) => {
              if (value === "add_new") {
                const newTopic = prompt("Enter new topic:");
                if (newTopic && newTopic.trim()) {
                  setAgentData(prev => ({
                    ...prev,
                    topics: [...(prev.topics || []), newTopic.trim()]
                  }));
                }
              } else if (value === "deactivate") {
                const topicToDeactivate = prompt("Enter topic name to deactivate:");
                if (topicToDeactivate) {
                  toast({
                    title: "Topic Deactivated",
                    description: `${topicToDeactivate} has been deactivated`,
                  });
                }
              } else if (value && !(agentData.topics || []).includes(value)) {
                setAgentData(prev => ({
                  ...prev,
                  topics: [...(prev.topics || []), value]
                }));
              }
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select topics" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-md z-50">
              {availableTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
              <SelectItem value="add_new" className="text-blue-600 font-medium">
                + Add New Topic
              </SelectItem>
              <SelectItem value="deactivate" className="text-red-600 font-medium">
                ⚠ Deactivate Topic
              </SelectItem>
            </SelectContent>
          </Select>
          {(agentData.topics && agentData.topics.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(agentData.topics || []).map((topic) => (
                <Badge
                  key={topic}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => {
                    setAgentData(prev => ({
                      ...prev,
                      topics: (prev.topics || []).filter(t => t !== topic)
                    }));
                  }}
                >
                  {topic} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Button 
        onClick={handleSaveAgent} 
        disabled={isCreating || !agentData.name.trim()}
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {isCreating ? 'Creating...' : 'Save Agent Info'}
      </Button>
    </div>
  );

  const renderFromTemplate = () => (
    <div className="space-y-6">
      <AgentTemplates
        onSelectTemplate={(template: any) => {
          console.log('Selected template:', template);
          if (template) {
            setAgentData(prev => ({
              ...prev,
              name: template?.name || '',
              description: template?.description || '',
              agent_type: template?.template_type || 'single'
            }));
            toast({
              title: "Template Selected",
              description: `Using template: ${template?.name || 'Unknown'}`,
            });
          }
        }}
      />
    </div>
  );

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agent Creation & Configuration
        </CardTitle>
        <CardDescription>
          Define your agent's core identity, purpose, and capabilities or start from a template
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Creation</TabsTrigger>
            <TabsTrigger value="templates">From Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-6">
            {renderManualCreation()}
          </TabsContent>
          
          <TabsContent value="templates" className="mt-6">
            {renderFromTemplate()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const renderCanvas = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Visual Identity & Branding
        </CardTitle>
        <CardDescription>
          Customize your agent's visual identity and white-label settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EnhancedAgentCanvas 
          initialName={agentData.name || visualData.name}
          initialTagline={visualData.tagline}
          initialPrimaryColor={visualData.primaryColor}
          initialSecondaryColor={visualData.secondaryColor}
          initialAccentColor={visualData.accentColor}
          onNameChange={(name) => setVisualData(prev => ({ ...prev, name }))}
          onTaglineChange={(tagline) => setVisualData(prev => ({ ...prev, tagline }))}
          onPrimaryColorChange={(color) => setVisualData(prev => ({ ...prev, primaryColor: color }))}
          onSecondaryColorChange={(color) => setVisualData(prev => ({ ...prev, secondaryColor: color }))}
          onAccentColorChange={(color) => setVisualData(prev => ({ ...prev, accentColor: color }))}
        />
      </CardContent>
    </Card>
  );

  const renderActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Actions Configuration
        </CardTitle>
        <CardDescription>
          Configure agent actions and workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AgentActionsManager 
          agentId={agentData.name ? `temp-${agentData.name.toLowerCase().replace(/\s+/g, '-')}` : 'temp-agent'}
          onActionsChange={(actions) => {
            console.log('Actions changed:', actions);
          }}
        />
      </CardContent>
    </Card>
  );

  const renderDeploy = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Deployment
        </CardTitle>
        <CardDescription>
          Deploy your agent to channels and go live
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Deploy</h3>
            <p className="text-muted-foreground mb-4">
              Agent: {agentData.name || 'Unnamed Agent'}
            </p>
            <Button 
              onClick={() => {
                console.log('Deploying agent:', agentData);
                toast({
                  title: "Deployment Started",
                  description: "Your agent is being deployed...",
                });
              }}
              disabled={!agentData.name}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Deploy Agent
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic_info':
        return renderBasicInfo();
      case 'canvas':
        return renderCanvas();
      case 'actions':
        return renderActions();
      case 'deploy':
        return renderDeploy();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Builder - Step: {currentStep}</CardTitle>
          {agentData.name && (
            <div className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">Building: {agentData.name}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              variant={currentStep === 'basic_info' ? 'default' : 'outline'}
              onClick={() => setCurrentStep('basic_info')}
            >
              <Bot className="h-4 w-4 mr-2" />
              Basic Info
            </Button>
            <Button 
              variant={currentStep === 'canvas' ? 'default' : 'outline'}
              onClick={() => setCurrentStep('canvas')}
            >
              <Palette className="h-4 w-4 mr-2" />
              Canvas
            </Button>
            <Button 
              variant={currentStep === 'actions' ? 'default' : 'outline'}
              onClick={() => setCurrentStep('actions')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Actions
            </Button>
            <Button 
              variant={currentStep === 'deploy' ? 'default' : 'outline'}
              onClick={() => setCurrentStep('deploy')}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Deploy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Agents Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Existing Agents ({(agents?.length || 0)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading agents...</span>
            </div>
          ) : error ? (
            <div className="text-center p-4">
              <p className="text-sm text-red-600">Error loading agents: {error.message}</p>
            </div>
          ) : (agents && agents.length > 0) ? (
            <div className="grid gap-2">
              {(agents || []).slice(0, 3).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground">{agent.description || 'No description'}</p>
                    <div className="flex gap-1 mt-1">
                      {agent.categories && agent.categories.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {agent.categories[0]} {agent.categories.length > 1 && `+${agent.categories.length - 1}`}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                    {agent.status || 'draft'}
                  </Badge>
                </div>
              ))}
              {(agents?.length || 0) > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{(agents?.length || 0) - 3} more agents
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No agents created yet. Create your first agent above!
            </p>
          )}
        </CardContent>
      </Card>

      {renderStepContent()}
    </div>
  );
};
