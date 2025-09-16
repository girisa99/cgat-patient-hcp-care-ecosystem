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

      // 1. Patient Demographics (enrollment_patient_info)
      {
        id: 'patient_demographics',
        type: 'default',
        position: { x: 100, y: 200 },
        data: {
          label: 'Patient Demographics',
          description: 'Basic patient information',
          icon: User,
          section: 'demographics',
          table: 'enrollment_patient_info',
          fields: ['first_name', 'last_name', 'middle_name', 'date_of_birth', 'gender', 'ssn'],
          status: 'pending',
          aiAgent: {
            name: 'Demographics Agent',
            description: 'Collects patient demographic information',
            prompt: 'Help collect patient demographics including name, date of birth, gender'
          }
        }
      },

      // 2. Contact Information (enrollment_patient_info)
      {
        id: 'contact_info',
        type: 'default',
        position: { x: 400, y: 200 },
        data: {
          label: 'Contact Information',
          description: 'Phone, email, and address details',
          icon: User,
          section: 'contact',
          table: 'enrollment_patient_info',
          fields: ['phone', 'email', 'address_line1', 'address_line2', 'city', 'state', 'zip_code'],
          status: 'pending'
        }
      },

      // 3. Emergency Contact (enrollment_patient_info)
      {
        id: 'emergency_contact',
        type: 'default',
        position: { x: 700, y: 200 },
        data: {
          label: 'Emergency Contact',
          description: 'Emergency contact details',
          icon: User,
          section: 'emergency',
          table: 'enrollment_patient_info',
          fields: ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'],
          status: 'pending'
        }
      },

      // 4. Clinical Assessment (enrollment_clinical_info)
      {
        id: 'clinical_assessment',
        type: 'default',
        position: { x: 100, y: 400 },
        data: {
          label: 'Clinical Assessment',
          description: 'Medical history and clinical information',
          icon: Stethoscope,
          section: 'clinical',
          table: 'enrollment_clinical_info',
          fields: ['chief_complaint', 'medical_history', 'surgical_history', 'family_history', 'social_history'],
          status: 'pending',
          aiAgent: {
            name: 'Clinical Assessment Agent',
            description: 'Gathers comprehensive medical history',
            prompt: 'Collect detailed medical history including chief complaint and past medical history'
          }
        }
      },

      // 5. Medications & Allergies (enrollment_clinical_info)
      {
        id: 'medications_allergies',
        type: 'default',
        position: { x: 400, y: 400 },
        data: {
          label: 'Medications & Allergies',
          description: 'Current medications and known allergies',
          icon: Stethoscope,
          section: 'medications',
          table: 'enrollment_clinical_info',
          fields: ['current_medications', 'allergies'],
          status: 'pending'
        }
      },

      // 6. Primary Insurance (enrollment_insurance_info)
      {
        id: 'primary_insurance',
        type: 'default',
        position: { x: 100, y: 600 },
        data: {
          label: 'Primary Insurance',
          description: 'Primary insurance information',
          icon: CreditCard,
          section: 'insurance',
          table: 'enrollment_insurance_info',
          fields: ['primary_insurance_name', 'primary_policy_number', 'primary_group_number', 'primary_subscriber_name'],
          status: 'pending',
          aiAgent: {
            name: 'Insurance Verification Agent',
            description: 'Verifies insurance coverage and benefits',
            prompt: 'Collect and verify primary insurance information and check benefits'
          }
        }
      },

      // 7. Secondary Insurance (enrollment_insurance_info)
      {
        id: 'secondary_insurance',
        type: 'default',
        position: { x: 400, y: 600 },
        data: {
          label: 'Secondary Insurance',
          description: 'Secondary insurance if applicable',
          icon: CreditCard,
          section: 'secondary_insurance',
          table: 'enrollment_insurance_info',
          fields: ['secondary_insurance_name', 'secondary_policy_number', 'secondary_group_number'],
          status: 'pending'
        }
      },

      // 8. Insurance Benefits (enrollment_insurance_info)
      {
        id: 'insurance_benefits',
        type: 'default',
        position: { x: 700, y: 600 },
        data: {
          label: 'Insurance Benefits',
          description: 'Coverage details and benefits verification',
          icon: CreditCard,
          section: 'benefits',
          table: 'enrollment_insurance_info',
          fields: ['copay_amount', 'deductible_amount', 'out_of_pocket_max', 'prior_authorization_required'],
          status: 'pending'
        }
      },

      // 9. Treatment Consent (enrollment_consent)
      {
        id: 'treatment_consent',
        type: 'default',
        position: { x: 100, y: 800 },
        data: {
          label: 'Treatment Consent',
          description: 'Consent to treatment',
          icon: Shield,
          section: 'consent',
          table: 'enrollment_consent',
          fields: ['consent_to_treatment', 'consent_date', 'patient_signature'],
          status: 'pending',
          aiAgent: {
            name: 'Consent Management Agent',
            description: 'Manages consent collection and validation',
            prompt: 'Guide patients through treatment consent forms and legal requirements'
          }
        }
      },

      // 10. HIPAA & Legal (enrollment_consent)
      {
        id: 'hipaa_legal',
        type: 'default',
        position: { x: 400, y: 800 },
        data: {
          label: 'HIPAA & Legal',
          description: 'HIPAA authorization and legal consents',
          icon: Shield,
          section: 'hipaa',
          table: 'enrollment_consent',
          fields: ['hipaa_authorization', 'financial_responsibility', 'communication_consent'],
          status: 'pending'
        }
      },

      // 11. Document Upload (enrollment_documents)
      {
        id: 'document_upload',
        type: 'default',
        position: { x: 100, y: 1000 },
        data: {
          label: 'Document Upload',
          description: 'Upload required documents',
          icon: FileText,
          section: 'documents',
          table: 'enrollment_documents',
          fields: ['document_type', 'file_name', 'file_path'],
          status: 'pending',
          aiAgent: {
            name: 'Document Management Agent',
            description: 'Manages document collection and organization',
            prompt: 'Help patients upload and organize required enrollment documents'
          }
        }
      },

      // 12. Enrollment Completion (patient_enrollments)
      {
        id: 'enrollment_completion',
        type: 'output',
        position: { x: 400, y: 1000 },
        data: {
          label: 'Enrollment Complete',
          description: 'Final enrollment status and tracking',
          icon: CheckCircle,
          section: 'completion',
          table: 'patient_enrollments',
          fields: ['enrollment_status', 'progress_percentage'],
          status: 'pending'
        }
      }
    ];

    const workflowEdges: Edge[] = [
      // Main Sequential flow
      { id: 'e1', source: 'start', target: 'demographics', animated: true },
      { id: 'e2', source: 'demographics', target: 'clinical-info', animated: true },
      { id: 'e3', source: 'clinical-info', target: 'treatment-plan', animated: true },
      { id: 'e4', source: 'treatment-plan', target: 'insurance', animated: true },
      { id: 'e5', source: 'insurance', target: 'consent', animated: true },
      { id: 'e6', source: 'consent', target: 'treatment-center', animated: true },
      { id: 'e7', source: 'treatment-center', target: 'documents', animated: true },
      { id: 'e8', source: 'documents', target: 'completion', animated: true },

      // Demographics Sub-section flows
      { id: 'e9', source: 'demographics', target: 'demo-basic', type: 'step', animated: true },
      { id: 'e10', source: 'demographics', target: 'demo-contact', type: 'step', animated: true },
      { id: 'e11', source: 'demo-basic', target: 'npi-agent', type: 'step', animated: true },
      { id: 'e12', source: 'demo-contact', target: 'npi-agent', type: 'step', animated: true },

      // Clinical Sub-section flows
      { id: 'e13', source: 'clinical-info', target: 'clinical-history', type: 'step', animated: true },
      { id: 'e14', source: 'clinical-info', target: 'clinical-medications', type: 'step', animated: true },
      { id: 'e15', source: 'clinical-history', target: 'treatment-plan', type: 'step', animated: true },
      { id: 'e16', source: 'clinical-medications', target: 'treatment-plan', type: 'step', animated: true },

      // Insurance Sub-section flows
      { id: 'e17', source: 'insurance', target: 'insurance-primary', type: 'step', animated: true },
      { id: 'e18', source: 'insurance', target: 'insurance-auth', type: 'step', animated: true },
      { id: 'e19', source: 'insurance-primary', target: 'insurance-agent', type: 'step', animated: true },
      { id: 'e20', source: 'insurance-auth', target: 'insurance-agent', type: 'step', animated: true },

      // Consent Sub-section flows
      { id: 'e21', source: 'consent', target: 'consent-hipaa', type: 'step', animated: true },
      { id: 'e22', source: 'consent', target: 'consent-treatment', type: 'step', animated: true },
      { id: 'e23', source: 'consent-hipaa', target: 'treatment-center', type: 'step', animated: true },
      { id: 'e24', source: 'consent-treatment', target: 'treatment-center', type: 'step', animated: true },

      // Document Sub-section flows
      { id: 'e25', source: 'documents', target: 'docs-medical', type: 'step', animated: true },
      { id: 'e26', source: 'documents', target: 'docs-insurance', type: 'step', animated: true },
      { id: 'e27', source: 'docs-medical', target: 'completion', type: 'step', animated: true },
      { id: 'e28', source: 'docs-insurance', target: 'completion', type: 'step', animated: true },

      // AI Agent cross-connections for validation
      { id: 'e29', source: 'npi-agent', target: 'clinical-info', type: 'smoothstep', style: { stroke: '#10b981', strokeDasharray: '5,5' }},
      { id: 'e30', source: 'insurance-agent', target: 'consent', type: 'smoothstep', style: { stroke: '#3b82f6', strokeDasharray: '5,5' }},
      
      // Cross-validation flows
      { id: 'e31', source: 'npi-agent', target: 'treatment-plan', type: 'smoothstep', style: { stroke: '#10b981', strokeDasharray: '3,3' }},
      { id: 'e32', source: 'insurance-agent', target: 'treatment-center', type: 'smoothstep', style: { stroke: '#3b82f6', strokeDasharray: '3,3' }}
    ];

    return { nodes: workflowNodes, edges: workflowEdges };
  }, []);

  React.useEffect(() => {
    onLoad(nodes, edges);
  }, [nodes, edges, onLoad]);

  return null; // This component just provides the workflow data
};

export default PatientEnrollmentWorkflow;