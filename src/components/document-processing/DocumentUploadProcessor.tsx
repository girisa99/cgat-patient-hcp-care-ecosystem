/**
 * DOCUMENT UPLOAD & PROCESSING COMPONENT
 * Real-time document upload with progress tracking, OCR, metadata extraction, and form mapping
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
import { 
  Upload, FileText, Scan, Database, CheckCircle, AlertCircle, 
  Loader2, X, Play, Eye, Copy, Trash2, RefreshCw, FileSearch,
  Sparkles, ArrowRight, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentProcessing, DocumentJob, FormMapping } from '@/hooks/useDocumentProcessing';

interface DocumentUploadProcessorProps {
  onFormMappingComplete?: (mapping: FormMapping) => void;
  targetFormFields?: string[];
  className?: string;
}

const STAGE_LABELS: Record<string, string> = {
  upload: 'Uploading',
  extraction: 'Extracting Text',
  analysis: 'Analyzing Content',
  entity_extraction: 'Extracting Entities',
  metadata: 'Generating Metadata',
  mapping: 'Mapping to Form',
  completed: 'Completed'
};

export const DocumentUploadProcessor: React.FC<DocumentUploadProcessorProps> = ({
  onFormMappingComplete,
  targetFormFields = ['patient_name', 'date_of_birth', 'npi', 'insurance_id', 'phone', 'email', 'address'],
  className
}) => {
  const {
    jobs,
    activeJob,
    isUploading,
    isProcessing,
    uploadProgress,
    formMapping,
    uploadDocument,
    processDocument,
    extractMetadata,
    mapToForm,
    cancelJob,
    subscribeToJob
  } = useDocumentProcessing();

  const [enableOCR, setEnableOCR] = useState(true);
  const [autoProcess, setAutoProcess] = useState(true);
  const [autoMap, setAutoMap] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');

  // Handle form mapping completion
  useEffect(() => {
    if (formMapping && onFormMappingComplete) {
      onFormMappingComplete(formMapping);
    }
  }, [formMapping, onFormMappingComplete]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const documentId = await uploadDocument(file, {
      enableOCR,
      extractionFields: targetFormFields
    });

    if (documentId && autoProcess) {
      setActiveTab('processing');
      const success = await processDocument(documentId);
      
      if (success && autoMap) {
        await mapToForm(documentId, targetFormFields);
        setActiveTab('mapping');
      }
    }
  }, [uploadDocument, processDocument, mapToForm, enableOCR, autoProcess, autoMap, targetFormFields]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
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

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="h-5 w-5 text-primary" />
          Document Processing
        </CardTitle>
        <CardDescription>
          Upload documents for OCR, metadata extraction, and automatic form mapping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="history" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            {/* Options */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Switch id="ocr" checked={enableOCR} onCheckedChange={setEnableOCR} />
                <Label htmlFor="ocr" className="text-sm">Enable OCR</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-process" checked={autoProcess} onCheckedChange={setAutoProcess} />
                <Label htmlFor="auto-process" className="text-sm">Auto-process</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-map" checked={autoMap} onCheckedChange={setAutoMap} />
                <Label htmlFor="auto-map" className="text-sm">Auto-map to form</Label>
              </div>
            </div>

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
                    {isDragActive ? "Drop the file here" : "Drag & drop a document, or click to select"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, Images (PNG, JPG, TIFF), Word documents
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
              <FormMappingDisplay 
                mapping={formMapping} 
                targetFields={targetFormFields}
                metadata={activeJob?.extracted_metadata}
              />
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

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            <ScrollArea className="h-[300px]">
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
  const stages = ['extraction', 'analysis', 'entity_extraction', 'metadata'];
  const currentStageIndex = stages.indexOf(job.current_stage || '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium">{job.file_name}</span>
        </div>
        <Badge variant={job.status === 'completed' ? 'default' : job.status === 'error' ? 'destructive' : 'secondary'}>
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

      {/* Stage indicators */}
      <div className="flex items-center justify-between pt-2">
        {stages.map((stage, idx) => (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                idx < currentStageIndex 
                  ? "bg-primary text-primary-foreground"
                  : idx === currentStageIndex && job.status === 'processing'
                  ? "bg-primary/20 text-primary animate-pulse"
                  : "bg-muted text-muted-foreground"
              )}>
                {idx < currentStageIndex ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className="text-[10px] mt-1 text-muted-foreground">
                {STAGE_LABELS[stage]?.split(' ')[0]}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1",
                idx < currentStageIndex ? "bg-primary" : "bg-muted"
              )} />
            )}
          </React.Fragment>
        ))}
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
    </div>
  );
};

// Metadata Preview Component
const MetadataPreview: React.FC<{ metadata: any }> = ({ metadata }) => (
  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
    <h4 className="text-sm font-medium flex items-center gap-1">
      <Eye className="h-3 w-3" />
      Extracted Metadata
    </h4>
    <div className="grid grid-cols-2 gap-2 text-xs">
      {metadata.pageCount && (
        <div><span className="text-muted-foreground">Pages:</span> {metadata.pageCount}</div>
      )}
      {metadata.wordCount && (
        <div><span className="text-muted-foreground">Words:</span> {metadata.wordCount}</div>
      )}
      {metadata.language && (
        <div><span className="text-muted-foreground">Language:</span> {metadata.language}</div>
      )}
      {metadata.keywords?.length > 0 && (
        <div className="col-span-2">
          <span className="text-muted-foreground">Keywords:</span>{' '}
          {metadata.keywords.slice(0, 5).join(', ')}
        </div>
      )}
    </div>
    {metadata.entities?.length > 0 && (
      <div className="pt-2">
        <span className="text-xs text-muted-foreground">Extracted Entities:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {metadata.entities.slice(0, 6).map((e: any, i: number) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {e.type}: {e.value.substring(0, 20)}
            </Badge>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Form Mapping Display Component
const FormMappingDisplay: React.FC<{ 
  mapping: FormMapping; 
  targetFields: string[];
  metadata?: any;
}> = ({ mapping, targetFields, metadata }) => (
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
        return (
          <div 
            key={field}
            className={cn(
              "flex items-center justify-between p-2 rounded-lg border",
              mapped ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"
            )}
          >
            <div className="flex items-center gap-2">
              {mapped ? (
                <CheckCircle className="h-4 w-4 text-primary" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{field.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              {mapped ? (
                <>
                  <span className="text-sm">{mapped.value}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {Math.round(mapped.confidence * 100)}%
                  </Badge>
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

// Job History Item Component
const JobHistoryItem: React.FC<{ 
  job: DocumentJob; 
  onProcess: () => void;
  onMap: () => void;
  onView: () => void;
}> = ({ job, onProcess, onMap, onView }) => (
  <div className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <FileText className="h-4 w-4 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{job.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(job.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Badge 
        variant={
          job.status === 'completed' ? 'default' : 
          job.status === 'error' ? 'destructive' : 
          job.status === 'processing' ? 'secondary' : 
          'outline'
        }
        className="text-[10px]"
      >
        {job.status}
      </Badge>
      {job.status === 'uploaded' && (
        <Button size="sm" variant="ghost" onClick={onProcess}>
          <Play className="h-3 w-3" />
        </Button>
      )}
      {job.status === 'completed' && (
        <>
          <Button size="sm" variant="ghost" onClick={onMap}>
            <Database className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onView}>
            <Eye className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  </div>
);

export default DocumentUploadProcessor;
