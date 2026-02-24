/**
 * Comprehensive AI Model Configuration
 * Includes LLMs, Small Language Models, Vision Models, and MCP Servers
 * Specialized for Healthcare, Biotech, and Pharmaceutical use cases
 */

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  category: 'llm' | 'small' | 'vision' | 'mcp';
  subcategory?: string;
  description: string;
  capabilities: string[];
  specialization?: string[];
  available: boolean;
  fallbackModels?: string[];
  pricing?: 'low' | 'medium' | 'high';
  speed?: 'fast' | 'medium' | 'slow';
  context_window?: number;
}

export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  // === LLM Models ===
  'gpt-5-2025-08-07': {
    id: 'gpt-5-2025-08-07',
    name: 'GPT-5',
    provider: 'openai',
    category: 'llm',
    description: 'Most advanced OpenAI model with superior reasoning',
    capabilities: ['text', 'reasoning', 'analysis', 'code'],
    available: true,
    fallbackModels: ['gpt-4.1-2025-04-14', 'o3-2025-04-16'],
    pricing: 'high',
    speed: 'medium',
    context_window: 200000
  },
  'gpt-4.1-2025-04-14': {
    id: 'gpt-4.1-2025-04-14',
    name: 'GPT-4.1',
    provider: 'openai',
    category: 'llm',
    description: 'Reliable flagship GPT-4 model',
    capabilities: ['text', 'reasoning', 'analysis', 'code'],
    available: true,
    fallbackModels: ['o3-2025-04-16'],
    pricing: 'high',
    speed: 'medium',
    context_window: 128000
  },
  'o3-2025-04-16': {
    id: 'o3-2025-04-16',
    name: 'O3',
    provider: 'openai',
    category: 'llm',
    description: 'Powerful reasoning model for complex analysis',
    capabilities: ['reasoning', 'analysis', 'problem-solving'],
    available: true,
    pricing: 'high',
    speed: 'slow',
    context_window: 200000
  },
  'claude-opus-4-1-20250805': {
    id: 'claude-opus-4-1-20250805',
    name: 'Claude Opus 4.1',
    provider: 'claude',
    category: 'llm',
    description: 'Most capable Claude model with exceptional reasoning',
    capabilities: ['text', 'reasoning', 'analysis', 'writing'],
    available: true,
    fallbackModels: ['claude-sonnet-4-20250514'],
    pricing: 'high',
    speed: 'medium',
    context_window: 200000
  },
  'claude-sonnet-4-20250514': {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'claude',
    category: 'llm',
    description: 'High-performance Claude model with efficiency',
    capabilities: ['text', 'reasoning', 'analysis', 'writing'],
    available: true,
    fallbackModels: ['claude-3-5-sonnet-20241022'],
    pricing: 'medium',
    speed: 'fast',
    context_window: 200000
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    category: 'llm',
    description: 'Fast Gemini model with multimodal capabilities',
    capabilities: ['text', 'multimodal', 'reasoning', 'analysis'],
    available: true,
    fallbackModels: ['gemini-2.5-pro'],
    pricing: 'medium',
    speed: 'fast',
    context_window: 1048576
  },

  // === Small Language Models ===
  'gpt-5-mini-2025-08-07': {
    id: 'gpt-5-mini-2025-08-07',
    name: 'GPT-5 Mini',
    provider: 'openai',
    category: 'small',
    description: 'Efficient GPT-5 variant for fast processing',
    capabilities: ['text', 'reasoning', 'analysis'],
    available: true,
    fallbackModels: ['gpt-5-nano-2025-08-07', 'gpt-4o-mini'],
    pricing: 'low',
    speed: 'fast',
    context_window: 128000
  },
  'gpt-5-nano-2025-08-07': {
    id: 'gpt-5-nano-2025-08-07',
    name: 'GPT-5 Nano',
    provider: 'openai',
    category: 'small',
    description: 'Fastest GPT-5 variant for quick tasks',
    capabilities: ['text', 'summarization', 'classification'],
    available: true,
    fallbackModels: ['gpt-4o-mini'],
    pricing: 'low',
    speed: 'fast',
    context_window: 64000
  },
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    category: 'small',
    description: 'Fast Claude model for quick responses',
    capabilities: ['text', 'analysis', 'summarization'],
    available: true,
    pricing: 'low',
    speed: 'fast',
    context_window: 200000
  },

  // === Healthcare/Biotech Specialized Small Models ===
  'biomed-llama-7b': {
    id: 'biomed-llama-7b',
    name: 'BioMed Llama 7B',
    provider: 'specialized',
    category: 'small',
    subcategory: 'biotech',
    description: 'Specialized for biomedical text and research papers',
    capabilities: ['biomedical-text', 'research-analysis', 'literature-review'],
    specialization: ['biotech', 'research', 'publications'],
    available: true,
    pricing: 'low',
    speed: 'fast',
    context_window: 4096
  },
  'clinical-bert': {
    id: 'clinical-bert',
    name: 'Clinical BERT',
    provider: 'specialized',
    category: 'small',
    subcategory: 'healthcare',
    description: 'Clinical notes and medical text understanding',
    capabilities: ['clinical-text', 'medical-ner', 'clinical-classification'],
    specialization: ['clinical-notes', 'medical-records', 'healthcare'],
    available: true,
    pricing: 'low',
    speed: 'fast',
    context_window: 512
  },
  'pubmed-gpt': {
    id: 'pubmed-gpt',
    name: 'PubMed GPT',
    provider: 'specialized',
    category: 'small',
    subcategory: 'research',
    description: 'PubMed research and literature analysis',
    capabilities: ['literature-analysis', 'research-synthesis', 'citation-analysis'],
    specialization: ['pubmed', 'research', 'medical-literature'],
    available: true,
    pricing: 'low',
    speed: 'fast',
    context_window: 8192
  },
  'pharma-t5': {
    id: 'pharma-t5',
    name: 'Pharma T5',
    provider: 'specialized',
    category: 'small',
    subcategory: 'pharma',
    description: 'Pharmaceutical research and drug development',
    capabilities: ['drug-discovery', 'pharmaceutical-analysis', 'regulatory-text'],
    specialization: ['pharma', 'drug-development', 'regulatory'],
    available: true,
    pricing: 'low',
    speed: 'fast',
    context_window: 4096
  },
  'biotech-mistral-7b': {
    id: 'biotech-mistral-7b',
    name: 'Biotech Mistral 7B',
    provider: 'specialized',
    category: 'small',
    subcategory: 'biotech',
    description: 'Biotech workflows and regulatory compliance',
    capabilities: ['biotech-workflows', 'regulatory-compliance', 'clinical-trials'],
    specialization: ['biotech', 'regulatory', 'compliance'],
    available: true,
    pricing: 'low',
    speed: 'fast',
    context_window: 8192
  },

  // === Vision Models ===
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    category: 'vision',
    description: 'Multimodal GPT-4 with vision capabilities',
    capabilities: ['text', 'vision', 'image-analysis', 'multimodal'],
    available: true,
    fallbackModels: ['o4-mini-2025-04-16'],
    pricing: 'high',
    speed: 'medium',
    context_window: 128000
  },
  'o4-mini-2025-04-16': {
    id: 'o4-mini-2025-04-16',
    name: 'O4 Mini',
    provider: 'openai',
    category: 'vision',
    description: 'Fast reasoning model with vision support',
    capabilities: ['vision', 'reasoning', 'fast-analysis'],
    available: true,
    pricing: 'medium',
    speed: 'fast',
    context_window: 128000
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    category: 'vision',
    description: 'Current Gemini Pro model with vision capabilities and multimodal understanding',
    capabilities: ['vision', 'multimodal', 'large-context'],
    available: true,
    fallbackModels: ['gemini-2.5-flash', 'gpt-4o'],
    pricing: 'high',
    speed: 'medium',
    context_window: 2097152
  },

  // === Healthcare Vision Models ===
  'medical-imaging-vision': {
    id: 'medical-imaging-vision',
    name: 'Medical Imaging Vision',
    provider: 'healthcare',
    category: 'vision',
    subcategory: 'medical-imaging',
    description: 'Medical imaging analysis and diagnostics',
    capabilities: ['medical-imaging', 'diagnostic-analysis', 'radiology'],
    specialization: ['medical-imaging', 'diagnostics', 'radiology'],
    available: true,
    pricing: 'high',
    speed: 'medium',
    context_window: 32000
  },
  'radiology-ai-vision': {
    id: 'radiology-ai-vision',
    name: 'Radiology AI Vision',
    provider: 'healthcare',
    category: 'vision',
    subcategory: 'radiology',
    description: 'Radiology image interpretation and analysis',
    capabilities: ['radiology', 'image-interpretation', 'diagnostic-support'],
    specialization: ['radiology', 'medical-imaging', 'diagnostics'],
    available: true,
    pricing: 'high',
    speed: 'medium',
    context_window: 16000
  },
  'pathology-vision-pro': {
    id: 'pathology-vision-pro',
    name: 'Pathology Vision Pro',
    provider: 'healthcare',
    category: 'vision',
    subcategory: 'pathology',
    description: 'Pathology slide analysis and interpretation',
    capabilities: ['pathology', 'histology', 'microscopy-analysis'],
    specialization: ['pathology', 'histology', 'microscopy'],
    available: true,
    pricing: 'high',
    speed: 'slow',
    context_window: 64000
  },

  // === MCP Servers - Healthcare ===
  'healthcare-ai-mcp-server': {
    id: 'healthcare-ai-mcp-server',
    name: 'Healthcare AI MCP',
    provider: 'healthcare',
    category: 'mcp',
    subcategory: 'general-healthcare',
    description: 'General healthcare AI and clinical support',
    capabilities: ['clinical-support', 'patient-records', 'medical-guidelines'],
    specialization: ['healthcare', 'clinical-support', 'general-medical'],
    available: true,
    pricing: 'medium',
    speed: 'fast'
  },
  'biomcp-biotech-pharma-server': {
    id: 'biomcp-biotech-pharma-server',
    name: 'BioMCP Biotech/Pharma',
    provider: 'biotech',
    category: 'mcp',
    subcategory: 'biotech-pharma',
    description: 'Biotech/pharma workflows with regulatory compliance',
    capabilities: ['biotech-workflows', 'pharma-compliance', 'clinical-trials', 'regulatory'],
    specialization: ['biotech', 'pharma', 'regulatory', 'compliance'],
    available: true,
    pricing: 'high',
    speed: 'medium'
  },
  'adk-healthcare-agent-server': {
    id: 'adk-healthcare-agent-server',
    name: 'Healthcare Agent Development Kit',
    provider: 'healthcare',
    category: 'mcp',
    subcategory: 'agent-development',
    description: 'Healthcare agent development kit with speech capabilities',
    capabilities: ['agent-development', 'speech-processing', 'conversation-management'],
    specialization: ['agent-development', 'speech', 'conversation'],
    available: true,
    pricing: 'medium',
    speed: 'fast'
  },
  'healthcare-database-mcp-server': {
    id: 'healthcare-database-mcp-server',
    name: 'Healthcare Database MCP',
    provider: 'healthcare',
    category: 'mcp',
    subcategory: 'database',
    description: 'Healthcare database access with HIPAA compliance',
    capabilities: ['database-access', 'hipaa-compliance', 'patient-data'],
    specialization: ['database', 'hipaa', 'compliance'],
    available: true,
    pricing: 'medium',
    speed: 'fast'
  },

  // === MCP Servers - Biotech Specialized ===
  'genomics-mcp-server': {
    id: 'genomics-mcp-server',
    name: 'Genomics MCP',
    provider: 'biotech',
    category: 'mcp',
    subcategory: 'genomics',
    description: 'Genomics data analysis and personalized medicine',
    capabilities: ['genomics-analysis', 'personalized-medicine', 'variant-analysis'],
    specialization: ['genomics', 'personalized-medicine', 'variants'],
    available: true,
    pricing: 'high',
    speed: 'medium'
  },
  'clinical-trials-mcp': {
    id: 'clinical-trials-mcp',
    name: 'Clinical Trials MCP',
    provider: 'biotech',
    category: 'mcp',
    subcategory: 'clinical-trials',
    description: 'Clinical trial management and patient matching',
    capabilities: ['trial-management', 'patient-matching', 'enrollment'],
    specialization: ['clinical-trials', 'patient-matching', 'enrollment'],
    available: true,
    pricing: 'high',
    speed: 'medium'
  },
  'regulatory-compliance-mcp': {
    id: 'regulatory-compliance-mcp',
    name: 'Regulatory Compliance MCP',
    provider: 'biotech',
    category: 'mcp',
    subcategory: 'regulatory',
    description: 'FDA/EMA/PMDA regulatory compliance checking',
    capabilities: ['regulatory-compliance', 'fda-compliance', 'ema-compliance'],
    specialization: ['regulatory', 'fda', 'ema', 'pmda'],
    available: true,
    pricing: 'high',
    speed: 'fast'
  },
  'adverse-events-mcp': {
    id: 'adverse-events-mcp',
    name: 'Adverse Events MCP',
    provider: 'biotech',
    category: 'mcp',
    subcategory: 'safety',
    description: 'Adverse event monitoring and reporting',
    capabilities: ['adverse-event-monitoring', 'safety-reporting', 'pharmacovigilance'],
    specialization: ['adverse-events', 'safety', 'pharmacovigilance'],
    available: true,
    pricing: 'high',
    speed: 'fast'
  },

  // === MCP Servers - Pharma Specialized ===
  'drug-discovery-mcp': {
    id: 'drug-discovery-mcp',
    name: 'Drug Discovery MCP',
    provider: 'pharma',
    category: 'mcp',
    subcategory: 'drug-discovery',
    description: 'Drug discovery and development workflows',
    capabilities: ['drug-discovery', 'compound-analysis', 'target-identification'],
    specialization: ['drug-discovery', 'compounds', 'targets'],
    available: true,
    pricing: 'high',
    speed: 'medium'
  },
  'pharmacovigilance-mcp': {
    id: 'pharmacovigilance-mcp',
    name: 'Pharmacovigilance MCP',
    provider: 'pharma',
    category: 'mcp',
    subcategory: 'safety',
    description: 'Post-market drug safety monitoring',
    capabilities: ['safety-monitoring', 'signal-detection', 'risk-assessment'],
    specialization: ['pharmacovigilance', 'safety', 'risk-assessment'],
    available: true,
    pricing: 'high',
    speed: 'fast'
  },
  'regulatory-affairs-mcp': {
    id: 'regulatory-affairs-mcp',
    name: 'Regulatory Affairs MCP',
    provider: 'pharma',
    category: 'mcp',
    subcategory: 'regulatory',
    description: 'Pharmaceutical regulatory affairs and submissions',
    capabilities: ['regulatory-submissions', 'approval-tracking', 'compliance-monitoring'],
    specialization: ['regulatory-affairs', 'submissions', 'approvals'],
    available: true,
    pricing: 'high',
    speed: 'medium'
  },
  'manufacturing-mcp': {
    id: 'manufacturing-mcp',
    name: 'Manufacturing MCP',
    provider: 'pharma',
    category: 'mcp',
    subcategory: 'manufacturing',
    description: 'Pharmaceutical manufacturing and quality control',
    capabilities: ['manufacturing-support', 'quality-control', 'batch-tracking'],
    specialization: ['manufacturing', 'quality-control', 'batch-tracking'],
    available: true,
    pricing: 'medium',
    speed: 'fast'
  }
};

// Helper functions
export const getModelsByCategory = (category: 'llm' | 'small' | 'vision' | 'mcp') => {
  return Object.values(MODEL_REGISTRY).filter(model => model.category === category);
};

export const getModelsByProvider = (provider: string) => {
  return Object.values(MODEL_REGISTRY).filter(model => model.provider === provider);
};

export const getModelsBySpecialization = (specialization: string) => {
  return Object.values(MODEL_REGISTRY).filter(model => 
    model.specialization?.includes(specialization)
  );
};

export const getAvailableModels = () => {
  return Object.values(MODEL_REGISTRY).filter(model => model.available);
};

export const getFallbackModels = (modelId: string): ModelInfo[] => {
  const model = MODEL_REGISTRY[modelId];
  if (!model?.fallbackModels) return [];
  
  return model.fallbackModels
    .map(id => MODEL_REGISTRY[id])
    .filter(Boolean);
};

export const getModelInfo = (modelId: string): ModelInfo | undefined => {
  return MODEL_REGISTRY[modelId];
};