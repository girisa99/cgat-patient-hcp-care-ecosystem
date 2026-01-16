/**
 * Types for Universal Presentation Generator
 * Slide editing, AI enhancement, and generation types
 */

export type SlideType = 'title' | 'content' | 'section' | 'infographic' | 'journey' | 'stats' | 'conclusion' | 'cta';
export type ContentType = 'bullets' | 'paragraphs' | 'stats' | 'journey' | 'comparison' | 'timeline' | 'quote';
export type SlideEnhancementType = 
  | 'rewrite'       // Improve clarity
  | 'expand'        // Add more detail
  | 'summarize'     // Make concise
  | 'polish'        // Professional refinement
  | 'regenerate'    // Completely regenerate
  | 'add_stats'     // Add statistics
  | 'add_visuals'   // Enhance visual descriptions
  | 'simplify';     // Simplify language

// Collateral types for different use cases
export type CollateralType = 
  | 'presentation'      // Standard presentation
  | 'marketing'         // Marketing materials
  | 'website'           // Website collateral
  | 'conference'        // Conference materials
  | 'investor'          // Investor pitch deck
  | 'sales'             // Sales enablement
  | 'training'          // Training materials
  | 'product-launch'    // Product launch
  | 'case-study'        // Case studies
  | 'whitepaper';       // White papers

// Image source options
export type ImageSourceType = 
  | 'ai-generated'      // Full AI generation
  | 'stock-upload'      // User uploads stock images
  | 'placeholder'       // Leave placeholders for later
  | 'mixed';            // Mix of AI and uploads

// Image style types
export type ImageStyleType = 
  | 'sketch'            // Hand-drawn sketches
  | 'ai-realistic'      // Photorealistic AI images
  | 'illustration'      // Illustrations
  | 'infographic'       // Infographic style
  | 'workflow'          // Workflow diagrams
  | 'icons'             // Icon-based
  | 'charts'            // Charts and graphs
  | 'abstract';         // Abstract visuals

// Voice provider options
export type VoiceProviderType = 'openai' | 'elevenlabs' | 'amazon-polly' | 'google';

// AI Model suggestions based on content type
export interface AIModelSuggestion {
  textModel: string;
  imageModel: string;
  reason: string;
  confidence: number;
}

// Collateral configuration
export interface CollateralConfig {
  type: CollateralType;
  imageSource: ImageSourceType;
  imageStyles: ImageStyleType[];
  voiceProvider?: VoiceProviderType;
  suggestedModel?: AIModelSuggestion;
}

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  type: SlideType;
  title: string;
  subtitle?: string;
  content: SlideContentData;
  image?: GeneratedSlideImage;
  speakerNotes?: string;
  
  // Original content for revert
  originalTitle?: string;
  originalContent?: SlideContentData;
  
  // State
  isEnhancing?: boolean;
  isRegenerating?: boolean;
  isAccepted?: boolean;
  isSkipped?: boolean;
  enhancementApplied?: SlideEnhancementType;
  
  // Metadata
  topic?: string;
  segment?: string;
  importance?: 'high' | 'medium' | 'low';
  imagePrompt?: string;
}

export interface SlideContentData {
  type: ContentType;
  bullets?: BulletPoint[];
  paragraphs?: string[];
  stats?: StatItem[];
  journeySteps?: JourneyStep[];
  comparisonItems?: ComparisonItem[];
  timelineEvents?: TimelineEvent[];
  quote?: QuoteData;
}

export interface BulletPoint {
  id: string;
  text: string;
  originalText?: string;
  isEnhancing?: boolean;
  isEditing?: boolean;
  enhancementApplied?: SlideEnhancementType;
}

export interface StatItem {
  value: string;
  label: string;
  icon?: string;
  originalValue?: string;
  originalLabel?: string;
}

export interface JourneyStep {
  id: number;
  title: string;
  description: string;
  icon?: string;
  status?: 'completed' | 'current' | 'upcoming';
}

export interface ComparisonItem {
  left: string;
  right: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface QuoteData {
  text: string;
  author: string;
}

export interface GeneratedSlideImage {
  url: string;
  base64?: string;
  alt: string;
  type: 'hero' | 'illustration' | 'icon' | 'infographic' | 'chart';
  prompt: string;
  isRegenerating?: boolean;
}

export interface PresentationData {
  id: string;
  title: string;
  subtitle?: string;
  slides: PresentationSlide[];
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
  
  // Source info
  sourceType: 'document' | 'image' | 'text' | 'prompt' | 'url';
  sourceContent?: string;
  
  // Generation settings
  length: 'short' | 'standard' | 'long';
  outputFormat: 'pptx' | 'social' | 'infographic' | 'whitepaper' | 'journey-map';
  imageStyle?: string;
  
  // Stats
  imagesGenerated: number;
  slidesAccepted: number;
  slidesSkipped: number;
}

export interface SlideEnhancementOptions {
  type: SlideEnhancementType;
  customInstructions?: string;
  targetTone?: 'professional' | 'casual' | 'educational' | 'inspirational';
  preserveLength?: boolean;
}

export interface BulletEnhancementResult {
  bulletId: string;
  originalText: string;
  enhancedText: string;
  type: SlideEnhancementType;
}
