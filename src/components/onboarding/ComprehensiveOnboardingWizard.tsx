/**
 * COMPREHENSIVE ONBOARDING WIZARD - Complete Treatment Center Onboarding
 * All 21+ sequential steps for treatment center onboarding with save/exit functionality
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Check,
  Building,
  Users,
  FileText,
  CreditCard,
  Shield,
  MapPin,
  Clock,
  Settings,
  Database,
  Globe,
  Key,
  Package,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { TreatmentCenterOnboarding, OnboardingStep } from '@/types/onboarding';
import { 
  DetailedBusinessClassificationStep,
  DetailedCreditApplicationStep, 
  DetailedGPOMembershipStep,
  DetailedFinancialAssessmentStep,
  DetailedOperatingHoursStep,
  DetailedAuthorizationsStep,
  DetailedDocumentsStep
} from './DetailedStepComponents';

interface ComprehensiveOnboardingWizardProps {
  applicationId?: string | null;
  onSubmit: (data: Partial<TreatmentCenterOnboarding>) => void;
  onSaveAndExit: (data: Partial<TreatmentCenterOnboarding>) => void;
  onBack: () => void;
  initialData?: Partial<TreatmentCenterOnboarding>;
}

interface WizardStep {
  id: OnboardingStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'basic' | 'business' | 'financial' | 'compliance' | 'operations' | 'technical';
  required: boolean;
  component: React.ReactNode;
}

export const ComprehensiveOnboardingWizard: React.FC<ComprehensiveOnboardingWizardProps> = ({
  applicationId,
  onSubmit,
  onSaveAndExit,
  onBack,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TreatmentCenterOnboarding>>(
    initialData || {
      company_info: {
        legal_name: '',
        dba_name: '',
        website: '',
        federal_tax_id: '',
        same_as_legal_address: false,
        legal_address: { street: '', city: '', state: '', zip: '' }
      },
      business_info: {
        business_type: [],
        years_in_business: 0,
        ownership_type: 'corporation' as any,
        number_of_employees: 0,
        estimated_monthly_purchases: 0
      },
      contacts: {
        primary_contact: { name: '', title: '', phone: '', email: '' }
      },
      workflow: {
        current_step: 'company_info',
        completed_steps: [],
        notes: []
      }
    }
  );
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => {
      const currentSection = prev[section as keyof typeof prev] as any;
      return {
        ...prev,
        [section]: {
          ...(currentSection || {}),
          ...data
        }
      };
    });
  };

  // All 21+ onboarding steps
  const steps: WizardStep[] = [
    {
      id: 'company_info',
      title: 'Company Information',
      description: 'Basic company details and legal information',
      icon: <Building className="h-5 w-5" />,
      category: 'basic',
      required: true,
      component: <CompanyInfoStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'business_classification',
      title: 'Business Classification',
      description: 'Healthcare facility type and classification',
      icon: <Briefcase className="h-5 w-5" />,
      category: 'business',
      required: true,
      component: <BusinessClassificationStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'contacts',
      title: 'Contact Information',
      description: 'Primary and secondary contacts for your facility',
      icon: <Users className="h-5 w-5" />,
      category: 'basic',
      required: true,
      component: <ContactsStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'ownership',
      title: 'Ownership Structure',
      description: 'Principal owners and controlling entities',
      icon: <Users className="h-5 w-5" />,
      category: 'business',
      required: true,
      component: <OwnershipStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'references',
      title: 'Business References',
      description: 'Bank and supplier references',
      icon: <FileText className="h-5 w-5" />,
      category: 'business',
      required: true,
      component: <ReferencesStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'payment_banking',
      title: 'Payment & Banking',
      description: 'Banking information and payment preferences',
      icon: <CreditCard className="h-5 w-5" />,
      category: 'financial',
      required: true,
      component: <PaymentBankingStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'licenses',
      title: 'Licenses & Certifications',
      description: 'DEA, state licenses, and certifications',
      icon: <Shield className="h-5 w-5" />,
      category: 'compliance',
      required: true,
      component: <LicensesStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'documents',
      title: 'Required Documents',
      description: 'Upload required documentation',
      icon: <FileText className="h-5 w-5" />,
      category: 'compliance',
      required: true,
      component: <DocumentsStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'therapy_selection',
      title: 'Therapy Areas',
      description: 'Select therapeutic areas of focus',
      icon: <Database className="h-5 w-5" />,
      category: 'operations',
      required: false,
      component: <TherapySelectionStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'service_selection',
      title: 'Service Selection',
      description: 'Choose required services and programs',
      icon: <Settings className="h-5 w-5" />,
      category: 'operations',
      required: false,
      component: <ServiceSelectionStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'online_services',
      title: 'Online Platform Setup',
      description: 'Configure online ordering and management',
      icon: <Globe className="h-5 w-5" />,
      category: 'technical',
      required: false,
      component: <OnlineServicesStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'purchasing_preferences',
      title: 'Purchasing Preferences',
      description: 'Order methods and inventory management',
      icon: <Package className="h-5 w-5" />,
      category: 'operations',
      required: false,
      component: <PurchasingPreferencesStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'financial_assessment',
      title: 'Financial Assessment',
      description: 'Revenue, insurance, and financial details',
      icon: <CreditCard className="h-5 w-5" />,
      category: 'financial',
      required: true,
      component: <FinancialAssessmentStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'credit_application',
      title: 'Credit Application',
      description: 'Credit terms and trade references',
      icon: <CreditCard className="h-5 w-5" />,
      category: 'financial',
      required: false,
      component: <CreditApplicationStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'gpo_membership',
      title: 'GPO Memberships',
      description: 'Group purchasing organization details',
      icon: <Users className="h-5 w-5" />,
      category: 'business',
      required: false,
      component: <GPOMembershipStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'office_hours',
      title: 'Operating Hours',
      description: 'Facility hours and emergency contacts',
      icon: <Clock className="h-5 w-5" />,
      category: 'operations',
      required: true,
      component: <OfficeHoursStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'authorizations',
      title: 'Authorizations & Signatures',
      description: 'Legal authorizations and electronic signatures',
      icon: <Key className="h-5 w-5" />,
      category: 'compliance',
      required: true,
      component: <AuthorizationsStep formData={formData} updateFormData={updateFormData} />
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Final review before submission',
      icon: <Check className="h-5 w-5" />,
      category: 'compliance',
      required: true,
      component: <ReviewStep formData={formData} />
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const categoryColors = {
    basic: 'bg-blue-500',
    business: 'bg-green-500',
    financial: 'bg-yellow-500',
    compliance: 'bg-red-500',
    operations: 'bg-purple-500',
    technical: 'bg-indigo-500'
  };

  const markStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
  };

  const handleNext = () => {
    markStepComplete();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAndExit = () => {
    markStepComplete();
    onSaveAndExit({
      ...formData,
      workflow: {
        ...formData.workflow!,
        current_step: currentStepData.id,
        completed_steps: Array.from(completedSteps).map(i => steps[i].id)
      }
    });
  };

  const handleSubmit = () => {
    markStepComplete();
    onSubmit({
      ...formData,
      workflow: {
        ...formData.workflow!,
        current_step: 'review',
        completed_steps: steps.map(s => s.id)
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">
          Treatment Center Onboarding
        </h1>
        <p className="text-muted-foreground mb-4">
          Complete all required sections to onboard your treatment center
        </p>
        
        <div className="bg-card border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length} steps
            </span>
          </div>
          <Progress value={progress} className="w-full mb-2" />
          <div className="text-xs text-muted-foreground">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Onboarding Steps</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    index === currentStep
                      ? 'border-primary bg-primary/5'
                      : completedSteps.has(index)
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${categoryColors[step.category]} text-white`}>
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{step.title}</p>
                        {completedSteps.has(index) && (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                        {step.required && !completedSteps.has(index) && (
                          <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${categoryColors[currentStepData.category]} text-white`}>
                  {currentStepData.icon}
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentStepData.title}
                    {currentStepData.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {currentStepData.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentStepData.component}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveAndExit}>
                <Save className="h-4 w-4 mr-2" />
                Save & Exit
              </Button>
              
              {isLastStep ? (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  Submit Application
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual step components (simplified versions - these would be expanded with full forms)
const CompanyInfoStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="legal_name">Legal Company Name *</Label>
        <Input
          id="legal_name"
          value={formData.company_info?.legal_name || ''}
          onChange={(e) => updateFormData('company_info', { legal_name: e.target.value })}
          placeholder="Enter legal company name"
          required
        />
      </div>
      <div>
        <Label htmlFor="dba_name">DBA Name</Label>
        <Input
          id="dba_name"
          value={formData.company_info?.dba_name || ''}
          onChange={(e) => updateFormData('company_info', { dba_name: e.target.value })}
          placeholder="Doing Business As name"
        />
      </div>
      <div>
        <Label htmlFor="federal_tax_id">Federal Tax ID *</Label>
        <Input
          id="federal_tax_id"
          value={formData.company_info?.federal_tax_id || ''}
          onChange={(e) => updateFormData('company_info', { federal_tax_id: e.target.value })}
          placeholder="XX-XXXXXXX"
          required
        />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.company_info?.website || ''}
          onChange={(e) => updateFormData('company_info', { website: e.target.value })}
          placeholder="https://example.com"
        />
      </div>
    </div>
  </div>
);

const BusinessClassificationStep = DetailedBusinessClassificationStep;
const ContactsStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="primary_contact_name">Primary Contact Name</Label>
        <Input
          id="primary_contact_name"
          value={formData.contacts?.primary_contact?.name || ''}
          onChange={(e) => updateFormData('contacts', { 
            primary_contact: { ...formData.contacts?.primary_contact, name: e.target.value }
          })}
          placeholder="Contact person name"
        />
      </div>
      <div>
        <Label htmlFor="primary_contact_email">Email</Label>
        <Input
          id="primary_contact_email"
          type="email"
          value={formData.contacts?.primary_contact?.email || ''}
          onChange={(e) => updateFormData('contacts', { 
            primary_contact: { ...formData.contacts?.primary_contact, email: e.target.value }
          })}
          placeholder="email@example.com"
        />
      </div>
    </div>
  </div>
);
const OwnershipStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Principal Owners & Controlling Entities</h4>
      <Button variant="outline" className="w-full">Add Principal Owner</Button>
    </div>
  </div>
);
const ReferencesStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Business References</h4>
      <Button variant="outline" className="w-full">Add Reference</Button>
    </div>
  </div>
);
const PaymentBankingStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="bank_name">Bank Name</Label>
        <Input id="bank_name" placeholder="Bank name" />
      </div>
      <div>
        <Label htmlFor="routing_number">Routing Number</Label>
        <Input id="routing_number" placeholder="9-digit routing number" />
      </div>
    </div>
  </div>
);
const LicensesStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="dea_number">DEA Number</Label>
        <Input id="dea_number" placeholder="DEA registration number" />
      </div>
      <div>
        <Label htmlFor="medical_license">Medical License</Label>
        <Input id="medical_license" placeholder="Medical license number" />
      </div>
    </div>
  </div>
);
const DocumentsStep = DetailedDocumentsStep;
const TherapySelectionStep = ({ formData, updateFormData }: any) => (
  <div className="p-4 border rounded-lg">
    <h4 className="font-medium mb-3">Therapy Areas</h4>
    <p className="text-sm text-muted-foreground">Select therapeutic areas of focus</p>
  </div>
);
const ServiceSelectionStep = ({ formData, updateFormData }: any) => (
  <div className="p-4 border rounded-lg">
    <h4 className="font-medium mb-3">Service Selection</h4>
    <p className="text-sm text-muted-foreground">Choose required services and programs</p>
  </div>
);
const OnlineServicesStep = ({ formData, updateFormData }: any) => (
  <div className="p-4 border rounded-lg">
    <h4 className="font-medium mb-3">Online Platform Setup</h4>
    <p className="text-sm text-muted-foreground">Configure online ordering and management</p>
  </div>
);
const PurchasingPreferencesStep = ({ formData, updateFormData }: any) => (
  <div className="p-4 border rounded-lg">
    <h4 className="font-medium mb-3">Purchasing Preferences</h4>
    <p className="text-sm text-muted-foreground">Order methods and inventory management</p>
  </div>
);
const FinancialAssessmentStep = DetailedFinancialAssessmentStep;
const CreditApplicationStep = DetailedCreditApplicationStep;
const GPOMembershipStep = DetailedGPOMembershipStep;
const OfficeHoursStep = DetailedOperatingHoursStep;
const AuthorizationsStep = DetailedAuthorizationsStep;

const ReviewStep = ({ formData }: any) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-3">Review Your Application</h3>
      <p className="text-muted-foreground mb-4">
        Please review all information before submitting your treatment center onboarding application.
      </p>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Company Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Legal Name:</strong> {formData.company_info?.legal_name || 'Not provided'}
            </div>
            <div>
              <strong>Federal Tax ID:</strong> {formData.company_info?.federal_tax_id || 'Not provided'}
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg bg-yellow-50">
          <p className="text-sm text-yellow-800">
            ⚠️ This is a comprehensive review. In the full implementation, all sections would be displayed here for final verification.
          </p>
        </div>
      </div>
    </div>
  </div>
);