/**
 * useTemplateLibrary - Hook for managing consulting frameworks and industry templates
 * Fully database-driven with AI model configuration support
 * Supports user-created templates with public/private visibility
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { toast } from 'sonner';

// AI Model configuration for templates
export interface TemplateAIModelConfig {
  textModel: string;
  imageModel: string;
  voiceModel: string;
  translationModel: string;
  confidence: number;
  reasoning?: string;
}

// Types
export interface ConsultingFramework {
  id: string;
  name: string;
  description?: string;
  category: 'strategy' | 'growth' | 'operations' | 'universal' | 'industry-specific' | 'custom';
  frameworks: string[];
  tags: string[];
  useCases: string[];
  visualStyle: 'minimal' | 'data-heavy' | 'balanced';
  industries: string[];
  isSystem: boolean;
  visibility: 'private' | 'public' | 'pending_review';
  createdBy?: string;
  usageCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt?: string;
  aiModelConfig?: TemplateAIModelConfig;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  description?: string;
  industry: string;
  subIndustry?: string;
  templateType: string;
  frameworks: string[];
  tags: string[];
  slideSuggestions: any[];
  recommendedVisuals: string[];
  isSystem: boolean;
  visibility: 'private' | 'public' | 'pending_review';
  createdBy?: string;
  usageCount: number;
  ratingAvg: number;
  ratingCount: number;
  previewImageUrl?: string;
  createdAt?: string;
  aiModelConfig?: TemplateAIModelConfig;
}

// AI Provider definitions with confidence scores and rankings
export interface AIProvider {
  id: string;
  name: string;
  shortName: string;
  category: 'text' | 'image' | 'voice' | 'translation';
  confidenceScore: number;
  ranking: number;
  costTier: 'low' | 'medium' | 'high';
  speedTier: 'fast' | 'medium' | 'slow';
  qualityTier: 'basic' | 'standard' | 'premium';
  bestFor: string[];
  limitations?: string[];
}

export const AI_PROVIDERS: AIProvider[] = [
  // Text Models
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', shortName: 'Gemini Flash', category: 'text', confidenceScore: 95, ranking: 1, costTier: 'low', speedTier: 'fast', qualityTier: 'premium', bestFor: ['general', 'fast-iteration', 'multilingual'] },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', shortName: 'Gemini Pro', category: 'text', confidenceScore: 94, ranking: 2, costTier: 'medium', speedTier: 'medium', qualityTier: 'premium', bestFor: ['complex-reasoning', 'multimodal', 'research'] },
  { id: 'openai/gpt-5', name: 'GPT-5', shortName: 'GPT-5', category: 'text', confidenceScore: 96, ranking: 1, costTier: 'high', speedTier: 'medium', qualityTier: 'premium', bestFor: ['consulting', 'strategic', 'creative-writing'] },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', shortName: 'GPT-5 Mini', category: 'text', confidenceScore: 88, ranking: 3, costTier: 'low', speedTier: 'fast', qualityTier: 'standard', bestFor: ['drafts', 'simple-tasks', 'high-volume'] },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', shortName: 'Claude 3.5', category: 'text', confidenceScore: 93, ranking: 2, costTier: 'medium', speedTier: 'medium', qualityTier: 'premium', bestFor: ['healthcare', 'legal', 'compliance', 'nuanced-writing'] },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek', shortName: 'DeepSeek', category: 'text', confidenceScore: 85, ranking: 4, costTier: 'low', speedTier: 'fast', qualityTier: 'standard', bestFor: ['code', 'technical', 'cost-effective'] },
  { id: 'alibaba/qwen-2.5', name: 'Qwen 2.5', shortName: 'Qwen 2.5', category: 'text', confidenceScore: 87, ranking: 3, costTier: 'low', speedTier: 'fast', qualityTier: 'standard', bestFor: ['asian-languages', 'chinese', 'japanese', 'korean'] },
  
  // Image Models
  { id: 'modelslab', name: 'ModelsLab', shortName: 'ModelsLab', category: 'image', confidenceScore: 92, ranking: 1, costTier: 'medium', speedTier: 'medium', qualityTier: 'premium', bestFor: ['photorealistic', 'product-shots', 'diverse-styles'] },
  { id: 'flux-pro', name: 'Flux Pro', shortName: 'Flux Pro', category: 'image', confidenceScore: 90, ranking: 2, costTier: 'medium', speedTier: 'medium', qualityTier: 'premium', bestFor: ['professional', 'business', 'clean-design'] },
  { id: 'flux-schnell', name: 'Flux Schnell', shortName: 'Flux Fast', category: 'image', confidenceScore: 82, ranking: 3, costTier: 'low', speedTier: 'fast', qualityTier: 'standard', bestFor: ['drafts', 'iterations', 'speed-priority'] },
  { id: 'dall-e-3', name: 'DALL-E 3', shortName: 'DALL-E 3', category: 'image', confidenceScore: 88, ranking: 2, costTier: 'high', speedTier: 'slow', qualityTier: 'premium', bestFor: ['creative', 'artistic', 'unique-styles'] },
  { id: 'stability', name: 'Stability AI', shortName: 'Stability', category: 'image', confidenceScore: 85, ranking: 3, costTier: 'medium', speedTier: 'medium', qualityTier: 'standard', bestFor: ['landscapes', 'textures', 'backgrounds'] },
  { id: 'stock', name: 'Stock Images', shortName: 'Stock', category: 'image', confidenceScore: 75, ranking: 5, costTier: 'low', speedTier: 'fast', qualityTier: 'basic', bestFor: ['quick-placeholder', 'generic', 'licensed'] },
  
  // Voice Models
  { id: 'elevenlabs-multilingual', name: 'ElevenLabs Multilingual', shortName: 'ElevenLabs', category: 'voice', confidenceScore: 96, ranking: 1, costTier: 'high', speedTier: 'medium', qualityTier: 'premium', bestFor: ['natural-speech', 'voice-cloning', 'premium-quality'] },
  { id: 'openai-tts-hd', name: 'OpenAI TTS HD', shortName: 'OpenAI', category: 'voice', confidenceScore: 88, ranking: 2, costTier: 'medium', speedTier: 'fast', qualityTier: 'standard', bestFor: ['english', 'consistent', 'reliable'] },
  { id: 'google-wavenet', name: 'Google WaveNet', shortName: 'WaveNet', category: 'voice', confidenceScore: 90, ranking: 2, costTier: 'medium', speedTier: 'fast', qualityTier: 'premium', bestFor: ['asian-languages', 'multilingual', 'google-ecosystem'] },
  { id: 'azure-neural', name: 'Azure Neural', shortName: 'Azure', category: 'voice', confidenceScore: 87, ranking: 3, costTier: 'medium', speedTier: 'fast', qualityTier: 'standard', bestFor: ['enterprise', 'ssml-control', 'custom-voices', 'visemes'] },
  { id: 'aws-polly', name: 'AWS Polly', shortName: 'Polly', category: 'voice', confidenceScore: 80, ranking: 4, costTier: 'low', speedTier: 'fast', qualityTier: 'basic', bestFor: ['cost-effective', 'aws-ecosystem', 'high-volume'] },
  
  // STT Models (NEW)
  { id: 'deepgram-nova-2', name: 'Deepgram Nova 2', shortName: 'Deepgram', category: 'voice', confidenceScore: 98, ranking: 1, costTier: 'medium', speedTier: 'fast', qualityTier: 'premium', bestFor: ['real-time-stt', 'streaming', 'low-latency', 'accuracy'] },
  
  // Music Models (NEW)
  { id: 'suno-v4', name: 'Suno V4', shortName: 'Suno', category: 'voice', confidenceScore: 94, ranking: 1, costTier: 'high', speedTier: 'slow', qualityTier: 'premium', bestFor: ['music-generation', 'vocals', 'full-songs'] },
  
  // Translation Models
  { id: 'deepl', name: 'DeepL', shortName: 'DeepL', category: 'translation', confidenceScore: 95, ranking: 1, costTier: 'medium', speedTier: 'fast', qualityTier: 'premium', bestFor: ['european-languages', 'nuanced', 'professional'] },
  { id: 'google-translate', name: 'Google Translate', shortName: 'Google', category: 'translation', confidenceScore: 88, ranking: 2, costTier: 'low', speedTier: 'fast', qualityTier: 'standard', bestFor: ['broad-coverage', 'cost-effective', 'quick'] },
  { id: 'qwen-mt', name: 'Qwen-MT', shortName: 'Qwen', category: 'translation', confidenceScore: 90, ranking: 1, costTier: 'low', speedTier: 'fast', qualityTier: 'premium', bestFor: ['asian-languages', 'chinese', 'japanese', 'korean'] },
  { id: 'azure-translator', name: 'Azure Translator', shortName: 'Azure', category: 'translation', confidenceScore: 85, ranking: 3, costTier: 'medium', speedTier: 'fast', qualityTier: 'standard', bestFor: ['enterprise', 'custom-models', 'integration'] },
  { id: 'nllb', name: 'NLLB', shortName: 'NLLB', category: 'translation', confidenceScore: 78, ranking: 4, costTier: 'low', speedTier: 'medium', qualityTier: 'basic', bestFor: ['rare-languages', 'open-source', 'research'] },
];

// Get providers by category
export const getProvidersByCategory = (category: AIProvider['category']): AIProvider[] => {
  return AI_PROVIDERS.filter(p => p.category === category).sort((a, b) => a.ranking - b.ranking);
};

// Get recommended AI config based on context
export const getRecommendedAIConfig = (
  industry: string,
  languages: string[] = [],
  contentType?: string
): TemplateAIModelConfig => {
  const hasAsianLangs = languages.some(l => ['zh', 'ja', 'ko', 'th', 'vi'].includes(l));
  const industryLower = industry.toLowerCase();
  
  let textModel = 'google/gemini-3-flash-preview';
  let textConfidence = 90;
  let reasoning = 'Default high-performance model';
  
  if (['healthcare', 'pharma', 'biotech', 'medical', 'legal'].some(i => industryLower.includes(i))) {
    textModel = 'claude-3-5-sonnet';
    textConfidence = 94;
    reasoning = 'Claude excels at nuanced, compliance-sensitive content';
  } else if (['consulting', 'strategy', 'management'].some(i => industryLower.includes(i))) {
    textModel = 'openai/gpt-5';
    textConfidence = 96;
    reasoning = 'GPT-5 optimal for strategic consulting frameworks';
  } else if (hasAsianLangs) {
    textModel = 'alibaba/qwen-2.5';
    textConfidence = 92;
    reasoning = 'Qwen optimized for Asian language content';
  }
  
  let imageModel = 'flux-pro';
  if (contentType === 'visual' || contentType === 'creative') {
    imageModel = 'modelslab';
  }
  
  const voiceModel = hasAsianLangs ? 'google-wavenet' : 'elevenlabs-multilingual';
  const translationModel = hasAsianLangs ? 'qwen-mt' : 'deepl';
  
  const confidence = Math.min(98, textConfidence + (industry ? 5 : 0) + (languages.length > 0 ? 3 : 0));
  
  return {
    textModel,
    imageModel,
    voiceModel,
    translationModel,
    confidence,
    reasoning,
  };
};

// Map database row to ConsultingFramework
const mapDbToFramework = (row: any): ConsultingFramework => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category || 'custom',
  frameworks: row.frameworks || [],
  tags: row.tags || [],
  useCases: row.use_cases || [],
  visualStyle: row.visual_style || 'balanced',
  industries: row.industries || [],
  isSystem: row.is_system || false,
  visibility: row.visibility || 'private',
  createdBy: row.created_by,
  usageCount: row.usage_count || 0,
  ratingAvg: row.rating_avg || 0,
  ratingCount: row.rating_count || 0,
  createdAt: row.created_at,
  aiModelConfig: row.ai_model_config,
});

// Map database row to IndustryTemplate
const mapDbToTemplate = (row: any): IndustryTemplate => ({
  id: row.id,
  name: row.name,
  description: row.description,
  industry: row.industry,
  subIndustry: row.sub_industry,
  templateType: row.template_type || 'presentation',
  frameworks: row.frameworks || [],
  tags: row.tags || [],
  slideSuggestions: row.slide_suggestions || [],
  recommendedVisuals: row.recommended_visuals || [],
  isSystem: row.is_system || false,
  visibility: row.visibility || 'private',
  createdBy: row.created_by,
  usageCount: row.usage_count || 0,
  ratingAvg: row.rating_avg || 0,
  ratingCount: row.rating_count || 0,
  previewImageUrl: row.preview_image_url,
  createdAt: row.created_at,
  aiModelConfig: row.ai_model_config,
});

export function useTemplateLibrary() {
  const { user } = useMasterAuth();
  const [consultingFrameworks, setConsultingFrameworks] = useState<ConsultingFramework[]>([]);
  const [industryTemplates, setIndustryTemplates] = useState<IndustryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from database only - no hardcoded fallbacks
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch consulting frameworks
        const { data: frameworksData, error: frameworksError } = await supabase
          .from('custom_consulting_frameworks')
          .select('*')
          .or('visibility.eq.public,is_system.eq.true')
          .order('usage_count', { ascending: false });

        if (frameworksError) throw frameworksError;

        // Fetch industry templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('industry_template_library')
          .select('*')
          .or('visibility.eq.public,is_system.eq.true')
          .order('usage_count', { ascending: false });

        if (templatesError) throw templatesError;

        // Set data from database only
        setConsultingFrameworks(frameworksData ? frameworksData.map(mapDbToFramework) : []);
        setIndustryTemplates(templatesData ? templatesData.map(mapDbToTemplate) : []);
      } catch (err: any) {
        console.error('Failed to fetch template library:', err.message);
        setError(err.message);
        // Don't set defaults - keep empty arrays to force AI generation
        setConsultingFrameworks([]);
        setIndustryTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  // Fetch user's private items
  useEffect(() => {
    if (!user) return;
    
    const fetchUserItems = async () => {
      try {
        // Fetch user's private frameworks
        const { data: userFrameworksData } = await supabase
          .from('custom_consulting_frameworks')
          .select('*')
          .eq('created_by', user.id)
          .eq('visibility', 'private');

        // Fetch user's private templates
        const { data: userTemplatesData } = await supabase
          .from('industry_template_library')
          .select('*')
          .eq('created_by', user.id)
          .eq('visibility', 'private');

        // Merge with existing data (avoiding duplicates)
        if (userFrameworksData) {
          setConsultingFrameworks(prev => {
            const existingIds = new Set(prev.map(f => f.id));
            const newItems = userFrameworksData.filter(f => !existingIds.has(f.id)).map(mapDbToFramework);
            return [...prev, ...newItems];
          });
        }

        if (userTemplatesData) {
          setIndustryTemplates(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const newItems = userTemplatesData.filter(t => !existingIds.has(t.id)).map(mapDbToTemplate);
            return [...prev, ...newItems];
          });
        }
      } catch (err: any) {
        console.warn('Failed to fetch user items:', err.message);
      }
    };

    fetchUserItems();
  }, [user]);

  // Get frameworks by category
  const getFrameworksByCategory = useCallback((category?: string) => {
    if (!category) return consultingFrameworks;
    return consultingFrameworks.filter(f => f.category === category);
  }, [consultingFrameworks]);

  // Get templates by industry
  const getTemplatesByIndustry = useCallback((industry?: string) => {
    if (!industry) return industryTemplates;
    return industryTemplates.filter(t => 
      t.industry.toLowerCase().includes(industry.toLowerCase())
    );
  }, [industryTemplates]);

  // Get user's own frameworks
  const userFrameworks = useMemo(() => {
    if (!user) return [];
    return consultingFrameworks.filter(f => f.createdBy === user.id);
  }, [consultingFrameworks, user]);

  // Get user's own templates
  const userTemplates = useMemo(() => {
    if (!user) return [];
    return industryTemplates.filter(t => t.createdBy === user.id);
  }, [industryTemplates, user]);

  // Create new framework with AI model config
  const createFramework = async (
    framework: Omit<ConsultingFramework, 'id' | 'isSystem' | 'usageCount' | 'ratingAvg' | 'ratingCount' | 'createdAt' | 'createdBy'>,
    aiConfig?: TemplateAIModelConfig
  ) => {
    if (!user) {
      toast.error('Please sign in to create frameworks');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('custom_consulting_frameworks')
        .insert({
          name: framework.name,
          description: framework.description,
          category: framework.category,
          frameworks: framework.frameworks,
          tags: framework.tags,
          use_cases: framework.useCases,
          visual_style: framework.visualStyle,
          industries: framework.industries,
          visibility: framework.visibility,
          created_by: user.id,
          is_system: false,
          ai_model_config: aiConfig,
        })
        .select()
        .single();

      if (error) throw error;

      const newFramework = mapDbToFramework(data);
      setConsultingFrameworks(prev => [...prev, newFramework]);
      toast.success('Framework created successfully');
      return newFramework;
    } catch (err: any) {
      toast.error(`Failed to create framework: ${err.message}`);
      return null;
    }
  };

  // Create new template with AI model config
  const createTemplate = async (
    template: Omit<IndustryTemplate, 'id' | 'isSystem' | 'usageCount' | 'ratingAvg' | 'ratingCount' | 'createdAt' | 'createdBy'>,
    aiConfig?: TemplateAIModelConfig
  ) => {
    if (!user) {
      toast.error('Please sign in to create templates');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('industry_template_library')
        .insert({
          name: template.name,
          description: template.description,
          industry: template.industry,
          sub_industry: template.subIndustry,
          template_type: template.templateType,
          frameworks: template.frameworks,
          tags: template.tags,
          slide_suggestions: template.slideSuggestions,
          recommended_visuals: template.recommendedVisuals,
          visibility: template.visibility,
          created_by: user.id,
          is_system: false,
          ai_model_config: aiConfig,
        })
        .select()
        .single();

      if (error) throw error;

      const newTemplate = mapDbToTemplate(data);
      setIndustryTemplates(prev => [...prev, newTemplate]);
      toast.success('Template created successfully');
      return newTemplate;
    } catch (err: any) {
      toast.error(`Failed to create template: ${err.message}`);
      return null;
    }
  };

  // Refresh from database
  const refresh = async () => {
    setLoading(true);
    try {
      const { data: frameworksData } = await supabase
        .from('custom_consulting_frameworks')
        .select('*')
        .or('visibility.eq.public,is_system.eq.true')
        .order('usage_count', { ascending: false });

      const { data: templatesData } = await supabase
        .from('industry_template_library')
        .select('*')
        .or('visibility.eq.public,is_system.eq.true')
        .order('usage_count', { ascending: false });

      setConsultingFrameworks(frameworksData ? frameworksData.map(mapDbToFramework) : []);
      setIndustryTemplates(templatesData ? templatesData.map(mapDbToTemplate) : []);
    } finally {
      setLoading(false);
    }
  };

  // Check if library is empty (needs seeding)
  const isEmpty = useMemo(() => {
    return consultingFrameworks.length === 0 && industryTemplates.length === 0;
  }, [consultingFrameworks, industryTemplates]);

  return {
    // Data
    consultingFrameworks,
    industryTemplates,
    userFrameworks,
    userTemplates,
    loading,
    error,
    isEmpty,
    
    // Getters
    getFrameworksByCategory,
    getTemplatesByIndustry,
    
    // Actions
    createFramework,
    createTemplate,
    refresh,
    
    // AI Model helpers
    getRecommendedAIConfig,
    getProvidersByCategory,
    aiProviders: AI_PROVIDERS,
  };
}

export default useTemplateLibrary;
