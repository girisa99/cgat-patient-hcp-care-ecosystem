/**
 * useRalphWiggum - Automated AI Review Hook for Genie Studio
 * DEV-ONLY: Provides automated content analysis and improvement suggestions
 * 
 * @description This hook integrates with the Universal AI system to provide
 * real-time content reviews across all Genie Studio modules.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  ReviewRequest,
  ReviewResult,
  ReviewFinding,
  QueuedReview,
  RalphWiggumConfig,
  GenieModule,
  ReviewSeverity,
  UseRalphWiggumReturn,
  ModuleContent,
  JourneyAnalysis
} from './types';
import { DEFAULT_RALPH_CONFIG } from './types';

// DEV-ONLY: Only run in development mode
const isDev = import.meta.env.DEV;

/**
 * Generate a unique ID for reviews
 */
const generateId = () => `ralph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Build the review prompt based on module content
 */
const buildReviewPrompt = (request: ReviewRequest): string => {
  const { moduleContent, includeJourneyAnalysis, compareWith } = request;
  
  let prompt = `You are Ralph Wiggum, a helpful AI reviewer for the Genie Studio content creation platform.
Analyze the following ${moduleContent.module.toUpperCase()} module content and provide actionable feedback.

Focus on:
1. Content quality and clarity
2. Consistency with best practices
3. Potential improvements
4. Any issues or concerns

`;

  // Add module-specific context
  switch (moduleContent.module) {
    case 'spark':
      prompt += `SPARK MODULE (Ideas/Brainstorming):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate the brainstorming quality, idea diversity, and actionability.`;
      break;
      
    case 'mind':
      prompt += `MIND MODULE (Script Editor/TTS/Voice):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate script quality, readability, pacing, TTS compatibility, and voice settings.`;
      break;
      
    case 'vibe':
      prompt += `VIBE MODULE (Recording Studio):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate recording quality, clip organization, timeline coherence, and production readiness.`;
      break;
      
    case 'guided':
      prompt += `GUIDED MODULE (Workflow):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate workflow progress, step completion, and potential blockers.`;
      break;
      
    case 'agents':
      prompt += `AGENTS MODULE (AI Agents):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate agent performance, task efficiency, and error patterns.`;
      break;
      
    case 'ask-genie':
      prompt += `ASK GENIE MODULE (AI Chat):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate conversation quality, response helpfulness, and query clarity.`;
      break;
      
    case 'arc':
      prompt += `ARC MODULE (Production Hub):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate production status, scheduling, team coordination, and pending tasks.`;
      break;
      
    case 'subscription':
      prompt += `SUBSCRIPTION MODULE (Plans & Payment):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate pricing clarity, plan comparison, upgrade path, payment flow UX, and value proposition.`;
      break;
      
    case 'voice-generator':
      prompt += `VOICE GENERATOR MODULE (AI TTS):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate script suitability for TTS, voice selection appropriateness, pronunciation clarity, and audio quality settings.`;
      break;
      
    case 'templates':
      prompt += `TEMPLATES MODULE:
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate template selection, customization completeness, variable usage, and content fit.`;
      break;
      
    case 'library':
      prompt += `LIBRARY MODULE (Media Library):
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate organization, naming conventions, accessibility, and content management practices.`;
      break;
      
    case 'native-features':
      prompt += `NATIVE FEATURES MODULE:
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate feature availability, permission handling, platform optimization, and offline capability.`;
      break;
      
    case 'genie-page':
      prompt += `GENIE STUDIO PAGE:
${JSON.stringify(moduleContent.content, null, 2)}

Evaluate page structure, user flow coherence, component loading, navigation clarity, and overall UX.`;
      break;
      
    default:
      prompt += `DASHBOARD:
${JSON.stringify(moduleContent.content, null, 2)}`;
  }
  
  if (includeJourneyAnalysis) {
    prompt += `

JOURNEY ANALYSIS:
Also analyze the user's journey through the content creation process.
Identify:
- Current stage in the workflow
- Expected next steps
- Potential blockers
- Completion percentage
- Any sequence issues or misalignments`;
  }
  
  if (compareWith && compareWith.length > 0) {
    prompt += `

CROSS-MODULE COMPARISON:
Compare with these related modules for consistency:
${JSON.stringify(compareWith, null, 2)}

Check for:
- Inconsistencies between modules
- Misaligned content or settings
- Missing connections`;
  }
  
  prompt += `

Respond with a JSON object in this exact format:
{
  "findings": [
    {
      "category": "quality|consistency|alignment|journey|performance|accessibility|engagement|technical",
      "severity": "info|suggestion|warning|critical",
      "title": "Brief title",
      "description": "Detailed description",
      "suggestion": "How to fix/improve",
      "location": "Where in the content (optional)"
    }
  ],
  "journeyAnalysis": {
    "currentStage": "stage name",
    "expectedNextStages": ["next", "steps"],
    "potentialBlockers": ["blocker1"],
    "recommendations": ["recommendation1"],
    "completionPercentage": 50,
    "sequenceIssues": [
      {"step": "step name", "issue": "description", "impact": "low|medium|high"}
    ]
  }
}`;

  return prompt;
};

/**
 * Parse AI response into structured review result
 */
const parseReviewResponse = (
  responseText: string,
  module: GenieModule,
  startTime: number
): ReviewResult => {
  const reviewId = generateId();
  const timestamp = Date.now();
  
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    const findings: ReviewFinding[] = (parsed.findings || []).map((f: any, idx: number) => ({
      id: `${reviewId}-finding-${idx}`,
      module,
      category: f.category || 'quality',
      severity: f.severity || 'info',
      title: f.title || 'Untitled Finding',
      description: f.description || '',
      suggestion: f.suggestion,
      location: f.location,
      relatedElements: f.relatedElements,
      timestamp
    }));
    
    const journeyAnalysis: JourneyAnalysis | undefined = parsed.journeyAnalysis ? {
      currentStage: parsed.journeyAnalysis.currentStage || 'Unknown',
      expectedNextStages: parsed.journeyAnalysis.expectedNextStages || [],
      potentialBlockers: parsed.journeyAnalysis.potentialBlockers || [],
      recommendations: parsed.journeyAnalysis.recommendations || [],
      completionPercentage: parsed.journeyAnalysis.completionPercentage || 0,
      sequenceIssues: parsed.journeyAnalysis.sequenceIssues || []
    } : undefined;
    
    return {
      id: reviewId,
      module,
      timestamp,
      findings,
      summary: {
        totalIssues: findings.length,
        criticalCount: findings.filter(f => f.severity === 'critical').length,
        warningCount: findings.filter(f => f.severity === 'warning').length,
        suggestionCount: findings.filter(f => f.severity === 'suggestion').length,
        infoCount: findings.filter(f => f.severity === 'info').length
      },
      journeyAnalysis,
      processingTimeMs: Date.now() - startTime
    };
  } catch (error) {
    console.error('[Ralph Wiggum] Failed to parse response:', error);
    
    // Return a default result with parsing error
    return {
      id: reviewId,
      module,
      timestamp,
      findings: [{
        id: `${reviewId}-error`,
        module,
        category: 'technical',
        severity: 'warning',
        title: 'Review Parsing Issue',
        description: 'Could not parse the AI review response. The content was still analyzed.',
        timestamp
      }],
      summary: { totalIssues: 1, criticalCount: 0, warningCount: 1, suggestionCount: 0, infoCount: 0 },
      processingTimeMs: Date.now() - startTime
    };
  }
};

/**
 * Main hook for Ralph Wiggum AI Review System
 */
export function useRalphWiggum(): UseRalphWiggumReturn {
  // State
  const [config, setConfig] = useState<RalphWiggumConfig>(DEFAULT_RALPH_CONFIG);
  const [isReviewing, setIsReviewing] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewResult | null>(null);
  const [reviewHistory, setReviewHistory] = useState<ReviewResult[]>([]);
  const [queue, setQueue] = useState<QueuedReview[]>([]);
  
  // Refs for rate limiting and debouncing
  const reviewCountRef = useRef(0);
  const lastReviewTimeRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset rate limit counter every minute
  useEffect(() => {
    const interval = setInterval(() => {
      reviewCountRef.current = 0;
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Check if we're within rate limits
  const canReview = useCallback(() => {
    if (!isDev) return false;
    if (!config.enabled) return false;
    if (reviewCountRef.current >= config.rateLimitPerMinute) return false;
    return true;
  }, [config.enabled, config.rateLimitPerMinute]);
  
  /**
   * Trigger a review for the given content
   */
  const triggerReview = useCallback(async (
    request: ReviewRequest
  ): Promise<ReviewResult | null> => {
    if (!isDev) {
      console.warn('[Ralph Wiggum] Reviews are only available in development mode');
      return null;
    }
    
    if (!canReview()) {
      console.warn('[Ralph Wiggum] Rate limit reached or reviews disabled');
      return null;
    }
    
    // Check if module is enabled
    if (!config.enabledModules.includes(request.moduleContent.module)) {
      console.log(`[Ralph Wiggum] Module ${request.moduleContent.module} is not enabled for reviews`);
      return null;
    }
    
    const queueItem: QueuedReview = {
      id: generateId(),
      request,
      status: 'pending',
      createdAt: Date.now()
    };
    
    setQueue(prev => [...prev.slice(-config.maxQueueSize + 1), queueItem]);
    setIsReviewing(true);
    
    const startTime = Date.now();
    
    try {
      // Update queue status
      setQueue(prev => prev.map(q => 
        q.id === queueItem.id ? { ...q, status: 'processing' as const } : q
      ));
      
      const prompt = buildReviewPrompt(request);
      
      // Call the AI processor via edge function
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          prompt,
          systemPrompt: `You are Ralph Wiggum, an AI content reviewer for Genie Studio. 
You provide helpful, constructive feedback to improve content quality.
Always respond with valid JSON. Be specific and actionable in your suggestions.`,
          model: 'gemini-2.0-flash',
          maxTokens: 2000
        }
      });
      
      if (error) throw error;
      
      const responseText = data?.content || data?.response || '';
      const result = parseReviewResponse(responseText, request.moduleContent.module, startTime);
      
      // Update state
      reviewCountRef.current++;
      lastReviewTimeRef.current = Date.now();
      
      setCurrentReview(result);
      setReviewHistory(prev => [...prev.slice(-49), result]); // Keep last 50 reviews
      setQueue(prev => prev.map(q => 
        q.id === queueItem.id 
          ? { ...q, status: 'completed' as const, completedAt: Date.now(), result } 
          : q
      ));
      
      if (!config.silentMode) {
        console.log(`[Ralph Wiggum] Review completed for ${request.moduleContent.module}:`, result.summary);
      }
      
      return result;
      
    } catch (error) {
      console.error('[Ralph Wiggum] Review failed:', error);
      
      setQueue(prev => prev.map(q => 
        q.id === queueItem.id 
          ? { ...q, status: 'failed' as const, error: String(error) } 
          : q
      ));
      
      return null;
    } finally {
      setIsReviewing(false);
    }
  }, [canReview, config.enabledModules, config.maxQueueSize, config.silentMode]);
  
  /**
   * Clear current review
   */
  const clearReview = useCallback(() => {
    setCurrentReview(null);
  }, []);
  
  /**
   * Update configuration
   */
  const updateConfig = useCallback((updates: Partial<RalphWiggumConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);
  
  /**
   * Pause auto-review
   */
  const pauseAutoReview = useCallback(() => {
    setConfig(prev => ({ ...prev, autoReview: false }));
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);
  
  /**
   * Resume auto-review
   */
  const resumeAutoReview = useCallback(() => {
    setConfig(prev => ({ ...prev, autoReview: true }));
  }, []);
  
  /**
   * Get findings for a specific module
   */
  const getModuleFindings = useCallback((module: GenieModule): ReviewFinding[] => {
    if (!currentReview) return [];
    return currentReview.findings.filter(f => f.module === module);
  }, [currentReview]);
  
  /**
   * Get count of findings by severity
   */
  const getSeverityCount = useCallback((severity: ReviewSeverity): number => {
    if (!currentReview) return 0;
    return currentReview.findings.filter(f => f.severity === severity).length;
  }, [currentReview]);
  
  /**
   * Export review report as markdown
   */
  const exportReviewReport = useCallback((): string => {
    if (!currentReview) return '# No Review Available';
    
    const { findings, summary, journeyAnalysis, module, timestamp } = currentReview;
    
    let report = `# Ralph Wiggum Review Report
**Module:** ${module}
**Date:** ${new Date(timestamp).toLocaleString()}

## Summary
- Total Issues: ${summary.totalIssues}
- Critical: ${summary.criticalCount}
- Warnings: ${summary.warningCount}
- Suggestions: ${summary.suggestionCount}
- Info: ${summary.infoCount}

## Findings
`;

    findings.forEach((f, i) => {
      report += `
### ${i + 1}. ${f.title}
- **Severity:** ${f.severity}
- **Category:** ${f.category}
${f.location ? `- **Location:** ${f.location}` : ''}

${f.description}

${f.suggestion ? `**Suggestion:** ${f.suggestion}` : ''}
`;
    });
    
    if (journeyAnalysis) {
      report += `
## Journey Analysis
- **Current Stage:** ${journeyAnalysis.currentStage}
- **Completion:** ${journeyAnalysis.completionPercentage}%
- **Next Steps:** ${journeyAnalysis.expectedNextStages.join(', ') || 'None identified'}
- **Blockers:** ${journeyAnalysis.potentialBlockers.join(', ') || 'None identified'}

### Recommendations
${journeyAnalysis.recommendations.map(r => `- ${r}`).join('\n') || 'None'}
`;
    }
    
    return report;
  }, [currentReview]);
  
  // Memoized return value
  return useMemo(() => ({
    isEnabled: isDev && config.enabled,
    isReviewing,
    currentReview,
    reviewHistory,
    queue,
    config,
    triggerReview,
    clearReview,
    updateConfig,
    pauseAutoReview,
    resumeAutoReview,
    getModuleFindings,
    getSeverityCount,
    exportReviewReport
  }), [
    config,
    isReviewing,
    currentReview,
    reviewHistory,
    queue,
    triggerReview,
    clearReview,
    updateConfig,
    pauseAutoReview,
    resumeAutoReview,
    getModuleFindings,
    getSeverityCount,
    exportReviewReport
  ]);
}

export default useRalphWiggum;
