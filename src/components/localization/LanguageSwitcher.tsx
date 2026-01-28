/**
 * Global Language Switcher UI
 * P4-LANG-14: In-app language preference toggle
 * 
 * Features:
 * - 14+ supported regions with flags
 * - RTL layout support
 * - Dialect selection for Arabic/Indian
 * - Persistent preference storage
 * - Integration with 6-zone routing
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Globe, Languages, Sparkles } from 'lucide-react';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';
import { SUPPORTED_REGIONS, type RegionalCode } from '@/config/genie-sitemap';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  showDialects?: boolean;
  showQualityBadge?: boolean;
  onLanguageChange?: (code: RegionalCode) => void;
  className?: string;
}

// Language quality tiers (based on 6-zone routing)
const LANGUAGE_QUALITY: Record<RegionalCode, 'premium' | 'high' | 'standard'> = {
  en: 'premium',
  ar: 'premium',
  zh: 'premium',
  hi: 'premium',
  es: 'high',
  fr: 'high',
  de: 'high',
  ja: 'high',
  ko: 'high',
  pt: 'high',
  ru: 'standard',
  tr: 'standard',
  id: 'standard',
  vi: 'standard',
};

// Dialect options for specific languages
const DIALECTS: Record<string, { code: string; name: string; flag: string }[]> = {
  ar: [
    { code: 'ar-SA', name: 'Saudi (Gulf)', flag: '🇸🇦' },
    { code: 'ar-EG', name: 'Egyptian', flag: '🇪🇬' },
    { code: 'ar-AE', name: 'Emirati', flag: '🇦🇪' },
    { code: 'ar-MA', name: 'Moroccan', flag: '🇲🇦' },
    { code: 'ar-LB', name: 'Levantine', flag: '🇱🇧' },
    { code: 'ar-IQ', name: 'Iraqi', flag: '🇮🇶' },
    { code: 'ar-SD', name: 'Sudanese', flag: '🇸🇩' },
  ],
  hi: [
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
    { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
    { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
  ],
};

// Flag emoji mapping
const FLAGS: Record<RegionalCode, string> = {
  en: '🇺🇸',
  ar: '🇸🇦',
  zh: '🇨🇳',
  hi: '🇮🇳',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  ja: '🇯🇵',
  ko: '🇰🇷',
  pt: '🇧🇷',
  ru: '🇷🇺',
  tr: '🇹🇷',
  id: '🇮🇩',
  vi: '🇻🇳',
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showDialects = true,
  showQualityBadge = true,
  onLanguageChange,
  className,
}) => {
  const {
    selectedRegion,
    detectedRegion,
    regionName,
    isRTL,
    setRegion,
    resetToDetected,
  } = useRegionalDetection();

  const [selectedDialect, setSelectedDialect] = useState<string | null>(null);

  const handleLanguageSelect = (code: RegionalCode) => {
    setRegion(code);
    setSelectedDialect(null);
    onLanguageChange?.(code);
  };

  const handleDialectSelect = (dialectCode: string) => {
    setSelectedDialect(dialectCode);
    // Store dialect preference
    localStorage.setItem('genie_dialect', dialectCode);
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'premium':
        return (
          <Badge variant="default" className="text-[10px] px-1 py-0 h-4 bg-gradient-to-r from-amber-500 to-orange-500">
            <Sparkles className="h-2 w-2 mr-0.5" />
            Premium
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
            High
          </Badge>
        );
      default:
        return null;
    }
  };

  const currentFlag = FLAGS[selectedRegion] || '🌐';
  const hasDialects = DIALECTS[selectedRegion];

  // Compact variant (just icon)
  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
            <span className="text-lg">{currentFlag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {SUPPORTED_REGIONS.map(region => (
            <DropdownMenuItem
              key={region.code}
              onClick={() => handleLanguageSelect(region.code)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span>{FLAGS[region.code]}</span>
                <span>{region.name}</span>
              </span>
              {selectedRegion === region.code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Inline variant (horizontal buttons)
  if (variant === 'inline') {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {SUPPORTED_REGIONS.slice(0, 8).map(region => (
          <Button
            key={region.code}
            variant={selectedRegion === region.code ? "default" : "outline"}
            size="sm"
            onClick={() => handleLanguageSelect(region.code)}
            className="h-7 px-2"
          >
            <span className="mr-1">{FLAGS[region.code]}</span>
            {region.code.toUpperCase()}
          </Button>
        ))}
        {SUPPORTED_REGIONS.length > 8 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2">
                <Globe className="h-3 w-3 mr-1" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {SUPPORTED_REGIONS.slice(8).map(region => (
                <DropdownMenuItem
                  key={region.code}
                  onClick={() => handleLanguageSelect(region.code)}
                >
                  <span className="mr-2">{FLAGS[region.code]}</span>
                  {region.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <span className="text-lg">{currentFlag}</span>
          <span className="hidden sm:inline">{regionName}</span>
          {isRTL && (
            <Badge variant="outline" className="text-[10px] px-1 h-4">
              RTL
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Select Language
        </DropdownMenuLabel>
        
        {/* Auto-detect option */}
        {detectedRegion !== selectedRegion && (
          <>
            <DropdownMenuItem onClick={resetToDetected} className="text-primary">
              <Globe className="h-4 w-4 mr-2" />
              Auto-detect ({FLAGS[detectedRegion]} {SUPPORTED_REGIONS.find(r => r.code === detectedRegion)?.name})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Premium languages */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
            Premium Quality
          </DropdownMenuLabel>
          {SUPPORTED_REGIONS.filter(r => LANGUAGE_QUALITY[r.code] === 'premium').map(region => (
            <DropdownMenuItem
              key={region.code}
              onClick={() => handleLanguageSelect(region.code)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{FLAGS[region.code]}</span>
                <span>{region.name}</span>
              </span>
              <div className="flex items-center gap-2">
                {showQualityBadge && getQualityBadge('premium')}
                {selectedRegion === region.code && <Check className="h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* High quality languages */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
            High Quality
          </DropdownMenuLabel>
          {SUPPORTED_REGIONS.filter(r => LANGUAGE_QUALITY[r.code] === 'high').map(region => (
            <DropdownMenuItem
              key={region.code}
              onClick={() => handleLanguageSelect(region.code)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{FLAGS[region.code]}</span>
                <span>{region.name}</span>
              </span>
              <div className="flex items-center gap-2">
                {showQualityBadge && getQualityBadge('high')}
                {selectedRegion === region.code && <Check className="h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Standard languages */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
            Standard
          </DropdownMenuLabel>
          {SUPPORTED_REGIONS.filter(r => LANGUAGE_QUALITY[r.code] === 'standard').map(region => (
            <DropdownMenuItem
              key={region.code}
              onClick={() => handleLanguageSelect(region.code)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{FLAGS[region.code]}</span>
                <span>{region.name}</span>
              </span>
              {selectedRegion === region.code && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        {/* Dialect selection */}
        {showDialects && hasDialects && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
                Dialect / Variant
              </DropdownMenuLabel>
              {DIALECTS[selectedRegion].map(dialect => (
                <DropdownMenuItem
                  key={dialect.code}
                  onClick={() => handleDialectSelect(dialect.code)}
                  className="flex items-center justify-between pl-6"
                >
                  <span className="flex items-center gap-2">
                    <span>{dialect.flag}</span>
                    <span>{dialect.name}</span>
                  </span>
                  {selectedDialect === dialect.code && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
