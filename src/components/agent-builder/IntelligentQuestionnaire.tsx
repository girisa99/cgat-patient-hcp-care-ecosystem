import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { 
  Bot, 
  Target, 
  ArrowRight,
  Lightbulb,
  BarChart3,
  Zap,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DynamicQuestionnaireEngine, QuestionnaireAnalysis, QuestionnaireResponse } from './DynamicQuestionnaireEngine';
import { QuestionnaireAnalysisResults } from './QuestionnaireAnalysisResults';

interface IntelligentQuestionnaireProps {
  onComplete: (data: {
    responses: QuestionnaireResponse[];
    analysis: QuestionnaireAnalysis;
    selectedMode: 'prompt' | 'visual' | 'manual';
    proceedWithAgent: boolean;
  }) => void;
}

export const IntelligentQuestionnaire: React.FC<IntelligentQuestionnaireProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [currentPhase, setCurrentPhase] = useState<'welcome' | 'questionnaire' | 'results' | 'direct-prompt'>('welcome');
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [analysis, setAnalysis] = useState<QuestionnaireAnalysis | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<Partial<QuestionnaireAnalysis>>({});
  const [directPrompt, setDirectPrompt] = useState('');

  const handleStartQuestionnaire = () => {
    setCurrentPhase('questionnaire');
  };

  const handleSkipToPrompt = () => {
    setCurrentPhase('direct-prompt');
  };

  const handleDirectPromptSubmit = () => {
    if (!directPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe what you want to build before continuing.",
        variant: "destructive"
      });
      return;
    }

    // Create minimal analysis for direct prompt users
    const minimalAnalysis: QuestionnaireAnalysis = {
      suitabilityScore: 85,
      complexityLevel: 'Medium' as const,
      recommendedPath: 'guided' as const,
      agentRecommendation: 'good-fit' as const,
      insights: {
        strengths: ['Clear use case defined', 'Ready to start building'],
        gaps: ['Limited context provided'],
        recommendations: ['Start with guided agent builder', 'Define detailed requirements'],
        alternativesSuggested: []
      },
      nextQuestions: [],
      estimatedTimeline: '1-2 weeks',
      resourcesNeeded: ['Basic configuration', 'Testing phase']
    };

    // Create minimal response for tracking
    const minimalResponse: QuestionnaireResponse = {
      questionId: 'direct-prompt',
      value: directPrompt,
      timestamp: new Date()
    };

    onComplete({
      responses: [minimalResponse],
      analysis: minimalAnalysis,
      selectedMode: 'prompt',
      proceedWithAgent: true
    });
  };

  const handleQuestionnaireComplete = (responses: QuestionnaireResponse[], analysis: QuestionnaireAnalysis) => {
    setResponses(responses);
    setAnalysis(analysis);
    setCurrentPhase('results');
  };

  const handleAnalysisUpdate = (partialAnalysis: Partial<QuestionnaireAnalysis>) => {
    setCurrentAnalysis(partialAnalysis);
  };

  const handleProceedWithAgent = () => {
    if (!analysis) return;
    
    const selectedMode = analysis.recommendedPath === 'guided' ? 'prompt' : 
                        analysis.complexityLevel === 'Expert' ? 'manual' : 'visual';

    onComplete({
      responses,
      analysis,
      selectedMode,
      proceedWithAgent: true
    });
  };

  const handleExploreAlternatives = () => {
    if (!analysis) return;
    
    // Show alternative solutions
    toast({
      title: "Alternative Solutions",
      description: "Redirecting you to explore alternative solutions that might be a better fit.",
    });
    
    // Could redirect to alternatives page or show alternatives modal
    console.log('Exploring alternatives:', analysis.insights.alternativesSuggested);
  };

  const handleGetConsultation = () => {
    if (!analysis) return;
    
    toast({
      title: "Consultation Requested",
      description: "We'll connect you with an expert to discuss your specific needs.",
    });
    
    // Could integrate with calendly or similar booking system
    console.log('Consultation requested for analysis:', analysis);
  };

  if (currentPhase === 'welcome') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Bot className="w-10 h-10 text-primary" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-4">Welcome to Agent Genie</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Let's make sure AI agents are the right fit for your needs
          </p>
        </div>

        <Card className="text-left">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Smart Assessment Process</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI-powered questionnaire adapts to your responses, asking deeper questions 
                  where needed and providing real-time analysis of your suitability for AI agents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-left">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Personalized Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your responses, we'll recommend the best path forward - whether that's 
                  building an AI agent, exploring alternatives, or getting expert consultation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-left">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Honest Guidance</h3>
                <p className="text-sm text-muted-foreground">
                  We'll tell you if AI agents aren't the right fit and suggest better alternatives. 
                  Our goal is your success, not just selling you our platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button 
            onClick={handleStartQuestionnaire} 
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            Start Smart Assessment
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleSkipToPrompt}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <Zap className="w-4 h-4" />
            Skip to Direct Prompt
          </Button>
          <p className="text-xs text-muted-foreground">
            Assessment takes 5-10 minutes • Direct prompt gets you started faster
          </p>
        </div>
      </div>
    );
  }

  if (currentPhase === 'direct-prompt') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Describe Your Vision</h2>
          <p className="text-muted-foreground">
            Tell us what you want to build and we'll help you create the perfect AI agent
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="direct-prompt" className="text-base font-medium">
                  What would you like your AI agent to do?
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Be as specific as possible. Examples: "Help customers with support tickets", "Analyze sales data and create reports", "Schedule meetings and manage my calendar"
                </p>
                <Textarea
                  id="direct-prompt"
                  placeholder="I want to build an AI agent that..."
                  value={directPrompt}
                  onChange={(e) => setDirectPrompt(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setCurrentPhase('welcome')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleDirectPromptSubmit}
                  className="flex-1"
                  disabled={!directPrompt.trim()}
                >
                  Continue Building
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentPhase === 'questionnaire') {
    return (
      <DynamicQuestionnaireEngine 
        onComplete={handleQuestionnaireComplete}
        onAnalysisUpdate={handleAnalysisUpdate}
      />
    );
  }

  if (currentPhase === 'results' && analysis) {
    return (
      <QuestionnaireAnalysisResults
        analysis={analysis}
        responses={responses}
        onProceedWithAgent={handleProceedWithAgent}
        onExploreAlternatives={handleExploreAlternatives}
        onGetConsultation={handleGetConsultation}
      />
    );
  }

  return null;
};