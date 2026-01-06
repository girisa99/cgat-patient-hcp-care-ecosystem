/**
 * VerificationDialog Component
 * Displays side-by-side document comparison for verification before saving
 * Allows editing of extracted fields before confirming
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  AlertTriangle,
  Loader2,
  Pencil,
  Check,
  ImageOff
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingResult: any;
  setPendingResult: (result: any) => void;
  confidenceThreshold: number;
  setProcessingHistory: (updater: (prev: any[]) => any[]) => void;
  setShowSubAgentDialog: (show: boolean) => void;
  loadHistory: () => Promise<void>;
  selectedDocType?: string;
  setActiveTab?: (tab: string) => void;
}

export default function VerificationDialog({
  open,
  onOpenChange,
  pendingResult,
  setPendingResult,
  confidenceThreshold,
  setProcessingHistory,
  setShowSubAgentDialog,
  loadHistory,
  selectedDocType,
  setActiveTab
}: VerificationDialogProps) {
  
  const [isSaving, setIsSaving] = React.useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [imageError, setImageError] = useState(false);
  
  // Handle field edit
  const handleStartEdit = useCallback((key: string, currentValue: string) => {
    setEditingField(key);
    setEditValue(currentValue);
  }, []);
  
  const handleSaveEdit = useCallback((key: string) => {
    if (!pendingResult) return;
    
    const updatedFields = { ...pendingResult.extractedFields };
    updatedFields[key] = {
      ...updatedFields[key],
      value: editValue,
      verified: true,
      confidence: 1.0 // User-edited fields have 100% confidence
    };
    
    setPendingResult({
      ...pendingResult,
      extractedFields: updatedFields
    });
    
    setEditingField(null);
    setEditValue('');
    toast.success(`Updated ${key.replace(/_/g, ' ')}`);
  }, [pendingResult, editValue, setPendingResult]);
  
  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);
  
  const handleSave = async () => {
    if (!pendingResult) {
      toast.error('No data to save');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Authentication error', { description: authError.message });
        return;
      }
      
      if (!user) {
        toast.error('Please login to save', { description: 'You must be authenticated to save documents' });
        return;
      }
      
      // Prepare processing config with line items and tables for RCM (as JSON-serializable)
      const processingConfig: Record<string, unknown> = {
        extractedFields: JSON.parse(JSON.stringify(pendingResult.extractedFields || {})),
        lineItems: JSON.parse(JSON.stringify(pendingResult.lineItems || [])),
        tables: JSON.parse(JSON.stringify(pendingResult.tables || [])),
        medications: JSON.parse(JSON.stringify(pendingResult.medications || [])),
        validationResults: pendingResult.validationResults ? JSON.parse(JSON.stringify(pendingResult.validationResults)) : null,
        // Store thumbnail or reference, not full base64
        imageUrl: pendingResult.imageUrl?.startsWith('data:') 
          ? pendingResult.imageUrl // Keep base64 for now - will be handled by storage
          : pendingResult.imageUrl,
        savedAt: new Date().toISOString(),
        verifiedBy: user.id
      };
      
      // Validation status as string
      const validationStatusStr = pendingResult.validationResults 
        ? `passed:${pendingResult.validationResults.passed},failed:${pendingResult.validationResults.failed},warnings:${pendingResult.validationResults.warnings}`
        : 'verified';
      
      // Ensure we have a valid ID
      const documentId = pendingResult.id || crypto.randomUUID();
      
      // Update the document processing job with verified data
      const { error } = await supabase
        .from('document_processing_jobs')
        .upsert({
          id: documentId,
          user_id: user.id,
          document_type: pendingResult.documentType || selectedDocType || 'unknown',
          file_name: pendingResult.fileName || 'Unknown Document',
          file_path: pendingResult.fileName || 'unknown',
          status: 'completed',
          progress: 100,
          extracted_metadata: { 
            entities: Object.entries(pendingResult.extractedFields)
              .filter(([k]) => !k.startsWith('_'))
              .map(([k, v]: [string, any]) => ({
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
        console.error('Database save error:', error);
        toast.error('Failed to save to database', { description: error.message });
        return;
      }
      
      toast.success('Document verified and saved!');
      
      // Update local state with the saved result
      const savedResult = { ...pendingResult, id: documentId };
      setProcessingHistory((prev: any[]) => {
        const existing = prev.find((p: any) => p.id === documentId);
        if (existing) {
          return prev.map((p: any) => p.id === documentId ? savedResult : p);
        }
        return [savedResult, ...prev];
      });
      
      // Reload history from database to ensure consistency
      await loadHistory();
      
      onOpenChange(false);
      setPendingResult(null);
      
      // Switch to patient-info tab if patient onboarding
      if (selectedDocType === 'patient-onboarding' && setActiveTab) {
        setActiveTab('patient-info');
      }
      
      // Trigger sub-agent dialog after successful save
      setTimeout(() => {
        setShowSubAgentDialog(true);
      }, 500);
    } catch (err) {
      console.error('Failed to save verified document:', err);
      toast.error('Failed to save document', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset image error when dialog opens
  React.useEffect(() => {
    if (open) {
      setImageError(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Verify Extracted Data
          </DialogTitle>
          <DialogDescription>
            Review and <strong>edit</strong> extracted fields before saving. Click on any field to update it.
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
                {pendingResult.imageUrl && !imageError ? (
                  pendingResult.imageUrl.startsWith('data:application/pdf') ? (
                    // PDF base64 data URLs don't work in iframes - show download option
                    <div className="bg-muted/30 rounded-lg border p-6">
                      <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-full">
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
                    // Image files use img element with error handling
                    <img 
                      src={pendingResult.imageUrl} 
                      alt="Original document" 
                      className="w-full rounded border max-h-[400px] object-contain bg-muted/20"
                      onError={() => setImageError(true)}
                    />
                  )
                ) : (
                  <div className="bg-muted rounded p-6 text-center text-muted-foreground">
                    <ImageOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Image preview unavailable</p>
                    <p className="text-xs mt-1">
                      {pendingResult.fileName || 'Document uploaded successfully'}
                    </p>
                    {pendingResult.rawText && (
                      <pre className="text-left text-xs mt-2 max-h-40 overflow-auto bg-background p-2 rounded">
                        {pendingResult.rawText.slice(0, 500)}...
                      </pre>
                    )}
                  </div>
                )}
              </div>
              
              {/* Extracted Fields - EDITABLE */}
              <div className="border rounded-lg p-4 flex flex-col max-h-[500px]">
                <h4 className="font-medium mb-2 flex items-center gap-2 flex-shrink-0">
                  <Table2 className="h-4 w-4" />
                  Extracted Fields
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(pendingResult.extractedFields).filter(k => 
                      pendingResult.extractedFields[k]?.value && 
                      !k.startsWith('_') && 
                      !['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'].includes(k)
                    ).length} fields
                  </Badge>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    <Pencil className="h-3 w-3 mr-1" />
                    Click to edit
                  </Badge>
                </h4>
                <ScrollArea className="flex-1 min-h-0 pr-2">
                  <div className="space-y-2 pb-2">
                    {Object.entries(pendingResult.extractedFields)
                      .filter(([key, field]: [string, any]) => 
                        field?.value && 
                        !key.startsWith('_') && 
                        !['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text'].includes(key)
                      )
                      .map(([key, field]: [string, any]) => {
                        const confidence = field?.confidence || 0;
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const isEditing = editingField === key;
                        const isLowConfidence = confidence < confidenceThreshold;
                        
                        return (
                          <div 
                            key={key} 
                            className={`p-2 rounded border transition-all ${
                              isEditing 
                                ? 'bg-primary/10 border-primary ring-2 ring-primary/20' 
                                : isLowConfidence 
                                  ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50 cursor-pointer' 
                                  : 'bg-green-500/10 border-green-500/30 hover:border-green-500/50 cursor-pointer'
                            }`}
                            onClick={() => !isEditing && handleStartEdit(key, field?.value || '')}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                {label}
                                {isLowConfidence && (
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                )}
                              </Label>
                              <div className="flex items-center gap-1">
                                <Badge variant={confidence >= confidenceThreshold ? 'default' : 'secondary'} className="text-[9px]">
                                  {Math.round(confidence * 100)}%
                                </Badge>
                                {!isEditing && (
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            
                            {isEditing ? (
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-8 text-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(key);
                                    if (e.key === 'Escape') handleCancelEdit();
                                  }}
                                />
                                <Button 
                                  size="sm" 
                                  variant="default" 
                                  className="h-8 px-2"
                                  onClick={() => handleSaveEdit(key)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 px-2"
                                  onClick={handleCancelEdit}
                                >
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <p className="font-medium text-sm">{field?.value || '—'}</p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </div>
            </div>
            
            {/* Low confidence warning */}
            {Object.values(pendingResult.extractedFields).some((f: any) => f?.confidence && f.confidence < confidenceThreshold) && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Some fields have low confidence scores. Please review and edit them before saving.
                </AlertDescription>
              </Alert>
            )}
            
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
              <Button 
                variant="outline" 
                disabled={isSaving}
                onClick={() => {
                  onOpenChange(false);
                  setPendingResult(null);
                }}
              >
                Cancel & Discard
              </Button>
              <Button 
                variant="default"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Confirm & Save to History
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}