/**
 * Centralized Genie Product Definitions
 * 
 * IMPORTANT: These are the official taglines and should NOT be changed.
 * All components should import from this file to maintain consistency.
 * 
 * Last Updated: 2026-01-13
 */

// Import finalized logos
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieStudioBanner from '@/assets/logos/genie-studio-banner.png';
import genieStudioHorizontal from '@/assets/logos/genie-studio-horizontal.png';
import genieArcLogo from '@/assets/logos/genie-arc-combined.png';

export type GenieProduct = 'mind' | 'spark' | 'vibe' | 'studio' | 'arc';

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
  logos: {
    combined: string;      // Main logo with tagline
    horizontal?: string;   // Wide format for headers
    icon?: string;         // Small icon version
  };
}

/**
 * Official Genie Product Taglines - DO NOT MODIFY
 * 
 * - Genie Mind: "AI that understands"
 * - Genie Vibe: "Script to Screen"
 * - Genie Spark: "Ignite your Ideas"
 * - Genie Studio: "Mind to Media"
 * - Genie Arc: "Production hub for teams"
 */
export const GENIE_PRODUCTS: Record<GenieProduct, GenieProductInfo> = {
  mind: {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'AI that understands',
    description: 'Your intelligent AI companion that truly understands context, learns from interactions, and provides meaningful insights across your creative journey.',
    emoji: '🧠',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    features: [
      'Contextual AI understanding',
      'Multi-modal intelligence',
      'Personalized learning',
      'Cross-product memory',
      'Smart recommendations'
    ],
    logos: {
      combined: genieMindLogo
    }
  },
  spark: {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite your Ideas',
    description: 'Transform your creative sparks into brilliant content. Generate scripts, stories, and compelling narratives with AI-powered inspiration.',
    emoji: '✨',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    features: [
      'AI script generation',
      'Story development',
      'Content ideation',
      'Creative brainstorming',
      'Multi-format writing'
    ],
    logos: {
      combined: genieSparkLogo
    }
  },
  vibe: {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    description: 'Bring your scripts to life with seamless audio and video recording, editing, and production tools that capture the perfect vibe.',
    emoji: '🎬',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    features: [
      'Audio recording & editing',
      'Video capture & production',
      'Script-to-screen workflow',
      'Real-time effects',
      'Multi-track editing'
    ],
    logos: {
      combined: genieVibeLogo
    }
  },
  studio: {
    id: 'studio',
    name: 'Genie Studio',
    tagline: 'Mind to Media',
    description: 'The complete creative studio that transforms your ideas into polished media. From concept to completion, all in one place.',
    emoji: '🎨',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    features: [
      'Integrated creative suite',
      'Asset management',
      'Project organization',
      'Cross-product workflows',
      'Export & publishing'
    ],
    logos: {
      combined: genieStudioBanner,
      horizontal: genieStudioHorizontal
    }
  },
  arc: {
    id: 'arc',
    name: 'Genie Arc',
    tagline: 'Production hub for teams',
    description: 'Orchestrate your production workflow with powerful scheduling, team collaboration, and show management tools built for creative teams.',
    emoji: '🎯',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    features: [
      'Show scheduling',
      'Team collaboration',
      'Production pipeline',
      'Resource management',
      'Live coordination'
    ],
    logos: {
      combined: genieArcLogo
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
 * All product keys
 */
export const PRODUCT_KEYS: GenieProduct[] = ['mind', 'spark', 'vibe', 'studio', 'arc'];

/**
 * Display order for UI: Mind → Spark → Studio (center) → Vibe → Arc
 */
export const PRODUCT_DISPLAY_ORDER: GenieProduct[] = ['mind', 'spark', 'studio', 'vibe', 'arc'];
