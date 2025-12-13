/**
 * ENHANCED DOCUMENT UPLOAD & PROCESSING COMPONENT
 * Real-time document upload with progress tracking, OCR, metadata extraction, 
 * table extraction, signature detection, validation, and form mapping
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, FileText, Scan, Database, CheckCircle, AlertCircle, 
  Loader2, X, Play, Eye, Copy, Trash2, RefreshCw, FileSearch,
  Sparkles, ArrowRight, Zap, Download, Edit2, Check, AlertTriangle,
  Table, PenTool, FileType, Grid, Settings, Flag, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useDocumentProcessing, 
  DocumentJob, 
  FormMapping, 
  ExtractedMetadata, 
  ExtractedTable,
  ProcessingConfig,
  FormFieldExtraction,
  ExportOptions
} from '@/hooks/useDocumentProcessing';
import { toast } from 'sonner';

interface DocumentUploadProcessorProps {
  onFormMappingComplete?: (mapping: FormMapping) => void;
  targetFormFields?: string[];
  className?: string;
  showAdvancedOptions?: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  upload: 'Uploading',
  extraction: 'Extracting Text',
  analysis: 'Analyzing Content',
  entity_extraction: 'Extracting Entities',
  table_extraction: 'Extracting Tables',
  signature_detection: 'Detecting Signatures',
  classification: 'Classifying Document',
  validation: 'Validating Data',
  metadata: 'Generating Metadata',
  mapping: 'Mapping to Form',
  completed: 'Completed'
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  invoice: 'Invoice',
  receipt: 'Receipt',
  form: 'Form',
  contract: 'Contract',
  medical_record: 'Medical Record',
  insurance_card: 'Insurance Card',
  prescription: 'Prescription',
  lab_result: 'Lab Result',
  identification: 'ID Document',
  unknown: 'Unknown'
};

export const DocumentUploadProcessor: React.FC<DocumentUploadProcessorProps> = ({
  onFormMappingComplete,
  targetFormFields = ['patient_name', 'date_of_birth', 'npi', 'insurance_id', 'phone', 'email', 'address'],
  className,
  showAdvancedOptions = true
}) => {
  const {
    jobs,
    activeJob,
    isUploading,
    isProcessing,
    uploadProgress,
    formMapping,
    batchProgress,
    uploadDocument,
    uploadBatch,
    processDocument,
    extractMetadata,
    mapToForm,
    cancelJob,
    updateFieldValue,
    verifyField,
    flagForReview,
    exportResults,
    subscribeToJob
  } = useDocumentProcessing();

  // Processing options
  const [enableOCR, setEnableOCR] = useState(true);
  const [enableHandwriting, setEnableHandwriting] = useState(false);
  const [enableTableExtraction, setEnableTableExtraction] = useState(true);
  const [enableSignatureDetection, setEnableSignatureDetection] = useState(true);
  const [enableDocumentClassification, setEnableDocumentClassification] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [autoProcess, setAutoProcess] = useState(true);
  const [autoMap, setAutoMap] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [ocrProvider, setOcrProvider] = useState<'google' | 'azure' | 'aws'>('google');

  // Handle form mapping completion
  useEffect(() => {
    if (formMapping && onFormMappingComplete) {
      onFormMappingComplete(formMapping);
    }
  }, [formMapping, onFormMappingComplete]);

  const getProcessingConfig = (): ProcessingConfig => ({
    enableOCR,
    enableHandwritingRecognition: enableHandwriting,
    enableTableExtraction,
    enableSignatureDetection,
    enableDocumentClassification,
    extractionFields: targetFormFields,
    confidenceThreshold,
    ocrProvider
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      // Batch upload
      await uploadBatch(acceptedFiles, getProcessingConfig());
      setActiveTab('history');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    const documentId = await uploadDocument(file, getProcessingConfig());

    if (documentId && autoProcess) {
      setActiveTab('processing');
      const success = await processDocument(documentId);
      
      if (success && autoMap) {
        await mapToForm(documentId, targetFormFields);
        setActiveTab('mapping');
      }
    }
  }, [uploadDocument, uploadBatch, processDocument, mapToForm, autoProcess, autoMap, targetFormFields, enableOCR, enableHandwriting, enableTableExtraction, enableSignatureDetection, enableDocumentClassification, confidenceThreshold]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: isUploading || isProcessing
  });

  const handleProcessClick = async (jobId: string) => {
    subscribeToJob(jobId);
    setActiveTab('processing');
    const success = await processDocument(jobId);
    if (success && autoMap) {
      await mapToForm(jobId, targetFormFields);
      setActiveTab('mapping');
    }
  };

  const handleMapClick = async (jobId: string) => {
    await mapToForm(jobId, targetFormFields);
    setActiveTab('mapping');
  };

  const handleEditField = (fieldName: string, currentValue: string) => {
    setEditingField(fieldName);
    setEditValue(currentValue);
  };

  const handleSaveField = async () => {
    if (editingField && activeJob) {
      await updateFieldValue(activeJob.id, editingField, editValue);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleVerifyField = async (fieldName: string) => {
    if (activeJob) {
      await verifyField(activeJob.id, fieldName);
    }
  };

  const handleFlagForReview = async () => {
    if (activeJob && reviewReason) {
      await flagForReview(activeJob.id, reviewReason);
      setReviewReason('');
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    if (activeJob) {
      const blob = await exportResults(activeJob.id, { format, includeMetadata: true });
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeJob.file_name.replace(/\.[^.]+$/, '')}_extracted.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported as ${format.toUpperCase()}`);
      }
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="h-5 w-5 text-primary" />
          Advanced Document Processing
        </CardTitle>
        <CardDescription>
          OCR, table extraction, signature detection, validation, and automatic form mapping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload" className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-1">
              <Scan className="h-3 w-3" />
              Processing
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Mapping
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            {/* Processing Options - Prominent Section */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  Processing Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* OCR Provider Selection - Now Prominent */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Scan className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">OCR Provider</span>
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setOcrProvider('google')}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:shadow-md",
                        ocrProvider === 'google' 
                          ? "border-primary bg-primary/10 shadow-sm" 
                          : "border-border hover:border-primary/50 bg-background"
                      )}
                    >
                      <span className="text-xl mb-1">🔍</span>
                      <span className="text-xs font-semibold">Google Vision</span>
                      <span className="text-[10px] text-muted-foreground">Cloud Vision AI</span>
                      {ocrProvider === 'google' && <Badge className="mt-1 text-[10px] h-4 bg-green-500">Active</Badge>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOcrProvider('azure')}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:shadow-md",
                        ocrProvider === 'azure' 
                          ? "border-primary bg-primary/10 shadow-sm" 
                          : "border-border hover:border-primary/50 bg-background"
                      )}
                    >
                      <span className="text-xl mb-1">📘</span>
                      <span className="text-xs font-semibold">Azure</span>
                      <span className="text-[10px] text-muted-foreground">Form Recognizer</span>
                      {ocrProvider === 'azure' && <Badge className="mt-1 text-[10px] h-4 bg-blue-500">Active</Badge>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOcrProvider('aws')}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:shadow-md",
                        ocrProvider === 'aws' 
                          ? "border-primary bg-primary/10 shadow-sm" 
                          : "border-border hover:border-primary/50 bg-background"
                      )}
                    >
                      <span className="text-xl mb-1">☁️</span>
                      <span className="text-xs font-semibold">AWS</span>
                      <span className="text-[10px] text-muted-foreground">Textract</span>
                      {ocrProvider === 'aws' && <Badge className="mt-1 text-[10px] h-4 bg-orange-500">Active</Badge>}
                    </button>
                  </div>
                </div>

                {/* Quick Processing Options */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch id="ocr" checked={enableOCR} onCheckedChange={setEnableOCR} />
                    <Label htmlFor="ocr" className="text-xs">OCR</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="handwriting" checked={enableHandwriting} onCheckedChange={setEnableHandwriting} />
                    <Label htmlFor="handwriting" className="text-xs">Handwriting</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="tables" checked={enableTableExtraction} onCheckedChange={setEnableTableExtraction} />
                    <Label htmlFor="tables" className="text-xs">Tables</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="signatures" checked={enableSignatureDetection} onCheckedChange={setEnableSignatureDetection} />
                    <Label htmlFor="signatures" className="text-xs">Signatures</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-process" checked={autoProcess} onCheckedChange={setAutoProcess} />
                    <Label htmlFor="auto-process" className="text-xs">Auto-process</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-map" checked={autoMap} onCheckedChange={setAutoMap} />
                    <Label htmlFor="auto-map" className="text-xs">Auto-map</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Options */}
            {showAdvancedOptions && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Settings className="h-4 w-4" />
                  Advanced Settings
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Confidence Threshold</Label>
                    <Select value={String(confidenceThreshold)} onValueChange={(v) => setConfidenceThreshold(Number(v))}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">50% (Low)</SelectItem>
                        <SelectItem value="0.7">70% (Medium)</SelectItem>
                        <SelectItem value="0.85">85% (High)</SelectItem>
                        <SelectItem value="0.95">95% (Very High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="classification" checked={enableDocumentClassification} onCheckedChange={setEnableDocumentClassification} />
                    <Label htmlFor="classification" className="text-xs">Auto-classify Document Type</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Progress */}
            {batchProgress && (
              <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Batch Upload Progress</span>
                  <span className="text-sm">{batchProgress.completed}/{batchProgress.total}</span>
                </div>
                <Progress value={(batchProgress.completed / batchProgress.total) * 100} className="h-2" />
              </div>
            )}

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                (isUploading || isProcessing) && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading document...</p>
                  <Progress value={uploadProgress} className="w-48 mx-auto" />
                  <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {isDragActive ? "Drop files here" : "Drag & drop documents, or click to select"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, Images (PNG, JPG, TIFF), Word documents • Multiple files for batch processing
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing" className="space-y-4 mt-4">
            {activeJob ? (
              <ProcessingStatus 
                job={activeJob} 
                onCancel={() => cancelJob(activeJob.id)} 
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scan className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active processing job</p>
                <p className="text-sm">Upload a document to start processing</p>
              </div>
            )}
          </TabsContent>

          {/* Mapping Tab */}
          <TabsContent value="mapping" className="space-y-4 mt-4">
            {formMapping ? (
              <div className="space-y-4">
                <FormMappingDisplay 
                  mapping={formMapping} 
                  targetFields={targetFormFields}
                  metadata={activeJob?.extracted_metadata}
                  editingField={editingField}
                  editValue={editValue}
                  onEdit={handleEditField}
                  onSave={handleSaveField}
                  onVerify={handleVerifyField}
                  onEditValueChange={setEditValue}
                  onCancelEdit={() => setEditingField(null)}
                />
                
                {/* Export Options */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Export:</span>
                  <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                    <Download className="mr-1 h-3 w-3" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                    <Download className="mr-1 h-3 w-3" />
                    CSV
                  </Button>
                </div>
              </div>
            ) : activeJob?.status === 'completed' ? (
              <div className="text-center py-8">
                <Button onClick={() => handleMapClick(activeJob.id)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Form Mapping
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No mapping available</p>
                <p className="text-sm">Complete document processing first</p>
              </div>
            )}
          </TabsContent>

          {/* Validation Tab */}
          <TabsContent value="validation" className="space-y-4 mt-4">
            {activeJob ? (
              <ValidationDisplay 
                job={activeJob}
                formMapping={formMapping}
                confidenceThreshold={confidenceThreshold}
                reviewReason={reviewReason}
                onReviewReasonChange={setReviewReason}
                onFlagForReview={handleFlagForReview}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No document to validate</p>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            <ScrollArea className="h-[400px]">
              {jobs.length > 0 ? (
                <div className="space-y-2">
                  {jobs.map(job => (
                    <JobHistoryItem 
                      key={job.id} 
                      job={job}
                      onProcess={() => handleProcessClick(job.id)}
                      onMap={() => handleMapClick(job.id)}
                      onView={() => {
                        subscribeToJob(job.id);
                        setActiveTab('processing');
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No processing history</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Processing Status Component
const ProcessingStatus: React.FC<{ job: DocumentJob; onCancel: () => void }> = ({ job, onCancel }) => {
  const stages = ['extraction', 'analysis', 'entity_extraction', 'table_extraction', 'signature_detection', 'classification', 'validation', 'metadata'];
  const currentStageIndex = stages.indexOf(job.current_stage || '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium">{job.file_name}</span>
          {job.document_type && job.document_type !== 'unknown' && (
            <Badge variant="outline" className="text-xs">
              <FileType className="mr-1 h-3 w-3" />
              {DOCUMENT_TYPE_LABELS[job.document_type]}
            </Badge>
          )}
        </div>
        <Badge variant={
          job.status === 'completed' ? 'default' : 
          job.status === 'error' ? 'destructive' : 
          job.status === 'needs_review' ? 'secondary' : 
          'outline'
        }>
          {job.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{STAGE_LABELS[job.current_stage || 'upload'] || job.current_stage}</span>
          <span>{job.progress}%</span>
        </div>
        <Progress value={job.progress} className="h-2" />
        {job.stage_message && (
          <p className="text-xs text-muted-foreground">{job.stage_message}</p>
        )}
      </div>

      {/* Compact stage indicators */}
      <div className="flex items-center gap-1 pt-2 overflow-x-auto">
        {stages.slice(0, 5).map((stage, idx) => (
          <div 
            key={stage}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0",
              idx < currentStageIndex 
                ? "bg-primary text-primary-foreground"
                : idx === currentStageIndex && job.status === 'processing'
                ? "bg-primary/20 text-primary animate-pulse"
                : "bg-muted text-muted-foreground"
            )}
            title={STAGE_LABELS[stage]}
          >
            {idx < currentStageIndex ? <Check className="h-3 w-3" /> : idx + 1}
          </div>
        ))}
        {stages.length > 5 && (
          <span className="text-xs text-muted-foreground">+{stages.length - 5}</span>
        )}
      </div>

      {job.status === 'processing' && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="mr-1 h-3 w-3" />
            Cancel
          </Button>
        </div>
      )}

      {job.status === 'completed' && job.extracted_metadata && (
        <MetadataPreview metadata={job.extracted_metadata} />
      )}

      {job.status === 'error' && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{job.error_message || 'Processing failed'}</span>
        </div>
      )}

      {job.status === 'needs_review' && (
        <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span>Flagged for manual review: {job.stage_message}</span>
        </div>
      )}
    </div>
  );
};

// Metadata Preview Component
const MetadataPreview: React.FC<{ metadata: ExtractedMetadata }> = ({ metadata }) => (
  <div className="bg-muted/50 rounded-lg p-3 space-y-3">
    <h4 className="text-sm font-medium flex items-center gap-1">
      <Eye className="h-3 w-3" />
      Extracted Data Summary
    </h4>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
      {metadata.pageCount && (
        <div className="bg-background p-2 rounded">
          <span className="text-muted-foreground">Pages</span>
          <p className="font-medium">{metadata.pageCount}</p>
        </div>
      )}
      {metadata.wordCount && (
        <div className="bg-background p-2 rounded">
          <span className="text-muted-foreground">Words</span>
          <p className="font-medium">{metadata.wordCount}</p>
        </div>
      )}
      {metadata.tables?.length !== undefined && metadata.tables.length > 0 && (
        <div className="bg-background p-2 rounded">
          <span className="text-muted-foreground">Tables</span>
          <p className="font-medium">{metadata.tables.length}</p>
        </div>
      )}
      {metadata.signatures?.length !== undefined && metadata.signatures.length > 0 && (
        <div className="bg-background p-2 rounded">
          <span className="text-muted-foreground">Signatures</span>
          <p className="font-medium">{metadata.signatures.filter(s => s.detected).length}</p>
        </div>
      )}
    </div>

    {metadata.documentClassification && (
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          <FileType className="mr-1 h-3 w-3" />
          {DOCUMENT_TYPE_LABELS[metadata.documentClassification.type]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {Math.round(metadata.documentClassification.confidence * 100)}% confidence
        </span>
      </div>
    )}

    {metadata.entities && metadata.entities.length > 0 && (
      <div className="pt-2">
        <span className="text-xs text-muted-foreground">Extracted Entities:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {metadata.entities.slice(0, 8).map((e, i) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {e.type}: {e.value.substring(0, 20)}
            </Badge>
          ))}
          {metadata.entities.length > 8 && (
            <Badge variant="outline" className="text-[10px]">+{metadata.entities.length - 8} more</Badge>
          )}
        </div>
      </div>
    )}

    {metadata.tables && metadata.tables.length > 0 && (
      <div className="pt-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Table className="h-3 w-3" />
          Tables Detected: {metadata.tables.length}
        </span>
      </div>
    )}

    {metadata.signatures && metadata.signatures.some(s => s.detected) && (
      <div className="pt-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <PenTool className="h-3 w-3" />
          Signatures Detected: {metadata.signatures.filter(s => s.detected).length}
        </span>
      </div>
    )}
  </div>
);

// Form Mapping Display Component with Editing
interface FormMappingDisplayProps {
  mapping: FormMapping;
  targetFields: string[];
  metadata?: ExtractedMetadata;
  editingField: string | null;
  editValue: string;
  onEdit: (fieldName: string, currentValue: string) => void;
  onSave: () => void;
  onVerify: (fieldName: string) => void;
  onEditValueChange: (value: string) => void;
  onCancelEdit: () => void;
}

const FormMappingDisplay: React.FC<FormMappingDisplayProps> = ({ 
  mapping, 
  targetFields, 
  metadata,
  editingField,
  editValue,
  onEdit,
  onSave,
  onVerify,
  onEditValueChange,
  onCancelEdit
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Form Field Mapping
      </h4>
      <Badge variant="secondary">
        {Object.keys(mapping).length}/{targetFields.length} mapped
      </Badge>
    </div>
    
    <div className="space-y-2">
      {targetFields.map(field => {
        const mapped = mapping[field];
        const isEditing = editingField === field;
        
        return (
          <div 
            key={field}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              mapped?.verified ? "border-green-500/30 bg-green-500/5" :
              mapped ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"
            )}
          >
            <div className="flex items-center gap-2 flex-1">
              {mapped?.verified ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : mapped ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium capitalize">{field.replace(/_/g, ' ')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Input 
                    value={editValue}
                    onChange={(e) => onEditValueChange(e.target.value)}
                    className="h-8 w-40"
                    autoFocus
                  />
                  <Button variant="ghost" size="sm" onClick={onSave}>
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : mapped ? (
                <>
                  <span className="text-sm">{mapped.value}</span>
                  <Badge 
                    variant={mapped.confidence >= 0.8 ? 'default' : mapped.confidence >= 0.5 ? 'secondary' : 'destructive'} 
                    className="text-[10px]"
                  >
                    {Math.round(mapped.confidence * 100)}%
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(field, mapped.value)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  {!mapped.verified && (
                    <Button variant="ghost" size="sm" onClick={() => onVerify(field)}>
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Not found</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Validation Display Component
interface ValidationDisplayProps {
  job: DocumentJob;
  formMapping: FormMapping | null;
  confidenceThreshold: number;
  reviewReason: string;
  onReviewReasonChange: (reason: string) => void;
  onFlagForReview: () => void;
}

const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  job,
  formMapping,
  confidenceThreshold,
  reviewReason,
  onReviewReasonChange,
  onFlagForReview
}) => {
  const lowConfidenceFields = formMapping 
    ? Object.entries(formMapping).filter(([_, v]) => v.confidence < confidenceThreshold)
    : [];
  
  const unverifiedFields = formMapping
    ? Object.entries(formMapping).filter(([_, v]) => !v.verified)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-primary" />
          Validation Summary
        </h4>
        <Badge variant={lowConfidenceFields.length === 0 ? 'default' : 'secondary'}>
          {lowConfidenceFields.length === 0 ? 'All fields validated' : `${lowConfidenceFields.length} need review`}
        </Badge>
      </div>

      {/* Validation Status */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-500/10 p-3 rounded-lg text-center">
          <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-1" />
          <p className="text-lg font-bold">{formMapping ? Object.keys(formMapping).length - lowConfidenceFields.length : 0}</p>
          <p className="text-xs text-muted-foreground">High Confidence</p>
        </div>
        <div className="bg-amber-500/10 p-3 rounded-lg text-center">
          <AlertTriangle className="h-6 w-6 mx-auto text-amber-500 mb-1" />
          <p className="text-lg font-bold">{lowConfidenceFields.length}</p>
          <p className="text-xs text-muted-foreground">Low Confidence</p>
        </div>
        <div className="bg-blue-500/10 p-3 rounded-lg text-center">
          <Eye className="h-6 w-6 mx-auto text-blue-500 mb-1" />
          <p className="text-lg font-bold">{formMapping ? Object.keys(formMapping).filter(k => formMapping[k]?.verified).length : 0}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>
      </div>

      {/* Low Confidence Fields */}
      {lowConfidenceFields.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-amber-600">Fields Requiring Review:</h5>
          {lowConfidenceFields.map(([field, data]) => (
            <div key={field} className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-200">
              <span className="text-sm capitalize">{field.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{data.value}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {Math.round(data.confidence * 100)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flag for Review */}
      <div className="pt-4 border-t space-y-2">
        <Label className="text-sm">Flag for Manual Review</Label>
        <div className="flex gap-2">
          <Textarea 
            placeholder="Enter reason for manual review..."
            value={reviewReason}
            onChange={(e) => onReviewReasonChange(e.target.value)}
            className="h-16"
          />
          <Button 
            variant="outline" 
            onClick={onFlagForReview}
            disabled={!reviewReason.trim()}
          >
            <Flag className="mr-1 h-4 w-4" />
            Flag
          </Button>
        </div>
      </div>
    </div>
  );
};

// Job History Item Component
const JobHistoryItem: React.FC<{ 
  job: DocumentJob; 
  onProcess: () => void;
  onMap: () => void;
  onView: () => void;
}> = ({ job, onProcess, onMap, onView }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <FileText className="h-4 w-4 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{job.file_name}</p>
          {job.document_type && job.document_type !== 'unknown' && (
            <Badge variant="outline" className="text-[10px]">
              {DOCUMENT_TYPE_LABELS[job.document_type]}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(job.created_at).toLocaleDateString()} • {job.progress}%
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Badge 
        variant={
          job.status === 'completed' ? 'default' : 
          job.status === 'error' ? 'destructive' : 
          job.status === 'processing' ? 'secondary' :
          job.status === 'needs_review' ? 'outline' :
          'outline'
        }
        className="text-xs"
      >
        {job.status}
      </Badge>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onView} title="View">
          <Eye className="h-3 w-3" />
        </Button>
        {job.status === 'uploaded' && (
          <Button variant="ghost" size="sm" onClick={onProcess} title="Process">
            <Play className="h-3 w-3" />
          </Button>
        )}
        {job.status === 'completed' && (
          <Button variant="ghost" size="sm" onClick={onMap} title="Map">
            <Database className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  </div>
);
