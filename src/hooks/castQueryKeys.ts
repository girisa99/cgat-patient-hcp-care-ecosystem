/**
 * castQueryKeys — Hierarchical React Query key factory for Cast projects.
 *
 * Enables prefix-based invalidation:
 *   queryClient.invalidateQueries({ queryKey: castKeys.project(id).all })
 *   → invalidates TTS, scenes, jobs, meta — everything for that project.
 */

export const castKeys = {
  /** Root prefix for all cast queries */
  all: ['cast'] as const,

  /** Everything scoped to a single project */
  project: (projectId: string) => ({
    all: ['cast', 'project', projectId] as const,
    ttsLines: ['cast', 'project', projectId, 'tts-lines'] as const,
    ttsJobsFallback: ['cast', 'project', projectId, 'tts-jobs-fallback'] as const,
    sceneSummaries: ['cast', 'project', projectId, 'scene-summaries'] as const,
    sceneArtifacts: (sceneKey: string) =>
      ['cast', 'project', projectId, 'scene-artifacts', sceneKey] as const,
    visualJobsFallback: ['cast', 'project', projectId, 'visual-jobs-fallback'] as const,
    generationJobs: ['cast', 'project', projectId, 'generation-jobs'] as const,
    meta: ['cast', 'project', projectId, 'meta'] as const,
    projectStatus: ['cast', 'project', projectId, 'project-status'] as const,
    tokenBreakdown: ['cast', 'project', projectId, 'token-breakdown'] as const,
  }),

  /** Project lookup by user + style intent */
  projectLookup: (userId: string, styleIntent: string) =>
    ['cast', 'project-lookup', userId, styleIntent] as const,

  /** Screenshots (global, not per-project) */
  screenshots: ['cast', 'screenshots'] as const,
};
