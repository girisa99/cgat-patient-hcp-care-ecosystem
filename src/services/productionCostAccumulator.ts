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
// ============================================================================

const COST_PER_1K_TOKENS: Record<string, number> = {
  openai: 0.03,
  anthropic: 0.025,
  google: 0.02,
  elevenlabs: 0.05,
  azure: 0.03,
  alibaba: 0.015,
  default: 0.025,
};

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
  const { error: jobError } = await (supabase as any)
    .from('cast_generation_jobs')
    .update({
      status: 'completed',
      actual_tokens_used: input.actualTokens,
      estimated_cost_usd: tokensToCost(input.actualTokens),
      output_url: input.outputUrl || null,
      output_duration_seconds: input.outputDurationSeconds || null,
      output_file_size_bytes: input.outputFileSizeBytes || null,
      output_metadata: (input.outputMetadata || {}) as any,
      completed_at: new Date().toISOString(),
      progress_percent: 100,
    })
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
    .select('*')
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
