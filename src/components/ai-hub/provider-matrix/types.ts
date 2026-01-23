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

// All supported providers
export type ProviderId = 
  // Core LLM
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'deepseek'
  | 'alibaba'
  | 'azure'
  // Media
  | 'modelslab'
  | 'replicate'
  | 'stability'
  | 'runway'
  | 'pika'
  // Voice/Audio
  | 'elevenlabs'
  | 'assemblyai'
  | 'suno'
  | 'udio'
  // Translation
  | 'deepl'
  | 'microsoft'
  | 'google'
  // Infrastructure
  | 'supabase'
  | 'stripe'
  // Specialized
  | 'huggingface'
  | 'cohere';

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
