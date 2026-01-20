/**
 * Types for Universal Presentation Generator
 * Slide editing, AI enhancement, and generation types
 * Extended with tables, charts, templates, and rich content support
 * Enhanced with visual element editing and multi-format export
 */

export type SlideType = 'title' | 'content' | 'section' | 'infographic' | 'journey' | 'stats' | 'conclusion' | 'cta' | 'table' | 'chart' | 'comparison' | 'timeline' | 'video-intro' | 'video-scene' | 'video-outro' | '3d-scene' | '3d-model' | '3d-animated' | 'interactive' | 'chapter-cover';
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
    providers: ['modelslab', 'modelslab-realvision', 'modelslab-civitai', 'flux-pro', 'dall-e-3', 'gemini-image', 'gemini-3-pro-image', 'stability', 'alibaba-wanx'],
    capabilities: ['PNG export', 'SVG overlay', 'Print-ready', 'Text rendering'],
    tier: 1
  },
  {
    id: '2d-animated',
    name: '2D Animated',
    description: 'Slides with CSS/Framer Motion animations and transitions',
    icon: 'Sparkles',
    providers: ['modelslab', 'modelslab-civitai', 'flux-pro', 'framer-motion', 'lottie'],
    capabilities: ['Entry animations', 'Hover effects', 'Scroll triggers', 'Micro-interactions'],
    tier: 2
  },
  {
    id: '3d-scene',
    name: '3D Scene',
    description: 'Three.js rendered 3D scenes and models',
    icon: 'Box',
    providers: ['modelslab-3d', 'meshy-ai', 'triposr', 'point-e', 'three-js', 'replicate-3d'],
    capabilities: ['3D models', 'Scene composition', 'Lighting', 'Camera angles', 'GLB/OBJ export'],
    tier: 2
  },
  {
    id: '3d-animated',
    name: '3D Animated',
    description: 'Full 3D animations with physics and particle effects',
    icon: 'Orbit',
    providers: ['modelslab-3d', 'meshy-ai', 'triposr', 'three-js', 'replicate-3d'],
    capabilities: ['Physics simulation', 'Particle effects', '3D transitions', 'Flow animations'],
    tier: 3
  },
  {
    id: 'video-intro',
    name: 'Video Intro',
    description: 'Short 5-10s video intros and outros',
    icon: 'Video',
    providers: ['openai-sora', 'modelslab-animatediff', 'modelslab-svd', 'gemini-veo', 'runway-gen3', 'pika-labs', 'alibaba-wanx-video', 'replicate-video'],
    capabilities: ['Motion graphics', 'Logo reveals', 'Cinematic effects', 'AI-generated scenes'],
    tier: 2
  },
  {
    id: 'video-full',
    name: 'Full Video',
    description: 'Complete video presentations with voiceover',
    icon: 'Film',
    providers: ['openai-sora', 'modelslab-animatediff', 'gemini-veo', 'elevenlabs-tts', 'azure-neural', 'alibaba-cosyvoice'],
    capabilities: ['Full narration', 'Scene transitions', 'Background music', 'Multi-language', 'Voice cloning'],
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

// ==========================================
// OUTPUT-TYPE-AWARE SLIDE TEMPLATES
// ==========================================

/**
 * Slide/Chapter templates that adapt based on OutputType
 * Each output type has specific slide types it can generate
 */
export interface OutputSlideTemplate {
  id: string;
  name: string;
  description: string;
  outputType: OutputType;
  slideTypes: SlideType[];           // Available slide types for this output
  defaultStructure: SlideStructure[]; // Default chapter/slide structure
  capabilities: string[];
  providers: string[];
  renderSettings: OutputRenderSettings;
}

export interface SlideStructure {
  type: SlideType;
  role: 'opener' | 'content' | 'transition' | 'closer' | 'chapter';
  order: number;
  isRequired: boolean;
  duration?: number;                  // For video outputs (seconds)
  animationType?: AnimationType;      // For animated outputs
  interactiveType?: InteractiveType;  // For interactive outputs
  threeD?: ThreeDConfig;              // For 3D outputs
}

export type AnimationType = 
  | 'fade-in'
  | 'slide-in'
  | 'zoom'
  | 'bounce'
  | 'morph'
  | 'parallax'
  | 'particle'
  | 'kinetic-typography';

export type InteractiveType =
  | 'click-reveal'
  | 'hover-expand'
  | 'drag-explore'
  | 'scroll-trigger'
  | 'form-input'
  | 'quiz'
  | 'timeline-scrub'
  | 'data-filter';

export interface ThreeDConfig {
  sceneType: '3d-static' | '3d-animated' | '3d-interactive';
  cameraPath?: 'orbit' | 'flythrough' | 'fixed' | 'user-controlled';
  lighting?: 'studio' | 'natural' | 'dramatic' | 'neon';
  physics?: boolean;
  particleEffects?: boolean;
}

export interface OutputRenderSettings {
  resolution: { width: number; height: number };
  format: string;
  quality: 'draft' | 'standard' | 'high' | 'ultra';
  fps?: number;                       // For video/animated
  duration?: number;                  // For video
  loop?: boolean;                     // For video/animated
  audioEnabled?: boolean;             // For video
}

// Output-specific slide templates
export const OUTPUT_SLIDE_TEMPLATES: OutputSlideTemplate[] = [
  // 2D Static Templates
  {
    id: '2d-static-standard',
    name: 'Standard Presentation',
    description: 'Classic slide deck with images, charts, and infographics',
    outputType: '2d-static',
    slideTypes: ['title', 'content', 'section', 'infographic', 'journey', 'stats', 'conclusion', 'cta', 'table', 'chart', 'comparison', 'timeline', 'chapter-cover'],
    defaultStructure: [
      { type: 'title', role: 'opener', order: 1, isRequired: true },
      { type: 'section', role: 'chapter', order: 2, isRequired: false },
      { type: 'content', role: 'content', order: 3, isRequired: true },
      { type: 'stats', role: 'content', order: 4, isRequired: false },
      { type: 'infographic', role: 'content', order: 5, isRequired: false },
      { type: 'journey', role: 'content', order: 6, isRequired: false },
      { type: 'conclusion', role: 'closer', order: 7, isRequired: true },
      { type: 'cta', role: 'closer', order: 8, isRequired: false },
    ],
    capabilities: ['PNG export', 'SVG overlay', 'Print-ready', 'PDF export', 'PPTX export'],
    providers: ['modelslab', 'flux-pro', 'dall-e-3', 'gemini-image', 'stability'],
    renderSettings: {
      resolution: { width: 1920, height: 1080 },
      format: 'png',
      quality: 'high'
    }
  },
  
  // 2D Animated Templates
  {
    id: '2d-animated-motion',
    name: 'Motion Graphics Deck',
    description: 'Animated slides with entry effects and transitions',
    outputType: '2d-animated',
    slideTypes: ['title', 'content', 'section', 'infographic', 'journey', 'stats', 'conclusion', 'cta', 'chapter-cover'],
    defaultStructure: [
      { type: 'title', role: 'opener', order: 1, isRequired: true, animationType: 'kinetic-typography' },
      { type: 'section', role: 'chapter', order: 2, isRequired: false, animationType: 'morph' },
      { type: 'content', role: 'content', order: 3, isRequired: true, animationType: 'fade-in' },
      { type: 'stats', role: 'content', order: 4, isRequired: false, animationType: 'bounce' },
      { type: 'infographic', role: 'content', order: 5, isRequired: false, animationType: 'parallax' },
      { type: 'conclusion', role: 'closer', order: 6, isRequired: true, animationType: 'zoom' },
    ],
    capabilities: ['Entry animations', 'Hover effects', 'Scroll triggers', 'Micro-interactions', 'Lottie export'],
    providers: ['modelslab', 'flux-pro', 'framer-motion', 'lottie'],
    renderSettings: {
      resolution: { width: 1920, height: 1080 },
      format: 'html',
      quality: 'high',
      fps: 60
    }
  },
  
  // 3D Scene Templates
  {
    id: '3d-scene-showcase',
    name: '3D Scene Showcase',
    description: 'Three.js rendered 3D scenes with camera controls',
    outputType: '3d-scene',
    slideTypes: ['title', '3d-scene', '3d-model', 'section', 'content', 'conclusion', 'chapter-cover'],
    defaultStructure: [
      { type: 'title', role: 'opener', order: 1, isRequired: true, threeD: { sceneType: '3d-static', cameraPath: 'fixed', lighting: 'studio' } },
      { type: '3d-scene', role: 'content', order: 2, isRequired: true, threeD: { sceneType: '3d-static', cameraPath: 'orbit', lighting: 'natural' } },
      { type: '3d-model', role: 'content', order: 3, isRequired: false, threeD: { sceneType: '3d-static', cameraPath: 'user-controlled', lighting: 'studio' } },
      { type: 'section', role: 'chapter', order: 4, isRequired: false },
      { type: 'conclusion', role: 'closer', order: 5, isRequired: true },
    ],
    capabilities: ['3D models', 'Scene composition', 'Lighting', 'Camera angles', 'WebGL export'],
    providers: ['modelslab-3d', 'three-js', 'replicate-3d'],
    renderSettings: {
      resolution: { width: 1920, height: 1080 },
      format: 'webgl',
      quality: 'high',
      fps: 60
    }
  },
  
  // 3D Animated Templates
  {
    id: '3d-animated-cinematic',
    name: '3D Cinematic Animation',
    description: 'Full 3D animations with physics and particle effects',
    outputType: '3d-animated',
    slideTypes: ['title', '3d-scene', '3d-model', '3d-animated', 'section', 'conclusion', 'chapter-cover'],
    defaultStructure: [
      { type: 'title', role: 'opener', order: 1, isRequired: true, threeD: { sceneType: '3d-animated', cameraPath: 'flythrough', lighting: 'dramatic', particleEffects: true } },
      { type: '3d-animated', role: 'content', order: 2, isRequired: true, threeD: { sceneType: '3d-animated', cameraPath: 'orbit', lighting: 'natural', physics: true } },
      { type: '3d-scene', role: 'content', order: 3, isRequired: false, threeD: { sceneType: '3d-animated', cameraPath: 'flythrough', lighting: 'neon' } },
      { type: 'section', role: 'chapter', order: 4, isRequired: false },
      { type: 'conclusion', role: 'closer', order: 5, isRequired: true, threeD: { sceneType: '3d-animated', cameraPath: 'orbit', lighting: 'dramatic' } },
    ],
    capabilities: ['Physics simulation', 'Particle effects', '3D transitions', 'Flow animations', 'GLTF export'],
    providers: ['modelslab-3d', 'three-js', 'replicate-3d'],
    renderSettings: {
      resolution: { width: 1920, height: 1080 },
      format: 'webgl',
      quality: 'ultra',
      fps: 60,
      loop: true
    }
  },
  
  // Video Intro Templates
  {
    id: 'video-intro-short',
    name: 'Video Intro',
    description: 'Short 5-10s video intros and outros',
    outputType: 'video-intro',
    slideTypes: ['video-intro', 'title', 'video-outro', 'chapter-cover'],
    defaultStructure: [
      { type: 'video-intro', role: 'opener', order: 1, isRequired: true, duration: 5 },
      { type: 'title', role: 'content', order: 2, isRequired: true, duration: 3 },
      { type: 'video-outro', role: 'closer', order: 3, isRequired: false, duration: 2 },
    ],
    capabilities: ['Motion graphics', 'Logo reveals', 'Cinematic effects', 'AI-generated scenes'],
    providers: ['modelslab-video', 'replicate-video', 'runway', 'pika-labs'],
    renderSettings: {
      resolution: { width: 1920, height: 1080 },
      format: 'mp4',
      quality: 'high',
      fps: 30,
      duration: 10,
      audioEnabled: true
    }
  },
  
  // Full Video Templates
  {
    id: 'video-full-presentation',
    name: 'Full Video Presentation',
    description: 'Complete video with voiceover, music, and transitions',
    outputType: 'video-full',
    slideTypes: ['video-intro', 'video-scene', 'title', 'content', 'stats', 'infographic', 'journey', 'conclusion', 'video-outro', 'chapter-cover'],
    defaultStructure: [
      { type: 'video-intro', role: 'opener', order: 1, isRequired: true, duration: 5 },
      { type: 'title', role: 'opener', order: 2, isRequired: true, duration: 8 },
      { type: 'chapter-cover', role: 'chapter', order: 3, isRequired: false, duration: 3 },
      { type: 'video-scene', role: 'content', order: 4, isRequired: true, duration: 15 },
      { type: 'content', role: 'content', order: 5, isRequired: true, duration: 20 },
      { type: 'stats', role: 'content', order: 6, isRequired: false, duration: 10 },
      { type: 'infographic', role: 'content', order: 7, isRequired: false, duration: 12 },
      { type: 'journey', role: 'content', order: 8, isRequired: false, duration: 15 },
      { type: 'conclusion', role: 'closer', order: 9, isRequired: true, duration: 10 },
      { type: 'video-outro', role: 'closer', order: 10, isRequired: false, duration: 5 },
    ],
    capabilities: ['Full narration', 'Scene transitions', 'Background music', 'Multi-language', 'Voice cloning'],
    providers: ['modelslab-video', 'replicate-video', 'elevenlabs-tts', 'azure-tts'],
    renderSettings: {
      resolution: { width: 1920, height: 1080 },
      format: 'mp4',
      quality: 'high',
      fps: 30,
      duration: 120,
      audioEnabled: true
    }
  },
  
  // Interactive Templates
  {
    id: 'interactive-web',
    name: 'Interactive Web Presentation',
    description: 'Web-based interactive presentations with user controls',
    outputType: 'interactive',
    slideTypes: ['title', 'interactive', 'content', 'section', 'stats', 'infographic', 'journey', 'conclusion', 'cta', 'chapter-cover'],
    defaultStructure: [
      { type: 'title', role: 'opener', order: 1, isRequired: true, interactiveType: 'click-reveal' },
      { type: 'section', role: 'chapter', order: 2, isRequired: false, interactiveType: 'scroll-trigger' },
      { type: 'interactive', role: 'content', order: 3, isRequired: true, interactiveType: 'drag-explore' },
      { type: 'content', role: 'content', order: 4, isRequired: true, interactiveType: 'hover-expand' },
      { type: 'stats', role: 'content', order: 5, isRequired: false, interactiveType: 'data-filter' },
      { type: 'journey', role: 'content', order: 6, isRequired: false, interactiveType: 'timeline-scrub' },
      { type: 'conclusion', role: 'closer', order: 7, isRequired: true, interactiveType: 'click-reveal' },
      { type: 'cta', role: 'closer', order: 8, isRequired: false, interactiveType: 'form-input' },
    ],
    capabilities: ['Clickable elements', 'Form inputs', 'Data visualization', 'Real-time updates', 'Quiz integration'],
    providers: ['react-components', 'three-js', 'framer-motion'],
    renderSettings: {
      resolution: { width: 1920, height: 1080 },
      format: 'html',
      quality: 'high'
    }
  },
  
  // Mixed Output Templates
  {
    id: 'mixed-adaptive',
    name: 'Adaptive Mixed Output',
    description: 'Combination of static, animated, and video elements',
    outputType: 'mixed',
    slideTypes: ['title', 'content', 'section', 'infographic', 'journey', 'stats', 'video-scene', '3d-scene', 'interactive', 'conclusion', 'cta', 'chapter-cover'],
    defaultStructure: [
      { type: 'video-intro', role: 'opener', order: 1, isRequired: false, duration: 5 },
      { type: 'title', role: 'opener', order: 2, isRequired: true },
      { type: 'chapter-cover', role: 'chapter', order: 3, isRequired: false },
      { type: 'content', role: 'content', order: 4, isRequired: true },
      { type: '3d-scene', role: 'content', order: 5, isRequired: false, threeD: { sceneType: '3d-static', cameraPath: 'orbit', lighting: 'studio' } },
      { type: 'interactive', role: 'content', order: 6, isRequired: false, interactiveType: 'hover-expand' },
      { type: 'video-scene', role: 'content', order: 7, isRequired: false, duration: 15 },
      { type: 'stats', role: 'content', order: 8, isRequired: false, animationType: 'bounce' },
      { type: 'conclusion', role: 'closer', order: 9, isRequired: true },
    ],
    capabilities: ['Per-slide customization', 'Best-of-breed selection', 'Adaptive quality', 'Multi-format export'],
    providers: ['all'],
    renderSettings: {
      resolution: { width: 1920, height: 1080 },
      format: 'mixed',
      quality: 'high'
    }
  }
];

/**
 * Get template for a specific output type
 */
export function getOutputSlideTemplate(outputType: OutputType): OutputSlideTemplate {
  return OUTPUT_SLIDE_TEMPLATES.find(t => t.outputType === outputType) || OUTPUT_SLIDE_TEMPLATES[0];
}

/**
 * Get available slide types for an output type
 */
export function getAvailableSlideTypes(outputType: OutputType): SlideType[] {
  const template = getOutputSlideTemplate(outputType);
  return template.slideTypes;
}

/**
 * Get default slide structure for an output type
 */
export function getDefaultSlideStructure(outputType: OutputType, slideCount: number): SlideStructure[] {
  const template = getOutputSlideTemplate(outputType);
  const structure = [...template.defaultStructure];
  
  // Adjust structure based on requested slide count
  const requiredSlides = structure.filter(s => s.isRequired);
  const optionalSlides = structure.filter(s => !s.isRequired);
  
  // If we need more slides, duplicate content slides
  while (structure.length < slideCount && optionalSlides.length > 0) {
    const contentSlides = optionalSlides.filter(s => s.role === 'content');
    if (contentSlides.length > 0) {
      const toAdd = contentSlides[structure.length % contentSlides.length];
      structure.splice(structure.length - 2, 0, { ...toAdd, order: structure.length });
    } else {
      break;
    }
  }
  
  // Re-number orders
  return structure.slice(0, slideCount).map((s, i) => ({ ...s, order: i + 1 }));
}

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
  
  // Output-type-specific properties
  outputType?: OutputType;
  
  // Animation (2D animated / 3D animated)
  animation?: {
    type: AnimationType;
    duration?: number;
    delay?: number;
    easing?: string;
  };
  
  // 3D scene configuration
  threeD?: {
    config: ThreeDConfig;
    modelUrl?: string;
    sceneData?: Record<string, any>;
    cameraPosition?: { x: number; y: number; z: number };
  };
  
  // Video scene configuration
  video?: {
    sceneUrl?: string;
    duration: number;
    transitions?: { in: string; out: string };
    voiceover?: {
      scriptText: string;
      audioUrl?: string;
      provider: string;
      voiceId: string;
    };
    backgroundMusic?: {
      trackUrl?: string;
      volume: number;
    };
  };
  
  // Interactive configuration
  interactive?: {
    type: InteractiveType;
    actions: InteractiveAction[];
    dataBindings?: DataBinding[];
  };
  
  // Chapter/section grouping
  chapter?: {
    chapterId: string;
    chapterTitle: string;
    chapterNumber: number;
  };
}

// Interactive action definition
export interface InteractiveAction {
  id: string;
  trigger: 'click' | 'hover' | 'scroll' | 'load' | 'timer';
  action: 'reveal' | 'navigate' | 'animate' | 'filter' | 'submit' | 'play';
  targetElementId?: string;
  config?: Record<string, any>;
}

// Data binding for interactive elements
export interface DataBinding {
  elementId: string;
  dataSource: string;
  dataField: string;
  transformFn?: string;
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
  
  // Output type configuration
  outputType: OutputType;
  outputTemplate?: OutputSlideTemplate;
  renderSettings?: OutputRenderSettings;
  
  // Chapter structure (for organized output)
  chapters?: PresentationChapter[];
  
  // Source info
  sourceType: 'document' | 'image' | 'text' | 'prompt' | 'url';
  sourceContent?: string;
  
  // Generation settings
  length: 'short' | 'standard' | 'long';
  outputFormat: 'pptx' | 'social' | 'infographic' | 'whitepaper' | 'journey-map' | 'video' | 'interactive' | '3d';
  imageStyle?: string;
  imageModel?: string;
  
  // Export settings
  preferredExportFormats?: ExportFormat[];
  
  // Video-specific settings
  voiceover?: {
    enabled: boolean;
    provider: string;
    voiceId: string;
    language: string;
  };
  backgroundMusic?: {
    enabled: boolean;
    trackId?: string;
    volume: number;
  };
  
  // Stats
  imagesGenerated: number;
  slidesAccepted: number;
  slidesSkipped: number;
  videoDuration?: number;
  audioGenerated?: boolean;
}

/**
 * Chapter structure for organized presentations
 */
export interface PresentationChapter {
  id: string;
  number: number;
  title: string;
  description?: string;
  slideIds: string[];
  duration?: number;           // For video output
  coverSlideId?: string;       // Reference to chapter cover slide
  theme?: Partial<PresentationTheme>;
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
