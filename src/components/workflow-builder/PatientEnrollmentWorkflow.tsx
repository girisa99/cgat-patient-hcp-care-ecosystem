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
          description: 'Begin comprehensive patient enrollment process',
          icon: User,
          section: 'start'
        }
      },

      // Demographics Section
      {
        id: 'demographics',
        type: 'default',
        position: { x: 100, y: 150 },
        data: {
          label: 'Patient Demographics',
          description: 'Collect basic patient information: name, DOB, contact details',
          icon: User,
          section: 'demographics',
          table: 'enrollment_patient_info',
          fields: ['first_name', 'last_name', 'date_of_birth', 'phone', 'email', 'address'],
          status: 'pending'
        }
      },

      // NPI Verification Agent
      {
        id: 'npi-agent',
        type: 'default',
        position: { x: 400, y: 150 },
        data: {
          label: 'NPI Verification Agent',
          description: 'AI agent validates provider credentials and NPI numbers',
          icon: Bot,
          section: 'verification',
          agentType: 'npi-verification',
          capabilities: ['npi_lookup', 'license_verification', 'credential_validation'],
          status: 'ready'
        }
      },

      // Clinical Information
      {
        id: 'clinical-info',
        type: 'default',
        position: { x: 100, y: 300 },
        data: {
          label: 'Clinical Assessment',
          description: 'Medical history, current medications, treatment goals',
          icon: Stethoscope,
          section: 'clinical',
          table: 'enrollment_clinical_info',
          fields: ['medical_history', 'current_medications', 'allergies', 'primary_diagnosis'],
          status: 'pending'
        }
      },

      // Treatment Plan
      {
        id: 'treatment-plan',
        type: 'default',
        position: { x: 400, y: 300 },
        data: {
          label: 'Treatment Planning',
          description: 'Customize treatment protocols and care plans',
          icon: Heart,
          section: 'treatment',
          table: 'enrollment_treatment_plan',
          fields: ['treatment_type', 'duration', 'goals', 'provider_assignment'],
          status: 'pending'
        }
      },

      // Insurance Verification
      {
        id: 'insurance',
        type: 'default',
        position: { x: 100, y: 450 },
        data: {
          label: 'Insurance Verification',
          description: 'Verify coverage, benefits, and authorization requirements',
          icon: CreditCard,
          section: 'insurance',
          table: 'enrollment_insurance_info',
          fields: ['insurance_provider', 'policy_number', 'group_number', 'coverage_details'],
          status: 'pending'
        }
      },

      // Insurance Agent
      {
        id: 'insurance-agent',
        type: 'default',
        position: { x: 400, y: 450 },
        data: {
          label: 'Insurance AI Agent',
          description: 'Automated insurance verification and benefits check',
          icon: Bot,
          section: 'insurance-verification',
          agentType: 'insurance-verification',
          capabilities: ['benefits_check', 'prior_authorization', 'coverage_analysis'],
          status: 'ready'
        }
      },

      // Consent Management
      {
        id: 'consent',
        type: 'default',
        position: { x: 100, y: 600 },
        data: {
          label: 'Consent & Legal',
          description: 'HIPAA forms, treatment consent, privacy agreements',
          icon: Shield,
          section: 'consent',
          table: 'enrollment_consent',
          fields: ['hipaa_consent', 'treatment_consent', 'privacy_agreement', 'signature'],
          status: 'pending'
        }
      },

      // Treatment Center Assignment
      {
        id: 'treatment-center',
        type: 'default',
        position: { x: 400, y: 600 },
        data: {
          label: 'Treatment Center Assignment',
          description: 'Match patient with appropriate treatment facility',
          icon: Building,
          section: 'facility',
          table: 'enrollment_collaborations',
          fields: ['assigned_facility', 'location_preference', 'specialty_match'],
          status: 'pending'
        }
      },

      // Document Management
      {
        id: 'documents',
        type: 'default',
        position: { x: 250, y: 750 },
        data: {
          label: 'Document Management',
          description: 'Upload and organize enrollment documents',
          icon: FileText,
          section: 'documents',
          table: 'enrollment_documents',
          fields: ['document_type', 'file_path', 'upload_date', 'verification_status'],
          status: 'pending'
        }
      },

      // Final Review & Completion
      {
        id: 'completion',
        type: 'output',
        position: { x: 250, y: 900 },
        data: {
          label: 'Enrollment Complete',
          description: 'Final review and enrollment completion',
          icon: CheckCircle,
          section: 'completion',
          table: 'patient_enrollments',
          fields: ['enrollment_status', 'completion_date', 'assigned_provider'],
          status: 'pending'
        }
      }
    ];

    const workflowEdges: Edge[] = [
      // Sequential flow
      { id: 'e1', source: 'start', target: 'demographics', animated: true },
      { id: 'e2', source: 'demographics', target: 'clinical-info', animated: true },
      { id: 'e3', source: 'clinical-info', target: 'treatment-plan', animated: true },
      { id: 'e4', source: 'treatment-plan', target: 'insurance', animated: true },
      { id: 'e5', source: 'insurance', target: 'consent', animated: true },
      { id: 'e6', source: 'consent', target: 'treatment-center', animated: true },
      { id: 'e7', source: 'treatment-center', target: 'documents', animated: true },
      { id: 'e8', source: 'documents', target: 'completion', animated: true },

      // AI Agent connections
      { id: 'e9', source: 'demographics', target: 'npi-agent', type: 'step', animated: true },
      { id: 'e10', source: 'npi-agent', target: 'clinical-info', type: 'step', animated: true },
      { id: 'e11', source: 'insurance', target: 'insurance-agent', type: 'step', animated: true },
      { id: 'e12', source: 'insurance-agent', target: 'consent', type: 'step', animated: true },

      // Cross-connections for data validation
      { id: 'e13', source: 'npi-agent', target: 'treatment-plan', type: 'smoothstep', style: { stroke: '#10b981', strokeDasharray: '5,5' }},
      { id: 'e14', source: 'insurance-agent', target: 'treatment-center', type: 'smoothstep', style: { stroke: '#3b82f6', strokeDasharray: '5,5' }}
    ];

    return { nodes: workflowNodes, edges: workflowEdges };
  }, []);

  React.useEffect(() => {
    onLoad(nodes, edges);
  }, [nodes, edges, onLoad]);

  return null; // This component just provides the workflow data
};

export default PatientEnrollmentWorkflow;