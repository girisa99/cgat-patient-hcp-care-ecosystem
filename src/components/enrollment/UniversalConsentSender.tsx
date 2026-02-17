/**
 * Universal Consent Sender
 * Handles sending consent links via WhatsApp, SMS, Email, and Voice
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, CheckCircle, Loader2, AlertCircle, Phone, Mail, PhoneCall } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UniversalConsentSenderProps {
  patientPhone?: string;
  patientEmail?: string;
  patientName?: string;
  providerName?: string;
  treatmentCenter?: string;
  enrollmentId?: string;
  preferredMethod?: 'whatsapp' | 'sms' | 'email' | 'voice';
  onConsentSent?: (sessionId: string, method: string) => void;
  onConsentComplete?: (data: any) => void;
}

export const UniversalConsentSender: React.FC<UniversalConsentSenderProps> = ({
  patientPhone = '',
  patientEmail = '',
  patientName = '',
  providerName = '',
  treatmentCenter = '',
  enrollmentId,
  preferredMethod = 'whatsapp',
  onConsentSent,
  onConsentComplete
}) => {
  const [selectedMethod, setSelectedMethod] = useState(preferredMethod);
  const [contactInfo, setContactInfo] = useState(selectedMethod === 'email' ? patientEmail : patientPhone);
  const [isSending, setIsSending] = useState(false);
  const [consentStatus, setConsentStatus] = useState<'pending' | 'sent' | 'completed' | 'failed'>('pending');
  const [consentSessionId, setConsentSessionId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const generateConsentLink = () => {
    const baseUrl = window.location.origin;
    const sessionId = `consent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `${baseUrl}/consent/${sessionId}?enrollment=${enrollmentId}&provider=${encodeURIComponent(providerName)}&center=${encodeURIComponent(treatmentCenter)}`;
  };

  const sendUniversalConsent = async () => {
    if (!contactInfo) {
      toast({
        title: "Contact Information Required",
        description: `Please enter the patient's ${selectedMethod === 'email' ? 'email address' : 'phone number'}.`,
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      const link = generateConsentLink();

      if (selectedMethod === 'whatsapp') {
        // Use WhatsApp consent agent
        const { data: session, error: sessionError } = await supabase.functions.invoke('whatsapp-consent-agent', {
          body: {
            action: 'create_session',
            sessionData: {
              enrollment_id: enrollmentId,
              phone_number: contactInfo,
              patient_name: patientName,
              provider_name: providerName,
              treatment_center: treatmentCenter,
              consent_link: link,
              status: 'sent',
              consent_method: 'whatsapp_link',
              created_at: new Date().toISOString()
            }
          }
        });

        if (sessionError) throw sessionError;

        const sessionId = session?.data?.id || `temp-${Date.now()}`;
        setConsentSessionId(sessionId);

        await supabase.functions.invoke('whatsapp-consent-agent', {
          body: {
            action: 'send_consent_link',
            phone_number: contactInfo,
            consent_link: link,
            patient_name: patientName,
            provider_name: providerName,
            treatment_center: treatmentCenter,
            message_template: {
              greeting: `Hello ${patientName || 'there'}!`,
              intro: `This is a secure consent request from ${providerName} at ${treatmentCenter}.`,
              instruction: 'Please click the link below to review and provide your consent for treatment:',
              footer: 'This link is secure and will expire in 24 hours.',
              compliance_note: 'By clicking this link, you acknowledge that you understand this is for medical consent purposes.'
            }
          }
        });

        onConsentSent?.(sessionId, 'whatsapp');
      } else {
        // Use communication channels tester for SMS, Email, Voice
        const message = `Hello ${patientName || 'there'}!

This is a secure consent request from ${providerName} at ${treatmentCenter}.

Please click the link below to review and provide your consent for treatment:

${link}

This link is secure and will expire in 24 hours. If you have any questions, please contact your healthcare provider.`;

        const { data, error } = await supabase.functions.invoke('test-communication-channels', {
          body: {
            channel: selectedMethod,
            to: contactInfo,
            message: message,
            subject: selectedMethod === 'email' ? `Consent Request - ${treatmentCenter}` : undefined
          }
        });

        if (error) throw error;

        // Create a session record for tracking
        const sessionId = `${selectedMethod}-${Date.now()}`;
        setConsentSessionId(sessionId);
        
        onConsentSent?.(sessionId, selectedMethod);
      }

      setConsentStatus('sent');

      toast({
        title: "Consent Link Sent! 📱",
        description: `Consent link sent via ${selectedMethod.toUpperCase()} to ${contactInfo}. Patient will receive instructions to complete consent.`,
      });

    } catch (error) {
      console.error('Failed to send consent:', error);
      setConsentStatus('failed');
      toast({
        title: "Failed to Send Consent",
        description: `Unable to send consent link via ${selectedMethod}. Please try again or use an alternative method.`,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'voice':
        return <PhoneCall className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getStatusIcon = () => {
    switch (consentStatus) {
      case 'pending':
        return getMethodIcon(selectedMethod);
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
          {getMethodIcon(selectedMethod)}
          Universal Consent Collection
          <Badge variant={getStatusColor()}>
            {consentStatus.replace('_', ' ')}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send secure consent links via WhatsApp, SMS, Email, or Voice call
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="method">Consent Delivery Method</Label>
          <Select value={selectedMethod} onValueChange={(value: any) => {
            setSelectedMethod(value);
            setContactInfo(value === 'email' ? patientEmail : patientPhone);
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp Agent
                </div>
              </SelectItem>
              <SelectItem value="sms">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  SMS Link
                </div>
              </SelectItem>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Link
                </div>
              </SelectItem>
              <SelectItem value="voice">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4" />
                  Voice Call
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">
            {selectedMethod === 'email' ? 'Email Address' : 'Phone Number'}
          </Label>
          <Input
            id="contact"
            type={selectedMethod === 'email' ? 'email' : 'tel'}
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder={selectedMethod === 'email' ? 'patient@example.com' : '+1 (555) 123-4567'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">Patient</Label>
            <p>{patientName || 'Not specified'}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Provider</Label>
            <p>{providerName || 'Not specified'}</p>
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-muted-foreground">Treatment Center</Label>
            <p>{treatmentCenter || 'Not specified'}</p>
          </div>
        </div>

        <Button 
          onClick={sendUniversalConsent} 
          disabled={isSending || !contactInfo}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send {selectedMethod.toUpperCase()} Consent Link
            </>
          )}
        </Button>

        {consentStatus === 'sent' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Consent link sent successfully!</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              The patient will receive instructions via {selectedMethod} to complete their consent.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};