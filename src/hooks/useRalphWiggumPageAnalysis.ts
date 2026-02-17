/**
 * Hook for integrating Ralph Wiggum analysis into any page
 * Automatically tracks page visits and enables AI analysis
 */

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRalphWiggumGlobal, FindingType, FindingSeverity } from '@/contexts/RalphWiggumContext';
import { supabase } from '@/integrations/supabase/client';

// DEV-ONLY check
const isDev = import.meta.env.DEV;

interface PageAnalysisConfig {
  moduleName: string;
  pageContent?: Record<string, unknown>;
  userFlow?: Array<{ action: string; timestamp: number }>;
  autoAnalyze?: boolean;
}

interface AnalysisResult {
  criticalIssues: Array<{ title: string; description: string; recommendation?: string }>;
  warnings: Array<{ title: string; description: string; recommendation?: string }>;
  suggestions: Array<{ title: string; description: string; recommendation?: string }>;
  journeyImprovements: Array<{ title: string; description: string; recommendation?: string }>;
}

// Production no-op functions - defined outside hook to avoid recreating
const noopAnalyze = async () => {};
const noopOpenPanel = () => {};

export const useRalphWiggumPageAnalysis = (config: PageAnalysisConfig) => {
  const location = useLocation();
  const { addFinding, isAnalyzing, triggerAnalysis, openPanel } = useRalphWiggumGlobal();
  const hasAnalyzed = useRef(false);
  const analysisInProgress = useRef(false);
  
  const pageRoute = location.pathname;
  
  // Memoize config values to prevent unnecessary re-renders
  const configModuleName = config.moduleName;
  const configPageContent = config.pageContent;
  const configUserFlow = config.userFlow;
  const configAutoAnalyze = config.autoAnalyze;
  
  // Run AI analysis - only define if in dev mode
  const runAnalysis = useCallback(async () => {
    // Skip in production
    if (!isDev) return;
    
    if (analysisInProgress.current) return;
    analysisInProgress.current = true;
    
    try {
      triggerAnalysis(configPageContent || {});
      
      const prompt = `You are Ralph Wiggum, a friendly UI/UX reviewer for a healthcare application.
Analyze this page content and provide specific, actionable feedback.

Page: ${pageRoute}
Module: ${configModuleName}
Content: ${JSON.stringify(configPageContent || {}, null, 2)}
User Flow: ${JSON.stringify(configUserFlow || [], null, 2)}

Provide your analysis in this JSON format:
{
  "criticalIssues": [{"title": "...", "description": "...", "recommendation": "..."}],
  "warnings": [{"title": "...", "description": "...", "recommendation": "..."}],
  "suggestions": [{"title": "...", "description": "...", "recommendation": "..."}],
  "journeyImprovements": [{"title": "...", "description": "...", "recommendation": "..."}]
}

Focus on:
- Accessibility issues
- UX flow problems
- Missing error states
- Empty state handling
- Loading state issues
- Navigation confusion
- Mobile responsiveness
- Healthcare compliance (HIPAA considerations)

Be specific and helpful. Only include actual issues you find.`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          prompt,
          systemPrompt: 'You are Ralph Wiggum, a helpful UI/UX reviewer. Respond ONLY with valid JSON.',
          model: 'gemini-2.0-flash',
          maxTokens: 2000
        }
      });

      if (error) {
        console.error('Ralph Wiggum analysis failed:', error);
        return;
      }

      // Parse response
      let result: AnalysisResult;
      try {
        const responseText = data?.response || data?.text || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          console.warn('Ralph Wiggum: No valid JSON in response');
          return;
        }
      } catch (parseError) {
        console.error('Failed to parse Ralph Wiggum response:', parseError);
        return;
      }

      // Add findings to database
      const addFindings = async (items: Array<{ title: string; description: string; recommendation?: string }>, type: FindingType, severity: FindingSeverity) => {
        for (const item of items) {
          await addFinding({
            finding_hash: '',
            page_route: pageRoute,
            module_name: configModuleName,
            finding_type: type,
            severity,
            title: item.title,
            description: item.description,
            recommendation: item.recommendation,
            status: 'new',
            ai_confidence: 0.85,
            ai_model_used: 'gemini-2.0-flash',
            raw_ai_response: data,
            page_content_snapshot: configPageContent,
            user_flow_snapshot: configUserFlow ? { flow: configUserFlow } : undefined
          });
        }
      };

      // Add all findings
      if (result.criticalIssues?.length) {
        await addFindings(result.criticalIssues, 'critical', 'high');
      }
      if (result.warnings?.length) {
        await addFindings(result.warnings, 'warning', 'medium');
      }
      if (result.suggestions?.length) {
        await addFindings(result.suggestions, 'suggestion', 'low');
      }
      if (result.journeyImprovements?.length) {
        await addFindings(result.journeyImprovements, 'journey', 'medium');
      }

      console.log(`🐛 Ralph Wiggum analyzed ${pageRoute}:`, {
        critical: result.criticalIssues?.length || 0,
        warnings: result.warnings?.length || 0,
        suggestions: result.suggestions?.length || 0,
        journey: result.journeyImprovements?.length || 0
      });
    } catch (error) {
      console.error('Ralph Wiggum analysis error:', error);
    } finally {
      analysisInProgress.current = false;
    }
  }, [pageRoute, configModuleName, configPageContent, configUserFlow, addFinding, triggerAnalysis]);

  // Auto-analyze on mount if enabled (only in dev)
  useEffect(() => {
    if (!isDev) return;
    if (!configAutoAnalyze) return;
    if (hasAnalyzed.current) return;
    
    hasAnalyzed.current = true;
    // Delay analysis to let page content load
    const timer = setTimeout(() => {
      runAnalysis();
    }, 2000);
    return () => clearTimeout(timer);
  }, [configAutoAnalyze, runAnalysis]);

  // Return memoized result to prevent re-renders
  // In production, return stable no-op functions
  return useMemo(() => {
    if (!isDev) {
      return {
        analyzeNow: noopAnalyze,
        isAnalyzing: false,
        openRalphPanel: noopOpenPanel
      };
    }
    
    return {
      analyzeNow: runAnalysis,
      isAnalyzing,
      openRalphPanel: openPanel
    };
  }, [runAnalysis, isAnalyzing, openPanel]);
};

export default useRalphWiggumPageAnalysis;
