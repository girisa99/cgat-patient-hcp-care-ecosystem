/**
 * IMAGE TO SCRIPT SERVICE - Genie Vibe
 * Connects AI-generated images to script generation pipeline
 * 
 * Flow: [Prompt] → [Image Gen] → [Vision Analysis] → [Script Generation]
 * 
 * Supports: OpenAI DALL-E, Gemini Imagen, Replicate Flux
 */

import { supabase } from '@/integrations/supabase/client';
import { AIMediaService } from './aiMediaService';
import { geminiMediaService } from './geminiMediaService';

export type ImageProvider = 'openai' | 'gemini' | 'replicate' | 'huggingface';
export type ScriptStyle = 'narration' | 'presentation' | 'documentary' | 'commercial' | 'educational';

export interface ImageToScriptRequest {
  // Image generation params
  imagePrompt: string;
  imageProvider?: ImageProvider;
  
  // Script generation params
  scriptStyle?: ScriptStyle;
  duration?: number; // seconds
  tone?: 'professional' | 'casual' | 'dramatic' | 'informative' | 'educational' | 'inspirational';
  targetAudience?: string;
  
  // Optional existing image
  existingImageUrl?: string;
}

export interface ImageToScriptResult {
  success: boolean;
  imageUrl?: string;
  imageDescription?: string;
  script?: {
    title: string;
    segments: ScriptSegment[];
    totalDuration: number;
  };
  metadata?: {
    imageProvider: ImageProvider;
    aiProvider: string;
    processingTime: number;
  };
  error?: string;
}

export interface ScriptSegment {
  id: string;
  type: 'intro' | 'main' | 'transition' | 'outro';
  text: string;
  duration: number;
  visualNotes: string;
  imageReference?: string;
}

class ImageToScriptService {
  /**
   * Generate image and convert to script
   */
  async generateImageAndScript(request: ImageToScriptRequest): Promise<ImageToScriptResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Generate or use existing image
      let imageUrl = request.existingImageUrl;
      let imageProvider = request.imageProvider || 'gemini';
      
      if (!imageUrl) {
        const imageResult = await this.generateImage(request.imagePrompt, imageProvider);
        if (!imageResult.success || !imageResult.url) {
          return { success: false, error: imageResult.error || 'Image generation failed' };
        }
        imageUrl = imageResult.url;
      }
      
      // Step 2: Analyze image with vision AI
      const imageDescription = await this.analyzeImageWithVision(imageUrl);
      if (!imageDescription) {
        return { success: false, error: 'Image analysis failed', imageUrl };
      }
      
      // Step 3: Generate script from image description
      const script = await this.generateScriptFromDescription(
        imageDescription,
        request.imagePrompt,
        request.scriptStyle || 'narration',
        request.duration || 60,
        request.tone || 'professional',
        request.targetAudience
      );
      
      if (!script) {
        return { 
          success: false, 
          error: 'Script generation failed', 
          imageUrl, 
          imageDescription 
        };
      }
      
      return {
        success: true,
        imageUrl,
        imageDescription,
        script,
        metadata: {
          imageProvider,
          aiProvider: 'gemini',
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('ImageToScript pipeline error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Pipeline failed' 
      };
    }
  }

  /**
   * Generate image using specified provider
   */
  private async generateImage(
    prompt: string, 
    provider: ImageProvider
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      switch (provider) {
        case 'openai':
          const openaiUrl = await AIMediaService.generateImageWithOpenAI(prompt);
          return { success: true, url: openaiUrl };
          
        case 'gemini':
          const geminiResult = await geminiMediaService.generateImage({
            prompt,
            aspectRatio: '16:9',
            style: 'photographic'
          });
          return { 
            success: geminiResult.success, 
            url: geminiResult.mediaUrl,
            error: geminiResult.error 
          };
          
        case 'replicate':
          const replicateUrl = await AIMediaService.generateImageWithReplicate(prompt);
          return { success: true, url: replicateUrl };
          
        case 'huggingface':
          const hfUrl = await AIMediaService.generateImageWithHuggingFace(prompt);
          return { success: true, url: hfUrl };
          
        default:
          // Fallback to any available provider
          const fallbackUrl = await AIMediaService.generateImage(prompt);
          return { success: true, url: fallbackUrl };
      }
    } catch (error) {
      console.error(`Image generation failed with ${provider}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Image generation failed' 
      };
    }
  }

  /**
   * Analyze image using vision AI (GPT-4 Vision or Gemini Pro Vision)
   */
  private async analyzeImageWithVision(imageUrl: string): Promise<string | null> {
    try {
      // Check if it's a base64 image or URL
      const isBase64 = imageUrl.startsWith('data:');
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash-exp',
          prompt: `Analyze this image in detail for video script creation. Describe:
1. Main subject and scene composition
2. Colors, lighting, and mood
3. Key visual elements and their positions
4. Suggested narrative themes
5. Emotional tone conveyed

${isBase64 ? 'The image is provided as base64 data.' : `Image URL: ${imageUrl}`}`,
          systemPrompt: 'You are a visual content analyst helping create video scripts from images. Provide detailed, creative descriptions that can be used for scriptwriting.',
          action: 'analyze_image',
          context: { imageUrl: isBase64 ? '[base64 image]' : imageUrl },
          // Include image data for vision models
          imageData: isBase64 ? imageUrl : undefined
        }
      });

      if (error) throw new Error(error.message);
      return data?.content || null;
    } catch (error) {
      console.error('Vision analysis failed:', error);
      // Provide a fallback description if vision analysis fails
      return `Visual content from: ${imageUrl.substring(0, 100)}... Ready for script generation.`;
    }
  }

  /**
   * Generate script from image description
   */
  private async generateScriptFromDescription(
    imageDescription: string,
    originalPrompt: string,
    style: ScriptStyle,
    duration: number,
    tone: string,
    targetAudience?: string
  ): Promise<ImageToScriptResult['script'] | null> {
    try {
      const styleInstructions = this.getStyleInstructions(style);
      const segmentCount = Math.max(3, Math.ceil(duration / 20)); // ~20 seconds per segment
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash-exp',
          prompt: `Create a ${style} video script based on this visual concept:

ORIGINAL CONCEPT: ${originalPrompt}

IMAGE ANALYSIS:
${imageDescription}

REQUIREMENTS:
- Total duration: ${duration} seconds
- Tone: ${tone}
- Target audience: ${targetAudience || 'general'}
- Number of segments: ${segmentCount}

${styleInstructions}

Return ONLY valid JSON in this exact format:
{
  "title": "Script title",
  "segments": [
    {
      "id": "segment-1",
      "type": "intro|main|transition|outro",
      "text": "Narration or on-screen text",
      "duration": 15,
      "visualNotes": "Visual direction for this segment"
    }
  ],
  "totalDuration": ${duration}
}`,
          systemPrompt: 'You are a professional video scriptwriter. Generate creative, engaging scripts based on visual concepts. Always return valid JSON.',
          action: 'generate_script',
          temperature: 0.8,
          maxTokens: 2000
        }
      });

      if (error) throw new Error(error.message);
      
      // Parse the JSON response
      const content = data.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid script format');
      }
      
      const script = JSON.parse(jsonMatch[0]);
      return script;
    } catch (error) {
      console.error('Script generation failed:', error);
      return null;
    }
  }

  /**
   * Get style-specific instructions
   */
  private getStyleInstructions(style: ScriptStyle): string {
    const instructions: Record<ScriptStyle, string> = {
      narration: 'Write as a documentary-style voice-over narration. Use descriptive, evocative language.',
      presentation: 'Write as bullet points and key messages for a business presentation. Keep it concise and impactful.',
      documentary: 'Write as an investigative documentary script with facts, insights, and compelling storytelling.',
      commercial: 'Write as a punchy, persuasive advertisement script with a clear call-to-action.',
      educational: 'Write as an educational explainer with clear explanations and learning objectives.'
    };
    return instructions[style];
  }

  /**
   * Batch process multiple images to a unified script
   */
  async batchImagesToScript(
    imagePrompts: string[],
    options: Omit<ImageToScriptRequest, 'imagePrompt'>
  ): Promise<ImageToScriptResult> {
    const startTime = Date.now();
    const imageResults: { url: string; description: string }[] = [];
    
    try {
      // Generate and analyze all images in parallel
      const imagePromises = imagePrompts.map(async (prompt) => {
        const result = await this.generateImageAndScript({
          ...options,
          imagePrompt: prompt
        });
        if (result.success && result.imageUrl && result.imageDescription) {
          return { url: result.imageUrl, description: result.imageDescription };
        }
        return null;
      });
      
      const results = await Promise.all(imagePromises);
      imageResults.push(...results.filter((r): r is NonNullable<typeof r> => r !== null));
      
      if (imageResults.length === 0) {
        return { success: false, error: 'No images were successfully generated' };
      }
      
      // Combine all descriptions into a unified script
      const combinedDescription = imageResults
        .map((r, i) => `[Scene ${i + 1}]\n${r.description}`)
        .join('\n\n');
      
      const script = await this.generateScriptFromDescription(
        combinedDescription,
        imagePrompts.join('; '),
        options.scriptStyle || 'narration',
        options.duration || imageResults.length * 30,
        options.tone || 'professional',
        options.targetAudience
      );
      
      return {
        success: true,
        imageUrl: imageResults[0].url,
        imageDescription: combinedDescription,
        script: script || undefined,
        metadata: {
          imageProvider: options.imageProvider || 'gemini',
          aiProvider: 'gemini',
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('Batch image to script failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Batch processing failed' 
      };
    }
  }
}

export const imageToScriptService = new ImageToScriptService();
