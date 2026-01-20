/**
 * Auto-Translate Input Component
 * Real-time translation while typing in selected language
 * Shows recommended translation model
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Languages,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowRight,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface AutoTranslateInputProps {
  value: string;
  onChange: (value: string) => void;
  inputLanguage: string;
  outputLanguage: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  onTranslationComplete?: (translatedText: string) => void;
}

// Recommended translation models by language pair
const RECOMMENDED_MODELS: Record<string, { model: string; provider: string; reason: string }> = {
  // European languages
  'en-de': { model: 'DeepL', provider: 'deepl', reason: 'Best for EN↔DE professional translation' },
  'en-fr': { model: 'DeepL', provider: 'deepl', reason: 'Highest accuracy for French' },
  'en-es': { model: 'DeepL', provider: 'deepl', reason: 'Excellent for Spanish nuances' },
  'en-it': { model: 'DeepL', provider: 'deepl', reason: 'Best Italian grammar handling' },
  'en-pt': { model: 'DeepL', provider: 'deepl', reason: 'Superior Portuguese localization' },
  'en-nl': { model: 'DeepL', provider: 'deepl', reason: 'Top choice for Dutch' },
  'en-pl': { model: 'DeepL', provider: 'deepl', reason: 'Best Polish translation' },
  
  // Asian languages
  'en-zh': { model: 'Qwen-MT', provider: 'alibaba', reason: 'Best for Simplified Chinese' },
  'en-ja': { model: 'Qwen-MT', provider: 'alibaba', reason: 'Superior Japanese handling' },
  'en-ko': { model: 'Qwen-MT', provider: 'alibaba', reason: 'Excellent Korean accuracy' },
  'en-th': { model: 'Google Translate', provider: 'google', reason: 'Best Thai support' },
  'en-vi': { model: 'Google Translate', provider: 'google', reason: 'Top Vietnamese accuracy' },
  
  // Indian languages
  'en-hi': { model: 'Gemini', provider: 'google', reason: 'Best Hindi understanding' },
  'en-ta': { model: 'Gemini', provider: 'google', reason: 'Superior Tamil translation' },
  'en-te': { model: 'Gemini', provider: 'google', reason: 'Best Telugu support' },
  
  // Middle Eastern
  'en-ar': { model: 'Google Translate', provider: 'google', reason: 'Best Arabic RTL handling' },
  'en-he': { model: 'Google Translate', provider: 'google', reason: 'Best Hebrew support' },
  
  // Default
  'default': { model: 'Gemini 2.5 Flash', provider: 'google', reason: 'Universal fallback - balanced quality' },
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
  outputLanguage,
  placeholder = "Type your content here...",
  minHeight = 120,
  maxHeight = 300,
  className,
  onTranslationComplete,
}: AutoTranslateInputProps) {
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [lastTranslatedAt, setLastTranslatedAt] = useState<Date | null>(null);
  const debouncedValue = useDebounce(value, 800); // Debounce 800ms
  const abortControllerRef = useRef<AbortController | null>(null);

  const recommendedModel = getRecommendedModel(inputLanguage, outputLanguage);
  const needsTranslation = inputLanguage !== outputLanguage && value.trim().length > 0;

  // Auto-translate when debounced value changes
  useEffect(() => {
    if (!needsTranslation || !debouncedValue.trim()) {
      setTranslatedText('');
      return;
    }

    const translateText = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsTranslating(true);
      setTranslationError(null);

      try {
        // Call translation API (simulated for now - would use actual edge function)
        // In production, this would call: supabase.functions.invoke('translate', { body: {...} })
        
        // Simulate translation delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo: show placeholder translated text
        const mockTranslation = `[${outputLanguage.toUpperCase()}] ${debouncedValue}`;
        setTranslatedText(mockTranslation);
        setLastTranslatedAt(new Date());
        onTranslationComplete?.(mockTranslation);
        
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setTranslationError('Translation failed. Will use input text.');
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

  const handleRetryTranslation = useCallback(() => {
    setTranslatedText('');
    setTranslationError(null);
    // Trigger re-translation by updating state
    onChange(value + ' ');
    setTimeout(() => onChange(value), 10);
  }, [value, onChange]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Recommended Model Badge */}
      {needsTranslation && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary gap-1.5">
              <Star className="h-3 w-3 fill-current" />
              Recommended: {recommendedModel.model}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-[10px] cursor-help">
                    Why?
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs">{recommendedModel.reason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {isTranslating && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Translating...
            </div>
          )}
        </div>
      )}

      {/* Main Input */}
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="resize-none pr-10"
          style={{ minHeight, maxHeight }}
        />
        
        {/* Language indicator */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-[10px] bg-background">
            {inputLanguage.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Translation Preview */}
      {needsTranslation && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Languages className="h-3.5 w-3.5" />
              <span>Auto-translating to {outputLanguage.toUpperCase()}</span>
              <ArrowRight className="h-3 w-3" />
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <><EyeOff className="h-3 w-3 mr-1" /> Hide</>
                ) : (
                  <><Eye className="h-3 w-3 mr-1" /> Show</>
                )}
              </Button>
            </div>
          </div>

          {showPreview && (
            <div className={cn(
              "p-3 rounded-lg border",
              translationError 
                ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" 
                : "bg-muted/30 border-muted"
            )}>
              {isTranslating ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Translating with {recommendedModel.model}...
                </div>
              ) : translationError ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    {translationError}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetryTranslation}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              ) : translatedText ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-background">
                        {outputLanguage.toUpperCase()}
                      </Badge>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    {lastTranslatedAt && (
                      <span className="text-[10px] text-muted-foreground">
                        Translated {lastTranslatedAt.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                    {translatedText}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Start typing to see translation preview...
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* No translation needed */}
      {!needsTranslation && value.trim() && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          Input and output languages are the same - no translation needed
        </div>
      )}
    </div>
  );
}

export default AutoTranslateInput;
