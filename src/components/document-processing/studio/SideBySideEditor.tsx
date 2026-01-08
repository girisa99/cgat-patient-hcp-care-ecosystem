/**
 * Side-by-Side Editor
 * Split view with editable field cards and confidence indicators
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  FileCheck, 
  AlertTriangle,
  CheckCircle,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldConfirmationCard } from './FieldConfirmationCard';
import type { ExtractedField } from './SmartDocumentStudio';

interface FieldStats {
  total: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  verified: number;
  needsReview: number;
}

interface SideBySideEditorProps {
  extractedFields: Record<string, ExtractedField>;
  onFieldUpdate: (key: string, value: string) => void;
  onFieldDelete?: (key: string) => void;
  onFieldVerify: (key: string) => void;
  onFieldClick: (key: string) => void;
  activeFieldKey: string | null;
  fieldStats: FieldStats;
}

export function SideBySideEditor({
  extractedFields,
  onFieldUpdate,
  onFieldDelete,
  onFieldVerify,
  onFieldClick,
  activeFieldKey,
  fieldStats
}: SideBySideEditorProps) {
  const fields = Object.entries(extractedFields);

  // Sort fields: low confidence first, then by key
  const sortedFields = [...fields].sort((a, b) => {
    // Low confidence fields first
    if (a[1].confidence < 0.7 && b[1].confidence >= 0.7) return -1;
    if (b[1].confidence < 0.7 && a[1].confidence >= 0.7) return 1;
    // Then medium confidence
    if (a[1].confidence < 0.9 && b[1].confidence >= 0.9) return -1;
    if (b[1].confidence < 0.9 && a[1].confidence >= 0.9) return 1;
    // Then alphabetically
    return a[0].localeCompare(b[0]);
  });

  const overallConfidence = fields.length > 0
    ? fields.reduce((sum, [_, f]) => sum + f.confidence, 0) / fields.length
    : 0;

  return (
    <Card className="h-full flex flex-col min-h-[500px]">
      <CardHeader className="py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Extracted Fields
            <Badge variant="outline" className="ml-2 text-xs bg-amber-50 dark:bg-amber-950 border-amber-200">
              Editable
            </Badge>
            <Badge variant="secondary" className="ml-1">
              {fieldStats.total} fields
            </Badge>
          </CardTitle>
          
          {/* Confidence Summary */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">{fieldStats.highConfidence}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">{fieldStats.mediumConfidence}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">{fieldStats.lowConfidence}</span>
            </div>
          </div>
        </div>

        {/* Overall Confidence Bar */}
        <div className="space-y-1 mt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall Confidence</span>
            <span className={cn(
              "font-medium",
              overallConfidence >= 0.9 ? "text-green-600" :
              overallConfidence >= 0.7 ? "text-amber-600" : "text-red-600"
            )}>
              {Math.round(overallConfidence * 100)}%
            </span>
          </div>
          <Progress 
            value={overallConfidence * 100} 
            className={cn(
              "h-1.5",
              overallConfidence >= 0.9 ? "[&>div]:bg-green-500" :
              overallConfidence >= 0.7 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
            )}
          />
        </div>

        {/* Review Alert */}
        {fieldStats.needsReview > 0 && (
          <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-amber-700 dark:text-amber-400">
              <strong>{fieldStats.needsReview}</strong> field{fieldStats.needsReview > 1 ? 's' : ''} need{fieldStats.needsReview === 1 ? 's' : ''} review before saving
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {sortedFields.map(([key, field]) => (
              <FieldConfirmationCard
                key={key}
                fieldKey={key}
                field={field}
                isActive={activeFieldKey === key}
                onUpdate={(value) => onFieldUpdate(key, value)}
                onDelete={onFieldDelete ? () => onFieldDelete(key) : undefined}
                onVerify={() => onFieldVerify(key)}
                onClick={() => onFieldClick(key)}
              />
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Circle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No fields extracted yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SideBySideEditor;
