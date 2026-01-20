/**
 * Auto-Translate Input Component
 * Features: Expandable popup modal for comfortable typing
 * Uses REAL translation-service edge function (not mock data)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Maximize2,
  Send,
  PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { InlineTrainAIFeedback } from '@/components/genie-studio/InlineTrainAIFeedback';

interface AutoTranslateInputProps {
  value: string;
  onChange: (value: string) => void;
  inputLanguage: string;
  outputLanguage?: string;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  onTranslationComplete?: (translatedText: string) => void;
  onSubmit?: () => void;
}

// Language display names (native)
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
  bn: 'বাংলা',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
};

// Native placeholders - "Type your content here" in each language
const NATIVE_PLACEHOLDERS: Record<string, string> = {
  en: 'Type your content here...',
  de: 'Geben Sie hier Ihren Inhalt ein...',
  fr: 'Tapez votre contenu ici...',
  es: 'Escriba su contenido aquí...',
  it: 'Scrivi il tuo contenuto qui...',
  pt: 'Digite seu conteúdo aqui...',
  nl: 'Typ hier uw inhoud...',
  pl: 'Wpisz tutaj swoją treść...',
  zh: '在此输入您的内容...',
  ja: 'ここにコンテンツを入力してください...',
  ko: '여기에 내용을 입력하세요...',
  hi: 'यहां अपनी सामग्री टाइप करें...',
  ar: 'اكتب محتواك هنا...',
  th: 'พิมพ์เนื้อหาของคุณที่นี่...',
  vi: 'Nhập nội dung của bạn tại đây...',
  ru: 'Введите ваш контент здесь...',
  tr: 'İçeriğinizi buraya yazın...',
  bn: 'এখানে আপনার কন্টেন্ট টাইপ করুন...',
  ta: 'உங்கள் உள்ளடக்கத்தை இங்கே தட்டச்சு செய்யவும்...',
  te: 'మీ కంటెంట్‌ను ఇక్కడ టైప్ చేయండి...',
  mr: 'तुमची सामग्री येथे टाइप करा...',
  gu: 'તમારી સામગ્રી અહીં ટાઇપ કરો...',
  id: 'Ketik konten Anda di sini...',
  ms: 'Taip kandungan anda di sini...',
};

// Native "Type here" labels
const NATIVE_TYPE_HERE: Record<string, string> = {
  en: 'Type here',
  de: 'Hier eingeben',
  fr: 'Tapez ici',
  es: 'Escriba aquí',
  it: 'Scrivi qui',
  pt: 'Digite aqui',
  nl: 'Typ hier',
  pl: 'Wpisz tutaj',
  zh: '在此输入',
  ja: 'ここに入力',
  ko: '여기에 입력',
  hi: 'यहां टाइप करें',
  ar: 'اكتب هنا',
  th: 'พิมพ์ที่นี่',
  vi: 'Nhập tại đây',
  ru: 'Введите здесь',
  tr: 'Buraya yazın',
  bn: 'এখানে টাইপ করুন',
  ta: 'இங்கே தட்டச்சு செய்க',
  te: 'ఇక్కడ టైప్ చేయండి',
  mr: 'येथे टाइप करा',
  gu: 'અહીં ટાઇપ કરો',
  id: 'Ketik di sini',
  ms: 'Taip di sini',
};

// Provider recommendations based on language pairs (now using real providers)
const PROVIDER_RECOMMENDATIONS: Record<string, { provider: string; model: string; reason: string }> = {
  // European languages - DeepL is best
  'de-en': { provider: 'deepl', model: 'DeepL Pro', reason: 'Best for DE↔EN' },
  'fr-en': { provider: 'deepl', model: 'DeepL Pro', reason: 'Highest accuracy for French' },
  'es-en': { provider: 'deepl', model: 'DeepL Pro', reason: 'Excellent for Spanish' },
  'it-en': { provider: 'deepl', model: 'DeepL Pro', reason: 'Excellent for Italian' },
  'nl-en': { provider: 'deepl', model: 'DeepL Pro', reason: 'Excellent for Dutch' },
  'pl-en': { provider: 'deepl', model: 'DeepL Pro', reason: 'Excellent for Polish' },
  'ru-en': { provider: 'deepl', model: 'DeepL Pro', reason: 'Excellent for Russian' },
  
  // CJK languages - Alibaba/Qwen-MT is best
  'zh-en': { provider: 'alibaba', model: 'Qwen-MT', reason: 'Best for Chinese↔English' },
  'ja-en': { provider: 'alibaba', model: 'Qwen-MT', reason: 'Superior Japanese handling' },
  'ko-en': { provider: 'alibaba', model: 'Qwen-MT', reason: 'Excellent Korean accuracy' },
  
  // Indian languages - Lovable AI (Gemini) is best
  'hi-en': { provider: 'lovable', model: 'Gemini 3 Flash', reason: 'Best Hindi understanding' },
  'te-en': { provider: 'lovable', model: 'Gemini 3 Flash', reason: 'Best Telugu understanding' },
  'ta-en': { provider: 'lovable', model: 'Gemini 3 Flash', reason: 'Best Tamil understanding' },
  'bn-en': { provider: 'lovable', model: 'Gemini 3 Flash', reason: 'Best Bengali understanding' },
  'mr-en': { provider: 'lovable', model: 'Gemini 3 Flash', reason: 'Best Marathi understanding' },
  'gu-en': { provider: 'lovable', model: 'Gemini 3 Flash', reason: 'Best Gujarati understanding' },
  
  // RTL languages - Google is best for Arabic
  'ar-en': { provider: 'google', model: 'Google Translate', reason: 'Best Arabic RTL handling' },
  'he-en': { provider: 'google', model: 'Google Translate', reason: 'Best Hebrew handling' },
  
  // Southeast Asian - Microsoft or Lovable AI
  'th-en': { provider: 'lovable', model: 'Gemini 3 Flash', reason: 'Best Thai understanding' },
  'vi-en': { provider: 'lovable', model: 'Gemini 3 Flash', reason: 'Best Vietnamese understanding' },
  'id-en': { provider: 'google', model: 'Google Translate', reason: 'Good Indonesian support' },
  'ms-en': { provider: 'google', model: 'Google Translate', reason: 'Good Malay support' },
  
  // Default - Lovable AI with Gemini
  'default': { provider: 'lovable', model: 'Gemini 3 Flash', reason: 'Universal - fast & accurate via Lovable AI' },
};

function getRecommendedProvider(inputLang: string, outputLang: string) {
  const key = `${inputLang}-${outputLang}`;
  const reverseKey = `${outputLang}-${inputLang}`;
  return PROVIDER_RECOMMENDATIONS[key] || PROVIDER_RECOMMENDATIONS[reverseKey] || PROVIDER_RECOMMENDATIONS['default'];
}

// Real translation via edge function
async function translateText(
  text: string, 
  fromLang: string, 
  toLang: string,
  provider: string = 'ai'
): Promise<{ translatedText: string; confidence: number; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('translation-service', {
      body: {
        action: 'translate',
        provider: provider,
        text: text,
        sourceLanguage: fromLang,
        targetLanguage: toLang,
        context: 'presentation content',
      }
    });

    if (error) {
      console.error('[AutoTranslate] Edge function error:', error);
      return { translatedText: '', confidence: 0, error: error.message };
    }

    if (data?.error) {
      console.error('[AutoTranslate] Translation error:', data.error);
      return { translatedText: '', confidence: 0, error: data.error };
    }

    return {
      translatedText: data?.translatedText || '',
      confidence: data?.confidence || 0.85,
    };
  } catch (err) {
    console.error('[AutoTranslate] Request failed:', err);
    return { 
      translatedText: '', 
      confidence: 0, 
      error: err instanceof Error ? err.message : 'Translation failed' 
    };
  }
}

export function AutoTranslateInput({
  value,
  onChange,
  inputLanguage,
  outputLanguage = 'en',
  placeholder,
  minHeight = 80,
  className,
  onTranslationComplete,
  onSubmit,
}: AutoTranslateInputProps) {
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationConfidence, setTranslationConfidence] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalValue, setModalValue] = useState(value);
  const debouncedValue = useDebounce(isExpanded ? modalValue : value, 800);
  const abortControllerRef = useRef<AbortController | null>(null);

  const recommendedProvider = getRecommendedProvider(inputLanguage, outputLanguage);
  const needsTranslation = inputLanguage !== outputLanguage;
  const inputLangName = LANGUAGE_NAMES[inputLanguage] || inputLanguage.toUpperCase();
  const outputLangName = LANGUAGE_NAMES[outputLanguage] || outputLanguage.toUpperCase();
  const nativePlaceholder = NATIVE_PLACEHOLDERS[inputLanguage] || NATIVE_PLACEHOLDERS['en'];
  const nativeTypeHere = NATIVE_TYPE_HERE[inputLanguage] || NATIVE_TYPE_HERE['en'];

  // Sync modal value when opening
  useEffect(() => {
    if (isExpanded) {
      setModalValue(value);
    }
  }, [isExpanded, value]);

  // Real translation via edge function
  useEffect(() => {
    const textToTranslate = debouncedValue.trim();
    if (!needsTranslation || !textToTranslate) {
      setTranslatedText('');
      setTranslationConfidence(0);
      return;
    }

    const performTranslation = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsTranslating(true);
      setTranslationError(null);

      const result = await translateText(
        textToTranslate, 
        inputLanguage, 
        outputLanguage,
        recommendedProvider.provider
      );

      if (result.error) {
        setTranslationError(result.error);
        setTranslatedText('');
        setTranslationConfidence(0);
      } else {
        setTranslatedText(result.translatedText);
        setTranslationConfidence(result.confidence);
        onTranslationComplete?.(result.translatedText);
      }

      setIsTranslating(false);
    };

    performTranslation();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedValue, inputLanguage, outputLanguage, needsTranslation, onTranslationComplete, recommendedProvider.provider]);

  const handleRetry = useCallback(() => {
    setTranslatedText('');
    setTranslationError(null);
    const currentVal = isExpanded ? modalValue : value;
    if (isExpanded) {
      setModalValue(currentVal + ' ');
      setTimeout(() => setModalValue(currentVal.trim()), 10);
    } else {
      onChange(currentVal + ' ');
      setTimeout(() => onChange(currentVal.trim()), 10);
    }
  }, [value, modalValue, onChange, isExpanded]);

  const handleExpandClick = () => {
    setModalValue(value);
    setIsExpanded(true);
  };

  const handleModalSubmit = () => {
    onChange(modalValue);
    setIsExpanded(false);
    onSubmit?.();
  };

  const handleModalClose = () => {
    onChange(modalValue);
    setIsExpanded(false);
  };

  // Compact collapsed view
  const CollapsedView = () => (
    <div className={cn("space-y-2", className)}>
      {/* Click-to-expand area */}
      <div 
        onClick={handleExpandClick}
        className="relative group cursor-pointer rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 transition-all p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-mono h-5">
              {inputLanguage.toUpperCase()}
            </Badge>
            <span className="text-xs font-medium">{inputLangName}</span>
            {needsTranslation && (
              <>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="text-[10px] font-mono h-5">
                  {outputLanguage.toUpperCase()}
                </Badge>
                <span className="text-xs font-medium">{outputLangName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary gap-1 text-[10px]">
              <Star className="h-2.5 w-2.5 fill-current" />
              {recommendedProvider.model}
            </Badge>
            <Maximize2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
        </div>
        
        {value ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{inputLangName}:</p>
                <p className="text-sm truncate" dir={inputLanguage === 'ar' ? 'rtl' : 'ltr'}>
                  {value}
                </p>
              </div>
              {needsTranslation && translatedText && (
                <div className="flex-1 min-w-0 border-l pl-2">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-xs text-muted-foreground">{outputLangName}:</p>
                    {translationConfidence > 0 && (
                      <Badge variant="secondary" className="text-[9px] h-4">
                        {Math.round(translationConfidence * 100)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 truncate">{translatedText}</p>
                </div>
              )}
            </div>
            {isTranslating && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Translating via {recommendedProvider.model}...
              </div>
            )}
            {translationError && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {translationError}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
            <PenLine className="h-5 w-5" />
            <span className="text-sm">{nativePlaceholder}</span>
          </div>
        )}
        
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Click to expand and type comfortably
        </p>
      </div>

      {/* RLHF Feedback for translation quality */}
      {translatedText && (
        <InlineTrainAIFeedback
          data={{
            context: 'slide_generation',
            product: 'deck',
            contentId: `translation_${inputLanguage}_${outputLanguage}`,
            originalContent: translatedText,
            userInput: value,
            metadata: { 
              inputLanguage, 
              outputLanguage, 
              provider: recommendedProvider.provider,
              confidence: translationConfidence 
            }
          }}
          variant="minimal"
          showTextFeedback={false}
        />
      )}
    </div>
  );

  return (
    <>
      <CollapsedView />
      
      {/* Expanded Modal */}
      <Dialog open={isExpanded} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Languages className="h-5 w-5 text-primary" />
                <span>Content Input & Translation</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary gap-1.5 text-xs">
                  <Star className="h-3 w-3 fill-current" />
                  {recommendedProvider.model}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-1.5">
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[200px]">
                      <p className="text-xs">{recommendedProvider.reason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Side-by-Side Layout in Modal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
            {/* LEFT: Native Language Input */}
            <div className="flex flex-col rounded-lg border border-primary/30 overflow-hidden">
              <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-mono">
                    {inputLanguage.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{inputLangName}</span>
                </div>
                <span className="text-xs text-muted-foreground">{nativeTypeHere}</span>
              </div>
              <Textarea
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
                dir={inputLanguage === 'ar' ? 'rtl' : 'ltr'}
                placeholder={nativePlaceholder}
                className="flex-1 border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base min-h-[200px]"
                autoFocus
              />
            </div>

            {/* RIGHT: Translation Preview */}
            <div className="flex flex-col rounded-lg border border-muted overflow-hidden">
              <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {outputLanguage.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{outputLangName}</span>
                  {translationConfidence > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {Math.round(translationConfidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
                {isTranslating && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Translating...
                  </div>
                )}
                {!isTranslating && translatedText && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </div>
              <div className="flex-1 p-4 text-base text-foreground/90 overflow-auto bg-background min-h-[200px]">
                {isTranslating ? (
                  <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Translating with {recommendedProvider.model}...
                  </div>
                ) : translationError ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      <span>{translationError}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRetry}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  </div>
                ) : translatedText ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{translatedText}</p>
                ) : modalValue.trim() ? (
                  <p className="text-muted-foreground italic">Waiting for translation...</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Type in {inputLangName} to see {outputLangName} translation...
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Real-time {inputLangName} → {outputLangName} via {recommendedProvider.model}
                </p>
                {translatedText && (
                  <InlineTrainAIFeedback
                    data={{
                      context: 'slide_generation',
                      product: 'deck',
                      contentId: `modal_translation_${inputLanguage}_${outputLanguage}`,
                      originalContent: translatedText,
                      userInput: modalValue,
                      metadata: { inputLanguage, outputLanguage, provider: recommendedProvider.provider }
                    }}
                    variant="minimal"
                    showTextFeedback={false}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button onClick={handleModalSubmit} className="gap-2">
                  <Send className="h-4 w-4" />
                  Apply Content
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AutoTranslateInput;