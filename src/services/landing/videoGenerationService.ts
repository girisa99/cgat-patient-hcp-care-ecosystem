/**
 * LANDING PAGE VIDEO GENERATION SERVICE
 * 
 * Uses Genie Cast to generate professional marketing videos featuring:
 * - Professional male/female avatars transitioning to Genie character
 * - 3D animations and creative transitions
 * - Regional variants with localized presenters
 * - All 7 products explained with unique visual styles
 * 
 * This is DOGFOODING - using Cast to create Cast's marketing!
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// AVATAR PROFILES - Professional presenters per region
// ============================================================================

export interface AvatarProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  region: string;
  style: 'professional' | 'casual' | 'creative';
  voiceProvider: 'elevenlabs' | 'azure' | 'alibaba';
  voiceId: string;
  avatarProvider: 'alibaba' | 'heygen' | 'meshy';
  transitionToGenie: boolean;
}

export const REGIONAL_AVATARS: Record<string, AvatarProfile[]> = {
  // Claude Zone (Americas, Europe, Oceania)
  en: [
    {
      id: 'sarah-professional',
      name: 'Sarah',
      gender: 'female',
      region: 'Western',
      style: 'professional',
      voiceProvider: 'elevenlabs',
      voiceId: 'rachel',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
    {
      id: 'michael-creative',
      name: 'Michael',
      gender: 'male',
      region: 'Western',
      style: 'creative',
      voiceProvider: 'elevenlabs',
      voiceId: 'adam',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  // Arabic Zone (MENA)
  ar: [
    {
      id: 'fatima-professional',
      name: 'Fatima',
      gender: 'female',
      region: 'MENA',
      style: 'professional',
      voiceProvider: 'azure',
      voiceId: 'ar-SA-ZariyahNeural',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
    {
      id: 'ahmed-professional',
      name: 'Ahmed',
      gender: 'male',
      region: 'MENA',
      style: 'professional',
      voiceProvider: 'azure',
      voiceId: 'ar-SA-HamedNeural',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  // Gemini Zone (India, SEA, Africa)
  hi: [
    {
      id: 'priya-professional',
      name: 'Priya',
      gender: 'female',
      region: 'South Asia',
      style: 'professional',
      voiceProvider: 'azure',
      voiceId: 'hi-IN-SwaraNeural',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
    {
      id: 'arjun-creative',
      name: 'Arjun',
      gender: 'male',
      region: 'South Asia',
      style: 'creative',
      voiceProvider: 'azure',
      voiceId: 'hi-IN-MadhurNeural',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  // Alibaba Zone (CJK)
  zh: [
    {
      id: 'mei-professional',
      name: 'Mei',
      gender: 'female',
      region: 'CJK',
      style: 'professional',
      voiceProvider: 'alibaba',
      voiceId: 'zhixiaobai',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
    {
      id: 'wei-creative',
      name: 'Wei',
      gender: 'male',
      region: 'CJK',
      style: 'creative',
      voiceProvider: 'alibaba',
      voiceId: 'zhixiaoxia',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  ja: [
    {
      id: 'yuki-professional',
      name: 'Yuki',
      gender: 'female',
      region: 'CJK',
      style: 'professional',
      voiceProvider: 'alibaba',
      voiceId: 'sicheng',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  ko: [
    {
      id: 'jisoo-professional',
      name: 'Jisoo',
      gender: 'female',
      region: 'CJK',
      style: 'professional',
      voiceProvider: 'azure',
      voiceId: 'ko-KR-SunHiNeural',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  // Latin America
  es: [
    {
      id: 'lucia-creative',
      name: 'Lucia',
      gender: 'female',
      region: 'LATAM',
      style: 'creative',
      voiceProvider: 'elevenlabs',
      voiceId: 'matilda',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
    {
      id: 'carlos-professional',
      name: 'Carlos',
      gender: 'male',
      region: 'LATAM',
      style: 'professional',
      voiceProvider: 'azure',
      voiceId: 'es-MX-JorgeNeural',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  pt: [
    {
      id: 'julia-creative',
      name: 'Julia',
      gender: 'female',
      region: 'Brazil',
      style: 'creative',
      voiceProvider: 'azure',
      voiceId: 'pt-BR-FranciscaNeural',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  // Africa
  sw: [
    {
      id: 'amara-professional',
      name: 'Amara',
      gender: 'female',
      region: 'Africa',
      style: 'professional',
      voiceProvider: 'azure',
      voiceId: 'sw-KE-ZuriNeural',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  fr: [
    {
      id: 'claire-professional',
      name: 'Claire',
      gender: 'female',
      region: 'Europe',
      style: 'professional',
      voiceProvider: 'elevenlabs',
      voiceId: 'charlotte',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
  de: [
    {
      id: 'anna-professional',
      name: 'Anna',
      gender: 'female',
      region: 'Europe',
      style: 'professional',
      voiceProvider: 'azure',
      voiceId: 'de-DE-KatjaNeural',
      avatarProvider: 'alibaba',
      transitionToGenie: true,
    },
  ],
};

// ============================================================================
// CHAPTER VISUAL CONFIGURATIONS
// ============================================================================

export interface ChapterVisualConfig {
  id: string;
  title: string;
  product: string;
  duration: number; // seconds
  visualStyle: 'cinematic_3d' | 'avatar_presenter' | 'product_demo' | 'immersive_space';
  primaryColor: string;
  transitions: TransitionConfig;
  avatarBehavior: AvatarBehavior;
  genieAppearance: GenieAppearance;
  elements3D: string[];
}

interface TransitionConfig {
  intro: 'fade_in' | 'zoom_in' | 'slide_left' | 'particles_form' | 'smoke_reveal';
  outro: 'fade_out' | 'zoom_out' | 'dissolve_to_smoke' | 'transform_to_genie';
  betweenScenes: 'crossfade' | 'wipe' | 'morph' | 'magical_sparkle';
}

interface AvatarBehavior {
  startsAs: 'professional_human' | 'genie_character' | 'abstract_form';
  endsAs: 'professional_human' | 'genie_character' | 'lamp_smoke';
  transitionMoment: 'middle' | 'end' | 'none';
  gestures: string[];
}

interface GenieAppearance {
  visible: boolean;
  position: 'center' | 'floating_corner' | 'emerging_from_lamp' | 'full_screen';
  animation: 'floating' | 'speaking' | 'gesturing' | 'magical_effects';
  lampVisible: boolean;
}

export const CHAPTER_VISUAL_CONFIGS: ChapterVisualConfig[] = [
  {
    id: 'opening',
    title: 'The Genie Awakens',
    product: 'Genie Studio',
    duration: 45,
    visualStyle: 'cinematic_3d',
    primaryColor: '#9333EA',
    transitions: {
      intro: 'particles_form',
      outro: 'dissolve_to_smoke',
      betweenScenes: 'magical_sparkle',
    },
    avatarBehavior: {
      startsAs: 'abstract_form',
      endsAs: 'genie_character',
      transitionMoment: 'middle',
      gestures: ['stretch', 'wave', 'present_products'],
    },
    genieAppearance: {
      visible: true,
      position: 'emerging_from_lamp',
      animation: 'magical_effects',
      lampVisible: true,
    },
    elements3D: [
      'magic_lamp_ornate',
      'cosmic_background',
      'floating_product_logos',
      'sparkle_particles',
      'smoke_wisps',
    ],
  },
  {
    id: 'spark',
    title: 'Genie Spark - Ignite Your Ideas',
    product: 'Genie Spark',
    duration: 50,
    visualStyle: 'product_demo',
    primaryColor: '#F97316',
    transitions: {
      intro: 'slide_left',
      outro: 'transform_to_genie',
      betweenScenes: 'crossfade',
    },
    avatarBehavior: {
      startsAs: 'professional_human',
      endsAs: 'genie_character',
      transitionMoment: 'end',
      gestures: ['point_to_screen', 'typing_motion', 'thumbs_up'],
    },
    genieAppearance: {
      visible: true,
      position: 'floating_corner',
      animation: 'speaking',
      lampVisible: false,
    },
    elements3D: [
      'flame_particles',
      'floating_documents',
      'script_text_3d',
      'confidence_meter_3d',
    ],
  },
  {
    id: 'mind',
    title: 'Genie Mind - AI That Understands',
    product: 'Genie Mind',
    duration: 50,
    visualStyle: 'avatar_presenter',
    primaryColor: '#3B82F6',
    transitions: {
      intro: 'zoom_in',
      outro: 'transform_to_genie',
      betweenScenes: 'crossfade',
    },
    avatarBehavior: {
      startsAs: 'professional_human',
      endsAs: 'genie_character',
      transitionMoment: 'end',
      gestures: ['thinking_pose', 'eureka_moment', 'explain_with_hands'],
    },
    genieAppearance: {
      visible: true,
      position: 'floating_corner',
      animation: 'speaking',
      lampVisible: false,
    },
    elements3D: [
      'neural_network_visualization',
      'brain_glow_effect',
      'waveform_audio_3d',
      'enhancement_highlights',
    ],
  },
  {
    id: 'vibe',
    title: 'Genie Vibe - Script to Screen',
    product: 'Genie Vibe',
    duration: 55,
    visualStyle: 'cinematic_3d',
    primaryColor: '#22C55E',
    transitions: {
      intro: 'zoom_in',
      outro: 'transform_to_genie',
      betweenScenes: 'wipe',
    },
    avatarBehavior: {
      startsAs: 'professional_human',
      endsAs: 'genie_character',
      transitionMoment: 'end',
      gestures: ['director_action', 'camera_pan', 'excited_present'],
    },
    genieAppearance: {
      visible: true,
      position: 'center',
      animation: 'gesturing',
      lampVisible: false,
    },
    elements3D: [
      'floating_video_screens',
      'timeline_3d',
      'teleprompter_hologram',
      '3d_avatar_rotating',
      'lip_sync_visualization',
    ],
  },
  {
    id: 'deck',
    title: 'Genie Deck - Ideas to Impact',
    product: 'Genie Deck',
    duration: 45,
    visualStyle: 'avatar_presenter',
    primaryColor: '#EAB308',
    transitions: {
      intro: 'slide_left',
      outro: 'dissolve_to_smoke',
      betweenScenes: 'crossfade',
    },
    avatarBehavior: {
      startsAs: 'professional_human',
      endsAs: 'genie_character',
      transitionMoment: 'end',
      gestures: ['present_slide', 'click_gesture', 'celebrate'],
    },
    genieAppearance: {
      visible: true,
      position: 'floating_corner',
      animation: 'speaking',
      lampVisible: false,
    },
    elements3D: [
      'floating_slides_3d',
      '3d_charts_rotating',
      'template_gallery_hologram',
      'transformation_effect',
    ],
  },
  {
    id: 'arc',
    title: 'Genie Arc - Your Production Journey',
    product: 'Genie Arc',
    duration: 50,
    visualStyle: 'product_demo',
    primaryColor: '#EC4899',
    transitions: {
      intro: 'fade_in',
      outro: 'transform_to_genie',
      betweenScenes: 'wipe',
    },
    avatarBehavior: {
      startsAs: 'professional_human',
      endsAs: 'genie_character',
      transitionMoment: 'end',
      gestures: ['walking_tour', 'organize_cards', 'schedule_action'],
    },
    genieAppearance: {
      visible: true,
      position: 'floating_corner',
      animation: 'gesturing',
      lampVisible: false,
    },
    elements3D: [
      'kanban_board_3d',
      'calendar_hologram',
      'platform_icons_floating',
      'studio_equipment_3d',
    ],
  },
  {
    id: 'ask-genie',
    title: 'Ask Genie - Your Wish is My Command',
    product: 'Ask Genie',
    duration: 40,
    visualStyle: 'immersive_space',
    primaryColor: '#06B6D4',
    transitions: {
      intro: 'particles_form',
      outro: 'dissolve_to_smoke',
      betweenScenes: 'magical_sparkle',
    },
    avatarBehavior: {
      startsAs: 'genie_character',
      endsAs: 'genie_character',
      transitionMoment: 'none',
      gestures: ['floating', 'thinking', 'answering', 'wink'],
    },
    genieAppearance: {
      visible: true,
      position: 'center',
      animation: 'floating',
      lampVisible: true,
    },
    elements3D: [
      'cosmic_space_background',
      'chat_bubbles_floating',
      'workflow_visualizations',
      'product_icons_glowing',
      'help_cards_materializing',
    ],
  },
  {
    id: 'cast',
    title: 'Genie Cast - Make It. Show It. Scale It.',
    product: 'Genie Cast',
    duration: 50,
    visualStyle: 'avatar_presenter',
    primaryColor: '#EF4444',
    transitions: {
      intro: 'zoom_in',
      outro: 'transform_to_genie',
      betweenScenes: 'wipe',
    },
    avatarBehavior: {
      startsAs: 'professional_human',
      endsAs: 'genie_character',
      transitionMoment: 'middle',
      gestures: ['reveal_meta', 'point_to_world', 'broadcast_gesture'],
    },
    genieAppearance: {
      visible: true,
      position: 'center',
      animation: 'magical_effects',
      lampVisible: true,
    },
    elements3D: [
      'world_map_hologram',
      'distribution_lines_animated',
      'platform_icons_orbiting',
      'all_product_logos_together',
      'all_ai_provider_logos',
      'meta_video_inception',
    ],
  },
  {
    id: 'closing',
    title: 'Your Wish is Our Command',
    product: 'Genie Studio',
    duration: 30,
    visualStyle: 'cinematic_3d',
    primaryColor: '#9333EA',
    transitions: {
      intro: 'particles_form',
      outro: 'fade_out',
      betweenScenes: 'magical_sparkle',
    },
    avatarBehavior: {
      startsAs: 'genie_character',
      endsAs: 'lamp_smoke',
      transitionMoment: 'end',
      gestures: ['bow', 'wave_goodbye', 'return_to_lamp'],
    },
    genieAppearance: {
      visible: true,
      position: 'center',
      animation: 'magical_effects',
      lampVisible: true,
    },
    elements3D: [
      'all_products_orbiting',
      'cosmic_finale',
      'cta_button_3d',
      'lamp_closing',
    ],
  },
];

// ============================================================================
// VIDEO GENERATION REQUEST
// ============================================================================

export interface VideoGenerationRequest {
  chapterId: string;
  language: string;
  avatar: AvatarProfile;
  quality: 'preview' | 'production' | 'cinematic';
  includeSubtitles: boolean;
  includeGenie: boolean;
  include3D: boolean;
}

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  processingTime?: number;
  providers: {
    video: string;
    avatar: string;
    tts: string;
    translation?: string;
  };
  error?: string;
}

// ============================================================================
// VIDEO GENERATION SERVICE
// ============================================================================

class LandingVideoGenerationService {
  private isGenerating = false;
  private generationQueue: VideoGenerationRequest[] = [];

  /**
   * Generate a single chapter video
   */
  async generateChapterVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const config = CHAPTER_VISUAL_CONFIGS.find(c => c.id === request.chapterId);
    if (!config) {
      return { 
        success: false, 
        error: `Unknown chapter: ${request.chapterId}`,
        providers: { video: 'none', avatar: 'none', tts: 'none' }
      };
    }

    console.log(`🎬 Generating video for chapter: ${config.title} in ${request.language}`);

    try {
      // Step 1: Generate script audio using regional TTS
      const audioResult = await this.generateVoiceover(request, config);
      if (!audioResult.success) {
        throw new Error(`TTS failed: ${audioResult.error}`);
      }

      // Step 2: Generate avatar video with lip-sync
      const avatarResult = await this.generateAvatarVideo(request, config, audioResult.audioUrl!);
      if (!avatarResult.success) {
        throw new Error(`Avatar generation failed: ${avatarResult.error}`);
      }

      // Step 3: Generate 3D elements and transitions
      const elementsResult = request.include3D 
        ? await this.generate3DElements(config)
        : { success: true, elements: [] };

      // Step 4: Composite final video with Genie transitions
      const compositeResult = await this.compositeVideo(
        avatarResult.videoUrl!,
        elementsResult.elements,
        config,
        request.includeGenie
      );

      // Step 5: Save to Supabase
      if (compositeResult.success) {
        await this.saveVideoToDatabase({
          chapterId: request.chapterId,
          language: request.language,
          videoUrl: compositeResult.videoUrl!,
          thumbnailUrl: compositeResult.thumbnailUrl,
          providers: {
            video: this.getVideoProvider(request.language),
            avatar: request.avatar.avatarProvider,
            tts: request.avatar.voiceProvider,
          },
        });
      }

      return {
        success: true,
        videoUrl: compositeResult.videoUrl,
        thumbnailUrl: compositeResult.thumbnailUrl,
        duration: config.duration,
        providers: {
          video: this.getVideoProvider(request.language),
          avatar: request.avatar.avatarProvider,
          tts: request.avatar.voiceProvider,
        },
      };
    } catch (error) {
      console.error(`Video generation failed:`, error);
      const videoProvider = this.getVideoProvider(request.language);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        providers: {
          video: 'none',
          avatar: 'none',
          tts: 'none',
        },
      };
    }
  }

  /**
   * Generate voiceover for chapter
   */
  private async generateVoiceover(
    request: VideoGenerationRequest,
    config: ChapterVisualConfig
  ): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'tts',
        language: request.language,
        voiceProvider: request.avatar.voiceProvider,
        voiceId: request.avatar.voiceId,
        chapterId: config.id,
        quality: request.quality,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, audioUrl: data?.audioUrl };
  }

  /**
   * Generate avatar video with lip-sync
   */
  private async generateAvatarVideo(
    request: VideoGenerationRequest,
    config: ChapterVisualConfig,
    audioUrl: string
  ): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: {
        type: 'video',
        pipeline: 'avatar-with-lipsync',
        avatarProvider: request.avatar.avatarProvider,
        avatarStyle: request.avatar.style,
        audioUrl,
        behaviors: config.avatarBehavior.gestures,
        duration: config.duration,
        quality: request.quality,
        transitionToGenie: request.avatar.transitionToGenie,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, videoUrl: data?.videoUrl };
  }

  /**
   * Generate 3D elements for the chapter
   */
  private async generate3DElements(
    config: ChapterVisualConfig
  ): Promise<{ success: boolean; elements: string[]; error?: string }> {
    const elementPromises = config.elements3D.map(async (element) => {
      const { data, error } = await supabase.functions.invoke('modelslab-media', {
        body: {
          type: '3d',
          prompt: `Professional 3D ${element}, modern tech aesthetic, ${config.primaryColor} accent color, high quality render`,
          model: 'meshy',
        },
      });

      if (error) {
        console.warn(`3D element generation failed for ${element}:`, error);
        return null;
      }

      return data?.output;
    });

    const results = await Promise.all(elementPromises);
    const validElements = results.filter(Boolean) as string[];

    return { success: true, elements: validElements };
  }

  /**
   * Composite final video with all elements
   */
  private async compositeVideo(
    avatarVideoUrl: string,
    elements3D: string[],
    config: ChapterVisualConfig,
    includeGenie: boolean
  ): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string; error?: string }> {
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: {
        type: 'video',
        pipeline: 'composite',
        baseVideo: avatarVideoUrl,
        overlays: elements3D,
        transitions: config.transitions,
        includeGenie,
        genieConfig: includeGenie ? config.genieAppearance : null,
        duration: config.duration,
      },
    });

    if (error) {
      // Fallback: return avatar video without compositing
      return { success: true, videoUrl: avatarVideoUrl };
    }

    return {
      success: true,
      videoUrl: data?.videoUrl,
      thumbnailUrl: data?.thumbnailUrl,
    };
  }

  /**
   * Save generated video to database
   */
  private async saveVideoToDatabase(params: {
    chapterId: string;
    language: string;
    videoUrl: string;
    thumbnailUrl?: string;
    providers: { video: string; avatar: string; tts: string };
  }): Promise<void> {
    const config = CHAPTER_VISUAL_CONFIGS.find(c => c.id === params.chapterId);
    if (!config) return;

    const { error } = await supabase.from('landing_page_videos').upsert({
      title: `${config.product} - ${config.title}`,
      description: `AI-generated marketing video for ${config.product}`,
      video_url: params.videoUrl,
      thumbnail_url: params.thumbnailUrl || '',
      content_type: params.chapterId,
      language_code: params.language,
      duration_seconds: config.duration,
      placement: 'hero_showcase',
      ai_providers: params.providers,
      is_active: true,
    }, {
      onConflict: 'content_type,language_code',
    });

    if (error) {
      console.error('Failed to save video to database:', error);
    }
  }

  /**
   * Get video provider for language zone
   */
  private getVideoProvider(language: string): string {
    const zoneMap: Record<string, string> = {
      en: 'vertex-ai-veo',
      es: 'vertex-ai-veo',
      fr: 'vertex-ai-veo',
      de: 'vertex-ai-veo',
      pt: 'vertex-ai-veo',
      ar: 'modelslab',
      hi: 'modelslab',
      zh: 'alibaba-wan',
      ja: 'alibaba-wan',
      ko: 'alibaba-wan',
      sw: 'modelslab',
    };
    return zoneMap[language] || 'modelslab';
  }

  /**
   * Generate all chapter videos for a language
   */
  async generateAllChaptersForLanguage(
    language: string,
    quality: 'preview' | 'production' | 'cinematic' = 'production'
  ): Promise<Map<string, VideoGenerationResult>> {
    const results = new Map<string, VideoGenerationResult>();
    const avatars = REGIONAL_AVATARS[language] || REGIONAL_AVATARS.en;
    
    // Alternate between male and female avatars
    for (let i = 0; i < CHAPTER_VISUAL_CONFIGS.length; i++) {
      const config = CHAPTER_VISUAL_CONFIGS[i];
      const avatar = avatars[i % avatars.length];

      const result = await this.generateChapterVideo({
        chapterId: config.id,
        language,
        avatar,
        quality,
        includeSubtitles: true,
        includeGenie: config.genieAppearance.visible,
        include3D: true,
      });

      results.set(config.id, result);

      // Add delay between generations to avoid rate limiting
      if (i < CHAPTER_VISUAL_CONFIGS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }

  /**
   * Get generation status
   */
  getGenerationStatus(): {
    isGenerating: boolean;
    queueLength: number;
  } {
    return {
      isGenerating: this.isGenerating,
      queueLength: this.generationQueue.length,
    };
  }
}

export const landingVideoGenerationService = new LandingVideoGenerationService();
