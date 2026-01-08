/**
 * Patient Info Verification Panel
 * Shows extracted patient information in sections matching the form layout
 * Includes document image preview and signature detection
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  FileText, 
  PenTool, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  Eye,
  Pencil,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormMapping, DocumentJob } from '@/hooks/useDocumentProcessing';

interface PatientInfoVerificationPanelProps {
  job: DocumentJob;
  formMapping: FormMapping | null;
  className?: string;
  onFieldEdit?: (key: string, newValue: string) => void;
  onFieldDelete?: (key: string) => void;
  onFieldVerify?: (key: string) => void;
}

// Define field sections matching typical patient enrollment/intake form structure
// Order matches common form layouts for easy verification across different pharma/healthcare forms
const FIELD_SECTIONS = [
  {
    id: 'program_services',
    title: 'Program & Services Requested',
    icon: Shield,
    patterns: ['program', 'service_requested', 'benefits_investigation', 'copay_coupon', 'co_pay', 'prior_authorization', 'patient_assistance', 'medication_assistance', 'appeals', 'marketplace', 'state_insurance', 'eligibility', 'advancing_access', 'patient_support', 'support_program', 'hub_services', 'reimbursement', 'financial_assistance']
  },
  {
    id: 'medication_prescribed',
    title: 'Medication Prescribed',
    icon: FileText,
    patterns: ['medication_prescribed', 'medication_name', 'drug_name', 'prescribed_medication', 'therapy', 'treatment', 'dosage', 'strength', 'frequency', 'quantity', 'refills', 'days_supply', 'ndc', 'rx_number', 'directions', 'sig', 'route', 'indication', 'diagnosis_for_medication']
  },
  {
    id: 'patient_information',
    title: 'Patient Information',
    icon: User,
    patterns: ['patient_name', 'first_name', 'last_name', 'middle_name', 'dob', 'date_of_birth', 'patient_dob', 'gender', 'sex', 'ssn', 'social_security', 'patient_id', 'mrn', 'medical_record', 'age', 'birth', 'full_name', 'applicant_name', 'patient_first', 'patient_last', 'patient_middle', 'patient_gender', 'patient_ssn', 'patient_phone', 'patient_email', 'patient_mobile', 'patient_cell', 'patient_fax', 'home_phone', 'work_phone', 'cell_phone', 'mobile_phone', 'patient_contact', 'patient_address', 'patient_street', 'patient_city', 'patient_state', 'patient_zip', 'home_address', 'mailing_address', 'residential_address', 'language', 'preferred_language', 'best_time_to_call', 'contact_preference']
  },
  {
    id: 'contact_authorization',
    title: 'Contact Authorization',
    icon: PenTool,
    patterns: ['representative_name', 'representative_relationship', 'applicant_consent', 'patient_representative', 'authorized_representative', 'legal_guardian', 'power_of_attorney', 'caregiver_name', 'caregiver_relationship', 'contact_authorization', 'authorized_contact', 'permission_to_contact', 'voicemail_consent', 'sms_consent', 'email_consent', 'hipaa', 'phi_authorization', 'release_information', 'emergency_contact', 'emergency_phone', 'emergency_name']
  },
  {
    id: 'insurance_information',
    title: 'Insurance Information',
    icon: Shield,
    patterns: ['insurance', 'member_id', 'group_number', 'policy', 'subscriber', 'payer', 'carrier', 'plan', 'coverage', 'insurance_provider', 'policy_number', 'insurance_type', 'insurance_status', 'uninsured', 'underinsured', 'no_insurance', 'medicaid', 'medicare', 'commercial', 'military', 'tricare', 'va_benefits', 'bin', 'pcn', 'rxgrp', 'cardholder', 'rx_member', 'rx_group', 'pharmacy_benefit', 'pbm', 'primary_insurance', 'secondary_insurance', 'medical_benefit']
  },
  {
    id: 'patient_financial',
    title: 'Patient Financial Information',
    icon: FileText,
    patterns: ['income', 'household_income', 'annual_income', 'household_size', 'family_size', 'tax_filing', 'employment', 'employer', 'financial', 'fpl', 'federal_poverty', 'afford', 'hardship', 'financial_assistance', 'copay', 'deductible', 'out_of_pocket', 'coinsurance', 'premium', 'cost', 'payment', 'bank', 'credit_card']
  },
  {
    id: 'prescriber_info',
    title: 'Prescriber/Provider Information',
    icon: User,
    patterns: ['prescriber_name', 'prescriber_facility', 'prescriber_address', 'prescriber_city', 'prescriber_state', 'prescriber_zip', 'prescriber_phone', 'prescriber_fax', 'prescriber_npi', 'prescriber_dea', 'prescriber_office', 'prescriber_contact', 'prescriber_email', 'prescribing_physician', 'ordering_physician', 'referring_physician', 'physician_name', 'doctor_name', 'provider_name', 'clinic_name', 'facility_name', 'office_contact', 'hcp_name', 'healthcare_provider', 'npi', 'dea', 'medical_license', 'state_license', 'tax_id', 'office_manager']
  },
  {
    id: 'pharmacy_info',
    title: 'Pharmacy Information',
    icon: FileText,
    patterns: ['pharmacy_name', 'pharmacy_address', 'pharmacy_phone', 'pharmacy_fax', 'pharmacy_npi', 'pharmacy_ncpdp', 'specialty_pharmacy', 'mail_order', 'preferred_pharmacy', 'pharmacy_city', 'pharmacy_state', 'pharmacy_zip', 'dispensing_pharmacy']
  },
  {
    id: 'clinical_info',
    title: 'Clinical Information',
    icon: FileText,
    patterns: ['diagnosis', 'icd', 'condition', 'allerg', 'current_medications', 'medical_conditions', 'medical_history', 'lab_results', 'treatment_history', 'prior_therapy', 'contraindication', 'pregnancy', 'weight', 'height', 'bmi', 'vital', 'test_result', 'clinical_notes']
  },
  {
    id: 'consent_signatures',
    title: 'Consent & Signatures',
    icon: PenTool,
    patterns: ['consent', 'signature', 'sign', 'authorization', 'agreement', 'acknowledge', 'date_signed', 'witness', 'signed_date', 'opt_in', 'opt_out', 'marketing_communication', 'patient_consent', 'shipping_consent', 'prescription_shipping', 'patient_signature', 'prescriber_signature', 'representative_signature', 'attestation', 'certification', 'terms', 'privacy']
  },
  {
    id: 'additional',
    title: 'Additional Information',
    icon: FileText,
    patterns: ['notes', 'comments', 'additional', 'other', 'special_instructions', 'shipping', 'delivery', 'preferred_contact', 'referral', 'source', 'how_heard', 'reason', 'document_type', 'form_type', 'form_name', 'form_version', 'form_date']
  }
];

// Check if a field key matches a section's patterns
// Uses very flexible matching to catch varied naming conventions from different OCR/AI systems
const fieldMatchesSection = (fieldKey: string, patterns: string[]): boolean => {
  const normalizedKey = fieldKey.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
  
  return patterns.some(pattern => {
    const normalizedPattern = pattern.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
    
    // Direct substring match (most common case)
    if (normalizedKey.includes(normalizedPattern) || normalizedPattern.includes(normalizedKey)) {
      return true;
    }
    
    // Word-based matching - if any significant word from pattern appears in key
    const patternWords = normalizedPattern.split(' ').filter(w => w.length > 2);
    const keyWords = normalizedKey.split(' ').filter(w => w.length > 2);
    
    // Match if any pattern word is found in key
    return patternWords.some(pw => 
      keyWords.some(kw => kw.includes(pw) || pw.includes(kw))
    );
  });
};

// Comprehensive section assignment using regex patterns
// Matches fields to sections based on common field naming patterns across forms
const assignFieldToSection = (fieldKey: string): string => {
  const key = fieldKey.toLowerCase().replace(/[-_\s]+/g, '_');
  
  // Order matters! More specific patterns should come first
  const sectionRules: Array<{ patterns: RegExp[]; section: string }> = [
    // Prescriber/Provider - must come before patient to catch prescriber_* fields
    {
      patterns: [
        /prescrib(er|ing)|physician|doctor|provider_/i,
        /^(hcp|npi|dea|clinic|facility)_/i,
        /office_(contact|manager|phone|fax|address)/i,
        /medical_license|state_license|tax_id/i,
      ],
      section: 'prescriber_info'
    },
    // Pharmacy
    {
      patterns: [
        /pharmacy/i,
        /ncpdp|dispensing_pharm|specialty_pharm|mail_order_pharm/i,
      ],
      section: 'pharmacy_info'
    },
    // Program & Services
    {
      patterns: [
        /program|service_request/i,
        /benefits_investigation|copay_coupon|co_pay_assist/i,
        /prior_auth|patient_assist|medication_assist/i,
        /appeals|marketplace|eligibility|hub_service/i,
        /reimbursement|advancing_access|support_program/i,
      ],
      section: 'program_services'
    },
    // Medication/Rx
    {
      patterns: [
        /medication|drug_name|rx_|prescription/i,
        /dosage|strength|frequency|quantity|refill/i,
        /days_supply|ndc_|directions|indication/i,
        /therapy|treatment(?!_history)/i,
      ],
      section: 'medication_prescribed'
    },
    // Insurance
    {
      patterns: [
        /insurance|member_id|group_number|policy/i,
        /subscriber|payer|carrier|plan_name|coverage/i,
        /medicaid|medicare|commercial|tricare|va_benefit/i,
        /bin_|pcn_|rxgrp|pharmacy_benefit|pbm/i,
        /primary_ins|secondary_ins|medical_benefit/i,
      ],
      section: 'insurance_information'
    },
    // Financial
    {
      patterns: [
        /income|household_size|family_size|fpl/i,
        /financial(?!_assist)|afford|hardship/i,
        /deductible|out_of_pocket|coinsurance|premium/i,
        /employment|employer_/i,
      ],
      section: 'patient_financial'
    },
    // Clinical
    {
      patterns: [
        /diagnosis|icd_|icd10|condition/i,
        /allerg|medical_history|lab_result/i,
        /treatment_history|prior_therap|contraindic/i,
        /pregnancy|weight|height|bmi|vital/i,
        /test_result|clinical_note/i,
      ],
      section: 'clinical_info'
    },
    // Contact Authorization / Representative
    {
      patterns: [
        /representative|guardian|power_of_attorney/i,
        /caregiver|authorized(?!_)/i,
        /emergency_contact|emergency_phone|emergency_name/i,
        /hipaa|phi_auth|release_information/i,
        /voicemail_consent|sms_consent|email_consent/i,
      ],
      section: 'contact_authorization'
    },
    // Consent & Signatures
    {
      patterns: [
        /signature|consent|authorization(?!_rep)/i,
        /agreement|acknowledge|attestation/i,
        /date_signed|signed_date|witness/i,
        /opt_in|opt_out|marketing_comm/i,
        /certification|terms|privacy/i,
      ],
      section: 'consent_signatures'
    },
    // Patient Information - comes later to not capture prescriber/provider fields
    {
      patterns: [
        /patient_name|patient_first|patient_last|patient_middle/i,
        /^first_name|^last_name|^middle_name|^full_name/i,
        /dob|date_of_birth|birth_date|age/i,
        /gender|sex|ssn|social_security/i,
        /patient_id|mrn|medical_record/i,
        /patient_phone|patient_email|patient_address/i,
        /patient_city|patient_state|patient_zip/i,
        /home_phone|home_address|mailing_address/i,
        /cell_phone|mobile_phone|work_phone/i,
        /language|preferred_language|best_time_to_call/i,
        /applicant_name|contact_preference/i,
      ],
      section: 'patient_information'
    },
    // Additional/Other - catch-all
    {
      patterns: [
        /notes|comments|additional|other/i,
        /special_instruction|shipping|delivery/i,
        /referral|source|how_heard|reason/i,
        /document_type|form_type|form_name|form_version/i,
      ],
      section: 'additional'
    },
  ];
  
  for (const rule of sectionRules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(key)) {
        return rule.section;
      }
    }
  }
  
  // Default fallback - try to infer from common words
  if (/name|address|phone|email|city|state|zip/.test(key)) {
    if (/prescrib|physician|doctor|provider|office|clinic/.test(key)) {
      return 'prescriber_info';
    }
    if (/pharmacy/.test(key)) {
      return 'pharmacy_info';
    }
    return 'patient_information';
  }
  
  return 'additional'; // Default to additional if no match
};

// Format field name for display
const formatFieldName = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

// Get confidence color
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'text-green-600 bg-green-500/10';
  if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-500/10';
  return 'text-red-600 bg-red-500/10';
};

// Get source badge with specific model info and fallback indication
const getSourceBadge = (source: string, modelUsed?: string, usedFallback?: boolean, fallbackFrom?: string) => {
  const sourceLower = (source || '').toLowerCase();
  const modelLower = (modelUsed || '').toLowerCase();
  const fallbackLabel = usedFallback && fallbackFrom ? ` (↩ ${fallbackFrom})` : '';
  
  // Determine the display based on source and model
  if (sourceLower === 'ocr' || sourceLower === 'google_vision_ocr') {
    return (
      <Badge variant="outline" className="text-[9px] h-4 border-blue-500 bg-blue-500/10 text-blue-600">
        👁️ OCR
      </Badge>
    );
  }
  
  // Check for specific AI models
  if (modelLower.includes('claude') || sourceLower.includes('claude')) {
    return (
      <Badge variant="outline" className={`text-[9px] h-4 border-orange-500 bg-orange-500/10 text-orange-600 ${usedFallback ? 'ring-1 ring-yellow-400' : ''}`}>
        🟠 CLAUDE{fallbackLabel}
      </Badge>
    );
  }
  
  if (modelLower.includes('gemini') || sourceLower.includes('gemini')) {
    return (
      <Badge variant="outline" className={`text-[9px] h-4 border-blue-500 bg-blue-500/10 text-blue-600 ${usedFallback ? 'ring-1 ring-yellow-400' : ''}`}>
        🔵 GEMINI{fallbackLabel}
      </Badge>
    );
  }
  
  if (modelLower.includes('openai') || modelLower.includes('gpt') || sourceLower.includes('openai')) {
    return (
      <Badge variant="outline" className={`text-[9px] h-4 border-green-500 bg-green-500/10 text-green-600 ${usedFallback ? 'ring-1 ring-yellow-400' : ''}`}>
        🟢 GPT{fallbackLabel}
      </Badge>
    );
  }
  
  // Default for vision_ai or nlp without specific model
  const isVisionAI = sourceLower === 'vision_ai' || sourceLower === 'nlp' || sourceLower === 'gemini_vision_ai';
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[9px] h-4",
        isVisionAI ? "border-purple-500 bg-purple-500/10 text-purple-600" : "border-blue-500 bg-blue-500/10 text-blue-600",
        usedFallback ? 'ring-1 ring-yellow-400' : ''
      )}
    >
      {isVisionAI ? '✨ NLP' : '📷 OCR'}{fallbackLabel}
    </Badge>
  );
};

// Field Card component with edit/delete controls
interface FieldCardProps {
  fieldKey: string;
  value: string;
  confidence: number;
  source?: string;
  verified?: boolean;
  usedFallback?: boolean;
  fallbackFrom?: string;
  onEdit?: (key: string, newValue: string) => void;
  onDelete?: (key: string) => void;
  onVerify?: (key: string) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({
  fieldKey,
  value,
  confidence,
  source,
  verified = false,
  usedFallback,
  fallbackFrom,
  onEdit,
  onDelete,
  onVerify
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleSaveEdit = () => {
    if (onEdit && editValue.trim()) {
      onEdit(fieldKey, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(fieldKey);
    }
    setShowDeleteConfirm(false);
  };

  // Check if this is a drug-related field
  const isDrugField = fieldKey.toLowerCase().includes('medication') || 
                      fieldKey.toLowerCase().includes('drug') ||
                      (source || '').includes('prescription');

  return (
    <div 
      className={cn(
        "p-3 rounded-lg border transition-all group relative",
        verified 
          ? "border-green-500/30 bg-green-500/5" 
          : confidence < 0.7 
          ? "border-amber-500/30 bg-amber-500/5" 
          : "border-border bg-muted/30",
        showDeleteConfirm && "ring-2 ring-red-500/50"
      )}
    >
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-background/95 rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium mb-3">Delete this field?</p>
            <div className="flex gap-2 justify-center">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Field Header with Controls */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">
            {formatFieldName(fieldKey)}
          </label>
          {verified && (
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          )}
          {isDrugField && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-blue-300 text-blue-600">
              Drug
            </Badge>
          )}
        </div>
        
        {/* Action Buttons - visible on hover */}
        <div className={cn(
          "flex items-center gap-1 transition-opacity",
          !isEditing && "opacity-0 group-hover:opacity-100"
        )}>
          {!isEditing && onEdit && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
              title="Edit value"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          {!isEditing && onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete field"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          {!isEditing && onVerify && !verified && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-green-600 hover:text-green-700"
              onClick={() => onVerify(fieldKey)}
              title="Mark as verified"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Value Display or Edit Mode */}
      {isEditing ? (
        <div className="flex gap-2 items-center">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-green-600"
            onClick={handleSaveEdit}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleCancelEdit}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <p className="font-medium text-sm break-words">{value}</p>
      )}

      {/* Source and Confidence Badges */}
      <div className="flex items-center gap-2 mt-2">
        {getSourceBadge(source || '', undefined, usedFallback, fallbackFrom)}
        <Badge 
          variant="secondary" 
          className={cn("text-[9px]", getConfidenceColor(confidence))}
        >
          {Math.round(confidence * 100)}%
        </Badge>
      </div>
    </div>
  );
}

export const PatientInfoVerificationPanel: React.FC<PatientInfoVerificationPanelProps> = ({
  job,
  formMapping,
  className,
  onFieldEdit,
  onFieldDelete,
  onFieldVerify
}) => {
  // Build proper image source - now supports full data URL directly
  const getImageSrc = () => {
    // image_base64 now stores the full data URL (data:mime/type;base64,...)
    if (job.image_base64) {
      return job.image_base64;
    }
    // Fallback to image_url if available
    return job.image_url || null;
  };
  
  const imageSrc = getImageSrc();
  console.log('[PatientInfoVerificationPanel] Image source available:', !!imageSrc, 'from:', imageSrc ? 'base64/url' : 'none');
  
  const signatures = job.extracted_metadata?.signatures || [];
  const detectedSignatures = signatures.filter(s => s.detected);

  // Get all form mapping fields (excluding internal fields)
  // Preserve original extraction order for form sequence matching
  const allFields = formMapping 
    ? Object.entries(formMapping)
        .filter(([key, value]) => {
          // Skip internal fields and special keys
          if (key.startsWith('_')) return false;
          const lowerKey = key.toLowerCase();
          if (['line_items', 'tables', 'detected_document_type', 'document_category', 'raw_text', 'medications', 'medication_count'].includes(lowerKey)) return false;
          
          // Check if value has the expected structure
          if (!value) return false;
          
          // Handle both {value: string} format and direct string values
          const hasValue = typeof value === 'object' && 'value' in value && value.value;
          if (!hasValue) return false;
          
          // Skip ALL medication indexed fields (e.g., medication_1_name, medication_1_quantity, etc.)
          // These are already shown in the Medications section from the medications array
          if (/^medication[_\s]?\d+/i.test(key)) {
            return false;
          }
          
          // Skip standalone medication/prescription fields that duplicate the medications array data
          const duplicateMedicationFields = [
            'medication_name', 'medication_name_type', 'medication_count',
            'strength', 'strength_numeric', 'strength_unit',
            'dosage_form', 'route', 'sig', 'sig_raw', 'sig_translation', 'sig_parsed',
            'quantity', 'quantity_unit', 'refills', 'days_supply',
            'is_controlled', 'ndc', 'daw', 'substitution_allowed'
          ];
          if (duplicateMedicationFields.includes(lowerKey)) {
            return false;
          }
          
          return true;
        })
        .map(([key, value], index) => ({ 
          key, 
          ...value,
          originalOrder: index // Preserve original extraction order
        }))
    : [];
  
  // Log for debugging
  console.log('[PatientInfoVerificationPanel] Form mapping analysis:', {
    hasFormMapping: !!formMapping,
    totalKeys: formMapping ? Object.keys(formMapping).length : 0,
    fieldCount: allFields.length,
    fieldNames: allFields.slice(0, 10).map(f => f.key),
    rawKeys: formMapping ? Object.keys(formMapping).slice(0, 20) : []
  });

  // First, check if formMapping has section info from AI extraction (stored as _sections metadata)
  // This would be a JSON object like { "Patient Information": ["patient_name", "dob"], ... }
  // IMPORTANT: _sections is NOT a standard form field, it's stored as raw data without wrapper
  const sectionsData = formMapping?.['_sections'];
  
  // Handle multiple formats the sections data could be in
  let extractedSections: Record<string, string[]> | undefined;
  
  console.log('[PatientInfoVerificationPanel] Raw _sections data:', {
    type: typeof sectionsData,
    hasSectionsData: !!sectionsData,
    isObject: typeof sectionsData === 'object',
    keys: sectionsData && typeof sectionsData === 'object' ? Object.keys(sectionsData) : 'none',
    sample: sectionsData ? JSON.stringify(sectionsData).substring(0, 200) : 'null'
  });
  
  if (sectionsData) {
    // Format 1: Direct object format { "Section Name": ["field1", "field2"] }
    if (typeof sectionsData === 'object' && !('value' in sectionsData)) {
      // Check if it looks like sections (keys are strings, values are arrays)
      const firstKey = Object.keys(sectionsData)[0];
      const firstValue = firstKey ? (sectionsData as any)[firstKey] : null;
      if (Array.isArray(firstValue)) {
        extractedSections = sectionsData as unknown as Record<string, string[]>;
        console.log('[PatientInfoVerificationPanel] Using direct object format sections');
      }
    }
    
    // Format 2: Wrapped in {value: ...} format
    if (!extractedSections && typeof sectionsData === 'object' && 'value' in sectionsData) {
      try {
        const rawValue = (sectionsData as any).value;
        const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
        if (typeof parsed === 'object' && parsed !== null) {
          extractedSections = parsed as Record<string, string[]>;
          console.log('[PatientInfoVerificationPanel] Parsed sections from value wrapper');
        }
      } catch (e) {
        console.warn('[PatientInfoVerificationPanel] Failed to parse _sections value:', e);
      }
    }
  }
  
  // If no AI-extracted sections, try to generate from field names dynamically
  // This ensures patient onboarding forms get proper sections even without AI section detection
  if (!extractedSections || Object.keys(extractedSections).length === 0) {
    console.log('[PatientInfoVerificationPanel] No AI sections found, generating from field patterns');
    
    // Generate sections dynamically from field names for better UX
    extractedSections = {};
    for (const field of allFields) {
      const sectionId = assignFieldToSection(field.key);
      const sectionConfig = FIELD_SECTIONS.find(s => s.id === sectionId);
      const sectionTitle = sectionConfig?.title || 'Additional Information';
      
      if (!extractedSections[sectionTitle]) {
        extractedSections[sectionTitle] = [];
      }
      extractedSections[sectionTitle].push(field.key);
    }
    console.log('[PatientInfoVerificationPanel] Generated sections:', Object.keys(extractedSections));
  }
  
  console.log('[PatientInfoVerificationPanel] Final sections data:', {
    extractedSections: extractedSections ? Object.keys(extractedSections) : 'none',
    sectionCounts: extractedSections ? Object.entries(extractedSections).map(([k, v]) => `${k}: ${v.length}`) : [],
    totalFields: allFields.length
  });
  
  // Organize fields by sections
  const usedFieldKeys = new Set<string>();
  
  let organizedSections: { id: string; title: string; icon: any; fields: typeof allFields }[];
  
  // Get icon for a section name based on keywords
  const getSectionIcon = (sectionName: string): any => {
    const name = sectionName.toLowerCase();
    if (name.includes('patient') && !name.includes('assistance')) return User;
    if (name.includes('prescriber') || name.includes('provider') || name.includes('physician')) return User;
    if (name.includes('insurance') || name.includes('coverage')) return Shield;
    if (name.includes('pharmacy')) return FileText;
    if (name.includes('medication') || name.includes('drug') || name.includes('rx')) return FileText;
    if (name.includes('consent') || name.includes('signature') || name.includes('authorization')) return PenTool;
    if (name.includes('contact') || name.includes('phone') || name.includes('address')) return Phone;
    if (name.includes('financial') || name.includes('income') || name.includes('payment')) return FileText;
    if (name.includes('clinical') || name.includes('diagnosis') || name.includes('medical')) return FileText;
    if (name.includes('program') || name.includes('service') || name.includes('support')) return Shield;
    return FileText;
  };
  
  if (extractedSections && Object.keys(extractedSections).length > 0) {
    console.log('[PatientInfoVerificationPanel] Using AI-extracted sections:', Object.keys(extractedSections));
    
    // Use AI-extracted sections - these match the actual form structure
    organizedSections = Object.entries(extractedSections).map(([sectionName, fieldKeys]) => {
      // Ensure fieldKeys is an array
      const keys = Array.isArray(fieldKeys) ? fieldKeys : [];
      
      const sectionFields = keys
        .map(fieldKey => allFields.find(f => f.key === fieldKey))
        .filter((f): f is NonNullable<typeof f> => !!f && !usedFieldKeys.has(f.key))
        .map(f => {
          usedFieldKeys.add(f.key);
          return f;
        });
      
      return {
        id: sectionName.toLowerCase().replace(/\s+/g, '_'),
        title: sectionName,
        icon: getSectionIcon(sectionName),
        fields: sectionFields
      };
    }).filter(section => section.fields.length > 0);
  } else {
    // Use the comprehensive assignFieldToSection function to categorize all fields
    // This ensures every field gets assigned to an appropriate section
    
    // First pass: assign ALL fields to sections using regex-based matching
    const fieldToSection = new Map<string, string>();
    allFields.forEach(field => {
      const assignedSection = assignFieldToSection(field.key);
      fieldToSection.set(field.key, assignedSection);
    });
    
    // Log field assignments for debugging
    console.log('[PatientInfoVerificationPanel] Field assignments:', 
      Object.fromEntries(fieldToSection)
    );
    
    // Build sections based on assignments
    organizedSections = FIELD_SECTIONS.map(section => {
      const sectionFields = allFields
        .filter(field => {
          if (usedFieldKeys.has(field.key)) return false;
          
          const assignedSection = fieldToSection.get(field.key);
          if (assignedSection === section.id) {
            usedFieldKeys.add(field.key);
            return true;
          }
          
          return false;
        });

      return {
        ...section,
        fields: sectionFields
      };
    }).filter(section => section.fields.length > 0);
  }

  // Get unmapped fields (fields not assigned to any section)
  // Sort by original order to maintain form sequence
  const unmappedFields = allFields
    .filter(field => !usedFieldKeys.has(field.key))
    .sort((a, b) => (a.originalOrder || 0) - (b.originalOrder || 0));
  
  // Log section distribution for debugging
  console.log('[PatientInfoVerificationPanel] Field distribution:', {
    totalFields: allFields.length,
    organizedSections: organizedSections.map(s => ({ id: s.id, title: s.title, count: s.fields.length })),
    unmappedCount: unmappedFields.length,
    unmappedFields: unmappedFields.map(f => f.key)
  });

  // Calculate accurate stats
  const totalFields = allFields.length;
  const verifiedCount = allFields.filter(f => f.verified).length;
  const lowConfidenceCount = allFields.filter(f => f.confidence < 0.7).length;
  const highConfidenceCount = totalFields - lowConfidenceCount;

  // Determine if document is PDF for proper rendering
  const isPdf = job.mime_type === 'application/pdf' || 
                job.file_name?.toLowerCase().endsWith('.pdf') ||
                imageSrc?.startsWith('data:application/pdf');

  return (
    <div className={cn("space-y-4", className)}>
      {/* Document Image/PDF Preview */}
      {imageSrc ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Original Document
              {job.document_type && (
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {job.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
              {isPdf && (
                <Badge variant="secondary" className="text-[10px]">PDF</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {isPdf ? (
              // PDF base64 data URLs don't render in iframes due to browser security
              // Show document info with download/open option
              <div className="relative bg-muted/30 rounded-lg border p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-red-50 rounded-full">
                    <FileText className="h-12 w-12 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{job.file_name}</p>
                    <p className="text-sm text-muted-foreground">PDF Document</p>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={imageSrc}
                      download={job.file_name}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Download PDF
                    </a>
                    <button
                      onClick={() => {
                        // Open PDF in new tab for viewing
                        const newWindow = window.open();
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head><title>${job.file_name}</title></head>
                              <body style="margin:0;padding:0;">
                                <embed src="${imageSrc}" type="application/pdf" width="100%" height="100%" style="position:absolute;top:0;left:0;right:0;bottom:0;" />
                              </body>
                            </html>
                          `);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Open in New Tab
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF preview in-browser is limited. Use the buttons above to view the full document.
                  </p>
                </div>
              </div>
            ) : (
              // Image files use img element
              <div className="relative aspect-[4/3] max-h-[400px] bg-muted/30 rounded-lg overflow-hidden border">
                <img 
                  src={imageSrc}
                  alt={job.file_name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Image failed to load:', imageSrc?.substring(0, 50));
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2 text-center">{job.file_name}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">No image preview available</p>
            <p className="text-xs text-muted-foreground">{job.file_name}</p>
          </CardContent>
        </Card>
      )}

      {/* Signature Detection Alert */}
      {detectedSignatures.length > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <PenTool className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-700">
                  {detectedSignatures.length} Signature{detectedSignatures.length > 1 ? 's' : ''} Detected
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detectedSignatures.map((sig, idx) => (
                    <Badge key={sig.id || idx} variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      {sig.signedBy || `Signature ${idx + 1}`}
                      {sig.signedDate && ` - ${sig.signedDate}`}
                      <span className="ml-1 text-muted-foreground">
                        ({Math.round(sig.confidence * 100)}%)
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No signatures warning */}
      {signatures.length > 0 && detectedSignatures.length === 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-700">
                Signature areas detected but no valid signatures found. Manual verification required.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organized Field Sections */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-4 pr-4">
          {organizedSections.map((section) => {
            const IconComponent = section.icon;
            const verifiedCount = section.fields.filter(f => f.verified).length;
            const lowConfidenceCount = section.fields.filter(f => f.confidence < 0.7).length;

            return (
              <Card key={section.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-primary" />
                      {section.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {section.fields.length} fields
                      </Badge>
                      {verifiedCount > 0 && (
                        <Badge variant="outline" className="text-[10px] border-green-500 bg-green-500/10 text-green-600">
                          {verifiedCount} verified
                        </Badge>
                      )}
                      {lowConfidenceCount > 0 && (
                        <Badge variant="outline" className="text-[10px] border-amber-500 bg-amber-500/10 text-amber-600">
                          {lowConfidenceCount} review
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.fields.map((field) => (
                      <FieldCard
                        key={field.key}
                        fieldKey={field.key}
                        value={field.value}
                        confidence={field.confidence}
                        source={field.source}
                        verified={field.verified}
                        usedFallback={(field as any).usedFallback}
                        fallbackFrom={(field as any).fallbackFrom}
                        onEdit={onFieldEdit}
                        onDelete={onFieldDelete}
                        onVerify={onFieldVerify}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Other Extracted Fields */}
          {unmappedFields.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Other Extracted Fields
                  <Badge variant="secondary" className="text-[10px]">
                    {unmappedFields.length} fields
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unmappedFields.map((field) => (
                    <FieldCard
                      key={field.key}
                      fieldKey={field.key}
                      value={field.value}
                      confidence={field.confidence}
                      source={field.source}
                      verified={field.verified}
                      usedFallback={(field as any).usedFallback}
                      fallbackFrom={(field as any).fallbackFrom}
                      onEdit={onFieldEdit}
                      onDelete={onFieldDelete}
                      onVerify={onFieldVerify}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {organizedSections.length === 0 && unmappedFields.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">No patient information extracted yet</p>
                <p className="text-sm text-muted-foreground">Upload a document to begin extraction</p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Extraction Summary - Consistent Stats */}
      {totalFields > 0 && (
        <>
          <Separator />
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-lg font-bold text-primary">{totalFields}</p>
              <p className="text-[10px] text-muted-foreground">Total Fields</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <p className="text-lg font-bold text-green-600">{highConfidenceCount}</p>
              <p className="text-[10px] text-muted-foreground">High Confidence</p>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <p className="text-lg font-bold text-amber-600">{lowConfidenceCount}</p>
              <p className="text-[10px] text-muted-foreground">Needs Review</p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <p className="text-lg font-bold text-purple-600">{detectedSignatures.length}</p>
              <p className="text-[10px] text-muted-foreground">Signatures</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientInfoVerificationPanel;
