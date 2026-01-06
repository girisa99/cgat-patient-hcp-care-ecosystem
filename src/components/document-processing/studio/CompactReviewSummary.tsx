/**
 * Compact Review Summary Component
 * Bottom summary card showing field statistics, visual confidence bar,
 * fields requiring review, and progress indicator
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtractedField } from './SmartDocumentStudio';

interface FieldStats {
  total: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  verified: number;
  needsReview: number;
}

interface CompactReviewSummaryProps {
  extractedFields: Record<string, ExtractedField>;
  fieldStats: FieldStats;
  onFieldClick?: (key: string) => void;
}

export function CompactReviewSummary({
  extractedFields,
  fieldStats,
  onFieldClick
}: CompactReviewSummaryProps) {
  const { total, highConfidence, mediumConfidence, lowConfidence, verified, needsReview } = fieldStats;
  
  // Calculate overall confidence percentage
  const overallConfidence = total > 0 
    ? Math.round(((highConfidence * 1 + mediumConfidence * 0.8 + lowConfidence * 0.5) / total) * 100) 
    : 0;
  
  // Calculate verification progress
  const verificationProgress = total > 0 ? Math.round((verified / total) * 100) : 0;
  
  // Get fields that need review (low confidence and not verified)
  const fieldsNeedingReview = Object.entries(extractedFields)
    .filter(([_, field]) => field.confidence < 0.7 && !field.verified)
    .map(([key, field]) => ({ key, ...field }));

  // Format field name for display
  const formatFieldName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Header with overall stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Extraction Summary</span>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                overallConfidence >= 90 && "border-green-500/50 text-green-600 bg-green-500/10",
                overallConfidence >= 70 && overallConfidence < 90 && "border-amber-500/50 text-amber-600 bg-amber-500/10",
                overallConfidence < 70 && "border-red-500/50 text-red-600 bg-red-500/10"
              )}
            >
              {overallConfidence}% Confidence
            </Badge>
          </div>

          {/* Visual confidence breakdown */}
          <div className="space-y-2">
            {/* Stacked progress bar */}
            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
              {highConfidence > 0 && (
                <div 
                  className="bg-green-500 h-full transition-all"
                  style={{ width: `${(highConfidence / total) * 100}%` }}
                />
              )}
              {mediumConfidence > 0 && (
                <div 
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${(mediumConfidence / total) * 100}%` }}
                />
              )}
              {lowConfidence > 0 && (
                <div 
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${(lowConfidence / total) * 100}%` }}
                />
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{highConfidence} High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{mediumConfidence} Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>{lowConfidence} Low</span>
              </div>
            </div>
          </div>

          {/* Verification progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified Fields
              </span>
              <span className="font-medium">{verified} / {total}</span>
            </div>
            <Progress value={verificationProgress} className="h-1.5" />
          </div>

          {/* Fields requiring review */}
          {needsReview > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{needsReview} field(s) need review before saving</span>
              </div>
              
              <ScrollArea className="max-h-24">
                <div className="flex flex-wrap gap-1">
                  {fieldsNeedingReview.map(field => (
                    <Badge
                      key={field.key}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-accent border-red-500/30 text-red-600"
                      onClick={() => onFieldClick?.(field.key)}
                    >
                      <AlertCircle className="h-2.5 w-2.5 mr-1" />
                      {formatFieldName(field.key)}
                      <span className="ml-1 opacity-70">
                        ({Math.round(field.confidence * 100)}%)
                      </span>
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* All verified message */}
          {needsReview === 0 && total > 0 && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 rounded-lg p-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>All fields verified! Ready to save.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CompactReviewSummary;
