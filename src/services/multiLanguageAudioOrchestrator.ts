/**
 * Multi-Language Audio Orchestration Service
 * 
 * Coordinates voice, music, and SFX generation across 70+ languages
 * with regional routing and provider selection.
 */

import { GlobalTier } from '@/services/shared/globalTierService';
import { audioGenerationConfigService, RegionalZone, VoiceConfig, AudioGenerationConfig } from '@/services/audioGenerationConfigService';
import { supabase } from '@/integrations/supabase/client';

// ==================== TYPES ====================

export interface LanguageVoiceMapping {
  languageCode: string;
  languageName: string;
  region: RegionalZone;
  primaryTTSProvider: string;
  fallbackTTSProvider: string;
  primarySTTProvider: string;
  recommendedVoices: VoiceOption[];
  rtl: boolean;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  style: 'professional' | 'casual' | 'energetic' | 'calm';
  provider: string;
}

export interface AudioJob {
  id: string;
  type: 'voice' | 'music' | 'sfx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  languageCode: string;
  text?: string;
  prompt?: string;
  duration?: number;
  audioUrl?: string;
  error?: string;
  cost: number;
  provider: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface OrchestrationSession {
  id: string;
  jobs: AudioJob[];
  totalCost: number;
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
}

// ==================== LANGUAGE MAPPINGS ====================

export const LANGUAGE_VOICE_MAPPINGS: LanguageVoiceMapping[] = [
  // Western Languages (Claude Zone) - Deepgram primary for real-time STT
  { languageCode: 'en-US', languageName: 'English (US)', region: 'claude_zone', primaryTTSProvider: 'elevenlabs', fallbackTTSProvider: 'openai', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [
      { id: 'alloy', name: 'Alloy', gender: 'neutral', style: 'professional', provider: 'openai' },
      { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male', style: 'professional', provider: 'elevenlabs' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female', style: 'professional', provider: 'elevenlabs' },
    ]},
  { languageCode: 'en-GB', languageName: 'English (UK)', region: 'claude_zone', primaryTTSProvider: 'elevenlabs', fallbackTTSProvider: 'azure', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [
      { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'male', style: 'professional', provider: 'elevenlabs' },
    ]},
  { languageCode: 'fr-FR', languageName: 'French', region: 'claude_zone', primaryTTSProvider: 'elevenlabs', fallbackTTSProvider: 'azure', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [
      { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'female', style: 'professional', provider: 'elevenlabs' },
    ]},
  { languageCode: 'de-DE', languageName: 'German', region: 'claude_zone', primaryTTSProvider: 'elevenlabs', fallbackTTSProvider: 'azure', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [
      { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'male', style: 'professional', provider: 'elevenlabs' },
    ]},
  { languageCode: 'es-ES', languageName: 'Spanish (Spain)', region: 'claude_zone', primaryTTSProvider: 'elevenlabs', fallbackTTSProvider: 'azure', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'es-MX', languageName: 'Spanish (Mexico)', region: 'claude_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'pt-BR', languageName: 'Portuguese (Brazil)', region: 'claude_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'it-IT', languageName: 'Italian', region: 'claude_zone', primaryTTSProvider: 'elevenlabs', fallbackTTSProvider: 'azure', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'nl-NL', languageName: 'Dutch', region: 'claude_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'pl-PL', languageName: 'Polish', region: 'claude_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'ru-RU', languageName: 'Russian', region: 'claude_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'deepgram', rtl: false,
    recommendedVoices: [] },

  // CJK Languages (Alibaba Zone)
  { languageCode: 'zh-CN', languageName: 'Chinese (Simplified)', region: 'alibaba_zone', primaryTTSProvider: 'alibaba', fallbackTTSProvider: 'azure', primarySTTProvider: 'alibaba', rtl: false,
    recommendedVoices: [
      { id: 'zhitian_emo', name: 'Zhitian', gender: 'female', style: 'professional', provider: 'alibaba' },
      { id: 'zhixiaobai', name: 'Xiaobai', gender: 'male', style: 'casual', provider: 'alibaba' },
    ]},
  { languageCode: 'zh-TW', languageName: 'Chinese (Traditional)', region: 'alibaba_zone', primaryTTSProvider: 'alibaba', fallbackTTSProvider: 'azure', primarySTTProvider: 'alibaba', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'ja-JP', languageName: 'Japanese', region: 'alibaba_zone', primaryTTSProvider: 'alibaba', fallbackTTSProvider: 'azure', primarySTTProvider: 'alibaba', rtl: false,
    recommendedVoices: [
      { id: 'tomoka', name: 'Tomoka', gender: 'female', style: 'professional', provider: 'alibaba' },
    ]},
  { languageCode: 'ko-KR', languageName: 'Korean', region: 'alibaba_zone', primaryTTSProvider: 'alibaba', fallbackTTSProvider: 'azure', primarySTTProvider: 'alibaba', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'vi-VN', languageName: 'Vietnamese', region: 'alibaba_zone', primaryTTSProvider: 'alibaba', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'th-TH', languageName: 'Thai', region: 'alibaba_zone', primaryTTSProvider: 'alibaba', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'id-ID', languageName: 'Indonesian', region: 'alibaba_zone', primaryTTSProvider: 'alibaba', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'ms-MY', languageName: 'Malay', region: 'alibaba_zone', primaryTTSProvider: 'alibaba', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },

  // Arabic Zone (RTL)
  { languageCode: 'ar-SA', languageName: 'Arabic (Saudi)', region: 'arabic_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'azure', rtl: true,
    recommendedVoices: [] },
  { languageCode: 'ar-EG', languageName: 'Arabic (Egyptian)', region: 'arabic_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'azure', rtl: true,
    recommendedVoices: [] },
  { languageCode: 'ar-AE', languageName: 'Arabic (UAE)', region: 'arabic_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'azure', rtl: true,
    recommendedVoices: [] },
  { languageCode: 'he-IL', languageName: 'Hebrew', region: 'arabic_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'azure', rtl: true,
    recommendedVoices: [] },
  { languageCode: 'fa-IR', languageName: 'Persian', region: 'arabic_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'azure', rtl: true,
    recommendedVoices: [] },
  { languageCode: 'ur-PK', languageName: 'Urdu', region: 'arabic_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'azure', rtl: true,
    recommendedVoices: [] },

  // Indian Languages (Gemini Zone)
  { languageCode: 'hi-IN', languageName: 'Hindi', region: 'gemini_zone', primaryTTSProvider: 'google', fallbackTTSProvider: 'azure', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'bn-IN', languageName: 'Bengali', region: 'gemini_zone', primaryTTSProvider: 'google', fallbackTTSProvider: 'azure', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'ta-IN', languageName: 'Tamil', region: 'gemini_zone', primaryTTSProvider: 'google', fallbackTTSProvider: 'azure', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'te-IN', languageName: 'Telugu', region: 'gemini_zone', primaryTTSProvider: 'google', fallbackTTSProvider: 'azure', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'mr-IN', languageName: 'Marathi', region: 'gemini_zone', primaryTTSProvider: 'google', fallbackTTSProvider: 'azure', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'gu-IN', languageName: 'Gujarati', region: 'gemini_zone', primaryTTSProvider: 'google', fallbackTTSProvider: 'azure', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'kn-IN', languageName: 'Kannada', region: 'gemini_zone', primaryTTSProvider: 'google', fallbackTTSProvider: 'azure', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'ml-IN', languageName: 'Malayalam', region: 'gemini_zone', primaryTTSProvider: 'google', fallbackTTSProvider: 'azure', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },

  // African Languages (Africa Zone)
  { languageCode: 'sw-KE', languageName: 'Swahili', region: 'africa_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'am-ET', languageName: 'Amharic', region: 'africa_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'yo-NG', languageName: 'Yoruba', region: 'africa_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'ig-NG', languageName: 'Igbo', region: 'africa_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'zu-ZA', languageName: 'Zulu', region: 'africa_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
  { languageCode: 'af-ZA', languageName: 'Afrikaans', region: 'africa_zone', primaryTTSProvider: 'azure', fallbackTTSProvider: 'google', primarySTTProvider: 'google', rtl: false,
    recommendedVoices: [] },
];

// ==================== SERVICE ====================

class MultiLanguageAudioOrchestrator {
  private sessions: Map<string, OrchestrationSession> = new Map();

  /**
   * Get language mapping by code
   */
  getLanguageMapping(languageCode: string): LanguageVoiceMapping | undefined {
    return LANGUAGE_VOICE_MAPPINGS.find(m => m.languageCode === languageCode);
  }

  /**
   * Get all languages for a region
   */
  getLanguagesByRegion(region: RegionalZone): LanguageVoiceMapping[] {
    return LANGUAGE_VOICE_MAPPINGS.filter(m => m.region === region);
  }

  /**
   * Get recommended voices for a language
   */
  getRecommendedVoices(languageCode: string): VoiceOption[] {
    const mapping = this.getLanguageMapping(languageCode);
    return mapping?.recommendedVoices || [];
  }

  /**
   * Create a new orchestration session
   */
  createSession(): OrchestrationSession {
    const session: OrchestrationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobs: [],
      totalCost: 0,
      progress: 0,
      status: 'idle',
    };
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Add voice generation job to session
   */
  addVoiceJob(
    sessionId: string,
    text: string,
    languageCode: string,
    voiceConfig: Partial<VoiceConfig>,
    tier: GlobalTier = 'advanced'
  ): AudioJob {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const mapping = this.getLanguageMapping(languageCode);
    const provider = voiceConfig.provider || mapping?.primaryTTSProvider || 'openai';
    
    const job: AudioJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'voice',
      status: 'pending',
      languageCode,
      text,
      provider,
      cost: this.estimateVoiceCost(text, tier),
    };

    session.jobs.push(job);
    session.totalCost += job.cost;
    return job;
  }

  /**
   * Add music generation job to session
   */
  addMusicJob(
    sessionId: string,
    prompt: string,
    duration: number,
    tier: GlobalTier = 'advanced'
  ): AudioJob {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const job: AudioJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'music',
      status: 'pending',
      languageCode: 'en-US',
      prompt,
      duration,
      provider: 'elevenlabs',
      cost: this.estimateMusicCost(duration, tier),
    };

    session.jobs.push(job);
    session.totalCost += job.cost;
    return job;
  }

  /**
   * Add SFX generation job to session
   */
  addSfxJob(
    sessionId: string,
    prompt: string,
    duration: number,
    tier: GlobalTier = 'advanced'
  ): AudioJob {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const job: AudioJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'sfx',
      status: 'pending',
      languageCode: 'en-US',
      prompt,
      duration,
      provider: 'elevenlabs',
      cost: this.estimateSfxCost(duration, tier),
    };

    session.jobs.push(job);
    session.totalCost += job.cost;
    return job;
  }

  /**
   * Execute all jobs in a session
   */
  async executeSession(
    sessionId: string,
    onProgress?: (progress: number, job: AudioJob) => void
  ): Promise<OrchestrationSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'processing';
    const totalJobs = session.jobs.length;
    let completedJobs = 0;

    for (const job of session.jobs) {
      try {
        job.status = 'processing';
        job.startedAt = new Date();

        // Call appropriate edge function based on job type
        const result = await this.executeJob(job);
        
        job.status = 'completed';
        job.audioUrl = result.audioUrl;
        job.completedAt = new Date();
      } catch (error) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.completedAt = new Date();
      }

      completedJobs++;
      session.progress = (completedJobs / totalJobs) * 100;
      onProgress?.(session.progress, job);
    }

    session.status = session.jobs.some(j => j.status === 'failed') ? 'failed' : 'completed';
    return session;
  }

  /**
   * Execute a single audio job
   */
  private async executeJob(job: AudioJob): Promise<{ audioUrl: string }> {
    let endpoint: string;
    let payload: Record<string, unknown>;

    switch (job.type) {
      case 'voice':
        endpoint = 'multi-provider-tts';
        payload = {
          text: job.text,
          provider: job.provider,
          languageCode: job.languageCode,
          tier: 'advanced',
        };
        break;
      case 'music':
        endpoint = 'multi-provider-music';
        payload = {
          prompt: job.prompt,
          duration: job.duration,
          provider: job.provider,
          tier: 'advanced',
        };
        break;
      case 'sfx':
        endpoint = 'multi-provider-sfx';
        payload = {
          prompt: job.prompt,
          duration: job.duration,
          provider: job.provider,
          tier: 'advanced',
        };
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: payload,
    });

    if (error) throw error;
    return { audioUrl: data?.audioUrl || data?.url || '' };
  }

  /**
   * Estimate voice generation cost
   */
  private estimateVoiceCost(text: string, tier: GlobalTier): number {
    const charCount = text.length;
    const baseCostPer1000Chars = 0.015;
    const tierMultiplier = tier === 'premium' ? 3 : tier === 'advanced' ? 1.5 : 1;
    return Math.ceil((charCount / 1000) * baseCostPer1000Chars * tierMultiplier * 100) / 100;
  }

  /**
   * Estimate music generation cost
   */
  private estimateMusicCost(durationSeconds: number, tier: GlobalTier): number {
    const baseCostPerMinute = 0.10;
    const tierMultiplier = tier === 'premium' ? 3 : tier === 'advanced' ? 1.5 : 1;
    return Math.ceil((durationSeconds / 60) * baseCostPerMinute * tierMultiplier * 100) / 100;
  }

  /**
   * Estimate SFX generation cost
   */
  private estimateSfxCost(durationSeconds: number, tier: GlobalTier): number {
    const baseCostPerMinute = 0.05;
    const tierMultiplier = tier === 'premium' ? 3 : tier === 'advanced' ? 1.5 : 1;
    return Math.ceil((durationSeconds / 60) * baseCostPerMinute * tierMultiplier * 100) / 100;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): OrchestrationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Calculate total cost for multi-language dubbing
   */
  calculateDubbingCost(
    text: string,
    languageCodes: string[],
    tier: GlobalTier = 'advanced'
  ): { perLanguage: Record<string, number>; total: number } {
    const perLanguage: Record<string, number> = {};
    let total = 0;

    for (const code of languageCodes) {
      const cost = this.estimateVoiceCost(text, tier);
      perLanguage[code] = cost;
      total += cost;
    }

    return { perLanguage, total };
  }
}

export const multiLanguageAudioOrchestrator = new MultiLanguageAudioOrchestrator();
export default multiLanguageAudioOrchestrator;
