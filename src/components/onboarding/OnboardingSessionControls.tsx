import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, LogOut, RotateCcw, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OnboardingSessionControlsProps {
  applicationId?: string | null;
  currentStep?: string;
  lastSaved?: string;
  onSave: () => void;
  onExit: () => void;
  isSaving?: boolean;
}

export const OnboardingSessionControls: React.FC<OnboardingSessionControlsProps> = ({
  applicationId,
  currentStep,
  lastSaved,
  onSave,
  onExit,
  isSaving = false,
}) => {
  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border">
      {applicationId && (
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Draft</Badge>
            <span className="text-sm text-muted-foreground">
              Current step: {currentStep?.replace('_', ' ').toUpperCase() || 'Company Info'}
            </span>
          </div>
          {lastSaved && (
            <p className="text-xs text-muted-foreground mt-1">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </p>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Progress'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit
        </Button>
      </div>
    </div>
  );
};

interface SavedApplication {
  id: string;
  legal_name?: string;
  dba_name?: string;
  status: string;
  workflow?: {
    current_step: string;
    completed_steps: string[];
  };
  updated_at: string;
  created_at: string;
}

interface SavedApplicationsListProps {
  applications: SavedApplication[];
  onSelectApplication: (application: SavedApplication) => void;
  onDeleteApplication: (applicationId: string) => void;
}

export const SavedApplicationsList: React.FC<SavedApplicationsListProps> = ({
  applications,
  onSelectApplication,
  onDeleteApplication,
}) => {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No saved applications found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue Previous Applications</CardTitle>
        <CardDescription>Pick up where you left off</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {applications.map((application) => (
            <div
              key={application.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => onSelectApplication(application)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">
                    {application.legal_name || application.dba_name || 'Unnamed Application'}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {application.workflow?.current_step?.replace('_', ' ') || 'Company Info'}
                  </Badge>
                  <Badge 
                    variant={application.status === 'submitted' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {application.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(application.updated_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Progress: {application.workflow?.completed_steps?.length || 0} steps completed
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectApplication(application);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
                      onDeleteApplication(application.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};