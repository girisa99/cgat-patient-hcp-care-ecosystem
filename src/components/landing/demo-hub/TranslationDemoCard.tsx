/**
 * Translation Demo Card — DeepL Translation sub-component for LocalizationDemoHub
 * 
 * Clean translation demo: source text → DeepL translation with side-by-side view.
 * Region-aware: defaults target language based on region.
 * Shows note about Translation vs Transcreation difference.
 */

import React, { useState } from 'react';
import { Languages, Loader2, ArrowRight, Copy, Check } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setTranslatedText('');

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
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isRTL = targetLang === 'AR';

  return (
    <Card className="border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 border-b border-border py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
            <Languages className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">DeepL Translation</h3>
            <p className="text-sm text-muted-foreground font-normal">
              Instant literal translation — compare with our Transcreation tab
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            Powered by DeepL
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
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

        {/* Input/Output side-by-side */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">
              Source Text
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste text to translate..."
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <span className="text-xs text-muted-foreground">{inputText.length}/1000</span>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">
              DeepL Translation
            </label>
            <div
              className={`min-h-[120px] p-3 rounded-md border border-border bg-muted/30 text-sm ${isRTL ? 'text-right' : ''}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Translating...
                </div>
              ) : translatedText ? (
                <p className="text-foreground">{translatedText}</p>
              ) : (
                <p className="text-muted-foreground italic">Translation will appear here...</p>
              )}
            </div>
            {translatedText && (
              <Button size="sm" variant="ghost" className="h-7 text-xs mt-1 gap-1" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
          </div>
        </div>

        {/* Translate button + note */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground max-w-xs">
            💡 This is <strong>literal translation</strong>. Switch to the <strong>Transcreation</strong> tab to see how Genie adapts meaning culturally.
          </p>
          <Button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
            Translate
          </Button>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default TranslationDemoCard;
