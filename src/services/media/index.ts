/**
 * Universal Media Adapter - Entry Point
 * 
 * Unified service for OCR, TTS/STT, Image Generation, Video Generation, and NLP operations
 * across the Genie Suite (Spark, Mind, Vibe, Arc, Deck, Hub, Ask Genie)
 * 
 * Provider configs are split into 3 files for maintainability:
 * - imageProviderConfig.ts (Image generation providers)
 * - videoProviderConfig.ts (Video, AnimateDiff, SVD, Avatar, Lip-Sync)
 * - audioProviderConfig.ts (OCR, TTS, STT, SFX, NLP)
 */

// Types
export * from './types';

// Provider Configuration - Split Files
export {
  IMAGE_GEN_PROVIDERS,
  getImageProvider,
  getConfiguredImageProviders,
  getImageProvidersByCapability,
  getImageProviderForLanguage,
  IMAGE_PROVIDER_TIERS,
} from './imageProviderConfig';

export {
  VIDEO_GEN_PROVIDERS,
  getVideoProvider,
  getConfiguredVideoProviders,
  getVideoProvidersByCapability,
  getAnimateDiffProviders,
  getSVDProviders,
  getAvatarProviders,
  getLipsyncProviders,
  getVideoProviderForLanguage,
  VIDEO_PROVIDER_TIERS,
  VIDEO_SCORING_WEIGHTS,
} from './videoProviderConfig';

export {
  OCR_PROVIDERS,
  TTS_PROVIDERS,
  STT_PROVIDERS,
  SFX_GEN_PROVIDERS,
  NLP_PROVIDERS,
  getOCRProvider,
  getTTSProvider,
  getSTTProvider,
  getConfiguredOCRProviders,
  getConfiguredTTSProviders,
  getConfiguredSTTProviders,
  getTTSProviderForLanguage,
  getSTTProviderForLanguage,
  AUDIO_PROVIDER_TIERS,
} from './audioProviderConfig';

// Video Recommendation Service
export {
  videoProviderRecommendationService,
  type RecommendationContext,
} from './videoProviderRecommendationService';

// Main Adapter
export { 
  UniversalMediaAdapter, 
  getUniversalMediaAdapter,
  default as UniversalMediaAdapterClass 
} from './UniversalMediaAdapter';
