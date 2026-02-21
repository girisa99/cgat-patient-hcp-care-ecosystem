/**
 * Production Pipeline Supervisor — Agentic Orchestration
 *
 * Orchestrates multi-agent production: voice → music → video → quality check.
 * Each step is an edge function call. The supervisor manages dependencies,
 * parallel execution, and error recovery.
 *
 * This is the A2A (Agent-to-Agent) coordination layer.
 *
 * Usage:
 *   import { pipelineSupervisor } from '@/services/production/pipelineSupervisor';
 *
 *   const job = await pipelineSupervisor.startProduction({
 *     scriptContent: 'My script...',
 *     voiceProvider: 'elevenlabs',
 *     includeMusic: true,
 *     videoStyle: 'pixar_3d',
 *   });
 *
 *   // Poll for progress
 *   const status = pipelineSupervisor.getJobStatus(job.id);
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TaskStatus = 'queued' | 'running' | 'complete' | 'failed' | 'skipped';
export type JobStatus = 'pending' | 'in_progress' | 'complete' | 'failed' | 'cancelled';

export interface PipelineTask {
  id: string;
  agentName: string;
  edgeFunction: string;
  dependsOn: string[];
  status: TaskStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
}

export interface ProductionJob {
  id: string;
  status: JobStatus;
  tasks: PipelineTask[];
  progress: number;
  createdAt: string;
  completedAt: string | null;
  finalOutput: {
    videoUrl: string | null;
    audioUrl: string | null;
    musicUrl: string | null;
    thumbnailUrl: string | null;
  };
  error: string | null;
}

export interface ProductionInput {
  scriptContent: string;
  scriptId?: string;
  episodeId?: string;

  // Voice config
  voiceProvider?: 'elevenlabs' | 'openai' | 'google' | 'azure' | 'alibaba';
  voiceId?: string;
  language?: string;

  // Music config
  includeMusic?: boolean;
  musicMood?: string;
  musicGenre?: string;

  // Video config
  includeVideo?: boolean;
  videoStyle?: string;
  videoDuration?: number;

  // Quality
  qualityThreshold?: number;
  maxQualityIterations?: number;

  // Callbacks
  onTaskUpdate?: (task: PipelineTask) => void;
  onProgress?: (progress: number) => void;
}

// ─── Job Storage ────────────────────────────────────────────────────────────

const activeJobs = new Map<string, ProductionJob>();

function createTask(
  agentName: string,
  edgeFunction: string,
  dependsOn: string[] = [],
  input: Record<string, unknown> = {}
): PipelineTask {
  return {
    id: `task_${agentName}_${Date.now()}`,
    agentName,
    edgeFunction,
    dependsOn,
    status: 'queued',
    input,
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    durationMs: null,
  };
}

// ─── Service ────────────────────────────────────────────────────────────────

export const pipelineSupervisor = {
  /** Build a production plan (task dependency graph) */
  buildPlan(input: ProductionInput): PipelineTask[] {
    const tasks: PipelineTask[] = [];

    // Task 1: Voice generation (no dependencies)
    const voiceTask = createTask('voice-director', input.voiceProvider === 'elevenlabs'
      ? 'elevenlabs-voice'
      : input.voiceProvider === 'openai' ? 'openai-tts'
      : input.voiceProvider === 'google' ? 'google-tts'
      : input.voiceProvider === 'azure' ? 'azure-tts'
      : 'multi-provider-tts',
      [],
      {
        text: input.scriptContent,
        voice_id: input.voiceId,
        language: input.language || 'en',
      }
    );
    tasks.push(voiceTask);

    // Task 2: Music generation (parallel with voice)
    if (input.includeMusic) {
      const musicTask = createTask('music-composer', 'multi-provider-music', [], {
        prompt: `${input.musicMood || 'uplifting'} ${input.musicGenre || 'corporate'} background music`,
        duration: input.videoDuration || 60,
        instrumental: true,
      });
      tasks.push(musicTask);
    }

    // Task 3: Video generation (depends on voice)
    if (input.includeVideo) {
      const videoTask = createTask('video-generator', 'ai-video-generator',
        [voiceTask.id],
        {
          prompt: input.scriptContent.slice(0, 500),
          style: input.videoStyle || 'realistic',
          duration: input.videoDuration || 30,
        }
      );
      tasks.push(videoTask);
    }

    // Task 4: Quality check (depends on all generation tasks)
    const generationTaskIds = tasks.map((t) => t.id);
    const qualityTask = createTask('quality-checker', 'ai-quality-assessment',
      generationTaskIds,
      {
        action: 'quick_check',
        contentType: 'paragraph',
      }
    );
    tasks.push(qualityTask);

    return tasks;
  },

  /** Start a production job */
  async startProduction(input: ProductionInput): Promise<ProductionJob> {
    const tasks = this.buildPlan(input);

    const job: ProductionJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      status: 'in_progress',
      tasks,
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      finalOutput: {
        videoUrl: null,
        audioUrl: null,
        musicUrl: null,
        thumbnailUrl: null,
      },
      error: null,
    };

    activeJobs.set(job.id, job);

    // Execute tasks respecting dependencies
    this.executeJob(job, input).catch((err) => {
      job.status = 'failed';
      job.error = err.message;
    });

    return job;
  },

  /** Execute a job's task graph */
  async executeJob(job: ProductionJob, input: ProductionInput): Promise<void> {
    const completedTasks = new Set<string>();

    while (true) {
      // Find tasks that can run (all dependencies met)
      const runnableTasks = job.tasks.filter(
        (t) =>
          t.status === 'queued' &&
          t.dependsOn.every((dep) => completedTasks.has(dep))
      );

      if (runnableTasks.length === 0) {
        // Check if all tasks are done
        const allDone = job.tasks.every(
          (t) => t.status === 'complete' || t.status === 'failed' || t.status === 'skipped'
        );
        if (allDone) break;

        // Check for deadlock (tasks waiting on failed dependencies)
        const hasDeadlock = job.tasks.some(
          (t) =>
            t.status === 'queued' &&
            t.dependsOn.some((dep) => {
              const depTask = job.tasks.find((dt) => dt.id === dep);
              return depTask?.status === 'failed';
            })
        );
        if (hasDeadlock) {
          // Skip tasks with failed dependencies
          job.tasks
            .filter(
              (t) =>
                t.status === 'queued' &&
                t.dependsOn.some((dep) => {
                  const depTask = job.tasks.find((dt) => dt.id === dep);
                  return depTask?.status === 'failed';
                })
            )
            .forEach((t) => {
              t.status = 'skipped';
              t.error = 'Skipped due to failed dependency';
            });
          continue;
        }

        break;
      }

      // Execute runnable tasks in parallel
      await Promise.allSettled(
        runnableTasks.map(async (task) => {
          task.status = 'running';
          task.startedAt = new Date().toISOString();
          input.onTaskUpdate?.(task);

          try {
            const { data, error } = await supabase.functions.invoke(task.edgeFunction, {
              body: task.input,
            });

            if (error) throw error;

            task.status = 'complete';
            task.output = data || {};
            task.completedAt = new Date().toISOString();
            task.durationMs = Date.now() - new Date(task.startedAt!).getTime();

            // Extract outputs for final job result
            if (task.agentName === 'voice-director') {
              job.finalOutput.audioUrl = data?.audioUrl || data?.url || null;
            } else if (task.agentName === 'music-composer') {
              job.finalOutput.musicUrl = data?.audioUrl || data?.url || null;
            } else if (task.agentName === 'video-generator') {
              job.finalOutput.videoUrl = data?.videoUrl || data?.url || null;
              job.finalOutput.thumbnailUrl = data?.thumbnailUrl || null;
            }

            completedTasks.add(task.id);
          } catch (err: any) {
            task.status = 'failed';
            task.error = err.message || 'Unknown error';
            task.completedAt = new Date().toISOString();
            task.durationMs = Date.now() - new Date(task.startedAt!).getTime();
            completedTasks.add(task.id); // Mark as "done" even if failed
          }

          input.onTaskUpdate?.(task);
        })
      );

      // Update progress
      const completed = job.tasks.filter(
        (t) => t.status === 'complete' || t.status === 'failed' || t.status === 'skipped'
      ).length;
      job.progress = Math.round((completed / job.tasks.length) * 100);
      input.onProgress?.(job.progress);
    }

    // Finalize job
    const hasFailed = job.tasks.some((t) => t.status === 'failed');
    job.status = hasFailed ? 'failed' : 'complete';
    job.completedAt = new Date().toISOString();

    if (hasFailed) {
      const failedTasks = job.tasks.filter((t) => t.status === 'failed');
      job.error = `${failedTasks.length} task(s) failed: ${failedTasks.map((t) => t.agentName).join(', ')}`;
    }
  },

  /** Get job status */
  getJobStatus(jobId: string): ProductionJob | null {
    return activeJobs.get(jobId) || null;
  },

  /** List all active jobs */
  listActiveJobs(): ProductionJob[] {
    return Array.from(activeJobs.values()).filter(
      (j) => j.status === 'pending' || j.status === 'in_progress'
    );
  },

  /** Cancel a running job */
  cancelJob(jobId: string): boolean {
    const job = activeJobs.get(jobId);
    if (!job || job.status !== 'in_progress') return false;
    job.status = 'cancelled';
    job.tasks
      .filter((t) => t.status === 'queued' || t.status === 'running')
      .forEach((t) => {
        t.status = 'skipped';
        t.error = 'Job cancelled';
      });
    return true;
  },
};
