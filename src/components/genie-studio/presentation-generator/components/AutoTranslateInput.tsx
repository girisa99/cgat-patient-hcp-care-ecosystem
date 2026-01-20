/**
 * Auto-Translate Input Component
 * Features: Expandable popup modal for comfortable typing
 * Side-by-side: Native language input + English translation preview
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

// Recommended translation models
const RECOMMENDED_MODELS: Record<string, { model: string; reason: string }> = {
  'de-en': { model: 'DeepL', reason: 'Best for DE↔EN' },
  'fr-en': { model: 'DeepL', reason: 'Highest accuracy for French' },
  'es-en': { model: 'DeepL', reason: 'Excellent for Spanish' },
  'zh-en': { model: 'Qwen-MT', reason: 'Best for Chinese↔English' },
  'ja-en': { model: 'Qwen-MT', reason: 'Superior Japanese handling' },
  'ko-en': { model: 'Qwen-MT', reason: 'Excellent Korean accuracy' },
  'hi-en': { model: 'Gemini', reason: 'Best Hindi understanding' },
  'ar-en': { model: 'Google', reason: 'Best Arabic RTL handling' },
  'te-en': { model: 'Gemini', reason: 'Best Telugu understanding' },
  'ta-en': { model: 'Gemini', reason: 'Best Tamil understanding' },
  'default': { model: 'Gemini 3 Flash', reason: 'Universal - fast & accurate' },
};

// Mock translation examples (simulating real translation)
const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  te: {
    'నమస్కారం': 'Hello',
    'ధన్యవాదాలు': 'Thank you',
    'మీకు స్వాగతం': 'Welcome',
    'ప్రదర్శన': 'Presentation',
    'విషయం': 'Content',
  },
  hi: {
    'नमस्ते': 'Hello',
    'धन्यवाद': 'Thank you',
    'स्वागत है': 'Welcome',
    'प्रस्तुति': 'Presentation',
  },
  zh: {
    '你好': 'Hello',
    '谢谢': 'Thank you',
    '欢迎': 'Welcome',
    '演示文稿': 'Presentation',
  },
  ja: {
    'こんにちは': 'Hello',
    'ありがとう': 'Thank you',
    'ようこそ': 'Welcome',
    'プレゼンテーション': 'Presentation',
  },
  fr: {
    'bonjour': 'Hello',
    'merci': 'Thank you',
    'bienvenue': 'Welcome',
    'présentation': 'Presentation',
  },
  de: {
    'hallo': 'Hello',
    'danke': 'Thank you',
    'willkommen': 'Welcome',
    'präsentation': 'Presentation',
  },
  es: {
    'hola': 'Hello',
    'gracias': 'Thank you',
    'bienvenido': 'Welcome',
    'presentación': 'Presentation',
  },
};

function getRecommendedModel(inputLang: string, outputLang: string) {
  const key = `${inputLang}-${outputLang}`;
  const reverseKey = `${outputLang}-${inputLang}`;
  return RECOMMENDED_MODELS[key] || RECOMMENDED_MODELS[reverseKey] || RECOMMENDED_MODELS['default'];
}

// Simulate translation (in production, this would call a real API)
function simulateTranslation(text: string, fromLang: string, toLang: string): string {
  if (!text.trim()) return '';
  if (fromLang === toLang) return text;
  
  // Check for known translations
  const langTranslations = MOCK_TRANSLATIONS[fromLang];
  if (langTranslations) {
    for (const [native, english] of Object.entries(langTranslations)) {
      if (text.toLowerCase().includes(native.toLowerCase())) {
        return text.replace(new RegExp(native, 'gi'), english);
      }
    }
  }
  
  // For demo: show a meaningful English translation message
  const langName = LANGUAGE_NAMES[fromLang] || fromLang;
  return `[Translated from ${langName}]: "${text}"`;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalValue, setModalValue] = useState(value);
  const debouncedValue = useDebounce(isExpanded ? modalValue : value, 500);
  const abortControllerRef = useRef<AbortController | null>(null);

  const recommendedModel = getRecommendedModel(inputLanguage, outputLanguage);
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

  // Auto-translate
  useEffect(() => {
    const textToTranslate = debouncedValue.trim();
    if (!needsTranslation || !textToTranslate) {
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
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Perform mock translation
        const translated = simulateTranslation(textToTranslate, inputLanguage, outputLanguage);
        setTranslatedText(translated);
        onTranslationComplete?.(translated);
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
              {recommendedModel.model}
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
                  <p className="text-xs text-muted-foreground mb-1">{outputLangName}:</p>
                  <p className="text-sm text-foreground/80 truncate">{translatedText}</p>
                </div>
              )}
            </div>
            {isTranslating && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Translating...
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
                  {recommendedModel.model}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-1.5">
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[200px]">
                      <p className="text-xs">{recommendedModel.reason}</p>
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
                    Translating with {recommendedModel.model}...
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
              <p className="text-xs text-muted-foreground">
                Type in {inputLangName} • Real-time translation to {outputLangName}
              </p>
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