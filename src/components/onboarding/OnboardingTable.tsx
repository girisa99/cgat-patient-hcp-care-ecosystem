/**
 * TREATMENT CENTER ONBOARDING TABLE
 * Shows one row per treatment center with progress tracking
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Edit, 
  Eye, 
  FileText, 
  Calendar,
  Building,
  Play,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OnboardingTableProps {
  applications: any[];
  isLoading: boolean;
  onEdit: (id: string) => void;
}

export const OnboardingTable: React.FC<OnboardingTableProps> = ({
  applications,
  isLoading,
  onEdit
}) => {
  // Helper function to get step progress
  const getStepProgress = (currentStep: string) => {
    const steps = [
      'company_info', 'business_classification', 'contacts', 'ownership',
      'references', 'payment_banking', 'licenses', 'documents', 
      'authorizations', 'review'
    ];
    const currentIndex = steps.indexOf(currentStep);
    return Math.round(((currentIndex + 1) / steps.length) * 100);
  };

  // Helper function to get readable step name
  const getStepName = (step: string) => {
    const stepNames: Record<string, string> = {
      'company_info': 'Company Information',
      'business_classification': 'Business Classification', 
      'contacts': 'Contacts',
      'ownership': 'Ownership',
      'references': 'References',
      'payment_banking': 'Payment & Banking',
      'licenses': 'Licenses',
      'documents': 'Documents',
      'authorizations': 'Authorizations',
      'review': 'Final Review'
    };
    return stepNames[step] || step.replace('_', ' ').toUpperCase();
  };

  // Filter out empty applications
  const validApplications = applications.filter(app => 
    app.legal_name || app.dba_name
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (validApplications.length === 0) {
    return (
      <div className="text-center py-8">
        <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Treatment Centers</h3>
        <p className="text-gray-500">Start your first treatment center onboarding application.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
        <div className="col-span-3">Treatment Center</div>
        <div className="col-span-2">Current Step</div>
        <div className="col-span-2">Progress</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Last Updated</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Table Rows */}
      {validApplications.map((application) => {
        const progress = getStepProgress(application.current_step || 'company_info');
        const stepName = getStepName(application.current_step || 'company_info');
        
        return (
          <div key={application.id} className="grid grid-cols-12 gap-4 py-4 px-4 border rounded-lg hover:bg-gray-50 transition-colors">
            {/* Treatment Center Name */}
            <div className="col-span-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {application.legal_name || application.dba_name || 'Unnamed Center'}
                  </p>
                  {application.dba_name && application.legal_name && (
                    <p className="text-xs text-gray-500">DBA: {application.dba_name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Step */}
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="text-sm text-gray-600">{stepName}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="col-span-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Step {Math.ceil(progress/10)} of 10</span>
                  <span className="text-gray-700">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <Badge 
                variant={
                  application.status === 'approved' ? 'default' :
                  application.status === 'submitted' ? 'secondary' :
                  application.status === 'under_review' ? 'outline' :
                  application.status === 'rejected' ? 'destructive' :
                  'secondary'
                }
                className="capitalize"
              >
                {application.status === 'draft' ? 'In Progress' : application.status.replace('_', ' ')}
              </Badge>
            </div>

            {/* Last Updated */}
            <div className="col-span-2">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(application.updated_at), { addSuffix: true })}
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1">
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(application.id)}
                  className="h-8 w-8 p-0"
                  title={application.status === 'draft' ? 'Continue Application' : 'Edit Application'}
                >
                  {application.status === 'draft' ? (
                    <Play className="h-3 w-3" />
                  ) : (
                    <Edit className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};