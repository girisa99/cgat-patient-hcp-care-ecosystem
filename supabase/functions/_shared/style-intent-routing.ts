/**
 * STYLE-INTENT → PROVIDER ROUTING
 * 
 * Single source of truth for mapping style intents to provider chains.
 * Shared by: ai-image-generator, ai-universal-processor, and any future
 * edge functions that need image/video/avatar routing.
 * 
 * NOTE: This file provides FALLBACK routing when the database-driven
 * video_style_registry table has no matching row. DB styles take priority.
 * 
 * @see src/services/styleIntentResolver.ts for frontend equivalent
 * @see src/config/regional-routing-registry.ts for regional zone mapping
 */

// ============================================================================
// TYPES
// ============================================================================

export type StyleIntent = 
  // Core Production
  | 'photorealistic' | 'cinematic' | 'anime' | 'pixar-3d'
  | 'watercolor' | 'minimalist' | 'corporate' | 'editorial'
  | 'product-hero' | 'lifestyle' | 'documentary' | 'explainer'
  | 'ugc-authentic' | 'luxury-fashion' | 'tech-startup'
  | 'crayon' | 'motion' | 'avatar' | 'lipsync' | '3d-object'
  | 'diffusion' | 'technical-diagram'
  // Cultural Heritage
  | 'islamic-geometric' | 'hindu-mandala' | 'celtic-knotwork'
  | 'african-tribal' | 'japanese-ukiyo-e' | 'chinese-ink-wash'
  | 'persian-miniature' | 'aboriginal-dot-art' | 'mayan-aztec'
  | 'nordic-viking' | 'ottoman-calligraphy' | 'thai-temple'
  | 'korean-celadon' | 'moroccan-zellige' | 'byzantine-mosaic'
  // Nature & Environment
  | 'tropical-paradise' | 'arctic-aurora' | 'desert-dunes'
  | 'rainforest' | 'underwater-ocean' | 'volcanic'
  | 'savanna-wildlife' | 'himalayan' | 'mediterranean'
  | 'cherry-blossom' | 'monsoon' | 'saharan-golden'
  // Religious & Spiritual
  | 'zen-meditation' | 'sufi-mystical' | 'cathedral-gothic'
  | 'temple-sacred' | 'mosque-arabesque' | 'buddhist-serene'
  | 'spiritual-cosmic' | 'synagogue-traditional'
  // Regional Modern
  | 'bollywood-vibrant' | 'k-pop-neon' | 'latin-fiesta'
  | 'afrobeats-urban' | 'dubai-futuristic' | 'tokyo-cyberpunk'
  | 'scandinavian-hygge' | 'mediterranean-rustic'
  | 'brazilian-carnival' | 'nigerian-nollywood';

export type ImageProvider = 
  | 'gemini' | 'vertex-imagen' | 'openai' | 'alibaba'
  | 'modelslab' | 'huggingface' | 'replicate' | 'deepseek';

export type VideoProvider = 
  | 'alibaba-wan' | 'vertex-veo' | 'replicate' | 'modelslab-animate'
  | 'sora-2';

export type AvatarProvider = 
  | 'alibaba-wan-s2v' | 'azure-neural' | 'modelslab';

export type ThreeDProvider = 
  | 'meshy' | 'replicate' | 'alibaba';

export interface ProviderChain<T extends string = string> {
  primary: T;
  secondary: T;
  tertiary: T;
  fallback: T;
}

// ============================================================================
// IMAGE STYLE → PROVIDER ROUTING
// ============================================================================

export const STYLE_TO_IMAGE_PROVIDER: Record<string, ProviderChain<ImageProvider>> = {
  // === Core Production ===
  'photorealistic': { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'cinematic':      { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'corporate':      { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'editorial':      { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'product-hero':   { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'luxury-fashion': { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'documentary':    { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'lifestyle':      { primary: 'modelslab', secondary: 'gemini', tertiary: 'replicate', fallback: 'openai' },
  'anime':          { primary: 'modelslab', secondary: 'alibaba', tertiary: 'replicate', fallback: 'huggingface' },
  'pixar-3d':       { primary: 'alibaba', secondary: 'modelslab', tertiary: 'gemini', fallback: 'openai' },
  'watercolor':     { primary: 'modelslab', secondary: 'gemini', tertiary: 'alibaba', fallback: 'openai' },
  'crayon':         { primary: 'modelslab', secondary: 'alibaba', tertiary: 'gemini', fallback: 'huggingface' },
  'diffusion':      { primary: 'modelslab', secondary: 'replicate', tertiary: 'huggingface', fallback: 'gemini' },
  'minimalist':     { primary: 'gemini', secondary: 'modelslab', tertiary: 'huggingface', fallback: 'openai' },
  'explainer':      { primary: 'gemini', secondary: 'modelslab', tertiary: 'huggingface', fallback: 'openai' },
  'ugc-authentic':  { primary: 'modelslab', secondary: 'gemini', tertiary: 'alibaba', fallback: 'openai' },
  'tech-startup':   { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },
  'technical-diagram': { primary: 'deepseek', secondary: 'gemini', tertiary: 'openai', fallback: 'modelslab' },

  // === Cultural Heritage ===
  'islamic-geometric':   { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'hindu-mandala':       { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'celtic-knotwork':     { primary: 'modelslab', secondary: 'gemini', tertiary: 'replicate', fallback: 'openai' },
  'african-tribal':      { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },
  'japanese-ukiyo-e':    { primary: 'alibaba', secondary: 'modelslab', tertiary: 'replicate', fallback: 'huggingface' },
  'chinese-ink-wash':    { primary: 'alibaba', secondary: 'modelslab', tertiary: 'gemini', fallback: 'huggingface' },
  'persian-miniature':   { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'aboriginal-dot-art':  { primary: 'modelslab', secondary: 'gemini', tertiary: 'replicate', fallback: 'huggingface' },
  'mayan-aztec':         { primary: 'modelslab', secondary: 'gemini', tertiary: 'alibaba', fallback: 'openai' },
  'nordic-viking':       { primary: 'modelslab', secondary: 'gemini', tertiary: 'replicate', fallback: 'openai' },
  'ottoman-calligraphy': { primary: 'alibaba', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'thai-temple':         { primary: 'gemini', secondary: 'alibaba', tertiary: 'modelslab', fallback: 'openai' },
  'korean-celadon':      { primary: 'alibaba', secondary: 'modelslab', tertiary: 'gemini', fallback: 'huggingface' },
  'moroccan-zellige':    { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'byzantine-mosaic':    { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },

  // === Nature & Environment ===
  'tropical-paradise':  { primary: 'gemini', secondary: 'modelslab', tertiary: 'vertex-imagen', fallback: 'openai' },
  'arctic-aurora':      { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'desert-dunes':       { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'rainforest':         { primary: 'gemini', secondary: 'modelslab', tertiary: 'vertex-imagen', fallback: 'openai' },
  'underwater-ocean':   { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'volcanic':           { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },
  'savanna-wildlife':   { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'himalayan':          { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'mediterranean':      { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'cherry-blossom':     { primary: 'alibaba', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'monsoon':            { primary: 'gemini', secondary: 'alibaba', tertiary: 'modelslab', fallback: 'openai' },
  'saharan-golden':     { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },

  // === Religious & Spiritual ===
  'zen-meditation':         { primary: 'alibaba', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'sufi-mystical':          { primary: 'gemini', secondary: 'alibaba', tertiary: 'modelslab', fallback: 'openai' },
  'cathedral-gothic':       { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'temple-sacred':          { primary: 'gemini', secondary: 'alibaba', tertiary: 'modelslab', fallback: 'openai' },
  'mosque-arabesque':       { primary: 'gemini', secondary: 'alibaba', tertiary: 'modelslab', fallback: 'openai' },
  'buddhist-serene':        { primary: 'alibaba', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'spiritual-cosmic':       { primary: 'modelslab', secondary: 'gemini', tertiary: 'replicate', fallback: 'openai' },
  'synagogue-traditional':  { primary: 'gemini', secondary: 'modelslab', tertiary: 'vertex-imagen', fallback: 'openai' },

  // === Regional Modern ===
  'bollywood-vibrant':     { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'k-pop-neon':            { primary: 'alibaba', secondary: 'modelslab', tertiary: 'gemini', fallback: 'openai' },
  'latin-fiesta':          { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },
  'afrobeats-urban':       { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },
  'dubai-futuristic':      { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'tokyo-cyberpunk':       { primary: 'alibaba', secondary: 'modelslab', tertiary: 'gemini', fallback: 'openai' },
  'scandinavian-hygge':    { primary: 'gemini', secondary: 'modelslab', tertiary: 'vertex-imagen', fallback: 'openai' },
  'mediterranean-rustic':  { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'brazilian-carnival':    { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },
  'nigerian-nollywood':    { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },
};

// ============================================================================
// VIDEO STYLE → PROVIDER ROUTING (includes Sora 2)
// ============================================================================

export const STYLE_TO_VIDEO_PROVIDER: Record<string, ProviderChain<VideoProvider>> = {
  // === Core Production ===
  'cinematic':      { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'photorealistic': { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'anime':          { primary: 'alibaba-wan', secondary: 'modelslab-animate', tertiary: 'replicate', fallback: 'sora-2' },
  'pixar-3d':       { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'motion':         { primary: 'modelslab-animate', secondary: 'alibaba-wan', tertiary: 'sora-2', fallback: 'replicate' },
  'explainer':      { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'documentary':    { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'ugc-authentic':  { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'corporate':      { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'editorial':      { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'product-hero':   { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'luxury-fashion': { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'lifestyle':      { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'tech-startup':   { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'minimalist':     { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'watercolor':     { primary: 'modelslab-animate', secondary: 'alibaba-wan', tertiary: 'sora-2', fallback: 'replicate' },
  'crayon':         { primary: 'modelslab-animate', secondary: 'alibaba-wan', tertiary: 'sora-2', fallback: 'replicate' },
  'diffusion':      { primary: 'modelslab-animate', secondary: 'alibaba-wan', tertiary: 'replicate', fallback: 'sora-2' },

  // === Cultural Heritage ===
  'islamic-geometric':   { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'vertex-veo', fallback: 'modelslab-animate' },
  'hindu-mandala':       { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'vertex-veo', fallback: 'modelslab-animate' },
  'celtic-knotwork':     { primary: 'sora-2', secondary: 'modelslab-animate', tertiary: 'alibaba-wan', fallback: 'replicate' },
  'african-tribal':      { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'japanese-ukiyo-e':    { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'chinese-ink-wash':    { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'persian-miniature':   { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'aboriginal-dot-art':  { primary: 'sora-2', secondary: 'modelslab-animate', tertiary: 'alibaba-wan', fallback: 'replicate' },
  'mayan-aztec':         { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'nordic-viking':       { primary: 'sora-2', secondary: 'modelslab-animate', tertiary: 'alibaba-wan', fallback: 'replicate' },
  'ottoman-calligraphy': { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'thai-temple':         { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'korean-celadon':      { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'moroccan-zellige':    { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'byzantine-mosaic':    { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },

  // === Nature & Environment ===
  'tropical-paradise':  { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'arctic-aurora':      { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'desert-dunes':       { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'vertex-veo', fallback: 'modelslab-animate' },
  'rainforest':         { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'underwater-ocean':   { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'volcanic':           { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'savanna-wildlife':   { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'himalayan':          { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'vertex-veo', fallback: 'modelslab-animate' },
  'mediterranean':      { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'cherry-blossom':     { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'vertex-veo', fallback: 'modelslab-animate' },
  'monsoon':            { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'vertex-veo', fallback: 'modelslab-animate' },
  'saharan-golden':     { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'vertex-veo', fallback: 'modelslab-animate' },

  // === Religious & Spiritual ===
  'zen-meditation':         { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'sufi-mystical':          { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'cathedral-gothic':       { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'temple-sacred':          { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'vertex-veo', fallback: 'modelslab-animate' },
  'mosque-arabesque':       { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'vertex-veo', fallback: 'modelslab-animate' },
  'buddhist-serene':        { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'spiritual-cosmic':       { primary: 'sora-2', secondary: 'modelslab-animate', tertiary: 'alibaba-wan', fallback: 'replicate' },
  'synagogue-traditional':  { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },

  // === Regional Modern ===
  'bollywood-vibrant':     { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'k-pop-neon':            { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'latin-fiesta':          { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'afrobeats-urban':       { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'dubai-futuristic':      { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'tokyo-cyberpunk':       { primary: 'alibaba-wan', secondary: 'sora-2', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'scandinavian-hygge':    { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'mediterranean-rustic':  { primary: 'sora-2', secondary: 'vertex-veo', tertiary: 'alibaba-wan', fallback: 'modelslab-animate' },
  'brazilian-carnival':    { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'nigerian-nollywood':    { primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'modelslab-animate', fallback: 'replicate' },
};

// ============================================================================
// AVATAR / LIPSYNC → PROVIDER ROUTING
// ============================================================================

export const STYLE_TO_AVATAR_PROVIDER: Record<string, ProviderChain<AvatarProvider>> = {
  'avatar':   { primary: 'alibaba-wan-s2v', secondary: 'azure-neural', tertiary: 'modelslab', fallback: 'azure-neural' },
  'lipsync':  { primary: 'azure-neural', secondary: 'alibaba-wan-s2v', tertiary: 'modelslab', fallback: 'azure-neural' },
};

// ============================================================================
// 3D OBJECT → PROVIDER ROUTING
// ============================================================================

export const STYLE_TO_3D_PROVIDER: Record<string, ProviderChain<ThreeDProvider>> = {
  '3d-object':  { primary: 'meshy', secondary: 'replicate', tertiary: 'alibaba', fallback: 'meshy' },
  'pixar-3d':   { primary: 'meshy', secondary: 'alibaba', tertiary: 'replicate', fallback: 'meshy' },
};

// ============================================================================
// DEFAULT CHAINS
// ============================================================================

export const DEFAULT_IMAGE_CHAIN: ProviderChain<ImageProvider> = {
  primary: 'gemini', secondary: 'alibaba', tertiary: 'modelslab', fallback: 'huggingface'
};

export const DEFAULT_VIDEO_CHAIN: ProviderChain<VideoProvider> = {
  primary: 'sora-2', secondary: 'alibaba-wan', tertiary: 'vertex-veo', fallback: 'modelslab-animate'
};

// ============================================================================
// RESOLVER FUNCTIONS
// ============================================================================

/**
 * Resolve the provider order for a given style intent and asset type.
 * Returns an ordered array of providers to try, filtered by availability.
 */
export function resolveImageProviderOrder(
  styleIntent?: string,
  explicitProvider?: string,
  isAvailable?: (provider: string) => boolean
): ImageProvider[] {
  const chain = (styleIntent && STYLE_TO_IMAGE_PROVIDER[styleIntent]) 
    ? STYLE_TO_IMAGE_PROVIDER[styleIntent] 
    : DEFAULT_IMAGE_CHAIN;

  const ordered: ImageProvider[] = explicitProvider
    ? [explicitProvider as ImageProvider, chain.primary, chain.secondary, chain.tertiary, chain.fallback]
    : [chain.primary, chain.secondary, chain.tertiary, chain.fallback];

  const seen = new Set<string>();
  return ordered.filter(p => {
    if (seen.has(p)) return false;
    seen.add(p);
    return isAvailable ? isAvailable(p) : true;
  });
}

export function resolveVideoProviderOrder(
  styleIntent?: string,
  explicitProvider?: string,
  isAvailable?: (provider: string) => boolean
): VideoProvider[] {
  const chain = (styleIntent && STYLE_TO_VIDEO_PROVIDER[styleIntent])
    ? STYLE_TO_VIDEO_PROVIDER[styleIntent]
    : DEFAULT_VIDEO_CHAIN;

  const ordered: VideoProvider[] = explicitProvider
    ? [explicitProvider as VideoProvider, chain.primary, chain.secondary, chain.tertiary, chain.fallback]
    : [chain.primary, chain.secondary, chain.tertiary, chain.fallback];

  const seen = new Set<string>();
  return ordered.filter(p => {
    if (seen.has(p)) return false;
    seen.add(p);
    return isAvailable ? isAvailable(p) : true;
  });
}

/**
 * Get the default model for a given image provider
 */
export function getDefaultImageModel(provider: ImageProvider): string {
  switch (provider) {
    case 'gemini': return 'gemini-2.5-flash-preview-image-generation';
    case 'vertex-imagen': return 'imagen-3.0-generate-002';
    case 'openai': return 'gpt-image-1';
    case 'alibaba': return 'wan2.6-t2i';
    case 'modelslab': return 'flux';
    case 'huggingface': return 'black-forest-labs/FLUX.1-schnell';
    case 'replicate': return 'black-forest-labs/flux-schnell';
    case 'deepseek': return 'deepseek-image';
    default: return 'gemini-2.5-flash-preview-image-generation';
  }
}

/**
 * Get all available style intent keys (from hardcoded fallback)
 */
export function getAllStyleIntents(): string[] {
  const imageKeys = Object.keys(STYLE_TO_IMAGE_PROVIDER);
  const videoKeys = Object.keys(STYLE_TO_VIDEO_PROVIDER);
  return [...new Set([...imageKeys, ...videoKeys])];
}
