/**
 * useDocumentProcessingState Hook
 * Centralized state management for Document Processing page
 * Extracted from DocumentProcessing.tsx for maintainability
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  DOCUMENT_TYPE_CONFIGS as BASE_DOCUMENT_TYPE_CONFIGS,
  DocumentTypeConfig,
  getDocumentTypeById,
  getAllSessionStoragePrefixes
} from '@/config/documentTypes';

// Processing stages
export type ProcessingStage = 'idle' | 'uploading' | 'ocr' | 'extraction' | 'mapping' | 'validation' | 'complete' | 'error';

// Agent workflow types for document processing
export type AgentWorkflowType = 'none' | 'insurance-verification' | 'prescription-processing' | 'patient-intake' | 'imaging-analysis';

export interface MedicationResult {
  drugName: string;
  genericName?: string;
  correctedName?: string;
  wasCorrected?: boolean;
  strength: string;
  sig: string;
  calculatedQuantity: number;
  daysSupply: number;
  dailyDose: number;
  ndc?: string;
  ndcOptions: { code: string; name: string; manufacturer: string }[];
  alternatives?: { name: string; ndc: string; inStock: boolean; stockQty: number }[];
  clinicalRecommendations?: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[];
  isControlled?: boolean;
  schedule?: string;
}

export interface ProcessingResult {
  id: string;
  fileName: string;
  documentType: string;
  stage: ProcessingStage;
  progress: number;
  extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }>;
  medications?: MedicationResult[];
  validationResults?: { passed: number; failed: number; warnings: number };
  rawText?: string;
  tables?: any[];
  lineItems?: any[];
  error?: string;
  processedAt: Date;
  imageUrl?: string;
  exportStatus?: 'pending' | 'exported' | 'partial';
  exportedAt?: Date;
  exportTargets?: string[];
}

export interface AgentWorkflowConfig {
  id: AgentWorkflowType;
  title: string;
  description: string;
  icon: React.ReactNode;
  documentTypes: string[];
  capabilities: string[];
}

export function useDocumentProcessingState() {
  // ============= DOCUMENT TYPE STATE =============
  const [selectedDocType, setSelectedDocType] = useState<string>(() => {
    const saved = sessionStorage.getItem('docProcessing_selectedDocType');
    return saved || 'prescription';
  });
  
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = sessionStorage.getItem('docProcessing_activeTab');
    return saved || 'upload';
  });
  
  const [customDocTypes, setCustomDocTypes] = useState<DocumentTypeConfig[]>([]);
  
  // Combined document type configs
  const DOCUMENT_TYPE_CONFIGS = [...BASE_DOCUMENT_TYPE_CONFIGS, ...customDocTypes];
  
  // Helper to get doc type by id from combined list
  const getDocTypeById = (id: string) => DOCUMENT_TYPE_CONFIGS.find(c => c.id === id);
  
  // Get current document config
  const currentConfig = getDocTypeById(selectedDocType) || getDocumentTypeById(selectedDocType) || DOCUMENT_TYPE_CONFIGS[0];

  // ============= PROCESSING RESULT STATE =============
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_currentResult');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.processedAt) parsed.processedAt = new Date(parsed.processedAt);
        if (parsed.exportedAt) parsed.exportedAt = new Date(parsed.exportedAt);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to restore processing result from sessionStorage:', e);
    }
    return null;
  });
  
  const [pendingResult, setPendingResult] = useState<ProcessingResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_pendingResult');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.processedAt) parsed.processedAt = new Date(parsed.processedAt);
        if (parsed.exportedAt) parsed.exportedAt = new Date(parsed.exportedAt);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to restore pending result from sessionStorage:', e);
    }
    return null;
  });
  
  const [processingHistory, setProcessingHistory] = useState<ProcessingResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  // ============= PROCESSING OPTIONS =============
  const [isAutoProcessing, setIsAutoProcessing] = useState(true);
  const [enableOCR, setEnableOCR] = useState(true);
  const [enableHandwriting, setEnableHandwriting] = useState(true);
  const [enableTableExtraction, setEnableTableExtraction] = useState(true);
  const [enableSignatureDetection, setEnableSignatureDetection] = useState(true);
  const [enableAutoCalculateQty, setEnableAutoCalculateQty] = useState(true);
  const [enableNdcMatching, setEnableNdcMatching] = useState(true);
  const [enableClinicalRecommendations, setEnableClinicalRecommendations] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [ocrProvider, setOcrProvider] = useState<'google' | 'azure' | 'aws'>('google');

  // ============= AGENT MODE STATE =============
  const [processingMode, setProcessingMode] = useState<'standalone' | 'agent'>('standalone');
  const [selectedAgentWorkflow, setSelectedAgentWorkflow] = useState<AgentWorkflowType>('none');
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  const [hasShownAutoRecommendation, setHasShownAutoRecommendation] = useState(false);

  // ============= DIALOG STATE =============
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showSubAgentDialog, setShowSubAgentDialog] = useState(false);
  const [showCustomTypeDialog, setShowCustomTypeDialog] = useState(false);
  
  // ============= MEDICAL IMAGING STATE =============
  const [medicalImageBase64, setMedicalImageBase64] = useState<string>(() => 
    sessionStorage.getItem('docProcessing_medicalImageBase64') || ''
  );
  const [medicalImageMimeType, setMedicalImageMimeType] = useState<string>(() => 
    sessionStorage.getItem('docProcessing_medicalImageMimeType') || ''
  );
  
  // ============= STATE RESTORATION =============
  const [stateRestorationPending, setStateRestorationPending] = useState<string | null>(() => {
    return sessionStorage.getItem('docProcessing_fullState');
  });

  // Track previous document type
  const prevDocTypeRef = useRef<string>(selectedDocType);

  // ============= SESSION STORAGE PERSISTENCE =============
  
  // Persist selectedDocType
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedDocType', selectedDocType);
  }, [selectedDocType]);
  
  // Persist activeTab
  useEffect(() => {
    sessionStorage.setItem('docProcessing_activeTab', activeTab);
  }, [activeTab]);
  
  // Persist processingResult
  useEffect(() => {
    if (processingResult) {
      try {
        sessionStorage.setItem('docProcessing_currentResult', JSON.stringify(processingResult));
      } catch (e) {
        console.warn('Failed to save processing result to sessionStorage:', e);
      }
    } else {
      sessionStorage.removeItem('docProcessing_currentResult');
    }
  }, [processingResult]);
  
  // Persist pendingResult
  useEffect(() => {
    if (pendingResult) {
      try {
        sessionStorage.setItem('docProcessing_pendingResult', JSON.stringify(pendingResult));
      } catch (e) {
        console.warn('Failed to save pending result to sessionStorage:', e);
      }
    } else {
      sessionStorage.removeItem('docProcessing_pendingResult');
    }
  }, [pendingResult]);
  
  // Persist medical imaging
  useEffect(() => {
    if (medicalImageBase64) {
      try {
        sessionStorage.setItem('docProcessing_medicalImageBase64', medicalImageBase64);
      } catch (e) {
        console.warn('Failed to save medical image to sessionStorage (may be too large):', e);
      }
    } else {
      sessionStorage.removeItem('docProcessing_medicalImageBase64');
    }
  }, [medicalImageBase64]);
  
  useEffect(() => {
    if (medicalImageMimeType) sessionStorage.setItem('docProcessing_medicalImageMimeType', medicalImageMimeType);
    else sessionStorage.removeItem('docProcessing_medicalImageMimeType');
  }, [medicalImageMimeType]);

  // Reset auto-recommendation flag when document type changes
  useEffect(() => {
    setHasShownAutoRecommendation(false);
  }, [selectedDocType]);

  // Clear state when document type changes
  const clearDocumentTypeState = useCallback(() => {
    setProcessingResult(null);
    setPendingResult(null);
    setMedicalImageBase64('');
    setMedicalImageMimeType('');
    
    // Clear sessionStorage keys
    const allPrefixes = getAllSessionStoragePrefixes();
    const preserveKeys = ['docProcessing_selectedDocType', 'docProcessing_activeTab'];
    
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && allPrefixes.some(prefix => key.startsWith(prefix)) && !preserveKeys.includes(key)) {
        sessionStorage.removeItem(key);
      }
    }
  }, []);

  return {
    // Document Type
    selectedDocType,
    setSelectedDocType,
    customDocTypes,
    setCustomDocTypes,
    currentConfig,
    getDocTypeById,
    DOCUMENT_TYPE_CONFIGS,
    
    // Tab Navigation
    activeTab,
    setActiveTab,
    
    // Processing Result
    processingResult,
    setProcessingResult,
    pendingResult,
    setPendingResult,
    processingHistory,
    setProcessingHistory,
    isLoadingHistory,
    setIsLoadingHistory,
    restoredFromStorage,
    setRestoredFromStorage,
    
    // Processing Options
    isAutoProcessing,
    setIsAutoProcessing,
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
    setOcrProvider,
    
    // Agent Mode
    processingMode,
    setProcessingMode,
    selectedAgentWorkflow,
    setSelectedAgentWorkflow,
    isAgentProcessing,
    setIsAgentProcessing,
    hasShownAutoRecommendation,
    setHasShownAutoRecommendation,
    
    // Dialogs
    showSettingsDialog,
    setShowSettingsDialog,
    showVerificationDialog,
    setShowVerificationDialog,
    showSubAgentDialog,
    setShowSubAgentDialog,
    showCustomTypeDialog,
    setShowCustomTypeDialog,
    
    // Medical Imaging
    medicalImageBase64,
    setMedicalImageBase64,
    medicalImageMimeType,
    setMedicalImageMimeType,
    
    // State Restoration
    stateRestorationPending,
    setStateRestorationPending,
    prevDocTypeRef,
    clearDocumentTypeState,
  };
}
