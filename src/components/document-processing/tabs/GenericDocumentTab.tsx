/**
 * Generic Document Tab Component
 * Reusable component for displaying extracted fields from different document types
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';

interface ProcessingResult {
  stage: string;
  extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }>;
}

interface GenericDocumentTabProps {
  title: string;
  icon: LucideIcon;
  processingResult: ProcessingResult | null;
  emptyStateMessage: string;
}

export function GenericDocumentTab({
  title,
  icon: Icon,
  processingResult,
  emptyStateMessage
}: GenericDocumentTabProps) {
  const excludedKeys = ['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processingResult && processingResult.stage === 'complete' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(processingResult.extractedFields)
              .filter(([key, field]) => field?.value && !key.startsWith('_') && !excludedKeys.includes(key))
              .map(([key, field]) => {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <div key={key} className="p-3 bg-muted/50 rounded-lg">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <p className="font-medium">{field?.value || '—'}</p>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{emptyStateMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GenericDocumentTab;
