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
  ExportOptions,
  DOCUMENT_TYPE_FIELDS,
  LiveExtraction,
  ExtractionStage
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
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('prescription');

  // Dynamic tabs based on document type
  const getTabsForDocumentType = (docType: string) => {
    const baseTabs = [
      { id: 'upload', label: 'Upload', icon: Upload },
      { id: 'processing', label: 'Processing', icon: Scan },
      { id: 'mapping', label: 'Mapping', icon: Database },
      { id: 'validation', label: 'Validation', icon: CheckCircle },
    ];
    
    // Add document-type-specific tabs
    if (docType === 'prescription') {
      baseTabs.push({ id: 'medication', label: 'Medication', icon: FileType });
    } else if (docType === 'insurance_card') {
      baseTabs.push({ id: 'insurance', label: 'Insurance Details', icon: FileType });
    } else if (docType === 'lab_result') {
      baseTabs.push({ id: 'lab_results', label: 'Lab Results', icon: FileType });
    }
    
    // Always add history at the end
    baseTabs.push({ id: 'history', label: 'History', icon: FileText });
    
    return baseTabs;
  };

  const dynamicTabs = getTabsForDocumentType(selectedDocumentType);

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
          {/* Document Type Selection - Prominent */}
          <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 via-background to-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileType className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Document Type</span>
              <Badge variant="outline" className="text-xs">Select to configure workflow</Badge>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { id: 'prescription', label: 'Prescription', icon: '💊' },
                { id: 'insurance_card', label: 'Insurance', icon: '🏥' },
                { id: 'lab_result', label: 'Lab Result', icon: '🔬' },
                { id: 'medical_record', label: 'Medical Record', icon: '📋' },
                { id: 'identification', label: 'ID Document', icon: '🪪' },
                { id: 'form', label: 'General Form', icon: '📄' },
              ].map(docType => (
                <button
                  key={docType.id}
                  type="button"
                  onClick={() => setSelectedDocumentType(docType.id)}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg border transition-all hover:shadow-sm text-center",
                    selectedDocumentType === docType.id 
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30" 
                      : "border-border hover:border-primary/50 bg-background/50"
                  )}
                >
                  <span className="text-lg">{docType.icon}</span>
                  <span className="text-[10px] font-medium mt-0.5">{docType.label}</span>
                  {selectedDocumentType === docType.id && (
                    <Badge className="mt-1 text-[8px] h-3 px-1 bg-primary">Selected</Badge>
                  )}
                </button>
              ))}
            </div>
            {/* Show expected fields for selected type */}
            {DOCUMENT_TYPE_FIELDS[selectedDocumentType] && (
              <div className="mt-2 pt-2 border-t border-primary/10">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">Expected fields:</span>
                  {DOCUMENT_TYPE_FIELDS[selectedDocumentType].slice(0, 5).map(field => (
                    <Badge key={field} variant="secondary" className="text-[9px] h-4 px-1">
                      {field.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {DOCUMENT_TYPE_FIELDS[selectedDocumentType].length > 5 && (
                    <span className="text-[9px] text-muted-foreground">
                      +{DOCUMENT_TYPE_FIELDS[selectedDocumentType].length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Tabs based on document type */}
          <TabsList className={cn(
            "grid w-full",
            dynamicTabs.length === 5 && "grid-cols-5",
            dynamicTabs.length === 6 && "grid-cols-6",
            dynamicTabs.length === 7 && "grid-cols-7"
          )}>
            {dynamicTabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 text-xs">
                  <IconComponent className="h-3 w-3" />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
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

          {/* Medication Tab - Only for Prescription */}
          {selectedDocumentType === 'prescription' && (
            <TabsContent value="medication" className="space-y-4 mt-4">
              {activeJob?.extracted_metadata ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💊</span>
                    <h4 className="font-medium">Medication Details</h4>
                    <Badge variant="outline">From {activeJob.file_name}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {activeJob.extracted_metadata.entities
                      ?.filter(e => ['medication', 'dosage', 'frequency', 'quantity', 'refills', 'ndc'].includes(e.type))
                      .map((entity, idx) => (
                        <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                          <Label className="text-xs text-muted-foreground capitalize">{entity.type.replace(/_/g, ' ')}</Label>
                          <p className="font-medium">{entity.value}</p>
                          <Badge variant="secondary" className="text-[9px] mt-1">
                            {Math.round(entity.confidence * 100)}% • {entity.source === 'nlp' ? '🧠 NLP' : '📷 OCR'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl block mb-2">💊</span>
                  <p>No medication data extracted</p>
                  <p className="text-sm">Upload a prescription to see medication details</p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Insurance Tab - Only for Insurance Card */}
          {selectedDocumentType === 'insurance_card' && (
            <TabsContent value="insurance" className="space-y-4 mt-4">
              {activeJob?.extracted_metadata ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏥</span>
                    <h4 className="font-medium">Insurance Details</h4>
                    <Badge variant="outline">From {activeJob.file_name}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {activeJob.extracted_metadata.entities
                      ?.filter(e => ['insurance_provider', 'member_id', 'group_number', 'policy_holder', 'effective_date', 'copay', 'deductible'].includes(e.type))
                      .map((entity, idx) => (
                        <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                          <Label className="text-xs text-muted-foreground capitalize">{entity.type.replace(/_/g, ' ')}</Label>
                          <p className="font-medium">{entity.value}</p>
                          <Badge variant="secondary" className="text-[9px] mt-1">
                            {Math.round(entity.confidence * 100)}% • {entity.source === 'nlp' ? '🧠 NLP' : '📷 OCR'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl block mb-2">🏥</span>
                  <p>No insurance data extracted</p>
                  <p className="text-sm">Upload an insurance card to see details</p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Lab Results Tab - Only for Lab Result */}
          {selectedDocumentType === 'lab_result' && (
            <TabsContent value="lab_results" className="space-y-4 mt-4">
              {activeJob?.extracted_metadata ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔬</span>
                    <h4 className="font-medium">Lab Results</h4>
                    <Badge variant="outline">From {activeJob.file_name}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {activeJob.extracted_metadata.entities
                      ?.filter(e => ['test_name', 'test_result', 'reference_range', 'test_date', 'lab_name', 'specimen_type', 'flag'].includes(e.type))
                      .map((entity, idx) => (
                        <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                          <Label className="text-xs text-muted-foreground capitalize">{entity.type.replace(/_/g, ' ')}</Label>
                          <p className="font-medium">{entity.value}</p>
                          <Badge variant="secondary" className="text-[9px] mt-1">
                            {Math.round(entity.confidence * 100)}% • {entity.source === 'nlp' ? '🧠 NLP' : '📷 OCR'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl block mb-2">🔬</span>
                  <p>No lab results extracted</p>
                  <p className="text-sm">Upload a lab result to see details</p>
                </div>
              )}
            </TabsContent>
          )}

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            {/* Filter by selected document type */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Showing history for: <Badge variant="outline">{DOCUMENT_TYPE_LABELS[selectedDocumentType] || selectedDocumentType}</Badge>
              </span>
              <span className="text-xs text-muted-foreground">{jobs.filter(j => !selectedDocumentType || j.document_type === selectedDocumentType || !j.document_type).length} documents</span>
            </div>
            <ScrollArea className="h-[350px]">
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
                        // Update document type to match the job being viewed
                        if (job.document_type) {
                          setSelectedDocumentType(job.document_type);
                        }
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

// Real-time Extraction Display Component
const RealTimeExtractionDisplay: React.FC<{ 
  job: DocumentJob;
  extractions: LiveExtraction[];
}> = ({ job, extractions }) => {
  const recentExtractions = extractions.slice(-8);
  
  return (
    <div className="bg-muted/30 border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm font-medium">Live Field Extraction</span>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {extractions.length} fields
        </Badge>
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {recentExtractions.map((ext, idx) => (
          <div 
            key={ext.id || idx}
            className={cn(
              "flex items-center justify-between p-2 rounded-md text-xs transition-all",
              idx === recentExtractions.length - 1 && "bg-primary/10 animate-pulse",
              idx < recentExtractions.length - 1 && "bg-background/50"
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[9px] shrink-0",
                  ext.source === 'nlp' && "border-purple-500 bg-purple-500/10",
                  ext.source === 'ocr' && "border-blue-500 bg-blue-500/10"
                )}
              >
                {ext.source === 'nlp' ? '🧠 NLP' : '📷 OCR'}
              </Badge>
              <span className="font-medium capitalize truncate">{ext.fieldName.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground truncate max-w-[120px]">{ext.fieldValue}</span>
              <Badge variant="secondary" className="text-[9px]">{Math.round(ext.confidence * 100)}%</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Document Image Preview Component
const DocumentImagePreview: React.FC<{ 
  job: DocumentJob;
  className?: string;
}> = ({ job, className }) => {
  const imageUrl = job.image_url || job.image_base64;
  
  if (!imageUrl) return null;
  
  return (
    <div className={cn("border rounded-lg overflow-hidden bg-muted/30", className)}>
      <div className="flex items-center justify-between p-2 border-b bg-background/50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium truncate">{job.file_name}</span>
        </div>
        {job.document_type && job.document_type !== 'unknown' && (
          <Badge variant="outline" className="text-[10px]">
            {DOCUMENT_TYPE_LABELS[job.document_type]}
          </Badge>
        )}
      </div>
      <div className="relative aspect-[3/4] max-h-[300px] bg-black/5">
        <img 
          src={job.image_base64 ? `data:${job.mime_type};base64,${job.image_base64}` : imageUrl}
          alt={job.file_name}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

// Processing Status Component with Real-time extraction
const ProcessingStatus: React.FC<{ job: DocumentJob; onCancel: () => void }> = ({ job, onCancel }) => {
  const stages = ['extraction', 'analysis', 'entity_extraction', 'table_extraction', 'signature_detection', 'classification', 'validation', 'metadata'];
  const currentStageIndex = stages.indexOf(job.current_stage || '');
  const liveExtractions = job.live_extractions || [];
  
  // Simulate live extractions from entities if not provided directly
  const displayExtractions: LiveExtraction[] = liveExtractions.length > 0 
    ? liveExtractions 
    : (job.extracted_metadata?.entities || []).map((e, i) => ({
        id: `entity-${i}`,
        fieldName: e.type,
        fieldValue: e.value,
        confidence: e.confidence,
        source: e.source || 'ocr',
        extractedAt: new Date().toISOString()
      }));

  return (
    <div className="space-y-4">
      {/* Document Image & Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Preview */}
        {(job.image_url || job.image_base64) && (
          <DocumentImagePreview job={job} />
        )}
        
        {/* Processing Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium truncate">{job.file_name}</span>
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

          {/* Document Type & Expected Fields */}
          {job.document_type && job.document_type !== 'unknown' && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <FileType className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{DOCUMENT_TYPE_LABELS[job.document_type]}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {DOCUMENT_TYPE_FIELDS[job.document_type]?.slice(0, 6).map(field => (
                  <Badge key={field} variant="secondary" className="text-[10px]">
                    {field.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {DOCUMENT_TYPE_FIELDS[job.document_type]?.length > 6 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{DOCUMENT_TYPE_FIELDS[job.document_type].length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

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
        </div>
      </div>

      {/* Real-time Extraction Display */}
      {job.status === 'processing' && displayExtractions.length > 0 && (
        <RealTimeExtractionDisplay job={job} extractions={displayExtractions} />
      )}

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
    
    {/* Extraction Source Breakdown */}
    {metadata.extractionSummary && (
      <div className="bg-background/80 border border-border/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Extraction Sources</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded">
            <span className="text-blue-600 dark:text-blue-400 font-medium">OCR</span>
            <p className="font-bold text-lg">{metadata.extractionSummary.ocrFieldCount}</p>
            <p className="text-[10px] text-muted-foreground truncate">{metadata.extractionSummary.ocrProvider}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 p-2 rounded">
            <span className="text-purple-600 dark:text-purple-400 font-medium">AI NLP</span>
            <p className="font-bold text-lg">{metadata.extractionSummary.nlpFieldCount}</p>
            <p className="text-[10px] text-muted-foreground truncate">{metadata.extractionSummary.nlpProvider}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 p-2 rounded">
            <span className="text-green-600 dark:text-green-400 font-medium">Total</span>
            <p className="font-bold text-lg">{metadata.extractionSummary.totalFields}</p>
            <p className="text-[10px] text-muted-foreground">fields</p>
          </div>
        </div>
      </div>
    )}
    
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
        <span className="text-xs text-muted-foreground">Extracted Entities ({metadata.entities.length}):</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {metadata.entities.slice(0, 8).map((e, i) => (
            <Badge 
              key={i} 
              variant="outline" 
              className={cn(
                "text-[10px]",
                e.source === 'nlp' && "border-purple-500/50 bg-purple-500/5",
                e.source === 'ocr' && "border-blue-500/50 bg-blue-500/5"
              )}
            >
              <span className="opacity-60">{e.source === 'nlp' ? '🧠' : '📷'}</span>
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

// Job History Item Component with Thumbnail
const JobHistoryItem: React.FC<{ 
  job: DocumentJob; 
  onProcess: () => void;
  onMap: () => void;
  onView: () => void;
}> = ({ job, onProcess, onMap, onView }) => {
  const hasThumbnail = job.thumbnail_url || job.image_base64;
  
  return (
    <div className="flex items-stretch gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      {/* Document Thumbnail */}
      {hasThumbnail ? (
        <div className="w-16 h-20 rounded overflow-hidden bg-muted flex-shrink-0 border">
          <img 
            src={job.thumbnail_url || (job.image_base64 ? `data:${job.mime_type};base64,${job.image_base64}` : '')}
            alt={job.file_name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-20 rounded overflow-hidden bg-muted flex-shrink-0 border flex items-center justify-center">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      
      {/* Job Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium truncate">{job.file_name}</p>
            {job.document_type && job.document_type !== 'unknown' && (
              <Badge variant="outline" className="text-[10px]">
                {DOCUMENT_TYPE_LABELS[job.document_type]}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(job.created_at).toLocaleDateString()} • {new Date(job.created_at).toLocaleTimeString()}
          </p>
          
          {/* Extraction Summary */}
          {job.extracted_metadata?.extractionSummary && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[9px] gap-1">
                <span className="text-blue-500">📷 {job.extracted_metadata.extractionSummary.ocrFieldCount}</span>
              </Badge>
              <Badge variant="secondary" className="text-[9px] gap-1">
                <span className="text-purple-500">🧠 {job.extracted_metadata.extractionSummary.nlpFieldCount}</span>
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {job.extracted_metadata.extractionSummary.totalFields} fields
              </span>
            </div>
          )}
          
          {/* Expected Fields for Document Type */}
          {job.document_type && DOCUMENT_TYPE_FIELDS[job.document_type] && (
            <div className="flex flex-wrap gap-1 mt-1">
              {DOCUMENT_TYPE_FIELDS[job.document_type].slice(0, 4).map(field => (
                <Badge key={field} variant="outline" className="text-[9px] h-4 px-1">
                  {field.replace(/_/g, ' ')}
                </Badge>
              ))}
              {DOCUMENT_TYPE_FIELDS[job.document_type].length > 4 && (
                <Badge variant="outline" className="text-[9px] h-4 px-1 opacity-60">
                  +{DOCUMENT_TYPE_FIELDS[job.document_type].length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Progress value={job.progress} className="h-1.5 flex-1" />
          <span className="text-[10px] text-muted-foreground w-8">{job.progress}%</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col items-end justify-between">
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
          <Button variant="ghost" size="sm" onClick={onView} title="View Details">
            <Eye className="h-3 w-3" />
          </Button>
          {job.status === 'uploaded' && (
            <Button variant="ghost" size="sm" onClick={onProcess} title="Process Document">
              <Play className="h-3 w-3" />
            </Button>
          )}
          {job.status === 'completed' && (
            <Button variant="ghost" size="sm" onClick={onMap} title="Map to Form">
              <Database className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
