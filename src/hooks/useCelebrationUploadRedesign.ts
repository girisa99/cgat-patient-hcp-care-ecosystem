/**
 * useCelebrationUploadRedesign
 *
 * Hook for the "Upload & Redesign Existing Invitation" flow.
 * Handles: file upload → AI extraction → photo consent → production request building.
 *
 * Uses existing infrastructure:
 * - ai-universal-processor (vision model for OCR/extraction)
 * - Supabase Storage for photo uploads
 * - regionalLanguageService for language detection
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CelebrationProductionRequest, CelebrationPersonalization } from '@/services/celebrations/celebrationProductionBridge';
import type { CelebrationOutputFormat } from '@/config/celebrations/ceremony-type-registry';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ExtractedInvitationData {
  names: Record<string, string>;
  eventDate: string;
  eventTime: string;
  venue: string;
  city: string;
  location: string;
  language: string;
  scripts: string[];
  ceremonyType: string;
  customMessage: string;
  rsvpDetails: string;
  originalColors: string[];
  originalStyle: string;
  confidence: number;
  rawText: string;
  isMultiLanguage: boolean;
}

interface PhotoEntry {
  file: File;
  previewUrl: string;
}

interface PhotoConsent {
  granted: boolean;
  grantedAt?: string;
  purpose: string;
}

export interface UploadRedesignState {
  uploadedFile: File | null;
  uploadedFileUrl: string | null;
  extractedData: ExtractedInvitationData | null;
  isExtracting: boolean;
  extractionError: string | null;
  photos: {
    bride?: PhotoEntry;
    groom?: PhotoEntry;
    couple?: PhotoEntry;
    venue?: PhotoEntry;
    additional?: PhotoEntry[];
  };
  photoConsents: {
    bride: PhotoConsent;
    groom: PhotoConsent;
    couple: PhotoConsent;
  };
  detectedLanguage: { code: string; name: string; confidence: number } | null;
  detectedRegion: string | null;
  detectedSubregion: string | null;
  detectedCeremony: string | null;
  detectedCity: string | null;
  redesignRequest: CelebrationProductionRequest | null;
}

const CONSENT_PURPOSE = 'I grant permission to use this photo for AI-generated video/image content in my celebration project';

const initialState: UploadRedesignState = {
  uploadedFile: null,
  uploadedFileUrl: null,
  extractedData: null,
  isExtracting: false,
  extractionError: null,
  photos: {},
  photoConsents: {
    bride: { granted: false, purpose: CONSENT_PURPOSE },
    groom: { granted: false, purpose: CONSENT_PURPOSE },
    couple: { granted: false, purpose: CONSENT_PURPOSE },
  },
  detectedLanguage: null,
  detectedRegion: null,
  detectedSubregion: null,
  detectedCeremony: null,
  detectedCity: null,
  redesignRequest: null,
};

// ─── LANGUAGE → REGION MAPPING ───────────────────────────────────────────────

const LANGUAGE_TO_REGION: Record<string, string> = {
  hi: 'INDIA', ta: 'INDIA', te: 'INDIA', kn: 'INDIA', ml: 'INDIA',
  gu: 'INDIA', mr: 'INDIA', bn: 'INDIA', pa: 'INDIA',
  ur: 'PAKISTAN', sd: 'PAKISTAN',
  ar: 'MENA', fa: 'MENA',
  tr: 'TURKEY',
  zh: 'CJK', ja: 'CJK', ko: 'CJK',
  th: 'SEA', vi: 'SEA', ms: 'SEA', id: 'SEA', fil: 'SEA',
  es: 'LATAM', pt: 'LATAM',
  sw: 'AFRICA', yo: 'AFRICA', ig: 'AFRICA', ha: 'AFRICA',
  ru: 'EURASIA', uk: 'EURASIA',
  en: 'NAM', fr: 'EU', de: 'EU', it: 'EU', nl: 'EU',
  ne: 'SOUTH_ASIA', si: 'SOUTH_ASIA',
  kk: 'CENTRAL_ASIA', uz: 'CENTRAL_ASIA', az: 'CENTRAL_ASIA',
};

// ─── HOOK ────────────────────────────────────────────────────────────────────

export function useCelebrationUploadRedesign() {
  const [state, setState] = useState<UploadRedesignState>(initialState);

  // ── Upload ──────────────────────────────────────────────────────────────

  const uploadInvitation = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      uploadedFile: file,
      uploadedFileUrl: URL.createObjectURL(file),
      isExtracting: true,
      extractionError: null,
      extractedData: null,
    }));

    try {
      // Upload file to Supabase storage
      const fileName = `uploads/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('celebrations')
        .upload(fileName, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('celebrations')
        .getPublicUrl(fileName);

      // Determine extraction strategy based on file type
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      const extractionPrompt = `Analyze this invitation/event card and extract ALL information as JSON:
{
  "names": { "bride": "", "groom": "", "host": "", "guest_of_honor": "" },
  "eventDate": "",
  "eventTime": "",
  "venue": "",
  "city": "",
  "location": "",
  "language": "detected language code (hi, ar, en, ta, etc.)",
  "scripts": ["detected scripts like Devanagari, Arabic, Latin, etc."],
  "ceremonyType": "wedding-traditional | baby-shower | graduation | etc.",
  "customMessage": "any custom message or quote on the card",
  "rsvpDetails": "",
  "originalColors": ["hex colors used in the design"],
  "originalStyle": "traditional | modern | minimalist | ornate",
  "confidence": 0.0-1.0,
  "rawText": "all text found on the card/document",
  "isMultiLanguage": true/false
}
Extract every detail visible. If a field is not found, leave it empty. Detect the primary language from the text.`;

      let extractionResult: any;
      let extractError: any;

      if (isPdf) {
        // PDF path: use document-processor for text extraction, then AI for structured parsing
        const docResult = await supabase.functions.invoke('document-processor', {
          body: { fileUrl: urlData.publicUrl, mimeType: 'application/pdf' },
        });

        if (docResult.error) throw new Error(`PDF processing failed: ${docResult.error.message}`);

        const pdfText = docResult.data?.text || docResult.data?.content || docResult.data?.extractedContent || '';
        if (!pdfText) throw new Error('Could not extract text from PDF');

        // Parse extracted text with AI
        const parseResult = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            action: 'generate_content',
            provider: 'gemini',
            prompt: `${extractionPrompt}\n\nHere is the extracted text from the invitation PDF:\n\n${pdfText}`,
          },
        });
        extractionResult = parseResult.data;
        extractError = parseResult.error;
      } else {
        // Image path: use vision model directly
        const result = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            action: 'vision-extract',
            imageUrl: urlData.publicUrl,
            prompt: extractionPrompt,
          },
        });
        extractionResult = result.data;
        extractError = result.error;
      }

      if (extractError) throw new Error(`Extraction failed: ${extractError.message}`);

      // Parse extraction result
      const extracted = parseExtractionResult(extractionResult);

      // Auto-detect region from language
      const detectedRegion = extracted.language
        ? LANGUAGE_TO_REGION[extracted.language] || null
        : null;

      setState(prev => ({
        ...prev,
        isExtracting: false,
        extractedData: extracted,
        detectedLanguage: extracted.language
          ? { code: extracted.language, name: extracted.language, confidence: extracted.confidence }
          : null,
        detectedRegion,
        detectedCeremony: extracted.ceremonyType || null,
        detectedCity: extracted.city || null,
      }));

      toast.success('Invitation analyzed successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Extraction failed';
      setState(prev => ({
        ...prev,
        isExtracting: false,
        extractionError: message,
      }));
      toast.error(message);
    }
  }, []);

  const clearUpload = useCallback(() => {
    setState(prev => ({
      ...prev,
      uploadedFile: null,
      uploadedFileUrl: null,
      extractedData: null,
      isExtracting: false,
      extractionError: null,
    }));
  }, []);

  // ── Photo Management ──────────────────────────────────────────────────

  const uploadPhoto = useCallback(async (role: 'bride' | 'groom' | 'couple' | 'venue', file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      photos: {
        ...prev.photos,
        [role]: { file, previewUrl },
      },
    }));
  }, []);

  const grantConsent = useCallback((role: string, purpose: string) => {
    setState(prev => ({
      ...prev,
      photoConsents: {
        ...prev.photoConsents,
        [role]: { granted: true, grantedAt: new Date().toISOString(), purpose },
      },
    }));
  }, []);

  const revokeConsent = useCallback((role: string) => {
    setState(prev => ({
      ...prev,
      photoConsents: {
        ...prev.photoConsents,
        [role]: { granted: false, purpose: CONSENT_PURPOSE },
      },
    }));
  }, []);

  const removePhoto = useCallback((role: string) => {
    setState(prev => {
      const photos = { ...prev.photos };
      delete photos[role as keyof typeof photos];
      return { ...prev, photos };
    });
  }, []);

  // ── Edit Extracted Data ───────────────────────────────────────────────

  const updateExtractedField = useCallback((field: string, value: string) => {
    setState(prev => {
      if (!prev.extractedData) return prev;
      return {
        ...prev,
        extractedData: { ...prev.extractedData, [field]: value },
      };
    });
  }, []);

  const overrideDetectedCeremony = useCallback((ceremonyId: string) => {
    setState(prev => ({ ...prev, detectedCeremony: ceremonyId }));
  }, []);

  const overrideDetectedRegion = useCallback((regionCode: string) => {
    setState(prev => ({ ...prev, detectedRegion: regionCode }));
  }, []);

  // ── Build Production Request ──────────────────────────────────────────

  const buildRedesignRequest = useCallback((
    format: CelebrationOutputFormat = 'invitation_video',
    language: string = 'en',
  ): CelebrationProductionRequest | null => {
    const { extractedData, detectedCeremony, detectedRegion, detectedCity, photos, photoConsents } = state;
    if (!extractedData || !detectedCeremony || !detectedRegion) return null;

    const personalization: CelebrationPersonalization = {
      names: extractedData.names,
      eventDate: extractedData.eventDate,
      eventTime: extractedData.eventTime,
      venue: extractedData.venue,
      venueAddress: extractedData.location,
      customMessage: extractedData.customMessage,
      rsvpDetails: extractedData.rsvpDetails,
    };

    const request: CelebrationProductionRequest = {
      ceremonyId: detectedCeremony,
      regionCode: detectedRegion,
      format,
      language: extractedData.language || language,
      city: detectedCity || extractedData.city || undefined,
      personalization,
      quality: 'production',
      isRedesign: true,
      originalInvitationData: extractedData as unknown as Record<string, unknown>,
      photos: {
        bride: photos.bride && photoConsents.bride.granted
          ? { url: photos.bride.previewUrl, consentGranted: true }
          : undefined,
        groom: photos.groom && photoConsents.groom.granted
          ? { url: photos.groom.previewUrl, consentGranted: true }
          : undefined,
        couple: photos.couple && photoConsents.couple.granted
          ? { url: photos.couple.previewUrl, consentGranted: true }
          : undefined,
        venue: photos.venue
          ? { url: photos.venue.previewUrl }
          : undefined,
      },
    };

    setState(prev => ({ ...prev, redesignRequest: request }));
    return request;
  }, [state]);

  return {
    uploadInvitation,
    clearUpload,
    uploadPhoto,
    grantConsent,
    revokeConsent,
    removePhoto,
    updateExtractedField,
    overrideDetectedCeremony,
    overrideDetectedRegion,
    buildRedesignRequest,
    state,
  };
}

// ─── PARSE HELPER ────────────────────────────────────────────────────────────

function parseExtractionResult(result: unknown): ExtractedInvitationData {
  const defaults: ExtractedInvitationData = {
    names: {}, eventDate: '', eventTime: '', venue: '', city: '',
    location: '', language: 'en', scripts: [], ceremonyType: '',
    customMessage: '', rsvpDetails: '', originalColors: [],
    originalStyle: 'traditional', confidence: 0, rawText: '',
    isMultiLanguage: false,
  };

  if (!result || typeof result !== 'object') return defaults;

  try {
    // Try to parse if it's a string (AI output)
    const data = typeof (result as Record<string, unknown>).content === 'string'
      ? JSON.parse((result as Record<string, unknown>).content as string)
      : result;

    return { ...defaults, ...data };
  } catch {
    return defaults;
  }
}
