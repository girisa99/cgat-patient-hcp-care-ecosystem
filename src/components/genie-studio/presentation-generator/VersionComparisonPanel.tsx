/**
 * Version Comparison Panel
 * 
 * Provides:
 * - Language dropdown with version history (v1, v2, v3...)
 * - Compare mode (2-3 presentations)
 * - Always compares against primary language
 * - Confidence scores display
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Globe,
  GitCompare,
  ChevronDown,
  Check,
  X,
  Star,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Equal,
  Eye,
  Download,
  RotateCw,
  Sparkles,
  FileText,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresentationVersion } from '@/services/agentPresentationGeneratorService';
import { GeneratedSlide } from '@/services/universalPresentationService';
import { SUPPORTED_LANGUAGES } from './MultiLanguageGenerator';

interface VersionData {
  id: string;
  version: number;
  languageCode: string;
  slides: GeneratedSlide[];
  confidenceScore: number;
  createdAt: Date;
  status: 'draft' | 'approved' | 'rejected';
}

interface VersionComparisonPanelProps {
  versions: PresentationVersion[];
  primaryLanguage: string;
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  selectedVersion: number;
  onVersionChange: (version: number) => void;
  compareLanguages: string[];
  onCompareLanguagesChange: (languages: string[]) => void;
  onApprove: (languageCode: string, version: number) => void;
  onReject: (languageCode: string, version: number) => void;
  onRegenerate: (languageCode: string) => void;
  onEnhance: (languageCode: string, slideIndex?: number) => void;
  onDownload: (languageCode: string, version: number) => void;
}

function getConfidenceColor(score: number): string {
  if (score >= 85) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  return 'text-red-500';
}

function getConfidenceIcon(score: number) {
  if (score >= 85) return <TrendingUp className="h-3 w-3" />;
  if (score >= 70) return <Equal className="h-3 w-3" />;
  return <TrendingDown className="h-3 w-3" />;
}

function LanguageVersionDropdown({
  languageCode,
  isPrimary,
  versions,
  selectedVersion,
  onVersionChange,
  onSelect,
  isSelected,
}: {
  languageCode: string;
  isPrimary: boolean;
  versions: PresentationVersion[];
  selectedVersion: number;
  onVersionChange: (version: number) => void;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const language = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
  const languageVersions = versions.filter(v => v.languageCode === languageCode);
  const currentVersion = languageVersions[selectedVersion - 1];
  const confidenceScore = currentVersion?.confidenceScores?.overall ?? 0;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
        isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <span className="text-lg">{language?.flag}</span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{language?.name}</span>
          {isPrimary && (
            <Badge variant="default" className="text-[8px] px-1">Primary</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 mt-0.5">
          {/* Version dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 gap-0.5">
                v{selectedVersion}
                <ChevronDown className="h-2.5 w-2.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              {languageVersions.map((_, idx) => (
                <DropdownMenuItem 
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVersionChange(idx + 1);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Version {idx + 1}</span>
                    {idx + 1 === selectedVersion && <Check className="h-3 w-3" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Confidence score */}
          <div className={cn("flex items-center gap-0.5 text-[10px]", getConfidenceColor(confidenceScore))}>
            {getConfidenceIcon(confidenceScore)}
            {confidenceScore.toFixed(0)}%
          </div>
        </div>
      </div>

      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
    </div>
  );
}

function SlideComparisonCard({
  slideIndex,
  primarySlide,
  compareSlides,
  languageCodes,
}: {
  slideIndex: number;
  primarySlide: GeneratedSlide;
  compareSlides: (GeneratedSlide | undefined)[];
  languageCodes: string[];
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 px-3 py-1.5 border-b">
        <span className="text-xs font-medium">Slide {slideIndex + 1}: {primarySlide.title}</span>
      </div>
      
      <div className={cn(
        "grid gap-2 p-2",
        compareSlides.length === 1 ? "grid-cols-2" : 
        compareSlides.length === 2 ? "grid-cols-3" : "grid-cols-1"
      )}>
        {/* Primary slide */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Star className="h-3 w-3 text-yellow-500" />
            Primary
          </div>
          <div className="p-2 bg-card rounded border text-xs">
            <div className="font-medium truncate">{primarySlide.title}</div>
            <div className="text-muted-foreground line-clamp-2 mt-1">
              {primarySlide.content?.bullets?.[0] || '...'}
            </div>
          </div>
        </div>

        {/* Compare slides */}
        {compareSlides.map((slide, idx) => {
          const lang = SUPPORTED_LANGUAGES.find(l => l.code === languageCodes[idx]);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span>{lang?.flag}</span>
                {lang?.name}
              </div>
              <div className="p-2 bg-card rounded border text-xs">
              {slide ? (
                  <>
                    <div className="font-medium truncate">{slide.title}</div>
                    <div className="text-muted-foreground line-clamp-2 mt-1">
                      {slide.content?.bullets?.[0] || '...'}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground italic">No data</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VersionComparisonPanel({
  versions,
  primaryLanguage,
  selectedLanguage,
  onLanguageChange,
  selectedVersion,
  onVersionChange,
  compareLanguages,
  onCompareLanguagesChange,
  onApprove,
  onReject,
  onRegenerate,
  onEnhance,
  onDownload,
}: VersionComparisonPanelProps) {
  const [activeTab, setActiveTab] = useState<'review' | 'compare'>('review');
  const [localVersions, setLocalVersions] = useState<Map<string, number>>(new Map());

  // Get unique languages from versions
  const availableLanguages = useMemo(() => {
    const langs = new Set(versions.map(v => v.languageCode));
    return Array.from(langs);
  }, [versions]);

  // Get versions for current language
  const languageVersions = versions.filter(v => v.languageCode === selectedLanguage);
  const currentVersion = languageVersions[selectedVersion - 1];

  // Get primary version for comparison
  const primaryVersions = versions.filter(v => v.languageCode === primaryLanguage);
  const currentPrimaryVersion = primaryVersions[0];

  // Toggle compare language
  const toggleCompareLanguage = (langCode: string) => {
    if (langCode === primaryLanguage) return; // Can't compare primary with itself
    
    const current = [...compareLanguages];
    const idx = current.indexOf(langCode);
    
    if (idx >= 0) {
      current.splice(idx, 1);
    } else if (current.length < 2) { // Max 2 (+ primary = 3 total)
      current.push(langCode);
    }
    
    onCompareLanguagesChange(current);
  };

  // Get compare version data
  const compareVersionsData = compareLanguages.map(langCode => {
    const versionNum = localVersions.get(langCode) || 1;
    const langVersions = versions.filter(v => v.languageCode === langCode);
    return langVersions[versionNum - 1];
  });

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            Version Review & Comparison
          </CardTitle>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="h-7">
              <TabsTrigger value="review" className="text-xs px-2 h-5">Review</TabsTrigger>
              <TabsTrigger value="compare" className="text-xs px-2 h-5">Compare</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {/* Language Selection */}
        <div className="space-y-2 mb-4">
          <div className="text-xs text-muted-foreground">Select Language</div>
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-1.5 pr-2">
              {availableLanguages.map(langCode => {
                const langVersions = versions.filter(v => v.languageCode === langCode);
                return (
                  <LanguageVersionDropdown
                    key={langCode}
                    languageCode={langCode}
                    isPrimary={langCode === primaryLanguage}
                    versions={versions}
                    selectedVersion={localVersions.get(langCode) || 1}
                    onVersionChange={(v) => {
                      setLocalVersions(prev => new Map(prev).set(langCode, v));
                      if (langCode === selectedLanguage) {
                        onVersionChange(v);
                      }
                    }}
                    onSelect={() => onLanguageChange(langCode)}
                    isSelected={langCode === selectedLanguage}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <TabsContent value="review" className="mt-0 space-y-3">
          {currentVersion ? (
            <>
              {/* Confidence Summary */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "text-2xl font-bold",
                    getConfidenceColor(currentVersion.confidenceScores?.overall ?? 0)
                  )}>
                    {(currentVersion.confidenceScores?.overall ?? 0).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confidence Score
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => onRegenerate(selectedLanguage)}
                  >
                    <RotateCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => onEnhance(selectedLanguage)}
                  >
                    <Sparkles className="h-3 w-3" />
                    Enhance
                  </Button>
                </div>
              </div>

              {/* Slide-by-slide confidence */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium">Slide Confidence</div>
                <ScrollArea className="max-h-[150px]">
                  <div className="space-y-1 pr-2">
                    {currentVersion.confidenceScores?.slides?.map((slideScore, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 cursor-pointer"
                        onClick={() => onEnhance(selectedLanguage, idx)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                          <span className="text-xs truncate max-w-[150px]">
                            {currentVersion.slidesData[idx]?.title || `Slide ${idx + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {slideScore.issues?.length > 0 && (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                          <span className={cn("text-xs font-medium", getConfidenceColor(slideScore.score))}>
                            {slideScore.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => onReject(selectedLanguage, selectedVersion)}
                >
                  <X className="h-3 w-3" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => onApprove(selectedLanguage, selectedVersion)}
                >
                  <Check className="h-3 w-3" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => onDownload(selectedLanguage, selectedVersion)}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No version selected
            </div>
          )}
        </TabsContent>

        <TabsContent value="compare" className="mt-0 space-y-3">
          {/* Compare Language Selection */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Select up to 2 languages to compare with primary (max 3 total)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableLanguages.filter(l => l !== primaryLanguage).map(langCode => {
                const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
                const isSelected = compareLanguages.includes(langCode);
                
                return (
                  <Button
                    key={langCode}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => toggleCompareLanguage(langCode)}
                    disabled={!isSelected && compareLanguages.length >= 2}
                  >
                    <span>{lang?.flag}</span>
                    {lang?.name}
                    {isSelected && <Check className="h-3 w-3" />}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Comparison View */}
          {currentPrimaryVersion && compareLanguages.length > 0 ? (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2 pr-2">
                {currentPrimaryVersion.slidesData.map((primarySlide, idx) => (
                  <SlideComparisonCard
                    key={idx}
                    slideIndex={idx}
                    primarySlide={primarySlide}
                    compareSlides={compareVersionsData.map(v => v?.slidesData[idx])}
                    languageCodes={compareLanguages}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <GitCompare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Select languages to compare
            </div>
          )}
        </TabsContent>
      </CardContent>
    </Card>
  );
}
