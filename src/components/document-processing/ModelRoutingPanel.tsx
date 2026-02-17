/**
 * MODEL ROUTING PANEL COMPONENT
 * Shows the complete AI model routing decision for document processing
 * Displays Stage 1 (OCR), Stage 2 (NLP), routing reason, confidence, and fallback chain
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Bot, 
  Brain, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Layers,
  GitBranch,
  Target,
  Info,
  ScanLine,
  FileType,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIProvider = 'claude' | 'gemini' | 'openai' | 'google_vision_ocr';
export type PipelineType = 'single' | 'sequential-hybrid' | 'hybrid_ocr_vision_ai' | 'vision_ai_only' | 'ocr_only' | 'vision_ai_fallback';

export interface ModelRoutingInfo {
  primaryModel: AIProvider;
  modelUsed: AIProvider;
  selectionReason: 'explicit_config' | 'category_default' | 'content_analysis' | 'fallback';
  confidence: number;
  pipelineType: PipelineType;
  stage1Model?: AIProvider;
  stage2Model?: AIProvider;
  fallbacksAttempted?: AIProvider[];
  fallbackChain?: AIProvider[];
  processingTimeMs?: number;
  ocrTextLength?: number;
  ocrConfidence?: number;
  documentCategory?: string;
}

interface ModelRoutingPanelProps {
  routingInfo: ModelRoutingInfo;
  documentType?: string;
  className?: string;
  variant?: 'compact' | 'detailed' | 'full';
}

const MODEL_CONFIG: Record<AIProvider, {
  name: string;
  fullName: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  claude: {
    name: 'Claude',
    fullName: 'Claude Sonnet 4',
    icon: <Brain className="h-4 w-4" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Clinical reasoning, drug interactions, policy analysis'
  },
  gemini: {
    name: 'Gemini',
    fullName: 'Gemini 2.5 Flash',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Vision analysis, forms, handwriting, medical imaging'
  },
  openai: {
    name: 'GPT-5',
    fullName: 'GPT-5',
    icon: <Bot className="h-4 w-4" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Tables, invoices, financial calculations'
  },
  google_vision_ocr: {
    name: 'Google Vision',
    fullName: 'Google Cloud Vision OCR',
    icon: <ScanLine className="h-4 w-4" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'OCR text extraction from documents'
  }
};

const REASON_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  'explicit_config': { 
    label: 'Configured', 
    color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
    icon: <Target className="h-3 w-3" />,
    description: 'Model explicitly configured for this document type'
  },
  'category_default': { 
    label: 'Category Default', 
    color: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
    icon: <FileType className="h-3 w-3" />,
    description: 'Default model for document category'
  },
  'content_analysis': { 
    label: 'Auto-Detected', 
    color: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
    icon: <Brain className="h-3 w-3" />,
    description: 'Model selected based on content analysis'
  },
  'fallback': { 
    label: 'Fallback', 
    color: 'text-red-600 bg-red-500/10 border-red-500/30',
    icon: <AlertTriangle className="h-3 w-3" />,
    description: 'Primary model failed, using fallback'
  }
};

const PIPELINE_CONFIG: Record<PipelineType, { label: string; description: string; stages: number }> = {
  'hybrid_ocr_vision_ai': { 
    label: 'Hybrid (OCR → AI)', 
    description: 'Google Vision OCR extracts text, then AI structures data',
    stages: 2
  },
  'vision_ai_only': { 
    label: 'Vision AI Only', 
    description: 'Direct AI vision extraction without OCR',
    stages: 1
  },
  'ocr_only': { 
    label: 'OCR Only', 
    description: 'Text extracted via OCR without AI structuring',
    stages: 1
  },
  'vision_ai_fallback': { 
    label: 'AI Fallback', 
    description: 'OCR failed, falling back to Vision AI',
    stages: 1
  },
  'single': { 
    label: 'Single Model', 
    description: 'Single AI model for extraction',
    stages: 1
  },
  'sequential-hybrid': { 
    label: 'Two-Stage Pipeline', 
    description: 'Vision AI for detection → Clinical AI for analysis',
    stages: 2
  }
};

const DOCUMENT_TYPE_ROUTING: Record<string, { stage1: AIProvider; stage2: AIProvider; reason: string }> = {
  'prescription': { stage1: 'google_vision_ocr', stage2: 'claude', reason: 'Claude for clinical reasoning & drug interactions' },
  'lab-results': { stage1: 'google_vision_ocr', stage2: 'claude', reason: 'Claude for clinical interpretation of lab values' },
  'lab_result': { stage1: 'google_vision_ocr', stage2: 'claude', reason: 'Claude for clinical interpretation of lab values' },
  'medical_imaging': { stage1: 'gemini', stage2: 'claude', reason: 'Gemini Vision → Claude for clinical analysis' },
  'xray': { stage1: 'gemini', stage2: 'claude', reason: 'Gemini for imaging, Claude for clinical interpretation' },
  'ct-scan': { stage1: 'gemini', stage2: 'claude', reason: 'Gemini for imaging, Claude for clinical interpretation' },
  'ct_scan': { stage1: 'gemini', stage2: 'claude', reason: 'Gemini for imaging, Claude for clinical interpretation' },
  'mri': { stage1: 'gemini', stage2: 'claude', reason: 'Gemini for imaging, Claude for clinical interpretation' },
  'ecg': { stage1: 'gemini', stage2: 'claude', reason: 'Gemini for ECG patterns, Claude for clinical interpretation' },
  'ultrasound': { stage1: 'gemini', stage2: 'claude', reason: 'Gemini for imaging, Claude for clinical interpretation' },
  'invoice': { stage1: 'google_vision_ocr', stage2: 'openai', reason: 'GPT-5 excels at table extraction & calculations' },
  'receipt': { stage1: 'google_vision_ocr', stage2: 'openai', reason: 'GPT-5 for financial data extraction' },
  'insurance': { stage1: 'google_vision_ocr', stage2: 'claude', reason: 'Claude for policy analysis & coverage terms' },
  'insurance_card': { stage1: 'gemini', stage2: 'claude', reason: 'Gemini for ID fields, Claude for validation' },
  'identification': { stage1: 'gemini', stage2: 'gemini', reason: 'Gemini optimized for ID document extraction' },
  'passport': { stage1: 'gemini', stage2: 'gemini', reason: 'Gemini optimized for passport extraction' },
  'drivers-license': { stage1: 'gemini', stage2: 'gemini', reason: 'Gemini optimized for license extraction' },
  'form': { stage1: 'google_vision_ocr', stage2: 'gemini', reason: 'Gemini for form field detection & handwriting' },
  'patient-onboarding': { stage1: 'google_vision_ocr', stage2: 'gemini', reason: 'Gemini for form detection, patient data extraction' }
};

export const ModelRoutingPanel: React.FC<ModelRoutingPanelProps> = ({
  routingInfo,
  documentType = 'unknown',
  className,
  variant = 'detailed'
}) => {
  const usedModel = MODEL_CONFIG[routingInfo.modelUsed] || MODEL_CONFIG.gemini;
  const primaryModel = MODEL_CONFIG[routingInfo.primaryModel] || MODEL_CONFIG.gemini;
  const stage1Model = routingInfo.stage1Model ? MODEL_CONFIG[routingInfo.stage1Model] : MODEL_CONFIG.google_vision_ocr;
  const stage2Model = routingInfo.stage2Model ? MODEL_CONFIG[routingInfo.stage2Model] : usedModel;
  const usedFallback = routingInfo.primaryModel !== routingInfo.modelUsed;
  const reasonConfig = REASON_CONFIG[routingInfo.selectionReason] || REASON_CONFIG['category_default'];
  const pipelineConfig = PIPELINE_CONFIG[routingInfo.pipelineType] || PIPELINE_CONFIG['single'];
  
  // Get expected routing for document type
  const expectedRouting = DOCUMENT_TYPE_ROUTING[documentType];
  
  // Determine fallback chain to display
  const fallbackChain = routingInfo.fallbackChain || [
    ...(['claude', 'gemini', 'openai'] as AIProvider[]).filter(m => m !== routingInfo.primaryModel)
  ];

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 p-2 rounded-lg border bg-muted/30", className)}>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className={cn("text-xs gap-1", stage1Model.bgColor, stage1Model.borderColor, stage1Model.color)}>
            {stage1Model.icon}
            <span>Stage 1</span>
          </Badge>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className={cn("text-xs gap-1", stage2Model.bgColor, stage2Model.borderColor, stage2Model.color)}>
            {stage2Model.icon}
            <span>Stage 2</span>
          </Badge>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <Badge variant="outline" className={cn("text-xs", reasonConfig.color)}>
          {reasonConfig.icon}
          <span className="ml-1">{reasonConfig.label}</span>
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {Math.round(routingInfo.confidence * 100)}%
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Model Routing</CardTitle>
              <CardDescription className="text-xs">
                {pipelineConfig.label} • {pipelineConfig.stages} Stage{pipelineConfig.stages > 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className={cn("gap-1", reasonConfig.color)}>
                    {reasonConfig.icon}
                    {reasonConfig.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{reasonConfig.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        {/* Pipeline Visualization */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            Processing Pipeline
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            {/* Stage 1 */}
            <div className={cn(
              "flex-1 p-3 rounded-lg border-2",
              stage1Model.bgColor,
              stage1Model.borderColor
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded", stage1Model.bgColor)}>
                  {stage1Model.icon}
                </div>
                <div>
                  <div className={cn("text-sm font-medium", stage1Model.color)}>Stage 1: OCR</div>
                  <div className="text-[10px] text-muted-foreground">{stage1Model.fullName}</div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{stage1Model.description}</p>
              {routingInfo.ocrConfidence && (
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={routingInfo.ocrConfidence * 100} className="h-1 flex-1" />
                  <span className="text-[10px] text-muted-foreground">{Math.round(routingInfo.ocrConfidence * 100)}%</span>
                </div>
              )}
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-5 w-5 text-primary" />
              <span className="text-[9px] text-muted-foreground">→ NLP</span>
            </div>

            {/* Stage 2 */}
            <div className={cn(
              "flex-1 p-3 rounded-lg border-2",
              stage2Model.bgColor,
              stage2Model.borderColor
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded", stage2Model.bgColor)}>
                  {stage2Model.icon}
                </div>
                <div>
                  <div className={cn("text-sm font-medium", stage2Model.color)}>Stage 2: NLP</div>
                  <div className="text-[10px] text-muted-foreground">{stage2Model.fullName}</div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{stage2Model.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={routingInfo.confidence * 100} className="h-1 flex-1" />
                <span className="text-[10px] text-muted-foreground">{Math.round(routingInfo.confidence * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Routing Details */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Why this model? */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-muted-foreground" />
              Why This Routing?
            </div>
            <div className="p-2 rounded-lg bg-muted/30 text-xs space-y-1">
              {expectedRouting ? (
                <p className="text-muted-foreground">{expectedRouting.reason}</p>
              ) : (
                <p className="text-muted-foreground">
                  {routingInfo.selectionReason === 'explicit_config' 
                    ? `Optimized model for ${documentType} documents`
                    : routingInfo.selectionReason === 'content_analysis'
                    ? 'AI analyzed document content to select best model'
                    : `Default model for ${routingInfo.documentCategory || 'general'} category`
                  }
                </p>
              )}
            </div>
          </div>

          {/* Right: Fallback Chain */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Fallback Chain
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {fallbackChain.map((provider, idx) => {
                const config = MODEL_CONFIG[provider];
                const wasAttempted = routingInfo.fallbacksAttempted?.includes(provider);
                return (
                  <React.Fragment key={provider}>
                    {idx > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] gap-1",
                        wasAttempted ? "border-red-500/50 text-red-600" : "",
                        config?.bgColor,
                        config?.borderColor
                      )}
                    >
                      {config?.icon}
                      {config?.name}
                      {wasAttempted && <AlertTriangle className="h-2.5 w-2.5" />}
                    </Badge>
                  </React.Fragment>
                );
              })}
            </div>
            {usedFallback && (
              <p className="text-[10px] text-amber-600">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Primary model ({primaryModel.name}) unavailable, using {usedModel.name}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-medium">{Math.round(routingInfo.confidence * 100)}%</span>
            </div>
            {routingInfo.processingTimeMs && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{(routingInfo.processingTimeMs / 1000).toFixed(1)}s</span>
              </div>
            )}
            {routingInfo.ocrTextLength && (
              <div className="flex items-center gap-1.5">
                <FileType className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">OCR chars:</span>
                <span className="font-medium">{routingInfo.ocrTextLength.toLocaleString()}</span>
              </div>
            )}
          </div>
          <Badge variant="secondary" className="text-[10px]">
            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
            {pipelineConfig.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelRoutingPanel;
