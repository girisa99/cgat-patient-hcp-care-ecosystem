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
  source: 'ocr' | 'nlp' | 'system';
}

export interface ExtractedField {
  id: string;
  fieldName: string;
  fieldValue: string;
  confidence: number;
  source: 'ocr' | 'nlp';
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
  nlpProvider?: string;
  className?: string;
}

// Define processing stages with their metadata
const PROCESSING_STAGES: Omit<ExtractionStage, 'status' | 'fieldsExtracted' | 'startedAt' | 'completedAt' | 'message'>[] = [
  { id: 'uploading', name: 'uploading', label: 'Uploading Document', icon: <FileText className="h-4 w-4" />, source: 'system' },
  { id: 'ocr', name: 'ocr', label: 'OCR Text Extraction', icon: <Camera className="h-4 w-4" />, source: 'ocr' },
  { id: 'extraction', name: 'extraction', label: 'Data Extraction', icon: <FileType className="h-4 w-4" />, source: 'ocr' },
  { id: 'entity_extraction', name: 'entity_extraction', label: 'NLP Entity Extraction', icon: <Brain className="h-4 w-4" />, source: 'nlp' },
  { id: 'table_extraction', name: 'table_extraction', label: 'Table Recognition', icon: <Table2 className="h-4 w-4" />, source: 'ocr' },
  { id: 'signature_detection', name: 'signature_detection', label: 'Signature Detection', icon: <PenTool className="h-4 w-4" />, source: 'ocr' },
  { id: 'mapping', name: 'mapping', label: 'Field Mapping', icon: <Database className="h-4 w-4" />, source: 'nlp' },
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
  nlpProvider = 'Gemini 2.5 Flash',
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
    
    Object.entries(extractedFields).forEach(([key, data]) => {
      if (!prevFields[key] || prevFields[key].value !== data.value) {
        // Determine source from confidence or explicit source field
        const source: 'ocr' | 'nlp' = data.source === 'nlp' || data.source === 'NLP' 
          ? 'nlp' 
          : data.source === 'ocr' || data.source === 'OCR'
          ? 'ocr'
          : data.confidence >= 0.85 ? 'nlp' : 'ocr';
        
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
      setLiveExtractions(prev => [...prev, ...newExtractions].slice(-20)); // Keep last 20
      
      // Update stage field counts
      setStages(prev => prev.map(stage => {
        if (stage.id === currentStage || stage.status === 'processing') {
          const ocrCount = newExtractions.filter(e => e.source === 'ocr').length;
          const nlpCount = newExtractions.filter(e => e.source === 'nlp').length;
          return {
            ...stage,
            fieldsExtracted: (stage.fieldsExtracted || 0) + ocrCount + nlpCount
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

  // Count OCR vs NLP fields
  const ocrFieldCount = liveExtractions.filter(e => e.source === 'ocr').length;
  const nlpFieldCount = liveExtractions.filter(e => e.source === 'nlp').length;

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
            <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30">
              <Camera className="h-3 w-3 mr-1" />
              OCR: {ocrFieldCount}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-purple-500/10 border-purple-500/30">
              <Brain className="h-3 w-3 mr-1" />
              NLP: {nlpFieldCount}
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
            <span className="text-muted-foreground">NLP:</span>
            <span className="font-medium">{nlpProvider}</span>
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
                      stage.source === 'nlp' && "bg-purple-500/10 border-purple-500/30 text-purple-600",
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
                          extraction.source === 'nlp' && "border-purple-500 bg-purple-500/10 text-purple-600",
                          extraction.source === 'ocr' && "border-blue-500 bg-blue-500/10 text-blue-600"
                        )}
                      >
                        {extraction.source === 'nlp' ? (
                          <><Brain className="h-2.5 w-2.5 mr-0.5" />NLP</>
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
                <div className="text-lg font-bold text-primary">{liveExtractions.length}</div>
                <div className="text-[10px] text-muted-foreground">Total Fields</div>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{ocrFieldCount}</div>
                <div className="text-[10px] text-muted-foreground">From OCR</div>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{nlpFieldCount}</div>
                <div className="text-[10px] text-muted-foreground">From NLP</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeExtractionTracker;
