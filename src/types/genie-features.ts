/**
 * GENIE MODULAR FEATURES SYSTEM
 * Comprehensive feature definitions for configurable Genie agents
 */

export type GenieFeatureCategory = 
  | 'ai_architecture'
  | 'conversation'
  | 'healthcare'
  | 'infrastructure'
  | 'integration'
  | 'security'
  | 'advanced';

export interface GenieFeature {
  id: string;
  name: string;
  description: string;
  category: GenieFeatureCategory;
  enabled: boolean;
  dependencies?: string[]; // IDs of required features
  config?: Record<string, any>;
  icon?: string;
  isPremium?: boolean;
}

export interface GenieFeatureConfig {
  // AI Architecture Features
  multiModelIntelligence?: {
    enabled: boolean;
    models: {
      gemini_pro?: boolean;
      gemini_flash?: boolean;
      gemini_lite?: boolean;
      gpt5?: boolean;
      gpt5_mini?: boolean;
      gpt5_nano?: boolean;
    };
    intelligentRouting?: boolean;
    contextAwareOptimization?: boolean;
  };

  rag?: {
    enabled: boolean;
    knowledgeBaseIds?: string[];
    vectorSearch?: boolean;
    dynamicContextSwitching?: boolean;
    realtimeUpdates?: boolean;
    hierarchicalManagement?: boolean;
  };

  // Conversation Features
  splitScreenConversation?: {
    enabled: boolean;
    dualThreads?: boolean;
    parallelProcessing?: boolean;
  };

  conversationManagement?: {
    enabled: boolean;
    sessionPersistence?: boolean;
    historySearch?: boolean;
    exportCapabilities?: boolean;
    sharingCollaboration?: boolean;
  };

  // Healthcare Features
  clinicalKnowledge?: {
    enabled: boolean;
    medicalTerminology?: boolean;
    clinicalGuidelines?: boolean;
    drugInteractionChecking?: boolean;
    symptomAnalysis?: boolean;
  };

  complianceSecurity?: {
    enabled: boolean;
    hipaaCompliant?: boolean;
    dataPrivacy?: boolean;
    auditTrail?: boolean;
    roleBasedAccess?: boolean;
  };

  patientSupport?: {
    enabled: boolean;
    availability24_7?: boolean;
    multiLanguage?: boolean;
    emotionalSupport?: boolean;
    educationalContent?: boolean;
  };

  // Infrastructure Features
  edgeFunctions?: {
    enabled: boolean;
    aiProcessor?: boolean;
    rateLimiter?: boolean;
    streamingResponses?: boolean;
  };

  database?: {
    enabled: boolean;
    conversationStorage?: boolean;
    userPreferences?: boolean;
    analyticsTracking?: boolean;
    performanceMonitoring?: boolean;
  };

  // Integration Features
  apiIntegration?: {
    enabled: boolean;
    externalSystems?: boolean;
    webhookSupport?: boolean;
    thirdPartyServices?: boolean;
    dataExportImport?: boolean;
  };

  whatsappIntegration?: {
    enabled: boolean;
    locationAwareWorkflows?: boolean;
    voiceTextConversion?: boolean;
    n8nAutomation?: boolean;
    twilioAPI?: boolean;
  };

  // Advanced Capabilities
  contextManagement?: {
    enabled: boolean;
    knowledgeDomains?: string[];
    intentRecognition?: boolean;
    sentimentAnalysis?: boolean;
    followUpGeneration?: boolean;
    personalization?: boolean;
  };

  voiceConversation?: {
    enabled: boolean;
    speechToText?: boolean;
    textToSpeech?: boolean;
    multimodalSupport?: boolean;
  };

  // Security Features
  advancedSecurity?: {
    enabled: boolean;
    endToEndEncryption?: boolean;
    rateLimiting?: boolean;
    contentFiltering?: boolean;
    complianceMonitoring?: boolean;
  };

  // Analytics & Monitoring
  analytics?: {
    enabled: boolean;
    usageMonitoring?: boolean;
    performanceMetrics?: boolean;
    userBehaviorAnalysis?: boolean;
    costOptimization?: boolean;
  };
}

export const GENIE_FEATURE_CATALOG: GenieFeature[] = [
  // AI Architecture
  {
    id: 'multi_model_intelligence',
    name: 'Multi-Model Intelligence',
    description: 'Google Gemini and OpenAI GPT integration with intelligent routing',
    category: 'ai_architecture',
    enabled: true,
    icon: 'Brain',
  },
  {
    id: 'advanced_rag',
    name: 'Advanced RAG System',
    description: '80+ specialized knowledge contexts with vector search',
    category: 'ai_architecture',
    enabled: true,
    icon: 'Database',
  },

  // Conversation Features
  {
    id: 'split_screen_conversation',
    name: 'Split-Screen Conversation',
    description: 'Dual conversation threads for parallel discussions',
    category: 'conversation',
    enabled: false,
    icon: 'MessageSquare',
    isPremium: true,
  },
  {
    id: 'conversation_management',
    name: 'Conversation Management',
    description: 'Session persistence, history, and export capabilities',
    category: 'conversation',
    enabled: true,
    icon: 'FolderOpen',
  },
  {
    id: 'streaming_responses',
    name: 'Streaming Responses',
    description: 'Real-time token-by-token response streaming',
    category: 'conversation',
    enabled: true,
    icon: 'Zap',
  },

  // Healthcare Features
  {
    id: 'clinical_knowledge',
    name: 'Clinical Knowledge Integration',
    description: 'Medical terminology, guidelines, and drug interactions',
    category: 'healthcare',
    enabled: true,
    icon: 'Heart',
  },
  {
    id: 'hipaa_compliance',
    name: 'HIPAA Compliance',
    description: 'Healthcare data protection and audit trails',
    category: 'healthcare',
    enabled: true,
    icon: 'Shield',
  },
  {
    id: 'patient_support',
    name: 'Patient Support Features',
    description: '24/7 availability, multi-language, emotional support',
    category: 'healthcare',
    enabled: true,
    icon: 'Users',
  },
  {
    id: 'patient_onboarding',
    name: 'Patient Onboarding Flow',
    description: 'Conversational AI-powered patient enrollment and onboarding',
    category: 'healthcare',
    enabled: true,
    icon: 'UserPlus',
  },

  // Infrastructure
  {
    id: 'edge_functions',
    name: 'Edge Functions',
    description: 'Serverless AI processing and rate limiting',
    category: 'infrastructure',
    enabled: true,
    icon: 'Server',
  },
  {
    id: 'database_architecture',
    name: 'Database Architecture',
    description: 'Conversation storage and analytics tracking',
    category: 'infrastructure',
    enabled: true,
    icon: 'Database',
  },
  {
    id: 'performance_optimization',
    name: 'Performance Optimization',
    description: 'Sub-second responses with auto-scaling',
    category: 'infrastructure',
    enabled: true,
    icon: 'Gauge',
  },

  // Integration
  {
    id: 'api_integration',
    name: 'API Integration',
    description: 'External systems, webhooks, and third-party services',
    category: 'integration',
    enabled: true,
    icon: 'Plug',
  },
  {
    id: 'whatsapp_integration',
    name: 'WhatsApp Integration',
    description: 'Location-aware workflows with Twilio API',
    category: 'integration',
    enabled: false,
    icon: 'MessageCircle',
    dependencies: ['patient_onboarding'],
    isPremium: true,
  },
  {
    id: 'mcp_integration',
    name: 'MCP Integration',
    description: 'Model Context Protocol for advanced agent capabilities',
    category: 'integration',
    enabled: false,
    icon: 'Layers',
    isPremium: true,
  },

  // Advanced Capabilities
  {
    id: 'context_management',
    name: 'Advanced Context Management',
    description: 'Intent recognition, sentiment analysis, personalization',
    category: 'advanced',
    enabled: true,
    icon: 'Brain',
  },
  {
    id: 'voice_conversation',
    name: 'Voice Conversation',
    description: 'Speech-to-text and text-to-speech capabilities',
    category: 'advanced',
    enabled: false,
    icon: 'Mic',
    isPremium: true,
  },
  {
    id: 'multimodal_support',
    name: 'Multimodal Support',
    description: 'Image and document analysis capabilities',
    category: 'advanced',
    enabled: false,
    icon: 'Image',
    isPremium: true,
  },

  // Security
  {
    id: 'advanced_security',
    name: 'Advanced Security',
    description: 'End-to-end encryption and content filtering',
    category: 'security',
    enabled: true,
    icon: 'Lock',
  },
  {
    id: 'rate_limiting',
    name: 'Rate Limiting',
    description: 'Usage control and abuse prevention',
    category: 'security',
    enabled: true,
    icon: 'Shield',
  },
];

export const getFeaturesByCategory = (category: GenieFeatureCategory): GenieFeature[] => {
  return GENIE_FEATURE_CATALOG.filter(f => f.category === category);
};

export const getEnabledFeatures = (features: GenieFeature[]): GenieFeature[] => {
  return features.filter(f => f.enabled);
};

export const validateFeatureDependencies = (
  selectedFeatures: string[],
  catalog: GenieFeature[] = GENIE_FEATURE_CATALOG
): { valid: boolean; missingDependencies: string[] } => {
  const missingDependencies: string[] = [];

  for (const featureId of selectedFeatures) {
    const feature = catalog.find(f => f.id === featureId);
    if (feature?.dependencies) {
      for (const depId of feature.dependencies) {
        if (!selectedFeatures.includes(depId)) {
          missingDependencies.push(depId);
        }
      }
    }
  }

  return {
    valid: missingDependencies.length === 0,
    missingDependencies: [...new Set(missingDependencies)],
  };
};
