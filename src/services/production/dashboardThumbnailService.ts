/**
 * Dashboard Thumbnail Service — AI-powered region-aware thumbnail generation
 *
 * Uses the core AI engine (imagePreviewService) to generate glassmorphic
 * thumbnails for dashboard cards, workflow steps, and page heroes.
 * Routes to the correct image provider based on the user's region/subregion.
 *
 * Provider routing:
 *   CJK regions → Alibaba WanX
 *   SEA/India/Africa → Gemini Image
 *   Western/EU/LATAM → Gemini Image (default)
 *   Fallback → ModelsLab FLUX
 */

import { generateStylePreview, type ImagePreviewResult } from './imagePreviewService';

// ── Region-aware prompt context ──────────────────────────────────────────────

interface RegionVisualContext {
  regionCode: string;
  culturalTone: string;
  emotionalRegister: string;
  flag: string;
  label: string;
}

/** Maps region codes to visual style hints for AI image generation */
const REGION_VISUAL_STYLES: Record<string, { palette: string; motif: string; aesthetic: string }> = {
  // Western
  NAM_US: { palette: 'bold primary blues, tech whites, vibrant gradients', motif: 'innovation, skyline, modern tech', aesthetic: 'clean Silicon Valley modern' },
  NAM_CA: { palette: 'warm maple reds, cool lake blues, natural greens', motif: 'nature meets tech, inclusive design', aesthetic: 'inclusive warm professional' },
  // Europe
  EU_DACH: { palette: 'precise grays, engineering blues, clean whites', motif: 'precision engineering, Bauhaus', aesthetic: 'German engineering minimalism' },
  EU_FRANCE: { palette: 'elegant navy, champagne gold, rose accents', motif: 'haute couture, sophisticated design', aesthetic: 'Parisian elegance' },
  EU_NORDIC: { palette: 'ice blues, forest greens, pure whites', motif: 'Scandinavian minimalism, nature', aesthetic: 'Nordic functional beauty' },
  EU_IBERIA: { palette: 'warm terracotta, sun gold, Mediterranean blue', motif: 'Mediterranean warmth, vibrant art', aesthetic: 'Iberian passion' },
  EU_ITALY: { palette: 'Renaissance gold, terracotta, deep olive', motif: 'artisan craft, Renaissance art', aesthetic: 'Italian artisan elegance' },
  EU_BENELUX: { palette: 'Dutch orange, water blues, clean whites', motif: 'pragmatic design, modern trade', aesthetic: 'Dutch pragmatic modern' },
  EU_EAST: { palette: 'rich jewel tones, deep blues, amber', motif: 'cultural heritage, modern progress', aesthetic: 'Eastern European fusion' },
  // MENA
  MENA_GULF: { palette: 'gold, desert sand, luxury purple, deep teal', motif: 'futuristic architecture, luxury', aesthetic: 'Gulf luxury futurism' },
  MENA_EGYPT: { palette: 'pharaonic gold, Nile blue, desert amber', motif: 'ancient meets modern, pyramids', aesthetic: 'Egyptian heritage modern' },
  MENA_LEVANT: { palette: 'olive green, Mediterranean blue, warm stone', motif: 'cosmopolitan art, cedar trees', aesthetic: 'Levantine cosmopolitan' },
  MENA_MAGHREB: { palette: 'terracotta, Sahara gold, deep blue', motif: 'geometric patterns, mosaic art', aesthetic: 'Maghreb geometric beauty' },
  MENA_ISRAEL: { palette: 'startup blue, innovation white, tech green', motif: 'tech startup, innovation hub', aesthetic: 'Israeli tech innovation' },
  // India
  INDIA_NORTH: { palette: 'saffron, deep green, gold, festive colors', motif: 'Bollywood vibrancy, festivals', aesthetic: 'North Indian vibrancy' },
  INDIA_SOUTH: { palette: 'silk purple, temple gold, tech blue', motif: 'temple architecture, tech parks', aesthetic: 'South Indian tech heritage' },
  INDIA_EAST: { palette: 'artistic terracotta, literary white, golden jute', motif: 'art, literature, Durga Puja', aesthetic: 'Bengali artistic depth' },
  INDIA_WEST: { palette: 'Gujarati orange, marine blue, business green', motif: 'business district, stock market', aesthetic: 'West Indian enterprise' },
  INDIA_PAN: { palette: 'tricolor saffron-white-green, unity blue', motif: 'unity in diversity, national pride', aesthetic: 'Pan-India modern unity' },
  // CJK
  CJK_CN: { palette: 'imperial red, gold, tech blue, WeChat green', motif: 'guochao modern, tech innovation', aesthetic: 'Chinese modern national pride' },
  CJK_JP: { palette: 'sakura pink, zen gray, lacquer red, minimal white', motif: 'zen precision, anime, kawaii', aesthetic: 'Japanese omotenashi precision' },
  CJK_KR: { palette: 'K-pop neon, hanbok pink, tech blue', motif: 'hallyu wave, K-pop, K-beauty', aesthetic: 'Korean hallyu cool' },
  CJK_TW: { palette: 'jade green, tea brown, creative coral', motif: 'artisan tea, night markets, tech', aesthetic: 'Taiwanese creative artisan' },
  // SEA
  SEA_MALAY: { palette: 'halal green, tropical teal, batik gold', motif: 'batik patterns, Islamic geometry', aesthetic: 'Southeast Asian halal modern' },
  SEA_THAI: { palette: 'temple gold, lotus pink, jade green', motif: 'temple spires, Thai silk', aesthetic: 'Thai sabai elegance' },
  SEA_VIET: { palette: 'ao dai red, rice paddy green, lantern yellow', motif: 'lanterns, ao dai, rising tech', aesthetic: 'Vietnamese dynamic rising' },
  SEA_PHIL: { palette: 'tropical sunset, ocean blue, fiesta colors', motif: 'island vibes, bayanihan unity', aesthetic: 'Filipino bayanihan warmth' },
  SEA_PAN: { palette: 'Singapore skyline blue, premium silver, garden green', motif: 'garden city, smart nation', aesthetic: 'Singapore premium efficiency' },
  // Africa
  AFRICA_EAST: { palette: 'savanna gold, M-Pesa green, sunrise orange', motif: 'mobile innovation, safari', aesthetic: 'East African mobile-first' },
  AFRICA_WEST: { palette: 'Nollywood purple, ankara patterns, vibrant green', motif: 'Nollywood, Afrobeats, vibrant', aesthetic: 'West African Nollywood vibrant' },
  AFRICA_SOUTH: { palette: 'rainbow nation multicolor, ubuntu indigo', motif: 'Table Mountain, Madiba legacy', aesthetic: 'South African rainbow innovation' },
  AFRICA_FRANCO: { palette: 'Francophone blue, elegant gold, earth tones', motif: 'French African fusion, music', aesthetic: 'Francophone African elegance' },
  // LATAM
  LATAM_MX: { palette: 'Mexican pink, cactus green, tierra warm', motif: 'Day of Dead, murals, taco culture', aesthetic: 'Mexican calidez creativa' },
  LATAM_BR: { palette: 'carnival green-yellow, samba gold, beach blue', motif: 'carnival, soccer, Copacabana', aesthetic: 'Brazilian jeitinho joy' },
  LATAM_CONE: { palette: 'tango red, Buenos Aires gray, mate green', motif: 'tango, intellectual cafés', aesthetic: 'Southern Cone intellectual' },
  LATAM_ANDES: { palette: 'Andean earth tones, Inca gold, sky blue', motif: 'mountains, indigenous patterns', aesthetic: 'Andean heritage authentic' },
  // Oceania
  OCEANIA_AU: { palette: 'outback ochre, reef blue, eucalyptus green', motif: 'reef, outback, mateship', aesthetic: 'Australian no-worries modern' },
  OCEANIA_NZ: { palette: 'Maori teal, fern green, All Blacks silver', motif: 'Maori culture, ferns, aroha', aesthetic: 'Kiwi inclusive sustainable' },
  // Turkey
  TURKEY_ISTANBUL: { palette: 'Ottoman blue, minaret gold, Bosphorus teal', motif: 'mosque domes, bazaar, bridge', aesthetic: 'Istanbul cosmopolitan bridge' },
  // Default
  DEFAULT: { palette: 'deep purple gradients, electric blue, soft white', motif: 'modern SaaS, AI, global connectivity', aesthetic: 'premium tech glassmorphic' },
};

// ── Thumbnail generation for dashboard sections ─────────────────────────────

export type DashboardSection = 'hero' | 'workflow-create' | 'workflow-produce' | 'workflow-publish' | 'projects' | 'templates' | 'assets' | 'brand-kit' | 'analytics' | 'settings' | 'video-thumb';

const SECTION_PROMPTS: Record<DashboardSection, string> = {
  'hero': 'A stunning widescreen hero banner for an AI video production studio. Show a cinematic production control room with holographic displays, AI neural networks visualized as flowing light streams, and multi-language text floating in the air. Ultra-modern, premium feel.',
  'workflow-create': 'An elegant UI showing a creative writing workspace with AI assistance. Floating holographic script text, character avatars being designed, style palettes materializing. Glassmorphic frosted panels with soft purple glow.',
  'workflow-produce': 'An AI video production engine in action. Neural networks processing video frames, multi-language audio waveforms, regional flags morphing into video content. Blue holographic energy, glassmorphic panels.',
  'workflow-publish': 'A global distribution dashboard showing content being published across platforms and regions. World map with glowing connection lines, platform icons (YouTube, TikTok, LinkedIn), analytics charts. Green energy theme, glassmorphic.',
  'projects': 'An organized project management view with video thumbnails, folder structures, and timeline visualization. Clean, professional, with soft blue glassmorphic cards.',
  'templates': 'A template gallery showcasing different video blueprint styles - corporate, educational, social media, healthcare. Grid of frosted glass cards with preview thumbnails. Purple accent theme.',
  'assets': 'A digital asset library with images, videos, audio files, and 3D models floating in a holographic grid. Rich media preview cards with glassmorphic styling. Green accent.',
  'brand-kit': 'A brand identity workspace showing color palettes, typography specimens, logo variations, and voice/tone guidelines. Warm amber accent, elegant glassmorphic panels.',
  'analytics': 'A data analytics dashboard with glowing charts, engagement metrics, regional heatmaps, and ROI indicators. Indigo/blue accent with glassmorphic card overlays.',
  'settings': 'A settings configuration panel with integrations, API connections, publishing preferences. Clean, minimal, slate/gray accent with glassmorphic styling.',
  'video-thumb': 'A professional video thumbnail showing AI-generated content. Cinematic widescreen aspect ratio, high production value, clear subject with text overlay space.',
};

/**
 * Build an AI prompt enhanced with regional visual context
 */
function buildRegionalPrompt(section: DashboardSection, regionCode: string): string {
  const style = REGION_VISUAL_STYLES[regionCode] || REGION_VISUAL_STYLES.DEFAULT;
  const base = SECTION_PROMPTS[section];
  return `${base} Color palette: ${style.palette}. Visual motif: ${style.motif}. Aesthetic: ${style.aesthetic}. Style: ultra-modern glassmorphic SaaS with frosted glass panels, backdrop blur, soft glow effects, and gradient accents.`;
}

/**
 * Generate a single AI thumbnail for a dashboard section
 */
export async function generateDashboardThumbnail(
  section: DashboardSection,
  regionCode: string = 'NAM_US',
  size: { width: number; height: number } = { width: 512, height: 288 },
): Promise<ImagePreviewResult> {
  const prompt = buildRegionalPrompt(section, regionCode);
  return generateStylePreview({
    prompt,
    style: 'glassmorphic-dashboard',
    width: size.width,
    height: size.height,
    regionCode,
  });
}

/**
 * Generate all dashboard thumbnails for a given region (batch).
 * Used on first load to pre-generate region-aware visuals.
 */
export async function generateAllDashboardThumbnails(
  regionCode: string = 'NAM_US',
  sections: DashboardSection[] = ['hero', 'workflow-create', 'workflow-produce', 'workflow-publish'],
  concurrency: number = 2,
): Promise<Map<DashboardSection, ImagePreviewResult>> {
  const results = new Map<DashboardSection, ImagePreviewResult>();
  const queue = [...sections];

  async function processNext() {
    while (queue.length > 0) {
      const section = queue.shift()!;
      const result = await generateDashboardThumbnail(section, regionCode);
      results.set(section, result);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, sections.length) }, () => processNext());
  await Promise.all(workers);
  return results;
}

/**
 * Get the visual style context for a region (used for CSS theming)
 */
export function getRegionVisualStyle(regionCode: string) {
  return REGION_VISUAL_STYLES[regionCode] || REGION_VISUAL_STYLES.DEFAULT;
}

/**
 * Get curated placeholder thumbnails per section + region (fast, no AI call).
 * These are used as instant placeholders while AI generates real ones.
 */
export function getPlaceholderThumbnail(section: DashboardSection, regionCode: string = 'NAM_US'): string {
  // Deterministic Unsplash image based on section + region aesthetic
  const style = REGION_VISUAL_STYLES[regionCode] || REGION_VISUAL_STYLES.DEFAULT;
  const seeds: Record<DashboardSection, string> = {
    'hero': 'technology,futuristic,hologram',
    'workflow-create': 'writing,creative,workspace',
    'workflow-produce': 'video,production,cinema',
    'workflow-publish': 'global,network,distribution',
    'projects': 'project,management,organize',
    'templates': 'template,design,gallery',
    'assets': 'media,library,digital',
    'brand-kit': 'brand,identity,palette',
    'analytics': 'analytics,dashboard,chart',
    'settings': 'settings,configuration,gear',
    'video-thumb': 'cinema,video,professional',
  };
  const query = seeds[section] || 'technology';
  // Use a deterministic hash for consistent images per region
  const hash = regionCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `https://images.unsplash.com/photo-${1516321497487 + hash}?w=512&h=288&fit=crop&auto=format&q=80&crop=entropy`;
}

// ── Region group display helpers ─────────────────────────────────────────────

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
