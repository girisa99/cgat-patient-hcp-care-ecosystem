/**
 * AI MODEL INDICATOR COMPONENT
 * Displays which AI model was used to process a document with visual indicators
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot, Zap, Brain, Sparkles, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIProvider = 'claude' | 'gemini' | 'openai' | 'google_vision_ocr';
export type PipelineType = 'single' | 'sequential-hybrid' | 'hybrid_ocr_vision_ai' | 'vision_ai_only' | 'ocr_only' | 'vision_ai_fallback';

export interface ModelUsageInfo {
  primaryModel: AIProvider;
  modelUsed: AIProvider;
  selectionReason: 'explicit_config' | 'category_default' | 'content_analysis' | 'fallback';
  confidence: number;
  pipelineType: PipelineType;
  stage1Model?: AIProvider;
  stage2Model?: AIProvider;
  fallbacksAttempted?: AIProvider[];
  processingTimeMs?: number;
  ocrTextLength?: number;
  ocrConfidence?: number;
}

interface AIModelIndicatorProps {
  modelInfo: ModelUsageInfo;
  className?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
  showTooltip?: boolean;
}

const MODEL_CONFIG: Record<AIProvider, {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  claude: {
    name: 'Claude',
    icon: <Brain className="h-3 w-3" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  gemini: {
    name: 'Gemini',
    icon: <Sparkles className="h-3 w-3" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  openai: {
    name: 'OpenAI',
    icon: <Bot className="h-3 w-3" />,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  google_vision_ocr: {
    name: 'Google Vision OCR',
    icon: <Zap className="h-3 w-3" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  }
};

const REASON_LABELS: Record<string, string> = {
  'explicit_config': 'Configured',
  'category_default': 'Category default',
  'content_analysis': 'Auto-detected',
  'fallback': 'Fallback'
};

const PIPELINE_LABELS: Record<PipelineType, { label: string; description: string }> = {
  'hybrid_ocr_vision_ai': { label: 'Hybrid OCR + AI', description: 'Google Vision OCR → Vision AI structuring' },
  'vision_ai_only': { label: 'Vision AI Only', description: 'Direct Vision AI extraction' },
  'ocr_only': { label: 'OCR Only', description: 'Google Vision OCR only' },
  'vision_ai_fallback': { label: 'AI Fallback', description: 'Vision AI extraction after OCR failed' },
  'single': { label: 'Single Model', description: 'Single AI model extraction' },
  'sequential-hybrid': { label: 'Two-Stage', description: 'Vision → Clinical analysis' }
};

export const AIModelIndicator: React.FC<AIModelIndicatorProps> = ({
  modelInfo,
  className,
  variant = 'compact',
  showTooltip = true
}) => {
  const usedModel = MODEL_CONFIG[modelInfo.modelUsed] || MODEL_CONFIG.gemini;
  const primaryModel = MODEL_CONFIG[modelInfo.primaryModel] || MODEL_CONFIG.gemini;
  const usedFallback = modelInfo.primaryModel !== modelInfo.modelUsed;
  const isHybridPipeline = modelInfo.pipelineType === 'sequential-hybrid';
  const isOCRHybrid = modelInfo.pipelineType === 'hybrid_ocr_vision_ai';
  const pipelineInfo = PIPELINE_LABELS[modelInfo.pipelineType] || PIPELINE_LABELS['single'];

  const content = (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-md transition-all",
      variant === 'minimal' && "gap-1",
      variant === 'detailed' && "gap-2",
      className
    )}>
      {/* Minimal variant - just an icon */}
      {variant === 'minimal' && (
        <div className={cn(
          "flex items-center justify-center h-5 w-5 rounded",
          usedModel.bgColor,
          usedModel.color
        )}>
          {usedModel.icon}
        </div>
      )}

      {/* Compact variant - badge with icon and name */}
      {variant === 'compact' && (
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] h-5 px-1.5 gap-1",
            usedModel.bgColor,
            usedModel.borderColor,
            usedModel.color
          )}
        >
          {usedModel.icon}
          <span>{usedModel.name}</span>
          {usedFallback && (
            <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
          )}
        </Badge>
      )}

      {/* Detailed variant - full pipeline info */}
      {variant === 'detailed' && (
        <div className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-lg border",
          usedModel.bgColor,
          usedModel.borderColor
        )}>
          {/* OCR Hybrid Pipeline visualization */}
          {isOCRHybrid ? (
            <div className="flex items-center gap-1">
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded",
                MODEL_CONFIG.google_vision_ocr.bgColor,
                MODEL_CONFIG.google_vision_ocr.color
              )}>
                {MODEL_CONFIG.google_vision_ocr.icon}
                <span className="text-[10px] font-medium">OCR</span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded",
                usedModel.bgColor,
                usedModel.color
              )}>
                {usedModel.icon}
                <span className="text-[10px] font-medium">AI</span>
              </div>
            </div>
          ) : isHybridPipeline && modelInfo.stage1Model && modelInfo.stage2Model ? (
            <div className="flex items-center gap-1">
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded",
                (MODEL_CONFIG[modelInfo.stage1Model] || MODEL_CONFIG.gemini).bgColor,
                (MODEL_CONFIG[modelInfo.stage1Model] || MODEL_CONFIG.gemini).color
              )}>
                {(MODEL_CONFIG[modelInfo.stage1Model] || MODEL_CONFIG.gemini).icon}
                <span className="text-[10px] font-medium">Vision</span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded",
                (MODEL_CONFIG[modelInfo.stage2Model] || MODEL_CONFIG.claude).bgColor,
                (MODEL_CONFIG[modelInfo.stage2Model] || MODEL_CONFIG.claude).color
              )}>
                {(MODEL_CONFIG[modelInfo.stage2Model] || MODEL_CONFIG.claude).icon}
                <span className="text-[10px] font-medium">Clinical</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {usedModel.icon}
              <span className="text-xs font-medium">{usedModel.name}</span>
            </div>
          )}

          {/* Pipeline type badge */}
          <Badge variant="secondary" className="text-[9px] h-4">
            {pipelineInfo.label}
          </Badge>

          {/* Confidence indicator */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Zap className="h-3 w-3" />
            {Math.round(modelInfo.confidence * 100)}%
          </div>

          {/* OCR confidence if available */}
          {modelInfo.ocrConfidence && modelInfo.ocrConfidence > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-purple-600">
              <span>OCR: {Math.round(modelInfo.ocrConfidence * 100)}%</span>
            </div>
          )}

          {/* Processing time */}
          {modelInfo.processingTimeMs && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {(modelInfo.processingTimeMs / 1000).toFixed(1)}s
            </div>
          )}

          {/* Fallback indicator */}
          {usedFallback && (
            <Badge variant="secondary" className="text-[9px] h-4 bg-amber-100 text-amber-700">
              Fallback
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  if (!showTooltip || variant === 'detailed') {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <div className="font-medium">AI Model Information</div>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="text-muted-foreground">Model Used:</span>
              <span className="font-medium">{usedModel.name}</span>
              
              <span className="text-muted-foreground">Selection:</span>
              <span>{REASON_LABELS[modelInfo.selectionReason]}</span>
              
              <span className="text-muted-foreground">Confidence:</span>
              <span>{Math.round(modelInfo.confidence * 100)}%</span>
              
              <span className="text-muted-foreground">Pipeline:</span>
              <span>{pipelineInfo.label}</span>
              
              {isOCRHybrid && modelInfo.ocrConfidence && (
                <>
                  <span className="text-muted-foreground">OCR Confidence:</span>
                  <span className="text-purple-600">{Math.round(modelInfo.ocrConfidence * 100)}%</span>
                </>
              )}
              
              {modelInfo.processingTimeMs && (
                <>
                  <span className="text-muted-foreground">Processing:</span>
                  <span>{(modelInfo.processingTimeMs / 1000).toFixed(1)}s</span>
                </>
              )}
            </div>

            {usedFallback && (
              <div className="pt-1 border-t text-amber-600">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Primary model ({primaryModel.name}) failed, used fallback
              </div>
            )}

            {isOCRHybrid && (
              <div className="pt-1 border-t">
                <div className="text-muted-foreground mb-1">Pipeline stages:</div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[9px] border-purple-300 text-purple-600">
                    1. Google Vision OCR
                  </Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="outline" className="text-[9px]">
                    2. {usedModel.name} (AI Structuring)
                  </Badge>
                </div>
              </div>
            )}

            {isHybridPipeline && modelInfo.stage1Model && modelInfo.stage2Model && (
              <div className="pt-1 border-t">
                <div className="text-muted-foreground mb-1">Pipeline stages:</div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[9px]">
                    1. {(MODEL_CONFIG[modelInfo.stage1Model] || MODEL_CONFIG.gemini).name} (Vision)
                  </Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="outline" className="text-[9px]">
                    2. {(MODEL_CONFIG[modelInfo.stage2Model] || MODEL_CONFIG.claude).name} (Clinical)
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AIModelIndicator;
