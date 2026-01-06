/**
 * Review Gate Bar
 * Floating save bar with review requirements and action buttons
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Save, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  ArrowRight
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

interface ReviewGateBarProps {
  fieldStats: FieldStats;
  canSave: boolean;
  onSave: () => void;
  extractedFields: Record<string, ExtractedField>;
}

export function ReviewGateBar({
  fieldStats,
  canSave,
  onSave,
  extractedFields
}: ReviewGateBarProps) {
  // Get unverified low-confidence field names
  const fieldsNeedingReview = Object.entries(extractedFields)
    .filter(([_, field]) => field.confidence < 0.7 && !field.verified)
    .map(([key]) => key.replace(/_/g, ' '));

  const verificationProgress = fieldStats.lowConfidence > 0
    ? ((fieldStats.lowConfidence - fieldStats.needsReview) / fieldStats.lowConfidence) * 100
    : 100;

  return (
    <Card className={cn(
      "border-2 transition-all",
      canSave ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
    )}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div className={cn(
            "p-2 rounded-full",
            canSave ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"
          )}>
            {canSave ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
          </div>

          {/* Review Status */}
          <div className="flex-1">
            {canSave ? (
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Ready to save
                </p>
                <p className="text-xs text-muted-foreground">
                  All fields verified • {fieldStats.total} fields extracted
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {fieldStats.needsReview} field{fieldStats.needsReview > 1 ? 's' : ''} need{fieldStats.needsReview === 1 ? 's' : ''} review
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress 
                    value={verificationProgress} 
                    className="h-1.5 flex-1 max-w-[200px] [&>div]:bg-amber-500"
                  />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(verificationProgress)}% verified
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Fields needing review (collapsed preview) */}
          {!canSave && fieldsNeedingReview.length > 0 && (
            <div className="hidden md:flex items-center gap-1 max-w-[300px] overflow-hidden">
              {fieldsNeedingReview.slice(0, 3).map((field) => (
                <Badge
                  key={field}
                  variant="outline"
                  className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap"
                >
                  {field}
                </Badge>
              ))}
              {fieldsNeedingReview.length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{fieldsNeedingReview.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Confidence Summary */}
          <div className="hidden lg:flex items-center gap-3 text-xs border-l pl-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">High: {fieldStats.highConfidence}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Med: {fieldStats.mediumConfidence}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Low: {fieldStats.lowConfidence}</span>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={onSave}
            disabled={!canSave}
            className={cn(
              "gap-2",
              canSave && "bg-green-600 hover:bg-green-700"
            )}
          >
            {canSave ? (
              <>
                <Save className="h-4 w-4" />
                Save to History
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Review Required
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReviewGateBar;
