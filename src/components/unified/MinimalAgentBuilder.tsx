import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Settings, Palette, Zap, Database, Brain, Rocket } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { errorManager } from '@/utils/error/ErrorManager';

interface MinimalAgentBuilderProps {
  step?: string;
}

export const MinimalAgentBuilder: React.FC<MinimalAgentBuilderProps> = ({ step }) => {
  console.log('🚀 MinimalAgentBuilder rendering with step:', step);
  
  const { user } = useMasterAuth();
  const [currentStep, setCurrentStep] = useState(step || 'basic_info');

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
            <label className="text-sm font-medium">Agent Name</label>
            <input 
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-md"
              placeholder="Enter agent name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea 
              className="w-full mt-1 px-3 py-2 border rounded-md"
              placeholder="Describe what this agent will do"
            />
          </div>
          <Button>Save Agent Info</Button>
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
        <Card>
          <CardHeader>
            <CardTitle>Agent Builder - Step: {currentStep}</CardTitle>
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