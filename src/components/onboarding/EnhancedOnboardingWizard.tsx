
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
import { CreditApplicationStep } from './steps/CreditApplicationStep';
import { OfficeHoursStep } from './steps/OfficeHoursStep';
import { OnlineServicesStep } from './steps/OnlineServicesStep';
import { GPOMembershipStep } from './steps/GPOMembershipStep';
import { SpecialProgramsStep } from './steps/SpecialProgramsStep';
import { OnlinePlatformUsersStep } from './steps/OnlinePlatformUsersStep';
import { EnhancedPaymentTermsStep } from './steps/EnhancedPaymentTermsStep';
import { ReviewStep } from './steps/ReviewStep';
import { 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  Save, 
  Clock,
  Sparkles,
  Dna,
  Truck,
  Shield,
  Settings,
  PenTool,
  Calendar,
  Globe,
  UserPlus,
  Database,
  Package
} from 'lucide-react';

interface EnhancedOnboardingWizardProps {
  onSubmit: (data: TreatmentCenterOnboarding) => void;
  initialData?: Partial<TreatmentCenterOnboarding>;
  applicationId?: string;
}

const ONBOARDING_TABS = [
  {
    id: 'company_info',
    title: 'Company Info',
    description: 'Basic company information and details',
    icon: Building2,
    component: CompanyInfoStep,
    required: true,
  },
  {
    id: 'business_classification',
    title: 'Business Classification',
    description: 'Business type and classification details',
    icon: Settings,
    component: BusinessClassificationStep,
    required: true,
  },
  {
    id: 'contacts',
    title: 'Contacts',
    description: 'Primary and additional contact information',
    icon: Users,
    component: ContactsStep,
    required: true,
  },
  {
    id: 'ownership',
    title: 'Ownership',
    description: 'Ownership structure and principal owners',
    icon: Shield,
    component: OwnershipStep,
    required: true,
  },
  {
    id: 'references',
    title: 'References',
    description: 'Business and trade references',
    icon: FileText,
    component: ReferencesStep,
    required: true,
  },
  {
    id: 'therapy_selection',
    title: 'Therapy Selection',
    description: 'CGAT therapy selection and configuration',
    icon: Dna,
    component: EnhancedTherapySelectionStep,
    required: true,
  },
  {
    id: 'service_selection',
    title: 'Service Selection',
    description: 'Service provider selection and configuration',
    icon: Truck,
    component: ServiceSelectionStep,
    required: true,
  },
  {
    id: 'purchasing_preferences',
    title: 'Purchasing',
    description: 'Purchasing preferences and inventory management',
    icon: Package,
    component: PurchasingPreferencesStep,
    required: true,
  },
  {
    id: 'financial_assessment',
    title: 'Financial Assessment',
    description: 'Financial evaluation and risk assessment',
    icon: CreditCard,
    component: FinancialAssessmentStep,
    required: true,
  },
  {
    id: 'credit_application',
    title: 'Credit Application',
    description: 'Credit terms and application details',
    icon: CreditCard,
    component: CreditApplicationStep,
    required: true,
  },
  {
    id: 'payment_banking',
    title: 'Payment & Banking',
    description: 'Payment methods and banking information',
    icon: CreditCard,
    component: PaymentBankingStep,
    required: true,
  },
  {
    id: 'enhanced_payment_terms',
    title: 'Payment Terms',
    description: 'Enhanced payment terms and conditions',
    icon: CreditCard,
    component: EnhancedPaymentTermsStep,
    required: true,
  },
  {
    id: 'office_hours',
    title: 'Office Hours',
    description: 'Operating hours and schedule information',
    icon: Calendar,
    component: OfficeHoursStep,
    required: true,
  },
  {
    id: 'online_services',
    title: 'Online Services',
    description: 'Online platform services and features',
    icon: Globe,
    component: OnlineServicesStep,
    required: true,
  },
  {
    id: 'platform_users',
    title: 'Platform Users',
    description: 'Online platform user management',
    icon: UserPlus,
    component: OnlinePlatformUsersStep,
    required: true,
  },
  {
    id: 'gpo_memberships',
    title: 'GPO Memberships',
    description: 'Group purchasing organization memberships',
    icon: Users,
    component: GPOMembershipStep,
    required: false,
  },
  {
    id: 'special_programs',
    title: 'Special Programs',
    description: '340B and other special program participation',
    icon: Database,
    component: SpecialProgramsStep,
    required: false,
  },
  {
    id: 'licenses',
    title: 'Licenses',
    description: 'Required licenses and certifications',
    icon: Shield,
    component: LicensesStep,
    required: true,
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Required document uploads and storage',
    icon: FileText,
    component: DocumentsStep,
    required: true,
  },
  {
    id: 'authorizations',
    title: 'Signatures',
    description: 'Authorizations and digital signatures',
    icon: PenTool,
    component: AuthorizationsStep,
    required: true,
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Final review and application submission',
    icon: CheckCircle,
    component: ReviewStep,
    required: true,
  },
];

export const EnhancedOnboardingWizard: React.FC<EnhancedOnboardingWizardProps> = ({
  onSubmit,
  initialData,
  applicationId,
}) => {
  const [activeTab, setActiveTab] = useState('company_info');
  
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
      credit_application: {
        requested_credit_limit: '',
        trade_references: [],
        bank_references: [],
        credit_terms_requested: 'net_30',
        personal_guarantee_required: false,
        collateral_offered: false,
        financial_statements_provided: false,
      },
      office_hours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: true },
        sunday: { open: '09:00', close: '17:00', closed: true },
        timezone: 'America/New_York',
        emergency_contact: {
          available_24_7: false,
          phone: '',
          email: '',
          instructions: '',
        },
        special_hours: {
          holidays_closed: true,
          holiday_schedule: '',
          seasonal_adjustments: '',
        },
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
      selected_online_services: [],
      selected_user_roles: [],
      gpo_memberships: [],
      platform_users: [],
      program_340b: [],
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
  const getTabCompletion = (tabId: string): 'complete' | 'incomplete' | 'partial' => {
    switch (tabId) {
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
      case 'credit_application':
        return formData.credit_application?.requested_credit_limit ? 'complete' : 'incomplete';
      case 'payment_banking':
        return formData.payment_info?.bank_name && formData.payment_info?.bank_routing_number ? 'complete' : 'incomplete';
      case 'enhanced_payment_terms':
        return 'partial';
      case 'office_hours':
        return formData.office_hours?.timezone ? 'complete' : 'incomplete';
      case 'online_services':
        return formData.selected_online_services?.length ? 'complete' : 'incomplete';
      case 'platform_users':
        return formData.platform_users?.length ? 'complete' : 'incomplete';
      case 'gpo_memberships':
        return 'partial';
      case 'special_programs':
        return 'partial';
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

  const handleDataChange = (stepData: Partial<TreatmentCenterOnboarding>) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);
  };

  const handleSubmit = () => {
    onSubmit(formData as TreatmentCenterOnboarding);
  };

  const completedTabs = ONBOARDING_TABS.filter(tab => getTabCompletion(tab.id) === 'complete').length;
  const totalTabs = ONBOARDING_TABS.length;
  const progressPercentage = Math.round((completedTabs / totalTabs) * 100);

  const currentTab = ONBOARDING_TABS.find(tab => tab.id === activeTab);
  const StepComponent = currentTab?.component;

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
                {progressPercentage}% Complete
              </Badge>
            </div>
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Main Tabbed Interface - No Sidebar */}
      <EnhancedTabs value={activeTab} onValueChange={setActiveTab}>
        <EnhancedTabsList className="grid w-full grid-cols-4 lg:grid-cols-7 xl:grid-cols-11 gap-1 h-auto p-2">
          {ONBOARDING_TABS.map((tab) => {
            const IconComponent = tab.icon;
            const completion = getTabCompletion(tab.id);
            
            return (
              <EnhancedTabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center p-2 h-auto min-h-[80px] text-xs"
              >
                <IconComponent className="h-4 w-4 mb-1" />
                <div className="text-center">
                  <div className="font-medium">{tab.title}</div>
                  {completion === 'complete' && (
                    <CheckCircle className="h-3 w-3 text-green-600 mx-auto mt-1" />
                  )}
                  {tab.required && completion !== 'complete' && (
                    <div className="text-xs text-red-600 mt-1">*</div>
                  )}
                </div>
              </EnhancedTabsTrigger>
            );
          })}
        </EnhancedTabsList>

        {ONBOARDING_TABS.map((tab) => (
          <EnhancedTabsContent key={tab.id} value={tab.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <tab.icon className="h-6 w-6" />
                  <div>
                    <CardTitle>{tab.title}</CardTitle>
                    <CardDescription>{tab.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {StepComponent && tab.id === activeTab && (
                  <StepComponent
                    data={formData}
                    onDataChange={handleDataChange}
                    applicationId={applicationId}
                    onEditStep={(stepIndex: number) => {
                      // Handle edit step navigation for review
                      const targetTab = ONBOARDING_TABS[stepIndex];
                      if (targetTab) {
                        setActiveTab(targetTab.id);
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </EnhancedTabsContent>
        ))}
      </EnhancedTabs>

      {/* Final Submit Section */}
      {activeTab === 'review' && (
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
