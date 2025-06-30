
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { EnhancedOnboardingWizard } from '@/components/onboarding/EnhancedOnboardingWizard';
import { SavedApplicationsDialog } from '@/components/onboarding/SavedApplicationsDialog';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useSavedApplications } from '@/hooks/useSavedApplications';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Building, 
  Users, 
  Shield, 
  AlertCircle, 
  Zap, 
  CheckCircle, 
  Sparkles,
  Star,
  Award
} from 'lucide-react';

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
          <EnhancedOnboardingWizard 
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
          subtitle="Join our healthcare network with our streamlined, intelligent onboarding experience"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section */}
            <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200 to-blue-200 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
              
              <CardHeader className="pb-8 relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                      New Enhanced Experience
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-700">
                      Redesigned for efficiency, collaboration, and user experience
                    </CardDescription>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  {[
                    {
                      icon: Award,
                      title: "Smart Organization",
                      description: "Logically grouped sections for intuitive workflow",
                      color: "blue"
                    },
                    {
                      icon: Star,
                      title: "Visual Progress",
                      description: "Clear indicators at every level of completion",
                      color: "purple"
                    },
                    {
                      icon: Users,
                      title: "Team Collaboration",
                      description: "Share and complete applications together",
                      color: "green"
                    },
                    {
                      icon: Shield,
                      title: "Smart Validation",
                      description: "Intelligent status tracking and guidance",
                      color: "orange"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="text-center p-6 bg-white/60 backdrop-blur rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300">
                      <div className={`inline-flex p-3 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 rounded-xl mb-4`}>
                        <feature.icon className={`h-6 w-6 text-${feature.color}-700`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Saved Applications Alert */}
            {hasDraftApplications && (
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-900">Continue Your Progress</CardTitle>
                      <CardDescription className="text-blue-700">
                        You have saved applications ready to complete
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowSavedApplications(true)}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    View Saved Applications
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Process Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Streamlined Application Journey</CardTitle>
                <CardDescription className="text-lg">
                  Our improved process groups related information for a smoother experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Company Foundation',
                      description: 'Essential company details and business structure',
                      icon: Building,
                      color: 'blue',
                      weight: '25%',
                      steps: ['Company Information', 'Business Classification', 'Key Contacts']
                    },
                    {
                      title: 'Business Structure',
                      description: 'Ownership details and business relationships',
                      icon: Users,
                      color: 'green',
                      weight: '20%',
                      steps: ['Ownership & Control', 'Business References']
                    },
                    {
                      title: 'Services & Therapies',
                      description: 'CGAT therapy and service provider selection',
                      icon: Sparkles,
                      color: 'purple',
                      weight: '15%',
                      steps: ['CGAT Therapy Selection', 'Service Provider Selection']
                    },
                    {
                      title: 'Operations & Assessment',
                      description: 'Purchasing preferences and financial evaluation',
                      icon: Zap,
                      color: 'orange',
                      weight: '20%',
                      steps: ['Purchasing Preferences', 'Financial Assessment']
                    },
                    {
                      title: 'Financial & Legal',
                      description: 'Banking, licenses, and compliance documentation',
                      icon: Shield,
                      color: 'cyan',
                      weight: '15%',
                      steps: ['Payment & Banking', 'Licenses', 'Documents']
                    },
                    {
                      title: 'Review & Submit',
                      description: 'Final review, signatures, and submission',
                      icon: CheckCircle,
                      color: 'emerald',
                      weight: '5%',
                      steps: ['Authorizations', 'Final Review']
                    }
                  ].map((section, index) => (
                    <Card key={index} className={`border-l-4 border-l-${section.color}-400 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-${section.color}-50/30 to-white`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 bg-${section.color}-100 rounded-lg`}>
                            <section.icon className={`h-5 w-5 text-${section.color}-700`} />
                          </div>
                          <Badge variant="outline" className={`border-${section.color}-300 text-${section.color}-700`}>
                            {section.weight}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription className="text-sm">{section.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-2">
                          {section.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-center space-x-2 text-sm">
                              <div className={`w-1.5 h-1.5 bg-${section.color}-500 rounded-full`}></div>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Section */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-green-900">Ready to Get Started?</CardTitle>
                <CardDescription className="text-lg text-green-700">
                  Join our healthcare network with confidence
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="flex justify-center space-x-6">
                  <Button 
                    onClick={handleStartNew} 
                    size="lg" 
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start New Application
                  </Button>
                  {savedApplications.length > 0 && (
                    <Button 
                      onClick={() => setShowSavedApplications(true)} 
                      variant="outline" 
                      size="lg" 
                      className="px-8 py-4 border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Continue Saved Application
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center p-4">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium text-green-900">Auto-Save</h4>
                    <p className="text-sm text-green-700">Never lose your progress</p>
                  </div>
                  <div className="text-center p-4">
                    <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium text-green-900">Collaborate</h4>
                    <p className="text-sm text-green-700">Work with your team</p>
                  </div>
                  <div className="text-center p-4">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium text-green-900">Secure</h4>
                    <p className="text-sm text-green-700">Enterprise-grade security</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
