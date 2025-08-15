import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  Target, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Zap,
  BookOpen,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useIntelligentRecommendations } from '@/hooks/useIntelligentRecommendations';

export const IntelligenceCenter: React.FC = () => {
  const {
    recommendations,
    userPatterns,
    journeyAnalytics,
    isLoading,
    error,
    analyzeUserPatterns,
    analyzeJourneyOptimization,
    getPersonalizedRecommendations,
    optimizeTemplates,
    identifyKnowledgeGaps,
    applyRecommendation,
    dismissRecommendation,
    getRecommendationsByType,
    getRecommendationsByPriority
  } = useIntelligentRecommendations();

  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);

  const handleRunAnalysis = async (analysisType: string) => {
    setActiveAnalysis(analysisType);
    try {
      switch (analysisType) {
        case 'patterns':
          await analyzeUserPatterns();
          break;
        case 'journey':
          await analyzeJourneyOptimization();
          break;
        case 'templates':
          await optimizeTemplates();
          break;
        case 'knowledge':
          await identifyKnowledgeGaps();
          break;
      }
    } finally {
      setActiveAnalysis(null);
    }
  };

  const getPriorityColor = (priority: string): "destructive" | "default" | "secondary" | "outline" => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'journey_improvement': return <Target className="w-4 h-4" />;
      case 'template_optimization': return <Settings className="w-4 h-4" />;
      case 'workflow_enhancement': return <Zap className="w-4 h-4" />;
      case 'knowledge_suggestion': return <BookOpen className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Intelligence Center
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered insights and recommendations to optimize your agent-building platform
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleRunAnalysis('patterns')} 
            disabled={isLoading}
            variant="outline"
          >
            {activeAnalysis === 'patterns' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Users className="w-4 h-4 mr-2" />
            )}
            Analyze Patterns
          </Button>
          <Button 
            onClick={() => handleRunAnalysis('journey')} 
            disabled={isLoading}
            variant="outline"
          >
            {activeAnalysis === 'journey' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-2" />
            )}
            Optimize Journey
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>Analysis Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">
            Recommendations ({recommendations.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="patterns">User Patterns</TabsTrigger>
          <TabsTrigger value="journey">Journey Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {getRecommendationsByPriority('urgent').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Urgent Recommendations
                </h3>
                <div className="grid gap-3">
                  {getRecommendationsByPriority('urgent').map((rec) => (
                    <RecommendationCard 
                      key={rec.id} 
                      recommendation={rec}
                      onApply={applyRecommendation}
                      onDismiss={dismissRecommendation}
                      getTypeIcon={getTypeIcon}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {getRecommendationsByPriority('high').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  High Priority Recommendations
                </h3>
                <div className="grid gap-3">
                  {getRecommendationsByPriority('high').map((rec) => (
                    <RecommendationCard 
                      key={rec.id} 
                      recommendation={rec}
                      onApply={applyRecommendation}
                      onDismiss={dismissRecommendation}
                      getTypeIcon={getTypeIcon}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {getRecommendationsByPriority('medium').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Medium Priority Recommendations
                </h3>
                <div className="grid gap-3">
                  {getRecommendationsByPriority('medium').map((rec) => (
                    <RecommendationCard 
                      key={rec.id} 
                      recommendation={rec}
                      onApply={applyRecommendation}
                      onDismiss={dismissRecommendation}
                      getTypeIcon={getTypeIcon}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {recommendations.filter(r => r.status === 'pending').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    No pending recommendations. Run analysis to discover new optimization opportunities.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4">
            {userPatterns.map((pattern, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pattern.experienceLevel} Users</span>
                    <Badge variant="outline">{pattern.userCount} users</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Conversion Rate</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={pattern.conversionRate * 100} className="flex-1" />
                      <span className="text-sm font-medium">{Math.round(pattern.conversionRate * 100)}%</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Success Factors</h4>
                      <ul className="space-y-1">
                        {pattern.successFactors.slice(0, 3).map((factor, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-orange-600">Challenge Areas</h4>
                      <ul className="space-y-1">
                        {pattern.challengeAreas.slice(0, 3).map((challenge, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Common Goals</h4>
                    <div className="flex flex-wrap gap-2">
                      {pattern.commonGoals.slice(0, 5).map((goal, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <div className="grid gap-4">
            {journeyAnalytics.map((stage, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{stage.stage.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(stage.avgTimeSpent / 60)}m avg
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-sm font-bold">{Math.round(stage.conversionRate * 100)}%</span>
                    </div>
                    <Progress value={stage.conversionRate * 100} />
                  </div>

                  {stage.dropOffReasons.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Drop-off Reasons</h4>
                      <ul className="space-y-1">
                        {stage.dropOffReasons.slice(0, 3).map((reason, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {stage.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-blue-600">Improvement Suggestions</h4>
                      <ul className="space-y-1">
                        {stage.suggestions.slice(0, 3).map((suggestion, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <Lightbulb className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleRunAnalysis('templates')} 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={isLoading}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Optimize Templates
                </Button>
                <Button 
                  onClick={() => handleRunAnalysis('knowledge')} 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={isLoading}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Identify Knowledge Gaps
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Applied Recommendations</span>
                  <Badge variant="secondary">
                    {recommendations.filter(r => r.status === 'applied').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Actions</span>
                  <Badge variant="outline">
                    {recommendations.filter(r => r.status === 'pending').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">User Patterns Identified</span>
                  <Badge variant="secondary">{userPatterns.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const RecommendationCard: React.FC<{
  recommendation: any;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
  getTypeIcon: (type: string) => React.ReactNode;
  getPriorityColor: (priority: string) => "destructive" | "default" | "secondary" | "outline";
}> = ({ recommendation, onApply, onDismiss, getTypeIcon, getPriorityColor }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(recommendation.type)}
            <h3 className="font-semibold">{recommendation.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor(recommendation.priority)}>
              {recommendation.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {Math.round(recommendation.confidence * 100)}% confidence
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm">
            <span className="font-medium text-green-600">Expected Impact: </span>
            <span>{recommendation.expectedOutcome}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            +{recommendation.estimatedImpact}%
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onApply(recommendation.id)} 
            size="sm"
            className="flex-1"
          >
            Apply Recommendation
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
          <Button 
            onClick={() => onDismiss(recommendation.id)} 
            variant="ghost" 
            size="sm"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};