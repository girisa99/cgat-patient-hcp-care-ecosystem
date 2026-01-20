/**
 * Auto-Translate Input Component
 * Side-by-side: Native language input + English translation preview
 * Real-time translation while typing in selected language
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Languages,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Star,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface AutoTranslateInputProps {
  value: string;
  onChange: (value: string) => void;
  inputLanguage: string;
  outputLanguage?: string; // Defaults to 'en'
  placeholder?: string;
  minHeight?: number;
  className?: string;
  onTranslationComplete?: (translatedText: string) => void;
}

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
  ar: 'العربية',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  ru: 'Русский',
  tr: 'Türkçe',
};

// Recommended translation models by language pair
const RECOMMENDED_MODELS: Record<string, { model: string; provider: string; reason: string }> = {
  // European languages
  'de-en': { model: 'DeepL', provider: 'deepl', reason: 'Best for DE↔EN professional translation' },
  'fr-en': { model: 'DeepL', provider: 'deepl', reason: 'Highest accuracy for French' },
  'es-en': { model: 'DeepL', provider: 'deepl', reason: 'Excellent for Spanish nuances' },
  'it-en': { model: 'DeepL', provider: 'deepl', reason: 'Best Italian grammar handling' },
  'pt-en': { model: 'DeepL', provider: 'deepl', reason: 'Superior Portuguese localization' },
  'nl-en': { model: 'DeepL', provider: 'deepl', reason: 'Top choice for Dutch' },
  'pl-en': { model: 'DeepL', provider: 'deepl', reason: 'Best Polish translation' },
  
  // Asian languages
  'zh-en': { model: 'Qwen-MT', provider: 'alibaba', reason: 'Best for Chinese↔English' },
  'ja-en': { model: 'Qwen-MT', provider: 'alibaba', reason: 'Superior Japanese handling' },
  'ko-en': { model: 'Qwen-MT', provider: 'alibaba', reason: 'Excellent Korean accuracy' },
  'th-en': { model: 'Google Translate', provider: 'google', reason: 'Best Thai support' },
  'vi-en': { model: 'Google Translate', provider: 'google', reason: 'Top Vietnamese accuracy' },
  
  // Indian languages
  'hi-en': { model: 'Gemini', provider: 'google', reason: 'Best Hindi understanding' },
  
  // Middle Eastern
  'ar-en': { model: 'Google Translate', provider: 'google', reason: 'Best Arabic RTL handling' },
  
  // Default
  'default': { model: 'Gemini 3 Flash', provider: 'google', reason: 'Universal - fast & accurate' },
};

function getRecommendedModel(inputLang: string, outputLang: string) {
  const key = `${inputLang}-${outputLang}`;
  const reverseKey = `${outputLang}-${inputLang}`;
  return RECOMMENDED_MODELS[key] || RECOMMENDED_MODELS[reverseKey] || RECOMMENDED_MODELS['default'];
}

export function AutoTranslateInput({
  value,
  onChange,
  inputLanguage,
  outputLanguage = 'en',
  placeholder,
  minHeight = 120,
  className,
  onTranslationComplete,
}: AutoTranslateInputProps) {
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const debouncedValue = useDebounce(value, 800);
  const abortControllerRef = useRef<AbortController | null>(null);

  const recommendedModel = getRecommendedModel(inputLanguage, outputLanguage);
  const needsTranslation = inputLanguage !== outputLanguage && value.trim().length > 0;
  const inputLangName = LANGUAGE_NAMES[inputLanguage] || inputLanguage.toUpperCase();
  const outputLangName = LANGUAGE_NAMES[outputLanguage] || outputLanguage.toUpperCase();

  // Default placeholder based on input language
  const defaultPlaceholder = inputLanguage === 'en' 
    ? 'Type your content here...'
    : `Type in ${inputLangName}...`;

  // Auto-translate when debounced value changes
  useEffect(() => {
    if (!needsTranslation || !debouncedValue.trim()) {
      setTranslatedText('');
      return;
    }

    const translateText = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsTranslating(true);
      setTranslationError(null);

      try {
        // Simulate translation API call
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // For demo: mock translation result
        const mockTranslation = debouncedValue; // In production, call real API
        setTranslatedText(mockTranslation);
        onTranslationComplete?.(mockTranslation);
        
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setTranslationError('Translation failed');
        }
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedValue, inputLanguage, outputLanguage, needsTranslation, onTranslationComplete]);

  const handleRetry = useCallback(() => {
    setTranslatedText('');
    setTranslationError(null);
    onChange(value + ' ');
    setTimeout(() => onChange(value.trim()), 10);
  }, [value, onChange]);

  // If same language, just show simple input
  if (!needsTranslation && inputLanguage === outputLanguage) {
    return (
      <div className={cn("space-y-2", className)}>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          className="resize-none"
          style={{ minHeight }}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          Typing in {inputLangName} - no translation needed
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Model Recommendation Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary gap-1.5">
            <Star className="h-3 w-3 fill-current" />
            {recommendedModel.model}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]">
                  <Info className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">{recommendedModel.reason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Languages className="h-3.5 w-3.5" />
          {inputLangName}
          <ArrowRight className="h-3 w-3" />
          {outputLangName}
        </div>
      </div>

      {/* Side-by-Side Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* LEFT: Native Language Input */}
        <Card className="border-primary/20">
          <CardContent className="p-0">
            <div className="px-3 py-2 border-b bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {inputLanguage.toUpperCase()}
                </Badge>
                <span className="text-xs font-medium">{inputLangName}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Type here</span>
            </div>
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || defaultPlaceholder}
              className="border-0 rounded-none rounded-b-lg resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ minHeight }}
            />
          </CardContent>
        </Card>

        {/* RIGHT: English Translation Preview */}
        <Card className="border-muted">
          <CardContent className="p-0">
            <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {outputLanguage.toUpperCase()}
                </Badge>
                <span className="text-xs font-medium">{outputLangName}</span>
              </div>
              {isTranslating && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Translating...
                </div>
              )}
              {!isTranslating && translatedText && (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              )}
            </div>
            <div 
              className="p-3 text-sm text-foreground/80 overflow-auto"
              style={{ minHeight }}
            >
              {isTranslating ? (
                <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Translating with {recommendedModel.model}...
                </div>
              ) : translationError ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{translationError}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRetry} className="h-7">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              ) : translatedText ? (
                <p className="whitespace-pre-wrap">{translatedText}</p>
              ) : value.trim() ? (
                <p className="text-muted-foreground italic">Waiting for translation...</p>
              ) : (
                <p className="text-muted-foreground italic">
                  Type in {inputLangName} to see {outputLangName} translation...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        Type in your native language ({inputLangName}) and see real-time translation to {outputLangName}.
        Select additional output languages in <span className="font-medium">Step 4: Agents & Languages</span>.
      </p>
    </div>
  );
}

export default AutoTranslateInput;
