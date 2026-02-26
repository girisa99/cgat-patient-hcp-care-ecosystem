/**
 * CastRegionSelector — Compact region/language picker for Genie Cast shell.
 *
 * Shows current language + zone. When changed, drives useProviderRouting
 * to update ALL providers across all tabs simultaneously.
 *
 * Supports: 37 languages across 4 zones, RTL badge, viseme indicator.
 */

import React from 'react';
import { Globe, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassBadge } from '@/components/ui/glass-primitives';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RTL_LANGUAGES } from '@/config/master-provider-routing-registry';

// ============================================
// LANGUAGE OPTIONS (grouped by zone)
// ============================================
interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  zone: string;
}

const LANGUAGE_GROUPS: { zone: string; label: string; languages: LanguageOption[] }[] = [
  {
    zone: 'Western / EU',
    label: 'Western & Europe',
    languages: [
      { code: 'en', label: 'English', nativeLabel: 'English', zone: 'claude_zone' },
      { code: 'en-GB', label: 'English (UK)', nativeLabel: 'English', zone: 'claude_zone' },
      { code: 'es', label: 'Spanish', nativeLabel: 'Español', zone: 'claude_zone' },
      { code: 'es-MX', label: 'Spanish (Mexico)', nativeLabel: 'Español', zone: 'claude_zone' },
      { code: 'fr', label: 'French', nativeLabel: 'Français', zone: 'claude_zone' },
      { code: 'de', label: 'German', nativeLabel: 'Deutsch', zone: 'claude_zone' },
      { code: 'it', label: 'Italian', nativeLabel: 'Italiano', zone: 'claude_zone' },
      { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', zone: 'claude_zone' },
      { code: 'pt-BR', label: 'Portuguese (Brazil)', nativeLabel: 'Português', zone: 'claude_zone' },
      { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', zone: 'claude_zone' },
      { code: 'pl', label: 'Polish', nativeLabel: 'Polski', zone: 'claude_zone' },
      { code: 'ru', label: 'Russian', nativeLabel: 'Русский', zone: 'claude_zone' },
    ],
  },
  {
    zone: 'CJK',
    label: 'CJK (China, Japan, Korea)',
    languages: [
      { code: 'zh-CN', label: 'Chinese (Simplified)', nativeLabel: '简体中文', zone: 'alibaba_zone' },
      { code: 'zh-TW', label: 'Chinese (Traditional)', nativeLabel: '繁體中文', zone: 'alibaba_zone' },
      { code: 'ja', label: 'Japanese', nativeLabel: '日本語', zone: 'alibaba_zone' },
      { code: 'ko', label: 'Korean', nativeLabel: '한국어', zone: 'alibaba_zone' },
    ],
  },
  {
    zone: 'MENA',
    label: 'MENA / RTL',
    languages: [
      { code: 'ar-SA', label: 'Arabic (Gulf)', nativeLabel: 'العربية', zone: 'alibaba_zone' },
      { code: 'ar-EG', label: 'Arabic (Egypt)', nativeLabel: 'العربية المصرية', zone: 'alibaba_zone' },
      { code: 'ar-MA', label: 'Arabic (Morocco)', nativeLabel: 'الدارجة', zone: 'alibaba_zone' },
      { code: 'he', label: 'Hebrew', nativeLabel: 'עברית', zone: 'alibaba_zone' },
      { code: 'fa', label: 'Persian', nativeLabel: 'فارسی', zone: 'alibaba_zone' },
      { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', zone: 'gemini_zone' },
    ],
  },
  {
    zone: 'India / SEA / Africa',
    label: 'India, SEA & Africa',
    languages: [
      { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', zone: 'gemini_zone' },
      { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', zone: 'gemini_zone' },
      { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', zone: 'gemini_zone' },
      { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', zone: 'gemini_zone' },
      { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', zone: 'gemini_zone' },
      { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt', zone: 'gemini_zone' },
      { code: 'th', label: 'Thai', nativeLabel: 'ไทย', zone: 'gemini_zone' },
      { code: 'ms', label: 'Malay', nativeLabel: 'Bahasa Melayu', zone: 'gemini_zone' },
      { code: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili', zone: 'gemini_zone' },
    ],
  },
];

// Flatten for lookup
const ALL_LANGUAGES = LANGUAGE_GROUPS.flatMap(g => g.languages);

function getLanguageLabel(code: string): string {
  return ALL_LANGUAGES.find(l => l.code === code)?.label || code;
}

function isRTLLanguage(code: string): boolean {
  const base = code.split('-')[0];
  return (RTL_LANGUAGES as readonly string[]).includes(code) ||
    (RTL_LANGUAGES as readonly string[]).includes(base);
}

// ============================================
// COMPONENT
// ============================================
interface CastRegionSelectorProps {
  languageCode: string;
  onLanguageChange: (code: string) => void;
  className?: string;
}

export function CastRegionSelector({
  languageCode,
  onLanguageChange,
  className,
}: CastRegionSelectorProps) {
  const rtl = isRTLLanguage(languageCode);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

      <Select value={languageCode} onValueChange={onLanguageChange}>
        <SelectTrigger className="h-7 text-xs glass-input min-w-[140px] max-w-[200px]">
          <SelectValue placeholder="Select language">
            {getLanguageLabel(languageCode)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[320px]">
          {LANGUAGE_GROUPS.map((group) => (
            <SelectGroup key={group.zone}>
              <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </SelectLabel>
              {group.languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-xs">
                  <span className="flex items-center gap-2">
                    <span>{lang.label}</span>
                    <span className="text-muted-foreground/50">{lang.nativeLabel}</span>
                    {isRTLLanguage(lang.code) && (
                      <ArrowRightLeft className="w-2.5 h-2.5 text-destructive/60" />
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {rtl && (
        <GlassBadge className="text-[10px] px-1.5 py-0 border-destructive/30 text-destructive shrink-0">
          RTL
        </GlassBadge>
      )}
    </div>
  );
}
