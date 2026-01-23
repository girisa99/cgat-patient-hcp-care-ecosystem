/**
 * Multi-Language Dubbing Service - P3 Cross-Functional
 * 
 * AI-powered dubbing and translation for video content.
 * Supports 50+ languages with voice cloning.
 * 
 * NOW INTEGRATED with Unified Provider Routing for:
 * - Regional language-specific provider selection
 * - RTL layout support
 * - Competitive moat awareness (Arabic, Indian, African languages)
 * - Fallback chains per language
 * 
 * Phase: P3 Week 14-15
 * Priority: Cross-Functional (All Products)
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  unifiedProviderRouter, 
  getProviderForMediaType,
  requiresRTLLayout,
  type ProviderRoute,
  type MediaType,
} from './unifiedProviderRoutingAdapter';
import { COMPLETE_LANGUAGE_MATRIX } from './competitiveLanguageMatrix';

export interface DubbingJob {
  id: string;
  content_id: string;
  source_language: string;
  target_languages: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  voice_settings: VoiceSettings;
  created_at: string;
  completed_at?: string;
  results: DubbingResult[];
}

export interface VoiceSettings {
  voice_cloning: boolean;
  voice_style: 'original' | 'professional' | 'casual' | 'energetic';
  preserve_emotions: boolean;
  lip_sync: boolean;
  background_audio_preserve: boolean;
}

export interface DubbingResult {
  language: string;
  audio_url: string;
  video_url?: string;
  transcript: string;
  quality_score: number;
  duration_match: number;
  provider_used?: string;
  is_rtl?: boolean;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  native_name: string;
  voice_available: boolean;
  voice_cloning_available: boolean;
  is_moat_language?: boolean;
  primary_provider?: string;
  fallback_provider?: string;
  is_rtl?: boolean;
  speakers?: string;
}

export interface TranslationResult {
  source_text: string;
  source_language: string;
  target_language: string;
  translated_text: string;
  confidence: number;
  provider_used?: string;
}

// Build supported languages from unified provider router
const buildSupportedLanguages = (): SupportedLanguage[] => {
  return COMPLETE_LANGUAGE_MATRIX.map(entry => {
    const ttsRoute = getProviderForMediaType(entry.code, 'tts');
    const voiceCloningProviders = ['elevenlabs', 'azure-neural'];
    
    return {
      code: entry.code,
      name: entry.name,
      native_name: entry.nativeName,
      voice_available: true,
      voice_cloning_available: voiceCloningProviders.includes(ttsRoute.primary),
      is_moat_language: entry.moat !== null,
      primary_provider: ttsRoute.primary,
      fallback_provider: ttsRoute.fallback,
      is_rtl: entry.direction === 'rtl',
      speakers: entry.speakers,
    };
  });
};

  private supportedLanguages: SupportedLanguage[] = buildSupportedLanguages();

  private constructor() {}

  static getInstance(): MultiLanguageDubbingService {
    if (!MultiLanguageDubbingService.instance) {
      MultiLanguageDubbingService.instance = new MultiLanguageDubbingService();
    }
    return MultiLanguageDubbingService.instance;
  }

  /**
   * Get all supported languages with provider info
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return this.supportedLanguages;
  }

  /**
   * Get provider routing for a specific language
   */
  getProviderForLanguage(languageCode: string): ProviderRoute {
    return getProviderForMediaType(languageCode, 'dubbing');
  }

  /**
   * Check if language needs RTL layout
   */
  isRTLLanguage(languageCode: string): boolean {
    return requiresRTLLayout(languageCode);
  }

  /**
   * Start a dubbing job with intelligent provider routing
   */
  async startDubbingJob(
    contentId: string,
    sourceLanguage: string,
    targetLanguages: string[],
    voiceSettings: VoiceSettings
  ): Promise<DubbingJob | null> {
    try {
      // Get provider routes for each target language
      const languageRoutes = targetLanguages.map(lang => ({
        language: lang,
        route: this.getProviderForLanguage(lang),
        isRTL: this.isRTLLanguage(lang),
      }));

      console.log('[MultiLanguageDubbing] Provider routes:', languageRoutes);

      const job: DubbingJob = {
        id: `dub_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        content_id: contentId,
        source_language: sourceLanguage,
        target_languages: targetLanguages,
        status: 'pending',
        progress: 0,
        voice_settings: voiceSettings,
        created_at: new Date().toISOString(),
        results: [],
      };

      console.log('[MultiLanguageDubbing] Job started:', job.id);
      return job;
    } catch (error) {
      console.error('Failed to start dubbing job:', error);
      return null;
    }
  }

  /**
   * Get dubbing job status
   */
  async getJobStatus(jobId: string): Promise<DubbingJob | null> {
    try {
      return null;
    } catch (error) {
      console.error('Failed to get job status:', error);
      return null;
    }
  }

  /**
   * Translate text with provider routing
   */
  async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResult | null> {
    try {
      const translationRoute = getProviderForMediaType(targetLanguage, 'translation');
      console.log(`[MultiLanguageDubbing] Translation route: ${translationRoute.primary} (fallback: ${translationRoute.fallback})`);

      // In production, this would call the actual translation service
      return {
        source_text: text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        translated_text: `[${targetLanguage}] ${text}`,
        confidence: 0.95,
        provider_used: translationRoute.primary,
      };
    } catch (error) {
      console.error('Failed to translate text:', error);
      return null;
    }
  }

  /**
   * Generate dubbed audio with provider routing
   */
  async generateDubbedAudio(
    transcript: string,
    targetLanguage: string,
    voiceSettings: VoiceSettings
  ): Promise<string | null> {
    try {
      const ttsRoute = this.getProviderForLanguage(targetLanguage);
      const isRTL = this.isRTLLanguage(targetLanguage);
      
      console.log(`[MultiLanguageDubbing] TTS route: ${ttsRoute.primary} (RTL: ${isRTL})`);
      console.log(`[MultiLanguageDubbing] Reason: ${ttsRoute.reason}`);

      // In production, this would call the actual TTS service
      return `audio_${targetLanguage}_${ttsRoute.primary}_${Date.now()}.mp3`;
    } catch (error) {
      console.error('Failed to generate dubbed audio:', error);
      return null;
    }
  }

  /**
   * Detect language from text
   */
  async detectLanguage(text: string): Promise<{ language: string; confidence: number } | null> {
    try {
      // Simple detection based on character sets
      const hasKorean = /[\uAC00-\uD7AF]/.test(text);
      const hasJapanese = /[\u3040-\u30FF]/.test(text);
      const hasChinese = /[\u4E00-\u9FFF]/.test(text);
      const hasArabic = /[\u0600-\u06FF]/.test(text);
      const hasCyrillic = /[\u0400-\u04FF]/.test(text);

      if (hasKorean) return { language: 'ko', confidence: 0.95 };
      if (hasJapanese) return { language: 'ja', confidence: 0.95 };
      if (hasChinese) return { language: 'zh', confidence: 0.90 };
      if (hasArabic) return { language: 'ar', confidence: 0.95 };
      if (hasCyrillic) return { language: 'ru', confidence: 0.85 };

      return { language: 'en', confidence: 0.70 };
    } catch (error) {
      console.error('Failed to detect language:', error);
      return null;
    }
  }

  /**
   * Get cost estimate for dubbing job
   */
  getCostEstimate(
    durationMinutes: number,
    targetLanguages: string[],
    voiceCloning: boolean
  ): { credits: number; usd: number } {
    const baseCreditsPerMinute = 10;
    const voiceCloningMultiplier = voiceCloning ? 2 : 1;
    
    const credits = durationMinutes * targetLanguages.length * baseCreditsPerMinute * voiceCloningMultiplier;
    const usd = credits * 0.01;

    return { credits, usd };
  }
}

export const multiLanguageDubbingService = MultiLanguageDubbingService.getInstance();
