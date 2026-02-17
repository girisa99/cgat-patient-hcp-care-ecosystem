/**
 * DYNAMIC ENROLLMENT FORM EXTRACTOR COMPONENT
 * 
 * Features:
 * - Upload any patient enrollment form (PDF/Image)
 * - Display form image for visual verification
 * - 2-stage AI extraction with progress tracking
 * - Section-by-section verification
 * - State persistence (localStorage + database)
 * - Save to history
 * - Push to external system
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, FileText, Scan, CheckCircle, AlertCircle, 
  Loader2, X, Eye, Edit2, Check, AlertTriangle,
  Save, Send, RefreshCw, ChevronRight, ChevronDown,
  FileImage, Sparkles, Clock, Zap, Shield, Download,
  Building2, User, CreditCard, DollarSign, Pill, Heart,
  PenTool, ClipboardCheck, Package, FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// ============= TYPES =============

interface ExtractedField {
  fieldId: string;
  fieldLabel: string;
  fieldValue: string | boolean | number | null;
  fieldType: string;
  sectionTitle: string;
  sectionKey: string;
  required: boolean;
  isHandwritten: boolean;
  confidence: number;
  alternativeReading?: string;
  verified: boolean;
  isValid: boolean;
  validationErrors: string[];
  pageNumber: number;
}

interface DetectedSection {
  sectionId: string;
  sectionTitle: string;
  sectionDescription: string;
  pageNumber: number;
  estimatedFieldCount: number;
  hasCheckboxes: boolean;
  hasSignatureArea: boolean;
  hasHandwriting: boolean;
  priority: string;
}

interface FormIdentification {
  manufacturerName: string;
  programName: string;
  formTitle: string;
  formVersion?: string;
  formLanguage: string;
  contactPhone?: string;
  contactFax?: string;
  totalPages: number;
  isHandwritten: boolean;
  isPartiallyFilled: boolean;
}

interface ExtractionResult {
  success: boolean;
  extractionId: string;
  sessionId: string;
  extractedAt: string;
  processingTimeMs: number;
  pipeline: {
    stage1Model: string;
    stage1TimeMs: number;
    stage2Model: string;
    stage2TimeMs: number;
    totalTimeMs: number;
  };
  formIdentification: FormIdentification;
  detectedSections: DetectedSection[];
  fieldsBySection: Record<string, ExtractedField[]>;
  allFields: ExtractedField[];
  validationSummary: {
    totalFields: number;
    requiredFieldsCount: number;
    filledFieldsCount: number;
    handwrittenFieldsCount: number;
    lowConfidenceFieldsCount: number;
    emptyRequiredFields: string[];
    completionPercentage: number;
    needsReview: boolean;
  };
  overallConfidence: number;
  hasHandwriting: boolean;
  verificationState: {
    sectionsVerified: Record<string, boolean>;
    allVerified: boolean;
    lastUpdated: string;
  };
}

interface EnrollmentFormExtractorProps {
  onExtractionComplete?: (result: ExtractionResult) => void;
  onSaveToHistory?: (result: ExtractionResult) => void;
  onPushToExternalSystem?: (result: ExtractionResult) => Promise<void>;
  className?: string;
}

// Section icon mapping
const SECTION_ICONS: Record<string, React.ReactNode> = {
  patient: <User className="h-4 w-4" />,
  provider: <Building2 className="h-4 w-4" />,
  prescriber: <Building2 className="h-4 w-4" />,
  insurance: <CreditCard className="h-4 w-4" />,
  coverage: <CreditCard className="h-4 w-4" />,
  income: <DollarSign className="h-4 w-4" />,
  financial: <DollarSign className="h-4 w-4" />,
  medication: <Pill className="h-4 w-4" />,
  drug: <Pill className="h-4 w-4" />,
  clinical: <Heart className="h-4 w-4" />,
  diagnosis: <Heart className="h-4 w-4" />,
  consent: <ClipboardCheck className="h-4 w-4" />,
  authorization: <ClipboardCheck className="h-4 w-4" />,
  hipaa: <Shield className="h-4 w-4" />,
  signature: <PenTool className="h-4 w-4" />,
  attestation: <PenTool className="h-4 w-4" />,
  shipping: <Package className="h-4 w-4" />,
  delivery: <Package className="h-4 w-4" />,
  caregiver: <User className="h-4 w-4" />,
  representative: <User className="h-4 w-4" />,
};

const getSectionIcon = (sectionTitle: string) => {
  const titleLower = sectionTitle.toLowerCase();
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (titleLower.includes(key)) return icon;
  }
  return <FileText className="h-4 w-4" />;
};

// ============= STORAGE KEYS =============
const STORAGE_KEY = 'enrollment_form_extraction_state';

export const EnrollmentFormExtractor: React.FC<EnrollmentFormExtractorProps> = ({
  onExtractionComplete,
  onSaveToHistory,
  onPushToExternalSystem,
  className
}) => {
  // State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState<'idle' | 'stage1' | 'stage2' | 'complete'>('idle');
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============= STATE PERSISTENCE =============
  
  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.extractionResult) {
          setExtractionResult(parsed.extractionResult);
          setActiveTab('verification');
          toast.info('Restored previous extraction session');
        }
        if (parsed.filePreviewUrl) {
          setFilePreviewUrl(parsed.filePreviewUrl);
        }
      }
    } catch (e) {
      console.error('Failed to restore state:', e);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (extractionResult) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          extractionResult,
          filePreviewUrl,
          savedAt: new Date().toISOString()
        }));
      } catch (e) {
        console.error('Failed to save state:', e);
      }
    }
  }, [extractionResult, filePreviewUrl]);

  // ============= FILE HANDLING =============

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    
    // Clear previous results
    setExtractionResult(null);
    setExtractionStage('idle');
    setExtractionProgress(0);
    
    toast.success(`Uploaded: ${file.name}`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
    },
    maxFiles: 1,
    disabled: isExtracting
  });

  // ============= EXTRACTION =============

  const startExtraction = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }

    setIsExtracting(true);
    setExtractionStage('stage1');
    setExtractionProgress(10);
    setActiveTab('processing');

    try {
      // Convert file to base64
      const base64 = await fileToBase64(uploadedFile);
      
      // Stage 1 progress
      setExtractionProgress(20);
      
      // Simulate stage 1 progress
      const stage1Interval = setInterval(() => {
        setExtractionProgress(prev => Math.min(prev + 5, 45));
      }, 500);

      // Call extraction API
      const { data, error } = await supabase.functions.invoke('extract-enrollment-form', {
        body: {
          fileBase64: base64,
          fileName: uploadedFile.name,
          fileType: uploadedFile.type.includes('pdf') ? 'pdf' : 'image',
          saveToDatabase: true,
          sessionId: crypto.randomUUID()
        }
      });

      clearInterval(stage1Interval);

      if (error) {
        throw new Error(error.message || 'Extraction failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Extraction failed');
      }

      setExtractionStage('stage2');
      setExtractionProgress(70);

      // Simulate stage 2 completion
      await new Promise(resolve => setTimeout(resolve, 500));
      setExtractionProgress(100);
      setExtractionStage('complete');

      // Set result and expand all sections
      setExtractionResult(data);
      const initialExpanded: Record<string, boolean> = {};
      Object.keys(data.fieldsBySection || {}).forEach(key => {
        initialExpanded[key] = true;
      });
      setExpandedSections(initialExpanded);

      setActiveTab('verification');
      
      toast.success(`Extracted ${data.allFields?.length || 0} fields from ${data.detectedSections?.length || 0} sections`);
      
      onExtractionComplete?.(data);

    } catch (error) {
      console.error('Extraction error:', error);
      toast.error(error instanceof Error ? error.message : 'Extraction failed');
      setExtractionStage('idle');
    } finally {
      setIsExtracting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // ============= FIELD EDITING =============

  const handleEditField = (fieldId: string, currentValue: string) => {
    setEditingField(fieldId);
    setEditValue(currentValue || '');
  };

  const handleSaveField = () => {
    if (!editingField || !extractionResult) return;

    const updatedFields = extractionResult.allFields.map(field => {
      if (field.fieldId === editingField) {
        return { ...field, fieldValue: editValue, verified: true };
      }
      return field;
    });

    const updatedFieldsBySection: Record<string, ExtractedField[]> = {};
    Object.keys(extractionResult.fieldsBySection).forEach(sectionKey => {
      updatedFieldsBySection[sectionKey] = extractionResult.fieldsBySection[sectionKey].map(field => {
        if (field.fieldId === editingField) {
          return { ...field, fieldValue: editValue, verified: true };
        }
        return field;
      });
    });

    setExtractionResult({
      ...extractionResult,
      allFields: updatedFields,
      fieldsBySection: updatedFieldsBySection,
      verificationState: {
        ...extractionResult.verificationState,
        lastUpdated: new Date().toISOString()
      }
    });

    setEditingField(null);
    setEditValue('');
    toast.success('Field updated');
  };

  const handleVerifyField = (fieldId: string) => {
    if (!extractionResult) return;

    const updatedFields = extractionResult.allFields.map(field => {
      if (field.fieldId === fieldId) {
        return { ...field, verified: true };
      }
      return field;
    });

    const updatedFieldsBySection: Record<string, ExtractedField[]> = {};
    Object.keys(extractionResult.fieldsBySection).forEach(sectionKey => {
      updatedFieldsBySection[sectionKey] = extractionResult.fieldsBySection[sectionKey].map(field => {
        if (field.fieldId === fieldId) {
          return { ...field, verified: true };
        }
        return field;
      });
    });

    setExtractionResult({
      ...extractionResult,
      allFields: updatedFields,
      fieldsBySection: updatedFieldsBySection
    });
  };

  const handleVerifySection = (sectionKey: string) => {
    if (!extractionResult) return;

    const updatedFieldsBySection: Record<string, ExtractedField[]> = {};
    Object.keys(extractionResult.fieldsBySection).forEach(key => {
      if (key === sectionKey) {
        updatedFieldsBySection[key] = extractionResult.fieldsBySection[key].map(field => ({
          ...field,
          verified: true
        }));
      } else {
        updatedFieldsBySection[key] = extractionResult.fieldsBySection[key];
      }
    });

    const updatedFields = extractionResult.allFields.map(field => {
      if (field.sectionKey === sectionKey) {
        return { ...field, verified: true };
      }
      return field;
    });

    const sectionsVerified = { ...extractionResult.verificationState.sectionsVerified };
    sectionsVerified[sectionKey] = true;
    const allVerified = Object.keys(updatedFieldsBySection).every(key => sectionsVerified[key]);

    setExtractionResult({
      ...extractionResult,
      allFields: updatedFields,
      fieldsBySection: updatedFieldsBySection,
      verificationState: {
        sectionsVerified,
        allVerified,
        lastUpdated: new Date().toISOString()
      }
    });

    toast.success(`Section "${sectionKey}" verified`);
  };

  // ============= SAVE & PUSH =============

  const handleSaveToHistory = async () => {
    if (!extractionResult) return;

    setIsSaving(true);
    try {
      // Save to Supabase using raw query to avoid type issues with new table
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/enrollment_form_extractions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: extractionResult.extractionId,
          session_id: extractionResult.sessionId,
          file_name: uploadedFile?.name || 'unknown',
          form_identification: extractionResult.formIdentification,
          detected_sections: extractionResult.detectedSections,
          all_fields: extractionResult.allFields,
          fields_by_section: extractionResult.fieldsBySection,
          validation_summary: extractionResult.validationSummary,
          overall_confidence: extractionResult.overallConfidence,
          pipeline_info: extractionResult.pipeline,
          verification_state: extractionResult.verificationState,
          status: 'saved',
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to save');

      onSaveToHistory?.(extractionResult);
      toast.success('Saved to history');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushToExternalSystem = async () => {
    if (!extractionResult || !onPushToExternalSystem) return;

    setIsPushing(true);
    try {
      await onPushToExternalSystem(extractionResult);
      toast.success('Pushed to external system');
    } catch (error) {
      console.error('Push error:', error);
      toast.error('Failed to push');
    } finally {
      setIsPushing(false);
    }
  };

  const handleClearSession = () => {
    setUploadedFile(null);
    setFilePreviewUrl(null);
    setExtractionResult(null);
    setExtractionStage('idle');
    setExtractionProgress(0);
    setActiveTab('upload');
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Session cleared');
  };

  // ============= RENDER HELPERS =============

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getVerificationStats = () => {
    if (!extractionResult) return { verified: 0, total: 0, percentage: 0 };
    const verified = extractionResult.allFields.filter(f => f.verified).length;
    const total = extractionResult.allFields.length;
    return { verified, total, percentage: total > 0 ? Math.round((verified / total) * 100) : 0 };
  };

  const stats = getVerificationStats();

  // ============= RENDER =============

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Dynamic Enrollment Form Extractor
            </CardTitle>
            <CardDescription className="mt-1">
              AI-powered extraction for any patient enrollment form (PAP, Co-pay, Bridge)
            </CardDescription>
          </div>
          {extractionResult && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {stats.verified}/{stats.total} Verified
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleClearSession}>
                <RefreshCw className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="gap-1">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="processing" disabled={!isExtracting && extractionStage === 'idle'} className="gap-1">
              <Scan className="h-4 w-4" />
              Processing
            </TabsTrigger>
            <TabsTrigger value="verification" disabled={!extractionResult} className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Verify
            </TabsTrigger>
            <TabsTrigger value="summary" disabled={!extractionResult} className="gap-1">
              <FileCheck className="h-4 w-4" />
              Summary
            </TabsTrigger>
          </TabsList>

          {/* UPLOAD TAB */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                isExtracting && "opacity-50 pointer-events-none"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">
                {isDragActive ? "Drop the form here" : "Drag & drop enrollment form"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDF, JPEG, PNG, TIFF • Printed or handwritten forms
              </p>
            </div>

            {uploadedFile && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileImage className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>{uploadedFile.name}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[70vh]">
                        {filePreviewUrl && (
                          uploadedFile.type.includes('pdf') ? (
                            <iframe 
                              src={filePreviewUrl} 
                              className="w-full h-[65vh]" 
                              title="PDF Preview"
                            />
                          ) : (
                            <img 
                              src={filePreviewUrl} 
                              alt="Form preview" 
                              className="w-full object-contain"
                            />
                          )
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={startExtraction} disabled={isExtracting}>
                    {isExtracting ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-1" />
                    )}
                    Extract All Fields
                  </Button>
                </div>
              </div>
            )}

            {/* Pipeline Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">STAGE 1: Classification</p>
                <p className="text-sm font-semibold">Gemini 2.5 Flash</p>
                <p className="text-xs text-muted-foreground">Fast section detection</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">STAGE 2: Deep Extraction</p>
                <p className="text-sm font-semibold">Gemini 2.5 Pro</p>
                <p className="text-xs text-muted-foreground">Accurate field extraction + handwriting</p>
              </div>
            </div>
          </TabsContent>

          {/* PROCESSING TAB */}
          <TabsContent value="processing" className="space-y-4 mt-4">
            <div className="space-y-6 py-8">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Extraction Progress</span>
                  <span>{extractionProgress}%</span>
                </div>
                <Progress value={extractionProgress} className="h-2" />
              </div>

              {/* Stage Indicators */}
              <div className="grid grid-cols-3 gap-4">
                <div className={cn(
                  "p-4 rounded-lg border text-center transition-all",
                  extractionStage === 'stage1' ? "border-primary bg-primary/5" : 
                  extractionStage === 'stage2' || extractionStage === 'complete' ? "border-green-500 bg-green-50" : 
                  "border-border"
                )}>
                  {extractionStage === 'stage1' ? (
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  ) : extractionStage === 'stage2' || extractionStage === 'complete' ? (
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                  ) : (
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
                  )}
                  <p className="font-medium mt-2">Stage 1</p>
                  <p className="text-xs text-muted-foreground">Classification</p>
                </div>

                <div className={cn(
                  "p-4 rounded-lg border text-center transition-all",
                  extractionStage === 'stage2' ? "border-primary bg-primary/5" : 
                  extractionStage === 'complete' ? "border-green-500 bg-green-50" : 
                  "border-border"
                )}>
                  {extractionStage === 'stage2' ? (
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  ) : extractionStage === 'complete' ? (
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                  ) : (
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
                  )}
                  <p className="font-medium mt-2">Stage 2</p>
                  <p className="text-xs text-muted-foreground">Deep Extraction</p>
                </div>

                <div className={cn(
                  "p-4 rounded-lg border text-center transition-all",
                  extractionStage === 'complete' ? "border-green-500 bg-green-50" : "border-border"
                )}>
                  {extractionStage === 'complete' ? (
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                  ) : (
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
                  )}
                  <p className="font-medium mt-2">Complete</p>
                  <p className="text-xs text-muted-foreground">Ready for review</p>
                </div>
              </div>

              {extractionResult && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Extracted <strong>{extractionResult.allFields.length}</strong> fields from{' '}
                    <strong>{extractionResult.detectedSections.length}</strong> sections in{' '}
                    <strong>{(extractionResult.processingTimeMs / 1000).toFixed(1)}s</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* VERIFICATION TAB */}
          <TabsContent value="verification" className="space-y-4 mt-4">
            {extractionResult && (
              <>
                {/* Form Identification Header */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {extractionResult.formIdentification.manufacturerName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {extractionResult.formIdentification.programName} • {extractionResult.formIdentification.formTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {extractionResult.hasHandwriting && (
                        <Badge variant="outline" className="gap-1">
                          <PenTool className="h-3 w-3" />
                          Handwritten
                        </Badge>
                      )}
                      <Badge className={getConfidenceColor(extractionResult.overallConfidence)}>
                        {Math.round(extractionResult.overallConfidence * 100)}% Confidence
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Image Preview Button */}
                {filePreviewUrl && (
                  <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <Eye className="h-4 w-4" />
                        View Original Form for Reference
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Original Form - Compare & Verify</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[70vh]">
                        {uploadedFile?.type.includes('pdf') ? (
                          <iframe 
                            src={filePreviewUrl} 
                            className="w-full h-[65vh]" 
                            title="PDF Preview"
                          />
                        ) : (
                          <img 
                            src={filePreviewUrl} 
                            alt="Form preview" 
                            className="w-full object-contain"
                          />
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Sections */}
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {Object.entries(extractionResult.fieldsBySection).map(([sectionKey, fields]) => {
                      const isExpanded = expandedSections[sectionKey] !== false;
                      const sectionVerified = fields.every(f => f.verified);
                      const verifiedCount = fields.filter(f => f.verified).length;

                      return (
                        <div key={sectionKey} className="border rounded-lg overflow-hidden">
                          {/* Section Header */}
                          <div 
                            className={cn(
                              "flex items-center justify-between p-3 cursor-pointer transition-colors",
                              sectionVerified ? "bg-green-50" : "bg-muted/50 hover:bg-muted"
                            )}
                            onClick={() => setExpandedSections(prev => ({ ...prev, [sectionKey]: !isExpanded }))}
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              {getSectionIcon(sectionKey)}
                              <span className="font-medium capitalize">
                                {sectionKey.replace(/_/g, ' ')}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {fields.length} fields
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {verifiedCount}/{fields.length} verified
                              </span>
                              {!sectionVerified && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerifySection(sectionKey);
                                  }}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verify All
                                </Button>
                              )}
                              {sectionVerified && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          </div>

                          {/* Section Fields */}
                          {isExpanded && (
                            <div className="p-3 space-y-2 bg-background">
                              {fields.map(field => (
                                <div 
                                  key={field.fieldId}
                                  className={cn(
                                    "flex items-center justify-between p-2 rounded border",
                                    field.verified ? "bg-green-50/50 border-green-200" : "bg-background"
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Label className="text-sm font-medium truncate">
                                        {field.fieldLabel}
                                      </Label>
                                      {field.required && <Badge variant="destructive" className="text-[10px]">Required</Badge>}
                                      {field.isHandwritten && <Badge variant="outline" className="text-[10px]">Handwritten</Badge>}
                                    </div>
                                    
                                    {editingField === field.fieldId ? (
                                      <div className="flex items-center gap-2 mt-1">
                                        <Input
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="h-7 text-sm"
                                          autoFocus
                                        />
                                        <Button size="sm" variant="ghost" onClick={handleSaveField}>
                                          <Check className="h-3 w-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                        {field.fieldValue !== null && field.fieldValue !== '' 
                                          ? String(field.fieldValue) 
                                          : <span className="italic text-muted-foreground/50">Empty</span>
                                        }
                                      </p>
                                    )}

                                    {field.alternativeReading && (
                                      <p className="text-xs text-amber-600 mt-0.5">
                                        Alt: {field.alternativeReading}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 ml-2">
                                    <Badge className={cn("text-[10px]", getConfidenceColor(field.confidence))}>
                                      {Math.round(field.confidence * 100)}%
                                    </Badge>
                                    {!field.verified && (
                                      <>
                                        <Button 
                                          size="sm" 
                                          variant="ghost"
                                          onClick={() => handleEditField(field.fieldId, String(field.fieldValue || ''))}
                                        >
                                          <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="ghost"
                                          onClick={() => handleVerifyField(field.fieldId)}
                                        >
                                          <Check className="h-3 w-3" />
                                        </Button>
                                      </>
                                    )}
                                    {field.verified && (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>

          {/* SUMMARY TAB */}
          <TabsContent value="summary" className="space-y-4 mt-4">
            {extractionResult && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{extractionResult.allFields.length}</p>
                    <p className="text-sm text-muted-foreground">Total Fields</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
                    <p className="text-sm text-muted-foreground">Verified</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">
                      {extractionResult.validationSummary.handwrittenFieldsCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Handwritten</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-3xl font-bold">
                      {extractionResult.validationSummary.completionPercentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </Card>
                </div>

                {/* Validation Summary */}
                {extractionResult.validationSummary.emptyRequiredFields.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{extractionResult.validationSummary.emptyRequiredFields.length}</strong> required fields are empty:{' '}
                      {extractionResult.validationSummary.emptyRequiredFields.slice(0, 5).join(', ')}
                      {extractionResult.validationSummary.emptyRequiredFields.length > 5 && ' ...'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Pipeline Info */}
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Processing Pipeline</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Stage 1 (Classification)</p>
                      <p className="font-medium">{extractionResult.pipeline.stage1Model}</p>
                      <p className="text-xs text-muted-foreground">{extractionResult.pipeline.stage1TimeMs}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stage 2 (Extraction)</p>
                      <p className="font-medium">{extractionResult.pipeline.stage2Model}</p>
                      <p className="text-xs text-muted-foreground">{extractionResult.pipeline.stage2TimeMs}ms</p>
                    </div>
                  </div>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {/* Export */}}>
                    <Download className="h-4 w-4 mr-1" />
                    Export JSON
                  </Button>
                  <Button variant="outline" onClick={handleSaveToHistory} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                    Save to History
                  </Button>
                  {onPushToExternalSystem && (
                    <Button onClick={handlePushToExternalSystem} disabled={isPushing || stats.percentage < 100}>
                      {isPushing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                      Push to External System
                    </Button>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnrollmentFormExtractor;
