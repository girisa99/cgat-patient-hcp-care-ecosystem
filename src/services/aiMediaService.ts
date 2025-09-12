/**
 * AI MEDIA GENERATION SERVICE
 * Handles image and video generation using various AI providers
 */
import { supabase } from '@/integrations/supabase/client';

export class AIMediaService {
  
  // Generate image using OpenAI DALL-E
  static async generateImageWithOpenAI(prompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          provider: 'openai',
          model: 'gpt-image-1',
          size: '1024x1024',
          quality: 'high',
          output_format: 'png'
        }
      });

      if (error) throw error;
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image with OpenAI:', error);
      throw new Error('Failed to generate image with OpenAI');
    }
  }

  // Generate image using HuggingFace
  static async generateImageWithHuggingFace(prompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          provider: 'huggingface',
          model: 'black-forest-labs/FLUX.1-schnell'
        }
      });

      if (error) throw error;
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image with HuggingFace:', error);
      throw new Error('Failed to generate image with HuggingFace');
    }
  }

  // Generate image using Replicate
  static async generateImageWithReplicate(prompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          provider: 'replicate',
          model: 'black-forest-labs/flux-schnell'
        }
      });

      if (error) throw error;
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image with Replicate:', error);
      throw new Error('Failed to generate image with Replicate');
    }
  }

  // Generate video using Replicate
  static async generateVideoWithReplicate(prompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          prompt,
          provider: 'replicate',
          model: 'minimax/video-01'
        }
      });

      if (error) throw error;
      return data.videoUrl;
    } catch (error) {
      console.error('Error generating video with Replicate:', error);
      throw new Error('Failed to generate video with Replicate');
    }
  }

  // Auto-select best available provider for image generation
  static async generateImage(prompt: string): Promise<string> {
    // Try providers in order of preference
    const providers = [
      () => this.generateImageWithOpenAI(prompt),
      () => this.generateImageWithHuggingFace(prompt),
      () => this.generateImageWithReplicate(prompt)
    ];

    for (const provider of providers) {
      try {
        return await provider();
      } catch (error) {
        console.warn('Provider failed, trying next:', error);
        continue;
      }
    }

    throw new Error('All image generation providers failed');
  }

  // Auto-select best available provider for video generation
  static async generateVideo(prompt: string): Promise<string> {
    // Currently only Replicate supports video generation
    return this.generateVideoWithReplicate(prompt);
  }

  // Upload generated media to Supabase Storage
  static async uploadToStorage(
    dataUrl: string, 
    fileName: string, 
    bucket: string = 'generated-media'
  ): Promise<string> {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${Date.now()}-${fileName}`, blob, {
          contentType: blob.type,
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading to storage:', error);
      throw new Error('Failed to upload media to storage');
    }
  }

  // Process and store generated content
  static async processGeneratedContent(
    content: string,
    type: 'image' | 'video',
    metadata?: any
  ): Promise<{ url: string; metadata: any }> {
    try {
      let processedUrl = content;
      
      // If it's a data URL, upload to storage
      if (content.startsWith('data:')) {
        const fileName = `generated_${type}_${Date.now()}.${type === 'image' ? 'png' : 'mp4'}`;
        processedUrl = await this.uploadToStorage(content, fileName);
      }

      return {
        url: processedUrl,
        metadata: {
          ...metadata,
          type,
          generatedAt: new Date().toISOString(),
          processed: true
        }
      };
    } catch (error) {
      console.error('Error processing generated content:', error);
      throw error;
    }
  }
}