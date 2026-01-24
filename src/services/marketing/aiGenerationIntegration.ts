/**
 * AI Generation Integration for Marketing Engine
 * 
 * Integrates with:
 * - AI Avatars (HeyGen, Synthesia, Alibaba OmniAvatar)
 * - Video Generation (ModelsLab, Gemini Veo)
 * - 3D Generation (ModelsLab 3D)
 * - TTS (ElevenLabs, Azure, Google, Alibaba CosyVoice)
 * - PPT Generation (Genie Deck)
 * - Immersive Content (VR/AR)
 * - Journey Steps & Frameworks
 */

import { supabase } from '@/integrations/supabase/client';
import type { BundleType } from '../regionLanguageBundles';
import type { ContentFormat, PipelineCategory } from '../marketingContentManager';

// ============================================================================
// TYPES
// ============================================================================

export interface GenerationRequest {
  id: string;
  type: GenerationType;
  pipelineId: string;
  category: PipelineCategory;
  format: ContentFormat;
  region: BundleType;
  language: string;
  
  // Content
  script: string;
  headline: string;
  hook: string;
  cta: string;
  
  // Visual Config
  visualConfig: VisualConfig;
  
  // Audio Config
  audioConfig: AudioConfig;
  
  // Generation Settings
  priority: 'low' | 'normal' | 'high' | 'urgent';
  quality: 'draft' | 'standard' | 'premium';
  
  // Status
  status: GenerationStatus;
  progress: number;
  assets: GeneratedAssets;
  error?: string;
  
  createdAt: Date;
  completedAt?: Date;
}

export type GenerationType = 
  | 'avatar_video'
  | 'animated_video'
  | 'motion_graphics'
  | '3d_scene'
  | '3d_product'
  | 'vr_environment'
  | 'ar_overlay'
  | 'presentation'
  | 'carousel'
  | 'infographic'
  | 'podcast'
  | 'journey_steps'
  | 'framework_visual';

export type GenerationStatus = 
  | 'pending'
  | 'generating_script'
  | 'generating_audio'
  | 'generating_visuals'
  | 'generating_video'
  | 'compositing'
  | 'post_processing'
  | 'completed'
  | 'failed';

export interface VisualConfig {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  resolution: '720p' | '1080p' | '4k';
  duration: number; // seconds
  
  // Avatar settings
  avatarEnabled: boolean;
  avatarId?: string;
  avatarStyle?: 'professional' | 'casual' | 'creative';
  avatarPosition?: 'center' | 'left' | 'right' | 'corner';
  
  // 3D settings
  use3D: boolean;
  scene3DType?: 'product' | 'environment' | 'character' | 'abstract';
  lighting3D?: 'studio' | 'natural' | 'dramatic' | 'soft';
  
  // Animation
  animationStyle?: 'smooth' | 'dynamic' | 'minimal' | 'energetic';
  transitionType?: 'fade' | 'slide' | 'zoom' | 'morph';
  
  // Text overlays
  textOverlays: boolean;
  textStyle?: 'modern' | 'bold' | 'elegant' | 'playful';
  brandColors?: string[];
  fontFamily?: string;
  
  // Effects
  particles?: boolean;
  depthOfField?: boolean;
  colorGrading?: string;
}

export interface AudioConfig {
  voiceEnabled: boolean;
  voiceProvider?: 'elevenlabs' | 'azure' | 'google' | 'alibaba';
  voiceId?: string;
  voiceStyle?: 'professional' | 'conversational' | 'energetic';
  language: string;
  
  // Music
  musicEnabled: boolean;
  musicStyle?: string;
  musicMood?: 'uplifting' | 'corporate' | 'inspiring' | 'dynamic';
  musicVolume?: number; // 0-100
  
  // SFX
  sfxEnabled: boolean;
  sfxType?: 'subtle' | 'impactful' | 'minimal';
}

export interface GeneratedAssets {
  videoUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  transcriptUrl?: string;
  subtitlesUrl?: string;
  model3DUrl?: string;
  presentationUrl?: string;
  imageUrls?: string[];
}

export interface JourneyStep {
  order: number;
  title: string;
  description: string;
  visualPrompt: string;
  duration: number;
  transition: 'fade' | 'slide' | 'zoom';
}

export interface FrameworkVisual {
  frameworkName: string;
  steps: { label: string; description: string; icon?: string }[];
  layout: 'linear' | 'circular' | 'pyramid' | 'matrix';
  colorScheme: string[];
}

// ============================================================================
// REGIONAL VOICE MAPPING
// ============================================================================

export const REGIONAL_VOICE_CONFIG: Record<BundleType, {
  provider: AudioConfig['voiceProvider'];
  voiceIds: { male: string; female: string };
  style: AudioConfig['voiceStyle'];
}> = {
  english_core: {
    provider: 'elevenlabs',
    voiceIds: { male: 'Josh', female: 'Rachel' },
    style: 'professional',
  },
  europe: {
    provider: 'elevenlabs',
    voiceIds: { male: 'Adam', female: 'Charlotte' },
    style: 'conversational',
  },
  asia: {
    provider: 'alibaba',
    voiceIds: { male: 'zhiyan', female: 'zhimiao' },
    style: 'professional',
  },
  india: {
    provider: 'google',
    voiceIds: { male: 'en-IN-Neural2-B', female: 'en-IN-Neural2-A' },
    style: 'conversational',
  },
  mea: {
    provider: 'azure',
    voiceIds: { male: 'ar-AE-HamdanNeural', female: 'ar-AE-FatimaNeural' },
    style: 'professional',
  },
  africa: {
    provider: 'google',
    voiceIds: { male: 'en-ZA-Standard-B', female: 'en-ZA-Standard-A' },
    style: 'energetic',
  },
  latam: {
    provider: 'elevenlabs',
    voiceIds: { male: 'Antonio', female: 'Gabriela' },
    style: 'energetic',
  },
};

// ============================================================================
// AVATAR MAPPING
// ============================================================================

export const REGIONAL_AVATAR_CONFIG: Record<BundleType, {
  defaultAvatarId: string;
  style: VisualConfig['avatarStyle'];
  appearance: string;
}> = {
  english_core: {
    defaultAvatarId: 'professional-western-1',
    style: 'professional',
    appearance: 'Business casual, confident posture',
  },
  europe: {
    defaultAvatarId: 'professional-european-1',
    style: 'professional',
    appearance: 'Sophisticated, polished look',
  },
  asia: {
    defaultAvatarId: 'professional-asian-1',
    style: 'professional',
    appearance: 'Formal business attire, respectful demeanor',
  },
  india: {
    defaultAvatarId: 'professional-indian-1',
    style: 'casual',
    appearance: 'Smart casual, approachable',
  },
  mea: {
    defaultAvatarId: 'professional-mena-1',
    style: 'professional',
    appearance: 'Formal, culturally appropriate attire',
  },
  africa: {
    defaultAvatarId: 'professional-african-1',
    style: 'creative',
    appearance: 'Vibrant, modern professional',
  },
  latam: {
    defaultAvatarId: 'professional-latam-1',
    style: 'casual',
    appearance: 'Warm, friendly, approachable',
  },
};

// ============================================================================
// JOURNEY TEMPLATES
// ============================================================================

export const JOURNEY_TEMPLATES: Record<string, JourneyStep[]> = {
  product_overview: [
    { order: 1, title: 'The Problem', description: 'Current pain points', visualPrompt: '3D visualization of workflow chaos', duration: 5, transition: 'fade' },
    { order: 2, title: 'The Solution', description: 'Introducing Genie', visualPrompt: 'Genie logo reveal with particles', duration: 5, transition: 'zoom' },
    { order: 3, title: 'Key Features', description: 'Top 3 capabilities', visualPrompt: 'Split screen feature demos', duration: 10, transition: 'slide' },
    { order: 4, title: 'Results', description: 'Transformation metrics', visualPrompt: 'Animated statistics and graphs', duration: 5, transition: 'fade' },
    { order: 5, title: 'Get Started', description: 'CTA and next steps', visualPrompt: 'Avatar with call to action', duration: 5, transition: 'zoom' },
  ],
  feature_demo: [
    { order: 1, title: 'Feature Intro', description: 'What this feature does', visualPrompt: 'Feature icon animation', duration: 3, transition: 'fade' },
    { order: 2, title: 'How It Works', description: 'Step-by-step process', visualPrompt: 'Screen recording with highlights', duration: 15, transition: 'slide' },
    { order: 3, title: 'Results', description: 'Before/after comparison', visualPrompt: 'Split screen comparison', duration: 5, transition: 'fade' },
    { order: 4, title: 'Try It', description: 'CTA', visualPrompt: 'Avatar invitation', duration: 3, transition: 'zoom' },
  ],
  tutorial: [
    { order: 1, title: 'Goal', description: 'What you\'ll learn', visualPrompt: 'Objective graphic', duration: 3, transition: 'fade' },
    { order: 2, title: 'Prerequisites', description: 'What you need', visualPrompt: 'Checklist animation', duration: 5, transition: 'slide' },
    { order: 3, title: 'Step 1', description: 'First action', visualPrompt: 'Screen recording', duration: 10, transition: 'slide' },
    { order: 4, title: 'Step 2', description: 'Second action', visualPrompt: 'Screen recording', duration: 10, transition: 'slide' },
    { order: 5, title: 'Step 3', description: 'Third action', visualPrompt: 'Screen recording', duration: 10, transition: 'slide' },
    { order: 6, title: 'Summary', description: 'What you achieved', visualPrompt: 'Success animation', duration: 5, transition: 'zoom' },
  ],
  comparison: [
    { order: 1, title: 'The Challenge', description: 'Common problem', visualPrompt: 'Problem visualization', duration: 5, transition: 'fade' },
    { order: 2, title: 'Old Way', description: 'Traditional approach', visualPrompt: 'Slow, tedious process', duration: 10, transition: 'slide' },
    { order: 3, title: 'New Way', description: 'With Genie', visualPrompt: 'Fast, elegant process', duration: 10, transition: 'slide' },
    { order: 4, title: 'Comparison', description: 'Side by side', visualPrompt: 'Split screen comparison', duration: 10, transition: 'fade' },
    { order: 5, title: 'Choose Genie', description: 'CTA', visualPrompt: 'Avatar with CTA', duration: 5, transition: 'zoom' },
  ],
};

// ============================================================================
// FRAMEWORK TEMPLATES
// ============================================================================

export const FRAMEWORK_TEMPLATES: Record<string, FrameworkVisual> = {
  aida: {
    frameworkName: 'AIDA Framework',
    steps: [
      { label: 'Attention', description: 'Capture interest', icon: '👀' },
      { label: 'Interest', description: 'Build curiosity', icon: '🤔' },
      { label: 'Desire', description: 'Create want', icon: '❤️' },
      { label: 'Action', description: 'Drive conversion', icon: '🎯' },
    ],
    layout: 'linear',
    colorScheme: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
  },
  pas: {
    frameworkName: 'PAS Framework',
    steps: [
      { label: 'Problem', description: 'Identify the pain', icon: '😟' },
      { label: 'Agitate', description: 'Amplify the pain', icon: '😰' },
      { label: 'Solution', description: 'Present the fix', icon: '✨' },
    ],
    layout: 'linear',
    colorScheme: ['#EF4444', '#F97316', '#22C55E'],
  },
  gagne_9: {
    frameworkName: 'Gagné\'s 9 Events',
    steps: [
      { label: 'Gain Attention', description: 'Hook the learner', icon: '🎯' },
      { label: 'Objectives', description: 'State goals', icon: '📋' },
      { label: 'Prior Learning', description: 'Activate knowledge', icon: '🧠' },
      { label: 'Present Content', description: 'Deliver material', icon: '📚' },
      { label: 'Guide Learning', description: 'Provide guidance', icon: '🧭' },
      { label: 'Elicit Performance', description: 'Practice', icon: '💪' },
      { label: 'Provide Feedback', description: 'Give response', icon: '💬' },
      { label: 'Assess', description: 'Evaluate learning', icon: '📊' },
      { label: 'Retention', description: 'Transfer to job', icon: '🔄' },
    ],
    layout: 'circular',
    colorScheme: ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#C026D3', '#DB2777', '#E11D48', '#EF4444', '#F97316'],
  },
  hero_journey: {
    frameworkName: 'Hero\'s Journey',
    steps: [
      { label: 'Ordinary World', description: 'Status quo', icon: '🏠' },
      { label: 'Call to Adventure', description: 'Disruption', icon: '📢' },
      { label: 'Crossing Threshold', description: 'Decision', icon: '🚪' },
      { label: 'Tests & Allies', description: 'Challenges', icon: '⚔️' },
      { label: 'Transformation', description: 'Growth', icon: '🦋' },
      { label: 'Return', description: 'New normal', icon: '🏆' },
    ],
    layout: 'circular',
    colorScheme: ['#94A3B8', '#64748B', '#475569', '#334155', '#1E293B', '#0F172A'],
  },
};

// ============================================================================
// AI GENERATION SERVICE
// ============================================================================

class AIGenerationIntegration {
  private static instance: AIGenerationIntegration;
  private pendingRequests: Map<string, GenerationRequest> = new Map();

  static getInstance(): AIGenerationIntegration {
    if (!this.instance) {
      this.instance = new AIGenerationIntegration();
    }
    return this.instance;
  }

  /**
   * Create generation request
   */
  async createRequest(
    config: Omit<GenerationRequest, 'id' | 'status' | 'progress' | 'assets' | 'createdAt'>
  ): Promise<GenerationRequest> {
    const id = `gen_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const request: GenerationRequest = {
      ...config,
      id,
      status: 'pending',
      progress: 0,
      assets: {},
      createdAt: new Date(),
    };

    this.pendingRequests.set(id, request);
    return request;
  }

  /**
   * Generate avatar video
   */
  async generateAvatarVideo(request: GenerationRequest): Promise<GeneratedAssets> {
    console.log(`[AIGen] Starting avatar video: ${request.id}`);
    
    const voiceConfig = REGIONAL_VOICE_CONFIG[request.region];
    const avatarConfig = REGIONAL_AVATAR_CONFIG[request.region];

    try {
      // Step 1: Generate audio
      request.status = 'generating_audio';
      request.progress = 20;
      
      const audioResult = await supabase.functions.invoke(`${voiceConfig.provider}-tts`.replace('elevenlabs', 'elevenlabs-voice'), {
        body: {
          text: request.script,
          voice: voiceConfig.voiceIds.male,
          language: request.language,
        },
      });

      if (audioResult.error) throw audioResult.error;
      request.assets.audioUrl = audioResult.data?.audioContent;

      // Step 2: Generate avatar video
      request.status = 'generating_video';
      request.progress = 60;

      const videoResult = await supabase.functions.invoke('ai-video-generator', {
        body: {
          type: 'avatar',
          script: request.script,
          avatarId: avatarConfig.defaultAvatarId,
          audioUrl: request.assets.audioUrl,
          aspectRatio: request.visualConfig.aspectRatio,
          resolution: request.visualConfig.resolution,
        },
      });

      if (videoResult.error) throw videoResult.error;
      request.assets.videoUrl = videoResult.data?.videoUrl;

      // Step 3: Generate thumbnail
      request.status = 'post_processing';
      request.progress = 90;

      const thumbResult = await supabase.functions.invoke('auto-thumbnail-generator', {
        body: {
          action: 'generate',
          title: request.headline,
          style: 'youtube',
        },
      });

      request.assets.thumbnailUrl = thumbResult.data?.thumbnailUrl;

      request.status = 'completed';
      request.progress = 100;
      request.completedAt = new Date();

      return request.assets;
    } catch (error) {
      request.status = 'failed';
      request.error = String(error);
      throw error;
    }
  }

  /**
   * Generate 3D content
   */
  async generate3DContent(request: GenerationRequest): Promise<GeneratedAssets> {
    console.log(`[AIGen] Starting 3D generation: ${request.id}`);

    try {
      request.status = 'generating_visuals';
      request.progress = 30;

      const result = await supabase.functions.invoke('modelslab-media', {
        body: {
          type: '3d',
          prompt: `${request.headline}. ${request.hook}. Professional, high quality, 8K detail.`,
          model: 'stable-3d',
        },
      });

      if (result.error) throw result.error;
      request.assets.model3DUrl = result.data?.output?.[0];

      request.status = 'completed';
      request.progress = 100;
      request.completedAt = new Date();

      return request.assets;
    } catch (error) {
      request.status = 'failed';
      request.error = String(error);
      throw error;
    }
  }

  /**
   * Generate journey steps video
   */
  async generateJourneyVideo(
    request: GenerationRequest,
    journeyType: keyof typeof JOURNEY_TEMPLATES
  ): Promise<GeneratedAssets> {
    console.log(`[AIGen] Starting journey video: ${request.id}`);

    const template = JOURNEY_TEMPLATES[journeyType];
    if (!template) throw new Error(`Unknown journey type: ${journeyType}`);

    const voiceConfig = REGIONAL_VOICE_CONFIG[request.region];

    try {
      // Generate each step
      for (let i = 0; i < template.length; i++) {
        const step = template[i];
        request.status = 'generating_visuals';
        request.progress = ((i + 1) / template.length) * 80;

        // Generate visuals for step
        const visualResult = await supabase.functions.invoke('ai-image-generator', {
          body: {
            prompt: step.visualPrompt,
            style: request.visualConfig.animationStyle || 'smooth',
          },
        });

        if (!request.assets.imageUrls) request.assets.imageUrls = [];
        request.assets.imageUrls.push(visualResult.data?.imageUrl);
      }

      // Composite video
      request.status = 'compositing';
      request.progress = 90;

      const compositeResult = await supabase.functions.invoke('ai-video-generator', {
        body: {
          type: 'composite',
          images: request.assets.imageUrls,
          audioUrl: request.assets.audioUrl,
          transitions: template.map(s => s.transition),
          durations: template.map(s => s.duration),
        },
      });

      request.assets.videoUrl = compositeResult.data?.videoUrl;

      request.status = 'completed';
      request.progress = 100;
      request.completedAt = new Date();

      return request.assets;
    } catch (error) {
      request.status = 'failed';
      request.error = String(error);
      throw error;
    }
  }

  /**
   * Generate framework visualization
   */
  async generateFrameworkVisual(
    request: GenerationRequest,
    frameworkType: keyof typeof FRAMEWORK_TEMPLATES
  ): Promise<GeneratedAssets> {
    console.log(`[AIGen] Starting framework visual: ${request.id}`);

    const template = FRAMEWORK_TEMPLATES[frameworkType];
    if (!template) throw new Error(`Unknown framework: ${frameworkType}`);

    try {
      request.status = 'generating_visuals';
      request.progress = 50;

      const prompt = `
        Create a professional ${template.layout} diagram for the ${template.frameworkName}.
        Steps: ${template.steps.map(s => `${s.label}: ${s.description}`).join(', ')}.
        Use colors: ${template.colorScheme.join(', ')}.
        Modern, clean, professional design suitable for marketing.
      `;

      const result = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          size: request.visualConfig.aspectRatio === '16:9' ? '1920x1080' : '1080x1080',
        },
      });

      request.assets.imageUrls = [result.data?.imageUrl];

      request.status = 'completed';
      request.progress = 100;
      request.completedAt = new Date();

      return request.assets;
    } catch (error) {
      request.status = 'failed';
      request.error = String(error);
      throw error;
    }
  }

  /**
   * Get request status
   */
  getRequestStatus(requestId: string): GenerationRequest | undefined {
    return this.pendingRequests.get(requestId);
  }

  /**
   * Get all pending requests
   */
  getPendingRequests(): GenerationRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(r => r.status !== 'completed' && r.status !== 'failed');
  }

  /**
   * Auto-configure based on region and format
   */
  getAutoConfig(
    region: BundleType,
    format: ContentFormat
  ): { visualConfig: Partial<VisualConfig>; audioConfig: Partial<AudioConfig> } {
    const voiceConfig = REGIONAL_VOICE_CONFIG[region];
    const avatarConfig = REGIONAL_AVATAR_CONFIG[region];

    const visualConfig: Partial<VisualConfig> = {
      avatarEnabled: format.includes('avatar'),
      use3D: format.includes('3d'),
      textOverlays: true,
      animationStyle: format === 'shorts_vertical' ? 'dynamic' : 'smooth',
    };

    if (visualConfig.avatarEnabled) {
      visualConfig.avatarId = avatarConfig.defaultAvatarId;
      visualConfig.avatarStyle = avatarConfig.style;
    }

    // Set aspect ratio based on format
    if (format === 'shorts_vertical') {
      visualConfig.aspectRatio = '9:16';
    } else if (format === 'carousel') {
      visualConfig.aspectRatio = '1:1';
    } else {
      visualConfig.aspectRatio = '16:9';
    }

    const audioConfig: Partial<AudioConfig> = {
      voiceEnabled: true,
      voiceProvider: voiceConfig.provider,
      voiceId: voiceConfig.voiceIds.male,
      voiceStyle: voiceConfig.style,
      language: region === 'asia' ? 'zh' : region === 'mea' ? 'ar' : 'en',
      musicEnabled: true,
      musicMood: 'uplifting',
      musicVolume: 20,
      sfxEnabled: format.includes('video'),
    };

    return { visualConfig, audioConfig };
  }
}

export const aiGenerationIntegration = AIGenerationIntegration.getInstance();
