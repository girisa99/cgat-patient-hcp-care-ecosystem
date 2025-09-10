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
  
  // Medical Information
  primaryPhysician: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  
  // Insurance Information
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  
  // Treatment Information
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
    primaryPhysician: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',
    treatmentType: '',
    referralSource: '',
    admissionDate: '',
    consentToTreatment: false,
    hipaaAuthorization: false,
    financialResponsibility: false,
    submissionMethod: 'online',
    collaborators: [],
    ...initialData
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [providerSignature, setProviderSignature] = useState<string | null>(null);
  const [patientSignature, setPatientSignature] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  const totalSteps = 6;

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

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Enrollment Progress</span>
            <span className="text-sm text-muted-foreground">{currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient Information */}
      {currentStep === 1 && renderPatientInfo()}

      {/* Submission Method Selection */}
      {currentStep === 2 && renderSubmissionOptions()}

      {/* Consent & Signatures */}
      {currentStep === 3 && renderConsentSignatures()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="space-x-2">
          {currentStep < totalSteps ? (
            <Button 
              onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleOnlineSubmission}
              disabled={loading || !patientSignature || !formData.providerConsentDate}
            >
              {loading ? 'Submitting...' : 'Complete Enrollment'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};