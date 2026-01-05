/**
 * URL TO SCRIPT SERVICE - Genie Mind P0-9
 * Scrapes web content and converts to production-ready scripts
 * 
 * Flow: [URL] → [Crawl/Extract] → [RAG Context] → [Script Generation]
 * 
 * Uses: crawl-relevant-content edge function (Firecrawl), ai-universal-processor
 */

import { supabase } from '@/integrations/supabase/client';

export type ContentExtractionMode = 'full' | 'summary' | 'key_points' | 'quotes';
export type ScriptOutputFormat = 'video_script' | 'podcast_script' | 'presentation_script' | 'tutorial_script';

export interface UrlToScriptRequest {
  // URL source
  url: string;
  additionalUrls?: string[];
  
  // Extraction options
  extractionMode?: ContentExtractionMode;
  includeImages?: boolean;
  maxContentLength?: number;
  
  // Script options
  outputFormat: ScriptOutputFormat;
  duration?: number; // target duration in seconds
  tone?: 'professional' | 'casual' | 'educational' | 'inspirational' | 'dramatic';
  targetAudience?: string;
  
  // Enhancement options
  useKnowledgeBase?: boolean;
  enhanceWithAI?: boolean;
  aiProvider?: 'openai' | 'claude' | 'gemini';
}

export interface UrlToScriptResult {
  success: boolean;
  crawledContent?: CrawledContent;
  script?: GeneratedUrlScript;
  metadata?: {
    processingTime: number;
    aiProvider: string;
    urlsProcessed: number;
    wordCount: number;
  };
  error?: string;
}

export interface CrawledContent {
  url: string;
  title: string;
  content: string;
  summary?: string;
  images?: { url: string; alt?: string }[];
  metadata?: {
    author?: string;
    publishDate?: string;
    siteName?: string;
  };
}

export interface GeneratedUrlScript {
  title: string;
  format: ScriptOutputFormat;
  totalDuration: number;
  sourceUrl: string;
  scenes: UrlScriptScene[];
  metadata: {
    wordCount: number;
    generatedAt: string;
  };
}

export interface UrlScriptScene {
  id: string;
  sceneNumber: number;
  duration: number;
  narration: string;
  visualDirection?: string;
  sourceQuote?: string;
  bRollSuggestions?: string[];
}

class UrlToScriptService {
  /**
   * Main entry point: Convert URL to script
   */
  async convertUrlToScript(request: UrlToScriptRequest): Promise<UrlToScriptResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Crawl URL content
      const crawledContent = await this.crawlUrl(request.url, request);
      
      if (!crawledContent || !crawledContent.content) {
        return { success: false, error: 'Failed to crawl URL content' };
      }
      
      // Step 2: Process additional URLs if provided
      let combinedContent = crawledContent.content;
      if (request.additionalUrls?.length) {
        const additionalContents = await Promise.all(
          request.additionalUrls.slice(0, 5).map(url => this.crawlUrl(url, request))
        );
        const validContents = additionalContents.filter(c => c?.content);
        combinedContent += '\n\n' + validContents.map(c => c!.content).join('\n\n');
      }
      
      // Step 3: Generate script
      const script = await this.generateScript(
        crawledContent,
        combinedContent,
        request
      );
      
      if (!script) {
        return { 
          success: false, 
          error: 'Script generation failed',
          crawledContent
        };
      }
      
      return {
        success: true,
        crawledContent,
        script,
        metadata: {
          processingTime: Date.now() - startTime,
          aiProvider: request.aiProvider || 'gemini',
          urlsProcessed: 1 + (request.additionalUrls?.length || 0),
          wordCount: script.metadata.wordCount
        }
      };
    } catch (error) {
      console.error('UrlToScript error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Processing failed' 
      };
    }
  }

  /**
   * Crawl URL using crawl-relevant-content edge function or ai-universal-processor
   */
  private async crawlUrl(url: string, request: UrlToScriptRequest): Promise<CrawledContent | null> {
    try {
      // Try using the dedicated crawl function first
      const { data: crawlData, error: crawlError } = await supabase.functions.invoke('crawl-relevant-content', {
        body: {
          urls: [url],
          topic: 'content extraction for script generation',
          maxPages: 1,
          extractImages: request.includeImages
        }
      });
      
      if (!crawlError && crawlData?.processedContent?.length > 0) {
        const content = crawlData.processedContent[0];
        return {
          url,
          title: content.title || 'Web Content',
          content: content.content,
          summary: content.summary,
          images: content.images
        };
      }
      
      // Fallback to AI-based URL analysis
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: request.aiProvider || 'gemini',
          model: 'gemini-2.0-flash-exp',
          prompt: `Analyze and extract content from this URL for video script creation: ${url}

Extract:
1. Main title and headline
2. Key content and main points
3. Important quotes or statistics
4. Author and publication info if available
5. Suggested visual elements

Provide a comprehensive summary suitable for script writing.`,
          systemPrompt: 'You are a content extractor. Analyze web pages and extract structured content for media production.',
          action: 'analyze_url',
          context: { url, mode: request.extractionMode || 'full' }
        }
      });
      
      if (error) throw new Error(error.message);
      
      return {
        url,
        title: this.extractTitle(data.content) || 'Web Content',
        content: data.content,
        metadata: {
          siteName: new URL(url).hostname
        }
      };
    } catch (error) {
      console.error('URL crawl failed:', error);
      return null;
    }
  }

  /**
   * Generate script from crawled content
   */
  private async generateScript(
    crawledContent: CrawledContent,
    combinedContent: string,
    request: UrlToScriptRequest
  ): Promise<GeneratedUrlScript | null> {
    try {
      const formatInstructions = this.getFormatInstructions(request.outputFormat);
      const targetDuration = request.duration || 120;
      const sceneCount = Math.max(3, Math.ceil(targetDuration / 30));
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: request.aiProvider || 'gemini',
          model: 'gemini-2.0-flash-exp',
          prompt: `Convert this web content into a ${request.outputFormat.replace('_', ' ')}:

SOURCE URL: ${crawledContent.url}
TITLE: ${crawledContent.title}

CONTENT:
${combinedContent.slice(0, 8000)}

REQUIREMENTS:
- Target duration: ${targetDuration} seconds
- Number of scenes: ${sceneCount}
- Tone: ${request.tone || 'professional'}
- Target audience: ${request.targetAudience || 'general'}
- Include source attribution and quotes where relevant

${formatInstructions}

Return ONLY valid JSON in this exact format:
{
  "title": "${crawledContent.title}",
  "format": "${request.outputFormat}",
  "totalDuration": ${targetDuration},
  "sourceUrl": "${crawledContent.url}",
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": 1,
      "duration": 30,
      "narration": "The spoken script text",
      "visualDirection": "What should be shown on screen",
      "sourceQuote": "Original quote from source if applicable",
      "bRollSuggestions": ["relevant footage suggestion"]
    }
  ],
  "metadata": {
    "wordCount": 500,
    "generatedAt": "${new Date().toISOString()}"
  }
}`,
          systemPrompt: 'You are a professional scriptwriter who creates engaging content from web sources. Always cite sources and maintain accuracy. Return valid JSON only.',
          action: 'generate_script',
          temperature: 0.7,
          maxTokens: 4000
        }
      });

      if (error) throw new Error(error.message);
      
      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid script format');
      }
      
      return JSON.parse(jsonMatch[0]) as GeneratedUrlScript;
    } catch (error) {
      console.error('Script generation failed:', error);
      return null;
    }
  }

  /**
   * Extract title from content
   */
  private extractTitle(content: string): string | null {
    const titleMatch = content.match(/title[:\s]+["']?([^"'\n]+)/i) ||
                       content.match(/^#\s+(.+)/m) ||
                       content.match(/^(.{10,60})/);
    return titleMatch?.[1]?.trim() || null;
  }

  /**
   * Get format-specific instructions
   */
  private getFormatInstructions(format: ScriptOutputFormat): string {
    const instructions: Record<ScriptOutputFormat, string> = {
      video_script: `
FORMAT: Video Script
- Write engaging narration with natural pacing
- Include visual directions for each scene
- Reference source images or suggest B-roll
- Keep sentences concise for video format
- Include source attribution`,
      
      podcast_script: `
FORMAT: Podcast Script  
- Write conversational, audio-first content
- Include segment breaks
- Add discussion points and questions
- Focus on storytelling from the source
- Cite sources naturally in speech`,
      
      presentation_script: `
FORMAT: Presentation Script
- Structure as slides with talking points
- Include key statistics and quotes
- Add speaker notes with timing
- Suggest charts/visuals from data
- Include source citations`,
      
      tutorial_script: `
FORMAT: Tutorial Script
- Break into clear, sequential steps
- Extract how-to information
- Add practical tips
- Include troubleshooting notes
- Reference source for details`
    };
    
    return instructions[format];
  }
}

export const urlToScriptService = new UrlToScriptService();
