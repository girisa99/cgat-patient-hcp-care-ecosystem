import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Clock, 
  Users, 
  Target,
  ArrowRight,
  Brain,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Zap
} from 'lucide-react';
import { QuestionnaireAnalysis, QuestionnaireResponse } from './DynamicQuestionnaireEngine';

interface QuestionnaireAnalysisResultsProps {
  analysis: QuestionnaireAnalysis;
  responses: QuestionnaireResponse[];
  onProceedWithAgent: () => void;
  onExploreAlternatives: () => void;
  onGetConsultation: () => void;
}

export const QuestionnaireAnalysisResults: React.FC<QuestionnaireAnalysisResultsProps> = ({
  analysis,
  responses,
  onProceedWithAgent,
  onExploreAlternatives,
  onGetConsultation
}) => {
  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSuitabilityIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'perfect-fit': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'good-fit': return <TrendingUp className="w-6 h-6 text-blue-500" />;
      case 'needs-enhancement': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'not-suitable': return <AlertCircle className="w-6 h-6 text-red-500" />;
      default: return <HelpCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'perfect-fit': return 'Perfect Match!';
      case 'good-fit': return 'Good Fit';
      case 'needs-enhancement': return 'Needs Preparation';
      case 'not-suitable': return 'Alternative Recommended';
      default: return 'Assessment Complete';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Overall Score */}
      <Card className={`border-2 ${getSuitabilityColor(analysis.suitabilityScore)}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getSuitabilityIcon(analysis.agentRecommendation)}
              <div>
                <h2 className="text-2xl font-bold">
                  {getRecommendationText(analysis.agentRecommendation)}
                </h2>
                <p className="text-muted-foreground">
                  Based on your responses, here's our analysis
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{analysis.suitabilityScore}</div>
              <div className="text-sm text-muted-foreground">Suitability Score</div>
            </div>
          </div>
          
          <Progress value={analysis.suitabilityScore} className="h-3 mb-4" />
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Complexity: {analysis.complexityLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Timeline: {analysis.estimatedTimeline}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Path: {analysis.recommendedPath}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.insights.strengths.length > 0 ? (
              analysis.insights.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                We'll identify your strengths as we learn more about your needs.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              Areas to Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.insights.gaps.length > 0 ? (
              analysis.insights.gaps.map((gap, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{gap}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-green-600">
                Great! No significant gaps identified.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            Our Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.insights.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-blue-600">{index + 1}</span>
              </div>
              <span className="text-sm">{recommendation}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alternative Solutions (if applicable) */}
      {analysis.insights.alternativesSuggested.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <HelpCircle className="w-5 h-5" />
              Alternative Solutions to Consider
            </CardTitle>
            <p className="text-sm text-orange-700">
              Based on your current situation, these alternatives might be more suitable initially:
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.insights.alternativesSuggested.map((alternative, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <ExternalLink className="w-4 h-4 text-orange-500" />
                <span className="text-sm">{alternative}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resources Needed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Resources You'll Need
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {analysis.resourcesNeeded.map((resource, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">{resource}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            What's Next?
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose your path forward based on our analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.agentRecommendation === 'perfect-fit' || analysis.agentRecommendation === 'good-fit' ? (
            <div className="space-y-3">
              <Button 
                onClick={onProceedWithAgent} 
                className="w-full justify-between"
                size="lg"
              >
                <span>Start Building Your Agent</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Recommended path: {analysis.recommendedPath === 'guided' ? 'Guided Setup' : 'Self-Service'}
              </div>
            </div>
          ) : analysis.agentRecommendation === 'needs-enhancement' ? (
            <div className="grid gap-3">
              <Button 
                onClick={onGetConsultation} 
                className="w-full justify-between"
                size="lg"
              >
                <span>Get Expert Consultation First</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                onClick={onProceedWithAgent} 
                variant="outline"
                className="w-full"
              >
                Proceed Anyway (Advanced Users)
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              <Button 
                onClick={onExploreAlternatives} 
                className="w-full justify-between"
                size="lg"
              >
                <span>Explore Alternative Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                onClick={onGetConsultation} 
                variant="outline"
                className="w-full"
              >
                Schedule a Consultation
              </Button>
              <Button 
                onClick={onProceedWithAgent} 
                variant="ghost"
                className="w-full text-sm"
              >
                I still want to try AI agents
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{responses.length}</div>
              <div className="text-xs text-muted-foreground">Questions Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{analysis.insights.strengths.length}</div>
              <div className="text-xs text-muted-foreground">Strengths Identified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{analysis.insights.recommendations.length}</div>
              <div className="text-xs text-muted-foreground">Recommendations</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{analysis.estimatedTimeline}</div>
              <div className="text-xs text-muted-foreground">Est. Timeline</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};