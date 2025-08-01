import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Settings, Palette, Zap, Database, Brain, Rocket, Plus, Save, User } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useAgents } from '@/hooks/useAgents';
import { toast } from '@/hooks/use-toast';
import { errorManager } from '@/utils/error/ErrorManager';

interface MinimalAgentBuilderProps {
  step?: string;
}

export const MinimalAgentBuilder: React.FC<MinimalAgentBuilderProps> = ({ step }) => {
  console.log('🚀 MinimalAgentBuilder rendering with step:', step);
  
  const { user } = useMasterAuth();
  const { agents, createAgent, isCreating } = useAgents();
  const [currentStep, setCurrentStep] = useState(step || 'basic_info');
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    purpose: '',
    use_case: '',
    agent_type: 'single',
    categories: [] as string[],
    business_units: [] as string[]
  });

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

      await createAgent({
        name: agentData.name,
        description: agentData.description,
        purpose: agentData.purpose,
        use_case: agentData.use_case,
        agent_type: agentData.agent_type,
        categories: agentData.categories,
        business_units: agentData.business_units
      });

      toast({
        title: "Success",
        description: "Agent created successfully!"
      });
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agent Creation & Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          <Button 
            onClick={handleSaveAgent} 
            disabled={isCreating}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating...' : 'Save Agent Info'}
          </Button>
        </div>
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
      </CardHeader>
      <CardContent>
        <p>Canvas functionality - visual agent design interface</p>
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
      </CardHeader>
      <CardContent>
        <p>Actions functionality - configure agent actions and workflows</p>
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
      </CardHeader>
      <CardContent>
        <p>Deploy functionality - deploy your agent to channels</p>
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

  try {
    return (
      <div className="space-y-6">
        {/* Agent Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Builder - Step: {currentStep}</CardTitle>
            {agentData.name && (
              <div className="flex items-center gap-2">
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

        {/* Real Agents Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Existing Agents ({agents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agents.length > 0 ? (
              <div className="grid gap-2">
                {agents.slice(0, 3).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{agent.name}</h4>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                  </div>
                ))}
                {agents.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{agents.length - 3} more agents
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
  } catch (error) {
    errorManager.reportError(error as Error, {
      component: 'MinimalAgentBuilder',
      severity: 'critical',
      additionalContext: { step: currentStep }
    });
    
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error in Agent Builder</h3>
          <p>There was an error loading the agent builder.</p>
        </CardContent>
      </Card>
    );
  }
};