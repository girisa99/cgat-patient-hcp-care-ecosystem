
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TabbedOnboardingWizard } from '@/components/onboarding/TabbedOnboardingWizard';
import { SavedApplicationsDialog } from '@/components/onboarding/SavedApplicationsDialog';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useSavedApplications } from '@/hooks/useSavedApplications';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Building, Users, Shield, AlertCircle, Zap, CheckCircle } from 'lucide-react';

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
          <TabbedOnboardingWizard 
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
          subtitle="Streamlined, collaborative onboarding process for healthcare distributors"
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
                    You have incomplete applications that you can resume or share with collaborators.
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

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <span>New Enhanced Experience</span>
                </CardTitle>
                <CardDescription>
                  Our improved onboarding process is designed for efficiency and collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-semibold mb-2">Organized Tabs</h3>
                    <p className="text-sm text-muted-foreground">
                      Logical grouping of related information for better workflow
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                    <h3 className="font-semibold mb-2">Progress Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Visual progress indicators show completion status at every level
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <Users className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-semibold mb-2">Team Collaboration</h3>
                    <p className="text-sm text-muted-foreground">
                      Share applications with colleagues for joint completion
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                    <h3 className="font-semibold mb-2">Smart Validation</h3>
                    <p className="text-sm text-muted-foreground">
                      Intelligent section status showing what needs attention
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Organized Application Process</CardTitle>
                <CardDescription>
                  Your application is now organized into logical sections for easier completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Basic Information',
                      description: 'Company details, business classification, and key contacts',
                      completion: '25%',
                      steps: ['Company Information', 'Business Classification', 'Key Contacts']
                    },
                    {
                      title: 'Business Details',
                      description: 'Ownership structure and business references',
                      completion: '25%',
                      steps: ['Ownership & Control', 'Business References']
                    },
                    {
                      title: 'Financial & Legal',
                      description: 'Banking information, licenses, and documentation',
                      completion: '30%',
                      steps: ['Payment & Banking', 'Licenses & Certifications', 'Required Documents']
                    },
                    {
                      title: 'Finalization',
                      description: 'Review, signatures, and final submission',
                      completion: '20%',
                      steps: ['Authorizations & Signatures', 'Review & Submit']
                    }
                  ].map((section, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          <Badge variant="outline">{section.completion} weight</Badge>
                        </div>
                        <CardDescription className="text-sm">{section.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="text-sm space-y-1">
                          {section.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Collaboration Features */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Collaborative Features</CardTitle>
                <CardDescription className="text-green-700">
                  Work together with your team to complete the application efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium text-green-900">Share Applications</h4>
                    <p className="text-sm text-green-700">Invite colleagues to contribute to specific sections</p>
                  </div>
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium text-green-900">Real-time Sync</h4>
                    <p className="text-sm text-green-700">All changes are automatically saved and synchronized</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium text-green-900">Smart Status</h4>
                    <p className="text-sm text-green-700">Clear indicators show what's complete, incomplete, or needs review</p>
                  </div>
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
                The enhanced application process is designed for team collaboration and efficiency
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
