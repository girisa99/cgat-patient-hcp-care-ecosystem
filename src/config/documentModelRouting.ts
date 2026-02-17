/**
 * DOCUMENT MODEL ROUTING CONFIGURATION
 * Intelligent AI model selection for document processing
 * Based on: docs/DOCUMENT_TYPE_NLP_ROUTING_STRATEGY.md
 */

export type AIProvider = 'claude' | 'gemini' | 'openai';
export type PipelineType = 'single' | 'sequential-hybrid';

export interface ModelCapability {
  strengths: string[];
  categories: string[];
  contentPatterns: RegExp[];
  scoreWeight: number;
}

export interface DocumentAIConfig {
  primaryModel: AIProvider;
  fallbackChain: AIProvider[];
  pipelineType: PipelineType;
  stage2Model?: AIProvider; // For hybrid pipelines (e.g., Gemini Vision → Claude Clinical)
  timeoutMs: number;
  minConfidence: number;
  maxRetries: number;
}

export interface ModelSelectionResult {
  selectedModel: AIProvider;
  reason: 'explicit_config' | 'category_default' | 'content_analysis' | 'fallback';
  confidence: number;
  fallbackChain: AIProvider[];
  pipelineType: PipelineType;
  stage2Model?: AIProvider;
}

// ============= MODEL CAPABILITIES =============
// Each model's strengths for intelligent routing

export const MODEL_CAPABILITIES: Record<AIProvider, ModelCapability> = {
  claude: {
    strengths: [
      'clinical_reasoning',
      'medical_terminology', 
      'policy_analysis',
      'drug_interactions',
      'therapeutic_alternatives',
      'coverage_analysis'
    ],
    categories: ['healthcare'],
    contentPatterns: [
      /prescription|rx\b|medication|drug|dosage|refill/i,
      /diagnosis|icd-?10|clinical|patient|allergy|contraindication/i,
      /coverage|deductible|copay|coinsurance|insurance|policy|benefit/i,
      /ndc|dea|npi|prescriber|pharmacy/i,
      /prior\s*auth|formulary|therapeutic/i
    ],
    scoreWeight: 1.5 // Higher weight for clinical content
  },
  openai: {
    strengths: [
      'table_extraction',
      'financial_calculations',
      'structured_data',
      'code_recognition',
      'numerical_accuracy'
    ],
    categories: ['financial', 'business'],
    contentPatterns: [
      /invoice|billing|claim|statement|balance|payment/i,
      /cpt|hcpcs|revenue\s*code|modifier/i,
      /total|amount|subtotal|tax|\$[\d,]+\.?\d*/i,
      /billed|allowed|adjustment|paid|due/i,
      /line\s*item|quantity|unit\s*price|discount/i,
      /remittance|era|eob|denial|aging/i
    ],
    scoreWeight: 1.3
  },
  gemini: {
    strengths: [
      'vision_analysis',
      'handwriting_recognition',
      'form_fields',
      'image_understanding',
      'speed',
      'multimodal'
    ],
    categories: ['identity', 'medical-imaging', 'general'],
    contentPatterns: [
      /form|checkbox|signature|handwritten/i,
      /x-?ray|ct\s*scan|mri|ultrasound|dicom|ecg|ekg/i,
      /radiology|imaging|modality|anatomical/i,
      /passport|license|id\s*card|photo/i,
      /scan|uploaded|image|photo/i
    ],
    scoreWeight: 1.2
  }
};

// ============= CATEGORY DEFAULTS =============
// Default model for each document category - All use sequential-hybrid (OCR → NLP)

export const CATEGORY_MODEL_DEFAULTS: Record<string, DocumentAIConfig> = {
  'healthcare': {
    primaryModel: 'claude',
    fallbackChain: ['gemini', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude', // OCR → Claude Clinical
    timeoutMs: 30000,
    minConfidence: 0.7,
    maxRetries: 2
  },
  'medical-imaging': {
    primaryModel: 'gemini',
    fallbackChain: ['claude'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude', // Gemini Vision → Claude Clinical
    timeoutMs: 45000,
    minConfidence: 0.6,
    maxRetries: 2
  },
  'financial': {
    primaryModel: 'openai',
    fallbackChain: ['claude', 'gemini'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'openai', // OCR → OpenAI for tables
    timeoutMs: 30000,
    minConfidence: 0.75,
    maxRetries: 2
  },
  'identity': {
    primaryModel: 'gemini',
    fallbackChain: ['claude', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'gemini', // OCR → Gemini Vision
    timeoutMs: 25000,
    minConfidence: 0.7,
    maxRetries: 2
  },
  'business': {
    primaryModel: 'openai',
    fallbackChain: ['claude', 'gemini'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'openai', // OCR → OpenAI
    timeoutMs: 30000,
    minConfidence: 0.7,
    maxRetries: 2
  },
  'general': {
    primaryModel: 'gemini',
    fallbackChain: ['claude', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'gemini', // OCR → Gemini
    timeoutMs: 25000,
    minConfidence: 0.6,
    maxRetries: 2
  }
};

// ============= EXPLICIT DOCUMENT TYPE CONFIGS =============
// Specific model assignments per document type (from strategy doc)

export const DOCUMENT_TYPE_AI_CONFIGS: Record<string, DocumentAIConfig> = {
  // Healthcare - Claude for clinical reasoning (OCR → Claude hybrid)
  'prescription': {
    primaryModel: 'claude',
    fallbackChain: ['gemini', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 30000,
    minConfidence: 0.8,
    maxRetries: 2
  },
  'prescription_form': {
    primaryModel: 'claude',
    fallbackChain: ['gemini', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 30000,
    minConfidence: 0.8,
    maxRetries: 2
  },
  'insurance': {
    primaryModel: 'claude',
    fallbackChain: ['gemini', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 30000,
    minConfidence: 0.75,
    maxRetries: 2
  },
  'lab-results': {
    primaryModel: 'claude',
    fallbackChain: ['gemini', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 30000,
    minConfidence: 0.75,
    maxRetries: 2
  },
  'lab_result': {
    primaryModel: 'claude',
    fallbackChain: ['gemini', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 30000,
    minConfidence: 0.75,
    maxRetries: 2
  },
  'patient-onboarding': {
    primaryModel: 'gemini',
    fallbackChain: ['claude', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'gemini',
    timeoutMs: 25000,
    minConfidence: 0.7,
    maxRetries: 2
  },

  // Medical Imaging - Gemini Vision → Claude Clinical (Sequential Hybrid)
  'medical_imaging': {
    primaryModel: 'gemini',
    fallbackChain: ['claude'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 45000,
    minConfidence: 0.6,
    maxRetries: 2
  },
  'xray': {
    primaryModel: 'gemini',
    fallbackChain: ['claude'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 45000,
    minConfidence: 0.6,
    maxRetries: 2
  },
  'ct-scan': {
    primaryModel: 'gemini',
    fallbackChain: ['claude'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 45000,
    minConfidence: 0.6,
    maxRetries: 2
  },
  'mri': {
    primaryModel: 'gemini',
    fallbackChain: ['claude'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 45000,
    minConfidence: 0.6,
    maxRetries: 2
  },
  'ecg': {
    primaryModel: 'gemini',
    fallbackChain: ['claude'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 40000,
    minConfidence: 0.6,
    maxRetries: 2
  },
  'ultrasound': {
    primaryModel: 'gemini',
    fallbackChain: ['claude'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'claude',
    timeoutMs: 45000,
    minConfidence: 0.6,
    maxRetries: 2
  },

  // Financial - OpenAI for tables/calculations (OCR → OpenAI hybrid)
  'invoice': {
    primaryModel: 'openai',
    fallbackChain: ['claude', 'gemini'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'openai',
    timeoutMs: 30000,
    minConfidence: 0.8,
    maxRetries: 2
  },
  'receipt': {
    primaryModel: 'openai',
    fallbackChain: ['gemini', 'claude'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'openai',
    timeoutMs: 25000,
    minConfidence: 0.7,
    maxRetries: 2
  },

  // Identity - Gemini for vision/OCR (OCR → Gemini hybrid)
  'passport': {
    primaryModel: 'gemini',
    fallbackChain: ['claude', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'gemini',
    timeoutMs: 25000,
    minConfidence: 0.8,
    maxRetries: 2
  },
  'drivers-license': {
    primaryModel: 'gemini',
    fallbackChain: ['claude', 'openai'],
    pipelineType: 'sequential-hybrid',
    stage2Model: 'gemini',
    timeoutMs: 25000,
    minConfidence: 0.8,
    maxRetries: 2
  }
};

// ============= FALLBACK CHAIN DEFINITIONS =============

export const FALLBACK_CHAINS: Record<string, AIProvider[]> = {
  'prescription': ['claude', 'gemini', 'openai'],
  'medical_imaging': ['gemini', 'claude'],
  'insurance': ['claude', 'gemini', 'openai'],
  'invoice': ['openai', 'claude', 'gemini'],
  'patient_form': ['gemini', 'claude', 'openai'],
  'default': ['gemini', 'claude', 'openai']
};

// ============= MODEL SELECTION ALGORITHM =============

/**
 * Calculate content-based model scores
 */
export function calculateModelScores(content: string): { 
  scores: Record<AIProvider, number>;
  winner: AIProvider | null;
  confidence: number;
} {
  const scores: Record<AIProvider, number> = {
    claude: 0,
    openai: 0,
    gemini: 0
  };

  // Score each model based on content pattern matches
  for (const [provider, capability] of Object.entries(MODEL_CAPABILITIES)) {
    const providerKey = provider as AIProvider;
    let matchCount = 0;
    
    for (const pattern of capability.contentPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matchCount += matches.length;
      }
    }
    
    scores[providerKey] = matchCount * capability.scoreWeight;
  }

  // Determine winner
  const maxScore = Math.max(...Object.values(scores));
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  
  if (maxScore === 0) {
    return { scores, winner: null, confidence: 0 };
  }

  const winner = (Object.entries(scores).find(([_, s]) => s === maxScore)?.[0] || null) as AIProvider | null;
  const confidence = totalScore > 0 ? maxScore / totalScore : 0;

  return { scores, winner, confidence };
}

/**
 * Select the best AI model for a document
 */
export function selectBestModel(
  documentTypeId: string,
  documentCategory: string,
  documentContent?: string
): ModelSelectionResult {
  // 1. Check for explicit document type config
  const explicitConfig = DOCUMENT_TYPE_AI_CONFIGS[documentTypeId];
  if (explicitConfig) {
    return {
      selectedModel: explicitConfig.primaryModel,
      reason: 'explicit_config',
      confidence: 1.0,
      fallbackChain: explicitConfig.fallbackChain,
      pipelineType: explicitConfig.pipelineType,
      stage2Model: explicitConfig.stage2Model
    };
  }

  // 2. Content-based analysis (if content available)
  if (documentContent && documentContent.length > 50) {
    const { winner, confidence } = calculateModelScores(documentContent);
    if (winner && confidence >= 0.6) {
      const categoryConfig = CATEGORY_MODEL_DEFAULTS[documentCategory] || CATEGORY_MODEL_DEFAULTS['general'];
      return {
        selectedModel: winner,
        reason: 'content_analysis',
        confidence,
        fallbackChain: categoryConfig.fallbackChain.filter(m => m !== winner),
        pipelineType: categoryConfig.pipelineType,
        stage2Model: categoryConfig.stage2Model
      };
    }
  }

  // 3. Fall back to category default
  const categoryConfig = CATEGORY_MODEL_DEFAULTS[documentCategory] || CATEGORY_MODEL_DEFAULTS['general'];
  return {
    selectedModel: categoryConfig.primaryModel,
    reason: 'category_default',
    confidence: 0.8,
    fallbackChain: categoryConfig.fallbackChain,
    pipelineType: categoryConfig.pipelineType,
    stage2Model: categoryConfig.stage2Model
  };
}

/**
 * Get the next fallback model from the chain
 */
export function getNextFallback(
  currentModel: AIProvider,
  fallbackChain: AIProvider[],
  triedModels: AIProvider[]
): AIProvider | null {
  const allTried = new Set([currentModel, ...triedModels]);
  
  for (const model of fallbackChain) {
    if (!allTried.has(model)) {
      return model;
    }
  }
  
  return null;
}

/**
 * Get AI config for a document type
 */
export function getDocumentAIConfig(documentTypeId: string, category: string): DocumentAIConfig {
  // Check explicit config first
  if (DOCUMENT_TYPE_AI_CONFIGS[documentTypeId]) {
    return DOCUMENT_TYPE_AI_CONFIGS[documentTypeId];
  }
  
  // Fall back to category default
  return CATEGORY_MODEL_DEFAULTS[category] || CATEGORY_MODEL_DEFAULTS['general'];
}

/**
 * Check if a model is available (has API key configured)
 * This is a placeholder - actual check happens in edge function
 */
export function isModelAvailable(model: AIProvider): boolean {
  // This will be validated at runtime in the edge function
  return true;
}

// ============= PROMPT TEMPLATES BY MODEL =============

export const MODEL_SYSTEM_PROMPTS: Record<AIProvider, string> = {
  claude: `You are a clinical document analysis expert specializing in healthcare documentation. 
Extract all relevant medical information with high accuracy. 
Pay special attention to: medications, dosages, diagnoses, patient identifiers, and clinical recommendations.
Always validate NDC codes, NPI numbers, and DEA numbers when present.
Provide therapeutic alternatives and drug interaction warnings when applicable.`,

  openai: `You are a financial document extraction specialist.
Extract all structured data from invoices, claims, and billing documents with precision.
Pay special attention to: line items, CPT/HCPCS codes, amounts, totals, and payment information.
Validate calculations and identify any discrepancies.
Format currency values consistently and extract all relevant codes.`,

  gemini: `You are a multimodal document analysis expert.
Extract information from forms, images, and identity documents with high accuracy.
Pay special attention to: handwritten text, form fields, checkboxes, signatures, and photo IDs.
For medical imaging, identify modality, anatomical regions, and visual findings.
Provide structured output with confidence scores for each extracted field.`
};

// ============= LOGGING HELPERS =============

export function logModelSelection(result: ModelSelectionResult, documentTypeId: string): void {
  console.log(`[ModelRouting] Document: ${documentTypeId}`);
  console.log(`[ModelRouting] Selected: ${result.selectedModel} (${result.reason})`);
  console.log(`[ModelRouting] Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`[ModelRouting] Pipeline: ${result.pipelineType}`);
  if (result.stage2Model) {
    console.log(`[ModelRouting] Stage 2: ${result.stage2Model}`);
  }
  console.log(`[ModelRouting] Fallbacks: ${result.fallbackChain.join(' → ')}`);
}
