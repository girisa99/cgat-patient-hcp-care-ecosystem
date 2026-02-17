import React, { useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { 
  User, 
  FileText, 
  Stethoscope, 
  Shield, 
  CreditCard, 
  Calendar,
  Bot,
  Database,
  CheckCircle,
  UserCheck,
  Building,
  Heart
} from 'lucide-react';

export interface PatientEnrollmentWorkflowProps {
  onLoad: (nodes: Node[], edges: Edge[]) => void;
}

export const PatientEnrollmentWorkflow: React.FC<PatientEnrollmentWorkflowProps> = ({ onLoad }) => {
  const { nodes, edges } = useMemo(() => {
    const workflowNodes: Node[] = [
      // Start Node
      {
        id: 'start',
        type: 'input',
        position: { x: 100, y: 50 },
        data: {
          label: 'Patient Enrollment Start',
          description: 'Begin patient enrollment process',
          icon: User,
          section: 'start'
        }
      },

      // 1. Submission Method Selection
      {
        id: 'submission_method',
        type: 'default',
        position: { x: 100, y: 200 },
        data: {
          label: 'Submission Method',
          description: 'Choose how to complete enrollment (Online, AI Agent, Fax, PDF)',
          icon: User,
          section: 'submission_method',
          fields: ['submissionMethod'],
          status: 'pending'
        }
      },

      // 2. Consent Management
      {
        id: 'consent_management',
        type: 'default',
        position: { x: 400, y: 200 },
        data: {
          label: 'Consent Management',
          description: 'Initial consent collection and method setup',
          icon: Shield,
          section: 'consent_management',
          table: 'enrollment_consent',
          fields: ['consent_to_treatment', 'hipaa_authorization', 'consent_method'],
          status: 'pending',
          aiAgent: {
            name: 'Consent Management Agent',
            description: 'Manages consent collection and validation',
            prompt: 'Guide patients through initial consent setup and legal requirements'
          }
        }
      },

      // 3. Patient Information
      {
        id: 'patient_info',
        type: 'default',
        position: { x: 100, y: 400 },
        data: {
          label: 'Patient Information',
          description: 'Demographics, contact info, emergency contacts',
          icon: User,
          section: 'patient_info',
          table: 'enrollment_patient_info',
          fields: ['first_name', 'last_name', 'date_of_birth', 'phone', 'email', 'address_line1', 'city', 'state', 'zip_code', 'emergency_contact_name'],
          status: 'pending',
          aiAgent: {
            name: 'Demographics Agent',
            description: 'Collects comprehensive patient information',
            prompt: 'Collect patient demographics, contact details, and emergency contact information'
          }
        }
      },

      // 4. Provider Information
      {
        id: 'provider_info',
        type: 'default',
        position: { x: 400, y: 400 },
        data: {
          label: 'Provider Information',
          description: 'Provider details, referral info, treatment center',
          icon: Stethoscope,
          section: 'provider_info',
          table: 'enrollment_provider_info',
          fields: ['provider_name', 'provider_npi', 'treatment_center_name', 'referral_provider_name'],
          status: 'pending',
          aiAgent: {
            name: 'NPI Verification Agent',
            description: 'Validates provider credentials and NPI numbers',
            prompt: 'Collect and verify provider information including NPI validation'
          }
        }
      },

      // 5. Insurance Information
      {
        id: 'insurance',
        type: 'default',
        position: { x: 100, y: 600 },
        data: {
          label: 'Insurance Information',
          description: 'Primary/secondary insurance, benefits verification',
          icon: CreditCard,
          section: 'insurance',
          table: 'enrollment_insurance_info',
          fields: ['primary_insurance_name', 'primary_policy_number', 'secondary_insurance_name', 'copay_amount', 'deductible_amount'],
          status: 'pending',
          aiAgent: {
            name: 'Insurance Verification Agent',
            description: 'Verifies insurance coverage and benefits',
            prompt: 'Collect and verify insurance information and check benefits coverage'
          }
        }
      },

      // 6. Treatment Assessment
      {
        id: 'treatment_assessment',
        type: 'default',
        position: { x: 400, y: 600 },
        data: {
          label: 'Treatment Assessment',
          description: 'Medical history, clinical assessment, treatment planning',
          icon: Heart,
          section: 'treatment_assessment',
          table: 'enrollment_clinical_info',
          fields: ['chief_complaint', 'medical_history', 'current_medications', 'allergies', 'treatment_goals'],
          status: 'pending',
          aiAgent: {
            name: 'Clinical Assessment Agent',
            description: 'Gathers comprehensive medical history and treatment planning',
            prompt: 'Collect detailed medical history and develop treatment assessment'
          }
        }
      },

      // 7. Final Review & Documents
      {
        id: 'final_review',
        type: 'output',
        position: { x: 250, y: 800 },
        data: {
          label: 'Final Review & Completion',
          description: 'Document upload, signatures, enrollment completion',
          icon: CheckCircle,
          section: 'final_review',
          table: 'enrollment_documents',
          fields: ['document_type', 'patient_signature', 'enrollment_status'],
          status: 'pending',
          aiAgent: {
            name: 'Document Management Agent',
            description: 'Manages final document collection and completion',
            prompt: 'Help complete final documentation and enrollment submission'
          }
        }
      }
    ];

    const workflowEdges: Edge[] = [
      // Main Sequential flow - matches your 7-step enrollment
      { id: 'e1', source: 'start', target: 'submission_method', animated: true },
      { id: 'e2', source: 'submission_method', target: 'consent_management', animated: true },
      { id: 'e3', source: 'consent_management', target: 'patient_info', animated: true },
      { id: 'e4', source: 'patient_info', target: 'provider_info', animated: true },
      { id: 'e5', source: 'provider_info', target: 'insurance', animated: true },
      { id: 'e6', source: 'insurance', target: 'treatment_assessment', animated: true },
      { id: 'e7', source: 'treatment_assessment', target: 'final_review', animated: true },

      // AI Agent interactions
      { id: 'e8', source: 'consent_management', target: 'provider_info', type: 'smoothstep', style: { stroke: '#10b981', strokeDasharray: '5,5' }, label: 'AI Consent Verification' },
      { id: 'e9', source: 'provider_info', target: 'insurance', type: 'smoothstep', style: { stroke: '#3b82f6', strokeDasharray: '5,5' }, label: 'NPI Verification' },
      { id: 'e10', source: 'insurance', target: 'treatment_assessment', type: 'smoothstep', style: { stroke: '#8b5cf6', strokeDasharray: '5,5' }, label: 'Insurance Verification' },
      { id: 'e11', source: 'treatment_assessment', target: 'final_review', type: 'smoothstep', style: { stroke: '#f59e0b', strokeDasharray: '5,5' }, label: 'Clinical Assessment' }
    ];

    return { nodes: workflowNodes, edges: workflowEdges };
  }, []);

  React.useEffect(() => {
    onLoad(nodes, edges);
  }, [nodes, edges, onLoad]);

  return null; // This component just provides the workflow data
};

export default PatientEnrollmentWorkflow;