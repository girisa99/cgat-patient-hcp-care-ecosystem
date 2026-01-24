/**
 * Provider Capability Matrix Types
 * 
 * Comprehensive type definitions for tracking all providers × all capabilities
 */

// Feature categories from Excel analysis + Ecosystem Alignment
export type FeatureCategory = 
  | 'INPUT'
  | 'SCRIPT'
  | 'VOICE'
  | 'AUDIO'
  | 'SFX'           // NEW: Sound Effects generation (ElevenLabs, Suno)
  | 'IMAGE'
  | 'VIDEO'
  | 'ANIMATION'
  | '3D'
  | 'AR_VR'
  | 'VFX'
  | 'INTERACTIVE'
  | 'TRANSLATION'
  | 'EXPORT'
  | 'DOWNLOAD'      // NEW: Universal download/export distribution
  | 'EDITING'       // NEW: Generative editor refinement features
  | 'PIPELINE'      // NEW: Transformation pipeline orchestration
  | 'PUBLISHING'
  | 'SECURITY'
  | 'BUSINESS'
  | 'USE_CASE';

// Implementation status
export type ImplementationStatus = 
  | 'implemented'      // Fully working in production
  | 'partial'          // Partially implemented
  | 'planned'          // In roadmap
  | 'not_started'      // Not yet started
  | 'not_applicable';  // Not relevant for this provider

// Provider configuration status
export type ProviderStatus = 
  | 'configured'       // API key present and working
  | 'needs_key'        // Missing API key
  | 'not_supported';   // Not supported by this provider

// All supported providers - Core 13 Ecosystem + Legacy Compatibility
export type ProviderId = 
  // ═══════════════════════════════════════════════════════════════
  // CORE 13 ECOSYSTEM (Primary Production Providers)
  // ═══════════════════════════════════════════════════════════════
  // LLM Providers (5-Zone Routing)
  | 'openai'      // GPT-4o, Whisper, DALL-E 3
  | 'claude'      // Claude 3.5 Sonnet - Claude Zone (West)
  | 'gemini'      // Gemini 2.5 Pro - Gemini Zone (India/SEA/Africa)
  | 'deepseek'    // DeepSeek V3 - Cost-efficient fallback
  | 'alibaba'     // Qwen-Max, CosyVoice, WAN 2.2 - Alibaba Zone (CJK)
  | 'azure'       // Azure Neural TTS, Visemes, Form Recognizer
  // Media Providers (Global Routing)
  | 'modelslab'   // FLUX Pro, AnimateDiff, 3D Mesh
  | 'meshy'       // Meshy AI - High-fidelity 3D, PBR textures, Rigging
  | 'replicate'   // Open-source models, TripoSR (Image-to-3D)
  // Voice/Audio
  | 'elevenlabs'  // Premium TTS, Voice Cloning, SFX
  // Translation
  | 'deepl'       // European languages, Context-aware
  // Infrastructure
  | 'supabase'    // Auth, Database, Storage, Edge Functions
  | 'stripe'      // Payments, Subscriptions, Billing
  // ═══════════════════════════════════════════════════════════════
  // DEPRECATED PROVIDERS (Legacy Compatibility - Route to Core 13)
  // ═══════════════════════════════════════════════════════════════
  | 'stability'   // → ModelsLab (FLUX/SDXL)
  | 'runway'      // → ModelsLab (AnimateDiff) / Alibaba (WAN 2.2)
  | 'pika'        // → Alibaba (WAN 2.2)
  | 'assemblyai'  // → Azure STT / OpenAI Whisper
  | 'suno'        // → ElevenLabs Music/SFX
  | 'udio'        // → ElevenLabs Music/SFX
  | 'microsoft'   // → Azure
  | 'google'      // → Gemini
  | 'huggingface' // → Replicate
  | 'cohere';     // → OpenAI/Gemini Embeddings

// Feature definition
export interface Feature {
  id: string;
  name: string;
  category: FeatureCategory;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// Provider capability for a specific feature
export interface ProviderCapability {
  providerId: ProviderId;
  status: ProviderStatus;
  implementation: ImplementationStatus;
  confidence: number;       // 0-100
  quality: number;          // 0-100
  speed: number;            // 0-100
  cost: 'free' | 'low' | 'medium' | 'high';
  features: string[];
  notes?: string;
  edgeFunctionUsed?: string;
  missingFeatures?: string[];
}

// Full feature capability matrix entry
export interface FeatureCapabilityEntry {
  feature: Feature;
  providers: ProviderCapability[];
  primaryProvider?: ProviderId;
  fallbackChain: ProviderId[];
  overallStatus: ImplementationStatus;
  gapAnalysis?: string;
}

// Provider summary
export interface ProviderSummary {
  id: ProviderId;
  name: string;
  logo?: string;
  website: string;
  status: ProviderStatus;
  secretKey: string;
  totalFeatures: number;
  implementedFeatures: number;
  partialFeatures: number;
  missingFeatures: number;
  capabilities: FeatureCategory[];
  strengths: string[];
  weaknesses: string[];
  costTier: 'budget' | 'standard' | 'premium' | 'enterprise';
}

// Matrix summary stats
export interface MatrixSummary {
  totalFeatures: number;
  implementedFeatures: number;
  partialFeatures: number;
  plannedFeatures: number;
  notStartedFeatures: number;
  totalProviders: number;
  configuredProviders: number;
  coveragePercentage: number;
  gapsByCategory: Record<FeatureCategory, number>;
}
