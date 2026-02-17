/**
 * Auto Configuration Panel
 * Displays automatic document configuration and model selection
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  ArrowRight, 
  Sparkles,
  Brain,
  Eye,
  Zap,
  Settings,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentTypeConfig } from '@/config/documentTypes';
import type { DocumentCharacteristics, ModelRoutingInfo } from './SmartDocumentStudio';

interface AutoConfigPanelProps {
  documentConfig: DocumentTypeConfig;
  modelRouting: ModelRoutingInfo | null;
  documentCharacteristics: DocumentCharacteristics | null;
}

export function AutoConfigPanel({
  documentConfig,
  modelRouting,
  documentCharacteristics
}: AutoConfigPanelProps) {
  const getModelIcon = (model: string) => {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('claude')) return '🟠';
    if (modelLower.includes('gemini')) return '🔵';
    if (modelLower.includes('openai') || modelLower.includes('gpt')) return '🟢';
    if (modelLower.includes('vision') || modelLower.includes('ocr')) return '👁️';
    return '🤖';
  };

  const getModelBadgeStyle = (model: string) => {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('claude')) return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
    if (modelLower.includes('gemini')) return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
    if (modelLower.includes('openai') || modelLower.includes('gpt')) return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
    if (modelLower.includes('vision') || modelLower.includes('ocr')) return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-muted text-muted-foreground';
  };

  const getPipelineDescription = () => {
    if (!modelRouting) return 'Auto-selecting optimal pipeline...';
    
    const descriptions: Record<string, string> = {
      'single': 'Single model processing',
      'sequential-hybrid': 'OCR → NLP two-stage pipeline',
      'hybrid_ocr_vision_ai': 'OCR + Vision AI hybrid',
      'vision_ai_only': 'Vision AI direct processing',
      'ocr_only': 'OCR text extraction only',
    };
    
    return descriptions[modelRouting.pipelineType] || modelRouting.pipelineType;
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border-primary/20">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Auto-Configuration
          <Badge variant="secondary" className="ml-auto gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Detection */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <span className="text-lg">{documentConfig.icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{documentConfig.title}</p>
            <p className="text-xs text-muted-foreground">
              Category: {documentConfig.category || 'General'}
            </p>
          </div>
        </div>

        {/* Pipeline Visualization */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            Processing Pipeline
          </p>
          
          {modelRouting ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Stage 1 */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Stage 1</p>
                  <Badge variant="outline" className={cn("text-xs", getModelBadgeStyle(modelRouting.stage1Model))}>
                    {getModelIcon(modelRouting.stage1Model)} {modelRouting.stage1Model}
                  </Badge>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />

              {/* Stage 2 */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Stage 2</p>
                  <Badge variant="outline" className={cn("text-xs", getModelBadgeStyle(modelRouting.stage2Model))}>
                    {getModelIcon(modelRouting.stage2Model)} {modelRouting.stage2Model}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Zap className="h-4 w-4" />
              Auto-selecting optimal models...
            </div>
          )}
        </div>

        {/* Selection Reason */}
        {modelRouting && (
          <div className="p-2 rounded-lg bg-muted/30 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings className="h-3 w-3" />
              <span className="font-medium">Selection Reason:</span>
              <span>{modelRouting.selectionReason.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground">
              <span>Pipeline: {getPipelineDescription()}</span>
              <span>Confidence: {Math.round(modelRouting.confidence * 100)}%</span>
              {modelRouting.processingTimeMs && (
                <span>Est. time: ~{Math.round(modelRouting.processingTimeMs / 1000)}s</span>
              )}
            </div>
          </div>
        )}

        {/* Document Characteristics Impact - Only show relevant badges */}
        {documentCharacteristics && (
          <div className="flex flex-wrap gap-2 text-xs">
            {/* Only show handwriting badge for forms that are actually handwritten */}
            {documentCharacteristics.isHandwritten && documentCharacteristics.isFilledForm && (
              <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900/30">
                ✏️ Handwriting detected → Enhanced OCR
              </Badge>
            )}
            {/* DICOM format detection */}
            {documentCharacteristics.format === 'dicom' && (
              <Badge variant="outline" className="gap-1 bg-purple-50 text-purple-700 dark:bg-purple-900/30">
                🏥 DICOM → Medical imaging pipeline
              </Badge>
            )}
            {/* Medical image indicator */}
            {documentConfig.category === 'medical-imaging' && documentCharacteristics.format === 'image' && (
              <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30">
                🔬 Medical Image → Vision AI Analysis
              </Badge>
            )}
            {/* Low quality warning */}
            {documentCharacteristics.quality === 'low' && (
              <Badge variant="outline" className="gap-1 bg-red-50 text-red-700 dark:bg-red-900/30">
                ⚠️ Low quality → Enhanced preprocessing
              </Badge>
            )}
            {/* Filled form indicator */}
            {documentCharacteristics.isFilledForm && !documentCharacteristics.isHandwritten && (
              <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 dark:bg-green-900/30">
                📝 Typed Form → Standard OCR
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AutoConfigPanel;
