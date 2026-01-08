/**
 * Live Extraction Panel
 * Real-time animated display of field extraction progress
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Brain,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExtractedField, ModelRoutingInfo } from './SmartDocumentStudio';
import { cleanMedicationFields } from './utils/medicationFieldFilter';

interface LiveExtractionPanelProps {
  extractedFields: Record<string, ExtractedField>;
  isProcessing: boolean;
  modelRouting: ModelRoutingInfo | null;
}

export function LiveExtractionPanel({
  extractedFields,
  isProcessing,
  modelRouting
}: LiveExtractionPanelProps) {
  const [currentStage, setCurrentStage] = useState<'ocr' | 'nlp' | 'validation'>('ocr');
  const [visibleFields, setVisibleFields] = useState<string[]>([]);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [processingMessages, setProcessingMessages] = useState<string[]>([]);

  // Filter out duplicate medication fields using shared utility
  const cleanedFields = cleanMedicationFields(extractedFields);
  const fields = Object.entries(cleanedFields);

  // Simulate processing messages when no fields yet
  useEffect(() => {
    if (isProcessing && fields.length === 0) {
      const messages = [
        'Initializing document analysis...',
        'Detecting document structure...',
        'Running OCR text extraction...',
        'Identifying key entities...',
        'Processing with Vision AI...',
        'Extracting field values...'
      ];
      let msgIndex = 0;
      
      const msgInterval = setInterval(() => {
        if (msgIndex < messages.length) {
          setProcessingMessages(prev => [...prev, messages[msgIndex]]);
          msgIndex++;
        }
      }, 800);
      
      return () => clearInterval(msgInterval);
    } else if (fields.length > 0) {
      setProcessingMessages([]);
    }
  }, [isProcessing, fields.length]);

  // Animate progress bar smoothly
  useEffect(() => {
    if (isProcessing) {
      const targetProgress = fields.length > 0 ? 100 : 60;
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev >= targetProgress) return prev;
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAnimatedProgress(fields.length > 0 ? 100 : 0);
    }
  }, [isProcessing, fields.length]);

  // Animate fields appearing one by one
  useEffect(() => {
    if (isProcessing && fields.length > 0) {
      const fieldKeys = fields.map(([key]) => key);
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < fieldKeys.length) {
          setVisibleFields(prev => [...prev, fieldKeys[index]]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 150);

      return () => clearInterval(interval);
    } else {
      setVisibleFields(fields.map(([key]) => key));
    }
  }, [fields.length, isProcessing]);

  // Update stage based on progress
  useEffect(() => {
    if (fields.length === 0 && isProcessing) {
      // Use animated progress for stage when no fields yet
      if (animatedProgress < 30) {
        setCurrentStage('ocr');
      } else if (animatedProgress < 70) {
        setCurrentStage('nlp');
      } else {
        setCurrentStage('validation');
      }
    } else {
      const progress = (visibleFields.length / Math.max(fields.length, 1)) * 100;
      if (progress < 40) {
        setCurrentStage('ocr');
      } else if (progress < 80) {
        setCurrentStage('nlp');
      } else {
        setCurrentStage('validation');
      }
    }
  }, [visibleFields.length, fields.length, animatedProgress, isProcessing]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ocr': return <Eye className="h-3 w-3" />;
      case 'vision_ai': return <Sparkles className="h-3 w-3" />;
      case 'nlp': return <Brain className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  const stages = [
    { id: 'ocr', label: 'OCR Extraction', icon: <Eye className="h-4 w-4" /> },
    { id: 'nlp', label: 'NLP Processing', icon: <Brain className="h-4 w-4" /> },
    { id: 'validation', label: 'Validation', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Live Extraction
          {isProcessing && (
            <Badge variant="secondary" className="ml-auto animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Processing
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stage Progress */}
        <div className="flex items-center gap-2">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all",
                currentStage === stage.id 
                  ? "bg-primary text-primary-foreground" 
                  : stages.findIndex(s => s.id === currentStage) > index
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                    : "bg-muted text-muted-foreground"
              )}>
                {currentStage === stage.id && isProcessing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : stages.findIndex(s => s.id === currentStage) > index ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  stage.icon
                )}
                <span className="hidden sm:inline">{stage.label}</span>
              </div>
              {index < stages.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 rounded",
                  stages.findIndex(s => s.id === currentStage) > index
                    ? "bg-green-500"
                    : "bg-muted"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Fields extracted</span>
            <span>{visibleFields.length} / {fields.length > 0 ? fields.length : '...'}</span>
          </div>
          <Progress value={fields.length > 0 ? (visibleFields.length / Math.max(fields.length, 1)) * 100 : animatedProgress} className="h-2" />
        </div>

        {/* Processing Messages (when no fields yet) */}
        {isProcessing && fields.length === 0 && processingMessages.length > 0 && (
          <div className="space-y-1.5 py-2">
            {processingMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  idx === processingMessages.length - 1 ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {idx === processingMessages.length - 1 ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
                {msg}
              </motion.div>
            ))}
          </div>
        )}

        {/* Extracted Fields List */}
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            <AnimatePresence>
              {fields.filter(([key]) => visibleFields.includes(key)).map(([key, field]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                >
                  {/* Confidence Indicator */}
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    field.confidence >= 0.9 ? "bg-green-500" :
                    field.confidence >= 0.7 ? "bg-amber-500" : "bg-red-500"
                  )} />

                  {/* Field Name */}
                  <span className="font-medium text-xs text-muted-foreground min-w-[100px] truncate">
                    {key.replace(/_/g, ' ')}
                  </span>

                  {/* Field Value */}
                  <span className="flex-1 truncate text-xs">
                    {field.value}
                  </span>

                  {/* Source Badge */}
                  <Badge variant="outline" className="text-[10px] gap-1 shrink-0">
                    {getSourceIcon(field.source)}
                    {Math.round(field.confidence * 100)}%
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Skeleton loading for remaining fields */}
            {isProcessing && fields.length > visibleFields.length && (
              Array.from({ length: Math.min(3, fields.length - visibleFields.length) }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 animate-pulse"
                >
                  <div className="w-2 h-2 rounded-full bg-muted" />
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-3 bg-muted rounded flex-1" />
                  <div className="h-4 bg-muted rounded w-12" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default LiveExtractionPanel;
