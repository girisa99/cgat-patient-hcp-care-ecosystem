
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useTreatmentCenterOnboarding } from '@/hooks/useTreatmentCenterOnboarding';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AnimatedJourney } from './AnimatedJourney';
import { CompanyInfoStep } from './steps/CompanyInfoStep';
import { BusinessClassificationStep } from './steps/BusinessClassificationStep';
import { ContactsStep } from './steps/ContactsStep';
import { OwnershipStep } from './steps/OwnershipStep';
import { ReferencesStep } from './steps/ReferencesStep';
import { PaymentBankingStep } from './steps/PaymentBankingStep';
import { LicensesStep } from './steps/LicensesStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { AuthorizationsStep } from './steps/AuthorizationsStep';
import { ReviewStep } from './steps/ReviewStep';
import { Save, Clock, Users, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OnlinePlatformUsersStep } from './steps/OnlinePlatformUsersStep';
import { SpecialProgramsStep } from './steps/SpecialProgramsStep';
import { EnhancedPaymentTermsStep } from './steps/EnhancedPaymentTermsStep';
import { ServiceSelectionStep } from './steps/ServiceSelectionStep';

interface TabbedOnboardingWizardProps {
  onSubmit: (data: TreatmentCenterOnboarding) => void;
  initialData?: Partial<TreatmentCenterOnboarding>;
  applicationId?: string;
}

interface TabGroup {
  id: string;
  label: string;
  description: string;
  steps: {
    key: string;
    label: string;
    component: React.ComponentType<any>;
    required: boolean;
  }[];
  completionWeight: number;
}

const tabGroups: TabGroup[] = [
  {
    id: 'basic_info',
    label: 'Basic Information',
    description: 'Company details and business classification',
    completionWeight: 20,
    steps: [
      { key: 'company_info', label: 'Company Information', component: CompanyInfoStep, required: true },
      { key: 'business_classification', label: 'Business Classification', component: BusinessClassificationStep, required: true },
      { key: 'contacts', label: 'Key Contacts', component: ContactsStep, required: true },
    ]
  },
  {
    id: 'business_details',
    label: 'Business Details',
    description: 'Ownership structure and business references',
    completionWeight: 15,
    steps: [
      { key: 'ownership', label: 'Ownership & Control', component: OwnershipStep, required: true },
      { key: 'references', label: 'Business References', component: ReferencesStep, required: false },
    ]
  },
  {
    id: 'service_selection',
    label: 'Service Selection',
    description: 'Choose services and providers for CGAT therapies',
    completionWeight: 20,
    steps: [
      { key: 'service_selection', label: 'Service & Provider Selection', component: ServiceSelectionStep, required: true },
    ]
  },
  {
    id: 'platform_users',
    label: 'Platform Users',
    description: 'Online platform user accounts and permissions',
    completionWeight: 10,
    steps: [
      { key: 'online_platform_users', label: 'Online Platform Users', component: OnlinePlatformUsersStep, required: true },
    ]
  },
  {
    id: 'special_programs',
    label: 'Special Programs',
    description: '340B programs and GPO memberships',
    completionWeight: 10,
    steps: [
      { key: 'special_programs', label: '340B & GPO Programs', component: SpecialProgramsStep, required: false },
    ]
  },
  {
    id: 'financial_legal',
    label: 'Financial & Legal',
    description: 'Banking, licenses, and documentation',
    completionWeight: 15,
    steps: [
      { key: 'enhanced_payment_terms', label: 'Payment Terms & Billing', component: EnhancedPaymentTermsStep, required: true },
      { key: 'payment_banking', label: 'Banking Information', component: PaymentBankingStep, required: true },
      { key: 'licenses', label: 'Licenses & Certifications', component: LicensesStep, required: true },
      { key: 'documents', label: 'Required Documents', component: DocumentsStep, required: true },
    ]
  },
  {
    id: 'finalization',
    label: 'Finalization',
    description: 'Review, signatures, and submission',
    completionWeight: 10,
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
  const [activeTab, setActiveTab] = useState('basic_info');
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

  const { createApplication, isCreating } = useTreatmentCenterOnboarding();
  const { toast } = useToast();
  
  // Auto-save functionality
  const { manualSave, isSaving } = useAutoSave({
    data: formData,
    currentStep: 0,
    applicationId,
    enabled: true,
  });

  // Enhanced completion status calculation
  const getStepCompletion = (stepKey: string): 'complete' | 'incomplete' | 'needs_review' => {
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
      case 'service_selection':
        // This will be checked via the ServiceSelectionStep component
        return 'incomplete';
      case 'online_platform_users':
        const platformUsers = (formData as any)?.platform_users || [];
        return platformUsers.length > 0 ? 'complete' : 'incomplete';
      case 'special_programs':
        const is340b = (formData as any)?.is_340b_entity;
        const gpoMemberships = (formData as any)?.gpo_memberships_detailed || [];
        return is340b || gpoMemberships.length > 0 ? 'complete' : 'incomplete';
      case 'enhanced_payment_terms':
        const paymentTerms = (formData as any)?.enhanced_payment_terms;
        return paymentTerms?.preferred_terms && paymentTerms?.payment_method ? 'complete' : 'incomplete';
      case 'payment_banking':
        return formData.payment_info?.bank_name && formData.payment_info?.bank_routing_number ? 'complete' : 'incomplete';
      case 'licenses':
        return formData.licenses?.dea_number || formData.licenses?.medical_license ? 'complete' : 'incomplete';
      case 'documents':
        const requiredDocs = ['voided_check', 'resale_tax_exemption_cert', 'financial_statements'];
        const uploadedCount = requiredDocs.filter(doc => formData.documents?.[doc as keyof typeof formData.documents]).length;
        return uploadedCount >= 2 ? 'complete' : uploadedCount > 0 ? 'needs_review' : 'incomplete';
      case 'authorizations':
        return formData.authorizations?.terms_accepted && formData.authorizations?.authorized_signature?.name ? 'complete' : 'incomplete';
      case 'review':
        return 'incomplete'; // Always incomplete until final submission
      default:
        return 'incomplete';
    }
  };

  const getOverallProgress = (): number => {
    let totalWeight = 0;
    let completedWeight = 0;
    
    tabGroups.forEach(tab => {
      totalWeight += tab.completionWeight;
      const completedSteps = tab.steps.filter(step => getStepCompletion(step.key) === 'complete').length;
      const tabProgress = Math.round((completedSteps / tab.steps.length) * 100);
      completedWeight += (tabProgress / 100) * tab.completionWeight;
    });
    
    return Math.round(completedWeight);
  };

  const handleStepData = (stepData: any) => {
    setFormData(prevData => ({
      ...prevData,
      ...stepData,
    }));
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/onboarding/collaborate/${applicationId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Share Link Copied",
        description: "Share this link with collaborators to help complete the application.",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not copy share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveTab(sectionId);
    // Set the first step of the section as active
    const section = tabGroups.find(tab => tab.id === sectionId);
    if (section) {
      setActiveStep(section.steps[0].key);
    }
  };

  const handleStepChange = (stepKey: string) => {
    setActiveStep(stepKey);
    // Find which section this step belongs to and make it active
    const section = tabGroups.find(tab => tab.steps.some(step => step.key === stepKey));
    if (section) {
      setActiveTab(section.id);
    }
  };

  const currentTabGroup = tabGroups.find(tab => tab.id === activeTab);
  const currentStepInfo = currentTabGroup?.steps.find(step => step.key === activeStep);
  const StepComponent = currentStepInfo?.component;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Action Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center space-x-2">
                <span>Treatment Center Onboarding</span>
                {applicationId && (
                  <Badge variant="outline" className="ml-2">
                    Application #{applicationId.slice(0, 8)}
                  </Badge>
                )}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              {isSaving && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={manualSave}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Animated Journey */}
      <AnimatedJourney
        sections={tabGroups}
        activeSection={activeTab}
        activeStep={activeStep}
        getStepCompletion={getStepCompletion}
        onSectionChange={handleSectionChange}
        onStepChange={handleStepChange}
        overallProgress={getOverallProgress()}
      />

      {/* Current Step Content */}
      {StepComponent && (
        <Card>
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
                  Step {currentTabGroup?.steps.findIndex(s => s.key === activeStep)! + 1} of {currentTabGroup?.steps.length} in {currentTabGroup?.label}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StepComponent
              data={formData}
              onDataChange={handleStepData}
              applicationId={applicationId}
            />
          </CardContent>
        </Card>
      )}

      {/* Collaboration Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Collaborative Application</h4>
              <p className="text-sm text-blue-700">
                You can share this application with colleagues to help complete sections. 
                All changes are automatically saved and synced in real-time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
