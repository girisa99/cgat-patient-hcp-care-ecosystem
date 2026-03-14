/**
 * Production Cost Accumulator
 *
 * Tracks per-step token/cost usage for any Cast production.
 * Updates both:
 *   1. cast_generation_jobs — per-step granular records
 *   2. cast_projects.actual_tokens_used — project-level rollup
 *
 * Reusable for ANY product/episode — not EP04-specific.
 */

import { supabase } from '@/integrations/supabase/client';
import type { CastJobType } from '@/types/castProjects';

// ============================================================================
// TYPES
// ============================================================================

export interface JobCreateInput {
  projectId: string;
  jobType: CastJobType;
  sceneKey?: string;
  lineKey?: string;
  language?: string;
  provider?: string;
  quality?: string;
  estimatedTokens?: number;
  estimatedCostUsd?: number;
  inputConfig?: Record<string, unknown>;
}

export interface JobCompleteInput {
  jobId: string;
  actualTokens: number;
  outputUrl?: string;
  outputDurationSeconds?: number;
  outputFileSizeBytes?: number;
  outputMetadata?: Record<string, unknown>;
  /** Override provider for cost calc (e.g., job started as 'alibaba' but fell back to 'replicate') */
  actualProvider?: string;
}

export interface ProjectCostSummary {
  projectId: string;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalEstimatedTokens: number;
  totalActualTokens: number;
  totalEstimatedCostUsd: number;
  totalActualCostUsd: number;
  byJobType: Record<string, { count: number; tokens: number; costUsd: number }>;
  byScene: Record<string, { count: number; tokens: number; costUsd: number }>;
}

// ============================================================================
// TOKEN → COST CONVERSION (approximate, per-provider)
//
// For TTS providers, "tokens" = characters (EP04Production passes charCount).
// For image/video providers, "tokens" = 1 per generation (EP04 passes 1).
// For LLM providers, "tokens" = actual input+output tokens.
// ============================================================================

const COST_PER_1K_TOKENS: Record<string, number> = {
  // ── LLM text providers (rate per 1K tokens) ──
  openai: 0.01,        // GPT-4o: $0.0025/1K input + $0.01/1K output (blended ~$0.01)
  anthropic: 0.015,    // Claude Sonnet: $0.003/1K in + $0.015/1K out (blended)
  google: 0.005,       // Gemini 2.0 Flash: $0.001/1K in + $0.004/1K out
  deepseek: 0.002,     // DeepSeek-chat: $0.001/1K in + $0.002/1K out

  // ── TTS providers (rate per 1K characters) ──
  elevenlabs: 0.30,    // ElevenLabs Starter: ~$0.30/1K chars ($22/mo for 100K chars)
  azure: 0.016,        // Azure Neural TTS: $16/1M chars = $0.016/1K chars
  'google-tts': 0.016, // Google Cloud TTS Neural2: $16/1M chars
  'alibaba-tts': 0.004,// Alibaba Qwen3-TTS: mostly free tier, ~$0.004/1K

  // ── Image generation (rate per 1 image, passed as 1 "token") ──
  'alibaba-image': 0,  // DashScope wan2.6-t2i: FREE tier
  modelslab: 13,       // ModelsLab FLUX: ~$0.013/image → $13/1K (1 token = 1 image)
  huggingface: 0,      // HuggingFace Pro: free with subscription
  'gemini-image': 2,   // Gemini image gen: ~$0.002/image
  'openai-image': 40,  // DALL-E 3: ~$0.04/image
  'vertex-imagen': 4,  // Vertex Imagen 3: ~$0.004/image

  // ── Video generation (rate per 1 video, passed as 1 "token") ──
  alibaba: 0,          // DashScope video/lipsync: FREE tier
  replicate: 4050,     // Replicate omni-human: $4.05/run → $4050/1K (1 token = 1 run)
  sora2api: 200,       // Sora2API: ~$0.20/video
  'modelslab-video': 50,// ModelsLab AnimateDiff: ~$0.05/video
  'modelslab-lipsync': 80,// ModelsLab lipsync: ~$0.08/run

  // ── Music/SFX (rate per 1 generation) ──
  suno: 50,            // Suno Pro: $0.048/song ($24/mo ÷ 500 songs) → $50/1K

  // ── Assembly/rendering (rate per 1 render job) ──
  'runpod-ffmpeg': 90, // RunPod L4: ~$0.09 per 5-min render ($0.00031/s)
  json2video: 66,      // JSON2Video Growth: $0.066/min → ~$0.66/10min video → $66/1K
  assembly: 10,        // Assembly AI: ~$0.01/min

  default: 0.01,
};

/**
 * Convert token/unit count to USD cost.
 *
 * For TTS: pass charCount as tokens, provider='elevenlabs'|'azure' → per-char cost.
 * For image/video: pass 1 as tokens, provider='modelslab'|'replicate' → per-unit cost.
 * For LLM: pass actual token count, provider='openai'|'anthropic' → per-token cost.
 */
function tokensToCost(tokens: number, provider?: string): number {
  const rate = COST_PER_1K_TOKENS[provider || 'default'] || COST_PER_1K_TOKENS.default;
  return Math.round((tokens / 1000) * rate * 10000) / 10000;
}

// ============================================================================
// CREATE PROJECT
// ============================================================================

export async function createCastProject(input: {
  title: string;
  description?: string;
  estimatedTokens?: number;
  productContext?: string;
  quality?: 'preview' | 'production' | 'cinematic';
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await (supabase as any)
    .from('cast_projects')
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      estimated_tokens: input.estimatedTokens || 0,
      product_context: input.productContext || null,
      quality: input.quality || 'preview',
      metadata: input.metadata || {},
    })
    .select('id')
    .single();

  if (error) {
    console.error('[CostAccumulator] Failed to create project:', error);
    return null;
  }

  return data.id;
}

// ============================================================================
// CREATE JOB (queued)
// ============================================================================

export async function createJob(input: JobCreateInput): Promise<string | null> {
  const { data, error } = await (supabase as any)
    .from('cast_generation_jobs')
    .insert({
      project_id: input.projectId,
      job_type: input.jobType,
      scene_key: input.sceneKey || null,
      line_key: input.lineKey || null,
      language: input.language || 'en',
      provider: input.provider || null,
      quality: input.quality || 'preview',
      estimated_tokens: input.estimatedTokens || 0,
      estimated_cost_usd: input.estimatedCostUsd || 0,
      input_config: input.inputConfig || {},
      status: 'queued',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[CostAccumulator] Failed to create job:', error);
    return null;
  }

  return data.id;
}

// ============================================================================
// START JOB (processing)
// ============================================================================

export async function startJob(jobId: string): Promise<void> {
  await (supabase as any)
    .from('cast_generation_jobs')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', jobId);
}

// ============================================================================
// COMPLETE JOB — updates job + rolls up to project
// ============================================================================

export async function completeJob(input: JobCompleteInput): Promise<void> {
  // If actualProvider is given (e.g., fallback from alibaba→replicate), update provider + recalc cost
  const updateFields: Record<string, unknown> = {
    status: 'completed',
    actual_tokens_used: input.actualTokens,
    output_url: input.outputUrl || null,
    output_duration_seconds: input.outputDurationSeconds || null,
    output_file_size_bytes: input.outputFileSizeBytes || null,
    output_metadata: (input.outputMetadata || {}) as any,
    completed_at: new Date().toISOString(),
    progress_percent: 100,
  };
  if (input.actualProvider) {
    updateFields.provider = input.actualProvider;
  }
  // Cost calc uses actual provider if set, otherwise fetch from existing job record
  const costProvider = input.actualProvider;
  updateFields.estimated_cost_usd = costProvider
    ? tokensToCost(input.actualTokens, costProvider)
    : tokensToCost(input.actualTokens);

  const { error: jobError } = await (supabase as any)
    .from('cast_generation_jobs')
    .update(updateFields)
    .eq('id', input.jobId);

  if (jobError) {
    console.error('[CostAccumulator] Failed to complete job:', jobError);
    return;
  }

  // Get project_id from job to roll up
  const { data: job } = await (supabase as any)
    .from('cast_generation_jobs')
    .select('project_id')
    .eq('id', input.jobId)
    .single();

  if (job?.project_id) {
    await rollupProjectTokens(job.project_id);
  }
}

// ============================================================================
// FAIL JOB
// ============================================================================

export async function failJob(jobId: string, errorMessage: string): Promise<void> {
  await (supabase as any)
    .from('cast_generation_jobs')
    .update({
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

// ============================================================================
// ROLLUP — sum all job tokens into project total
// ============================================================================

async function rollupProjectTokens(projectId: string): Promise<void> {
  const { data: jobs } = await (supabase as any)
    .from('cast_generation_jobs')
    .select('actual_tokens_used')
    .eq('project_id', projectId)
    .eq('status', 'completed');

  const totalTokens = (jobs || []).reduce((sum, j) => sum + (j.actual_tokens_used || 0), 0);

  await (supabase as any)
    .from('cast_projects')
    .update({ actual_tokens_used: totalTokens })
    .eq('id', projectId);
}

// ============================================================================
// GET PROJECT COST SUMMARY
// ============================================================================

export async function getProjectCostSummary(projectId: string): Promise<ProjectCostSummary | null> {
  const { data: jobs, error } = await (supabase as any)
    .from('cast_generation_jobs')
    .select('job_type, status, scene_key, actual_tokens_used, estimated_tokens, estimated_cost_usd, provider')
    .eq('project_id', projectId);

  if (error || !jobs) return null;

  const byJobType: ProjectCostSummary['byJobType'] = {};
  const byScene: ProjectCostSummary['byScene'] = {};

  let totalEstTokens = 0, totalActTokens = 0;
  let totalEstCost = 0, totalActCost = 0;
  let completed = 0, failed = 0;

  for (const job of jobs) {
    // Totals
    totalEstTokens += job.estimated_tokens || 0;
    totalActTokens += job.actual_tokens_used || 0;
    totalEstCost += Number(job.estimated_cost_usd) || 0;
    const actCost = tokensToCost(job.actual_tokens_used || 0, job.provider || undefined);
    totalActCost += actCost;

    if (job.status === 'completed') completed++;
    if (job.status === 'failed') failed++;

    // By job type
    const jt = job.job_type || 'unknown';
    if (!byJobType[jt]) byJobType[jt] = { count: 0, tokens: 0, costUsd: 0 };
    byJobType[jt].count++;
    byJobType[jt].tokens += job.actual_tokens_used || 0;
    byJobType[jt].costUsd += actCost;

    // By scene
    const sk = job.scene_key || 'unknown';
    if (!byScene[sk]) byScene[sk] = { count: 0, tokens: 0, costUsd: 0 };
    byScene[sk].count++;
    byScene[sk].tokens += job.actual_tokens_used || 0;
    byScene[sk].costUsd += actCost;
  }

  return {
    projectId,
    totalJobs: jobs.length,
    completedJobs: completed,
    failedJobs: failed,
    totalEstimatedTokens: totalEstTokens,
    totalActualTokens: totalActTokens,
    totalEstimatedCostUsd: totalEstCost,
    totalActualCostUsd: totalActCost,
    byJobType,
    byScene,
  };
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const productionCostAccumulator = {
  createCastProject,
  createJob,
  startJob,
  completeJob,
  failJob,
  getProjectCostSummary,
};

export default productionCostAccumulator;
