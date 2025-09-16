import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Phone, CheckCircle, Clock, Send, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutomatedWhatsAppConsentProps {
  patientData: {
    firstName?: string;
    lastName?: string;
    cellPhone?: string;
    email?: string;
  };
  providerData: {
    name?: string;
    phone?: string;
    email?: string;
    treatmentCenter?: string;
  };
  onConsentReceived?: (consentData: {
    sessionId: string;
    status: 'obtained' | 'declined';
    method: 'whatsapp_chat' | 'whatsapp_voice' | 'verbal_phone';
    timestamp: string;
    location: 'facility' | 'remote' | 'caregiver';
    patientConfirmation: any;
  }) => void;
  trigger?: boolean; // When true, automatically triggers the consent process
}

export const AutomatedWhatsAppConsent: React.FC<AutomatedWhatsAppConsentProps> = ({
  patientData,
  providerData,
  onConsentReceived,
  trigger = false
}) => {
  const [consentStatus, setConsentStatus] = useState<'idle' | 'sending' | 'sent' | 'completed' | 'failed'>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [consentResponse, setConsentResponse] = useState<any>(null);

  // Auto-trigger when patient data is sufficient and trigger is true
  useEffect(() => {
    if (trigger && patientData.cellPhone && patientData.firstName && consentStatus === 'idle') {
      initiateAutomatedConsent();
    }
  }, [trigger, patientData.cellPhone, patientData.firstName, consentStatus]);

  const initiateAutomatedConsent = async () => {
    if (!patientData.cellPhone || !patientData.firstName) {
      console.log('Insufficient patient data for automated consent');
      return;
    }

    setConsentStatus('sending');
    
    try {
      // Determine location context based on current enrollment flow
      const locationType = determineLocationContext();
      
      // Create MCP-based consent session
      const { data: session, error: sessionError } = await supabase.functions.invoke('whatsapp-consent-agent', {
        body: {
          action: 'automated_consent_initiation',
          patientData: {
            name: `${patientData.firstName} ${patientData.lastName}`.trim(),
            phone: patientData.cellPhone,
            email: patientData.email
          },
          providerData,
          locationType,
          consentMethod: 'whatsapp_chat',
          mcpIntegration: true,
          conversationalAI: {
            enabled: true,
            voiceCapable: true,
            multiModal: true
          }
        }
      });

      if (sessionError) throw sessionError;

      setSessionId(session.sessionId);
      setConsentStatus('sent');
      
      toast.success('Consent request sent to patient via WhatsApp');
      
      // Start monitoring for consent response
      startConsentMonitoring(session.sessionId);

    } catch (error) {
      console.error('Failed to initiate automated consent:', error);
      setConsentStatus('failed');
      toast.error('Failed to send consent request');
    }
  };

  const determineLocationContext = (): 'facility' | 'remote' | 'caregiver' => {
    // Logic to determine patient location context
    // This could be based on enrollment channel, time, or other factors
    const currentHour = new Date().getHours();
    const isBusinessHours = currentHour >= 8 && currentHour <= 17;
    
    // Simple heuristic - can be enhanced with more sophisticated logic
    if (isBusinessHours) {
      return 'facility'; // Likely at facility during business hours
    } else {
      return 'remote'; // Likely at home outside business hours
    }
  };

  const startConsentMonitoring = (sessionId: string) => {
    // Poll for consent response every 30 seconds
    const pollInterval = setInterval(async () => {
      try {
        const { data: status, error } = await supabase.functions.invoke('whatsapp-consent-agent', {
          body: {
            action: 'check_consent_status',
            sessionId
          }
        });

        if (error) throw error;

        if (status.consentStatus === 'completed') {
          setConsentResponse(status);
          setConsentStatus('completed');
          clearInterval(pollInterval);
          
          // Notify parent component
          onConsentReceived?.({
            sessionId,
            status: status.consentGiven ? 'obtained' : 'declined',
            method: status.method || 'whatsapp_chat',
            timestamp: new Date().toISOString(),
            location: status.location || 'remote',
            patientConfirmation: status.patientData
          });

          toast.success('Patient consent received via WhatsApp');
        }
      } catch (error) {
        console.error('Error checking consent status:', error);
      }
    }, 30000); // Check every 30 seconds

    // Stop polling after 1 hour
    setTimeout(() => {
      clearInterval(pollInterval);
      if (consentStatus === 'sent') {
        setConsentStatus('failed');
        toast.warning('Consent request timed out');
      }
    }, 3600000); // 1 hour timeout
  };

  const getStatusBadge = () => {
    switch (consentStatus) {
      case 'sending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Sending Message
          </Badge>
        );
      case 'sent':
        return (
          <Badge variant="outline">
            <MessageSquare className="h-3 w-3 mr-1" />
            Awaiting Response
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Consent Received
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  // Only render if there's activity or for debugging
  if (consentStatus === 'idle' && !trigger) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-green-600" />
          AI-Powered Consent Collection
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Automated WhatsApp consent process activated</p>
              <div className="text-sm text-muted-foreground">
                <div>• Patient: {patientData.firstName} {patientData.lastName}</div>
                <div>• Phone: {patientData.cellPhone}</div>
                <div>• Provider: {providerData.name}</div>
                {sessionId && <div>• Session: {sessionId}</div>}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {consentStatus === 'sent' && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium text-blue-800 mb-2">🤖 AI Agent Active</h4>
            <div className="text-blue-700 space-y-1">
              <div>• WhatsApp message sent with consent form link</div>
              <div>• Conversational AI standing by for questions</div>
              <div>• Voice calls available if needed</div>
              <div>• Multi-language support enabled</div>
            </div>
          </div>
        )}

        {consentResponse && (
          <div className="bg-green-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium text-green-800 mb-2">✅ Consent Completed</h4>
            <div className="text-green-700 space-y-1">
              <div>• Method: {consentResponse.method}</div>
              <div>• Location: {consentResponse.location}</div>
              <div>• Timestamp: {new Date(consentResponse.timestamp).toLocaleString()}</div>
              {consentResponse.signature && <div>• Digital signature captured</div>}
            </div>
          </div>
        )}

        {consentStatus === 'failed' && (
          <Button 
            onClick={initiateAutomatedConsent}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Retry Consent Request
          </Button>
        )}
      </CardContent>
    </Card>
  );
};