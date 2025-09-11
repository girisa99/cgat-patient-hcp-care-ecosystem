import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Users,
  Shield,
  Mic,
  Brain,
  Database,
  Settings
} from 'lucide-react';
import { useNPIVerification } from '@/hooks/useNPIVerification';
import { UniversalLLMAssistant } from '@/components/intelligent-assistant/UniversalLLMAssistant';
import { UniversalVoiceInterface } from '@/components/voice/UniversalVoiceInterface';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description: string;
  data?: any;
  required: boolean;
}

interface UniversalWorkflowProcessorProps {
  workflowType: 'fill_online' | 'fill_fax_ocr' | 'pdf_submit' | 'agent_assisted';
  initialData?: any;
  onComplete?: (data: any) => void;
}

export const UniversalWorkflowProcessor: React.FC<UniversalWorkflowProcessorProps> = ({
  workflowType,
  initialData = {},
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowData, setWorkflowData] = useState(initialData);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflow' | 'assistant' | 'voice'>('workflow');
  
  const { 
    verifyCredentials, 
    isVerifying,
    getVerificationHistory,
    validateNPIFormat 
  } = useNPIVerification();

  useEffect(() => {
    initializeWorkflow();
  }, [workflowType]);

  const initializeWorkflow = () => {
    const workflowSteps: Record<string, WorkflowStep[]> = {
      fill_online: [
        {
          id: 'data_collection',
          name: 'Data Collection',
          status: 'pending',
          description: 'Collect patient and provider information',
          required: true
        },
        {
          id: 'npi_verification',
          name: 'NPI Verification',
          status: 'pending',
          description: 'Verify National Provider Identifier',
          required: true
        },
        {
          id: 'credentialing_check',
          name: 'Credentialing Check',
          status: 'pending',
          description: 'Verify professional credentials',
          required: true
        },
        {
          id: 'voice_verification',
          name: 'Voice Verification',
          status: 'pending',
          description: 'Optional voice-based verification',
          required: false
        },
        {
          id: 'llm_review',
          name: 'AI Review',
          status: 'pending',
          description: 'Intelligent review and validation',
          required: true
        },
        {
          id: 'online_submission',
          name: 'Online Submission',
          status: 'pending',
          description: 'Submit form electronically',
          required: true
        }
      ],
      fill_fax_ocr: [
        {
          id: 'document_upload',
          name: 'Document Upload',
          status: 'pending',
          description: 'Upload or fax documents',
          required: true
        },
        {
          id: 'ocr_processing',
          name: 'OCR Processing',
          status: 'pending',
          description: 'Extract text from documents',
          required: true
        },
        {
          id: 'data_validation',
          name: 'Data Validation',
          status: 'pending',
          description: 'Validate extracted information',
          required: true
        },
        {
          id: 'npi_verification',
          name: 'NPI Verification',
          status: 'pending',
          description: 'Verify National Provider Identifier',
          required: true
        },
        {
          id: 'credentialing_check',
          name: 'Credentialing Check',
          status: 'pending',
          description: 'Verify professional credentials',
          required: true
        },
        {
          id: 'voice_clarification',
          name: 'Voice Clarification',
          status: 'pending',
          description: 'Voice-based clarification of unclear data',
          required: false
        },
        {
          id: 'llm_review',
          name: 'AI Review',
          status: 'pending',
          description: 'Intelligent review and validation',
          required: true
        },
        {
          id: 'fax_submission',
          name: 'Fax Submission',
          status: 'pending',
          description: 'Submit via fax',
          required: true
        }
      ],
      pdf_submit: [
        {
          id: 'pdf_generation',
          name: 'PDF Generation',
          status: 'pending',
          description: 'Generate fillable PDF form',
          required: true
        },
        {
          id: 'auto_fill',
          name: 'Auto Fill',
          status: 'pending',
          description: 'Automatically populate known fields',
          required: true
        },
        {
          id: 'npi_verification',
          name: 'NPI Verification',
          status: 'pending',
          description: 'Verify National Provider Identifier',
          required: true
        },
        {
          id: 'credentialing_check',
          name: 'Credentialing Check',
          status: 'pending',
          description: 'Verify professional credentials',
          required: true
        },
        {
          id: 'voice_review',
          name: 'Voice Review',
          status: 'pending',
          description: 'Voice-based form review',
          required: false
        },
        {
          id: 'llm_validation',
          name: 'AI Validation',
          status: 'pending',
          description: 'Intelligent form validation',
          required: true
        },
        {
          id: 'pdf_submission',
          name: 'PDF Submission',
          status: 'pending',
          description: 'Submit completed PDF',
          required: true
        }
      ],
      agent_assisted: [
        {
          id: 'agent_conversation',
          name: 'Agent Conversation',
          status: 'pending',
          description: 'Conversational data collection',
          required: true
        },
        {
          id: 'data_extraction',
          name: 'Data Extraction',
          status: 'pending',
          description: 'Extract information from conversation',
          required: true
        },
        {
          id: 'npi_verification',
          name: 'NPI Verification',
          status: 'pending',
          description: 'Verify National Provider Identifier',
          required: true
        },
        {
          id: 'credentialing_check',
          name: 'Credentialing Check',
          status: 'pending',
          description: 'Verify professional credentials',
          required: true
        },
        {
          id: 'voice_confirmation',
          name: 'Voice Confirmation',
          status: 'pending',
          description: 'Voice-based confirmation of details',
          required: false
        },
        {
          id: 'llm_completion',
          name: 'AI Completion',
          status: 'pending',
          description: 'AI-assisted form completion',
          required: true
        },
        {
          id: 'multi_channel_submit',
          name: 'Multi-Channel Submit',
          status: 'pending',
          description: 'Submit via preferred channel',
          required: true
        }
      ]
    };

    setSteps(workflowSteps[workflowType] || []);
  };

  const executeStep = async (stepId: string) => {
    setIsProcessing(true);
    updateStepStatus(stepId, 'processing');

    try {
      switch (stepId) {
        case 'npi_verification':
          await handleNPIVerification();
          break;
        case 'credentialing_check':
          await handleCredentialingCheck();
          break;
        case 'voice_verification':
        case 'voice_clarification':
        case 'voice_review':
        case 'voice_confirmation':
          await handleVoiceProcessing(stepId);
          break;
        case 'llm_review':
        case 'llm_validation':
        case 'llm_completion':
          await handleLLMProcessing(stepId);
          break;
        case 'ocr_processing':
          await handleOCRProcessing();
          break;
        case 'pdf_generation':
          await handlePDFGeneration();
          break;
        default:
          await handleGenericStep(stepId);
      }

      updateStepStatus(stepId, 'completed');
      toast.success(`${getStepName(stepId)} completed successfully`);
      
      // Auto-advance to next step if possible
      const nextStepIndex = steps.findIndex(step => step.id === stepId) + 1;
      if (nextStepIndex < steps.length) {
        setCurrentStep(nextStepIndex);
      }
      
    } catch (error) {
      updateStepStatus(stepId, 'failed');
      toast.error(`${getStepName(stepId)} failed: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNPIVerification = async () => {
    const npiNumber = workflowData.npi || workflowData.provider_npi;
    
    if (!npiNumber) {
      throw new Error('NPI number is required for verification');
    }

    const validation = validateNPIFormat(npiNumber);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid NPI format');
    }

    const result = await verifyCredentials({
      npi: npiNumber,
      providerType: 'individual',
      providerSearch: {
        firstName: workflowData.provider_first_name,
        lastName: workflowData.provider_last_name,
        organizationName: workflowData.organization_name
      }
    });

    if (!result.isValid) {
      throw new Error(result.issues?.join(', ') || 'NPI verification failed');
    }

    setWorkflowData(prev => ({
      ...prev,
      npi_verification: result,
      verified_provider_info: result.npiData
    }));
  };

  const handleCredentialingCheck = async () => {
    // Implement credentialing verification logic
    const credentialingData = {
      license_number: workflowData.license_number,
      license_state: workflowData.license_state,
      specialties: workflowData.specialties,
      board_certifications: workflowData.board_certifications
    };

    // Call credentialing verification service
    const response = await supabase.functions.invoke('verify-credentials', {
      body: credentialingData
    });

    if (response.error) {
      throw new Error('Credentialing verification failed');
    }

    setWorkflowData(prev => ({
      ...prev,
      credentialing_verification: response.data
    }));
  };

  const handleVoiceProcessing = async (stepId: string) => {
    // Voice processing specific to each step type
    const voicePrompts = {
      voice_verification: "Please confirm your identity and provider information",
      voice_clarification: "Please clarify any unclear information from the document",
      voice_review: "Please review and confirm the form details",
      voice_confirmation: "Please confirm all the collected information is correct"
    };

    // Start voice interaction
    const voiceData = await processVoiceInteraction(voicePrompts[stepId as keyof typeof voicePrompts]);
    
    setWorkflowData(prev => ({
      ...prev,
      [`${stepId}_data`]: voiceData
    }));
  };

  const handleLLMProcessing = async (stepId: string) => {
    const llmPrompts = {
      llm_review: `Review the following enrollment data for completeness and accuracy: ${JSON.stringify(workflowData)}`,
      llm_validation: `Validate the following form data and identify any issues: ${JSON.stringify(workflowData)}`,
      llm_completion: `Complete any missing fields in the enrollment data: ${JSON.stringify(workflowData)}`
    };

    const response = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        prompt: llmPrompts[stepId as keyof typeof llmPrompts],
        action: stepId
      }
    });

    if (response.error) {
      throw new Error('AI processing failed');
    }

    setWorkflowData(prev => ({
      ...prev,
      [`${stepId}_result`]: response.data
    }));
  };

  const handleOCRProcessing = async () => {
    // OCR processing for fax documents
    const response = await supabase.functions.invoke('fax-processing', {
      body: {
        document_data: workflowData.document_data,
        processing_type: 'ocr_extraction'
      }
    });

    if (response.error) {
      throw new Error('OCR processing failed');
    }

    setWorkflowData(prev => ({
      ...prev,
      ocr_extracted_data: response.data.extracted_data
    }));
  };

  const handlePDFGeneration = async () => {
    // PDF generation and auto-fill
    const response = await supabase.functions.invoke('pdf-voice-processor', {
      body: {
        form_data: workflowData,
        action: 'generate_and_fill'
      }
    });

    if (response.error) {
      throw new Error('PDF generation failed');
    }

    setWorkflowData(prev => ({
      ...prev,
      generated_pdf: response.data.pdf_data
    }));
  };

  const handleGenericStep = async (stepId: string) => {
    // Generic step processing
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
    
    setWorkflowData(prev => ({
      ...prev,
      [`${stepId}_completed`]: true,
      [`${stepId}_timestamp`]: new Date().toISOString()
    }));
  };

  const processVoiceInteraction = async (prompt: string) => {
    // Implement voice interaction
    return new Promise((resolve) => {
      // Mock voice processing
      setTimeout(() => {
        resolve({
          transcript: "Voice interaction completed",
          confidence: 0.95,
          timestamp: new Date().toISOString()
        });
      }, 3000);
    });
  };

  const updateStepStatus = (stepId: string, status: WorkflowStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const getStepName = (stepId: string) => {
    return steps.find(step => step.id === stepId)?.name || stepId;
  };

  const getProgress = () => {
    const completed = steps.filter(step => step.status === 'completed').length;
    return (completed / steps.length) * 100;
  };

  const handleDataCapture = (capturedData: any) => {
    setWorkflowData(prev => ({
      ...prev,
      ...capturedData,
      last_updated: new Date().toISOString()
    }));
    
    toast.success('Data captured from assistant');
  };

  const handleVoiceDataCapture = (voiceData: any) => {
    setWorkflowData(prev => ({
      ...prev,
      voice_data: {
        ...prev.voice_data,
        ...voiceData
      },
      last_updated: new Date().toISOString()
    }));
    
    toast.success('Voice data captured');
  };

  const completeWorkflow = async () => {
    const completedData = {
      ...workflowData,
      workflow_type: workflowType,
      completion_timestamp: new Date().toISOString(),
      all_steps_completed: steps.every(step => !step.required || step.status === 'completed'),
      workflow_steps: steps
    };

    onComplete?.(completedData);
    
    toast.success('Workflow completed successfully!');
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Universal Workflow Processor</span>
            <Badge variant="outline">
              {workflowType.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {Math.round(getProgress())}%</span>
              <span>{steps.filter(s => s.status === 'completed').length} of {steps.length} steps</span>
            </div>
            <Progress value={getProgress()} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border ${
                      index === currentStep ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'processing' ? 'bg-blue-500' :
                          step.status === 'failed' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : step.status === 'failed' ? (
                            <AlertCircle className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-white text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{step.name}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!step.required && (
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                        )}
                        {step.status === 'pending' && index === currentStep && (
                          <Button
                            size="sm"
                            onClick={() => executeStep(step.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Processing...' : 'Start'}
                          </Button>
                        )}
                        {step.status === 'processing' && (
                          <Badge variant="outline">Processing...</Badge>
                        )}
                        {step.status === 'completed' && (
                          <Badge variant="default">Completed</Badge>
                        )}
                        {step.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => executeStep(step.id)}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {steps.every(step => !step.required || step.status === 'completed') && (
                <div className="mt-6 pt-4 border-t">
                  <Button onClick={completeWorkflow} className="w-full">
                    Complete Workflow
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workflow">Data</TabsTrigger>
              <TabsTrigger value="assistant">AI</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
            </TabsList>

            <TabsContent value="workflow">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Workflow Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(workflowData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assistant">
              <UniversalLLMAssistant
                context={workflowData}
                workflowType={workflowType === 'fill_online' ? 'online' : 
                           workflowType === 'fill_fax_ocr' ? 'fax' :
                           workflowType === 'pdf_submit' ? 'pdf' : 'enrollment'}
                onDataCapture={handleDataCapture}
              />
            </TabsContent>

            <TabsContent value="voice">
              <UniversalVoiceInterface
                agentType="conversational"
                channelType={workflowType === 'fill_fax_ocr' ? 'fax' : 
                           workflowType === 'pdf_submit' ? 'pdf' : 'online'}
                onDataCapture={handleVoiceDataCapture}
                onStatusChange={(status) => console.log('Voice status:', status)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};