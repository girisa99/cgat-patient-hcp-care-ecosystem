 /**
  * Style Intent Resolver Service
  * Decouples templates from specific AI providers using style abstraction
  * Maps style_intent → provider chain based on 4-zone regional routing
  */
 
 export type StyleIntent = 
   | 'photorealistic' | 'cinematic' | 'anime' | 'pixar-3d'
   | 'watercolor' | 'minimalist' | 'corporate' | 'editorial'
   | 'product-hero' | 'lifestyle' | 'documentary' | 'explainer'
   | 'ugc-authentic' | 'luxury-fashion' | 'tech-startup';
 
 export type ToneModifier = 'professional' | 'casual' | 'luxury' | 'playful' | 'formal' | 'warm';
 
 export type RegionZone = 'western' | 'europe' | 'cjk' | 'india' | 'mena' | 'sea' | 'africa' | 'latam' | 'global';
 
 export interface ProviderChain {
   primary: string;
   secondary: string;
   tertiary: string;
   fallback: string;
 }
 
 export interface ResolvedStyle {
   styleIntent: StyleIntent;
   imageProvider: ProviderChain;
   videoProvider: ProviderChain;
   ttsProvider: string;
   llmProvider: string;
   region: RegionZone;
 }
 
 // Style Intent → Image Provider Mapping (frozen per master registry)
 const STYLE_TO_IMAGE_PROVIDER: Record<StyleIntent, ProviderChain> = Object.freeze({
   'photorealistic': { primary: 'gemini-3-pro', secondary: 'vertex-imagen-3', tertiary: 'modelslab-flux', fallback: 'dalle-3' },
   'cinematic': { primary: 'vertex-veo-3', secondary: 'sora-2', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
   'anime': { primary: 'modelslab-anime', secondary: 'alibaba-wan-2.6', tertiary: 'replicate', fallback: 'modelslab' },
   'pixar-3d': { primary: 'alibaba-wan-2.6', secondary: 'modelslab', tertiary: 'meshy-3d', fallback: 'modelslab' },
   'watercolor': { primary: 'modelslab', secondary: 'vertex-imagen-3', tertiary: 'alibaba', fallback: 'dalle-3' },
   'minimalist': { primary: 'gemini-3-pro', secondary: 'banana-nano', tertiary: 'modelslab-flux', fallback: 'dalle-3' },
   'corporate': { primary: 'gemini-3-pro', secondary: 'vertex-imagen-3', tertiary: 'modelslab-flux', fallback: 'dalle-3' },
   'editorial': { primary: 'vertex-imagen-3', secondary: 'gemini-3-pro', tertiary: 'modelslab', fallback: 'dalle-3' },
   'product-hero': { primary: 'gemini-3-pro', secondary: 'vertex-imagen-3', tertiary: 'modelslab-flux', fallback: 'dalle-3' },
   'lifestyle': { primary: 'modelslab-flux', secondary: 'gemini-3-pro', tertiary: 'vertex-imagen-3', fallback: 'dalle-3' },
   'documentary': { primary: 'vertex-imagen-3', secondary: 'gemini-3-pro', tertiary: 'modelslab', fallback: 'dalle-3' },
   'explainer': { primary: 'gemini-3-pro', secondary: 'modelslab-flux', tertiary: 'vertex-imagen-3', fallback: 'dalle-3' },
   'ugc-authentic': { primary: 'modelslab-flux', secondary: 'gemini-3-pro', tertiary: 'alibaba', fallback: 'dalle-3' },
   'luxury-fashion': { primary: 'vertex-imagen-3', secondary: 'gemini-3-pro', tertiary: 'modelslab', fallback: 'dalle-3' },
   'tech-startup': { primary: 'gemini-3-pro', secondary: 'modelslab-flux', tertiary: 'vertex-imagen-3', fallback: 'dalle-3' },
 });
 
 // Style Intent → Video Provider Mapping
 const STYLE_TO_VIDEO_PROVIDER: Record<StyleIntent, ProviderChain> = Object.freeze({
   'photorealistic': { primary: 'vertex-veo-3', secondary: 'sora-2', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
   'cinematic': { primary: 'vertex-veo-3', secondary: 'sora-2', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
   'anime': { primary: 'alibaba-wan-2.6', secondary: 'modelslab', tertiary: 'replicate-svd', fallback: 'modelslab' },
   'pixar-3d': { primary: 'alibaba-wan-2.6', secondary: 'modelslab', tertiary: 'meshy-3d', fallback: 'modelslab' },
   'watercolor': { primary: 'modelslab', secondary: 'alibaba-wan-2.6', tertiary: 'replicate', fallback: 'modelslab' },
   'minimalist': { primary: 'vertex-veo-3', secondary: 'modelslab', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
   'corporate': { primary: 'vertex-veo-3', secondary: 'sora-2', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
   'editorial': { primary: 'vertex-veo-3', secondary: 'sora-2', tertiary: 'modelslab', fallback: 'modelslab' },
   'product-hero': { primary: 'vertex-veo-3', secondary: 'sora-2', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
   'lifestyle': { primary: 'sora-2', secondary: 'vertex-veo-3', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
   'documentary': { primary: 'vertex-veo-3', secondary: 'sora-2', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
   'explainer': { primary: 'modelslab', secondary: 'alibaba-wan-2.6', tertiary: 'vertex-veo-3', fallback: 'modelslab' },
   'ugc-authentic': { primary: 'modelslab', secondary: 'alibaba-wan-2.6', tertiary: 'replicate', fallback: 'modelslab' },
   'luxury-fashion': { primary: 'vertex-veo-3', secondary: 'sora-2', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
   'tech-startup': { primary: 'vertex-veo-3', secondary: 'modelslab', tertiary: 'alibaba-wan-2.6', fallback: 'modelslab' },
 });
 
 // Region → TTS Provider Mapping (4-zone routing)
 // Azure Neural is PRIMARY for ALL zones (superior Viseme data for lip-sync)
 // ElevenLabs is TERTIARY/PREMIUM clone only — NEVER primary for production TTS
 const REGION_TO_TTS_PROVIDER: Record<RegionZone, string> = Object.freeze({
   'western': 'azure-neural',
   'europe': 'azure-neural',
   'cjk': 'alibaba-qwen3-tts',
   'india': 'azure-neural',
   'mena': 'azure-neural',
   'sea': 'azure-neural',
   'africa': 'azure-neural',
   'latam': 'azure-neural',
   'global': 'azure-neural',
 });
 
 // Region → LLM Provider Mapping
 const REGION_TO_LLM_PROVIDER: Record<RegionZone, string> = Object.freeze({
   'western': 'claude-4',
   'europe': 'claude-4',
   'cjk': 'alibaba-qwen-max',
   'india': 'gemini-3-pro',
   'mena': 'alibaba-qwen-max',
   'sea': 'gemini-3-pro',
   'africa': 'gemini-3-pro',
   'latam': 'gemini-3-pro',
   'global': 'gemini-3-pro',
 });
 
 /**
  * Resolve style intent to provider chain based on region
  */
 export function resolveStyleIntent(
   styleIntent: StyleIntent,
   region: RegionZone = 'global'
 ): ResolvedStyle {
   const imageProvider = STYLE_TO_IMAGE_PROVIDER[styleIntent] || STYLE_TO_IMAGE_PROVIDER['corporate'];
   const videoProvider = STYLE_TO_VIDEO_PROVIDER[styleIntent] || STYLE_TO_VIDEO_PROVIDER['corporate'];
   const ttsProvider = REGION_TO_TTS_PROVIDER[region] || REGION_TO_TTS_PROVIDER['global'];
   const llmProvider = REGION_TO_LLM_PROVIDER[region] || REGION_TO_LLM_PROVIDER['global'];
 
   return {
     styleIntent,
     imageProvider,
     videoProvider,
     ttsProvider,
     llmProvider,
     region,
   };
 }
 
 /**
  * Get all available style intents
  */
 export function getAvailableStyleIntents(): StyleIntent[] {
   return Object.keys(STYLE_TO_IMAGE_PROVIDER) as StyleIntent[];
 }
 
 /**
  * Get style intent display name
  */
 export function getStyleIntentLabel(intent: StyleIntent): string {
   const labels: Record<StyleIntent, string> = {
     'photorealistic': 'Photorealistic',
     'cinematic': 'Cinematic',
     'anime': 'Anime/Manga',
     'pixar-3d': 'Pixar/3D Animation',
     'watercolor': 'Watercolor/Artistic',
     'minimalist': 'Minimalist',
     'corporate': 'Corporate/Professional',
     'editorial': 'Editorial/Magazine',
     'product-hero': 'Product Hero Shot',
     'lifestyle': 'Lifestyle',
     'documentary': 'Documentary',
     'explainer': 'Explainer/Educational',
     'ugc-authentic': 'UGC/Authentic',
     'luxury-fashion': 'Luxury/Fashion',
     'tech-startup': 'Tech/Startup',
   };
   return labels[intent] || intent;
 }
 
 /**
  * Detect region from user IP or browser locale
  */
 export function detectRegionFromLocale(locale: string): RegionZone {
   const localeMap: Record<string, RegionZone> = {
     'en-US': 'western', 'en-GB': 'europe', 'en-AU': 'western',
     'zh-CN': 'cjk', 'zh-TW': 'cjk', 'ja-JP': 'cjk', 'ko-KR': 'cjk',
     'hi-IN': 'india', 'ta-IN': 'india', 'te-IN': 'india', 'bn-IN': 'india',
     'ar-SA': 'mena', 'ar-AE': 'mena', 'ar-EG': 'mena',
     'th-TH': 'sea', 'vi-VN': 'sea', 'id-ID': 'sea', 'ms-MY': 'sea',
     'es-MX': 'latam', 'es-AR': 'latam', 'pt-BR': 'latam',
     'sw-KE': 'africa', 'en-ZA': 'africa',
     'de-DE': 'europe', 'fr-FR': 'europe', 'es-ES': 'europe', 'it-IT': 'europe',
   };
   return localeMap[locale] || 'global';
 }
 
 export const styleIntentResolver = {
   resolve: resolveStyleIntent,
   getAvailable: getAvailableStyleIntents,
   getLabel: getStyleIntentLabel,
   detectRegion: detectRegionFromLocale,
 };