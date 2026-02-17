/**
 * Universal Adaptive Hybrid Editor - Type Definitions
 * Supports 100+ pipelines with seamless mode switching
 */

// Global tier level type (matches globalTierService)
export type GlobalTierLevel = 'standard' | 'advanced' | 'premium';

// ============================================================================
// LAYER 0: CONTEXT TYPES
// ============================================================================

export interface BrandKit {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fonts: {
    heading: string;
    body: string;
    accent?: string;
  };
  logo?: {
    light: string;
    dark: string;
  };
  voiceProfile?: {
    tone: 'professional' | 'casual' | 'educational' | 'inspirational';
    preferredVoice?: string;
    pace: 'slow' | 'normal' | 'fast';
  };
  templates?: string[];
}

export interface ProjectHistory {
  id: string;
  name: string;
  type: OutputType;
  createdAt: string;
  lastEditedAt: string;
  thumbnail?: string;
  tags?: string[];
  collaborators?: string[];
}

export interface UserPreferences {
  defaultMode: EditorMode;
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  showPipelineSteps: boolean;
  qualityPreset: 'speed' | 'balanced' | 'quality';
  defaultTier: GlobalTierLevel;
  preferredProviders?: Record<string, string>;
  shortcuts?: Record<string, string>;
}

export interface TeamStyle {
  id: string;
  name: string;
  brandKit: BrandKit;
  templates: PipelineTemplate[];
  guidelines?: string;
}

export interface EditorContext {
  brandKit?: BrandKit;
  projectHistory: ProjectHistory[];
  userPreferences: UserPreferences;
  teamStyle?: TeamStyle;
  currentProject?: ActiveProject;
}

// ============================================================================
// LAYER 1: UNIVERSAL INPUT TYPES
// ============================================================================

export type InputSource = 
  | 'file-drop'
  | 'url-import'
  | 'screen-capture'
  | 'voice-input'
  | 'api-webhook'
  | 'camera-capture'
  | 'clipboard-paste'
  | 'template-select';

export type DetectedInputType = 
  | 'document'     // PDF, DOCX, PPTX
  | 'image'        // JPG, PNG, WEBP
  | 'video'        // MP4, MOV, WEBM
  | 'audio'        // MP3, WAV, M4A
  | 'url'          // Web pages, YouTube, etc.
  | 'presentation' // Google Slides, Canva
  | 'data'         // CSV, JSON, Excel
  | 'text'         // Plain text, Markdown
  | 'screen'       // Screen recording
  | 'mixed';       // Multiple types

export interface UniversalInput {
  id: string;
  source: InputSource;
  detectedType: DetectedInputType;
  file?: File;
  url?: string;
  blob?: Blob;
  text?: string;
  metadata: {
    name: string;
    size?: number;
    mimeType?: string;
    duration?: number; // For media files
    pageCount?: number; // For documents
    dimensions?: { width: number; height: number };
    extractedContent?: string;
  };
  createdAt: string;
}

export interface UserIntent {
  primaryGoal: string;           // Natural language goal
  suggestedOutputs: OutputType[];
  suggestedPipelines: PipelineTemplate[];
  confidence: number;            // 0-100
  clarificationNeeded?: string[];
}

export interface AIRouterResult {
  input: UniversalInput;
  intent: UserIntent;
  recommendedPipeline: PipelineTemplate;
  alternativePipelines: PipelineTemplate[];
  estimatedTime: number;         // minutes
  estimatedCredits: number;
  qualityScore: number;          // 0-100
}

// ============================================================================
// LAYER 2: SMART PIPELINE TYPES
// ============================================================================

export type PipelineMode = 'auto' | 'custom';

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  type: 
    | 'input-processing'
    | 'content-extraction'
    | 'ai-generation'
    | 'transformation'
    | 'enhancement'
    | 'rendering'
    | 'export'
    | 'quality-check';
  provider?: string;
  model?: string;
  estimatedTime: number;         // seconds
  estimatedCredits: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress?: number;             // 0-100
  error?: string;
  isEditable: boolean;
  isOptional: boolean;
  dependencies?: string[];       // Stage IDs
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: PipelineCategory;
  inputTypes: DetectedInputType[];
  outputTypes: OutputType[];
  stages: PipelineStage[];
  estimatedTotalTime: number;    // minutes
  estimatedTotalCredits: number;
  qualityLevel: 'standard' | 'advanced' | 'premium';
  popularity: number;            // Usage count
  thumbnail?: string;
  tags?: string[];
}

export type PipelineCategory = 
  | 'presentation'
  | 'video-production'
  | 'repurposing'
  | 'training'
  | 'marketing'
  | 'social-media'
  | 'sales'
  | 'localization'
  | 'documentation'
  | 'data-visualization'
  | 'interactive'
  | 'immersive'
  | 'custom';

export interface ActivePipeline {
  template: PipelineTemplate;
  mode: PipelineMode;
  stages: PipelineStage[];
  currentStageIndex: number;
  overallProgress: number;       // 0-100
  status: 'configuring' | 'running' | 'paused' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  creditsBurned: number;
}

// ============================================================================
// LAYER 3: ADAPTIVE EDITOR TYPES
// ============================================================================

export type EditorMode = 'canvas' | 'timeline' | 'document' | 'hybrid';

export type OutputType = 
  // Documents
  | 'pdf' | 'docx' | 'pptx' | 'markdown' | 'html'
  // Static Visual
  | 'image' | 'infographic' | 'poster' | 'social-post'
  // Animated
  | 'gif' | 'animated-svg' | 'lottie'
  // Video
  | 'video-standard' | 'video-4k' | 'video-vertical' | 'video-shorts'
  // Audio
  | 'podcast' | 'audiobook' | 'voiceover'
  // Interactive
  | 'interactive-html' | 'web-app' | 'scorm'
  // Immersive
  | 'vr-experience' | 'ar-overlay' | '3d-scene'
  // Data
  | 'dashboard' | 'report' | 'chart-pack';

export interface UniversalElement {
  id: string;
  type: ElementType;
  content: ElementContent;
  style: ElementStyle;
  position: ElementPosition;
  animation?: ElementAnimation;
  metadata: ElementMetadata;
  isLocked: boolean;
  isVisible: boolean;
  groupId?: string;
}

export type ElementType = 
  | 'text' | 'heading' | 'paragraph' | 'bullet-list'
  | 'image' | 'video' | 'audio' | 'svg'
  | 'shape' | 'line' | 'arrow'
  | 'chart' | 'table' | 'data-visual'
  | 'avatar' | '3d-object' | 'ar-marker'
  | 'transition' | 'effect'
  | 'container' | 'group' | 'slide' | 'scene';

export interface ElementContent {
  type: 'text' | 'media' | 'data' | 'component' | 'container';
  value: string | object;
  source?: string;
  alt?: string;
  transcript?: string;
}

export interface ElementStyle {
  // Common
  opacity: number;
  zIndex: number;
  
  // Typography
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  
  // Box model
  width?: number | string;
  height?: number | string;
  padding?: string;
  margin?: string;
  borderRadius?: number;
  
  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  
  // Effects
  boxShadow?: string;
  filter?: string;
  backdropFilter?: string;
  
  // Custom
  custom?: Record<string, unknown>;
}

export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scale?: number;
  anchor?: { x: number; y: number };
}

export interface ElementAnimation {
  type: 'entrance' | 'exit' | 'emphasis' | 'continuous';
  effect: string;
  duration: number;
  delay: number;
  easing: string;
  trigger: 'auto' | 'click' | 'hover' | 'scroll';
  keyframes?: object[];
}

export interface ElementMetadata {
  createdAt: string;
  modifiedAt: string;
  generatedBy?: {
    model: string;
    provider: string;
    prompt?: string;
    context?: Record<string, unknown>;
  };
  version: number;
  tags?: string[];
  notes?: string;
}

export interface EditorViewport {
  zoom: number;
  panX: number;
  panY: number;
  mode: EditorMode;
  showGrid: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface EditorSelection {
  elementIds: string[];
  groupId?: string;
  bounds?: { x: number; y: number; width: number; height: number };
}

// ============================================================================
// LAYER 4: UNIFIED ACTIONS TYPES
// ============================================================================

export interface PreviewConfig {
  quality: 'draft' | 'preview' | 'full';
  autoRefresh: boolean;
  showSafeZones: boolean;
  deviceFrame?: 'none' | 'desktop' | 'tablet' | 'mobile';
  aspectRatio?: string;
}

export interface InspectorState {
  isOpen: boolean;
  activeTab: 'properties' | 'style' | 'animation' | 'data' | 'ai';
  selectedElement?: UniversalElement;
}

export interface CreditDashboard {
  balance: number;
  estimatedCost: number;
  breakdown: { stage: string; credits: number }[];
  optimizationSuggestions: string[];
}

export interface PublishConfig {
  platforms: PublishPlatform[];
  schedule?: {
    type: 'immediate' | 'scheduled' | 'recurring';
    datetime?: string;
    timezone?: string;
    frequency?: string;
  };
  variants?: PublishVariant[];
  webhooks?: string[];
}

export interface PublishPlatform {
  id: string;
  name: string;
  icon: string;
  isConnected: boolean;
  config?: Record<string, unknown>;
  status?: 'pending' | 'publishing' | 'published' | 'failed';
}

export interface PublishVariant {
  id: string;
  name: string;
  format: OutputType;
  dimensions?: { width: number; height: number };
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  modifications?: Record<string, unknown>;
}

// ============================================================================
// LAYER 5: OUTPUT INTELLIGENCE TYPES
// ============================================================================

export interface AnalyticsData {
  views: number;
  engagement: number;
  shares: number;
  avgWatchTime?: number;
  completionRate?: number;
  conversionRate?: number;
  byPlatform: Record<string, { views: number; engagement: number }>;
  timeline: { date: string; views: number; engagement: number }[];
}

export interface ABTest {
  id: string;
  name: string;
  variants: ABVariant[];
  status: 'draft' | 'running' | 'completed';
  startedAt?: string;
  endedAt?: string;
  winner?: string;
}

export interface ABVariant {
  id: string;
  name: string;
  elementChanges: Record<string, unknown>;
  trafficPercent: number;
  metrics: {
    views: number;
    engagement: number;
    conversion: number;
  };
}

export interface ImprovementSuggestion {
  id: string;
  type: 'content' | 'visual' | 'timing' | 'accessibility' | 'seo' | 'engagement';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  elementIds?: string[];
}

export interface RepurposeOption {
  id: string;
  name: string;
  targetFormat: OutputType;
  targetPlatform?: string;
  estimatedTime: number;
  estimatedCredits: number;
  requiredChanges: string[];
}

// ============================================================================
// ACTIVE PROJECT STATE
// ============================================================================

export interface ActiveProject {
  id: string;
  name: string;
  description?: string;
  
  // Layer 0: Context
  context: EditorContext;
  
  // Layer 1: Input
  inputs: UniversalInput[];
  
  // Layer 2: Pipeline
  pipeline?: ActivePipeline;
  
  // Layer 3: Editor
  mode: EditorMode;
  elements: UniversalElement[];
  slides?: SlideContainer[];
  timeline?: TimelineTrack[];
  viewport: EditorViewport;
  selection: EditorSelection;
  
  // Layer 4: Actions
  preview: PreviewConfig;
  inspector: InspectorState;
  credits: CreditDashboard;
  publishConfig?: PublishConfig;
  
  // Layer 5: Intelligence
  analytics?: AnalyticsData;
  abTests?: ABTest[];
  suggestions?: ImprovementSuggestion[];
  repurposeOptions?: RepurposeOption[];
  
  // Meta
  createdAt: string;
  savedAt: string;
  version: number;
  collaborators?: Collaborator[];
}

export interface SlideContainer {
  id: string;
  index: number;
  name?: string;
  elements: string[]; // Element IDs
  duration?: number;
  transition?: ElementAnimation;
  notes?: string;
  thumbnail?: string;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'overlay' | 'effects';
  clips: TimelineClip[];
  isMuted?: boolean;
  isLocked?: boolean;
  volume?: number;
}

export interface TimelineClip {
  id: string;
  elementId: string;
  trackId: string;
  startTime: number;      // seconds
  endTime: number;        // seconds
  trimStart?: number;     // seconds from original start
  trimEnd?: number;       // seconds from original end
  speed?: number;         // playback speed multiplier
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  cursor?: { x: number; y: number };
  activeElement?: string;
  lastActive: string;
}

// ============================================================================
// EDITOR ACTIONS
// ============================================================================

export type EditorAction = 
  | { type: 'SET_MODE'; payload: EditorMode }
  | { type: 'ADD_INPUT'; payload: UniversalInput }
  | { type: 'SET_PIPELINE'; payload: PipelineTemplate }
  | { type: 'UPDATE_PIPELINE_STAGE'; payload: { stageId: string; updates: Partial<PipelineStage> } }
  | { type: 'ADD_ELEMENT'; payload: UniversalElement }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<UniversalElement> } }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'SELECT_ELEMENTS'; payload: string[] }
  | { type: 'UPDATE_VIEWPORT'; payload: Partial<EditorViewport> }
  | { type: 'SET_PREVIEW_CONFIG'; payload: Partial<PreviewConfig> }
  | { type: 'UPDATE_INSPECTOR'; payload: Partial<InspectorState> }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE' }
  | { type: 'PUBLISH'; payload: PublishConfig };
