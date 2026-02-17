/**
 * WhatsApp Consent Link Sender
 * Sends consent links via WhatsApp when patient chooses WhatsApp consent method
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, CheckCircle, Loader2, AlertCircle, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppConsentSenderProps {
  patientPhone?: string;
  patientName?: string;
  providerName?: string;
  treatmentCenter?: string;
  enrollmentId?: string;
  onConsentSent?: (sessionId: string) => void;
  onConsentComplete?: (data: any) => void;
}

export const WhatsAppConsentSender: React.FC<WhatsAppConsentSenderProps> = ({
  patientPhone = '',
  patientName = '',
  providerName = '',
  treatmentCenter = '',
  enrollmentId,
  onConsentSent,
  onConsentComplete
}) => {
  const [phoneNumber, setPhoneNumber] = useState(patientPhone);
  const [isSending, setIsSending] = useState(false);
  const [consentStatus, setConsentStatus] = useState<'pending' | 'sent' | 'completed' | 'failed'>('pending');
  const [consentSessionId, setConsentSessionId] = useState<string | null>(null);
  const [consentLink, setConsentLink] = useState<string>('');
  
  const { toast } = useToast();

  const generateConsentLink = () => {
    // Generate a consent link that patient can click
    const baseUrl = window.location.origin;
    const sessionId = `consent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `${baseUrl}/consent/${sessionId}?enrollment=${enrollmentId}&provider=${encodeURIComponent(providerName)}&center=${encodeURIComponent(treatmentCenter)}`;
  };

  const sendWhatsAppConsent = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter the patient's phone number to send consent link.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Generate consent link
      const link = generateConsentLink();
      setConsentLink(link);

      // Create consent session in database
      const sessionData = {
        enrollment_id: enrollmentId,
        phone_number: phoneNumber,
        patient_name: patientName,
        provider_name: providerName,
        treatment_center: treatmentCenter,
        consent_link: link,
        status: 'sent',
        consent_method: 'whatsapp_link',
        created_at: new Date().toISOString()
      };

      // Save consent session
      const { data: session, error: sessionError } = await supabase.functions.invoke('whatsapp-consent-agent', {
        body: {
          action: 'create_session',
          sessionData
        }
      });

      if (sessionError) throw sessionError;

      const sessionId = session?.data?.id || `temp-${Date.now()}`;
      setConsentSessionId(sessionId);

      // Send consent link via WhatsApp using the enhanced function
      const { data: messageResult, error: messageError } = await supabase.functions.invoke('whatsapp-consent-agent', {
        body: {
          action: 'send_consent_link',
          phone_number: phoneNumber,
          consent_link: link,
          patient_name: patientName,
          provider_name: providerName,
          treatment_center: treatmentCenter,
          message_template: {
            greeting: `Hello ${patientName || 'there'}!`,
            intro: `This is a secure consent request from ${providerName} at ${treatmentCenter}.`,
            instruction: 'Please click the link below to review and provide your consent for treatment:',
            footer: 'This link is secure and will expire in 24 hours. If you have any questions, please contact your healthcare provider.',
            compliance_note: 'By clicking this link, you acknowledge that you understand this is for medical consent purposes.'
          }
        }
      });

      if (messageError) {
        console.error('Message sending error:', messageError);
        toast({
          title: "Consent Link Generated",
          description: "WhatsApp service may be unavailable, but consent link has been created. Please share manually if needed.",
          variant: "default"
        });
      } else {
        toast({
          title: "Consent Link Sent! 📱",
          description: `WhatsApp consent link sent to ${phoneNumber}. Patient will receive instructions to complete consent.`,
        });
      }

      setConsentStatus('sent');
      onConsentSent?.(sessionId);

      // Set up polling to check for consent completion
      startConsentPolling(sessionId);

    } catch (error) {
      console.error('Failed to send WhatsApp consent:', error);
      setConsentStatus('failed');
      toast({
        title: "Failed to Send Consent",
        description: "Unable to send WhatsApp consent link. Please try again or use an alternative method.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const startConsentPolling = (sessionId: string) => {
    const checkConsentStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('whatsapp-consent-agent', {
          body: {
            action: 'check_status',
            session_id: sessionId
          }
        });

        if (!error && data?.status === 'completed') {
          setConsentStatus('completed');
          onConsentComplete?.(data);
          
          toast({
            title: "Consent Completed! ✅",
            description: "Patient has successfully completed the consent process via WhatsApp.",
          });

          return; // Stop polling
        }
      } catch (error) {
        console.error('Error checking consent status:', error);
      }

      // Continue polling every 30 seconds for up to 1 hour
      setTimeout(checkConsentStatus, 30000);
    };

    // Start checking after 10 seconds
    setTimeout(checkConsentStatus, 10000);
  };

  const getStatusIcon = () => {
    switch (consentStatus) {
      case 'pending':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'sent':
        return <Send className="h-5 w-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (consentStatus) {
      case 'pending':
        return 'outline';
      case 'sent':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          WhatsApp Consent Collection
          <Badge variant={getStatusColor()}>
            {consentStatus.replace('_', ' ')}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send a secure consent link to the patient's WhatsApp for digital consent collection
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patient Information Display */}
        <div className="bg-white/50 p-3 rounded-lg space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Patient Name</Label>
              <div className="font-medium">{patientName || 'Not provided'}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Provider</Label>
              <div className="font-medium">{providerName || 'Not provided'}</div>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Treatment Center</Label>
              <div className="font-medium">{treatmentCenter || 'Not provided'}</div>
            </div>
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp-phone">Patient's WhatsApp Number</Label>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted text-sm">
              <Phone className="h-4 w-4" />
              +1
            </div>
            <Input
              id="whatsapp-phone"
              placeholder="Enter phone number (e.g., 2345678901)"
              value={phoneNumber.replace('+1', '')}
              onChange={(e) => setPhoneNumber('+1' + e.target.value.replace(/\D/g, ''))}
              disabled={consentStatus === 'sent' || consentStatus === 'completed'}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We'll send a secure consent link that the patient can complete on their phone
          </p>
        </div>

        {/* Send Button */}
        {consentStatus === 'pending' && (
          <Button 
            onClick={sendWhatsAppConsent} 
            disabled={isSending || !phoneNumber}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Consent Link...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send WhatsApp Consent Link
              </>
            )}
          </Button>
        )}

        {/* Status Display */}
        {consentStatus !== 'pending' && (
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="font-medium">
                {consentStatus === 'sent' && 'Consent Link Sent'}
                {consentStatus === 'completed' && 'Consent Completed'}
                {consentStatus === 'failed' && 'Failed to Send'}
              </div>
              <div className="text-sm text-muted-foreground">
                {consentStatus === 'sent' && `Sent to ${phoneNumber} - waiting for patient response`}
                {consentStatus === 'completed' && 'Patient has completed the consent process'}
                {consentStatus === 'failed' && 'Please try again or use alternative method'}
              </div>
            </div>
            {consentSessionId && (
              <Badge variant="outline" className="text-xs">
                Session: {consentSessionId.substr(-8)}
              </Badge>
            )}
          </div>
        )}

        {/* Consent Link Display (for manual sharing if needed) */}
        {consentLink && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Generated Consent Link (for manual sharing if needed)</Label>
            <div className="p-2 bg-muted rounded text-xs font-mono break-all">
              {consentLink}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <strong>How it works:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Patient receives secure WhatsApp message with consent link</li>
            <li>Patient clicks link and reviews consent information</li>
            <li>Patient provides digital signature or verbal consent confirmation</li>
            <li>Consent status automatically updates in this form</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};