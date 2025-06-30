import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Truck
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
        // This will be determined by the therapy selection component
        return 'incomplete';
      case 'service_selection':
        // This will be determined by the service selection component
        return 'incomplete';
      case 'purchasing_preferences':
        return formData.purchasing_preferences?.preferred_purchasing_methods?.length ? 'complete' : 'incomplete';
      case 'financial_assessment':
        return formData.financial_assessment?.annual_revenue_range ? 'complete' : 'incomplete';
      case 'payment_banking':
        return formData.payment_info?.bank_name && formData.payment_info?.bank_routing_number ? 'complete' : 'incomplete';
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

  const getGroupProgress = (groupId: string): number => {
    const group = stepGroups.find(g => g.id === groupId);
    if (!group) return 0;
    
    const completedSteps = group.steps.filter(step => getStepCompletion(step.key) === 'complete').length;
    return Math.round((completedSteps / group.steps.length) * 100);
  };

  const getOverallProgress = (): number => {
    const totalSteps = stepGroups.reduce((acc, group) => acc + group.steps.length, 0);
    const completedSteps = stepGroups.reduce((acc, group) => {
      return acc + group.steps.filter(step => getStepCompletion(step.key) === 'complete').length;
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

  const goToNextStep = () => {
    const currentGroup = stepGroups.find(g => g.id === activeGroup);
    if (!currentGroup) return;

    const currentStepIndex = currentGroup.steps.findIndex(s => s.key === activeStep);
    
    if (currentStepIndex < currentGroup.steps.length - 1) {
      // Move to next step in current group
      setActiveStep(currentGroup.steps[currentStepIndex + 1].key);
    } else {
      // Move to first step of next group
      const currentGroupIndex = stepGroups.findIndex(g => g.id === activeGroup);
      if (currentGroupIndex < stepGroups.length - 1) {
        const nextGroup = stepGroups[currentGroupIndex + 1];
        setActiveGroup(nextGroup.id);
        setActiveStep(nextGroup.steps[0].key);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentGroup = stepGroups.find(g => g.id === activeGroup);
    if (!currentGroup) return;

    const currentStepIndex = currentGroup.steps.findIndex(s => s.key === activeStep);
    
    if (currentStepIndex > 0) {
      // Move to previous step in current group
      setActiveStep(currentGroup.steps[currentStepIndex - 1].key);
    } else {
      // Move to last step of previous group
      const currentGroupIndex = stepGroups.findIndex(g => g.id === activeGroup);
      if (currentGroupIndex > 0) {
        const prevGroup = stepGroups[currentGroupIndex - 1];
        setActiveGroup(prevGroup.id);
        setActiveStep(prevGroup.steps[prevGroup.steps.length - 1].key);
      }
    }
  };

  const currentGroup = stepGroups.find(g => g.id === activeGroup);
  const currentStepInfo = currentGroup?.steps.find(s => s.key === activeStep);
  const StepComponent = currentStepInfo?.component;

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

      {/* Tab Navigation */}
      <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-gray-50">
          {stepGroups.map((group) => {
            const IconComponent = group.icon;
            const progress = getGroupProgress(group.id);
            
            return (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className={`flex flex-col items-center p-4 space-y-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50 ${
                  progress === 100 ? 'text-green-700' : progress > 0 ? 'text-blue-700' : 'text-gray-600'
                }`}
              >
                <IconComponent className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{group.title}</div>
                  <div className="text-xs text-muted-foreground">{progress}% done</div>
                </div>
                {progress === 100 && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {stepGroups.map((group) => (
          <TabsContent key={group.id} value={group.id} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Step Navigation Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader className={`bg-gradient-to-r from-${group.color}-50 to-${group.color}-100 rounded-t-lg`}>
                    <CardTitle className="flex items-center space-x-2">
                      <group.icon className={`h-5 w-5 text-${group.color}-700`} />
                      <span className={`text-${group.color}-900`}>{group.title}</span>
                    </CardTitle>
                    <CardDescription className={`text-${group.color}-700`}>
                      {group.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {group.steps.map((step, index) => {
                        const completion = getStepCompletion(step.key);
                        const isActive = activeStep === step.key;
                        
                        return (
                          <button
                            key={step.key}
                            onClick={() => setActiveStep(step.key)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                              isActive
                                ? `bg-${group.color}-100 border-2 border-${group.color}-300`
                                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  completion === 'complete'
                                    ? 'bg-green-100 text-green-700'
                                    : completion === 'partial'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : isActive
                                    ? `bg-${group.color}-100 text-${group.color}-700`
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {completion === 'complete' ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{step.label}</div>
                                  {step.required && (
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {completion === 'complete' && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                <Card className="min-h-[600px]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{currentStepInfo?.label}</span>
                          {currentStepInfo?.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Step {(currentGroup?.steps.findIndex(s => s.key === activeStep) || 0) + 1} of {currentGroup?.steps.length} in {currentGroup?.title}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {getStepCompletion(activeStep) === 'complete' ? 'Complete' : 'In Progress'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-8">
                    {StepComponent && (
                      <StepComponent
                        data={formData}
                        onDataChange={handleStepData}
                        applicationId={applicationId}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={activeGroup === 'basic_info' && activeStep === 'company_info'}
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
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
