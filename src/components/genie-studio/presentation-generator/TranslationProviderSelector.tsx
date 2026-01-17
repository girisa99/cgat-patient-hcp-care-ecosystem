/**
 * Translation Provider Selector Component
 * 
 * Allows users to select translation providers with:
 * - Provider comparison view
 * - Confidence scoring per language pair
 * - Feature comparison
 * - Cost estimates
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Globe,
  Zap,
  Crown,
  Building2,
  Sparkles,
  Bot,
  Target,
  Check,
  X,
  Info,
  TrendingUp,
  DollarSign,
  Clock,
  Languages,
  Shield,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TranslationProvider,
  TranslationProviderConfig,
  TRANSLATION_PROVIDERS,
  LANGUAGE_PAIR_RECOMMENDATIONS,
  INDUSTRY_RECOMMENDATIONS,
  IndustrySegment,
  IndustryRecommendation,
  LanguagePairRecommendation,
  translationService,
} from '@/services/translationService';
import { SUPPORTED_LANGUAGES } from './MultiLanguageGenerator';

interface TranslationProviderSelectorProps {
  sourceLanguage: string;
  targetLanguages: string[];
  selectedProvider: TranslationProvider;
  onProviderChange: (provider: TranslationProvider) => void;
  showConfidenceScores?: boolean;
  industrySegment?: IndustrySegment;
  onIndustryChange?: (segment: IndustrySegment) => void;
  className?: string;
}

const providerIcons: Record<TranslationProvider, React.ElementType> = {
  google_translate: Globe,
  deepl: Target,
  microsoft: Building2,
  amazon: Zap,
  ai_gemini: Sparkles,
  ai_gpt: Bot,
  ai_gpt_mini: Zap,
  ai_claude: Bot,
  ai_claude_35: Crown,
  meta_nllb: Globe,
  qwen_mt: Languages,
};

const tierColors: Record<string, string> = {
  fast: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  balanced: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  premium: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  enterprise: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
};

const confidenceColors = (confidence: number): string => {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.8) return 'text-emerald-600';
  if (confidence >= 0.7) return 'text-yellow-600';
  return 'text-orange-600';
};

function ProviderCard({
  config,
  isSelected,
  avgConfidence,
  onSelect,
}: {
  config: TranslationProviderConfig;
  isSelected: boolean;
  avgConfidence: number;
  onSelect: () => void;
}) {
  const Icon = providerIcons[config.id];
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary border-primary bg-primary/5'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-2 rounded-lg',
              isSelected ? 'bg-primary/20' : 'bg-muted'
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{config.name}</h4>
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className={cn('text-[9px] px-1.5', tierColors[config.tier])}
                >
                  {config.tier}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {config.supportedLanguages}+ languages
                </span>
              </div>
            </div>
          </div>
          {isSelected && (
            <div className="p-1 bg-primary rounded-full">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {config.description}
        </p>

        {/* Confidence Score */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Confidence Score</span>
            <span className={cn('font-semibold', confidenceColors(avgConfidence))}>
              {(avgConfidence * 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={avgConfidence * 100} className="h-1.5" />
        </div>

        {/* Quick Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {config.features.formality && (
            <Badge variant="secondary" className="text-[8px] px-1">
              Formality
            </Badge>
          )}
          {config.features.glossary && (
            <Badge variant="secondary" className="text-[8px] px-1">
              Glossary
            </Badge>
          )}
          {config.features.contextAware && (
            <Badge variant="secondary" className="text-[8px] px-1">
              Context-Aware
            </Badge>
          )}
          {config.features.realtime && (
            <Badge variant="secondary" className="text-[8px] px-1">
              Real-time
            </Badge>
          )}
        </div>

        {/* Cost Estimate */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>~${(config.costPerChar * 1000).toFixed(3)}/1k chars</span>
          </div>
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-5 px-2 text-[10px]">
                <Info className="h-3 w-3 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {config.name}
                </DialogTitle>
                <DialogDescription>{config.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Strengths */}
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Strengths
                  </h5>
                  <ul className="space-y-1">
                    {config.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-600" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <X className="h-4 w-4 text-orange-600" />
                    Limitations
                  </h5>
                  <ul className="space-y-1">
                    {config.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <X className="h-3 w-3 text-orange-600" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best For */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Best For</h5>
                  <div className="flex flex-wrap gap-1">
                    {config.bestFor.map((b, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {b}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features Grid */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Features</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(config.features).map(([feature, enabled]) => (
                      <div
                        key={feature}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg text-sm',
                          enabled ? 'bg-green-500/10' : 'bg-muted'
                        )}
                      >
                        {enabled ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfidenceMatrix({
  sourceLanguage,
  targetLanguages,
}: {
  sourceLanguage: string;
  targetLanguages: string[];
}) {
  const confidenceData = useMemo(() => {
    const data: Array<{
      provider: TranslationProvider;
      name: string;
      scores: Map<string, number>;
      average: number;
    }> = [];

    for (const provider of TRANSLATION_PROVIDERS) {
      const scores = new Map<string, number>();
      let total = 0;

      for (const target of targetLanguages) {
        const confidence = translationService.getProviderConfidence(
          provider.id,
          sourceLanguage,
          target
        );
        scores.set(target, confidence);
        total += confidence;
      }

      data.push({
        provider: provider.id,
        name: provider.name,
        scores,
        average: targetLanguages.length > 0 ? total / targetLanguages.length : 0,
      });
    }

    return data.sort((a, b) => b.average - a.average);
  }, [sourceLanguage, targetLanguages]);

  const getLangName = (code: string) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name || code;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-medium">Provider</th>
            {targetLanguages.map((lang) => (
              <th key={lang} className="text-center p-2 font-medium">
                <div className="flex flex-col items-center">
                  <span className="text-lg">
                    {SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.flag || '🌐'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {getLangName(lang)}
                  </span>
                </div>
              </th>
            ))}
            <th className="text-center p-2 font-medium">Average</th>
          </tr>
        </thead>
        <tbody>
          {confidenceData.map((row) => (
            <tr key={row.provider} className="border-b hover:bg-muted/50">
              <td className="p-2">
                <div className="flex items-center gap-2">
                  {React.createElement(providerIcons[row.provider], {
                    className: 'h-4 w-4',
                  })}
                  <span className="text-xs">{row.name}</span>
                </div>
              </td>
              {targetLanguages.map((lang) => {
                const score = row.scores.get(lang) || 0;
                return (
                  <td key={lang} className="text-center p-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span
                            className={cn(
                              'font-mono text-xs font-semibold',
                              confidenceColors(score)
                            )}
                          >
                            {(score * 100).toFixed(0)}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {row.name}: {sourceLanguage.toUpperCase()} → {lang.toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Confidence: {(score * 100).toFixed(1)}%
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                );
              })}
              <td className="text-center p-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono',
                    confidenceColors(row.average)
                  )}
                >
                  {(row.average * 100).toFixed(0)}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Language Pair Recommendations Panel
function LanguagePairRecommendationsPanel({
  sourceLanguage,
  targetLanguages,
  selectedProvider,
  onProviderChange,
}: {
  sourceLanguage: string;
  targetLanguages: string[];
  selectedProvider: TranslationProvider;
  onProviderChange: (provider: TranslationProvider) => void;
}) {
  const recommendations = useMemo(() => {
    return targetLanguages.map(target => {
      const rec = translationService.getLanguagePairRecommendation(sourceLanguage, target);
      return { target, recommendation: rec };
    });
  }, [sourceLanguage, targetLanguages]);

  const getLangName = (code: string) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name || code;
  };

  const getLangFlag = (code: string) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.flag || '🌐';
  };

  if (targetLanguages.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <TrendingUp className="h-4 w-4 text-primary" />
        Language Pair Recommendations
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {recommendations.map(({ target, recommendation }) => {
          if (!recommendation) return null;
          const recProvider = TRANSLATION_PROVIDERS.find(p => p.id === recommendation.recommendedProvider);
          const Icon = providerIcons[recommendation.recommendedProvider];
          const isSelected = selectedProvider === recommendation.recommendedProvider;

          return (
            <div
              key={target}
              className={cn(
                "p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50",
                isSelected && "bg-primary/5 border-primary"
              )}
              onClick={() => onProviderChange(recommendation.recommendedProvider)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {/* Language Pair Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getLangFlag(sourceLanguage)}</span>
                    <span className="text-xs text-muted-foreground">{getLangName(sourceLanguage)}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-lg">{getLangFlag(target)}</span>
                    <span className="text-xs text-muted-foreground">{getLangName(target)}</span>
                  </div>

                  {/* Recommended Provider */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      "p-1.5 rounded",
                      isSelected ? "bg-primary/20" : "bg-muted"
                    )}>
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <span className="font-medium text-sm">{recProvider?.name}</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] px-1.5",
                        confidenceColors(recommendation.confidenceScore)
                      )}
                    >
                      {(recommendation.confidenceScore * 100).toFixed(0)}%
                    </Badge>
                    {isSelected && (
                      <Badge className="text-[9px] px-1.5 bg-primary/20 text-primary border-0">
                        Selected
                      </Badge>
                    )}
                  </div>

                  {/* Reasoning */}
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                    {recommendation.reasoning}
                  </p>

                  {/* Considerations */}
                  <div className="flex flex-wrap gap-1">
                    {recommendation.considerations.slice(0, 3).map((c, i) => (
                      <Badge key={i} variant="secondary" className="text-[8px] px-1">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Alternatives */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-muted-foreground">Alternatives:</span>
                  {recommendation.alternativeProviders.slice(0, 2).map(alt => {
                    const altProvider = TRANSLATION_PROVIDERS.find(p => p.id === alt);
                    const AltIcon = providerIcons[alt];
                    return (
                      <TooltipProvider key={alt}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-[10px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                onProviderChange(alt);
                              }}
                            >
                              {AltIcon && <AltIcon className="h-3 w-3 mr-1" />}
                              {altProvider?.name?.split(' ')[0]}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{altProvider?.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {altProvider?.description}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>

              {/* Content Type Bonuses */}
              {Object.keys(recommendation.contentTypeBonus).length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed">
                  <span className="text-[9px] text-muted-foreground">Content-specific recommendations: </span>
                  {Object.entries(recommendation.contentTypeBonus).map(([type, provider]) => {
                    const bonusProvider = TRANSLATION_PROVIDERS.find(p => p.id === provider);
                    return (
                      <Badge 
                        key={type} 
                        variant="outline" 
                        className="text-[8px] px-1 mx-0.5 cursor-pointer hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProviderChange(provider);
                        }}
                      >
                        {type}: {bonusProvider?.name?.split(' ')[0]}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Add missing ArrowRight import - already have it but define inline
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

// Industry Segment Selector Component
function IndustrySegmentSelector({
  selectedSegment,
  onSegmentChange,
  selectedProvider,
  onProviderChange,
}: {
  selectedSegment?: IndustrySegment;
  onSegmentChange?: (segment: IndustrySegment) => void;
  selectedProvider: TranslationProvider;
  onProviderChange: (provider: TranslationProvider) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayedSegments = showAll ? INDUSTRY_RECOMMENDATIONS : INDUSTRY_RECOMMENDATIONS.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Building2 className="h-4 w-4 text-primary" />
          Industry-Specific Recommendations
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px]"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : `Show All (${INDUSTRY_RECOMMENDATIONS.length})`}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {displayedSegments.map((industry) => {
          const isSelected = selectedSegment === industry.segment;
          const providerConfig = TRANSLATION_PROVIDERS.find(p => p.id === industry.primaryProvider);
          const Icon = providerIcons[industry.primaryProvider];

          return (
            <div
              key={industry.segment}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
                isSelected && "bg-primary/5 border-primary ring-1 ring-primary"
              )}
              onClick={() => {
                onSegmentChange?.(industry.segment);
                onProviderChange(industry.primaryProvider);
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{industry.icon}</span>
                <span className="text-xs font-medium">{industry.name}</span>
              </div>
              
              <div className="flex items-center gap-1.5 mb-1">
                {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
                <span className="text-[10px] text-muted-foreground">
                  {providerConfig?.name}
                </span>
              </div>

              <p className="text-[9px] text-muted-foreground line-clamp-2">
                {industry.reasoning}
              </p>

              {industry.considerations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {industry.considerations.slice(0, 2).map((c, i) => (
                    <Badge key={i} variant="secondary" className="text-[7px] px-1 py-0">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              {isSelected && Object.keys(industry.languageOverrides).length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed">
                  <span className="text-[8px] text-muted-foreground">Language overrides:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(industry.languageOverrides).map(([lang, provider]) => {
                      const overrideProvider = TRANSLATION_PROVIDERS.find(p => p.id === provider);
                      return (
                        <Badge 
                          key={lang}
                          variant="outline" 
                          className="text-[7px] px-1 cursor-pointer hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onProviderChange(provider);
                          }}
                        >
                          {lang.toUpperCase()}: {overrideProvider?.name?.split(' ')[0]}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TranslationProviderSelector({
  sourceLanguage,
  targetLanguages,
  selectedProvider,
  onProviderChange,
  showConfidenceScores = true,
  industrySegment,
  onIndustryChange,
  className,
}: TranslationProviderSelectorProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'matrix' | 'recommendations' | 'industry'>('recommendations');

  // Calculate average confidence for each provider
  const providerConfidences = useMemo(() => {
    const confidences = new Map<TranslationProvider, number>();

    for (const provider of TRANSLATION_PROVIDERS) {
      if (targetLanguages.length === 0) {
        confidences.set(provider.id, provider.avgConfidence);
        continue;
      }

      let total = 0;
      for (const target of targetLanguages) {
        total += translationService.getProviderConfidence(
          provider.id,
          sourceLanguage,
          target
        );
      }
      confidences.set(provider.id, total / targetLanguages.length);
    }

    return confidences;
  }, [sourceLanguage, targetLanguages]);

  // Get recommended provider
  const recommendedProvider = useMemo(() => {
    if (targetLanguages.length === 0) return 'ai_gemini';
    return translationService.getRecommendedProvider(sourceLanguage, targetLanguages[0]);
  }, [sourceLanguage, targetLanguages]);

  // Group providers by type - including specialized
  const apiProviders = TRANSLATION_PROVIDERS.filter(
    (p) => !p.id.startsWith('ai_') && !['meta_nllb', 'qwen_mt'].includes(p.id)
  );
  const aiProviders = TRANSLATION_PROVIDERS.filter((p) => p.id.startsWith('ai_'));
  const specializedProviders = TRANSLATION_PROVIDERS.filter(
    (p) => ['meta_nllb', 'qwen_mt'].includes(p.id)
  );

  return (
    <Card className={cn('border-muted', className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Translation Provider
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Select a translation engine for generating multi-language content
            </CardDescription>
          </div>
          {showConfidenceScores && (
            <div className="flex items-center gap-1 flex-wrap">
              <Button
                variant={viewMode === 'recommendations' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setViewMode('recommendations')}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Languages
              </Button>
              <Button
                variant={viewMode === 'industry' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setViewMode('industry')}
              >
                <Building2 className="h-3 w-3 mr-1" />
                Industry
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              {targetLanguages.length > 0 && (
                <Button
                  variant={viewMode === 'matrix' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setViewMode('matrix')}
                >
                  Matrix
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {viewMode === 'industry' ? (
          <IndustrySegmentSelector
            selectedSegment={industrySegment}
            onSegmentChange={onIndustryChange}
            selectedProvider={selectedProvider}
            onProviderChange={onProviderChange}
          />
        ) : viewMode === 'recommendations' && targetLanguages.length > 0 ? (
          <LanguagePairRecommendationsPanel
            sourceLanguage={sourceLanguage}
            targetLanguages={targetLanguages}
            selectedProvider={selectedProvider}
            onProviderChange={onProviderChange}
          />
        ) : viewMode === 'matrix' && targetLanguages.length > 0 ? (
          <ConfidenceMatrix
            sourceLanguage={sourceLanguage}
            targetLanguages={targetLanguages}
          />
        ) : (
          <Tabs defaultValue="api" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="api" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                APIs
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Models
              </TabsTrigger>
              <TabsTrigger value="specialized" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Specialized
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="mt-3">
              <div className="grid grid-cols-2 gap-3">
                {apiProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    config={provider}
                    isSelected={selectedProvider === provider.id}
                    avgConfidence={providerConfidences.get(provider.id) || provider.avgConfidence}
                    onSelect={() => onProviderChange(provider.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-3">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {aiProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    config={provider}
                    isSelected={selectedProvider === provider.id}
                    avgConfidence={providerConfidences.get(provider.id) || provider.avgConfidence}
                    onSelect={() => onProviderChange(provider.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="specialized" className="mt-3">
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Specialized models for specific language families and use cases.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {specializedProviders.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      config={provider}
                      isSelected={selectedProvider === provider.id}
                      avgConfidence={providerConfidences.get(provider.id) || provider.avgConfidence}
                      onSelect={() => onProviderChange(provider.id)}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground p-2 bg-muted/50 rounded-lg">
                  <strong>Meta NLLB-200:</strong> Best for rare/African/indigenous languages (200+ supported)<br/>
                  <strong>Qwen-MT:</strong> Best for Chinese and CJK languages with business terminology
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Recommendation */}
        {viewMode !== 'recommendations' && recommendedProvider && recommendedProvider !== selectedProvider && (
          <div className="mt-3 p-2 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs">
                  <span className="font-medium">Recommended:</span>{' '}
                  {TRANSLATION_PROVIDERS.find((p) => p.id === recommendedProvider)?.name}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onProviderChange(recommendedProvider)}
              >
                Use Recommended
              </Button>
            </div>
          </div>
        )}

        {/* Selected Provider Info */}
        {selectedProvider && (
          <div className="mt-3 p-2 bg-muted/50 rounded-lg text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span>
                Selected: <span className="font-medium">{TRANSLATION_PROVIDERS.find((p) => p.id === selectedProvider)?.name}</span>
                {' • '}
                Avg. Confidence: <span className={cn('font-semibold', confidenceColors(providerConfidences.get(selectedProvider) || 0))}>
                  {((providerConfidences.get(selectedProvider) || 0) * 100).toFixed(0)}%
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TranslationProviderSelector;
