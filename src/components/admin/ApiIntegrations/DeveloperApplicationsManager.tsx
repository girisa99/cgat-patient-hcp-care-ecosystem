
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  Calendar,
  Building,
  Globe,
  Smartphone,
  Server,
  Zap
} from 'lucide-react';
import { useExternalApis } from '@/hooks/useExternalApis';
import { DeveloperPortalApplication } from '@/utils/api/ExternalApiManager';

const DeveloperApplicationsManager = () => {
  const { 
    developerApplications, 
    publishedApis,
    reviewApplication, 
    isReviewingApplication,
    marketplaceStats
  } = useExternalApis();

  const [selectedApplication, setSelectedApplication] = useState<DeveloperPortalApplication | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const pendingApplications = developerApplications.filter(app => app.status === 'pending');
  const approvedApplications = developerApplications.filter(app => app.status === 'approved');
  const rejectedApplications = developerApplications.filter(app => app.status === 'rejected');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'suspended': return 'bg-orange-500';
      default: return 'bg-yellow-500';
    }
  };

  const getAppTypeIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'web': return <Globe className="h-4 w-4" />;
      case 'server': return <Server className="h-4 w-4" />;
      case 'integration': return <Zap className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const handleReview = (application: DeveloperPortalApplication) => {
    setSelectedApplication(application);
    setShowReviewDialog(true);
  };

  const handleApprove = () => {
    if (!selectedApplication) return;
    
    reviewApplication({
      applicationId: selectedApplication.id,
      decision: 'approved',
      notes: reviewNotes
    });

    setShowReviewDialog(false);
    setSelectedApplication(null);
    setReviewNotes('');
  };

  const handleReject = () => {
    if (!selectedApplication) return;
    
    reviewApplication({
      applicationId: selectedApplication.id,
      decision: 'rejected',
      notes: reviewNotes
    });

    setShowReviewDialog(false);
    setSelectedApplication(null);
    setReviewNotes('');
  };

  const getRequestedApiNames = (requestedApis: string[]) => {
    return requestedApis.map(apiId => {
      const api = publishedApis.find(a => a.id === apiId);
      return api?.external_name || apiId;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Developer Applications</h3>
          <p className="text-muted-foreground">
            Review and manage developer access requests to your published APIs
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingApplications.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{approvedApplications.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{rejectedApplications.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{developerApplications.length}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Applications ({developerApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-medium mb-2">No Pending Applications</h4>
                <p className="text-muted-foreground">
                  All developer applications have been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApplications.map((application) => (
                <Card key={application.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          {getAppTypeIcon(application.application_type)}
                          <h4 className="font-semibold">{application.application_name}</h4>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                          <Badge variant="outline">{application.application_type}</Badge>
                          <Badge variant="secondary">{application.environment}</Badge>
                        </div>
                        
                        {application.company_name && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="h-3 w-3" />
                            {application.company_name}
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground">
                          {application.description}
                        </p>
                        
                        {application.use_case && (
                          <div className="text-sm">
                            <span className="font-medium">Use Case: </span>
                            {application.use_case}
                          </div>
                        )}
                        
                        {application.requested_apis.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Requested APIs: </span>
                            {getRequestedApiNames(application.requested_apis)}
                          </div>
                        )}
                        
                        {application.requested_scopes.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Requested Scopes: </span>
                            {application.requested_scopes.join(', ')}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Submitted {new Date(application.created_at).toLocaleDateString()}
                          </div>
                          {application.website_url && (
                            <a 
                              href={application.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              View Website
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(application)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4">
            {approvedApplications.map((application) => (
              <Card key={application.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {getAppTypeIcon(application.application_type)}
                        <h4 className="font-semibold">{application.application_name}</h4>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                        <Badge variant="outline">{application.application_type}</Badge>
                      </div>
                      
                      {application.company_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-3 w-3" />
                          {application.company_name}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Approved {application.approved_at ? new Date(application.approved_at).toLocaleDateString() : 'Recently'}
                        </div>
                        {application.website_url && (
                          <a 
                            href={application.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View Website
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {developerApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {getAppTypeIcon(application.application_type)}
                        <h4 className="font-semibold">{application.application_name}</h4>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                        <Badge variant="outline">{application.application_type}</Badge>
                      </div>
                      
                      {application.company_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-3 w-3" />
                          {application.company_name}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                        {application.reviewed_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Reviewed {new Date(application.reviewed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Developer Application</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Application Name</Label>
                  <p className="font-medium">{selectedApplication.application_name}</p>
                </div>
                <div>
                  <Label>Application Type</Label>
                  <p className="font-medium">{selectedApplication.application_type}</p>
                </div>
                <div>
                  <Label>Company</Label>
                  <p className="font-medium">{selectedApplication.company_name || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Environment</Label>
                  <p className="font-medium">{selectedApplication.environment}</p>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedApplication.description}
                </p>
              </div>
              
              {selectedApplication.use_case && (
                <div>
                  <Label>Use Case</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedApplication.use_case}
                  </p>
                </div>
              )}
              
              {selectedApplication.requested_apis.length > 0 && (
                <div>
                  <Label>Requested APIs</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getRequestedApiNames(selectedApplication.requested_apis)}
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="review-notes">Review Notes</Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={isReviewingApplication}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isReviewingApplication}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeveloperApplicationsManager;
