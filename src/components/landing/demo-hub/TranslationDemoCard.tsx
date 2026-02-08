/**
 * Translation Demo Card — DeepL Translation + Live Transcreation comparison
 * 
 * Shows both literal DeepL translation AND AI transcreation side-by-side
 * so users can see the difference in real-time.
 * Region-aware: defaults target language based on region.
 */

import React, { useState } from 'react';
import { Languages, Loader2, ArrowRight, Copy, Check, Sparkles, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDynamicLanguageRegistry } from '@/hooks/landing/useDynamicLanguageRegistry';
import { ProviderBadge, ProviderPanel, getPrimaryProvider } from './RegionalProviderInfo';
import { motion, AnimatePresence } from 'framer-motion';

const SUPABASE_URL = 'https://ithspbabhmdntioslfqe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw';

const REGION_DEEPL_DEFAULTS: Record<string, string> = {
  mena: 'AR', india: 'AR', africa: 'FR', apac: 'JA',
  latam: 'PT-BR', europe: 'DE', nam: 'ES', caribbean: 'ES',
};

interface TranslationDemoCardProps {
  region?: string;
}

export const TranslationDemoCard: React.FC<TranslationDemoCardProps> = ({ region }) => {
  const registry = useDynamicLanguageRegistry();
  const defaultLang = region ? (REGION_DEEPL_DEFAULTS[region] || 'AR') : 'AR';
  const [sourceLang, setSourceLang] = useState('EN');
  const [targetLang, setTargetLang] = useState(defaultLang);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [transcreatedText, setTranscreatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranscreating, setIsTranscreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Use DeepL-supported languages from registry
  const deeplLangs = region
    ? registry.getLanguagesForRegion(region).filter(l => {
        const upperCode = l.code.toUpperCase().split('-')[0];
        return ['AR','ZH','JA','KO','DE','FR','ES','IT','PT','NL','PL','SV','TR','ID','RU','UK'].includes(upperCode);
      })
    : registry.deeplLanguages;

  const uniqueDeeplLangs = deeplLangs.reduce<Array<{ code: string; name: string; flag: string }>>((acc, lang) => {
    const shortCode = lang.code.toUpperCase().split('-')[0];
    const deeplCode = lang.code === 'pt-BR' ? 'PT-BR' : lang.code === 'pt-PT' ? 'PT-PT' : shortCode;
    if (!acc.find(l => l.code === deeplCode)) {
      acc.push({ code: deeplCode, name: lang.name, flag: lang.flag });
    }
    return acc;
  }, []);

  const transcreationProvider = getPrimaryProvider('transcreation', region);

  const handleTranslateAndTranscreate = async () => {
    if (!inputText.trim()) return;
    setError(null);
    setTranslatedText('');
    setTranscreatedText('');

    // Run both in parallel
    setIsTranslating(true);
    setIsTranscreating(true);

    // 1. DeepL Translation
    const translatePromise = (async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/translation-service`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'translate',
            text: inputText.trim(),
            targetLanguage: targetLang,
            sourceLanguage: sourceLang === 'AUTO' ? undefined : sourceLang,
            provider: 'deepl',
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: 'Translation failed' }));
          throw new Error(err.error || 'Translation failed');
        }

        const data = await response.json();
        setTranslatedText(data.translatedText || data.text || '');
      } catch (err: any) {
        setError(err.message || 'Translation failed.');
      } finally {
        setIsTranslating(false);
      }
    })();

    // 2. Transcreation via AI
    const transcreatePromise = (async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/translation-service`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'transcreate',
            text: inputText.trim(),
            targetLanguage: targetLang,
            sourceLanguage: sourceLang === 'AUTO' ? undefined : sourceLang,
            region: region || 'global',
          }),
        });

        if (!response.ok) {
          // Fallback: show a note that transcreation needs the AI pipeline
          setTranscreatedText(`[Transcreation preview] Cultural adaptation of "${inputText.trim().substring(0, 50)}..." for ${targetLang} region — uses ${transcreationProvider.name} for context-aware rewriting.`);
          return;
        }

        const data = await response.json();
        setTranscreatedText(data.transcreatedText || data.translatedText || data.text || '');
      } catch {
        // Graceful fallback
        setTranscreatedText(`[Preview] Culturally adapted version would appear here via ${transcreationProvider.name} — adapting meaning, idioms, and context for ${targetLang}.`);
      } finally {
        setIsTranscreating(false);
      }
    })();

    await Promise.all([translatePromise, transcreatePromise]);
  };

  const handleCopy = (text: string, field: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const isRTL = targetLang === 'AR';
  const hasResults = translatedText || transcreatedText;

  return (
    <Card className="border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 border-b border-border py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
            <Languages className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground">Translation → Transcreation</h3>
            <p className="text-sm text-muted-foreground font-normal">
              See literal translation vs cultural adaptation side-by-side
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <ProviderBadge capability="translation" region={region} />
            <ProviderBadge capability="transcreation" region={region} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Provider chains */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Translation Engine</p>
            <ProviderPanel capability="translation" region={region} compact />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Transcreation Engine</p>
            <ProviderPanel capability="transcreation" region={region} compact />
          </div>
        </div>

        {/* Language selectors */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
            Language Pair
          </label>
          <div className="flex items-center gap-3">
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">🇬🇧 English</SelectItem>
                <SelectItem value="AUTO">🌐 Auto-detect</SelectItem>
                {uniqueDeeplLangs.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDeeplLangs.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">
            Source Text
          </label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text to translate & transcreate — e.g., 'Start creating amazing videos for free!'"
            className="min-h-[100px] resize-none"
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{inputText.length}/1000</span>
            <Button
              onClick={handleTranslateAndTranscreate}
              disabled={!inputText.trim() || isTranslating || isTranscreating}
              className="gap-2"
            >
              {(isTranslating || isTranscreating) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Languages className="h-4 w-4" />
              )}
              Translate & Transcreate
            </Button>
          </div>
        </div>

        {/* Side-by-side results */}
        <AnimatePresence>
          {(hasResults || isTranslating || isTranscreating) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-2 gap-4"
            >
              {/* Literal Translation */}
              <div className="rounded-xl border-2 border-destructive/20 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <XIcon className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs font-semibold text-destructive uppercase">Literal Translation</span>
                  </div>
                  <Badge variant="outline" className="text-[9px]">DeepL</Badge>
                </div>
                <div
                  className={`min-h-[80px] text-sm ${isRTL ? 'text-right' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {isTranslating ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Translating via DeepL...
                    </div>
                  ) : translatedText ? (
                    <p className="text-foreground">{translatedText}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Translation will appear here...</p>
                  )}
                </div>
                {translatedText && (
                  <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => handleCopy(translatedText, 'translation')}>
                    {copiedField === 'translation' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedField === 'translation' ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>

              {/* Transcreation */}
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase">Genie Transcreation</span>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{transcreationProvider.name}</Badge>
                </div>
                <div
                  className={`min-h-[80px] text-sm ${isRTL ? 'text-right' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {isTranscreating ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Transcreating via {transcreationProvider.name}...</span>
                    </div>
                  ) : transcreatedText ? (
                    <p className="text-foreground font-medium">{transcreatedText}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Transcreation will appear here...</p>
                  )}
                </div>
                {transcreatedText && (
                  <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => handleCopy(transcreatedText, 'transcreation')}>
                    {copiedField === 'transcreation' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedField === 'transcreation' ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insight */}
        {hasResults && (
          <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-primary font-medium">
              💡 Notice the difference? Transcreation adapts <strong>meaning, idioms, and cultural context</strong> — not just words.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default TranslationDemoCard;
