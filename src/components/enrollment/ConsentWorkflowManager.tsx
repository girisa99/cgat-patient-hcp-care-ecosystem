/**
 * Consent Workflow Manager
 * Manages the entire consent process based on collection method preferences
 * Integrates with AutomatedWhatsAppConsent and UniversalConsentSender
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Mic, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Bot,
  User
} from 'lucide-react';
import { AutomatedWhatsAppConsent } from '@/components/patient-enrollment/AutomatedWhatsAppConsent';
import { UniversalConsentSender } from '@/components/enrollment/UniversalConsentSender';
import { toast } from 'sonner';

interface ConsentWorkflowManagerProps {
  collectionMethod: 'whatsapp' | 'sms' | 'email' | 'voice' | 'verbal';
  patientData: {
    firstName: string;
    lastName: string;
    cellPhone: string;
    email: string;
  };
  providerData: {
    name: string;
    phone: string;
    email: string;
    treatmentCenter: string;
  };
  enrollmentId: string;
  onConsentInitiated?: (sessionId: string, method: string) => void;
  onConsentComplete?: (data: any) => void;
}

export const ConsentWorkflowManager: React.FC<ConsentWorkflowManagerProps> = ({
  collectionMethod,
  patientData,
  providerData,
  enrollmentId,
  onConsentInitiated,
  onConsentComplete
}) => {
  const [consentStatus, setConsentStatus] = useState<'idle' | 'initiated' | 'pending' | 'completed' | 'failed'>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [autoTrigger, setAutoTrigger] = useState(false);

  // Auto-trigger consent when patient data is complete
  useEffect(() => {
    if (patientData.firstName && 
        (patientData.cellPhone || patientData.email) && 
        consentStatus === 'idle' &&
        collectionMethod) {
      
      // Show prompt about automatic consent initiation
      const methodName = collectionMethod.toUpperCase();
      toast.success(
        `Consent Process Ready - According to patient preferences, ${methodName} consent is enabled. Consent process will be initiated automatically.`
      );
      
      // Auto-trigger after a brief delay to show the prompt
      setTimeout(() => {
        setAutoTrigger(true);
        setConsentStatus('initiated');
      }, 2000);
    }
  }, [patientData, collectionMethod, consentStatus]);

  const handleConsentInitiated = (sessionId: string, method: string) => {
    setSessionId(sessionId);
    setConsentStatus('pending');
    onConsentInitiated?.(sessionId, method);
  };

  const handleConsentComplete = (data: any) => {
    setConsentStatus('completed');
    onConsentComplete?.(data);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'sms': return <Send className="h-4 w-4" />;
      case 'voice': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'verbal': return <Mic className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    switch (consentStatus) {
      case 'initiated':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Initiating</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending Response</Badge>;
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">Ready</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Business Rule Indicator */}
      <Alert className="border-blue-200 bg-blue-50/30">
        <Bot className="h-4 w-4" />
        <AlertTitle>Automated Consent Process</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">
              Business Rule: Consent collection method is based on patient preference
            </p>
            <div className="flex items-center gap-2">
              {getMethodIcon(collectionMethod)}
              <span>Selected Method: <strong>{collectionMethod.toUpperCase()}</strong></span>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              When patient information is entered, consent link will be triggered automatically and status will show as pending until patient/caregiver completes the process.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Progress Indicator */}
      {consentStatus !== 'idle' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-blue-600" />
              Consent Workflow Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress 
                value={
                  consentStatus === 'initiated' ? 25 : 
                  consentStatus === 'pending' ? 75 : 
                  consentStatus === 'completed' ? 100 : 0
                } 
                className="w-full" 
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Information Entered</span>
                <span>Consent Sent</span>
                <span>Response Received</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Specific Workflow */}
      {collectionMethod === 'whatsapp' && (
        <AutomatedWhatsAppConsent
          patientData={patientData}
          providerData={providerData}
          trigger={autoTrigger}
          onConsentReceived={(consentData) => {
            handleConsentComplete(consentData);
            toast.success('WhatsApp Consent Received - Patient has successfully provided consent via WhatsApp.');
          }}
        />
      )}

      {/* Universal Consent Sender for other methods */}
      {['sms', 'email', 'voice'].includes(collectionMethod) && consentStatus !== 'idle' && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {getMethodIcon(collectionMethod)}
              {collectionMethod.toUpperCase()} Consent Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UniversalConsentSender
              patientPhone={patientData.cellPhone}
              patientEmail={patientData.email}
              patientName={`${patientData.firstName} ${patientData.lastName}`.trim()}
              providerName={providerData.name}
              treatmentCenter={providerData.treatmentCenter}
              enrollmentId={enrollmentId}
              preferredMethod={collectionMethod as any}
              onConsentSent={handleConsentInitiated}
              onConsentComplete={handleConsentComplete}
            />
          </CardContent>
        </Card>
      )}

      {/* Verbal Consent Option */}
      {collectionMethod === 'verbal' && consentStatus !== 'idle' && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-purple-600" />
              Verbal Consent Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                For verbal consent, please have the patient or caregiver present to provide consent directly to the healthcare provider.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => {
                handleConsentComplete({
                  sessionId: `verbal-${Date.now()}`,
                  status: 'obtained',
                  method: 'verbal',
                  timestamp: new Date().toISOString(),
                  location: 'facility'
                });
              }}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Verbal Consent Received
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Summary */}
      {sessionId && (
        <Alert className="border-green-200 bg-green-50/30">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p><strong>Session ID:</strong> {sessionId}</p>
              <p><strong>Method:</strong> {collectionMethod.toUpperCase()}</p>
              <p><strong>Status:</strong> {consentStatus === 'completed' ? 'Patient consent received' : 'Awaiting patient response'}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};