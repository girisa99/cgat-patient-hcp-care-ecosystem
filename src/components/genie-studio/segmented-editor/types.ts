/**
 * Types for Segmented Script Editor
 * Shared types for segments, TTS, and AI enhancements
 */

export type SegmentType = 'slide' | 'chapter' | 'section' | 'scene' | 'step';
export type SourceType = 'video' | 'url' | 'document' | 'presentation' | 'image';
export type MediaContentType = 
  | 'presentation'
  | 'video_content'
  | 'image_gallery'
  | 'infographic'
  | 'document'
  | 'website'
  | 'product_page'
  | 'article'
  | 'tutorial'
  | 'general';

export interface ScriptSegment {
  id: string;
  segmentNumber: number;
  type: SegmentType;
  title?: string;
  narration: string;
  originalNarration?: string; // Before AI enhancement
  visualNotes?: string;
  duration: number; // seconds
  wordCount: number;
  
  // TTS state
  audioUrl?: string;
  audioBlob?: Blob;
  isGeneratingTTS?: boolean;
  
  // AI enhancement state
  isEnhancing?: boolean;
  enhancementApplied?: AIEnhancementType;
  
  // Metadata
  sourceTimestamp?: string;
  sourceUrl?: string;
  tags?: string[];
}

export type AIEnhancementType = 
  | 'rewrite'      // Improve clarity and tone
  | 'expand'       // Add more detail
  | 'summarize'    // Make more concise
  | 'polish'       // Professional polish
  | 'transitions'  // Add transitions between segments
  | 'brand_voice'; // Match brand voice

export interface AIEnhancementOptions {
  type: AIEnhancementType;
  customInstructions?: string;
  targetTone?: 'professional' | 'casual' | 'educational' | 'inspirational';
  preserveLength?: boolean;
}

export interface TTSOptions {
  provider: 'openai' | 'elevenlabs' | 'google';
  voice: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
}

export interface SegmentedScriptData {
  id: string;
  title: string;
  sourceType: SourceType;
  mediaContentType: MediaContentType;
  segments: ScriptSegment[];
  totalDuration: number;
  totalWordCount: number;
  createdAt: string;
  updatedAt: string;
  
  // Source metadata
  sourceUrl?: string;
  sourceFilename?: string;
  detectedType?: string;
  confidence?: number;
  
  // Script format metadata
  scriptFormat?: string; // slide_by_slide, chapter_based, etc.
  processingOptions?: Record<string, boolean>;
}

// URL Detection types - Enhanced
export type DetectedURLMediaType = 
  | 'presentation'      // Google Slides, Canva, PowerPoint Online, Prezi
  | 'video'            // YouTube, Vimeo, Loom, embedded videos
  | 'image'            // Direct image URLs, galleries
  | 'infographic'      // Visual data representations
  | 'document'         // PDFs, Google Docs, Notion
  | 'product_page'     // E-commerce, SaaS products
  | 'article'          // Blog posts, news articles
  | 'documentation'    // Tech docs, API guides
  | 'landing_page'     // Marketing pages
  | 'tutorial'         // How-to content
  | 'general';         // Fallback

export interface EnhancedURLAnalysisResult {
  detectedMediaType: DetectedURLMediaType;
  confidence: number;
  alternativeTypes: { type: DetectedURLMediaType; confidence: number }[];
  
  // Content info
  pageTitle: string;
  pageDescription: string;
  
  // Media detection
  hasEmbeddedVideo: boolean;
  hasEmbeddedPresentation: boolean;
  hasImages: boolean;
  imageCount?: number;
  videoUrls?: string[];
  presentationUrl?: string;
  
  // Content characteristics
  hasPricing: boolean;
  hasTestimonials: boolean;
  hasCodeBlocks: boolean;
  hasDataTables: boolean;
  
  // Topics
  keyTopics: string[];
  wordCount: number;
  
  // Suggested processing
  suggestedScriptFormats: string[];
  suggestedSegmentType: SegmentType;
}

export interface SegmentUpdatePayload {
  segmentId: string;
  field: keyof ScriptSegment;
  value: string | number | boolean | undefined;
}

export interface BatchTTSProgress {
  total: number;
  completed: number;
  failed: number;
  currentSegmentId?: string;
}
