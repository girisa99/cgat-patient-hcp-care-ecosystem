/**
 * Ralph Wiggum - Automated AI Review System Types
 * DEV-ONLY: Reviews content quality across all Genie Studio modules
 */

// Module identifiers for all Genie Studio areas
export type GenieModule = 
  | 'spark'           // Ideas/brainstorming
  | 'mind'            // Script editor, TTS, Voice
  | 'vibe'            // Mobile, Desktop, Full Suite recording
  | 'guided'          // Guided workflows
  | 'agents'          // Running agents
  | 'ask-genie'       // AI chat interface
  | 'arc'             // Production hub
  | 'dashboard'       // Main dashboard
  // Additional modules
  | 'subscription'    // Subscription plans, payment, upgrade
  | 'voice-generator' // AI Voice/TTS Generator
  | 'templates'       // Script/content templates
  | 'library'         // Media library (audio, video, scripts)
  | 'native-features' // Mobile/native capabilities
  | 'genie-page';     // Main GenieStudio page structure

// Review severity levels
export type ReviewSeverity = 'info' | 'suggestion' | 'warning' | 'critical';

// Review categories
export type ReviewCategory = 
  | 'quality'         // Content quality issues
  | 'consistency'     // Inconsistency between elements
  | 'alignment'       // Misalignment with best practices
  | 'journey'         // Process/journey sequence issues
  | 'performance'     // Performance concerns
  | 'accessibility'   // Accessibility issues
  | 'engagement'      // User engagement concerns
  | 'technical';      // Technical issues

// Individual review finding
export interface ReviewFinding {
  id: string;
  module: GenieModule;
  category: ReviewCategory;
  severity: ReviewSeverity;
  title: string;
  description: string;
  suggestion?: string;
  location?: string;           // Where in the content (e.g., "line 5", "paragraph 2")
  relatedElements?: string[];  // Related content pieces
  timestamp: number;
}

// Module-specific content for review
export interface SparkContent {
  ideas: string[];
  brainstormTopic?: string;
  generatedContent?: string;
}

export interface MindContent {
  scriptContent: string;
  scriptName?: string;
  scriptType?: 'video' | 'audio' | 'podcast' | 'presentation';
  ttsSettings?: {
    voice: string;
    provider: string;
    speed?: number;
  };
  voiceoverUrl?: string;
}

export interface VibeContent {
  mode: 'mobile' | 'desktop' | 'full-suite';
  recordingStatus?: 'idle' | 'recording' | 'paused' | 'completed';
  clips?: Array<{
    id: string;
    duration: number;
    hasAudio: boolean;
  }>;
  timeline?: {
    totalDuration: number;
    clipCount: number;
  };
}

export interface GuidedContent {
  workflowId?: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  pendingActions: string[];
}

export interface AgentsContent {
  activeAgents: Array<{
    id: string;
    name: string;
    status: 'running' | 'paused' | 'error';
    taskType?: string;
  }>;
  conversationCount: number;
}

export interface AskGenieContent {
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  currentQuery?: string;
}

export interface ArcContent {
  productionStatus: 'planning' | 'pre-production' | 'production' | 'post-production' | 'published';
  scheduledShows: number;
  pendingTasks: string[];
  teamMembers: number;
}

// NEW: Subscription/Payment content
export interface SubscriptionContent {
  currentPlan?: string;
  planStatus?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'none';
  availablePlans: Array<{
    id: string;
    name: string;
    price: number;
    features: string[];
  }>;
  paymentMethod?: 'card' | 'bank' | 'none';
  billingCycle?: 'monthly' | 'yearly';
  upgradeIntent?: boolean;
}

// NEW: Voice Generator content
export interface VoiceGeneratorContent {
  scriptText: string;
  selectedVoice?: string;
  selectedProvider?: 'openai' | 'elevenlabs' | 'google';
  voiceSettings?: {
    speed?: number;
    pitch?: number;
    stability?: number;
  };
  generatedAudioUrl?: string;
}

// NEW: Templates content
export interface TemplatesContent {
  selectedTemplate?: string;
  templateCategory?: 'video' | 'audio' | 'podcast' | 'presentation' | 'social';
  customizations: Record<string, any>;
  templateVariables: string[];
}

// NEW: Library content
export interface LibraryContent {
  mediaType: 'all' | 'audio' | 'video' | 'scripts' | 'images';
  itemCount: number;
  recentItems: Array<{
    id: string;
    name: string;
    type: string;
    lastModified: number;
  }>;
  storageUsed?: number;
  organizationMethod?: 'date' | 'type' | 'project';
}

// NEW: Native Features content
export interface NativeFeaturesContent {
  platform: 'web' | 'ios' | 'android' | 'pwa';
  enabledFeatures: string[];
  permissions: {
    camera?: boolean;
    microphone?: boolean;
    notifications?: boolean;
    location?: boolean;
  };
  offlineCapability?: boolean;
}

// NEW: Genie Page content
export interface GeniePageContent {
  activeTab: string;
  visibleSections: string[];
  userFlow: Array<{ action: string; timestamp: number; tab?: string }>;
  loadedComponents: string[];
  performanceMetrics?: {
    loadTime?: number;
    interactionDelay?: number;
  };
}

// Union type for all content types
export type ModuleContent = 
  | { module: 'spark'; content: SparkContent }
  | { module: 'mind'; content: MindContent }
  | { module: 'vibe'; content: VibeContent }
  | { module: 'guided'; content: GuidedContent }
  | { module: 'agents'; content: AgentsContent }
  | { module: 'ask-genie'; content: AskGenieContent }
  | { module: 'arc'; content: ArcContent }
  | { module: 'dashboard'; content: Record<string, unknown> }
  // New module content types
  | { module: 'subscription'; content: SubscriptionContent }
  | { module: 'voice-generator'; content: VoiceGeneratorContent }
  | { module: 'templates'; content: TemplatesContent }
  | { module: 'library'; content: LibraryContent }
  | { module: 'native-features'; content: NativeFeaturesContent }
  | { module: 'genie-page'; content: GeniePageContent };

// Review request
export interface ReviewRequest {
  moduleContent: ModuleContent;
  priority?: 'low' | 'normal' | 'high';
  includeJourneyAnalysis?: boolean;
  compareWith?: ModuleContent[];  // For cross-module consistency checks
}

// Review result
export interface ReviewResult {
  id: string;
  module: GenieModule;
  timestamp: number;
  findings: ReviewFinding[];
  summary: {
    totalIssues: number;
    criticalCount: number;
    warningCount: number;
    suggestionCount: number;
    infoCount: number;
  };
  journeyAnalysis?: JourneyAnalysis;
  processingTimeMs: number;
}

// Journey/process sequence analysis
export interface JourneyAnalysis {
  currentStage: string;
  expectedNextStages: string[];
  potentialBlockers: string[];
  recommendations: string[];
  completionPercentage: number;
  sequenceIssues: Array<{
    step: string;
    issue: string;
    impact: 'low' | 'medium' | 'high';
  }>;
}

// Review queue item
export interface QueuedReview {
  id: string;
  request: ReviewRequest;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  result?: ReviewResult;
  error?: string;
}

// Ralph Wiggum configuration
export interface RalphWiggumConfig {
  enabled: boolean;
  autoReview: boolean;
  debounceMs: number;
  maxQueueSize: number;
  rateLimitPerMinute: number;
  silentMode: boolean;              // Log only, no UI
  enabledModules: GenieModule[];
  severityThreshold: ReviewSeverity; // Only show issues at this level or higher
}

// Default configuration
export const DEFAULT_RALPH_CONFIG: RalphWiggumConfig = {
  enabled: true,
  autoReview: true,
  debounceMs: 2000,
  maxQueueSize: 10,
  rateLimitPerMinute: 10,
  silentMode: false,
  enabledModules: [
    'spark', 'mind', 'vibe', 'guided', 'agents', 'ask-genie', 'arc', 'dashboard',
    'subscription', 'voice-generator', 'templates', 'library', 'native-features', 'genie-page'
  ],
  severityThreshold: 'info'
};

// Hook return type
export interface UseRalphWiggumReturn {
  // State
  isEnabled: boolean;
  isReviewing: boolean;
  currentReview: ReviewResult | null;
  reviewHistory: ReviewResult[];
  queue: QueuedReview[];
  config: RalphWiggumConfig;
  
  // Actions
  triggerReview: (request: ReviewRequest) => Promise<ReviewResult | null>;
  clearReview: () => void;
  updateConfig: (updates: Partial<RalphWiggumConfig>) => void;
  pauseAutoReview: () => void;
  resumeAutoReview: () => void;
  
  // Utilities
  getModuleFindings: (module: GenieModule) => ReviewFinding[];
  getSeverityCount: (severity: ReviewSeverity) => number;
  exportReviewReport: () => string;
}
