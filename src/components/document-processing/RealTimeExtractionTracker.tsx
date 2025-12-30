/**
 * Real-Time Extraction Tracker Component
 * Shows live progress of document processing with OCR vs NLP source distinction
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Circle, 
  Loader2, 
  FileText, 
  Brain, 
  Camera, 
  Table2, 
  PenTool, 
  FileType, 
  Shield, 
  Database,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExtractionStage {
  id: string;
  name: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  fieldsExtracted?: number;
  message?: string;
  startedAt?: Date;
  completedAt?: Date;
  source: 'ocr' | 'vision_ai' | 'system';
}

export interface ExtractedField {
  id: string;
  fieldName: string;
  fieldValue: string;
  confidence: number;
  source: 'ocr' | 'vision_ai';
  stage: string;
  extractedAt: Date;
  verified?: boolean;
}

interface RealTimeExtractionTrackerProps {
  currentStage: string;
  progress: number;
  extractedFields: Record<string, { value: string; confidence: number; source?: string }>;
  documentType: string;
  isProcessing: boolean;
  fileName?: string;
  ocrProvider?: string;
  visionAiProvider?: string;
  className?: string;
}

// Define processing stages with their metadata
const PROCESSING_STAGES: Omit<ExtractionStage, 'status' | 'fieldsExtracted' | 'startedAt' | 'completedAt' | 'message'>[] = [
  { id: 'uploading', name: 'uploading', label: 'Uploading Document', icon: <FileText className="h-4 w-4" />, source: 'system' },
  { id: 'ocr', name: 'ocr', label: 'OCR Text Extraction', icon: <Camera className="h-4 w-4" />, source: 'ocr' },
  { id: 'extraction', name: 'extraction', label: 'Data Extraction', icon: <FileType className="h-4 w-4" />, source: 'ocr' },
  { id: 'entity_extraction', name: 'entity_extraction', label: 'Vision AI Entity Extraction', icon: <Brain className="h-4 w-4" />, source: 'vision_ai' },
  { id: 'table_extraction', name: 'table_extraction', label: 'Table Recognition', icon: <Table2 className="h-4 w-4" />, source: 'ocr' },
  { id: 'signature_detection', name: 'signature_detection', label: 'Signature Detection', icon: <PenTool className="h-4 w-4" />, source: 'ocr' },
  { id: 'mapping', name: 'mapping', label: 'Field Mapping', icon: <Database className="h-4 w-4" />, source: 'vision_ai' },
  { id: 'validation', name: 'validation', label: 'Validation & QA', icon: <Shield className="h-4 w-4" />, source: 'system' },
  { id: 'complete', name: 'complete', label: 'Complete', icon: <CheckCircle className="h-4 w-4" />, source: 'system' },
];

// Get stage index for progress calculation
const getStageIndex = (stage: string): number => {
  const index = PROCESSING_STAGES.findIndex(s => s.id === stage);
  return index >= 0 ? index : 0;
};

export const RealTimeExtractionTracker: React.FC<RealTimeExtractionTrackerProps> = ({
  currentStage,
  progress,
  extractedFields,
  documentType,
  isProcessing,
  fileName,
  ocrProvider = 'Google Vision',
  visionAiProvider = 'Gemini 2.5 Flash',
  className
}) => {
  // Track live extractions with animation
  const [liveExtractions, setLiveExtractions] = useState<ExtractedField[]>([]);
  const [stages, setStages] = useState<ExtractionStage[]>([]);
  const prevFieldsRef = useRef<Record<string, any>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize stages
  useEffect(() => {
    setStages(PROCESSING_STAGES.map(s => ({
      ...s,
      status: 'pending' as const,
      fieldsExtracted: 0
    })));
  }, []);

  // Update stage statuses based on current stage
  useEffect(() => {
    const currentIndex = getStageIndex(currentStage);
    
    setStages(prev => prev.map((stage, idx) => {
      if (idx < currentIndex) {
        return { ...stage, status: 'completed' as const, completedAt: new Date() };
      } else if (idx === currentIndex) {
        return { 
          ...stage, 
          status: isProcessing ? 'processing' as const : 'completed' as const,
          startedAt: new Date(),
          progress
        };
      }
      return { ...stage, status: 'pending' as const };
    }));
  }, [currentStage, isProcessing, progress]);

  // Track new field extractions and animate them
  useEffect(() => {
    const prevFields = prevFieldsRef.current;
    const newExtractions: ExtractedField[] = [];
    
    // List of metadata/internal fields to exclude from live display
    const excludedFields = ['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'];
    
    Object.entries(extractedFields).forEach(([key, data]) => {
      // Skip internal metadata fields (starting with _) and excluded fields
      if (key.startsWith('_') || excludedFields.includes(key)) {
        return;
      }
      
      if (!prevFields[key] || prevFields[key].value !== data.value) {
        // Determine source from explicit source field - handle multiple formats:
        // Backend uses: 'google_vision_ocr', 'gemini_vision_ai', 'claude_vision_ai', etc.
        const srcLower = (data.source || '').toLowerCase();
        const isOcrSource = srcLower.includes('ocr') || srcLower === 'ocr';
        const isVisionAiSource = srcLower.includes('vision_ai') || srcLower.includes('nlp') || 
                                 srcLower.includes('gemini') || srcLower.includes('claude') || srcLower.includes('openai');
        
        // If source explicitly indicates OCR, use ocr; if vision_ai/nlp, use vision_ai; else fallback to confidence
        const source: 'ocr' | 'vision_ai' = isOcrSource && !isVisionAiSource
          ? 'ocr' 
          : isVisionAiSource
          ? 'vision_ai'
          : data.confidence >= 0.85 ? 'vision_ai' : 'ocr';
        
        newExtractions.push({
          id: `${key}-${Date.now()}`,
          fieldName: key,
          fieldValue: data.value,
          confidence: data.confidence,
          source,
          stage: currentStage,
          extractedAt: new Date()
        });
      }
    });

    if (newExtractions.length > 0) {
      setLiveExtractions(prev => [...prev, ...newExtractions]); // Keep all extractions
      
      // Update stage field counts
      setStages(prev => prev.map(stage => {
        if (stage.id === currentStage || stage.status === 'processing') {
          const ocrCount = newExtractions.filter(e => e.source === 'ocr').length;
          const visionAiCount = newExtractions.filter(e => e.source === 'vision_ai').length;
          return {
            ...stage,
            fieldsExtracted: (stage.fieldsExtracted || 0) + ocrCount + visionAiCount
          };
        }
        return stage;
      }));
    }
    
    prevFieldsRef.current = { ...extractedFields };
  }, [extractedFields, currentStage]);

  // Auto-scroll to latest extraction
  useEffect(() => {
    if (scrollRef.current && liveExtractions.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveExtractions]);

  // Count fields by source - properly track hybrid pipeline
  // In hybrid pipeline: OCR extracts raw text, Vision AI structures into fields
  // The '_ocr_text_length' field indicates OCR was used in the pipeline
  const hasOcrPipeline = !!extractedFields['_ocr_text_length']?.value || !!extractedFields['_pipeline_type']?.value?.includes('ocr');
  const ocrTextLength = parseInt(extractedFields['_ocr_text_length']?.value || '0', 10);
  const ocrConfidenceStr = extractedFields['_ocr_confidence']?.value || '';
  const pipelineType = extractedFields['_pipeline_type']?.value || 'vision_ai_only';
  
  const totalFieldsCount = Object.keys(extractedFields).filter(key => 
    !key.startsWith('_') && !['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'].includes(key)
  ).length;
  
  // For hybrid pipeline: OCR provides raw text, Vision AI provides structured fields
  // Count Vision AI fields (all structured fields come from Vision AI in hybrid mode)
  const visionAiFieldCount = Object.entries(extractedFields).filter(([key, data]) => {
    if (key.startsWith('_') || ['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'].includes(key)) return false;
    const srcLower = (data.source || '').toLowerCase();
    // In hybrid mode, all structured fields are from Vision AI even though they used OCR text as context
    return srcLower.includes('vision_ai') || srcLower.includes('gemini') || srcLower.includes('claude') || srcLower.includes('openai');
  }).length;
  
  // OCR doesn't produce individual fields in hybrid mode - it produces raw text
  // Show OCR contribution based on whether OCR text was used
  const ocrFieldCount = hasOcrPipeline && ocrTextLength > 0 ? Math.ceil(ocrTextLength / 100) : 0; // Approximate "fields worth" of OCR text

  const getStageIcon = (stage: ExtractionStage) => {
    if (stage.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (stage.status === 'processing') {
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    } else if (stage.status === 'error') {
      return <Circle className="h-4 w-4 text-destructive" />;
    }
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Real-Time Extraction Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasOcrPipeline ? (
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30">
                <Camera className="h-3 w-3 mr-1" />
                OCR: {ocrConfidenceStr || `${(ocrTextLength / 1000).toFixed(1)}k chars`}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-muted border-border">
                <Camera className="h-3 w-3 mr-1" />
                No OCR
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] bg-purple-500/10 border-purple-500/30">
              <Brain className="h-3 w-3 mr-1" />
              Vision AI: {visionAiFieldCount}
            </Badge>
          </div>
        </div>
        {fileName && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            Processing: {fileName}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Provider Info */}
        <div className="flex items-center gap-4 p-2 bg-muted/30 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <Camera className="h-3 w-3 text-blue-500" />
            <span className="text-muted-foreground">OCR:</span>
            <span className="font-medium">{ocrProvider}</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-purple-500" />
            <span className="text-muted-foreground">Vision AI:</span>
            <span className="font-medium">{visionAiProvider}</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Separator />

        {/* Processing Stages */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Processing Stages
          </span>
          <div className="space-y-1 mt-2">
            {stages.filter(s => s.id !== 'complete').map((stage, idx) => (
              <div 
                key={stage.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md transition-all",
                  stage.status === 'processing' && "bg-primary/10 border border-primary/20",
                  stage.status === 'completed' && "bg-green-500/5",
                  stage.status === 'pending' && "opacity-50"
                )}
              >
                <div className="flex items-center gap-2">
                  {getStageIcon(stage)}
                  <span className={cn(
                    "text-xs font-medium",
                    stage.status === 'processing' && "text-primary"
                  )}>
                    {stage.label}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px] h-4",
                      stage.source === 'ocr' && "bg-blue-500/10 border-blue-500/30 text-blue-600",
                      stage.source === 'vision_ai' && "bg-purple-500/10 border-purple-500/30 text-purple-600",
                      stage.source === 'system' && "bg-gray-500/10 border-gray-500/30"
                    )}
                  >
                    {stage.source.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {stage.fieldsExtracted !== undefined && stage.fieldsExtracted > 0 && (
                    <Badge variant="secondary" className="text-[9px]">
                      {stage.fieldsExtracted} fields
                    </Badge>
                  )}
                  {stage.status === 'processing' && (
                    <span className="text-[10px] text-muted-foreground animate-pulse">
                      Processing...
                    </span>
                  )}
                  {stage.status === 'completed' && stage.completedAt && (
                    <span className="text-[10px] text-green-600">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Live Field Extractions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Live Extractions
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {liveExtractions.length} fields extracted
            </Badge>
          </div>
          
          <ScrollArea className="h-[200px]" ref={scrollRef}>
            <div className="space-y-1 pr-4">
              {liveExtractions.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Waiting for extractions...
                    </div>
                  ) : (
                    'No extractions yet'
                  )}
                </div>
              ) : (
                liveExtractions.map((extraction, idx) => (
                  <div 
                    key={extraction.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md text-xs transition-all",
                      idx === liveExtractions.length - 1 && "bg-primary/10 animate-pulse border border-primary/20",
                      idx < liveExtractions.length - 1 && "bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[8px] shrink-0 px-1.5",
                          extraction.source === 'vision_ai' && "border-purple-500 bg-purple-500/10 text-purple-600",
                          extraction.source === 'ocr' && "border-blue-500 bg-blue-500/10 text-blue-600"
                        )}
                      >
                        {extraction.source === 'vision_ai' ? (
                          <><Brain className="h-2.5 w-2.5 mr-0.5" />AI</>
                        ) : (
                          <><Camera className="h-2.5 w-2.5 mr-0.5" />OCR</>
                        )}
                      </Badge>
                      <span className="font-medium capitalize truncate">
                        {extraction.fieldName.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-muted-foreground truncate max-w-[100px]" title={extraction.fieldValue}>
                        {extraction.fieldValue.length > 15 
                          ? extraction.fieldValue.substring(0, 15) + '...' 
                          : extraction.fieldValue}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-[9px]",
                          extraction.confidence >= 0.9 && "bg-green-500/10 text-green-600",
                          extraction.confidence >= 0.7 && extraction.confidence < 0.9 && "bg-yellow-500/10 text-yellow-600",
                          extraction.confidence < 0.7 && "bg-red-500/10 text-red-600"
                        )}
                      >
                        {Math.round(extraction.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Summary Stats */}
        {liveExtractions.length > 0 && (
          <>
            <Separator />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-primary">{totalFieldsCount}</div>
                <div className="text-[10px] text-muted-foreground">Total Fields</div>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{hasOcrPipeline ? `${(ocrTextLength / 1000).toFixed(1)}k` : '0'}</div>
                <div className="text-[10px] text-muted-foreground">OCR Chars</div>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{visionAiFieldCount}</div>
                <div className="text-[10px] text-muted-foreground">From Vision AI</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeExtractionTracker;
