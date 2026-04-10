/**
 * SCENE ANALYZER HOOK
 * Multi-provider vision AI for video production scene analysis
 * Extends Universal AI infrastructure with scene-specific capabilities
 * 
 * Capabilities:
 * - Analyze video frames/thumbnails for content understanding
 * - Suggest scene arrangements and transitions
 * - Detect faces, objects, emotions, and scene composition
 * - Provide editing recommendations based on content
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { UniversalAIProviderType } from '@/services/aiProviderService';

export interface SceneAnalysis {
  sceneId: string;
  description: string;
  objects: DetectedObject[];
  faces: DetectedFace[];
  emotions: EmotionAnalysis;
  composition: CompositionAnalysis;
  suggestions: EditingSuggestion[];
  quality: QualityAssessment;
  timing: TimingRecommendation;
  metadata: {
    provider: string;
    model: string;
    processingTime: number;
    confidence: number;
  };
}

export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  category: 'person' | 'object' | 'text' | 'background' | 'action';
}

export interface DetectedFace {
  id: string;
  confidence: number;
  expression: string;
  age?: string;
  position: { x: number; y: number };
}

export interface EmotionAnalysis {
  dominant: string;
  scores: Record<string, number>;
  mood: 'positive' | 'neutral' | 'negative' | 'mixed';
}

export interface CompositionAnalysis {
  ruleOfThirds: boolean;
  leadingLines: boolean;
  symmetry: number;
  colorPalette: string[];
  brightness: 'dark' | 'balanced' | 'bright';
  contrast: 'low' | 'medium' | 'high';
}

export interface EditingSuggestion {
  type: 'trim' | 'transition' | 'effect' | 'text' | 'audio' | 'color';
  priority: 'high' | 'medium' | 'low';
  description: string;
  parameters?: Record<string, any>;
}

export interface QualityAssessment {
  overall: number; // 0-100
  sharpness: number;
  noise: number;
  exposure: number;
  issues: string[];
}

export interface TimingRecommendation {
  suggestedDuration: number;
  pacing: 'slow' | 'medium' | 'fast';
  beatMarkers?: number[];
  transitionPoints?: number[];
}

export interface SceneAnalyzerState {
  isAnalyzing: boolean;
  progress: number;
  currentScene: number;
  totalScenes: number;
  analyses: SceneAnalysis[];
  error: string | null;
}

export interface AnalyzeSceneOptions {
  provider?: UniversalAIProviderType;
  model?: string;
  analysisDepth?: 'quick' | 'standard' | 'detailed';
  focusAreas?: ('objects' | 'faces' | 'emotions' | 'composition' | 'quality')[];
  context?: {
    projectType?: 'social' | 'corporate' | 'creative' | 'educational';
    targetPlatform?: 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'general';
    style?: string;
  };
}

// Vision-capable models by provider
const VISION_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'o4-mini-2025-04-16'],
  claude: ['claude-sonnet-4-6', 'claude-opus-4-6'],
  gemini: ['gemini-2.5-pro', 'gemini-2.5-flash'],
  lovable: ['google/gemini-2.5-pro', 'google/gemini-2.5-flash']
};

export const useSceneAnalyzer = () => {
  const { showError, showSuccess, showInfo } = useMasterToast();
  
  const [state, setState] = useState<SceneAnalyzerState>({
    isAnalyzing: false,
    progress: 0,
    currentScene: 0,
    totalScenes: 0,
    analyses: [],
    error: null
  });

  /**
   * Get the best vision model for a provider
   */
  const getVisionModel = useCallback((provider: UniversalAIProviderType): string => {
    const models = VISION_MODELS[provider] || VISION_MODELS.openai;
    return models[0]; // Return the primary (best) model
  }, []);

  /**
   * Get available vision providers
   */
  const getAvailableProviders = useCallback(() => {
    return Object.keys(VISION_MODELS) as UniversalAIProviderType[];
  }, []);

  /**
   * Analyze a single scene/frame
   */
  const analyzeScene = useCallback(async (
    imageData: string | Blob | File,
    options: AnalyzeSceneOptions = {}
  ): Promise<SceneAnalysis | null> => {
    const {
      provider = 'gemini',
      model,
      analysisDepth = 'standard',
      focusAreas = ['objects', 'faces', 'emotions', 'composition', 'quality'],
      context = {}
    } = options;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null, progress: 0 }));
    const startTime = Date.now();

    try {
      // Convert image to base64 if needed
      let base64Image: string;
      if (typeof imageData === 'string') {
        // Already a URL or base64
        base64Image = imageData.startsWith('data:') 
          ? imageData.split(',')[1] 
          : imageData;
      } else {
        // Convert Blob/File to base64
        const reader = new FileReader();
        base64Image = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageData);
        });
      }

      setState(prev => ({ ...prev, progress: 20 }));

      // Build the analysis prompt
      const systemPrompt = buildAnalysisSystemPrompt(analysisDepth, focusAreas, context);
      const userPrompt = buildAnalysisUserPrompt(focusAreas, context);

      setState(prev => ({ ...prev, progress: 40 }));

      // Call the Universal AI processor with vision capability
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider,
          model: model || getVisionModel(provider),
          prompt: userPrompt,
          systemPrompt,
          action: 'analyze_scene',
          context: {
            image: base64Image,
            analysisDepth,
            focusAreas,
            projectContext: context
          }
        }
      });

      if (error) throw new Error(error.message);

      setState(prev => ({ ...prev, progress: 80 }));

      // Parse the AI response into structured analysis
      const analysis = parseAnalysisResponse(data.content, {
        provider,
        model: model || getVisionModel(provider),
        processingTime: Date.now() - startTime
      });

      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        progress: 100,
        analyses: [...prev.analyses, analysis]
      }));

      return analysis;

    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Scene analysis failed';
      setState(prev => ({ ...prev, isAnalyzing: false, error: errorMessage, progress: 0 }));
      showError('Scene Analysis Failed', errorMessage);
      return null;
    }
  }, [getVisionModel, showError]);

  /**
   * Analyze multiple scenes in batch
   */
  const analyzeMultipleScenes = useCallback(async (
    images: (string | Blob | File)[],
    options: AnalyzeSceneOptions = {}
  ): Promise<SceneAnalysis[]> => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      currentScene: 0,
      totalScenes: images.length,
      analyses: []
    }));

    const results: SceneAnalysis[] = [];

    for (let i = 0; i < images.length; i++) {
      setState(prev => ({ ...prev, currentScene: i + 1 }));
      
      const analysis = await analyzeScene(images[i], options);
      if (analysis) {
        results.push(analysis);
      }
    }

    setState(prev => ({ ...prev, isAnalyzing: false }));
    
    if (results.length > 0) {
      showSuccess(`Analyzed ${results.length} scenes successfully`);
    }

    return results;
  }, [analyzeScene, showSuccess]);

  /**
   * Get scene arrangement suggestions based on analyses
   */
  const suggestArrangement = useCallback(async (
    analyses: SceneAnalysis[],
    options: AnalyzeSceneOptions = {}
  ): Promise<{
    order: string[];
    transitions: { from: string; to: string; type: string }[];
    pacing: string;
    reasoning: string;
  } | null> => {
    if (analyses.length < 2) {
      showInfo('Need at least 2 scenes for arrangement suggestions');
      return null;
    }

    const { provider = 'gemini', model, context = {} } = options;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const prompt = `Based on these scene analyses, suggest the optimal arrangement:
${JSON.stringify(analyses.map(a => ({
  id: a.sceneId,
  description: a.description,
  mood: a.emotions.mood,
  pacing: a.timing.pacing,
  quality: a.quality.overall
})), null, 2)}

Project context: ${JSON.stringify(context)}

Provide:
1. Optimal scene order (list of scene IDs)
2. Transition recommendations between each scene
3. Overall pacing recommendation
4. Brief reasoning for the arrangement`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider,
          model: model || getVisionModel(provider),
          prompt,
          systemPrompt: 'You are a professional video editor providing scene arrangement recommendations. Respond in JSON format with keys: order, transitions, pacing, reasoning.',
          action: 'suggest_arrangement'
        }
      });

      if (error) throw new Error(error.message);

      // Parse JSON response
      const result = JSON.parse(data.content);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      
      return result;

    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Arrangement suggestion failed';
      setState(prev => ({ ...prev, isAnalyzing: false, error: errorMessage }));
      showError('Arrangement Suggestion Failed', errorMessage);
      return null;
    }
  }, [getVisionModel, showError, showInfo]);

  /**
   * Clear all analyses
   */
  const clearAnalyses = useCallback(() => {
    setState({
      isAnalyzing: false,
      progress: 0,
      currentScene: 0,
      totalScenes: 0,
      analyses: [],
      error: null
    });
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    analyzeScene,
    analyzeMultipleScenes,
    suggestArrangement,
    clearAnalyses,
    
    // Utilities
    getVisionModel,
    getAvailableProviders,
    visionModels: VISION_MODELS
  };
};

// Helper: Build system prompt for scene analysis
function buildAnalysisSystemPrompt(
  depth: 'quick' | 'standard' | 'detailed',
  focusAreas: string[],
  context: Record<string, any>
): string {
  const basePrompt = `You are an expert video production AI assistant specializing in scene analysis for content creation.

Your task is to analyze video frames/images and provide structured insights for video editing.

Analysis depth: ${depth}
Focus areas: ${focusAreas.join(', ')}
${context.projectType ? `Project type: ${context.projectType}` : ''}
${context.targetPlatform ? `Target platform: ${context.targetPlatform}` : ''}
${context.style ? `Style: ${context.style}` : ''}

Provide your analysis as a JSON object with the following structure:
{
  "description": "Brief scene description",
  "objects": [{"name": "string", "confidence": 0-1, "category": "person|object|text|background|action"}],
  "faces": [{"id": "string", "expression": "string", "confidence": 0-1}],
  "emotions": {"dominant": "string", "mood": "positive|neutral|negative|mixed", "scores": {}},
  "composition": {"ruleOfThirds": boolean, "brightness": "dark|balanced|bright", "colorPalette": ["#hex"]},
  "suggestions": [{"type": "trim|transition|effect|text|audio|color", "priority": "high|medium|low", "description": "string"}],
  "quality": {"overall": 0-100, "sharpness": 0-100, "issues": []},
  "timing": {"suggestedDuration": seconds, "pacing": "slow|medium|fast"}
}`;

  return basePrompt;
}

// Helper: Build user prompt for scene analysis
function buildAnalysisUserPrompt(
  focusAreas: string[],
  context: Record<string, any>
): string {
  return `Analyze this scene/frame for video production. 
Focus on: ${focusAreas.join(', ')}.
${context.targetPlatform ? `This will be used on ${context.targetPlatform}.` : ''}
Provide actionable editing suggestions based on the content.`;
}

// Helper: Parse AI response into structured SceneAnalysis
function parseAnalysisResponse(
  content: string,
  metadata: { provider: string; model: string; processingTime: number }
): SceneAnalysis {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(content);
    
    return {
      sceneId: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: parsed.description || 'Scene analyzed',
      objects: parsed.objects || [],
      faces: parsed.faces || [],
      emotions: parsed.emotions || { dominant: 'neutral', scores: {}, mood: 'neutral' },
      composition: parsed.composition || {
        ruleOfThirds: false,
        leadingLines: false,
        symmetry: 0.5,
        colorPalette: [],
        brightness: 'balanced',
        contrast: 'medium'
      },
      suggestions: parsed.suggestions || [],
      quality: parsed.quality || { overall: 70, sharpness: 70, noise: 30, exposure: 70, issues: [] },
      timing: parsed.timing || { suggestedDuration: 3, pacing: 'medium' },
      metadata: {
        ...metadata,
        confidence: parsed.confidence || 0.8
      }
    };
  } catch {
    // Fallback: Create basic analysis from text response
    return {
      sceneId: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: content.slice(0, 200),
      objects: [],
      faces: [],
      emotions: { dominant: 'neutral', scores: {}, mood: 'neutral' },
      composition: {
        ruleOfThirds: false,
        leadingLines: false,
        symmetry: 0.5,
        colorPalette: [],
        brightness: 'balanced',
        contrast: 'medium'
      },
      suggestions: [{
        type: 'effect',
        priority: 'medium',
        description: 'Review scene manually for detailed suggestions'
      }],
      quality: { overall: 70, sharpness: 70, noise: 30, exposure: 70, issues: [] },
      timing: { suggestedDuration: 3, pacing: 'medium' },
      metadata: {
        ...metadata,
        confidence: 0.5
      }
    };
  }
}
