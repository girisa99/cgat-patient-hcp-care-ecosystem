import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Sparkles, 
  Target, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Settings,
  Workflow,
  MessageCircle,
  User,
  RefreshCw,
  ArrowLeft,
  Edit
} from 'lucide-react';

interface WelcomeFlowProps {
  onComplete: (data: {
    useCase: string;
    analysisResult: any;
    selectedMode: 'prompt' | 'visual' | 'manual';
    isReturningUser: boolean;
  }) => void;
}

interface UseCaseAnalysis {
  title: string;
  category: string;
  complexity: 'Simple' | 'Moderate' | 'Complex';
  estimatedTime: string;
  requiredConnectors: string[];
  suggestedActions: string[];
  journeySteps: string[];
  keyRequirements: string[];
}

export const WelcomeFlow: React.FC<WelcomeFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isReturningUser, setIsReturningUser] = useState<boolean | null>(null);
  const [useCase, setUseCase] = useState('');
  const [analysis, setAnalysis] = useState<UseCaseAnalysis | null>(null);
  const [selectedMode, setSelectedMode] = useState<'prompt' | 'visual' | 'manual' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Always start fresh for each new agent

  const analyzeUseCase = async () => {
    if (!useCase.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis - in real app, this would call AI service
    setTimeout(() => {
      const mockAnalysis: UseCaseAnalysis = {
        title: detectUseCaseTitle(useCase),
        category: detectCategory(useCase),
        complexity: detectComplexity(useCase),
        estimatedTime: estimateTime(useCase),
        requiredConnectors: suggestConnectors(useCase),
        suggestedActions: suggestActions(useCase),
        journeySteps: generateJourneySteps(useCase),
        keyRequirements: extractRequirements(useCase)
      };
      
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      setCurrentStep(2);
    }, 2000);
  };

  // Helper functions for use case analysis
  const detectUseCaseTitle = (text: string): string => {
    if (text.toLowerCase().includes('patient') && text.toLowerCase().includes('intake')) {
      return 'Patient Intake Assistant';
    }
    if (text.toLowerCase().includes('appointment')) {
      return 'Appointment Scheduling Agent';
    }
    if (text.toLowerCase().includes('insurance')) {
      return 'Insurance Verification Agent';
    }
    return 'Custom Healthcare Agent';
  };

  const detectCategory = (text: string): string => {
    if (text.toLowerCase().includes('patient')) return 'Patient Management';
    if (text.toLowerCase().includes('appointment')) return 'Scheduling';
    if (text.toLowerCase().includes('insurance')) return 'Administration';
    return 'General Healthcare';
  };

  const detectComplexity = (text: string): 'Simple' | 'Moderate' | 'Complex' => {
    const complexTerms = ['integration', 'multiple systems', 'workflow', 'approval'];
    const hasComplexTerms = complexTerms.some(term => text.toLowerCase().includes(term));
    if (hasComplexTerms) return 'Complex';
    if (text.length > 200) return 'Moderate';
    return 'Simple';
  };

  const estimateTime = (text: string): string => {
    const complexity = detectComplexity(text);
    switch (complexity) {
      case 'Simple': return '15-30 minutes';
      case 'Moderate': return '45-60 minutes';
      case 'Complex': return '1-2 hours';
      default: return '30-45 minutes';
    }
  };

  const suggestConnectors = (text: string): string[] => {
    const connectors = [];
    if (text.toLowerCase().includes('ehr') || text.toLowerCase().includes('electronic health')) {
      connectors.push('EHR Integration');
    }
    if (text.toLowerCase().includes('appointment') || text.toLowerCase().includes('schedule')) {
      connectors.push('Calendar API');
    }
    if (text.toLowerCase().includes('insurance')) {
      connectors.push('Insurance API');
    }
    if (text.toLowerCase().includes('email')) {
      connectors.push('Email Service');
    }
    if (text.toLowerCase().includes('sms') || text.toLowerCase().includes('text')) {
      connectors.push('SMS Gateway');
    }
    return connectors.length > 0 ? connectors : ['Database Connector', 'API Gateway'];
  };

  const suggestActions = (text: string): string[] => {
    const actions = [];
    if (text.toLowerCase().includes('collect') || text.toLowerCase().includes('gather')) {
      actions.push('Data Collection');
    }
    if (text.toLowerCase().includes('validate') || text.toLowerCase().includes('verify')) {
      actions.push('Data Validation');
    }
    if (text.toLowerCase().includes('notify') || text.toLowerCase().includes('alert')) {
      actions.push('Send Notification');
    }
    if (text.toLowerCase().includes('schedule')) {
      actions.push('Schedule Appointment');
    }
    if (text.toLowerCase().includes('update') || text.toLowerCase().includes('record')) {
      actions.push('Update Records');
    }
    return actions.length > 0 ? actions : ['Process Request', 'Generate Response', 'Update Status'];
  };

  const generateJourneySteps = (text: string): string[] => {
    return [
      'Initial Contact & Greeting',
      'Use Case Validation',
      'Data Collection & Processing',
      'System Integration',
      'Response Generation',
      'Follow-up Actions'
    ];
  };

  const extractRequirements = (text: string): string[] => {
    const requirements = [];
    if (text.toLowerCase().includes('hipaa')) {
      requirements.push('HIPAA Compliance');
    }
    if (text.toLowerCase().includes('real-time') || text.toLowerCase().includes('instant')) {
      requirements.push('Real-time Processing');
    }
    if (text.toLowerCase().includes('secure') || text.toLowerCase().includes('security')) {
      requirements.push('Enhanced Security');
    }
    if (text.toLowerCase().includes('24/7') || text.toLowerCase().includes('always available')) {
      requirements.push('24/7 Availability');
    }
    return requirements.length > 0 ? requirements : ['Data Security', 'Reliable Performance'];
  };

  const handleModeSelection = (mode: 'prompt' | 'visual' | 'manual') => {
    setSelectedMode(mode);
    
    onComplete({
      useCase,
      analysisResult: analysis,
      selectedMode: mode,
      isReturningUser: isReturningUser || false
    });
  };

  const steps = [
    // Step 0: Welcome & User Type
    (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {isReturningUser === null ? 'Welcome to Agent Builder' : 
             isReturningUser ? 'Welcome Back!' : 'Welcome to Agent Builder'}
          </h2>
          <p className="text-muted-foreground">
            {isReturningUser === null ? 'Let\'s create your intelligent healthcare agent together' :
             isReturningUser ? 'Ready to build another intelligent agent?' : 
             'Let\'s create your first intelligent healthcare agent together'}
          </p>
        </div>

        {isReturningUser === null && (
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => {setIsReturningUser(false); setCurrentStep(1);}}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              First Time Here
            </Button>
            <Button 
              onClick={() => {setIsReturningUser(true); setCurrentStep(1);}}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              I've Built Agents Before
            </Button>
          </div>
        )}

        {isReturningUser !== null && (
          <Button 
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Get Started
          </Button>
        )}
      </div>
    ),
    
    // Step 1: Use Case Definition
    (
      <div className="space-y-6">
        <div className="text-center">
          <Target className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Define Your Use Case</h2>
          <p className="text-muted-foreground">
            Tell us what you want your AI agent to do. Be as detailed as possible.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Textarea
              placeholder="Example: I want to create an agent that helps with patient intake by collecting personal information, insurance details, and medical history. The agent should validate insurance coverage, schedule appointments, and integrate with our EHR system..."
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              className="min-h-32 resize-none"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-muted-foreground">
                {useCase.length} characters
              </span>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
                <Button 
                  onClick={analyzeUseCase}
                  disabled={!useCase.trim() || isAnalyzing}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4" />
                      Analyze Use Case
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isReturningUser && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better results</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Include specific actions you want the agent to perform</li>
                <li>• Mention any systems it needs to integrate with</li>
                <li>• Describe the expected user interaction flow</li>
                <li>• Note any compliance requirements (HIPAA, etc.)</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    ),

    // Step 2: Analysis Results & Confirmation
    analysis && (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Use Case Analysis</h2>
          <p className="text-muted-foreground">
            Review and confirm the analysis of your use case
          </p>
        </div>

        <div className="grid gap-4">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {analysis.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Badge variant="outline">{analysis.category}</Badge>
                <Badge 
                  variant={analysis.complexity === 'Simple' ? 'default' : 
                          analysis.complexity === 'Moderate' ? 'secondary' : 'destructive'}
                >
                  {analysis.complexity} Complexity
                </Badge>
                <Badge variant="outline">{analysis.estimatedTime}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Journey & Requirements */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Journey Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.journeySteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Connectors</h5>
                  <div className="flex flex-wrap gap-1">
                    {analysis.requiredConnectors.map(connector => (
                      <Badge key={connector} variant="secondary" className="text-xs">
                        {connector}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Actions</h5>
                  <div className="flex flex-wrap gap-1">
                    {analysis.suggestedActions.map(action => (
                      <Badge key={action} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>

                {analysis.keyRequirements.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Requirements</h5>
                    <div className="flex flex-wrap gap-1">
                      {analysis.keyRequirements.map(req => (
                        <Badge key={req} variant="default" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Use Case
            </Button>
          </div>
          
          <Button onClick={() => setCurrentStep(3)} className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Looks Good, Continue
          </Button>
        </div>
      </div>
    ),

    // Step 3: Mode Selection
    (
      <div className="space-y-6">
        <div className="text-center">
          <Settings className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Choose Your Build Mode</h2>
          <p className="text-muted-foreground">
            Select how you'd like to configure your agent
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Prompt Mode */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5" />
                Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Conversational setup using natural language prompts and AI assistance
              </p>
              <ul className="text-xs space-y-1 mb-4">
                <li>• AI-guided configuration</li>
                <li>• Natural language setup</li>
                <li>• Fastest to get started</li>
                <li>• Intelligent recommendations</li>
              </ul>
              <Button 
                onClick={() => handleModeSelection('prompt')}
                className="w-full"
                variant="outline"
              >
                Start with Prompts
              </Button>
            </CardContent>
          </Card>

          {/* Visual Mode */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Workflow className="w-5 h-5" />
                Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Visual drag-and-drop canvas for designing workflows and connections
              </p>
              <ul className="text-xs space-y-1 mb-4">
                <li>• Drag & drop interface</li>
                <li>• Visual workflow design</li>
                <li>• See connections clearly</li>
                <li>• Template library</li>
              </ul>
              <Button 
                onClick={() => handleModeSelection('visual')}
                className="w-full"
              >
                Use Visual Builder
              </Button>
            </CardContent>
          </Card>

          {/* Manual Mode */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                Manual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced configuration with full control over every detail
              </p>
              <ul className="text-xs space-y-1 mb-4">
                <li>• Complete control</li>
                <li>• Advanced settings</li>
                <li>• Custom configurations</li>
                <li>• Expert mode</li>
              </ul>
              <Button 
                onClick={() => handleModeSelection('manual')}
                className="w-full"
                variant="outline"
              >
                Manual Setup
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Button>
          
          <Card className="bg-amber-50 border-amber-200 flex-1 mx-4">
            <CardContent className="p-4">
              <p className="text-sm text-amber-800">
                <strong>💡 Don't worry!</strong> You can switch between modes at any time during the configuration process.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step + 1}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Step {currentStep + 1} of 4
          </div>
        </div>

        {/* Current step content */}
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8">
            {steps[currentStep]}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};