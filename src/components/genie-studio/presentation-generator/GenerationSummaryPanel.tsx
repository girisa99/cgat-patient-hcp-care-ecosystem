/**
 * Generation Summary Panel
 * 
 * Shows summary of all configured languages before generation.
 * Displays estimated time, model configs, and allows final review.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Globe,
  Play,
  Clock,
  Layers,
  Brain,
  Image as ImageIcon,
  Mic,
  Settings,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Zap,
  Crown,
  Sparkles,
  FileText,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageModelConfig } from '@/services/agentPresentationGeneratorService';
import { SUPPORTED_LANGUAGES, LanguageConfig } from './MultiLanguageGenerator';

interface LanguageGenerationStatus {
  languageCode: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress: number;
  currentSlide: number;
  totalSlides: number;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number;
  error?: string;
}

interface GenerationSummaryPanelProps {
  languages: string[];
  primaryLanguage: string;
  modelConfigs: LanguageModelConfig[];
  slideCount: number;
  collateralType: string;
  generationStatus: Map<string, LanguageGenerationStatus>;
  isGenerating: boolean;
  onEditLanguage: (languageCode: string) => void;
  onStartGeneration: () => void;
  onCancel: () => void;
}

const tierInfo: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  fast: { label: 'Fast', icon: <Zap className="h-3 w-3" />, color: 'text-blue-500' },
  balanced: { label: 'Balanced', icon: <Sparkles className="h-3 w-3" />, color: 'text-yellow-500' },
  premium: { label: 'Premium', icon: <Crown className="h-3 w-3" />, color: 'text-purple-500' },
};

function getModelTier(modelId: string): string {
  if (modelId.includes('pro') || modelId === 'openai/gpt-5') return 'premium';
  if (modelId.includes('flash') || modelId.includes('mini')) return 'fast';
  return 'balanced';
}

function estimateGenerationTime(slideCount: number, languages: number, models: LanguageModelConfig[]): number {
  // Base: 30 seconds per slide for primary
  let baseTime = slideCount * 30;
  
  // Model tier affects time
  for (const config of models) {
    const tier = getModelTier(config.textModel);
    if (tier === 'premium') baseTime *= 1.3;
    else if (tier === 'fast') baseTime *= 0.7;
  }
  
  // Additional languages add 50% time each (parallel but still processing)
  baseTime *= 1 + (languages - 1) * 0.5;
  
  return Math.ceil(baseTime);
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function LanguageStatusCard({
  languageCode,
  config,
  isPrimary,
  status,
  isGenerating,
  onEdit,
}: {
  languageCode: string;
  config: LanguageModelConfig;
  isPrimary: boolean;
  status?: LanguageGenerationStatus;
  isGenerating: boolean;
  onEdit: () => void;
}) {
  const language = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
  const textTier = getModelTier(config.textModel);
  const imageTier = getModelTier(config.imageModel);
  const tierData = tierInfo[textTier] || tierInfo.balanced;

  const getStatusIcon = () => {
    if (!status) return null;
    switch (status.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      isPrimary && "ring-2 ring-primary/30 bg-primary/5",
      status?.status === 'generating' && "border-primary",
      status?.status === 'complete' && "border-green-500/50",
      status?.status === 'error' && "border-destructive/50",
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{language?.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{language?.name}</span>
              {isPrimary && (
                <Badge variant="default" className="text-[9px] px-1.5">Primary</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {!isGenerating && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Model badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge variant="outline" className="text-[9px] gap-1">
          <Brain className="h-2.5 w-2.5" />
          {config.textModel.split('/')[1]?.replace('-', ' ')}
        </Badge>
        <Badge variant="outline" className="text-[9px] gap-1">
          <ImageIcon className="h-2.5 w-2.5" />
          {config.imageModel.split('/')[1]?.replace('-', ' ').substring(0, 15)}
        </Badge>
        {config.voiceModel && (
          <Badge variant="outline" className="text-[9px] gap-1">
            <Mic className="h-2.5 w-2.5" />
            {config.voiceModel}
          </Badge>
        )}
      </div>

      {/* Progress bar during generation */}
      {status?.status === 'generating' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Slide {status.currentSlide} of {status.totalSlides}</span>
            <span>{Math.round(status.progress)}%</span>
          </div>
          <Progress value={status.progress} className="h-1.5" />
          {status.estimatedTimeRemaining && (
            <div className="text-[9px] text-muted-foreground text-right">
              ~{formatDuration(status.estimatedTimeRemaining)} remaining
            </div>
          )}
        </div>
      )}

      {status?.status === 'complete' && (
        <div className="text-[10px] text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Complete
          {status.completedAt && status.startedAt && (
            <span className="text-muted-foreground ml-1">
              ({formatDuration(Math.round((status.completedAt.getTime() - status.startedAt.getTime()) / 1000))})
            </span>
          )}
        </div>
      )}

      {status?.status === 'error' && (
        <div className="text-[10px] text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {status.error || 'Generation failed'}
        </div>
      )}
    </div>
  );
}

export function GenerationSummaryPanel({
  languages,
  primaryLanguage,
  modelConfigs,
  slideCount,
  collateralType,
  generationStatus,
  isGenerating,
  onEditLanguage,
  onStartGeneration,
  onCancel,
}: GenerationSummaryPanelProps) {
  const estimatedTime = estimateGenerationTime(slideCount, languages.length, modelConfigs);

  // Sort languages with primary first
  const sortedLanguages = [...languages].sort((a, b) => {
    if (a === primaryLanguage) return -1;
    if (b === primaryLanguage) return 1;
    return 0;
  });

  const completedCount = Array.from(generationStatus.values()).filter(s => s.status === 'complete').length;
  const overallProgress = languages.length > 0 
    ? (completedCount / languages.length) * 100 
    : 0;

  return (
    <Card className="border-muted">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Generation Summary
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Review configuration before generating {languages.length} language version{languages.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            {slideCount} slides
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {/* Estimated Time */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Estimated Time</div>
              <div className="text-xs text-muted-foreground">
                {languages.length} language{languages.length > 1 ? 's' : ''} × {slideCount} slides
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">{formatDuration(estimatedTime)}</div>
            <div className="text-[10px] text-muted-foreground">approximate</div>
          </div>
        </div>

        {/* Overall Progress (during generation) */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span>{completedCount} / {languages.length} complete</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        )}

        <Separator />

        {/* Language Configurations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4" />
              Language Configurations
            </div>
            {!isGenerating && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Settings className="h-3 w-3" />
                Edit All
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2 pr-2">
              {sortedLanguages.map(langCode => {
                const config = modelConfigs.find(c => c.languageCode === langCode) || {
                  languageCode: langCode,
                  textModel: 'google/gemini-3-flash-preview',
                  imageModel: 'google/gemini-2.5-flash-image-preview',
                };
                const status = generationStatus.get(langCode);

                return (
                  <LanguageStatusCard
                    key={langCode}
                    languageCode={langCode}
                    config={config as LanguageModelConfig}
                    isPrimary={langCode === primaryLanguage}
                    status={status}
                    isGenerating={isGenerating}
                    onEdit={() => onEditLanguage(langCode)}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel Generation
              </Button>
              <div className="text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                Generating...
              </div>
            </>
          ) : (
            <Button
              onClick={onStartGeneration}
              className="w-full gap-2"
              size="lg"
            >
              <Play className="h-4 w-4" />
              Generate {languages.length} Presentation{languages.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Info */}
        {!isGenerating && (
          <div className="text-[10px] text-muted-foreground text-center">
            Primary language ({SUPPORTED_LANGUAGES.find(l => l.code === primaryLanguage)?.name}) 
            will generate first with live preview
          </div>
        )}
      </CardContent>
    </Card>
  );
}
