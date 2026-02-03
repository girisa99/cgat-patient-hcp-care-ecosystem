/**
 * VIDEO STYLE PIPELINE MAPPING
 * 
 * Maps video style selections to:
 * - AI providers (video, avatar, animation)
 * - Pipeline configurations
 * - Script tone/format adjustments
 * - Visual generation parameters
 * 
 * Used by Genie Cast, Vibe, and Deck for consistent style generation
 */

import type { VideoStyleType, AvatarStyleType } from '@/components/genie-admin/genie-cast/VideoStyleCards';

// Provider routing for each video style
export interface StyleProviderConfig {
  videoProvider: string;
  avatarProvider?: string;
  animationProvider?: string;
  ttsStyle?: string;
  visualEffect?: string;
  scriptTone?: string;
  pacing?: 'slow' | 'normal' | 'fast' | 'dynamic';
}

// Maps video styles to their AI provider configurations
export const VIDEO_STYLE_PROVIDERS: Record<VideoStyleType, StyleProviderConfig> = {
  // === STORYTELLING ===
  smart_storytelling: {
    videoProvider: 'vertex-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'narrative',
    visualEffect: 'cinematic',
    scriptTone: 'narrative_arc',
    pacing: 'dynamic',
  },
  hook_videos: {
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'energetic',
    visualEffect: 'attention_grab',
    scriptTone: 'punchy',
    pacing: 'fast',
  },
  micro_drama: {
    videoProvider: 'vertex-ai',
    animationProvider: 'runway',
    ttsStyle: 'dramatic',
    visualEffect: 'cinematic',
    scriptTone: 'dramatic_arc',
    pacing: 'dynamic',
  },

  // === AVATAR STYLES ===
  ugc_avatar_photorealistic: {
    videoProvider: 'alibaba-wan',
    avatarProvider: 'alibaba-wan2.2', // Primary for photorealistic
    ttsStyle: 'conversational',
    visualEffect: 'presenter',
    scriptTone: 'personal',
    pacing: 'normal',
  },
  ugc_avatar_3d_pixar: {
    videoProvider: 'modelslab',
    avatarProvider: 'meshy-3d', // 3D Pixar style
    animationProvider: 'modelslab',
    ttsStyle: 'friendly',
    visualEffect: '3d_character',
    scriptTone: 'warm',
    pacing: 'normal',
  },
  ugc_avatar_2d_animated: {
    videoProvider: 'modelslab',
    avatarProvider: 'modelslab-animate', // 2D animation
    animationProvider: 'modelslab',
    ttsStyle: 'animated',
    visualEffect: '2d_cartoon',
    scriptTone: 'playful',
    pacing: 'normal',
  },
  talking_photos: {
    videoProvider: 'alibaba-wan',
    avatarProvider: 'alibaba-wan2.2-s2v', // Speech-to-video for photo animation
    ttsStyle: 'natural',
    visualEffect: 'photo_animate',
    scriptTone: 'conversational',
    pacing: 'normal',
  },

  // === ANIMATION ===
  anime: {
    videoProvider: 'modelslab',
    animationProvider: 'modelslab-anime',
    ttsStyle: 'anime_style',
    visualEffect: 'anime',
    scriptTone: 'expressive',
    pacing: 'dynamic',
  },
  image_to_life: {
    videoProvider: 'alibaba-wan',
    animationProvider: 'alibaba-wan2.6-i2v', // Image to video
    ttsStyle: 'ambient',
    visualEffect: 'parallax_motion',
    scriptTone: 'descriptive',
    pacing: 'slow',
  },
  explainer_3d: {
    videoProvider: 'meshy-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'educational',
    visualEffect: '3d_explainer',
    scriptTone: 'clear',
    pacing: 'normal',
  },
  music_video: {
    videoProvider: 'vertex-ai',
    animationProvider: 'runway',
    ttsStyle: 'musical',
    visualEffect: 'beat_sync',
    scriptTone: 'lyrical',
    pacing: 'dynamic',
  },

  // === INTERACTIVE ===
  educational: {
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'educational',
    visualEffect: 'clean',
    scriptTone: 'instructional',
    pacing: 'normal',
  },
  chapter_navigation: {
    videoProvider: 'vertex-ai',
    ttsStyle: 'professional',
    visualEffect: 'chapter_markers',
    scriptTone: 'structured',
    pacing: 'normal',
  },
  interactive_quiz: {
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'engaging',
    visualEffect: 'interactive_overlay',
    scriptTone: 'quiz_format',
    pacing: 'dynamic',
  },
  progress_tracking: {
    videoProvider: 'vertex-ai',
    ttsStyle: 'encouraging',
    visualEffect: 'progress_bar',
    scriptTone: 'supportive',
    pacing: 'normal',
  },
  cta_videos: {
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'persuasive',
    visualEffect: 'cta_highlight',
    scriptTone: 'action_oriented',
    pacing: 'fast',
  },

  // === MARKETING ===
  social: {
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'trendy',
    visualEffect: 'social_optimized',
    scriptTone: 'casual',
    pacing: 'fast',
  },
  video_ads: {
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'professional',
    visualEffect: 'commercial',
    scriptTone: 'persuasive',
    pacing: 'dynamic',
  },
  product_demo: {
    videoProvider: 'vertex-ai',
    ttsStyle: 'demo',
    visualEffect: 'product_focus',
    scriptTone: 'feature_focused',
    pacing: 'normal',
  },
  testimonial: {
    videoProvider: 'alibaba-wan',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'authentic',
    visualEffect: 'testimonial',
    scriptTone: 'personal_story',
    pacing: 'normal',
  },

  // === PRODUCTION ===
  storyboarding: {
    videoProvider: 'modelslab',
    ttsStyle: 'outline',
    visualEffect: 'sketch',
    scriptTone: 'planning',
    pacing: 'slow',
  },
};

// Avatar style to provider mapping (Using only integrated providers)
export const AVATAR_STYLE_PROVIDERS: Record<AvatarStyleType, { 
  provider: string; 
  model: string;
  alternatives: string[]; // Fallback providers (only integrated ones)
}> = {
  photorealistic: {
    provider: 'alibaba',
    model: 'wan2.2-s2v', // Speech-to-video with lip-sync
    alternatives: ['alibaba-omniavatar', 'alibaba-mach'],
  },
  '3d_pixar': {
    provider: 'meshy',
    model: 'character-3d', // 3D character generation
    alternatives: ['alibaba-3d', 'modelslab-3d'],
  },
  '2d_animated': {
    provider: 'modelslab',
    model: 'animatediff-cartoon', // 2D animation style
    alternatives: ['alibaba-wan', 'replicate-svd'],
  },
};

// Extended provider capabilities registry (Only integrated providers)
export const PROVIDER_CAPABILITIES: Record<string, {
  category: string[];
  strengths: string[];
  maxDuration: number;
  quality: 'standard' | 'hd' | '4k';
}> = {
  // Video Generation (Integrated)
  'vertex-veo': { category: ['video'], strengths: ['cinematic', 'realistic', 'documentary'], maxDuration: 16, quality: '4k' },
  'sora2api': { category: ['video'], strengths: ['cinematic', 'creative', 'physics'], maxDuration: 20, quality: '4k' },
  'alibaba-wan26': { category: ['video'], strengths: ['asian-style', 'realistic', 'fast'], maxDuration: 10, quality: 'hd' },
  'alibaba-wan22': { category: ['video', 'avatar', 'lipsync'], strengths: ['avatar', 'asian-faces', 'lipsync'], maxDuration: 10, quality: 'hd' },
  'modelslab': { category: ['video', 'image', '3d'], strengths: ['anime', 'stylized', 'fast'], maxDuration: 8, quality: 'hd' },
  'replicate-svd': { category: ['video'], strengths: ['stable', 'reliable', 'image-to-video'], maxDuration: 4, quality: 'hd' },
  'gemini-video': { category: ['video'], strengths: ['google-integration', 'fast'], maxDuration: 8, quality: 'hd' },
  
  // Avatar & Lip-sync (Alibaba Suite - Integrated)
  'alibaba-omniavatar': { category: ['avatar'], strengths: ['full-body', 'expressive'], maxDuration: 120, quality: 'hd' },
  'alibaba-taoavatar': { category: ['avatar', '3d'], strengths: ['3dgs', 'ar-ready'], maxDuration: 60, quality: 'hd' },
  'alibaba-mach': { category: ['avatar'], strengths: ['character', 'animation-ready'], maxDuration: 60, quality: 'hd' },
  
  // 3D Generation (Integrated)
  'meshy': { category: ['3d'], strengths: ['text-to-3d', 'texturing', 'game-ready'], maxDuration: 0, quality: 'hd' },
  'alibaba-richdreamer': { category: ['3d'], strengths: ['high-fidelity', 'detailed'], maxDuration: 0, quality: 'hd' },
  'modelslab-3d': { category: ['3d'], strengths: ['fast', 'stylized'], maxDuration: 0, quality: 'hd' },
};

// Script tone adjustments per style
export const SCRIPT_TONE_MODIFIERS: Record<string, {
  hookIntensity: number; // 0-1
  emotionalArc: boolean;
  ctaFrequency: 'none' | 'subtle' | 'moderate' | 'aggressive';
  humorLevel: 'none' | 'light' | 'medium' | 'heavy';
}> = {
  narrative_arc: { hookIntensity: 0.7, emotionalArc: true, ctaFrequency: 'subtle', humorLevel: 'light' },
  punchy: { hookIntensity: 1.0, emotionalArc: false, ctaFrequency: 'aggressive', humorLevel: 'none' },
  dramatic_arc: { hookIntensity: 0.8, emotionalArc: true, ctaFrequency: 'none', humorLevel: 'none' },
  personal: { hookIntensity: 0.5, emotionalArc: true, ctaFrequency: 'subtle', humorLevel: 'light' },
  warm: { hookIntensity: 0.4, emotionalArc: true, ctaFrequency: 'subtle', humorLevel: 'medium' },
  playful: { hookIntensity: 0.6, emotionalArc: false, ctaFrequency: 'moderate', humorLevel: 'heavy' },
  instructional: { hookIntensity: 0.3, emotionalArc: false, ctaFrequency: 'moderate', humorLevel: 'none' },
  quiz_format: { hookIntensity: 0.6, emotionalArc: false, ctaFrequency: 'moderate', humorLevel: 'light' },
  persuasive: { hookIntensity: 0.9, emotionalArc: true, ctaFrequency: 'aggressive', humorLevel: 'none' },
  casual: { hookIntensity: 0.5, emotionalArc: false, ctaFrequency: 'subtle', humorLevel: 'medium' },
};

// Get the complete configuration for a video style
export function getStylePipelineConfig(style: VideoStyleType): StyleProviderConfig & {
  toneModifier: typeof SCRIPT_TONE_MODIFIERS[string];
} {
  const providerConfig = VIDEO_STYLE_PROVIDERS[style];
  const toneModifier = SCRIPT_TONE_MODIFIERS[providerConfig.scriptTone || 'instructional'] || 
    SCRIPT_TONE_MODIFIERS.instructional;

  return {
    ...providerConfig,
    toneModifier,
  };
}

// Check if style requires avatar generation
export function styleRequiresAvatar(style: VideoStyleType): boolean {
  return VIDEO_STYLE_PROVIDERS[style].avatarProvider !== undefined;
}

// Check if style requires 3D generation
export function styleRequires3D(style: VideoStyleType): boolean {
  const config = VIDEO_STYLE_PROVIDERS[style];
  return config.visualEffect?.includes('3d') || config.animationProvider?.includes('meshy') || false;
}

// Get visual effect parameters for a style
export function getVisualEffectParams(style: VideoStyleType): {
  transitionType: string;
  colorGrading: string;
  motionIntensity: number;
} {
  const config = VIDEO_STYLE_PROVIDERS[style];
  
  const effectParams: Record<string, { transitionType: string; colorGrading: string; motionIntensity: number }> = {
    cinematic: { transitionType: 'crossfade', colorGrading: 'film', motionIntensity: 0.6 },
    attention_grab: { transitionType: 'zoom_burst', colorGrading: 'vibrant', motionIntensity: 1.0 },
    presenter: { transitionType: 'cut', colorGrading: 'natural', motionIntensity: 0.3 },
    '3d_character': { transitionType: 'morph', colorGrading: 'animated', motionIntensity: 0.7 },
    '2d_cartoon': { transitionType: 'wipe', colorGrading: 'cartoon', motionIntensity: 0.8 },
    anime: { transitionType: 'flash', colorGrading: 'anime', motionIntensity: 0.9 },
    clean: { transitionType: 'fade', colorGrading: 'neutral', motionIntensity: 0.2 },
    commercial: { transitionType: 'slide', colorGrading: 'commercial', motionIntensity: 0.5 },
  };

  return effectParams[config.visualEffect || 'clean'] || effectParams.clean;
}
