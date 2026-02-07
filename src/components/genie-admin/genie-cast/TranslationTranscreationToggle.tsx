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

const TRANSLATION_PROVIDERS: Record<string, { name: string; type: 'literal' | 'cultural'; description: string }> = {
  deepl: { name: 'DeepL', type: 'literal', description: 'Fast literal translation, best for subtitles & metadata' },
  gemini: { name: 'Gemini 3 Pro', type: 'cultural', description: 'Cultural transcreation for India/SEA/Global regions' },
  claude: { name: 'Claude 4', type: 'cultural', description: 'Nuanced transcreation for Western markets' },
  'gpt-4o': { name: 'GPT-4o', type: 'cultural', description: 'High-quality transcreation for MENA/RTL content' },
  'qwen-max': { name: 'Qwen-Max', type: 'cultural', description: 'Native CJK transcreation with idiomatic accuracy' },
};

// Zone → recommended LLM for transcreation
const ZONE_TO_TRANSCREATION_PROVIDER: Record<string, string> = {
  'global': 'gemini',
  'india': 'gemini',
  'mena': 'gpt-4o',
  'cjk': 'qwen-max',
  'latam': 'claude',
  'europe': 'claude',
  'africa': 'gemini',
};

const TARGET_LANGUAGES = [
  { code: 'es', name: 'Spanish', region: 'latam' },
  { code: 'fr', name: 'French', region: 'europe' },
  { code: 'de', name: 'German', region: 'europe' },
  { code: 'ar', name: 'Arabic', region: 'mena' },
  { code: 'zh', name: 'Chinese (Simplified)', region: 'cjk' },
  { code: 'ja', name: 'Japanese', region: 'cjk' },
  { code: 'ko', name: 'Korean', region: 'cjk' },
  { code: 'hi', name: 'Hindi', region: 'india' },
  { code: 'te', name: 'Telugu', region: 'india' },
  { code: 'ta', name: 'Tamil', region: 'india' },
  { code: 'pt', name: 'Portuguese', region: 'latam' },
  { code: 'tr', name: 'Turkish', region: 'mena' },
  { code: 'ru', name: 'Russian', region: 'europe' },
  { code: 'id', name: 'Indonesian', region: 'india' },
];

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
    return ZONE_TO_TRANSCREATION_PROVIDER[targetRegion] || 'gemini';
  }, [region]);

  // Perform translation (DeepL)
  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'translate',
          provider: 'deepl',
          prompt: sourceText,
          context: {
            sourceLanguage,
            targetLanguage,
            mode: 'literal',
            taskType: 'translation',
          },
        },
      });

      if (error) throw error;

      const result: TranslationResult = {
        mode: 'translate',
        sourceText,
        targetText: data?.content || data?.result || '',
        sourceLanguage,
        targetLanguage,
        provider: 'DeepL',
        timestamp: new Date(),
      };

      setResults(prev => [result, ...prev]);
      onResult?.(result);
      toast.success('Translation complete (DeepL)');
    } catch (err) {
      console.error('[Translation] Error:', err);
      toast.error('Translation failed — check DeepL API key');
    } finally {
      setIsProcessing(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage, onResult]);

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

  return (
    <div className={cn("space-y-3", className)}>
      <Card>
        <CardHeader className={compact ? "pb-2 p-3" : "pb-3"}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn("flex items-center gap-2", compact ? "text-sm" : "text-base")}>
              <ArrowRightLeft className="h-4 w-4" />
              Translate vs Transcreate
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {mode === 'translate' ? 'Literal' : 'Cultural'}
            </Badge>
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
                Translate (DeepL)
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
              ? "bg-blue-500/5 border-blue-500/20" 
              : "bg-purple-500/5 border-purple-500/20"
          )}>
            {mode === 'translate' ? (
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-500" />
                <span><strong>DeepL</strong> — Fast literal translation, ideal for subtitles & metadata</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-purple-500" />
                <span>
                  <strong>{TRANSLATION_PROVIDERS[recommendedProvider]?.name}</strong> — {TRANSLATION_PROVIDERS[recommendedProvider]?.description}
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
