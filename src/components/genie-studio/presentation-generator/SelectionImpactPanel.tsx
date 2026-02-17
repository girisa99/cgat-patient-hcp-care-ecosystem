/**
 * Selection Impact Panel
 * Shows confidence delta when users select different providers
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  Sparkles,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TranslationProvider,
  ProviderSelectionImpact,
  ImpactLevel,
  ContentType,
  TRANSLATION_PROVIDERS,
  translationService,
} from '@/services/translationService';

interface SelectionImpactPanelProps {
  selectedProvider: TranslationProvider;
  sourceLanguage: string;
  targetLanguages: string[];
  contentType?: ContentType;
  onUseRecommended?: (provider: TranslationProvider) => void;
  className?: string;
}

const impactColors: Record<ImpactLevel, string> = {
  major_improvement: 'text-green-600 bg-green-50 border-green-200',
  improvement: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  neutral: 'text-blue-600 bg-blue-50 border-blue-200',
  degradation: 'text-amber-600 bg-amber-50 border-amber-200',
  major_degradation: 'text-red-600 bg-red-50 border-red-200',
};

const impactIcons: Record<ImpactLevel, React.ElementType> = {
  major_improvement: TrendingUp,
  improvement: TrendingUp,
  neutral: Minus,
  degradation: TrendingDown,
  major_degradation: AlertTriangle,
};

const qualityColors: Record<string, string> = {
  excellent: 'text-green-600',
  good: 'text-emerald-600',
  acceptable: 'text-blue-600',
  fair: 'text-amber-600',
  poor: 'text-red-600',
};

export function SelectionImpactPanel({
  selectedProvider,
  sourceLanguage,
  targetLanguages,
  contentType,
  onUseRecommended,
  className,
}: SelectionImpactPanelProps) {
  if (targetLanguages.length === 0) return null;

  const multiImpact = translationService.getMultiLanguageSelectionImpact(
    selectedProvider,
    sourceLanguage,
    targetLanguages,
    contentType
  );

  const { impacts, overallImpact } = multiImpact;
  const selectedName = TRANSLATION_PROVIDERS.find(p => p.id === selectedProvider)?.name || selectedProvider;

  return (
    <Card className={cn('border-muted', className)}>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Selection Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        {/* Overall Impact Summary */}
        <div className={cn(
          'p-3 rounded-lg border',
          overallImpact.overallValidity ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {overallImpact.overallValidity ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <span className="font-medium text-sm">
              {overallImpact.overallValidity 
                ? `${selectedName} is a valid choice`
                : `Consider alternatives for some languages`
              }
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Average confidence delta: {' '}
            <span className={cn(
              'font-semibold',
              overallImpact.averageDelta >= 0 ? 'text-green-600' : 'text-amber-600'
            )}>
              {overallImpact.averageDelta >= 0 ? '+' : ''}{overallImpact.averageDelta.toFixed(1)}%
            </span>
          </p>
        </div>

        {/* Per-Language Impact */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Per Language Impact</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {Array.from(impacts.entries()).map(([lang, impact]) => {
              const ImpactIcon = impactIcons[impact.impactLevel];
              return (
                <div
                  key={lang}
                  className={cn(
                    'p-2 rounded-lg border text-xs',
                    impactColors[impact.impactLevel]
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImpactIcon className="h-3 w-3" />
                      <span className="font-medium">{lang.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {impact.confidenceDelta >= 0 ? '+' : ''}{(impact.deltaPercentage).toFixed(1)}%
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 opacity-70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">{impact.impactDescription}</p>
                            <div className="mt-2 text-xs">
                              <p>Quality: <span className={qualityColors[impact.qualityPrediction.overallQuality]}>
                                {impact.qualityPrediction.overallQuality}
                              </span></p>
                              <p>Expected Accuracy: {impact.qualityPrediction.expectedAccuracy.toFixed(0)}%</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {!impact.userChoiceValid && onUseRecommended && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px]">
                        Recommended: {TRANSLATION_PROVIDERS.find(p => p.id === impact.recommendedProvider)?.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[10px] px-2"
                        onClick={() => onUseRecommended(impact.recommendedProvider)}
                      >
                        Use <ArrowRight className="h-2 w-2 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Prediction for First Language */}
        {targetLanguages.length > 0 && impacts.get(targetLanguages[0]) && (
          <div className="p-2 bg-muted/50 rounded-lg">
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Quality Prediction ({targetLanguages[0].toUpperCase()})
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-muted-foreground">Accuracy:</span>
                <Progress 
                  value={impacts.get(targetLanguages[0])!.qualityPrediction.expectedAccuracy} 
                  className="h-1 mt-1" 
                />
              </div>
              <div>
                <span className="text-muted-foreground">Fluency:</span>
                <Progress 
                  value={impacts.get(targetLanguages[0])!.qualityPrediction.fluencyScore} 
                  className="h-1 mt-1" 
                />
              </div>
              <div>
                <span className="text-muted-foreground">Terminology:</span>
                <Progress 
                  value={impacts.get(targetLanguages[0])!.qualityPrediction.terminologyScore} 
                  className="h-1 mt-1" 
                />
              </div>
              <div>
                <span className="text-muted-foreground">Context:</span>
                <Progress 
                  value={impacts.get(targetLanguages[0])!.qualityPrediction.contextRetention} 
                  className="h-1 mt-1" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Risks & Opportunities */}
        {targetLanguages.length > 0 && impacts.get(targetLanguages[0]) && (
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {impacts.get(targetLanguages[0])!.riskFactors.length > 0 && (
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                <h5 className="font-medium text-amber-700 mb-1">⚠️ Risks</h5>
                <ul className="space-y-0.5 text-amber-600">
                  {impacts.get(targetLanguages[0])!.riskFactors.slice(0, 2).map((risk, i) => (
                    <li key={i}>• {risk}</li>
                  ))}
                </ul>
              </div>
            )}
            {impacts.get(targetLanguages[0])!.opportunities.length > 0 && (
              <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-700 mb-1">✓ Benefits</h5>
                <ul className="space-y-0.5 text-green-600">
                  {impacts.get(targetLanguages[0])!.opportunities.slice(0, 2).map((opp, i) => (
                    <li key={i}>• {opp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <p className="text-[9px] text-muted-foreground text-center">
          Your choice is always respected. This analysis helps you make informed decisions.
        </p>
      </CardContent>
    </Card>
  );
}

export default SelectionImpactPanel;
