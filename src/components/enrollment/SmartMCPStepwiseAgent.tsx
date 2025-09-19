import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, Users, FileText, CreditCard, Activity, UserCheck, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveUniversalProgress, loadUniversalProgress } from "@/utils/universalSave";
import { smartRouteFieldsToTables, normalizeCollectionMethod, SMART_FIELD_MAPPINGS } from "@/utils/smartFieldRouting";
import { EnrollmentForm } from "@/components/enrollment/EnrollmentForm";
import { enrollmentDebugger } from "@/utils/enrollmentDebugger";
import { EnrollmentSystemTester } from "@/components/enrollment/EnrollmentSystemTester";
import { TreatmentCenterSelector } from "@/components/enrollment/TreatmentCenterSelector";
import { ProviderSelector } from "@/components/enrollment/ProviderSelector";
import { EnhancedProviderFormWithConfirmation } from "@/components/enrollment/EnhancedProviderFormWithConfirmation";
import { ComprehensiveProviderVerification } from "@/components/enrollment/ComprehensiveProviderVerification";
import { WhatsAppConsentSender } from "@/components/enrollment/WhatsAppConsentSender";
import { ConsentWorkflowManager } from "@/components/enrollment/ConsentWorkflowManager";

interface SmartMCPStepwiseAgentProps {
  patientId: string;
  moduleType: string;
  enrollmentSource: string;
  onComplete?: (data: any) => void;
  onProgress?: (progress: number) => void;
}

export const SmartMCPStepwiseAgent: React.FC<SmartMCPStepwiseAgentProps> = ({
  patientId,
  moduleType,
  enrollmentSource,
  onComplete,
  onProgress
}) => {
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Enhanced enrollment steps with smart field mapping
  const enrollmentSteps = [
    {
      key: 'consent_management',
      title: 'Consent Management',
      description: 'Patient consent and authorization',
      icon: <FileText className="w-5 h-5" />,
      requiredFields: ['consent_treatment', 'consent_privacy'],
      fields: [
        'consent_treatment', 'consent_privacy', 'consent_communication',
        'collection_method', 'patient_signature', 'treatment_center_id', 
        'treatment_center', 'treatment_center_npi', 'provider_id',
        'provider_name', 'provider_npi', 'provider_signature'
      ]
    },
    {
      key: 'patient_information',
      title: 'Patient Information',
      description: 'Basic patient details and demographics',
      icon: <Users className="w-5 h-5" />,
      requiredFields: ['patient_first_name', 'patient_last_name', 'patient_dob'],
      fields: [
        'patient_first_name', 'patient_last_name', 'patient_dob',
        'patient_phone', 'patient_email', 'patient_address',
        'emergency_contact_name', 'emergency_contact_phone'
      ]
    },
    {
      key: 'provider_treatment',
      title: 'Provider & Treatment',
      description: 'Healthcare provider credentials with NPI verification',
      icon: <UserCheck className="w-5 h-5" />,
      requiredFields: ['provider_specialty', 'treatment_type'],
      fields: [
        'provider_npi', 'provider_name', 'provider_specialty', 'provider_phone', 'provider_email',
        'treatment_type', 'treatment_frequency', 'treatment_start_date'
      ]
    },
    {
      key: 'insurance_information',
      title: 'Insurance Information',
      description: 'Insurance details and coverage',
      icon: <CreditCard className="w-5 h-5" />,
      requiredFields: ['insurance_provider', 'insurance_policy_number'],
      fields: [
        'insurance_provider', 'insurance_policy_number', 'insurance_group_number',
        'insurance_subscriber_name', 'secondary_insurance_provider'
      ]
    },
    {
      key: 'clinical_treatment',
      title: 'Clinical & Treatment',
      description: 'Medical history and treatment plan',
      icon: <Activity className="w-5 h-5" />,
      requiredFields: ['primary_diagnosis'],
      fields: [
        'primary_diagnosis', 'medical_history', 'current_medications',
        'allergies', 'treatment_goals', 'physician_name'
      ]
    },
    {
      key: 'submit',
      title: 'Submit',
      description: 'Final review and submission',
      icon: <Send className="w-5 h-5" />,
      requiredFields: ['final_patient_signature'],
      fields: [
        'final_patient_signature', 'submission_notes'
      ]
    }
  ];

  const currentStep = enrollmentSteps[currentStepIndex];

  useEffect(() => {
    const init = async () => {
      try {
        const { data: authUser } = await supabase.auth.getUser();
        const userId = authUser.user?.id;
        if (!userId || !patientId) return;

        // First, create the main enrollment record with user_id (required by RLS)
        const { error } = await supabase.from('patient_enrollments').upsert({
          id: patientId,
          user_id: userId, // CRITICAL: Required for RLS to allow related table inserts
          session_id: `mcp-${Date.now()}`,
          enrollment_source: enrollmentSource || 'mcp',
          enrollment_status: 'in_progress',
          current_section: 'consent_management',
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        if (error) {
          console.error('Init enrollment record error:', error);
          toast({
            title: "Initialization Error", 
            description: "Failed to initialize enrollment. Please refresh and try again.",
            variant: "destructive"
          });
        } else {
          console.log('✅ Successfully initialized patient enrollment record with user_id:', userId);
        }
      } catch (e) {
        console.error('Init enrollment record failed:', e);
      }
    };
    init();
  }, [patientId, enrollmentSource, toast]);

  // Smart database update using field routing
  const updateDatabase = async (data: Record<string, any>) => {
    if (!patientId) return;

    try {
      console.log('=== SMART FIELD ROUTING ===');
      console.log('Current step:', currentStep.key);
      console.log('Form data:', data);
      
      // Normalize collection method for consent fields
      if (data.collection_method) {
        data.collection_method = normalizeCollectionMethod(data.collection_method);
      } else if (currentStep.key === 'consent_management') {
        // Set default collection method for consent step to prevent constraint violations
        data.collection_method = 'digital';
      }
      
      // Route fields to appropriate tables using smart mapping
      const tableUpdates = smartRouteFieldsToTables(data);
      console.log('Routed table updates:', tableUpdates);
      
      // Execute all table updates
      for (const batch of tableUpdates) {
        console.log(`Processing ${batch.tableName}:`, batch.data);
        
        if (batch.operation === 'update') {
          const { error } = await supabase
            .from(batch.tableName as any)
            .update(batch.data)
            .eq('id', patientId);
            
          if (error) {
            console.error(`Update error for ${batch.tableName}:`, error);
            throw error;
          }
        } else {
          const { error } = await supabase
            .from(batch.tableName as any)
            .upsert({ ...batch.data, enrollment_id: patientId });
            
          if (error) {
            console.error(`Upsert error for ${batch.tableName}:`, error);
            throw error;
          }
        }
      }

      setCollectedData(prev => ({ ...prev, ...data }));
      
      // Update progress
      const progress = Math.round(((currentStepIndex + 1) / enrollmentSteps.length) * 100);
      
      const { error: progressError } = await supabase
        .from('patient_enrollments')
        .update({ 
          current_section: currentStep.key,
          progress_percentage: progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);
        
      if (progressError) {
        console.error('Progress update error:', progressError);
        throw progressError;
      }

      // Update universal save system
      await saveUniversalProgress(
        'smart-enrollment-agent',
        patientId,
        {
          currentStep: currentStep.key,
          completedSteps: enrollmentSteps.slice(0, currentStepIndex + 1).map(s => s.key),
          formData: { ...collectedData, ...data },
          progress: progress,
          lastUpdated: Date.now(),
          agent_type: 'smart_mcp_stepwise',
          module_type: moduleType,
          enrollment_source: enrollmentSource
        }
      );

      onProgress?.(progress);
      
      console.log('Smart database update successful');

    } catch (error: any) {
      enrollmentDebugger.error('DATABASE_UPDATE', 'Database update failed', {
        currentStep: currentStep.key,
        inputData: data,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      });
      
      console.error('Smart routing update error:', error);
      
      toast({
        title: "Update Error",
        description: `Failed to save ${currentStep.title} data: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  // Check step completion
  const checkStepCompletion = (data: Record<string, any>): boolean => {
    return currentStep.requiredFields.every((field: string) => {
      return data[field] && data[field].toString().trim() !== '';
    });
  };

  // Handle step navigation
  const handleNext = async (stepData: Record<string, any>) => {
    setIsLoading(true);
    
    try {
      // Update database with smart routing
      await updateDatabase(stepData);
      
      if (currentStepIndex < enrollmentSteps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        // Final step - mark as completed
        await supabase
          .from('patient_enrollments')
          .update({ 
            enrollment_status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', patientId);
          
        setIsCompleted(true);
        onComplete?.(collectedData);
        
        toast({
          title: "Enrollment Complete!",
          description: "Patient enrollment has been successfully submitted.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const universalData = await loadUniversalProgress('smart-enrollment-agent', patientId);
        if (universalData) {
          setCollectedData(universalData.formData || {});
          const stepIndex = enrollmentSteps.findIndex(s => s.key === universalData.currentStep);
          if (stepIndex >= 0) {
            setCurrentStepIndex(stepIndex);
          }
        }
      } catch (error) {
        console.error('Failed to load existing data:', error);
      }
    };

    if (patientId) {
      loadExistingData();
    }
  }, [patientId]);

  if (isCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">Enrollment Complete!</h2>
          <p className="text-gray-600">
            The patient enrollment has been successfully processed using smart field routing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep.icon}
            Smart MCP Stepwise Enrollment Agent
          </CardTitle>
          <CardDescription>
            Advanced field-to-table routing system for accurate data management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(currentStepIndex / enrollmentSteps.length) * 100} className="mb-4" />
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Step {currentStepIndex + 1} of {enrollmentSteps.length}</span>
            <Badge variant={currentStepIndex === enrollmentSteps.length - 1 ? "default" : "secondary"}>
              {currentStep.title}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Steps Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            {enrollmentSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center space-y-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                `}>
                  {index < currentStepIndex ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>
                <span className={`text-xs font-medium ${index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Form */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Using smart field routing with comprehensive debugging - all operations are logged below.
              </AlertDescription>
            </Alert>

            {/* Show comprehensive provider verification for provider step */}
            {currentStep.key === 'provider_treatment' ? (
              <div className="space-y-6">
                <ComprehensiveProviderVerification
                  onSubmit={handleNext}
                  initialData={{
                    ...collectedData,
                    // Auto-populate from consent step data
                    provider_name: collectedData.provider_name,
                    provider_npi: collectedData.provider_npi,
                    treatment_center: collectedData.treatment_center,
                    treatment_center_npi: collectedData.treatment_center_npi,
                    // Add cross-tab validation metadata
                    _crossTabSource: 'consent_management',
                    _consentStepData: {
                      provider_name: collectedData.provider_name,
                      provider_npi: collectedData.provider_npi,
                      treatment_center: collectedData.treatment_center,
                      treatment_center_npi: collectedData.treatment_center_npi
                    }
                  }}
                  sectionType="provider"
                  autoTriggerConfirmation={true}
                />
                {currentStepIndex > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={isLoading}
                  >
                    Previous
                  </Button>
                )}
              </div>
            ) : currentStep.key === 'consent_management' ? (
              <div className="space-y-6">
                <EnrollmentForm
                  step={currentStep.key}
                  fields={currentStep.fields}
                  requiredFields={currentStep.requiredFields}
                  initialData={collectedData}
                  onSubmit={handleNext}
                  onPrevious={currentStepIndex > 0 ? handlePrevious : undefined}
                  isLoading={isLoading}
                  checkCompletion={checkStepCompletion}
                  enableConditionalFields={true}
                  sectionKey={currentStep.key}
                />
                
                {/* Show automated consent workflow when collection method is selected */}
                {collectedData.collection_method && ['whatsapp', 'sms', 'email', 'voice'].includes(collectedData.collection_method) && (
                  <ConsentWorkflowManager
                    collectionMethod={collectedData.collection_method}
                    patientData={{
                      firstName: collectedData.patient_first_name || '',
                      lastName: collectedData.patient_last_name || '',
                      cellPhone: collectedData.patient_phone || '',
                      email: collectedData.patient_email || ''
                    }}
                    providerData={{
                      name: collectedData.provider_name || '',
                      phone: collectedData.provider_phone || '',
                      email: collectedData.provider_email || '',
                      treatmentCenter: collectedData.treatment_center || ''
                    }}
                    enrollmentId={patientId}
                    onConsentInitiated={(sessionId, method) => {
                      console.log('Consent initiated:', sessionId, method);
                      toast({
                        title: "Consent Process Started",
                        description: `Patient will receive consent instructions via ${method.toUpperCase()}. Process is now pending completion.`,
                      });
                    }}
                    onConsentComplete={(data) => {
                      console.log('Consent completed:', data);
                      setCollectedData(prev => ({ ...prev, consent_completed: true, consent_status: 'obtained' }));
                      toast({
                        title: "Consent Completed",
                        description: "Patient has successfully provided consent. Enrollment can proceed.",
                      });
                    }}
                  />
                )}
              </div>
            ) : (
              <EnrollmentForm
                step={currentStep.key}
                fields={currentStep.fields}
                requiredFields={currentStep.requiredFields}
                initialData={collectedData}
                onSubmit={handleNext}
                onPrevious={currentStepIndex > 0 ? handlePrevious : undefined}
                isLoading={isLoading}
                checkCompletion={checkStepCompletion}
                enableConditionalFields={true}
                sectionKey={currentStep.key}
              />
            )}
          </CardContent>
        </Card>

        {/* Debug and Testing System */}
        <div className="mt-6">
          <EnrollmentSystemTester />
        </div>
    </div>
  );
};

export default SmartMCPStepwiseAgent;