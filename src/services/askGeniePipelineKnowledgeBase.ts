/**
 * ASK GENIE PIPELINE KNOWLEDGE BASE
 * 
 * Comprehensive knowledge base for Ask Genie to provide Level 1 support
 * with full awareness of all 181 pipelines, editing workflows, wizard steps,
 * and A2A agent orchestration.
 * 
 * PRODUCT-AWARE PIPELINE MAPPING:
 * - Spark (28 pipelines): Input processing, script generation, content extraction
 * - Mind (30 pipelines): Script enhancement, TTS, music generation, translation
 * - Vibe (64 pipelines): Video/audio production, podcast, editing, avatar, dubbing
 * - Deck (34 pipelines): Presentation, visual design, 3D/immersive
 * - Arc (14 pipelines): Scheduling, collaboration
 * - Cast (26 pipelines): Distribution, marketing, analytics
 * - Studio (181 pipelines): Master orchestrator (access to all)
 * 
 * This is the "brain" that trains Ask Genie on:
 * - All 181 production pipelines (21 categories)
 * - 8-step wizard flow and product context
 * - Post-generation editing capabilities (125 pipelines need editing)
 * - A2A agent orchestration and handoffs
 * - Self-correction and automation levels
 * - Proactive pipeline suggestions per product
 */

import { PIPELINE_IO_REGISTRY, PIPELINE_CATEGORY_METADATA, getPipelineStats, type PipelineIOEntry, type PipelineIOCategory } from '@/components/ai-hub/provider-matrix/pipelineIORegistry';
import { PODCAST_WEBCAST_PIPELINES, EDITING_PIPELINES, MOBILE_PIPELINES, TRAINING_ADDITIONS } from '@/components/ai-hub/provider-matrix/pendingPipelines180';
import { proactivePipelineEditorService, PIPELINE_EDITOR_CONFIGS, EDIT_CAPABILITIES } from '@/services/proactivePipelineEditorService';
import { GenieProduct, GENIE_PRODUCTS, PRODUCT_KEYS } from '@/constants/genie-products';
import { PIPELINE_CATEGORY_MAPPING, PRODUCT_PIPELINE_SUMMARY } from '@/constants/pipelineProductMapping';
import { CROSS_FUNCTIONAL_CAPABILITIES, getCapabilitiesByProduct } from '@/constants/crossFunctionalCapabilities';

// ==================== PRODUCT-AWARE PIPELINE KNOWLEDGE ====================

export interface PipelineKnowledge {
  id: string;
  name: string;
  description: string;
  category: PipelineIOCategory;
  tier: 'Starter' | 'Pro' | 'Enterprise';
  inputTypes: string[];
  outputTypes: string[];
  providers: string[];
  automationLevel: number; // 0-100
  selfCorrectionEnabled: boolean;
  a2aAgents: string[];
  wizardSteps: number[];
  editCapabilities: string[];
  commonIssues: string[];
  troubleshootingSteps: string[];
  primaryProduct: GenieProduct; // NEW: Product ownership
  sharedProducts?: GenieProduct[]; // NEW: Cross-functional sharing
}

// ==================== PRODUCT KNOWLEDGE ====================

export const PRODUCT_KNOWLEDGE = {
  spark: {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite your Ideas',
    description: 'Transform any input (Document, PPT, Video, Audio, URL, Image) into structured scripts.',
    pipelineCount: PRODUCT_PIPELINE_SUMMARY.spark.totalAccess,
    categories: ['input-processing', 'script-generation', 'content-extraction'],
    editorMode: 'document',
    wizardSteps: [0, 1, 2],
    capabilities: ['Script generation', 'OCR', 'STT', 'Summarization', 'Multi-format input'],
  },
  mind: {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'AI That Understands',
    description: 'Edit and enhance scripts with AI. Add TTS voiceovers, voice cloning, and background music.',
    pipelineCount: PRODUCT_PIPELINE_SUMMARY.mind.totalAccess,
    categories: ['script-enhancement', 'tts-generation', 'music-generation', 'translation'],
    editorMode: 'document',
    wizardSteps: [2, 3, 5, 6],
    capabilities: ['Script editing', 'TTS', 'Voice cloning', 'Music generation', 'Translation'],
  },
  vibe: {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    description: 'Full audio and video production hub. Podcast, video capture, trim, stitch, dubbing, lip-sync.',
    pipelineCount: PRODUCT_PIPELINE_SUMMARY.vibe.totalAccess,
    categories: ['video-generation', 'video-editing', 'audio-production', 'podcast-webcast', 'avatar-lipsync', 'dubbing'],
    editorMode: 'timeline',
    wizardSteps: [5, 6, 7],
    capabilities: ['Video generation', 'Audio production', 'Podcast', 'Dubbing', 'Lip-sync', 'Avatar'],
  },
  deck: {
    id: 'deck',
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    description: 'AI-powered presentation and slide generation with smart layouts and branding.',
    pipelineCount: PRODUCT_PIPELINE_SUMMARY.deck.totalAccess,
    categories: ['presentation', 'visual-design', '3d-immersive'],
    editorMode: 'canvas',
    wizardSteps: [3, 4, 5, 7],
    capabilities: ['Slide generation', 'Infographics', 'Charts', '3D', 'Animation', 'Branding'],
  },
  arc: {
    id: 'arc',
    name: 'Genie Arc',
    tagline: 'Your Production Journey With Infinite Possibilities',
    description: 'Enterprise production hub for project scheduling, Kanban workflows, and team collaboration.',
    pipelineCount: PRODUCT_PIPELINE_SUMMARY.arc.totalAccess,
    categories: ['scheduling', 'collaboration'],
    editorMode: 'canvas',
    wizardSteps: [],
    capabilities: ['Scheduling', 'Kanban', 'Collaboration', 'Review', 'Approval'],
  },
  cast: {
    id: 'cast',
    name: 'Genie Cast',
    tagline: 'Make It. Show It. Scale It.',
    description: 'Global distribution and marketing engine. Multi-platform publishing, 14-region localization.',
    pipelineCount: PRODUCT_PIPELINE_SUMMARY.cast.totalAccess,
    categories: ['distribution', 'marketing', 'analytics'],
    editorMode: 'canvas',
    wizardSteps: [8],
    capabilities: ['Multi-platform publishing', 'Localization', 'Scheduling', 'Analytics', 'Social'],
  },
  studio: {
    id: 'studio',
    name: 'Genie Studio',
    tagline: 'Mind to Media',
    description: 'The master orchestrator that coordinates all Genie products. Access to all 181 pipelines.',
    pipelineCount: PRODUCT_PIPELINE_SUMMARY.studio.totalAccess,
    categories: ['all-categories'],
    editorMode: 'hybrid',
    wizardSteps: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    capabilities: ['Full orchestration', 'All pipelines', 'A2A coordination', 'Enterprise integration'],
  },
};

// ==================== WIZARD KNOWLEDGE (PRODUCT-AWARE) ====================

export const WIZARD_STEPS_KNOWLEDGE = {
  steps: [
    {
      step: 0,
      name: 'Universal Input Gateway',
      description: 'Multi-modal input: Text, Image, Video, Audio, URL, Document, Screen Recording',
      capabilities: ['Text paste', 'File upload', 'URL import', 'Screen recording', 'Voice input'],
      commonIssues: [
        'File format not supported',
        'URL not accessible',
        'Screen recording permission denied'
      ],
      troubleshooting: [
        'Check supported formats: txt, docx, pdf, pptx, mp3, mp4, wav, png, jpg',
        'Ensure URL is publicly accessible or paste content directly',
        'Grant browser permission for screen recording'
      ]
    },
    {
      step: 1,
      name: 'Language Selection',
      description: 'Primary and target languages with regional routing (5-zone model)',
      capabilities: ['70+ languages', 'Auto-detection', 'Regional optimization', 'Multi-language output'],
      zones: {
        claude: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Italian'],
        alibaba: ['Chinese', 'Japanese', 'Korean', 'Vietnamese', 'Thai'],
        arabic: ['Arabic', 'Hebrew', 'Persian', 'Urdu'],
        gemini: ['Hindi', 'Bengali', 'Tamil', 'Telugu', 'Indonesian', 'Swahili'],
        fallback: ['Other languages via DeepSeek or Google']
      },
      commonIssues: [
        'Wrong language detected',
        'Translation quality concerns',
        'Dialect not supported'
      ],
      troubleshooting: [
        'Manually select correct language from dropdown',
        'Each language is paired with best-in-class provider automatically',
        'Contact support for specific dialect requirements'
      ]
    },
    {
      step: 2,
      name: 'Industry & Segment',
      description: 'Context selection from 50+ industries for AI optimization',
      capabilities: ['Industry-specific terminology', 'Tone adaptation', 'Visual style matching'],
      industries: ['Healthcare', 'Finance', 'Technology', 'Education', 'Retail', 'Manufacturing', 'Legal', 'Real Estate', 'Oil & Gas', 'Pharma', 'Consulting'],
      commonIssues: [
        'My industry not listed',
        'Wrong terminology generated'
      ],
      troubleshooting: [
        'Select closest matching industry or use "General"',
        'Add custom terminology in the prompt or knowledge base'
      ]
    },
    {
      step: 3,
      name: 'Framework & Category',
      description: 'Content type and methodology framework selection',
      capabilities: ['30+ frameworks', 'Regional variations', 'Industry methodologies'],
      frameworks: ['AIDA', 'Problem-Solution', 'Storytelling', 'Data-Driven', 'Case Study', 'Tutorial', 'Pitch Deck', 'Executive Summary'],
      commonIssues: [
        'Framework not matching content',
        'Structure too rigid'
      ],
      troubleshooting: [
        'Try "Auto-select" for AI-recommended framework',
        'Edit structure in post-generation editing'
      ]
    },
    {
      step: 4,
      name: 'Design & Template',
      description: 'Visual theme and template selection with brand customization',
      capabilities: ['100+ templates', 'Brand upload', 'Color customization', 'Font selection'],
      commonIssues: [
        'Template not matching brand',
        'Colors look wrong'
      ],
      troubleshooting: [
        'Upload brand guidelines for automatic extraction',
        'Manually adjust colors in brand configuration'
      ]
    },
    {
      step: 5,
      name: 'Visual Features',
      description: '100+ visual features across 22 categories',
      capabilities: ['Charts', 'Infographics', 'Icons', 'Animations', 'AI Images', '3D Objects', 'Avatars'],
      featureCategories: ['Data Visualization', 'Illustrations', 'Icons', 'Animations', 'AI-Generated', 'Stock Media', '3D', 'Avatars', 'Backgrounds'],
      commonIssues: [
        'Visual feature not generating',
        'Image quality low'
      ],
      troubleshooting: [
        'Check tier requirements for premium features',
        'Enable "High Quality" mode in settings'
      ]
    },
    {
      step: 6,
      name: 'Agent & Voice Orchestration',
      description: 'Multi-agent configuration and voice/audio settings',
      capabilities: ['Agent selection', 'Voice provider', 'TTS/STT', 'Music', 'Sound effects'],
      agents: ['Content Analyst', 'Visual Designer', 'Image Generator', 'Translator', 'Voice Narrator', 'Video Producer', '3D Artist'],
      voiceProviders: ['ElevenLabs', 'Azure Neural', 'OpenAI TTS', 'Google TTS', 'Alibaba Qwen3-TTS'],
      commonIssues: [
        'Voice not matching language',
        'Agent task failed'
      ],
      troubleshooting: [
        'Voice is auto-paired with language - check regional settings',
        'Agent retries automatically up to 5 times with self-correction'
      ]
    },
    {
      step: 7,
      name: 'Generation & Editing',
      description: 'Dynamic pipeline selection, generation, embedded editor, and proactive editing suggestions',
      capabilities: ['180 pipeline selection', 'Real-time preview', 'Embedded editor', 'Credit preview', 'Proactive editing suggestions'],
      editingModes: ['Canvas (Presentations)', 'Timeline (Video)', 'Document (Reports)', 'Hybrid'],
      editingPipelines: {
        categories: ['Podcast/Webcast (16 pipelines)', 'FFmpeg Editing (15 pipelines)', 'Mobile (5 pipelines)'],
        operations: ['trim', 'split', 'merge', 'audio-replace', 'add-tts', 'add-stt', 'lip-sync', 'crop', 'speed'],
        triggerConditions: ['CRITICAL priority auto-shows editor', 'HIGH priority suggests editor', 'MEDIUM optional']
      },
      commonIssues: [
        'Generation taking too long',
        'Wrong pipeline selected',
        'Credit cost too high',
        'Editor suggestions not appearing',
        'Lip sync off after dubbing'
      ],
      troubleshooting: [
        'Complex pipelines may take 2-5 minutes - check progress indicator',
        'Use "Change Pipeline" button to select different workflow',
        'Lower tier or reduce visual features to reduce credits',
        'Proactive suggestions appear based on content analysis - generate first',
        'Use lip-sync fix tool in Enhance tab for avatar alignment issues'
      ]
    },
    {
      step: 8,
      name: 'Publishing & Distribution',
      description: 'Export, share, and multi-platform publishing',
      capabilities: ['PPTX', 'PDF', 'MP4', 'Share link', 'Social publishing', 'Embed code'],
      platforms: ['YouTube', 'LinkedIn', 'TikTok', 'Instagram', 'Twitter/X', 'Vimeo'],
      commonIssues: [
        'Export failed',
        'Social connection not working'
      ],
      troubleshooting: [
        'Check file size limits and try again',
        'Reconnect social account in integrations settings'
      ]
    }
  ]
};

// ==================== EDITING KNOWLEDGE ====================

export const EDITING_KNOWLEDGE = {
  modes: [
    {
      name: 'Canvas Mode',
      description: 'Free-form editing for presentations and graphics',
      capabilities: ['Drag & drop', 'Resize', 'Layer management', 'Text editing', 'Image replacement'],
      usedFor: ['Presentations', 'Infographics', 'Social graphics']
    },
    {
      name: 'Timeline Mode',
      description: 'Time-based editing for video and audio content',
      capabilities: ['Clip trimming', 'Audio sync', 'Transitions', 'Keyframes', 'Captions'],
      usedFor: ['Videos', 'Animations', 'Audio content']
    },
    {
      name: 'Document Mode',
      description: 'Text-focused editing for reports and documents',
      capabilities: ['Rich text', 'Formatting', 'Tables', 'Citations', 'TOC'],
      usedFor: ['Reports', 'Whitepapers', 'Documentation']
    },
    {
      name: 'Hybrid Mode',
      description: 'Combined canvas and timeline for complex content',
      capabilities: ['Multi-modal editing', 'Asset conversion', 'Cross-format sync'],
      usedFor: ['Complex presentations', 'Interactive content']
    }
  ],
  postGenerationActions: [
    {
      action: 'Regenerate',
      description: 'Regenerate specific element with same settings',
      credits: 'Same as original generation'
    },
    {
      action: 'Enhance',
      description: 'Improve quality of existing element',
      credits: '2.5x standard rate'
    },
    {
      action: 'Refine',
      description: 'Make targeted adjustments to element',
      credits: '1.5x standard rate'
    },
    {
      action: 'Replace',
      description: 'Replace element with new generation',
      credits: 'Same as original generation'
    },
    {
      action: 'Add Variation',
      description: 'Create alternative version alongside original',
      credits: 'Same as original generation'
    }
  ],
  commonEditingIssues: [
    {
      issue: 'Changes not saving',
      solution: 'Auto-save is enabled - check connection status. Manual save available in menu.'
    },
    {
      issue: 'Cannot edit element',
      solution: 'Some elements are grouped - right-click and select "Ungroup" first.'
    },
    {
      issue: 'Regenerate not working',
      solution: 'Check credit balance. Regenerate uses same credits as original generation.'
    },
    {
      issue: 'Lost my edits',
      solution: 'Use Version History (Ctrl+H) to restore previous versions.'
    }
  ]
};

// ==================== A2A AGENT KNOWLEDGE ====================

export const A2A_AGENT_KNOWLEDGE = {
  description: 'Agent-to-Agent (A2A) protocol enables specialized AI agents to collaborate on complex tasks',
  
  orchestrationModes: [
    {
      mode: 'parallel',
      description: 'Multiple agents work simultaneously on independent tasks',
      useCases: ['Multi-language generation', 'Batch processing']
    },
    {
      mode: 'sequential',
      description: 'Agents work in order, passing output to next agent',
      useCases: ['Content → Design → Voice pipeline']
    },
    {
      mode: 'hybrid',
      description: 'Combination of parallel and sequential execution',
      useCases: ['Complex multi-output workflows']
    }
  ],
  
  agents: [
    {
      id: 'content-analyst',
      name: 'Content Analyst',
      role: 'Extracts key themes, structures content, identifies topics',
      providers: ['Claude', 'GPT-4', 'Gemini'],
      tasks: ['Topic extraction', 'Outline creation', 'Key point identification']
    },
    {
      id: 'visual-designer',
      name: 'Visual Designer',
      role: 'Determines layouts, colors, visual hierarchy',
      providers: ['Claude', 'Gemini'],
      tasks: ['Layout selection', 'Color scheme', 'Typography']
    },
    {
      id: 'image-generator',
      name: 'Image Generator',
      role: 'Creates AI images, selects stock photos, generates graphics',
      providers: ['ModelsLab', 'Replicate', 'OpenAI DALL-E'],
      tasks: ['AI image generation', 'Stock selection', 'Icon creation']
    },
    {
      id: 'translator',
      name: 'Translator',
      role: 'Handles multi-language translation with context preservation',
      providers: ['DeepL', 'Google', 'Alibaba Qwen-MT', 'Azure'],
      tasks: ['Translation', 'Localization', 'Dialect adaptation']
    },
    {
      id: 'voice-narrator',
      name: 'Voice Narrator',
      role: 'Generates voiceover scripts and TTS audio',
      providers: ['ElevenLabs', 'Azure Neural', 'OpenAI TTS', 'Alibaba Qwen3-TTS'],
      tasks: ['Script generation', 'Voice synthesis', 'Audio timing']
    },
    {
      id: 'video-producer',
      name: 'Video Producer',
      role: 'Creates video content, animations, transitions',
      providers: ['ModelsLab', 'Alibaba Wan2.2', 'Replicate'],
      tasks: ['Video generation', 'Animation', 'Compositing']
    },
    {
      id: '3d-artist',
      name: '3D Artist',
      role: 'Creates 3D objects, scenes, and immersive content',
      providers: ['ModelsLab', 'Meshy AI', 'Replicate'],
      tasks: ['3D modeling', 'Scene creation', 'AR/VR content']
    },
    {
      id: 'quality-verifier',
      name: 'Quality Verifier',
      role: 'Validates output quality and triggers self-correction',
      providers: ['Claude', 'GPT-4'],
      tasks: ['Quality assessment', 'Error detection', 'Retry coordination']
    }
  ],
  
  selfCorrectionEngine: {
    name: 'LoopAgent Self-Correction Engine',
    description: 'Automated quality assurance with up to 5 retry attempts',
    targetAutomation: 98,
    rubrics: [
      { name: 'media_quality', weight: 25, passThreshold: 95 },
      { name: 'caption_accuracy', weight: 25, passThreshold: 95 },
      { name: 'voice_clone_fidelity', weight: 20, passThreshold: 90 },
      { name: 'processing_completeness', weight: 30, passThreshold: 98 }
    ],
    process: [
      'Generator creates initial output',
      'Verifier evaluates against rubrics',
      'If failed: feedback sent to Generator',
      'Generator retries with feedback',
      'After 5 failures: escalate to human review'
    ]
  },
  
  commonA2AIssues: [
    {
      issue: 'Agent task timed out',
      solution: 'Complex tasks may take longer. Check progress in orchestration panel. System retries automatically.'
    },
    {
      issue: 'Agent handoff failed',
      solution: 'A2A coordinator automatically reroutes. If persistent, try regenerating the specific element.'
    },
    {
      issue: 'Quality check failed multiple times',
      solution: 'After 5 retries, manual review is triggered. You can also manually edit the element.'
    }
  ]
};

// ==================== PIPELINE CATEGORIES DETAILED ====================

export const PIPELINE_CATEGORIES_DETAILED = {
  text_based: {
    label: 'Text-Based Pipelines',
    count: 10,
    pipelines: ['text-to-image', 'text-to-video', 'text-to-3d', 'text-to-animation', 'text-to-avatar', 'text-to-vr', 'text-to-ar', 'text-to-speech', 'text-to-music', 'text-to-sfx'],
    description: 'Transform text prompts into various media formats',
    commonUses: ['Generate images from descriptions', 'Create videos from scripts', 'Build 3D models from text']
  },
  image_based: {
    label: 'Image-Based Pipelines',
    count: 8,
    pipelines: ['image-to-video', 'image-to-3d', 'image-to-avatar', 'image-to-text', 'image-to-animation', 'image-upscale', 'image-variation', 'image-edit'],
    description: 'Transform and enhance images',
    commonUses: ['Animate static images', 'Convert photos to 3D', 'Upscale low-res images']
  },
  voice_audio: {
    label: 'Voice & Audio Pipelines',
    count: 8,
    pipelines: ['voice-to-text', 'voice-clone', 'audio-to-video', 'audio-enhance', 'voice-to-avatar', 'podcast-to-clips', 'audio-translate', 'voice-to-animation'],
    description: 'Process and transform audio content',
    commonUses: ['Transcription', 'Voice cloning', 'Audio enhancement']
  },
  document_ppt: {
    label: 'Document & PPT Pipelines',
    count: 10,
    pipelines: ['doc-to-ppt', 'ppt-to-video', 'pdf-to-slides', 'doc-to-infographic', 'ppt-to-web', 'doc-to-audio', 'ppt-to-social', 'doc-to-interactive', 'ppt-to-training', 'doc-to-summary'],
    description: 'Convert documents and presentations',
    commonUses: ['Turn documents into presentations', 'Convert PPT to video', 'Create training from docs']
  },
  video_based: {
    label: 'Video-Based Pipelines',
    count: 9,
    pipelines: ['video-to-clips', 'video-to-text', 'video-upscale', 'video-to-gif', 'video-translate', 'video-to-audio', 'video-enhance', 'video-to-3d', 'video-to-avatar'],
    description: 'Process and transform video content',
    commonUses: ['Extract clips', 'Transcribe videos', 'Upscale quality']
  },
  '3d_based': {
    label: '3D-Based Pipelines',
    count: 5,
    pipelines: ['3d-to-video', '3d-to-image', '3d-to-vr', '3d-to-ar', '3d-enhance'],
    description: 'Work with 3D models and scenes',
    commonUses: ['Render 3D videos', 'Create AR experiences']
  },
  ar_vr_scene: {
    label: 'AR/VR Scene Pipelines',
    count: 6,
    pipelines: ['scene-to-vr', 'scene-to-ar', 'vr-to-video', 'ar-to-video', 'immersive-training', 'spatial-presentation'],
    description: 'Create immersive experiences',
    commonUses: ['VR training', 'AR product demos']
  },
  complex_multimodal: {
    label: 'Complex Multi-modal Pipelines',
    count: 7,
    pipelines: ['full-production', 'auto-record-to-avatar', 'data-to-dashboard', 'research-to-presentation', 'meeting-to-content', 'podcast-to-video', 'live-to-clips'],
    description: 'Multi-input complex workflows',
    commonUses: ['End-to-end production', 'Meeting summaries', 'Podcast video creation']
  },
  presentation: {
    label: 'Presentation Pipelines',
    count: 5,
    pipelines: ['smart-context', 'quick-generate', 'branded-deck', 'template-apply', 'slide-enhance'],
    description: 'Presentation-specific workflows',
    commonUses: ['Quick deck generation', 'Brand application']
  },
  repurposing: {
    label: 'Repurposing Pipelines',
    count: 8,
    pipelines: ['blog-to-social', 'video-to-blog', 'podcast-to-article', 'ppt-to-blog', 'webinar-to-clips', 'long-to-short', 'article-to-video', 'content-refresh'],
    description: 'Repurpose content across formats',
    commonUses: ['Turn blogs into social posts', 'Convert videos to articles']
  },
  training_ld: {
    label: 'Training & L&D Pipelines',
    count: 6,
    pipelines: ['doc-to-elearning', 'video-to-training', 'quiz-generator', 'scenario-builder', 'compliance-training', 'onboarding-flow'],
    description: 'Learning and development content',
    commonUses: ['eLearning modules', 'Quiz generation', 'Compliance training']
  },
  marketing_sales: {
    label: 'Marketing & Sales Pipelines',
    count: 31,
    pipelines: ['pitch-deck', 'product-demo', 'case-study', 'testimonial-video', 'ad-creative', 'email-campaign', 'social-campaign', 'landing-page', 'explainer-video', 'brand-video'],
    description: 'Marketing and sales content creation',
    commonUses: ['Pitch decks', 'Product demos', 'Ad creatives']
  },
  localization: {
    label: 'Localization Pipelines',
    count: 6,
    pipelines: ['full-localization', 'voice-localization', 'subtitle-generation', 'cultural-adaptation', 'regional-compliance', 'multi-market-launch'],
    description: 'Multi-language and regional adaptation',
    commonUses: ['Full content localization', 'Subtitle generation']
  },
  creator_enhancement: {
    label: 'Creator Enhancement Pipelines',
    count: 22,
    pipelines: [
      'ai-auto-captions', 'video-upscaling-4k', 'ai-background-removal', 'ai-thumbnail-creator',
      'audio-enhancement', 'ai-color-grading', 'ai-video-stabilization', 'ai-noise-reduction',
      'ai-teleprompter', 'ai-clip-finder', 'ai-highlight-reel', 'ai-b-roll-generator',
      'ai-transitions', 'ai-music-sync', 'ai-voice-clone', 'ai-lip-sync',
      'ai-avatar-library', 'ai-podcast-to-clips', 'ai-shorts-generator', 'ai-watermark-removal',
      'ai-aspect-ratio', 'ai-speed-ramp'
    ],
    description: 'Critical user-demand tools for content creators',
    commonUses: ['Auto-captions', 'Video upscaling', 'Background removal', 'Thumbnail creation', 'Voice cloning']
  }
};

// ==================== COMPREHENSIVE SUPPORT TIER CONFIGURATION ====================

/**
 * 6-TIER SUPPORT STRUCTURE
 * Response times, channels, and SLA priority per subscription tier
 */
export const SUPPORT_TIERS = {
  free: {
    tier: 'Free',
    supportType: 'AI Chat (Ask Genie) + Community',
    responseTime: '< 1 min (AI)',
    channels: ['In-app chat', 'Docs'],
    slaPriority: 6,
    hasEmail: false,
    hasPhone: false,
    hasSlack: false,
    hasAccountManager: false,
    hasDedicatedTeam: false
  },
  creator: {
    tier: 'Creator',
    supportType: 'AI Chat + Email',
    responseTime: '< 24 hours',
    channels: ['In-app', 'Email'],
    slaPriority: 5,
    hasEmail: true,
    hasPhone: false,
    hasSlack: false,
    hasAccountManager: false,
    hasDedicatedTeam: false
  },
  pro: {
    tier: 'Pro',
    supportType: 'AI Chat + Priority Email',
    responseTime: '< 4 hours',
    channels: ['In-app', 'Email', 'Priority queue'],
    slaPriority: 4,
    hasEmail: true,
    hasPhone: false,
    hasSlack: false,
    hasAccountManager: false,
    hasDedicatedTeam: false
  },
  team: {
    tier: 'Team',
    supportType: 'AI Chat + Dedicated Support',
    responseTime: '< 1 hour',
    channels: ['In-app', 'Email', 'Slack'],
    slaPriority: 3,
    hasEmail: true,
    hasPhone: false,
    hasSlack: true,
    hasAccountManager: false,
    hasDedicatedTeam: false
  },
  business: {
    tier: 'Business',
    supportType: 'AI Chat + Account Manager',
    responseTime: '< 30 min',
    channels: ['All channels + Phone'],
    slaPriority: 2,
    hasEmail: true,
    hasPhone: true,
    hasSlack: true,
    hasAccountManager: true,
    hasDedicatedTeam: false
  },
  enterprise: {
    tier: 'Enterprise',
    supportType: 'AI Chat + Dedicated Team + SLA',
    responseTime: 'Custom SLA',
    channels: ['All + Dedicated Slack'],
    slaPriority: 1,
    hasEmail: true,
    hasPhone: true,
    hasSlack: true,
    hasAccountManager: true,
    hasDedicatedTeam: true
  }
};

/**
 * ASK GENIE AI SUPPORT CAPABILITIES
 * Resolution rates by question type
 */
export const ASK_GENIE_AI_CAPABILITIES = {
  description: 'AI-powered Level 1 support with full 180 pipeline awareness including editing',
  capabilities: [
    { type: 'how_to_questions', description: 'How do I add an avatar to my video?', resolutionRate: 95 },
    { type: 'error_explanation', description: 'What does this error mean?', resolutionRate: 90 },
    { type: 'feature_discovery', description: 'Can Genie do X?', resolutionRate: 98 },
    { type: 'troubleshooting', description: 'My export isn\'t working', resolutionRate: 70 },
    { type: 'account_questions', description: 'How do I upgrade?', resolutionRate: 95 },
    { type: 'pipeline_selection', description: 'Which pipeline should I use for X?', resolutionRate: 90 },
    { type: 'best_practices', description: 'How do I get better results?', resolutionRate: 95 },
    { type: 'editing_guidance', description: 'How do I fix lip sync / add captions?', resolutionRate: 92 },
    { type: 'proactive_suggestions', description: 'What edits should I make?', resolutionRate: 88 }
  ],
  averageResolutionRate: 90,
  pipelineAwareness: { totalPipelines: 180, categories: 18, wizardSteps: 8, editingModes: 4, a2aAgents: 8, editOperations: 10 }
};

/**
 * 7-STEP ESCALATION FLOW
 */
export const ESCALATION_FLOW = {
  steps: [
    { step: 1, action: 'User asks question', criteria: 'Any question', handler: 'Ask Genie AI' },
    { step: 2, action: 'Ask Genie responds', criteria: 'AI processes with full context', handler: 'Ask Genie AI' },
    { step: 3, action: 'Check satisfaction', criteria: '"Did this help?" prompt', handler: 'Ask Genie AI' },
    { step: '4a', action: 'If Yes → Close', criteria: 'User satisfied', handler: 'System' },
    { step: '4b', action: 'If No → Suggest alternatives', criteria: 'AI tries again', handler: 'Ask Genie AI' },
    { step: 5, action: 'If still No → "Would you like human help?"', criteria: 'User frustrated', handler: 'Ask Genie AI' },
    { step: 6, action: 'Create ticket with full context', criteria: 'AI summary included', handler: 'System' },
    { step: 7, action: 'Human support with AI context', criteria: 'Agent sees entire history', handler: 'Support Agent' }
  ]
};

/**
 * ENGINEERING CONTEXT EXPORT
 * Auto-captured for technical issues
 */
export const ENGINEERING_CONTEXT_EXPORT = {
  dataCaptures: [
    { data: 'Error stack traces', purpose: 'Dev debugging' },
    { data: 'Network failures', purpose: 'API issue identification' },
    { data: 'Browser/OS info', purpose: 'Environment reproduction' },
    { data: 'Session replay URL', purpose: 'Visual debugging' },
    { data: 'Reproduction steps', purpose: 'Issue recreation' },
    { data: 'User\'s recent actions', purpose: 'Context for debugging' },
    { data: 'Affected pipelines', purpose: 'Scope identification (141 pipelines)' },
    { data: 'Affected wizard steps', purpose: 'Workflow stage identification (8 steps)' },
    { data: 'Affected components', purpose: 'Code location identification' },
    { data: 'AI pre-analysis', purpose: 'Root cause and suggested fix from Ask Genie' }
  ],
  exportFormats: ['markdown', 'json', 'lovable', 'cursor', 'replica', 'claude', 'github_issue'],
  
  // Developer handoff tracking
  handoffTracking: {
    idFormat: 'GH-{timestamp}-{random}',
    commitFormats: {
      lovable: '[GENIE-FIX: {handoffId}]',
      cursor: 'fix: [GENIE-{handoffId}]',
      replica: 'GENIE-{handoffId}',
      github: 'Fixes GENIE-{handoffId}'
    },
    autoResolve: {
      enabled: true,
      triggerEnvironment: 'main',
      verificationMethods: ['automated', 'manual', 'user_confirmed']
    }
  },
  
  // Context loop - ensures fixes come back connected
  contextLoop: {
    description: 'Bi-directional context tracking between support and AI coding tools',
    steps: [
      { step: 1, action: 'User reports issue in Ask Genie', system: 'Support' },
      { step: 2, action: 'Ask Genie captures full engineering context', system: 'Support' },
      { step: 3, action: 'Context exported to Lovable/Cursor/Replica with tracking ID', system: 'Handoff' },
      { step: 4, action: 'Developer fixes issue with tracking ID in commit', system: 'Development' },
      { step: 5, action: 'Fix deployed to dev → uat → main', system: 'CI/CD' },
      { step: 6, action: 'Webhook detects tracking ID in commit', system: 'Integration' },
      { step: 7, action: 'Support ticket auto-resolved with fix reference', system: 'Support' },
      { step: 8, action: 'User notified of resolution', system: 'Notification' }
    ]
  }
};

/**
 * COMPETITIVE DIFFERENTIATORS
 */
export const SUPPORT_DIFFERENTIATORS = [
  { feature: 'First response', us: 'Instant (AI)', competitor: '2-24 hours' },
  { feature: 'Context awareness', us: 'AI knows user\'s projects', competitor: 'User explains from scratch' },
  { feature: 'Pipeline-specific help', us: 'AI understands all 141 pipelines', competitor: 'Generic FAQ' },
  { feature: 'Language support', us: '70+ languages via AI', competitor: 'English only usually' },
  { feature: '24/7 availability', us: 'AI always available', competitor: 'Business hours only' },
  { feature: 'Ticket context', us: 'Full conversation + tech context exported', competitor: 'User re-explains' }
];

export const SUPPORT_KNOWLEDGE = {
  escalationLevels: [
    { level: 1, name: 'Ask Genie AI', description: 'AI-powered first response with full 180 pipeline + editing knowledge', responseTime: '< 1 min' },
    { level: 2, name: 'Community Support', description: 'User-to-user assistance forum', responseTime: '< 4 hours' },
    { level: 3, name: 'Support Agent', description: 'Human support agent (Tier-based SLA)', responseTime: 'Per tier SLA' },
    { level: 4, name: 'Technical Specialist', description: 'Engineering escalation with context export', responseTime: '< 24 hours' },
    { level: 5, name: 'Management', description: 'Critical issue escalation', responseTime: 'Custom' }
  ],
  selfServiceResources: ['Knowledge Base articles', 'Video walkthroughs', 'Interactive tutorials', 'FAQ database', 'Community discussions', 'Proactive editing suggestions'],
  commonCategories: ['Generation issues', 'Credit/billing questions', 'Feature requests', 'Quality concerns', 'Account/access issues', 'Integration problems', 'Performance issues', 'Editing/Post-production issues'],
  tiers: SUPPORT_TIERS,
  aiCapabilities: ASK_GENIE_AI_CAPABILITIES,
  escalationFlow: ESCALATION_FLOW,
  engineeringContext: ENGINEERING_CONTEXT_EXPORT,
  differentiators: SUPPORT_DIFFERENTIATORS,
  // Editing-specific support
  editingSupport: {
    pipelineEditorConfigs: PIPELINE_EDITOR_CONFIGS,
    editCapabilities: EDIT_CAPABILITIES,
    proactiveSuggestionsEnabled: true,
    confidenceLoopIntegration: true
  }
};

// ==================== MAIN KNOWLEDGE BASE CLASS ====================

class AskGeniePipelineKnowledgeBase {
  private pipelineCache: Map<string, PipelineIOEntry> = new Map();
  
  constructor() {
    // Build pipeline cache for fast lookup
    PIPELINE_IO_REGISTRY.forEach(pipeline => {
      this.pipelineCache.set(pipeline.id, pipeline);
    });
  }
  
  // Get all pipeline stats
  getStats() {
    return getPipelineStats();
  }
  
  // Get pipeline by ID
  getPipeline(id: string): PipelineIOEntry | undefined {
    return this.pipelineCache.get(id);
  }
  
  // Search pipelines by keyword
  searchPipelines(query: string): PipelineIOEntry[] {
    const lowerQuery = query.toLowerCase();
    return PIPELINE_IO_REGISTRY.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.id.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      (p.notes && p.notes.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Get pipelines by category
  getPipelinesByCategory(category: PipelineIOCategory): PipelineIOEntry[] {
    return PIPELINE_IO_REGISTRY.filter(p => p.category === category);
  }
  
  // Get wizard step info
  getWizardStep(stepNumber: number) {
    return WIZARD_STEPS_KNOWLEDGE.steps.find(s => s.step === stepNumber);
  }
  
  // Get editing mode info
  getEditingMode(mode: string) {
    return EDITING_KNOWLEDGE.modes.find(m => m.name.toLowerCase().includes(mode.toLowerCase()));
  }
  
  // Get agent info
  getAgent(agentId: string) {
    return A2A_AGENT_KNOWLEDGE.agents.find(a => a.id === agentId);
  }
  
  // Generate support response for user query
  generateSupportResponse(query: string): {
    response: string;
    relatedPipelines: PipelineIOEntry[];
    suggestedActions: string[];
    escalateToHuman: boolean;
  } {
    const lowerQuery = query.toLowerCase();
    let response = '';
    let relatedPipelines: PipelineIOEntry[] = [];
    let suggestedActions: string[] = [];
    let escalateToHuman = false;
    
    // Check for pipeline-related queries
    const pipelineMatch = this.searchPipelines(query);
    if (pipelineMatch.length > 0) {
      relatedPipelines = pipelineMatch.slice(0, 5);
      response = `I found ${pipelineMatch.length} related pipeline(s):\n\n`;
      relatedPipelines.forEach(p => {
        response += `• **${p.name}** (${p.tier}): ${p.category.replace(/_/g, ' ')}\n`;
        response += `  Inputs: ${p.inputFormats.join(', ')} → Outputs: ${p.outputFormats.join(', ')}\n`;
      });
      suggestedActions = ['Learn more about this pipeline', 'Start generation', 'View examples'];
    }
    
    // Check for wizard step queries
    if (lowerQuery.includes('step') || lowerQuery.includes('wizard')) {
      const stepMatch = lowerQuery.match(/step\s*(\d)/);
      if (stepMatch) {
        const step = this.getWizardStep(parseInt(stepMatch[1]));
        if (step) {
          response = `**${step.name}** (Step ${step.step})\n\n${step.description}\n\n`;
          response += `**Capabilities:** ${step.capabilities.join(', ')}\n\n`;
          if (step.commonIssues && step.commonIssues.length > 0) {
            response += `**Common Issues:**\n${step.commonIssues.map(i => `• ${i}`).join('\n')}\n\n`;
            response += `**Solutions:**\n${step.troubleshooting.map(t => `• ${t}`).join('\n')}`;
          }
          suggestedActions = ['Go to this step', 'Next step', 'Help with specific issue'];
        }
      }
    }
    
    // Check for editing queries
    if (lowerQuery.includes('edit') || lowerQuery.includes('change') || lowerQuery.includes('modify')) {
      response = '**Editing Capabilities**\n\n';
      response += EDITING_KNOWLEDGE.modes.map(m => `• **${m.name}**: ${m.description}`).join('\n');
      response += '\n\n**Post-Generation Actions:**\n';
      response += EDITING_KNOWLEDGE.postGenerationActions.map(a => `• **${a.action}**: ${a.description}`).join('\n');
      suggestedActions = ['Open editor', 'Regenerate element', 'View version history'];
    }
    
    // Check for agent/A2A queries
    if (lowerQuery.includes('agent') || lowerQuery.includes('a2a') || lowerQuery.includes('orchestrat')) {
      response = `**A2A Agent Orchestration**\n\n${A2A_AGENT_KNOWLEDGE.description}\n\n`;
      response += `**Available Agents:**\n`;
      response += A2A_AGENT_KNOWLEDGE.agents.map(a => `• **${a.name}**: ${a.role}`).join('\n');
      response += `\n\n**Self-Correction:** ${A2A_AGENT_KNOWLEDGE.selfCorrectionEngine.targetAutomation}% automation target with ${A2A_AGENT_KNOWLEDGE.selfCorrectionEngine.rubrics.length} quality rubrics.`;
      suggestedActions = ['View agent status', 'Check orchestration logs', 'Learn about self-correction'];
    }
    
    // Check for billing/credits
    if (lowerQuery.includes('credit') || lowerQuery.includes('billing') || lowerQuery.includes('cost')) {
      escalateToHuman = true; // Billing issues should be handled by humans
      response = 'I can help with credit and billing questions! For detailed billing support, I\'ll connect you with our support team.';
      suggestedActions = ['View credit balance', 'Upgrade plan', 'Contact support'];
    }
    
    // Default response
    if (!response) {
      const stats = this.getStats();
      response = `I'm here to help! I have knowledge of:\n\n`;
      response += `• **${stats.total} pipelines** across ${stats.byCategory.length} categories\n`;
      response += `• **8-step wizard** for content creation\n`;
      response += `• **${A2A_AGENT_KNOWLEDGE.agents.length} AI agents** with A2A orchestration\n`;
      response += `• **${EDITING_KNOWLEDGE.modes.length} editing modes** for post-generation\n\n`;
      response += `What would you like to know more about?`;
      suggestedActions = ['Show all pipelines', 'Explain wizard steps', 'How does A2A work?', 'Editing help'];
    }
    
    return { response, relatedPipelines, suggestedActions, escalateToHuman };
  }
  
  // Get comprehensive knowledge dump for training
  getFullKnowledgeDump() {
    return {
      pipelines: PIPELINE_IO_REGISTRY,
      pipelineCategories: PIPELINE_CATEGORIES_DETAILED,
      categoryMetadata: PIPELINE_CATEGORY_METADATA,
      wizard: WIZARD_STEPS_KNOWLEDGE,
      editing: EDITING_KNOWLEDGE,
      a2a: A2A_AGENT_KNOWLEDGE,
      support: SUPPORT_KNOWLEDGE,
      stats: this.getStats()
    };
  }
}

// Export singleton instance
export const askGeniePipelineKnowledgeBase = new AskGeniePipelineKnowledgeBase();

// Export types
export type { PipelineIOEntry, PipelineIOCategory };
