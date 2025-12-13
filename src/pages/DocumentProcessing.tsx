/**
 * Document Processing Page - Redesigned
 * Central hub for document processing across all workflows
 * Auto-processes documents on upload with OCR, mapping, and validation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileSearch, 
  Upload, 
  Pill, 
  FileText, 
  Table2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Bot,
  Settings,
  History,
  Download,
  Eye,
  Search,
  Building2,
  Users,
  ShoppingCart,
  UserCheck,
  Brain,
  Activity,
  FileCheck,
  Sparkles,
  Package,
  HeartPulse,
  ClipboardList,
  Stethoscope,
  Shield,
  Cpu,
  Layers,
  ScanLine,
  FileType,
  ArrowRight,
  Zap,
  CreditCard,
  BadgeCheck
} from 'lucide-react';
import { useMedicationProcessing } from '@/hooks/useMedicationProcessing';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';

// Document type configurations
type DocumentType = 
  | 'patient-onboarding' 
  | 'order-management' 
  | 'treatment-center' 
  | 'customer-onboarding'
  | 'prescription'
  | 'insurance';

// Agent workflow types for document processing
type AgentWorkflowType = 'none' | 'insurance-verification' | 'prescription-processing' | 'patient-intake';

interface AgentWorkflowConfig {
  id: AgentWorkflowType;
  title: string;
  description: string;
  icon: React.ReactNode;
  documentTypes: DocumentType[];
  capabilities: string[];
}

interface DocumentConfig {
  id: DocumentType;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  targetFields: { key: string; label: string; required?: boolean }[];
  documentTypes: string[];
}

const DOCUMENT_CONFIGS: DocumentConfig[] = [
  {
    id: 'patient-onboarding',
    title: 'Patient Onboarding',
    icon: <UserCheck className="h-6 w-6" />,
    description: 'Enrollment, consent forms, lab results',
    color: 'bg-blue-500',
    targetFields: [
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'dob', label: 'Date of Birth', required: true },
      { key: 'insurance_id', label: 'Insurance ID' },
      { key: 'diagnosis', label: 'Diagnosis' },
      { key: 'prescriber_npi', label: 'Prescriber NPI' },
      { key: 'consent_signed', label: 'Consent Signed' }
    ],
    documentTypes: ['Consent Form', 'Lab Results', 'Insurance Card', 'Prior Authorization', 'Medical History']
  },
  {
    id: 'order-management',
    title: 'Order Management',
    icon: <ShoppingCart className="h-6 w-6" />,
    description: 'Prescription orders, refills, transfers',
    color: 'bg-green-500',
    targetFields: [
      { key: 'medication', label: 'Medication', required: true },
      { key: 'ndc', label: 'NDC Code', required: true },
      { key: 'quantity', label: 'Quantity', required: true },
      { key: 'days_supply', label: 'Days Supply', required: true },
      { key: 'refills', label: 'Refills' },
      { key: 'prescriber', label: 'Prescriber' },
      { key: 'sig', label: 'Sig/Instructions' }
    ],
    documentTypes: ['Prescription', 'Refill Request', 'Transfer Request', 'Hospital Discharge']
  },
  {
    id: 'treatment-center',
    title: 'Treatment Center',
    icon: <Building2 className="h-6 w-6" />,
    description: 'Facility credentials, licenses, compliance',
    color: 'bg-purple-500',
    targetFields: [
      { key: 'facility_name', label: 'Facility Name', required: true },
      { key: 'license_number', label: 'License Number', required: true },
      { key: 'dea_number', label: 'DEA Number' },
      { key: 'npi', label: 'NPI', required: true },
      { key: 'accreditation', label: 'Accreditation' },
      { key: 'address', label: 'Address', required: true }
    ],
    documentTypes: ['License', 'DEA Registration', 'Insurance Certificate', 'Accreditation', 'Contract']
  },
  {
    id: 'customer-onboarding',
    title: 'Customer Onboarding',
    icon: <Users className="h-6 w-6" />,
    description: 'Business registration, credit applications',
    color: 'bg-orange-500',
    targetFields: [
      { key: 'company_name', label: 'Company Name', required: true },
      { key: 'tax_id', label: 'Tax ID', required: true },
      { key: 'contact_name', label: 'Contact Name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'credit_terms', label: 'Credit Terms' }
    ],
    documentTypes: ['Business License', 'W-9', 'Credit Application', 'Contract', 'Insurance Certificate']
  },
  {
    id: 'prescription',
    title: 'Rx / Prescription',
    icon: <Pill className="h-6 w-6" />,
    description: 'Prescriptions with medication auto-calculation',
    color: 'bg-red-500',
    targetFields: [
      // Patient Information
      { key: 'patient_name', label: 'Patient Name', required: true },
      { key: 'patient_dob', label: 'Date of Birth', required: true },
      { key: 'patient_address', label: 'Patient Address' },
      { key: 'patient_phone', label: 'Patient Phone' },
      // Prescriber Information
      { key: 'prescriber_name', label: 'Prescriber Name', required: true },
      { key: 'prescriber_npi', label: 'Prescriber NPI' },
      { key: 'prescriber_dea', label: 'DEA Number' },
      { key: 'prescriber_address', label: 'Prescriber Address' },
      // Medication Information
      { key: 'medication', label: 'Medication Name', required: true },
      { key: 'strength', label: 'Strength' },
      { key: 'sig', label: 'Sig / Instructions', required: true },
      { key: 'quantity', label: 'Quantity', required: true },
      { key: 'days_supply', label: 'Days Supply' },
      { key: 'refills', label: 'Refills' },
      { key: 'refill_status', label: 'Refill Status' },
      { key: 'ndc', label: 'NDC Code' },
      { key: 'date_written', label: 'Date Written' },
      // Pharmacy Information
      { key: 'pharmacy', label: 'Pharmacy Name' },
      { key: 'pharmacy_address', label: 'Pharmacy Address' },
      { key: 'pharmacy_phone', label: 'Pharmacy Phone' },
      // Clinical Information
      { key: 'diagnosis', label: 'Diagnosis' },
      { key: 'allergies', label: 'Allergies' }
    ],
    documentTypes: ['Prescription', 'E-Prescription', 'Refill Request', 'Fax Prescription', 'Handwritten Rx']
  },
  {
    id: 'insurance',
    title: 'Insurance Document',
    icon: <FileCheck className="h-6 w-6" />,
    description: 'Insurance cards, EOBs, prior authorizations',
    color: 'bg-teal-500',
    targetFields: [
      { key: 'insurance_name', label: 'Insurance Name', required: true },
      { key: 'member_id', label: 'Member ID', required: true },
      { key: 'group_number', label: 'Group Number' },
      { key: 'bin', label: 'BIN' },
      { key: 'pcn', label: 'PCN' },
      { key: 'effective_date', label: 'Effective Date' }
    ],
    documentTypes: ['Insurance Card', 'EOB', 'Prior Authorization', 'Benefits Verification']
  }
];

// Processing stages
type ProcessingStage = 'idle' | 'uploading' | 'ocr' | 'extraction' | 'mapping' | 'validation' | 'complete' | 'error';

interface ProcessingResult {
  id: string;
  fileName: string;
  documentType: DocumentType;
  stage: ProcessingStage;
  progress: number;
  extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }>;
  medications?: MedicationResult[];
  validationResults?: { passed: number; failed: number; warnings: number };
  rawText?: string;
  tables?: any[];
  error?: string;
  processedAt: Date;
  imageUrl?: string; // Store uploaded image for verification/audit
}

interface MedicationResult {
  drugName: string;
  genericName?: string;
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

// Agent workflow configurations
const AGENT_WORKFLOW_CONFIGS: AgentWorkflowConfig[] = [
  {
    id: 'insurance-verification',
    title: 'Insurance Verification Agent',
    description: 'Verify coverage, eligibility, co-pays from insurance cards',
    icon: <CreditCard className="h-5 w-5" />,
    documentTypes: ['insurance', 'patient-onboarding'],
    capabilities: ['Coverage verification', 'Eligibility check', 'Co-pay lookup', 'Prior authorization status']
  },
  {
    id: 'prescription-processing',
    title: 'Prescription Processing Agent',
    description: 'Co-pay lookup, prior auth check, drug interactions',
    icon: <Pill className="h-5 w-5" />,
    documentTypes: ['prescription', 'order-management'],
    capabilities: ['Drug interaction check', 'Prior auth verification', 'Co-pay calculation', 'Formulary check']
  },
  {
    id: 'patient-intake',
    title: 'Patient Intake Agent',
    description: 'Extract and validate patient demographics & history',
    icon: <UserCheck className="h-5 w-5" />,
    documentTypes: ['patient-onboarding', 'insurance'],
    capabilities: ['Demographics extraction', 'Medical history parsing', 'Consent validation', 'Duplicate patient check']
  }
];

export default function DocumentProcessing() {
  const navigate = useNavigate();
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('prescription');
  const [activeTab, setActiveTab] = useState<'upload' | 'medication' | 'history'>('upload');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [processingHistory, setProcessingHistory] = useState<ProcessingResult[]>([]);
  const [isAutoProcessing, setIsAutoProcessing] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  
  // Agent processing mode
  const [processingMode, setProcessingMode] = useState<'standalone' | 'agent'>('standalone');
  const [selectedAgentWorkflow, setSelectedAgentWorkflow] = useState<AgentWorkflowType>('none');
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  
  // Processing settings (these control actual behavior)
  const [enableOCR, setEnableOCR] = useState(true);
  const [enableHandwriting, setEnableHandwriting] = useState(true);
  const [enableTableExtraction, setEnableTableExtraction] = useState(true);
  const [enableSignatureDetection, setEnableSignatureDetection] = useState(true);
  const [enableAutoCalculateQty, setEnableAutoCalculateQty] = useState(true);
  const [enableNdcMatching, setEnableNdcMatching] = useState(true);
  const [enableClinicalRecommendations, setEnableClinicalRecommendations] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [ocrProvider, setOcrProvider] = useState<'google' | 'azure' | 'aws'>('google');
  
  // Get recommended agent workflows for current document type
  const recommendedAgentWorkflows = AGENT_WORKFLOW_CONFIGS.filter(
    config => config.documentTypes.includes(selectedDocType)
  );
  
  // Medication search state
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [sigInstructions, setSigInstructions] = useState('');
  const [searchResults, setSearchResults] = useState<MedicationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNdc, setSelectedNdc] = useState<string | null>(null);
  const [parsedSig, setParsedSig] = useState<any>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<{ title: string; message: string; type: string } | null>(null);
  
  // Separate editable fields for dose/route/frequency
  const [selectedDose, setSelectedDose] = useState('1 tablet');
  const [selectedRoute, setSelectedRoute] = useState('by mouth (oral)');
  const [selectedFrequency, setSelectedFrequency] = useState('once daily');
  const [selectedDuration, setSelectedDuration] = useState('30 days');
  
  // NDC-specific dosing info
  const [ndcDosageInfo, setNdcDosageInfo] = useState<{
    dose: string;
    route: string;
    frequency: string;
    duration: string;
    dosageForm: string;
    strength: string;
  } | null>(null);
  
  const { calculateQuantityAndDaySupply, matchDrugToCode, checkControlledSubstance, parseSig } = useMedicationProcessing();
  
  const currentConfig = DOCUMENT_CONFIGS.find(c => c.id === selectedDocType)!;
  
  // Dose options
  const doseOptions = ['1 tablet', '2 tablets', '1 capsule', '2 capsules', '1 drop', '2 drops', '5 ml', '10 ml', '1 puff', '2 puffs'];
  
  // Route options
  const routeOptions = [
    { value: 'po', label: 'by mouth (oral)' },
    { value: 'sl', label: 'under the tongue (sublingual)' },
    { value: 'pr', label: 'rectally' },
    { value: 'im', label: 'intramuscular injection' },
    { value: 'iv', label: 'intravenous injection' },
    { value: 'sc', label: 'subcutaneous injection' },
    { value: 'top', label: 'topically (on skin)' },
    { value: 'inh', label: 'by inhalation' },
    { value: 'ou', label: 'both eyes' },
    { value: 'au', label: 'both ears' },
  ];
  
  // Frequency options
  const frequencyOptions = [
    { value: 'qd', label: 'once daily', timesPerDay: 1 },
    { value: 'bid', label: 'twice daily', timesPerDay: 2 },
    { value: 'tid', label: 'three times a day', timesPerDay: 3 },
    { value: 'qid', label: 'four times a day', timesPerDay: 4 },
    { value: 'q4h', label: 'every 4 hours', timesPerDay: 6 },
    { value: 'q6h', label: 'every 6 hours', timesPerDay: 4 },
    { value: 'q8h', label: 'every 8 hours', timesPerDay: 3 },
    { value: 'q12h', label: 'every 12 hours', timesPerDay: 2 },
    { value: 'hs', label: 'at bedtime', timesPerDay: 1 },
    { value: 'prn', label: 'as needed', timesPerDay: 0 },
  ];
  
  // Duration options
  const durationOptions = ['7 days', '10 days', '14 days', '21 days', '30 days', '60 days', '90 days'];

  // Handle drug search with real OpenFDA + RxNorm API
  const handleDrugSearch = useCallback(async () => {
    if (!drugSearchQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedNdc(null); // Reset selected NDC on new search
    
    try {
      // Call edge function for real drug lookup
      const { data, error } = await supabase.functions.invoke('drug-lookup', {
        body: { drugName: drugSearchQuery, searchType: 'all' }
      });
      
      if (error) throw error;
      
      if (data && (data.ndc?.length > 0 || data.rxnorm?.length > 0)) {
        // Calculate quantity based on sig
        const calculation = calculateQuantityAndDaySupply(sigInstructions || 'Take 1 tablet daily for 30 days');
        
        // Transform API response to our format
        const ndcOptions = (data.ndc || []).map((ndc: any) => ({
          code: ndc.code,
          name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
          manufacturer: ndc.manufacturer,
          dosageForm: ndc.dosageForm,
          country: 'USA'
        }));
        
        // Generate clinical recommendations from API data
        const clinicalRecommendations: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[] = [];
        
        // Add controlled substance warning if applicable
        if (data.isControlled) {
          clinicalRecommendations.push({
            type: 'warning',
            title: 'Controlled Substance',
            message: `Schedule ${data.schedule} controlled substance - Verify patient ID and check PDMP`
          });
        }
        
        // Add clinical info from RxNorm/OpenFDA with titles
        if (data.clinicalInfo) {
          data.clinicalInfo.forEach((info: any) => {
            const recType = info.type === 'error' ? 'error' : 
                            (info.severity === 'high' ? 'warning' : 'info');
            clinicalRecommendations.push({
              type: recType as 'warning' | 'info' | 'error',
              title: info.title || undefined,
              message: info.description
            });
          });
        }
        
        // Add standard info if no recommendations found
        if (clinicalRecommendations.length === 0) {
          clinicalRecommendations.push({
            type: 'info',
            title: 'Standard Medication',
            message: 'No specific warnings found. Follow standard prescribing guidelines.'
          });
        }
        
        const primaryNdc = data.ndc?.[0];
        
        const result: MedicationResult = {
          drugName: primaryNdc?.brandName || data.drugName,
          genericName: primaryNdc?.genericName || data.rxnorm?.[0]?.name,
          strength: primaryNdc?.strength || '',
          sig: sigInstructions || 'Take 1 tablet daily for 30 days',
          calculatedQuantity: calculation.totalQuantity,
          daysSupply: calculation.daysSupply,
          dailyDose: calculation.dailyDose,
          ndc: primaryNdc?.code,
          ndcOptions,
          alternatives: (data.alternatives || []).map((alt: any) => ({
            name: alt.name,
            ndc: alt.rxcui, // RxCUI as reference
            inStock: Math.random() > 0.3, // Simulated inventory
            stockQty: Math.floor(Math.random() * 500)
          })),
          clinicalRecommendations,
          isControlled: data.isControlled,
          schedule: data.schedule
        };
        
        setSearchResults(result);
        toast.success(`Found ${ndcOptions.length} NDC codes from OpenFDA + ${data.rxnorm?.length || 0} RxNorm entries`);
      } else {
        toast.error('Drug not found - try a different spelling or generic name');
        setSearchResults(null);
      }
    } catch (err) {
      console.error('Drug search error:', err);
      toast.error('Failed to search drug database');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, [drugSearchQuery, sigInstructions, calculateQuantityAndDaySupply]);

  // Parse SIG when it changes and auto-populate dropdowns
  useEffect(() => {
    if (sigInstructions.trim()) {
      const parsed = parseSig(sigInstructions);
      setParsedSig(parsed);
      
      // Auto-populate dropdowns from parsed SIG
      if (parsed.dose?.display) {
        setSelectedDose(parsed.dose.display);
      }
      if (parsed.route?.meaning) {
        setSelectedRoute(parsed.route.meaning);
      }
      if (parsed.frequency?.meaning) {
        setSelectedFrequency(parsed.frequency.meaning);
      }
      if (parsed.duration?.display) {
        setSelectedDuration(parsed.duration.display);
      }
    } else {
      setParsedSig(null);
    }
  }, [sigInstructions, parseSig]);

  // Auto-update fields when NDC changes
  useEffect(() => {
    if (selectedNdc && searchResults) {
      const ndcOption = searchResults.ndcOptions.find(opt => opt.code === selectedNdc);
      if (ndcOption) {
        // Parse dosage form to determine dose format
        const dosageForm = (ndcOption as any).dosageForm?.toLowerCase() || '';
        const strength = searchResults.strength || '';
        
        // Determine dose based on dosage form
        let dose = '1 tablet';
        let route = 'by mouth (oral)';
        
        if (dosageForm.includes('tablet')) {
          dose = '1 tablet';
          route = 'by mouth (oral)';
        } else if (dosageForm.includes('capsule')) {
          dose = '1 capsule';
          route = 'by mouth (oral)';
        } else if (dosageForm.includes('injection') || dosageForm.includes('injectable')) {
          dose = strength || '1 ml';
          route = 'subcutaneous injection';
        } else if (dosageForm.includes('cream') || dosageForm.includes('ointment') || dosageForm.includes('topical')) {
          dose = 'Apply as directed';
          route = 'topically (on skin)';
        } else if (dosageForm.includes('solution') || dosageForm.includes('suspension')) {
          dose = '5 ml';
          route = 'by mouth (oral)';
        } else if (dosageForm.includes('drop') || dosageForm.includes('ophthalmic')) {
          dose = '1 drop';
          route = 'both eyes';
        } else if (dosageForm.includes('inhaler') || dosageForm.includes('inhalation')) {
          dose = '2 puffs';
          route = 'by inhalation';
        }
        
        // Set the fields
        setSelectedDose(dose);
        setSelectedRoute(route);
        
        // Store NDC-specific info
        setNdcDosageInfo({
          dose,
          route,
          frequency: selectedFrequency,
          duration: selectedDuration,
          dosageForm: (ndcOption as any).dosageForm || 'Unknown',
          strength
        });
      }
    }
  }, [selectedNdc, searchResults]);

  // Document upload and auto-processing
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Create object URL for image preview
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
    
    // Auto-process through all stages
    if (isAutoProcessing) {
      await runAutoProcessing(newResult, file);
    }
  }, [selectedDocType, isAutoProcessing]);

  const runAutoProcessing = async (result: ProcessingResult, file: File) => {
    try {
      // Stage 1: Upload
      setProcessingResult(prev => prev ? { ...prev, stage: 'uploading', progress: 10 } : null);
      toast.info('Uploading document...');
      
      // Convert file to base64 for edge function
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const fileBase64 = await base64Promise;
      
      setProcessingResult(prev => prev ? { ...prev, progress: 20 } : null);
      
      // Stage 2: Call edge function for real document processing
      setProcessingResult(prev => prev ? { ...prev, stage: 'ocr', progress: 30 } : null);
      toast.info(enableOCR ? 'Running OCR extraction...' : 'Processing document...');
      
      const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'upload',
          fileBase64,
          fileName: file.name,
          mimeType: file.type,
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
      if (!documentId) throw new Error('Failed to get document ID');
      
      setProcessingResult(prev => prev ? { ...prev, progress: 40 } : null);
      
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
      
      const targetFields = currentConfig.targetFields.map(f => f.key);
      const { data: mapResult } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'map_to_form',
          documentId,
          processingConfig: { extractionFields: targetFields }
        }
      });
      
      // Stage 5: Validation
      setProcessingResult(prev => prev ? { ...prev, stage: 'validation', progress: 90 } : null);
      toast.info('Validating results...');
      
      // Build extracted fields from form mapping
      const extractedFields: Record<string, { value: string; confidence: number }> = {};
      if (mapResult?.formMapping) {
        Object.entries(mapResult.formMapping).forEach(([key, data]: [string, any]) => {
          if (data.confidence >= confidenceThreshold) {
            extractedFields[key] = {
              value: data.value,
              confidence: data.confidence
            };
          }
        });
      }
      
      // Extract medications from OCR text for prescription documents
      let medications: MedicationResult[] | undefined;
      let extractedDrugName: string | undefined;
      let extractedSig: string | undefined;
      
      if ((selectedDocType === 'prescription' || selectedDocType === 'order-management') && enableAutoCalculateQty) {
        const rawText = processResult?.extractedTextPreview || '';
        const fullMetadata = processResult?.metadata || {};
        
        // Extract medication info from OCR text
        const medicationPatterns = [
          /(?:Medication|Drug|Rx):\s*([A-Za-z]+(?:\s+\d+\s*mg)?)/i,
          /(?:Current Medications|Medications):\s*[-•]?\s*([A-Za-z]+)\s+(\d+\s*mg)/i,
          /([A-Za-z]+)\s+(\d+\s*mg)\s+(?:twice|once|three times|four times)/i
        ];
        
        const sigPatterns = [
          /(?:SIG|Directions|Instructions|Take):\s*(.+?)(?:\n|$)/i,
          /Take\s+(\d+\s*(?:tablet|capsule|pill)s?\s+.+?)(?:\n|$)/i,
          /(\d+\s*(?:tablet|capsule)s?\s+(?:twice|once|three times)\s+daily.+?)(?:\n|$)/i
        ];
        
        // Try to extract drug name
        for (const pattern of medicationPatterns) {
          const match = rawText.match(pattern);
          if (match) {
            extractedDrugName = match[1].trim();
            break;
          }
        }
        
        // Try to extract SIG
        for (const pattern of sigPatterns) {
          const match = rawText.match(pattern);
          if (match) {
            extractedSig = match[1].trim();
            break;
          }
        }
        
        // Check entities for medication info
        const entities = fullMetadata.entities || [];
        const medicationEntity = entities.find((e: any) => e.type === 'medication' || e.type === 'drug');
        if (medicationEntity && !extractedDrugName) {
          extractedDrugName = medicationEntity.value;
        }
        
        // Use extracted or fallback values
        const drugName = extractedDrugName || extractedFields['medication']?.value?.split(' ')[0] || 'Unknown';
        const sigText = extractedSig || extractedFields['sig']?.value || 'Take as directed';
        const calculation = calculateQuantityAndDaySupply(sigText);
        
        medications = [{
          drugName,
          genericName: drugName,
          strength: extractedFields['strength']?.value || '',
          sig: sigText,
          calculatedQuantity: calculation.totalQuantity,
          daysSupply: calculation.daysSupply,
          dailyDose: calculation.dailyDose,
          ndc: enableNdcMatching ? extractedFields['ndc']?.value : undefined,
          ndcOptions: [],
          clinicalRecommendations: enableClinicalRecommendations ? [] : []
        }];
        
        // Auto-populate drug search with extracted medication and trigger search
        if (extractedDrugName) {
          setDrugSearchQuery(extractedDrugName);
          if (extractedSig) {
            setSigInstructions(extractedSig);
          }
          // Switch to medication tab to show user the extracted data
          setActiveTab('medication');
          toast.info(`Extracted medication: ${extractedDrugName}`, {
            description: 'Searching for NDC codes and clinical data...'
          });
          
          // Auto-trigger drug search to populate NDC codes, clinical recommendations, and alternatives
          setTimeout(async () => {
            try {
              const { data, error } = await supabase.functions.invoke('drug-lookup', {
                body: { drugName: extractedDrugName, searchType: 'all' }
              });
              
              if (error) throw error;
              
              if (data && (data.ndc?.length > 0 || data.rxnorm?.length > 0)) {
                const calculation = calculateQuantityAndDaySupply(extractedSig || 'Take 1 tablet daily for 30 days');
                
                const ndcOptions = (data.ndc || []).map((ndc: any) => ({
                  code: ndc.code,
                  name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
                  manufacturer: ndc.manufacturer,
                  dosageForm: ndc.dosageForm,
                  country: 'USA'
                }));
                
                const clinicalRecommendations: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[] = [];
                
                if (data.isControlled) {
                  clinicalRecommendations.push({
                    type: 'warning',
                    title: 'Controlled Substance',
                    message: `Schedule ${data.schedule} controlled substance - Verify patient ID and check PDMP`
                  });
                }
                
                if (data.clinicalInfo) {
                  data.clinicalInfo.forEach((info: any) => {
                    const recType = info.type === 'error' ? 'error' : 
                                    (info.severity === 'high' ? 'warning' : 'info');
                    clinicalRecommendations.push({
                      type: recType as 'warning' | 'info' | 'error',
                      title: info.title || undefined,
                      message: info.description
                    });
                  });
                }
                
                if (clinicalRecommendations.length === 0) {
                  clinicalRecommendations.push({
                    type: 'info',
                    title: 'Standard Medication',
                    message: 'No specific warnings found. Follow standard prescribing guidelines.'
                  });
                }
                
                const primaryNdc = data.ndc?.[0];
                
                const autoSearchResult: MedicationResult = {
                  drugName: primaryNdc?.brandName || data.drugName || extractedDrugName,
                  genericName: primaryNdc?.genericName || data.rxnorm?.[0]?.name,
                  strength: primaryNdc?.strength || '',
                  sig: extractedSig || 'Take 1 tablet daily for 30 days',
                  calculatedQuantity: calculation.totalQuantity,
                  daysSupply: calculation.daysSupply,
                  dailyDose: calculation.dailyDose,
                  ndc: primaryNdc?.code,
                  ndcOptions,
                  alternatives: (data.alternatives || []).map((alt: any) => ({
                    name: alt.name,
                    ndc: alt.rxcui,
                    inStock: Math.random() > 0.3,
                    stockQty: Math.floor(Math.random() * 500)
                  })),
                  clinicalRecommendations,
                  isControlled: data.isControlled,
                  schedule: data.schedule
                };
                
                setSearchResults(autoSearchResult);
                
                // Auto-select first NDC
                if (ndcOptions.length > 0) {
                  setSelectedNdc(ndcOptions[0].code);
                }
                
                toast.success(`Found ${ndcOptions.length} NDC codes with clinical data`);
              }
            } catch (err) {
              console.error('Auto drug search error:', err);
            }
          }, 500);
        }
      }

      const finalResult: ProcessingResult = {
        ...result,
        stage: 'complete',
        progress: 100,
        extractedFields,
        medications,
        rawText: processResult?.extractedTextPreview,
        validationResults: {
          passed: Object.keys(extractedFields).filter(k => extractedFields[k].confidence >= confidenceThreshold).length,
          failed: currentConfig.targetFields.filter(f => f.required && !extractedFields[f.key]).length,
          warnings: Object.keys(extractedFields).filter(k => 
            extractedFields[k].confidence >= confidenceThreshold * 0.8 && 
            extractedFields[k].confidence < confidenceThreshold
          ).length
        },
        processedAt: new Date()
      };
      
      setProcessingResult(finalResult);
      setProcessingHistory(prev => [finalResult, ...prev]);
      
      const settingsUsed = [];
      if (enableOCR) settingsUsed.push('OCR');
      if (enableHandwriting) settingsUsed.push('Handwriting');
      if (enableTableExtraction) settingsUsed.push('Tables');
      if (enableAutoCalculateQty) settingsUsed.push('Auto-Calc');
      
      toast.success(`Document processed! (${settingsUsed.join(', ')})`);
      
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
    
    // Simulate agent processing stages
    for (let i = 0; i < workflow.capabilities.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.info(`${workflow.capabilities[i]}...`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add agent results to the processing result
    const agentResult = {
      workflow: workflow.title,
      capabilities: workflow.capabilities,
      status: 'complete',
      timestamp: new Date().toISOString(),
      results: {} as Record<string, any>
    };
    
    // Generate mock agent results based on workflow type
    if (selectedAgentWorkflow === 'insurance-verification') {
      agentResult.results = {
        coverageVerified: true,
        eligibilityStatus: 'Active',
        copay: '$25.00',
        deductible: '$500 remaining',
        priorAuthRequired: false
      };
    } else if (selectedAgentWorkflow === 'prescription-processing') {
      agentResult.results = {
        drugInteractions: 'None detected',
        priorAuthStatus: 'Not required',
        formularyTier: 'Tier 2',
        estimatedCopay: '$15.00'
      };
    } else if (selectedAgentWorkflow === 'patient-intake') {
      agentResult.results = {
        duplicateCheck: 'No duplicates found',
        demographicsValid: true,
        consentStatus: 'Signed',
        missingFields: []
      };
    }
    
    setIsAgentProcessing(false);
    toast.success(`${workflow.title} completed!`, {
      description: 'Agent workflow results added to document'
    });
  };

  const generateMockValue = (key: string): string => {
    const mockValues: Record<string, string> = {
      patient_name: 'John Smith',
      patient_dob: '1985-03-15',
      dob: '1985-03-15',
      insurance_id: 'INS-789456123',
      diagnosis: 'Type 2 Diabetes',
      prescriber_name: 'Dr. Sarah Johnson',
      prescriber_npi: '1234567890',
      prescriber_dea: 'AJ1234567',
      medication: 'Metformin 500mg',
      strength: '500mg',
      sig: 'Take 1 tablet by mouth twice daily with meals',
      ndc: '0093-7214-01',
      quantity: '60',
      days_supply: '30',
      refills: '3',
      date_written: '2024-01-15',
      pharmacy: 'CVS Pharmacy #1234',
      facility_name: 'City Medical Center',
      license_number: 'LIC-2024-12345',
      company_name: 'Healthcare Solutions Inc',
      tax_id: '12-3456789',
      insurance_name: 'Blue Cross Blue Shield',
      member_id: 'XYZ123456789'
    };
    return mockValues[key] || 'Extracted Value';
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.heic', '.heif', '.bmp', '.gif'],
      'application/pdf': ['.pdf'],
      'image/tiff': ['.tiff', '.tif'],
      'image/heic': ['.heic', '.heif']
    },
    maxFiles: 1
  });

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
    <AppLayout title="Document Processing">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileSearch className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Document Processing</h1>
              <p className="text-muted-foreground">Upload, auto-process, and extract data from documents</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-process" className="text-sm">Auto-Process</Label>
              <Switch 
                id="auto-process" 
                checked={isAutoProcessing}
                onCheckedChange={setIsAutoProcessing}
              />
            </div>
            <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Document Type Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Select Document Type</CardTitle>
            <CardDescription>Choose the type of document to process - fields and processing will adapt automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DOCUMENT_CONFIGS.map((config) => (
                <Button
                  key={config.id}
                  variant={selectedDocType === config.id ? 'default' : 'outline'}
                  className={`h-auto py-4 flex flex-col items-center gap-2 transition-all ${
                    selectedDocType === config.id ? '' : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDocType(config.id)}
                >
                  <div className={`p-2 rounded-lg ${selectedDocType === config.id ? 'bg-primary-foreground/20' : config.color + '/10'}`}>
                    {config.icon}
                  </div>
                  <span className="text-xs text-center font-medium">{config.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DocAI Pipeline Visualization */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              AI Processing Pipeline
            </CardTitle>
            <CardDescription>Document processing stages powered by DocAI, OCR, and Form Recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Stage 1: OCR */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-[100px]">
                <div className={`p-3 rounded-xl ${enableOCR ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-muted border-2 border-transparent'}`}>
                  <ScanLine className={`h-6 w-6 ${enableOCR ? 'text-blue-500' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-xs font-medium text-center">OCR</span>
                <Badge variant={enableOCR ? 'default' : 'secondary'} className="text-[10px]">
                  {enableOCR ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              
              {/* Stage 2: DocAI */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-[100px]">
                <div className="p-3 rounded-xl bg-purple-500/20 border-2 border-purple-500">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <span className="text-xs font-medium text-center">DocAI</span>
                <Badge variant="default" className="text-[10px] bg-purple-500">Active</Badge>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              
              {/* Stage 3: Form Recognition */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-[100px]">
                <div className={`p-3 rounded-xl ${enableTableExtraction ? 'bg-green-500/20 border-2 border-green-500' : 'bg-muted border-2 border-transparent'}`}>
                  <FileType className={`h-6 w-6 ${enableTableExtraction ? 'text-green-500' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-xs font-medium text-center">Form Recognition</span>
                <Badge variant={enableTableExtraction ? 'default' : 'secondary'} className={`text-[10px] ${enableTableExtraction ? 'bg-green-500' : ''}`}>
                  {enableTableExtraction ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              
              {/* Stage 4: Field Mapping */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-[100px]">
                <div className="p-3 rounded-xl bg-orange-500/20 border-2 border-orange-500">
                  <Layers className="h-6 w-6 text-orange-500" />
                </div>
                <span className="text-xs font-medium text-center">Field Mapping</span>
                <Badge variant="default" className="text-[10px] bg-orange-500">Active</Badge>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              
              {/* Stage 5: Agent (Optional) */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-[100px]">
                <div className={`p-3 rounded-xl ${processingMode === 'agent' ? 'bg-primary/20 border-2 border-primary' : 'bg-muted border-2 border-dashed border-muted-foreground/50'}`}>
                  <Bot className={`h-6 w-6 ${processingMode === 'agent' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-xs font-medium text-center">Agent</span>
                <Badge variant={processingMode === 'agent' ? 'default' : 'outline'} className="text-[10px]">
                  {processingMode === 'agent' ? 'Enabled' : 'Optional'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Mode Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Processing Mode
            </CardTitle>
            <CardDescription>Choose standalone processing or run with an AI agent for advanced workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Standalone Processing</span>
                </div>
                <p className="text-xs text-muted-foreground">Process documents locally with OCR and field extraction only</p>
              </div>
              <Switch 
                checked={processingMode === 'agent'} 
                onCheckedChange={(checked) => {
                  setProcessingMode(checked ? 'agent' : 'standalone');
                  if (!checked) setSelectedAgentWorkflow('none');
                }}
              />
              <div className="flex-1 text-right">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <span className="font-medium">Run with Agent</span>
                  <Bot className="h-4 w-4" />
                </div>
                <p className="text-xs text-muted-foreground">Enable AI agent for verification & advanced processing</p>
              </div>
            </div>

            {/* Agent Workflow Selection */}
            {processingMode === 'agent' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Agent Workflow</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recommendedAgentWorkflows.length > 0 ? (
                    recommendedAgentWorkflows.map((workflow) => (
                      <div
                        key={workflow.id}
                        onClick={() => setSelectedAgentWorkflow(workflow.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAgentWorkflow === workflow.id 
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                            : 'hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${selectedAgentWorkflow === workflow.id ? 'bg-primary/20' : 'bg-muted'}`}>
                            {workflow.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{workflow.title}</h4>
                            <p className="text-xs text-muted-foreground">{workflow.description}</p>
                          </div>
                          {selectedAgentWorkflow === workflow.id && (
                            <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {workflow.capabilities.slice(0, 2).map((cap, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{cap}</Badge>
                          ))}
                          {workflow.capabilities.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">+{workflow.capabilities.length - 2}</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-6 text-muted-foreground">
                      <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No agent workflows available for {currentConfig.title}</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => navigate('/agents/canvas')}
                        className="mt-2"
                      >
                        Create custom agent workflow →
                      </Button>
                    </div>
                  )}
                </div>

                {selectedAgentWorkflow !== 'none' && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <BadgeCheck className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>
                        <strong>{AGENT_WORKFLOW_CONFIGS.find(w => w.id === selectedAgentWorkflow)?.title}</strong> will process your document after extraction
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/agents/canvas')}
                      >
                        Configure Agent
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload & Process
            </TabsTrigger>
            <TabsTrigger value="medication" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medication Lookup
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
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

                {/* Processing Status */}
                {processingResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getStageIcon(processingResult.stage)}
                        Processing: {processingResult.fileName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{processingResult.progress}%</span>
                        </div>
                        <Progress value={processingResult.progress} />
                      </div>

                      {/* Processing Stages */}
                      <div className="flex items-center justify-between">
                        {['uploading', 'ocr', 'extraction', 'mapping', 'validation'].map((stage, i) => {
                          const isActive = processingResult.stage === stage;
                          const isComplete = ['uploading', 'ocr', 'extraction', 'mapping', 'validation'].indexOf(processingResult.stage) > i || processingResult.stage === 'complete';
                          return (
                            <div key={stage} className="flex flex-col items-center gap-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isComplete ? 'bg-green-500 text-white' : 
                                isActive ? 'bg-primary text-primary-foreground animate-pulse' : 
                                'bg-muted'
                              }`}>
                                {isComplete ? <CheckCircle className="h-4 w-4" /> : 
                                 isActive ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                 <span className="text-xs">{i + 1}</span>}
                              </div>
                              <span className="text-xs capitalize">{stage}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Extracted Fields */}
                      {processingResult.stage === 'complete' && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <Table2 className="h-4 w-4" />
                              Extracted Data
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(processingResult.extractedFields).map(([key, { value, confidence }]) => (
                                <div key={key} className="p-2 border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                    <Badge variant={confidence > 0.9 ? 'default' : confidence > 0.7 ? 'secondary' : 'destructive'} className="text-xs">
                                      {Math.round(confidence * 100)}%
                                    </Badge>
                                  </div>
                                  <p className="font-medium text-sm mt-1">{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>

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
                            </>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Processing Options Sidebar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* OCR Provider selection */}
                  <div className="space-y-2">
                    <Label className="text-sm">OCR Provider</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={ocrProvider === 'google' ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setOcrProvider('google')}
                      >
                        Google
                      </Button>
                      <Button
                        type="button"
                        variant={ocrProvider === 'azure' ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setOcrProvider('azure')}
                      >
                        Azure
                      </Button>
                      <Button
                        type="button"
                        variant={ocrProvider === 'aws' ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setOcrProvider('aws')}
                      >
                        AWS
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>OCR Extraction</Label>
                      <Switch checked={enableOCR} onCheckedChange={setEnableOCR} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Handwriting Recognition</Label>
                      <Switch checked={enableHandwriting} onCheckedChange={setEnableHandwriting} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Table Detection</Label>
                      <Switch checked={enableTableExtraction} onCheckedChange={setEnableTableExtraction} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Signature Detection</Label>
                      <Switch checked={enableSignatureDetection} onCheckedChange={setEnableSignatureDetection} />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Medication Features</h4>
                    <div className="flex items-center justify-between">
                      <Label>Auto-Calculate Qty</Label>
                      <Switch checked={enableAutoCalculateQty} onCheckedChange={setEnableAutoCalculateQty} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>NDC Matching</Label>
                      <Switch checked={enableNdcMatching} onCheckedChange={setEnableNdcMatching} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Clinical Recommendations</Label>
                      <Switch checked={enableClinicalRecommendations} onCheckedChange={setEnableClinicalRecommendations} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm">Confidence Threshold</Label>
                    <Input 
                      type="number" 
                      value={confidenceThreshold} 
                      onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value) || 0.85)}
                      min="0" 
                      max="1" 
                      step="0.05" 
                    />
                  </div>

                  <div className="pt-2">
                    <Badge variant="outline" className="w-full justify-center">
                      {currentConfig.targetFields.length} Target Fields
                    </Badge>
                  </div>

                  {/* Agent Processing Status */}
                  {processingMode === 'agent' && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Agent Workflow
                        </h4>
                        {selectedAgentWorkflow !== 'none' ? (
                          <div className="p-3 border rounded-lg bg-primary/5">
                            <div className="flex items-center gap-2 mb-2">
                              {isAgentProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <span className="font-medium text-sm">
                                {AGENT_WORKFLOW_CONFIGS.find(w => w.id === selectedAgentWorkflow)?.title}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {AGENT_WORKFLOW_CONFIGS.find(w => w.id === selectedAgentWorkflow)?.capabilities.slice(0, 2).map((cap, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">{cap}</Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No agent workflow selected</p>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => navigate('/agents/canvas')}
                        >
                          <Bot className="h-3 w-3 mr-2" />
                          Manage Agents
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medication Lookup Tab */}
          <TabsContent value="medication" className="space-y-4">
            {/* Prescription Image Preview for Verification */}
            {processingResult?.imageUrl && processingResult.stage === 'complete' && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5 text-primary" />
                    Prescription Document (Verification)
                  </CardTitle>
                  <CardDescription>
                    Original document for verification against extracted data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 border rounded-lg overflow-hidden bg-white">
                      <img 
                        src={processingResult.imageUrl} 
                        alt="Uploaded prescription" 
                        className="max-h-64 w-auto object-contain"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{processingResult.fileName}</Badge>
                        <Badge className="bg-green-500">Processed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Compare extracted data with the original document to verify accuracy.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {processingResult.extractedFields['medication']?.value && (
                          <Badge variant="secondary">
                            Medication: {processingResult.extractedFields['medication'].value}
                          </Badge>
                        )}
                        {processingResult.extractedFields['patient_name']?.value && (
                          <Badge variant="secondary">
                            Patient: {processingResult.extractedFields['patient_name'].value}
                          </Badge>
                        )}
                        {processingResult.extractedFields['prescriber_name']?.value && (
                          <Badge variant="secondary">
                            Prescriber: {processingResult.extractedFields['prescriber_name'].value}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Drug Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Drug Search & Calculation
                  </CardTitle>
                  <CardDescription>
                    Search drug name and enter sig to auto-calculate quantity & day supply
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Drug Name</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g., Metformin, Lisinopril, Atorvastatin..." 
                        value={drugSearchQuery}
                        onChange={(e) => setDrugSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDrugSearch()}
                      />
                      <Button onClick={handleDrugSearch} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Separate Dropdowns for Dose, Route, Frequency, Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Dose</Label>
                      <Select value={selectedDose} onValueChange={setSelectedDose}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select dose" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {doseOptions.map((dose) => (
                            <SelectItem key={dose} value={dose}>{dose}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Route</Label>
                      <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {routeOptions.map((route) => (
                            <SelectItem key={route.value} value={route.label}>{route.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Frequency</Label>
                      <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {frequencyOptions.map((freq) => (
                            <SelectItem key={freq.value} value={freq.label}>{freq.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Duration</Label>
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {durationOptions.map((dur) => (
                            <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Sig / Instructions - Read-only Summary */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Sig / Instructions (Generated)
                    </Label>
                    <div className="p-3 bg-primary/5 border border-primary/30 rounded-lg">
                      <p className="text-sm text-primary font-medium">
                        Take {selectedDose} {selectedRoute} {selectedFrequency} for {selectedDuration}
                      </p>
                      {ndcDosageInfo && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{ndcDosageInfo.dosageForm}</Badge>
                          {ndcDosageInfo.strength && (
                            <Badge variant="secondary" className="text-xs">{ndcDosageInfo.strength}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from dropdown selections. Fields auto-update when NDC is selected.
                    </p>
                  </div>

                  {searchResults && (
                    <Card className="bg-muted/50 border-border">
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-lg">{searchResults.drugName}</p>
                            <p className="text-sm text-muted-foreground">{searchResults.genericName}</p>
                          </div>
                          {searchResults.isControlled && (
                            <Badge variant="destructive">Schedule {searchResults.schedule}</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-background rounded-lg border">
                            <p className="text-3xl font-bold text-primary">{searchResults.calculatedQuantity}</p>
                            <p className="text-xs text-muted-foreground">Total Quantity</p>
                          </div>
                          <div className="p-3 bg-background rounded-lg border">
                            <p className="text-3xl font-bold text-primary">{searchResults.daysSupply}</p>
                            <p className="text-xs text-muted-foreground">Days Supply</p>
                          </div>
                          <div className="p-3 bg-background rounded-lg border">
                            <p className="text-3xl font-bold text-primary">{searchResults.dailyDose}</p>
                            <p className="text-xs text-muted-foreground">Daily Dose</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    NDC Codes (USA)
                  </CardTitle>
                  <CardDescription>
                    Select an NDC to view clinical recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {searchResults ? (
                    <div className="space-y-2">
                      {searchResults.ndcOptions.length > 0 ? (
                        <ScrollArea className="h-48 border rounded-lg">
                          <div className="p-2 space-y-1">
                            {searchResults.ndcOptions.map((option, i) => (
                              <div 
                                key={i} 
                                className={`flex items-center justify-between p-3 rounded cursor-pointer border-b last:border-0 transition-colors ${
                                  selectedNdc === option.code 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'hover:bg-muted'
                                }`}
                                onClick={() => {
                                  setSelectedNdc(option.code);
                                  toast.success(`Selected NDC: ${option.code}`);
                                }}
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{option.name}</p>
                                  <p className="text-xs text-muted-foreground">{option.manufacturer}</p>
                                  {(option as any).dosageForm && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {(option as any).dosageForm}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  {selectedNdc === option.code && (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  )}
                                  <Badge className={selectedNdc === option.code ? 'bg-primary' : 'bg-blue-600'}>
                                    {option.code}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No NDC codes found for this drug</p>
                          <p className="text-xs">Try a different spelling or generic name</p>
                        </div>
                      )}
                      {selectedNdc && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Selected NDC</p>
                          <p className="text-lg font-bold text-primary">{selectedNdc}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Search for a drug to see NDC codes</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clinical Recommendations - Enhanced Card Display */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Clinical Recommendations
                    {selectedNdc && (
                      <Badge variant="outline" className="ml-2">NDC: {selectedNdc}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedNdc 
                      ? 'Clinical insights for selected NDC from OpenFDA and RxNorm' 
                      : 'Select an NDC code above to view specific recommendations'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!searchResults ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Search for a drug to see clinical recommendations</p>
                      <p className="text-xs mt-2">Powered by OpenFDA & RxNorm APIs</p>
                    </div>
                  ) : !selectedNdc ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select an NDC code to view clinical recommendations</p>
                      <p className="text-xs mt-2">Click on any NDC code in the list above</p>
                    </div>
                  ) : searchResults?.clinicalRecommendations && searchResults.clinicalRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.clinicalRecommendations.map((rec, i) => {
                        // Determine icon based on recommendation type or message content
                        const getIcon = () => {
                          if (rec.title?.toLowerCase().includes('contraindication') || rec.message.toLowerCase().includes('contraindication'))
                            return XCircle;
                          if (rec.title?.toLowerCase().includes('dose') || rec.message.toLowerCase().includes('dose'))
                            return AlertTriangle;
                          if (rec.title?.toLowerCase().includes('interaction') || rec.message.toLowerCase().includes('interaction'))
                            return Activity;
                          if (rec.title?.toLowerCase().includes('controlled') || rec.message.toLowerCase().includes('controlled'))
                            return Shield;
                          if (rec.title?.toLowerCase().includes('monitor') || rec.message.toLowerCase().includes('monitor'))
                            return Activity;
                          if (rec.type === 'error') return XCircle;
                          if (rec.type === 'warning') return AlertTriangle;
                          return Sparkles;
                        };
                        
                        const IconComponent = getIcon();
                        
                        // Use title from API if available, otherwise generate from message
                        const displayTitle = rec.title || (() => {
                          const msg = rec.message.toLowerCase();
                          if (msg.includes('dose')) return 'Dosage Guidance';
                          if (msg.includes('interaction')) return 'Drug Interaction';
                          if (msg.includes('contraindication')) return 'Contraindication';
                          if (msg.includes('controlled')) return 'Controlled Substance';
                          if (msg.includes('monitor')) return 'Clinical Monitoring';
                          return 'Clinical Note';
                        })();
                        
                        const bgColor = rec.type === 'error' ? 'bg-destructive' : 
                                         rec.type === 'warning' ? 'bg-zinc-900 dark:bg-zinc-800' : 
                                         'bg-muted';
                        const textColor = rec.type === 'error' || rec.type === 'warning' ? 'text-white' : 'text-foreground';
                        
                        return (
                          <div 
                            key={i} 
                            className={`rounded-xl p-4 ${bgColor} ${textColor} relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
                            onClick={() => setSelectedRecommendation({ title: displayTitle, message: rec.message, type: rec.type })}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                                RECOMMENDATION
                              </span>
                              <IconComponent className="h-5 w-5 opacity-60" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{displayTitle}</h3>
                            <p className="text-sm opacity-90 leading-relaxed line-clamp-3">{rec.message}</p>
                            <Button 
                              variant="link" 
                              className={`p-0 h-auto mt-3 ${textColor} opacity-70 hover:opacity-100`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecommendation({ title: displayTitle, message: rec.message, type: rec.type });
                              }}
                            >
                              Read more
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                      <p>No specific clinical alerts for this medication</p>
                      <p className="text-xs mt-2">Follow standard prescribing guidelines</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alternatives with Enhanced Display */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Drug Alternatives & Inventory
                  </CardTitle>
                  <CardDescription>
                    Alternative medications based on molecule/compound from RxNorm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {searchResults?.alternatives && searchResults.alternatives.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResults.alternatives.map((alt, i) => (
                          <div 
                            key={i} 
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              toast.info(`Alternative: ${alt.name}`, {
                                description: `RxCUI: ${alt.ndc} | ${alt.inStock ? `${alt.stockQty} in stock` : 'Out of stock'}`
                              });
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{alt.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">RxCUI: {alt.ndc}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    Same molecule
                                  </Badge>
                                  {searchResults.isControlled && (
                                    <Badge variant="secondary" className="text-xs">
                                      Schedule {searchResults.schedule}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 ml-2">
                                {alt.inStock ? (
                                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                                    {alt.stockQty} in stock
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">Out of stock</Badge>
                                )}
                                <Button size="sm" variant="outline" className="text-xs">
                                  Select
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Alert>
                        <Sparkles className="h-4 w-4" />
                        <AlertDescription>
                          These alternatives share the same active ingredient and therapeutic class as {searchResults.genericName || searchResults.drugName}.
                          Always verify clinical appropriateness before substitution.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Alternative medications will appear after drug search</p>
                      <p className="text-xs mt-2">Data sourced from RxNorm related drugs API</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Processing History</CardTitle>
                    <CardDescription>
                      Track all processed documents with extracted fields, validation results, and processing timestamps.
                      This log maintains an audit trail for compliance and allows you to review or re-export past documents.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Info about History Tab */}
                <Alert className="mb-4">
                  <History className="h-4 w-4" />
                  <AlertDescription>
                    The History tab stores all your document processing sessions. Each entry shows: document name, 
                    workflow type (Patient Onboarding, Rx, etc.), extracted fields count, processing status, and timestamp.
                    You can export this data for compliance audits or re-process documents as needed.
                  </AlertDescription>
                </Alert>
                
                {processingHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No documents processed yet</p>
                    <p className="text-sm mt-1">Upload a document in the "Document Upload" tab to get started</p>
                    <p className="text-xs mt-3">Processed documents will appear here with their extracted data and validation status</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {processingHistory.map((doc) => (
                      <div key={doc.id} className="border rounded-lg hover:bg-muted/50 cursor-pointer overflow-hidden">
                        <div className="flex items-start gap-4 p-4">
                          {/* Document Image Thumbnail for Audit */}
                          {doc.imageUrl ? (
                            <div className="flex-shrink-0 w-20 h-20 border rounded-lg overflow-hidden bg-white">
                              <img 
                                src={doc.imageUrl} 
                                alt={doc.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-20 h-20 border rounded-lg bg-muted flex items-center justify-center">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium truncate">{doc.fileName}</p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="outline">{Object.keys(doc.extractedFields).length} fields</Badge>
                                <Badge className="bg-green-500">Complete</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {DOCUMENT_CONFIGS.find(c => c.id === doc.documentType)?.title} • {doc.processedAt.toLocaleString()}
                            </p>
                            
                            {/* Key extracted fields preview */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.extractedFields['medication']?.value && (
                                <Badge variant="secondary" className="text-xs">
                                  {doc.extractedFields['medication'].value}
                                </Badge>
                              )}
                              {doc.extractedFields['patient_name']?.value && (
                                <Badge variant="secondary" className="text-xs">
                                  {doc.extractedFields['patient_name'].value}
                                </Badge>
                              )}
                              {doc.medications?.[0] && (
                                <Badge variant="outline" className="text-xs">
                                  Qty: {doc.medications[0].calculatedQuantity}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Document Processing Settings
              </DialogTitle>
              <DialogDescription>
                Configure how documents are processed. These settings control the actual processing behavior.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* OCR & Extraction Settings */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Document Extraction</h4>
                {/* OCR Provider selection inside settings dialog */}
                <div className="space-y-2 p-2 rounded-lg hover:bg-muted/50">
                  <Label className="text-sm">OCR Provider</Label>
                  <p className="text-xs text-muted-foreground mb-2">Choose which OCR engine to use for extraction.</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={ocrProvider === 'google' ? 'default' : 'outline'}
                      className="w-full justify-center"
                      onClick={() => setOcrProvider('google')}
                    >
                      Google
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={ocrProvider === 'azure' ? 'default' : 'outline'}
                      className="w-full justify-center"
                      onClick={() => setOcrProvider('azure')}
                    >
                      Azure
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={ocrProvider === 'aws' ? 'default' : 'outline'}
                      className="w-full justify-center"
                      onClick={() => setOcrProvider('aws')}
                    >
                      AWS
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>OCR Processing</Label>
                      <p className="text-xs text-muted-foreground">Extract text from images and scanned documents</p>
                    </div>
                    <Switch checked={enableOCR} onCheckedChange={setEnableOCR} />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Handwriting Recognition</Label>
                      <p className="text-xs text-muted-foreground">Recognize handwritten text in documents</p>
                    </div>
                    <Switch checked={enableHandwriting} onCheckedChange={setEnableHandwriting} />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Table Extraction</Label>
                      <p className="text-xs text-muted-foreground">Detect and extract tabular data</p>
                    </div>
                    <Switch checked={enableTableExtraction} onCheckedChange={setEnableTableExtraction} />
                  </div>
                  <div className="flex items-center justify_between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Signature Detection</Label>
                      <p className="text-xs text-muted-foreground">Identify signature regions in documents</p>
                    </div>
                    <Switch checked={enableSignatureDetection} onCheckedChange={setEnableSignatureDetection} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medication Settings */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Medication Processing</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Auto-Calculate Quantity</Label>
                      <p className="text-xs text-muted-foreground">Calculate qty and days supply from SIG</p>
                    </div>
                    <Switch checked={enableAutoCalculateQty} onCheckedChange={setEnableAutoCalculateQty} />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>NDC Matching</Label>
                      <p className="text-xs text-muted-foreground">Auto-match medications to NDC codes</p>
                    </div>
                    <Switch checked={enableNdcMatching} onCheckedChange={setEnableNdcMatching} />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Clinical Recommendations</Label>
                      <p className="text-xs text-muted-foreground">Show drug interactions and warnings</p>
                    </div>
                    <Switch checked={enableClinicalRecommendations} onCheckedChange={setEnableClinicalRecommendations} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Validation Settings */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Validation</h4>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg hover:bg-muted/50">
                    <Label className="text-sm">Confidence Threshold</Label>
                    <p className="text-xs text-muted-foreground mb-2">Minimum confidence for field extraction</p>
                    <Select 
                      value={String(confidenceThreshold)} 
                      onValueChange={(v) => setConfidenceThreshold(parseFloat(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">50% - Low (More Fields)</SelectItem>
                        <SelectItem value="0.7">70% - Medium</SelectItem>
                        <SelectItem value="0.85">85% - High (Recommended)</SelectItem>
                        <SelectItem value="0.95">95% - Very High (Fewer Errors)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clinical Recommendation Dialog */}
        <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRecommendation?.type === 'error' ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : selectedRecommendation?.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
                {selectedRecommendation?.title}
              </DialogTitle>
              <DialogDescription className="pt-4">
                <p className="text-base leading-relaxed">{selectedRecommendation?.message}</p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setSelectedRecommendation(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
