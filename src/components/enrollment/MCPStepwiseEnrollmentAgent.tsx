/**
 * MCP STEPWISE ENROLLMENT AGENT
 * True stepwise form-based enrollment (NOT conversational)
 * Uses field-by-field collection with real-time sync
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Shield, 
  FileCheck, 
  CheckCircle,
  Database,
  Activity,
  Zap,
  AlertCircle,
  Heart,
  Building2,
  CreditCard,
  Stethoscope
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ENROLLMENT_SECTION_MAPPINGS, 
  getSectionByKey, 
  getNextSection,
  type EnrollmentSectionKey,
  type PatientEnrollmentSession,
  type EnrollmentSource,
  type ConsentMethod
} from '@/types/patientEnrollmentMapping';

// Enhanced components for better UX
import { EnrollmentSectionProgressTracker } from '../patient-enrollment/EnrollmentSectionProgressTracker';
import { FieldByFieldCollector, type FieldDefinition } from '../patient-enrollment/FieldByFieldCollector';
import { EnhancedRealtimeProgressTracker } from '../patient-enrollment/EnhancedRealtimeProgressTracker';
import { EnhancedSectionCompletionModal } from '../patient-enrollment/EnhancedSectionCompletionModal';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface MCPSession {
  sessionId: string;
  patientId: string;
  currentStep: string;
  mcpTools: string[];
}

interface MCPStepwiseEnrollmentAgentProps {
  moduleType: ModuleType;
  enrollmentSource: EnrollmentSource;
  onComplete?: (result: { instanceId: string; pdfUrl?: string }) => void;
  onCancel?: () => void;
}

// MCP Enrollment Steps (Form-based, not conversational)
const enrollmentSteps = [
  {
    id: 'consent_management',
    name: 'Consent Management',
    icon: Shield,
    description: 'Provider authorization and consent collection setup',
    requiredFields: ['provider_name', 'provider_npi', 'treatment_center', 'patient_consent_method', 'provider_signature'],
    validationRules: {
      provider_npi: { pattern: /^\d{10}$/, required: true },
      provider_name: { minLength: 2, required: true }
    },
    mcpTools: ['get_schema', 'insert_data', 'query_data'],
    realtimeEnabled: true,
    aiPrompt: 'Collecting provider consent information...'
  },
  {
    id: 'patient_information',
    name: 'Patient Information',
    icon: User,
    description: 'Complete patient demographics and contact information',
    requiredFields: ['first_name', 'last_name', 'date_of_birth', 'email', 'phone'],
    validationRules: {
      email: { type: 'email', required: true },
      phone: { type: 'tel', required: true }
    },
    mcpTools: ['get_schema', 'insert_data', 'query_data'],
    realtimeEnabled: true,
    aiPrompt: 'Collecting patient information...'
  },
  {
    id: 'provider_treatment_center', 
    name: 'Provider & Treatment Center',
    icon: Building2,
    description: 'NPI verification and credentialing information',
    requiredFields: ['referring_provider_npi'],
    validationRules: {
      referring_provider_npi: { pattern: /^\d{10}$/, required: true }
    },
    mcpTools: ['verify_npi', 'check_credentials', 'get_schema'],
    realtimeEnabled: true,
    aiPrompt: 'Verifying provider credentials...'
  },
  {
    id: 'insurance_information',
    name: 'Insurance Information',
    icon: CreditCard,
    description: 'Insurance coverage and benefit verification',
    requiredFields: ['insurance_provider', 'member_id', 'policy_holder'],
    validationRules: {
      member_id: { minLength: 3, required: true }
    },
    mcpTools: ['verify_insurance', 'get_schema', 'insert_data'],
    realtimeEnabled: true,
    aiPrompt: 'Verifying insurance information...'
  },
  {
    id: 'clinical_treatment',
    name: 'Clinical & Treatment',
    icon: Stethoscope,
    description: 'Clinical information and treatment planning',
    requiredFields: ['primary_diagnosis', 'treatment_goals'],
    validationRules: {
      primary_diagnosis: { minLength: 5, required: true }
    },
    mcpTools: ['get_schema', 'insert_data'],
    realtimeEnabled: true,
    aiPrompt: 'Collecting clinical information...'
  },
  {
    id: 'final_submit',
    name: 'Final Submission',
    icon: CheckCircle,
    description: 'Review and submit enrollment',
    requiredFields: ['final_review_complete'],
    validationRules: {},
    mcpTools: ['generate_pdf', 'submit_enrollment'],
    realtimeEnabled: true,
    aiPrompt: 'Finalizing enrollment...'
  }
];

export const MCPStepwiseEnrollmentAgent: React.FC<MCPStepwiseEnrollmentAgentProps> = ({
  moduleType,
  enrollmentSource,
  onComplete,
  onCancel
}) => {
  // State Management
  const [mcpSession, setMcpSession] = useState<MCPSession | null>(null);
  const [patientEnrollmentSession, setPatientEnrollmentSession] = useState<PatientEnrollmentSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [consentMethod, setConsentMethod] = useState<ConsentMethod | null>(null);
  const [consentSubStep, setConsentSubStep] = useState<'provider_info' | 'treatment_center' | 'patient_method' | 'provider_signature'>('provider_info');
  const [showSectionCompletion, setShowSectionCompletion] = useState(false);
  const [completedSectionData, setCompletedSectionData] = useState<{ sectionKey: string; completedAt: Date } | null>(null);
  
  const { toast } = useToast();
  const signatureRef = useRef<SignatureCanvas | null>(null);
  
  // Generate unique patient ID
  const patientId = patientEnrollmentSession?.patient_id || `${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`;

  // Initialize MCP Session
  const initializeMCPSession = async () => {
    try {
      const sessionId = `mcp-${Date.now()}`;
      // Generate a proper UUID for patientId if not already valid
      const validPatientId = patientId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
        ? patientId 
        : crypto.randomUUID();
      
      const newSession: MCPSession = {
        sessionId,
        patientId: validPatientId,
        currentStep: enrollmentSteps[0].id,
        mcpTools: enrollmentSteps[0].mcpTools
      };

      const currentTime = new Date().toISOString();
      const enrollmentSession: PatientEnrollmentSession = {
        patient_id: validPatientId,
        session_id: sessionId,
        enrollment_source: enrollmentSource,
        consent_method: 'digital_signature', // Default
        current_section: 'consent_management',
        enrollment_status: 'in_progress',
        progress_percentage: 0,
        created_at: currentTime,
        updated_at: currentTime,
        metadata: {
          agent_type: 'mcp_stepwise',
          module_type: moduleType,
          form_based: true
        }
      };

      setMcpSession(newSession);
      setPatientEnrollmentSession(enrollmentSession);
      
      // Initialize in database
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user?.id) {
        toast({
          title: "Sign-in required",
          description: "Please sign in to start enrollment.",
          variant: "destructive",
        });
        return null;
      }

      await supabase.from('patient_enrollments').insert({
        id: validPatientId,
        session_id: sessionId,
        enrollment_status: 'in_progress',
        current_section: 'consent_management',
        progress_percentage: 0,
        enrollment_source: enrollmentSource,
        metadata: enrollmentSession.metadata,
        user_id: authUser.user.id,
        created_at: currentTime,
        updated_at: currentTime
      });

      toast({
        title: "MCP Session Initialized",
        description: `Stepwise enrollment ready for Patient ID: ${validPatientId}`,
      });
      
      return { session: newSession, enrollment: enrollmentSession };
      
    } catch (error) {
      console.error('Failed to initialize MCP session:', error);
      toast({
        title: "Session Error",
        description: "Failed to start enrollment. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update real-time data with proper mapping and enhanced date handling
  const updateRealtimeDataWithMapping = async (sectionMapping: any, data: Record<string, any>) => {
    try {
      const mappedData: Record<string, any> = {};
      
      // Map data to proper column names with proper type handling
      sectionMapping.fields.forEach((field: any) => {
        if (data[field.fieldKey] !== undefined) {
          let value = data[field.fieldKey];
          
          // Enhanced date field handling to prevent toISOString errors
          if (field.fieldType === 'date' && value) {
            try {
              // Handle various date formats
              if (typeof value === 'string') {
                // Check if it's already an ISO string
                if (value.includes('T') && value.includes('Z')) {
                  value = value; // Already ISO format
                } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  // Date-only format, convert to ISO
                  value = new Date(value + 'T00:00:00.000Z').toISOString();
                } else {
                  // Try to parse as date
                  const parsedDate = new Date(value);
                  if (!isNaN(parsedDate.getTime())) {
                    value = parsedDate.toISOString();
                  } else {
                    console.warn(`Invalid date value for ${field.fieldKey}:`, value);
                    value = null;
                  }
                }
              } else if (value instanceof Date) {
                if (!isNaN(value.getTime())) {
                  value = value.toISOString();
                } else {
                  console.warn(`Invalid Date object for ${field.fieldKey}:`, value);
                  value = null;
                }
              } else {
                console.warn(`Unexpected date type for ${field.fieldKey}:`, typeof value, value);
                value = null;
              }
            } catch (dateError) {
              console.error(`Date processing error for ${field.fieldKey}:`, dateError);
              value = null;
            }
          }
          
          mappedData[field.destinationColumn] = value;
        }
      });

      const updateData = {
        ...mappedData,
        updated_at: new Date().toISOString()
      };

      if (sectionMapping.destinationTable === 'patient_enrollments') {
        await supabase
          .from('patient_enrollments')
          .update(updateData)
          .eq('id', patientId);
      } else {
        await supabase
          .from(sectionMapping.destinationTable)
          .upsert({
            ...updateData,
            enrollment_id: patientId
          });
      }

      setCollectedData(prev => ({ ...prev, ...data }));

      // Update progress with proper error handling
      const progress = Math.round(((currentStepIndex + 1) / enrollmentSteps.length) * 100);
      
      const progressUpdate = { 
        progress_percentage: progress,
        current_section: sectionMapping.sectionKey,
        updated_at: new Date().toISOString()
      };
      
      await supabase
        .from('patient_enrollments')
        .update(progressUpdate)
        .eq('id', patientId);

    } catch (error) {
      console.error('Real-time update error:', error);
      toast({
        title: "Update Error",
        description: "Failed to save data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check step completion
  const checkStepCompletionWithMapping = (sectionMapping: any, data: Record<string, any>): boolean => {
    return sectionMapping.requiredFields.every((field: string) => {
      return data[field] && data[field].toString().trim() !== '';
    });
  };

  // Advance to next step
  const advanceToNextStep = async () => {
    if (currentStepIndex < enrollmentSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      
      const nextStep = enrollmentSteps[nextIndex];
      setMcpSession(prev => prev ? {
        ...prev,
        currentStep: nextStep.id,
        mcpTools: nextStep.mcpTools
      } : null);

      // Update database
      await supabase
        .from('patient_enrollments')
        .update({ 
          current_section: nextStep.id as EnrollmentSectionKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      toast({
        title: "Section Completed",
        description: `Moving to ${nextStep.name}`,
      });
    }
  };

  // Handle provider signature
  const handleAcceptSignature = async () => {
    try {
      if (!signatureRef.current) return;
      const dataUrl = signatureRef.current.getTrimmedCanvas().toDataURL('image/png');
      if (!dataUrl || dataUrl.length < 200) {
        toast({ title: 'Signature required', description: 'Please sign in the box before accepting.', variant: 'destructive' });
        return;
      }
      
      const sectionMapping = getSectionByKey('consent_management');
      await updateRealtimeDataWithMapping(sectionMapping, { provider_signature: dataUrl });

      const merged = { ...collectedData, provider_signature: dataUrl };
      const complete = checkStepCompletionWithMapping(sectionMapping as any, merged);
      if (complete) {
        toast({
          title: "Consent Management Completed! 🎉",
          description: "All consent information captured. Moving to patient information.",
        });
        setTimeout(() => advanceToNextStep(), 1000);
      }
    } catch (e) {
      console.error('Signature accept error', e);
      toast({ title: 'Error', description: 'Failed to save signature. Please try again.', variant: 'destructive' });
    }
  };

  // Convert enrollment section to FieldDefinition format
  const convertToFieldDefinitions = (sectionKey: EnrollmentSectionKey): FieldDefinition[] => {
    const sectionMapping = getSectionByKey(sectionKey);
    
    console.log(`Converting fields for section: ${sectionKey}`, sectionMapping.fields);
    
    return sectionMapping.fields.map(field => {
      const base: FieldDefinition = {
        name: field.fieldKey,
        displayName: field.fieldLabel,
        type: field.fieldType as 'text' | 'email' | 'phone' | 'date' | 'select' | 'textarea' | 'number',
        isRequired: field.required,
        placeholder: field.placeholder || `Enter ${field.fieldLabel.toLowerCase()}`,
        validation: {
          pattern: field.fieldKey === 'provider_npi' || field.fieldKey === 'referring_provider_npi' ? /^\d{10}$/ : undefined,
          minLength: field.fieldType === 'email' ? 5 : field.fieldKey.includes('name') ? 2 : undefined
        }
      };

      // Provide options for select fields so dropdowns render correctly
      if (field.fieldType === 'select' && Array.isArray(field.options)) {
        const toLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return {
          ...base,
          options: field.options.map((opt) => ({ value: opt, label: toLabel(opt) })),
        };
      }

      console.log(`Generated field definition:`, base);
      return base;
    });
  };

  // Initialize session on component mount
  useEffect(() => {
    if (!mcpSession) {
      initializeMCPSession();
    }
  }, [mcpSession]);

  const currentStep = enrollmentSteps[currentStepIndex];
  const progress = Math.round(((currentStepIndex + 1) / enrollmentSteps.length) * 100);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                MCP Patient Enrollment Agent
                <Badge variant="secondary">Stepwise Forms</Badge>
              </CardTitle>
              {patientEnrollmentSession && (
                <div className="text-sm text-muted-foreground">
                  Patient ID: {patientId} | Source: MCP Stepwise | Status: {patientEnrollmentSession.enrollment_status}
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Current Step - FORM INTERFACE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <currentStep.icon className="h-5 w-5" />
                  {currentStep.name}
                  {currentStep.realtimeEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Activity className="h-3 w-3 mr-1" />
                      Real-time
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* MCP STEPWISE FORM - Field by Field Collection */}
              {!mcpSession ? (
                <div className="text-center text-muted-foreground py-8">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Initializing MCP stepwise form...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      MCP Stepwise Form: Complete each field to advance to the next section
                    </AlertDescription>
                  </Alert>
                  
                  {/* Field-by-Field Collector for MCP Stepwise */}
                  <FieldByFieldCollector
                    key={currentStep.id}
                    sectionTitle={currentStep.name}
                    sectionDescription={currentStep.description}
                    fields={convertToFieldDefinitions(currentStep.id as EnrollmentSectionKey)}
                    initialData={collectedData}
                    onFieldUpdate={async (fieldName, value) => {
                      console.log(`Field updated: ${fieldName} = ${value}`);
                      const sectionMapping = getSectionByKey(currentStep.id as EnrollmentSectionKey);
                      await updateRealtimeDataWithMapping(sectionMapping, { [fieldName]: value });
                    }}
                    onSectionComplete={async (data) => {
                      console.log(`Section completed: ${currentStep.id}`, data);
                      setCollectedData(prev => ({ ...prev, ...data }));
                      
                      // Mark section as completed
                      const sectionMapping = getSectionByKey(currentStep.id as EnrollmentSectionKey);
                      setCompletedSectionData({
                        sectionKey: currentStep.id,
                        completedAt: new Date()
                      });
                      setShowSectionCompletion(true);
                      
                      toast({
                        title: `${currentStep.name} Completed! 🎉`,
                        description: "All required fields completed. Advancing to next section...",
                      });
                      
                      // Auto-advance after 3 seconds to give user time to see completion
                      setTimeout(() => {
                        setShowSectionCompletion(false);
                        advanceToNextStep();
                      }, 2000);
                    }}
                    onCancel={onCancel}
                  />
                </div>
              )}

              {/* Provider Signature Capture for Consent Section */}
              {currentStep.id === 'consent_management' && consentSubStep === 'provider_signature' && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Provider Authorization Signature
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      The healthcare provider must review and sign below to authorize this patient enrollment.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4">
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          width: 400,
                          height: 150,
                          className: 'signature-canvas w-full border rounded'
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => signatureRef.current?.clear()}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleAcceptSignature}
                        size="sm"
                      >
                        Accept Signature
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section Completion Modal */}
              {showSectionCompletion && completedSectionData && (
                <EnhancedSectionCompletionModal
                  isOpen={showSectionCompletion}
                  completedSection={{
                    sectionKey: completedSectionData.sectionKey,
                    sectionTitle: completedSectionData.sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    description: currentStep.description,
                    completedFields: currentStep.requiredFields.length,
                    totalFields: currentStep.requiredFields.length,
                    requiredFields: currentStep.requiredFields.length,
                    completionTime: 30,
                    dataCollected: Object.entries(collectedData).map(([key, value]) => ({
                      fieldName: key,
                      displayName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                      value: value
                    }))
                  }}
                  nextSection={currentStepIndex < enrollmentSteps.length - 1 ? {
                    sectionKey: enrollmentSteps[currentStepIndex + 1].id,
                    sectionTitle: enrollmentSteps[currentStepIndex + 1].name,
                    description: enrollmentSteps[currentStepIndex + 1].description,
                    estimatedTime: 3,
                    totalFields: enrollmentSteps[currentStepIndex + 1].requiredFields.length,
                    requiredFields: enrollmentSteps[currentStepIndex + 1].requiredFields.length,
                    keyFields: enrollmentSteps[currentStepIndex + 1].requiredFields
                  } : null}
                  overallProgress={progress}
                  totalSections={enrollmentSteps.length}
                  completedSections={currentStepIndex + 1}
                  onClose={() => setShowSectionCompletion(false)}
                  onContinue={() => {
                    setShowSectionCompletion(false);
                    advanceToNextStep();
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Progress & Tools */}
        <div className="space-y-6">
          {/* Enhanced Real-time Progress Tracker */}
          <EnhancedRealtimeProgressTracker
            patientId={patientId}
            sessionId={mcpSession?.sessionId || ''}
            onSectionComplete={(sectionKey) => {
              setCompletedSectionData({ sectionKey, completedAt: new Date() });
              setShowSectionCompletion(true);
            }}
            onProgressUpdate={(progress) => {
              console.log('Progress updated:', progress);
            }}
            dashboardSyncEnabled={true}
          />

          {/* MCP Tools Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Active MCP Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentStep.mcpTools.map((tool, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <Badge variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Section Completion Modal */}
      {showSectionCompletion && completedSectionData && (
        <EnhancedSectionCompletionModal
          isOpen={showSectionCompletion}
          onClose={() => setShowSectionCompletion(false)}
          onContinue={() => {
            setShowSectionCompletion(false);
            advanceToNextStep();
          }}
          completedSection={{
            sectionKey: completedSectionData.sectionKey,
            sectionTitle: currentStep.name,
            description: currentStep.description,
            completedFields: Object.keys(collectedData).length,
            totalFields: currentStep.requiredFields.length,
            requiredFields: currentStep.requiredFields.length,
            completionTime: 120, 
            dataCollected: Object.entries(collectedData).map(([key, value]) => ({
              fieldName: key,
              displayName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              value
            }))
          }}
          nextSection={currentStepIndex < enrollmentSteps.length - 1 ? {
            sectionKey: enrollmentSteps[currentStepIndex + 1].id,
            sectionTitle: enrollmentSteps[currentStepIndex + 1].name,
            description: enrollmentSteps[currentStepIndex + 1].description,
            estimatedTime: 5,
            totalFields: enrollmentSteps[currentStepIndex + 1].requiredFields.length,
            requiredFields: enrollmentSteps[currentStepIndex + 1].requiredFields.length,
            keyFields: enrollmentSteps[currentStepIndex + 1].requiredFields.slice(0, 3)
          } : null}
          overallProgress={progress}
          totalSections={enrollmentSteps.length}
          completedSections={currentStepIndex}
        />
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {currentStepIndex === enrollmentSteps.length - 1 && (
          <Button onClick={() => onComplete?.({ instanceId: patientId, pdfUrl: '' })}>
            Complete Enrollment
          </Button>
        )}
      </div>
    </div>
  );
};