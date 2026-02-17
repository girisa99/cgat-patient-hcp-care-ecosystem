/**
 * Extended Video Styles Registry
 * 
 * Additional styles beyond the master registry:
 * - Animated: Crayon, Hand-sketch, Microworld, Stop-motion, Paper cutout
 * - Photorealistic: Upscaler, Photo enhancement, Hyper-real
 * - Character: Character vlog, Pixar, Disney, Universal, Mascot
 * - Cyber/Tech: Cyberpunk, Neon, Glitch, Futuristic
 * - Educational: Explainer, School/Learning, Teaching
 */

export interface ExtendedVideoStyle {
  id: string;
  title: string;
  category: 'animated' | 'photorealistic' | 'character' | 'cyber' | 'educational' | 'artistic';
  description: string;
  icon: string;
  videoProvider: string;
  avatarProvider?: string;
  animationProvider?: string;
  ttsStyle: string;
  pacing: 'slow' | 'normal' | 'fast' | 'dynamic';
  industries: string[];
  capabilities: string[];
  regionalFit: string[];
  popular?: boolean;
  new?: boolean;
  premium?: boolean;
}

export const EXTENDED_VIDEO_STYLES: ExtendedVideoStyle[] = [
  // ═══════════════════════════════════════════════════════════════
  // ANIMATED / HAND-DRAWN STYLES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'crayon_sketch',
    title: 'Crayon Sketch',
    category: 'animated',
    description: 'Childlike crayon drawing style with colorful, playful aesthetics',
    icon: '🖍️',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'playful',
    pacing: 'normal',
    industries: ['education', 'kids', 'nonprofit'],
    capabilities: ['text_to_video', 'image_to_video'],
    regionalFit: ['western', 'europe', 'latam'],
    popular: true,
    new: true,
  },
  {
    id: 'hand_sketch',
    title: 'Hand Sketch',
    category: 'animated',
    description: 'Pencil sketch style with artistic hand-drawn aesthetics',
    icon: '✏️',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'artistic',
    pacing: 'slow',
    industries: ['art', 'education', 'architecture'],
    capabilities: ['text_to_video', 'image_to_video', 'video_effects'],
    regionalFit: ['western', 'europe', 'cjk'],
    new: true,
  },
  {
    id: 'microworld',
    title: 'Microworld',
    category: 'animated',
    description: 'Tiny world perspective with macro photography aesthetic',
    icon: '🔬',
    videoProvider: 'vertex-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'documentary',
    pacing: 'slow',
    industries: ['science', 'education', 'nature'],
    capabilities: ['text_to_video', '3d_generation', 'video_effects'],
    regionalFit: ['western', 'cjk', 'europe'],
    premium: true,
  },
  {
    id: 'stop_motion',
    title: 'Stop Motion',
    category: 'animated',
    description: 'Classic stop-motion animation with tactile, handmade feel',
    icon: '🎞️',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'narrative',
    pacing: 'normal',
    industries: ['entertainment', 'crafts', 'kids'],
    capabilities: ['text_to_video', 'video_effects'],
    regionalFit: ['western', 'europe'],
  },
  {
    id: 'paper_cutout',
    title: 'Paper Cutout',
    category: 'animated',
    description: 'Layered paper cutout animation style like South Park',
    icon: '📄',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'animated',
    pacing: 'fast',
    industries: ['entertainment', 'education', 'marketing'],
    capabilities: ['text_to_video', 'animation'],
    regionalFit: ['western', 'latam'],
  },
  {
    id: 'watercolor',
    title: 'Watercolor',
    category: 'animated',
    description: 'Soft watercolor painting style with flowing transitions',
    icon: '🎨',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'calm',
    pacing: 'slow',
    industries: ['art', 'wellness', 'nature'],
    capabilities: ['text_to_video', 'image_to_video'],
    regionalFit: ['cjk', 'europe', 'western'],
    new: true,
  },
  {
    id: 'oil_painting',
    title: 'Oil Painting',
    category: 'animated',
    description: 'Rich oil painting aesthetic with textured brushstrokes',
    icon: '🖼️',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'artistic',
    pacing: 'slow',
    industries: ['art', 'luxury', 'culture'],
    capabilities: ['text_to_video', 'image_to_video'],
    regionalFit: ['europe', 'western', 'mena'],
  },

  // ═══════════════════════════════════════════════════════════════
  // PHOTOREALISTIC / UPSCALER STYLES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'photorealistic_4k',
    title: 'Photorealistic 4K',
    category: 'photorealistic',
    description: 'Ultra-high definition photorealistic renders',
    icon: '📸',
    videoProvider: 'vertex-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'professional',
    pacing: 'normal',
    industries: ['real_estate', 'automotive', 'product'],
    capabilities: ['text_to_video', 'image_upscaler', 'video_effects'],
    regionalFit: ['western', 'europe', 'cjk'],
    premium: true,
  },
  {
    id: 'image_upscaler',
    title: 'Image Upscaler',
    category: 'photorealistic',
    description: 'AI-enhanced image upscaling with detail preservation',
    icon: '🔍',
    videoProvider: 'modelslab',
    ttsStyle: 'neutral',
    pacing: 'normal',
    industries: ['photography', 'ecommerce', 'real_estate'],
    capabilities: ['image_upscaler', 'image_to_video'],
    regionalFit: ['western', 'cjk', 'europe'],
  },
  {
    id: 'hyper_real',
    title: 'Hyper-Real',
    category: 'photorealistic',
    description: 'Beyond-reality detailed renders with enhanced textures',
    icon: '💎',
    videoProvider: 'sora2api',
    ttsStyle: 'dramatic',
    pacing: 'slow',
    industries: ['luxury', 'automotive', 'fashion'],
    capabilities: ['text_to_video', '3d_generation'],
    regionalFit: ['western', 'cjk', 'mena'],
    premium: true,
    new: true,
  },
  {
    id: 'cinematic_film',
    title: 'Cinematic Film',
    category: 'photorealistic',
    description: '35mm film grain aesthetic with cinematic color grading',
    icon: '🎬',
    videoProvider: 'vertex-ai',
    ttsStyle: 'cinematic',
    pacing: 'dynamic',
    industries: ['entertainment', 'brand', 'documentary'],
    capabilities: ['text_to_video', 'video_effects'],
    regionalFit: ['western', 'europe'],
  },

  // ═══════════════════════════════════════════════════════════════
  // CHARACTER-BASED STYLES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'pixar_disney',
    title: 'Pixar/Disney',
    category: 'character',
    description: 'High-quality 3D animation in Pixar/Disney style',
    icon: '🎪',
    videoProvider: 'meshy-ai',
    avatarProvider: 'meshy-3d',
    animationProvider: 'modelslab',
    ttsStyle: 'animated',
    pacing: 'dynamic',
    industries: ['kids', 'education', 'entertainment', 'family'],
    capabilities: ['3d_generation', 'avatar', 'lipsync', 'pixar_style'],
    regionalFit: ['western', 'latam', 'europe', 'sea'],
    popular: true,
  },
  {
    id: 'universal_dreamworks',
    title: 'Universal/DreamWorks',
    category: 'character',
    description: 'DreamWorks-style 3D characters with expressive animation',
    icon: '🌙',
    videoProvider: 'meshy-ai',
    avatarProvider: 'meshy-3d',
    animationProvider: 'modelslab',
    ttsStyle: 'comedic',
    pacing: 'fast',
    industries: ['entertainment', 'kids', 'gaming'],
    capabilities: ['3d_generation', 'avatar', 'lipsync'],
    regionalFit: ['western', 'europe', 'latam'],
  },
  {
    id: 'character_vlog',
    title: 'Character Vlog',
    category: 'character',
    description: 'Animated character hosting vlog-style content',
    icon: '🗣️',
    videoProvider: 'alibaba-wan',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'conversational',
    pacing: 'normal',
    industries: ['influencer', 'education', 'gaming'],
    capabilities: ['avatar', 'lipsync', 'tts'],
    regionalFit: ['western', 'cjk', 'sea', 'india'],
    popular: true,
    new: true,
  },
  {
    id: 'mascot_presenter',
    title: 'Mascot Presenter',
    category: 'character',
    description: 'Brand mascot as video presenter with personality',
    icon: '🐻',
    videoProvider: 'modelslab',
    avatarProvider: 'meshy-3d',
    animationProvider: 'modelslab',
    ttsStyle: 'friendly',
    pacing: 'normal',
    industries: ['marketing', 'retail', 'food', 'sports'],
    capabilities: ['3d_generation', 'avatar', 'lipsync'],
    regionalFit: ['western', 'cjk', 'latam'],
  },
  {
    id: 'anime_character',
    title: 'Anime Character',
    category: 'character',
    description: 'Full anime-style character with Japanese animation aesthetic',
    icon: '🎌',
    videoProvider: 'modelslab',
    avatarProvider: 'modelslab-anime',
    animationProvider: 'modelslab-anime',
    ttsStyle: 'anime_style',
    pacing: 'dynamic',
    industries: ['gaming', 'entertainment', 'youth'],
    capabilities: ['avatar', 'lipsync', 'anime_style'],
    regionalFit: ['cjk', 'sea', 'western'],
    popular: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // CYBER / TECH STYLES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cyberpunk',
    title: 'Cyberpunk',
    category: 'cyber',
    description: 'Neon-lit futuristic cyberpunk aesthetic',
    icon: '🌆',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'tech',
    pacing: 'fast',
    industries: ['gaming', 'tech', 'entertainment'],
    capabilities: ['text_to_video', 'video_effects', '3d_generation'],
    regionalFit: ['western', 'cjk', 'europe'],
    popular: true,
    new: true,
  },
  {
    id: 'neon_glow',
    title: 'Neon Glow',
    category: 'cyber',
    description: 'Vibrant neon effects with glowing aesthetics',
    icon: '💜',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'energetic',
    pacing: 'fast',
    industries: ['nightlife', 'music', 'gaming', 'fitness'],
    capabilities: ['video_effects', 'text_to_video'],
    regionalFit: ['western', 'cjk', 'sea'],
  },
  {
    id: 'glitch_art',
    title: 'Glitch Art',
    category: 'cyber',
    description: 'Digital glitch effects with distorted aesthetics',
    icon: '📺',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'edgy',
    pacing: 'fast',
    industries: ['music', 'tech', 'youth'],
    capabilities: ['video_effects', 'transitions'],
    regionalFit: ['western', 'europe'],
  },
  {
    id: 'holographic',
    title: 'Holographic',
    category: 'cyber',
    description: 'Hologram-style 3D projections with futuristic feel',
    icon: '🔮',
    videoProvider: 'meshy-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'futuristic',
    pacing: 'normal',
    industries: ['tech', 'automotive', 'innovation'],
    capabilities: ['3d_generation', 'video_effects'],
    regionalFit: ['western', 'cjk', 'mena'],
    premium: true,
  },
  {
    id: 'retro_synthwave',
    title: 'Retro Synthwave',
    category: 'cyber',
    description: '80s synthwave aesthetic with retro-futuristic vibes',
    icon: '🌅',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'retro',
    pacing: 'dynamic',
    industries: ['music', 'gaming', 'fashion'],
    capabilities: ['video_effects', 'text_to_video'],
    regionalFit: ['western', 'europe', 'latam'],
    popular: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // EDUCATIONAL STYLES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'explainer_video',
    title: 'Explainer Video',
    category: 'educational',
    description: 'Clear, concise explainer videos for complex topics',
    icon: '💡',
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'educational',
    pacing: 'normal',
    industries: ['saas', 'tech', 'finance', 'healthcare'],
    capabilities: ['avatar', 'lipsync', 'tts', 'motion_graphics'],
    regionalFit: ['western', 'europe', 'india', 'cjk'],
    popular: true,
  },
  {
    id: 'school_learning',
    title: 'School & Learning',
    category: 'educational',
    description: 'Age-appropriate educational content for K-12',
    icon: '🏫',
    videoProvider: 'modelslab',
    avatarProvider: 'alibaba-wan2.2',
    animationProvider: 'modelslab',
    ttsStyle: 'teacher',
    pacing: 'normal',
    industries: ['education', 'edtech', 'nonprofit'],
    capabilities: ['avatar', 'lipsync', 'tts', 'animation'],
    regionalFit: ['western', 'india', 'africa', 'latam', 'sea'],
    popular: true,
    new: true,
  },
  {
    id: 'tutorial_walkthrough',
    title: 'Tutorial Walkthrough',
    category: 'educational',
    description: 'Step-by-step tutorials with screen recording style',
    icon: '🖥️',
    videoProvider: 'modelslab',
    ttsStyle: 'instructional',
    pacing: 'slow',
    industries: ['tech', 'saas', 'gaming'],
    capabilities: ['tts', 'video_effects'],
    regionalFit: ['western', 'india', 'cjk'],
  },
  {
    id: 'science_documentary',
    title: 'Science Documentary',
    category: 'educational',
    description: 'Scientific content with professional narration',
    icon: '🔬',
    videoProvider: 'vertex-ai',
    ttsStyle: 'documentary',
    pacing: 'slow',
    industries: ['science', 'education', 'nature'],
    capabilities: ['text_to_video', 'tts', '3d_generation'],
    regionalFit: ['western', 'europe', 'cjk'],
    premium: true,
  },
  {
    id: 'motivational_inspirational',
    title: 'Motivational',
    category: 'educational',
    description: 'Inspiring content with powerful messaging',
    icon: '🚀',
    videoProvider: 'vertex-ai',
    ttsStyle: 'inspirational',
    pacing: 'dynamic',
    industries: ['coaching', 'fitness', 'business', 'nonprofit'],
    capabilities: ['text_to_video', 'tts', 'music_gen'],
    regionalFit: ['western', 'india', 'mena', 'africa'],
    popular: true,
  },
  {
    id: 'innovation_tech',
    title: 'Innovation & Tech',
    category: 'educational',
    description: 'Cutting-edge tech and innovation content',
    icon: '⚡',
    videoProvider: 'vertex-ai',
    ttsStyle: 'tech',
    pacing: 'fast',
    industries: ['tech', 'startup', 'innovation'],
    capabilities: ['text_to_video', '3d_generation', 'video_effects'],
    regionalFit: ['western', 'cjk', 'india'],
    new: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // ARTISTIC STYLES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'car_racing',
    title: 'Car Racing',
    category: 'artistic',
    description: 'High-speed automotive content with dynamic action',
    icon: '🏎️',
    videoProvider: 'vertex-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'energetic',
    pacing: 'fast',
    industries: ['automotive', 'sports', 'gaming'],
    capabilities: ['text_to_video', '3d_generation', 'video_effects'],
    regionalFit: ['western', 'mena', 'europe'],
    popular: true,
  },
  {
    id: 'creative_abstract',
    title: 'Creative Abstract',
    category: 'artistic',
    description: 'Abstract art and creative visual expressions',
    icon: '🎭',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'artistic',
    pacing: 'slow',
    industries: ['art', 'fashion', 'music'],
    capabilities: ['text_to_video', 'video_effects'],
    regionalFit: ['western', 'europe', 'cjk'],
  },
  {
    id: 'vintage_retro',
    title: 'Vintage/Retro',
    category: 'artistic',
    description: 'Classic vintage aesthetics with nostalgic feel',
    icon: '📻',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'classic',
    pacing: 'normal',
    industries: ['fashion', 'food', 'lifestyle'],
    capabilities: ['video_effects', 'image_to_video'],
    regionalFit: ['western', 'europe'],
  },
];

// Helper functions
export function getExtendedStylesByCategory(category: ExtendedVideoStyle['category']): ExtendedVideoStyle[] {
  return EXTENDED_VIDEO_STYLES.filter(style => style.category === category);
}

export function getExtendedStylesByRegion(region: string): ExtendedVideoStyle[] {
  return EXTENDED_VIDEO_STYLES.filter(style => style.regionalFit.includes(region));
}

export function getExtendedStylesByCapability(capability: string): ExtendedVideoStyle[] {
  return EXTENDED_VIDEO_STYLES.filter(style => style.capabilities.includes(capability));
}

export function getPopularExtendedStyles(): ExtendedVideoStyle[] {
  return EXTENDED_VIDEO_STYLES.filter(style => style.popular);
}

export function getNewExtendedStyles(): ExtendedVideoStyle[] {
  return EXTENDED_VIDEO_STYLES.filter(style => style.new);
}

// Combined count
export const TOTAL_EXTENDED_STYLES = EXTENDED_VIDEO_STYLES.length;
