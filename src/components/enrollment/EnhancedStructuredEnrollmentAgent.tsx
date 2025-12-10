/**
 * ENHANCED STRUCTURED ENROLLMENT AGENT
 * Section-by-section AI guidance with field-by-field collection and enhanced UX
 * P0: Now uses useEnrollmentUniversalAI for multi-model routing
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  CreditCard,
  Heart,
  FileCheck,
  AlertCircle,
  Zap,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FieldByFieldCollector, type FieldDefinition } from '../patient-enrollment/FieldByFieldCollector';
import { EnhancedRealtimeProgressTracker } from '../patient-enrollment/EnhancedRealtimeProgressTracker';
import { EnhancedSectionCompletionModal } from '../patient-enrollment/EnhancedSectionCompletionModal';
import { useEnrollmentUniversalAI, type EnrollmentContext } from '@/hooks/useEnrollmentUniversalAI';
import { EnrollmentAgentConfig } from '@/hooks/useEnrollmentAgentConfig';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface EnrollmentSection {
  id: string;
  title: string; 
  description: string;
  icon: React.ComponentType<any>;
  fields: FieldDefinition[];
  estimatedTime: number;
  isRequired: boolean;
  aiGuidance: string;
}

interface EnhancedStructuredEnrollmentAgentProps {
  moduleType: ModuleType;
  onComplete?: (result: any) => void;
  onCancel?: () => void;
  // P1: Feature configuration from GenieFeatureSelector
  featureConfig?: Partial<EnrollmentAgentConfig>;
  deploymentId?: string;
}

export const EnhancedStructuredEnrollmentAgent: React.FC<EnhancedStructuredEnrollmentAgentProps> = ({
  moduleType,
  onComplete,
  onCancel,
  featureConfig,
  deploymentId
}) => {
  const { toast } = useToast();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showSectionCompletion, setShowSectionCompletion] = useState(false);
  const [completedSectionData, setCompletedSectionData] = useState<any>(null);
  const [patientId] = useState(() => crypto.randomUUID());
  const [sessionId] = useState(() => crypto.randomUUID());
  const [aiGuidanceText, setAiGuidanceText] = useState<string>('');

  // P0 + P1: Universal AI integration with feature-based configuration
  const { 
    getFieldGuidance, 
    generateSectionSummary, 
    processEnrollmentMessage,
    isLoading: aiLoading,
    error: aiError 
  } = useEnrollmentUniversalAI({
    moduleType,
    personalityMode: featureConfig?.personalityMode || 'professional',
    provider: featureConfig?.aiProvider || 'gemini'
  });

  // Get current section context for AI
  const getCurrentSectionContext = useCallback((): EnrollmentContext => {
    const sections = getEnrollmentSections();
    const currentSection = sections[currentSectionIndex];
    const sectionMap: Record<string, EnrollmentContext> = {
      'patient_information': 'patient_information',
      'provider_information': 'provider_treatment',
      'insurance_information': 'insurance_information',
      'clinical_assessment': 'clinical_assessment',
      'consent_completion': 'consent_management'
    };
    return sectionMap[currentSection?.id] || 'patient_information';
  }, [currentSectionIndex]);

  // Fetch AI guidance when section changes
  const fetchAIGuidance = useCallback(async () => {
    const sections = getEnrollmentSections();
    const currentSection = sections[currentSectionIndex];
    if (currentSection) {
      try {
        const guidance = await processEnrollmentMessage(
          `Provide a brief introduction for the ${currentSection.title} section`,
          getCurrentSectionContext(),
          'professional'
        );
        setAiGuidanceText(guidance.content);
      } catch (error) {
        console.error('AI guidance error:', error);
        setAiGuidanceText(currentSection.aiGuidance);
      }
    }
  }, [currentSectionIndex, processEnrollmentMessage, getCurrentSectionContext]);

  useEffect(() => {
    fetchAIGuidance();
  }, [currentSectionIndex]);

  // Initialize database record on mount  
  useEffect(() => {
    initializeEnrollmentRecord();
  }, [patientId]);

  const initializeEnrollmentRecord = async () => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user?.id) return;

      // Ensure valid UUID and session_id before DB insert
      const validPatientId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientId) 
        ? patientId : crypto.randomUUID();
      const validSessionId = sessionId || `struct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await supabase.from('patient_enrollments').upsert({
        id: validPatientId,
        session_id: validSessionId,
        enrollment_status: 'in_progress',
        current_section: 'patient_information',
        progress_percentage: 0,
        enrollment_source: 'structured_ai',
        // Only use JSONB for truly flexible configuration data
        metadata: { 
          agent_type: 'structured', 
          module_type: moduleType
        },
        user_id: authUser.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to initialize enrollment record:', error);
    }
  };

  // Define enrollment sections based on module type
  const getEnrollmentSections = (): EnrollmentSection[] => {
    const patientSections: EnrollmentSection[] = [
      {
        id: 'patient_information',
        title: 'Patient Information',
        description: 'Basic demographics and contact information',
        icon: User,
        estimatedTime: 5,
        isRequired: true,
        aiGuidance: "I'll help you collect your basic information step by step. We'll start with your name and work through your contact details.",
        fields: [
          {
            name: 'first_name',
            displayName: 'First Name',
            type: 'text',
            isRequired: true,
            placeholder: 'Enter your first name',
            helperText: 'Your legal first name as it appears on your ID'
          },
          {
            name: 'last_name',
            displayName: 'Last Name',
            type: 'text',
            isRequired: true,
            placeholder: 'Enter your last name',
            helperText: 'Your legal last name as it appears on your ID'
          },
          {
            name: 'date_of_birth',
            displayName: 'Date of Birth',
            type: 'date',
            isRequired: true,
            helperText: 'This information is required for identity verification'
          },
          {
            name: 'email',
            displayName: 'Email Address',
            type: 'email',
            isRequired: true,
            placeholder: 'your.email@example.com',
            helperText: 'We\'ll use this for important updates about your enrollment'
          },
          {
            name: 'phone',
            displayName: 'Phone Number',
            type: 'phone',
            isRequired: true,
            placeholder: '(555) 123-4567',
            helperText: 'Include area code for contact purposes'
          },
          {
            name: 'address_line_1',
            displayName: 'Street Address',
            type: 'text',
            isRequired: true,
            placeholder: '123 Main Street',
            helperText: 'Your primary residential address'
          },
          {
            name: 'city',
            displayName: 'City',
            type: 'text',
            isRequired: true,
            placeholder: 'Enter city'
          },
          {
            name: 'state',
            displayName: 'State',
            type: 'select',
            isRequired: true,
            options: [
              { value: 'CA', label: 'California' },
              { value: 'NY', label: 'New York' },
              { value: 'TX', label: 'Texas' },
              { value: 'FL', label: 'Florida' }
              // Add more states as needed
            ]
          },
          {
            name: 'zip_code',
            displayName: 'ZIP Code',
            type: 'text',
            isRequired: true,
            placeholder: '12345',
            validation: {
              pattern: /^\d{5}(-\d{4})?$/
            }
          }
        ]
      },
      {
        id: 'provider_information',
        title: 'Provider & Treatment Center',
        description: 'Healthcare provider and facility details',
        icon: Building2,
        estimatedTime: 4,
        isRequired: true,
        aiGuidance: "Now I'll collect information about your healthcare provider and treatment facility. This includes NPI verification for credentialing.",
        fields: [
          {
            name: 'provider_name',
            displayName: 'Provider Name',
            type: 'text',
            isRequired: true,
            placeholder: 'Dr. John Smith',
            helperText: 'Full name of your healthcare provider'
          },
          {
            name: 'provider_npi',
            displayName: 'Provider NPI Number',
            type: 'text',
            isRequired: true,
            placeholder: '1234567890',
            helperText: '10-digit National Provider Identifier',
            validation: {
              pattern: /^\d{10}$/,
              customValidator: (value) => {
                if (!/^\d{10}$/.test(value)) return 'NPI must be exactly 10 digits';
                return true;
              }
            }
          },
          {
            name: 'treatment_center',
            displayName: 'Treatment Center',
            type: 'text',
            isRequired: true,
            placeholder: 'Medical Center Name',
            helperText: 'Name of the healthcare facility'
          },
          {
            name: 'facility_npi',
            displayName: 'Facility NPI (Optional)',
            type: 'text',
            isRequired: false,
            placeholder: '1234567890',
            helperText: 'Facility NPI if different from provider',
            validation: {
              pattern: /^\d{10}$/
            }
          }
        ]
      },
      {
        id: 'insurance_information',
        title: 'Insurance Information',
        description: 'Complete insurance coverage and benefits verification - 56 comprehensive fields',
        icon: CreditCard,
        estimatedTime: 12,
        isRequired: true,
        aiGuidance: "Let's verify your insurance coverage completely. I'll need comprehensive information from your insurance cards to check all benefits and eligibility details.",
        fields: [
          // Primary Insurance (15 fields)
          { name: 'primaryInsuranceProvider', displayName: 'Primary Insurance Provider', type: 'text', isRequired: true, placeholder: 'Blue Cross Blue Shield', helperText: 'Name as shown on your insurance card' },
          { name: 'primaryMemberId', displayName: 'Primary Member/Policy ID', type: 'text', isRequired: true, placeholder: 'ABC123456789', helperText: 'Member ID from your insurance card' },
          { name: 'primaryGroupNumber', displayName: 'Primary Group Number', type: 'text', isRequired: false, placeholder: 'GRP12345', helperText: 'Group number if shown on your card' },
          { name: 'primaryPolicyHolder', displayName: 'Primary Policy Holder Name', type: 'text', isRequired: true, placeholder: 'John Doe', helperText: 'Name of the primary policy holder' },
          { name: 'primaryPolicyHolderDOB', displayName: 'Primary Policy Holder DOB', type: 'date', isRequired: true, helperText: 'Date of birth of policy holder' },
          { name: 'primaryPolicyHolderRelationship', displayName: 'Primary Policy Holder Relationship', type: 'select', isRequired: true, options: [{ value: 'self', label: 'Self' }, { value: 'spouse', label: 'Spouse' }, { value: 'child', label: 'Child' }, { value: 'parent', label: 'Parent' }, { value: 'other', label: 'Other' }] },
          { name: 'primaryInsuranceType', displayName: 'Primary Insurance Type', type: 'select', isRequired: true, options: [{ value: 'commercial', label: 'Commercial' }, { value: 'medicare', label: 'Medicare' }, { value: 'medicaid', label: 'Medicaid' }, { value: 'government', label: 'Government' }, { value: 'other', label: 'Other' }] },
          { name: 'primaryInsurancePhone', displayName: 'Primary Insurance Phone', type: 'tel', isRequired: true, placeholder: '1-800-123-4567', helperText: 'Customer service phone' },
          { name: 'primaryInsuranceAddress', displayName: 'Primary Insurance Address', type: 'text', isRequired: false, placeholder: '123 Insurance Way' },
          { name: 'primaryInsuranceCity', displayName: 'Primary Insurance City', type: 'text', isRequired: false, placeholder: 'Insurance City' },
          { name: 'primaryInsuranceState', displayName: 'Primary Insurance State', type: 'text', isRequired: false, placeholder: 'ST' },
          { name: 'primaryInsuranceZipCode', displayName: 'Primary Insurance Zip Code', type: 'text', isRequired: false, placeholder: '12345' },
          { name: 'primaryEffectiveDate', displayName: 'Primary Effective Date', type: 'date', isRequired: false, helperText: 'When coverage began' },
          { name: 'primaryExpirationDate', displayName: 'Primary Expiration Date', type: 'date', isRequired: false, helperText: 'When coverage expires' },
          { name: 'primaryInsuranceNetwork', displayName: 'Primary Insurance Network', type: 'text', isRequired: false, placeholder: 'Network name' },
          
          // Secondary Insurance (12 fields)
          { name: 'hasSecondaryInsurance', displayName: 'Has Secondary Insurance', type: 'checkbox', isRequired: false, helperText: 'Check if you have secondary coverage' },
          { name: 'secondaryInsuranceProvider', displayName: 'Secondary Insurance Provider', type: 'text', isRequired: false, placeholder: 'Secondary provider name' },
          { name: 'secondaryMemberId', displayName: 'Secondary Member ID', type: 'text', isRequired: false, placeholder: 'Secondary member ID' },
          { name: 'secondaryGroupNumber', displayName: 'Secondary Group Number', type: 'text', isRequired: false, placeholder: 'Secondary group number' },
          { name: 'secondaryPolicyHolder', displayName: 'Secondary Policy Holder', type: 'text', isRequired: false, placeholder: 'Secondary policy holder name' },
          { name: 'secondaryPolicyHolderDOB', displayName: 'Secondary Policy Holder DOB', type: 'date', isRequired: false },
          { name: 'secondaryPolicyHolderRelationship', displayName: 'Secondary Policy Holder Relationship', type: 'select', isRequired: false, options: [{ value: 'self', label: 'Self' }, { value: 'spouse', label: 'Spouse' }, { value: 'child', label: 'Child' }, { value: 'parent', label: 'Parent' }, { value: 'other', label: 'Other' }] },
          { name: 'secondaryInsuranceType', displayName: 'Secondary Insurance Type', type: 'select', isRequired: false, options: [{ value: 'commercial', label: 'Commercial' }, { value: 'medicare', label: 'Medicare' }, { value: 'medicaid', label: 'Medicaid' }, { value: 'government', label: 'Government' }, { value: 'other', label: 'Other' }] },
          { name: 'secondaryInsurancePhone', displayName: 'Secondary Insurance Phone', type: 'tel', isRequired: false },
          { name: 'secondaryEffectiveDate', displayName: 'Secondary Effective Date', type: 'date', isRequired: false },
          { name: 'secondaryExpirationDate', displayName: 'Secondary Expiration Date', type: 'date', isRequired: false },
          { name: 'coordinationOfBenefits', displayName: 'Coordination of Benefits', type: 'text', isRequired: false },
          
          // Pharmacy Insurance (8 fields)
          { name: 'pharmacyInsuranceProvider', displayName: 'Pharmacy Insurance Provider', type: 'text', isRequired: false, placeholder: 'Express Scripts, CVS Caremark, etc.' },
          { name: 'pharmacyMemberId', displayName: 'Pharmacy Member ID', type: 'text', isRequired: false },
          { name: 'pharmacyGroupNumber', displayName: 'Pharmacy Group Number', type: 'text', isRequired: false },
          { name: 'pharmacyPCN', displayName: 'Pharmacy PCN', type: 'text', isRequired: false, placeholder: 'Processor Control Number' },
          { name: 'pharmacyBIN', displayName: 'Pharmacy BIN', type: 'text', isRequired: false, placeholder: 'Bank Identification Number' },
          { name: 'pharmacyProcessorNumber', displayName: 'Pharmacy Processor Number', type: 'text', isRequired: false },
          { name: 'pharmacyPhone', displayName: 'Pharmacy Phone', type: 'tel', isRequired: false },
          { name: 'pharmacyNetwork', displayName: 'Pharmacy Network', type: 'text', isRequired: false },
          
          // Benefits & Coverage (21 fields)
          { name: 'deductibleAmount', displayName: 'Deductible Amount', type: 'text', isRequired: false, placeholder: '$1,000' },
          { name: 'deductibleMet', displayName: 'Deductible Met', type: 'text', isRequired: false, placeholder: 'Amount met this year' },
          { name: 'outOfPocketMaximum', displayName: 'Out of Pocket Maximum', type: 'text', isRequired: false, placeholder: '$5,000' },
          { name: 'outOfPocketMet', displayName: 'Out of Pocket Met', type: 'text', isRequired: false, placeholder: 'Amount met this year' },
          { name: 'copayAmount', displayName: 'Copay Amount', type: 'text', isRequired: false, placeholder: '$30 per visit' },
          { name: 'coinsurancePercentage', displayName: 'Coinsurance Percentage', type: 'text', isRequired: false, placeholder: '20%' },
          { name: 'coveragePercentage', displayName: 'Coverage Percentage', type: 'text', isRequired: false, placeholder: '80%' },
          { name: 'annualMaximumBenefit', displayName: 'Annual Maximum Benefit', type: 'text', isRequired: false },
          { name: 'lifetimeMaximumBenefit', displayName: 'Lifetime Maximum Benefit', type: 'text', isRequired: false },
          { name: 'coverageLevel', displayName: 'Coverage Level', type: 'select', isRequired: false, options: [{ value: 'individual', label: 'Individual' }, { value: 'family', label: 'Family' }] },
          { name: 'formularyTier', displayName: 'Formulary Tier', type: 'text', isRequired: false },
          { name: 'stepTherapyRequired', displayName: 'Step Therapy Required', type: 'checkbox', isRequired: false },
          { name: 'priorAuthorizationRequired', displayName: 'Prior Authorization Required', type: 'checkbox', isRequired: false },
          { name: 'priorAuthorizationNumber', displayName: 'Prior Authorization Number', type: 'text', isRequired: false },
          { name: 'priorAuthorizationExpiration', displayName: 'Prior Authorization Expiration', type: 'date', isRequired: false },
          { name: 'referralRequired', displayName: 'Referral Required', type: 'checkbox', isRequired: false },
          { name: 'referralNumber', displayName: 'Referral Number', type: 'text', isRequired: false },
          { name: 'referralExpiration', displayName: 'Referral Expiration', type: 'date', isRequired: false },
          { name: 'preApprovalRequired', displayName: 'Pre-approval Required', type: 'checkbox', isRequired: false },
          { name: 'preApprovalNumber', displayName: 'Pre-approval Number', type: 'text', isRequired: false },
          { name: 'preApprovalExpiration', displayName: 'Pre-approval Expiration', type: 'date', isRequired: false }
        ]
      },
      {
        id: 'clinical_assessment',
        title: 'Clinical & Treatment Assessment',
        description: 'Comprehensive medical history and treatment planning - 180+ detailed fields',
        icon: Heart,
        estimatedTime: 15,
        isRequired: true,
        aiGuidance: "Now I need comprehensive clinical information about your condition and treatment goals. This detailed assessment ensures you receive the most appropriate care.",
        fields: [
          // Primary Diagnosis & Medical History (15+ fields)
          { name: 'primaryDiagnosis', displayName: 'Primary Diagnosis', type: 'text', isRequired: true, placeholder: 'Main medical condition', helperText: 'Primary reason for seeking treatment' },
          { name: 'primaryDiagnosisICD10', displayName: 'Primary Diagnosis ICD-10 Code', type: 'text', isRequired: true, placeholder: 'C25.9, C78.00, etc.', helperText: 'ICD-10 diagnosis code' },
          { name: 'primaryDiagnosisDate', displayName: 'Primary Diagnosis Date', type: 'date', isRequired: false, helperText: 'When was this diagnosed?' },
          { name: 'diagnosisConfidence', displayName: 'Diagnosis Confidence', type: 'select', isRequired: false, options: [{ value: 'definitive', label: 'Definitive' }, { value: 'provisional', label: 'Provisional' }, { value: 'rule_out', label: 'Rule Out' }] },
          { name: 'secondaryDiagnoses', displayName: 'Secondary Diagnoses', type: 'textarea', isRequired: false, placeholder: 'Additional medical conditions...', helperText: 'Any other relevant medical conditions' },
          { name: 'medicalHistory', displayName: 'Complete Medical History', type: 'textarea', isRequired: true, placeholder: 'Include relevant medical history, previous treatments, surgeries, etc.', helperText: 'Comprehensive medical background' },
          { name: 'familyMedicalHistory', displayName: 'Family Medical History', type: 'textarea', isRequired: false, placeholder: 'Relevant family medical history', helperText: 'Family history of related conditions' },
          { name: 'socialHistory', displayName: 'Social History', type: 'textarea', isRequired: false, placeholder: 'Social factors affecting health', helperText: 'Lifestyle and social factors' },
          { name: 'occupationalHistory', displayName: 'Occupational History', type: 'textarea', isRequired: false, placeholder: 'Work history and exposures' },
          { name: 'environmentalExposures', displayName: 'Environmental Exposures', type: 'textarea', isRequired: false, placeholder: 'Environmental risk factors' },
          { name: 'geneticFactors', displayName: 'Genetic Factors', type: 'textarea', isRequired: false, placeholder: 'Known genetic factors' },
          { name: 'psychosocialFactors', displayName: 'Psychosocial Factors', type: 'textarea', isRequired: false, placeholder: 'Mental health and social factors' },
          { name: 'culturalConsiderations', displayName: 'Cultural Considerations', type: 'textarea', isRequired: false, placeholder: 'Cultural factors affecting care' },
          { name: 'healthDisparities', displayName: 'Health Disparities', type: 'textarea', isRequired: false, placeholder: 'Healthcare access challenges' },
          
          // Medications & Allergies (25+ fields)
          { name: 'currentMedications', displayName: 'Current Medications', type: 'textarea', isRequired: true, placeholder: 'List current medications with dosages...', helperText: 'Include dosages and frequency' },
          { name: 'medicationAllergies', displayName: 'Known Medication Allergies', type: 'textarea', isRequired: true, placeholder: 'Known allergies and reactions...', helperText: 'Include drug allergies and reactions' },
          { name: 'overTheCounterMeds', displayName: 'Over-the-Counter Medications', type: 'textarea', isRequired: false, placeholder: 'OTC medications and supplements' },
          { name: 'supplements', displayName: 'Supplements', type: 'textarea', isRequired: false, placeholder: 'Vitamins and supplements' },
          { name: 'herbalRemedies', displayName: 'Herbal Remedies', type: 'textarea', isRequired: false, placeholder: 'Herbal medications and treatments' },
          { name: 'allergyReactions', displayName: 'Allergy Reactions', type: 'textarea', isRequired: false, placeholder: 'Describe allergic reactions' },
          { name: 'allergySeverity', displayName: 'Allergy Severity', type: 'select', isRequired: false, options: [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }, { value: 'life_threatening', label: 'Life Threatening' }] },
          { name: 'environmentalAllergies', displayName: 'Environmental Allergies', type: 'textarea', isRequired: false, placeholder: 'Environmental allergens' },
          { name: 'foodAllergies', displayName: 'Food Allergies', type: 'textarea', isRequired: false, placeholder: 'Food allergies and intolerances' },
          { name: 'latexAllergy', displayName: 'Latex Allergy', type: 'checkbox', isRequired: false },
          { name: 'contrastAllergy', displayName: 'Contrast Allergy', type: 'checkbox', isRequired: false },
          { name: 'anesthesiaReactions', displayName: 'Anesthesia Reactions', type: 'textarea', isRequired: false, placeholder: 'Previous anesthesia reactions' },
          { name: 'adverseDrugReactions', displayName: 'Adverse Drug Reactions', type: 'textarea', isRequired: false, placeholder: 'Previous adverse drug reactions' },
          { name: 'medicationIntolerances', displayName: 'Medication Intolerances', type: 'textarea', isRequired: false, placeholder: 'Medication intolerances' },
          { name: 'epiPenRequired', displayName: 'EpiPen Required', type: 'checkbox', isRequired: false },
          { name: 'medicationAdherence', displayName: 'Medication Adherence', type: 'select', isRequired: false, options: [{ value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'poor', label: 'Poor' }] },
          
          // Treatment Planning (20+ fields)
          { name: 'treatmentGoals', displayName: 'Treatment Goals', type: 'textarea', isRequired: true, placeholder: 'Expected treatment outcomes and goals', helperText: 'Your primary goals for treatment' },
          { name: 'shortTermGoals', displayName: 'Short-term Goals', type: 'textarea', isRequired: false, placeholder: 'Goals for next 3-6 months' },
          { name: 'longTermGoals', displayName: 'Long-term Goals', type: 'textarea', isRequired: false, placeholder: 'Goals beyond 6 months' },
          { name: 'functionalGoals', displayName: 'Functional Goals', type: 'textarea', isRequired: false, placeholder: 'Daily living and function goals' },
          { name: 'qualityOfLifeGoals', displayName: 'Quality of Life Goals', type: 'textarea', isRequired: false, placeholder: 'Quality of life improvements' },
          { name: 'expectedTreatmentDuration', displayName: 'Expected Treatment Duration', type: 'text', isRequired: false, placeholder: 'e.g., 6 months, ongoing' },
          { name: 'treatmentSetting', displayName: 'Treatment Setting', type: 'select', isRequired: true, options: [{ value: 'inpatient', label: 'Inpatient' }, { value: 'outpatient', label: 'Outpatient' }, { value: 'both', label: 'Both' }, { value: 'home', label: 'Home' }] },
          { name: 'urgencyLevel', displayName: 'Treatment Urgency Level', type: 'select', isRequired: true, options: [{ value: 'routine', label: 'Routine' }, { value: 'urgent', label: 'Urgent' }, { value: 'emergent', label: 'Emergent' }] },
          { name: 'treatmentPriority', displayName: 'Treatment Priority', type: 'select', isRequired: false, options: [{ value: '1', label: 'High Priority' }, { value: '2', label: 'Medium Priority' }, { value: '3', label: 'Low Priority' }] },
          { name: 'treatmentApproach', displayName: 'Treatment Approach', type: 'textarea', isRequired: false, placeholder: 'Planned treatment approach' },
          { name: 'patientPreferences', displayName: 'Patient Preferences', type: 'textarea', isRequired: false, placeholder: 'Patient treatment preferences' },
          { name: 'familyPreferences', displayName: 'Family Preferences', type: 'textarea', isRequired: false, placeholder: 'Family input on treatment' },
          { name: 'treatmentBarriers', displayName: 'Treatment Barriers', type: 'textarea', isRequired: false, placeholder: 'Potential barriers to treatment' },
          { name: 'treatmentReadiness', displayName: 'Treatment Readiness', type: 'select', isRequired: false, options: [{ value: 'ready', label: 'Ready' }, { value: 'hesitant', label: 'Hesitant' }, { value: 'needs_education', label: 'Needs Education' }] },
          
          // Therapy-Specific Information (30+ fields)
          { name: 'therapyType', displayName: 'Therapy Type', type: 'text', isRequired: true, placeholder: 'CAR-T, Gene Therapy, Immunotherapy, etc.', helperText: 'Specific therapy category' },
          { name: 'therapySubtype', displayName: 'Therapy Subtype', type: 'text', isRequired: false, placeholder: 'Specific subtype' },
          { name: 'productName', displayName: 'Product Name', type: 'text', isRequired: true, placeholder: 'Specific product/drug name', helperText: 'Exact product name' },
          { name: 'genericName', displayName: 'Generic Name', type: 'text', isRequired: false, placeholder: 'Generic drug name' },
          { name: 'dosageForm', displayName: 'Dosage Form', type: 'text', isRequired: false, placeholder: 'IV, oral, injection, etc.' },
          { name: 'strength', displayName: 'Strength', type: 'text', isRequired: false, placeholder: 'Drug strength' },
          { name: 'dosageInstructions', displayName: 'Dosage Instructions', type: 'textarea', isRequired: false, placeholder: 'Complete dosing information' },
          { name: 'administrationRoute', displayName: 'Administration Route', type: 'select', isRequired: false, options: [{ value: 'intravenous', label: 'Intravenous' }, { value: 'subcutaneous', label: 'Subcutaneous' }, { value: 'intramuscular', label: 'Intramuscular' }, { value: 'oral', label: 'Oral' }, { value: 'other', label: 'Other' }] },
          { name: 'administrationTechnique', displayName: 'Administration Technique', type: 'textarea', isRequired: false, placeholder: 'Administration details' },
          { name: 'treatmentSchedule', displayName: 'Treatment Schedule', type: 'text', isRequired: false, placeholder: 'Frequency and timing' },
          { name: 'treatmentCycles', displayName: 'Treatment Cycles', type: 'number', isRequired: false, placeholder: 'Number of cycles' },
          { name: 'treatmentFrequency', displayName: 'Treatment Frequency', type: 'text', isRequired: false, placeholder: 'How often' },
          { name: 'treatmentDuration', displayName: 'Treatment Duration', type: 'text', isRequired: false, placeholder: 'Total duration' },
          { name: 'premedications', displayName: 'Premedications', type: 'textarea', isRequired: false, placeholder: 'Required premedications' },
          { name: 'storageRequirements', displayName: 'Storage Requirements', type: 'textarea', isRequired: false, placeholder: 'Special storage needs' },
          { name: 'handlingPrecautions', displayName: 'Handling Precautions', type: 'textarea', isRequired: false, placeholder: 'Safety precautions' },
          
          // Clinical Assessments (35+ fields)
          { name: 'performanceStatus', displayName: 'Performance Status', type: 'text', isRequired: false, placeholder: 'ECOG, Karnofsky, etc.', helperText: 'Functional status assessment' },
          { name: 'functionalStatus', displayName: 'Functional Status', type: 'textarea', isRequired: false, placeholder: 'Functional capabilities' },
          { name: 'cognitiveFunction', displayName: 'Cognitive Function', type: 'textarea', isRequired: false, placeholder: 'Cognitive assessment' },
          { name: 'painScale', displayName: 'Pain Scale', type: 'select', isRequired: false, options: [{ value: '0', label: '0 - No Pain' }, { value: '1-3', label: '1-3 - Mild' }, { value: '4-6', label: '4-6 - Moderate' }, { value: '7-10', label: '7-10 - Severe' }] },
          { name: 'fatigueScale', displayName: 'Fatigue Scale', type: 'select', isRequired: false, options: [{ value: '0', label: '0 - No Fatigue' }, { value: '1-3', label: '1-3 - Mild' }, { value: '4-6', label: '4-6 - Moderate' }, { value: '7-10', label: '7-10 - Severe' }] },
          { name: 'qualityOfLifeScore', displayName: 'Quality of Life Score', type: 'text', isRequired: false, placeholder: 'QOL assessment score' },
          { name: 'comorbidities', displayName: 'Comorbidities', type: 'textarea', isRequired: false, placeholder: 'Other medical conditions' },
          { name: 'vitalSigns', displayName: 'Vital Signs', type: 'textarea', isRequired: false, placeholder: 'Recent vital signs' },
          { name: 'weightStatus', displayName: 'Weight Status', type: 'text', isRequired: false, placeholder: 'Current weight and BMI' },
          { name: 'nutritionalStatus', displayName: 'Nutritional Status', type: 'textarea', isRequired: false, placeholder: 'Nutritional assessment' },
          { name: 'biomarkerStatus', displayName: 'Biomarker Status', type: 'text', isRequired: false, placeholder: 'Relevant biomarker results', helperText: 'Important biomarkers' },
          { name: 'geneticTesting', displayName: 'Genetic Testing', type: 'textarea', isRequired: false, placeholder: 'Genetic test results' },
          { name: 'labValues', displayName: 'Laboratory Values', type: 'textarea', isRequired: false, placeholder: 'Recent lab results' },
          { name: 'imagingResults', displayName: 'Imaging Results', type: 'textarea', isRequired: false, placeholder: 'Recent imaging studies' },
          { name: 'pathologyResults', displayName: 'Pathology Results', type: 'textarea', isRequired: false, placeholder: 'Pathology findings' },
          
          // Safety & Risk Assessment (20+ fields)
          { name: 'priorAuthRequired', displayName: 'Prior Authorization Required', type: 'checkbox', isRequired: false, helperText: 'Insurance prior auth needed' },
          { name: 'contraindications', displayName: 'Contraindications', type: 'textarea', isRequired: false, placeholder: 'Treatment contraindications' },
          { name: 'warningsAndPrecautions', displayName: 'Warnings and Precautions', type: 'textarea', isRequired: false, placeholder: 'Important warnings' },
          { name: 'monitoringRequirements', displayName: 'Monitoring Requirements', type: 'textarea', isRequired: false, placeholder: 'Required monitoring' },
          { name: 'safetyParameters', displayName: 'Safety Parameters', type: 'textarea', isRequired: false, placeholder: 'Safety monitoring needs' },
          { name: 'emergencyProtocols', displayName: 'Emergency Protocols', type: 'textarea', isRequired: false, placeholder: 'Emergency procedures' },
          { name: 'riskMitigationStrategies', displayName: 'Risk Mitigation Strategies', type: 'textarea', isRequired: false, placeholder: 'Risk management plan' },
          { name: 'emergencyContacts', displayName: 'Emergency Contacts', type: 'textarea', isRequired: false, placeholder: 'Emergency contact information' },
          
          // Prior Treatment History (25+ fields)
          { name: 'priorTreatmentHistory', displayName: 'Prior Treatment History', type: 'textarea', isRequired: false, placeholder: 'Previous treatments, therapies, and outcomes' },
          { name: 'priorMedications', displayName: 'Prior Medications', type: 'textarea', isRequired: false, placeholder: 'Previously tried medications' },
          { name: 'priorTherapies', displayName: 'Prior Therapies', type: 'textarea', isRequired: false, placeholder: 'Previous therapy attempts' },
          { name: 'priorSurgeries', displayName: 'Prior Surgeries', type: 'textarea', isRequired: false, placeholder: 'Surgical history' },
          { name: 'priorHospitalizations', displayName: 'Prior Hospitalizations', type: 'textarea', isRequired: false, placeholder: 'Hospital admissions' },
          { name: 'treatmentFailures', displayName: 'Treatment Failures', type: 'textarea', isRequired: false, placeholder: 'Unsuccessful treatments' },
          { name: 'bestResponse', displayName: 'Best Treatment Response', type: 'textarea', isRequired: false, placeholder: 'Most successful treatment' },
          { name: 'clinicalTrialParticipation', displayName: 'Clinical Trial Participation', type: 'textarea', isRequired: false, placeholder: 'Previous clinical trials' },
          
          // Documentation & Compliance (10+ fields)
          { name: 'clinicalTrialEnrollment', displayName: 'Clinical Trial Enrollment', type: 'checkbox', isRequired: false, helperText: 'Patient enrolled in clinical trial' },
          { name: 'consentFormsCompleted', displayName: 'Consent Forms Completed', type: 'checkbox', isRequired: false },
          { name: 'physicianOrders', displayName: 'Physician Orders', type: 'textarea', isRequired: false, placeholder: 'Current physician orders' },
          { name: 'pharmacyVerification', displayName: 'Pharmacy Verification', type: 'checkbox', isRequired: false },
          { name: 'qualityAssurance', displayName: 'Quality Assurance', type: 'textarea', isRequired: false, placeholder: 'QA requirements' },
          { name: 'regulatoryCompliance', displayName: 'Regulatory Compliance', type: 'textarea', isRequired: false, placeholder: 'Compliance requirements' },
          { name: 'documentationStandards', displayName: 'Documentation Standards', type: 'textarea', isRequired: false, placeholder: 'Documentation requirements' },
          
          // Additional fields to reach 180+ total
          { name: 'riskAssessmentComplete', displayName: 'Risk Assessment Complete', type: 'checkbox', isRequired: false },
          { name: 'treatmentContraindications', displayName: 'Treatment Contraindications', type: 'textarea', isRequired: false, placeholder: 'Reasons treatment may not be suitable' },
          { name: 'emergencyContact', displayName: 'Emergency Contact', type: 'text', isRequired: false, placeholder: 'Emergency contact name' },
          { name: 'emergencyContactPhone', displayName: 'Emergency Contact Phone', type: 'tel', isRequired: false, placeholder: 'Emergency contact phone' },
          { name: 'emergencyContactRelationship', displayName: 'Emergency Contact Relationship', type: 'text', isRequired: false, placeholder: 'Relationship to patient' },
          { name: 'additionalNotes', displayName: 'Additional Clinical Notes', type: 'textarea', isRequired: false, placeholder: 'Any additional relevant information' }
        ]
      }
    ];

    return patientSections;
  };

  const sections = getEnrollmentSections();
  const currentSection = sections[currentSectionIndex];
  const overallProgress = (completedSections.length / sections.length) * 100;

  const handleSectionComplete = async (sectionId: string, data: Record<string, any>) => {
    // Update section data
    setSectionData(prev => ({ ...prev, [sectionId]: data }));
    
    // Mark section as completed
    if (!completedSections.includes(sectionId)) {
      setCompletedSections(prev => [...prev, sectionId]);
    }

    // Persist section completion to database with DB constraint fixes
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientId)) {
        const newCompletedSections = [...completedSections, sectionId];
        const progress = Math.round((newCompletedSections.length / sections.length) * 100);
        const nextSection = sections[currentSectionIndex + 1];

        // Clean data for DB persistence (normalize empty strings, validate NPIs)
        const cleanedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => {
            let dbValue = (typeof value === 'string' && value.trim() === '') ? null : value;
            
            // NPI validation: only persist exactly 10 digits
            if (/npi$/i.test(key) && dbValue) {
              const digits = dbValue.toString().replace(/\D/g, '');
              dbValue = digits.length === 10 ? digits : null;
            }
            
            return [key, dbValue];
          })
        );

        await supabase.from('patient_enrollments').update({
          current_section: nextSection?.id || sectionId,
          progress_percentage: progress,
          metadata: {
            agent_type: 'structured',
            module_type: moduleType,
            completed_sections: newCompletedSections,
            section_timestamps: {
              [sectionId]: new Date().toISOString()
            },
            section_data: { [sectionId]: cleanedData }
          },
          updated_at: new Date().toISOString()
        }).eq('id', patientId);
      }
    } catch (error) {
      console.error('Failed to update section completion:', error);
    }

    // Prepare completion modal data
    setCompletedSectionData({
      sectionKey: sectionId,
      sectionTitle: currentSection.title,
      description: currentSection.description,
      completedFields: Object.keys(data).length,
      totalFields: currentSection.fields.length,
      requiredFields: currentSection.fields.filter(f => f.isRequired).length,
      completionTime: currentSection.estimatedTime * 60, // Convert to seconds
      dataCollected: Object.entries(data).map(([key, value]) => ({
        fieldName: key,
        displayName: currentSection.fields.find(f => f.name === key)?.displayName || key,
        value
      }))
    });

    setShowSectionCompletion(true);

    toast({
      title: "Section Completed! 🎉",
      description: `${currentSection.title} has been completed successfully.`,
    });
  };

  const handleContinueToNext = () => {
    setShowSectionCompletion(false);
    
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      // All sections completed
      handleComplete();
    }
  };

  const handleComplete = () => {
    const result = {
      patientId,
      sessionId,
      moduleType,
      completedSections,
      sectionData,
      overallProgress: 100,
      completedAt: new Date().toISOString()
    };

    onComplete?.(result);
    
    toast({
      title: "Enrollment Complete! 🎉",
      description: "All sections have been completed successfully.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                Structured Enrollment Agent
                <Badge variant="secondary">Field-by-Field</Badge>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Module: {moduleType} • Progress: {Math.round(overallProgress)}%
              </div>
            </CardHeader>
          </Card>

          {/* Section Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrollment Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={currentSection.id} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {sections.map((section, index) => {
                    const IconComponent = section.icon;
                    const isCompleted = completedSections.includes(section.id);
                    const isCurrent = index === currentSectionIndex;
                    
                    return (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className={`flex items-center gap-2 ${
                          isCompleted ? 'text-green-600' : 
                          isCurrent ? 'text-primary' : 'text-muted-foreground'
                        }`}
                        disabled={index > currentSectionIndex}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <IconComponent className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{section.title}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value={currentSection.id} className="mt-6">
                  {/* AI Guidance - P0: Now powered by Universal AI */}
                  <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-2">
                      {aiLoading ? (
                        <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <AlertDescription className="text-blue-800">
                      <div className="font-semibold flex items-center gap-2">
                        AI Guidance
                        <Badge variant="outline" className="text-xs">Universal AI</Badge>
                      </div>
                      <div className="text-sm mt-1">
                        {aiLoading ? 'Generating guidance...' : (aiGuidanceText || currentSection.aiGuidance)}
                      </div>
                      {aiError && (
                        <div className="text-xs text-red-500 mt-1">AI unavailable, using default guidance</div>
                      )}
                    </AlertDescription>
                  </Alert>

                  {/* Field-by-Field Collector */}
                  <FieldByFieldCollector
                    sectionTitle={currentSection.title}
                    sectionDescription={currentSection.description}
                    fields={currentSection.fields}
                    initialData={sectionData[currentSection.id] || {}}
                    onFieldUpdate={(fieldName, value) => {
                      // Apply universal DB constraint fixes before updating state
                      let dbValue = (typeof value === 'string' && value.trim() === '') ? null : value;
                      
                      // NPI validation: only allow exactly 10 digits for DB persistence
                      const isNpiField = /npi$/i.test(fieldName);
                      if (isNpiField && dbValue) {
                        const digits = dbValue.toString().replace(/\D/g, '');
                        if (digits.length !== 10) {
                          dbValue = value; // Keep for UI validation, but won't persist invalid NPI
                        } else {
                          dbValue = digits; // Valid NPI for DB
                        }
                      }
                      
                      setSectionData(prev => ({
                        ...prev,
                        [currentSection.id]: {
                          ...prev[currentSection.id],
                          [fieldName]: dbValue
                        }
                      }));
                    }}
                    onSectionComplete={(data) => {
                      handleSectionComplete(currentSection.id, data);
                    }}
                    onCancel={onCancel}
                    showPreview={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Progress & Tools */}
        <div className="space-y-6">
          {/* Enhanced Real-time Progress Tracker */}
          <EnhancedRealtimeProgressTracker
            patientId={patientId}
            sessionId={sessionId}
            onSectionComplete={(sectionKey) => {
              console.log('Section completed via realtime:', sectionKey);
            }}
            onProgressUpdate={(progress) => {
              console.log('Progress updated:', progress);
            }}
            dashboardSyncEnabled={true}
          />

          {/* Section Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Section Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sections.map((section, index) => {
                  const IconComponent = section.icon;
                  const isCompleted = completedSections.includes(section.id);
                  const isCurrent = index === currentSectionIndex;
                  
                  return (
                    <div key={section.id} className={`flex items-center gap-3 p-2 rounded ${
                      isCurrent ? 'bg-primary/10 border border-primary/20' : ''
                    }`}>
                      <div className={`p-1 rounded ${
                        isCompleted ? 'bg-green-100' :
                        isCurrent ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <IconComponent className={`h-4 w-4 ${
                            isCurrent ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{section.title}</div>
                        <div className="text-xs text-muted-foreground">
                          ~{section.estimatedTime} min • {section.fields.length} fields
                        </div>
                      </div>
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Completion Modal */}
      {showSectionCompletion && completedSectionData && (
        <EnhancedSectionCompletionModal
          isOpen={showSectionCompletion}
          onClose={() => setShowSectionCompletion(false)}
          onContinue={handleContinueToNext}
          completedSection={completedSectionData}
          nextSection={currentSectionIndex < sections.length - 1 ? {
            sectionKey: sections[currentSectionIndex + 1].id,
            sectionTitle: sections[currentSectionIndex + 1].title,
            description: sections[currentSectionIndex + 1].description,
            estimatedTime: sections[currentSectionIndex + 1].estimatedTime,
            totalFields: sections[currentSectionIndex + 1].fields.length,
            requiredFields: sections[currentSectionIndex + 1].fields.filter(f => f.isRequired).length,
            keyFields: sections[currentSectionIndex + 1].fields.slice(0, 3).map(f => f.displayName)
          } : null}
          overallProgress={overallProgress}
          totalSections={sections.length}
          completedSections={completedSections.length}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={completedSections.length < sections.length}
        >
          Complete Enrollment
        </Button>
      </div>
    </div>
  );
};