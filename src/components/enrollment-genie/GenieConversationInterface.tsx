/**
 * ENHANCED GENIE CONVERSATION INTERFACE
 * Fully integrated with enrollment form backend and AI Assistant Configuration
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Settings, 
  Sparkles, 
  Brain, 
  Users, 
  Globe, 
  Monitor,
  FileText,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Plus,
  Bot,
  Scan,
  MousePointer,
  Play,
  TestTube,
  Shield,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ConversationManager } from '@/components/conversation/ConversationManager';
import { EnrollmentJourneySteps } from '@/components/patient-enrollment/EnrollmentJourneySteps';
import { PatientEnrollmentFlow } from '@/components/patient-enrollment/PatientEnrollmentFlow';
import { ComprehensiveEnrollmentForm } from './ComprehensiveEnrollmentForm';
import { supabase } from '@/integrations/supabase/client';

interface GenieConversationInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  userId?: string;
  context?: string;
  mode?: 'general' | 'enrollment';
  onModeChange?: (mode: 'general' | 'enrollment') => void;
}

export const GenieConversationInterface: React.FC<GenieConversationInterfaceProps> = ({
  isOpen,
  onClose,
  tenantId,
  userId,
  context = 'general',
  mode = 'enrollment',
  onModeChange
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'enrollment'>('enrollment');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<any>({});
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [sectionsData, setSectionsData] = useState<Record<string, any>>({});
  const [showAIAssistantConfig, setShowAIAssistantConfig] = useState(false);
  const [selectedSubmissionMethod, setSelectedSubmissionMethod] = useState<string | null>(null);
  const [showEnrollmentFlow, setShowEnrollmentFlow] = useState(false);
  const [sessionId, setSessionId] = useState(`enrollment_${Date.now()}`);
  const [enrollmentId, setEnrollmentId] = useState<string>('');
  const [isStartingSession, setIsStartingSession] = useState(false);
  
  // Simplified AI configuration for enrollment mode
  const [selectedLLM, setSelectedLLM] = useState('openai/gpt-4o-mini');
  const [conversationMode, setConversationMode] = useState<'single' | 'multi-model'>('single');
  
  console.log('🎭 GenieConversationInterface render', { 
    isOpen, 
    activeTab, 
    currentStep,
    showAIAssistantConfig,
    selectedSubmissionMethod
  });

  const enrollmentSteps = [
    { title: 'Submission Method', section: 'submission_method' },
    { title: 'Consent Management', section: 'consent' },
    { title: 'Patient Info', section: 'patient' },
    { title: 'Provider Info', section: 'provider' },
    { title: 'Insurance', section: 'insurance' },
    { title: 'Treatment & Clinical Assessment', section: 'clinical' },
    { title: 'Submit', section: 'submit' }
  ];

  const submissionMethods = [
    {
      id: 'ai_agent',
      title: 'AI Agent',
      description: 'Conversational AI-guided enrollment with intelligent form completion',
      icon: Bot,
      features: ['Create AI Agent', 'Structured AI', 'NPI Verification', 'Credentialing Agent'],
      hasSubOptions: true
    },
    {
      id: 'fill_fax',
      title: 'Download Form Fill & Fax (OCR)',
      description: 'Download, fill manually, and fax with OCR processing',
      icon: Scan,
      features: ['OCR Processing', 'Auto-populate fields', 'Validation checks', 'Digital conversion']
    },
    {
      id: 'online_pdf',
      title: 'Online PDF Download & Submit',
      description: 'Digital PDF form completion with signature capture',
      icon: FileText,
      features: ['Interactive PDF', 'Digital signatures', 'Progress saving', 'Export options']
    },
    {
      id: 'online_form',
      title: 'Online Form Without Assistance',
      description: 'Self-service web-based enrollment form',
      icon: MousePointer,
      features: ['Real-time validation', 'Section-based progress', 'Mobile responsive', 'No assistance']
    }
  ];

  const handleNewSession = useCallback(() => {
    setIsStartingSession(true);
    // Reset all states
    setCurrentStep(0);
    setCompletedSteps([]);
    setEnrollmentData({});
    setConversationHistory([]);
    setSectionsData({});
    setSelectedSubmissionMethod(null);
    setShowAIAssistantConfig(false);
    setShowEnrollmentFlow(false);
    setSessionId(`enrollment_${Date.now()}`);
    setEnrollmentId('');
    
    setTimeout(() => {
      setIsStartingSession(false);
      toast.success('New Session Started', { 
        description: 'Ready for fresh enrollment conversation'
      });
    }, 500);
  }, []);

  const saveToBackend = useCallback(async (sectionId: string, data: any) => {
    if (!enrollmentId) return;
    
    try {
      console.log('💾 Saving to backend:', sectionId, data);
      
      // Save based on section type using the same logic as ComprehensiveEnrollmentForm
      switch (sectionId) {
        case 'consent':
          await supabase.from('enrollment_consent').upsert({
            enrollment_id: enrollmentId,
            consent_to_treatment: data.consent_to_treatment || false,
            hipaa_authorization: data.hipaa_authorization || false,
            financial_responsibility: data.financial_responsibility || false,
            communication_consent: data.communication_consent || false,
            telehealth_consent: data.telehealth_consent || false,
            marketing_consent: data.marketing_consent || false,
            consent_date: new Date().toISOString(),
            patient_signature: data.patient_signature || ''
          });
          break;
          
        case 'patient':
          await supabase.from('enrollment_patient_info').upsert({
            enrollment_id: enrollmentId,
            first_name: data.first_name || data.firstName || '',
            last_name: data.last_name || data.lastName || '',
            middle_name: data.middle_name || data.middleName || '',
            date_of_birth: data.date_of_birth || data.dateOfBirth || null,
            ssn: data.ssn || '',
            gender: data.gender || '',
            phone: data.phone || data.phoneNumber || '',
            email: data.email || '',
            address_line1: data.address_line1 || data.address || '',
            address_line2: data.address_line2 || '',
            city: data.city || '',
            state: data.state || '',
            zip_code: data.zip_code || data.zipCode || '',
            emergency_contact_name: data.emergency_contact_name || data.emergencyContactName || '',
            emergency_contact_phone: data.emergency_contact_phone || data.emergencyContactPhone || '',
            emergency_contact_relationship: data.emergency_contact_relationship || data.emergencyContactRelationship || '',
            preferred_language: data.preferred_language || 'English',
            marital_status: data.marital_status || data.maritalStatus || '',
            occupation: data.occupation || '',
            employer: data.employer || ''
          });
          break;
          
        case 'provider':
          await supabase.from('enrollment_provider_info').upsert({
            enrollment_id: enrollmentId,
            referring_provider_name: data.referring_provider_name || data.providerName || '',
            referring_provider_npi: data.referring_provider_npi || data.npi || '',
            referring_provider_phone: data.referring_provider_phone || data.providerPhone || '',
            primary_care_physician: data.primary_care_physician || data.pcpName || '',
            pcp_npi: data.pcp_npi || '',
            pcp_phone: data.pcp_phone || '',
            treatment_facility: data.treatment_facility || data.facilityName || '',
            facility_npi: data.facility_npi || '',
            facility_address: data.facility_address || '',
            treatment_type: data.treatment_type || '',
            treatment_start_date: data.treatment_start_date || null,
            diagnosis_codes: data.diagnosis_codes || [],
            treatment_plan: data.treatment_plan || {},
            npi_verification_status: 'pending',
            credentialing_status: 'pending'
          });
          break;
          
        case 'insurance':
          await supabase.from('enrollment_insurance_info').upsert({
            enrollment_id: enrollmentId,
            primary_insurance_name: data.primary_insurance_name || data.insuranceName || '',
            primary_policy_number: data.primary_policy_number || data.policyNumber || '',
            primary_group_number: data.primary_group_number || data.groupNumber || '',
            primary_subscriber_name: data.primary_subscriber_name || data.subscriberName || '',
            primary_subscriber_dob: data.primary_subscriber_dob || null,
            primary_subscriber_relationship: data.primary_subscriber_relationship || 'self',
            primary_effective_date: data.primary_effective_date || null,
            secondary_insurance_name: data.secondary_insurance_name || '',
            secondary_policy_number: data.secondary_policy_number || '',
            copay_amount: parseFloat(data.copay_amount || data.copay || '0') || 0,
            deductible_amount: parseFloat(data.deductible_amount || data.deductible || '0') || 0,
            prior_authorization_required: data.prior_authorization_required || false
          });
          break;
          
        case 'clinical':
          await supabase.from('enrollment_clinical_info').upsert({
            enrollment_id: enrollmentId,
            chief_complaint: data.chief_complaint || data.chiefComplaint || '',
            current_medications: data.current_medications || data.medications || [],
            medical_history: data.medical_history || data.medicalHistory || [],
            allergies: data.allergies || [],
            vital_signs: data.vital_signs || {},
            clinical_notes: data.clinical_notes || ''
          });
          break;
      }
      
      // Update main enrollment progress
      const progress = Math.round(((currentStep + 1) / enrollmentSteps.length) * 100);
      await supabase.from('patient_enrollments').upsert({
        id: enrollmentId,
        session_id: sessionId,
        user_id: userId || null,
        tenant_id: tenantId,
        current_section: sectionId,
        progress_percentage: progress,
        updated_at: new Date().toISOString()
      });
      
      console.log('✅ Successfully saved to backend:', sectionId);
      
    } catch (error) {
      console.error('❌ Failed to save to backend:', error);
      toast.error('Failed to save data to backend');
    }
  }, [enrollmentId, sessionId, userId, tenantId, currentStep, enrollmentSteps.length]);

  const handleDataCapture = useCallback((capturedData: any) => {
    const currentSection = enrollmentSteps[currentStep]?.section || 'general';
    
    console.log('📊 Data captured for section:', currentSection, capturedData);
    
    // Update sections data
    setSectionsData(prev => ({
      ...prev,
      [currentSection]: {
        ...prev[currentSection],
        ...capturedData
      }
    }));
    
    // Update enrollment data
    setEnrollmentData(prev => ({
      ...prev,
      ...capturedData
    }));
    
    // Update conversation history
    setConversationHistory(prev => [...prev, {
      timestamp: new Date().toISOString(),
      section: currentSection,
      data: capturedData
    }]);
    
    // Save to backend (non-blocking)
    saveToBackend(currentSection, capturedData);
    
    // Mark step as completed if it has data
    if (Object.keys(capturedData).length > 0) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      // Auto-advance to next step after a delay
      setTimeout(() => {
        if (currentStep < enrollmentSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
          toast.success(`${enrollmentSteps[currentStep].title} completed!`, {
            description: `Moving to ${enrollmentSteps[currentStep + 1]?.title}`
          });
        }
      }, 2000);
    }
    
    toast.success('Information captured', {
      description: `Data saved to ${enrollmentSteps[currentStep]?.title} section`
    });
  }, [currentStep, enrollmentSteps, completedSteps, saveToBackend]);

  // Initialize enrollment session
  useEffect(() => {
    if (!enrollmentId && isOpen) {
      const initEnrollment = async () => {
        try {
          const { data, error } = await supabase
            .from('patient_enrollments')
            .insert({
              session_id: sessionId,
              user_id: userId || null,
              tenant_id: tenantId,
              current_section: 'submission_method',
              progress_percentage: 0
            })
            .select()
            .single();

          if (error) throw error;
          setEnrollmentId(data.id);
          console.log('✅ Enrollment session initialized:', data.id);
        } catch (error) {
          console.error('❌ Failed to initialize enrollment session:', error);
        }
      };
      
      initEnrollment();
    }
  }, [enrollmentId, sessionId, userId, tenantId, isOpen]);

  // Show AI Assistant Configuration for submission method selection
  if (currentStep === 0 && !selectedSubmissionMethod && activeTab === 'enrollment') {
    return (
      <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${!isOpen ? 'hidden' : ''}`}>
        <div className="bg-background rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] mx-4 flex flex-col">
          <div className="flex-shrink-0 border-b bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">AI Assistant Configuration</h2>
                  <p className="text-xs text-muted-foreground">Choose your enrollment submission method</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Patient Enrollment</h3>
              <p className="text-muted-foreground">
                Choose how you'd like to complete the enrollment process
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissionMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <Card 
                    key={method.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50"
                    onClick={() => {
                      setSelectedSubmissionMethod(method.id);
                      if (method.id === 'ai_agent') {
                        setShowAIAssistantConfig(true);
                      } else {
                        // For other methods, proceed directly to next step
                        setCurrentStep(1);
                        toast.success(`Selected: ${method.title}`);
                      }
                    }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{method.title}</CardTitle>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {method.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* AI Agent Sub-options */}
            {selectedSubmissionMethod === 'ai_agent' && showAIAssistantConfig && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Agent Configuration
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure your AI-powered enrollment workflow
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setShowEnrollmentFlow(true);
                        setShowAIAssistantConfig(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Create AI Agent</h4>
                          <p className="text-xs text-muted-foreground">Build custom workflow templates</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card 
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setCurrentStep(1);
                        setShowAIAssistantConfig(false);
                        toast.success('Starting Structured AI enrollment');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Structured AI</h4>
                          <p className="text-xs text-muted-foreground">Pre-configured enrollment flow</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">NPI Verification</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Automated provider verification</p>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Credentialing Agent</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">AI-powered credentialing</p>
                    </Card>
                    
                    <Card className="p-3">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Deployment Ready</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Environment & channel setup</p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show PatientEnrollmentFlow for Create AI Agent
  if (showEnrollmentFlow) {
    return (
      <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${!isOpen ? 'hidden' : ''}`}>
        <div className="bg-background rounded-lg shadow-2xl max-w-7xl w-full max-h-[95vh] mx-4 overflow-hidden">
          <PatientEnrollmentFlow 
            onClose={() => {
              setShowEnrollmentFlow(false);
              setSelectedSubmissionMethod(null);
              setShowAIAssistantConfig(false);
            }}
          />
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Genie</h2>
                  <p className="text-xs text-muted-foreground">AI Technical Navigator</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as 'general' | 'enrollment')}>
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
                  <TabsTrigger value="enrollment" className="text-xs">Enrollment</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleNewSession}
                disabled={isStartingSession}
                className="text-xs"
              >
                {isStartingSession ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    New Session
                  </>
                )}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          <Tabs value={activeTab} className="flex-1 flex flex-col">
            <TabsContent value="general" className="flex-1 p-4">
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">General AI Assistant</h3>
                    <p className="text-muted-foreground">
                      General purpose AI conversation interface
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enrollment" className="flex-1 flex flex-col overflow-hidden">
              {/* Enrollment Progress */}
              <div className="flex-shrink-0 p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Enrollment Progress</span>
                  </div>
                  <Badge variant="outline">
                    {completedSteps.length} of {enrollmentSteps.length} completed
                  </Badge>
                </div>
                <EnrollmentJourneySteps
                  currentStep={currentStep}
                  onStepClick={(step) => {
                    setCurrentStep(step);
                    toast.info(`Switched to ${enrollmentSteps[step]?.title}`);
                  }}
                  completedSteps={completedSteps}
                />
              </div>

              {/* Conversation Area */}
              <div className="flex-1 flex overflow-hidden">
                {/* Chat */}
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b">
                    <h3 className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      AI Enrollment Assistant
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Currently working on: <strong>{enrollmentSteps[currentStep]?.title}</strong>
                    </p>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <ConversationManager
                      agentId="enrollment-agent"
                      enrollmentContext={{
                        process_type: 'patient_enrollment',
                        current_section: enrollmentSteps[currentStep]?.section || 'general',
                        step: currentStep,
                        total_steps: enrollmentSteps.length,
                        capture_fields: [
                          'personal_information',
                          'medical_history', 
                          'insurance_details',
                          'contact_information',
                          'emergency_contacts',
                          'preferences'
                        ]
                      }}
                      onDataCapture={handleDataCapture}
                    />
                  </div>
                </div>

                {/* Section Summary */}
                <div className="w-80 border-l flex flex-col">
                  <div className="p-4 border-b">
                    <h3 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {enrollmentSteps[currentStep]?.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Section {currentStep + 1} of {enrollmentSteps.length}
                    </p>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto">
                    {sectionsData[enrollmentSteps[currentStep]?.section] ? (
                      <div className="space-y-3">
                        <Badge 
                          variant={completedSteps.includes(currentStep) ? "default" : "outline"}
                          className="w-full justify-center"
                        >
                          {completedSteps.includes(currentStep) ? "Complete" : "In Progress"}
                        </Badge>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Captured Information:</h4>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            {Object.entries(sectionsData[enrollmentSteps[currentStep]?.section] || {}).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-1">
                                <span className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="text-xs font-medium">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {currentStep < enrollmentSteps.length - 1 && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                Next: {enrollmentSteps[currentStep + 1]?.title}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Start the conversation to capture information for this section
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};