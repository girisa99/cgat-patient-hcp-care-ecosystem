/**
 * COLLABORATIVE ENROLLMENT WORKFLOW COMPONENT
 * Manages multi-user collaboration for patient enrollment completion
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  FileText,
  Send,
  Eye,
  Edit,
  Download,
  FileX,
  Globe,
  RefreshCw
} from 'lucide-react';
import { MultiPartySignature, type Signer } from '@/components/signature/MultiPartySignature';
import { PDFGenerator } from '@/components/signature/PDFGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface CollaborationStep {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedRole: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  requiredFields: string[];
  order: number;
}

interface CollaborativeEnrollmentWorkflowProps {
  enrollmentId: string;
  patientData: any;
  submissionMethod: 'fax' | 'pdf_submit' | 'online';
  onWorkflowComplete?: () => void;
  currentUserRole?: string;
  readOnly?: boolean;
}

export const CollaborativeEnrollmentWorkflow: React.FC<CollaborativeEnrollmentWorkflowProps> = ({
  enrollmentId,
  patientData,
  submissionMethod,
  onWorkflowComplete,
  currentUserRole = 'staff',
  readOnly = false
}) => {
  const [collaborationSteps, setCollaborationSteps] = useState<CollaborationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<'draft' | 'active' | 'completed' | 'on_hold'>('draft');
  const { showSuccess, showError } = useMasterToast();

  useEffect(() => {
    initializeWorkflow();
  }, [enrollmentId, submissionMethod]);

  const initializeWorkflow = () => {
    const baseSteps: CollaborationStep[] = [
      {
        id: 'intake_review',
        title: 'Initial Intake Review',
        description: 'Review patient information and verify completeness',
        assignedTo: '',
        assignedRole: 'intake_coordinator',
        status: 'pending',
        requiredFields: ['personal_info', 'contact_info', 'emergency_contact'],
        order: 1
      },
      {
        id: 'insurance_verification',
        title: 'Insurance Verification',
        description: 'Verify insurance coverage and benefits',
        assignedTo: '',
        assignedRole: 'insurance_specialist',
        status: 'pending',
        requiredFields: ['insurance_info', 'policy_verification'],
        order: 2
      },
      {
        id: 'medical_review',
        title: 'Medical History Review',
        description: 'Review medical history and treatment requirements',
        assignedTo: '',
        assignedRole: 'medical_reviewer',
        status: 'pending',
        requiredFields: ['medical_history', 'current_medications', 'allergies'],
        order: 3
      },
      {
        id: 'clinical_assessment',
        title: 'Clinical Assessment',
        description: 'Conduct clinical assessment and treatment planning',
        assignedTo: '',
        assignedRole: 'clinician',
        status: 'pending',
        requiredFields: ['clinical_notes', 'treatment_plan'],
        order: 4
      },
      {
        id: 'final_approval',
        title: 'Final Approval',
        description: 'Final review and approval for enrollment',
        assignedTo: '',
        assignedRole: 'supervisor',
        status: 'pending',
        requiredFields: ['all_sections_complete'],
        order: 5
      }
    ];

    // Customize steps based on submission method
    if (submissionMethod === 'fax') {
      baseSteps.unshift({
        id: 'fax_processing',
        title: 'Fax Document Processing',
        description: 'Convert received fax to digital format and extract data',
        assignedTo: '',
        assignedRole: 'document_processor',
        status: 'pending',
        requiredFields: ['fax_received', 'data_extracted'],
        order: 0
      });
    }

    setCollaborationSteps(baseSteps);
    
    // Initialize signers based on steps
    const initialSigners: Signer[] = baseSteps.map(step => ({
      id: step.id,
      name: '',
      email: '',
      role: step.assignedRole,
      order: step.order,
      status: 'pending'
    }));
    
    setSigners(initialSigners);
    setWorkflowStatus('active');
  };

  const updateStepStatus = async (stepId: string, status: CollaborationStep['status'], notes?: string) => {
    try {
      setLoading(true);

      const updatedSteps = collaborationSteps.map(step => 
        step.id === stepId 
          ? {
              ...step,
              status,
              notes,
              startedAt: status === 'in_progress' && !step.startedAt 
                ? new Date().toISOString() 
                : step.startedAt,
              completedAt: status === 'completed' 
                ? new Date().toISOString() 
                : undefined
            }
          : step
      );

      setCollaborationSteps(updatedSteps);

        // Log workflow step (using existing audit_logs table)
        await supabase
          .from('audit_logs')
          .insert({
            action: `enrollment_step_${status}`,
            table_name: 'enrollment_workflow',
            record_id: enrollmentId,
            additional_context: { step_id: stepId, status, notes }
          });

      // Check if workflow is complete
      const allCompleted = updatedSteps.every(step => 
        step.status === 'completed' || step.status === 'skipped'
      );

      if (allCompleted) {
        setWorkflowStatus('completed');
        await finalizeEnrollment();
      }

      showSuccess(`Step "${updatedSteps.find(s => s.id === stepId)?.title}" updated`);
    } catch (error) {
      console.error('Step update error:', error);
      showError('Failed to update step');
    } finally {
      setLoading(false);
    }
  };

  const finalizeEnrollment = async () => {
    try {
      // Generate final enrollment document
      const pdfResponse = await supabase.functions.invoke('patient-enrollment-pdf', {
        body: {
          action: 'generate_final_document',
          data: {
            enrollmentId,
            patientData,
            collaborationSteps,
            signers,
            submissionMethod
          }
        }
      });

      if (pdfResponse.error) throw pdfResponse.error;

      // Update enrollment status (using existing profiles)  
      await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId);

      showSuccess('Enrollment completed successfully!');
      onWorkflowComplete?.();
    } catch (error) {
      console.error('Finalization error:', error);
      showError('Failed to finalize enrollment');
    }
  };

  const handleSendForSignatures = async (stepSigners: Signer[]) => {
    try {
      setLoading(true);

      const response = await supabase.functions.invoke('docusign-integration', {
        body: {
          action: 'send_envelope',
          data: {
            applicationId: enrollmentId,
            documentType: 'enrollment_collaboration',
            signers: stepSigners.filter(s => s.email && s.name),
            documents: [{
              name: `Patient Enrollment Collaboration - ${patientData.firstName} ${patientData.lastName}`,
              content: 'collaboration_document'
            }]
          }
        }
      });

      if (response.error) throw response.error;

      showSuccess('Collaboration requests sent to team members');
    } catch (error) {
      console.error('DocuSign send error:', error);
      showError('Failed to send collaboration requests');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatusIcon = (status: CollaborationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: CollaborationStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canUserEditStep = (step: CollaborationStep) => {
    return currentUserRole === step.assignedRole || 
           currentUserRole === 'supervisor' || 
           currentUserRole === 'admin';
  };

  const completedSteps = collaborationSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / collaborationSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Collaborative Enrollment Workflow</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Patient: {patientData.firstName} {patientData.lastName} | 
                  Method: {submissionMethod.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            <Badge variant={workflowStatus === 'completed' ? 'default' : 'secondary'} 
                   className={workflowStatus === 'completed' ? 'bg-green-500' : ''}>
              {workflowStatus.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {completedSteps} of {collaborationSteps.length} steps</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Submission Method Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            {submissionMethod === 'fax' && <FileX className="h-5 w-5 text-primary" />}
            {submissionMethod === 'pdf_submit' && <FileText className="h-5 w-5 text-primary" />}
            {submissionMethod === 'online' && <Globe className="h-5 w-5 text-primary" />}
            <div>
              <h4 className="font-medium">
                {submissionMethod === 'fax' && 'Fax Submission Workflow'}
                {submissionMethod === 'pdf_submit' && 'PDF Submission Workflow'}
                {submissionMethod === 'online' && 'Online Submission Workflow'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {submissionMethod === 'fax' && 'Processing faxed enrollment form with team collaboration'}
                {submissionMethod === 'pdf_submit' && 'Collaborative review of submitted PDF form'}
                {submissionMethod === 'online' && 'Real-time collaborative form completion'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Steps */}
      <div className="space-y-4">
        {collaborationSteps.map((step, index) => (
          <Card key={step.id} className={`${
            step.status === 'completed' 
              ? 'border-green-200 bg-green-50' 
              : step.status === 'in_progress' 
                ? 'border-orange-200 bg-orange-50'
                : ''
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {step.title}
                      {getStepStatusIcon(step.status)}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStepStatusColor(step.status)}>
                    {step.status.replace('_', ' ')}
                  </Badge>
                  {canUserEditStep(step) && step.status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStepStatus(
                        step.id, 
                        step.status === 'pending' ? 'in_progress' : 'completed'
                      )}
                      disabled={loading}
                    >
                      {step.status === 'pending' ? 'Start' : 'Complete'}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {step.status === 'in_progress' && canUserEditStep(step) && (
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Required Fields:</h5>
                    <div className="flex flex-wrap gap-2">
                      {step.requiredFields.map(field => (
                        <Badge key={field} variant="outline">
                          {field.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateStepStatus(step.id, 'completed')}
                      disabled={loading}
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateStepStatus(step.id, 'skipped')}
                      disabled={loading}
                      size="sm"
                    >
                      Skip Step
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}

            {(step.completedAt || step.notes) && (
              <CardContent>
                <div className="text-sm space-y-1">
                  {step.completedAt && (
                    <p className="text-green-600">
                      Completed: {new Date(step.completedAt).toLocaleString()}
                    </p>
                  )}
                  {step.notes && (
                    <p className="text-muted-foreground">Notes: {step.notes}</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Team Collaboration */}
      {signers.some(signer => signer.email) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Team Collaboration & Signatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MultiPartySignature
              applicationId={enrollmentId}
              signers={signers}
              onSignersChange={setSigners}
              currentUserEmail=""
              onSubmitForSigning={handleSendForSignatures}
              readOnly={readOnly || workflowStatus === 'completed'}
            />
          </CardContent>
        </Card>
      )}

      {/* Final Document Generation */}
      {workflowStatus === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Final Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PDFGenerator
              applicationData={{
                ...patientData,
                collaborationSteps,
                submissionMethod,
                workflowStatus
              }}
              signatures={signers}
              onGeneratePDF={async () => {
                const response = await supabase.functions.invoke('patient-enrollment-pdf', {
                  body: {
                    action: 'generate_final_document',
                    data: { enrollmentId, patientData, collaborationSteps, signers }
                  }
                });
                return response.data?.pdf_url || '';
              }}
              loading={pdfGenerating}
            />

            <Alert className="mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Enrollment workflow completed successfully! All team members have completed their assigned tasks.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};