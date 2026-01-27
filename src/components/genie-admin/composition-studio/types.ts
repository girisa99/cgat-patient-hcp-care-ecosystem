/**
 * UNIFIED COMPOSITION STUDIO TYPES
 * 
 * Types for flexible mix-and-match content generation:
 * - Chapter-based composition (each chapter can have different elements)
 * - Multi-language support
 * - Preview system
 */

export type CompositionElementType = 
  | 'video'           // Pure AI-generated video
  | 'avatar'          // AI avatar (talking head)
  | '3d'              // 3D model/scene
  | 'animation'       // Animated graphics/kinetic typography
  | 'static'          // Static image/slide
  | 'screen_recording'// Screen capture
  | 'custom';         // User uploaded

export type VoiceoverType =
  | 'none'            // No voiceover
  | 'tts'             // Text-to-speech
  | 'voice_clone'     // Cloned voice
  | 'recorded'        // User recorded
  | 'lipsync';        // Lip-synced to avatar

export type AvatarStyle = 
  | 'professional_western'
  | 'professional_mena'
  | 'professional_cjk'
  | 'professional_south_asian'
  | 'professional_latam'
  | 'casual'
  | 'custom';

export type Resolution = '720p' | '1080p' | '4k';

export interface ChapterVoiceover {
  type: VoiceoverType;
  text: string;
  language: string;
  voiceId?: string;
  voiceProvider?: 'elevenlabs' | 'azure' | 'alibaba' | 'google';
  audioUrl?: string;
  audioBase64?: string;
  duration?: number;
}

export interface ChapterVisual {
  type: CompositionElementType;
  
  // For video/animation
  prompt?: string;
  videoUrl?: string;
  
  // For avatar
  avatarStyle?: AvatarStyle;
  avatarModel?: string;
  enableLipSync?: boolean;
  
  // For 3D
  meshPrompt?: string;
  modelUrl?: string;
  
  // For static
  imageUrl?: string;
  
  // Common
  duration?: number;
  transitionIn?: 'fade' | 'slide' | 'zoom' | 'none';
  transitionOut?: 'fade' | 'slide' | 'zoom' | 'none';
}

export interface CompositionChapter {
  id: string;
  order: number;
  title: string;
  duration: number; // in seconds
  
  // Visual layer (what you see)
  visual: ChapterVisual;
  
  // Audio layer (what you hear)
  voiceover: ChapterVoiceover;
  backgroundMusic?: {
    enabled: boolean;
    genre?: string;
    volume?: number;
  };
  
  // Generation state
  status: 'draft' | 'generating' | 'complete' | 'error';
  progress?: number;
  error?: string;
  
  // Preview URLs per language
  previewUrls: Record<string, string>;
}

export interface CompositionProject {
  id: string;
  name: string;
  description?: string;
  
  // Target configuration
  targetLanguages: string[];
  primaryLanguage: string;
  resolution: Resolution;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  
  // Chapters
  chapters: CompositionChapter[];
  
  // Global settings
  globalSettings: {
    defaultAvatarStyle?: AvatarStyle;
    defaultVoiceProvider?: string;
    brandColors?: string[];
    logoUrl?: string;
    watermarkEnabled?: boolean;
  };
  
  // Output destination
  destination: 'landing_page' | 'download' | 'storage';
  placement?: string; // For landing page (hero, product_demo, etc.)
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'in_progress' | 'ready' | 'published';
}

export interface LanguageConfig {
  code: string;
  name: string;
  zone: 'West/EU' | 'MENA' | 'India/SEA' | 'CJK' | 'Africa' | 'Fallback';
  voiceProvider: 'elevenlabs' | 'azure' | 'alibaba' | 'google';
  defaultVoiceId: string;
  isRTL: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', zone: 'West/EU', voiceProvider: 'elevenlabs', defaultVoiceId: 'rachel', isRTL: false },
  { code: 'es', name: 'Spanish', zone: 'West/EU', voiceProvider: 'elevenlabs', defaultVoiceId: 'matilda', isRTL: false },
  { code: 'fr', name: 'French', zone: 'West/EU', voiceProvider: 'elevenlabs', defaultVoiceId: 'charlotte', isRTL: false },
  { code: 'de', name: 'German', zone: 'West/EU', voiceProvider: 'azure', defaultVoiceId: 'de-DE-ConradNeural', isRTL: false },
  { code: 'pt', name: 'Portuguese', zone: 'West/EU', voiceProvider: 'azure', defaultVoiceId: 'pt-BR-AntonioNeural', isRTL: false },
  { code: 'ar', name: 'Arabic', zone: 'MENA', voiceProvider: 'azure', defaultVoiceId: 'ar-SA-HamedNeural', isRTL: true },
  { code: 'hi', name: 'Hindi', zone: 'India/SEA', voiceProvider: 'azure', defaultVoiceId: 'hi-IN-MadhurNeural', isRTL: false },
  { code: 'zh', name: 'Chinese', zone: 'CJK', voiceProvider: 'alibaba', defaultVoiceId: 'zhixiaobai', isRTL: false },
  { code: 'ja', name: 'Japanese', zone: 'CJK', voiceProvider: 'alibaba', defaultVoiceId: 'sicheng', isRTL: false },
  { code: 'ko', name: 'Korean', zone: 'CJK', voiceProvider: 'azure', defaultVoiceId: 'ko-KR-InJoonNeural', isRTL: false },
  { code: 'ru', name: 'Russian', zone: 'West/EU', voiceProvider: 'azure', defaultVoiceId: 'ru-RU-DmitryNeural', isRTL: false },
  { code: 'id', name: 'Indonesian', zone: 'India/SEA', voiceProvider: 'azure', defaultVoiceId: 'id-ID-ArdiNeural', isRTL: false },
  { code: 'vi', name: 'Vietnamese', zone: 'India/SEA', voiceProvider: 'azure', defaultVoiceId: 'vi-VN-NamMinhNeural', isRTL: false },
  { code: 'th', name: 'Thai', zone: 'India/SEA', voiceProvider: 'azure', defaultVoiceId: 'th-TH-NiwatNeural', isRTL: false },
];

export const ELEMENT_PROVIDERS: Record<CompositionElementType, string[]> = {
  video: ['ModelsLab', 'Alibaba Wan2.2', 'Replicate'],
  avatar: ['Alibaba OmniAvatar', 'Alibaba Wan2.2-S2V', 'Alibaba TaoAvatar'],
  '3d': ['Meshy AI', 'ModelsLab 3D'],
  animation: ['ModelsLab AnimateDiff', 'Alibaba Wan2.2-Animate'],
  static: ['FLUX', 'DALL-E 3'],
  screen_recording: ['Native'],
  custom: ['User Upload'],
};

export const DEFAULT_CHAPTERS: Omit<CompositionChapter, 'id'>[] = [
  {
    order: 1,
    title: 'Opening',
    duration: 30,
    visual: { type: 'animation', prompt: 'Magical genie lamp emerging from smoke' },
    voiceover: { type: 'tts', text: 'Welcome to Genie Studio...', language: 'en' },
    status: 'draft',
    previewUrls: {},
  },
  {
    order: 2,
    title: 'Product Overview',
    duration: 45,
    visual: { type: 'avatar', avatarStyle: 'professional_western', enableLipSync: true },
    voiceover: { type: 'lipsync', text: 'Let me show you what Genie can do...', language: 'en' },
    status: 'draft',
    previewUrls: {},
  },
  {
    order: 3,
    title: 'Feature Showcase',
    duration: 60,
    visual: { type: '3d', meshPrompt: 'Holographic interface with floating product icons' },
    voiceover: { type: 'tts', text: 'Explore our powerful features...', language: 'en' },
    status: 'draft',
    previewUrls: {},
  },
  {
    order: 4,
    title: 'Call to Action',
    duration: 20,
    visual: { type: 'video', prompt: 'Cinematic brand outro with logo reveal' },
    voiceover: { type: 'tts', text: 'Start your journey today...', language: 'en' },
    status: 'draft',
    previewUrls: {},
  },
];
