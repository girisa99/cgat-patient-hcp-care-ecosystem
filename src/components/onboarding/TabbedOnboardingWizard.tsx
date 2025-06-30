
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { CreditApplicationStep } from './steps/CreditApplicationStep';
import { GPOMembershipStep } from './steps/GPOMembershipStep';
import { OfficeHoursStep } from './steps/OfficeHoursStep';
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
  DollarSign,
  Calendar,
  Shield
} from 'lucide-react';

interface TabbedOnboardingWizardProps {
  onSubmit: (data: TreatmentCenterOnboarding) => void;
  initialData?: Partial<TreatmentCenterOnboarding>;
  applicationId?: string;
}

interface TabSection {
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

const tabSections: TabSection[] = [
  {
    id: 'company_foundation',
    title: 'Company Foundation',
    description: 'Essential company details and business structure',
    icon: Building2,
    color: 'blue',
    steps: [
      { key: 'company_info', label: 'Company Information', component: CompanyInfoStep, required: true },
      { key: 'business_classification', label: 'Business Classification', component: BusinessClassificationStep, required: true },
      { key: 'contacts', label: 'Key Contacts', component: ContactsStep, required: true },
      { key: 'office_hours', label: 'Office Hours', component: OfficeHoursStep, required: false },
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
      { key: 'gpo_membership', label: 'GPO Memberships', component: GPOMembershipStep, required: false },
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
    id: 'financial_credit',
    title: 'Financial & Credit',
    description: 'Banking, credit applications, and payment terms',
    icon: CreditCard,
    color: 'cyan',
    steps: [
      { key: 'payment_banking', label: 'Payment & Banking', component: PaymentBankingStep, required: true },
      { key: 'credit_application', label: 'Credit Application', component: CreditApplicationStep, required: false },
    ]
  },
  {
    id: 'compliance_docs',
    title: 'Compliance & Documentation',
    description: 'Licenses, certifications, and required documents',
    icon: Shield,
    color: 'indigo',
    steps: [
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

export const TabbedOnboardingWizard: React.FC<TabbedOnboardingWizardProps> = ({
  onSubmit,
  initialData,
  applicationId,
}) => {
  const [activeTab, setActiveTab] = useState('company_foundation');
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
      credit_application: {
        requested_credit_limit: '',
        trade_references: [],
        bank_references: [],
        credit_terms_requested: 'net_30',
        personal_guarantee_required: false,
        collateral_offered: false,
        financial_statements_provided: false
      },
      gpo_memberships: [],
      office_hours: {
        monday: { open: '', close: '', closed: false },
        tuesday: { open: '', close: '', closed: false },
        wednesday: { open: '', close: '', closed: false },
        thursday: { open: '', close: '', closed: false },
        friday: { open: '', close: '', closed: false },
        saturday: { open: '', close: '', closed: true },
        sunday: { open: '', close: '', closed: true },
        timezone: '',
        emergency_contact: {
          available_24_7: false,
          phone: '',
          email: '',
          instructions: ''
        },
        special_hours: {
          holidays_closed: true,
          holiday_schedule: '',
          seasonal_adjustments: ''
        }
      }
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
      case 'credit_application':
        return formData.credit_application?.requested_credit_limit ? 'complete' : 'incomplete';
      case 'gpo_membership':
        return formData.gpo_memberships?.length ? 'complete' : 'incomplete';
      case 'office_hours':
        return formData.office_hours?.timezone ? 'complete' : 'incomplete';
      case 'licenses':
        return formData.licenses?.dea_number || formData.licenses?.medical_license ? 'complete' : 'incomplete';
      case 'documents':
        const requiredDocs = ['voided_check', 'resale_tax_exemption_cert', 'financial_statements'];
        const uploadedCount = requiredDocs.filter(doc => formData.documents?.[doc as keyof typeof formData.documents]).length;
        return uploadedCount >= 2 ? 'complete' : uploadedCount > 0 ? 'partial' : 'incomplete';
      case 'authorizations':
        return formData.authorizations?.terms_accepted && formData.authorizations?.authorized_signature?.name ? 'complete' : 'incomplete';
      case 'review':
        return 'incomplete';
      default:
        return 'incomplete';
    }
  };

  const getTabProgress = (tabId: string): number => {
    const tab = tabSections.find(t => t.id === tabId);
    if (!tab) return 0;
    
    const completedSteps = tab.steps.filter(step => getStepCompletion(step.key) === 'complete').length;
    return Math.round((completedSteps / tab.steps.length) * 100);
  };

  const getOverallProgress = (): number => {
    const totalSteps = tabSections.reduce((acc, tab) => acc + tab.steps.length, 0);
    const completedSteps = tabSections.reduce((acc, tab) => {
      return acc + tab.steps.filter(step => getStepCompletion(step.key) === 'complete').length;
    }, 0);
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const handleStepData = (stepData: any) => {
    setFormData(prevData => ({
      ...prevData,
      ...stepData,
    }));
  };

  const handleSubmit = async () => {
    try {
      const finalData: TreatmentCenterOnboarding = {
        id: applicationId || '',
        status: 'submitted',
        created_at: '',
        updated_at: '',
        ...formData,
      } as TreatmentCenterOnboarding;

      let resultApplication;
      if (applicationId) {
        resultApplication = await updateApplication({
          id: applicationId,
          updates: {
            ...finalData,
            status: 'submitted',
          }
        });
      } else {
        resultApplication = await createApplication(finalData);
      }
      
      onSubmit(finalData);
    } catch (error) {
      console.error('Error submitting onboarding application:', error);
    }
  };

  const getCurrentTabSteps = () => {
    return tabSections.find(tab => tab.id === activeTab)?.steps || [];
  };

  const getCurrentStepIndex = () => {
    const steps = getCurrentTabSteps();
    return steps.findIndex(step => step.key === activeStep);
  };

  const goToNextStep = () => {
    const currentSteps = getCurrentTabSteps();
    const currentIndex = getCurrentStepIndex();
    
    if (currentIndex < currentSteps.length - 1) {
      // Move to next step in current tab
      setActiveStep(currentSteps[currentIndex + 1].key);
    } else {
      // Move to first step of next tab
      const currentTabIndex = tabSections.findIndex(tab => tab.id === activeTab);
      if (currentTabIndex < tabSections.length - 1) {
        const nextTab = tabSections[currentTabIndex + 1];
        setActiveTab(nextTab.id);
        setActiveStep(nextTab.steps[0].key);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentSteps = getCurrentTabSteps();
    const currentIndex = getCurrentStepIndex();
    
    if (currentIndex > 0) {
      // Move to previous step in current tab
      setActiveStep(currentSteps[currentIndex - 1].key);
    } else {
      // Move to last step of previous tab
      const currentTabIndex = tabSections.findIndex(tab => tab.id === activeTab);
      if (currentTabIndex > 0) {
        const prevTab = tabSections[currentTabIndex - 1];
        setActiveTab(prevTab.id);
        setActiveStep(prevTab.steps[prevTab.steps.length - 1].key);
      }
    }
  };

  // Helper function to render step component with proper props
  const renderStepComponent = (step: any) => {
    const StepComponent = step.component;
    
    // Create base props that all components should receive
    const baseProps = {
      data: formData,
      onDataChange: handleStepData,
    };

    // Add applicationId if the component needs it
    const propsWithApplicationId = {
      ...baseProps,
      applicationId,
    };

    // Return the component with appropriate props
    return <StepComponent {...propsWithApplicationId} />;
  };

  const currentTabInfo = tabSections.find(tab => tab.id === activeTab);
  const overallProgress = getOverallProgress();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-blue-900">
                Treatment Center Onboarding
              </CardTitle>
              <CardDescription className="text-blue-700 text-lg">
                Complete your registration to join our healthcare network
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              {isSaving && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Auto-saving...</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={manualSave}
                disabled={isSaving}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-700 mb-2">
              <span>Overall Progress</span>
              <span className="font-semibold">{overallProgress}% Complete</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <EnhancedTabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <EnhancedTabsList className="grid grid-cols-7 h-auto p-1 bg-gray-50">
          {tabSections.map((tab) => {
            const IconComponent = tab.icon;
            const progress = getTabProgress(tab.id);
            
            return (
              <EnhancedTabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex flex-col items-center p-4 space-y-2 ${
                  progress === 100 ? 'text-green-700' : progress > 0 ? 'text-blue-700' : 'text-gray-600'
                }`}
                icon={<IconComponent className="h-5 w-5" />}
              >
                <div className="text-center">
                  <div className="font-medium text-xs">{tab.title}</div>
                  <div className="text-xs text-muted-foreground">{progress}%</div>
                </div>
                {progress === 100 && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
              </EnhancedTabsTrigger>
            );
          })}
        </EnhancedTabsList>

        {tabSections.map((tab) => (
          <EnhancedTabsContent key={tab.id} value={tab.id}>
            <Card>
              <CardHeader className={`bg-gradient-to-r from-${tab.color}-50 to-${tab.color}-100 rounded-t-lg`}>
                <CardTitle className="flex items-center space-x-2">
                  <tab.icon className={`h-5 w-5 text-${tab.color}-700`} />
                  <span className={`text-${tab.color}-900`}>{tab.title}</span>
                </CardTitle>
                <CardDescription className={`text-${tab.color}-700`}>
                  {tab.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Sub-tabs for each section */}
                <Tabs value={activeStep} onValueChange={setActiveStep}>
                  <TabsList className="grid w-full auto-cols-fr grid-flow-col mb-6">
                    {tab.steps.map((step, index) => {
                      const completion = getStepCompletion(step.key);
                      
                      return (
                        <TabsTrigger
                          key={step.key}
                          value={step.key}
                          className="flex items-center space-x-2 px-4 py-2"
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            completion === 'complete'
                              ? 'bg-green-100 text-green-700'
                              : completion === 'partial'
                              ? 'bg-yellow-100 text-yellow-700'
                              : `bg-${tab.color}-100 text-${tab.color}-700`
                          }`}>
                            {completion === 'complete' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{step.label}</div>
                            {step.required && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Required
                              </Badge>
                            )}
                          </div>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {tab.steps.map((step) => (
                    <TabsContent key={step.key} value={step.key} className="mt-6">
                      <div className="min-h-[500px]">
                        {renderStepComponent(step)}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={activeTab === 'company_foundation' && activeStep === 'company_info'}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex space-x-4">
                {activeStep === 'review' ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isCreating}
                    className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                    size="lg"
                  >
                    {isCreating ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={goToNextStep}
                    className="flex items-center space-x-2"
                    size="lg"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </EnhancedTabsContent>
        ))}
      </EnhancedTabs>
    </div>
  );
};
