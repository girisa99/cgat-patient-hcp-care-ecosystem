/**
 * VIDEO TO SCRIPT SERVICE - Genie Spark
 * Extracts audio from video, transcribes, and generates scripts
 * 
 * Flow: [Video] → [Audio Extraction] → [Transcription] → [Script Generation]
 */

import { supabase } from '@/integrations/supabase/client';

export type VideoScriptFormat = 'video_script' | 'podcast_script' | 'presentation_script' | 'tutorial_script';

export interface VideoToScriptRequest {
  // Video source
  videoFile?: File;
  videoUrl?: string;
  
  // Script options
  outputFormat: VideoScriptFormat;
  duration?: number;
  generateSlideBySlide?: boolean;
  
  // Enhancement options
  enhanceWithAI?: boolean;
  removeFillerWords?: boolean;
  
  // Style options
  tone?: 'professional' | 'casual' | 'educational' | 'inspirational' | 'dramatic';
  targetAudience?: string;
}

export interface VideoToScriptResult {
  success: boolean;
  transcript?: string;
  script?: GeneratedVideoScript;
  slides?: SlideVoiceover[];
  metadata?: {
    processingTime: number;
    videoDuration: number;
    wordCount: number;
  };
  error?: string;
}

export interface GeneratedVideoScript {
  title: string;
  format: VideoScriptFormat;
  totalDuration: number;
  scenes: VideoScriptScene[];
  metadata: {
    wordCount: number;
    generatedAt: string;
  };
}

export interface VideoScriptScene {
  id: string;
  sceneNumber: number;
  timestamp: { start: number; end: number };
  narration: string;
  visualDirection?: string;
}

export interface SlideVoiceover {
  slideNumber: number;
  title?: string;
  narration: string;
  visualNotes?: string;
  duration: number;
  wordCount: number;
  timestamp?: { start: number; end: number };
}

class VideoToScriptService {
  /**
   * Main entry: Convert video to script
   */
  async convertVideoToScript(request: VideoToScriptRequest): Promise<VideoToScriptResult> {
    const startTime = Date.now();

    try {
      // Step 1: Extract audio from video
      const audioBase64 = await this.extractAudioFromVideo(request.videoFile, request.videoUrl);
      
      if (!audioBase64) {
        return { success: false, error: 'Failed to extract audio from video' };
      }

      // Step 2: Transcribe audio
      const transcript = await this.transcribeAudio(audioBase64);
      
      if (!transcript) {
        return { success: false, error: 'Failed to transcribe audio' };
      }

      // Step 3: Generate script from transcript
      const result = await this.generateScriptFromTranscript(transcript, request);

      return {
        success: true,
        transcript,
        script: result.script,
        slides: result.slides,
        metadata: {
          processingTime: Date.now() - startTime,
          videoDuration: result.script?.totalDuration || 0,
          wordCount: result.script?.metadata.wordCount || 0,
        },
      };
    } catch (error) {
      console.error('VideoToScript error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
      };
    }
  }

  /**
   * Extract audio from video file
   */
  private async extractAudioFromVideo(videoFile?: File, videoUrl?: string): Promise<string | null> {
    try {
      if (videoFile) {
        // Read video file and extract audio track
        // For now, we'll send the video to be processed server-side
        const base64 = await this.fileToBase64(videoFile);
        
        // Call edge function to extract audio
        const { data, error } = await supabase.functions.invoke('extract-video-audio', {
          body: {
            videoBase64: base64,
            mimeType: videoFile.type,
          },
        });

        if (error) {
          console.error('Audio extraction error:', error);
          // Fallback: try to use the video directly for transcription
          return base64;
        }

        return data?.audioBase64 || base64;
      }

      if (videoUrl) {
        // For URL, we'll need to fetch and process
        const { data, error } = await supabase.functions.invoke('extract-video-audio', {
          body: { videoUrl },
        });

        if (error) throw new Error(error.message);
        return data?.audioBase64;
      }

      return null;
    } catch (error) {
      console.error('Audio extraction failed:', error);
      return null;
    }
  }

  /**
   * Transcribe audio using Whisper API
   */
  private async transcribeAudio(audioBase64: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: audioBase64 },
      });

      if (error) throw new Error(error.message);
      return data?.text || null;
    } catch (error) {
      console.error('Transcription failed:', error);
      return null;
    }
  }

  /**
   * Generate script from transcript
   */
  private async generateScriptFromTranscript(
    transcript: string,
    request: VideoToScriptRequest
  ): Promise<{ script?: GeneratedVideoScript; slides?: SlideVoiceover[] }> {
    try {
      const slideBySlidePrompt = request.generateSlideBySlide
        ? `\n\nIMPORTANT: Structure the output as individual slides with separate voiceover scripts for each. 
           Detect natural breaks in the content to create slide boundaries.
           Each slide should have: slideNumber, title, narration, visualNotes, and estimated duration.`
        : '';

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Convert this video transcript into a ${request.outputFormat.replace('_', ' ')}:

TRANSCRIPT:
${transcript}

REQUIREMENTS:
- Format: ${request.outputFormat}
- Tone: ${request.tone || 'professional'}
- Target audience: ${request.targetAudience || 'general'}
- Remove filler words: ${request.removeFillerWords !== false}
- Enhance with AI: ${request.enhanceWithAI !== false}
${slideBySlidePrompt}

Return ONLY valid JSON in this format:
{
  "title": "Script Title",
  "format": "${request.outputFormat}",
  "totalDuration": 300,
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": 1,
      "timestamp": { "start": 0, "end": 30 },
      "narration": "The spoken text",
      "visualDirection": "Visual notes"
    }
  ],
  ${request.generateSlideBySlide ? `"slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "narration": "Voiceover text for this slide",
      "visualNotes": "What should appear on screen",
      "duration": 30,
      "wordCount": 50
    }
  ],` : ''}
  "metadata": {
    "wordCount": 500,
    "generatedAt": "${new Date().toISOString()}"
  }
}`,
          systemPrompt: 'You are a professional scriptwriter. Convert transcripts into polished, production-ready scripts. Always return valid JSON.',
          action: 'generate_script',
          temperature: 0.7,
          maxTokens: 4000,
        },
      });

      if (error) throw new Error(error.message);

      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid script format');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        script: result as GeneratedVideoScript,
        slides: result.slides as SlideVoiceover[] | undefined,
      };
    } catch (error) {
      console.error('Script generation failed:', error);
      return {};
    }
  }

  /**
   * Helper: Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Detect if content is a presentation (PPTX-like structure)
   */
  async detectPresentationSlides(documentContent: string, documentType: string): Promise<SlideVoiceover[] | null> {
    if (documentType !== 'pptx' && documentType !== 'pdf') {
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Analyze this ${documentType.toUpperCase()} content and extract individual slides with voiceover scripts:

CONTENT:
${documentContent}

For each detected slide, generate:
1. slideNumber: Sequential number
2. title: The slide title or heading
3. narration: A natural voiceover script for presenting this slide (30-60 seconds of speaking)
4. visualNotes: What's visually on the slide
5. duration: Estimated speaking time in seconds
6. wordCount: Number of words in narration

Return ONLY valid JSON array:
[
  {
    "slideNumber": 1,
    "title": "Slide Title",
    "narration": "Voiceover script text...",
    "visualNotes": "Visual elements description",
    "duration": 30,
    "wordCount": 50
  }
]`,
          systemPrompt: 'You are a presentation expert. Extract slides and create natural voiceover scripts. Return valid JSON array.',
          action: 'parse_presentation',
          temperature: 0.5,
        },
      });

      if (error) throw new Error(error.message);

      const jsonMatch = data.content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return null;

      return JSON.parse(jsonMatch[0]) as SlideVoiceover[];
    } catch (error) {
      console.error('Slide detection failed:', error);
      return null;
    }
  }
}

export const videoToScriptService = new VideoToScriptService();
