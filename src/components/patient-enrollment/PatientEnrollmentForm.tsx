/**
 * PATIENT ENROLLMENT FORM COMPONENT
 * Comprehensive form with multiple submission options and collaboration
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  FileText, 
  Download, 
  Send, 
  FileX, 
  Globe,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Bot
} from 'lucide-react';
import { SignatureCapture } from '@/components/signature/SignatureCapture';
import { MultiPartySignature, type Signer } from '@/components/signature/MultiPartySignature';
import { PDFGenerator } from '@/components/signature/PDFGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { EnrollmentJourneySteps } from './EnrollmentJourneySteps';
import { EnhancedProviderSection } from './EnhancedProviderSection';
import { ComprehensiveProviderSection, createEmptyComprehensiveProviderData, type ComprehensiveProviderData } from './ComprehensiveProviderSection';
import { ComprehensiveInsuranceSection, createEmptyComprehensiveInsuranceData, type ComprehensiveInsuranceData } from './ComprehensiveInsuranceSection';
import { ComprehensiveTreatmentAssessment, createEmptyComprehensiveTreatmentAssessmentData, type ComprehensiveTreatmentAssessmentData } from './ComprehensiveTreatmentAssessment';
import { ConsentManagement, type ConsentData } from './ConsentManagement';
import { CollaborationStatus } from './CollaborationStatus';
import { PatientDataPrefill } from './PatientDataPrefill';
import { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';

export interface PatientEnrollmentData {
  // Patient Information
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  preferredLanguage: 'english' | 'spanish' | 'other';
  otherLanguage?: string;
  gender: 'male' | 'female' | 'other';
  otherGender?: string;
  ssn: string;
  email: string;
  
  // Contact Information
  homePhone?: string;
  cellPhone: string;
  alternateContactName?: string;
  alternateContactRelationship?: string;
  alternateContactPhone?: string;
  doNotContactPatient?: boolean;
  
  // Address Information
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Provider Information
  providerId?: string;
  providerName: string;
  providerNpi?: string;
  providerSpecialty?: string;
  treatmentCenterId?: string;
  treatmentCenterName: string;
  treatmentCenterAddress?: string;
  treatmentCenterNpi?: string;
  referralProviderId?: string;
  referralProviderName?: string;
  referralCenterId?: string;
  referralCenterName?: string;
  referralCenterAddress?: string;
  
  // Insurance Information
  medicalInsurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    type: 'government' | 'commercial';
    priority: 'primary' | 'secondary' | 'tertiary';
  };
  pharmacyInsurance?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    type: 'government' | 'commercial';
    priority: 'primary' | 'secondary' | 'tertiary';
  };
  insuranceDocuments: File[];
  
  // Therapy Information
  therapyType: string;
  productDrugInfo: string;
  ndcCodes: Array<{
    code: string;
    description: string;
    dosage: string;
    strength: string;
  }>;
  distribution: '3pl' | 'sd' | 'sp';
  dateOfApheresis?: string;
  patientIdInternal?: string;
  dateOfInfusion?: string;
  orderIdInternal?: string;
  
  // Clinical Information
  icdCodes: Array<{
    version: 9 | 10;
    code: string;
    description: string;
  }>;
  clinicalDocuments: File[];
  
  // Medical Information (existing)
  primaryPhysician: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  
  // Treatment Information (existing)
  treatmentType: string;
  referralSource: string;
  admissionDate?: string;
  
  // Consent and Authorization
  consentToTreatment: boolean;
  hipaaAuthorization: boolean;
  financialResponsibility: boolean;
  
  // Submission Options
  submissionMethod: 'fax' | 'pdf_submit' | 'online' | 'ai_agent';
  
  // Collaboration
  collaborators: Signer[];
  
  // Provider Consent
  providerConsent?: string;
  providerConsentDate?: string;
  providerConsentBy?: string;
  
  // Provider Contact Information
  providerPhone?: string;
  providerEmail?: string;
  
  // Consent Management
  consentData?: ConsentData;
  
  // Comprehensive Provider Data
  comprehensiveProviderData?: ComprehensiveProviderData;
  
  // Comprehensive Insurance Data
  comprehensiveInsuranceData?: ComprehensiveInsuranceData;
  
  // Comprehensive Treatment Assessment Data
  comprehensiveTreatmentAssessmentData?: ComprehensiveTreatmentAssessmentData;
  
  // Collaboration Status
  collaborationStatus?: {
    currentStage: string;
    pendingWith: string[];
    completedStages: string[];
  };
}

interface PatientEnrollmentFormProps {
  initialData?: Partial<PatientEnrollmentData>;
  onSubmit?: (data: PatientEnrollmentData) => void;
  onSave?: (data: PatientEnrollmentData) => void;
  readOnly?: boolean;
  patientId?: string;
}

type SubmissionMethod = 'fax' | 'pdf_submit' | 'online' | 'ai_agent';

export const PatientEnrollmentForm: React.FC<PatientEnrollmentFormProps> = ({
  initialData,
  onSubmit,
  onSave,
  readOnly = false,
  patientId
}) => {
  const [formData, setFormData] = useState<PatientEnrollmentData>({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    preferredLanguage: 'english',
    otherLanguage: '',
    gender: 'male',
    otherGender: '',
    ssn: '',
    email: '',
    homePhone: '',
    cellPhone: '',
    alternateContactName: '',
    alternateContactRelationship: '',
    alternateContactPhone: '',
    doNotContactPatient: false,
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    providerName: '',
    providerNpi: '',
    providerSpecialty: '',
    treatmentCenterName: '',
    referralProviderName: '',
    referralCenterName: '',
    medicalInsurance: {
      provider: '',
      policyNumber: '',
      groupNumber: '',
      type: 'commercial',
      priority: 'primary'
    },
    insuranceDocuments: [],
    therapyType: '',
    productDrugInfo: '',
    ndcCodes: [],
    distribution: '3pl',
    icdCodes: [],
    clinicalDocuments: [],
    primaryPhysician: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    treatmentType: '',
    referralSource: '',
    admissionDate: '',
    consentToTreatment: false,
    hipaaAuthorization: false,
    financialResponsibility: false,
    submissionMethod: 'online',
    collaborators: [],
    consentData: {
      consentType: 'facility_present',
      // Basic Provider Information (for quick consent)
      providerName: '',
      providerPhone: '',
      providerEmail: '',
      // Treatment Center
      treatmentCenter: '',
      treatmentCenterId: '',
      // Consent Details
      patientConsentStatus: 'pending',
      consentMethod: '',
      consentDate: '',
      consentBy: '',
      verbalConsentWitness: '',
      digitalConsentEmail: '',
      digitalConsentPhone: '',
      providerSignature: '',
      providerConsentDate: '',
      notes: ''
    },
    comprehensiveProviderData: createEmptyComprehensiveProviderData(),
    comprehensiveInsuranceData: createEmptyComprehensiveInsuranceData(),
    comprehensiveTreatmentAssessmentData: createEmptyComprehensiveTreatmentAssessmentData(),
    collaborationStatus: {
      currentStage: 'submission_method',
      pendingWith: [],
      completedStages: []
    },
    ...initialData
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [providerSignature, setProviderSignature] = useState<string | null>(null);
  const [patientSignature, setPatientSignature] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { showSuccess, showError } = useMasterToast();
  const { openEnrollment } = useGlobalConversationalEnrollment();

  // Optional patient consent extras (no validation for quick testing)
  const [householdSize, setHouseholdSize] = useState<string>('');
  const [annualIncome, setAnnualIncome] = useState<string>('');
  const [diseaseEducationConsent, setDiseaseEducationConsent] = useState<boolean>(false);
  const [tcpaConsent, setTcpaConsent] = useState<boolean>(false);

  const totalSteps = 7;
  const stepIds = [
    'submission_method',
    'consent_management',
    'patient_info',
    'provider_info',
    'insurance',
    'treatment_assessment',
    'final_review'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const updateFormData = (field: keyof PatientEnrollmentData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for comprehensive provider data updates
  const handleComprehensiveProviderUpdate = (section: keyof ComprehensiveProviderData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      comprehensiveProviderData: {
        ...prev.comprehensiveProviderData!,
        [section]: {
          ...prev.comprehensiveProviderData![section],
          [field]: value
        }
      }
    }));
  };

  // Handler for comprehensive insurance data updates
  const handleComprehensiveInsuranceUpdate = (field: keyof ComprehensiveInsuranceData, value: any) => {
    setFormData(prev => ({
      ...prev,
      comprehensiveInsuranceData: {
        ...prev.comprehensiveInsuranceData!,
        [field]: value
      }
    }));
  };

  // Handler for comprehensive treatment assessment data updates
  const handleComprehensiveTreatmentAssessmentUpdate = (field: keyof ComprehensiveTreatmentAssessmentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      comprehensiveTreatmentAssessmentData: {
        ...prev.comprehensiveTreatmentAssessmentData!,
        [field]: value
      }
    }));
  };

  const handleSubmissionMethodChange = (method: SubmissionMethod) => {
    console.log('🎯 Submission method selected:', method);
    updateFormData('submissionMethod', method);
    updateCollaborationStatus('consent_management', ['submission_method']);
    
    // Launch AI Agent for conversational enrollment
    if (method === 'ai_agent') {
      console.log('🤖 Launching AI Agent enrollment for patient');
      openEnrollment('patient');
      return;
    }
    
    // Initialize collaborators based on method
    if (method !== 'online') {
      const defaultCollaborators: Signer[] = [
        {
          id: 'intake_coordinator',
          name: '',
          email: '',
          role: 'intake_coordinator',
          order: 1,
          status: 'pending'
        },
        {
          id: 'medical_review',
          name: '',
          email: '',
          role: 'medical_reviewer',
          order: 2,
          status: 'pending'
        }
      ];
      updateFormData('collaborators', defaultCollaborators);
    }

    // Auto-advance to next step
    setCurrentStep(1);
  };

  const updateCollaborationStatus = (currentStage: string, completedStages: string[]) => {
    updateFormData('collaborationStatus', {
      currentStage,
      pendingWith: [],
      completedStages
    });
  };

  const handleConsentDataChange = (consentData: Partial<ConsentData>) => {
    updateFormData('consentData', { ...formData.consentData!, ...consentData });
    
    // Update collaboration status when consent is obtained
    if (consentData.patientConsentStatus === 'obtained') {
      updateCollaborationStatus('patient_info', ['submission_method', 'consent_management']);
      setCurrentStep(2);
    }
  };

  const handleProviderInfoUpdate = (providerData: any) => {
    // Update multiple fields at once from consent management
  setFormData(prev => ({
      ...prev,
      providerName: providerData.providerName,
      providerNpi: providerData.providerNpi,
      providerPhone: providerData.providerPhone,
      providerEmail: providerData.providerEmail,
      treatmentCenterId: providerData.treatmentCenterId || prev.treatmentCenterId,
      treatmentCenterName: providerData.treatmentCenterName,
      treatmentCenterNpi: providerData.treatmentCenterNpi
    }));
  };

  const handlePatientDataUpdate = (patientData: Partial<PatientEnrollmentData>) => {
    setFormData(prev => ({ ...prev, ...patientData }));
  };

  const handleStepNavigation = (stepIndex: number) => {
    // Temporarily disable validation for testing - allow free navigation
    setCurrentStep(stepIndex);
  };

  const isStepValid = (stepIndex: number): boolean => {
    // Temporarily disable all step validation for testing
    return true;
  };

  const getMissingFieldsForStep = (stepIndex: number): string[] => {
    // Temporarily disable all field validation for testing
    return [];
  };

  const handleStepComplete = (stepIndex: number) => {
    const stepNames = [
      'submission_method', 'consent_management', 'patient_info', 
      'provider_info', 'insurance', 'treatment_assessment', 'final_review'
    ];
    
    const completedStageNames = stepNames.slice(0, stepIndex + 1);
    const nextStage = stepIndex < stepNames.length - 1 ? stepNames[stepIndex + 1] : 'submit';
    
    updateCollaborationStatus(nextStage, completedStageNames);
    
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps(prev => [...prev, stepIndex]);
    }
  };

  // Sync enrollment status to main dashboard via localStorage
  useEffect(() => {
    try {
      const completedStepIds = stepIds.filter((_, idx) => completedSteps.includes(idx));
      const pendingStepIds = stepIds.filter((_, idx) => idx >= currentStep && !completedSteps.includes(idx));
      const criticalIssues: Array<{ id: string; title: string; description: string; severity: 'high' | 'medium' | 'low'; stepAffected: string; }> = [];

      if (formData.consentData?.patientConsentStatus !== 'obtained') {
        criticalIssues.push({
          id: 'consent_pending',
          title: 'Consent pending',
          description: 'Patient consent not obtained',
          severity: 'high',
          stepAffected: 'consent_management'
        });
      }
      if (!formData.medicalInsurance?.provider || !formData.medicalInsurance?.policyNumber) {
        criticalIssues.push({
          id: 'insurance_incomplete',
          title: 'Insurance details incomplete',
          description: 'Primary insurance provider or policy number missing',
          severity: 'medium',
          stepAffected: 'insurance'
        });
      }
      if (!formData.providerName || !formData.treatmentCenterName) {
        criticalIssues.push({
          id: 'provider_incomplete',
          title: 'Provider information incomplete',
          description: 'Provider or treatment center missing',
          severity: 'medium',
          stepAffected: 'provider_info'
        });
      }
      if (!formData.therapyType) {
        criticalIssues.push({
          id: 'therapy_missing',
          title: 'Therapy selection missing',
          description: 'Select therapy to proceed',
          severity: 'low',
          stepAffected: 'treatment_assessment'
        });
      }

      const overallProgress = Math.round((completedSteps.length / totalSteps) * 100);

      const payload = {
        enrollmentStatus: {
          currentStep,
          totalSteps,
          completedSteps: completedStepIds,
          pendingSteps: pendingStepIds,
          criticalIssues,
          overallProgress
        },
        patientName: `${formData.firstName} ${formData.lastName}`.trim(),
        enrollmentId: formData.patientIdInternal || patientId || 'ENR-new'
      };
      localStorage.setItem('activeEnrollmentStatus', JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to sync enrollment status', e);
    }
  }, [currentStep, completedSteps, formData, totalSteps]);

  const handleDownloadForm = async () => {
    try {
      setPdfGenerating(true);
      
      const response = await supabase.functions.invoke('patient-enrollment-pdf', {
        body: {
          action: 'generate_blank_form',
          data: {
            patientId,
            formType: 'enrollment',
            submissionMethod: formData.submissionMethod
          }
        }
      });

      if (response.error) throw response.error;

      // Create download link
      const link = document.createElement('a');
      link.href = response.data.pdf_url;
      link.download = `patient-enrollment-form-${patientId || 'new'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('Form downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to download form');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleFaxSubmission = async () => {
    try {
      setLoading(true);
      
      // Generate filled form PDF
      const pdfResponse = await supabase.functions.invoke('patient-enrollment-pdf', {
        body: {
          action: 'generate_filled_form',
          data: {
            patientId,
            formData,
            includeSignatures: true
          }
        }
      });

      if (pdfResponse.error) throw pdfResponse.error;

      // Setup fax processing
      const faxResponse = await supabase.functions.invoke('fax-processing', {
        body: {
          action: 'setup_fax_reception',
          data: {
            patientId,
            expectedDocument: 'enrollment_form',
            pdfTemplate: pdfResponse.data.pdf_content
          }
        }
      });

      if (faxResponse.error) throw faxResponse.error;

      showSuccess('Fax processing setup complete. Fax number: ' + faxResponse.data.fax_number);
    } catch (error) {
      console.error('Fax setup error:', error);
      showError('Failed to setup fax processing');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFSubmission = async () => {
    try {
      setLoading(true);
      
      const response = await supabase.functions.invoke('patient-enrollment-pdf', {
        body: {
          action: 'generate_filled_form',
          data: {
            patientId,
            formData,
            includeSignatures: true,
            submissionReady: true
          }
        }
      });

      if (response.error) throw response.error;

      // Send to DocuSign for collaboration
      const docusignResponse = await supabase.functions.invoke('docusign-integration', {
        body: {
          action: 'send_envelope',
          data: {
            applicationId: patientId,
            documentType: 'patient_enrollment',
            signers: formData.collaborators,
            documents: [{
              name: `Patient Enrollment - ${formData.firstName} ${formData.lastName}`,
              content: response.data.pdf_content
            }]
          }
        }
      });

      if (docusignResponse.error) throw docusignResponse.error;

      showSuccess('Form sent to team for collaboration and completion');
    } catch (error) {
      console.error('PDF submission error:', error);
      showError('Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineSubmission = async () => {
    try {
      setLoading(true);
      
      // Save form data (using existing profiles table)
      const { data: enrollment, error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName
        }])
        .select()
        .single();

      if (error) throw error;

      // Trigger workflow for team collaboration
      if (formData.collaborators.length > 0) {
        await supabase.functions.invoke('docusign-integration', {
          body: {
            action: 'send_envelope',
            data: {
              applicationId: enrollment.id,
              documentType: 'patient_enrollment_review',
              signers: formData.collaborators,
              documents: [{
                name: `Patient Enrollment Review - ${formData.firstName} ${formData.lastName}`,
                content: 'online_form_data'
              }]
            }
          }
        });
      }

      showSuccess('Enrollment submitted successfully');
      onSubmit?.(formData);
    } catch (error) {
      console.error('Online submission error:', error);
      showError('Failed to submit enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderConsent = async () => {
    // Temporarily disable provider signature requirement for testing
    // if (!providerSignature) {
    //   showError('Provider signature is required');
    //   return;
    // }

    const consentData = {
      providerConsent: providerSignature,
      providerConsentDate: new Date().toISOString(),
      providerConsentBy: 'current_user' // In real implementation, get actual user
    };

    updateFormData('providerConsent', consentData.providerConsent);
    updateFormData('providerConsentDate', consentData.providerConsentDate);
    updateFormData('providerConsentBy', consentData.providerConsentBy);

    showSuccess('Provider consent recorded');
  };

  const renderSubmissionOptions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Choose Submission Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4">
          {/* AI Agent Option */}
          <Card className={`cursor-pointer border-2 transition-colors ${
            formData.submissionMethod === 'ai_agent' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => handleSubmissionMethodChange('ai_agent')}>
            <CardContent className="p-4 text-center">
              <Bot className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">AI Agent</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Complete enrollment through conversational AI assistance
              </p>
              {formData.submissionMethod === 'ai_agent' && (
                <Badge variant="default" className="bg-blue-500">
                  <Bot className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Download & Fax Option */}
          <Card className={`cursor-pointer border-2 transition-colors ${
            formData.submissionMethod === 'fax' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => handleSubmissionMethodChange('fax')}>
            <CardContent className="p-4 text-center">
              <FileX className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Download & Fax</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download form, fill manually, and fax to us
              </p>
              {formData.submissionMethod === 'fax' && (
                <Button onClick={handleDownloadForm} disabled={pdfGenerating} size="sm">
                  {pdfGenerating ? 'Generating...' : 'Download Form'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Download & Submit PDF Option */}
          <Card className={`cursor-pointer border-2 transition-colors ${
            formData.submissionMethod === 'pdf_submit' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => handleSubmissionMethodChange('pdf_submit')}>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Fill & Submit PDF</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Fill form and submit as PDF with team collaboration
              </p>
              {formData.submissionMethod === 'pdf_submit' && (
                <Button onClick={handlePDFSubmission} disabled={loading} size="sm">
                  {loading ? 'Processing...' : 'Generate & Send'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Online Form Option */}
          <Card className={`cursor-pointer border-2 transition-colors ${
            formData.submissionMethod === 'online' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => handleSubmissionMethodChange('online')}>
            <CardContent className="p-4 text-center">
              <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Fill Online</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Complete form online with real-time collaboration
              </p>
              {formData.submissionMethod === 'online' && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active Method
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Collaboration Setup */}
        {(formData.submissionMethod !== 'online' && formData.collaborators.length > 0) && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Collaboration
            </h4>
            <MultiPartySignature
              applicationId={patientId || 'new'}
              signers={formData.collaborators}
              onSignersChange={(signers) => updateFormData('collaborators', signers)}
              currentUserEmail=""
              onSubmitForSigning={async () => {}}
              readOnly={readOnly}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPatientInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              disabled={readOnly}
              required
              className={!formData.lastName?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
              aria-invalid={!formData.lastName?.trim()}
            />
          </div>
        </div>

        {/* Date of Birth and Language */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth (MM/DD/YYYY) *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label>Preferred Language</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="preferredLanguage"
                  value="english"
                  checked={formData.preferredLanguage === 'english'}
                  onChange={(e) => updateFormData('preferredLanguage', e.target.value)}
                  disabled={readOnly}
                  className="form-radio"
                />
                <span className="text-sm">English</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="preferredLanguage"
                  value="spanish"
                  checked={formData.preferredLanguage === 'spanish'}
                  onChange={(e) => updateFormData('preferredLanguage', e.target.value)}
                  disabled={readOnly}
                  className="form-radio"
                />
                <span className="text-sm">Spanish</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="preferredLanguage"
                  value="other"
                  checked={formData.preferredLanguage === 'other'}
                  onChange={(e) => updateFormData('preferredLanguage', e.target.value)}
                  disabled={readOnly}
                  className="form-radio"
                />
                <span className="text-sm">Other</span>
              </label>
            </div>
            {formData.preferredLanguage === 'other' && (
              <Input
                placeholder="Specify language"
                value={formData.otherLanguage || ''}
                onChange={(e) => updateFormData('otherLanguage', e.target.value)}
                disabled={readOnly}
                className="mt-2"
              />
            )}
          </div>
        </div>

        {/* Gender */}
        <div>
          <Label>Gender</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={(e) => updateFormData('gender', e.target.value)}
                disabled={readOnly}
                className="form-radio"
              />
              <span className="text-sm">Male</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={(e) => updateFormData('gender', e.target.value)}
                disabled={readOnly}
                className="form-radio"
              />
              <span className="text-sm">Female</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="other"
                checked={formData.gender === 'other'}
                onChange={(e) => updateFormData('gender', e.target.value)}
                disabled={readOnly}
                className="form-radio"
              />
              <span className="text-sm">Other</span>
            </label>
          </div>
          {formData.gender === 'other' && (
            <Input
              placeholder="Specify gender"
              value={formData.otherGender || ''}
              onChange={(e) => updateFormData('otherGender', e.target.value)}
              disabled={readOnly}
              className="mt-2 max-w-xs"
            />
          )}
        </div>

        {/* Address */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Street *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              disabled={readOnly}
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <Label htmlFor="apartment">Apt.</Label>
            <Input
              id="apartment"
              value={formData.apartment || ''}
              onChange={(e) => updateFormData('apartment', e.target.value)}
              disabled={readOnly}
              placeholder="Apt 2B"
            />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => updateFormData('state', e.target.value)}
              disabled={readOnly}
              placeholder="NY"
              maxLength={2}
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP *</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => updateFormData('zipCode', e.target.value)}
              disabled={readOnly}
              placeholder="10001"
              maxLength={10}
            />
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="homePhone">Home Phone</Label>
            <Input
              id="homePhone"
              type="tel"
              value={formData.homePhone || ''}
              onChange={(e) => updateFormData('homePhone', e.target.value)}
              disabled={readOnly}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="cellPhone">Cell Phone *</Label>
            <Input
              id="cellPhone"
              type="tel"
              value={formData.cellPhone}
              onChange={(e) => updateFormData('cellPhone', e.target.value)}
              disabled={readOnly}
              placeholder="+1 (555) 987-6543"
            />
          </div>
        </div>

        {/* Alternate Contact */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="alternateContactName">Alternate Contact Name</Label>
            <Input
              id="alternateContactName"
              value={formData.alternateContactName || ''}
              onChange={(e) => updateFormData('alternateContactName', e.target.value)}
              disabled={readOnly}
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="alternateContactRelationship">Relationship</Label>
            <Input
              id="alternateContactRelationship"
              value={formData.alternateContactRelationship || ''}
              onChange={(e) => updateFormData('alternateContactRelationship', e.target.value)}
              disabled={readOnly}
              placeholder="Spouse, Parent, etc."
            />
          </div>
          <div>
            <Label htmlFor="alternateContactPhone">Alt. Phone</Label>
            <Input
              id="alternateContactPhone"
              type="tel"
              value={formData.alternateContactPhone || ''}
              onChange={(e) => updateFormData('alternateContactPhone', e.target.value)}
              disabled={readOnly}
              placeholder="+1 (555) 111-2222"
            />
          </div>
        </div>

        {/* Do Not Contact Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="doNotContactPatient"
            checked={formData.doNotContactPatient || false}
            onChange={(e) => updateFormData('doNotContactPatient', e.target.checked)}
            disabled={readOnly}
            className="form-checkbox"
          />
          <Label htmlFor="doNotContactPatient" className="cursor-pointer">
            Do not contact patient
          </Label>
        </div>

        {/* Email (moved to end) */}
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            disabled={readOnly}
            placeholder="patient@example.com"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderConsentSignatures = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Consent & Signatures
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Financial Eligibility (optional) */}
        <div className="p-4 bg-muted rounded-lg space-y-4">
          <h4 className="font-medium">Financial Eligibility</h4>
          <p className="text-sm text-muted-foreground">
            Complete only if you are applying to the Genie Patient Foundation. By completing this section, I am
            agreeing to the Terms and Conditions of the Genie Patient Foundation outlined on page 2.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="householdSize">Household size (including you)</Label>
              <Input id="householdSize" type="number" value={householdSize} onChange={(e) => setHouseholdSize(e.target.value)} placeholder="Enter number" />
            </div>
            <div>
              <Label htmlFor="annualIncome">Annual household income</Label>
              <Input id="annualIncome" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} placeholder="Enter income" />
            </div>
          </div>
        </div>

        {/* Optional Consents */}
        <div className="p-4 bg-muted rounded-lg space-y-4">
          <h4 className="font-medium">Optional Consents</h4>

          <div className="flex items-start space-x-2">
            <Checkbox id="diseaseEducation" checked={diseaseEducationConsent} onCheckedChange={(c) => setDiseaseEducationConsent(c === true)} />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="diseaseEducation" className="text-sm font-medium">Consent for Patient Resources and Information (OPTIONAL)</Label>
              <p className="text-xs text-muted-foreground">
                Genie offers optional and free disease education and other material for patients. This may include information and marketing
                material about products, services and programs offered by Genie, its partners and their affiliates. If you sign up, you may be
                contacted using the information you have provided. By checking this box, I agree to receive optional disease education and other
                material. I understand providing this agreement is voluntary and plays no role in getting Genie Access Solutions services or my
                medicine and that it may be necessary to use my sensitive personal information to provide me with relevant material. I also
                understand that I may opt out at any time by calling (888)999-9999 and that this consent will remain active unless I opt out.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="tcpaConsent" checked={tcpaConsent} onCheckedChange={(c) => setTcpaConsent(c === true)} />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="tcpaConsent" className="text-sm font-medium">Telephone Consumer Protection Act (TCPA) Consent (OPTIONAL)</Label>
              <p className="text-xs text-muted-foreground">
                By checking this box, I consent to receive autodialed marketing calls and text messages from and on behalf of Genie at the phone
                number(s) I have provided. I understand that consent is not a requirement of any purchase or enrollment. Message frequency may
                vary. Message and data rates may apply. I may opt out at any time by texting STOP or calling (877) Genie/(888)999-9999.
              </p>
            </div>
          </div>
        </div>

        {/* Final Consent Acknowledgement */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Patient Consent and Authorization</h4>
          <p className="text-sm text-muted-foreground">
            By signing this form, I acknowledge that I have provided accurate and complete information and understand and agree to the terms of this
            form. My signature certifies that I have read, understood, and agree to the release and use of my personal information, including sensitive
            personal information, pursuant to the Authorization to Use and Disclose Personal Information and as otherwise stated on this form.
          </p>
        </div>

        {/* Patient Signature */}
        <div>
          <SignatureCapture
            title="Patient Signature"
            description="I acknowledge that I have read and understand all terms and conditions"
            required={false}
            onSignatureChange={setPatientSignature}
            value={patientSignature}
            disabled={readOnly}
          />
        </div>

        <Separator />

        {/* Provider Consent Section */}
        <div>
          <h4 className="font-medium mb-3">Provider Consent to Proceed</h4>
          <p className="text-sm text-muted-foreground mb-4">
            As the healthcare provider, I consent to proceed with the patient enrollment process 
            and authorize my team to collaborate on completing this enrollment.
          </p>
          
          <SignatureCapture
            title="Provider Authorization Signature"
            description="I authorize the enrollment process and team collaboration"
            required={false}
            onSignatureChange={setProviderSignature}
            value={providerSignature}
            disabled={readOnly}
          />

          <div className="mt-4">
            <Button 
              onClick={handleProviderConsent}
              disabled={!providerSignature || readOnly}
              className="w-full"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Provider Consent
            </Button>
          </div>

          {formData.providerConsentDate && (
            <Alert className="mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Provider consent recorded on {new Date(formData.providerConsentDate).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderProviderInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Provider Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="providerName">Provider Name</Label>
            <Input
              id="providerName"
              value={formData.providerName}
              onChange={(e) => updateFormData('providerName', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="providerNpi">Provider NPI</Label>
            <Input
              id="providerNpi"
              value={formData.providerNpi || ''}
              onChange={(e) => updateFormData('providerNpi', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="providerSpecialty">Provider Specialty</Label>
            <Input
              id="providerSpecialty"
              value={formData.providerSpecialty || ''}
              onChange={(e) => updateFormData('providerSpecialty', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="treatmentCenterName">Treatment Center</Label>
            <Input
              id="treatmentCenterName"
              value={formData.treatmentCenterName}
              onChange={(e) => updateFormData('treatmentCenterName', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>

        <Separator />
        <h4 className="font-medium">Referral Information</h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="referralProviderName">Referral Provider Name</Label>
            <Input
              id="referralProviderName"
              value={formData.referralProviderName || ''}
              onChange={(e) => updateFormData('referralProviderName', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="referralCenterName">Referral Center</Label>
            <Input
              id="referralCenterName"
              value={formData.referralCenterName || ''}
              onChange={(e) => updateFormData('referralCenterName', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderInsuranceInfo = () => (
    <ComprehensiveInsuranceSection
      formData={formData.comprehensiveInsuranceData!}
      updateFormData={handleComprehensiveInsuranceUpdate}
      readOnly={readOnly}
    />
  );

  const renderTherapyInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Therapy Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="therapyType">Type of Therapy</Label>
            <Input
              id="therapyType"
              value={formData.therapyType}
              onChange={(e) => updateFormData('therapyType', e.target.value)}
                disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="productDrugInfo">Product/Drug Information</Label>
            <Input
              id="productDrugInfo"
              value={formData.productDrugInfo}
              onChange={(e) => updateFormData('productDrugInfo', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>

        <div>
          <Label>NDC Codes & Dosage</Label>
          <div className="space-y-2">
            {formData.ndcCodes.map((ndc, index) => (
              <div key={index} className="grid md:grid-cols-4 gap-2 p-3 border rounded">
                <Input
                  placeholder="NDC Code"
                  value={ndc.code}
                  onChange={(e) => {
                    const updatedNdcs = [...formData.ndcCodes];
                    updatedNdcs[index] = { ...ndc, code: e.target.value };
                    updateFormData('ndcCodes', updatedNdcs);
                  }}
                  disabled={readOnly}
                />
                <Input
                  placeholder="Description"
                  value={ndc.description}
                  onChange={(e) => {
                    const updatedNdcs = [...formData.ndcCodes];
                    updatedNdcs[index] = { ...ndc, description: e.target.value };
                    updateFormData('ndcCodes', updatedNdcs);
                  }}
                  disabled={readOnly}
                />
                <Input
                  placeholder="Dosage"
                  value={ndc.dosage}
                  onChange={(e) => {
                    const updatedNdcs = [...formData.ndcCodes];
                    updatedNdcs[index] = { ...ndc, dosage: e.target.value };
                    updateFormData('ndcCodes', updatedNdcs);
                  }}
                  disabled={readOnly}
                />
                <Input
                  placeholder="Strength"
                  value={ndc.strength}
                  onChange={(e) => {
                    const updatedNdcs = [...formData.ndcCodes];
                    updatedNdcs[index] = { ...ndc, strength: e.target.value };
                    updateFormData('ndcCodes', updatedNdcs);
                  }}
                  disabled={readOnly}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => updateFormData('ndcCodes', [...formData.ndcCodes, { code: '', description: '', dosage: '', strength: '' }])}
              disabled={readOnly}
              className="w-full"
            >
              Add NDC Code
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="distribution">Distribution</Label>
            <select
              id="distribution"
              value={formData.distribution}
              onChange={(e) => updateFormData('distribution', e.target.value as '3pl' | 'sd' | 'sp')}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="3pl">3PL (Third Party Logistics)</option>
              <option value="sd">SD (Specialty Distribution)</option>
              <option value="sp">SP (Specialty Pharmacy)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="dateOfApheresis">Date of Apheresis</Label>
            <Input
              id="dateOfApheresis"
              type="date"
              value={formData.dateOfApheresis || ''}
              onChange={(e) => updateFormData('dateOfApheresis', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="dateOfInfusion">Date of Infusion</Label>
            <Input
              id="dateOfInfusion"
              type="date"
              value={formData.dateOfInfusion || ''}
              onChange={(e) => updateFormData('dateOfInfusion', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientIdInternal">Patient ID</Label>
            <Input
              id="patientIdInternal"
              value={formData.patientIdInternal || ''}
              onChange={(e) => updateFormData('patientIdInternal', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="orderIdInternal">Order ID</Label>
            <Input
              id="orderIdInternal"
              value={formData.orderIdInternal || ''}
              onChange={(e) => updateFormData('orderIdInternal', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderMedicalInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Medical History & Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="primaryPhysician">Primary Physician</Label>
          <Input
            id="primaryPhysician"
            value={formData.primaryPhysician}
            onChange={(e) => updateFormData('primaryPhysician', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor="medicalHistory">Medical History</Label>
          <Textarea
            id="medicalHistory"
            value={formData.medicalHistory}
            onChange={(e) => updateFormData('medicalHistory', e.target.value)}
            disabled={readOnly}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="currentMedications">Current Medications</Label>
          <Textarea
            id="currentMedications"
            value={formData.currentMedications}
            onChange={(e) => updateFormData('currentMedications', e.target.value)}
            disabled={readOnly}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="allergies">Allergies</Label>
          <Textarea
            id="allergies"
            value={formData.allergies}
            onChange={(e) => updateFormData('allergies', e.target.value)}
            disabled={readOnly}
            rows={2}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="treatmentType">Treatment Type</Label>
            <Input
              id="treatmentType"
              value={formData.treatmentType}
              onChange={(e) => updateFormData('treatmentType', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="referralSource">Referral Source</Label>
            <Input
              id="referralSource"
              value={formData.referralSource}
              onChange={(e) => updateFormData('referralSource', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="admissionDate">Admission Date</Label>
          <Input
            id="admissionDate"
            type="date"
            value={formData.admissionDate || ''}
            onChange={(e) => updateFormData('admissionDate', e.target.value)}
            disabled={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderClinicalInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Clinical Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>ICD Codes</Label>
          <div className="space-y-2">
            {formData.icdCodes.map((icd, index) => (
              <div key={index} className="grid md:grid-cols-4 gap-2 p-3 border rounded">
                <select
                  value={icd.version}
                  onChange={(e) => {
                    const updatedIcds = [...formData.icdCodes];
                    updatedIcds[index] = { ...icd, version: parseInt(e.target.value) as 9 | 10 };
                    updateFormData('icdCodes', updatedIcds);
                  }}
                  disabled={readOnly}
                  className="px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value={9}>ICD-9</option>
                  <option value={10}>ICD-10</option>
                </select>
                <Input
                  placeholder="ICD Code"
                  value={icd.code}
                  onChange={(e) => {
                    const updatedIcds = [...formData.icdCodes];
                    updatedIcds[index] = { ...icd, code: e.target.value };
                    updateFormData('icdCodes', updatedIcds);
                  }}
                  disabled={readOnly}
                />
                <Input
                  placeholder="Description"
                  value={icd.description}
                  onChange={(e) => {
                    const updatedIcds = [...formData.icdCodes];
                    updatedIcds[index] = { ...icd, description: e.target.value };
                    updateFormData('icdCodes', updatedIcds);
                  }}
                  disabled={readOnly}
                  className="col-span-2"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => updateFormData('icdCodes', [...formData.icdCodes, { version: 10, code: '', description: '' }])}
              disabled={readOnly}
              className="w-full"
            >
              Add ICD Code
            </Button>
          </div>
        </div>

        <div>
          <Label>Clinical Documents</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => {
                if (e.target.files) {
                  updateFormData('clinicalDocuments', Array.from(e.target.files));
                }
              }}
              disabled={readOnly}
              className="hidden"
              id="clinicalDocuments"
            />
            <label htmlFor="clinicalDocuments" className="cursor-pointer">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload clinical documents
              </p>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Collaboration Status */}
      {formData.collaborationStatus && (
        <CollaborationStatus
          collaborationStatus={formData.collaborationStatus}
          totalSteps={totalSteps}
        />
      )}

      {/* Journey Steps Navigation */}
      <EnrollmentJourneySteps
        currentStep={currentStep}
        onStepClick={handleStepNavigation}
        completedSteps={completedSteps}
      />

      {/* Step 0: Submission Method Selection */}
      {currentStep === 0 && renderSubmissionOptions()}

      {/* Step 1: Consent Management */}
      {currentStep === 1 && formData.consentData && (
        <ConsentManagement
          consentData={formData.consentData}
          onConsentChange={handleConsentDataChange}
          onProviderInfoUpdate={handleProviderInfoUpdate}
          readOnly={readOnly}
        />
      )}

      {/* Step 2: Patient Information */}
      {currentStep === 2 && (
        <>
          <PatientDataPrefill
            formData={formData}
            onPatientDataUpdate={handlePatientDataUpdate}
            readOnly={readOnly}
          />
          {renderPatientInfo()}
        </>
      )}

      {/* Step 3: Provider Information */}
      {currentStep === 3 && formData.comprehensiveProviderData && (
        <ComprehensiveProviderSection
          formData={formData.comprehensiveProviderData}
          updateFormData={handleComprehensiveProviderUpdate}
          readOnly={readOnly}
        />
      )}

      {/* Step 4: Insurance Information */}
      {currentStep === 4 && renderInsuranceInfo()}

      {/* Step 5: Treatment & Clinical Assessment */}
      {currentStep === 5 && formData.comprehensiveTreatmentAssessmentData && (
        <ComprehensiveTreatmentAssessment
          formData={formData.comprehensiveTreatmentAssessmentData}
          updateFormData={handleComprehensiveTreatmentAssessmentUpdate}
          prePopulatedData={{
            treatingPhysician: {
              name: formData.providerName || '',
              npi: formData.providerNpi || '',
              specialty: formData.providerSpecialty || '',
              phone: formData.providerPhone || '',
              email: formData.providerEmail || ''
            },
            facility: {
              name: formData.treatmentCenterName || '',
              address: formData.treatmentCenterAddress || '',
              phone: formData.providerPhone || '',
              emergencyContact: ''
            },
            coverage: {
              primaryInsurance: formData.medicalInsurance?.provider || '',
              policyNumber: formData.medicalInsurance?.policyNumber || '',
              groupNumber: formData.medicalInsurance?.groupNumber || '',
              copayAmount: '',
              deductibleRemaining: '',
              outOfPocketMax: '',
              priorAuthStatus: ''
            },
            referringPhysician: {
              name: formData.referralProviderName || '',
              npi: '',
              specialty: '',
              phone: '',
              practiceName: formData.referralCenterName || ''
            },
            treatment: {
              therapyType: formData.therapyType || '',
              productName: formData.productDrugInfo || '',
              ndcCodes: formData.ndcCodes?.map(ndc => ndc.code) || [],
              distributionMethod: formData.distribution || ''
            },
            patient: {
              fullName: `${formData.firstName} ${formData.lastName}`,
              dateOfBirth: formData.dateOfBirth || '',
              phone: formData.cellPhone || '',
              email: formData.email || '',
              address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`
            }
          }}
          readOnly={readOnly}
        />
      )}

      {/* Step 6: Final Review & Submit */}
      {currentStep === 6 && renderConsentSignatures()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button 
          onClick={() => {
            if (currentStep === totalSteps - 1) {
              // Handle final submission based on selected method
              switch (formData.submissionMethod) {
                case 'fax':
                  handleFaxSubmission();
                  break;
                case 'pdf_submit':
                  handlePDFSubmission();
                  break;
                case 'online':
                  handleOnlineSubmission();
                  break;
              }
            } else {
              // Validate current step before proceeding
              // Temporarily disabled for testing
              // const missingFields = getMissingFieldsForStep(currentStep);
              // if (missingFields.length > 0) {
              //   showError(
              //     'Missing Required Fields',
              //     `Please complete the following fields: ${missingFields.join(', ')}`
              //   );
              //   return;
              // }
              if (isStepValid(currentStep)) {
                handleStepComplete(currentStep);
                setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1));
              }
            }
          }}
          disabled={loading || pdfGenerating}
        >
          {currentStep === totalSteps - 1 
            ? (loading || pdfGenerating ? 'Processing...' : 'Submit Enrollment') 
            : 'Next'
          }
        </Button>
      </div>
    </div>
  );
};