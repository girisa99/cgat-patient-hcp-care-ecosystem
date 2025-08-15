import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  ArrowLeft,
  Lightbulb, 
  Workflow, 
  Settings, 
  Zap, 
  Brain, 
  CheckCircle,
  FileText,
  MessageSquare,
  Eye
} from 'lucide-react';
import { useUnifiedAgentBuilder } from '@/hooks/useUnifiedAgentBuilder';
import { UseCaseSelector } from '@/components/agentic/UseCaseSelector';
import ModeSpecificConfiguration from './ModeSpecificConfiguration';

interface ProgressiveAgentBuilderProps {
  step?: string;
}

type BuildStep = 
  | 'use_case_definition'
  | 'requirements_capture' 
  | 'mode_selection'
  | 'journey_definition'
  | 'configuration_walkthrough'
  | 'review_confirm';

const ProgressiveAgentBuilder: React.FC<ProgressiveAgentBuilderProps> = ({ step }) => {
  const {
    state,
    setState,
    selectUseCase,
    updateUserMode,
    saveAgent,
    USE_CASE_TEMPLATES
  } = useUnifiedAgentBuilder();

  const [currentStep, setCurrentStep] = useState<BuildStep>('use_case_definition');
  const [useCaseInput, setUseCaseInput] = useState({
    name: state.name || '',
    description: state.description || '',
    detailedUseCase: '',
    targetUsers: '',
    expectedOutcomes: ''
  });
  const [capturedRequirements, setCapturedRequirements] = useState({
    connectors: [] as string[],
    actions: [] as string[],
    steps: [] as string[],
    integrations: [] as string[]
  });

  const steps: Array<{id: BuildStep; title: string; description: string}> = [
    { id: 'use_case_definition', title: 'Define Use Case', description: 'Describe your agent\'s purpose in detail' },
    { id: 'requirements_capture', title: 'Capture Requirements', description: 'System analyzes needed components' },
    { id: 'mode_selection', title: 'Choose Build Mode', description: 'Select how you want to configure' },
    { id: 'journey_definition', title: 'Define Journey', description: 'Map out stages and steps' },
    { id: 'configuration_walkthrough', title: 'Configure Components', description: 'Set up selected components' },
    { id: 'review_confirm', title: 'Review & Confirm', description: 'Final review and deployment' }
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);
  const progress = ((getCurrentStepIndex() + 1) / steps.length) * 100;

  // Step 1: Use Case Definition
  const renderUseCaseDefinition = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Define Your Use Case in Detail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Agent Name</label>
              <Input
                placeholder="e.g., Patient Intake Assistant"
                value={useCaseInput.name}
                onChange={(e) => setUseCaseInput(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Brief Description</label>
              <Input
                placeholder="One-line summary of your agent"
                value={useCaseInput.description}
                onChange={(e) => setUseCaseInput(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Users</label>
              <Input
                placeholder="e.g., Healthcare staff, patients, administrators"
                value={useCaseInput.targetUsers}
                onChange={(e) => setUseCaseInput(prev => ({ ...prev, targetUsers: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expected Outcomes</label>
              <Input
                placeholder="What should this agent accomplish?"
                value={useCaseInput.expectedOutcomes}
                onChange={(e) => setUseCaseInput(prev => ({ ...prev, expectedOutcomes: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Detailed Use Case Description</label>
          <Textarea
            placeholder="Describe in detail what your agent should do, how it should behave, what workflows it should handle, what data it needs access to, and what integrations are required..."
            className="min-h-32"
            value={useCaseInput.detailedUseCase}
            onChange={(e) => setUseCaseInput(prev => ({ ...prev, detailedUseCase: e.target.value }))}
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Or choose from templates:</h4>
          <UseCaseSelector
            selectedUseCase={state.use_case?.name || ''}
            onUseCaseChange={(useCase) => {
              if (useCase && useCase.trim()) {
                const template = USE_CASE_TEMPLATES.find(t => t.name === useCase);
                if (template) {
                  selectUseCase(template);
                  setUseCaseInput(prev => ({
                    ...prev,
                    name: template.name,
                    description: template.description
                  }));
                }
              }
            }}
            selectedCategories={[]}
            selectedTopics={[]}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Step 2: Requirements Capture
  const renderRequirementsCapture = () => {
    // Analyze the use case and suggest requirements
    const analyzeRequirements = () => {
      const text = useCaseInput.detailedUseCase.toLowerCase();
      const newRequirements = {
        connectors: [] as string[],
        actions: [] as string[],
        steps: [] as string[],
        integrations: [] as string[]
      };

      // Smart analysis based on keywords
      if (text.includes('patient') || text.includes('medical') || text.includes('ehr')) {
        newRequirements.connectors.push('EHR Integration', 'FHIR API');
        newRequirements.integrations.push('Epic', 'Cerner', 'Healthcare APIs');
      }
      if (text.includes('form') || text.includes('intake') || text.includes('registration')) {
        newRequirements.actions.push('Form Processing', 'Data Validation', 'Information Collection');
        newRequirements.steps.push('Collect Information', 'Validate Data', 'Store Records');
      }
      if (text.includes('schedule') || text.includes('appointment')) {
        newRequirements.connectors.push('Calendar API', 'Scheduling System');
        newRequirements.actions.push('Schedule Management', 'Availability Check');
      }
      if (text.includes('voice') || text.includes('speech') || text.includes('call')) {
        newRequirements.connectors.push('Voice API', 'Telephony Integration');
        newRequirements.actions.push('Speech Recognition', 'Voice Response');
      }
      if (text.includes('document') || text.includes('file')) {
        newRequirements.actions.push('Document Processing', 'File Management');
        newRequirements.steps.push('Upload Documents', 'Process Files', 'Extract Information');
      }

      setCapturedRequirements(newRequirements);
    };

    useEffect(() => {
      if (useCaseInput.detailedUseCase) {
        analyzeRequirements();
      }
    }, [useCaseInput.detailedUseCase]);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            System Analysis: Required Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Based on your use case description, we've identified the following requirements:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Required Connectors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {capturedRequirements.connectors.map((connector, idx) => (
                    <Badge key={idx} variant="outline">{connector}</Badge>
                  ))}
                  {capturedRequirements.connectors.length === 0 && (
                    <p className="text-sm text-muted-foreground">No specific connectors detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Required Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {capturedRequirements.actions.map((action, idx) => (
                    <Badge key={idx} variant="secondary">{action}</Badge>
                  ))}
                  {capturedRequirements.actions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No specific actions detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Workflow Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {capturedRequirements.steps.map((step, idx) => (
                    <Badge key={idx} variant="default">{step}</Badge>
                  ))}
                  {capturedRequirements.steps.length === 0 && (
                    <p className="text-sm text-muted-foreground">No specific steps detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {capturedRequirements.integrations.map((integration, idx) => (
                    <Badge key={idx} variant="outline">{integration}</Badge>
                  ))}
                  {capturedRequirements.integrations.length === 0 && (
                    <p className="text-sm text-muted-foreground">No specific integrations detected</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="border-t pt-4">
            <Button 
              variant="outline" 
              onClick={analyzeRequirements}
              className="w-full"
            >
              Re-analyze Requirements
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Step 3: Mode Selection
  const renderModeSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Choose Your Configuration Approach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`cursor-pointer transition-colors ${
              state.user_mode === 'guided' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => updateUserMode('guided')}
          >
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Prompt-Based</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Describe what you want in natural language and let AI configure everything
              </p>
              <Badge variant={state.user_mode === 'guided' ? 'default' : 'outline'}>
                Recommended for beginners
              </Badge>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-colors ${
              state.user_mode === 'visual' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => updateUserMode('visual')}
          >
            <CardContent className="p-6 text-center">
              <Eye className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Visual Workflow</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and connect components on a visual canvas to build your agent
              </p>
              <Badge variant={state.user_mode === 'visual' ? 'default' : 'outline'}>
                Visual approach
              </Badge>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-colors ${
              state.user_mode === 'expert' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => updateUserMode('expert')}
          >
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Manual Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure each component manually with full control over every setting
              </p>
              <Badge variant={state.user_mode === 'expert' ? 'default' : 'outline'}>
                Advanced users
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            💡 You can switch between modes at any time. Your progress will be preserved.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Step 4: Journey Definition (based on mode)
  const renderJourneyDefinition = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Define Journey Stages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Based on your use case and requirements, here's the recommended journey:
          </p>
          
          {/* Show journey stages based on captured requirements */}
          <div className="space-y-3">
            {capturedRequirements.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step}</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure components for this stage
                  </p>
                </div>
                <Badge variant="outline">Stage {idx + 1}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Step 5: Configuration Walkthrough (mode-specific)
  const renderConfigurationWalkthrough = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Configure Components ({state.user_mode} mode)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ModeSpecificConfiguration
          mode={state.user_mode}
          capturedRequirements={capturedRequirements}
          onConfigurationComplete={(config) => {
            console.log('Configuration completed:', config);
            // Update the unified state with the configuration
            setState(prev => ({
              ...prev,
              configuration: config
            }));
          }}
        />
      </CardContent>
    </Card>
  );

  // Step 6: Review and Confirm
  const renderReviewConfirm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Review & Confirm Your Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Agent Summary</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {useCaseInput.name}</p>
              <p><strong>Description:</strong> {useCaseInput.description}</p>
              <p><strong>Build Mode:</strong> {state.user_mode}</p>
              <p><strong>Target Users:</strong> {useCaseInput.targetUsers}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Components Configured</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{capturedRequirements.connectors.length} Connectors</Badge>
                <Badge variant="outline">{capturedRequirements.actions.length} Actions</Badge>
                <Badge variant="outline">{capturedRequirements.steps.length} Steps</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Agent Completion:</span>
            <Badge>{state.completion_score}%</Badge>
          </div>
          <Progress value={state.completion_score} />
        </div>
      </CardContent>
    </Card>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 'use_case_definition':
        return useCaseInput.name && useCaseInput.detailedUseCase;
      case 'requirements_capture':
        return capturedRequirements.connectors.length > 0 || capturedRequirements.actions.length > 0;
      case 'mode_selection':
        return state.user_mode;
      default:
        return true;
    }
  };

  const handleNext = () => {
    // Update state when proceeding
    if (currentStep === 'use_case_definition') {
      setState(prev => ({
        ...prev,
        name: useCaseInput.name,
        description: useCaseInput.description
      }));
    }

    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'use_case_definition':
        return renderUseCaseDefinition();
      case 'requirements_capture':
        return renderRequirementsCapture();
      case 'mode_selection':
        return renderModeSelection();
      case 'journey_definition':
        return renderJourneyDefinition();
      case 'configuration_walkthrough':
        return renderConfigurationWalkthrough();
      case 'review_confirm':
        return renderReviewConfirm();
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Progressive Agent Builder</h1>
        <p className="text-muted-foreground">Follow the guided steps to build your intelligent agent</p>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {getCurrentStepIndex() + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            
            {/* Step indicators */}
            <div className="grid grid-cols-6 gap-2 text-xs">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`text-center p-2 rounded ${
                    idx <= getCurrentStepIndex() 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs opacity-80">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <div className="mb-6">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={getCurrentStepIndex() === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStep === 'review_confirm' ? (
            <Button
              onClick={saveAgent}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Create Agent
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || getCurrentStepIndex() === steps.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mode Switch Helper */}
      {state.user_mode && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Currently in <strong>{state.user_mode}</strong> mode. You can switch modes while preserving your data.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep('mode_selection')}
            >
              Switch Mode
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveAgentBuilder;