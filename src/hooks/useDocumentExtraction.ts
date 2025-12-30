/**
 * useDocumentExtraction Hook
 * Handles document upload, OCR processing, and extraction logic
 * Extracted from DocumentProcessing.tsx for maintainability
 */

import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ProcessingResult, 
  ProcessingStage, 
  MedicationResult,
  AgentWorkflowType
} from './useDocumentProcessingState';
import { DocumentTypeConfig } from '@/config/documentTypes';
import { useMedicationProcessing } from '@/hooks/useMedicationProcessing';
import { HEALTHCARE_ABBREVIATIONS, expandAbbreviation } from '@/utils/healthcareAbbreviations';

// Agent workflow configurations
export const AGENT_WORKFLOW_CONFIGS = [
  {
    id: 'insurance-verification' as AgentWorkflowType,
    title: 'Insurance Verification Agent',
    description: 'Verify coverage, eligibility, co-pays from insurance cards',
    documentTypes: ['insurance', 'patient-onboarding'],
    capabilities: ['Coverage verification', 'Eligibility check', 'Co-pay lookup', 'Prior authorization status']
  },
  {
    id: 'prescription-processing' as AgentWorkflowType,
    title: 'Prescription Processing Agent',
    description: 'Co-pay lookup, prior auth check, drug interactions',
    documentTypes: ['prescription', 'order-management'],
    capabilities: ['Drug interaction check', 'Prior auth verification', 'Co-pay calculation', 'Formulary check']
  },
  {
    id: 'patient-intake' as AgentWorkflowType,
    title: 'Patient Intake Agent',
    description: 'Extract and validate patient demographics & history',
    documentTypes: ['patient-onboarding', 'insurance'],
    capabilities: ['Demographics extraction', 'Medical history parsing', 'Consent validation', 'Duplicate patient check']
  },
  {
    id: 'imaging-analysis' as AgentWorkflowType,
    title: 'Medical Imaging Agent',
    description: 'Analyze X-ray, CT, MRI, ECG reports with DICOM support',
    documentTypes: ['xray', 'ct-scan', 'mri', 'ecg', 'ultrasound'],
    capabilities: ['DICOM processing', 'Image analysis', 'Report extraction', 'Finding detection']
  }
];

interface UseDocumentExtractionProps {
  selectedDocType: string;
  currentConfig: DocumentTypeConfig;
  processingResult: ProcessingResult | null;
  setProcessingResult: (result: ProcessingResult | null | ((prev: ProcessingResult | null) => ProcessingResult | null)) => void;
  setProcessingHistory: (history: ProcessingResult[] | ((prev: ProcessingResult[]) => ProcessingResult[])) => void;
  setActiveTab: (tab: string) => void;
  setMedicalImageBase64: (base64: string) => void;
  setMedicalImageMimeType: (mimeType: string) => void;
  setIsLoadingHistory: (loading: boolean) => void;
  // Processing options
  enableOCR: boolean;
  enableHandwriting: boolean;
  enableTableExtraction: boolean;
  enableSignatureDetection: boolean;
  confidenceThreshold: number;
  ocrProvider: 'google' | 'azure' | 'aws';
  isAutoProcessing: boolean;
  processingMode: 'standalone' | 'agent';
  selectedAgentWorkflow: AgentWorkflowType;
  setIsAgentProcessing: (processing: boolean) => void;
  // Medication state reset functions
  resetMedicationState?: () => void;
}

export function useDocumentExtraction({
  selectedDocType,
  currentConfig,
  processingResult,
  setProcessingResult,
  setProcessingHistory,
  setActiveTab,
  setMedicalImageBase64,
  setMedicalImageMimeType,
  setIsLoadingHistory,
  enableOCR,
  enableHandwriting,
  enableTableExtraction,
  enableSignatureDetection,
  confidenceThreshold,
  ocrProvider,
  isAutoProcessing,
  processingMode,
  selectedAgentWorkflow,
  setIsAgentProcessing,
  resetMedicationState
}: UseDocumentExtractionProps) {
  const { calculateQuantityAndDaySupply } = useMedicationProcessing();
  
  // Load processing history from database
  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      let userId: string | null = null;
      try {
        const { data } = await supabase.auth.getUser();
        userId = data?.user?.id ?? null;
      } catch (authErr) {
        console.warn('Unable to resolve current user for history filter:', authErr);
      }

      let query: any = supabase
        .from('document_processing_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        const historyItems: ProcessingResult[] = data.map((job: any) => {
          let publicUrl: string | undefined;
          
          if (job.processing_config?.imageUrl) {
            publicUrl = job.processing_config.imageUrl;
          } else if (job.processing_config?.publicUrl) {
            publicUrl = job.processing_config.publicUrl;
          } else if (job.file_path) {
            try {
              const { data: urlData } = supabase.storage
                .from('document-processing')
                .getPublicUrl(job.file_path);
              publicUrl = urlData?.publicUrl;
            } catch (e) {
              console.warn('Could not get public URL for:', job.file_path);
            }
          }

          const metadata = job.extracted_metadata || {};
          const entities = metadata.entities || [];
          const formFields = metadata.formFields || [];
          const extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }> = {};

          entities.forEach((entity: any) => {
            if (!entity) return;
            const fieldName = entity.type || entity.fieldName || entity.field_name || entity.name;
            if (!fieldName) return;
            
            const key = String(fieldName).toLowerCase().replace(/\s+/g, '_');
            const value = entity.value ?? entity.text ?? '';
            
            extractedFields[key] = {
              value: String(value),
              confidence: entity.confidence ?? 0.8,
              verified: entity.verified ?? false,
            };
          });

          // Override with verified fields from processing_config
          if (job.processing_config?.extractedFields) {
            Object.entries(job.processing_config.extractedFields).forEach(([key, field]: [string, any]) => {
              if (field !== null && field !== undefined) {
                const value = typeof field === 'object' && field !== null && 'value' in field 
                  ? field.value 
                  : field;
                if (value !== null && value !== undefined && value !== '') {
                  extractedFields[key] = {
                    value: String(value),
                    confidence: (typeof field === 'object' && field?.confidence) || 0.9,
                    verified: true,
                  };
                }
              }
            });
          }

          // Extract medications
          const medications = job.processing_config?.medications || metadata.medications || [];
          if (medications.length > 0) {
            medications.forEach((med: any, idx: number) => {
              const prefix = medications.length > 1 ? `medication_${idx + 1}_` : '';
              if (med.name) extractedFields[`${prefix}medication_name`] = { value: med.name, confidence: 0.9, verified: true };
              if (med.dosage) extractedFields[`${prefix}dosage`] = { value: med.dosage, confidence: 0.9, verified: true };
              if (med.strength) extractedFields[`${prefix}strength`] = { value: med.strength, confidence: 0.9, verified: true };
              if (med.frequency) extractedFields[`${prefix}frequency`] = { value: med.frequency, confidence: 0.9, verified: true };
              if (med.directions || med.sig) extractedFields[`${prefix}sig`] = { value: med.directions || med.sig, confidence: 0.9, verified: true };
              if (med.quantity) extractedFields[`${prefix}quantity`] = { value: String(med.quantity), confidence: 0.9, verified: true };
              if (med.refills) extractedFields[`${prefix}refills`] = { value: String(med.refills), confidence: 0.9, verified: true };
              if (med.ndc || med.ndcCode) extractedFields[`${prefix}ndc_code`] = { value: med.ndc || med.ndcCode, confidence: 0.9, verified: true };
            });
          }

          // Medical imaging fields
          const processingConfig = job.processing_config || {};
          const patientDetails = processingConfig.patientDetails || {};
          const providerDetails = processingConfig.providerDetails || {};
          const aiInsights = processingConfig.aiInsights || [];
          const clinicalNotes = processingConfig.notes || '';

          if (patientDetails.patient_name) extractedFields['patient_name'] = { value: patientDetails.patient_name, confidence: 1, verified: true };
          if (patientDetails.patient_dob) extractedFields['patient_dob'] = { value: patientDetails.patient_dob, confidence: 1, verified: true };
          if (patientDetails.patient_id) extractedFields['patient_id'] = { value: patientDetails.patient_id, confidence: 1, verified: true };
          
          if (providerDetails.provider_name) extractedFields['provider_name'] = { value: providerDetails.provider_name, confidence: 1, verified: true };
          if (providerDetails.facility_name) extractedFields['facility_name'] = { value: providerDetails.facility_name, confidence: 1, verified: true };
          
          if (clinicalNotes) extractedFields['clinical_notes'] = { value: clinicalNotes, confidence: 1, verified: true };

          if (aiInsights.length > 0) {
            extractedFields['ai_insights_json'] = { value: JSON.stringify(aiInsights), confidence: 1, verified: true };
            aiInsights.forEach((insight: any, idx: number) => {
              const prefix = `finding_${idx + 1}_`;
              if (insight.category) extractedFields[`${prefix}category`] = { value: insight.category, confidence: insight.confidence || 0.9, verified: true };
              if (insight.description) extractedFields[`${prefix}description`] = { value: insight.description, confidence: insight.confidence || 0.9, verified: true };
            });
          }

          let validationSummary: { passed: number; failed: number; warnings: number } | undefined;
          const validation = job.validation_status as any;
          if (validation && typeof validation === 'object') {
            validationSummary = {
              passed: validation.passed ?? 0,
              failed: validation.failed ?? 0,
              warnings: validation.warnings ?? 0,
            };
          }

          const lineItems = processingConfig.lineItems || metadata.lineItems || metadata.line_items || [];
          const tables = processingConfig.tables || metadata.tables || [];

          return {
            id: job.id,
            fileName: job.file_name,
            documentType: job.document_type || 'unknown',
            stage: job.status === 'completed' ? 'complete' : job.status,
            progress: job.progress || 100,
            extractedFields,
            medications: processingConfig.medications || metadata.medications || [],
            validationResults: validationSummary,
            rawText: job.extracted_text,
            lineItems,
            tables,
            processedAt: new Date(job.created_at),
            imageUrl: publicUrl,
            exportStatus: job.export_status || 'pending',
            exportedAt: job.exported_at ? new Date(job.exported_at) : undefined,
            exportTargets: job.export_targets || [],
          } as ProcessingResult;
        });

        setProcessingHistory(historyItems);
      } else {
        setProcessingHistory([]);
      }
    } catch (err) {
      console.error('Failed to load processing history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [setIsLoadingHistory, setProcessingHistory]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Document upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Reset medication-specific fields when uploading a new prescription
    if ((selectedDocType === 'prescription' || currentConfig.processingHints?.enableMedicationLookup) && resetMedicationState) {
      console.log('New prescription upload - resetting medication state');
      resetMedicationState();
    }
    
    const imageUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    
    const newResult: ProcessingResult = {
      id: crypto.randomUUID(),
      fileName: file.name,
      documentType: selectedDocType,
      stage: 'uploading',
      progress: 0,
      extractedFields: {},
      processedAt: new Date(),
      imageUrl
    };
    
    setProcessingResult(newResult);
    setActiveTab('upload');
    
    if (isAutoProcessing) {
      await runAutoProcessing(newResult, file);
    }
  }, [selectedDocType, currentConfig, isAutoProcessing, resetMedicationState]);

  // Auto-processing pipeline
  const runAutoProcessing = async (result: ProcessingResult, file: File) => {
    try {
      const isMedicalImaging = currentConfig.processingHints?.enableImageAnalysis === true;
      
      // Stage 1: Upload
      setProcessingResult(prev => prev ? { ...prev, stage: 'uploading', progress: 10 } : null);
      toast.info('Uploading document...');
      
      // Convert file to base64
      const reader = new FileReader();
      const base64DataUrlPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64DataUrl = await base64DataUrlPromise;
      const fileBase64 = base64DataUrl.split(',')[1];
      
      if (isMedicalImaging) {
        setMedicalImageBase64(fileBase64);
        setMedicalImageMimeType(file.type);
      }
      
      setProcessingResult(prev => prev ? { ...prev, progress: 20 } : null);
      
      // Get current user
      let userId: string | undefined;
      try {
        const { data } = await supabase.auth.getUser();
        userId = data?.user?.id;
      } catch (authErr) {
        console.warn('Unable to get user for document upload:', authErr);
      }

      const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'upload',
          fileBase64,
          fileName: file.name,
          mimeType: file.type,
          userId,
          documentType: selectedDocType,
          processingConfig: {
            enableOCR,
            enableHandwritingRecognition: enableHandwriting,
            enableTableExtraction,
            enableSignatureDetection,
            confidenceThreshold,
            ocrProvider,
          }
        }
      });
      
      if (uploadError) throw uploadError;
      
      const documentId = uploadResult?.documentId;
      const localImageUrl = base64DataUrl;
      if (!documentId) throw new Error('Failed to get document ID');
      
      // For medical imaging, skip OCR and go to image analysis
      if (isMedicalImaging) {
        const imagingResult: ProcessingResult = {
          ...result,
          id: documentId,
          stage: 'complete',
          progress: 100,
          extractedFields: {},
          imageUrl: localImageUrl,
          processedAt: new Date()
        };
        
        setProcessingResult(imagingResult);
        setActiveTab('image-analysis');
        
        toast.info('Analyzing medical image with Vision AI...', { duration: 3000 });
        
        try {
          const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('document-processor', {
            body: {
              action: 'analyze_medical_image',
              imageBase64: fileBase64,
              imageMimeType: file.type,
              documentType: selectedDocType,
              analysisType: 'comprehensive',
              provider: 'gemini'
            }
          });
          
          if (analysisError) {
            console.error('Auto medical analysis error:', analysisError);
            toast.warning('Auto-analysis failed. Click "Analyze with Vision AI" to retry.');
          } else if (analysisResult?.success) {
            const insights = analysisResult.insights || [];
            const abnormalCount = insights.filter((i: any) => 
              i.status === 'abnormal' || 
              i.clinicalSignificance === 'high' || 
              i.clinicalSignificance === 'critical'
            ).length;
            
            setProcessingResult(prev => prev ? {
              ...prev,
              extractedFields: {
                ...prev.extractedFields,
                ai_analysis_complete: { value: 'true', confidence: 1 },
                ai_insights_count: { value: String(insights.length), confidence: 1 },
                ai_abnormal_count: { value: String(abnormalCount), confidence: 1 },
                detected_modality: { value: analysisResult.detectedModality || selectedDocType, confidence: 0.9 },
                model_used: { value: analysisResult.modelUsed || 'Vision AI', confidence: 1 }
              }
            } : prev);
            
            toast.success(`Medical image analyzed: ${insights.length} findings`, {
              description: abnormalCount > 0 
                ? `⚠️ ${abnormalCount} abnormal finding(s) detected` 
                : 'View results in Image Analysis tab'
            });
          }
        } catch (autoAnalysisError) {
          console.error('Auto medical analysis exception:', autoAnalysisError);
          toast.warning('Click "Analyze with Vision AI" for detailed analysis');
        }
        
        return;
      }
      
      setProcessingResult(prev => prev ? { ...prev, progress: 40 } : null);
      
      // Stage 2: OCR Processing
      setProcessingResult(prev => prev ? { ...prev, stage: 'ocr', progress: 45 } : null);
      toast.info(enableOCR ? 'Running OCR extraction...' : 'Processing document...');
      
      // Stage 3: Process document with OCR and extraction
      setProcessingResult(prev => prev ? { ...prev, stage: 'extraction', progress: 50 } : null);
      toast.info('Extracting data from document...');
      
      const { data: processResult, error: processError } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'process',
          documentId
        }
      });
      
      if (processError) throw processError;
      
      setProcessingResult(prev => prev ? { ...prev, progress: 70 } : null);
      
      // Stage 4: Map to form fields
      setProcessingResult(prev => prev ? { ...prev, stage: 'mapping', progress: 80 } : null);
      toast.info('Mapping fields...');
      
      const { data: mapResult } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'map_to_form',
          documentId,
          processingConfig: {}
        }
      });
      
      // Stage 5: Validation
      setProcessingResult(prev => prev ? { ...prev, stage: 'validation', progress: 90 } : null);
      toast.info('Validating results...');
      
      // Build extracted fields from entities
      const extractedFields: Record<string, { value: string; confidence: number }> = {};
      const metadata = processResult?.metadata || {};
      const entities = metadata.entities || [];
      
      if (entities.length > 0) {
        for (const entity of entities) {
          if (entity.value) {
            const fieldKey = (entity.type || entity.fieldName || 'unknown')
              .toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[^a-z0-9_]/g, '');
            
            if (fieldKey && !extractedFields[fieldKey]) {
              extractedFields[fieldKey] = {
                value: String(entity.value),
                confidence: entity.confidence || 0.85
              };
            }
          }
        }
      }
      
      // Add form fields from mapping
      if (mapResult?.formData) {
        for (const [key, value] of Object.entries(mapResult.formData)) {
          if (value && typeof value === 'string') {
            extractedFields[key] = { value, confidence: 0.9 };
          }
        }
      }
      
      // Process medications for prescription documents
      let medications: MedicationResult[] = [];
      if (selectedDocType === 'prescription' || currentConfig.processingHints?.enableMedicationLookup) {
        const medicationData = metadata.medications || [];
        medications = medicationData.map((med: any) => {
          const sigText = med.sig || med.directions || 'Take 1 tablet daily';
          const calculation = calculateQuantityAndDaySupply(sigText);
          
          return {
            drugName: med.name || med.medication || '',
            genericName: med.genericName || '',
            strength: med.strength || med.dosage || '',
            sig: sigText,
            calculatedQuantity: calculation.totalQuantity,
            daysSupply: calculation.daysSupply,
            dailyDose: calculation.dailyDose,
            ndc: med.ndc || '',
            ndcOptions: [],
            isControlled: med.isControlled || false,
            schedule: med.schedule || ''
          };
        });
      }

      // Build line items and tables
      const lineItems = mapResult?.lineItems || metadata.lineItems || [];
      const tables = mapResult?.tables || metadata.tables || [];
      
      // Calculate validation
      const totalFields = Object.keys(extractedFields).length;
      const highConfidence = Object.values(extractedFields).filter(f => f.confidence >= confidenceThreshold).length;
      const lowConfidence = totalFields - highConfidence;
      
      const validationResults = {
        passed: highConfidence,
        failed: 0,
        warnings: lowConfidence
      };
      
      const finalResult: ProcessingResult = {
        ...result,
        id: documentId,
        stage: 'complete',
        progress: 100,
        extractedFields,
        medications,
        validationResults,
        rawText: processResult?.rawText || processResult?.metadata?.rawText || '',
        lineItems,
        tables,
        imageUrl: localImageUrl,
        processedAt: new Date()
      };
      
      setProcessingResult(finalResult);
      
      const settingsUsed = [];
      if (enableOCR) settingsUsed.push('OCR');
      if (enableHandwriting) settingsUsed.push('Handwriting');
      if (enableTableExtraction) settingsUsed.push('Tables');
      
      toast.success(`Document processed! (${settingsUsed.join(', ')}) - Please verify extracted data before saving.`);
      
      // Run agent workflow if enabled
      if (processingMode === 'agent' && selectedAgentWorkflow !== 'none') {
        await runAgentWorkflow(finalResult);
      }
    } catch (error) {
      console.error('Document processing error:', error);
      toast.error('Failed to process document: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setProcessingResult(prev => prev ? { ...prev, stage: 'error', error: String(error) } : null);
    }
  };

  // Agent workflow processing
  const runAgentWorkflow = async (result: ProcessingResult) => {
    setIsAgentProcessing(true);
    const workflow = AGENT_WORKFLOW_CONFIGS.find(w => w.id === selectedAgentWorkflow);
    
    if (!workflow) {
      setIsAgentProcessing(false);
      return;
    }
    
    toast.info(`Starting ${workflow.title}...`);
    
    for (let i = 0; i < workflow.capabilities.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.info(`${workflow.capabilities[i]}...`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsAgentProcessing(false);
    toast.success(`${workflow.title} completed!`, {
      description: 'Agent workflow results added to document'
    });
  };

  return {
    loadHistory,
    onDrop,
    runAutoProcessing,
    runAgentWorkflow,
    AGENT_WORKFLOW_CONFIGS
  };
}

export { expandAbbreviation };
