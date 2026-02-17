/**
 * PATIENT ENROLLMENT MAIN STRUCTURE
 * 6 Main Tabs with AI Integration Sub-sections
 * - Consent Mode
 * - Patient Information  
 * - Provider & Treatment Center
 * - Insurance
 * - Treatment & Clinical
 * - Submit
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  User, 
  Building2, 
  CreditCard, 
  Stethoscope, 
  Send,
  Bot,
  MessageSquare,
  Database,
  Settings,
  FileText,
  Check
} from 'lucide-react';

interface SubSection {
  id: string;
  title: string;
  description: string;
  aiType: 'mcp' | 'conversational' | 'structured';
  fields: string[];
  completion: number;
  isRequired: boolean;
}

interface MainSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  subsections: SubSection[];
  overallCompletion: number;
}

const ENROLLMENT_MAIN_STRUCTURE: MainSection[] = [
  {
    id: 'consent_mode',
    title: 'Consent Mode',
    icon: Shield,
    description: 'Legal consents and privacy agreements',
    overallCompletion: 95,
    subsections: [
      {
        id: 'hipaa_consent_mcp',
        title: 'HIPAA Consent (MCP)',
        description: 'Database-driven HIPAA consent validation',
        aiType: 'mcp',
        fields: ['consent_text', 'patient_acknowledgment', 'date_signed', 'witness_info'],
        completion: 100,
        isRequired: true
      },
      {
        id: 'treatment_consent_conv',
        title: 'Treatment Consent (Conversational)',
        description: 'Interactive consent collection through conversation',
        aiType: 'conversational',
        fields: ['treatment_explanation', 'patient_questions', 'verbal_consent', 'understanding_confirmation'],
        completion: 90,
        isRequired: true
      },
      {
        id: 'privacy_forms_struct',
        title: 'Privacy Forms (Structured)',
        description: 'Structured privacy preference collection',
        aiType: 'structured',
        fields: ['data_sharing_prefs', 'marketing_consent', 'research_participation', 'contact_preferences'],
        completion: 95,
        isRequired: false
      }
    ]
  },
  {
    id: 'patient_info',
    title: 'Patient Information',
    icon: User,
    description: 'Demographics and personal details',
    overallCompletion: 92,
    subsections: [
      {
        id: 'demographics_conv',
        title: 'Demographics (Conversational)',
        description: 'Natural language demographic collection',
        aiType: 'conversational',
        fields: ['name', 'date_of_birth', 'gender', 'address', 'phone', 'email', 'emergency_contact'],
        completion: 95,
        isRequired: true
      },
      {
        id: 'identity_verification_mcp',
        title: 'Identity Verification (MCP)',
        description: 'Database-backed identity validation',
        aiType: 'mcp',
        fields: ['id_type', 'id_number', 'photo_upload', 'verification_status', 'duplicate_check'],
        completion: 88,
        isRequired: true
      },
      {
        id: 'contact_preferences_struct',
        title: 'Contact Preferences (Structured)',
        description: 'Structured communication preferences',
        aiType: 'structured',
        fields: ['preferred_contact_method', 'best_call_times', 'language_preference', 'accessibility_needs'],
        completion: 93,
        isRequired: false
      }
    ]
  },
  {
    id: 'provider_treatment_center',
    title: 'Provider & Treatment Center',
    icon: Building2,
    description: 'Healthcare provider and facility information',
    overallCompletion: 89,
    subsections: [
      {
        id: 'provider_verification_mcp',
        title: 'Provider Verification (MCP)',
        description: 'Automated NPI and credential verification',
        aiType: 'mcp',
        fields: ['npi_number', 'license_verification', 'specialty_codes', 'network_status', 'credential_check'],
        completion: 98,
        isRequired: true
      },
      {
        id: 'facility_selection_conv',
        title: 'Facility Selection (Conversational)',
        description: 'Interactive facility selection and scheduling',
        aiType: 'conversational',
        fields: ['preferred_location', 'distance_tolerance', 'availability_discussion', 'appointment_scheduling'],
        completion: 85,
        isRequired: true
      },
      {
        id: 'referral_coordination_struct',
        title: 'Referral Coordination (Structured)',
        description: 'Structured referral and coordination tracking',
        aiType: 'structured',
        fields: ['referring_provider', 'referral_reason', 'urgency_level', 'coordination_notes', 'follow_up_plan'],
        completion: 84,
        isRequired: false
      }
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance',
    icon: CreditCard,
    description: 'Insurance verification and benefits',
    overallCompletion: 91,
    subsections: [
      {
        id: 'benefits_verification_mcp',
        title: 'Benefits Verification (MCP)',
        description: 'Real-time insurance verification via API',
        aiType: 'mcp',
        fields: ['insurance_id', 'group_number', 'coverage_verification', 'copay_amounts', 'deductible_status'],
        completion: 96,
        isRequired: true
      },
      {
        id: 'coverage_discussion_conv',
        title: 'Coverage Discussion (Conversational)',
        description: 'Interactive benefits explanation and Q&A',
        aiType: 'conversational',
        fields: ['coverage_explanation', 'patient_questions', 'out_of_pocket_discussion', 'payment_options'],
        completion: 87,
        isRequired: false
      },
      {
        id: 'financial_assessment_struct',
        title: 'Financial Assessment (Structured)',
        description: 'Structured financial assistance evaluation',
        aiType: 'structured',
        fields: ['income_verification', 'assistance_eligibility', 'payment_plan_options', 'financial_counseling'],
        completion: 90,
        isRequired: false
      }
    ]
  },
  {
    id: 'treatment_clinical',
    title: 'Treatment & Clinical',
    icon: Stethoscope,
    description: 'Medical history and clinical assessments',
    overallCompletion: 87,
    subsections: [
      {
        id: 'medical_history_conv',
        title: 'Medical History (Conversational)',
        description: 'Interactive medical history collection',
        aiType: 'conversational',
        fields: ['current_symptoms', 'medical_history', 'medications', 'allergies', 'family_history'],
        completion: 92,
        isRequired: true
      },
      {
        id: 'clinical_assessment_mcp',
        title: 'Clinical Assessment (MCP)',
        description: 'Database-integrated clinical evaluation',
        aiType: 'mcp',
        fields: ['vital_signs', 'assessment_scores', 'risk_stratification', 'clinical_notes', 'care_plan'],
        completion: 85,
        isRequired: true
      },
      {
        id: 'treatment_planning_struct',
        title: 'Treatment Planning (Structured)',
        description: 'Structured treatment plan development',
        aiType: 'structured',
        fields: ['treatment_goals', 'intervention_plan', 'monitoring_schedule', 'outcome_measures'],
        completion: 84,
        isRequired: true
      }
    ]
  },
  {
    id: 'submit',
    title: 'Submit',
    icon: Send,
    description: 'Final review and submission',
    overallCompletion: 88,
    subsections: [
      {
        id: 'data_review_struct',
        title: 'Data Review (Structured)',
        description: 'Comprehensive data validation and review',
        aiType: 'structured',
        fields: ['completeness_check', 'validation_results', 'required_fields_status', 'data_quality_score'],
        completion: 95,
        isRequired: true
      },
      {
        id: 'final_confirmation_conv',
        title: 'Final Confirmation (Conversational)',
        description: 'Interactive final review and confirmation',
        aiType: 'conversational',
        fields: ['data_confirmation', 'patient_questions', 'final_consent', 'submission_acknowledgment'],
        completion: 85,
        isRequired: true
      },
      {
        id: 'document_generation_mcp',
        title: 'Document Generation (MCP)',
        description: 'Automated PDF generation and distribution',
        aiType: 'mcp',
        fields: ['pdf_generation', 'document_storage', 'distribution_list', 'delivery_confirmation'],
        completion: 85,
        isRequired: true
      }
    ]
  }
];

export const PatientEnrollmentMainStructure: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState('consent_mode');
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);

  const currentMainSection = ENROLLMENT_MAIN_STRUCTURE.find(s => s.id === activeMainTab);

  const getAITypeBadge = (aiType: 'mcp' | 'conversational' | 'structured') => {
    const config = {
      mcp: { color: 'bg-blue-500', icon: Database, label: 'MCP Agent' },
      conversational: { color: 'bg-green-500', icon: MessageSquare, label: 'Conversational AI' },
      structured: { color: 'bg-purple-500', icon: Settings, label: 'Structured AI' }
    };
    
    const typeConfig = config[aiType];
    const Icon = typeConfig.icon;
    
    return (
      <Badge className={`${typeConfig.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {typeConfig.label}
      </Badge>
    );
  };

  const getOverallProgress = () => {
    const totalCompletion = ENROLLMENT_MAIN_STRUCTURE.reduce((acc, section) => acc + section.overallCompletion, 0);
    return Math.round(totalCompletion / ENROLLMENT_MAIN_STRUCTURE.length);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Patient Enrollment - Main Structure
          </h1>
          <p className="text-muted-foreground">
            6 Main tabs with AI-powered sub-sections | Overall Progress: {getOverallProgress()}%
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Generate Universal PDF
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Enrollment Progress</span>
            <span className="text-sm text-muted-foreground">{getOverallProgress()}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </CardContent>
      </Card>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {ENROLLMENT_MAIN_STRUCTURE.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <div className="text-left">
                  <div>{section.title}</div>
                  <div className="text-xs opacity-70">{section.overallCompletion}%</div>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ENROLLMENT_MAIN_STRUCTURE.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                <p className="text-muted-foreground">{section.description}</p>
                <div className="flex items-center gap-2">
                  <Progress value={section.overallCompletion} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{section.overallCompletion}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
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
                          <div className="flex items-center gap-2">
                            {subsection.title}
                            {subsection.isRequired && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                          {getAITypeBadge(subsection.aiType)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{subsection.description}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={subsection.completion} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{subsection.completion}%</span>
                          {subsection.completion === 100 && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {subsection.fields.map((field) => (
                            <div key={field} className="text-sm text-muted-foreground flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground opacity-50" />
                              {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Integration Summary for Current Tab */}
            <Card>
              <CardHeader>
                <CardTitle>AI Integration Summary - {section.title}</CardTitle>
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

      {/* PDF Generation Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Universal PDF Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-muted-foreground">
              <strong>Yes, we use the same edge function (`generate-enrollment-pdf`) for ALL PDF generation:</strong>
            </p>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="font-semibold">Manual Forms</p>
                <p className="text-xs text-muted-foreground">Online form submissions</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold">MCP Agents</p>
                <p className="text-xs text-muted-foreground">Database-driven data</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-semibold">Conversational AI</p>
                <p className="text-xs text-muted-foreground">Natural language data</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Settings className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="font-semibold">Structured AI</p>
                <p className="text-xs text-muted-foreground">Validated form data</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The edge function automatically detects the data source type and applies appropriate formatting and validation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};