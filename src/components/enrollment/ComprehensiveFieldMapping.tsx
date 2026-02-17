/**
 * COMPREHENSIVE FIELD MAPPING WITH REAL-TIME UPDATES
 * Complete field mapping for all 6 main tabs with AI integration, real-time progress, and dashboard sync
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  User, 
  Building2, 
  CreditCard, 
  Stethoscope, 
  Send,
  Bot,
  MessageSquare,
  Database,
  Settings,
  FileText,
  Check,
  Eye,
  Activity,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useEnrollmentRealtime } from '@/hooks/useEnrollmentRealtime';
import { useToast } from '@/hooks/use-toast';

interface FieldMapping {
  id: string;
  name: string;
  type: 'text' | 'select' | 'checkbox' | 'file' | 'signature' | 'date';
  required: boolean;
  mcpEnabled: boolean;
  conversationalEnabled: boolean;
  structuredEnabled: boolean;
  completion: number;
  lastUpdated?: string;
  validationStatus: 'pending' | 'valid' | 'invalid' | 'processing';
}

interface TabSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  overallCompletion: number;
  totalFields: number;
  completedFields: number;
  fields: FieldMapping[];
  aiIntegration: {
    mcp: { count: number; status: 'active' | 'inactive' };
    conversational: { count: number; status: 'active' | 'inactive' };
    structured: { count: number; status: 'active' | 'inactive' };
  };
}

const COMPREHENSIVE_FIELD_MAPPING: TabSection[] = [
  {
    id: 'consent_mode',
    title: 'Consent Mode',
    icon: Shield,
    description: 'Legal consents and privacy agreements with AI validation',
    overallCompletion: 95,
    totalFields: 12,
    completedFields: 11,
    aiIntegration: {
      mcp: { count: 4, status: 'active' },
      conversational: { count: 4, status: 'active' },
      structured: { count: 4, status: 'active' }
    },
    fields: [
      { id: 'hipaa_consent', name: 'HIPAA Consent Form', type: 'checkbox', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'treatment_consent', name: 'Treatment Consent', type: 'signature', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: false, completion: 100, validationStatus: 'valid' },
      { id: 'privacy_notice', name: 'Privacy Notice Acknowledgment', type: 'checkbox', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 95, validationStatus: 'valid' },
      { id: 'data_sharing_prefs', name: 'Data Sharing Preferences', type: 'select', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'marketing_consent', name: 'Marketing Communications', type: 'checkbox', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 85, validationStatus: 'pending' },
      { id: 'research_participation', name: 'Research Participation', type: 'select', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 88, validationStatus: 'valid' },
      { id: 'financial_consent', name: 'Financial Responsibility', type: 'signature', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'emergency_contact_consent', name: 'Emergency Contact Authorization', type: 'checkbox', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 95, validationStatus: 'valid' },
      { id: 'telemedicine_consent', name: 'Telemedicine Services Consent', type: 'checkbox', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: false, completion: 80, validationStatus: 'valid' },
      { id: 'medication_consent', name: 'Medication Administration Consent', type: 'signature', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'discharge_planning_consent', name: 'Discharge Planning Consent', type: 'checkbox', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 75, validationStatus: 'pending' },
      { id: 'legal_guardian_consent', name: 'Legal Guardian Consent (if applicable)', type: 'signature', required: false, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 90, validationStatus: 'valid' }
    ]
  },
  {
    id: 'patient_info',
    title: 'Patient Information',
    icon: User,
    description: 'Demographics, identity verification, and contact preferences',
    overallCompletion: 92,
    totalFields: 18,
    completedFields: 16,
    aiIntegration: {
      mcp: { count: 6, status: 'active' },
      conversational: { count: 7, status: 'active' },
      structured: { count: 5, status: 'active' }
    },
    fields: [
      { id: 'first_name', name: 'First Name', type: 'text', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'last_name', name: 'Last Name', type: 'text', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'middle_name', name: 'Middle Name', type: 'text', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 85, validationStatus: 'valid' },
      { id: 'date_of_birth', name: 'Date of Birth', type: 'date', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'ssn', name: 'Social Security Number', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'gender', name: 'Gender', type: 'select', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'marital_status', name: 'Marital Status', type: 'select', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'primary_address', name: 'Primary Address', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 95, validationStatus: 'valid' },
      { id: 'phone_primary', name: 'Primary Phone', type: 'text', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'phone_secondary', name: 'Secondary Phone', type: 'text', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 80, validationStatus: 'valid' },
      { id: 'email', name: 'Email Address', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'emergency_contact_name', name: 'Emergency Contact Name', type: 'text', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 95, validationStatus: 'valid' },
      { id: 'emergency_contact_phone', name: 'Emergency Contact Phone', type: 'text', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'emergency_contact_relationship', name: 'Emergency Contact Relationship', type: 'select', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 85, validationStatus: 'valid' },
      { id: 'preferred_language', name: 'Preferred Language', type: 'select', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 88, validationStatus: 'valid' },
      { id: 'photo_id', name: 'Photo ID Upload', type: 'file', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'identity_verification', name: 'Identity Verification Status', type: 'checkbox', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: false, completion: 100, validationStatus: 'valid' },
      { id: 'preferred_contact_method', name: 'Preferred Contact Method', type: 'select', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 75, validationStatus: 'pending' }
    ]
  },
  {
    id: 'provider_treatment_center',
    title: 'Provider & Treatment Center',
    icon: Building2,
    description: 'Healthcare provider verification, facility selection, and referral coordination',
    overallCompletion: 89,
    totalFields: 15,
    completedFields: 13,
    aiIntegration: {
      mcp: { count: 8, status: 'active' },
      conversational: { count: 4, status: 'active' },
      structured: { count: 3, status: 'active' }
    },
    fields: [
      { id: 'primary_provider_npi', name: 'Primary Provider NPI', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'primary_provider_name', name: 'Primary Provider Name', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'provider_specialty', name: 'Provider Specialty', type: 'select', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 95, validationStatus: 'valid' },
      { id: 'provider_license_number', name: 'Provider License Number', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'provider_dea_number', name: 'DEA Registration Number', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'treatment_facility_name', name: 'Treatment Facility Name', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'facility_address', name: 'Facility Address', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 95, validationStatus: 'valid' },
      { id: 'facility_phone', name: 'Facility Phone', type: 'text', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'facility_type', name: 'Facility Type', type: 'select', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 85, validationStatus: 'valid' },
      { id: 'referring_provider', name: 'Referring Provider (if applicable)', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 80, validationStatus: 'valid' },
      { id: 'referral_reason', name: 'Referral Reason', type: 'text', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 75, validationStatus: 'pending' },
      { id: 'preferred_appointment_time', name: 'Preferred Appointment Time', type: 'select', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 70, validationStatus: 'pending' },
      { id: 'transportation_needs', name: 'Transportation Needs', type: 'select', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 65, validationStatus: 'valid' },
      { id: 'accessibility_requirements', name: 'Accessibility Requirements', type: 'text', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 80, validationStatus: 'valid' },
      { id: 'coordination_notes', name: 'Care Coordination Notes', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: false, completion: 85, validationStatus: 'valid' }
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance',
    icon: CreditCard,
    description: 'Insurance verification, benefits analysis, and financial assessment',
    overallCompletion: 91,
    totalFields: 16,
    completedFields: 14,
    aiIntegration: {
      mcp: { count: 8, status: 'active' },
      conversational: { count: 4, status: 'active' },
      structured: { count: 4, status: 'active' }
    },
    fields: [
      { id: 'primary_insurance_company', name: 'Primary Insurance Company', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'policy_number', name: 'Policy Number', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'group_number', name: 'Group Number', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'subscriber_id', name: 'Subscriber ID', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'insurance_card_front', name: 'Insurance Card Front', type: 'file', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 95, validationStatus: 'valid' },
      { id: 'insurance_card_back', name: 'Insurance Card Back', type: 'file', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 95, validationStatus: 'valid' },
      { id: 'secondary_insurance', name: 'Secondary Insurance (if applicable)', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 80, validationStatus: 'valid' },
      { id: 'coverage_effective_date', name: 'Coverage Effective Date', type: 'date', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'copay_amount', name: 'Copay Amount', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 85, validationStatus: 'valid' },
      { id: 'deductible_amount', name: 'Annual Deductible', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 80, validationStatus: 'valid' },
      { id: 'out_of_pocket_max', name: 'Out-of-Pocket Maximum', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 75, validationStatus: 'pending' },
      { id: 'benefits_verification_status', name: 'Benefits Verification Status', type: 'select', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: false, completion: 100, validationStatus: 'valid' },
      { id: 'prior_authorization_required', name: 'Prior Authorization Required', type: 'checkbox', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'financial_assistance_needed', name: 'Financial Assistance Needed', type: 'select', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 70, validationStatus: 'pending' },
      { id: 'payment_plan_interest', name: 'Payment Plan Interest', type: 'select', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 65, validationStatus: 'valid' },
      { id: 'medicaid_number', name: 'Medicaid Number (if applicable)', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 85, validationStatus: 'valid' }
    ]
  },
  {
    id: 'treatment_clinical',
    title: 'Treatment & Clinical',
    icon: Stethoscope,
    description: 'Medical history, clinical assessments, and treatment planning',
    overallCompletion: 87,
    totalFields: 20,
    completedFields: 17,
    aiIntegration: {
      mcp: { count: 7, status: 'active' },
      conversational: { count: 8, status: 'active' },
      structured: { count: 5, status: 'active' }
    },
    fields: [
      { id: 'primary_diagnosis', name: 'Primary Diagnosis', type: 'select', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'secondary_diagnoses', name: 'Secondary Diagnoses', type: 'select', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 85, validationStatus: 'valid' },
      { id: 'current_medications', name: 'Current Medications', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 95, validationStatus: 'valid' },
      { id: 'medication_allergies', name: 'Medication Allergies', type: 'text', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'environmental_allergies', name: 'Environmental Allergies', type: 'text', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 80, validationStatus: 'valid' },
      { id: 'past_medical_history', name: 'Past Medical History', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: false, completion: 90, validationStatus: 'valid' },
      { id: 'surgical_history', name: 'Surgical History', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 75, validationStatus: 'valid' },
      { id: 'family_medical_history', name: 'Family Medical History', type: 'text', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 70, validationStatus: 'pending' },
      { id: 'social_history', name: 'Social History', type: 'text', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: false, completion: 65, validationStatus: 'pending' },
      { id: 'substance_use_history', name: 'Substance Use History', type: 'select', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 85, validationStatus: 'valid' },
      { id: 'mental_health_history', name: 'Mental Health History', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 80, validationStatus: 'valid' },
      { id: 'vital_signs', name: 'Current Vital Signs', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'pain_assessment', name: 'Pain Assessment Scale', type: 'select', required: true, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'functional_assessment', name: 'Functional Assessment', type: 'select', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 75, validationStatus: 'valid' },
      { id: 'treatment_goals', name: 'Treatment Goals', type: 'text', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 85, validationStatus: 'valid' },
      { id: 'treatment_preferences', name: 'Treatment Preferences', type: 'text', required: false, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 70, validationStatus: 'pending' },
      { id: 'advance_directives', name: 'Advance Directives', type: 'file', required: false, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 60, validationStatus: 'valid' },
      { id: 'previous_treatments', name: 'Previous Treatments', type: 'text', required: false, mcpEnabled: true, conversationalEnabled: true, structuredEnabled: true, completion: 80, validationStatus: 'valid' },
      { id: 'clinical_notes', name: 'Clinical Assessment Notes', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: false, completion: 95, validationStatus: 'valid' },
      { id: 'risk_assessment', name: 'Risk Assessment Score', type: 'select', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' }
    ]
  },
  {
    id: 'submit',
    title: 'Submit',
    icon: Send,
    description: 'Final review, validation, and document generation',
    overallCompletion: 88,
    totalFields: 8,
    completedFields: 7,
    aiIntegration: {
      mcp: { count: 4, status: 'active' },
      conversational: { count: 2, status: 'active' },
      structured: { count: 2, status: 'active' }
    },
    fields: [
      { id: 'data_completeness_check', name: 'Data Completeness Validation', type: 'checkbox', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'required_fields_validation', name: 'Required Fields Validation', type: 'checkbox', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 100, validationStatus: 'valid' },
      { id: 'data_quality_score', name: 'Data Quality Assessment', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: false, completion: 95, validationStatus: 'valid' },
      { id: 'patient_final_review', name: 'Patient Final Review Confirmation', type: 'checkbox', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: true, completion: 90, validationStatus: 'valid' },
      { id: 'patient_signature_final', name: 'Patient Final Signature', type: 'signature', required: true, mcpEnabled: false, conversationalEnabled: true, structuredEnabled: false, completion: 85, validationStatus: 'valid' },
      { id: 'pdf_generation_status', name: 'PDF Generation Status', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: false, completion: 100, validationStatus: 'valid' },
      { id: 'document_distribution', name: 'Document Distribution List', type: 'select', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: true, completion: 80, validationStatus: 'valid' },
      { id: 'submission_timestamp', name: 'Submission Timestamp', type: 'text', required: true, mcpEnabled: true, conversationalEnabled: false, structuredEnabled: false, completion: 70, validationStatus: 'pending' }
    ]
  }
];

export const ComprehensiveFieldMapping: React.FC = () => {
  const [activeTab, setActiveTab] = useState('consent_mode');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showRealTimeUpdates, setShowRealTimeUpdates] = useState(true);
  
  // Real-time integration
  const {
    isConnected,
    lastUpdate,
    activeEnrollments,
    sessionData,
    connectionStatus,
    connect,
    disconnect,
    isHealthy
  } = useEnrollmentRealtime();

  const { toast } = useToast();

  useEffect(() => {
    if (showRealTimeUpdates) {
      connect('comprehensive_mapping');
    } else {
      disconnect();
    }
  }, [showRealTimeUpdates, connect, disconnect]);

  // Calculate overall statistics
  const overallStats = {
    totalFields: COMPREHENSIVE_FIELD_MAPPING.reduce((acc, section) => acc + section.totalFields, 0),
    completedFields: COMPREHENSIVE_FIELD_MAPPING.reduce((acc, section) => acc + section.completedFields, 0),
    overallCompletion: Math.round(
      (COMPREHENSIVE_FIELD_MAPPING.reduce((acc, section) => acc + section.overallCompletion, 0) / 
       COMPREHENSIVE_FIELD_MAPPING.length)
    ),
    mcpFields: COMPREHENSIVE_FIELD_MAPPING.reduce((acc, section) => 
      acc + section.fields.filter(f => f.mcpEnabled).length, 0
    ),
    conversationalFields: COMPREHENSIVE_FIELD_MAPPING.reduce((acc, section) => 
      acc + section.fields.filter(f => f.conversationalEnabled).length, 0
    ),
    structuredFields: COMPREHENSIVE_FIELD_MAPPING.reduce((acc, section) => 
      acc + section.fields.filter(f => f.structuredEnabled).length, 0
    )
  };

  const currentSection = COMPREHENSIVE_FIELD_MAPPING.find(s => s.id === activeTab);

  const getAITypeBadge = (field: FieldMapping) => {
    const badges = [];
    if (field.mcpEnabled) badges.push({ type: 'MCP', color: 'bg-blue-500', icon: Database });
    if (field.conversationalEnabled) badges.push({ type: 'Conv', color: 'bg-green-500', icon: MessageSquare });
    if (field.structuredEnabled) badges.push({ type: 'Struct', color: 'bg-purple-500', icon: Settings });
    return badges;
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-50';
      case 'invalid': return 'text-red-600 bg-red-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const handleFieldClick = (fieldId: string) => {
    setSelectedField(fieldId);
    toast({
      title: "Field Selected",
      description: `Selected field: ${fieldId}. Real-time updates active.`
    });
  };

  const toggleRealTimeUpdates = () => {
    setShowRealTimeUpdates(!showRealTimeUpdates);
    toast({
      title: showRealTimeUpdates ? "Real-time Updates Disabled" : "Real-time Updates Enabled",
      description: showRealTimeUpdates ? 
        "Dashboard sync paused" : 
        "Dashboard sync active - updates will reflect in patient onboarding dashboard"
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Comprehensive Field Mapping
          </h1>
          <p className="text-muted-foreground">
            Complete field mapping across 6 tabs | {overallStats.totalFields} total fields | {overallStats.overallCompletion}% completion
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isHealthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
            {isHealthy ? 'Real-time Active' : 'Disconnected'}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRealTimeUpdates}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${showRealTimeUpdates ? 'animate-spin' : ''}`} />
            {showRealTimeUpdates ? 'Pause' : 'Resume'} Updates
          </Button>
          <Button className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View in Dashboard
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{overallStats.totalFields}</div>
            <div className="text-sm text-muted-foreground">Total Fields</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{overallStats.completedFields}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{overallStats.overallCompletion}%</div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{overallStats.mcpFields}</div>
            <div className="text-sm text-muted-foreground">MCP Fields</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{overallStats.conversationalFields}</div>
            <div className="text-sm text-muted-foreground">Conversational</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{overallStats.structuredFields}</div>
            <div className="text-sm text-muted-foreground">Structured</div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status Bar */}
      {showRealTimeUpdates && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-500 text-white">Real-time Active</Badge>
                <span className="text-sm">Last Update: {new Date(lastUpdate).toLocaleTimeString()}</span>
                <span className="text-sm">Active Sessions: {activeEnrollments}</span>
                <span className="text-sm">Status: {connectionStatus}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Syncing with Patient Dashboard & Onboarding Dashboard
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {COMPREHENSIVE_FIELD_MAPPING.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger key={section.id} value={section.id} className="flex flex-col items-center gap-1 py-3">
                <Icon className="h-4 w-4" />
                <div className="text-xs">{section.title}</div>
                <div className="text-xs font-bold">{section.overallCompletion}%</div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {COMPREHENSIVE_FIELD_MAPPING.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                <p className="text-muted-foreground">{section.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={section.overallCompletion} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">{section.overallCompletion}%</span>
                  <span className="text-sm text-muted-foreground">
                    ({section.completedFields}/{section.totalFields} fields)
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* AI Integration Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-sm">MCP Agents</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{section.aiIntegration.mcp.count}</p>
                    <Badge className={`text-xs ${section.aiIntegration.mcp.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {section.aiIntegration.mcp.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-sm">Conversational</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">{section.aiIntegration.conversational.count}</p>
                    <Badge className={`text-xs ${section.aiIntegration.conversational.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {section.aiIntegration.conversational.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold text-sm">Structured</span>
                    </div>
                    <p className="text-xl font-bold text-purple-600">{section.aiIntegration.structured.count}</p>
                    <Badge className={`text-xs ${section.aiIntegration.structured.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {section.aiIntegration.structured.status}
                    </Badge>
                  </div>
                </div>

                {/* Fields List */}
                <div className="space-y-3">
                  {section.fields.map((field) => (
                    <Card 
                      key={field.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedField === field.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleFieldClick(field.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">{field.name}</h4>
                              {field.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              <Badge variant="outline" className={getValidationColor(field.validationStatus)}>
                                {field.validationStatus}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              {getAITypeBadge(field).map((badge, index) => {
                                const Icon = badge.icon;
                                return (
                                  <Badge key={index} className={`${badge.color} text-white text-xs flex items-center gap-1`}>
                                    <Icon className="h-3 w-3" />
                                    {badge.type}
                                  </Badge>
                                );
                              })}
                              <Badge variant="outline" className="text-xs">
                                {field.type}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Progress value={field.completion} className="h-2" />
                              </div>
                              <span className="text-sm font-medium">{field.completion}%</span>
                              {field.completion === 100 && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {showRealTimeUpdates && (
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Universal PDF Generation Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Universal PDF Generation & Dashboard Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Single Edge Function (`generate-enrollment-pdf`):</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Manual Form Submissions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  MCP Agent Generated Forms
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Conversational AI Forms
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Structured AI Forms
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Cross-Application Replication
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Real-time Dashboard Sync:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Patient Onboarding Dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Treatment Center Dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Progress Tracking Across All AI Types
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Section Transition Updates
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Field-Level Completion Status
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};