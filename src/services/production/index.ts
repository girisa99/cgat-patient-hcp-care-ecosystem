/**
 * Production Services — Cross-Product Pipeline Infrastructure
 *
 * Architecture:
 *   productionEpisodesService — Unified project entity (Spark+Mind+Cast+Deck)
 *   mediaBridgeService        — Mind → Cast audio integration
 *   contentQualityAgent       — Self-correcting quality feedback loop
 *   pipelineSupervisor        — Multi-agent orchestration (voice+music+video)
 *   zeroToHeroPipeline        — Description → finished video in <5 min
 *   multiRegionEngine         — One campaign → N culturally-adapted versions
 */

export { productionEpisodesService } from './productionEpisodesService';
export type { ProductionEpisode, CreateEpisodeInput, EpisodeStatus } from './productionEpisodesService';

export { mediaBridgeService } from './mediaBridgeService';
export type { AudioAsset, AudioAssetRole, SceneAudioBinding, ProjectAudioConfig } from './mediaBridgeService';

export { contentQualityAgent } from './contentQualityAgent';
export type { QualityMetrics, RefinementInput, RefinementResult, RefinementIteration } from './contentQualityAgent';

export { pipelineSupervisor } from './pipelineSupervisor';
export type { ProductionJob, ProductionInput, PipelineTask, TaskStatus, JobStatus } from './pipelineSupervisor';

export { zeroToHeroPipeline } from './zeroToHeroPipeline';
export type { HeroInput, HeroResult, HeroStep, HeroStepUpdate, BrandInference } from './zeroToHeroPipeline';

export { multiRegionEngine } from './multiRegionEngine';
export type { RegionalVariant, MultiRegionPlan, RegionCode } from './multiRegionEngine';

export {
  assembleEnrichmentContext,
  calculateEnrichmentScore,
  buildEnrichedPrompt,
  generateSceneScripts,
  buildProductionInput,
  startCastProduction,
  buildRequestFromSession,
} from './castProductionBridge';
export type { EnrichmentContext, CastProductionRequest } from './castProductionBridge';

export { generateStylePreview, generateBatchPreviews } from './imagePreviewService';
export type { ImagePreviewRequest, ImagePreviewResult, ImageProvider } from './imagePreviewService';

export { lockTTSProvider, isLockValid, getVoicesForLanguage, getProvidersForRegion } from './ttsProviderLock';

export {
  generateChunkAvatar,
  generateSceneAvatarVideo,
  requestAzureVisemes,
  VISEME_SHAPES,
} from './avatarGenerationPipeline';
export type { AvatarProvider, AvatarConfig, ChunkVideoRequest, SceneVideoResult } from './avatarGenerationPipeline';
