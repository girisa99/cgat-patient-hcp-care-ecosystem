import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Brain, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Users,
  Building,
  Zap,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


export interface DynamicQuestion {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale' | 'conditional';
  question: string;
  description?: string;
  required: boolean;
  options?: string[];
  dependencies?: {
    questionId: string;
    condition: string;
    value: any;
  }[];
  followUp?: {
    triggers: { value: any; nextQuestionId: string }[];
  };
  weight: number; // For analysis scoring
  category: 'experience' | 'needs' | 'technical' | 'business' | 'validation';
}

export interface QuestionnaireResponse {
  questionId: string;
  value: any;
  timestamp: Date;
  confidence?: number;
}

export interface QuestionnaireAnalysis {
  suitabilityScore: number; // 0-100
  complexityLevel: 'Low' | 'Medium' | 'High' | 'Expert';
  recommendedPath: 'guided' | 'self-service' | 'consultation' | 'alternative';
  agentRecommendation: 'perfect-fit' | 'good-fit' | 'needs-enhancement' | 'not-suitable';
  insights: {
    strengths: string[];
    gaps: string[];
    recommendations: string[];
    alternativesSuggested: string[];
  };
  nextQuestions: DynamicQuestion[];
  estimatedTimeline: string;
  resourcesNeeded: string[];
}

interface DynamicQuestionnaireEngineProps {
  onComplete: (responses: QuestionnaireResponse[], analysis: QuestionnaireAnalysis) => void;
  onAnalysisUpdate?: (analysis: Partial<QuestionnaireAnalysis>) => void;
}

// Initial question patterns based on user type
const getInitialQuestions = (): DynamicQuestion[] => [
  {
    id: 'experience_level',
    type: 'radio',
    question: 'How would you describe your experience with AI agents?',
    description: 'This helps us customize your experience',
    required: true,
    options: [
      'Complete beginner - never used AI agents',
      'Some exposure - used ChatGPT, Copilot, etc.',
      'Moderate experience - built simple automations',
      'Advanced - created complex AI workflows',
      'Expert - developed enterprise AI solutions'
    ],
    weight: 10,
    category: 'experience',
    followUp: {
      triggers: [
        { value: 'Complete beginner - never used AI agents', nextQuestionId: 'beginner_goals' },
        { value: 'Expert - developed enterprise AI solutions', nextQuestionId: 'expert_requirements' }
      ]
    }
  },
  {
    id: 'primary_motivation',
    type: 'radio',
    question: 'What\'s driving you to explore AI agents right now?',
    required: true,
    options: [
      'Need to solve a specific business problem',
      'Exploring automation opportunities',
      'Competitive pressure/industry trends',
      'Personal interest and learning',
      'Executive mandate or initiative'
    ],
    weight: 8,
    category: 'business'
  },
  {
    id: 'problem_clarity',
    type: 'scale',
    question: 'How clearly defined is the problem you\'re trying to solve?',
    description: 'Rate from 1 (very vague idea) to 5 (crystal clear requirements)',
    required: true,
    weight: 9,
    category: 'validation'
  }
];

// Generate follow-up questions based on responses - with deduplication
const generateFollowUpQuestions = async (responses: QuestionnaireResponse[]): Promise<DynamicQuestion[]> => {
  const experienceLevel = responses.find(r => r.questionId === 'experience_level')?.value;
  const motivation = responses.find(r => r.questionId === 'primary_motivation')?.value;
  const problemClarity = responses.find(r => r.questionId === 'problem_clarity')?.value;

  const followUpQuestions: DynamicQuestion[] = [];
  
  console.log('🔍 Generating follow-ups for:', { experienceLevel, motivation, problemClarity });

  // Beginner path
  if (experienceLevel?.includes('Complete beginner')) {
    followUpQuestions.push({
      id: 'beginner_goals',
      type: 'textarea',
      question: 'In simple terms, what would you like an AI agent to help you with?',
      description: 'Don\'t worry about technical details - just describe your ideal outcome',
      required: true,
      weight: 8,
      category: 'needs'
    });
  }

  // Expert path
  if (experienceLevel?.includes('Expert')) {
    followUpQuestions.push({
      id: 'expert_requirements',
      type: 'checkbox',
      question: 'Which advanced capabilities are you looking for?',
      options: [
        'Multi-modal AI (text, voice, vision)',
        'Complex workflow orchestration',
        'Enterprise integrations (ERP, CRM)',
        'Compliance and audit trails',
        'Custom model fine-tuning',
        'Real-time decision making',
        'Advanced analytics and reporting'
      ],
      required: false,
      weight: 7,
      category: 'technical'
    });
  }

  // Business problem focused questions
  if (motivation?.includes('specific business problem')) {
    followUpQuestions.push({
      id: 'business_impact',
      type: 'textarea',
      question: 'Describe the business impact of NOT solving this problem',
      description: 'What happens if you continue with the status quo?',
      required: true,
      weight: 9,
      category: 'validation'
    });

    followUpQuestions.push({
      id: 'current_solution',
      type: 'textarea',
      question: 'How are you currently handling this? What isn\'t working?',
      required: true,
      weight: 8,
      category: 'validation'
    });
  }

  // Low problem clarity - need validation questions
  if (problemClarity && problemClarity < 3) {
    followUpQuestions.push({
      id: 'stakeholder_alignment',
      type: 'radio',
      question: 'Do your stakeholders agree on what the main problem is?',
      options: [
        'Yes, everyone is aligned',
        'Mostly, with some disagreement on priorities',
        'No, we have different views on the core issue',
        'I\'m not sure - haven\'t asked them'
      ],
      required: true,
      weight: 8,
      category: 'validation'
    });

    followUpQuestions.push({
      id: 'success_metrics',
      type: 'textarea',
      question: 'How would you measure success if this was working perfectly?',
      description: 'Think about specific, measurable outcomes',
      required: true,
      weight: 7,
      category: 'validation'
    });
  }

  return followUpQuestions;
};

// AI-powered analysis of responses
const analyzeResponses = async (responses: QuestionnaireResponse[]): Promise<QuestionnaireAnalysis> => {
  const experienceScore = calculateExperienceScore(responses);
  const clarityScore = calculateClarityScore(responses);
  const businessNeedScore = calculateBusinessNeedScore(responses);
  
  const suitabilityScore = Math.round((experienceScore + clarityScore + businessNeedScore) / 3);
  
  let agentRecommendation: QuestionnaireAnalysis['agentRecommendation'] = 'good-fit';
  let recommendedPath: QuestionnaireAnalysis['recommendedPath'] = 'self-service';
  
  if (suitabilityScore < 40) {
    agentRecommendation = 'not-suitable';
    recommendedPath = 'consultation';
  } else if (suitabilityScore < 60) {
    agentRecommendation = 'needs-enhancement';
    recommendedPath = 'consultation';
  } else if (suitabilityScore > 85) {
    agentRecommendation = 'perfect-fit';
    recommendedPath = experienceScore > 70 ? 'self-service' : 'guided';
  }

  const insights = generateInsights(responses, suitabilityScore);
  
  return {
    suitabilityScore,
    complexityLevel: getComplexityLevel(responses),
    recommendedPath,
    agentRecommendation,
    insights,
    nextQuestions: await generateNextQuestions(responses, suitabilityScore),
    estimatedTimeline: calculateTimeline(responses),
    resourcesNeeded: identifyResources(responses)
  };
};

const calculateExperienceScore = (responses: QuestionnaireResponse[]): number => {
  const experience = responses.find(r => r.questionId === 'experience_level')?.value;
  if (!experience) return 50;
  
  if (experience.includes('Complete beginner')) return 20;
  if (experience.includes('Some exposure')) return 40;
  if (experience.includes('Moderate experience')) return 60;
  if (experience.includes('Advanced')) return 80;
  if (experience.includes('Expert')) return 100;
  
  return 50;
};

const calculateClarityScore = (responses: QuestionnaireResponse[]): number => {
  const clarity = responses.find(r => r.questionId === 'problem_clarity')?.value;
  const hasBusinessImpact = responses.some(r => r.questionId === 'business_impact' && r.value?.trim());
  const hasCurrentSolution = responses.some(r => r.questionId === 'current_solution' && r.value?.trim());
  
  let score = (clarity || 0) * 20; // Convert 1-5 scale to 0-100
  
  if (hasBusinessImpact) score += 10;
  if (hasCurrentSolution) score += 10;
  
  return Math.min(100, score);
};

const calculateBusinessNeedScore = (responses: QuestionnaireResponse[]): number => {
  const motivation = responses.find(r => r.questionId === 'primary_motivation')?.value;
  if (!motivation) return 50;
  
  if (motivation.includes('specific business problem')) return 90;
  if (motivation.includes('Competitive pressure')) return 70;
  if (motivation.includes('Executive mandate')) return 60;
  if (motivation.includes('automation opportunities')) return 80;
  if (motivation.includes('Personal interest')) return 30;
  
  return 50;
};

const getComplexityLevel = (responses: QuestionnaireResponse[]): 'Low' | 'Medium' | 'High' | 'Expert' => {
  const expertFeatures = responses.find(r => r.questionId === 'expert_requirements')?.value as string[] || [];
  const experience = responses.find(r => r.questionId === 'experience_level')?.value;
  
  if (expertFeatures.length > 4 || experience?.includes('Expert')) return 'Expert';
  if (expertFeatures.length > 2 || experience?.includes('Advanced')) return 'High';
  if (experience?.includes('Moderate')) return 'Medium';
  return 'Low';
};

const generateInsights = (responses: QuestionnaireResponse[], suitabilityScore: number) => {
  const insights = {
    strengths: [] as string[],
    gaps: [] as string[],
    recommendations: [] as string[],
    alternativesSuggested: [] as string[]
  };

  const experience = responses.find(r => r.questionId === 'experience_level')?.value;
  const clarity = responses.find(r => r.questionId === 'problem_clarity')?.value;
  const motivation = responses.find(r => r.questionId === 'primary_motivation')?.value;

  // Strengths
  if (motivation?.includes('specific business problem')) {
    insights.strengths.push('Clear business motivation');
  }
  if (clarity && clarity >= 4) {
    insights.strengths.push('Well-defined problem scope');
  }
  if (experience?.includes('Advanced') || experience?.includes('Expert')) {
    insights.strengths.push('Strong technical foundation');
  }

  // Gaps
  if (clarity && clarity < 3) {
    insights.gaps.push('Problem definition needs more clarity');
    insights.recommendations.push('Conduct stakeholder interviews to better define requirements');
  }
  if (suitabilityScore < 50) {
    insights.gaps.push('Limited readiness for AI agent implementation');
  }
  if (experience?.includes('Complete beginner')) {
    insights.gaps.push('May need additional training and support');
  }

  // Recommendations based on score
  if (suitabilityScore < 40) {
    insights.recommendations.push('Consider starting with simpler automation tools');
    insights.recommendations.push('Invest time in problem definition and stakeholder alignment');
    insights.alternativesSuggested.push('Business process mapping consultation');
    insights.alternativesSuggested.push('Traditional workflow automation (Zapier, Microsoft Power Automate)');
  } else if (suitabilityScore < 60) {
    insights.recommendations.push('Start with a pilot project to validate the approach');
    insights.recommendations.push('Consider consulting support for initial setup');
  } else {
    insights.recommendations.push('You\'re well-positioned for AI agent implementation');
    if (experience?.includes('beginner')) {
      insights.recommendations.push('Use our guided setup for the best experience');
    }
  }

  return insights;
};

const generateNextQuestions = async (responses: QuestionnaireResponse[], suitabilityScore: number): Promise<DynamicQuestion[]> => {
  if (suitabilityScore < 40) {
    return [{
      id: 'alternative_interest',
      type: 'radio',
      question: 'Given your current situation, would you be interested in exploring alternative approaches first?',
      options: [
        'Yes, help me find better-suited solutions',
        'No, I still want to try AI agents',
        'Let me consult with my team first'
      ],
      required: true,
      weight: 5,
      category: 'validation'
    }];
  }

  if (suitabilityScore > 70) {
    return [{
      id: 'timeline_urgency',
      type: 'radio',
      question: 'What\'s your timeline for implementation?',
      options: [
        'ASAP - urgent business need',
        'Within 30 days',
        '2-3 months',
        'No specific timeline - exploring options'
      ],
      required: true,
      weight: 6,
      category: 'business'
    }];
  }

  return [];
};

const calculateTimeline = (responses: QuestionnaireResponse[]): string => {
  const complexity = getComplexityLevel(responses);
  const experience = responses.find(r => r.questionId === 'experience_level')?.value;
  
  if (complexity === 'Expert') return '2-4 weeks';
  if (complexity === 'High') return '3-6 weeks';
  if (complexity === 'Medium') return '2-4 weeks';
  if (experience?.includes('beginner')) return '1-2 weeks (with guidance)';
  return '1-3 weeks';
};

const identifyResources = (responses: QuestionnaireResponse[]): string[] => {
  const resources = ['Access to your data/systems'];
  const complexity = getComplexityLevel(responses);
  const experience = responses.find(r => r.questionId === 'experience_level')?.value;
  
  if (experience?.includes('beginner')) {
    resources.push('Training and onboarding support');
  }
  if (complexity === 'High' || complexity === 'Expert') {
    resources.push('Technical integration support');
    resources.push('Testing and validation resources');
  }
  
  return resources;
};

export const DynamicQuestionnaireEngine: React.FC<DynamicQuestionnaireEngineProps> = ({ 
  onComplete, 
  onAnalysisUpdate 
}) => {
  const { toast } = useToast();
  const [currentQuestions, setCurrentQuestions] = useState<DynamicQuestion[]>(getInitialQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<Partial<QuestionnaireAnalysis>>({});
  const [generatedFollowUps, setGeneratedFollowUps] = useState<Set<string>>(new Set()); // Track generated follow-ups

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + responses.length) / (currentQuestions.length + responses.length)) * 100;

  const handleResponse = useCallback(async (questionId: string, value: any) => {
    const newResponse: QuestionnaireResponse = {
      questionId,
      value,
      timestamp: new Date()
    };

    const updatedResponses = [...responses.filter(r => r.questionId !== questionId), newResponse];
    setResponses(updatedResponses);

    // Trigger real-time analysis every few questions
    if (updatedResponses.length % 3 === 0) {
      setIsAnalyzing(true);
      try {
        const partialAnalysis = await analyzeResponses(updatedResponses);
        setCurrentAnalysis(partialAnalysis);
        onAnalysisUpdate?.(partialAnalysis);
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }

    // Generate follow-up questions dynamically - but prevent duplicates
    const responseKey = `${questionId}-${JSON.stringify(value)}`;
    if (currentQuestionIndex === currentQuestions.length - 1 && !generatedFollowUps.has(responseKey)) {
      const followUps = await generateFollowUpQuestions(updatedResponses);
      if (followUps.length > 0) {
        // Filter out questions that already exist
        const newQuestions = followUps.filter(followUp => 
          !currentQuestions.some(existing => existing.id === followUp.id)
        );
        
        if (newQuestions.length > 0) {
          console.log(`Adding ${newQuestions.length} new follow-up questions:`, newQuestions.map(q => q.id));
          setCurrentQuestions(prev => [...prev, ...newQuestions]);
          setGeneratedFollowUps(prev => new Set([...prev, responseKey]));
        }
      }
    }
  }, [responses, currentQuestionIndex, onAnalysisUpdate]);

  const handleNext = () => {
    const currentResponse = responses.find(r => r.questionId === currentQuestion?.id);
    
    // Only advance if current question is answered (or optional)
    if (currentQuestion?.required && !currentResponse) {
      toast({
        title: "Question Required",
        description: "Please answer this question before continuing.",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsAnalyzing(true);
    try {
      const finalAnalysis = await analyzeResponses(responses);
      
      // Store questionnaire session in database
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (user.user) {
          const sessionData = {
            user_id: user.user.id,
            responses: responses as any,
            analysis: finalAnalysis as any,
            session_type: 'dynamic_onboarding' as const,
            suitability_score: finalAnalysis.suitabilityScore,
            agent_recommendation: finalAnalysis.agentRecommendation,
            recommended_path: finalAnalysis.recommendedPath,
            complexity_level: finalAnalysis.complexityLevel,
            estimated_timeline: finalAnalysis.estimatedTimeline,
            resources_needed: finalAnalysis.resourcesNeeded as any,
            insights: finalAnalysis.insights as any,
            completed_at: new Date().toISOString()
          };

          const { error: insertError } = await supabase
            .from('questionnaire_sessions')
            .insert(sessionData);

          if (insertError) {
            console.error('Failed to store questionnaire session:', insertError);
            // Continue without blocking user experience
          } else {
            console.log('Questionnaire session stored successfully');
          }
        }
      } catch (dbError) {
        console.error('Database error while storing questionnaire session:', dbError);
        // Continue without blocking user experience
      }

      onComplete(responses, finalAnalysis);
    } catch (error) {
      console.error('Completion error:', error);
      toast({
        title: "Analysis Error",
        description: "There was an issue analyzing your responses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderQuestion = (question: DynamicQuestion) => {
    const currentResponse = responses.find(r => r.questionId === question.id);

    switch (question.type) {
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map(option => (
              <div key={option} className="flex items-start space-x-3">
                <div 
                  className={`w-4 h-4 rounded-full border-2 cursor-pointer flex items-center justify-center mt-0.5 ${
                    currentResponse?.value === option
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground/30 hover:border-primary'
                  }`}
                  onClick={() => handleResponse(question.id, option)}
                >
                  {currentResponse?.value === option && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </div>
                <Label 
                  className="cursor-pointer flex-1" 
                  onClick={() => handleResponse(question.id, option)}
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={question.description}
            value={currentResponse?.value || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="min-h-[100px]"
          />
        );

      case 'scale':
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 - Very unclear</span>
              <span>5 - Crystal clear</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <Button
                  key={num}
                  variant={currentResponse?.value === num ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleResponse(question.id, num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(currentResponse?.value as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = (currentResponse?.value as string[]) || [];
                    const newValues = checked 
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleResponse(question.id, newValues);
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            value={currentResponse?.value || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder={question.description}
          />
        );
    }
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const response = responses.find(r => r.questionId === currentQuestion.id);
    return response && response.value !== '' && response.value !== null && response.value !== undefined;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentQuestionIndex + 1} of {currentQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentQuestion.category === 'experience' ? 'bg-blue-100 text-blue-600' :
              currentQuestion.category === 'needs' ? 'bg-green-100 text-green-600' :
              currentQuestion.category === 'technical' ? 'bg-purple-100 text-purple-600' :
              currentQuestion.category === 'business' ? 'bg-orange-100 text-orange-600' :
              'bg-red-100 text-red-600'
            }`}>
              {currentQuestion.category === 'experience' && <Users className="w-5 h-5" />}
              {currentQuestion.category === 'needs' && <Target className="w-5 h-5" />}
              {currentQuestion.category === 'technical' && <Bot className="w-5 h-5" />}
              {currentQuestion.category === 'business' && <Building className="w-5 h-5" />}
              {currentQuestion.category === 'validation' && <CheckCircle className="w-5 h-5" />}
            </div>
            <div>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              {currentQuestion.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {currentQuestion.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderQuestion(currentQuestion)}
        </CardContent>
      </Card>

      {/* Real-time Analysis Insights */}
      {currentAnalysis.suitabilityScore && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Analysis</span>
              {isAnalyzing && <Badge variant="secondary">Analyzing...</Badge>}
            </div>
            <div className="text-sm space-y-1">
              <div>
                Suitability Score: <Badge variant="outline">{currentAnalysis.suitabilityScore}/100</Badge>
              </div>
              {currentAnalysis.agentRecommendation && (
                <div className="flex items-center gap-2">
                  {currentAnalysis.agentRecommendation === 'perfect-fit' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {currentAnalysis.agentRecommendation === 'not-suitable' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <span>
                    {currentAnalysis.agentRecommendation === 'perfect-fit' && 'Perfect fit for AI agents!'}
                    {currentAnalysis.agentRecommendation === 'good-fit' && 'Good candidate for AI agents'}
                    {currentAnalysis.agentRecommendation === 'needs-enhancement' && 'May need additional preparation'}
                    {currentAnalysis.agentRecommendation === 'not-suitable' && 'Consider alternative solutions first'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={currentQuestionIndex === currentQuestions.length - 1 ? handleComplete : handleNext}
          disabled={!canProceed() || isAnalyzing}
        >
          {currentQuestionIndex === currentQuestions.length - 1 ? (
            <>
              {isAnalyzing ? 'Analyzing...' : 'Complete Analysis'}
              <Zap className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};