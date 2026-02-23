/**
 * Dashboard Thumbnail Service — AI-powered + instant-fallback region-aware thumbnails
 *
 * Integrated with the LOCKED routing infrastructure:
 *   1. Routing Enforcement Gateway → routeAIRequest() for all AI calls
 *   2. Master Provider Registry → 4-Zone, 5-tier fallback chain
 *   3. Enrichment Bridge → Brand + regional cultural context
 *   4. Instant CSS gradient fallbacks → Always shows something visually rich
 *
 * When AI generation is unavailable (edge function cold start, no API key, etc.),
 * the service provides beautiful gradient + SVG pattern thumbnails that are
 * region-specific and match each product's color scheme.
 */

import { routeAIRequest, resolveZone } from '@/services/ai-hub/routingEnforcementGateway';
import type { RegionalZone } from '@/config/master-provider-routing-registry';

// ── Types ────────────────────────────────────────────────────────────────────

export type DashboardSection =
  | 'hero' | 'workflow-create' | 'workflow-produce' | 'workflow-publish'
  | 'projects' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings'
  | 'video-thumb';

export type GenieProduct = 'spark' | 'mind' | 'vibe' | 'deck' | 'hub' | 'cast' | 'ask' | 'suite';

export interface ThumbnailResult {
  imageUrl: string;
  gradient: string;
  svgPattern: string;
  provider: string;
  zone: RegionalZone;
  isAIGenerated: boolean;
  error?: string;
}

// ── Region Visual Styles ─────────────────────────────────────────────────────

const REGION_VISUAL_STYLES: Record<string, { palette: string; motif: string; aesthetic: string; cssGradient: string }> = {
  NAM_US: { palette: 'bold blues, tech whites', motif: 'innovation, skyline', aesthetic: 'Silicon Valley modern', cssGradient: 'from-blue-600/30 via-indigo-500/20 to-purple-600/30' },
  NAM_CA: { palette: 'maple reds, lake blues', motif: 'nature meets tech', aesthetic: 'warm professional', cssGradient: 'from-red-500/25 via-blue-500/20 to-green-500/25' },
  EU_DACH: { palette: 'precise grays, engineering blues', motif: 'Bauhaus precision', aesthetic: 'German minimalism', cssGradient: 'from-slate-600/30 via-blue-500/20 to-gray-500/30' },
  EU_FRANCE: { palette: 'elegant navy, champagne gold', motif: 'haute couture', aesthetic: 'Parisian elegance', cssGradient: 'from-blue-900/30 via-amber-300/15 to-rose-400/20' },
  EU_NORDIC: { palette: 'ice blues, forest greens', motif: 'Scandinavian nature', aesthetic: 'Nordic minimal', cssGradient: 'from-cyan-400/25 via-emerald-500/15 to-blue-300/25' },
  EU_IBERIA: { palette: 'terracotta, sun gold', motif: 'Mediterranean warmth', aesthetic: 'Iberian passion', cssGradient: 'from-orange-500/25 via-amber-400/20 to-red-500/25' },
  EU_ITALY: { palette: 'Renaissance gold, olive', motif: 'artisan craft', aesthetic: 'Italian elegance', cssGradient: 'from-amber-600/25 via-emerald-700/15 to-amber-400/25' },
  MENA_GULF: { palette: 'gold, deep teal, luxury purple', motif: 'futuristic luxury', aesthetic: 'Gulf futurism', cssGradient: 'from-amber-500/30 via-teal-600/20 to-purple-600/25' },
  MENA_EGYPT: { palette: 'pharaonic gold, Nile blue', motif: 'ancient modern', aesthetic: 'Egyptian heritage', cssGradient: 'from-amber-600/30 via-blue-600/20 to-amber-500/25' },
  MENA_LEVANT: { palette: 'olive green, Mediterranean blue', motif: 'cosmopolitan art', aesthetic: 'Levantine', cssGradient: 'from-emerald-600/25 via-blue-500/20 to-stone-500/25' },
  INDIA_NORTH: { palette: 'saffron, deep green, gold', motif: 'Bollywood vibrancy', aesthetic: 'North Indian', cssGradient: 'from-orange-500/30 via-green-600/20 to-amber-400/25' },
  INDIA_SOUTH: { palette: 'silk purple, temple gold', motif: 'temple architecture', aesthetic: 'South Indian heritage', cssGradient: 'from-purple-600/25 via-amber-500/20 to-blue-500/25' },
  INDIA_PAN: { palette: 'saffron-white-green', motif: 'unity in diversity', aesthetic: 'Pan-India modern', cssGradient: 'from-orange-400/25 via-white/10 to-green-500/25' },
  CJK_CN: { palette: 'imperial red, gold, tech blue', motif: 'guochao modern', aesthetic: 'Chinese national pride', cssGradient: 'from-red-600/30 via-amber-500/20 to-blue-500/25' },
  CJK_JP: { palette: 'sakura pink, zen gray', motif: 'zen precision', aesthetic: 'Japanese omotenashi', cssGradient: 'from-pink-400/25 via-gray-400/15 to-red-500/20' },
  CJK_KR: { palette: 'K-pop neon, tech blue', motif: 'hallyu wave', aesthetic: 'Korean cool', cssGradient: 'from-blue-500/25 via-pink-400/20 to-violet-500/25' },
  SEA_MALAY: { palette: 'halal green, batik gold', motif: 'batik patterns', aesthetic: 'SEA halal modern', cssGradient: 'from-emerald-500/25 via-teal-400/20 to-amber-500/25' },
  SEA_THAI: { palette: 'temple gold, lotus pink', motif: 'temple spires', aesthetic: 'Thai elegance', cssGradient: 'from-amber-500/25 via-pink-400/20 to-emerald-400/25' },
  AFRICA_EAST: { palette: 'savanna gold, M-Pesa green', motif: 'mobile innovation', aesthetic: 'East African', cssGradient: 'from-amber-500/25 via-green-500/20 to-orange-400/25' },
  AFRICA_WEST: { palette: 'Nollywood purple, ankara', motif: 'Nollywood vibrant', aesthetic: 'West African', cssGradient: 'from-purple-500/25 via-amber-400/20 to-green-500/25' },
  LATAM_BR: { palette: 'carnival green-yellow', motif: 'carnival, samba', aesthetic: 'Brazilian joy', cssGradient: 'from-green-500/25 via-yellow-400/20 to-blue-500/25' },
  LATAM_MX: { palette: 'Mexican pink, cactus green', motif: 'murals, tradition', aesthetic: 'Mexican creative', cssGradient: 'from-pink-500/25 via-green-500/20 to-amber-400/25' },
  OCEANIA_AU: { palette: 'outback ochre, reef blue', motif: 'reef, outback', aesthetic: 'Australian modern', cssGradient: 'from-amber-600/25 via-cyan-500/20 to-green-500/25' },
  DEFAULT: { palette: 'purple gradients, electric blue', motif: 'AI, global connectivity', aesthetic: 'premium glassmorphic', cssGradient: 'from-primary/30 via-purple-600/20 to-pink-500/25' },
};

// RTL region codes
const RTL_REGION_CODES = new Set([
  'MENA_GULF', 'MENA_EGYPT', 'MENA_LEVANT', 'MENA_MAGHREB', 'MENA_IRAQ', 'MENA_YEMEN', 'MENA_ISRAEL',
  'PK_PUNJAB', 'PK_SINDH', 'PK_KPK', 'PK_URDU',
]);

// ── Product Hero Config ──────────────────────────────────────────────────────

export interface ProductHeroConfig {
  id: GenieProduct;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  accentColor: string;
  iconBg: string;
  features: string[];
}

export const PRODUCT_HEROES: Record<GenieProduct, ProductHeroConfig> = {
  spark: {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite Your Ideas',
    description: 'Generate scripts from any input — Documents, PPT, Video, Audio, URL, Image. Transform raw ideas into structured scripts.',
    emoji: '✨',
    gradientFrom: 'from-amber-500/30',
    gradientVia: 'via-orange-500/20',
    gradientTo: 'to-yellow-500/10',
    accentColor: 'bg-amber-500',
    iconBg: 'bg-amber-500/15 border-amber-500/25',
    features: ['Document to Script', 'PPT to Script', 'Video to Script', 'AI Image Generation', 'Multi-format Input', 'Auto-structure'],
  },
  mind: {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'AI That Understands',
    description: 'Edit and enhance scripts with AI. Add TTS voiceovers, voice cloning, and background music. The intelligent enhancement layer.',
    emoji: '🧠',
    gradientFrom: 'from-blue-500/30',
    gradientVia: 'via-cyan-500/20',
    gradientTo: 'to-sky-500/10',
    accentColor: 'bg-blue-500',
    iconBg: 'bg-blue-500/15 border-blue-500/25',
    features: ['AI Script Editing', 'Text-to-Speech', 'Voice Cloning', 'AI Music', 'Translation', 'Smart Suggestions'],
  },
  vibe: {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    description: 'Full audio and video production hub. Podcast, video capture, trim, stitch, dubbing, lip-sync, and avatar video.',
    emoji: '🎬',
    gradientFrom: 'from-purple-500/30',
    gradientVia: 'via-pink-500/20',
    gradientTo: 'to-fuchsia-500/10',
    accentColor: 'bg-purple-500',
    iconBg: 'bg-purple-500/15 border-purple-500/25',
    features: ['Video Generation', 'Podcast Recording', 'Dubbing', 'Lip-Sync', 'Avatar Video', 'Multi-track Editing'],
  },
  deck: {
    id: 'deck',
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    description: 'AI-powered presentation generation. Stunning slides with smart layouts, branding, and multi-language export.',
    emoji: '📊',
    gradientFrom: 'from-violet-500/30',
    gradientVia: 'via-purple-500/20',
    gradientTo: 'to-indigo-500/10',
    accentColor: 'bg-violet-500',
    iconBg: 'bg-violet-500/15 border-violet-500/25',
    features: ['AI Slide Generation', 'Smart Layouts', 'Brand Customization', 'Multi-language Export', 'Infographics', '3D Presentations'],
  },
  hub: {
    id: 'hub',
    name: 'Genie Hub',
    tagline: 'Your Creative Command Center',
    description: 'Enterprise production hub for project scheduling, Kanban workflows, team collaboration, and asset management.',
    emoji: '🎯',
    gradientFrom: 'from-emerald-500/30',
    gradientVia: 'via-teal-500/20',
    gradientTo: 'to-green-500/10',
    accentColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    features: ['Project Scheduling', 'Kanban Boards', 'Team Collaboration', 'Asset Library', 'Review Workflows', 'Approval Chains'],
  },
  cast: {
    id: 'cast',
    name: 'Genie Cast',
    tagline: 'Make It. Show It. Scale It.',
    description: 'Global distribution and marketing engine. Multi-platform publishing, 14-region localization, and analytics.',
    emoji: '📡',
    gradientFrom: 'from-pink-500/30',
    gradientVia: 'via-rose-500/20',
    gradientTo: 'to-red-500/10',
    accentColor: 'bg-pink-500',
    iconBg: 'bg-pink-500/15 border-pink-500/25',
    features: ['Multi-platform Publishing', '14-Region Localization', 'Analytics Dashboard', 'Content Scheduling', 'Regional Avatars', 'A/B Testing'],
  },
  ask: {
    id: 'ask',
    name: 'Ask Genie',
    tagline: 'Your Wish Is My Command',
    description: 'Your intelligent AI companion that guides you through the entire Genie Suite with empathy, creativity, and magic.',
    emoji: '🧞',
    gradientFrom: 'from-violet-500/30',
    gradientVia: 'via-fuchsia-500/20',
    gradientTo: 'to-purple-500/10',
    accentColor: 'bg-violet-500',
    iconBg: 'bg-violet-500/15 border-violet-500/25',
    features: ['Natural Language Interface', 'Cross-product Guidance', 'Smart Suggestions', 'Workflow Automation', 'Creative Assistant', 'Multi-language'],
  },
  suite: {
    id: 'suite',
    name: 'Genie Suite',
    tagline: 'Mind to Media',
    description: 'The complete AI creative suite. 7 products, 206 pipelines, 50+ languages, 16 regions. From idea to global distribution.',
    emoji: '🎨',
    gradientFrom: 'from-indigo-500/30',
    gradientVia: 'via-violet-500/20',
    gradientTo: 'to-purple-500/10',
    accentColor: 'bg-indigo-500',
    iconBg: 'bg-indigo-500/15 border-indigo-500/25',
    features: ['7 Integrated Products', '206 AI Pipelines', '50+ Languages', '16 Global Regions', '19 AI Providers', '4-Zone Routing'],
  },
};

// ── Section prompts for AI generation ────────────────────────────────────────

const SECTION_PROMPTS: Record<DashboardSection, string> = {
  'hero': 'A stunning widescreen hero banner for an AI video production studio. Cinematic production control room with holographic displays, AI neural networks as flowing light streams, multi-language text floating. Ultra-modern premium.',
  'workflow-create': 'Creative writing workspace with AI. Floating holographic script text, character avatars, style palettes materializing. Glassmorphic frosted panels, soft purple glow.',
  'workflow-produce': 'AI video production engine in action. Neural networks processing video frames, multi-language audio waveforms, regional content. Blue holographic energy.',
  'workflow-publish': 'Global distribution dashboard. World map with glowing connection lines, platform icons, analytics charts. Green energy theme, glassmorphic.',
  'projects': 'Project management view with video thumbnails, folders, timeline. Clean professional, soft blue glassmorphic cards.',
  'templates': 'Template gallery with different video styles. Grid of frosted glass cards with previews. Purple accent.',
  'assets': 'Digital asset library with images, videos, audio, 3D models in holographic grid. Green accent glassmorphic.',
  'brand-kit': 'Brand identity workspace with color palettes, typography, logos. Warm amber accent, elegant glassmorphic.',
  'analytics': 'Analytics dashboard with glowing charts, engagement metrics, regional heatmaps. Indigo accent glassmorphic.',
  'settings': 'Settings panel with integrations, API connections, preferences. Clean minimal, slate accent glassmorphic.',
  'video-thumb': 'Professional video thumbnail. Cinematic widescreen, high production value, clear subject with text overlay space.',
};

const PRODUCT_PROMPTS: Record<GenieProduct, string> = {
  spark: 'AI idea generation studio with floating documents, presentations, and videos transforming into structured scripts. Sparkling amber energy, creative workspace with holographic input panels.',
  mind: 'AI brain visualization with neural networks, audio waveforms for TTS, voice cloning controls, and music equalizer. Blue cerebral energy, intelligence flowing through glass panels.',
  vibe: 'Cinematic video production studio with camera rigs, audio mixing boards, timeline editors, and avatar screens. Purple creative energy, multi-track editing glassmorphic UI.',
  deck: 'Presentation design studio with floating slides, smart layouts materializing, branding templates, and 3D elements. Violet creative energy, slide grids in glass panels.',
  hub: 'Command center with Kanban boards, project timelines, team avatars, and asset thumbnails. Emerald energy, enterprise dashboard with glassmorphic task cards.',
  cast: 'Global distribution control room with world map, platform icons (YouTube, TikTok, LinkedIn), regional flags, analytics. Pink energy, publishing pipelines in glass panels.',
  ask: 'Magical AI companion interface with conversation bubbles, suggestion sparkles, cross-product navigation, and creative guidance. Violet magical energy, genie lamp glassmorphic UI.',
  suite: 'The complete AI creative ecosystem showing all 7 products connected by flowing data streams. Each product as a glowing node in a constellation. Indigo-purple cosmic energy.',
};

// ── Thumbnail Generation ─────────────────────────────────────────────────────

/**
 * Generate an AI thumbnail for a dashboard section via the routing gateway.
 * Falls back to gradient + SVG pattern if AI generation fails.
 */
export async function generateDashboardThumbnail(
  section: DashboardSection,
  regionCode: string = 'NAM_US',
  size: { width: number; height: number } = { width: 512, height: 288 },
): Promise<ThumbnailResult> {
  const zone = resolveZone({ regionCode });
  const style = REGION_VISUAL_STYLES[regionCode] || REGION_VISUAL_STYLES.DEFAULT;
  const isRTL = RTL_REGION_CODES.has(regionCode);

  const basePrompt = SECTION_PROMPTS[section];
  const regionPrompt = `${basePrompt} Color palette: ${style.palette}. Visual motif: ${style.motif}. Aesthetic: ${style.aesthetic}. Style: glassmorphic SaaS with frosted glass, backdrop blur, glow effects.${isRTL ? ' Layout: right-to-left (RTL).' : ''}`;

  try {
    const result = await routeAIRequest({
      action: 'image_generation',
      prompt: regionPrompt,
      regionCode,
      enrich: true,
      product: 'cast',
      params: { width: size.width, height: size.height },
    });

    if (result.data && !result.error) {
      return {
        imageUrl: (result.data as any)?.imageUrl || (result.data as any)?.url || '',
        gradient: style.cssGradient,
        svgPattern: getSVGPattern(section, regionCode),
        provider: result.provider,
        zone: result.zone,
        isAIGenerated: true,
      };
    }
  } catch {
    // Fall through to gradient fallback
  }

  // Gradient + SVG fallback (always works, no API needed)
  return {
    imageUrl: '',
    gradient: style.cssGradient,
    svgPattern: getSVGPattern(section, regionCode),
    provider: 'gradient-fallback',
    zone,
    isAIGenerated: false,
  };
}

/**
 * Generate a product hero thumbnail via the routing gateway.
 */
export async function generateProductHeroThumbnail(
  product: GenieProduct,
  regionCode: string = 'NAM_US',
): Promise<ThumbnailResult> {
  const zone = resolveZone({ regionCode });
  const style = REGION_VISUAL_STYLES[regionCode] || REGION_VISUAL_STYLES.DEFAULT;
  const hero = PRODUCT_HEROES[product];
  const isRTL = RTL_REGION_CODES.has(regionCode);

  const prompt = `${PRODUCT_PROMPTS[product]} Color palette: ${style.palette}. Motif: ${style.motif}. ${style.aesthetic}. Glassmorphic SaaS with frosted panels and glow.${isRTL ? ' RTL layout.' : ''}`;

  try {
    const result = await routeAIRequest({
      action: 'image_generation',
      prompt,
      regionCode,
      enrich: true,
      product: product === 'suite' ? 'cast' : product,
      params: { width: 800, height: 400 },
    });

    if (result.data && !result.error) {
      return {
        imageUrl: (result.data as any)?.imageUrl || (result.data as any)?.url || '',
        gradient: style.cssGradient,
        svgPattern: getSVGPattern('hero', regionCode),
        provider: result.provider,
        zone: result.zone,
        isAIGenerated: true,
      };
    }
  } catch {
    // Fall through
  }

  return {
    imageUrl: '',
    gradient: style.cssGradient,
    svgPattern: getSVGPattern('hero', regionCode),
    provider: 'gradient-fallback',
    zone,
    isAIGenerated: false,
  };
}

// ── SVG Pattern Fallbacks (always render, no API needed) ─────────────────────

function getSVGPattern(section: DashboardSection | 'hero', _regionCode: string): string {
  // Encode an inline SVG pattern as a data URI for use as background-image
  const patterns: Record<string, string> = {
    hero: `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><circle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.07)'/><circle cx='10' cy='10' r='1' fill='rgba(255,255,255,0.04)'/></svg>`,
    'workflow-create': `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M0 20h40M20 0v40' stroke='rgba(168,85,247,0.06)' stroke-width='0.5'/></svg>`,
    'workflow-produce': `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M0 20h40M20 0v40' stroke='rgba(59,130,246,0.06)' stroke-width='0.5'/></svg>`,
    'workflow-publish': `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M0 20h40M20 0v40' stroke='rgba(16,185,129,0.06)' stroke-width='0.5'/></svg>`,
    projects: `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><rect x='5' y='5' width='20' height='20' rx='3' fill='none' stroke='rgba(59,130,246,0.05)' stroke-width='0.5'/></svg>`,
    templates: `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><rect x='5' y='5' width='20' height='20' rx='3' fill='none' stroke='rgba(168,85,247,0.05)' stroke-width='0.5'/></svg>`,
    assets: `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><circle cx='15' cy='15' r='8' fill='none' stroke='rgba(16,185,129,0.05)' stroke-width='0.5'/></svg>`,
    'brand-kit': `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><polygon points='15,5 25,25 5,25' fill='none' stroke='rgba(245,158,11,0.05)' stroke-width='0.5'/></svg>`,
    analytics: `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><polyline points='0,30 10,20 20,25 30,10 40,15' fill='none' stroke='rgba(99,102,241,0.06)' stroke-width='0.5'/></svg>`,
    settings: `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><circle cx='15' cy='15' r='6' fill='none' stroke='rgba(100,116,139,0.05)' stroke-width='0.5'/></svg>`,
    'video-thumb': `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><polygon points='15,10 30,20 15,30' fill='rgba(255,255,255,0.04)'/></svg>`,
  };
  const svg = patterns[section] || patterns.hero;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getRegionVisualStyle(regionCode: string) {
  return REGION_VISUAL_STYLES[regionCode] || REGION_VISUAL_STYLES.DEFAULT;
}

export function isRTLRegion(regionCode: string): boolean {
  return RTL_REGION_CODES.has(regionCode);
}

// ── Region Group Display ─────────────────────────────────────────────────────

export const REGION_GROUP_DISPLAY: Record<string, { label: string; icon: string; gradient: string }> = {
  nam: { label: 'North America', icon: '🇺🇸', gradient: 'from-blue-500 to-indigo-600' },
  europe: { label: 'Europe', icon: '🇪🇺', gradient: 'from-blue-400 to-purple-500' },
  mena: { label: 'MENA / RTL', icon: '🇦🇪', gradient: 'from-amber-500 to-orange-600' },
  india: { label: 'India', icon: '🇮🇳', gradient: 'from-orange-400 to-green-500' },
  cjk: { label: 'CJK', icon: '🌏', gradient: 'from-red-500 to-pink-500' },
  sea: { label: 'Southeast Asia', icon: '🌏', gradient: 'from-teal-400 to-emerald-500' },
  africa: { label: 'Africa', icon: '🌍', gradient: 'from-amber-400 to-green-600' },
  latam: { label: 'Latin America', icon: '🌎', gradient: 'from-green-400 to-yellow-500' },
  oceania: { label: 'Oceania', icon: '🇦🇺', gradient: 'from-cyan-400 to-blue-500' },
  turkey: { label: 'Turkey', icon: '🇹🇷', gradient: 'from-red-500 to-amber-500' },
  pakistan: { label: 'Pakistan', icon: '🇵🇰', gradient: 'from-green-500 to-emerald-600' },
  bangladesh: { label: 'Bangladesh', icon: '🇧🇩', gradient: 'from-green-600 to-red-500' },
  caribbean: { label: 'Caribbean', icon: '🏝️', gradient: 'from-cyan-400 to-yellow-400' },
  eastern_europe: { label: 'Eastern Europe', icon: '🇺🇦', gradient: 'from-blue-500 to-yellow-400' },
  south_asia: { label: 'South Asia', icon: '🌏', gradient: 'from-purple-400 to-pink-500' },
  central_asia: { label: 'Central Asia', icon: '🇰🇿', gradient: 'from-teal-500 to-blue-500' },
};
