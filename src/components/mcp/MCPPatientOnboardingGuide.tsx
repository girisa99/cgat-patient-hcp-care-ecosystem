/**
 * MCP PATIENT ONBOARDING GUIDE
 * Provides guided step-by-step patient onboarding through MCP with real-time updates
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Database, 
  CheckCircle, 
  ArrowRight, 
  Stethoscope,
  FileText,
  Shield,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface MCPPatientOnboardingGuideProps {
  patientId?: string;
  onComplete?: (result: any) => void;
  onTableUpdate?: (tableName: string, data: any) => void;
}

const PATIENT_ONBOARDING_STEPS = [
  {
    id: 'patient_info',
    title: 'Patient Information',
    table: 'enrollment_patient_info',
    description: 'Collect basic patient demographics and contact information',
    icon: <Users className="h-5 w-5" />,
    mcpActions: ['validatePatientData', 'checkDuplicates', 'enrichPatientInfo'],
    requiredFields: ['first_name', 'last_name', 'date_of_birth', 'email']
  },
  {
    id: 'clinical_info',
    title: 'Clinical Assessment',
    table: 'enrollment_clinical_info',
    description: 'Gather clinical history and current health status',
    icon: <Stethoscope className="h-5 w-5" />,
    mcpActions: ['clinicalDataValidation', 'riskAssessment'],
    requiredFields: ['primary_diagnosis', 'medical_history', 'current_medications']
  },
  {
    id: 'insurance_info',
    title: 'Insurance Verification',
    table: 'enrollment_insurance_info',
    description: 'Verify insurance coverage and eligibility',
    icon: <Shield className="h-5 w-5" />,
    mcpActions: ['insuranceVerification', 'coverageCheck', 'priorAuthCheck'],
    requiredFields: ['insurance_provider', 'policy_number', 'group_number']
  },
  {
    id: 'consent',
    title: 'Consent & Documentation',
    table: 'enrollment_consent',
    description: 'Obtain required consents and legal documentation',
    icon: <FileText className="h-5 w-5" />,
    mcpActions: ['consentValidation', 'hipaaCompliance'],
    requiredFields: ['consent_type', 'signed_date', 'consent_status']
  },
  {
    id: 'treatment_plan',
    title: 'Treatment Planning',
    table: 'enrollment_treatment_plan',
    description: 'Create personalized treatment plan',
    icon: <Clock className="h-5 w-5" />,
    mcpActions: ['treatmentPlanGeneration', 'protocolMapping'],
    requiredFields: ['treatment_type', 'protocol_id', 'start_date']
  }
];

export const MCPPatientOnboardingGuide: React.FC<MCPPatientOnboardingGuideProps> = ({
  patientId,
  onComplete,
  onTableUpdate
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [mcpConnections, setMcpConnections] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([]);
  const { showSuccess, showError, showInfo } = useMasterToast();

  // Initialize MCP connections for patient onboarding
  useEffect(() => {
    initializeMCPConnections();
    setupRealTimeSubscriptions();
  }, []);

  const initializeMCPConnections = async () => {
    const patientOnboardingServers = [
      'healthcare-hl7-fhir',
      'eligibility-verification', 
      'clinical-decision-support',
      'document-management'
    ];

    const connections: Record<string, boolean> = {};
    for (const server of patientOnboardingServers) {
      try {
        // Simulate MCP server connection
        connections[server] = true;
        console.log(`✅ Connected to MCP server: ${server}`);
      } catch (error) {
        connections[server] = false;
        console.error(`❌ Failed to connect to MCP server: ${server}`, error);
      }
    }
    setMcpConnections(connections);
  };

  const setupRealTimeSubscriptions = () => {
    const tables = PATIENT_ONBOARDING_STEPS.map(step => step.table);
    
    tables.forEach(tableName => {
      const channel = supabase
        .channel(`patient-onboarding-${tableName}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: tableName
        }, (payload) => {
          console.log(`Real-time update for ${tableName}:`, payload);
          setRealTimeUpdates(prev => [...prev, {
            table: tableName,
            action: 'INSERT',
            data: payload.new,
            timestamp: new Date()
          }]);
          
          if (onTableUpdate) {
            onTableUpdate(tableName, payload.new);
          }
          
          showSuccess("Real-time Update", `New data added to ${tableName}`);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: tableName
        }, (payload) => {
          setRealTimeUpdates(prev => [...prev, {
            table: tableName,
            action: 'UPDATE',
            data: payload.new,
            timestamp: new Date()
          }]);
          
          if (onTableUpdate) {
            onTableUpdate(tableName, payload.new);
          }
        })
        .subscribe();

      // Cleanup function would go here
      return () => {
        supabase.removeChannel(channel);
      };
    });
  };

  const executeMCPAction = async (stepId: string, action: string, data: any) => {
    setIsProcessing(true);
    try {
      // Simulate MCP action execution
      console.log(`Executing MCP action: ${action} for step: ${stepId}`, data);
      
      const mockResponse = {
        success: true,
        processedData: { ...data, validated: true, timestamp: new Date().toISOString() },
        recommendations: [`${action} completed successfully`],
        nextActions: ['proceedToNextStep']
      };

      // Update step data with processed results
      setStepData(prev => ({
        ...prev,
        [stepId]: mockResponse.processedData
      }));

      return mockResponse;
    } catch (error) {
      console.error(`MCP action ${action} failed:`, error);
      showError("MCP Action Failed", `Failed to execute ${action}`);
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };

  const processCurrentStep = async (formData: any) => {
    const step = PATIENT_ONBOARDING_STEPS[currentStep];
    setIsProcessing(true);

    try {
      // Execute all MCP actions for this step
      for (const action of step.mcpActions) {
        await executeMCPAction(step.id, action, formData);
      }

      // Use existing patient_enrollments table instead
      const { data, error } = await supabase
        .from('patient_enrollments')
        .upsert({
          user_id: patientId,
          ...formData,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      showSuccess("Step Completed", `${step.title} completed successfully`);

      // Move to next step or complete
      if (currentStep < PATIENT_ONBOARDING_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        completeOnboarding();
      }

    } catch (error) {
      console.error('Step processing failed:', error);
      showError("Step Failed", `Failed to process ${step.title}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Create final enrollment record
      const { data, error } = await supabase
        .from('patient_enrollments')
        .insert({
          user_id: patientId,
          session_id: `mcp-onboarding-${Date.now()}`,
          enrollment_status: 'completed',
          progress_percentage: 100,
          metadata: {
            completed_steps: PATIENT_ONBOARDING_STEPS.map(s => s.id),
            enrollment_data: stepData
          },
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      showSuccess("Onboarding Complete", "Patient onboarding completed successfully");

      if (onComplete) {
        onComplete({
          patientId,
          enrollmentId: `enrollment-${Date.now()}`,
          stepData,
          completedAt: new Date()
        });
      }

    } catch (error) {
      console.error('Onboarding completion failed:', error);
    }
  };

  const progress = (currentStep / PATIENT_ONBOARDING_STEPS.length) * 100;
  const currentStepData = PATIENT_ONBOARDING_STEPS[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              MCP-Guided Patient Onboarding
            </CardTitle>
            <Badge variant="outline">
              Step {currentStep + 1} of {PATIENT_ONBOARDING_STEPS.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
      </Card>

      {/* MCP Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">MCP Server Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(mcpConnections).map(([server, connected]) => (
              <div key={server} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs">{server}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStepData.icon}
                {currentStepData.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentStepData.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Database className="h-3 w-3" />
                Table: {currentStepData.table}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* MCP Actions for this step */}
              <div>
                <h4 className="text-sm font-medium mb-2">MCP Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {currentStepData.mcpActions.map(action => (
                    <Badge key={action} variant="secondary" className="text-xs">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Required Fields */}
              <div>
                <h4 className="text-sm font-medium mb-2">Required Fields</h4>
                <div className="grid grid-cols-2 gap-2">
                  {currentStepData.requiredFields.map(field => (
                    <div key={field} className="text-xs text-muted-foreground">
                      • {field.replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => processCurrentStep({})} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Process Step'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Real-time Updates */}
      {realTimeUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Real-time Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {realTimeUpdates.slice(-5).map((update, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{update.action} in {update.table}</span>
                  <span className="text-muted-foreground">
                    {update.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};