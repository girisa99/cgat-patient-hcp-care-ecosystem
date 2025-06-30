import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TreatmentCenterOnboardingWizard } from '@/components/onboarding/TreatmentCenterOnboardingWizard';
import { SavedApplicationsDialog } from '@/components/onboarding/SavedApplicationsDialog';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useSavedApplications } from '@/hooks/useSavedApplications';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Building, Users, Shield, AlertCircle } from 'lucide-react';

const TreatmentCenterOnboardingPage = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [showSavedApplications, setShowSavedApplications] = useState(false);
  const [resumeData, setResumeData] = useState<{
    data: Partial<TreatmentCenterOnboarding>;
    applicationId: string;
  } | null>(null);
  
  const { toast } = useToast();
  const { savedApplications, getMostRecentDraft } = useSavedApplications();

  // Check for existing draft applications on page load
  useEffect(() => {
    const recentDraft = getMostRecentDraft();
    if (recentDraft && !showWizard) {
      toast({
        title: "Draft Application Found",
        description: "You have an incomplete application. Would you like to resume it?",
        action: (
          <Button
            size="sm"
            onClick={() => handleResumeApplication(recentDraft.id)}
          >
            Resume
          </Button>
        ),
      });
    }
  }, [savedApplications]);

  const handleSubmit = async (data: TreatmentCenterOnboarding) => {
    try {
      console.log('Submitting onboarding data:', data);
      
      toast({
        title: "Application Submitted",
        description: "Your treatment center onboarding application has been submitted successfully.",
      });
      
      setShowWizard(false);
      setResumeData(null);
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResumeApplication = (applicationId: string) => {
    const application = savedApplications.find(app => app.id === applicationId);
    if (application) {
      // Convert database format to form format
      const formData: Partial<TreatmentCenterOnboarding> = {
        selected_distributors: application.selected_distributors || [],
        company_info: {
          legal_name: application.legal_name || '',
          dba_name: application.dba_name || '',
          website: application.website || '',
          federal_tax_id: application.federal_tax_id || '',
          legal_address: { street: '', city: '', state: '', zip: '' },
          same_as_legal_address: application.same_as_legal_address || false,
        },
        business_info: {
          business_type: application.business_types || [],
          years_in_business: application.years_in_business || 0,
          ownership_type: application.ownership_type || 'llc',
          state_org_charter_id: application.state_org_charter_id,
          number_of_employees: application.number_of_employees,
          estimated_monthly_purchases: application.estimated_monthly_purchases,
          initial_order_amount: application.initial_order_amount,
        },
        workflow: {
          current_step: application.current_step || 'company_info',
          completed_steps: application.completed_steps || [],
          notes: [],
        },
      };

      setResumeData({ data: formData, applicationId });
      setShowWizard(true);
    }
  };

  const handleStartNew = () => {
    setResumeData(null);
    setShowWizard(true);
  };

  if (showWizard) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <TreatmentCenterOnboardingWizard 
            onSubmit={handleSubmit}
            initialData={resumeData?.data}
            applicationId={resumeData?.applicationId}
          />
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const hasDraftApplications = savedApplications.some(app => app.status === 'draft');

  return (
    <ProtectedRoute>
      <MainLayout>
        <PageContainer
          title="Treatment Center Onboarding"
          subtitle="Streamlined onboarding process for healthcare distributors"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Saved Applications Alert */}
            {hasDraftApplications && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-blue-900">Draft Applications Found</CardTitle>
                  </div>
                  <CardDescription className="text-blue-700">
                    You have incomplete applications that you can resume.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowSavedApplications(true)}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-100"
                  >
                    View Saved Applications
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-6 w-6" />
                  <span>Healthcare Distribution Partnership</span>
                </CardTitle>
                <CardDescription>
                  Complete your onboarding process to establish partnerships with leading healthcare distributors including AmerisourceBergen, Cardinal Health, and McKesson.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-semibold mb-2">Auto-Save Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Your progress is automatically saved as you complete each section
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <Users className="h-12 w-12 mx-auto mb-3 text-green-600" />
                    <h3 className="font-semibold mb-2">Resume Anytime</h3>
                    <p className="text-sm text-muted-foreground">
                      Exit and return to continue where you left off
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-semibold mb-2">Secure Process</h3>
                    <p className="text-sm text-muted-foreground">
                      HIPAA-compliant and secure data handling
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Process Overview</CardTitle>
                <CardDescription>
                  Your application will guide you through the following steps:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { step: 1, title: 'Company Information', description: 'Legal name, addresses, and basic company details' },
                    { step: 2, title: 'Business Classification', description: 'Business type, ownership structure, and operational details' },
                    { step: 3, title: 'Key Contacts', description: 'Primary contacts for different business functions' },
                    { step: 4, title: 'Ownership Structure', description: 'Ownership details and controlling entities' },
                    { step: 5, title: 'Business References', description: 'Banking and supplier references' },
                    { step: 6, title: 'Payment & Banking', description: 'Banking details and payment preferences' },
                    { step: 7, title: 'Licenses & Certifications', description: 'Professional licenses and certifications' },
                    { step: 8, title: 'Required Documents', description: 'Upload supporting documentation' },
                    { step: 9, title: 'Authorizations', description: 'Legal signatures and authorizations' },
                    { step: 10, title: 'Review & Submit', description: 'Final review before submission' }
                  ].map((item) => (
                    <div key={item.step} className="flex space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Before You Begin</CardTitle>
                <CardDescription>
                  Please ensure you have the following information and documents ready:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Legal company name and DBA (if applicable)',
                    'Federal Tax ID number',
                    'Complete business addresses',
                    'Key contact information',
                    'Banking information and voided check',
                    'Business licenses (DEA, State Pharmacy, etc.)',
                    'Financial statements (recent)',
                    'Supplier reference information',
                    'Ownership and control entity details',
                    'Resale tax exemption certificates'
                  ].map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-4">
                <Button onClick={handleStartNew} size="lg" className="px-8">
                  Start New Application
                </Button>
                {savedApplications.length > 0 && (
                  <Button 
                    onClick={() => setShowSavedApplications(true)} 
                    variant="outline" 
                    size="lg" 
                    className="px-8"
                  >
                    View Saved Applications
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                The application process typically takes 15-30 minutes to complete
              </p>
            </div>
          </div>

          {/* Saved Applications Dialog */}
          <SavedApplicationsDialog
            open={showSavedApplications}
            onOpenChange={setShowSavedApplications}
            onResumeApplication={handleResumeApplication}
          />
        </PageContainer>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default TreatmentCenterOnboardingPage;
