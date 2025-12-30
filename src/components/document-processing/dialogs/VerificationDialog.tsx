/**
 * VerificationDialog Component
 * Displays side-by-side document comparison for verification before saving
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileCheck,
  Image,
  Table2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingResult {
  id: string;
  fileName: string;
  documentType: string;
  stage: string;
  progress: number;
  extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }>;
  medications?: any[];
  validationResults?: { passed: number; failed: number; warnings: number };
  rawText?: string;
  tables?: any[];
  lineItems?: any[];
  error?: string;
  processedAt: Date;
  imageUrl?: string;
}

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingResult: ProcessingResult | null;
  setPendingResult: (result: ProcessingResult | null) => void;
  confidenceThreshold: number;
  setProcessingResult: React.Dispatch<React.SetStateAction<ProcessingResult | null>>;
  setProcessingHistory: React.Dispatch<React.SetStateAction<ProcessingResult[]>>;
  setShowSubAgentDialog: (show: boolean) => void;
  loadHistory: () => Promise<void>;
}

export default function VerificationDialog({
  open,
  onOpenChange,
  pendingResult,
  setPendingResult,
  confidenceThreshold,
  setProcessingResult,
  setProcessingHistory,
  setShowSubAgentDialog,
  loadHistory
}: VerificationDialogProps) {
  
  const handleSave = async () => {
    if (!pendingResult) return;
    
    try {
      // Save verified/edited fields to database
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare processing config with line items and tables for RCM (as JSON-serializable)
      const processingConfig: Record<string, unknown> = {
        extractedFields: JSON.parse(JSON.stringify(pendingResult.extractedFields || {})),
        lineItems: JSON.parse(JSON.stringify(pendingResult.lineItems || [])),
        tables: JSON.parse(JSON.stringify(pendingResult.tables || [])),
        medications: JSON.parse(JSON.stringify(pendingResult.medications || [])),
        validationResults: pendingResult.validationResults ? JSON.parse(JSON.stringify(pendingResult.validationResults)) : null,
        imageUrl: pendingResult.imageUrl || null,
        savedAt: new Date().toISOString(),
        verifiedBy: user?.id || null
      };
      
      // Validation status as string
      const validationStatusStr = pendingResult.validationResults 
        ? `passed:${pendingResult.validationResults.passed},failed:${pendingResult.validationResults.failed},warnings:${pendingResult.validationResults.warnings}`
        : 'verified';
      
      // Update the document processing job with verified data
      const { error } = await supabase
        .from('document_processing_jobs')
        .upsert({
          id: pendingResult.id,
          user_id: user?.id || null,
          document_type: pendingResult.documentType,
          file_name: pendingResult.fileName,
          file_path: pendingResult.imageUrl || pendingResult.fileName,
          status: 'verified',
          progress: 100,
          extracted_metadata: { 
            entities: Object.entries(pendingResult.extractedFields).map(([k, v]) => ({
              type: k, 
              value: v?.value || '',
              confidence: v?.confidence || 0.85
            })),
            lineItems: pendingResult.lineItems || [],
            tables: pendingResult.tables || [],
            verifiedAt: new Date().toISOString()
          },
          validation_status: validationStatusStr,
          processing_config: processingConfig as any
        });
      
      if (error) {
        console.error('Supabase upsert error:', error);
        throw error;
      }
      
      toast.success('Document verified and saved to history!');
      
      // Update local state
      setProcessingResult(pendingResult);
      setProcessingHistory(prev => {
        const existing = prev.find(p => p.id === pendingResult.id);
        if (existing) {
          return prev.map(p => p.id === pendingResult.id ? pendingResult : p);
        }
        return [pendingResult, ...prev];
      });
      
      // Reload history from database to ensure consistency
      await loadHistory();
      
      onOpenChange(false);
      setPendingResult(null);
      
      // Trigger sub-agent dialog after successful save
      setTimeout(() => {
        setShowSubAgentDialog(true);
      }, 500);
    } catch (err) {
      console.error('Failed to save verified document:', err);
      toast.error('Failed to save document', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Verify Extracted Data
          </DialogTitle>
          <DialogDescription>
            Please review the extracted data and compare it against the original document before saving to history.
          </DialogDescription>
        </DialogHeader>
        
        {pendingResult && (
          <div className="space-y-4 py-4">
            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Original Document */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Original Document
                  {pendingResult.imageUrl?.startsWith('data:application/pdf') && (
                    <Badge variant="secondary" className="text-xs">PDF</Badge>
                  )}
                </h4>
                {pendingResult.imageUrl ? (
                  pendingResult.imageUrl.startsWith('data:application/pdf') ? (
                    // PDF base64 data URLs don't work in iframes - show download option
                    <div className="bg-muted/30 rounded-lg border p-6">
                      <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <div className="p-3 bg-red-50 rounded-full">
                          <FileText className="h-8 w-8 text-red-500" />
                        </div>
                        <p className="font-medium">{pendingResult.fileName}</p>
                        <div className="flex gap-2">
                          <a 
                            href={pendingResult.imageUrl}
                            download={pendingResult.fileName}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                          >
                            <FileText className="h-3 w-3" />
                            Download
                          </a>
                          <button
                            onClick={() => {
                              const newWindow = window.open();
                              if (newWindow) {
                                newWindow.document.write(`
                                  <html><head><title>${pendingResult.fileName}</title></head>
                                  <body style="margin:0;"><embed src="${pendingResult.imageUrl}" type="application/pdf" width="100%" height="100%" style="position:absolute;inset:0;" /></body></html>
                                `);
                              }
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Image files use img element
                    <img 
                      src={pendingResult.imageUrl} 
                      alt="Original document" 
                      className="w-full rounded border max-h-[400px] object-contain"
                    />
                  )
                ) : (
                  <div className="bg-muted rounded p-4 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">No image preview available</p>
                    {pendingResult.rawText && (
                      <pre className="text-left text-xs mt-2 max-h-40 overflow-auto bg-background p-2 rounded">
                        {pendingResult.rawText.slice(0, 500)}...
                      </pre>
                    )}
                  </div>
                )}
              </div>
              
              {/* Extracted Fields */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Table2 className="h-4 w-4" />
                  Extracted Fields ({Object.keys(pendingResult.extractedFields).filter(k => 
                    pendingResult.extractedFields[k]?.value && 
                    !k.startsWith('_') && 
                    !['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'].includes(k)
                  ).length})
                </h4>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {Object.entries(pendingResult.extractedFields)
                      .filter(([key, field]) => 
                        field?.value && 
                        !key.startsWith('_') && 
                        !['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'].includes(key)
                      )
                      .map(([key, field]) => {
                        const confidence = field?.confidence || 0;
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        
                        return (
                          <div 
                            key={key} 
                            className={`p-2 rounded border ${
                              confidence >= confidenceThreshold ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                {label}
                              </Label>
                              <Badge variant={confidence >= confidenceThreshold ? 'default' : 'secondary'} className="text-[9px]">
                                {Math.round(confidence * 100)}%
                              </Badge>
                            </div>
                            <p className="font-medium text-sm">{field?.value || '—'}</p>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </div>
            </div>
            
            {/* Validation Summary */}
            {pendingResult.validationResults && (
              <Alert className={pendingResult.validationResults.failed > 0 ? 'border-destructive' : pendingResult.validationResults.warnings > 0 ? 'border-yellow-500' : 'border-green-500'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 font-medium">{pendingResult.validationResults.passed} passed</span>
                    <span className="text-yellow-600 font-medium">{pendingResult.validationResults.warnings} warnings</span>
                    <span className="text-red-600 font-medium">{pendingResult.validationResults.failed} failed</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                onOpenChange(false);
                setPendingResult(null);
              }}>
                Cancel & Discard
              </Button>
              <Button 
                variant="default"
                onClick={handleSave}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Confirm & Save to History
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
