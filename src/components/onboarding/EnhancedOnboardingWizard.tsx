
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useTreatmentCenterOnboarding } from '@/hooks/useTreatmentCenterOnboarding';
import { useAutoSave } from '@/hooks/useAutoSave';
import { CompanyInfoStep } from './steps/CompanyInfoStep';
import { BusinessClassificationStep } from './steps/BusinessClassificationStep';
import { ContactsStep } from './steps/ContactsStep';
import { OwnershipStep } from './steps/OwnershipStep';
import { ReferencesStep } from './steps/ReferencesStep';
import { PaymentBankingStep } from './steps/PaymentBankingStep';
import { LicensesStep } from './steps/LicensesStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { AuthorizationsStep } from './steps/AuthorizationsStep';
import { PurchasingPreferencesStep } from './steps/PurchasingPreferencesStep';
import { FinancialAssessmentStep } from './steps/FinancialAssessmentStep';
import { ServiceSelectionStep } from './steps/ServiceSelectionStep';
import { EnhancedTherapySelectionStep } from './steps/EnhancedTherapySelectionStep';
import { ReviewStep } from './steps/ReviewStep';
import { 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  Save, 
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Dna,
  Truck,
  Shield,
  Settings,
  PenTool
} from 'lucide-react';

interface EnhancedOnboardingWizardProps {
  onSubmit: (data: TreatmentCenterOnboarding) => void;
  initialData?: Partial<TreatmentCenterOnboarding>;
  applicationId?: string;
}

interface StepGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  steps: {
    key: string;
    label: string;
    component: React.ComponentType<any>;
    required: boolean;
  }[];
}

const stepGroups: StepGroup[] = [
  {
    id: 'basic_info',
    title: 'Company Foundation',
    description: 'Essential company details and business structure',
    icon: Building2,
    color: 'blue',
    steps: [
      { key: 'company_info', label: 'Company Information', component: CompanyInfoStep, required: true },
      { key: 'business_classification', label: 'Business Classification', component: BusinessClassificationStep, required: true },
      { key: 'contacts', label: 'Key Contacts', component: ContactsStep, required: true },
    ]
  },
  {
    id: 'business_structure',
    title: 'Business Structure',
    description: 'Ownership, control, and business relationships',
    icon: Users,
    color: 'green',
    steps: [
      { key: 'ownership', label: 'Ownership & Control', component: OwnershipStep, required: true },
      { key: 'references', label: 'Business References', component: ReferencesStep, required: false },
    ]
  },
  {
    id: 'services_therapies',
    title: 'Services & Therapies',
    description: 'CGAT therapy selection and service provider configuration',
    icon: Dna,
    color: 'purple',
    steps: [
      { key: 'therapy_selection', label: 'CGAT Therapy Selection', component: EnhancedTherapySelectionStep, required: true },
      { key: 'service_selection', label: 'Service Provider Selection', component: ServiceSelectionStep, required: true },
    ]
  },
  {
    id: 'operations',
    title: 'Operations & Assessment',
    description: 'Purchasing preferences and financial evaluation',
    icon: Truck,
    color: 'orange',
    steps: [
      { key: 'purchasing_preferences', label: 'Purchasing Preferences', component: PurchasingPreferencesStep, required: true },
      { key: 'financial_assessment', label: 'Financial Assessment', component: FinancialAssessmentStep, required: true },
    ]
  },
  {
    id: 'financial_legal',
    title: 'Financial & Legal',
    description: 'Banking, licenses, and compliance documentation',
    icon: CreditCard,
    color: 'cyan',
    steps: [
      { key: 'payment_banking', label: 'Payment & Banking', component: PaymentBankingStep, required: true },
      { key: 'licenses', label: 'Licenses & Certifications', component: LicensesStep, required: true },
      { key: 'documents', label: 'Required Documents', component: DocumentsStep, required: true },
    ]
  },
  {
    id: 'finalization',
    title: 'Review & Submit',
    description: 'Final review, signatures, and submission',
    icon: CheckCircle,
    color: 'emerald',
    steps: [
      { key: 'authorizations', label: 'Authorizations & Signatures', component: AuthorizationsStep, required: true },
      { key: 'review', label: 'Review & Submit', component: ReviewStep, required: true },
    ]
  }
];

export const EnhancedOnboardingWizard: React.FC<EnhancedOnboardingWizardProps> = ({
  onSubmit,
  initialData,
  applicationId,
}) => {
  const [activeGroup, setActiveGroup] = useState('basic_info');
  const [activeStep, setActiveStep] = useState('company_info');
  
  const [formData, setFormData] = useState<Partial<TreatmentCenterOnboarding>>(
    initialData || {
      selected_distributors: [],
      company_info: {
        legal_name: '',
        federal_tax_id: '',
        legal_address: { street: '', city: '', state: '', zip: '' },
        same_as_legal_address: false,
      },
      business_info: {
        business_type: [],
        years_in_business: 0,
        ownership_type: 'llc',
      },
      contacts: {
        primary_contact: { name: '', phone: '', email: '' },
      },
      ownership: {
        principal_owners: [],
        bankruptcy_history: false,
      },
      references: {
        primary_bank: { name: '', contact_name: '', phone: '' },
        primary_supplier: { name: '', contact_name: '', phone: '' },
        additional_references: [],
      },
      payment_info: {
        ach_preference: 'direct_debit',
        bank_name: '',
        bank_account_number: '',
        bank_routing_number: '',
        bank_address: { street: '', city: '', state: '', zip: '' },
        statement_delivery_preference: 'email',
      },
      purchasing_preferences: {
        preferred_purchasing_methods: [],
        inventory_management_model: 'traditional_wholesale',
        automated_reordering_enabled: false,
        reorder_points: {},
        inventory_turnover_targets: {},
        storage_capacity_details: {},
        temperature_controlled_storage: false,
        hazmat_storage_capabilities: false,
      },
      financial_assessment: {
        annual_revenue_range: '',
        credit_score_range: '',
        years_in_operation: 0,
        insurance_coverage: {},
        financial_guarantees: {},
      },
      licenses: {
        additional_licenses: [],
      },
      documents: {
        voided_check: false,
        resale_tax_exemption_cert: false,
        dea_registration_copy: false,
        state_pharmacy_license_copy: false,
        medical_license_copy: false,
        financial_statements: false,
        supplier_statements: false,
        additional_documents: [],
      },
      authorizations: {
        authorized_signature: { name: '', title: '', date: '' },
        terms_accepted: false,
      },
      workflow: {
        current_step: 'company_info',
        completed_steps: [],
        notes: [],
      },
    }
  );

  const { createApplication, updateApplication, isCreating } = useTreatmentCenterOnboarding();
  
  // Auto-save functionality
  const { manualSave, isSaving } = useAutoSave({
    data: formData,
    currentStep: 0,
    applicationId,
    enabled: true,
  });

  // Calculate completion status
  const getStepCompletion = (stepKey: string): 'complete' | 'incomplete' | 'partial' => {
    switch (stepKey) {
      case 'company_info':
        return formData.company_info?.legal_name && formData.company_info?.federal_tax_id ? 'complete' : 'incomplete';
      case 'business_classification':
        return formData.business_info?.business_type?.length ? 'complete' : 'incomplete';
      case 'contacts':
        return formData.contacts?.primary_contact?.name && formData.contacts?.primary_contact?.email ? 'complete' : 'incomplete';
      case 'ownership':
        return formData.ownership?.principal_owners?.length ? 'complete' : 'incomplete';
      case 'references':
        return formData.references?.primary_bank?.name ? 'complete' : 'incomplete';
      case 'therapy_selection':
        return 'incomplete';
      case 'service_selection':
        return 'incomplete';
      case 'purchasing_preferences':
        return formData.purchasing_preferences?.preferred_purchasing_methods?.length ? 'complete' : 'incomplete';
      case 'financial_assessment':
        return formData.financial_assessment?.annual_revenue_range ? 'complete' : 'incomplete';
      case 'payment_banking':
        return formData.payment_info?.bank_name && formData.payment_info?.bank_routing_number ? 'complete' : 'incomplete';
      case 'licenses':
        return 'partial';
      case 'documents':
        return formData.documents?.voided_check && formData.documents?.resale_tax_exemption_cert ? 'complete' : 'incomplete';
      case 'authorizations':
        return formData.authorizations?.terms_accepted ? 'complete' : 'incomplete';
      case 'review':
        return 'incomplete';
      default:
        return 'incomplete';
    }
  };

  const getGroupCompletion = (groupId: string): number => {
    const group = stepGroups.find(g => g.id === groupId);
    if (!group) return 0;
    
    const completedSteps = group.steps.filter(step => getStepCompletion(step.key) === 'complete').length;
    return Math.round((completedSteps / group.steps.length) * 100);
  };

  const handleDataChange = (stepData: Partial<TreatmentCenterOnboarding>) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);
  };

  const handleStepClick = (groupId: string, stepKey: string) => {
    setActiveGroup(groupId);
    setActiveStep(stepKey);
  };

  const handleSubmit = () => {
    onSubmit(formData as TreatmentCenterOnboarding);
  };

  const getStepIcon = (stepKey: string) => {
    switch (stepKey) {
      case 'company_info': return Building2;
      case 'business_classification': return Settings;
      case 'contacts': return Users;
      case 'ownership': return Shield;
      case 'references': return FileText;
      case 'therapy_selection': return Dna;
      case 'service_selection': return Truck;
      case 'purchasing_preferences': return Settings;
      case 'financial_assessment': return CreditCard;
      case 'payment_banking': return CreditCard;
      case 'licenses': return Shield;
      case 'documents': return FileText;
      case 'authorizations': return PenTool;
      case 'review': return CheckCircle;
      default: return FileText;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-500 bg-blue-50 text-blue-700',
      green: 'border-green-500 bg-green-50 text-green-700',
      purple: 'border-purple-500 bg-purple-50 text-purple-700',
      orange: 'border-orange-500 bg-orange-50 text-orange-700',
      cyan: 'border-cyan-500 bg-cyan-50 text-cyan-700',
      emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const currentGroup = stepGroups.find(group => group.id === activeGroup);
  const currentStepData = currentGroup?.steps.find(step => step.key === activeStep);
  const StepComponent = currentStepData?.component;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Treatment Center Onboarding</CardTitle>
              <CardDescription>
                Complete all sections to finalize your onboarding process
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={manualSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Progress
                  </>
                )}
              </Button>
              <Badge variant="outline" className="text-sm">
                Auto-save enabled
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabbed Interface */}
      <EnhancedTabs value={activeGroup} onValueChange={setActiveGroup}>
        <EnhancedTabsList className="grid w-full grid-cols-6">
          {stepGroups.map((group) => {
            const IconComponent = group.icon;
            const completion = getGroupCompletion(group.id);
            
            return (
              <EnhancedTabsTrigger
                key={group.id}
                value={group.id}
                className="flex flex-col items-center p-4 h-auto"
                icon={<IconComponent className="h-4 w-4" />}
              >
                <div className="text-center">
                  <div className="font-medium text-sm">{group.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {completion}% complete
                  </div>
                  <Progress value={completion} className="h-1 w-16 mt-1" />
                </div>
              </EnhancedTabsTrigger>
            );
          })}
        </EnhancedTabsList>

        {stepGroups.map((group) => (
          <EnhancedTabsContent key={group.id} value={group.id} className="space-y-6">
            {/* Group Header */}
            <Card className={`border-l-4 ${getColorClasses(group.color)}`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <group.icon className="h-6 w-6" />
                  <div>
                    <CardTitle>{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Steps Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Step Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {group.steps.map((step) => {
                      const completion = getStepCompletion(step.key);
                      const IconComponent = getStepIcon(step.key);
                      
                      return (
                        <button
                          key={step.key}
                          onClick={() => handleStepClick(group.id, step.key)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            activeStep === step.key
                              ? 'bg-primary text-primary-foreground border-primary'
                              : completion === 'complete'
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{step.label}</div>
                              <div className="text-xs opacity-70">
                                {completion === 'complete' ? 'Complete' : step.required ? 'Required' : 'Optional'}
                              </div>
                            </div>
                            {completion === 'complete' && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Step Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>{currentStepData?.label}</CardTitle>
                    <CardDescription>
                      Complete this section of your onboarding application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {StepComponent && (
                      <StepComponent
                        data={formData}
                        onDataChange={handleDataChange}
                        applicationId={applicationId}
                        onEditStep={(stepIndex: number) => {
                          // Handle edit step navigation for review
                          const allSteps = stepGroups.flatMap(g => g.steps);
                          const targetStep = allSteps[stepIndex];
                          if (targetStep) {
                            const targetGroup = stepGroups.find(g => 
                              g.steps.some(s => s.key === targetStep.key)
                            );
                            if (targetGroup) {
                              handleStepClick(targetGroup.id, targetStep.key);
                            }
                          }
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </EnhancedTabsContent>
        ))}
      </EnhancedTabs>

      {/* Final Submit Section */}
      {activeGroup === 'finalization' && activeStep === 'review' && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Ready to Submit</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Your application is complete and ready for submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Submit Onboarding Application
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
