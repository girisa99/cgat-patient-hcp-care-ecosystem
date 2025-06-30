
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { TreatmentCenterOnboardingWizard } from '@/components/onboarding/TreatmentCenterOnboardingWizard';
import { useTreatmentCenterOnboarding } from '@/hooks/useTreatmentCenterOnboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OnboardingDashboard: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
  const { onboardingApplications, isLoading, createApplication, updateApplication } = useTreatmentCenterOnboarding();
  const { toast } = useToast();

  const handleCreateNew = () => {
    setEditingApplicationId(null);
    setView('wizard');
  };

  const handleEditApplication = (applicationId: string) => {
    setEditingApplicationId(applicationId);
    setView('wizard');
  };

  const handleWizardSubmit = async (data: any) => {
    try {
      if (editingApplicationId) {
        // Fix: Pass an object with id and updates properties
        await updateApplication({ id: editingApplicationId, updates: data });
        toast({
          title: "Application Updated",
          description: "Your onboarding application has been updated successfully.",
        });
      } else {
        await createApplication(data);
        toast({
          title: "Application Created",
          description: "Your onboarding application has been created successfully.",
        });
      }
      setView('dashboard');
      setEditingApplicationId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setEditingApplicationId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'under_review': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Onboarding Dashboard"
          subtitle="Manage treatment center onboarding workflow"
        >
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading onboarding data...</p>
            </div>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  if (view === 'wizard') {
    const existingApplication = editingApplicationId 
      ? onboardingApplications?.find(app => app.id === editingApplicationId)
      : null;

    // Fix: Transform the database data to match the TypeScript interface
    const transformedApplication = existingApplication ? {
      ...existingApplication,
      // Handle operational_hours type conversion
      operational_hours: typeof existingApplication.operational_hours === 'string' 
        ? JSON.parse(existingApplication.operational_hours) 
        : existingApplication.operational_hours,
      // Handle other potential Json type fields that might need conversion
      gpo_memberships: Array.isArray(existingApplication.gpo_memberships) 
        ? existingApplication.gpo_memberships 
        : existingApplication.gpo_memberships ? [existingApplication.gpo_memberships] : [],
      preferred_payment_methods: Array.isArray(existingApplication.preferred_payment_methods)
        ? existingApplication.preferred_payment_methods
        : existingApplication.preferred_payment_methods ? [existingApplication.preferred_payment_methods] : [],
      selected_distributors: Array.isArray(existingApplication.selected_distributors)
        ? existingApplication.selected_distributors
        : existingApplication.selected_distributors ? [existingApplication.selected_distributors] : [],
      business_types: Array.isArray(existingApplication.business_types)
        ? existingApplication.business_types
        : existingApplication.business_types ? [existingApplication.business_types] : []
    } : null;

    return (
      <MainLayout>
        <PageContainer
          title={editingApplicationId ? "Edit Onboarding Application" : "Create New Onboarding Application"}
          subtitle="Complete your treatment center onboarding process"
          headerActions={
            <Button variant="outline" onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          }
        >
          <TreatmentCenterOnboardingWizard 
            onSubmit={handleWizardSubmit}
            initialData={transformedApplication}
            isEditing={!!editingApplicationId}
          />
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Onboarding Dashboard"
        subtitle="Manage treatment center onboarding workflow and applications"
        headerActions={
          <Button onClick={handleCreateNew} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Application</span>
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
                <div className="text-2xl font-bold">{onboardingApplications?.length || 0}</div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
                <div className="text-2xl font-bold">
                  {onboardingApplications?.filter(app => app.status === 'draft').length || 0}
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
                <div className="text-2xl font-bold">
                  {onboardingApplications?.filter(app => app.status === 'under_review').length || 0}
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                <div className="text-2xl font-bold">
                  {onboardingApplications?.filter(app => app.status === 'approved').length || 0}
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>
                View and manage your onboarding applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {onboardingApplications && onboardingApplications.length > 0 ? (
                <div className="space-y-4">
                  {onboardingApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(application.status)}
                          <div>
                            <h3 className="font-medium">
                              {application.legal_name || 'Untitled Application'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(application.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          Step {application.current_step?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditApplication(application.id)}
                        >
                          {application.status === 'draft' ? 'Continue' : 'View'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your treatment center onboarding process by creating your first application
                  </p>
                  <Button onClick={handleCreateNew} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create First Application</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default OnboardingDashboard;
