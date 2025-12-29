/**
 * OCR vs Vision AI Comparison View
 * Improvement 5: Side-by-side comparison of OCR and Vision AI results
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Camera, Brain, ArrowLeftRight, CheckCircle, AlertTriangle,
  Eye, EyeOff, Filter, ChevronRight, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldComparison {
  fieldName: string;
  ocrValue?: string;
  ocrConfidence?: number;
  visionAiValue?: string;
  visionAiConfidence?: number;
  match: boolean;
  bestSource: 'ocr' | 'vision_ai' | 'both';
  hasDifference: boolean;
}

interface OCRVisionAIComparisonViewProps {
  extractedFields: Record<string, { value: string; confidence: number; source?: string }>;
  className?: string;
}

export const OCRVisionAIComparisonView: React.FC<OCRVisionAIComparisonViewProps> = ({
  extractedFields,
  className
}) => {
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  // Separate and compare fields by source
  const comparison = useMemo(() => {
    const excludedFields = ['_meta', 'line_items', 'tables', 'raw_text', 'detected_document_type', 'document_category'];
    
    const ocrFields: Record<string, { value: string; confidence: number }> = {};
    const visionAiFields: Record<string, { value: string; confidence: number }> = {};
    const allFieldNames = new Set<string>();

    Object.entries(extractedFields).forEach(([key, data]) => {
      if (key.startsWith('_') || excludedFields.includes(key)) return;
      
      allFieldNames.add(key);
      
      const source = data.source?.toLowerCase();
      
      // Determine source based on explicit source or confidence heuristic
      if (source === 'ocr') {
        ocrFields[key] = { value: data.value, confidence: data.confidence };
      } else if (source === 'vision_ai' || source === 'nlp' || source === 'ai') {
        visionAiFields[key] = { value: data.value, confidence: data.confidence };
      } else {
        // Heuristic: lower confidence typically from OCR, higher from Vision AI
        if (data.confidence < 0.85) {
          ocrFields[key] = { value: data.value, confidence: data.confidence };
        } else {
          visionAiFields[key] = { value: data.value, confidence: data.confidence };
        }
      }
    });

    // Build comparison array
    const comparisons: FieldComparison[] = Array.from(allFieldNames).map(fieldName => {
      const ocr = ocrFields[fieldName];
      const vision = visionAiFields[fieldName];
      
      const match = ocr && vision ? ocr.value === vision.value : false;
      const hasDifference = ocr && vision ? ocr.value !== vision.value : false;
      
      let bestSource: 'ocr' | 'vision_ai' | 'both' = 'both';
      if (ocr && vision) {
        bestSource = ocr.confidence > vision.confidence ? 'ocr' : 'vision_ai';
      } else if (ocr) {
        bestSource = 'ocr';
      } else if (vision) {
        bestSource = 'vision_ai';
      }

      return {
        fieldName: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        rawName: fieldName,
        ocrValue: ocr?.value,
        ocrConfidence: ocr?.confidence,
        visionAiValue: vision?.value,
        visionAiConfidence: vision?.confidence,
        match,
        bestSource,
        hasDifference
      } as FieldComparison;
    }).sort((a, b) => {
      // Sort by differences first, then by field name
      if (a.hasDifference && !b.hasDifference) return -1;
      if (!a.hasDifference && b.hasDifference) return 1;
      return a.fieldName.localeCompare(b.fieldName);
    });

    return {
      comparisons,
      ocrCount: Object.keys(ocrFields).length,
      visionAiCount: Object.keys(visionAiFields).length,
      matchCount: comparisons.filter(c => c.match).length,
      differenceCount: comparisons.filter(c => c.hasDifference).length
    };
  }, [extractedFields]);

  const filteredComparisons = showOnlyDifferences 
    ? comparison.comparisons.filter(c => c.hasDifference)
    : comparison.comparisons;

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    const percent = Math.round(confidence * 100);
    const color = confidence >= 0.9 ? 'text-green-600 bg-green-500/10' 
      : confidence >= 0.7 ? 'text-amber-600 bg-amber-500/10' 
      : 'text-red-600 bg-red-500/10';
    
    return (
      <Badge variant="outline" className={cn("text-[10px]", color)}>
        {percent}%
      </Badge>
    );
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              OCR vs Vision AI Comparison
            </CardTitle>
            <CardDescription>
              Side-by-side analysis of extraction sources
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="show-differences" 
                checked={showOnlyDifferences}
                onCheckedChange={setShowOnlyDifferences}
              />
              <Label htmlFor="show-differences" className="text-xs">
                Show differences only
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
            <Camera className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-blue-600">{comparison.ocrCount}</div>
            <div className="text-[10px] text-muted-foreground">OCR Fields</div>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg text-center">
            <Brain className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-purple-600">{comparison.visionAiCount}</div>
            <div className="text-[10px] text-muted-foreground">Vision AI Fields</div>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-green-600">{comparison.matchCount}</div>
            <div className="text-[10px] text-muted-foreground">Matching</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-center">
            <AlertTriangle className="h-4 w-4 text-amber-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-amber-600">{comparison.differenceCount}</div>
            <div className="text-[10px] text-muted-foreground">Differences</div>
          </div>
        </div>

        <Separator />

        {/* Comparison Headers */}
        <div className="grid grid-cols-[1fr,1fr,1fr] gap-2 px-3 py-2 bg-muted/30 rounded-lg text-xs font-medium">
          <div className="flex items-center gap-2">
            <span>Field Name</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Camera className="h-3 w-3" />
            <span>OCR Result</span>
          </div>
          <div className="flex items-center gap-2 text-purple-600">
            <Brain className="h-3 w-3" />
            <span>Vision AI Result</span>
          </div>
        </div>

        {/* Comparison List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 pr-4">
            {filteredComparisons.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                {showOnlyDifferences 
                  ? "No differences found between OCR and Vision AI results"
                  : "No fields extracted yet"}
              </div>
            ) : (
              filteredComparisons.map((comp, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "grid grid-cols-[1fr,1fr,1fr] gap-2 p-3 rounded-lg transition-all cursor-pointer",
                    comp.hasDifference && "bg-amber-500/5 border border-amber-500/20",
                    !comp.hasDifference && "bg-muted/20 hover:bg-muted/40",
                    selectedField === comp.fieldName && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedField(selectedField === comp.fieldName ? null : comp.fieldName)}
                >
                  {/* Field Name */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{comp.fieldName}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {comp.hasDifference ? (
                          <Badge variant="outline" className="text-[9px] bg-amber-500/10 border-amber-500/30 text-amber-600">
                            Mismatch
                          </Badge>
                        ) : comp.match ? (
                          <Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-600">
                            Match
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px]">
                            Single Source
                          </Badge>
                        )}
                        {comp.bestSource !== 'both' && (
                          <Badge variant="secondary" className="text-[9px]">
                            Best: {comp.bestSource === 'ocr' ? 'OCR' : 'AI'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* OCR Value */}
                  <div className="flex flex-col">
                    {comp.ocrValue ? (
                      <>
                        <div className="text-sm truncate" title={comp.ocrValue}>
                          {comp.ocrValue}
                        </div>
                        <div className="mt-1">
                          {getConfidenceBadge(comp.ocrConfidence)}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not extracted</span>
                    )}
                  </div>

                  {/* Vision AI Value */}
                  <div className="flex flex-col">
                    {comp.visionAiValue ? (
                      <>
                        <div className="text-sm truncate" title={comp.visionAiValue}>
                          {comp.visionAiValue}
                        </div>
                        <div className="mt-1">
                          {getConfidenceBadge(comp.visionAiConfidence)}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not extracted</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>OCR</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Vision AI</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Mismatch</span>
            </div>
          </div>
          <div>
            Total: {comparison.comparisons.length} fields
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OCRVisionAIComparisonView;
