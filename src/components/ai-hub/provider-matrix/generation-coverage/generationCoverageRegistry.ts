/**
 * Generation Coverage Registry
 * 
 * Links existing constants to AI capabilities with bidirectional mapping.
 * This is the single source of truth for Context ↔ Capability relationships.
 */

import { FeatureCategory, ProviderId } from '../types';
import { 
  ContextToCapabilityMapping, 
  CapabilityToContextMapping,
  IndustryId,
  FrameworkId,
  VisualFeatureId,
  OutputFormatId,
  ModelType
} from './types';

// ==========================================
// INDUSTRY → CAPABILITY MAPPINGS
// ==========================================

export const INDUSTRY_CAPABILITY_MAPPINGS: ContextToCapabilityMapping[] = [
  {
    contextType: 'industry',
    contextId: 'healthcare',
    contextName: 'Healthcare',
    requiredFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', priority: 'critical' },
      { featureId: 'document_upload', category: 'INPUT', priority: 'critical' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
      { featureId: 'tts', category: 'VOICE', priority: 'recommended' },
      { featureId: 'multi_language_voice', category: 'VOICE', priority: 'optional' },
    ],
    recommendedProviders: {
      text: [
        { providers: ['openai', 'claude'], reason: 'HIPAA-aware, high accuracy for medical terminology' },
        { providers: ['azure'], reason: 'Enterprise compliance (SOC2, HIPAA)' }
      ],
      image: [
        { providers: ['stability', 'modelslab'], reason: 'Medical illustration support' }
      ],
      voice: [
        { providers: ['elevenlabs', 'azure'], reason: 'Professional narration quality' }
      ],
      translation: [
        { providers: ['deepl', 'azure'], reason: 'Medical terminology accuracy' }
      ]
    },
    recommendedModels: [
      { type: 'text', modelIds: ['gpt-5', 'claude-3.5'], reason: 'Medical accuracy', tier: 3 },
      { type: 'image', modelIds: ['flux-pro', 'stability-core'], reason: 'Clinical visuals', tier: 2 },
      { type: 'voice', modelIds: ['elevenlabs', 'azure-neural'], reason: 'Professional TTS', tier: 2 }
    ],
    compatibleWith: {
      frameworks: ['patient-journey', 'value-based-care', 'hipaa-compliance'],
      templates: ['training-manual', 'case-study', 'research-report'],
      visuals: ['journey-maps', 'timelines', 'diagrams', 'infographics'],
      outputs: ['pdf-export', 'pptx-export', 'video-full', 'interactive']
    },
    constraints: [
      { contextType: 'visual', contextId: 'ar-elements', severity: 'warning', reason: 'AR requires patient consent workflows' }
    ],
    scenarios: ['Patient education', 'Clinical training', 'Care pathway documentation', 'Compliance reporting'],
    useCases: ['Hospital presentations', 'Medical device demos', 'HCP training', 'Patient onboarding']
  },
  {
    contextType: 'industry',
    contextId: 'finance',
    contextName: 'Finance & Banking',
    requiredFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', priority: 'critical' },
      { featureId: 'document_upload', category: 'INPUT', priority: 'critical' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
      { featureId: 'brand_voice', category: 'SCRIPT', priority: 'recommended' },
    ],
    recommendedProviders: {
      text: [
        { providers: ['openai', 'claude'], reason: 'Financial analysis accuracy' },
        { providers: ['azure'], reason: 'Enterprise security requirements' }
      ],
      image: [
        { providers: ['modelslab', 'stability'], reason: 'Corporate professional imagery' }
      ],
      voice: [
        { providers: ['elevenlabs'], reason: 'Authoritative professional voice' }
      ]
    },
    recommendedModels: [
      { type: 'text', modelIds: ['gpt-5', 'claude-3.5'], reason: 'Financial precision', tier: 3 },
      { type: 'image', modelIds: ['flux-pro', 'dall-e-3'], reason: 'Professional charts', tier: 2 }
    ],
    compatibleWith: {
      frameworks: ['risk-assessment', 'regulatory', 'competitive-analysis'],
      templates: ['investor-update', 'board-deck', 'quarterly-review', 'annual-report'],
      visuals: ['charts', 'data-tables', 'infographics'],
      outputs: ['pdf-export', 'pptx-export', 'print-ready']
    },
    constraints: [
      { contextType: 'output', contextId: 'social-media', severity: 'warning', reason: 'Compliance review required for public content' }
    ],
    scenarios: ['Investor relations', 'Board reporting', 'Risk analysis', 'Regulatory compliance'],
    useCases: ['Annual reports', 'Quarterly earnings', 'Risk dashboards', 'Client proposals']
  },
  {
    contextType: 'industry',
    contextId: 'technology',
    contextName: 'Technology & SaaS',
    requiredFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', priority: 'critical' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
      { featureId: 'ai_image_gen', category: 'IMAGE', priority: 'critical' },
      { featureId: 'video_generation', category: 'VIDEO', priority: 'recommended' },
    ],
    recommendedProviders: {
      text: [
        { providers: ['openai', 'claude'], reason: 'Technical documentation accuracy' },
        { providers: ['gemini'], reason: 'Large context for codebases' }
      ],
      image: [
        { providers: ['modelslab', 'stability'], reason: 'Product screenshots and mockups' }
      ],
      video: [
        { providers: ['modelslab', 'runway'], reason: 'Product demos and animations' }
      ]
    },
    recommendedModels: [
      { type: 'text', modelIds: ['deepseek', 'gemini-2.5-pro'], reason: 'Technical accuracy', tier: 2 },
      { type: 'image', modelIds: ['modelslab-flux', 'flux-pro'], reason: 'UI mockups', tier: 2 },
      { type: 'video', modelIds: ['modelslab-animatediff', 'pika-labs'], reason: 'Product animations', tier: 2 }
    ],
    compatibleWith: {
      frameworks: ['saas-metrics', 'product-led', 'pirate-metrics', 'okr'],
      templates: ['pitch-deck', 'product-demo', 'sales-deck'],
      visuals: ['diagrams', 'charts', 'animations', 'video-clips'],
      outputs: ['video-short', 'interactive', 'web-embed', '2d-animated']
    },
    constraints: [],
    scenarios: ['Product launches', 'Feature demos', 'API documentation', 'Developer onboarding'],
    useCases: ['SaaS pitches', 'Product tours', 'Technical docs', 'Developer tutorials']
  },
  {
    contextType: 'industry',
    contextId: 'consulting',
    contextName: 'Consulting & Professional Services',
    requiredFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', priority: 'critical' },
      { featureId: 'document_upload', category: 'INPUT', priority: 'critical' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
      { featureId: 'brand_voice', category: 'SCRIPT', priority: 'critical' },
      { featureId: 'multi_language', category: 'TRANSLATION', priority: 'recommended' },
    ],
    recommendedProviders: {
      text: [
        { providers: ['openai', 'claude'], reason: 'Executive communication quality' }
      ],
      image: [
        { providers: ['stability', 'modelslab'], reason: 'Professional frameworks and diagrams' }
      ],
      translation: [
        { providers: ['deepl'], reason: 'Business terminology accuracy' }
      ]
    },
    recommendedModels: [
      { type: 'text', modelIds: ['gpt-5', 'claude-3.5'], reason: 'Strategic precision', tier: 3 },
      { type: 'image', modelIds: ['flux-pro', 'midjourney-v6'], reason: 'Framework visuals', tier: 3 }
    ],
    compatibleWith: {
      frameworks: ['swot', 'porter-five', 'pestle', 'mece', 'pyramid', 'balanced-scorecard'],
      templates: ['strategy-brief', 'case-study', 'whitepaper', 'competitive-analysis'],
      visuals: ['diagrams', 'charts', 'data-tables', 'infographics'],
      outputs: ['pdf-export', 'pptx-export', 'print-ready']
    },
    constraints: [],
    scenarios: ['Strategy presentations', 'Client deliverables', 'Workshop facilitation', 'Executive briefings'],
    useCases: ['Strategic plans', 'Due diligence', 'Market analysis', 'Transformation roadmaps']
  }
];

// ==========================================
// FRAMEWORK → CAPABILITY MAPPINGS
// ==========================================

export const FRAMEWORK_CAPABILITY_MAPPINGS: ContextToCapabilityMapping[] = [
  {
    contextType: 'framework',
    contextId: 'swot',
    contextName: 'SWOT Analysis',
    requiredFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
      { featureId: 'ai_image_gen', category: 'IMAGE', priority: 'recommended' },
    ],
    recommendedProviders: {
      text: [{ providers: ['openai', 'claude'], reason: 'Strategic analysis quality' }],
      image: [{ providers: ['stability', 'modelslab'], reason: '2x2 matrix visuals' }]
    },
    recommendedModels: [
      { type: 'text', modelIds: ['gpt-5', 'claude-3.5'], reason: 'Strategic depth', tier: 2 },
      { type: 'image', modelIds: ['flux-pro'], reason: 'Clean quadrant layouts', tier: 2 }
    ],
    compatibleWith: {
      industries: ['consulting', 'finance', 'technology', 'healthcare'],
      visuals: ['charts', 'diagrams', 'data-tables', 'infographics'],
      outputs: ['pdf-export', 'pptx-export', '2d-static']
    },
    constraints: [],
    scenarios: ['Strategic planning', 'Competitive analysis', 'Project evaluation'],
    useCases: ['Business plans', 'Market entry', 'Product strategy']
  },
  {
    contextType: 'framework',
    contextId: 'porter-five',
    contextName: "Porter's Five Forces",
    requiredFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
      { featureId: 'ai_image_gen', category: 'IMAGE', priority: 'critical' },
    ],
    recommendedProviders: {
      text: [{ providers: ['openai', 'claude'], reason: 'Industry analysis depth' }],
      image: [{ providers: ['stability', 'modelslab'], reason: 'Pentagon/radar visuals' }]
    },
    recommendedModels: [
      { type: 'text', modelIds: ['gpt-5', 'gemini-2.5-pro'], reason: 'Market research depth', tier: 3 },
      { type: 'image', modelIds: ['flux-pro', 'dall-e-3'], reason: 'Radar chart layouts', tier: 2 }
    ],
    compatibleWith: {
      industries: ['consulting', 'finance', 'manufacturing', 'retail'],
      visuals: ['charts', 'diagrams', 'infographics'],
      outputs: ['pdf-export', 'pptx-export']
    },
    constraints: [],
    scenarios: ['Industry analysis', 'Competitive landscape', 'Market entry assessment'],
    useCases: ['Strategy decks', 'Investment memos', 'Due diligence']
  },
  {
    contextType: 'framework',
    contextId: 'patient-journey',
    contextName: 'Patient Journey',
    requiredFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
      { featureId: 'ai_image_gen', category: 'IMAGE', priority: 'critical' },
      { featureId: 'tts', category: 'VOICE', priority: 'recommended' },
    ],
    recommendedProviders: {
      text: [{ providers: ['openai', 'claude'], reason: 'Healthcare terminology accuracy' }],
      image: [{ providers: ['stability', 'modelslab'], reason: 'Medical illustration' }],
      voice: [{ providers: ['elevenlabs', 'azure'], reason: 'Empathetic narration' }]
    },
    recommendedModels: [
      { type: 'text', modelIds: ['gpt-5', 'claude-3.5'], reason: 'Medical accuracy', tier: 3 },
      { type: 'image', modelIds: ['stability-core', 'modelslab-realvision'], reason: 'Healthcare visuals', tier: 2 }
    ],
    compatibleWith: {
      industries: ['healthcare', 'pharma', 'biotech'],
      visuals: ['journey-maps', 'timelines', 'diagrams', 'infographics'],
      outputs: ['pdf-export', 'pptx-export', 'video-full', 'interactive']
    },
    constraints: [],
    scenarios: ['Care pathway mapping', 'Treatment education', 'Clinical workflows'],
    useCases: ['Patient education', 'HCP training', 'Care model design']
  }
];

// ==========================================
// VISUAL FEATURE → CAPABILITY MAPPINGS
// ==========================================

export const VISUAL_CAPABILITY_MAPPINGS: ContextToCapabilityMapping[] = [
  {
    contextType: 'visual',
    contextId: 'charts',
    contextName: 'Charts & Graphs',
    requiredFeatures: [
      { featureId: 'ai_image_gen', category: 'IMAGE', priority: 'critical' },
    ],
    recommendedProviders: {
      image: [
        { providers: ['stability', 'openai'], reason: 'Clean data visualization' },
        { providers: ['modelslab'], reason: 'High-volume chart generation' }
      ]
    },
    recommendedModels: [
      { type: 'image', modelIds: ['flux-pro', 'dall-e-3'], reason: 'Text rendering in charts', tier: 2 }
    ],
    compatibleWith: {
      industries: ['finance', 'consulting', 'technology', 'healthcare'],
      frameworks: ['swot', 'balanced-scorecard', 'saas-metrics'],
      outputs: ['pdf-export', 'pptx-export', '2d-static', 'print-ready']
    },
    constraints: [
      { contextType: 'output', contextId: 'video-full', severity: 'warning', reason: 'Static charts may not translate well to video motion' }
    ],
    scenarios: ['Financial reporting', 'Data analysis', 'KPI dashboards'],
    useCases: ['Board decks', 'Investor updates', 'Performance reviews']
  },
  {
    contextType: 'visual',
    contextId: 'video-clips',
    contextName: 'Video Clips',
    requiredFeatures: [
      { featureId: 'video_generation', category: 'VIDEO', priority: 'critical' },
      { featureId: 'tts', category: 'VOICE', priority: 'recommended' },
    ],
    recommendedProviders: {
      video: [
        { providers: ['modelslab', 'runway'], reason: 'High-quality video generation' },
        { providers: ['pika'], reason: 'Creative effects' }
      ],
      voice: [
        { providers: ['elevenlabs'], reason: 'Narration sync' }
      ]
    },
    recommendedModels: [
      { type: 'video', modelIds: ['openai-sora', 'runway-gen3'], reason: 'Cinematic quality', tier: 3 },
      { type: 'video', modelIds: ['modelslab-animatediff', 'pika-labs'], reason: 'Fast generation', tier: 2 }
    ],
    compatibleWith: {
      outputs: ['video-short', 'video-full', '2d-animated', 'social-media']
    },
    constraints: [
      { contextType: 'output', contextId: 'pdf-export', severity: 'incompatible', reason: 'PDF cannot contain video' },
      { contextType: 'output', contextId: 'print-ready', severity: 'incompatible', reason: 'Print cannot contain video' }
    ],
    scenarios: ['Product demos', 'Explainer videos', 'Social content'],
    useCases: ['Marketing campaigns', 'Training videos', 'Product launches']
  },
  {
    contextType: 'visual',
    contextId: '3d-objects',
    contextName: '3D Objects',
    requiredFeatures: [
      { featureId: 'mesh_3d_gen', category: '3D', priority: 'critical' },
    ],
    recommendedProviders: {
      mesh3d: [
        { providers: ['modelslab'], reason: '3D model generation' },
        { providers: ['replicate'], reason: 'Open-source 3D models' }
      ]
    },
    recommendedModels: [
      { type: '3d', modelIds: ['rodin-gen1', 'luma-genie'], reason: 'High-fidelity 3D', tier: 3 },
      { type: '3d', modelIds: ['modelslab-3d', 'meshy-ai'], reason: 'Fast 3D generation', tier: 2 }
    ],
    compatibleWith: {
      outputs: ['3d-static', '3d-animated', 'vr-experience', 'ar-overlay', 'interactive']
    },
    constraints: [
      { contextType: 'output', contextId: 'pdf-export', severity: 'warning', reason: '3D rendered as static images in PDF' },
      { contextType: 'output', contextId: 'pptx-export', severity: 'warning', reason: '3D requires special embed in PPTX' }
    ],
    scenarios: ['Product visualization', 'Architecture', 'Gaming assets'],
    useCases: ['Product demos', 'Virtual showrooms', 'Training simulations']
  }
];

// ==========================================
// OUTPUT FORMAT → CAPABILITY MAPPINGS
// ==========================================

export const OUTPUT_CAPABILITY_MAPPINGS: ContextToCapabilityMapping[] = [
  {
    contextType: 'output',
    contextId: 'video-full',
    contextName: 'Full Video',
    requiredFeatures: [
      { featureId: 'video_generation', category: 'VIDEO', priority: 'critical' },
      { featureId: 'tts', category: 'VOICE', priority: 'critical' },
      { featureId: 'ai_image_gen', category: 'IMAGE', priority: 'critical' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
    ],
    recommendedProviders: {
      video: [{ providers: ['openai', 'runway'], reason: 'Cinematic quality' }],
      voice: [{ providers: ['elevenlabs'], reason: 'Professional narration' }],
      image: [{ providers: ['stability', 'modelslab'], reason: 'High-quality visuals' }]
    },
    recommendedModels: [
      { type: 'video', modelIds: ['openai-sora', 'runway-gen3'], reason: 'Premium video', tier: 3 },
      { type: 'voice', modelIds: ['elevenlabs', 'elevenlabs-ultra'], reason: 'Voice quality', tier: 3 }
    ],
    compatibleWith: {
      visuals: ['video-clips', 'animations', 'images', 'audio'],
      industries: ['technology', 'education', 'marketing', 'entertainment']
    },
    constraints: [
      { contextType: 'visual', contextId: 'data-tables', severity: 'warning', reason: 'Complex tables hard to read in video' },
      { contextType: 'visual', contextId: 'data-filters', severity: 'incompatible', reason: 'Interactive elements not in video' }
    ],
    scenarios: ['Marketing campaigns', 'Training content', 'Executive presentations'],
    useCases: ['Product launches', 'Corporate videos', 'E-learning modules']
  },
  {
    contextType: 'output',
    contextId: 'interactive',
    contextName: 'Interactive App',
    requiredFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', priority: 'critical' },
      { featureId: 'ai_image_gen', category: 'IMAGE', priority: 'critical' },
    ],
    recommendedProviders: {
      text: [{ providers: ['openai', 'gemini'], reason: 'Interactive logic generation' }],
      image: [{ providers: ['stability', 'modelslab'], reason: 'UI component visuals' }]
    },
    recommendedModels: [
      { type: 'text', modelIds: ['gpt-5', 'gemini-2.5-pro'], reason: 'Code generation', tier: 2 },
      { type: 'image', modelIds: ['flux-pro'], reason: 'UI mockups', tier: 2 }
    ],
    compatibleWith: {
      visuals: ['clickable', 'forms', 'quizzes', 'data-filters', 'realtime', 'animations'],
      industries: ['technology', 'education', 'retail']
    },
    constraints: [],
    scenarios: ['Product configurators', 'Data dashboards', 'Training modules'],
    useCases: ['Web apps', 'Kiosks', 'Self-service portals']
  }
];

// ==========================================
// FEATURE → CONTEXT REVERSE MAPPINGS
// ==========================================

export const FEATURE_CONTEXT_MAPPINGS: CapabilityToContextMapping[] = [
  {
    featureId: 'tts',
    featureName: 'Text-to-Speech',
    category: 'VOICE',
    usedByIndustries: [
      { id: 'healthcare', priority: 'secondary' },
      { id: 'education', priority: 'primary' },
      { id: 'technology', priority: 'secondary' }
    ],
    usedByFrameworks: [
      { id: 'patient-journey', priority: 'secondary' }
    ],
    usedByTemplates: [
      { id: 'training-manual', priority: 'primary' },
      { id: 'product-demo', priority: 'primary' }
    ],
    usedByVisuals: [
      { id: 'video-clips', priority: 'primary' },
      { id: 'audio', priority: 'primary' }
    ],
    usedByOutputs: [
      { id: 'video-full', priority: 'primary' },
      { id: 'video-short', priority: 'primary' },
      { id: 'vr-experience', priority: 'secondary' }
    ],
    dependsOn: [
      { featureId: 'ai_script_gen', category: 'SCRIPT' }
    ],
    enablesFeatures: [
      { featureId: 'voice_cloning', category: 'VOICE' },
      { featureId: 'multi_language_voice', category: 'VOICE' }
    ]
  },
  {
    featureId: 'video_generation',
    featureName: 'AI Video Generation',
    category: 'VIDEO',
    usedByIndustries: [
      { id: 'technology', priority: 'primary' },
      { id: 'entertainment', priority: 'primary' },
      { id: 'education', priority: 'secondary' }
    ],
    usedByFrameworks: [],
    usedByTemplates: [
      { id: 'product-demo', priority: 'primary' },
      { id: 'marketing-campaign', priority: 'primary' }
    ],
    usedByVisuals: [
      { id: 'video-clips', priority: 'primary' },
      { id: 'animations', priority: 'primary' }
    ],
    usedByOutputs: [
      { id: 'video-full', priority: 'primary' },
      { id: 'video-short', priority: 'primary' },
      { id: 'social-media', priority: 'secondary' }
    ],
    dependsOn: [
      { featureId: 'ai_image_gen', category: 'IMAGE' }
    ],
    enablesFeatures: [
      { featureId: 'avatar_generation', category: 'VIDEO' },
      { featureId: 'lip_sync', category: 'VIDEO' }
    ]
  },
  {
    featureId: 'ai_script_gen',
    featureName: 'AI Script Generation',
    category: 'SCRIPT',
    usedByIndustries: [
      { id: 'consulting', priority: 'primary' },
      { id: 'healthcare', priority: 'primary' },
      { id: 'finance', priority: 'primary' },
      { id: 'technology', priority: 'primary' }
    ],
    usedByFrameworks: [
      { id: 'swot', priority: 'primary' },
      { id: 'porter-five', priority: 'primary' },
      { id: 'patient-journey', priority: 'primary' }
    ],
    usedByTemplates: [
      { id: 'pitch-deck', priority: 'primary' },
      { id: 'strategy-brief', priority: 'primary' },
      { id: 'training-manual', priority: 'primary' }
    ],
    usedByVisuals: [],
    usedByOutputs: [
      { id: 'pdf-export', priority: 'primary' },
      { id: 'pptx-export', priority: 'primary' },
      { id: 'video-full', priority: 'primary' }
    ],
    dependsOn: [
      { featureId: 'text_prompt', category: 'INPUT' }
    ],
    enablesFeatures: [
      { featureId: 'tts', category: 'VOICE' },
      { featureId: 'multi_language', category: 'TRANSLATION' }
    ]
  }
];

// ==========================================
// AGGREGATED REGISTRY
// ==========================================

export const GENERATION_COVERAGE_REGISTRY = {
  industries: INDUSTRY_CAPABILITY_MAPPINGS,
  frameworks: FRAMEWORK_CAPABILITY_MAPPINGS,
  visuals: VISUAL_CAPABILITY_MAPPINGS,
  outputs: OUTPUT_CAPABILITY_MAPPINGS,
  features: FEATURE_CONTEXT_MAPPINGS,
  
  // Helper to get all mappings for a context type
  getMappingsByType(type: 'industry' | 'framework' | 'template' | 'visual' | 'output') {
    switch (type) {
      case 'industry': return this.industries;
      case 'framework': return this.frameworks;
      case 'visual': return this.visuals;
      case 'output': return this.outputs;
      default: return [];
    }
  },
  
  // Get feature mapping by ID
  getFeatureMapping(featureId: string) {
    return this.features.find(f => f.featureId === featureId);
  },
  
  // Get contexts that use a specific feature
  getContextsUsingFeature(featureId: string) {
    const allMappings = [
      ...this.industries,
      ...this.frameworks,
      ...this.visuals,
      ...this.outputs
    ];
    
    return allMappings.filter(m => 
      m.requiredFeatures.some(f => f.featureId === featureId)
    );
  },
  
  // Get all recommended providers for a context
  getProvidersForContext(contextType: string, contextId: string) {
    const mappings = this.getMappingsByType(contextType as any);
    const mapping = mappings.find(m => m.contextId === contextId);
    return mapping?.recommendedProviders || {};
  },
  
  // Validate a combination of contexts
  validateCombination(
    industries: string[],
    frameworks: string[],
    visuals: string[],
    outputs: string[]
  ) {
    const warnings: { context: string; reason: string; severity: string }[] = [];
    
    // Check visual ↔ output constraints
    for (const visualId of visuals) {
      const visualMapping = this.visuals.find(v => v.contextId === visualId);
      if (!visualMapping) continue;
      
      for (const outputId of outputs) {
        const constraint = visualMapping.constraints.find(
          c => c.contextType === 'output' && c.contextId === outputId
        );
        if (constraint) {
          warnings.push({
            context: `${visualId} + ${outputId}`,
            reason: constraint.reason,
            severity: constraint.severity
          });
        }
      }
    }
    
    return { isValid: warnings.filter(w => w.severity === 'incompatible').length === 0, warnings };
  }
};

export default GENERATION_COVERAGE_REGISTRY;
