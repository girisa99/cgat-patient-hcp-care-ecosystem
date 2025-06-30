
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Workflow, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Settings,
  UserCheck,
  Building
} from 'lucide-react';

interface OnboardingApiRequirement {
  id: string;
  facilityName: string;
  apiType: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  submittedAt: string;
  requirements: string[];
}

export const OnboardingIntegrationTabContent: React.FC = () => {
  console.log('🚀 OnboardingIntegrationTabContent: Component rendering');
  
  const [requirements] = useState<OnboardingApiRequirement[]>([
    {
      id: '1',
      facilityName: 'Central Medical Center',
      apiType: 'EMR Integration',
      description: 'Integration with Epic EMR system for patient data synchronization',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      requirements: ['Patient data access', 'Appointment scheduling', 'Medical records']
    },
    {
      id: '2',
      facilityName: 'Riverside Pharmacy',
      apiType: 'Pharmacy API',
      description: 'Connect to pharmacy system for prescription management',
      status: 'in_progress',
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      requirements: ['Prescription lookup', 'Inventory check', 'Order processing']
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleProcessRequirement = (requirementId: string) => {
    console.log('🔄 Processing onboarding API requirement:', requirementId);
    // Implementation would process the API requirement
  };

  const handleViewDetails = (requirementId: string) => {
    console.log('👁️ Viewing details for requirement:', requirementId);
    // Implementation would show detailed view
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Onboarding API Integration</h3>
          <p className="text-sm text-muted-foreground">
            Process API requirements submitted during facility onboarding
          </p>
        </div>
        <Badge variant="outline">{requirements.length} Requirements</Badge>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'in_progress').length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'failed').length}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requirements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            API Requirements from Onboarding
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.length > 0 ? (
            <div className="space-y-4">
              {requirements.map((requirement) => (
                <div key={requirement.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium">{requirement.facilityName}</h4>
                        <Badge variant={getStatusColor(requirement.status) as any}>
                          {getStatusIcon(requirement.status)}
                          <span className="ml-1 capitalize">{requirement.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          API Type: {requirement.apiType}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {requirement.description}
                        </p>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                        <div className="flex flex-wrap gap-1">
                          {requirement.requirements.map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(requirement.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(requirement.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      {requirement.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => handleProcessRequirement(requirement.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Requirements</h3>
              <p className="text-muted-foreground">
                API requirements from facility onboarding will appear here for processing.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
