
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface OnboardingWorkflow {
  id: string;
  name: string;
  email?: string;
  status?: string;
  created_at: string;
  is_active?: boolean;
}

interface OnboardingWorkflowsListProps {
  workflows: OnboardingWorkflow[];
  onEditWorkflow: (workflow: OnboardingWorkflow) => void;
}

const OnboardingWorkflowsList: React.FC<OnboardingWorkflowsListProps> = ({ workflows, onEditWorkflow }) => {
  if (workflows.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No onboarding workflows found.</p>
      </div>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {workflows.map((workflow) => (
        <div key={workflow.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-lg">{workflow.name}</h3>
                <div className="flex items-center gap-1">
                  {getStatusIcon(workflow.status)}
                  <Badge variant={getStatusVariant(workflow.status)}>
                    {workflow.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
              
              {workflow.email && (
                <div className="mt-2 text-sm text-gray-600">
                  {workflow.email}
                </div>
              )}
              
              <div className="mt-2 text-xs text-gray-500">
                Created: {new Date(workflow.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditWorkflow(workflow)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OnboardingWorkflowsList;
