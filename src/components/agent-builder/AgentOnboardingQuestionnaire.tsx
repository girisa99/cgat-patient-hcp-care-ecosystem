import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bot, 
  Users, 
  MessageSquare, 
  Target, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Star,
  Clock,
  Building,
  HelpCircle,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuestionnaireData {
  // Experience Questions
  isFirstTimeGenie: boolean;
  previousAgentTools: string[];
  toolExperience: {
    toolName: string;
    rating: number;
    liked: string[];
    disliked: string[];
    feedback: string;
  }[];
  
  // Initial Assessment Questions
  primaryGoal: string;
  businessContext: string;
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  timeframe: string;
  teamSize: string;
  
  // Follow-up Questions (based on responses)
  specificUseCase: string;
  integrationNeeds: string[];
  complianceRequirements: string[];
  expectedVolume: string;
  successMetrics: string[];
  challenges: string[];
}

interface AgentOnboardingQuestionnaireProps {
  onComplete: (data: QuestionnaireData & { 
    selectedMode: 'prompt' | 'visual' | 'manual';
    analysisResult?: any;
  }) => void;
}

// Custom Radio Group Component
interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomRadioGroupProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  options: RadioOption[];
  className?: string;
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({ 
  value, 
  onValueChange, 
  options, 
  className = "" 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map(option => (
        <div key={option.value} className="flex items-start space-x-3">
          <div 
            className={`w-4 h-4 rounded-full border-2 cursor-pointer flex items-center justify-center mt-0.5 ${
              value === option.value 
                ? 'border-primary bg-primary' 
                : 'border-gray-300 hover:border-primary'
            }`}
            onClick={() => onValueChange(option.value)}
          >
            {value === option.value && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <Label 
              className="cursor-pointer" 
              onClick={() => onValueChange(option.value)}
            >
              {option.label}
            </Label>
            {option.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {option.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const agentTools = [
  'ChatGPT/OpenAI',
  'Claude/Anthropic', 
  'Microsoft Copilot',
  'Google Bard/Gemini',
  'Zapier AI',
  'UiPath',
  'Automation Anywhere',
  'Blue Prism',
  'Custom Built Solution',
  'Other'
];

const integrationOptions = [
  'EHR Systems (Epic, Cerner, etc.)',
  'CRM Systems (Salesforce, HubSpot)',
  'Email Services (Gmail, Outlook)',
  'Calendar Systems',
  'Billing/Payment Systems',
  'Insurance APIs',
  'Lab Systems',
  'Pharmacy Systems',
  'Telehealth Platforms',
  'Communication Tools (Slack, Teams)',
  'Database Systems',
  'Custom APIs'
];

const complianceOptions = [
  'HIPAA (Healthcare)',
  'GDPR (Data Privacy)',
  'SOX (Financial)',
  'PCI DSS (Payment)',
  'ISO 27001',
  'SOC 2',
  'FERPA (Education)',
  'No specific compliance needed'
];

export const AgentOnboardingQuestionnaire: React.FC<AgentOnboardingQuestionnaireProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<QuestionnaireData>>({
    toolExperience: [],
    previousAgentTools: [],
    integrationNeeds: [],
    complianceRequirements: [],
    successMetrics: [],
    challenges: []
  });

  const updateData = (field: keyof QuestionnaireData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addToolExperience = (toolName: string) => {
    setData(prev => ({
      ...prev,
      toolExperience: [
        ...(prev.toolExperience || []),
        {
          toolName,
          rating: 3,
          liked: [],
          disliked: [],
          feedback: ''
        }
      ]
    }));
  };

  const updateToolExperience = (index: number, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      toolExperience: prev.toolExperience?.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ) || []
    }));
  };

  const handleComplete = () => {
    // Basic validation
    if (!data.primaryGoal || !data.businessContext || !data.technicalLevel) {
      toast({
        title: "Incomplete Information",
        description: "Please complete all required questions before proceeding.",
        variant: "destructive"
      });
      return;
    }

    // Determine recommended mode based on responses
    let recommendedMode: 'prompt' | 'visual' | 'manual' = 'visual';
    
    if (data.technicalLevel === 'beginner' || data.isFirstTimeGenie) {
      recommendedMode = 'prompt';
    } else if (data.technicalLevel === 'advanced' && data.previousAgentTools && data.previousAgentTools.length > 0) {
      recommendedMode = 'manual';
    }

    onComplete({
      ...(data as QuestionnaireData),
      selectedMode: recommendedMode,
      analysisResult: {
        recommendedMode,
        complexity: determineComplexity(),
        estimatedTime: estimateSetupTime(),
        personalizedTips: generatePersonalizedTips()
      }
    });
  };

  const determineComplexity = (): 'Simple' | 'Moderate' | 'Complex' => {
    let complexity = 0;
    
    if ((data.integrationNeeds?.length || 0) > 3) complexity += 2;
    if ((data.complianceRequirements?.length || 0) > 1) complexity += 1;
    if (data.technicalLevel === 'beginner') complexity += 1;
    if ((data.challenges?.length || 0) > 2) complexity += 1;
    
    if (complexity <= 2) return 'Simple';
    if (complexity <= 4) return 'Moderate';
    return 'Complex';
  };

  const estimateSetupTime = (): string => {
    const complexity = determineComplexity();
    const hasIntegrations = (data.integrationNeeds?.length || 0) > 0;
    const isFirstTime = data.isFirstTimeGenie;
    
    let baseTime = 30; // minutes
    
    if (complexity === 'Moderate') baseTime = 45;
    if (complexity === 'Complex') baseTime = 90;
    if (hasIntegrations) baseTime += 15;
    if (isFirstTime) baseTime += 15;
    
    if (baseTime <= 30) return '20-30 minutes';
    if (baseTime <= 45) return '30-45 minutes';
    if (baseTime <= 60) return '45-60 minutes';
    return '1-2 hours';
  };

  const generatePersonalizedTips = (): string[] => {
    const tips = [];
    
    if (data.isFirstTimeGenie) {
      tips.push('Start with our guided prompt mode for the best first-time experience');
    }
    
    if ((data.integrationNeeds?.length || 0) > 2) {
      tips.push('Consider planning your integrations in phases to ensure smooth implementation');
    }
    
    if (data.technicalLevel === 'beginner') {
      tips.push('Take advantage of our pre-built templates and guided setup process');
    }
    
    if (data.toolExperience && data.toolExperience.length > 0) {
      tips.push('Your previous experience will help - we\'ll show you familiar concepts where possible');
    }
    
    return tips;
  };

  const steps = [
    // Step 0: Welcome & Experience Level
    (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Agent Genie</h2>
          <p className="text-muted-foreground">
            Let's personalize your experience. Tell us about your background with AI agents.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Are you using Agent Genie for the first time?</Label>
              <CustomRadioGroup
                value={data.isFirstTimeGenie?.toString()}
                onValueChange={(value) => updateData('isFirstTimeGenie', value === 'true')}
                options={[
                  { value: 'true', label: 'Yes, this is my first time' },
                  { value: 'false', label: 'No, I\'ve used Agent Genie before' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Have you used other agent building tools?</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {agentTools.map(tool => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tool-${tool}`}
                      checked={data.previousAgentTools?.includes(tool)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData('previousAgentTools', [...(data.previousAgentTools || []), tool]);
                        } else {
                          updateData('previousAgentTools', data.previousAgentTools?.filter(t => t !== tool) || []);
                        }
                      }}
                    />
                    <Label htmlFor={`tool-${tool}`} className="text-sm">{tool}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={() => setCurrentStep(1)} 
          className="flex items-center gap-2"
          disabled={data.isFirstTimeGenie === undefined}
        >
          <ArrowRight className="w-4 h-4" />
          Continue
        </Button>
      </div>
    ),

    // Step 1: Tool Experience Feedback (if applicable)
    (data.previousAgentTools && data.previousAgentTools.length > 0) ? (
      <div className="space-y-6">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Share Your Experience</h2>
          <p className="text-muted-foreground">
            Help us understand what worked well and what didn't in your previous tools
          </p>
        </div>

        {data.previousAgentTools.slice(0, 2).map((tool, index) => {
          const experience = data.toolExperience?.[index];
          if (!experience) {
            // Auto-add experience entry for this tool
            React.useEffect(() => {
              if (!data.toolExperience?.some(exp => exp.toolName === tool)) {
                addToolExperience(tool);
              }
            }, [tool]);
            return null;
          }

          return (
            <Card key={tool}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {tool}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>How would you rate your overall experience? (1-5 stars)</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Star
                        key={rating}
                        className={`w-6 h-6 cursor-pointer ${
                          rating <= experience.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                        onClick={() => updateToolExperience(index, 'rating', rating)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>What did you like most about it?</Label>
                  <Textarea
                    placeholder="e.g., Easy to use, good integrations, helpful support..."
                    value={experience.feedback}
                    onChange={(e) => updateToolExperience(index, 'feedback', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(0)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Continue
          </Button>
        </div>
      </div>
    ) : null,

    // Step 2: Core Assessment Questions
    (
      <div className="space-y-6">
        <div className="text-center">
          <Target className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Let's Understand Your Needs</h2>
          <p className="text-muted-foreground">
            Help us personalize your agent-building experience
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-base font-medium">What's your primary goal with this agent? *</Label>
                <Textarea
                  placeholder="e.g., Automate patient intake, streamline appointment scheduling, improve customer support..."
                  value={data.primaryGoal || ''}
                  onChange={(e) => updateData('primaryGoal', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium">What's your business context? *</Label>
                <CustomRadioGroup
                  value={data.businessContext}
                  onValueChange={(value) => updateData('businessContext', value)}
                  options={[
                    { value: 'healthcare', label: 'Healthcare/Medical Practice' },
                    { value: 'enterprise', label: 'Large Enterprise' },
                    { value: 'small-business', label: 'Small/Medium Business' },
                    { value: 'personal', label: 'Personal/Side Project' }
                  ]}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium">What's your technical comfort level? *</Label>
                <CustomRadioGroup
                  value={data.technicalLevel}
                  onValueChange={(value) => updateData('technicalLevel', value)}
                  options={[
                    { 
                      value: 'beginner', 
                      label: 'Beginner', 
                      description: 'I prefer guided, step-by-step processes' 
                    },
                    { 
                      value: 'intermediate', 
                      label: 'Intermediate', 
                      description: 'I\'m comfortable with some technical concepts' 
                    },
                    { 
                      value: 'advanced', 
                      label: 'Advanced', 
                      description: 'I want full control and customization options' 
                    }
                  ]}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline for deployment?
                </Label>
                <CustomRadioGroup
                  value={data.timeframe}
                  onValueChange={(value) => updateData('timeframe', value)}
                  options={[
                    { value: 'asap', label: 'ASAP (within days)' },
                    { value: 'weeks', label: 'Within weeks' },
                    { value: 'months', label: 'Within months' },
                    { value: 'exploring', label: 'Just exploring' }
                  ]}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team size involved?
                </Label>
                <CustomRadioGroup
                  value={data.teamSize}
                  onValueChange={(value) => updateData('teamSize', value)}
                  options={[
                    { value: 'solo', label: 'Just me' },
                    { value: 'small', label: '2-5 people' },
                    { value: 'medium', label: '6-20 people' },
                    { value: 'large', label: '20+ people' }
                  ]}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(data.previousAgentTools?.length ? 1 : 0)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            onClick={() => setCurrentStep(3)}
            className="flex items-center gap-2"
            disabled={!data.primaryGoal || !data.businessContext || !data.technicalLevel}
          >
            <ArrowRight className="w-4 h-4" />
            Continue
          </Button>
        </div>
      </div>
    ),

    // Step 3: Detailed Follow-up Questions
    (
      <div className="space-y-6">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Let's Get Specific</h2>
          <p className="text-muted-foreground">
            Based on your responses, here are some detailed questions to optimize your setup
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-base font-medium">Describe your specific use case in detail</Label>
                <Textarea
                  placeholder="Be as specific as possible about the workflow, user interactions, expected outcomes..."
                  value={data.specificUseCase || ''}
                  onChange={(e) => updateData('specificUseCase', e.target.value)}
                  className="mt-2 min-h-24"
                />
              </div>

              <div>
                <Label className="text-base font-medium">What systems need integration?</Label>
                <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {integrationOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`integration-${option}`}
                        checked={data.integrationNeeds?.includes(option)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateData('integrationNeeds', [...(data.integrationNeeds || []), option]);
                          } else {
                            updateData('integrationNeeds', data.integrationNeeds?.filter(i => i !== option) || []);
                          }
                        }}
                      />
                      <Label htmlFor={`integration-${option}`} className="text-sm">{option}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Compliance requirements?</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {complianceOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`compliance-${option}`}
                        checked={data.complianceRequirements?.includes(option)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateData('complianceRequirements', [...(data.complianceRequirements || []), option]);
                          } else {
                            updateData('complianceRequirements', data.complianceRequirements?.filter(c => c !== option) || []);
                          }
                        }}
                      />
                      <Label htmlFor={`compliance-${option}`} className="text-sm">{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <Label className="text-base font-medium">Expected usage volume?</Label>
                <CustomRadioGroup
                  value={data.expectedVolume}
                  onValueChange={(value) => updateData('expectedVolume', value)}
                  options={[
                    { value: 'low', label: 'Low (< 100 interactions/day)' },
                    { value: 'medium', label: 'Medium (100-1000/day)' },
                    { value: 'high', label: 'High (1000+/day)' },
                    { value: 'unknown', label: 'Not sure yet' }
                  ]}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Label className="text-base font-medium">How will you measure success?</Label>
                <div className="space-y-2 mt-2">
                  {['Time Savings', 'Cost Reduction', 'User Satisfaction', 'Error Reduction', 'Process Efficiency', 'Revenue Impact'].map(metric => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={`metric-${metric}`}
                        checked={data.successMetrics?.includes(metric)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateData('successMetrics', [...(data.successMetrics || []), metric]);
                          } else {
                            updateData('successMetrics', data.successMetrics?.filter(m => m !== metric) || []);
                          }
                        }}
                      />
                      <Label htmlFor={`metric-${metric}`} className="text-sm">{metric}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            onClick={handleComplete}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Assessment
          </Button>
        </div>
      </div>
    )
  ].filter(Boolean);

  // Skip tool experience step if no previous tools
  const actualStep = currentStep === 1 && (!data.previousAgentTools || data.previousAgentTools.length === 0) 
    ? 2 
    : currentStep;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {[0, 1, 2, 3].map((step, index) => {
            // Adjust for skipped step
            const shouldShow = step === 1 ? (data.previousAgentTools && data.previousAgentTools.length > 0) : true;
            if (!shouldShow) return null;
            
            const isActive = step === actualStep;
            const isComplete = step < actualStep;
            
            return (
              <div key={step}>
                <div className={`w-3 h-3 rounded-full transition-colors ${
                  isComplete ? 'bg-green-500' : 
                  isActive ? 'bg-primary' : 'bg-gray-200'
                }`} />
                {index < 3 && <div className={`w-8 h-0.5 transition-colors ${
                  isComplete ? 'bg-green-500' : 'bg-gray-200'
                }`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      {steps[actualStep]}
    </div>
  );
};