/**
 * Video Assembly Pipeline Types
 * 
 * Comprehensive type definitions for the enhanced video assembly system
 */

import type { GlobalTier } from '../shared/globalTierService';

// ============================================================================
// JOB & QUEUE TYPES
// ============================================================================

export type AssemblyJobStatus = 
  | 'queued'
  | 'preprocessing'
  | 'generating_tts'
  | 'generating_visuals'
  | 'assembling'
  | 'rendering'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AssemblyQuality = '720p' | '1080p' | '4k';

export interface AssemblyJob {
  id: string;
  userId: string;
  status: AssemblyJobStatus;
  priority: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  
  // Configuration
  config: AssemblyConfig;
  
  // Progress tracking
  progress: AssemblyProgress;
  
  // Results
  result?: AssemblyResult;
  error?: AssemblyError;
  
  // Cost tracking
  estimatedCredits: number;
  consumedCredits: number;
}

export interface AssemblyConfig {
  // Content
  language: string;
  languages?: string[]; // For batch multi-language
  chapters: ChapterConfig[];
  
  // Quality & output
  quality: AssemblyQuality;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  outputFormat: 'mp4' | 'webm';
  
  // Style
  videoStyle: string;
  styleConfig?: StyleConfig;
  
  // Production features
  fullProductionMode: boolean;
  productionConfig?: ProductionConfig;
  
  // Messaging integration
  approvedMessaging?: ApprovedMessaging;
  chapterMessaging?: Record<string, ChapterMessaging>;
  
  // Options
  skipExistingTTS: boolean;
  unifiedAudio: boolean;
  generatePreview: boolean;
  
  // Tier gating
  userTier: GlobalTier;
}

export interface ChapterConfig {
  id: string;
  product: string;
  duration: number;
  color: string;
  visualType: string;
  customScript?: string;
  customVisuals?: string[];
}

export interface StyleConfig {
  videoProvider?: string;
  avatarProvider?: string;
  animationProvider?: string;
  ttsStyle?: string;
  visualEffect?: string;
  scriptTone?: string;
  pacing?: string;
  toneModifier?: {
    hookIntensity?: number;
    emotionalArc?: boolean;
    ctaFrequency?: string;
    humorLevel?: string;
  };
}

export interface ProductionConfig {
  avatar?: {
    enabled: boolean;
    gender: 'male' | 'female';
    placement: 'intro_outro' | 'chapter_intros' | 'throughout';
    size: 'small' | 'medium' | 'large';
  };
  animations?: {
    enabled: boolean;
    style: string;
    intensity: number;
  };
  threeD?: {
    enabled: boolean;
    style: string;
    quality: 'standard' | 'high' | 'premium';
  };
}

export interface ApprovedMessaging {
  headline?: string;
  hook?: string;
  subHook?: string;
  cta?: string;
  ctaSecondary?: string;
  valueProposition?: string;
  painPoints?: string[];
  benefits?: string[];
  differentiators?: string[];
  openingLine?: string;
  closingLine?: string;
  transitionPhrases?: string[];
  shortScript?: string;
  mediumScript?: string;
  longScript?: string;
}

export interface ChapterMessaging {
  hook?: string;
  script?: string;
  cta?: string;
  painPoints?: string[];
  benefits?: string[];
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export interface AssemblyProgress {
  overallPercent: number;
  currentPhase: AssemblyJobStatus;
  currentChapter?: string;
  chaptersCompleted: number;
  chaptersTotal: number;
  
  // Phase-specific progress
  phases: {
    tts: PhaseProgress;
    visuals: PhaseProgress;
    assembly: PhaseProgress;
    rendering: PhaseProgress;
  };
  
  // Timing
  estimatedRemainingSeconds?: number;
  elapsedSeconds: number;
}

export interface PhaseProgress {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  percent: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// ============================================================================
// RESULTS & ERRORS
// ============================================================================

export interface AssemblyResult {
  videoUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  duration: number;
  
  // Per-chapter results
  chapters: ChapterResult[];
  
  // Metadata
  providers: {
    tts: string;
    video: string;
    translation?: string;
    avatar?: string;
    threeD?: string;
  };
  
  // Storage
  storageKey: string;
  expiresAt?: string;
}

export interface ChapterResult {
  chapterId: string;
  product: string;
  success: boolean;
  
  // Assets
  audioUrl?: string;
  visualUrls?: string[];
  avatarUrl?: string;
  threeDUrl?: string;
  
  // Metrics
  duration: number;
  retryCount: number;
  error?: string;
}

export interface AssemblyError {
  code: string;
  message: string;
  phase: AssemblyJobStatus;
  chapterId?: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export interface BatchAssemblyRequest {
  languages: string[];
  baseConfig: Omit<AssemblyConfig, 'language' | 'languages'>;
  priority?: 'low' | 'normal' | 'high';
  maxParallel?: number;
}

export interface BatchAssemblyResult {
  batchId: string;
  jobs: AssemblyJob[];
  totalEstimatedCredits: number;
  status: 'queued' | 'processing' | 'completed' | 'partial_failure';
}

// ============================================================================
// COST ESTIMATION
// ============================================================================

export interface CostEstimate {
  totalCredits: number;
  breakdown: CostBreakdown[];
  tierLimit: number;
  tierRemaining: number;
  canProceed: boolean;
  warnings?: string[];
}

export interface CostBreakdown {
  component: 'tts' | 'video_assembly' | 'avatar' | '3d' | 'transitions' | 'rendering';
  credits: number;
  provider: string;
  quantity: number;
  unitCost: number;
}

// ============================================================================
// QUALITY PRESETS
// ============================================================================

export interface QualityPreset {
  id: AssemblyQuality;
  name: string;
  resolution: string;
  bitrate: string;
  fps: number;
  requiredTier: GlobalTier;
  creditMultiplier: number;
}

export const QUALITY_PRESETS: Record<AssemblyQuality, QualityPreset> = {
  '720p': {
    id: '720p',
    name: 'HD (720p)',
    resolution: '1280x720',
    bitrate: '5Mbps',
    fps: 30,
    requiredTier: 'standard',
    creditMultiplier: 1.0,
  },
  '1080p': {
    id: '1080p',
    name: 'Full HD (1080p)',
    resolution: '1920x1080',
    bitrate: '10Mbps',
    fps: 30,
    requiredTier: 'advanced',
    creditMultiplier: 1.5,
  },
  '4k': {
    id: '4k',
    name: 'Ultra HD (4K)',
    resolution: '3840x2160',
    bitrate: '25Mbps',
    fps: 30,
    requiredTier: 'premium',
    creditMultiplier: 3.0,
  },
};

// ============================================================================
// RETRY & RECOVERY
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // ms
  backoffMultiplier: number;
  fallbackProviders: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 2000,
  backoffMultiplier: 1.5,
  fallbackProviders: ['runpod-ffmpeg', 'replicate', 'modelslab'],
};

// ============================================================================
// REALTIME EVENTS
// ============================================================================

export type AssemblyEventType = 
  | 'job_created'
  | 'job_started'
  | 'progress_update'
  | 'chapter_completed'
  | 'phase_completed'
  | 'job_completed'
  | 'job_failed'
  | 'job_cancelled';

export interface AssemblyEvent {
  type: AssemblyEventType;
  jobId: string;
  timestamp: string;
  data: AssemblyProgress | AssemblyResult | AssemblyError | ChapterResult;
}

// Extended tier type to include internal admin
export type ExtendedTier = GlobalTier | 'internal';
