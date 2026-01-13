import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, CheckCircle, XCircle, AlertTriangle, Clock, 
  FileText, Eye, Send, RefreshCw, Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface LegalReview {
  id: string;
  content_id: string;
  content_type: string;
  status: string;
  compliance_score: number;
  flagged_issues: string[];
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

export const LegalReviewGate: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<LegalReview | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const { data: pendingReviews, isLoading: loadingPending } = useQuery({
    queryKey: ['legal-reviews', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('legal-review-gate', {
        body: { action: 'get_pending' }
      });
      if (error) throw error;
      return data.pending_reviews as LegalReview[];
    }
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async (params: { content_id: string; content_type: string; content_data: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('legal-review-gate', {
        body: { action: 'submit', ...params }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['legal-reviews'] });
      if (data.status === 'auto_approved') {
        toast.success('Content auto-approved! Compliance score: ' + data.compliance_score);
      } else {
        toast.info('Submitted for review. Estimated time: ' + data.estimated_review_time + ' hours');
      }
    },
    onError: (error) => {
      toast.error('Failed to submit: ' + (error as Error).message);
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const { data, error } = await supabase.functions.invoke('legal-review-gate', {
        body: { action: 'approve', content_id: contentId, review_notes: reviewNotes }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-reviews'] });
      toast.success('Content approved successfully');
      setSelectedReview(null);
      setReviewNotes('');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (params: { contentId: string; flags: string[] }) => {
      const { data, error } = await supabase.functions.invoke('legal-review-gate', {
        body: { 
          action: 'reject', 
          content_id: params.contentId, 
          review_notes: reviewNotes,
          compliance_flags: params.flags 
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-reviews'] });
      toast.info('Content rejected');
      setSelectedReview(null);
      setReviewNotes('');
    }
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      auto_approved: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
      changes_requested: { variant: 'outline', icon: <AlertTriangle className="h-3 w-3 mr-1" /> }
    };
    const style = styles[status] || styles.pending;
    return (
      <Badge variant={style.variant} className="flex items-center">
        {style.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Legal Review Gate</h2>
            <p className="text-muted-foreground">Compliance screening and approval workflow</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['legal-reviews'] })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews?.filter(r => r.status === 'pending').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Auto-Approved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingReviews?.filter(r => r.status === 'changes_requested').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Review Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Review Queue
            </CardTitle>
            <CardDescription>Content awaiting legal review</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="changes">Changes Requested</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <ScrollArea className="h-[400px]">
                  {loadingPending ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : pendingReviews?.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No pending reviews</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingReviews?.map((review) => (
                        <div
                          key={review.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedReview?.id === review.id ? 'border-primary bg-muted/30' : ''
                          }`}
                          onClick={() => setSelectedReview(review)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{review.content_type}</span>
                            {getStatusBadge(review.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>ID: {review.content_id.slice(0, 8)}...</span>
                            <span className={getComplianceColor(review.compliance_score)}>
                              Score: {review.compliance_score}%
                            </span>
                            <span>{new Date(review.submitted_at).toLocaleDateString()}</span>
                          </div>
                          {review.flagged_issues?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {review.flagged_issues.slice(0, 2).map((issue, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {issue.slice(0, 30)}...
                                </Badge>
                              ))}
                              {review.flagged_issues.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{review.flagged_issues.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="changes">
                <div className="text-center text-muted-foreground py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No items requiring changes</p>
                </div>
              </TabsContent>

              <TabsContent value="completed">
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>View completed reviews in history</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Review Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReview ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Content Type</label>
                  <p className="text-sm text-muted-foreground capitalize">{selectedReview.content_type}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Compliance Score</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedReview.compliance_score} className="flex-1" />
                    <span className={`text-sm font-medium ${getComplianceColor(selectedReview.compliance_score)}`}>
                      {selectedReview.compliance_score}%
                    </span>
                  </div>
                </div>

                {selectedReview.flagged_issues?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Flagged Issues</label>
                    <ul className="mt-1 space-y-1">
                      {selectedReview.flagged_issues.map((issue, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Review Notes</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes for this review..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => approveMutation.mutate(selectedReview.content_id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => rejectMutation.mutate({ 
                      contentId: selectedReview.content_id, 
                      flags: selectedReview.flagged_issues 
                    })}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a review to see details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LegalReviewGate;
