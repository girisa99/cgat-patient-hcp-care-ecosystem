/**
 * Types for Universal Presentation Generator
 * Slide editing, AI enhancement, and generation types
 * Extended with tables, charts, templates, and rich content support
 * Enhanced with visual element editing and multi-format export
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

// Visual element action types
export type ElementActionType = 
  | 'edit'          // Manual text/content edit
  | 'regenerate'    // Full AI regeneration
  | 'enhance'       // AI enhancement (improve current)
  | 'revert'        // Undo to original
  | 'style'         // Change colors/fonts/size
  | 'resize';       // Scale SVG elements

// Visual element format types
export type VisualFormat = 'svg' | 'png' | 'webp';

// Export format types  
export type ExportFormat = 'svg' | 'png' | 'webp' | 'pdf';

// Visual layer types for hybrid rendering
export type VisualLayerType = 'text' | 'visual' | 'vector';

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

// ==========================================
// OUTPUT TYPES - Visual Output Formats
// ==========================================

export type OutputType = 
  | '2d-static'         // Standard 2D slides (PNG/SVG)
  | '2d-animated'       // 2D with CSS/Framer animations
  | '3d-scene'          // 3D rendered scenes (Three.js)
  | '3d-animated'       // 3D with physics/animations
  | 'video-intro'       // Video introduction clips
  | 'video-full'        // Full video presentations
  | 'interactive'       // Interactive web components
  | 'mixed';            // Combination of types

export interface OutputTypeConfig {
  id: OutputType;
  name: string;
  description: string;
  icon: string;
  providers: string[];    // Available providers for this type
  capabilities: string[]; // What it can do
  tier: 1 | 2 | 3;       // Quality tier
}

export const OUTPUT_TYPE_CONFIGS: OutputTypeConfig[] = [
  {
    id: '2d-static',
    name: '2D Static Slides',
    description: 'Standard high-quality slides with images, charts, infographics',
    icon: 'Image',
    providers: ['modelslab', 'flux-pro', 'dall-e-3', 'gemini-image', 'stability', 'alibaba-wanx'],
    capabilities: ['PNG export', 'SVG overlay', 'Print-ready', 'Text rendering'],
    tier: 1
  },
  {
    id: '2d-animated',
    name: '2D Animated',
    description: 'Slides with CSS/Framer Motion animations and transitions',
    icon: 'Sparkles',
    providers: ['modelslab', 'flux-pro', 'framer-motion', 'lottie'],
    capabilities: ['Entry animations', 'Hover effects', 'Scroll triggers', 'Micro-interactions'],
    tier: 2
  },
  {
    id: '3d-scene',
    name: '3D Scene',
    description: 'Three.js rendered 3D scenes and models',
    icon: 'Box',
    providers: ['modelslab-3d', 'three-js', 'replicate-3d'],
    capabilities: ['3D models', 'Scene composition', 'Lighting', 'Camera angles'],
    tier: 2
  },
  {
    id: '3d-animated',
    name: '3D Animated',
    description: 'Full 3D animations with physics and particle effects',
    icon: 'Orbit',
    providers: ['modelslab-3d', 'three-js', 'replicate-3d'],
    capabilities: ['Physics simulation', 'Particle effects', '3D transitions', 'Flow animations'],
    tier: 3
  },
  {
    id: 'video-intro',
    name: 'Video Intro',
    description: 'Short 5-10s video intros and outros',
    icon: 'Video',
    providers: ['modelslab-video', 'replicate-video', 'runway', 'pika-labs', 'alibaba-video'],
    capabilities: ['Motion graphics', 'Logo reveals', 'Cinematic effects', 'AI-generated scenes'],
    tier: 2
  },
  {
    id: 'video-full',
    name: 'Full Video',
    description: 'Complete video presentations with voiceover',
    icon: 'Film',
    providers: ['modelslab-video', 'replicate-video', 'elevenlabs-tts', 'azure-tts'],
    capabilities: ['Full narration', 'Scene transitions', 'Background music', 'Multi-language'],
    tier: 3
  },
  {
    id: 'interactive',
    name: 'Interactive',
    description: 'Web-based interactive presentations with user controls',
    icon: 'MousePointerClick',
    providers: ['react-components', 'three-js', 'framer-motion'],
    capabilities: ['Clickable elements', 'Form inputs', 'Data visualization', 'Real-time updates'],
    tier: 3
  },
  {
    id: 'mixed',
    name: 'Mixed Output',
    description: 'Combination of static, animated, and video elements',
    icon: 'Layers',
    providers: ['all'],
    capabilities: ['Per-slide customization', 'Best-of-breed selection', 'Adaptive quality'],
    tier: 1
  }
];

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

// ============= VISUAL ELEMENT TYPES =============

/**
 * Visual element for hybrid rendering (PNG background + SVG text overlays)
 */
export interface VisualElement {
  id: string;
  type: 'infographic' | 'chart' | 'diagram' | 'icon' | 'photo' | 'illustration';
  
  // Layered content for hybrid rendering
  layers: VisualLayer[];
  
  // Combined render (for preview)
  previewUrl?: string;
  
  // Original state for revert
  originalLayers?: VisualLayer[];
  
  // Generation metadata
  prompt?: string;
  model?: string;
  generatedAt?: string;
  
  // Editing state
  isEditing?: boolean;
  isRegenerating?: boolean;
  isEnhancing?: boolean;
  
  // Style configuration
  style: VisualElementStyle;
}

/**
 * Individual layer in the hybrid rendering system
 */
export interface VisualLayer {
  id: string;
  type: VisualLayerType;
  zIndex: number;
  
  // Content based on type
  content: 
    | TextLayerContent      // For text layers (SVG text, editable)
    | VisualLayerContent    // For visual layers (PNG/WebP, AI-generated)
    | VectorLayerContent;   // For vector layers (SVG shapes, icons)
    
  // Position and size
  position: { x: number; y: number };
  size: { width: number; height: number };
  
  // Visibility
  isVisible: boolean;
  isLocked: boolean;
}

export interface TextLayerContent {
  type: 'text';
  text: string;
  originalText?: string;
  format: 'svg' | 'html';
  style: TextStyle;
}

export interface VisualLayerContent {
  type: 'visual';
  url: string;
  base64?: string;
  format: 'png' | 'webp' | 'jpg';
  alt: string;
}

export interface VectorLayerContent {
  type: 'vector';
  svgContent: string;
  isEditable: boolean;
  elements?: SVGElementData[];
}

export interface SVGElementData {
  id: string;
  tagName: string;
  attributes: Record<string, string>;
  children?: SVGElementData[];
  isEditable: boolean;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor?: string;
  alignment: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
}

export interface VisualElementStyle {
  backgroundColor?: string;
  borderRadius?: number;
  border?: string;
  shadow?: string;
  padding?: number;
}

/**
 * Element action configuration
 */
export interface ElementAction {
  type: ElementActionType;
  label: string;
  description: string;
  icon: string;
  shortcut?: string;
  isDestructive?: boolean;
  requiresConfirmation?: boolean;
}

/**
 * Style editor configuration
 */
export interface StyleEditorConfig {
  allowFontChange: boolean;
  allowColorChange: boolean;
  allowSizeChange: boolean;
  allowPositionChange: boolean;
  colorPalette?: string[];
  fontOptions?: string[];
  sizePresets?: { label: string; width: number; height: number }[];
}

/**
 * Export configuration
 */
export interface ExportConfig {
  format: ExportFormat;
  quality?: number; // 0-100 for lossy formats
  scale?: number;   // 1x, 2x, 3x for resolution
  backgroundColor?: string;
  includeMetadata?: boolean;
}

/**
 * Export result
 */
export interface ExportResult {
  format: ExportFormat;
  blob: Blob;
  url: string;
  filename: string;
  size: number;
  dimensions: { width: number; height: number };
}

// ============= END VISUAL ELEMENT TYPES =============

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  type: SlideType;
  title: string;
  subtitle?: string;
  content: SlideContentData;
  image?: GeneratedSlideImage;
  speakerNotes?: string;
  
  // Visual elements (hybrid PNG+SVG)
  visualElements?: VisualElement[];
  
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
  
  // Visual format info
  format?: VisualFormat;
  layers?: VisualLayer[];
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
  
  // Export settings
  preferredExportFormats?: ExportFormat[];
  
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
export type EditingMode = 'slide' | 'presentation' | 'prompt' | 'visual-element';

export interface EditingContext {
  mode: EditingMode;
  selectedSlideId?: string;
  selectedElementId?: string;
  customPrompt?: string;
  targetSlides?: string[]; // For batch editing
}
