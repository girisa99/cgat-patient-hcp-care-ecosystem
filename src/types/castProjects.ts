/**
 * Cast Production Types
 *
 * Database-backed types for the Cast production workflow:
 * cast_projects, cast_messaging_content, cast_scene_scripts,
 * cast_generation_jobs, and show_cast_links.
 *
 * These align with the DB schema in migration 20260215143000.
 */

// ============================================================================
// ENUMS (matching database enums)
// ============================================================================

export type CastProjectStatus =
  | 'draft'
  | 'messaging_ready'
  | 'scripted'
  | 'generating'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived';

export type CastJobStatus =
  | 'queued'
  | 'processing'
  | 'rendering'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type CastApprovalStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

export type CastJobType =
  | 'video'
  | 'tts'
  | 'avatar'
  | 'animation'
  | '3d'
  | 'image'
  | 'thumbnail';

export type ShowCastLinkType =
  | 'publish'
  | 'promo'
  | 'trailer'
  | 'clip'
  | 'recording';

// ============================================================================
// CORE TYPES
// ============================================================================

export interface CastProject {
  id: string;
  user_id: string;
  team_id: string | null;
  title: string;
  description: string | null;
  slug: string | null;
  blueprint_id: string | null;
  style_intent: string;
  selected_styles: string[];
  selected_capabilities: string[];
  target_regions: string[];
  selected_dialects: string[];
  intent_value: string | null;
  product_context: string | null;
  status: CastProjectStatus;
  current_stage: string;
  completed_stages: string[];
  estimated_tokens: number;
  actual_tokens_used: number;
  quality: 'preview' | 'production' | 'cinematic';
  full_production_mode: boolean;
  production_config: Record<string, unknown>;
  final_video_url: string | null;
  thumbnail_url: string | null;
  total_duration_seconds: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CastMessagingContent {
  id: string;
  project_id: string;
  product_id: string | null;
  language: string;
  hook: string | null;
  sub_hook: string | null;
  value_proposition: string | null;
  headline: string | null;
  pain_points: string[];
  benefits: string[];
  differentiators: string[];
  cta: string | null;
  cta_secondary: string | null;
  opening_line: string | null;
  closing_line: string | null;
  transition_phrases: string[];
  short_script: string | null;
  medium_script: string | null;
  long_script: string | null;
  approval_status: CastApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  version: number;
  parent_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CastSceneScript {
  id: string;
  project_id: string;
  scene_id: string | null;
  scene_key: string;
  title: string;
  order_index: number;
  script_text: string;
  edited_text: string | null;
  source_type: 'messaging' | 'template' | 'custom';
  duration_seconds: number;
  min_duration: number;
  max_duration: number;
  tts_provider: string;
  tts_voice_id: string | null;
  tts_speed: number;
  tts_pitch: number;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  approval_status: CastApprovalStatus;
  created_at: string;
  updated_at: string;
}

export interface CastGenerationJob {
  id: string;
  project_id: string;
  job_type: CastJobType;
  language: string;
  product_id: string | null;
  tier: string | null;
  quality: string;
  style_intent: string | null;
  provider: string | null;
  provider_job_id: string | null;
  fallback_provider: string | null;
  status: CastJobStatus;
  progress_percent: number;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  output_url: string | null;
  output_thumbnail_url: string | null;
  output_duration_seconds: number | null;
  output_file_size_bytes: number | null;
  estimated_tokens: number;
  actual_tokens_used: number;
  estimated_cost_usd: number;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
  input_config: Record<string, unknown>;
  output_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ShowCastLink {
  id: string;
  show_id: string;
  cast_project_id: string;
  link_type: ShowCastLinkType;
  linked_at_stage: string | null;
  publish_platforms: string[];
  scheduled_publish_at: string | null;
  published_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// EXTENDED TYPES (with relations)
// ============================================================================

export interface CastProjectWithRelations extends CastProject {
  messaging?: CastMessagingContent[];
  scene_scripts?: CastSceneScript[];
  generation_jobs?: CastGenerationJob[];
  show_links?: ShowCastLink[];
}

// ============================================================================
// INPUT TYPES (for create/update operations)
// ============================================================================

export interface CreateCastProjectInput {
  title: string;
  blueprint_id?: string;
  style_intent?: string;
  intent_value?: string;
  product_context?: string;
  team_id?: string;
  target_regions?: string[];
  selected_dialects?: string[];
}

export interface UpdateCastProjectInput {
  title?: string;
  description?: string;
  blueprint_id?: string;
  style_intent?: string;
  selected_styles?: string[];
  selected_capabilities?: string[];
  target_regions?: string[];
  selected_dialects?: string[];
  intent_value?: string;
  product_context?: string;
  status?: CastProjectStatus;
  current_stage?: string;
  completed_stages?: string[];
  estimated_tokens?: number;
  actual_tokens_used?: number;
  quality?: 'preview' | 'production' | 'cinematic';
  full_production_mode?: boolean;
  production_config?: Record<string, unknown>;
  final_video_url?: string;
  thumbnail_url?: string;
  total_duration_seconds?: number;
  metadata?: Record<string, unknown>;
}

export interface CastProjectJobStats {
  total: number;
  queued: number;
  processing: number;
  rendering: number;
  completed: number;
  failed: number;
  cancelled: number;
  totalTokens: number;
  totalCostUsd: number;
  avgDurationSeconds: number;
}
