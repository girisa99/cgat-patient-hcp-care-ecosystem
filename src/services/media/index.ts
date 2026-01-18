/**
 * Universal Media Adapter - Entry Point
 * 
 * Unified service for OCR, TTS/STT, Image Generation, and NLP operations
 * across the Genie Suite (Spark, Mind, Vibe, Arc, Deck, Hub, Ask Genie)
 */

// Types
export * from './types';

// Provider Configuration
export * from './providerConfig';

// Main Adapter
export { 
  UniversalMediaAdapter, 
  getUniversalMediaAdapter,
  default as UniversalMediaAdapterClass 
} from './UniversalMediaAdapter';
