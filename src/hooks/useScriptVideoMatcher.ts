/**
 * Script-to-Video Matcher Hook
 * Uses vector embeddings to match script segments to video clips
 * Analyzes transcript, visual content, and timing for intelligent matching
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScriptSegment {
  id: string;
  text: string;
  startTime?: number;
  endTime?: number;
  speaker?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
  embedding?: number[];
}

export interface VideoClipMeta {
  id: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  transcript?: string;
  sceneDescription?: string;
  objects?: string[];
  emotions?: string[];
  embedding?: number[];
  confidence?: number;
}

export interface MatchResult {
  segmentId: string;
  clipId: string;
  similarity: number;
  matchType: 'transcript' | 'visual' | 'semantic' | 'hybrid';
  suggestedTrim?: { start: number; end: number };
  confidence: number;
  reasoning?: string;
}

export interface MatchingConfig {
  matchingMode: 'transcript' | 'visual' | 'semantic' | 'hybrid';
  similarityThreshold: number;
  allowMultipleMatches: boolean;
  prioritizeExactMatch: boolean;
  useTimingHints: boolean;
}

interface UseScriptVideoMatcherReturn {
  isMatching: boolean;
  progress: number;
  currentStep: string;
  matches: MatchResult[];
  error: string | null;
  
  // Core actions
  matchScriptToClips: (
    script: ScriptSegment[],
    clips: VideoClipMeta[],
    config?: Partial<MatchingConfig>
  ) => Promise<MatchResult[]>;
  
  // Embedding generation
  generateScriptEmbeddings: (segments: ScriptSegment[]) => Promise<ScriptSegment[]>;
  generateClipEmbeddings: (clips: VideoClipMeta[]) => Promise<VideoClipMeta[]>;
  
  // Utilities
  parseScriptText: (rawScript: string) => ScriptSegment[];
  calculateSimilarity: (embedding1: number[], embedding2: number[]) => number;
  optimizeArrangement: (matches: MatchResult[]) => MatchResult[];
  
  // Reset
  clearMatches: () => void;
}

const DEFAULT_CONFIG: MatchingConfig = {
  matchingMode: 'hybrid',
  similarityThreshold: 0.7,
  allowMultipleMatches: false,
  prioritizeExactMatch: true,
  useTimingHints: true,
};

export const useScriptVideoMatcher = (): UseScriptVideoMatcherReturn => {
  const [isMatching, setIsMatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Calculate cosine similarity between two embeddings
  const calculateSimilarity = useCallback((embedding1: number[], embedding2: number[]): number => {
    if (!embedding1?.length || !embedding2?.length || embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }, []);

  // Parse raw script text into segments
  const parseScriptText = useCallback((rawScript: string): ScriptSegment[] => {
    const lines = rawScript.split('\n').filter(line => line.trim());
    const segments: ScriptSegment[] = [];

    let currentSpeaker = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for speaker pattern: "Speaker:" or "[Speaker]"
      const speakerMatch = trimmed.match(/^(?:\[([^\]]+)\]|([^:]+):)\s*(.*)/);
      
      if (speakerMatch) {
        currentSpeaker = speakerMatch[1] || speakerMatch[2] || '';
        const text = speakerMatch[3] || '';
        
        if (text) {
          segments.push({
            id: `seg-${segments.length}`,
            text,
            speaker: currentSpeaker,
            keywords: extractKeywords(text),
          });
        }
      } else if (trimmed) {
        segments.push({
          id: `seg-${segments.length}`,
          text: trimmed,
          speaker: currentSpeaker || undefined,
          keywords: extractKeywords(trimmed),
        });
      }
    }

    return segments;
  }, []);

  // Extract keywords from text
  const extractKeywords = (text: string): string[] => {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10);
  };

  // Generate embeddings for script segments
  const generateScriptEmbeddings = useCallback(async (segments: ScriptSegment[]): Promise<ScriptSegment[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('script-video-matcher', {
        body: {
          action: 'generate_embeddings',
          type: 'script',
          items: segments.map(s => ({ id: s.id, text: s.text })),
        },
      });

      if (error) throw error;

      return segments.map((segment, index) => ({
        ...segment,
        embedding: data.embeddings?.[index] || [],
        sentiment: data.sentiments?.[index] || 'neutral',
      }));
    } catch (err: any) {
      console.error('Script embedding error:', err);
      throw err;
    }
  }, []);

  // Generate embeddings for video clips
  const generateClipEmbeddings = useCallback(async (clips: VideoClipMeta[]): Promise<VideoClipMeta[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('script-video-matcher', {
        body: {
          action: 'generate_embeddings',
          type: 'clip',
          items: clips.map(c => ({
            id: c.id,
            text: c.transcript || c.sceneDescription || '',
            objects: c.objects,
            emotions: c.emotions,
          })),
        },
      });

      if (error) throw error;

      return clips.map((clip, index) => ({
        ...clip,
        embedding: data.embeddings?.[index] || [],
      }));
    } catch (err: any) {
      console.error('Clip embedding error:', err);
      throw err;
    }
  }, []);

  // Main matching function
  const matchScriptToClips = useCallback(async (
    script: ScriptSegment[],
    clips: VideoClipMeta[],
    config: Partial<MatchingConfig> = {}
  ): Promise<MatchResult[]> => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    setIsMatching(true);
    setProgress(0);
    setError(null);
    setMatches([]);

    try {
      // Step 1: Generate embeddings for script
      setCurrentStep('Generating script embeddings...');
      setProgress(10);
      const embeddedScript = await generateScriptEmbeddings(script);

      // Step 2: Generate embeddings for clips
      setCurrentStep('Analyzing video clips...');
      setProgress(30);
      const embeddedClips = await generateClipEmbeddings(clips);

      // Step 3: Perform matching
      setCurrentStep('Matching script to clips...');
      setProgress(50);

      const results: MatchResult[] = [];
      const usedClips = new Set<string>();

      for (let i = 0; i < embeddedScript.length; i++) {
        const segment = embeddedScript[i];
        setProgress(50 + (i / embeddedScript.length) * 40);

        let bestMatch: { clip: VideoClipMeta; similarity: number } | null = null;
        let matchType: MatchResult['matchType'] = 'semantic';

        for (const clip of embeddedClips) {
          // Skip if clip already used and multiple matches not allowed
          if (!finalConfig.allowMultipleMatches && usedClips.has(clip.id)) {
            continue;
          }

          let similarity = 0;

          // Calculate similarity based on mode
          switch (finalConfig.matchingMode) {
            case 'transcript':
              // Text-based matching using transcript
              if (segment.embedding && clip.embedding) {
                similarity = calculateSimilarity(segment.embedding, clip.embedding);
              }
              // Boost for keyword matches
              const keywordOverlap = segment.keywords?.filter(k => 
                clip.transcript?.toLowerCase().includes(k)
              ).length || 0;
              similarity += keywordOverlap * 0.05;
              matchType = 'transcript';
              break;

            case 'visual':
              // Visual content matching
              if (segment.embedding && clip.embedding) {
                similarity = calculateSimilarity(segment.embedding, clip.embedding);
              }
              // Consider scene description and objects
              const visualKeywords = segment.keywords?.filter(k =>
                clip.sceneDescription?.toLowerCase().includes(k) ||
                clip.objects?.some(o => o.toLowerCase().includes(k))
              ).length || 0;
              similarity += visualKeywords * 0.08;
              matchType = 'visual';
              break;

            case 'semantic':
              // Pure semantic similarity
              if (segment.embedding && clip.embedding) {
                similarity = calculateSimilarity(segment.embedding, clip.embedding);
              }
              matchType = 'semantic';
              break;

            case 'hybrid':
            default:
              // Combine all approaches
              let semanticSim = 0;
              let transcriptBoost = 0;
              let visualBoost = 0;

              if (segment.embedding && clip.embedding) {
                semanticSim = calculateSimilarity(segment.embedding, clip.embedding);
              }

              // Transcript matching boost
              const transcriptKeywords = segment.keywords?.filter(k =>
                clip.transcript?.toLowerCase().includes(k)
              ).length || 0;
              transcriptBoost = transcriptKeywords * 0.05;

              // Visual matching boost
              const visualMatches = segment.keywords?.filter(k =>
                clip.sceneDescription?.toLowerCase().includes(k) ||
                clip.objects?.some(o => o.toLowerCase().includes(k))
              ).length || 0;
              visualBoost = visualMatches * 0.05;

              // Emotion matching boost
              const emotionMatch = segment.sentiment && clip.emotions?.some(e => {
                if (segment.sentiment === 'positive') return ['happy', 'joy', 'excited'].includes(e.toLowerCase());
                if (segment.sentiment === 'negative') return ['sad', 'angry', 'fear'].includes(e.toLowerCase());
                return true;
              });
              const emotionBoost = emotionMatch ? 0.1 : 0;

              similarity = semanticSim * 0.6 + transcriptBoost + visualBoost + emotionBoost;
              matchType = 'hybrid';
              break;
          }

          // Check if this is the best match so far
          if (similarity >= finalConfig.similarityThreshold) {
            if (!bestMatch || similarity > bestMatch.similarity) {
              bestMatch = { clip, similarity };
            }
          }
        }

        if (bestMatch) {
          results.push({
            segmentId: segment.id,
            clipId: bestMatch.clip.id,
            similarity: bestMatch.similarity,
            matchType,
            confidence: Math.min(bestMatch.similarity * 100, 100),
            reasoning: generateMatchReasoning(segment, bestMatch.clip, matchType),
          });

          if (!finalConfig.allowMultipleMatches) {
            usedClips.add(bestMatch.clip.id);
          }
        }
      }

      // Step 4: Optimize arrangement
      setCurrentStep('Optimizing arrangement...');
      setProgress(95);
      const optimizedResults = optimizeArrangement(results);

      setMatches(optimizedResults);
      setProgress(100);
      setCurrentStep('Complete');

      toast.success(`Matched ${optimizedResults.length}/${script.length} segments`);
      return optimizedResults;

    } catch (err: any) {
      setError(err.message || 'Matching failed');
      toast.error('Script matching failed: ' + err.message);
      return [];
    } finally {
      setIsMatching(false);
    }
  }, [generateScriptEmbeddings, generateClipEmbeddings, calculateSimilarity]);

  // Generate reasoning for match
  const generateMatchReasoning = (segment: ScriptSegment, clip: VideoClipMeta, matchType: string): string => {
    const reasons: string[] = [];

    if (segment.keywords?.some(k => clip.transcript?.toLowerCase().includes(k))) {
      reasons.push('Transcript keywords match');
    }
    if (segment.keywords?.some(k => clip.sceneDescription?.toLowerCase().includes(k))) {
      reasons.push('Visual content aligns');
    }
    if (clip.objects?.some(o => segment.text.toLowerCase().includes(o.toLowerCase()))) {
      reasons.push('Objects mentioned in script visible');
    }
    if (reasons.length === 0) {
      reasons.push(`Semantic similarity (${matchType})`);
    }

    return reasons.join(', ');
  };

  // Optimize arrangement to minimize clip reuse and improve flow
  const optimizeArrangement = useCallback((results: MatchResult[]): MatchResult[] => {
    // Sort by segment order (assuming segment IDs are sequential)
    return [...results].sort((a, b) => {
      const aNum = parseInt(a.segmentId.replace('seg-', ''));
      const bNum = parseInt(b.segmentId.replace('seg-', ''));
      return aNum - bNum;
    });
  }, []);

  // Clear matches
  const clearMatches = useCallback(() => {
    setMatches([]);
    setError(null);
    setProgress(0);
    setCurrentStep('');
  }, []);

  return {
    isMatching,
    progress,
    currentStep,
    matches,
    error,
    matchScriptToClips,
    generateScriptEmbeddings,
    generateClipEmbeddings,
    parseScriptText,
    calculateSimilarity,
    optimizeArrangement,
    clearMatches,
  };
};

export default useScriptVideoMatcher;
