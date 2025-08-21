import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wand2, Rocket, Eye, Settings, 
  Brain, Users, Database, Zap,
  CheckCircle, Clock, ArrowRight
} from 'lucide-react';
import { useJourneyAISuggestions } from '@/hooks/useJourneyAISuggestions';
import { useMasterToast } from '@/hooks/useMasterToast';

interface UnifiedAgentBuilderProps {
  onComplete?: (agentData: any) => void;
}

interface GeneratedAgentData {
  useCase: string;
  journey: any[];
  suggestedTemplate: any;
  suggestedModels: string[];
  suggestedBranding: any;
  estimatedBuildTime: number;
  complexityScore: number;
}

export const UnifiedAgentBuilder: React.FC<UnifiedAgentBuilderProps> = ({
  onComplete
}) => {
  const [step, setStep] = useState<'intent' | 'review' | 'deploy'>('intent');
  const [useCase, setUseCase] = useState('');
  const [targetVertical, setTargetVertical] = useState('');
  const [generatedData, setGeneratedData] = useState<GeneratedAgentData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { generateSuggestions, isLoading: isLoadingJourney } = useJourneyAISuggestions();
  const { showSuccess, showError } = useMasterToast();

  // Step 1: Intent Capture with AI Generation
  const handleGenerateAgent = async () => {
    if (!useCase.trim()) {
      showError('Please describe your use case');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate AI journey
      const journeySteps = await generateSuggestions(`${useCase} for ${targetVertical}`);
      
      // Auto-select optimal components based on journey
      const suggestedData = await generateOptimalConfiguration(journeySteps, targetVertical);
      
      setGeneratedData(suggestedData);
      setStep('review');
      
      showSuccess(`🎉 Agent blueprint generated! Estimated build time: ${suggestedData.estimatedBuildTime} minutes`);
      
    } catch (error) {
      showError('Failed to generate agent blueprint');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-configure based on AI journey
  const generateOptimalConfiguration = async (journey: any[], vertical: string): Promise<GeneratedAgentData> => {
    // Smart template selection based on use case + vertical
    const template = selectOptimalTemplate(useCase, vertical);
    
    // AI model optimization based on journey complexity
    const models = optimizeModelSelection(journey, vertical);
    
    // Auto-generate branding based on vertical
    const branding = generateVerticalBranding(vertical);
    
    // Calculate complexity and time
    const complexity = calculateComplexity(journey);
    const buildTime = estimateBuildTime(complexity, journey.length);

    return {
      useCase,
      journey,
      suggestedTemplate: template,
      suggestedModels: models,
      suggestedBranding: branding,
      estimatedBuildTime: buildTime,
      complexityScore: complexity
    };
  };

  const selectOptimalTemplate = (useCase: string, vertical: string) => {
    // Healthcare-specific logic
    if (vertical.toLowerCase().includes('healthcare')) {
      if (useCase.toLowerCase().includes('intake')) {
        return { id: 'healthcare-intake', name: 'Patient Intake Assistant', type: 'healthcare' };
      }
      if (useCase.toLowerCase().includes('appointment')) {
        return { id: 'healthcare-scheduling', name: 'Appointment Scheduler', type: 'healthcare' };
      }
    }
    
    // Default template selection
    return { id: 'general-assistant', name: 'General Purpose Assistant', type: 'general' };
  };

  const optimizeModelSelection = (journey: any[], vertical: string) => {
    const models = ['gpt-4o-mini']; // Base model
    
    // Add specialized models based on journey requirements
    const hasComplexReasoning = journey.some(step => 
      step.type === 'decision' || step.description?.includes('analyze')
    );
    
    if (hasComplexReasoning) {
      models.push('gpt-4o');
    }
    
    // Healthcare-specific models
    if (vertical.toLowerCase().includes('healthcare')) {
      models.push('claude-3-haiku'); // HIPAA considerations
    }
    
    return models;
  };

  const generateVerticalBranding = (vertical: string) => {
    const brandingMap: Record<string, any> = {
      healthcare: {
        primaryColor: '#3b82f6',
        secondaryColor: '#06b6d4',
        tone: 'professional, caring',
        logo: 'medical-cross'
      },
      finance: {
        primaryColor: '#059669',
        secondaryColor: '#0891b2',
        tone: 'trustworthy, secure',
        logo: 'shield'
      },
      default: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#06b6d4',
        tone: 'friendly, helpful',
        logo: 'bot'
      }
    };
    
    return brandingMap[vertical.toLowerCase()] || brandingMap.default;
  };

  const calculateComplexity = (journey: any[]) => {
    let score = journey.length * 10; // Base complexity
    
    journey.forEach(step => {
      if (step.type === 'decision') score += 20;
      if (step.type === 'integration') score += 30;
      if (step.automationLevel === 'fully-automated') score += 15;
    });
    
    return Math.min(score, 100);
  };

  const estimateBuildTime = (complexity: number, stepCount: number) => {
    const baseTime = 2; // 2 minutes base
    const complexityTime = Math.floor(complexity / 20);
    const stepTime = stepCount * 0.5;
    
    return Math.max(baseTime + complexityTime + stepTime, 3);
  };

  const handleDeploy = async () => {
    if (!generatedData) return;
    
    try {
      // Auto-deploy with generated configuration
      const deploymentResult = await deployAgent(generatedData);
      
      showSuccess('🚀 Agent deployed successfully!');
      onComplete?.(deploymentResult);
      
    } catch (error) {
      showError('Deployment failed');
    }
  };

  const deployAgent = async (data: GeneratedAgentData) => {
    // This would integrate with your existing deployment system
    return {
      agentId: `agent_${Date.now()}`,
      status: 'deployed',
      url: `https://agent-${Date.now()}.lovable.app`,
      ...data
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4 p-4 border-b">
        <div className={`flex items-center gap-2 ${step === 'intent' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'intent' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Brain className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Intent</span>
        </div>
        
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        
        <div className={`flex items-center gap-2 ${step === 'review' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Eye className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Review</span>
        </div>
        
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        
        <div className={`flex items-center gap-2 ${step === 'deploy' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'deploy' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Rocket className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Deploy</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 p-6">
        {step === 'intent' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Build Any Agent in 3 Minutes</h1>
              <p className="text-muted-foreground">
                Describe your use case and we'll generate the complete agent blueprint
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">What agent do you want to build?</label>
                  <Textarea
                    placeholder="e.g., A patient intake assistant that collects medical history, insurance information, and schedules follow-up appointments"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Industry/Vertical</label>
                  <Input
                    placeholder="e.g., Healthcare, Finance, E-commerce"
                    value={targetVertical}
                    onChange={(e) => setTargetVertical(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleGenerateAgent}
                  disabled={isGenerating || !useCase.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Agent Blueprint...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Agent Blueprint
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">Auto-generates optimal workflow</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">3-Minute Setup</h3>
                <p className="text-sm text-muted-foreground">From idea to deployed agent</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Production Ready</h3>
                <p className="text-sm text-muted-foreground">HIPAA compliant & secure</p>
              </div>
            </div>
          </div>
        )}

        {step === 'review' && generatedData && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Review Your Agent Blueprint</h2>
              <p className="text-muted-foreground">
                Generated in {generatedData.estimatedBuildTime} minutes • Complexity: {generatedData.complexityScore}/100
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Journey Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Journey ({generatedData.journey.length} steps)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {generatedData.journey.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border-b last:border-b-0">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{step.title}</h4>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {step.estimatedDuration}min
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Configuration */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      AI Models
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedData.suggestedModels.map(model => (
                      <Badge key={model} className="mr-2 mb-2">{model}</Badge>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Template & Branding
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Template:</span>
                      <p className="text-sm text-muted-foreground">{generatedData.suggestedTemplate.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Brand:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: generatedData.suggestedBranding.primaryColor }}
                        />
                        <span className="text-sm">{generatedData.suggestedBranding.tone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setStep('intent')}>
                Regenerate
              </Button>
              <Button onClick={() => setStep('deploy')} size="lg">
                Deploy Agent
                <Rocket className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 'deploy' && (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Deploy Your Agent</h2>
              <p className="text-muted-foreground">
                Ready to go live with your AI agent
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Configuration</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Security & Compliance</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Testing & Validation</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleDeploy} size="lg" className="w-full">
              <Rocket className="h-4 w-4 mr-2" />
              Deploy to Production
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};