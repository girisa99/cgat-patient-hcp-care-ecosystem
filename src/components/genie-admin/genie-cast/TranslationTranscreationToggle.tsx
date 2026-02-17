/**
 * TranslationTranscreationToggle
 * 
 * Differentiates between:
 * - Translation (DeepL): Literal, fast, cheap — for subtitles/metadata
 * - Transcreation (LLM): Cultural adaptation via zone-routed LLM — for scripts/messaging
 * 
 * Routes transcreation through ai-universal-processor with zone context.
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Languages,
  Globe,
  Sparkles,
  Loader2,
  Copy,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Zap,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPES
// ============================================

export type TranslationMode = 'translate' | 'transcreate';

interface TranslationResult {
  mode: TranslationMode;
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
  confidence?: number;
  culturalNotes?: string;
  timestamp: Date;
}

interface TranslationTranscreationToggleProps {
  /** Source text to translate/transcreate */
  sourceText?: string;
  /** Source language code */
  sourceLanguage?: string;
  /** Callback when translation/transcreation completes */
  onResult?: (result: TranslationResult) => void;
  /** Regional zone for LLM routing */
  region?: string;
  /** Compact mode for embedding in other panels */
  compact?: boolean;
  className?: string;
}

// ============================================
// PROVIDER MAPPING
// ============================================

/**
 * ═══════════════════════════════════════════════════════════════
 * FROZEN ROUTING CONFIGURATIONS — DO NOT MODIFY
 * All provider mappings are Object.freeze() locked.
 * Changes require governance approval + all 7 docs updated.
 * ═══════════════════════════════════════════════════════════════
 */

const TRANSLATION_PROVIDERS = Object.freeze({
  deepl: Object.freeze({ name: 'DeepL', type: 'literal' as const, description: 'Fast literal translation — supports Arabic, Hebrew, but NOT Urdu/Farsi', rtlSupport: ['ar', 'he'] }),
  'azure-translator': Object.freeze({ name: 'Azure Translator', type: 'literal' as const, description: 'RTL fallback for Urdu, Farsi, and other DeepL-unsupported languages', rtlSupport: ['ar', 'he', 'ur', 'fa', 'ps'] }),
  gemini: Object.freeze({ name: 'Gemini 3 Pro', type: 'cultural' as const, description: 'Cultural transcreation for India/SEA/Africa/Global (Gemini Zone)', rtlSupport: [] }),
  claude: Object.freeze({ name: 'Claude 4', type: 'cultural' as const, description: 'Nuanced transcreation for Western/European markets (Claude Zone)', rtlSupport: [] }),
  'qwen-max': Object.freeze({ name: 'Qwen-Max', type: 'cultural' as const, description: 'Native CJK & MENA/RTL transcreation with idiomatic accuracy (Alibaba Zone)', rtlSupport: ['ar', 'he', 'fa', 'ur'] }),
  'gpt-4o': Object.freeze({ name: 'GPT-4o', type: 'cultural' as const, description: 'Universal FALLBACK ONLY — never primary for any zone', rtlSupport: ['ar', 'he', 'fa', 'ur'] }),
  'deepseek-v3': Object.freeze({ name: 'DeepSeek V3', type: 'cultural' as const, description: 'Technical/code transcreation specialist', rtlSupport: [] }),
});

/**
 * Zone → recommended LLM for transcreation (FROZEN)
 * - Claude Zone (Western/EU/LATAM) → Claude 4
 * - Alibaba Zone (CJK/MENA) → Qwen-Max
 * - Gemini Zone (India/SEA/Africa) → Gemini 3 Pro
 * - GPT-4o → FALLBACK ONLY (never primary)
 */
const ZONE_TO_TRANSCREATION_PROVIDER = Object.freeze({
  'western': 'claude',
  'europe': 'claude',
  'latam': 'claude',
  'cjk': 'qwen-max',
  'mena': 'qwen-max',
  'india': 'gemini',
  'sea': 'gemini',
  'africa': 'gemini',
  'global': 'gemini',
} as const);

/**
 * RTL languages that require right-to-left layout (FROZEN)
 */
const RTL_LANGUAGE_CODES = Object.freeze(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ku', 'yi'] as const);

/**
 * DeepL supported language codes (FROZEN — verified Feb 2026)
 * NOTE: Urdu, Farsi, Pashto NOT supported by DeepL → Azure Translator fallback
 */
const DEEPL_SUPPORTED_CODES = Object.freeze([
  'ar', 'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr',
  'he', 'hu', 'id', 'it', 'ja', 'ko', 'lt', 'lv', 'nb', 'nl', 'pl',
  'pt', 'ro', 'ru', 'sk', 'sl', 'sv', 'th', 'tr', 'uk', 'vi', 'zh',
] as const);

const TARGET_LANGUAGES = Object.freeze([
  // Western / Europe / LATAM (Claude Zone)
  { code: 'es', name: 'Spanish', region: 'latam', rtl: false, deeplSupported: true },
  { code: 'pt', name: 'Portuguese (BR)', region: 'latam', rtl: false, deeplSupported: true },
  { code: 'fr', name: 'French', region: 'europe', rtl: false, deeplSupported: true },
  { code: 'de', name: 'German', region: 'europe', rtl: false, deeplSupported: true },
  { code: 'it', name: 'Italian', region: 'europe', rtl: false, deeplSupported: true },
  { code: 'ru', name: 'Russian', region: 'europe', rtl: false, deeplSupported: true },
  { code: 'nl', name: 'Dutch', region: 'europe', rtl: false, deeplSupported: true },
  { code: 'pl', name: 'Polish', region: 'europe', rtl: false, deeplSupported: true },
  // CJK (Alibaba Zone → Qwen-Max)
  { code: 'zh', name: 'Chinese (Simplified)', region: 'cjk', rtl: false, deeplSupported: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', region: 'cjk', rtl: false, deeplSupported: true },
  { code: 'ja', name: 'Japanese', region: 'cjk', rtl: false, deeplSupported: true },
  { code: 'ko', name: 'Korean', region: 'cjk', rtl: false, deeplSupported: true },
  // MENA / RTL (Alibaba Zone → Qwen-Max)
  { code: 'ar', name: 'Arabic (7 dialects)', region: 'mena', rtl: true, deeplSupported: true },
  { code: 'he', name: 'Hebrew (Israeli)', region: 'mena', rtl: true, deeplSupported: true },
  { code: 'tr', name: 'Turkish', region: 'mena', rtl: false, deeplSupported: true },
  { code: 'fa', name: 'Farsi/Persian', region: 'mena', rtl: true, deeplSupported: false },
  // India / South Asia (Gemini Zone) — 11 official languages
  { code: 'hi', name: 'Hindi', region: 'india', rtl: false, deeplSupported: false },
  { code: 'bn', name: 'Bengali (Bangladesh)', region: 'india', rtl: false, deeplSupported: false },
  { code: 'te', name: 'Telugu', region: 'india', rtl: false, deeplSupported: false },
  { code: 'ta', name: 'Tamil', region: 'india', rtl: false, deeplSupported: false },
  { code: 'mr', name: 'Marathi', region: 'india', rtl: false, deeplSupported: false },
  { code: 'gu', name: 'Gujarati', region: 'india', rtl: false, deeplSupported: false },
  { code: 'kn', name: 'Kannada', region: 'india', rtl: false, deeplSupported: false },
  { code: 'ml', name: 'Malayalam', region: 'india', rtl: false, deeplSupported: false },
  { code: 'pa', name: 'Punjabi', region: 'india', rtl: false, deeplSupported: false },
  { code: 'or', name: 'Odia', region: 'india', rtl: false, deeplSupported: false },
  { code: 'as', name: 'Assamese', region: 'india', rtl: false, deeplSupported: false },
  { code: 'ur', name: 'Urdu (Pakistan)', region: 'india', rtl: true, deeplSupported: false },
  // SEA (Gemini Zone)
  { code: 'id', name: 'Indonesian', region: 'sea', rtl: false, deeplSupported: true },
  { code: 'ms', name: 'Malay', region: 'sea', rtl: false, deeplSupported: false },
  { code: 'th', name: 'Thai', region: 'sea', rtl: false, deeplSupported: true },
  { code: 'vi', name: 'Vietnamese', region: 'sea', rtl: false, deeplSupported: true },
  { code: 'tl', name: 'Filipino/Tagalog', region: 'sea', rtl: false, deeplSupported: false },
  // Africa (Gemini Zone)
  { code: 'sw', name: 'Swahili', region: 'africa', rtl: false, deeplSupported: false },
  { code: 'yo', name: 'Yoruba', region: 'africa', rtl: false, deeplSupported: false },
  { code: 'am', name: 'Amharic', region: 'africa', rtl: false, deeplSupported: false },
]);

// ============================================
// COMPONENT
// ============================================

export function TranslationTranscreationToggle({
  sourceText: initialSourceText = '',
  sourceLanguage = 'en',
  onResult,
  region = 'global',
  compact = false,
  className,
}: TranslationTranscreationToggleProps) {
  const [mode, setMode] = useState<TranslationMode>('transcreate');
  const [sourceText, setSourceText] = useState(initialSourceText);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<TranslationResult[]>([]);

  // Get recommended transcreation provider based on region/target language
  const getRecommendedProvider = useCallback((targetLang: string): string => {
    const langConfig = TARGET_LANGUAGES.find(l => l.code === targetLang);
    const targetRegion = langConfig?.region || region;
    return ZONE_TO_TRANSCREATION_PROVIDER[targetRegion as keyof typeof ZONE_TO_TRANSCREATION_PROVIDER] || 'gemini';
  }, [region]);

  // Get translation provider: DeepL if supported, Azure Translator as fallback
  const getTranslationProvider = useCallback((targetLang: string): 'deepl' | 'azure-translator' => {
    const langConfig = TARGET_LANGUAGES.find(l => l.code === targetLang);
    return langConfig?.deeplSupported ? 'deepl' : 'azure-translator';
  }, []);

  // Check if target language is RTL
  const isRTL = useCallback((targetLang: string): boolean => {
    const baseCode = targetLang.split('-')[0];
    return RTL_LANGUAGE_CODES.includes(baseCode as any);
  }, []);

  // Perform translation (DeepL or Azure Translator)
  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setIsProcessing(true);

    try {
      const translationProvider = getTranslationProvider(targetLanguage);
      const rtlFlag = isRTL(targetLanguage);

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'translate',
          provider: translationProvider,
          prompt: sourceText,
          context: {
            sourceLanguage,
            targetLanguage,
            mode: 'literal',
            taskType: 'translation',
            rtl: rtlFlag,
          },
        },
      });

      if (error) throw error;

      const providerName = translationProvider === 'deepl' ? 'DeepL' : 'Azure Translator';
      const result: TranslationResult = {
        mode: 'translate',
        sourceText,
        targetText: data?.content || data?.result || '',
        sourceLanguage,
        targetLanguage,
        provider: providerName,
        timestamp: new Date(),
      };

      setResults(prev => [result, ...prev]);
      onResult?.(result);
      toast.success(`Translation complete (${providerName}${rtlFlag ? ' • RTL' : ''})`);
    } catch (err) {
      console.error('[Translation] Error:', err);
      toast.error('Translation failed — check API configuration');
    } finally {
      setIsProcessing(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage, onResult, getTranslationProvider, isRTL]);

  // Perform transcreation (zone-routed LLM)
  const handleTranscreate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setIsProcessing(true);

    try {
      const provider = getRecommendedProvider(targetLanguage);
      const langName = TARGET_LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage;
      
      const systemPrompt = `You are a marketing transcreation expert. Your task is NOT to translate literally, but to CULTURALLY ADAPT the content for ${langName}-speaking audiences.

Key transcreation rules:
1. Adapt idioms, metaphors, and cultural references to resonate locally
2. Preserve the emotional impact and marketing intent
3. Use local expressions and communication styles
4. Adjust humor, formality, and persuasion techniques for the target culture
5. Keep brand names and technical terms unchanged
6. Maintain the same script length (±10% word count)

Source language: ${sourceLanguage}
Target language: ${langName} (${targetLanguage})
Regional context: ${region}

Return ONLY the transcreated text, followed by a line break and "---CULTURAL NOTES---" then brief notes on adaptations made.`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate',
          provider,
          prompt: `Transcreate this marketing content:\n\n"${sourceText}"`,
          systemPrompt,
          temperature: 0.7,
          maxTokens: 1000,
          context: {
            sourceLanguage,
            targetLanguage,
            region,
            mode: 'transcreation',
            taskType: 'transcreation',
          },
        },
      });

      if (error) throw error;

      const rawContent = data?.content || data?.result || '';
      const [targetText, ...notesParts] = rawContent.split('---CULTURAL NOTES---');
      const culturalNotes = notesParts.join('').trim();

      const result: TranslationResult = {
        mode: 'transcreate',
        sourceText,
        targetText: targetText.trim(),
        sourceLanguage,
        targetLanguage,
        provider: TRANSLATION_PROVIDERS[provider]?.name || provider,
        culturalNotes: culturalNotes || undefined,
        timestamp: new Date(),
      };

      setResults(prev => [result, ...prev]);
      onResult?.(result);
      toast.success(`Transcreation complete (${TRANSLATION_PROVIDERS[provider]?.name || provider})`);
    } catch (err) {
      console.error('[Transcreation] Error:', err);
      toast.error('Transcreation failed');
    } finally {
      setIsProcessing(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage, region, getRecommendedProvider, onResult]);

  const handleProcess = mode === 'translate' ? handleTranslate : handleTranscreate;

  const recommendedProvider = getRecommendedProvider(targetLanguage);
  const translationProvider = getTranslationProvider(targetLanguage);
  const targetIsRTL = isRTL(targetLanguage);
  const selectedLangConfig = TARGET_LANGUAGES.find(l => l.code === targetLanguage);

  return (
    <div className={cn("space-y-3", className)}>
      <Card>
        <CardHeader className={compact ? "pb-2 p-3" : "pb-3"}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn("flex items-center gap-2", compact ? "text-sm" : "text-base")}>
              <ArrowRightLeft className="h-4 w-4" />
              Translate vs Transcreate
            </CardTitle>
            <div className="flex items-center gap-1">
              {targetIsRTL && (
                <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">RTL</Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {mode === 'translate' ? 'Literal' : 'Cultural'}
              </Badge>
              <Badge variant="secondary" className="text-[9px]">🔒 Locked</Badge>
            </div>
          </div>
          {!compact && (
            <CardDescription className="text-xs">
              Translation = literal text conversion. Transcreation = cultural adaptation with local idioms.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className={compact ? "p-3 pt-0" : ""}>
          {/* Mode Toggle */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as TranslationMode)} className="mb-3">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="translate" className="text-xs gap-1.5">
                <Zap className="h-3 w-3" />
                {translationProvider === 'deepl' ? 'Translate (DeepL)' : 'Translate (Azure)'}
              </TabsTrigger>
              <TabsTrigger value="transcreate" className="text-xs gap-1.5">
                <Brain className="h-3 w-3" />
                Transcreate (AI)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Provider Info */}
          <div className={cn(
            "p-2 rounded-md border text-xs mb-3",
            mode === 'translate' 
              ? "bg-primary/5 border-primary/20" 
              : "bg-accent/10 border-accent/20"
          )}>
            {mode === 'translate' ? (
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>
                  <strong>{translationProvider === 'deepl' ? 'DeepL' : 'Azure Translator'}</strong>
                  {translationProvider === 'azure-translator' 
                    ? ' — RTL/Indic fallback (DeepL unsupported for this language)'
                    : ' — Fast literal translation, ideal for subtitles & metadata'
                  }
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-primary" />
                <span>
                  <strong>{TRANSLATION_PROVIDERS[recommendedProvider as keyof typeof TRANSLATION_PROVIDERS]?.name}</strong> — {TRANSLATION_PROVIDERS[recommendedProvider as keyof typeof TRANSLATION_PROVIDERS]?.description}
                </span>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="space-y-1">
              <Label className="text-xs">Source</Label>
              <Select value={sourceLanguage} disabled>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Target</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        {lang.name}
                        <Badge variant="outline" className="text-[9px] h-3.5">{lang.region}</Badge>
                        {lang.rtl && <Badge variant="outline" className="text-[9px] h-3.5 border-primary/30 text-primary">RTL</Badge>}
                        {!lang.deeplSupported && mode === 'translate' && (
                          <Badge variant="secondary" className="text-[9px] h-3.5">Azure</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Source Text Input */}
          <div className="space-y-1 mb-3">
            <Label className="text-xs">Source Text</Label>
            <Textarea
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
              placeholder="Enter marketing copy, script, or messaging to process..."
              className="h-20 text-xs resize-none"
            />
          </div>

          {/* Action Button */}
          <Button
            onClick={handleProcess}
            disabled={!sourceText.trim() || isProcessing}
            className="w-full"
            size="sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                {mode === 'translate' ? 'Translating...' : 'Transcreating...'}
              </>
            ) : (
              <>
                {mode === 'translate' ? (
                  <Languages className="h-3.5 w-3.5 mr-2" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                )}
                {mode === 'translate' ? 'Translate' : 'Transcreate'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Results ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3">
                {results.map((result, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={result.mode === 'translate' ? 'secondary' : 'default'} className="text-[10px]">
                          {result.mode === 'translate' ? 'Translation' : 'Transcreation'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {result.sourceLanguage} → {result.targetLanguage}
                        </span>
                        <Badge variant="outline" className="text-[9px]">{result.provider}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          navigator.clipboard.writeText(result.targetText);
                          toast.success('Copied to clipboard');
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-foreground">{result.targetText}</p>
                    {result.culturalNotes && (
                      <div className="p-2 bg-purple-500/5 rounded-md border border-purple-500/20">
                        <p className="text-[10px] text-muted-foreground">
                          <strong>Cultural Notes:</strong> {result.culturalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TranslationTranscreationToggle;
