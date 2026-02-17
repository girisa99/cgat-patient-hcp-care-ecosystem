/**
 * AI CONSENT WORKFLOW INTEGRATION
 * Handles provider signature → AI agent trigger → patient consent collection
 * Supports WhatsApp, SMS, voice, verbal, email consent methods
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ShieldCheck, 
  Bot, 
  MessageSquare, 
  Phone, 
  Mail, 
  Mic,
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  FileSignature,
  Send
} from 'lucide-react';
import { SignatureCapture } from '@/components/signature/SignatureCapture';
import { useEnrollmentAgent } from '@/hooks/useEnrollmentAgent';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ConsentWorkflowState {
  stage: 'provider_signature' | 'ai_agent_triggered' | 'patient_consent_pending' | 'patient_consent_received' | 'enrollment_complete' | 'enrollment_pending';
  providerSignature: string | null;
  providerSignatureTimestamp: string | null;
  aiAgentSessionId: string | null;
  patientConsentMethod: 'whatsapp' | 'sms' | 'voice' | 'verbal' | 'email' | null;
  patientConsentStatus: 'pending' | 'sent' | 'received' | 'declined' | null;
  patientSignature: string | null;
  patientSignatureTimestamp: string | null;
  enrollmentStatus: 'draft' | 'pending_patient' | 'completed' | 'rejected';
  errorMessage: string | null;
}

interface PatientInformation {
  firstName: string;
  lastName: string;
  email: string;
  cellPhone: string;
  preferredContactMethod: 'whatsapp' | 'sms' | 'voice' | 'verbal' | 'email';
}

interface ProviderInformation {
  name: string;
  npi?: string;
  email: string;
  phone: string;
}

interface AIConsentWorkflowProps {
  patientInfo: PatientInformation;
  providerInfo: ProviderInformation;
  enrollmentData: any;
  onWorkflowComplete?: (status: 'completed' | 'pending' | 'rejected', data: any) => void;
}

export const AIConsentWorkflow: React.FC<AIConsentWorkflowProps> = ({
  patientInfo,
  providerInfo,
  enrollmentData,
  onWorkflowComplete
}) => {
  const [workflowState, setWorkflowState] = useState<ConsentWorkflowState>({
    stage: 'provider_signature',
    providerSignature: null,
    providerSignatureTimestamp: null,
    aiAgentSessionId: null,
    patientConsentMethod: null,
    patientConsentStatus: null,
    patientSignature: null,
    patientSignatureTimestamp: null,
    enrollmentStatus: 'draft',
    errorMessage: null
  });

  const { startEnrollment, updateSection, completeSection } = useEnrollmentAgent();
  const { showSuccess, showError, showInfo } = useMasterToast();

  const handleProviderSignature = async (signature: string) => {
    try {
      setWorkflowState(prev => ({
        ...prev,
        providerSignature: signature,
        providerSignatureTimestamp: new Date().toISOString(),
        stage: 'ai_agent_triggered'
      }));

      showInfo('Provider Signature Captured', 'Initiating AI agent for patient consent...');

      // Trigger AI Agent for patient consent
      await triggerAIAgentForConsent(signature);
    } catch (error) {
      console.error('Error handling provider signature:', error);
      setWorkflowState(prev => ({
        ...prev,
        errorMessage: 'Failed to process provider signature'
      }));
      showError('Signature Error', 'Failed to process provider signature');
    }
  };

  const triggerAIAgentForConsent = async (providerSignature: string) => {
    try {
      // Start enrollment session with AI agent
      const sessionId = await startEnrollment('patient');
      
      // Update session with patient and provider information
      await updateSection('provider_info', {
        providerName: providerInfo.name,
        providerNpi: providerInfo.npi,
        providerEmail: providerInfo.email,
        providerPhone: providerInfo.phone,
        providerSignature: providerSignature,
        providerSignatureTimestamp: workflowState.providerSignatureTimestamp
      });

      await updateSection('patient_info', {
        firstName: patientInfo.firstName,
        lastName: patientInfo.lastName,
        email: patientInfo.email,
        cellPhone: patientInfo.cellPhone,
        preferredContactMethod: patientInfo.preferredContactMethod
      });

      setWorkflowState(prev => ({
        ...prev,
        aiAgentSessionId: sessionId,
        patientConsentMethod: patientInfo.preferredContactMethod,
        stage: 'patient_consent_pending',
        enrollmentStatus: 'pending_patient'
      }));

      showSuccess('AI Agent Activated', `Consent request sent via ${patientInfo.preferredContactMethod.toUpperCase()}`);

      // Initiate patient consent based on preferred method
      await initiatePatientConsent(sessionId, patientInfo.preferredContactMethod);
    } catch (error) {
      console.error('Error triggering AI agent:', error);
      setWorkflowState(prev => ({
        ...prev,
        errorMessage: 'Failed to trigger AI agent for consent',
        stage: 'provider_signature' // Reset to previous stage
      }));
      showError('AI Agent Error', 'Failed to initiate patient consent process');
    }
  };

  const initiatePatientConsent = async (sessionId: string, method: string) => {
    try {
      // This would integrate with your WhatsApp, SMS, voice, or email systems
      const consentPayload = {
        sessionId,
        patientInfo,
        providerInfo,
        consentMethod: method,
        enrollmentData: {
          treatmentType: enrollmentData.treatmentType,
          providerName: providerInfo.name,
          consentRequirements: [
            'Treatment Authorization',
            'HIPAA Authorization', 
            'Financial Responsibility',
            'Communication Consent'
          ]
        }
      };

      // Call appropriate consent service based on method
      switch (method) {
        case 'whatsapp':
          await initiateWhatsAppConsent(consentPayload);
          break;
        case 'sms':
          await initiateSMSConsent(consentPayload);
          break;
        case 'voice':
          await initiateVoiceConsent(consentPayload);
          break;
        case 'email':
          await initiateEmailConsent(consentPayload);
          break;
        case 'verbal':
          await initiateVerbalConsent(consentPayload);
          break;
      }

      setWorkflowState(prev => ({
        ...prev,
        patientConsentStatus: 'sent'
      }));

      // Start polling for consent response
      startConsentPolling(sessionId);
    } catch (error) {
      console.error('Error initiating patient consent:', error);
      showError('Consent Initiation Failed', `Failed to send consent via ${method}`);
    }
  };

  const initiateWhatsAppConsent = async (payload: any) => {
    // Integration with WhatsApp consent agent
    const response = await fetch('/api/whatsapp-consent-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error('WhatsApp consent initiation failed');
    }
  };

  const initiateSMSConsent = async (payload: any) => {
    // Integration with SMS service
    const response = await fetch('/api/sms-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error('SMS consent initiation failed');
    }
  };

  const initiateVoiceConsent = async (payload: any) => {
    // Integration with voice call system
    const response = await fetch('/api/voice-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error('Voice consent initiation failed');
    }
  };

  const initiateEmailConsent = async (payload: any) => {
    // Integration with email consent system
    const response = await fetch('/api/email-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error('Email consent initiation failed');
    }
  };

  const initiateVerbalConsent = async (payload: any) => {
    // For verbal consent, provider collects consent directly
    setWorkflowState(prev => ({
      ...prev,
      patientConsentStatus: 'pending',
      stage: 'patient_consent_pending'
    }));
    showInfo('Verbal Consent Required', 'Provider should collect verbal consent from patient');
  };

  const startConsentPolling = (sessionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/consent-status/${sessionId}`);
        const status = await response.json();
        
        if (status.consentReceived) {
          clearInterval(pollInterval);
          handlePatientConsentReceived(status);
        } else if (status.consentDeclined) {
          clearInterval(pollInterval);
          handlePatientConsentDeclined();
        }
      } catch (error) {
        console.error('Error polling consent status:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 30 minutes
    setTimeout(() => clearInterval(pollInterval), 30 * 60 * 1000);
  };

  const handlePatientConsentReceived = (consentData: any) => {
    setWorkflowState(prev => ({
      ...prev,
      patientConsentStatus: 'received',
      patientSignature: consentData.signature,
      patientSignatureTimestamp: consentData.timestamp,
      stage: 'patient_consent_received',
      enrollmentStatus: 'completed'
    }));

    showSuccess('Patient Consent Received', 'Enrollment can now be submitted');

    // Complete the enrollment workflow
    if (onWorkflowComplete) {
      onWorkflowComplete('completed', {
        ...enrollmentData,
        providerSignature: workflowState.providerSignature,
        providerSignatureTimestamp: workflowState.providerSignatureTimestamp,
        patientSignature: consentData.signature,
        patientSignatureTimestamp: consentData.timestamp,
        consentMethod: workflowState.patientConsentMethod
      });
    }
  };

  const handlePatientConsentDeclined = () => {
    setWorkflowState(prev => ({
      ...prev,
      patientConsentStatus: 'declined',
      enrollmentStatus: 'rejected'
    }));

    showError('Patient Consent Declined', 'Patient has declined to provide consent');

    if (onWorkflowComplete) {
      onWorkflowComplete('rejected', {
        reason: 'patient_consent_declined',
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleManualPatientConsent = (signature: string) => {
    // For verbal consent or manual signature capture
    setWorkflowState(prev => ({
      ...prev,
      patientSignature: signature,
      patientSignatureTimestamp: new Date().toISOString(),
      patientConsentStatus: 'received',
      stage: 'patient_consent_received',
      enrollmentStatus: 'completed'
    }));

    showSuccess('Patient Consent Captured', 'Enrollment is now complete');

    if (onWorkflowComplete) {
      onWorkflowComplete('completed', {
        ...enrollmentData,
        providerSignature: workflowState.providerSignature,
        providerSignatureTimestamp: workflowState.providerSignatureTimestamp,
        patientSignature: signature,
        patientSignatureTimestamp: new Date().toISOString(),
        consentMethod: 'verbal'
      });
    }
  };

  const getProgressPercentage = (): number => {
    switch (workflowState.stage) {
      case 'provider_signature': return 25;
      case 'ai_agent_triggered': return 50;
      case 'patient_consent_pending': return 75;
      case 'patient_consent_received': return 100;
      case 'enrollment_complete': return 100;
      default: return 0;
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'provider_signature': return <FileSignature className="h-5 w-5" />;
      case 'ai_agent_triggered': return <Bot className="h-5 w-5" />;
      case 'patient_consent_pending': return <Clock className="h-5 w-5" />;
      case 'patient_consent_received': return <CheckCircle className="h-5 w-5" />;
      case 'enrollment_complete': return <CheckCircle className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getConsentMethodIcon = (method: string | null) => {
    switch (method) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'sms': return <Send className="h-4 w-4" />;
      case 'voice': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'verbal': return <Mic className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            AI-Driven Consent Workflow
          </div>
          <Badge variant={workflowState.enrollmentStatus === 'completed' ? 'default' : 
                        workflowState.enrollmentStatus === 'pending_patient' ? 'secondary' : 'outline'}>
            {workflowState.enrollmentStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Provider signature → AI agent trigger → Patient consent collection → Enrollment completion
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Workflow Progress</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="w-full" />
        </div>

        {/* Current Stage */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              {getStageIcon(workflowState.stage)}
              <h3 className="text-lg font-medium">
                {workflowState.stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
            </div>

            {workflowState.stage === 'provider_signature' && (
              <div className="space-y-4">
                <Alert>
                  <FileSignature className="h-4 w-4" />
                  <AlertDescription>
                    Provider signature required to initiate patient consent process
                  </AlertDescription>
                </Alert>
                <div>
                  <h4 className="font-medium mb-2">Provider Authorization Signature</h4>
                  <SignatureCapture
                    title="Provider Authorization Signature"
                    description="Provider signature to authorize patient enrollment and consent collection"
                    onSignatureChange={handleProviderSignature}
                    required={true}
                  />
                </div>
              </div>
            )}

            {workflowState.stage === 'ai_agent_triggered' && (
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  AI agent is being initialized to handle patient consent collection...
                </AlertDescription>
              </Alert>
            )}

            {workflowState.stage === 'patient_consent_pending' && (
              <div className="space-y-4">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Patient consent request sent via {workflowState.patientConsentMethod?.toUpperCase()}. 
                    Waiting for patient response...
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  {getConsentMethodIcon(workflowState.patientConsentMethod)}
                  <span className="font-medium">Consent Method:</span>
                  <Badge variant="outline">
                    {workflowState.patientConsentMethod?.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-auto">
                    Status: {workflowState.patientConsentStatus}
                  </span>
                </div>

                {workflowState.patientConsentMethod === 'verbal' && (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Manual Patient Consent (Verbal)</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        For verbal consent, capture patient signature after obtaining verbal authorization
                      </p>
                      <SignatureCapture
                        title="Patient Consent Signature"
                        description="Patient signature confirming verbal consent to treatment"
                        onSignatureChange={handleManualPatientConsent}
                        required={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {workflowState.stage === 'patient_consent_received' && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Patient consent successfully received. Enrollment is ready for submission.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Provider Signature</div>
                    <div className="text-sm text-muted-foreground">
                      Captured: {workflowState.providerSignatureTimestamp ? 
                        new Date(workflowState.providerSignatureTimestamp).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-1">Patient Consent</div>
                    <div className="text-sm text-muted-foreground">
                      Received: {workflowState.patientSignatureTimestamp ? 
                        new Date(workflowState.patientSignatureTimestamp).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {workflowState.errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {workflowState.errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Patient Information Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {patientInfo.firstName} {patientInfo.lastName}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {patientInfo.cellPhone}
              </div>
              <div>
                <span className="font-medium">Email:</span> {patientInfo.email}
              </div>
              <div>
                <span className="font-medium">Preferred Contact:</span> {patientInfo.preferredContactMethod.toUpperCase()}
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export type { ConsentWorkflowState, PatientInformation, ProviderInformation };