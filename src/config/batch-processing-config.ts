/**
 * BATCH PROCESSING & CONCURRENCY CONFIGURATION
 * 
 * Configures concurrency limits, queue modes, and batch processing settings
 * for the Genie Studio ecosystem.
 * 
 * Last Updated: 2026-01-28
 */

// =============================================================================
// CONCURRENCY LIMITS
// =============================================================================
export const CONCURRENCY_CONFIG = {
  // Default concurrent processes (increased from 5)
  defaultConcurrency: 10,
  
  // Per-tier concurrency limits
  tierLimits: {
    free: 2,
    starter: 3,
    creator: 5,
    pro: 10,
    business: 20,
    enterprise: 50, // Custom for enterprise
  },
  
  // Per-operation type limits
  operationLimits: {
    videoGeneration: 3,      // GPU-intensive
    imageGeneration: 8,      // Moderate
    textGeneration: 15,      // Light
    ttsGeneration: 10,       // Moderate
    transcription: 5,        // CPU-intensive
    batchProcessing: 10,     // Default batch
    bulkUpload: 5,           // I/O heavy
    socialPublish: 3,        // Rate-limited by platforms
  },
  
  // n8n specific limits (does not block core pipelines)
  n8nLimits: {
    maxConcurrentWorkflows: 10,      // Increased from 5
    maxQueuedWorkflows: 100,         // Queue up to 100
    workflowTimeoutMs: 300000,       // 5 minutes
    retryAttempts: 3,
    retryDelayMs: 5000,
  },
} as const;

// =============================================================================
// QUEUE MODE CONFIGURATION
// =============================================================================
export const QUEUE_CONFIG = {
  // Default queue mode
  defaultMode: 'priority' as const,
  
  modes: {
    fifo: {
      name: 'First In, First Out',
      description: 'Process items in order received',
    },
    priority: {
      name: 'Priority Queue',
      description: 'Higher priority items processed first',
      priorityLevels: ['critical', 'high', 'normal', 'low'] as const,
    },
    fair: {
      name: 'Fair Share',
      description: 'Distribute processing fairly across users',
    },
    deadline: {
      name: 'Deadline-Based',
      description: 'Process items based on deadline urgency',
    },
  },
  
  // Queue limits
  maxQueueSize: 1000,
  maxItemsPerUser: 50,
  defaultTTLMinutes: 60,
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
  },
} as const;

// =============================================================================
// BATCH PROCESSING CONFIGURATION
// =============================================================================
export const BATCH_CONFIG = {
  // Maximum items per batch
  maxBatchSize: 100,
  
  // Default batch size by operation type
  defaultBatchSizes: {
    videoGeneration: 5,
    imageGeneration: 20,
    textGeneration: 50,
    ttsGeneration: 25,
    translation: 100,
    documentProcessing: 10,
    socialPublish: 10,
  },
  
  // Batch processing strategies
  strategies: {
    sequential: {
      name: 'Sequential',
      description: 'Process items one after another',
      useCase: 'Order-dependent operations',
    },
    parallel: {
      name: 'Parallel',
      description: 'Process items simultaneously up to concurrency limit',
      useCase: 'Independent operations, maximum throughput',
    },
    chunked: {
      name: 'Chunked',
      description: 'Process in chunks with pauses between',
      useCase: 'Rate-limited APIs, resource management',
      chunkSize: 10,
      pauseMs: 1000,
    },
    adaptive: {
      name: 'Adaptive',
      description: 'Dynamically adjust based on system load',
      useCase: 'Variable workloads, auto-scaling',
    },
  },
  
  // Progress reporting
  progressReporting: {
    intervalMs: 1000,
    detailedLogs: true,
    webhookNotifications: true,
  },
} as const;

// =============================================================================
// PROVIDER-SPECIFIC RATE LIMITS
// =============================================================================
export const PROVIDER_RATE_LIMITS = {
  openai: {
    requestsPerMinute: 500,
    tokensPerMinute: 90000,
    concurrentRequests: 10,
  },
  claude: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000,
    concurrentRequests: 5,
  },
  gemini: {
    // Paid Tier 3: Unlimited RPM/TPM (Generative Language API)
    requestsPerMinute: Infinity,
    tokensPerMinute: Infinity,
    concurrentRequests: 50,
    // Throttle still useful to avoid burst spikes on edge function side
    throttle: { enabled: true, delayMs: 200, maxQueueSize: 500 },
  },
  deepseek: {
    requestsPerMinute: 120,
    tokensPerMinute: 200000,
    concurrentRequests: 8,
  },
  alibaba: {
    requestsPerMinute: 100,
    tokensPerMinute: 150000,
    concurrentRequests: 5,
  },
  elevenlabs: {
    requestsPerMinute: 100,
    charactersPerMonth: 1000000,
    concurrentRequests: 5,
  },
  modelslab: {
    requestsPerMinute: 60,
    concurrentRequests: 3,
  },
  azure: {
    requestsPerMinute: 200,
    concurrentRequests: 10,
  },
  deepl: {
    requestsPerMinute: 30,
    charactersPerMonth: 500000,
    concurrentRequests: 3,
  },
} as const;

// =============================================================================
// N8N AUTOMATION CONFIGURATION
// =============================================================================
export const N8N_CONFIG = {
  // n8n is for general automation, NOT core AI pipelines
  usage: 'general-automation',
  
  // Core AI pipelines use Edge Functions (no n8n dependency)
  coreAIPipelines: 'edge-functions',
  
  // n8n integrations
  integrations: [
    'crm-sync',           // Salesforce, HubSpot
    'email-automation',   // Resend, SendGrid
    'calendar-sync',      // Google Calendar
    'file-sync',          // Google Drive, Dropbox
    'webhook-handlers',   // Custom webhooks
    'notification-flows', // Slack, Discord
  ],
  
  // Impact on Genie Studio
  impact: {
    coreOperations: 'NO IMPACT - Edge Functions handle all AI',
    automationTasks: 'Queue-based, async processing',
    fallback: 'Direct API calls if n8n unavailable',
  },
  
  // Recommended settings
  recommended: {
    maxConcurrent: 10,
    queueMode: 'priority',
    enableFallback: true,
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
export function getConcurrencyLimit(tier: keyof typeof CONCURRENCY_CONFIG.tierLimits): number {
  return CONCURRENCY_CONFIG.tierLimits[tier] || CONCURRENCY_CONFIG.defaultConcurrency;
}

export function getOperationLimit(operation: keyof typeof CONCURRENCY_CONFIG.operationLimits): number {
  return CONCURRENCY_CONFIG.operationLimits[operation] || CONCURRENCY_CONFIG.defaultConcurrency;
}

export function getBatchSize(operation: keyof typeof BATCH_CONFIG.defaultBatchSizes): number {
  return BATCH_CONFIG.defaultBatchSizes[operation] || 20;
}

export function getProviderRateLimit(provider: keyof typeof PROVIDER_RATE_LIMITS) {
  return PROVIDER_RATE_LIMITS[provider];
}

// =============================================================================
// TYPES
// =============================================================================
export type QueueMode = keyof typeof QUEUE_CONFIG.modes;
export type BatchStrategy = keyof typeof BATCH_CONFIG.strategies;
export type UserTier = keyof typeof CONCURRENCY_CONFIG.tierLimits;
export type OperationType = keyof typeof CONCURRENCY_CONFIG.operationLimits;
export type AIProvider = keyof typeof PROVIDER_RATE_LIMITS;
