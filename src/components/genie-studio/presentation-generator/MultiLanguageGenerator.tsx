/**
 * Multi-Language Presentation Generator
 * Generates separate presentations for each selected language in parallel
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Globe,
  Languages,
  Loader2,
  Check,
  X,
  Download,
  Sparkles,
  Clock,
  FileText
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
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true }
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
  className?: string;
}

export function MultiLanguageGenerator({
  selectedLanguages,
  onLanguagesChange,
  primaryLanguage,
  onPrimaryLanguageChange,
  onGenerateAll,
  generationStatuses,
  onDownload,
  isGenerating,
  className
}: MultiLanguageGeneratorProps) {
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      // Don't allow removing primary language
      if (code === primaryLanguage) {
        toast.error('Cannot remove primary language');
        return;
      }
      onLanguagesChange(selectedLanguages.filter(l => l !== code));
    } else {
      onLanguagesChange([...selectedLanguages, code]);
    }
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

  const displayedLanguages = showAllLanguages 
    ? SUPPORTED_LANGUAGES 
    : SUPPORTED_LANGUAGES.slice(0, 8);

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

        {/* Language Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Select Languages</Label>
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

          <div className="grid grid-cols-2 gap-2">
            {displayedLanguages.map(lang => (
              <div
                key={lang.code}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
                  selectedLanguages.includes(lang.code) 
                    ? "border-primary bg-primary/10 shadow-sm" 
                    : "border-muted hover:border-muted-foreground/40 hover:bg-muted/50",
                  lang.code === primaryLanguage && "ring-2 ring-primary/30"
                )}
                onClick={() => toggleLanguage(lang.code)}
              >
                <Checkbox 
                  checked={selectedLanguages.includes(lang.code)}
                  className="h-4 w-4"
                />
                <span className="text-base">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lang.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lang.nativeName}</p>
                </div>
                {lang.code === primaryLanguage && (
                  <Badge className="text-[10px] px-1.5 bg-primary/20 text-primary border-0">Primary</Badge>
                )}
              </div>
            ))}
          </div>

          {SUPPORTED_LANGUAGES.length > 8 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-6 text-[10px]"
              onClick={() => setShowAllLanguages(!showAllLanguages)}
            >
              {showAllLanguages ? 'Show less' : `Show ${SUPPORTED_LANGUAGES.length - 8} more languages`}
            </Button>
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
