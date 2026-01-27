/**
 * LANGUAGE SELECTOR PANEL
 * 
 * Multi-language configuration for composition:
 * - Select target languages
 * - Configure voice per language
 * - Preview TTS for each language
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Play, Volume2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_LANGUAGES, type LanguageConfig } from './types';

interface LanguageSelectorPanelProps {
  selectedLanguages: string[];
  primaryLanguage: string;
  onLanguagesChange: (languages: string[]) => void;
  onPrimaryChange: (language: string) => void;
  onPreviewVoice?: (language: string) => void;
}

const ZONE_COLORS: Record<string, string> = {
  'West/EU': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'MENA': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  'India/SEA': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  'CJK': 'bg-violet-500/10 text-violet-600 border-violet-500/30',
  'Africa': 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  'Fallback': 'bg-slate-500/10 text-slate-600 border-slate-500/30',
};

export const LanguageSelectorPanel: React.FC<LanguageSelectorPanelProps> = ({
  selectedLanguages,
  primaryLanguage,
  onLanguagesChange,
  onPrimaryChange,
  onPreviewVoice,
}) => {
  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      // Don't remove if it's the only one or it's primary
      if (selectedLanguages.length > 1 && code !== primaryLanguage) {
        onLanguagesChange(selectedLanguages.filter(l => l !== code));
      } else if (code === primaryLanguage && selectedLanguages.length > 1) {
        // If removing primary, set new primary first
        const newPrimary = selectedLanguages.find(l => l !== code);
        if (newPrimary) {
          onPrimaryChange(newPrimary);
          onLanguagesChange(selectedLanguages.filter(l => l !== code));
        }
      }
    } else {
      onLanguagesChange([...selectedLanguages, code]);
    }
  };

  const setPrimary = (code: string) => {
    if (!selectedLanguages.includes(code)) {
      onLanguagesChange([...selectedLanguages, code]);
    }
    onPrimaryChange(code);
  };

  // Group languages by zone
  const groupedLanguages = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.zone]) acc[lang.zone] = [];
    acc[lang.zone].push(lang);
    return acc;
  }, {} as Record<string, LanguageConfig[]>);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="w-4 h-4" />
          Target Languages
        </CardTitle>
        <CardDescription>
          Select languages for multi-language output ({selectedLanguages.length} selected)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onLanguagesChange(['en'])}
          >
            English Only
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onLanguagesChange(['en', 'es', 'fr', 'de', 'pt'])}
          >
            Western 5
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onLanguagesChange(['en', 'ar', 'hi', 'zh', 'ja'])}
          >
            Global 5
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onLanguagesChange(SUPPORTED_LANGUAGES.map(l => l.code))}
          >
            All ({SUPPORTED_LANGUAGES.length})
          </Button>
        </div>

        {/* Language Grid by Zone */}
        <ScrollArea className="h-[300px] pr-3">
          <div className="space-y-4">
            {Object.entries(groupedLanguages).map(([zone, languages]) => (
              <div key={zone} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", ZONE_COLORS[zone])}
                  >
                    {zone}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {languages.length} languages
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang.code);
                    const isPrimary = primaryLanguage === lang.code;
                    
                    return (
                      <div
                        key={lang.code}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border transition-all",
                          isSelected ? "bg-primary/5 border-primary/30" : "border-border hover:border-primary/20",
                          isPrimary && "ring-2 ring-primary/40"
                        )}
                      >
                        <Checkbox
                          id={`lang-${lang.code}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleLanguage(lang.code)}
                        />
                        <label 
                          htmlFor={`lang-${lang.code}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{lang.name}</span>
                            {isPrimary && (
                              <Badge variant="secondary" className="text-[10px] px-1">
                                Primary
                              </Badge>
                            )}
                            {lang.isRTL && (
                              <Badge variant="outline" className="text-[10px] px-1">
                                RTL
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {lang.voiceProvider}
                          </span>
                        </label>
                        <div className="flex gap-1">
                          {isSelected && !isPrimary && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setPrimary(lang.code)}
                              title="Set as primary"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          {onPreviewVoice && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => onPreviewVoice(lang.code)}
                              title="Preview voice"
                            >
                              <Volume2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Selected Summary */}
        {selectedLanguages.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {selectedLanguages.map((code) => {
              const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
              return (
                <Badge
                  key={code}
                  variant={code === primaryLanguage ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {lang?.name || code}
                  {code === primaryLanguage && ' ★'}
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguageSelectorPanel;
