/**
 * Generic Document Tab Component
 * Reusable component for displaying extracted fields from different document types
 * With save functionality to persist data
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LucideIcon, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingResult {
  id: string;
  fileName: string;
  documentType?: string;
  stage: string;
  extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }>;
  tables?: any[];
  validationResults?: any;
  imageUrl?: string;
}

interface GenericDocumentTabProps {
  title: string;
  icon: LucideIcon;
  processingResult: ProcessingResult | null;
  emptyStateMessage: string;
  documentType?: string;
  setProcessingHistory?: (updater: (prev: any[]) => any[]) => void;
}

export function GenericDocumentTab({
  title,
  icon: Icon,
  processingResult,
  emptyStateMessage,
  documentType,
  setProcessingHistory
}: GenericDocumentTabProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const excludedKeys = ['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'];

  const handleSave = async () => {
    if (!processingResult) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to save');
        setIsSaving(false);
        return;
      }
      
      // Save to database
      const { error } = await supabase
        .from('document_processing_jobs')
        .upsert({
          id: processingResult.id,
          user_id: user.id,
          document_type: documentType || processingResult.documentType || 'document',
          file_name: processingResult.fileName,
          file_path: processingResult.imageUrl || processingResult.fileName,
          status: 'completed',
          progress: 100,
          processing_config: {
            extractedFields: processingResult.extractedFields,
            tables: processingResult.tables || [],
            validationResults: processingResult.validationResults,
            imageUrl: processingResult.imageUrl
          }
        });
      
      if (error) throw error;
      
      // Update local history
      if (setProcessingHistory) {
        setProcessingHistory(prev => {
          const existing = prev.find(p => p.id === processingResult.id);
          if (existing) {
            return prev.map(p => p.id === processingResult.id ? processingResult : p);
          }
          return [processingResult, ...prev];
        });
      }
      
      toast.success(`${title} saved to history`);
    } catch (err) {
      console.error('Save error:', err);
      toast.error(`Failed to save ${title.toLowerCase()}`);
    } finally {
      setIsSaving(false);
    }
  };

  const hasFields = processingResult && 
    processingResult.stage === 'complete' && 
    Object.entries(processingResult.extractedFields)
      .filter(([key, field]) => field?.value && !key.startsWith('_') && !excludedKeys.includes(key))
      .length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasFields ? (
          <div className="space-y-4">
            {/* Document preview if available */}
            {processingResult?.imageUrl && (
              <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-lg">
                <img src={processingResult.imageUrl} alt="Document" className="max-h-48 w-auto rounded border" />
              </div>
            )}
            
            {/* Extracted fields */}
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
            
            {/* Save Button */}
            <Button 
              className="w-full mt-4" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save {title}
                </>
              )}
            </Button>
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
