/**
 * TranscreationInput — Language-aware input with floating badge + RTL support
 * 
 * Features:
 * - Auto-detects input language direction
 * - Shows floating language badge (detected language)
 * - Side-by-side transcreated preview (optional)
 * - Liquid Glass styling
 */

import React, { useState, useMemo } from 'react';
import { Globe, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

// Simple RTL detection based on first strong character
const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF\uFB1D-\uFB4F]/;
const CJK_REGEX = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;

function detectLanguageHint(text: string): { dir: 'ltr' | 'rtl'; lang: string } {
  if (!text.trim()) return { dir: 'ltr', lang: '' };
  if (RTL_REGEX.test(text)) {
    // Rough detection: Arabic vs Hebrew vs Urdu
    if (/[\u0590-\u05FF]/.test(text)) return { dir: 'rtl', lang: 'he' };
    if (/[\u0600-\u06FF]/.test(text)) return { dir: 'rtl', lang: 'ar' };
    return { dir: 'rtl', lang: 'rtl' };
  }
  if (CJK_REGEX.test(text)) {
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return { dir: 'ltr', lang: 'ja' };
    if (/[\uAC00-\uD7AF]/.test(text)) return { dir: 'ltr', lang: 'ko' };
    return { dir: 'ltr', lang: 'zh' };
  }
  return { dir: 'ltr', lang: 'en' };
}

const LANG_NAMES: Record<string, string> = {
  en: 'English', ar: 'العربية', he: 'עברית', ja: '日本語',
  ko: '한국어', zh: '中文', rtl: 'RTL',
};

// ── Props ────────────────────────────────────────────────────────────────────

interface TranscreationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  localPlaceholder?: string;
  transcreatedPreview?: string;
  transcreatedLang?: string;
  label?: string;
  localLabel?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  /** Force direction override */
  forceDirection?: 'ltr' | 'rtl';
  showLanguageBadge?: boolean;
  showTranscreationPreview?: boolean;
}

export const TranscreationInput: React.FC<TranscreationInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  localPlaceholder,
  transcreatedPreview,
  transcreatedLang,
  label,
  localLabel,
  multiline = false,
  rows = 3,
  className,
  forceDirection,
  showLanguageBadge = true,
  showTranscreationPreview = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const detected = useMemo(() => detectLanguageHint(value), [value]);
  const inputDir = forceDirection || detected.dir;
  const hasTranscreation = showTranscreationPreview && transcreatedPreview;

  const sharedInputClass = cn(
    'bg-white/[0.03] border-white/[0.08] rounded-xl transition-all duration-300',
    'placeholder:text-muted-foreground/30',
    'focus:border-primary/40 focus:shadow-[0_0_15px_rgba(var(--primary-rgb,99,102,241),0.15)]',
    'focus:bg-white/[0.05]',
    hasTranscreation ? 'rounded-r-none border-r-0' : '',
  );

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* Label row */}
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">{label}</label>
          {localLabel && (
            <span className="text-xs text-muted-foreground/50">{localLabel}</span>
          )}
        </div>
      )}

      <div className="relative flex">
        {/* Main input */}
        <div className="relative flex-1">
          {multiline ? (
            <Textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={localPlaceholder || placeholder}
              rows={rows}
              dir={inputDir}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={sharedInputClass}
            />
          ) : (
            <Input
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={localPlaceholder || placeholder}
              dir={inputDir}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={sharedInputClass}
            />
          )}

          {/* Floating language badge */}
          {showLanguageBadge && detected.lang && value.trim() && (
            <Badge
              variant="outline"
              className={cn(
                'absolute top-2 gap-1 text-[10px] px-1.5 py-0.5 bg-background/80 backdrop-blur-sm border-white/10 text-muted-foreground',
                'transition-all duration-200',
                isFocused ? 'opacity-100' : 'opacity-60',
                inputDir === 'rtl' ? 'left-2' : 'right-2',
              )}
            >
              <Globe className="w-2.5 h-2.5" />
              {LANG_NAMES[detected.lang] || detected.lang}
            </Badge>
          )}
        </div>

        {/* Side-by-side transcreation preview */}
        {hasTranscreation && (
          <div className={cn(
            'w-[45%] flex-shrink-0 px-3 py-2 rounded-r-xl border border-white/[0.08] border-l-0',
            'bg-primary/[0.03] backdrop-blur-sm',
            'flex flex-col justify-center',
          )}
            dir={detected.dir === 'rtl' ? 'ltr' : 'rtl'}
          >
            <div className="flex items-center gap-1 mb-1">
              <Languages className="w-3 h-3 text-primary/60" />
              <span className="text-[10px] text-primary/60 font-medium">
                {transcreatedLang || 'Transcreation'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">
              {transcreatedPreview}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscreationInput;
