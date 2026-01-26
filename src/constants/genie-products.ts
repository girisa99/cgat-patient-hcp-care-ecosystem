/**
 * Centralized Genie Product Definitions
 * 
 * IMPORTANT: These are the official taglines and should NOT be changed.
 * All components should import from this file to maintain consistency.
 * 
 * Last Updated: 2026-01-26
 * 
 * OFFICIAL PRODUCTS (7 Core + 1 Master):
 * - Genie Spark: "Ignite your Ideas" - Script generation from any input
 * - Genie Mind: "AI That Understands" - Script editing, TTS, voice, music
 * - Genie Vibe: "Script to Screen" - Audio/Video production, podcast, trim, stitch
 * - Genie Deck: "Ideas to Impact" - AI presentation/slide generation
 * - Genie Arc: "Your Production Journey With Infinite Possibilities" - Scheduling, Kanban
 * - Genie Cast: "Make It. Show It. Scale It." - Global distribution, marketing engine
 * - Ask Genie: "Your wish is my command" - Universal AI assistant
 * - Genie Studio: "Mind to Media" - Master orchestrator
 */

// Import finalized logos
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieStudioBanner from '@/assets/logos/genie-studio-banner.png';
import genieStudioHorizontal from '@/assets/logos/genie-studio-horizontal.png';
import genieArcLogo from '@/assets/logos/genie-arc-combined.png';
import askGenieLogo from '@/assets/logos/ask-genie-combined.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';

// Cast logo - uses studio banner as placeholder until dedicated logo is created
const genieCastLogo = genieStudioBanner;

export type GenieProduct = 'mind' | 'spark' | 'vibe' | 'studio' | 'arc' | 'deck' | 'cast';

export interface GenieProductInfo {
  id: GenieProduct;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  pipelineCategories: string[]; // Categories this product handles
  capabilities: string[]; // Cross-functional capabilities
  logos: {
    combined: string;
    horizontal?: string;
    icon?: string;
  };
}

/**
 * Ask Genie - The Universal AI Assistant
 * Tagline: "Your wish is my command"
 */
export const ASK_GENIE = {
  id: 'ask-genie',
  name: 'Ask Genie',
  tagline: 'Your wish is my command',
  description: 'Your intelligent AI companion that guides you through the entire Genie Studio experience with empathy, creativity, and a touch of magic.',
  emoji: '🧞',
  color: 'from-violet-500 to-fuchsia-500',
  bgColor: 'bg-violet-50 dark:bg-violet-950/20',
  borderColor: 'border-violet-200 dark:border-violet-800',
  logo: askGenieLogo,
  personality: {
    traits: ['empathetic', 'creative', 'witty', 'helpful', 'encouraging'],
    humor: 'gentle and playful, never pushy',
    approach: 'guides through suggestions, not demands'
  }
} as const;

/**
 * Official Genie Product Taglines - DO NOT MODIFY
 * 
 * - Genie Spark: "Ignite your Ideas"
 * - Genie Mind: "AI That Understands"
 * - Genie Vibe: "Script to Screen"
 * - Genie Deck: "Ideas to Impact"
 * - Genie Arc: "Your Production Journey With Infinite Possibilities"
 * - Genie Cast: "Make It. Show It. Scale It."
 * - Genie Studio: "Mind to Media"
 */
export const GENIE_PRODUCTS: Record<GenieProduct, GenieProductInfo> = {
  spark: {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite your Ideas',
    description: 'Generate scripts from any input - Documents, PPT, Video, Audio, URL, Image. If no image exists, AI generates one. Transform raw ideas into structured scripts.',
    emoji: '✨',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    features: [
      'Document to Script',
      'PPT to Script',
      'Video to Script',
      'Audio to Script',
      'URL to Script',
      'Image to Script (with AI generation)',
      'Multi-format input processing',
      'Auto-structure detection'
    ],
    pipelineCategories: [
      'input-processing',
      'script-generation',
      'content-extraction',
      'idea-to-script'
    ],
    capabilities: ['ocr', 'stt', 'summarization', 'image-generation'],
    logos: {
      combined: genieSparkLogo
    }
  },
  mind: {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'AI That Understands',
    description: 'Edit and enhance scripts with AI. Add TTS voiceovers, voice cloning, and background music. The intelligent enhancement layer between script and production.',
    emoji: '🧠',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    features: [
      'AI script editing',
      'Text-to-Speech (TTS)',
      'Voice cloning',
      'Background music',
      'Tone adjustment',
      'Language translation',
      'Content enhancement',
      'Smart suggestions'
    ],
    pipelineCategories: [
      'script-enhancement',
      'tts',
      'voice-cloning',
      'music-generation',
      'translation',
      'content-editing'
    ],
    capabilities: ['tts', 'voice-cloning', 'music', 'translation', 'enhancement'],
    logos: {
      combined: genieMindLogo
    }
  },
  vibe: {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    description: 'Full audio and video production hub. Podcast recording, video capture, trim, stitch, add TTS audio, music, STT transcription, and multi-track editing.',
    emoji: '🎬',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    features: [
      'Podcast recording',
      'Video recording',
      'Trim & crop',
      'Stitch clips',
      'Add audio/TTS',
      'Background music',
      'STT transcription',
      'Multi-track editing',
      'Dubbing',
      'Lip-sync',
      'Avatar video'
    ],
    pipelineCategories: [
      'video-generation',
      'video-editing',
      'audio-recording',
      'podcast',
      'webcast',
      'dubbing',
      'lip-sync',
      'avatar',
      'stt',
      'audio-mixing'
    ],
    capabilities: ['video', 'audio', 'podcast', 'dubbing', 'lip-sync', 'avatar', 'stt', 'recording'],
    logos: {
      combined: genieVibeLogo
    }
  },
  deck: {
    id: 'deck',
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    description: 'AI-powered presentation and slide generation. Create stunning visual presentations from scripts with smart layouts, branding, and multi-language export.',
    emoji: '📊',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    features: [
      'AI slide generation',
      'Smart visual layouts',
      'Brand customization',
      'Multi-language export',
      'Template library',
      'Infographics',
      'Charts & diagrams',
      '3D presentations',
      'Interactive slides'
    ],
    pipelineCategories: [
      'presentation',
      'slides',
      'infographic',
      'visual-design',
      '3d-presentation',
      'interactive'
    ],
    capabilities: ['slides', 'infographics', 'charts', '3d', 'animation', 'branding'],
    logos: {
      combined: genieDeckLogo
    }
  },
  arc: {
    id: 'arc',
    name: 'Genie Arc',
    tagline: 'Your Production Journey With Infinite Possibilities',
    description: 'Enterprise production hub for project scheduling, Kanban workflows, team collaboration, and production pipeline management.',
    emoji: '🎯',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    features: [
      'Project scheduling',
      'Kanban boards',
      'Team collaboration',
      'Production pipeline',
      'Resource management',
      'Task assignment',
      'Progress tracking',
      'Review workflows',
      'Approval chains'
    ],
    pipelineCategories: [
      'scheduling',
      'project-management',
      'collaboration',
      'workflow',
      'review'
    ],
    capabilities: ['scheduling', 'kanban', 'collaboration', 'review', 'approval'],
    logos: {
      combined: genieArcLogo
    }
  },
  cast: {
    id: 'cast',
    name: 'Genie Cast',
    tagline: 'Make It. Show It. Scale It.',
    description: 'Global distribution and marketing engine. Multi-platform publishing, 14-region localization, automated scheduling, and analytics across YouTube, LinkedIn, TikTok, Instagram, X, and Blogs.',
    emoji: '📡',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
    features: [
      'Multi-platform publishing',
      '14-region localization',
      'Automated scheduling',
      'YouTube distribution',
      'LinkedIn publishing',
      'TikTok optimization',
      'Instagram Reels',
      'X/Twitter posts',
      'Blog integration',
      'Analytics dashboard',
      'Regional avatars',
      'Content rotation'
    ],
    pipelineCategories: [
      'distribution',
      'social-media',
      'localization',
      'scheduling',
      'analytics',
      'marketing'
    ],
    capabilities: ['distribution', 'localization', 'scheduling', 'analytics', 'social'],
    logos: {
      combined: genieCastLogo
    }
  },
  studio: {
    id: 'studio',
    name: 'Genie Studio',
    tagline: 'Mind to Media',
    description: 'The master orchestrator that coordinates all Genie products. From idea to global distribution, the complete creative suite.',
    emoji: '🎨',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    features: [
      'Master orchestration',
      'Cross-product workflows',
      'Unified asset library',
      'Project organization',
      '181 pipeline access',
      'A2A agent coordination',
      '5-zone regional routing',
      'Enterprise integration'
    ],
    pipelineCategories: [
      'orchestration',
      'all-categories'
    ],
    capabilities: ['orchestration', 'all'],
    logos: {
      combined: genieStudioBanner,
      horizontal: genieStudioHorizontal
    }
  }
};

/**
 * Get product info by key
 */
export const getProductInfo = (product: GenieProduct): GenieProductInfo => {
  return GENIE_PRODUCTS[product];
};

/**
 * Get product tagline
 */
export const getProductTagline = (product: GenieProduct): string => {
  return GENIE_PRODUCTS[product].tagline;
};

/**
 * Get product logo
 */
export const getProductLogo = (product: GenieProduct): string => {
  return GENIE_PRODUCTS[product].logos.combined;
};

/**
 * Get products by capability
 */
export const getProductsByCapability = (capability: string): GenieProduct[] => {
  return Object.values(GENIE_PRODUCTS)
    .filter(p => p.capabilities.includes(capability) || p.capabilities.includes('all'))
    .map(p => p.id);
};

/**
 * Get products by pipeline category
 */
export const getProductsByPipelineCategory = (category: string): GenieProduct[] => {
  return Object.values(GENIE_PRODUCTS)
    .filter(p => p.pipelineCategories.includes(category) || p.pipelineCategories.includes('all-categories'))
    .map(p => p.id);
};

/**
 * All product keys (including Cast)
 */
export const PRODUCT_KEYS: GenieProduct[] = ['spark', 'mind', 'vibe', 'deck', 'arc', 'cast', 'studio'];

/**
 * Display order for UI: Spark → Mind → Vibe → Deck → Arc → Cast → Studio (center)
 */
export const PRODUCT_DISPLAY_ORDER: GenieProduct[] = ['spark', 'mind', 'vibe', 'deck', 'arc', 'cast', 'studio'];

/**
 * Production flow order (typical user journey)
 */
export const PRODUCT_FLOW_ORDER: GenieProduct[] = ['spark', 'mind', 'vibe', 'deck', 'arc', 'cast'];

/**
 * Supported Languages for Voice/TTS Features
 */
export const SUPPORTED_LANGUAGES = {
  tts: {
    primary: ['English (US)', 'English (UK)', 'English (AU)'],
    providers: {
      openai: ['English'],
      elevenlabs: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Polish', 'Hindi', 'Arabic', 'Japanese', 'Korean', 'Chinese'],
      google: ['English (US)', 'English (UK)', 'English (AU)', 'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Portuguese'],
      amazon: ['English (US)', 'English (UK)', 'English (AU)', 'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Portuguese', 'Hindi', 'Arabic'],
      azure: ['English (US)', 'English (UK)', 'English (AU)', 'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Portuguese', 'Hindi', 'Arabic', 'Chinese'],
      alibaba: ['Chinese', 'Japanese', 'Korean', 'Vietnamese', 'Thai']
    }
  },
  voiceRecording: ['Any language (user-recorded)'],
  scriptGeneration: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Hindi', 'Japanese', 'Korean', 'Chinese', 'Arabic'],
  conversations: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese']
} as const;

/**
 * Subscription tier feature availability
 */
export const SUBSCRIPTION_FEATURE_ACCESS = {
  free: {
    products: ['studio', 'spark'],
    limitations: {
      spark: '5 scripts/month',
      studio: 'Watermarked exports',
      vibe: 'Not available',
      arc: 'Not available',
      cast: 'Not available',
      mind: 'Basic only'
    }
  },
  starter: {
    products: ['studio', 'spark', 'mind'],
    limitations: {
      spark: '25 scripts/month',
      vibe: '5 hours recording/month',
      arc: 'Not available',
      cast: 'Not available',
      mind: '1K documents'
    }
  },
  business: {
    products: ['studio', 'spark', 'vibe', 'mind', 'deck'],
    limitations: {
      spark: '150 scripts/month',
      vibe: '25 hours recording/month',
      arc: '5 shows',
      cast: '3 platforms',
      mind: '10K documents'
    }
  },
  pro: {
    products: ['studio', 'spark', 'vibe', 'mind', 'deck', 'arc', 'cast'],
    limitations: {}
  }
} as const;
