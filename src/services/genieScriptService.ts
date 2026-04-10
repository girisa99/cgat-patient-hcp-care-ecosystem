/**
 * Genie Script Service
 * Unified service for script analysis, enhancement, and TTS generation
 * Uses real AI edge functions - NO MOCK DATA
 */

import { supabase } from '@/integrations/supabase/client';
import { resolveModelId, getActiveModel } from '@/config/provider-version-registry';
import type { ScriptSegment, AIEnhancementType, TTSOptions } from '@/components/genie-studio/segmented-editor/types';

// ============= Types =============

export interface ScriptAnalysisResult {
  segments: AnalyzedSegment[];
  overallScore: number;
  totalDuration: number;
  pausePoints: PausePoint[];
  engagementRecommendations: string[];
  toneGuide: string;
  conversationalTips: string[];
}

export interface AnalyzedSegment {
  id: string;
  startIndex: number;
  endIndex: number;
  text: string;
  type: 'intro' | 'main' | 'demo' | 'transition' | 'closing';
  suggestedPauseAfter: boolean;
  pauseReason?: string;
  estimatedDuration: number;
  engagementTips: string[];
  toneMarkers: ('emphasize' | 'slower' | 'faster' | 'pause' | 'question' | 'excitement')[];
  improvementSuggestions?: string;
}

export interface PausePoint {
  position: number;
  reason: string;
  suggestedDuration: number;
}

export interface EnhancementResult {
  enhancedScript: string;
  cleanScript: string;
  changes: ScriptChange[];
  markers: {
    pausesAdded: number;
    sectionBreaksAdded: number;
    sentencesRewritten: number;
    engagementHooksAdded: number;
    conversationalChanges: number;
  };
  engagementScore: {
    before: number;
    after: number;
    improvements: string[];
  };
  summary: string;
}

export interface ScriptChange {
  type: 'engagement' | 'conversational' | 'pause' | 'break' | 'hook' | 'transition' | 'cta' | 'pacing';
  original: string;
  enhanced: string;
  reason: string;
  position: 'start' | 'middle' | 'end';
}

export interface TTSResult {
  audioContent: string; // Base64 encoded audio
  voice: string;
  model?: string;
  duration?: number;
}

export interface ImageSuggestion {
  id: string;
  section: string;
  description: string;
  prompt: string;
  priority: 'high' | 'medium' | 'low';
}

// ============= Script Analysis =============

export async function analyzeScript(
  script: string,
  context: string = 'video'
): Promise<ScriptAnalysisResult> {
  console.log('[GenieScriptService] Analyzing script with real AI...');
  
  const { data, error } = await supabase.functions.invoke('analyze-script', {
    body: { script, context }
  });

  if (error) {
    console.error('[GenieScriptService] Analysis error:', error);
    throw new Error(`Script analysis failed: ${error.message}`);
  }

  return data as ScriptAnalysisResult;
}

// ============= Script Enhancement =============

export async function enhanceScript(
  scriptContent: string,
  mode: 'analyze' | 'enhance' = 'enhance',
  options: {
    provider?: 'gemini' | 'openai' | 'claude';
    focus?: 'balanced' | 'engagement' | 'clarity' | 'pacing' | 'conversational' | 'humor';
    customInstructions?: string;
  } = {}
): Promise<EnhancementResult> {
  console.log('[GenieScriptService] Enhancing script with real AI...', { mode, options });
  
  const { data, error } = await supabase.functions.invoke('enhance-script', {
    body: {
      scriptContent,
      mode,
      provider: options.provider || 'gemini',
      focus: options.focus || 'balanced',
      customInstructions: options.customInstructions
    }
  });

  if (error) {
    console.error('[GenieScriptService] Enhancement error:', error);
    throw new Error(`Script enhancement failed: ${error.message}`);
  }

  return data as EnhancementResult;
}

// ============= Segment Enhancement =============

export async function enhanceSegment(
  segment: ScriptSegment,
  enhancementType: AIEnhancementType,
  customInstructions?: string
): Promise<string> {
  console.log('[GenieScriptService] Enhancing segment:', { 
    segmentId: segment.id, 
    type: enhancementType 
  });

  // Map enhancement types to focus
  const focusMap: Record<AIEnhancementType, string> = {
    rewrite: 'clarity',
    expand: 'engagement',
    summarize: 'clarity',
    polish: 'balanced',
    transitions: 'pacing',
    brand_voice: 'conversational'
  };

  const instructionsMap: Record<AIEnhancementType, string> = {
    rewrite: 'Rewrite this segment to improve clarity, flow, and natural speech patterns. Keep the same meaning.',
    expand: 'Expand this segment with more detail, examples, and engaging content. Make it more comprehensive.',
    summarize: 'Condense this segment to its essential points. Make it more concise without losing key information.',
    polish: 'Polish this segment for professional delivery. Improve word choice, rhythm, and impact.',
    transitions: 'Add natural transitions at the start and end of this segment to improve flow.',
    brand_voice: 'Adjust this segment to be more conversational and brand-friendly. Make it warm and relatable.'
  };

  const result = await enhanceScript(
    segment.narration,
    'enhance',
    {
      focus: focusMap[enhancementType] as any,
      customInstructions: customInstructions || instructionsMap[enhancementType]
    }
  );

  return result.cleanScript || result.enhancedScript;
}

// ============= TTS Generation =============

export async function generateTTS(
  text: string,
  options: TTSOptions
): Promise<TTSResult> {
  console.log('[GenieScriptService] Generating TTS:', { 
    provider: options.provider, 
    voice: options.voice,
    textLength: text.length 
  });

  let functionName: string;
  let body: Record<string, any>;

  switch (options.provider) {
    case 'elevenlabs':
      functionName = 'elevenlabs-voice';
      body = {
        text,
        voiceId: options.voice,
        stability: options.stability ?? 0.5,
        similarityBoost: options.similarityBoost ?? 0.75
      };
      break;
    
    case 'google':
      functionName = 'google-tts';
      body = {
        text,
        voice: options.voice,
        speed: options.speed ?? 1.0
      };
      break;
    
    case 'openai':
    default:
      functionName = 'openai-tts';
      body = {
        text,
        voice: options.voice || 'alloy',
        speed: options.speed ?? 1.0
      };
      break;
  }

  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    console.error('[GenieScriptService] TTS error:', error);
    throw new Error(`TTS generation failed: ${error.message}`);
  }

  return {
    audioContent: data.audioContent,
    voice: options.voice,
    model: data.model,
    duration: data.duration
  };
}

// ============= Batch TTS Generation =============

export async function generateBatchTTS(
  segments: ScriptSegment[],
  options: TTSOptions,
  onProgress?: (completed: number, total: number, currentSegmentId: string) => void
): Promise<Map<string, TTSResult>> {
  console.log('[GenieScriptService] Generating batch TTS for', segments.length, 'segments');
  
  const results = new Map<string, TTSResult>();
  const total = segments.length;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    if (onProgress) {
      onProgress(i, total, segment.id);
    }

    try {
      const result = await generateTTS(segment.narration, options);
      results.set(segment.id, result);
    } catch (error) {
      console.error(`[GenieScriptService] TTS failed for segment ${segment.id}:`, error);
      // Continue with other segments
    }
  }

  if (onProgress) {
    onProgress(total, total, '');
  }

  return results;
}

// ============= Content-Based Image Suggestions =============

export async function generateImageSuggestions(
  scriptContent: string,
  sourceNames: string[]
): Promise<ImageSuggestion[]> {
  console.log('[GenieScriptService] Generating image suggestions with real AI...');

  const prompt = `Analyze this script and suggest 4-6 images that would enhance the video content.
For each image, provide:
- section: Which part of the script it relates to (Introduction, Overview, Main Point, Case Study, Conclusion, etc.)
- description: A brief description of what the image should convey
- prompt: A detailed prompt for AI image generation (be specific about style, mood, composition)
- priority: high, medium, or low based on visual importance

Script content:
${scriptContent.substring(0, 4000)}

Sources referenced: ${sourceNames.join(', ')}

Return as JSON array:
[{"id": "uuid", "section": "...", "description": "...", "prompt": "...", "priority": "high|medium|low"}]`;

  const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
    body: {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      prompt,
      systemPrompt: 'You are an expert visual content strategist. Return only valid JSON array, no markdown.',
      temperature: 0.7,
      maxTokens: 2000
    }
  });

  if (error) {
    console.error('[GenieScriptService] Image suggestions error:', error);
    throw new Error(`Failed to generate image suggestions: ${error.message}`);
  }

  try {
    // Parse the response - handle markdown code blocks
    let content = data.content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content.trim();
    
    const suggestions = JSON.parse(jsonStr);
    
    // Ensure IDs are present
    return suggestions.map((s: any) => ({
      ...s,
      id: s.id || crypto.randomUUID()
    }));
  } catch (parseError) {
    console.error('[GenieScriptService] Failed to parse suggestions:', parseError);
    throw new Error('Failed to parse AI response for image suggestions');
  }
}

// ============= Script Generation from Sources =============

export async function generateScriptFromSources(
  sources: { type: string; name: string; content?: string; url?: string }[],
  options: {
    outputFormat?: string;
    tone?: string;
    duration?: number;
    targetAudience?: string;
    provider?: 'gemini' | 'openai' | 'claude';
  } = {}
): Promise<{
  script: string;
  segments: Array<{
    segmentNumber: number;
    title: string;
    narration: string;
    visualNotes?: string;
    duration: number;
    wordCount: number;
  }>;
}> {
  console.log('[GenieScriptService] Generating script from sources with real AI...');

  const {
    outputFormat = 'video_script',
    tone = 'professional',
    duration = 300,
    targetAudience = 'general',
    provider = 'gemini'
  } = options;

  const sourceDescriptions = sources.map(s => {
    if (s.content) return `${s.type}: ${s.name}\nContent: ${s.content.substring(0, 2000)}`;
    if (s.url) return `${s.type}: ${s.name}\nURL: ${s.url}`;
    return `${s.type}: ${s.name}`;
  }).join('\n\n---\n\n');

  const prompt = `Create a ${outputFormat.replace('_', ' ')} from the following sources.

Requirements:
- Tone: ${tone}
- Target duration: ${Math.floor(duration / 60)} minutes
- Target audience: ${targetAudience}
- Speaking rate: ~150 words per minute

Structure the script into 4-6 segments with clear sections:
1. Introduction (hook + overview)
2-4. Main content sections
5. Practical applications or examples
6. Conclusion with call-to-action

For each segment, provide:
- segmentNumber
- title
- narration (the actual script text)
- visualNotes (suggestions for visuals/b-roll)
- duration (estimated seconds)
- wordCount

Sources:
${sourceDescriptions}

Return as JSON:
{
  "script": "Full formatted script with section headers",
  "segments": [
    {
      "segmentNumber": 1,
      "title": "Introduction",
      "narration": "The script text for this segment...",
      "visualNotes": "Suggested visuals...",
      "duration": 30,
      "wordCount": 75
    }
  ]
}`;

  const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
    body: {
      provider,
      model: provider === 'gemini' ? 'gemini-2.5-flash' : provider === 'openai' ? 'gpt-4o' : 'claude-haiku-4-5',
      prompt,
      systemPrompt: `You are an expert scriptwriter for ${outputFormat.replace('_', ' ')}s. Create engaging, well-structured content that maintains audience attention throughout. Return only valid JSON, no markdown.`,
      temperature: 0.7,
      maxTokens: 8000
    }
  });

  if (error) {
    console.error('[GenieScriptService] Script generation error:', error);
    throw new Error(`Script generation failed: ${error.message}`);
  }

  try {
    let content = data.content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content.trim();
    
    return JSON.parse(jsonStr);
  } catch (parseError) {
    console.error('[GenieScriptService] Failed to parse script:', parseError);
    throw new Error('Failed to parse AI response for script generation');
  }
}

// ============= URL Content Analysis =============

export async function analyzeURLContent(url: string): Promise<{
  title: string;
  description: string;
  contentType: string;
  keyTopics: string[];
  suggestedScript: string;
}> {
  console.log('[GenieScriptService] Analyzing URL content:', url);

  const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
    body: {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      prompt: `Analyze this URL and extract key information for script creation: ${url}

Return JSON:
{
  "title": "Page title or topic",
  "description": "Brief description of content",
  "contentType": "article|product|tutorial|documentation|video|presentation|other",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "suggestedScript": "A brief 2-3 paragraph script summarizing the key points"
}`,
      systemPrompt: 'You are a content analyst. Analyze URLs and extract key information. Return only valid JSON.',
      temperature: 0.5,
      maxTokens: 2000
    }
  });

  if (error) {
    console.error('[GenieScriptService] URL analysis error:', error);
    throw new Error(`URL analysis failed: ${error.message}`);
  }

  try {
    let content = data.content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content.trim();
    
    return JSON.parse(jsonStr);
  } catch (parseError) {
    console.error('[GenieScriptService] Failed to parse URL analysis:', parseError);
    throw new Error('Failed to parse AI response for URL analysis');
  }
}

// Export as singleton-like for convenience
export const genieScriptService = {
  analyzeScript,
  enhanceScript,
  enhanceSegment,
  generateTTS,
  generateBatchTTS,
  generateImageSuggestions,
  generateScriptFromSources,
  analyzeURLContent
};
