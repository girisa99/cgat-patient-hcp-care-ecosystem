/**
 * API PRODUCTION CONFIGURATION - SINGLE SOURCE OF TRUTH
 * 
 * Tracks all external APIs, their dev/prod URLs, subscription tiers,
 * rate limits, and production readiness status.
 * 
 * This file MUST be updated when:
 * 1. Adding new API integrations
 * 2. Moving from dev to prod endpoints
 * 3. Changing subscription tiers
 * 4. Updating rate limits
 * 
 * @see docs/architecture/P3_API_DEPENDENCIES_GUIDE.md
 * @see src/shared/config/secret-keys.ts
 * 
 * Version: 1.0.0
 * Last Updated: 2026-01-16
 */

// =============================================================================
// API ENVIRONMENT CONFIGURATION
// =============================================================================
export type ApiEnvironment = 'development' | 'staging' | 'production';
export type ApiStatus = 'configured' | 'needs-upgrade' | 'not-configured' | 'deprecated';
export type CostModel = 'usage-based' | 'character-based' | 'per-request' | 'flat-rate' | 'transaction-percent' | 'free';

export interface ApiEndpointConfig {
  development: string;
  staging?: string;
  production: string;
}

export interface ApiSubscriptionTier {
  name: string;
  monthlyLimit: number | 'unlimited';
  monthlyCost: number;
  rateLimit: {
    requests: number;
    window: 'minute' | 'hour' | 'day';
  };
  recommended: boolean;
}

export interface ApiConfig {
  id: string;
  name: string;
  provider: string;
  category: 'ai' | 'voice' | 'communication' | 'business' | 'healthcare' | 'media' | 'monitoring';
  
  // Environment configuration
  secretKey: string;
  endpoints: ApiEndpointConfig;
  currentEnvironment: ApiEnvironment;
  status: ApiStatus;
  
  // Cost & Subscription
  costModel: CostModel;
  currentTier: string;
  availableTiers: ApiSubscriptionTier[];
  estimatedMonthlyCost: number;
  
  // Rate Limiting
  rateLimit: {
    requests: number;
    window: 'minute' | 'hour' | 'day';
  };
  
  // Production Readiness
  productionChecklist: {
    keyRotated: boolean;
    rateLimitConfigured: boolean;
    monitoringEnabled: boolean;
    fallbackConfigured: boolean;
    documentationUpdated: boolean;
  };
  
  // Metadata
  lastUpdated: string;
  usedBy: string[];
  notes?: string;
}

// =============================================================================
// API CONFIGURATIONS - COMPREHENSIVE LIST
// =============================================================================
export const API_CONFIGURATIONS: ApiConfig[] = [
  // ==================== TIER 1: CORE AI ====================
  {
    id: 'openai',
    name: 'OpenAI API',
    provider: 'OpenAI',
    category: 'ai',
    secretKey: 'OPENAI_API_KEY',
    endpoints: {
      development: 'https://api.openai.com/v1',
      production: 'https://api.openai.com/v1',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'pay-as-you-go',
    availableTiers: [
      { name: 'pay-as-you-go', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 3500, window: 'minute' }, recommended: false },
      { name: 'tier-1', monthlyLimit: 100000, monthlyCost: 100, rateLimit: { requests: 10000, window: 'minute' }, recommended: true },
      { name: 'tier-2', monthlyLimit: 500000, monthlyCost: 500, rateLimit: { requests: 50000, window: 'minute' }, recommended: false },
    ],
    estimatedMonthlyCost: 200,
    rateLimit: { requests: 3500, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['ai-universal-processor', 'genie-chat', 'analyze-script'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    provider: 'Anthropic',
    category: 'ai',
    secretKey: 'ANTHROPIC_API_KEY',
    endpoints: {
      development: 'https://api.anthropic.com/v1',
      production: 'https://api.anthropic.com/v1',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'pay-as-you-go',
    availableTiers: [
      { name: 'pay-as-you-go', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 1000, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 150,
    rateLimit: { requests: 1000, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['ai-universal-processor', 'claude-conversations'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'Google',
    category: 'ai',
    secretKey: 'GEMINI_API_KEY',
    endpoints: {
      development: 'https://generativelanguage.googleapis.com/v1beta',
      production: 'https://generativelanguage.googleapis.com/v1',
    },
    currentEnvironment: 'development',
    status: 'needs-upgrade',
    costModel: 'usage-based',
    currentTier: 'free',
    availableTiers: [
      { name: 'free', monthlyLimit: 60, monthlyCost: 0, rateLimit: { requests: 15, window: 'minute' }, recommended: false },
      { name: 'pay-as-you-go', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 360, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 50,
    rateLimit: { requests: 15, window: 'minute' },
    productionChecklist: {
      keyRotated: false,
      rateLimitConfigured: true,
      monitoringEnabled: false,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['ai-universal-processor', 'multi-model-comparison'],
    notes: 'PROD ACTION: Switch to v1 endpoint and upgrade to pay-as-you-go tier',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    provider: 'DeepSeek',
    category: 'ai',
    secretKey: 'DEEPSEEK_API_KEY',
    endpoints: {
      development: 'https://api.deepseek.com/v1',
      production: 'https://api.deepseek.com/v1',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'pay-as-you-go',
    availableTiers: [
      { name: 'pay-as-you-go', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 500, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 30,
    rateLimit: { requests: 500, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-22',
    usedBy: ['ai-universal-processor', 'code-generation', 'cjk-translation'],
    notes: 'Best for code, math, and CJK language understanding',
  },
  {
    id: 'alibaba',
    name: 'Alibaba DashScope',
    provider: 'Alibaba',
    category: 'ai',
    secretKey: 'ALIBABA_API_KEY',
    endpoints: {
      development: 'https://dashscope.aliyuncs.com/api/v1',
      production: 'https://dashscope.aliyuncs.com/api/v1',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'pay-as-you-go',
    availableTiers: [
      { name: 'free', monthlyLimit: 1000, monthlyCost: 0, rateLimit: { requests: 100, window: 'minute' }, recommended: false },
      { name: 'pay-as-you-go', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 500, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 40,
    rateLimit: { requests: 500, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-22',
    usedBy: ['ai-universal-processor', 'qwen-translation', 'alibaba-tts', 'wanx-image'],
    notes: 'Qwen LLM, Qwen-MT, CosyVoice TTS, Paraformer STT, Wanx Image Gen',
  },
  {
    id: 'azure-openai',
    name: 'Azure OpenAI',
    provider: 'Microsoft',
    category: 'ai',
    secretKey: 'AZURE_OPENAI_KEY',
    endpoints: {
      development: 'https://{resource}.openai.azure.com/openai',
      production: 'https://{resource}.openai.azure.com/openai',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'standard',
    availableTiers: [
      { name: 'standard', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 1000, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 100,
    rateLimit: { requests: 1000, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-22',
    usedBy: ['ai-universal-processor', 'enterprise-compliance'],
    notes: 'HIPAA/SOC2 compliant, enterprise deployments',
  },
  {
    id: 'azure-speech',
    name: 'Azure Speech Services',
    provider: 'Microsoft',
    category: 'voice',
    secretKey: 'AZURE_SPEECH_KEY',
    endpoints: {
      development: 'https://{region}.api.cognitive.microsoft.com',
      production: 'https://{region}.api.cognitive.microsoft.com',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'standard',
    availableTiers: [
      { name: 'free', monthlyLimit: 5, monthlyCost: 0, rateLimit: { requests: 20, window: 'minute' }, recommended: false },
      { name: 'standard', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 100, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 50,
    rateLimit: { requests: 100, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-22',
    usedBy: ['ask-genie-voice', 'neural-tts', 'speech-to-text'],
    notes: 'Premium Neural TTS with visemes, real-time STT',
  },
  {
    id: 'deepl',
    name: 'DeepL Translator',
    provider: 'DeepL',
    category: 'ai',
    secretKey: 'DEEPL_API_KEY',
    endpoints: {
      development: 'https://api-free.deepl.com/v2',
      production: 'https://api.deepl.com/v2',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'character-based',
    currentTier: 'pro',
    availableTiers: [
      { name: 'free', monthlyLimit: 500000, monthlyCost: 0, rateLimit: { requests: 100, window: 'minute' }, recommended: false },
      { name: 'pro', monthlyLimit: 'unlimited', monthlyCost: 25, rateLimit: { requests: 500, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 25,
    rateLimit: { requests: 500, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-22',
    usedBy: ['translate', 'european-translation'],
    notes: 'Best for European languages, glossary support, formality control',
  },

  // ==================== TIER 2: VOICE & MEDIA ====================
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    category: 'voice',
    secretKey: 'ELEVENLABS_API_KEY',
    endpoints: {
      development: 'https://api.elevenlabs.io/v1',
      production: 'https://api.elevenlabs.io/v1',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'character-based',
    currentTier: 'creator',
    availableTiers: [
      { name: 'free', monthlyLimit: 10000, monthlyCost: 0, rateLimit: { requests: 100, window: 'minute' }, recommended: false },
      { name: 'starter', monthlyLimit: 30000, monthlyCost: 5, rateLimit: { requests: 500, window: 'minute' }, recommended: false },
      { name: 'creator', monthlyLimit: 100000, monthlyCost: 22, rateLimit: { requests: 1000, window: 'minute' }, recommended: true },
      { name: 'pro', monthlyLimit: 500000, monthlyCost: 99, rateLimit: { requests: 2000, window: 'minute' }, recommended: false },
    ],
    estimatedMonthlyCost: 22,
    rateLimit: { requests: 1000, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: false,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['text-to-speech', 'voice-cloning', 'genie-vibe'],
    notes: 'Monitor character usage - may need Pro tier for healthcare segment',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    provider: 'Replicate',
    category: 'media',
    secretKey: 'REPLICATE_API_TOKEN',
    endpoints: {
      development: 'https://api.replicate.com/v1',
      production: 'https://api.replicate.com/v1',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'pay-as-you-go',
    availableTiers: [
      { name: 'pay-as-you-go', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 600, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 50,
    rateLimit: { requests: 600, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: false,
      fallbackConfigured: false,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['video-generation', 'image-generation', 'avatar-creation'],
  },
  {
    id: 'huggingface',
    name: 'HuggingFace Inference',
    provider: 'HuggingFace',
    category: 'ai',
    secretKey: 'HUGGING_FACE_ACCESS_TOKEN',
    endpoints: {
      development: 'https://api-inference.huggingface.co/models',
      production: 'https://api-inference.huggingface.co/models',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'free',
    currentTier: 'free',
    availableTiers: [
      { name: 'free', monthlyLimit: 30000, monthlyCost: 0, rateLimit: { requests: 300, window: 'minute' }, recommended: true },
      { name: 'pro', monthlyLimit: 'unlimited', monthlyCost: 9, rateLimit: { requests: 1000, window: 'minute' }, recommended: false },
    ],
    estimatedMonthlyCost: 0,
    rateLimit: { requests: 300, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: false,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['ml-inference', 'speech-processing'],
  },

  // ==================== TIER 3: COMMUNICATION ====================
  {
    id: 'twilio',
    name: 'Twilio',
    provider: 'Twilio',
    category: 'communication',
    secretKey: 'TWILIO_ACCOUNT_SID',
    endpoints: {
      development: 'https://api.twilio.com/2010-04-01',
      production: 'https://api.twilio.com/2010-04-01',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'pay-as-you-go',
    availableTiers: [
      { name: 'pay-as-you-go', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 100, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 100,
    rateLimit: { requests: 100, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: false,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['sms-notifications', 'whatsapp-messaging', 'voice-calls'],
  },
  {
    id: 'resend',
    name: 'Resend',
    provider: 'Resend',
    category: 'communication',
    secretKey: 'RESEND_API_KEY',
    endpoints: {
      development: 'https://api.resend.com',
      production: 'https://api.resend.com',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'free',
    availableTiers: [
      { name: 'free', monthlyLimit: 3000, monthlyCost: 0, rateLimit: { requests: 100, window: 'day' }, recommended: false },
      { name: 'pro', monthlyLimit: 50000, monthlyCost: 20, rateLimit: { requests: 500, window: 'day' }, recommended: true },
    ],
    estimatedMonthlyCost: 0,
    rateLimit: { requests: 100, window: 'day' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: false,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['transactional-email', 'notifications'],
    notes: 'PROD ACTION: Upgrade to Pro tier before launch (3000/mo limit too low)',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    provider: 'Twilio',
    category: 'communication',
    secretKey: 'SENDGRID_API_KEY',
    endpoints: {
      development: 'https://api.sendgrid.com/v3',
      production: 'https://api.sendgrid.com/v3',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'usage-based',
    currentTier: 'essentials',
    availableTiers: [
      { name: 'free', monthlyLimit: 100, monthlyCost: 0, rateLimit: { requests: 100, window: 'day' }, recommended: false },
      { name: 'essentials', monthlyLimit: 50000, monthlyCost: 19.95, rateLimit: { requests: 1000, window: 'hour' }, recommended: true },
      { name: 'pro', monthlyLimit: 100000, monthlyCost: 89.95, rateLimit: { requests: 2000, window: 'hour' }, recommended: false },
    ],
    estimatedMonthlyCost: 19.95,
    rateLimit: { requests: 1000, window: 'hour' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['bulk-email', 'marketing-campaigns'],
  },

  // ==================== TIER 4: BUSINESS ====================
  {
    id: 'stripe',
    name: 'Stripe',
    provider: 'Stripe',
    category: 'business',
    secretKey: 'STRIPE_SECRET_KEY',
    endpoints: {
      development: 'https://api.stripe.com/v1',
      production: 'https://api.stripe.com/v1',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'transaction-percent',
    currentTier: 'standard',
    availableTiers: [
      { name: 'standard', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 100, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 0,
    rateLimit: { requests: 100, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: false,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['checkout', 'subscriptions', 'billing-portal'],
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    provider: 'DocuSign',
    category: 'business',
    secretKey: 'DOCUSIGN_API_KEY',
    endpoints: {
      development: 'https://demo.docusign.net/restapi',
      production: 'https://www.docusign.net/restapi',
    },
    currentEnvironment: 'development',
    status: 'needs-upgrade',
    costModel: 'per-request',
    currentTier: 'developer',
    availableTiers: [
      { name: 'developer', monthlyLimit: 50, monthlyCost: 0, rateLimit: { requests: 10, window: 'hour' }, recommended: false },
      { name: 'personal', monthlyLimit: 5, monthlyCost: 15, rateLimit: { requests: 100, window: 'hour' }, recommended: false },
      { name: 'standard', monthlyLimit: 'unlimited', monthlyCost: 45, rateLimit: { requests: 1000, window: 'hour' }, recommended: true },
    ],
    estimatedMonthlyCost: 0,
    rateLimit: { requests: 10, window: 'hour' },
    productionChecklist: {
      keyRotated: false,
      rateLimitConfigured: false,
      monitoringEnabled: false,
      fallbackConfigured: false,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['e-signatures', 'contract-management'],
    notes: 'PROD ACTION REQUIRED: Switch from demo to production endpoint, upgrade tier',
  },

  // ==================== TIER 5: HEALTHCARE ====================
  {
    id: 'nppes',
    name: 'NPPES NPI Registry',
    provider: 'CMS',
    category: 'healthcare',
    secretKey: '', // No key needed
    endpoints: {
      development: 'https://npiregistry.cms.hhs.gov/api/',
      production: 'https://npiregistry.cms.hhs.gov/api/',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'free',
    currentTier: 'free',
    availableTiers: [
      { name: 'free', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 20, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 0,
    rateLimit: { requests: 20, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: false,
      fallbackConfigured: true,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['npi-verification', 'provider-lookup'],
    notes: 'Free API but strictly rate-limited. Implement caching for production.',
  },
  {
    id: 'openfda',
    name: 'openFDA Drug API',
    provider: 'FDA',
    category: 'healthcare',
    secretKey: '', // No key needed
    endpoints: {
      development: 'https://api.fda.gov/drug',
      production: 'https://api.fda.gov/drug',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'free',
    currentTier: 'free',
    availableTiers: [
      { name: 'free', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 240, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 0,
    rateLimit: { requests: 240, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: false,
      fallbackConfigured: false,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['drug-lookup', 'medication-info'],
  },

  // ==================== TIER 6: MONITORING & OBSERVABILITY ====================
  {
    id: 'arize',
    name: 'Arize AI',
    provider: 'Arize',
    category: 'monitoring',
    secretKey: 'ARIZE_API_KEY',
    endpoints: {
      development: 'https://api.arize.com/v1',
      production: 'https://api.arize.com/v1',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'free',
    currentTier: 'free',
    availableTiers: [
      { name: 'free', monthlyLimit: 10000, monthlyCost: 0, rateLimit: { requests: 1000, window: 'minute' }, recommended: true },
      { name: 'pro', monthlyLimit: 'unlimited', monthlyCost: 99, rateLimit: { requests: 5000, window: 'minute' }, recommended: false },
    ],
    estimatedMonthlyCost: 0,
    rateLimit: { requests: 1000, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: false,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['ai-observability', 'model-monitoring'],
  },
  {
    id: 'langwatch',
    name: 'LangWatch',
    provider: 'LangWatch',
    category: 'monitoring',
    secretKey: 'LANGWATCH_API_KEY',
    endpoints: {
      development: 'https://api.langwatch.ai/v1',
      production: 'https://api.langwatch.ai/v1',
    },
    currentEnvironment: 'production',
    status: 'configured',
    costModel: 'free',
    currentTier: 'free',
    availableTiers: [
      { name: 'free', monthlyLimit: 10000, monthlyCost: 0, rateLimit: { requests: 1000, window: 'minute' }, recommended: true },
    ],
    estimatedMonthlyCost: 0,
    rateLimit: { requests: 1000, window: 'minute' },
    productionChecklist: {
      keyRotated: true,
      rateLimitConfigured: true,
      monitoringEnabled: true,
      fallbackConfigured: false,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['llm-tracing', 'conversation-analytics'],
  },

  // ==================== TIER 7: LABEL STUDIO (NEW) ====================
  {
    id: 'label-studio',
    name: 'Label Studio',
    provider: 'HumanSignal',
    category: 'ai',
    secretKey: 'LABEL_STUDIO_ACCESS_TOKEN',
    endpoints: {
      development: 'http://localhost:8080/api',
      staging: 'https://label-studio-staging.example.com/api',
      production: 'https://label-studio.example.com/api',
    },
    currentEnvironment: 'development',
    status: 'needs-upgrade',
    costModel: 'flat-rate',
    currentTier: 'open-source',
    availableTiers: [
      { name: 'open-source', monthlyLimit: 'unlimited', monthlyCost: 0, rateLimit: { requests: 100, window: 'minute' }, recommended: false },
      { name: 'teams', monthlyLimit: 'unlimited', monthlyCost: 99, rateLimit: { requests: 1000, window: 'minute' }, recommended: true },
      { name: 'enterprise', monthlyLimit: 'unlimited', monthlyCost: 499, rateLimit: { requests: 5000, window: 'minute' }, recommended: false },
    ],
    estimatedMonthlyCost: 0,
    rateLimit: { requests: 100, window: 'minute' },
    productionChecklist: {
      keyRotated: false,
      rateLimitConfigured: false,
      monitoringEnabled: false,
      fallbackConfigured: false,
      documentationUpdated: true,
    },
    lastUpdated: '2026-01-16',
    usedBy: ['data-annotation', 'ml-training', 'quality-assurance'],
    notes: 'PROD ACTION: Deploy production Label Studio instance, configure SSO, upgrade to Teams tier',
  },
];

// =============================================================================
// API PRODUCTION STAGE GATE ITEMS
// =============================================================================
export interface ApiStageGateItem {
  category: 'API Configuration' | 'API Security' | 'API Monitoring' | 'API Documentation' | 'API Testing';
  item: string;
  status: 'done' | 'in-progress' | 'pending' | 'blocked';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  apiId?: string;
  notes?: string;
}

export const API_STAGE_GATE_CHECKLIST: ApiStageGateItem[] = [
  // ==================== API CONFIGURATION ====================
  { category: 'API Configuration', item: 'All dev→prod endpoint URLs updated', status: 'in-progress', priority: 'Critical', notes: 'Gemini, DocuSign, Label Studio need update' },
  { category: 'API Configuration', item: 'Production API keys generated and rotated', status: 'in-progress', priority: 'Critical', notes: '3 APIs need key rotation' },
  { category: 'API Configuration', item: 'Subscription tiers upgraded for production load', status: 'pending', priority: 'High', notes: 'Resend needs Pro tier, ElevenLabs may need Pro' },
  { category: 'API Configuration', item: 'Rate limit configurations verified', status: 'done', priority: 'Critical' },
  { category: 'API Configuration', item: 'Fallback providers configured', status: 'in-progress', priority: 'High', notes: 'Need fallback for ElevenLabs, Twilio' },
  { category: 'API Configuration', item: 'Environment variables documented', status: 'done', priority: 'High' },
  { category: 'API Configuration', item: 'API versioning strategy defined', status: 'done', priority: 'Medium' },
  
  // ==================== API SECURITY ====================
  { category: 'API Security', item: 'All API keys stored in Supabase Secrets', status: 'done', priority: 'Critical' },
  { category: 'API Security', item: 'Key rotation policy documented', status: 'pending', priority: 'High' },
  { category: 'API Security', item: 'API key access audit completed', status: 'pending', priority: 'High' },
  { category: 'API Security', item: 'Minimum permission scopes verified', status: 'done', priority: 'High' },
  { category: 'API Security', item: 'OAuth token refresh handling tested', status: 'done', priority: 'High' },
  { category: 'API Security', item: 'Webhook signature verification enabled', status: 'done', priority: 'High' },
  
  // ==================== API MONITORING ====================
  { category: 'API Monitoring', item: 'API usage tracking enabled (api_consumption_logs)', status: 'done', priority: 'Critical' },
  { category: 'API Monitoring', item: 'Cost alerts configured per API', status: 'pending', priority: 'High' },
  { category: 'API Monitoring', item: 'Rate limit alerts configured', status: 'pending', priority: 'High' },
  { category: 'API Monitoring', item: 'Error rate alerting enabled', status: 'pending', priority: 'High' },
  { category: 'API Monitoring', item: 'Latency monitoring enabled', status: 'pending', priority: 'Medium' },
  { category: 'API Monitoring', item: 'Monthly spend dashboard created', status: 'pending', priority: 'Medium' },
  
  // ==================== API DOCUMENTATION ====================
  { category: 'API Documentation', item: 'P3_API_DEPENDENCIES_GUIDE.md updated', status: 'done', priority: 'High' },
  { category: 'API Documentation', item: 'secret-keys.ts synchronized', status: 'done', priority: 'High' },
  { category: 'API Documentation', item: 'API cost estimations documented', status: 'done', priority: 'Medium' },
  { category: 'API Documentation', item: 'Integration runbooks created', status: 'pending', priority: 'High' },
  { category: 'API Documentation', item: 'API changelog maintained', status: 'pending', priority: 'Medium' },
  
  // ==================== API TESTING ====================
  { category: 'API Testing', item: 'All API integrations tested in staging', status: 'in-progress', priority: 'Critical' },
  { category: 'API Testing', item: 'Rate limit behavior tested', status: 'done', priority: 'High' },
  { category: 'API Testing', item: 'Error handling tested', status: 'done', priority: 'High' },
  { category: 'API Testing', item: 'Timeout handling tested', status: 'done', priority: 'High' },
  { category: 'API Testing', item: 'Retry logic tested', status: 'done', priority: 'High' },
  { category: 'API Testing', item: 'Load testing with realistic API calls', status: 'pending', priority: 'High' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
export function getApisByStatus(status: ApiStatus): ApiConfig[] {
  return API_CONFIGURATIONS.filter(api => api.status === status);
}

export function getApisNeedingUpgrade(): ApiConfig[] {
  return API_CONFIGURATIONS.filter(api => 
    api.status === 'needs-upgrade' || 
    api.currentEnvironment !== 'production'
  );
}

export function getTotalEstimatedMonthlyCost(): number {
  return API_CONFIGURATIONS.reduce((sum, api) => sum + api.estimatedMonthlyCost, 0);
}

export function getApiProductionReadiness(): { ready: number; total: number; percentage: number } {
  const total = API_CONFIGURATIONS.length;
  const ready = API_CONFIGURATIONS.filter(api => 
    api.status === 'configured' && 
    api.currentEnvironment === 'production' &&
    Object.values(api.productionChecklist).every(v => v === true)
  ).length;
  return { ready, total, percentage: Math.round((ready / total) * 100) };
}

export function getStageGateProgress(): { done: number; total: number; percentage: number } {
  const total = API_STAGE_GATE_CHECKLIST.length;
  const done = API_STAGE_GATE_CHECKLIST.filter(item => item.status === 'done').length;
  return { done, total, percentage: Math.round((done / total) * 100) };
}

// =============================================================================
// METADATA
// =============================================================================
export const API_CONFIG_METADATA = {
  version: '1.0.0',
  lastUpdated: '2026-01-16',
  totalApis: API_CONFIGURATIONS.length,
  configuredApis: API_CONFIGURATIONS.filter(a => a.status === 'configured').length,
  needsUpgrade: API_CONFIGURATIONS.filter(a => a.status === 'needs-upgrade').length,
  estimatedMonthlyCost: getTotalEstimatedMonthlyCost(),
  stageGateProgress: getStageGateProgress(),
  changelog: [
    { date: '2026-01-16', change: 'Initial API production configuration created', by: 'System' },
    { date: '2026-01-16', change: 'Added 16 API configurations with full prod readiness tracking', by: 'DevOps' },
    { date: '2026-01-16', change: 'Added 29 API-specific stage gate items', by: 'DevOps' },
  ],
};
