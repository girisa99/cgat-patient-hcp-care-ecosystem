/**
 * Configuration-Driven Document Router with Auto-Classification Learning
 * Reads document type configurations from DB and learns from classification corrections
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

// Types
export interface DocumentTypeConfig {
  id: string;
  document_type: string;
  domain: string;
  display_name: string;
  description: string | null;
  keywords: string[];
  patterns: any[];
  target_orchestrator: string | null;
  sub_agents: string[];
  extraction_fields: string[];
  validation_rules: any;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassificationLearning {
  id: string;
  document_id: string | null;
  original_classification: string | null;
  corrected_classification: string | null;
  confidence_score: number;
  features: any;
  feedback_type: 'correction' | 'confirmation' | 'rejection';
  learned_at: string;
  applied_to_model: boolean;
}

export interface ClassificationPattern {
  id: string;
  document_type: string;
  pattern_type: 'keyword' | 'regex' | 'structure' | 'entity' | 'layout';
  pattern_value: string;
  weight: number;
  match_count: number;
  success_rate: number;
  is_active: boolean;
}

export interface RoutingResult {
  documentType: string;
  domain: string;
  orchestrator: string | null;
  subAgents: string[];
  extractionFields: string[];
  confidence: number;
  classificationMethod: 'config' | 'pattern' | 'ml' | 'manual' | 'fallback';
}

export interface ClassificationFeedback {
  documentId: string;
  originalType: string;
  correctedType: string;
  feedbackType: 'correction' | 'confirmation' | 'rejection';
  features?: any;
}

export function useConfigDrivenDocumentRouter() {
  const [user, setUser] = useState<User | null>(null);
  const userRef = useRef<User | null>(null);
  const [configs, setConfigs] = useState<DocumentTypeConfig[]>([]);
  const [patterns, setPatterns] = useState<ClassificationPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load document type configurations from DB
  const loadConfigurations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [configsResult, patternsResult] = await Promise.all([
        supabase
          .from('document_type_configurations')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false }),
        supabase
          .from('document_classification_patterns')
          .select('*')
          .eq('is_active', true)
      ]);

      if (configsResult.error) throw configsResult.error;
      if (patternsResult.error) throw patternsResult.error;

      // Cast to our types with proper type handling
      setConfigs((configsResult.data || []).map(c => ({
        ...c,
        patterns: Array.isArray(c.patterns) ? c.patterns : []
      })) as DocumentTypeConfig[]);
      
      setPatterns((patternsResult.data || []).map(p => ({
        ...p,
        pattern_type: p.pattern_type as ClassificationPattern['pattern_type']
      })) as ClassificationPattern[]);
      
      setError(null);
    } catch (err) {
      console.error('Failed to load document configurations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load configurations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user and configurations on mount
  useEffect(() => {
    const initUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      userRef.current = currentUser;
    };
    initUser();
    loadConfigurations();
  }, [loadConfigurations]);

  // Classify document using config + patterns + learned data
  const classifyDocument = useCallback(async (
    documentText: string,
    documentMetadata?: any
  ): Promise<RoutingResult> => {
    const startTime = Date.now();
    
    // Extract features from document
    const features = extractFeatures(documentText, documentMetadata);
    
    // Step 1: Try keyword matching from configs
    let bestMatch: { config: DocumentTypeConfig; score: number } | null = null;
    
    for (const config of configs) {
      const keywordScore = calculateKeywordScore(features.keywords, config.keywords);
      if (keywordScore > 0 && (!bestMatch || keywordScore > bestMatch.score)) {
        bestMatch = { config, score: keywordScore };
      }
    }

    // Step 2: Try pattern matching
    if (!bestMatch || bestMatch.score < 0.7) {
      for (const pattern of patterns) {
        const patternScore = matchPattern(documentText, pattern);
        if (patternScore > 0) {
          const config = configs.find(c => c.document_type === pattern.document_type);
          if (config) {
            const weightedScore = patternScore * pattern.weight;
            if (!bestMatch || weightedScore > bestMatch.score) {
              bestMatch = { config, score: weightedScore };
            }
          }
        }
      }
    }

    // Step 3: Check learning data for similar documents
    if (!bestMatch || bestMatch.score < 0.5) {
      const learnedMatch = await checkLearnedPatterns(features);
      if (learnedMatch) {
        const config = configs.find(c => c.document_type === learnedMatch.type);
        if (config && learnedMatch.confidence > (bestMatch?.score || 0)) {
          bestMatch = { config, score: learnedMatch.confidence };
        }
      }
    }

    // Build routing result
    const processingTime = Date.now() - startTime;
    
    if (bestMatch) {
      const result: RoutingResult = {
        documentType: bestMatch.config.document_type,
        domain: bestMatch.config.domain,
        orchestrator: bestMatch.config.target_orchestrator,
        subAgents: bestMatch.config.sub_agents,
        extractionFields: bestMatch.config.extraction_fields,
        confidence: bestMatch.score,
        classificationMethod: bestMatch.score >= 0.8 ? 'config' : 'pattern'
      };

      // Log routing history
      await logRoutingHistory(null, result, processingTime);
      
      return result;
    }

    // Fallback for unknown documents
    const fallbackResult: RoutingResult = {
      documentType: 'unknown',
      domain: 'general',
      orchestrator: null,
      subAgents: [],
      extractionFields: [],
      confidence: 0,
      classificationMethod: 'fallback'
    };

    await logRoutingHistory(null, fallbackResult, processingTime);
    
    return fallbackResult;
  }, [configs, patterns]);

  // Route document to appropriate orchestrator
  const routeDocument = useCallback(async (
    documentId: string,
    documentText: string,
    documentMetadata?: any
  ): Promise<RoutingResult> => {
    const result = await classifyDocument(documentText, documentMetadata);
    
    // Update routing history with document ID
    await supabase
      .from('document_routing_history')
      .update({ document_id: documentId })
      .eq('created_at', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(1);

    return result;
  }, [classifyDocument]);

  // Submit classification feedback for learning
  const submitClassificationFeedback = useCallback(async (
    feedback: ClassificationFeedback
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Must be logged in to submit feedback');
      return false;
    }

    try {
      // Record the learning data
      const { error: learningError } = await supabase
        .from('document_classification_learning')
        .insert({
          document_id: feedback.documentId,
          original_classification: feedback.originalType,
          corrected_classification: feedback.correctedType,
          confidence_score: 1.0, // User correction is 100% confident
          features: feedback.features || {},
          feedback_type: feedback.feedbackType,
          user_id: user.id
        });

      if (learningError) throw learningError;

      // Update routing history with correction
      await supabase
        .from('document_routing_history')
        .update({
          was_correct: feedback.feedbackType === 'confirmation',
          feedback_notes: feedback.feedbackType === 'correction' 
            ? `Corrected from ${feedback.originalType} to ${feedback.correctedType}`
            : null
        })
        .eq('document_id', feedback.documentId)
        .order('created_at', { ascending: false })
        .limit(1);

      // If correction, create/update pattern for future matching
      if (feedback.feedbackType === 'correction' && feedback.features?.keywords) {
        for (const keyword of feedback.features.keywords.slice(0, 5)) {
          await supabase
            .from('document_classification_patterns')
            .upsert({
              document_type: feedback.correctedType,
              pattern_type: 'keyword',
              pattern_value: keyword.toLowerCase(),
              weight: 0.8,
              match_count: 1,
              success_rate: 1.0
            }, {
              onConflict: 'document_type,pattern_value',
              ignoreDuplicates: false
            });
        }
      }

      toast.success('Classification feedback recorded');
      return true;
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast.error('Failed to record feedback');
      return false;
    }
  }, [user]);

  // Add new document type configuration
  const addDocumentTypeConfig = useCallback(async (
    config: Omit<DocumentTypeConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Must be logged in to add configurations');
      return false;
    }

    try {
      const { error } = await supabase
        .from('document_type_configurations')
        .insert({
          ...config,
          created_by: user.id
        });

      if (error) throw error;

      toast.success(`Document type "${config.display_name}" added`);
      await loadConfigurations();
      return true;
    } catch (err) {
      console.error('Failed to add configuration:', err);
      toast.error('Failed to add document type');
      return false;
    }
  }, [user, loadConfigurations]);

  // Update document type configuration
  const updateDocumentTypeConfig = useCallback(async (
    id: string,
    updates: Partial<DocumentTypeConfig>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('document_type_configurations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Configuration updated');
      await loadConfigurations();
      return true;
    } catch (err) {
      console.error('Failed to update configuration:', err);
      toast.error('Failed to update configuration');
      return false;
    }
  }, [loadConfigurations]);

  // Get configurations by domain
  const getConfigsByDomain = useCallback((domain: string) => {
    return configs.filter(c => c.domain === domain);
  }, [configs]);

  // Get config by document type
  const getConfigByType = useCallback((documentType: string) => {
    return configs.find(c => c.document_type === documentType);
  }, [configs]);

  // Helper: Extract features from document
  function extractFeatures(text: string, metadata?: any) {
    const words = text.toLowerCase().split(/\s+/);
    const keywords = [...new Set(words.filter(w => w.length > 3))].slice(0, 50);
    
    return {
      keywords,
      wordCount: words.length,
      hasNumbers: /\d+/.test(text),
      hasDates: /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(text),
      hasCurrency: /\$[\d,]+\.?\d*/.test(text),
      hasNPI: /\b\d{10}\b/.test(text),
      metadata
    };
  }

  // Helper: Calculate keyword matching score
  function calculateKeywordScore(docKeywords: string[], configKeywords: string[]): number {
    if (!configKeywords.length) return 0;
    
    const matches = configKeywords.filter(ck => 
      docKeywords.some(dk => dk.includes(ck.toLowerCase()))
    );
    
    return matches.length / configKeywords.length;
  }

  // Helper: Match pattern against document
  function matchPattern(text: string, pattern: ClassificationPattern): number {
    const lowerText = text.toLowerCase();
    
    switch (pattern.pattern_type) {
      case 'keyword':
        return lowerText.includes(pattern.pattern_value.toLowerCase()) ? 1 : 0;
      case 'regex':
        try {
          const regex = new RegExp(pattern.pattern_value, 'i');
          return regex.test(text) ? 1 : 0;
        } catch {
          return 0;
        }
      default:
        return 0;
    }
  }

  // Helper: Check learned patterns
  async function checkLearnedPatterns(features: any): Promise<{ type: string; confidence: number } | null> {
    try {
      const { data } = await supabase
        .from('document_classification_learning')
        .select('corrected_classification, confidence_score')
        .eq('applied_to_model', false)
        .order('learned_at', { ascending: false })
        .limit(100);

      if (!data?.length) return null;

      // Simple frequency-based matching
      const typeCounts: Record<string, number> = {};
      for (const record of data) {
        if (record.corrected_classification) {
          typeCounts[record.corrected_classification] = (typeCounts[record.corrected_classification] || 0) + 1;
        }
      }

      const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
      if (topType) {
        return { type: topType[0], confidence: Math.min(topType[1] / 10, 0.9) };
      }

      return null;
    } catch {
      return null;
    }
  }

  // Helper: Log routing history
  async function logRoutingHistory(
    documentId: string | null,
    result: RoutingResult,
    processingTimeMs: number
  ) {
    try {
      await supabase
        .from('document_routing_history')
        .insert({
          document_id: documentId,
          classified_type: result.documentType,
          routed_to_domain: result.domain,
          routed_to_orchestrator: result.orchestrator,
          confidence_score: result.confidence,
          classification_method: result.classificationMethod,
          processing_time_ms: processingTimeMs,
          user_id: user?.id
        });
    } catch (err) {
      console.error('Failed to log routing history:', err);
    }
  }

  return {
    // State
    configs,
    patterns,
    isLoading,
    error,

    // Actions
    loadConfigurations,
    classifyDocument,
    routeDocument,
    submitClassificationFeedback,
    addDocumentTypeConfig,
    updateDocumentTypeConfig,

    // Queries
    getConfigsByDomain,
    getConfigByType
  };
}
