
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import { ReviewStep } from './steps/ReviewStep';
import { Save, Clock, CheckCircle2, AlertCircle, Users, Share, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    completionWeight: 25,
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
    completionWeight: 25,
    steps: [
      { key: 'ownership', label: 'Ownership & Control', component: OwnershipStep, required: true },
      { key: 'references', label: 'Business References', component: ReferencesStep, required: false },
    ]
  },
  {
    id: 'financial_legal',
    label: 'Financial & Legal',
    description: 'Banking, licenses, and documentation',
    completionWeight: 30,
    steps: [
      { key: 'payment_banking', label: 'Payment & Banking', component: PaymentBankingStep, required: true },
      { key: 'licenses', label: 'Licenses & Certifications', component: LicensesStep, required: true },
      { key: 'documents', label: 'Required Documents', component: DocumentsStep, required: true },
    ]
  },
  {
    id: 'finalization',
    label: 'Finalization',
    description: 'Review, signatures, and submission',
    completionWeight: 20,
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

  // Calculate completion status for each tab and step
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

  const getTabCompletion = (tabId: string): number => {
    const tab = tabGroups.find(t => t.id === tabId);
    if (!tab) return 0;
    
    const completedSteps = tab.steps.filter(step => getStepCompletion(step.key) === 'complete').length;
    return Math.round((completedSteps / tab.steps.length) * 100);
  };

  const getOverallProgress = (): number => {
    let totalWeight = 0;
    let completedWeight = 0;
    
    tabGroups.forEach(tab => {
      totalWeight += tab.completionWeight;
      const tabProgress = getTabCompletion(tab.id);
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
        description: "Share this link with collaborators to allow them to help complete the application.",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not copy share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentTabGroup = tabGroups.find(tab => tab.id === activeTab);
  const currentStepInfo = currentTabGroup?.steps.find(step => step.key === activeStep);
  const StepComponent = currentStepInfo?.component;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
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
              <CardDescription className="mt-2">
                Complete your partnership application with healthcare distributors
              </CardDescription>
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
          
          {/* Overall Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{getOverallProgress()}% Complete</span>
            </div>
            <Progress value={getOverallProgress()} className="w-full h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Tab Groups Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tabGroups.map((tab) => {
          const completion = getTabCompletion(tab.id);
          const isActive = activeTab === tab.id;
          
          return (
            <Card 
              key={tab.id} 
              className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{tab.label}</h3>
                  <Badge variant={completion === 100 ? "default" : completion > 50 ? "secondary" : "outline"}>
                    {completion}%
                  </Badge>
                </div>
                <Progress value={completion} className="w-full h-1 mb-2" />
                <p className="text-xs text-muted-foreground">{tab.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {tabGroups.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabGroups.map((tabGroup) => (
          <TabsContent key={tabGroup.id} value={tabGroup.id} className="space-y-6">
            {/* Step Navigation within Tab */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{tabGroup.label}</span>
                  <Badge variant="outline">
                    {getTabCompletion(tabGroup.id)}% Complete
                  </Badge>
                </CardTitle>
                <CardDescription>{tabGroup.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tabGroup.steps.map((step) => {
                    const completion = getStepCompletion(step.key);
                    const isActive = activeStep === step.key;
                    
                    return (
                      <Button
                        key={step.key}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveStep(step.key)}
                        className={`text-xs ${
                          completion === 'complete' ? 'border-green-500' : 
                          completion === 'needs_review' ? 'border-yellow-500' : 
                          'border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {completion === 'complete' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : completion === 'needs_review' ? (
                            <AlertCircle className="h-3 w-3 text-yellow-600" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border-2 border-gray-400" />
                          )}
                          <span>{step.label}</span>
                          {step.required && <span className="text-red-500">*</span>}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

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
                        Step {tabGroup.steps.findIndex(s => s.key === activeStep) + 1} of {tabGroup.steps.length} in {tabGroup.label}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStepCompletion(activeStep) === 'complete' && (
                        <Badge variant="default" className="flex items-center space-x-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Complete</span>
                        </Badge>
                      )}
                      {getStepCompletion(activeStep) === 'needs_review' && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Needs Review</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <StepComponent
                    data={formData}
                    onDataChange={handleStepData}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

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
