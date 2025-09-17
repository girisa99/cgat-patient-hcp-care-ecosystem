/**
 * ENHANCED ENROLLMENT STRUCTURE
 * Main tabs with comprehensive sub-sections for all AI types
 * - MCP Agents
 * - Conversational AI  
 * - Structured AI
 * - PDF Generation Agent
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Stethoscope, 
  FileText, 
  CreditCard, 
  Shield, 
  Bot,
  MessageSquare,
  Database,
  Settings,
  Download
} from 'lucide-react';

interface EnrollmentSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  subsections: {
    id: string;
    title: string;
    fields: string[];
    aiType: 'mcp' | 'conversational' | 'structured';
    coverage: number;
  }[];
}

const ENROLLMENT_STRUCTURE: EnrollmentSection[] = [
  {
    id: 'patient_demographics',
    title: 'Patient Demographics',
    icon: User,
    description: 'Core patient identification and demographic information',
    subsections: [
      {
        id: 'basic_info',
        title: 'Basic Information',
        fields: ['first_name', 'last_name', 'date_of_birth', 'ssn', 'gender', 'marital_status'],
        aiType: 'conversational',
        coverage: 95
      },
      {
        id: 'contact_info',
        title: 'Contact Information',
        fields: ['phone', 'email', 'address', 'emergency_contact', 'preferred_communication'],
        aiType: 'structured',
        coverage: 90
      },
      {
        id: 'identity_verification',
        title: 'Identity Verification',
        fields: ['photo_id', 'id_number', 'verification_method', 'documents'],
        aiType: 'mcp',
        coverage: 85
      }
    ]
  },
  {
    id: 'clinical_information',
    title: 'Clinical Information',
    icon: Stethoscope,
    description: 'Medical history, conditions, and clinical assessments',
    subsections: [
      {
        id: 'medical_history',
        title: 'Medical History',
        fields: ['current_medications', 'allergies', 'chronic_conditions', 'past_surgeries'],
        aiType: 'conversational',
        coverage: 92
      },
      {
        id: 'clinical_assessment',
        title: 'Clinical Assessment',
        fields: ['diagnosis_codes', 'treatment_plan', 'care_goals', 'risk_factors'],
        aiType: 'structured',
        coverage: 88
      },
      {
        id: 'provider_notes',
        title: 'Provider Notes',
        fields: ['clinical_notes', 'assessment_summary', 'recommendations'],
        aiType: 'mcp',
        coverage: 80
      }
    ]
  },
  {
    id: 'insurance_coverage',
    title: 'Insurance & Coverage',
    icon: CreditCard,
    description: 'Insurance verification, benefits, and financial information',
    subsections: [
      {
        id: 'primary_insurance',
        title: 'Primary Insurance',
        fields: ['insurance_company', 'policy_number', 'group_number', 'effective_date'],
        aiType: 'structured',
        coverage: 95
      },
      {
        id: 'benefits_verification',
        title: 'Benefits Verification',
        fields: ['coverage_details', 'copay_amounts', 'deductible', 'prior_auth'],
        aiType: 'mcp',
        coverage: 85
      },
      {
        id: 'financial_assessment',
        title: 'Financial Assessment',
        fields: ['payment_method', 'financial_assistance', 'payment_plan'],
        aiType: 'conversational',
        coverage: 75
      }
    ]
  },
  {
    id: 'provider_information',
    title: 'Provider Information',
    icon: FileText,
    description: 'Healthcare provider details and credentials',
    subsections: [
      {
        id: 'provider_credentials',
        title: 'Provider Credentials',
        fields: ['npi_number', 'license_number', 'specialization', 'certifications'],
        aiType: 'mcp',
        coverage: 98
      },
      {
        id: 'practice_details',
        title: 'Practice Details',
        fields: ['practice_name', 'address', 'contact_info', 'network_status'],
        aiType: 'structured',
        coverage: 90
      },
      {
        id: 'referral_coordination',
        title: 'Referral Coordination',
        fields: ['referring_provider', 'referral_reason', 'coordination_notes'],
        aiType: 'conversational',
        coverage: 82
      }
    ]
  },
  {
    id: 'compliance_documentation',
    title: 'Compliance & Documentation',
    icon: Shield,
    description: 'Legal compliance, consents, and regulatory requirements',
    subsections: [
      {
        id: 'consent_forms',
        title: 'Consent Forms',
        fields: ['hipaa_consent', 'treatment_consent', 'financial_consent', 'research_consent'],
        aiType: 'structured',
        coverage: 100
      },
      {
        id: 'regulatory_compliance',
        title: 'Regulatory Compliance',
        fields: ['cfr_requirements', 'audit_trail', 'data_retention', 'privacy_controls'],
        aiType: 'mcp',
        coverage: 95
      },
      {
        id: 'digital_signatures',
        title: 'Digital Signatures',
        fields: ['patient_signature', 'provider_signature', 'witness_signature', 'timestamp'],
        aiType: 'conversational',
        coverage: 90
      }
    ]
  },
  {
    id: 'document_generation',
    title: 'Document Generation',
    icon: Download,
    description: 'PDF generation and document management across all forms',
    subsections: [
      {
        id: 'pdf_templates',
        title: 'PDF Templates',
        fields: ['enrollment_pdf', 'consent_pdf', 'clinical_summary', 'insurance_forms'],
        aiType: 'mcp',
        coverage: 100
      },
      {
        id: 'document_workflow',
        title: 'Document Workflow',
        fields: ['generation_trigger', 'approval_process', 'distribution', 'storage'],
        aiType: 'structured',
        coverage: 95
      },
      {
        id: 'cross_application',
        title: 'Cross-Application Usage',
        fields: ['form_templates', 'universal_fields', 'ai_integration', 'replication'],
        aiType: 'conversational',
        coverage: 90
      }
    ]
  }
];

export const EnhancedEnrollmentStructure: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState(ENROLLMENT_STRUCTURE[0].id);
  const [selectedSubsection, setSelectedSubsection] = useState(ENROLLMENT_STRUCTURE[0].subsections[0].id);

  const currentSection = ENROLLMENT_STRUCTURE.find(s => s.id === selectedSection);
  const currentSubsection = currentSection?.subsections.find(ss => ss.id === selectedSubsection);

  const getAITypeBadge = (aiType: 'mcp' | 'conversational' | 'structured') => {
    const config = {
      mcp: { color: 'bg-blue-500', label: 'MCP Agent' },
      conversational: { color: 'bg-green-500', label: 'Conversational AI' },
      structured: { color: 'bg-purple-500', label: 'Structured AI' }
    };
    
    const typeConfig = config[aiType];
    return (
      <Badge className={`${typeConfig.color} text-white`}>
        {typeConfig.label}
      </Badge>
    );
  };

  const getOverallCoverage = () => {
    const totalFields = ENROLLMENT_STRUCTURE.reduce((acc, section) => 
      acc + section.subsections.reduce((subAcc, subsection) => 
        subAcc + subsection.fields.length, 0), 0);
    
    const coveredFields = ENROLLMENT_STRUCTURE.reduce((acc, section) => 
      acc + section.subsections.reduce((subAcc, subsection) => 
        subAcc + Math.round(subsection.fields.length * (subsection.coverage / 100)), 0), 0);
    
    return Math.round((coveredFields / totalFields) * 100);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Enhanced Enrollment Structure
          </h1>
          <p className="text-muted-foreground">
            Comprehensive enrollment system with {ENROLLMENT_STRUCTURE.length} main sections, 
            {ENROLLMENT_STRUCTURE.reduce((acc, s) => acc + s.subsections.length, 0)} subsections, 
            and {getOverallCoverage()}% field coverage
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Generate PDF Agent
        </Button>
      </div>

      <Tabs value={selectedSection} onValueChange={setSelectedSection} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {ENROLLMENT_STRUCTURE.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {section.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ENROLLMENT_STRUCTURE.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                <p className="text-muted-foreground">{section.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {section.subsections.map((subsection) => (
                    <Card 
                      key={subsection.id} 
                      className={`cursor-pointer transition-all ${
                        selectedSubsection === subsection.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedSubsection(subsection.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {subsection.title}
                          {getAITypeBadge(subsection.aiType)}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{subsection.fields.length} fields</Badge>
                          <Badge variant="outline">{subsection.coverage}% coverage</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {subsection.fields.map((field) => (
                            <div key={field} className="text-sm text-muted-foreground">
                              • {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Integration Summary */}
            <Card>
              <CardHeader>
                <CardTitle>AI Integration Summary for {section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">MCP Agents</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {section.subsections.filter(s => s.aiType === 'mcp').length}
                    </p>
                    <p className="text-sm text-muted-foreground">subsections</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">Conversational AI</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {section.subsections.filter(s => s.aiType === 'conversational').length}
                    </p>
                    <p className="text-sm text-muted-foreground">subsections</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Settings className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">Structured AI</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {section.subsections.filter(s => s.aiType === 'structured').length}
                    </p>
                    <p className="text-sm text-muted-foreground">subsections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};