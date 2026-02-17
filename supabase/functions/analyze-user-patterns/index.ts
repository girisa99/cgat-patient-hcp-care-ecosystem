import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserPattern {
  experienceLevel: string;
  commonGoals: string[];
  successFactors: string[];
  challengeAreas: string[];
  recommendedImprovements: string[];
}

interface JourneyOptimization {
  stageId: string;
  currentConversionRate: number;
  suggestedImprovements: string[];
  personalizedContent: any;
  estimatedImpact: number;
}

interface AIRecommendation {
  type: 'template' | 'workflow' | 'connector' | 'knowledge';
  title: string;
  description: string;
  confidence: number;
  implementation: any;
  expectedOutcome: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { analysisType, filters, userId } = await req.json();

    let analysisResult = {};

    switch (analysisType) {
      case 'user_patterns':
        analysisResult = await analyzeUserPatterns(supabaseClient, filters);
        break;
      case 'journey_optimization':
        analysisResult = await analyzeJourneyOptimization(supabaseClient, filters);
        break;
      case 'ai_recommendations':
        analysisResult = await generateAIRecommendations(supabaseClient, userId);
        break;
      case 'template_optimization':
        analysisResult = await analyzeTemplateOptimization(supabaseClient);
        break;
      case 'knowledge_gaps':
        analysisResult = await identifyKnowledgeGaps(supabaseClient);
        break;
      default:
        throw new Error('Invalid analysis type');
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-user-patterns function:', error);
    return new Response(JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeUserPatterns(supabaseClient: any, filters: any): Promise<UserPattern[]> {
  // Fetch questionnaire sessions data
  const { data: sessions, error } = await supabaseClient
    .from('questionnaire_sessions')
    .select('*')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) throw error;

  const patterns: Record<string, UserPattern> = {};

  for (const session of sessions) {
    const responses = session.responses as any[];
    const analysis = session.analysis as any;
    
    const experienceLevel = responses.find(r => r.questionId === 'experience_level')?.value || 'unknown';
    
    if (!patterns[experienceLevel]) {
      patterns[experienceLevel] = {
        experienceLevel,
        commonGoals: [],
        successFactors: [],
        challengeAreas: [],
        recommendedImprovements: []
      };
    }

    // Analyze goals and patterns
    const goals = responses.filter(r => 
      r.questionId.includes('goal') || r.questionId.includes('motivation')
    ).map(r => r.value);
    
    patterns[experienceLevel].commonGoals.push(...goals);
    
    // Analyze success factors
    if (analysis.suitabilityScore > 70) {
      patterns[experienceLevel].successFactors.push(...analysis.insights.strengths);
    } else {
      patterns[experienceLevel].challengeAreas.push(...analysis.insights.gaps);
    }
  }

  // Process and deduplicate patterns
  return Object.values(patterns).map(pattern => ({
    ...pattern,
    commonGoals: getMostFrequent(pattern.commonGoals, 5),
    successFactors: getMostFrequent(pattern.successFactors, 5),
    challengeAreas: getMostFrequent(pattern.challengeAreas, 5),
    recommendedImprovements: generateImprovements(pattern)
  }));
}

async function analyzeJourneyOptimization(supabaseClient: any, filters: any): Promise<JourneyOptimization[]> {
  // Analyze agent creation flow data
  const { data: sessions } = await supabaseClient
    .from('agent_sessions')
    .select('*')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const { data: questionnaireSessions } = await supabaseClient
    .from('questionnaire_sessions')
    .select('*')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const journeyStages = [
    'questionnaire_completion',
    'agent_creation_start', 
    'basic_info_completion',
    'knowledge_setup',
    'actions_configuration',
    'deployment_setup',
    'agent_completion'
  ];

  const optimizations: JourneyOptimization[] = [];

  for (const stage of journeyStages) {
    const stageData = analyzeStagePerformance(stage, sessions, questionnaireSessions);
    
    optimizations.push({
      stageId: stage,
      currentConversionRate: stageData.conversionRate,
      suggestedImprovements: generateStageImprovements(stage, stageData),
      personalizedContent: generatePersonalizedContent(stage, stageData),
      estimatedImpact: calculateEstimatedImpact(stageData)
    });
  }

  return optimizations;
}

async function generateAIRecommendations(supabaseClient: any, userId?: string): Promise<AIRecommendation[]> {
  const recommendations: AIRecommendation[] = [];

  // Get user's recent activity and patterns
  const { data: userSessions } = await supabaseClient
    .from('questionnaire_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: agentSessions } = await supabaseClient
    .from('agent_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Template recommendations
  if (userSessions && userSessions.length > 0) {
    const latestSession = userSessions[0];
    const analysis = latestSession.analysis as any;
    
    if (analysis.complexityLevel === 'Low' || analysis.complexityLevel === 'Medium') {
      recommendations.push({
        type: 'template',
        title: 'Suggested Agent Templates',
        description: 'Based on your goals, these templates could accelerate your agent creation',
        confidence: 0.85,
        implementation: {
          templates: suggestTemplatesBasedOnGoals(analysis),
          customizationTips: generateCustomizationTips(analysis)
        },
        expectedOutcome: 'Reduce setup time by 50-70%'
      });
    }

    // Workflow recommendations
    recommendations.push({
      type: 'workflow',
      title: 'Optimized Workflow Suggestions',
      description: 'Streamlined steps based on your experience level',
      confidence: 0.78,
      implementation: {
        workflow: generateOptimizedWorkflow(analysis),
        shortcuts: identifyWorkflowShortcuts(analysis)
      },
      expectedOutcome: 'Improved completion rate and user satisfaction'
    });

    // Connector recommendations
    if (analysis.insights.recommendations.some((r: string) => r.includes('integration'))) {
      recommendations.push({
        type: 'connector',
        title: 'Integration Recommendations',
        description: 'Suggested connectors based on your business context',
        confidence: 0.72,
        implementation: {
          connectors: suggestRelevantConnectors(analysis),
          setupGuide: generateConnectorSetupGuide(analysis)
        },
        expectedOutcome: 'Enhanced agent capabilities and workflow automation'
      });
    }

    // Knowledge base recommendations
    recommendations.push({
      type: 'knowledge',
      title: 'Knowledge Base Optimization',
      description: 'Recommended knowledge sources and RAG improvements',
      confidence: 0.80,
      implementation: {
        knowledgeSources: suggestKnowledgeSources(analysis),
        ragOptimizations: generateRAGOptimizations(analysis)
      },
      expectedOutcome: 'Improved agent accuracy and response quality'
    });
  }

  return recommendations;
}

async function analyzeTemplateOptimization(supabaseClient: any): Promise<any> {
  // Fetch template usage data
  const { data: templates } = await supabaseClient
    .from('agent_templates')
    .select('*');

  const { data: sessions } = await supabaseClient
    .from('agent_sessions')
    .select('template_id, status, created_at, updated_at')
    .not('template_id', 'is', null);

  const templateAnalysis = templates?.map((template: any) => {
    const templateSessions = sessions?.filter((s: any) => s.template_id === template.id) || [];
    const completedSessions = templateSessions.filter((s: any) => s.status === 'completed');
    
    const conversionRate = templateSessions.length > 0 
      ? completedSessions.length / templateSessions.length 
      : 0;
    
    const avgCompletionTime = calculateAverageCompletionTime(templateSessions);
    
    return {
      templateId: template.id,
      templateName: template.name,
      usageCount: templateSessions.length,
      conversionRate,
      avgCompletionTime,
      suggestions: generateTemplateImprovements(template, templateSessions),
      popularFeatures: identifyPopularFeatures(templateSessions),
      dropOffPoints: identifyDropOffPoints(templateSessions)
    };
  }) || [];

  return {
    templates: templateAnalysis,
    overallInsights: generateOverallTemplateInsights(templateAnalysis),
    recommendedUpdates: prioritizeTemplateUpdates(templateAnalysis)
  };
}

async function identifyKnowledgeGaps(supabaseClient: any): Promise<any> {
  const { data: sessions } = await supabaseClient
    .from('questionnaire_sessions')
    .select('*')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const knowledgeGaps: {
    frequentQuestions: string[];
    missingDocumentation: string[];
    confusingConcepts: any[];
    suggestedContent: any[];
  } = {
    frequentQuestions: [],
    missingDocumentation: [],
    confusingConcepts: [],
    suggestedContent: []
  };

  // Analyze where users struggle or ask for help
  sessions?.forEach((session: any) => {
    const responses = session.responses as any[];
    const analysis = session.analysis as any;
    
    // Identify confusion points
    if (analysis.insights.gaps.length > 0) {
      knowledgeGaps.confusingConcepts.push(...analysis.insights.gaps);
    }
    
    // Identify areas where users need more guidance
    const lowClarityResponses = responses.filter(r => 
      r.questionId === 'problem_clarity' && r.value < 3
    );
    
    if (lowClarityResponses.length > 0) {
      knowledgeGaps.missingDocumentation.push('Problem definition guidance');
      knowledgeGaps.suggestedContent.push({
        type: 'guide',
        title: 'How to Define Your AI Agent Requirements',
        priority: 'high',
        estimatedImpact: 'Reduce low clarity scores by 40%'
      });
    }
  });

  return {
    gaps: knowledgeGaps,
    contentRecommendations: generateContentRecommendations(knowledgeGaps),
    prioritizedUpdates: prioritizeKnowledgeUpdates(knowledgeGaps)
  };
}

// Helper functions
function getMostFrequent(arr: string[], limit: number): string[] {
  const frequency: Record<string, number> = {};
  arr.forEach(item => {
    if (item && typeof item === 'string') {
      frequency[item] = (frequency[item] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item);
}

function generateImprovements(pattern: UserPattern): string[] {
  const improvements = [];
  
  if (pattern.challengeAreas.includes('Problem definition needs more clarity')) {
    improvements.push('Add interactive problem definition wizard');
    improvements.push('Provide more examples and templates for common use cases');
  }
  
  if (pattern.experienceLevel.includes('beginner')) {
    improvements.push('Create more guided tutorials');
    improvements.push('Add tooltips and contextual help');
  }
  
  return improvements;
}

function analyzeStagePerformance(stage: string, sessions: any[], questionnaireSessions: any[]): any {
  // Mock analysis - replace with actual implementation
  return {
    conversionRate: Math.random() * 0.4 + 0.6, // 60-100%
    avgTimeSpent: Math.random() * 300 + 60, // 1-6 minutes
    dropOffReasons: ['unclear instructions', 'too complex', 'missing guidance'],
    userFeedback: []
  };
}

function generateStageImprovements(stage: string, stageData: any): string[] {
  const improvements = [];
  
  if (stageData.conversionRate < 0.7) {
    improvements.push('Simplify the user interface');
    improvements.push('Add progressive disclosure');
    improvements.push('Provide better onboarding');
  }
  
  if (stageData.avgTimeSpent > 300) {
    improvements.push('Reduce cognitive load');
    improvements.push('Add auto-suggestions');
    improvements.push('Pre-fill common options');
  }
  
  return improvements;
}

function generatePersonalizedContent(stage: string, stageData: any): any {
  return {
    beginnerContent: {
      tooltips: true,
      examples: true,
      guidance: 'high'
    },
    advancedContent: {
      shortcuts: true,
      bulkOperations: true,
      advancedOptions: true
    }
  };
}

function calculateEstimatedImpact(stageData: any): number {
  // Simple calculation based on current conversion rate
  const currentRate = stageData.conversionRate;
  const potentialImprovement = (1 - currentRate) * 0.3; // Assume 30% improvement potential
  return Math.round(potentialImprovement * 100);
}

function suggestTemplatesBasedOnGoals(analysis: any): any[] {
  const templates = [];
  
  if (analysis.insights.strengths.includes('Clear business motivation')) {
    templates.push({
      name: 'Business Process Automation',
      match: 0.9,
      reason: 'Perfect for business-focused use cases'
    });
  }
  
  return templates;
}

function generateCustomizationTips(analysis: any): string[] {
  return [
    'Start with basic configuration and expand gradually',
    'Focus on your primary use case first',
    'Test with sample data before full deployment'
  ];
}

function generateOptimizedWorkflow(analysis: any): any {
  return {
    steps: [
      { id: 'setup', duration: '2-3 min', complexity: 'low' },
      { id: 'configure', duration: '5-10 min', complexity: 'medium' },
      { id: 'test', duration: '3-5 min', complexity: 'low' },
      { id: 'deploy', duration: '1-2 min', complexity: 'low' }
    ],
    totalTime: '11-20 minutes',
    skipOptions: ['advanced_settings', 'custom_integrations']
  };
}

function identifyWorkflowShortcuts(analysis: any): string[] {
  return [
    'Use quick setup for common use cases',
    'Skip advanced configuration initially',
    'Auto-generate based on templates'
  ];
}

function suggestRelevantConnectors(analysis: any): any[] {
  return [
    { name: 'Email Integration', priority: 'high', setup_time: '5 min' },
    { name: 'Calendar Sync', priority: 'medium', setup_time: '3 min' },
    { name: 'CRM Connection', priority: 'high', setup_time: '10 min' }
  ];
}

function generateConnectorSetupGuide(analysis: any): any {
  return {
    quickStart: 'Connect your most important system first',
    stepByStep: ['Authenticate', 'Configure', 'Test', 'Activate'],
    troubleshooting: 'Common issues and solutions'
  };
}

function suggestKnowledgeSources(analysis: any): any[] {
  return [
    { type: 'documentation', source: 'company_docs', priority: 'high' },
    { type: 'faq', source: 'support_tickets', priority: 'medium' },
    { type: 'procedures', source: 'internal_wiki', priority: 'high' }
  ];
}

function generateRAGOptimizations(analysis: any): any {
  return {
    chunkSize: 'optimize for your content type',
    embeddings: 'use domain-specific models if available',
    retrieval: 'implement hybrid search for better accuracy'
  };
}

function calculateAverageCompletionTime(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  const completionTimes = sessions
    .filter(s => s.status === 'completed')
    .map(s => new Date(s.updated_at).getTime() - new Date(s.created_at).getTime());
  
  return completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
}

function generateTemplateImprovements(template: any, sessions: any[]): string[] {
  return [
    'Add more contextual help',
    'Simplify initial setup',
    'Provide better default values'
  ];
}

function identifyPopularFeatures(sessions: any[]): string[] {
  return ['basic_setup', 'integrations', 'testing'];
}

function identifyDropOffPoints(sessions: any[]): string[] {
  return ['knowledge_configuration', 'advanced_settings'];
}

function generateOverallTemplateInsights(templateAnalysis: any[]): any {
  return {
    bestPerforming: templateAnalysis.sort((a, b) => b.conversionRate - a.conversionRate)[0],
    needsImprovement: templateAnalysis.filter(t => t.conversionRate < 0.6),
    usage_trends: 'Templates with simpler setup have higher completion rates'
  };
}

function prioritizeTemplateUpdates(templateAnalysis: any[]): any[] {
  return templateAnalysis
    .filter(t => t.conversionRate < 0.7 || t.usageCount > 10)
    .map(t => ({
      templateId: t.templateId,
      priority: t.conversionRate < 0.5 ? 'urgent' : 'normal',
      expectedImpact: 'high',
      estimatedEffort: 'medium'
    }));
}

function generateContentRecommendations(gaps: any): any[] {
  return [
    {
      type: 'tutorial',
      title: 'Agent Planning Workshop',
      description: 'Interactive guide to help users define clear requirements',
      priority: 'high'
    },
    {
      type: 'examples',
      title: 'Success Story Library',
      description: 'Real examples of successful agent implementations',
      priority: 'medium'
    }
  ];
}

function prioritizeKnowledgeUpdates(gaps: any): any[] {
  return [
    {
      area: 'problem_definition',
      priority: 'urgent',
      impact: 'high',
      effort: 'medium'
    },
    {
      area: 'technical_guidance',
      priority: 'normal',
      impact: 'medium',
      effort: 'low'
    }
  ];
}