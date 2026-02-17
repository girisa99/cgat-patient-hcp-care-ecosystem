/**
 * CONFIDENCE SCORE CARD
 * 
 * Displays confidence scores for generated assets (script, audio, video)
 * with visual indicators and improvement suggestions.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileText, Volume2, Video, Music,
  CheckCircle2, AlertTriangle, XCircle,
  Info, RefreshCw, Loader2, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConfidenceFactors } from '@/services/executionEngines/ConfidenceLoopEngine';

interface AssetConfidence {
  type: 'script' | 'audio' | 'video' | 'music';
  status: 'pending' | 'generating' | 'complete' | 'error';
  overallScore?: number; // 0-100
  factors?: ConfidenceFactors;
  suggestions?: string[];
  iterations?: number;
  provider?: string;
}

interface ConfidenceScoreCardProps {
  chapterId: string;
  chapterTitle: string;
  assets: AssetConfidence[];
  onRegenerate?: (chapterId: string, assetType: 'script' | 'audio' | 'video' | 'music') => void;
  isRegenerating?: string | null;
  className?: string;
}

const ASSET_ICONS = {
  script: FileText,
  audio: Volume2,
  video: Video,
  music: Music,
};

const ASSET_LABELS = {
  script: 'Script',
  audio: 'Voice',
  video: 'Visual',
  music: 'Music',
};

const TARGET_CONFIDENCE = 95; // Our 95% target

export const ConfidenceScoreCard: React.FC<ConfidenceScoreCardProps> = ({
  chapterId,
  chapterTitle,
  assets,
  onRegenerate,
  isRegenerating,
  className,
}) => {
  // Calculate overall chapter quality
  const completedAssets = assets.filter(a => a.status === 'complete' && a.overallScore !== undefined);
  const avgScore = completedAssets.length > 0
    ? Math.round(completedAssets.reduce((sum, a) => sum + (a.overallScore || 0), 0) / completedAssets.length)
    : 0;

  const getScoreColor = (score?: number) => {
    if (!score) return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' };
    if (score >= TARGET_CONFIDENCE) return { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-500/30' };
    if (score >= 80) return { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-500/30' };
    return { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-500/30' };
  };

  const getStatusIcon = (status: AssetConfidence['status'], score?: number) => {
    if (status === 'pending') return <AlertTriangle className="w-3 h-3 text-muted-foreground" />;
    if (status === 'generating') return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
    if (status === 'error') return <XCircle className="w-3 h-3 text-red-500" />;
    
    if (score !== undefined) {
      if (score >= TARGET_CONFIDENCE) return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      if (score >= 80) return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      return <XCircle className="w-3 h-3 text-red-500" />;
    }
    
    return <CheckCircle2 className="w-3 h-3 text-green-500" />;
  };

  return (
    <div className={cn("border rounded-lg p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium">Quality Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Target: {TARGET_CONFIDENCE}%</span>
          {avgScore > 0 && (
            <Badge 
              variant="outline" 
              className={cn("text-xs", getScoreColor(avgScore).border, getScoreColor(avgScore).text)}
            >
              Overall: {avgScore}%
            </Badge>
          )}
        </div>
      </div>

      {/* Asset Scores Grid */}
      <div className="grid grid-cols-2 gap-3">
        {assets.map((asset) => {
          const Icon = ASSET_ICONS[asset.type];
          const label = ASSET_LABELS[asset.type];
          const colors = getScoreColor(asset.overallScore);
          const needsImprovement = asset.overallScore !== undefined && asset.overallScore < TARGET_CONFIDENCE;
          
          return (
            <TooltipProvider key={asset.type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "p-3 rounded-lg border transition-all hover:shadow-sm",
                      asset.status === 'complete' ? colors.border : 'border-muted',
                      needsImprovement && "bg-amber-50/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                      {getStatusIcon(asset.status, asset.overallScore)}
                    </div>

                    {/* Score Bar */}
                    {asset.status === 'complete' && asset.overallScore !== undefined ? (
                      <div className="space-y-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all", colors.bg)}
                            style={{ width: `${asset.overallScore}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs font-medium", colors.text)}>
                            {asset.overallScore}%
                          </span>
                          {asset.iterations && (
                            <span className="text-[10px] text-muted-foreground">
                              {asset.iterations} iteration{asset.iterations > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : asset.status === 'generating' ? (
                      <div className="text-xs text-muted-foreground">Generating...</div>
                    ) : asset.status === 'error' ? (
                      <div className="text-xs text-red-600">Generation failed</div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Not generated</div>
                    )}

                    {/* Regenerate button for low scores */}
                    {needsImprovement && onRegenerate && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full h-6 mt-2 text-[10px]"
                        onClick={() => onRegenerate(chapterId, asset.type)}
                        disabled={isRegenerating === asset.type}
                      >
                        {isRegenerating === asset.type ? (
                          <><Loader2 className="w-2 h-2 mr-1 animate-spin" /> Improving...</>
                        ) : (
                          <><RefreshCw className="w-2 h-2 mr-1" /> Improve Quality</>
                        )}
                      </Button>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px]">
                  <div className="space-y-2">
                    <p className="font-medium text-xs">{label} Quality Details</p>
                    
                    {asset.factors && (
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span>Provider Quality:</span>
                          <span>{Math.round(asset.factors.providerResponseQuality * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Language Accuracy:</span>
                          <span>{Math.round(asset.factors.languageAccuracy * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format Compliance:</span>
                          <span>{Math.round(asset.factors.formatCompliance * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Content Relevance:</span>
                          <span>{Math.round(asset.factors.contentRelevance * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Technical Quality:</span>
                          <span>{Math.round(asset.factors.technicalQuality * 100)}%</span>
                        </div>
                      </div>
                    )}
                    
                    {asset.suggestions && asset.suggestions.length > 0 && (
                      <div className="border-t pt-1 mt-1">
                        <p className="text-[10px] text-muted-foreground mb-1">Suggestions:</p>
                        <ul className="text-[10px] list-disc pl-3">
                          {asset.suggestions.slice(0, 3).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {asset.provider && (
                      <p className="text-[10px] text-muted-foreground border-t pt-1">
                        Provider: {asset.provider}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Improvement Tips */}
      {assets.some(a => a.overallScore !== undefined && a.overallScore < TARGET_CONFIDENCE) && (
        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-medium">Quality below {TARGET_CONFIDENCE}% target</p>
              <p className="text-amber-700 mt-0.5">
                Click "Improve Quality" to regenerate with enhanced prompts. 
                The system will iterate up to 5 times to achieve optimal results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfidenceScoreCard;
