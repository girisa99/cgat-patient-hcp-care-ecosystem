/**
 * DOCUMENT TO SCRIPT SERVICE - Genie Mind
 * Parses documents and converts them to production-ready scripts
 * 
 * Flow: [Document] → [Parse/Extract] → [RAG Context] → [Script Generation]
 * 
 * Supports: PDF, DOCX, PPT, TXT, Markdown, HTML
 */

import { supabase } from '@/integrations/supabase/client';

export type DocumentType = 'pdf' | 'docx' | 'pptx' | 'txt' | 'md' | 'html';
export type OutputFormat = 'video_script' | 'podcast_script' | 'presentation_script' | 'webinar_script' | 'tutorial_script';

export interface DocumentToScriptRequest {
  // Document source
  documentUrl?: string;
  documentContent?: string;
  documentType?: DocumentType;
  
  // Script options
  outputFormat: OutputFormat;
  duration?: number; // target duration in seconds
  includeVisuals?: boolean;
  includeSpeakerNotes?: boolean;
  
  // Enhancement options
  useKnowledgeBase?: boolean;
  knowledgeBaseId?: string;
  enhanceWithAI?: boolean;
  
  // Style options
  tone?: 'professional' | 'casual' | 'educational' | 'inspirational' | 'dramatic' | 'informative';
  targetAudience?: string;
  language?: string;
}

export interface DocumentToScriptResult {
  success: boolean;
  script?: GeneratedScript;
  extractedContent?: ExtractedContent;
  ragContext?: string[];
  metadata?: {
    processingTime: number;
    aiProvider: string;
    wordCount: number;
    estimatedDuration: number;
  };
  error?: string;
}

export interface ExtractedContent {
  title?: string;
  sections: ContentSection[];
  images?: { url: string; description: string }[];
  tables?: { headers: string[]; rows: string[][] }[];
  metadata?: Record<string, any>;
}

export interface ContentSection {
  heading?: string;
  content: string;
  type: 'paragraph' | 'list' | 'quote' | 'code' | 'table' | 'image';
  level?: number;
}

export interface GeneratedScript {
  title: string;
  format: OutputFormat;
  totalDuration: number;
  scenes: ScriptScene[];
  metadata: {
    wordCount: number;
    speakingPace: number; // words per minute
    generatedAt: string;
  };
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  duration: number;
  narration: string;
  visualDirection?: string;
  speakerNotes?: string;
  transitions?: {
    in: string;
    out: string;
  };
  bRollSuggestions?: string[];
}

class DocumentToScriptService {
  /**
   * Main entry point: Convert document to script
   */
  async convertDocumentToScript(request: DocumentToScriptRequest): Promise<DocumentToScriptResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Extract content from document
      const extractedContent = await this.extractDocumentContent(
        request.documentUrl,
        request.documentContent,
        request.documentType
      );
      
      if (!extractedContent || extractedContent.sections.length === 0) {
        return { success: false, error: 'Failed to extract document content' };
      }
      
      // Step 2: Get RAG context if enabled
      let ragContext: string[] = [];
      if (request.useKnowledgeBase && request.knowledgeBaseId) {
        ragContext = await this.getRAGContext(extractedContent, request.knowledgeBaseId);
      }
      
      // Step 3: Generate script with AI
      const script = await this.generateScript(
        extractedContent,
        ragContext,
        request
      );
      
      if (!script) {
        return { 
          success: false, 
          error: 'Script generation failed',
          extractedContent,
          ragContext
        };
      }
      
      return {
        success: true,
        script,
        extractedContent,
        ragContext,
        metadata: {
          processingTime: Date.now() - startTime,
          aiProvider: 'gemini',
          wordCount: script.metadata.wordCount,
          estimatedDuration: script.totalDuration
        }
      };
    } catch (error) {
      console.error('DocumentToScript error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Processing failed' 
      };
    }
  }

  /**
   * Extract content from document
   */
  private async extractDocumentContent(
    documentUrl?: string,
    documentContent?: string,
    documentType?: DocumentType
  ): Promise<ExtractedContent | null> {
    try {
      // If direct content provided, parse it
      if (documentContent) {
        return this.parseTextContent(documentContent);
      }
      
      // If URL provided, fetch and process using AI
      if (documentUrl) {
        // Use AI Universal Processor to analyze document from URL
        const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: 'gemini',
            model: 'gemini-2.0-flash',
            prompt: `Analyze and extract structured content from this document URL: ${documentUrl}
            
Document type: ${documentType || this.detectDocumentType(documentUrl)}

Extract and return a JSON object with:
- title: The document title
- sections: Array of content sections with {heading, content, type, level}
- images: Array of image references if any
- tables: Array of table data if any

Return ONLY valid JSON.`,
            systemPrompt: 'You are a document parser. Extract and structure content from documents accurately.',
            action: 'parse_document',
            context: { documentUrl, documentType }
          }
        });
        
        if (error) throw new Error(error.message);
        
        // Try to parse AI response as JSON
        try {
          const jsonMatch = data.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as ExtractedContent;
          }
        } catch {
          // If JSON parsing fails, treat as text content
          return this.parseTextContent(data.content);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Content extraction failed:', error);
      return null;
    }
  }

  /**
   * Parse text content into structured sections
   */
  private parseTextContent(content: string): ExtractedContent {
    const lines = content.split('\n').filter(line => line.trim());
    const sections: ContentSection[] = [];
    let currentSection: ContentSection | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect headings (markdown-style or all caps)
      if (trimmed.startsWith('#') || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 100)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          heading: trimmed.replace(/^#+\s*/, ''),
          content: '',
          type: 'paragraph',
          level: (trimmed.match(/^#+/) || [''])[0].length || 1
        };
      } 
      // Detect lists
      else if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+\.\s/)) {
        if (currentSection?.type !== 'list') {
          if (currentSection) sections.push(currentSection);
          currentSection = { content: trimmed, type: 'list' };
        } else {
          currentSection.content += '\n' + trimmed;
        }
      }
      // Detect quotes
      else if (trimmed.startsWith('>') || trimmed.startsWith('"')) {
        if (currentSection) sections.push(currentSection);
        currentSection = { content: trimmed.replace(/^[>"]\s*/, ''), type: 'quote' };
      }
      // Regular paragraph
      else {
        if (currentSection?.type === 'paragraph') {
          currentSection.content += ' ' + trimmed;
        } else {
          if (currentSection) sections.push(currentSection);
          currentSection = { content: trimmed, type: 'paragraph' };
        }
      }
    }
    
    if (currentSection) sections.push(currentSection);
    
    // Extract title from first heading or first paragraph
    const titleSection = sections.find(s => s.heading) || sections[0];
    const title = titleSection?.heading || titleSection?.content?.slice(0, 50) || 'Untitled Document';
    
    return { title, sections };
  }

  /**
   * Get RAG context from knowledge base
   */
  private async getRAGContext(
    content: ExtractedContent, 
    knowledgeBaseId: string
  ): Promise<string[]> {
    try {
      // Extract key topics from document
      const keyTopics = content.sections
        .slice(0, 5)
        .map(s => s.heading || s.content.slice(0, 100))
        .join('; ');
      
      // Query knowledge base for related content
      const { data, error } = await supabase
        .from('universal_knowledge_base')
        .select('description, finding_name')
        .limit(5);
      
      if (error) {
        console.warn('RAG query failed:', error);
        return [];
      }
      
      // Type assertion to handle Supabase types
      const results = data as Array<{ description: string | null; finding_name: string | null }> || [];
      return results.map(item => 
        `[${item.finding_name || 'Knowledge'}]: ${item.description || ''}`
      );
    } catch (error) {
      console.error('RAG context retrieval failed:', error);
      return [];
    }
  }

  /**
   * Generate script from extracted content
   */
  private async generateScript(
    content: ExtractedContent,
    ragContext: string[],
    request: DocumentToScriptRequest
  ): Promise<GeneratedScript | null> {
    try {
      const formatInstructions = this.getFormatInstructions(request.outputFormat);
      const targetDuration = request.duration || this.estimateDuration(content);
      const sceneCount = Math.max(3, Math.ceil(targetDuration / 30));
      
      const contentSummary = content.sections
        .map(s => s.heading ? `## ${s.heading}\n${s.content}` : s.content)
        .join('\n\n');
      
      const ragEnhancement = ragContext.length > 0
        ? `\n\nADDITIONAL CONTEXT FROM KNOWLEDGE BASE:\n${ragContext.join('\n')}`
        : '';
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt: `Convert this document into a ${request.outputFormat.replace('_', ' ')}:

DOCUMENT TITLE: ${content.title}

DOCUMENT CONTENT:
${contentSummary}
${ragEnhancement}

REQUIREMENTS:
- Target duration: ${targetDuration} seconds
- Number of scenes: ${sceneCount}
- Tone: ${request.tone || 'professional'}
- Target audience: ${request.targetAudience || 'general'}
- Include visual directions: ${request.includeVisuals !== false}
- Include speaker notes: ${request.includeSpeakerNotes !== false}

${formatInstructions}

Return ONLY valid JSON in this exact format:
{
  "title": "${content.title}",
  "format": "${request.outputFormat}",
  "totalDuration": ${targetDuration},
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": 1,
      "duration": 30,
      "narration": "The spoken script text",
      "visualDirection": "What should be shown on screen",
      "speakerNotes": "Additional notes for the presenter",
      "transitions": { "in": "fade", "out": "cut" },
      "bRollSuggestions": ["relevant footage suggestion"]
    }
  ],
  "metadata": {
    "wordCount": 500,
    "speakingPace": 150,
    "generatedAt": "${new Date().toISOString()}"
  }
}`,
          systemPrompt: 'You are a professional scriptwriter specializing in video and audio content. Generate engaging, well-structured scripts that are production-ready. Always return valid JSON.',
          action: 'generate_script',
          temperature: 0.7,
          maxTokens: 4000
        }
      });

      if (error) throw new Error(error.message);
      
      // Parse the JSON response
      const responseContent = data.content;
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid script format');
      }
      
      const script = JSON.parse(jsonMatch[0]) as GeneratedScript;
      return script;
    } catch (error) {
      console.error('Script generation failed:', error);
      return null;
    }
  }

  /**
   * Get format-specific instructions
   */
  private getFormatInstructions(format: OutputFormat): string {
    const instructions: Record<OutputFormat, string> = {
      video_script: `
FORMAT: Video Script
- Write engaging narration with natural pacing
- Include visual directions for each scene (camera angles, graphics, animations)
- Suggest B-roll footage for visual variety
- Include transitions between scenes
- Keep sentences concise for video format`,
      
      podcast_script: `
FORMAT: Podcast Script  
- Write conversational, audio-first content
- Include intro music cues and segment breaks
- Add interview questions if applicable
- Include sound effect suggestions
- Focus on storytelling and engagement`,
      
      presentation_script: `
FORMAT: Presentation Script
- Structure as slides with talking points
- Include key messages per slide
- Add speaker notes with timing
- Suggest visual elements (charts, images, icons)
- Include Q&A prompts if applicable`,
      
      webinar_script: `
FORMAT: Webinar Script
- Include host introduction and housekeeping
- Structure with clear segments and timing
- Add interactive elements (polls, Q&A)
- Include demo/screen share instructions
- Add engagement prompts throughout`,
      
      tutorial_script: `
FORMAT: Tutorial Script
- Break into clear, sequential steps
- Include on-screen text overlays
- Add "pro tips" and common mistakes
- Include progress indicators
- Focus on clarity and learning outcomes`
    };
    
    return instructions[format];
  }

  /**
   * Estimate duration based on content
   */
  private estimateDuration(content: ExtractedContent): number {
    const wordCount = content.sections
      .reduce((sum, s) => sum + s.content.split(/\s+/).length, 0);
    
    // Average speaking pace: 150 words per minute
    const speakingMinutes = wordCount / 150;
    return Math.round(speakingMinutes * 60);
  }

  /**
   * Detect document type from URL
   */
  private detectDocumentType(url: string): DocumentType {
    const extension = url.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, DocumentType> = {
      'pdf': 'pdf',
      'docx': 'docx',
      'doc': 'docx',
      'pptx': 'pptx',
      'ppt': 'pptx',
      'txt': 'txt',
      'md': 'md',
      'markdown': 'md',
      'html': 'html',
      'htm': 'html'
    };
    return typeMap[extension || ''] || 'txt';
  }

  /**
   * Enhance existing script with AI
   */
  async enhanceScript(
    script: GeneratedScript,
    enhancementType: 'clarity' | 'engagement' | 'brevity' | 'storytelling'
  ): Promise<GeneratedScript | null> {
    try {
      const enhancementPrompts: Record<string, string> = {
        clarity: 'Improve clarity and simplicity. Make complex concepts easy to understand.',
        engagement: 'Add hooks, questions, and emotional elements to increase viewer engagement.',
        brevity: 'Condense the script while preserving key messages. Remove redundancy.',
        storytelling: 'Restructure as a narrative with a clear arc: setup, conflict, resolution.'
      };
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt: `Enhance this script for ${enhancementType}:

CURRENT SCRIPT:
${JSON.stringify(script, null, 2)}

ENHANCEMENT GOAL: ${enhancementPrompts[enhancementType]}

Return the enhanced script in the same JSON format.`,
          systemPrompt: 'You are a script editor. Enhance scripts while preserving their structure and format. Return valid JSON.',
          action: 'enhance_script',
          temperature: 0.6
        }
      });

      if (error) throw new Error(error.message);
      
      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return script;
      
      return JSON.parse(jsonMatch[0]) as GeneratedScript;
    } catch (error) {
      console.error('Script enhancement failed:', error);
      return script;
    }
  }
}

export const documentToScriptService = new DocumentToScriptService();
