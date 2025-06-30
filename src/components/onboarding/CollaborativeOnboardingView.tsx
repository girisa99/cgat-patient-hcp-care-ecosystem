
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabbedOnboardingWizard } from './TabbedOnboardingWizard';
import { useTreatmentCenterOnboarding } from '@/hooks/useTreatmentCenterOnboarding';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Users, AlertCircle } from 'lucide-react';

export const CollaborativeOnboardingView: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [applicationData, setApplicationData] = useState(null);
  const { onboardingApplications, isLoading } = useTreatmentCenterOnboarding();
  const { toast } = useToast();

  useEffect(() => {
    if (applicationId && onboardingApplications) {
      const app = onboardingApplications.find(a => a.id === applicationId);
      if (app) {
        setApplicationData(app);
      }
    }
  }, [applicationId, onboardingApplications]);

  const handleSubmit = (data: any) => {
    toast({
      title: "Changes Saved",
      description: "Your contributions to the application have been saved successfully.",
    });
    setViewMode('view');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading application...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
            <p className="text-muted-foreground">
              The application you're looking for doesn't exist or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === 'view') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Collaboration Header */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Treatment Center Onboarding - Collaborative View</span>
            </CardTitle>
            <CardDescription>
              You've been invited to collaborate on this onboarding application. 
              You can review the current progress and contribute to incomplete sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  Application #{applicationId?.slice(0, 8)}
                </Badge>
                <Badge variant={applicationData.status === 'draft' ? 'secondary' : 'default'}>
                  {applicationData.status}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('view')}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Only</span>
                </Button>
                <Button
                  onClick={() => setViewMode('edit')}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Contribute</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Read-only view of the application */}
        <TabbedOnboardingWizard
          onSubmit={handleSubmit}
          initialData={applicationData}
          applicationId={applicationId}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <TabbedOnboardingWizard
        onSubmit={handleSubmit}
        initialData={applicationData}
        applicationId={applicationId}
      />
    </div>
  );
};
