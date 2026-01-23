/**
 * Regional Language Selector Component
 * 
 * Provides a unified UI for:
 * - Viewing auto-detected region & language
 * - Selecting preferred language from regional options
 * - Switching between regions
 * - Visual RTL indicator
 */

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Languages, 
  ChevronDown, 
  Check, 
  MapPin, 
  Settings,
  RefreshCw,
  AlignRight,
  AlignLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegionalLanguage } from '@/hooks/useRegionalLanguage';
import { RegionalCluster, RegionalLanguage } from '@/services/regionalLanguageService';

interface RegionalLanguageSelectorProps {
  className?: string;
  showRegionSelector?: boolean;
  showProviderInfo?: boolean;
  compact?: boolean;
}

export function RegionalLanguageSelector({
  className,
  showRegionSelector = true,
  showProviderInfo = false,
  compact = false,
}: RegionalLanguageSelectorProps) {
  const {
    preferences,
    isLoading,
    isRTL,
    detection,
    currentRegion,
    regionalLanguages,
    providerConfig,
    setLanguage,
    setRegion,
    refreshDetection,
    allRegions,
  } = useRegionalLanguage();

  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = regionalLanguages.find(
    (l) => l.code === preferences?.primaryLanguage
  ) || regionalLanguages[0];

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 animate-pulse', className)}>
        <div className="h-8 w-24 bg-muted rounded" />
      </div>
    );
  }

  // Compact version - just a select dropdown
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Select
          value={preferences?.primaryLanguage || 'en'}
          onValueChange={setLanguage}
        >
          <SelectTrigger className="w-[180px]">
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue>
              {currentLanguage?.nativeName || 'English'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {regionalLanguages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center justify-between w-full">
                  <span>{lang.nativeName}</span>
                  {lang.direction === 'rtl' && (
                    <AlignRight className="h-3 w-3 ml-2 text-muted-foreground" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isRTL && (
          <Badge variant="outline" className="text-xs">
            RTL
          </Badge>
        )}
      </div>
    );
  }

  // Full version with popover
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('flex items-center gap-2 min-w-[200px]', className)}
        >
          <Globe className="h-4 w-4" />
          <span className="flex-1 text-left truncate">
            {currentLanguage?.nativeName || 'English'}
          </span>
          {isRTL && (
            <Badge variant="secondary" className="text-[10px] px-1">
              RTL
            </Badge>
          )}
          {preferences?.detectedAutomatically && (
            <Badge variant="outline" className="text-[10px] px-1">
              Auto
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        <Tabs defaultValue="language" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="language" className="flex items-center gap-1">
              <Languages className="h-4 w-4" />
              Language
            </TabsTrigger>
            {showRegionSelector && (
              <TabsTrigger value="region" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Region
              </TabsTrigger>
            )}
          </TabsList>

          {/* Language Selection Tab */}
          <TabsContent value="language" className="p-4 space-y-4">
            {/* Detection Info */}
            {detection && preferences?.detectedAutomatically && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Detected: {detection.countryName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshDetection}
                  className="h-7 px-2"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Language Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {regionalLanguages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={
                    preferences?.primaryLanguage === lang.code
                      ? 'default'
                      : 'outline'
                  }
                  className="justify-start h-auto py-2 px-3"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-xs text-muted-foreground">
                        {lang.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {lang.direction === 'rtl' && (
                        <AlignRight className="h-3 w-3 text-muted-foreground" />
                      )}
                      {preferences?.primaryLanguage === lang.code && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Provider Info */}
            {showProviderInfo && (
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Text AI:</span>
                    <span className="font-mono">
                      {providerConfig.textProvider}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Translation:</span>
                    <span className="font-mono">
                      {providerConfig.translationProvider}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Voice:</span>
                    <span className="font-mono">
                      {providerConfig.voiceProvider}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Region Selection Tab */}
          {showRegionSelector && (
            <TabsContent value="region" className="p-4 space-y-2">
              {allRegions.map((region) => (
                <Button
                  key={region.id}
                  variant={currentRegion === region.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => {
                    setRegion(region.id);
                  }}
                >
                  <span className="text-xl mr-2">{region.flag}</span>
                  <span>{region.name}</span>
                  {currentRegion === region.id && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </Button>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

/**
 * RTL Layout Wrapper Component
 * Automatically applies RTL styling based on current language
 */
interface RTLLayoutWrapperProps {
  children: React.ReactNode;
  className?: string;
  forceDirection?: 'ltr' | 'rtl';
}

export function RTLLayoutWrapper({ 
  children, 
  className,
  forceDirection,
}: RTLLayoutWrapperProps) {
  const { isRTL, rtlClasses } = useRegionalLanguage();
  
  const direction = forceDirection || (isRTL ? 'rtl' : 'ltr');
  
  return (
    <div 
      dir={direction}
      className={cn(
        direction === 'rtl' && 'text-right',
        className
      )}
    >
      {children}
    </div>
  );
}

export default RegionalLanguageSelector;
