/**
 * Types for Universal Presentation Generator
 * Slide editing, AI enhancement, and generation types
 * Extended with tables, charts, templates, and rich content support
 */

export type SlideType = 'title' | 'content' | 'section' | 'infographic' | 'journey' | 'stats' | 'conclusion' | 'cta' | 'table' | 'chart' | 'comparison' | 'timeline';
export type ContentType = 'bullets' | 'paragraphs' | 'stats' | 'journey' | 'comparison' | 'timeline' | 'quote' | 'table' | 'chart' | 'rich-text';
export type SlideEnhancementType = 
  | 'rewrite'       // Improve clarity
  | 'expand'        // Add more detail
  | 'summarize'     // Make concise
  | 'polish'        // Professional refinement
  | 'regenerate'    // Completely regenerate
  | 'add_stats'     // Add statistics
  | 'add_visuals'   // Enhance visual descriptions
  | 'simplify'      // Simplify language
  | 'add_table'     // Convert to table format
  | 'add_chart'     // Add chart visualization
  | 'convert_format'; // Convert between formats

// Chart types for data visualization
export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar' | 'funnel';

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

// Template definitions
export interface PresentationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'minimal' | 'healthcare' | 'tech' | 'education';
  thumbnail?: string;
  theme: PresentationTheme;
  slideLayouts: SlideLayout[];
}

// Theme definitions
export interface PresentationTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: 'compact' | 'normal' | 'relaxed';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  shadows: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  card: string;
  cardForeground: string;
  border: string;
}

export interface ThemeFonts {
  heading: FontConfig;
  body: FontConfig;
  accent: FontConfig;
}

export interface FontConfig {
  family: string;
  weight: number;
  size?: string;
}

// Slide layout definitions
export interface SlideLayout {
  id: string;
  name: string;
  type: SlideType;
  regions: LayoutRegion[];
}

export interface LayoutRegion {
  id: string;
  type: 'title' | 'subtitle' | 'content' | 'image' | 'chart' | 'table' | 'icon' | 'quote';
  position: { x: number; y: number; width: number; height: number };
  style?: Record<string, string>;
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
  
  // Layout and styling
  layout?: SlideLayout;
  customStyles?: Record<string, string>;
  
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
  table?: TableData;
  chart?: ChartData;
  richContent?: string; // HTML rich text content
}

export interface BulletPoint {
  id: string;
  text: string;
  originalText?: string;
  isEnhancing?: boolean;
  isEditing?: boolean;
  enhancementApplied?: SlideEnhancementType;
  indent?: number; // For nested bullets
  formatting?: TextFormatting;
}

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  highlight?: string;
}

export interface StatItem {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  originalValue?: string;
  originalLabel?: string;
}

export interface JourneyStep {
  id: number;
  title: string;
  description: string;
  icon?: string;
  status?: 'completed' | 'current' | 'upcoming';
  color?: string;
}

export interface ComparisonItem {
  left: string;
  right: string;
  leftLabel?: string;
  rightLabel?: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface QuoteData {
  text: string;
  author: string;
  role?: string;
  avatar?: string;
}

// Table support
export interface TableData {
  headers: TableCell[];
  rows: TableRow[];
  style?: TableStyle;
  caption?: string;
}

export interface TableCell {
  id: string;
  content: string;
  colSpan?: number;
  rowSpan?: number;
  alignment?: 'left' | 'center' | 'right';
  formatting?: TextFormatting;
}

export interface TableRow {
  id: string;
  cells: TableCell[];
  isHeader?: boolean;
  style?: Record<string, string>;
}

export interface TableStyle {
  headerBackground?: string;
  headerForeground?: string;
  stripedRows?: boolean;
  borders?: 'none' | 'horizontal' | 'vertical' | 'all';
  borderColor?: string;
}

// Chart support
export interface ChartData {
  type: ChartType;
  title?: string;
  labels: string[];
  datasets: ChartDataset[];
  options?: ChartOptions;
}

export interface ChartDataset {
  label: string;
  data: number[];
  color?: string;
  backgroundColor?: string;
}

export interface ChartOptions {
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGrid?: boolean;
  showLabels?: boolean;
  animation?: boolean;
}

export interface GeneratedSlideImage {
  url: string;
  base64?: string;
  alt: string;
  type: 'hero' | 'illustration' | 'icon' | 'infographic' | 'chart';
  prompt: string;
  isRegenerating?: boolean;
  model?: string;
}

export interface PresentationData {
  id: string;
  title: string;
  subtitle?: string;
  slides: PresentationSlide[];
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
  
  // Template and theme
  template?: PresentationTemplate;
  theme?: PresentationTheme;
  
  // Source info
  sourceType: 'document' | 'image' | 'text' | 'prompt' | 'url';
  sourceContent?: string;
  
  // Generation settings
  length: 'short' | 'standard' | 'long';
  outputFormat: 'pptx' | 'social' | 'infographic' | 'whitepaper' | 'journey-map';
  imageStyle?: string;
  imageModel?: string;
  
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
  targetFormat?: ContentType;
}

export interface BulletEnhancementResult {
  bulletId: string;
  originalText: string;
  enhancedText: string;
  type: SlideEnhancementType;
}

// Editing modes
export type EditingMode = 'slide' | 'presentation' | 'prompt';

export interface EditingContext {
  mode: EditingMode;
  selectedSlideId?: string;
  customPrompt?: string;
  targetSlides?: string[]; // For batch editing
}
