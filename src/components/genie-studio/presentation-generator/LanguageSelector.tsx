/**
 * Language Selector Component
 * Multi-language selection for presentation generation
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Globe, 
  Languages, 
  Mic,
  Check,
  Search,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { genieVibeService, type SupportedLanguage } from '@/services/genieVibeService';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  primaryLanguage: string;
  onPrimaryLanguageChange: (language: string) => void;
  includeVoiceover: boolean;
  onIncludeVoiceoverChange: (include: boolean) => void;
  maxLanguages?: number;
  className?: string;
}

export function LanguageSelector({
  selectedLanguages,
  onLanguagesChange,
  primaryLanguage,
  onPrimaryLanguageChange,
  includeVoiceover,
  onIncludeVoiceoverChange,
  maxLanguages = 10,
  className,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const allLanguages = genieVibeService.getSupportedLanguages();
  
  // Filter languages based on search
  const filteredLanguages = allLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by region
  const groupedLanguages = filteredLanguages.reduce((acc, lang) => {
    const region = lang.region || 'Other';
    if (!acc[region]) acc[region] = [];
    acc[region].push(lang);
    return acc;
  }, {} as Record<string, SupportedLanguage[]>);

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      // Don't remove if it's the only language or if it's the primary
      if (selectedLanguages.length === 1) return;
      if (code === primaryLanguage) {
        // Set new primary before removing
        const newPrimary = selectedLanguages.find(l => l !== code);
        if (newPrimary) onPrimaryLanguageChange(newPrimary);
      }
      onLanguagesChange(selectedLanguages.filter(l => l !== code));
    } else if (selectedLanguages.length < maxLanguages) {
      onLanguagesChange([...selectedLanguages, code]);
    }
  };

  const setPrimary = (code: string) => {
    if (!selectedLanguages.includes(code)) {
      onLanguagesChange([...selectedLanguages, code]);
    }
    onPrimaryLanguageChange(code);
  };

  // Quick presets
  const presets = [
    { name: 'European', codes: ['en', 'es', 'fr', 'de', 'it', 'pt'] },
    { name: 'Asian', codes: ['en', 'zh', 'ja', 'ko', 'hi'] },
    { name: 'Global Top 5', codes: ['en', 'es', 'zh', 'ar', 'hi'] },
    { name: 'EMEA', codes: ['en', 'de', 'fr', 'ar', 'ru'] },
  ];

  const applyPreset = (codes: string[]) => {
    onLanguagesChange(codes);
    if (!codes.includes(primaryLanguage)) {
      onPrimaryLanguageChange(codes[0]);
    }
  };

  const selectedLangInfo = selectedLanguages.map(code => 
    allLanguages.find(l => l.code === code)
  ).filter(Boolean) as SupportedLanguage[];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Compact View */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium flex items-center gap-1">
          <Globe className="h-3 w-3" />
          Languages ({selectedLanguages.length})
        </Label>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 text-[10px]">
              <Languages className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Multi-Language Generation
              </DialogTitle>
              <DialogDescription>
                Select languages to generate your presentation in simultaneously.
                Up to {maxLanguages} languages supported.
              </DialogDescription>
            </DialogHeader>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => applyPreset(preset.codes)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language Grid */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {Object.entries(groupedLanguages).map(([region, languages]) => (
                  <div key={region}>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">{region}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {languages.map(lang => {
                        const isSelected = selectedLanguages.includes(lang.code);
                        const isPrimary = primaryLanguage === lang.code;
                        
                        return (
                          <div
                            key={lang.code}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors",
                              isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted",
                              isPrimary && "ring-2 ring-primary"
                            )}
                            onClick={() => toggleLanguage(lang.code)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium truncate">{lang.name}</span>
                                {isPrimary && <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                              </div>
                              <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              {lang.voiceCloningAvailable && (
                                <Mic className="h-3 w-3 text-green-500" />
                              )}
                              {isSelected && (
                                <div className="flex gap-1">
                                  <Check className="h-4 w-4 text-primary" />
                                  {!isPrimary && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 px-1 text-[9px]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPrimary(lang.code);
                                      }}
                                    >
                                      Set Primary
                                    </Button>
                                  )}
                                </div>
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
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Selected: {selectedLanguages.length}/{maxLanguages}
                </span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={includeVoiceover}
                    onCheckedChange={onIncludeVoiceoverChange}
                    id="voiceover-toggle"
                  />
                  <Label htmlFor="voiceover-toggle" className="text-xs">
                    Generate voiceovers for all languages
                  </Label>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedLangInfo.map(lang => (
                  <Badge 
                    key={lang.code}
                    variant={lang.code === primaryLanguage ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {lang.code === primaryLanguage && '★ '}
                    {lang.name}
                    {includeVoiceover && lang.voiceAvailable && (
                      <Mic className="h-2 w-2 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Languages Preview */}
      <div className="flex flex-wrap gap-1">
        {selectedLangInfo.slice(0, 5).map(lang => (
          <Badge 
            key={lang.code}
            variant={lang.code === primaryLanguage ? 'default' : 'outline'}
            className="text-[10px]"
          >
            {lang.code === primaryLanguage && '★ '}
            {lang.name}
          </Badge>
        ))}
        {selectedLanguages.length > 5 && (
          <Badge variant="secondary" className="text-[10px]">
            +{selectedLanguages.length - 5} more
          </Badge>
        )}
      </div>

      {/* Voiceover indicator */}
      {includeVoiceover && selectedLanguages.length > 0 && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Mic className="h-3 w-3" />
          Voiceovers will be generated for {selectedLanguages.length} language(s)
        </p>
      )}
    </div>
  );
}
