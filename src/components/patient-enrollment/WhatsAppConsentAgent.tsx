import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Phone, MapPin, Users, Shield, FileText, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppConsentAgentProps {
  enrollmentId?: string;
  onConsentComplete?: (consentData: any) => void;
}

interface ConsentSession {
  id: string;
  phone_number: string;
  location_type: 'facility' | 'remote' | 'caregiver';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  consent_method: 'whatsapp_chat' | 'whatsapp_voice' | 'verbal_phone';
  patient_info: any;
  caregiver_info?: any;
  signature_alternative?: string;
}

export const WhatsAppConsentAgent: React.FC<WhatsAppConsentAgentProps> = ({
  enrollmentId,
  onConsentComplete
}) => {
  const [activeTab, setActiveTab] = useState('setup');
  const [consentSessions, setConsentSessions] = useState<ConsentSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ConsentSession | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [locationType, setLocationType] = useState<'facility' | 'remote' | 'caregiver'>('facility');
  const [consentMethod, setConsentMethod] = useState<'whatsapp_chat' | 'whatsapp_voice' | 'verbal_phone'>('whatsapp_chat');
  const [isInitiating, setIsInitiating] = useState(false);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');

  const initiateWhatsAppConsent = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsInitiating(true);
    
    try {
      // Create consent session
      const sessionData = {
        enrollment_id: enrollmentId,
        phone_number: phoneNumber,
        location_type: locationType,
        consent_method: consentMethod,
        status: 'pending',
        session_data: {
          initiated_at: new Date().toISOString(),
          location_context: getLocationContext(locationType)
        }
      };

      const { data: session, error: sessionError } = await supabase
        .from('whatsapp_consent_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Send initial WhatsApp message
      const { error: messageError } = await supabase.functions.invoke('whatsapp-consent-agent', {
        body: {
          action: 'initiate_consent',
          phone_number: phoneNumber,
          session_id: session.id,
          location_type: locationType,
          consent_method: consentMethod,
          n8n_webhook: n8nWebhookUrl
        }
      });

      if (messageError) throw messageError;

      setCurrentSession(session);
      setActiveTab('active');
      toast.success('WhatsApp consent process initiated');

    } catch (error) {
      console.error('Failed to initiate WhatsApp consent:', error);
      toast.error('Failed to initiate consent process');
    } finally {
      setIsInitiating(false);
    }
  };

  const getLocationContext = (type: string) => {
    const contexts = {
      facility: {
        greeting: "Hello! I'm your healthcare enrollment assistant at the facility. I'll help you complete your patient enrollment and consent process.",
        verification: "Since you're at our facility, I can help you with in-person verification if needed.",
        signature_method: "digital_tablet"
      },
      remote: {
        greeting: "Hello! I'm your virtual healthcare enrollment assistant. I'll guide you through the patient enrollment from the comfort of your home.",
        verification: "I'll collect your information securely and provide digital alternatives for signatures.",
        signature_method: "voice_confirmation"
      },
      caregiver: {
        greeting: "Hello! I understand you're helping with patient enrollment as a caregiver. I'll guide you through the consent process.",
        verification: "I'll need to verify both patient and caregiver information for legal compliance.",
        signature_method: "verbal_consent"
      }
    };
    return contexts[type] || contexts.remote;
  };

  const renderConsentProgress = () => {
    if (!currentSession) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Active Consent Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="font-medium">{currentSession.phone_number}</span>
            </div>
            <Badge variant={
              currentSession.status === 'completed' ? 'default' :
              currentSession.status === 'in_progress' ? 'secondary' :
              currentSession.status === 'failed' ? 'destructive' : 'outline'
            }>
              {currentSession.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Location Type</Label>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {currentSession.location_type}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Consent Method</Label>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {currentSession.consent_method.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Information Collected:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {currentSession.patient_info?.name ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <Clock className="h-4 w-4 text-muted-foreground" />
                }
                Patient Name & Contact
              </div>
              <div className="flex items-center gap-2">
                {currentSession.patient_info?.consent_given ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <Clock className="h-4 w-4 text-muted-foreground" />
                }
                Treatment Consent
              </div>
              <div className="flex items-center gap-2">
                {currentSession.signature_alternative ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <Clock className="h-4 w-4 text-muted-foreground" />
                }
                Signature/Verbal Confirmation
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-600" />
            WhatsApp Patient Consent Agent
          </CardTitle>
          <p className="text-muted-foreground">
            Collect patient consent and enrollment information via WhatsApp with location-aware workflows
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="active">Active Sessions</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Initialize Consent Collection</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure the WhatsApp consent process based on patient location and context
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Patient/Caregiver Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location Type</Label>
                      <Select value={locationType} onValueChange={(value: any) => setLocationType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facility">🏥 At Healthcare Facility</SelectItem>
                          <SelectItem value="remote">🏠 Remote/Home</SelectItem>
                          <SelectItem value="caregiver">👥 Caregiver Assisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Consent Collection Method</Label>
                    <Select value={consentMethod} onValueChange={(value: any) => setConsentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp_chat">💬 WhatsApp Text Conversation</SelectItem>
                        <SelectItem value="whatsapp_voice">🎙️ WhatsApp Voice Messages</SelectItem>
                        <SelectItem value="verbal_phone">📞 Phone Call (Verbal Consent)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="n8n">n8n Workflow Webhook (Optional)</Label>
                    <Input
                      id="n8n"
                      placeholder="https://your-n8n-instance.com/webhook/..."
                      value={n8nWebhookUrl}
                      onChange={(e) => setN8nWebhookUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Connect to your n8n workflow for automated processing and compliance tracking
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 text-blue-800">
                      {locationType === 'facility' && '🏥 Facility Mode'}
                      {locationType === 'remote' && '🏠 Remote Mode'}
                      {locationType === 'caregiver' && '👥 Caregiver Mode'}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {getLocationContext(locationType).greeting}
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      <strong>Signature Method:</strong> {getLocationContext(locationType).signature_method.replace('_', ' ')}
                    </div>
                  </div>

                  <Button 
                    onClick={initiateWhatsAppConsent}
                    disabled={isInitiating || !phoneNumber}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isInitiating ? 'Initiating...' : 'Start WhatsApp Consent Process'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active" className="space-y-6">
              {renderConsentProgress()}
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agent Conversation Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <strong>Step 1:</strong> Initial greeting and location verification
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <strong>Step 2:</strong> Collect patient demographic information
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <strong>Step 3:</strong> Explain consent process and obtain verbal/text consent
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <strong>Step 4:</strong> Handle signature alternative (voice confirmation, caregiver verification)
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <strong>Step 5:</strong> Submit to enrollment system and send confirmation
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completed Consent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Completed consent sessions will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};