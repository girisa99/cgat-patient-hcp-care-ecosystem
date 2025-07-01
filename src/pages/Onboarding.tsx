
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  Building2,
  Settings
} from 'lucide-react';

const Onboarding: React.FC = () => {
  // Mock data for demonstration
  const onboardingStats = {
    total: 12,
    pending: 5,
    inProgress: 4,
    completed: 3,
    requiresAttention: 2
  };

  const recentApplications = [
    {
      id: '1',
      facilityName: 'City Hospital',
      status: 'pending',
      submittedDate: '2024-01-15',
      contactName: 'Dr. Smith'
    },
    {
      id: '2',
      facilityName: 'Regional Medical Center',
      status: 'in_progress',
      submittedDate: '2024-01-12',
      contactName: 'Jane Johnson'
    },
    {
      id: '3',
      facilityName: 'Community Clinic',
      status: 'completed',
      submittedDate: '2024-01-10',
      contactName: 'Mike Davis'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <FileText className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in_progress':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  return (
    <MainLayout>
      <PageContainer
        title="Onboarding Management"
        subtitle="Manage treatment center onboarding applications and workflow"
        headerActions={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardingStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All time applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardingStats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardingStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  Currently processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardingStats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully onboarded
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(application.status)}
                        <div>
                          <h3 className="font-medium">{application.facilityName}</h3>
                          <p className="text-sm text-gray-600">
                            Contact: {application.contactName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Submitted: {application.submittedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={getStatusBadge(application.status)}>
                          {application.status.replace('_', ' ')}
                        </span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <UserPlus className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Start New Application</h3>
                <p className="text-sm text-gray-600">Begin onboarding a new treatment center</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Review Applications</h3>
                <p className="text-sm text-gray-600">Review and approve pending applications</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-medium mb-2">Manage Workflow</h3>
                <p className="text-sm text-gray-600">Configure onboarding workflow steps</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Onboarding;
