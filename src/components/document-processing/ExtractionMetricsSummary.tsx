/**
 * ExtractionMetricsSummary Component
 * Displays OCR/Vision AI extraction metrics AFTER document processing is complete
 * Shows: OCR contribution, Vision AI fields, model used, processing pipeline info
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Camera, 
  FileText, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Cpu,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtractionMetricsSummaryProps {
  extractedFields: Record<string, { value: string; confidence: number; source?: string }>;
  validationResults?: {
    passed: number;
    warnings: number;
    failed: number;
  };
  processingTime?: number; // in ms
  ocrProvider?: string;
  visionAiProvider?: string;
  isHandwritten?: boolean;
  className?: string;
}

export const ExtractionMetricsSummary: React.FC<ExtractionMetricsSummaryProps> = ({
  extractedFields,
  validationResults,
  processingTime,
  ocrProvider = 'Google Vision',
  visionAiProvider = 'Gemini 2.5 Flash',
  isHandwritten = false,
  className
}) => {
  // Extract metadata from fields (these are hidden from display but contain pipeline info)
  const ocrTextLength = parseInt(extractedFields['_ocr_text_length']?.value || '0', 10);
  const ocrConfidence = extractedFields['_ocr_confidence']?.value || '';
  const pipelineType = extractedFields['_pipeline_type']?.value || 'vision_ai_only';
  const hasOcrPipeline = ocrTextLength > 0 || pipelineType.includes('ocr') || pipelineType.includes('hybrid');
  
  // Count visible fields (exclude internal metadata)
  const EXCLUDED_FIELDS = [
    'line_items', 'tables', 'raw_text', 
    'detected_document_type', 'document_category',
    '_pipeline_type', '_ocr_text_length', '_ocr_confidence'
  ];
  
  const visibleFields = Object.entries(extractedFields).filter(([key]) => 
    !key.startsWith('_') && !EXCLUDED_FIELDS.includes(key) && extractedFields[key]?.value
  );
  
  const totalFieldCount = visibleFields.length;
  
  // Count fields by source
  const ocrFieldCount = visibleFields.filter(([_, data]) => {
    const src = (data.source || '').toLowerCase();
    return src.includes('ocr') && !src.includes('vision') && !src.includes('gemini');
  }).length;
  
  const visionAiFieldCount = visibleFields.filter(([_, data]) => {
    const src = (data.source || '').toLowerCase();
    return src.includes('vision') || src.includes('gemini') || src.includes('claude') || 
           src.includes('openai') || src.includes('extraction') || src.includes('ai');
  }).length;
  
  // Fields with no explicit source - attribute to Vision AI if pipeline is hybrid (OCR feeds Vision AI)
  const unattributedCount = totalFieldCount - ocrFieldCount - visionAiFieldCount;
  const effectiveVisionAiCount = visionAiFieldCount + (hasOcrPipeline ? unattributedCount : 0);
  const effectiveOcrCount = hasOcrPipeline ? Math.max(ocrFieldCount, 1) : ocrFieldCount; // At least 1 if OCR was used
  
  // Calculate average confidence
  const avgConfidence = visibleFields.length > 0
    ? visibleFields.reduce((sum, [_, data]) => sum + (data.confidence || 0), 0) / visibleFields.length
    : 0;
  
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card className={cn("bg-gradient-to-r from-muted/30 via-background to-muted/30 border-border/50", className)}>
      <CardContent className="pt-4 space-y-4">
        {/* Pipeline Info */}
        <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Camera className={cn("h-4 w-4", hasOcrPipeline ? "text-blue-500" : "text-muted-foreground")} />
              <span className="text-muted-foreground">OCR:</span>
              <span className="font-medium">{hasOcrPipeline ? ocrProvider : 'Not Used'}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-muted-foreground">Vision AI:</span>
              <span className="font-medium">{visionAiProvider}</span>
            </div>
          </div>
          {isHandwritten && (
            <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-600">
              Handwriting Mode
            </Badge>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Total Fields */}
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <FileText className="h-4 w-4 mx-auto text-primary mb-1" />
            <div className="text-xl font-bold text-primary">{totalFieldCount}</div>
            <div className="text-[10px] text-muted-foreground">Total Fields</div>
          </div>
          
          {/* OCR Contribution */}
          <div className={cn(
            "p-3 rounded-lg text-center",
            hasOcrPipeline ? "bg-blue-500/10" : "bg-muted/30"
          )}>
            <Camera className={cn("h-4 w-4 mx-auto mb-1", hasOcrPipeline ? "text-blue-600" : "text-muted-foreground")} />
            <div className={cn("text-xl font-bold", hasOcrPipeline ? "text-blue-600" : "text-muted-foreground")}>
              {hasOcrPipeline ? (ocrTextLength > 0 ? `${(ocrTextLength / 1000).toFixed(1)}k` : 'Active') : '0'}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {hasOcrPipeline ? (ocrConfidence || 'OCR Chars') : 'OCR Chars'}
            </div>
          </div>
          
          {/* Vision AI Fields */}
          <div className="p-3 bg-purple-500/10 rounded-lg text-center">
            <Brain className="h-4 w-4 mx-auto text-purple-600 mb-1" />
            <div className="text-xl font-bold text-purple-600">{effectiveVisionAiCount}</div>
            <div className="text-[10px] text-muted-foreground">Vision AI</div>
          </div>
          
          {/* Average Confidence */}
          <div className={cn(
            "p-3 rounded-lg text-center",
            avgConfidence >= 0.85 ? "bg-green-500/10" : avgConfidence >= 0.7 ? "bg-yellow-500/10" : "bg-red-500/10"
          )}>
            <CheckCircle className={cn(
              "h-4 w-4 mx-auto mb-1",
              avgConfidence >= 0.85 ? "text-green-600" : avgConfidence >= 0.7 ? "text-yellow-600" : "text-red-600"
            )} />
            <div className={cn(
              "text-xl font-bold",
              avgConfidence >= 0.85 ? "text-green-600" : avgConfidence >= 0.7 ? "text-yellow-600" : "text-red-600"
            )}>
              {Math.round(avgConfidence * 100)}%
            </div>
            <div className="text-[10px] text-muted-foreground">Avg Confidence</div>
          </div>
        </div>

        {/* Pipeline Explanation */}
        {hasOcrPipeline && (
          <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-blue-700 flex items-start gap-2">
            <Eye className="h-3 w-3 mt-0.5 shrink-0" />
            <span>
              <strong>Hybrid Pipeline:</strong> OCR extracted {ocrTextLength > 0 ? `${(ocrTextLength / 1000).toFixed(1)}k characters` : 'raw text'} 
              {ocrConfidence && ` (${ocrConfidence} confidence)`}, 
              then Vision AI structured {effectiveVisionAiCount} fields from the extracted text.
            </span>
          </div>
        )}

        {/* Processing Time */}
        {processingTime && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Processing Time: <strong>{formatTime(processingTime)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-3 w-3" />
                <span>Pipeline: <strong>{pipelineType.replace(/_/g, ' ')}</strong></span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtractionMetricsSummary;
