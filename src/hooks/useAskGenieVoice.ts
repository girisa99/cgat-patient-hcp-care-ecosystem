/**
 * useAskGenieVoice - Language-Paired Bidirectional Voice for Ask Genie
 * 
 * Provides:
 * - Speech-to-Text (user talks) with language detection
 * - Text-to-Speech (Genie speaks back) with optimal provider selection
 * - Auto language pairing based on user locale/preference
 * - Works across all Genie Suite products
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export type VoiceProvider = 'elevenlabs' | 'openai' | 'google' | 'azure' | 'aws' | 'alibaba';
export type STTProvider = 'whisper' | 'google' | 'azure' | 'deepgram' | 'elevenlabs';
export type VoiceRegion = 'western_europe' | 'eastern_europe' | 'east_asia' | 'south_asia' | 'southeast_asia' | 'middle_east' | 'africa';

export interface LanguageVoicePairing {
  languageCode: string;
  languageName: string;
  nativeName: string;
  region: VoiceRegion;
  recommendedTTS: VoiceProvider;
  recommendedSTT: STTProvider;
  fallbackTTS: VoiceProvider[];
  fallbackSTT: STTProvider[];
  voiceIds: Record<VoiceProvider, { male?: string; female?: string; neutral?: string }>;
  quality: 'excellent' | 'good' | 'fair';
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  detectedLanguage: string | null;
  currentProvider: { tts: VoiceProvider | null; stt: STTProvider | null };
  error: string | null;
}

export interface UseAskGenieVoiceOptions {
  defaultLanguage?: string;
  autoDetectLanguage?: boolean;
  preferredVoiceGender?: 'male' | 'female' | 'neutral';
  onTranscript?: (text: string, language: string) => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
}

// ============================================================================
// LANGUAGE-PROVIDER PAIRING MATRIX
// ============================================================================

export const LANGUAGE_VOICE_PAIRINGS: LanguageVoicePairing[] = [
  // ============================================================================
  // WESTERN EUROPEAN LANGUAGES
  // ============================================================================
  {
    languageCode: 'en',
    languageName: 'English',
    nativeName: 'English',
    region: 'western_europe',
    recommendedTTS: 'elevenlabs',
    recommendedSTT: 'whisper',
    fallbackTTS: ['openai', 'google', 'azure'],
    fallbackSTT: ['google', 'azure', 'deepgram'],
    voiceIds: {
      elevenlabs: { male: 'JBFqnCBsd6RMkjVDRZzb', female: 'EXAVITQu4vr4xnSDxMaL', neutral: 'onwK4e9ZLuTAKqWW03F9' },
      openai: { male: 'onyx', female: 'nova', neutral: 'alloy' },
      google: { male: 'en-US-Neural2-D', female: 'en-US-Neural2-F' },
      azure: { male: 'en-US-GuyNeural', female: 'en-US-JennyNeural' },
      aws: { male: 'Matthew', female: 'Joanna' },
      alibaba: {},
    },
    quality: 'excellent',
  },
  {
    languageCode: 'es',
    languageName: 'Spanish',
    nativeName: 'Español',
    region: 'western_europe',
    recommendedTTS: 'elevenlabs',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google', 'azure', 'aws'],
    fallbackSTT: ['google', 'azure'],
    voiceIds: {
      elevenlabs: { male: 'onwK4e9ZLuTAKqWW03F9', female: 'pFZP5JQG7iQjIQuC4Bku' },
      openai: { female: 'nova' },
      google: { male: 'es-ES-Neural2-B', female: 'es-ES-Neural2-A' },
      azure: { male: 'es-ES-AlvaroNeural', female: 'es-ES-ElviraNeural' },
      aws: { male: 'Miguel', female: 'Lucia' },
      alibaba: {},
    },
    quality: 'excellent',
  },
  {
    languageCode: 'fr',
    languageName: 'French',
    nativeName: 'Français',
    region: 'western_europe',
    recommendedTTS: 'elevenlabs',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google', 'azure'],
    fallbackSTT: ['google', 'azure'],
    voiceIds: {
      elevenlabs: { male: 'onwK4e9ZLuTAKqWW03F9', female: 'XrExE9yKIg1WjnnlVkGX' },
      openai: { female: 'nova' },
      google: { male: 'fr-FR-Neural2-B', female: 'fr-FR-Neural2-A' },
      azure: { male: 'fr-FR-HenriNeural', female: 'fr-FR-DeniseNeural' },
      aws: { male: 'Mathieu', female: 'Lea' },
      alibaba: {},
    },
    quality: 'excellent',
  },
  {
    languageCode: 'de',
    languageName: 'German',
    nativeName: 'Deutsch',
    region: 'western_europe',
    recommendedTTS: 'elevenlabs',
    recommendedSTT: 'whisper',
    fallbackTTS: ['azure', 'google'],
    fallbackSTT: ['azure', 'google'],
    voiceIds: {
      elevenlabs: { male: 'nPczCjzI2devNBz1zQrb', female: 'XrExE9yKIg1WjnnlVkGX' },
      openai: { male: 'onyx' },
      google: { male: 'de-DE-Neural2-B', female: 'de-DE-Neural2-A' },
      azure: { male: 'de-DE-ConradNeural', female: 'de-DE-KatjaNeural' },
      aws: { male: 'Hans', female: 'Vicki' },
      alibaba: {},
    },
    quality: 'excellent',
  },
  {
    languageCode: 'it',
    languageName: 'Italian',
    nativeName: 'Italiano',
    region: 'western_europe',
    recommendedTTS: 'elevenlabs',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google', 'azure'],
    fallbackSTT: ['google', 'azure'],
    voiceIds: {
      elevenlabs: { male: 'onwK4e9ZLuTAKqWW03F9', female: 'pFZP5JQG7iQjIQuC4Bku' },
      openai: { female: 'nova' },
      google: { male: 'it-IT-Neural2-C', female: 'it-IT-Neural2-A' },
      azure: { male: 'it-IT-DiegoNeural', female: 'it-IT-ElsaNeural' },
      aws: { male: 'Giorgio', female: 'Bianca' },
      alibaba: {},
    },
    quality: 'excellent',
  },
  {
    languageCode: 'pt',
    languageName: 'Portuguese',
    nativeName: 'Português',
    region: 'western_europe',
    recommendedTTS: 'elevenlabs',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google', 'azure'],
    fallbackSTT: ['google', 'azure'],
    voiceIds: {
      elevenlabs: { male: 'onwK4e9ZLuTAKqWW03F9', female: 'pFZP5JQG7iQjIQuC4Bku' },
      openai: { female: 'nova' },
      google: { male: 'pt-BR-Neural2-B', female: 'pt-BR-Neural2-A' },
      azure: { male: 'pt-BR-AntonioNeural', female: 'pt-BR-FranciscaNeural' },
      aws: { male: 'Ricardo', female: 'Camila' },
      alibaba: {},
    },
    quality: 'excellent',
  },
  {
    languageCode: 'nl',
    languageName: 'Dutch',
    nativeName: 'Nederlands',
    region: 'western_europe',
    recommendedTTS: 'elevenlabs',
    recommendedSTT: 'whisper',
    fallbackTTS: ['azure', 'google'],
    fallbackSTT: ['azure', 'google'],
    voiceIds: {
      elevenlabs: { male: 'onwK4e9ZLuTAKqWW03F9', female: 'EXAVITQu4vr4xnSDxMaL' },
      openai: {},
      google: { male: 'nl-NL-Wavenet-B', female: 'nl-NL-Wavenet-A' },
      azure: { male: 'nl-NL-MaartenNeural', female: 'nl-NL-ColetteNeural' },
      aws: { male: 'Ruben', female: 'Lotte' },
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'sv',
    languageName: 'Swedish',
    nativeName: 'Svenska',
    region: 'western_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google', 'elevenlabs'],
    fallbackSTT: ['azure', 'google'],
    voiceIds: {
      elevenlabs: { female: 'EXAVITQu4vr4xnSDxMaL' },
      openai: {},
      google: { female: 'sv-SE-Wavenet-A' },
      azure: { male: 'sv-SE-MattiasNeural', female: 'sv-SE-SofieNeural' },
      aws: { female: 'Astrid' },
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'da',
    languageName: 'Danish',
    nativeName: 'Dansk',
    region: 'western_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'da-DK-Wavenet-A' },
      azure: { male: 'da-DK-JeppeNeural', female: 'da-DK-ChristelNeural' },
      aws: { female: 'Naja' },
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'no',
    languageName: 'Norwegian',
    nativeName: 'Norsk',
    region: 'western_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'nb-NO-Wavenet-A' },
      azure: { male: 'nb-NO-FinnNeural', female: 'nb-NO-PernilleNeural' },
      aws: { female: 'Liv' },
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'fi',
    languageName: 'Finnish',
    nativeName: 'Suomi',
    region: 'western_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'fi-FI-Wavenet-A' },
      azure: { male: 'fi-FI-HarriNeural', female: 'fi-FI-NooraNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'el',
    languageName: 'Greek',
    nativeName: 'Ελληνικά',
    region: 'western_europe',
    recommendedTTS: 'google',
    recommendedSTT: 'google',
    fallbackTTS: ['azure'],
    fallbackSTT: ['whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'el-GR-Wavenet-A', female: 'el-GR-Wavenet-A' },
      azure: { male: 'el-GR-NestorNeural', female: 'el-GR-AthinaNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  // ============================================================================
  // EASTERN EUROPEAN LANGUAGES
  // ============================================================================
  {
    languageCode: 'ru',
    languageName: 'Russian',
    nativeName: 'Русский',
    region: 'eastern_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google', 'aws'],
    fallbackSTT: ['azure', 'google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'ru-RU-Wavenet-B', female: 'ru-RU-Wavenet-A' },
      azure: { male: 'ru-RU-DmitryNeural', female: 'ru-RU-SvetlanaNeural' },
      aws: { male: 'Maxim', female: 'Tatyana' },
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'pl',
    languageName: 'Polish',
    nativeName: 'Polski',
    region: 'eastern_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google', 'aws'],
    fallbackSTT: ['azure', 'google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'pl-PL-Wavenet-B', female: 'pl-PL-Wavenet-A' },
      azure: { male: 'pl-PL-MarekNeural', female: 'pl-PL-ZofiaNeural' },
      aws: { male: 'Jacek', female: 'Ewa' },
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'uk',
    languageName: 'Ukrainian',
    nativeName: 'Українська',
    region: 'eastern_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google'],
    fallbackSTT: ['azure', 'google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'uk-UA-Wavenet-A' },
      azure: { male: 'uk-UA-OstapNeural', female: 'uk-UA-PolinaNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'cs',
    languageName: 'Czech',
    nativeName: 'Čeština',
    region: 'eastern_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'cs-CZ-Wavenet-A' },
      azure: { male: 'cs-CZ-AntoninNeural', female: 'cs-CZ-VlastaNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'ro',
    languageName: 'Romanian',
    nativeName: 'Română',
    region: 'eastern_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'ro-RO-Wavenet-A' },
      azure: { male: 'ro-RO-EmilNeural', female: 'ro-RO-AlinaNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'hu',
    languageName: 'Hungarian',
    nativeName: 'Magyar',
    region: 'eastern_europe',
    recommendedTTS: 'azure',
    recommendedSTT: 'whisper',
    fallbackTTS: ['google'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'hu-HU-Wavenet-A' },
      azure: { male: 'hu-HU-TamasNeural', female: 'hu-HU-NoemiNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  // ============================================================================
  // CJK LANGUAGES (East Asian)
  // ============================================================================
  {
    languageCode: 'zh',
    languageName: 'Chinese',
    nativeName: '中文',
    region: 'east_asia',
    recommendedTTS: 'alibaba',
    recommendedSTT: 'azure',
    fallbackTTS: ['azure', 'google', 'elevenlabs'],
    fallbackSTT: ['google', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'cmn-CN-Wavenet-B', female: 'cmn-CN-Wavenet-A' },
      azure: { male: 'zh-CN-YunxiNeural', female: 'zh-CN-XiaoxiaoNeural' },
      aws: { female: 'Zhiyu' },
      alibaba: { male: 'zhitian_emo', female: 'zhiyan_emo' },
    },
    quality: 'excellent',
  },
  {
    languageCode: 'ja',
    languageName: 'Japanese',
    nativeName: '日本語',
    region: 'east_asia',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google', 'alibaba'],
    fallbackSTT: ['google', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'ja-JP-Neural2-C', female: 'ja-JP-Neural2-B' },
      azure: { male: 'ja-JP-KeitaNeural', female: 'ja-JP-NanamiNeural' },
      aws: { male: 'Takumi', female: 'Mizuki' },
      alibaba: { female: 'tomoka' },
    },
    quality: 'excellent',
  },
  {
    languageCode: 'ko',
    languageName: 'Korean',
    nativeName: '한국어',
    region: 'east_asia',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google', 'aws'],
    fallbackSTT: ['google', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'ko-KR-Neural2-C', female: 'ko-KR-Neural2-A' },
      azure: { male: 'ko-KR-InJoonNeural', female: 'ko-KR-SunHiNeural' },
      aws: { female: 'Seoyeon' },
      alibaba: {},
    },
    quality: 'excellent',
  },
  // ============================================================================
  // MIDDLE EAST & NORTH AFRICA
  // ============================================================================
  {
    languageCode: 'ar',
    languageName: 'Arabic',
    nativeName: 'العربية',
    region: 'middle_east',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google', 'aws'],
    fallbackSTT: ['google', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'ar-XA-Wavenet-B', female: 'ar-XA-Wavenet-A' },
      azure: { male: 'ar-SA-HamedNeural', female: 'ar-SA-ZariyahNeural' },
      aws: { female: 'Zeina' },
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'he',
    languageName: 'Hebrew',
    nativeName: 'עברית',
    region: 'middle_east',
    recommendedTTS: 'google',
    recommendedSTT: 'google',
    fallbackTTS: ['azure'],
    fallbackSTT: ['azure', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'he-IL-Wavenet-B', female: 'he-IL-Wavenet-A' },
      azure: { male: 'he-IL-AvriNeural', female: 'he-IL-HilaNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'fa',
    languageName: 'Persian',
    nativeName: 'فارسی',
    region: 'middle_east',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google'],
    fallbackSTT: ['whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: {},
      azure: { male: 'fa-IR-FaridNeural', female: 'fa-IR-DilaraNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'tr',
    languageName: 'Turkish',
    nativeName: 'Türkçe',
    region: 'middle_east',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google'],
    fallbackSTT: ['google', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'tr-TR-Wavenet-B', female: 'tr-TR-Wavenet-A' },
      azure: { male: 'tr-TR-AhmetNeural', female: 'tr-TR-EmelNeural' },
      aws: { female: 'Filiz' },
      alibaba: {},
    },
    quality: 'good',
  },
  // ============================================================================
  // SOUTH ASIAN LANGUAGES
  // ============================================================================
  {
    languageCode: 'hi',
    languageName: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'south_asia',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google', 'aws'],
    fallbackSTT: ['google', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'hi-IN-Neural2-B', female: 'hi-IN-Neural2-A' },
      azure: { male: 'hi-IN-MadhurNeural', female: 'hi-IN-SwaraNeural' },
      aws: { female: 'Aditi' },
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'ta',
    languageName: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'south_asia',
    recommendedTTS: 'google',
    recommendedSTT: 'google',
    fallbackTTS: ['azure'],
    fallbackSTT: ['azure'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'ta-IN-Wavenet-B', female: 'ta-IN-Wavenet-A' },
      azure: { male: 'ta-IN-ValluvarNeural', female: 'ta-IN-PallaviNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'te',
    languageName: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'south_asia',
    recommendedTTS: 'google',
    recommendedSTT: 'google',
    fallbackTTS: ['azure'],
    fallbackSTT: ['azure'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'te-IN-Wavenet-A' },
      azure: { male: 'te-IN-MohanNeural', female: 'te-IN-ShrutiNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'bn',
    languageName: 'Bengali',
    nativeName: 'বাংলা',
    region: 'south_asia',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'bn-IN-Wavenet-A' },
      azure: { male: 'bn-IN-BashkarNeural', female: 'bn-IN-TanishaaNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'mr',
    languageName: 'Marathi',
    nativeName: 'मराठी',
    region: 'south_asia',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'mr-IN-Wavenet-A' },
      azure: { male: 'mr-IN-ManoharNeural', female: 'mr-IN-AarohiNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  // ============================================================================
  // SOUTHEAST ASIAN LANGUAGES
  // ============================================================================
  {
    languageCode: 'th',
    languageName: 'Thai',
    nativeName: 'ไทย',
    region: 'southeast_asia',
    recommendedTTS: 'google',
    recommendedSTT: 'google',
    fallbackTTS: ['azure'],
    fallbackSTT: ['azure', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'th-TH-Wavenet-A' },
      azure: { male: 'th-TH-NiwatNeural', female: 'th-TH-PremwadeeNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'vi',
    languageName: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    region: 'southeast_asia',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google'],
    fallbackSTT: ['google', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'vi-VN-Wavenet-B', female: 'vi-VN-Wavenet-A' },
      azure: { male: 'vi-VN-NamMinhNeural', female: 'vi-VN-HoaiMyNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'id',
    languageName: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    region: 'southeast_asia',
    recommendedTTS: 'google',
    recommendedSTT: 'google',
    fallbackTTS: ['azure'],
    fallbackSTT: ['azure', 'whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { male: 'id-ID-Wavenet-B', female: 'id-ID-Wavenet-A' },
      azure: { male: 'id-ID-ArdiNeural', female: 'id-ID-GadisNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'ms',
    languageName: 'Malay',
    nativeName: 'Bahasa Melayu',
    region: 'southeast_asia',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'ms-MY-Wavenet-A' },
      azure: { male: 'ms-MY-OsmanNeural', female: 'ms-MY-YasminNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'fil',
    languageName: 'Filipino',
    nativeName: 'Filipino',
    region: 'southeast_asia',
    recommendedTTS: 'google',
    recommendedSTT: 'google',
    fallbackTTS: ['azure'],
    fallbackSTT: ['whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'fil-PH-Wavenet-A' },
      azure: { male: 'fil-PH-AngeloNeural', female: 'fil-PH-BlessicaNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  // ============================================================================
  // AFRICAN LANGUAGES
  // ============================================================================
  {
    languageCode: 'sw',
    languageName: 'Swahili',
    nativeName: 'Kiswahili',
    region: 'africa',
    recommendedTTS: 'google',
    recommendedSTT: 'google',
    fallbackTTS: ['azure'],
    fallbackSTT: ['whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'sw-KE-Wavenet-A' },
      azure: { male: 'sw-KE-RafikiNeural', female: 'sw-KE-ZuriNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'zu',
    languageName: 'Zulu',
    nativeName: 'isiZulu',
    region: 'africa',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google'],
    fallbackSTT: ['whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: {},
      azure: { male: 'zu-ZA-ThembaNeural', female: 'zu-ZA-ThandoNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'af',
    languageName: 'Afrikaans',
    nativeName: 'Afrikaans',
    region: 'africa',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google'],
    fallbackSTT: ['whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: { female: 'af-ZA-Standard-A' },
      azure: { male: 'af-ZA-WillemNeural', female: 'af-ZA-AdriNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'good',
  },
  {
    languageCode: 'am',
    languageName: 'Amharic',
    nativeName: 'አማርኛ',
    region: 'africa',
    recommendedTTS: 'azure',
    recommendedSTT: 'azure',
    fallbackTTS: ['google'],
    fallbackSTT: ['whisper'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: {},
      azure: { male: 'am-ET-AmehaNeural', female: 'am-ET-MekdesNeural' },
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'ha',
    languageName: 'Hausa',
    nativeName: 'Hausa',
    region: 'africa',
    recommendedTTS: 'google',
    recommendedSTT: 'whisper',
    fallbackTTS: ['azure'],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: {},
      azure: {},
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'yo',
    languageName: 'Yoruba',
    nativeName: 'Yorùbá',
    region: 'africa',
    recommendedTTS: 'google',
    recommendedSTT: 'whisper',
    fallbackTTS: [],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: {},
      azure: {},
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
  {
    languageCode: 'ig',
    languageName: 'Igbo',
    nativeName: 'Igbo',
    region: 'africa',
    recommendedTTS: 'google',
    recommendedSTT: 'whisper',
    fallbackTTS: [],
    fallbackSTT: ['google'],
    voiceIds: {
      elevenlabs: {},
      openai: {},
      google: {},
      azure: {},
      aws: {},
      alibaba: {},
    },
    quality: 'fair',
  },
];

// Region labels for grouping
export const REGION_LABELS: Record<string, string> = {
  western_europe: '🇪🇺 Western Europe',
  eastern_europe: '🇷🇺 Eastern Europe',
  east_asia: '🇨🇳 East Asia',
  south_asia: '🇮🇳 South Asia',
  southeast_asia: '🇹🇭 Southeast Asia',
  middle_east: '🇸🇦 Middle East & North Africa',
  africa: '🌍 Sub-Saharan Africa',
};

// Country code to language mapping for IP detection
export const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  // Western Europe
  US: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en', CA: 'en',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr',
  DE: 'de', AT: 'de',
  IT: 'it',
  PT: 'pt', BR: 'pt',
  NL: 'nl',
  SE: 'sv',
  DK: 'da',
  NO: 'no',
  FI: 'fi',
  GR: 'el',
  // Eastern Europe
  RU: 'ru',
  PL: 'pl',
  UA: 'uk',
  CZ: 'cs',
  RO: 'ro',
  HU: 'hu',
  // East Asia
  CN: 'zh', TW: 'zh', HK: 'zh',
  JP: 'ja',
  KR: 'ko',
  // Middle East
  SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', DZ: 'ar', IQ: 'ar',
  IL: 'he',
  IR: 'fa',
  TR: 'tr',
  // South Asia
  IN: 'hi',
  PK: 'ur',
  BD: 'bn',
  // Southeast Asia
  TH: 'th',
  VN: 'vi',
  ID: 'id',
  MY: 'ms',
  PH: 'fil',
  SG: 'en',
  // Africa
  KE: 'sw', TZ: 'sw',
  ZA: 'af',
  NG: 'en', // Nigeria uses English officially
  ET: 'am',
  GH: 'en',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get language pairing configuration for a given language code
 */
export function getLanguagePairing(languageCode: string): LanguageVoicePairing {
  const normalized = languageCode.toLowerCase().split('-')[0]; // 'en-US' -> 'en'
  return (
    LANGUAGE_VOICE_PAIRINGS.find((p) => p.languageCode === normalized) ||
    LANGUAGE_VOICE_PAIRINGS[0] // Default to English
  );
}

/**
 * Get the best voice ID for a language and provider
 */
export function getVoiceId(
  pairing: LanguageVoicePairing,
  provider: VoiceProvider,
  gender: 'male' | 'female' | 'neutral' = 'female'
): string | undefined {
  const voices = pairing.voiceIds[provider];
  return voices[gender] || voices.female || voices.male || voices.neutral;
}

/**
 * Detect user's browser language
 */
export function detectBrowserLanguage(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.language || 'en';
  }
  return 'en';
}

/**
 * Detect language from user's IP/country using free geolocation API
 * Returns country code which can be mapped to language
 */
export async function detectCountryFromIP(): Promise<{ country: string; language: string } | null> {
  try {
    // Use ipapi.co free tier (1000 requests/day)
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const countryCode = data.country_code || data.country;
    
    if (countryCode && COUNTRY_TO_LANGUAGE[countryCode]) {
      return {
        country: countryCode,
        language: COUNTRY_TO_LANGUAGE[countryCode]
      };
    }
    
    return { country: countryCode || 'US', language: 'en' };
  } catch (error) {
    console.warn('[AskGenieVoice] IP detection failed, using browser language:', error);
    return null;
  }
}

/**
 * Get languages grouped by region
 */
export function getLanguagesByRegion(): Record<VoiceRegion, LanguageVoicePairing[]> {
  const grouped: Record<VoiceRegion, LanguageVoicePairing[]> = {
    western_europe: [],
    eastern_europe: [],
    east_asia: [],
    south_asia: [],
    southeast_asia: [],
    middle_east: [],
    africa: [],
  };
  
  LANGUAGE_VOICE_PAIRINGS.forEach(lang => {
    if (grouped[lang.region]) {
      grouped[lang.region].push(lang);
    }
  });
  
  return grouped;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useAskGenieVoice(options: UseAskGenieVoiceOptions = {}) {
  const {
    defaultLanguage = detectBrowserLanguage(),
    autoDetectLanguage = true,
    preferredVoiceGender = 'female',
    onTranscript,
    onSpeakingStart,
    onSpeakingEnd,
    onListeningStart,
    onListeningEnd,
  } = options;

  // State
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    transcript: '',
    detectedLanguage: null,
    currentProvider: { tts: null, stt: null },
    error: null,
  });

  const [userLanguage, setUserLanguage] = useState(defaultLanguage);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get current language pairing
  const currentPairing = useMemo(() => getLanguagePairing(userLanguage), [userLanguage]);

  /**
   * Start listening (Speech-to-Text)
   */
  const startListening = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isListening: true, error: null, transcript: '' }));
      onListeningStart?.();

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      console.log('[AskGenieVoice] Started listening, language:', userLanguage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Microphone access denied';
      console.error('[AskGenieVoice] Start listening error:', error);
      setState((prev) => ({ ...prev, isListening: false, error: message }));
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, [userLanguage, onListeningStart]);

  /**
   * Stop listening and transcribe
   */
  const stopListening = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isListening: false, isProcessing: true }));
      onListeningEnd?.();

      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Wait for final data
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (audioChunksRef.current.length === 0) {
        setState((prev) => ({ ...prev, isProcessing: false, error: 'No audio recorded' }));
        return null;
      }

      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      // Transcribe via edge function
      console.log('[AskGenieVoice] Transcribing with provider:', currentPairing.recommendedSTT);
      
      const { data, error } = await supabase.functions.invoke('ask-genie-voice', {
        body: {
          action: 'transcribe',
          audio: audioBase64,
          language: userLanguage,
          provider: currentPairing.recommendedSTT,
          fallbackProviders: currentPairing.fallbackSTT,
        },
      });

      if (error) throw new Error(error.message);

      const transcript = data?.text || '';
      const detectedLang = data?.detectedLanguage || userLanguage;

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        transcript,
        detectedLanguage: detectedLang,
        currentProvider: { ...prev.currentProvider, stt: data?.provider || currentPairing.recommendedSTT },
      }));

      // Auto-update language if detected differently
      if (autoDetectLanguage && detectedLang && detectedLang !== userLanguage) {
        setUserLanguage(detectedLang);
        console.log('[AskGenieVoice] Language detected:', detectedLang);
      }

      onTranscript?.(transcript, detectedLang);
      return transcript;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transcription failed';
      console.error('[AskGenieVoice] Transcription error:', error);
      setState((prev) => ({ ...prev, isProcessing: false, error: message }));
      toast.error('Could not transcribe audio. Please try again.');
      return null;
    }
  }, [userLanguage, currentPairing, autoDetectLanguage, onTranscript, onListeningEnd]);

  /**
   * Speak text (Text-to-Speech)
   */
  const speak = useCallback(async (text: string, language?: string) => {
    try {
      const targetLanguage = language || userLanguage;
      const pairing = getLanguagePairing(targetLanguage);
      const voiceId = getVoiceId(pairing, pairing.recommendedTTS, preferredVoiceGender);

      setState((prev) => ({ ...prev, isSpeaking: true, error: null }));
      onSpeakingStart?.();

      console.log('[AskGenieVoice] Speaking with provider:', pairing.recommendedTTS, 'voice:', voiceId);

      // Generate speech via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-genie-voice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'speak',
            text,
            language: targetLanguage,
            provider: pairing.recommendedTTS,
            voiceId,
            fallbackProviders: pairing.fallbackTTS,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
        onSpeakingEnd?.();
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        setState((prev) => ({ ...prev, isSpeaking: false, error: 'Audio playback failed' }));
        onSpeakingEnd?.();
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

      setState((prev) => ({
        ...prev,
        currentProvider: { ...prev.currentProvider, tts: pairing.recommendedTTS },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Speech generation failed';
      console.error('[AskGenieVoice] TTS error:', error);
      setState((prev) => ({ ...prev, isSpeaking: false, error: message }));
      onSpeakingEnd?.();
      toast.error('Could not generate speech. Please try again.');
    }
  }, [userLanguage, preferredVoiceGender, onSpeakingStart, onSpeakingEnd]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setState((prev) => ({ ...prev, isSpeaking: false }));
    onSpeakingEnd?.();
  }, [onSpeakingEnd]);

  /**
   * Cancel listening
   */
  const cancelListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setState((prev) => ({ ...prev, isListening: false, isProcessing: false }));
    onListeningEnd?.();
  }, [onListeningEnd]);

  /**
   * Toggle listening
   */
  const toggleListening = useCallback(async () => {
    if (state.isListening) {
      return stopListening();
    } else {
      await startListening();
      return null;
    }
  }, [state.isListening, startListening, stopListening]);

  /**
   * Set language manually
   */
  const setLanguage = useCallback((languageCode: string) => {
    setUserLanguage(languageCode);
    console.log('[AskGenieVoice] Language set to:', languageCode);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  return {
    // State
    ...state,
    userLanguage,
    currentPairing,

    // Actions
    startListening,
    stopListening,
    cancelListening,
    toggleListening,
    speak,
    stopSpeaking,
    setLanguage,

    // Utilities
    getSupportedLanguages: () => LANGUAGE_VOICE_PAIRINGS,
    getLanguagePairing,
  };
}

export default useAskGenieVoice;
