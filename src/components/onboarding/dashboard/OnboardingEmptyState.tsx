
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface OnboardingEmptyStateProps {
  onCreateNew: () => void;
}

export const OnboardingEmptyState: React.FC<OnboardingEmptyStateProps> = ({ onCreateNew }) => {
  return (
    <Card>
      <CardContent>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No applications yet</h3>
          <p className="text-muted-foreground mb-4">
            Start your treatment center onboarding process by creating your first application
          </p>
          <Button onClick={onCreateNew} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create First Application</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
