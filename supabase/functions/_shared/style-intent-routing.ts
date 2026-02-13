/**
 * STYLE-INTENT → PROVIDER ROUTING
 * 
 * Single source of truth for mapping style intents to provider chains.
 * Shared by: ai-image-generator, ai-universal-processor, and any future
 * edge functions that need image/video/avatar routing.
 * 
 * @see src/services/styleIntentResolver.ts for frontend equivalent
 * @see src/config/regional-routing-registry.ts for regional zone mapping
 */

// ============================================================================
// TYPES
// ============================================================================

export type StyleIntent = 
  | 'photorealistic' | 'cinematic' | 'anime' | 'pixar-3d'
  | 'watercolor' | 'minimalist' | 'corporate' | 'editorial'
  | 'product-hero' | 'lifestyle' | 'documentary' | 'explainer'
  | 'ugc-authentic' | 'luxury-fashion' | 'tech-startup'
  | 'crayon' | 'motion' | 'avatar' | 'lipsync' | '3d-object'
  | 'diffusion' | 'technical-diagram';

export type ImageProvider = 
  | 'gemini' | 'vertex-imagen' | 'openai' | 'alibaba'
  | 'modelslab' | 'huggingface' | 'replicate' | 'deepseek';

export type VideoProvider = 
  | 'alibaba-wan' | 'vertex-veo' | 'replicate' | 'modelslab-animate';

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
  // Photorealistic & Professional
  'photorealistic': { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'cinematic':      { primary: 'gemini', secondary: 'modelslab', tertiary: 'alibaba', fallback: 'openai' },
  'corporate':      { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'editorial':      { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'product-hero':   { primary: 'gemini', secondary: 'vertex-imagen', tertiary: 'modelslab', fallback: 'openai' },
  'luxury-fashion': { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'documentary':    { primary: 'vertex-imagen', secondary: 'gemini', tertiary: 'modelslab', fallback: 'openai' },
  'lifestyle':      { primary: 'modelslab', secondary: 'gemini', tertiary: 'replicate', fallback: 'openai' },

  // Artistic & Stylized
  'anime':          { primary: 'modelslab', secondary: 'alibaba', tertiary: 'replicate', fallback: 'huggingface' },
  'pixar-3d':       { primary: 'alibaba', secondary: 'modelslab', tertiary: 'gemini', fallback: 'openai' },
  'watercolor':     { primary: 'modelslab', secondary: 'gemini', tertiary: 'alibaba', fallback: 'openai' },
  'crayon':         { primary: 'modelslab', secondary: 'alibaba', tertiary: 'gemini', fallback: 'huggingface' },
  'diffusion':      { primary: 'modelslab', secondary: 'replicate', tertiary: 'huggingface', fallback: 'gemini' },

  // Functional
  'minimalist':     { primary: 'gemini', secondary: 'modelslab', tertiary: 'huggingface', fallback: 'openai' },
  'explainer':      { primary: 'gemini', secondary: 'modelslab', tertiary: 'huggingface', fallback: 'openai' },
  'ugc-authentic':  { primary: 'modelslab', secondary: 'gemini', tertiary: 'alibaba', fallback: 'openai' },
  'tech-startup':   { primary: 'gemini', secondary: 'modelslab', tertiary: 'replicate', fallback: 'openai' },
  'technical-diagram': { primary: 'deepseek', secondary: 'gemini', tertiary: 'openai', fallback: 'modelslab' },
};

// ============================================================================
// VIDEO STYLE → PROVIDER ROUTING
// ============================================================================

export const STYLE_TO_VIDEO_PROVIDER: Record<string, ProviderChain<VideoProvider>> = {
  'cinematic':      { primary: 'vertex-veo', secondary: 'alibaba-wan', tertiary: 'replicate', fallback: 'modelslab-animate' },
  'photorealistic': { primary: 'vertex-veo', secondary: 'alibaba-wan', tertiary: 'replicate', fallback: 'modelslab-animate' },
  'anime':          { primary: 'alibaba-wan', secondary: 'modelslab-animate', tertiary: 'replicate', fallback: 'vertex-veo' },
  'pixar-3d':       { primary: 'alibaba-wan', secondary: 'modelslab-animate', tertiary: 'vertex-veo', fallback: 'replicate' },
  'motion':         { primary: 'modelslab-animate', secondary: 'alibaba-wan', tertiary: 'replicate', fallback: 'vertex-veo' },
  'explainer':      { primary: 'alibaba-wan', secondary: 'vertex-veo', tertiary: 'modelslab-animate', fallback: 'replicate' },
  'documentary':    { primary: 'vertex-veo', secondary: 'alibaba-wan', tertiary: 'replicate', fallback: 'modelslab-animate' },
  'ugc-authentic':  { primary: 'alibaba-wan', secondary: 'vertex-veo', tertiary: 'modelslab-animate', fallback: 'replicate' },
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
  primary: 'alibaba-wan', secondary: 'vertex-veo', tertiary: 'replicate', fallback: 'modelslab-animate'
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
    case 'gemini': return 'gemini-2.0-flash-exp';
    case 'vertex-imagen': return 'imagen-3.0-generate-002';
    case 'openai': return 'gpt-image-1';
    case 'alibaba': return 'wan2.6-t2i';
    case 'modelslab': return 'flux';
    case 'huggingface': return 'black-forest-labs/FLUX.1-schnell';
    case 'replicate': return 'black-forest-labs/flux-schnell';
    case 'deepseek': return 'deepseek-image';
    default: return 'gemini-2.0-flash-exp';
  }
}
