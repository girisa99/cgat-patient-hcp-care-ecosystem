/**
 * Language Bundle Selector Component
 * 
 * Unified UI for:
 * - Viewing auto-detected bundle & languages
 * - Adding additional languages beyond bundle
 * - Removing custom languages
 * - Switching bundles/regions
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
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  Languages, 
  ChevronDown, 
  Check, 
  MapPin,
  Plus,
  X,
  RefreshCw,
  AlignRight,
  Search,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageBundles } from '@/hooks/useLanguageBundles';
import type { BundleType, LanguageInfo } from '@/services/regionLanguageBundles';

interface LanguageBundleSelectorProps {
  className?: string;
  showBundleInfo?: boolean;
  compact?: boolean;
}

export function LanguageBundleSelector({
  className,
  showBundleInfo = true,
  compact = false,
}: LanguageBundleSelectorProps) {
  const {
    config,
    isLoading,
    currentBundle,
    allBundles,
    enabledLanguages,
    bundleLanguages,
    additionalLanguages,
    availableToAdd,
    primaryLanguage,
    isRTL,
    llmZone,
    addLanguage,
    removeLanguage,
    setPrimaryLanguage,
    setBundle,
    refreshDetection,
    isLanguageInBundle,
  } = useLanguageBundles();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAvailable = availableToAdd.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 animate-pulse', className)}>
        <div className="h-9 w-32 bg-muted rounded-md" />
      </div>
    );
  }

  // Compact version
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Select
          value={primaryLanguage?.code || 'en'}
          onValueChange={setPrimaryLanguage}
        >
          <SelectTrigger className="w-[180px]">
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue>
              {primaryLanguage?.nativeName || 'English'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Enabled Languages</SelectLabel>
              {enabledLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{lang.nativeName}</span>
                    {lang.direction === 'rtl' && (
                      <AlignRight className="h-3 w-3 ml-2 text-muted-foreground" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {isRTL && (
          <Badge variant="outline" className="text-xs">RTL</Badge>
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
          className={cn('flex items-center gap-2 min-w-[220px] justify-between', className)}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="truncate">
              {primaryLanguage?.nativeName || 'English'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isRTL && (
              <Badge variant="secondary" className="text-[10px] px-1">RTL</Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1">
              {enabledLanguages.length}
            </Badge>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[450px] p-0" align="start">
        <Tabs defaultValue="languages" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="languages" className="flex items-center gap-1">
              <Languages className="h-4 w-4" />
              Languages
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add More
            </TabsTrigger>
            <TabsTrigger value="bundle" className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              Bundle
            </TabsTrigger>
          </TabsList>

          {/* Languages Tab */}
          <TabsContent value="languages" className="p-4 space-y-4">
            {/* Bundle Info */}
            {showBundleInfo && currentBundle && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentBundle.flag}</span>
                  <div>
                    <span className="font-medium">{currentBundle.name}</span>
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {llmZone.toUpperCase()} Zone
                    </Badge>
                  </div>
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

            {/* Primary Language Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Language</label>
              <Select
                value={primaryLanguage?.code || 'en'}
                onValueChange={setPrimaryLanguage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {enabledLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.nativeName}</span>
                        <span className="text-muted-foreground">({lang.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enabled Languages Grid */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Enabled Languages ({enabledLanguages.length})
              </label>
              <ScrollArea className="h-[200px]">
                <div className="grid grid-cols-2 gap-2">
                  {enabledLanguages.map((lang) => (
                    <div
                      key={lang.code}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md border",
                        primaryLanguage?.code === lang.code && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{lang.nativeName}</span>
                        <span className="text-xs text-muted-foreground">{lang.code}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {lang.direction === 'rtl' && (
                          <AlignRight className="h-3 w-3 text-muted-foreground" />
                        )}
                        {isLanguageInBundle(lang.code) ? (
                          <Badge variant="secondary" className="text-[10px]">Bundle</Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeLanguage(lang.code)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Add Languages Tab */}
          <TabsContent value="add" className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[280px]">
              <div className="space-y-1">
                {filteredAvailable.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery ? 'No languages found' : 'All languages enabled'}
                  </p>
                ) : (
                  filteredAvailable.map((lang) => (
                    <Button
                      key={lang.code}
                      variant="ghost"
                      className="w-full justify-between h-auto py-2"
                      onClick={() => {
                        addLanguage(lang.code);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lang.nativeName}</span>
                        <span className="text-muted-foreground text-sm">
                          ({lang.name})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lang.direction === 'rtl' && (
                          <Badge variant="outline" className="text-[10px]">RTL</Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {lang.region}
                        </Badge>
                        <Plus className="h-4 w-4" />
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Bundle Selection Tab */}
          <TabsContent value="bundle" className="p-4 space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              Select a regional bundle to get pre-configured language support
            </p>
            {allBundles.map((bundle) => (
              <Button
                key={bundle.id}
                variant={currentBundle?.id === bundle.id ? 'default' : 'outline'}
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  setBundle(bundle.id);
                }}
              >
                <span className="text-xl mr-3">{bundle.flag}</span>
                <div className="flex flex-col items-start flex-1">
                  <span className="font-medium">{bundle.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {bundle.description} • {bundle.languages.length} languages
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {bundle.llmZone.toUpperCase()}
                  </Badge>
                  {currentBundle?.id === bundle.id && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </Button>
            ))}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

export default LanguageBundleSelector;
