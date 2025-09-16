import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Phone, 
  Settings, 
  Bot, 
  Users, 
  Zap, 
  Heart, 
  Smile,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedWhatsAppEnrollmentProps {
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
  onEnrollmentComplete?: (enrollmentData: any) => void;
  onFormDataSync?: (syncData: any) => void;
  trigger?: boolean;
}

interface AgentType {
  id: string;
  name: string;
  description: string;
  personalities: string[];
}

interface BusinessNumber {
  id: string;
  phone_number: string;
  display_name: string;
  department: string;
}

export const EnhancedWhatsAppEnrollment: React.FC<EnhancedWhatsAppEnrollmentProps> = ({
  patientData,
  providerData,
  onEnrollmentComplete,
  onFormDataSync,
  trigger = false
}) => {
  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'configuring' | 'sending' | 'active' | 'completed' | 'failed'>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedAgentType, setSelectedAgentType] = useState<string>('hybrid');
  const [selectedPersonality, setSelectedPersonality] = useState<string>('humorous_warm');
  const [selectedBusinessNumber, setSelectedBusinessNumber] = useState<string>('');
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [businessNumbers, setBusinessNumbers] = useState<BusinessNumber[]>([]);
  const [conversationPreview, setConversationPreview] = useState<any[]>([]);
  const [realTimeSyncEnabled, setRealTimeSyncEnabled] = useState(true);

  // Auto-trigger when patient data is sufficient
  useEffect(() => {
    if (trigger && patientData.cellPhone && patientData.firstName && enrollmentStatus === 'idle') {
      loadConfiguration();
    }
  }, [trigger, patientData.cellPhone, patientData.firstName, enrollmentStatus]);

  // Load agent types and business numbers
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setEnrollmentStatus('configuring');

      // Load agent types
      const { data: agentTypesData } = await supabase.functions.invoke('enhanced-whatsapp-enrollment', {
        body: { action: 'get_agent_types' }
      });

      if (agentTypesData?.success) {
        setAgentTypes(agentTypesData.agentTypes);
      }

      // Load business numbers
      const { data: numbersData } = await supabase.functions.invoke('enhanced-whatsapp-enrollment', {
        body: { action: 'get_business_numbers' }
      });

      if (numbersData?.success) {
        setBusinessNumbers(numbersData.numbers);
        // Set default number
        const defaultNumber = numbersData.numbers.find((n: BusinessNumber) => n.phone_number.includes('555-HEALTH'));
        if (defaultNumber) {
          setSelectedBusinessNumber(defaultNumber.id);
        }
      }

      setEnrollmentStatus('idle');
    } catch (error) {
      console.error('Failed to load configuration:', error);
      setEnrollmentStatus('failed');
      toast.error('Failed to load WhatsApp configuration');
    }
  };

  const initiateEnrollment = async () => {
    if (!patientData.cellPhone || !patientData.firstName) {
      toast.error('Patient phone number and name are required');
      return;
    }

    setEnrollmentStatus('sending');

    try {
      const { data, error } = await supabase.functions.invoke('enhanced-whatsapp-enrollment', {
        body: {
          action: 'initiate_enrollment',
          patientData,
          providerData,
          agentType: selectedAgentType,
          personalityType: selectedPersonality,
          businessNumberId: selectedBusinessNumber
        }
      });

      if (error) throw error;

      if (data?.success) {
        setSessionId(data.sessionId);
        setEnrollmentStatus('active');
        toast.success(`WhatsApp enrollment sent to ${patientData.firstName}!`, {
          description: `From: ${data.businessNumber} | Agent: ${selectedAgentType}`
        });

        // Start monitoring enrollment progress
        startEnrollmentMonitoring(data.sessionId);
      }
    } catch (error) {
      console.error('Failed to initiate enrollment:', error);
      setEnrollmentStatus('failed');
      toast.error('Failed to send WhatsApp enrollment');
    }
  };

  const startEnrollmentMonitoring = (sessionId: string) => {
    const checkInterval = setInterval(async () => {
      try {
        // Check session status
        const { data: session } = await supabase
          .from('whatsapp_enrollment_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (session) {
          // Update conversation preview
          setConversationPreview(prev => {
            const newEntry = {
              timestamp: new Date(),
              step: session.current_step,
              agentType: session.agent_type,
              mode: session.enrollment_mode,
              status: session.consent_status
            };
            return [...prev, newEntry].slice(-5); // Keep last 5 entries
          });

          // Check for completion
          if (session.consent_status === 'completed') {
            setEnrollmentStatus('completed');
            clearInterval(checkInterval);
            
            onEnrollmentComplete?.({
              sessionId,
              collectedData: session.collected_fields,
              consentStatus: session.consent_status,
              completedAt: session.completed_at
            });

            toast.success('🎉 WhatsApp enrollment completed!', {
              description: `${patientData.firstName} has completed their enrollment via WhatsApp`
            });
          }

          // Sync data if enabled
          if (realTimeSyncEnabled && session.collected_fields) {
            onFormDataSync?.(session.collected_fields);
          }
        }
      } catch (error) {
        console.error('Error monitoring enrollment:', error);
      }
    }, 15000); // Check every 15 seconds

    // Stop monitoring after 2 hours
    setTimeout(() => clearInterval(checkInterval), 7200000);
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'conversational': return <MessageSquare className="h-4 w-4" />;
      case 'structured': return <Settings className="h-4 w-4" />;
      case 'mcp_stepwise': return <Zap className="h-4 w-4" />;
      case 'hybrid': return <Users className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getPersonalityIcon = (personality: string) => {
    switch (personality) {
      case 'humorous_warm': return <Smile className="h-4 w-4" />;
      case 'medical_empathetic': return <Heart className="h-4 w-4" />;
      case 'friendly_professional': return <Users className="h-4 w-4" />;
      case 'casual_supportive': return <Sparkles className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    switch (enrollmentStatus) {
      case 'configuring':
        return <Badge variant="secondary"><Settings className="h-3 w-3 mr-1" />Configuring</Badge>;
      case 'sending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Sending</Badge>;
      case 'active':
        return <Badge className="bg-blue-500"><MessageSquare className="h-3 w-3 mr-1" />Active Chat</Badge>;
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return null;
    }
  };

  const selectedAgent = agentTypes.find(a => a.id === selectedAgentType);

  return (
    <Card className="border border-green-200 bg-gradient-to-br from-green-50/30 to-blue-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-green-600" />
            Enhanced WhatsApp AI Enrollment
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Patient Information */}
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Patient: {patientData.firstName} {patientData.lastName}</p>
              <p className="text-sm text-muted-foreground">Phone: {patientData.cellPhone}</p>
              <p className="text-sm text-muted-foreground">Provider: {providerData.name || 'Not specified'}</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Configuration Section */}
        {enrollmentStatus === 'idle' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Agent Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Agent Type</label>
                <Select value={selectedAgentType} onValueChange={setSelectedAgentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agentTypes.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          {getAgentTypeIcon(agent.id)}
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Personality Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Personality</label>
                <Select value={selectedPersonality} onValueChange={setSelectedPersonality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="humorous_warm">
                      <div className="flex items-center gap-2">
                        <Smile className="h-4 w-4" />
                        <span>Humorous & Warm 😄</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friendly_professional">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Friendly Professional</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medical_empathetic">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>Medical Empathetic 💚</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="casual_supportive">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Casual Supportive 😎</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Configuration Preview */}
            {selectedAgent && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Selected Configuration</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="flex items-center gap-2">
                    {getAgentTypeIcon(selectedAgentType)}
                    <span>{selectedAgent.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPersonalityIcon(selectedPersonality)}
                    <span>{selectedPersonality.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs">{selectedAgent.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Business Phone Configuration */}
            {businessNumbers.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Send From (Business Number)</label>
                <Select value={selectedBusinessNumber} onValueChange={setSelectedBusinessNumber}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {businessNumbers.map((number) => (
                      <SelectItem key={number.id} value={number.id}>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{number.display_name}</p>
                            <p className="text-xs text-muted-foreground">{number.phone_number} • {number.department}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* Launch Button */}
            <Button 
              onClick={initiateEnrollment}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              size="lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Launch WhatsApp Enrollment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Active Status */}
        {enrollmentStatus === 'active' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">🤖 AI Agent Active</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• WhatsApp conversation in progress</div>
                <div>• Agent Type: {selectedAgent?.name}</div>
                <div>• Personality: {selectedPersonality.replace('_', ' ')}</div>
                <div>• Real-time sync: {realTimeSyncEnabled ? 'Enabled' : 'Disabled'}</div>
                {sessionId && <div>• Session: {sessionId.slice(0, 8)}...</div>}
              </div>
            </div>

            {/* Conversation Preview */}
            {conversationPreview.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recent Activity</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {conversationPreview.map((entry, index) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                      <span className="font-medium">{entry.step}</span> • 
                      <span className="text-muted-foreground ml-1">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed Status */}
        {enrollmentStatus === 'completed' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">✅ Enrollment Completed!</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>• Patient successfully completed WhatsApp enrollment</div>
              <div>• All required information collected</div>
              <div>• Consent obtained and verified</div>
              <div>• Data automatically synced to form</div>
            </div>
          </div>
        )}

        {/* Failed Status */}
        {enrollmentStatus === 'failed' && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to initiate WhatsApp enrollment. Please check configuration and try again.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={initiateEnrollment}
              variant="outline"
              className="w-full"
            >
              Retry Enrollment
            </Button>
          </div>
        )}

        {/* Features Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-3">✨ Enhanced Features</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>• Multi-agent AI types</div>
            <div>• Personality customization</div>
            <div>• WhatsApp + Voice options</div>
            <div>• Real-time form sync</div>
            <div>• Humor & empathy</div>
            <div>• MCP protocol integration</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};