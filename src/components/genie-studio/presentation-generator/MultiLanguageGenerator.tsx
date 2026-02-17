/**
 * Multi-Language Presentation Generator
 * Generates separate presentations for each selected language in parallel
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { translationService } from '@/services/translationService';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  Globe,
  Languages,
  Loader2,
  Check,
  X,
  Download,
  Sparkles,
  Clock,
  FileText,
  Star,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export interface LanguageGenerationStatus {
  languageCode: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress: number;
  slidesGenerated?: number;
  totalSlides?: number;
  error?: string;
  downloadUrl?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  // Major Global Languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹' },
  
  // European Languages
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', flag: '🇮🇪' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', flag: '🇧🇦' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', flag: '🇪🇸' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾' },
  
  // Asian Languages
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭' },
  
  // Middle Eastern Languages
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  
  // African Languages
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
];

interface MultiLanguageGeneratorProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  primaryLanguage: string;
  onPrimaryLanguageChange: (lang: string) => void;
  onGenerateAll: (languages: string[]) => Promise<void>;
  generationStatuses: LanguageGenerationStatus[];
  onDownload: (languageCode: string) => void;
  isGenerating: boolean;
  sourceLanguage?: string; // Added for translation pairing
  className?: string;
}

// Provider name mapping with icons
const PROVIDER_INFO: Record<string, { name: string; icon: string; color: string }> = {
  google_translate: { name: 'Google', icon: '🔵', color: 'text-blue-600' },
  deepl: { name: 'DeepL', icon: '🟢', color: 'text-green-600' },
  microsoft: { name: 'Azure', icon: '🔷', color: 'text-cyan-600' },
  amazon: { name: 'Amazon', icon: '🟠', color: 'text-orange-600' },
  qwen_mt: { name: 'Qwen-MT', icon: '🟣', color: 'text-purple-600' },
  meta_nllb: { name: 'NLLB', icon: '🔴', color: 'text-red-600' },
  ai_gemini: { name: 'Gemini AI', icon: '✨', color: 'text-primary' },
  ai_gpt: { name: 'GPT AI', icon: '🤖', color: 'text-emerald-600' },
  ai_claude: { name: 'Claude AI', icon: '🧠', color: 'text-amber-600' },
};

export function MultiLanguageGenerator({
  selectedLanguages,
  onLanguagesChange,
  primaryLanguage,
  onPrimaryLanguageChange,
  onGenerateAll,
  generationStatuses,
  onDownload,
  isGenerating,
  sourceLanguage = 'en',
  className
}: MultiLanguageGeneratorProps) {

  // Prepare dropdown options
  const languageOptions = useMemo(() => {
    return SUPPORTED_LANGUAGES.map(lang => ({
      id: lang.code,
      label: `${lang.flag} ${lang.name}`,
      value: lang.code,
      description: lang.nativeName,
      category: getLanguageCategory(lang.code),
    }));
  }, []);

  function getLanguageCategory(code: string): string {
    const european = ['en', 'es', 'fr', 'de', 'it', 'pt', 'pt-PT', 'nl', 'pl', 'ru', 'uk', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sr', 'sl', 'el', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt', 'is', 'ga', 'cy', 'mt', 'sq', 'mk', 'bs', 'ca', 'eu', 'gl', 'be'];
    const asian = ['zh', 'zh-TW', 'ja', 'ko', 'hi', 'te', 'ta', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'vi', 'th', 'id', 'ms', 'tl', 'my', 'km'];
    const middleEastern = ['ar', 'he', 'fa', 'tr'];
    const african = ['sw', 'af', 'am'];

    if (european.includes(code)) return '🌍 European';
    if (asian.includes(code)) return '🌏 Asian';
    if (middleEastern.includes(code)) return '🌍 Middle Eastern';
    if (african.includes(code)) return '🌍 African';
    return '🌐 Other';
  }

  const handleLanguageSelection = (codes: string[]) => {
    // Always include primary language
    if (!codes.includes(primaryLanguage)) {
      codes = [primaryLanguage, ...codes];
    }
    onLanguagesChange(codes);
  };

  const selectAll = () => {
    onLanguagesChange(SUPPORTED_LANGUAGES.map(l => l.code));
  };

  const clearAll = () => {
    onLanguagesChange([primaryLanguage]);
  };

  const getStatusIcon = (status: LanguageGenerationStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'generating':
        return <Loader2 className="h-3 w-3 text-primary animate-spin" />;
      case 'completed':
        return <Check className="h-3 w-3 text-green-600" />;
      case 'error':
        return <X className="h-3 w-3 text-destructive" />;
    }
  };

  const getStatusBadge = (status: LanguageGenerationStatus) => {
    const variants: Record<string, 'outline' | 'default' | 'destructive' | 'secondary'> = {
      pending: 'outline',
      generating: 'default',
      completed: 'secondary',
      error: 'destructive'
    };

    return (
      <Badge variant={variants[status.status]} className="text-[10px]">
        {status.status}
      </Badge>
    );
  };

  const completedCount = generationStatuses.filter(s => s.status === 'completed').length;
  const totalSelected = selectedLanguages.length;

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Multi-Language Generation
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {selectedLanguages.length} languages
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-4">
        {/* Primary Language Notice */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
          <Globe className="h-3 w-3 inline mr-1" />
          Each language generates a <strong>separate presentation</strong> - not mixed slides
        </div>

        {/* Language Selection - Multi-Select Dropdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Select Output Languages</Label>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={selectAll}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={clearAll}
              >
                Clear
              </Button>
            </div>
          </div>

          <MultiSelectDropdown
            options={languageOptions}
            selectedValues={selectedLanguages}
            onSelectionChange={handleLanguageSelection}
            placeholder="Select languages to generate..."
            searchable
            groupByCategory
          />

          {/* Selected Languages Summary with Primary Indicator and Provider Pairing */}
          {selectedLanguages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground">Selected ({selectedLanguages.length}) with Translation Providers:</Label>
              <div className="flex flex-wrap gap-1.5">
                {selectedLanguages.map(code => {
                  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                  const isPrimary = code === primaryLanguage;
                  if (!lang) return null;
                  
                  // Get provider recommendation with availability check
                  const providerDetails = code !== sourceLanguage 
                    ? translationService.getRecommendedProviderWithDetails(sourceLanguage, code)
                    : null;
                  const providerInfo = providerDetails ? PROVIDER_INFO[providerDetails.provider] : null;
                  
                  return (
                    <TooltipProvider key={code}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={isPrimary ? "default" : "secondary"}
                            className={cn(
                              "text-[10px] cursor-pointer gap-1",
                              isPrimary && "bg-primary"
                            )}
                            onClick={() => {
                              if (!isPrimary) {
                                onPrimaryLanguageChange(code);
                                toast.success(`${lang.name} set as primary language`);
                              }
                            }}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                            {isPrimary && <Star className="h-2.5 w-2.5 fill-current" />}
                            {providerInfo && (
                              <span className={cn("text-[8px] font-normal ml-0.5", providerDetails?.isFallback ? "text-amber-500" : providerInfo.color)}>
                                {providerInfo.icon}
                              </span>
                            )}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <div className="text-[10px] space-y-1">
                            <p className="font-medium">{lang.name} ({lang.nativeName})</p>
                            {isPrimary && <p className="text-primary">★ Primary language</p>}
                            {providerDetails && (
                              <>
                                <p className="flex items-center gap-1">
                                  <span>Provider:</span>
                                  <span className={providerInfo?.color}>{providerInfo?.name}</span>
                                </p>
                                {providerDetails.isFallback && (
                                  <p className="text-amber-500">
                                    ⚠️ Fallback: {providerDetails.fallbackReason}
                                  </p>
                                )}
                                <p className="text-muted-foreground">
                                  Confidence: {Math.round(providerDetails.confidence * 100)}%
                                </p>
                              </>
                            )}
                            {code === sourceLanguage && (
                              <p className="text-muted-foreground">Source language (no translation)</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Click a language badge to set it as primary. Hover to see translation provider details.
              </p>
            </div>
          )}
        </div>

        {/* Generation Progress */}
        {generationStatuses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Generation Progress</Label>
              <span className="text-[10px] text-muted-foreground">
                {completedCount}/{totalSelected} completed
              </span>
            </div>
            
            <Progress 
              value={(completedCount / totalSelected) * 100} 
              className="h-2" 
            />

            <ScrollArea className="max-h-[200px]">
              <div className="space-y-1.5">
                {generationStatuses.map(status => {
                  const lang = SUPPORTED_LANGUAGES.find(l => l.code === status.languageCode);
                  if (!lang) return null;

                  return (
                    <div
                      key={status.languageCode}
                      className="flex items-center gap-2 p-2 rounded border bg-card"
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{lang.name}</span>
                          {getStatusIcon(status.status)}
                        </div>
                        {status.status === 'generating' && (
                          <div className="mt-1">
                            <Progress value={status.progress} className="h-1" />
                            <p className="text-[9px] text-muted-foreground mt-0.5">
                              {status.slidesGenerated || 0}/{status.totalSlides || '?'} slides
                            </p>
                          </div>
                        )}
                        {status.error && (
                          <p className="text-[10px] text-destructive truncate">{status.error}</p>
                        )}
                      </div>
                      
                      {status.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => onDownload(status.languageCode)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Generate All Button */}
        <Button
          onClick={() => onGenerateAll(selectedLanguages)}
          disabled={isGenerating || selectedLanguages.length === 0}
          className="w-full"
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Generating {selectedLanguages.length} versions...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Generate in {selectedLanguages.length} Language{selectedLanguages.length > 1 ? 's' : ''}
            </>
          )}
        </Button>

        {/* Info */}
        <p className="text-[10px] text-muted-foreground text-center">
          Presentations are generated in parallel for faster results
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Hook for managing multi-language presentation generation
 */
export function useMultiLanguageGeneration() {
  const [statuses, setStatuses] = useState<LanguageGenerationStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const initializeStatuses = useCallback((languages: string[]) => {
    setStatuses(languages.map(code => ({
      languageCode: code,
      status: 'pending',
      progress: 0
    })));
  }, []);

  const updateStatus = useCallback((code: string, update: Partial<LanguageGenerationStatus>) => {
    setStatuses(prev => prev.map(s => 
      s.languageCode === code ? { ...s, ...update } : s
    ));
  }, []);

  const generateForLanguage = useCallback(async (
    languageCode: string,
    generateFn: (lang: string) => Promise<{ success: boolean; downloadUrl?: string; error?: string }>
  ) => {
    updateStatus(languageCode, { 
      status: 'generating', 
      progress: 10,
      startedAt: new Date()
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setStatuses(prev => prev.map(s => {
          if (s.languageCode === languageCode && s.status === 'generating') {
            return { ...s, progress: Math.min(s.progress + 10, 90) };
          }
          return s;
        }));
      }, 500);

      const result = await generateFn(languageCode);
      
      clearInterval(progressInterval);

      if (result.success) {
        updateStatus(languageCode, {
          status: 'completed',
          progress: 100,
          downloadUrl: result.downloadUrl,
          completedAt: new Date()
        });
      } else {
        updateStatus(languageCode, {
          status: 'error',
          error: result.error || 'Generation failed'
        });
      }
    } catch (error) {
      updateStatus(languageCode, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [updateStatus]);

  const generateAll = useCallback(async (
    languages: string[],
    generateFn: (lang: string) => Promise<{ success: boolean; downloadUrl?: string; error?: string }>
  ) => {
    setIsGenerating(true);
    initializeStatuses(languages);

    // Generate in parallel with concurrency limit
    const concurrencyLimit = 3;
    const queue = [...languages];
    const activePromises: Promise<void>[] = [];

    while (queue.length > 0 || activePromises.length > 0) {
      // Fill up to concurrency limit
      while (queue.length > 0 && activePromises.length < concurrencyLimit) {
        const lang = queue.shift()!;
        const promise = generateForLanguage(lang, generateFn).then(() => {
          // Remove from active promises when done
          const idx = activePromises.indexOf(promise);
          if (idx > -1) activePromises.splice(idx, 1);
        });
        activePromises.push(promise);
      }

      // Wait for at least one to complete
      if (activePromises.length > 0) {
        await Promise.race(activePromises);
      }
    }

    setIsGenerating(false);
    toast.success(`Generated presentations in ${languages.length} languages!`);
  }, [initializeStatuses, generateForLanguage]);

  const reset = useCallback(() => {
    setStatuses([]);
    setIsGenerating(false);
  }, []);

  return {
    statuses,
    isGenerating,
    generateAll,
    reset
  };
}
