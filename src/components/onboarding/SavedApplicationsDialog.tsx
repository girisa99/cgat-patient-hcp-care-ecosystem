
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSavedApplications } from '@/hooks/useSavedApplications';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface SavedApplicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResumeApplication: (applicationId: string) => void;
}

export const SavedApplicationsDialog: React.FC<SavedApplicationsDialogProps> = ({
  open,
  onOpenChange,
  onResumeApplication,
}) => {
  const { savedApplications, isLoading } = useSavedApplications();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'submitted': return 'bg-blue-500';
      case 'under_review': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Applications...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Onboarding Applications</DialogTitle>
          <DialogDescription>
            Resume a draft application or view the status of submitted applications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {savedApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">No saved applications found</p>
            </div>
          ) : (
            savedApplications.map((application) => (
              <Card key={application.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(application.status)}
                      <CardTitle className="text-lg">
                        {application.legal_name || `Application ${application.id.slice(0, 8)}`}
                      </CardTitle>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>
                    Last updated {formatDistanceToNow(new Date(application.updated_at))} ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Current Step: <span className="font-medium capitalize">
                          {application.current_step?.replace('_', ' ') || 'Company Info'}
                        </span>
                      </p>
                      {application.selected_distributors && application.selected_distributors.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Distributors: {application.selected_distributors.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {application.status === 'draft' && (
                        <Button
                          onClick={() => {
                            onResumeApplication(application.id);
                            onOpenChange(false);
                          }}
                          size="sm"
                        >
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement view details
                          console.log('View application details:', application.id);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
