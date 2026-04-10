/**
 * MODEL ALIGNMENT SERVICE
 * 
 * Ensures content generation models are aligned across:
 * - Text/Content generation
 * - Translation
 * - Speech/Voice (TTS/STT)
 * - Image generation
 * - Video generation
 * 
 * All synced with topic, category, and research data for balanced output.
 */

import { LANGUAGE_VOICE_PAIRINGS } from '@/hooks/useAskGenieVoice';

// ==================== TYPES ====================

export type ContentCategory = 
  | 'marketing' 
  | 'research' 
  | 'education' 
  | 'healthcare' 
  | 'business' 
  | 'technology' 
  | 'finance' 
  | 'creative'
  | 'data-analysis'
  | 'product-launch'
  | 'investor-pitch'
  | 'conference'
  | 'training'
  | 'internal'
  // EXPANDED CATEGORIES
  | 'oil-gas'
  | 'pharma'
  | 'biotech'
  | 'startup'
  | 'travel'
  | 'hospitality'
  | 'veterinary'
  | 'pets'
  | 'hospitals'
  | 'clinics'
  | 'nursing'
  | 'manufacturing'
  | 'retail'
  | 'logistics'
  | 'real-estate'
  | 'legal'
  | 'government'
  | 'nonprofit'
  | 'energy'
  | 'automotive'
  | 'aerospace'
  | 'agriculture'
  | 'consulting';

export type ContentSegment = 
  | 'executive'
  | 'technical'
  | 'general-audience'
  | 'sales'
  | 'academic'
  | 'healthcare-professional'
  | 'patient-facing'
  | 'investor';

export interface ModelAlignmentConfig {
  category: ContentCategory;
  segment: ContentSegment;
  topic: string;
  language: string;
  
  // Provider selections
  textProvider: TextProvider;
  translationProvider: TranslationProvider;
  voiceProvider: VoiceProvider;
  imageProvider: ImageProvider;
  videoProvider: VideoProvider;
  
  // Quality settings
  qualityTier: 'fast' | 'balanced' | 'premium';
  researchDepth: 'light' | 'standard' | 'deep';
  
  // Auto-align toggles
  autoAlignProviders: boolean;
  syncWithLanguage: boolean;
}

export interface TextProvider {
  id: string;
  name: string;
  model: string;
  strengths: string[];
  bestFor: ContentCategory[];
}

export interface TranslationProvider {
  id: string;
  name: string;
  regions: string[];
  quality: 'standard' | 'high' | 'native';
}

export interface VoiceProvider {
  id: string;
  name: string;
  languages: string[];
  voices: number;
  quality: 'standard' | 'neural' | 'premium';
}

export interface ImageProvider {
  id: string;
  name: string;
  styles: string[];
  bestFor: ContentCategory[];
  speed: 'fast' | 'medium' | 'slow';
}

export interface VideoProvider {
  id: string;
  name: string;
  maxDuration: number;
  quality: string;
}

// ==================== PROVIDER CATALOGS ====================

export const TEXT_PROVIDERS: TextProvider[] = [
  { 
    id: 'gemini-3-flash', 
    name: 'Gemini 3 Flash', 
    model: 'google/gemini-3-flash-preview',
    strengths: ['Speed', 'Multilingual', 'Reasoning'],
    bestFor: ['marketing', 'education', 'business']
  },
  { 
    id: 'gemini-2.5-pro', 
    name: 'Gemini 2.5 Pro', 
    model: 'google/gemini-2.5-pro',
    strengths: ['Complex reasoning', 'Long context', 'Accuracy'],
    bestFor: ['research', 'healthcare', 'data-analysis']
  },
  { 
    id: 'gpt-5', 
    name: 'GPT-5', 
    model: 'openai/gpt-5',
    strengths: ['Premium quality', 'Nuance', 'Creative'],
    bestFor: ['creative', 'investor-pitch', 'business']
  },
  { 
    id: 'gpt-5-mini', 
    name: 'GPT-5 Mini', 
    model: 'openai/gpt-5-mini',
    strengths: ['Balanced', 'Cost-effective', 'Fast'],
    bestFor: ['training', 'internal', 'education']
  },
  { 
    id: 'claude-3.5', 
    name: 'Claude 3.5 Sonnet', 
    model: 'claude-sonnet-4-6',
    strengths: ['Nuanced writing', 'Safety', 'Analysis'],
    bestFor: ['healthcare', 'education', 'research']
  },
  { 
    id: 'deepseek', 
    name: 'DeepSeek', 
    model: 'deepseek/deepseek-chat',
    strengths: ['Technical', 'Reasoning', 'Cost-effective'],
    bestFor: ['technology', 'data-analysis', 'research']
  }
];

export const TRANSLATION_PROVIDERS: TranslationProvider[] = [
  { id: 'deepl', name: 'DeepL', regions: ['europe', 'americas'], quality: 'native' },
  { id: 'google', name: 'Google Translate', regions: ['global'], quality: 'high' },
  { id: 'qwen-mt', name: 'Qwen-MT', regions: ['asia', 'china'], quality: 'native' },
  { id: 'azure', name: 'Azure Translator', regions: ['global'], quality: 'high' },
  { id: 'nllb', name: 'NLLB (Meta)', regions: ['africa', 'india'], quality: 'high' },
  { id: 'alibaba', name: 'Alibaba Translation', regions: ['asia'], quality: 'high' }
];

export const VOICE_PROVIDERS: VoiceProvider[] = [
  { id: 'elevenlabs', name: 'ElevenLabs', languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'hi', 'ar', 'zh', 'ja', 'ko'], voices: 100, quality: 'premium' },
  { id: 'openai-tts', name: 'OpenAI TTS', languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'], voices: 6, quality: 'neural' },
  { id: 'google-tts', name: 'Google TTS', languages: ['global'], voices: 200, quality: 'neural' },
  { id: 'azure-neural', name: 'Azure Neural', languages: ['global'], voices: 300, quality: 'premium' },
  { id: 'aws-polly', name: 'AWS Polly', languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'], voices: 60, quality: 'neural' },
  { id: 'alibaba-tts', name: 'Alibaba TTS', languages: ['zh', 'en', 'ja', 'ko'], voices: 50, quality: 'neural' }
];

export const IMAGE_PROVIDERS: ImageProvider[] = [
  { id: 'modelslab', name: 'ModelsLab', styles: ['photorealistic', 'artistic', 'corporate', '3d'], bestFor: ['marketing', 'creative', 'product-launch'], speed: 'fast' },
  { id: 'flux', name: 'Flux', styles: ['photorealistic', 'artistic', 'abstract'], bestFor: ['creative', 'marketing'], speed: 'medium' },
  { id: 'gemini-image', name: 'Gemini Image', styles: ['balanced', 'professional', 'educational'], bestFor: ['education', 'business', 'training'], speed: 'fast' },
  { id: 'dalle-3', name: 'DALL-E 3', styles: ['photorealistic', 'artistic', 'infographic'], bestFor: ['creative', 'marketing', 'conference'], speed: 'medium' },
  { id: 'stability', name: 'Stability AI', styles: ['artistic', 'abstract', 'stylized'], bestFor: ['creative', 'research'], speed: 'slow' },
  { id: 'stock', name: 'Stock Images', styles: ['professional', 'corporate'], bestFor: ['business', 'internal', 'healthcare'], speed: 'fast' }
];

export const VIDEO_PROVIDERS: VideoProvider[] = [
  { id: 'modelslab-video', name: 'ModelsLab Video', maxDuration: 30, quality: '1080p' },
  { id: 'runway', name: 'Runway Gen-3', maxDuration: 10, quality: '4K' },
  { id: 'pika', name: 'Pika Labs', maxDuration: 4, quality: '1080p' },
  { id: 'gemini-video', name: 'Gemini Video', maxDuration: 60, quality: '1080p' }
];

// ==================== ALIGNMENT RECOMMENDATIONS ====================

export interface AlignmentRecommendation {
  textProvider: TextProvider;
  translationProvider: TranslationProvider;
  voiceProvider: VoiceProvider;
  imageProvider: ImageProvider;
  videoProvider: VideoProvider;
  reasoning: string;
  confidence: number;
}

export const getAlignedProviders = (
  category: ContentCategory,
  segment: ContentSegment,
  language: string,
  qualityTier: 'fast' | 'balanced' | 'premium' = 'balanced'
): AlignmentRecommendation => {
  // Determine best text provider based on category and quality
  let textProvider: TextProvider;
  if (qualityTier === 'premium') {
    textProvider = TEXT_PROVIDERS.find(p => p.id === 'gpt-5') || TEXT_PROVIDERS[0];
  } else if (qualityTier === 'fast') {
    textProvider = TEXT_PROVIDERS.find(p => p.id === 'gemini-3-flash') || TEXT_PROVIDERS[0];
  } else {
    textProvider = TEXT_PROVIDERS.find(p => p.bestFor.includes(category)) || TEXT_PROVIDERS[0];
  }
  
  // Determine translation provider based on language region
  let translationProvider: TranslationProvider;
  const langPairing = LANGUAGE_VOICE_PAIRINGS.find(p => p.languageCode === language);
  const region = 'global';
  
  if (['western_europe', 'eastern_europe', 'americas'].includes(region)) {
    translationProvider = TRANSLATION_PROVIDERS.find(p => p.id === 'deepl')!;
  } else if (['east_asia'].includes(region)) {
    translationProvider = TRANSLATION_PROVIDERS.find(p => p.id === 'qwen-mt')!;
  } else if (['south_asia', 'africa'].includes(region)) {
    translationProvider = TRANSLATION_PROVIDERS.find(p => p.id === 'nllb')!;
  } else {
    translationProvider = TRANSLATION_PROVIDERS.find(p => p.id === 'google')!;
  }
  
  // Determine voice provider based on language and quality
  let voiceProvider: VoiceProvider;
  if (qualityTier === 'premium') {
    voiceProvider = VOICE_PROVIDERS.find(p => p.id === 'elevenlabs')!;
  } else if (['zh', 'ja', 'ko'].includes(language.split('-')[0])) {
    voiceProvider = VOICE_PROVIDERS.find(p => p.id === 'alibaba-tts') || VOICE_PROVIDERS.find(p => p.id === 'google-tts')!;
  } else {
    voiceProvider = VOICE_PROVIDERS.find(p => p.id === 'google-tts')!;
  }
  
  // Determine image provider based on category
  let imageProvider: ImageProvider;
  if (['creative', 'marketing', 'product-launch'].includes(category)) {
    imageProvider = IMAGE_PROVIDERS.find(p => p.id === 'modelslab')!;
  } else if (['education', 'training'].includes(category)) {
    imageProvider = IMAGE_PROVIDERS.find(p => p.id === 'gemini-image')!;
  } else if (['healthcare', 'business', 'internal'].includes(category)) {
    imageProvider = IMAGE_PROVIDERS.find(p => p.id === 'stock')!;
  } else {
    imageProvider = IMAGE_PROVIDERS.find(p => p.id === 'flux')!;
  }
  
  // Video provider based on quality tier
  let videoProvider: VideoProvider;
  if (qualityTier === 'premium') {
    videoProvider = VIDEO_PROVIDERS.find(p => p.id === 'runway')!;
  } else {
    videoProvider = VIDEO_PROVIDERS.find(p => p.id === 'modelslab-video')!;
  }
  
  const reasoning = `For ${category} content targeting ${segment} audience in ${language}: Using ${textProvider.name} for text (${textProvider.strengths.join(', ')}), ${translationProvider.name} for translation (${translationProvider.quality} quality), ${voiceProvider.name} for voice (${voiceProvider.quality}), ${imageProvider.name} for images, and ${videoProvider.name} for video.`;
  
  return {
    textProvider,
    translationProvider,
    voiceProvider,
    imageProvider,
    videoProvider,
    reasoning,
    confidence: qualityTier === 'premium' ? 95 : qualityTier === 'balanced' ? 88 : 80
  };
};

// ==================== TEMPLATE CATEGORIES ====================

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: TemplateDefinition[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: ContentCategory;
  segment: ContentSegment;
  description: string;
  slideCount: number;
  structure: SlideStructure[];
  dataTypes: DataRepresentationType[];
  colorScheme: string;
  fontPairing: { heading: string; body: string };
  thumbnail?: string;
  isPremium: boolean;
  tags: string[];
}

export interface SlideStructure {
  type: 'title' | 'content' | 'data' | 'comparison' | 'timeline' | 'team' | 'quote' | 'image' | 'video' | 'chart' | 'table' | 'cta' | 'closing';
  layout: 'full' | 'split' | 'thirds' | 'focus' | 'grid';
  hasImage: boolean;
  hasChart: boolean;
  hasTable: boolean;
}

export type DataRepresentationType = 
  | 'bar-chart' 
  | 'line-chart' 
  | 'pie-chart' 
  | 'donut-chart'
  | 'area-chart'
  | 'scatter-plot'
  | 'table'
  | 'infographic'
  | 'timeline'
  | 'funnel'
  | 'gauge'
  | 'map'
  | 'comparison-matrix'
  | 'process-flow';

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    description: 'Templates for campaigns, pitches, and customer engagement',
    icon: '📣',
    templates: [
      {
        id: 'product-launch',
        name: 'Product Launch',
        category: 'product-launch',
        segment: 'general-audience',
        description: 'Announce new products with impact',
        slideCount: 12,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
          { type: 'comparison', layout: 'thirds', hasImage: false, hasChart: false, hasTable: true },
          { type: 'cta', layout: 'focus', hasImage: true, hasChart: false, hasTable: false },
        ],
        dataTypes: ['bar-chart', 'comparison-matrix', 'timeline'],
        colorScheme: 'vibrant',
        fontPairing: { heading: 'Montserrat', body: 'Open Sans' },
        isPremium: false,
        tags: ['launch', 'product', 'announcement']
      },
      {
        id: 'sales-pitch',
        name: 'Sales Pitch',
        category: 'business',
        segment: 'sales',
        description: 'Persuasive sales presentations',
        slideCount: 10,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
          { type: 'cta', layout: 'focus', hasImage: true, hasChart: false, hasTable: false },
        ],
        dataTypes: ['bar-chart', 'funnel', 'comparison-matrix'],
        colorScheme: 'professional',
        fontPairing: { heading: 'Poppins', body: 'Roboto' },
        isPremium: false,
        tags: ['sales', 'pitch', 'persuasive']
      },
      {
        id: 'brand-story',
        name: 'Brand Story',
        category: 'marketing',
        segment: 'general-audience',
        description: 'Tell your brand narrative',
        slideCount: 15,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'timeline', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'quote', layout: 'focus', hasImage: true, hasChart: false, hasTable: false },
          { type: 'team', layout: 'grid', hasImage: true, hasChart: false, hasTable: false },
        ],
        dataTypes: ['timeline', 'infographic'],
        colorScheme: 'warm',
        fontPairing: { heading: 'Playfair Display', body: 'Lora' },
        isPremium: true,
        tags: ['brand', 'story', 'narrative']
      }
    ]
  },
  {
    id: 'research',
    name: 'Research & Analysis',
    description: 'Data-driven templates for insights and findings',
    icon: '📊',
    templates: [
      {
        id: 'research-report',
        name: 'Research Report',
        category: 'research',
        segment: 'academic',
        description: 'Present research findings professionally',
        slideCount: 20,
        structure: [
          { type: 'title', layout: 'full', hasImage: false, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: false, hasChart: true, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: true },
          { type: 'chart', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
          { type: 'table', layout: 'full', hasImage: false, hasChart: false, hasTable: true },
        ],
        dataTypes: ['bar-chart', 'line-chart', 'scatter-plot', 'table'],
        colorScheme: 'academic',
        fontPairing: { heading: 'Merriweather', body: 'Source Sans Pro' },
        isPremium: false,
        tags: ['research', 'academic', 'data']
      },
      {
        id: 'market-analysis',
        name: 'Market Analysis',
        category: 'data-analysis',
        segment: 'executive',
        description: 'Market insights and competitive analysis',
        slideCount: 15,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
          { type: 'comparison', layout: 'split', hasImage: false, hasChart: true, hasTable: true },
          { type: 'chart', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
        ],
        dataTypes: ['pie-chart', 'bar-chart', 'comparison-matrix', 'map'],
        colorScheme: 'corporate',
        fontPairing: { heading: 'Inter', body: 'Inter' },
        isPremium: true,
        tags: ['market', 'analysis', 'competitive']
      }
    ]
  },
  {
    id: 'investor',
    name: 'Investor & Finance',
    description: 'Templates for fundraising and financial presentations',
    icon: '💰',
    templates: [
      {
        id: 'investor-pitch',
        name: 'Investor Pitch Deck',
        category: 'investor-pitch',
        segment: 'investor',
        description: 'Raise funding with a compelling pitch',
        slideCount: 12,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
          { type: 'chart', layout: 'split', hasImage: false, hasChart: true, hasTable: false },
          { type: 'cta', layout: 'focus', hasImage: false, hasChart: false, hasTable: false },
        ],
        dataTypes: ['bar-chart', 'line-chart', 'funnel', 'gauge'],
        colorScheme: 'bold',
        fontPairing: { heading: 'DM Sans', body: 'DM Sans' },
        isPremium: true,
        tags: ['investor', 'pitch', 'fundraising', 'startup']
      },
      {
        id: 'financial-report',
        name: 'Financial Report',
        category: 'finance',
        segment: 'executive',
        description: 'Quarterly/annual financial summaries',
        slideCount: 18,
        structure: [
          { type: 'title', layout: 'full', hasImage: false, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
          { type: 'table', layout: 'full', hasImage: false, hasChart: false, hasTable: true },
          { type: 'chart', layout: 'split', hasImage: false, hasChart: true, hasTable: false },
        ],
        dataTypes: ['bar-chart', 'line-chart', 'table', 'area-chart'],
        colorScheme: 'minimal',
        fontPairing: { heading: 'IBM Plex Sans', body: 'IBM Plex Sans' },
        isPremium: false,
        tags: ['finance', 'report', 'quarterly']
      }
    ]
  },
  {
    id: 'education',
    name: 'Education & Training',
    description: 'Templates for learning and development',
    icon: '🎓',
    templates: [
      {
        id: 'course-material',
        name: 'Course Material',
        category: 'education',
        segment: 'general-audience',
        description: 'Educational content and lessons',
        slideCount: 25,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
          { type: 'quote', layout: 'focus', hasImage: false, hasChart: false, hasTable: false },
        ],
        dataTypes: ['infographic', 'process-flow', 'timeline'],
        colorScheme: 'educational',
        fontPairing: { heading: 'Nunito', body: 'Nunito Sans' },
        isPremium: false,
        tags: ['education', 'course', 'learning']
      },
      {
        id: 'employee-training',
        name: 'Employee Training',
        category: 'training',
        segment: 'general-audience',
        description: 'Onboarding and skill development',
        slideCount: 20,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: false, hasTable: true },
          { type: 'timeline', layout: 'full', hasImage: false, hasChart: false, hasTable: false },
        ],
        dataTypes: ['process-flow', 'timeline', 'table'],
        colorScheme: 'friendly',
        fontPairing: { heading: 'Quicksand', body: 'Open Sans' },
        isPremium: false,
        tags: ['training', 'onboarding', 'HR']
      }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Templates for medical and healthcare presentations',
    icon: '🏥',
    templates: [
      {
        id: 'medical-presentation',
        name: 'Medical Presentation',
        category: 'healthcare',
        segment: 'healthcare-professional',
        description: 'Clinical and medical content',
        slideCount: 15,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: true },
        ],
        dataTypes: ['bar-chart', 'line-chart', 'table'],
        colorScheme: 'medical',
        fontPairing: { heading: 'Lato', body: 'Open Sans' },
        isPremium: false,
        tags: ['healthcare', 'medical', 'clinical']
      },
      {
        id: 'patient-education',
        name: 'Patient Education',
        category: 'healthcare',
        segment: 'patient-facing',
        description: 'Patient-friendly health information',
        slideCount: 12,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
        ],
        dataTypes: ['infographic', 'process-flow'],
        colorScheme: 'calming',
        fontPairing: { heading: 'Cabin', body: 'Nunito' },
        isPremium: false,
        tags: ['patient', 'education', 'health']
      }
    ]
  },
  {
    id: 'technology',
    name: 'Technology & Product',
    description: 'Templates for tech and product presentations',
    icon: '💻',
    templates: [
      {
        id: 'tech-overview',
        name: 'Tech Overview',
        category: 'technology',
        segment: 'technical',
        description: 'Technical product and platform overviews',
        slideCount: 15,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
          { type: 'comparison', layout: 'thirds', hasImage: false, hasChart: false, hasTable: true },
        ],
        dataTypes: ['process-flow', 'comparison-matrix', 'bar-chart'],
        colorScheme: 'tech',
        fontPairing: { heading: 'Space Grotesk', body: 'Inter' },
        isPremium: false,
        tags: ['technology', 'product', 'technical']
      },
      {
        id: 'api-documentation',
        name: 'API Documentation',
        category: 'technology',
        segment: 'technical',
        description: 'Technical API and integration docs',
        slideCount: 20,
        structure: [
          { type: 'title', layout: 'full', hasImage: false, hasChart: false, hasTable: false },
          { type: 'content', layout: 'full', hasImage: false, hasChart: false, hasTable: true },
          { type: 'data', layout: 'split', hasImage: false, hasChart: false, hasTable: true },
        ],
        dataTypes: ['table', 'process-flow'],
        colorScheme: 'dark',
        fontPairing: { heading: 'JetBrains Mono', body: 'Inter' },
        isPremium: true,
        tags: ['API', 'documentation', 'developer']
      }
    ]
  },
  // ==================== CONSULTING STYLE TEMPLATES ====================
  {
    id: 'consulting',
    name: 'Consulting & Strategy',
    description: 'McKinsey, BCG, Bain-style strategic templates',
    icon: '📈',
    templates: [
      {
        id: 'swot-analysis',
        name: 'SWOT Analysis',
        category: 'consulting',
        segment: 'executive',
        description: 'Strengths, Weaknesses, Opportunities, Threats',
        slideCount: 8,
        structure: [
          { type: 'title', layout: 'full', hasImage: false, hasChart: false, hasTable: false },
          { type: 'data', layout: 'grid', hasImage: false, hasChart: true, hasTable: false },
        ],
        dataTypes: ['comparison-matrix', 'bar-chart'],
        colorScheme: 'corporate',
        fontPairing: { heading: 'Montserrat', body: 'Open Sans' },
        isPremium: true,
        tags: ['swot', 'analysis', 'strategy', 'mckinsey']
      },
      {
        id: 'funnel-analysis',
        name: 'Funnel Analysis',
        category: 'consulting',
        segment: 'executive',
        description: 'Sales/conversion funnel visualization',
        slideCount: 10,
        structure: [
          { type: 'title', layout: 'full', hasImage: false, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
        ],
        dataTypes: ['funnel', 'bar-chart', 'line-chart'],
        colorScheme: 'professional',
        fontPairing: { heading: 'DM Sans', body: 'Inter' },
        isPremium: true,
        tags: ['funnel', 'sales', 'conversion', 'bcg']
      },
      {
        id: 'pyramid-framework',
        name: 'Pyramid Framework',
        category: 'consulting',
        segment: 'executive',
        description: 'Hierarchical pyramid diagrams',
        slideCount: 8,
        structure: [
          { type: 'title', layout: 'full', hasImage: false, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: false },
        ],
        dataTypes: ['infographic', 'process-flow'],
        colorScheme: 'corporate',
        fontPairing: { heading: 'Inter', body: 'Inter' },
        isPremium: true,
        tags: ['pyramid', 'framework', 'hierarchy', 'bain']
      },
      {
        id: 'gartner-quadrant',
        name: 'Gartner Magic Quadrant',
        category: 'consulting',
        segment: 'executive',
        description: 'Market positioning quadrant analysis',
        slideCount: 6,
        structure: [
          { type: 'title', layout: 'full', hasImage: false, hasChart: false, hasTable: false },
          { type: 'data', layout: 'grid', hasImage: false, hasChart: true, hasTable: false },
        ],
        dataTypes: ['scatter-plot', 'comparison-matrix'],
        colorScheme: 'minimal',
        fontPairing: { heading: 'IBM Plex Sans', body: 'IBM Plex Sans' },
        isPremium: true,
        tags: ['gartner', 'quadrant', 'positioning', 'market']
      }
    ]
  },
  // ==================== INDUSTRY SPECIFIC ====================
  {
    id: 'industry',
    name: 'Industry Specific',
    description: 'Oil & Gas, Pharma, Biotech, Travel, Hospitality',
    icon: '🏭',
    templates: [
      {
        id: 'oil-gas-report',
        name: 'Oil & Gas Report',
        category: 'oil-gas',
        segment: 'executive',
        description: 'Energy sector presentations',
        slideCount: 15,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: true },
        ],
        dataTypes: ['line-chart', 'bar-chart', 'map', 'table'],
        colorScheme: 'corporate',
        fontPairing: { heading: 'Roboto', body: 'Roboto' },
        isPremium: false,
        tags: ['oil', 'gas', 'energy', 'petroleum']
      },
      {
        id: 'pharma-biotech',
        name: 'Pharma & Biotech',
        category: 'pharma',
        segment: 'healthcare-professional',
        description: 'Drug development and research presentations',
        slideCount: 18,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'data', layout: 'full', hasImage: false, hasChart: true, hasTable: true },
        ],
        dataTypes: ['timeline', 'bar-chart', 'line-chart', 'table'],
        colorScheme: 'medical',
        fontPairing: { heading: 'Lato', body: 'Open Sans' },
        isPremium: true,
        tags: ['pharma', 'biotech', 'drug', 'clinical']
      },
      {
        id: 'travel-hospitality',
        name: 'Travel & Hospitality',
        category: 'travel',
        segment: 'general-audience',
        description: 'Hotels, tourism, travel industry',
        slideCount: 12,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
        ],
        dataTypes: ['infographic', 'map', 'bar-chart'],
        colorScheme: 'warm',
        fontPairing: { heading: 'Poppins', body: 'Open Sans' },
        isPremium: false,
        tags: ['travel', 'hospitality', 'hotel', 'tourism']
      },
      {
        id: 'veterinary-pets',
        name: 'Veterinary & Pets',
        category: 'veterinary',
        segment: 'general-audience',
        description: 'Animal care and veterinary presentations',
        slideCount: 10,
        structure: [
          { type: 'title', layout: 'full', hasImage: true, hasChart: false, hasTable: false },
          { type: 'content', layout: 'split', hasImage: true, hasChart: false, hasTable: false },
        ],
        dataTypes: ['infographic', 'process-flow'],
        colorScheme: 'nature',
        fontPairing: { heading: 'Nunito', body: 'Open Sans' },
        isPremium: false,
        tags: ['veterinary', 'pets', 'animal', 'care']
      }
    ]
  }
];

// ==================== SLIDE EDITING ACTIONS ====================

export interface SlideEditAction {
  id: string;
  type: 'accept' | 'skip' | 'edit' | 'enhance' | 'add' | 'replace' | 'delete' | 'reorder';
  slideId?: string;
  payload?: any;
}

export interface SlideEnhancementOptions {
  enhanceType: 'content' | 'visuals' | 'data' | 'language' | 'all';
  targetModel?: string;
  customPrompt?: string;
  preserveOriginal: boolean;
}

export interface ProviderSwapOptions {
  currentProvider: string;
  newProvider: string;
  affectedSlides: string[];
  regenerate: boolean;
}

// ==================== SERVICE CLASS ====================

class ModelAlignmentService {
  private currentConfig: ModelAlignmentConfig | null = null;
  
  // Get aligned providers for a configuration
  getAlignedProviders(
    category: ContentCategory,
    segment: ContentSegment,
    language: string,
    qualityTier: 'fast' | 'balanced' | 'premium' = 'balanced'
  ): AlignmentRecommendation {
    return getAlignedProviders(category, segment, language, qualityTier);
  }
  
  // Set current configuration
  setConfig(config: ModelAlignmentConfig): void {
    this.currentConfig = config;
  }
  
  // Get current configuration
  getConfig(): ModelAlignmentConfig | null {
    return this.currentConfig;
  }
  
  // Get templates by category
  getTemplatesByCategory(categoryId: string): TemplateDefinition[] {
    const category = TEMPLATE_CATEGORIES.find(c => c.id === categoryId);
    return category?.templates || [];
  }
  
  // Get all templates
  getAllTemplates(): TemplateDefinition[] {
    return TEMPLATE_CATEGORIES.flatMap(c => c.templates);
  }
  
  // Search templates
  searchTemplates(query: string): TemplateDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTemplates().filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Get recommended templates based on category and segment
  getRecommendedTemplates(category: ContentCategory, segment: ContentSegment): TemplateDefinition[] {
    return this.getAllTemplates()
      .filter(t => t.category === category || t.segment === segment)
      .slice(0, 5);
  }
  
  // Get provider options for swapping
  getProviderOptions(providerType: 'text' | 'translation' | 'voice' | 'image' | 'video'): any[] {
    switch (providerType) {
      case 'text': return TEXT_PROVIDERS;
      case 'translation': return TRANSLATION_PROVIDERS;
      case 'voice': return VOICE_PROVIDERS;
      case 'image': return IMAGE_PROVIDERS;
      case 'video': return VIDEO_PROVIDERS;
      default: return [];
    }
  }
}

export const modelAlignmentService = new ModelAlignmentService();

export { ModelAlignmentService };
