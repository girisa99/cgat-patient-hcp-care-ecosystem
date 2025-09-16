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

      // Demographics Section with Sub-sections
      {
        id: 'demographics',
        type: 'default',
        position: { x: 100, y: 150 },
        data: {
          label: 'Patient Demographics',
          description: 'Collect comprehensive patient information',
          icon: User,
          section: 'demographics',
          table: 'enrollment_patient_info',
          fields: ['first_name', 'last_name', 'date_of_birth', 'phone', 'email', 'address'],
          status: 'pending',
          subSections: [
            'Basic Information',
            'Contact Details', 
            'Emergency Contacts',
            'Communication Preferences'
          ]
        }
      },

      // Demographics Sub-sections
      {
        id: 'demo-basic',
        type: 'default',
        position: { x: 300, y: 100 },
        data: {
          label: 'Basic Information',
          description: 'Name, DOB, SSN, Gender, Marital Status',
          icon: User,
          section: 'demographics-basic',
          parentSection: 'demographics',
          fields: ['first_name', 'last_name', 'date_of_birth', 'ssn', 'gender', 'marital_status'],
          status: 'pending'
        }
      },

      {
        id: 'demo-contact',
        type: 'default',
        position: { x: 300, y: 200 },
        data: {
          label: 'Contact & Address',
          description: 'Phone, email, home address, mailing address',
          icon: User,
          section: 'demographics-contact',
          parentSection: 'demographics',
          fields: ['phone', 'email', 'home_address', 'mailing_address'],
          status: 'pending'
        }
      },

      // NPI Verification Agent
      {
        id: 'npi-agent',
        type: 'default',
        position: { x: 500, y: 150 },
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

      // Clinical Information with Sub-sections
      {
        id: 'clinical-info',
        type: 'default',
        position: { x: 100, y: 350 },
        data: {
          label: 'Clinical Assessment',
          description: 'Comprehensive medical evaluation',
          icon: Stethoscope,
          section: 'clinical',
          table: 'enrollment_clinical_info',
          fields: ['medical_history', 'current_medications', 'allergies', 'primary_diagnosis'],
          status: 'pending',
          subSections: [
            'Medical History',
            'Current Medications',
            'Allergies & Reactions',
            'Previous Treatments',
            'Mental Health Assessment'
          ]
        }
      },

      // Clinical Sub-sections
      {
        id: 'clinical-history',
        type: 'default',
        position: { x: 300, y: 300 },
        data: {
          label: 'Medical History',
          description: 'Past medical conditions, surgeries, hospitalizations',
          icon: Stethoscope,
          section: 'clinical-history',
          parentSection: 'clinical',
          fields: ['past_conditions', 'surgeries', 'hospitalizations', 'family_history'],
          status: 'pending'
        }
      },

      {
        id: 'clinical-medications',
        type: 'default',
        position: { x: 300, y: 400 },
        data: {
          label: 'Current Medications',
          description: 'All current medications, dosages, frequencies',
          icon: Stethoscope,
          section: 'clinical-medications',
          parentSection: 'clinical',
          fields: ['current_medications', 'dosages', 'frequencies', 'prescribing_doctors'],
          status: 'pending'
        }
      },

      // Treatment Plan with Sub-sections
      {
        id: 'treatment-plan',
        type: 'default',
        position: { x: 500, y: 350 },
        data: {
          label: 'Treatment Planning',
          description: 'Comprehensive treatment strategy',
          icon: Heart,
          section: 'treatment',
          table: 'enrollment_treatment_plan',
          fields: ['treatment_type', 'duration', 'goals', 'provider_assignment'],
          status: 'pending',
          subSections: [
            'Treatment Goals',
            'Provider Assignment',
            'Treatment Modalities',
            'Schedule Preferences',
            'Care Team Assembly'
          ]
        }
      },

      // Insurance with Sub-sections
      {
        id: 'insurance',
        type: 'default',
        position: { x: 100, y: 550 },
        data: {
          label: 'Insurance Verification',
          description: 'Comprehensive insurance validation',
          icon: CreditCard,
          section: 'insurance',
          table: 'enrollment_insurance_info',
          fields: ['insurance_provider', 'policy_number', 'group_number', 'coverage_details'],
          status: 'pending',
          subSections: [
            'Primary Insurance',
            'Secondary Insurance',
            'Prior Authorizations',
            'Coverage Verification',
            'Financial Responsibility'
          ]
        }
      },

      // Insurance Sub-sections
      {
        id: 'insurance-primary',
        type: 'default',
        position: { x: 300, y: 500 },
        data: {
          label: 'Primary Insurance',
          description: 'Primary insurance details and verification',
          icon: CreditCard,
          section: 'insurance-primary',
          parentSection: 'insurance',
          fields: ['primary_insurance', 'policy_number', 'group_number', 'subscriber_info'],
          status: 'pending'
        }
      },

      {
        id: 'insurance-auth',
        type: 'default',
        position: { x: 300, y: 600 },
        data: {
          label: 'Prior Authorizations',
          description: 'Required authorizations and approvals',
          icon: CreditCard,
          section: 'insurance-auth',
          parentSection: 'insurance',
          fields: ['auth_requirements', 'approval_status', 'auth_numbers', 'expiration_dates'],
          status: 'pending'
        }
      },

      // Insurance Agent
      {
        id: 'insurance-agent',
        type: 'default',
        position: { x: 500, y: 550 },
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

      // Consent Management with Sub-sections
      {
        id: 'consent',
        type: 'default',
        position: { x: 100, y: 750 },
        data: {
          label: 'Consent & Legal',
          description: 'Comprehensive legal documentation',
          icon: Shield,
          section: 'consent',
          table: 'enrollment_consent',
          fields: ['hipaa_consent', 'treatment_consent', 'privacy_agreement', 'signature'],
          status: 'pending',
          subSections: [
            'HIPAA Authorization',
            'Treatment Consent',
            'Privacy Agreements',
            'Financial Agreements',
            'Emergency Authorization'
          ]
        }
      },

      // Consent Sub-sections
      {
        id: 'consent-hipaa',
        type: 'default',
        position: { x: 300, y: 700 },
        data: {
          label: 'HIPAA Authorization',
          description: 'Health information privacy agreements',
          icon: Shield,
          section: 'consent-hipaa',
          parentSection: 'consent',
          fields: ['hipaa_authorization', 'information_sharing', 'access_rights'],
          status: 'pending'
        }
      },

      {
        id: 'consent-treatment',
        type: 'default',
        position: { x: 300, y: 800 },
        data: {
          label: 'Treatment Consent',
          description: 'Consent for proposed treatments and procedures',
          icon: Shield,
          section: 'consent-treatment',
          parentSection: 'consent',
          fields: ['treatment_consent', 'procedure_consent', 'medication_consent'],
          status: 'pending'
        }
      },

      // Treatment Center Assignment with Sub-sections
      {
        id: 'treatment-center',
        type: 'default',
        position: { x: 500, y: 750 },
        data: {
          label: 'Treatment Center Assignment',
          description: 'Facility matching and assignment',
          icon: Building,
          section: 'facility',
          table: 'enrollment_collaborations',
          fields: ['assigned_facility', 'location_preference', 'specialty_match'],
          status: 'pending',
          subSections: [
            'Facility Matching',
            'Location Preferences',
            'Specialty Requirements',
            'Availability Check',
            'Assignment Confirmation'
          ]
        }
      },

      // Document Management with Sub-sections
      {
        id: 'documents',
        type: 'default',
        position: { x: 300, y: 950 },
        data: {
          label: 'Document Management',
          description: 'Comprehensive document collection',
          icon: FileText,
          section: 'documents',
          table: 'enrollment_documents',
          fields: ['document_type', 'file_path', 'upload_date', 'verification_status'],
          status: 'pending',
          subSections: [
            'Medical Records Upload',
            'Insurance Cards',
            'ID Verification',
            'Previous Treatment Records',
            'Lab Results & Reports'
          ]
        }
      },

      // Document Sub-sections
      {
        id: 'docs-medical',
        type: 'default',
        position: { x: 100, y: 900 },
        data: {
          label: 'Medical Records',
          description: 'Upload previous medical records and reports',
          icon: FileText,
          section: 'docs-medical',
          parentSection: 'documents',
          fields: ['medical_records', 'lab_reports', 'imaging_results'],
          status: 'pending'
        }
      },

      {
        id: 'docs-insurance',
        type: 'default',
        position: { x: 500, y: 900 },
        data: {
          label: 'Insurance Documents',
          description: 'Insurance cards and coverage documents',
          icon: FileText,
          section: 'docs-insurance',
          parentSection: 'documents',
          fields: ['insurance_cards', 'coverage_letters', 'auth_documents'],
          status: 'pending'
        }
      },

      // Final Review & Completion
      {
        id: 'completion',
        type: 'output',
        position: { x: 300, y: 1100 },
        data: {
          label: 'Enrollment Complete',
          description: 'Final review and enrollment completion',
          icon: CheckCircle,
          section: 'completion',
          table: 'patient_enrollments',
          fields: ['enrollment_status', 'completion_date', 'assigned_provider'],
          status: 'pending',
          subSections: [
            'Final Review',
            'Validation Check',
            'Provider Assignment',
            'Welcome Package',
            'First Appointment Scheduling'
          ]
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