import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntelligentRecommendation {
  id: string;
  type: 'journey_improvement' | 'template_optimization' | 'workflow_enhancement' | 'knowledge_suggestion';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  implementation: any;
  expectedOutcome: string;
  estimatedImpact: number;
  createdAt: Date;
  appliedAt?: Date;
  status: 'pending' | 'applied' | 'dismissed';
}

export interface UserPatternInsight {
  experienceLevel: string;
  commonGoals: string[];
  successFactors: string[];
  challengeAreas: string[];
  recommendedImprovements: string[];
  userCount: number;
  conversionRate: number;
}

export interface JourneyAnalytics {
  stage: string;
  conversionRate: number;
  avgTimeSpent: number;
  dropOffReasons: string[];
  suggestions: string[];
  personalizedContent: any;
}

export const useIntelligentRecommendations = () => {
  const [recommendations, setRecommendations] = useState<IntelligentRecommendation[]>([]);
  const [userPatterns, setUserPatterns] = useState<UserPatternInsight[]>([]);
  const [journeyAnalytics, setJourneyAnalytics] = useState<JourneyAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeUserPatterns = async (filters?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-user-patterns', {
        body: {
          analysisType: 'user_patterns',
          filters: filters || {}
        }
      });

      if (functionError) throw functionError;

      setUserPatterns(data || []);
      
      // Generate recommendations based on patterns
      const newRecommendations = generatePatternBasedRecommendations(data || []);
      setRecommendations(prev => [...prev, ...newRecommendations]);

    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze user patterns. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeJourneyOptimization = async () => {
    setIsLoading(true);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-user-patterns', {
        body: {
          analysisType: 'journey_optimization',
          filters: {}
        }
      });

      if (functionError) throw functionError;

      setJourneyAnalytics(data || []);
      
      // Generate journey improvement recommendations
      const journeyRecommendations = generateJourneyRecommendations(data || []);
      setRecommendations(prev => [...prev, ...journeyRecommendations]);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonalizedRecommendations = async (userId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-user-patterns', {
        body: {
          analysisType: 'ai_recommendations',
          userId
        }
      });

      if (functionError) throw functionError;

      const personalizedRecs = (data || []).map((rec: any) => ({
        id: `ai_rec_${Date.now()}_${Math.random()}`,
        type: 'workflow_enhancement',
        title: rec.title,
        description: rec.description,
        confidence: rec.confidence,
        priority: rec.confidence > 0.8 ? 'high' : rec.confidence > 0.6 ? 'medium' : 'low',
        category: rec.type,
        implementation: rec.implementation,
        expectedOutcome: rec.expectedOutcome,
        estimatedImpact: Math.round(rec.confidence * 100),
        createdAt: new Date(),
        status: 'pending' as const
      }));

      setRecommendations(prev => [...prev, ...personalizedRecs]);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeTemplates = async () => {
    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-user-patterns', {
        body: {
          analysisType: 'template_optimization'
        }
      });

      if (functionError) throw functionError;

      // Generate template optimization recommendations
      const templateRecs = generateTemplateRecommendations(data);
      setRecommendations(prev => [...prev, ...templateRecs]);

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const identifyKnowledgeGaps = async () => {
    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-user-patterns', {
        body: {
          analysisType: 'knowledge_gaps'
        }
      });

      if (functionError) throw functionError;

      // Generate knowledge improvement recommendations
      const knowledgeRecs = generateKnowledgeRecommendations(data);
      setRecommendations(prev => [...prev, ...knowledgeRecs]);

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const applyRecommendation = async (recommendationId: string) => {
    const recommendation = recommendations.find(r => r.id === recommendationId);
    if (!recommendation) return;

    try {
      // Apply the recommendation based on its type
      await applyRecommendationImplementation(recommendation);
      
      // Update recommendation status
      setRecommendations(prev =>
        prev.map(r =>
          r.id === recommendationId
            ? { ...r, status: 'applied', appliedAt: new Date() }
            : r
        )
      );

      toast({
        title: "Recommendation Applied",
        description: `Successfully applied: ${recommendation.title}`,
      });

    } catch (err: any) {
      toast({
        title: "Application Failed",
        description: `Failed to apply recommendation: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  const dismissRecommendation = (recommendationId: string) => {
    setRecommendations(prev =>
      prev.map(r =>
        r.id === recommendationId
          ? { ...r, status: 'dismissed' }
          : r
      )
    );
  };

  const getRecommendationsByType = (type: string) => {
    return recommendations.filter(r => r.type === type && r.status === 'pending');
  };

  const getRecommendationsByPriority = (priority: string) => {
    return recommendations.filter(r => r.priority === priority && r.status === 'pending');
  };

  // Auto-run analysis on mount
  useEffect(() => {
    analyzeUserPatterns();
    analyzeJourneyOptimization();
  }, []);

  return {
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
  };
};

// Helper functions for generating recommendations
function generatePatternBasedRecommendations(patterns: UserPatternInsight[]): IntelligentRecommendation[] {
  const recommendations: IntelligentRecommendation[] = [];

  patterns.forEach((pattern, index) => {
    if (pattern.challengeAreas.length > 0) {
      recommendations.push({
        id: `pattern_rec_${index}`,
        type: 'journey_improvement',
        title: `Improve Journey for ${pattern.experienceLevel} Users`,
        description: `Address common challenges: ${pattern.challengeAreas.slice(0, 2).join(', ')}`,
        confidence: 0.8,
        priority: pattern.conversionRate < 0.6 ? 'high' : 'medium',
        category: 'User Experience',
        implementation: {
          targetAudience: pattern.experienceLevel,
          improvements: pattern.recommendedImprovements,
          expectedUsers: pattern.userCount
        },
        expectedOutcome: `Increase conversion rate from ${Math.round(pattern.conversionRate * 100)}% to ${Math.round((pattern.conversionRate + 0.15) * 100)}%`,
        estimatedImpact: 15,
        createdAt: new Date(),
        status: 'pending'
      });
    }
  });

  return recommendations;
}

function generateJourneyRecommendations(journeyData: JourneyAnalytics[]): IntelligentRecommendation[] {
  const recommendations: IntelligentRecommendation[] = [];

  journeyData.forEach((stage, index) => {
    if (stage.conversionRate < 0.7) {
      recommendations.push({
        id: `journey_rec_${index}`,
        type: 'journey_improvement',
        title: `Optimize ${stage.stage} Stage`,
        description: `Current conversion: ${Math.round(stage.conversionRate * 100)}%. Suggested improvements available.`,
        confidence: 0.75,
        priority: stage.conversionRate < 0.5 ? 'urgent' : 'high',
        category: 'Journey Optimization',
        implementation: {
          stage: stage.stage,
          currentRate: stage.conversionRate,
          suggestions: stage.suggestions,
          personalizedContent: stage.personalizedContent
        },
        expectedOutcome: `Improve conversion by 20-30%`,
        estimatedImpact: 25,
        createdAt: new Date(),
        status: 'pending'
      });
    }
  });

  return recommendations;
}

function generateTemplateRecommendations(templateData: any): IntelligentRecommendation[] {
  const recommendations: IntelligentRecommendation[] = [];

  if (templateData?.recommendedUpdates) {
    templateData.recommendedUpdates.forEach((update: any, index: number) => {
      recommendations.push({
        id: `template_rec_${index}`,
        type: 'template_optimization',
        title: `Update Template: ${update.templateId}`,
        description: `Template showing low conversion rate. Priority: ${update.priority}`,
        confidence: 0.85,
        priority: update.priority === 'urgent' ? 'urgent' : 'high',
        category: 'Template Optimization',
        implementation: {
          templateId: update.templateId,
          expectedImpact: update.expectedImpact,
          estimatedEffort: update.estimatedEffort,
          improvements: templateData.templates?.find((t: any) => t.templateId === update.templateId)?.suggestions || []
        },
        expectedOutcome: `Increase template success rate by 30-40%`,
        estimatedImpact: 35,
        createdAt: new Date(),
        status: 'pending'
      });
    });
  }

  return recommendations;
}

function generateKnowledgeRecommendations(knowledgeData: any): IntelligentRecommendation[] {
  const recommendations: IntelligentRecommendation[] = [];

  if (knowledgeData?.contentRecommendations) {
    knowledgeData.contentRecommendations.forEach((content: any, index: number) => {
      recommendations.push({
        id: `knowledge_rec_${index}`,
        type: 'knowledge_suggestion',
        title: content.title,
        description: content.description,
        confidence: 0.8,
        priority: content.priority === 'high' ? 'high' : 'medium',
        category: 'Knowledge Base',
        implementation: {
          type: content.type,
          content: content,
          gaps: knowledgeData.gaps
        },
        expectedOutcome: `Reduce user confusion and support tickets`,
        estimatedImpact: 20,
        createdAt: new Date(),
        status: 'pending'
      });
    });
  }

  return recommendations;
}

async function applyRecommendationImplementation(recommendation: IntelligentRecommendation) {
  // Implementation would depend on the recommendation type
  switch (recommendation.type) {
    case 'journey_improvement':
      // Update journey stages, add guidance, etc.
      console.log('Applying journey improvement:', recommendation.implementation);
      break;
    case 'template_optimization':
      // Update templates with suggested improvements
      console.log('Applying template optimization:', recommendation.implementation);
      break;
    case 'workflow_enhancement':
      // Optimize workflows and user paths
      console.log('Applying workflow enhancement:', recommendation.implementation);
      break;
    case 'knowledge_suggestion':
      // Add new knowledge base content
      console.log('Applying knowledge suggestion:', recommendation.implementation);
      break;
    default:
      throw new Error('Unknown recommendation type');
  }
}