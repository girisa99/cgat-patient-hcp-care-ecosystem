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
  Clock
} from 'lucide-react';
import { SignatureCapture } from '@/components/signature/SignatureCapture';
import { MultiPartySignature, type Signer } from '@/components/signature/MultiPartySignature';
import { PDFGenerator } from '@/components/signature/PDFGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { EnrollmentJourneySteps } from './EnrollmentJourneySteps';
import { EnhancedProviderSection } from './EnhancedProviderSection';
import { ConsentManagement, type ConsentData } from './ConsentManagement';
import { CollaborationStatus } from './CollaborationStatus';

export interface PatientEnrollmentData {
  // Patient Information
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Address Information
  address: string;
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
  submissionMethod: 'fax' | 'pdf_submit' | 'online';
  
  // Collaboration
  collaborators: Signer[];
  
  // Provider Consent
  providerConsent?: string;
  providerConsentDate?: string;
  providerConsentBy?: string;
  
  // Consent Management
  consentData?: ConsentData;
  
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

type SubmissionMethod = 'fax' | 'pdf_submit' | 'online';

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
    ssn: '',
    email: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
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
      providerName: '',
      treatmentCenter: '',
      patientConsentStatus: 'pending'
    },
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

  const totalSteps = 9;

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const updateFormData = (field: keyof PatientEnrollmentData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmissionMethodChange = (method: SubmissionMethod) => {
    updateFormData('submissionMethod', method);
    updateFormData('collaborationStatus', {
      ...formData.collaborationStatus!,
      currentStage: 'consent_management',
      completedStages: ['submission_method']
    });
    
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
  };

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
    if (!providerSignature) {
      showError('Provider signature is required');
      return;
    }

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
        <div className="grid md:grid-cols-3 gap-4">
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
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              disabled={readOnly}
              required
            />
          </div>
          <div>
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              value={formData.middleName}
              onChange={(e) => updateFormData('middleName', e.target.value)}
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
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
              disabled={readOnly}
              required
            />
          </div>
          <div>
            <Label htmlFor="ssn">Social Security Number</Label>
            <Input
              id="ssn"
              type="password"
              value={formData.ssn}
              onChange={(e) => updateFormData('ssn', e.target.value)}
              disabled={readOnly}
              placeholder="XXX-XX-XXXX"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              disabled={readOnly}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              disabled={readOnly}
              required
            />
          </div>
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
        {/* Patient Signature */}
        <div>
          <SignatureCapture
            title="Patient Signature"
            description="I acknowledge that I have read and understand all terms and conditions"
            required={true}
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
            required={true}
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
              required
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
              required
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Insurance Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Medical Insurance</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medicalInsuranceProvider">Insurance Provider</Label>
              <Input
                id="medicalInsuranceProvider"
                value={formData.medicalInsurance.provider}
                onChange={(e) => updateFormData('medicalInsurance', { ...formData.medicalInsurance, provider: e.target.value })}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="medicalInsuranceType">Insurance Type</Label>
              <select
                id="medicalInsuranceType"
                value={formData.medicalInsurance.type}
                onChange={(e) => updateFormData('medicalInsurance', { ...formData.medicalInsurance, type: e.target.value as 'government' | 'commercial' })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="commercial">Commercial</option>
                <option value="government">Government</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="medicalPolicyNumber">Policy Number</Label>
              <Input
                id="medicalPolicyNumber"
                value={formData.medicalInsurance.policyNumber}
                onChange={(e) => updateFormData('medicalInsurance', { ...formData.medicalInsurance, policyNumber: e.target.value })}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="medicalGroupNumber">Group Number</Label>
              <Input
                id="medicalGroupNumber"
                value={formData.medicalInsurance.groupNumber}
                onChange={(e) => updateFormData('medicalInsurance', { ...formData.medicalInsurance, groupNumber: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="medicalPriority">Priority</Label>
              <select
                id="medicalPriority"
                value={formData.medicalInsurance.priority}
                onChange={(e) => updateFormData('medicalInsurance', { ...formData.medicalInsurance, priority: e.target.value as 'primary' | 'secondary' | 'tertiary' })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="tertiary">Tertiary</option>
              </select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-3">Pharmacy Insurance (Optional)</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pharmacyInsuranceProvider">Insurance Provider</Label>
              <Input
                id="pharmacyInsuranceProvider"
                value={formData.pharmacyInsurance?.provider || ''}
                onChange={(e) => updateFormData('pharmacyInsurance', { 
                  ...formData.pharmacyInsurance, 
                  provider: e.target.value,
                  policyNumber: formData.pharmacyInsurance?.policyNumber || '',
                  groupNumber: formData.pharmacyInsurance?.groupNumber || '',
                  type: formData.pharmacyInsurance?.type || 'commercial',
                  priority: formData.pharmacyInsurance?.priority || 'primary'
                })}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="pharmacyInsuranceType">Insurance Type</Label>
              <select
                id="pharmacyInsuranceType"
                value={formData.pharmacyInsurance?.type || 'commercial'}
                onChange={(e) => updateFormData('pharmacyInsurance', { 
                  ...formData.pharmacyInsurance, 
                  type: e.target.value as 'government' | 'commercial',
                  provider: formData.pharmacyInsurance?.provider || '',
                  policyNumber: formData.pharmacyInsurance?.policyNumber || '',
                  groupNumber: formData.pharmacyInsurance?.groupNumber || '',
                  priority: formData.pharmacyInsurance?.priority || 'primary'
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="commercial">Commercial</option>
                <option value="government">Government</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <Label>Insurance Documents</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files) {
                  updateFormData('insuranceDocuments', Array.from(e.target.files));
                }
              }}
              disabled={readOnly}
              className="hidden"
              id="insuranceDocuments"
            />
            <label htmlFor="insuranceDocuments" className="cursor-pointer">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload insurance cards and documents
              </p>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
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
              required
            />
          </div>
          <div>
            <Label htmlFor="productDrugInfo">Product/Drug Information</Label>
            <Input
              id="productDrugInfo"
              value={formData.productDrugInfo}
              onChange={(e) => updateFormData('productDrugInfo', e.target.value)}
              disabled={readOnly}
              required
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
        onStepClick={setCurrentStep}
        completedSteps={completedSteps}
      />

      {/* Step 0: Submission Method Selection */}
      {currentStep === 0 && renderSubmissionOptions()}

      {/* Step 1: Consent Management */}
      {currentStep === 1 && formData.consentData && (
        <ConsentManagement
          consentData={formData.consentData}
          onConsentChange={(data) => updateFormData('consentData', { ...formData.consentData!, ...data })}
          readOnly={readOnly}
        />
      )}

      {/* Step 2: Patient Information */}
      {currentStep === 2 && renderPatientInfo()}

      {/* Step 3: Provider Information */}
      {currentStep === 3 && (
        <EnhancedProviderSection
          formData={formData}
          updateFormData={updateFormData}
          readOnly={readOnly}
        />
      )}

      {/* Step 4: Insurance Information */}
      {currentStep === 4 && renderInsuranceInfo()}

      {/* Step 5: Therapy Information */}
      {currentStep === 5 && renderTherapyInfo()}

      {/* Step 6: Clinical Information */}
      {currentStep === 6 && renderClinicalInfo()}

      {/* Step 7: Medical Review */}
      {currentStep === 7 && renderMedicalInfo()}

      {/* Step 8: Final Review & Submit */}
      {currentStep === 8 && renderConsentSignatures()}

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
              setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1));
              // Mark current step as completed
              if (!completedSteps.includes(currentStep)) {
                setCompletedSteps(prev => [...prev, currentStep]);
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