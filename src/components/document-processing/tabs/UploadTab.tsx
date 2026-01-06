/**
 * UploadTab Component
 * Handles document upload dropzone and extraction results display
 * Extracted from DocumentProcessing.tsx for maintainability
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Pill, 
  FileText, 
  Table2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { ProcessingResult, ProcessingStage, MedicationResult } from '@/hooks/useDocumentProcessingState';
import { DocumentTypeConfig } from '@/config/documentTypes';
import ProcessingOptionsPanel from '@/components/document-processing/ProcessingOptionsPanel';
import RealTimeExtractionTracker from '@/components/document-processing/RealTimeExtractionTracker';
import ExtractionMetricsSummary from '@/components/document-processing/ExtractionMetricsSummary';
import { ModelRoutingPanel } from '@/components/document-processing/ModelRoutingPanel';
import { expandAbbreviation } from '@/utils/healthcareAbbreviations';

// Helper to count visible fields consistently
const countVisibleFields = (extractedFields: Record<string, any>): number => {
  const EXCLUDED = ['line_items', 'tables', 'raw_text', 'detected_document_type', 'document_category', '_pipeline_type', '_ocr_text_length', '_ocr_confidence'];
  return Object.entries(extractedFields).filter(([key, field]) => 
    field?.value && !key.startsWith('_') && !EXCLUDED.includes(key)
  ).length;
};

interface UploadTabProps {
  currentConfig: DocumentTypeConfig;
  processingResult: ProcessingResult | null;
  setProcessingResult: (result: ProcessingResult | null | ((prev: ProcessingResult | null) => ProcessingResult | null)) => void;
  onDrop: (files: File[]) => void;
  onVerifyAndSave: () => Promise<void> | void;
  // Processing options
  enableOCR: boolean;
  setEnableOCR: (value: boolean) => void;
  enableHandwriting: boolean;
  setEnableHandwriting: (value: boolean) => void;
  enableTableExtraction: boolean;
  setEnableTableExtraction: (value: boolean) => void;
  enableSignatureDetection: boolean;
  setEnableSignatureDetection: (value: boolean) => void;
  enableAutoCalculateQty: boolean;
  setEnableAutoCalculateQty: (value: boolean) => void;
  enableNdcMatching: boolean;
  setEnableNdcMatching: (value: boolean) => void;
  enableClinicalRecommendations: boolean;
  setEnableClinicalRecommendations: (value: boolean) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (value: number) => void;
  ocrProvider: 'google' | 'azure' | 'aws';
  setOcrProvider: (value: 'google' | 'azure' | 'aws') => void;
}

export default function UploadTab({
  currentConfig,
  processingResult,
  setProcessingResult,
  onDrop,
  onVerifyAndSave,
  enableOCR,
  setEnableOCR,
  enableHandwriting,
  setEnableHandwriting,
  enableTableExtraction,
  setEnableTableExtraction,
  enableSignatureDetection,
  setEnableSignatureDetection,
  enableAutoCalculateQty,
  setEnableAutoCalculateQty,
  enableNdcMatching,
  setEnableNdcMatching,
  enableClinicalRecommendations,
  setEnableClinicalRecommendations,
  confidenceThreshold,
  setConfidenceThreshold,
  ocrProvider,
  setOcrProvider
}: UploadTabProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.heic', '.heif', '.bmp', '.gif'],
      'application/pdf': ['.pdf'],
      'image/tiff': ['.tiff', '.tif'],
      'image/heic': ['.heic', '.heif'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/dicom': ['.dcm', '.dicom'],
    },
    maxFiles: 1
  });

  // Track save loading state
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onVerifyAndSave();
    } finally {
      setIsSaving(false);
    }
  };

  const getStageIcon = (stage: ProcessingStage) => {
    switch (stage) {
      case 'uploading': return <Upload className="h-4 w-4 animate-pulse" />;
      case 'ocr': return <Eye className="h-4 w-4 animate-pulse" />;
      case 'extraction': return <Table2 className="h-4 w-4 animate-pulse" />;
      case 'mapping': return <ClipboardList className="h-4 w-4 animate-pulse" />;
      case 'validation': return <CheckCircle className="h-4 w-4 animate-pulse" />;
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upload Area */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Drop document here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports PDF, JPG, PNG, TIFF, FAX, HEIC • OCR for handwritten & printed
              </p>
              <Badge variant="secondary" className="mt-4">
                {currentConfig.title}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Processing Result */}
        {processingResult && (
          <Card className={processingResult.stage === 'error' ? 'border-destructive' : 'border-primary/30'}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header with Image Preview and Status */}
                <div className="flex items-start gap-4">
                  {/* Image Preview */}
                  {processingResult.imageUrl && (
                    <div className="flex-shrink-0">
                      <img 
                        src={processingResult.imageUrl} 
                        alt="Uploaded document" 
                        className="w-32 h-auto rounded-lg border shadow-sm object-cover max-h-40"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStageIcon(processingResult.stage)}
                        <span className="font-medium">{processingResult.fileName}</span>
                      </div>
                      <Badge variant={processingResult.stage === 'complete' ? 'default' : 'secondary'}>
                        {processingResult.stage.charAt(0).toUpperCase() + processingResult.stage.slice(1)}
                      </Badge>
                    </div>

                    {processingResult.stage !== 'complete' && processingResult.stage !== 'error' && (
                      <div className="mt-2">
                        <Progress value={processingResult.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Processing... {processingResult.progress}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-time extraction tracker - shows during ALL processing stages */}
                {processingResult.stage !== 'idle' && processingResult.stage !== 'complete' && processingResult.stage !== 'error' && (
                  <RealTimeExtractionTracker 
                    currentStage={processingResult.stage}
                    progress={processingResult.progress}
                    extractedFields={processingResult.extractedFields}
                    documentType={processingResult.documentType}
                    isProcessing={true}
                    fileName={processingResult.fileName}
                    ocrProvider={ocrProvider === 'google' ? 'Google Vision' : ocrProvider === 'azure' ? 'Azure AI Vision' : 'AWS Textract'}
                    visionAiProvider="Gemini 2.5 Flash"
                    isHandwritten={enableHandwriting}
                  />
                )}

                {processingResult.stage === 'error' && (
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <p className="text-destructive">{processingResult.error}</p>
                  </div>
                )}

                {/* Extraction Metrics Summary - shows after completion */}
                {processingResult.stage === 'complete' && Object.keys(processingResult.extractedFields).length > 0 && (
                  <>
                    <ExtractionMetricsSummary
                      extractedFields={processingResult.extractedFields}
                      validationResults={processingResult.validationResults}
                      ocrProvider={ocrProvider === 'google' ? 'Google Vision' : ocrProvider === 'azure' ? 'Azure AI Vision' : 'AWS Textract'}
                      visionAiProvider="Gemini 2.5 Flash"
                      isHandwritten={enableHandwriting}
                    />
                  </>
                )}

                {/* Model Routing Panel - shows Stage 1 → Stage 2 pipeline details */}
                {processingResult.stage === 'complete' && processingResult.modelRouting && (
                  <ModelRoutingPanel
                    routingInfo={processingResult.modelRouting}
                    documentType={processingResult.documentType}
                    variant="detailed"
                  />
                )}

                {/* Extracted Fields - Editable */}
                {processingResult.stage === 'complete' && Object.keys(processingResult.extractedFields).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Extracted Fields (Click to Edit)
                      </h4>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="grid grid-cols-2 gap-3 pb-4">
                          {Object.entries(processingResult.extractedFields)
                            .filter(([key, field]) => 
                              field?.value && 
                              !key.startsWith('_') && 
                              !['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text', '_pipeline_type', '_ocr_text_length', '_ocr_confidence'].includes(key)
                            )
                            .map(([key, field]) => {
                              const label = expandAbbreviation(key.replace(/_/g, ' '));
                              return (
                                <div 
                                  key={key} 
                                  className={`p-3 rounded-lg border ${
                                    field?.confidence && field.confidence >= confidenceThreshold 
                                      ? 'bg-green-500/10 border-green-500/30' 
                                      : 'bg-yellow-500/10 border-yellow-500/30'
                                  }`}
                                >
                                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                    {label}
                                  </Label>
                                  <Input
                                    value={field?.value || ''}
                                    onChange={(e) => {
                                      setProcessingResult((prev: ProcessingResult | null) => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          extractedFields: {
                                            ...prev.extractedFields,
                                            [key]: {
                                              ...prev.extractedFields[key],
                                              value: e.target.value
                                            }
                                          }
                                        };
                                      });
                                    }}
                                    className="mt-1 h-8 text-sm"
                                  />
                                  {field?.confidence && (
                                    <Badge 
                                      variant={field.confidence >= confidenceThreshold ? 'default' : 'secondary'} 
                                      className="mt-1 text-[9px]"
                                    >
                                      {Math.round(field.confidence * 100)}% confidence
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSaveClick}
                        disabled={isSaving}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Confirm & Save to History
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}

                {/* Medication Results */}
                {processingResult.medications && processingResult.medications.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Medication Details
                      </h4>
                      {processingResult.medications.map((med, i) => (
                        <Card key={i} className="bg-muted/50">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{med.drugName} {med.strength}</p>
                                <p className="text-sm text-muted-foreground">{med.sig}</p>
                              </div>
                              <Badge>NDC: {med.ndc}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                              <div>
                                <p className="text-2xl font-bold text-primary">{med.calculatedQuantity}</p>
                                <p className="text-xs text-muted-foreground">Quantity</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-primary">{med.daysSupply}</p>
                                <p className="text-xs text-muted-foreground">Days Supply</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-primary">{med.dailyDose}</p>
                                <p className="text-xs text-muted-foreground">Daily Dose</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {/* Validation Summary */}
                {processingResult.validationResults && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">Validation Results</span>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-500">{processingResult.validationResults.passed} Passed</Badge>
                          {processingResult.validationResults.warnings > 0 && (
                            <Badge variant="secondary">{processingResult.validationResults.warnings} Warnings</Badge>
                          )}
                          {processingResult.validationResults.failed > 0 && (
                            <Badge variant="destructive">{processingResult.validationResults.failed} Failed</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-3 border border-border/50 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Extracted {countVisibleFields(processingResult.extractedFields)} fields from document
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Processing Options Sidebar - Document Configuration */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Document Configuration
        </div>
        <ProcessingOptionsPanel
          documentConfig={currentConfig}
          enableOCR={enableOCR}
          setEnableOCR={setEnableOCR}
          enableHandwriting={enableHandwriting}
          setEnableHandwriting={setEnableHandwriting}
          enableTableExtraction={enableTableExtraction}
          setEnableTableExtraction={setEnableTableExtraction}
          enableSignatureDetection={enableSignatureDetection}
          setEnableSignatureDetection={setEnableSignatureDetection}
          enableAutoCalculateQty={enableAutoCalculateQty}
          setEnableAutoCalculateQty={setEnableAutoCalculateQty}
          enableNdcMatching={enableNdcMatching}
          setEnableNdcMatching={setEnableNdcMatching}
          enableClinicalRecommendations={enableClinicalRecommendations}
          setEnableClinicalRecommendations={setEnableClinicalRecommendations}
          confidenceThreshold={confidenceThreshold}
          setConfidenceThreshold={setConfidenceThreshold}
          ocrProvider={ocrProvider}
          setOcrProvider={setOcrProvider}
        />
      </div>
    </div>
  );
}
