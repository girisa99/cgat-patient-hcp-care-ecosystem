/**
 * Language Multi-Select Dropdown
 * Clean dropdown for selecting multiple languages with max limit and search
 */

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ChevronDown,
  Globe,
  Search,
  Star,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Comprehensive language list
const ALL_LANGUAGES = [
  // Major Languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'Americas' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Europe' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'Europe' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Europe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Europe' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', region: 'Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Europe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Europe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Europe' },
  // Asian Languages
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', region: 'Asia' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', region: 'Asia' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Asia' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'Asia' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'Asia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Asia' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Asia' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Asia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', region: 'Asia' },
  // Middle East
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', region: 'Middle East' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Middle East' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', region: 'Middle East' },
  // Other
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Europe' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', region: 'Europe' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', region: 'Europe' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', region: 'Europe' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', region: 'Europe' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', region: 'Europe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', region: 'Europe' },
];

interface LanguageMultiSelectDropdownProps {
  value: string[];
  onChange: (languages: string[]) => void;
  primaryLanguage: string;
  onPrimaryChange: (language: string) => void;
  maxLanguages?: number;
  className?: string;
}

export function LanguageMultiSelectDropdown({
  value,
  onChange,
  primaryLanguage,
  onPrimaryChange,
  maxLanguages = 7,
  className,
}: LanguageMultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return ALL_LANGUAGES;
    const query = searchQuery.toLowerCase();
    return ALL_LANGUAGES.filter(
      lang =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group by region
  const groupedLanguages = useMemo(() => {
    return filteredLanguages.reduce((acc, lang) => {
      const region = lang.region || 'Other';
      if (!acc[region]) acc[region] = [];
      acc[region].push(lang);
      return acc;
    }, {} as Record<string, typeof ALL_LANGUAGES>);
  }, [filteredLanguages]);

  const handleToggle = (code: string) => {
    if (value.includes(code)) {
      // Don't remove if it's the only language or primary
      if (value.length === 1) return;
      if (code === primaryLanguage) {
        const newPrimary = value.find(l => l !== code);
        if (newPrimary) onPrimaryChange(newPrimary);
      }
      onChange(value.filter(l => l !== code));
    } else if (value.length < maxLanguages) {
      onChange([...value, code]);
    }
  };

  const handleSetPrimary = (code: string) => {
    if (!value.includes(code)) {
      if (value.length >= maxLanguages) return;
      onChange([...value, code]);
    }
    onPrimaryChange(code);
  };

  const handleRemove = (code: string) => {
    if (value.length === 1) return;
    if (code === primaryLanguage) {
      const newPrimary = value.find(l => l !== code);
      if (newPrimary) onPrimaryChange(newPrimary);
    }
    onChange(value.filter(l => l !== code));
  };

  const selectedLanguageInfo = value
    .map(code => ALL_LANGUAGES.find(l => l.code === code))
    .filter(Boolean);

  const isAtLimit = value.length >= maxLanguages;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-10 text-sm font-normal bg-background',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">
              {value.length === 0
                ? 'Select languages...'
                : `${value.length} language${value.length > 1 ? 's' : ''}`}
            </span>
            {value.length > 0 && (
              <div className="flex gap-0.5 ml-1">
                {selectedLanguageInfo.slice(0, 3).map(lang => (
                  <span key={lang!.code} className="text-sm">
                    {lang!.flag}
                  </span>
                ))}
                {value.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{value.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0 z-50 bg-popover border shadow-lg"
        align="start"
      >
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Languages</span>
            <Badge
              variant={isAtLimit ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {value.length}/{maxLanguages}
            </Badge>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Limit Warning */}
        {isAtLimit && (
          <div className="px-3 py-2 bg-destructive/10 border-b flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-destructive">
              Maximum {maxLanguages} languages allowed
            </span>
          </div>
        )}

        <ScrollArea className="h-[280px]">
          <div className="p-2 space-y-3">
            {Object.entries(groupedLanguages).map(([region, languages]) => (
              <div key={region}>
                <h4 className="text-xs font-medium text-muted-foreground px-2 mb-1">
                  {region}
                </h4>
                <div className="space-y-0.5">
                  {languages.map(lang => {
                    const isSelected = value.includes(lang.code);
                    const isPrimary = primaryLanguage === lang.code;
                    const isDisabled = !isSelected && isAtLimit;

                    return (
                      <div
                        key={lang.code}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-md transition-colors',
                          isSelected
                            ? isPrimary
                              ? 'bg-primary/10 border border-primary/30'
                              : 'bg-muted/50'
                            : isDisabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-muted cursor-pointer'
                        )}
                        onClick={() => !isDisabled && handleToggle(lang.code)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          className="pointer-events-none"
                        />
                        <span className="text-lg shrink-0">{lang.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {lang.name}
                            </span>
                            {isPrimary && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {lang.nativeName}
                          </span>
                        </div>
                        {isSelected && !isPrimary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={e => {
                              e.stopPropagation();
                              handleSetPrimary(lang.code);
                            }}
                          >
                            Set Primary
                          </Button>
                        )}
                        {isPrimary && (
                          <Badge variant="default" className="text-[9px]">
                            Primary
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Selected Summary */}
        {value.length > 0 && (
          <div className="p-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-1">
              {selectedLanguageInfo.map(lang => {
                if (!lang) return null;
                const isPrimary = primaryLanguage === lang.code;
                return (
                  <Badge
                    key={lang.code}
                    variant={isPrimary ? 'default' : 'secondary'}
                    className="text-xs gap-1 pr-1"
                  >
                    <span>{lang.flag}</span>
                    {lang.name}
                    {isPrimary && <Star className="h-2.5 w-2.5" />}
                    {!isPrimary && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive ml-0.5"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemove(lang.code);
                        }}
                      />
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
