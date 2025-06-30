
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface OnboardingApplicationsListProps {
  applications: any[];
  onEditApplication: (applicationId: string) => void;
}

export const OnboardingApplicationsList: React.FC<OnboardingApplicationsListProps> = ({
  applications,
  onEditApplication,
}) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Applications</CardTitle>
        <CardDescription>
          View and manage your onboarding applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((application) => (
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
                  onClick={() => onEditApplication(application.id)}
                >
                  {application.status === 'draft' ? 'Continue' : 'View'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
