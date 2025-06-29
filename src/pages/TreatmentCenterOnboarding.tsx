
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TreatmentCenterOnboardingWizard } from '@/components/onboarding/TreatmentCenterOnboardingWizard';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Building, Users, Shield } from 'lucide-react';

const TreatmentCenterOnboardingPage = () => {
  const [showWizard, setShowWizard] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: TreatmentCenterOnboarding) => {
    try {
      console.log('Submitting onboarding data:', data);
      
      // Here you would typically send the data to your backend
      // For now, we'll just show a success message
      toast({
        title: "Application Submitted",
        description: "Your treatment center onboarding application has been submitted successfully.",
      });
      
      setShowWizard(false);
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showWizard) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <TreatmentCenterOnboardingWizard onSubmit={handleSubmit} />
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <PageContainer
          title="Treatment Center Onboarding"
          subtitle="Streamlined onboarding process for healthcare distributors"
        >
          <div className="max-w-4xl mx-auto space-y-8">
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
                    <h3 className="font-semibold mb-2">Comprehensive Forms</h3>
                    <p className="text-sm text-muted-foreground">
                      Single application process covering all distributor requirements
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <Users className="h-12 w-12 mx-auto mb-3 text-green-600" />
                    <h3 className="font-semibold mb-2">Multi-Distributor</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply to multiple distributors simultaneously
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

            {/* Start Application */}
            <div className="text-center">
              <Button onClick={() => setShowWizard(true)} size="lg" className="px-8">
                Start Onboarding Application
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                The application process typically takes 15-30 minutes to complete
              </p>
            </div>
          </div>
        </PageContainer>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default TreatmentCenterOnboardingPage;
